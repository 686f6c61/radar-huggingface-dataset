# HanzoHuang/YOLO26-RKNN2-Ultralytics

## Resumen

YOLO26-RKNN2-Ultralytics es un repositorio de modelos YOLO26 de Ultralytics convertidos al formato RKNN2 para su ejecución sobre NPUs de Rockchip (RK3576 y RK3588). Lo publica el usuario HanzoHuang y no entrena ningún modelo nuevo: parte de los checkpoints oficiales de Ultralytics y aplica el flujo de exportación de Ultralytics junto con las herramientas de conversión RKNN específicas por tarea. El resultado son 140 exportaciones en FP16 e INT8 que cubren siete tareas de visión por computador: clasificación, profundidad, detección, OBB (detección de objetos orientados), pose, segmentación y segmentación semántica.

El interés del repositorio es práctico: empaqueta en un único sitio los binarios `.rknn` listos para desplegar, junto con un `manifest.json` que enumera las combinaciones soportadas y sus hashes SHA-256, y un directorio `source` con los checkpoints originales, los scripts de conversión y los registros de entorno y calibración. Esto permite reproducir la conversión y verificar la integridad de cada artefacto, algo poco habitual en repositorios de modelos convertidos.

La relevancia es acotada pero clara para quien despliega visión artificial en placas Rockchip: evita tener que ejecutar el pipeline de conversión de RKNN Toolkit2 desde cero para cada tarea y precisión. No hay información sobre parámetros, contexto ni idiomas porque no es un modelo de lenguaje, sino un conjunto de detectores y cabezas de visión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLO26 (Ultralytics), exportado a formato RKNN2 |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantización | FP16 e INT8 |
| Idiomas soportados | no disponible (modelo de visión) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.rknn` (RKNN2); checkpoints originales en el directorio `source` |

## Arquitectura y entrenamiento

No se ha entrenado ningún modelo en este repositorio. Los pesos de partida son los checkpoints oficiales de Ultralytics YOLO26, y la aportación del autor es la conversión al formato RKNN2 mediante RKNN Toolkit2 2.3.2, herramienta distribuida por separado por Rockchip. El repositorio incluye 140 exportaciones organizadas en `models/<task>/<variant>/<chip>/<precision>/`, cubriendo las tareas de clasificación, profundidad, detección, OBB, pose, segmentación y segmentación semántica, para los chips RK3576 y RK3588 y en precisión FP16 e INT8.

La conversión INT8 requiere calibración: para detección se pasa un YAML de dataset COCO128; para el resto de tareas, una lista de imágenes COCO128, con `--calibration-limit 128` y el tamaño de entrada indicado en el manifiesto. El repositorio documenta el comando `python source/convert-model.py --help`, conserva los registros de entorno y calibración en `source/` y publica las URLs y hashes de los checkpoints originales en `source/weights.json`. No se detalla la composición del dataset de entrenamiento original de YOLO26 ni si hubo etapas de RLHF/DPO, por tratarse de un modelo de visión supervisado.

## Capacidades

- Detección de objetos (task `detect`) en imágenes, con exportaciones FP16 e INT8 para RK3576 y RK3588.
- Segmentación de instancias (task `segment`).
- Segmentación semántica (task `semantic`).
- Estimación de pose (task `pose`).
- Detección de objetos orientados (task `obb`), útil en imágenes aéreas y de satélite.
- Clasificación de imágenes (task `classify`).
- Estimación de profundidad (task `depth`).
- Ejecución sobre NPU de Rockchip mediante RKNN2, no sobre GPU convencional.
- Verificación de integridad de cada artefacto mediante hashes SHA-256 en `manifest.json`.

## Casos de uso

- Detección de objetos en tiempo real en dispositivos embebidos con RK3588: se descarga `models/detect/<variant>/rk3588/int8/model.rknn` junto con su `metadata.yaml` y se integra en la aplicación RKNN para inferencia en la NPU, con la ventaja del INT8 para reducir latencia y consumo.
- Vigilancia y analítica de vídeo en el borde con RK3576: la variante de detección o segmentación permite procesar flujos de cámara sin enviar vídeo a la nube, aprovechando la NPU de bajo consumo del chip.
- Inspección industrial con segmentación de instancias: la tarea `segment` permite delimitar piezas o defectos a nivel de píxel en líneas de producción, con el modelo ejecutándose localmente en la placa.
- Análisis de imágenes aéreas con OBB: la tarea `obb` está pensada para objetos rotados, habitual en fotografía de dron y satélite, y se puede desplegar en el mismo hardware Rockchip.
- Control de presencia y ergonomía con pose: la tarea `pose` permite estimar puntos clave del cuerpo para aplicaciones de seguridad laboral o interactividad, ejecutándose en la NPU sin GPU dedicada.
- Clasificación y filtrado previo en cámaras inteligentes: la tarea `classify` sirve para descartar o priorizar fotogramas antes de tareas más costosas, reduciendo el cómputo total del pipeline.
- Estimación de profundidad monocular en robótica móvil: la tarea `depth` aporta información de distancia a partir de una sola cámara, útil en robots con RK3588 y presupuesto energético limitado.
- Reproducibilidad y auditoría de despliegues: los hashes del manifiesto y los registros de calibración permiten verificar que el binario desplegado corresponde exactamente al publicado y reconstruir la conversión con `source/convert-model.py`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de precisión (mAP, top-1, etc.) ni de latencia o throughput para RK3576 o RK3588.

## Requisitos de hardware

- Hardware objetivo: NPUs de Rockchip RK3576 y RK3588. No está pensado para GPU NVIDIA ni para CPU convencional.
- VRAM: no aplica; el consumo relevante es memoria del sistema y memoria de la NPU del SoC, no cuantificada en la información disponible.
- GPU recomendadas: no aplica. Para la conversión se usa RKNN Toolkit2 2.3.2, que se ejecuta en un entorno de desarrollo x86, no en la placa.
- Cabe en hardware de consumo: sí, en el sentido de que se ejecuta en SoCs Rockchip integrados en placas SBC y dispositivos embebidos; no requiere GPU dedicada.
- Opciones de despliegue: runtime RKNN en el dispositivo; conversión con RKNN Toolkit2 2.3.2; exportación previa con el flujo de Ultralytics.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato | Hardware objetivo | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO26-RKNN2-Ultralytics | RKNN2 (FP16/INT8) | RK3576, RK3588 | classify, depth, detect, obb, pose, segment, semantic | AGPL-3.0 | Hugging Face |
| Checkpoints oficiales YOLO26 (Ultralytics) | PyTorch | GPU/CPU genéricas | las mismas tareas | AGPL-3.0 | Ultralytics / PyPI |
| Exportaciones RKNN de otros autores | RKNN/RKNN2 | Rockchip | variable | variable | Hugging Face / repos comunitarios |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no soporta generación de texto, razonamiento, tool calling ni agentes. Cualquier uso en esos términos es improcedente.
- Solo se ejecuta en NPUs Rockchip RK3576 y RK3588; no es portable a GPU NVIDIA, Apple Silicon ni CPU sin reconversión.
- Las exportaciones INT8 dependen de la calibración con COCO128 (128 imágenes); la precisión puede degradarse en dominios muy distintos al de calibración.
- No se publican métricas de precisión ni de latencia, por lo que no se puede evaluar la pérdida de exactitud de INT8 frente a FP16 sin medirla.
- Licencia AGPL-3.0: el uso en servicios en red puede obligar a liberar el código fuente de la aplicación que integra el modelo; conviene revisarlo antes de un despliegue comercial.
- Los pesos derivan de checkpoints oficiales de Ultralytics, sujetos también a AGPL-3.0; la licencia del repositorio no relaja las obligaciones del upstream.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria conocida.
- Riesgo de sesgos y alucinaciones: no aplica en el sentido de LLM, pero sí existen sesgos propios del dataset de entrenamiento de YOLO26, no documentados aquí.
- No se especifican los idiomas ni el dominio de las clases detectadas más allá de lo que herede YOLO26.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/HanzoHuang/YOLO26-RKNN2-Ultralytics
- Manifiesto de combinaciones y hashes: https://huggingface.co/HanzoHuang/YOLO26-RKNN2-Ultralytics/blob/main/manifest.json
- Directorio de fuentes y scripts: https://huggingface.co/HanzoHuang/YOLO26-RKNN2-Ultralytics/tree/main/source
- Checkpoints originales y hashes: https://huggingface.co/HanzoHuang/YOLO26-RKNN2-Ultralytics/blob/main/source/weights.json
- Licencia: https://huggingface.co/HanzoHuang/YOLO26-RKNN2-Ultralytics/blob/main/LICENSE
- Ultralytics en PyPI: https://pypi.org/project/ultralytics/#history
- RKNN Toolkit2 (Rockchip): https://github.com/airockchip/rknn-toolkit2
