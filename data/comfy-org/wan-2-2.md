# Comfy-Org/Wan-2.2

## Resumen

Comfy-Org/Wan-2.2 no es un modelo entrenado desde cero, sino un repositorio de redistribución (repackaging) de la familia Wan 2.2 en formato de fichero único para ComfyUI. Lo publica Comfy-Org, el equipo detrás del ecosistema ComfyUI, y agrupa los pesos convertidos de trece repositorios originales de Wan-AI, alibaba-pai, lightx2v y nvidia. Su función es práctica: ofrecer los safetensors ya preparados, con nombres y estructura de carpetas normalizados, para que los nodos de ComfyUI los carguen sin conversiones manuales.

El modelo subyacente es un sistema de difusión para generación y edición de vídeo, no un modelo de lenguaje. Cubre texto-a-vídeo (T2V), imagen-a-vídeo (I2V), primer y último fotograma a vídeo (FLF2V), vídeo controlado por audio (S2V), animación de personajes, control de cámara, inpainting de vídeo y edición de imagen con ChronoEdit. Se distribuye en variantes de 14B (etiquetadas A14B) y de 5B, y los ficheros de 14B aparecen partidos en expertos *high_noise* y *low_noise*.

Su relevancia ahora es de adopción: acumula más de 8,2 millones de descargas y 965 likes, con licencia Apache 2.0, y se ha convertido en la vía de entrada habitual a Wan 2.2 dentro de ComfyUI. El repositorio pesa 731,6 GB porque incluye todas las variantes en varias precisiones (fp16, bf16, fp8_scaled, int8), no porque un único modelo ocupe ese espacio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para video (no es un LLM). Variantes de 14B con ficheros separados en expertos high_noise y low_noise; variantes de 5B en fichero unico. El detalle interno (tipo de transformer, mecanismo de atencion) no se documenta en la model card |
| Parametros totales | 14B en las variantes A14B (T2V, I2V, S2V, Animate, Fun Control, Fun Inpaint, VACE, ChronoEdit); 5B en TI2V-5B, Fun-5B-Control y Fun-5B-InP |
| Parametros activos | No disponible. El repositorio no documenta un esquema MoE con recuento de parametros activos; la separacion high_noise/low_noise es una division en dos etapas de ruido, no un router de expertos documentado |
| Longitud de contexto | No disponible. La model card no especifica resolucion maxima, numero de fotogramas ni duracion de clip |
| Tipos de cuantizacion | fp16, bf16, fp8_scaled (e4m3fn escalado) e int8 (convrot, solo en Animate 14B). LoRAs de destilacion a 4 pasos (lightx2v) y LoRA de relight para Animate |
| Idiomas soportados | No disponible. El encoder de texto es umt5-xxl (se distribuye en fp16 y fp8_e4m3fn_scaled), pero la model card no declara idiomas admitidos en los prompts |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, fichero unico (diffusion-single-file) para ComfyUI |
| Tarea declarada (pipeline) | image-to-video |
| Encoder de texto | umt5_xxl (fp16 y fp8_e4m3fn_scaled) |
| VAE incluidos | wan2.2_vae.safetensors y wan_2.1_vae.safetensors |
| Encoder de audio | wav2vec2_large_english_fp16 (necesario para el flujo S2V) |
| Tamano del repositorio | 731,6 GB |
| Descargas | 8.230.488 |
| Fecha de creacion / actualizacion | 2025-07-27 / 2026-09-23 |

## Arquitectura y entrenamiento

La model card de este repositorio no aporta informacion sobre arquitectura interna ni sobre el proceso de entrenamiento: es un repackaging y remite a los repositorios originales. Lo que si se deduce de la estructura de ficheros es un esquema de generacion en dos etapas para las variantes de 14B, con un experto *high_noise* y otro *low_noise* que se cargan y encadenan en el mismo grafo de muestreo; las variantes de 5B (TI2V-5B, Fun-5B-Control, Fun-5B-InP) se sirven como un unico safetensors sin esa particion.

