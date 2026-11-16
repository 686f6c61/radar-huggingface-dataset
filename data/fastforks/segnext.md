# fastforks/segnext

## Resumen

SegNeXt es una familia de modelos de segmentación semántica presentada originalmente por Guo et al. en 2022. La implementación aquí descrita corresponde al repositorio `fastforks/segnext`, que distribuye los checkpoints oficiales de mmsegmentation (backbones convolucionales MSCAN en tamaños tiny, small, base y large, con cabeza ligera Hamburger) sobre ADE20K. El paquete no aloja pesos: descarga los ficheros `.pth` originales de OpenMMLab y los valida contra hashes SHA-256, con el código de red vendorizado para eliminar la dependencia de mmseg y mmcv.

El modelo resuelve segmentación semántica densa sobre imágenes RGB: recibe una imagen de cualquier resolución (H×W ≥ 1) y produce logits por píxel para las 150 clases de ADE20K. Su relevancia actual reside en el rendimiento de inferencia: la implementación portable y el backend de kernels propios reducen el tiempo de ejecución hasta 2,9× frente al código original en fp32, con picos de memoria de 147-314 MiB para entradas de 1024×2048 en una RTX 5060 Ti de 16 GB.

La arquitectura MSCAN combina atención convolucional con un decoder ligero, y los cuatro tamaños cubren el espectro de latencia/precisión. La licencia es Apache-2.0 tanto para el código como para los pesos, lo que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MSCAN (atención convolucional) + cabeza Hamburger; red de segmentación semántica |
| Parametros totales | no disponible (cuatro variantes: tiny, small, base, large) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada H×W ≥ 1) |
| Tipos de cuantizacion | fp32 (original), fp16 (portable y kernels); TensorRT fp16 |
| Idiomas soportados | no aplica (visión) |
| Licencia | Apache-2.0 (código y pesos) |
| Formato de pesos | `.pth` (PyTorch), descargados de OpenMMLab; no alojados en el repo |
| Tarea | Segmentación semántica (150 clases ADE20K) |
| Salida | Logits por píxel (`logits=True`) o etiquetas de clase |
| Backends | `portable`, `kernels` |
| Entrada | Una imagen RGB, cualquier H×W ≥ 1 |

## Arquitectura y entrenamiento

SegNeXt emplea un backbone MSCAN (Multi-Scale Convolutional Attention Network) que sustituye la autoatención de los transformers visuales por bloques de atención convolucional multi-escala. El decoder es una cabeza ligera Hamburger basada en descomposición matricial para modelar dependencias globales con coste reducido. La red está vendorizada desde mmsegmentation en el commit `c685fe6767c4`, sin dependencia de mmseg ni mmcv.

Los pesos publicados corresponden a los checkpoints de ADE20K (SceneParsing, 150 clases) entrenados con schedule `1x16`, resolución 512×512, optimizador AdamW y 160k iteraciones. Los backbones se preentrenan en ImageNet-1k (ILSVRC 2012). No se documentan en la información disponible detalles sobre RLHF, DPO ni otras fases de ajuste, algo esperable en un modelo discriminativo de segmentación.

La innovación técnica del paquete `fastforks` es de ingeniería de inferencia: kernels propios que aceleran la ejecución entre 1,8× y 2,9× frente al código original y entre 1,8× y 2,3× frente al backend portable, con reducción de memoria pico de aproximadamente 4-5× respecto al original.

## Capacidades

- Segmentación semántica densa sobre imágenes RGB con 150 clases de ADE20K.
- Salida configurable: logits por píxel o etiquetas de clase.
- Procesamiento de entradas de resolución arbitraria (H×W ≥ 1), con redimensionado o padding interno.
- Cuatro variantes de capacidad/latencia: tiny, small, base y large.
- Ejecución en fp32 y fp16; soporte de TensorRT fp16 y `torch.compile`.
- Validación de integridad de pesos mediante SHA-256.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente visual y discriminativo.

## Casos de uso

- Segmentación de escenas urbanas y entornos estructurados: la variante base o large sobre ADE20K ofrece las 150 clases de escena (edificios, vegetación, mobiliario urbano, personas), adecuada para análisis de imágenes de ciudades o interiores.
- Preprocesado en pipelines de visión por computador: generar máscaras semánticas como entrada a modelos posteriores (detección, depth estimation, edición) gracias a la salida de logits por píxel.
- Procesamiento por lotes de imágenes de alta resolución: con 1024×2048 y solo 147-314 MiB de pico en el backend `kernels`, cabe procesar imágenes grandes en una GPU consumer de 16 GB.
- Aplicaciones de edición y retoque de imagen: las máscaras por clase permiten seleccionar regiones (cielo, suelo, vegetación) para sustitución o filtrado selectivo.
- Prototipado e investigación en segmentación: al no requerir mmseg ni mmcv, el paquete simplifica la integración en entornos Python modernos y la comparación de las cuatro variantes.
- Despliegue en producción con TensorRT: la variante tiny alcanza 16,0 ms por imagen 1024×2048 en fp16 con TensorRT, viable para procesamiento casi en tiempo real en flujos de vídeo o captura continua.
- Automatización de anotación: generar máscaras preliminares para acelerar el etiquetado humano en datasets propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (mIoU) en la información disponible. Los datos disponibles son de latencia y memoria en una RTX 5060 Ti 16 GB (sm_120), entrada 1024×2048:

