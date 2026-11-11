# darkmaniac7/TokForge-CyberRealistic-V9-CoreML-8bit

## Resumen

TokForge-CyberRealistic-V9-CoreML-8bit es un paquete de inferencia en formato Core ML del modelo de generacion de imagenes CyberRealistic V9, un fine-tune fotorrealista de Stable Diffusion 1.5 desarrollado por Cyberdelia. Lo publica TokForge (darkmaniac7) como conversion de formato y cuantizacion a 8 bits con paletizacion, pensada para ejecutarse en el Neural Engine de Apple en iPhone y iPad a traves de la aplicacion TokForge para iOS. No se han reentrenado pesos: se parte del checkpoint `CyberRealistic_V9_FP16` y se transforma con `ml-stable-diffusion` de Apple.

El modelo resuelve la generacion de imagenes fotorrealistas totalmente en el dispositivo, sin conexion tras la descarga inicial, con un bundle de 1,11 GB que se descomprime en unos 1,19 GB. Es la variante de mayor precision frente al hermano de 6 bits del mismo autor, y esta indicado para prompts en los que la version de 6 bits produce artefactos de banding o arcoiris. La arquitectura subyacente es Stable Diffusion 1.5 (UNet, codificador de texto CLIP y VAE), con salida fija de 512 x 512.

Es relevante ahora porque demuestra el flujo de despliegue de difusion en hardware de consumo movil mediante Core ML y cuantizacion paletizada, un patron cada vez mas habitual para aplicaciones de generacion de imagenes offline en el ecosistema Apple. Su licencia CreativeML OpenRAIL-M y los terminos de Civitai del autor original condicionan el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 (UNet, codificador de texto CLIP, VAE) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de texto a imagen; sin contexto de texto generativo) |
| Tipos de cuantizacion | 8 bits con paletizacion en UNet y codificador de texto; VAE en fp16 |
| Idiomas soportados | en |
| Licencia | CreativeML OpenRAIL-M, mas los terminos de Civitai de Cyberdelia |
| Formato de pesos | Core ML compilado (`.mlmodelc`) empaquetado en un zip (`CyberRealistic-V9_palettized-8bit_split_einsum_compiled.zip`) |
| Resolucion de salida | 512 x 512 (fija en el modelo compilado) |
| Atencion | split einsum (Apple Neural Engine) |
| Unidades de computo | `.cpuAndNeuralEngine` |
| Pasos recomendados | 25 a 30 (TokForge inicia en 28) |
| CFG recomendado | 7.0 |
| Requisitos de dispositivo | iPhone/iPad con 4 GB de RAM o mas, iOS 17 o superior |
| Tamano de descarga | 1,11 GB (1 archivo); ~1,19 GB descomprimido |

## Arquitectura y entrenamiento

El modelo base, CyberRealistic V9 de Cyberdelia, es un fine-tune fotorrealista de Stable Diffusion 1.5 con VAE integrado. Stable Diffusion 1.5 emplea una arquitectura de difusion latente con un UNet para la denoising, un codificador de texto CLIP para condicionar por prompt y un VAE para codificar y decodificar entre espacio latente y pixeles. No se dispone de informacion sobre el volumen de datos de entrenamiento ni sobre el uso de RLHF/DPO en el fine-tune original.

Esta publicacion no entrena pesos: es una conversion de formato PyTorch a Core ML mediante `torch2coreml` de Apple `ml-stable-diffusion`, con atencion split einsum optimizada para el Neural Engine y cuantizacion paletizada a 8 bits (`--quantize-nbits 8`). El bundle contiene `TextEncoder.mlmodelc`, `Unet.mlmodelc`, `VAEDecoder.mlmodelc`, `VAEEncoder.mlmodelc` y los ficheros del tokenizador CLIP (`vocab.json` y `merges.txt`). El VAE se mantiene en fp16. La resolucion de 512 x 512 esta fijada en el modelo compilado.

## Capacidades

- Generacion de imagenes fotorrealistas a partir de descripciones textuales en ingles.
- Inferencia totalmente en el dispositivo en iPhone y iPad mediante Core ML y el Neural Engine de Apple, sin conexion tras la descarga.
- Salida a resolucion fija de 512 x 512.
- Funcionamiento offline una vez descargado el bundle.
- Mayor fidelidad que la variante de 6 bits en prompts propensos a banding o artefactos de arcoiris.
- Integracion en la aplicacion TokForge para iOS (catalogo de modelos de imagen, etiquetado como modelo maduro/fotorrealista).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo thinking; es exclusivamente texto a imagen.

## Casos de uso

