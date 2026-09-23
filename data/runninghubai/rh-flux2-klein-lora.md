# RunningHubAI/rh-flux2-klein-lora

## Resumen

rh-flux2-klein-lora es un adaptador LoRA de generacion de imagen a partir de texto (text-to-image) publicado por RunningHubAI sobre Hugging Face. No es un modelo completo: se trata de un ajuste fino derivado de Flux2-Klein-9B, orientado a una tarea vertical muy concreta, el retoque de fotografia de producto de joyeria. El repositorio contiene un unico fichero de pesos, `flux2首饰精修.safetensors`, de 158 MiB, lo que confirma que se trata de un adaptador y no de un modelo base.

La utilidad del adaptador reside en su especializacion: con una unica palabra de activacion en chino, el modelo debe conservar la textura metalica y el brillo superficial de la pieza, eliminar rayones, abolladuras, manchas u oxidacion, sustituir el fondo por blanco puro y simular iluminacion de softbox de estudio profesional. Es, por tanto, una herramienta de posproduccion automatizada para catalogos de joyeria, no un modelo de proposito general.

Su relevancia es practica y de nicho: permite estandarizar el acabado de imagenes de producto en plataformas que exigen fondo blanco puro, integrarse en flujos de ComfyUI o en la API de RunningHub, y reducir el coste de sesiones fotograficas de estudio. La model card no documenta datos de entrenamiento, rango del adaptador, licencia explicita ni resultados de evaluacion, por lo que la mayoria de las especificaciones tecnicas quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un transformer de difusion; modelo base indicado: Flux2-Klein-9B. El detalle interno de bloques no esta disponible |
| Parametros totales | no disponible (el unico fichero publicado pesa 158 MiB y corresponde al adaptador, no al modelo base) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagen); no disponible |
| Tipos de cuantizacion | no disponible; se publica en safetensors sin cuantizar y la cuantizacion depende del modelo base y del runtime |
| Idiomas soportados | no disponible; la unica palabra de activacion documentada esta en chino |
| Licencia | no disponible; la model card remite a la licencia del proyecto original y mantiene el copyright del autor |
| Formato de pesos | safetensors (`flux2首饰精修.safetensors`, 158 MiB) |
| Modelo base | Flux2-Klein-9B |
| Tamano del repositorio | 0,2 GB |
| Plataformas indicadas | ComfyUI, RunningHub, Hugging Face |
| Fecha de publicacion | 23 de septiembre de 2026 (creacion y ultima actualizacion el mismo dia) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de bajo rango aplicado sobre Flux2-Klein-9B, un transformer de difusion de generacion de imagen. La model card no especifica rango, alpha, resolucion de entrenamiento, numero de pasos, tasa de aprendizaje ni composicion del dataset; tampoco indica si se uso regularizacion o imagenes de control. El unico dato objetivo de entrenamiento es que fue realizado en la plataforma RunningHub, que ofrece servicios de entrenamiento de modelos.

La especializacion es de tarea unica y se activa mediante una instruccion fija en chino: «精修这款产品，保持其金属质感与表面光泽，清理表面划痕、凹痕、污渍或氧化痕迹，保持其质感与表面光泽，背景替换为纯白色。模拟专业影棚灯箱柔和打光。». Esta frase codifica los cuatro objetivos del ajuste: preservar textura y brillo metalico, eliminar defectos superficiales (rayones, abolladuras, manchas, oxidacion), sustituir el fondo por blanco puro y emular iluminacion de softbox. No se documenta ninguna innovacion arquitectonica adicional, ni decodificacion especulativa, ni atencion lineal; el valor anadido es exclusivamente el ajuste de dominio.

## Capacidades

- Generacion de imagen condicionada por texto mediante la combinacion del adaptador con el modelo base Flux2-Klein-9B.
- Retoque de fotografia de producto de joyeria: conservacion de textura metalica y brillo superficial.
- Eliminacion de defectos: rayones, abolladuras, manchas y oxidacion sobre la superficie de la pieza.
- Sustitucion de fondo por blanco puro, apto para fichas de catalogo y marketplaces.
- Simulacion de iluminacion de estudio con softbox, segun la descripcion del autor.
- Integracion en flujos de ComfyUI mediante nodos de carga de LoRA.
- Ejecucion en la plataforma RunningHub y a traves de su API.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision de entrada, audio ni modo thinking; son capacidades ajenas al tipo de modelo.
- Capacidades multilingues: no disponible; la palabra de activacion esta en chino y no se documenta comportamiento con prompts en otros idiomas.

## Casos de uso

