# nrl-ai/anylearning-rfdetr-locust-keypoints

## Resumen

El modelo **AnyLearning RF-DETR Desert Locust Keypoints** es un checkpoint de detección de puntos clave (keypoints) para la langosta del desierto, desarrollado por Neural Research Lab (nrl-ai) y entrenado de extremo a extremo con la plataforma open-source AnyLearning. Se basa en la arquitectura RF-DETR de Roboflow, un detector de objetos en tiempo real con cabeza de predicción de keypoints, y está diseñado para detectar una langosta y predecir 35 hitos anatómicos nombrados.

El modelo resuelve el problema de la estimación de pose animal en imágenes controladas, un caso de uso habitual en biología y agricultura. Su relevancia radica en que demuestra el flujo completo de fine-tuning de RF-DETR para keypoints sobre un dataset público, con pesos liberados bajo licencia Apache-2.0 y un grafo ONNX verificado para inferencia. El repositorio incluye el checkpoint nativo en PyTorch, el modelo exportado a ONNX con entrada fija de 576×576 píxeles, y metadatos de configuración y evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR (real-time DETR con cabeza de keypoints) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (entrenamiento con bfloat16, pero sin cuantizacion de inferencia publicada) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (.pth) y ONNX (.onnx) |

## Arquitectura y entrenamiento

RF-DETR es una arquitectura de deteccion de objetos en tiempo real desarrollada por Roboflow, basada en el paradigma DETR (transformer) y optimizada para fine-tuning. En esta variante, se anade una cabeza de prediccion de keypoints que produce 35 puntos anatomicos ademas de la caja delimitadora. El modelo se entrena sobre el dataset publico Desert Locust de DeepPoseKit-Data, que contiene 630 imagenes de entrenamiento y 70 de validacion, todas de 160×160 píxeles en escala de grises, con una langosta anotada por imagen.

El entrenamiento parte del checkpoint oficial de RF-DETR Keypoint Preview y se realiza en dos fases: 5 epocas iniciales y 10 epocas adicionales, con batch size 2, acumulacion de gradientes de 4, learning rate de 5e-5, entrada de 576 píxeles, precision mixta bfloat16 y aumento de datos con volteo horizontal. El emparejamiento de landmarks izquierdo/derecho para el volteo queda registrado en el archivo `config.yml`. No se mencionan tecnicas de RLHF ni DPO, al tratarse de un modelo de vision.

## Capacidades

- Deteccion de una langosta del desierto en una imagen y prediccion de 35 landmarks anatomicos (cabeza, torax, abdomen, patas, etc.).
- Salida simultanea de caja delimitadora (box) y puntos clave, con umbrales configurables en `config.yml`.
- Exportacion a ONNX con grafo verificado y entrada fija `1 × 3 × 576 × 576`, lo que facilita su integracion en entornos de produccion con ONNX Runtime.
- Soporte de inferencia en imagenes individuales, aunque no se documenta soporte para video o streams en este checkpoint concreto.
- No incluye capacidades de texto, tool calling, agentes ni razonamiento multimodal.

## Casos de uso

- **Investigacion en etologia**: seguimiento de la pose de langostas del desierto en experimentos de comportamiento, donde los 35 landmarks permiten cuantificar angulos articulares y patrones de movimiento.
- **Monitorizacion de plagas agricolas**: deteccion y analisis de langostas en imagenes de trampas o camaras fijas, con la caja delimitadora para conteo y los keypoints para clasificar estados de desarrollo.
- **Validacion de pipelines de vision por computador**: el grafo ONNX verificado sirve como referencia para probar despliegues en CPU o GPU con ONNX Runtime, midiendo latencia y precision en entornos controlados.
- **Fine-tuning para otras especies**: al ser un checkpoint de partida, puede adaptarse a otros animales con pocas imagenes anotadas, siguiendo el flujo de AnyLearning o el entrenamiento estandar de RF-DETR.
- **Educacion y divulgacion**: ejemplo didactico de estimacion de pose animal con un modelo open-source, util para cursos de deep learning aplicado a vision.
- **Comparacion de metodos**: punto de referencia para evaluar otras arquitecturas de keypoint detection en datasets de insectos, dado que se publican metricas detalladas de validacion.

## Benchmarks y rendimiento

Los resultados oficiales declarados por el autor en la model card son los siguientes:

| Metrica | Valor |
|---|---|
| Keypoint mAP (50:95) | 0.846 |
| Keypoint mAP@50 | 1.000 |
| Keypoint mAP (EMA) | 0.849 |
| Box mAP (50:95) | 0.975 |
| Box mAP@50 | 1.000 |

Ademas, se realizo una prueba de inferencia sobre una imagen de validacion excluida del entrenamiento, con los siguientes resultados:

| Metrica | Valor |
|---|---|
| Error medio | 2.45 px |
| Error mediana | 1.70 px |
| PCK@5 px | 91.4% |
| PCK@10 px | 97.1% |
| Error maximo | 11.71 px |

Estas cifras corresponden exclusivamente al split de validacion de 70 imagenes. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- El tamano del repositorio es de 0.3 GB, lo que sugiere un modelo ligero, probablemente con menos de 50 millones de parametros (dato no confirmado).
- La entrada ONNX es de 576×576 píxeles, por lo que la inferencia puede ejecutarse en GPUs consumer como una RTX 3060 o incluso en CPU con ONNX Runtime, aunque la latencia dependera del hardware.
- No se especifican requisitos de VRAM, pero al ser un modelo de deteccion de un solo objeto, es razonable estimar un consumo inferior a 2 GB en FP32 y menos de 1 GB en cuantizacion (no publicada).
- Opciones de despliegue: ONNX Runtime para produccion, PyTorch para investigacion, y posiblemente integracion con frameworks de vision como OpenCV o Albumentations.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de informacion comparativa con otros modelos de keypoint detection en la documentacion proporcionada. Se podria comparar con el modelo base RF-DETR Keypoint Preview (que predice 17 keypoints de persona con 71.8 AP en COCO), pero no hay datos de rendimiento sobre langostas para ese modelo. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- El dataset de entrenamiento es muy reducido (630 imagenes) y contiene un unico individuo, con imagenes fijas de 160×160 en escala de grises y fondo controlado. El modelo puede no generalizar a otras especies, poses, condiciones de iluminacion, oclusiones o camaras diferentes.
- Las metricas reportadas corresponden a un split especifico; no hay garantia de rendimiento en datos externos. Se recomienda evaluar el modelo con datos propios antes de usarlo en produccion.
- Riesgo de alucinacion de keypoints en imagenes fuera de distribucion, especialmente si la langosta aparece parcialmente ocluida o en posturas no representadas en el entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero exige preservar la atribucion y citar a Graving et al. (2019) segun se indica en la model card.
- No se documentan sesgos especificos, pero al ser un modelo entrenado con un solo individuo, es probable que exista sesgo hacia esa morfologia concreta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nrl-ai/anylearning-rfdetr-locust-keypoints
- Dataset de entrenamiento: https://huggingface.co/datasets/nrl-ai/anylearning-data
- Repositorio AnyLearning OSS: https://github.com/nrl-ai/anylearning-oss
- Repositorio RF-DETR (Roboflow): https://github.com/roboflow/rf-detr
- Documentacion de keypoints de RF-DETR: https://rfdetr.roboflow.com/latest/learn/run/keypoints/
- Web de AnyLearning: https://anylearning.nrl.ai/
- Web de Neural Research Lab: https://www.nrl.ai/
