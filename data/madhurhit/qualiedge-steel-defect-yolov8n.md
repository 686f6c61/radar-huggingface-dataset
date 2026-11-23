# Madhurhit/qualiedge-steel-defect-yolov8n

## Resumen

QualiEdge Steel Defect YOLOv8n es un modelo de deteccion de objetos basado en la arquitectura YOLOv8n (variante Nano) de Ultralytics, ajustado especificamente para la deteccion de defectos superficiales en acero laminado en caliente. Lo desarrolla el usuario Madhurhit como parte de la arquitectura de control de calidad industrial QualiEdge, orientada a dispositivos de borde como Raspberry Pi 5, aceleradores Hailo-8L y PCs industriales. El modelo resuelve el problema de la inspeccion visual automatizada en lineas de produccion siderurgica, sustituyendo la revision manual por inferencia en tiempo real.

El modelo detecta siete clases de superficie: seis categorias de defecto (crazing, inclusion, patches, pitted_surface, rolled_in_scale y scratches) mas una clase normal para superficies sin defecto. Se entrena y valida sobre el NEU Surface Defect Database (NEU-DET), un conjunto de referencia en vision industrial. Con aproximadamente 3,01 millones de parametros y 8,2 GFLOPs, esta disenado para despliegue de baja latencia en hardware limitado.

Es relevante ahora porque el ajuste fino de modelos ultraligeros sobre datasets industriales especificos permite llevar la inspeccion automatica a la linea de produccion sin depender de infraestructura de GPU dedicada, algo habitual en el sector siderurgico. El repositorio incluye pesos PyTorch, un grafo ONNX estatico para runtimes de borde y un informe de evaluacion con metricas de validacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8n (Ultralytics, detector de objetos de una etapa) |
| Parametros totales | ~3,01 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica a vision) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | en (etiquetas y documentacion en ingles) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`weights/best.pt`) y ONNX (`onnx/neu_yolov8n_edge.onnx`) |

## Arquitectura y entrenamiento

El modelo se basa en YOLOv8n, la variante Nano de la familia YOLOv8, un detector de objetos de una etapa con backbone CNN y cabecera de prediccion densa. Segun la model card, el coste computacional es de 8,2 GFLOPs a resoluciones de 320x320 y 640x640, y el numero de parametros ronda los 3,01 millones. El entrenamiento emplea el optimizador AdamW con un esquema de decaimiento de learning rate por cosine annealing, y pesos de perdida configurados como Box 7,5, Class 0,5 y Distribution Focal Loss 1,5.

El dataset de entrenamiento y validacion es el NEU Surface Defect Database (NEU-DET), que cubre las seis categorias de defecto mas la clase normal. La model card no detalla el numero de imagenes, la composicion exacta del split ni si hubo tecnicas adicionales de aumento de datos o regularizacion. Tambien se exporta un grafo ONNX estatico con entrada 1x3x320x320 en float32 normalizada en el rango [0,0 - 1,0], pensado para runtimes de borde como ONNX Runtime y el acelerador Hailo-8L.

## Capacidades

- Deteccion de objetos en imagenes de superficie de acero con siete clases (seis defectos mas normal).
- Clasificacion y localizacion simultanea mediante cajas delimitadoras con puntuacion de confianza.
- Inferencia en tiempo real orientada a dispositivos de borde, con entrada de 320x320 para reducir coste computacional.
- Exportacion a ONNX para ejecucion en runtimes ligeros y aceleradores de hardware.
- Integracion directa con la libreria Ultralytics para entrenamiento, validacion y prediccion.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision general, audio ni modo thinking, ya que se trata de un modelo puramente de vision por computador para una tarea acotada.

## Casos de uso

