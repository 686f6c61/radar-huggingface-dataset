# dganoun/leaf-classifier-resnext101

## Resumen

`dganoun/leaf-classifier-resnext101` es un clasificador de imágenes binario desarrollado por el usuario dganoun que determina la forma del margen de una hoja a partir de una fotografía, distinguiendo entre margen dentado (`dente`) y margen liso (`lisse`). El modelo parte de un backbone ResNeXt-101 32×8d de torchvision preentrenado en ImageNet y sustituye la cabeza final por una capa lineal de dos salidas, afinando únicamente `layer3`, `layer4` y `fc` sobre un conjunto propio de aproximadamente 6.500 imágenes de hojas.

Se trata de un ejemplo típico de transfer learning aplicado a un dominio muy estrecho: el repositorio ocupa 0,3 GB y los pesos se distribuyen como `state_dict` de PyTorch (`resnext101_leaves.pth`), con entrada fija de 224×224 píxeles en RGB y normalización de ImageNet. No es un modelo de lenguaje ni un modelo multimodal generativo: su única salida es una distribución de probabilidad sobre dos clases morfológicas, y no procesa texto, audio ni secuencias.

Su relevancia actual es acotada pero clara: sirve como componente de automatización para herbarios digitalizados, aplicaciones de identificación botánica y estudio de rasgos funcionales foliares, con una licencia MIT que permite uso comercial sin restricciones documentadas. El autor declara una precisión del 98,68 % y un F1 de 0,9861 sobre una partición de test de 984 imágenes, si bien estas cifras no están verificadas de forma independiente y corresponden a un conjunto de evaluación interno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNeXt-101 32×8d (torchvision), con cabeza `fc` sustituida por una capa lineal de 2 clases |
| Parametros totales | No indicado en la model card; la arquitectura ResNeXt-101 32×8d de torchvision tiene del orden de 88,8 millones de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision; entrada fija de 224×224 RGB, tensor 3×224×224) |
| Tipos de cuantizacion | No disponible; el unico artefacto publicado es un `state_dict` en PyTorch (FP32) |
| Idiomas soportados | No aplica (clasificacion de imagenes); las etiquetas de clase estan en frances: `dente`, `lisse` |
| Licencia | MIT |
| Formato de pesos | PyTorch `state_dict` en `resnext101_leaves.pth` (cargable con `torch.load(..., weights_only=True)`); no se distribuye en safetensors ni GGUF |
| Entrada | Imagen RGB 224×224, normalizada con media `[0.485, 0.456, 0.406]` y desviacion `[0.229, 0.224, 0.225]` |
| Salida | 2 logits; orden de clases `["dente", "lisse"]` |
| Libreria | pytorch |
| Tarea (pipeline) | image-classification |
| Tamano del repositorio | 0,3 GB |
| Fecha de creacion / actualizacion | 2026-10-14 / 2026-10-14 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es una red neuronal convolucional ResNeXt-101 con cardinalidad 32 y cuello de botella de 8 dimensiones (`32×8d`), la implementacion disponible en `torchvision.models`. Se inicializa con pesos preentrenados en ImageNet y se reemplaza la capa completamente conectada por `nn.Linear(in_features, 2)`. El ajuste fino es parcial: solo se entrenan `layer3`, `layer4` y `fc`, mientras que las capas anteriores permanecen congeladas. No se documentan en la model card el numero de epocas, el optimizador, la tasa de aprendizaje, el regimen de *scheduler* ni las tecnicas de aumento de datos empleadas; tampoco se menciona el uso de tecnicas de alineamiento tipo RLHF o DPO, que no aplican a un clasificador de vision.

Los datos de entrenamiento consisten en aproximadamente 6.500 imagenes de hojas etiquetadas con dos categorias de margen foliar. La particion de test representa el 15 % del total (984 imagenes) y se utilizo como conjunto *held-out*. No se especifican la procedencia de las imagenes, la distribucion de clases, la composicion taxonomica, el protocolo de anotacion ni si existio separacion por especie o por individuo entre train y test, un detalle critico para valorar el riesgo de fuga de datos. Tampoco se detalla si se aplico *data augmentation* (rotaciones, volteos, cambios de recorte o color), algo habitual y relevante en este tipo de tareas.

