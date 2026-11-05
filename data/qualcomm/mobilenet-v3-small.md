# qualcomm/MobileNet-v3-Small

## Resumen

MobileNet-v3-Small es una red neuronal convolucional (CNN) para clasificación de imágenes, originalmente propuesta por Google en el paper "Searching for MobileNetV3" (arXiv:1905.02244). Qualcomm publica en HuggingFace una versión del modelo exportada y optimizada para ejecutarse en dispositivos con aceleración NPU de Qualcomm, incluyendo SoCs Snapdragon y plataformas Dragonwing. El modelo clasifica imágenes del dataset ImageNet y también puede emplearse como backbone en arquitecturas más complejas.

La relevancia de esta ficha no está en la arquitectura en sí (un modelo compacto de 2,54 millones de parámetros con entrada de 224x224), sino en el trabajo de despliegue que aporta Qualcomm: pesos pre-exportados en ONNX, QNN_DLC y TFLite, con precisiones float y w8a16_mixed_int16, listos para ejecutarse en NPU con latencias inferiores al milisegundo en varios chipsets. Esto lo convierte en una pieza útil para desarrolladores que necesitan clasificación de imágenes en tiempo real en el borde (edge), sin entrenamiento adicional.

El modelo se distribuye bajo licencia BSD-3-Clause, lo que facilita su uso comercial e integración en productos. Está pensado para tareas de visión por computador de bajo coste computacional: clasificación, extracción de características y como base de modelos mayores en pipelines de inferencia en dispositivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN MobileNetV3-Small (bloques con búsqueda de arquitectura, activaciones h-swish) |
| Parametros totales | 2,54 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 224x224) |
| Tipos de cuantizacion | float y w8a16_mixed_int16 (exportados); soporte de exportación personalizada vía AI Hub Models |
| Idiomas soportados | no disponible (clasificación de imágenes ImageNet en inglés, 1000 clases) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX, QNN_DLC, TFLite (también checkpoint PyTorch de origen) |

## Arquitectura y entrenamiento

MobileNetV3-Small es una CNN diseñada mediante búsqueda de arquitectura (NAS) combinada con búsqueda de hiperparámetros, e incorpora bloques invertidos residuales con conexiones skip, capas de squeeze-and-excitation y activaciones h-swish. Su objetivo es maximizar la eficiencia computacional manteniendo una precisión razonable en ImageNet. El checkpoint distribuido por Qualcomm corresponde a los pesos de ImageNet, es decir, un modelo preentrenado para las 1000 clases estándar, no afinado para dominios específicos.

Qualcomm no documenta en la model card el número de tokens ni la composición exacta del dataset de entrenamiento original (más allá de ImageNet), ni si hubo fases de RLHF/DPO (no aplicables a un modelo de clasificación). La innovación relevante de esta distribución es el pipeline de exportación y compilación mediante Qualcomm AI Hub Workbench, que genera artefactos optimizados para NPU (QNN_DLC) y para ONNX Runtime, con variantes de precisión mixta int16/int8 pensadas para reducir el uso de memoria sin degradar significativamente la exactitud.

## Capacidades

- Clasificación de imágenes en 1000 clases de ImageNet a resolución 224x224.
- Extracción de características (backbone) para modelos de visión de mayor complejidad.
- Inferencia en tiempo real en NPU de Qualcomm con latencias sub-milisegundo en varios chipsets.
- Ejecución en dispositivo (on-device) sin conexión a red.
- Exportación con formas de entrada personalizadas y pesos afinados mediante la librería AI Hub Models.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües ni de audio.

## Casos de uso

- Clasificación de imágenes en tiempo real en aplicaciones Android: el modelo puede integrarse mediante ONNX Runtime o QNN para etiquetar fotogramas de cámara con latencias de 0,25 a 0,8 ms en NPU, adecuado para filtros, categorización automática de fotos o accesibilidad.
- Preprocesado en pipelines de visión en el borde: usar el modelo como extractor de características antes de un clasificador específico de dominio, reduciendo el coste de cómputo frente a backbones más grandes.
- Detección de contenido en dispositivos de bajo consumo: clasificación rápida de imágenes en wearables o cámaras IP con SoC Snapdragon, donde el consumo energético es crítico.
- Automatización de inventario visual: etiquetado de productos en aplicaciones de retail móvil, aprovechando la inferencia local para preservar la privacidad del usuario.
- Moderación de contenido preliminar en el dispositivo: filtrado rápido de imágenes antes de enviarlas a un servicio en la nube, reduciendo ancho de banda y coste.
- Prototipado con AI Hub Workbench: exportar el modelo con formas de entrada y pesos personalizados para validar latencias y consumo en chipsets concretos antes de la integración final.
- Base para fine-tuning en dominios específicos: al ser un backbone ligero, puede reentrenarse para clasificación médica, agrícola o industrial con requisitos de cómputo modestos.

## Benchmarks y rendimiento

La model card no incluye métricas de precisión (top-1/top-5 en ImageNet). Sí incluye latencias de inferencia medidas por Qualcomm en NPU para distintos chipsets y precisiones:

