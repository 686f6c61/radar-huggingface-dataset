# huseyincavus/tr-abdomen-rad-weights

## Resumen

TR-ABDOMEN-RAD es un detector de objetos de una etapa construido sobre la arquitectura YOLO26-S-P2 de Ultralytics, publicado por el usuario huseyincavus en HuggingFace. No es un modelo de lenguaje: es un modelo de visión por computador entrenado para localizar y clasificar seis tipos de urgencia abdominal aguda en imágenes de tomografía computarizada (TC) abdominal. Resuelve un problema de triaje radiológico: dada una slice de TC, predice cajas delimitadoras con la clase de hallazgo patológico correspondiente.

El modelo tiene 9,67 millones de parámetros y trabaja a una resolución de entrada de 1280 píxeles, lo que permite detectar estructuras pequeñas como cálculos ureterales. Las seis clases son apendicitis aguda, colecistitis aguda, pancreatitis aguda, cálculo renal o ureteral, diverticulitis aguda y aneurisma/disección de aorta abdominal (AAA). Los pesos se distribuyen en formato `.pt` de Ultralytics, con un archivo principal de 20 MB y un repositorio total de 1,0 GB que incluye checkpoints, logs de entrenamiento, predicciones crudas y utilidades de evaluación.

Se trata explícitamente de un modelo de demostración, según declara el autor: se entrenó con el 6,8 % de las slices positivas del dataset TR_ABDOMEN_RAD (2,3 % de todas las slices), durante 10 épocas y en una única GPU de 16 GB. La model card lo etiqueta como "research/demo only" y advierte de que no es un dispositivo médico ni debe usarse en clínica. Su interés actual es como referencia reproducible de un pipeline de detección anatómica sobre un dataset público de urgencias abdominales, no como herramienta lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26-S-P2 (detector de objetos de una etapa, familia Ultralytics, con cabezal de alta resolucion P2) |
| Parametros totales | 9,67 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de imagen a 1280 px |
| Tipos de cuantizacion | no disponible (la model card solo distribuye pesos `.pt`; no documenta exportaciones ni cuantizaciones) |
| Idiomas soportados | no aplica (modelo de vision, sin procesamiento de texto) |
| Licencia | no disponible |
| Formato de pesos | `.pt` (PyTorch / Ultralytics); `best.pt` de 20 MB y checkpoints de 75 MB por epoca |

Otros datos tecnicos relevantes: pipeline declarado `object-detection`, libreria `ultralytics`, 6 clases, entrenamiento en bf16, tamano del repositorio 1,0 GB, 0 descargas y 1 like en el momento de la consulta. Fechas de metadatos del repositorio: creacion 2026-10-22, actualizacion 2026-10-22.

## Arquitectura y entrenamiento

YOLO26-S-P2 es un detector denso de una etapa de la familia YOLO mantenida por Ultralytics. La variante S corresponde al escalado pequeno (9,67 M de parametros) y el sufijo P2 indica la inclusion de un nivel de piramide adicional de alta resolucion, pensado para objectos de pequeno tamano. Esa eleccion encaja con el dominio: calcificaciones, calculos y colecciones liquidas ocupan pocos pixeles en una slice de TC, y el modelo se evalua a 1280 px de entrada para preservar detalle.

El entrenamiento se realizo sobre un subconjunto equilibrado y disjunto por paciente de TR_ABDOMEN_RAD, con 10.764 imagenes de train, 3.148 de validacion y 2.828 de test. Se usaron 10 epocas, batch 4 con acumulacion hasta un batch efectivo de 64, optimizador AdamW con tasa de aprendizaje 7e-4 y schedule coseno, en precision bf16 sobre una GPU de 16 GB. La aumentacion Mosaic se aplico durante las primeras 6 de las 10 epocas y se desactivo en las 4 finales (close-mosaic). No se documenta en la model card ninguna fase de ajuste por refuerzo, preferencias o alineacion, algo que no aplica a un detector.

El dataset de origen, TR_ABDOMEN_RAD, fue presentado en TEKNOFEST-2022. La model card indica que las etiquetas corregidas por los autores contienen 1.296 estudios y 43.166 cajas, frente a los 1.274 pacientes y 42.922 cajas (896/189/189) de la Tabla 1 publicada; las 22 diferencias corresponden mayoritariamente a calculos y AAA. Se aplican los terminos del dataset, que no se detallan en la informacion disponible.

## Capacidades

