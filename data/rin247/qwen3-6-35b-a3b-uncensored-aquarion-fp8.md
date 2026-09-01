# Rin247/Qwen3.6-35B-A3B-Uncensored-Aquarion-FP8

## Resumen

El modelo `Rin247/Qwen3.6-35B-A3B-Uncensored-Aquarion-FP8` es una cuantización FP8 weight-only del modelo base `Qwen3.6-35B-A3B-Uncensored`, desarrollada por el usuario Rin247 dentro de la colección Aquarion. Se trata de un modelo de texto de tipo mixture-of-experts (MoE) con aproximadamente 35 000 millones de parámetros totales y unos 3 000 millones activos por paso, según fuentes externas. La versión original fue sometida a un proceso de "abliteration" (eliminación de la dirección de rechazo) mediante proyección ortogonal, lo que da como resultado un modelo sin censura aparente.

Esta versión cuantizada reduce el uso de memoria y facilita el despliegue en entornos con recursos limitados, manteniendo la compatibilidad con librerías como Transformers, vLLM, SGLang o KTransformers. Su relevancia radica en ofrecer una alternativa de código abierto para aplicaciones conversacionales y de generación de texto que requieren respuestas sin restricciones de seguridad, aunque con las advertencias éticas y legales correspondientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) con atencion hibrida (lineal + softmax) segun fuentes externas |
| Parametros totales | 34 660 610 688 |
| Parametros activos | ~3 000 000 000 (segun HackerNoon, no confirmado en la model card) |
| Longitud de contexto | 262 000 tokens (segun HackerNoon, no confirmado en la model card) |
| Tipos de cuantizacion | FP8 weight-only (safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (FP8 weight-only con escalas y formas almacenadas) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.6-35B-A3B` emplea una arquitectura MoE con aproximadamente 3 000 millones de parámetros activos por token, combinando atención lineal y atención softmax completa en una proporción 3:1, según el artículo de HackerNoon. Esta combinación busca reducir el coste computacional en contextos largos manteniendo la calidad de atención.

El proceso de "abliteration" aplicado antes de la cuantización consiste en proyectar ortogonalmente los pesos para eliminar la dirección de rechazo aprendida durante el entrenamiento, lo que produce un modelo que no muestra reticencias a responder peticiones que el modelo original rechazaría. La cuantización FP8 se realizó mediante RTN (round-to-nearest) en CPU, almacenando las escalas y formas de los pesos en buffers separados (`*.weight_scale`, `*.weight_shape`). No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados o si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generacion de texto y conversacion multi-turno.
- Modelo "uncensored" (sin censura) gracias al proceso de abliteration, lo que permite respuestas sin restricciones de seguridad.
- Soporte de contexto largo (262K tokens segun fuentes externas), adecuado para documentos extensos o historiales de conversacion amplios.
- Compatible con pipelines de generacion de texto de la libreria Transformers.
- No se ha confirmado soporte de tool calling, function calling, agentes, vision o audio en la informacion disponible.

## Casos de uso

- Despliegue en entornos con VRAM limitada: al estar cuantizado en FP8, el modelo ocupa aproximadamente 35 GB en memoria, lo que permite ejecutarlo en GPUs de 48 GB o 80 GB, o en configuraciones multi-GPU.
- Chatbots conversacionales sin restricciones: ideal para prototipos o aplicaciones de investigacion donde se requiere explorar respuestas sin filtros de seguridad, siempre bajo supervisión.
- Procesamiento de documentos largos: gracias a su contexto de 262K tokens, puede resumir o analizar libros, informes tecnicos o codigo fuente extenso en una sola pasada.
- Generacion de codigo en entornos de desarrollo: aunque no hay benchmarks especificos, al ser un modelo de la familia Qwen, puede utilizarse para autocompletado o generacion de fragmentos de codigo, previa validacion.
- Investigacion en alineacion y seguridad: el proceso de abliteration permite estudiar el comportamiento de modelos sin mecanismos de rechazo, util para analizar sesgos y riesgos.
- Servicios de generacion de contenido creativo: redaccion de textos literarios, guiones o material publicitario sin las limitaciones habituales de los modelos censurados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo cuantizado.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 34 660 610 688 parametros en FP8, lo que supone aproximadamente 34,7 GB solo para los pesos. Con overhead de activaciones y cache KV (especialmente con contexto largo), se recomienda al menos 48 GB de VRAM.
- GPUs recomendadas: NVIDIA A100 80GB, H100 80GB, o configuraciones multi-GPU con RTX 4090 (24GB) o RTX 6000 Ada (48GB) en paralelo.
- En consumer GPU: no cabe en una sola GPU de 24 GB; se necesitarian al menos dos RTX 4090 o una GPU profesional de 48 GB.
- Opciones de despliegue: compatible con Transformers, vLLM, SGLang y KTransformers, segun el repositorio GitHub asociado. Tambien podria convertirse a GGUF para su uso con llama.cpp u Ollama, aunque no se proporciona dicha conversion.
- Latencia y throughput: no disponibles. Dependera del hardware y del motor de inferencia utilizado.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Cuantizacion | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Uncensored-Aquarion-FP8 (este) | 34,66B | ~3B | 262K | FP8 | no disponible |
| Qwen3.6-27B-Uncensored-Aquarion-FP8 (Rin247) | ~27B | no disponible | no disponible | FP8 | no disponible |
| Qwen3.6-35B-A3B (base, sin cuantizar) | 34,66B | ~3B | 262K | BF16/FP16 | Apache 2.0 (segun Qwen, no confirmado) |

No se dispone de datos de rendimiento comparativo. La principal diferencia entre este modelo y el base es la cuantizacion FP8, que reduce el uso de memoria a costa de una posible perdida menor de precision. La version 27B de la misma coleccion es una alternativa mas ligera, aunque con menos parametros totales.

## Limitaciones y advertencias

- Licencia no disponible: no se especifica bajo que terminos se distribuye, lo que puede impedir su uso comercial o requerir consulta legal previa.
- Modelo sin censura: al haber sido abliterated, puede generar contenido ofensivo, ilegal o peligroso. No es apto para aplicaciones publicas sin moderacion.
- Cuantizacion FP8: puede introducir degradacion en la calidad de las respuestas respecto al modelo en precision completa, especialmente en tareas de razonamiento complejo.
- Requiere dequantizacion manual: los pesos FP8 con escalas y formas deben procesarse antes de ser utilizados en algunos motores de inferencia, lo que anade complejidad al despliegue.
- Sin datos de sesgos ni alucinaciones: no se ha evaluado formalmente el comportamiento del modelo en estos aspectos.
- Fecha de creacion y actualizacion: 2026-09-01, lo que sugiere que es un modelo reciente, pero no se ha verificado su estabilidad en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/Rin247/Qwen3.6-35B-A3B-Uncensored-Aquarion-FP8
- Coleccion Qwen3-Aquarion: https://huggingface.co/collections/Rin247/qwen3-aquarion
- Articulo de HackerNoon sobre el modelo base: https://hackernoon.com/qwen36-35b-a3b-uncensored-a-35b-moe-model-with-262k-context
- Repositorio GitHub con instrucciones de compatibilidad: https://github.com/347867019/Qwen3.6-35B-A3B-FP8
- Repositorio GitHub alternativo: https://github.com/Damacol/qwen-qwen3.6-35b-a3b-fp8
