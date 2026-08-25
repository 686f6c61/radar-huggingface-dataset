# bowmanslayer/Qwen3.5-9B-Uncensored-W4A16

## Resumen

El modelo `bowmanslayer/Qwen3.5-9B-Uncensored-W4A16` es una cuantización de 4 bits (W4A16) de un modelo abliterado de la familia Qwen 3.5. El autor, bowmanslayer, parte del modelo base `Qwen/Qwen3.5-9B`, le aplica una técnica de abliteración que elimina el alineamiento de seguridad (refusals) y posteriormente cuantiza el resultado con AutoRound en formato GPTQ. El resultado es un modelo multimodal (imagen-texto) de 9B parámetros que conserva la mayor parte de las capacidades del original, con una tasa de rechazo de peticiones dañinas cercana a cero.

La relevancia de este modelo radica en que combina tres características difíciles de encontrar juntas: alta retención de capacidades (media de 76,93 en 11 benchmarks), brevedad en las respuestas y eliminación completa de los rechazos. Además, la cuantización W4A16 con KV cache en `fp8_e5m2` permite un uso eficiente de memoria, ampliando la longitud de contexto práctica hasta un 60-80 % más que modelos del mismo tamaño en la misma GPU. Es una opción para quienes necesitan un LLM multimodal sin restricciones de seguridad, como en investigación de alineamiento o generación creativa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (Qwen3.5) |
| Parametros totales | 9B (modelo base); safetensors reporta 3.422.379.248 |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens (modelo base); recomendado 28.672 con fp8 KV |
| Tipos de cuantizacion | W4A16 (INT4 peso + FP16 activacion), GPTQ (AutoRound) |
| Idiomas soportados | ingles, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (GPTQ), GGUF (repo hermano) |

## Arquitectura y entrenamiento

El modelo base es `Qwen/Qwen3.5-9B`, un transformer denso multimodal con entrada de imagen y texto, desarrollado por el equipo de Qwen. El autor de este repo aplica una estrategia de abliteration (eliminación del alineamiento de seguridad) sobre el modelo base, seguida de una cuantizacion W4A16 mediante AutoRound y convertida a formato GPTQ para su uso con el kernel `gptq_marlin` en vLLM. No se han publicado datos detallados del entrenamiento original (tokens, composición del dataset), pero la model card indica que se probó una nueva estrategia de abliteration que consigue el mejor equilibrio entre retención de capacidades, brevedad de respuestas y eliminación de rechazos en modelos de 9B.

El proceso de cuantizacion no degrada significativamente las capacidades: una comprobación de 450 items en 3 tareas muestra una diferencia absoluta de +0,22 respecto al modelo bf16 de referencia. Además, se recomienda usar KV cache en `fp8_e5m2` para maximizar la capacidad de contexto en entornos con memoria limitada.

## Capacidades

- Generación de texto y razonamiento multimodal (imagen + texto).
- Razonamiento con "thinking mode" activable (requiere `--reasoning-parser qwen3` en vLLM).
- Resolución de tareas de matemáticas (GSM8K, MATH-500), lógica (BBH) y conocimiento general (MMLU, CMMLU, MMLU-Pro).
- Generación de código (HumanEval 82,93) y seguimiento de instrucciones (IFEval 73,00).
- Capacidades multilingües en inglés y chino.
- Sin rechazo de peticiones dañinas (0/10 en comprobación rápida), por lo que puede generar contenido no apto para todo público.
- Soporte de entrada multimodal (imagen y texto) y salida de texto.

## Casos de uso

