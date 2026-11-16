# fastforks/restormer

## Resumen

Restormer es una arquitectura de restauración de imágenes publicada por Zamir et al. en CVPR 2022, diseñada específicamente para tareas de restauración de alta resolución como eliminación de desenfoque de movimiento, eliminación de lluvia y eliminación de ruido de sensores. El repositorio `fastforks/restormer` es una tarjeta de modelo (model card) que no aloja pesos propios, sino que documenta cómo descargar los checkpoints originales de los autores y verificarlos mediante SHA-256. Está orientado a desarrolladores que quieran integrar la restauración de imágenes en pipelines de producción con backend CUDA/PyTorch.

La relevancia de esta ficha radica en que el repositorio actúa como capa de empaquetado reproducible sobre el trabajo original de Restormer, ofreciendo tres variantes preentrenadas (`restormer-deblur`, `restormer-derain`, `restormer-sidd`) con licencia MIT y uso comercial permitido, además de benchmarks de velocidad y memoria medidos en hardware consumer (RTX 5060 Ti 16 GB). No es un modelo de lenguaje ni un modelo generativo multimodal: es un modelo de imagen a imagen (image-to-image) especializado en restauración.

El modelo no dispone de parámetros totales publicados en la información proporcionada, ni de longitud de contexto (no aplica), ni de idiomas soportados. La arquitectura es un U-Net de bloques transformer con atención de canal (MDTA) y feed-forward con convolución depthwise con puerta (GDFN), con cuatro niveles de down/up sampling 2x y bloques de refinamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | U-Net de bloques transformer con MDTA (channel self-attention) y GDFN (gated depthwise-conv feed-forward), 4 niveles 2x down/up + bloques de refinamiento |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen a imagen) |
| Tipos de cuantización | fp16 (portable y kernels); fp32 (original); TensorRT fp16 documentado |
| Idiomas soportados | no disponible (no es modelo de lenguaje) |
| Licencia | MIT (código y pesos de las tres variantes; uso comercial permitido) |
| Formato de pesos | `.pth` (checkpoints PyTorch de los autores, no alojados en el repo); exportación a ONNX y TensorRT documentada |
| Variantes | `restormer-deblur@1`, `restormer-derain@1`, `restormer-sidd@1` |
| Entrada | imagen RGB, cualquier H x W >= 32, padding a múltiplo de 32 |
| Salida | imagen RGB restaurada en [0, 1], tamaño `model.scale` x entrada |
| Backends | `portable`, `kernels` (kernels CUDA propios) |
| Pipeline | image-to-image |

## Arquitectura y entrenamiento

Restormer es un transformer jerárquico con forma de U-Net. Cada bloque combina dos componentes: MDTA (Multi-Dconv Head Transposed Attention), una atención de canal cuyo coste crece linealmente con el número de píxeles en lugar de cuadráticamente, lo que permite procesar imágenes de alta resolución; y GDFN (Gated-Dconv Feed-forward Network), un feed-forward con convolución depthwise y mecanismo de puerta que controla el flujo de información. La red tiene cuatro niveles de downsampling y upsampling 2x, más bloques de refinamiento, y procesa la imagen completa sin parcheado obligatorio (aunque el parámetro `tile=` permite ejecución por teselas solapadas para imágenes grandes).

El entrenamiento se realizó por tarea y de forma independiente para cada variante. `restormer-deblur` se entrenó sobre GoPro (GOPRO_Large, Nah et al. 2017: 3214 pares de fotogramas desenfocados/nítidos, con 2103 pares de entrenamiento y tamaños de parche progresivos de 128 a 384, según la configuración `Deblurring_Restormer.yml`). `restormer-derain` se entrenó sobre Rain13K para eliminar estrías de lluvia. `restormer-sidd` se entrenó sobre SIDD para eliminar ruido de sensor de smartphones. No se documenta en la información disponible el uso de RLHF/DPO (no aplica a este dominio) ni el número exacto de tokens o épocas.

## Capacidades

