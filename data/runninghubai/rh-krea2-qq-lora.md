# RunningHubAI/rh-krea2-qq-lora

## Resumen

rh-krea2-qq-lora es un adaptador LoRA de generacion y edicion de imagen publicado por RunningHubAI (plataforma RunningHub) y ajustado a partir del modelo base krea2. Su objetivo declarado en la model card original (en chino) es producir ilustraciones con estetica "QQ ren": personajes chibi planos, de contornos limpios y colores planos, similares a los avatares usados en plataformas de mensajeria. El pipeline declarado en Hugging Face es image-text-to-image, de modo que el adaptador se carga junto al modelo base para transformar imagenes de entrada siguiendo una indicacion de texto.

El repositorio contiene un unico fichero de pesos, `krea2_QQRW_000004250.safetensors`, de 218 MiB, sobre un total de 0,2 GB. El autor no publica ficha tecnica del entrenamiento, rango del LoRA, resolucion de entrenamiento, dataset ni licencia explicita. Las plataformas indicadas para su uso son ComfyUI, RunningHub y Hugging Face, y el proyecto original se aloja en el catalogo publico de RunningHub.

Su relevancia es practica y acotada: permite incorporar un estilo QQ/chibi a un flujo de trabajo de difusion sin reentrenar el modelo base, algo util para estudios pequenos y creadores que trabajan con ComfyUI. En contrapartida, la ausencia de licencia, de benchmarks y de documentacion tecnica obliga a validar la compatibilidad y los terminos de uso del modelo base antes de cualquier despliegue comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre el modelo base krea2; la arquitectura interna del modelo base no se detalla en la informacion disponible |
| Parametros totales | No disponible. El unico dato publicado es el tamano del fichero de pesos: 218 MiB. A 2 bytes por parametro (fp16) equivaldria a unos 114 millones de parametros, estimacion no confirmada por el autor; los parametros del modelo base tampoco se publican |
| Parametros activos | No aplica (no es un modelo de arquitectura MoE) |
| Longitud de contexto | No aplica (modelo de imagen; el autor no documenta la longitud maxima del prompt de texto) |
| Tipos de cuantizacion | No disponible. Se distribuye un unico fichero `.safetensors` sin variantes cuantizadas |
| Idiomas soportados | No disponible. El autor no documenta el idioma de los prompts; la model card esta redactada en chino e ingles |
| Licencia | No disponible. La model card indica que los derechos pertenecen al autor y remite a la licencia del proyecto original o del modelo base, sin especificarla |
| Formato de pesos | safetensors (`krea2_QQRW_000004250.safetensors`, 218 MiB) |
| Tipo de modelo | LoRA de edicion de imagen (image edit) |
| Modelo base | krea2 (referido en la model card como "Finetuned from: krea2") |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face |
| Tamano del repositorio | 0,2 GB |
| Fecha de creacion | 27 de septiembre de 2026 (segun metadatos de Hugging Face) |
| Ultima actualizacion | 27 de septiembre de 2026 (segun metadatos de Hugging Face) |
| Descargas / likes | 0 descargas y 1 like en el momento de la consulta |

## Arquitectura y entrenamiento

La informacion disponible confirma unicamente que se trata de un adaptador LoRA, es decir, una actualizacion de bajo rango que se inyecta en las capas del modelo base krea2 y que se distribuye como un unico tensor en formato safetensors. No se especifica el rango (rank), el alpha, las capas objetivo ni la tecnica de entrenamiento (por ejemplo, si se empleo LoRA estandar, LoRA con factorizacion o variantes tipo DoRA). Tampoco se indica si el ajuste se hizo sobre el modelo completo de generacion o sobre un subconjunto de sus bloques.

No hay datos sobre el volumen de tokens o de pares imagen-texto del dataset, su composicion, el uso de tecnicas de alineacion como RLHF o DPO (no aplicables de forma habitual a difusion, pero no confirmados como ausentes) ni el numero de pasos de entrenamiento. El nombre del fichero, `krea2_QQRW_000004250`, sugiere un checkpoint en el paso 4.250, interpretacion no confirmada por el autor. El estilo objetivo descrito es 2D plano de tipo QQ, orientado a personajes chibi.

## Capacidades

- Generacion de imagenes en estilo QQ/chibi plano (personajes simplificados, colores solidos, contorno marcado) a partir de un prompt de texto.
- Edicion de imagen guiada por texto (pipeline image-text-to-image): toma una imagen de entrada y aplica el estilo o las modificaciones indicadas.
- Integracion en flujos de ComfyUI mediante nodos de carga de LoRA, combinable con otros nodos del ecosistema (control de estructura, escalado, enmascarado).
- Aplicacion de estilo sobre personajes ya existentes, manteniendo parte de la composicion original de la imagen de entrada.
- Compatibilidad con la plataforma en la nube RunningHub, que ofrece ejecucion alojada y API.
- Tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no documentadas; dependen del codificador de texto del modelo base krea2, que no se detalla en la informacion disponible.
- Capacidades especiales (vision, audio, modo de razonamiento): no documentadas. La unica modalidad confirmada es imagen mas texto de entrada.

