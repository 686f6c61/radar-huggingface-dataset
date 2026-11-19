# PedroMarinhoDev/LongCat-Video-Avatar-1.6-ComfyUI

## Resumen

LongCat-Video-Avatar 1.6 es un modelo de generación de vídeo condicionado por audio, desarrollado por el equipo LongCat de Meituan, orientado a la síntesis de avatares parlantes (talking-head) a partir de una imagen de referencia y una pista de audio. Este repositorio concreto, publicado por PedroMarinhoDev, no contiene el modelo original, sino una reempaquetación de su DiT (Diffusion Transformer) en archivos únicos compatibles con los nodos nativos de ComfyUI, junto con cuantizaciones int8, W6A8 y W4A8.

El paquete incluye el transformer en bf16 (29,5 GiB) y tres variantes cuantizadas de menor tamaño, además de dos LoRAs del release original (DMD y OPSD) para el modo destilado de 8 pasos y el encoder de Whisper large-v3. El text encoder y el VAE no se incluyen: son los de Wan 2.1 (`umt5_xxl` y `wan_2.1_vae.safetensors`), idénticos byte a byte a los de LongCat-Video.

Es relevante porque reduce la barrera de entrada para ejecutar un modelo de avatar de alta calidad en hardware de consumo: la variante int8 ocupa 14,9 GiB y corre en una RTX 4090 a 5,1-5,7 s por paso en modo destilado a 768x512 y 93 frames. La licencia es MIT, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con modulación adaLN, pipeline image-to-video condicionado por audio |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (genera 93 frames a 768x512 en la configuración medida) |
| Tipos de cuantizacion | bf16, int8 ConvRot, W6A8, W4A8 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (archivos únicos para ComfyUI) |

## Arquitectura y entrenamiento

El modelo base es un Diffusion Transformer (DiT) que genera vídeo a partir de una imagen de referencia y una señal de audio, produciendo avatares parlantes sincronizados. La arquitectura emplea capas lineales en los bloques principales y capas de modulación adaLN, mientras que los embedders, la proyección de audio y la capa final se mantienen en bf16. El condicionamiento de audio se extrae con el encoder de Whisper large-v3 incluido en el paquete.

Los archivos de este repositorio no reentrenan el modelo: el bf16 es la fusión de los shards de `base_model/` del release original con las claves sin cambios. Las tres variantes cuantizadas se generaron mediante redondeo al más cercano (round-to-nearest) sobre los kernels de Comfy Kitchen, sin GPTQ ni calibración. Los LoRAs DMD y OPSD del release original se reescribieron como archivos LoRA estándar y habilitan el modo destilado de 8 pasos. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en el release original.

## Capacidades

- Generación de vídeo image-to-video condicionada por audio: produce un avatar parlante a partir de una imagen y una pista de voz.
- Sincronización labial (talking-head) con la señal de audio de entrada.
- Modo destilado de 8 pasos mediante los LoRAs DMD y OPSD, que reduce el coste de inferencia.
- Integración nativa con ComfyUI a través de los nodos de ComfyUI-LongCat-Avatar.
- Cuatro niveles de precisión para ajustar el equilibrio entre calidad y VRAM.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step ni multilingüismo textual, al tratarse de un modelo generativo de vídeo.

## Casos de uso

- Creación de avatares virtuales para vídeo corporativo: a partir de un retrato y una locución grabada, el modelo genera un vídeo de presentación sincronizado, adecuado para formación interna o comunicación de producto sin rodaje.
- Doblaje y localización de contenido: se alimenta la imagen del presentador original y la pista de audio traducida para regenerar el vídeo con la nueva voz manteniendo la identidad visual.
- Prototipado rápido en estudio de diseño: con la variante W4A8 (8,8 GiB) se pueden iterar bocetos de avatar en una GPU de consumo antes de renderizar la versión final en bf16.
- Asistentes virtuales embebidos en aplicaciones: el modo destilado de 8 pasos permite generar respuestas habladas animadas con latencia controlada en una RTX 4090.
- Generación de contenido para redes sociales: creación de clips cortos de un personaje consistente a partir de una sola imagen de referencia y guiones de audio.
- Investigación en síntesis audiovisual: el paquete facilita experimentar con cuantizaciones (int8, W6A8, W4A8) y medir su impacto en la calidad frente a bf16 dentro de ComfyUI.
- Automatización de pipelines de vídeo en ComfyUI: los archivos únicos y los nodos nativos permiten encadenar el modelo con otros nodos del ecosistema para postprocesado o composición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta el error de salida por capa con entradas aleatorias respecto a bf16:

