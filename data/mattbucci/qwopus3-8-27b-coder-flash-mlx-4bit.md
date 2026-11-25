# mattbucci/Qwopus3.8-27B-Coder-Flash-MLX-4bit

## Resumen

Qwopus3.8-27B-Coder-Flash-MLX-4bit es una conversión a formato MLX y cuantización de 4 bits del modelo Jackrong/Qwopus3.8-27B-Coder-Flash, un ajuste fino orientado a agentes de código sobre Qwen3.8-27B. El modelo original es un transformer denso de la familia Qwen3.5 con arquitectura híbrida DeltaNet, que combina capas de atención completa con capas de atención lineal recurrente, e incorpora la torre de visión del modelo base. Esta versión MLX está pensada para ejecutarse en Apple Silicon mediante la librería mlx-vlm y el backend MLX de SGLang.

El modelo resuelve el problema de desplegar un modelo de 27.000 millones de parámetros con capacidades de código, agentes, tool calling y visión en hardware de consumo con memoria unificada, manteniendo un equilibrio entre precisión y huella de memoria. Con 27.356.728.560 parámetros y un repositorio de 16,1 GB, la cuantización deja el modelo en aproximadamente 16 GB de memoria unificada más la caché KV, lo que permite su ejecución en equipos como un Mac con M4 Pro y 64 GB de RAM.

Su relevancia actual radica en que ofrece un pipeline validado de cuantización selectiva (bf16 para módulos sensibles, 4 bits para el resto) con pruebas de corrupción por capa, decodificación de aproximadamente 13-15 tokens por segundo en un solo usuario y soporte de contexto largo verificado hasta 128K tokens. Está publicado bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido DeltaNet (Qwen3.5-class): 48 capas de atención lineal recurrente y 16 capas de atención completa, con torre de visión |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | Verificado hasta 128K tokens realizados (pruebas multi-needle a 32K, 64K y 128K) |
| Tipos de cuantizacion | 4 bits afín con group size 64 (4,7 bits por peso en promedio); módulos selectivos en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), biblioteca mlx |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Qwen3.5 con arquitectura híbrida DeltaNet: 64 capas en total, de las cuales 48 son capas de atención lineal recurrente (DeltaNet) y 16 son capas de atención completa. Incluye además la torre de visión del modelo Qwen3.8-27B original (27 bloques más merger y patch embed). El ajuste fino lo realizó Jackrong sobre unsloth/Qwen3.8-27B (Qwen/Qwen3.8-27B), orientado a tareas de código y agentes; la model card remite a la ficha del modelo fuente para la receta de destilación y sus evaluaciones, que no se detallan aquí.

La contribución técnica de esta versión es la receta de cuantización: no es una conversión estándar de mlx_vlm. Los módulos que contienen escalares de compuerta de estado recurrente y la torre de visión se mantienen en bf16, mientras que el resto se cuantiza a 4 bits. En concreto, se mantienen en bf16 `linear_attn.in_proj_a` / `in_proj_b` (48 capas DeltaNet), todas las normas, `conv1d` y la torre de visión completa; se cuantizan `lm_head`, `embed_tokens`, las proyecciones q/k/v/o de atención (16 capas), `linear_attn.in_proj_qkv` / `in_proj_z` / `out_proj` y las compuertas y proyecciones MLP (64 capas). En total, 402 de 922 módulos cuantizados, con un escaneo de corrupción por capa sobre pesos, escalas y sesgos. También se elimina el `processor_config.json` que escribe transformers 5.x (que nombra `Qwen3VLImageProcessor` y `AutoProcessor` no puede resolver) y se usa `preprocessor_config.json` con el procesador de imagen Qwen2VL.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento siempre activo: la plantilla de chat razona por defecto y `enable_thinking` en `chat_template_kwargs` no tiene efecto.
- Generación de código: validada con pruebas de codegen (2 tareas, 8 tests, 8/8) y parches SWE-bench Lite.
- Tool calling y function calling: las pruebas básicas de llamada a herramientas terminan correctamente (3/3).
- Capacidades de agente y razonamiento multi-paso: parches no vacíos en 23/26 instancias de SWE-bench Lite con opencode.
- Visión: pipeline image-text-to-text, con pruebas de imagen y de vídeo (ambas direcciones de movimiento) calificadas como STRONG.
- Contexto largo: recuperación multi-needle 6/6 a 32K, 64K y 128K tokens realizados.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Agente de código autónomo en local: el modelo puede ejecutar tareas de resolución de issues tipo SWE-bench (parches sobre ficheros canónicos) en un Mac con memoria unificada, gracias a su ventana de contexto verificada hasta 128K y a su soporte de tool calling.
- Asistencia de programación en el IDE: con decodificación de 13-15 tokens por segundo en un solo usuario, es viable para autocompletado y generación de funciones con razonamiento previo, recomendando `max_tokens` generoso por el modo de pensamiento.
- Automatización de pipelines CI/CD: puede integrarse en flujos que generen parches y los validen con pruebas, como demuestra el smoke test sealed de SWE-bench Lite con opencode.
- Análisis de documentos técnicos con imágenes: al incorporar la torre de visión, puede procesar diagramas, capturas de pantalla o esquemas junto con texto en tareas de image-text-to-text.
- Procesamiento de vídeo para inspección: las pruebas de vídeo en ambas direcciones de movimiento lo hacen apto para tareas de comprensión de secuencias visuales cortas.
- Despliegue en estación de trabajo Apple Silicon: mediante mlx-vlm o el backend MLX de SGLang, permite servir el modelo en un equipo M4 Pro de 64 GB sin GPU dedicada.
- Recuperación sobre repositorios grandes: la ventana de 128K y la recuperación multi-needle verificada permiten consultar bases de código extensas con múltiples referencias cruzadas.

