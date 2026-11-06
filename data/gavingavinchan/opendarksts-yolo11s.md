# gavingavinchan/OpenDarkSTS-YOLO11s

## Resumen

OpenDarkSTS-YOLO11s es un detector de objetos basado en la arquitectura YOLO11s de Ultralytics, ajustado para identificar pares candidatos de buques en imagenes satelitales de aproximadamente 10 m/pixel en color verdadero (Sentinel-2). Lo desarrolla Pou Hei Chan (usuario `gavingavinchan`) junto con Madhulika Dey, Sohail Ansari y Paul M. Koola, y constituye el detector por defecto del proyecto OpenDarkSTS, una herramienta de codigo abierto para la deteccion de transferencias de barco a barco (STS, ship-to-ship) en condiciones de flota oscura.

El modelo resuelve un problema de cribado: a partir de una imagen satelital, senala pares de cascos que merecen revision humana, no confirma que exista una transferencia real. Distingue dos clases, `ship` (buque individual) y `ships` (pares candidatos), lo que permite priorizar el analisis de zonas maritimas extensas donde la inspeccion manual es inviable.

Es relevante porque publica pesos entrenados y un conjunto de datos balanceado (1.991 instancias por clase) bajo licencia AGPL-3.0, algo poco habitual en el ambito de la vigilancia maritima, tradicionalmente dominado por soluciones propietarias. El checkpoint esta pensado para integrarse en el pipeline de OpenDarkSTS mediante el comando `opendarksts init`, que descarga y verifica el SHA-256 del fichero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11s (Ultralytics), detector de objetos de una etapa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos `.pt` en precision original) |
| Idiomas soportados | no aplica (modelo de vision sin componente linguistico) |
| Licencia | AGPL-3.0-only |
| Formato de pesos | PyTorch (`.pt`, checkpoint `opendarksts_yolo11s_v4_best.pt`) |
| Tamano de imagen de inferencia | 960 px |
| Clases | `0: ship`, `1: ships` |
| Umbral de confianza por defecto | 0.25 |
| SHA-256 del checkpoint | `cf11d54de2aa2ba3fa74e23d1118482a281b62cd29a95b2b1e58a06e92b261ea` |
| Tamano del repositorio | 0.0 GB (segun Hugging Face) |

## Arquitectura y entrenamiento

YOLO11s es un detector de objetos de una etapa con backbone y cuello convolucionales y cabecera de prediccion densa, disenado para inferencia rapida en imagenes de alta resolucion. El checkpoint parte de pesos preentrenados en COCO (`yolo11s.pt`) y se ajusta con Ultralytics 8.4.23 durante 300 epocas, tamano de imagen 960, batch 8, semilla 42 y paciencia de early stopping de 60.

El conjunto de entrenamiento es `madhulika_rectbbox_plus_manual_sts_balanced_v4`, con 1.991 instancias de cada clase. Combina el conjunto fuente Madhulika rectbbox (ya preaumentado) con imagenes Sentinel-2 revisadas manualmente y aumento especifico de recortes STS aplicado solo al conjunto de entrenamiento. Los metadatos de origen identifican el proyecto Roboflow `fleetdatascience/data-science-dark-fleet` (version 7) como dominio publico. El detalle de reproduccion del peso, incluida la laguna de reproducibilidad reconocida por el autor, esta documentado en `weight_recreation.md` del repositorio.

## Capacidades

- Deteccion de buques individuales en imagenes satelitales Sentinel-2 de ~10 m/pixel en color verdadero.
- Deteccion de pares candidatos de buques proximos (clase `ships`), orientada a la revision de posibles transferencias STS.
- Salida de cajas delimitadoras con puntuacion de confianza por instancia.
- Funcionamiento sobre recortes o mosaicos de imagenes de gran extension, con posible repeticion de candidatos en solapamientos.
- Integracion nativa con el ecosistema Ultralytics (entrenamiento, validacion, exportacion e inferencia).
- No incluye capacidades de texto, tool calling, agentes, vision general, audio ni razonamiento multi-paso.

## Casos de uso

- Cribado de zonas maritimas extensas: procesar mosaicos Sentinel-2 y priorizar las cajas de clase `ships` para revision humana, reduciendo el volumen de imagenes a inspeccionar manualmente.
- Vigilancia de flotas oscuras: combinar las detecciones con datos AIS para senalar pares de buques sin transpondedor o con posiciones incoherentes, como parte del pipeline OpenDarkSTS.
- Analisis de transferencias STS en aguas internacionales: generar candidatos en zonas de transbordo conocidas y remitirlos a analistas para verificacion.
- Monitorizacion periodica de areas de interes: ejecutar el detector sobre series temporales de Sentinel-2 para detectar concentraciones recurrentes de pares de buques.
- Investigacion academica en vision por satelite: usar el checkpoint y el dataset balanceado como linea base reproducible para comparar arquitecturas de deteccion en imagenes maritimas.
- Prototipado de sistemas de alerta temprana: integrar el modelo en flujos automatizados que generen alertas cuando aparezcan pares candidatos en regiones vigiladas, con validacion humana posterior.
- Auditoria de datos y anotacion asistida: emplear las detecciones como preanotaciones para acelerar el etiquetado de nuevos conjuntos de imagenes maritimas.

