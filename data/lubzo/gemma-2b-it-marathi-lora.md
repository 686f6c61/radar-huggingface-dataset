# lubzo/gemma-2b-it-marathi-lora

## Resumen

gemma-2b-it-marathi-lora es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario lubzo sobre el modelo instructivo google/gemma-2b-it, de 2.000 millones de parametros. Su objetivo es dotar a un modelo pequeno y multilingue de capacidad de seguir instrucciones en marati (codigo de idioma `mr`), una lengua indoaria con recursos limitados en corpus de instrucciones de calidad.

El adaptador se entrena sobre 51.760 pares instruccion-respuesta traducidos automaticamente al marati desde el dataset Cleaned Stanford Alpaca (`unsloth/alpaca-cleaned`), con 3 epocas, optimizador AdamW y pesos base sin cuantizar en FP16/BF16. La receta reproduce el montaje experimental descrito por Khade et al. en el taller CHiPSAL 2025, centrado en los retos de adaptar LLM multilingues a lenguas de bajos recursos mediante PEFT.

El repositorio ocupa aproximadamente 0,1 GB y contiene unicamente los pesos del adaptador, no un modelo completo. La evaluacion publicada muestra una mejora muy marcada en IndicSentiment (exactitud de 0,5010 a 0,8710) pero un retroceso en ARC-Easy y ARC-Challenge, lo que sugiere un ajuste estrecho al dominio de la tarea y no una mejora general de capacidades. El autor lo declara explicitamente como material de investigacion y uso educativo, no como asistente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma) con adaptador LoRA insertado en `q_proj`, `k_proj`, `v_proj`, `o_proj` |
| Parametros totales | 2.000 millones (nominales, modelo base google/gemma-2b-it); parametros del adaptador: no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el modelo base google/gemma-2b-it declara 8.192 tokens |
| Tipos de cuantizacion | El adaptador se publica en safetensors con precision FP16/BF16; no se publican variantes GGUF, GPTQ ni AWQ |
| Idiomas soportados | Marati (`mr`) como idioma de ajuste; el modelo base es multilingue, pero no se documentan evaluaciones en otros idiomas |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, ~0,1 GB) |
| Hiperparametros LoRA | r = 16, alpha = 32, dropout = 0,05 |
| Datos de entrenamiento | lubzo/marathi-alpaca-cleaned-translated (51.760 pares, traduccion automatica de `unsloth/alpaca-cleaned`) |
| Epocas y optimizador | 3 epocas, AdamW |
| Libreria | peft (requiere transformers y el modelo base google/gemma-2b-it por separado) |
| Fecha de publicacion | 18 de septiembre de 2026 (segun metadatos de HuggingFace) |
| Descargas / likes | 14 descargas, 0 likes |

## Arquitectura y entrenamiento

El modelo base es google/gemma-2b-it, un transformer decoder-only de la familia Gemma con 2.000 millones de parametros y atencion causal estandar. Sobre el se aplica LoRA con rango 16 y alpha 32 sobre las cuatro proyecciones de atencion (`q_proj`, `k_proj`, `v_proj`, `o_proj`), con dropout de 0,05 y pesos base congelados en precision mixta FP16/BF16 sin cuantizar. El adaptador no modifica las capas MLP ni la normalizacion, de modo que la capacidad anadida se concentra en la proyeccion de consultas y claves de la atencion.

Los datos de entrenamiento son 51.760 pares instruccion-respuesta procedentes de una traduccion automatica del dataset Cleaned Stanford Alpaca al marati, y se entrenan durante 3 epocas con AdamW. No se documenta el uso de RLHF, DPO ni decodificacion especulativa, ni se detalla la mezcla final del corpus mas alla de su origen traducido. La innovacion principal del trabajo es metodologica: reproducir y evaluar una receta PEFT de bajo coste para lenguas de bajos recursos, siguiendo el montaje experimental de Khade et al. (CHiPSAL 2025).

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones sencillas en marati, heredando el formato instructivo del modelo base.
- Respuesta a preguntas de conocimiento general en marati, como se ilustra en el ejemplo de uso del autor (capital de la India).
- Clasificacion de sentimiento en marati, con una exactitud reportada de 0,8710 en IndicSentiment.
- Inferencia de relaciones textuales basicas (IndicXNLI con exactitud 0,3335 y macro F1 0,1919).
- Generacion de texto en formato instruccion-respuesta, util para aumento de datos en marati.
- Capacidad multilingue residual del modelo base, aunque no evaluada ni garantizada tras el ajuste en marati.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo de pensamiento explicito, vision o audio: no disponible.

## Casos de uso

- Reproduccion de experimentos academicos en PEFT para lenguas de bajos recursos: permite replicar el montaje de Khade et al. (CHiPSAL 2025) con un coste de computo minimo, ya que solo se entrena un adaptador de rango 16 sobre un modelo de 2.000 millones de parametros.
- Prototipado de asistentes conversacionales en marati: el adaptador responde a instrucciones en marati con el formato del modelo instructivo base, adecuado para validar flujos de producto antes de invertir en ajuste completo.
- Analisis de sentimiento en marati: es el caso donde el adaptador muestra la mejora mas clara (0,5010 a 0,8710 de exactitud en IndicSentiment), por lo que resulta util para clasificar opiniones o comentarios en ese idioma.
- Generacion de pares instruccion-respuesta en marati para aumento de datos: puede producir texto sintetico en marati que despues se filtre y se use para entrenar modelos mayores.
- Creacion de material educativo y contenidos divulgativos en marati: traduccion y reformulacion de explicaciones, con supervision humana obligatoria por el riesgo de artefactos de traduccion.
- Experimentos de ajuste incremental: sirve como punto de partida para anadir un segundo adaptador especializado (dominio legal, medico o tecnologico) sin reentrenar el modelo base.
- Despliegue en hardware de gama de consumo: al ser un adaptador sobre un modelo de 2.000 millones de parametros, cabe en GPUs de 8-12 GB de VRAM, lo que facilita pruebas en portatiles y estaciones de trabajo modestas.

