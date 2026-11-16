# fastforks/owlv2

## Resumen

OWLv2 es un modelo de detección de objetos de vocabulario abierto (open-vocabulary object detection) desarrollado por Google Research (Minderer et al., 2023). A diferencia de los detectores clásicos con un conjunto fijo de clases, OWLv2 permite especificar las categorías a detectar en tiempo de inferencia mediante texto libre: el modelo proyecta nombres de clase arbitrarios al espacio de embeddings de CLIP y puntúa cada región de la imagen contra ellos. El repositorio `fastforks/owlv2` no aloja pesos propios, sino que actúa como tarjeta de modelo y capa de verificación de integridad para los checkpoints originales de Google, con hashes SHA-256 y enlaces canónicos.

La implementación de fastforks ofrece dos variantes del modelo original: `owlv2-b16@1`, basado en el backbone CLIP ViT-B/16, y `owlv2-l14@1`, basado en CLIP ViT-L/14. Ambas variantes emplean una arquitectura de detección densa de un paso: una torre de imagen CLIP predice una caja por parche y la puntúa contra los embeddings de texto de las clases. El modelo acepta imágenes de cualquier tamaño H×W ≥ 32 (con padding a múltiplo de 32) y proporciona salidas de cajas, etiquetas, puntuaciones y máscaras de instancia.

El interés actual del repositorio reside en su enfoque de empaquetado: separa pesos de código, verifica criptográficamente los checkpoints descargados y ofrece tres backends de ejecución (`portable`, `kernels` y compilación con TensorRT/`torch.compile`), con ganancias de velocidad medidas de hasta 3,9× frente al código original en una RTX 5060 Ti. Está marcado como "tier: experimental" por el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo ViT (CLIP image tower) con cabezas de detección densas y alineamiento texto-imagen CLIP |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen H×W ≥ 32, padding a múltiplo de 32) |
| Tipos de cuantizacion | fp16 y fp32 documentados en benchmarks; no se listan cuantizaciones GGUF/INT8 |
| Idiomas soportados | no disponible (las consultas de texto se procesan con tokenizador CLIP BPE) |
| Licencia | Apache-2.0 (código y pesos) |
| Formato de pesos | safetensors (más config.json, vocab.json y merges.txt del tokenizador CLIP BPE) |

## Arquitectura y entrenamiento

OWLv2 sigue un esquema de detección de vocabulario abierto basado en CLIP. La torre de imagen (ViT-B/16 o ViT-L/14) procesa la imagen y produce representaciones por parche; sobre ellas, unas cabezas de detección predicen una caja por parche y una puntuación de objetividad. En paralelo, la torre de texto de CLIP codifica los nombres de clase proporcionados en tiempo de inferencia (`text=[...]`), y cada caja se puntúa por similitud contra esos embeddings. La imagen se rellena a un cuadrado y se redimensiona a 960 px (B/16) o 1008 px (L/14).

El entrenamiento descrito en la tarjeta combina self-training sobre pares imagen-texto de WebLI (datos web de Google, no publicados) con pseudo-cajas generadas por un anotador OWL-ViT entrenado previamente en Objects365 y Visual Genome. Posteriormente se realiza una fase de fine-tuning sobre Objects365 (anotaciones de caja) y Visual Genome, y se emplea un ensemble de pesos del modelo self-trained y de su fine-tune. La innovación principal frente a OWL-ViT es precisamente este esquema de self-training a escala web, que amplía la cobertura de vocabulario sin anotaciones manuales de cajas para cada clase.

La implementación de fastforks añade una capa de portabilidad: el módulo `module()` encapsula la torre de imagen y las cabezas con los 80 nombres de clase COCO como consultas constantes, y el backend `kernels` proporciona kernels optimizados para CUDA (sm_120 en los benchmarks publicados).

## Capacidades

