# ParsaVictor/pcb-solder-defect-detection-yolo26

## Resumen

PCB Solder & Assembly Defect Detection (YOLO26m) es un detector de objetos basado en la familia YOLO26 y entrenado con la librería Ultralytics para localizar defectos de soldadura y ensamblaje en placas de circuito impreso (PCB) ya pobladas. Lo desarrolla el usuario ParsaVictor como parte de una suite de inspección de PCB que incluye también un modelo hermano para placas desnudas (bare board). El modelo resuelve un problema concreto de inspección visual automatizada (AOI) en entornos de fabricación electrónica: identificar puentes de soldadura, soldadura insuficiente o excesiva, voids, componentes ausentes o desplazados, quemaduras, daños físicos y oxidación.

Se trata de un detector de una sola etapa con arquitectura YOLO26 en variante "m" (medium), entrenado a resolución de imagen 800 px durante 150 épocas. El repositorio ocupa 0.0 GB según Hugging Face, lo que indica pesos ligeros típicos de un modelo YOLO medium. No se especifican en la información disponible el número de parámetros ni la longitud de contexto (no aplica a un detector de objetos).

Su relevancia actual radica en que ofrece métricas publicadas y verificables en validación y test (mAP50 de 0.905 y 0.895 respectivamente), umbrales de confianza por clase ajustados a F1 óptimo, y una documentación explícita de sus debilidades conocidas, algo poco habitual en modelos de detección industrial de nicho. La licencia es de uso exclusivamente de investigación y desarrollo, con contacto obligatorio con el autor para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26 (variante medium, detector de objetos de una etapa) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | research-use-mixed-sources (uso de investigación y desarrollo; contacto con el autor para uso comercial) |
| Formato de pesos | best.pt (PyTorch, Ultralytics) |
| Resolución de entrenamiento | imgsz 800 |
| Épocas de entrenamiento | 150 (mejor en la época 143) |
| Optimizador | AdamW con learning rate bajo ajustado |
| Dataset | ParsaVictor/pcb-solder-defect-detection |
| Pipeline | object-detection |
| Librería | ultralytics |
| Tamaño del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO26 en su variante medium, un detector de objetos de una sola etapa implementado sobre la librería Ultralytics. Se entrenó a resolución de imagen de 800 píxeles durante 150 épocas, alcanzando el mejor checkpoint en la época 143. El optimizador utilizado fue AdamW con una tasa de aprendizaje baja ajustada específicamente para este entrenamiento.

El entrenamiento incorporó aumentación de datos adicional (ruido, desenfoque de movimiento y compresión JPEG) y un mecanismo de "rollback guard" automático contra picos anómalos en la curva de entrenamiento, que revierte a checkpoints previos cuando detecta degradaciones bruscas. El dataset de entrenamiento es ParsaVictor/pcb-solder-defect-detection, con anotaciones de nueve clases de defecto. La clase con menos ejemplos es burn, con 513 instancias, lo que explica su menor recall. No se especifica en la información disponible el número total de imágenes ni la composición detallada del dataset más allá de estas referencias.

## Capacidades

- Detección de objetos en imágenes de PCB pobladas, con localización por bounding box y clasificación en nueve clases de defecto.
- Clases detectadas: insufficient_solder, excess_solder, solder_bridge, solder_void, missing_component, shifted_component, burn, physical_damage y oxidation.
- Umbrales de confianza por clase ajustados a F1 óptimo sobre validación, con un umbral global de respaldo de 0.228 para clases con pocos ejemplos de validación.
- Integración directa con la API de Ultralytics (`YOLO(weights).predict(...)`), lo que permite su uso en pipelines Python existentes.
- Descarga de pesos vía `huggingface_hub.hf_hub_download`.
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso, visión general ni procesamiento de lenguaje: es exclusivamente un detector visual de dominio específico.

## Casos de uso

- Inspección visual automatizada (AOI) en líneas SMT: el modelo se integra tras la cámara de la línea para detectar puentes de soldadura y soldadura insuficiente o excesiva en cada placa, aplicando los umbrales por clase para reducir falsos positivos en producción.
- Control de calidad en lote tras el ensamblaje: procesar imágenes de placas ya pobladas para identificar componentes ausentes o desplazados antes del test funcional, evitando costes de retrabajo posteriores.
- Revisión de defectos térmicos y de integridad: detección de quemaduras, daños físicos y oxidación para clasificar placas como scrap o reparable en la estación de retrabajo.
- Triaje asistido en inspección manual: el modelo pre-marca regiones sospechosas sobre la imagen para que un operario las revise, priorizando las placas con mayor probabilidad de defecto.
- Auditoría de proveedores y lotes: análisis retrospectivo de imágenes históricas de placas para identificar patrones de defectos recurrentes por proveedor o por lote de fabricación.
- Prototipado rápido de sistemas de inspección: al estar basado en Ultralytics y distribuirse como `best.pt`, permite desplegar un prototipo funcional en pocas líneas de código y validar la viabilidad del caso de uso antes de invertir en un sistema propietario.
- Investigación en visión artificial industrial: sirve como baseline reproducible con métricas y debilidades documentadas para comparar nuevas técnicas de detección de defectos en PCB.

