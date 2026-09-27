# RunningHubAI/rh-wuji-qwen2511-aio-nsfw-2603-checkpoint

## Resumen

rh-wuji-qwen2511-aio-nsfw-2603-checkpoint es un checkpoint de edicion de imagen guiada por texto (pipeline `image-text-to-image`) publicado por RunningHubAI en nombre del autor identificado en RunningHub como @迎风. Se distribuye como un unico archivo safetensors de 27.115 MiB (unos 26,5 GiB) y esta pensado para cargarse en ComfyUI, en la plataforma RunningHub o directamente desde Hugging Face. Deriva por ajuste fino de Qwen-Edit-2511 y toma como base Qwen-Rapid-AIO-NSFW-v23, sobre la que el autor declara haber reforzado la consistencia, el contexto y la generacion desde multiples angulos.

Funcionalmente es un modelo de difusion para edicion de imagen: recibe una o varias imagenes de entrada junto con una instruccion en lenguaje natural y devuelve una version editada. La etiqueta `not-for-all-audiences` y el propio nombre indican que esta orientado a contenido NSFW, lo que limita sus usos legitimos y aumenta el riesgo de bloqueo por moderacion en plataformas alojadas; el autor recomienda incluir "NSFW" en el prompt negativo para reducir esos fallos.

Su interes actual es doble: ilustra el ecosistema de checkpoints "todo en uno" que la comunidad publica para ComfyUI sobre modelos de edicion tipo Qwen-Image-Edit, y a la vez sirve de ejemplo de los limites de trazabilidad de este tipo de publicaciones, ya que no se declaran parametros, datos de entrenamiento, licencia ni resultados de benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para edicion de imagen guiada por texto (`image-text-to-image`), derivado por ajuste fino de Qwen-Edit-2511; no se detalla la arquitectura interna (tipo de transformer, encoder de texto, VAE) en la informacion proporcionada |
| Parametros totales | No disponible. El unico archivo de pesos ocupa 27.115 MiB (~26,5 GiB); a precision bf16/fp16 esto equivaldria de forma orientativa a unos 13.000 millones de parametros, calculo no confirmado por el autor |
| Parametros activos | No aplica / no disponible (no se declara que sea un modelo de mezcla de expertos) |
| Longitud de contexto | No aplica en el sentido de contexto de texto. No se documentan resolucion nativa de salida, numero maximo de imagenes de referencia ni longitud maxima de prompt |
| Tipos de cuantizacion | No disponible. Se distribuye un unico checkpoint `.safetensors`; no se documentan variantes GGUF, fp8, int8 ni otras |
| Idiomas soportados | No disponible. La model card esta redactada en chino e ingles, lo que sugiere prompts en esos idiomas, sin confirmacion del autor |
| Licencia | No disponible. La model card indica que los derechos siguen siendo del autor y que debe seguirse la licencia del proyecto original o del modelo upstream (Qwen-Edit-2511), sin especificar cual es |
| Formato de pesos | safetensors (checkpoint para ComfyUI), archivo `WuJi_Qwen2511-AIONSFW聚合版_2603.safetensors` |

## Arquitectura y entrenamiento

No se aporta informacion tecnica sobre la arquitectura interna: la model card no indica si se trata de un transformer de difusion (DiT/MMDiT), que encoder de texto utiliza, ni como se gestiona la condicion de imagen. Lo unico documentado es la genealogia del modelo: ajuste fino de Qwen-Edit-2511 partiendo de Qwen-Rapid-AIO-NSFW-v23, con mejoras declaradas en consistencia, contexto y generacion multiangulo. El sufijo "聚合版" (version agregada) sugiere un merge de pesos o un ensamblado de varios componentes en un unico checkpoint, pero el autor no detalla la composicion.

Tampoco se publican datos de entrenamiento: no hay numero de imagenes o tokens, composicion del dataset, resolucion de entrenamiento, uso de tecnicas de alineacion (RLHF, DPO, preferencias) ni hiperparametros. No se documentan innovaciones tecnicas propias mas alla del ajuste fino sobre las bases citadas.

