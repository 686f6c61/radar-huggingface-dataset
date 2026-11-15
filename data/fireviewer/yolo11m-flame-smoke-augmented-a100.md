# fireviewer/yolo11m-flame-smoke-augmented-a100

## Resumen

YOLO11M flame/smoke augmented es un modelo de deteccion de objetos basado en la arquitectura YOLO11 en su variante M (medium) de Ultralytics, especializado en la deteccion de dos clases: llama (flame) y humo (smoke). Lo desarrolla el usuario fireviewer y se distribuye bajo licencia AGPL-3.0. El modelo se entrena sobre el dataset `fireviewer/fireviewer_fire_smoke_flame_v3_native` y esta pensado para tareas de vision artificial orientadas a la deteccion temprana de incendios en imagenes.

El entrenamiento se realizo sobre una GPU NVIDIA A100 con imagenes de 928 px de resolucion. El modelo parte de un checkpoint previo (`fireviewer/yolo11m-flame-smoke-resume-a100`) tras 46 epocas completadas y continua el entrenamiento conservando pesos, estado del optimizador AdamW y EMA, con la misma tasa de aprendizaje. El conjunto de entrenamiento consta de 105 655 imagenes y el de validacion de 11 266, quedando el test reservado.

La relevancia de este modelo radica en su aplicacion directa a sistemas de alerta temprana de incendios, donde la deteccion de llama y humo en tiempo real puede integrarse en pipeline de videovigilancia. Su naturaleza de checkpoint intermedio (epoca 48 de 300, con mejor AP50-95 de validacion de 0.3918) lo situa como un modelo en desarrollo mas que como un producto finalizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11 (variante M, deteccion de objetos) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision, sin capacidades linguisticas) |
| Licencia | AGPL-3.0 |
| Formato de pesos | no disponible (repo de 0.6 GB, probablemente `.pt` de Ultralytics) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO11 de Ultralytics en su variante medium, una red de deteccion de objetos de una sola etapa basada en un backbone convolucional con modulos de atencion y un cabezal de deteccion anclado. La resolucion de entrada durante el entrenamiento fue de 928 px. Se trata de un modelo puramente de vision, sin componentes de lenguaje ni contexto textual.

El entrenamiento se realizo sobre NVIDIA A100 partiendo del checkpoint `fireviewer/yolo11m-flame-smoke-resume-a100` tras 46 epocas, conservando pesos, estado de AdamW y EMA, y manteniendo la tasa de aprendizaje. El dataset contiene 105 655 imagenes de entrenamiento y 11 266 de validacion, con 566 imagenes de siete ZIP humanos muestreadas con un peso relativo de 5. Se aplicaron augmentations sobre el conjunto de entrenamiento: rotacion de ±8 grados, cizalladura de ±1 grado, ajuste HSV (H=0.02, S=0.75, V=0.45), volteo horizontal al 50 % y vertical al 10 %, estiramiento independiente de ejes entre 0.85 y 1.15 en el 35 % de los casos, y conversion a blanco y negro de tres canales en el 15 % de los casos. Las cajas siguen las transformaciones geometricas. Validacion y test se mantienen sin augmentations. El entrenamiento se detuvo tras 7 epocas sin mejora, con la ultima epoca completamente guardada en la 48 de 300.

## Capacidades

- Deteccion de objetos en imagenes con dos clases: llama (clase 0) y humo (clase 1).
- Deteccion sobre imagenes de hasta 928 px de resolucion de entrada.
- Robusto a transformaciones geometricas y fotometricas gracias al esquema de augmentations aplicado durante el entrenamiento (rotacion, cizalladura, cambios HSV, volteos, estiramientos y escala de grises).
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni razonamiento multi-paso.
- No dispone de capacidades multilingues ni de generacion de texto.
- No dispone de modo thinking, vision multimodal ni audio.

## Casos de uso

