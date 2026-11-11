# darkmaniac7/TokForge-SD-GGUF-6GB

## Resumen

TokForge-SD-GGUF-6GB es un modelo de generación de imágenes text-to-image empaquetado en un único archivo GGUF para su ejecución en dispositivo (on-device) mediante `stable-diffusion.cpp`. Lo publica darkmaniac7 bajo la marca TokForge, una aplicación de inferencia local para iOS y Android. El modelo es una fusión de DreamShaper 7 (un finetune realista de Stable Diffusion 1.5, obra de Lykon) con el LCM-LoRA de SD1.5, que permite muestreo en pocos pasos sin clasificador de guía (guidance-free). El resultado se cuantiza a Q4_0 en el UNet y se mantiene en F16 en el codificador de texto CLIP y en el VAE.

La relevancia del modelo es práctica: ofrece generación de imágenes por difusión en iPhone e iPad con 6 GB de RAM o más, sin conexión a red una vez descargado el archivo de 1,75 GB. La decisión de dejar CLIP y VAE en F16 responde a una restricción del runtime de TokForge para iOS, que solo carga archivos de `stable-diffusion.cpp` cuyo codificador de texto no esté cuantizado. El UNet, dominado por convoluciones 3x3 que ggml mantiene en F16, limita la reducción de tamaño adicional.

Se trata de un modelo pequeño (unos 1.066 millones de parámetros en el UNet, según el recuento de safetensors del modelo base) con contexto nativo de 512x512 píxeles, licencia CreativeML OpenRAIL-M y términos adicionales de Civitai que prohíben la venta del modelo o de sus fusiones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Latent diffusion (UNet + CLIP text encoder + VAE), basada en Stable Diffusion 1.5 con LCM-LoRA fusionado |
| Parámetros totales | 1.066.235.307 (UNet del modelo base, recuento safetensors) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (resolución nativa 512x512; no aplica ventana de tokens) |
| Tipos de cuantización | Q4_0 en pesos lineales y de normalización del UNet; F16 en CLIP y VAE |
| Idiomas soportados | en (inglés) |
| Licencia | creativeml-openrail-m, más términos de Civitai de Lykon (prohíbe la venta) |
| Formato de pesos | GGUF (archivo único `dreamshaper-7-lcm-q4_0-clipf16.gguf`, 1.747.190.784 bytes) |

## Arquitectura y entrenamiento

El modelo es un pipeline de difusión latente clásico de SD1.5: un UNet que predice el ruido en el espacio latente, un codificador de texto CLIP para condicionar el prompt y un VAE que decodifica los latentes a píxeles. Sobre el UNet de DreamShaper 7 se ha fusionado el LCM-LoRA de SD1.5, lo que habilita muestreo en 4-8 pasos con CFG 1,5 en lugar de los 20-50 pasos típicos de SD1.5. La conversión a GGUF se realizó con `stable-diffusion.cpp` de leejet: los pesos lineales y de normalización del UNet se cuantizaron a Q4_0, mientras que todos los tensores de CLIP y VAE se conservaron en F16. A diferencia de una versión anterior (`TokForge-DreamShaper-LCM-GGUF-q4`), aquí tampoco se cuantizan los pesos LayerNorm del CLIP.

No se dispone de información sobre el dataset de entrenamiento original de DreamShaper 7, el número de tokens, la composición de datos ni si hubo RLHF o DPO; esos detalles pertenecen al modelo base y no se recogen en la información proporcionada. La innovación técnica destacable es el empaquetado autocontenido en un solo GGUF con cuantización selectiva (solo UNet en Q4_0) y la fusión del LCM-LoRA para decodificación en pocos pasos, optimizada para el runtime de iOS.

## Capacidades

- Generación de imágenes text-to-image a 512x512 píxeles, resolución nativa de SD1.5.
- Muestreo en pocos pasos (4-8, recomendado 6) con sampler y scheduler LCM y CFG 1,5, sin clasificador de guía.
- Estilo realista heredado de DreamShaper 7, con capacidad de ilustración y retrato.
- Ejecución on-device sin conexión a red una vez descargado el archivo.
- Integración con la app TokForge para iOS (iPhone e iPad) vía `stable-diffusion.cpp`.
- Compatibilidad con el ecosistema `stable-diffusion.cpp` (GGUF).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni otras capacidades de LLM.
- No soporta visión de entrada, audio ni thinking mode; es exclusivamente generación de imágenes.
- Capacidades multilingües limitadas al inglés en los prompts.

## Casos de uso

