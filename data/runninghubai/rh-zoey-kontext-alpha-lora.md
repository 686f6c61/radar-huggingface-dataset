# RunningHubAI/rh-zoey-kontext-alpha-lora

## Resumen

rh-zoey-kontext-alpha-lora es un adaptador LoRA de edicion de imagen publicado por RunningHubAI (autor acreditado en la model card: RunningHub-@T8star-Aix) sobre un modelo base de la familia FLUX Kontext, identificado en la ficha como "F1基础-Kontext". Su funcion es concreta y acotada: a partir de una imagen de entrada y una instruccion de texto, modifica el angulo de vision o la orientacion del personaje para dejarlo mirando de frente, activandose mediante la palabra clave "ATurn to the front".

El repositorio contiene un unico archivo de pesos, ZOEY-kontext角度编辑器_Alpha.safetensors, de 328 MiB, lo que situa el repo en 0,3 GB. Es por tanto un adaptador ligero, no un modelo completo: necesita el modelo base de Kontext para funcionar, y esta pensado para ejecutarse en ComfyUI, en la plataforma RunningHub o cargarse desde Hugging Face.

Su relevancia practica esta en la normalizacion de orientacion: convertir retratos o figuras de perfil, tres cuartos o espaldas en tomas frontales conservando en lo posible composicion, expresion y postura originales. Es un caso de uso tipico en preparacion de datasets, retoque comercial y pipelines de assets donde se exige consistencia de encuadre frontal. La ficha no publica informacion sobre licencia, idiomas, datos de entrenamiento ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo base de la familia FLUX Kontext (edicion de imagen guiada por texto). Arquitectura interna del modelo base: no disponible en la informacion proporcionada |
| Parametros totales | No disponible. El adaptador se distribuye como archivo de 328 MiB; el numero de parametros no se publica |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de imagen; no se especifica resolucion ni ventana de contexto) |
| Tipos de cuantizacion | No disponible. Se distribuye un unico peso en safetensors, sin variantes cuantizadas publicadas |
| Idiomas soportados | No disponible. La model card esta en chino e ingles; no se declaran idiomas de prompt |
| Licencia | No disponible. La model card indica que el copyright permanece en el autor y que se debe seguir "la licencia del proyecto original o upstream" |
| Formato de pesos | safetensors (ZOEY-kontext角度编辑器_Alpha.safetensors, 328 MiB) |
| Tipo de modelo | LoRA de edicion de imagen (image edit), pipeline image-text-to-image |
| Modelo base | FLUX Kontext ("F1基础-Kontext", segun la model card) |
| Palabra clave (trigger word) | ATurn to the front (cadena literal tal como se publica, incluye la "A" inicial) |
| Plataformas soportadas | ComfyUI, RunningHub (API y web), Hugging Face |
| Tamano del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de publicacion | 24 de septiembre de 2026 (ultima actualizacion el mismo dia) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) que se aplica sobre un modelo base de edicion de imagen de la familia FLUX Kontext. La model card indica explicitamente "Finetuned from: F1基础-Kontext", es decir, un ajuste fino de bajo rango sobre ese modelo base en lugar de un entrenamiento desde cero. El LoRA no modifica el pipeline completo: se acopla al modelo base, que sigue siendo el responsable de la codificacion del texto, la generacion latente y la reconstruccion de la imagen final.

La funcion aprendida es especifica: interpretar una instruccion de edicion de orientacion, activada por la cadena "ATurn to the front", y reorientar al sujeto hacia una vista frontal preservando el resto de atributos (composicion, expresion, pose). La model card describe este comportamiento como un ajuste "natural" del angulo, sin entrar en detalles del mecanismo interno.

No se publican datos sobre el proceso de entrenamiento: ni numero de imagenes o tokens, ni composicion del dataset, ni si se emplearon tecnicas de alineacion tipo RLHF o DPO (no aplicables de forma estandar a modelos de difusion). Tampoco se documentan innovaciones tecnicas adicionales, hiperparametros de rango o alpha del LoRA, ni detalles de la infraestructura de entrenamiento, mas alla de que se realizo en la plataforma RunningHub.

## Capacidades

