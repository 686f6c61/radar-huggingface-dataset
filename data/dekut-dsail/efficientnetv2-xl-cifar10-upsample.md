# DeKUT-DSAIL/efficientnetv2-xl-cifar10-upsample

## Resumen

EfficientNetV2-XL fine-tuned sobre CIFAR-10 es un modelo de clasificacion de imagenes desarrollado por el laboratorio DeKUT-DSAIL de la Universidad Dedan Kimathi (Kenia). Se trata de una red neuronal convolucional (CNN) basada en la arquitectura EfficientNetV2 en su variante XL, con aproximadamente 207,6 millones de parametros, fine-tuned desde pesos preentrenados en ImageNet (registrados en timm como `tf_efficientnetv2_xl`) sobre el dataset CIFAR-10 con imagenes reescaladas a 224x224 píxeles.

El modelo forma parte de un estudio comparativo entre entrenar a resolucion nativa frente a tecnicas de upsampling en datasets de baja resolucion. Su relevancia radica en que demuestra que un modelo grande preentrenado puede alcanzar una precision muy alta (99,07% top-1) en un dataset pequeno de 10 clases cuando se aplica upsampling, lo que tiene implicaciones practicas para el transfer learning en dominios con datos limitados.

La licencia MIT permite uso comercial y de investigacion sin restricciones significativas, y el modelo se distribuye en formato safetensors con soporte nativo de la libreria timm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-XL (CNN convolucional) |
| Parametros totales | 207.628.642 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de clasificacion de imagenes, no procesa texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (clasificacion visual sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

EfficientNetV2-XL pertenece a la familia EfficientNetV2, originalmente propuesta por Google, que combina bloques de convolucion estandar con bloques Fused-MBConv y MBConv, junto con un escalado equilibrado de profundidad, anchura y resolucion. La variante XL es la de mayor capacidad dentro del ecosistema timm, disenada originalmente para clasificacion en ImageNet con resoluciones de 224x224 o superiores.

El proceso de entrenamiento consistio en un fine-tuning desde los pesos preentrenados en ImageNet sobre el dataset CIFAR-10, cuyas imagenes nativas de 32x32 fueron reescaladas (upsampled) a 224x224. El preprocesamiento requerido es un resize a 224x224 seguido de normalizacion con la media `[0.4914, 0.4822, 0.4465]` y desviacion estandar `[0.247, 0.2435, 0.2616]` de CIFAR-10. No se han publicado detalles adicionales sobre hiperparametros, tecnicas de aumento de datos o duracion del entrenamiento.

## Capacidades

- Clasificacion de imagenes en las 10 clases de CIFAR-10: avion, automovil, pajaro, gato, ciervo, perro, rana, caballo, barco y camion.
- Top-1 accuracy del 99,07% y top-5 del 99,94% en el conjunto de test de CIFAR-10 (10.000 imagenes).
- F1 macro de 0,9907 y AUC macro de 0,9993, lo que indica un rendimiento equilibrado entre clases.
- Calibracion de probabilidades moderada, con un error de calibracion esperado (ECE) de 0,1157.
- Integracion con el wrapper `CIFAR10Classifier` proporcionado por el autor, que simplifica la inferencia con solo `torch`, `torchvision`, `timm`, `Pillow` y `huggingface_hub`.
- No soporta generacion de texto, tool calling, agentes, vision generalista ni otras modalidades mas alla de la clasificacion en las 10 clases de CIFAR-10.

## Casos de uso

- Investigacion en transfer learning: el modelo sirve como referencia para estudiar el impacto del upsampling frente a la resolucion nativa en datasets de baja resolucion, un tema relevante en dominios como imagenes medicas o de satelite donde los datos nativos son pequenos.
- Prototipado rapido de clasificadores: gracias al wrapper `CIFAR10Classifier` y la licencia MIT, se puede integrar en un pipeline de investigacion en minutos para validar hipotesis sobre clasificacion de 10 clases.
- Docencia en vision por computador: como ejemplo didactico de fine-tuning de un modelo grande preentrenado en ImageNet sobre un dataset pequeno, ilustrando conceptos de transfer learning, regularizacion y calibracion.
- Benchmark interno de arquitecturas: el modelo puede servir como punto de referencia para comparar otras arquitecturas (ResNet, ViT, ConvNeXt) en la misma tarea, dado que sus metricas estan publicadas y son reproducibles.
- Estudio de calibracion de modelos: con un ECE de 0,1157, el modelo es util para investigar metodos de calibracion (temperature scaling, Platt scaling) en clasificadores de vision.
- Evaluacion de tecnicas de aumento de datos: al ser un modelo grande sobre un dataset pequeno, es un candidato ideal para estudiar como distintas politicas de aumento de datos afectan a la generalizacion y a la precision final.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test de CIFAR-10 (10.000 imagenes):

| Metrica | Valor |
|---|---|
| Top-1 accuracy | 99,07% |
| Top-5 accuracy | 99,94% |
| F1 (macro) | 0,9907 |
| AUC (macro) | 0,9993 |
| ECE | 0,1157 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32 el modelo ocupa aproximadamente 830 MB de memoria, por lo que cabe en cualquier GPU consumer con 2 GB o mas de VRAM. En FP16 (~415 MB) cabe incluso en GPUs integradas modernas.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3060, RTX 4090, A100, H100). Para fine-tuning adicional se recomienda al menos 8 GB de VRAM.
- El modelo puede ejecutarse en CPU para inferencia, aunque con mayor latencia; no se han publicado mediciones de latencia o throughput.
- Opciones de despliegue: PyTorch con timm, exportacion a ONNX o TorchScript, o mediante el wrapper `CIFAR10Classifier` del repositorio de entrenamiento. No hay soporte documentado para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Top-1 CIFAR-10 | Licencia |
|---|---|---|---|---|
| DeKUT-DSAIL/efficientnetv2-xl-cifar10-upsample | EfficientNetV2-XL | 207,6M | 99,07% | MIT |
| EfficientNetV2-S/M/L fine-tuned en CIFAR-10 | EfficientNetV2 | 22-55M | No disponible | Apache-2.0 |
| ResNet-50 fine-tuned en CIFAR-10 | ResNet-50 | 25,6M | No disponible | MIT |