## Benchmarks y rendimiento

| Split | mAP50 | mAP50-95 |
|---|---|---|
| val | 0.905 | 0.647 |
| test | 0.895 | 0.657 |

Umbrales de confianza por clase (F1 óptimo sobre validación):

| Clase | Umbral |
|---|---|
| insufficient_solder | 0.297 |
| excess_solder | 0.349 |
| solder_bridge | 0.417 |
| solder_void | 0.249 |
| missing_component | 0.381 |
| shifted_component | 0.389 |
| burn | 0.224 |
| physical_damage | 0.214 |
| oxidation | 0.228 |

No se han publicado resultados de benchmarks adicionales (por ejemplo, comparativas con otros detectores) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Al ser un YOLO variante medium con pesos ligeros (repositorio de 0.0 GB), es esperable que quepa en GPUs de consumo, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible. Por el tamaño del modelo, es plausible su ejecución en RTX 3060/4060 o superiores, pero el autor no lo especifica.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; el tamaño del checkpoint sugiere que sí, pero no hay dato oficial.
- Opciones de despliegue: Ultralytics (API Python nativa), exportación a formatos soportados por Ultralytics (ONNX, TensorRT, etc.) no confirmada explícitamente en la model card.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tarea | mAP50 (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PCB Solder & Assembly Defect Detection (YOLO26m) | YOLO26m | Detección de defectos de soldadura/ensamblaje en PCB pobladas | 0.895 | research-use-mixed-sources | Hugging Face |
| pcb-bare-board-defect-detection-yolo26 | YOLO26 | Detección de defectos en placas desnudas | no disponible | no disponible | Hugging Face (modelo hermano del mismo autor) |
| Alternativas genéricas de detección de defectos en PCB | no disponible | Detección de defectos | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos competidores en la información proporcionada; la comparativa se limita al modelo hermano del mismo autor, del que no se detallan métricas.

## Limitaciones y advertencias

- Confusión sistemática entre solder_void e insufficient_solder: aproximadamente el 71% de los errores de void se clasifican como soldadura insuficiente. El autor recomienda revisar ambas clases conjuntamente en cualquier placa marcada.
- Recall bajo en la clase burn (~62%), atribuible a que es la clase con menos ejemplos de entrenamiento (513 instancias). Riesgo elevado de falsos negativos en quemaduras.
- Degradación del rendimiento en fotografías muy oscuras o con poca luz procedentes de uno de los subconjuntos de origen del dataset.
- Licencia restrictiva: research-use-mixed-sources. El uso comercial requiere contactar previamente con el autor; no se permite uso comercial sin autorización explícita.
- Riesgo de alucinación en el sentido de detecciones falsas positivas: como todo detector, puede marcar regiones sin defecto real, especialmente con umbrales de confianza bajos como el global de 0.228.
- El modelo está entrenado exclusivamente para inspección de PCB; no es transferible a otros dominios visuales sin reentrenamiento.
- No se especifican en la información disponible el número de parámetros, el tamaño exacto del dataset ni la composición por fuente, lo que limita la reproducibilidad completa del entrenamiento.
- El repositorio aparece con 0.0 GB de tamaño, lo que puede indicar que los pesos no están subidos o que el tamaño se reporta de forma redondeada; conviene verificar la disponibilidad real de `best.pt` antes de integrarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ParsaVictor/pcb-solder-defect-detection-yolo26
- Dataset de entrenamiento: https://huggingface.co/datasets/ParsaVictor/pcb-solder-defect-detection
- Licencia del dataset: https://huggingface.co/datasets/ParsaVictor/pcb-solder-defect-detection/blob/main/LICENSE.md
- Modelo hermano (bare board): https://huggingface.co/ParsaVictor/pcb-bare-board-defect-detection-yolo26
- Suite de inspección de PCB: https://huggingface.co/ParsaVictor/pcb-inspection-suite
