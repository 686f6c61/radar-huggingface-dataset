# RunningHubAI/rh-krea2human-body-skin-related-lora

## Resumen

rh-krea2human-body-skin-related-lora es un adaptador LoRA de edicion de imagen publicado por RunningHubAI (cuenta que actua como plataforma de publicacion en nombre de su autor, identificado como @雍和 en RunningHub). El modelo esta afinado a partir de la base krea2 y su proposito declarado es optimizar la representacion de la figura humana y del tono de piel, permitiendo generar imagenes de gran formato de forma directa. Se distribuye como un unico fichero de pesos `rt_krea2.safetensors` de 218 MiB (0,2 GB de repositorio), pensado para cargarse en ComfyUI o en la propia plataforma RunningHub.

Se trata de un LoRA de edicion de imagen (pipeline declarado `image-text-to-image`), no de un modelo de lenguaje: no genera texto ni codigo, sino que modifica el comportamiento del modelo base krea2 al que se aplique. La palabra de activacion indicada por el autor es `WZ`, por lo que su uso requiere incluirla en el prompt para que el adaptador tenga efecto.

La relevancia de esta ficha es limitada y conviene ser explicito: el repositorio no incluye informacion sobre arquitectura del adaptador (rango, alpha, capas objetivo), datos de entrenamiento, licencia concreta ni resultados de evaluacion. El modelo registra 0 descargas y 0 likes en el momento de la consulta y fue publicado el 11 de octubre de 2026. Cualquier evaluacion seria del mismo exige probarlo directamente sobre la base krea2 en ComfyUI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base krea2; arquitectura de la base no disponible |
| Parametros totales | no disponible (el fichero de pesos ocupa 218 MiB; no se especifica el rango ni el numero de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica a un modelo de imagen) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; el peso del fichero sugiere precision de entrenamiento fp16/bf16, no confirmado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible; la model card indica que el copyright permanece en el autor y que debe seguirse la licencia del proyecto original o del upstream |
| Formato de pesos | safetensors (`rt_krea2.safetensors`, 218 MiB) |
| Pipeline declarado | image-text-to-image |
| Palabra de activacion | `WZ` |
| Modelo base | krea2 |
| Plataformas soportadas | ComfyUI, RunningHub, Hugging Face |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica sobre la arquitectura del adaptador. Por el tipo de artefacto y el pipeline declarado, se trata de un LoRA de difusion aplicado sobre el modelo base krea2, lo que implica que el adaptador no es autonomo: necesita cargarse junto a los pesos de krea2 para producir imagenes. El autor no publica el rango del LoRA, el valor de alpha, las capas objetivo ni el metodo de entrenamiento empleado.

Tampoco hay datos sobre el conjunto de entrenamiento: no se indica el numero de imagenes, la resolucion de entrenamiento, la composicion del dataset, el uso de tecnicas como captioning automatico, regularizacion o DreamBooth, ni si hubo etapas de ajuste por preferencias. La unica informacion operativa que aporta la model card es que el modelo fue afinado desde krea2, que la palabra de activacion es `WZ` y que RunningHub ofrece servicios de entrenamiento en su plataforma. Cualquier afirmacion adicional sobre el proceso de entrenamiento seria especulacion.

## Capacidades

- Edicion y generacion de imagen en modo text-to-image e image-to-image, segun el pipeline declarado (`image-text-to-image`).
- Optimizacion de la figura humana: el autor declara que el adaptador mejora la representacion del cuerpo humano.
- Tratamiento del tono y la textura de piel, segun el propio nombre del modelo (`human-body-skin-related`).
- Generacion de imagenes de gran formato de forma directa, segun la descripcion del autor ("capable of optimizing the human figure and directly generating large-scale images").
- Activacion mediante palabra clave: requiere incluir `WZ` en el prompt.
- Integracion con ComfyUI mediante carga de LoRA y ejecucion en la plataforma RunningHub o mediante su API.
- No se declaran capacidades de generacion de texto, razonamiento, codigo, tool calling, agentes ni audio.
- No se declaran capacidades multilingues del prompt.

## Casos de uso

