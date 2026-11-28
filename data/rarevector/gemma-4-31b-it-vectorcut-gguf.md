# rarevector/gemma-4-31B-it-VectorCut-GGUF

## Resumen

gemma-4-31B-it-VectorCut-GGUF es una release cuantizada en formato GGUF del checkpoint quirúrgicamente modificado RareVector/gemma-4-31B-it-VectorCut-BF16, publicado por el usuario independiente rarevector (Rare Vector Labs). Se trata de una variante del modelo multimodal Gemma 4 de 31B parámetros en su versión instruction-tuned, en la que se ha aplicado una técnica denominada "VectorCut": una ablación selectiva de 33 "interruptores de rechazo" (99 tensores gated-MLP) manteniendo intactos el resto de pesos, incluidas las capas de atención, embeddings, layer norms y los 356 tensores del proyector de visión.

El objetivo declarado es eliminar comportamientos de rechazo (refusals) preservando la capacidad de razonamiento, matemáticas, instrucciones y visión del modelo original. Según la model card, 1.089 de 1.188 tensores permanecen bit a bit idénticos al modelo base, verificado mediante checksums SHA-256 por tensor, y las cuantizaciones se han calibrado con imatrix para minimizar la degradación.

La relevancia de esta ficha radica en dos aspectos: por un lado, documenta una release comunitaria de un modelo de frontera abierto con contexto de 256K y capacidades multimodales; por otro, ilustra una práctica controvertida (eliminación de salvaguardas) cuyas implicaciones éticas y de cumplimiento deben evaluarse con cuidado antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (Gemma 4), con proyector de visión (`mmproj`) y modo de pensamiento integrado |
| Parametros totales | 30.697.345.596 (aproximadamente 30,7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | `Q8_0`, `Q6_K_L`, `Q4_K_L` (calibradas con imatrix); versiones MLX 8/6/4-bit en repos separados |
| Idiomas soportados | 35+ idiomas declarados (en, de, fr, es, it, pt, nl, pl, ru, uk, cs, sv, da, fi, no, tr, ar, he, hi, bn, ta, te, ur, vi, th, id, ms, zh, ja, ko, el, ro, hu, bg, fa, sw, tl); preentrenado en 140+ idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp, LM Studio, Ollama, KoboldCpp) + `mmproj` para visión + fichero `imatrix` |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 4 en su variante de 31B parámetros densa, instruction-tuned y multimodal (pipeline `image-text-to-text`). Incorpora un proyector de visión separado (`mmproj`) con 356 tensores, un modo de pensamiento (thinking mode) integrado y una ventana de contexto de 256K tokens. La model card menciona además un cabezal de borrador de Multi-Token Prediction (MTP) disponible en las builds MLX, aunque no se especifica si está presente en los GGUF.

La modificación VectorCut consiste en ajustar únicamente 99 tensores gated-MLP (33 "interruptores de rechazo") sobre el checkpoint BF16, dejando el resto sin tocar. El autor afirma haber verificado con SHA-256 por tensor que 1.089 de 1.188 tensores son idénticos bit a bit al original, incluido el 100% de las capas de visión y atención. Las cuantizaciones GGUF se han calibrado con imatrix para reducir la pérdida de precisión. No se detallan en la información disponible los datos de entrenamiento originales de Gemma 4 (número de tokens, composición del dataset, uso de RLHF/DPO), más allá de la mención a preentrenamiento en 140+ idiomas.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 256K tokens.
- Razonamiento profundo mediante modo de pensamiento (thinking mode) integrado.
- Capacidades matemáticas y de razonamiento de sentido común (evaluadas en GSM8K-CoT).
- Seguimiento de instrucciones complejas (evaluado en IFEval).
- Comprensión de imágenes a través del proyector de visión `mmproj` (image-text-to-text).
- Soporte multilingüe amplio: 35+ idiomas declarados, preentrenamiento en 140+ idiomas.
- Escritura creativa, ficción, worldbuilding y brainstorming (objetivo explícito de la release).
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni orquestación de agentes multi-paso.

## Casos de uso

- Escritura creativa y ficción larga: el modelo conserva el modo de pensamiento y una ventana de 256K tokens, lo que permite mantener coherencia narrativa en novelas, guiones o worldbuilding extenso sin truncar el contexto.
- Asistencia matemática y razonamiento paso a paso: con un rendimiento reportado del 96,66% en GSM8K-CoT, es adecuado para tutoría, verificación de cálculos y resolución de problemas encadenados.
- Análisis de documentos largos con imágenes: la combinación de contexto de 256K y proyector de visión permite procesar informes, contratos o papers con figuras y tablas en una sola pasada.
- Atención al cliente multilingüe: los 35+ idiomas declarados y el contexto largo permiten gestionar conversaciones multi-turno con historial extenso en mercados internacionales.
- Generación de contenido sin restricciones temáticas: la release está orientada explícitamente a creatividad sin filtros de rechazo, útil para escritura de ficción con temas sensibles (siempre que se cumplan las obligaciones legales y éticas aplicables).
- Despliegue local en estaciones de trabajo: las cuantizaciones `Q4_K_L` y `Q6_K_L` permiten ejecutar el modelo en GPUs de 24 GB o en CPU con llama.cpp, LM Studio u Ollama, sin depender de la nube.
- Investigación sobre alineación y salvaguardas: el modelo sirve como caso de estudio para medir el impacto de ablaciones selectivas sobre la tasa de rechazo y la calidad general.

