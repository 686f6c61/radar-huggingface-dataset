# jodri-code/onnx-sd1.5-universal-encoder

## Resumen

`jodri-code/onnx-sd1.5-universal-encoder` es una exportacion a ONNX del codigo VAE (autoencoder variacional) del modelo Stable Diffusion 1.5, publicada por el usuario jodri-code en Hugging Face. No se trata de un modelo generativo de texto ni de un LLM, sino de un componente de codificacion de imagenes: convierte una imagen RGB en su representacion latente (y presumiblemente permite la operacion inversa), lo que lo hace util en pipelines de image-to-image, inpainting y generacion de imagenes con Stable Diffusion. El repositorio ocupa 0,4 GB, un tamano coherente con los pesos del VAE de SD 1.5 en formato ONNX (aproximadamente 83 millones de parametros en fp32).

La relevancia de esta publicacion es practica mas que investigadora: al estar exportado a ONNX y etiquetado como `cpu-inference`, permite ejecutar la fase de codificacion/decodificacion de latentes sin GPU, integrando Stable Diffusion en entornos ligeros, servidores sin acelerador o aplicaciones de escritorio. La licencia `unlicense` elimina restricciones de uso comercial, lo que facilita su incorporacion en productos. El modelo no incluye informacion sobre idiomas ni benchmarks, y su model card es practicamente vacia (solo metadatos YAML).

Dado que el autor no documenta el proceso de exportacion, la composicion exacta del grafo ONNX ni las dimensiones de entrada/salida esperadas, esta ficha se limita a lo verificable a partir de los metadatos y de la arquitectura conocida del VAE de Stable Diffusion 1.5, indicando explicitamente cuando un dato no esta disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE (autoencoder variacional) de Stable Diffusion 1.5 exportado a ONNX; no disponible el detalle exacto del grafo |
| Parametros totales | no disponible en la model card; el VAE original de SD 1.5 tiene aproximadamente 83,6 M de parametros |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto); resolucion de imagen tipica de SD 1.5: 512x512 |
| Tipos de cuantizacion | no disponible; el repo no documenta variantes cuantizadas (fp32/fp16/int8) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | unlicense (dominio publico) |
| Formato de pesos | ONNX (ejecutable con onnxruntime) |
| Tamano del repositorio | 0,4 GB |
| Pipeline declarado | image-to-image |
| Libreria | onnxruntime |

## Arquitectura y entrenamiento

El componente subyacente es el VAE de Stable Diffusion 1.5, un autoencoder convolucional con cuello latente de 4 canales y factor de compresion espacial de 8 (una imagen de 512x512 se mapea a latentes de 64x64x4). El encoder transforma la imagen en una distribucion latente (media y log-varianza) y el decoder reconstruye la imagen a partir de un latente. Esta publicacion exporta ese VAE a formato ONNX, presumiblemente con el objetivo de ejecutar la codificacion y decodificacion de imagenes en `onnxruntime`, incluida la inferencia en CPU segun las etiquetas del repositorio.

No se dispone de informacion sobre el proceso de exportacion (version de PyTorch, opset ONNX, si se incluyen ambos subgrafos encoder y decoder, ni si se aplicaron optimizaciones como fusion de operadores o cuantizacion). Tampoco hay datos sobre el entrenamiento original del VAE: se heredan los del VAE de Stable Diffusion 1.5, entrenado por Stability AI sobre el dataset LAION-Aesthetics con una combinacion de perdidas de reconstruccion, perceptual y adversarial (LPIPS + GAN). No se documenta ningun ajuste fino adicional por parte del autor de esta exportacion.

## Capacidades

- Codificacion de imagenes a latentes: transforma imagenes RGB en representaciones latentes compatibles con el espacio latente de Stable Diffusion 1.5.
- Decodificacion de latentes a imagen: reconstruye imagenes a partir de latentes (si el grafo exportado incluye el decoder; no confirmado en la model card).
- Integracion en pipelines image-to-image: permite codificar una imagen de entrada, aplicar ruido y denoising con un UNet de SD 1.5 y decodificar el resultado.
- Inferencia en CPU: etiquetado explicitamente como `cpu-inference`, lo que habilita su uso sin GPU.
- Compatibilidad con onnxruntime: ejecutable mediante la libreria `onnxruntime` en Python, C++, C#, Java y otras bindings.
- No soporta generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni capacidades multilingues.
- No dispone de modo thinking, vision de alto nivel ni procesamiento de audio.

## Casos de uso

