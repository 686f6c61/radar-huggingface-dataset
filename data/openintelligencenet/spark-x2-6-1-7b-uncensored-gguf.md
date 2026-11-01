# OpenIntelligenceNet/Spark-X2.6-1.7B-Uncensored-GGUF

## Resumen

Spark-X2.6-1.7B-Uncensored-GGUF es un conjunto de cuantizaciones GGUF calibradas con importance matrix (imatrix) del modelo OpenIntelligenceNet/Spark-X2.6-1.7B-Abliterated, que a su vez es una variante "abliterated" (sin capa de rechazo) del modelo base XHToken/Spark-X2.6-1.7B. El autor, OpenIntelligenceNet, distribuye únicamente los pesos cuantizados en formato GGUF listos para su uso con llama.cpp, no el modelo original en safetensors. El modelo base tiene 1,7 mil millones de parámetros y está orientado a generación de texto con razonamiento explícito (canal `think`), roleplay y despliegue en dispositivos de borde (edge-AI).

La relevancia de esta ficha radica en que combina tres elementos poco habituales en modelos de este tamaño: un modo de "esfuerzo de pensamiento" configurable (`low`/`high`) dentro de la plantilla ChatML propietaria de Spark-X2.6, un proceso de abliteración realizado con Heretic v2.0.0.dev0 para eliminar los mecanismos de rechazo, y una calibración imatrix específica construida con un dataset multdominio de 2.000 muestras formateado en la plantilla nativa. Esto lo sitúa en el nicho de modelos pequeños sin censura para inferencia local en hardware modesto.