## Capacidades

- Clasificacion binaria de imagenes de hojas segun la forma del margen: `dente` (borde dentado) frente a `lisse` (borde liso).
- Extraccion de caracteristicas visuales propias de un backbone ResNeXt-101 32×8d preentrenado en ImageNet, reutilizable como extractor congelado para otras tareas de vision.
- Inferencia sobre imagenes RGB de 224×224 tras redimensionado y normalizacion estandar de ImageNet.
- Devuelve probabilidades por clase mediante `softmax`, lo que permite fijar umbrales de confianza y descartar predicciones dudosas en un pipeline.
- Soporte de *tool calling* / *function calling*: no aplica (modelo de vision sin interfaz de texto).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica; las etiquetas estan en frances.
- Capacidades especiales (modo *thinking*, vision general, audio): no disponibles; no hay descripcion de objetos, OCR ni segmentacion, solo la clasificacion de dos clases.

## Casos de uso

- Digitalizacion de herbarios: clasificar automaticamente el margen foliar de cada pliego escaneado durante el proceso de catalogacion, generando un rasgo morfologico indexable que complemente los metadatos taxonomicos y geograficos.
- Aplicaciones moviles de identificacion botanica: actuar como filtro previo que descarte o confirme hipotesis basadas en el margen de la hoja antes de invocar un modelo de identificacion de especie mas costoso, reduciendo el computo total del pipeline.
- Curaduria de conjuntos de datos botanicos: etiquetar a gran escala miles de imagenes para construir *datasets* de rasgos funcionales foliares, con revision humana unicamente de los casos de baja confianza (`softmax` proximo a 0,5).
- Investigacion en ecologia funcional: caracterizar el margen foliar como rasgo morfologico en estudios de adaptacion climatica, donde disponer de un etiquetado consistente y reproducible reduce la variabilidad entre anotadores humanos.
- Educacion y practicas de campo: herramienta de apoyo en asignaturas de botanica para que el alumnado contraste su identificacion manual del margen foliar con la prediccion del modelo en el movil o el navegador.
- Ampelografia y viticultura: el margen de la hoja es un caracter descriptivo utilizado en la identificacion de variedades de vid; el modelo puede precalcular ese rasgo en fotografias de campo para alimentar claves de identificacion varietal.
- Control de calidad en pipelines de vision existentes: usarse como clasificador auxiliar que valide que una imagen contiene una hoja con el margen esperado antes de pasarla a un modelo aguas abajo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (conjunto de test *held-out* de 984 imagenes, aproximadamente el 15 % de las ~6.500 imagenes totales). No verificados de forma independiente.

| Metrica | Valor |
|---|---|
| Accuracy | 0,9868 (98,68 %) |
| F1 | 0,9861 |
| Precision | 0,9935 |
| Recall | 0,9787 |
| Balanced accuracy | 0,9864 |

Tarea evaluada: clasificacion del margen foliar (`Leaf margin classification`, pipeline `image-classification`). No se han publicado en la informacion disponible resultados frente a otros benchmarks, ni comparaciones con modelos alternativos en la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: del orden de 350 MB solo para los pesos en FP32 (88,8 millones de parametros), mas las activaciones. El modelo completo cabe holgadamente en menos de 2 GB de VRAM en FP32 y en torno a 1 GB en FP16 o bfloat16.
- GPU recomendadas: cualquier GPU con 2 GB o mas de memoria es suficiente. Para lotes grandes en produccion resultan adecuadas tarjetas de gama media como RTX 3060, RTX 4060, T4 o L4. Las A100 y H100 solo tienen sentido para procesar volumenes muy elevados en lote.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU discreta moderna e incluso en iGPU con memoria compartida; el cuello de botella sera el ancho de banda, no la capacidad.
- Inferencia en CPU: viable para uso interactivo o por lotes pequenos, dado el reducido tamano del modelo.
- Opciones de despliegue: PyTorch nativo con torchvision, exportacion a TorchScript u ONNX Runtime, TorchServe, FastAPI con batching manual y despliegue en Hugging Face Spaces (el autor mantiene una demo Gradio). Los servidores orientados a LLM (vLLM, TGI, llama.cpp, Ollama) no aplican a este modelo.
- Latencia y throughput estimados: no se han publicado cifras en la informacion disponible.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks publicados para modelos comparables en la misma tarea concreta (clasificacion de margen foliar en dos clases), por lo que la comparacion de rendimiento figura como no disponible. La tabla recoge alternativas de backbone habituales en clasificacion de imagenes; el numero de parametros de esas alternativas es una referencia de arquitectura y no ha sido medido por el autor de este modelo.

