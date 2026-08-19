# ceyda/Qwen3-1.7B-Base-trim-koen-32768

## Resumen

El modelo `ceyda/Qwen3-1.7B-Base-trim-koen-32768` es una versión recortada del vocabulario del modelo base `Qwen/Qwen3-1.7B-Base`, desarrollada por el usuario ceyda. El objetivo es reducir el tamaño del vocabulario de byte-level BPE de aproximadamente 151.700 tokens a 32.768 tokens, conservando únicamente los tokens más frecuentes en coreano e inglés, junto con su cierre de derivación de merges BPE. Esta reducción se realiza sin retraining: los pesos de la matriz de embeddings (atada) se recortan para los tokens conservados, de modo que el modelo es numéricamente idéntico al original en esos tokens.

El modelo resuelve el problema del desperdicio de memoria y cómputo en modelos multilingües cuando se usan principalmente en un subconjunto de idiomas. Al reducir el vocabulario en un 78%, los parámetros totales pasan de 1.720.574.976 a 1.476.518.912, una reducción del 14,2%, lo que se traduce en menor huella de memoria y mayor velocidad de inferencia para textos en coreano e inglés. Es relevante para desarrolladores que trabajan con estos idiomas y necesitan un modelo base compacto y eficiente, manteniendo la calidad del modelo original.

La arquitectura subyacente es la de Qwen3-1.7B-Base, un transformer decoder-only denso, aunque la model card no proporciona detalles adicionales sobre la arquitectura interna. El modelo está disponible bajo licencia Apache-2.0 y se distribuye en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Qwen3, no se especifican más detalles) |
| Parametros totales | 1.476.518.912 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (no especificada en la model card) |
| Tipos de cuantizacion | No disponible (solo safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | Coreano (ko), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una versión recortada del vocabulario de `Qwen/Qwen3-1.7B-Base`. La arquitectura subyacente es la de Qwen3, un transformer decoder-only con embeddings atadas (tied embeddings). El proceso de recorte consiste en seleccionar los 32.768 tokens más frecuentes en coreano e inglés, incluyendo los 256 tokens de byte y los 26 tokens especiales, y además el cierre completo de derivación de merges BPE para garantizar que los caracteres multibyte coreanos sigan siendo representables. Los pesos de la matriz de embeddings se recortan para los tokens conservados, copiando los valores originales sin ningún entrenamiento adicional.

La model card indica que se verificó la equivalencia numérica: la pérdida de round-trip en coreano, inglés y código es nula, la diferencia máxima de logits en teacher-forced es 0.0, y la generación greedy en coreano e inglés natural es token a token idéntica al modelo base. No se realizó ningún ajuste fino ni entrenamiento posterior al recorte.

## Capacidades

- Generación de texto en coreano e inglés con calidad equivalente al modelo base para los tokens conservados.
- Codificación de código y jerga técnica, aunque puede dividirse en más tokens que el modelo original.
- Modelo base (no instruido), por lo que no soporta instrucciones conversacionales ni tool calling de forma nativa.
- No soporta vision, audio ni otras modalidades.
- Capacidad multilingüe limitada a coreano e inglés; otros idiomas caen en tokens de byte, generando secuencias más largas.

## Casos de uso

- Fine-tuning para tareas específicas en coreano: al ser un modelo base compacto, es adecuado para ajuste fino en tareas como clasificación de texto, análisis de sentimiento o generación de resúmenes en coreano, reduciendo el coste de entrenamiento frente al modelo original.
- Generación de texto en coreano e inglés en entornos con recursos limitados: su menor tamaño de vocabulario y parámetros permite ejecutarlo en GPUs consumer con menos VRAM, manteniendo la calidad del modelo base.
- Prototipado rápido de aplicaciones de generación de texto en coreano: al ser idéntico al base en los tokens conservados, se puede usar como reemplazo directo en pipelines existentes sin cambios de comportamiento.
- Investigación sobre eficiencia de vocabulario: sirve como caso de estudio para evaluar el impacto del recorte de vocabulario en la calidad y el rendimiento.
- Despliegue en producción para chatbots o asistentes en coreano (tras fine-tuning instruct): su menor tamaño reduce la latencia y el coste de inferencia en servicios con alto volumen.
- Generación de código en coreano e inglés: aunque el código puede requerir más tokens, sigue siendo funcional y puede usarse en herramientas de autocompletado o generación asistida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,95 GB (1.476.518.912 parámetros × 2 bytes), más overhead de activaciones y caché KV. Con cuantización INT8 (no publicada, pero posible) se reduciría a ~1,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 3060, o superiores. También puede ejecutarse en Apple Silicon con Metal.
- Cabe en GPUs consumer de gama baja, siempre que se use FP16 o cuantización.
- Opciones de despliegue: al ser un modelo transformers estándar, puede usarse con vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama (con conversión previa) o directamente con la librería transformers.
- Latencia y throughput estimados: no disponibles, pero al ser un modelo de 1,5B parámetros, en una RTX 4090 se espera una generación de decenas de tokens por segundo en FP16.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen/Qwen3-1.7B-Base | 1.720.574.976 | 151.669 | No especificado | Apache-2.0 | Modelo original sin recorte |
| ceyda/Qwen3-1.7B-Base-trim-koen-32768 | 1.476.518.912 | 32.768 | No especificado | Apache-2.0 | Versión recortada para ko/en |
| Qwen/Qwen3-1.7B (instruct) | 1.720.574.976 | 151.669 | No especificado | Apache-2.0 | Versión instruida, no recortada |

La comparativa se limita al modelo base y su versión instruida, ya que no se dispone de información sobre otros modelos recortados similares. La principal diferencia es la reducción de parámetros y vocabulario, que afecta a la memoria y velocidad, pero no a la calidad en los idiomas soportados.

## Limitaciones y advertencias

- El recorte está optimizado para prosa en coreano e inglés; el código y la jerga técnica pueden dividirse en más tokens, aumentando la longitud de las secuencias.
- Textos en otros idiomas (distintos de ko/en) caen en tokens de byte, lo que genera secuencias mucho más largas y potencialmente peor calidad.
- Es un modelo base, no instruido, por lo que no responde a instrucciones ni mantiene conversaciones sin un fine-tuning previo.
- No se han publicado benchmarks ni evaluaciones independientes que confirmen el rendimiento en tareas específicas.
- La licencia Apache-2.0 permite uso comercial, pero se debe mantener la atribución al modelo original y al método de recorte.
- No se especifica la longitud de contexto; se asume que hereda la del modelo base, pero no está confirmado en la model card.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ceyda/Qwen3-1.7B-Base-trim-koen-32768)
- [Modelo base Qwen3-1.7B-Base](https://huggingface.co/Qwen/Qwen3-1.7B-Base)
- [Blog sobre Introduction to Trimming](https://huggingface.co/blog/lbourdois/introduction-to-trimming)
- [Repositorio GitHub de Qwen3](https://github.com/QwenLM/Qwen3)
