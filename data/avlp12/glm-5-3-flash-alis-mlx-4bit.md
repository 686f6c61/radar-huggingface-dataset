# avlp12/GLM-5.3-Flash-Alis-MLX-4bit

## Resumen

GLM-5.3-Flash-Alis-MLX-4bit es una cuantización en 4 bits (formato MLX) del modelo GLM-5.3-Flash de Z.ai, el primer modelo nativamente multimodal de la serie GLM-5. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 320 mil millones de parámetros totales y aproximadamente 18 mil millones activos por token, diseñado para tareas de programación, trabajo agéntico y comprensión visual. Esta versión concreta, publicada por el usuario avlp12 (ALISVOLATPROPRIIS), está optimizada para ejecutarse en hardware Apple Silicon mediante el framework MLX, reduciendo el peso en disco a 189,8 GB con una precisión efectiva de ~4,73 bits por parámetro.

El modelo base incorpora una arquitectura híbrida de atención: 34 capas de atención lineal Kimi-Delta (KDA) intercaladas con 11 capas de atención dispersa DeepSeek (MLA + DSA), un total de 288 expertos enrutados con top-8, y una ventana de contexto de 1.048.576 tokens (1M). Además, conserva el módulo de visión del checkpoint original, lo que permite generación de imagen a texto. Esta cuantización es relevante para desarrolladores que necesitan ejecutar un modelo de gran escala en equipos Mac con memoria unificada, aunque requiere un runtime adaptado porque la arquitectura `glm5_next` aún no está soportada en la versión estándar de `mlx-lm`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida: 34 capas KDA (linear attention) + 11 capas MLA+DSA (sparse attention), 45 capas de texto + 1 capa MTP, 288 expertos enrutados (top-8) + 1 experto compartido |
| Parametros totales | 320B (321,3B almacenados según la model card) |
| Parametros activos | ~18B |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | 4-bit (efectivo ~4,73 bits/parámetro), grupo afin g64; pesos de visión en bf16/fp32 sin cuantizar |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), 177 shards |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash, desarrollado por Z.ai, emplea una arquitectura `glm5_next` que combina dos mecanismos de atención complementarios. Por un lado, 34 capas de atención lineal Kimi-Delta (KDA) con estado recurrente de regla delta y compuerta de olvido aprendida (`gate_lower_bound = −5`), que mantienen un estado de tamaño fijo sin caché KV creciente. Por otro lado, 11 capas de atención dispersa DeepSeek (MLA + DSA) con latente comprimido (`kv_lora_rank` 512, `q_lora_rank` 1536, `head_dim` 256), sin posicional rotatorio (NoPE) y con un indexador ligero de 2048 tokens y agrupación de claves IndexPool (4→1, `select_k` 512). Las capas 0–2 son densas con `intermediate_size` 12288, y el resto usa MoE con 288 expertos enrutados, top-8, enrutamiento sigmoide con corrección de bias en fp32, escalado 2,5 y un experto compartido. La activación es SwiGLU con clamp de preactivación (`swiglu_limit` 10). El modelo usa 4 flujos residuales (multi-stream hyper-connections, mHC) colapsados por media no ponderada antes de la cabeza, embeddings y `lm_head` no compartidos, y un vocabulario de 154.880 tokens.

Esta versión MLX 4-bit es el resultado de un proceso de cuantización realizado por avlp12 sobre el checkpoint FP8 original de Z.ai (revisión `84c6a6aa9497188e15a635ba793b0f95a79b1033`). Se evaluaron tres técnicas de mejora (QUASAR-init, AWQ-mixto y destilación ALIS-DWQ contra el build de 8 bits) pero ninguna superó las puertas de validación pre-registradas; el artefacto final es un pack RTN (round-to-nearest) estándar. Los pesos de visión (347 tensores `model.visual.*`, 1,13 GB) se conservan byte a byte sin cuantizar.

## Capacidades

- Generación de texto y razonamiento complejo en inglés y chino, con contexto largo de hasta 1M tokens.
- Comprensión de imágenes: el modelo es un VLM (vision-language model) y puede generar descripciones o respuestas a partir de entradas visuales; probado en este pack 4-bit con una imagen de 448×448 que produce una secuencia de características de 256×4096.
- Programación y tareas agénticas: el modelo base está orientado a coding y agentic work, aunque no se especifican detalles de tool calling en la documentación disponible.
- Generación de texto con parámetros por defecto: temperatura 1,0, top_p 0,95.
- Capacidad de procesamiento de contexto largo gracias a la combinación de atención lineal (estado fijo) y atención dispersa (indexación ligera), lo que permite ventanas de 1M tokens con uso de memoria optimizado.
- Soporte de generación de imagen a texto verificado en este pack mediante el runtime portado (mlx-vlm), con una descripción correcta de una fotografía costera.

## Casos de uso

