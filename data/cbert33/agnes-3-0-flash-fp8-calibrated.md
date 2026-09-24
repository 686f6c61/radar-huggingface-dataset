# cbert33/Agnes-3.0-Flash-FP8-Calibrated

## Resumen

Agnes-3.0-Flash-FP8-Calibrated es una cuantizacion comunitaria en FP8 del checkpoint Agnes-3.0-Flash Preview, un modelo multimodal de 33.090.501.680 parametros (33,09 B) desarrollado por Agnes AI. La publica el usuario cbert33, no esta afiliada al autor original y se distribuye bajo licencia Apache 2.0. El modelo original es un transformer hibrido orientado a codigo agéntico y orquestacion de herramientas, con una ventana de contexto de 262.144 tokens, torre visual integrada y pesos MTP adicionales.

El problema que resuelve esta version concreta es el coste de memoria: el checkpoint upstream corre en bf16 y no cabe en GPUs de 80 GB sin repartir, mientras que esta variante cuantiza pesos y activaciones a FP8 e4m3 (W8A8) con escalas estaticas per-tensor, calibradas con LLM Compressor sobre 512 muestras de `HuggingFaceH4/ultrachat_200k`. El repositorio ocupa 36,6 GB y preserva las entradas de texto, imagen y video.

Es relevante ahora por dos motivos. Primero, es una de las primeras cuantizaciones W8A8 publicadas para esta familia, con manifiesto de build reproducible y patch de SGLang incluido. Segundo, el checkpoint de lenguaje esta abliterado: la evaluacion de Heretic reporta 0/300 rechazos, lo que lo hace interesante para investigacion sobre alineacion y peligroso para despliegue en produccion sin salvaguardas externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (hybrid-attention) con atencion delta de estado recurrente, FFN fusionado y torre visual integrada; pesos MTP adicionales |
| Parametros totales | 33.090.501.680 (33,09 B) |
| Parametros activos | no disponible (no se documenta una arquitectura MoE) |
| Longitud de contexto | 262.144 tokens (checkpoint Preview) |
| Tipos de cuantizacion | FP8 e4m3 W8A8, pesos y activaciones con escalas estaticas per-tensor simetricas; checkpoint upstream en bf16 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`compressed-tensors`, `float-quantized`); MTP en `model-mtp.safetensors` sin cuantizar |

## Arquitectura y entrenamiento

El checkpoint deriva directamente de `Agnes-AI/Agnes-3.0-Flash` Preview, revision `891ce4f9ffb89b22888aa7fcc2bb2f3618867684`, sin cambios de pesos mas alla de la cuantizacion. La arquitectura usa atencion hibrida con capas de atencion delta y estado recurrente: los tensores `conv1d`, `in_proj_a` e `in_proj_b` de esas capas se mantienen en precision original porque las escalas estaticas de FP8 degradarian el lazo recurrente. Tambien quedan sin cuantizar `lm_head`, `embed_tokens`, la torre visual completa (`model.visual`) y todos los pesos MTP. El FFN original tiene dos ramas por capa (principal de anchura 17.408 y paralela de 2.048); esta version las fusiona en una sola proyeccion con `intermediate_size: 19456` y `parallel_ffn_intermediate_size: 0`, ya que las escalas estaticas per-tensor no se pueden fusionar a posteriori. La fusion en bf16 es exacta por concatenacion (gate/up en la dimension de salida, down en la de entrada).

