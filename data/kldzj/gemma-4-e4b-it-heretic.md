# kldzj/gemma-4-E4B-it-heretic

## Resumen

kldzj/gemma-4-E4B-it-heretic es una variante "abliterada" (decensurada) del modelo multimodal google/gemma-4-E4B-it, publicada por el usuario kldzj. El proceso de abliteración se ha realizado con la herramienta Heretic v2.0.0, que aplica una técnica de ablación de rango arbitrario (Arbitrary-Rank Ablation, ARA) sobre las capas 19 a 35 del transformer para eliminar la tendencia del modelo a rechazar peticiones. El resultado es un modelo que responde a prácticamente cualquier solicitud (2 rechazos de 100 en el conjunto de evaluación de Heretic, frente a 100 de 100 del original), manteniendo un rendimiento en benchmarks muy cercano al del modelo base.

El modelo conserva la arquitectura y las capacidades del Gemma 4 E4B original: es un modelo multimodal any-to-any (texto e imagen de entrada, texto de salida) con aproximadamente 7.940 millones de parámetros en pesos safetensors y un repositorio de 21,2 GB en precisión bf16. La licencia declarada es Apache-2.0, aunque el autor remite a los términos de la licencia de Gemma 4 de Google.

La relevancia de esta ficha radica en que documenta un caso de modificación de seguridad sobre un modelo de gran tamaño: el autor publica la metodología completa, los hiperparámetros de la ablación, la comparación de cuatro candidatos y las métricas de degradación (divergencia KL, MMLU, GSM8K, ARC-Challenge, HellaSwag y perplejidad en Wikitext). Es, por tanto, un ejemplo reproducible de cómo cuantificar el coste de eliminar los rechazos en un modelo instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (any-to-any), basado en google/gemma-4-E4B-it; ablación ARA sobre capas 19-35 |
| Parametros totales | 7.941.100.832 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (pesos publicados); GGUF Q4_K_M en repositorio separado |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con remisión a los términos de Gemma 4 de Google) |
| Formato de pesos | safetensors (transformers); GGUF disponible |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E4B-it en la revisión `ee0ef60` y no ha sido reentrenado: la modificación consiste en una ablación de direcciones en el espacio de activaciones. Concretamente, Heretic v2.0.0 aplica Arbitrary-Rank Ablation (ARA) como modificador, cooptimizando dos objetivos mediante el muestreador TPE de Optuna: la tasa de rechazos (coincidencia de palabras clave sobre 100 prompts del split de test de `mlabonne/harmful_behaviors`) y la divergencia KL de la distribución del primer token respecto al modelo original (100 prompts del split de test de `mlabonne/harmless_alpaca`). Se ejecutaron 200 trials con 50 de arranque, semilla 42 y exportación por fusión (`export_strategy = "merge"`).

El trial seleccionado fue el 33, con estos parámetros: `start_layer_index = 19`, `end_layer_index = 35`, `preserve_good_behavior_weight = 0.3390`, `steer_bad_behavior_weight = 0.0025`, `overcorrect_relative_weight = 0.9437` y `neighbor_count = 14`. La elección fue manual: 33 de los 200 trials alcanzaron 0/100 rechazos, pero todos con divergencia KL de 11,6 o superior (modelo gravemente dañado); el trial 33 fue el único con 10 o menos rechazos y KL inferior a 1,2. El autor verificó que reejecutar `heretic --reproduce` genera pesos idénticos bit a bit, y que la evaluación sobre los pesos bf16 exportados da 2/100 rechazos y KL 0,0796 (frente a 0,0779 en el momento del trial, antes de fusionar el LoRA). No se dispone de información sobre la composición del dataset de entrenamiento original de Gemma 4 E4B ni sobre si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredados del modelo instruct base.
- Procesamiento de imagen y texto de entrada con salida de texto (pipeline `image-text-to-text` / `any-to-any`).
- Respuesta a solicitudes que el modelo original rechaza: la tasa de rechazo cae de 100/100 a 2/100 en el conjunto de evaluación de Heretic.
- Razonamiento matemático y resolución de problemas tipo GSM8K, con una ligera degradación respecto al original (0,820 frente a 0,840 en modo estricto).
- Conocimiento general y respuesta a preguntas de opción múltiple (MMLU 0,7006 frente a 0,7070 del original).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve como caso controlado para estudiar cómo varía la tasa de rechazo y la divergencia KL al aplicar ablación, gracias a que el autor publica la configuración completa y los resultados de los cuatro trials candidatos.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que aborde temas sensibles, donde el modelo original declinaría la petición; el autor lo orienta explícitamente a uso creativo y de investigación.
- Evaluación comparativa de robustez: uso del par original/abliterado para medir el impacto de la modificación en MMLU, GSM8K, ARC-Challenge y HellaSwag con el mismo harness (lm-evaluation-harness 0.4.13) y las mismas condiciones de hardware.
- Reproducción de experimentos de decensurado: el repositorio incluye `reproduce/config.toml` y la verificación de pesos idénticos bit a bit, lo que permite replicar el pipeline de Heretic en otros modelos.
- Procesamiento de documentos con imagen y texto: al conservar la entrada multimodal, puede emplearse en tareas de descripción de imágenes o extracción de información de capturas y figuras, siempre que el caso no requiera salvaguardas de contenido.
- Prototipado interno de asistentes conversacionales: con 7.940 millones de parámetros y pesos bf16, es desplegable en una sola GPU de gama alta para pruebas internas, aunque el autor advierte de que no debe exponerse a usuarios finales sin salvaguardas propias.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos en una RTX 6000 Ada con bf16, transformers 5.22.1 y lm-evaluation-harness 0.4.13, con ajustes idénticos para todos los modelos.

