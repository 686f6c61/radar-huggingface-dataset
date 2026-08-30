# Rin247/gemma-4-12B-it-Feral-Aquarion-INT8

## Resumen

El modelo `Rin247/gemma-4-12B-it-Feral-Aquarion-INT8` es una cuantización INT8 (weight-only) del modelo base `gemma-4-12B-it-Feral-Aquarion`, una variante no oficial del modelo Gemma 4 12B de Google DeepMind. Esta versión cuantizada reduce el tamaño de los pesos a 8 bits mediante el método RTN (Round-To-Nearest) ejecutado en CPU, manteniendo las escalas de cuantización almacenadas junto a los pesos en formato safetensors. El objetivo es facilitar la inferencia en hardware con recursos limitados, sacrificando algo de precisión a cambio de un menor uso de memoria y mayor velocidad.

El modelo base, Gemma 4 12B, es un modelo multimodal encoder-free de 12 mil millones de parámetros, capaz de procesar texto, audio y vídeo de forma nativa, y está diseñado para ejecutarse en portátiles con 16 GB de VRAM. Esta cuantización INT8 permite que el modelo sea aún más accesible, aunque requiere un proceso de de-cuantización manual antes de la inferencia, ya que no es un formato estándar de carga directa. El repositorio tiene 0 descargas y 0 likes, lo que indica que es una publicación reciente y sin uso verificado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal encoder-free (Gemma 4 12B) |
| Parametros totales | 11.959.730.224 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (weight-only, RTN) |
| Idiomas soportados | no disponible (el modelo base soporta múltiples idiomas, pero no se especifica) |
| Licencia | no disponible |
| Formato de pesos | safetensors (con buffers de escala y forma) |

## Arquitectura y entrenamiento

La cuantización se aplica sobre el modelo `gemma-4-12B-it-Feral-Aquarion`, que a su vez deriva de Gemma 4 12B de Google. El modelo base es un transformer multimodal encoder-free, lo que significa que no utiliza un codificador visual o auditivo separado, sino que procesa directamente las secuencias de tokens de texto, audio y vídeo. Según la información pública de Google, Gemma 4 12B está entrenado con un enfoque de alineación mediante RLHF y destilación, aunque los detalles específicos del dataset y el número de tokens de entrenamiento no se han publicado en la documentación disponible.

La cuantización INT8 se realizó con PyTorch RTN (Round-To-Nearest) en CPU, un método que redondea los pesos a 8 bits y almacena las escalas de cuantización por tensor o por canal. Los archivos incluyen `model.safetensors` y `config.json` con la configuración de cuantización (`quantization_config`). Es importante destacar que este formato no es compatible con motores de inferencia estándar como vLLM o llama.cpp sin un paso previo de de-cuantización, ya que los pesos están empaquetados con escalas y formas personalizadas.

## Capacidades

- Generación de texto y razonamiento: el modelo base es capaz de tareas de lenguaje natural, incluyendo razonamiento complejo y generación de código.
- Multimodalidad nativa: procesa texto, audio y vídeo sin necesidad de codificadores externos, lo que permite tareas como transcripción, descripción de vídeo o análisis de audio.
- Tool calling y function calling: aunque no se especifica explícitamente, los modelos Gemma 4 suelen incluir soporte para llamadas a herramientas, lo que permite su integración en agentes.
- Capacidades multilingües: el modelo base soporta múltiples idiomas, aunque la lista exacta no está disponible en la información proporcionada.
- La cuantización INT8 no altera las capacidades funcionales del modelo, pero puede degradar ligeramente la precisión en tareas sensibles a la cuantización.

## Casos de uso