- Retoque de figura humana en flujos de ComfyUI: cargando el LoRA sobre krea2 y usando la palabra `WZ`, se puede reforzar la coherencia anatomica en imagenes generadas o editadas, reduciendo artefactos tipicos en manos, extremidades y proporciones.
- Generacion de imagenes de gran formato para impresion o carteleria: el autor indica que el modelo permite obtener imagenes de gran escala directamente, lo que resulta util cuando se necesita resolucion alta sin recurrir a encadenar varios pasos de upscaling.
- Produccion de material de moda o catalogo: al estar orientado a piel y cuerpo, encaja en flujos donde se requiere consistencia en el tono de piel entre distintas tomas de una misma sesion.
- Ilustracion de personajes para narrativa visual: combinado con prompts de image-to-image, permite mantener un estilo de figura coherente a lo largo de una serie de ilustraciones.
- Prototipado rapido de conceptos artisticos: en RunningHub o ComfyUI permite iterar sobre variaciones de un mismo sujeto sin reentrenar el modelo base.
- Integracion en pipelines automatizados mediante API: RunningHub ofrece API, por lo que el adaptador puede invocarse desde un servicio backend para generar imagenes bajo demanda.
- Ajuste de personajes existentes: partiendo de una imagen de referencia y aplicando el LoRA con `WZ`, se puede modificar la apariencia de cuerpo y piel conservando la composicion original.
- Experimentacion en investigacion de adaptadores de bajo rango: sirve como ejemplo de LoRA especializado en un atributo concreto sobre una base de difusion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas cuantitativas (FID, CLIP score, SSIM ni comparativas perceptuales) en la model card, y no se han encontrado evaluaciones independientes. Tampoco se especifica el hardware utilizado para el entrenamiento ni la resolucion nativa de generacion del modelo base krea2.

| Benchmark | Resultado |
|---|---|
| Metricas de calidad de imagen | no disponible |
| Comparativas con otros LoRA de cuerpo o piel | no disponible |
| Evaluaciones independientes | no disponible |

## Requisitos de hardware

- El adaptador en si ocupa 218 MiB, un tamano que cabe sin problema en cualquier GPU con mas de 1 GB de VRAM libre. El requisito real de VRAM viene determinado por el modelo base krea2, no por el LoRA.
- VRAM estimada para inferencia: no disponible. Depende de la resolucion de generacion, de la precision de los pesos del modelo base y del backend utilizado (ComfyUI, diffusers, etc.).
- GPU recomendadas: no disponible. No se especifica ninguna configuracion probada por el autor.
- Compatibilidad con GPU de consumo: no confirmada. Al tratarse de un LoRA sobre una base de difusion, es habitual que funcione en GPUs de consumo con suficiente VRAM (por ejemplo, gama RTX 30/40), pero no hay datos publicados que lo confirmen para esta base concreta.
- Opciones de despliegue: ComfyUI (soporte nativo de LoRA) y la plataforma RunningHub, que ademas ofrece API. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI, herramientas orientadas a modelos de lenguaje que no aplican a este artefacto.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos suficientes para establecer una comparativa rigurosa. No hay informacion publica sobre el rango del LoRA, su licencia ni sus resultados, y no se han identificado en la informacion proporcionada otros adaptadores comparables entrenados especificamente para cuerpo y piel sobre la base krea2.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-krea2human-body-skin-related-lora | no disponible (218 MiB) | no aplica | no disponible | no disponible | Hugging Face / RunningHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de informacion sobre licencia: la model card remite a la licencia del proyecto original o upstream, sin aclararla. Esto impide determinar si el uso comercial esta permitido. Conviene verificar la licencia de krea2 antes de cualquier uso en produccion.
- No se documentan sesgos del modelo. Al estar especializado en cuerpo humano y piel, existe riesgo de reproducir sesgos de representacion (tonos de piel, tipos corporales, canon estetico) heredados del dataset de la base.
- Riesgo de sobreajuste al atributo entrenado: los LoRA de un unico concepto pueden degradar la diversidad de las salidas o alterar otras partes de la imagen distintas de la figura humana.
- Dependencia obligatoria de la palabra de activacion `WZ`. Sin ella, el adaptador puede no tener efecto o producir resultados inconsistentes.
- Sin datos de evaluacion: no hay metricas que permitan estimar la tasa de fallos en anatomia, manos o coherencia entre imagen de entrada y salida.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin issues ni retroalimentacion de usuarios que permitan conocer problemas reales.
- Metadatos incompletos: no se especifican idiomas, resolucion de entrenamiento, parametros del LoRA ni compatibilidad con versiones concretas de ComfyUI.
- Advertencia sobre la fecha de publicacion: los metadatos indican creacion y actualizacion el 11 de octubre de 2026, dato que conviene contrastar con la pagina original en RunningHub.
- El fichero distribuido es `rt_krea2.safetensors`, mientras que el repositorio se denomina `rh-krea2...`; conviene confirmar que no existen variantes adicionales no listadas.
- Al ser un adaptador, hereda todas las limitaciones del modelo base krea2, cuyas caracteristicas no se detallan en la informacion disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-krea2human-body-skin-related-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2098337137725194241
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/2046119978792656898
- Plataforma RunningHub: https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Pagina de entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- Nota sobre la busqueda web: los resultados recuperados no guardan relacion con el modelo (contenido sobre la plataforma de streaming Crunchyroll) y no se han incorporado por no ser relevantes. No se han encontrado papers, blogs ni demos adicionales sobre este LoRA.