El pipeline completo combina tres componentes: el modelo de difusion, el encoder de texto umt5-xxl para los prompts y un VAE (wan2.2_vae o wan_2.1_vae) para codificar y decodificar video. En el flujo S2V se anade un encoder de audio wav2vec2 en fp16 que condiciona la generacion del movimiento labial. Sobre el modelo base se aplican LoRAs especificos: destilacion de 4 pasos de lightx2v para T2V e I2V (reduce el numero de pasos de muestreo), una LoRA de relight para Animate y una LoRA de destilacion para ChronoEdit. No se dispone de datos sobre volumen de tokens de entrenamiento, composicion del dataset, ni sobre si hubo RLHF o DPO.

## Capacidades

- Generacion de video texto-a-video (T2V) con las variantes de 14B y el flujo de 5B TI2V.
- Generacion de video imagen-a-video (I2V), la tarea declarada del repositorio.
- Generacion condicionada por primer y ultimo fotograma (FLF2V), con workflow propio.
- Animacion de personajes (Animate 14B), incluyendo LoRA de relight para reiluminacion.
- Generacion de video guiada por audio (S2V), con encoder wav2vec2 para sincronizacion labial.
- Control de camara (Fun Camera): trayectorias de camara definidas como condicionamiento.
- Inpainting de video (Fun Inp) en variantes de 14B y de 5B.
- Control estructural adicional mediante la variante VACE (Fun VACE 14B).
- Edicion de imagen con ChronoEdit 14B, con LoRA de destilacion.
- Aceleracion por destilacion: LoRAs de 4 pasos para T2V e I2V.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta razonamiento multi-paso ni uso como agente.
- Capacidades multilingues en generacion de texto: no disponibles (el modelo no genera texto; los prompts se procesan con umt5-xxl, idiomas no declarados).

## Casos de uso

