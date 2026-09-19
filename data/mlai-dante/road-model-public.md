# mlai-dante/road-model-public

## Resumen

El modelo `mlai-dante/road-model-public` es un adaptador LoRA de tipo PEFT construido sobre el modelo base multimodal `Qwen/Qwen3-VL-8B-Instruct`. Lo desarrolla el usuario mlai-dante y esta especializado en una tarea muy concreta: la transcripcion automatica de texto manuscrito historico contenido en imagenes recortadas procedentes de archivos de Barbados (documentos legales, testamentos, escrituras y protocolos notariales de los siglos XVIII y XIX). Se enmarca en la competicion Zindi R.O.A.D. Barbados Historic Handwriting Challenge, por lo que su proposito es resolver un problema de OCR sobre escritura manuscrita historica, un dominio donde los modelos genericos de vision-lenguaje suelen fallar por la variabilidad caligrafica, la ortografia arcaica y las abreviaturas de la epoca.

Tecnicamente no es un modelo completo, sino un adaptador de bajo rango que se aplica sobre un transformer multimodal de 8.000 millones de parametros con torre de vision. Al reutilizar el modelo base, hereda su ventana de contexto, su soporte multilingue y su capacidad de seguir instrucciones, y anade un ajuste fino orientado a preservar literalmente la grafia original en lugar de normalizarla. La ficha oficial solo publica metricas de validacion de la tarea (CER, WER y una puntuacion agregada), sin datos sobre composicion del dataset de entrenamiento ni hiperparametros mas alla del fichero de configuracion incluido en el repositorio.

Su relevancia es acotada pero clara: es un ejemplo de especializacion mediante LoRA sobre un modelo multimodal abierto para digitalizacion de patrimonio documental, un caso de uso donde el coste de anotar datos de dominio es muy alto y el ajuste eficiente de parametros resulta mucho mas practico que entrenar un modelo desde cero. El repositorio tiene 57 descargas y 0 likes en el momento de la consulta, y ocupa 54,7 GB, un tamano que sugiere la inclusion de pesos fusionados o artefactos de ejecucion ademas del propio adaptador.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer multimodal (vision-lenguaje) Qwen3-VL; el modelo base combina torre de vision con decoder de lenguaje |
| Parametros totales | No disponible en la ficha del adaptador; el modelo base `Qwen/Qwen3-VL-8B-Instruct` tiene 8.000 millones de parametros (aproximadamente) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la ficha del adaptador; heredada del modelo base Qwen3-VL-8B-Instruct |
| Tipos de cuantizacion | No disponible en la ficha del adaptador; el modelo base admite cuantizaciones estandar de la familia Qwen (BF16, FP8, INT8, INT4/GGUF) mediante herramientas de terceros |
| Idiomas soportados | No disponible en la ficha (el campo de idiomas no esta declarado); la tarea objetivo es transcripcion de manuscritos en ingles historico |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA en formato PEFT); se incluyen ademas ficheros de procesador y artefactos de ejecucion |
| Tamano del repositorio | 54,7 GB |
| Libreria declarada | peft |
| Pipeline | image-text-to-text |
| Modelo base | Qwen/Qwen3-VL-8B-Instruct |
| Tarea declarada | OCR y reconocimiento de escritura manuscrita (handwriting-recognition) |
| Descargas / likes | 57 descargas, 0 likes |
| Fecha de creacion | 2026-08-09 |
| Ultima actualizacion | 2026-09-19 |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA, no un modelo entrenado de principio a fin. La arquitectura subyacente es la del modelo base Qwen3-VL-8B-Instruct, un transformer multimodal con codificador de vision y decoder de lenguaje que procesa pares imagen-texto. El adaptador introduce matrices de bajo rango en capas seleccionadas del modelo base, de modo que en inferencia hay que cargar primero Qwen3-VL-8B-Instruct y despues aplicar el adaptador mediante la libreria PEFT, o bien fusionar los pesos previamente para servirlo como un unico modelo.

La unica informacion de entrenamiento publicada por el autor son las metricas de validacion y la inclusion del fichero de configuracion de entrenamiento (`training config`) dentro del repositorio, junto con `submission.csv`, las metricas de validacion y las predicciones de validacion. No se detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El modelo esta entrenado especificamente para transcribir recortes de una linea o frases cortas de documentos manuscritos, y el prompt de inferencia incluido en la model card obliga a preservar la grafia arcaica, las abreviaturas y los simbolos originales (por ejemplo `y^e`, `p^rsents`, `s^d`, `deced`), prohibiendo explicitamente modernizar la ortografia, expandir abreviaturas, anadir palabras o describir la imagen. No se declaran innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal mas alla de las que ya incorpora el modelo base.

