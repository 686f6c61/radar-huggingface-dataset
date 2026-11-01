# Deveyn/coach-rules-models

## Resumen

`Deveyn/coach-rules-models` no es un modelo de lenguaje, sino un repositorio espejo de artefactos de inferencia en formato ONNX empleados por el Space `Deveyn/coach-rules`. Su funcion es servir como origen unico de descarga durante la construccion de la imagen Docker de dicho Space, de modo que el pipeline de despliegue no dependa de multiples repositorios externos.

El repositorio agrupa tres familias de artefactos: el modelo SOMA de NVIDIA MotionBricks (`mmm_v6_soma_fp32.onnx` junto con su manifiesto y assets de referencia), un export ONNX de YOLOv8n de Ultralytics para deteccion de objetos y un export ONNX de YOLO11s-pose para estimacion de pose con entrada de 640x640 y lote de 1. No contiene pesos de un transformer generativo ni ningun modelo conversacional.

Su relevancia es operativa mas que cientifica: facilita la reproducibilidad del build del Space al centralizar binarios que de otro modo habria que recuperar de GitHub, Hugging Face y releases de Ultralytics. El tamano del repositorio es de 0,8 GB y la licencia declarada es `other`, lo que refleja la mezcla de licencias de los artefactos que contiene (Apache-2.0, CC-BY-4.0 y AGPL-3.0).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (conjunto heterogeneo: modelo SOMA de MotionBricks y detectores YOLO en ONNX) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible; el artefacto SOMA se distribuye en FP32 (`mmm_v6_soma_fp32.onnx`) |
| Idiomas soportados | No disponible |
| Licencia | `other` (Apache-2.0 para codigo MotionBricks, CC-BY-4.0 para assets, AGPL-3.0 para los exports de Ultralytics) |
| Formato de pesos | ONNX (`.onnx`), con manifiesto y assets auxiliares en `.json` y `.npy` |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura propia ni documenta un proceso de entrenamiento. Los componentes incluidos son artefactos ya entrenados por terceros y exportados a ONNX. El modelo SOMA (`mmm_v6_soma_fp32.onnx`) proviene de NVIDIA MotionBricks, un motor de generacion y control de movimiento, y se acompana de un manifiesto (`soma_*.json/.npy`) y de assets de referencia con movimientos de muestra y Smart Primitives consumidos por el motor.

Los otros dos artefactos son exports de Ultralytics: YOLOv8n, la variante nano del detector de objetos, exportada a ONNX, y YOLO11s-pose, la variante small del modelo de estimacion de pose, exportada mediante `yolo export format=onnx imgsz=640 batch=1` a partir del checkpoint oficial `yolo11s-pose.pt`. No se documentan en la model card detalles de dataset, numero de tokens, tecnicas de alineacion ni innovaciones de decodificacion, por lo que cualquier dato de entrenamiento de estos componentes debe consultarse en sus repositorios de origen.

## Capacidades

- Generacion y control de movimiento mediante el modelo SOMA de NVIDIA MotionBricks, con soporte de Smart Primitives y assets de referencia.
- Deteccion de objetos con YOLOv8n exportado a ONNX.
- Estimacion de pose con YOLO11s-pose exportado a ONNX a resolucion de 640x640.
- Inferencia via runtime ONNX, sin dependencia de frameworks de deep learning completos.
- No incluye generacion de texto, razonamiento, codigo, matematicas ni vision-lenguaje.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Sin capacidades multilingues declaradas.
- No dispone de modo thinking, audio ni procesamiento de lenguaje natural.

## Casos de uso

- Construccion reproducible de imagenes Docker: el Space `Deveyn/coach-rules` descarga los binarios desde este unico repositorio durante el build, lo que simplifica el Dockerfile y reduce puntos de fallo por URLs externas.
- Analisis de movimiento en tiempo real: el modelo SOMA permite generar y controlar secuencias de movimiento que el motor de MotionBricks puede consumir directamente desde el manifiesto incluido.
- Deteccion de objetos en pipelines de vision embebida: YOLOv8n en ONNX es adecuado para dispositivos con recursos limitados por su tamano reducido y su runtime ligero.
- Estimacion de pose para analisis deportivo o biomecanico: YOLO11s-pose a 640x640 permite extraer keypoints de una persona por fotograma, util para evaluar postura o tecnica.
- Prototipado de sistemas de vision sin GPU dedicada: los tres artefactos ONNX pueden ejecutarse con ONNX Runtime en CPU, lo que facilita entornos de desarrollo y pruebas.
- Espejo de artefactos para entornos aislados: al centralizar binarios de distintas fuentes, el repositorio sirve como cache para despliegues con acceso restringido a internet.
- Evaluacion comparativa de detectores: disponer de YOLOv8n y YOLO11s-pose en el mismo repositorio permite comparar deteccion generica frente a estimacion de pose con el mismo runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio no documenta requisitos de memoria para ninguno de los artefactos.
- GPU recomendadas: no disponible. Al ser artefactos ONNX, pueden ejecutarse tanto en CPU como en GPU compatibles con ONNX Runtime, pero no se especifican modelos concretos.
- Cabe en GPU de consumo: previsiblemente si, dado que YOLOv8n y YOLO11s-pose son variantes nano y small, pero no se aportan mediciones que lo confirmen.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), asi como cualquier runtime compatible con ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a estos artefactos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Deveyn/coach-rules-models | Repositorio espejo de artefactos ONNX | No disponible | No aplica | `other` (mixta) | Hugging Face |
| NVlabs/motionbricks | Motor de movimiento SOMA | No disponible | No aplica | Apache-2.0 / CC-BY-4.0 | GitHub y Hugging Face |
| Ultralytics YOLOv8n | Detector de objetos | No disponible | No aplica | AGPL-3.0 | GitHub y Hugging Face |
| Ultralytics YOLO11s-pose | Estimador de pose | No disponible | No aplica | AGPL-3.0 | GitHub y Hugging Face |

La comparativa es limitada porque este repositorio no es un modelo entrenado de forma independiente, sino una agregacion de artefactos de los proyectos anteriores. Cualquier evaluacion de rendimiento debe hacerse sobre los repositorios de origen.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no puede emplearse para generacion de texto, razonamiento, codigo ni tareas conversacionales.
- La licencia `other` agrega componentes con licencias distintas; el uso comercial requiere revisar cada artefacto por separado.
- Los exports de Ultralytics estan bajo AGPL-3.0, lo que impone obligaciones de copyleft sobre el codigo que los integra en servicios en red.
- Los assets de MotionBricks estan bajo CC-BY-4.0 y requieren atribucion.
- El modelo SOMA se distribuye en FP32, lo que incrementa el tamano del repositorio (0,8 GB) y el consumo de memoria en inferencia.
- No se documentan sesgos, tasas de alucinacion ni limitaciones de idioma porque no aplican a estos artefactos.
- El repositorio tiene 0 descargas y 0 likes, y no se ha publicado informacion sobre validacion o pruebas de los binarios.
- No se especifican versiones de ONNX Runtime ni opsets compatibles, lo que puede provocar problemas de portabilidad entre entornos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Deveyn/coach-rules-models
- Space asociado: https://huggingface.co/spaces/Deveyn/coach-rules
- NVIDIA MotionBricks (GitHub): https://github.com/NVlabs/motionbricks
- NVIDIA MotionBricks (Hugging Face): https://huggingface.co/nvidia/MotionBricks
- Export YOLOv8n ONNX de referencia: https://huggingface.co/s1777/yolo-v8n-onnx
- Releases de Ultralytics (checkpoints oficiales): https://github.com/ultralytics/assets/releases
