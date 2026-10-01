# BenMLMaster/hw1-hc3-detector

## Resumen

hw1-hc3-detector es un modelo de clasificación de texto desarrollado por el usuario BenMLMaster que distingue entre texto escrito por humanos y texto generado por IA. Se construye mediante fine-tuning del encoder sentence-transformers/all-MiniLM-L6-v2 sobre el dataset Hello-SimpleAI/HC3, un corpus publico de pares pregunta-respuesta con respuestas humanas y generadas por IA. El resultado es un clasificador binario especializado, no un modelo generativo.

El modelo tiene 22.713.986 parametros totales, empaquetados en formato safetensors, y se distribuye a traves de la libreria transformers con pipeline text-classification. El tamaño del repositorio es de solo 0,1 GB, lo que lo hace extremadamente ligero para despliegue en produccion o en hardware modesto. Su relevancia radica en la deteccion de contenido sintetico, una tarea con demanda creciente para moderacion de plataformas, verificacion academica y filtrado de datos de entrenamiento.

El autor reporta una precision (accuracy) baseline de 0.8451 y una precision de test tras el fine-tuning de 0.9908, lo que indica una mejora sustancial respecto al modelo base sin ajustar. No se proporcionan datos sobre licencia, idiomas soportados ni resultados en otros benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MiniLM, derivado de BERT) |
| Parametros totales | 22.713.986 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (el modelo base all-MiniLM-L6-v2 emplea 256 tokens) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; presumiblemente fp32) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de un encoder transformer de tipo MiniLM, concretamente un fine-tuning de sentence-transformers/all-MiniLM-L6-v2. Esta arquitectura es una version destilada de 6 capas de BERT, optimizada para producir embeddings compactos y rapidos. El modelo original cuenta con aproximadamente 22,7 millones de parametros, cifra que coincide con la reportada en el repositorio, lo que sugiere que se ha reutilizado la cabeza de clasificacion sobre el encoder preentrenado.

El entrenamiento se realizo sobre el dataset Hello-SimpleAI/HC3, que contiene respuestas etiquetadas como humanas o generadas por IA. El autor no detalla el numero de tokens, la composicion exacta del conjunto de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO (poco habituales en tareas de clasificacion). Tampoco se especifican hiperparametros, epocas ni estrategia de validacion. El unico dato de rendimiento aportado es la comparacion entre la precision baseline (0.8451) y la precision de test tras el fine-tuning (0.9908).

## Capacidades

- Clasificacion binaria de texto: distingue entre contenido escrito por humanos y contenido generado por IA.
- Inferencia rapida gracias al reducido numero de parametros (22,7 M) del encoder MiniLM.
- Compatibilidad con el pipeline text-classification de la libreria transformers.
- Soporte declarado para text-embeddings-inference y endpoints_compatible, lo que facilita su despliegue mediante la infraestructura de Hugging Face.
- No genera texto: no es un modelo causal ni tiene modo de razonamiento.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documentan capacidades multilingues ni de vision o audio.

## Casos de uso

- Moderacion de contenido en plataformas: el clasificador puede integrarse en pipelines de revision para marcar automaticamente textos sospechosos de haber sido generados por IA, con una precision reportada de 0.9908 sobre el conjunto de test del HC3.
- Verificacion academica: detectar si un ensayo o respuesta de examen ha sido producido por un modelo de lenguaje, como primera capa de triaje antes de una revision humana.
- Filtrado de datos de entrenamiento: eliminar muestras generadas sinteticamente de corpus recolectados de internet para evitar sesgos de contaminacion en futuros entrenamientos.
- Deteccion de reseñas falsas: clasificar opiniones de productos o servicios que podrian haber sido generadas de forma masiva por bots.
- Analisis de integridad en periodismo: comprobar la autoria de articulos o comentarios enviados por colaboradores externos.
- Investigacion sobre deteccion de texto sintetico: servir como linea base reproducible sobre el dataset HC3 para comparar con modelos mas grandes o enfoques alternativos.
- Preprocesado de datasets etiquetados: limpiar corpus mixtos antes de usarlos para entrenar otros modelos generativos o discriminativos.