- Image-to-image en servidores sin GPU: usar el encoder para obtener el latente de una imagen de entrada y el decoder para reconstruir el resultado tras el denoising, todo con `onnxruntime` en CPU. Adecuado para entornos de bajo coste o despliegues edge.
- Preprocesamiento en pipelines de inpainting: codificar la imagen original y la mascara para alimentar un UNet de SD 1.5 que rellene las regiones enmascaradas, manteniendo coherencia con el espacio latente original.
- Aplicaciones de escritorio con ONNX Runtime: integrar el VAE en herramientas nativas (Windows, macOS, Linux) que ya usan ONNX Runtime para otros modelos, evitando dependencias de PyTorch.
- Servicios de upscaling o restauracion basados en latentes: decodificar latentes mejorados por un modelo de superresolucion para obtener imagenes de mayor calidad.
- Investigacion sobre compresion latente: analizar la calidad de reconstruccion del VAE de SD 1.5 en distintos dominios de imagen sin necesidad de cargar el pipeline completo de difusion.
- Prototipado rapido de pipelines de difusion: sustituir el VAE de PyTorch por esta version ONNX para medir latencia y consumo de memoria en CPU antes de escalar a GPU.
- Educacion y demostraciones: mostrar el funcionamiento interno de un VAE de difusion en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en GPU: aproximadamente 0,3-0,5 GB en fp32 para los pesos del VAE; en fp16, alrededor de 0,17 GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no es necesario GPU; el modelo esta pensado para CPU. En caso de usar GPU, cualquier tarjeta con al menos 1 GB de VRAM (GTX 1050, RTX 3050, RTX 4090, A100, H100) es suficiente.
- Inferencia en CPU: viable gracias a la exportacion ONNX y la etiqueta `cpu-inference`; el rendimiento dependera del numero de hilos y de las instrucciones SIMD disponibles (AVX2, AVX-512).
- Opciones de despliegue: `onnxruntime` (Python, C++, C#, Java), `onnxruntime-web` para navegador, y potencialmente `onnxruntime-genai` si se integra en pipelines mas amplios. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Como referencia cualitativa, la codificacion/decodificacion de una imagen de 512x512 con un VAE de SD 1.5 en CPU suele tardar del orden de cientos de milisegundos a pocos segundos, pero no hay mediciones publicadas para esta exportacion concreta.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| jodri-code/onnx-sd1.5-universal-encoder | VAE SD 1.5 en ONNX | ~83,6 M (estimado) | ONNX | unlicense | Exportacion no documentada; enfocada a CPU |
| stabilityai/sd-vae-ft-mse | VAE SD 1.5 (original) | ~83,6 M | safetensors, PyTorch | CreativeML Open RAIL-M | Modelo oficial de referencia, requiere PyTorch |
| stabilityai/sd-vae-ft-ema | VAE SD 1.5 (variante EMA) | ~83,6 M | safetensors, PyTorch | CreativeML Open RAIL-M | Variante con mejor reconstruccion en algunos dominios |
| madebyollin/sdxl-vae-fp16-fix | VAE SDXL (fp16) | ~83,6 M | safetensors | MIT | Compatible con SDXL, no con SD 1.5 |

La comparativa se limita a otros VAE porque no existen alternativas directas de "encoder universal" con las mismas caracteristicas. La principal diferencia frente a los VAE oficiales es el formato ONNX y la licencia `unlicense`, que elimina las restricciones de la CreativeML Open RAIL-M del modelo original.

## Limitaciones y advertencias

- La model card no documenta el proceso de exportacion, las dimensiones de entrada/salida, el opset ONNX ni si incluye encoder y decoder. Es necesario inspeccionar el grafo con `onnxruntime` o Netron antes de usarlo en produccion.
- No se especifica la resolucion de entrada esperada; el VAE de SD 1.5 esta entrenado para 512x512 y puede degradarse con resoluciones muy distintas.
- Riesgo de artefactos de reconstruccion: el VAE de SD 1.5 introduce perdida de detalle y posibles artefactos en texturas finas, caras y texto.
- No procesa texto ni tiene capacidades linguisticas; no aplica la advertencia de sesgos linguisticos, pero si puede heredar sesgos visuales del dataset LAION usado para entrenar el VAE original.
- Licencia `unlicense`: permite uso comercial sin restricciones, pero el autor no ofrece garantias ni soporte. Verificar que la exportacion no infrinja derechos de terceros sobre los pesos originales de Stability AI.
- Sin mantenimiento documentado: el repositorio tiene 0 descargas y 1 like, actualizado una sola vez; no hay issues, discusiones ni historial de versiones.
- No se han publicado evaluaciones de calidad de reconstruccion (PSNR, SSIM, LPIPS) para esta exportacion concreta.
- El uso en produccion requiere validar la compatibilidad del grafo ONNX con la version de `onnxruntime` objetivo y con el hardware (CPU con AVX2 o superior recomendado).

## Enlaces

- Hugging Face: https://huggingface.co/jodri-code/onnx-sd1.5-universal-encoder
- VAE original de Stable Diffusion 1.5 (referencia): https://huggingface.co/stabilityai/sd-vae-ft-mse
- Documentacion de ONNX Runtime: https://onnxruntime.ai/docs/
- Repositorio de Stable Diffusion: https://github.com/CompVis/stable-diffusion
- Herramienta Netron para inspeccionar grafos ONNX: https://netron.app/
