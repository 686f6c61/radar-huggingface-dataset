# sigmanih/google-gemma-4-12B-it-GGUF-Q8_0

## Resumen

`google-gemma-4-12B-it-GGUF-Q8_0` es una cuantización en formato GGUF con precisión Q8_0 del modelo instructivo `google/gemma-4-12B-it`, publicada por el usuario `sigmanih` a través de la herramienta Sigma Studio. El modelo base pertenece a la familia Gemma 4 de Google DeepMind, un modelo denso de 12 000 millones de parámetros con una ventana de contexto de 262 144 tokens, diseñado para tareas de generación de texto, razonamiento, programación y uso como asistente conversacional.

Esta versión cuantizada reduce el peso del modelo a aproximadamente 11,8 GB en disco, lo que permite su ejecución en hardware de consumo con 16 GB de VRAM, manteniendo una calidad cercana a la del modelo original gracias a la cuantización Q8_0. El repositorio incluye benchmarks medidos sobre una porción de los conjuntos de evaluación estándar y velocidades de inferencia obtenidas en una NVIDIA GeForce RTX 5070 Ti.

La relevancia de esta publicación radica en ofrecer una alternativa lista para producción del modelo Gemma 4 12B en entornos locales, con soporte para llama.cpp y Sigma Studio, dirigida a desarrolladores que necesitan un modelo de alto rendimiento con requisitos de hardware moderados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (gemma4) |
| Parametros totales | 11 907 350 576 (12B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | Q8_0 (GGUF) |
| Idiomas soportados | en, it |
| Licencia | other (consultar licencia del modelo base google/gemma-4-12B-it) |
| Formato de pesos | GGUF (Q8_0) |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-12B-it` es un transformer denso con 48 capas y dimensión oculta de 3840, perteneciente a la familia Gemma 4 de Google DeepMind. Según la documentación oficial del modelo base, se trata de un modelo multimodal sin codificadores externos, capaz de procesar texto, audio, imagen y vídeo de forma nativa. Sin embargo, la versión cuantizada GGUF publicada en este repositorio se limita a generación de texto, ya que el formato GGUF no incluye los componentes multimodales.

No se dispone de información detallada sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) en la información proporcionada. La cuantización Q8_0 se ha realizado mediante la herramienta Sigma Studio, que convierte los pesos originales a formato GGUF con una pérdida de precisión mínima (típicamente inferior al 1 % en tareas de generación).

## Capacidades

- Generación de texto conversacional y asistencia en tareas cotidianas.
- Razonamiento lógico y matemático, con resultados de 89 % en GSM8K y MATH (sobre una porción del dataset).
- Generación de código, con 86 % en HumanEval (porción del dataset).
- Comprensión de lenguaje natural y respuesta a preguntas, con 79 % en MMLU (porción del dataset).
- Ventana de contexto amplia de 262 144 tokens, adecuada para documentos largos y conversaciones multi-turno.
- Soporte para agentes autónomos y bucles de razonamiento, según la descripción del autor.
- Idiomas: inglés e italiano (según los metadatos del repositorio).

## Casos de uso

- Asistente conversacional local: el modelo puede integrarse en aplicaciones de chat mediante llama.cpp o Sigma Studio, ofreciendo respuestas fluidas con una velocidad de decodificación de 38,9 tokens por segundo en una RTX 5070 Ti, suficiente para interacción en tiempo real.
- Generación de código en entornos de desarrollo: con un 86 % de acierto en HumanEval (porción del dataset), es adecuado para autocompletado y generación de fragmentos de código en editores o pipelines de CI/CD, siempre que se valide la salida.
- Análisis de documentos extensos: la ventana de contexto de 262 144 tokens permite procesar contratos, informes técnicos o libros completos en una sola pasada, resumiendo o extrayendo información relevante sin necesidad de dividir el texto.
- Razonamiento matemático y resolución de problemas: con resultados de 89 % en GSM8K y MATH (porción del dataset), puede utilizarse como herramienta de apoyo en educación o en sistemas de tutoría inteligente.
- Agentes autónomos: el modelo está recomendado para bucles de razonamiento y ejecución de tareas multi-paso, pudiendo actuar como núcleo de un agente que planifica, ejecuta y verifica acciones.
- Despliegue en entornos con recursos limitados: al ocupar solo 11,8 GB en disco y caber en GPUs de 16 GB VRAM, es viable para estaciones de trabajo sin hardware de gama alta, reduciendo costes de infraestructura.

## Benchmarks y rendimiento

La model card del repositorio incluye resultados de evaluación obtenidos con SigmaEngine sobre una porción de los conjuntos de datos, no sobre la suite completa. El autor advierte explícitamente que estos valores no son comparables con ejecuciones completas. Se presentan a continuación tal como se publicaron:

| Suite | Aciertos | Total | Porcentaje |
|---|---|---|---|
| ARC-Challenge | 8 | 9 | 89 % |
| BIG-Bench Hard | 7 | 7 | 100 % |
| GPQA | 3 | 9 | 33 % |
| GSM8K | 8 | 9 | 89 % |
| HellaSwag | 5 | 9 | 56 % |
| HumanEval | 6 | 7 | 86 % |
| MATH | 8 | 9 | 89 % |
| MBPP | 0 | 9 | 0 % |
| MMLU | 11 | 14 | 79 % |
| MMLU-Pro | 7 | 9 | 78 % |
| TruthfulQA | 9 | 9 | 100 % |
| **Total** | **72** | **100** | **72 %** |

Protocolo de evaluación: code_execution, continuation_logprob, cot_generation, letter_logprob, temperatura 0.0, semilla 42. Hash de reproducibilidad: SHA256-B81232ECC62AC6FC.

Velocidades medidas en NVIDIA GeForce RTX 5070 Ti (15,9 GB VRAM):

| Metrica | Valor |
|---|---|
| Decodificacion single-stream | 38,9 tok/s |
| Procesamiento de prompt | 344 tok/s |
| Throughput agregado en evaluacion | 40,0 tok/s |

## Requisitos de hardware

- VRAM estimada: el archivo GGUF Q8_0 ocupa 11,8 GB en disco, por lo que se recomienda al menos 16 GB de VRAM para una ejecución cómoda con contexto completo.
- GPU recomendadas: NVIDIA GeForce RTX 5070 Ti (15,9 GB VRAM, verificada por el autor), RTX 4090, RTX 4080, o GPUs profesionales con 16 GB o más.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama alta para consumidores con 16 GB de VRAM. En GPUs con 12 GB podría ejecutarse con contexto reducido o usando capas parciales en CPU.
- Opciones de despliegue: llama.cpp (compatible con `llama-cli`), Sigma Studio (herramienta del autor), y potencialmente Ollama o LM Studio si se importa el archivo GGUF.
- Latencia y throughput: decodificación de 38,9 tok/s y procesamiento de prompt de 344 tok/s en RTX 5070 Ti, medidos por el autor. No se han medido velocidades en otros hardware.

## Comparativa con modelos similares

No se dispone de datos comparativos con otras cuantizaciones del mismo modelo base o con modelos de tamaño similar en la información proporcionada. La búsqueda web localiza otras versiones GGUF de Gemma 4 12B (por ejemplo, un archivo de 25,2 GB, probablemente en FP16 o Q8 con más componentes), pero no se especifican sus características ni rendimiento. Se recomienda consultar el modelo base `google/gemma-4-12B-it` para comparar con la versión sin cuantizar, teniendo en cuenta que la cuantización Q8_0 introduce una pérdida de precisión mínima pero reduce significativamente los requisitos de almacenamiento y memoria.

## Limitaciones y advertencias

- Los benchmarks publicados se han medido sobre una porción reducida de cada dataset (entre 7 y 14 preguntas por suite), por lo que los porcentajes tienen un margen de error alto y no son directamente comparables con resultados de evaluaciones completas.
- El resultado de 0 % en MBPP (9 preguntas) sugiere una posible debilidad en generación de código Python a partir de descripciones, aunque el tamaño de la muestra es demasiado pequeño para extraer conclusiones sólidas.
- La licencia se indica como "other" en los metadatos de HuggingFace. Aunque la model card muestra un badge de Apache-2.0, la licencia real del modelo base de Google (Gemma) tiene términos específicos que deben revisarse antes de un uso comercial.
- El modelo solo declara soporte para inglés e italiano. El rendimiento en otros idiomas no está verificado y puede ser significativamente inferior.
- Al ser una cuantización GGUF, no se incluyen las capacidades multimodales del modelo base (audio, imagen, vídeo). Solo es válido para tareas de texto.
- La ventana de contexto de 262 144 tokens es teórica; en la práctica, el rendimiento puede degradarse con contextos muy largos y el consumo de memoria aumenta proporcionalmente.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de razonamiento complejo o cuando se le pide información factual no presente en el contexto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sigmanih/google-gemma-4-12B-it-GGUF-Q8_0
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Página oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Guía para desarrolladores de Gemma 4 12B: https://developers.googleblog.com/gemma-4-12b-the-developer-guide/
- Sigma Studio (GitHub): https://github.com/Sigmanih/SigmaStudio