- Storyboards y prevision de anuncios: T2V de 14B para convertir un guion en un clip de referencia antes del rodaje, con la ventaja de poder iterar prompts sobre el mismo grafo de ComfyUI.
- Animacion de fotografia de producto: I2V toma una imagen fija de catalogo y genera un plano en movimiento, util para e-commerce que no puede costear produccion audiovisual por referencia.
- Transiciones controladas en montaje: el flujo FLF2V fija el fotograma inicial y el final, lo que permite generar el intermedio de un corte concreto y encajarlo en una timeline existente.
- Doblaje y avatares parlantes: S2V con el encoder wav2vec2 sincroniza el movimiento labial de un personaje a una pista de audio, aplicable a localizacion de contenido o a presentadores virtuales.
- Planos con movimiento de camara definido: Fun Camera permite describir la trayectoria (travelling, orbita, aproximacion) como condicionamiento en lugar de confiar en que el prompt de texto la reproduzca.
- Limpieza de material rodado: Fun Inpaint elimina objetos no deseados, marcas o elementos de continuidad en un clip ya grabado, sin repasar fotograma a fotograma.
- Retoque fotografico consistente: ChronoEdit 14B se usa para ediciones de imagen que deben preservar identidad y estructura, con la LoRA de destilacion para reducir pasos.
- Prototipado rapido en produccion: las LoRAs lightx2v de 4 pasos bajan el coste por iteracion, lo que hace viable generar decenas de variantes de un plano antes de elegir una y rehacerla con el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas cuantitativas (FVD, VBench, similitud de prompt, consistencia temporal) ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada para 14B (calculo aritmetico a partir del numero de parametros, no dato publicado): unos 28 GB en bf16/fp16 por experto y unos 14 GB en fp8_scaled. Como el flujo de 14B encadena experto high_noise y low_noise, en la practica hay que sumar la carga del segundo experto o descargar el primero entre etapas.
- VRAM adicional para el resto del grafo: umt5-xxl en fp16 ronda los 11 GB y en fp8_e4m3fn_scaled unos 5,5 GB; a eso se suman el VAE y, en S2V, el wav2vec2 en fp16. Estas cifras son estimaciones por aritmetica de precision, no datos de la model card.
- Variante 5B: unos 10 GB en fp16, la opcion realista para GPU de consumo con 12-16 GB.
- GPU de consumo: el flujo de 5B cabe en RTX 4070 Ti / 4080 / 4090. El flujo de 14B en fp8_scaled es ajustado en una RTX 4090 de 24 GB y depende de la gestion de memoria del sampler; en bf16 requiere GPU de 40-80 GB.
- GPU profesionales: A100 40/80 GB y H100 para 14B en bf16 sin cuantizar; L40S o A6000 para fp8.
- Despliegue: ComfyUI es el entorno de referencia (los safetensors estan nombrados y estructurados para sus carpetas models/diffusion_models, text_encoders, vae, loras, audio_encoders). Tambien existen Comfy Desktop (ejecucion local) y Comfy Cloud (GPU bajo demanda).
- No aplica vLLM, llama.cpp, Ollama ni TGI: son runtimes de modelos de lenguaje, no de difusion de video.
- Latencia y throughput: no disponibles. No se publican tiempos por clip ni numero de pasos recomendado fuera de las LoRAs de 4 pasos.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea principal | Contexto / duracion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan 2.2 A14B (este repo) | 14B, dos expertos high/low noise | T2V, I2V, S2V, Animate, control de camara, inpaint, VACE | No disponible | Apache 2.0 | Safetensors para ComfyUI, 8,2 M de descargas |
| Wan 2.2 5B (TI2V-5B, Fun-5B) | 5B, fichero unico | T2V/I2V, control e inpaint en 5B | No disponible | Apache 2.0 | Incluido en este mismo repositorio |
| Wan 2.1 | 14B y 1.3B (variantes T2V/I2V) | T2V, I2V | No disponible | No verificada en esta ficha | Repositorios Wan-AI en HuggingFace; VAE 2.1 incluido aqui por compatibilidad |
| ChronoEdit 14B (nvidia) | 14B | Edicion de imagen | No disponible | No disponible en la informacion proporcionada | Incluido aqui como chrono_edit_14B_fp16 |
| HunyuanVideo | 13B (dato publico, no verificado en esta ficha) | T2V, I2V | No disponible | No disponible en la informacion consultada | Fuera del alcance de esta busqueda |
| CogVideoX | 5B y 2B (dato publico, no verificado en esta ficha) | T2V, I2V | No disponible | No disponible en la informacion consultada | Fuera del alcance de esta busqueda |

