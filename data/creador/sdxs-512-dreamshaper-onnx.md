# creador/sdxs-512-dreamshaper-onnx

## Resumen

SDXS-512-DreamShaper ONNX es una conversión a formato ONNX del modelo IDKiro/sdxs-512-dreamshaper, una destilación de un solo paso de Stable Diffusion 1.5 con los pesos de DreamShaper 8. El modelo original se describe en el artículo "SDXS: Real-Time One-Step Latent Diffusion Models with Image Conditions" (Song, Sun y Yin, arXiv 2403.16627). Esta conversión, publicada por el usuario "creador", separa el modelo en grafos independientes (text encoder, UNet y dos decodificadores) pensados para ejecutarse en el navegador mediante onnxruntime-web sobre WebGPU.

La relevancia de esta variante es su orientación a inferencia local en el navegador: el repositorio pesa 1,0 GB y el proceso completo de generación requiere una única pasada por la UNet, sin classifier-free guidance ni prompt negativo. Está pensada para aplicaciones que necesitan generar una imagen a partir de una descripción antes de convertirla en un objeto 3D, como es el caso del proyecto WaveSlice que motivó la conversión.

Arquitectura de difusión latente (UNet) derivada de Stable Diffusion 1.5, con resolución fija de 512x512, contexto de texto de 77 tokens y pesos en fp16. La conversión no modifica los pesos del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión latente (UNet) de un solo paso, destilada de Stable Diffusion 1.5; text encoder CLIP ViT-L/14; decodificadores TAESD y VAE completo (AutoencoderKL de SD 1.5) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 77 tokens de texto (tokenizer CLIP) |
| Tipos de cuantizacion | Pesos en fp16; el text encoder almacena pesos fp16 y calcula en fp32. No se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (el prompt se procesa con el tokenizer CLIP, orientado a inglés) |
| Licencia | openrail++ (CreativeML Open RAIL++-M), derivada de Stable Diffusion 1.5 y DreamShaper 8 (CreativeML Open RAIL-M) |
| Formato de pesos | ONNX (grafos separados: text_encoder_fp16.onnx, unet_fp16.onnx, taesd_decoder_fp16.onnx, vae_large_decoder_fp16.onnx) |

## Arquitectura y entrenamiento

El modelo es una destilación de un solo paso de Stable Diffusion 1.5 con los pesos de DreamShaper 8, descrita en el artículo SDXS. La inferencia consiste en una única pasada por la UNet en el timestep 999, seguida de una decodificación del latente limpio a imagen. El sampler se reduce a dos coeficientes registrados en `manifest.json`: `latent = 14.642591 · noise - 14.579279 · ε`. No hay guidance ni prompt negativo, por lo que se genera una imagen por pasada de UNet.

La conversión a ONNX no altera los pesos: la UNet y los decodificadores conservan la precisión fp16 del original, y el text encoder almacena los pesos en fp16 pero ejecuta la aritmética en fp32. Se ofrecen dos decodificadores intercambiables que aceptan el mismo latente en el espacio escalado de la UNet y devuelven la imagen en el rango [0, 1]: TAESD (2,5 MB, rápido, para previsualizaciones) y el VAE completo de SD 1.5 (99,1 MB, para la imagen final). La validación frente al modelo PyTorch en doce imágenes reporta diferencias de 2e-06 (relativa) en los estados de texto, del 1,0 % en el latente limpio y de 54 dB PSNR en las imágenes (peor caso 46 dB); los decodificadores coinciden dentro de 1,4/255 por canal. No se documentan datos de entrenamiento adicionales ni etapas de RLHF/DPO en la información disponible.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) a resolución fija de 512x512.
- Generación en un solo paso: una única evaluación de la UNet por imagen, sin bucle de muestreo iterativo.
- Dos modos de decodificación: previsualización rápida con TAESD y salida de mayor calidad con el VAE completo.
- Ejecución en navegador mediante onnxruntime-web sobre WebGPU.
- Intercambio de decodificadores en tiempo de ejecución gracias a la interfaz común de latente a imagen.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step.
- No dispone de modo thinking, visión, audio ni otras capacidades multimodales de entrada.
- No incluye safety checker ni marca de agua (el modelo original tampoco los incorpora).

## Casos de uso