## Benchmarks y rendimiento

Resultados en el conjunto de test reservado (21 imagenes, 92 instancias), tamano de imagen 960, reproducidos de la seccion "Headline detector --- YOLO11s per-class results" del paper SNAME 2026:

| Clase | Instancias | Precision | Recall | mAP50 | mAP50-95 |
|---|---:|---:|---:|---:|---:|
| `ship` | 62 | 0.812 | 0.806 | 0.869 | 0.512 |
| `ships` | 30 | 0.849 | 0.833 | 0.920 | 0.575 |
| Todas | 92 | 0.830 | 0.820 | 0.895 | 0.544 |

Segun la model card, YOLO11s obtuvo el mayor mAP50 global entre las once arquitecturas comparadas en el paper; YOLOv12n alcanzo el mejor mAP50-95 (0.572). El autor advierte que son metricas registradas en test, no un benchmark independiente nuevo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; al tratarse de un YOLO11s (variante pequena) se espera un consumo moderado, pero no se confirma cifra alguna.
- GPU recomendadas: no disponible. Por el perfil de la arquitectura, cabe esperar buen rendimiento en GPU consumer recientes (por ejemplo, RTX 4090) y en aceleradores de datacenter (A100, H100), si bien el autor no publica recomendaciones.
- Cabe en GPU consumer: no confirmado en la informacion disponible.
- Opciones de despliegue: Ultralytics (libreria oficial), pipeline OpenDarkSTS (`opendarksts init`), exportacion a formatos soportados por Ultralytics (no detallados en la model card). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | mAP50 (test SNAME) | mAP50-95 (test SNAME) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| OpenDarkSTS-YOLO11s | no disponible | imagen 960 px | 0.895 | 0.544 | AGPL-3.0 | Hugging Face + repo OpenDarkSTS |
| YOLOv12n (comparado en el paper) | no disponible | no disponible | por debajo de 0.895 | 0.572 (mejor del estudio) | no disponible | no disponible |
| YOLO26n (checkpoint alternativo del proyecto) | no disponible | no disponible | no disponible (dataset distinto) | no disponible | AGPL-3.0 (proyecto) | repo OpenDarkSTS |

La model card indica que YOLO11s quedo primero en mAP50 entre once arquitecturas, pero no ofrece la tabla completa de resultados por arquitectura, por lo que no es posible detallar el resto de comparaciones. El checkpoint YOLO26n usa un conjunto de datos distinto y sus puntuaciones no son sustituibles por las del paper.

## Limitaciones y advertencias

- El conjunto de test tiene solo 21 imagenes, por lo que las metricas tienen alta incertidumbre estadistica.
- El dataset v4 deriva de un conjunto fuente preaumentado, de modo que algunas imagenes de test comparten escenas con las de entrenamiento; los resultados no demuestran generalizacion a escenas independientes.
- Un par de buques visible no implica transferencia, identidad de buque, carga, estado del transpondedor ni legalidad; el modelo solo genera candidatos para revision humana.
- Cascos pequenos u ocluidos, nubes, estelas, puertos, imagenes de baja resolucion y regiones no familiares pueden producir falsos negativos y falsos positivos.
- Cajas o mosaicos solapados pueden generar candidatos repetidos.
- La comparacion con AIS usa cualquier posicion valida dentro del radio el mismo dia UTC, sin ventana de adquisicion, asociacion de trayectorias ni identificacion de casco; la cobertura AIS es de EE. UU. y los datos ausentes o invalidos quedan como desconocidos.
- Licencia AGPL-3.0-only: impone obligaciones de copyleft fuerte para uso en red y distribucion, lo que condiciona su integracion en productos propietarios.
- No se documentan sesgos especificos del modelo ni evaluaciones de robustez fuera del conjunto de test descrito.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gavingavinchan/OpenDarkSTS-YOLO11s
- Descarga directa del checkpoint: https://huggingface.co/gavingavinchan/OpenDarkSTS-YOLO11s/resolve/main/opendarksts_yolo11s_v4_best.pt
- Dataset de entrenamiento: https://huggingface.co/datasets/gavingavinchan/OpenDarkSTS-v4-balanced
- Dataset de anotaciones: https://huggingface.co/datasets/gavingavinchan/OpenDarkSTS-annotations
- Repositorio del proyecto: https://github.com/gavingavinchan/OpenDarkSTS
- Documentacion de reproduccion del peso: https://github.com/gavingavinchan/OpenDarkSTS/blob/main/opendarksts/assets/weight_recreation.md
- Documentacion del checkpoint YOLO26n alternativo: https://github.com/gavingavinchan/OpenDarkSTS/blob/main/docs/yolo_weight_recreation.md
