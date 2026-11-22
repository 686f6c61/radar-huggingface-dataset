# kenantabak/yolo26s-knee-xray-acl-detection-tr

## Resumen

`yolo26s-knee-xray-acl-detection-tr` es un modelo de deteccion de objetos basado en la arquitectura YOLO26 Small (Ultralytics), entrenado especificamente para localizar la region del ligamento cruzado anterior (ACL) en radiografias de rodilla. Lo desarrolla Kenan Tabak dentro de la plataforma turca EVREN (SSYZ), como parte de un portafolio de 126 modelos de produccion y un catalogo de 328 conjuntos de datos en turco orientados a vision por computador.

El modelo resuelve una tarea acotada de deteccion de una unica clase sobre imagen medica: delimitar la caja que corresponde a la zona del ACL en una radiografia frontal de rodilla, de modo que pueda servir como paso previo a un analisis clinico o como componente de un pipeline de diagnostico asistido por ordenador. No es un modelo generativo ni un clasificador diagnostico: solo localiza la region de interes.

Es relevante por su especializacion y su tamano reducido (pesos de 19,33 MB, entrenamiento en 0,1153 GPU-hora), lo que lo hace desplegable en entornos con recursos limitados y rapido de integrar en herramientas de ortopedia. La model card declara metricas muy altas en validacion (mAP@50 del 99,50 %), aunque el propio autor las marca como no verificadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26 Small (`yolo26s`, Ultralytics) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos PyTorch; el tag `onnx` sugiere exportacion posible, sin ficha de cuantizaciones) |
| Idiomas soportados | tr, en |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch (`best.pt`, `yolo26s-knee-xray-acl-detection-tr.pt`); tag `onnx` en el repo |
| Tarea | Deteccion de objetos (1 clase: region ACL en radiografia de rodilla) |
| Tamano de pesos | 19,33 MB |
| Tamano del repositorio | 0,1 GB |
| Entrada de imagen | 640 px (`imgsz=640` en el ejemplo de uso) |
| Dataset de entrenamiento | `Diz Röntgeni Ön Çapraz Bağ (ACL) Bölgesi Tespiti (1 Sınıf)` v1.0 (tipo `evren-grade-a`) |
| Coste de entrenamiento | 0,1153 GPU-hora (1x NVIDIA H200 o A100) |

## Arquitectura y entrenamiento

El modelo emplea la familia YOLO26 en su variante Small, una arquitectura de deteccion de objetos en una sola etapa (single-stage) de la familia Ultralytics. Se trata de un detector denso con anclas implicitas o sin anclas segun la implementacion de YOLO26, optimizado para inferencia en tiempo real. La salida es una lista de cajas delimitadoras con clase y confianza; en este caso, una unica clase correspondiente a la region del ACL.

El entrenamiento se realizo sobre el conjunto `Diz Röntgeni Ön Çapraz Bağ (ACL) Bölgesi Tespiti (1 Sınıf)` version 1.0, catalogado como `evren-grade-a` en la plataforma EVREN. El coste declarado es de 0,1153 GPU-hora en una NVIDIA H200 o A100, lo que indica un conjunto de datos pequeno y un regimen de entrenamiento corto. La model card no detalla el numero de imagenes, la composicion del dataset, ni si hubo aumento de datos, validacion cruzada o ajuste de hiperparametros mas alla de la configuracion por defecto de Ultralytics. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.), al tratarse de un detector convolucional estandar.

## Capacidades

- Deteccion de la region del ligamento cruzado anterior (ACL) en radiografias de rodilla, con una unica clase de salida.
- Inferencia en tiempo real gracias al diseno single-stage de YOLO26 Small y al tamano reducido de los pesos (19,33 MB).
- API de prediccion de Ultralytics: `model.predict(source=..., imgsz=640, conf=0.25, iou=0.45, save=True)`.
- Exportacion a otros formatos soportados por Ultralytics (el repositorio incluye el tag `onnx`), aunque la model card solo documenta pesos PyTorch.
- Soporte de entrenamiento e inferencia en espanol/turco/ingles a nivel de documentacion (idiomas declarados: tr, en); el modelo en si no procesa lenguaje.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision general, audio ni modo thinking: es un detector de objetos puro.

## Casos de uso

