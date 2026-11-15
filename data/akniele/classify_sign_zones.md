# akniele/classify_sign_zones

## Resumen

`akniele/classify_sign_zones` es un clasificador de imagenes basado en YOLO26n-cls (Ultralytics) que determina si una senal de trafico neerlandesa es una senal de zona (inicio, repeticion o fin) o una senal convencional. El modelo forma parte de un pipeline de cuatro etapas orientado a la digitalizacion y clasificacion automatica de senaletica vial en Paises Bajos, entrenado sobre recortes de imagenes de la plataforma colaborativa Panoramax.

El problema que resuelve es concreto: en la etapa de deteccion del pipeline, las senales que pueden ser de zona (por ejemplo, limite de velocidad 30 km/h o limite de peso 7,5 t) no se separan segun si son o no de zona. Este clasificador de cuarta etapa distingue una senal de limite de 30 km/h convencional de su equivalente en zona, algo que la deteccion por si sola no cubre.

Se trata de un modelo muy pequeno (repo de 0,0 GB, arquitectura nano de Ultralytics), con entrada de 224x224 px y solo 4 clases, pensado como componente especializado dentro de un sistema mayor y no como modelo de proposito general. Su relevancia es practica: demuestra como descomponer una tarea de vision compleja en etapas encadenadas de deteccion y clasificacion sobre datos abiertos y georreferenciados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n-cls (Ultralytics), variante nano de clasificacion |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de 224x224 px) |
| Tipos de cuantizacion | no disponible (formato nativo Ultralytics `.pt`) |
| Idiomas soportados | no disponible (modelo de vision; etiquetas en neerlandes e ingles) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | `.pt` (PyTorch, Ultralytics); compatible con exportacion a otros formatos via Ultralytics |

## Arquitectura y entrenamiento

El modelo es un YOLO26n-cls, la variante nano de la familia YOLO26 de Ultralytics para clasificacion de imagenes. Se inicializa desde `yolo26n-cls.pt` preentrenado en ImageNet y se ajusta finamente durante 30 epocas con batch de 16 e imagenes de 224x224 px. El optimizador es el automatico de Ultralytics con LR inicial de 0.01. La augmentacion incluye RandAugment, traslacion de 0.2, shear de 10.0 y dropout de 0.2, con el volteo horizontal desactivado (`fliplr`), decision coherente con la semantica de la senaletica, donde la simetria no es garantia de equivalencia.

El conjunto de entrenamiento consta de 260 imagenes y el de validacion de 112, segun la model card, aunque la seccion de rendimiento reporta una evaluacion sobre 4.760 imagenes, discrepancia que conviene tener en cuenta. Los datos provienen de recortes de senales de la plataforma Panoramax, derivados del dataset `Panoramax/classified_nl_road_signs`. No se documenta el uso de RLHF ni de tecnicas de alineacion, algo esperable en un clasificador de vision.

## Capacidades

- Clasificacion de imagenes de senales de trafico neerlandesas en 4 clases: `no_zone`, `zone_begin`, `zone_einde` y `zone_herhaling`.
- Discriminacion entre una senal convencional y su equivalente de zona (por ejemplo, limite de velocidad 30 km/h frente a zona de 30 km/h).
- Integracion con el pipeline de Panoramax como cuarta etapa tras deteccion, clasificacion de clase y generacion de codigo negro.
- Entrada esperada: recorte de la senal, no una foto completa de la calle.
- Salida con probabilidades por clase (`r.probs`) y clase top-1 con su confianza.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues; es un clasificador de vision puro.

## Casos de uso

