# ObviousSalamander/Qwen3.8-27B-OptiQ-4bit

## Resumen

Qwen3.8-27B-OptiQ-4bit es una cuantización mixta del modelo denso multimodal Qwen3.8-27B, desarrollada por el usuario ObviousSalamander y publicada en Hugging Face. El modelo base, lanzado por el equipo Qwen de Alibaba, combina un componente de visión y un componente de lenguaje en una arquitectura Qwen3.5, con un total de 27 000 millones de parámetros y una ventana de contexto de 262 000 tokens. Esta versión cuantizada utiliza el método OptiQ (data-driven sensitivity-based quantization) para asignar 8 bits a las capas más sensibles a la cuantización y 4 bits al resto, logrando un tamaño efectivo de 4.93 bits por peso (bpw).

La relevancia de esta build radica en que ofrece un equilibrio entre calidad y eficiencia para ejecutar el modelo en hardware de consumo, especialmente en Apple Silicon mediante el ecosistema MLX. A diferencia de una cuantización uniforme de 4 bits, que en este modelo denso degenera en bucles de repetición, la mezcla de precisión de OptiQ preserva la fidelidad de las capas críticas (embeddings, atención temprana y media, partes de MLP) mientras mantiene un tamaño de archivo cercano a 19 GB. El repositorio incluye la torre de visión integrada en los shards estándar de MLX, permitiendo uso tanto para texto como para imagen.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (dense multimodal, vision + language) |
| Parametros totales | 5.691.428.080 (según safetensors; el modelo base Qwen3.8-27B tiene 27.7B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (según especificación del modelo base) |
| Tipos de cuantizacion | Mixta 4-bit y 8-bit (4.93 bpw, 249 capas en 8-bit y 247 en 4-bit) |
| Idiomas soportados | Multilingüe (principalmente inglés, chino y otros) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX layout, con modelo y torre de visión en shards) |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo denso multimodal que combina un encoder de visión con un decoder de lenguaje basado en la arquitectura Qwen3.5. El modelo base fue entrenado por Alibaba con un dataset masivo de texto e imágenes, incluyendo fases de pre-entrenamiento y ajuste fino con instrucciones, así como técnicas de optimización para razonamiento y tareas agénticas. La cuantización aquí presentada no modifica la arquitectura; es una conversión a precisión mixta realizada con OptiQ 0.4.22, que ejecuta un análisis de sensibilidad KL por capa para decidir si cada capa se representa en 4 u 8 bits. El resultado es un modelo de 4.93 bpw, con aproximadamente la mitad de las capas en 8 bits, que mantiene una calidad superior a una cuantización uniforme de 4 bits en modelos densos.

El proceso de conversión (documentado en el repositorio) descarga el original en bf16 (55.6 GB), aplica OptiQ con `--target-bpw 4.75 --candidate-bits 4,8` y posteriormente re-mergea la torre de visión (que OptiQ guarda por separado) en los shards principales con el prefijo `model.visual.*`, ajustando el índice de safetensors para el layout estándar de MLX. No se ha publicado información sobre el dataset de entrenamiento del modelo base, ni sobre si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y conversación multimodal: acepta imágenes y texto como entrada, y produce respuestas en lenguaje natural.
- Razonamiento avanzado y resolución de problemas complejos, incluyendo matemáticas y lógica.
- Generación de código y comprensión de código en múltiples lenguajes de programación.
- Soporte de *function calling* y *tool use* (integrado en el modelo base).
- Capacidades agénticas: planificación de tareas de largo alcance y manejo de entornos interactivos (por ejemplo, sistemas operativos, terminales).
- Multilingüe: funciona en inglés, chino y otros idiomas, aunque el rendimiento puede variar.
- Procesamiento de imágenes: descripción de imágenes, respuesta a preguntas visuales y razonamiento sobre contenido visual.
- Modo de razonamiento controlable (thinking / non-thinking) según el prompt, como en el modelo base.

## Casos de uso

- Asistente de atención al cliente multimodal: puede procesar capturas de pantalla o fotos de productos junto con consultas de texto, manteniendo conversaciones de múltiples turnos con contexto largo gracias a los 262K tokens de ventana.
- Generación de código en producción: integrable en pipelines de CI/CD para autocompletar código, revisar cambios y sugerir refactorizaciones, con soporte de tool calling para invocar herramientas externas.
- Agente autónomo para automatización de oficina: capaz de leer documentos, extraer datos y ejecutar acciones en aplicaciones (por ejemplo, crear hojas de cálculo o redactar correos), aprovechando su capacidad de razonamiento de largo plazo.
- Asistente de investigación técnica: responde preguntas sobre papers, resume artículos y ayuda a explorar conceptos científicos, con apoyo en imágenes de figuras o diagramas.
- Desarrollo de aplicaciones de visión por computador: permite crear prototipos de sistemas de pregunta-respuesta visual (VQA) sobre imágenes de productos o documentos.
- Despliegue local en equipos de desarrollo: al estar cuantizado en MLX, se puede ejecutar en Macs con chip M4 Pro (64 GB) para pruebas y desarrollo sin depender de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) específicamente para esta cuantización. La model card solo incluye mediciones de rendimiento de inferencia en un Mac mini M4 Pro (64 GB) con mlx-vlm 0.6.13, usando MTP-4bit drafter, con `max_tokens=256`:

