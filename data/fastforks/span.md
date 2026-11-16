# fastforks/span

## Resumen

SPAN (Swin-style Parameter-free Attention Network) es una red neuronal convolucional ligera para superresolución de imágenes con degradación bicúbica, presentada por Wan et al. en CVPRW 2024 y ganadora del desafío NTIRE 2024 de superresolución eficiente. El repositorio `fastforks/span` no aloja pesos: es únicamente una model card que documenta cómo el framework fastforks descarga los pesos originales de los autores (checkpoints `spanx2_ch48.pth` y `spanx4_ch48.pth`), los verifica mediante SHA-256 y expone dos variantes de escala (x2 y x4) con backends `portable` y `kernels`.

La relevancia del modelo reside en su eficiencia: aproximadamente 0,4 M de parámetros en inferencia, seis bloques de atención sin parámetros (convoluciones 3x3 re-parametrizadas y atención definida como `sigmoid(features) - 0.5`) y un upsampler pixel-shuffle. Está entrenado exclusivamente para maximizar PSNR sobre degradaciones bicúbicas, lo que lo hace adecuado para pipelines de restauración deterministas y de bajo coste computacional, no para degradaciones reales del mundo salvaje.

El modelo se distribuye bajo licencia Apache-2.0 (tanto código como pesos), con uso comercial permitido. La model card advierte que el paquete de código original contiene cadenas de texto que lo describen como de uso exclusivamente investigador, por lo que conviene revisar dichas cadenas antes de cualquier uso distinto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con seis bloques de atención sin parámetros (convs 3x3 re-parametrizadas, atención = sigmoid(features) - 0.5) y upsampler pixel-shuffle |
| Parametros totales | ~0,4 M en inferencia (48 canales) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; entrada H x W >= 4, cualquier resolución, con padding/tiling interno) |
| Tipos de cuantizacion | fp16 (por defecto en GPU), fp32 (CPU); soporte TensorRT fp16 |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 (código y pesos); uso comercial permitido |
| Formato de pesos | `.pth` (PyTorch, alojados por los autores, no en este repo) |

## Arquitectura y entrenamiento

SPAN es una red convolucional de superresolución diseñada para eficiencia. Consta de seis bloques de atención sin parámetros en los que las convoluciones 3x3 se re-parametrizan en inferencia y la atención se implementa como `sigmoid(features) - 0.5`, sin matrices de proyección adicionales. El upsampling se realiza mediante pixel-shuffle. Las variantes publicadas (`span-x2` y `span-x4`) usan 48 canales y escalan la imagen por 2 o 4 respectivamente. El modelo está optimizado para PSNR, no para percepción visual ni para degradaciones reales.

El entrenamiento se realizó sobre DIV2K (1000 imágenes 2K del NTIRE 2017) y Flickr2K (2650 imágenes 2K de EDSR), es decir, el conjunto DF2K, con imágenes de alta resolución degradadas bicúbicamente (según la sección 4.1 del paper). No se documentan fases de RLHF/DPO ni ajuste perceptual; el objetivo es la reconstrucción fiel en PSNR. La model card no detalla el número total de tokens ni iteraciones de entrenamiento.

## Capacidades

- Superresolución de imágenes RGB con factores x2 y x4 sobre degradación bicúbica.
- Restauración de imagen a imagen: entrada una imagen RGB, salida la imagen ampliada con `model.scale` x el tamaño de entrada, en [0, 1].
- Procesamiento de imágenes grandes mediante tiling con solapamiento (`tile=`), al estilo de ComfyUI.
- Entrada de cualquier tamaño H x W >= 4 (redimensionado o padding interno).
- Backends `portable` (PyTorch) y `kernels` (kernels optimizados), con paridad numérica verificada frente al código original.
- Compatibilidad con `torch.compile` y TensorRT fp16 para aceleración.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).

## Casos de uso