La comparacion relevante para un desarrollador es interna a la familia: 14B ofrece las variantes con control (camara, VACE, animate, audio) y 5B ofrece la misma licencia con una huella de VRAM tres veces menor, a costa de las capacidades de control avanzado.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no hay tool calling, ni agentes, ni razonamiento multi-paso, ni generacion de codigo. Cualquier evaluacion de esas capacidades no aplica.
- Ausencia total de datos de evaluacion: sin benchmarks, sin tasas de exito por tarea y sin comparativas numericas publicadas por el autor del repackaging.
- Sin informacion sobre sesgos: la model card no documenta sesgos demograficos, culturales ni de representacion, un riesgo relevante en generacion de video con personas.
- Artefactos propios de difusion de video: incoherencia temporal entre fotogramas, deformacion de manos y rostros, texto mal renderizado dentro de la imagen y deriva de identidad en clips largos. No cuantificado en la informacion disponible.
- Limites de duracion y resolucion sin documentar: no se declara numero maximo de fotogramas ni resolucion nativa, por lo que la viabilidad de un plano largo hay que verificarla empiricamente.
- Idiomas no declarados: aunque el encoder umt5-xxl es multilingue, no hay confirmacion de calidad con prompts en castellano; conviene validar antes de disenar un flujo de produccion en espanol.
- Licencia: el repositorio es Apache 2.0, pero agrupa pesos de origen diverso. ChronoEdit proviene de nvidia/ChronoEdit-14B-Diffusers y su licencia no se detalla en esta ficha; antes de un uso comercial hay que revisar la licencia de cada modelo base por separado.
- Riesgo operativo del repositorio: 731,6 GB de tamano total. Descargar el repositorio completo es inviable en la mayoria de entornos; hay que bajar solo los ficheros concretos que requiera el workflow.
- Encoder de audio en ingles: el wav2vec2 incluido es la variante english, lo que condiciona la calidad del flujo S2V con audio en otros idiomas.
- Dependencia de ComfyUI: los pesos estan empaquetados y nombrados para ese ecosistema; usarlos fuera implica adaptar la carga y el grafo de muestreo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Comfy-Org/Wan-2.2
- Ejemplos de Wan 2.2 en ComfyUI: https://comfyanonymous.github.io/ComfyUI_examples/wan22/
- Repositorio ComfyUI: https://github.com/Comfy-Org/ComfyUI
- Plantillas de workflow: https://github.com/Comfy-Org/workflow_templates
- Workflow Wan 2.2 14B Image to Video: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_i2v.json
- Workflow Wan 2.2 14B First-Last Frame to Video: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_flf2v.json
- Workflow Wan 2.2 14B Text to Video: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_t2v.json
- Workflow Wan 2.2 5B Video Generation: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_5B_ti2v.json
- Workflow Wan 2.2 14B Fun Control: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_fun_control.json
- Workflow Wan 2.2 5B Fun Control: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_5B_fun_control.json
- Workflow Wan 2.2 14B Fun Camera Control: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_fun_camera.json
- Workflow Wan 2.2 14B Fun Inpaint: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_fun_inpaint.json
- Workflow Wan 2.2 5B Fun Inpaint: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_5B_fun_inpaint.json
- Workflow Wan 2.2 S2V Audio-Driven Video Generation: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_s2v.json
- Workflow ChronoEdit 14B Image Edit: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_chrono_edit_14B.json
- Modelo base Wan2.2-T2V-A14B: https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B
- Modelo base Wan2.2-I2V-A14B: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
- Modelo base Wan2.2-S2V-14B: https://huggingface.co/Wan-AI/Wan2.2-S2V-14B
- Modelo base Wan2.2-Animate-14B: https://huggingface.co/Wan-AI/Wan2.2-Animate-14B
- Modelo base Wan2.2-TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Modelo base alibaba-pai/Wan2.2-Fun-A14B-Control: https://huggingface.co/alibaba-pai/Wan2.2-Fun-A14B-Control
- Modelo base alibaba-pai/Wan2.2-Fun-A14B-Control-Camera: https://huggingface.co/alibaba-pai/Wan2.2-Fun-A14B-Control-Camera
- Modelo base alibaba-pai/Wan2.2-Fun-A14B-InP: https://huggingface.co/alibaba-pai/Wan2.2-Fun-A14B-InP
- Modelo base alibaba-pai/Wan2.2-Fun-5B-Control: https://huggingface.co/alibaba-pai/Wan2.2-Fun-5B-Control
- Modelo base alibaba-pai/Wan2.2-Fun-5B-InP: https://huggingface.co/alibaba-pai/Wan2.2-Fun-5B-InP
- Modelo base alibaba-pai/Wan2.2-VACE-Fun-A14B: https://huggingface.co/alibaba-pai/Wan2.2-VACE-Fun-A14B
- Modelo base nvidia/ChronoEdit-14B-Diffusers: https://huggingface.co/nvidia/ChronoEdit-14B-Diffusers
- LoRAs de destilacion lightx2v: https://huggingface.co/lightx2v/Wan2.2-Distill-Loras
- Sitio de Comfy: https://comfy.org/
- Descarga de Comfy Desktop: https://comfy.org/download
