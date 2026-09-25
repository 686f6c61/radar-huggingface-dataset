# lucid-dl/inception-v4

## Resumen

Inception-v4 es una red neuronal convolucional para clasificacion de imagenes en 1000 clases de ImageNet-1k, publicada originalmente por Szegedy et al. (2017) en el articulo *Inception-v4, Inception-ResNet and the Impact of Residual Connections on Learning* (arXiv:1602.07261). Esta ficha concreta corresponde a la publicacion `lucid-dl/inception-v4`, un port a la libreria Lucid de los pesos `timm/inception_v4.tf_in1k`, convertidos a safetensors nativos de Lucid. No se trata de un modelo nuevo ni de un reentrenamiento, sino de una conversion de pesos con verificacion estricta de claves y formas.

El modelo tiene 42,7 M de parametros y un fichero de pesos de 163,15 MB, lo que lo situa en el rango de CNN de tamano medio: cabe holgadamente en GPU de consumo e incluso en CPU para inferencia por lotes pequenos. Resuelve el problema clasico de clasificacion de imagen completa (una etiqueta por imagen entre 1000 clases), y su interes practico actual esta en servir como backbone preentrenado para extraccion de caracteristicas y fine-tuning en dominios especificos, mas que como clasificador de proposito general de ultima generacion.

Es relevante ahora sobre todo por su integracion en el ecosistema Lucid: el preprocesado viaja con los pesos (`weights.transforms()`) y la carga es compatible con el API `models.inception_v4_cls(pretrained=...)`, lo que simplifica la reproducibilidad frente a ports manuales. El repositorio no tiene descargas ni likes en el momento de redactar esta ficha y los resultados declarados no estan verificados por un tercero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN tipo Inception-v4 (modulos Inception con convoluciones factorizadas, sin conexiones residuales) |
| Parametros totales | 42,7 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (no se declaran variantes cuantizadas; pesos distribuidos en safetensors) |
| Idiomas soportados | no aplica (clasificacion de imagenes; las etiquetas de salida estan en ingles por el dataset ImageNet-1k) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (nativos de Lucid), fichero de 163,15 MB |
| Tarea | image-classification (1000 clases de ImageNet-1k) |
| Entrada | no disponible en la informacion facilitada; el preprocesado se obtiene via `weights.transforms()` |
| GFLOPs | no disponible |
| Tamano del repositorio | 0,2 GB |
| Libreria | lucid |
| Etiqueta de pesos por defecto | `TF_IN1K` |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-24 |

## Arquitectura y entrenamiento

Inception-v4 es una CNN profunda de la familia Inception. Frente a Inception-ResNet-v2, la variante v4 prescinde deliberadamente de las conexiones residuales y apuesta por modulos Inception mas anchos y con convoluciones factorizadas (por ejemplo, 1xn y nx1 en lugar de nxn) para reducir el coste computacional manteniendo capacidad representativa. La red se organiza en un stem de entrada seguido de bloques apilados de modulos Inception y una cabeza de clasificacion con pooling global y capa totalmente conectada de 1000 salidas. El total de 42,7 M de parametros es moderado para la epoca en que se publico y muy contenido comparado con modelos densos actuales.

No hay informacion en la model card sobre el proceso de entrenamiento de esta publicacion concreta: no se detalla el numero de tokens ni de imagenes visto, la composicion exacta del dataset (se declara unicamente `imagenet-1k`), ni si hubo tecnicas de ajuste fino posteriores. El modelo es un port de `timm/inception_v4.tf_in1k`, es decir, pesos originalmente entrenados en TensorFlow y adaptados al ecosistema PyTorch/timm, y despues convertidos a Lucid mediante `python -m tools.convert_weights inception_v4 --tag TF_IN1K`. La model card indica que se verificaron el conjunto de claves, las formas de los tensores y una carga estricta contra un modelo Lucid recien construido, lo que da cierta garantia de fidelidad de la conversion, pero no aporta informacion sobre el regimen de entrenamiento original (optimizador, augmentacion, epochs, ni uso de RLHF/DPO, que no aplican a un clasificador).

## Capacidades

