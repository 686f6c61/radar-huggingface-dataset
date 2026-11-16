# fastforks/vitmatte

## Resumen

ViTMatte es un modelo de *matting* de imagen natural (extracción de canal alfa) desarrollado originalmente por el grupo HUST (Yao et al., Information Fusion 2024). Resuelve el problema de separar el primer plano del fondo con precisión de píxel, incluyendo zonas semitransparentes como pelo, cristal o humo, algo que la segmentación binaria convencional no puede resolver. La entrada es una imagen RGB junto con un *trimap* (máscara de tres valores: 0 fondo, 128 desconocido, 255 primer plano) y la salida es una matte alfa en [0, 1] a la resolución de entrada.

La arquitectura es un ViT plano con atención ventaneada y posiciones relativas (ViTDet), complementado por cuatro bloques globales con residuales convolucionales y un decodificador convolucional ligero que fusiona características ViT con un flujo convolucional a resolución completa. El repositorio `fastforks/vitmatte` no aloja pesos: es una *model card* que documenta la integración de los pesos originales de HUST en la librería `fastforks`, con verificación SHA-256 y dos backends de inferencia (`portable` y `kernels`).

Este *fork* resulta relevante para desarrolladores que necesitan un pipeline de *background removal* de calidad profesional con licencia Apache-2.0 sobre los pesos, y con métricas de latencia y memoria publicadas en hardware consumer (RTX 5060 Ti 16 GB), incluyendo comparativas frente al código original, `torch.compile` y TensorRT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ViT plano (ViTDet: atención ventaneada con posiciones relativas + 4 bloques globales con residuales convolucionales) + decodificador convolucional de detalle |
| Parámetros totales | no disponible (variantes `base` y `small`; cifra exacta no publicada) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada H x W >= 32, múltiplo de 32) |
| Tipos de cuantización | fp16 (fp32 en operaciones donde fp16 no es finito o no soportado); TensorRT fp16; no se documentan GGUF/INT8 |
| Idiomas soportados | no aplica (modelo de imagen, sin componente lingüístico) |
| Licencia | Apache-2.0 (pesos y código) |
| Formato de pesos | `.bin` (PyTorch) para `vitmatte-b`; `.safetensors` para `vitmatte-s` |

## Arquitectura y entrenamiento

ViTMatte emplea un ViT plano como *backbone* siguiendo el diseño ViTDet: atención ventaneada con sesgos posicionales relativos en la mayoría de bloques, más cuatro bloques globales que incorporan residuales convolucionales para recuperar contexto de imagen completa. La imagen RGB y el *trimap* se concatenan como entrada de 4 canales a un único ViT. Un decodificador convolucional ligero fusiona las características del ViT con un flujo convolucional a resolución completa para producir el alfa final. El modelo requiere *trimap* (0 fondo, 128 desconocido, 255 primer plano) y está pensado para *matting* guiado, no para segmentación automática sin guía.

El entrenamiento se realizó sobre Composition-1k (Adobe Deep Image Matting), según indican las *cards* originales de HUST. No se detalla en la información proporcionada el número de tokens/píxeles de entrenamiento, la composición exacta del dataset más allá de Composition-1k, ni si hubo etapas de RLHF/DPO (no aplicables en un modelo de visión). La innovación técnica destacable es la combinación de ViTDet con un decodificador de captura de detalle a resolución completa para preservar bordes finos.

## Capacidades

- *Matting* de imagen natural guiado por *trimap*: produce un canal alfa `[H, W]` en [0, 1] a la resolución de entrada.
- *Background removal* y segmentación dicotómica / de objeto saliente a partir del alfa generado.
- Manejo de estructuras finas y semitransparentes (pelo, cristal, humo) gracias al decodificador de detalle a resolución completa.
- Entrada de tamaño arbitrario H x W >= 32, con *padding* a múltiplo de 32; probado hasta 3000x4000.
- Dos backends de inferencia: `portable` y `kernels` (kernels optimizados publicados en `fastforks/kernels`).
- Compatibilidad con `torch.compile` y exportación a ONNX + TensorRT fp16.
- Verificación de integridad de pesos mediante SHA-256.
- No soporta *tool calling*, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).

## Casos de uso

- *Background removal* en producción para e-commerce: dado un *trimap* generado automáticamente (por ejemplo, erosionando un alfa previo o mediante un segmentador), ViTMatte produce un alfa de alta calidad para recortar productos con bordes finos (pelo, tejidos, transparencias) a resoluciones de hasta 3000x4000.
- Postproducción de vídeo e imagen: generación de mattes por fotograma con latencia de 84-148 ms a 1080x1920 en RTX 5060 Ti, adecuada para pipelines semiautomáticos donde un artista revisa y refina el *trimap*.
- Composición y VFX: extracción de alfa para integrar sujetos en nuevos fondos, aprovechando la preservación de detalles en zonas desconocidas del *trimap*.
- Segmentación de objeto saliente: usando un *trimap* generado a partir de un alfa aproximado, el modelo refina la máscara y produce un alfa continuo útil para recorte preciso.
- Automatización de *datasets* de visión: generación de mattes de referencia para entrenar o evaluar otros modelos de segmentación/matting, con verificación SHA-256 de pesos para reproducibilidad.
- Despliegue en *edge* o workstation con GPU consumer: con 1,3-1,5 GiB de memoria pico en el backend `kernels` a 1080x1920, cabe en GPUs de 8-16 GB; con TensorRT fp16 baja a 54,6 ms (small) y 108 ms (base).
- Integración en pipelines CI/CD de procesamiento de imagen: exportación a ONNX + TensorRT con tiempos de build de 48,8-51,3 s permite empaquetar el modelo en contenedores para procesamiento por lotes.

