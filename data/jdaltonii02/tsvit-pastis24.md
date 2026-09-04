# jdaltonII02/tsvit-pastis24

## Resumen

TSViT (Vision Transformer for Satellite Image Time Series) es un modelo de segmentación semántica desarrollado originalmente por Tarasiou et al. y presentado en CVPR 2023. Este repositorio concreto, publicado por jdaltonII02, contiene los checkpoints de los 5 folds del entrenamiento de TSViT sobre el benchmark PASTIS24, una partición de 24x24 píxeles del conjunto de datos PASTIS. El modelo resuelve el problema de clasificación píxel a píxel de series temporales de imágenes satelitales (SITS), un área clave en teledetección para el seguimiento de cultivos y el uso del suelo.

La arquitectura es un transformer con ramas temporales y espaciales, con una dimensión de 128, 4 capas transformer temporales y 4 espaciales, y aproximadamente 1,7 millones de parámetros. La ventana temporal de entrada admite hasta 60 imágenes, cada una con 11 bandas espectrales. El modelo se entrena y evalúa sobre 5 particiones (folds) del conjunto PASTIS24, y los pesos publicados corresponden al mejor epoch de cada fold según el IoU de validación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (TSViT) con ramas temporal y espacial |
| Parametros totales | ~1,7 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; ventana temporal de hasta 60 imagenes) |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch, FP32/FP16) |
| Idiomas soportados | no disponible (modelo de vision, no de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch state_dict (.pth) |

## Arquitectura y entrenamiento

TSViT es un transformer que procesa series temporales de imagenes satelitales mediante dos ramas de atencion: una rama temporal que modela la evolucion de cada pixel a lo largo del tiempo y una rama espacial que captura las relaciones entre parches de la imagen. En la configuracion utilizada para PASTIS24, cada muestra es un parche de 24x24 pixeles con 11 bandas espectrales y hasta 60 fechas. Los parches espaciales son de 2x2 pixeles, la dimension del modelo es 128, con 4 cabezas de atencion y 4 capas transformer en cada rama (temporal y espacial).

El entrenamiento se realiza sobre las 5 particiones estandar de PASTIS24, reproduciendo el protocolo del paper de Tarasiou et al. La funcion de perdida es entropia cruzada con la clase de fondo enmascarada, y las metricas de evaluacion son la exactitud global (OA) y el IoU medio (mIoU) sobre el conjunto de test. Los checkpoints publicados son los pesos del mejor epoch de cada fold segun el IoU de validacion, almacenados como state_dict de PyTorch.

## Capacidades

- Segmentacion semantica de series temporales de imagenes satelitales (SITS), clasificando cada pixel en una de las 19 clases de cultivos definidas en PASTIS.
- Modelado de dependencias temporales y espaciales mediante mecanismos de atencion transformer, lo que permite capturar la evolucion de las parcelas a lo largo de la temporada.
- Inferencia sobre parches de 24x24 pixeles con hasta 60 fechas y 11 bandas espectrales (por ejemplo, Sentinel-2).
- No soporta tool calling, generacion de texto, ni capacidades de vision generativa: es un modelo discriminativo especializado en clasificacion de pixels.
- Capacidades multilingues no aplicables al ser un modelo de vision.

## Casos de uso

- Agricultura de precision: el modelo puede clasificar el tipo de cultivo en parcelas a partir de series temporales de imagenes satelitales, facilitando la gestion de insumos y la estimacion de rendimientos.
- Monitorizacion de cultivos: permite seguir la evolucion de una parcela a lo largo de la temporada, detectando cambios en la cobertura o anomalias en el desarrollo del cultivo.
- Deteccion de cambios en el uso del suelo: al comparar predicciones de diferentes fechas, se pueden identificar transiciones entre clases (por ejemplo, de cultivo a suelo desnudo).
- Investigacion en teledeteccion: sirve como modelo de referencia para validar nuevas arquitecturas de segmentacion de series temporales, dado que reproduce los resultados del paper original.
- Sistemas de ayuda a la decision en politica agricola: permite generar mapas de cultivos a escala regional, utiles para la gestion de ayudas y el control de superficies.
- Clasificacion de cobertura terrestre en entornos con disponibilidad de series multiespectrales, como zonas con alta variabilidad temporal de la vegetacion.

## Benchmarks y rendimiento

Los resultados publicados en el repositorio, calculados sobre el conjunto de test de PASTIS24 con la perdida de entropia cruzada enmascarada, son los siguientes:

| Fold | Test OA (%) | Test mIoU (%) |
|---|---|---|
| 1 | 83,21 | 64,94 |
| 2 | 84,17 | 66,96 |
| 3 | 83,43 | 65,38 |
| 4 | 83,08 | 63,47 |
| 5 | 84,10 | 67,27 |
| Promedio 5-fold | 83,60 | 65,60 |
| Paper (promedio 5-fold) | 83,4 | 65,4 |

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB para batch pequeno, dado el tamano del modelo (~1,7 millones de parametros).
- GPU recomendada: cualquier GPU moderna con al menos 2 GB de VRAM (por ejemplo, NVIDIA T4, RTX 3060) o incluso una CPU, ya que el modelo es ligero.
- Si cabe en GPU de consumo: si, en tarjetas como RTX 4090, RTX 3060, o GPUs integradas.
- Opciones de despliegue: PyTorch nativo, ONNX Runtime, o integracion en pipelines de Python. No se ha documentado soporte para vLLM, llama.cpp, ni Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No se han identificado modelos comparables en la informacion disponible. El repositorio no incluye datos de rendimiento de otras arquitecturas de segmentacion de series temporales satelitales, como U-TAE o modelos basados en LSTM, por lo que no es posible realizar una comparativa directa con datos concretos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada.
- Riesgo de alucinacion: no aplica, al tratarse de un modelo discriminativo de segmentacion, no generativo.
- Limitaciones de contexto o idioma: el modelo esta entrenado exclusivamente para parches de 24x24 pixeles, 11 bandas espectrales y 19 clases de cultivos; no soporta otras resoluciones, bandas o conjuntos de clases sin reentrenamiento.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero los pesos publicados no incluyen el codigo de preprocesado ni el pipeline de datos completo, que deben obtenerse del repositorio DeepSatModels.
- Caveat para produccion: los archivos son state_dicts crudos de PyTorch, no checkpoints completos; es necesario instanciar el modelo TSViT con la configuracion exacta indicada en el README para cargarlos correctamente.

## Enlaces

- HuggingFace: https://huggingface.co/jdaltonII02/tsvit-pastis24
- Repositorio DeepSatModels: https://github.com/michaeltrs/DeepSatModels
- Repositorio PASTIS benchmark: https://github.com/VSainteuf/pastis-benchmark
- Paper: Tarasiou et al., "ViTs for SITS: Vision Transformers for Satellite Image Time Series", CVPR 2023 (enlace no disponible en la informacion proporcionada).