- Edicion de imagen guiada por texto sobre un modelo base de la familia FLUX Kontext, con el pipeline image-text-to-image.
- Reorientacion de personajes o sujetos hacia una vista frontal a partir de imagenes con angulos laterales, de tres cuartos o posteriores.
- Conservacion (segun la model card) de la composicion original, la expresion facial y la postura del sujeto durante la edicion.
- Activacion mediante palabra clave: la cadena "ATurn to the front" es el disparador documentado.
- Integracion en flujos de ComfyUI como nodo LoRA sobre el modelo base de Kontext.
- Ejecucion en la plataforma en la nube RunningHub, con acceso via web y via API.
- No dispone de soporte documentado de tool calling, function calling, agentes, razonamiento multi-paso, vision general, audio, thinking mode ni capacidades multilingues declaradas: es un adaptador de edicion de imagen, no un modelo de lenguaje.

## Casos de uso

- Normalizacion de datasets de rostros: en proyectos de reconocimiento facial o entrenamiento de modelos de identidad se suele exigir rostro frontal; este LoRA permite convertir imagenes de perfil o de tres cuartos a una vista frontal para homogeneizar el conjunto de datos antes del entrenamiento.
- Retoque fotografico comercial: un estudio que ha recibido una sesion con el sujeto girado puede generar una variante frontal para catalogo, sin repetir el shooting, siempre que el resultado se revise antes de su publicacion.
- Assets para videojuegos y animacion: pipelines de modelado o rigging facial suelen requerir una referencia frontal del personaje; el adaptador permite obtener esa vista de referencia a partir del concept art o de una captura existente.
- Avatares y fotos de perfil: generacion de una version de frente de una fotografia para perfiles profesionales, fichas de equipo o sistemas de avatar, manteniendo la apariencia del sujeto original.
- E-commerce y moda: conversion de imagenes de producto o de modelo a un encuadre frontal coherente para fichas de catalogo, reduciendo la dispersion de angulos entre referencias de una misma coleccion.
- Preprocesado de pipelines de generacion de video o personajes consistentes: obtener una vista frontal de referencia facilita mantener la identidad del personaje en tomas posteriores generadas por otros modelos.
- Produccion de contenido para redes sociales: reencuadre rapido de material ya grabado o fotografiado, dentro de un flujo por lotes en ComfyUI.
- Automatizacion en la nube: uso mediante la API de RunningHub para integrar la edicion de orientacion en un servicio que reciba imagenes de usuarios y devuelva la variante frontal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas cuantitativas (FID, CLIP, SSIM, evaluaciones humanas) ni comparaciones con otros adaptadores. Tampoco se documentan tiempos de inferencia ni throughput.

## Requisitos de hardware

- La LoRA en si ocupa 328 MiB en disco. La VRAM adicional que consume al cargarse es marginal (por debajo de 1 GB en la mayoria de configuraciones), muy inferior a la del modelo base.
- El requisito real de VRAM lo determina el modelo base de Kontext, que no se incluye en este repositorio y cuyos requisitos no se publican en la ficha.
- Estimaciones orientativas para la familia de modelos base de Kontext (no publicadas por el autor, ofrecidas solo como referencia general): en torno a 24 GB de VRAM en precision fp16/bf16; aproximadamente 16 GB con pesos en fp8; y del orden de 8 a 12 GB con variantes GGUF cuantizadas a 4 bits. Estas cifras deben verificarse contra la implementacion concreta que se utilice.
- GPU de datacenter recomendadas para el modelo base: A100, H100 o L40S para despliegues con concurrencia. En ambito profesional, RTX 4090 (24 GB) es la opcion consumer mas habitual si se trabaja en fp16/bf16 o fp8.
- Cabe en GPU de consumo siempre que se cuantice el modelo base: RTX 3090/4090 (24 GB) sin cuantizar o con fp8, y tarjetas de 12-16 GB (RTX 4070 Ti, 4080, 3060 12 GB) con variantes GGUF de 4-8 bits. Por debajo de 8 GB el modelo base resulta inviable en la practica.
- Opciones de despliegue: ComfyUI (flujo principal indicado por el autor), incluido el ecosistema de nodos GGUF para el modelo base; la plataforma cloud RunningHub via web o API; y librerias de difusion que permitan cargar adaptadores LoRA sobre el modelo base. vLLM y TGI no son aplicables a este tipo de modelo de difusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La informacion publicada no permite una comparacion cuantitativa fiable. La tabla siguiente resume lo que se sabe frente a alternativas de la misma categoria, marcando como "no disponible" todo aquello que no consta.

