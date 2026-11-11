# darkmaniac7/TokForge-epiCRealism-CoreML-6bit

## Resumen

TokForge-epiCRealism-CoreML-6bit es un bundle de inferencia en formato Core ML del modelo de generación de imágenes epiCRealism, un fine-tune de Stable Diffusion 1.5 orientado a resultados fotorrealistas y cinematográficos. Lo publica darkmaniac7 bajo la marca TokForge, una aplicación de inferencia en dispositivo para iOS y Android, y deriva del checkpoint original de epinikion alojado en Hugging Face por emilianJR. No se ha reentrenado ningún peso: se trata de una conversión de formato (PyTorch a Core ML) más una cuantización por paletización a 6 bits.

El interés técnico del artefacto no está en el modelo generativo en sí, sino en su empaquetado: los componentes TextEncoder, UNet, VAEDecoder y VAEEncoder se compilan como `.mlmodelc` con atención `split_einsum_v2` para aprovechar la Apple Neural Engine, y el UNet se paletiza a 6 bits mientras el VAE se mantiene en fp16. El resultado ocupa 1,87 GB repartidos en 23 ficheros, o 914 MB si se descarga el zip compilado, y está pensado para ejecutarse íntegramente en iPhone e iPad con iOS 17 o superior y 4 GB de RAM o más.

La relevancia práctica es acotada pero clara: permite generar imágenes fotorrealistas a 512 x 512 sin conexión y sin GPU dedicada, dentro de la app TokForge. La contrapartida es que no es un checkpoint utilizable en diffusers ni en PyTorch, la resolución está fijada en el propio modelo compilado y la licencia hereda tanto CreativeML OpenRAIL-M como los términos de Civitai de epinikion, que exigen atribución y prohíben la venta del modelo o de fusiones del mismo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 (UNet, encoder de texto CLIP, VAE) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image; sin ventana de contexto de texto) |
| Tipos de cuantizacion | Paletizacion a 6 bits en UNet y encoder de texto; VAE en fp16 |
| Idiomas soportados | Ingles (prompts en `en`) |
| Licencia | CreativeML OpenRAIL-M, mas terminos de Civitai de epinikion (atribucion obligatoria, prohibida la venta) |
| Formato de pesos | Core ML compilado (`.mlmodelc`), mas `vocab.json` y `merges.txt` de CLIP; no incluye safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Stable Diffusion 1.5: un UNet para el proceso de difusion, un encoder de texto CLIP para condicionar el prompt y un VAE para codificar y decodificar entre espacio latente y pixeles. epiCRealism es un fine-tune de epinikion sobre esa base, orientado a retratos y escenas fotorrealistas con acabado cinematografico. No se dispone de informacion sobre el dataset de ajuste, el numero de pasos de entrenamiento ni si se aplicaron tecnicas de preferencia (RLHF/DPO), por lo que esos datos deben considerarse no disponibles.

La innovacion tecnica de este repositorio es exclusivamente de despliegue. La conversion se realizo con `python_coreml_stable_diffusion.torch2coreml` de Apple `ml-stable-diffusion` 1.1.0, usando coremltools 9.0 y torch 2.8.0, con la implementacion de atencion `SPLIT_EINSUM_V2` para ejecutar en la Neural Engine. Sobre el UNet y el encoder de texto se aplico paletizacion de 6 bits (`--quantize-nbits 6`), mientras que el VAE se dejo en fp16. El UNet se compila con batch 2 para permitir classifier-free guidance convencional, y los recursos se empaquetaron para la CLI de Swift (`--bundle-resources-for-swift-cli`). La conversion alcanzo un pico de unos 9,8 GB de RAM y no requirio `--chunk-unet`. No hubo reentrenamiento: es una redistribucion para inferencia en dispositivo.

## Capacidades

- Generacion de imagenes text-to-image a resolucion fija de 512 x 512, con estetica fotorrealista y cinematografica heredada de epiCRealism.
- Condicionamiento por prompt en ingles mediante encoder CLIP, con classifier-free guidance estandar (CFG 7.0 recomendado).
- Ejecucion en dispositivo sobre Apple Neural Engine mediante Core ML, con unidades de computo `.cpuAndNeuralEngine`.
- Funcionamiento sin conexion una vez descargado el bundle, ya que la inferencia es local.
- Integracion con la app TokForge para iOS, donde aparece catalogado como "epiCRealism · 6-bit (ANE)" y se usa para el estilo "Soft photo".
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, vision de entrada, audio ni modo de pensamiento: es un modelo puramente generativo de imagenes.
- Soporte multilingue limitado al ingles en los prompts.

## Casos de uso

