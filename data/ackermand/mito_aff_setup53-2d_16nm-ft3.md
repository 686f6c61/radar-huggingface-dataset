# ackermand/mito_aff_setup53-2d_16nm-ft3

## Resumen

`mito_aff_setup53-2d_16nm-ft3` es un modelo de segmentación de imágenes de microscopía electrónica publicado por el usuario ackermand en Hugging Face. No es un modelo de lenguaje: es una red convolucional distribuida en formato ONNX que predice tres canales de afinidades mitocondriales (`mito_aff_z`, `mito_aff_y`, `mito_aff_x`) a partir de secciones de FIB-SEM de 16 nm por vóxel. La salida son logits crudos sobre los que hay que aplicar sigmoide y umbralizar en 0 antes de reconstruir instancias por aglomeración.

El modelo es un fine-tune de `cellmap/onnx-web-models/setup_53_2d`, una versión colapsada a 2D de la arquitectura Unet3dIso del proyecto CellMap (Janelia). El ajuste se realizó íntegramente en el navegador con la herramienta `cellmap-flow` 0.3.0, entrenando la red completa durante 20 épocas sobre anotaciones pintadas a mano en la interfaz web, hasta una pérdida final de 0,1. Los datos de anotación proceden del volumen `jrc_mus-liver` (recon-1/em/fibsem-uint8) del repositorio Janelia-COSEM.

Su relevancia es acotada pero concreta: demuestra un flujo de trabajo de ajuste fino en el propio navegador sobre un modelo de segmentación de referencia, con inferencia también en cliente. Es un artefacto de investigación experimental, con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada ni métricas publicadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net 3D colapsada a 2D (Unet3dIso, "2D-collapsed"), con BatchNorm, MaxPool y ConvTranspose; una sola sección z por inferencia |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana espacial de 1×556×556 vóxeles de entrada (88 píxeles de contexto, 44 por lado) y 1×468×468 de salida |
| Tipos de cuantizacion | fp16 (grafo ONNX exportado en fp16); no se documentan otras precisiones |
| Idiomas soportados | no aplica (modelo de visión, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`mito_aff_setup53-2d_16nm-ft3.onnx`) más `manifest.json` con vóxel sizes, bloques, canales y normalización de entrada |
| Resolución | 16 nm por vóxel en entrada y en salida (isótropa en el plano, sin cambio de escala) |
| Canales de salida | 3 (`mito_aff_z`, `mito_aff_y`, `mito_aff_x`), logits crudos |
| Tamaño del repo | 0.0 GB según Hugging Face (por debajo de 1 GB) |

## Arquitectura y entrenamiento

La red de partida es Unet3dIso, la U-Net 3D isótropa de CellMap, en la variante `setup_53_2d`: un estudiante 2D obtenido destilando la versión 3D `cellmap/mito-aff-unetiso-setup-53` durante 60.000 pasos con `train_2d_distill.py`. En esa variante, cada capa 3D (convoluciones, BatchNorm, MaxPool, ConvTranspose) se ha reformulado como su equivalente 2D, de modo que el modelo procesa una única sección z de 1×556×556 vóxeles y devuelve 1×468×468. La pérdida de 88 píxeles (44 por borde) corresponde al campo receptivo necesario para que los vóxeles del borde de salida tengan contexto suficiente.

El ajuste fino publicado aquí parte de `cellmap/onnx-web-models/setup_53_2d` y entrena la red completa (no solo el cabezal) sobre anotaciones de mitocondrias pintadas manualmente en la interfaz de `cellmap-flow`, en el volumen de hígado de ratón `jrc_mus-liver` (recon-1/em/fibsem-uint8). Fueron 20 épocas hasta una pérdida final de 0,1, con fecha 2026-10-26. No se documentan composición del dataset, número de vóxeles anotados, augmentaciones, optimizador ni si hubo etapas de RLHF/DPO (no aplicables en este dominio). Tampoco se especifica si se aplicó poda o cuantización posterior a fp16 más allá de la exportación del grafo.

