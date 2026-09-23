# RunningHubAI/rh-krea2-turbo-fp8.safetensors-unet

## Resumen

rh-krea2-turbo-fp8.safetensors-unet es un fichero de pesos de tipo UNET para generacion de video a partir de texto (text-to-video), publicado por la cuenta RunningHubAI dentro de la plataforma RunningHub. El repositorio contiene un unico archivo, `krea2_turbo_fp8.safetensors`, de 12.302 MiB (aproximadamente 12,9 GB), ya cuantizado en fp8, pensado para cargarse directamente en ComfyUI o ejecutarse en la nube de RunningHub. La model card lo etiqueta como "finetuned from: Other" y no identifica explicitamente el modelo base del que deriva.

El nombre del archivo sugiere dos cosas que la documentacion no confirma: que se trata de una variante "turbo" (destilada para funcionar con pocos pasos de muestreo) de una familia denominada "krea2", y que los pesos se han convertido a fp8 para reducir el consumo de VRAM respecto a una version en bf16 o fp16. Ambas son inferencias a partir del nombre del fichero, no datos verificados en la model card.

La relevancia de esta publicacion es practica mas que tecnica: permite desplegar un UNET de video de gran tamano en GPU de consumo con cuantizacion de 8 bits, sin necesidad de convertir los pesos manualmente. En el momento de redactar esta ficha el repositorio registra 0 descargas y 0 "likes", no incluye licencia declarada, no publica resultados de benchmarks ni detalles de entrenamiento, y no especifica idiomas soportados ni composicion del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNET de difusion para text-to-video (segun etiquetas del repositorio: `unet`, `text-to-video`); topologia interna no detallada en la model card |
| Parametros totales | no disponible; estimacion aproximada de ~12,3 mil millones a partir del tamano del fichero fp8 (12.302 MiB), no confirmada por el autor |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no aplica / no disponible: es un modelo de difusion, no un modelo de lenguaje; la card no especifica limite de frames, resolucion ni duracion de clip |
| Tipos de cuantizacion | fp8 (fichero `krea2_turbo_fp8.safetensors`); no se documentan variantes GGUF, int8, int4 ni versiones bf16/fp16 en este repositorio |
| Idiomas soportados | no disponible (probablemente heredados del modelo base, sin confirmar) |
| Licencia | no disponible; la card indica que el copyright pertenece al autor y que debe seguirse la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (fp8), fichero unico para UNET |
| Tipo de modelo | UNET / componente de difusion para video |
| Tamano del repositorio | 12,9 GB |
| Fichero principal | `krea2_turbo_fp8.safetensors` (12.302 MiB) |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face |
| Pipeline declarado | `text-to-video` |
| Autor | RunningHubAI (autor original citado: @风熙AI en RunningHub) |
| Fecha de creacion | 23 de septiembre de 2026 (segun metadatos de HuggingFace) |
| Ultima actualizacion | 23 de septiembre de 2026 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo. Lo unico confirmado es que se distribuye como componente UNET independiente dentro de un pipeline de difusion text-to-video, formato habitual en ComfyUI, donde el UNET se combina por separado con el codificador de texto, el VAE de video y, en su caso, el scheduler. El sufijo `fp8` indica que los pesos se almacenan en coma flotante de 8 bits, lo que reduce aproximadamente a la mitad el espacio en disco y en VRAM frente a una version fp16. El sufijo `turbo` apunta a una destilacion orientada a inferencia con pocos pasos, pero no se especifica el numero de pasos recomendado, el sampler ni el guidance scale.

Tampoco hay datos sobre el entrenamiento: no se indica el numero de tokens o de clips utilizados, la composicion del dataset, resolucion nativa, duracion de los clips de entrenamiento, ni si hubo fases de ajuste fino con RLHF, DPO u optimizacion por preferencia humana. La card se limita a indicar "Finetuned from: Other", sin nombrar el modelo base ni el proceso de destilacion aplicado. No se documenta ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, atencion 3D, etc.).

## Capacidades

- Generacion de video a partir de una descripcion textual, cargando los pesos como UNET dentro de un pipeline de difusion (ComfyUI o RunningHub).
- Integracion como componente sustituible: al ser un fichero UNET aislado, se puede combinar con distintos codificadores de texto, VAE y samplers segun el flujo de trabajo.
- Ejecucion en fp8: permite cargar el modelo en GPU con menos VRAM que una version de 16 bits, a costa de una posible perdida de fidelidad numerica.
- Presunta generacion con pocos pasos de muestreo (atributo "turbo" del nombre, no confirmado en la documentacion).
- No hay evidencia en la informacion proporcionada de soporte de tool calling, function calling, agentes, razonamiento multi-paso, entrada de imagen (image-to-video), audio, vision multimodal ni control por pose o profundidad.
- No se documentan capacidades multilingues ni idiomas concretos para los prompts.

## Casos de uso

