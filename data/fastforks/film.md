# fastforks/film

## Resumen

FILM (Frame Interpolation for Large Motion) es un modelo de interpolación de fotogramas de vídeo presentado por Reda et al. en ECCV 2022. Esta ficha corresponde al paquete `fastforks/film`, que no aloja pesos propios: es una model card que documenta la integración del modelo original en la librería `fastforks`, descargando los pesos publicados por los autores y verificándolos mediante SHA-256. El modelo genera el fotograma intermedio entre dos imágenes RGB consecutivas, resolviendo el problema de la interpolación temporal en vídeo con movimientos grandes entre fotogramas.

La arquitectura es una red neuronal convolucional con una pirámide de imágenes de 7 niveles, un extractor de características convolucional compartido entre niveles, una pirámide de flujo residual bidireccional y un decodificador tipo U-Net. El modelo se entrenó para predecir el fotograma central (timestep 0.5) sobre el dataset Vimeo-90K, con tripletas específicas para interpolación. Es relevante para pipelines de vídeo que necesitan aumentar la tasa de fotogramas, generar cámara lenta o estabilizar secuencias sin recurrir a interpolación lineal.

La integración en `fastforks` ofrece dos backends (`portable` y `kernels` con CUDA propio), soporte de `torch.compile` y métricas de rendimiento y precisión publicadas sobre DAVIS 2017. La licencia del código es Apache-2.0 y los pesos de los autores también se declaran Apache-2.0 con uso comercial permitido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con piramide de imagenes de 7 niveles, extractor de caracteristicas compartido, piramide de flujo residual bidireccional y decodificador tipo U-Net |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | fp32 y fp16 (fp16 es el valor por defecto en GPU); no se documentan cuantizaciones de enteros |
| Idiomas soportados | no disponible (modelo sin entrada de texto) |
| Licencia | Apache-2.0 (codigo y pesos declarados) |
| Formato de pesos | `.pt` (PyTorch, `film-net-style-fp32.pt`); no se distribuyen pesos en el repo de Hugging Face |
| Tarea | interpolacion de fotogramas (image-to-image) |
| Entrada | dos imagenes RGB consecutivas, cualquier H x W >= 64, con padding a multiplo de 64 |
| Salida | fotograma intermedio RGB en [0, 1] a resolucion de entrada, en el `timestep` indicado (0.5 por defecto) |
| Backends | `portable` y `kernels` (kernels CUDA propios, `cudnn_hacc`) |
| Variantes | `film@1` (unica) |

## Arquitectura y entrenamiento

FILM emplea una piramide de imagenes de 7 niveles sobre los dos fotogramas de entrada. Un unico sub-arbol convolucional extrae caracteristicas en todos los niveles, de modo que los niveles gruesos se benefician de muestras de entrenamiento finas. Sobre esa base se construye una piramide de flujo residual en ambas direcciones con un predictor compartido por los niveles gruesos; las imagenes y caracteristicas de ambos fotogramas se deforman (`warp`) al instante objetivo en los 5 niveles mas finos, y un decodificador tipo U-Net reconstruye el fotograma intermedio. El modelo se entrena para el fotograma central; otros `timestep` funcionan segun lo permita la implementacion original.

El entrenamiento utiliza el dataset Vimeo-90K en su configuracion de tripletas para interpolacion de fotogramas (segun el README de `google-research/frame-interpolation`, configuracion `film_net-Style.gin`). No se documentan en la informacion disponible detalles sobre numero de tokens, composicion exacta del dataset ni fases de RLHF o DPO, que no aplican a esta tarea. La innovacion principal es el diseno para movimiento grande: la combinacion de piramide multinivel, caracteristicas compartidas y flujo residual bidireccional permite interpolar entre fotogramas con desplazamientos amplios, algo que los metodos de flujo optico clasico suelen fallar.

## Capacidades

- Interpolacion de fotogramas entre dos imagenes RGB consecutivas, con `timestep` configurable (0.5 por defecto; 0 devuelve el primer fotograma, 1 el segundo).
- Manejo de movimiento grande entre fotogramas gracias a la piramide de 7 niveles y al flujo residual bidireccional.
- Entrada de resolucion arbitraria con H y W >= 64, con padding interno a multiplo de 64; probado hasta 1988x2880 en fp16 sobre una RTX 5060 Ti de 16 GB.
- Ejecucion en CPU en float32 y en GPU en float16, con paridad verificada frente al codigo original (max |diff| <= 5e-05 en CPU fp32; mean |diff| <= 0.001 y p99 <= 0.005 en GPU fp16).
- Backend `kernels` con kernels CUDA propios para acelerar la inferencia.
- Compatibilidad con `torch.compile` (332 ms frente a 417 ms en portable a 1080x1920).
- No soporta tool calling, agentes, texto, vision general, audio ni modo de razonamiento; es exclusivamente un modelo de interpolacion de imagen a imagen.

