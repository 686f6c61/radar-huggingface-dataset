# AcidHunter/light-sufficiency-predictor

## Resumen

light-sufficiency-predictor es un clasificador binario ligero, publicado en formato GGUF y derivado del modelo base Qwen/Qwen3-0.6B, que estima a partir del texto de entrada la probabilidad de que un resumen generado por un modelo pequeno concreto (Qwen3-0.6B en BF16, con un prompt en ingles de una version especifica de la aplicacion) resulte suficientemente fiel. El modelo no genera resumenes: actua como una sonda de enrutamiento que permite a una aplicacion decidir, antes de sintetizar el resumen, si conviene enviar el texto a un modelo pesado en lugar de arriesgarse con el ligero.

La arquitectura es deliberadamente minimalista: se ejecutan los 8 primeros bloques del transformer de Qwen3-0.6B sobre el prompt completo, se promedian los embeddings por token correspondientes a los tokens del documento (1024 valores) y se aplica una unica transformacion lineal (escalado, PCA de 8 componentes y regresion logistica plegados en una sola matriz) seguida de una calibracion de Platt. El resultado es una probabilidad calibrada de suficiencia, acompanada de un umbral interpolado segun la preferencia de calidad.

El modelo es relevante para desarrolladores que construyen pipelines de sumarizacion con restricciones de coste o latencia y necesitan una senal de riesgo barata y determinista antes de invocar un modelo grande. Su alcance es muy acotado: solo ingles, un unico prompt, un unico modelo ligero y un objetivo de 100 palabras, con un rendimiento discriminativo moderado (AUROC en torno a 0,71 en test).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), truncado a 8 bloques, con pooling medio y cabezal lineal (PCA 8 + regresion logistica + calibracion de Platt) |
| Parametros totales | 281.431.040 (modelo base Qwen3-0.6B); la sonda lineal anadida es un unico vector de 1024 valores mas dos escalares de calibracion |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible explicitamente; los ejemplos de coste cubren entradas de 275 a 2.494 tokens de prompt |
| Tipos de cuantizacion | GGUF BF16 (derivado de unsloth/Qwen3-0.6B-GGUF/Qwen3-0.6B-BF16.gguf); no se documentan otras cuantizaciones |
| Idiomas soportados | ingles unicamente (los textos traducidos automaticamente no estan cubiertos) |
| Licencia | Apache-2.0 declarada en la cabecera, heredada del modelo base Qwen3-0.6B; el autor indica que no esta confirmada para el paquete completo (ver notas de licencia) |
| Formato de pesos | GGUF (modelo) y JSON (probe.json con w, b, A, B; export.json con la receta exacta) |

## Arquitectura y entrenamiento

El modelo reutiliza los 8 primeros bloques del transformer de Qwen3-0.6B, ejecutados mediante llama.cpp con pooling NONE, de modo que la salida incluye la normalizacion final (output_norm) del bloque 8. Sobre el prompt de la aplicacion se identifican los tokens del documento mediante rangos de bytes UTF-8: el prefijo `<|im_start|>user\n<document>\n` define el inicio del documento, y se incluye el token que fusiona el ultimo caracter del documento con el salto de linea posterior. Los embeddings por token del documento se promedian en un vector float32 de 1024 dimensiones.

La cabeza predictiva es una unica transformacion lineal `z = w.x + b` que pliega escalado, PCA de 8 componentes y regresion logistica (C = 0,1); la probabilidad final es `p_sufficient = sigmoid(A * z + B)`, calibracion de Platt ajustada sobre 206 textos de validacion. El entrenamiento de la sonda se realizo sobre 616 textos, con textos de CNN/DailyMail, DialogSum, PubMed summarization y GovReport. La etiqueta positiva (suficiente) se asigna cuando el resumen ligero supera las comprobaciones tecnicas sin el flag `too_long` y un juez Gemma 3 12B (4 bits, MLX) otorga fidelidad >= 4. El bloque `routing` de export.json interpola linealmente el umbral sobre los puntos de preferencia [[0,0, 0,5], [0,5, 0,8], [1,0, 0,95]]. Se verifico paridad numerica entre la implementacion GGUF y la sonda Python con una diferencia maxima absoluta de 4,19e-07.