| Modelo | Tipo | Parametros | Contexto / resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-zoey-kontext-alpha-lora | LoRA de edicion de orientacion sobre FLUX Kontext | No disponible (peso de 328 MiB) | No disponible | Sin benchmarks publicados | No disponible (remite a la licencia upstream) | Hugging Face, ComfyUI, RunningHub |
| FLUX Kontext (modelo base, sin LoRA) | Modelo de edicion de imagen guiado por texto | No disponible en esta ficha | No disponible | No disponible en esta ficha | No disponible en esta ficha | Requiere descarga aparte del modelo base |
| Otros LoRA de edicion de angulo o pose sobre Kontext | Adaptador de edicion de imagen | No disponible | No disponible | No disponible | No disponible | Distribuidos en plataformas como Liblib o Civitai |
| Modelos de edicion de imagen alternativos (por ejemplo, familia Qwen-Image-Edit) | Modelo completo de edicion de imagen | No disponible en esta ficha | No disponible | No disponible | No disponible | No disponible |

En resumen: no hay datos publicados que permitan afirmar que este adaptador supera o iguala a otras alternativas. La comparacion relevante es funcional (especificidad del cambio de orientacion mediante palabra clave) y no de rendimiento medido.

## Limitaciones y advertencias

- Version alpha: el propio nombre del archivo ("Alpha") indica que se trata de una version preliminar, sin garantia de estabilidad ni de calidad consistente.
- Sin benchmarks ni evaluacion publicada: no hay evidencia cuantitativa de fidelidad al sujeto original ni de calidad de la edicion.
- Riesgo de deriva de identidad: los modelos de difusion aplicados sobre rostros pueden modificar rasgos faciales, iluminacion o textura de piel al cambiar el angulo; es necesario revisar cada resultado.
- Riesgo de alucinacion visual: al inferir informacion no presente en la imagen original (por ejemplo, el lado del rostro que no aparece en una toma de perfil), el modelo puede inventar rasgos coherentes pero falsos.
- Perdida de composicion: aunque la model card afirma que se conservan composicion, expresion y postura, no hay garantia de ello y pueden producirse recortes, deformaciones o cambios de encuadre.
- Sensibilidad a la palabra clave: la activacion depende de la cadena exacta "ATurn to the front", publicada con una "A" inicial que no responde a la sintaxis habitual de una frase en ingles; conviene respetarla tal cual.
- Idioma de los prompts: no se declaran idiomas soportados; la documentacion esta en chino e ingles, lo que sugiere que los prompts en otros idiomas pueden comportarse de forma impredecible.
- Licencia no especificada: la ficha no indica licencia y remite a la del proyecto upstream. Antes de cualquier uso comercial es obligatorio verificar los terminos del modelo base de Kontext y del autor del LoRA. La ausencia de licencia explicita es un riesgo juridico.
- Dependencia del modelo base: el LoRA no funciona de forma autonoma; requiere el modelo base de Kontext, cuyos terminos y requisitos de hardware se aplican de forma adicional.
- Sesgos: no se documenta nada sobre la composicion del dataset de entrenamiento, por lo que no puede descartarse un sesgo de representacion (etnias, edades, tipos corporales) heredado del modelo base y del conjunto de datos de ajuste.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Sin soporte de texto, codigo ni razonamiento: no debe confundirse con un modelo de lenguaje; cualquier expectativa de generacion de texto, tool calling o agentes queda fuera de su alcance.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-zoey-kontext-alpha-lora
- README en chino: https://huggingface.co/RunningHubAI/rh-zoey-kontext-alpha-lora/blob/main/README_cn.md
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/1940460660411052033
- Pagina del autor en RunningHub: https://www.runninghub.cn/user-center/1819214514410942465
- API de RunningHub (promocion enlazada en la model card): https://www.runninghub.ai/call-api
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio para China): https://www.runninghub.cn
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Referencia del modelo en Liblib: https://www.liblib.art/modelinfo/447dc2c312c64d56a343cd12cd6a9677
- API de Seedance 2.5 (enlace relacionado incluido en la model card): https://www.runninghub.ai/call-api/api-detail/2133100000000700025
