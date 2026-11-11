# darkmaniac7/TokForge-SD15-IPAdapter

## Resumen

TokForge-SD15-IPAdapter es un paquete de generación de imágenes para inferencia en dispositivo (on-device) publicado por TokForge (darkmaniac7 en Hugging Face). Combina tres piezas: el modelo base DreamShaper-7 de Lykon (un finetune realista de Stable Diffusion 1.5), el adaptador IP-Adapter plus-face de h94 y el codificador de imagen OpenCLIP ViT-H-14. El resultado permite tomar una foto de referencia de una persona y renderizar su rostro en cualquier escena descrita mediante un prompt de texto.

La propuesta diferencial es el despliegue en teléfonos Android con 8 GB de RAM o más, mediante el motor stable-diffusion.cpp con soporte GGUF y ejecución en CPU o GPU Adreno vía OpenCL. El paquete se distribuye como un GGUF f16 del UNet, CLIP text encoder y VAE fusionados (2,21 GB), más el adaptador (98,2 MB) y el codificador ViT-H (2,53 GB) en safetensors, totalizando 4,84 GB.

Frente a alternativas de identidad más pesadas como SDXL PhotoMaker o SDXL IP-Adapter, esta variante SD1.5 prioriza alcance: es la opción más ligera del catálogo de TokForge y la que cabe en el mayor número de dispositivos. La licencia es mixta: CreativeML OpenRAIL-M para el base, Apache-2.0 para el adaptador y MIT para el codificador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 (UNet + CLIP text encoder + VAE), con IP-Adapter plus-face (Resampler de 16 tokens + cross-attention desacoplada) y codificador OpenCLIP ViT-H-14 |
| Parametros totales | 1.066.235.307 (base SD1.5); el paquete incluye además el adaptador y el codificador ViT-H |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión; ventana de texto CLIP de 77 tokens) |
| Tipos de cuantizacion | f16 (GGUF del base); safetensors para adaptador y codificador; el autor advierte que q4_0 degrada la identidad transferida |
| Idiomas soportados | en |
| Licencia | creativeml-openrail-m (base) + Apache-2.0 (adaptador) + MIT (codificador de imagen) + términos de Civitai de Lykon |
| Formato de pesos | GGUF (base f16) + safetensors (IP-Adapter y ViT-H) |
| Tamano del repo | 4,8 GB (5 archivos) |
| Resolucion nativa | 512x512 |
| Sampler / scheduler | euler_a / discrete |
| Pasos recomendados | 30 |
| CFG scale | 7.0 |
| IP-Adapter scale | 0.6 (rango 0.5-0.6 para escena con identidad reconocible; ~0.8 reconstruye la referencia) |

## Arquitectura y entrenamiento

El base es DreamShaper-7, un finetune de SD1.5 orientado a realismo, convertido de diffusers a un único GGUF f16 mediante la ruta de conversión de stable-diffusion.cpp (`-M convert --type f16`). Se eligió f16 y no una cuantización q4_0 porque, según el autor, la cross-attention desacoplada del IP-Adapter y el Resampler facial pierden calidad de sujeto con cuantizaciones agresivas. No se especifica en la información disponible el dataset de entrenamiento del finetune ni el número de tokens o pasos empleados.

El IP-Adapter plus-face es el componente clave: su Resampler extrae únicamente el rostro (16 tokens a partir del estado oculto penúltimo del ViT-H), de modo que la identidad se preserva mientras el prompt controla el resto de la escena. Esto lo distingue del `ip-adapter_sd15` base, que proyecta el embedding CLIP pooled completo (4 tokens) y arrastra también la escena de la referencia. El loader de IP-Adapter de TokForge para sd.cpp autodetecta plus-face por la presencia de `image_proj.latents`. El codificador debe ser ViT-H (no bigG), requisito específico de la ruta plus-face.

## Capacidades

- Generación de imágenes texto-a-imagen con el base DreamShaper-7 a 512x512 nativo.
- Imagen-a-imagen con transferencia de identidad facial desde una foto de referencia.
- Transferencia selectiva del rostro: el adaptador plus-face aísla la cara y deja la escena al prompt.
- Ajuste fino del equilibrio identidad/escena mediante el parámetro `ip-adapter-scale` (0.5-0.6 escena con identidad; ~0.8 reconstrucción de la referencia).
- Inferencia completamente local en Android, sin conexión tras la descarga.
- Ejecución en CPU y en GPU Adreno vía OpenCL a través de stable-diffusion.cpp.
- Soporte de prompt negativo para control de calidad y composición.
- No soporta tool calling, agentes, razonamiento multi-step ni otras capacidades de lenguaje: es un modelo de difusión de imagen.

## Casos de uso

