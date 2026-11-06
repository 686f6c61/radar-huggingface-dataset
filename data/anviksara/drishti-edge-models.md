# Anviksara/drishti-edge-models

## Resumen

Drishti Edge models es un repositorio de pesos de deteccion de objetos publicado por Anviksara (equipo Latent Forge) como parte del proyecto Drishti Edge, un monitor de seguridad industrial de codigo abierto orientado a fabricas. El repositorio contiene dos detectores YOLO26n ajustados: uno para cumplimiento de equipos de proteccion individual (EPI) y otro para alerta temprana de fuego y humo sobre camaras CCTV convencionales. No se trata de un modelo de lenguaje, sino de un paquete de pesos de vision por computador para despliegue en el borde.

Ambos modelos parten de YOLO26n (variante nano, preentrenada en COCO) y se han ajustado con Ultralytics 8.4.202 y PyTorch 2.14.1 sobre una GTX 1650 de 4 GB, a 640 px y con un batch de 6. El primero detecta casco, chaleco y sus ausencias, ademas de guantes, botas, gafas, persona y carretilla elevadora; el segundo detecta humo y fuego. El repositorio tiene un tamano declarado de 0.0 GB, lo que sugiere que los pesos no estan efectivamente alojados o que el calculo de tamano no se ha materializado.

