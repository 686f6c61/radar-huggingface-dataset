# darkmaniac7/TokForge-SD15-LCM-Style-Cartoon-b1

## Resumen

TokForge-SD15-LCM-Style-Cartoon-b1 es un paquete de inferencia para generación de imágenes texto-a-imagen derivado de Stable Diffusion 1.5, publicado por TokForge (darkmaniac7) en Hugging Face. No es un modelo entrenado desde cero: es una fusión de tres artefactos existentes, el checkpoint DreamShaper 7 de Lykon, el adaptador de muestreo few-step LCM-LoRA SD1.5 y la LoRA de estilo cartoon de shawn323, todo ello fusionado en el UNet y exportado al formato MNN para ejecución en dispositivos Android.

El objetivo del paquete es permitir generación de imágenes con estética cartoon directamente en teléfonos móviles, sin conexión y sin GPU dedicada. Para ello el UNet se exporta con pesos de 8 bits y batch 1 con altura y anchura dinámicas, mientras que el codificador de texto CLIP y el decodificador VAE se mantienen en f16 como referencia de SD1.5. La integración de LCM permite generar una imagen coherente de 512x512 en 4 pasos con muestreo sin guiado (CFG 1.0).

La relevancia del artefacto es de nicho: no compite en calidad con modelos de difusión modernos, sino que demuestra un pipeline reproducible de conversión de SD1.5 + LoRAs a MNN para inferencia en CPU móvil. Su interés práctico está en el despliegue on-device y en la ingeniería de exportación (fusión de LoRAs en fp32, trazado ONNX con dimensiones dinámicas, cuantización asimétrica de 8 bits), más que en capacidades generativas novedosas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 (text encoder CLIP ViT-L/14, UNet, VAE decoder) |
| Parametros totales | no disponible (repo de 1.2 GB con pesos cuantizados) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (prompt de texto CLIP, 77 tokens por defecto en SD1.5) |
| Tipos de cuantizacion | UNet en 8 bits asimétrico; text encoder y VAE decoder en f16 |
| Idiomas soportados | en |
| Licencia | CreativeML OpenRAIL-M, más los términos de Civitai de Lykon para DreamShaper (prohíbe venta) |
| Formato de pesos | MNN (`.mnn` grafo + `.mnn.weight`), tokenizer CLIP (`vocab.json`, `merges.txt`), `alphas.txt` |

## Arquitectura y entrenamiento

La arquitectura subyacente es Stable Diffusion 1.5: un codificador de texto CLIP ViT-L/14, un UNet de difusión latente y un decodificador VAE. Sobre el checkpoint base DreamShaper 7 se fusionan secuencialmente dos LoRAs en fp32 mediante `fuse_lora` en diffusers: primero LCM-LoRA SD1.5, que habilita muestreo en pocos pasos sin classifier-free guidance, y después la LoRA de estilo cartoon de shawn323. No hay entrenamiento adicional ni fine-tuning por parte del publicador; el trabajo es de fusión y exportación.

El pipeline de exportación consiste en trazar el UNet fusionado a ONNX con batch 1 y altura/anchura dinámicas (`sample=[1,4,-1,-1]`), convertirlo a MNN con pesos de 8 bits y añadir los ficheros MNN de referencia de SD1.5 para text encoder (f16) y VAE decoder (f16). La innovación técnica destacable es la exportación batch-1: como LCM muestrea con CFG 1.0, el pase incondicional del UNet es redundante, de modo que el motor ejecuta un único pase condicional por paso en lugar de un lote de dos. Esto reduce el coste computacional por paso a costa de romper compatibilidad con versiones antiguas de TokForge que siempre alimentan un batch de dos.

## Capacidades

- Generación de imágenes texto-a-imagen en resolución fija de 512x512.
- Estilo cartoon integrado de forma permanente: sombreado plano, contornos nítidos y aspecto de animación; no es conmutable ni desactivable.
- Muestreo few-step: 4 pasos por defecto, hasta 8 para refinamiento adicional.
- Muestreo sin guiado (CFG 1.0), por lo que los prompts negativos no se utilizan.
- Inferencia completamente on-device en CPU de Android, sin conexión tras la descarga.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni entradas multimodales.
- Capacidad multilingüe limitada al inglés, condicionada por el tokenizer CLIP de SD1.5.
- No dispone de modo thinking ni de cualquier otra capacidad de modelo de lenguaje.

## Casos de uso

