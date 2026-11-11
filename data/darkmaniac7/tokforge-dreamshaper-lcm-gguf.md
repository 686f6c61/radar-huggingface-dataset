# darkmaniac7/TokForge-DreamShaper-LCM-GGUF

## Resumen

TokForge-DreamShaper-LCM-GGUF es un empaquetado en formato GGUF del modelo de generación de imágenes DreamShaper 7 (un fine-tune realista de Stable Diffusion 1.5) con el adaptador LCM-LoRA SD1.5 fusionado directamente en el UNet. Lo publica el desarrollador darkmaniac7 bajo la marca TokForge, con el objetivo explícito de permitir inferencia en dispositivo (on-device) en teléfonos Android mediante `stable-diffusion.cpp`, sin necesidad de conexión tras la descarga inicial.

El modelo no es un transformer de lenguaje ni un modelo de razonamiento: es un pipeline text-to-image completo (encoder CLIP, UNet y VAE) empaquetado en un único fichero GGUF en precisión f16 de 2,13 GB. La fusión de LCM-LoRA permite muestreo en muy pocos pasos (4-8) y sin classifier-free guidance, lo que reduce drásticamente el coste computacional y hace viable la generación de imágenes 512x512 en CPU de móvil o en GPU Adreno vía OpenCL.

Es relevante porque ejemplifica una tendencia práctica: llevar modelos de difusión a hardware de consumo mediante cuantización y formatos de runtime optimizados, en lugar de depender de servicios en la nube. El modelo hereda la licencia CreativeML OpenRAIL-M de SD 1.5 y los términos de Civitai de Lykon (prohibición de venta del modelo o de fusiones del mismo).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 (UNet + CLIP text encoder + VAE), con LCM-LoRA fusionado en el UNet |
| Parametros totales | 1.066.235.307 (dato real del repo en safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image; sin ventana de contexto de texto) |
| Tipos de cuantizacion | f16 (único fichero publicado); existe un build Q4_0 en el repo TokForge-SD-GGUF-6GB |
| Idiomas soportados | en (inglés) |
| Licencia | creativeml-openrail-m, más términos de Civitai de Lykon (no vender el modelo ni fusiones) |
| Formato de pesos | GGUF (fichero único f16 para `stable-diffusion.cpp`) |
| Tamano del repo | 2,1 GB (3 ficheros: GGUF de 2,13 GB, manifest.json y MD5SUMS) |
| Resolucion nativa | 512x512 (presets 256 y 384 también válidos) |
| Sampler / scheduler | lcm / lcm |
| Pasos recomendados | 6 (mínimo 4, refinamiento 8) |
| CFG scale | 1,5 (guiado sin classifier-free guidance) |
| Runtime objetivo | `stable-diffusion.cpp` (CPU o GPU OpenCL Adreno) |
| Clase de dispositivo | Android con 8 GB de RAM o más (catálogo TokForge) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Stable Diffusion 1.5, un modelo de difusión latente compuesto por un UNet convolucional (aproximadamente 860M de parámetros), un text encoder CLIP ViT-L/14 y un VAE. Sobre esta base, DreamShaper 7 es un fine-tune de Lykon orientado a resultados realistas, con especial énfasis en anatomía humana y manos, distribuido originalmente vía Hugging Face y Civitai.

El proceso de construcción descrito por el autor es un pipeline de fusión y exportación, no un entrenamiento nuevo: (1) carga de `Lykon/dreamshaper-7` en formato diffusers fp16; (2) fusión de `latent-consistency/lcm-lora-sdv1-5` en el UNet usando `LCMScheduler`; (3) exportación del pipeline fusionado a un `.safetensors` SD1.5 en formato original; (4) conversión a GGUF f16 con `stable-diffusion.cpp` (`-M convert --type f16`). No se documentan datos de entrenamiento adicionales, tokens, ni fases de RLHF/DPO, porque no las hay: es un repackaging.

La innovación técnica relevante es la fusión de LCM-LoRA, que convierte el muestreo en un proceso de consistencia latente de pocos pasos (4-8 frente a los 20-50 típicos de SD 1.5) y elimina la necesidad de classifier-free guidance, reduciendo el número de evaluaciones del UNet en más de un orden de magnitud. El empaquetado en un único GGUF con encoder, UNet y VAE simplifica el despliegue en `stable-diffusion.cpp`.

## Capacidades

- Generación de imágenes text-to-image a partir de descripciones en inglés.
- Muestreo rápido en pocos pasos (4-8) gracias a LCM, con CFG 1,5.
- Generación de figuras humanas y manos coherentes en pocos pasos, según el autor.
- Ejecución en CPU de teléfono Android y en GPU Qualcomm Adreno vía OpenCL.
- Funcionamiento offline tras la descarga del fichero GGUF.
- Resoluciones 256, 384 y 512 (nativa SD 1.5).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo thinking: es exclusivamente un generador de imágenes.

## Casos de uso

