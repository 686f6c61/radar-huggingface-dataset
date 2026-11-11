# darkmaniac7/TokForge-SDXL-IPAdapter

## Resumen

TokForge-SDXL-IPAdapter es un paquete de pesos para generación de imágenes por difusión que combina el modelo base RealVisXL V4.0 Lightning (un ajuste fino fotorrealista de Stable Diffusion XL) con el adaptador IP-Adapter plus-face de SDXL y su codificador de imagen OpenCLIP ViT-H-14. Lo publica darkmaniac7 bajo la marca TokForge, con el objetivo explícito de ejecutar inferencia en el propio dispositivo (on-device) dentro de la aplicación móvil TokForge para Android. El problema que resuelve es la transferencia de identidad facial desde fotos de referencia a escenas generadas por prompt, sin necesidad de conexión tras la descarga inicial.

El paquete no es un modelo entrenado desde cero, sino una redistribución empaquetada de tres componentes: el checkpoint SDXL en precisión f16 en un único archivo safetensors para stable-diffusion.cpp, el adaptador plus-face (848 MB) y el codificador ViT-H (2,53 GB). La variante plus-face extrae únicamente el rostro de la referencia mediante un Resampler de 16 tokens sobre el estado oculto penúltimo de ViT-H, de modo que la identidad se preserva mientras el prompt controla la escena completa.

Es relevante ahora por dos motivos: lleva SDXL completo con IP-Adapter a teléfonos de gama alta con Snapdragon y 16 GB de RAM mediante el motor stable-diffusion.cpp (CPU y GPU OpenCL Adreno), y ofrece una ruta específica para dos sujetos mediante máscaras regionales, algo poco habitual en despliegues móviles. El repositorio ocupa 10,3 GB repartidos en cinco archivos y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Latent diffusion (SDXL: UNet + doble codificador de texto CLIP + VAE) con IP-Adapter plus-face (cross-attention desacoplada) y codificador de imagen OpenCLIP ViT-H-14 |
| Parametros totales | no disponible (el paquete incluye base SDXL f16 de 6,94 GB, adaptador de 848 MB y codificador ViT-H de 2,53 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion; sin ventana de contexto textual) |
| Tipos de cuantizacion | Pesos distribuidos en f16; el autor advierte que una base q4_0 debilita la identidad transferida |
| Idiomas soportados | en (prompts en ingles) |
| Licencia | openrail++ en el repositorio; componentes: CreativeML OpenRAIL++-M (base), terminos de Civitai de SG_161222 (RealVisXL), Apache-2.0 (IP-Adapter), MIT (codificador de imagen) |
| Formato de pesos | safetensors para stable-diffusion.cpp (base f16 autocontenida, adaptador y codificador en archivos separados) |

## Arquitectura y entrenamiento

El componente generativo es RealVisXL V4.0 Lightning, un ajuste fino fotorrealista de SDXL destilado para un mínimo de pocos pasos (suelo de 6 pasos en la variante Lightning). SDXL emplea una UNet con atención cruzada hacia dos codificadores de texto CLIP y un VAE para la decodificación latente. El paquete conserva el checkpoint en f16 en lugar de cuantizarlo, decisión justificada por el autor para mantener la calidad de la atención cruzada desacoplada del adaptador y del Resampler facial.

El adaptador IP-Adapter plus-face para SDXL (build `_vit-h`) incorpora un Resampler de 16 tokens sobre el estado oculto penúltimo de ViT-H y 70 capas de atención cruzada desacoplada con `cross_attention_dim` de 2048. El codificador de imagen es OpenCLIP ViT-H-14 (1280 dimensiones ocultas, 32 capas). La elección de ViT-H frente a bigG es obligatoria por la forma del tensor `image_proj.latents` (`[1, 16, 1280]`): bigG tiene 1664 dimensiones y no es compatible con este build. El cargador de IP-Adapter de stable-diffusion.cpp detecta automáticamente plus-face por `image_proj.latents` y la configuración SDXL (2048 dimensiones, 70 capas) por la base.

