# lvladikov/QwenImage2.1-PiD-Workaround-VAE-Encode-SuperFast-HighRes

## Resumen

Este repositorio no contiene un modelo de pesos en sentido estricto, sino un conjunto de workflows de ComfyUI y un script de Python que orquestan una canalización de generación de imágenes de alta resolución en dos etapas. La primera etapa usa Qwen-Image-2.1 (modelo de difusión texto-a-imagen de Alibaba Qwen) acelerado con el LoRA Lightning de lightx2v para producir un borrador pequeño en 4 pasos; la segunda etapa emplea PiD (Pixel Diffusion Decoder) de NVIDIA para reescalar ese borrador 4× en anchura y altura en otros 4 pasos. El resultado por defecto es un borrador de 1024×576 convertido en una imagen de 4096×2304.

El problema que resuelve es la incompatibilidad de espacios latentes: PiD incluye decodificadores para los espacios latentes de FLUX.1, FLUX.2, Qwen-Image (v1), SD3 y SDXL, pero no para el VAE propio de Qwen-Image-2.1 (64 canales a 16×). El autor sortea esta limitación decodificando la imagen de Qwen con su propio VAE, recodificándola con el VAE de FLUX.2 (el espacio latente para el que PiD fue entrenado) y alimentando ese latente a PiD. La ganancia de velocidad proviene de que Qwen-Image-2.1 solo genera 1/16 de los píxeles finales, mientras que PiD, un decodificador mucho más pequeño, asume el trabajo a resolución completa.

Es relevante ahora porque demuestra una vía práctica de generar imágenes de 4K con modelos de difusión modernos sin pagar el coste cuadrático de renderizar a resolución nativa, usando únicamente nodos nativos de ComfyUI. El repositorio está publicado bajo licencia Apache-2.0 y tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de dos etapas: modelo de difusión Qwen-Image-2.1 (con LoRA Lightning) + decodificador de difusión de píxeles PiD 1.5 (FLUX.2, 1024→4096, 4 pasos) |
| Parámetros totales | no disponible (el repo no contiene pesos; los componentes externos tienen tamaños en disco indicados abajo) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantización | bf16 (por defecto), int8_convrot (alternativa para Qwen-Image-2.1 y Qwen3-VL), fp8_scaled (alternativa para el codificador Gemma) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (componentes externos); JSON (workflows de ComfyUI); Python (script) |

Tamaños de los componentes externos referenciados en la model card:

| Fichero | Carpeta de ComfyUI | Tamaño |
|---|---|---|
| `qwen_image_2.1_bf16.safetensors` | `diffusion_models/` | 14,2 GB |
| `qwen3vl_8b_bf16.safetensors` | `text_encoders/` | 17,5 GB |
| `qwen_image_2.1_vae_bf16.safetensors` | `vae/` | 0,7 GB |
| `pytorch_lora_weights.safetensors` (Lightning) | `loras/` | 0,1 GB |
| `flux2-vae.safetensors` | `vae/` | 0,3 GB |
| `pid_1.5_flux2_1024_to_4096_4step_bf16.safetensors` | `diffusion_models/` | 2,8 GB |
| `gemma_2_2b_it_elm_bf16.safetensors` | `text_encoders/` | 5,2 GB |

Alternativas de menor tamaño: `qwen_image_2.1_int8_convrot` (6,8 GB), `qwen3vl_8b_int8_convrot` (8,7 GB), `gemma_2_2b_it_elm_fp8_scaled` (2,6 GB).

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo; compone modelos preexistentes. La etapa de generación usa Qwen-Image-2.1, un modelo de difusión texto-a-imagen cuyo codificador de texto es Qwen3-VL de 8B (17,5 GB en bf16) y cuyo VAE opera a 16× de compresión con 64 canales. Sobre él se aplica el LoRA Lightning de lightx2v, que reduce la generación a 4 pasos. La etapa de superresolución usa PiD (Pixel Diffusion Decoder) de NVIDIA, en su variante 1.5 para el espacio latente de FLUX.2, con escalado 1024→4096 y 4 pasos; PiD emplea su propio codificador de texto Gemma 2 2B IT (5,2 GB en bf16) y no necesita fichero VAE de salida porque usa el VAE `pixel_space` integrado en ComfyUI.

