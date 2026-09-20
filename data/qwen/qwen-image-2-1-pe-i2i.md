# Qwen/Qwen-Image-2.1-PE-I2I

## Resumen

Qwen-Image-2.1-PE-I2I es un modelo de reescritura de prompts para edicion de imagenes desarrollado por el equipo Qwen. Se trata de un ajuste fino del modelo multimodal Qwen3.5-VL de 9B (9.409.813.744 parametros, segun los pesos en safetensors) cuya unica tarea es convertir una instruccion de edicion vaga escrita por un usuario, junto con una o varias imagenes de entrada, en un prompt preciso y accionable que pueda consumir un modelo de edicion de imagenes downstream.

El modelo cubre un problema concreto en los pipelines de edicion generativa: los modelos de difusion como Qwen-Image-2.1 responden mucho mejor a descripciones detalladas y estructuradas que a ordenes coloquiales del tipo "pon el cielo al atardecer". Qwen-Image-2.1-PE-I2I actua como capa intermedia de traduccion semantica, devolviendo un objeto JSON con el prompt reescrito y la decision de relacion de aspecto, tras un bloque de razonamiento interno.

Es relevante ahora porque la familia Qwen-Image-2.1 apuesta por la creacion y edicion unificadas (incluida transparencia nativa RGBA y hasta diez imagenes de referencia) y ese nivel de control exige prompts mucho mas ricos que los que un usuario escribe habitualmente. El modelo se publica bajo licencia qwen-research, en formato safetensors con un tamano de repositorio de 18,8 GB, y esta disenado para ejecutarse con transformers >= 5.4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-lenguaje (etiqueta qwen3_5), ajustado para reescritura de prompts de edicion |
| Parametros totales | 9.409.813.744 (aproximadamente 9,4 B) |
| Parametros activos | no disponible (no se indica que sea una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio distribuye pesos safetensors y el ejemplo oficial carga en bfloat16 |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas) |
| Licencia | qwen-research (Qwen Research License Agreement) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-VL de 9B, un transformer multimodal capaz de procesar texto e imagenes, y se ha ajustado de forma especifica para la tarea de image-to-image prompt rewriting (de ahi el sufijo PE-I2I). La entrada sigue una plantilla de chat con tres elementos: un system prompt que se distribuye dentro del propio repositorio (fichero `system_prompt.txt`, que debe cargarse obligatoriamente), una o varias imagenes referenciadas como `<image1>`, `<image2>`, etc., y la instruccion del usuario. La inferencia se realiza con `AutoModelForImageTextToText` y `AutoProcessor`, con `enable_thinking=True`.

La salida tiene una estructura fija: un bloque de razonamiento delimitado por `</think>` seguido de un objeto JSON con los campos `rewritten_prompt` (la instruccion de edicion expandida), `wh_ratio` (relacion de aspecto elegida cuando se crea una composicion nueva, por ejemplo `"16:9"`) y `ratio_follow` (imagen de la que heredar la relacion de aspecto cuando se edita in situ). Los dos ultimos campos son mutuamente excluyentes: exactamente uno lleva valor. Los hiperparametros sugeridos en la model card son `max_new_tokens=24000`, `do_sample=True`, `temperature=1.0`, `top_p=0.95` y `top_k=20`, lo que indica que el modelo puede generar cadenas de razonamiento largas antes de emitir el JSON.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset de ajuste ni si se emplearon tecnicas de RLHF o DPO. Como contexto del ecosistema, el modelo downstream Qwen-Image-2.1 emplea unos 7B de parametros en su componente de generacion visual, con 32 capas DiT single-stream, atencion de granularidad mixta y reutilizacion de cache KV de prefijo.

## Capacidades

