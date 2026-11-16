# fastforks/isnet

## Resumen

IS-Net (Dichotomous Image Segmentation Network) es un modelo de segmentación de imágenes y matting desarrollado originalmente por Qin et al. (ECCV 2022) y redistribuido en este repositorio por el proyecto fastforks. Resuelve el problema de la segmentación dicotómica de imágenes: separar un objeto saliente del fondo con una precisión de píxel, generando una máscara alfa en el rango [0, 1] que puede usarse directamente para eliminación de fondo o composición. La arquitectura es un encoder-decoder de estilo U²-Net con bloques residuales U (RSU) que opera a 1024 x 1024 píxeles mediante un stem con stride, y se entrena con supervisión intermedia en múltiples escalas.

El repositorio `fastforks/isnet` es una model card sin pesos: actúa como manifiesto que descarga los checkpoints originales de los autores y los verifica mediante SHA-256. Ofrece dos variantes: `isnet`, el modelo académico entrenado sobre DIS5K V1.0, y `isnet-general-use`, la versión de propósito general que también emplea rembg. Está pensado para desarrolladores que necesitan un pipeline de matting reproducible con backend portable (`portable`) o con kernels optimizados (`kernels`), ambos verificados contra el código original.

La relevancia actual reside en su licencia Apache-2.0 (uso comercial permitido), su bajo consumo de memoria (unos 512 MiB en fp16 a 1080x1920) y su velocidad: 12,1 ms por imagen de 1080x1920 con el backend `kernels` en una RTX 5060 Ti, frente a los 38,5 ms del código original. Es una opción ligera y verificable para tareas de recorte y segmentación en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder U²-Net con bloques residuales U (RSU) y stem con stride; supervisión intermedia |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de cualquier H x W >= 32, rellenada a múltiplo de 32) |
| Tipos de cuantizacion | fp16 (por defecto en GPU), fp32; soporte de torch.compile y TensorRT fp16 |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | Apache-2.0 (código y pesos; el dataset DIS5K tiene sus propios términos de uso) |
| Formato de pesos | `.pth` (checkpoints PyTorch de los autores, no alojados en el repo) |

## Arquitectura y entrenamiento

IS-Net es una red completamente convolucional con estructura encoder-decoder de tipo U²-Net. Cada etapa se compone de bloques residuales U (RSU) que combinan convoluciones con conexiones residuales y pooling interno, lo que permite capturar contexto multi-escala sin un backbone preentrenado. La entrada se procesa a 1024 x 1024 mediante un stem con stride, y la red aplica supervisión intermedia en varias etapas del decoder para guiar la predicción de la máscara alfa. La salida es un mapa `[H, W]` en [0, 1] a la resolución de entrada.

La variante `isnet` se entrena sobre DIS5K V1.0 (partición DIS-TR), el conjunto académico de segmentación dicotómica. La variante `isnet-general-use` es el modelo de propósito general de los autores, optimizado para uso general, aunque la model card no especifica sus datos de entrenamiento. No se documenta en la información disponible el uso de RLHF, DPO ni el número exacto de tokens o imágenes de entrenamiento. La innovación técnica principal es la supervisión intermedia multi-escala combinada con los bloques RSU, que permiten bordes finos en objetos salientes complejos.

## Capacidades

- Segmentación dicotómica de imágenes: genera una máscara alfa `[H, W]` en [0, 1] donde 1 indica primer plano.
- Matting y eliminación de fondo: la salida alfa puede aplicarse directamente para recortar el objeto saliente.
- Segmentación de objeto saliente (salient object segmentation) en imágenes RGB.
- Entrada de resolución arbitraria: cualquier H x W >= 32, rellenada a múltiplo de 32; probado hasta 3000x4000.
- Dos backends: `portable` (compatible con PyTorch estándar) y `kernels` (kernels optimizados de fastforks).
- Aceleración opcional con torch.compile y TensorRT fp16.
- Verificación de integridad de pesos mediante SHA-256.
- No soporta tool calling, agentes, texto, visión general ni audio: es un modelo exclusivamente de imagen a máscara.

