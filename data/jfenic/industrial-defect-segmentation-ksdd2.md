# JFenic/industrial-defect-segmentation-ksdd2

## Resumen

Este repositorio aloja dos modelos de segmentación semántica binaria de defectos industriales entrenados sobre el conjunto de datos KolektorSDD2, desarrollados por José Fenic Peiteado Padilla como parte de su Trabajo de Fin de Máster titulado "Vision Transformers vs CNNs for Semantic Segmentation of Industrial Defects". El objetivo del trabajo es comparar el comportamiento de una arquitectura convolucional (ConvNeXt-Tiny) frente a una basada en atención (Swin-Tiny) en una tarea de inspección visual industrial con clases muy desbalanceadas.

Ambos modelos comparten un decoder de estilo UPerNet (con Pyramid Pooling Module y Feature Pyramid Network) y se entrenaron con entrada de 224×640 píxeles, normalización ImageNet y una única clase de salida (`num_classes=1`). El repositorio pesa aproximadamente 0,5 GB e incluye los pesos en formato safetensors y PyTorch `.pth`, además del código de definición de los modelos en un repositorio GitHub separado.

Es relevante ahora como referencia reproducible y abierta para experimentación académica en detección de defectos superficiales, y como evidencia empírica de que, en este dataset concreto, un transformer (Swin) supera ligeramente a un CNN moderno (ConvNeXt) en Dice e IoU, aunque con mayor latencia y con métricas absolutas muy bajas que indican que los modelos distan de ser aptos para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos modelos: ConvNeXtSeg (ConvNeXt-Tiny + decoder UPerNet) y SwinSeg (Swin-Tiny + decoder UPerNet) |
| Parametros totales | ~33,7 M (ConvNeXt-Tiny) / ~33,4 M (Swin-Tiny) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (vision; entrada fija 224×640) |
| Tipos de cuantizacion | No disponible (solo pesos safetensors y `.pth` en precisión de entrenamiento) |
| Idiomas soportados | Ingles (`en`) en la metadata; la tarea es de vision, sin procesamiento de lenguaje |
| Licencia | MIT (pesos y codigo); dataset KolektorSDD2 con CC BY-NC-SA 4.0 |
| Formato de pesos | safetensors y PyTorch `.pth` |
| Entrada | Imagen RGB 224×640 (H×W), normalizacion ImageNet |
| Salida | Mapa de segmentacion binaria (`num_classes=1`), sigmoid + umbral |
| Dataset de entrenamiento | KolektorSDD2 (KSDD2) |
| Tamano del repositorio | ~0,5 GB |

## Arquitectura y entrenamiento

ConvNeXtSeg combina un backbone ConvNeXt-Tiny de `timm` con un decoder tipo UPerNet que integra un Pyramid Pooling Module y una Feature Pyramid Network para agregar caracteristicas multiescala. SwinSeg sigue el mismo esquema de decoder pero sustituye el backbone por un Swin-Tiny de `timm`, configurado con `img_size=(224, 640)` para adaptarse a la relacion de aspecto alargada de las imagenes del dataset. Ambos modelos usan `num_classes=1` y una funcion de perdida binaria cuya naturaleza exacta no se detalla en la informacion disponible.

El entrenamiento se realizo sobre KolektorSDD2, un conjunto de imagenes de superficies con defectos anotados a nivel de pixel, con una fuerte desproporcion entre pixeles de defecto y de fondo. No se especifican en la model card el numero de epocas, el optimizador, el learning rate, el esquema de aumentacion de datos ni si se aplicaron tecnicas de balanceo de clases, por lo que esos datos deben considerarse no disponibles. No hay evidencia de uso de RLHF, DPO ni de etapas de refinamiento posteriores, algo esperable en una tarea puramente de vision supervisada.

## Capacidades

- Segmentacion semantica binaria de defectos superficiales en imagenes de inspeccion industrial.
- Extraccion de caracteristicas visuales mediante backbones preentrenados en ImageNet (ConvNeXt-Tiny y Swin-Tiny) y ajuste fino sobre KolektorSDD2.
- Generacion de mapas de probabilidad por pixel mediante `sigmoid(logits)` y umbral configurable (0,5 por defecto; 0,1 como alternativa validada por el autor).
- Procesamiento por lotes (batch) de imagenes para pipelines offline.
- Comparacion controlada CNN vs Transformer con el mismo decoder y el mismo dataset, util para investigacion.
- Capacidades de tool calling, function calling, agentes o razonamiento multi-paso: no disponibles.
- Capacidades multilingues o de generacion de texto: no aplicables.

## Casos de uso

- Investigacion en deteccion de defectos industriales: sirve como linea base reproducible para comparar ConvNeXt y Swin en segmentacion de defectos con el mismo pipeline de evaluacion.
- Inspeccion visual de superficies en fabricacion: el modelo puede integrarse en un sistema de vision que, tras recortar una region de interes y redimensionarla a 224×640, devuelva un mapa de defecto para triaje automatico.
- Control de calidad en lineas de produccion de baja cadencia: con latencias de 22-32 ms por imagen en el hardware de referencia del autor, es viable para inspeccion en linea de piezas individuales siempre que se añada un umbral calibrado.
- Docencia y formacion en vision por computador: el repositorio incluye codigo de carga, configs y demo Gradio, lo que facilita ejercicios practicos sobre segmentacion binaria y desbalance de clases.
- Evaluacion de arquitecturas backbone en tareas con relacion de aspecto extrema: la configuracion `img_size=(224, 640)` de SwinSeg es un ejemplo util para probar variantes en datasets alargados.
- Prototipado rapido con Gradio: el demo del repositorio GitHub permite subir imagenes y visualizar la mascara predicha sin escribir codigo.
- Investigacion comparativa de decoders: al compartir el decoder UPerNet, permite aislar el efecto del backbone en los resultados.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test de KolektorSDD2 (umbral = 0,5):

