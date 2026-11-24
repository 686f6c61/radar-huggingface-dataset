# brainworkup/Qwythos-9B-v3-Claude-Mythos-5-1M-MLX-oQ8-mtp

## Resumen

Qwythos-9B-v3-Claude-Mythos-5-1M-MLX-oQ8-mtp es una cuantizacion en formato MLX del modelo Qwythos-9B-Claude-Mythos-5-1M, desarrollado originalmente por Empero AI sobre la familia arquitectonica Qwen3.5. Esta version concreta la publica el usuario brainworkup y aplica la cuantizacion mixta oQ8 de oMLX, que preserva la mayor parte de las capas a una calidad cercana a bf16, ademas de incorporar una cabeza de Multi-Token Prediction (MTP) integrada para decodificacion especulativa acelerada en Apple Silicon.

El modelo resuelve el problema de ejecutar localmente un modelo de ~9.650 millones de parametros con una ventana de contexto de 1.048.576 tokens en hardware de Apple, algo inviable con los pesos en bf16 completos. La cuantizacion oQ8 reduce el repositorio a 10,7 GB distribuidos en tres shards de safetensors, manteniendo la fidelidad numerica lo mas alta posible dentro de la familia oQ.

Es relevante ahora porque combina tres tendencias tecnicas: contexto ultralargo (1M tokens), decodificacion especulativa mediante MTP y soporte de tool calling y flujos agenticos. La contrapartida es una dependencia estricta de oMLX: ni mlx-lm, ni mlx-vlm, ni LM Studio soportan la cabeza MTP y fallan al cargar los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido estilo Qwen3.5 con cabeza MTP (1 capa) |
| Parametros totales | 9.653.104.368 (~9,65B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | oQ8 (cuantizacion mixta inteligente de oMLX, 8 bits) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), 3 shards; tokenizer.json; chat_template.jinja |
| Tamano del repositorio | 10,7 GB |
| Libreria | mlx (requiere oMLX para MTP) |
| Modelo base | empero-ai/Qwythos-9B-Claude-Mythos-5-1M; xunkutech-ai/Qwythos-9B-Claude-Mythos-5-1M-MLX-bf16-mtp |
| Muestreo recomendado | temperature 0.6, top_p 0.95, top_k 20, repetition_penalty 1.05, max_tokens 4096 |

## Arquitectura y entrenamiento

La arquitectura es un transformer de texto con atencion hibrida al estilo Qwen3.5, segun la model card, con una cabeza MTP embebida de una sola capa (`mtp_num_hidden_layers: 1`). Esa cabeza permite decodificacion especulativa: el modelo propone varios tokens candidatos por paso y el modelo principal los verifica, reduciendo el numero de pasos de decodificacion en Apple Silicon. El config.json ocupa aproximadamente 3,3 KB e incluye la configuracion oQ8 junto con el parametro de la cabeza MTP.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o similares. La model card tampoco detalla innovaciones adicionales de atencion mas alla de la etiqueta de atencion hibrida. Lo que si es verificable es el proceso de cuantizacion: oQ8 es la variante de mayor fidelidad de la familia oQ de oMLX, conservando mas capas en precision cercana a bf16 a cambio de mayor consumo de memoria. Los shards 1 y 2 pesan aproximadamente 5,0 GB cada uno y el tercero unos 0,7 GB, e incluye la cabeza MTP.

## Capacidades

- Generacion de texto conversacional en ingles con plantilla de chat propia (`chat_template.jinja`).
- Razonamiento explicito (tag `reasoning`) y soporte de contexto ultralargo de hasta 1.048.576 tokens.
- Function calling y tool use, con etiquetas especificas para flujos agenticos.
- Razonamiento multi-paso orientado a agentes.
- Dominios especializados declarados: ciberseguridad y biomedico.
- Decodificacion acelerada mediante MTP en hardware Apple Silicon a traves de oMLX.
- Capacidades multimodales no confirmadas: aunque el tag incluye `mlx-vlm`, la model card describe el modelo como "text model" y no detalla entrada de imagen.
- Multilingue limitado: la model card declara unicamente ingles.

## Casos de uso