## Capacidades

- Predicción densa de afinidades mitocondriales en tres ejes (`z`, `y`, `x`) para imágenes de microscopía electrónica FIB-SEM a 16 nm.
- Segmentación de mitocondrias tras post-proceso: sigmoide sobre los logits, umbralización en 0 y aglomeración/watershed sobre el mapa de afinidades para obtener instancias.
- Inferencia sección a sección (2D), lo que permite procesar volúmenes grandes por troceado sin cargar el volumen completo en memoria.
- Ejecución en navegador dentro de `cellmap-flow` y también en servidor, al ser un grafo ONNX portátil.
- Normalización de entrada declarada en `manifest.json`, lo que hace el modelo autocontenido para su runtime.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni generación de texto, código o matemáticas.
- No tiene capacidades multilingües, de visión general, audio ni modo "thinking".

## Casos de uso

- Segmentación de mitocondrias en volúmenes de hígado de ratón: el modelo está ajustado específicamente sobre `jrc_mus-liver` a 16 nm, por lo que es directamente aplicable a ese dataset para obtener máscaras de instancia tras aglomerar el mapa de afinidades.
- Anotación asistida en el navegador: un investigador conecta un volumen en `cellmap-flow`, ejecuta el modelo y corrige las predicciones en lugar de pintar desde cero, reduciendo el coste de generar nuevas anotaciones.
- Ajuste fino interactivo como línea base: sirve como punto de partida para reentrenar en cliente sobre un volumen distinto con la misma herramienta, ya que todo el pipeline (entrenamiento e inferencia) cabe en el navegador.
- Control de calidad de segmentaciones previas: comparar las afinidades predichas con las de otro modelo o con anotaciones existentes para detectar regiones donde la segmentación falla.
- Prototipado rápido en docencia o demos: al ejecutarse en cliente sin GPU dedicada ni instalación, permite mostrar el flujo completo de segmentación por afinidades en un portátil.
- Pre-procesado para pipelines de análisis morfométrico: las máscaras resultantes alimentan el cálculo de volumen, superficie y distribución espacial de mitocondrias en estudios de biología celular.
- Integración en flujos CellMap en servidor: al ser ONNX, se puede invocar desde ONNX Runtime en un pipeline por lotes que recorra secciones z de un volumen completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato numérico es la pérdida final de entrenamiento (0,1) tras 20 épocas sobre las anotaciones del volumen `jrc_mus-liver`, que no es una métrica de evaluación sobre conjunto de test y no permite comparaciones con otros modelos. No hay valores de IoU, Dice, variación de información (VI) ni accuracy de segmentación.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión. El repositorio ocupa menos de 1 GB y el grafo se distribuye en fp16, por lo que el peso de los parámetros es de decenas o pocos cientos de megabytes; a ello hay que sumar las activaciones de un tile de 1×556×556.
- GPU recomendadas: cualquier GPU con soporte de fp16 en ONNX Runtime o TensorRT sirve; no se han publicado pruebas con modelos concretos (A100, H100, RTX 4090, etc.).
- Cabe en GPU de consumo: sí, con alta probabilidad, dado el tamaño del artefacto y que el modelo está pensado para ejecutarse en el navegador; no se especifica qué GPU integrada o dedicada se ha probado.
- Despliegue: `cellmap-flow` (navegador y servidor), ONNX Runtime (CPU, CUDA, TensorRT) y, en general, cualquier runtime compatible con ONNX. No hay exportación a GGUF, llama.cpp, vLLM ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La inferencia es por sección z (1×556×556 de entrada), sin datos publicados de milisegundos por tile ni de vóxeles por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| `ackermand/mito_aff_setup53-2d_16nm-ft3` | Fine-tune 2D de Unet3dIso, 20 épocas en navegador | 1×556×556 (16 nm) | no disponible | ONNX fp16 | Hugging Face, 0 descargas |
| `cellmap/mito-aff-unetiso-setup-53-2d` | Modelo base 2D, estudiante destilado del 3D (60.000 pasos) | 1×1×H×W, 88 píxeles de contexto | no disponible en la información consultada | ONNX | Hugging Face |
| `cellmap/mito-aff-unetiso-setup-53` | Profesor 3D (U-Net isótropa completa) | volumen 3D | bsd-3-clause | `model.pt2` / `state_dict` (repo de ~110 MB) | Hugging Face |
| `cellmap/onnx-web-models/setup_53_2d` | Punto de partida del fine-tune, dentro del hub de modelos web | 2D, 16 nm | no disponible | ONNX | Repositorio `cellmap-flow` |