- Generacion de clips publicitarios cortos: el modelo se cargaria como UNET en un flujo de ComfyUI parametrizado por prompt, resolucion y numero de frames, permitiendo producir variantes de un anuncio sin salir del entorno local.
- Previz y storyboards animados: util para convertir guiones en animaticas rapidas antes de rodar, aprovechando la posibilidad de iterar con distintos prompts sobre el mismo grafo.
- Contenido para redes sociales en formato vertical: generacion de b-roll sintetico para reels o shorts cuando no se dispone de metraje propio, siempre que la licencia final lo permita.
- Automatizacion SaaS de video generativo: al estar publicado por RunningHub, el flujo natural es invocarlo a traves de su API en lugar de desplegarlo en infraestructura propia, y exponerlo como servicio a terceros.
- Aumento de datos sinteticos: generar secuencias de video etiquetadas por prompt para entrenar o evaluar modelos de vision por computador y de descripcion de video.
- Investigacion en cuantizacion fp8: comparar la calidad del UNET en fp8 frente a una hipotetica version en 16 bits para medir la degradacion introducida por la cuantizacion en tareas de video.
- Base para ajuste fino o merge de estilos: el fichero UNET puede servir como punto de partida para LoRAs o fine-tunes de estilo concreto, siempre que la licencia del modelo original lo autorice.
- Prototipado de efectos visuales y transiciones: generacion de planos de relleno o fondos animados que posteriormente se retocan en un programa de composicion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FVD, CLIPScore, VBench ni similares), ni comparaciones cuantitativas con otros modelos de generacion de video, ni datos de latencia o pasos de inferencia recomendados.

## Requisitos de hardware

- VRAM estimada para los pesos: unos 12,0 GiB solo para el UNET en fp8 (12.302 MiB). Esta cifra se deriva del tamano del fichero y no esta confirmada por el autor.
- VRAM adicional necesaria: no disponible. En generacion de video, los tensores latentes y las activaciones crecen con resolucion, numero de frames y tamano de batch, por lo que el consumo real sera notablemente superior a los 12 GiB de pesos. No se publican cifras de pico de memoria.
- GPU de gama de consumo: con 16 GB (RTX 4080, RTX 5070 Ti y similares) el modelo probablemente requiera offloading parcial a RAM del sistema o al disco; con 24 GB (RTX 3090, RTX 4090) deberia poder ejecutarse sin offloading para clips cortos y resoluciones moderadas. Estas estimaciones son deducciones a partir del tamano del fichero, no datos verificados.
- GPU profesionales: A100 40/80 GB, H100 80 GB, L40S 48 GB o RTX 6000 Ada 48 GB son las opciones razonables para batch y resoluciones altas.
- Opciones de despliegue: ComfyUI como entorno principal; RunningHub en modo cloud o via API; otros runners que acepten safetensors fp8. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un UNET de difusion.
- Latencia y throughput: no disponibles. No se indica el numero de pasos de muestreo, el sampler recomendado ni tiempos de generacion por clip.

## Comparativa con modelos similares

No hay datos verificados en la informacion proporcionada para comparar este modelo con alternativas. La model card no identifica el modelo base ni ofrece metricas, de modo que cualquier comparacion numerica seria especulativa. A continuacion se listan candidatos de la misma categoria (UNET o componente de difusion para text-to-video) con los campos marcados como no disponibles, a falta de datos objetivos.

| Modelo | Categoria | Parametros | Duracion / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-krea2-turbo-fp8.safetensors-unet | UNET text-to-video, fp8 | no disponible (~12,3 mM estimados por tamano) | no disponible | no disponible | Hugging Face, ComfyUI, RunningHub |
| Alternativas de la misma categoria (p. ej. familias Wan, HunyuanVideo, LTX-Video) | UNET / DiT text-to-video | no disponible en la informacion proporcionada | no disponible | no disponible | no verificado en esta busqueda |

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no incluye licencia explicita. La card remite a la licencia del proyecto original, que tampoco se identifica. El uso comercial es juridicamente arriesgado sin aclarar la procedencia de los pesos.
- Procedencia incierta: el modelo se presenta como "finetuned from: Other" sin nombrar la base. Si el nombre "krea2" corresponde a un modelo de terceros con licencia restrictiva, la redistribucion en fp8 podria incumplir sus terminos.
- Sin validacion comunitaria: 0 descargas y 0 "likes" en el momento del analisis, sin issues, discusiones ni evaluaciones independientes que confirmen la calidad del resultado.
- Ausencia total de benchmarks: no hay evidencia objetiva de calidad de generacion, coherencia temporal ni fidelidad al prompt.
- Riesgo de artefactos: al tratarse de un modelo de difusion de video, son esperables inconsistencias temporales, deformaciones en manos y rostros, y deriva de identidad entre frames. No hay informacion sobre como se comporta este fine-tune concreto.
- Cuantizacion fp8: la reduccion de precision puede introducir perdida de detalle o degradacion del color respecto a una version en 16 bits. No se documenta la magnitud de esa perdida ni si existe una version sin cuantizar.
- Sesgos desconocidos: al no publicarse la composicion del dataset ni el proceso de filtrado, no es posible evaluar sesgos demograficos, culturales o de representacion.
- Idiomas no especificados: no se indica que lenguajes entiende el codificador de texto asociado ni si los prompts en castellano funcionan correctamente.
- Sin datos de contexto o duracion: no se especifica la longitud maxima de clip, la resolucion nativa ni el numero de frames soportado, lo que dificulta planificar un pipeline de produccion.
- Ambivalencia del termino "turbo": no se confirma el numero de pasos de inferencia. Usar un valor incorrecto de pasos o de guidance puede degradar gravemente el resultado.
- Fecha de publicacion poco habitual: los metadatos indican septiembre de 2026, coherente con un repositorio reciente, pero sin historial de versiones que permita evaluar su evolucion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-krea2-turbo-fp8.safetensors-unet
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2069307467422584833
- Pagina del autor en RunningHub: https://www.runninghub.cn/user-center/1869450346941833217
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio para China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Llamada a la API de RunningHub: https://www.runninghub.ai/call-api
- Pagina de entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- Detalle de API de Seedance 2.5 en RunningHub: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