| Metrica | Original | Trial 33 (publicado) | Trial 18 | Trial 23 | Trial 154 |
|---|---:|---:|---:|---:|---:|
| Rechazos (100 prompts harmful_behaviors) | 100/100 | 2/100 | 17/100 | 19/100 | 13/100 |
| Divergencia KL (100 prompts harmless_alpaca) | 0 | 0,0779 | 0,1001 | 0,2336 | 0,6588 |
| MMLU acc (1.710 preguntas, 0-shot) | 0,7070 | 0,7006 | 0,7006 | 0,6708 | 0,6023 |
| GSM8K exact match estricto (250, 5-shot) | 0,8400 | 0,8200 | 0,8320 | 0,7320 | 0,7120 |
| GSM8K exact match flexible-extract | 0,8440 | 0,6840 | 0,8280 | 0,7280 | 0,7160 |
| ARC-Challenge acc_norm (1.172, 0-shot) | 0,5683 | 0,5230 | 0,5529 | 0,5162 | 0,4531 |
| HellaSwag acc_norm (1.000, 0-shot) | 0,6260 | 0,6060 | 0,6200 | 0,6040 | 0,5480 |
| Perplejidad de palabra Wikitext (62 docs) | 256,47 | 263,62 | 248,79 | 216,77 | 358,44 |
| Perplejidad de token Wikitext-2 (65.536 tokens) | 56,298 | 66,988 | 56,252 | 51,714 | 66,538 |
| Prompts inocuos (12): bucles / idioma incorrecto | 0 / 0 | 0 / 0 | 0 / 0 | 1 / 0 | 0 / 0 |
| Prompts inocuos (12): parada propia (límite 600 tokens) | 9/12 | 9/12 | 10/12 | 9/12 | 9/12 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: alrededor de 16 GB solo para pesos (7.941 millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; el repositorio completo ocupa 21,2 GB.
- Cuantización GGUF Q4_K_M disponible en `kldzj/gemma-4-E4B-it-heretic-GGUF`, lo que reduce sustancialmente los requisitos de memoria y permite su uso en GPU de consumo.
- GPU recomendadas: el autor validó el modelo en una RTX 6000 Ada (48 GB). Para bf16 se recomienda una GPU con 24 GB o más (RTX 4090, L4, A10G, A100, H100). Con Q4_K_M cabe en GPU de consumo de 8-12 GB, aunque no se han publicado mediciones concretas de VRAM para ese formato.
- Despliegue: compatible con transformers (librería declarada) y con llama.cpp/Ollama a través del GGUF; no se confirma soporte de vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos (100 prompts) | MMLU | GSM8K estricto | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---:|---|---|
| gemma-4-E4B-it-heretic (este) | 7.941 M | no disponible | 2/100 | 0,7006 | 0,8200 | apache-2.0 (términos Gemma 4) | HF + GGUF |
| google/gemma-4-E4B-it (original) | no disponible | no disponible | 100/100 | 0,7070 | 0,8400 | apache-2.0 (términos Gemma 4) | HF |
| Trial 18 (no publicado) | 7.941 M | no disponible | 17/100 | 0,7006 | 0,8320 | apache-2.0 | no disponible |
| Trial 23 (no publicado) | 7.941 M | no disponible | 19/100 | 0,6708 | 0,7320 | apache-2.0 | no disponible |

No se dispone de información sobre otros modelos abliterados comparables de la misma familia o tamaño en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo abliterado sin entrenamiento de seguridad adicional: responde a solicitudes que el original rechaza y no incorpora salvaguardas; el autor lo restringe a investigación y uso creativo.
- El autor advierte explícitamente de que no debe desplegarse a usuarios finales sin salvaguardas propias y de que el usuario es responsable del cumplimiento legal y de los términos de la licencia Gemma 4 / Apache-2.0.
- Degradación medible en razonamiento: ARC-Challenge cae de 0,5683 a 0,5230 (−4,5 puntos) y GSM8K flexible-extract de 0,8440 a 0,6840 (−16 puntos), lo que indica pérdida de consistencia en la extracción de respuestas numéricas.
- Aumento de perplejidad: Wikitext-2 sube de 56,298 a 66,988 y la perplejidad de palabra de 256,47 a 263,62, señal de degradación en la modelización del lenguaje.
- Divergencia KL de 0,0779 respecto al original: la distribución de siguiente token se ha alterado de forma no trivial, con riesgo de comportamientos atípicos fuera de los conjuntos evaluados.
- Riesgo de alucinación: no cuantificado en la información disponible; la ablación no aborda este problema y la degradación en benchmarks sugiere que puede agravarse.
- Idiomas soportados no documentados; no se puede garantizar el rendimiento multilingüe del modelo base.
- Longitud de contexto no documentada en la ficha, lo que impide planificar cargas de contexto largo.
- Sesgos conocidos: no documentados en la información proporcionada.
- El modelo se publicó el 2 de noviembre de 2026 con 218 descargas y 0 likes; no hay validación independiente de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kldzj/gemma-4-E4B-it-heretic
- GGUF Q4_K_M: https://huggingface.co/kldzj/gemma-4-E4B-it-heretic-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Revisión del modelo base: https://huggingface.co/google/gemma-4-E4B-it/commit/ee0ef6023621cff504d758262d4e04895a5af4a2
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Commit de Heretic v2.0.0: https://github.com/p-e-w/heretic/commit/0db5c31e10ecc426440b6fb0ce4bf85352faf1a7
- Términos de licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Paper referenciado en los tags (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
