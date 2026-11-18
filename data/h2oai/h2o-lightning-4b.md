# h2oai/h2o-lightning-4b

## Resumen

H2O-Lightning-4B es un modelo de decisión de 4B parámetros desarrollado por H2O.ai sobre la base de Qwen/Qwen3.5-4B. No es un modelo conversacional generalista: responde preguntas de decisión tipadas sobre un registro (un documento, un ticket, una política, una conversación) y sobre imágenes asociadas a ese registro (fotos, capturas de pantalla, documentos escaneados, gráficos). Devuelve una probabilidad para cada opción en tres formatos: elección entre opciones nombradas (choice), probabilidad de que un enunciado sea cierto (yes/no) y nivel ordinal sobre una escala declarada con su distribución de probabilidad (score).

El modelo está orientado a la calibración: cada decisión es un único forward pass y un único token de salida, de modo que el coste es solo de tokens de entrada. Es multimodal (pipeline image-text-to-text) y está pensado para integrarse en sistemas de decisión automatizada donde importa más la probabilidad calibrada que el texto libre generado.

Su relevancia actual radica en que encabeza varios rankings de la familia Jev-class en ImageJevBench v0.3.0 y JevBench (board de 2026-10-28), por delante de alternativas de mayor tamaño y de sistemas API propietarios. La licencia es Apache 2.0 y el modelo base es Qwen3.5-4B, con 4.659.865.088 parámetros reales según safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivada de Qwen/Qwen3.5-4B (detalle de capas y atención no disponible) |
| Parametros totales | 4.659.865.088 |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (llama.cpp) y MLX 8-bit y 4-bit (variantes publicadas por terceros); cuantizaciones adicionales no disponibles |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF; MLX (q8 y q4) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal de tipo image-text-to-text, y se ha afinado como modelo de decisión. La model card no detalla la composición del dataset de entrenamiento, el número de tokens ni si se emplearon técnicas de RLHF o DPO; esa información no está disponible.

La innovación técnica destacable es el formato de salida tipado: el modelo emite una probabilidad por opción en lugar de texto libre, lo que permite calibración directa. Además, el paquete de servicio recomendado incluye una build propia de vLLM 0.30.0 con atención por petición y un shim de librería estándar (`h2o_lightning_shim.py`) que permite "lectura bidireccional" (two-way reading) por petición. Según la model card, esta configuración puntúa 206 de los 231 ítems públicos de JevBench, frente a 202 con vLLM estándar en lectura unidireccional. El coste por decisión es un forward pass y un token de salida.

## Capacidades

- Decisión tipada con salida probabilística en tres modos: choice (elegir entre opciones nombradas), yes/no (probabilidad de que un enunciado sea cierto) y score (nivel ordinal con distribución de probabilidad).
- Procesamiento multimodal: acepta imágenes junto al registro (fotos, capturas, documentos escaneados, gráficos).
- Razonamiento sobre registros documentales: tickets, políticas, conversaciones y documentos.
- Calibración de probabilidades como capacidad central, no como subproducto.
- Soporte de lectura bidireccional y unidireccional por petición mediante el motor de servicio recomendado.
- Tool calling, function calling, agentes multi-paso y modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües específicas: no disponible.

## Casos de uso

- Triaje de tickets de soporte: dado un ticket y su categoría de destino, el modelo devuelve la probabilidad de cada cola o nivel de urgencia, lo que permite enrutar con umbrales configurables en lugar de con reglas fijas.
- Moderación de contenido con umbral calibrado: usando el modo yes/no, se obtiene la probabilidad de que un texto o una imagen incumpla una política concreta, y el equipo fija el punto de corte según su tolerancia a falsos positivos.
- Clasificación de documentos escaneados: al aceptar imágenes, puede procesar facturas, formularios o capturas y asignar una categoría con su distribución de probabilidad, lo que facilita la revisión humana de los casos de baja confianza.
- Evaluación de riesgo en seguros o crédito: el modo score devuelve un nivel ordinal sobre una escala declarada con su distribución, útil para bandas de riesgo y para auditar la incertidumbre de cada decisión.
- Verificación de políticas internas: dado un fragmento de una política y un caso concreto, el modelo estima la probabilidad de cumplimiento, lo que permite priorizar revisiones en lugar de revisar todo.
- Automatización de computer-use: según la model card, encabeza la pista de computer-use de ImageJevBench entre los modelos open-weight Jev-class, por lo que puede decidir la siguiente acción sobre una captura de pantalla con probabilidades por acción.
- Enrutamiento en pipelines de agentes: al coste de un forward pass y un token de salida, puede actuar como cabecera de decisión barata que selecciona la herramienta o el subagente adecuado antes de invocar un modelo mayor.

## Benchmarks y rendimiento

Resultados publicados en la model card (ImageJevBench edition v0.3.0, página leída el 2026-10-31, fila de la release v1.4.1 @d7f1b05a, medida el 2026-10-28 con temperatura de imagen 1.0; JevBench board de 2026-10-28, fila de la release v1.1, medida el 2026-10-04):

