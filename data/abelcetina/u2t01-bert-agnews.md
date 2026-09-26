# abelcetina/u2t01-bert-agnews

## Resumen

`abelcetina/u2t01-bert-agnews` es un modelo de clasificación de texto en ingles obtenido por ajuste fino completo (*full fine-tuning*) de `google-bert/bert-base-uncased` sobre el corpus AG News. Se trata de un encoder BERT base (12 capas, 109.485.316 parámetros, incluida la cabeza lineal de clasificación) adaptado a una tarea de clasificación temática de cuatro clases: World, Sports, Business y Sci/Tech. No es un modelo generativo: emite una etiqueta entre cuatro para una entrada corta de texto.

El modelo forma parte de una práctica universitaria (*U2T01: Adapting BERT for NLP tasks*) cuyo objetivo es comparar, con un tamaño de datos fijo, distintos métodos de adaptación de BERT (feature-based frente a fine-tuning). Para ello se entrenó únicamente con 19.000 ejemplos del split de entrenamiento de AG News, no con las 120.000 muestras completas, de modo que su precisión absoluta queda por debajo del estado del arte publicado en este benchmark. Los autores lo declaran explícitamente como modelo de uso académico y no validado para decisiones sobre personas.

Su relevancia práctica es la de un clasificador ligero, rápido y barato de desplegar: cabe en cualquier GPU de consumo e incluso en CPU, con una precisión declarada de 0,9190 en validación y 0,9293 en test. Su ventana efectiva de trabajo son 128 tokens, suficientes para titulares y entradillas de noticias en inglés, que es exactamente el dominio sobre el que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base, 12 capas) con cabeza lineal de clasificación sobre la representación pooled |
| Parametros totales | 109.485.316 (100 % entrenables durante el ajuste) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128 tokens de longitud máxima de secuencia en entrenamiento; truncamiento aplicado también en inferencia |
| Tipos de cuantizacion | No disponible (la model card no documenta cuantizaciones publicadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería `transformers`) |
| Tarea | Clasificación de texto (text-classification), 4 clases |
| Modelo base | google-bert/bert-base-uncased |
| Dataset de entrenamiento | fancyzhx/ag_news |
| Etiquetas | World, Sports, Business, Sci/Tech |

## Arquitectura y entrenamiento

La arquitectura es la de `bert-base-uncased`: un encoder Transformer bidireccional de 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, con vocabulario WordPiece en minúsculas. Sobre la representación pooled del token `[CLS]` se añade una cabeza lineal de 4 salidas. El método de adaptación es `--method full`: se descongeló la totalidad del encoder (embeddings y las 12 capas) junto con la cabeza, sin ningún componente congelado. La cabeza se inicializó aleatoriamente y se entrenó con una tasa de aprendizaje mayor (0,001) que el cuerpo del modelo (0,00002), con *weight decay* 0,01.

El entrenamiento usó 19.000 ejemplos del split de entrenamiento de AG News, 2 épocas, tamaño de lote 32, longitud máxima de secuencia 128 y semilla 42. El coste fue de 1.188 pasos, 213,8 segundos (0,18 s por paso) sobre una única Tesla T4 con CUDA 12.8, con un pico de memoria GPU de 3.104,5 MB. No se documenta ningún tipo de RLHF, DPO ni decodificación especulativa: es un ajuste supervisado estándar con entropía cruzada sobre las cuatro clases. La innovación del trabajo no está en la arquitectura, sino en la comparación controlada entre métodos de adaptación a tamaño de datos fijo.

## Capacidades

