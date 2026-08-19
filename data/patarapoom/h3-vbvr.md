# Patarapoom/h3-vbvr

## Resumen

El repositorio `Patarapoom/h3-vbvr` no contiene un modelo nuevo, sino una recopilación de archivos de pesos preentrenados de MiniMax H3, reorganizados para su uso directo en ComfyUI. Su propósito operativo es servir como espejo reducido: en lugar de descargar repositorios completos con múltiples variantes que nunca se cargan en un render, este repositorio aloja únicamente los seis ficheros necesarios para un flujo de trabajo de vídeo (image-to-video y audio-to-video), sumando 40,77 GB. El autor lo justifica por las limitaciones de RunPod Serverless, que descarga el repositorio completo en cada worker.

El contenido incluye el transformer principal de MiniMax H3 (variante `b20-49` con cuantización int8), un text encoder Qwen3-VL de 32B cuantizado, dos VAEs (vídeo y audio), y dos LoRAs: uno de aceleración `lightx2v_turbo` y otro específico para razonamiento de vídeo VBVR. No se incluye licencia propia; cada archivo conserva la licencia de su repositorio de origen, que en todos los casos es "no declarada" (other). Este repositorio es una pieza de infraestructura para usuarios de ComfyUI, no un modelo independiente con documentación técnica propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (componentes de MiniMax H3: transformer, text encoder, VAE, LoRA) |
| Parametros totales | no disponible (el transformer pesa 20,97 GB; el text encoder 15,69 GB) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (transformer), nvfp4 + awq (text encoder), fp32 (audio VAE) |
| Idiomas soportados | no disponible |
| Licencia | other (cada archivo conserva la licencia de su origen; ninguna declarada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el proceso de entrenamiento, los datos utilizados ni las innovaciones tecnicas del modelo subyacente. El repositorio es un espejo de archivos ya publicados por terceros (smhfacct, Comfy-Org, Kijai, Patarapoom). Los nombres de los ficheros indican que el transformer es una variante híbrida (`minimax_h3_hybrid_fl2va_ref2va_b20-49-int8`) y que el text encoder es un Qwen3-VL de 32B, pero no hay documentación adicional en este repositorio. Para detalles de arquitectura y entrenamiento, es necesario consultar los repositorios de origen enlazados en la sección de enlaces.

## Capacidades

- Generacion de video a partir de imagen (image-to-video) mediante el pipeline de ComfyUI.
- Generacion de video con audio (audio-to-video) gracias a la inclusion de un VAE de audio separado.
- Razonamiento de video a traves del LoRA `VBVR_H3_attn_only.safetensors`, que aplica atencion especifica para tareas de razonamiento sobre video (VBVR: Very Big Video Reasoning).
- Aceleracion de inferencia con el LoRA `lightx2v_turbo_4step`, que permite generar en 4 pasos en lugar del proceso completo.
- Integracion directa con ComfyUI mediante la estructura de carpetas estandar (`diffusion_models`, `text_encoders`, `vae`, `loras`).
- Soporte de text encoder multimodal (Qwen3-VL) para condicionamiento por texto e imagen.

## Casos de uso

- Generacion de video clip a partir de una imagen fija: el usuario carga una imagen en ComfyUI y el modelo produce un video corto con movimiento coherente, usando el transformer y el VAE de video.
- Creacion de video con pista de audio sincronizada: al incluir el VAE de audio, el flujo puede generar video y audio simultaneamente, util para escenas con dialogo o sonido ambiental.
- Razonamiento sobre video existente: el LoRA VBVR permite que el modelo analice o modifique videos con comprension de eventos temporales, por ejemplo para edicion automatica o resumen visual.
- Prototipado rapido en entornos serverless: el repositorio esta pensado para RunPod Serverless, donde la carga de un solo repo de 41 GB en lugar de cientos de GB reduce costes y tiempo de arranque.
- Experimentacion con cuantizacion int8: el transformer int8 permite ejecutar el modelo en GPUs con menos VRAM que la version fp16, aunque se desconoce el impacto exacto en calidad.
- Uso como base para fine-tuning de LoRA en video: los archivos son compatibles con el ecosistema ComfyUI, facilitando el entrenamiento de LoRAs adicionales sobre el transformer de MiniMax H3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de calidad, velocidad ni comparaciones con otros modelos. El unico dato de rendimiento indirecto es la existencia de un LoRA turbo que reduce el numero de pasos a 4, lo que sugiere una inferencia rapida, pero sin cifras concretas.

## Requisitos de hardware

- VRAM estimada: no disponible con precision. El transformer int8 de 20,97 GB y el text encoder de 15,69 GB sugieren que se necesita una GPU con al menos 40 GB de VRAM para cargar ambos simultaneamente en precision completa. Con cuantizacion adicional (por ejemplo, cargando el text encoder en 8 bits) podria reducirse, pero no hay datos.
- GPU recomendadas: no se especifican. Por el tamaño, se necesitarian GPUs de clase profesional como A100 (40/80 GB), H100 (80 GB) o, en el ambito consumer, una RTX 4090 (24 GB) podria ser insuficiente para el conjunto completo; posiblemente se requiera offloading a CPU o uso de cuantizacion mas agresiva.
- Compatibilidad con consumer GPU: dudosa sin cuantizacion adicional; el text encoder de 15,69 GB ya supera la VRAM de la mayoria de GPUs consumer.
- Opciones de despliegue: ComfyUI (principal), posiblemente via vLLM o TGI para el text encoder, y llama.cpp no es aplicable al ser un modelo de video.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han encontrado comparaciones con otros modelos de generacion de video (como LTX-Video, CogVideoX, etc.) en la informacion proporcionada. El repositorio es un espejo de archivos, no un modelo con identidad propia.

## Limitaciones y advertencias

- Licencia incierta: el repositorio no incluye ninguna licencia y los repositorios de origen tampoco la declaran. Esto impide conocer si el uso comercial esta permitido; se recomienda contactar con los autores originales antes de usar en produccion.
- Copias sin modificar: los archivos son copias byte a byte de los originales, pero el repositorio no garantiza que sean las versiones mas recientes ni que funcionen correctamente en todos los entornos.
- Nombres de archivo enganosos: el transformer lleva el sufijo `-int8` pero el nombre real del archivo en el repositorio de origen no lo incluye; esto puede causar errores de descarga si se intenta acceder por la URL obvia.
- Variantes confusas: el repositorio de origen contiene cuatro variantes (b15/b20/b25/b30) con el mismo tamaño (20,97 GB); este repositorio solo incluye la b20-49, pero no hay documentacion sobre las diferencias entre ellas.
- Riesgo de alucinacion y sesgos: no hay informacion sobre el comportamiento del modelo en estos aspectos; al ser un modelo de video, podria generar contenido inconsistente o no deseado.
- Requisitos de hardware elevados: el tamaño total de 40,77 GB implica que no es adecuado para entornos con recursos limitados.
- Sin soporte oficial: el autor es un usuario individual, no una organizacion; no hay canal de soporte ni garantias de mantenimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Patarapoom/h3-vbvr
- Repositorio de origen del transformer: https://huggingface.co/smhfacct/Minimax-H3-fl2va-ref2va-hybrid-models
- Repositorio de origen del text encoder y VAE de audio: https://huggingface.co/Comfy-Org/MiniMax-H3
- Repositorio de origen del VAE de video: https://huggingface.co/Kijai/MiniMax-H3-experimental
- Repositorio de origen del LoRA turbo: https://huggingface.co/Kijai/MiniMax-H3_comfy
- Repositorio de origen del LoRA VBVR: https://huggingface.co/Patarapoom/H3_lora
- Paper VBVR (Very Big Video Reasoning): https://arxiv.org/abs/2602.20159
- Repositorio de evaluacion VBVR: https://github.com/Video-Reason/VBVR-EvalKit
- Pagina del modelo en Civitai (con resenas): https://civitai.com/models/2497207/reviews?modelVersionId=3220766