| tipo de tarea | contexto | modo | velocidad (tok/s) | prefill (t/s) |
|---|---|---|---|---|
| creativa | 2k | non_think | 17.58 | ~116 |
| creativa | 8k | non_think | 17.84 | ~125 |
| creativa | 16k | non_think | 17.27 | ~106 |
| programación | 2k | non_think | 20.83 | ~116 |
| programación | 8k | non_think | 19.79 | ~125 |
| programación | 16k | non_think | 18.57 | ~106 |
| decisión | 2k | non_think | 20.13 | ~116 |
| decisión | 8k | non_think | 18.86 | ~125 |
| decisión | 16k | non_think | 13.54 | ~106 |

En general, el rendimiento se mantiene estable hasta 16K de contexto, con prefill de ~106-127 t/s. El autor indica que esta build es comparable en velocidad a una cuantización uniforme de 4 bits pero con mejor fidelidad. Los benchmarks del modelo base (DeepSWE 42.2, Terminal Bench 73.0, OSWorld 84.3) son del modelo original, no de esta cuantización.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 18-20 GB (peso de ~19 GB en disco). En una GPU con 24 GB (por ejemplo, RTX 4090) se puede ejecutar con margen.
- GPU recomendadas: Apple Silicon (M4 Pro, M4 Max, etc.) con al menos 32 GB de memoria unificada para el uso completo; en GPUs NVIDIA, se puede cargar en RTX 4090, A100 (40 GB) o H100.
- En consumer GPU: cabe en una RTX 3090/4090 (24 GB) o en una RTX 4080 (16 GB) si se reduce el contexto.
- Opciones de despliegue: MLX (para Apple Silicon), vLLM (para GPUs NVIDIA), llama.cpp (para CPU/GPU variado), Ollama (si se convierte a GGUF). Esta build está en formato safetensors MLX, por lo que requiere conversión a otros formatos si se usan otras librerías.
- Latencia y throughput: según las mediciones, ~17-21 tok/s en Apple Silicon con mlx-vlm; en GPUs de alto rendimiento puede ser mayor.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-OptiQ-4bit (esta build) | Dense multimodal | 27B (peso cuantizado ~5.7B en safetensors) | 262K | Mixta 4/8-bit (4.93 bpw) | Apache-2.0 | Hugging Face |
| Qwen3.8-27B (original bf16) | Dense multimodal | 27B | 262K | bf16 (55.6 GB) | Apache-2.0 | Hugging Face |
| Qwen3.8-27B uniform 4-bit (comunidad) | Dense multimodal | 27B | 262K | 4-bit uniforme (4.50 bpw) | Apache-2.0 | Hugging Face |

La cuantización uniforme 4-bit en modelos densos tiende a degenerar en bucles de repetición, según la model card, mientras que la mixta OptiQ evita ese problema manteniendo un tamaño similar. La versión bf16 es la de mayor fidelidad pero requiere más memoria y almacenamiento.

## Limitaciones y advertencias

- Esta es una cuantización mixta, no un modelo uniforme de 4 bits. El nombre "4bit" hace referencia al presupuesto objetivo (4.75 bpw), pero la mitad de las capas se mantienen en 8 bits, por lo que no es comparable directamente a una cuantización plana de 4 bits.
- El modelo puede presentar alucinaciones, especialmente en tareas de razonamiento complejo o cuando el contexto es ambiguo, al igual que el modelo base.
- La licencia Apache-2.0 permite uso comercial, pero se deben respetar las condiciones de la licencia y citar la fuente.
- El rendimiento en idiomas distintos del inglés y chino puede ser inferior.
- La ventana de contexto de 262K tokens es la especificación del modelo base; en la práctica, el uso de contexto largo puede degradar el rendimiento o aumentar la latencia, como se observa en los benchmarks (la tarea de decisión cae a 13.54 tok/s a 16K).
- Para el uso de visión, es imprescindible usar `apply_chat_template` con `num_images=1`; no se debe pasar el token `<|image_pad|>` manualmente porque el modelo devuelve una salida vacía.
- El número de parámetros listado en safetensors (5.69B) es inconsistente con el tamaño del modelo base (27B); el autor no aclara la causa, por lo que se recomienda verificar el contenido del repositorio antes de usarlo en producción.
- No se han publicado resultados de evaluación de calidad (MMLU, HumanEval, etc.) para esta cuantización; el rendimiento de tareas puede diferir del modelo base.

## Enlaces

- [Hugging Face - ObviousSalamander/Qwen3.8-27B-OptiQ-4bit](https://huggingface.co/ObviousSalamander/Qwen3.8-27B-OptiQ-4bit)
- [Guía completa de Qwen3.8-27B (lovableapp.org)](https://lovableapp.org/blog/qwen3-8-27b)
- [Repositorio oficial de Qwen3.8-27B (GitHub)](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [Página de Qwen3.8-27B en LM Studio](https://lmstudio.ai/models/qwen/qwen3.8-27b)
- [OptiQ (GitHub)](https://github.com/prncc/optiq)
