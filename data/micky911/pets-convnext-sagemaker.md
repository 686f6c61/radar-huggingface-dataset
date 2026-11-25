# Micky911/pets-convnext-sagemaker

## Resumen

El modelo `Micky911/pets-convnext-sagemaker` es un clasificador de imagenes de razas de perros y gatos (37 clases) afinado a partir de `facebook/convnext-tiny-224`. Lo desarrolla el usuario de Hugging Face Micky911 como demostracion para una asignatura de computacion distribuida, entrenando con un job de Amazon SageMaker sobre el dataset Oxford-IIIT Pet. No es un modelo de lenguaje: es un modelo de vision puro de tipo ConvNeXt en su variante *tiny*, con 27.848.581 parametros y una resolucion de entrada de 224x224 pixeles.

Su relevancia es acotada y practica: sirve como ejemplo reproducible de un pipeline de entrenamiento en SageMaker con exportacion a ONNX y compatibilidad con `transformers.js`, ademas de ofrecer un clasificador de razas con un 93,2 % de exactitud de validacion sobre un split estratificado 80/20 (1.480 imagenes de entrenamiento y 370 de validacion). No compite con modelos fundacionales de vision-lenguaje; su interes esta en el flujo MLOps y en la ligereza del artefacto (repo de 0,2 GB).

El modelo esta publicado bajo licencia CC BY-SA 4.0 y no declara idiomas soportados (no aplica, al ser clasificacion de imagenes). No dispone de descargas ni *likes* en el momento de redactar esta ficha, por lo que debe considerarse un artefacto de demostracion mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt (variante tiny, 224x224), red convolucional pura con bloques tipo transformer |
| Parametros totales | 27.848.581 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen 224x224) |
| Tipos de cuantizacion | no disponible (existe exportacion ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no aplica; tarea de clasificacion de imagenes) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors y ONNX |

## Arquitectura y entrenamiento

La arquitectura es ConvNeXt en su variante *tiny* con resolucion de entrada 224x224, heredada del modelo base `facebook/convnext-tiny-224`. ConvNeXt es una red convolucional que moderniza el diseno de ResNet incorporando decisiones de arquitectura propias de los Vision Transformers (convoluciones depthwise de 7x7, normalizacion LayerNorm, activacion GELU y patrones de *stem* y *downsampling* por etapas). El modelo se inicializa con pesos preentrenados en ImageNet y se sustituye la cabeza de clasificacion por una de 37 clases correspondientes a las razas del dataset Oxford-IIIT Pet.

El afinamiento se realizo durante 5 epocas sobre un split estratificado 80/20 del dataset Oxford-IIIT Pet (Parkhi et al., CVPR 2012), con 1.480 imagenes de entrenamiento y 370 de validacion. El entrenamiento se ejecuto como un job de SageMaker (`pets-pytorch-2026-11-25-17-25-51-447`) sobre una instancia `ml.g6.xlarge`, con 239 segundos facturables. La model card no documenta el uso de RLHF, DPO ni tecnicas de aumento de datos mas alla del preprocesado estandar; tampoco detalla hiperparametros como learning rate, batch size u optimizador.

## Capacidades

- Clasificacion de imagenes en 37 clases de razas de gato y perro (12 razas felinas y 25 caninas), con una exactitud de validacion declarada del 93,2 %.
- Inferencia via `transformers` con el pipeline `image-classification`.
- Exportacion a ONNX para despliegue en entornos sin PyTorch o en navegador mediante `transformers.js`.
- Integracion con endpoints de Amazon SageMaker (tag `endpoints_compatible`).
- Entrada de imagen a 224x224 pixeles con el preprocesador estandar de ConvNeXt.
- No soporta generacion de texto, tool calling, agentes, razonamiento multi-paso, vision-lenguaje, audio ni capacidades multilingues.

## Casos de uso

- Demo docente de MLOps en SageMaker: el modelo sirve como ejemplo completo de un job de entrenamiento con instancia gestionada, metrica de validacion y artefacto exportable, util para asignaturas de computacion distribuida o cloud.
- Clasificacion de fotos de mascotas en aplicaciones moviles o web: con 27,8 M de parametros y exportacion ONNX, puede ejecutarse en el navegador via `transformers.js` para etiquetar imagenes subidas por el usuario sin backend.
- Etiquetado asistido de datasets de imagenes de animales: util como preetiquetador para acelerar la anotacion manual en proyectos de vision con taxonomias de razas caninas y felinas.
- Filtrado y organizacion de galerias fotograficas: clasificar automaticamente imagenes de mascotas por raza para organizar bibliotecas o feeds.
- Prototipo de endpoint serverless en SageMaker: el tag `endpoints_compatible` permite desplegarlo como endpoint de inferencia para validar latencia y coste antes de invertir en un modelo mayor.
- Prueba de concepto de clasificacion fine-tuned en dominios acotados: sirve para comparar el coste (239 segundos facturables) frente al beneficio de afinar un ConvNeXt tiny en lugar de usar un modelo generico de ImageNet.
- Baseline en investigacion de vision: referencia ligera para comparar estrategias de aumento de datos o de ajuste fino en clasificacion de razas.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Exactitud de validacion | 93,2 % | Split estratificado 80/20 de Oxford-IIIT Pet (370 imagenes) |
| Epocas de entrenamiento | 5 | Job de SageMaker |
| Tiempo facturable de entrenamiento | 239 s | Instancia ml.g6.xlarge |

