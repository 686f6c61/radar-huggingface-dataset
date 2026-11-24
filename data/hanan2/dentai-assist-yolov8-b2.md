# Hanan2/dentai-assist-yolov8-b2

## Resumen

Dental AI Assist B2 es un modelo de deteccion de objetos basado en YOLOv8n (variante nano de Ultralytics), especializado en la identificacion de hallazgos patologicos en radiografias dentales. Lo publica el usuario Hanan2 en Hugging Face como componente del sistema "Dental AI Assist", una plataforma de soporte a la decision clinica para odontologos. El modelo resuelve la tarea de localizar y clasificar cuatro tipos de lesiones dentales en imagenes de rayos X: caries, caries profunda, dientes impactados y lesiones periapicales.

Se trata de un modelo compacto de vision por computador, no de un modelo de lenguaje: no procesa texto ni mantiene conversaciones. Su relevancia radica en que demuestra el uso de arquitecturas de deteccion ligeras (YOLOv8n) aplicadas a dominios medicos especializados con conjuntos de datos pequenos, y en que declara explicitamente su caracter de herramienta de apoyo, no de diagnostico autonomo. El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, y su tamano es practicamente nulo (0.0 GB), lo que sugiere que los pesos pueden no estar publicados o que el repositorio solo contiene metadatos.

La ficha se elabora a partir de la informacion disponible en la model card y en los metadatos de Hugging Face; los datos no presentes se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8n (Ultralytics), detector de objetos de una etapa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | AGPL-3.0 |
| Formato de pesos | no disponible (libreria declarada: ultralytics) |

Otros datos de la model card:

| Parametro | Valor |
|---|---|
| Tarea (pipeline) | object-detection |
| Clases | 0: Caries, 1: Deep Caries, 2: Impacted, 3: Periapical Lesion |
| Dataset de entrenamiento | clean_dental_408 (286 train, 61 validation, 61 test) |
| Imagen de entrada recomendada | 640 px (imgsz) |
| Umbral de confianza recomendado | 0.40-0.45 |
| Umbral IoU recomendado | 0.50-0.55 |
| mAP50 (test) | 0.9717 |
| mAP50-95 (test) | 0.7760 |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-11-23 |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLOv8n de Ultralytics, un detector de objetos de una etapa (single-stage) basado en una red convolutional con backbone tipo CSPDarknet y cabecera de deteccion desacoplada. La variante "n" (nano) es la mas pequena de la familia YOLOv8, disenada para inferencia de baja latencia en hardware modesto. No se dispone de informacion sobre el numero exacto de parametros, la composicion detallada del dataset, el numero de epocas, el regimen de aumentacion de datos ni si se aplicaron tecnicas de ajuste fino adicionales.

El entrenamiento se realizo sobre el conjunto `clean_dental_408`, con 286 imagenes de entrenamiento, 61 de validacion y 61 de test. Se trata de un volumen muy reducido para deteccion de objetos en dominio medico, lo que condiciona la generalizacion del modelo. No se documenta en la informacion disponible el origen de las imagenes, el proceso de anotacion, la distribucion de clases ni si hubo validacion cruzada. Tampoco se indica si se aplicaron tecnicas de aumento de datos especificas para radiografias (por ejemplo, variaciones de contraste o ruido). No se documentan innovaciones tecnicas adicionales mas alla de las propias de YOLOv8.

## Capacidades

- Deteccion de objetos en radiografias dentales con cuatro clases: caries, caries profunda, dientes impactados y lesiones periapicales.
- Localizacion mediante cajas delimitadoras (bounding boxes) sobre la imagen de entrada.
- Inferencia a resolucion de 640 px con umbrales de confianza e IoU configurables.
- Filtrado por clase en la capa de post-procesado o interfaz de usuario para reducir el solapamiento visual de cajas en radiografias densas.
- Orientado a soporte a la decision clinica, no a diagnostico autonomo.
- No dispone de capacidades de generacion de texto, razonamiento linguistico, tool calling, agentes ni procesamiento multilingue, al ser un modelo de vision puro.
- No se documentan capacidades multimodales (vision-lenguaje), audio ni modo de razonamiento explicito.

## Casos de uso

