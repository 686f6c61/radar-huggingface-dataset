# fastforks/u2net

## Resumen

U²-Net es un modelo de detección de objetos salientes y segmentación binaria de imagen publicado por Qin et al. en *Pattern Recognition* (2020). Emplea una arquitectura de doble estructura en U anidada (two-level nested U-structure) con bloques residuales RSU: seis en el codificador y cinco en el decodificador, que producen un mapa sigmoide fusionado a 320 x 320. Es el removedor de fondo por defecto de la librería `rembg` y una referencia habitual en tareas de matting y eliminación de fondo.

El repositorio `fastforks/u2net` no aloja pesos: es únicamente una model card que documenta tres variantes (u2net, u2net-human-seg y u2netp), los enlaces de descarga a los pesos originales de los autores y sus hashes SHA-256 para verificación. El autor de esta card, fastforks, proporciona además código de integración y kernels optimizados para su backend propio. La licencia de los pesos es Apache-2.0, lo que permite uso comercial.

El interés actual del modelo radica en su bajo coste computacional: con 176 MB de pesos en la variante estándar y unos 15 ms por imagen 1080x1920 en fp16 sobre una RTX 5060 Ti, sigue siendo una opción competitiva para pipelines de eliminación de fondo en producción, aunque su precisión en datasets modernos como DIS5K es notablemente inferior a la de modelos más recientes como BiRefNet.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | U²-Net: doble estructura en U anidada (encoder de 6 bloques RSU, decoder de 5 bloques RSU, fusión sigmoide a 320 x 320) |
| Parámetros totales | 1,1 M (variante `u2netp`); no disponible para `u2net` y `u2net-human-seg` en la información proporcionada |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de cualquier H x W >= 32, padding a múltiplo de 32) |
| Tipos de cuantización | fp16 (portable y kernels); fp32 (original); TensorRT fp16 |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 (pesos y código) |
| Formato de pesos | `.pth` (PyTorch), descargados desde enlaces de Google Drive de los autores; no alojados en el repo |

## Arquitectura y entrenamiento

U²-Net es una red convolucional totalmente (fully convolutional) con una estructura en U de dos niveles. El nivel externo es una U clásica encoder-decoder con conexiones de salto; el nivel interno está formado por bloques residuales RSU (Residual U-blocks) que a su vez contienen pequeñas Us internas con múltiples resoluciones. El modelo genera un mapa de saliencia fusionado mediante sigmoide a 320 x 320 y produce una máscara alfa `[H, W]` en el rango [0, 1] al tamaño de la imagen de entrada.

Las variantes `u2net` y `u2netp` se entrenaron sobre DUTS-TR (10.553 imágenes de detección de objetos salientes); `u2net-human-seg` se entrenó sobre el Supervisely Person Dataset para segmentación de personas. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo de visión de 2020. La innovación técnica principal es la anidación de bloques RSU, que permite capturar contexto multiescala sin aumentar excesivamente el número de parámetros.

## Capacidades

- Detección de objetos salientes (salient object detection) y segmentación binaria dicotómica.
- Eliminación de fondo (background removal) generando una máscara alfa con 1 = primer plano.
- Matting: salida de alpha matte `[H, W]` en [0, 1] al tamaño de la imagen de entrada.
- Segmentación de personas con la variante `u2net-human-seg`.
- Entrada de cualquier resolución H x W >= 32 (con padding a múltiplo de 32); probado hasta 3000x4000.
- Soporte de varios backends: `portable` (PyTorch) y `kernels` (kernels optimizados de fastforks), además de `torch.compile` y TensorRT fp16.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües (es un modelo puramente visual).

## Casos de uso

- Eliminación de fondo en e-commerce: procesar catálogos de productos para generar imágenes con fondo transparente de forma masiva; los ~15 ms por imagen 1080x1920 en fp16 permiten lotes de miles de imágenes en minutos.
- Segmentación de personas en videollamadas o streaming: la variante `u2net-human-seg` genera máscaras de persona adecuadas para sustitución de fondo en tiempo real gracias a su baja latencia.
- Preprocesado en pipelines de visión por computador: generar máscaras de primer plano antes de tareas de detección, clasificación o edición de imagen.
- Edición fotográfica automatizada: crear capas alfa para composición, retoque o recorte inteligente en herramientas de diseño.
- Generación de datasets sintéticos: producir máscaras de segmentación para aumentar datasets de entrenamiento de otros modelos.
- Integración en aplicaciones móviles o de escritorio: la variante `u2netp` (1,1 M parámetros, ~150 MiB de pico en portable) cabe en GPUs consumer modestas y permite despliegue local sin servicios en la nube.
- Procesamiento de imágenes de alta resolución: probado hasta 3000x4000 con ~0,8 GiB de pico en `u2net`, útil para fotografía profesional o imágenes médicas de gran tamaño.

## Benchmarks y rendimiento

Precisión en DIS5K validation (DIS-VD, cada segunda imagen, 235 imágenes), MAE / max F-beta (beta² = 0,3, 256 umbrales):

| Variante | Original fp32 | Portable | Kernels |
|---|---|---|---|
| `u2net` | 0,1484 / 0,5278 | 0,1485 / 0,5270 | 0,1485 / 0,5273 |
| `u2netp` | 0,1533 / 0,5374 | 0,1531 / 0,5391 | 0,1531 / 0,5405 |
| `u2net-human-seg` | 0,1717 / 0,3264 | 0,1717 / 0,3265 | 0,1717 / 0,3266 |

