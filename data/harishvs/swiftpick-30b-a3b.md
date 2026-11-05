# harishvs/swiftpick-30B-A3B

## Resumen

swiftpick-30B-A3B es un adaptador LoRA (con una cabeza de lectura ligera) entrenado sobre el modelo base `nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16`. No es un modelo generativo al uso: es un "modelo de decisión" diseñado para elegir entre conjuntos de opciones y puntuar elementos en una escala, devolviendo en cada respuesta una confianza calibrada. Está pensado para encajar en flujos agénticos donde un LLM completo resulta sobredimensionado: enrutamiento de modelos, selección de herramientas, verificación de argumentos, triaje, guardarraíles y evaluaciones automáticas.

El autor (harishvs) lo publica junto al framework `strands-decider` (licencia Apache-2.0), del que este checkpoint depende para cargarse. El modelo hereda la licencia del base, el NVIDIA Open Model Agreement. La arquitectura subyacente es la del Nemotron-3 Nano (transformer híbrido con capas Mamba, según la referencia a `nemotron_h` y a los kernels Mamba en la model card), con 31B parámetros totales en el torso y aproximadamente 3B activos por token (configuración MoE A3B).

La relevancia actual es doble: por un lado, propone separar las decisiones "rutinarias" de un agente (clasificar, elegir, puntuar) de la generación libre de un LLM; por otro, ofrece confianza calibrada y tipado de decisiones (`noul`, `choice`, `score`), algo poco común en modelos de clasificación convencionales. El checkpoint es solo texto: aunque el base es multimodal, este adaptador usa únicamente el decodificador de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (familia Nemotron-H, con capas Mamba) sobre `nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16`; adaptador LoRA + cabeza de lectura |
| Parametros totales | 31B en el torso (62,5 GB en bfloat16); el adaptador LoRA se publica a rango 64 por ejecución y rango 192 en el "soup" de las tres |
| Parametros activos | ~3B (designación A3B del base) |
| Longitud de contexto | No disponible como valor nominal; las evaluaciones se sirven con ventana de 4096 tokens |
| Tipos de cuantizacion | No disponible (los pesos se publican en bfloat16; el repo pesa 0,6 GB porque contiene el adaptador, no el torso) |
| Idiomas soportados | No disponible |
| Licencia | NVIDIA Open Model Agreement (modelo derivado del base de NVIDIA) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El checkpoint es un adaptador LoRA de PEFT sobre el decodificador de texto de Nemotron-3 Nano Omni 30B-A3B. La arquitectura base es un transformer híbrido de la familia Nemotron-H, que combina capas de atención con capas Mamba; la model card indica que en un host CUDA se requieren los kernels Mamba precompilados para poder cargar el modelo (en CPU funciona la ruta lenta de PyTorch). Sobre el torso se añade una cabeza de lectura pequeña que puntúa las opciones de una pregunta tipada: `noul` (sí/no), `choice` (una entre N opciones) y `score` (nivel en una escala ordenada).

El entrenamiento usa el inventario de datos de "hobson-v21" descrito en el repositorio de código, excluyendo las 12.263 filas de tareas de código de las releases v1 (no públicas). Los datasets citados cubren clasificación de temas (arxiv-classification, ag_news, dbpedia_14, 20_newsgroups, yahoo_answers_topics), intención y diálogo (clinc_oos, banking77, amazon_massive_intent), emoción y sentimiento (emotion, sst5, yelp_review_full), NLI y QA (paws, boolq, PubMedQA, hotpot_qa, Boardgame-QA, ruletaker), moderación (civil_comments, measuring-hate-speech, sms_spam), idioma y estilo (language-identification, pavlick-formality-scores), además de HelpSteer2. Cada una de las tres ejecuciones usa rango LoRA 64 (frente al rango 16 de las releases v1). No se detalla en la información disponible el volumen de tokens, la composición exacta ni si hubo RLHF/DPO; el enfoque es supervisado sobre tareas de decisión con calibración.

## Capacidades

- Clasificación de texto y decisión tipada: responde preguntas de sí/no (`noul`), elección entre N opciones (`choice`) y puntuación en escala ordenada (`score`).
- Confianza calibrada en cada respuesta, pensada para umbrales y guardarraíles en producción.
- Enrutamiento de modelos y selección de herramientas dentro de un agente (decidir qué modelo o qué tool usar para una petición).
- Verificación de argumentos y comprobación de precondiciones antes de ejecutar una acción.
- Triaje y priorización (soporte, moderación, colas de revisión).
- Evaluación automática de salidas de otros modelos (adecuación, calidad) mediante puntuaciones en escala.
- Solo texto: no usa las capacidades multimodales del base.
- Multilingüe: no confirmado; los idiomas soportados figuran como no disponibles.
- No es un modelo generativo: no produce texto libre, solo etiquetas, elecciones y puntuaciones.

## Casos de uso