- Asistente de programación local en Mac: el modelo puede generar código, explicar errores y refactorizar proyectos gracias a su entrenamiento orientado a coding y su gran capacidad de razonamiento. Su tamaño cuantizado lo hace viable en estaciones de trabajo Apple Silicon con al menos 192 GB de RAM unificada.
- Análisis de documentos extensos: con 1M tokens de contexto, permite procesar libros técnicos, bases de código completas o expedientes legales en una sola pasada, sin necesidad de dividir el texto en fragmentos.
- Generación de descripciones de imágenes en entornos sin conexión: al conservar el módulo de visión, puede describir fotografías o diagramas en inglés o chino, útil para accesibilidad o anotación automática de activos visuales.
- Chat conversacional multilingüe: soporta conversaciones largas y coherentes en inglés y chino, adecuado para aplicaciones de atención al cliente o asistentes personales en esos idiomas.
- Investigación en arquitecturas de atención híbrida: al ser un modelo abierto con licencia MIT, sirve como referencia para estudiar la combinación de atención lineal y dispersa en MoE de gran escala, y para experimentar con técnicas de cuantización MLX.
- Despliegue de agentes autónomos en local: su capacidad de razonamiento multi-paso y su contexto amplio lo hacen apto para tareas de planificación y ejecución de acciones, siempre que se integre con herramientas externas mediante un runtime adaptado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K para esta cuantización. El autor solo documenta pruebas de humo: carga estricta de pesos, forward en Metal y generación de texto e imagen. Tampoco se ofrecen comparativas numéricas con el modelo original o con otras cuantizaciones.

## Requisitos de hardware

- Almacenamiento: 189,8 GB en disco (176,8 GiB) para los pesos 4-bit.
- Memoria unificada: se requiere una Mac con al menos 192 GB de RAM para cargar el modelo completo; para contexto de 1M tokens se documenta una ocupación en un M3 Ultra de 512 GiB.
- GPU: diseñado para Apple Silicon (M1/M2/M3/M4 Ultra o Max); no compatible con GPUs NVIDIA o AMD sin una conversión adicional a otro formato.
- Runtime: no funciona con `mlx-lm` estándar (versión 2026-08-28); necesita un port específico (`mlx_lm/models/glm5_next.py` con md5 `695c6376914ec0bd958f72b1044c885c` y `hyper_connection.py`).
- Inferencia: forward en Metal verificado con tiempo de carga de 26,72 s en el pack 4-bit; no se proporcionan métricas de throughput o latencia por token.
- Opciones de despliegue: uso local mediante el fork de `mlx-lm` y el repositorio de campaña `local-llm-serving`; integración con `mlx-vlm` para tareas de visión (PR pendiente).

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para esta cuantización concreta. El modelo base GLM-5.3-Flash compite con otros MoE de gran escala como DeepSeek-V3 (671B total, 37B activos) o Qwen3-235B-A22B (235B total, 22B activos), pero esta versión MLX 4-bit es específica para Apple Silicon y no existen benchmarks públicos que la comparen directamente. La tabla siguiente ofrece una comparación cualitativa basada en las especificaciones declaradas:

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato disponible |
|---|---|---|---|---|---|
| GLM-5.3-Flash (base) | 320B | ~18B | 1M | MIT | FP8, bf16 |
| GLM-5.3-Flash-Alis-MLX-4bit | 320B | ~18B | 1M | MIT | MLX 4-bit |
| DeepSeek-V3 | 671B | 37B | 128K | MIT | FP8, GGUF, etc. |
| Qwen3-235B-A22B | 235B | 22B | 32K (extensible a 128K) | Apache 2.0 | FP8, GGUF, etc. |

## Limitaciones y advertencias

- Requiere un runtime portado: la arquitectura `glm5_next` no está soportada en `mlx-lm` de serie; es necesario instalar un fork o parche manual, lo que complica la reproducibilidad.
- Solo inglés y chino: no hay soporte documentado para otros idiomas, lo que limita su uso en entornos multilingües.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir contenido falso o inconsistente, especialmente en tareas de razonamiento complejo.
- La cuantización 4-bit puede degradar ligeramente la calidad de salida respecto al modelo FP8 original; no se han publicado evaluaciones de pérdida de rendimiento.
- Ocupación de memoria muy alta: aunque es la versión más ligera de la serie Alis MLX, sigue requiriendo más de 176 GiB de RAM, fuera del alcance de la mayoría de equipos de consumo.
- La licencia MIT permite uso comercial, pero el modelo base puede tener restricciones adicionales de uso en ciertos países o sectores (no documentadas en esta ficha).
- El módulo de visión está verificado solo con el runtime portado; en la versión estándar de `mlx-vlm` no funciona hasta que se integre el PR correspondiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/avlp12/GLM-5.3-Flash-Alis-MLX-4bit
- Modelo base (Z.ai): https://huggingface.co/zai-org/GLM-5.3-Flash
- Colección Alis MLX: https://huggingface.co/collections/avlp12/glm-53-flash-alis-mlx-6a8f74a74289c9ad6a5f5e05
- Repositorio de campaña (port, conversión, recibos): https://github.com/avlp12/local-llm-serving
- PR de mlx-vlm para soporte de visión: https://github.com/Blaizzy/mlx-vlm/pull/2091
- Runtime MLX para GLM-5.3-Flash (PipeNetwork): https://github.com/PipeNetwork/glm53-flash-mlx
- Página del modelo en LM Studio: https://lmstudio.ai/models/glm-5.3-flash
