# Infini-Srr/GonzaLomo-Krea2-v4-BF16

## Resumen

GonzaLomo Krea 2 v4.0 es un UNET de difusion para generacion y edicion de imagenes, publicado en HuggingFace por el usuario Infini-Srr como espejo del repositorio oficial de RunningHub (`rh-gonzalomo-krea-2-v4.0-krea-2-bf16-unet`). Se trata de un fine-tune del modelo Krea 2 de Krea AI, orientado a la exploracion creativa y estilistica, empaquetado en un unico fichero `safetensors` en precision BF16 de 24.452 MiB (aproximadamente 24 GB) para su uso en ComfyUI y en la plataforma RunningHub.

El modelo se distribuye como UNET aislado, no como checkpoint todo-en-uno: requiere un VAE y un text encoder externos para funcionar, y en el ecosistema Civitai se documentan variantes FP8 y un "checkpoint" de 17 GB que incluye los componentes adicionales. El tag de pipeline es `image-text-to-image`, lo que indica que admite tanto generacion desde prompt como edicion de imagen de entrada; la model card tambien lo etiqueta como "UNET (image edit)".

Su relevancia es acotada pero concreta: es una de las primeras versiones afinadas de Krea 2 disponibles como pesos abiertos en HuggingFace, con 0 descargas y 0 likes en el momento de la consulta, y con la licencia sin especificar de forma explicita, lo que condiciona su adopcion en produccion. No se han publicado parametros oficiales, datos de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNET de difusion para image-text-to-image; fine-tune de Krea 2 (Krea AI). Los ficheros asociados en Civitai incluyen `qwen_image-vae.safetensors`, lo que sugiere una arquitectura derivada de la familia Qwen-Image, aunque no se confirma en la model card |
| Parametros totales | No disponible oficialmente; estimacion de ~12.200 M a partir del tamano del fichero BF16 (24.452 MiB / 2 bytes por parametro) |
| Longitud de contexto | No aplica / no disponible (modelo de difusion; no se documenta resolucion nativa ni longitud de prompt) |
| Tipos de cuantizacion | BF16 en este repositorio; se mencionan variantes FP8 y una opcion de 12 GB (solo UNET) en Civitai |
| Idiomas soportados | No disponibles. Los prompts de difusion suelen funcionar mejor en ingles; no hay declaracion oficial |
| Licencia | No disponible. La model card indica que el copyright permanece con el autor y que se aplica la licencia del proyecto original o upstream |
| Formato de pesos | `safetensors` (un unico fichero `gonzalomoKrea2_v40.safetensors`, 24.452 MiB) |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente los pesos del UNET en BF16, sin VAE, sin text encoder y sin scheduler. El pipeline declarado es `image-text-to-image`, y la model card clasifica el modelo como "UNET (image edit)", lo que encaja con un modelo de difusion condicionado por texto e imagen que puede operar en modo generacion pura o en modo edicion sobre una imagen de referencia. El autor del fine-tune es RunningHub-@LEUL, que publica el modelo original en su plataforma; Infini-Srr actua como espejo en HuggingFace.

No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de preferencia (RLHF/DPO), que por otra parte no son habituales en difusion. La unica informacion sobre el origen es "Finetuned from: krea2". El proyecto oficial `krea-ai/krea-2` en GitHub describe Krea 2 como un modelo de imagen entrenado desde cero y centrado en exploracion creativa y estilistica, con variantes RAW y TURBO; este fine-tune no documenta sobre cual de ellas se construyo. Tampoco se detalla ninguna innovacion tecnica especifica (atencion lineal, decodificacion especulativa, destilacion de pasos, etc.).

## Capacidades

- Generacion de imagenes a partir de prompt de texto (text-to-image) usando el UNET como componente de difusion en ComfyUI.
- Edicion de imagen guiada por texto (image-text-to-image): el tag de pipeline y la clasificacion "image edit" implican soporte de transformaciones sobre una imagen de entrada.
- Exploracion de estilos creativos: el modelo base Krea 2 esta descrito por Krea AI como orientado a "creative and stylistic exploration", y el fine-tune hereda ese sesgo.
- Integracion nativa con ComfyUI mediante el nodo de carga de UNET; requiere VAE y text encoder compatibles.
- Ejecucion en la plataforma RunningHub y a traves de su API, segun la model card.
- Entrenamiento posterior y uso como base para LoRAs o nuevos fine-tunes, al distribuirse como UNET aislado.
- No hay evidencia de soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision de entrada para descripcion (mas alla de la condicion de imagen en edicion), audio ni modo "thinking".

## Casos de uso

