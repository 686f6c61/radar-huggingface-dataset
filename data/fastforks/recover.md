# fastforks/recover

## Resumen

ReCoVEr es un modelo de estimación de flujo óptico (optical flow) desarrollado por los autores Kiefhaber, Roth y Schaub-Meyer y publicado en ICCV 2025. La innovación principal es que elimina por completo el coste volumétrico (cost volume) y la pirámide de correlación durante la inferencia: el flujo se regresa directamente desde un codificador de contexto que procesa ambos fotogramas concatenados (6 canales, stride 8), y el bloque de actualización de SEA-RAFT lo refina en 4 iteraciones con upsampling convexo. Esto reduce drásticamente el uso de memoria frente a arquitecturas comparables.

El repositorio `fastforks/recover` es una model card sin pesos: actúa como puente de distribución que descarga los pesos originales de los autores desde GitHub Releases y los verifica mediante SHA-256. Ofrece tres variantes según el codificador de contexto: `recover-cx` (etapas ConvNeXt-T, la más precisa), `recover-rn` (etapas ResNet34) y `recover-mn` (MobileNetV3-Large, la más rápida, capaz de procesar Full HD a 20 FPS en 500 MB).

Es relevante para desarrolladores que necesitan estimación de movimiento denso en pipelines de vídeo con restricciones de memoria y latencia, ya que la variante CX alcanza precisión estado del arte a 1,2x la velocidad y 1/6 de la memoria de modelos comparables, según el paper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (codificador de contexto + bloque de actualización SEA-RAFT), sin cost volume ni pirámide de correlación |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen: cualquier H x W >= 64, padding a múltiplo de 8) |
| Tipos de cuantizacion | fp32 y fp16 (soportado en inferencia); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (tarea de visión, independiente del idioma) |
| Licencia | BSD-3-Clause (código y pesos; uso comercial permitido) |
| Formato de pesos | `.pth` (PyTorch); exportación a ONNX y TensorRT documentada |

## Arquitectura y entrenamiento

ReCoVEr abandona el diseño clásico de RAFT basado en cost volume y correlación de features. En su lugar, un codificador de contexto procesa los dos fotogramas RGB concatenados (6 canales de entrada, stride 8) y regresa un flujo inicial directamente. Ese flujo se refina con el bloque de actualización de SEA-RAFT durante 4 iteraciones, seguido de un upsampling convexo para recuperar la resolución completa. Al eliminar la entrada de correlación, no se ejecuta ni codificador de features ni pirámide de correlación en inferencia, lo que explica la reducción de memoria (1/6 frente a modelos comparables según el paper).

El entrenamiento sigue las etapas del repositorio original `visinf/ReCoVEr`: primero TartanAir y FlyingChairs, después Freiburg SceneFlow (FlyingThings3D, Driving, Monkaa), y finalmente una mezcla de FlyingThings3D, Sintel, KITTI 2015 y HD1K (protocolo TSKH). No se documenta en la información disponible el uso de RLHF ni DPO (no aplica a esta tarea). Las tres variantes comparten el mismo esquema de entrenamiento pero difieren en el codificador de contexto (ConvNeXt-T, ResNet34, MobileNetV3-Large).

## Capacidades

- Estimación de flujo óptico denso: dado un par de fotogramas RGB consecutivos, produce el movimiento por píxel (dx, dy) del primero al segundo.
- Tres variantes con distinto compromiso precisión/velocidad: `recover-cx` (máxima precisión), `recover-rn` (equilibrada), `recover-mn` (máxima velocidad).
- Entrada de resolución arbitraria: cualquier H x W >= 64, con padding automático a múltiplo de 8; probado hasta 1080x1920.
- Soporte de precisión fp16 y fp32.
- Backends `portable` (PyTorch) y `kernels` (kernels CUDA optimizados).
- Exportación a ONNX y TensorRT fp16 (con reducciones de latencia documentadas).
- Compatibilidad con `torch.compile`.
- No soporta tool calling, agentes ni generación de texto: es un modelo puramente de visión por computador.

## Casos de uso

- Estimación de movimiento en vídeo de vigilancia: procesar pares de fotogramas consecutivos para detectar movimiento por píxel; la variante `recover-mn` permite Full HD a 20 FPS en 500 MB, adecuada para despliegue en edge.
- Estabilización de vídeo y postproducción: el flujo denso entre fotogramas alimenta algoritmos de warp y compensación de movimiento; `recover-cx` ofrece la mayor precisión para renderizado offline.
- Interpolación de fotogramas (frame interpolation): el flujo dx/dy entre dos fotogramas es la entrada directa de modelos de interpolación; la latencia de 47,5 ms con TensorRT fp16 a 1080x1920 lo hace viable en tiempo casi real.
- Odometría visual y robótica: estimación de movimiento entre frames de cámara para SLAM ligero; el bajo consumo de memoria (733 MiB pico en CX a 1080x1920) permite ejecutarlo junto a otros módulos en una sola GPU.
- Análisis de movimiento en deporte y biomecánica: seguimiento denso de articulaciones y objetos en secuencias de alta resolución, con la variante CX para máxima exactitud en EPE.
- Preprocesado para modelos de vídeo generativo: extracción de flujo óptico como condicionamiento en pipelines de difusión de vídeo, con exportación a TensorRT para reducir coste por frame.
- Automoción y ADAS: estimación de flujo en secuencias de cámara para detección de movimiento relativo; la licencia BSD-3-Clause permite uso comercial sin restricciones de copyleft.

## Benchmarks y rendimiento