- Generacion de retratos fotorrealistas en apps moviles: el modelo produce imagenes de personas con aspecto fotografico a 512 x 512 en el dispositivo, adecuado para apps de creacion de avatares o contenido visual sin subir datos a la nube.
- Creacion de imagenes offline en iPhone/iPad: al ejecutarse en local tras la descarga, permite generar imagenes en entornos sin conectividad, como viajes o zonas con cobertura limitada.
- Prototipado rapido de conceptos visuales: disenadores pueden iterar prompts en el dispositivo con 25-30 pasos y CFG 7,0 para explorar ideas fotorrealistas antes de pasar a produccion de mayor resolucion.
- Aplicaciones de privacidad por diseno: al no requerir envio de prompts a servidores externos, encaja en flujos donde el contenido textual o las imagenes generadas no deben salir del dispositivo.
- Contenido para redes y mockups: generacion de imagenes de producto o escenas realistas para maquetas y presentaciones rapidas desde el movil.
- Demostraciones educativas de difusion en el borde: sirve para mostrar el pipeline completo de Stable Diffusion 1.5 cuantizado y ejecutado en el Neural Engine en charlas, talleres o pruebas de concepto de IA en el dispositivo.
- Base para experimentar con paletizacion de 8 bits frente a 6 bits: util para evaluar el compromiso entre tamano de descarga (1,11 GB frente a 917 MB) y calidad visual en prompts exigentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Dispositivo: iPhone o iPad con 4 GB de RAM o mas y iOS 17 o superior (segun el catalogo de TokForge para iOS).
- Acelerador: Apple Neural Engine mediante Core ML, con unidades de computo `.cpuAndNeuralEngine`.
- VRAM/memoria: no se especifica un requisito de memoria grafica; el modelo esta disenado para memoria unificada de dispositivos Apple moviles.
- GPU de escritorio: no aplica; el bundle Core ML esta orientado a dispositivos Apple, no a GPUs NVIDIA/AMD.
- Almacenamiento: 1,11 GB de descarga y aproximadamente 1,19 GB descomprimido.
- Despliegue: aplicacion TokForge para iOS (TestFlight) o integracion directa con el pipeline `StableDiffusionPipeline` de Apple `ml-stable-diffusion` en Swift. No es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje ni un checkpoint PyTorch/diffusers.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/resolucion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TokForge-CyberRealistic-V9-CoreML-8bit | no disponible | 512 x 512 fijo | Core ML 8 bits paletizado | CreativeML OpenRAIL-M + terminos Civitai | Hugging Face, app TokForge iOS |
| TokForge-CyberRealistic-V9-CoreML-6bit | no disponible | 512 x 512 fijo | Core ML 6 bits paletizado | CreativeML OpenRAIL-M + terminos Civitai | Hugging Face, app TokForge iOS |
| cyberdelia/CyberRealistic (V9 FP16) | no disponible | 512 x 512 (SD 1.5) | PyTorch/diffusers (checkpoint) | CreativeML OpenRAIL-M + terminos Civitai | Hugging Face, Civitai |
| stable-diffusion-v1-5/stable-diffusion-v1-5 | no disponible | 512 x 512 | PyTorch/diffusers, safetensors | CreativeML OpenRAIL-M | Hugging Face |

La comparativa directa con la version de 6 bits del mismo autor es la mas relevante: la de 8 bits ocupa 1,11 GB frente a 917 MB y ofrece mayor fidelidad en prompts donde la de 6 bits muestra banding. Frente al checkpoint FP16 original, esta version prioriza tamano y velocidad en dispositivo a costa de una ligera perdida por cuantizacion.

## Limitaciones y advertencias

- Resolucion fija de 512 x 512: el tamano esta incorporado en el modelo compilado y no puede cambiarse en tiempo de inferencia.
- Solo admite prompts en ingles.
- Es un bundle de ejecucion Core ML, no un checkpoint diffusers ni PyTorch; no puede cargarse con las herramientas habituales de difusion en servidor.
- Descarga mayor que la variante de 6 bits (1,11 GB frente a 917 MB), lo que afecta a usuarios con almacenamiento limitado.
- Riesgo de sesgos y de contenido inapropiado propio de Stable Diffusion 1.5 y de los datos de entrenamiento del fine-tune; el modelo esta etiquetado como maduro/fotorrealista en TokForge.
- Posibilidad de artefactos visuales y de resultados no fieles al prompt, especialmente en composiciones complejas o texto dentro de la imagen.
- Licencia CreativeML OpenRAIL-M con restricciones de uso (incluye clausulas de uso aceptable) y, adicionalmente, los terminos de Civitai de Cyberdelia; el uso comercial esta permitido segun los terminos del creador, pero las condiciones OpenRAIL-M siguen aplicando y exigen atribucion.
- Requiere iOS 17 o superior y un dispositivo con al menos 4 GB de RAM; no funciona en hardware fuera del ecosistema Apple soportado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; ecosistema de soporte limitado fuera de la app TokForge.

## Enlaces

- Hugging Face: https://huggingface.co/darkmaniac7/TokForge-CyberRealistic-V9-CoreML-8bit
- Variante de 6 bits: https://huggingface.co/darkmaniac7/TokForge-CyberRealistic-V9-CoreML-6bit
- Modelo base en Hugging Face: https://huggingface.co/cyberdelia/CyberRealistic
- Modelo base en Civitai: https://civitai.com/models/15003
- Stable Diffusion v1.5: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Apple ml-stable-diffusion: https://github.com/apple/ml-stable-diffusion
- TokForge: https://tokforge.ai
- Discord de TokForge: https://discord.gg/Acv3CBtfVm
- Google Play de TokForge: https://play.google.com/store/apps/details?id=dev.tokforge
- TestFlight de TokForge para iOS: https://testflight.apple.com/join/jnufjzRr
- Coleccion TokForge iOS Models: https://huggingface.co/collections/darkmaniac7/tokforge-ios-models-6a38cca9b57803e6168ce232
