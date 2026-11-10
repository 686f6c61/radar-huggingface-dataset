# SolsticeAI/Arete-27B-Unlocked-Uncensored-Heretic

## Resumen

Arete-27B-Unlocked-Uncensored-Heretic es una variante "abliterada" (decensored) del modelo NousResearch/Arete-27B, publicada por el usuario SolsticeAI. Arete-27B es a su vez un ajuste fino supervisado (SFT) de Qwen3.8-27B de Alibaba, realizado por Nous Research para reforzar lo que describen como valores occidentales sobre un modelo entrenado originalmente en China. Esta variante concreta aplica una ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) mediante la herramienta Heretic v2.2.0.dev0 para eliminar los comportamientos de rechazo del modelo base.

El modelo conserva la arquitectura y el tamaño del original: aproximadamente 27.356 millones de parámetros totales, pesos en safetensors, contexto de entrenamiento de 64k tokens y licencia Apache 2.0. La modificación de SolsticeAI no altera los pesos de forma estructural, sino que proyecta direcciones de activación asociadas al rechazo en las capas 5 a 59, reduciendo los rechazos de 92/100 a 6/100 según el clasificador del autor, con una divergencia KL de 0.0681 respecto al modelo original.

La relevancia de esta ficha es doble: por un lado documenta un caso de estudio de alineación de valores mediante SFT sobre un modelo base chino; por otro, ilustra el ecosistema de variantes "uncensored" que aplican técnicas de ablación reproducibles sobre modelos abiertos. El modelo está pensado para generación de texto y conversación, no incluye datos de entrenamiento multimodal y no dispone de métricas de benchmarks estándar publicadas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tag `qwen3_5`), con cabeza de predicción multi-token (MTP) desactivada durante el entrenamiento |
| Parametros totales | 27.356.728.560 (~27,36 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 64k tokens (contexto de entrenamiento del modelo base) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no listadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 54,8 GB |
| Modelo base | NousResearch/Arete-27B (a su vez SFT de Qwen3.8-27B) |
| Dataset de entrenamiento | NousResearch/arete-data-pairs (texto) |
| Herramienta de ablacion | Heretic v2.2.0.dev0 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia Qwen3.5, con 27,36 mil millones de parámetros y una ventana de contexto de 64k tokens. El modelo base Arete-27B fue post-entrenado por Nous Research mediante SFT puro sobre Qwen3.8-27B: sin RL, sin optimización de preferencias y sin modificaciones arquitectónicas. El entrenamiento usó 52,8 millones de tokens a contexto de 64k, sin sequence packing, durante dos épocas y 1.202 pasos, con AdamW (betas 0,9/0,98, epsilon 1e-5, weight decay 0,1, gradient clipping 1,0), learning rate con warmup lineal de 1e-6 a 1e-5 en 120 pasos y decaimiento coseno hasta 1e-6, batch de 48, precisión bf16 con pesos maestros y estados de optimizador en fp32, y tensor parallel de 4. Se entrenaron todos los pesos del modelo de lenguaje; el codificador de visión quedó congelado y la cabeza MTP se desactivó durante el entrenamiento. El profesor para generar las respuestas de SFT fue Inkling, elegido por ser un modelo abierto con evaluación positiva en las categorías objetivo y para evitar las restricciones de uso asociadas a la destilación de modelos cerrados.

El dataset de SFT se construyó generando 20.000 prompts en siete categorías de valores (libertad de expresión, ideología estatal, estado frente a mercado libre, educación, privacidad y vigilancia de datos, democracia y política medioambiental), con un pipeline con deduplicación y verificación contra el conjunto de evaluación retenido para eliminar solapamiento. La variante de SolsticeAI aplica sobre este modelo una ablación de rangos arbitrarios (ARA) con Heretic v2.2.0.dev0: índices de capa de inicio 5 y fin 59, `preserve_good_behavior_weight` 0,2344, `steer_bad_behavior_weight` 0,0001, `overcorrect_relative_weight` 0,9551 y `neighbor_count` 4. El proceso es reproducible según el autor, con instrucciones en el directorio `reproduce` del repositorio.

## Capacidades

- Generación de texto y conversación multi-turno en inglés (idiomas adicionales no documentados).
- Razonamiento y asistencia general, heredados del modelo base Arete-27B.
- Trabajo agéntico y multi-step reasoning, según la model card del modelo base.
- Tool calling / function calling: no se documenta explícitamente en la información disponible para esta variante.
- Capacidades de visión: el modelo base conserva un codificador de visión congelado, pero el post-entrenamiento fue solo de texto; no se confirma soporte de imagen en esta variante.
- Modo "uncensored": reducción drástica de rechazos (6/100 frente a 92/100 del original según el clasificador del autor).
- Reproducibilidad del proceso de ablación mediante Heretic y los parámetros ARA publicados.
- Sin modo "thinking" documentado de forma explícita en la información disponible.

## Casos de uso

- Investigación sobre alineación de valores: el modelo permite estudiar cómo el SFT y la ablación de direcciones de activación modifican el comportamiento de rechazo y el encuadre ideológico de un modelo base, comparando directamente con Arete-27B y Qwen3.8-27B.
- Evaluación de técnicas de decensoring: sirve como caso reproducible para medir el impacto de ARA (divergencia KL de 0,0681) sobre la calidad general y la tasa de rechazo, con parámetros publicados que permiten replicar el experimento.
- Generación creativa sin filtros: escritura de ficción, guiones o contenido narrativo donde los rechazos del modelo base resultan un obstáculo, aprovechando la ventana de 64k tokens para mantener coherencia en textos largos.
- Asistente conversacional especializado: despliegue en entornos controlados donde el operador asume la responsabilidad del contenido y necesita respuestas sin deflexiones sobre temas sensibles.
- Análisis de sesgo y propaganda: el conjunto de evaluación Propaganda_Eval (803 prompts en siete categorías) y la métrica de fact score permiten auditar el encuadre de las respuestas en temas políticos.
- Experimentación con contextos largos: los 64k tokens de contexto permiten procesar documentos extensos, informes o transcripciones completas en una sola pasada para tareas de resumen o extracción.
- Base para ajustes finos posteriores: al estar en safetensors y con licencia Apache 2.0, puede servir como punto de partida para SFT o DPO específicos de dominio.

## Benchmarks y rendimiento

| Metrica | Este modelo | NousResearch/Arete-27B |
|---|---|---|
| Rechazos (clasificador) | 6/100 | 92/100 |
| Divergencia KL | 0,0681 | 0 (por definición) |

Del modelo base Arete-27B se documentan además: fact score de 2,98 sobre 5 (frente a 2,32 del Qwen3.8-27B original) y reducción de respuestas con propaganda del 22% al 0,9%, con mejora en las siete categorías de valores sin regresión significativa en los benchmarks de capacidad general y agénticos que ejecutaron. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible para esta variante.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 55 GB solo para pesos, más overhead de KV cache; se recomienda al menos 80 GB para contexto largo.
- En cuantización de 8 bits: alrededor de 28-30 GB de VRAM; en 4 bits: alrededor de 15-17 GB (estimaciones según el número de parámetros, no confirmadas por el autor).
- GPU recomendadas para bf16: A100 80 GB, H100 80 GB, o múltiples RTX 4090 (24 GB) con tensor parallel.
- Consumer GPU: cabe en una RTX 4090 o RTX 3090 únicamente con cuantización de 4 bits y contexto reducido; en 8 bits requiere GPUs de 32 GB o más.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama para cuantizaciones GGUF (no se publican GGUF en el repositorio, habría que generarlos), Transformers con accelerate para carga en múltiples GPUs.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arete-27B-Unlocked-Uncensored-Heretic | ~27,36B | 64k | Ablación de rechazos sobre Arete-27B | Apache 2.0 | Hugging Face (0 descargas) |
| NousResearch/Arete-27B | ~27B | 64k | SFT de alineación de valores sobre Qwen3.8-27B | Apache 2.0 | Hugging Face |
| Qwen3.8-27B (Alibaba) | ~27B | No disponible | Modelo base original | No disponible en la información | Hugging Face / Alibaba |
| Variantes "abliterated" de la familia Qwen (p. ej., huihui-ai) | Variable (7B-32B) | Variable | Eliminación de rechazos mediante abliteración | Generalmente Apache 2.0 | Hugging Face |

La comparación directa con otras variantes uncensored de la misma familia no está disponible con datos numéricos en la información proporcionada; la única comparación cuantitativa documentada es la del clasificador de rechazos y la divergencia KL frente al modelo base.

## Limitaciones y advertencias

- La ablación elimina los rechazos de forma deliberada: el modelo puede generar contenido dañino, ilegal o sexualmente explícito sin las salvaguardas del original. El operador asume toda la responsabilidad legal y ética.
- Riesgo elevado de alucinación y de respuestas factualmente incorrectas al haberse suprimido parte del comportamiento de deflexión; el fact score del base es 2,98 sobre 5, no un valor alto.
- La modificación ARA con `steer_bad_behavior_weight` de 0,0001 y `overcorrect_relative_weight` de 0,9551 puede degradar capacidades generales de forma no medida; no hay benchmarks de capacidad publicados para esta variante.
- Idiomas soportados no documentados; el entrenamiento del base fue en inglés, por lo que el rendimiento en castellano u otros idiomas es incierto.
- El modelo base tiene un sesgo ideológico explícito por diseño (alineación a "valores occidentales" según Nous Research); esta variante no corrige ese sesgo, solo elimina los rechazos.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado puede infringir leyes locales o términos de servicio de plataformas; verificar el cumplimiento normativo antes de desplegar.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria, sin informes de terceros y con fecha de creación muy reciente; tratar como experimental.
- El codificador de visión del base está congelado y no fue entrenado; el soporte multimodal no está confirmado en esta variante.
- No se publican cuantizaciones oficiales; generar GGUF o AWQ requiere trabajo adicional y puede alterar el comportamiento de la ablación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SolsticeAI/Arete-27B-Unlocked-Uncensored-Heretic
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Blog de Nous Research sobre Arete: https://nousresearch.com/arete
- Dataset de evaluación Propaganda_Eval: https://huggingface.co/datasets/NousResearch/Propaganda_Eval
- Dataset de entrenamiento referenciado: https://huggingface.co/datasets/NousResearch/arete-data-pairs
- Proyecto Heretic: https://heretic-project.org
- Instrucciones de reproducción: directorio `reproduce/README.md` dentro del repositorio del modelo
