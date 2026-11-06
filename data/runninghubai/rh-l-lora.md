# RunningHubAI/rh-l-lora

## Resumen

`rh-l-lora` es un adaptador LoRA publicado en Hugging Face por RunningHubAI, la cuenta institucional de la plataforma RunningHub. Segun la model card, el modelo se ha entrenado a partir de `moss-image` y esta orientado a la generacion de imagenes dentro de ComfyUI, con la etiqueta de plataforma `comfyui` y `lora`. El unico fichero de pesos declarado es `校长妈妈.safetensors`, de aproximadamente 71 MiB, lo que corresponde a un adaptador de bajo rango y no a un modelo completo.

El proposito declarado en la model card es estilistico: se describe como un "人物lora鸣潮" (un LoRA de personaje vinculado a la franquicia Wuthering Waves), con la palabra de activacion `LS1`. No se documentan ni la arquitectura base exacta, ni el numero de parametros, ni la longitud de contexto, ni los datos de entrenamiento. La relevancia practica es limitada a flujos de generacion de imagen en ComfyUI o en el propio entorno alojado de RunningHub; no es un modelo de lenguaje y no debe evaluarse como tal.

Conviene tratarlo como un artefacto de comunidad: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, un tamano de 0,7 GB (muy superior al fichero de pesos listado, lo que sugiere pesos adicionales u otros artefactos no documentados en la model card) y una licencia no disponible. La ficha siguiente refleja unicamente lo que consta en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base `moss-image`; arquitectura del modelo base no disponible |
| Parametros totales | no disponible (adaptador de 71 MiB; el rango e hiperparametros del LoRA no se documentan) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica a un LoRA de generacion de imagen) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se declaran variantes GGUF, FP8 ni cuantizaciones del adaptador) |
| Idiomas soportados | no disponible (modelo de imagen; la model card esta en chino e ingles) |
| Licencia | no disponible; la model card remite a "the original project or upstream license" |
| Formato de pesos | safetensors (`校长妈妈.safetensors`, ~71 MiB) |

## Arquitectura y entrenamiento

La informacion disponible identifica el artefacto como un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas de un modelo base congelado. El modelo base declarado es `moss-image`, del que no se aportan detalles sobre su arquitectura interna (tipo de backbone, dimensiones, mecanismo de atencion o variante de difusion). Tampoco se indica el rango del adaptador, el alpha, las capas objetivo ni el optimizador empleado.

No se publican datos sobre el conjunto de entrenamiento: ni numero de imagenes, ni resolucion, ni proceso de captioning, ni si se aplicaron tecnicas como regularizacion por clase o entrenamiento con mascaras. La unica referencia operativa es la palabra de activacion `LS1`, que debe incluirse en el prompt para activar el concepto aprendido. El entrenamiento se ha realizado, segun la model card, en la plataforma RunningHub, que ofrece un servicio de entrenamiento de modelos accesible desde `https://www.runninghub.ai/page-model`.

## Capacidades

- Generacion de imagenes condicionada por texto mediante un modelo de difusion subyacente (`moss-image`), con el LoRA aplicado como modificador de estilo o identidad.
- Reproduccion de un concepto de personaje concreto, activado mediante la palabra clave `LS1`.
- Integracion en flujos de trabajo de ComfyUI como nodo de carga de LoRA, segun las etiquetas del repositorio.
- Ejecucion en el entorno alojado de RunningHub, que permite probar el modelo sin infraestructura propia.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision por comprension, tool calling ni comportamiento agentico.
- No se documentan capacidades multilingues ni modos especiales (thinking, audio, video).

## Casos de uso

