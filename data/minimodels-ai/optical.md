# minimodels-ai/optical

## Resumen

Minimodels Optical es un modelo multimodal de decisión desarrollado por minimodels-ai, publicado bajo licencia Apache 2.0 y orientado a tareas de elección (`choice`), puntuación (`score`) y decisión analítica (`noul`) sobre entradas de texto e imagen. No es un modelo conversacional generalista al uso: su model card lo describe como un "decision model" calibrado, con un runtime HTTP propio que expone los endpoints `/v1/systemone`, `/systemone` y `/health`, y está pensado para desplegarse como contenedor Docker completamente offline (`--network none`).

El modelo parte de la arquitectura Gemma 4 (etiqueta `gemma4` en Hugging Face) con 31.273.088.876 parámetros totales según los pesos en safetensors, y un repositorio de 67,9 GB que incluye los shards BF16 fusionados, el tokenizer y processor, los pesos del drafter especulativo (`speculator/`) y las configuraciones de calibración. La innovación principal es su perfil de servicio: un runtime especulativo paralelo por bloques con CUDA Graphs y proyecciones en FP8 (E4M3), junto con un encoder de visión en BF16 de 16 bits.

Su relevancia actual reside en la combinación de tres factores poco habituales en modelos abiertos: calibración explícita de decisiones, razonamiento analítico con auto-consistencia ante trazas incompletas y un presupuesto de tokens de visión adaptativo (560 tokens en consultas estándar, 1.120 en gráficos densos, tablas financieras, recibos o diagramas geométricos). Está claramente orientado a pipelines de evaluación y decisión automatizada más que a generación libre de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Gemma 4, con encoder de visión BF16 y proyecciones del modelo de lenguaje en FP8 (E4M3) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 E4M3 (runtime FastFP8) y BF16 (pesos publicados); no se documentan GGUF ni otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (shards BF16 fusionados) |

## Arquitectura y entrenamiento

La arquitectura es un transformer multimodal derivado de Gemma 4 con dos componentes diferenciados: un encoder de visión y proyector en BF16 de 16 bits, y las proyecciones del modelo de lenguaje ejecutadas en FP8 E4M3 sobre Tensor Cores. El runtime incorpora fusión de `RMSNorm`, cuantización de activaciones con entrada compartida y ejecución con CUDA Graphs y KV estático, lo que reduce la sobrecarga de lanzamiento de kernels en inferencia por lotes.

El mecanismo de decisión se apoya en una lectura bidireccional con atención prompt/opción usando un token `<bos>` como sumidero (implementada con PyTorch SDPA), puntuación de dos órdenes con eliminación del sesgo de posición y razonamiento paso a paso condicionado por incertidumbre. Incluye recuperación por auto-consistencia con opciones invertidas cuando la traza de razonamiento está incompleta, protección determinista contra repeticiones en línea y límites de tiempo de reloj por petición. El despliegue usa un drafter especulativo paralelo por bloques (`speculator/`) con verificación contra el modelo objetivo. No se han publicado en la información disponible detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Decisión multimodal sobre texto e imagen: modos `choice` (selección entre opciones), `score` (puntuación calibrada) y `noul` (razonamiento analítico).
- Procesamiento de imágenes en formatos BMP, PNG, JPEG, WEBP, TIFF y GIF, con soporte de orientación EXIF, escala de grises de 16 bits y RGBA transparente compuesto sobre blanco.
- Presupuesto de tokens de visión adaptativo: 560 tokens en consultas estándar y 1.120 en gráficos densos, tablas financieras, recibos, documentos altos y diagramas geométricos.
- Reutilización de embeddings de visión en caché entre múltiples pasadas de orden y razonamiento (un único forward del encoder de visión por petición).
- Razonamiento paso a paso con puerta de incertidumbre y auto-consistencia con opciones invertidas.
- Servicio HTTP con endpoints `/health`, `/healthz`, `/v1/health`, `/v1/models`, `/v1/systemone`, `/systemone`, `/v1/systemone/decide`, `/v1/decide` y `/decide`.
- Despliegue offline autocontenido en Docker sin acceso a red.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, audio ni modo thinking explícito.

## Casos de uso