- Deteccion temprana de incendios en videovigilancia: el modelo puede procesar fotogramas de camaras de seguridad para identificar llama y humo, permitiendo activar alertas antes de que el fuego se propague. Su resolucion de entrenamiento de 928 px lo hace adecuado para imagenes de camaras con detalle medio-alto.
- Monitorizacion de areas forestales: integrado en sistemas de torres de vigilancia o drones, el modelo puede analizar imagenes periodicas de zonas boscosas para detectar columnas de humo o focos de llama incipientes.
- Automatizacion de revision de imagenes satelitales o aereas: el modelo puede filtrar grandes volumenes de imagenes para priorizar aquellas con indicios de fuego, reduciendo la carga de revision manual.
- Sistemas de alerta en plantas industriales: deteccion de llama o humo en entornos con riesgo de incendio (almacenes, refinerias, plantas quimicas) a partir de camaras fijas.
- Preprocesado en pipeline de emergencias: el modelo puede actuar como primer filtro en un sistema de gestion de emergencias, clasificando imagenes recibidas y derivando las que contienen llama o humo a operadores humanos.
- Investigacion en vision artificial aplicada a incendios: como checkpoint intermedio con augmentations documentadas y dataset publico, sirve como base para experimentos de fine-tuning o comparacion de estrategias de aumento de datos en deteccion de fuego.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Best validation AP50-95 | 0.3918113755738779 |
| Epoca del mejor checkpoint | 48 (de 300 planificadas) |
| Epocas sin mejora antes de parada | 7 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, al tratarse de un modelo de vision y no de lenguaje. Las metricas detalladas por clase figuran en `metrics.json` del repositorio, pero no se incluyen en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; para un YOLO11M a 928 px se estima un consumo moderado, aunque el dato no esta confirmado en la informacion proporcionada.
- GPU recomendadas: el entrenamiento se realizo en NVIDIA A100; para inferencia, una GPU consumer de gama media-alta es suficiente en la mayoria de casos, aunque no se especifican modelos concretos.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del repo (0.6 GB) y la variante M de YOLO11, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: al usar la libreria Ultralytics, es desplegable mediante el ecosistema Ultralytics (Python), y potencialmente exportable a ONNX, TensorRT u otros formatos, aunque no se detalla en la model card.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fireviewer/yolo11m-flame-smoke-augmented-a100 | no disponible | no aplica | AP50-95 val 0.3918 | AGPL-3.0 | Hugging Face |
| fireviewer/yolo11m-flame-smoke-resume-a100 | no disponible | no aplica | no disponible | no disponible | Hugging Face (checkpoint base) |
| YOLO11M estandar (Ultralytics) | no disponible | no aplica | no disponible | AGPL-3.0 | Ultralytics / Hugging Face |

La comparativa se limita a los modelos del mismo autor y a la variante estandar de YOLO11M, ya que no se dispone de datos de rendimiento de alternativas especializadas en deteccion de llama y humo en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo en estado intermedio: solo se completaron 48 de las 300 epocas planificadas, con parada temprana tras 7 epocas sin mejora. El AP50-95 de validacion de 0.3918 indica margen de mejora considerable.
- Entrenado exclusivamente para dos clases (llama y humo); no detecta otras clases de objetos.
- El dataset de validacion y test no incluye las augmentations del entrenamiento, pero el modelo puede presentar sesgos hacia las condiciones visuales representadas en el conjunto de entrenamiento (iluminacion, angulos, tipos de vegetacion o materiales).
- Riesgo de falsos positivos y falsos negativos en condiciones de iluminacion adversas, humo muy disperso o llama de pequeno tamano, dado el estado temprano del entrenamiento.
- Licencia AGPL-3.0: el uso comercial requiere cumplir con las obligaciones de copyleft de la AGPL, lo que puede limitar su integracion en productos propietarios sin liberar el codigo.
- No se publican logs ni imagenes de entrenamiento, lo que dificulta la reproducibilidad y el diagnostico de fallos.
- No se especifican los idiomas soportados porque el modelo no procesa texto; la fila de idiomas no aplica.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fireviewer/yolo11m-flame-smoke-augmented-a100
- Checkpoint base: https://huggingface.co/fireviewer/yolo11m-flame-smoke-resume-a100
- Dataset: https://huggingface.co/datasets/fireviewer/fireviewer_fire_smoke_flame_v3_native
- Revision del dataset: 69d5af0d15e15ef756caa9160eaf835f36587d81
- Ultralytics (libreria): https://github.com/ultralytics/ultralytics
