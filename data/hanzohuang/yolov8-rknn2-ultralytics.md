# HanzoHuang/YOLOv8-RKNN2-Ultralytics

## Resumen

YOLOv8-RKNN2-Ultralytics es un repositorio de artefactos de inferencia que contiene 100 exportaciones del modelo YOLOv8 de Ultralytics precompiladas para las NPU Rockchip RK3576 y RK3588, en formato RKNN2 y en precisiones FP16 e INT8. Lo publica el usuario HanzoHuang y no entrena ningun modelo nuevo: parte de los checkpoints oficiales de Ultralytics y los convierte con el flujo de exportacion de Ultralytics y las herramientas de conversion RKNN Toolkit2 de Rockchip, de modo que puedan ejecutarse directamente sobre la NPU de estos SoC.

El interes practico esta en que elimina el trabajo de conversion y calibracion para quien despliega vision por computador en placas Rockchip: cubre las cinco tareas de YOLOv8 (clasificacion, deteccion, OBB, pose y segmentacion) y organiza los artefactos en una jerarquia `models/<task>/<checkpoint>/<chip>/<precision>/`, con un `manifest.json` que lista combinaciones validas y hashes SHA-256. El repositorio incluye ademas los checkpoints originales, los scripts de conversion y los registros de entorno y calibracion.

