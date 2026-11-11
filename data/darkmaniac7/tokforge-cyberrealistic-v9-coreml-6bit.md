# darkmaniac7/TokForge-CyberRealistic-V9-CoreML-6bit

## Resumen

TokForge-CyberRealistic-V9-CoreML-6bit es un paquete de inferencia en formato Core ML del modelo de generación de imágenes fotorrealistas CyberRealistic V9, un fine-tune de Stable Diffusion 1.5 desarrollado por cyberdelia. Lo publica darkmaniac7 bajo la marca TokForge para ejecutar generación texto-a-imagen directamente en el Apple Neural Engine de iPhone e iPad, sin conexión a la red una vez descargado. No es un modelo nuevo: es una conversión de formato (PyTorch a Core ML) con cuantización de 6 bits por paletización, sin reentrenamiento de pesos.

El interés práctico reside en que permite llevar un modelo de difusión de 512 x 512 a hardware móvil de Apple con un consumo de almacenamiento contenido (917 MB el zip que descarga la app, 1,87 GB el repositorio completo). Usa atención `split_einsum_v2`, optimizada para la Neural Engine, y VAE en fp16 mientras UNet y text encoder van paletizados a 6 bits.

La relevancia es acotada: está pensado exclusivamente para la app TokForge en iOS 17 o superior, con 4 GB de RAM o más. Para cualquier otro pipeline (diffusers, ComfyUI, PyTorch) no sirve, ya que el artefacto son ficheros `.mlmodelc` compilados y no pesos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 (UNet, text encoder CLIP, VAE) |
| Parametros totales | no disponible (hereda los de SD 1.5, no declarados en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (prompt de texto, sin ventana declarada) |
| Tipos de cuantizacion | 6 bits palettized (UNet y text encoder); VAE en fp16 |
| Idiomas soportados | en (ingles) |
| Licencia | CreativeML OpenRAIL-M, mas terminos de Civitai de Cyberdelia |
| Formato de pesos | Core ML compilado (`.mlmodelc`); zip de recursos y carpeta `Resources/` |

## Arquitectura y entrenamiento

El modelo subyacente es CyberRealistic V9, un fine-tune fotorrealista de Stable Diffusion 1.5 con VAE integrado, del que se parte del checkpoint `CyberRealistic_V9_FP16`. La conversión carga ese checkpoint vía `StableDiffusionPipeline.from_single_file` de diffusers, lo reexporta al formato diffusers de SD 1.5 y convierte UNet, text encoder, VAE decoder y VAE encoder a Core ML con `ml-stable-diffusion` 1.1.0 (`torch2coreml`, atención `SPLIT_EINSUM_V2`). Después aplica paletización de 6 bits (`--quantize-nbits 6`) y empaqueta los recursos para el CLI de Swift (`--bundle-resources-for-swift-cli`).

No hay entrenamiento ni ajuste fino en esta publicación: es una redistribución y conversión de formato. La conversión tuvo un pico de unos 10,5 GB de RAM y no necesitó `--chunk-unet`. El UNet usa batch 2 para que el classifier-free guidance funcione con normalidad. La resolución de 512 x 512 está fijada en el modelo compilado. Herramientas declaradas: ml-stable-diffusion 1.1.0, coremltools 9.0 y torch 2.8.0.

## Capacidades

- Generación de imágenes texto-a-imagen fotorrealistas a 512 x 512, resolución nativa de SD 1.5 fijada en el modelo compilado.
- Inferencia en dispositivo sobre Apple Neural Engine mediante Core ML, con unidades de cómputo `.cpuAndNeuralEngine`.
- Funcionamiento sin conexión tras la descarga del bundle.
- Classifier-free guidance estándar (CFG 7.0 recomendado), con UNet en batch 2.
- Ajuste de pasos de muestreo (25-30 recomendado; TokForge arranca en 28).
- Integración con la app TokForge para iOS como modelo "CyberRealistic V9 · 6-bit (ANE)", marcado como modelo maduro (fotorrealista).
- No soporta tool calling, agentes, razonamiento multi-paso, visión de entrada ni audio: es un pipeline de difusión puro.
- Capacidad multilingüe limitada al inglés en los prompts.

## Casos de uso

- Generación de retratos y fotografía sintética en apps iOS: el bundle se carga en la Neural Engine y produce imágenes de 512 x 512 en el propio dispositivo, útil para apps de edición o avatares que no pueden enviar prompts a la nube.
- Prototipado de conceptos visuales sin conexión: al ejecutarse en local tras la descarga, permite iterar prompts en entornos sin red (campo, avión, zonas con conectividad limitada).
- Apps de contenido creativo con requisitos de privacidad: los prompts y las imágenes no salen del dispositivo, lo que encaja en flujos donde el usuario no quiere enviar descripciones a servidores externos.
- Integración en TokForge como estilo "Cyber-real": la app lo ofrece como modelo seleccionable dentro de su catálogo de imagen, con descarga y desempaquetado automáticos del zip de 917 MB.
- Generación de material de referencia para ilustración: con 25-30 pasos y CFG 7.0 se obtienen imágenes fotorrealistas que sirven como base para retoque posterior en herramientas de escritorio.
- Demos y pruebas de concepto de difusión en dispositivo: útil para evaluar el rendimiento de SD 1.5 paletizado a 6 bits en Apple Silicon móvil antes de comprometerse con un pipeline mayor.
- Sustituto ligero del 8-bit en dispositivos con menos almacenamiento: el zip de 917 MB frente a la variante de 8 bits reduce el espacio ocupado en el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de FID, CLIP score ni comparativas cuantitativas con otros modelos.

## Requisitos de hardware

- Dispositivo: iPhone o iPad con 4 GB de RAM o más y iOS 17 o posterior (catalogo de TokForge para iOS).
- En iOS 16 la app recurre a un modelo FP16 alternativo, no a este bundle de 6 bits.
- Almacenamiento: 1,87 GB para el repositorio completo (23 ficheros); la app descarga solo el zip de 917 MB y lo descomprime.
- Cómputo: Apple Neural Engine con unidades `.cpuAndNeuralEngine`; atención `split_einsum_v2`.
- Memoria durante la conversión (no inferencia): pico de unos 10,5 GB de RAM, sin necesidad de `--chunk-unet`.
- Despliegue: exclusivamente mediante Core ML y `ml-stable-diffusion` (Swift CLI o la app TokForge). No es compatible con vLLM, llama.cpp, Ollama ni TGI, que son runtimes de modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Base | Formato | Cuantizacion | Resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TokForge-CyberRealistic-V9-CoreML-6bit | CyberRealistic V9 (SD 1.5) | Core ML compilado | 6 bits palettized | 512 x 512 fija | CreativeML OpenRAIL-M | Hugging Face, app TokForge iOS |
| TokForge-CyberRealistic-V9-CoreML-8bit | CyberRealistic V9 (SD 1.5) | Core ML compilado | 8 bits | 512 x 512 fija | CreativeML OpenRAIL-M | Hugging Face (mismo autor) |
| cyberdelia/CyberRealistic (V9) | SD 1.5 | safetensors (diffusers) | fp16 | 512 x 512 nativa | CreativeML OpenRAIL-M + terminos Civitai | Hugging Face |

La diferencia principal frente al checkpoint original es el formato y la cuantización: el original corre en PyTorch/diffusers en GPU de escritorio, mientras que este bundle solo corre en Core ML sobre Apple Silicon móvil. Frente a la variante de 8 bits del mismo autor, la de 6 bits ocupa menos y puede mostrar artefactos de banding o arcoíris en algunos prompts.

## Limitaciones y advertencias

- Resolución fija de 512 x 512: el tamano esta incorporado en el modelo compilado y no se puede cambiar en tiempo de ejecucion.
- La paletizacion de 6 bits puede producir artefactos de banding o arcoíris en ciertos prompts; el autor remite a la variante de 8 bits como opcion de mayor precision.
- Es un bundle de runtime Core ML, no un checkpoint de diffusers ni de PyTorch: no se puede cargar en pipelines habituales de escritorio.
- Solo funciona en la app TokForge para iOS (iOS 17+, 4 GB de RAM o mas); en iOS 16 la app usa un modelo FP16 distinto.
- Prompts en ingles; no se declara soporte multilingue.
- Riesgo de sesgos y alucinaciones visuales inherente a SD 1.5 y a su dataset de entrenamiento, no documentado especificamente en esta model card.
- Licencia CreativeML OpenRAIL-M con restricciones de uso (incluye clausulas de uso aceptable) y, ademas, los terminos de Civitai de Cyberdelia; hay que revisarlos antes de uso comercial.
- El modelo esta marcado como contenido maduro (fotorrealista) en TokForge y solo aparece tras activar modelos maduros en la app.
- No se han publicado benchmarks ni metricas de calidad para esta conversion.

## Enlaces

- Hugging Face: https://huggingface.co/darkmaniac7/TokForge-CyberRealistic-V9-CoreML-6bit
- Variante 8 bits: https://huggingface.co/darkmaniac7/TokForge-CyberRealistic-V9-CoreML-8bit
- Modelo base: https://huggingface.co/cyberdelia/CyberRealistic
- Coleccion TokForge iOS Models: https://huggingface.co/collections/darkmaniac7/tokforge-ios-models-6a38cca9b57803e6168ce232
- TokForge: https://tokforge.ai
- Discord de TokForge: https://discord.gg/Acv3CBtfVm
- Google Play: https://play.google.com/store/apps/details?id=dev.tokforge
- iOS TestFlight: https://testflight.apple.com/join/jnufjzRr
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Apple ml-stable-diffusion: https://github.com/apple/ml-stable-diffusion