- Generacion de retratos fotorrealistas en iPhone o iPad: con 20 a 30 pasos y CFG 7.0, el modelo produce retratos con acabado cinematografico directamente en el dispositivo, sin enviar prompts a un servidor.
- Creacion de imagenes sin conexion en entornos con conectividad limitada: una vez descargado el zip de 914 MB, la generacion no requiere red, lo que resulta util en viajes, entornos aislados o situaciones de privacidad estricta.
- Prototipado rapido de conceptos visuales para diseno: la app permite iterar sobre un prompt y obtener variaciones a 512 x 512 en el propio telefono, sin coste de GPU en la nube.
- Aplicaciones de privacidad por diseno: al ejecutarse en la Neural Engine local, los prompts y las imagenes no salen del dispositivo, lo que encaja en flujos donde el contenido es sensible.
- Demostraciones y pruebas de concepto de inferencia on-device: sirve para evaluar el rendimiento real de SD 1.5 paletizado a 6 bits en hardware Apple dentro de una app comercial.
- Generacion de material visual para el estilo "Soft photo" dentro de TokForge: el bundle esta integrado como opcion de estilo concreta, de modo que el caso de uso principal es el consumo directo desde esa app.
- Evaluacion comparativa de tecnicas de cuantizacion: util para medir la perdida de calidad de la paletizacion a 6 bits frente al original fp16 en un pipeline Core ML.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica en el sentido de GPU dedicada; el modelo corre en Apple Neural Engine y requiere 4 GB de RAM o mas en el dispositivo (clase de telefono indicada por TokForge).
- GPU recomendadas: no aplica; el destino es iPhone e iPad con iOS 17 o superior. En iOS 16 la app recurre a un modelo fp16 alternativo.
- Cabe en hardware de consumo Apple: si, en iPhone e iPad que cumplan el requisito de RAM e iOS. No esta pensado para GPU de escritorio NVIDIA ni AMD.
- Opciones de despliegue: Core ML a traves de Apple `ml-stable-diffusion` (pipeline `StableDiffusionPipeline` en Swift) y la app TokForge para iOS. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que son runtimes de modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada. El modelo fija 20 a 30 pasos de muestreo y resolucion 512 x 512, parametros que determinan el coste de inferencia, pero no se aportan tiempos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TokForge-epiCRealism-CoreML-6bit | no disponible (SD 1.5, UNet paletizado 6 bits) | 512 x 512 fijo | Core ML (`.mlmodelc`) | CreativeML OpenRAIL-M + terminos Civitai | Hugging Face, 0 descargas, 1 like |
| emilianJR/epiCRealism (original) | no disponible (SD 1.5) | 512 x 512 nativo, flexible en difusers | Diffusers / safetensors | CreativeML OpenRAIL-M | Hugging Face |
| Stable Diffusion 1.5 (base) | aproximadamente 860 M en UNet, no confirmado en la informacion | 512 x 512 nativo | Safetensors, CKPT, ONNX | CreativeML OpenRAIL-M | Amplia disponibilidad |
| Apple ml-stable-diffusion (conversiones Core ML de referencia) | depende del checkpoint convertido | 512 x 512 o 768 x 768 segun modelo | Core ML | heredada del modelo base | GitHub de Apple |

La comparacion relevante es contra el checkpoint original de epiCRealism: este bundle no anade capacidades generativas, solo cambia el runtime y aplica cuantizacion. Frente a las conversiones Core ML de referencia de Apple, la diferencia esta en el fine-tune fotorrealista y en la paletizacion a 6 bits, que reduce el peso a 1,87 GB a costa de una posible perdida de calidad frente a fp16.

## Limitaciones y advertencias

- Resolucion fija de 512 x 512: el tamano esta incorporado en el modelo compilado y no puede cambiarse en tiempo de ejecucion.
- La paletizacion a 6 bits puede reducir ligeramente la calidad respecto al original en fp16; no se han publicado metricas de esa perdida.
- No es un checkpoint de diffusers ni de PyTorch: no puede cargarse en pipelines estandar de generacion de imagenes, solo en el runtime Core ML de Apple o en TokForge.
- Prompts unicamente en ingles; el rendimiento con otros idiomas no esta documentado y previsiblemente sera deficiente.
- Riesgo de sesgos y de alucinacion visual: como fine-tune de SD 1.5 sobre datos no documentados, puede reproducir estereotipos y generar anatomia o texto incoherentes, especialmente en prompts complejos.
- Restricciones de licencia: CreativeML OpenRAIL-M impone restricciones de uso, y los terminos de Civitai de epinikion exigen atribucion y prohiben vender el modelo o fusiones del mismo. Esas obligaciones se propagan a las imagenes generadas.
- Requiere iOS 17 o superior para usar los pesos de 6 bits; en iOS 16 se degrada a un modelo fp16 distinto, con lo que el comportamiento no es identico entre versiones.
- Adopcion practica muy baja: 0 descargas y 1 like en el momento de la consulta, sin evidencia de uso en produccion ni validacion independiente.
- Dependencia de la app TokForge: el flujo documentado pasa por TestFlight en iOS, lo que limita su uso fuera de ese ecosistema.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/darkmaniac7/TokForge-epiCRealism-CoreML-6bit
- Modelo base (copia en Hugging Face): https://huggingface.co/emilianJR/epiCRealism
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Apple ml-stable-diffusion (herramienta de conversion): https://github.com/apple/ml-stable-diffusion
- Sitio web de TokForge: https://tokforge.ai
- Discord de TokForge: https://discord.gg/Acv3CBtfVm
- Google Play (TokForge Android): https://play.google.com/store/apps/details?id=dev.tokforge
- iOS TestFlight (TokForge iOS): https://testflight.apple.com/join/jnufjzRr
- Coleccion TokForge iOS Models: https://huggingface.co/collections/darkmaniac7/tokforge-ios-models-6a38cca9b57803e6168ce232
