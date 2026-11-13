# moonbox-dev/Moebius-ONNX

## Resumen

Moebius-ONNX es la exportación a formato ONNX del modelo Moebius, un modelo de difusión para inpainting y eliminación de objetos desarrollado originalmente por Hust y distribuido por moonbox-dev para su uso en dispositivo con ONNX Runtime. El modelo recibe una imagen y una máscara (blanco indica la región a eliminar o repintar) y rellena la zona enmascarada a partir del contexto circundante, sin necesidad de prompt de texto. Con 0,22 mil millones de parámetros, está pensado para ser ligero y ejecutable en hardware de consumo.

La relevancia de esta versión concreta reside en su empaquetado: cada precisión (fp16, int8 e implícitamente int4) se distribuye como una carpeta con un grafo ONNX por componente del pipeline (VAE encoder, UNet y VAE decoder), con los pesos grandes como datos externos ONNX. Esto permite desplegar el modelo en CUDA, DirectML o CPU mediante ONNX Runtime, sin depender de PyTorch en producción, y con un tamaño de repositorio de 1,3 GB.

El modelo base es hustvl/Moebius, del que esta versión es una cuantización (relación `quantized`). La licencia es MIT, lo que facilita su integración en productos comerciales. No se dispone de información sobre idiomas soportados, ya que la tarea es puramente visual y no textual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (UNet + VAE), exportado a ONNX |
| Parametros totales | 0,22 B (220 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de imagen, resolución de trabajo 512 px en el lado corto) |
| Tipos de cuantizacion | fp16, int8 (weight-only por canal de salida en UNet), int4 (MatMulNBits, bloque 32, en UNet); el VAE se mantiene en fp16/fp32 |
| Idiomas soportados | No disponible (modelo de imagen sin entrada de texto) |
| Licencia | MIT |
| Formato de pesos | ONNX con datos externos (`*.onnx.data`) |

## Arquitectura y entrenamiento

Moebius es un modelo de difusión para inpainting compuesto por tres grafos: un VAE encoder (basado en el VAE de SDXL, factor de escala 0,13025, procedente de PixelHacker), una UNet que incorpora classifier-free guidance y los embeddings de prompt aprendidos internamente, y un VAE decoder. El pipeline trabaja a 512 px en el lado corto y utiliza el scheduler DDIM con los valores por defecto del modelo original: 20 pasos, strength 0,99, CFG 2,5 y noise offset 0,0357. El resultado se recompone sobre la imagen original bajo una máscara desenfocada gaussianamente.

La exportación se realizó desde la revisión `cd01f47fb6` del modelo original mediante `torch.onnx`, seguida de conversión y cuantización con las herramientas de ONNX Runtime (casts fp16/bf16, cuantización de pesos int8 e int4). Cada grafo fue verificado contra la implementación original antes de su publicación. No se dispone de información sobre el dataset de entrenamiento, el número de tokens ni si hubo RLHF o DPO, ya que la model card de esta exportación no los detalla. Tampoco se emplea bf16 porque el proveedor CUDA de ONNX Runtime no soporta convoluciones en bf16.

## Capacidades

- Inpainting de imágenes: rellena regiones enmascaradas a partir del contexto visual circundante.
- Eliminación de objetos: al enmascarar un objeto, el modelo reconstruye el fondo de forma coherente.
- Image-to-image sin prompt de texto: no requiere descripción textual, solo imagen y máscara.
- Ejecución en dispositivo: soporte de CUDA, DirectML y CPU mediante ONNX Runtime.
- Precisión configurable: fp16, int8 e int4 para adaptar el equilibrio entre calidad y recursos.
- Resolución de trabajo de 512 px en el lado corto.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (no aplica).

## Casos de uso

- Eliminación de objetos en fotografía de producto: se enmascara un elemento no deseado (cable, etiqueta, reflejo) y el modelo reconstruye el fondo con coherencia, útil para catálogos de e-commerce donde se requiere limpieza rápida sin editor manual.
- Retoque fotográfico automatizado en pipelines de preprocesado: integrado como paso ONNX en una cadena de procesamiento de imágenes por lotes, permite limpiar marcas de agua, logos o artefactos antes de la publicación, con un coste de 3,9 s por imagen en una RTX 3080 Laptop.
- Restauración de fotografías antiguas: rellenar zonas dañadas o perdidas con contexto circundante, aprovechando la ventana de 512 px y la reconstrucción guiada por máscara.
- Edición en aplicaciones de escritorio o móviles: al ejecutarse con ONNX Runtime en DirectML o CPU, puede embeberse en herramientas de edición locales sin depender de la nube, con un consumo de VRAM de 5,9 GB en int8.
- Limpieza de imágenes para datasets de entrenamiento: eliminar objetos o marcas no deseadas en corpus visuales antes de alimentar otros modelos, reduciendo ruido en los datos.
- Prototipado rápido en investigación de difusión: la disponibilidad de grafos ONNX separados (VAE encoder, UNet, VAE decoder) facilita la experimentación con schedulers, pasos y CFG sin necesidad de reexportar desde PyTorch.
- Despliegue en entornos con restricciones de memoria: la versión int8 (0,44 GB de pipeline) permite ejecutar el modelo en GPUs de gama media o incluso en CPU con latencias mayores, manteniendo una calidad PSNR de 40,3 dB respecto a fp32.