## Capacidades

- Edicion de imagen condicionada por texto: modificar una imagen de entrada (fondo, vestuario, iluminacion, objetos, estilo) a partir de una instruccion escrita.
- Edicion con imagen de referencia: el pipeline `image-text-to-image` implica entrada de imagen ademas de texto.
- Consistencia de sujeto: el autor declara refuerzo especifico de la consistencia entre generaciones, un requisito habitual en series de imagenes con el mismo personaje.
- Generacion multiangulo: el autor declara refuerzo de la capacidad de producir vistas del mismo sujeto desde angulos distintos.
- Checkpoint agregado ("todo en uno"): el nombre indica integracion de varios componentes en un unico archivo, aunque no se especifica cuales ni para que estilos.
- Contenido NSFW: capacidades orientadas a contenido para adultos, con caracteristicas explicitas de vestuario y desnudez.
- Integracion en ComfyUI mediante nodos de checkpoint y en la plataforma RunningHub (nube) y su API.
- No hay evidencia de soporte de tool calling, function calling ni razonamiento multi-paso: son capacidades de modelos de lenguaje y no aplican a este checkpoint de imagen.

## Casos de uso

- Edicion fotografica por prompt en ComfyUI: sustituir fondos, cambiar el vestuario de un sujeto o corregir la iluminacion sin mascaras manuales, aprovechando el flujo estandar de nodos de checkpoints de edicion. Es adecuado para estudios que ya trabajan con pipelines ComfyUI y quieren evitar herramientas de retoque tradicional.
- Consistencia de personaje en series largas: generar variaciones del mismo personaje manteniendo rasgos faciales y de vestuario a lo largo de decenas de imagenes para comics, storyboards o previsualizacion de proyectos audiovisuales, gracias al refuerzo de consistencia declarado por el autor.
- Previsualizacion multiangulo de personajes: producir vistas del mismo sujeto desde angulos distintos para validar un diseno antes de modelarlo en 3D o producirlo fisicamente.
- Creacion de datasets sinteticos: usar una imagen de referencia junto con prompts para generar variantes etiquetadas que amplien un dataset de vision por computador, siempre que la licencia del modelo y de las imagenes de origen lo permitan.
- Prototipado de conceptos creativos: generar moodboards y variantes de concepto para direccion de arte, publicidad o ilustracion, iterando sobre la misma imagen base en lugar de partir de cero en cada generacion.
- Automatizacion por lotes mediante API: encadenar la edicion de cientos de imagenes en un flujo headless usando la API de RunningHub, con la logica de encolado y post-procesado implementada fuera del modelo.
- Auditoria de sistemas de moderacion: emplear el checkpoint en un entorno controlado y aislado para comprobar si los filtros propios de una plataforma detectan contenido no apto antes de desplegar cualquier flujo con modelos de edicion.
- Advertencia comun a todos los casos: dado el sesgo NSFW del checkpoint, cualquier despliegue en un servicio publico debe incorporar filtrado de entrada y salida, verificacion de edad y cumplimiento de las condiciones de uso de la plataforma de alojamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, GenEval, comparativas humanas) ni comparaciones con otros checkpoints de edicion. El repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Requisitos de hardware