No se han publicado resultados de benchmarks estandar (ImageNet, MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con otros clasificadores de razas. La unica metrica reportada es la exactitud de validacion sobre el propio conjunto de validacion del split.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: en torno a 110-150 MB para los pesos (27,8 M de parametros a 4 bytes), mas el *overhead* de activaciones y del runtime; en la practica cabe en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU con latencia de decenas de milisegundos por imagen. Para lotes grandes, una T4, L4 o RTX 4090 ofrecen throughput muy superior.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 1-2 GB de VRAM libre (GTX 1050, RTX 3050, etc.), e incluso en CPU.
- Opciones de despliegue: `transformers` (pipeline de image-classification), ONNX Runtime, `transformers.js` en navegador, y endpoints de Amazon SageMaker.
- Latencia y throughput: no disponibles de forma oficial; por el tamano del modelo se espera inferencia en el orden de milisegundos a decenas de milisegundos en GPU y de decenas a cientos de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| Micky911/pets-convnext-sagemaker | 27,8 M | 224x224 | Clasificacion 37 razas | CC BY-SA 4.0 | Fine-tune de ConvNeXt tiny; 93,2 % val. |
| facebook/convnext-tiny-224 | ~28 M | 224x224 | Clasificacion ImageNet-1k (1.000 clases) | CC BY-NC 4.0 (modelo base de Meta) | Modelo base; no especializado en razas |
| google/vit-base-patch16-224 | ~86 M | 224x224 | Clasificacion ImageNet-1k | Apache 2.0 | Vision Transformer generico, mas pesado |
| timm/convnext_tiny.fb_in22k | ~28 M | 224x224 | Clasificacion ImageNet-22k | Apache 2.0 (timm) | Alternativa preentrenada a mayor escala, sin fine-tune de razas |

La comparativa es aproximada: no se dispone de resultados de benchmarks cruzados entre estos modelos en el dataset Oxford-IIIT Pet dentro de la informacion proporcionada. El modelo destaca por su licencia permisiva para uso comercial con atribucion y compartir igual (CC BY-SA 4.0), frente a la licencia no comercial del ConvNeXt original de Meta.

## Limitaciones y advertencias

- Es un modelo de demostracion academica con 0 descargas y 0 likes; no hay evidencia de validacion externa ni de uso en produccion.
- La exactitud del 93,2 % se mide sobre solo 370 imagenes de validacion, lo que implica un intervalo de confianza amplio; el rendimiento real en imagenes fuera de distribucion (iluminacion, angulos, razas mezcladas) puede ser inferior.
- Solo reconoce 37 razas concretas; cualquier otra raza o animal se asignara a una de las clases existentes con alta probabilidad, generando falsos positivos silenciosos.
- Riesgo de sesgo por el dataset Oxford-IIIT Pet: imagenes mayoritariamente de estudio, con posibles desequilibrios entre razas y sin documentacion de sesgos demograficos o de otro tipo.
- No apta para tareas fuera de clasificacion de imagenes de mascotas: no genera texto, no razona y no soporta tool calling.
- La licencia CC BY-SA 4.0 obliga a atribuir y a compartir las obras derivadas bajo la misma licencia; conviene revisar la compatibilidad con el uso comercial previsto.
- El modelo base `facebook/convnext-tiny-224` esta bajo CC BY-NC 4.0 (no comercial) en su publicacion original; el autor relicencia el fine-tune como CC BY-SA 4.0, lo que puede generar ambiguedad legal para uso comercial. Verificar antes de desplegar.
- No se documentan hiperparametros, composicion exacta del split ni tecnicas de aumento de datos, lo que dificulta la reproducibilidad.
- El tag `region:us` y la fecha de creacion (2026-11-25) son metadatos de la plataforma; no implican validacion adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Micky911/pets-convnext-sagemaker
- Modelo base: https://huggingface.co/facebook/convnext-tiny-224
- Dataset Oxford-IIIT Pet: https://www.robots.ox.ac.uk/~vgg/data/pets/
- Dataset en Hugging Face: https://huggingface.co/datasets/timm/oxford-iiit-pet
- Paper del dataset (Parkhi et al., CVPR 2012): https://www.robots.ox.ac.uk/~vgg/publications/2012/parkhi12a/parkhi12a.pdf
- Documentacion de ConvNeXt en transformers: https://huggingface.co/docs/transformers/model_doc/convnext
- transformers.js: https://huggingface.co/docs/transformers.js
- Amazon SageMaker: https://aws.amazon.com/sagemaker/
