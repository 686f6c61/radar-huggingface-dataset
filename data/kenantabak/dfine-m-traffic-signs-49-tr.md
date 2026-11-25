# kenantabak/dfine-m-traffic-signs-49-tr

## Resumen

D-FINE-M (NMS-Free) para detección de señales de tráfico direccionales de 49 clases es un modelo de detección de objetos basado en la arquitectura D-FINE, desarrollado por kenantabak como parte del proyecto EVREN Multi-Architecture Object Detection & ONNX CPU Benchmark. El modelo se distribuye en formato ONNX (75,25 MB) y está diseñado para inferencia en CPU sin necesidad de supresión de no máximos (NMS), lo que simplifica el pipeline de despliegue en entornos con recursos limitados.

El modelo detecta 49 clases de señales de tráfico, incluyendo señales direccionales y de limitación, con una resolución de entrada de 640 × 640 píxeles. Los resultados declarados por el autor son un mAP@50 del 84,32 % y un mAP@50-95 del 71,50 %, con una precisión del 83,37 % y un recall del 86,30 %. La latencia medida en CPU con ONNX Runtime y 4 hilos es de 336,6 ms (2,97 FPS), lo que lo sitúa como una opción viable para aplicaciones de conducción autónoma o asistencia a la conducción en dispositivos sin GPU dedicada.

La relevancia del modelo radica en su enfoque práctico: pesos ONNX listos para producción, decodificación sin NMS y una auditoría visual pre-release sobre 20 imágenes independientes de señales de tráfico no vistas durante el entrenamiento, con detección limpia de señales pequeñas como `no_overtaking`, `do_not_enter`, `speed_limit_80`, `give_way` y `stop` distantes. La licencia CC-BY-4.0 permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | D-FINE (DETR-like, NMS-free) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (pesos ONNX en FP32 presumiblemente) |
| Idiomas soportados | no disponible (modelo de visión, sin componente lingüístico) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`best.onnx`, 75,25 MB) |

## Arquitectura y entrenamiento

El modelo se basa en D-FINE, una familia de detectores de objetos derivada de DETR que emplea un transformer con decodificación sin NMS. La arquitectura `dfine-m` corresponde a la variante mediana de la familia D-FINE. El modelo procesa imágenes de entrada de 640 × 640 píxeles en formato RGB con escalado [0, 1] y produce directamente cajas delimitadoras y logits de clase, eliminando la necesidad de un paso posterior de supresión de no máximos.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables en un modelo de visión). El autor menciona que el modelo fue entrenado como parte del benchmark EVREN y que se realizó una auditoría visual pre-release sobre 20 imágenes de test independientes completamente no vistas, con resultados limpios en la detección de señales pequeñas y distantes. No se especifica el framework de entrenamiento subyacente ni los hiperparámetros utilizados.

## Capacidades

- Detección de objetos en imágenes RGB con resolución de entrada de 640 × 640 píxeles.
- Detección de 49 clases de señales de tráfico direccionales, incluyendo `no_overtaking`, `do_not_enter`, `speed_limit_80`, `give_way` y `stop`.
- Decodificación NMS-free: las cajas y clases se obtienen directamente de las salidas del modelo sin post-procesado de supresión de no máximos.
- Inferencia en CPU mediante ONNX Runtime, con latencia medida de 336,6 ms a 4 hilos.
- Capacidad de detectar señales pequeñas y distantes en imágenes de carretera, según la auditoría visual del autor.
- No dispone de soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al ser un modelo puramente de visión.
- No dispone de modo thinking, visión adicional, audio ni otras capacidades especiales más allá de la detección de objetos.

## Casos de uso

