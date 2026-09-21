# RaiyanKhaan/KrishokTech-Models

## Resumen

KrishokTech-Models es un paquete de modelos de vision por computadora orientado a la agricultura, desarrollado por RaiyanKhaan para el sistema de asesoria KrishokChat, con foco en Bangladesh. No se trata de un unico modelo, sino de una suite de ocho componentes organizados en tres niveles: un clasificador de entrada de especie de cultivo (10 clases), seis modelos especializados de patologia foliar por cultivo y un modelo de regresion de humedad del suelo. Todos los pesos se distribuyen en carpetas autocontenidas con pesos PyTorch (`.pt`) y, en la mayoria de casos, exportaciones ONNX para despliegue en el borde.

El proposito del sistema es diagnostico agronomico local: a partir de una imagen de hoja de campo, identifica primero la especie de cultivo para evitar el hazard de aplicar el pesticida equivocado entre cultivos y despues aplica el modelo de patologia especifico del cultivo. De forma complementaria, un modelo de regresion basado en EfficientNet-B0 estima la tension matricial del suelo (en kPa) a partir de imagenes de campo para guiar el riego de precision. El objetivo declarado por el autor es permitir que revisores academicos, agronomos y desarrolladores reproduzcan el pipeline completo en local sin necesidad de servidores GPU en la nube.