- Generación de avatares e ilustraciones cartoon en aplicaciones Android: el paquete está pensado para ejecutarse dentro de la app TokForge en teléfonos con 8 GB de RAM o más, produciendo imágenes 512x512 en 4 pasos sin conexión.
- Creación de contenido para redes sociales con estética de animación: la LoRA de estilo fusionada garantiza una apariencia consistente entre imágenes, útil para series de publicaciones con identidad visual uniforme.
- Prototipado de interfaces y assets para apps móviles: permite generar ilustraciones de estilo cartoon en el propio dispositivo del diseñador, sin depender de servicios en la nube ni de APIs externas.
- Demostración de pipelines de conversión SD1.5 a MNN: sirve como referencia reproducible para equipos que necesiten exportar checkpoints con LoRAs fusionadas a formatos de inferencia móvil.
- Aplicaciones educativas o de ocio sin conectividad: al ejecutarse localmente tras la descarga, es apto para entornos con red restringida o para uso en modo avión.
- Generación de imágenes con requisitos de privacidad: los prompts y las imágenes no salen del dispositivo, lo que resulta adecuado para contextos donde no se permite enviar datos a servidores externos.
- Integración en apps de mensajería o stickers: la resolución 512x512 y el estilo cartoon encajan con la generación de stickers y avatares de bajo coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso objetivo (CPU móvil); el repo ocupa 1.2 GB en disco (9 ficheros), con UNet de 862 MB en 8 bits.
- Clase de dispositivo objetivo: teléfonos Android con 8 GB de RAM o más, según el catálogo de TokForge.
- GPU recomendadas: no disponibles; el paquete está exportado para ejecución en CPU mediante MNN.
- Compatibilidad con GPU de consumo: no está documentada; el formato MNN y el trazado batch-1 están orientados a CPU móvil, no a CUDA.
- Opciones de despliegue: runtime MNN dentro de la app TokForge (Android; versión iOS en TestFlight). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de difusión.
- Latencia y throughput estimados: no disponibles. El coste por imagen es de 4 pases de UNet batch-1 (hasta 8 en modo refinamiento), con text encoder y VAE en f16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TokForge-SD15-LCM-Style-Cartoon-b1 | SD1.5 (~860M en UNet, cuantizado 8 bits) | 512x512, 4 pasos | MNN (on-device) | CreativeML OpenRAIL-M + terminos Civitai de DreamShaper (no venta) | Hugging Face, uso via app TokForge |
| TokForge-SD15-LCM-Style-Cartoon | SD1.5, mismos pesos | 512x512, 4 pasos | MNN, UNet batch 2 fijo | CreativeML OpenRAIL-M + terminos Civitai | Hugging Face, builds antiguas de TokForge (p. ej. 3.6.0 beta 12) |
| Lykon/dreamshaper-7 | SD1.5 | 512x512, muestreo estandar | safetensors (diffusers) | CreativeML OpenRAIL-M + terminos Civitai | Hugging Face |
| latent-consistency/lcm-lora-sdv1-5 | LoRA sobre SD1.5 | 512x512, 4-8 pasos | safetensors (LoRA) | CreativeML OpenRAIL-M | Hugging Face |

La comparación más directa es con el propio bundle plano del mismo autor: los pesos son idénticos salvo el grafo `unet.mnn`, que en este repo es batch-1 con dimensiones dinámicas y en el otro batch-2 fijo. Frente a DreamShaper 7 sin fusionar, este paquete añade el adaptador LCM y el estilo cartoon, a costa de perder la capacidad de cambiar de estilo y de usar CFG con prompts negativos.

## Limitaciones y advertencias

- Sesgos conocidos: hereda los sesgos de DreamShaper 7 y de los datos de entrenamiento de SD1.5, no documentados en la model card.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomía incorrecta, texto ilegible y detalles incoherentes, especialmente con 4 pasos y CFG 1.0.
- Estilo no conmutable: la LoRA cartoon está fusionada en los pesos del UNet; no es posible desactivarla sin volver al bundle sin estilo.
- Sin prompt negativo: con CFG 1.0 el muestreo es sin guiado, por lo que no se pueden aplicar prompts negativos.
- Resolución fija de 512x512 y ventana de prompt limitada por CLIP; el modelo solo declara soporte de inglés.
- Restricciones de licencia: CreativeML OpenRAIL-M impone restricciones de uso, y los términos de Civitai de DreamShaper prohíben la venta; es necesario revisar ambas licencias antes de cualquier uso comercial.
- Compatibilidad de despliegue frágil: el grafo batch-1 provoca fallos en builds antiguas de TokForge (anteriores a 3.6.0 beta 24), que deben usar el repo plano.
- Ecosistema cerrado: la ejecución está atada al runtime MNN y a la app TokForge; no hay pesos en safetensors ni GGUF para otros motores.
- Madurez y adopción: 0 descargas y 0 likes en el momento de la ficha, lo que limita la validación por parte de la comunidad.

## Enlaces

- Hugging Face (este repo): https://huggingface.co/darkmaniac7/TokForge-SD15-LCM-Style-Cartoon-b1
- Repo plano (UNet batch-2): https://huggingface.co/darkmaniac7/TokForge-SD15-LCM-Style-Cartoon
- Modelo base DreamShaper 7: https://huggingface.co/Lykon/dreamshaper-7
- LCM-LoRA SD1.5: https://huggingface.co/latent-consistency/lcm-lora-sdv1-5
- LoRA de estilo cartoon: https://huggingface.co/shawn323/sd-v1.5-lora-cartoon
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Web de TokForge: https://tokforge.ai
- Discord de TokForge: https://discord.gg/Acv3CBtfVm
- App en Google Play: https://play.google.com/store/apps/details?id=dev.tokforge
- TestFlight de iOS: https://testflight.apple.com/join/jnufjzRr
- Colección TokForge Image Models (Android): https://huggingface.co/collections/darkmaniac7/tokforge-image-models-android-6a2195edbecaee6d762b71b4
- Colección TokForge SD1.5 LCM Styles (MNN): https://huggingface.co/collections/darkmaniac7/tokforge-sd15-lcm-styles-mnn-6af3fddeecdd665d9b523cbe
