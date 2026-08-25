# AI4SGI/ExoMind-9B-Q4_K_M-GGUF

## Resumen

ExoMind-9B-Q4_K_M-GGUF es una cuantización en formato GGUF del modelo ExoMind-9B, desarrollado por el equipo ExoMind del Shanghai Artificial Intelligence Laboratory. Este modelo forma parte de la familia ExoMind, un sistema agéntico inspirado en el concepto de "mente extendida" (extended mind) que busca democratizar la inteligencia científica mediante razonamiento avanzado, uso de herramientas y capacidades multimodales. El modelo base está construido sobre Qwen3.5, con una arquitectura transformer densa de aproximadamente 8,95 mil millones de parámetros y una ventana de contexto de 32 768 tokens.

Esta versión Q4_K_M está diseñada específicamente para despliegue local eficiente en recursos, reduciendo el tamaño del modelo a 5,24 GiB (más 875 MiB del proyector multimodal en F16). Es relevante porque permite ejecutar un sistema de razonamiento científico multimodal en hardware de consumo, sin sacrificar las capacidades agénticas y de tool use del modelo original. La licencia Apache 2.0 facilita su uso comercial y su integración en pipelines de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.5) |
| Parametros totales | 8 953 803 264 (8,95 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32 768 tokens |
| Tipos de cuantizacion | Q4_K_M (este repo); Q8_0 y F16 disponibles en repos separados |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo Q4_K_M + proyector multimodal F16) |

## Arquitectura y entrenamiento

ExoMind-9B es un transformer denso derivado de Qwen3.5, con capacidad multimodal que integra un proyector de visión para procesar entradas de imagen junto con texto. El sistema ExoMind incorpora tres componentes principales: ingeniería de datos sistemática, un marco de interacción científica y una estrategia de entrenamiento sistemática. Aunque no se detallan los datos de entrenamiento específicos (número de tokens, composición del dataset, uso de RLHF o DPO), el enfoque declarado es mejorar el razonamiento científico y las capacidades de investigación mediante entrenamiento de bajo coste y con un modelo relativamente pequeño. La cuantización Q4_K_M se realizó con llama.cpp, y el repositorio incluye el proyector multimodal en F16 para preservar la calidad de la visión.

## Capacidades

- Razonamiento científico: diseñado para tareas de razonamiento complejo en dominios científicos, con mejoras reportadas en ocho benchmarks científicos (aunque los resultados publicados corresponden al modelo 35B-A3B, no a esta variante).
- Uso de herramientas (tool use): soporta llamadas a funciones y puede integrarse en flujos agénticos.
- Capacidades agénticas: pensamiento multi-paso y ejecución de tareas complejas con planificación.
- Multimodal: acepta entradas de imagen y texto, permitiendo análisis de figuras, gráficos y diagramas científicos.
- Conversacional: mantiene diálogos multi-turno con contexto largo (32K tokens).
- Multilingüe: no confirmado explícitamente, pero al estar basado en Qwen3.5 es probable que herede capacidades multilingües.

## Casos de uso

- Asistente de investigación científica: el modelo puede analizar artículos, extraer conclusiones y responder preguntas sobre metodologías, gracias a su razonamiento científico y ventana de 32K tokens para documentos extensos.
- Análisis de figuras y gráficos en publicaciones: al ser multimodal, puede interpretar imágenes de experimentos, diagramas de flujo o resultados estadísticos, facilitando la revisión de literatura.
- Automatización de laboratorio: integrado como agente con tool use, puede consultar bases de datos, ejecutar scripts de análisis y resumir resultados en tiempo real.
- Generación de código para simulación numérica: soporta generación de código y puede ayudar a implementar modelos matemáticos o físicos en Python, con verificación iterativa.
- Tutoría científica personalizada: despliegue local en una GPU de consumo permite ofrecer explicaciones interactivas de conceptos avanzados a estudiantes e investigadores.
- Extracción de conocimiento de patentes y documentos técnicos: su capacidad de procesar texto largo y razonar sobre información compleja lo hace útil para resumir y comparar especificaciones técnicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta variante Q4_K_M. La model card indica explícitamente que la tabla de benchmarks principal del sistema ExoMind corresponde al modelo 35B-A3B y no debe atribuirse a ExoMind-9B. Tampoco se proporcionan puntuaciones separadas para el modelo base de 9B. Por tanto, no hay datos de rendimiento cuantitativo disponibles en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: el archivo del modelo Q4_K_M ocupa 5,24 GiB y el proyector multimodal 875 MiB, por lo que se necesitan aproximadamente 6,5-7 GB de VRAM para inferencia con contexto completo (32K tokens). Con contexto reducido, podría caber en 6 GB.
- GPU recomendadas: tarjetas de consumo con 8 GB o más, como RTX 3060, RTX 4060, RTX 4070, o GPUs profesionales como A10, L4. Para mayor velocidad, RTX 4090 o A100.
- Compatibilidad con hardware de consumo: sí, cabe en GPUs de gama media con 8 GB de VRAM.
- Opciones de despliegue: llama.cpp (incluido llama-server), Ollama, vLLM (con soporte GGUF), llama-cpp-python, y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y de la configuración de contexto.

## Comparativa con modelos similares

No se dispone de datos comparativos específicos para ExoMind-9B frente a otros modelos de su categoría. La información proporcionada no incluye benchmarks ni comparaciones con alternativas como Llama 3.1 8B, Qwen2.5 7B o Mistral 7B. Por tanto, no es posible realizar una comparativa fundamentada.

## Limitaciones y advertencias

- La cuantización Q4_K_M introduce pérdida de precisión respecto al modelo en F16, lo que puede afectar a tareas de razonamiento muy fino o a la generación de código complejo.
- No se han publicado evaluaciones específicas para esta variante; los resultados del sistema 35B-A3B no son extrapolables a este modelo de 9B.
- El modelo está orientado a razonamiento científico; su rendimiento en tareas generales puede ser inferior al de modelos generalistas del mismo tamaño.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en dominios especializados si no se dispone de contexto suficiente.
- La licencia Apache 2.0 permite uso comercial, pero los activos de marca, el texto del informe técnico y las figuras científicas están sujetos a los "ExoMind Research Content and Brand Terms" (ver CONTENT_RIGHTS.md).
- No se garantiza la reproducibilidad bit a bit de la conversión GGUF, ya que los comandos originales de conversión no se conservaron.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/AI4SGI/ExoMind-9B-Q4_K_M-GGUF
- Modelo base ExoMind-9B: https://huggingface.co/AI4SGI/ExoMind-9B
- Página del proyecto: https://ai4sgi.github.io/ExoMind/
- Repositorio GitHub: https://github.com/AI4SGI/ExoMind
- Informe técnico (PDF): https://github.com/AI4SGI/ExoMind/blob/main/Paper.pdf
- Modelo en ModelScope: https://modelscope.cn/models/AI4SGI/ExoMind-9B-Q4_K_M-GGUF
- Colección de la familia ExoMind: https://huggingface.co/collections/AI4SGI/exomind-model-family
