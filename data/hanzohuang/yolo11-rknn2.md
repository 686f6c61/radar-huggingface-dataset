# HanzoHuang/YOLO11-RKNN2

## Resumen

YOLO11-RKNN2 es un repositorio de pesos de la familia YOLO11 exportados y optimizados para su despliegue en aceleradores de inferencia neuronal (NPU) de Rockchip, concretamente en las plataformas RK3576 y RK3588. Lo publica el usuario HanzoHuang en Hugging Face y no es un modelo entrenado desde cero, sino una coleccion de artefactos `.rknn` derivados de los checkpoints originales de YOLO11 y convertidos con RKNN Toolkit2 en su version 2.3.2. El objetivo es permitir que desarrolladores que trabajan con placas Rockchip puedan ejecutar deteccion, segmentacion, pose, OBB y clasificacion sin tener que reproducir el pipeline de conversion por su cuenta.

El repositorio cubre cinco tareas (classify, obb, pose, segment y deteccion, esta ultima implicita en la estructura `models/<task>/...`) y organiza los artefactos por tarea, variante, chip y precision, de modo que un mismo modelo puede desplegarse en distintas combinaciones de hardware y cuantizacion. Cada carpeta incluye el binario `model.rknn` junto con un `metadata.yaml` que describe el modelo y un manifiesto de sumas de verificacion para validar la integridad de los ficheros.