- Reescritura de prompts de edicion: transforma instrucciones ambiguas o coloquiales en descripciones tecnicas detalladas listas para un modelo de difusion.
- Comprension de imagenes de entrada: analiza la imagen o imagenes proporcionadas para anclar la reescritura en el contenido real (sujetos, escena, iluminacion, estilo).
- Edicion multi-imagen: acepta varias imagenes de referencia identificadas como `<image1>`, `<image2>`, etc., y permite instrucciones que las combinan, como trasladar el sujeto de una imagen a la escena de otra.
- Modo de razonamiento explicito: genera un bloque `<think>` previo a la respuesta, separable mediante particion del texto.
- Salida estructurada en JSON: `rewritten_prompt`, `wh_ratio` y `ratio_follow`, lo que facilita el encadenamiento automatico con pipelines de generacion.
- Decision de relacion de aspecto: elige entre crear una composicion nueva con un ratio concreto o heredar el de una imagen de entrada.
- Preservacion de identidad: segun la documentacion de la familia, el pipeline completo mantiene la identidad de personas y productos en las ediciones.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes multi-paso: no disponible de forma explicita; su uso natural es como un unico paso previo dentro de un pipeline de edicion.
- Capacidades multilingues: no disponible (la model card no las declara).

## Casos de uso

- Preprocesado de instrucciones en aplicaciones de edicion fotografica: el usuario escribe "quita el coche del fondo" y el modelo genera un prompt tecnico con la zona afectada, la iluminacion esperada y el estilo de relleno, que se pasa a Qwen-Image-2.1 mediante `QwenImage21Pipeline`.
- Automatizacion de retoque de producto en comercio electronico: a partir de una foto de catalogo, se reescriben instrucciones como "fondo blanco limpio" en prompts que preservan la identidad del producto y fijan la relacion de aspecto del listado mediante `ratio_follow`.
- Composicion creativa con varias referencias: combinacion de un retrato y una escena para generar un montaje publicitario, usando la sintaxis multi-imagen para indicar explicitamente que sujeto y que fondo se mezclan.
- Generacion de material grafico con transparencia: el pipeline de la familia permite capas RGBA, por lo que el prompt reescrito puede solicitar extraccion de sujeto sobre fondo transparente para assets de diseno.
- Integracion en herramientas de edicion conversacional: el modelo actua como interprete de la peticion del usuario en una interfaz de chat, devolviendo JSON parseable que el frontend puede editar antes de lanzar la generacion.
- Normalizacion de prompts en pipelines por lotes: procesado masivo de descripciones heterogeneas procedentes de formularios o CSVs para homogeneizar el formato que consume el motor de difusion, gracias a la salida JSON con esquema fijo.
- Control de formato de salida: seleccion automatica de relacion de aspecto (`wh_ratio`) para adaptar una misma edicion a formatos de story, cuadrado o panoramico sin intervencion manual.
- Investigacion en reescritura de instrucciones multimodales: el modelo sirve como referencia ajustada para estudiar como un VLM de 9B reformula lenguaje natural condicionado por una imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: los pesos ocupan aproximadamente 18,8 GB, por lo que se necesitan al menos 20-24 GB de VRAM contando activaciones y cache KV; el ejemplo oficial usa `device_map="auto"`.
- Cuantizacion: no se documentan cuantizaciones oficiales. Como estimacion derivada del numero de parametros, 8 bits rondarian los 10-11 GB y 4 bits los 6 GB, pero no hay pesos GGUF ni AWQ publicados por el autor.
- GPU recomendadas: A100 40 GB, H100, L40S o cualquier acelerador con 24 GB o mas para bfloat16 completo.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB como RTX 3090 o RTX 4090, aunque con margen ajustado si se generan hasta 24.000 tokens nuevos de razonamiento. En tarjetas de 16 GB seria necesario cuantizar.
- Opciones de despliegue: unicamente se documenta la via `transformers >= 5.4.0` con `torch >= 2.4.0`, `accelerate` y `pillow`, cargando el modelo con `AutoModelForImageTextToText`. No se mencionan vLLM, TGI, llama.cpp, Ollama ni pesos GGUF.
- Latencia y throughput: no disponible. El coste de decodificacion es alto porque el modelo puede emitir bloques de razonamiento muy largos antes del JSON final.