- Asistencia a la conducción en vehículos: el modelo puede integrarse en sistemas ADAS embarcados para detectar señales de tráfico en tiempo real, aprovechando su formato ONNX y su inferencia en CPU sin necesidad de GPU dedicada.
- Sistemas de inventario y auditoría de señalización vial: permite procesar imágenes de carreteras capturadas por vehículos de inspección para identificar y catalogar señales de tráfico, gracias a su capacidad de detectar señales pequeñas y distantes.
- Análisis de vídeo de tráfico en servidores sin GPU: con una latencia de 336,6 ms por imagen en CPU a 4 hilos, puede procesar flujos de vídeo a baja frecuencia de muestreo en infraestructura estándar.
- Pre-procesado para pipelines de conducción autónoma: las detecciones de señales pueden alimentar módulos de planificación y control que requieran conocimiento del entorno vial, beneficiándose de la decodificación NMS-free que simplifica la integración.
- Aplicaciones móviles o embebidas de reconocimiento de señales: el tamaño reducido del modelo (75,25 MB en ONNX) y la ausencia de NMS facilitan el despliegue en dispositivos con recursos limitados.
- Validación y control de calidad de datasets de señales de tráfico: el modelo puede usarse para pre-anotar o verificar anotaciones existentes en conjuntos de datos de señalización vial, gracias a su precisión y recall declarados (83,37 % y 86,30 %).
- Investigación en detección de objetos NMS-free: sirve como referencia reproducible para comparar arquitecturas D-FINE frente a otros detectores en el benchmark EVREN de 24 ejecuciones.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| mAP@50 | 84,32 % |
| mAP@50-95 | 71,50 % |
| Precision | 83,37 % |
| Recall | 86,30 % |
| Latencia CPU (4 hilos, ONNX Runtime) | 336,6 ms (2,97 FPS) |
| Tamano ONNX | 75,25 MB |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso de CPU; para GPU, el modelo ONNX de 75,25 MB requiere aproximadamente 1-2 GB de VRAM incluyendo activaciones a 640 × 640, aunque no se dispone de una cifra oficial.
- GPU recomendadas: no disponible; el autor solo reporta latencia en CPU con ONNX Runtime.
- Compatibilidad con GPU de consumo: el tamaño reducido del modelo sugiere que cabe en cualquier GPU de consumo moderna (RTX 3060 o superior), aunque no se han publicado mediciones.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider documentado); compatible potencialmente con otros runtimes ONNX (TensorRT, OpenVINO) no verificados.
- Latencia y throughput: 336,6 ms por imagen y 2,97 FPS en CPU a 4 hilos con ONNX Runtime, según el autor.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de detección de señales de tráfico en la información proporcionada. El autor referencia un benchmark de 24 ejecuciones multi-arquitectura (EVREN) que podría contener comparativas, pero los resultados concretos de modelos alternativos no están incluidos en la información disponible.

| Modelo | Parametros | Contexto/Resolucion | mAP@50 | Licencia | Formato |
|---|---|---|---|---|---|
| dfine-m-traffic-signs-49-tr | no disponible | 640 × 640 | 84,32 % | CC-BY-4.0 | ONNX |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los resultados de benchmarks (mAP@50, mAP@50-95, precisión, recall) están declarados por el autor y no han sido verificados de forma independiente (`verified: false` en el model-index).
- El modelo está especializado en 49 clases de señales de tráfico; no es un detector de objetos de propósito general y fallará en clases fuera de su vocabulario.
- No se dispone de información sobre sesgos en el dataset de entrenamiento, que podría estar sesgado hacia condiciones de iluminación, geografía o tipos de señal específicos (posiblemente turcas, dado el contexto del proyecto EVREN y el sufijo `-tr`).
- Riesgo de alucinación: como todo detector de objetos, puede producir falsos positivos en escenas con objetos visualmente similares a señales de tráfico.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero el autor advierte que las licencias del framework de entrenamiento subyacente aplican por separado.
- La latencia de 336,6 ms en CPU (2,97 FPS) puede ser insuficiente para aplicaciones de tiempo real estricto en CPU; se requeriría GPU o aceleración por hardware para mayores frecuencias.
- No se especifica la cuantización de los pesos ONNX ni se ofrecen variantes cuantizadas (INT8, FP16) en la información disponible.
- El modelo fue creado en noviembre de 2026 y no cuenta con descargas ni likes, por lo que su validación por la comunidad es inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/kenantabak/dfine-m-traffic-signs-49-tr
- Página del modelo en EVREN: https://evren.ssyz.org.tr/models/u19979974710e/cok-sinifli-trafik-levhasi-tanima-d-fine-m-49-sinif
- Benchmark y decodificador ONNX unificado (GitHub): https://github.com/kenantabak/evren-multiarch-cv-onnx-benchmark
- Dataset de benchmark estructurado (HF Parquet): https://huggingface.co/datasets/kenantabak/evren-multiarch-cv-onnx-benchmark
- Artículo técnico en turco (Dev.to): https://dev.to/kenantabak
