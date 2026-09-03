# bisalsaha/ucb-doc-classifier

## Resumen

El modelo `bisalsaha/ucb-doc-classifier` es un clasificador de texto basado en la arquitectura BART, desarrollado por el usuario bisalsaha y publicado en Hugging Face. Está diseñado para clasificar documentos comerciales en cuatro categorías: factura comercial (commercial invoice), lista de empaque (packing list), conocimiento de embarque (bill of lading) y certificado de origen (certificate of origin). El modelo se distribuye como un pipeline de `text-classification` y es compatible con la librería Transformers.

Con 140 millones de parámetros, corresponde al tamaño de BART-base, un modelo encoder-decoder preentrenado mediante denoising. Para la tarea de clasificación, se utiliza únicamente el encoder, que produce una representación del texto de entrada que se proyecta a las clases objetivo. El repositorio incluye un Space de Hugging Face que permite probar el modelo pegando texto extraído de un PDF y obteniendo el tipo de documento más probable.

La relevancia de este modelo radica en su aplicación práctica para la automatización de procesos logísticos y de comercio internacional, donde la identificación automática de tipos de documentos es un paso previo a tareas como la extracción de datos o el enrutamiento de expedientes. Sin embargo, la model card es extremadamente escasa y no proporciona información sobre el conjunto de datos de entrenamiento, el rendimiento o las limitaciones, lo que limita su evaluación rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BART (encoder-decoder, usado como clasificador con el encoder) |
| Parametros totales | 140.018.698 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en BART, una arquitectura transformer con codificador y decodificador, introducida en el articulo "BART: Denoising Sequence-to-Sequence Pre-training for Natural Language Generation, Translation, and Comprehension" (arXiv:1910.09700). BART se preentrena corrompiendo el texto con diversas transformaciones de ruido (eliminacion de tokens, permutacion de frases, etc.) y aprendiendo a reconstruir el texto original. Para la clasificacion de secuencias, se emplea tipicamente la representacion del token especial de clasificacion del encoder, que se alimenta a una cabeza de clasificacion lineal.

No se dispone de informacion sobre el proceso de fine-tuning especifico de este modelo: no se conocen los datos de entrenamiento, el numero de epocas, la tasa de aprendizaje ni el regimen de precision (fp32, fp16, etc.). La model card no incluye ningun detalle sobre el conjunto de datos utilizado para la clasificacion de documentos, aunque por la naturaleza de la tarea se infiere que se trata de un corpus de documentos comerciales en ingles (los nombres de las categorias estan en ingles). Tampoco se indica si se aplicaron tecnicas de aumento de datos o regularizacion adicional.

## Capacidades

- Clasificacion de documentos comerciales en cuatro categorias: factura comercial, lista de empaque, conocimiento de embarque y certificado de origen.
- Procesamiento de texto plano extraido de PDFs, segun la descripcion del Space asociado.
- Salida de la clase mas probable junto con una puntuacion de confianza (segun la interfaz del Space).
- Compatible con el pipeline `text-classification` de Transformers, lo que facilita su integracion en aplicaciones existentes.
- No se han documentado capacidades adicionales como generacion de texto, razonamiento, tool calling o soporte multilingue.

## Casos de uso

- Automatizacion de procesos de importacion y exportacion: el modelo puede clasificar documentos adjuntos en correos o sistemas de gestion documental, permitiendo enrutarlos automaticamente a los flujos de trabajo correspondientes (por ejemplo, facturas al departamento de contabilidad y conocimientos de embarque al equipo de logistica).
- Validacion de expedientes en plataformas de comercio internacional: al recibir un lote de documentos, el modelo identifica el tipo de cada uno, facilitando la verificacion de que todos los documentos requeridos estan presentes.
- Extraccion de datos asistida: una vez clasificado el documento, se puede invocar un sistema de extraccion de campos especifico para cada tipo (numero de factura, peso bruto, origen, etc.), reduciendo el trabajo manual.
- Integracion en sistemas de gestion documental (DMS): el modelo puede etiquetar automaticamente los documentos subidos, mejorando la busqueda y la organizacion.
- Preprocesamiento en pipelines de RPA (automatizacion robotica de procesos): los robots pueden usar el clasificador para decidir que acciones ejecutar sobre cada documento.
- Demostracion educativa: el Space de Hugging Face sirve como ejemplo de como desplegar un clasificador de documentos con Transformers, util para fines de formacion o prototipado rapido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud, F1, precision o recall, ni comparaciones con otros modelos. Tampoco se proporcionan datos sobre latencia o throughput.

## Requisitos de hardware

- Al tratarse de un modelo de 140 millones de parametros, su huella de memoria es reducida: en precision fp32 los pesos ocupan aproximadamente 560 MB, y en fp16 unos 280 MB. Esto permite ejecutarlo en GPUs de consumo con 4 GB de VRAM o incluso en CPU con suficiente RAM.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060) es suficiente. Para despliegues en produccion, una T4 o A10 de 16 GB ofrece margen amplio.
- Es viable ejecutar el modelo en CPU para inferencia por lotes, aunque la latencia sera mayor (del orden de cientos de milisegundos por documento, dependiendo de la longitud del texto).
- Opciones de despliegue: al ser un modelo de Transformers, puede servirse con vLLM, TGI (Text Generation Inference) o mediante un endpoint de Hugging Face. Tambien es posible exportarlo a ONNX o TensorRT para optimizacion.
- No se dispone de mediciones de latencia o throughput publicadas por el autor.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especificos para la clasificacion de documentos comerciales. Existen modelos genericos de clasificacion de texto como `distilbert-base-uncased` o `roberta-base`, pero no hay datos que permitan una comparacion directa con este modelo en la tarea concreta. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- La model card no proporciona informacion sobre sesgos, riesgos o limitaciones tecnicas. Se desconoce si el modelo presenta sesgos relacionados con el idioma, el formato de los documentos o la distribucion de las clases.
- No se especifica la licencia, lo que impide conocer las restricciones de uso comercial o redistribucion. Se recomienda contactar con el autor antes de utilizarlo en entornos de produccion.
- El modelo solo clasifica texto plano; no procesa imagenes ni PDFs directamente. Es necesario extraer el texto previamente, lo que puede introducir errores si la extraccion es deficiente (por ejemplo, con documentos escaneados de baja calidad).
- No se indica el idioma de los documentos soportados. Dado que las categorias estan en ingles, es probable que el modelo funcione mejor con documentos en ingles, pero no hay confirmacion.
- Al no haber benchmarks publicados, no se puede evaluar la precision real del modelo. Podria tener un rendimiento insuficiente en documentos con formatos muy variados o con vocabulario tecnico especifico.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bisalsaha/ucb-doc-classifier
- Space de demostracion: https://huggingface.co/spaces/bisalsaha/ucb-doc-classifier
- Paper de BART (referencia arquitectonica): https://arxiv.org/abs/1910.09700
