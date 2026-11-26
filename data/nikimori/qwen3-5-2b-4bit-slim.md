# nikimori/Qwen3.5-2B-4bit-slim

## Resumen

Qwen3.5-2B-4bit-slim es una derivación del modelo Qwen3.5-2B en cuantización de 4 bits para MLX, publicada por el usuario nikimori. Se trata de una versión "slim" del checkpoint `mlx-community/Qwen3.5-2B-4bit` en la que se han eliminado los 297 tensores correspondientes a la torre de visión (0,66 GB en bf16), conservando intactos los 694 tensores restantes. El resultado es un modelo exclusivamente de texto que reduce el tamaño de descarga de 1,72 GB a 1,06 GB sin alterar la salida de texto.

El modelo hereda la arquitectura Qwen3.5 de 2B parámetros (1.881.825.088 parámetros totales según los safetensors) y la licencia Apache-2.0 del checkpoint original. No introduce ningún cambio en la configuración, el tokenizer ni la plantilla de chat: la única modificación es la poda de los pesos de visión, que los cargadores de texto no leen de todos modos.

Su relevancia es práctica y acotada: está pensado para ejecutarse en Macs de 8 GB de memoria unificada, concretamente como motor de autocompletado y corrección de texto en la aplicación Pretype para macOS. Para desarrolladores que despliegan Qwen3.5-2B en entornos MLX sin necesidad de entrada de imagen, representa un ahorro de descarga y de espacio en disco con equivalencia funcional demostrada en la tarea de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer); pesos en MLX, sin torre de visión |
| Parametros totales | 1.881.825.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (cuantizacion MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), 1,06 GB en repo de 1,1 GB |

## Arquitectura y entrenamiento

El modelo es una poda del checkpoint `mlx-community/Qwen3.5-2B-4bit`, que a su vez es una conversión a MLX y cuantización a 4 bits del Qwen3.5-2B original. La arquitectura subyacente es la de la familia Qwen3.5, un transformer de 2B parámetros; la información proporcionada no detalla la composición del dataset de entrenamiento, el número de tokens, ni si hubo fases de RLHF o DPO.

La única intervención técnica de este build es la eliminación de 297 tensores `vision_tower.*` (0,66 GB en bf16). Los 694 tensores restantes se conservan byte a byte, y config, tokenizer y chat template quedan sin cambios. El autor reporta que mlx-lm 0.31.3 produce la misma salida que el build de origen, y que con decodificación greedy la salida es idéntica en 680 filas de la tarea "Fix" y 570 filas de la tarea "Reply" del arnés de evaluación de Pretype. La consecuencia funcional es que la entrada de imagen deja de funcionar en este build.

## Capacidades

- Generación de texto conversacional en formato chat (pipeline `text-generation`, tag `conversational`).
- Corrección de erratas y reescritura de texto: el arnés del autor mide la tarea "Fix" (restauración exacta de línea con errata en el 33% de los casos) y la tarea "Reply".
- Modo thinking desactivable mediante `enable_thinking=False` en la plantilla de chat.
- Ejecución en MLX sobre Apple Silicon, integrable con `mlx-lm`.
- Sin capacidades de visión en este build: la torre de imagen ha sido eliminada.
- Soporte de tool calling, agentes, matemáticas o código: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Autocompletado y corrección en macOS: es el caso de uso de diseño. La aplicación Pretype usa este modelo para los atajos de corrección y respuesta en Macs de 8 GB, enviando solo texto, de modo que la torre de visión eliminada no se echaba en falta.
- Corrección de erratas en editores de texto: el modelo puede recibir una frase con errores y devolver una versión corregida; el autor mide esta tarea de forma explícita ("Fix"), con restauración exacta de la línea en el 33% de los casos.
- Generación de respuestas cortas en asistentes de escritorio: la tarea "Reply" del arnés del autor valida la generación de respuestas breves a partir de texto, adecuada para sugerencias inline.
- Prototipado local en Apple Silicon: al ocupar 1,06 GB, permite cargar el modelo en portátiles con memoria unificada limitada para pruebas de pipelines de generación de texto con `mlx-lm`.
- Sustitución del checkpoint base en despliegues solo-texto: cualquier pipeline MLX que ya use `mlx-community/Qwen3.5-2B-4bit` para texto puede cambiar a este build y ahorrar 0,66 GB de descarga sin cambiar la salida, según las mediciones del autor.
- Distribución de aplicaciones de escritorio: al reducir el artefacto a 1,06 GB, es viable empaquetarlo como dependencia descargable de una app macOS sin incluir pesos de visión innecesarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta mediciones de su propio arnés de evaluación (Pretype, 2026-10-16, decodificación greedy):

| Metrica | mlx-community/Qwen3.5-2B-4bit | Este build |
|---|---|---|
| Fix: salida idéntica (680 filas) | — | 680 / 680 |
| Reply: salida idéntica (570 filas) | — | 570 / 570 |
| Fix: línea con errata restaurada exactamente | 33% | 33% |
| Descarga | 1,72 GB | 1,06 GB |

## Requisitos de hardware

- VRAM/memoria: el repo pesa 1,06 GB en 4 bits; el autor indica que funciona en Macs de 8 GB de memoria unificada.
- GPU: requiere Apple Silicon (MLX); no está pensado para CUDA. GPU recomendadas: no disponible.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con 8 GB o más de memoria unificada según el autor; no se documenta compatibilidad con GPUs NVIDIA de consumo.
- Despliegue: `mlx-lm` (versión 0.31.3 validada por el autor) mediante `from mlx_lm import load, generate`. Otras opciones (vLLM, llama.cpp, Ollama, TGI) no están soportadas por el formato MLX.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Tamano de descarga |
|---|---|---|---|---|---|
| nikimori/Qwen3.5-2B-4bit-slim | 1.881.825.088 | no disponible | No | Apache-2.0 | 1,06 GB |
| mlx-community/Qwen3.5-2B-4bit | no disponible | no disponible | Sí | Apache-2.0 (heredada) | 1,72 GB |
| Qwen3.5-2B (original) | 2B (aprox.) | no disponible | Sí | Apache-2.0 | no disponible |

La comparativa se limita al ecosistema inmediato del modelo; no se dispone de datos de benchmarks ni de contexto para comparar con alternativas de otros fabricantes.

## Limitaciones y advertencias

- Sin visión: la torre de imagen ha sido eliminada; cualquier entrada de imagen falla en este build.
- Solo MLX: los pesos están en formato MLX y requieren Apple Silicon; no son directamente utilizables en vLLM, llama.cpp u otros runtimes.
- Corrección de erratas limitada: el propio autor mide solo un 33% de restauración exacta de la línea con errata en su arnés, lo que indica un rendimiento modesto en esa tarea.
- Idiomas soportados no documentados: la model card no especifica cobertura lingüística.
- Longitud de contexto no documentada en la información disponible.
- Riesgo de alucinación y sesgos: no evaluados ni documentados por el autor.
- Licencia Apache-2.0: permite uso comercial, pero se hereda del checkpoint de origen y conviene verificar las condiciones del modelo Qwen3.5-2B original.
- Repo de autor individual con 239 descargas y 2 likes: soporte y mantenimiento limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nikimori/Qwen3.5-2B-4bit-slim
- Modelo base: https://huggingface.co/mlx-community/Qwen3.5-2B-4bit
- Aplicación Pretype: https://github.com/nikiomori/Pretype