| Chipset | Precision | Tiempo de inferencia (ms) | Memoria pico (MB) | Unidad de cómputo |
|---|---|---|---|---|
| Snapdragon 8 Elite Gen 5 for Galaxy | float | 0,248 | 0-34 | NPU |
| Snapdragon 8 Elite for Galaxy | float | 0,286 | 0-37 | NPU |
| Snapdragon X2 Elite | float | 0,248 | 2-2 | NPU |
| Snapdragon X Elite | float | 0,554 | 5-5 | NPU |
| Snapdragon 8 Gen 3 | float | 0,364 | 0-49 | NPU |
| Snapdragon 8 Gen 1 | float | 0,802 | 1-57 | NPU |
| Dragonwing IQ-8275 | float | 0,663 | 1-5 | NPU |
| Dragonwing QCS8550 (Proxy) | float | 0,552 | 0-9 | NPU |
| QCS8450 | float | 0,802 | 1-57 | NPU |
| Dragonwing IQ-9075 | float | 0,72 | 1-4 | NPU |
| Dragonwing IQ-X7181 | float | 0,554 | 5-5 | NPU |
| Dragonwing Q-8750 | float | 0,286 | 0-37 | NPU |
| Snapdragon 8 Elite Gen 5 for Galaxy | w8a16_mixed_int16 | 0,241 | 0-37 | NPU |
| Snapdragon 8 Elite for Galaxy | w8a16_mixed_int16 | 0,279 | 0-36 | NPU |
| Snapdragon X2 Elite | w8a16_mixed_int16 | 0,235 | 1-1 | NPU |
| Snapdragon X Elite | w8a16_mixed_int16 | 0,568 | 0-0 | NPU |
| Snapdragon 8 Gen 3 | w8a16_mixed_int16 | 0,383 | 0-51 | NPU |
| Dragonwing IQ-8275 | w8a16_mixed_int16 | 0,601 | 0-4 | NPU |
| Dragonwing QCS8550 (Proxy) | w8a16_mixed_int16 | 0,571 | 0-6 | NPU |
| Dragonwing IQ-9075 | w8a16_mixed_int16 | 0,702 | 0-3 | NPU |
| Dragonwing IQ-X7181 | w8a16_mixed_int16 | 0,568 | 0-0 | NPU |

No se han publicado resultados de precisión (top-1/top-5) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo float ocupa 9,71 MB; en cuantización w8a16_mixed_int16 el peso es aún menor. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: para despliegue en servidor, cualquier GPU NVIDIA (RTX 4090, A100, H100) puede ejecutarlo, aunque el modelo está pensado para NPU de Qualcomm; en ese contexto, el hardware objetivo son SoCs Snapdragon y plataformas Dragonwing.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1 GB de VRAM; también en CPU y en NPU integradas.
- Opciones de despliegue: ONNX Runtime (1.30.0), QAIRT 2.50 (QNN_DLC), TFLite, y exportación personalizada mediante Qualcomm AI Hub Models. No se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: latencias de 0,235 a 0,802 ms por inferencia en NPU según chipset y precisión (ver tabla de benchmarks). El throughput no se documenta explícitamente, pero a esas latencias se superan las 1.000 inferencias por segundo en los chipsets más rápidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MobileNet-v3-Small (Qualcomm) | 2,54 M | 224x224 | no aplica | BSD-3-Clause | HuggingFace + AI Hub |
| MobileNet-v3-Large | no disponible en la información | 224x224 | no aplica | BSD-3-Clause (torchvision) | torchvision / HuggingFace |
| EfficientNet-B0 | no disponible en la información | 224x224 | no aplica | Apache 2.0 (referencia) | torchvision / HuggingFace |
| ResNet-50 | no disponible en la información | 224x224 | no aplica | BSD-3-Clause (referencia) | torchvision / HuggingFace |

No se dispone de datos de precisión comparada en la información proporcionada; la comparativa se limita a parámetros, licencia y disponibilidad. MobileNet-v3-Small es la opción de menor coste computacional del grupo, a costa de una precisión inferior frente a MobileNet-v3-Large, EfficientNet-B0 o ResNet-50.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en ImageNet (1000 clases); su precisión fuera de ese dominio puede degradarse notablemente sin fine-tuning.
- No se han publicado métricas de precisión (top-1/top-5) en la información disponible, por lo que no es posible evaluar su rendimiento real frente a alternativas sin pruebas propias.
- Riesgo de sesgos heredados del dataset ImageNet: desequilibrios demográficos, culturales y de representación en las clases.
- No soporta texto, audio, tool calling ni razonamiento multi-paso; su uso está acotado a visión por computador.
- La licencia BSD-3-Clause permite uso comercial, pero conviene revisar las condiciones de los artefactos exportados y de QAIRT/ONNX Runtime, que pueden tener licencias propias.
- Las latencias reportadas son medidas por Qualcomm en condiciones controladas; el rendimiento real puede variar según el dispositivo, la carga del sistema y la versión del runtime.
- El modelo no incluye cabecera de detección ni segmentación; para esas tareas se requiere un backbone adaptado.

## Enlaces

- HuggingFace: https://huggingface.co/qualcomm/MobileNet-v3-Small
- Paper original: https://arxiv.org/abs/1905.02244
- Implementación de referencia en torchvision: https://github.com/pytorch/vision/blob/main/torchvision/models/mobilenetv3.py
- Repositorio AI Hub Models: https://github.com/qualcomm/ai-hub-models/blob/v0.66.0/src/qai_hub_models/models/mobilenet_v3_small
- Página del modelo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/mobilenet_v3_small
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Web de Qualcomm: https://www.qualcomm.com/
