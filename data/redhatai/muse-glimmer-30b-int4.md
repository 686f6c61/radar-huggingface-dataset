# RedHatAI/Muse-Glimmer-30B-INT4

## Resumen

Muse-Glimmer-30B-INT4 es una versión cuantizada a INT4 del modelo multimodal Muse-Glimmer-30B desarrollado por Meta (identificado en la model card como "Muse"), publicada por RedHatAI el 11 de agosto de 2026. El modelo original acepta entradas de texto e imagen y produce texto, empleando la arquitectura `MuseGlimmerForConditionalGeneration`. Esta variante cuantizada reduce el peso de los parámetros de 16 a 4 bits, disminuyendo el espacio en disco y los requisitos de VRAM en aproximadamente un 75 %.

La cuantización se ha realizado con LLM Compressor mediante el esquema W4A16 GPTQ, manteniendo las activaciones en precisión original y cuantizando únicamente las capas lineales de los bloques transformer (excluyendo visión, `lm_head` y `embed_tokens`). El resultado se exporta en formato compressed-tensors, listo para servir con vLLM. La licencia es Apache 2.0, lo que facilita su uso comercial.

Aunque el nombre comercial indica "30B", los pesos en safetensors suman 7.954.958.144 parámetros, un dato relevante a la hora de planificar el despliegue. El repositorio ocupa 22,2 GB y acumula cerca de 2.000 descargas en el momento de la consulta. Es una opción interesante para equipos que necesitan un modelo image-text-to-text servible en una sola GPU con vLLM, con soporte de tool calling y reasoning parser integrados en el runtime.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MuseGlimmerForConditionalGeneration (transformer multimodal texto+imagen) |
| Parámetros totales | 7.954.958.144 (según safetensors); el nombre comercial indica 30B |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT4 (pesos), activaciones sin cuantizar (W4A16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compressed-tensors (compatible con transformers y vLLM) |

## Arquitectura y entrenamiento

El modelo base Muse-Glimmer-30B emplea la arquitectura `MuseGlimmerForConditionalGeneration`, un transformer multimodal que procesa entradas de texto e imagen y genera texto. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; esa información no está disponible en la documentación proporcionada.

Esta variante INT4 se generó con LLM Compressor aplicando el modificador GPTQ con esquema W4A16 sobre las capas lineales (`targets="Linear"`), excluyendo explícitamente los módulos de visión (`re:.*vision.*`), `lm_head` y los embeddings (`re:.*embed_tokens.*`). La calibración usó 512 muestras del dataset `mlabonne/open-perfectblend` con longitud máxima de secuencia de 2048 tokens. El resultado se exporta en el formato compressed-tensors, que vLLM reconoce de forma nativa. No se ha aplicado cuantización de activaciones, por lo que la ganancia de memoria proviene únicamente de los pesos.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text): descripción, análisis y respuesta a preguntas sobre contenido visual.
- Procesamiento conjunto de texto e imagen en una misma conversación.
- Soporte de tool calling / function calling: la guía de despliegue de vLLM incluye `--enable-auto-tool-choice` y `--tool-call-parser muse_glimmer`.
- Soporte de modo razonamiento: el runtime de vLLM ofrece `--reasoning-parser muse_glimmer`.
- Conversacional multi-turno (tag `conversational`).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Otras capacidades especiales (audio, vídeo, thinking mode explícito): no disponibles.

## Casos de uso

- Asistencia multimodal en atención al cliente: el modelo puede recibir capturas de pantalla o fotos de producto junto al texto del usuario y responder en la misma conversación; el formato INT4 permite servirlo en una GPU única con vLLM.
- Extracción de información de documentos escaneados: dado que acepta imagen y texto, se puede usar para transcribir y estructurar datos de facturas, formularios o tickets en pipelines internos.
- Agentes con acceso a herramientas: gracias al soporte de tool calling en vLLM (`--tool-call-parser muse_glimmer`), se puede integrar en flujos donde el modelo decide invocar APIs para completar tareas.
- Razonamiento multi-paso con trazas: el `--reasoning-parser muse_glimmer` permite separar el razonamiento intermedio de la respuesta final, útil en asistentes técnicos o de análisis.
- Moderación y análisis de contenido visual: clasificación y descripción de imágenes en flujos de revisión, aprovechando la ventana de contexto que ofrezca el modelo base (no documentada aquí).
- Despliegue en infraestructura con VRAM limitada: al reducir el peso de los pesos un ~75 % respecto a FP16, encaja en entornos donde el modelo original de 30B no cabría; útil para prototipos y entornos de staging.
- Evaluación comparativa de cuantizaciones: como referencia para medir la degradación de calidad de W4A16 GPTQ frente al modelo original en tareas multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones multimodales, ni comparaciones con el modelo base en precisión completa.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 22,2 GB; con overhead de KV cache y activaciones, se recomienda al menos 24 GB de VRAM para una sola GPU. El ahorro respecto a FP16 es de aproximadamente el 75 % en los pesos cuantizados.
- GPU recomendadas: A100 40/80 GB, H100, L40S; en consumer, RTX 4090 (24 GB) o RTX 3090 (24 GB) son el mínimo razonable para una instancia.
- Cabe en GPU consumer: sí, previsiblemente en RTX 4090/3090 con 24 GB, aunque con margen ajustado para contextos largos o imágenes de alta resolución.
- Opciones de despliegue: vLLM (soporte nativo de compressed-tensors, con `--tool-call-parser muse_glimmer` y `--reasoning-parser muse_glimmer`); transformers con `MuseGlimmerForConditionalGeneration` y `AutoProcessor`; no se documenta soporte de llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| RedHatAI/Muse-Glimmer-30B-INT4 | 7.954.958.144 (safetensors) | no disponible | Apache 2.0 | safetensors + compressed-tensors | Cuantización W4A16 GPTQ del modelo de Meta |
| meta-models/Muse-Glimmer-30B | no disponible en la información | no disponible | no disponible en la información | safetensors | Modelo base sin cuantizar |
| Otras alternativas multimodales de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- La cuantización W4A16 GPTQ puede introducir degradación de calidad frente al modelo base en tareas sensibles; no se han publicado evaluaciones que cuantifiquen esa pérdida.
- Las activaciones no están cuantizadas, por lo que el ahorro de memoria se limita a los pesos; el KV cache y las activaciones mantienen su coste en precisión original.
- No se documentan sesgos conocidos, idiomas soportados ni comportamiento en dominios específicos.
- No se especifica la longitud de contexto máxima; planificar el despliegue sin asumir ventanas largas.
- Riesgo de alucinación inherente a modelos generativos; no hay datos de evaluación específicos para esta variante.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y de los datos de calibración (`mlabonne/open-perfectblend`) si se redistribuye.
- El nombre "30B" no coincide con el recuento real de parámetros en safetensors (~8B); verificar requisitos de memoria con el tamaño real del repositorio (22,2 GB).
- Solo se documenta despliegue con vLLM y transformers; otros runtimes (llama.cpp, Ollama) no están soportados oficialmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RedHatAI/Muse-Glimmer-30B-INT4
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Guía de uso con vLLM: https://recipes.vllm.ai/meta-models/Muse-Glimmer-30B
- LLM Compressor: https://github.com/vllm-project/llm-compressor
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
- Dataset de calibración: https://huggingface.co/datasets/mlabonne/open-perfectblend
- README del modelo: https://huggingface.co/RedHatAI/Muse-Glimmer-30B-INT4/blob/main/README.md