- Clasificacion de imagenes en 1000 clases de ImageNet-1k, devolviendo logits de forma `(B, num_classes)`.
- Extraccion de caracteristicas: al ser una CNN completa, las activaciones intermedias pueden usarse como embeddings visuales para busqueda por similitud, clustering o deduplicacion de imagenes.
- Transfer learning: sirve como backbone preentrenado para fine-tuning en dominios especificos con cabezas de clasificacion adaptadas.
- Inferencia por lotes en GPU o CPU, sin requisitos de memoria elevados.
- Preprocesado integrado en los pesos mediante `weights.transforms()`, lo que reduce errores de normalizacion y redimensionado.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni de generacion de texto.
- No dispone de modo thinking, vision-lenguaje, audio ni ninguna capacidad multimodal mas alla de la clasificacion de imagen.

## Casos de uso

- Etiquetado automatico de catalogos de producto: clasificar imagenes de un e-commerce en las 1000 categorias de ImageNet-1k como primer nivel de taxonomia, y usar despues un clasificador especifico por categoria para el segundo nivel.
- Extraccion de embeddings para busqueda visual: tomar las activaciones de la penultima capa y construir un indice vectorial que permita recuperar imagenes similares en un catalogo o en un archivo fotografico.
- Deduplicacion y curado de datasets: clasificar grandes volumenes de imagenes para detectar clases sobrerrepresentadas o mal etiquetadas antes de entrenar otro modelo, aprovechando que la inferencia es barata en terminos de VRAM.
- Fine-tuning en dominios verticales: partir de los pesos `TF_IN1K` y reentrenar la cabeza (o la red completa) para inspeccion industrial de defectos, clasificacion de cultivos o triaje de imagenes medicas, donde 42,7 M de parametros permiten iterar en una sola GPU.
- Pre-etiquetado en anotacion con active learning: generar etiquetas iniciales de bajo coste que los anotadores humanos corrigen, reduciendo el tiempo de anotacion en proyectos de vision.
- Control de calidad en linea de produccion: ejecutar el modelo sobre fotogramas capturados por camara para aceptar o rechazar piezas segun su categoria visual, con la ventaja de que el modelo cabe en hardware modesto junto al resto del pipeline.
- Filtrado previo en moderacion de contenido: usar la clasificacion en clases sensibles como primera barrera para reducir el volumen que llega a un modelo de moderacion mas costoso.
- Baseline reproducible en investigacion: al estar empaquetado en Lucid con preprocesado incluido, sirve como referencia estable para comparar tecnicas de destilacion, pruning o cuantizacion sobre una CNN clasica.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card (no verificados por un tercero):

| Dataset | Tarea | Metrica | Valor | Verificado |
|---|---|---|---|---|
| ImageNet-1k | image-classification | acc@1 | 80,144 | No |
| ImageNet-1k | image-classification | acc@5 | 94,982 | No |

No se han publicado en la informacion disponible otros resultados de benchmarks (por ejemplo, throughput, latencia o metricas en datasets de transferencia como CIFAR o VTAB), ni comparaciones oficiales con modelos alternativos.

## Requisitos de hardware

- Pesos: 42,7 M de parametros, 163,15 MB en safetensors (aproximadamente 0,17 GB en fp32). El repositorio completo ocupa 0,2 GB.
- VRAM estimada para inferencia: los pesos ocupan menos de 0,2 GB; el consumo adicional depende de las activaciones (lote y resolucion de entrada). Como estimacion de ingenieria, por debajo de 1 GB con lote 1 y del orden de 2 a 4 GB con lotes de decenas de imagenes en fp32. No es un dato publicado por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de memoria es suficiente; una NVIDIA T4, RTX 3060 o superior trabaja con margen amplio. Una RTX 4090, A100 o H100 esta sobredimensionada para un solo modelo y solo tiene sentido si se ejecuta con lotes muy grandes o en paralelo con otros modelos.
- Cabe en GPU de consumo: si, en practicamente todas las GPU discretas modernas e incluso en CPU para lotes pequenos.
- Opciones de despliegue: PyTorch a traves de la libreria Lucid o de timm; exportacion a ONNX Runtime, TensorRT, OpenVINO, TorchScript o formatos moviles para edge. Herramientas como vLLM, llama.cpp, Ollama o TGI no aplican porque estan orientadas a modelos de lenguaje, no a CNN de vision.
- Latencia y throughput: no disponible. No se han publicado mediciones en la informacion facilitada.