## Benchmarks y rendimiento

Resultados publicados por el autor, evaluados con el arnes AI4Bharat Airavata:

| Modelo | Metrica | IndicSentiment | ARC-Easy | ARC-Challenge | IndicCOPA | IndicXNLI |
|---|---|---|---|---|---|---|
| gemma-2b-it (base) | Accuracy | 0,5010 | 0,3215 | 0,2927 | 0,5023 | 0,3329 |
| gemma-2b-it (base) | Binary F1 (Cls 1) | 0,6617 | no aplica | no aplica | 0,0000 | no aplica |
| gemma-2b-it (base) | Macro F1 | 0,3556 | 0,1893 | 0,2507 | 0,3343 | 0,1696 |
| gemma-2b-it (base) | F1 reportado en el paper | 0,7444 | 0,4651 | 0,4043 | 0,2963 | 0,3066 |
| gemma-2b-it (marathi LoRA) | Accuracy | 0,8710 | 0,2500 | 0,2765 | 0,5023 | 0,3335 |
| gemma-2b-it (marathi LoRA) | Binary F1 (Cls 1) | 0,8724 | no aplica | no aplica | 0,2191 | no aplica |
| gemma-2b-it (marathi LoRA) | Macro F1 | 0,8710 | 0,0895 | 0,2052 | 0,4269 | 0,1919 |

Lectura de los datos: el ajuste LoRA mejora de forma sustancial IndicSentiment (+0,3700 puntos de exactitud) y el macro F1 de IndicCOPA (+0,0926), mientras que empeora ARC-Easy (-0,0715 de exactitud) y ARC-Challenge (-0,0162). No se han publicado resultados de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 5-6 GB para el modelo base de 2.000 millones de parametros mas el adaptador (estimacion, no dato publicado).
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 3 GB; en 4 bits: aproximadamente 1,5-2 GB (estimacion).
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM, como RTX 3060 12 GB, RTX 4060 Ti 8 GB, RTX 4070, RTX 4090; en centro de datos, A100 y H100 sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas modernas con 8 GB o mas de VRAM; tambien es viable en CPU mediante cuantizacion.
- Opciones de despliegue: transformers + peft (receta oficial del autor), vLLM y TGI con soporte de adaptadores LoRA, y llama.cpp u Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF (proceso no documentado por el autor).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | IndicSentiment (accuracy) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lubzo/gemma-2b-it-marathi-lora | 2.000 M + adaptador LoRA r=16 | no disponible (base: 8.192 tokens declarados por Google) | 0,8710 | Gemma | HuggingFace, adaptador PEFT |
| google/gemma-2b-it | 2.000 M | 8.192 tokens (segun el modelo base) | 0,5010 | Gemma | HuggingFace, pesos completos |
| Otros adaptadores LoRA para marati | no disponible | no disponible | no disponible | no disponible | Rango similar en HuggingFace, sin datos verificados en esta busqueda |

No se dispone de datos verificados de benchmarks para alternativas directas de ajuste en marati con el mismo arnes de evaluacion, por lo que la comparacion cuantitativa se limita al modelo base.

## Limitaciones y advertencias

- Datos de entrenamiento traducidos automaticamente: el autor advierte que el modelo se entrena sobre marati no nativo y hereda artefactos de traduccion y sesgos del corpus original en ingles.
- Degradacion en tareas de razonamiento: ARC-Easy y ARC-Challenge empeoran respecto al modelo base, lo que indica sobreajuste al formato de instrucciones y perdida de capacidades generales.
- Riesgo de alucinacion: al ser un modelo de 2.000 millones de parametros con ajuste estrecho, es propenso a inventar hechos, especialmente fuera del dominio del corpus Alpaca.
- Cobertura idiomatica limitada: solo se evalua en marati; no hay evidencia de comportamiento fiable en otros idiomas tras el ajuste.
- Contexto limitado: al no publicarse datos propios, la ventana efectiva depende del modelo base y no se ha validado en conversaciones largas.
- Uso previsto restrictivo: el propio autor indica que es material de investigacion y educativo, no un asistente listo para produccion.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de Gemma y a su politica de usos prohibidos; es necesario revisar las obligaciones de atribucion y redistribucion antes de integrarlo en un producto.
- Adopcion muy baja: 14 descargas y 0 likes en el momento de la consulta, sin validacion independiente de los resultados publicados.
- Requiere cargar el modelo base completo ademas del adaptador: el repositorio no es autosuficiente y hay que descargar google/gemma-2b-it por separado.
- Sin soporte documentado de tool calling, agentes ni modo de razonamiento extendido.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/lubzo/gemma-2b-it-marathi-lora
- Modelo base: https://huggingface.co/google/gemma-2b-it
- Dataset de entrenamiento: https://huggingface.co/datasets/lubzo/marathi-alpaca-cleaned-translated
- Dataset de origen: https://huggingface.co/datasets/unsloth/alpaca-cleaned
- Paper de referencia (Khade et al., CHiPSAL 2025): https://aclanthology.org/2025.chipsal-1.22.pdf
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante al modelo; los resultados devueltos corresponden a sitios de inversion sin relacion con el tema.
