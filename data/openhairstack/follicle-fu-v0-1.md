# openhairstack/follicle-fu-v0.1

## Resumen

follicle-fu-v0.1 es un modelo de deteccion de objetos orientado a la tricoscopia, desarrollado por el colectivo openhairstack como linea base de un proyecto de investigacion abierta sobre analisis capilar. Su tarea consiste en localizar unidades foliculares en imagenes de cuero cabelludo y clasificarlas segun el numero de pelos que contienen (clases `fu1` a `fu5`, donde `fu5` agrupa cinco o mas). Se distribuye bajo licencia Apache 2.0 y esta pensado exclusivamente para investigacion, benchmarking academico y demostraciones educativas, no para diagnostico clinico.

Tecnicamente es una red de deteccion de la familia YOLO, concretamente la variante YOLO11n (nano) con cajas alineadas a los ejes. Se publica en dos formatos: pesos PyTorch (`best.pt`) y un export a ONNX (`model.onnx`) destinado a ejecucion en el navegador mediante ONNX Runtime Web. El entrenamiento se realizo en Google Colab sobre una GPU Tesla T4 durante 60 epocas, con imagenes de 640 px y un lote de 16.

La relevancia del modelo es mas documental que practica: el propio autor publica un analisis honesto en el que las metricas de validacion son practicamente nulas (mAP50 de 0.001 y un recall global del 5 %), lo que convierte esta version en un punto de partida reproducible y en un ejemplo de transparencia sobre limitaciones, mas que en una herramienta lista para produccion. La hoja de ruta anunciada apunta a una v0.2 con mayor resolucion de entrada y cajas orientadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11n (deteccion de objetos, cajas alineadas a los ejes) |
| Parametros totales | no disponible (el autor no publica el recuento del checkpoint; YOLO11n es la variante nano de la familia YOLO11) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (deteccion sobre imagenes) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`best.pt`) y ONNX (`model.onnx`) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO11n en su configuracion de deteccion estandar, con prediccion de cajas delimitadoras alineadas a los ejes. La tarea combina localizacion y clasificacion en cinco clases discretas segun el numero de pelos por unidad folicular (`fu1` = 1 pelo, `fu2` = 2 pelos, `fu3` = 3, `fu4` = 4 y `fu5` = 5 o mas). El entrenamiento se llevo a cabo en Google Colab sobre una Tesla T4, con 60 epocas, resolucion de entrada de 640 px, tamano de lote de 16 y semilla fijada a 0 para reproducibilidad.

El conjunto de datos, `follicle-v0.1`, consta de 688 imagenes tricoscopicas originales bajo licencia CC BY 4.0, procedentes del dataset `ranaudio/hair-follicle-detection-gjgak` alojado en Roboflow Universe. No se menciona el uso de tecnicas de ajuste por refuerzo ni de preferencias humanas (RLHF/DPO), algo coherente con una tarea de vision supervisada. La division de validacion comprende 122 imagenes y 1.013 instancias anotadas.

## Capacidades

- Deteccion de unidades foliculares en imagenes de tricoscopia (localizacion de cajas delimitadoras).
- Clasificacion del recuento de pelos por unidad en cinco categorias (`fu1` a `fu5`).
- Export a ONNX para inferencia en el lado del cliente dentro del navegador mediante ONNX Runtime Web.
- Ejecucion en entornos ligeros, incluida la inferencia en CPU, gracias al tamano reducido de la variante nano.
- Soporte de tool calling, function calling o agentes: no disponible (modelo de vision, sin interfaz de lenguaje).
- Razonamiento multi-paso, capacidades multilingues, modo de pensamiento, vision-lenguaje o audio: no disponible.

## Casos de uso

- Investigacion academica sobre analisis capilar: el modelo sirve como linea base reproducible para comparar futuras versiones o metodos alternativos en tareas de deteccion de unidades foliculares, dado que el autor documenta la procedencia de los datos y las metricas de validacion.
- Benchmarking de deteccion de objetos en dominios medicos: util para estudiar el comportamiento de arquitecturas YOLO en imagenes con clases muy desbalanceadas y objetos de escala microscopica.
- Demostraciones educativas: su export a ONNX permite ilustrar el ciclo completo de entrenamiento, exportacion e inferencia en navegador sin infraestructura de servidor.
- Pruebas de integracion en cliente web: valida el flujo de carga de un modelo ONNX en el navegador para prototipos de analisis de imagen en tiempo real.
- Desarrollo del pipeline de datos de openhairstack: sirve para verificar la cadena de anotacion, versionado de datasets y publicacion de modelos del proyecto.
- Punto de partida para reentrenamiento: dado que las metricas son casi nulas, un equipo puede reutilizar la configuracion de entrenamiento como plantilla y corregir el desbalance de clases y la resolucion.
- Prototipado de herramientas no clinicas de bienestar capilar: siempre que se respete la advertencia explicita de que el modelo no es apto para diagnostico ni triaje medico.