La comparación en parámetros y métricas no está disponible para ninguno de los artefactos. La diferencia documentada es de procedimiento: el modelo 3D es el profesor, el 2D es su estudiante destilado y este `ft3` es un ajuste posterior del estudiante sobre anotaciones humanas de un volumen concreto.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, código ni respuestas, y no admite instrucciones en lenguaje natural. Cualquier uso en ese sentido es un error de categoría.
- Dominio muy restringido: entrenado sobre anotaciones de un único volumen de hígado de ratón (`jrc_mus-liver`) a 16 nm; el rendimiento fuera de ese dataset, especie, tejido o resolución es desconocido y probablemente degradado.
- Ajuste fino muy corto: 20 épocas sobre anotaciones pintadas en el navegador, sin información sobre el número de vóxeles anotados ni sobre validación cruzada; riesgo alto de sobreajuste a las regiones anotadas.
- Sin métricas de evaluación publicadas: no hay forma de conocer la calidad de segmentación (IoU, Dice, VI) antes de desplegarlo.
- Licencia no declarada en este repositorio: el modelo base 3D (`cellmap/mito-aff-unetiso-setup-53`) figura como bsd-3-clause, pero este fine-tune no especifica términos. No debe asumirse uso comercial libre sin consultar al autor.
- Dependencia de post-proceso: la salida son logits crudos; es obligatorio aplicar sigmoide, umbralizar en 0 y aglomerar para obtener instancias. Usar los logits directamente produce resultados sin sentido.
- Requiere normalización de entrada concreta, definida en `manifest.json`; ignorarla altera las predicciones.
- Precisión fp16 en el grafo: posible pérdida de estabilidad numérica en GPUs sin soporte nativo de media precisión o al ejecutar en CPU.
- Inferencia estrictamente 2D: no explota continuidad entre secciones z, lo que puede producir inconsistencias en la segmentación de estructuras alongadas.
- Sesgos: al derivar de anotaciones humanas de un volumen concreto, hereda los criterios subjetivos y los errores del anotador, así como los sesgos de adquisición del microscopio empleado.
- Artefacto experimental: 0 descargas y 0 likes, sin documentación adicional, sin paper asociado y sin garantía de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ackermand/mito_aff_setup53-2d_16nm-ft3
- Probar en el navegador con cellmap-flow: https://janelia-cellmap.github.io/cellmap-flow/app/?model=ackermand/mito_aff_setup53-2d_16nm-ft3/mito_aff_setup53-2d_16nm-ft3
- Abrir sobre el dataset de entrenamiento: https://janelia-cellmap.github.io/cellmap-flow/app/?dataset=https://janelia-cosem-datasets.s3.amazonaws.com/jrc_mus-liver/jrc_mus-liver.zarr/recon-1/em/fibsem-uint8&model=ackermand/mito_aff_setup53-2d_16nm-ft3/mito_aff_setup53-2d_16nm-ft3
- Repositorio de cellmap-flow: https://github.com/janelia-cellmap/cellmap-flow
- Modelo base 2D: https://huggingface.co/cellmap/mito-aff-unetiso-setup-53-2d
- Modelo profesor 3D: https://huggingface.co/cellmap/mito-aff-unetiso-setup-53
- Volumen de anotación (Janelia-COSEM, jrc_mus-liver): https://janelia-cosem-datasets.s3.amazonaws.com/jrc_mus-liver/jrc_mus-liver.zarr/recon-1/em/fibsem-uint8
