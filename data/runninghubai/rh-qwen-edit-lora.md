# RunningHubAI/rh-qwen-edit-lora

## Resumen

rh-qwen-edit-lora es un adaptador LoRA (low-rank adaptation) publicado por RunningHubAI, la cuenta de Hugging Face de la plataforma RunningHub, sobre el modelo de edicion de imagen Qwen-Image-Edit-2509. El adaptador esta especializado en una unica tarea: modificar el volumen de la silueta corporal femenina, en concreto aumentar el pecho, sin necesidad de dibujar una mascara de region sobre la imagen de entrada. La instruccion se transmite por texto junto a la imagen original, dentro del pipeline image-text-to-image.

El repositorio, de 0,6 GB, contiene un unico archivo de pesos, `juru-iti-lora-qwen-edit.safetensors`, de 563 MiB. Esta etiquetado para ComfyUI y su autoria original corresponde al usuario @懂AI的木子 en la plataforma china de RunningHub, que actua como publicador. En el momento de la consulta el modelo acumula 0 descargas y 0 likes, y no se ha publicado licencia, idiomas soportados ni ninguna evaluacion cuantitativa.

Su relevancia es limitada y muy de nicho: sirve como ejemplo de LoRA de edicion regional entrenado sobre Qwen-Image-Edit-2509 para un atributo corporal concreto. El propio autor advierte en la model card de que los resultados actuales salen borrosos y probablemente necesiten un paso posterior de ampliacion de alta resolucion, y atribuye el problema a un tratamiento deficiente del conjunto de entrenamiento, con la promesa de una version mejorada si mejora el dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptacion de bajo rango) sobre el modelo base Qwen-Image-Edit-2509; arquitectura interna del base no detallada en la informacion disponible |
| Parametros totales | no disponible (solo se publican pesos LoRA; el archivo `juru-iti-lora-qwen-edit.safetensors` ocupa 563 MiB) |
| Longitud de contexto | no disponible (modelo de difusion para edicion de imagen; no aplica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible; el unico artefacto publicado es un safetensors sin indicacion de precision |
| Idiomas soportados | no disponible |
| Licencia | no disponible; la model card indica que el copyright permanece en el autor y remite a la licencia del proyecto original o del upstream |
| Formato de pesos | safetensors (`juru-iti-lora-qwen-edit.safetensors`, 563 MiB) |
| Tipo de modelo | LoRA de edicion de imagen (image edit) |
| Modelo base | Qwen-Image-Edit-2509 |
| Pipeline declarado | image-text-to-image |
| Plataformas indicadas | ComfyUI, RunningHub, Hugging Face |
| Tamano del repositorio | 0,6 GB |
| Fecha de creacion | 2026-09-23 (segun metadatos de Hugging Face) |
| Ultima actualizacion | 2026-09-23 (segun metadatos de Hugging Face) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un par de matrices de bajo rango que se inyectan en capas lineales del modelo base y se suman a sus pesos durante la inferencia. No se publica el rango, el valor de alpha, las capas objetivo ni la precision de entrenamiento; tampoco se detalla la arquitectura del modelo base Qwen-Image-Edit-2509, salvo que pertenece a la familia Qwen-Image-Edit, descrita por otros autores como un editor de imagen con capacidades de edicion multi-imagen y de mantenimiento de la consistencia y de la identidad de los sujetos. No procede hablar de RLHF ni DPO, ya que se trata de un ajuste supervisado sobre un modelo de difusion.

No hay informacion sobre el numero de pasos de entrenamiento, la resolucion, el numero de imagenes del dataset ni la estrategia de captioning. La unica informacion cualitativa procede del propio autor, que afirma que el LoRA se entreno a partir del modelo qwen-edit-2509, que funciona sin mascara y que el resultado real sale borroso, probablemente porque el conjunto de entrenamiento no se proceso adecuadamente. No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal ni similares).

## Capacidades