- Restauración por lotes de imágenes con degradación bicúbica: en pipelines de conversión de miniaturas o assets gráficos, `span-x4` escala imágenes 2K con ~24 ms por imagen de 512x512 en `portable` (14,6 ms en `kernels`), lo que permite procesar miles de imágenes por hora en una sola GPU consumer.
- Preprocesado para modelos de visión: ampliar imágenes de baja resolución antes de pasarlas a detectores o clasificadores que esperan entradas de mayor tamaño, aprovechando la fidelidad PSNR del modelo (30,47 dB en DIV2K x4).
- Integración en ComfyUI y flujos de difusión: el soporte de tiling con solapamiento permite usarlo como nodo de upscaling previo o posterior a un pipeline generativo, sin desbordar VRAM en imágenes grandes.
- Despliegue en GPU de gama media: con ~0,4 M de parámetros y 487 MiB de memoria pico en modo `kernels`, cabe holgadamente en GPUs consumer como la RTX 5060 Ti 16 GB (probado hasta 1988x2880 con 12,9 GiB pico).
- Servicio de restauración de bajo coste: al ser un modelo minúsculo, puede servirse con alta concurrencia en una sola GPU, con latencias de ~15 ms por imagen de 512x512 y arranque de ~0,10 s en backend `portable`.
- Validación y benchmark de pipelines: al ofrecer paridad numérica verificada con el código original (max |diff| <= 1e-05 en CPU fp32), sirve como referencia para comparar implementaciones de superresolución o para tests de regresión.
- Aceleración en producción con TensorRT: la variante compilada a fp16 reduce la inferencia a 7,98 ms (x2) y 8,28 ms (x4) en 512x512, útil en servicios con requisitos de latencia estrictos.

## Benchmarks y rendimiento

Precisión en DIV2K validation (PSNR / SSIM en canal Y, salida uint8, borde recortado):

| Variante | Dataset | Original fp32 | Portable | Kernels |
|---|---|---|---|---|
| `span-x4` | DIV2K val (100), bicubic x4 | 30,47 / 0,8382 | 30,47 / 0,8382 | 30,47 / 0,8382 |
| `span-x2` | DIV2K val (100), bicubic x2 | 36,20 / 0,9460 | 36,20 / 0,9460 | 36,20 / 0,9460 |

Rendimiento y memoria (512x512, RTX 5060 Ti 16 GB, sm_120):

| Modelo | Tiempo original | Portable | Kernels | Aceleración kernels vs original | Memoria pico (MiB, alloc/reserved): original / portable / kernels |
|---|---|---|---|---|---|
| `span-x2` | 24,6 ms | 23,5 ms | 14,9 ms | 1,6x | 611/648 / 607/662 / 487/522 |
| `span-x4` | 26,9 ms | 24,2 ms | 14,6 ms | 1,8x | 611/648 / 607/662 / 487/522 |

Aceleración adicional con `torch.compile` y TensorRT fp16 (512x512):

| Modelo | Portable | torch.compile | TensorRT fp16 | Kernels |
|---|---|---|---|---|
| `span-x2` | 23,5 ms | 13,2 ms | 7,98 ms | 14,9 ms |
| `span-x4` | 24,2 ms | 13,2 ms | 8,28 ms | 14,6 ms |

Paridad con el código original: CPU fp32 con max |diff| <= 1e-05; GPU fp16 con mean |diff| <= 0,02 y p99 <= 0,25.

## Requisitos de hardware

- VRAM estimada: ~0,5 GiB de memoria pico en 512x512 con backend `kernels` (487 MiB alloc / 522 MiB reserved); ~0,6 GiB en `portable`. Para imágenes de 1988x2880 se midieron 12,9 GiB pico (14,0 reservados) en fp16.
- GPU recomendadas: cualquier GPU consumer moderna; probado en RTX 5060 Ti 16 GB. Para resoluciones grandes se recomienda >= 16 GB o uso de tiling.
- Cabe en GPU consumer: sí, holgadamente, incluidas GPUs de 8 GB para resoluciones moderadas.
- Opciones de despliegue: framework fastforks (backends `portable` y `kernels`), PyTorch con `torch.compile`, TensorRT fp16 (motor ONNX + engine). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de imagen).
- Latencia y throughput: ~14,6-14,9 ms por imagen 512x512 en `kernels`; ~8 ms con TensorRT fp16; arranque de ~0,10 s en `portable` y primera llamada de 0,05-0,26 s según backend.