- Prototipado de personajes en ComfyUI: cargar `校长妈妈.safetensors` como nodo LoRA sobre el checkpoint `moss-image` y usar `LS1` en el prompt para generar variaciones del personaje en distintos encuadres y estilos.
- Iteracion de arte conceptual: producir rápidamente docenas de variantes de un personaje para explorar paletas, vestuario o iluminacion antes de encargar arte final, aprovechando el bajo coste de un adaptador de 71 MiB.
- Creacion de material para fan art y comunidades: generar ilustraciones del personaje de Wuthering Waves para publicaciones en redes, con la advertencia de revisar los derechos de la franquicia antes de cualquier uso comercial.
- Pruebas A/B de estilos: combinar el LoRA con otros adaptadores y pesos de LoRA escalados para medir como cambia la fidelidad al personaje frente a la estetica general del checkpoint.
- Canalizacion en pipelines automatizados mediante la API de RunningHub: enviar prompts con `LS1` a traves del endpoint documentado en `https://www.runninghub.ai/call-api` para generar lotes de imagenes sin mantener GPU propia.
- Educacion y demostracion tecnica: usar el repositorio como ejemplo minimalista de publicacion de un LoRA de personaje en Hugging Face, con su fichero safetensors y su palabra de activacion, en talleres sobre fine-tuning de modelos de difusion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un LoRA de generacion de imagen, las metricas habituales de modelos de lenguaje (MMLU, HumanEval, GSM8K) no aplican, y la model card no incluye evaluaciones tipo FID, CLIP score ni comparaciones cualitativas con otros adaptadores.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador por si solo; el consumo vendra determinado por el checkpoint `moss-image` sobre el que se aplique, cuyas dimensiones no se documentan.
- El fichero LoRA ocupa unos 71 MiB, por lo que su carga anade un coste de memoria despreciable frente al modelo base.
- GPU recomendadas: no disponibles. Al no conocerse el modelo base, no es posible determinar si cabe en GPU de consumo (RTX 3060, 4070, 4090) o si requiere A100/H100.
- Opciones de despliegue: ComfyUI (plataforma declarada), entorno alojado de RunningHub y, en su caso, cualquier runtime que soporte el formato safetensors del modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros LoRA de personaje comparables ni datos de rendimiento que permitan una comparacion rigurosa. Como referencia interna del mismo autor, existe `RunningHubAI/rh-qwen2511-lora`, pero pertenece a otra categoria (adaptador sobre un modelo de lenguaje) y no es comparable en tarea ni en metricas.

## Limitaciones y advertencias

- La model card no especifica la licencia. Se remite a "the original project or upstream license", por lo que el uso comercial exige verificar por separado la licencia de `moss-image` y los derechos sobre la franquicia representada.
- El personaje esta asociado a una propiedad intelectual de terceros (Wuthering Waves); la generacion y difusion de imagenes derivadas puede estar sujeta a restricciones legales segun jurisdiccion.
- El repositorio declara 0 descargas y 0 likes, y no incluye evaluaciones cualitativas ni ejemplos de salida, por lo que la calidad real del adaptador no esta verificada.
- El tamano del repositorio (0,7 GB) no coincide con el unico fichero documentado (71 MiB), lo que indica contenido no descrito en la model card; conviene inspeccionar el arbol de ficheros antes de descargar.
- No hay informacion sobre sesgos del modelo base ni sobre el riesgo de reproducir estereotipos en la generacion de personas.
- La palabra de activacion `LS1` es obligatoria; sin ella el adaptador puede no tener efecto perceptible o introducir artefactos.
- No es un modelo de lenguaje: no debe emplearse para generacion de texto, razonamiento, codigo ni tareas de agente, y no dispone de contexto conversacional.
- El nombre del fichero de pesos esta en chino, lo que puede causar problemas de codificacion en algunos pipelines, sistemas de ficheros o herramientas de descarga.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-l-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2115644082902102017
- Pagina del autor: https://www.runninghub.ai/user-center/2107468794670120962
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Llamada a la API: https://www.runninghub.ai/call-api
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- Repositorio relacionado del mismo autor: https://huggingface.co/RunningHubAI/rh-qwen2511-lora