- **Investigación en alineamiento y seguridad de IA**: el modelo sirve como banco de pruebas para estudiar cómo los sistemas de alineamiento pueden ser eliminados y qué consecuencias tiene en el comportamiento. Se puede usar para comparar con el modelo base y otros abliterated.
- **Evaluación de modelos de lenguaje**: al mantener una alta retención de capacidades (media 76,93 en 11 benchmarks), es útil para probar el impacto de la cuantizacion y la abliteration en el rendimiento.
- **Generación de contenido creativo sin restricciones**: para proyectos que necesitan explorar temas sensibles o no convencionales sin el filtro de seguridad, como escritura creativa, narrativa interactiva o generación de guiones.
- **Asistente conversacional en inglés y chino**: dado su soporte bilingüe y su baja tasa de rechazo, puede usarse en chatbots de nicho que requieren respuestas directas en estos idiomas.
- **Análisis de imágenes con razonamiento**: al ser multimodal, puede describir o razonar sobre imágenes en contextos donde no se requiere moderación de contenido, como análisis de imágenes médicas en investigación (con supervisión humana).
- **Prototipado de agentes y razonamiento multi-step**: con el modo de razonamiento activado, se puede utilizar en pipelines de agentes que necesitan planificar y ejecutar tareas complejas sin interrupciones por políticas de seguridad.

## Benchmarks y rendimiento

La model card presenta una comparativa de 11 benchmarks entre el modelo base, dos variantes abliterated de la comunidad y este modelo. Los resultados son del modelo bf16 de referencia (la cuantización W4A16 no degrada significativamente, con una diferencia de +0,22 en 450 items). El modelo destaca especialmente en MMLU-Pro (78,67), BBH (86,00), GSM8K (77,00) e IFEval (73,00), superando al modelo base en varios de ellos.

| Benchmark | N | Base (Qwen3.5-9B) | Heretic-v2 | Huihui | Este modelo |
|---|---|---|---|---|---|
| MMLU | 150 | 82,00 | 71,33 | 53,33 | **80,67** |
| CMMLU | 150 | 85,33 | 83,33 | 70,67 | **86,00** |
| MMLU-Pro | 150 | 76,00 | 58,00 | 44,67 | **78,67** |
| C-Eval | 150 | 80,67 | **80,67** | 62,67 | 79,33 |
| ARC-Challenge | 150 | 94,00 | 90,00 | 78,67 | **94,00** |
| TruthfulQA | 150 | 78,00 | 61,33 | 44,00 | 62,68 † |
| GSM8K | 100 | 74,00 | 55,00 | 46,00 | **77,00** |
| MATH-500 | 100 | 51,00 | **55,00** | 41,00 | 46,00 |
| BBH | 150 | 84,00 | 82,67 | 63,33 | **86,00** |
| HumanEval | 164 | 87,20 | **89,63** | 78,05 | 82,93 |
| IFEval | 100 | 60,00 | 72,00 | 62,00 | **73,00** |
| **Media** | — | **77,47** | 72,63 | 58,58 | **76,93** |

† TruthfulQA: la ejecución en serie con otros benchmarks produjo una puntuación de 54; en ejecución aislada obtiene 62,68, que es el valor justo.

En la prueba de rechazo, el modelo bf16 de referencia rechaza solo 2 de 100 prompts dañinos (frente a 99 del base) y responde a 50/50 prompts inofensivos. La versión W4A16 obtuvo 0/10 rechazos en una comprobación rápida.

## Requisitos de hardware

- **Tamaño del modelo**: 8,2 GB (W4A16), por lo que puede caber en una GPU consumer de 12-16 GB (RTX 3080, 4070, 4090) con cuantización adicional o con `gpu-memory-utilization` ajustada.
- **VRAM estimada**: para una sola GPU, se recomienda al menos 12 GB para inferencia con contexto moderado. Con KV cache en `fp8_e5m2`, el uso de memoria se reduce.
- **GPU recomendadas**: vLLM con tensor-parallel-size=2 (por ejemplo, 2× A100 40 GB o 2× RTX 4090) para máxima capacidad de contexto; también funciona en una sola GPU de 24 GB (p. ej., RTX 4090) con `--tensor-parallel-size 1`.
- **Opciones de despliegue**: vLLM (recomendado, con `gptq_marlin` y `fp8_e5m2` KV), llama.cpp/Ollama a través del repo GGUF hermano.
- **Latencia**: no se proporcionan datos de throughput específicos, pero el kernel `gptq_marlin` está optimizado para vLLM y se espera una latencia baja en hardware moderno.

