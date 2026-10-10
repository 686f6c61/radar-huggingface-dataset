# GImInI/ml_hw4-1

## Resumen

ml_hw4-1 es un modelo de deteccion de objetos obtenido mediante fine-tuning de facebook/detr-resnet-50, publicado por el usuario GImInI en HuggingFace. DETR (DEtection TRansformer) es una arquitectura que combina un backbone convolucional ResNet-50 con un encoder-decoder transformer y sustituye los mecanismos clasicos de deteccion (anclas y supresion de no maximos) por un emparejamiento bipartito entre predicciones y objetos reales. El modelo resultante tiene 41.608.649 parametros y se distribuye en formato safetensors bajo licencia Apache 2.0.

Se trata de un artefacto de caracter experimental: la model card indica explicitamente que se entreno sobre un dataset desconocido ("unknown dataset") y que la descripcion, los usos previstos y los datos de evaluacion estan pendientes de completar. No se ha publicado ningun resultado de benchmarks (el model-index esta vacio) ni se especifican los idiomas, las clases detectables ni la composicion del conjunto de entrenamiento.

Su relevancia practica es limitada tal y como esta publicado, pero sirve como ejemplo reproducible de fine-tuning de DETR con la libreria Transformers y como punto de partida para quien quiera reentrenar la cabeza de deteccion sobre su propio dataset anotado en formato COCO. Quien necesite un detector listo para produccion deberia evaluar primero el modelo base original o alternativas con metricas publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DETR (DEtection TRansformer): backbone ResNet-50 + encoder-decoder transformer con prediccion set-based |
| Parametros totales | 41.608.649 (~41,6 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de vision para deteccion de objetos, no es un LLM) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones publicadas) |
| Idiomas soportados | no disponible / no aplicable (la salida son etiquetas de clase definidas por el dataset de entrenamiento, que no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Otros datos relevantes: pipeline `object-detection`, libreria `transformers`, compatible con endpoints, 36 descargas y 0 likes en el momento de la consulta, tamano del repositorio 4,8 GB, creado y actualizado el 10 de octubre de 2026.

## Arquitectura y entrenamiento

La arquitectura es la de DETR con backbone ResNet-50. La imagen se procesa con el backbone convolucional para obtener un mapa de caracteristicas, que se aplana y se pasa por un encoder transformer. Un decoder transformer, con un conjunto fijo de consultas aprendidas (object queries), genera en paralelo todas las predicciones de la imagen: para cada consulta produce una clase y una caja delimitadora normalizada. El entrenamiento original de DETR usa una perdida de emparejamiento bipartito (algoritmo hungaro) que asigna cada prediccion a un objeto real, lo que elimina la necesidad de anclas y de NMS. El modelo fijado en el repositorio base de Facebook usa 100 consultas, por lo que el numero maximo de objetos detectables por imagen en esa configuracion es 100.

Segun la model card, el fine-tuning se realizo con el Trainer de Transformers sobre un dataset no identificado. Los hiperparametros declarados son: learning rate 1e-05, train_batch_size 8, eval_batch_size 8, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08 en su variante fused, scheduler lineal, 100 epocas y precision mixta nativa (AMP). Se emplearon Transformers 4.57.6, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.22.2. La seccion de resultados de entrenamiento esta vacia en la model card, por lo que no se conocen curvas de perdida ni metricas de validacion.

## Capacidades

- Deteccion de objetos en imagenes: devuelve cajas delimitadoras, etiquetas de clase y puntuaciones de confianza para cada objeto detectado.
- Prediccion set-based sin NMS ni anclas, heredada de la arquitectura DETR.
- Inferencia end-to-end en una sola pasada del transformer (sin postprocesado de supresion de duplicados).
- Integracion directa con el pipeline `object-detection` de Transformers y con la API de HuggingFace Inference Endpoints.
- Entrada unimodal de vision (imagen RGB); no procesa texto, audio ni video directamente.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, tool calling, function calling ni capacidades de agente.
- No dispone de modo de razonamiento explicito (thinking mode) ni de capacidades multilingues.
- Las clases que puede detectar dependen exclusivamente del dataset de fine-tuning, que no se ha documentado.

## Casos de uso

- Etiquetado y anotacion asistida de datasets: el modelo puede pre-anotar cajas sobre imagenes nuevas para que un equipo humano las revise y corrija, reduciendo el coste de construir un dataset de deteccion propio.
- Control de calidad en linea de fabricacion: con un fine-tuning especifico sobre imagenes de producto, el detector puede senalar defectos o piezas mal colocadas en la cinta de produccion y activar un descarte automatico.
- Analisis de imagenes de vigilancia: deteccion de personas u objetos en fotogramas extraidos de camaras, siempre que se reentrene con las clases de interes y se validen las metricas antes de cualquier despliegue.
- Inventario en retail: conteo y localizacion de productos en estanterias a partir de fotografias, integrable en un flujo de reposicion automatica.
- Investigacion y docencia en vision por computador: sirve como caso de estudio de fine-tuning de DETR con el Trainer, util para comparar hiperparametros y estrategias de congelacion del backbone.
- Procesamiento por lotes en pipelines de datos: al ser un modelo pequeno (41,6 M de parametros), puede ejecutarse sobre grandes volumenes de imagenes en una sola GPU para enriquecer catalogos o indices de busqueda visual.
- Prototipado rapido de demos: gracias a su integracion con el pipeline de Transformers y a su licencia Apache 2.0, permite montar una demo funcional en pocas lineas de codigo.

Nota: dado que se desconoce el dataset de entrenamiento, ninguno de estos casos puede darse por valido sin una evaluacion previa sobre datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index del repositorio contiene una entrada con el nombre del modelo y la lista de resultados vacia, y la seccion "Training results" de la model card esta en blanco. No se dispone de valores de mAP, AP50, AP75 ni de ninguna otra metrica de evaluacion, ni de comparaciones con el modelo base.

## Requisitos de hardware

- VRAM para inferencia: el modelo tiene 41,6 M de parametros. En fp32 ocupa aproximadamente 166 MB y en fp16 alrededor de 83 MB; con activaciones y un lote moderado el consumo tipico se situa por debajo de 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con CUDA. Para lotes grandes o entrenamiento se recomiendan RTX 3090, RTX 4090, A100 o H100; para inferencia suelta basta una GPU de gama media.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo con 4 GB o mas de VRAM, incluidas GTX 1650, RTX 3060, RTX 4060 o superiores. Tambien puede ejecutarse en CPU, con mayor latencia.
- Opciones de despliegue: pipeline `object-detection` de Transformers, PyTorch nativo, exportacion a ONNX o TorchScript, TensorRT, y HuggingFace Inference Endpoints (el repositorio esta marcado como compatible con endpoints).
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de latencia por imagen ni de imagenes por segundo en ninguna configuracion de hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Rendimiento publicado | Disponibilidad |
|---|---|---|---|---|---|
| GImInI/ml_hw4-1 | 41,6 M | DETR fine-tuned, dataset desconocido | Apache 2.0 | no disponible | HuggingFace, 36 descargas |
| facebook/detr-resnet-50 | ~41,6 M | DETR con backbone ResNet-50 | Apache 2.0 | 42,0 AP en COCO val (segun el repositorio original) | HuggingFace, ampliamente utilizado |
| facebook/detr-resnet-101 | ~60 M | DETR con backbone ResNet-101 | Apache 2.0 | 43,5 AP en COCO val (segun el repositorio original) | HuggingFace |
| DETA / RT-DETR (alternativas de deteccion end-to-end) | variable | DETR con mejoras de entrenamiento o en tiempo real | Apache 2.0 en la mayoria de variantes | superior al DETR original en COCO | HuggingFace |

La comparacion de rendimiento con este modelo concreto no es posible porque no se ha publicado ninguna metrica. Los valores de AP del modelo base se incluyen unicamente como referencia del punto de partida del fine-tuning.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: se ignora que clases detecta, cuantas imagenes se usaron y como se anotaron. Cualquier uso real exige una evaluacion previa sobre datos propios.
- Ausencia total de metricas: no hay mAP ni ninguna otra medida de calidad, ni validacion por parte de la comunidad (0 likes, 36 descargas).
- Riesgo de falsos positivos y falsos negativos: como cualquier detector, puede alucinar objetos inexistentes o ignorar objetos presentes, especialmente en escenas con oclusiones, objetos pequenos o clases poco representadas.
- Limite estructural de 100 objetos por imagen, heredado de las 100 object queries de la configuracion original de DETR.
- DETR tiende a rendir peor que arquitecturas modernas en objetos de tamano reducido y requiere entrenamientos largos para converger; las 100 epocas declaradas no garantizan una convergencia correcta sin conocer el dataset.
- Sesgos heredados: el backbone y la inicializacion provienen de un modelo preentrenado en COCO, por lo que arrastra los sesgos de ese conjunto (sobrerrepresentacion de determinadas categorias y contextos).
- Sin capacidades de lenguaje: no procesa texto ni responde a instrucciones, y no se puede consultar mediante prompts.
- Licencia Apache 2.0: permite uso comercial y modificacion, siempre que se conserve el aviso de licencia y se indique los cambios realizados. No hay restricciones adicionales conocidas.
- Model card incompleta: el propio autor advierte de que la descripcion, los usos previstos y los datos de evaluacion estan pendientes de completar.
- El repositorio ocupa 4,8 GB, muy por encima del peso de los parametros, lo que sugiere la presencia de checkpoints intermedios o estados del optimizador que no son necesarios para inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GImInI/ml_hw4-1
- Modelo base: https://huggingface.co/facebook/detr-resnet-50
- Paper original de DETR: https://arxiv.org/abs/2005.12872
- Documentacion del pipeline object-detection de Transformers: https://huggingface.co/docs/transformers/main/en/tasks/object_detection
- Documentacion del modelo DETR en Transformers: https://huggingface.co/docs/transformers/main/en/model_doc/detr

La busqueda web realizada no devolvio enlaces relevantes sobre este modelo: los resultados se correspondian con paginas del asistente Google Gemini, sin relacion con el repositorio.