## Capacidades

- Transcripcion de imagenes de texto manuscrito historico (imagen a texto), que es la unica tarea para la que el adaptador esta ajustado de forma explicita.
- Preservacion de grafia arcaica y no normalizada: mantiene ortografia antigua, mayusculas, puntuacion visible y abreviaturas tal como aparecen en el documento.
- Manejo de marcas y simbolos propios de documentos notariales y legales de los siglos XVIII y XIX, como abreviaturas con superindices o contracciones.
- Capacidades heredadas del modelo base Qwen3-VL-8B-Instruct: comprension de imagenes, respuesta conversacional y generacion de texto multimodal.
- Soporte de tool calling y function calling: no disponible en la ficha del adaptador; depende del modelo base y no se documenta para el adaptador.
- Soporte de agentes y razonamiento multi-paso: no disponible en la ficha del adaptador.
- Capacidades multilingues: no declaradas; el ajuste fino esta orientado a manuscritos en ingles historico.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Salida restringida: el prompt oficial fuerza a devolver unicamente el texto transcrito, sin explicaciones ni descripciones.

## Casos de uso

- Digitalizacion de archivos historicos de Barbados: el adaptador se aplica sobre recortes de linea de documentos de los siglos XVIII y XIX para generar transcripciones literales que alimenten catalogos y buscadores de archivo.
- Proyectos de humanidades digitales: investigacion sobre derecho, propiedad y genealogia colonial que requiere texto fiel a la grafia original, sin modernizacion, para poder citar y estudiar variantes ortograficas.
- Reproduccion de la competicion Zindi R.O.A.D.: el repositorio incluye `submission.csv`, metricas y predicciones de validacion, por lo que sirve como punto de partida reproducible para participantes o para evaluar mejoras sobre el mismo conjunto.
- Preanotacion asistida para paleografos: generar una primera transcripcion automatica (CER de validacion 0,079) que despues un experto corrige, reduciendo el tiempo de transcripcion manual.
- Construccion de pipelines de OCR especializado: integracion del adaptador en un flujo que primero detecta y recorta lineas de manuscrito y despues invoca el modelo para transcribir cada recorte.
- Investigacion sobre ajuste eficiente de parametros: caso de estudio de LoRA aplicado a un modelo vision-lenguaje de 8B para un dominio de nicho, comparable con otras tecnicas de ajuste.
- Extraccion de entidades sobre documentos notariales: una vez transcrito el texto, un modelo de lenguaje puede procesar la salida para identificar nombres, fechas, propiedades o formulas legales.
- Puesta en produccion de un servicio de transcripcion bajo licencia Apache 2.0: al ser una licencia permisiva, permite uso comercial, siempre que se respeten las condiciones aplicables al modelo base.

## Benchmarks y rendimiento

Los unicos datos numericos publicados por el autor corresponden a la validacion de la tarea de transcripcion:

| Metrica | Valor |
|---|---|
| CER (Character Error Rate) | 0,079004 |
| WER (Word Error Rate) | 0,222702 |
| Score (agregado de la competicion) | 0,150853 |

No se han publicado resultados en la informacion disponible para benchmarks generales como MMLU, GSM8K, HumanEval ni para comparativas estandar de OCR. Tampoco se especifica el conjunto de validacion empleado, su tamano ni el metodo de calculo exacto del score agregado.

## Requisitos de hardware