## Capacidades

- Prediccion de probabilidad de suficiencia de un resumen antes de generarlo, a partir solo del texto de entrada.
- Clasificacion binaria con salida calibrada (`p_sufficient` y `p_insufficient`).
- Enrutamiento condicional: recomendar el modelo ligero o el pesado segun un umbral configurable por preferencia de calidad.
- Bloque de recomendacion (`advice`, modo `none_with_prediction`): con prediccion, no sugiere el modelo pesado; sin prediccion, decide el asesor de longitud de la aplicacion.
- Inferencia determinista y reproducible mediante llama.cpp, sin dependencia del tokenizer de HuggingFace ni de sklearn.
- No soporta tool calling, function calling, agentes, vision, audio ni generacion de texto.
- Multilingue: no; solo ingles.

## Casos de uso

- Enrutamiento de coste en pipelines de sumarizacion: antes de invocar un modelo pesado, la aplicacion calcula `p_sufficient` con la sonda (una pasada de 8 bloques y un producto escalar) y solo escala al modelo grande cuando la probabilidad cae por debajo del umbral, reduciendo el coste medio por documento.
- Control de latencia en servicios interactivos: con entradas de 275 tokens la pasada de embeddings tarda 0,072 s en Metal, frente a 0,97 s del resumen completo, por lo que la sonda anade una fraccion pequena al tiempo de respuesta y permite decidir en milisegundos.
- Monitorizacion de calidad en produccion: registrar la distribucion de `p_sufficient` por dominio para detectar desplazamientos en la dificultad de los textos y ajustar el umbral operativo.
- Filtrado previo en lotes de documentos largos: en entradas de 2.494 tokens la pasada tarda 0,742 s, lo que permite clasificar lotes antes de gastar computo en resumenes que probablemente fallaran.
- Investigacion sobre enrutamiento entre modelos: usar la sonda como linea base ligera y comparable frente a sondas sobre estados ocultos de HuggingFace en experimentos de cascada.
- Seleccion de politica por preferencia de calidad: la interpolacion del umbral entre 0,5 y 0,95 permite configurar el equilibrio entre coste y fidelidad sin reentrenar el modelo.
- Auditoria de riesgo responsable: emplear la senal de insuficiencia como indicador adicional, junto a otras senales, en la revision de resumenes automaticos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (el model-index no contiene resultados adicionales):

| Split | n | Insuficientes | AUROC | AP insuficiente | Brier | ECE |
|---|---:|---:|---|---|---|---|
| Validacion | 206 | 30 | 0,710 [0,597, 0,816] | 0,410 [0,250, 0,581] | n/a | n/a |
| Test | 151 | 33 | 0,714 [0,611, 0,814] | 0,490 [0,332, 0,648] | 0,155 [0,118, 0,197] | 0,057 [0,035, 0,134] |