No se dispone de datos de rendimiento publicados para los modelos comparables en la informacion proporcionada. La comparativa se limita a caracteristicas arquitectonicas y de tamano. Cabe destacar que EfficientNetV2-XL es significativamente mayor que las variantes S, M y L de la misma familia, lo que plantea dudas sobre la relacion coste-beneficio frente a modelos mas pequenos en una tarea de solo 10 clases.

## Limitaciones y advertencias

- El modelo clasifica exclusivamente las 10 clases de CIFAR-10; no generaliza a otras categorias o dominios sin fine-tuning adicional.
- Las imagenes de CIFAR-10 tienen resolucion nativa de 32x32; el upsampling a 224x224 es interpolacion y no anade informacion real, por lo que el rendimiento puede no trasladarse a imagenes de resolucion nativa alta o a otros dominios visuales.
- El ECE de 0,1157 indica una calibracion de probabilidades imperfecta: las probabilidades predichas no son totalmente fiables para decisiones basadas en umbrales.
- No se han publicado detalles del proceso de entrenamiento (hiperparametros, aumento de datos, epocas, particion de validacion), lo que dificulta la reproducibilidad completa.
- El modelo es un artefacto de investigacion; no esta optimizado para produccion a gran escala ni para inferencia de baja latencia.
- No soporta otras modalidades (texto, audio, video) ni tareas de deteccion o segmentacion.
- Aunque la licencia MIT permite uso comercial, el modelo depende de la libreria timm y sus pesos preentrenados en ImageNet, cuyos terminos de uso deben verificarse por separado.

## Enlaces

- HuggingFace: https://huggingface.co/DeKUT-DSAIL/efficientnetv2-xl-cifar10-upsample
- Repositorio de entrenamiento: mencionado en la model card (contiene la carpeta `hf_deployment/` con el fichero `cifar_classifier.py`), pero la URL no se proporciona en la informacion disponible.