- Retratos personalizados en móvil: el usuario adjunta una selfie y describe una escena ("yo como superhéroe volando sobre Nueva York"); el adaptador conserva el rostro y el prompt dirige el resto. Adecuado por su ejecución on-device y su bajo requisito de 8 GB de RAM.
- Aplicaciones de avatares y contenido social: generación de variaciones de un mismo personaje en distintos entornos sin subir fotos a servidores externos, lo que reduce exposición de datos biométricos.
- Pruebas de vestuario o estilismo virtual: mantener la identidad del cliente mientras se cambia ropa, iluminación o localización mediante prompt, con `ip-adapter-scale` ajustado para preservar el parecido.
- Prototipado rápido de personajes para ilustración o cómic: usar una foto de referencia como ancla de identidad y generar poses y escenas variadas a 512x512 con 30 pasos.
- Demos y aplicaciones educativas de IA generativa: el paquete completo (4,84 GB) y el motor sd.cpp permiten desplegar un pipeline de difusión con control de identidad en hardware de gama media.
- Integración en apps Android mediante TokForge: el catálogo del modelo ya está disponible en Google Play y TestFlight, de modo que un desarrollador puede evaluar el comportamiento antes de integrar el motor sd.cpp con su port de IP-Adapter.
- Generación de imágenes sin conectividad: escenarios de campo, entornos con red restringida o aplicaciones de privacidad donde la inferencia debe ocurrir íntegramente en el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta parámetros de render (sampler euler_a, scheduler discrete, 30 pasos, cfg 7.0, ip-adapter-scale 0.6, 512x512) y el requisito de hardware (Android con 8 GB de RAM o más), sin métricas de FID, CLIP score, similitud facial ni latencias medidas.

## Requisitos de hardware

- VRAM/RAM estimada: el autor indica teléfonos Android con 8 GB de RAM o más como clase mínima del catálogo TokForge; el paquete descargable son 4,84 GB en 5 archivos.
- GPU recomendadas: GPU Adreno con soporte OpenCL para aceleración; también ejecutable en CPU.
- Cabe en GPU de consumo: sí, en el sentido de que el objetivo es hardware móvil; no se documentan requisitos para GPU de escritorio (A100, H100, RTX 4090) en la información disponible.
- Opciones de despliegue: stable-diffusion.cpp (motor principal, con el port de IP-Adapter de TokForge), app TokForge para Android (Google Play) e iOS (TestFlight). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusión.
- Latencia y throughput: no disponibles en la información proporcionada. El autor señala que reducir los pasos por debajo de 30 acelera la generación a costa de calidad.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto/resolucion | Identidad | Licencia | Despliegue |
|---|---|---|---|---|---|---|
| TokForge-SD15-IPAdapter | DreamShaper-7 (SD1.5) | 1.066.235.307 (base) | 512x512 nativo | IP-Adapter plus-face (rostro, 16 tokens) | OpenRAIL-M + Apache-2.0 + MIT | Android on-device (sd.cpp, CPU/Adreno) |
| SDXL IP-Adapter (tier TokForge) | SDXL | no disponible | no disponible | IP-Adapter sobre SDXL | no disponible | Android on-device, requiere más recursos |
| SDXL PhotoMaker (tier TokForge) | SDXL | no disponible | no disponible | PhotoMaker | no disponible | Android on-device, requiere más recursos |
| IP-Adapter original (h94) | SD1.5 | adaptador ~98 MB | 512x512 | IP-Adapter estándar (escena completa, 4 tokens) | Apache-2.0 | requiere pipeline diffusers/sd.cpp |

Los tiers SDXL de TokForge y el IP-Adapter original se citan en la model card como referencia; no se dispone de sus especificaciones completas ni de métricas comparativas en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: los prompts deben redactarse en inglés según el campo `language: en`.
- Resolución nativa limitada a 512x512; no se documenta soporte de resoluciones superiores.
- El adaptador plus-face transfiere únicamente el rostro; no preserva cuerpo, ropa ni fondo de la referencia.
- Con `ip-adapter-scale` bajo (~0.5-0.6) la identidad puede ser menos fiel; con valores altos (~0.8) la escena tiende a reproducir la referencia.
- El autor advierte que cuantizar el base a q4_0 degrada la calidad de la identidad transferida; se recomienda f16.
- Licencia mixta y restrictiva en parte: CreativeML OpenRAIL-M impone restricciones de uso (incluido uso comercial condicionado) y los términos de Civitai de Lykon se suman al base; el adaptador es Apache-2.0 y el codificador MIT, pero el conjunto hereda las limitaciones del base.
- Riesgo de alucinación visual y artefactos propios de SD1.5, especialmente en manos, texto y anatomía en escenas complejas.
- Sesgos conocidos de los modelos de difusión entrenados con datos web (representación demográfica, estéticos y culturales); no se documentan mitigaciones específicas.
- Requiere hardware móvil de gama media-alta (8 GB de RAM o más); no se garantiza funcionamiento en dispositivos inferiores.
- No es un modelo de lenguaje: no admite tool calling, agentes ni razonamiento textual.

## Enlaces

- Hugging Face: https://huggingface.co/darkmaniac7/TokForge-SD15-IPAdapter
- Modelo base: https://huggingface.co/Lykon/dreamshaper-7
- IP-Adapter: https://huggingface.co/h94/IP-Adapter
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- Web de TokForge: https://tokforge.ai
- Discord de TokForge: https://discord.gg/Acv3CBtfVm
- Google Play: https://play.google.com/store/apps/details?id=dev.tokforge
- iOS TestFlight: https://testflight.apple.com/join/jnufjzRr
- Colección TokForge GGUF Models: https://huggingface.co/collections/darkmaniac7/tokforge-gguf-models-6af3fdd830c420213916bda1
- Colección TokForge Image Models (Android): https://huggingface.co/collections/darkmaniac7/tokforge-image-models-android-6a2195edbecaee6d762b71b4
