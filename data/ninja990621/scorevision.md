# ninja990621/ScoreVision

## Resumen

ScoreVision es un detector de objetos ONNX publicado por el usuario ninja990621 para el elemento `manako/Detect-room-dirtiness-detection` de la subred Score (SN44) de Bittensor. Se trata de un modelo YOLO11n especializado en detectar cinco clases de suciedad en habitaciones: derrames de líquido, papeleras, basura, moho y manchas. El modelo no es un modelo de lenguaje ni un transformer generativo, sino un detector de cajas (box-only head) con entrada de 640x640 píxeles.

El modelo se construye mediante un ensemble en el espacio de pesos (WiSE-FT) de dos modelos públicos con el mismo punto de partida: el baseline de Manako (YOLO11n-seg, peso 0,25) y un fine-tune completo del mismo (Targaryen101/dirtiness_01, peso 0,75). La innovación principal no está en la arquitectura sino en el post-procesado: una regla de "una caja por objeto" que elimina cajas anidadas al menos un 70% dentro de otra de la misma clase con score comparable, alineándose con el etiquetado de Score.

Es relevante ahora porque ejemplifica el ecosistema de modelos competitivos en subredes de Bittensor, donde el rendimiento se mide con scorers propios y los participantes optimizan contra validaciones públicas. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo es de 0,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11n (detector, box-only head) exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, entrada 640x640 px) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX; ejecución en CPU con onnxruntime) |
| Idiomas soportados | no disponible (no es modelo de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (`model.onnx`) |

## Arquitectura y entrenamiento

La arquitectura es un detector YOLO11n con cabeza de solo cajas (sin rama de segmentación en la salida final), entrada de 640x640 y exportación a ONNX. La inferencia se realiza con onnxruntime en CPU con 2 hilos, usando preprocesado letterbox con numpy y OpenCV, lo que garantiza que el pipeline de cumplimiento en CPU de Score produzca las mismas cajas.

El entrenamiento no es desde cero: los pesos son un ensemble WiSE-FT de dos modelos públicos que comparten origen. Se reconstruyeron ambos ficheros ONNX como checkpoints de PyTorch que los reproducen exactamente y se mezclaron cada par Conv+BN en su forma fusionada (folded) según θ = θ_baseline + 0,75 · (θ_finetune − θ_baseline). En la convolución de clasificación final, la fila correspondiente a "liquid spillage" se toma al 50/50 entre el baseline y el blend. No se usaron imágenes de test de Score para entrenamiento; las imágenes públicas se emplearon solo para elegir el ratio de mezcla y los umbrales. El post-procesado aplica umbrales de 0,25 por clase (0,35 para stain) y NMS por clase, más la regla de una caja por objeto.

## Capacidades

- Detección de objetos en imágenes de habitaciones con cinco clases: liquid spillage (0), bin (1), litter (2), mould (3) y stain (4).
- Salida de cajas delimitadoras con score por clase (sin máscaras de segmentación en la salida final).
- Inferencia en CPU con onnxruntime (2 hilos), reproducible respecto al pipeline de Score.
- Post-procesado con umbrales por clase y NMS por clase.
- Regla de supresión de cajas anidadas (una caja por objeto) para alinear con el etiquetado de Score.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un detector de visión puro.

## Casos de uso

- Inspección automatizada de limpieza en alojamientos: el detector procesa fotogramas de habitaciones y devuelve cajas de derrames, basura, moho y manchas para priorizar tareas de limpieza.
- Validación de calidad en subredes Bittensor: sirve como referencia de implementación para mineros que compiten en el elemento `manako/Detect-room-dirtiness-detection` de SN44, ya que reproduce el pipeline de Score en CPU.
- Monitorización de espacios comunes en edificios: integrado en cámaras fijas, detecta acumulación de basura o papeleras y manchas con umbrales ajustados por clase.
- Auditoría de mantenimiento en hostelería: el modelo identifica moho y manchas con umbral más estricto (0,35) para reducir falsos positivos en superficies.
- Pipeline de etiquetado asistido: las cajas generadas pueden servir como preanotaciones para revisión humana en datasets de suciedad, aplicando la regla de una caja por objeto.
- Despliegue en dispositivos sin GPU: al ejecutarse en ONNX con onnxruntime en CPU (2 hilos), es adecuado para entornos edge o servidores sin acelerador.
- Evaluación comparativa de detectores: útil como baseline reproducible para medir mejoras de fine-tuning sobre YOLO11n en tareas de detección de suciedad.

## Benchmarks y rendimiento

Los resultados publicados en la model card usan el scorer por imagen propio de Score, con claves de respuesta reconstruidas a partir de los veredictos públicos por minero.

| Modelo | 14 tests públicos bien fijados | 31 tests públicos | 962 imágenes generadas propias (etiquetas SAM3) |
|---|---|---|---|
| Baseline (ejecutado como las copias públicas) | 0,533 | 0,460 | 0,324 |
| v2 (blend, umbral 0,25 plano) | 0,551 | 0,502 | 0,368 |
| v3 (esta release) | 0,567 | 0,515 | 0,373 |

La regla de una caja por objeto se evaluó sobre las 962 imágenes generadas: mejoró 103 imágenes y empeoró 14. No se han publicado resultados de benchmarks estándar (COCO, MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el pipeline documentado, que ejecuta en CPU con onnxruntime; no se especifica requisito de GPU.
- GPU recomendadas: no disponible; el autor no documenta uso de GPU.
- Cabe en GPU consumer: no disponible; al ser un YOLO11n de entrada 640x640, es plausible en GPUs consumer, pero no se confirma en la información proporcionada.
- Opciones de despliegue: onnxruntime en CPU (2 hilos) con preprocesado numpy/OpenCV, tal como documenta el autor; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Licencia | Contexto/Clases | Disponibilidad |
|---|---|---|---|---|---|
| ScoreVision (este) | YOLO11n ONNX, box-only | 640x640 | AGPL-3.0 | 5 clases de suciedad | HuggingFace (0 descargas) |
| manako/Detect-room-dirtiness-detection | YOLO11n-seg | no disponible | AGPL-3.0 | 5 clases (baseline) | HuggingFace |
| Targaryen101/dirtiness_01 | YOLO11n-seg fine-tune | no disponible | AGPL-3.0 | 5 clases | HuggingFace |

Los tres modelos comparten origen y licencia; ScoreVision se distingue por el ensemble WiSE-FT, la cabeza box-only y el post-procesado de una caja por objeto. No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Es un detector de visión especializado en cinco clases de suciedad; no es un modelo de lenguaje ni sirve para tareas generativas.
- Riesgo de falsos positivos y negativos en clases visualmente ambiguas (moho frente a manchas); los umbrales están ajustados al scorer de Score y pueden no generalizar a otros dominios.
- La regla de una caja por objeto puede eliminar detecciones legítimas en objetos solapados; el autor reporta que empeoró 14 de 962 imágenes en su validación.
- Licencia AGPL-3.0: impone obligaciones de copyleft para uso en red; revisar implicaciones antes de uso comercial o en servicios SaaS.
- El modelo se ha optimizado contra los tests públicos de Score; el rendimiento en imágenes fuera de esa distribución puede degradarse (0,373 en imágenes propias frente a 0,567 en tests bien fijados).
- No se documentan sesgos demográficos ni de otro tipo, ni limitaciones idiomáticas (no aplica).
- Repositorio con 0 descargas y 0 likes: sin evidencia de uso comunitario ni mantenimiento continuado.
- Fecha de creación registrada en 2026-10-29, posterior a la fecha habitual de consulta; verificar la vigencia del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ninja990621/ScoreVision
- Baseline Manako: https://huggingface.co/manako/Detect-room-dirtiness-detection
- Fine-tune Targaryen101: https://huggingface.co/Targaryen101/dirtiness_01
