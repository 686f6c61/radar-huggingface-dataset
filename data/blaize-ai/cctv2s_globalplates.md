# Blaize-AI/CCTv2s_GlobalPlates

## Resumen

CCTv2s_GlobalPlates es un modelo de reconocimiento óptico de caracteres (OCR) especializado en matrículas de vehículos, desarrollado por Blaize-AI como una variante optimizada para sus aceleradores Xplorer basados en la arquitectura Graph Streaming Processor (GSP). El modelo original proviene del repositorio open source fast-plate-ocr (versión 2.0), que emplea la arquitectura Compact Convolutional Transformer (CCT) descrita en el artículo "Escaping the Big Data Paradigm with Compact Transformers" de Hassani et al. (2021). La adaptación de Blaize incluye optimizaciones de hardware específicas mediante el Picasso SDK, lo que permite una inferencia eficiente en dispositivos de edge computing.

El modelo fue entrenado con el Global License Plate Dataset (GlobalPlates), un conjunto de datos a gran escala que contiene más de 5 millones de imágenes de matrículas procedentes de 74 países, aunque las imágenes no están disponibles públicamente. Este dataset se describe en el artículo arXiv:2405.10949. El repositorio actual ofrece una única variante cuantizada en BF16 con resolución de entrada de 128×64 píxeles, almacenada en formato `.bm` (Blaize model). La licencia del modelo es MIT, pero el dataset de entrenamiento está bajo CC-BY-NC-ND-4.0, lo que impone restricciones de uso no comercial y de modificación.

La relevancia de este modelo radica en su diseño específico para aceleradores de edge de bajo consumo, lo que lo hace adecuado para aplicaciones de peaje, control de accesos, vigilancia y sistemas de asistencia al conductor que requieren baja latencia y alta eficiencia energética. Sin embargo, su uso está limitado al hardware Blaize, ya que el formato `.bm` no es portable a otras plataformas sin conversión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Compact Convolutional Transformer (CCT) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | BF16 (variante disponible); se mencionan INT8 y AMP en la documentación, pero no hay archivos publicados |
| Idiomas soportados | no disponible (el modelo reconoce caracteres de matrículas, no idiomas) |
| Licencia | MIT (modelo); dataset de entrenamiento bajo CC-BY-NC-ND-4.0 |
| Formato de pesos | `.bm` (Blaize model, específico del Picasso SDK) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Compact Convolutional Transformer (CCT), que combina capas convolucionales con transformadores para reducir la complejidad computacional y el número de parámetros en comparación con los Vision Transformers (ViT) estándar. La versión original, CCTv2s, proviene del repositorio fast-plate-ocr y fue diseñada para OCR de matrículas. El entrenamiento se realizó con el dataset GlobalPlates, que abarca matrículas de 74 países, lo que proporciona una amplia variabilidad de formatos, fuentes y colores. No se han publicado detalles sobre el número de tokens de entrenamiento, composición exacta del dataset o técnicas de ajuste como RLHF o DPO, ya que no es un modelo de lenguaje. La optimización de Blaize se centra en la conversión del modelo ONNX original a un formato `.bm` compatible con el GSP, empleando técnicas de cuantización (BF16, INT8, AMP) para mejorar la velocidad y eficiencia sin modificar la arquitectura subyacente.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) específico para matrículas de vehículos, capaz de identificar texto alfanumérico en placas de distintos países.
- Detección y lectura de matrículas en imágenes de resolución 128×64, optimizado para escenarios de baja latencia.
- Inferencia en tiempo real en hardware dedicado Blaize Xplorer, con soporte para cuantización INT8 y BF16.
- No es un modelo de lenguaje: no genera texto libre ni mantiene conversaciones.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al reconocimiento de caracteres de matrículas internacionales (el dataset incluye 74 países, pero no se especifican alfabetos concretos).

## Casos de uso