- Generación de imágenes offline en iPhone e iPad: el modelo se descarga una vez (1,75 GB) y permite crear imágenes sin conexión, útil en entornos sin red o con privacidad estricta, gracias a su ejecución on-device con `stable-diffusion.cpp`.
- Prototipado rápido de conceptos visuales en movilidad: con 6 pasos y CFG 1,5, la latencia es baja y permite iterar prompts sobre la marcha en un dispositivo de 6 GB de RAM o más.
- Aplicaciones de creación de contenido para redes sociales: generación de ilustraciones y retratos realistas a 512x512 que luego se reescalan en el dispositivo o en servidor.
- Demos y pruebas de concepto de inferencia local en iOS: sirve para evaluar el rendimiento de `stable-diffusion.cpp` en hardware Apple antes de desplegar modelos mayores.
- Generación de avatares y retratos estilizados: el finetune realista de DreamShaper 7 es adecuado para retratos y figuras humanas con prompts en inglés.
- Educación y talleres sobre difusión: el archivo único GGUF con cuantización selectiva (UNet Q4_0, CLIP y VAE F16) es un ejemplo didáctico de empaquetado y cuantización para runtime móvil.
- Integración en la app TokForge: el modelo aparece en el catálogo de la app para iOS y se selecciona desde la pantalla de generación de imágenes en la sección SD-GGUF (sd.cpp).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como FID, CLIP score ni comparativas cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM/RAM estimada: el archivo pesa 1,75 GB; TokForge for iOS lo lista para dispositivos con 6 GB de RAM o más.
- GPU recomendadas: no disponible; el destino es iPhone e iPad con `stable-diffusion.cpp`. No se especifican modelos de GPU de escritorio.
- ¿Cabe en GPU consumer? No hay datos específicos para GPU de escritorio; el tamaño del archivo (1,75 GB) sugiere que cabría en GPUs consumer con suficiente VRAM, pero no se confirma en la información.
- Opciones de despliegue: `stable-diffusion.cpp` (runtime principal), app TokForge para iOS (TestFlight) y app TokForge para Android (que usa la build f16 del mismo modelo).
- Latencia y throughput: no disponible. La model card solo indica 6 pasos (rango 4-8) con sampler LCM y CFG 1,5, sin cifras de tiempo por imagen.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TokForge-SD-GGUF-6GB | 1.066.235.307 (UNet) | 512x512 | Q4_0 UNet, F16 CLIP/VAE | creativeml-openrail-m + términos Civitai | GGUF, app TokForge iOS |
| TokForge-DreamShaper-LCM-GGUF (f16) | no disponible | 512x512 | F16 | creativeml-openrail-m + términos Civitai | GGUF, app TokForge Android |
| TokForge-DreamShaper-LCM-GGUF-q4 (versión anterior) | no disponible | 512x512 | Q4_0 con LayerNorm de CLIP cuantizado | creativeml-openrail-m + términos Civitai | GGUF |
| Lykon/dreamshaper-7 (base) | no disponible | 512x512 | safetensors sin cuantizar | creativeml-openrail-m + términos Civitai | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes; la model card solo señala que la cuantización Q4_0 del UNet puede cambiar ligeramente las imágenes respecto a la build f16.

## Limitaciones y advertencias

- La cuantización Q4_0 del UNet puede alterar ligeramente las imágenes generadas en comparación con la build f16.
- TokForge para iOS comprueba cada dispositivo antes de renderizar con `stable-diffusion.cpp`; donde esa ruta no está habilitada, usa sus modelos de imagen Core ML en su lugar.
- Sesgos conocidos: no se documentan sesgos específicos en la información proporcionada; al derivar de SD1.5 y DreamShaper 7, hereda los sesgos del dataset original de SD1.5, no detallados aquí.
- Riesgo de alucinación visual: no aplica en el sentido de LLM, pero la generación puede producir imágenes incoherentes o anatómicamente incorrectas, especialmente con prompts ambiguos o fuera del dominio realista.
- Limitación de idioma: los prompts deben ir en inglés; no se garantiza buen rendimiento en otros idiomas.
- Restricciones de licencia: CreativeML OpenRAIL-M impone restricciones de uso basadas en el uso; además, los términos de Civitai de Lykon prohíben vender el modelo o fusiones del mismo. Revisar ambas licencias antes de uso comercial.
- El LCM-LoRA está bajo CreativeML OpenRAIL++-M.
- Resolución nativa limitada a 512x512; no se documenta soporte para resoluciones mayores sin reescalado.
- Dependencia del runtime `stable-diffusion.cpp` y de la app TokForge; no se documentan otras rutas de despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/darkmaniac7/TokForge-SD-GGUF-6GB
- Modelo base DreamShaper 7: https://huggingface.co/Lykon/dreamshaper-7
- LCM-LoRA SD1.5: https://huggingface.co/latent-consistency/lcm-lora-sdv1-5
- Stable Diffusion v1.5: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- DreamShaper 7 en Civitai: https://civitai.com/models/4384
- TokForge: https://tokforge.ai
- Discord de TokForge: https://discord.gg/Acv3CBtfVm
- Google Play de TokForge: https://play.google.com/store/apps/details?id=dev.tokforge
- iOS TestFlight de TokForge: https://testflight.apple.com/join/jnufjzRr
- Build f16 para Android: https://huggingface.co/darkmaniac7/TokForge-DreamShaper-LCM-GGUF
- Versión anterior q4: https://huggingface.co/darkmaniac7/TokForge-DreamShaper-LCM-GGUF-q4
- Colección TokForge GGUF Models: https://huggingface.co/collections/darkmaniac7/tokforge-gguf-models-6af3fdd830c420213916bda1
- Colección TokForge iOS Models: https://huggingface.co/collections/darkmaniac7/tokforge-ios-models-6a38cca9b57803e6168ce232