## Benchmarks y rendimiento

La informacion proporcionada unicamente incluye metricas de accuracy sobre el dataset HC3. No se aportan resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar, dado que se trata de un clasificador de texto y no de un modelo generativo.

| Metrica | Valor |
|---|---|
| Baseline accuracy (modelo base sin fine-tuning) | 0.8451 |
| Fine-tuned test accuracy | 0.9908 |

No se dispone de datos desagregados por clase, matriz de confusion, F1, precision ni recall. Tampoco se especifica el tamaño del conjunto de test empleado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Con 22,7 M de parametros, en fp32 los pesos ocupan aproximadamente 91 MB y en fp16 unos 45 MB.
- GPU recomendadas: cualquier GPU moderna, incluidas NVIDIA GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090, A100 o H100. Tambien es viable la inferencia en CPU con latencias de milisegundos por peticion.
- Cabe en cualquier GPU de consumo, e incluso en dispositivos de gama baja y en entornos edge.
- Opciones de despliegue: transformers (pipeline text-classification), text-embeddings-inference, endpoints de Hugging Face y despliegues propios via FastAPI o similares.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada, aunque por el tamaño del modelo se espera un throughput alto (>1000 peticiones por segundo por GPU en lote) y latencias en el rango de pocos milisegundos.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de otros detectores de texto generado por IA en la informacion proporcionada. A continuacion se comparan caracteristicas estructurales con alternativas conocidas del ecosistema, si bien no se aportan sus metricas:

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BenMLMaster/hw1-hc3-detector | 22,7 M | Encoder clasificador | No disponible | No disponible | Hugging Face |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M | Encoder de embeddings | 256 tokens (modelo base) | Apache 2.0 | Hugging Face |
| Detectores basados en RoBERTa (por ejemplo, openai-detector) | 125 M - 355 M | Encoder clasificador | 512 tokens | Generalmente MIT o similar | Hugging Face |

No se han publicado resultados comparativos de benchmarks entre estos modelos en la informacion disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan analisis de sesgo por idioma, dominio, genero o registro. Al entrenarse sobre HC3, el modelo puede estar sesgado hacia el estilo y dominio de ese dataset concreto.
- Riesgo de sobreajuste al dominio: una precision del 0.9908 en el conjunto de test del HC3 no garantiza un rendimiento equivalente en textos de otros dominios, idiomas o generadores distintos a los presentes en el dataset.
- Generalizacion limitada: los detectores de texto IA entrenados sobre un unico dataset suelen degradarse ante nuevos modelos generativos o ante texto parafraseado o editado por humanos.
- Riesgo de falsos positivos: textos humanos con estilo formal, repetitivo o muy estructurado pueden clasificarse erroneamente como generados por IA, con las implicaciones eticas o academicas que ello conlleva.
- Licencia no disponible: al no especificarse la licencia, no puede confirmarse la legalidad del uso comercial. Se recomienda contactar con el autor antes de emplearlo en produccion.
- Idiomas soportados no disponibles: no se puede garantizar el funcionamiento fuera del ingles.
- Contexto limitado: al derivar de all-MiniLM-L6-v2, es probable que la longitud maxima de secuencia sea de 256 tokens, lo que restringe la clasificacion de documentos largos sin truncado o fragmentacion.
- Sin metricas desagregadas: la ausencia de F1, precision y recall por clase dificulta evaluar el comportamiento en escenarios desbalanceados.
- Uso responsable: la deteccion automatica de contenido IA no es concluyente y no deberia emplearse como unica evidencia en decisiones disciplinarias o legales.
- Repositorio sin adopcion: cero descargas y cero likes en el momento de la consulta, por lo que no existe validacion comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/BenMLMaster/hw1-hc3-detector
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Dataset: https://huggingface.co/datasets/Hello-SimpleAI/HC3
- Repositorio del dataset HC3 (paper original): no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible
