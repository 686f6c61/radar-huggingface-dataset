# rao-studios/Qwen3.6-REAP-19B-A3B-mlx-4bit

## Resumen

Qwen3.6-REAP-19B-A3B-mlx-4bit es un espejo (mirror) publicado por rao-studios del modelo mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B, una versión podada y cuantizada a 4 bits del Qwen3.6-35B-A3B del equipo Qwen. El modelo original es un transformer MoE (mixture of experts) con 40 capas y 262.144 tokens de contexto; esta variante conserva 128 de los 256 expertos enrutados por capa (podados mediante REAP, ranked por peso del router multiplicado por la norma de salida del experto), mantiene el enrutamiento top-8 y deja 3B parámetros activos sobre un total de 18.543.997.568 parámetros.

El resultado es un modelo de aproximadamente 18,5B parámetros totales y 3B activos, empaquetado en 12,3 GB de safetensors cuantizados a 4 bits con group size 64, pensado para ejecutarse en Apple Silicon mediante MLX. El repositorio no re-cuantiza nada: los pesos, tokenizer, chat template y configuración son idénticos byte a byte al repositorio de mlx-community en el commit `4bbd5a4f7923c4fcf6064e25f628d9996d57da7d`, y solo se ha editado el índice de pesos para excluir el fichero de la torre de visión, que no se replica.