- El adaptador LoRA es pequeno en si mismo, pero para inferencia es obligatorio cargar el modelo base completo `Qwen/Qwen3-VL-8B-Instruct`, ademas del codificador de vision.
- VRAM estimada en BF16/FP16 (aproximada, solo pesos): en torno a 16-18 GB, mas el coste de la cache KV y de las activaciones de la torre de vision, que depende de la resolucion de las imagenes de entrada.
- VRAM estimada en INT8: aproximadamente 9-10 GB. En INT4: aproximadamente 6-7 GB. Son estimaciones generales para un modelo de 8B y no cifras publicadas por el autor.
- Cabe en GPU de consumo en cuantizaciones bajas: RTX 4090 (24 GB) en BF16 con margen, RTX 3090 (24 GB) en BF16, y GPUs de 8-12 GB en INT4 si se dispone de soporte de vision en el runtime elegido.
- GPU recomendadas para despliegue en BF16 con concurrencia: A100 40/80 GB, H100 80 GB, L40S, y alternativas de 24 GB o mas para uso individual.
- Opciones de despliegue: transformers junto con PEFT para cargar el adaptador directamente; vLLM, SGLang o TGI para servir el modelo fusionado; llama.cpp/GGUF con fichero `mmproj` para vision; Ollama u otros empaquetados similares.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dependen fuertemente del runtime, del hardware y del numero de imagenes por peticion.
- Nota practica: para servir con vLLM, TGI o llama.cpp suele ser necesario fusionar el adaptador con el modelo base, ya que no todos estos runtimes cargan adaptadores PEFT de forma nativa.

## Comparativa con modelos similares

No hay datos comparativos publicados en la informacion disponible para esta tarea concreta. La tabla siguiente recoge alternativas de categoria similar con los datos conocidos de cada una; en la columna de rendimiento se indica que no existen metricas comparables para el conjunto de validacion del adaptador.

| Modelo | Parametros | Tipo | Contexto | Licencia | Rendimiento en escritura manuscrita historica |
|---|---|---|---|---|---|
| mlai-dante/road-model-public (este modelo) | Adaptador sobre base de 8B | LoRA sobre VLM | No disponible | Apache 2.0 | CER 0,079004 / WER 0,222702 en su validacion propia |
| Qwen/Qwen3-VL-8B-Instruct (base sin ajustar) | 8B | VLM | No disponible | No disponible | No disponible |
| Qwen2.5-VL-7B-Instruct | 7B | VLM | No disponible | No disponible | No disponible |
| TrOCR (variantes) | 300M-1B aproximadamente | Modelo especifico de OCR | No aplica | No disponible | No disponible |
| Donut | 200M-1B aproximadamente | Modelo especifico de comprension de documentos | No aplica | No disponible | No disponible |

## Limitaciones y advertencias

- Alcance muy restringido: el adaptador esta entrenado para recortes de manuscritos de archivos de Barbados de los siglos XVIII y XIX; su comportamiento fuera de ese dominio no esta documentado y probablemente degrade de forma notable.
- No es un modelo autonomo: requiere el modelo base Qwen3-VL-8B-Instruct y la libreria PEFT, o la fusion previa de pesos.
- Riesgo de error de transcripcion: el WER de validacion es 0,222702, es decir, aproximadamente una palabra erronea de cada cinco en el conjunto evaluado. No es adecuado para transcripcion sin revision humana en contextos criticos.
- Las imagenes y los CSV originales de la competicion no se han subido al repositorio, por lo que no es posible reproducir la validacion sin acceso a los datos del reto.
- No se documentan sesgos, composicion del dataset, numero de tokens de entrenamiento ni proceso de curacion de datos, lo que limita la evaluacion de riesgos.
- No se declaran idiomas soportados ni capacidades multilingues para este adaptador.
- Fechas de creacion y actualizacion inusuales (2026) tal como figuran en los metadatos de HuggingFace; conviene verificarlas antes de citarlas.
- Advertencia de licencia: el adaptador se publica bajo Apache 2.0, pero el uso comercial del conjunto adaptador mas modelo base depende tambien de las condiciones de la licencia de Qwen3-VL-8B-Instruct, que debe comprobarse por separado.
- El tamano del repositorio (54,7 GB) es muy superior al de un adaptador LoRA tipico, por lo que conviene revisar que artefactos se descargan antes de almacenarlos.
- Los resultados de busqueda web asociados a esta consulta no contienen informacion relevante sobre el modelo (los enlaces recuperados corresponden a secadores de manos Dyson), por lo que no se ha podido contrastar la ficha con fuentes externas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlai-dante/road-model-public
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Competicion Zindi R.O.A.D. Barbados Historic Handwriting Challenge: no disponible el enlace en la informacion proporcionada
- Paper del modelo base Qwen3-VL: no disponible en la informacion proporcionada
- Repositorio de codigo o demo: no disponible en la informacion proporcionada
- Otros enlaces relevantes: no se han encontrado resultados de busqueda pertinentes para este modelo
