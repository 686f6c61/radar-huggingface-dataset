# fastforks/compact

## Resumen

Real-ESRGAN Compact es una implementación del modelo SRVGGNetCompact (Wang et al.) para superresolución y restauración de imágenes en ciegas, distribuida a través del repositorio `fastforks/compact`. Se trata de una red convolucional de estilo VGG compacta: convoluciones 3x3 con PReLU a la resolución de entrada, un único pixel-shuffle hasta la resolución de salida y suma de la entrada reescalada por vecino más cercano. El checkpoint principal, `realesr-general-x4v3`, cuenta con 32 convoluciones, 64 canales y aproximadamente 1,2 millones de parámetros.

El modelo resuelve el problema de la superresolución realista (no bicúbica): está entrenado con degradaciones sintéticas que imitan las condiciones del mundo real, lo que permite restaurar fotografías con ruido, compresión o desenfoque y multiplicar su resolución por 4. Su tamaño reducido (1,2 M de parámetros) lo hace especialmente adecuado para despliegue en hardware modesto, incluso GPU de consumo, con latencias del orden de decenas de milisegundos por imagen de 512x512.

Este repositorio es únicamente una model card: no aloja pesos. La librería `fastforks` descarga los pesos originales desde los enlaces del autor y verifica su integridad mediante SHA-256. Está marcado como tier experimental y su relevancia actual reside en ofrecer una vía de ejecución optimizada (backend `kernels`, `torch.compile`, TensorRT) de un modelo clásico de restauración con paridad numérica verificada frente al código original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SRVGGNetCompact (CNN VGG-style con PReLU y pixel-shuffle) |
| Parametros totales | ~1,2 M (realesr-general-x4v3: 32 convs, 64 canales) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible (ejecución en fp16 y fp32) |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | BSD-3-Clause |
| Formato de pesos | `.pth` (checkpoint PyTorch, alojado por el autor original) |

## Arquitectura y entrenamiento

La arquitectura SRVGGNetCompact es una red convolucional totalmente feed-forward de tipo VGG compacta. Procesa la imagen de entrada a su resolución original mediante convoluciones 3x3 con activación PReLU, aplica un único pixel-shuffle para alcanzar la escala de salida (x4 en el checkpoint `realesr-general-x4v3`) y suma la entrada reescalada por vecino más cercano como conexión residual. La implementación `load(path)` de fastforks admite otros checkpoints Compact con cualquier escala, número de canales y profundidad.

El entrenamiento sigue el esquema de Real-ESRGAN: degradaciones sintéticas que emulan condiciones del mundo real sobre imágenes de alta resolución. Los datos de entrenamiento documentados son DF2K (DIV2K, 1000 imágenes 2K de NTIRE 2017, más Flickr2K, 2650 imágenes 2K de Flickr usadas en EDSR) junto con imágenes HR de OutdoorSceneTraining (OST, de SFTGAN), todo ello con las degradaciones sintéticas de Real-ESRGAN. La model card indica que los datos específicos del modelo general v3 no se detallan más allá de esta composición. No se documenta uso de RLHF ni DPO (no aplica a esta tarea).

La innovación técnica destacable no está en la arquitectura (clásica y bien conocida) sino en la infraestructura de ejecución: backend `portable` y backend `kernels` con paridad numérica verificada frente al código original (en CPU fp32, diferencia máxima absoluta ≤ 1e-06; en GPU fp16, error medio ≤ 0,00093 y p99 ≤ 0,004). Se documenta también soporte de `torch.compile` y TensorRT fp16.

## Capacidades

- Superresolución de imágenes x4 (escala definida por `model.scale`) con salida RGB en [0, 1].
- Restauración de imágenes en ciegas: eliminación de ruido, compresión y desenfoque propios de degradaciones reales.
- Procesamiento por mosaicos solapados (`tile=`) para imágenes de gran tamaño, al estilo de ComfyUI.
- Entrada de cualquier tamaño H x W ≥ 1, redimensionada o rellenada internamente por el modelo.
- Carga de otros checkpoints Compact con cualquier escala, canales y profundidad mediante `load(path)`.
- Ejecución en dos backends (`portable` y `kernels`) con selección automática del preferido según mediciones registradas.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (es un modelo de imagen puro).

## Casos de uso

- Restauración de fotografías antiguas o de baja calidad: el modelo aplica superresolución x4 con degradaciones realistas, adecuado para digitalizar archivos fotográficos con ruido y compresión.
- Mejora de imágenes en pipelines de preprocesado: integrado como paso previo en flujos de visión por computador que requieren mayor resolución de entrada, con latencias de ~24-30 ms por imagen de 512x512 en RTX 5060 Ti.
- Upscaling en aplicaciones de escritorio o web con GPU de consumo: sus 1,2 M de parámetros y ~125 MiB de memoria pico permiten ejecutarlo en tarjetas modestas, incluso en fp16.
- Procesamiento por lotes de imágenes grandes: el modo `tile=512` permite tratar imágenes de alta resolución sin agotar memoria, dividiéndolas en mosaicos solapados.
- Restauración de contenido generado o comprimido: útil para recuperar calidad en imágenes que han pasado por codecs agresivos o reescalados previos.
- Integración en herramientas de edición y ComfyUI: la API `fastforks.restoration.load(...)` y el procesamiento por tiles facilitan su incorporación a nodos de restauración en flujos gráficos.
- Despliegue de bajo coste en producción: el backend `kernels` ofrece una aceleración de 1,8x frente al código original y 1,3x frente al backend portable, con menor latencia de primera llamada (0,05 s frente a 0,20 s).

