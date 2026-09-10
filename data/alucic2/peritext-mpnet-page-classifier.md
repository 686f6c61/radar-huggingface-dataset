# alucic2/peritext-mpnet-page-classifier

## Resumen

Peritext MPNet Page Classifier es un modelo de clasificación de texto desarrollado por Ana Lucic, Tanmoy Debnath y John Shanahan en el marco del proyecto Peritext. Su función es etiquetar páginas individuales de volúmenes digitalizados en tres categorías estructurales: `Front` (preliminares), `Core` (cuerpo principal del texto) y `Back` (material final, como índices o apéndices). El modelo está pensado para tareas de humanidades digitales y para corpus con estructura tipo HathiTrust.

Técnicamente es un encoder MPNet (`sentence-transformers/all-mpnet-base-v2`) con 109.489.347 parámetros, al que se le ha añadido una cabeza personalizada que combina la representación `[CLS]` con 14 características posicionales derivadas de la posición de la página dentro del volumen (deciles y percentiles). Esta combinación de señal textual y señal estructural es lo que lo diferencia de un clasificador de texto genérico. La longitud máxima de tokens es de 256.

Es relevante porque automatiza una tarea de preprocesado costosa y habitualmente manual en proyectos de digitalización masiva: separar el peritexto del cuerpo del texto antes de indexar, analizar o entrenar otros modelos. El repositorio se publica bajo licencia Apache-2.0, no acumula descargas ni likes en el momento de la consulta y no redistribuye el texto completo de las páginas utilizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MPNet (encoder transformer) con representacion `[CLS]` + MLP sobre 14 caracteristicas posicionales, seguido de un clasificador lineal |
| Parametros totales | 109.489.347 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 256 tokens (maximo de entrenamiento; el autor indica que no debe usarse 128) |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors sin variantes cuantizadas documentadas) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del encoder MPNet de `sentence-transformers/all-mpnet-base-v2` (arquitectura transformer tipo encoder, no generativa). Sobre la representacion `[CLS]` se concatena un vector de 14 caracteristicas posicionales calculadas por volumen: cuatro deciles (`decile_10`, `decile_5`, `decile_4`, `decile_2`) y diez indicadores de percentil acumulado (`below_10` a `below_100`). Esa representacion combinada pasa por un MLP y termina en una capa lineal de tres clases. El orden de las caracteristicas es fijo y debe respetarse; las columnas se calculan agrupando por identificador de libro con numeracion de pagina basada en 1.

Los datos de entrenamiento proceden de 944 volumenes anotados en los que cada volumen contiene paginas de tipo Front, Core y Back. El texto completo de las paginas no se redistribuye: la publicacion companera puede incluir solo etiquetas, metadatos de volumen y caracteristicas posicionales. La model card no detalla el numero total de tokens de entrenamiento ni la composicion exacta del dataset, y no menciona el uso de RLHF, DPO ni tecnicas de decodificacion especulativa (no aplicables a un clasificador).

## Capacidades

- Clasificacion de paginas de libros digitalizados en tres clases: `Front`, `Core` y `Back`.
- Extraccion de caracteristicas (`feature-extraction`) mediante el encoder MPNet subyacente.
- Uso de senal estructural ademas del texto, gracias a las 14 caracteristicas posicionales.
- Procesamiento por lotes de paginas con `padding="max_length"` y truncado a 256 tokens.
- Integracion con la libreria `transformers` mediante `AutoTokenizer` y `AutoModel` con `trust_remote_code=True`.
- No soporta generacion de texto, razonamiento multi-paso, tool calling ni agentes: es exclusivamente un clasificador.
- No tiene capacidades multilingues fuera del ingles ni capacidades de vision o audio.

## Casos de uso

- Separacion de peritexto en corpus digitalizados: el modelo etiqueta cada pagina de un volumen como Front, Core o Back, lo que permite descartar preliminares e indices antes de indexar el cuerpo del texto.
- Preprocesado para mineria de textos en humanidades digitales: al aislar el `Core`, los estudios de frecuencia terminologica o de evolucion estilistica dejan de contaminarse con indices, portadas y apendices.
- Indexacion y busqueda en bibliotecas digitales: filtrar el peritexto mejora la precision de los motores de busqueda sobre el contenido sustantivo del volumen.
- Limpieza de datasets de entrenamiento: usar el clasificador para depurar grandes colecciones de texto OCR antes de entrenar otros modelos de lenguaje o de embeddings.
- Analisis estructural del libro: medir de forma automatica la proporcion de paginas preliminares y finales por volumen para estudios bibliograficos o de historia de la edicion.
- Extraccion de entidades en indices y apendices: identificar la clase `Back` permite localizar indices onomasticos o tematicos y procesarlos por separado.
- Control de calidad en pipelines de digitalizacion: detectar volumenes con estructuras anomalas (por ejemplo, muchas paginas clasificadas como Front) para revision humana.
- Curación de metadatos en proyectos tipo HathiTrust: asignar rangos de paginas por clase facilita generar metadatos de estructura a nivel de volumen.

