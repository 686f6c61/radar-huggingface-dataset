# MishanyaP/dl2-hw2-ner

## Resumen

dl2-hw2-ner es un modelo de reconocimiento de entidades nombradas (NER) obtenido mediante fine-tuning de BAAI/bge-small-en-v1.5 sobre la partición de entrenamiento del dataset voorhs/conll2003-corrupted. Lo publica el usuario MishanyaP en Hugging Face como parte de un ejercicio académico (la nomenclatura "dl2-hw2" sugiere una segunda tarea de un curso de deep learning). El modelo resuelve la tarea estándar de token classification: identificar y etiquetar entidades como personas, organizaciones, localizaciones y miscelánea en texto en inglés.

Arquitecturalmente es un encoder tipo BERT de tamano pequeno, con 33.215.625 parametros, heredado de la familia BGE-small. No es un modelo generativo ni un MoE: se trata de un clasificador por token que produce una etiqueta BIO/IOB por cada token de entrada. Su relevancia es limitada, ya que se trata de una entrega de curso con cero descargas y cero likes, sin licencia declarada, y con una model card muy escueta.

La unica metrica publicada es la evaluacion sobre un subconjunto de validacion, con un F1 de 0,9187, precision de 0,9082, recall de 0,9295 y accuracy de 0,9818. No hay informacion sobre contexto, cuantizaciones ni licencia, por lo que su uso en produccion queda condicionado a verificar esos extremos de forma manual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder tipo BERT (base: BAAI/bge-small-en-v1.5, 12 capas, hidden 384) |
| Parametros totales | 33.215.625 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (heredada de BGE-small-en-v1.5; no confirmada explicitamente en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea | token-classification (NER) |
| Dataset de fine-tuning | voorhs/conll2003-corrupted (split de entrenamiento) |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo parte de BAAI/bge-small-en-v1.5, un encoder bidireccional basado en la arquitectura BERT (12 capas de transformer, dimension oculta 384, 6 cabezas de atencion y vocabulario de 30.522 tokens). Sobre esa base se anade una cabeza de clasificacion por token para la tarea de NER. No se trata de un transformer decoder ni de una arquitectura hibrida SSM: es un clasificador de secuencias puro que emite una etiqueta por token.

Segun la model card, el fine-tuning se realizo sobre el split de entrenamiento etiquetado del dataset voorhs/conll2003-corrupted, con seleccion de hiperparametros sobre un subconjunto de validacion y sin usar el split de test. Se entrenaron 10.000 muestras con un learning rate de 5,37e-05 y batch size de 4 por dispositivo. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion. No hay informacion sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset ni innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, etc.).

## Capacidades

- Reconocimiento de entidades nombradas en ingles: extrae personas (PER), organizaciones (ORG), localizaciones (LOC) y miscelanea (MISC) siguiendo el esquema del corpus CoNLL-2003.
- Clasificacion por token (token classification): asigna una etiqueta a cada token de la secuencia de entrada.
- Procesamiento de texto corto a medio: al derivar de BGE-small, el limite practico es de 512 tokens por secuencia.
- No soporta generacion de texto: es un encoder discriminativo, no un modelo generativo.
- No dispone de tool calling ni function calling.
- No esta disenado para agentes ni razonamiento multi-paso.
- Capacidad multilingue: no disponible; declarado unicamente para ingles.
- No incorpora vision, audio ni modo "thinking".

## Casos de uso

- Extraccion de entidades en pipelines de informacion: el modelo etiqueta personas, organizaciones y localizaciones en texto ingles, lo que permite alimentar bases de datos estructuradas a partir de documentos no estructurados.
- Anonimizacion de datos personales: detectar nombres de personas y organizaciones antes de almacenar o compartir texto, como paso previo a un enmascaramiento.
- Preprocesado para busqueda y enriquecimiento semantico: indexar documentos anotando entidades para mejorar motores de busqueda internos.
- Analisis de noticias y prensa: extraer menciones de empresas, paises y figuras publicas de articulos en ingles para estudios de tendencias o monitorizacion de medios.
- Etiquetado asistido en anotacion de corpus: usar el modelo como preanotador en herramientas tipo Label Studio para reducir el trabajo manual de anotadores humanos.
- Clasificacion de tickets o correos de soporte: identificar organizaciones, productos y ubicaciones mencionados para enrutar incidencias automaticamente.
- Investigacion academica y docencia: servir como punto de partida o baseline en tareas de NER dentro de cursos o experimentos reproducibles.