No se documentan en la información disponible detalles sobre el dataset de entrenamiento del modelo base ni sobre etapas de RLHF o DPO, algo esperable en un modelo de difusión. Tampoco se especifica el proceso de destilación de Lightning más allá de la mención a los 6 pasos.

## Capacidades

- Generación de imágenes texto-a-imagen con SDXL a partir de prompts en inglés.
- Transferencia de identidad facial desde una foto de referencia: el adaptador plus-face conserva el rostro mientras el prompt define la escena.
- Generación con dos sujetos mediante máscaras regionales, produciendo dos rostros distintos y reconocibles según el autor.
- Modo imagen-a-imagen, declarado en el pipeline del repositorio.
- Inferencia on-device en Android mediante stable-diffusion.cpp, con ejecución en CPU y en GPU Adreno vía OpenCL.
- Funcionamiento sin conexión una vez descargados los pesos.
- No soporta tool calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- Sin capacidades de audio, vídeo ni visión general más allá del codificador de imagen para la referencia facial.

## Casos de uso

- Retratos personalizados en móvil: el usuario adjunta una foto clara de su rostro y describe una escena ("yo como superhéroe, sin máscara, rostro visible"); el adaptador mantiene la identidad y el prompt controla vestuario, iluminación y fondo. Adecuado por la ejecución local sin conexión.
- Generación de avatares para aplicaciones de mensajería: a partir de una selfie se producen variantes estilizadas manteniendo el parecido facial, con la ventaja de que ninguna imagen sale del dispositivo.
- Ilustración de escenas con dos personas: usando la ruta de máscaras regionales del adaptador, se generan composiciones donde ambos rostros de referencia aparecen diferenciados, útil para regalos, invitaciones o contenido familiar.
- Pruebas de concepto de identidad en pipelines de investigación: el paquete permite evaluar la transferencia plus-face de SDXL en hardware móvil sin montar un entorno de servidor, gracias al formato safetensors para stable-diffusion.cpp.
- Prototipado de apps de edición fotográfica: integración en flujos imagen-a-imagen donde se sustituye el sujeto de una foto manteniendo su rostro, con inferencia en el teléfono y latencia dependiente del chip Snapdragon.
- Demostraciones y material promocional de marca personal: generación de retratos temáticos (época histórica, fantasía, ciencia ficción) a partir de una referencia, controlando el resto de la escena con el prompt en inglés.
- Evaluación comparativa de adaptadores IP en dispositivos: al coexistir con el paquete SD1.5 del mismo autor, sirve para medir la mejora de fidelidad de SDXL plus-face frente a SD1.5 en el mismo motor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas de fidelidad de identidad (por ejemplo, similitud facial), FID, CLIP score ni comparaciones numéricas con otros adaptadores.

## Requisitos de hardware

- VRAM/RAM: el autor indica teléfonos de clase 16 GB de RAM o más para este paquete; el repositorio completo pesa 10,3 GB (5 archivos).
- GPU recomendadas: no hay recomendaciones de GPU de escritorio en la información disponible; el destino declarado son teléfonos Android con chip Snapdragon y GPU Adreno mediante OpenCL, además de ejecución en CPU.
- Consumer GPU: no se documenta compatibilidad con GPU de escritorio NVIDIA o AMD; el motor objetivo es stable-diffusion.cpp en Android.
- Despliegue: stable-diffusion.cpp (con el port de IP-Adapter de TokForge) dentro de la app TokForge para Android; descarga vía Google Play o TestFlight en iOS (aunque el paquete se describe para Android). Para teléfonos de 8 GB, el autor remite al paquete más ligero TokForge-SD15-IPAdapter.
- Latencia y throughput: no disponibles. El autor solo menciona el suelo de 6 pasos de la variante Lightning, sin cifras de tiempo por imagen.
- Almacenamiento: se requieren al menos 10,3 GB libres para los pesos, más espacio para el motor y los archivos temporales.

## Comparativa con modelos similares

