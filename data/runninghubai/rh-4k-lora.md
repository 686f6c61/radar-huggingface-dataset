# RunningHubAI/rh-4k-lora

## Resumen

rh-4k-lora es un adaptador LoRA de edicion de imagen publicado por RunningHubAI en nombre del autor original, identificado en la model card como «Lolo and Tangtang» (cuenta @洛洛AI画萌萌 de RunningHub). No es un modelo de lenguaje: es un peso adicional que se carga sobre un modelo base de la familia Kontext para realizar reiluminacion y emparejamiento automatico de luces y sombras (el fichero se llama `kontext全局打光.safetensors`, es decir, «iluminacion global Kontext»). El repositorio pesa 0,3 GB y el adaptador ocupa 292 MiB.

El modelo resuelve un problema muy concreto en flujos de edicion fotografica y generacion de imagenes: corregir o reescribir la iluminacion de una imagen existente de forma coherente, sin regenerarla por completo, y hacerlo a resoluciones altas. La model card declara soporte de salida 4K con superresolucion de hasta 6K, lo que lo situa en el segmento de posprocesado de alta resolucion mas que en el de generacion rapida de bocetos.

Su relevancia actual es practica: los adaptadores de reiluminacion sobre bases de edicion por instrucciones (pipeline `image-text-to-image`) permiten sustituir trabajo manual de retoque de luz en produccion de e-commerce, inmobiliaria o VFX. La limitacion principal de la informacion disponible es la ausencia casi total de especificaciones: no se publican parametros, dataset de entrenamiento, licencia explicita ni resultados de benchmarks, y el repositorio acumula 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion de edicion de imagen de la familia Kontext; arquitectura exacta del base no disponible |
| Parametros totales | no disponible; el adaptador ocupa 292 MiB en disco (`kontext全局打光.safetensors`) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible; es un modelo de edicion de imagen, no se documenta ventana de contexto textual |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible; no se documenta soporte multilingue del prompt de edicion |
| Licencia | no disponible; la model card indica que el copyright pertenece al autor y que debe seguirse la licencia del proyecto original o del modelo upstream |
| Formato de pesos | safetensors |
| Tipo de modelo | LoRA de edicion de imagen (image edit) |
| Modelo base | F1基础-Kontext (finetuned from), base upstream no identificada con certeza |
| Pipeline | image-text-to-image |
| Resolucion declarada | salida 4K con superresolucion de hasta 6K |
| Plataformas soportadas | ComfyUI, RunningHub, Hugging Face |
| Tamano del repositorio | 0,3 GB |
| Fecha de creacion (segun metadatos) | 2026-09-26 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. Los LoRA insertan matrices de bajo rango en las capas de atencion y proyeccion de un modelo base congelado, de modo que el ajuste es ligero en disco (292 MiB) y se compone con el base en tiempo de inferencia. El nombre del fichero y el campo «Finetuned from: F1基础-Kontext» apuntan a un modelo base de la familia Kontext, propia de la edicion de imagen guiada por instrucciones, donde el pipeline es `image-text-to-image`. No se especifica en la informacion disponible cual es la revision exacta del base ni si el adaptador depende de un checkpoint concreto.

No hay datos publicados sobre el entrenamiento: se desconoce el numero de imagenes o tokens, la composicion del dataset, la resolucion de entrenamiento, el uso de tecnicas de alineacion como RLHF o DPO (no aplicables de forma estandar en difusion, pero podrian aparecer variantes tipo preferencia o destilacion) ni el rango y alpha del LoRA. La unica innovacion tecnica declarada es funcional: emparejamiento automatico de luz y sombra con capacidad de trabajar a 4K y de superresolver hasta 6K. Cualquier detalle adicional sobre atencion, scheduler o decodificacion debe considerarse no disponible.

## Capacidades

- Edicion de imagen guiada por instrucciones de texto sobre una imagen de entrada (pipeline `image-text-to-image`).
- Reiluminacion global: ajuste de direccion, intensidad y coherencia de luces y sombras sobre una escena ya generada o fotografiada.
- Emparejamiento automatico de luz y sombra entre elementos de una composicion, segun la descripcion del autor.
- Salida a resolucion 4K y superresolucion declarada de hasta 6K.
- Integracion como nodo LoRA en ComfyUI, y como modelo alojado en la plataforma RunningHub.
- Carga directa de los pesos en safetensors desde Hugging Face.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision adicional, audio ni modo de pensamiento, ya que no se trata de un modelo de lenguaje.
- No se documenta lista de idiomas soportados para el prompt.

## Casos de uso