- Detección de objetos de vocabulario abierto: acepta nombres de clase en texto libre en tiempo de inferencia, sin reentrenamiento.
- Detección con clases por defecto: si no se pasa `text=[...]`, usa las 80 clases de COCO.
- Salidas estructuradas: cajas delimitadoras, etiquetas de clase, puntuaciones de confianza y máscaras de instancia.
- Procesamiento de imágenes de resolución variable: cualquier H×W ≥ 32, con padding a múltiplo de 32; probado hasta 3000×4000 px.
- Backends de ejecución: `portable` (PyTorch), `kernels` (kernels CUDA optimizados) y compilación con `torch.compile` y TensorRT fp16.
- Verificación de integridad de pesos mediante SHA-256 contra los checkpoints originales de Google.
- No soporta tool calling, agentes, generación de texto ni razonamiento multi-paso: es un modelo puramente perceptivo de visión.

## Casos de uso

- Catalogación automática de inventario visual: el modelo permite definir en texto las categorías relevantes (por ejemplo, "caja de cartón", "palé", "extintor") sin reentrenar, lo que facilita adaptar el sistema a nuevos productos o almacenes cambiando únicamente las consultas de texto.
- Moderación de contenido visual: detección de elementos específicos en imágenes subidas por usuarios mediante consultas de texto configurables, con salida de cajas y puntuaciones para umbralizar decisiones.
- Análisis de imágenes satelitales o aéreas: al aceptar entradas de hasta 3000×4000 px con un pico de memoria de 1,1 GiB (B/16) o 1,7 GiB (L/14) en fp16, puede procesar ortofotos de alta resolución en una GPU consumer.
- Automatización de anotación de datasets: generación de pseudo-etiquetas para nuevas categorías usando consultas de texto, útil como paso previo a un fine-tuning supervisado.
- Robótica y visión embebida: la variante B/16 a 23,8 ms por imagen de 800×1344 en el backend `kernels` permite integración en bucles de percepción con requisitos de latencia moderados.
- Búsqueda visual por descripción textual: localizar objetos descritos en lenguaje natural dentro de un catálogo de imágenes, usando el alineamiento CLIP texto-imagen del modelo.
- Control de calidad industrial: detección de defectos o componentes definidos por texto en líneas de inspección, con despliegue en TensorRT fp16 (18,4 ms para B/16 a 800×1344).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (mAP, COCO, LVIS) en la información disponible. La tarjeta sí incluye mediciones de latencia y memoria en una RTX 5060 Ti 16 GB (sm_120):

| Modelo | Entrada | Original (ms) | Portable (ms) | Kernels (ms) | TensorRT fp16 (ms) | Memoria pico portable (MiB) |
|---|---|---|---|---|---|---|
| owlv2-b16 | 800×1344 | 92,3 | 31,8 | 23,8 | 18,4 | 497 / 570 |
| owlv2-l14 | 800×1344 | 212 | 155 | 110 | 95,9 | 1239 / 1282 |

| Modelo | Carga (s) original / portable / kernels | Primera llamada (s) original / portable / kernels |
|---|---|---|
| owlv2-b16 | 8,22 / 2,81 / 3,00 | 0,74 / 0,32 / 0,27 |
| owlv2-l14 | 9,55 / 3,18 / 3,16 | 1,18 / 0,42 / 0,36 |

Aceleración del backend `kernels` frente al código original: 3,9× (B/16) y 1,9× (L/14); frente a `portable`: 1,3× y 1,4× respectivamente.

## Requisitos de hardware

