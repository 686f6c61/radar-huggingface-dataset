# nathansutton/Qwen3.8-27B-4bit-MTP-MLX

## Resumen

Qwen3.8-27B-4bit-MTP-MLX es una conversión a 4-bit en formato MLX del modelo Qwen/Qwen3.8-27B, realizada por nathansutton. Su particularidad principal es que conserva la cabeza de multi-token-prediction (MTP) que el checkpoint original de Qwen incluye, pero que los cargadores convencionales (mlx-lm, transformers) descartan al cargar el modelo. Esta cabeza permite decodificación especulativa auto-dirigida, es decir, el modelo redacta sus propios tokens candidatos y los verifica en una única pasada hacia adelante, con muestreo de rechazo exacto que no altera la distribución de salida.

Además, esta conversión elimina la torre de visión (vision tower) del checkpoint original, ya que la implementación de `mlx_lm` para la arquitectura `qwen3_5` nunca la construye. El resultado es un repositorio más pequeño que la conversión 4-bit estándar (14.316 GiB frente a 14.952 GiB) y que añade decodificación especulativa sin coste adicional. El modelo es estrictamente de texto, con licencia Apache 2.0, y está pensado para ejecutarse en hardware Apple Silicon mediante la librería MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8-27B), 4-bit MLX affine, group size 64 |
| Parametros totales | 4.204.731.904 (pesos cuantizados en safetensors) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (heredada del modelo base Qwen3.8-27B) |
| Tipos de cuantizacion | 4-bit, group size 64 (MLX affine) |
| Idiomas soportados | no disponible (el modelo base Qwen3.8-27B soporta multiples idiomas, pero la model card no los especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), incluye `model.safetensors` y `mtp.safetensors` |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27.000 millones de parametros con ventana de contexto nativa de 262.144 tokens. Es un modelo de lenguaje y vision (VLM) que entiende imagenes y video, con control flexible de razonamiento (thinking mode). La conversion MLX aqui descrita elimina la torre de vision, por lo que esta version es exclusivamente textual.

La innovacion principal de este repositorio es la inclusion de la cabeza MTP (multi-token-prediction) entrenada por Qwen. Se trata de una capa de una sola profundidad que opera sobre `[norm(embed), norm(hidden)]`, seguida de una capa decodificadora de atencion completa y una normalizacion final, compartiendo embeddings y `lm_head` con el modelo base. Esta cabeza permite que el modelo redacte sus propios tokens futuros y los verifique en una unica pasada hacia adelante, con muestreo de rechazo exacto: la distribucion de salida es identica a la decodificacion autoregresiva estandar a cualquier temperatura.

La cabeza MTP fue extraida del shard 18/18 del repositorio BF16 original de Qwen y cuantizada a 4-bit con group size 64 para igualar el formato del resto de pesos. Los pesos del modelo de lenguaje no fueron recuantizados ni alterados; solo se eliminaron los tensores `vision_tower.*` y se reordenaron los shards.

## Capacidades

- Generacion de texto autoregresiva con decodificacion especulativa auto-dirigida mediante la cabeza MTP.
- Razonamiento multi-paso con control flexible de thinking mode (heredado del modelo base).
- Generacion de codigo, incluyendo codigo novel y reescritura de archivos existentes.
- Soporte de tool calling y function calling (capacidad del modelo base Qwen3.8-27B).
- Capacidades de agente para tareas de larga duracion (long-horizon agentic tasks), como reescribir archivos, citar diffs o reproducir salidas de tests.
- Multilingue (capacidad del modelo base, aunque los idiomas concretos no estan documentados en esta conversion).
- Sin capacidades de vision: la torre de vision fue eliminada deliberadamente, por lo que el modelo es text-only por construccion.

## Casos de uso

- Agente de codigo en local: el modelo puede reescribir archivos que acaba de abrir, citar diffs y reproducir salidas de tests. En este tipo de carga de trabajo, la cabeza MTP ofrece una aceleracion medida de hasta 1.38x frente a la decodificacion estandar, lo que reduce la latencia en ciclos de edicion-verificacion.
- Asistente de programacion en Apple Silicon: con 4-bit y 14.3 GiB de descarga, cabe en Macs con 24 GB de RAM unificada. Se integra con `chad` (herramienta CLI del autor) o con `mlx_lm` para generacion de codigo y chat tecnico.
- Generacion de codigo novel: el modelo redacta clases o funciones desde cero con una aceleracion medida de 1.11x gracias a MTP, manteniendo la misma calidad de salida que la decodificacion estandar.
- Reproduccion de archivos con ediciones puntuales: escenario tipico en agentes que deben replicar un archivo con un cambio concreto. La tasa de aceptacion de borradores MTP alcanza el 61% en este tipo de tareas, con 1.38x de aceleracion.
- Chat tecnico y explicaciones: conversaciones multi-turno sobre temas de ingenieria, con contexto largo de hasta 262K tokens. En prosa explicativa la aceleracion MTP es minima (1.01x), pero la calidad de salida es identica a la del modelo base.
- Desarrollo de herramientas de inferencia: el repositorio sirve como referencia para integrar cabezas MTP en cargadores MLX, ya que demuestra como extraer, cuantizar y empaquetar la cabeza junto a los pesos principales.