## Casos de uso

- Aumento de tasa de fotogramas en postproduccion: insertar fotogramas intermedios entre pares consecutivos para pasar de 24 a 48 o 60 fps, usando `timestep` para generar varios fotogramas por intervalo y manteniendo la resolucion original.
- Camara lenta de material grabado: interpolar entre fotogramas existentes para reproducir a velocidad reducida sin artefactos de duplicacion, aprovechando la robustez ante movimiento grande.
- Estabilizacion y suavizado temporal: generar fotogramas intermedios en secuencias con movimiento de camara para reducir el judder antes de un reescalado o montaje.
- Restauracion de archivos con tasa de fotogramas baja: reconstruir la continuidad temporal de metraje antiguo o de bajo fps interpolando entre fotogramas disponibles.
- Pipelines de vision por computador: aumentar la densidad temporal de datasets de video para tareas de deteccion, seguimiento o segmentacion, ejecutando el modelo por lotes sobre pares de fotogramas.
- Generacion de video a partir de pares de imagenes clave: usar el modelo como interpolador entre keyframes generados por otros modelos para producir secuencias continuas, con control del `timestep` para distribuir los fotogramas intermedios.
- Prototipado e investigacion en interpolacion: comparar resultados frente al codigo original con paridad documentada, usando el backend `portable` en CPU o GPU y el backend `kernels` para medir aceleraciones.

## Benchmarks y rendimiento

Precision sobre DAVIS 2017 trainval 480p (JPEG), tripletas de fotogramas 0/2 y 20/22 de cada uno de los 90 videos, fotograma 1/21 a `timestep` 0.5, PSNR y SSIM (Gaussiano 11x11, sigma 1.5) sobre salida redondeada a uint8:

| Variante | Dataset | Original fp32 | Original fp16 | Portable | Kernels |
|---|---|---|---|---|---|
| `film` | DAVIS 2017 480p, 180 tripletas, PSNR / SSIM | 27.63 / 0.8105 | 27.46 / 0.8092 | 27.63 / 0.8105 | 27.63 / 0.8104 |

Rendimiento de interpolacion sintetica a 1080x1920 sobre RTX 5060 Ti 16 GB (sm_120):

| Modelo | Tiempo original (ms) | Portable (ms) | Kernels (ms) | Aceleracion kernels vs original | Memoria pico portable (MiB alloc/reserved) | Memoria pico kernels (MiB alloc/reserved) |
|---|---|---|---|---|---|---|
| `film` | 464 | 417 | 333 | 1.4x | 2856 / 3080 | 2856 / 3060 |

Arranque y primera llamada:

| Modelo | Carga original (s) | Carga portable (s) | Carga kernels (s) | Primera llamada original (s) | Primera llamada portable (s) | Primera llamada kernels (s) |
|---|---|---|---|---|---|---|
| `film` | 0.29 | 0.43 | 0.65 | 0.95 | 0.42 | 0.33 |

`torch.compile` y TensorRT a 1080x1920:

| Modelo | Portable (ms) | Compile (ms) | TensorRT fp16 | Kernels (ms) | Preparacion compile (s) | Memoria pico portable (alloc/reserved, MiB) | Memoria pico compile (alloc/reserved, MiB) |
|---|---|---|---|---|---|---|---|
| `film` | 417 | 332 | planificado para 0.2.1 | 333 | 41.1 | 2856 / 3080 | 2666 / 3192 |