## Benchmarks y rendimiento

Los unicos datos publicados son las metricas de evaluacion incluidas en la model card, obtenidas sobre un subconjunto de validacion (no sobre el test split). No se especifica el conjunto exacto de evaluacion mas alla de esa descripcion.

| Metrica | Valor |
|---|---|
| Loss | 0,0793 |
| Precision | 0,9082 |
| Recall | 0,9295 |
| F1 | 0,9187 |
| Accuracy | 0,9818 |

Datos de ejecucion reportados en la model card:

| Metrica de ejecucion | Valor |
|---|---|
| Runtime | 2,5699 s |
| Samples per second | 1264,646 |
| Steps per second | 39,69 |
| Tamano de entrenamiento | 10.000 muestras |
| Tiempo de entrenamiento | 403,24 s |

No se han publicado comparaciones con otros modelos (MMLU, HumanEval, GLUE, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (33,2 M de parametros): aproximadamente 133 MB en FP32, 66 MB en FP16/BF16 y 33 MB en INT8.
- GPU recomendadas: cualquier GPU, incluso las mas modestas, es suficiente. No requiere A100, H100 ni siquiera una RTX 4090; una GTX 1050 o una GPU integrada moderna pueden ejecutarlo.
- Cabe holgadamente en cualquier GPU de consumo e incluso en CPU: el modelo se puede ejecutar en CPU con latencias de milisegundos por secuencia corta.
- Opciones de despliegue: transformers (pipeline de token-classification), ONNX Runtime, TorchScript. El soporte en vLLM, TGI, llama.cpp u Ollama no esta documentado para este modelo en la informacion disponible; al ser un encoder de clasificacion, las herramientas orientadas a generacion no son el encaje natural.
- Latencia y throughput: la model card reporta 1264,6 muestras por segundo y 39,69 pasos por segundo en el entorno de evaluacion descrito, si bien no se detalla el hardware empleado.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible. A continuacion se situa el modelo respecto a su base y a la categoria de NER en ingles, indicando los campos no disponibles.

| Modelo | Parametros | Contexto | Tarea | Licencia | Datos de benchmark |
|---|---|---|---|---|---|
| MishanyaP/dl2-hw2-ner | 33,2 M | 512 tokens (heredado) | NER (CoNLL-2003) | no disponible | F1 0,9187 (validacion) |
| BAAI/bge-small-en-v1.5 | 33,2 M | 512 tokens | Embeddings / retrieval | MIT (segun el modelo base) | no disponible aqui |
| Otros modelos NER en ingles (p. ej. bert-base-NER) | no disponible | no disponible | NER | no disponible | no disponible |

No se han publicado comparativas directas con alternativas en la informacion disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se documenta ninguna evaluacion de sesgo ni de equidad.
- Riesgo de alucinacion: al ser un modelo discriminativo (clasificacion por token), no genera texto libre, por lo que el riesgo de alucinacion en el sentido generativo no aplica. Si puede producir falsos positivos o falsos negativos en la deteccion de entidades.
- Limitacion de idioma: el modelo solo esta declarado para ingles; su uso en castellano u otros idiomas no esta soportado ni validado.
- Limitacion de contexto: la ventana de 512 tokens (heredada del modelo base) impide procesar documentos largos en una sola pasada; seria necesario trocear el texto.
- Licencia: no disponible. La ausencia de licencia declarada implica incertidumbre legal para uso comercial; conviene contactar con el autor o abstenerse de usarlo en produccion hasta aclararlo.
- Caveat de validacion: las metricas publicadas corresponden a un subconjunto de validacion y no al test split; no hay una evaluacion independiente.
- Dataset de entrenamiento: se usa voorhs/conll2003-corrupted, un corpus etiquetado que puede diferir del dominio objetivo real, con la consiguiente perdida de rendimiento fuera de distribucion.
- Madurez: cero descargas y cero likes, model card minima y sin documentacion de despliegue; no es un artefacto listo para produccion sin verificacion adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MishanyaP/dl2-hw2-ner
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Dataset de fine-tuning: https://huggingface.co/datasets/voorhs/conll2003-corrupted

Nota: la busqueda web asociada a esta ficha no devolvio enlaces tecnicos relevantes sobre el modelo; los resultados obtenidos no guardan relacion con la materia y se han descartado.
