# RunningHubAI/rh-sphincter-dilatation-lora

## Resumen

rh-sphincter-dilatation-lora es un adaptador de bajo rango (LoRA) para edición de imagen publicado por RunningHubAI, la cuenta de Hugging Face de la plataforma RunningHub. Se distribuye como un único fichero safetensors de 218 MiB (`spread_anal_krea2_3282804_epoch_10.safetensors`) y su `pipeline_tag` es `image-text-to-image`, lo que indica que se aplica sobre un modelo base de difusión para modificar imágenes a partir de una instrucción textual. Según la propia model card, el adaptador está afinado a partir de «krea2» y su origen es una publicación en Civitai, plataforma especializada en checkpoints y LoRA de contenido para adultos.

El modelo no es un modelo de lenguaje ni un modelo fundacional: es un ajuste fino de bajo rango orientado explícitamente a contenido para adultos (NSFW), a juzgar por su nombre y por la ficha original enlazada. No se publican datos de entrenamiento, número de pasos, composición del dataset ni parámetros del adaptador, y la model card se limita a describir el fichero y a enlazar la plataforma de RunningHub para su ejecución en la nube.

Su relevancia es limitada fuera del ecosistema ComfyUI/RunningHub: el repositorio acumula 0 descargas y 0 «likes» en el momento de la consulta, no declara licencia explícita y no incluye evaluación alguna. Para un desarrollador o investigador, su interés principal es como ejemplo del flujo de publicación automatizada de LoRA en Hugging Face por parte de plataformas de generación de imagen, y como material de referencia para tareas de moderación de contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base de difusion «krea2»; arquitectura del base no disponible |
| Parametros totales | no disponible (no se declara el rango ni el numero de parametros del adaptador) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen); no disponible en terminos de longitud de prompt maxima |
| Tipos de cuantizacion | no disponible (el unico fichero publicado es safetensors de 218 MiB) |
| Idiomas soportados | no disponible (la model card esta en ingles y chino; no se especifican idiomas de prompt) |
| Licencia | no disponible; la model card indica que el copyright permanece en el autor y remite a la licencia del proyecto original en Civitai |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,2 GB |
| Ficheros | `spread_anal_krea2_3282804_epoch_10.safetensors` (218 MiB) |
| Plataformas declaradas | ComfyUI, RunningHub, Hugging Face |
| Fecha de creacion | 2026-09-30 |
| Ultima actualizacion | 2026-09-30 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del adaptador. Por el tipo de fichero y el `pipeline_tag`, se trata de un LoRA de edicion de imagen que se inyecta en un modelo base de difusion denominado «krea2» en la model card. El nombre del fichero incluye `epoch_10`, lo que sugiere un entrenamiento supervisado de 10 epocas sobre un dataset no especificado, y el sufijo `3282804` coincide con el identificador de version del proyecto original en Civitai. No se indica el rango del LoRA, las dimensiones de las matrices, la tasa de aprendizaje, el optimizador, el numero de imagenes de entrenamiento ni si hubo etapas de refinamiento posteriores (por ejemplo, ajuste con preferencias humanas).

Tampoco se documenta el modelo base mas alla del nombre «krea2»: se desconoce su arquitectura (probablemente un transformer de difusion, dado el ecosistema actual), su numero de parametros, su resolucion nativa y su licencia, que condicionaria el uso del LoRA. La model card se limita a enlazar el proyecto original y a promocionar la infraestructura de entrenamiento y despliegue de RunningHub. No hay informacion sobre innovaciones tecnicas, tecnicas de muestreo, decodificacion especulativa ni metodos de aceleracion.

## Capacidades

- Edicion de imagen guiada por texto sobre el modelo base «krea2», segun el `pipeline_tag` `image-text-to-image`.
- Aplicacion como adaptador en flujos de trabajo de ComfyUI mediante carga de LoRA sobre el checkpoint base.
- Ejecucion en la nube a traves de la plataforma RunningHub y de su API, sin necesidad de hardware local.
- Orientacion explicita a contenido para adultos (NSFW), deducida del nombre del modelo y del proyecto original enlazado en Civitai.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, agentes, audio ni modo de pensamiento. No aplica.
- No se documenta soporte multilingue de prompts ni control fino de la edicion (mascaras, inpainting, control de pose, etc.).

## Casos de uso

- Moderacion de contenido en plataformas UGC: usar el adaptador para generar un corpus de referencia de imagenes etiquetadas como no permitidas y entrenar o validar clasificadores automaticos de contenido para adultos, extendiendo la cobertura a un nicho poco representado en los datasets publicos.
- Red-teaming de filtros de seguridad: incorporar el LoRA a un pipeline ComfyUI controlado para comprobar si los sistemas de deteccion de la plataforma (hashes, clasificadores, palabras clave) bloquean correctamente las salidas antes de su publicacion.
- Investigacion sobre sesgos y realismo en modelos de difusion: analizar como un adaptador de bajo rango de 218 MiB desplaza la distribucion de salida del modelo base y con que facilidad se puede especializar un checkpoint generalista hacia un dominio concreto con un coste de entrenamiento bajo.
- Pruebas de estres de infraestructura de inferencia: medir el coste de cargar y descargar adaptadores LoRA de 218 MiB en servidores multiinquilino (gestion de VRAM, cacheo de pesos, conmutacion entre adaptadores) sin necesidad de ejecutar el flujo completo de generacion.
- Catalogacion y auditoria de ecosistemas LoRA: usar el repositorio como caso de estudio del proceso de publicacion automatizada de adaptadores en Hugging Face por parte de plataformas como RunningHub, incluyendo la trazabilidad entre Hugging Face, Civitai y la plataforma de origen.
- Despliegue en entornos cerrados con verificación de edad: en plataformas de contenido para adultos que ya operan con control de acceso, el LoRA se puede cargar sobre el base krea2 para tareas de edicion de imagen dentro de un flujo ComfyUI con registro de auditoria.
- Docencia sobre seguridad en IA generativa: ilustrar en un aula o taller como un adaptador pequeno y sin evaluacion publica puede alterar drasticamente el comportamiento de un modelo base, y que implicaciones tiene para las politicas de uso aceptable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, similitud con prompts, evaluacion humana) ni comparaciones con otros adaptadores. Tampoco hay datos de latencia o throughput. Cualquier cifra de rendimiento que se cite para este repositorio seria una invencion y no debe utilizarse.

