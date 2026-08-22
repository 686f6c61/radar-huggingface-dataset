# ceselder/qwen36-27b-sae-l42-1b

## Resumen

`ceselder/qwen36-27b-sae-l42-1b` es un sparse autoencoder (SAE) de tipo BatchTopK entrenado sobre las activaciones de la salida residual (resid_post) de la capa 42 del modelo Qwen/Qwen3.6-27B, un LLM denso de 27 mil millones de parámetros. El SAE descompone el espacio de activaciones de 5120 dimensiones en un diccionario sobredimensionado de 131072 features, de las cuales solo 64 se activan por token (k=64). Su propósito es la interpretabilidad mecanicista: identificar qué conceptos, patrones o funciones internas codifica cada feature del modelo base.

Desarrollado por el autor independiente ceselder, este SAE sigue la misma receta de entrenamiento que los SAEs BatchTopK de Adam Karvonen para Qwen3-8B, pero aplicada a un modelo más grande (27B) y con un diccionario el doble de grande. Se entrenó sobre el corpus en inglés `openbmb/Ultra-FineWeb` y alcanza una varianza explicada de 0.7040 con una tasa de features muertas del 0.06%, lo que lo convierte en una herramienta útil para investigar el comportamiento interno de un LLM de última generación. El repositorio incluye, además de los pesos del SAE, un archivo con los ejemplos de activación máxima para cada feature viva, lo que facilita el análisis cualitativo.

