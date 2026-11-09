# onnx-community/transformers_resnet18_cifar100-ONNX

## Resumen

`onnx-community/transformers_resnet18_cifar100-ONNX` es la version en formato ONNX de un modelo ResNet-18 afinado sobre el conjunto de datos CIFAR-100. El modelo original (`fullstuck/transformers_resnet18_cifar100`) parte de `microsoft/resnet-18` y fue entrenado con la libreria Transformers 4.37.2 y PyTorch 2.1.0. Esta version ONNX ha sido convertida y publicada automaticamente por la comunidad `onnx-community` mediante su Space de conversion, con el objetivo de que el modelo pueda ejecutarse en el navegador o en Node.js a traves de Transformers.js.

Se trata de una red neuronal convolucional (CNN) de tipo ResNet, no de un transformer generativo. Su pipeline declarado es `image-feature-extraction`, es decir, extraccion de caracteristicas visuales a partir de imagenes. Con aproximadamente 11,7 millones de parametros en su variante estandar ResNet-18, es un modelo ligero pensado para tareas de vision por computador en entornos con recursos limitados.

Su relevancia actual radica en que demuestra el flujo de publicacion de modelos de vision en formato ONNX listos para la web, aunque la informacion disponible sobre el entrenamiento, el rendimiento y los casos de uso concretos es muy escasa. La model card original indica explicitamente "More information needed" en varias secciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 (red neuronal convolucional residual) |
| Parametros totales | no disponible (ResNet-18 estandar: ~11,7 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (el tag `base_model:quantized` sugiere alguna cuantizacion, sin detalle) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura es ResNet-18, una CNN residual con conexiones de salto que permite entrenar redes profundas mitigando el problema del desvanecimiento del gradiente. El modelo base es `microsoft/resnet-18`, afinado sobre CIFAR-100, un conjunto de 100 clases de imagenes a color de 32x32 pixeles.

Segun la model card, el entrenamiento se realizo durante 3 epocas con un learning rate de 5e-05, batch size de 8, optimizador Adam (betas 0.9 y 0.999, epsilon 1e-08), scheduler lineal y semilla 42. No se especifica el numero de tokens ni la composicion exacta del dataset, mas alla de la referencia a CIFAR-100 en el nombre. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un modelo de vision. La conversion a ONNX se realizo de forma automatica mediante el Space oficial de `onnx-community`.

## Capacidades

- Extraccion de caracteristicas visuales (embeddings) a partir de imagenes, segun el pipeline `image-feature-extraction`.
- Clasificacion de imagenes en las 100 clases de CIFAR-100, dado que el modelo fue afinado sobre ese dataset (aunque el pipeline declarado es de extraccion de features).
- Ejecucion en navegador y en Node.js mediante Transformers.js y ONNX Runtime Web.
- Inferencia ligera en dispositivos con recursos limitados gracias al tamano reducido de ResNet-18.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni de generacion de texto.

## Casos de uso

- Clasificacion de imagenes de baja resolucion en el navegador: el modelo puede ejecutarse del lado del cliente con Transformers.js para categorizar imagenes de 32x32 pixeles en una de las 100 clases de CIFAR-100, sin enviar datos a un servidor.
- Extraccion de embeddings visuales para busqueda por similitud: las caracteristicas intermedias de ResNet-18 pueden usarse como vectores para indexar y recuperar imagenes similares en un catalogo pequeno.
- Prototipado rapido de pipelines de vision en la web: sirve como modelo de referencia para validar integraciones de ONNX Runtime Web antes de migrar a modelos mayores.
- Educacion y demostraciones: su tamano reducido y su licencia permisiva lo hacen adecuado para tutoriales sobre despliegue de modelos de vision en el navegador.
- Preprocesamiento en aplicaciones de bajo consumo: en escenarios de edge computing donde no se dispone de GPU, ResNet-18 en ONNX ofrece inferencia CPU aceptable.
- Filtrado o etiquetado automatico de imagenes en lotes pequenos: util para tareas de organizacion de imagenes de baja resolucion en herramientas internas.

## Benchmarks y rendimiento

La model card declara un `model-index` con el nombre `transformers_resnet18_cifar100` pero con la lista de resultados vacia (`results: []`). No se han publicado resultados de benchmarks (accuracy, F1, top-1, top-5) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para ResNet-18 (~45 MB de pesos), por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU, iGPU y cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090, etc.).
- Cabe en consumer GPU: si, en todas las gamas, y tambien en dispositivos moviles via ONNX Runtime.
- Opciones de despliegue: Transformers.js (navegador/Node.js), ONNX Runtime (Web, CPU, CUDA), y potencialmente otras herramientas compatibles con ONNX.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| transformers_resnet18_cifar100-ONNX | ~11,7 M (ResNet-18) | no aplica | Extraccion de features / clasificacion CIFAR-100 | Apache 2.0 | Hugging Face (ONNX) |
| microsoft/resnet-18 | ~11,7 M | no aplica | Extraccion de features generica (ImageNet) | Apache 2.0 | Hugging Face |
| fullstuck/transformers_resnet18_cifar100 | ~11,7 M | no aplica | Clasificacion CIFAR-100 (formato PyTorch) | Apache 2.0 | Hugging Face |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de datos de rendimiento para contrastar con alternativas de la misma categoria.

## Limitaciones y advertencias

- La model card original indica "More information needed" en descripcion, usos previstos, limitaciones y datos de entrenamiento: la documentacion es practicamente inexistente.
- No se han publicado metricas de evaluacion, por lo que se desconoce la precision real del modelo sobre CIFAR-100.
- Al ser un modelo de vision, no procesa texto ni mantiene conversaciones; no debe confundirse con un LLM.
- ResNet-18 esta disenado para imagenes de resolucion relativamente baja; su rendimiento en imagenes de alta resolucion o dominios muy distintos a CIFAR-100 puede degradarse.
- Riesgo de sesgos heredados del dataset CIFAR-100, que contiene clases muy especificas y no representa la diversidad del mundo real.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la falta de documentacion sobre el entrenamiento y la evaluacion hace recomendable una validacion propia antes de usarlo en produccion.
- El tag `base_model:quantized` sugiere que el modelo puede estar cuantizado, pero no se especifica el esquema ni el impacto en precision.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/onnx-community/transformers_resnet18_cifar100-ONNX
- Modelo base: https://huggingface.co/fullstuck/transformers_resnet18_cifar100
- Modelo original de Microsoft: https://huggingface.co/microsoft/resnet-18
- Space de conversion a ONNX: https://huggingface.co/spaces/onnx-community/convert-to-onnx
- Documentacion del pipeline de extraccion de features en Transformers.js: https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.ImageFeatureExtractionPipeline