- Asistente local multimodal en portátiles: gracias a la cuantización INT8, el modelo puede ejecutarse en GPUs con menos de 16 GB de VRAM, permitiendo un asistente que procese texto, audio y vídeo en tiempo real sin conexión a la nube.
- Transcripción y análisis de audio: el modelo puede transcribir reuniones, podcasts o llamadas, y extraer información relevante, aprovechando su capacidad nativa de audio.
- Descripción y búsqueda en vídeo: para aplicaciones de análisis de vídeo, el modelo puede generar descripciones de escenas, detectar eventos o responder preguntas sobre el contenido visual y auditivo.
- Generación de código asistida: con soporte de tool calling, puede integrarse en entornos de desarrollo para autocompletar, revisar o explicar código, aunque la cuantización puede afectar la precisión en tareas de programación complejas.
- Agente conversacional para atención al cliente: el modelo puede gestionar conversaciones multi-turno con contexto largo, aunque la longitud de contexto no está especificada, y su capacidad multimodal permite procesar mensajes de voz o vídeo.
- Prototipado de aplicaciones de IA en entornos con recursos limitados: al ser una cuantización INT8, es adecuado para pruebas en hardware modesto, como una RTX 3060 o una RTX 4060, antes de escalar a modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Gemma 4 12B ha sido evaluado por Google en tareas como MMLU, HumanEval y GSM8K, pero no se proporcionan cifras concretas en los resultados de búsqueda. La cuantización INT8 puede introducir una degradación típica de entre 1 y 3 puntos porcentuales en tareas de razonamiento, pero no hay datos específicos para esta variante.

## Requisitos de hardware

- VRAM estimada: el modelo base requiere 16 GB de VRAM según Google; la cuantización INT8 reduce el tamaño de los pesos de 13.1 GB a aproximadamente 12 GB (el repo ocupa 13.1 GB, pero incluye escalas y config), por lo que podría caber en GPUs con 12 GB de VRAM, como una RTX 3060 o RTX 4070.
- GPU recomendadas: RTX 3060 12GB, RTX 4070, RTX 4080, A100 40GB (para mayor margen), o cualquier GPU con al menos 12 GB de VRAM.
- No cabe en GPUs de 8 GB sin cuantización adicional (por ejemplo, FP8 o INT4).
- Opciones de despliegue: al ser un formato personalizado, no es compatible directamente con vLLM, llama.cpp u Ollama. Se requiere un script de de-cuantización en PyTorch para cargar los pesos y luego convertirlos a un formato estándar o usarlos con un motor personalizado.
- Latencia y throughput: no disponibles. Se espera que la inferencia sea más rápida que con el modelo FP16 gracias a la reducción de memoria, pero la de-cuantización manual añade una sobrecarga inicial.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rin247/gemma-4-12B-it-Feral-Aquarion-INT8 | 11.96B | no disponible | INT8 weight-only | no disponible | HuggingFace |
| google/gemma-4-12B (base) | 12B | no disponible | FP16/BF16 | Gemma Terms of Use | HuggingFace |
| Rin247/gemma-3-12b-it-Uncensored-Aquarion-FP4 | 12B | no disponible | FP4 | no disponible | HuggingFace |

La comparativa se basa en el modelo base de Google y en otra cuantización del mismo autor. La variante INT8 ofrece un equilibrio entre precisión y uso de memoria, mientras que la FP4 es más agresiva y probablemente menos precisa. El modelo base de Google es la referencia oficial, con licencia de uso comercial bajo los términos de Gemma.

## Limitaciones y advertencias

- La licencia no está especificada en el repositorio, lo que genera incertidumbre sobre el uso comercial. Se recomienda contactar al autor o verificar la licencia del modelo base.
- El formato de cuantización es personalizado y no está soportado por motores de inferencia estándar; requiere un proceso de de-cuantización manual, lo que complica su integración en producción.
- La cuantización INT8 puede degradar la precisión en tareas de razonamiento matemático, generación de código y comprensión de matices lingüísticos.
- No se dispone de información sobre la longitud de contexto, lo que limita su uso en aplicaciones que requieran ventanas de contexto largas.
- El modelo base puede presentar sesgos y alucinaciones, como cualquier modelo de lenguaje grande, y la cuantización no mitiga estos riesgos.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad; se recomienda probar exhaustivamente antes de usarlo en entornos críticos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Rin247/gemma-4-12B-it-Feral-Aquarion-INT8
- Modelo base de Google: https://huggingface.co/google/gemma-4-12B
- Página oficial de Gemma 4: https://deepmind.google/models/gemma/gemma-4/
- Blog de Google sobre Gemma 4 12B: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
- Guía para desarrolladores de Gemma 4 12B: https://developers.googleblog.com/gemma-4-12b-the-developer-guide/
- Modelo similar del mismo autor: https://huggingface.co/Rin247/gemma-3-12b-it-Uncensored-Aquarion-FP4