- Catalogos de e-commerce de joyeria: aplicar el LoRA sobre fotografias de anillos, cadenas o pulseras para obtener imagenes con fondo blanco puro y acabado homogeneo, requisito habitual en fichas de producto de marketplaces.
- Recuperacion de stock fotografico antiguo: reprocesar imagenes con fondos sucios, reflejos irregulares o piezas con marcas leves para reutilizarlas en campanas nuevas sin repetir la sesion fotografica.
- Venta de joyeria de segunda mano: presentar la pieza con la superficie limpia y sin marcas visibles, generando una previsualizacion del estado tras un pulido, siempre que el vendedor valide que la imagen no induzca a error sobre el estado real.
- Automatizacion de posproduccion en ComfyUI: encadenar carga de imagen, aplicacion del LoRA con el prompt de activacion fijo y guardado por lotes, reduciendo el trabajo manual de retoque pieza a pieza.
- Servicios SaaS de retoque: exponer el adaptador mediante la API de RunningHub o un backend propio, cobrando por imagen procesada a pequenos talleres y marcas sin equipo de fotografia.
- Estandarizacion de marca: fijar un unico estilo de luz e fondo para todo el catalogo de una marca, de modo que las piezas de distintos proveedores aparezcan con acabado coherente.
- Previsualizacion para diseno y prototipado: mostrar a un cliente como quedaria una pieza concreta bajo iluminacion de estudio antes de producir la fotografia definitiva.
- Formacion interna y documentacion: generar ejemplos de referencia de acabado correcto para guiar a fotografos y retocadores humanos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, SSIM, LPIPS ni evaluaciones humanas), ni comparaciones cuantitativas con otros adaptadores de retoque de producto.

## Requisitos de hardware

- El adaptador en si ocupa 158 MiB, por lo que el requisito real de VRAM lo determina el modelo base Flux2-Klein-9B (9B de parametros segun la model card) y su codificador de texto, cuyo tamano no se especifica.
- Estimacion orientativa para el conjunto base mas LoRA: aproximadamente 24-40 GB de VRAM en precision bf16/fp16, en funcion de la resolucion de salida y del codificador de texto empleado. Es una estimacion, no un dato publicado por el autor.
- Con cuantizacion de 8 bits se puede esperar un rango aproximado de 14-20 GB de VRAM; con cuantizaciones GGUF de 4-5 bits, un rango de 6-10 GB, tambien como estimacion.
- GPU recomendadas para precision completa: A100 de 40 o 80 GB y H100 de 80 GB. Para cuantizacion de 8 bits, RTX 4090 o RTX 3090 de 24 GB resultan suficientes en la mayoria de resoluciones de trabajo.
- En GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB) con cuantizacion, y previsiblemente en RTX 3060 de 12 GB o RTX 4070 con GGUF de 4 bits, con tiempos de generacion mas altos. No hay datos de latencia publicados.
- Opciones de despliegue: ComfyUI (entorno indicado por el autor), la plataforma RunningHub y su API, y Hugging Face como repositorio de pesos. vLLM y TGI no aplican a modelos de difusion.
- Latencia y throughput: no disponible. No se han publicado mediciones de imagenes por segundo ni tiempos por generacion.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-flux2-klein-lora | LoRA de retoque de producto sobre Flux2-Klein-9B | Adaptador de 158 MiB; base de 9B segun la model card | No aplica | Sin benchmarks publicados | no disponible | Hugging Face, ComfyUI, RunningHub |
| Flux2-Klein-9B (modelo base sin adaptador) | Transformer de difusion text-to-image | 9B segun la nomenclatura del autor | No aplica | No disponible en esta informacion | No disponible en esta informacion | Repositorio upstream no enlazado en la model card |
| Otros LoRA de retoque de producto | Adaptadores de difusion | no disponible | No aplica | No disponible | no disponible | No se han identificado alternativas equivalentes en la informacion proporcionada |

No se dispone de datos suficientes para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Sesgos: no documentados. Al estar especializado en joyeria, el comportamiento fuera de ese dominio (otros materiales, textiles, alimentos, personas) es impredecible y no ha sido evaluado.
- Riesgo de alucinacion visual: como todo modelo generativo, puede inventar detalles de la pieza, alterar gemas, grabados o proporciones, o modificar el diseno original. En catalogos de producto esto es un riesgo comercial y legal relevante, ya que la imagen debe representar fielmente el articulo.
- La eliminacion de defectos puede inducir a error al comprador si se aplica a piezas de segunda mano sin declararlo. Conviene revisar la normativa de proteccion al consumidor aplicable.
- Limitaciones de idioma: la palabra de activacion esta en chino y no se documenta su comportamiento con prompts en castellano u otros idiomas.
- Formato y resolucion de salida: no disponibles. No se indica resolucion nativa, relacion de aspecto soportada ni si el adaptador funciona a distintas escalas.
- Licencia: no disponible. La model card indica que el copyright permanece en el autor y remite a la licencia del proyecto original, por lo que antes de un uso comercial es imprescindible verificar la licencia de Flux2-Klein-9B y contactar con el autor.
- Procedencia de los datos de entrenamiento: no documentada, lo que impide evaluar posibles reclamaciones de derechos sobre las imagenes usadas.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, y creacion y actualizacion el mismo dia. No hay evidencia de uso en produccion ni de mantenimiento posterior.
- Un fichero de pesos con nombre en chino puede requerir atencion al manejo de rutas y codificaciones en algunos sistemas.
- No hay garantia de reproducibilidad: se desconoce la version exacta del modelo base con la que se entreno el adaptador.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-flux2-klein-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2032649104995651585
- Pagina del autor en RunningHub: https://www.runninghub.cn/user-center/1906743421258674178
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio China): https://www.runninghub.cn
- Documentacion de la API (castellano/ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Llamada a la API de RunningHub: https://www.runninghub.ai/call-api?utm_source=huggingface&utm_medium=badge&utm_campaign=api_promotion&utm_content=rh-2032649104995651585
- README en chino: README_cn.md (referenciado desde la model card, sin URL absoluta publicada)