## Benchmarks y rendimiento

Validacion externa sobre 109 volumenes reservados (36.466 paginas con texto extraible; se descartan paginas vacias):

| Clase | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|
| Front | 0.793 | 0.971 | 0.873 | 1.349 |
| Core | 0.995 | 0.982 | 0.988 | 33.599 |
| Back | 0.841 | 0.910 | 0.874 | 1.518 |
| Accuracy | | | 0.979 | 36.466 |
| Macro avg | 0.876 | 0.954 | 0.912 | 36.466 |

Matriz de confusion (filas = real, columnas = predicho):

| | Front | Core | Back |
|---|------:|-----:|-----:|
| Front | 1310 | 36 | 3 |
| Core | 341 | 33000 | 258 |
| Back | 0 | 137 | 1381 |

Evaluacion interna en el corpus retenido durante el entrenamiento: F1 de 0,90 / 0,99 / 0,89 para Front / Core / Back, con accuracy de 0,98. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 438 MB solo para los pesos (109.489.347 parametros x 4 bytes), mas activaciones y buffers de tokenizacion; en la practica cabe holgadamente por debajo de 1 GB.
- VRAM estimada en fp16/bf16: aproximadamente 219 MB para los pesos.
- Cabe en cualquier GPU de consumo, incluidas GTX 1050 Ti, RTX 3050, RTX 4090 o Apple Silicon con MPS.
- Funciona en CPU: el coste dominante es el forward de un encoder de 109 M de parametros sobre secuencias de 256 tokens, adecuado para procesar corpus grandes por lotes.
- Para volumenes masivos, GPU de datacenter (A100, H100, L4) permiten lotes grandes y mayor throughput, aunque no se han publicado medidas concretas de latencia ni de paginas por segundo.
- Opciones de despliegue: `transformers` con `AutoModel` y `trust_remote_code=True` (el autor indica que es obligatorio para cargar la cabeza personalizada); tambien es viable exportar a ONNX Runtime o servir con FastAPI/TorchServe/Triton. vLLM, TGI y llama.cpp no son adecuados porque el modelo no es generativo.
- No se dispone de datos publicados de latencia ni throughput en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de comparativas de rendimiento publicadas frente a otros clasificadores de peritexto, ya que no se han identificado alternativas equivalentes en la informacion disponible. La tabla siguiente recoge solo caracteristicas verificables de modelos de la misma familia y tamano, sin datos de rendimiento comparado:

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| peritext-mpnet-page-classifier | 109.489.347 | 256 tokens | Clasificacion de pagina (Front/Core/Back) con features posicionales | Apache-2.0 |
| sentence-transformers/all-mpnet-base-v2 (modelo base) | ~109 M | 512 tokens | Embeddings de frase | Apache-2.0 |
| distilbert-base-uncased | ~66 M | 512 tokens | Clasificacion de texto generica (requiere fine-tuning) | Apache-2.0 |

Rendimiento comparado: no disponible.

## Limitaciones y advertencias

- Requiere que el usuario tenga derechos de acceso al texto de las paginas que procese; el modelo no redistribuye texto completo y hay que respetar los terminos del corpus de origen (por ejemplo, HathiTrust).
- El rendimiento puede degradarse en generos atipicos: poesia, obras muy cortas o estructuras poco habituales.
- Las 14 caracteristicas posicionales deben calcularse exactamente con las definiciones de la model card y en el orden de entrenamiento; cualquier discrepancia silenciosa reduce la precision.
- Existe un desequilibrio de clases acusado: `Core` representa 33.599 de las 36.466 paginas de validacion (aproximadamente el 92 %). La accuracy agregada es enganosa y deben reportarse metricas por clase.
- La precision de la clase `Front` es baja (0,793): 341 paginas de cuerpo se clasifican erroneamente como preliminares, lo que puede eliminar contenido relevante si se usa el filtro de forma agresiva.
- Los errores residuales se concentran en las fronteras Core-Front y Core-Back.
- El modelo solo esta entrenado y documentado en ingles; no hay soporte para otros idiomas.
- El limite de 256 tokens implica truncado en paginas largas, con perdida de informacion textual.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo remoto del repositorio; conviene auditar el codigo antes de usarlo en produccion.
- La licencia Apache-2.0 cubre los pesos y el codigo del repositorio, pero no exime de respetar las condiciones de las fuentes de texto.
- El repositorio tiene 0 descargas y 0 likes, por lo que no cuenta con validacion independiente de la comunidad.
- No debe considerarse un sustituto de la anotacion humana en casos limite; el propio autor lo advierte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alucic2/peritext-mpnet-page-classifier
- Modelo base: https://huggingface.co/sentence-transformers/all-mpnet-base-v2
- HathiTrust (corpus de referencia): https://www.hathitrust.org/
- Documentacion de `transformers`: https://huggingface.co/docs/transformers/index
- Paper o publicacion del proyecto Peritext: no disponible
- Repositorio de codigo del proyecto: no disponible
- Demo en linea: no disponible