- Inspeccion en linea de produccion siderurgica: el modelo procesa fotogramas de la banda de acero a 320x320 y marca defectos como scratches o pitted_surface en tiempo real, permitiendo al operario o al sistema de control descartar material defectuoso antes de etapas posteriores.
- Control de calidad en dispositivos de borde: al ejecutarse en Raspberry Pi 5 o Hailo-8L, permite desplegar la inspeccion en la propia planta sin enviar imagenes a la nube, reduciendo latencia y dependencia de conectividad.
- Clasificacion automatica de lotes de acero: el modelo etiqueta cada superficie como normal o con una de las seis categorias de defecto, alimentando sistemas MES o ERP para trazabilidad y estadisticas de rechazo.
- Mantenimiento predictivo de lineas de laminacion: la deteccion de patrones recurrentes de rolled_in_scale o patches puede correlacionarse con el desgaste de rodillos o condiciones de oxidacion, ayudando a programar intervenciones.
- Investigacion en vision industrial: el repositorio incluye `evaluation_report.json` con precision, recall, F1 y latencia, lo que facilita reproducir experimentos y comparar variantes sobre NEU-DET.
- Prototipado rapido de pipelines de inspeccion: la disponibilidad de pesos PyTorch y ONNX permite integrar el modelo en scripts de Ultralytics o en sesiones ONNX Runtime para pruebas de concepto antes de escalar a produccion.
- Sistemas de alerta temprana en planta: combinado con una camara fija sobre la banda, el modelo puede emitir alertas cuando detecta defectos criticos con confianza superior al umbral configurado (por ejemplo, conf=0,45 segun el ejemplo de la model card).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona un archivo `evaluation_report.json` con metricas de validacion (precision, recall, F1 y latencia), pero sus valores concretos no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; por el tamano del modelo (~3,01 M de parametros) es previsible que quepa en GPUs de gama baja, pero no se aportan cifras.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabida en GPU de consumo: no disponible en la informacion proporcionada; la model card orienta el despliegue a Raspberry Pi 5, Hailo-8L y PCs industriales, no a GPU de escritorio.
- Opciones de despliegue: Ultralytics (PyTorch), ONNX Runtime, Hailo-8L M.2 AI HAT+ y Raspberry Pi 5 (Arm Cortex-A76).
- Latencia y throughput: no disponible en la informacion proporcionada; la model card remite a `evaluation_report.json` para las cifras de latencia, que no se detallan.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de deteccion de defectos en acero, por lo que no es posible establecer una comparativa rigurosa con parametros, contexto, rendimiento, licencia y disponibilidad.

## Limitaciones y advertencias

- Dominio acotado: el modelo solo detecta las siete clases del NEU-DET y no generaliza a otros tipos de defecto o materiales fuera del dominio de entrenamiento.
- Riesgo de falsos positivos y negativos en condiciones de iluminacion, angulo o resolucion distintas de las del dataset; la model card no documenta pruebas de robustez fuera de NEU-DET.
- Sesgos potenciales derivados de la composicion del NEU-DET, que puede no representar la variabilidad real de todas las plantas siderurgicas.
- La model card no detalla el numero de imagenes ni el split de entrenamiento/validacion, lo que limita la reproducibilidad y la evaluacion de la significancia estadistica de las metricas.
- No se documentan tipos de cuantizacion ni resultados tras cuantizacion, algo relevante para despliegue en NPU Hailo-8L.
- El idioma de etiquetas y documentacion es unicamente ingles; no hay soporte multilingue declarado.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del dataset NEU-DET y de la libreria Ultralytics (que tiene su propia licencia AGPL-3.0 para uso comercial en determinados casos) antes de un despliegue en produccion.
- El modelo no sustituye por si solo un sistema de control de calidad certificado; debe integrarse con umbrales de confianza, validacion humana y protocolos de seguridad industrial.

## Enlaces

- Hugging Face: https://huggingface.co/Madhurhit/qualiedge-steel-defect-yolov8n
- Dataset NEU-DET (referencia citada en la model card): no disponible como enlace directo en la informacion proporcionada
- Ultralytics YOLOv8 (libreria base): no disponible como enlace directo en la informacion proporcionada
- Hailo-8L (acelerador de borde citado): no disponible como enlace directo en la informacion proporcionada