- Restauración de imagen a imagen: elimina desenfoque de movimiento (`restormer-deblur`), elimina estrías de lluvia (`restormer-derain`) y elimina ruido de sensor de smartphone (`restormer-sidd`).
- Superresolución y upscaling: la salida es `model.scale` veces el tamaño de entrada.
- Procesamiento de imágenes de alta resolución: entrada de cualquier H x W >= 32 (con padding a múltiplo de 32); probado hasta 1024x2048 en fp16.
- Ejecución por teselas solapadas (`tile=`) para imágenes grandes, con el mismo comportamiento que ComfyUI.
- Exportación a ONNX y TensorRT fp16 documentada, con tiempos de preparación medidos.
- Backend `kernels` con kernels CUDA propios que aceleran la inferencia frente al código original (hasta 1,3x en 512x512).
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo puramente visual.

## Casos de uso

- Restauración de fotografía de acción y deporte: `restormer-deblur` elimina el desenfoque de movimiento en fotogramas capturados con velocidades de obturación lentas; adecuado porque está entrenado sobre GoPro y alcanza 32,85 dB PSNR / 0,9405 SSIM en el conjunto de test.
- Limpieza de imágenes de vigilancia y tráfico: `restormer-derain` elimina estrías de lluvia en fotogramas de cámaras exteriores, mejorando la visibilidad para sistemas de detección posteriores; su PSNR de 39,08 dB en Rain100L lo hace fiable en condiciones de lluvia.
- Preprocesado para pipelines de visión por computador: `restormer-sidd` reduce el ruido de sensor de smartphones antes de tareas de detección, segmentación u OCR, lo que mejora la calidad de entrada a modelos downstream.
- Upscaling de imágenes para impresión o visualización: la salida `model.scale` x la entrada permite aumentar resolución en flujos de trabajo de diseño gráfico o archivo fotográfico.
- Procesamiento por lotes en servidor: con 228 ms por imagen de 512x512 y 850 MiB de memoria pico en backend portable, se pueden procesar lotes grandes en una sola GPU consumer.
- Integración en ComfyUI y pipelines de difusión: el parámetro `tile=` replica el comportamiento de ComfyUI, lo que facilita su uso como nodo de preprocesado o postprocesado en flujos de generación de imágenes.
- Restauración en tiempo casi real en estaciones de trabajo: con TensorRT fp16 a 162 ms por imagen 512x512, es viable para aplicaciones interactivas de edición fotográfica.

## Benchmarks y rendimiento

### Precisión en datasets públicos

| Variante | Dataset | Original fp32 (PSNR / SSIM) | Portable | Kernels |
|---|---|---|---|---|
| `restormer-deblur` | GoPro test (75 frames, cada 15º), deblurring, RGB | 32,85 / 0,9405 | 32,85 / 0,9405 | 32,85 / 0,9405 |
| `restormer-derain` | Rain100L test (100 imágenes), deraining, Y | 39,08 / 0,9785 | 39,08 / 0,9785 | 39,08 / 0,9785 |
| `restormer-sidd` | SIDD (resultado no incluido en la información disponible) | no disponible | no disponible | no disponible |

### Velocidad y memoria (512x512, RTX 5060 Ti 16 GB)

| Modelo | Tiempo original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Memoria pico portable (MiB alloc/reserved) | Memoria pico kernels (MiB alloc/reserved) |
|---|---|---|---|---|---|---|
| `restormer-deblur` | 234 | 228 | 180 | 1,3x | 850 / 1000 | 850 / 918 |
| `restormer-derain` | 234 | 228 | 180 | 1,3x | 850 / 1000 | 850 / 920 |
| `restormer-sidd` | 218 | 181 | 179 | 1,2x | 850 / 920 | 850 / 940 |

### torch.compile y TensorRT (512x512)

| Modelo | Portable (ms) | compile (ms) | TensorRT fp16 (ms) | Kernels (ms) | Prep. compile (s) | Prep. ONNX+engine (s) |
|---|---|---|---|---|---|---|
| `restormer-deblur` | 228 | 143 | 162 | 180 | 44,1 | 58,3 |
| `restormer-derain` | 228 | 144 | 162 | 180 | 41,5 | 55,3 |
| `restormer-sidd` | 181 | 142 | 162 | 179 | 35,5 | 59,7 |

### Arranque y primera llamada

