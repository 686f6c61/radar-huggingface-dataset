# RunningHubAI/rh-nova-3dcg-xl-checkpoint

## Resumen

rh-nova-3dcg-xl-checkpoint es un checkpoint de generacion de imagenes publicado en Hugging Face por RunningHubAI (RunningHub) en nombre del autor original, identificado en la model card como @百迟. El repositorio contiene un unico archivo de pesos, `nova3DCGXL_ilV90.safetensors` (6617 MiB, aproximadamente 6,94 GB), pensado para cargarse en ComfyUI, en la plataforma RunningHub o en Hugging Face.

Por el nombre, el tag `checkpoint` y el tamano del archivo, se trata de un modelo de difusion afinado a partir de IL-XL (indicado como base en la propia model card), orientado a un estilo "3DCG". La model card no confirma arquitectura, numero de parametros ni resolucion de entrenamiento, por lo que esos datos no estan disponibles en la informacion proporcionada.

Su relevancia es limitada pero concreta: es un ajuste fino de estilo publicado a traves de la plataforma RunningHub, con licencia no explicitada, cero descargas y cero likes en el momento de la consulta. Resulta util como ejemplo de distribucion de checkpoints de difusion por parte de plataformas de inferencia, y no como modelo de lenguaje: no dispone de contexto, tool calling ni capacidades agenticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la especifica; el tag `checkpoint` y el tamano de ~6,94 GB son compatibles con SDXL, pero no se confirma) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de generacion de imagenes, no de texto) |
| Tipos de cuantizacion | no disponible (se distribuye un unico archivo en safetensors; no se documentan variantes fp8, GGUF ni similares) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "Follow the original project or upstream license", con copyright del autor) |
| Formato de pesos | safetensors |
| Tipo de modelo | checkpoint de difusion para generacion de imagenes |
| Modelo base | IL-XL (finetuned from IL-XL, segun la model card) |
| Archivo principal | `nova3DCGXL_ilV90.safetensors` (6617 MiB) |
| Tamano del repositorio | 6,9 GB |
| Palabras de activacion | la model card indica "Trigger words: 1" sin especificar cual |
| Plataformas indicadas | ComfyUI, RunningHub, Hugging Face |
| Fecha de creacion | 2026-09-27 |
| Ultima actualizacion | 2026-09-27 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura, el dataset ni el procedimiento de entrenamiento. La model card se limita a indicar que el modelo es un `checkpoint`, que esta afinado a partir de IL-XL y que se distribuye en un unico archivo safetensors de 6617 MiB. No se documentan numero de tokens o imagenes de entrenamiento, composicion del dataset, resolucion nativa, uso de RLHF/DPO (concepto que no aplica a modelos de difusion de imagenes) ni tecnicas de optimizacion como destilacion, LoRA fusionada o ajuste de schedulers.

El contenido de la ficha del autor es claramente plantillado: incluye un parrafo con el literal `<p>1</p>` y la fila "Trigger words: 1" sin nombrar la palabra de activacion. Esto sugiere un proceso de publicacion automatizado por parte de la plataforma y refuerza la recomendacion de tratar la documentacion como incompleta. Cualquier afirmacion sobre arquitectura interna, capas, atencion o metodos de entrenamiento seria especulativa y no se incluye aqui.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) mediante prompts, en el contexto de un checkpoint cargado en ComfyUI.
- Generacion image-to-image y trabajos de refinado o upscaling dentro de un flujo de ComfyUI, siempre que se usen los nodos correspondientes; la model card no detalla estos flujos.
- Produccion de imagenes con un estilo "3DCG" (render 3D por ordenador), segun el propio nombre del modelo.
- Afinado posterior: al ser un checkpoint completo en safetensors, puede servir como base para entrenar LoRA o hacer ajustes finos adicionales.
- Ejecucion en la nube mediante la plataforma RunningHub, segun los enlaces de la model card, y en local mediante ComfyUI.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modo "thinking": no es un modelo de lenguaje.
- Capacidades multilingues: no disponible. No se documenta el idioma de los prompts ni el vocabulario del text encoder.
- Vision de entrada (image understanding): no se documenta; el modelo es de generacion, no de descripcion de imagenes.

## Casos de uso