La información publicada por el autor es limitada: no se especifican licencia, idiomas soportados, longitud de contexto oficial ni resultados de benchmarks. Las cuantizaciones disponibles cubren Q4_K_M, Q5_K_M, Q6_K, Q8_0 y F16, todas ellas acompañadas del fichero imatrix.dat de calibración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles; derivado de Spark-X2.6-1.7B) |
| Parametros totales | 1,7 mil millones (aproximado, según nombre del modelo) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible oficialmente; los ejemplos de uso emplean 4096 tokens |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0, F16 (todas con imatrix salvo F16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Spark-X2.6-1.7B es un transformer de aproximadamente 1,7 mil millones de parámetros. La variante Abliterated se obtuvo aplicando Heretic v2.0.0.dev0, una herramienta de abliteración que modifica los pesos para eliminar la dirección de rechazo aprendida durante el alineamiento, reduciendo la tendencia del modelo a negarse a responder. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset original ni si hubo fases de RLHF o DPO.

La innovación técnica principal de este repositorio es la calibración con importance matrix: las cuantizaciones se generaron usando un dataset multdominio de 2.000 muestras (`spark_2000_mixed_dataset.jsonl`) formateado estrictamente en la plantilla ChatML nativa de Spark-X2.6, cubriendo instrucciones sin censura, código, matemáticas, ciencia y roleplay. El objetivo declarado es maximizar la retención de perplejidad y la calidad de razonamiento en anchos de bit bajos. El modelo base incorpora además un canal de pensamiento (`<think>`) con un parámetro `thinking_effort` que admite los valores `low` y `high` para modular la profundidad de razonamiento.

## Capacidades

- Generación de texto conversacional multi-turno mediante la plantilla ChatML propietaria de Spark-X2.6.
- Razonamiento explícito en canal `think` con esfuerzo configurable (`low`/`high`).
- Generación de código y resolución de problemas matemáticos y científicos (según los dominios del dataset de calibración imatrix).
- Roleplay y seguimiento de instrucciones sin censura, incluyendo contenido que los modelos alineados estándar rechazarían.
- Inferencia local en CPU y GPU mediante llama.cpp, llama-server (API compatible con OpenAI) y llama-cpp-python.
- Cuantizaciones de 4 a 16 bits para adaptar el equilibrio precisión/recursos.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni capacidades multilingües específicas.

## Casos de uso

- Asistente conversacional local en dispositivos de borde: con 1,7B parámetros y cuantización Q4_K_M, el modelo cabe en equipos con poca RAM/VRAM y puede ejecutarse íntegramente offline mediante llama.cpp, útil para aplicaciones de escritorio o embebidas sin conexión.
- Roleplay y escritura creativa sin restricciones: la abliteración y el etiquetado "uncensored" lo orientan a narrativa interactiva y personajes donde los filtros de rechazo resultan un obstáculo, usando `thinking_effort=high` para mantener coherencia en tramas largas.
- Generación de código en entornos locales: el dataset de calibración incluye código, y el modo de razonamiento permite resolver tareas de programación paso a paso dentro del canal `think` antes de emitir la respuesta.
- Prototipado rápido de APIs compatibles con OpenAI: llama-server expone un endpoint local en el puerto 8080 que permite sustituir llamadas a APIs en la nube durante el desarrollo sin modificar el código cliente.
- Investigación sobre alineamiento y abliteración: sirve como caso de estudio reproducible para analizar cómo Heretic v2.0.0.dev0 modifica el comportamiento de rechazo en un modelo de 1,7B y qué coste tiene en capacidades generales.
- Evaluación de cuantización imatrix: la disponibilidad de cinco niveles de cuantización con el mismo dataset de calibración permite medir empíricamente la degradación de perplejidad y calidad de razonamiento según el ancho de bit.
- Filtrado y generación de contenido en pipelines de datos: puede emplearse para tareas de reescritura, parafraseo o generación de ejemplos sintéticos en lotes, donde el bajo coste por token y la ausencia de rechazos agilizan el proceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (1,7B parámetros): Q4_K_M en torno a 1,1-1,3 GB, Q5_K_M en torno a 1,3-1,5 GB, Q6_K en torno a 1,5-1,8 GB, Q8_0 en torno a 2,0-2,2 GB y F16 en torno a 3,4 GB (estimaciones según el tamaño típico de estos formatos para 1,7B; el autor no publica cifras exactas).
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM puede ejecutar las cuantizaciones Q4 a Q8; una RTX 3060, RTX 4060, RTX 4090 o superior ofrece margen amplio. En el extremo profesional, A100 o H100 no aportan ventaja significativa para este tamaño.
- Cabe en GPU consumer: sí, en todas las cuantizaciones desde una GTX 1650 de 4 GB en adelante; también en CPU pura con 2-4 GB de RAM libre.
- Opciones de despliegue: llama-cli, llama-server (API compatible con OpenAI), llama-cpp-python; al ser GGUF, es compatible con cualquier frontend basado en llama.cpp (Ollama, LM Studio, KoboldCpp, entre otros, aunque el autor no los menciona explícitamente).
- Latencia y throughput: no disponibles. Los ejemplos del autor usan `-ngl 99` (todas las capas en GPU) y contexto de 4096 tokens, con temperatura 0,3, top-p 0,9, top-k 50 y repeat-penalty 1,1, lo que sugiere un uso interactivo de baja latencia en hardware consumer.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-1.7B-Uncensored-GGUF | ~1,7B | no disponible (ejemplos a 4096) | no disponible | GGUF | Abliterado con Heretic, modo thinking, solo cuantizaciones |
| XHToken/Spark-X2.6-1.7B (base) | ~1,7B | no disponible | no disponible | no disponible en esta ficha | Modelo original alineado; esta variante elimina rechazos |
| OpenIntelligenceNet/Spark-X2.6-1.7B-Abliterated | ~1,7B | no disponible | no disponible | no disponible en esta ficha | Variante abliterada sin cuantizar, origen de este repo |
| Alternativas de ~1-2B sin censura (p. ej. variantes abliterated de Qwen o Llama) | 1-2B | variable | variable | GGUF habitual | No se dispone de datos comparativos verificados en la información proporcionada |

No se dispone de datos de rendimiento comparativo verificables para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La abliteración elimina los mecanismos de rechazo, por lo que el modelo puede generar contenido ofensivo, ilegal o dañino sin filtro; no es apto para aplicaciones de cara al público sin moderación externa.
- Riesgo elevado de alucinación inherente a un modelo de 1,7B parámetros, especialmente en tareas de conocimiento factual o razonamiento complejo.
- La licencia no está especificada, lo que impide confirmar si se permite el uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- No se documentan idiomas soportados; el prompt de ejemplo está en inglés y el dataset de calibración parece centrado en inglés, por lo que el rendimiento en castellano es incierto.
- La longitud de contexto oficial no está publicada; los ejemplos usan 4096 tokens, y valores superiores no están garantizados.
- El repositorio solo distribuye pesos GGUF cuantizados; no hay safetensors ni pesos originales, lo que limita el fine-tuning directo.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria ni evaluaciones independientes.
- La plantilla ChatML es propietaria de Spark-X2.6 y debe respetarse estrictamente; un formateo incorrecto degrada la calidad de las respuestas.
- El parámetro `thinking_effort` y el canal `<think>` requieren que el cliente gestione correctamente el parseo de la respuesta para separar razonamiento y salida final.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OpenIntelligenceNet/Spark-X2.6-1.7B-Uncensored-GGUF
- Modelo base abliterado: https://huggingface.co/OpenIntelligenceNet/Spark-X2.6-1.7B-Abliterated
- Modelo original Spark-X2.6-1.7B: https://huggingface.co/XHToken/Spark-X2.6-1.7B
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales.