No es un modelo de lenguaje ni un modelo fundacional: es un paquete de binarios `.rknn` con sus metadatos, de 6,6 GB en total, distribuido bajo AGPL-3.0 por herencia de la licencia de los pesos originales de Ultralytics. Su relevancia es de infraestructura: acelera el despliegue de deteccion y segmentacion en edge con NPU dedicada en lugar de GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8 (CNN, familia Ultralytics); exportada a RKNN2 para NPU Rockchip |
| Parametros totales | no disponible (depende del checkpoint de origen; el repositorio no los detalla) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | FP16 e INT8 (calibracion con COCO128) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.rknn` (RKNN2) y checkpoints originales de Ultralytics en el directorio `source/` |

## Arquitectura y entrenamiento

La arquitectura subyacente es YOLOv8, una red convolucional de una sola etapa para vision por computador, en sus variantes de clasificacion, deteccion, orientacion de cajas (OBB), estimacion de pose y segmentacion de instancias. El repositorio no entrena: toma los checkpoints oficiales de Ultralytics y los convierte a RKNN2 mediante el flujo de exportacion de Ultralytics y RKNN Toolkit2. La conversion altera el formato de fichero y, en el caso INT8, cuantiza los grafos.

La calibracion INT8 se realiza con el dataset COCO128: para deteccion se pasa un YAML de COCO128 y para el resto de tareas una lista de imagenes de COCO128, con `--calibration-limit 128` y el tamano de entrada indicado en el manifiesto. El repositorio documenta los comandos (`python source/convert-model.py --help`), conserva los checkpoints originales, los scripts y los registros de entorno y calibracion, y publica las URLs y hashes de los pesos de origen en `source/weights.json`. No se documentan datos de entrenamiento propios, ni RLHF/DPO, ni innovaciones de decodificacion.

## Capacidades

- Deteccion de objetos: localizacion y clasificacion de instancias en imagen, en FP16 e INT8 para RK3576 y RK3588.
- Segmentacion de instancias: mascaras por objeto mediante la variante segment de YOLOv8.
- Estimacion de pose: deteccion de puntos clave sobre personas (variante pose).
- Deteccion orientada (OBB): cajas rotadas para objetos aereos o con orientacion arbitraria.
- Clasificacion de imagen: etiquetado de imagen completa (variante classify).
- Ejecucion en NPU Rockchip: grafos compilados para RK3576 y RK3588, sin necesidad de conversion adicional.
- Verificacion de integridad: hashes SHA-256 por artefacto en `manifest.json`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Vigilancia y conteo de personas en edge: desplegar la variante detect en INT8 sobre un RK3588 permite procesar video en tiempo real en placa sin GPU, con bajo consumo y sin enviar imagenes a la nube.
- Control de calidad industrial: usar segment u OBB para localizar defectos o piezas orientadas en cadenas de produccion, ejecutando la inferencia en la NPU integrada en el equipo.
- Analisis deportivo y biomecanico: la variante pose permite extraer esqueletos de personas en video para analisis de movimiento en dispositivos autonomos.
- Agricultura de precision y dronica: la variante OBB es adecuada para detectar vehiculos, cultivos o infraestructuras vistas desde angulos oblicuos en imagenes aereas.
- Clasificacion de imagenes en kioscos o camaras IP: la variante classify en FP16 ofrece un compromiso de precision y latencia para filtrado previo de contenido en el propio dispositivo.
- Prototipado rapido en placas Rockchip: al incluir checkpoints originales, scripts de conversion y registros de calibracion, sirve como base reproducible para reentrenar o recalibrar con un dataset propio y volver a exportar a RKNN2.
- Sistemas de robotica movil: la combinacion de deteccion y segmentacion en INT8 sobre RK3576 encaja en robots con restricciones termicas y de energia donde no cabe una GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- NPU objetivo: Rockchip RK3576 y RK3588 (grafos RKNN2 compilados especificamente para cada chip).
- VRAM: no aplica; el modelo se ejecuta sobre la NPU del SoC con memoria compartida del sistema, no sobre GPU dedicada.
- GPU recomendadas: no aplica para los artefactos `.rknn`; para reconvertir o reentrenar se requiere un entorno con RKNN Toolkit2 y los checkpoints originales.
- Cabe en consumer GPU: no aplica; el destino es hardware Rockchip embebido.
- Opciones de despliegue: runtime RKNN de Rockchip (RKNN Toolkit2 / libreria rknnrt) sobre el SoC; no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLOv8-RKNN2-Ultralytics | no disponible (segun checkpoint) | no aplica | `.rknn` + checkpoints | AGPL-3.0 | Hugging Face |
| YOLOv8 original (Ultralytics) | no disponible en esta ficha | no aplica | `.pt`, ONNX, etc. | AGPL-3.0 | PyPI / Ultralytics |
| Otros exports RKNN de YOLO | no disponible | no aplica | `.rknn` | variable | repositorios de la comunidad |

La comparativa relevante es frente a los checkpoints originales de Ultralytics: este repositorio anade la conversion y calibracion para NPU Rockchip, pero no mejora la precision del modelo de origen. Frente a otros exports RKNN de la comunidad, la diferencia esta en la cobertura de cinco tareas, dos chips y dos precisiones, y en la trazabilidad mediante manifiesto y hashes.

## Limitaciones y advertencias

- No es un modelo nuevo: la precision y los sesgos son los de los checkpoints oficiales de YOLOv8; la cuantizacion INT8 puede degradar ligeramente la precision frente a FP16.
- La calibracion INT8 se hace con COCO128, un conjunto pequeno y generico; en dominios muy distintos (medico, industrial, aereo) conviene recalibrar con datos propios.
- Los artefactos estan compilados para RK3576 y RK3588 exclusivamente; no son portables a otras NPU ni a GPU.
- Licencia AGPL-3.0: el uso en servicios en red puede obligar a liberar el codigo fuente del servicio; revisar implicaciones antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa documentada.
- No hay benchmarks publicados en la informacion disponible, por lo que el rendimiento real debe medirse en el hardware objetivo.
- No dispone de model card con resultados de evaluacion, solo instrucciones de conversion y organizacion de artefactos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/HanzoHuang/YOLOv8-RKNN2-Ultralytics
- Manifiesto de artefactos: https://huggingface.co/HanzoHuang/YOLOv8-RKNN2-Ultralytics/blob/main/manifest.json
- Directorio de codigo fuente y checkpoints: https://huggingface.co/HanzoHuang/YOLOv8-RKNN2-Ultralytics/tree/main/source
- Pesos de origen y hashes: https://huggingface.co/HanzoHuang/YOLOv8-RKNN2-Ultralytics/blob/main/source/weights.json
- Licencia: https://huggingface.co/HanzoHuang/YOLOv8-RKNN2-Ultralytics/blob/main/LICENSE
- Ultralytics en PyPI: https://pypi.org/project/ultralytics/#history
- RKNN Toolkit2 (Rockchip): https://github.com/airockchip/rknn-toolkit2
