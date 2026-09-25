# RunningHubAI/rh-pipi-krea2-01-unet

## Resumen

rh-pipi-krea2-01-unet es un modelo de difusion distribuido como UNET independiente y publicado por RunningHubAI en nombre del autor PiPiAi. Se trata de un fine-tuning del modelo base krea2 orientado a tareas de edicion de imagen (pipeline `image-text-to-image`), y se distribuye exclusivamente como pesos sueltos en formato safetensors para cargarse en ComfyUI, en la plataforma RunningHub o directamente desde Hugging Face.

El repositorio no contiene documentacion tecnica sobre la arquitectura interna, el numero de parametros, la resolucion nativa de entrenamiento ni la composicion del dataset. La model card se limita a indicar el tipo de modelo ("UNET (image edit)"), el origen ("Finetuned from: krea2") y una lista de flujos de trabajo publicados en la plataforma del autor, ademas de contenido promocional de la propia plataforma y de herramientas de entrenamiento de terceros.

Su relevancia practica es la de un peso UNET listo para integrarse en grafos de ComfyUI orientados a edicion de imagen: edicion de una sola imagen, cambio de vestuario y flujos de "image washing" (imagen a imagen con recuperacion de prompt). El repositorio, creado el 25 de septiembre de 2026, no registra descargas ni valoraciones en el momento de redactar esta ficha, por lo que no existe validacion independiente de su calidad o comportamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se distribuye como UNET de difusion; el autor no documenta la arquitectura interna) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusion de imagen, no usa ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica un archivo safetensors sin versiones GGUF, fp8 ni INT8 |
| Idiomas soportados | no disponible (el procesamiento del prompt depende del text encoder del pipeline base, no documentado) |
| Licencia | no disponible; la model card indica que el copyright permanece en el autor y remite a la licencia del proyecto original (krea2) |
| Formato de pesos | safetensors (`pipi-krea01.safetensors`, 12.533 MiB) |
| Tamano del repositorio | 13,1 GB |
| Pipeline declarado | image-text-to-image |
| Modelo base | krea2 (fine-tuning) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-25 |

## Arquitectura y entrenamiento

La unica informacion oficial es que se trata de un UNET para edicion de imagen obtenido por fine-tuning a partir de krea2. En la practica, un UNET de este tipo actua como el denoiser de un modelo de difusion latente: recibe un latente ruidoso, el paso de tiempo y las condiciones (texto e imagen de entrada) y predice el ruido o la muestra limpia. Al publicarse unicamente los pesos del UNET, el modelo necesita emparejarse con el text encoder y el VAE del pipeline base para funcionar; el autor no especifica cuales ni en que version.

No hay datos publicos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF, DPO u otras tecnicas de alineamiento, ni sobre innovaciones tecnicas como atencion lineal o decodificacion especulativa. La model card menciona que el modelo se etiqueto y entreno con herramientas de terceros ("超级智能打标器" y "超级训练器", distribuidas en zhaotutu.xyz) y ofrece enlaces al entrenamiento en la plataforma RunningHub, pero sin detallar hiperparametros, resolucion, numero de pasos ni estrategia de regularizacion. El tamano del archivo de pesos (12.533 MiB) es coherente con un denoiser de varios miles de millones de parametros almacenado en precision de 16 bits, pero se trata de una estimacion no confirmada por el autor y no debe tomarse como especificacion.

## Capacidades

- Edicion de imagen condicionada por texto e imagen (pipeline `image-text-to-image`): el flujo declarado permite partir de una imagen y aplicar instrucciones en lenguaje natural.
- Edicion de imagen unica ("single-image editing"), segun el flujo de trabajo publicado por el autor en la plataforma china e internacional.
- Cambio de vestuario o edicion de indumentaria ("costume editing" / "换装"), con un flujo dedicado.
- Flujos de "image washing": imagen a imagen combinado con recuperacion inversa del prompt (image-to-prompt), tanto en version con recuperacion previa como sin ella.
- Integracion con ComfyUI: el tag `comfyui` y el tipo de archivo indican carga mediante nodos de UNET loader dentro de un grafo.
- Generacion de imagen a partir de texto: el autor enlaza un flujo de text-to-image de Krea2, aunque este repositorio en concreto se presenta como UNET de edicion.
- Tool calling / function calling: no disponible, no es una capacidad de este tipo de modelo.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no documentadas; dependen del text encoder del pipeline base.
- Capacidades especiales (modo thinking, audio, video): no disponibles.

## Casos de uso

