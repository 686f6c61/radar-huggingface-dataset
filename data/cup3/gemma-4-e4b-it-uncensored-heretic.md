# Cup3/gemma-4-E4B-it-uncensored-heretic

## Resumen

El modelo Cup3/gemma-4-E4B-it-uncensored-heretic es una versión modificada del modelo multimodal google/gemma-4-E4B-it de Google DeepMind, creada por el usuario Cup3. El objetivo es eliminar los comportamientos de rechazo del modelo original mediante la técnica de abliteración Heretic v1.2.0 con Arbitrary-Rank Ablation (ARA). Según la model card, la versión original rechazaba 99 de cada 100 peticiones consideradas problemáticas, mientras que esta versión solo rechaza 7, manteniendo una divergencia KL de 0,0043 respecto al original, lo que indica una alteración mínima del comportamiento general. El modelo tiene 7.996.156.490 parámetros (aproximadamente 8.000 millones) y pesos en formato safetensors. Se identifica como un modelo multimodal (image-text-to-text, any-to-any), aunque no se especifica la arquitectura interna ni la longitud de contexto. Resulta relevante para investigación en alineación, seguridad y técnicas de desbloqueo de modelos, así como para aplicaciones que requieran respuestas directas sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal (image-text-to-text, any-to-any); arquitectura interna no especificada |
| Parametros totales | 7.996.156.490 |
| Parametros activos | No disponible (no se indica si es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 (sujeta a los terminos de la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo no es un entrenamiento desde cero, sino una modificacion post-entrenamiento del modelo base google/gemma-4-E4B-it. Se aplico la herramienta Heretic v1.2.0 con el metodo Arbitrary-Rank Ablation (ARA), que elimina selectivamente los comportamientos de rechazo en ciertas capas del modelo. Los parametros de abliteracion son: start_layer_index 8, end_layer_index 36, preserve_good_behavior_weight 0,9827, steer_bad_behavior_weight 0,0001, overcorrect_relative_weight 0,9110 y neighbor_count 15. El componente objetivo es attn.o_proj. No se proporcionan detalles sobre los datos de entrenamiento originales, el numero de tokens ni procesos de RLHF/DPO. El modelo base es multimodal, por lo que esta version conserva la capacidad de procesar texto e imagenes.

## Capacidades

- Generacion de texto y comprension multimodal (imagen-texto) heredadas del modelo base google/gemma-4-E4B-it.
- Reduccion significativa de rechazos: pasa de 99/100 a 7/100 en el conjunto de pruebas de la model card, lo que permite respuestas a peticiones que el modelo original bloqueaba.
- Razonamiento de sentido comun (PIQA) con una precision del 85,58%, frente al 86,02% del original.
- Conocimiento general (MMLU) con una precision del 68,97%, frente al 69,46% del original.
- Soporte de tool calling, agentes o razonamiento multi-paso: no especificado en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion en alineacion y seguridad: permite estudiar como la abliteracion afecta los rechazos y la calidad del modelo, comparando respuestas antes y despues.
- Asistentes conversacionales sin restricciones: en entornos controlados donde se necesite evitar rechazos automaticos, el modelo responde a un 93% mas de peticiones que el original.
- Analisis multimodal de imagenes: gracias a la capacidad image-text-to-text, puede describir imagenes o responder preguntas visuales sin los filtros del modelo base.
- Generacion de contenido creativo: escritura de ficcion, dialogos o guiones que el modelo original rechazaria, con una calidad cercana al original (divergencia KL 0,0043).
- Evaluacion de tecnicas de desbloqueo: sirve como caso practico para validar el metodo Heretic/ARA y comparar metricas de rendimiento.
- Prototipado rapido de aplicaciones que requieren respuestas directas: el modelo puede integrarse en pipelines de prueba para validar flujos de conversacion sin intervencion de filtros.

## Benchmarks y rendimiento

| Benchmark | Modelo original (google/gemma-4-E4B-it) | Modelo heretic (Cup3/gemma-4-E4B-it-uncensored-heretic) |
|---|---|---|
| PIQA (precision) | 86,02% | 85,58% |
| MMLU (precision) | 69,46% | 68,97% |
| Tasa de rechazos | 99/100 | 7/100 |
| Divergencia KL | 0 | 0,0043 |

La model card tambien desglosa los resultados de MMLU por asignaturas, pero no se dispone de comparaciones con otros modelos de la misma categoria.

## Requisitos de hardware

- VRAM estimada: no disponible en la documentacion. Con pesos en FP16 (16 GB), se estima que se necesitan al menos 20-24 GB de VRAM para inferencia sin cuantizar.
- GPU recomendadas: no especificadas. En FP16, una RTX 3090 o 4090 (24 GB) o una A100/H100 serian adecuadas. Con cuantizacion no especificada, podria ejecutarse en GPUs de consumo de 8-12 GB.
- Opciones de despliegue: el modelo esta etiquetado como compatible con la libreria transformers y con endpoints compatibles. No se mencionan vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

En la informacion disponible no se incluyen benchmarks de modelos comparables, aparte del modelo original. La siguiente tabla compara las caracteristicas clave con el modelo base:

| Caracteristica | google/gemma-4-E4B-it (original) | Cup3/gemma-4-E4B-it-uncensored-heretic |
|---|---|---|
| Parametros totales | No disponible en la informacion | 7.996.156.490 |
| Modalidad | Multimodal (image-text-to-text) | Multimodal (image-text-to-text, any-to-any) |
| Tasa de rechazos | 99/100 | 7/100 |
| Divergencia KL | 0 | 0,0043 |
| Licencia | Apache 2.0 (Gemma 4) | Apache 2.0 (Gemma 4) |
| Formato de pesos | No disponible | safetensors |

Existen otras variantes uncensored del mismo modelo base en HuggingFace, como InfinimindCreations/gemma-4-E4B-it-uncensored o llmfan46/gemma-4-E4B-it-uncensored-heretic, pero no se dispone de sus especificaciones ni benchmarks en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos: no se han documentado sesgos especificos, pero el modelo hereda los sesgos del modelo base google/gemma-4-E4B-it.
- Riesgo de alucinacion: no se han publicado evaluaciones especificas; el rendimiento en MMLU (68,97%) indica que puede cometer errores en tareas de conocimiento.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan especificados en la informacion disponible.
- Licencia: el modelo se publica bajo Apache 2.0, pero el modelo base esta sujeto a la licencia de Gemma 4 de Google, que puede imponer terminos adicionales para uso comercial.
- Advertencia importante: al reducir los rechazos, el modelo puede generar contenido no deseado, ofensivo o peligroso. No ha sido validado de forma exhaustiva; tiene 0 descargas y 0 likes en HuggingFace, lo que indica que es un modelo nuevo o poco probado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Cup3/gemma-4-E4B-it-uncensored-heretic
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Heretic (herramienta de abliteracion): https://github.com/p-e-w/heretic
- Pull request de Arbitrary-Rank Ablation (ARA): https://github.com/p-e-w/heretic/pull/211
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Coleccion Gemma 4 en HuggingFace: https://huggingface.co/collections/google/gemma-4
- Repositorio GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentacion de Gemma: https://ai.google.dev/gemma/docs/core