## Casos de uso

- Eliminación de fondo en e-commerce: procesar fotos de producto a resolución completa (hasta 3000x4000) para generar máscaras alfa que se apliquen en el catálogo, con 12,1 ms por imagen a 1080x1920 en el backend `kernels`.
- Recorte automático en herramientas de diseño: integrar el modelo en un editor gráfico para que el usuario seleccione un objeto y obtenga una capa transparente, aprovechando la salida alfa a la resolución original.
- Procesamiento por lotes de imágenes de catálogo: usar el backend `portable` en CPU o GPU con fp16 para lotes grandes, dado el bajo consumo de memoria (512 MiB asignados a 1080x1920).
- Segmentación de objetos salientes en investigación de visión: emplear `isnet` (modelo académico DIS5K) como línea base reproducible con paridad verificada frente al código original (max |diff| <= 0.002 en CPU fp32).
- Pipelines de vídeo con requisitos de latencia: desplegar con TensorRT fp16 para alcanzar 6,70 ms por fotograma a 1080x1920, adecuado para recorte en tiempo real en transmisiones.
- Generación de datasets de matting: usar las máscaras alfa como pseudoetiquetas para entrenar otros modelos de segmentación, con verificación SHA-256 de los pesos para reproducibilidad.
- Automatización de fondos transparentes en fotografía de retrato: aplicar `isnet-general-use`, optimizado para uso general, sobre imágenes de personas para obtener PNG con transparencia.

## Benchmarks y rendimiento

Precisión en DIS5K validation (DIS-VD, cada segunda imagen, 235 imágenes), MAE / max F-beta (beta² = 0.3, 256 umbrales):

| Variante | Original fp32 | portable | kernels |
|---|---|---|---|
| `isnet-general-use` | 0.0157 / 0.9624 | 0.0157 / 0.9624 | 0.0157 / 0.9624 |
| `isnet` | 0.0768 / 0.7820 | 0.0768 / 0.7821 | 0.0768 / 0.7821 |

Velocidad y memoria en matting sintético a 1080x1920 (RTX 5060 Ti 16 GB, sm_120):

| Modelo | Tiempo original (ms) | portable (ms) | kernels (ms) | Aceleración kernels vs original | Memoria pico original (MiB) | portable (MiB) | kernels (MiB) |
|---|---|---|---|---|---|---|---|
| `isnet` | 38,5 | 21,0 | 12,1 | 3,2x | 993 / 1042 | 512 / 562 | 487 / 522 |

Aceleración adicional con torch.compile y TensorRT fp16 (entrada 1080x1920):

| Modelo | portable | compile | TensorRT fp16 | kernels | Compilación (s) | Construcción ONNX + engine (s) |
|---|---|---|---|---|---|---|
| `isnet` | 21,0 ms | 13,1 ms | 6,70 ms | 12,1 ms | 33,8 | 34,4 |
| `isnet-general-use` | 21,0 ms | 13,1 ms | 6,66 ms | 12,1 ms | 33,9 | 32,3 |

Carga y primera llamada:

| Modelo | Carga original (s) | portable (s) | kernels (s) | Primera llamada original (s) | portable (s) | kernels (s) |
|---|---|---|---|---|---|---|
| `isnet` | 1,58 | 0,23 | 1,54 | 0,41 | 0,34 | 0,12 |
| `isnet-general-use` | 1,58 | 0,24 | 1,32 | 0,41 | 0,29 | 0,09 |

Paridad con el código original: CPU float32, max |diff| <= 0,002; GPU float16 (por defecto), portable y kernels, mean |diff| <= 0,02 y p99 <= 0,25 sobre el alfa de salida.

## Requisitos de hardware

