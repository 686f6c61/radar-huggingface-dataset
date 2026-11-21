# software-mansion/react-native-executorch-fast-sam

## Resumen

FastSAM es un modelo de segmentacion de imagenes de proposito general desarrollado originalmente por Ultralytics, que reformula la tarea de segmentacion "segment anything" como una segmentacion de instancias guiada por la salida de un detector YOLO. Este repositorio, publicado por Software Mansion, no contiene los pesos originales en PyTorch, sino los programas ExecuTorch (`.pte`) derivados de FastSAM y optimizados para ejecucion en dispositivo dentro de la libreria React Native ExecuTorch.

El paquete ofrece dos variantes de tamano (s y x) y tres backends (CoreML, Vulkan y XNNPACK), con precisiones fp16, fp32 e int8 estatica. El objetivo es permitir segmentacion de imagenes en moviles y dispositivos de borde sin depender de un servidor, integrándose en aplicaciones React Native. El repositorio ocupa 2,8 GB en total, aunque cada artefacto individual es mucho mas pequeno (desde 18,5 MB para la variante s int8 hasta 276 MB para la x fp32).

La relevancia actual reside en la combinacion de un modelo de segmentacion razonablemente capaz con un runtime de inferencia en dispositivo (ExecuTorch v1.4.1) y una capa de integracion para React Native. No se dispone de informacion sobre arquitectura interna, numero de parametros ni datos de entrenamiento en la documentacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo upstream: FastSAM, basado en YOLO según Ultralytics; no detallado en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | fp16 (CoreML, Vulkan), fp32 (XNNPACK), int8 estatica PT2E per-channel (XNNPACK) |
| Idiomas soportados | no disponible (no aplica a un modelo de segmentacion) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ExecuTorch `.pte` (programas compilados para runtime ExecuTorch v1.4.1) |

Variantes publicadas:

| Ruta | Backend | Precision | Tamano |
|---|---|---|---|
| `s/coreml/fast_sam_s_coreml_fp16.pte` | CoreML | fp16 | 23,1 MB |
| `s/vulkan/fast_sam_s_vulkan_fp16.pte` | Vulkan | fp16 | 22,6 MB |
| `s/xnnpack/fast_sam_s_xnnpack_fp32.pte` | XNNPACK | fp32 | 45,2 MB |
| `s/xnnpack/fast_sam_s_xnnpack_int8.pte` | XNNPACK | int8 | 18,5 MB |
| `x/coreml/fast_sam_x_coreml_fp16.pte` | CoreML | fp16 | 139 MB |
| `x/vulkan/fast_sam_x_vulkan_fp16.pte` | Vulkan | fp16 | 138 MB |
| `x/xnnpack/fast_sam_x_xnnpack_fp32.pte` | XNNPACK | fp32 | 276 MB |
| `x/xnnpack/fast_sam_x_xnnpack_int8.pte` | XNNPACK | int8 | 99,6 MB |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna ni el proceso de entrenamiento del modelo original. Segun la referencia al upstream de Ultralytics, FastSAM aborda la segmentacion de imagenes mediante un enfoque basado en YOLO con una rama de segmentacion, en lugar del enfoque promptable de SAM. No se dispone de informacion sobre numero de tokens de entrenamiento, composicion del dataset, ni uso de RLHF/DPO (no aplica a un modelo de vision).

La innovacion tecnica relevante en este repositorio es la exportacion a ExecuTorch con cuantizacion estatica int8 (PT2E, per-channel en pesos). En esa variante se mantienen en fp32 la primera convolucion y la cabeza de segmentacion, excepto la rama de prototipos de mascara. Tambien se documenta que los backends MLX (`s/mlx` y `x/mlx`) fueron exportados pero no publicados, con notas en `NOTES.md` explicando el motivo (no incluido en la informacion disponible).

## Capacidades

- Segmentacion de imagenes de proposito general (clase-agnostica) con salida de cajas y mascaras, segun los resultados COCO AR@100 reportados.
- Segmentacion de instancias con NMS de cajas a IoU 0.9, tal como se usa en la libreria.
- Ejecucion en dispositivo en moviles y plataformas de borde mediante ExecuTorch.
- Integracion con React Native a traves de la libreria `react-native-executorch`, que expone constantes de modelo en su registro.
- Aceleracion por backend: CoreML (Apple), Vulkan (GPU multiplataforma) y XNNPACK (CPU).
- No se documentan capacidades de texto, tool calling, agentes, vision-lenguaje, audio ni modo thinking.

## Casos de uso