- Deteccion de objetos en imagenes de TC abdominal: devuelve cajas delimitadoras con clase y puntuacion de confianza.
- Clasificacion en seis categorias de urgencia: apendicitis aguda, colecistitis aguda, pancreatitis aguda, calculo renal/ureteral, diverticulitis aguda y AAA/diseccion.
- Localizacion anatomica restringida: la evaluacion reporta una metrica de localizacion restringida (0,889 en validacion y 0,870 en test), lo que sugiere que las detecciones se evaluan contra regiones anatomicas esperadas.
- Agregacion a nivel de paciente: el repositorio incluye `eval_report.json` y `eval/scores_*.csv` con puntuaciones por paciente, lo que permite pasar de detecciones por slice a una decision por estudio.
- Procesamiento a alta resolucion (1280 px) gracias al nivel P2 de la piramide de caracteristicas.
- No dispone de generacion de texto, razonamiento simbolico, tool calling, capacidades de agente, vision multimodal con lenguaje ni procesamiento de audio. Cualquier uso conversacional o de VQA requiere combinar este modelo con otro sistema.

## Casos de uso

- Triaje de urgencias abdominales: el modelo puede priorizar estudios de TC con sospecha de AAA o apendicitis ordenando la lista de trabajo del radiologo por puntuacion maxima por paciente, usando los scores agregados que ya genera el repositorio.
- Segunda lectura asistida en investigacion: servir como detector de referencia para comparar con otros pipelines de deteccion de urgencias abdominales sobre el mismo conjunto de test, dado que se publican predicciones crudas en `pred/`.
- Anotacion asistida y control de calidad de etiquetas: las discrepancias entre las cajas predichas y las anotaciones del dataset pueden senalar estudios mal etiquetados; el autor documenta de hecho correcciones sobre las etiquetas originales.
- Docencia y formacion en imagen medica: los overlays de `demo/` (ground truth frente a prediccion) permiten ilustrar como se manifiestan las seis patologias en TC sin exponer datos de pacientes reales fuera del marco del dataset.
- Desarrollo de pipelines de investigacion en deteccion medica: el repositorio incluye checkpoints completos, `results.csv` y curvas de entrenamiento, lo que lo hace util como plantilla reproducible de un entrenamiento YOLO sobre imagenes medicas.
- Filtrado previo de grandes volumenes de slices: como detector ligero de 20 MB, puede ejecutarse sobre todas las slices de un estudio para descartar las que no contienen hallazgos y reducir la carga de un revisor humano o de un segundo modelo mas costoso.
- Pruebas de robustez y calibracion: resultados por clase (diverticulitis con AUROC 0,692 frente a AAA con 1,000) permiten estudiar el desbalance de rendimiento entre patologias y disenar estrategias de mejora.

En todos los casos, el uso debe limitarse a investigacion y desarrollo, nunca a decision clinica.

## Benchmarks y rendimiento

Resultados a nivel de paciente reportados en la model card:

| Metrica | Validacion (36 pacientes) | Test (26 pacientes) |
|---|---:|---:|
| Macro AUROC | 0,879 [0,808-0,935] | 0,921 [0,867-0,967] |
| Macro F1 | 0,781 | 0,664 |
| Precision | 0,763 | 0,644 |
| Recall | 0,806 | 0,733 |
| Localizacion (restringida) | 0,889 | 0,870 |

Deteccion a nivel de slice en validacion: mAP50 de 0,220 y mAP50-95 de 0,092. Por clase, la peor es diverticulitis (AUROC 0,692) y la mejor es AAA (AUROC 1,000).

No se han publicado en la informacion disponible comparaciones numericas con otros detectores sobre el mismo split. La unica referencia metodologica citada es el articulo de Erdoğan y Koç (2026) en *Journal of Imaging Informatics in Medicine*, descrito como baseline de aprendizaje profundo multi-ventana, pero la model card no reproduce sus cifras ni ofrece una tabla comparativa directa.

## Requisitos de hardware