Su relevancia es doble: por un lado, ofrece una vía práctica para ejecutar localmente un MoE de 35B con contexto de 256K en equipos con memoria unificada moderada; por otro, sirve como distribución reproducible y auditada (hashes SHA-256 verificados) para instalaciones de la aplicación Craft, que fija este repositorio a un commit concreto. La licencia es Apache 2.0, heredada del modelo base de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5_moe` (transformer MoE), 40 capas |
| Parametros totales | 18.543.997.568 (~18,5B) |
| Parametros activos | ~3B (enrutamiento top-8) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 4-bit, group size 64 (512 modulos con ancho propio, mixed-precision) |
| Idiomas soportados | no disponible (la model card no lista idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3 shards, 1.757 tensores, 12,3 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer MoE de 40 capas con arquitectura `qwen3_5_moe`. Cada capa contiene 256 expertos enrutados, de los cuales se conservan 128 tras el podado REAP, manteniendo el enrutamiento top-8 original. El criterio de podado es el peso del router multiplicado por la norma de salida del experto, y los expertos conservados se copian bit a bit desde la cuantización de mlx-optiq. La cuantización es de 4 bits con group size 64, aplicada sobre 512 módulos con anchos propios (mixed-precision), lo que da como resultado 12,3 GB en safetensors repartidos en tres ficheros.

No hay información disponible en la documentación proporcionada sobre el volumen de tokens de entrenamiento, la composición del dataset ni sobre si se aplicaron fases de RLHF o DPO en el modelo original de Qwen. Tampoco se detallan innovaciones de decodificación especulativa ni mecanismos de atención lineal. El chat template incluye soporte de tool calling en formato XML de Qwen3-Coder, donde el modelo responde con un bloque `<tool_call>` con parámetros en texto plano entre etiquetas.

## Capacidades

- Generación de texto conversacional y de propósito general.
- Generación y edición de código, con soporte explícito del formato de tool calling XML de Qwen3-Coder (bloques `<tool_call>` con `<function=...>` y `<parameter=...>`).
- Tool calling / function calling estructurado.
- Razonamiento multi-paso y uso en agentes, derivado del soporte de herramientas y del contexto largo.
- Contexto de 262.144 tokens, adecuado para repositorios de código y documentos extensos.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión: el modelo base incluía una torre de visión (`optiq_vision.safetensors`), pero este espejo la excluye explícitamente; solo se distribuyen los pesos de texto.

## Casos de uso

- Edición de código asistida en local: el modelo puede recibir un fichero y devolver un `<tool_call>` de tipo `edit_file` con `path`, `old_string` y `new_string`, lo que permite integrarlo en un editor o agente de parcheo sin infraestructura en la nube.
- Agente de refactorización en pipelines de CI/CD: con 262.144 tokens de contexto puede cargar varios módulos de un repositorio y proponer cambios coherentes entre ficheros, invocando herramientas de lectura y escritura.
- Asistente de desarrollo en Apple Silicon: al estar en formato MLX 4-bit (12,3 GB), se puede ejecutar en Macs con memoria unificada suficiente mediante `mlx_lm.generate`, sin GPU dedicada.
- Análisis de documentación técnica extensa: el contexto de 256K permite resumir o consultar manuales, RFCs y especificaciones completas en una sola pasada.
- Generación de código en producción con tool calling: el formato XML estructurado facilita el parseo determinista de llamadas a funciones y su integración en orquestadores de agentes.
- Reproducibilidad de despliegues: al ser un espejo con hashes SHA-256 verificados y commit fijado, es adecuado para instalaciones que requieren bytes idénticos entre máquinas (por ejemplo, onboarding de la aplicación Craft).
- Automatización de tareas de mantenimiento de código: búsqueda, sustitución y verificación de patrones en bases de código grandes gracias al contexto largo y al enrutamiento eficiente (3B activos).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 12,3 GB de pesos en safetensors 4-bit; se recomienda al menos 16 GB de memoria unificada o VRAM para cargar el modelo con margen para KV cache.
- Al ser un MoE con 3B parámetros activos, el coste computacional por token es mucho menor que el de un denso de 18,5B, aunque la memoria residente corresponde al total de parámetros.
- GPU recomendadas: no disponibles en la información proporcionada; el formato MLX está orientado a Apple Silicon (M-series). No se documenta soporte para A100, H100 o RTX 4090 en esta variante.
- ¿Cabe en consumer GPU? El formato es MLX, por lo que el objetivo natural son Macs con memoria unificada; no se confirma compatibilidad con GPUs NVIDIA consumer en la información disponible.
- Opciones de despliegue: `mlx-lm` (comando `mlx_lm.generate` documentado en la model card). No se mencionan vLLM, llama.cpp, Ollama ni TGI para esta variante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|---|
| rao-studios/Qwen3.6-REAP-19B-A3B-mlx-4bit | ~18,5B | ~3B | 262.144 | 4-bit, group 64 | Apache 2.0 | safetensors MLX |
| mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B | ~18,5B (podado) | ~3B | 262.144 | 4-bit mixed-precision | Apache 2.0 | safetensors MLX |
| Qwen/Qwen3.6-35B-A3B | 35B | 3B | 262.144 | original (sin cuantizar) | Apache 2.0 | safetensors |

La diferencia principal frente al modelo de Qwen es el podado de expertos (256 a 128 por capa) y la cuantización a 4 bits, que reducen el tamaño de 35B a ~18,5B parámetros totales manteniendo los 3B activos y el contexto de 256K. Frente al repositorio de mlx-community, este espejo elimina la torre de visión y los metadatos del cuantizador, y añade verificación de hashes.

## Limitaciones y advertencias

- El podado REAP elimina la mitad de los expertos enrutados; puede degradar la calidad en dominios poco representados respecto al modelo original de 35B, aunque no se han publicado evaluaciones que lo cuantifiquen.
- Este espejo excluye la torre de visión: no admite entradas de imagen, a diferencia del modelo base completo.
- No se distribuyen ficheros de configuración de KV cache (`kv_config.json`) ni metadatos del cuantizador (`optiq_metadata.json`); el consumidor debe dimensionar su propia cache.
- No hay información sobre sesgos, tasas de alucinación ni cobertura idiomática en la documentación proporcionada.
- El formato es MLX, lo que limita el despliegue a entornos Apple Silicon con `mlx-lm`; no se documenta compatibilidad con otros runtimes.
- Licencia Apache 2.0: permite uso comercial, pero se debe conservar el aviso de licencia y atribución correspondiente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un espejo recién creado (17 de noviembre de 2026), sin validación comunitaria.
- Para producción, conviene fijar el commit `4bbd5a4f7923c4fcf6064e25f628d9996d57da7d` y verificar los SHA-256 listados en la model card.

## Enlaces

- Hugging Face: https://huggingface.co/rao-studios/Qwen3.6-REAP-19B-A3B-mlx-4bit
- Modelo base (mlx-community): https://huggingface.co/mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B
- Modelo original (Qwen): https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Commit del modelo base: `4bbd5a4f7923c4fcf6064e25f628d9996d57da7d`
- Commit del modelo Qwen referenciado para la licencia: `345d467b117d1fd5eda9b879a5988de9ae5f47a7`