- Edicion de imagen condicionada por texto e imagen de entrada (pipeline image-text-to-image).
- Modificacion del volumen del pecho sobre una figura humana sin dibujar mascara de region: la edicion se induce solo con la instruccion textual.
- Integracion prevista en flujos de ComfyUI y ejecucion en la plataforma RunningHub.
- Hereda del modelo base Qwen-Image-Edit-2509 las capacidades generales de edicion de imagen, edicion multi-imagen y conservacion de la consistencia del sujeto, aunque no se aportan mediciones propias.
- No realiza generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Soporte multilingue de los prompts: no disponible.
- No hay capacidades de audio ni modo de pensamiento (thinking mode); la unica modalidad de entrada documentada es imagen mas texto.

## Casos de uso

- Simulacion previa en consulta de cirugia estetica: un profesional podria usar el adaptador para mostrar a un paciente, con su consentimiento explicito y por escrito, una previsualizacion aproximada del resultado de un aumento mamario sobre una fotografia clinica, siempre que se anada el paso de ampliacion de alta resolucion que el propio autor recomienda para compensar la perdida de nitidez.
- Prototipado de flujos de edicion con LoRA en ComfyUI: sirve como caso de prueba para validar la carga de un LoRA de 563 MiB sobre Qwen-Image-Edit-2509, medir el impacto en VRAM y comparar la fidelidad del resultado respecto a ediciones con mascara.
- Pruebas de tallaje y silueta en comercio electronico: generar variantes de una prenda sobre cuerpos con distintos volumenes toracicos para evaluar como cae el patron, teniendo en cuenta que el resultado borroso exige un reescalado posterior antes de publicarlo.
- Produccion creativa y avatares de personaje: ajustar la silueta de un personaje ficticio generado por IA entre iteraciones de una ilustracion o de un storyboard, aprovechando que la edicion no requiere enmascarar la zona.
- Evaluacion de tecnicas de edicion regional en modelos de difusion: investigar hasta que punto un LoRA sin mascara controla la region editada y en que medida se filtran cambios al fondo, la ropa o las extremidades.
- Auditoria de seguridad y moderacion de contenido: emplear el adaptador como muestra representativa de LoRAs de manipulacion corporal para calibrar clasificadores de contenido sintetico y sistemas de deteccion de imagenes alteradas.
- Formacion y documentacion tecnica: usarlo como ejemplo reproducible de como se publica un LoRA en Hugging Face con pesos safetensors, etiquetado para ComfyUI y sin licencia declarada, para discutir buenas practicas de publicacion de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay metricas objetivas (FID, CLIP score, SSIM, evaluaciones humanas ni comparativas cuantitativas) ni evaluaciones de la calidad de la edicion. La unica valoracion de rendimiento es cualitativa y procede del autor, que describe el resultado como borroso y recomienda encadenar una ampliacion de alta resolucion.

## Requisitos de hardware

- La carga del LoRA anade los 563 MiB del safetensors a la memoria del modelo base; en la practica el requisito dominante es el del propio Qwen-Image-Edit-2509, cuyas especificaciones no se detallan en la informacion disponible.
- VRAM estimada para inferencia: no disponible. Depende por completo del modelo base y del nivel de cuantizacion o de offloading que se aplique; el LoRA por si solo ocupa del orden de 0,6 GB adicionales.
- GPU recomendadas: no disponible para este adaptador. Al tratarse de un LoRA sobre un modelo de edicion de imagen de la familia Qwen-Image, el fabricante del flujo de trabajo (ComfyUI) suele recomendar GPU con 16 GB de VRAM o mas; esta cifra es una estimacion orientativa y no un dato confirmado por el autor.
- Compatibilidad con GPU de consumo: no confirmada. Con cuantizaciones agresivas y offloading podria ejecutarse en tarjetas de gama alta para consumidor, pero no hay ninguna validacion publicada.
- Opciones de despliegue: ComfyUI (plataforma indicada por el autor), la propia plataforma RunningHub en la nube y, en principio, cualquier runtime que admita cargar LoRA sobre el modelo base. vLLM no aplica, ya que no es un modelo de lenguaje; llama.cpp y Ollama no aplican; TGI no esta indicado para este caso.
- Latencia y throughput: no disponible. Cabe esperar un coste adicional si se encadena el paso de ampliacion de alta resolucion que el autor recomienda, pero no se publican tiempos de generacion.

## Comparativa con modelos similares

No hay datos de rendimiento comparables. La siguiente tabla recoge unicamente los adaptadores de la misma familia (LoRA sobre Qwen-Image-Edit) localizados en la busqueda, sin que existan cifras publicas que permitan ordenarlos por calidad.

