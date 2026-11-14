# fireviewer/yolo26s-flame-smoke-l4

## Resumen

YOLO26s-flame-smoke-l4 es un modelo de deteccion de objetos entrenado con la libreria Ultralytics sobre la arquitectura YOLO26 en su variante "s" (small), especializado en la deteccion de dos clases visuales: llama (flame) y humo (smoke). Lo desarrolla el usuario fireviewer y se publica bajo licencia AGPL-3.0 en Hugging Face. El modelo esta pensado para tareas de vigilancia y alerta temprana de incendios a partir de imagenes.

El entrenamiento se realizo sobre una NVIDIA L4 con imagenes de 928 px de resolucion, empleando el dataset `fireviewer/fireviewer_fire_smoke_flame_v3_native` en una revision concreta. Segun la model card, el proceso se detuvo de forma temprana: se guardo la epoca 1 de 67 y el entrenamiento se interrumpio tras 7 epocas sin mejora, con un mejor AP50-95 de validacion de 0,2735. Esto indica que el modelo es un artefacto en fase inicial de entrenamiento, no un detector maduro listo para produccion.

La relevancia del modelo es acotada: sirve como punto de partida reproducible para deteccion de llama y humo con YOLO26, y como referencia de un pipeline Ultralytics sobre un dataset concreto. No obstante, sus metricas, el numero de epocas efectivas y la ausencia de logs publicados limitan seriamente su uso directo en sistemas criticos de alerta de incendios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26 variante "s" (small), deteccion de objetos, libreria Ultralytics |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | no disponible (se mencionan `best.pt` y `last.pt` en formato PyTorch/Ultralytics) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO26 en su variante small, una familia de detectores de objetos de una sola etapa orientada a inferencia en tiempo real. La libreria declarada es Ultralytics y la tarea es `object-detection` con dos clases: 0 = flame y 1 = smoke. El entrenamiento se ejecuto en una GPU NVIDIA L4 con imagenes redimensionadas a 928 px.

El dataset de entrenamiento es `fireviewer/fireviewer_fire_smoke_flame_v3_native`, en la revision `f75e49bf507a365a0b6b030f96868c014855aa49`. Segun la model card, las imagenes nuevas recolectadas se integran en el conjunto de entrenamiento conservando sus anotaciones actuales, y no se aplicaron las propuestas experimentales de la auditoria DINO/SAM/Qwen. El entrenamiento se detuvo en la epoca 1 de 67 guardada, con parada temprana tras 7 epocas sin mejora; el mejor AP50-95 de validacion fue 0,2735206797577182. No se publican el numero total de tokens ni la composicion detallada del dataset, ni se menciona uso de RLHF/DPO (no aplicable a un detector).

## Capacidades

- Deteccion de objetos en imagenes con dos clases: llama (flame) y humo (smoke).
- Salida de cajas delimitadoras con puntuaciones de confianza por clase, segun el formato estandar de Ultralytics.
- Inferencia sobre imagenes de hasta 928 px de resolucion de entrenamiento (el modelo puede procesar otras resoluciones, pero no se documenta el comportamiento).
- Integracion con el ecosistema Ultralytics (carga via `ultralytics`, exportacion a formatos habituales como ONNX o TensorRT, no confirmada en la model card).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un detector visual, no un modelo de lenguaje.
- No tiene capacidades multilingues ni de generacion de texto.
- No dispone de modo thinking, vision multimodal generativa ni audio.

## Casos de uso

- Prototipado de alerta temprana de incendios: el modelo puede ejecutarse sobre frames de camaras fijas para generar candidatos de llama y humo, aunque su AP50-95 de 0,2735 exige validacion adicional antes de cualquier despliegue real.
- Filtrado previo en pipelines de videovigilancia: usar el detector como primera etapa para descartar frames sin llama ni humo y reducir la carga de un segundo modelo mas costoso.
- Etiquetado asistido: emplear las detecciones como preanotaciones para acelerar el etiquetado humano de nuevos conjuntos de imagenes de incendios.
- Investigacion sobre YOLO26: servir como referencia reproducible de un entrenamiento Ultralytics sobre un dataset concreto con hiperparametros y revision documentados.
- Pruebas de integracion en edge: al ser una variante small, es candidato para desplegarse en dispositivos con recursos limitados, previa exportacion y cuantizacion (no documentadas en la model card).
- Benchmark interno de deteccion de humo y llama: comparar futuras iteraciones del mismo dataset contra este punto de partida con AP50-95 de 0,2735.

## Benchmarks y rendimiento

La model card solo reporta una metrica global de validacion. No se publican resultados por clase ni comparaciones con otros modelos.

| Metrica | Valor |
|---|---|
| Best validation AP50-95 | 0,2735206797577182 |
| Epoca guardada | 1 / 67 |
| Parada temprana | tras 7 epocas sin mejora |

No se han publicado resultados de benchmarks adicionales (mAP por clase, precision, recall, latencia) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser una variante small de YOLO26, la huella es reducida, pero no se documenta el consumo concreto.
- GPU de entrenamiento documentada: NVIDIA L4.
- GPU recomendadas para inferencia: no disponible; por el tamano del modelo, es plausible su uso en GPUs consumer, pero no se confirma en la model card.
- Cabida en GPU consumer: no confirmado.
- Opciones de despliegue: libreria Ultralytics; exportacion a otros formatos (ONNX, TensorRT, OpenVINO) no documentada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Parametros | Contexto | AP50-95 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yolo26s-flame-smoke-l4 | no disponible | no aplica | 0,2735 | AGPL-3.0 | Hugging Face |
| Alternativas de deteccion de llama/humo | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenamiento incompleto: solo se guardo la epoca 1 de 67 y se aplico parada temprana tras 7 epocas sin mejora, lo que sugiere un modelo infraentrenado.
- AP50-95 de validacion bajo (0,2735), insuficiente para sistemas criticos de alerta de incendios sin validacion adicional.
- No se publican logs de entrenamiento ni imagenes de entrenamiento, lo que dificulta la reproducibilidad y la auditoria del proceso.
- No se documentan metricas por clase (flame y smoke), por lo que se desconoce el rendimiento desagregado.
- Riesgo de falsos negativos y positivos en condiciones visuales no representadas en el dataset (iluminacion, clima, sensores).
- Sesgos potenciales derivados de la composicion del dataset `fireviewer_fire_smoke_flame_v3_native`, no documentada.
- Licencia AGPL-3.0: impone obligaciones de copyleft sobre el codigo derivado y su distribucion en red; revisar compatibilidad antes de uso comercial propietario.
- No apto para procesamiento de lenguaje, agentes ni tareas multimodales generativas.
- Ausencia de documentacion sobre cuantizacion y exportacion, lo que limita la planificacion de despliegues en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fireviewer/yolo26s-flame-smoke-l4
- Dataset: https://huggingface.co/datasets/fireviewer/fireviewer_fire_smoke_flame_v3_native
- Libreria Ultralytics: https://github.com/ultralytics/ultralytics
- Documentacion de Ultralytics: https://docs.ultralytics.com/