## Casos de uso

- Avatares para apps de mensajeria y comunidades online: el adaptador genera retratos chibi de estilo QQ a partir de una foto o una descripcion, un formato habitual en perfiles de plataformas de mensajeria y foros.
- Packs de stickers y emojis: partiendo de un personaje base, se pueden producir variaciones coherentes de estilo para vender o distribuir como paquetes de stickers, gracias a la edicion guiada por texto sobre la misma imagen de referencia.
- Ilustracion para videojuegos casuales y apps moviles: generacion de retratos de personaje y elementos de interfaz con una estetica plana y consistente, util en fases de preproduccion y prototipado.
- Contenido para redes sociales: creacion rapida de ilustraciones de marca o de comunidad con un estilo reconocible, sin necesidad de encargar cada pieza a un ilustrador.
- Prototipado de personajes para animacion o webtoon: generacion de hojas de personaje en estilo plano para validar diseno y paleta antes de producir el material final.
- Mascotas corporativas y branding ligero: adaptacion de un logotipo o personaje corporativo al estilo QQ para campanas, presentaciones o material promocional.
- Merchandising e impresion bajo demanda: generacion de ilustraciones de personaje con contornos limpios y colores planos, un formato que se reproduce bien en pegatinas, camisetas y postales.
- Restauracion estilizada de fotos de usuario: convertir una fotografia en una ilustracion chibi plana mediante el pipeline image-text-to-image, manteniendo el encuadre y la pose de la imagen original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas objetivas (FID, CLIP score, similitud de estilo), comparaciones con otros adaptadores ni ejemplos de evaluacion cuantitativa.

## Requisitos de hardware

- El adaptador ocupa 218 MiB en disco y, al cargarse en memoria junto al modelo base, anade un sobrecoste de VRAM del orden de unos pocos cientos de megabytes; el consumo total lo determina el modelo base krea2.
- VRAM estimada para inferencia: no disponible. Depende por completo del modelo base krea2, cuyas especificaciones no se publican en este repositorio.
- GPU recomendadas: no disponibles. Sin los requisitos del modelo base no puede confirmarse el rango de GPU adecuado (A100, H100, RTX 4090 u otras).
- Compatibilidad con GPU de consumo: no confirmada. El adaptador en si es ligero, pero el modelo base es el factor limitante y su huella de memoria no esta documentada aqui.
- Opciones de despliegue: ComfyUI (carga del LoRA junto al modelo base), plataforma en la nube RunningHub (ejecucion alojada y API), y descarga de pesos desde Hugging Face. vLLM, llama.cpp, Ollama y TGI no aplican, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. No hay datos de velocidad de inferencia ni de rendimiento por imagen.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos verificables de otros adaptadores de estilo comparables ni de sus modelos base, y no se publican parametros del modelo krea2 ni metricas de rendimiento que permitan una comparacion cuantitativa. Cualitativamente, la categoria equivalente seria la de LoRA de estilo para modelos de difusion de imagen en ComfyUI, pero sin cifras no es posible establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Licencia no especificada: la model card remite a la licencia del proyecto original o del modelo base sin indicar cual es. No puede confirmarse que el uso comercial este permitido.
- Ausencia total de ficha tecnica: no se documentan rango del LoRA, dataset, pasos de entrenamiento ni resolucion, lo que dificulta reproducir o auditar el resultado.
- Compatibilidad estricta con el modelo base: al ser un LoRA ajustado sobre krea2, su carga en otros modelos base producira resultados degradados o directamente invalidos.
- Sesgo de estilo: el adaptador empuja la salida hacia una estetica chibi plana muy concreta; fuera de ese dominio puede degradar la fidelidad de la imagen de entrada.
- Riesgo de artefactos y alucinacion visual: como cualquier modelo de difusion, puede generar anatomias incorrectas, textos ilegibles o detalles incoherentes, especialmente en manos, ojos y elementos finos.
- Idiomas del prompt no documentados: no se sabe si responde bien a prompts en castellano, chino o ingles; este punto debe probarse antes de integrarlo en un producto.
- Trazabilidad limitada: el repositorio acumula 0 descargas y 1 like, sin historial de uso ni validacion por parte de la comunidad.
- Idiomas soportados y limitaciones de contexto: no aplicables al texto de entrada, pero el autor no publica limites de longitud de prompt ni de resolucion de imagen.
- Procedencia de los datos de entrenamiento desconocida: no puede descartarse que el dataset incluya material con derechos de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-krea2-qq-lora
- Model card en chino (referenciada en el README): https://huggingface.co/RunningHubAI/rh-krea2-qq-lora/blob/main/README_cn.md
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/2098260418874658818
- Pagina del autor en RunningHub: https://www.runninghub.cn/user-center/2019675914568474626
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio para China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Referencia promocional a la API de Seedance 2.5 incluida en la model card (no relacionada con este LoRA): https://www.runninghub.ai/call-api/api-detail/2133100000000700025
