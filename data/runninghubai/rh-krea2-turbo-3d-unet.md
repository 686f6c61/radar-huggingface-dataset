# RunningHubAI/rh-krea2-turbo-3d-unet

## Resumen

rh-krea2-turbo-3d-unet es un fichero de pesos en formato safetensors para el componente UNET de un modelo de difusion orientado a edicion de imagen (image-text-to-image), publicado por RunningHubAI en Hugging Face. No se trata de un modelo de lenguaje: es la parte UNET de un pipeline de difusion pensado para cargarse en ComfyUI, en la plataforma RunningHub o directamente desde Hugging Face. El autor original que se atribuye la creacion es el usuario "空即是色", y RunningHub actua como plataforma de publicacion en su nombre.

El modelo se presenta como un finetune de "krea2", segun la propia model card, y el unico fichero del repositorio se llama `fubuwaMIX3DREALKREA2_v2.safetensors`, con un tamano de 13147 MiB (aproximadamente 13,8 GB). La etiqueta "3d" y el nombre del fichero sugieren un enfasis en resultados de aspecto realista o volumetrico, pero la model card no aporta detalles tecnicos al respecto.

La relevancia de esta ficha es limitada por la escasez de informacion publicada: no hay datos de arquitectura interna, parametros, dataset de entrenamiento, licencia explicita ni benchmarks. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no se ha encontrado informacion adicional en la busqueda web que permita verificar o ampliar los datos de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNET de difusion (segun etiqueta "unet" y pipeline image-text-to-image); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusion, no de lenguaje) |
| Tipos de cuantizacion | no disponible; se distribuye un unico fichero safetensors sin variantes de cuantizacion |
| Idiomas soportados | no disponible (los prompts de texto dependen del codificador de texto del pipeline, no especificado) |
| Licencia | no disponible; la model card indica que el copyright permanece con el autor y remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`fubuwaMIX3DREALKREA2_v2.safetensors`, 13147 MiB) |

## Arquitectura y entrenamiento

La informacion disponible solo permite afirmar que se trata de pesos UNET, un componente habitual en los pipelines de difusion latente para generacion y edicion de imagen. La model card lo clasifica como "Model Type: UNET (image edit)" y el pipeline declarado en Hugging Face es image-text-to-image. No se especifica si la arquitectura interna es del tipo DiT (Diffusion Transformer) o un UNET convolucional clasico, ni el numero de bloques, canales o capas de atencion.

El modelo se describe como un finetune de "krea2", sin detallar el numero de tokens o pasos de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de ajuste por preferencias (RLHF, DPO) o destilacion por pasos (el sufijo "turbo" en el nombre podria apuntar a un modelo destilado para inferencia con pocos pasos, pero esto no se confirma en la informacion proporcionada). El fichero distribuido tiene 13147 MiB; a titulo orientativo, ese tamano corresponderia a un orden de magnitud de miles de millones de parametros si los pesos estuvieran en precision fp16, o al doble si estuvieran en fp8, pero no hay confirmacion de la precision de almacenamiento ni del recuento real de parametros.

## Capacidades