## Benchmarks y rendimiento

La model card no incluye benchmarks clasicos (MMLU, HumanEval, GSM8K, etc.). En su lugar, el autor proporciona mediciones propias de rendimiento de decodificacion especulativa en Apple M4 Pro / 24 GB, con `chad` 1.13.0, `temperature=1.0`, 320 tokens generados, mediana de 3 repeticiones:

| Carga de trabajo | MTP desactivado | MTP activado | Aceleracion | Tasa de aceptacion de borradores |
|---|---|---|---|---|
| Codigo novel (clase desde cero) | 15.68 tok/s | 17.46 tok/s | 1.11x | 42% |
| Prosa explicativa | 15.70 tok/s | 15.80 tok/s | 1.01x | 35% |
| Reproduccion de archivo con una edicion | 15.68 tok/s | 21.56 tok/s | 1.38x | 61% |

En cuanto a correccion, el autor verifica que a `temperature=0` la salida con MTP es identica token a token a la decodificacion plana (4/4 prompts, 160 tokens cada uno), y que con MTP desactivado el modelo reproduce byte a byte la salida de `mlx-community/Qwen3.8-27B-4bit` (5/5 prompts), lo que confirma que la eliminacion de la torre de vision y el reordenamiento de shards no alteraron los pesos del modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 14.316 GiB en disco. En Apple Silicon con memoria unificada, se necesita al menos 24 GB de RAM para cargar el modelo con comodidad (medido en M4 Pro / 24 GB).
- GPU recomendadas: Apple Silicon (M-series). El formato MLX no es compatible con CUDA.
- En consumer GPU: no aplicable, MLX es exclusivo de Apple Silicon.
- Opciones de despliegue: `chad` (carga automatica de la cabeza MTP), `mlx_lm` (ignora `mtp.safetensors` y usa solo el modelo base), `mlx_lm.generate` para inferencia interactiva.
- Latencia y throughput: entre 15.7 y 21.6 tok/s en M4 Pro / 24 GB segun la carga de trabajo y si MTP esta activado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| nathansutton/Qwen3.8-27B-4bit-MTP-MLX | 27B (4-bit) | 262K | MLX safetensors | Apache 2.0 | Incluye cabeza MTP, sin vision, 14.3 GiB |
| mlx-community/Qwen3.8-27B-4bit | 27B (4-bit) | 262K | MLX safetensors | Apache 2.0 | Conversion estandar, sin MTP, con vision tower (0.858 GiB en BF16), 14.95 GiB |
| Qwen/Qwen3.8-27B | 27B (BF16) | 262K | safetensors | Apache 2.0 | Checkpoint original con vision y MTP, ~54 GiB en BF16 |

La diferencia principal frente a la conversion estandar de mlx-community es el tamano de descarga (0.636 GiB menos) y la inclusion de la cabeza MTP, que permite decodificacion especulativa sin necesidad de un modelo drafter separado. Frente al checkpoint original, esta version es significativamente mas ligera y ejecutable en hardware de consumo Apple, a costa de perder las capacidades de vision.

## Limitaciones y advertencias

- Modelo estrictamente de texto: la torre de vision fue eliminada deliberadamente. Cualquier intento de cargar este repositorio con un cargador multimodal fallara de forma controlada, pero no se puede usar para tareas de vision.
- La aceleracion MTP depende de la carga de trabajo: en prosa libre no hay ganancia medible (1.01x), mientras que en tareas de re-emision de texto (reescritura de archivos, citas de diffs) alcanza 1.38x. No es una aceleracion universal.
- La cabeza MTP solo se activa con `chad`. Con `mlx_lm` estandar, el archivo `mtp.safetensors` se ignora y el modelo funciona como una conversion 4-bit normal.
- No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para esta conversion concreta. Las unicas mediciones disponibles son las del autor en hardware Apple.
- El modelo base Qwen3.8-27B es un VLM con capacidades de vision; esta conversion pierde esas capacidades. Si se necesita procesamiento de imagenes o video, usar el checkpoint original o una conversion que conserve la torre de vision.
- Riesgo de alucinacion y sesgos: no documentados especificamente para esta conversion, pero heredados del modelo base Qwen3.8-27B.
- Licencia Apache 2.0: permite uso comercial sin restricciones, incluyendo la redistribucion de esta conversion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nathansutton/Qwen3.8-27B-4bit-MTP-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Conversion estandar de referencia: https://huggingface.co/mlx-community/Qwen3.8-27B-4bit
- Herramienta chad (cargador con soporte MTP): https://github.com/nathansutton/chad
- Documentacion de Qwen3.8 en Unsloth: https://unsloth.ai/docs/models/qwen3.8
- Guia de ejecucion local (Ollama, GGUF): https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Ficha en LM Studio: https://lmstudio.ai/models/qwen3.8
- Repositorio de benchmark MTP (Layr-Labs): https://github.com/Layr-Labs/qwen-3.8-mtp-challenge