La innovación técnica central es el puente entre espacios latentes: como PiD no tiene decodificador para el VAE de Qwen-Image-2.1, el pipeline decodifica la imagen de Qwen a píxeles con su VAE, la recodifica con el VAE de FLUX.2 y entrega ese latente a PiD. El coste de esa recodificación adicional se describe como "pequeño y rápido" en la model card. El reparto de trabajo es la clave del rendimiento: Qwen-Image-2.1 renderiza a un cuarto del ancho y alto de la salida (1/16 de los píxeles) y PiD, mucho más pequeño (2,8 GB frente a 14,2 GB), asume el trabajo a tamaño completo. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en ninguno de los componentes.

## Capacidades

- Generación de imágenes texto-a-imagen de alta resolución: salida por defecto de 4096×2304 a partir de un borrador de 1024×576.
- Generación ultrarrápida: 4 pasos para el borrador (Qwen-Image-2.1 + Lightning LoRA) y 4 pasos para el escalado (PiD).
- Tamaño de salida configurable: el nodo "0 · Size" del workflow permite fijar las dimensiones del borrador (por defecto 1024×576).
- Prompts en lenguaje natural mediante el nodo "1 · Prompt".
- Reutilización de PiD como upscaler independiente: el repositorio hermano `lvladikov/PiD-as-pixel-Upscaler` permite escalar cualquier imagen 4× solo con PiD.
- Ejecución local en ComfyUI con nodos nativos exclusivamente, o en Comfy Cloud.
- Ejecución programática en Python mediante `qwen21-pid-generate.py` (diffusers + código de PiD de NVIDIA).
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, audio ni visión más allá del codificador Qwen3-VL empleado como encoder de texto.

## Casos de uso

- Generación de fondos y key art en 4K para producción audiovisual: el pipeline produce 4096×2304 en 8 pasos totales, lo que permite iterar sobre variantes de un concepto visual a un coste computacional muy inferior al de renderizar a resolución nativa con el modelo grande.
- Ilustración editorial y previsualización de alta resolución: el borrador de 1024×576 se revisa rápido y la aprobación final se materializa con el escalado de PiD, manteniendo un flujo de revisión ágil en equipos de diseño.
- Prototipado de assets para videojuegos: texturas, conceptos de personajes y entornos generados a 4K con licencia Apache-2.0, sin restricciones de uso comercial derivadas de la licencia del repo.
- Automatización por lotes en Python: el script `qwen21-pid-generate.py` permite integrar las dos etapas en pipelines de CI/CD o generadores de contenido masivo sin depender de la interfaz de ComfyUI.
- Despliegue en Comfy Cloud sin hardware propio: el workflow `QwenImage2.1-PiD-SuperFast-HighRes-ComfyUI-cloud.json` solo requiere importar dos ficheros (LoRA Lightning y decodificador PiD) a la biblioteca de modelos, ya que el resto está alojado en la plataforma.
- Superresolución de imágenes existentes: reutilizando el workflow de PiD como upscaler independiente (repo hermano), cualquier imagen puede escalarse 4× con 4 pasos, útil para recuperar material de archivo o ampliar renders previos.
- Investigación sobre espacios latentes y decodificadores de difusión: el workaround de recodificación VAE Qwen-Image-2.1 → FLUX.2 sirve como referencia técnica para conectar modelos cuyos espacios latentes no coinciden.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta la comparación cualitativa de velocidad basada en el reparto de píxeles (Qwen renderiza 1/16 de los píxeles finales) y el número de pasos (4 + 4), sin cifras de latencia, throughput ni métricas de calidad (FID, CLIP score u otras).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia, la suma de pesos en bf16 de los componentes cargados simultáneamente (Qwen-Image-2.1 14,2 GB + Qwen3-VL 8B 17,5 GB + VAE Qwen 0,7 GB + VAE FLUX.2 0,3 GB + PiD 2,8 GB + Gemma 2 2B 5,2 GB + LoRA 0,1 GB) supera los 40 GB, por lo que en bf16 no cabe en GPUs de consumo sin cuantización o descarga secuencial de componentes.
- Alternativas cuantizadas: `qwen_image_2.1_int8_convrot` (6,8 GB), `qwen3vl_8b_int8_convrot` (8,7 GB) y `gemma_2_2b_it_elm_fp8_scaled` (2,6 GB) reducen sustancialmente el requisito de memoria.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño de pesos, A100/H100 son las opciones seguras en bf16; las GPUs de consumo requerirán las variantes int8/fp8.
- Despliegue: ComfyUI local (versión reciente con soporte de Qwen-Image-2.1 y PiD), Comfy Cloud, o Python con diffusers más el código de PiD de NVIDIA (`pip install -r requirements.txt`).
- Latencia y throughput: no disponibles. La model card solo indica que el pipeline es "superrápido" por el reparto de trabajo entre las dos etapas y los 8 pasos totales.

