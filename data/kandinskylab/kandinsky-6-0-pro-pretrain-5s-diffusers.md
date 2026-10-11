# kandinskylab/Kandinsky-6.0-Pro-pretrain-5s-Diffusers

# Kandinsky 6.0 Pro (pretrain 5s) de KandinskyLab: ficha tecnica

## Resumen

Kandinsky 6.0 Pro es un modelo de difusion de gran escala para generacion conjunta y sincronizada de video y audio a partir de texto o de una imagen de referencia. Lo desarrolla KandinskyLab y pertenece a la familia Kandinsky 6.0, compuesta por una variante Lite de 3B parametros y una variante Pro de 29B, segun la model card. Este repositorio concreto publica el checkpoint Pro en su fase de preentrenamiento, con los mismos ajustes de arquitectura y muestreo que el modelo Pro principal.

El modelo genera clips de 5 segundos a 24 fps (121 fotogramas) con audio sincronizado a 44 kHz, incluyendo lip-sync, en dos modos: text-to-audio-video (T2AV) e image-to-audio-video (TI2AV). Una pipeline independiente de superresolucion eleva la salida hasta Full-HD (1920x1080) mediante difusion por teselas en el espacio latente del K-VAE.

Es relevante porque cubre de forma nativa la generacion conjunta de video y audio, un problema que habitualmente se resuelve encadenando modelos separados de video y de audio con alineacion posterior. Su licencia MIT y la integracion ya disponible en diffusers, vLLM-omni, SGLang, FastVideo y ComfyUI facilitan su evaluacion en pipelines de produccion. El repositorio ocupa 159,8 GB y acumula 94 descargas y 10 likes en HuggingFace en la fecha de actualizacion indicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (familia Kandinsky 6.0) con K-VAE latente, codificador de texto Qwen2.5-VL y muestreo flow-matching; pipeline `Kandinsky6TI2VAPipeline` |
| Parametros totales | 30.136.326.248 (~30,1 B) segun los safetensors del repositorio; la model card declara 29B para la variante Pro |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (no se declara; el codificador de texto es Qwen2.5-VL) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; `torch_dtype=torch.bfloat16` en los ejemplos) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors, biblioteca diffusers |
| Modalidad | Text-to-audio-video (T2AV) e image-to-audio-video (TI2AV) |
| Duracion de salida | 5 segundos, 121 fotogramas, 24 fps |
| Resolucion de salida | 480x864 por defecto en los ejemplos; hasta 1920x1080 mediante la pipeline de superresolucion |
| Audio | 44 kHz, sincronizado con el video, con lip-sync |
| Pasos de inferencia | 50 en los ejemplos (`num_inference_steps=50`, `guidance_scale=5.0`) |
| Tamano del repositorio | 159,8 GB |
| Descargas / likes | 94 / 10 |
| Fechas | creado el 2026-09-29, actualizado el 2026-10-07 |

## Arquitectura y entrenamiento

La informacion disponible describe una familia de modelos de difusion para generacion sincronizada de video y audio. El repositorio contiene el checkpoint de preentrenamiento (etiqueta `pretrain`) del modelo Pro, que comparte arquitectura y ajustes de muestreo con el modelo Pro principal. El codificador de texto es Qwen2.5-VL, y la generacion se realiza en el espacio latente de un K-VAE; los ejemplos de la pipeline de superresolucion indican que el checkpoint funciona con flow-matching y 4 pasos por tesela.

Las innovaciones documentadas en la model card son la generacion conjunta de video y audio a 44 kHz con lip-sync en un unico modelo, el modo dual T2AV/TI2AV con condicionamiento del primer fotograma a partir de una imagen de referencia, una pipeline separada de superresolucion (`Kandinsky6SRPipeline`) que escala x2, x2.25 o x4 mediante difusion por teselas con ventanas de Hann, y la expansion automatica de prompts con Qwen2.5-VL (`expand_prompts=True`). No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generacion de video a partir de texto (T2AV) con audio sincronizado.
- Generacion de video a partir de una imagen de referencia (TI2AV): la imagen condiciona el primer fotograma y la pipeline la redimensiona y recorta en el centro al tamano solicitado.
- Generacion de audio a 44 kHz integrada en el mismo paso de muestreo, con sincronizacion labial.
- Generacion solo de video mediante `sample_audio=False`.
- Superresolucion de los fotogramas generados con `Kandinsky6SRPipeline`, con factores x2, x2.25 y x4, hasta 1920x1080.
- Expansion de prompts cortos a descripciones detalladas mediante el codificador Qwen2.5-VL, con coste adicional de latencia pero sin pesos extra.
- Control de duracion y resolucion mediante parametros explicitos (`num_frames`, `height`, `width`, `num_inference_steps`, `guidance_scale`) y tasa de fotogramas fija a 24 fps.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje).
- Capacidades multilingues: no disponible; todos los ejemplos de la model card usan prompts en ingles.

## Casos de uso

