# RunningHubAI/rh-zimage-turbo-049-2-runninghub-4000-lora

## Resumen

rh-zimage-turbo-049-2-runninghub-4000-lora es un adaptador LoRA de tipo text-to-image, no un modelo de lenguaje. Lo publica la cuenta RunningHubAI en Hugging Face como parte del catalogo de modelos de la plataforma RunningHub, y esta firmado por el usuario @litlle wind. Su funcion es inyectar un estilo o concepto concreto (denominado comercialmente "Zimage Turbo-Beauty 049-Wealthy Heiress 2") sobre el modelo base Z-image-turbo, de modo que las generaciones reproduzcan esa estetica de retrato femenino sin necesidad de reentrenar el modelo completo.

El repositorio contiene un unico fichero de pesos en formato safetensors de 81 MiB, lo que es coherente con un LoRA de rango bajo y no con un modelo completo. El tamano total del repositorio es de aproximadamente 0,1 GB. No se especifican la arquitectura, el numero de parametros ni la longitud de contexto del modelo base sobre el que se aplica, mas alla de la referencia a Z-image-turbo.

Su relevancia es practica mas que tecnica: se trata de un artefacto listo para cargar en ComfyUI, en la nube de RunningHub o mediante su API, orientado a flujos de generacion de imagen con una estetica muy concreta. La model card no aporta informacion sobre datos de entrenamiento, licencia efectiva ni benchmarks, por lo que cualquier evaluacion seria debe hacerse probando el adaptador sobre el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre un modelo de difusion text-to-image; el modelo base Z-image-turbo no describe su arquitectura en la informacion proporcionada) |
| Parametros totales | no disponible (el peso publicado ocupa 81 MiB en safetensors, pero no se indica el rango ni el numero de parametros del adaptador) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (generacion de imagen; no se especifica resolucion ni tamano de prompt soportado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible; la model card indica que los derechos pertenecen al autor y que debe seguirse la licencia del proyecto original o del modelo upstream |
| Formato de pesos | safetensors (`Zimage Turbo-美女049-豪门千金2-runninghub-4000.safetensors`) |
| Tipo de modelo | LoRA (text-to-image) |
| Modelo base | Z-image-turbo |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face |
| Autor | RunningHub, usuario @litlle wind |
| Tamano del repositorio | 0,1 GB |
| Fecha de publicacion en Hugging Face | 27/09/2026 (segun metadatos del repositorio) |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica sobre la arquitectura del modelo base Z-image-turbo ni sobre el diseno del adaptador. Por el tipo de artefacto (LoRA de 81 MiB para text-to-image) se trata de un conjunto de matrices de bajo rango que se acoplan a las capas de atencion de un modelo de difusion, pero el repositorio no indica en que capas se inserta, con que rango se entreno ni sobre que resolucion.

Tampoco se documentan los datos de entrenamiento: no hay numero de imagenes, composicion del dataset, idioma de los prompts de entrenamiento, ni si se aplicaron tecnicas de regularizacion, captions automaticos o ajuste fino adicional. No se menciona el uso de RLHF, DPO ni ninguna otra etapa de alineacion, algo por lo demas habitual en adaptadores de estilo para difusion. La unica pista sobre el contenido es el nombre comercial del modelo ("Beauty 049-Wealthy Heiress 2"), que sugiere un dataset de retratos femeninos con una estetica determinada.

La innovacion tecnica destacable es, en este caso, de caracter operativo: el adaptador se distribuye ya integrado en el ecosistema ComfyUI y en el catalogo de RunningHub, con entrada directa a la API de la plataforma y a su model page original, lo que simplifica el despliegue frente a un LoRA publicado sin infraestructura asociada.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) aplicando un estilo o concepto especifico sobre el modelo base Z-image-turbo.
- Especializacion en retratos femeninos con una estetica concreta (la denominada comercialmente "Beauty 049-Wealthy Heiress 2").
- Integracion como nodo LoRA en flujos de ComfyUI, combinable con otros nodos del grafo (sampler, scheduler, controlnet u otros adaptadores) segun lo permita el flujo.
- Ejecucion en la nube de RunningHub y acceso mediante API de la plataforma.
- Reutilizacion del mismo fichero de pesos en Hugging Face para despliegues locales.
- No se documentan capacidades de edicion de imagen, inpainting, image-to-image, control estructural, vision, audio ni tool calling. Cualquier uso de este tipo depende de las capacidades del modelo base y del flujo donde se inserte el LoRA, no del adaptador en si.

## Casos de uso

- Generacion de retratos editoriales: el LoRA aplicado sobre Z-image-turbo permite producir imagenes de estilo "retrato de alta gama" para revistas, moodboards o presentaciones creativas, manteniendo una estetica consistente entre generaciones.
- Creacion de contenido para redes sociales: produccion por lotes de imagenes con una identidad visual homogenea para cuentas de moda, belleza o lifestyle, donde la coherencia de estilo entre publicaciones es el requisito principal.
- Pruebas de concepto de personaje: definir el aspecto de un personaje (por ejemplo, una protagonista de novela o comic) y generar variaciones de encuadre, vestuario o iluminacion antes de encargar arte final.
- Generacion de material para campanas publicitarias: iterar rapidamente sobre bocetos de imagenes de producto o de modelo para presentar opciones a un cliente antes de la produccion fotografica real.
- Aumento de datos para entrenamiento: generar imagenes sinteticas con una estetica controlada para ampliar un dataset propio de un dominio concreto, siempre que la licencia del modelo base lo permita.
- Automatizacion de pipelines creativos via API: usar la API de RunningHub para encadenar la generacion de imagenes con otros pasos (seleccion, retoque, publicacion) dentro de un flujo automatizado.
- Exploracion de estilo en investigacion: servir como caso de estudio de como un LoRA pequeno (81 MiB) modifica de forma perceptible la salida de un modelo de difusion mayor, util para experimentos sobre transferencia de estilo.
- Integracion en herramientas internas de diseño: incorporar el adaptador a un front-end propio que llame al modelo base, ofreciendo al equipo de diseño un generador de referencias visuales con marca propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye FID, CLIP score, comparativas humanas ni ninguna otra metrica, y tampoco hay resultados de evaluacion en los enlaces de la busqueda web. Al tratarse de un adaptador de estilo, las metricas habituales de los modelos de lenguaje (MMLU, HumanEval, GSM8K) no son aplicables.