## Comparativa con modelos similares

| Modelo | Tipo | Resolución de salida | Pasos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (Qwen-Image-2.1 + Lightning + PiD) | Pipeline de dos etapas en ComfyUI | 4096×2304 por defecto | 4 + 4 | Apache-2.0 | Workflows JSON + script Python; pesos externos |
| Qwen-Image-2.1 solo | Difusión texto-a-imagen | Configurable; a resolución nativa | no disponible | no disponible en esta información | Hugging Face (Qwen/Qwen-Image-2.1) |
| PiD como upscaler (repo hermano `lvladikov/PiD-as-pixel-Upscaler`) | Decodificador de difusión de píxeles | 4× sobre cualquier imagen de entrada | 4 | no disponible en esta información | Hugging Face |
| FLUX.2 (espacio latente soportado por PiD) | Difusión texto-a-imagen | no disponible | no disponible | no disponible | Hugging Face / Comfy-Org |

La comparación cuantitativa de parámetros, contexto y rendimiento entre alternativas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo: su tamaño es 0,0 GB y solo incluye workflows JSON, un script Python y un `requirements.txt`. Requiere descargar por separado más de 40 GB de componentes externos en bf16.
- Dependencia estricta de la versión de ComfyUI: es necesario actualizar ComfyUI a una versión que incluya soporte de Qwen-Image-2.1 y PiD; versiones anteriores no cargarán los workflows.
- El workaround de recodificación VAE (Qwen → FLUX.2) introduce una decodificación y recodificación adicional que puede degradar ligeramente la fidelidad respecto a un decodificador nativo del espacio latente de Qwen-Image-2.1, aunque la model card no cuantifica esta pérdida.
- En Comfy Cloud, los nombres de los modelos importados siguen el patrón `<usuario>__<repo>__<fichero>`; si no coinciden con los del workflow, hay que reseleccionarlos manualmente en los nodos "Lightning LoRA" y "Load PiD".
- El LoRA Lightning se distribuye como `pytorch_lora_weights.safetensors`; si se renombra, hay que seleccionarlo de nuevo en el nodo correspondiente.
- No se documentan sesgos conocidos, riesgo de alucinación visual, limitaciones idiomáticas ni restricciones de uso comercial más allá de la licencia Apache-2.0 del propio repositorio; las licencias de los componentes externos (Qwen-Image-2.1, PiD, Lightning LoRA, VAEs, codificadores) no se detallan en la información disponible y deben verificarse en sus repositorios de origen antes de un uso en producción.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-06), por lo que no hay evidencia de validación por parte de la comunidad.
- No hay benchmarks publicados que permitan verificar la calidad de la salida a 4096×2304 frente a alternativas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/lvladikov/QwenImage2.1-PiD-Workaround-VAE-Encode-SuperFast-HighRes
- Qwen-Image-2.1 (modelo base): https://huggingface.co/Qwen/Qwen-Image-2.1
- Lightning LoRA de lightx2v: https://huggingface.co/lightx2v/Qwen-Image-2.1-Lightning
- PiD (Pixel Diffusion Decoder) de NVIDIA: https://huggingface.co/nvidia/PiD
- Repo hermano "PiD as pixel Upscaler": https://huggingface.co/lvladikov/PiD-as-pixel-Upscaler
- Pesos de Qwen-Image-2.1 para ComfyUI: https://huggingface.co/Comfy-Org/Qwen-Image-2.1
- Pesos de PiD para ComfyUI: https://huggingface.co/Comfy-Org/PixelDiT
- VAE de FLUX.2 para ComfyUI: https://huggingface.co/Comfy-Org/MOSS-Image
