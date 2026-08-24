# Atomic-Germ/Gemma3-1B-NPU2

## Resumen

Atomic-Germ/Gemma3-1B-NPU2 es un ajuste fino del modelo base google/gemma-3-1b-it, desarrollado por el usuario Atomic-Germ con la librería Unsloth. Se trata de una versión de texto del modelo Gemma 3 de Google DeepMind, optimizada para su despliegue en dispositivos con recursos limitados, como portátiles o equipos de escritorio. El sufijo "NPU2" sugiere una orientación hacia aceleradores de redes neuronales (NPU), aunque no se ha publicado documentación técnica que confirme esta optimización.

El modelo hereda la arquitectura decoder-only de Gemma 3, con aproximadamente 1.000 millones de parámetros, una ventana de contexto de 32.000 tokens y capacidad de generación de texto. Aunque el modelo base de Gemma 3 es multimodal, esta variante se ha etiquetado como `gemma3_text_only`, por lo que solo procesa entrada textual. Su licencia es la de Gemma, que permite uso comercial bajo ciertas condiciones. Su relevancia radica en ofrecer una alternativa ligera y de código abierto para tareas de generación de texto, razonamiento y código en entornos con recursos computacionales limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3, con atención multi-consulta) |
| Parametros totales | Aproximadamente 1.000 millones (1B) |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | 32.000 tokens |
| Tipos de cuantizacion | No disponible (repo de 2,5 GB; probablemente BF16/FP16 en safetensors) |
| Idiomas soportados | En (ingles); el modelo base soporta 140+ idiomas, pero este fine-tune solo declara ingles |
| Licencia | Gemma (terminos de uso de Google) |
| Formato de pesos | safetensors (inferido por el tamano del repo y la libreria transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Gemma 3, un transformer decoder-only con atención multi-consulta (multi-query attention) que reduce el uso de memoria y mejora la eficiencia en inferencia. A diferencia de los modelos MoE, es un modelo denso, lo que simplifica su despliegue. El modelo base google/gemma-3-1b-it fue entrenado por Google DeepMind sobre un conjunto de datos de 2 billones de tokens (2T), que incluye documentos web en mas de 140 idiomas, codigo y matematicas, y posteriormente ajustado con instrucciones (instruction tuning). El fine-tune de Atomic-Germ se realizo con Unsloth, una libreria de entrenamiento eficiente, aunque no se han publicado detalles sobre el dataset de ajuste ni sobre el proceso de entrenamiento (por ejemplo, si se empleo RLHF o DPO). El nombre "NPU2" no esta documentado, pero podria indicar una cuantizacion o ajuste para unidades de procesamiento neuronal.

## Capacidades

- Generacion de texto fluida en ingles, con capacidad de responder preguntas, resumir documentos y mantener conversaciones multiturno.
- Razonamiento basico y resolucion de problemas logicos y matematicos simples, heredado del modelo base Gemma 3.
- Comprension de codigo y generacion de fragmentos de codigo en varios lenguajes de programacion, aunque con limitaciones por su tamano reducido.
- Soporte de tool calling (funciones) y de agentes, segun las capacidades del modelo base Gemma 3, aunque no se ha verificado especificamente en este fine-tune.
- Capacidades multilingues en el modelo base, pero este fine-tune declara solo ingles.
- No incluye soporte de vision ni de audio; es estrictamente texto (etiqueta `gemma3_text_only`).
- Ventana de contexto de 32k tokens, adecuada para documentos largos y conversaciones extensas.
- No se ha confirmado un modo de pensamiento ("thinking mode") especifico en esta variante.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multiturno con contexto largo (hasta 32k tokens) gracias a su ventana, lo que permite mantener el historial completo de una interaccion sin truncamientos. Es adecuado para sistemas de chat integrados en sitios web o aplicaciones de mensajeria.
- Generacion de codigo asistida: aunque no es un modelo de gran tamaño, puede sugerir fragmentos de codigo, completar funciones simples y explicar errores de sintaxis en entornos de desarrollo integrados (IDE) o en pipelines de CI/CD para generar documentacion tecnica.
- Resumen de documentos largos: con su contexto de 32k tokens, puede resumir articulos, informes o contratos de varias paginas en un solo paso, sin necesidad de dividir el texto en trozos.
- Chatbots educativos: para entornos de aprendizaje de idiomas o tutoria en materias de ciencias y humanidades, el modelo puede mantener conversaciones pedagogicas con estudiantes, adaptandose a un presupuesto computacional reducido.
- Procesamiento de datos en el borde (edge): dado su tamano y su etiqueta "NPU2", puede desplegarse en dispositivos con aceleradores de red neuronal, como moviles o equipos de escritorio con NPU integradas, para tareas de generacion de texto en local sin conexion.
- Extraccion de informacion estructurada: puede convertir texto no estructurado en listas o tablas, por ejemplo, extrayendo entidades, fechas y cifras de correos electronicos o facturas, mediante prompts bien disenados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no presenta evaluaciones propias (MMLU, HumanEval, GSM8K, etc.) en la model card ni en la busqueda web. Los datos de rendimiento del modelo base google/gemma-3-1b-it se encuentran en el informe tecnico de Gemma 3, pero no se pueden atribuir directamente a este fine-tune, ya que no se ha confirmado que el ajuste no degrade las metricas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5 GB en BF16 (tamano del repo), lo que cabe en una GPU de consumo con 4 GB de VRAM, como una NVIDIA GTX 1650 o RTX 3050. Con cuantizacion de 4 bits (por ejemplo, Q4_K_M), el modelo podria ocupar alrededor de 0,8-1 GB y ejecutarse en CPU o GPU integrada.
- GPU recomendadas: NVIDIA RTX 3060 o superior, o cualquier GPU con al menos 4 GB de VRAM. Tambien es compatible con aceleradores NPU modernos (por ejemplo, Apple Neural Engine o Intel NPU), aunque no se ha verificado oficialmente.
- Cabe en GPUs de consumo: si, en practicamente todas las GPUs de consumo actuales, incluyendo las integradas de ultima generacion.
- Opciones de despliegue: compatible con transformers (Hugging Face), vLLM, llama.cpp (con conversion a GGUF), Ollama y TGI. La libreria Unsloth permite una inferencia optimizada con menor latencia.
- Latencia y rendimiento: no hay datos publicados de este modelo especifico. En general, un modelo de 1B puede generar entre 20 y 50 tokens por segundo en una GPU de consumo media, y entre 5 y 15 tokens/s en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma3-1B-NPU2 (este modelo) | ~1B | 32k | en (base: 140+) | Gemma | Hugging Face |
| google/gemma-3-1b-it (base) | ~1B | 32k | 140+ | Gemma | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1,5B | 128k | multilingue | Apache 2.0 | Hugging Face |
| Llama-3.2-1B | 1B | 128k | multilingue | Llama 3.2 | Hugging Face |

La comparativa se basa en especificaciones publicas de los modelos base. No se dispone de datos de rendimiento comparativos de este fine-tune especifico. El modelo base Gemma 3 1B es conocido por su eficiencia en hardware limitado, mientras que Qwen2.5-1.5B ofrece una ventana de contexto mayor (128k) y una licencia mas permisiva (Apache 2.0). Llama-3.2-1B tambien ofrece 128k de contexto y licencia de Meta.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo base Gemma 3 puede presentar sesgos socioculturales y de genero, aunque Google aplico filtros de contenido sensible y CSAM en el entrenamiento. Este fine-tune no ha sido evaluado para mitigar estos sesgos.
- Riesgo de alucinacion: al ser un modelo de 1B, su capacidad de razonamiento es limitada y puede generar respuestas plausibles pero incorrectas, especialmente en tareas de conocimiento factual o matematicas complejas.
- Limitaciones de contexto: la ventana de 32k tokens es menor que la de otros modelos de 1B (como Qwen2.5 con 128k), lo que limita el procesamiento de documentos muy largos.
- Limitaciones de idioma: el modelo declara solo ingles en su configuracion. Aunque el modelo base soporta 140+ idiomas, no se ha verificado que el fine-tune mantenga esa capacidad; su uso en otros idiomas puede degradar la calidad.
- Restricciones de licencia: la licencia Gemma permite uso comercial, pero impone restricciones sobre el uso para fines militares o de vigilancia, y requiere el cumplimiento de las politicas de uso aceptable de Google.
- Caveat de produccion: al ser un fine-tune de un autor no verificado, con cero descargas y cero likes, se recomienda validar su calidad y seguridad antes de desplegarlo en produccion. El nombre "NPU2" no tiene documentacion que lo respalde.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Atomic-Germ/Gemma3-1B-NPU2
- Modelo base en Hugging Face: https://huggingface.co/google/gemma-3-1b-it
- Informe tecnico de Gemma 3: https://goo.gle/Gemma3Report
- Documentacion oficial de Gemma: https://ai.google.dev/gemma/docs/core
- Pagina de Gemma 3 en DeepMind: https://deepmind.google/models/gemma/gemma-3/
- Repositorio de Gemma 3 en GitHub: https://github.com/gemma-3/gemma-3
- Kit de herramientas de IA responsable: https://ai.google.dev/responsible