- VRAM de inferencia: no publicada. Como estimacion orientativa a partir del tamano del modelo (9,67 M de parametros) y de la entrada a 1280 px, un batch de 1 deberia situarse en el rango de 2 a 4 GB en fp16/bf16, pero es una estimacion no verificada y depende del backend.
- Entrenamiento: el autor indica una unica GPU de 16 GB con bf16, batch 4 y acumulacion hasta batch efectivo 64. Una GPU de 16 GB (por ejemplo T4, V100 de 16 GB, RTX 4080/A4000) es, por tanto, el minimo documentado.
- GPU recomendadas: no disponibles en la model card. Por el perfil de memoria, cualquier GPU consumer con 8 GB o mas deberia poder ejecutar inferencia; para entrenamiento se requiere al menos 16 GB.
- Cabe en GPU consumer: si, previsiblemente en tarjetas de 8 GB o superiores para inferencia a 1280 px, aunque no hay medicion publicada.
- Opciones de despliegue: el formato nativo es Ultralytics (`best.pt`). El repositorio no documenta exportaciones a ONNX, TensorRT, OpenVINO, CoreML ni a formatos GGUF; cualquier conversion habria que realizarla con las herramientas de Ultralytics y validarla por cuenta propia.
- Latencia y throughput: no disponibles. No se publican tiempos de inferencia ni FPS.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TR-ABDOMEN-RAD (YOLO26-S-P2) | 9,67 M | imagen 1280 px | Macro AUROC test 0,921; mAP50 slice 0,220 | no disponible | HuggingFace, repo de 1,0 GB |
| Baseline multi-ventana de Erdoğan y Koç (2026) | no disponible | ventanas multiples de TC | no disponible en la model card | publicacion cientifica | articulo en JIIM |
| Otros detectores YOLO de Ultralytics (S/M) | no disponible en esta busqueda | imagen configurable | no disponible | no disponible | no disponible |

No se dispone de una comparativa cuantitativa con alternativas. La unica referencia es el articulo metodologico citado como baseline, del que la model card no reproduce resultados. Cualquier afirmacion sobre ventajas frente a otros detectores careceria de respaldo con los datos disponibles.

## Limitaciones y advertencias

- Modelo de demostracion: entrenado con el 6,8 % de las slices positivas (2,3 % del total) y solo 10 epocas. El autor lo califica explicitamente como demo y no como reproduccion de un articulo.
- No es un dispositivo medico: la model card prohibe su uso clinico.
- Intervalos de confianza amplios: el conjunto de test tiene solo 26 pacientes.
- Especificidad no evaluada: el modelo puede generar falsos positivos en poblaciones sin patologia y ese aspecto no se ha medido.
- Rendimiento muy desigual por clase: diverticulitis con AUROC 0,692 frente a AAA con 1,000; la media macro oculta esa dispersion.
- mAP a nivel de slice bajo (0,220 en mAP50): la localizacion fina es debil, aunque la agregacion por paciente compense parcialmente.
- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial. Ademas, se aplican los terminos del dataset TR_ABDOMEN_RAD, que no se detallan en la informacion disponible.
- Dependencia de una unica modalidad y ventana: el modelo trabaja sobre slices de TC abdominal; el autor menciona un enfoque multi-ventana en el baseline, pero no se documenta que estos pesos integren varias ventanas.
- Sin sesgos documentados: no se publica analisis de sesgo por sexo, edad, etnia, equipo o protocolo de adquisicion.
- Riesgo de alucinacion en sentido figurado: como todo detector, puede producir cajas con alta confianza sobre artefactos o estructuras normales; no hay evaluacion de calibracion publicada.
- Artefactos de entrenamiento: el directorio `smoke/` contiene pesos de prueba con mAP 0 que el autor indica ignorar; conviene verificar que se carga `best.pt` y no otro checkpoint.
- Idiomas: no aplica, pero implica que no hay soporte de informes en texto ni de instrucciones en lenguaje natural.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/huseyincavus/tr-abdomen-rad-weights
- Paper metodologico (baseline): Erdoğan, H.M., Koç, U. "Anatomically Localized Detection of Six Acute Abdominal Emergencies on CT Using Multi-window Deep Learning: Development and Validation", *Journal of Imaging Informatics in Medicine* (2026). https://doi.org/10.1007/s10278-026-02084-x
- Paper del dataset: Koç, U., Akçapınar Sezer, E., Özkaya, Y.A., et al. "Elevating healthcare through artificial intelligence: analyzing the abdominal emergencies data set (TR_ABDOMEN_RAD_EMERGENCY) at TEKNOFEST-2022", *European Radiology* 34, 3588-3597 (2024). https://doi.org/10.1007/s00330-023-10391-y
- Ultralytics (framework y pesos upstream): no se incluye enlace en la model card; consultar la documentacion oficial del proyecto Ultralytics.