- Tamano del checkpoint: 27.115 MiB (~26,5 GiB) en un unico archivo safetensors; el repositorio completo ocupa 28,4 GB.
- VRAM estimada: no publicada. Como referencia aritmetica, solo los pesos superan los 26 GB, de modo que no caben integros en GPUs de 8, 12, 16 o 24 GB de VRAM sin tecnicas de offloading o cuantizacion aplicada en tiempo de carga.
- GPUs recomendadas: por tamano, tarjetas de 32 GB o mas (RTX 5090 de 32 GB, RTX 6000 Ada o A6000 de 48 GB, A100 de 40/80 GB, H100 de 80 GB). Estimacion orientativa, no confirmada por el autor.
- Viabilidad en GPU de consumo: no cabe integra en ninguna GPU de consumo actual; requeriria descarga por bloques a RAM del sistema o cuantizacion, con la penalizacion de velocidad correspondiente.
- Memoria del sistema y almacenamiento: si se recurre a offloading, conviene disponer de 32-64 GB de RAM y de al menos 30 GB libres en disco para el checkpoint y los ficheros temporales.
- Opciones de despliegue: ComfyUI (formato nativo de checkpoint), plataforma en la nube RunningHub y su API. No se documenta soporte en vLLM, TGI, llama.cpp u Ollama, que ademas no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles. Dependen en gran medida de si el modelo se ejecuta integro en VRAM o con offloading.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-wuji-qwen2511-aio-nsfw-2603-checkpoint | No disponible (~26,5 GiB de pesos) | No disponible | No disponible (0 descargas, 0 likes) | No disponible; se remite a la del proyecto original | Hugging Face + RunningHub + ComfyUI |
| Qwen-Edit-2511 (modelo upstream del ajuste) | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |
| Qwen-Rapid-AIO-NSFW-v23 (base declarada de este ajuste) | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |

Existen otras alternativas de la misma categoria funcional (edicion de imagen guiada por texto, por ejemplo los modelos Flux.1 Kontext o las distintas versiones de Qwen-Image-Edit), pero no se dispone de datos de parametros, contexto, rendimiento ni licencia de ninguna de ellas en la informacion proporcionada, por lo que no se incluye una comparacion cifrada.

## Limitaciones y advertencias

- Contenido NSFW declarado: el checkpoint esta orientado a contenido para adultos, con vestuario revelador, y el propio autor advierte de fallos frecuentes por moderacion. No es apto para entornos corporativos, educativos o dirigidos a menores sin filtrado estricto.
- Riesgo legal elevado: la generacion de contenido sexual sintetico exige verificar la edad y el consentimiento de cualquier persona representada y cumplir la legislacion de la jurisdiccion de despliegue. Cualquier uso con menores es delito en la mayoria de jurisdicciones.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido, ni las obligaciones de atribucion. La model card traslada la responsabilidad al usuario ("si hay infraccion, no es responsabilidad del autor"), lo que es una clausula de exencion, no una autorizacion.
- Ausencia de datos de entrenamiento: sin informacion sobre el dataset, no es posible evaluar sesgos de representacion (etnia, corporalidad, genero) ni el riesgo de reproducir material con derechos de autor.
- Sin benchmarks ni validacion de la comunidad: 0 descargas y 0 likes; no hay evidencia externa de calidad, estabilidad ni reproducibilidad.
- Riesgo de artefactos propios de la edicion por difusion: alteracion de elementos no solicitados, deformacion de manos o rostros y renderizado deficiente de texto. No hay datos publicados especificos para este checkpoint.
- Limitaciones de idioma: se desconoce si el encoder de texto maneja con soltura prompts en castellano, dado que la documentacion solo aparece en chino e ingles.
- Trazabilidad limitada del nombre y las fechas: el identificador incluye "2603" y el repositorio figura como creado y actualizado el 27 de septiembre de 2026, sin que se documente la relacion entre ambas referencias.
- Naturaleza de checkpoint agregado: al tratarse de un merge, actualizar a otra version puede cambiar de forma sustancial el comportamiento con los mismos prompts, lo que dificulta la reproducibilidad en produccion.
- Dependencia de terceros: el uso en la nube queda sujeto a las politicas de contenido, cuotas y disponibilidad de la plataforma RunningHub.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-wuji-qwen2511-aio-nsfw-2603-checkpoint
- README en chino: https://huggingface.co/RunningHubAI/rh-wuji-qwen2511-aio-nsfw-2603-checkpoint/blob/main/README_cn.md
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2033167290195255298
- Pagina del autor en RunningHub: https://www.runninghub.cn/user-center/1934265933848289281
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio de China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Ejemplo de endpoint de API citado en la model card (Seedance): https://www.runninghub.ai/call-api/api-detail/2133100000000700025
