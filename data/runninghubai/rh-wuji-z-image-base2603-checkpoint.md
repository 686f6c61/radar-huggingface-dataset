# RunningHubAI/rh-wuji-z-image-base2603-checkpoint

## Resumen

rh-wuji-z-image-base2603-checkpoint es un checkpoint de generacion de imagenes a partir de texto (text-to-image) publicado en Hugging Face por RunningHubAI en nombre del autor «迎风» (RunningHub). Se trata de un ajuste fino (finetuned from) del modelo base Z-image-base, etiquetado como «多风格» (multi-estilo) y apodado «黑兽» en la documentacion original. El objetivo es ofrecer un unico archivo de pesos que genere imagenes coherentes en varias estetticas con muy pocos pasos de muestreo (6 a 12), lo que reduce el tiempo de inferencia frente a los flujos habituales de 20-30 pasos.

El repositorio contiene un unico archivo `WuJi_Z-image-base多风格2603_.safetensors` de 19 572 MiB (aproximadamente 19,1 GiB) y esta pensado para cargarse directamente en ComfyUI, en la plataforma RunningHub o en cualquier entorno compatible con checkpoints de difusion. Segun la model card, el autor fusiona un VAE identificado como `UltraFlux-v1_model.safetensors` y un codificador de texto CLIP basado en `qwen_3_4b.safetensors`, con muestreador recomendado `euler` y scheduler `simple`.

Su relevancia actual es limitada y hay que ser prudente: el modelo acumula 0 descargas y 1 like en el momento de la consulta, no declara licencia concreta, no publica idiomas soportados ni resultados de benchmarks, y no detalla arquitectura ni composicion del dataset de entrenamiento. Es, por tanto, un checkpoint de la comunidad orientado a usuarios de ComfyUI que quieran probar una variante multi-estilo sobre Z-image-base, no un modelo con documentacion tecnica verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoint de difusion text-to-image basado en Z-image-base; el autor no especifica si es DiT, UNet o hibrida) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se documenta que sea MoE) |
| Longitud de contexto | no disponible (no se documenta limite de tokens para el prompt) |
| Tipos de cuantizacion | no disponible; solo se publica un archivo safetensors sin variantes GGUF, FP8 o INT4 documentadas |
| Idiomas soportados | no disponible (la model card esta en chino e ingles, pero no declara idiomas de prompt) |
| Licencia | no disponible; la model card indica que los derechos permanecen en el autor y remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`WuJi_Z-image-base多风格2603_.safetensors`, 19 572 MiB) |
| Tamano del repositorio | 20,5 GB |
| Pipeline declarado | text-to-image |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face |
| Componentes fusionados | VAE `UltraFlux-v1_model.safetensors`; CLIP `qwen_3_4b.safetensors` |
| Muestreador recomendado | euler + simple |
| Pasos recomendados | 6 a 12 |
| Fecha de publicacion | 25 de septiembre de 2026 (segun metadatos del repositorio) |
| Ultima actualizacion | 25 de septiembre de 2026 (segun metadatos del repositorio) |

## Arquitectura y entrenamiento

La informacion disponible no permite describir la arquitectura interna del modelo. La model card se limita a indicar que se trata de un checkpoint fine-tuned a partir de Z-image-base y que integra dos componentes auxiliares: un VAE (`UltraFlux-v1_model.safetensors`) y un codificador de texto CLIP (`qwen_3_4b.safetensors`). No se especifica el numero de parametros, la profundidad de la red, el tipo de atencion, ni si emplea un transformer de difusion (DiT), una UNet convolucional o un diseno hibrido. Tampoco se documenta el espacio latente ni la resolucion nativa de entrenamiento.

Respecto al entrenamiento, no hay datos verificables: no se indica el volumen de tokens o pares imagen-texto utilizados, la composicion del dataset, si hubo etapas de ajuste por preferencias (RLHF, DPO) ni si se aplicaron tecnicas como LoRA, DreamBooth o ajuste completo. La unica innovacion declarada es practica: la fusion de VAE y CLIP en el propio checkpoint y un rango de muestreo recomendado bajo (6 a 12 pasos con euler + simple), que apunta a un flujo optimizado para generacion rapida en ComfyUI. Cualquier afirmacion adicional sobre el entrenamiento seria especulativa.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image) en un unico checkpoint cargable en ComfyUI.
- Cobertura multi-estilo segun el propio autor («增强多风格»), es decir, se presenta como capaz de producir resultados en varias estetticas con los mismos pesos.
- Generacion en pocos pasos: el rango recomendado de 6 a 12 pasos con euler + simple sugiere inferencia rapida frente a flujos de 20-30 pasos.
- Integracion con el ecosistema ComfyUI mediante nodos de carga de checkpoint.
- Inclusión de componentes de decodificacion (VAE) y de codificacion de texto (CLIP qwen_3_4b) dentro del flujo publicado.
- Ejecucion en la plataforma RunningHub, incluida la posibilidad de invocarlo a traves de su API.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo de razonamiento explicito (thinking mode). Estas capacidades no aplican a un modelo text-to-image ni estan declaradas.

## Casos de uso

