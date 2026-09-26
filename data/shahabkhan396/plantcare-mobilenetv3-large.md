# Shahabkhan396/plantcare-mobilenetv3-large

## Resumen

PlantCare AI - mobilenetv3_large es un modelo de vision por computador para clasificacion de imagenes, desarrollado por el usuario Shahabkhan396 y publicado en HuggingFace. Se trata de un ajuste fino (fine-tuning) del clasificador `mobilenetv3_large_100.ra_in1k` de la libreria timm sobre el conjunto de datos de campo PlantCity, orientado a la deteccion de enfermedades en hojas de cultivos en Pakistan. El modelo resuelve una tarea de clasificacion multiclase con 52 clases repartidas en 12 cultivos distintos.

Con 4.293.044 parametros, es un modelo muy ligero, disenado para escenarios de despliegue en el borde (edge) o en dispositivos con recursos limitados. La entrada es una imagen RGB de 224x224 pixeles. El autor reporta una exactitud de test de 0,9954 y un macro-F1 de 0,9949, ademas de un ECE calibrado de 0,0020, lo que indica confianzas bien calibradas tras dividir los logits por un parametro de temperatura.

Su relevancia actual radica en el ambito agrotech: permite llevar diagnostico asistido de enfermedades de cultivos a entornos con poca capacidad de computo (moviles, Raspberry Pi), aunque con la advertencia explicita de que se entreno solo con hojas de dos distritos de Khyber Pakhtunkhwa y debe usarse como apoyo a la decision, nunca como diagnostico definitivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN MobileNetV3-Large (timm, `mobilenetv3_large_100.ra_in1k`) |
| Parametros totales | 4.293.044 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen 224x224) |
| Tipos de cuantizacion | no disponible (solo se documentan pesos originales en safetensors) |
| Idiomas soportados | no disponible (no procesa texto; clasificacion de imagenes) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | image-classification |
| Libreria | timm |
| Tamano de entrada | 224x224 |
| Numero de clases | 52 clases (12 cultivos) |
| Dataset de entrenamiento | PlantCity (Khan et al., 2025, Mendeley Data) |

## Arquitectura y entrenamiento

El modelo parte de `mobilenetv3_large_100.ra_in1k`, un backbone convolucional MobileNetV3-Large preentrenado en ImageNet-1k (variante con entrenamiento `ra`, es decir, con augmentacion aleatoria y regularizacion adicional) y ajustado de nuevo sobre el conjunto PlantCity. MobileNetV3-Large es una red neuronal convolucional que combina bloques de convolucion separable en profundidad (depthwise separable convolutions), modulos de squeeze-and-excitation y activaciones hard-swish, lo que la hace especialmente eficiente en terminos de parametros y operaciones para su capacidad.

El ajuste fino se realizo sobre el dataset de campo PlantCity, con un reparto estratificado y consciente de grupos (group-aware stratified) de 72/14/14, eliminacion de casi-duplicados y uso exclusivo de fotos originales, aplicando augmentacion en tiempo de ejecucion (on-the-fly). No se ha documentado en la informacion disponible el numero de imagenes de entrenamiento, la composicion exacta del dataset, la duracion del entrenamiento ni si se emplearon tecnicas de RLHF o DPO (no aplicables a un clasificador de imagenes).

La innovacion tecnica destacable es la calibracion de confianzas: el autor indica que, antes de aplicar softmax, los logits deben dividirse por un parametro `temperature` almacenado en `plantcare_meta.json`, lo que da lugar a un error de calibracion esperado (ECE) de 0,0020. Este detalle es relevante para cualquier uso en produccion donde se necesiten probabilidades fiables.

## Capacidades

- Clasificacion de imagenes de hojas de cultivo en 52 clases correspondientes a 12 cultivos.
- Deteccion de enfermedades de plantas a partir de fotografias de campo.
- Salida de probabilidades calibradas mediante division de logits por temperatura antes de softmax.
- Inferencia de muy bajo coste computacional, apta para CPU y dispositivos de borde.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo de razonamiento (thinking mode), vision general, audio ni generacion de texto.

## Casos de uso

- Diagnostico asistido en campo: un agricultor fotografia una hoja con un movil y el modelo devuelve la clase de enfermedad mas probable, sirviendo como primera orientacion antes de consultar a un tecnico agricola.
- Aplicacion movil offline para agricultores: al ser un modelo de 4,29 M de parametros, puede empaquetarse (por ejemplo, via ONNX o TensorFlow Lite) y ejecutarse sin conexion en telefonos de gama media.
- Sistema de alerta temprana en explotaciones: integrado con camaras fijas o drones, permite clasificar hojas de forma periodica y generar avisos cuando aumenta la incidencia de una clase de enfermedad.
- Triaje en cooperativas y centros de extension agraria: clasifica grandes volumenes de fotos recibidas de agricultores para priorizar las muestras que requieren inspeccion humana.
- Etiquetado y control de calidad de datasets agricolas: se usa como clasificador de preanotacion para acelerar el etiquetado manual de nuevas imagenes en proyectos de investigacion agronomica.
- Investigacion agronomica: como linea base (baseline) ligera para comparar tecnicas de aumento de datos, calibracion o aprendizaje por transferencia en el dominio de enfermedades de cultivos de Pakistan.
- Despliegue en dispositivos de borde: en una Raspberry Pi o un microcontrolador con acelerador, para monitorizacion continua en invernaderos o parcelas piloto.
- Filtrado previo en pipelines de vision mas pesados: descarta imagenes claramente sanas o claramente enfermas antes de pasar una fraccion reducida a un modelo mayor y mas costoso.