- Generación de imágenes offline en móvil: la app TokForge descarga el GGUF y renderiza 512x512 en 4-8 pasos sin conexión, útil en entornos sin red o con privacidad estricta.
- Prototipado rápido de conceptos visuales: con 6 pasos y CFG 1,5 se obtienen borradores en segundos en CPU de móvil, adecuados para iterar sobre ideas antes de pasar a un modelo mayor en servidor.
- Ilustración de contenido para apps Android: integración vía `stable-diffusion.cpp` en una app propia para generar avatares o imágenes de tarjetas bajo demanda en el dispositivo.
- Pruebas de pipelines on-device: sirve como referencia para validar despliegues de difusión cuantizada en hardware de consumo antes de invertir en infraestructura cloud.
- Generación de imágenes en dispositivos con 8 GB de RAM: el f16 cabe en la clase de dispositivo indicada por TokForge, y el build Q4_0 del repo hermano cubre equipos con 6 GB.
- Docencia y experimentación con difusión latente: permite demostrar el efecto de LCM-LoRA (pasos, CFG) en un runtime ligero y reproducible con CLI.
- Generación de fotografía callejera y escenas con personas: el prompt de ejemplo del autor (mercado callejero concurrido) ilustra el nicho realista del fine-tune.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas FID, CLIP score ni comparativas numéricas con otros modelos; solo describe cualitativamente la coherencia de personas y manos en pocos pasos.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero GGUF ocupa 2,13 GB; TokForge lo lista para teléfonos con 8 GB de RAM o más. Para el build Q4_0 del repo TokForge-SD-GGUF-6GB, la clase de dispositivo indicada es 6 GB.
- GPU recomendadas: en móvil, Qualcomm Adreno de alta memoria vía OpenCL; en CPU, cualquier ARM64 moderno. No se documentan requisitos para GPU de escritorio (A100, H100, RTX 4090) porque el modelo está pensado para `stable-diffusion.cpp` en dispositivo.
- Cabe en GPU de consumo: sí, por tamaño (2,13 GB en f16); cualquier GPU con 4 GB o más podría ejecutarlo mediante `stable-diffusion.cpp` con backend CUDA/Vulkan, aunque el autor no lo documenta.
- Opciones de despliegue: `stable-diffusion.cpp` (CLI y librería), app TokForge en Android (Google Play) e iOS (TestFlight). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a difusión.
- Latencia y throughput: no disponibles de forma numérica; el autor indica "unos pocos pasos" y "en segundos" de forma cualitativa, sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Pasos tipicos | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TokForge-DreamShaper-LCM-GGUF | ~1,07 mil M | 512x512 | 4-8 (LCM) | GGUF f16 | OpenRAIL-M + términos Civitai | Hugging Face, app TokForge |
| DreamShaper 7 (original) | ~1,07 mil M | 512x512 | 20-50 | safetensors (diffusers) | OpenRAIL-M + términos Civitai | Hugging Face, Civitai |
| SD 1.5 + LCM-LoRA (sin fusionar) | ~1,07 mil M | 512x512 | 4-8 (LCM) | safetensors + LoRA | OpenRAIL-M / OpenRAIL++-M | Hugging Face |
| TokForge-SD-GGUF-6GB (Q4_0) | ~1,07 mil M | 512x512 | 4-8 (LCM) | GGUF Q4_0 | OpenRAIL-M | Hugging Face |

La diferencia clave frente al DreamShaper 7 original es el formato y el muestreo: el GGUF fusionado elimina la dependencia de diffusers y reduce los pasos de 20-50 a 4-8. Frente a SD 1.5 + LCM-LoRA sin fusionar, la ventaja es el fichero único y la conversión a GGUF lista para `stable-diffusion.cpp`. No se dispone de datos de rendimiento comparativo (FID, CLIP score) para cuantificar diferencias de calidad.

## Limitaciones y advertencias

- Es un fichero de runtime para `stable-diffusion.cpp`, no un checkpoint de entrenamiento para diffusers; no sirve para fine-tuning directo sin reconversión.
- Solo soporta inglés; los prompts en otros idiomas degradan la calidad.
- Resolución nativa 512x512; no está pensado para resoluciones altas sin upscaling externo.
- Riesgo de artefactos en anatomía, manos y texto en la imagen, inherente a SD 1.5, aunque el autor afirma mejoras en pocos pasos.
- Sesgos conocidos de SD 1.5 y de su dataset de entrenamiento (LAION), incluyendo sesgos demográficos y culturales; no se documentan mitigaciones específicas.
- Licencia OpenRAIL-M con restricciones de uso; además, los términos de Civitai de Lykon prohíben vender el modelo o fusiones del mismo. Revisar antes de uso comercial.
- El autor indica que TokForge en iOS verifica cada dispositivo antes de renderizar con `stable-diffusion.cpp`; donde no está habilitado, usa modelos Core ML en su lugar.
- Sin benchmarks publicados: la calidad debe validarse empíricamente en el caso de uso concreto.
- Repo con 512 descargas y 1 like en el momento de la consulta; ecosistema pequeño y soporte limitado fuera de la app TokForge.

## Enlaces

- Hugging Face: https://huggingface.co/darkmaniac7/TokForge-DreamShaper-LCM-GGUF
- Modelo base DreamShaper 7: https://huggingface.co/Lykon/dreamshaper-7
- DreamShaper 7 en Civitai: https://civitai.com/models/4384
- LCM-LoRA SD1.5: https://huggingface.co/latent-consistency/lcm-lora-sdv1-5
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Repo hermano Q4_0: https://huggingface.co/darkmaniac7/TokForge-SD-GGUF-6GB
- Colección TokForge GGUF Models: https://huggingface.co/collections/darkmaniac7/tokforge-gguf-models-6af3fdd830c420213916bda1
- Colección TokForge Image Models (Android): https://huggingface.co/collections/darkmaniac7/tokforge-image-models-android-6a2195edbecaee6d762b71b4
- Colección TokForge iOS Models: https://huggingface.co/collections/darkmaniac7/tokforge-ios-models-6a38cca9b57803e6168ce232
- Web TokForge: https://tokforge.ai
- Discord TokForge: https://discord.gg/Acv3CBtfVm
- Google Play TokForge: https://play.google.com/store/apps/details?id=dev.tokforge
- iOS TestFlight TokForge: https://testflight.apple.com/join/jnufjzRr