| Benchmark | Posicion | Ambito | Comparativa citada |
|---|---|---|---|
| ImageJevBench, Composite | #1 de 46 | open-weight Jev-class (#2 de 55 incluyendo API) | Drex Max 44,65; Jev 1.13.0 + images 26,43; Clef-Flash 20,41; Liquid d1-3B 4,10 |
| ImageJevBench, Intelligence | #2 de 46 | open-weight Jev-class (#6 de 55 incluyendo API) | Clef 47,40; Liquid d1-3B 16,31 |
| ImageJevBench, Capability | #2 de 46 | open-weight Jev-class (#6 de 55 incluyendo API) | Clef 58,08; Liquid d1-3B 47,78 |
| JevBench, Composite | #2 de 170 | open-weight Jev-class (#12 de 201 incluyendo API) | d1 (Liquid AI) 72,82; Microsoft-Decision-1 69,08; OpenAI Decisions 62,37; pplx-decider-flash 54,01 |
| ImageJevBench, Box track (PREVIEW), Box Capability | #1 de 4 | open-weight Jev-class systems (#1 de 5 incluyendo API) | Jev 1.14.0 (TypeSafe) 75,71 |
| ImageJevBench, computer-use track, Composite | #1 de 46 | open-weight Jev-class systems (#3 de 55 incluyendo API) | Liquid d1-3B 66,22; Clef-Flash 55,29 |

Puntuación de ítems públicos de JevBench: 206 de 231 con la build propia de vLLM y lectura bidireccional; 202 de 231 con vLLM estándar en lectura unidireccional. NetProjects reporta 205/231 en lectura bidireccional y 201 en unidireccional para sus variantes MLX. No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks de propósito general en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la model card. Con 4.659.865.088 parámetros, en FP16/BF16 el peso ronda los 9,3 GB; en 8-bit, unos 4,7 GB; en 4-bit, unos 2,3 GB. Estas cifras son estimaciones por tamaño y no incluyen caché KV ni el codificador visual.
- GPU recomendadas: no disponible en la información proporcionada. El despliegue de referencia es vLLM 0.30.0, lo que implica GPUs de datacenter (A100, H100 y equivalentes) como opción soportada por el motor.
- GPU de consumo: las variantes MLX q8 y q4 de NetProjects están pensadas para Apple silicon; la variante GGUF permite llama.cpp en GPUs de consumo, aunque no se publican requisitos mínimos.
- Opciones de despliegue: build propia de vLLM 0.30.0 con `serve.sh` (recomendado, lectura bidireccional), vLLM estándar 0.30.0 con `TWO_WAY=0` (lectura unidireccional, usa prefix cache y sirve más peticiones por segundo bajo carga), llama.cpp vía GGUF, MLX en Apple silicon y transformers.
- Latencia y throughput: no disponibles de forma numérica. La model card indica que cada decisión es un forward pass y un token de salida, por lo que el coste es solo de tokens de entrada.
- Repo de 74,5 GB, lo que incluye pesos en varios formatos y los ficheros de servicio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (Composite) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| H2O-Lightning-4B | 4,66B | No disponible | #1 de 46 ImageJevBench open-weight; #2 de 170 JevBench open-weight | Apache 2.0 | Hugging Face, GGUF, MLX, Space |
| Liquid d1-3B | No disponible (3B por nombre) | No disponible | 4,10 en ImageJevBench Composite; 66,22 en computer-use | No disponible | No disponible |
| Microsoft-Decision-1 | No disponible | No disponible | 69,08 en JevBench Composite | No disponible | No disponible |
| OpenAI Decisions | No disponible | No disponible | 62,37 en JevBench Composite | Propietaria (API) | API |
| pplx-decider-flash (Perplexity) | No disponible | No disponible | 54,01 en JevBench Composite | Propietaria (API) | API |
| Drex Max (Nace AI) | No disponible | No disponible | 44,65 en ImageJevBench Composite | No disponible | No disponible |
| Clef-Flash (Cloudflare) | No disponible | No disponible | 20,41 en ImageJevBench Composite; 55,29 en computer-use | No disponible | No disponible |

Los datos de parámetros, contexto y licencia de los competidores no aparecen en la información proporcionada; solo se dispone de sus puntuaciones citadas en la model card.

## Limitaciones y advertencias

- Modelo de decisión, no de generación: no está diseñado para diálogo abierto, redacción ni generación de código; forzarlo a esos usos degradará la calidad.
- Sesgos: no se documentan sesgos conocidos en la información disponible; al derivar de Qwen3.5-4B, hereda los sesgos del modelo base, que tampoco se detallan.
- Alucinación: el formato de salida es probabilístico y acotado a opciones, lo que reduce el riesgo de texto inventado, pero la calibración puede degradarse fuera de la distribución de los datos de entrenamiento; no se publican métricas de calibración por dominio.
- Idiomas: no se especifican los idiomas soportados, lo que impide garantizar calidad fuera del inglés sin evaluación previa.
- Contexto: la longitud de contexto no está disponible, un dato crítico para decidir si admite registros largos.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales conocidas, pero conviene revisar los términos del modelo base Qwen3.5-4B.
- Dependencia del motor: la puntuación de 206/231 requiere la build propia de vLLM; con vLLM estándar baja a 202/231 y las variantes MLX q4 solo soportan lectura unidireccional.
- Benchmarks propietarios: JevBench e ImageJevBench son boards de la propia familia Jev-class; los resultados no son directamente comparables con benchmarks de propósito general.
- Repo de 74,5 GB: el almacenamiento y la descarga son un coste operativo relevante frente a los ~9 GB de pesos en FP16.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/h2oai/h2o-lightning-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/h2oai/h2o-lightning-4b
- GGUF para llama.cpp: https://huggingface.co/h2oai/h2o-lightning-4b-gguf
- MLX 8-bit (NetProjects): https://huggingface.co/netprojects/h2o-lightning-4b-mlx-q8
- MLX 4-bit (NetProjects): https://huggingface.co/netprojects/h2o-lightning-4b-mlx-q4