- Inventario de senaletica vial: procesar recortes de senales obtenidos de Panoramax o de campanas propias para etiquetar automaticamente cuales son de zona y cuales no, alimentando bases de datos de infraestructura viaria.
- Enriquecimiento de mapas colaborativos: incorporar la semantica de zona (inicio, repeticion, fin) a los datos de OpenStreetMap u otras bases geograficas a partir de imagenes de calle.
- Validacion de pipelines de deteccion: usar el clasificador como etapa de desambiguacion cuando el detector identifica una senal que admite variante de zona.
- Analisis de cumplimiento y seguridad vial: detectar zonas de velocidad limitada o de peso maximo en estudios de accidentabilidad o planificacion urbana.
- Control de calidad de datasets: filtrar y reclasificar automaticamente recortes de senales en conjuntos de datos de entrenamiento para otros modelos.
- Investigacion en vision aplicada: servir de ejemplo reproducible de descomposicion en etapas de un problema de clasificacion de senaletica con datos abiertos.
- Prototipado en sistemas embebidos o de bajo coste: el tamano nano y la entrada de 224x224 permiten inferencia en CPU o GPU modestas dentro de un pipeline por lotes.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Top-1 accuracy (validacion, 4.760 imagenes) | 96,4% |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un clasificador de vision. Tampoco se ofrecen metricas por clase, matriz de confusion ni latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, inferior a 1 GB en FP32 para un modelo nano de clasificacion; no se especifica cifra exacta.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es sobredimensionada; el modelo puede ejecutarse en CPU sin problema para lotes pequenos.
- Cabe en cualquier GPU consumer y en muchos dispositivos de borde; el cuello de botella sera el pipeline de deteccion previo, no este clasificador.
- Opciones de despliegue: Ultralytics (Python), exportacion a ONNX, TensorRT, OpenVINO u otros formatos soportados por Ultralytics; no se documenta integracion con vLLM, llama.cpp ni TGI, que no aplican.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `akniele/classify_sign_zones` | Clasificacion de zonas en senales NL | no disponible (nano) | 224x224 px | CC BY-SA 4.0 | Hugging Face |
| `Panoramax/detect_face_plate_sign` | Deteccion de sub-senales | no disponible | no disponible | no disponible | Hugging Face |
| Clasificadores YOLO-cls genericos (Ultralytics) | Clasificacion de imagenes general | variable (n/s/m/l/x) | 224x224 px tipico | AGPL-3.0 / Enterprise | Ultralytics |

La comparativa con alternativas de la misma categoria es limitada: no se dispone de datos publicados de otros clasificadores especificos de zonas de senaletica neerlandesa. El modelo debe entenderse como un componente de un pipeline propietario de Panoramax mas que como un modelo autonomo comparable a clasificadores genericos.

## Limitaciones y advertencias

- Entrenado con solo 260 imagenes de entrenamiento y 112 de validacion segun la model card, aunque la evaluacion reporta 4.760 imagenes; la discrepancia sugiere revisar la documentacion antes de confiar en las metricas.
- Solo cubre senaletica neerlandesa; no es transferible sin reentrenamiento a otros paises ni a otros sistemas de senalizacion.
- Requiere recortes de senales como entrada; no funciona sobre fotos completas de calle.
- No se documentan sesgos, riesgos de alucinacion ni analisis de errores por clase; al ser un clasificador, el riesgo principal es la confusion entre clases similares (por ejemplo, `zone_begin` frente a `zone_herhaling`).
- Licencia CC BY-SA 4.0: permite uso comercial pero obliga a atribucion y a compartir bajo la misma licencia las obras derivadas, lo que puede ser restrictivo en productos propietarios.
- El modelo base YOLO de Ultralytics tiene su propia licencia (AGPL-3.0 o licencia Enterprise); conviene verificar la compatibilidad con CC BY-SA 4.0 antes de un despliegue comercial.
- No hay informacion sobre latencia, cuantizacion ni rendimiento en produccion; realizar una validacion propia sobre el dominio objetivo es imprescindible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/akniele/classify_sign_zones
- Detector de sub-senales del pipeline: https://huggingface.co/Panoramax/detect_face_plate_sign
- Detector alternativo referenciado: https://huggingface.co/Panoramax/detect_nl_subsigns
- Dataset base: https://huggingface.co/datasets/Panoramax/Panoramax/classified_nl_road_signs
- Plataforma Panoramax: https://panoramax.fr
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Ultralytics (framework YOLO): https://github.com/ultralytics/ultralytics