Los datos de entrenamiento originales (numero de tokens, composicion del dataset, uso de RLHF/DPO) no estan disponibles en la informacion proporcionada. Lo que si se documenta es la receta de cuantizacion: `llm-compressor` 0.13.0 y `compressed-tensors` 0.18.0, calibracion con 512 muestras de `HuggingFaceH4/ultrachat_200k` (split `train_sft`, revision `8049631c405ae6576f93f445c6b8166f76f5505a`), longitud maxima 2048, batch 1 y semilla 42. En cuanto a numerica, el autor reporta una KL de vocabulario completo de 5,9e-4 entre el layout fusionado y el de dos ramas con los mismos pesos, por debajo del 6,5e-4 que producen stacks de inferencia independientes sobre el checkpoint sin cuantizar; la perplejidad pasa de 17,05 a 17,07 con la fusion. No hay evaluacion formal antes/despues de la conversion a FP8.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento explicito (etiqueta `reasoning`).
- Entrada multimodal: texto, imagen y video (pipeline `image-text-to-text`), con la torre visual intacta en precision original.
- Contexto largo de 262.144 tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Ejecucion de tareas de codigo: la documentacion de Agnes AI describe el modelo como orientado a codigo agéntico y ejecucion end-to-end.
- Orquestacion de herramientas y tareas guiadas por herramientas (tool orchestration), segun la documentacion oficial del modelo upstream.
- Modelo sin rechazos: la evaluacion de Heretic da 0/300 refusals, por lo que no declina peticiones daninas de forma fiable.
- Compatibilidad con vLLM y SGLang mediante `compressed-tensors`; el repositorio incluye `sglang_patch/` y `serve.sh`.

## Casos de uso

- Analisis de documentacion extensa: con 262.144 tokens de contexto se pueden procesar contratos, expedientes o bases de codigo completas en una sola pasada sin trocear y perder coherencia entre secciones.
- Atencion al cliente multi-turno: el modelo mantiene contexto largo entre interacciones y soporta entrada de imagenes, lo que permite adjuntar capturas o fotos de producto en la conversacion.
- Agente de codigo en pipelines de CI/CD: al soportar orquestacion de herramientas, puede invocarse como planificador que llama a compiladores, linters o APIs de revision dentro de un flujo automatizado.
- Descripcion y QA sobre video: el pipeline `image-text-to-text` acepta video, util para generar subtitulos, resumentes de metraje o responder preguntas sobre contenido audiovisual.
- Investigacion sobre alineacion y abliteration: al documentarse 0/300 rechazos, sirve como caso de estudio controlado sobre comportamiento de modelos sin rechazo, siempre en entornos aislados.
- Despliegue con restriccion de VRAM: la cuantizacion W8A8 reduce el peso a aproximadamente un byte por parametro, lo que permite servir un modelo de 33 B en una sola GPU de 80 GB donde la version bf16 requeriria reparto.
- Extraccion de informacion estructurada de PDFs e imagenes escaneadas: combinando vision y contexto largo se pueden convertir lotes de documentos en JSON o tablas sin pipelines OCR separados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card menciona que el checkpoint upstream incluye cifras de benchmark, pero no las reproduce y advierte que describen el checkpoint Preview antes de la cuantizacion. Los unicos datos numericos disponibles son internos al proceso de cuantizacion:

| Metrica | Valor | Contexto |
|---|---|---|
| KL de vocabulario completo | 5,9e-4 | Layout fusionado frente a layout de dos ramas, mismos pesos |
| KL de stacks independientes | 6,5e-4 | Referencia del mismo checkpoint sin cuantizar |
| Perplejidad (antes de fusion) | 17,05 | Checkpoint sin cuantizar |
| Perplejidad (despues de fusion) | 17,07 | Layout fusionado |
| Rechazos (Heretic) | 0/300 | Evaluacion del comportamiento de rechazo |

No existe una evaluacion formal antes/despues de la conversion a FP8; el propio autor recomienda ejecutar benchmarks propios antes de confiar en el modelo para una carga de trabajo.

## Requisitos de hardware

