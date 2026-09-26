# Jinstudio/Boogu-Image-0.1-Edit-Turbo

## Resumen

Boogu-Image-0.1-Edit-Turbo es un modelo de difusion para edicion de imagen (image-to-image) perteneciente a la familia Boogu-Image-0.1, publicada bajo licencia Apache-2.0 por el equipo Boogu. Se trata de la variante "Turbo" del modelo de edicion, destilada para inferencia en cuatro pasos, lo que reduce de forma notable el coste computacional por imagen frente a la variante de edicion completa. El checkpoint alojado en el repositorio Jinstudio/Boogu-Image-0.1-Edit-Turbo ocupa 38,5 GB e incluye pesos en formato safetensors compatibles con la libreria diffusers mediante el pipeline BooguImagePipeline.

La familia completa incluye las variantes Base, Turbo, Edit y Edit-Turbo, y cubre generacion texto-a-imagen, generacion rapida, edicion de imagen y renderizado de texto en chino e ingles. El modelo declarado tiene 10.292.556.288 parametros (aproximadamente 10,3 mil millones), lo que lo situa en la gama de los modelos de difusion de gran tamano orientados a edicion.

Su relevancia actual reside en dos factores: por un lado, es una alternativa abierta (Apache-2.0) a sistemas cerrados de generacion y edicion multimodal como Nano Banana Pro o GPT-Image-2; por otro, el equipo afirma haber alcanzado resultados competitivos con un presupuesto de computo de entrenamiento y un volumen de datos aproximadamente un orden de magnitud inferior al de otros modelos abiertos, lo que lo convierte en un caso de estudio interesante sobre eficiencia en el entrenamiento. El proyecto se declara explicitamente como investigacion, no como producto listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para generacion y edicion de imagen (familia unificada Boogu-Image-0.1); detalles internos de la arquitectura no disponibles en la informacion proporcionada |
| Parametros totales | 10.292.556.288 (aproximadamente 10,3 mil millones), dato real de los pesos safetensors |
| Parametros activos | No aplica: no se describe como MoE en la informacion disponible |
| Longitud de contexto | No aplica / no disponible: es un modelo de imagen, no un modelo de lenguaje con ventana de contexto |
| Tipos de cuantizacion | No disponible: no se documentan cuantizaciones (GGUF, INT8, FP8, etc.) en la informacion proporcionada |
| Idiomas soportados | Ingles (en) y chino (zh), incluyendo renderizado de texto en ambos idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria diffusers) |
| Tarea / pipeline | image-to-image (edicion de imagen) |
| Resoluciones de referencia | Checkpoints para 1K y 1.5K |
| Paso de inferencia | Variante destilada a 4 pasos |
| Tamano del repositorio | 38,5 GB |

## Arquitectura y entrenamiento

La informacion disponible describe Boogu-Image-0.1 como una familia unificada de generacion y edicion de imagen, con variantes Base y Turbo para texto-a-imagen y Edit y Edit-Turbo para edicion. El modelo aqui documentado, Edit-Turbo, es una destilacion en cuatro pasos del modelo de edicion, pensada para reducir el numero de evaluaciones del modelo por muestra y, con ello, la latencia. No se detalla en la informacion proporcionada el tipo concreto de backbone (por ejemplo, si es un transformer de difusion con atencion completa, un modelo con atencion lineal o una arquitectura hibrida), ni el numero de tokens de entrenamiento.

El planteamiento del equipo es que, bajo un presupuesto de computo muy inferior al de los sistemas cerrados, mejorar sistematicamente la capacidad de comprension del modelo, la calidad de los datos y el pipeline de entrenamiento sigue produciendo mejoras sustanciales en generacion y edicion. Afirman que la escala de datos de entrenamiento es aproximadamente un orden de magnitud menor que la de algunos modelos abiertos existentes. Se ha publicado un informe tecnico (arXiv:2607.13125) que recoge este estudio empirico. No hay datos en la informacion disponible sobre el uso de RLHF, DPO u otras tecnicas de alineacion, ni sobre la composicion exacta del dataset.

Un detalle operativo relevante: el 8 de julio de 2026 se publico un hotfix de esta variante que corrige degradacion severa de calidad de imagen y un rendimiento deficiente en tareas de eliminacion de elementos, con revisiones etiquetadas como hotfix-1k-20260708 y hotfix-1k5-20260708. El equipo recomienda el checkpoint de 1K por ofrecer resultados mas estables. Esto implica que las versiones anteriores del modelo presentaban defectos conocidos de calidad.

## Capacidades