| Modelo | Base | Adaptador | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TokForge-SDXL-IPAdapter | RealVisXL V4.0 Lightning (SDXL) | IP-Adapter plus-face SDXL ViT-H | Foto de referencia facial (1 o 2 sujetos) | openrail++ (componentes con licencias mixtas) | Hugging Face, 10,3 GB, 0 descargas |
| TokForge-SD15-IPAdapter | SD 1.5 (según el autor) | IP-Adapter plus-face para SD 1.5 | Foto de referencia facial | no disponible en la información | Hugging Face; orientado a teléfonos de 8 GB |
| SDXL base + IP-Adapter estándar (h94/IP-Adapter) | Stable Diffusion XL 1.0 | ip-adapter_sdxl (pooled CLIP bigG) | Imagen de referencia completa (escena y estilo, no solo rostro) | OpenRAIL++ / Apache-2.0 | Hugging Face; requiere montaje manual del pipeline |
| RealVisXL V4.0 Lightning (SG161222) | SDXL | Sin adaptador | Solo prompt de texto | Términos de Civitai del autor | Hugging Face; base de este paquete |

La diferencia clave frente al adaptador estándar es que plus-face transfiere solo el rostro y deja la escena al prompt, mientras que `ip-adapter_sdxl` arrastra la escena completa de la referencia. Frente al paquete SD1.5 del mismo autor, este ofrece mayor fidelidad de identidad a cambio de un requisito de 16 GB de RAM.

## Limitaciones y advertencias

- Solo admite prompts en inglés; no se documenta soporte multilingüe.
- El adaptador plus-face está pensado para rostros: no transfiere vestuario, estilo ni composición de la referencia, que dependen enteramente del prompt.
- La calidad de identidad se degrada con bases cuantizadas: el autor señala explícitamente que q4_0 debilita la transferencia, lo que limita reducir el peso por debajo de f16.
- Requiere hardware específico: Snapdragon con 16 GB de RAM o más; en teléfonos de 8 GB hay que usar el paquete SD1.5 alternativo.
- Licencias mixtas y restrictivas: OpenRAIL++-M impone restricciones de uso, y la base RealVisXL arrastra los términos de Civitai de SG_161222, que deben revisarse antes de cualquier uso comercial. El adaptador (Apache-2.0) y el codificador (MIT) son permisivos, pero no prevalecen sobre las restricciones de la base.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar rasgos faciales inconsistentes, artefactos en manos y ojos, o parecidos imperfectos, especialmente con referencias de baja calidad o ángulos no frontales.
- Sesgos: no se documentan análisis de sesgo; al derivar de SDXL y de un ajuste fotorrealista, es previsible que herede sesgos demográficos y estéticos del dataset original.
- Sin métricas publicadas: no hay benchmarks de fidelidad ni de calidad que permitan validar las afirmaciones del autor sobre la superioridad de plus-face en dos sujetos.
- Adopción nula verificable: 0 descargas y 0 likes en el momento de la consulta, lo que dificulta contrastar experiencias de la comunidad.
- Dependencia del ecosistema TokForge: el paquete está empaquetado para el motor y la app del propio editor; su uso fuera de ese entorno requiere adaptar el cargador de IP-Adapter de stable-diffusion.cpp.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/darkmaniac7/TokForge-SDXL-IPAdapter
- Modelo base RealVisXL V4.0 Lightning: https://huggingface.co/SG161222/RealVisXL_V4.0_Lightning
- IP-Adapter original: https://huggingface.co/h94/IP-Adapter
- Licencia CreativeML OpenRAIL++-M: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/blob/main/LICENSE.md
- Motor stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- Paquete alternativo para 8 GB: https://huggingface.co/darkmaniac7/TokForge-SD15-IPAdapter
- Colección de modelos de imagen TokForge: https://huggingface.co/collections/darkmaniac7/tokforge-image-models-android-6a2195edbecaee6d762b71b4
- Web de TokForge: https://tokforge.ai
- Discord de TokForge: https://discord.gg/Acv3CBtfVm
- App en Google Play: https://play.google.com/store/apps/details?id=dev.tokforge
- TestFlight de iOS: https://testflight.apple.com/join/jnufjzRr