- VRAM estimada: los pesos FP8 ocupan aproximadamente 33 GB, pero la torre visual, `embed_tokens`, `lm_head` y los pesos MTP permanecen en bf16, por lo que el repositorio completo pesa 36,6 GB. Con cache KV para contexto largo hay que sumar varios GB adicionales; se recomienda partir de 48 GB de VRAM y, para contextos cercanos a 262.144 tokens, de 80 GB.
- GPUs recomendadas: una H100 80 GB o una A100 80 GB permiten el despliegue en una sola tarjeta. Una L40S de 48 GB puede ir justa dependiendo de la longitud de contexto.
- Una A100 de 40 GB probablemente no es suficiente por el peso de los tensores en bf16 y la cache KV.
- En GPU de consumo: no cabe en una RTX 4090 de 24 GB. Seria necesario repartir entre 2x RTX 4090 (48 GB) con paralelismo tensorial, asumiendo la penalizacion de ancho de banda entre tarjetas.
- Opciones de despliegue: vLLM y SGLang (el repositorio incluye `sglang_patch/` y `serve.sh`), ambos capaces de leer `compressed-tensors float-quantized`. Tambien es cargable con `transformers` gracias al codigo de modelado custom `*_agnes.py`. No hay pesos GGUF, por lo que llama.cpp y Ollama no estan soportados con esta publicacion.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cbert33/Agnes-3.0-Flash-FP8-Calibrated (este) | 33,09 B | 262.144 | FP8 W8A8 estatica | Apache 2.0 | HuggingFace, 0 descargas y 1 like |
| Agnes-AI/Agnes-3.0-Flash (Preview, upstream) | 33 B | 262.144 | bf16 | Apache 2.0 | HuggingFace, checkpoint oficial |
| ProCreations/Agnes-3.0-Flash-FP8 | no disponible | no disponible | FP8 | no disponible | HuggingFace |
| Agnes 3.0 Flash produccion/API | no disponible | 1.000.000 | no aplica (servicio) | no disponible | API, no pesos abiertos |

La diferencia principal frente al upstream es el formato de pesos: la version de cbert33 ocupa menos memoria y esta lista para motores que entienden `compressed-tensors`, mientras que el checkpoint oficial conserva bf16 y no necesita calibracion. Frente a ProCreations/Agnes-3.0-Flash-FP8, la informacion publica disponible no permite comparar receta de cuantizacion ni calidad. El modelo de produccion de Agnes AI usa un checkpoint distinto con contexto de 1M tokens, y sus cifras de benchmark no deben atribuirse a estos pesos.

## Limitaciones y advertencias

- Modelo abliterado y sin rechazos (0/300 en la evaluacion de Heretic). No cabe esperar que decline peticiones daninas; es obligatorio aplicar salvaguardas a nivel de aplicacion.
- La propia model card indica que es un modelo sin censura y que se entrega sin garantia, para uso exclusivamente de investigacion y no destinado a produccion. Esto entra en tension con la licencia Apache 2.0, que si permite uso comercial: conviene revisar la implicacion legal antes de desplegarlo.
- No hay evaluacion formal antes/despues de la conversion a FP8. La receta usa escalas estaticas per-tensor, menos robustas que las dinamicas ante cambios en la distribucion de activaciones. Haz tus propias pruebas.
- Riesgo de alucinacion no cuantificado; no hay benchmarks publicados en esta ficha.
- Idiomas limitados a ingles y chino. El rendimiento en castellano no esta documentado.
- Confusion de versiones: el checkpoint Preview de 262.144 tokens es distinto del modelo de produccion de 1M tokens. No atribuyas a estos pesos los resultados de Artificial Analysis.
- Cuantizacion comunitaria no afiliada a Agnes AI; el autor original no respalda esta build.
- Validacion practicamente nula por la comunidad: 0 descargas y 1 like en el momento de redactar la ficha.
- Requiere cargar codigo de modelado custom (`*_agnes.py`) y una version concreta de `transformers`; versiones futuras pueden romper la compatibilidad.

## Enlaces

- Repositorio del modelo: https://huggingface.co/cbert33/Agnes-3.0-Flash-FP8-Calibrated
- Checkpoint upstream: https://huggingface.co/Agnes-AI/Agnes-3.0-Flash
- Cuantizacion FP8 alternativa: https://huggingface.co/ProCreations/Agnes-3.0-Flash-FP8
- Web oficial de Agnes AI: https://agnes-ai.com/
- Documentacion de Agnes 3.0 Flash: https://wiki.agnes-ai.com/en/docs/agnes-30-flash
- Repositorio GitHub: https://github.com/AgnesAI-Labs/Agnes-3.0-Flash
- README en GitHub: https://github.com/AgnesAI-Labs/Agnes-3.0-Flash/blob/main/README.md
- Ficha en Artificial Analysis: https://artificialanalysis.ai/models/agnes-3-0-flash
