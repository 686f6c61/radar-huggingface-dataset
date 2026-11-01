# Acapellas/Kim_Vocal_2.onnx

## Resumen

StableAvatar es un modelo de difusion de video (video diffusion transformer) disenado para generar videos de avatar de duracion ilimitada a partir de una imagen de referencia y una pista de audio. Lo desarrollan investigadores de la Universidad de Fudan, Microsoft Research Asia, la Universidad de Xi'an Jiaotong y Tencent, y se distribuye en HuggingFace bajo el identificador Acapellas/Kim_Vocal_2.onnx. El modelo se construye sobre Wan-AI/Wan2.1-T2V-14B, un transformer de difusion de 14.000 millones de parametros para generacion de video texto-a-video, que aqui se reutiliza como backbone y se adapta a la tarea audio-a-video con preservacion de identidad.

El problema que resuelve es concreto: los modelos existentes de avatar audio-dirigido no logran mantener coherencia de identidad ni sincronizacion labial en videos largos, porque inyectan embeddings de audio extraidos por modelos de terceros mediante cross-attention sobre backbones sin priors de audio, lo que provoca acumulacion de error en el espacio latente a medida que avanzan los clips. StableAvatar introduce un adaptador de audio sensible al paso de difusion (Time-step-aware Audio Adapter), un mecanismo de guiado nativo de audio en inferencia y una estrategia de ventana deslizante con pesos dinamicos para fusionar latentes.