- Clasificación de texto en ingles en cuatro categorias tematicas: World, Sports, Business y Sci/Tech.
- Etiquetado de titulares y frases de entradilla de agencias de noticias, con una sola etiqueta por entrada.
- Extraccion de la representacion pooled del encoder, reutilizable como embedding de frase de 768 dimensiones para tareas posteriores, aunque no fue ese el objetivo del entrenamiento.
- Compatibilidad con `text-embeddings-inference` y con endpoints gestionados (etiquetas `endpoints_compatible` y `region:us` en el Hub).
- Integracion directa con la libreria `transformers` mediante `pipeline("text-classification", ...)`.
- No soporta tool calling, function calling ni uso como agente: es un clasificador discriminativo, no genera texto.
- No dispone de capacidades multilingues, de vision, de audio ni de modo de razonamiento explicito.
- No dispone de modo *thinking* ni de salida de cadena de pensamiento.

## Casos de uso

- Enrutado de contenidos en portales de noticias: clasificar titulares y entradillas en cuatro secciones para asignar automaticamente la seccion o el canal de distribucion, aprovechando que el dominio de entrenamiento son precisamente titulares y frases de entradilla en ingles.
- Monitorizacion de medios y clipping de prensa: procesar flujos de agencias en ingles y separar piezas de economia, deportes, ciencia/tecnologia y actualidad internacional antes del analisis humano, con un coste de inferencia muy bajo por documento.
- Curacion y limpieza de corpus: etiquetar o filtrar grandes colecciones de texto en ingles por tematica antes de usarlas como dataset de entrenamiento o de evaluacion en otros proyectos.
- Preprocesado en pipelines de RAG: asignar una etiqueta tematica a cada documento o fragmento para habilitar recuperacion filtrada por tema, reduciendo el espacio de busqueda antes de la fase de similitud vectorial.
- Sistemas de recomendacion de contenido informativo: usar la etiqueta tematica como feature para ordenar o agrupar articulos y sugerir lecturas relacionadas.
- Prototipado y docencia en NLP: modelo de referencia para reproducir experimentos de ajuste fino frente a *feature extraction* sobre un benchmark academico, con requisitos de hardware muy bajos.
- Analitica de tendencias editoriales: agregar las etiquetas producidas sobre un corpus historico de noticias en ingles para medir la distribucion tematica por periodo o por medio.
- Clasificacion por lotes en CPU economicas para backfills de baja prioridad, dado el tamano reducido del modelo (aproximadamente 438 MB en FP32).

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card. La evaluacion se realizo sobre el split `validation` y, adicionalmente, sobre el split de test.

| Metrica | Validation | Test |
|---|---|---|
| Loss | 0,2608 | 0,2277 |
| Accuracy | 0,9190 | 0,9293 |
| Macro F1 | 0,9194 | 0,9293 |

La cifra de cabecera del autor es accuracy = 0,919 (macro F1 = 0,9194) sobre validacion, obtenida con una unica semilla (42). No se dispone de intervalos de confianza ni de estimacion de varianza. La model card remite a `report/results_tables.md` del repositorio companero para la comparacion con otros metodos de adaptacion, pero esos valores no estan incluidos en la informacion disponible; el propio autor advierte que diferencias inferiores a un punto porcentual deben interpretarse como ruido, no como mejora. No se han publicado resultados de MMLU, HumanEval ni GSM8K, que no aplican a un clasificador de este tipo.

## Requisitos de hardware

- Pesos del modelo: aproximadamente 438 MB en FP32 y 219 MB en FP16/BF16 (109,5 millones de parametros).
- VRAM estimada para inferencia: por debajo de 1 GB en FP16 con lotes pequenos; el pico de memoria documentado durante el entrenamiento con lote 32 y secuencia 128 fue de 3.104,5 MB en una Tesla T4.
- Cabe en cualquier GPU de consumo: GTX 1050 Ti, GTX 1650, RTX 3060, RTX 4090, e incluso en CPU con latencias aceptables para lotes pequenos.
- GPU de datacenter equivalentes o superiores a la usada en entrenamiento (Tesla T4, A100, H100) solo son necesarias si se reentrena o se ajusta de nuevo.
- Opciones de despliegue: `transformers` (Pipeline), `text-embeddings-inference` para servir como endpoint compatible, inferencia en CPU, y despliegue en endpoints gestionados del Hub. No se documentan recetas especificas para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El unico dato de velocidad publicado es de entrenamiento (0,18 s por paso, 1.188 pasos, 213,8 s en total sobre una T4).