| Variante | Tiempo original fp32 (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Memoria pico kernels (MiB) |
|---|---|---|---|---|---|
| mscan-t | 21,1 | 15,9 | 8,99 | 2,3× | 147 / 206 |
| mscan-s | 28,6 | 18,5 | 8,04 | 2,9× | 202 / 290 |
| mscan-b | 44,8 | 28,3 | 12,2 | 2,8× | 229 / 332 |
| mscan-l | 69,7 | 43,1 | 20,6 | 2,5× | 314 / 428 |

Con TensorRT fp16, los tiempos son 16,0 ms (tiny), 18,0 ms (small), 23,3 ms (base) y 32,3 ms (large). `torch.compile` resulta más lento que el backend portable en todas las variantes (por ejemplo, 40,7 ms frente a 28,3 ms en base).

## Requisitos de hardware

- VRAM estimada en inferencia: 147-314 MiB de pico asignado con el backend `kernels` a 1024×2048; 332-417 MiB con el backend portable; 1553-1634 MiB con TensorRT (incluye motor y runtime de PyTorch).
- GPU recomendadas: cualquier GPU con soporte CUDA; los benchmarks se realizaron en una RTX 5060 Ti 16 GB (sm_120). Para las variantes large y entradas grandes, se recomienda al menos 8 GB de VRAM por margen.
- Cabe holgadamente en GPU consumer: incluso la variante large ocupa menos de 0,5 GiB con el backend portable en fp16.
- Opciones de despliegue: paquete `fastforks` (backends `portable` y `kernels`), exportación a ONNX y TensorRT, `torch.compile`.
- Latencia: 8,0-20,6 ms por imagen 1024×2048 con el backend `kernels`; 16,0-32,3 ms con TensorRT fp16. Tiempo de carga: 0,13-0,57 s (portable) y 1,26-1,51 s (kernels). Primera llamada: 0,18-0,72 s según backend y variante.
- Preparación de TensorRT: 56,6-82,2 s para construir el motor ONNX.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SegNeXt (fastforks) | Segmentación semántica, MSCAN | no disponible (4 variantes) | H×W ≥ 1 | Apache-2.0 | Hugging Face + OpenMMLab |
| Mask2Former | Segmentación universal (transformer) | no disponible en esta ficha | Resolución fija típica | Apache-2.0 (mmsegmentation) | Hugging Face + OpenMMLab |
| SegFormer | Segmentación semántica (transformer) | no disponible en esta ficha | Resolución variable | Apache-2.0 (mmsegmentation) | Hugging Face + OpenMMLab |
| DeepLabV3+ | Segmentación semántica (CNN) | no disponible en esta ficha | Resolución variable | Apache-2.0 (mmsegmentation) | Hugging Face + OpenMMLab |

No se dispone de datos de precisión (mIoU) en la información proporcionada para establecer una comparación cuantitativa con estas alternativas. La comparación cualitativa se limita a la naturaleza arquitectónica (convolucional con atención frente a transformer) y a la licencia Apache-2.0 común en el ecosistema OpenMMLab.

## Limitaciones y advertencias

- Modelo puramente visual: no genera texto, no soporta tool calling, agentes ni razonamiento multi-paso.
- Entrenado exclusivamente en ADE20K (150 clases de escena); el rendimiento en dominios fuera de distribución (imágenes médicas, satelitales, industriales) no está documentado y probablemente degrade.
- No se publican métricas de precisión (mIoU) en la información disponible, por lo que no es posible evaluar la calidad de segmentación sin ejecutar el modelo.
- Riesgo de confusión entre clases visualmente similares y de errores en regiones ambiguas u ocluidas, inherente a la segmentación semántica.
- El repositorio no aloja pesos: requiere descarga desde OpenMMLab y validación de hash; un fallo de red o un cambio en los enlaces de origen rompe la reproducibilidad.
- La model card advierte que el paquete es de uso de investigación y que deben revisarse las cadenas de licencia del código original antes de otros usos, pese a que tanto código como pesos figuran como Apache-2.0.
- El backend `kernels` requiere compilación y tiene mayor tiempo de carga (1,26-1,51 s) que el portable (0,13-0,57 s); en cargas efímeras puede no compensar.
- Los benchmarks se limitan a una única GPU (RTX 5060 Ti, sm_120); el rendimiento en otras arquitecturas puede diferir.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/segnext
- Repositorio del paquete: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Código original (mmsegmentation, commit c685fe6767c4): https://github.com/open-mmlab/mmsegmentation
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Fichero de definición de variantes: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/segmentation/models/segnext/card.toml
- Pesos mscan-t: https://download.openmmlab.com/mmsegmentation/v0.5/segnext/segnext_mscan-t_1x16_512x512_adamw_160k_ade20k/segnext_mscan-t_1x16_512x512_adamw_160k_ade20k_20230210_140244-05bd8466.pth
- Pesos mscan-s: https://download.openmmlab.com/mmsegmentation/v0.5/segnext/segnext_mscan-s_1x16_512x512_adamw_160k_ade20k/segnext_mscan-s_1x16_512x512_adamw_160k_ade20k_20230214_113014-43013668.pth
- Pesos mscan-b: https://download.openmmlab.com/mmsegmentation/v0.5/segnext/segnext_mscan-b_1x16_512x512_adamw_160k_ade20k/segnext_mscan-b_1x16_512x512_adamw_160k_ade20k_20230209_172053-b6f6c70c.pth
- Pesos mscan-l: https://download.openmmlab.com/mmsegmentation/v0.5/segnext/segnext_mscan-l_1x16_512x512_adamw_160k_ade20k/segnext_mscan-l_1x16_512x512_adamw_160k_ade20k_20230209_172055-19b14b63.pth