Es relevante porque, segun sus autores, es el primer transformer de difusion de video end-to-end capaz de sintetizar videos de avatar de longitud infinita sin post-procesado facial (sin FaceFusion, GFP-GAN ni CodeFormer) manteniendo identidad y sincronizacion. El repositorio ocupa 28,1 GB e incluye pesos en formato ONNX y safetensors, con licencia MIT, lo que facilita su uso comercial y su integracion en pipelines de difusion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Video diffusion transformer (DiT) derivado de Wan2.1-T2V-14B |
| Parametros totales | 14 000 millones (heredados del modelo base Wan-AI/Wan2.1-T2V-14B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (generacion de video de longitud ilimitada mediante ventana deslizante) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX y safetensors (libreria diffusers, WanPipeline) |

## Arquitectura y entrenamiento

StableAvatar es un transformer de difusion de video construido sobre el backbone Wan2.1-T2V-14B, adaptado para condicionarse conjuntamente por una imagen de referencia y una senal de audio. La innovacion central es el Time-step-aware Audio Adapter, que modula la inyeccion de informacion de audio en funcion del paso de difusion para evitar la acumulacion de error latente entre clips, problema atribuido a los esquemas clasicos de cross-attention con embeddings de audio de terceros. En inferencia se anade un Audio Native Guidance Mechanism que emplea la propia prediccion conjunta audio-latente del modelo como senal de guia dinamica, y una Dynamic Weighted Sliding-window Strategy que fusiona latentes a lo largo del tiempo para suavizar transiciones en videos de duracion ilimitada.

Los detalles sobre el dataset de entrenamiento (numero de tokens, composicion, horas de video y audio, uso de RLHF/DPO) no estan disponibles en la informacion proporcionada. La model card menciona la publicacion de codigo de fine-tuning y de entrenamiento de LoRA, lo que sugiere que el modelo se entrena por ajuste fino sobre el backbone Wan2.1 preentrenado, pero no se especifican los volumenes de datos ni la composicion del corpus.

## Capacidades

- Generacion de video de avatar audio-dirigido a partir de una imagen de referencia y una pista de audio.
- Sintesis de video de longitud ilimitada (infinite-length) sin necesidad de post-procesado facial.
- Preservacion de identidad (ID-preserving) a lo largo de toda la secuencia generada.
- Sincronizacion labial y de expresiones faciales con el audio de entrada.
- Generacion image-to-video y text-to-video (segun los tags del repositorio).
- Integracion con la libreria diffusers a traves de WanPipeline.
- Soporte de ejecucion en interfaz Gradio, segun la model card.
- Soporte de fine-tuning y entrenamiento de LoRA (codigo publicado por los autores).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural; es un modelo generativo de video, no un LLM.

## Casos de uso

- Generacion de avatares virtuales para locucion: a partir de una foto del presentador y un audio de voz, el modelo produce un video de duracion arbitraria con sincronizacion labial, adecuado para noticias, formación o videos corporativos sin rodaje.
- Doblaje y localizacion de contenido audiovisual: se puede animar un avatar con pistas de audio en distintos idiomas manteniendo la identidad del hablante, gracias a la preservacion de ID y a la generacion de longitud ilimitada.
- Asistentes conversacionales con cara visible: integracion en interfaces de atencion al cliente o asistentes de voz donde se requiere un rostro animado que hable de forma continua durante sesiones largas.
- Creacion de contenido para redes sociales y marketing: generacion de videos de portavoces o influencers virtuales a partir de un unico retrato y un guion de audio, con licencia MIT que permite uso comercial.
- Prototipado de personajes en videojuegos y experiencias interactivas: animacion de retratos de personajes con audio pregrabado o sintetizado para cinemáticas y dialogos.
- Investigacion en generacion de video audio-condicionada: el modelo sirve como baseline reproducible (pesos ONNX y safetensors, licencia MIT) para estudiar sincronizacion audio-video, deriva latente y fusion de ventanas deslizantes.
- Produccion de material formativo con formadores virtuales: videos largos de explicaciones con un avatar estable, sin necesidad de pipelines de face-swapping o restauracion facial posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card afirma que los experimentos en benchmarks muestran la eficacia de StableAvatar tanto cualitativa como cuantitativamente frente a modelos SOTA de generacion de avatar audio-dirigido, y enlaza comparativas en video, pero no se proporcionan cifras concretas (FID, FVD, SyncNet, LSE, etc.) en el material consultado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia, un backbone de 14 000 millones de parametros en precision FP16 requiere del orden de 28 GB solo para los pesos, mas el coste de activaciones y del VAE de video, por lo que se recomienda al menos 40-80 GB de VRAM en funcion de la resolucion y la longitud del clip.
- GPU recomendadas: A100 80 GB, H100 80 GB o GPUs con 48 GB o mas para ejecucion comoda; el modelo base Wan2.1-T2V-14B se distribuye habitualmente para este rango de hardware.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; con cuantizacion agresiva y resoluciones bajas podria intentarse en RTX 4090 (24 GB), pero no hay datos oficiales.
- Opciones de despliegue: diffusers (WanPipeline), formato ONNX para ejecucion con ONNX Runtime, e interfaz Gradio mencionada por los autores. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusion de video).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StableAvatar (este modelo) | 14 000 M (backbone Wan2.1-T2V-14B) | Video de longitud ilimitada | DiT audio-dirigido con adaptador time-step-aware | MIT | HuggingFace (ONNX, safetensors) |
| Wan-AI/Wan2.1-T2V-14B | 14 000 M | Clips de duracion limitada | DiT texto-a-video | no disponible en la informacion | HuggingFace |
| Otros modelos SOTA de avatar audio-dirigido | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card menciona comparaciones cualitativas con modelos SOTA de generacion de avatar audio-dirigido, pero no identifica por nombre ni proporciona especificaciones de los competidores en el material disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada; al entrenarse sobre datos de video y audio, es previsible que herede sesgos de representacion (genero, etnia, edad) del corpus, pero no hay confirmacion oficial.
- Riesgo de alucinacion visual: como modelo generativo de difusion, puede producir artefactos, deformaciones faciales o inconsistencias en movimientos no visibles en la imagen de referencia, especialmente en secuencias muy largas o audios atipicos.
- Limitaciones de contexto e idioma: no se especifican idiomas soportados ni limites de duracion del audio de entrada; la generacion de longitud ilimitada depende de la estrategia de ventana deslizante y podria degradarse en funcion de la memoria disponible.
- Restricciones de licencia: la licencia es MIT, lo que permite uso comercial, pero el modelo base Wan2.1-T2V-14B puede tener sus propias condiciones que conviene verificar antes de un despliegue productivo.
- Caveats de produccion: el repositorio pesa 28,1 GB y la inferencia de un DiT de 14 000 M es costosa; no hay datos publicados de latencia ni de throughput. La fecha de creacion del repositorio (2026-10-25) y el bajo numero de descargas (16) sugieren que se trata de una publicacion reciente con poca validacion externa.
- Uso responsable: la generacion de avatares realistas con audio plantea riesgos de suplantacion de identidad y deepfakes; se recomienda aplicar marcas de agua y controles de consentimiento en cualquier despliegue publico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Acapellas/Kim_Vocal_2.onnx
- Modelo original de los autores: https://huggingface.co/FrancisRing/StableAvatar/tree/main
- Paper en arXiv: https://arxiv.org/abs/2508.08248
- Repositorio GitHub: https://github.com/Francis-Rings/StableAvatar
- Pagina del proyecto: https://francis-rings.github.io/StableAvatar
- Video de demostracion en YouTube: https://www.youtube.com/watch?v=6lhvmbzvv3Y
- Video de demostracion en Bilibili: https://www.bilibili.com/video/BV1hUt9z4EoQ
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-14B
