# fastforks/realplksr

## Resumen

RealPLKSR es una red neuronal convolucional (CNN) para superresolución de imágenes del mundo real, es decir, restauración de fotografías que presentan ruido, desenfoque de lente y artefactos de compresión JPEG o WebP. La arquitectura procede del trabajo original PLKSR de Lee et al. (2024) y está implementada en el proyecto neosr; el checkpoint concreto que distribuye este repositorio, `4xNomosWebPhoto_RealPLKSR`, es obra de Philip Hofmann y aplica un factor de escala x4 sobre la imagen de entrada.

El repositorio `fastforks/realplksr` no contiene pesos: es únicamente una model card que documenta cómo el paquete `fastforks` descarga los pesos del autor original y los verifica mediante SHA-256. El modelo se ofrece como una tarea `image-to-image` con salida RGB en el rango [0, 1] y un tamaño de salida igual al de entrada multiplicado por la escala del modelo.

Su relevancia actual reside en que proporciona una vía reproducible y verificable para ejecutar un modelo de restauración de imágenes con backend portable (PyTorch) y backend de kernels optimizados, con métricas de latencia, memoria y paridad numérica frente al código original, lo que facilita su integración en pipelines de producción que necesitan restaurar fotografías degradadas a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con bloques PLKSR (partial large-kernel): mezclador de canales 3x3, convolución 17x17 sobre un cuarto de los canales, atención elemento a elemento, GroupNorm y upsampler pixel-shuffle |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, entrada de cualquier H x W >= 1) |
| Tipos de cuantizacion | fp16 (por defecto en GPU), fp32; no se documentan otras cuantizaciones |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | CC-BY-4.0 (pesos); código Apache-2.0 |
| Formato de pesos | safetensors (checkpoint del autor, no alojado en el repo) |

## Arquitectura y entrenamiento

RealPLKSR es una CNN de superresolución construida con bloques PLKSR, que combinan un mezclador de canales 3x3 con una convolución de kernel grande (17x17) aplicada solo a una cuarta parte de los canales, atención elemento a elemento y normalización GroupNorm. La salida se genera mediante un upsampler pixel-shuffle que permite cualquier factor de escala, anchura y profundidad al cargar otros checkpoints RealPLKSR.

El checkpoint `4xNomosWebPhoto_RealPLKSR` se entrenó sobre Nomos-v2, el conjunto multipropósito de 6000 imágenes de superresolución de neosr, con degradaciones realistas de ruido, desenfoque de lente y compresión JPEG y WebP. El entrenamiento parte de un preentrenamiento GAN de neosr (`4x_realplksr_gan_pretrain`). No se documenta en la información disponible el número de tokens ni detalles de RLHF/DPO, que no aplican a este tipo de modelo.

## Capacidades

- Restauración y superresolución de imágenes RGB con factor x4.
- Eliminación de ruido, corrección de desenfoque de lente y reducción de artefactos de compresión JPEG y WebP.
- Procesamiento de imágenes de cualquier tamaño H x W >= 1, con redimensionado o padding interno.
- Procesamiento por mosaicos (`tile=`) para imágenes grandes, con solapamiento, al estilo de ComfyUI.
- Compatibilidad con checkpoints RealPLKSR de otras escalas, anchuras y profundidades mediante `load(path)`.
- Backends `portable` (PyTorch) y `kernels` (optimizado), con paridad numérica verificada frente al código original.
- No soporta tool calling, agentes, razonamiento multilingüe ni modalidades de texto, audio o vídeo.

## Casos de uso

- Restauración de fotografías de archivo: el modelo corrige ruido y desenfoque de lente en escaneos y fotos antiguas, con salida a 4x la resolución original y procesamiento por mosaicos para imágenes de gran tamaño.
- Limpieza de imágenes comprimidas para web: reduce artefactos de JPEG y WebP en imágenes descargadas o reutilizadas, adecuado para pipelines de publicación de contenido.
- Preprocesado para visión por computador: aumenta la resolución y calidad de imágenes de entrada antes de tareas de detección, segmentación u OCR, aprovechando la salida RGB normalizada en [0, 1].
- Mejora de miniaturas y previsualizaciones: genera versiones de alta resolución a partir de originales de baja calidad en catálogos de e-commerce o galerías.
- Restauración en lotes con backend de kernels: el backend `kernels` reduce el tiempo de 182 ms a 130 ms por imagen de 512x512 frente al backend portable, útil en procesamiento masivo.
- Integración en aplicaciones de escritorio o servidores con GPU consumer: el modelo cabe en GPUs de 16 GB (probado en RTX 5060 Ti con 179 MiB de memoria pico asignada a 512x512), lo que permite desplegarlo en estaciones de trabajo.
- Verificación de integridad en pipelines reproducibles: el paquete `fastforks` comprueba los pesos contra SHA-256, adecuado para entornos con requisitos de trazabilidad.

## Benchmarks y rendimiento

Datos de precisión sobre DIV2K (validación, 50 imágenes, LR bicúbico x4, PSNR/SSIM en canal Y):

| Variante | Original fp32 | Portable | Kernels |
|---|---|---|---|
| `realplksr-nomoswebphoto-x4` | 26.99 / 0.7481 | 26.99 / 0.7481 | 26.99 / 0.7481 |

