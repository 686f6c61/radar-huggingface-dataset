# llmsforall/Millie-35B-A3B-11GB

## Resumen

Millie-35B-A3B-11GB es un modelo de lenguaje de mezcla de expertos (MoE) de 35 mil millones de parámetros, de los cuales solo 3 mil millones se activan por token, diseñado específicamente para tareas de codificación y uso agéntico. Ha sido desarrollado por el usuario llmsforall y se distribuye en formato GGUF, comprimido para ejecutarse en hardware convencional. El modelo deriva de Agents-A1, construido sobre la arquitectura Qwen3.5-35B-A3B, e incorpora una torre de visión que permite procesar imágenes como entrada adicional.

La principal innovación de Millie reside en su esquema de compresión: los pesos de los expertos se almacenan a aproximadamente 2,2 bits por peso, lo que reduce el tamaño total a unos 11 GB (10,3 GB para el modelo de lenguaje y 0,6 GB para el proyector de visión). Esto permite ejecutar un modelo de 35B en GPUs de consumo con 12 GB de VRAM, algo poco habitual en esta categoría. El modelo requiere un fork específico de llama.cpp que implementa los kernels necesarios para su formato de pesos, ya que no es compatible con la versión estándar.

Está licenciado bajo Apache 2.0, lo que facilita su uso comercial y modificación. Aunque el repositorio registra cero descargas y cero interacciones, su fecha de creación es reciente (agosto de 2026) y su propuesta de eficiencia lo hace relevante para desarrolladores que buscan desplegar modelos grandes en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Qwen3.5-35B-A3B, con torre de vision |
| Parametros totales | 34.660.610.688 (35B) |
| Parametros activos | 3.000.000.000 (3B) por token |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | GGUF con pesos de expertos a ~2,2 bits por peso (formato propietario) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivos .gguf) |

## Arquitectura y entrenamiento

Millie-35B-A3B-11GB adopta una arquitectura de mezcla de expertos (MoE) con 35B parámetros totales y 3B activos por token, lo que permite un rendimiento de inferencia comparable a modelos densos mucho más grandes. La arquitectura base es la de Qwen3.5-35B-A3B, sobre la que se ha construido Agents-A1, un modelo orientado a tareas agénticas y codificación. La innovación principal del modelo es la compresión de los pesos de los expertos a una precisión efectiva de 2,2 bits por peso, reduciendo drásticamente la huella de memoria sin sacrificar la funcionalidad básica.

El modelo incluye un proyector multimodal (mmproj) que permite procesar imágenes como entrada, ampliando sus capacidades más allá del texto. No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de tokens utilizados o si se aplicaron técnicas de alineación como RLHF o DPO. La información disponible solo indica que el modelo es una derivación de Agents-A1, sin especificar si se realizó un fine-tuning adicional o una destilación específica para la cuantización.

## Capacidades

- Generación de texto: produce respuestas coherentes y contextuales en tareas de lenguaje natural, aunque los idiomas soportados no están especificados.
- Codificación: el modelo está diseñado para tareas de programación, incluyendo generación de código, completado y depuración.
- Capacidades agénticas: soporta flujos de razonamiento multi-paso y toma de decisiones, lo que lo hace adecuado para agentes autónomos.
- Visión: procesa imágenes como entrada adicional gracias a la torre de visión, permitiendo tareas de descripción de imágenes o razonamiento visual básico.
- Razonamiento: maneja problemas de lógica y matemáticas, aunque no se han publicado benchmarks que lo confirmen.
- Multilingüismo: no confirmado; los idiomas soportados no están listados en la documentación.

## Casos de uso