## Comparativa con modelos similares

| Modelo | Parámetros | Escala | Contexto/entrada | PSNR DIV2K x4 (Y) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SPAN (`span-x4`) | ~0,4 M | x4 | cualquier H x W >= 4 | 30,47 dB | Apache-2.0 | Pesos en enlaces de los autores; card en HF |
| Real-ESRGAN | no disponible | x4 | imágenes arbitrarias | no comparable (entrenado para degradaciones reales) | no disponible en la información | no disponible |
| EDSR (referencia del dataset Flickr2K) | no disponible | x2/x3/x4 | imágenes arbitrarias | no disponible | no disponible | no disponible |

La model card solo menciona Real-ESRGAN como contraste cualitativo (entrenado para degradaciones reales, su PSNR bicúbico es bajo) y cita EDSR como fuente del conjunto Flickr2K. No se aportan datos numéricos de otros modelos comparables en la información disponible.

## Limitaciones y advertencias

- Entrenado exclusivamente para degradaciones bicúbicas: su rendimiento en imágenes reales con ruido, compresión JPEG o desenfoque será inferior al de modelos orientados a restauración real (p. ej. Real-ESRGAN).
- Optimizado para PSNR, no para percepción visual: puede producir salidas excesivamente suavizadas, sin detalle textural sintetizado.
- El repositorio no contiene pesos: depende de enlaces externos de Google Drive de los autores y de la verificación SHA-256; si dichos enlaces caen, el modelo no es descargable desde este repo.
- La model card advierte que el paquete de código original contiene cadenas que lo describen como de uso exclusivamente investigador; aunque la licencia declarada es Apache-2.0, conviene revisar dichas cadenas antes de un uso comercial.
- No es un modelo de lenguaje: no soporta texto, tool calling, agentes ni capacidades multilingües.
- En GPUs sin soporte de los kernels optimizados (sm_120 en las pruebas), el rendimiento cae al backend `portable` (~24 ms frente a ~15 ms).
- Las imágenes de gran tamaño requieren tiling para no agotar VRAM; sin él, 1988x2880 ya consume 12,9 GiB pico.
- Riesgo de artefactos en bordes y regiones de alto contraste por el upsampling pixel-shuffle y la atención sin parámetros; no se documentan sesgos sociales por ser un modelo de imagen, pero sí posibles sesgos hacia el dominio DF2K (fotografía natural).

## Enlaces

- Hugging Face: https://huggingface.co/fastforks/span
- Repositorio del framework fastforks: https://github.com/kleinicke/fastforks
- Kernels para el backend `kernels`: https://huggingface.co/fastforks/kernels
- Código original de SPAN: https://github.com/hongyuanyu/SPAN (commit `c77a5917759f`)
- Licencia del código original: https://github.com/hongyuanyu/SPAN/blob/c77a5917759f09e66fbc7124220c5afc5ee221e5/LICENSE.txt
- README del código original: https://github.com/hongyuanyu/SPAN/blob/c77a5917759f09e66fbc7124220c5afc5ee221e5/README.md
- Documentación de benchmarks de fastforks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Pesos `span-x2`: https://drive.usercontent.google.com/download?export=download&confirm=t&id=1iYUA2TzKuxI0vzmA-UXr_nB43XgPOXUg
- Pesos `span-x4`: https://drive.usercontent.google.com/download?export=download&confirm=t&id=1iYUA2TzKuxI0vzmA-UXr_nB43XgPOXUg