- Edicion de imagen guiada por instrucciones en lenguaje natural (image-to-image): modificacion de contenido, estilo, atributos y composicion sobre una imagen de entrada.
- Inferencia en cuatro pasos gracias a la destilacion de la variante Turbo, orientada a edicion interactiva y por lotes.
- Tareas de eliminacion y borrado de elementos (object removal), explicitamente corregidas en el hotfix de julio de 2026.
- Renderizado de texto en chino e ingles dentro de la imagen generada o editada.
- Generacion texto-a-imagen en las variantes Base y Turbo de la misma familia (no en este checkpoint de edicion).
- Comprension multimodal: el trabajo del equipo se enmarca en la mejora de la generacion multimodal agentica apoyandose en la capacidad de comprension del modelo, segun el titulo del informe tecnico.
- Dos niveles de resolucion soportados mediante checkpoints separados: 1K y 1.5K.
- Integracion con el servidor de inferencia vLLM-Omni y con diffusers; soporte experimental de backend NPU en una rama especifica del repositorio.
- No se documenta en la informacion disponible soporte de tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje: es un modelo de difusion de imagen.

## Casos de uso

- Edicion de fotografia de producto en comercio electronico: sustituir fondos, corregir iluminacion o cambiar el color de un articulo manteniendo la forma, con la ventaja de los cuatro pasos de inferencia para procesar catalogos completos en lotes.
- Eliminacion de objetos no deseados en fotografia de stock o inmobiliaria: el hotfix de julio de 2026 corrige especificamente las tareas de removal, por lo que es la tarea para la que el modelo esta mejor ajustado tras la actualizacion.
- Localizacion de creatividades de marketing entre ingles y chino: el modelo renderiza texto en ambos idiomas, lo que permite adaptar carteles, banners y materiales promocionales sin rediseno manual.
- Iteracion rapida de assets para videojuegos y animacion: la variante Turbo permite generar y refinar variantes de un concepto visual en pocos pasos, adecuado para exploracion de direccion artistica antes de la produccion final.
- Preprocesado de datasets de vision por computador: aplicar transformaciones controladas (cambios de estilo, eliminacion de elementos, ajustes de composicion) para aumentar la diversidad de un conjunto de entrenamiento.
- Herramientas creativas integradas en aplicaciones de escritorio o web: al ser Apache-2.0 y compatible con diffusers, puede incorporarse en editores propios sin coste de licencia ni dependencia de una API de pago.
- Canalizacion por lotes en infraestructura propia: soporte de vLLM-Omni para servir el modelo y de backend NPU para aceleradores no NVIDIA, lo que permite desplegarlo en entornos heterogeneos.
- Investigacion sobre eficiencia en entrenamiento de modelos de difusion: la familia sirve como referencia reproducible de que resultados competitivos son alcanzables con aproximadamente un orden de magnitud menos de datos.
- Prototipado de pipelines de edicion agentica: combinado con un modelo de lenguaje que planifique las instrucciones, el modelo de edicion puede actuar como ejecutor de cada paso de edicion sobre la imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y los resultados de busqueda no incluyen tablas con metricas numericas (FID, CLIP score, GenEval, GEdit-Bench u otras) para Boogu-Image-0.1-Edit-Turbo ni comparaciones cuantitativas con otros modelos. La unica afirmacion cualitativa disponible es que el modelo es "competitivo" frente a sistemas cerrados y que su escala de datos de entrenamiento es aproximadamente un orden de magnitud menor que la de otros modelos abiertos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 10,3 mil millones de parametros, los pesos en precision de 16 bits ocupan aproximadamente 20,6 GB; sumando el codificador de texto, el VAE y las activaciones intermedias, hay que prever del orden de 24 a 32 GB para una ejecucion comoda a resolucion 1K. A 1.5K la demanda de memoria de activaciones aumenta.
- GPU recomendadas: A100 40 GB, A100 80 GB, H100 o L40S para despliegue sin compromisos y para servir en paralelo. Una RTX 4090 (24 GB) queda en el limite: puede funcionar con precision reducida y tecnicas de offload, pero es probable que no admita la resolucion 1.5K sin fragmentacion o descarga de modulos a CPU.
- GPU de consumo: cabe en tarjetas de 24 GB con ajustes (RTX 4090, RTX 3090), y en tarjetas de 16 GB solo mediante cuantizacion u offloading secuencial, cuya disponibilidad no se documenta en la informacion proporcionada.
- Opciones de despliegue: diffusers con el pipeline BooguImagePipeline (via de referencia), servidor vLLM-Omni mediante la receta oficial del proyecto, y backend NPU en la rama npu del repositorio. No se documentan integraciones con llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles. Los unicos datos indirectos son que la variante Turbo esta destilada a cuatro pasos y que existe una variante de edicion no destilada, lo que implica que este checkpoint es la opcion mas rapida de la familia, pero sin cifras publicadas.
- Almacenamiento: el repositorio completo ocupa 38,5 GB, ya que incluye varios checkpoints y revisiones; conviene descargar selectivamente la revision hotfix-1k-20260708 si se busca el comportamiento mas estable.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos comparativos de benchmarks ni fichas tecnicas de alternativas. La tabla siguiente recoge alternativas de la misma categoria (edicion o generacion de imagen de gran tamano con pesos abiertos), con cifras aproximadas de conocimiento publico general que no han sido verificadas en la informacion disponible y que conviene contrastar antes de citarlas.

