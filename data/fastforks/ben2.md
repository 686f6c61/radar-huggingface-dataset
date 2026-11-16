# fastforks/ben2

## Resumen

BEN2 (Background Erase Network 2) es un modelo de segmentación de imágenes y *matting* desarrollado por Prama LLC en 2025, orientado a la eliminación de fondos y a la segmentación dicotómica de objetos (DIS, *dichotomous image segmentation*). El repositorio `fastforks/ben2` es una model card de integración: no aloja pesos propios, sino que describe cómo el framework `fastforks` descarga los pesos originales de `PramaLLC/BEN2`, los verifica mediante SHA-256 y los ejecuta con dos backends (`portable` y `kernels`). Es relevante para desarrolladores que necesitan integrar eliminación de fondos de alta resolución en pipelines de producción con garantías de reproducibilidad y paridad numérica frente al código original.

La arquitectura combina un encoder Swin Transformer v1 Base que procesa la imagen a media resolución junto con cuatro parches de cuarto de resolución a tamaño completo, fusionados mediante atención cruzada multivista al estilo MVANet. Una cabeza convolucional hace el *upsampling* hasta una máscara alfa por imagen. El modelo está pensado para inferencia en GPU (CUDA/PyTorch) y admite entradas de cualquier tamaño H x W mayor o igual a 32, redondeadas a múltiplos de 32; se ha probado hasta 3000x4000 píxeles en una RTX 5060 Ti de 16 GB con fp16.

La licencia de los pesos es MIT, lo que permite uso comercial, aunque el paquete de código original se distribuye como *research-use package* y conviene revisar sus condiciones antes de otros usos. La ficha se centra en la variante `ben2@1`, la única documentada en este repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Swin Transformer v1 Base (encoder) + atención cruzada multivista (MVANet-style) + cabeza convolucional |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada H x W >= 32, múltiplo de 32) |
| Tipos de cuantización | fp32 (CPU/referencia), fp16 (GPU por defecto); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de lenguaje) |
| Licencia | MIT (pesos); código original con condiciones de research-use a revisar |
| Formato de pesos | safetensors (`ben2.safetensors`, SHA-256 `ea8b7907176a…`) |
| Tarea | Matting / eliminación de fondo / segmentación dicotómica |
| Salida | Máscara alfa `[H, W]` en [0, 1] a la resolución de entrada |
| Backends | `portable`, `kernels` (kernels CUDA propios: `cudnn_hacc`, `igev`, `cutlass_conv`) |
| Librería | `fastforks` |
| Modelo base | `PramaLLC/BEN2` |

## Arquitectura y entrenamiento

El modelo sigue un diseño de segmentación de objeto saliente con múltiples vistas. Un encoder Swin Transformer v1 Base procesa la imagen a media resolución y, en paralelo, cuatro parches de cuarto de resolución a resolución completa. Un módulo de atención cruzada multivista, inspirado en MVANet, fusiona estas representaciones, y una cabeza convolucional genera la máscara alfa final mediante *upsampling*. La salida es una única máscara por imagen, sin *trimap* obligatorio (aunque el framework soporta modelos guiados por *trimap* en general).

El entrenamiento se realizó sobre DIS5K (segmentación dicotómica) y un conjunto propietario de Prama LLC de 22 000 imágenes de segmentación. La model card original indica que DIS-VD (validación de DIS5K) quedó fuera del entrenamiento. No se documentan en la información disponible detalles sobre número total de tokens/píxeles, composición exacta del dataset, ni si se aplicaron técnicas de RLHF/DPO (no aplicables a un modelo de visión). Como innovación de despliegue, el framework `fastforks` ofrece kernels CUDA propios y paridad numérica verificada frente al código original (CPU fp32: max |diff| <= 3.5e-06; GPU fp16: mean |diff| <= 2.4e-05, p99 <= 0.00026).

## Capacidades

- Eliminación de fondo (*background removal*) generando una máscara alfa binaria/continua en [0, 1].
- Segmentación dicotómica de objetos (DIS) y segmentación de objeto saliente.
- Procesamiento de imágenes RGB de cualquier tamaño H x W >= 32 (redondeado a múltiplos de 32), incluyendo resoluciones muy altas (probado hasta 3000x4000).
- Inferencia en GPU con fp16 por defecto y en CPU con fp32 para referencia.
- Dos backends: `portable` (portable a distintas GPUs) y `kernels` (kernels CUDA optimizados con *speed-up* de hasta 1,9x frente al código original).
- Verificación de integridad de pesos mediante SHA-256.
- Compatibilidad con `torch.compile` y exportación a TensorRT fp16 (latencia de 58,2 ms en 1080x1920).
- No soporta *tool calling*, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.

## Casos de uso

- Eliminación de fondo en fotografía de producto: el modelo genera una máscara alfa a resolución nativa de la imagen, lo que permite recortar objetos con bordes finos (pelo, transparencias) sin reescalado, adecuado para catálogos de e-commerce.
- *Preprocessing* en pipelines de imagen generativa: usar la máscara alfa como entrada para *inpainting*, composición o sustitución de fondos en herramientas de edición automática.
- Segmentación de objetos en imágenes de alta resolución (hasta 3000x4000 probado): útil en archivística, cartografía o análisis de imágenes satelitales donde el detalle importa.
- Automatización de flujos de diseño gráfico: extracción masiva de sujetos de imágenes para plantillas, banners o *thumbnails*, con latencia de ~104-110 ms por imagen 1080x1920 en RTX 5060 Ti.
- Integración en servicios de vídeo o *streaming*: al ser un modelo ligero en memoria (1,4-1,7 GiB pico en 1080x1920 con backend `kernels`), puede ejecutarse en GPUs de consumo para segmentación por fotograma.
- Investigación en segmentación dicotómica: punto de partida reproducible (paridad numérica con el código original) para comparativas y *benchmarking* sobre DIS5K.