## Benchmarks y rendimiento

Los datos proceden de la model card del autor, evaluados sobre las 100 fotos de BSD100 con máscaras libres sembradas (10-26 % de la imagen), en una RTX 3080 Laptop GPU con ONNX Runtime 1.30. La comparación contra fp32 se realiza con la misma semilla; las métricas contra la imagen original son orientativas, ya que el inpainting no tiene una única respuesta correcta.

| Pipeline | Tamano | vs fp32 (PSNR, misma semilla) | PSNR / SSIM / LPIPS vs original | Tiempo / imagen | VRAM pico |
|---|---|---|---|---|---|
| fp32 (referencia, no publicada) | 1,24 GB | - | 26,35 / 0,906 / 0,067 | 3,8 s | 7,8 GB |
| fp16 (UNet fp32) | 1,07 GB | 46,5 dB (peor 35,6) | 26,35 / 0,906 / 0,067 | 3,6 s | 5,9 GB |
| int8 | 0,44 GB | 40,3 dB (peor 32,5) | 26,38 / 0,906 / 0,066 | 3,9 s | 5,9 GB |

## Requisitos de hardware

- VRAM estimada: 7,8 GB en fp32, 5,9 GB en fp16 e int8 (VRAM pico medida en RTX 3080 Laptop).
- GPU recomendadas: RTX 3080 Laptop o superior para las cifras de la tabla; A100 o H100 para mayor throughput; RTX 4090 para latencias menores.
- Cabe en GPU de consumo: sí, con 5,9 GB de VRAM pico en fp16 e int8; en int4 el UNet reduce aún más el peso, aunque no se publican cifras de VRAM para esa precisión.
- Opciones de despliegue: ONNX Runtime con proveedores CUDA, DirectML o CPU; scheduler DDIM de diffusers para la orquestación.
- Latencia y throughput: 3,6 s por imagen en fp16 y 3,9 s en int8 sobre RTX 3080 Laptop; no se dispone de datos para otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Moebius-ONNX (este) | 0,22 B | 512 px lado corto | MIT | ONNX | Inpainting sin prompt, cuantizado int8/int4 |
| Moebius (hustvl) | 0,22 B | 512 px lado corto | MIT | PyTorch | Modelo base original, sin exportación ONNX |
| Stable Diffusion Inpainting | No disponible | 512 px | CreativeML Open RAIL-M | Safetensors | Requiere prompt de texto, mayor tamaño |
| LaMa | No disponible | Variable | Apache 2.0 | PyTorch | Inpainting clásico, sin difusión |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Resolución fija de 512 px en el lado corto: imágenes mayores deben redimensionarse, lo que puede perder detalle fino.
- Sin prompt de texto: no permite guiar el relleno con instrucciones semánticas, solo con la máscara y el contexto.
- Riesgo de artefactos en regiones grandes o con texturas complejas: el inpainting no tiene una respuesta única y puede generar resultados inconsistentes.
- La cuantización int8 introduce una desviación de 2,3 % en pesos del UNet y un PSNR de 40,3 dB frente a fp32, con un peor caso de 32,5 dB.
- No se dispone de información sobre sesgos del dataset de entrenamiento ni sobre el número de tokens utilizados.
- Licencia MIT: permite uso comercial, pero se recomienda revisar las condiciones del modelo base y del VAE de SDXL subyacente.
- Sin soporte de bf16 en el proveedor CUDA de ONNX Runtime, lo que limita opciones de precisión en algunas GPU.
- No apta para tareas de texto, razonamiento o agentes: es exclusivamente un modelo de imagen.

## Enlaces

- Hugging Face: https://huggingface.co/moonbox-dev/Moebius-ONNX
- Modelo base: https://huggingface.co/hustvl/Moebius
- Paper referenciado: arxiv:2606.19195
- Repositorio de ONNX Runtime: https://github.com/microsoft/onnxruntime
- Diffusers (scheduler DDIM): https://github.com/huggingface/diffusers