| Benchmark | Resultado |
|---|---|
| FID | no disponible |
| CLIP score | no disponible |
| Evaluacion humana | no disponible |
| Latencia / throughput | no disponible |

## Requisitos de hardware

- El consumo de VRAM depende integramente del modelo base «krea2», que no esta documentado. Como referencia orientativa para checkpoints de difusion de imagen de la generacion actual (12B-24B parametros), la inferencia en fp16 suele requerir entre 16 y 32 GB de VRAM; en cuantizaciones de 8 bits, entre 8 y 16 GB. Estas cifras son estimaciones genericas y no proceden de la informacion proporcionada.
- El adaptador en si ocupa 218 MiB, un coste marginal frente al modelo base; se carga en memoria junto con el checkpoint y no requiere hardware adicional.
- GPU de datacenter recomendadas para el base, segun el rango anterior: A100 80 GB, H100 80 GB o L40S 48 GB, especialmente si se sirven varias peticiones concurrentes.
- GPU de consumo: con cuantizacion agresiva, el base podria caber en RTX 4090 (24 GB), RTX 4080 (16 GB) o RTX 3090 (24 GB); en tarjetas de 8-12 GB es probable que sea necesario reducir resolucion o usar cuantizacion de 4 bits. No hay confirmacion por parte del autor.
- Opciones de despliegue declaradas: ComfyUI (local o en la nube), plataforma RunningHub y su API. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay informacion publicada que permita una comparacion rigurosa. Los unicos referentes citados en la busqueda son otros repositorios de la misma organizacion (por ejemplo, `RunningHubAI/rh-hf-e2e-t4-20260918105654-lora` y adaptadores para MiniMax H3), pero no se dispone de sus especificaciones, licencias ni metricas.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-sphincter-dilatation-lora | LoRA de edicion de imagen sobre krea2 | no disponible (218 MiB en disco) | no aplica | no disponible | Hugging Face, RunningHub |
| rh-hf-e2e-t4-20260918105654-lora | LoRA (misma organizacion) | no disponible | no aplica | no disponible | Hugging Face |
| Modelos comparables de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Contenido para adultos: tanto el nombre del modelo como el proyecto original en Civitai apuntan a un adaptador NSFW explicito. Su uso debe restringirse a plataformas con verificacion de edad y a entornos de investigacion o moderacion con controles adecuados.
- Licencia indefinida: la model card no incluye texto de licencia y remite a la licencia del proyecto original en Civitai. Sin esa licencia no puede determinarse si el uso comercial esta permitido. Tratarlo como no apto para produccion comercial hasta verificarlo.
- Atribucion de derechos ambigua: la plataforma declara publicar «en nombre del autor» y que el copyright permanece en el autor. No hay cesion de derechos ni terminos de uso claros para terceros.
- Riesgo de alucinacion anatomica: como cualquier LoRA de difusion, puede generar resultados anatomicamente incoherentes, artefactos y deformaciones, especialmente en manos, extremidades y zonas de alto detalle.
- Sin evaluacion: no hay benchmarks, evaluacion humana ni analisis de sesgos. No se puede estimar su calidad relativa frente a otros adaptadores similares.
- Sin datos de entrenamiento: se desconoce la composicion del dataset, si contiene material no consentido o con derechos de terceros, y si existe riesgo de reproduccion de identidades reales.
- Dependencia del modelo base: el rendimiento y la propia legalidad del uso dependen de la licencia y disponibilidad de «krea2», no documentadas en este repositorio.
- Dependencia de prompt en ingles: no se declaran idiomas soportados; muchos LoRA de este tipo se entrenan con etiquetas en ingles y pierden fidelidad con prompts en castellano.
- Trazabilidad escasa: 0 descargas, 0 likes y fechas de creacion y actualizacion separadas por un minuto sugieren una publicacion automatizada, sin mantenimiento posterior ni canal de soporte.
- Riesgo de moderacion en despliegue: integrar este adaptador en un servicio publico puede infringir las politicas de uso de los proveedores de infraestructura (cloud, CDN, pasarelas de pago) y de la propia plataforma de destino.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-sphincter-dilatation-lora
- Proyecto original en RunningHub: https://www.runninghub.ai/model/public/2094451375349813249
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/2041030036219498497
- Proyecto original en Civitai: https://civitai.red/models/2904324/spread-anal?modelVersionId=3284349
- Plataforma RunningHub: https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Plugins de ComfyUI de RunningHub: https://github.com/HM-RunningHub/ComfyUI_RH_LLM_API
- Perfil de la organizacion en Hugging Face: https://huggingface.co/RunningHubAI