## Comparativa con modelos similares

La comparacion con los otros metodos de adaptacion evaluados en la practica (feature-based y variantes) esta referenciada en el repositorio companero del autor, pero sus cifras no forman parte de la informacion disponible. La tabla siguiente recoge unicamente caracteristicas estructurales de checkpoints base de referencia; no implica comparacion de rendimiento en AG News.

| Modelo | Parametros | Contexto maximo | Licencia | Disponibilidad | Rendimiento en AG News |
|---|---|---|---|---|---|
| abelcetina/u2t01-bert-agnews | 109.485.316 | 128 tokens en entrenamiento | Apache 2.0 | HuggingFace Hub | 0,9190 accuracy (validacion) / 0,9293 (test) |
| google-bert/bert-base-uncased | 109.482.240 (sin cabeza de 4 clases) | 512 posiciones en el encoder | Apache 2.0 | HuggingFace Hub | No disponible (checkpoint sin ajustar) |
| Otros metodos de adaptacion U2T01 | No disponible | No disponible | No disponible | Repositorio companero del autor | No disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Sesgo de dominio: AG News es un corpus de teletipo de mediados de la decada de 2000; sus entidades, eventos y estilo editorial corresponden a esa epoca y a la prensa en ingles. El modelo hereda ese sesgo.
- Sesgo social heredado: `bert-base-uncased` fue preentrenado con BookCorpus y Wikipedia en ingles, corpus que codifican estereotipos de genero, etnia y ocupacion. La model card indica que nada en este ajuste mitiga ni mide esos sesgos.
- Alucinacion: al ser un clasificador discriminativo no genera texto, pero puede asignar una etiqueta con alta confianza a entradas fuera de distribucion. La model card advierte de que el modelo no debe usarse para extraer hechos sobre el mundo.
- Semilla unica: todos los numeros proceden de una unica ejecucion con semilla 42, sin estimacion de varianza. Diferencias de aproximadamente un punto porcentual deben leerse como ruido.
- Submuestreo: el entrenamiento uso 19.000 ejemplos, no los 120.000 del split completo, por lo que la precision absoluta queda por debajo del estado del arte publicado.
- Truncamiento: las entradas se truncaron a 128 tokens; en inferencia, el texto que exceda esa longitud pierde la cola y puede alterar la etiqueta.
- Cobertura de evaluacion: solo se midio un split de validacion y uno de test. No hay evaluacion de robustez, adversarial, fuera de dominio ni de equidad.
- Idiomas: solo ingles. El rendimiento en otros idiomas no esta caracterizado y se espera una caida fuerte.
- Uso comercial: la licencia del modelo es Apache 2.0, pero la model card advierte de que el corpus AG News subyacente se distribuye para uso libre en investigacion no comercial (terminos de Zhang, Zhao y LeCun, 2015). La redistribucion comercial requiere verificar esa licencia de datos.
- Uso fuera de alcance declarado por el autor: cualquier decision que afecte a una persona (contratacion, moderacion con consecuencias, credito, decisiones legales o medicas).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abelcetina/u2t01-bert-agnews
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset AG News: https://huggingface.co/datasets/fancyzhx/ag_news
- Paper de BERT (arXiv:1810.04805): https://arxiv.org/abs/1810.04805
- Paper de Zhang, Zhao y LeCun (arXiv:1509.01626): https://arxiv.org/abs/1509.01626
- Repositorio companero con el codigo de entrenamiento y `report/results_tables.md`: no disponible en la informacion proporcionada (referenciado en la model card, sin URL)
- Otros enlaces relevantes: no disponible (los resultados de busqueda web no contienen informacion relacionada con este modelo)