Intervalos del 95 % por bootstrap (2.000 remuestreos, semilla 42). Diferencias pareadas de AUROC en test: frente a la opcion (d), +0,053 [-0,041, +0,148]; frente a la sonda sobre estados ocultos de HuggingFace, -0,022 [-0,040, -0,004]. El conjunto de test son los 151 textos ingleses etiquetados del experimento multilingue, reutilizados aqui para confirmar esta variante desplegable.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 0,6 GB; en BF16 los 8 bloques de Qwen3-0.6B requieren del orden de 0,6 GB de memoria, holgadamente dentro de cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre; el autor midio la pasada de embeddings en Metal (Apple Silicon) mediante llama.cpp. No se documentan mediciones en A100, H100 o RTX 4090.
- Cabe en GPU consumer: si, incluidas GPUs de gama baja y ejecucion en CPU.
- Opciones de despliegue: llama.cpp / llama-cpp-python (receta exacta documentada), con pooling NONE y salida tras output_norm del bloque 8. No se documenta soporte en vLLM, TGI, Ollama ni otras plataformas.
- Latencia medida en Metal (llama.cpp): 0,072 s para 275 tokens de prompt, 0,231 s para 941 tokens y 0,742 s para 2.494 tokens; el resumen completo de la aplicacion tarda 0,97 s, 1,97 s y 2,84 s respectivamente. El coste de la sonda es un producto escalar de 1.024 valores. No se publica throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | AUROC en test | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| light-sufficiency-predictor (GGUF, 8 bloques) | 281.431.040 (base) | no disponible | Clasificacion de suficiencia | 0,714 [0,611, 0,814] | Apache-2.0 (no confirmada para el paquete) | HuggingFace, GGUF |
| Sonda sobre estados ocultos de HuggingFace (misma familia) | 281.431.040 (base) | no disponible | Clasificacion de suficiencia | 0,736 (implícito: +0,022 frente a la variante GGUF) | no disponible | no disponible (referenciada en la model card) |
| Opcion (d) (referenciada en la model card) | no disponible | no disponible | Clasificacion de suficiencia | 0,661 (implícito: -0,053 frente a la variante GGUF) | no disponible | no disponible |
| Qwen3-0.6B (modelo base) | 0,6 B | no disponible | Generacion de texto | no aplica | Apache-2.0 | HuggingFace |

Las cifras de las dos sondas comparadas se derivan de las diferencias pareadas publicadas; no se dispone de sus intervalos completos ni de sus especificaciones.

## Limitaciones y advertencias

- Cubre un unico modelo ligero (Qwen3-0.6B BF16), un unico prompt (version 97272ef, objetivo de 100 palabras) y un unico backend (llama.cpp); otros modelos, prompts o longitudes no estan cubiertos.
- Solo ingles; los textos traducidos automaticamente quedan fuera del dominio de entrenamiento.
- El conjunto de test es pequeno (151 textos, 33 insuficientes), por lo que los intervalos de confianza son amplios.
- La etiqueta depende de un unico juez (Gemma 3 12B) y de comprobaciones tecnicas, lo que introduce sesgo del juez en las etiquetas.
- No lee el resumen generado, por lo que no puede decidir por si solo si un resumen es fiable; debe usarse como senal adicional.
- La calibracion de Platt se ajusto sobre los mismos 206 textos de validacion usados para elegir los puntos del umbral, por lo que la calibracion es optimista.
- En validacion, la sonda no separa los fallos entre los textos enrutados al modelo ligero, segun el analisis de umbrales de la model card.
- La salida de llama.cpp incluye output_norm, de modo que las features difieren de los estados ocultos de HuggingFace y exigen la receta GGUF exacta.
- Licencia: la cabecera Apache-2.0 corresponde al modelo base Qwen3-0.6B y no esta confirmada para el paquete completo; las etiquetas del juez Gemma 3 12B estan sujetas a los Terminos de Uso de Gemma, no a una licencia de codigo abierto.
- Los textos fuente provienen de datasets publicos (CNN/DailyMail, DialogSum, PubMed summarization, GovReport) sin licencias registradas en el repositorio; deben verificarse antes de publicar o reutilizar el modelo.
- La model card se marca como borrador y el autor indica que nada se ha subido; el estado de publicacion del artefacto debe confirmarse.

## Enlaces

- HuggingFace: https://huggingface.co/AcidHunter/light-sufficiency-predictor
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- GGUF de origen: https://huggingface.co/unsloth/Qwen3-0.6B-GGUF
- Terminos de uso de Gemma 3 12B (juez de etiquetas): https://ai.google.dev/gemma/terms
- No se han encontrado en la informacion disponible papers, blogs, repositorios ni demos adicionales.