- Asistente de programación local: un desarrollador puede ejecutar Millie en un portátil con GPU de 12 GB para obtener sugerencias de código, explicaciones de algoritmos o refactorización sin depender de servicios en la nube, gracias a su tamaño comprimido y su enfoque en codificación.
- Agente autónomo de automatización de tareas: su capacidad agéntica permite construir agentes que interactúan con APIs, ejecutan scripts o gestionan flujos de trabajo multi-paso, por ejemplo, en un pipeline de integración continua.
- Análisis de imágenes con contexto largo: al combinar visión y una ventana de contexto de 262K tokens, puede procesar documentos extensos con figuras, diagramas o capturas de pantalla, útil para revisar documentación técnica o informes.
- Chatbot de atención al cliente con memoria extendida: la ventana de 262K tokens permite mantener conversaciones muy largas sin perder el hilo, adecuado para soporte técnico en entornos empresariales.
- Prototipado rápido de aplicaciones de IA: al ser ligero y licenciado bajo Apache 2.0, es ideal para experimentar con arquitecturas MoE y agentes en entornos de investigación o desarrollo sin costes de infraestructura elevados.
- Razonamiento matemático y científico: su capacidad de razonamiento (aunque no verificada con benchmarks) lo hace candidato para resolver problemas de cálculo simbólico o análisis de datos en contextos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentacion del modelo no incluye puntuaciones en MMLU, HumanEval, GSM8K u otras pruebas estandar. Los articulos de la busqueda web hacen referencia a la arquitectura Qwen 3.6 35B-A3B, pero no proporcionan datos concretos aplicables a esta variante comprimida. Se recomienda realizar evaluaciones propias antes de usarlo en produccion.

## Requisitos de hardware

- VRAM estimada: el modelo requiere aproximadamente 10,9 GB de almacenamiento total. Según datos de la comunidad para arquitecturas similares, puede ejecutarse con ~10 GB de VRAM y ~11 GB de RAM compartida, alcanzando unos 38 tokens por segundo en una RTX 3060 de 12 GB.
- GPU recomendadas: tarjetas con al menos 12 GB de VRAM, como RTX 3060, RTX 4070, RTX 4080, o GPUs profesionales como A100 (aunque en este caso sobraría capacidad). También puede ejecutarse en CPU con suficiente RAM, aunque con menor rendimiento.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama media con 12 GB, gracias a la cuantización de 2,2 bits.
- Opciones de despliegue: requiere el fork de llama.cpp de llmsforall (https://github.com/llmsforall/llama.cpp). No es compatible con llama.cpp estándar, Ollama ni vLLM sin adaptaciones. El comando de despliegue sugerido es `llama-server -m Millie-35B-A3B-11GB.gguf --mmproj Millie-35B-A3B-mmproj.gguf`.
- Latencia y throughput: se estima ~38 tok/s en una RTX 3060 12GB según datos de modelos similares; el rendimiento exacto dependerá del hardware y la configuración.

## Comparativa con modelos similares

No hay una comparativa directa publicada con esta variante específica. Como referencia, se puede comparar con el modelo base y con alternativas MoE de tamaño similar:

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Millie-35B-A3B-11GB | 35B | 3B | 262K | Apache 2.0 | GGUF (2.2 bits) |
| Qwen 3.6 35B-A3B (referencia) | 35B | 3B | 256K | Apache 2.0 (presumible) | No disponible |
| Agents-A1 (base) | 35B | 3B | 262K | No disponible | No disponible |

La diferencia clave es la compresión extrema de Millie frente a las versiones sin cuantizar, que requieren ~20 GB de VRAM. No hay datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- La cuantización a 2,2 bits por peso puede degradar significativamente la calidad de las respuestas en tareas complejas, especialmente en matemáticas o razonamiento lógico avanzado, aunque no hay benchmarks que lo cuantifiquen.
- El modelo requiere un fork específico de llama.cpp; no funcionará con las herramientas estándar, lo que limita su portabilidad y dificulta su integración en ecosistemas existentes.
- No se han publicado datos de entrenamiento, idiomas soportados ni resultados de evaluación, por lo que su comportamiento en producción es impredecible.
- La ventana de contexto de 262K tokens puede provocar un alto consumo de memoria en inferencia, aunque el modelo esté comprimido; se recomienda gestionar la memoria con cuidado.
- Al ser una derivación de Agents-A1, es posible que herede sesgos del modelo base, pero no se ha documentado nada al respecto.
- El repositorio tiene cero descargas y cero interacciones, lo que sugiere que es un proyecto muy reciente o poco validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/llmsforall/Millie-35B-A3B-11GB
- Variante de 7 GB: https://huggingface.co/llmsforall/Millie-35B-A3B-7GB
- Modelo base Agents-A1: https://huggingface.co/InternScience/Agents-A1
- Fork de llama.cpp requerido: https://github.com/llmsforall/llama.cpp
- Articulo sobre Qwen 3.6 35B-A3B (contexto de arquitectura): https://koishiai.com/en/articles/qwen-3-6-35b-a3b-moe-gpu
- Guia de VRAM para LLMs locales: https://insiderllm.com/guides/vram-requirements-local-llms/