- Edicion de producto para e-commerce: dado un catalogo de fotos de producto, aplicar cambios de fondo, iluminacion o color manteniendo el objeto; el modelo esta disenado especificamente para edicion a partir de una imagen de entrada.
- Prueba virtual de vestuario: los flujos de "costume editing" publicados por el autor permiten sustituir prendas sobre una imagen de referencia, un caso tipico en retail y moda.
- Restauracion y "limpieza" de imagenes generadas: el flujo de "image washing" con recuperacion de prompt sirve para reconstruir o reformular una imagen ya generada, util en equipos que reciclan material visual.
- Prototipado rapido en ComfyUI: al ser un UNET cargable por nodo, se puede insertar en grafos existentes para comparar variantes de edicion sin reentrenar el pipeline completo.
- Iteracion de direccion de arte: generar variantes de una misma imagen base con instrucciones de texto sucesivas, aprovechando el pipeline image-text-to-image para exploraciones controladas.
- Servicio gestionado sobre RunningHub: para equipos sin GPU propia, el autor ofrece ejecucion en su plataforma mediante API, lo que permite exponer la edicion de imagen como endpoint.
- Automatizacion de tareas de edicion por lotes: integrado en un grafo de ComfyUI, el UNET puede procesar colas de imagenes con el mismo prompt o con prompts por fichero, siempre que el resto del pipeline (text encoder y VAE) este correctamente emparejado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, ImageReward ni comparativas con otros modelos), y el repositorio no registra descargas ni evaluaciones de la comunidad que permitan inferir su rendimiento. Tampoco se documentan resoluciones de entrenamiento o inferencia, numero de pasos recomendado, escala de guiado (CFG) ni sampler sugerido, por lo que cualquier comparacion cuantitativa seria especulativa.

## Requisitos de hardware

- VRAM para inferencia en precision completa: el archivo del UNET ocupa 12.533 MiB, por lo que se necesitan al menos unos 13 GB solo para sus pesos, mas el text encoder y el VAE del pipeline base (habitualmente varios GB adicionales). Una estimacion prudente es de 16 a 24 GB de VRAM en total, aunque el autor no publica cifras.
- GPU profesionales recomendadas: A100 (40 o 80 GB), H100, L40S o similares, especialmente para lotes grandes o resoluciones altas.
- GPU de consumo: cabe razonablemente en RTX 4090 y RTX 3090 (24 GB) en precision de 16 bits; en tarjetas de 16 GB o menos requeriria cuantizacion o descarga de pesos a CPU, no publicada por el autor.
- Cuantizacion: no hay versiones GGUF, fp8 o INT8 en el repositorio. Si se generan localmente con herramientas de la comunidad, el archivo quedaria en torno a 6-7 GB, pero se trata de una estimacion derivada, no de un dato oficial.
- Opciones de despliegue: ComfyUI como destino principal declarado; plataforma en la nube RunningHub (web y API); descarga directa desde Hugging Face. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos verificables para una comparativa cuantitativa. La informacion proporcionada solo identifica el modelo base (krea2); no incluye parametros, contexto, rendimiento ni licencia de este, y las busquedas web realizadas no han devuelto documentacion tecnica relacionada con Krea2 ni con este UNET.

| Modelo | Parametros | Contexto / resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-pipi-krea2-01-unet | no disponible | no disponible | no disponible | no disponible (remite a la del proyecto original) | Hugging Face, ComfyUI, RunningHub |
| krea2 (modelo base) | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |
| Alternativas de edicion de imagen | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia indeterminada: la model card no fija una licencia concreta y remite a la del proyecto original (krea2). Sin ese dato, el uso comercial es juridicamente arriesgado y debe verificarse con el autor antes de desplegar en produccion.
- Ausencia total de documentacion tecnica: no se publican parametros, resolucion nativa, dataset, hiperparametros ni pasos de inferencia recomendados, lo que dificulta reproducir resultados o estimar costes.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta; no hay reportes independientes de calidad, fallos o sesgos.
- Dependencia del pipeline base: al distribuirse solo el UNET, el comportamiento final depende del text encoder, el VAE y la configuracion del sampler. Un emparejamiento incorrecto produce resultados degradados.
- Riesgo de alucinacion visual y artefactos: como cualquier modelo de difusion, puede introducir elementos no solicitados, deformar rostros, manos o texto, y alterar la identidad de la persona retratada en tareas de edicion.
- Sesgos desconocidos: no se documenta la composicion del dataset de entrenamiento, por lo que no se puede evaluar el sesgo demografico, cultural o de representacion.
- Idiomas no documentados: no hay garantia de que las instrucciones en castellano se procesen correctamente; depende del text encoder del pipeline base.
- Sin filtros de seguridad declarados: no se menciona moderacion de contenido ni restricciones de uso, lo que obliga a implementar controles propios en cualquier servicio publico.
- Contenido promocional y enlaces de afiliacion en la model card: conviene tratarla con cautela como fuente tecnica, ya que la mayor parte del texto es material de marketing de la plataforma.
- Fecha de publicacion en 2026 y actualizacion inmediata (mismo dia): el modelo puede seguir en evolucion o haber sido sustituido por versiones posteriores.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-pipi-krea2-01-unet
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2072255726952738817
- Pagina del autor: https://www.runninghub.ai/user-center/1954484547733893121
- RunningHub internacional: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (en): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (cn): https://www.runninghub.cn/runninghub-api-doc-cn/
- Flujo de generacion texto a imagen de Krea2: https://www.runninghub.ai/zh-cn/post/2070539933625962498
- Flujo de imagen a imagen con recuperacion de prompt: https://www.runninghub.ai/zh-cn/post/2071363127198965761
- Flujo de edicion de vestuario: https://www.runninghub.ai/zh-cn/post/2081411227835133953
- Flujo de edicion de imagen unica: https://www.runninghub.ai/zh-cn/post/2081715171189600258
- Flujo de edicion de imagen: https://www.runninghub.ai/zh-cn/post/2082033725404573697
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- Herramientas de etiquetado y entrenamiento citadas por el autor: zhaotutu.xyz
- Paper: no disponible
- Demo adicional: no disponible