## Comparativa con modelos similares

No se han encontrado en la informacion disponible modelos directamente comparables de reescritura de prompts de edicion con pesos abiertos. La tabla recoge los elementos relacionados de los que si hay datos.

| Modelo | Funcion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-2.1-PE-I2I | Reescritura de prompts de edicion (image-to-image) | 9.409.813.744 | no disponible | qwen-research | HuggingFace |
| Qwen-Image-2.1 | Generacion texto-a-imagen y edicion unificadas | 7 B en el componente de generacion visual (32 capas DiT single-stream) | no disponible | no disponible en la informacion proporcionada | HuggingFace y ModelScope |
| Qwen3.5-VL 9B | Vision-lenguaje de proposito general (base del ajuste) | aproximadamente 9 B | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Riesgo de alucinacion: al reescribir, el modelo puede introducir elementos, texturas o estilos que no existen en la imagen de entrada ni en la intencion del usuario, y esos detalles se trasladaran al resultado final.
- Dependencia del system prompt: el ejemplo oficial exige cargar `system_prompt.txt` desde el repositorio; omitirlo o modificarlo puede degradar de forma notable la calidad del JSON generado.
- Salida JSON que requiere validacion: los campos `wh_ratio` y `ratio_follow` son mutuamente excluyentes, pero el modelo puede producir JSON malformado o incoherente, por lo que conviene envolver el parseo en un bloque tolerante a errores.
- Cobertura de idiomas no declarada: la model card no especifica que idiomas soporta. Los prompts de ejemplo estan en ingles, de modo que el rendimiento en castellano no esta garantizado.
- Uso comercial restringido: la licencia qwen-research no es una licencia de codigo abierto permisiva; es imprescindible revisar el fichero LICENSE antes de integrar el modelo en un producto comercial.
- El modelo no genera imagenes: solo produce texto. Necesita obligatoriamente un modelo de difusion downstream, como Qwen-Image-2.1, para completar la tarea.
- Sin benchmarks publicados: no hay datos verificables de calidad de reescritura ni comparaciones con alternativas, lo que dificulta estimar su ganancia real frente a un VLM generico.
- Adopcion incipiente: el repositorio registra 0 descargas y 15 likes, por lo que la validacion por parte de la comunidad es practicamente inexistente.
- Limites de la tarea downstream: caracteristicas como las diez imagenes de referencia, las mascaras o las anotaciones pintadas pertenecen al modelo de edicion Qwen-Image-2.1, no a este reescritor, que solo debe describirlas en el prompt.
- Coste de inferencia elevado: la generacion de hasta 24.000 tokens con muestreo aleatorio encarece cada reescritura y complica el despliegue en escenarios de baja latencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Qwen/Qwen-Image-2.1-PE-I2I
- Modelo de edicion asociado en HuggingFace: https://huggingface.co/Qwen/Qwen-Image-2.1
- Modelo de edicion en ModelScope: https://modelscope.cn/models/Qwen/Qwen-Image-2.1
- Blog de Qwen-Image-2.1: https://qwen.ai/blog?id=qwen-image-2.1
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/Qwen/Qwen-Image-2.1
- Repositorio en GitHub: https://github.com/QwenLM/Qwen-Image-2.1
- Servidor de Discord de Qwen: https://discord.gg/CV4E9rpNSD
- Licencia Qwen Research: https://huggingface.co/Qwen/Qwen-Image-2.1-PE-I2I/blob/main/LICENSE
- Portal de Qwen: https://qwen.ai/home
- Qwen Studio (acceso online a los modelos de la familia): https://chat.qwen.ai/
- Articulo de Qwen en Wikipedia: https://en.wikipedia.org/wiki/Qwen
