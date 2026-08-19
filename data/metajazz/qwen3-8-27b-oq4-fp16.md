# metajazz/Qwen3.8-27B-oQ4-fp16

## Resumen

Este repositorio contiene una cuantización mixta de 4 bits del modelo Qwen3.8-27B, realizada por el usuario metajazz mediante la herramienta oQ (oMLX v0.6.0.dev1). El modelo base, Qwen3.8-27B, es un modelo denso de visión-lenguaje de código abierto desarrollado por Qwen y lanzado el 14 de agosto de 2026, orientado a tareas de codificación, trabajo profesional, investigación y agentes de largo horizonte. La versión cuantizada está empaquetada en formato MLX safetensors, lo que la hace adecuada para ejecución local en dispositivos Apple Silicon y otras plataformas compatibles con MLX.

La cuantización oQ4-fp16 emplea precisión mixta con 4 bits y un tamaño de grupo de 64, manteniendo algunas capas en fp16 para preservar la calidad. Aunque el nombre del repositorio indica 27B, el archivo safetensors contiene aproximadamente 4.8 mil millones de parámetros, lo que refleja la compresión propia de la cuantización. Este modelo es relevante para quienes necesitan ejecutar un LLM de gran capacidad en hardware de consumo sin sacrificar demasiado rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer denso con capacidades de vision-lenguaje) |
| Parametros totales | 27B (nominal); 4.813.519.600 en el archivo safetensors cuantizado |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ4-fp16 (4 bits, group size 64, precision mixta con capas en fp16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B pertenece a la familia Qwen 3.5 y es un transformer denso, no un MoE, con capacidades multimodales (visión y lenguaje). Según la documentación de Jetson AI Lab, está diseñado para manejar planificación avanzada y feedback de herramientas y entornos en tareas agénticas de múltiples pasos. No se dispone de información detallada sobre el dataset de entrenamiento ni sobre el uso de RLHF o DPO en el modelo original.

La cuantización de este repositorio se realizó con oMLX v0.6.0.dev1, que aplica cuantización de precisión mixta: la mayoría de las capas se reducen a 4 bits con un tamaño de grupo de 64, mientras que algunas capas críticas se mantienen en fp16 para mitigar la pérdida de calidad. El resultado es un archivo en formato MLX safetensors, optimizado para el framework MLX de Apple.

## Capacidades

- Generacion de texto y razonamiento complejo, incluyendo tareas de codificacion y matematicas.
- Comprension de imagenes y texto (vision-lenguaje), segun las especificaciones del modelo base.
- Soporte de tool calling y manejo de feedback de entornos, lo que permite construir agentes autonomos con planificacion multi-paso.
- Capacidad para tareas agénticas de largo horizonte, como navegacion web o ejecucion de flujos de trabajo complejos.
- Multilingüismo: no confirmado en la informacion disponible.

## Casos de uso

- Asistente de codificacion en entornos locales: el modelo puede generar, revisar y depurar codigo en multiples lenguajes, integrándose en IDEs o pipelines de CI/CD mediante tool calling.
- Agentes de automatizacion de tareas: gracias a su capacidad para manejar feedback de herramientas, puede ejecutar flujos de trabajo de varios pasos, como gestion de correos, generacion de informes o scraping web.
- Analisis de documentos con imagenes: al ser un VLM, puede extraer informacion de capturas de pantalla, diagramas o documentos escaneados, util en entornos de investigacion o soporte tecnico.
- Chatbot de atencion al cliente con contexto largo: aunque la longitud de contexto no esta confirmada, la arquitectura de Qwen 3.5 suele soportar ventanas amplias, adecuadas para conversaciones prolongadas.
- Prototipado rapido de aplicaciones de IA en Mac: al estar en formato MLX, se puede ejecutar localmente en Mac con Apple Silicon, ideal para desarrollo y pruebas sin conexion.
- Investigacion academica: el modelo base es open-weight, lo que permite experimentar con tecnicas de prompting, fine-tuning o evaluacion en tareas de razonamiento y multimodalidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el archivo safetensors ocupa 17.6 GB, por lo que se recomienda al menos 24 GB de memoria unificada en Apple Silicon (M2 Pro/Max o superior) para cargar el modelo completo en RAM.
- GPU recomendadas: Apple Silicon (M1 Pro/Max, M2 Pro/Max, M3, etc.) con soporte MLX; tambien puede ejecutarse en AMD Ryzen AI Max y Radeon GPUs mediante MLX (segun el blog de AMD).
- En GPUs NVIDIA, se requeriria una conversion a otro formato (por ejemplo, GGUF) ya que MLX es especifico de Apple y AMD.
- Opciones de despliegue: MLX (framework de Apple), LM Studio (con soporte MLX), y posiblemente otras herramientas que acepten safetensors de MLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-oQ4-fp16 (este) | 27B nominal, 4.8B en archivo | no disponible | 4-bit MLX | no disponible | HuggingFace |
| Qwen3.8-27B-oQ6-fp16-mtp | 27B nominal | no disponible | 6-bit MLX | no disponible | HuggingFace |
| Qwen3.8-27B (original) | 27B | no disponible | sin cuantizar | open-weight | HuggingFace / Qwen |

La variante oQ6-fp16-mtp, tambien de metajazz, usa 6 bits y posiblemente incorpore multi-token prediction (mtp), ofreciendo mayor fidelidad a costa de mayor tamano. El modelo original sin cuantizar es la referencia de calidad, pero requiere mas recursos.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido, lo que supone un riesgo legal para proyectos empresariales.
- La cuantizacion de 4 bits puede degradar la calidad de generacion, especialmente en tareas de razonamiento complejo o generacion de codigo, en comparacion con el modelo original.
- No se ha verificado si esta version cuantizada incluye el encoder de vision del modelo base; la model card no menciona capacidades multimodales, por lo que podria ser solo el LLM.
- No hay informacion sobre sesgos, alucinaciones o limitaciones de idioma especificas de este modelo cuantizado.
- El numero de parametros en el archivo safetensors (4.8B) es mucho menor que el nominal (27B), lo que podria indicar que la cuantizacion elimina o fusiona pesos de forma agresiva; se recomienda validar el comportamiento en tareas reales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/metajazz/Qwen3.8-27B-oQ4-fp16
- Repositorio de oMLX (herramienta de cuantizacion): https://github.com/jundot/omlx
- Blog de AMD sobre Qwen3.8 27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Ficha de Qwen3.8 27B en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-8-27b/
- AI Release Tracker de Qwen3.8-27B: https://aireleasetracker.com/model/qwen/qwen3.8-27b
- Variante oQ6-fp16-mtp: https://huggingface.co/metajazz/Qwen3.8-27B-oQ6-fp16-mtp