La relevancia del proyecto reside en su enfoque en la honestidad metodologica: los autores detectan y cuantifican fuga de datos por frames casi duplicados en el conjunto de prueba de D-Fire (55 % de imagenes con un frame casi identico en entrenamiento) y publican metricas sobre el subconjunto libre de fuga. Es un caso practico de evaluacion rigurosa en deteccion visual aplicada a seguridad industrial, con licencia AGPL-3.0 heredada de Ultralytics.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n (detector de objetos convolutional, familia Ultralytics YOLO) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (pesos `.pt` en precision de entrenamiento) |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.pt` (PyTorch via Ultralytics) |

## Arquitectura y entrenamiento

La arquitectura es un detector YOLO26 en su variante nano, es decir, una red convolutional de una sola etapa optimizada para inferencia de baja latencia en hardware modesto. No hay transformer ni mecanismos de atencion global declarados; el modelo sigue el paradigma clasico de deteccion densa con anchors o asignacion dinamica segun la implementacion de Ultralytics 8.4.202. El ajuste se realizo sobre dos conjuntos distintos: Construction-PPE (800 imagenes de entrenamiento y 200 de validacion) para el detector de EPI, y D-Fire (15.499 de entrenamiento y 1.722 de validacion) para fuego y humo.

El entrenamiento del detector de EPI duro 50 epocas (0,5 h) y el de fuego/humo 30 epocas (5,4 h), ambos a 640 px y batch 6 sobre una GTX 1650. Los autores indican que ninguna ejecucion presento sobreajuste, con perdidas de validacion decrecientes o planas hasta la ultima epoca. La innovacion metodologica destacable no esta en la arquitectura sino en la evaluacion: se aplica un hash perceptual (`training/check_leakage.py`) para identificar frames casi duplicados entre entrenamiento y prueba en D-Fire, y se reportan metricas sobre el subconjunto limpio de 1.157 imagenes. No se menciona uso de RLHF, DPO ni tecnicas de alineacion, logicas en un modelo de vision supervisado.

## Capacidades

- Deteccion de objetos en tiempo real sobre imagenes y video de camaras CCTV.
- Deteccion de EPI: casco (`helmet`), ausencia de casco (`no_helmet`), chaleco (`vest`), ausencia de chaleco (`no_vest`), ademas de guantes, botas, gafas y sus ausencias, persona y carretilla elevadora.
- Deteccion de fuego (`fire`) y humo (`smoke`) para alerta temprana visual.
- Integracion con un motor de reglas externo que asocia EPI a cada persona rastreada, valida visibilidad de cabeza y hombros mediante keypoints de pose, exige persistencia de la violacion antes de alertar y filtra falsos positivos de fuego (lamparas, ropa naranja, carteles) con comprobacion de movimiento.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un detector puro sin modulo linguistico.
- No tiene capacidades multilingues ni generacion de texto.

## Casos de uso

- Monitorizacion de cumplimiento de EPI en planta: el detector `ppe.pt` identifica personas sin casco o sin chaleco en el flujo de video; el motor de reglas de Drishti solo emite alerta cuando la ausencia persiste y la pose confirma visibilidad de cabeza u hombros, lo que reduce falsos positivos por EPI apoyado en una mesa.
- Alerta temprana de incendio en naves industriales: `fire_smoke.pt` detecta humo y fuego sobre camaras CCTV existentes, como complemento visual a los detectores certificados de humo y calor, no como sustituto.
- Vigilancia de zonas de riesgo con carretillas: la clase `forklift` permite cruzar la deteccion de vehiculos con la de personas para generar avisos de proximidad en zonas de maniobra.
- Despliegue en el borde sin infraestructura GPU dedicada: al ser variantes nano entrenadas en una GTX 1650, son adecuadas para dispositivos de inferencia de bajo consumo en planta o en gabinetes de comunicaciones.
- Auditoria de seguridad y generacion de registros: el pipeline puede almacenar eventos de violacion de EPI con marca temporal para informes de cumplimiento interno o inspecciones.
- Investigacion sobre evaluacion de detectores en dominios criticos: el repositorio sirve como ejemplo reproducible de analisis de fuga de datos por frames casi duplicados y de publicacion de metricas sobre subconjuntos limpios.
- Prototipado rapido de sistemas de vision para seguridad laboral: la integracion con Ultralytics permite reentrenar o afinar sobre footage propio partiendo de estos pesos.

## Benchmarks y rendimiento

Deteccion de fuego y humo (`fire_smoke.pt`), sobre D-Fire:

| Conjunto de prueba | Imagenes | mAP50 global | smoke | fire |
|---|---|---|---|---|
| D-Fire test oficial | 4.302 | 0,756 | 0,821 | 0,690 |
| D-Fire test, subconjunto libre de fuga | 1.157 | 0,725 | 0,828 | 0,621 |

Confianza de mejor F1 en el subconjunto libre de fuga: humo 0,29, fuego 0,27 (Drishti usa 0,28).

Deteccion de EPI (`ppe.pt`), validacion sobre Construction-PPE (200 imagenes, sin split de test separado):

| Clase | mAP50 | Confianza de mejor F1 |
|---|---|---|
| helmet | 0,837 | 0,46 |
| vest | 0,883 | 0,41 |
| no_helmet | 0,649 | 0,34 |
| no_vest | 0,691 | 0,41 |
| person | 0,948 | 0,43 |

No se han publicado resultados comparativos con otros detectores en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el entrenamiento se realizo en una GTX 1650 de 4 GB, por lo que la inferencia de un modelo nano a 640 px cabe holgadamente en GPUs consumer de gama baja.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia comoda; GTX 1650, RTX 3050, RTX 4060, RTX 4090, A100 o H100 son validas, con mayor throughput en las de gama alta.
- Cabe en GPU consumer: si, en toda la gama actual; tambien es viable en CPU para cargas de baja frecuencia de fotogramas.
- Opciones de despliegue: Ultralytics (Python), exportacion a ONNX, TensorRT, OpenVINO u otros formatos soportados por Ultralytics; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector de vision.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | mAP50 (referencia) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Drishti Edge `ppe.pt` | no disponible (YOLO26n) | no aplica | 0,649–0,948 por clase (val, 200 img) | AGPL-3.0 | Hugging Face |
| Drishti Edge `fire_smoke.pt` | no disponible (YOLO26n) | no aplica | 0,725 (subconjunto libre de fuga) | AGPL-3.0 | Hugging Face |
| YOLO26n base (COCO) | no disponible | no aplica | no disponible en la informacion | AGPL-3.0 | Ultralytics |
| Otros detectores de fuego/humo sobre D-Fire | no disponible | no aplica | no disponible en la informacion | variable | no disponible |

No se dispone de datos de benchmarks de terceros en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- No es un sistema de alarma de incendios certificado: proporciona aviso visual temprano y nunca sustituye a detectores certificados de humo y calor.
- D-Fire contiene mayoritariamente imagenes de exterior y de incendios forestales; el humo fino en interiores contra paredes claras se detecta con menos fiabilidad que las columnas densas de humo.
- El recall de fuego es inferior al de humo (aproximadamente 0,55–0,57 en el test libre de fuga cerca del umbral elegido); Drishti compensa con persistencia durante varios segundos.
- Construction-PPE es un conjunto pequeno y procedente de obras de construccion: cascos palidos o borrosos, personas pequenas o lejanas y colores de chaleco poco habituales son casos debiles.
- La clase `no_helmet` tiene el mAP50 mas bajo del detector de EPI (0,649), lo que implica mayor tasa de falsos negativos en la deteccion de ausencia de casco.
- Licencia AGPL-3.0: cualquier uso en red o distribucion del software derivado obliga a liberar el codigo bajo la misma licencia; es una restriccion relevante para integracion en productos comerciales cerrados.
- El repositorio declara un tamano de 0.0 GB y cero descargas, lo que puede indicar que los pesos no estan efectivamente publicados o que el calculo de tamano no se ha materializado; conviene verificar la disponibilidad de los ficheros antes de integrarlos.
- Sesgos conocidos: no documentados de forma explicita; los derivados de la composicion de los datasets (construccion, exterior, camaras fijas) son plausibles pero no cuantificados.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero existen falsos positivos de fuego por objetos naranjas, lamparas o carteles, mitigados parcialmente por la comprobacion de movimiento del motor de reglas.

## Enlaces

- Hugging Face: https://huggingface.co/Anviksara/drishti-edge-models
- Repositorio principal del proyecto: https://github.com/Anviksara/drishti-edge
- Dataset Construction-PPE (Ultralytics): https://docs.ultralytics.com/datasets/detect/construction-ppe/
- Dataset D-Fire: https://github.com/gaiasd/DFireDataset
- Ultralytics: https://github.com/ultralytics/ultralytics
- Paper de D-Fire: P. V. A. B. de Venancio, A. C. Lisboa, A. V. Barbosa, "An automatic fire detection system based on deep convolutional neural networks for low-power, resource-constrained devices", *Neural Computing and Applications*, 2022 (CC0)
- Licencia AGPL-3.0: https://www.gnu.org/licenses/agpl-3.0.html
- Licencia CC BY 4.0 (Construction-PPE): https://creativecommons.org/licenses/by/4.0/