- **Pretratamiento en pipelines de radiologia ortopedica**: el modelo recorta automaticamente la region del ACL en radiografias de rodilla para que un segundo modelo (clasificador de lesion o segmentador) trabaje solo sobre el area de interes, reduciendo ruido y coste computacional.
- **Herramienta de anotacion asistida**: integrado en una interfaz de etiquetado, propone cajas candidatas sobre nuevas radiografias para que el radiologo o el tecnico solo tenga que validar o corregir, acelerando la creacion de nuevos datasets.
- **Triage en urgencias o consulta**: en un sistema de vision embebido, marca las radiografias en las que la region ACL es visible y bien delimitada, priorizando su revision por un especialista.
- **Control de calidad de imagen**: detecta radiografias en las que la region ACL no se localiza con confianza suficiente (por mala postura, recorte o baja calidad), permitiendo repetir la captura antes del diagnostico.
- **Investigacion clinica retrospectiva**: permite extraer de forma masiva la region ACL de estudios historicos para analisis estadisticos de prevalencia de lesiones, sin intervencion manual.
- **Despliegue en dispositivos de borde**: con 19,33 MB de pesos y soporte ONNX, puede ejecutarse en estaciones de trabajo con GPU consumer o incluso en CPU para entornos sin acelerador, lo que facilita su uso en clinicas con infraestructura limitada.
- **Prototipado rapido en docencia**: por su bajo coste de entrenamiento (0,1153 GPU-hora) y su licencia CC BY 4.0, sirve como ejemplo reproducible de deteccion medica para cursos y talleres.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre el conjunto de validacion del dataset `Diz Röntgeni Ön Çapraz Bağ (ACL) Bölgesi Tespiti (1 Sınıf)` (1 clase). El autor marca las metricas como no verificadas (`verified: false`).

| Metrica | Valor |
|---|---|
| mAP@50 (%) | 99,50 |
| mAP@50-95 (%) | 75,06 |
| Precision (%) | 99,99 |
| Recall (%) | 100,00 |
| F1 Score (%) | 100,00 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma oficial. Para un detector YOLO Small a 640 px, la huella tipica ronda 1-2 GB en FP32 y por debajo de 1 GB en FP16/ONNX; son estimaciones de la familia YOLO, no datos publicados para este modelo.
- **GPU recomendadas**: NVIDIA H200 o A100 fueron las usadas para el entrenamiento (0,1153 GPU-hora). Para inferencia, cualquier GPU moderna de NVIDIA (T4, L4, RTX 3060 o superior) es suficiente por el tamano del modelo.
- **GPU consumer**: si cabe en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090, y en CPU mediante exportacion ONNX.
- **Opciones de despliegue**: Ultralytics (Python/CLI), exportacion ONNX (tag del repo), y en general los backends compatibles con ONNX Runtime, TensorRT o OpenVINO.
- **Latencia y throughput**: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos publicados de modelos comparables en la informacion proporcionada. Como referencia cualitativa, la alternativa natural serian otros detectores de la familia YOLO (YOLOv8, YOLO11) reentrenados sobre el mismo dataset, o modelos de deteccion medica especializados; no obstante, no se aportan cifras que permitan una comparacion rigurosa.

| Modelo | Parametros | Contexto | mAP@50 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yolo26s-knee-xray-acl-detection-tr | no disponible | no aplica | 99,50 % (declarado) | CC BY 4.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Metricas no verificadas**: el autor marca `verified: false` en mAP@50, mAP@50-95 y F1; los valores (99,50 % y 100 % de F1) deben tomarse con cautela hasta una validacion independiente.
- **Riesgo de sobreajuste**: un F1 del 100 % y un mAP@50 del 99,50 % en validacion, con solo 0,1153 GPU-hora de entrenamiento, sugieren un conjunto de datos pequeno o poco variado; el rendimiento en datos externos puede degradarse.
- **Una sola clase**: el modelo no distingue lesion de ausencia de lesion, ni segmenta estructuras; solo localiza la region ACL. No debe interpretarse como herramienta diagnostica.
- **Dependencia de la calidad de imagen**: al no documentarse la composicion del dataset, se desconoce su robustez ante variaciones de equipo de rayos X, postura del paciente, contraste o presencia de implantes.
- **Sesgo poblacional desconocido**: no se especifica la procedencia demografica de las radiografias de entrenamiento; podria no generalizar a otras poblaciones.
- **Idiomas**: aunque declara `tr` y `en`, el modelo no procesa lenguaje; la declaracion se refiere a la documentacion.
- **Licencia CC BY 4.0**: permite uso comercial con atribucion, pero no exime del cumplimiento de la normativa sanitaria aplicable (marcado CE de producto sanitario, RGPD) si se usa en contexto clinico.
- **Uso clinico**: no esta validado como dispositivo medico; cualquier despliegue en produccion sanitaria requiere validacion regulatoria y supervision profesional.
- **Documentacion incompleta**: faltan datos sobre numero de imagenes, particiones de entrenamiento/validacion/test y proceso de anotacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kenantabak/yolo26s-knee-xray-acl-detection-tr
- Pagina del modelo en EVREN (produccion): https://evren.ssyz.org.tr/models/u19979974710e/diz-rontgeninde-on-capraz-bag-acl-bolgesi-tespiti
- Perfil del desarrollador en EVREN: https://evren.ssyz.org.tr/users/u19979974710e
- Catalogo de datasets turcos de vision por computador (328 datasets): https://huggingface.co/datasets/kenantabak/evren-turkish-computer-vision-316-datasets
- Ultralytics (framework): https://github.com/ultralytics/ultralytics
- Documentacion de Ultralytics: https://docs.ultralytics.com/