- Control de accesos en aparcamientos: el modelo puede integrarse en sistemas de barrera que lean matrículas en tiempo real, gracias a su baja latencia y a la capacidad de ejecutarse en dispositivos edge como el Blaize Xplorer.
- Peajes automáticos: procesamiento de vehículos en movimiento mediante cámaras de alta velocidad, donde la eficiencia energética del GSP permite un despliegue masivo en infraestructuras remotas.
- Vigilancia y seguridad ciudadana: análisis de flujo de vehículos en ciudades, permitiendo identificar matrículas en tiempo real para alertas de vehículos robados o con órdenes de búsqueda.
- Gestión de flotas: lectura automática de matrículas en entradas y salidas de almacenes o centros logísticos, facilitando el registro de movimientos sin intervención manual.
- Sistemas de asistencia al conductor (ADAS): detección de matrículas de vehículos precedentes para funciones de control de crucero adaptativo o asistencia en autopista, aunque requiere integración con cámaras de alta resolución.
- Investigación académica: uso del modelo como referencia para estudios comparativos de OCR de matrículas en entornos de edge computing, siempre que se respeten las restricciones del dataset (uso no comercial).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión (como accuracy, F1, o comparaciones con otros modelos de OCR de matrículas). Se desconoce el rendimiento en conjuntos de datos estándar como CCPD o AOLP.

## Requisitos de hardware

- Hardware específico: requiere un acelerador Blaize Xplorer (GSP). No se puede ejecutar en GPUs convencionales (NVIDIA, AMD) ni en CPU sin una conversión previa del formato `.bm` a ONNX u otro formato estándar.
- VRAM: no aplicable, ya que la memoria es gestionada por el GSP; el tamaño del modelo BF16 es desconocido, pero al ser un modelo compacto (CCTv2s) se estima inferior a 100 MB.
- Despliegue: exclusivamente mediante el Blaize Picasso SDK, que incluye herramientas como `blaize-modeltool` para inspeccionar el modelo.
- Latencia y throughput: no se han publicado cifras oficiales. Se espera una latencia muy baja (del orden de milisegundos) debido al diseño graph-native del GSP, pero sin datos verificables.
- Alternativas de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje y su formato es propietario.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa cuantitativa con otros modelos de OCR de matrículas (por ejemplo, YOLOv8-LPD, PaddleOCR-Lite, o LPRNet). La falta de benchmarks publicados y la dependencia del hardware Blaize impiden una comparación directa. Se recomienda a los desarrolladores evaluar el modelo en su propio hardware y dataset antes de elegirlo frente a alternativas más estándar como PaddleOCR (licencia Apache 2.0) o modelos basados en ONNX que se ejecutan en cualquier GPU.

## Limitaciones y advertencias

- Dependencia de hardware propietario: el formato `.bm` solo se ejecuta en aceleradores Blaize Xplorer. Cualquier despliegue en otra plataforma requiere una reconversión a ONNX, que puede no estar disponible.
- Restricciones de licencia del dataset: aunque el modelo tiene licencia MIT, el dataset GlobalPlates está bajo CC-BY-NC-ND-4.0, lo que prohíbe el uso comercial y la creación de obras derivadas. Esto puede afectar a aplicaciones empresariales.
- Falta de transparencia: no se publican parámetros, arquitectura detallada (número de capas, dimensiones), ni resultados de entrenamiento. Esto dificulta la evaluación de su robustez.
- Riesgo de alucinación: al ser un modelo de visión, puede generar caracteres incorrectos en matrículas borrosas, dañadas o con fuentes no representadas en el dataset.
- Sesgo geográfico: el dataset cubre 74 países, pero no se especifica la distribución exacta; es posible que ciertos formatos regionales estén infrarrepresentados.
- Soporte limitado: la documentación solo menciona una variante (BF16 128×64); no se ofrecen otras resoluciones o cuantizaciones en el repositorio.
- Sin garantías de precisión: Blaize no proporciona métricas de rendimiento, por lo que el usuario debe validar el modelo en su caso de uso específico.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Blaize-AI/CCTv2s_GlobalPlates)
- [Repositorio original fast-plate-ocr](https://github.com/ankandrew/fast-plate-ocr)
- [Global License Plate Dataset](https://github.com/siddagra/Global-License-Plate-Dataset)
- [Artículo Compact Transformers (arXiv:2104.05704)](https://arxiv.org/abs/2104.05704)
- [Artículo Global License Plate Dataset (arXiv:2405.10949)](https://doi.org/10.48550/arXiv.2405.10949)
- [Web de Blaize](https://www.blaize.com)