Rendimiento en restauración sintética 512x512 (RTX 5060 Ti 16 GB):

| Modelo | Tiempo original | Portable | Kernels | Aceleración vs original | Aceleración vs portable | Memoria pico (MiB, asignada/reservada) |
|---|---|---|---|---|---|---|
| `realplksr-nomoswebphoto-x4` | 267 ms | 182 ms | 130 ms | 2.1x | 1.4x | 244/320 original; 179/216 portable; 179/216 kernels |

Arranque y primera llamada:

| Modelo | Carga original | Carga portable | Carga kernels | Primera llamada original | Primera llamada portable | Primera llamada kernels |
|---|---|---|---|---|---|---|
| `realplksr-nomoswebphoto-x4` | 0.21 s | 0.18 s | 0.56 s | 0.76 s | 0.41 s | 0.25 s |

torch.compile y TensorRT (512x512):

| Modelo | Portable | Compile | TensorRT fp16 | Kernels | Preparación compile | Preparación ONNX+engine | Memoria pico portable | Memoria pico compile | Memoria pico kernels | Memoria pico TensorRT |
|---|---|---|---|---|---|---|---|---|---|---|
| `realplksr-nomoswebphoto-x4` | 182 ms | 154 ms | 247 ms | 130 ms | 15.2 s | 26.2 s | 179/216 MiB | 179/196 MiB | 179/216 MiB | 358/366 MiB |

Paridad con el código original: en CPU float32, diferencia máxima absoluta <= 1.4e-06; en GPU float16, error medio absoluto <= 0.00047 y p99 <= 0.0018.

## Requisitos de hardware

- VRAM estimada: 179 MiB de memoria pico asignada para una imagen de 512x512 en fp16 (216 MiB reservada); el modelo es muy ligero y escala con el tamaño de la imagen y el mosaico.
- GPU recomendadas: cualquier GPU CUDA con al menos 1-2 GB de VRAM libre; probado en RTX 5060 Ti 16 GB (sm_120).
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna con soporte CUDA; el consumo es mínimo.
- Opciones de despliegue: paquete `fastforks` con backends `portable` y `kernels`; también compatible con `torch.compile` y exportación a ONNX/TensorRT (aunque TensorRT resultó más lento: 247 ms frente a 130 ms de kernels).
- Latencia y throughput: 130 ms por imagen 512x512 con backend `kernels` en RTX 5060 Ti; 182 ms con `portable`; 154 ms con `torch.compile`. El coste de compilación es de 15.2 s y el de construcción de ONNX + engine de 26.2 s.

## Comparativa con modelos similares

| Modelo | Tipo | Escala | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RealPLKSR (`4xNomosWebPhoto_RealPLKSR`) | CNN PLKSR | x4 | Cualquier H x W >= 1 | CC-BY-4.0 (pesos), Apache-2.0 (código) | Pesos en GitHub de Phhofm; card en HF |
| Real-ESRGAN | GAN | x4 | Imágenes de tamaño variable | no disponible en la información | no disponible en la información |
| PLKSR original (Lee et al., 2024) | CNN PLKSR | variable | Imágenes de tamaño variable | no disponible en la información | no disponible en la información |

No se dispone en la información proporcionada de datos de rendimiento de Real-ESRGAN ni de PLKSR original para una comparación numérica directa; la model card indica que Real-ESRGAN está entrenado para degradaciones reales y no bicúbicas, por lo que su PSNR en DIV2K no es comparable.

## Limitaciones y advertencias

- El repositorio no contiene pesos: solo la model card; los pesos se descargan de enlaces externos del autor y se verifican por SHA-256.
- Modelo experimental (tier experimental según la card); no se garantiza estabilidad en producción.
- La licencia de los pesos es CC-BY-4.0, lo que permite uso comercial con atribución; el código es Apache-2.0, pero la card advierte de que es un paquete de uso de investigación y que deben revisarse las cadenas de licencia originales antes de cualquier otro uso.
- No se documentan sesgos, pero al ser un modelo de restauración de imágenes puede amplificar artefactos o introducir detalles inexistentes en imágenes muy degradadas.
- El factor de escala es fijo por checkpoint (x4 en este caso); para otras escalas hay que cargar otros checkpoints.
- El rendimiento depende del tamaño de la imagen; para imágenes grandes es necesario usar mosaicos (`tile=`) para controlar la memoria.
- No se documentan idiomas ni capacidades de texto; no aplica.
- La latencia y memoria medidas corresponden a una RTX 5060 Ti; en otras GPUs los valores pueden variar.

## Enlaces

- Hugging Face: https://huggingface.co/fastforks/realplksr
- Código de fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Código original neosr: https://github.com/neosr-project/neosr (commit `31c7022620c6`)
- Pesos del autor: https://github.com/Phhofm/models/releases/download/4xNomosWebPhoto_RealPLKSR/4xNomosWebPhoto_RealPLKSR.safetensors
- Release de pesos: https://github.com/Phhofm/models/releases/tag/4xNomosWebPhoto_RealPLKSR
- Benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Fichero de licencia original: https://github.com/neosr-project/neosr/blob/31c7022620c682cf0961c8634d60787179145c5b/license.txt
