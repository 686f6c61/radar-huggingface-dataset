# darkneighbor667/Huihui-Qwen3.8-27B-abliterated

## Resumen

El modelo darkneighbor667/Huihui-Qwen3.8-27B-abliterated es una versión modificada del modelo Qwen/Qwen3.8-27B, desarrollada por el usuario darkneighbor667 y basada en el trabajo de huihui-ai. Se trata de un modelo multimodal (imagen-texto) de 27.781 millones de parámetros, con licencia Apache 2.0, que ha sido sometido a un proceso de "abliteration" para eliminar los rechazos y restricciones de contenido del modelo original. La técnica empleada, descrita en el repositorio remove-refusals-with-transformers, modifica selectivamente las capas 18 a 51 del transformer, manteniendo intactas las 15 primeras capas, así como los módulos MTP (multi-token prediction) y visual.

El modelo conserva las capacidades del Qwen3.8-27B original, incluyendo modo de pensamiento (thinking mode), procesamiento de imágenes y una ventana de contexto de 262.000 tokens, según la información publicada. Está disponible en formato safetensors y puede ejecutarse mediante Ollama con el comando `ollama run huihui_ai/Qwen3.8-abliterated`. Su relevancia radica en ofrecer una alternativa sin censura para aplicaciones que requieren generación de texto libre, aunque con los riesgos asociados a la eliminación de salvaguardas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basado en Qwen3.8-27B |
| Parametros totales | 27.781.427.952 (27,8 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.000 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer multimodal que procesa tanto texto como imágenes. La modificación principal consiste en la ablación de las capas 18 a 51, un proceso que elimina selectivamente ciertas direcciones de activación asociadas con comportamientos de rechazo. Las capas 0 a 15 se mantienen sin modificar para preservar el rendimiento general, y los componentes MTP y visual tampoco han sido alterados. Esta técnica, implementada como prueba de concepto sin TransformerLens, busca reducir la tendencia del modelo a negarse a responder ciertas peticiones.

No se dispone de información detallada sobre el entrenamiento del modelo base (composición del dataset, número de tokens, uso de RLHF o DPO). El proceso de abliteración no implica un entrenamiento adicional, sino una modificación directa de los pesos.

## Capacidades

- Generacion de texto y razonamiento: conserva las capacidades del Qwen3.8-27B para tareas de lenguaje natural, incluyendo razonamiento multi-paso.
- Modo de pensamiento (thinking mode): el modelo puede generar cadenas de razonamiento internas antes de responder, similar al modo "think" de otros modelos Qwen.
- Procesamiento de imagenes: al ser un modelo image-text-to-text, acepta entradas visuales junto con texto.
- Ventana de contexto larga: 262.000 tokens, adecuada para documentos extensos o conversaciones multi-turno.
- Tool calling y funciones de agente: no se especifica explícitamente, pero al derivar de Qwen3.8, es probable que herede soporte para function calling (no confirmado en la informacion disponible).
- Capacidad multilingue: no se han publicado los idiomas soportados.
- Generacion sin rechazos: la abliteracion elimina la mayoria de las respuestas de rechazo, permitiendo tratar temas que el modelo original evitaria.

## Casos de uso

- Generacion creativa sin restricciones: escritura de ficcion, poesia o guiones que aborden temas controvertidos o adultos, donde el modelo original podria negarse a colaborar.
- Investigacion academica sobre sesgos y seguridad: analisis del comportamiento de modelos ablacionados para estudiar los mecanismos de rechazo y su impacto en la utilidad del modelo.
- Desarrollo de asistentes conversacionales especializados: creacion de chatbots para nichos donde se requiere respuestas directas sin filtros morales, como simulaciones de personajes o juegos de rol.
- Procesamiento de documentos largos con imagenes: aprovechando la ventana de 262K tokens y la capacidad multimodal, para resumir informes extensos que incluyan figuras o diagramas.
- Generacion de codigo en entornos de investigacion: aunque no se confirma soporte de tool calling, el modelo base Qwen3.8 destaca en tareas de programacion, util para prototipos rapidos.
- Experimentacion con tecnicas de interpretabilidad: uso del modelo como banco de pruebas para metodos de ablacion y analisis de activaciones en transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de MMLU, HumanEval, GSM8K u otras evaluaciones estandar. Se recomienda consultar la ficha del modelo base Qwen/Qwen3.8-27B para obtener datos de rendimiento de referencia, aunque la ablacion puede degradar ligeramente el rendimiento en ciertas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en bfloat16 ocupa aproximadamente 55,6 GB (tamano del repositorio), por lo que se requiere al menos 60 GB de VRAM para cargarlo completo sin cuantizacion.
- GPU recomendadas: NVIDIA A100 80GB, H100 80GB o multiples GPUs (por ejemplo, 2x RTX 4090 con 24 GB cada una) para inferencia en precision completa.
- En consumer GPU: con cuantizacion a 4 bits (GGUF) podria caber en una RTX 4090 (24 GB) o similar, aunque no se han publicado cuantizaciones oficiales. La opcion via Ollama sugiere que existen versiones cuantizadas disponibles en ese ecosistema.
- Opciones de despliegue: transformers (con trust_remote_code=True), Ollama (comando `ollama run huihui_ai/Qwen3.8-abliterated`), y potencialmente vLLM o TGI si se generan los adaptadores necesarios.
- Latencia y throughput: no se han publicado datos especificos. Para un modelo de 27B en una A100, se puede esperar un throughput de 20-40 tokens/s en generacion autoregresiva, pero es una estimacion no confirmada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Huihui-Qwen3.8-27B-abliterated | 27,8 B | 262K | Apache 2.0 | Ablacion de capas 18-51, multimodal |
| Qwen/Qwen3.8-27B (base) | 27,8 B | 262K | Apache 2.0 | Modelo original con rechazos activos |
| Otros modelos abliterados de huihui-ai | variable | variable | Apache 2.0 | Misma tecnica aplicada a otras familias Qwen |

No se dispone de datos de rendimiento comparativo entre estos modelos. La principal diferencia es la eliminacion de rechazos, que no afecta a las capacidades tecnicas pero si al comportamiento en temas sensibles.

## Limitaciones y advertencias

- Sesgos conocidos: al derivar de Qwen3.8, el modelo puede heredar sesgos presentes en los datos de entrenamiento del modelo base, que no se han documentado en esta ficha.
- Riesgo de alucinacion: la abliteracion puede aumentar la probabilidad de generar contenido falso o inventado, especialmente en temas donde el modelo original habria rechazado responder.
- Limitaciones de contexto: aunque la ventana es de 262K tokens, el rendimiento puede degradarse en contextos muy largos, como es habitual en transformers.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificacion, pero no se garantiza que el contenido generado cumpla con regulaciones locales de contenido.
- Advertencia para produccion: al ser un modelo "uncensored", puede generar contenido ofensivo, ilegal o peligroso. No es recomendable desplegarlo en entornos donde los usuarios finales puedan verse expuestos a este tipo de salidas sin moderacion.
- La tecnica de abliteracion es una prueba de concepto y puede degradar el rendimiento en tareas que requieren las capas ablacionadas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/darkneighbor667/Huihui-Qwen3.8-27B-abliterated
- Repositorio original de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Pagina en Ollama: https://ollama.com/huihui_ai/Qwen3.8-abliterated
- Repositorio de la tecnica de abliteracion: https://github.com/Sumandora/remove-refusals-with-transformers
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
