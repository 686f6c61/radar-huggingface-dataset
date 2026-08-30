# Rin247/Qwen3.5-9B-Uncensored-Aquarion-FP8

## Resumen

El modelo `Rin247/Qwen3.5-9B-Uncensored-Aquarion-FP8` es una cuantización FP8 weight-only del modelo base `Qwen3.5-9B`, publicada por el usuario Rin247 en Hugging Face. Se trata de una variante "abliterated" (desensibilizada) que elimina la dirección de rechazo del modelo original mediante proyección ortogonal, con el objetivo de reducir la censura y permitir respuestas sin filtros de seguridad. Esta cuantización forma parte de la colección "Qwen3-Aquarion" del mismo autor, que incluye formatos FP8, INT8, INT4 y FP4 para la serie Qwen3.

El modelo está pensado para desarrolladores e investigadores que necesitan ejecutar un LLM local con requisitos de memoria reducidos, manteniendo la calidad del modelo original. Al estar cuantizado en FP8 con solo pesos, ocupa aproximadamente 11 GB en disco, lo que lo hace viable en GPUs de consumo medio. Sin embargo, la ausencia de licencia explícita y de documentación sobre el modelo base limita su uso en entornos de producción sin verificación previa.

La relevancia actual de este modelo radica en la tendencia de "uncensoring" de LLMs open source, que permite explorar casos de uso donde la moderación estándar de los modelos comerciales resulta restrictiva. No obstante, esta característica conlleva riesgos importantes de generación de contenido inapropiado o dañino, como se detalla en las limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (base: Qwen3.5-9B, presumiblemente transformer) |
| Parametros totales | 8.953.803.264 (aprox. 8,95B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 weight-only (safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (con buffers de escala y forma) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo `Qwen3.5-9B`, del cual no se proporcionan detalles en la información disponible. Se presume que sigue la arquitectura transformer estándar de la serie Qwen, pero no se confirma. El proceso de "abliteration" se realizó mediante proyección ortogonal de la dirección de rechazo, una técnica que modifica los pesos del modelo para eliminar la tendencia a negarse a responder ciertas solicitudes. Posteriormente, se aplicó una cuantización FP8 weight-only usando PyTorch RTN (Round-to-Nearest) en CPU, almacenando las escalas junto a los pesos en archivos safetensors. No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de texto: al ser una variante de Qwen3.5-9B, se espera que mantenga las capacidades de generación de texto del modelo base, aunque no se especifican detalles.
- Razonamiento y codigo: no hay datos concretos sobre rendimiento en tareas de razonamiento o generación de código.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales: el modelo está "uncensored" (abliterated), lo que implica que no aplica los filtros de seguridad habituales. No se mencionan capacidades de visión, audio u otras modalidades.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el efecto de la abliteration en el comportamiento de un LLM, comparando respuestas con y sin filtros de seguridad.
- Generación de contenido creativo sin restricciones: escritores y artistas pueden explorar temas que los modelos censurados evitan, como ciertos tipos de ficción o diálogos explícitos.
- Desarrollo de asistentes especializados en dominios sensibles: por ejemplo, en educación sexual o salud mental, donde las respuestas directas pueden ser más útiles que las evasivas.
- Pruebas de robustez de sistemas de moderación: los desarrolladores pueden usar este modelo para evaluar la eficacia de sus propios filtros de contenido.
- Despliegue local en entornos aislados: al ser FP8, cabe en GPUs con 12-16 GB de VRAM, permitiendo ejecutar un LLM sin depender de APIs externas.
- Benchmarking de cuantización: comparar el rendimiento de FP8 weight-only frente a otras cuantizaciones (INT8, INT4) en tareas de generación de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan datos de MMLU, HumanEval, GSM8K ni otras métricas estándar. Tampoco se comparan con el modelo base Qwen3.5-9B ni con otras variantes abliterated.

## Requisitos de hardware

- VRAM estimada: con 8,95B parámetros en FP8 (1 byte por peso), el tamaño de los pesos es aproximadamente 8,95 GB. Añadiendo overhead de activaciones y KV cache, se estima un consumo de VRAM entre 10 y 14 GB para inferencia con contexto corto.
- GPU recomendadas: tarjetas con 16 GB de VRAM o más, como RTX 4080/4090, A100 40GB, o GPUs de datacenter. En GPUs con 12 GB (RTX 3060/4070) podría funcionar con contexto reducido y batch pequeño.
- Compatibilidad con consumer GPU: sí, en GPUs de gama alta (RTX 3090/4090) y posiblemente en algunas de 12 GB con optimizaciones.
- Opciones de despliegue: al ser un formato safetensors con recetas custom de weight-only, requiere un motor que soporte dequantización con los buffers de escala y forma. No se menciona compatibilidad directa con vLLM, llama.cpp, Ollama o TGI. El autor indica que hay que dequantizar antes de usar un motor de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Abliterated | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rin247/Qwen3.5-9B-Uncensored-Aquarion-FP8 | 8,95B | FP8 weight-only | Sí | No disponible | Hugging Face |
| nDimensional/Qwen3.5-9B-Uncensored-Safetensors | 8,95B (presumible) | FP16/FP32 (safetensors) | Sí | No disponible | Hugging Face |
| huihui_ai/qwen3.5-abliterated:9b (Ollama) | 8,95B (presumible) | GGUF (varias) | Sí | No disponible | Ollama |

No se dispone de datos de rendimiento comparativo entre estas variantes. La principal diferencia es el formato de pesos: FP8 weight-only frente a GGUF o safetensors sin cuantizar. La colección de Rin247 incluye también versiones INT8, INT4 y FP4, que ofrecen distintos equilibrios entre tamaño y calidad.

## Limitaciones y advertencias

- Sesgos conocidos: al ser una variante abliterated, se eliminan los mecanismos de rechazo, lo que puede amplificar sesgos existentes en el modelo base y generar contenido discriminatorio u ofensivo.
- Riesgo de alucinacion: no se dispone de datos específicos, pero es probable que el modelo base presente alucinaciones como cualquier LLM de tamaño medio.
- Limitaciones de contexto o idioma: no se especifican; se asume que hereda las del modelo base Qwen3.5-9B, que no se documentan aquí.
- Restricciones de licencia: la licencia no está disponible, lo que impide su uso comercial sin autorización explícita del autor. Se recomienda contactar con Rin247 antes de cualquier despliegue en producción.
- Caveat para produccion: el formato FP8 weight-only con recetas custom requiere un pipeline de dequantización no estándar, lo que complica la integración con frameworks convencionales. Además, la ausencia de benchmarks y documentación técnica hace arriesgado su uso en aplicaciones críticas.
- Riesgo de contenido dañino: al estar "uncensored", el modelo puede generar instrucciones peligrosas, contenido ilegal o material explícito sin advertencias. Debe usarse con extrema precaución y en entornos controlados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rin247/Qwen3.5-9B-Uncensored-Aquarion-FP8
- Colección Qwen3-Aquarion de Rin247: https://huggingface.co/collections/Rin247/qwen3-aquarion
- Variante similar de nDimensional: https://huggingface.co/nDimensional/Qwen3.5-9B-Uncensored-Safetensors
- Guía sobre Qwen3.5-9B Abliterated (codersera): https://codersera.com/blog/unrestricted-uncensored-qwen35-9b-abliterated-full-guide/
- Variante en Ollama (jaahas): https://ollama.com/jaahas/qwen3.5-uncensored
- Variante en Ollama (huihui_ai): https://ollama.com/huihui_ai/qwen3.5-abliterated:9b