| Archivo | Tamano | Error de salida por capa |
|---|---|---|
| `longcat_video_avatar_1.6_bf16.safetensors` | 29,5 GiB | referencia |
| `longcat_video_avatar_1.6_int8_convrot.safetensors` | 14,9 GiB | 1,4% |
| `longcat_video_avatar_1.6_w6a8.safetensors` | 12,3 GiB | 2,1% |
| `longcat_video_avatar_1.6_w4a8.safetensors` | 8,8 GiB | 6,4% |

Como dato de latencia, el modo destilado de 8 pasos con el archivo int8 en una RTX 4090 con `--use-ck-attention` tarda entre 5,1 y 5,7 s por paso a 768x512 y 93 frames. W6A8 y W4A8 no se han cronometrado con los nodos actuales, y la calidad de vídeo de ninguna variante se ha medido frente a bf16 más allá del error por capa indicado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 15 GiB para int8, 12,3 GiB para W6A8 y 8,8 GiB para W4A8, a los que hay que sumar el text encoder (`umt5_xxl`), el VAE de Wan 2.1, el encoder de Whisper (1,19 GiB) y los LoRAs (1,55 GiB cada uno) cuando se usan.
- GPU recomendadas: RTX 4090 para el modo int8 con atención CK, según la medición del autor; A100 o H100 para bf16 y para cargas concurrentes.
- Cabe en GPU de consumo: sí, las variantes W6A8 y W4A8 están pensadas para GPUs con 12-16 GiB; bf16 requiere en torno a 30 GiB solo para el transformer.
- Opciones de despliegue: ComfyUI con los nodos de ComfyUI-LongCat-Avatar y kernels de Comfy Kitchen. No se documentan otros backends como vLLM, TGI o llama.cpp, al no ser un modelo de lenguaje.
- Latencia y throughput: 5,1-5,7 s por paso en modo destilado de 8 pasos a 768x512 y 93 frames con int8 en RTX 4090; el resto de combinaciones no está cronometrado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / salida | Licencia | Disponibilidad |
|---|---|---|---|---|
| LongCat-Video-Avatar 1.6 (este paquete) | no disponible | 93 frames a 768x512 en la configuración medida | MIT | Hugging Face, ComfyUI |
| LongCat-Video-Avatar 1.6 (original, Meituan) | no disponible | no disponible | MIT | Hugging Face |
| Wan 2.1 | no disponible | no disponible | no disponible en la información proporcionada | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Las cuantizaciones se generaron por redondeo al más cercano sin calibración ni GPTQ, por lo que la degradación puede ser mayor que en esquemas calibrados; el error por capa llega al 6,4% en W4A8.
- La calidad de vídeo de las variantes cuantizadas no se ha evaluado frente a bf16; solo se reporta el error numérico por capa con entradas aleatorias.
- W6A8 y W4A8 no se han cronometrado con los nodos actuales, así que su rendimiento real en producción es desconocido.
- El paquete no incluye text encoder ni VAE: es obligatorio descargar `umt5_xxl` y `wan_2.1_vae.safetensors` de Wan 2.1 por separado.
- El repositorio ocupa 75 GB en total, lo que exige espacio de almacenamiento considerable aunque solo se use una variante.
- No se documentan sesgos, cobertura idiomática ni riesgos de alucinación específicos; al ser un modelo audiovisual, los riesgos se centran en la fidelidad del habla y la identidad facial, no evaluados en la model card.
- La licencia MIT del paquete y del modelo original permite uso comercial, pero el encoder de Whisper large-v3 es de OpenAI bajo Apache 2.0, con sus propias condiciones.
- El modelo está pensado exclusivamente para ComfyUI con los nodos del autor; no hay soporte documentado para otros entornos de inferencia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/PedroMarinhoDev/LongCat-Video-Avatar-1.6-ComfyUI
- Modelo base original: https://huggingface.co/meituan-longcat/LongCat-Video-Avatar-1.6
- Nodos de ComfyUI: https://github.com/PedroMarinhoDev/ComfyUI-LongCat-Avatar