La relevancia actual del paquete radica en su enfoque de despliegue ligero (checkpoints individuales de entre 3,1 MB y 81 MB) y en la inclusion de pesos ONNX y scripts de verificacion y de inferencia, lo que facilita su integracion en aplicaciones moviles o de borde. La licencia es Apache 2.0 y la libreria de referencia es Ultralytics. El repositorio ocupa 0,3 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Suite multi-etapa: 7 modelos YOLO26-cls (clasificacion) + 1 regresor EfficientNet-B0 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelos de vision por computadora) |
| Tipos de cuantizacion | no disponible; se distribuyen pesos PyTorch (`.pt`) y exportaciones ONNX sin cuantizacion declarada |
| Idiomas soportados | no disponible (modelos de vision); el sistema asociado genera recomendaciones de tratamiento en bengali |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`) y ONNX (`.onnx`); el regresor de suelo solo en `state_dict` de PyTorch |

Detalle de los modelos incluidos:

| # | Componente | Arquitectura | Clases / salida | Tamano peso PyTorch | Tamano ONNX |
|:---:|---|---|:---:|---|---|
| 1 | `01_crop_classifier` | YOLO26-cls | 10 clases | 10,5 MB | 20,8 MB |
| 2 | `02_potato_disease` | YOLO26-cls | 3 clases | 10,5 MB | 20,8 MB |
| 3 | `03_rice_disease` | YOLO26-cls | 10 clases | 19,9 MB | 39,6 MB |
| 4 | `04_wheat_disease` | YOLO26-cls | 11 clases | 9,0 MB | 5,9 MB |
| 5 | `05_corn_disease` | YOLO26-cls | 4 clases | 10,5 MB | 20,8 MB |
| 6 | `06_chilli_disease` | YOLO26-cls | 8 clases | 3,1 MB | 5,9 MB |
| 7 | `07_brassica_disease` | YOLO26-cls | 11 clases | 10,5 MB | 20,8 MB |
| 8 | `08_soil_moisture` | EfficientNet-B0 | 1 continua (kPa) | 81 MB (5 folds) | no aplica |

## Arquitectura y entrenamiento

El sistema sigue una arquitectura en cascada de tres niveles. El nivel 1 es un clasificador de especie de cultivo basado en YOLO26-cls que distingue 10 familias de cultivos principales de Bangladesh. El nivel 2 lo forman seis modelos YOLO26-cls dedicados, uno por cultivo (patata, arroz, trigo, maiz, chilli y brasicas), que diagnostican enfermedades foliares de tipo fungico, bacteriano, viral y fisiologico. El nivel 3 es un modelo de regresion EfficientNet-B0, validado con 5 folds, que predice la presion de succion del suelo (tension matricial, en kPa) directamente a partir de imagenes de campo.

No se detalla en la informacion disponible el numero de imagenes de entrenamiento, la composicion exacta del dataset (referenciado como `agricultural-vision`) ni si se emplearon tecnicas de ajuste como RLHF o DPO, extremo por otra parte no habitual en modelos de vision. Tampoco se especifican hiperparametros, resolucion de entrada ni regimen de aumento de datos. Como innovacion destacable, el paquete ofrece exportaciones ONNX de los siete clasificadores para despliegue multiplataforma en el borde, y para el regresor de suelo incluye un ensemble de 5 folds con predicciones out-of-fold (`oof_predictions.csv`) y una grafica de prediccion frente a valor real (`pred_vs_actual.png`) como material de validacion. Los scripts `verify_all_models.py` y `run_inference.py` permiten reproducir el pipeline completo.

## Capacidades

- Clasificacion de especie de cultivo entre 10 familias, como paso previo de triaje.
- Diagnostico de enfermedades foliares en patata (3 clases: mildiu temprano, mildiu tardio, sana).
- Diagnostico de enfermedades en arroz (10 clases, incluyendo blast, BLB y sheath blight).
- Diagnostico de enfermedades en trigo (11 clases, incluyendo royas, blast y tan spot).
- Diagnostico de enfermedades en maiz (4 clases, incluyendo roya, mancha foliar y tizon).
- Diagnostico de enfermedades en chilli (8 clases, incluyendo mancha bacteriana y virus del rizado).
- Diagnostico de enfermedades en brasicas, col y coliflor (11 clases).
- Regresion continua de la tension matricial del suelo en kPa a partir de imagenes de campo.
- Exportacion a ONNX para inferencia en CPU, movil y dispositivos de borde.
- Salida asociada de recomendaciones de tratamiento en bengali (gestionada por el sistema KrishokChat, no por los propios pesos).
- No se declara soporte de tool calling, function calling ni razonamiento multi-paso, al tratarse de modelos perceptivos, no de modelos de lenguaje.

## Casos de uso

- Diagnostico de campo en movil sin conectividad: los pesos ONNX de cada clasificador permiten ejecutar la inferencia en el propio dispositivo, de modo que un agricultor puede fotografiar una hoja y recibir el diagnostico sin enviar la imagen a la nube.
- Triaje agronomico previo al tratamiento: el clasificador de especie actua primero para garantizar que se carga el modelo de patologia correcto, evitando el hazard de aplicar un pesticida disenado para otro cultivo.
- Riego de precision: el regresor EfficientNet-B0 estima la tension matricial del suelo en kPa a partir de imagenes, lo que permite ajustar la frecuencia y el volumen de riego segun el estres hidrico real del suelo.
- Atencion en chatbots de asesoria agraria: integrado en KrishokChat, el pipeline convierte una imagen de entrada en un diagnostico estructurado y una recomendacion de tratamiento, lo que reduce la carga de los extensionistas.
- Extension agraria en zonas rurales: al requerir recursos minimos (modelos de pocos megabytes), puede desplegarse en equipos de bajo coste o incluso en telefono movil para uso por cooperativas y tecnicos de campo.
- Reproducibilidad academica: la estructura folderizada, los scripts de verificacion y las predicciones out-of-fold del regresor facilitan la revision por pares y la replica de resultados sin GPU en la nube.
- Alerta temprana de brotes: el diagnostico sistematico por cultivo y region permitiria agregar detecciones y detectar la propagacion de una enfermedad antes de que se generalice.
- Control de calidad en laboratorio agronomico: clasificacion automatizada de muestras foliares para catalogar patologias en grandes lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara las metricas `accuracy` y `rmse` como metricas de evaluacion, y el componente de humedad del suelo incluye predicciones out-of-fold y una grafica de prediccion frente a valor real, pero no se aportan cifras concretas (exactitud por clase, F1, RMSE en kPa) en la informacion proporcionada, por lo que no es posible presentar una tabla comparativa sin inventar datos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Los checkpoints individuales ocupan entre 3,1 MB y 19,9 MB, y el ensemble de suelo 81 MB, por lo que la huella en memoria es marginal.
- GPU recomendadas: no requiere GPU dedicada. Puede ejecutarse en CPU, en GPU integrada o en aceleradores de borde. Tarjetas como RTX 3060, RTX 4090, A100 o H100 estan sobredimensionadas para este conjunto de modelos.
- Compatibilidad con GPU de consumo: si, cualquier GPU de consumo e incluso hardware sin GPU son suficientes, dado el reducido tamano de los pesos.
- Opciones de despliegue: libreria Ultralytics (PyTorch) para los clasificadores, ONNX Runtime para las exportaciones `.onnx`, y ejecucion directa de los `state_dict` de PyTorch para el regresor de suelo. La conversion a TensorRT u OpenVINO no esta confirmada en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo / suite | Arquitectura | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KrishokTech-Models | YOLO26-cls + EfficientNet-B0 | Clasificacion de cultivo y patologia; regresion de humedad del suelo | no aplica | Apache 2.0 | HuggingFace (0 descargas) |
| YOLOv8-cls (Ultralytics) | YOLOv8-cls | Clasificacion de imagenes generica | no aplica | AGPL-3.0 | Modelo base publico de Ultralytics |
| Modelos entrenados sobre PlantVillage | CNN genericas (ResNet, MobileNet, etc.) | Clasificacion de enfermedades foliares | no aplica | variable segun autor | Multiples checkpoints en HuggingFace |

No se dispone de datos de rendimiento comparativos (exactitud, F1, RMSE) para KrishokTech-Models ni para las alternativas citadas en el contexto de esta ficha, por lo que la comparacion se limita a arquitectura, tarea, licencia y disponibilidad. La ventaja diferencial de KrishokTech-Models es su pipeline en cascada con clasificador de especie previo, la cobertura multilingue/cultivo especifica de Bangladesh y la disponibilidad de los siete clasificadores en formato ONNX.

## Limitaciones y advertencias

- Riesgo de alucinacion o de diagnostico erroneo: los modelos de clasificacion pueden asignar una clase incorrecta ante imagenes fuera de distribucion, iluminacion adversa, oclusion u hojas no representativas del dominio de entrenamiento.
- Dependencia del clasificador de entrada: un error en el clasificador de especie de cultivo propaga el fallo al modelo de patologia erroneo, por lo que la primera etapa condiciona toda la cascada.
- Sesgo geografico y de dominio: los modelos estan orientados a cultivos y patologias de Bangladesh; su transferibilidad a otras regiones, variedades o condiciones climaticas no esta validada en la informacion disponible.
- Cobertura de idiomas: los modelos de vision no procesan lenguaje; las recomendaciones en bengali dependen del sistema superior, no de los pesos distribuidos.
- Falta de cifras de rendimiento publicadas: no se aportan exactitud, F1 ni RMSE en valor absoluto, lo que dificulta evaluar la fiabilidad en produccion.
- Restricciones de licencia: los pesos se publican bajo Apache 2.0, que permite uso comercial; sin embargo, la dependencia de la libreria Ultralytics puede imponer condiciones adicionales segun la version de dicha libreria, que conviene verificar antes de un despliegue comercial.
- Caveat de versionado: se referencia la arquitectura YOLO26-cls, cuya disponibilidad y estabilidad como version concreta deben confirmarse en el momento de la integracion.
- Regresor de suelo sin exportacion ONNX: el componente de humedad solo se distribuye como `state_dict` de PyTorch, lo que limita su despliegue directo en entornos de borde que dependan de ONNX.
- Repositorio sin traccion: cero descargas y cero likes en la fecha de consulta, sin senales externas de validacion por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/RaiyanKhaan/KrishokTech-Models

No se han encontrado enlaces adicionales relevantes (papers, blogs, repositorios o demos) en los resultados de la busqueda web; el resto de resultados obtenidos no guardan relacion con el modelo.
