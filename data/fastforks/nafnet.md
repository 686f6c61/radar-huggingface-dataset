# fastforks/nafnet

## Resumen

NAFNet (Nonlinear Activation Free Network) es una arquitectura de red neuronal convolucional tipo U-Net para restauración de imágenes presentada por Chen et al. en ECCV 2022, desarrollada originalmente por el equipo de Megvii Research. El repositorio `fastforks/nafnet` no contiene pesos propios: es una model card que documenta la integración de los checkpoints oficiales de los autores dentro del ecosistema `fastforks`, una librería de inferencia que descarga los pesos originales y los verifica mediante SHA-256.

El modelo resuelve dos tareas concretas de restauración de imagen: eliminación de desenfoque de movimiento (variante `nafnet-gopro`, entrenada sobre GoPro) y eliminación de ruido de sensor de smartphone (variante `nafnet-sidd`, entrenada sobre SIDD). Ambas variantes operan con anchura de canales 64 y producen una salida RGB en [0, 1] con un factor de escala `model.scale` respecto a la entrada.

La relevancia actual del repositorio radica en su propuesta de empaquetado reproducible: hashes verificados, benchmarks de latencia y memoria sobre hardware consumer (RTX 5060 Ti 16 GB), paridad numérica comprobada frente al código original y soporte de backends `portable` y `kernels`. Está marcado por el autor como de nivel experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net sin activaciones no lineales (NAFNet), bloques con LayerNorm de canal, convoluciones 1x1 y depthwise 3x3, SimpleGate y atención de canal simplificada, 4 niveles de down/up 2x |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, entrada de cualquier H x W >= 1) |
| Tipos de cuantizacion | fp16 (por defecto en GPU), fp32 (CPU y referencia); no se documentan otras cuantizaciones |
| Idiomas soportados | no aplica (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | MIT (código y pesos de los autores) |
| Formato de pesos | `.pth` (PyTorch); los pesos no se alojan en el repositorio, se descargan desde enlaces de los autores |
| Variantes | `nafnet-gopro@1` (deblurring, SHA-256 `329d3ab4077b`), `nafnet-sidd@1` (denoising, SHA-256 `cd685efaae01`) |
| Backends | `portable`, `kernels` |
| Pipeline | image-to-image |
| Salida | imagen RGB en [0, 1], escala `model.scale` x la entrada |
| Tiling | soportado mediante `tile=` para imágenes grandes |

## Arquitectura y entrenamiento

NAFNet es una U-Net que elimina las funciones de activación no lineales tradicionales (ReLU, GELU) en favor de bloques compuestos por LayerNorm de canal, convoluciones 1x1 y depthwise 3x3, una puerta que multiplica dos mitades de canales (SimpleGate) y atención de canal simplificada. La red tiene cuatro niveles de downsampling y upsampling 2x. La variante `nafnet-gopro` se ejecuta con el test-time local converter, equivalente al `NAFNetLocal` del repositorio original.

El entrenamiento de `nafnet-gopro` utiliza el dataset GoPro de deblurring (GOPRO_Large, Nah et al. 2017), con 3214 pares de fotogramas borroso/nítido, de los cuales 2103 pares se emplean para entrenamiento con recortes de 256 x 256, según la configuración `options/train/GoPro/NAFNet-width64.yml`. La variante `nafnet-sidd` se entrena sobre SIDD para eliminación de ruido de sensor de smartphone. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo de restauración de imagen.

La innovación técnica destacable es la eliminación de activaciones no lineales manteniendo calidad de restauración, lo que reduce coste computacional. El empaquetado de `fastforks` añade verificación de integridad por SHA-256, paridad numérica con el código original (error máximo absoluto <= 0.003 en CPU fp32; error medio <= 0.0015 y p99 <= 0.005 en GPU fp16) y kernels optimizados para el backend `kernels`.

## Capacidades

- Eliminación de desenfoque de movimiento en imágenes (variante `nafnet-gopro`).
- Eliminación de ruido de sensor de smartphone (variante `nafnet-sidd`).
- Restauración de imagen con salida RGB normalizada en [0, 1].
- Procesamiento de imágenes de cualquier tamaño H x W >= 1, con redimensionado o padding interno.
- Ejecución por tiles solapados mediante el parámetro `tile=`, orientada a imágenes grandes.
- Soporte de fp16 en GPU y fp32 en CPU.
- Compatibilidad con `torch.compile` y exportación a ONNX con motor TensorRT fp16.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente de visión.

## Casos de uso

- Restauración de fotografía de acción y deporte: `nafnet-gopro` corrige el desenfoque de movimiento típico de escenas rápidas, con PSNR de 33.73 sobre el conjunto de test de GoPro, adecuado para recuperar tomas deportivas o de fauna.
- Limpieza de fotografía móvil: `nafnet-sidd` elimina el ruido de sensor de cámaras de smartphone con PSNR de 40.21 en validación SIDD, útil en pipelines de post-proceso automático de galerías.
- Preproceso para visión por computador: restaurar imágenes antes de pasarlas a detectores o segmentadores mejora la robustez en condiciones de baja iluminación o movimiento, aprovechando la salida RGB normalizada.
- Procesamiento por lotes de archivos históricos: el soporte de tiling permite restaurar imágenes de alta resolución (probado hasta 1988x2880) sin agotar la VRAM en GPUs consumer.
- Integración en aplicaciones de escritorio o edición: el modelo cabe en una RTX 5060 Ti 16 GB con 451-575 MiB de memoria pico a 512x512, lo que permite ejecución local en tiempo casi interactivo (55-60 ms por imagen).
- Despliegue con aceleración: la exportación a TensorRT fp16 reduce el tiempo a 24.5 ms en `nafnet-sidd` y 52.6 ms en `nafnet-gopro`, adecuado para servicios de restauración en tiempo real.
- Verificación de integridad en producción: los hashes SHA-256 documentados permiten auditar que los pesos desplegados son los oficiales de los autores.

## Benchmarks y rendimiento

### Precisión sobre datasets públicos

| Variante | Dataset | Original fp32 | Portable | Kernels |
|---|---|---|---|---|
| `nafnet-gopro` | GoPro test (cada 4º: 278 frames), deblurring, PSNR / SSIM (RGB) | 33.73 / 0.9468 | 33.73 / 0.9468 | 33.73 / 0.9468 |
| `nafnet-sidd` | SIDD validation (1280 recortes), denoising, PSNR / SSIM (RGB) | 40.21 / 0.9243 | 40.21 / 0.9243 | 40.21 / 0.9243 |

### Latencia y memoria (restauración sintética 512x512, RTX 5060 Ti 16 GB)

| Modelo | Tiempo original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Memoria pico portable (MiB alloc/reserved) |
|---|---|---|---|---|---|
| `nafnet-gopro` | 63.7 | 60.4 | 55.3 | 1.2x | 451 / 532 |
| `nafnet-sidd` | 71.6 | 60.6 | 56.9 | 1.3x | 575 / 670 |

### torch.compile y TensorRT (512x512)

| Modelo | Portable (ms) | torch.compile (ms) | TensorRT fp16 (ms) | Kernels (ms) | Compilación en frío (s) | Build ONNX+engine (s) |
|---|---|---|---|---|---|---|
| `nafnet-gopro` | 60.4 | 35.4 | 52.6 | 55.3 | 38.1 | 66.5 |
| `nafnet-sidd` | 60.6 | 30.9 | 24.5 | 56.9 | 30.3 | 33.8 |

### Carga y primera llamada

| Modelo | Carga original (s) | Carga portable (s) | Carga kernels (s) | Primera llamada original (s) | Primera llamada portable (s) | Primera llamada kernels (s) |
|---|---|---|---|---|---|---|
| `nafnet-gopro` | 1.50 | 0.35 | 0.64 | 0.39 | 0.28 | 0.23 |
| `nafnet-sidd` | 1.16 | 0.79 | 0.70 | 0.29 | 0.37 | 0.24 |

## Requisitos de hardware

- VRAM estimada: 451-575 MiB de memoria pico asignada a 512x512 en fp16; hasta 7.0-7.8 GiB de pico asignado para 1988x2880 (9.6-10.1 GiB reservados).
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y fp16; los benchmarks se realizaron sobre RTX 5060 Ti 16 GB (sm_120).
- Cabe en GPU consumer: sí, con amplio margen; una GPU de 8 GB puede procesar 512x512 sin problemas y recurrir a tiling para resoluciones mayores.
- Opciones de despliegue: librería `fastforks` con backends `portable` y `kernels`; exportación a ONNX con motor TensorRT fp16; compatible con `torch.compile`.
- Latencia: 55-60 ms por imagen 512x512 en portable/kernels; 24.5-35.4 ms con TensorRT o `torch.compile` según variante.
- Throughput: no se documenta de forma explícita; puede derivarse de la latencia por imagen (aproximadamente 17-18 imágenes/s en portable a 512x512).

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NAFNet (fastforks) | U-Net sin activaciones, restauración | no disponible (anchura 64) | cualquier H x W >= 1 | MIT | Hugging Face (card) + pesos en enlaces de autores |
| NAFNet original (Megvii) | U-Net sin activaciones, restauración | no disponible (anchura 64) | cualquier H x W | MIT | GitHub + pesos en Google Drive |
| Otros modelos de restauración (p. ej. Restormer, SwinIR) | Transformers para restauración | no disponible en la información proporcionada | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con Restormer, SwinIR u otras alternativas en la información proporcionada; la comparativa se limita a la relación entre la implementación de `fastforks` y el código original de Megvii, que arroja resultados idénticos en precisión y ligeras mejoras de latencia con los kernels.

## Limitaciones y advertencias

- El repositorio no contiene pesos: es solo una model card; la descarga depende de enlaces externos de Google Drive de los autores, lo que introduce un punto de fallo y posibles cambios de disponibilidad.
- Nivel marcado como experimental por el propio autor; no hay evidencia de uso en producción a gran escala.
- Cada variante está especializada en una degradación concreta (desenfoque de movimiento o ruido de sensor); no se documenta robustez frente a otras degradaciones (compresión JPEG, lluvia, baja resolución).
- Riesgo de artefactos o alucinación visual en regiones con texturas complejas o información irrecuperable, inherente a los modelos de restauración.
- No procesa lenguaje ni texto: no aplica sesgo lingüístico, pero puede heredar sesgos de los datasets GoPro y SIDD (escenas, dispositivos y condiciones de captura limitados).
- La licencia MIT se aplica al código y a los pesos según la evidencia enlazada, pero la model card advierte que se trata de un paquete de uso en investigación y recomienda revisar las licencias antes de otros usos.
- El rendimiento medido corresponde a una única GPU (RTX 5060 Ti, sm_120) y a versiones concretas de torch (2.14.1+cu130) y fastforks (f104019b); los números pueden variar en otro hardware.
- La paridad numérica con el código original tiene tolerancias definidas (max |diff| <= 0.003 en CPU fp32; media <= 0.0015 y p99 <= 0.005 en GPU fp16), no es una igualdad exacta.

## Enlaces

- Hugging Face: https://huggingface.co/fastforks/nafnet
- Repositorio de código fastforks: https://github.com/kleinicke/fastforks
- Kernels para el backend `kernels`: https://huggingface.co/fastforks/kernels
- Código original NAFNet (Megvii Research): https://github.com/megvii-research/NAFNet (commit `2b4af71ebe09`)
- Licencia del código original: https://github.com/megvii-research/NAFNet/blob/2b4af71ebe098a92a75910c233a3965a3e93ede4/LICENSE
- Documentación GoPro: https://github.com/megvii-research/NAFNet/blob/2b4af71ebe098a92a75910c233a3965a3e93ede4/docs/GoPro.md
- Documentación SIDD: https://github.com/megvii-research/NAFNet/blob/2b4af71ebe098a92a75910c233a3965a3e93ede4/docs/SIDD.md
- Benchmarks y protocolo: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Pesos `nafnet-gopro`: https://drive.usercontent.google.com/download?export=download&confirm=t&id=1S0PVRbyTakYY9a82kujgZLbMihfNBLfC
- Pesos `nafnet-sidd`: https://drive.usercontent.google.com/download?export=download&confirm=t&id=14Fht1QQJ2gMlk4N1ERCRuElg8JfjrWWR
- Paper NAFNet (Chen et al., ECCV 2022): no disponible en la información proporcionada.
