# RedHatAI/Muse-Glimmer-30B-FP8-block

## Resumen

Muse-Glimmer-30B-FP8-block es una version cuantizada a FP8 del modelo multimodal Muse-Glimmer-30B desarrollado por Muse (Meta), publicada por RedHatAI. Se trata de un modelo image-text-to-text que acepta texto e imagenes como entrada y genera texto, con una arquitectura denominada MuseGlimmerForConditionalGeneration y 29.776.626.688 parametros totales (aproximadamente 29,8 mil millones).

La relevancia de esta ficha concreta reside en la optimizacion: RedHatAI ha aplicado cuantizacion de pesos y activaciones a FP8 con esquema de bloques (W8A8 block) mediante LLM Compressor, reduciendo el numero de bits por parametro de 16 a 8. Esto disminuye el tamano en disco y los requisitos de memoria de GPU en aproximadamente un 50 por ciento, manteniendo el modelo listo para servir con vLLM.

El modelo esta publicado bajo licencia Apache 2.0, lo que facilita su uso comercial, y cuenta con soporte validado para tool calling mediante el parser `muse_glimmer`. Con 22.432 descargas y 13 likes en Hugging Face, es un artefacto orientado a despliegue en produccion mas que a investigacion de arquitecturas novedosas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MuseGlimmerForConditionalGeneration (transformer multimodal) |
| Parametros totales | 29.776.626.688 (aproximadamente 29,8 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 W8A8 con esquema de bloques (FP8_BLOCK); el modelo base esta en BF16/FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato compressed-tensors |

## Arquitectura y entrenamiento

La arquitectura es MuseGlimmerForConditionalGeneration, un modelo transformer multimodal que procesa entradas de texto e imagen y produce salida de texto. La cuantizacion se aplica exclusivamente a los pesos y activaciones de los operadores lineales dentro de los bloques del transformer; quedan excluidos de la cuantizacion el modulo de vision (`re:.*vision.*`), la cabeza de lenguaje (`lm_head`) y los embeddings (`re:.*embed_tokens.*`), segun la receta de creacion publicada.

El proceso de cuantizacion se realizo con LLM Compressor mediante post-training quantization sin datos de calibracion (model-free PTQ), con el esquema FP8_BLOCK, y se exporto en formato compressed-tensors. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base utilizo RLHF o DPO.

## Capacidades

- Generacion de texto condicionada por imagen (image-text-to-text): descripcion de imagenes, respuesta a preguntas visuales y razonamiento sobre contenido grafico.
- Tool calling / function calling: soportado y validado, con parser dedicado `muse_glimmer` en vLLM y el flag `--enable-auto-tool-choice`.
- Razonamiento multi-paso: el despliegue recomendado incluye `--reasoning-parser muse_glimmer`, lo que indica soporte de modos de razonamiento estructurado.
- Conversacion multi-turno: el tag `conversational` confirma uso en dialogos.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Atencion al cliente multimodal: el modelo puede recibir capturas de pantalla o fotos enviadas por el usuario junto con texto y responder en conversaciones multi-turno, gracias a su pipeline image-text-to-text y al tag conversational.
- Automatizacion de soporte tecnico con tool calling: integrado en vLLM con `--enable-auto-tool-choice` y el parser `muse_glimmer`, el modelo puede invocar funciones para consultar estado de pedidos, abrir tickets o recuperar datos de sistemas internos.
- Extraccion de datos de documentos e imagenes: procesamiento de facturas, formularios o capturas para extraer campos estructurados mediante generacion de texto condicionada por imagen.
- Agentes de razonamiento multi-paso: el parser de razonamiento permite construir pipelines donde el modelo planifica, invoca herramientas y sintetiza resultados en varios pasos.
- Analisis de imagenes en flujos de moderacion o inspeccion: clasificacion y descripcion de contenido visual con salida textual que alimenta sistemas de decision.
- Despliegue en produccion con coste reducido: al ocupar aproximadamente la mitad de memoria que el modelo base en BF16, permite servir un modelo de 30 B multimodales en una unica GPU de 80 GB o en configuraciones multi-GPU mas economicas mediante vLLM.
- Asistentes de accesibilidad: descripcion de imagenes y respuesta a preguntas sobre contenido visual para usuarios con discapacidad visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos FP8 (8 bits por parametro) y aproximadamente 29,8 B de parametros, los pesos ocupan alrededor de 30 GB; sumando activaciones, cache KV y overhead de vLLM, se recomienda un minimo de 40-48 GB de VRAM.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200, o GPUs profesionales con 48 GB o mas (por ejemplo, L40S 48 GB o A6000 48 GB).
- Cabe en consumer GPU: no de forma holgada; una RTX 4090 con 24 GB no es suficiente para los pesos completos en FP8. Seria necesario cuantizar mas agresivamente (por ejemplo, a INT4) o usar offloading, no soportado directamente por esta publicacion.
- Opciones de despliegue: vLLM es el backend validado, con la imagen `vllm/vllm-openai:muse-glimmer` y los flags `--generation-config auto`, `--enable-auto-tool-choice`, `--tool-call-parser muse_glimmer` y `--reasoning-parser muse_glimmer`. Compatible con endpoints estilo OpenAI. El soporte en llama.cpp, Ollama o TGI no esta confirmado en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-FP8-block (RedHatAI) | 29,8 B | no disponible | Texto + imagen a texto | Apache 2.0 | safetensors FP8 (compressed-tensors) |
| Muse-Glimmer-30B (meta-models) | 30 B | no disponible | Texto + imagen a texto | no disponible | BF16/FP16 |
| Alternativas de ~30 B multimodales | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion principal disponible es con el modelo base sin cuantizar, del que esta version reduce el espacio en disco y la memoria de GPU en aproximadamente un 50 por ciento. No se dispone de datos de benchmarks ni de modelos comparables adicionales en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion FP8 puede introducir una degradacion pequena pero no nula de la calidad respecto al modelo base en BF16; no se han publicado evaluaciones que cuantifiquen esa perdida.
- Solo se cuantizan los operadores lineales de los bloques del transformer; el modulo de vision, `lm_head` y los embeddings permanecen en mayor precision, por lo que el ahorro de memoria es algo inferior al 50 por ciento teorico.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en tareas de descripcion de imagenes o extraccion de datos de documentos.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Limitaciones de contexto e idioma: no disponibles; no se especifica la longitud de contexto ni la lista de idiomas soportados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion; conviene revisar los terminos del modelo base `meta-models/Muse-Glimmer-30B`.
- El despliegue esta validado para vLLM; otros runtimes pueden no soportar el formato compressed-tensors FP8_BLOCK.
- No se han publicado datos de latencia ni throughput, por lo que la planificacion de capacidad en produccion requiere pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RedHatAI/Muse-Glimmer-30B-FP8-block
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Guia de uso con vLLM: https://recipes.vllm.ai/meta-models/Muse-Glimmer-30B
- LLM Compressor: https://github.com/vllm-project/llm-compressor
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