La relevancia de este modelo radica en que permite abrir la "caja negra" de un LLM de 27B, un tamaño que equilibra capacidad y viabilidad de despliegue. Al estar licenciado bajo Apache-2.0 y ser compatible con la librería `dictionary_learning`, puede integrarse fácilmente en flujos de investigación sobre alineación, detección de sesgos o edición de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder BatchTopK sobre resid_post de la capa 42 de Qwen3.6-27B |
| Parametros totales | no disponible (diccionario de 131072 features sobre d_model=5120) |
| Parametros activos | 64 (k) |
| Longitud de contexto | no aplica (opera sobre activaciones, no genera texto) |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch nativo) |
| Idiomas soportados | ingles (corpus de entrenamiento Ultra-FineWeb, seccion `en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state_dict (.pt), config.json, parquet (ejemplos) |

## Arquitectura y entrenamiento

El SAE es un autoencoder disperso con activacion BatchTopK, entrenado con la libreria `dictionary_learning` de saprmarks. La arquitectura consiste en un encoder lineal que proyecta las activaciones residuales de la capa 42 (dimension 5120) a un diccionario de 131072 features, seguido de una seleccion top-k (k=64) con un umbral aprendido (1.5846). El decoder es la transpuesta del encoder, como es habitual en SAEs. El entrenamiento utilizo 735.105.024 tokens del corpus `openbmb/Ultra-FineWeb` en ingles, aunque el autor menciona en la comparativa que fueron aproximadamente 250 millones de tokens (discrepancia no resuelta entre la tabla y el texto). Se aplico una loss auxiliar de features muertas con `auxk_alpha=1/32` y un programa de calentamiento con umbral aprendido, identico al metodo de los SAEs de Adam Karvonen para Qwen3-8B.

Las metricas de calidad del SAE son: varianza explicada de 0.7040, L0 de 63.8 (numero medio de features activas por token) y una tasa de features muertas del 0.06% (75 de 131072). El autor advierte que, al haberse entrenado con menos tokens que los SAEs de Karvonen (que usan ~500M), este checkpoint debe tratarse como un resultado de investigacion preliminar; un entrenamiento mas largo probablemente reduciria aun mas la tasa de features muertas.

## Capacidades

- Descomposicion de activaciones: convierte el vector de activaciones residuales de la capa 42 en una representacion dispersa de 64 features activas, cada una asociada a un patron interpretable.
- Interpretabilidad cualitativa: el repositorio incluye un archivo `data/examples.parquet` con las ventanas de texto de maxima activacion para cada feature viva, permitiendo inspeccionar que conceptos codifica cada una (por ejemplo, la feature 18327 se activa con "high blood pressure", la 12436 con "depreciation", la 19274 con "language").
- Analisis de features muertas: identifica que features no se activan nunca, util para diagnosticar problemas de entrenamiento o cobertura del diccionario.
- Compatibilidad con `dictionary_learning`: se carga directamente con la API de esa libreria, facilitando su uso en pipelines de interpretabilidad existentes.
- No es un modelo generativo: no genera texto ni responde a prompts; su funcion es exclusivamente analitica sobre las activaciones del modelo base.

## Casos de uso

- Investigacion en interpretabilidad mecanicista: estudiar que features de la capa 42 se activan ante conceptos concretos (medicina, economia, gramatica) y como se combinan para formar representaciones complejas.
- Deteccion de sesgos: localizar features que responden sistematicamente a categorias de genero, raza o ideologia, y analizar su contribucion a las decisiones del modelo.
- Edicion de modelos (model editing): identificar features responsables de comportamientos no deseados y modificarlas (por ejemplo, mediante intervenciones en el espacio de activaciones) para corregir sesgos o alucinaciones.
- Diagnostico de alucinaciones: correlacionar la activacion de ciertas features con outputs factualmente incorrectos, ayudando a entender que patrones internos preceden a errores.
- Control de activaciones (activation steering): usar las features del SAE para dirigir el comportamiento del modelo en una direccion deseada, por ejemplo, aumentando la activacion de features asociadas a respuestas mas seguras o mas creativas.
- Educacion y divulgacion: visualizar con ejemplos reales como un LLM de 27B representa conceptos abstractos, sirviendo como material didactico en cursos de interpretabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) porque este modelo no es un LLM generativo, sino un SAE de interpretabilidad. Las metricas relevantes son las de calidad del diccionario:

| Metrica | Valor |
|---|---|
| Varianza explicada | 0.7040 |
| L0 (features activas por token) | 63.8 |
| Features muertas | 0.06% (75/131072) |
| Tokens de entrenamiento | 735.105.024 (segun tabla; el autor menciona ~250M en el texto) |

En comparacion con los SAEs de Adam Karvonen para Qwen3-8B (F=65536, k=80, ~500M tokens), este SAE usa un diccionario el doble de grande (F=131072) y un k menor (64), con una tasa de features muertas similar o mejor, aunque con menos tokens de entrenamiento. No hay datos publicos de otros SAEs sobre Qwen3.6-27B para una comparativa directa.

## Requisitos de hardware

- El SAE en si ocupa aproximadamente 7 GB en disco (repo completo), pero para usarlo es necesario cargar el modelo base Qwen3.6-27B, que requiere unos 54 GB de VRAM en FP16 o unos 14 GB en cuantizacion de 4 bits.
- GPU recomendada: al menos 24 GB de VRAM (por ejemplo, RTX 3090/4090, A10G) para el modelo base en FP16; con cuantizacion 4 bits puede caber en GPUs de 12-16 GB (RTX 4070, etc.).
- El SAE se ejecuta como una capa adicional tras extraer las activaciones de la capa 42; el coste computacional anadido es minimo (una multiplicacion de matrices 5120x131072).
- Opciones de despliegue: Python con PyTorch y la libreria `dictionary_learning`; no es compatible con vLLM, llama.cpp u Ollama porque no es un modelo de generacion.
- Latencia y throughput: no disponibles; dependen del modelo base y del hardware utilizado.

## Comparativa con modelos similares

| Modelo | Modelo base | Diccionario (F) | k | Tokens entrenamiento | Varianza explicada | Features muertas |
|---|---|---|---|---|---|---|
| ceselder/qwen36-27b-sae-l42-1b | Qwen3.6-27B (capa 42) | 131072 | 64 | ~735M (segun tabla) | 0.7040 | 0.06% |
| SAE BatchTopK de Adam Karvonen (Qwen3-8B) | Qwen3-8B (capa 42) | 65536 | 80 | ~500M | no disponible | no disponible |
| SAE de OpenAI (GPT-2 small) | GPT-2 small | 3072 | no aplica (top-k fijo) | ~8B tokens | no disponible | no disponible |

La comparativa se limita a SAEs de la misma familia (BatchTopK) porque no existen otros SAEs publicos sobre Qwen3.6-27B. El SAE de ceselder ofrece un diccionario mas grande y una tasa de features muertas muy baja, aunque con menos tokens de entrenamiento que el de Karvonen.

## Limitaciones y advertencias

- Es un checkpoint de investigacion, no un producto final; el propio autor recomienda tratarlo como un resultado preliminar.
- Entrenado con un corpus exclusivamente en ingles (`Ultra-FineWeb` en), por lo que las features pueden no capturar adecuadamente conceptos de otros idiomas.
- Solo cubre la capa 42 (resid_post); no proporciona una vision completa del modelo, que tiene 64 capas.
- La varianza explicada es del 70.4%, lo que significa que cerca del 30% de la varianza de las activaciones no queda capturada por el diccionario.
- Las features identificadas pueden no ser perfectamente monosemanticas; algunas pueden combinar multiples conceptos.
- No hay garantias de que las features sean estables entre diferentes ejecuciones o semillas de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.6-27B tiene su propia licencia (Qwen Research License) que puede imponer restricciones adicionales; se recomienda revisarla antes de un despliegue en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ceselder/qwen36-27b-sae-l42-1b
- Libreria de entrenamiento `dictionary_learning`: https://github.com/saprmarks/dictionary_learning
- Blog oficial de Qwen3.6-27B (modelo base): https://qwen.ai/blog?id=qwen3.6-27b
- Guia de Qwen3.6-27B (contexto del modelo base): https://www.aimadetools.com/blog/qwen-3-6-27b-complete-guide/