## Benchmarks y rendimiento

Precisión sobre DIS5K (DIS-VD), MAE / max F-beta (beta² = 0,3, 256 umbrales):

| Variante | Dataset | Original fp32 | Original fp16 | Portable | Kernels |
|---|---|---|---|---|---|
| `ben2` | DIS-VD, 470 imágenes | no disponible | no disponible | no disponible | 0,0403 / 0,9000 |
| `ben2` | DIS-VD, cada 2ª imagen (235) | 0,0421 / 0,8919 | 0,0421 / 0,8919 | 0,0421 / 0,8919 | 0,0421 / 0,8919 |

Latencia y memoria (matting sintético, 1080x1920, RTX 5060 Ti 16 GB):

| Modelo | Tiempo original | Portable | Kernels | Speed-up kernels vs original | Memoria pico (MiB, alloc/reserved) portable | kernels |
|---|---|---|---|---|---|---|
| `ben2` | 201 ms | 110 ms | 104 ms | 1,9x | 1681 / 1956 | 1430 / 1698 |

*Startup* y primera llamada:

| Modelo | Carga original | Carga portable | Carga kernels | 1ª llamada original | 1ª llamada portable | 1ª llamada kernels |
|---|---|---|---|---|---|---|
| `ben2` | 2,29 s | 13,95 s | 1,12 s | 0,93 s | 0,92 s | 0,43 s |

`torch.compile` y TensorRT (1080x1920):

| Modelo | Portable | Compile | TensorRT fp16 | Kernels | Compile (1ª llamada en frío) | ONNX + engine build |
|---|---|---|---|---|---|---|
| `ben2` | 110 ms | 103 ms | 58,2 ms | 104 ms | 70,8 s | 140 s |

## Requisitos de hardware

- VRAM estimada: ~1,4-1,7 GiB pico en 1080x1920 con backend `kernels`; ~1,7-2,0 GiB con `portable`; ~2,5-2,8 GiB con el código original.
- Probado en NVIDIA RTX 5060 Ti 16 GB (sm_120) con fp16; 3000x4000 alcanza 1,8 GiB asignados (2,7 reservados).
- Cabe en GPUs de consumo con al menos ~4 GB de VRAM para resoluciones habituales; para 4K se recomienda 8-16 GB.
- Backend `kernels` requiere una GPU con kernel precompilado disponible (descarga desde `fastforks/kernels`) y drivers NVIDIA recientes; si no existe, lanza error.
- Despliegue: librería `fastforks` (`pip install fastforks`), con modos `portable` y `kernels`; compatible con `torch.compile` y exportación a TensorRT fp16.
- Latencia: ~104-110 ms por imagen 1080x1920 en RTX 5060 Ti; ~58 ms con TensorRT fp16.
- No se documentan opciones para llama.cpp, Ollama, vLLM o TGI (no aplicables a un modelo de visión de este tipo).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BEN2 (`fastforks/ben2`) | no disponible | H x W >= 32, probado hasta 3000x4000 | DIS-VD: MAE 0,0403 / F-beta 0,9000 | MIT (pesos) | Hugging Face + GitHub |
| BiRefNet | no disponible | no disponible | Protocolo de evaluación de referencia (256 umbrales) | no disponible | Hugging Face |
| RMBG 2.0 | no disponible | no disponible | Mencionado como predecesor sin preservar DIS5K validation | no disponible | no disponible |

No se dispone de datos comparativos numéricos adicionales en la información proporcionada; los modelos alternativos se citan solo como referencia cualitativa.

## Limitaciones y advertencias

- Es un modelo puramente visual: no procesa texto, no soporta *tool calling* ni razonamiento multi-paso.
- El repositorio no aloja pesos: depende de la disponibilidad de `PramaLLC/BEN2` y de la verificación SHA-256 para integridad.
- El backend `kernels` requiere un kernel precompilado para la arquitectura de GPU; si no existe, falla y hay que usar `portable`.
- La primera llamada con `portable` tarda ~14 s en cargar; `torch.compile` añade ~71 s de compilación en frío.
- Riesgo de alucinación no aplica en el sentido de texto, pero puede producir máscaras incorrectas en objetos ambiguos, con transparencias complejas o fondos de bajo contraste.
- Sesgos: no documentados en la información disponible; el dataset propietario de 22K imágenes puede introducir sesgos de dominio no especificados.
- Licencia: los pesos son MIT, pero el código original se distribuye como *research-use package*; revisar sus condiciones antes de usos distintos a la investigación.
- Solo se documenta la variante `ben2@1`; no hay datos sobre otras variantes o cuantizaciones.
- No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fastforks/ben2
- Pesos originales: https://huggingface.co/PramaLLC/BEN2
- Código original: https://github.com/PramaLLC/BEN2 (commit `2c99a5da477b`)
- Framework `fastforks`: https://github.com/kleinicke/fastforks
- Kernels: https://huggingface.co/fastforks/kernels
- Benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Model card original (licencia): https://huggingface.co/PramaLLC/BEN2/blob/e48a20765fb421d19dcdb0bf3cc61e802ca5ec8f/README.md
- Licencia del código original: https://github.com/PramaLLC/BEN2/blob/2c99a5da477b5523585bfa5c893888a6e818a8f6/LICENSE