- Publicidad y creatividades cortas: generar clips de 5 segundos con locucion, ambiente sonoro y efectos sincronizados a partir de un brief de texto, sin necesidad de encadenar un modelo de audio aparte.
- Storyboards animados en preproduccion: partir de un fotograma fijo de concepto artistico y usar el modo TI2AV para obtener la continuacion animada con audio de referencia antes de rodar.
- Post-produccion y remasterizacion: escalar materiales generados a 480x864 hasta Full-HD con la pipeline de superresolucion por teselas, manteniendo la coherencia temporal.
- Assets para videojuegos y entornos 3D: generar animaciones cortas con audio diegetico (pasos, impactos, ambiente), utiles como material de referencia o placeholders en prototipos.
- Contenido vertical para redes sociales: el formato por defecto de 480x864 y la duracion de 5 segundos encajan con publicaciones cortas, y la superresolucion permite reutilizar el mismo material en pantallas mayores.
- Automatizacion de pipelines de generacion de video: el modelo esta integrado en vLLM-omni, SGLang, FastVideo y ComfyUI, lo que permite desplegarlo como servicio y encadenar peticiones de forma programatica.
- Pruebas A/B de campanas: producir variantes de un mismo prompt cambiando iluminacion, accion o banda sonora, con un coste de 50 pasos de inferencia por clip.
- Doblaje y sincronizacion labial: el soporte de lip-sync declarado permite generar planos con habla sincronizada, sujeto a verificacion porque la model card no documenta el idioma ni la calidad del sincronismo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de metricas (FVD, CLIP, FAD u otras) ni comparaciones cuantitativas con otros modelos de generacion de video o audio. Los resultados de busqueda web recuperados no contienen informacion tecnica relevante sobre el modelo.

## Requisitos de hardware

- Pesos en bfloat16: aproximadamente 60,3 GB solo para los 30.136.326.248 parametros, estimacion derivada del numero de parametros y no un dato publicado. El repositorio completo ocupa 159,8 GB, incluyendo VAE, codificador de texto y componentes auxiliares.
- GPU recomendadas para ejecucion completa en memoria: A100 80 GB, H100 80 GB o RTX 6000 Ada 48 GB con reparto de componentes. No confirmado por el autor.
- GPU de consumo: el ejemplo oficial usa `pipe.enable_model_cpu_offload()`, lo que permite ejecutar el modelo en tarjetas de 24 GB como la RTX 4090 o la RTX 3090 a costa de una latencia muy superior por el trasiego de pesos entre CPU y GPU.
- Opciones de despliegue documentadas: diffusers (`Kandinsky6TI2VAPipeline` y `Kandinsky6SRPipeline`), vLLM-omni, SGLang, FastVideo y ComfyUI (nodos `kandinsky6` en el registro).
- Cuantizaciones: no hay versiones GGUF, int8 o int4 publicadas en la informacion disponible; el unico tipo de dato indicado en los ejemplos es bfloat16.
- Latencia y throughput: no disponibles. Los ejemplos usan 50 pasos de inferencia para 121 fotogramas a 480x864, y la pipeline de superresolucion usa 4 pasos por tesela.
- Almacenamiento: se necesitan al menos 160 GB libres para la descarga completa del repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Salida | Audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kandinsky 6.0 Pro (pretrain, este repositorio) | ~30,1 B | Video 5 s, 121 fotogramas, 24 fps; hasta 1920x1080 con superresolucion | Si, 44 kHz con lip-sync | MIT | HuggingFace, diffusers, vLLM-omni, SGLang, FastVideo, ComfyUI |
| Kandinsky 6.0 Video Lite | 3 B | Video 5 s con audio sincronizado | Si, 44 kHz con lip-sync | no disponible | no disponible en esta busqueda |
| Alternativas de otros desarrolladores (modelos de video con audio) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- Es un modelo de difusion de video y audio, no un modelo de lenguaje: no ofrece razonamiento, tool calling ni capacidades de agente.
- Este repositorio contiene el checkpoint de preentrenamiento (`pretrain`); la model card distingue una variante destilada en el espacio de demostracion, por lo que la calidad final de este checkpoint puede ser inferior a la de versiones posteriores.
- No hay benchmarks publicados, por lo que el rendimiento real en calidad de video, sincronizacion de audio y fidelidad al prompt no esta cuantificado.
- Riesgo de artefactos e incoherencias temporales inherente a los modelos de difusion de video, no documentado de forma especifica por el autor.
- Riesgo de deriva respecto al prompt, especialmente al usar `expand_prompts=True`, que reescribe la instruccion con Qwen2.5-VL y puede introducir elementos no solicitados.
- No se declaran idiomas soportados; todos los ejemplos estan en ingles y el comportamiento multilingue no esta verificado.
- No se documentan sesgos, composicion del dataset de entrenamiento ni filtros de contenido aplicados.
- La licencia del repositorio es MIT, lo que en principio permite uso comercial, pero los licenciamientos de los componentes incluidos (codificador Qwen2.5-VL, K-VAE y cualquier peso de terceros) no se detallan en la informacion disponible y deben verificarse antes de un despliegue comercial.
- Duracion de salida fija de 5 segundos y 24 fps en los ejemplos; no se documentan mecanismos de extension temporal.
- Requisitos de almacenamiento elevados (159,8 GB) y necesidad de offload a CPU en GPUs de consumo, con impacto directo en la latencia.
- Los resultados de busqueda web obtenidos no aportan informacion tecnica sobre el modelo y contienen exclusivamente enlaces de contenido para adultos ajenos a la consulta; se han descartado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kandinskylab/Kandinsky-6.0-Pro-pretrain-5s-Diffusers
- Informe tecnico (arXiv): https://arxiv.org/pdf/2610.05608
- Pagina de modelos de video de KandinskyLab: https://kandinskylab.ai/models/video/
- Demo en HuggingFace Spaces (variante destilada): https://huggingface.co/spaces/kandinskylab/Kandinsky-6.0-Pro-distill-5s
- Documentacion de la pipeline en diffusers: https://huggingface.co/docs/diffusers/main/en/api/pipelines/kandinsky6
- Integracion en vLLM-omni: https://docs.vllm.ai/projects/vllm-omni/en/latest/api/vllm_omni/diffusion/models/kandinsky6/
- Receta de SGLang: https://docs.sglang.io/cookbook/diffusion/Kandinsky/Kandinsky6
- Guia de inferencia en FastVideo: https://haoailab.com/FastVideo/inference/kandinsky6/
- Nodos de ComfyUI: https://registry.comfy.org/nodes/kandinsky6