## Benchmarks y rendimiento

Los datos publicados corresponden a la build 8-bit MLX (`oQ8e-mtp`) derivada del mismo checkpoint BF16 maestro, evaluados con `lm_eval` v0.4.13 a temperatura 0,0 sobre 1.860 muestras. No se publican resultados específicos para los GGUF.

| Tarea | Metrica | VectorCut 8-bit | Baseline 8-bit | Delta |
|---|---|---:|---:|---:|
| `gsm8k_cot` (n=1.319) | exact_match, strict | 96,66% | 96,74% | -0,08 pp |
| `gsm8k_cot` (n=1.319) | exact_match, flexible | 96,44% | 96,51% | -0,08 pp |
| `ifeval` (n=541) | inst_level_loose_acc | 94,60% | 94,72% | -0,12 pp |
| `ifeval` (n=541) | inst_level_strict_acc | 93,05% | 93,05% | Empate |
| `ifeval` (n=541) | prompt_level_loose_acc | 92,24% | 92,24% | Empate |

La model card trunca la tabla de `ifeval` en el punto visible; no se dispone del resto de filas. No se han publicado resultados de MMLU, HumanEval ni benchmarks de visión en la información disponible.

## Requisitos de hardware

- VRAM estimada: `Q4_K_L` en torno a 18-20 GB (adecuado para GPUs de 24 GB); `Q6_K_L` en torno a 26-28 GB; `Q8_0` en torno a 33-35 GB. Estimaciones orientativas según el tamaño de pesos y el repo de 78,4 GB que contiene todas las variantes.
- GPUs recomendadas: RTX 4090 (24 GB) para `Q4_K_L`; A100 40/80 GB, H100 o RTX 6000 Ada para `Q6_K_L` y `Q8_0`.
- Cabe en GPU de consumo: sí, con `Q4_K_L` en RTX 3090/4090 (24 GB) o superiores; en GPUs de 16 GB requeriría cuantizaciones más agresivas no incluidas en esta release.
- Opciones de despliegue: llama.cpp (`--mmproj` para visión), LM Studio, Ollama, KoboldCpp; en Apple Silicon, builds MLX separadas con oMLX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| gemma-4-31B-it-VectorCut-GGUF | 30,7B denso | 256K | Si (`mmproj`) | Apache 2.0 | GGUF |
| Gemma 4 31B-it (original) | 30,7B denso | 256K | Si | Gemma Terms (no verificada en esta ficha) | Safetensors, GGUF oficiales |
| RareVector/gemma-4-31B-it-VectorCut-BF16 | 30,7B denso | 256K | Si | Apache 2.0 | Safetensors BF16 |
| RareVector/gemma-4-31B-it-VectorCut-MLX-8bit | 30,7B denso | 256K | Si (BF16 + MTP) | Apache 2.0 | MLX |

No se dispone de datos de benchmarks comparativos frente a otros modelos de la misma categoría (por ejemplo, Llama o Qwen de tamaño similar) en la información proporcionada.

## Limitaciones y advertencias

- La modificación VectorCut elimina deliberadamente los mecanismos de rechazo del modelo. Esto puede facilitar la generación de contenido dañino, ilegal o sexualmente explícito, y compromete el cumplimiento de términos de uso de muchos proveedores y de la normativa aplicable (por ejemplo, el AI Act europeo en materia de seguridad).
- La licencia Apache 2.0 se declara sobre esta release, pero conviene verificar que la cadena de licencias del modelo base Gemma 4 lo permite; la model card no aporta esa justificación.
- Riesgo de alucinación inherente a los modelos de lenguaje de 31B, no mitigado por la modificación; los benchmarks publicados no incluyen métricas de factualidad.
- La tabla de benchmarks está truncada en la model card y solo cubre GSM8K-CoT e IFEval en la build MLX 8-bit; no hay datos de visión, multilingüismo real ni de las cuantizaciones GGUF.
- El contexto de 256K puede degradar la calidad en los extremos de la ventana; no se documenta el comportamiento efectivo más allá de la longitud declarada.
- El número de descargas (10) y de likes (0) indica una release muy reciente y con validación comunitaria mínima; el repo se creó el 27 de noviembre de 2026.
- El autor afirma verificación SHA-256 por tensor, pero no se aportan los scripts ni los hashes en la información disponible para reproducir la comprobación.
- No se documenta soporte de tool calling ni de agentes, lo que limita su uso en pipelines automatizados que dependan de function calling.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rarevector/gemma-4-31B-it-VectorCut-GGUF
- Checkpoint BF16 maestro: https://huggingface.co/RareVector/gemma-4-31B-it-VectorCut-BF16
- MLX 8-bit: https://huggingface.co/RareVector/gemma-4-31B-it-VectorCut-MLX-8bit
- MLX 6-bit: https://huggingface.co/RareVector/gemma-4-31B-it-VectorCut-MLX-6bit
- MLX 4-bit: https://huggingface.co/RareVector/gemma-4-31B-it-VectorCut-MLX-4bit
- Todos los releases de Rare Vector: https://huggingface.co/RareVector
- Apoyo al proyecto: https://ko-fi.com/rarevector
- Gráfico de preservación de precisión: `./iq_preservation_chart.png` (incluido en el repo)
- Paper, blog o demo oficiales: no disponibles en la información proporcionada.