- Ilustracion con estetica 3DCG: generacion de ilustraciones y personajes con acabado de render 3D para portfolios, redes sociales o proyectos personales, cargando el checkpoint en ComfyUI y ajustando el prompt y el sampler.
- Concept art para videojuegos: produccion rapida de bocetos de entornos, criaturas o props con aspecto de render 3D, que despues se refinan manualmente en herramientas de modelado o pintura.
- Generacion de assets de referencia en pipelines de arte: crear variaciones de un mismo diseno para explorar direcciones visuales antes de comprometer horas de modelado o texturizado.
- Prototipado de material grafico para producto: renders estilizados de objetos o packaging para presentaciones internas, aprovechando que el modelo produce una estetica CG coherente con material de marketing preliminar.
- Base para entrenamiento de LoRA de estilo propio: al ser un checkpoint completo, un equipo puede usarlo como punto de partida para entrenar adaptadores especificos de marca o de personaje con su propio dataset.
- Generacion por lotes en la nube: uso de la API de RunningHub para producir imagenes de forma programatica sin mantener GPU local, segun los enlaces de API incluidos en la model card.
- Pruebas comparativas de estilos 3DCG: evaluacion frente a otros checkpoints de la misma familia (IL-XL y derivados) para decidir cual se integra en un flujo de produccion.
- Creacion de material para impresion o merchandising en baja resolucion de partida: generacion de composiciones que despues se reescalan y se retocan, siempre que los terminos de la licencia lo permitan (extremo no confirmado).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye FID, CLIP score, evaluaciones humanas ni comparativas cuantitativas. Los resultados de la busqueda web proporcionada no guardan relacion con el modelo: son preguntas del foro Ask Ubuntu sobre descarga de video y paquetes en Ubuntu 14.04, por lo que no aportan ningun dato de rendimiento utilizable.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 6617 MiB (unos 6,94 GB) en el formato distribuido. Para inferencia en precision de 16 bits hay que sumar el text encoder, el VAE y las activaciones, por lo que un minimo practico de 8 GB de VRAM es ajustado y 12 GB o mas resulta recomendable. Estas cifras son estimaciones derivadas del tamano del archivo, no datos publicados por el autor.
- GPU de consumo: tarjetas con 12 GB (por ejemplo RTX 3060 12 GB, RTX 4070) permiten ejecucion local; modelos con 16 GB o 24 GB (RTX 4080, RTX 4090) dan mayor margen para resoluciones altas y lotes mayores.
- GPU profesionales: A100, H100 o L40S funcionan sin problema, aunque estan sobredimensionadas para un checkpoint de este tamano; su interes estaria en servir muchas peticiones concurrentes.
- Opciones de despliegue: ComfyUI es la plataforma indicada explicitamente por las etiquetas del repositorio. Tambien se puede ejecutar en la nube a traves de RunningHub. Otros entornos (diffusers, Automatic1111, Forge, nodos ComfyUI) no se mencionan en la informacion disponible.
- Latencia y throughput: no disponible. No se publican tiempos por imagen, pasos de muestreo recomendados ni resultados de rendimiento.

## Comparativa con modelos similares

No hay datos verificados de benchmarks ni de especificaciones tecnicas de alternativas en la informacion proporcionada, por lo que la comparativa se limita a los elementos trazables de origen y distribucion.

| Modelo | Origen | Formato y tamano | Licencia | Disponibilidad |
|---|---|---|---|---|
| rh-nova-3dcg-xl-checkpoint | RunningHubAI (autor @百迟), a partir de IL-XL | safetensors, 6617 MiB | no disponible | Hugging Face, ComfyUI, RunningHub |
| Nova 3DCG XL (modelo original) | Publicado en Civitai por el autor original | no disponible en la informacion proporcionada | no disponible | Civitai (modelo 715287) |
| IL-XL (modelo base declarado) | Terceros, no identificados en la model card | no disponible | no disponible | no disponible |

No se dispone de comparativas de parametros, contexto (no aplicable) ni rendimiento con otros checkpoints 3DCG de la misma categoria.

## Limitaciones y advertencias

- Documentacion muy incompleta: la model card no especifica arquitectura, parametros, resolucion nativa, sampler recomendado ni palabra de activacion, pese a mencionar que existe una.
- Licencia no explicitada: el repositorio remite a la licencia del proyecto original o del modelo base, sin concretarla. Antes de cualquier uso comercial hay que verificar los terminos en Civitai y en la licencia de IL-XL.
- Riesgo de contenido sesgado o inapropiado: al ser un ajuste fino de estilo sin filtros documentados, la salida depende del dataset de entrenamiento, no descrito, y puede reproducir sesgos de representacion (genero, etnia, corporalidad) presentes en el.
- Alucinacion visual: como cualquier modelo de difusion, puede generar anatomia incorrecta, texto ilegible, perspectivas incoherentes y objetos que se fusionan o desaparecen, especialmente en escenas con muchas entidades.
- Ausencia de garantias de calidad: cero descargas y cero likes en el momento de la consulta, sin evaluaciones independientes publicadas.
- Trazabilidad limitada: el repositorio es una redistribucion de un modelo publicado en Civitai; conviene contrastar que la version `ilV90` del archivo coincide con la version `2744564` referenciada en el enlace original.
- Uso en produccion: no hay datos de latencia, coste por imagen ni estabilidad entre versiones, por lo que no se recomienda integrarlo en un pipeline critico sin una evaluacion previa con el dataset propio.
- Resultados de busqueda web no pertinentes: las referencias recuperadas no tratan sobre el modelo, de modo que no aportan validacion externa alguna.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-nova-3dcg-xl-checkpoint
- Modelo original en Civitai (Nova 3DCG XL, version 2744564): https://civitai.com/models/715287/nova-3dcg-xl?modelVersionId=2744564
- Modelo en RunningHub: https://www.runninghub.ai/model/public/2029930398809071618
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/1975220411615117314
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio de China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Pagina de ejemplo de la API (Seedance 2.5): https://www.runninghub.ai/call-api/api-detail/2133100000000700025