| Modelo | Base | Especialidad | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-qwen-edit-lora | Qwen-Image-Edit-2509 | Aumento de volumen del pecho sin mascara | no disponible (LoRA de 563 MiB) | no disponible | Hugging Face; 0 descargas |
| flymy-ai/qwen-image-edit-inscene-lora | Qwen-Image-Edit | Edicion in-scene | no disponible | no disponible | Hugging Face |
| flymy-ai/qwen-image-edit-2509-inscene-lora | Qwen-Image-Edit-2509 | Edicion in-scene | no disponible | no disponible | Hugging Face |
| qwen edit skin enhancement | Qwen-Image-Edit-2509 | Mejora de piel | no disponible | no disponible | RunningHub |
| qwen edit realistic skin texture lora | Qwen-Image-Edit-2509 | Textura de piel realista | no disponible | no disponible | RunningHub |
| illustration style - Qwen Image Edit v1.0 | Qwen-Image-Edit | Estilo ilustracion | no disponible | no disponible | Civitai |

## Limitaciones y advertencias

- Calidad de salida insuficiente segun el propio autor: los resultados salen borrosos y necesitan un paso adicional de ampliacion de alta resolucion, lo que encarece el flujo y anade latencia.
- Problema de dataset reconocido: el autor atribuye la perdida de nitidez a un tratamiento deficiente del conjunto de entrenamiento, no a la arquitectura.
- Ausencia total de evaluacion: sin benchmarks, sin evaluaciones humanas, sin validacion de la comunidad y con 0 descargas y 0 likes en el momento de la consulta.
- Licencia no declarada: la model card remite a la licencia del proyecto original o del upstream. El uso comercial es incierto y debe verificarse antes de cualquier despliegue en produccion.
- Riesgo de uso indebido: es una herramienta de manipulacion de la imagen corporal que puede emplearse para alterar fotografias de personas reales sin su consentimiento, lo que puede vulnerar el derecho a la propia imagen y la normativa de publicidad.
- Obligaciones regulatorias: en la Union Europea, el articulo 50 del Reglamento de IA exige transparencia y marcado del contenido sintetico o manipulado. Cualquier uso que genere o publique estas imagenes debe cumplir esas obligaciones.
- Clasificacion de contenido: el resultado puede considerarse material para adultos, por lo que plataformas, CDN y proveedores de API pueden aplicar sus propias politicas y bloquear su publicacion.
- Control espacial limitado: al no usar mascara, no existe garantia de que la edicion se confine a la region deseada; pueden aparecer cambios no intencionados en fondo, ropa o extremidades.
- Idiomas de prompt no documentados: se desconoce el comportamiento con instrucciones en castellano, ya que no se declara ningun soporte linguistico.
- Riesgo de olvido catastrofico: al no haber evaluacion, se desconoce si el LoRA degrada otras capacidades del modelo base.
- Sesgos: el modelo esta disenado explicitamente para modificar un atributo corporal conforme a un ideal estetico concreto, lo que puede reforzar estereotipos de belleza. No hay ningun estudio de sesgo publicado.
- Inconsistencia de metadatos: la fecha de creacion registrada (2026-09-23) es posterior a otras referencias temporales de la informacion disponible, lo que sugiere un posible error de sellado de tiempo en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-qwen-edit-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/1980257391277223938
- Pagina del autor en RunningHub: https://www.runninghub.cn/user-center/1903589325844459522
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- LoRA comparable de FlyMy.AI (in-scene, base Qwen-Image-Edit): https://huggingface.co/flymy-ai/qwen-image-edit-inscene-lora
- LoRA comparable de FlyMy.AI (in-scene, base Qwen-Image-Edit-2509): https://huggingface.co/flymy-ai/qwen-image-edit-2509-inscene-lora
- qwen edit skin enhancement en RunningHub: https://www.runninghub.ai/model/public/1988810042877022209
- qwen edit realistic skin texture lora en RunningHub: https://www.runninghub.ai/model/public/1985393434112499714
- illustration style - Qwen Image Edit v1.0 en Civitai: https://civitai.com/models/1974579/illustration-style-qwen-image-edit