| Modelo | Parametros | Resolucion / contexto | Licencia | Notas |
|---|---|---|---|---|
| Boogu-Image-0.1-Edit-Turbo | 10,3 mil millones (dato real de safetensors) | 1K y 1.5K; inferencia en 4 pasos | Apache-2.0 | Familia con variantes Base, Turbo y Edit; proyecto declarado de investigacion |
| Boogu-Image-0.1-Turbo | No disponible | No disponible | Apache-2.0 | Variante texto-a-imagen de la misma familia |
| FLUX.1 Kontext (familia FLUX.1 de Black Forest Labs) | Aproximadamente 12 mil millones | No disponible | Licencia no comercial en la variante dev | Referencia habitual en edicion de imagen abierta; datos no verificados en esta busqueda |
| Qwen-Image-Edit | Aproximadamente 20 mil millones | No disponible | Apache-2.0 en la variante abierta | Alternativa de edicion con renderizado de texto; datos no verificados en esta busqueda |
| Nano Banana Pro, GPT-Image-2 | No disponible | No disponible | Propietaria | Sistemas cerrados citados por el propio equipo Boogu como referencia de rendimiento |

## Limitaciones y advertencias

- Proyecto exclusivamente de investigacion: la model card indica que no esta pensado para despliegue en produccion sin salvaguardas adicionales.
- Riesgo de contenido inadecuado: el propio equipo advierte de que el modelo puede producir resultados inexactos, sesgados o inapropiados. No se detallan los sesgos concretos identificados ni si existe una fase de filtrado de seguridad en inferencia.
- Ausencia total de benchmarks publicos: no se pueden verificar de forma independiente las afirmaciones de rendimiento competitivo ni comparar contra alternativas con cifras objetivas.
- Historial de defectos de calidad: la version previa del modelo presentaba degradacion severa de calidad de imagen y mal rendimiento en tareas de eliminacion, corregidos parcialmente en el hotfix de julio de 2026. Se recomienda usar el checkpoint de 1K.
- Cobertura linguistica limitada a ingles y chino: no se garantiza el renderizado de texto en otros idiomas, incluido el castellano.
- Repositorio con traccion nula: el checkpoint Jinstudio/Boogu-Image-0.1-Edit-Turbo registra 0 descargas y 0 likes, y el aviso de la model card senala que el equipo Boogu no ofrece API de pago ni servicio comercial. Existen multiples repositorios y variantes con nombres similares, por lo que conviene verificar la procedencia de los pesos.
- Licencia: Apache-2.0 permite uso comercial y modificacion con obligacion de conservar avisos, pero el autor declara el modelo como investigacion, lo que traslada al usuario la responsabilidad de evaluar la idoneidad y el cumplimiento normativo en su jurisdiccion.
- Consideraciones de derechos de imagen: al ser un modelo de edicion, los resultados dependen de las imagenes de entrada; el usuario debe asegurarse de disponer de derechos sobre ellas y de no generar contenido enganoso o suplantacion de identidad.
- Sin informacion sobre marcas de agua, procedencia criptografica (C2PA) ni mecanismos de trazabilidad de las imagenes generadas.
- Requisitos de memoria elevados para una GPU de consumo, con riesgo de fragmentacion a 1.5K y sin opciones de cuantizacion documentadas.

## Enlaces

- Repositorio en HuggingFace (checkpoint documentado): https://huggingface.co/Jinstudio/Boogu-Image-0.1-Edit-Turbo
- Repositorio oficial de la familia en HuggingFace: https://huggingface.co/Boogu/Boogu-Image-0.1-Edit-Turbo
- Variante texto-a-imagen en HuggingFace: https://huggingface.co/Boogu/Boogu-Image-0.1-Turbo
- Revisiones del hotfix: https://huggingface.co/Boogu/Boogu-Image-0.1-Edit-Turbo/tree/hotfix-1k-20260708 y https://huggingface.co/Boogu/Boogu-Image-0.1-Edit-Turbo/tree/hotfix-1k5-20260708
- Repositorio de codigo en GitHub: https://github.com/boogu-project/Boogu-Image
- Informe tecnico: https://arxiv.org/abs/2607.13125
- Pagina del proyecto: https://boogu.org
- Galeria de ejemplos: https://boogu-gallery.netlify.app/
- Demos en linea: http://demo-base.boogu.org/ , http://demo-edit.boogu.org/ , http://demo-turbo.boogu.org/ , https://demo-edit-turbo-1k.boogu.org/ , https://demo-edit-turbo-1k5.boogu.org/
- Organizacion en ModelScope: https://modelscope.cn/organization/Boogu
- Receta de vLLM-Omni para Boogu-Image: https://github.com/vllm-project/vllm-omni/blob/main/recipes/Boogu/Boogu-Image.md
- Analisis externo del modelo: https://studio.aifilms.ai/blog/boogu-image-edit-turbo-open-source