## Comparativa con modelos similares

El modelo se compara directamente con el base `Qwen/Qwen3.5-9B` y con dos variantes abliterated de la comunidad: `Heretic-v2` y `Huihui-Qwen3.5-9B-abliterated`. En la tabla de benchmarks se observa que este modelo mantiene un rendimiento muy cercano al base (media 76,93 vs 77,47) mientras elimina casi todos los rechazos, superando a los otros abliterated en 7 de 11 benchmarks.

| Modelo | Parametros | Contexto | Media (11 benchmarks) | Refusal rate (100 prompts) | Licencia |
|---|---|---|---|---|---|
| Qwen3.5-9B (base) | 9B | 131K | 77,47 | 99/100 | Apache-2.0 |
| Qwen3.5-9B-heretic-v2 | 9B | no disp. | 72,63 | 1/100 | no disp. |
| Huihui-Qwen3.5-9B-abliterated | 9B | no disp. | 58,58 | 0/100 | no disp. |
| **Este modelo (bf16/W4A16)** | 9B | 131K (base) | **76,93** | **2/100** | Apache-2.0 |

## Limitaciones y advertencias

- **Contenido dañino**: el modelo ha sido deliberadamente desprovisto de alineamiento de seguridad. Puede generar contenido ofensivo, peligroso o ilegal. No debe desplegarse a terceros sin una capa de seguridad adicional.
- **Sesgos y alucinación**: como cualquier LLM, puede producir información falsa o sesgada, especialmente en temas sensibles. La tasa de alucinación no ha sido evaluada específicamente.
- **Idiomas**: solo soporta inglés y chino; no está optimizado para otros idiomas, incluido el español.
- **Contexto**: aunque el modelo base tiene 131K tokens, la configuración recomendada en vLLM con fp8 KV limita a 28.672 tokens para evitar desbordamiento de memoria en GPUs típicas. Para contexto completo se necesitan GPUs de alta memoria.
- **Licencia y uso**: licencia Apache-2.0, pero el acceso al repositorio está restringido por un formulario de confirmación (debe ser mayor de edad, no desplegarlo a terceros sin capa de seguridad, y aceptar responsabilidad legal). No se han publicado datos de entrenamiento originales.
- **Cuantización**: aunque la model card indica que la cuantización no degrada significativamente la capacidad, la precisión puede verse afectada en tareas de razonamiento complejo (p. ej., MATH-500 baja de 51 a 46 respecto al base).

## Enlaces

- [Modelo en HuggingFace (W4A16)](https://huggingface.co/bowmanslayer/Qwen3.5-9B-Uncensored-W4A16)
- [Modelo base bf16 (bowmanslayer)](https://huggingface.co/bowmanslayer/Qwen3.5-9B-Uncensored)
- [Modelo original Qwen3.5-9B](https://huggingface.co/Qwen/Qwen3.5-9B)
- [Repo GGUF (llama.cpp)](https://huggingface.co/bowmanslayer/Qwen3.5-9B-Uncensored-GGUF)
- [Dataset harmful_behaviors (mlabonne)](https://huggingface.co/datasets/mlabonne/harmful_behaviors)
- [Dataset harmless_alpaca (mlabonne)](https://huggingface.co/datasets/mlabonne/harmless_alpaca)
- [Variante en Ollama (jaahas/qwen3.5-uncensored)](https://ollama.com/jaahas/qwen3.5-uncensored)
- [Guía de instalación y benchmark (codersera)](https://codersera.com/blog/unrestricted-uncensored-qwen35-9b-abliterated-full-guide/)