Su relevancia es practica: el ecosistema de NPU Rockchip es muy activo en vision embebida (camaras inteligentes, robots, drones, pasarelas de video), pero la conversion desde PyTorch a RKNN es un proceso delicado que depende de la version del toolkit, del soporte de operadores y de los parametros de cuantizacion. Este repositorio empaqueta ese trabajo y lo publica con trazabilidad de los checkpoints originales en `source/`, lo que reduce el tiempo de puesta en marcha en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11 (red neuronal convolucional de deteccion/segmentacion/pose/clasificacion), exportada a formato RKNN |
| Parametros totales | no disponible (depende de la variante n/s/m/l/x de YOLO11, no especificada en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible en detalle; la estructura incluye un nivel `precision` por chip, pero la model card no enumera los tipos concretos (posiblemente int8/fp16) |
| Idiomas soportados | no disponible (modelo de vision) |
| Licencia | AGPL-3.0 |
| Formato de pesos | RKNN (`.rknn`), con metadatos en `metadata.yaml` y checkpoints originales en `source/` |

## Arquitectura y entrenamiento

La arquitectura subyacente es YOLO11, la familia de detectores de una etapa de Ultralytics, que combina un backbone convolucional con un cuello de agregacion de caracteristicas y cabezas especificas por tarea (deteccion de cajas, mascaras de segmentacion, keypoints de pose, cajas orientadas OBB y logits de clasificacion). Sobre esa base, este repositorio no aporta entrenamiento propio: los pesos proceden de checkpoints originales de YOLO11 y han sido convertidos mediante RKNN Toolkit2 2.3.2 para su ejecucion en las NPU de RK3576 y RK3588. La model card indica que la conversion es "guiada por Rockchip" y "personalizada", lo que sugiere ajustes especificos para que los operadores del grafo sean compatibles con el compilador RKNN.

No se detalla en la informacion disponible el numero de tokens ni la composicion del dataset de entrenamiento original, ni si hubo fases de ajuste fino adicionales. La trazabilidad se limita a `source/weights.json`, que registra la procedencia de los checkpoints, y a las sumas de verificacion del manifiesto, que permiten comprobar que los binarios publicados corresponden a los artefactos declarados. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal, ya que no aplican a este tipo de modelo.

## Capacidades

- Deteccion de objetos: localizacion y clasificacion de objetos en imagenes mediante las cabezas de YOLO11.
- Segmentacion de instancias: generacion de mascaras por objeto para tareas de segmentacion.
- Estimacion de pose: prediccion de keypoints sobre personas u objetos, segun la variante.
- Deteccion con cajas orientadas (OBB): adecuada para objetos rotados en imagenes aereas o de satelite.
- Clasificacion de imagenes: categorizacion de imagen completa mediante la tarea `classify`.
- Despliegue en NPU Rockchip: ejecucion acelerada en RK3576 y RK3588 a traves del runtime RKNN.
- Multiples precisiones por chip: la estructura por `precision` permite elegir variantes de compromiso entre velocidad y exactitud.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues, al no ser un modelo de lenguaje.

## Casos de uso

- Vision embebida en camaras IP: desplegar la variante de deteccion en un RK3588 dentro de una camara para contar personas o vehiculos en tiempo real, aprovechando la NPU y evitando enviar video a la nube.
- Robotica movil: usar la variante de segmentacion o pose en un robot con RK3576 para percibir obstaculos y estimar la postura de operarios en entornos industriales.
- Inspeccion industrial: emplear OBB para detectar defectos en piezas orientadas arbitrariamente sobre una cinta transportadora, con el modelo ejecutandose en la propia linea de produccion.
- Drones y fotogrametria: aplicar la variante OBB a imagenes aereas para localizar edificios, vehiculos o cultivos con orientacion arbitraria, ejecutando la inferencia a bordo.
- Pasarelas de video (NVR): integrar el modelo en un NVR basado en RK3588 para analitica de video multi-canal con bajo consumo energetico.
- Prototipado rapido en placas de bajo coste: descargar `model.rknn` y `metadata.yaml` de la carpeta correspondiente y validar el pipeline completo en una placa Rockchip sin reentrenar ni convertir desde PyTorch.
- Clasificacion en el borde: usar la tarea `classify` para filtrado previo de imagenes en dispositivos con recursos limitados antes de invocar modelos mas pesados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de mAP, latencia, throughput ni comparaciones con otras exportaciones RKNN.

## Requisitos de hardware

- NPU objetivo: Rockchip RK3576 y RK3588, segun la estructura de carpetas `models/<task>/<variant>/<chip>/<precision>/`.
- VRAM: no aplica; estos modelos se ejecutan en NPU con memoria compartida del SoC, no en GPU dedicada.
- GPU recomendadas: no aplica para inferencia; la conversion y validacion previa puede hacerse en un equipo con CUDA, pero no se especifica en la model card.
- Compatibilidad con GPU de consumo: no aplica; el artefacto `.rknn` esta pensado para el runtime RKNN en SoC Rockchip.
- Opciones de despliegue: runtime RKNN de Rockchip (libreria `librknnrt`), integrable en aplicaciones C/C++ o Python mediante la API de RKNN Toolkit2.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Formato | Hardware objetivo | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO11-RKNN2 (este) | RKNN | RK3576, RK3588 | classify, obb, pose, segment, deteccion | AGPL-3.0 | Hugging Face (HanzoHuang) |
| YOLO11 original (Ultralytics) | PyTorch (.pt) | GPU/CPU genericos | deteccion, segmentacion, pose, OBB, clasificacion | AGPL-3.0 | GitHub / PyPI de Ultralytics |
| YOLOv8-RKNN (exportaciones de la comunidad) | RKNN | RK3588, RK3566/3568 | deteccion, segmentacion, pose | AGPL-3.0 | Repositorios de la comunidad y zoo de RKNN Model Zoo |
| YOLOv5 en RKNN Toolkit | RKNN | RK3399, RK3588 | deteccion | GPL-3.0 / AGPL-3.0 segun variante | Zoo oficial de RKNN Model Zoo |

La comparativa se limita a caracteristicas estructurales, ya que no hay datos de rendimiento publicados para este repositorio que permitan una comparacion cuantitativa con las alternativas.

## Limitaciones y advertencias

- No se documentan sesgos especificos, pero al derivar de YOLO11 hereda los sesgos del dataset de entrenamiento original (COCO u otros), no detallados aqui.
- Riesgo de alucinacion en el sentido de falsos positivos y detecciones espurias, especialmente con cuantizacion agresiva a int8; no se aportan metricas de degradacion por precision.
- La model card no especifica las variantes (n/s/m/l/x) incluidas, por lo que el usuario debe inspeccionar la estructura de carpetas para conocer el tamano real de cada artefacto.
- No se detalla que tipos de cuantizacion estan disponibles en el nivel `precision`; conviene verificar `metadata.yaml` antes de asumir int8 o fp16.
- Licencia AGPL-3.0: el uso comercial en servicios en red puede obligar a liberar el codigo fuente del servicio que utilice el modelo; revisar con atencion antes de integrarlo en productos propietarios.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin historial de validacion por parte de la comunidad.
- La fecha de creacion indicada (2026-11-10) es futura respecto a la fecha habitual de publicacion de YOLO11, lo que puede indicar un error en los metadatos del repositorio; conviene verificar la integridad de los artefactos con el manifiesto de sumas de verificacion.
- Dependencia estricta de la version de RKNN Toolkit2 2.3.2 y del firmware de la NPU; versiones distintas del runtime pueden no cargar los binarios.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/HanzoHuang/YOLO11-RKNN2
- Documentacion de YOLO11 (Ultralytics): https://docs.ultralytics.com/models/yolo11/
- RKNN Toolkit2 (Rockchip): https://github.com/airockchip/rknn-toolkit2
- RKNN Model Zoo: https://github.com/airockchip/rknn_model_zoo
- Licencia AGPL-3.0: https://www.gnu.org/licenses/agpl-3.0.html