## Benchmarks y rendimiento

Los unicos resultados reportados en la informacion disponible son los de test del propio autor sobre el conjunto PlantCity. No se han publicado resultados de benchmarks estandar de vision (ImageNet, etc.) en la informacion disponible.

| Metrica | Valor |
|---|---|
| Exactitud (test) | 0,9954 |
| Macro-F1 (test) | 0,9949 |
| ECE (calibrado) | 0,0020 |
| Tamano de entrada | 224x224 |

No se dispone de comparaciones directas con otros modelos sobre el mismo dataset en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Con 4.293.044 parametros, los pesos en FP32 ocupan aproximadamente 17 MB; en FP16, unos 8,6 MB. La memoria adicional de activaciones es minima para entradas de 224x224.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es sobradamente suficiente. La inferencia es viable en GPU de consumo como GTX 1650, RTX 3060 o RTX 4090, aunque en la practica el cuello de botella no sera la GPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna, e incluso en GPU integradas.
- Cabe en CPU y dispositivos de borde: si. Es adecuado para CPU de escritorio, Raspberry Pi y telefonos moviles (previa conversion a ONNX, TensorFlow Lite u otros formatos).
- Opciones de despliegue: timm/PyTorch de forma nativa; exportacion a ONNX, TorchScript o TensorFlow Lite para entornos de produccion; servidores de inferencia como TorchServe o un servicio FastAPI propio. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponible (no se han publicado mediciones de latencia ni de imagenes por segundo).

## Comparativa con modelos similares

No se dispone de resultados comparativos sobre el conjunto PlantCity para otros modelos en la informacion proporcionada. A continuacion se ofrece una comparacion a nivel arquitectonico con clasificadores convolucionales habituales, usando cifras publicas de arquitectura; las metricas de rendimiento sobre esta tarea no estan disponibles para las alternativas.

| Modelo | Parametros (referencia) | Entrada tipica | Resultado en PlantCity | Licencia |
|---|---|---|---|---|
| PlantCare (este modelo) | 4.293.044 | 224x224 | Exactitud 0,9954; macro-F1 0,9949 | no disponible |
| MobileNetV3-Large estandar (ImageNet) | ~5,4 M (cabeza de 1000 clases) | 224x224 | no evaluado | Apache-2.0 (referencia timm) |
| EfficientNet-B0 | ~5,3 M | 224x224 | no evaluado | Apache-2.0 (referencia timm) |
| ResNet-50 | ~25,6 M | 224x224 | no evaluado | Apache-2.0 (referencia) |

Las cifras de parametros de las alternativas son valores publicos de arquitectura y no resultados medidos; se incluyen solo como referencia de orden de magnitud. No se dispone de una comparacion de rendimiento justa, ya que no se han evaluado alternativas sobre el mismo dataset ni con el mismo protocolo.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entreno unicamente con hojas de dos distritos de Khyber Pakhtunkhwa (Charsadda y Chitral), por lo que puede estar sesgado hacia las condiciones locales de esas zonas.
- Riesgo de caida de rendimiento: el propio autor advierte de que es esperable una perdida de exactitud con otras regiones, camaras y cultivos distintos de los de entrenamiento.
- Alucinacion/clasificacion erronea: aunque las probabilidades estan calibradas, el modelo es un clasificador y puede asignar una clase incorrecta con alta confianza en imagenes fuera de su distribucion.
- No es un diagnostico: debe usarse como apoyo a la decision, nunca como sustituto de una evaluacion fitopatologica profesional.
- Licencia: la licencia del modelo no esta disponible, lo que impide determinar con certeza las condiciones de uso comercial. Ademas, el autor senala que debe comprobarse la licencia del dataset PlantCity (Mendeley Data) antes de redistribuir los pesos.
- Restricciones de uso comercial: no se pueden confirmar permisos de uso comercial mientras la licencia siga sin especificarse.
- Limitaciones de contexto e idioma: no aplica, al ser un modelo de vision; no procesa texto ni mantiene contexto conversacional.
- Reproducibilidad: con 0 descargas y 0 likes y un repositorio de 0,0 GB, el modelo es de reciente publicacion y practicamente sin validacion por parte de la comunidad; no hay evaluaciones independientes que confirmen las metricas declaradas.
- Dependencia de calibracion: para obtener confianzas fiables es obligatorio dividir los logits por la temperatura indicada en `plantcare_meta.json`; omitir este paso invalida el ECE reportado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shahabkhan396/plantcare-mobilenetv3-large
- Libreria timm (pytorch-image-models): https://github.com/huggingface/pytorch-image-models
- Dataset citado: Khan et al. (2025), "PlantCity: A Comprehensive Image Based on Multi Crop Leaves disease in Pakistan", Mendeley Data (URL no disponible en la informacion proporcionada).
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios ni demos adicionales asociados al modelo.
