# fireviewer/yolo11m-flame-smoke-resume-a100

## Resumen

YOLO11M flame/smoke resume es un modelo de deteccion de objetos basado en la arquitectura YOLO11 de Ultralytics, ajustado para la deteccion de llamas y humo en imagenes. Lo publica el usuario `fireviewer` en Hugging Face y esta entrenado sobre el dataset propio `fireviewer/fireviewer_fire_smoke_flame_v3_native`, con dos clases: `flame` (indice 0) y `smoke` (indice 1). El modelo se enmarca en el pipeline de deteccion temprana de incendios, un caso de uso donde la latencia y la capacidad de ejecucion en hardware modesto son criticas.

El entrenamiento se realizo con Ultralytics sobre una NVIDIA A100 con imagenes redimensionadas a 928 px, un tamano de entrada superior al estandar de 640 px de la familia YOLO, lo que favorece la deteccion de objetos pequenos como columnas de humo lejano o llamas incipientes. El checkpoint publicado corresponde a la epoca 46 de 300, con un mejor AP50-95 de validacion de 0,3918 y parada temprana tras 7 epocas sin mejora.

Se trata de un modelo en estado intermedio de entrenamiento y con metricas modestas, no de un detector de produccion consolidado. Su interes radica en ser un punto de partida reproducible y abierto (licencia AGPL-3.0) para pipelines de vision aplicados a incendios forestales o industriales, y en documentar de forma transparente el estado exacto del checkpoint y del dataset empleado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11 (Ultralytics), detector de objetos de una etapa |
| Parametros totales | no disponible (variante M de YOLO11; el autor no publica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (formato nativo PyTorch `.pt`; no se documentan exportaciones ONNX, TensorRT ni INT8) |
| Idiomas soportados | no aplica (modelo de vision; las clases son `flame` y `smoke`) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`.pt`, checkpoints `best.pt` y `last.pt`) |
| Tamano de entrada | 928 px (resolucion de entrenamiento) |
| Clases | 2 (`0 = flame`, `1 = smoke`) |
| Tamano del repositorio | 0,8 GB |
| Biblioteca | Ultralytics |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO11 en su variante de tamano M, un detector de objetos de una sola etapa con backbone y cuello convolucionales y cabecera de prediccion densa. YOLO11 introduce mejoras respecto a versiones anteriores de la familia en eficiencia de parametros y en el modulo de atencion C3k2, aunque la model card no detalla la configuracion exacta de capas ni el recuento de parametros de esta variante concreta.

El entrenamiento se ejecuto con el framework Ultralytics sobre una NVIDIA A100, con imagenes a 928 px, durante al menos 46 epocas de un plan de 300. El dataset es `fireviewer/fireviewer_fire_smoke_flame_v3_native`, en la revision `f75e49bf507a365a0b6b030f96868c014855aa49`. Segun la model card, las imagenes nuevas recolectadas se incorporaron al conjunto de entrenamiento conservando sus anotaciones actuales, y no se aplicaron las propuestas experimentales de la auditoria DINO/SAM/Qwen. El mejor AP50-95 de validacion alcanzado fue 0,3918113755738779, y el entrenamiento se detuvo tras 7 epocas sin mejora. No se documentan tecnicas de aumento de datos, composicion exacta del dataset, numero de imagenes ni estrategia de validacion mas alla de la metrica AP.

## Capacidades

- Deteccion de objetos en imagenes con dos clases: llama (`flame`) y humo (`smoke`).
- Localizacion mediante cajas delimitadoras con puntuaciones de confianza por clase.
- Inferencia a resolucion de 928 px, adecuada para objetos pequenos o distantes.
- Integracion nativa con la libreria Ultralytics (carga via `YOLO(...)`, prediccion, validacion y exportacion a otros formatos si se desea).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un detector puro, sin componente generativo.
- No dispone de capacidades multilingues, de vision-lenguaje ni de audio.
- No incorpora modo de razonamiento (thinking mode) ni salida textual.

## Casos de uso