## Benchmarks y rendimiento

| Benchmark | Este modelo (MLX 4-bit) | Qwen3.8-27B-4bit (stock) |
|---|---|---|
| MMLU (100) | 83% | 84% |
| HumanEval (20) | 90% | 90% |
| LAB-Bench (50) | 37,5% | 38,7% |
| Needle (1K, 4K, 16K, 64K) | 4/4 | 4/4 |
| SWE-bench Lite 26 instancias (parches no vacíos) | 23/26 | 22/26 |
| SWE-bench Lite 26 instancias (fichero canónico) | 22/26 | 21/26 |
| Multi-needle 32K / 64K / 128K | 6/6 en cada nivel | 6/6 |
| Decodificación tok/s @1K / 8K / 32K | 14,6 / 14,2 / 13,2 | igual |
| Decodificación tok/s @128 → @32K | 15,0 → 13,4 | igual a Qwen3.6-27B-4bit |

Como referencia adicional, Qwen3.6-35B-A3B MoE obtiene 26/26 parches no vacíos en las mismas instancias de SWE-bench Lite. La puntuación de resolución con Docker de SWE-bench está pendiente según la model card.

## Requisitos de hardware

- VRAM/memoria unificada estimada: unos 16 GB de memoria unificada más la caché KV; el repositorio ocupa 16,1 GB en disco.
- GPU recomendadas: Apple Silicon con memoria unificada; validado en Apple M4 Pro con 64 GB. No se proporcionan datos para GPU NVIDIA o AMD.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente (validado con 64 GB); no hay datos para GPUs de consumo NVIDIA.
- Opciones de despliegue: mlx-vlm (`python -m mlx_vlm.generate`) y backend MLX de SGLang mediante el repositorio mattbucci/m4-sglang-inference. No se mencionan llama.cpp, Ollama, vLLM ni TGI para este formato.
- Latencia y throughput: 14,6 tok/s a 1K, 14,2 a 8K y 13,2 a 32K en un solo usuario; 15,0 tok/s a contexto 128 y 13,4 a 32K.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | HumanEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwopus3.8-27B-Coder-Flash-MLX-4bit | 27,36B denso | 128K verificado | 83% | 90% | Apache-2.0 | MLX, safetensors |
| Qwen3.8-27B-4bit (stock) | 27B denso | 128K verificado | 84% | 90% | no disponible en la información | 4 bits |
| Qwen3.6-27B-4bit | 27B denso | no disponible | no disponible | no disponible | no disponible | 4 bits |
| Qwen3.6-35B-A3B MoE | 35B totales (MoE) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modo de pensamiento está siempre activo y `enable_thinking` no tiene efecto; conviene asignar `max_tokens` generosos en peticiones de código para evitar respuestas truncadas.
- La evaluación de SWE-bench Lite mide solo la generación de parches no vacíos y su coincidencia con el fichero canónico; la puntuación de resolución real con Docker está pendiente, por lo que el rendimiento en resolución efectiva no está confirmado.
- La cuantización introduce una degradación leve: MMLU baja de 84% a 83% y LAB-Bench de 38,7% a 37,5% respecto al modelo stock de 4 bits.
- El modelo está validado únicamente en Apple Silicon (M4 Pro, 64 GB) con mlx-vlm y SGLang MLX; no hay datos de rendimiento en otras plataformas.
- Los idiomas soportados no están documentados en la información disponible.
- Riesgo de alucinación y sesgos: no se documentan en la model card; deben asumirse los del modelo base Qwen3.8-27B.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar la ficha del modelo base y del ajuste fino para condiciones adicionales.
- La receta de cuantización es específica y no estándar; reproducirla requiere los scripts del repositorio mattbucci/m4-sglang-inference.

## Enlaces

- Hugging Face: https://huggingface.co/mattbucci/Qwopus3.8-27B-Coder-Flash-MLX-4bit
- Modelo base (ajuste fino): https://huggingface.co/Jackrong/Qwopus3.8-27B-Coder-Flash
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo unsloth: https://huggingface.co/unsloth/Qwen3.8-27B
- Repositorio de inferencia y scripts de cuantización: https://github.com/mattbucci/m4-sglang-inference
- Perfil del autor del ajuste fino: https://huggingface.co/Jackrong