- VRAM estimada: 512 MiB asignados (562 reservados) en fp16 a 1080x1920 con el backend `portable`; 487 MiB (522 reservados) con `kernels`; 350 MiB (400 reservados) con torch.compile; 404 MiB (436 reservados) con TensorRT fp16.
- Resolución máxima probada: 3000x4000 con 0,9 GiB de pico asignado y 1,0 GiB reservado en fp16 (RTX 5060 Ti 16 GB).
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; probado en RTX 5060 Ti 16 GB (sm_120). Para TensorRT fp16 se requiere una GPU con soporte TensorRT.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 1-2 GiB de VRAM libre para resoluciones típicas; el modelo es muy ligero.
- Opciones de despliegue: librería `fastforks` (backends `portable` y `kernels`), PyTorch nativo, torch.compile, TensorRT fp16; también es compatible con el ecosistema rembg (la variante `isnet-general-use` es la que usa rembg).
- Latencia y throughput: 12,1 ms por imagen a 1080x1920 con `kernels`; 6,70 ms con TensorRT fp16; 21,0 ms con `portable`. Carga del modelo en 0,23-1,58 s según backend.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Rendimiento DIS-VD (MAE / max F-beta) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IS-Net `isnet-general-use` | no disponible | cualquier H x W >= 32, probado hasta 3000x4000 | 0,0157 / 0,9624 | Apache-2.0 | Pesos en enlaces de los autores, verificados por SHA-256 |
| IS-Net `isnet` (académico) | no disponible | cualquier H x W >= 32, probado hasta 3000x4000 | 0,0768 / 0,7820 | Apache-2.0 | Pesos en enlaces de los autores, verificados por SHA-256 |
| BiRefNet | no disponible en la información proporcionada | no disponible | no disponible (solo se cita su protocolo de evaluación) | no disponible | no disponible |
| rembg (con `isnet-general-use`) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de BiRefNet ni de otros modelos comparables en la información proporcionada; solo se referencia el protocolo de evaluación de BiRefNet (MAE y max F-beta con beta² = 0,3 sobre 256 umbrales).

## Limitaciones y advertencias

- El repositorio no aloja pesos: depende de enlaces de descarga externos (Google Drive) y de la verificación SHA-256; si los enlaces caen, el modelo no es instalable desde este repo.
- La model card indica que es un paquete de investigación ("research-use package") y advierte de revisar las cadenas de licencia del código original antes de cualquier otro uso, pese a la licencia Apache-2.0 declarada.
- El dataset DIS5K tiene sus propios términos de uso (DIS5K-Dataset-Terms-of-Use.pdf) que deben revisarse para uso comercial del modelo entrenado sobre él.
- La variante `isnet` (académica) tiene un rendimiento notablemente inferior en uso general (MAE 0,0768 frente a 0,0157 de `isnet-general-use`); no debe usarse como modelo de producción sin evaluar.
- Riesgo de alucinación no aplica en el sentido textual, pero sí de segmentación errónea en objetos ambiguos, transparentes o con bordes poco definidos; no se documentan sesgos específicos.
- No soporta texto, tool calling, agentes ni multi-step reasoning; es exclusivamente un modelo de imagen a máscara.
- El rendimiento medido corresponde a una RTX 5060 Ti 16 GB con torch 2.14.1+cu130; en otras GPU los tiempos pueden variar.
- La primera llamada con `kernels` es más lenta en carga (1,54 s) que `portable` (0,23 s), aunque la inferencia posterior es más rápida.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/isnet
- Repositorio de código fastforks: https://github.com/kleinicke/fastforks
- Kernels para el backend `kernels`: https://huggingface.co/fastforks/kernels
- Código original de IS-Net (DIS): https://github.com/xuebinqin/DIS (commit `b6764e20381f`)
- Licencia del código original: https://github.com/xuebinqin/DIS/blob/b6764e20381f6f42a70f83fa3324181529ed1403/LICENSE.md
- README del código original: https://github.com/xuebinqin/DIS/blob/b6764e20381f6f42a70f83fa3324181529ed1403/README.md
- Benchmarks de fastforks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Pesos `isnet.pth` (autor): https://drive.usercontent.google.com/download?export=download&confirm=t&id=1klUkUnQFAxPdFu9XE3Vhnn-e72CVz6oM
- Pesos `isnet-general-use.pth` (autor): https://drive.usercontent.google.com/download?export=download&confirm=t&id=1XHIzgTzY5BQHw140EDIgwIb53K659ENH