- VRAM estimada: en fp16, pico asignado de 497 MiB (B/16) y 1239 MiB (L/14) para 800×1344; reservado de 570 MiB y 1282 MiB. Con TensorRT fp16, el pico combinado (engine + torch) es de 655 MiB (B/16) y 1786 MiB (L/14).
- Imágenes grandes: 3000×4000 px probado con 1,1 GiB de pico (B/16) y 1,7 GiB (L/14) en fp16.
- GPU recomendadas: cualquier GPU CUDA con al menos 4 GB de VRAM para B/16 y 6 GB para L/14 en configuraciones típicas; los benchmarks se realizaron en una RTX 5060 Ti 16 GB.
- Cabe en GPU consumer: sí, ambas variantes, incluidas GPUs de gama media con suficiente VRAM.
- Opciones de despliegue: librería `fastforks` (backends `portable` y `kernels`), `torch.compile`, exportación a ONNX y TensorRT fp16; los pesos originales son compatibles con `transformers` (commit `c4c4605f9618`).
- Latencia y throughput: 23,8 ms/imagen (B/16) y 110 ms/imagen (L/14) con `kernels` a 800×1344; 18,4 ms y 95,9 ms con TensorRT fp16.
- Tiempo de preparación: compilación en frío con `torch.compile` de 10,6 s (B/16) y 12,4 s (L/14); construcción de ONNX + engine TensorRT de 25,9 s y 33,8 s respectivamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Vocabulario | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OWLv2 B/16 (este repo) | no disponible | imagen H×W ≥ 32, hasta 3000×4000 probado | abierto (texto libre) | Apache-2.0 | pesos en google/owlv2-base-patch16-ensemble |
| OWLv2 L/14 (este repo) | no disponible | imagen H×W ≥ 32, hasta 3000×4000 probado | abierto (texto libre) | Apache-2.0 | pesos en google/owlv2-large-patch14-ensemble |
| OWL-ViT | no disponible | imagen de resolución fija | abierto (texto libre) | Apache-2.0 | disponible en transformers |
| Detectores cerrados tipo YOLO | variable | resolución fija | cerrado (clases fijas) | variable según versión | amplia |

No se dispone de datos de precisión comparada (mAP) en la información proporcionada para establecer una comparación cuantitativa con OWL-ViT u otros detectores.

## Limitaciones y advertencias

- Estado experimental: la propia tarjeta marca el paquete como "tier: experimental"; no se recomienda para producción sin validación adicional.
- Sin benchmarks de precisión publicados en la información disponible: no hay métricas mAP que respalden el rendimiento en dominios concretos.
- Riesgo de falsos positivos y negativos: la puntuación por similitud CLIP texto-imagen es sensible a la formulación exacta de los nombres de clase; pequeñas variaciones en el texto pueden alterar las detecciones.
- Sesgos de los datos de entrenamiento: WebLI es un corpus web no publicado, con los sesgos geográficos, culturales y de representación habituales en datos raspados de internet.
- Dependencia de los pesos originales de Google: el repositorio no aloja pesos; la disponibilidad futura depende de los repositorios de `google/owlv2-*`.
- Restricciones de licencia: código y pesos Apache-2.0 según la evidencia enlazada, con uso comercial permitido; la tarjeta advierte de que las cadenas de licencia se registran tal cual y deben revisarse antes de otros usos.
- Sin soporte de texto generativo ni razonamiento: no es adecuado para tareas de lenguaje, tool calling o agentes.
- Idiomas: no se documenta el rendimiento multilingüe de las consultas de texto; el tokenizador es CLIP BPE y el comportamiento en castellano no está verificado en la información disponible.
- Memoria dependiente de la resolución: imágenes muy grandes incrementan el consumo (1,1-1,7 GiB de pico a 3000×4000 en fp16), lo que puede ser problemático en GPUs con poca VRAM.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fastforks/owlv2
- Pesos originales B/16: https://huggingface.co/google/owlv2-base-patch16-ensemble
- Pesos originales L/14: https://huggingface.co/google/owlv2-large-patch14-ensemble
- Código de fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend `kernels`: https://huggingface.co/fastforks/kernels
- Configuración de variantes (card.toml): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/detection/models/owlv2/card.toml
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Código original en transformers (commit c4c4605f9618): https://github.com/huggingface/transformers
- Paper OWLv2 (arXiv:2306.09683): https://arxiv.org/abs/2306.09683