| Modelo | Carga original (s) | Carga portable (s) | Carga kernels (s) | Primera llamada original (s) | Primera llamada portable (s) | Primera llamada kernels (s) |
|---|---|---|---|---|---|---|
| `restormer-deblur` | 0,36 | 0,28 | 0,60 | 0,90 | 0,71 | 0,53 |
| `restormer-derain` | 0,34 | 0,29 | 0,58 | 0,90 | 0,72 | 0,53 |
| `restormer-sidd` | 0,34 | 0,29 | 0,59 | 0,89 | 0,89 | 0,53 |

## Requisitos de hardware

- VRAM estimada: ~850 MiB de memoria pico asignada para 512x512 en fp16 (portable y kernels); ~6,0 GiB pico asignado para 1024x2048 en fp16 en RTX 5060 Ti 16 GB.
- GPU recomendadas: RTX 5060 Ti 16 GB (hardware de referencia de los benchmarks); cualquier GPU consumer con >= 8 GB de VRAM es suficiente para 512x512; para 1024x2048 se recomienda >= 8-12 GB.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, etc.; los benchmarks se realizaron en RTX 5060 Ti 16 GB (sm_120).
- Opciones de despliegue: backend `portable` (PyTorch fp16), backend `kernels` (kernels CUDA propios), `torch.compile`, TensorRT fp16 (exportación ONNX + engine), y ejecución por teselas (`tile=`) para imágenes grandes.
- Latencia: 180-228 ms por imagen 512x512; 143-162 ms con `torch.compile` o TensorRT fp16; 162 ms con TensorRT.
- Throughput estimado: ~4-5 imágenes/s en 512x512 con backend portable, ~5,5-7 imágenes/s con kernels o TensorRT, en RTX 5060 Ti 16 GB.
- Tiempo de preparación: ~35-60 s para compilación o construcción de engine TensorRT (coste único).

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | PSNR GoPro | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Restormer (fastforks) | Transformer U-Net para restauración | no disponible | no aplica | 32,85 dB | MIT | Pesos en GitHub de los autores; tarjeta en HF |
| Modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni especificaciones de modelos alternativos (por ejemplo, MPRNet, NAFNet, SwinIR) para establecer una comparativa cuantitativa fiable. Se indica "no disponible" para evitar inventar cifras.

## Limitaciones y advertencias

- El repositorio no aloja pesos: es solo una tarjeta de modelo; la descarga de checkpoints se realiza desde los enlaces de los autores y debe verificarse el SHA-256.
- Cada variante está especializada en una única tarea (deblur, derain o sidd); no es un modelo generalista de restauración.
- No es un modelo de lenguaje: no soporta texto, tool calling, agentes ni capacidades multilingües.
- La información disponible no documenta sesgos conocidos ni tasas de alucinación (no aplica en el mismo sentido que en LLM, pero sí puede producir artefactos visuales).
- El tamaño de entrada debe ser >= 32 y múltiplo de 32 tras el padding interno; imágenes muy grandes requieren `tile=` para evitar OOM.
- Los benchmarks se realizaron en una única GPU (RTX 5060 Ti 16 GB, sm_120); el rendimiento en otras arquitecturas puede variar.
- La licencia MIT permite uso comercial, pero la model card advierte que el paquete original es de "research-use" y recomienda revisar las cadenas de licencia antes de cualquier otro uso.
- No se documentan limitaciones de idioma porque el modelo no procesa texto.
- El resultado de `restormer-sidd` en SIDD no se incluye en la información disponible; no debe asumirse un valor.

## Enlaces

- Hugging Face: https://huggingface.co/fastforks/restormer
- Repositorio de código fastforks: https://github.com/kleinicke/fastforks
- Kernels para backend `kernels`: https://huggingface.co/fastforks/kernels
- Código original de Restormer: https://github.com/swz30/Restormer (commit `68dc6ac472db`)
- Pesos `motion_deblurring.pth`: https://github.com/swz30/Restormer/releases/download/v1.0/motion_deblurring.pth
- Pesos `deraining.pth`: https://github.com/swz30/Restormer/releases/download/v1.0/deraining.pth
- Pesos `real_denoising.pth`: https://github.com/swz30/Restormer/releases/download/v1.0/real_denoising.pth
- Release v1.0: https://github.com/swz30/Restormer/releases/tag/v1.0
- Licencia original: https://github.com/swz30/Restormer/blob/68dc6ac472db26f16361150cb7a96a1bc87da93f/LICENSE.md
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- `card.toml` con hashes completos: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/restoration/models/restormer/card.toml