- Vigilancia de incendios forestales: el modelo puede procesarse sobre fotogramas de camaras de torre o satelite para generar alertas tempranas de columnas de humo, aprovechando la resolucion de 928 px para detectar focos lejanos.
- Monitorizacion industrial de plantas y almacenes: deteccion de llama o humo en camaras fijas de circuito cerrado para disparar protocolos de evacuacion o extincion automatica.
- Preprocesado en pipelines de drones: integracion en el bucle de inferencia de un dron de reconocimiento para marcar regiones de interes antes de un analisis mas costoso.
- Etiquetado asistido: uso del modelo como preanotador en herramientas de anotacion, reduciendo el trabajo manual en la construccion de nuevos datasets de fuego y humo.
- Investigacion en vision aplicada a desastres: punto de partida reproducible (licencia AGPL-3.0, dataset y revision documentados) para comparar arquitecturas o estrategias de aumento de datos.
- Filtrado de falsos positivos en sistemas existentes: como segunda etapa o ensemble junto a detectores mas ligeros para confirmar candidatos en imagenes de alta resolucion.
- Prototipado rapido en entornos Ultralytics: validacion de la viabilidad de un caso de uso antes de invertir en un entrenamiento completo a 300 epocas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Mejor AP50-95 (validacion) | 0,3918113755738779 |
| Epoca del mejor checkpoint | 46 de 300 (parada temprana tras 7 sin mejora) |
| Resolucion de entrenamiento | 928 px |
| Metricas por clase | disponibles en `metrics.json` del repositorio (no reproducidas aqui) |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que se trata de un detector de objetos y no de un modelo de lenguaje. No se dispone de cifras de mAP desglosadas por clase ni de comparaciones con otros detectores de la misma tarea en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; para una variante M de YOLO11 a 928 px se situa tipicamente en el rango de 2 a 4 GB en FP16, aunque el autor no publica mediciones.
- GPU recomendadas: el entrenamiento se realizo en NVIDIA A100; para inferencia basta con GPUs consumer modernas (RTX 3060 en adelante) o incluso CPU para baja frecuencia de fotogramas.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU con 4 GB o mas de VRAM, aunque no se documenta la medicion exacta.
- Opciones de despliegue: Ultralytics (Python), exportacion a ONNX, TensorRT u OpenVINO mediante la propia libreria; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector de vision.
- Latencia y throughput: no disponibles; el autor no publica mediciones de FPS ni de tiempo por inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yolo11m-flame-smoke-resume-a100 (este) | no disponible (variante M) | 928 px | AP50-95 = 0,3918 en validacion | AGPL-3.0 | Hugging Face |
| YOLO11m base (Ultralytics) | no disponible en esta ficha | 640 px por defecto | no comparable directamente (clases COCO) | AGPL-3.0 | Ultralytics / Hugging Face |
| YOLOv8m (Ultralytics) | no disponible en esta ficha | 640 px por defecto | no comparable directamente (clases COCO) | AGPL-3.0 | Ultralytics / Hugging Face |
| Detector especifico de fuego/humo alternativo | no disponible | no disponible | no disponible | variable | variable |

No se dispone de datos de benchmarks comparables entre este modelo y alternativas de la misma tarea en la informacion proporcionada; la comparativa se limita a la familia YOLO de Ultralytics por proximidad arquitectonica, sin cifras de rendimiento equiparables.

## Limitaciones y advertencias

- Checkpoint intermedio: solo 46 de 300 epocas y AP50-95 de 0,3918, lo que indica un rendimiento modesto y probablemente insuficiente para produccion sin reentrenamiento o ajuste.
- Parada temprana tras 7 epocas sin mejora: el modelo puede estar infraentrenado o haber alcanzado un minimo local; no se documenta la causa.
- Sin metricas por clase publicadas en la model card: el desglose esta en `metrics.json`, pero no se resume en el README, lo que dificulta evaluar el equilibrio entre `flame` y `smoke`.
- Riesgo de falsos positivos y negativos: la deteccion de humo es especialmente propensa a confundirse con nubes, niebla o vapor; no se documentan pruebas de robustez.
- Sesgos del dataset: el modelo hereda los sesgos de `fireviewer_fire_smoke_flame_v3_native` (composicion, geografia, condiciones de iluminacion y camara no documentadas).
- Licencia AGPL-3.0: el uso comercial en servicios en red obliga a liberar el codigo fuente derivado; es una restriccion relevante para integraciones en producto.
- Sin soporte multilingue ni de lenguaje: no es un modelo conversacional; cualquier capa de explicacion o alerta debe construirse por separado.
- Sin garantias de mantenimiento: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se documenta hoja de ruta ni soporte del autor.
- No se publican logs ni imagenes de entrenamiento, lo que limita la reproducibilidad y la auditoria del proceso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fireviewer/yolo11m-flame-smoke-resume-a100
- Dataset: https://huggingface.co/datasets/fireviewer/fireviewer_fire_smoke_flame_v3_native (revision `f75e49bf507a365a0b6b030f96868c014855aa49`)
- Documentacion de Ultralytics YOLO11: https://docs.ultralytics.com/models/yolo11/
- Repositorio de Ultralytics: https://github.com/ultralytics/ultralytics
- Licencia AGPL-3.0: https://www.gnu.org/licenses/agpl-3.0.html