- Triaje asistido en consulta odontologica: el modelo marca sobre la radiografia las regiones sospechosas de caries o lesiones periapicales, y el odontologo revisa y confirma cada hallazgo antes de emitir un diagnostico. Es adecuado por su tarea especifica y su caracter declarado de apoyo.
- Segunda lectura en revision de radiografias de rutina: se ejecuta el detector como comprobacion adicional sobre imagenes ya evaluadas por el profesional, para reducir omisiones en zonas de dificil visualizacion.
- Preanalisis en flujos de imagenologia dental: integracion en un pipeline que recibe la radiografia, ejecuta la inferencia a 640 px y presenta las detecciones filtradas por clase al especialista.
- Docencia y formacion de odontologos: uso del modelo para senalar regiones de interes en casos de ejemplo y discutir la interpretacion de hallazgos con estudiantes, siempre bajo supervision.
- Investigacion en deteccion de patologia dental: punto de partida reproducible (YOLOv8n, dataset de 408 imagenes) para experimentos de comparacion de arquitecturas o de aumento de datos en dominios con pocas muestras.
- Prototipado de aplicaciones de soporte clinico: al ser un modelo nano, puede desplegarse en entornos con recursos limitados para validar una interfaz de usuario de ayuda al diagnostico antes de invertir en modelos mayores.
- Filtrado y priorizacion de estudios en un entorno con volumen: marcado automatico de radiografias con posibles hallazgos para que el profesional las revise primero, con confirmacion humana obligatoria.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible son los de evaluacion sobre el conjunto de test (61 imagenes):

| Metrica | Valor |
|---|---|
| mAP50 | 0.9717 |
| mAP50-95 | 0.7760 |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un detector de objetos. Tampoco se dispone de metricas por clase, matrices de confusion ni curvas precision-recall.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; al tratarse de YOLOv8n, la huella es reducida y cabe holgadamente en GPUs de consumo, aunque no se publican cifras concretas.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por la variante nano, es esperable que funcione en GPUs de gama media y en CPU, pero no se documenta.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano de la variante nano, si bien no se confirma con datos del autor.
- Opciones de despliegue: la libreria declarada es Ultralytics, por lo que el despliegue tipico seria mediante el paquete `ultralytics` (PyTorch). No se documentan exportaciones a ONNX, TensorRT, OpenVINO ni otros formatos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. La model card no incluye comparaciones con otras variantes de YOLOv8 (s, m, l, x) ni con otros detectores medicos. Se indica "no disponible".

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dental AI Assist B2 (YOLOv8n) | no disponible | no aplica | mAP50 0.9717 / mAP50-95 0.7760 (test, 61 imgs) | AGPL-3.0 | Hugging Face (0 descargas) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El propio autor declara que el modelo es estrictamente una ayuda al diagnostico y que un odontologo cualificado debe revisar y confirmar todos los hallazgos. No debe usarse como diagnostico autonomo.
- El conjunto de test es muy pequeno (61 imagenes), por lo que las metricas publicadas tienen alta varianza y no garantizan generalizacion a otras poblaciones, equipos de rayos X o protocolos de adquisicion.
- El conjunto de entrenamiento (286 imagenes) es reducido para deteccion en dominio medico; existe riesgo de sobreajuste y de peor rendimiento en casos atipicos.
- No se documentan sesgos demograficos ni la composicion del dataset; se desconoce si representa adecuadamente distintos grupos de edad, sexo o condiciones dentales.
- Riesgo de falsos positivos y falsos negativos inherente a la deteccion de objetos; en contexto clinico, ambos tipos de error tienen consecuencias.
- La licencia AGPL-3.0 impone obligaciones de copyleft: si se modifica el modelo o se distribuye como parte de un servicio en red, puede exigirse la publicacion del codigo fuente. Conviene revisar su compatibilidad con el uso comercial previsto.
- El repositorio figura con 0.0 GB y 0 descargas, lo que sugiere que los pesos podrian no estar efectivamente publicados; debe verificarse la disponibilidad real de los ficheros antes de planificar su uso.
- No se documentan limitaciones de idioma porque el modelo no procesa texto.
- No se dispone de informacion sobre calibracion, robustez ante ruido o artefactos de imagen, ni sobre validacion externa en otros conjuntos de datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hanan2/dentai-assist-yolov8-b2
- Ultralytics (framework YOLOv8): https://github.com/ultralytics/ultralytics
- Documentacion de Ultralytics: https://docs.ultralytics.com/
- Licencia AGPL-3.0: https://www.gnu.org/licenses/agpl-3.0.html