- Analisis de documentos tecnicos extensos: con 1M tokens de contexto se puede cargar un repositorio de codigo completo o un corpus de informes y formular preguntas sobre el conjunto sin trocear el material.
- Asistente de ciberseguridad local: el modelo declara especializacion en cybersecurity, por lo que puede usarse para triaje de alertas, resumen de informes de vulnerabilidades y generacion de reglas de deteccion en un entorno sin conexion.
- Apoyo a investigacion biomedica: resumen y extraccion de entidades en literatura cientifica larga, aprovechando la ventana de contexto para mantener varios articulos simultaneamente.
- Agente con tool calling en macOS: integrado via oMLX, puede encadenar llamadas a funciones en flujos multi-paso para automatizar tareas de escritorio o consultas a APIs internas.
- Prototipado de agentes en local: util para desarrolladores que quieran validar pipelines agenticos en Apple Silicon antes de desplegarlos en infraestructura con GPU.
- Generacion de codigo asistida en el editor: el soporte de function calling y la ventana de 1M permiten incluir el contexto del proyecto y las definiciones de herramientas en la misma peticion.
- Procesamiento por lotes de textos largos: con MTP y oQ8, el coste por token en un Mac con memoria unificada puede ser competitivo frente a APIs externas para volumenes moderados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio pesa 10,7 GB; en la practica se necesita memoria suficiente para los pesos mas la cache KV del contexto utilizado. Con 1M tokens de contexto, la cache KV puede crecer de forma muy significativa y superar ampliamente el tamano de los pesos.
- Hardware objetivo: Apple Silicon con memoria unificada. Un Mac con 24 GB o 32 GB puede cargar el modelo con contextos moderados; para contextos de cientos de miles de tokens se requiere configuracion de 64 GB o superior.
- GPU NVIDIA: no aplicable de forma nativa, ya que el formato es MLX. No se documenta conversion a CUDA.
- Consumer GPU: no cabe en GPUs NVIDIA de consumo mediante este repositorio; requeriria otra cuantizacion y otro runtime.
- Despliegue: exclusivamente via oMLX (`pip install -U git+https://github.com/jundot/omlx.git` y `omlx serve --model <ruta>`). mlx-lm, mlx-vlm y LM Studio no soportan la cabeza MTP y fallan con `ValueError: Received 15 parameters not in model: language_model.mtp.*`.
- Latencia y throughput: no disponibles. La model card solo afirma que MTP acelera la decodificacion especulativa, sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Qwythos-9B-v3-Claude-Mythos-5-1M-MLX-oQ8-mtp | ~9,65B | 1.048.576 | MLX oQ8, requiere oMLX | Apache-2.0 | Version cuantizada con MTP |
| xunkutech-ai/Qwythos-9B-Claude-Mythos-5-1M-MLX-bf16-mtp | no disponible (mismo modelo base) | 1.048.576 | MLX bf16 | Apache-2.0 | Mayor fidelidad, mayor consumo de memoria |
| empero-ai/Qwythos-9B-Claude-Mythos-5-1M | ~9B (segun model card) | 1.048.576 | safetensors originales | Apache-2.0 | Modelo de referencia sin cuantizar |

No se dispone de datos de rendimiento comparado con otras familias, por lo que la comparativa se limita a variantes del mismo modelo.

## Limitaciones y advertencias

- Dependencia estricta de oMLX: cualquier intento de cargar el modelo con mlx-lm, mlx-vlm o LM Studio falla por los parametros `language_model.mtp.*`.
- Solo ingles declarado; el rendimiento en castellano no esta documentado y previsiblemente sera inferior.
- La ventana de 1M tokens es nominal; la cache KV a esa longitud exige mucha memoria y puede degradar la calidad de recuperacion en el centro del contexto.
- Riesgo de alucinacion no cuantificado: no hay benchmarks publicados que permitan estimar la fiabilidad factual.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de seguridad.
- La especializacion declarada en ciberseguridad y biomedico no viene acompanada de metricas; no debe asumirse precision clinica ni de seguridad sin validacion propia.
- Licencia Apache-2.0 permite uso comercial, pero al ser una cuantizacion de terceros conviene verificar la licencia del modelo base original antes de desplegar.
- Modelo de autor individual (brainworkup) sin historial de mantenimiento amplio: 402 descargas y 0 likes en el momento de la consulta.
- El tag `mlx-vlm` sugiere capacidades de vision que la model card no confirma; no debe asumirse entrada multimodal.

## Enlaces

- Hugging Face: https://huggingface.co/brainworkup/Qwythos-9B-v3-Claude-Mythos-5-1M-MLX-oQ8-mtp
- Modelo base original: https://huggingface.co/empero-ai/Qwythos-9B-Claude-Mythos-5-1M
- Modelo base MLX bf16 con MTP: https://huggingface.co/xunkutech-ai/Qwythos-9B-Claude-Mythos-5-1M-MLX-bf16-mtp
- Repositorio oMLX: https://github.com/jundot/omlx