| Modelo | Parametros (referencia) | Tarea | Entrada | Rendimiento en esta tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| leaf-classifier-resnext101 | ~88,8 M | Clasificacion binaria de margen foliar | 224×224 RGB | Accuracy 0,9868 / F1 0,9861 (autor) | MIT | Hugging Face y GitHub |
| ResNeXt-101 32×8d (torchvision, ImageNet) | ~88,8 M | Clasificacion ImageNet (1.000 clases) | 224×224 RGB | No evaluado en margen foliar | BSD-3-Clause (torchvision) | torchvision |
| ResNet-50 (torchvision, ImageNet) | ~25,6 M | Clasificacion ImageNet | 224×224 RGB | No evaluado en margen foliar | BSD-3-Clause | torchvision |
| EfficientNet-B0 (timm) | ~5,3 M | Clasificacion ImageNet | 224×224 RGB | No evaluado en margen foliar | Apache-2.0 | timm |

Observacion: al no existir particiones publicas de referencia para esta tarea ni pesos alternativos entrenados sobre el mismo conjunto, cualquier comparacion de exactitud entre estos modelos requeriria reentrenarlos con la misma particion de datos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. La model card no describe la composicion taxonomica, geografica ni de condiciones de captura del conjunto de entrenamiento, por lo que se desconoce si el modelo generaliza a especies, regiones o iluminaciones no representadas.
- Riesgo de sobreajuste al dominio de entrenamiento: el modelo se entreno con imagenes de hojas aisladas; el propio autor advierte que la precision sobre fotografias reales con fondos desordenados no ha sido medida.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de predicciones erroneas con alta confianza sobre imagenes fuera de distribucion, ya que no se documenta ningun mecanismo de deteccion de fuera de dominio.
- Limitaciones de contexto e idioma: la entrada esta fija a 224×224 RGB; no hay ventana de contexto textual y las etiquetas estan en frances (`dente`, `lisse`), lo que exige mapear las salidas si se integra en una interfaz en castellano.
- Ambiguedad taxonomica: la distincion diente/liso es una simplificacion binaria; los margenes intermedios (crenado, serrado, lobulado) pueden quedar mal representados y no existe clase de rechazo.
- Restricciones de licencia: la licencia MIT permite uso comercial, modificacion y redistribucion con atribucion y sin garantia. Conviene verificar por separado las licencias de torchvision y de las imagenes de entrenamiento, que no se detallan.
- Caveat para produccion: con 0 descargas y 0 likes, el modelo carece de validacion externa; las metricas declaradas provienen del propio autor y no estan verificadas. La particion de test podria presentar fuga de datos si las imagenes de una misma hoja o especie aparecen en train y test, algo que la model card no aclara.
- Mantenimiento: el repositorio se creo y actualizo el mismo dia (2026-10-14), sin historial posterior ni issues publicos documentados en la informacion disponible.
- Detalles de reproducibilidad ausentes: no se documentan hiperparametros, aumentos de datos, semillas ni criterios de seleccion del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dganoun/leaf-classifier-resnext101
- Codigo fuente en GitHub: https://github.com/dihiaganoun/Leaf-Classification
- Demo en vivo (Hugging Face Spaces): https://huggingface.co/spaces/dganoun/leaf-classifier

Nota sobre la busqueda web: los resultados devueltos corresponden al articulo 4 del Code civil frances y a directorios juridicos (Legifrance, Dalloz, Doctrine), sin ninguna relacion con este modelo. No se han encontrado en la busqueda web papers, blogs ni repositorios adicionales relevantes.
