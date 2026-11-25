# Damzyship/air-laser-shooter-pose-v2

## Resumen

air-laser-shooter-pose-v2 es un modelo de visión por computador desarrollado por el usuario Damzyship, publicado en Hugging Face. Se trata de un modelo YOLO11n-Pose entrenado específicamente para detectar y clasificar la postura de la mano al sujetar un puntero o pistola de laser de juguete en el juego **AIR-LASER: VANGUARD**. El modelo resuelve un problema muy concreto: distinguir entre una postura de apuntado relajada (`shoot_aim`) y una de disparo con agarre tenso (`shoot_fire`), infiriendo además tres keypoints de la mano (`grip_base`, `barrel_apex`, `thumb_tip`).

Arquitectnicamente es un YOLO11n-Pose, la variante nano de la familia YOLO11 en su configuración de estimación de pose, con entrada de 416x416 píxeles, dos clases y tres keypoints. El entrenamiento se realizó en una GPU T4 de Google Colab, lo que sitúa el modelo en la gama de entrenamientos ligeros y accesibles. El repositorio tiene un tamaño de 0.0 GB, lo que sugiere que los pesos no están alojados en el repositorio o que el modelo es extremadamente compacto.

La relevancia de este modelo es acotada y de nicho: no es un modelo de propósito general, sino un componente específico para una mecánica de juego concreta. Aun así, resulta interesante como ejemplo de entrenamiento de pose estimation para interacción gestual en tiempo real, con métricas de validación muy altas (mAP50 de 0.9862) que indican un ajuste fino sobre un dominio muy controlado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11n-Pose (detección de objetos + estimación de pose) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 416x416 píxeles) |
| Tipos de cuantizacion | no disponible (se menciona exportación a ONNX y OpenVINO en los tags) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | no disponible |
| Formato de pesos | ONNX (según tags); posiblemente también pesos nativos YOLO, no confirmado |

## Arquitectura y entrenamiento

El modelo es un YOLO11n-Pose, es decir, la variante nano de YOLO11 en configuración de pose estimation. Esta arquitectura combina un backbone de extracción de características con una cabeza que predice simultáneamente cajas delimitadoras, clases y keypoints. En este caso, la salida son dos clases (`shoot_aim` y `shoot_fire`) y tres keypoints (`grip_base`, `barrel_apex`, `thumb_tip`), con una resolución de entrada de 416x416 píxeles.

El entrenamiento se realizó en una GPU T4 de Google Colab. No se especifica el número de imágenes, la composición del dataset, si hubo aumento de datos ni si se aplicaron técnicas de regularización. Tampoco se detalla si se partió de pesos preentrenados de YOLO11n-Pose o de un entrenamiento desde cero, aunque por el tamaño del modelo y el contexto es probable que se haya hecho fine-tuning sobre pesos preentrenados. No se mencionan innovaciones técnicas adicionales más allá del propio pipeline de YOLO11.

## Capacidades

- Detección de dos posturas de la mano: `shoot_aim` (apuntado relajado con puntero) y `shoot_fire` (agarre tenso con disparo).
- Estimación de tres keypoints de la mano: `grip_base`, `barrel_apex` y `thumb_tip`.
- Detección de objetos y pose en una sola pasada (single-stage), adecuada para inferencia en tiempo real.
- Exportación a ONNX y OpenVINO según los tags del repositorio, lo que facilita el despliegue en CPU y aceleradores Intel.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (es un modelo puramente visual).
- No se documentan capacidades de segmentación, tracking multi-objeto ni estimación de pose de cuerpo completo.

## Casos de uso