Velocidad y memoria en matting sintético 1080x1920 (RTX 5060 Ti 16 GB, sm_120):

| Modelo | Tiempo original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Pico memoria portable (MiB alloc/reserved) |
|---|---|---|---|---|---|
| `u2net` | 15,9 | 14,9 | 8,83 | 1,8x | 248 / 278 |
| `u2net-human-seg` | 16,0 | 14,6 | 9,05 | 1,8x | 248 / 278 |
| `u2netp` | 14,8 | 14,6 | 9,80 | 1,5x | 150 / 172 |

Con `torch.compile` y TensorRT fp16 (1080x1920): `u2net` baja a 6,24 ms (compile) y 3,07 ms (TensorRT fp16); `u2netp` a 5,44 ms y 1,87 ms respectivamente. El coste de preparación es de ~36 s para compile y ~36 s para ONNX + engine build en `u2net`.

## Requisitos de hardware

- VRAM estimada: ~248 MiB de pico en fp16 con backend portable para `u2net` a 1080x1920; ~150 MiB para `u2netp`; hasta ~0,8 GiB de pico a 3000x4000.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; probado en RTX 5060 Ti 16 GB (sm_120). Funciona en GPUs consumer de gama baja por su reducido tamaño.
- Cabe en GPU consumer: sí, holgadamente; también es viable en CPU para lotes pequeños, aunque no se documentan latencias en CPU.
- Opciones de despliegue: backend `portable` (PyTorch), backend `kernels` (fastforks), `torch.compile`, TensorRT fp16, y exportación a ONNX. La librería `rembg` lo usa por defecto.
- Latencia y throughput: ~15 ms/imagen 1080x1920 en fp16 portable; ~9 ms con kernels; ~3 ms con TensorRT fp16 en `u2net`. Con kernels, el primer call tarda ~0,11 s y la carga del modelo ~1,37 s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Precisión DIS-VD (MAE / max F-beta) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `u2net` (este repo) | no disponible | cualquier H x W >= 32 | 0,1485 / 0,5273 (kernels) | Apache-2.0 | pesos en Drive de autores, card en HF |
| `u2netp` (este repo) | 1,1 M | cualquier H x W >= 32 | 0,1531 / 0,5405 (kernels) | Apache-2.0 | pesos en Drive de autores, card en HF |
| `u2net-human-seg` (este repo) | no disponible | cualquier H x W >= 32 | 0,1717 / 0,3266 (kernels) | Apache-2.0 | pesos en Drive de autores, card en HF |
| BiRefNet | no disponible en la información | no disponible | referencia de evaluación citada, sin cifras | no disponible | no disponible |

No se dispone en la información proporcionada de cifras de benchmarks de modelos alternativos comparables (BiRefNet, MODNet, etc.) para establecer una comparación cuantitativa completa.

## Limitaciones y advertencias

- Precisión limitada en datasets modernos: MAE de 0,1485 en DIS-VD para `u2net`, frente a modelos más recientes de segmentación de alta resolución; puede producir bordes imprecisos en objetos con pelo, transparencias o detalles finos.
- `u2net-human-seg` está especializado en personas y rinde peor en objetos salientes genéricos (MAE 0,1717, max F-beta 0,3266).
- Riesgo de alucinación no aplica en el sentido de texto, pero sí de falsos positivos/negativos en la máscara: objetos con bajo contraste o fondos complejos pueden segmentarse incorrectamente.
- Entrada limitada a imágenes RGB (y trimap en modelos guiados por trimap); no procesa vídeo de forma nativa ni texto.
- Los pesos no se alojan en Hugging Face: se descargan desde Google Drive de los autores, lo que introduce dependencia de enlaces externos y requiere verificación SHA-256.
- La model card indica "research-use package" en las cadenas de licencia del código original; aunque la licencia declarada es Apache-2.0, conviene revisar los ficheros de licencia antes de un uso comercial.
- El backend `kernels` requiere compilación específica y tiene un tiempo de carga mayor (~1,37 s) que el portable (~0,49 s).
- No hay soporte multilingüe ni de texto; no es adecuado para tareas de razonamiento, código o agentes.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/u2net
- Código de fastforks: https://github.com/kleinicke/fastforks
- Kernels para backend `kernels`: https://huggingface.co/fastforks/kernels
- Código original de U²-Net: https://github.com/xuebinqin/U-2-Net (commit `ac7e1c817eca`)
- Licencia original: https://github.com/xuebinqin/U-2-Net/blob/ac7e1c817ecab7c7dff5ce6b1abba61cd213ff29/LICENSE
- README original: https://github.com/xuebinqin/U-2-Net/blob/ac7e1c817ecab7c7dff5ce6b1abba61cd213ff29/README.md
- Benchmarks de fastforks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Pesos `u2net.pth`: https://drive.usercontent.google.com/download?export=download&confirm=t&id=1ao1ovG1Qtx4b7EoskHXmi2E9rp5CHLcZ
- Pesos `u2net_human_seg.pth`: https://drive.usercontent.google.com/download?export=download&confirm=t&id=1m_Kgs91b21gayc2XLW0ou8yugAIadWVP
- Pesos `u2netp.pth`: https://drive.usercontent.google.com/download?export=download&confirm=t&id=1rbSTGKAE-MTxBYHd-51l2hMOQPT_7EPy