- Segmentacion en aplicaciones moviles React Native: usar la constante del registro de modelos con el pipeline de segmentacion de la libreria para obtener mascaras en el dispositivo, sin subir imagenes a un servidor. La variante `s/xnnpack/int8` (18,5 MB) es la mas adecuada para reducir peso de descarga.
- Edicion fotografica en el dispositivo: separar sujetos u objetos para recortes, reemplazo de fondo o filtros locales, aprovechando la salida de mascaras por instancia y evitando latencia de red.
- Anotacion asistida de datasets: pre-segmentar imagenes en el dispositivo o en estaciones de trabajo para generar mascaras iniciales que un humano revise, reduciendo el coste de etiquetado manual.
- Vision por computador en robots o dispositivos de borde: la variante `x` con backend Vulkan o CoreML permite segmentacion de mayor calidad (mask AR@100 de 40,93 en fp32) en hardware con GPU compatible.
- Procesamiento por lotes en navegador o escritorio: los artefactos XNNPACK fp32/int8 pueden cargarse en runtimes ExecuTorch propios fuera de React Native, segun la nota de compatibilidad, para pipelines de segmentacion offline.
- Funciones de realidad aumentada: segmentar personas u objetos en tiempo real para aplicar efectos o superposiciones, eligiendo backend segun la plataforma (CoreML en iOS, Vulkan en Android con soporte GPU).
- Moderacion o analisis de contenido visual: detectar y aislar regiones de interes en imagenes subidas por usuarios antes de un analisis posterior, manteniendo los datos en el dispositivo.

## Benchmarks y rendimiento

Resultados reportados en la model card: COCO clase-agnostica AR@100 sobre las primeras 500 imagenes de val2017, con todas las categorias fusionadas y NMS de cajas a IoU 0.9.

| Variante | Box AR@100 | Mask AR@100 |
|---|---|---|
| s fp32 | 41,65 | 36,25 |
| s int8 | 41,81 | 36,13 |
| x fp32 | 46,07 | 40,93 |
| x int8 | 46,09 | 41,04 |

La cuantizacion int8 no degrada de forma apreciable la calidad en estas metricas; en cajas incluso mejora ligeramente (41,81 frente a 41,65 en s; 46,09 frente a 46,07 en x). No se han publicado datos de latencia ni throughput en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: no disponible de forma explicita. Como referencia de peso en disco, la variante s int8 ocupa 18,5 MB y la x fp32 276 MB; el consumo en memoria en ejecucion sera superior al tamano del fichero, pero no se documenta.
- GPU recomendadas: no disponibles. Los backends CoreML (Apple) y Vulkan (GPU multiplataforma) implican aceleracion por GPU; XNNPACK esta orientado a CPU.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Despliegue: runtime ExecuTorch v1.4.1; integracion mediante `react-native-executorch`; carga directa en runtimes ExecuTorch propios siguiendo la nota de compatibilidad del repositorio de PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| fast-sam (este repo) | no disponible | no aplica | Segmentacion via YOLO/FastSAM, exportado a ExecuTorch | AGPL-3.0 | `.pte` |
| SAM (Segment Anything, Meta) | no disponible en esta ficha | no aplica | Segmentacion promptable | no disponible en esta ficha | no disponible en esta ficha |
| FastSAM (Ultralytics, upstream) | no disponible en esta ficha | no aplica | Segmentacion basada en YOLO | no disponible en esta ficha | PyTorch |

No se dispone de datos de benchmarks de los modelos alternativos en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Licencia AGPL-3.0: el uso comercial en productos o servicios en red puede obligar a liberar el codigo fuente bajo los mismos terminos; revisar con asesoria legal antes de produccion.
- Compatibilidad estricta con ExecuTorch v1.4.1: ExecuTorch no garantiza compatibilidad hacia delante, por lo que runtimes mas antiguos pueden fallar al cargar los `.pte`.
- Solo se publican backends CoreML, Vulkan y XNNPACK; los backends MLX fueron exportados pero no publicados, con notas de fallo en `NOTES.md`.
- No hay informacion sobre sesgos, tasas de alucinacion (no aplica directamente a segmentacion), limitaciones de idioma ni robustez ante dominios de imagen distintos de COCO.
- Los benchmarks se limitan a las primeras 500 imagenes de val2017 de COCO con categorias fusionadas; no reflejan el rendimiento en dominios especializados (medico, satelital, industrial).
- No se documentan requisitos de memoria en ejecucion ni latencias, lo que dificulta planificar el despliegue en dispositivos de gama baja.
- Al ser un modelo de segmentacion clase-agnostica, no proporciona etiquetas semanticas de las mascaras.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/software-mansion/react-native-executorch-fast-sam
- Modelo upstream FastSAM (Ultralytics): https://docs.ultralytics.com/models/fast-sam/
- Libreria React Native ExecuTorch (npm): https://www.npmjs.com/package/react-native-executorch
- Documentacion de descarga de modelos: https://docs.swmansion.com/react-native-executorch/docs/fundamentals/downloading-models
- Nota de compatibilidad de ExecuTorch: https://github.com/pytorch/executorch/blob/main/runtime/COMPATIBILITY.md
- Notas de backend MLX no publicado (s): https://huggingface.co/software-mansion/react-native-executorch-fast-sam/blob/main/s/mlx/NOTES.md
- Notas de backend MLX no publicado (x): https://huggingface.co/software-mansion/react-native-executorch-fast-sam/blob/main/x/mlx/NOTES.md