- Generación de imágenes en el navegador sin backend: el modelo se ejecuta con onnxruntime-web sobre WebGPU y permite crear ilustraciones a partir de texto íntegramente en el cliente, sin enviar el prompt a un servidor.
- Previsualización rápida en editores gráficos: el decodificador TAESD (2,5 MB) permite mostrar una vista previa casi inmediata del latente antes de decodificar la imagen final con el VAE completo.
- Prototipado de assets para modelado 3D: es el uso que motiva la conversión en WaveSlice, donde se dibuja un objeto a partir de una descripción antes de convertirlo en una pieza 3D.
- Aplicaciones educativas y demos interactivas: la generación en un solo paso y el tamaño contenido del repositorio (1,0 GB) facilitan demos que corren en el dispositivo del usuario.
- Herramientas de creación de contenido offline: al no requerir conexión ni GPU dedicada en servidor, encaja en aplicaciones de escritorio o web que deben funcionar sin infraestructura de inferencia.
- Integración en pipelines de conversión a ONNX: los scripts de conversión publicados en `tools/sdxs-onnx` sirven de referencia para exportar otros modelos de difusión a grafos ONNX ejecutables en WebGPU.
- Generación de bocetos e ideas visuales: la resolución de 512x512 y la ausencia de guidance lo hacen adecuado para exploración rápida de conceptos más que para imágenes finales de alta fidelidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de fidelidad de la conversión frente al modelo PyTorch original:

| Metrica | Resultado |
|---|---|
| Diferencia en estados de texto (relativa) | 2e-06 |
| Diferencia en latente limpio | 1,0 % |
| PSNR de imágenes generadas | 54 dB (peor caso 46 dB) |
| Diferencia por canal en decodificadores | 1,4/255 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el conjunto de pesos suma 983,3 MB (246,3 MB text encoder, 631,8 MB UNet, 2,5 MB TAESD, 99,1 MB VAE completo), por lo que la huella de memoria es moderada.
- GPU recomendadas: no disponible; el modelo está orientado a WebGPU en el navegador, por lo que depende del soporte WebGPU del navegador y de la GPU del cliente.
- Compatibilidad con GPU de consumo: el tamaño reducido de los pesos sugiere que puede ejecutarse en GPU de consumo con soporte WebGPU, aunque no se publican requisitos mínimos verificados.
- Opciones de despliegue: onnxruntime-web sobre WebGPU (caso previsto por el autor); onnxruntime nativo en CPU o GPU; los grafos ONNX son compatibles con otros runtimes ONNX, aunque no se documentan configuraciones alternativas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de texto | Pasos de muestreo | Licencia | Formato |
|---|---|---|---|---|---|
| SDXS-512-DreamShaper ONNX (esta ficha) | no disponible | 77 tokens | 1 | openrail++ | ONNX |
| IDKiro/sdxs-512-dreamshaper (original) | no disponible | 77 tokens | 1 | openrail++ | PyTorch (safetensors) |
| Stable Diffusion 1.5 | no disponible | 77 tokens | 20-50 típicos | CreativeML Open RAIL-M | safetensors, CKPT |
| DreamShaper 8 | no disponible | 77 tokens | 20-50 típicos | CreativeML Open RAIL-M | safetensors, CKPT |

La ventaja principal frente a las alternativas es la ejecución en navegador con un solo paso de UNet; la contrapartida es la resolución fija de 512x512 y la ausencia de guidance, que limita el control fino sobre el resultado en comparación con SD 1.5 o DreamShaper 8 sin destilar.

## Limitaciones y advertencias

- Resolución fija de 512x512: no se documenta soporte para otras resoluciones.
- Sin classifier-free guidance ni prompt negativo: no es posible ajustar la adherencia al prompt ni excluir conceptos mediante prompt negativo.
- Contexto de texto limitado a 77 tokens, propio del tokenizer CLIP.
- Idiomas soportados no disponibles; el tokenizer CLIP está orientado principalmente al inglés, por lo que el rendimiento en otros idiomas no está verificado.
- Sin safety checker ni marca de agua: el contenido generado no pasa por ningún filtro de seguridad, lo que traslada la responsabilidad al integrador.
- Riesgo de sesgos y de alucinación visual inherente al modelo base (Stable Diffusion 1.5 y DreamShaper 8); no se documentan evaluaciones específicas.
- La licencia openrail++ (CreativeML Open RAIL++-M) impone restricciones de uso sobre el contenido generado; es necesario revisar sus cláusulas antes de un uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación por parte de la comunidad.
- La fecha de creación indicada (2026-11-11) es posterior a la de esta ficha, lo que conviene verificar antes de citar el repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/creador/sdxs-512-dreamshaper-onnx
- Modelo base: https://huggingface.co/IDKiro/sdxs-512-dreamshaper
- Artículo SDXS (arXiv 2403.16627): https://arxiv.org/abs/2403.16627
- Scripts de conversión (repositorio WaveSlice): https://github.com/puntorigen/waveslice3d/tree/main/tools/sdxs-onnx
- WaveSlice: https://waveslice3d.com
- Licencia CreativeML Open RAIL++-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