No se han publicado resultados de benchmarks adicionales (por ejemplo, frente a otros modelos de interpolacion) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en fp16 a 1080x1920, unos 2856 MiB asignados y 3080 MiB reservados por el allocator de PyTorch; a 1988x2880, 13.0 GiB pico asignados y 15.3 GiB reservados.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 4 GB de VRAM para 1080p; para resoluciones cercanas a 4K se necesitan 16 GB o mas (probado en RTX 5060 Ti 16 GB).
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas para 1080p; en 4 GB puede requerir reducir resolucion o usar `portable` en fp16.
- Opciones de despliegue: libreria `fastforks` (`pip install fastforks`), con backends `portable` y `kernels`; soporte de `torch.compile`; TensorRT fp16 planificado para la version 0.2.1. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 333 ms por par de fotogramas a 1080x1920 con backend `kernels` (417 ms en `portable`, 332 ms con `torch.compile`); la primera llamada tarda 0.33 s en `kernels` y 0.42 s en `portable`, con carga de pesos de 0.43 a 0.65 s.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de benchmarks ni especificaciones de modelos alternativos de interpolacion de fotogramas (por ejemplo, RIFE, IFNet o Super SloMo) que permitan una comparacion rigurosa. La unica comparacion documentada es frente al codigo original de `dajes/frame-interpolation-pytorch` en su commit `33bf477ea2c6`, con paridad de precision y aceleraciones de hasta 1.4x con el backend `kernels`.

| Modelo | Parametros | Contexto | Precision DAVIS 2017 (PSNR/SSIM) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fastforks/film` | no disponible | no aplica | 27.63 / 0.8105 | Apache-2.0 | Hugging Face (model card) y GitHub |
| Codigo original (`dajes/frame-interpolation-pytorch`) | no disponible | no aplica | 27.63 / 0.8105 | Apache-2.0 | GitHub |
| Alternativas (RIFE, IFNet, Super SloMo) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio de Hugging Face no contiene pesos: solo la model card. La descarga de pesos se realiza desde los enlaces de los autores y se verifica contra el SHA-256 documentado; sin esa verificacion no hay garantia de integridad.
- El modelo esta entrenado para el fotograma central (`timestep` 0.5); otros valores de `timestep` funcionan solo en la medida en que lo permita la implementacion original, sin garantias de calidad equivalentes.
- Puede producir artefactos en oclusiones, objetos que aparecen o desaparecen, cambios bruscos de iluminacion, movimiento no rigido complejo y texturas de alta frecuencia; la interpolacion es una sintesis, no una captura real.
- Resolucion minima de 64x64 y padding a multiplo de 64; resoluciones muy altas disparan el consumo de memoria (13 GiB asignados a 1988x2880 en fp16).
- No procesa texto, audio ni otras modalidades; no dispone de tool calling, agentes ni razonamiento multi-paso.
- No se documentan sesgos especificos ni evaluaciones de robustez fuera de DAVIS 2017; el rendimiento en dominios distintos al de entrenamiento (Vimeo-90K) no esta medido en la informacion disponible.
- La licencia se declara Apache-2.0 tanto para el codigo como para los pesos, con uso comercial permitido segun la tabla de variantes, pero la model card advierte que el paquete original es de uso de investigacion y recomienda revisar las cadenas de licencia antes de cualquier otro uso.
- El backend TensorRT fp16 esta planificado para la version 0.2.1 y no esta disponible en la version documentada; el backend `kernels` requiere compilacion CUDA y esta probado en sm_120.
- El modelo se marca como de nivel "experimental" y la libreria `fastforks` no tiene descargas ni likes registrados en Hugging Face, por lo que la madurez de la integracion es limitada.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/film
- Repositorio de la libreria fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Codigo original (dajes/frame-interpolation-pytorch): https://github.com/dajes/frame-interpolation-pytorch
- Commit de referencia del codigo original: https://github.com/dajes/frame-interpolation-pytorch/tree/33bf477ea2c6
- Licencia del codigo original: https://github.com/dajes/frame-interpolation-pytorch/blob/33bf477ea2c65a2ed1b5f2280ee1f02be06910e8/LICENSE
- Release v1.0.2 con los pesos: https://github.com/dajes/frame-interpolation-pytorch/releases/tag/v1.0.2
- Pesos `film-net-style-fp32.pt`: https://github.com/dajes/frame-interpolation-pytorch/releases/download/v1.0.2/film_net_fp32.pt
- Repositorio original de Google Research: https://github.com/google-research/frame-interpolation
- README de Google Research (datasets): https://github.com/google-research/frame-interpolation/blob/69f8708f08e62c2edf46a27616a4bfcf083e2076/README.md
- Documentacion de benchmarks de fastforks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Fichero `card.toml` con hashes completos: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/interpolation/models/film/card.toml