- **Control gestual en el juego AIR-LASER: VANGUARD**: el modelo detecta si el jugador está apuntando o disparando y emite la acción correspondiente en el juego, sustituyendo o complementando el input de ratón/teclado. Es su caso de uso principal y para el que fue entrenado.
- **Prototipado de interacción sin mando**: al ser un modelo ligero (YOLO11n) exportable a ONNX/OpenVINO, puede integrarse en demos de realidad aumentada o instalaciones interactivas donde el gesto de la mano sustituye a un controlador físico.
- **Sistemas de entrenamiento de puntería**: el modelo puede usarse para evaluar la postura del jugador en un simulador de tiro deportivo o de precisión, detectando si el agarre es el correcto antes de permitir el disparo.
- **Investigación en reconocimiento de gestos**: sirve como baseline para experimentos de clasificación de gestos finos con keypoints, especialmente en entornos controlados con una sola mano y fondo conocido.
- **Despliegue en dispositivos de borde**: gracias a la exportación a OpenVINO y al tamaño reducido de la variante nano, puede ejecutarse en mini-PC, Raspberry Pi con acelerador o portátiles sin GPU dedicada para aplicaciones de visión en tiempo real.
- **Generación de datasets sintéticos o anotación asistida**: el modelo puede pre-anotar imágenes de manos con puntero para acelerar el etiquetado de nuevos datasets de gestos, revisando después las predicciones.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Validation Box mAP50 | 0.9862 |
| Validation Pose mAP50 | 0.9862 |
| Validation Pose mAP50-95 | 0.9792 |

No se han publicado resultados comparativos con otros modelos en la información disponible. Las métricas corresponden únicamente al conjunto de validación del propio autor y no a benchmarks estándar como COCO Keypoints.

## Requisitos de hardware

- **VRAM estimada**: no disponible. Al ser un YOLO11n con entrada 416x416, la huella de memoria es muy reducida (del orden de cientos de MB en FP32, menos en FP16/INT8), pero no se confirma en la información.
- **GPU recomendadas**: el entrenamiento se realizó en una NVIDIA T4. Para inferencia, cualquier GPU consumer moderna (GTX 1650, RTX 3050, RTX 4060, RTX 4090) es más que suficiente.
- **Consumer GPU**: sí, cabe holgadamente en cualquier GPU consumer e incluso en iGPU recientes con OpenVINO.
- **Opciones de despliegue**: ONNX Runtime, OpenVINO (según tags), y presumiblemente Ultralytics YOLO para inferencia con pesos nativos. No se confirma soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de visión).
- **Latencia y throughput**: no disponibles. En una T4 y con entrada 416x416, un YOLO11n suele inferir en pocos milisegundos por imagen, pero no se aporta el dato.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Clases / keypoints | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Damzyship/air-laser-shooter-pose-v2 | YOLO11n-Pose | 416x416 | 2 clases / 3 keypoints | no disponible | Hugging Face |
| YOLO11n-Pose (Ultralytics, preentrenado COCO) | YOLO11n-Pose | 640x640 | 1 clase persona / 17 keypoints | AGPL-3.0 (Ultralytics) | Ultralytics / Hugging Face |
| MediaPipe Hands | Grafo de landmarks | variable | 21 keypoints de mano | Apache 2.0 | Google / MediaPipe |

No se dispone de benchmarks comparativos publicados entre estos modelos en la información proporcionada. La comparativa se limita a características estructurales.

## Limitaciones y advertencias

- **Dominio muy restringido**: el modelo solo reconoce dos posturas concretas de agarre de un puntero/pistola de juguete; no es un detector de gestos general.
- **Sesgos desconocidos**: no se documenta la composición del dataset, por lo que se desconoce si cubre distintas tonalidades de piel, tamaños de mano, iluminaciones o fondos. Es probable que generalice mal fuera de las condiciones de entrenamiento.
- **Riesgo de alucinación**: como todo detector, puede producir falsos positivos en escenas con objetos similares a un puntero o con manos en posturas parecidas.
- **Licencia no disponible**: no se especifica licencia, lo que impide determinar si el uso comercial está permitido. Es un riesgo legal para producción.
- **Sin documentación de entrenamiento**: no se detallan épocas, dataset, aumentos ni proceso de validación, lo que dificulta evaluar la robustez real del modelo.
- **Métricas no comparables**: el mAP50 de 0.9862 se calcula sobre un conjunto de validación propio y no sobre COCO u otro benchmark estándar, por lo que no es directamente comparable con otros modelos de pose.
- **Cero descargas y likes**: el modelo no tiene tracción ni validación por parte de la comunidad, lo que reduce la confianza en su calidad más allá de las métricas declaradas por el autor.
- **Repositorio de 0.0 GB**: no se confirma que los pesos estén realmente alojados; conviene verificar antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Damzyship/air-laser-shooter-pose-v2
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