## Benchmarks y rendimiento

Datos publicados por el autor sobre el conjunto de validacion (122 imagenes, 1.013 instancias):

| Metrica | Valor |
|---|---|
| mAP50 | 0.001 |
| mAP50-95 | 0.000 |
| Precision | 0.001 |
| Recall | 0.050 |

Rendimiento por clase:

| Clase | Etiqueta | mAP50-95 | Precision | Recall | Instancias de validacion |
|---|---|---|---|---|---|
| `fu1` | 1 pelo | 0.000 | 0.000 | 0.000 | 277 |
| `fu2` | 2 pelos | 0.001 | 0.004 | 0.249 | 587 |
| `fu3` | 3 pelos | 0.000 | 0.000 | 0.000 | 133 |
| `fu4` | 4 pelos | 0.000 | 0.000 | 0.000 | 15 |
| `fu5` | 5+ pelos | 0.000 | 0.000 | 0.000 | 1 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible. Los valores anteriores reflejan un rendimiento practicamente nulo en deteccion, con un unico resultado apreciable en el recall de la clase mayoritaria `fu2` (0.249).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Por la naturaleza de la variante nano de YOLO11 y una entrada de 640 px, la inferencia cabe holgadamente en GPUs de gama baja o incluso en CPU, aunque el autor no publica cifras.
- GPU recomendadas: no especificadas por el autor. El entrenamiento se realizo en una GPU Tesla T4, lo que sugiere que cualquier GPU con prestaciones equivalentes o superiores es suficiente para reentrenar.
- GPU de consumo: es razonable esperar que quepa en GPUs de consumo (por ejemplo, series RTX xx60 o superiores), aunque no hay cifras publicadas que lo confirmen.
- Opciones de despliegue: PyTorch (carga directa de `best.pt`) y ONNX Runtime Web para inferencia en navegador. No se mencionan vLLM, llama.cpp, Ollama ni TGI, ya que no son aplicables a un modelo de vision de este tipo.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia ni de imagenes por segundo.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion proporcionada. A continuacion se indica el contexto de categoria sin cifras inventadas:

| Modelo | Arquitectura | Tarea | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| follicle-fu-v0.1 | YOLO11n | Deteccion de unidades foliculares | 640 px | Apache 2.0 | HuggingFace (PyTorch + ONNX) |
| Alternativas de deteccion capilar | no disponible | Deteccion de unidades foliculares | no disponible | no disponible | no disponible |
| Variantes generalistas YOLO (YOLO11n/YOLOv8n sin ajuste) | YOLO | Deteccion generica de objetos | configurable | AGPL-3.0 (Ultralytics) | repositorios publicos |

No se han encontrado en la informacion proporcionada modelos comparables especificos de deteccion de unidades foliculares con los que contrastar metricas.

## Limitaciones y advertencias

- Rendimiento casi nulo: mAP50 de 0.001 y precision de 0.001 en validacion; el modelo no es funcional para ninguna aplicacion real de deteccion fiable.
- Desbalance de clases severo: el entrenamiento esta dominado por unidades de 2 pelos (`fu2`), donde se concentra el unico recall apreciable (0.249); las clases `fu3`, `fu4` y `fu5` son extremadamente escasas y no se detectan.
- Limitacion de resolucion: los foliculos en recortes de 640 px son microscopicos, lo que degrada la deteccion; el autor senala que la v0.2 probara resoluciones de 1280 px y cajas orientadas (`yolo11n-obb`).
- Falta de diversidad en los datos: las 688 imagenes no cubren toda la variedad de patrones de rizo, pelo canoso ni tonos de piel Fitzpatrick, lo que puede introducir sesgos y limitar la generalizacion.
- Restriccion de uso: no apto para diagnostico clinico, triaje medico ni planificacion quirurgica. El proyecto incluye un aviso medico (`scalp-analyzer/MEDICAL_DISCLAIMER.md`) que debe respetarse.
- Licencia: el modelo se publica bajo Apache 2.0, permisiva para uso comercial, pero el dataset de origen esta bajo CC BY 4.0 y requiere atribucion. El estado "research-only" aparece en las etiquetas de la model card, por lo que conviene revisar las condiciones antes de cualquier uso comercial.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos o detecciones espurias dada la baja precision.
- Privacidad: el autor declara que el conjunto de entrenamiento no contiene datos identificables de pacientes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/openhairstack/follicle-fu-v0.1
- Dataset `follicle-v0.1`: openhairstack/follicle-v0.1
- Dataset de origen en Roboflow Universe: `ranaudio/hair-follicle-detection-gjgak` (CC BY 4.0)
- Documentacion de procedencia de datos: https://github.com/openhairstack/data-pipeline/blob/main/DATASETS.md
- Aviso medico del proyecto: `scalp-analyzer/MEDICAL_DISCLAIMER.md`
- Discusiones en GitHub: https://github.com/orgs/openhairstack/discussions
- Contacto en X: https://x.com/salik