## Requisitos de hardware

- VRAM para inferencia: no disponible. Al ser un LoRA, los requisitos vienen determinados por el modelo base Z-image-turbo, cuyas especificaciones no se detallan en la informacion proporcionada.
- GPU recomendadas: no disponibles. Dependen del modelo base y de la precision de ejecucion elegida.
- Encaje en GPU de consumo: no se puede confirmar. Un adaptador de 81 MiB es en si mismo trivial de cargar, pero la viabilidad en GPU de consumo depende por completo del modelo base y del presupuesto de memoria que este consuma.
- Opciones de despliegue: ComfyUI en local, plataforma RunningHub (nube) y API de RunningHub. No se menciona soporte explicito para vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso no son herramientas orientadas a difusion.
- Latencia y throughput: no disponibles. No se publican tiempos de generacion, resolucion de salida ni pasos de muestreo recomendados.
- Almacenamiento: el repositorio ocupa aproximadamente 0,1 GB (81 MiB el fichero de pesos), mas el espacio necesario para el modelo base.

## Comparativa con modelos similares

No se dispone de datos tecnicos suficientes (parametros, contexto, rendimiento, licencia) de este modelo ni de sus alternativas, por lo que la comparacion se limita a lo observable en los repositorios y paginas publicas.

| Modelo | Tipo | Base | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-zimage-turbo-049-2-runninghub-4000-lora | LoRA text-to-image | Z-image-turbo | 81 MiB (repo 0,1 GB) | no disponible | Hugging Face, RunningHub, ComfyUI |
| Zimage Turbo Beauty 049 Wealthy Heiress 2 10000 | LoRA text-to-image | Z-image-turbo | no disponible | no disponible | RunningHub |
| Zimage Turbo_无滤真实_V2 | LoRA text-to-image (estilo realista sin filtros) | Z-image-turbo | no disponible | no disponible | RunningHub |
| Otros adaptadores del catalogo RunningHubAI | LoRA text-to-image | diversos | no disponible | no disponible | Hugging Face, RunningHub |

No hay datos publicados de rendimiento comparado entre estas variantes, por lo que no es posible establecer cual ofrece mejor fidelidad al estilo o mejor consistencia.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se indican arquitectura, datos de entrenamiento, rango del LoRA, resolucion objetivo ni pasos de muestreo recomendados.
- Licencia no disponible. La model card solo senala que los derechos pertenecen al autor y que debe respetarse la licencia del proyecto original o del modelo upstream. Antes de cualquier uso comercial es imprescindible aclarar la licencia aplicable tanto al adaptador como al modelo base Z-image-turbo.
- Dependencia del modelo base: el LoRA no funciona de forma autonoma y su calidad final depende de la version y configuracion del modelo Z-image-turbo con el que se combine.
- Sesgos previsibles: al estar especializado en un unico arquetipo de retrato femenino con una estetica concreta, es esperable una baja diversidad en cuerpos, etnias, edades y contextos, ademas de la reproduccion de los sesgos de representacion presentes en el dataset de entrenamiento.
- Riesgo de sobreajuste al estilo: los LoRA de concepto tienden a imponer su estetica incluso cuando el prompt pide lo contrario, y pueden degradar la fidelidad al prompt cuando se combinan con otros adaptadores.
- No se documentan limitaciones de idioma en los prompts: la model card no especifica si los prompts en castellano funcionan con la misma calidad que en ingles o chino.
- Posible contenido sensible: el nombre del modelo y su categoria sugieren generacion de retratos de personas, lo que exige precauciones sobre derechos de imagen, consentimiento y uso responsable.
- Adopcion practicamente nula: 0 descargas y 0 likes en el momento de la consulta, sin evidencia externa de calidad ni de estabilidad.
- Fecha de creacion inusual (27/09/2026 segun los metadatos), lo que conviene verificar antes de citar el dato.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-zimage-turbo-049-2-runninghub-4000-lora
- README en chino (relativo al repositorio): README_cn.md
- Pagina original del modelo en RunningHub: https://www.runninghub.ai/model/public/2100193202543652865
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/2064710712105979905
- Plataforma RunningHub: https://www.runninghub.ai/
- RunningHub China: https://www.runninghub.cn/
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Espacio de trabajo en la nube: https://www.runninghub.ai/workspace
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Perfil de RunningHubAI en Hugging Face: https://huggingface.co/RunningHubAI
- Variante relacionada "Zimage Turbo Beauty 049 Wealthy Heiress 2 10000": https://www.runninghub.ai/model/public/2086173738006425601
- LoRA relacionado "Zimage Turbo_无滤真实_V2": https://www.runninghub.ai/model/public/2027184765341798401
- Demostracion de la API con Seedance 2.5: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