- Generacion rapida de ilustraciones multi-estilo en ComfyUI: al trabajar con 6 a 12 pasos y muestreador euler + simple, permite iterar sobre variaciones de estilo sin esperar tiempos de muestreo largos, util para exploracion creativa.
- Prototipado de concept art: un estudio puede generar bocetos de personajes, entornos o props a partir de descripciones textuales y seleccionar candidatos antes de encargar el trabajo final a ilustradores.
- Creacion de assets para videojuegos y animacion: generacion de iconos, texturas o ilustraciones de referencia que despues se retocan en herramientas 2D/3D.
- Contenido para marketing y redes sociales: produccion de imagenes de apoyo para campanas, banners o publicaciones, siempre que la licencia final del modelo lo permita (actualmente no esta definida).
- Automatizacion mediante la API de RunningHub: el modelo se puede invocar de forma programatica, lo que permite integrarlo en pipelines que generen imagenes bajo demanda desde una aplicacion o backend.
- Banco de pruebas para ajustes posteriores: al ser un checkpoint safetensors sobre Z-image-base, sirve como punto de partida para entrenar LoRA o nuevos fine-tunes con estilos propios.
- Generacion de material editorial o educativo: ilustraciones de apoyo para articulos, apuntes o presentaciones, sujetas igualmente a la verificacion de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay datos de FID, CLIP score, ImageReward, HPSv2 ni de ninguna otra metrica de calidad o alineacion prompt-imagen. Tampoco se documentan tiempos de inferencia medidos, throughput ni consumo de VRAM en el repositorio.

## Requisitos de hardware

- VRAM estimada: no confirmada por el autor. El unico archivo de pesos ocupa 19 572 MiB (unos 19,1 GiB), por lo que cargarlo completo en memoria deGPU en precision bf16/fp16 requeriria del orden de 20 GB o mas, sin contar activaciones ni el resto del pipeline.
- GPU recomendadas (estimacion, no confirmada): NVIDIA A100 40 GB, H100 80 GB, RTX 6000 Ada 48 GB o RTX 5090 32 GB. En GPUs de 24 GB (RTX 3090, 4090) seria necesario aplicar offloading parcial a RAM o usar versiones cuantizadas, que el repositorio no proporciona.
- Cabe en GPU de consumo: no de forma directa y sin cuantizar en tarjetas de 8-16 GB; en 24 GB solo con gestion de memoria agresiva por parte de ComfyUI (offload a RAM del sistema) o tras cuantizar los pesos por cuenta propia.
- Opciones de despliegue: ComfyUI (flujo principal documentado), plataforma RunningHub y su API, y Hugging Face como repositorio de pesos. No se documenta compatibilidad con vLLM, TGI, llama.cpp, Ollama ni diffusers, dado que es un checkpoint de difusion y no un modelo de lenguaje.
- Latencia y throughput: no disponibles. El autor solo indica un rango de 6 a 12 pasos con euler + simple, lo que sugiere un coste de muestreo bajo, pero no publica mediciones.
- Almacenamiento: reservar al menos 20,5 GB para el repositorio completo y espacio adicional para cache de modelos en ComfyUI.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Estado de documentacion |
|---|---|---|---|---|---|
| rh-wuji-z-image-base2603-checkpoint | Checkpoint text-to-image (fine-tune de Z-image-base) | no disponible | no disponible | no disponible | Model card minima; sin benchmarks; 0 descargas, 1 like |
| Z-image-base (modelo upstream) | Modelo base text-to-image | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Referenciado como origen del fine-tune, sin datos tecnicos en este repositorio |
| Otros checkpoints de la comunidad en ComfyUI | Checkpoint text-to-image | no disponible | no disponible | variable, habitualmente definida por el autor | no disponible |

No se dispone de datos suficientes para una comparacion cuantitativa. La unica comparacion sostenible con la informacion proporcionada es cualitativa: este checkpoint deriva de Z-image-base y anade una fusion de VAE y CLIP con un rango de pasos reducido, pero no publica metricas que permitan situarlo frente a alternativas.

## Limitaciones y advertencias

- Licencia no definida: la model card indica que los derechos pertenecen al autor y remite a la licencia del proyecto original o upstream. Sin una licencia explicita, el uso comercial es juridicamente arriesgado.
- Ausencia total de benchmarks: no hay FID, CLIP score ni comparaciones objetivas que respalden la calidad declarada.
- Sin especificaciones tecnicas: se desconocen arquitectura, numero de parametros, resolucion nativa, dataset de entrenamiento y si hubo ajuste por preferencias.
- Idiomas no declarados: no se indica que idiomas admiten los prompts; parte de la documentacion esta en chino, lo que sugiere que el ajuste pudo orientarse a ese idioma.
- Riesgo de sesgos desconocido: al no documentarse la composicion del dataset, no es posible evaluar sesgos de genero, etnia, cultura o representacion.
- Alucinacion visual: como cualquier modelo generativo de imagenes, puede producir anatomia incorrecta, texto ilegible en la imagen o elementos incoherentes con el prompt.
- Adopcion nula y trazabilidad baja: 0 descargas y 1 like implican poca validacion por parte de la comunidad; los metadatos de fecha (2026) no coinciden con un modelo ampliamente probado.
- Dependencia de ComfyUI y RunningHub: el flujo documentado asume estas plataformas y los componentes fusionados (VAE UltraFlux-v1, CLIP qwen_3_4b); fuera de ese entorno el comportamiento puede variar.
- Requisitos de memoria elevados: un archivo de 19,1 GiB complica el despliegue en GPU de consumo sin cuantizacion adicional, que el autor no facilita.
- Sin garantias de soporte: no hay repositorio de issues, paper ni documentacion tecnica asociada.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-wuji-z-image-base2603-checkpoint
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/2033782768341098497
- Pagina del autor: https://www.runninghub.cn/user-center/1934265933848289281
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Endpoint de la API citado en la model card (Seedance 2.5): https://www.runninghub.ai/call-api/api-detail/2133100000000700025

No se han encontrado papers, informes tecnicos ni repositorios de codigo adicionales asociados a este checkpoint en la informacion disponible.