- Fotografia de producto en e-commerce: cargar el LoRA en ComfyUI sobre el modelo base Kontext para unificar la iluminacion de un catalogo entero, de forma que las fotos tomadas en sesiones distintas presenten direccion de luz y temperatura coherentes sin reiluminar manualmente cada imagen.
- Integracion en composiciones digitales (matte painting y retoque): cuando se pega un sujeto extraido en un fondo nuevo, el adaptador reajusta la luz del sujeto para que coincida con la del plato de fondo, reduciendo el trabajo de grading posterior.
- Inmobiliaria y arquitectura: corregir imagenes de interiores con ventanas sobreexpuestas o luz plana, generando variantes con luz natural mas atractiva manteniendo la geometria de la estancia, y entregando a 4K para fichas de portal.
- VFX y previsualizacion: generar pases de iluminacion alternativos sobre el mismo frame para que el equipo de direccion de fotografia elija la direccion de luz antes de rodar o de renderizar en 3D.
- Retoque de retrato: homogeneizar la luz en sesiones de estudio o exteriores donde la fuente principal cambio entre tomas, conservando los rasgos de la persona.
- Restauracion y mejora de archivo: aplicar el adaptador junto con la superresolucion declarada de hasta 6K a material fotografico antiguo o de baja resolucion que necesita una iluminacion mas legible.
- Automatizacion por API: usar el endpoint de RunningHub para encadenar la reiluminacion dentro de un pipeline por lotes, por ejemplo en la ingesta de imagenes de un marketplace.
- Generacion de assets para videojuegos o ilustracion: producir variantes de iluminacion de un mismo asset 2D (dia, noche, interior) de forma consistente a partir de una unica imagen base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa 292 MiB, pero la inferencia requiere cargar el modelo base de la familia Kontext, cuyo peso es muy superior y no se especifica en la informacion disponible. Las cifras siguientes son estimaciones condicionadas a que el base sea un modelo de difusion de escala tipo Kontext (del orden de 12B parametros) y no datos publicados por el autor.
- VRAM estimada en precision completa (BF16/FP16) para el conjunto base + LoRA: del orden de 24 GB o mas, en funcion del base real.
- VRAM estimada con pesos cuantizados a FP8 o GGUF Q8: aproximadamente 12-16 GB, suficiente para una RTX 4090 (24 GB), RTX 4080 (16 GB) o A100 40 GB.
- En GPU de consumo con 12 GB (RTX 3060, RTX 4070) es probable que solo quepa con cuantizaciones agresivas y offloading a RAM, a costa de velocidad; no hay datos confirmados.
- Despliegue recomendado: ComfyUI con el nodo de carga de LoRA y el modelo base correspondiente; tambien la plataforma en la nube RunningHub, que es la via oficial indicada en la model card.
- vLLM, TGI o llama.cpp no son aplicables en su configuracion estandar para modelos de lenguaje; llama.cpp solo tendria sentido a traves de soportes experimentales de difusion y no esta documentado para este adaptador.
- Latencia y throughput: no disponibles. Dependen por completo del base, de la resolucion de salida (4K o 6K) y del hardware.

## Comparativa con modelos similares

Los datos de las alternativas proceden de fuentes publicas externas a la informacion proporcionada; los campos no verificados se marcan como no disponibles.

| Modelo | Tipo | Parametros | Resolucion / funcionalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-4k-lora | LoRA de reiluminacion sobre base Kontext | no disponible (adaptador de 292 MiB) | 4K nativo, superresolucion hasta 6K | no disponible | Hugging Face, ComfyUI, RunningHub |
| FLUX.1 Kontext [dev] | Modelo de edicion de imagen por instrucciones | 12B (dato externo) | edicion guiada por texto | FLUX.1 Non-Commercial License (dato externo) | pesos abiertos, no comercial |
| IC-Light | Modelo de reiluminacion dedicado | no disponible | reiluminacion condicionada por mapa de luz o texto | no disponible | codigo y pesos publicos |
| Otros LoRA de reiluminacion para bases Kontext o Flux | adaptadores LoRA | no disponible | variable | variable segun autor | Hugging Face, Civitai |

No se dispone de metricas comparativas (FID, CLIP-I, LPIPS, SSIM de reiluminacion) para ninguno de los modelos de la tabla en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia de licencia explicita: la model card remite a la licencia del proyecto original o del modelo upstream. Esto implica que el uso comercial depende de la licencia del base Kontext, que no se identifica con certeza. Antes de usarlo en produccion hay que verificar la licencia del modelo base y contactar con el autor en caso de duda.
- No se documentan sesgos. Al ser un adaptador de iluminacion no genera contenido nuevo de forma autonoma, pero hereda los sesgos y las restricciones de seguridad del modelo base sobre el que se aplique.
- Riesgo de artefactos: al operar a 4K y con superresolucion declarada de hasta 6K, es esperable la aparicion de halos, inconsistencias de sombra o texturas artificiales en zonas de transicion, especialmente si el base no fue entrenado a esa resolucion. No hay validaciones publicadas.
- Sin benchmarks ni evaluaciones cualitativas publicadas: 0 descargas y 0 likes en el momento de la consulta, lo que significa que no existe retroalimentacion de la comunidad sobre su comportamiento real.
- Dependencia del base: el adaptador solo funciona con el checkpoint para el que fue entrenado (familia Kontext, segun la model card). Aplicarlo sobre otro base producira resultados degradados o directamente incorrectos.
- Idiomas: no se especifica que idiomas acepta el prompt de edicion. Si el base esta optimizado para ingles o chino, los prompts en castellano pueden rendir peor.
- Ficha incompleta para evaluacion: no hay informacion sobre dataset, hiperparametros de entrenamiento, rango del LoRA ni resolucion de entrenamiento, lo que dificulta reproducir o depurar resultados.
- Los metadatos indican una fecha de creacion posterior a la fecha de publicacion de otros modelos del ecosistema; conviene verificar la vigencia del repositorio antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-4k-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/1991774083497013249
- Pagina del autor: https://www.runninghub.cn/user-center/1851166243125411841
- Plataforma RunningHub internacional: https://www.runninghub.ai
- Plataforma RunningHub China: https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Servicio de entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- Llamada a la API de RunningHub: https://www.runninghub.ai/call-api