## Benchmarks y rendimiento

Precisión en DIV2K validation (cada segunda imagen: 50 imágenes), LR bicúbico x4 -> HR, PSNR / SSIM en canal Y:

| Variante | Dataset | Original fp32 | Original fp16 | Portable | Kernels |
|---|---|---|---|---|---|
| `realesr-general-x4v3` | DIV2K val (50 imgs), bicubic x4, PSNR / SSIM (Y) | 26,70 / 0,7701 | 26,70 / 0,7701 | 26,70 / 0,7701 | 26,70 / 0,7701 |

Velocidad y memoria (restauración sintética 512x512, RTX 5060 Ti 16 GB, sm_120):

| Modelo | Tiempo original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | vs portable | Memoria pico original (MiB) | Portable | Kernels |
|---|---|---|---|---|---|---|---|---|
| `realesr-general-x4v3` | 42,1 | 30,1 | 24,0 | 1,8x | 1,3x | 157 / 206 | 125 / 164 | 125 / 164 |

Arranque y primera llamada:

| Modelo | Carga original (s) | Portable (s) | Kernels (s) | Primera llamada original (s) | Portable (s) | Kernels (s) |
|---|---|---|---|---|---|---|
| `realesr-general-x4v3` | 0,16 | 0,40 | 0,31 | 0,20 | 0,29 | 0,05 |

`torch.compile` y TensorRT (512x512):

| Modelo | Portable | Compile | TensorRT fp16 | Kernels | Compile (cold) | ONNX + engine build | Memoria pico portable (MiB) | Compile | Kernels | TensorRT |
|---|---|---|---|---|---|---|---|---|---|---|
| `realesr-general-x4v3` | 30,1 ms | 22,6 ms | 11,9 ms | 24,0 ms | 3,89 s | 15,3 s | 125 / 164 | 125 / 144 | 125 / 164 | 220 / 228 |

## Requisitos de hardware

- VRAM estimada: ~125 MiB de memoria pico asignada (164 MiB reservada) para 512x512 en fp16 con los backends portable y kernels; ~220 MiB con TensorRT (motor + torch).
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; las mediciones se realizaron en una RTX 5060 Ti 16 GB (sm_120). No se documentan requisitos para otras GPU.
- Cabe holgadamente en GPU de consumo: 1,2 M de parámetros y ~125-164 MiB de pico lo permiten en tarjetas de gama baja con suficiente VRAM.
- Opciones de despliegue: librería `fastforks` (`pip install fastforks`), backends `portable` y `kernels`, `torch.compile` y TensorRT fp16. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de imagen).
- Latencia y throughput: 24,0 ms (kernels), 30,1 ms (portable) y 11,9 ms (TensorRT fp16) por imagen de 512x512; primera llamada de 0,05 s con kernels; carga del modelo de 0,31-0,40 s.

## Comparativa con modelos similares

| Modelo | Parámetros | Escala | Contexto de tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Real-ESRGAN Compact (`realesr-general-x4v3`) | ~1,2 M | x4 | Superresolución realista ciega | BSD-3-Clause | Pesos en GitHub del autor, ejecución vía fastforks |
| Real-ESRGAN (RRDB, modelo completo) | no disponible en la información | x4 | Superresolución realista ciega | BSD-3-Clause (según repo original) | Pesos en GitHub del autor |
| Otros upscalers PSNR-oriented (p. ej. EDSR) | no disponible en la información | x4/x2 | Superresolución bicúbica | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada; la model card advierte que el PSNR de Real-ESRGAN frente a LR bicúbico es bajo por diseño, ya que está entrenado para degradaciones reales y no para maximizar PSNR.

## Limitaciones y advertencias

- El repositorio no aloja pesos: la librería debe descargarlos desde los enlaces del autor original y verificarlos por SHA-256; sin acceso a esos enlaces no hay ejecución.
- Marcado como tier experimental; la API y el comportamiento pueden cambiar.
- El PSNR frente a LR bicúbico es bajo por diseño (26,70 dB en DIV2K val); no debe compararse con upscalers orientados a PSNR.
- La model card advierte que las cadenas de licencia del código original se registran tal cual y que es un paquete de uso de investigación: conviene revisarlas antes de cualquier otro uso.
- La licencia BSD-3-Clause permite uso comercial según la tabla de variantes, pero el aviso de "research-use package" introduce ambigüedad que debe verificarse.
- No se documentan sesgos específicos, pero al ser un modelo de restauración puede introducir artefactos o alucinaciones visuales en imágenes muy degradadas.
- No soporta idiomas, texto ni razonamiento: cualquier expectativa de modelo de lenguaje es inaplicable.
- Las mediciones de rendimiento corresponden únicamente a una RTX 5060 Ti 16 GB con torch 2.14.1+cu130; el rendimiento en otro hardware no está documentado.
- El procesamiento por tiles es necesario para imágenes grandes; sin él puede agotarse la memoria.

## Enlaces

- Hugging Face: https://huggingface.co/fastforks/compact
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Código de fastforks: https://github.com/kleinicke/fastforks
- Benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Card TOML con hashes completos: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/restoration/models/compact/card.toml
- Código original Real-ESRGAN: https://github.com/xinntao/Real-ESRGAN (commit a4abfb2979a7)
- Pesos `realesr-general-x4v3.pth`: https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesr-general-x4v3.pth
- Release v0.2.5.0: https://github.com/xinntao/Real-ESRGAN/releases/tag/v0.2.5.0
- Licencia original: https://github.com/xinntao/Real-ESRGAN/blob/a4abfb2979a7bbff3f69f58f58ae324608821e27/LICENSE
