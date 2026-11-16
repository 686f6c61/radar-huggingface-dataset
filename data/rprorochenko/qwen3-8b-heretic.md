# RProrochenko/Qwen3-8B-heretic

## Resumen

Qwen3-8B-heretic es una versión "descensurada" (decensored) del modelo Qwen3-8B de Alibaba Qwen, publicada por el usuario RProrochenko. Se ha generado aplicando la herramienta Heretic v2.1.0, que realiza una ablación de direcciones en el espacio de activaciones para reducir la tasa de rechazos del modelo ante peticiones que el modelo original declinaría. El resultado es un modelo denso de 8.190.735.360 parámetros (8,2B) con arquitectura transformer causal, derivado directamente de los pesos de Qwen3-8B y publicado bajo licencia Apache 2.0.

El modelo conserva las capacidades base de Qwen3-8B: modo thinking y non-thinking conmutables, contexto nativo de 32.768 tokens ampliable a 131.072 con YaRN, soporte para más de 100 idiomas y capacidades de agentes y tool calling. La intervención de Heretic no reentrena el modelo, sino que modifica los pesos mediante una técnica de ablación de rango arbitrario (Arbitrary-Rank Ablation, ARA) aplicada sobre las capas 0 a 35.

Es relevante ahora porque ofrece una alternativa reproducible (el autor incluye un directorio `reproduce/`) para quienes necesitan un modelo Qwen3-8B con menor tasa de rechazos en tareas de investigación, generación creativa o evaluación de robustez, manteniendo la licencia permisiva del modelo original. La model card reporta una reducción de rechazos de 99/100 a 5/100 con una divergencia KL de 0,0267 respecto al original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (Qwen3) |
| Parámetros totales | 8.190.735.360 (8,2B); 6,95B sin embeddings |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens nativos; 131.072 con YaRN |
| Tipos de cuantización | no disponible en la información proporcionada (el formato base es safetensors en bf16/fp16; cuantizaciones GGUF/AWQ no listadas) |
| Idiomas soportados | más de 100 idiomas y dialectos (según Qwen3-8B base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-8B: un transformer causal denso con 36 capas, 32 cabezas de atención para Q y 8 para KV (GQA), y 6,95B parámetros no-embedding. El modelo base fue entrenado por Qwen (Alibaba) en dos fases, preentrenamiento y postentrenamiento, e incorpora conmutación entre modo thinking (razonamiento explícito para matemáticas, código y lógica) y modo non-thinking (diálogo eficiente) dentro del mismo modelo.

La modificación de esta variante consiste en una ablación de rango arbitrario (ARA) aplicada con Heretic v2.1.0 sobre las capas 0 a 35. Los parámetros reportados son: `start_layer_index=0`, `end_layer_index=35`, `preserve_good_behavior_weight=0.3829`, `steer_bad_behavior_weight=0.0001`, `overcorrect_relative_weight=0.8897` y `neighbor_count=13`. No hay reentrenamiento ni ajuste fino con datos nuevos: la intervención es puramente sobre los pesos/activaciones para desplazar la dirección de rechazo. El autor indica que el proceso es reproducible mediante los ficheros del directorio `reproduce/`.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento explícito en modo thinking (matemáticas, lógica, código).
- Generación y explicación de código.
- Conmutación thinking / non-thinking mediante `enable_thinking` en la plantilla de chat.
- Soporte de tool calling y function calling (heredado de Qwen3).
- Capacidades de agente y razonamiento multi-paso.
- Multilingüe: más de 100 idiomas y dialectos, con instrucciones y traducción.
- Tasa de rechazos reducida (5/100 según la model card) frente al modelo original (99/100).
- Sin capacidades de visión ni audio (modelo solo texto).

## Casos de uso

- Investigación sobre alineación y robustez: comparar el comportamiento del modelo descensurado con el original para estudiar cómo la ablación afecta a la tasa de rechazos y a la calidad de las respuestas, usando la reproducibilidad del proceso ARA.
- Generación creativa sin restricciones: escritura de ficción, guiones o role-play donde el modelo original rechazaría temáticas sensibles, aprovechando la baja tasa de rechazos reportada.
- Evaluación de seguridad de pipelines: usar el modelo como caso de prueba adversario para medir la eficacia de filtros y guardarraíles externos en un sistema de moderación.
- Asistente conversacional autoalojado: despliegue en vLLM o SGLang con API compatible con OpenAI, aprovechando el contexto de 32K tokens para conversaciones largas.
- Generación de código en producción: integración en pipelines de CI/CD mediante tool calling, con modo non-thinking para respuestas rápidas y modo thinking para tareas complejas de refactorización.
- Procesamiento de documentos largos: análisis de contratos o informes que requieran hasta 131.072 tokens con YaRN, con resumen y extracción de entidades.
- Traducción multilingüe: uso de las capacidades en más de 100 idiomas para localización de contenido, con control de modo thinking para preservar matices.

## Benchmarks y rendimiento

| Métrica | Este modelo | Qwen/Qwen3-8B (original) |
|---|---|---|
| Rechazos | 5/100 | 99/100 |
| Divergencia KL | 0,0267 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para esta variante en la información disponible. Los benchmarks del modelo base Qwen3-8B pueden consultarse en el blog y la documentación oficial de Qwen.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 16,4 GB de pesos, más overhead de activaciones y KV cache; se recomienda al menos 24 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: en torno a 9-10 GB (no confirmado en la información disponible).
- VRAM estimada en cuantización de 4 bits: en torno a 5-6 GB (no confirmado en la información disponible).
- GPU recomendadas: A100 40/80 GB, H100 para despliegue en producción con contexto largo; RTX 4090 (24 GB) para bf16 con contexto moderado; RTX 3090/4080 para cuantización 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en bf16 con contexto limitado, y en GPUs de 12-16 GB con cuantización.
- Opciones de despliegue: vLLM (>=0.8.5) con `--enable-reasoning --reasoning-parser deepseek_r1`, SGLang (>=0.4.6.post1) con `--reasoning-parser qwen3`, TGI (tag `text-generation-inference`), llama.cpp, Ollama, LMStudio, MLX-LM y KTransformers.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-8B-heretic (este) | 8,2B | 32K / 131K YaRN | Apache 2.0 | Descensurado, 5/100 rechazos, KL 0,0267 |
| Qwen/Qwen3-8B | 8,2B | 32K / 131K YaRN | Apache 2.0 | Original, 99/100 rechazos |
| Otras variantes abliterated de Qwen3-8B | 8,2B | 32K / 131K YaRN | Apache 2.0 | No disponible en la información proporcionada |

No se dispone de datos de benchmarks comparativos con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- La ablación elimina direcciones de rechazo, lo que puede aumentar la probabilidad de generar contenido dañino, sesgado o inexacto sin advertencia.
- La divergencia KL de 0,0267 indica un cambio medible en la distribución de salida respecto al original; puede degradar ligeramente la calidad en tareas no relacionadas con rechazos.
- Riesgo de alucinación presente como en cualquier LLM de 8B; la reducción de rechazos puede hacer que el modelo afirme con seguridad contenido incorrecto.
- La model card no documenta sesgos específicos ni evaluaciones de seguridad posteriores a la ablación.
- Licencia Apache 2.0 permite uso comercial, pero el despliegue de un modelo descensurado en producción conlleva responsabilidad legal y reputacional; se recomienda moderación externa.
- Idiomas: aunque el base soporta más de 100, no se han evaluado las capacidades multilingües tras la ablación.
- Solo texto: sin visión ni audio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente.
- El proceso ARA es reproducible según el autor, pero no se han publicado evaluaciones externas que confirmen la estabilidad del comportamiento más allá de la métrica de rechazos y KL.

## Enlaces

- Hugging Face: https://huggingface.co/RProrochenko/Qwen3-8B-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Heretic: https://heretic-project.org
- Blog Qwen3: https://qwenlm.github.io/blog/qwen3/
- GitHub Qwen3: https://github.com/QwenLM/Qwen3
- Documentación Qwen: https://qwen.readthedocs.io/en/latest/
- Paper de referencia (arxiv:2309.00071): https://arxiv.org/abs/2309.00071
- Paper de referencia (arxiv:2505.09388): https://arxiv.org/abs/2505.09388
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-8B/blob/main/LICENSE