## Benchmarks y rendimiento

Datos de velocidad y memoria publicados en la *model card* (RTX 5060 Ti 16 GB, sm_120), *matting* sintético a 1080x1920:

| Modelo | Tiempo original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Memoria pico portable (MiB alloc/reserved) | Memoria pico kernels (MiB alloc/reserved) |
|---|---|---|---|---|---|---|
| `vitmatte-b` | 257 | 182 | 148 | 1,7x | 1548 / 1692 | 1452 / 1552 |
| `vitmatte-s` | 140 | 102 | 84,1 | 1,7x | 1401 / 1524 | 1305 / 1404 |

*Torch.compile* y TensorRT (1080x1920):

| Modelo | Portable (ms) | Compile (ms) | TensorRT fp16 (ms) | Kernels (ms) | Build ONNX+engine (s) |
|---|---|---|---|---|---|
| `vitmatte-b` | 182 | 157 | 108 | 148 | 48,8 |
| `vitmatte-s` | 102 | 81,9 | 54,6 | 84,1 | 51,3 |

Precisión en AIM-500 (SAD / MSE x 1000 en región desconocida, *trimaps* generados):

| Variante | Dataset | Original fp32 | Original fp16 | Portable | Kernels |
|---|---|---|---|---|---|
| `vitmatte-s` | AIM-500, cada 5ª imagen (100) | 13,86 / 11,727 | 13,85 / 11,727 | 13,85 / 11,726 | 13,85 / 11,723 |
| `vitmatte-b` | AIM-500, 500 imágenes | no disponible | no disponible | no disponible | no disponible (dato truncado en la información) |

No se han publicado en la información disponible resultados de benchmarks estándar tipo MMLU, HumanEval o GSM8K (no aplicables a un modelo de *matting*).

## Requisitos de hardware

- VRAM estimada: 1,3-1,5 GiB pico (backend `kernels`) y 1,4-1,7 GiB (portable) a 1080x1920; hasta ~8 GiB pico asignados a 3000x4000 (fp16).
- GPUs recomendadas: RTX 5060 Ti 16 GB (hardware de referencia de los benchmarks); cualquier GPU consumer con >= 8 GB para resoluciones altas; A100/H100 no son necesarias para este modelo.
- Cabe en GPU consumer: sí, en GPUs de 8-16 GB para resoluciones típicas; para 3000x4000 se recomienda >= 16 GB.
- Opciones de despliegue: librería `fastforks` (backends `portable` y `kernels`), `torch.compile`, exportación ONNX + TensorRT fp16; el código original de HUST también está disponible.
- Latencia y throughput: 84,1-148 ms por imagen a 1080x1920 según variante y backend; 54,6-108 ms con TensorRT fp16; primera llamada 0,20-0,41 s (portable/kernels).

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto/entrada | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| `fastforks/vitmatte` (este) | Matting guiado por trimap | base y small (cifra no disponible) | H x W >= 32, múltiplo de 32; probado 3000x4000 | Apache-2.0 (pesos) | HF (card) + pesos en HUST | Backends portable/kernels, SHA-256 |
| `hustvl/vitmatte-base-composition-1k` | Matting guiado por trimap | base | igual | Apache-2.0 | HF | Pesos originales, código de referencia |
| `hustvl/vitmatte-small-composition-1k` | Matting guiado por trimap | small | igual | Apache-2.0 | HF | Pesos originales, código de referencia |
| Segmentadores binarios (p. ej. SAM) | Segmentación | no disponible | no disponible | no disponible | no disponible | No producen alfa continuo; no comparables directamente en matting |

No se dispone en la información proporcionada de comparativas con otros modelos de *matting* (p. ej. IndexNet, GCA, FBA) en términos de parámetros o benchmarks.

## Limitaciones y advertencias

- Requiere un *trimap* de entrada; no realiza *matting* automático sin guía. La calidad depende críticamente de la calidad del *trimap*.
- Riesgo de artefactos en regiones desconocidas mal delimitadas; el alfa puede fallar en estructuras muy finas si el *trimap* no las cubre.
- Entrenado sobre Composition-1k (Adobe Deep Image Matting), cuyo dataset se distribuye para investigación no comercial bajo solicitud; solo la licencia de los pesos (Apache-2.0) cuenta para el uso comercial según la *card*, pero conviene revisar las cadenas de licencia del código original antes de otros usos.
- La *card* advierte que el paquete es de uso de investigación y que las cadenas de licencia del código original deben comprobarse.
- Sin capacidades lingüísticas, de razonamiento, *tool calling* ni agentes; no aplica a tareas de texto.
- El repositorio no aloja pesos: depende de enlaces externos a HUST y de la verificación SHA-256; si esos enlaces cambian, la reproducibilidad puede verse afectada.
- Los benchmarks de precisión para `vitmatte-b` en AIM-500 aparecen truncados en la información disponible; no deben citarse cifras no publicadas.
- El rendimiento medido corresponde a una única GPU (RTX 5060 Ti, sm_120); en otras arquitecturas los tiempos pueden diferir.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/vitmatte
- Pesos originales `vitmatte-base-composition-1k`: https://huggingface.co/hustvl/vitmatte-base-composition-1k
- Pesos originales `vitmatte-small-composition-1k`: https://huggingface.co/hustvl/vitmatte-small-composition-1k
- Código de la librería `fastforks`: https://github.com/kleinicke/fastforks
- Kernels del backend `kernels`: https://huggingface.co/fastforks/kernels
- Código original de ViTMatte (HUST): https://github.com/hustvl/ViTMatte
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- `card.toml` con hashes SHA-256 completos: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/matting/models/vitmatte/card.toml