## Comparativa con modelos similares

La informacion proporcionada solo cubre este modelo, por lo que los datos de los alternativas se marcan como no disponibles salvo indicacion explicita. Los valores que aparecen entre parentesis son referencias generales de la literatura o de las implementaciones mas extendidas, no verificadas en esta ficha.

| Modelo | Tipo | Parametros | Contexto / entrada | acc@1 en ImageNet-1k | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Inception-v4 (lucid-dl) | CNN Inception, sin residuales | 42,7 M | no disponible en la informacion facilitada | 80,144 (declarado, no verificado) | apache-2.0 | HuggingFace, via Lucid |
| Inception-ResNet-v2 | CNN Inception con residuales | no disponible | no disponible | no disponible | no disponible | timm / TensorFlow |
| ResNet-50 | CNN residual | no disponible | no disponible | no disponible | no disponible | ampliamente disponible |
| EfficientNet-B0 | CNN con escalado compuesto | no disponible | no disponible | no disponible | no disponible | timm / TensorFlow |

Puntos de comparacion objetivos que si se pueden afirmar: Inception-v4 pertenece a la generacion de CNN anteriores a los transformers de vision, no incorpora conexiones residuales (a diferencia de Inception-ResNet-v2) y su licencia apache-2.0 permite uso comercial. Para una comparacion cuantitativa de precision y coste habria que consultar las fichas de cada alternativa, ya que esta busqueda no ha devuelto datos al respecto.

## Limitaciones y advertencias

- Alcance cerrado: solo produce etiquetas dentro de las 1000 clases de ImageNet-1k; cualquier concepto fuera de ese vocabulario se mapeara forzosamente a la clase mas parecida.
- Sesgos del dataset: hereda los sesgos conocidos de ImageNet-1k, incluidas categorias centradas en contextos anglosajones, desequilibrios entre clases y etiquetas controvertidas o ambiguas.
- Riesgo de falsos positivos confiados: como todo clasificador con softmax, puede asignar probabilidad alta a clases incorrectas en imagenes fuera de dominio; no hay calibracion ni deteccion de out-of-distribution incorporada.
- Resultados no verificados: las metricas declaradas (acc@1 80,144 y acc@5 94,982) proceden del autor y no han sido validadas de forma independiente.
- Sin informacion de entrenamiento: la model card no documenta el regimen de entrenamiento original, la resolucion de entrada ni las tecnicas de augmentacion, lo que dificulta reproducir el resultado declarado.
- Sin variantes cuantizadas publicadas: no hay pesos en int8, fp16, GGUF u ONNX en el repositorio, de modo que cualquier optimizacion de despliegue hay que hacerla por cuenta propia.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Dependencia de la libreria Lucid: el ejemplo de uso emplea `lucid.models`, una libreria menos extendida que torchvision o timm; integrarla en produccion anade una dependencia adicional.
- Licencia: apache-2.0 permite uso comercial y modificacion, pero la propia model card indica que la licencia se hereda de los pesos originales de timm; conviene revisar la trazabilidad de la licencia del checkpoint de origen antes de un despliegue comercial.
- Los resultados de la busqueda web realizada no guardan relacion con este modelo (devuelven paginas de Lucid Motors y Lucidchart), por lo que no aportan informacion tecnica adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lucid-dl/inception-v4
- Repositorio de la libreria Lucid: https://github.com/ChanLumerico/lucid
- Paper original: *Inception-v4, Inception-ResNet and the Impact of Residual Connections on Learning* (Szegedy et al., AAAI 2017), arXiv:1602.07261, https://arxiv.org/abs/1602.07261
- Pesos de origen en timm: `timm/inception_v4.tf_in1k`
- No se han encontrado en la busqueda web otros enlaces relevantes (papers, blogs, demos o repos) especificos de esta publicacion.