- Edicion de imagen guiada por texto: el pipeline declarado es image-text-to-image, por lo que el modelo esta pensado para transformar una imagen de entrada a partir de una instruccion textual.
- Integracion con ComfyUI: incluye la etiqueta "comfyui", lo que indica que los pesos estan preparados para cargarse como nodo UNET dentro de un flujo de trabajo de ComfyUI.
- Ejecucion en la plataforma RunningHub: la model card ofrece enlaces para cargar el modelo en RunningHub, tanto en la version internacional como en la de China.
- Finetune sobre krea2: hereda las capacidades del modelo base del que deriva, aunque no se detallan cuales son.
- Soporte de tool calling o function calling: no aplicable (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplicable.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponibles; la unica capacidad declarada es la edicion de imagen.

## Casos de uso

- Edicion fotografica asistida dentro de ComfyUI: el usuario carga `fubuwaMIX3DREALKREA2_v2.safetensors` como nodo UNET y aplica instrucciones textuales para modificar una imagen de partida (por ejemplo, cambiar iluminacion, estilo o detalles de una escena).
- Retoque de producto en comercio electronico: generar variaciones de una misma fotografia de producto (fondos, ambientacion, angulos) manteniendo la coherencia visual, siempre que el pipeline incluya un modelo de edicion adecuado.
- Previsualizacion de conceptos para diseno grafico: producir borradores rapidos de una idea visual a partir de una imagen de referencia y una descripcion, antes de pasar a herramientas de produccion.
- Automatizacion de pipelines de contenido visual: integracion del UNET en flujos automatizados de ComfyUI que generan o editan imagenes por lotes.
- Creacion de material para redes sociales: adaptar una imagen base a distintos formatos o esteticas mediante prompts de edicion.
- Prototipado en la nube sin hardware local: uso del modelo a traves de la API de RunningHub, lo que evita disponer de una GPU propia con suficiente VRAM.
- Experimentacion e investigacion en difusion: servir como punto de partida para comparar finetunes derivados de krea2 en tareas de edicion de imagen, si el usuario dispone del pipeline base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia, el fichero UNET ocupa 13147 MiB, por lo que se necesita al menos esa cantidad de VRAM para cargarlo sin cuantizar, mas la memoria adicional para el resto del pipeline (codificador de texto, VAE, latentes y buffers de atencion).
- GPU recomendadas: no especificadas por el autor. Por el tamano del fichero, una GPU con 24 GB de VRAM (por ejemplo, RTX 3090 o RTX 4090) seria el minimo razonable para cargar el UNET sin cuantizar, asumiendo que el resto de componentes encajen en memoria.
- Viabilidad en GPU de consumo: probablemente ajustado en tarjetas de 24 GB y no viable en tarjetas de 8-16 GB sin tecnicas de offloading o cuantizacion, que el repositorio no proporciona.
- Opciones de despliegue: ComfyUI (declarado en las etiquetas), la plataforma RunningHub y su API, y Hugging Face como origen de descarga. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos comparables en la informacion proporcionada. El propio autor indica que el modelo deriva de "krea2", pero no se detallan las caracteristicas de ese modelo base ni de alternativas de la misma categoria (por ejemplo, otros UNET de edicion de imagen para ComfyUI). Por tanto, la comparacion de parametros, contexto, rendimiento, licencia y disponibilidad se marca como no disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-krea2-turbo-3d-unet | no disponible | no aplica | no disponible | no disponible | Hugging Face (0 descargas registradas) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia de licencia explicita: la model card remite a la licencia del proyecto original o upstream, sin concretarla. Esto impide confirmar si se permite el uso comercial y bajo que condiciones.
- Falta de documentacion tecnica: no se publican parametros, arquitectura interna, dataset ni proceso de entrenamiento, lo que dificulta evaluar el modelo con rigor.
- Sin benchmarks: no hay resultados de evaluacion que permitan estimar la calidad de la edicion de imagen frente a alternativas.
- Riesgo de alucinacion visual: como modelo de difusion, puede introducir artefactos, alterar elementos no solicitados o producir resultados inconsistentes con la imagen de entrada; no se documentan mitigaciones.
- Dependencia del pipeline: al ser solo el componente UNET, su comportamiento final depende del codificador de texto, el VAE y el sampler empleados en ComfyUI o RunningHub, que no se especifican.
- Idiomas no declarados: se desconoce que lenguas admiten los prompts de texto en el pipeline asociado.
- Trazabilidad limitada: el autor original figura como un usuario de la plataforma, y RunningHub publica en su nombre, sin repositorio de codigo ni paper asociado.
- Resultados de busqueda web no relevantes: las consultas realizadas no devolvieron informacion tecnica sobre el modelo, por lo que todos los datos proceden de la model card de Hugging Face.
- Fechas de creacion y actualizacion registradas como 2026-10-03, sin verificacion adicional.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-krea2-turbo-3d-unet
- README en chino: https://huggingface.co/RunningHubAI/rh-krea2-turbo-3d-unet/blob/main/README_cn.md
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio de China): https://www.runninghub.cn
- Pagina original del modelo en RunningHub: https://www.runninghub.ai/model/public/2106300008919310338
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/2085048586185814018
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Llamada a la API de RunningHub: https://www.runninghub.ai/call-api
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Detalle de la API de Seedance 2.5 en RunningHub: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
