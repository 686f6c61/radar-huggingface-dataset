# RunningHubAI/rh-qwen-edit2511-lora

## Resumen

rh-qwen-edit2511-lora es un adaptador LoRA de edicion de imagen publicado por RunningHubAI en Hugging Face, orientado especificamente a la restauracion de fotografias antiguas. No se trata de un modelo completo, sino de un fichero de pesos de 225 MiB (repositorio de 0,2 GB) que se monta sobre el modelo base Qwen-Edit-2511, segun indica la propia model card ("Finetuned from: Qwen-Edit-2511"). Su pipeline declarado en Hugging Face es image-text-to-image y esta pensado para ejecutarse en ComfyUI, en la plataforma en la nube de RunningHub o mediante la API de este proveedor.

El objetivo declarado por el autor es la restauracion de fotografia antigua con un resultado "realista y natural", con enfasis explicito en la reduccion del aspecto artificial ("AI油腻感", es decir, la sensacion de imagen generada) y en el aumento de detalle. Para activarlo se utiliza la palabra clave o trigger word `zslzp`, que debe incluirse en el prompt para que el adaptador aplique el estilo aprendido. La model card menciona compatibilidad con los flujos de trabajo de las versiones 2509 y 2511 del modelo base.

La relevancia de esta publicacion es limitada pero concreta: aporta un ajuste fino ligero (un solo safetensors de 225 MiB) para un caso de uso muy delimitado, la restauracion de fotos antiguas, que se puede integrar en un pipeline existente de Qwen-Edit sin necesidad de reentrenar ni de descargar un modelo completo. Como contrapartida, la ficha no documenta licencia, idiomas, composicion del dataset de entrenamiento ni resultados de evaluacion, y el repositorio no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base Qwen-Edit-2511; arquitectura del modelo base no disponible |
| Parametros totales | no disponible (no aplica: es un adaptador, no un modelo completo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el unico peso publicado es un fichero safetensors de 225 MiB |
| Idiomas soportados | no disponible |
| Licencia | no disponible; la model card indica que los derechos pertenecen al autor y que se debe seguir la licencia del proyecto original o del upstream |
| Formato de pesos | safetensors (LoRA) |
| Tipo de modelo | LoRA de edicion de imagen (image edit) |
| Modelo base | Qwen-Edit-2511 |
| Fichero publicado | `zslzp真实质感老照片修复Edit-2511-Realistic-old-photo-restoration_20.safetensors` (225 MiB) |
| Palabra clave de activacion | `zslzp` |
| Tamano del repositorio | 0,2 GB |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face |
| Pipeline declarado | image-text-to-image |
| Fecha de creacion | 2026-09-23 |
| Fecha de actualizacion | 2026-09-23 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del adaptador ni del modelo base. Lo unico confirmado es que se trata de un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base Qwen-Edit-2511 para modificar su comportamiento sin reentrenar los pesos completos. El repositorio contiene un unico fichero safetensors de 225 MiB, un tamano coherente con un adaptador de bajo rango y no con un modelo completo.

Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, el uso de tecnicas de alineacion como RLHF o DPO, ni el rango y los modulos objetivo del LoRA. La model card se limita a afirmar que es un LoRA "entrenado por el propio autor" y a recomendar su combinacion con dos flujos de trabajo publicados en RunningHub (uno correspondiente a la version 2509 y otro a la 2511 del modelo base). El nombre del fichero incluye el sufijo `_20`, que podria corresponder a un identificador de version o de paso de entrenamiento, pero no se explica en la documentacion.

## Capacidades

- Edicion de imagen guiada por texto sobre el modelo base Qwen-Edit-2511, con el pipeline image-text-to-image como modo declarado.
- Restauracion de fotografias antiguas: recuperacion de detalle y textura en imagenes degradadas, con enfasis declarado en un resultado realista y natural.
- Reduccion del aspecto artificial de las imagenes restauradas, segun la descripcion del autor ("reducir la sensacion de AI").
- Activacion mediante palabra clave: el adaptador se dispara incluyendo `zslzp` en el prompt.
- Integracion en flujos de trabajo de ComfyUI, incluidos los publicados por el autor para las variantes 2509 y 2511 del modelo base.
- Ejecucion en la nube a traves de RunningHub y de su API, ademas de la carga local desde Hugging Face.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision adicional, audio, modo thinking ni capacidades multilingues mas alla de lo que herede el modelo base.

## Casos de uso

- Restauracion de fotografias familiares: un estudio o un particular puede tomar una foto antigua escaneada, introducirla en un flujo de Qwen-Edit-2511 con el LoRA activado mediante `zslzp` y obtener una version con mayor detalle y textura, sin recurrir a un modelo de restauracion dedicado.
- Digitalizacion de fondos patrimoniales: archivos, bibliotecas y museos que digitalizan placas de vidrio, copias a la albumina o negativos deteriorados pueden usar el adaptador como paso previo de mejora antes del catalogado, manteniendo el proceso dentro de un pipeline de ComfyUI reproducible.
- Servicio de restauracion por encargo: un negocio de recuperacion fotografica puede empaquetar el flujo en ComfyUI y ofrecer restauracion automatizada con revision humana posterior, apoyandose en el reducido tamano del adaptador (225 MiB) para desplegarlo junto al modelo base en una sola maquina.
- Procesado por lotes en estudio: al ser un LoRA ligero sobre un modelo ya cargado en memoria, se pueden encadenar cientos de imagenes en el mismo proceso sin recargar pesos adicionales por cada foto, cambiando unicamente el prompt y la palabra clave.
- Integracion en un SaaS mediante API: RunningHub expone una API y una plataforma en la nube, de modo que un producto web de restauracion fotografica puede delegar la inferencia sin mantener GPUs propias, enviando la imagen y recibiendo el resultado.
- Preprocesado dentro de una cadena de mejora: el resultado restaurado puede pasar despues por etapas de escalado, correccion de color o coloreado en el mismo grafo de ComfyUI, ya que el adaptador se integra como un nodo adicional y no como un sistema cerrado.
- Reproduccion de un estilo fotografico concreto: mas alla de la restauracion, el LoRA puede emplearse para trasladar imagenes nuevas hacia la estetica de la fotografia analogica antigua definida por `zslzp`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (PSNR, SSIM, LPIPS, FID, evaluaciones humanas cuantificadas ni comparaciones con otros modelos de restauracion), y el repositorio no registra descargas ni valoraciones que permitan inferir validacion por parte de la comunidad.

## Requisitos de hardware

- El adaptador en si ocupa 225 MiB en disco, pero la VRAM de inferencia viene determinada por el modelo base Qwen-Edit-2511, no por el LoRA. No se dispone de cifras oficiales de VRAM ni de requisitos minimos en la informacion proporcionada.
- GPU recomendadas: no disponible. Al depender del modelo base completo, el requisito efectivo es el que exija Qwen-Edit-2511 en la precision y cuantizacion elegidas.
- Compatibilidad con GPU de consumo: no disponible. No hay datos publicados que permitan confirmar si cabe en tarjetas como la RTX 4090 o inferiores.
- Opciones de despliegue documentadas: ComfyUI (local), la plataforma en la nube de RunningHub y su API. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no son aplicables a un adaptador de edicion de imagen sobre un modelo de difusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion verificable sobre modelos comparables en la documentacion facilitada, por lo que no es posible construir una comparativa con datos. Como referencia cualitativa, el unico punto de comparacion claro es el propio modelo base Qwen-Edit-2511 sin el adaptador: la diferencia es que este LoRA anade un sesgo hacia la restauracion de fotografia antigua activado por la palabra clave `zslzp`, mientras que el modelo base conserva su comportamiento generalista de edicion de imagen.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-qwen-edit2511-lora | LoRA sobre Qwen-Edit-2511 | no disponible (adaptador de 225 MiB) | no disponible | no disponible | Hugging Face, ComfyUI, RunningHub |
| Qwen-Edit-2511 (modelo base) | Modelo de edicion de imagen | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | Referenciado como upstream por la model card |
| Otros LoRA de restauracion de imagen | LoRA | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: la model card no especifica una licencia concreta y remite a la del proyecto original. Esto impide confirmar si el uso comercial esta permitido, lo que supone un riesgo legal directo para cualquier producto que lo integre.
- Dependencia del modelo base: el adaptador no es autonomo. Requiere descargar y ejecutar Qwen-Edit-2511, cuyas condiciones de uso, requisitos de hardware y licencia son independientes de este repositorio.
- Riesgo de alucinacion visual: en restauracion de imagenes, los modelos generativos pueden inventar detalle que no existia, especialmente en rostros, texto y objetos pequenos. En contextos forenses, historicos o documentales esto puede comprometer la fidelidad del original, por lo que se recomienda conservar siempre la imagen fuente y tratar la salida como una interpretacion.
- Sesgos desconocidos: al no documentarse el dataset de entrenamiento ni su composicion, no es posible evaluar sesgos de origen, etnicos, de epoca o de tipo de fotografia. Es probable que el adaptador funcione mejor con el tipo de imagen antigua predominante en sus datos de entrenamiento.
- Palabra clave obligatoria: el estilo solo se aplica si se incluye `zslzp` en el prompt. Su omision puede hacer que el modelo base opere sin el ajuste, lo que dificulta la reproducibilidad si no se documenta en el pipeline.
- Idiomas no declarados: no se especifica para que idiomas estan optimizados los prompts. La model card esta redactada principalmente en chino, lo que sugiere que los prompts en ese idioma pueden comportarse mejor que en castellano.
- Ausencia de validacion comunitaria: cero descargas y cero valoraciones en el momento de la consulta, ademas de una unica version publicada. No hay evidencia externa de calidad ni de estabilidad.
- Documentacion incompleta: no se publican parametros, rango del LoRA, modulos objetivo, datos de entrenamiento, limitaciones oficiales ni ejemplos de entrada y salida comparables.
- Contenido promocional en la model card: buena parte del texto es material de promocion de la plataforma RunningHub e incluye datos de contacto comerciales, no informacion tecnica verificable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-qwen-edit2511-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2011999986455678978
- Pagina del autor en RunningHub: https://www.runninghub.cn/user-center/1866115875207323650
- Plataforma RunningHub (internacional): https://www.runninghub.ai
- Plataforma RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Flujo de trabajo recomendado (2509): https://www.runninghub.cn/post/2005849021950423042
- Flujo de trabajo recomendado (2511): https://www.runninghub.cn/post/2005878268911906818