| Modelo | Dice (%) | IoU (%) | Precision (%) | Recall (%) | Latencia (ms/imagen) |
|---|---|---|---|---|---|
| ConvNeXt-Tiny | 27,41 | 15,88 | 93,48 | 16,06 | 21,96 |
| Swin-Tiny | 33,47 | 20,10 | 93,04 | 20,41 | 32,19 |

Interpretacion: la precision es alta en ambos casos (~93 %), pero el recall es muy bajo (16-20 %), lo que indica que los modelos solo detectan una fraccion pequeña de los pixeles de defecto. El autor indica que se valido un umbral alternativo de 0,1, sin aportar metricas para ese umbral en la informacion disponible. No se incluyen comparaciones con otros modelos fuera de estos dos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano (~33-34 M parametros, ~0,5 GB de pesos para ambos) es esperable que quepa en GPUs consumer con holgura, aunque esta estimacion no esta confirmada por el autor.
- GPU recomendadas: no especificadas en la model card; el autor reporta latencias de 22 ms (ConvNeXt) y 32 ms (Swin) por imagen, aunque no indica el hardware empleado.
- Cabe en GPU consumer: practicamente seguro para inferencia en precision FP32/FP16 dado el tamano del modelo, aunque sin confirmacion oficial.
- Opciones de despliegue: PyTorch nativo con `model.load_state_dict` y `model.eval()`; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a vision). Existe un demo Gradio en el repositorio GitHub.
- Latencia y throughput: 21,96 ms/imagen (ConvNeXt-Tiny) y 32,19 ms/imagen (Swin-Tiny) segun la model card, sin especificar el hardware de medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Dice (%) | Latencia (ms/img) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ConvNeXt-Tiny (este repo) | ~33,7 M | 224×640 | 27,41 | 21,96 | MIT (pesos), dataset CC BY-NC-SA 4.0 | Hugging Face + GitHub |
| Swin-Tiny (este repo) | ~33,4 M | 224×640 | 33,47 | 32,19 | MIT (pesos), dataset CC BY-NC-SA 4.0 | Hugging Face + GitHub |
| Otros modelos de segmentacion de defectos sobre KSDD2 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de comparaciones con otros modelos publicos en la informacion proporcionada. La unica comparacion disponible es la interna entre las dos variantes del repositorio.

## Limitaciones y advertencias

- Metricas absolutas muy bajas: Dice de 27-33 % y recall de 16-20 % implican que los modelos no son aptos para uso en produccion sin un reentrenamiento o ajuste sustancial.
- Umbral sensible: el autor valida 0,1 como umbral alternativo, lo que sugiere que la calibracion del umbral afecta de forma critica al rendimiento.
- Dataset de entrenamiento no incluido: los pesos se entrenaron sobre KolektorSDD2 (CC BY-NC-SA 4.0), por lo que el uso comercial del dataset o de materiales derivados puede requerir permiso de los autores.
- Restricciones de licencia: los pesos se publican bajo MIT segun los tags, pero el dataset subyacente es no comercial (BY-NC-SA), lo que condiciona el uso comercial del modelo resultante.
- Uso previsto declarado: exclusivamente academico y de investigacion.
- Sin cuantizaciones publicadas, sin versiones ONNX/TensorRT ni integraciones con frameworks de despliegue de produccion.
- Dependencia de definiciones de modelo externas: es necesario clonar el repositorio GitHub para importar `ConvNeXtSeg` y `SwinSeg` desde `src/models.py`.
- Sin capacidades de texto, tool calling ni agentes: es un modelo puramente de vision.
- Idiomas: la metadata declara `en`, pero la tarea es visual; no hay procesamiento linguistico.
- Riesgo de sobreajuste al dataset KolektorSDD2 y baja generalizacion a otros dominios industriales no documentada.
- Fecha de creacion y actualizacion en el Hub (junio y noviembre de 2026) debe verificarse, ya que puede ser un artefacto de la metadata.

## Enlaces

- Hugging Face: https://huggingface.co/JFenic/industrial-defect-segmentation-ksdd2
- Repositorio GitHub del TFM: https://github.com/Jfenic/TFM-Computer-Vision-Segmentation-ConvNext-Swin
- Demo Gradio (dentro del repositorio): https://github.com/Jfenic/TFM-Computer-Vision-Segmentation-ConvNext-Swin/tree/master/demo
- Dataset KolektorSDD2 (oficial): https://www.vicos.si/resources/kolektorsdd2/
- Licencia CC BY-NC-SA 4.0: https://creativecommons.org/licenses/by-nc-sa/4.0/
- Paper de referencia del dataset (Tabernik et al., 2020): https://doi.org/10.1007/s10845-020-01574-1 (cita incluida en la model card; DOI inferido de la referencia bibliografica, verificar)
