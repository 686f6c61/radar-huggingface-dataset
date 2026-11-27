# KimOoO22/m3-fog-gate

## Resumen

M3 Fog Gate es un modelo de clasificacion de imagenes de muy pequeno tamano desarrollado por el usuario KimOoO22 y publicado en Hugging Face. Su funcion es actuar como una compuerta ("gate") que estima la densidad de niebla o neblina atmosferica en imagenes RGB de 160x160 pixeles, devolviendo probabilidades sobre cuatro clases (clear, light, medium, heavy) y una puntuacion continua derivada de ellas. Esta pensado como componente auxiliar dentro de un pipeline mayor de vision para conduccion autonoma o asistencia a la conduccion en tiempo real.

El modelo se construye sobre YOLOv8n-cls, la variante de clasificacion mas pequena de la familia YOLOv8 de Ultralytics, lo que lo hace extremadamente ligero y apto para inferencia en tiempo real en hardware modesto. El entrenamiento se realizo generando niebla sintetica mediante un modelo de dispersion atmosferica sobre imagenes diurnas de BDD100K, y la validacion incorpora imagenes reales de niebla del conjunto RTTS, que se mantuvieron fuera del entrenamiento.

La relevancia del modelo es acotada pero especifica: no es un modelo de lenguaje ni un modelo generalista, sino un modulo de fusion multimodal. Segun la model card, su proposito declarado es proporcionar un peso de compuerta que module la fusion entre dos modelos designados como M1 (termico) y M2 (RGB) en el sistema del autor. La informacion publica disponible es muy limitada y el repositorio no contiene pesos visibles (tamano de 0.0 GB), lo que condiciona cualquier evaluacion practica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8n-cls (clasificador CNN, variante nano de YOLOv8) |
| Parametros totales | no disponible (no publicado; YOLOv8n-cls ronda los 1,4-1,5 M de parametros segun Ultralytics, dato no confirmado por el autor) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision; sin capacidades linguisticas) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio figura con 0.0 GB, sin pesos visibles) |

## Arquitectura y entrenamiento

La arquitectura corresponde a YOLOv8n-cls, un clasificador de imagenes convolucional derivado de la red de deteccion YOLOv8 en su escala nano. El modelo recibe entradas RGB de 160x160 pixeles y produce una distribucion de probabilidad sobre cuatro clases de visibilidad atmosferica: clear, light, medium y heavy. A partir de esas probabilidades se calcula una puntuacion continua definida en la model card como `score = 0.33*p(light) + 0.66*p(medium) + 1.0*p(heavy)`, que se emplea como peso de fusion en el sistema M5 del autor.

El entrenamiento se realizo sobre imagenes diurnas de BDD100K a las que se aplico un modelo sintetico de dispersion atmosferica ("atmospheric-scattering fog") para generar ejemplos con distintos niveles de niebla. El conjunto de validacion incorpora imagenes de niebla real del dataset RTTS, excluidas del entrenamiento, lo que permite medir la generalizacion del modelo sintetico a condiciones reales. No se especifican en la informacion disponible el numero de imagenes de entrenamiento, el numero de epocas, la funcion de perdida, ni si hubo aumento de datos adicional mas alla de la generacion de niebla sintetica.

## Capacidades

- Clasificacion de imagenes RGB de 160x160 en cuatro niveles de visibilidad atmosferica (clear, light, medium, heavy).
- Generacion de una puntuacion continua de densidad de niebla para su uso como peso en mecanismos de fusion multimodal.
- Inferencia en tiempo real orientada a sistemas de vision embarcados en vehiculos.
- Actuacion como compuerta de seleccion entre fuentes de imagen (termica y RGB) en el pipeline del autor.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, tool calling, capacidades de agente ni funciones linguisticas.
- No se documentan capacidades multilingues ni modos especiales de inferencia.

## Casos de uso