- Evaluación automatizada de respuestas con rúbrica: el modo `score` permite puntuar respuestas de texto o imagen de forma calibrada, adecuado para pipelines de evaluación de modelos o de control de calidad.
- Selección entre opciones en formularios y documentos: el modo `choice` con atención bidireccional prompt/opción sirve para clasificación de alternativas en capturas de pantalla o formularios escaneados.
- Procesamiento de recibos y tablas financieras: el presupuesto de 1.120 tokens de visión en documentos densos y el soporte de TIFF y escala de grises de 16 bits lo hacen apto para extracción y decisión sobre documentos contables.
- Análisis de diagramas geométricos y gráficos: la escalada automática de tokens de visión en diagramas y charts permite responder preguntas de decisión sobre figuras técnicas.
- Despliegue en entornos aislados: el contenedor Docker con `--network none` y todos los pesos incluidos permite operar en infraestructuras sin salida a internet, como entornos regulados o de defensa.
- Moderación y decisión de contenido multimodal: la combinación de `choice` y `score` calibrados puede integrarse en sistemas de revisión que necesiten una decisión discreta con puntuación de confianza.
- Enrutamiento de consultas en pipelines RAG multimodales: la decisión sobre qué opción o documento es relevante para una consulta con imagen puede delegarse a este modelo con límites de tiempo de reloj por petición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 31.273.088.876 parámetros, los pesos en BF16 ocupan aproximadamente 62,5 GB; el repositorio completo son 67,9 GB, por lo que se requiere al menos una GPU con 80 GB de memoria para cargar los shards BF16 completos.
- El runtime usa proyecciones FP8 E4M3, lo que reduce el peso efectivo del modelo de lenguaje frente a BF16, pero no se documenta la VRAM final en ejecución.
- GPU recomendadas: no disponibles en la información. Por tamaño, encajan A100 80 GB o H100 80 GB; no se confirma compatibilidad con GPUs de consumo.
- No se indica que quepa en GPUs de consumo (RTX 4090 de 24 GB no sería suficiente para los pesos BF16 completos).
- Opciones de despliegue: contenedor Docker propio con `docker build -t minimodels-optical .` y `docker run --rm --gpus all --network none -p 8000:8000 minimodels-optical`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: el arranque en frío tarda aproximadamente 35-90 s hasta que `GET /health` devuelve `{"ready": true}`. No se publican cifras de throughput ni latencia por petición.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (modelos de decisión multimodales calibrados con runtime HTTP propio) en la documentación proporcionada. Como referencia de tamaño, el modelo comparte la familia Gemma 4 con otros modelos abiertos de esa arquitectura, pero no se aportan datos de rendimiento que permitan una comparación rigurosa.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Minimodels Optical | 31,27 B | no disponible | Apache 2.0 | safetensors |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de decisión, no de generación libre: la model card no documenta capacidades conversacionales generales ni de generación de texto abierto, por lo que no debe emplearse como sustituto de un LLM conversacional.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento multilingüe ni siquiera en castellano.
- Longitud de contexto no disponible: no se puede planificar el uso con documentos largos sin verificación empírica previa.
- Riesgo de alucinación no evaluado: no se publican benchmarks ni evaluaciones de fidelidad, por lo que la calibración declarada debe validarse en el dominio de despliegue.
- Sesgos no documentados: no se aporta información sobre sesgos demográficos, culturales o de dominio.
- Requisitos de hardware elevados: los pesos BF16 completos requieren del orden de 62,5 GB, lo que limita el despliegue a GPUs de 80 GB o a configuraciones multi-GPU no documentadas.
- Dependencia de un runtime propietario: el modelo está diseñado para ejecutarse con su contenedor Docker y endpoints propios; no se documenta interoperabilidad con servidores de inferencia estándar como vLLM o TGI.
- Arranque en frío lento: entre 35 y 90 s antes de aceptar tráfico, lo que exige sondas de salud adecuadas en orquestadores.
- Licencia Apache 2.0: permite uso comercial, pero debe revisarse `NOTICES.md` para las atribuciones de terceros.
- Fecha de creación futura (2026-11-28) en los metadatos: conviene verificar la vigencia y el mantenimiento del repositorio antes de adoptarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/minimodels-ai/optical
- Licencia Apache 2.0: https://huggingface.co/minimodels-ai/optical/blob/main/LICENSE
- Atribuciones de terceros: https://huggingface.co/minimodels-ai/optical/blob/main/NOTICES.md
