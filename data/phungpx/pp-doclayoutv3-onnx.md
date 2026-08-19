# phungpx/PP-DocLayoutV3-ONNX

## Resumen

PP-DocLayoutV3-ONNX es una exportación en formato ONNX del modelo PP-DocLayoutV3 de PaddlePaddle, un detector de layout de documentos basado en arquitectura DETR. El modelo procesa imágenes de páginas completas y predice, para cada región, la caja delimitadora, la clase de elemento (título, texto, tabla, figura, fórmula, cabecera, pie, referencia, sello, etc.), el orden de lectura y, opcionalmente, polígonos de segmentación. En total reconoce 25 tipos de elementos de layout.

Esta versión ONNX ha sido generada por el usuario phungpx y publicada en Hugging Face. El repositorio incluye el grafo ONNX trazado (con y sin cabezal de máscaras, y en precisión fp16), junto con el código de pre/post-procesamiento de referencia. La inferencia solo requiere ONNX Runtime, NumPy y OpenCV, sin dependencia de PyTorch ni transformers en tiempo de ejecución. Es una opción ligera (0,1 GB) para integrar análisis de layout en pipelines de producción.

El modelo original está diseñado para manejar imágenes de documentos no planos, con distorsiones físicas como sesgo, curvatura o iluminación adversa, integrando segmentación de instancias y predicción de orden de lectura en un único marco. Esta exportación ONNX mantiene esas capacidades, con una verificación de paridad frente al modelo PyTorch original (diferencia máxima inferior a 1e-3 por tensor de salida).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DETR-style con 300 queries y atención deformable (en ONNX se usa grid_sample por falta de kernel simbólico) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | fp32, fp16 (exportación ONNX; no se mencionan cuantizaciones int8 u otras) |
| Idiomas soportados | no aplica (modelo de visión, no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (archivos .onnx) |

## Arquitectura y entrenamiento

El modelo PP-DocLayoutV3 original es un detector de layout estilo DETR que utiliza 300 queries de objeto. Cada query predice una clase (entre 25 tipos de elementos de documento), una caja delimitadora en formato cxcywh normalizado, una matriz de punteros de orden de lectura (300x300) y, opcionalmente, máscaras de segmentación a stride 4 (200x200 por query). La selección de cajas se realiza mediante top-k sobre la cuadrícula de puntuaciones (query, clase), sin necesidad de NMS.

La exportación ONNX se realizó con `torch.onnx.export` usando opset 17, con eje de batch dinámico. Se deshabilitaron los kernels personalizados de CUDA para la atención deformable, utilizando en su lugar la ruta pura de PyTorch con `grid_sample`. Además, la embedding posicional 2D sin/cos, que originalmente se calcula en float64, se parcheó a float32 durante el trazado para que el grafo sea compatible con el kernel Cos de ONNX Runtime en CPU. La diferencia numérica introducida por este cambio es del orden de 1e-6.

No se proporcionan detalles sobre el entrenamiento del modelo original (número de tokens, composición del dataset, técnicas de alineación como RLHF/DPO). El modelo base es PaddlePaddle/PP-DocLayoutV3_safetensors, y la documentación oficial indica que está diseñado para manejar distorsiones físicas en documentos.

## Capacidades

- Detección de 25 tipos de elementos de layout: título, texto, tabla, figura, fórmula, cabecera, pie, referencia, sello, número de página, título de figura, título de párrafo, nota al pie, imagen, gráfico, etc.
- Predicción de cajas delimitadoras en formato cxcywh normalizado, con rescalado a coordenadas de píxel.
- Predicción del orden de lectura mediante una matriz de punteros entre las 300 queries, lo que permite reconstruir la secuencia lógica de elementos en la página.
- Segmentación de instancias opcional: genera máscaras a stride 4 (200x200) por query, que se pueden convertir en polígonos de segmentación.
- Manejo de documentos no planos: el modelo está entrenado para tolerar sesgo, curvatura y condiciones de iluminación adversas.
- Inferencia sin dependencias pesadas: solo requiere ONNX Runtime, NumPy y OpenCV, lo que facilita su despliegue en entornos de producción.
- Soporta ejecución en CPU, CUDA y TensorRT mediante los proveedores de ONNX Runtime.

## Casos de uso

- Digitalización de documentos escaneados: el modelo identifica y clasifica cada región de la página (títulos, párrafos, tablas, figuras) para su posterior indexación o conversión a formatos estructurados.
- Análisis de artículos científicos: permite extraer automáticamente la estructura de páginas de revistas académicas, separando texto, figuras, tablas y fórmulas para su procesamiento posterior.
- Preprocesamiento para OCR: al detectar las regiones de texto, se puede limitar el reconocimiento óptico a esas áreas, mejorando la precisión y reduciendo el coste computacional.
- Extracción de tablas y figuras: en pipelines de minería de datos, el modelo localiza tablas y figuras para su posterior análisis o conversión a formatos semánticos.
- Reconstrucción del orden de lectura: en documentos con múltiples columnas o elementos flotantes, la predicción del orden de lectura permite recomponer el flujo lógico del contenido, útil para lectores de pantalla o conversión a HTML.
- Automatización de archivos y gestión documental: clasificación de páginas por tipo de layout (facturas, formularios, informes) para enrutamiento automático en sistemas de gestión documental.
- Indexación de bibliotecas digitales: detección de elementos estructurales en lotes de documentos históricos o técnicos para generar metadatos de navegación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye ejemplos de detección sobre páginas densas de artículos científicos (con 25-38 elementos detectados por página), pero no se proporcionan métricas cuantitativas como mAP, precisión o recall.

## Requisitos de hardware

- El tamaño del repositorio es de 0,1 GB, lo que indica un modelo ligero en cuanto a pesos. La entrada es una imagen de 800x800 píxeles, por lo que el coste de inferencia es moderado.
- No se especifican requisitos de VRAM en la documentación. Dado el tamaño de los pesos y la resolución de entrada, es probable que quepa en GPUs con 2 GB o menos, pero se recomienda realizar pruebas de memoria.
- Se puede ejecutar en CPU con ONNX Runtime (proveedor CPUExecutionProvider), aunque la latencia será mayor que en GPU.
- Para GPU, se soportan los proveedores CUDA y TensorRT, lo que permite acelerar la inferencia en entornos con NVIDIA.
- Opciones de despliegue: ONNX Runtime (Python, C++, etc.), servidores de inferencia como Triton o TensorRT, o integración directa en aplicaciones existentes.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de análisis de layout (como LayoutLMv3, Detectron2, o versiones anteriores de PP-DocLayout). No se han encontrado datos de rendimiento relativos en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo es exclusivamente de detección de layout; no realiza reconocimiento de texto (OCR). Para extraer el contenido textual de las regiones detectadas se necesita un motor OCR adicional.
- La exportación ONNX introduce una pequeña diferencia numérica (del orden de 1e-6) debida al cambio de precisión en la embedding posicional, que podría afectar ligeramente a los resultados en casos extremos.
- La versión sin máscaras (`pp_doclayoutv3_nomask.onnx`) degrada la salida de polígonos a cajas alineadas al eje, perdiendo la capacidad de segmentación precisa.
- El modelo original puede tener limitaciones en ciertos tipos de documentos (por ejemplo, manuscritos o diseños muy atípicos) que no están documentadas en esta exportación.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base (PaddlePaddle/PP-DocLayoutV3_safetensors) por si hubiera condiciones adicionales.
- No se garantiza la compatibilidad con todos los proveedores de ONNX Runtime; el grafo se verificó con CPU, CUDA y TensorRT, pero no se han probado otras implementaciones.

## Enlaces

- Repositorio del modelo: https://huggingface.co/phungpx/PP-DocLayoutV3-ONNX
- Modelo base (PaddlePaddle): https://huggingface.co/PaddlePaddle/PP-DocLayoutV3_safetensors
- Documentación oficial de PP-DocLayoutV3 en Transformers: https://huggingface.co/docs/transformers/model_doc/pp_doclayout_v3
- Repositorio GitHub con herramientas ONNX para PP-DocLayout: https://github.com/xulihang/PP_DocLayout_ONNX
- Modelo en ModelScope: https://www.modelscope.cn/models/PaddlePaddle/PP-DocLayoutV3_onnx