- Fusion multimodal camara-termica en conduccion: el score continuo permite ponderar dinamicamente la contribucion de la camara RGB frente a la termica cuando la visibilidad se degrada por niebla, mejorando la deteccion en condiciones adversas.
- Sistemas de alerta de visibilidad reducida: el clasificador puede emitir avisos al conductor o al sistema de asistencia cuando la probabilidad de las clases medium o heavy supera un umbral configurable.
- Conmutacion de estrategias de percepcion: en un pipeline ADAS, la salida de cuatro clases puede activar modos de procesamiento distintos (por ejemplo, umbrales de deteccion mas conservadores o uso preferente de sensores alternativos) segun la densidad de niebla estimada.
- Preprocesado en datasets de conduccion: el modelo puede etiquetar automaticamente grandes lotes de imagenes por nivel de niebla para filtrar, estratificar o equilibrar conjuntos de datos de entrenamiento.
- Monitorizacion de flotas y telemetria visual: integrado en un sistema de camaras vehiculares, permite registrar la proporcion de tiempo de conduccion en condiciones de baja visibilidad sin transmitir imagenes completas.
- Control de calidad en pipelines de vision industrial o exterior: como clasificador ligero de visibilidad, puede decidir si una imagen capturada es apta para una tarea posterior (por ejemplo, lectura de matricula o inspeccion) o debe descartarse por niebla.
- Prototipado de investigacion en fusion de sensores: su bajo coste computacional facilita experimentar con esquemas de ponderacion entre modalidades antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la validacion incluye imagenes reales de niebla de RTTS, pero no proporciona metricas (exactitud, F1, matriz de confusion ni latencia).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision FP32 para un modelo de la escala de YOLOv8n-cls; no confirmado por el autor.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1650, RTX 3050, RTX 4060, RTX 4090) es sobradamente suficiente; tambien GPU de datacenter (A100, H100) sin aprovechamiento practico de su capacidad.
- Cabe en cualquier GPU consumer y es viable en CPU e incluso en dispositivos embarcados tipo Jetson Nano o Raspberry Pi con acelerador.
- Opciones de despliegue: Ultralytics (PyTorch), exportacion a ONNX, TensorRT u OpenVINO mediante las herramientas de Ultralytics; no se documenta soporte nativo en vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles; por la escala del modelo se espera latencia de milisegundos en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Clases | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| M3 Fog Gate | no disponible (base YOLOv8n-cls) | 160x160 RGB | 4 niveles de niebla | no disponible | Hugging Face (repo de 0.0 GB) |
| YOLOv8n-cls (Ultralytics) | ~1,4-1,5 M (dato de Ultralytics) | configurable (por defecto 224x224) | 1000 (ImageNet) | AGPL-3.0 / comercial Ultralytics | Ultralytics, ampliamente disponible |
| Clasificadores de niebla basados en ResNet o EfficientNet | variable (millones a decenas de millones) | variable | variable | variable | literatura academica y repositorios |

La comparacion directa es limitada: M3 Fog Gate es un ajuste fino especializado de YOLOv8n-cls para una tarea de cuatro clases, mientras que los clasificadores genericos de ImageNet no cubren la misma taxonomia. No se dispone de datos publicados para comparar rendimiento con alternativas especificas de deteccion de niebla.

## Limitaciones y advertencias

- El repositorio figura con un tamano de 0.0 GB y sin pesos visibles, por lo que no es posible verificar que el modelo sea descargable ni reproducible.
- La licencia no esta declarada, lo que impide determinar si el uso comercial es legalmente viable; ademas, la base YOLOv8 de Ultralytics esta sujeta a AGPL-3.0 o a licencia comercial, lo que condiciona la distribucion.
- El entrenamiento se basa en niebla sintetica generada sobre BDD100K; aunque la validacion incluye RTTS real, no se publican metricas que confirmen la generalizacion.
- El modelo solo cubre imagenes diurnas (BDD100K diurno) y una resolucion fija de 160x160, lo que limita su uso con otras condiciones de iluminacion o resoluciones sin reentrenamiento.
- Es un clasificador de cuatro niveles; no proporciona profundidad, visibilidad en metros ni mapas de densidad, solo una etiqueta y un score agregado.
- Riesgo de falsos negativos en niebla muy densa o en fenomenos distintos (lluvia, nieve, deslumbramiento) no representados en el entrenamiento.
- No hay informacion sobre sesgos demograficos o geograficos del dataset base; BDD100K tiene una distribucion geografica concreta que puede no representar otras regiones.
- No debe interpretarse como un sistema de seguridad certificado para conduccion autonoma; es un componente auxiliar sin validacion funcional publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KimOoO22/m3-fog-gate
- Ultralytics YOLOv8 (arquitectura base): https://github.com/ultralytics/ultralytics
- Documentacion de YOLOv8 de Ultralytics: https://docs.ultralytics.com/models/yolov8/
- Dataset BDD100K: https://bdd-data.berkeley.edu/
- Dataset RTTS (dentro de RESIDE): https://sites.google.com/view/reside-dehaze-datasets