- Generacion de concept art en produccion de videojuegos: el UNET BF16 se carga en ComfyUI y se usa con prompts de estilo consistentes para producir variaciones de personajes y entornos; el formato UNET aislado permite intercambiarlo con otros fine-tunes del mismo pipeline sin rehacer el grafo.
- Edicion de imagenes de producto para e-commerce: al soportar image-text-to-image, se puede partir de una fotografia base y aplicar instrucciones de texto para cambios de fondo, iluminacion o ambientacion, manteniendo la composicion original.
- Iteracion de estilo sobre un artefacto visual existente: flujos de trabajo donde el artista introduce un boceto o render y el modelo lo reinterpreta segun una direccion estilistica, aprovechando el enfoque de "stylistic exploration" del modelo base.
- Automatizacion de pipelines graficos via API: la model card publica enlaces a la API de RunningHub, lo que permite invocar el modelo desde servicios backend sin gestionar GPU propia, util para generar lotes de imagenes en un CMS o generador de contenidos.
- Creacion de datasets sinteticos: generacion por lotes de imagenes anotadas con un estilo controlado para entrenar clasificadores o detectores, con la ventaja de que el UNET BF16 produce material de mayor fidelidad que las variantes cuantizadas.
- Base para fine-tuning especifico de dominio: al ser un unico fichero `safetensors` de 24 GB, se puede usar como inicializacion en entrenamientos con LoRA o DreamBooth sobre un estilo corporativo o una marca concreta.
- Prototipado rapido de ideas visuales en equipos de diseno: despliegue local en ComfyUI sobre una GPU de 24 GB o superior con la variante FP8 de 11,9 GB para estaciones de trabajo con menos VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, evaluaciones humanas de preferencia) ni comparaciones con el modelo base Krea 2 u otros modelos de imagen.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: superior a 24 GB solo para los pesos del UNET (24.452 MiB), mas el VAE y el text encoder, por lo que en la practica se necesitan entre 26 y 30 GB de VRAM para una ejecucion completa en GPU sin offloading.
- VRAM estimada para la variante FP8 de 11,9 GB documentada en Civitai: en torno a 13-16 GB contando el resto de componentes, lo que la hace viable en GPUs de consumo alto.
- GPUs recomendadas para BF16: A100 40 GB u 80 GB, H100, RTX 6000 Ada 48 GB, L40S 48 GB.
- GPUs viables con la variante FP8: RTX 4090 24 GB, RTX 4080 Super 16 GB (con margen ajustado), RTX 3090 24 GB.
- Cabe en GPU de consumo: si, tanto la variante FP8 como la BF16 con offloading parcial a RAM del sistema; la BF16 pura no cabe en GPUs de 16 GB ni de 24 GB sin tecnicas de gestion de memoria.
- Opciones de despliegue: ComfyUI (via principal, segun los tags del repositorio), RunningHub en la nube y su API HTTP. No se documenta soporte de vLLM ni TGI, que no aplican a modelos de difusion; llama.cpp/Ollama tampoco son el entorno natural para un UNET de esta familia.
- Latencia y throughput: no disponibles. No se publican tiempos por imagen, numero de pasos recomendado ni configuracion de sampler.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GonzaLomo Krea 2 v4.0 BF16 (este) | ~12.200 M (estimado por tamano de fichero) | No documentado | Sin benchmarks publicados | No disponible (sujeta a la del proyecto original) | HuggingFace, 0 descargas; Civitai; RunningHub |
| Krea 2 RAW (Krea AI, oficial) | No disponible | No documentado | Sin datos en la informacion proporcionada | No disponible en la informacion proporcionada | HuggingFace (repo oficial de Krea AI) y GitHub `krea-ai/krea-2` |
| Krea 2 TURBO (Krea AI, oficial) | No disponible | No documentado | Sin datos en la informacion proporcionada | No disponible en la informacion proporcionada | HuggingFace (repo oficial de Krea AI) |
| GonzaLomo Krea 2 v4.0 FP8 / checkpoint 17 GB (Civitai) | Mismo modelo base cuantizado | No documentado | No comparable directamente por cuantizacion | No disponible | Civitai, con 710 mirrors activos |

No se dispone de datos de terceros (Qwen-Image, FLUX u otros) en la informacion proporcionada, por lo que no se incluye una comparacion cuantitativa con ellos.

## Limitaciones y advertencias

- Licencia no especificada: la model card delega en la licencia del proyecto original y mantiene el copyright en el autor. Sin una licencia explicita, no se puede asumir permiso de uso comercial; es imprescindible verificar la licencia de Krea 2 antes de cualquier despliegue en produccion.
- Ausencia total de benchmarks y de datos de entrenamiento: no hay forma de verificar mejoras respecto al Krea 2 base ni de estimar la calidad frente a alternativas.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que existan informes de terceros sobre su comportamiento real.
- Riesgo de alucinacion visual: como cualquier modelo de difusion, puede generar detalles anatomicos, texto y geometrias incoherentes, especialmente en manos, tipografia y estructuras repetitivas. No se documenta ninguna mitigacion.
- Sesgos del dataset del modelo base: al no publicarse la composicion del dataset, no se puede evaluar el sesgo demografico, cultural o estilistico; cabe esperar los sesgos del corpus de Krea 2.
- Sin informacion sobre idiomas: no se confirma calidad de prompts en castellano; la practica habitual en modelos de esta familia es un rendimiento superior en ingles.
- Dependencia de componentes externos: al ser solo UNET, la reproducibilidad depende de usar el VAE y el text encoder correctos; un emparejamiento incorrecto degrada la salida sin mensaje de error claro.
- Resolucion nativa y numero de pasos recomendado no documentados: hay que recurrir a la seccion "About This Version" de Civitai para obtener ajustes recomendados.
- Tamano del repositorio de 25,6 GB: coste de almacenamiento y de ancho de banda relevante para equipos con infraestructura limitada.
- Fecha de creacion del repositorio registrada como 2026-10-20, con actualizacion practicamente simultanea, lo que sugiere una publicacion automatizada sin curacion posterior.

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/Infini-Srr/GonzaLomo-Krea2-v4-BF16
- HuggingFace (repositorio original de RunningHub): https://huggingface.co/RunningHubAI/rh-gonzalomo-krea-2-v4.0-krea-2-bf16-unet
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2091727916681207810
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/1945917948739350530
- Civitai (GonzaLomo Krea 2 v4.0): https://civitai.com/models/2761943/gonzalomo-krea-2
- CivArchive (ficheros y version): https://civarchive.com/models/2761943?modelVersionId=3245099
- GitHub oficial de Krea 2 (Krea AI): https://github.com/krea-ai/krea-2
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- RunningHub (plataforma): https://www.runninghub.ai