Precisión en KITTI 2015 train (frames 10->11, tamaño completo, contra ground truth flow_occ; EPE = media del error de punto final, Fl-all = porcentaje de píxeles válidos con error > 3 px y > 5 % de la magnitud GT):

| Variante | Original fp32 (EPE / Fl-all %) | Original fp16 (EPE / Fl-all %) | Portable | Kernels |
|---|---|---|---|---|
| `recover-cx` | 1.044 / 2.86 | 1.045 / 2.86 (dato parcial) | no disponible | no disponible |

El resto de filas de la tabla de precisión no están completas en la información proporcionada.

Rendimiento y memoria (RTX 5060 Ti 16 GB, sm_120, entrada 1080x1920):

| Variante | Original (ms) | Portable (ms) | Kernels (ms) | TensorRT fp16 (ms) | Pico portable (MiB alloc/reserved) | Pico kernels (MiB) |
|---|---|---|---|---|---|---|
| `recover-cx` | 179 | 107 | 89,8 | 47,5 | 733 / 892 | 733 / 892 |
| `recover-mn` | 103 | 45,5 | 41,8 | 21,2 | 580 / 676 | 580 / 676 |
| `recover-rn` | 130 | 64,1 | 51,3 | 28,9 | 590 / 672 | 590 / 672 |

Aceleración de kernels frente a original: 2,0x (CX), 2,5x (MN), 2,5x (RN). Frente a portable: 1,1x-1,2x. Tiempo de compilación con `torch.compile`: 9,34-14,4 s; construcción de ONNX + engine TensorRT: 34,1-56,9 s.

## Requisitos de hardware

- VRAM estimada: 733 MiB pico asignados (892 reservados) para `recover-cx` a 1080x1920 en fp16; 580 MiB (676 reservados) para `recover-mn`; 590 MiB (672 reservados) para `recover-rn`.
- GPU recomendadas: cualquier GPU CUDA con al menos 1-2 GB libres; probado en RTX 5060 Ti 16 GB (sm_120). Funciona en GPUs consumer de gama media y baja.
- Cabe holgadamente en cualquier GPU consumer moderna (RTX 3060, 4060, 4090, etc.) e incluso en GPUs de portátil con 4 GB.
- Opciones de despliegue: PyTorch nativo (backend `portable`), kernels CUDA propios (backend `kernels`), `torch.compile`, ONNX Runtime y TensorRT fp16.
- Latencia: 47,5 ms (CX, TensorRT fp16, 1080x1920), 21,2 ms (MN, TensorRT fp16), 28,9 ms (RN, TensorRT fp16). Throughput aproximado: 21 FPS (CX), 47 FPS (MN), 35 FPS (RN) a Full HD con TensorRT.
- Tiempo de carga: 0,18-0,60 s según backend y variante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Precisión (KITTI 2015 EPE) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ReCoVEr (CX) | no disponible | imagen arbitraria >= 64 | 1.044 | BSD-3-Clause | Pesos en GitHub Releases, card en HF |
| SEA-RAFT | no disponible | imagen arbitraria | no disponible en esta ficha | no disponible | Repo público |
| RAFT | no disponible | imagen arbitraria | no disponible en esta ficha | BSD-3-Clause | Repo público |

La información proporcionada no incluye datos numéricos de precisión de SEA-RAFT ni RAFT para una comparación cuantitativa directa; el paper de ReCoVEr afirma estado del arte a 1,2x velocidad y 1/6 de memoria frente a modelos comparables, pero los valores concretos de esos comparables no se detallan en la información disponible.

## Limitaciones y advertencias

- El repositorio `fastforks/recover` no aloja pesos: la descarga depende de los enlaces de GitHub Releases del autor original, lo que introduce un punto de fallo externo.
- La verificación de integridad se realiza por SHA-256 con hashes truncados a 12 dígitos en la model card; los hashes completos están en `card.toml`, pero el truncamiento reduce la robustez de la comprobación si se consulta solo la card.
- Licencia BSD-3-Clause permite uso comercial, pero la model card advierte que el paquete es de "research-use" y recomienda revisar las cadenas de licencia originales antes de cualquier otro uso.
- Entrada mínima de 64x64 y padding obligatorio a múltiplo de 8: resoluciones no alineadas requieren preprocesado.
- No se documentan sesgos específicos, pero al ser un modelo entrenado en datasets de conducción y sintéticos (KITTI, Sintel, FlyingThings3D), el rendimiento puede degradarse en dominios visuales muy distintos (interiores, microscopía, escenas no automovilísticas).
- Riesgo de error en regiones oclusas, superficies sin textura y movimientos grandes: inherente a la estimación de flujo denso; el EPE de 1.044 en KITTI indica error medio de aproximadamente 1 píxel.
- No hay información sobre soporte multi-GPU, batch paralelo ni despliegue en CPU.
- La fecha de creación del repositorio (2026-11-15) y la ausencia de descargas/likes indican un proyecto reciente y sin validación comunitaria amplia.

## Enlaces

- Hugging Face: https://huggingface.co/fastforks/recover
- Código fastforks: https://github.com/kleinicke/fastforks
- Kernels backend: https://huggingface.co/fastforks/kernels
- Código original ReCoVEr: https://github.com/visinf/ReCoVEr (commit `503a27e38bad`)
- Pesos originales: https://github.com/visinf/ReCoVEr/releases/download/0.1/ckpt.tar.gz
- Licencia original: https://github.com/visinf/ReCoVEr/blob/503a27e38bad1080bd29da91df74c5523e11f8d8/LICENSE
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Configuración de modelos (card.toml): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/flow/models/recover/card.toml