- Enrutamiento de modelos en una plataforma multi-LLM: dado un prompt, el modelo decide (`choice`) a qué modelo enviarlo (por ejemplo, uno barato para consultas simples y uno grande para razonamiento), reduciendo coste frente a enviar todo al modelo mayor.
- Selección de herramientas en un agente: con la lista de tools disponibles como opciones, el modelo elige la adecuada y evita llamadas innecesarias; su confianza calibrada permite escalar a un LLM cuando la certeza es baja.
- Guardarraíles y moderación: clasificación de comentarios (civil_comments, hate speech, spam) con umbral de confianza para bloquear o derivar a revisión humana.
- Triaje de tickets de soporte: clasificación de intención (banking77, clinc_oos) y prioridad (`score`) antes de asignar a un agente humano o a un flujo automatizado.
- Verificación de respuestas en pipelines RAG: dado un contexto y una respuesta, decidir si la respuesta es adecuada o está soportada (`noul`/`score`), tal como reflejan las evaluaciones de adequacy de la model card.
- Evaluación automática de calidad: puntuar salidas de otros modelos en escalas ordenadas para comparar versiones o detectar regresiones en CI.
- Clasificación documental a escala: etiquetado de artículos, reseñas o correos en categorías predefinidas con ventana de 4096 tokens.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente):

| Evaluación | Métrica | Valor |
|---|---|---|
| JevBench public (servido a 4096) | accuracy | 0,7922 (183/231) |
| Held-out short tasks | accuracy | 0,689 (n=6000) |
| Boardgame | accuracy | 0,829 (n=900) |
| ContractNLI | accuracy | 0,875 (n=1026) |
| HotpotQA (held out) | accuracy | 0,886 (n=959) |
| MuSiQue | accuracy | 0,935 (n=1199) |
| MuSiQue, answerable | accuracy | 0,947 (n=599) |
| MuSiQue, unanswerable | accuracy | 0,923 (n=600) |
| Adequacy hs2 | accuracy | 0,744 (n=234) |
| Gen: adequacy | accuracy | 0,868 (n=302) |

Como referencia, la model card indica que las releases v1 con Gemma 4 obtienen entre 180 (E2B) y 207 (26B-A4B) de 231 en JevBench con la misma ventana, frente a los 183 de este checkpoint.

## Requisitos de hardware

- El torso son 31B parámetros, 62,5 GB en bfloat16: requiere una GPU de 80 GB (A100 80GB, H100 80GB) o reparto con `serve --device-map auto` entre varias GPUs.
- No cabe en GPUs de consumo (RTX 4090 de 24 GB, RTX 3090) en bfloat16 sin cuantización, y la información disponible no documenta pesos cuantizados.
- En CPU funciona la ruta lenta de PyTorch, sin kernels Mamba, con latencia muy superior.
- En CUDA son obligatorios los kernels Mamba precompilados (wheels para Python 3.12, torch 2.10 y CUDA 13); sin ellos la carga se rechaza.
- Despliegue mediante el paquete `strands-decider` desde el repositorio de código (etiqueta `swiftpick-30B-A3B-v1`); no hay release del framework que cargue este base todavía.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | JevBench (231) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| swiftpick-30B-A3B | 31B totales / ~3B activos | 4096 en evaluación | 183 | NVIDIA Open Model Agreement | HuggingFace + repo de código |
| Gemma 4 E2B (v1) | no disponible | no disponible | 180 | no disponible en la información | no disponible |
| Gemma 4 26B-A4B (v1) | 26B totales / ~4B activos | no disponible | 207 | no disponible en la información | no disponible |

No se dispone de comparativas con clasificadores dedicados (por ejemplo, modelos SetFit o encoder-only) en la información proporcionada.

## Limitaciones y advertencias

- Solo texto: no aprovecha las capacidades multimodales del modelo base.
- No genera texto libre; únicamente devuelve opciones, sí/no o puntuaciones en escala.
- Resultados de benchmarks declarados por el autor y marcados como no verificados; deben tratarse con cautela.
- El rendimiento en tareas cortas held-out (0,689) es notablemente inferior al de tareas largas o de razonamiento, lo que sugiere sensibilidad al tipo de tarea.
- Requiere el framework `strands-decider` desde el repositorio (sin release oficial que cargue este base) y kernels Mamba en CUDA; la puesta en marcha es más frágil que la de un modelo estándar de transformers.
- Licencia NVIDIA Open Model Agreement: conviene revisar sus condiciones antes de uso comercial, ya que no es una licencia permisiva tipo Apache o MIT.
- Idiomas soportados no documentados; no se puede asumir cobertura multilingüe.
- Sesgos y riesgo de alucinación: al ser un clasificador, el riesgo se traduce en etiquetas erróneas con confianza alta; los datasets de moderación y sentimiento pueden introducir sesgos culturales o de dominio.
- El adaptador se publica a rango 64 por ejecución y rango 192 en el "soup"; mezclar checkpoints de distinto rango puede dar resultados inesperados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/harishvs/swiftpick-30B-A3B
- Repositorio de código (Apache-2.0): https://github.com/harishvs/strands-decider
- Modelo base: https://huggingface.co/nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16
- Licencia NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
