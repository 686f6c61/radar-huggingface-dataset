# maurorisonho/distilbert-sentiment-nlp-course

## Resumen

DistilBERT fine-tuned para analisis de sentimiento es un checkpoint de clasificacion de texto binaria (positivo/negativo) desarrollado por el usuario maurorisonho como parte del curso de NLP y LLM de Hugging Face. Se trata de un ajuste fino de DistilBERT Base (uncased) sobre el dataset Stanford Sentiment Treebank (SST-2), con 66.955.010 parametros y un peso aproximado de 0,27 GB en precision FP32. El autor reporta una accuracy del 91,3 % sobre SST-2, aunque no detalla hiperparametros, semilla ni particion de evaluacion.

El modelo no es un LLM generativo: es un encoder de clasificacion de secuencias de 6 capas con una cabeza de dos etiquetas. Su relevancia practica esta en el coste: cabe en CPU, se ejecuta con latencias de milisegundos y sirve como componente barato de clasificacion dentro de pipelines mayores (moderacion, enrutado de tickets, etiquetado masivo de corpus).

Se publica bajo licencia Apache 2.0 con pesos en safetensors, pero con 0 descargas y 0 likes en el momento de la consulta, y sin artefactos cuantizados ni documentacion de entrenamiento mas alla de la model card. Debe tratarse, por tanto, como un checkpoint didactico o como punto de partida para un ajuste propio, no como un modelo validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT Base uncased), 6 capas, 768 de dimension oculta, 12 cabezas de atencion, ~30522 tokens de vocabulario |
| Parametros totales | 66.955.010 |
| Parametros activos | No aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | 512 tokens (limite estandar de DistilBERT Base; la model card no lo explicita) |
| Tipos de cuantizacion | No disponible. El repositorio no publica artefactos cuantizados; es posible generar INT8 dinamico con PyTorch u ONNX Runtime fuera del repo |
| Idiomas soportados | No declarado por el autor. El dataset de ajuste (SST-2) es en ingles, por lo que el uso fiable se limita al ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,3 GB, incluye tambien configuracion de Transformers) |
| Tarea (pipeline) | text-classification (clasificacion binaria de sentimiento) |
| Dataset de ajuste | sst2 (Stanford Sentiment Treebank) |
| Framework declarado | Hugging Face Transformers y PyTorch |
| Accuracy reportada | 91,3 % segun la model card del autor |

## Arquitectura y entrenamiento

La base es DistilBERT Base uncased, un transformer encoder obtenido por destilacion de conocimiento de BERT-base (Sanh et al., 2019). Conserva la mitad de las capas del profesor (6 frente a 12), mantiene la dimension oculta de 768 y reduce el numero de parametros en torno a un 40 %, con una ganancia de velocidad de inferencia cercana al 60 % y una retencion declarada del 97 % del rendimiento en GLUE. El preentrenamiento del modelo original combino tres perdidas (destilacion sobre las salidas del profesor, masked language modeling y perdida de similitud coseno sobre los estados ocultos) sobre los mismos corpus en ingles que BERT (Wikipedia en ingles y Toronto Book Corpus). La variante "uncased" normaliza el texto a minusculas y elimina los acentos en el tokenizador.

Sobre esa base, este repositorio aplica un ajuste fino supervisado de clasificacion de secuencias con dos etiquetas sobre SST-2, siguiendo el flujo habitual del curso de Hugging Face. La model card no documenta el numero de epocas, el learning rate, el tamano de batch, la semilla ni si hubo busqueda de hiperparametros; tampoco indica si la accuracy de 91,3 % corresponde al split de validacion oficial de SST-2 o a una particion propia. No se declara RLHF, DPO ni ninguna tecnica de alineacion, que no aplican a un modelo discriminativo de este tipo.

## Capacidades

- Clasificacion binaria de sentimiento en ingles: devuelve etiquetas POSITIVE / NEGATIVE con una probabilidad asociada por secuencia.
- Procesamiento de secuencias de hasta 512 tokens con truncado automatico del tokenizador; no gestiona contexto largo de forma nativa.
- Inferencia por lotes (batching), apta para etiquetar grandes volumenes de texto con coste bajo en CPU.
- Extraccion de representaciones: los estados ocultos y el embedding de la etiqueta [CLS] pueden reutilizarse como features para clustering, similitud o entrenamiento de clasificadores adicionales.
- Ajuste fino posterior sobre dominios propios (por ejemplo, resenas de producto o tickets) partiendo de estos pesos.
- No soporta generacion de texto, razonamiento multi-paso, tool calling ni function calling.
- No soporta agentes, planificacion ni uso de herramientas externas.
- No tiene capacidades multilingues declaradas ni vision, audio o modo de razonamiento explicito (thinking).

## Casos de uso

- Moderacion y priorizacion de resenas: clasificar en tiempo real el tono de resenas de producto o contenido generado por usuarios, enviando al equipo humano solo los casos negativos. El modelo cabe en CPU y permite procesar lotes de cientos de textos por segundo en un servidor convencional.
- Monitorizacion de marca en redes sociales: etiquetar menciones como positivas o negativas y agregar el resultado por dia o por producto. Es adecuado cuando el volumen es alto y no se necesita granularidad mas alla de la polaridad.
- Enrutado de tickets de soporte: usar la etiqueta de sentimiento como una de las senales de triaje para derivar tickets negativos a agentes senior. Funciona como clasificador auxiliar dentro de un pipeline mayor, no como sistema de decision autonomo.
- Etiquetado masivo de corpus para entrenamiento: preanotar datasets de decenas de millones de frases antes de una revision humana, reduciendo el coste frente a un LLM generativo con API de pago.
- Filtrado en pipelines RAG: descartar fragmentos o documentos con tono negativo cuando la aplicacion solo requiere material neutral o positivo (por ejemplo, bases de conocimiento de ayuda al cliente).
- Extraccion de embeddings para analitica: generar representaciones de resenas para clustering de temas, deteccion de duplicados o reduccion de dimensionalidad antes de un analisis exploratorio.
- Base para un ajuste especifico de dominio: reentrenar la cabeza de clasificacion con datos propios (finanzas, salud, soporte tecnico) aprovechando el coste bajo de iteracion de un modelo de 66M de parametros.
- Material docente y reproduccion de experiments: sirve como ejemplo minimo y reproducible del flujo de ajuste fino con Transformers, util en cursos y talleres.

## Benchmarks y rendimiento

La unica metrica publicada en la informacion disponible es la accuracy reportada por el autor sobre SST-2.

| Benchmark | Metrica | Resultado | Fuente |
|---|---|---|---|
| SST-2 | Accuracy | 91,3 % | Model card del autor (no verificada de forma independiente) |
| GLUE (resto de tareas) | No disponible | No disponible | No publicado |
| MMLU, GSM8K, HumanEval | No aplica / no disponible | No disponible | El modelo no es generativo ni razona |

No se han publicado resultados de benchmarks adicionales en la informacion disponible, ni desglose por clase, matriz de confusion o intervalo de confianza.

## Requisitos de hardware

- VRAM en FP32: aproximadamente 270 MB solo para los pesos, mas activaciones; por debajo de 1 GB en la practica.
- VRAM en FP16: aproximadamente 135 MB de pesos. En INT8 dinamico, alrededor de 67 MB.
- Cabe en cualquier GPU de consumo, incluidas GTX 1050 Ti, GTX 1650, RTX 3050 o superiores; tambien en iGPU con suficiente memoria compartida.
- Inferencia viable en CPU sin GPU: es el escenario de despliegue natural para este tamano de modelo.
- Opciones de despliegue: pipeline de Transformers, TorchScript, ONNX Runtime, Hugging Face Text Embeddings Inference (TEI) para embeddings y clasificacion, y servidores propios con FastAPI o BentoML. vLLM y TGI estan orientados a modelos generativos y no aportan ventaja aqui. No se publican pesos GGUF, por lo que llama.cpp u Ollama no son la via natural para este checkpoint.
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor. A modo de referencia de orden de magnitud, un encoder de 6 capas y 768 de dimension suele quedar en el rango de milisegundos por lote pequeno en GPU moderna, pero este dato no ha sido verificado para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| maurorisonho/distilbert-sentiment-nlp-course | 66.955.010 | 512 | Sentimiento binario (SST-2) | Apache 2.0 | 0 descargas, 0 likes | 91,3 % en SST-2 (reportado por el autor, no verificado) |
| distilbert-base-uncased-finetuned-sst-2-english | ~66 M | 512 | Sentimiento binario (SST-2) | Apache 2.0 | Checkpoint oficial de Hugging Face, ampliamente usado | No disponible en la informacion proporcionada |
| bert-base-uncased ajustado en SST-2 | ~110 M | 512 | Sentimiento binario (SST-2) | Apache 2.0 | Checkpoint oficial disponible | No disponible en la informacion proporcionada |
| roberta-base ajustado en SST-2 | ~125 M | 512 | Sentimiento binario (SST-2) | MIT | Checkpoint oficial disponible | No disponible en la informacion proporcionada |

La diferencia principal frente a las alternativas no esta en la arquitectura, sino en el nivel de validacion: este checkpoint es un ejercicio de curso sin descargas ni evaluacion independiente, mientras que los checkpoints oficiales de Hugging Face cuentan con uso extendido y mantenimiento. Para produccion, comparar contra `distilbert-base-uncased-finetuned-sst-2-english` es el punto de partida mas razonable por identidad de arquitectura y tarea.

## Limitaciones y advertencias

- Clasificacion estrictamente binaria: no existe clase neutral. SST-2 elimina las muestras neutras, por lo que el modelo forzara una polaridad incluso en textos ambiguos o meramente informativos.
- Sesgo de dominio: el ajuste se hizo sobre resenas de peliculas en ingles. El rendimiento puede degradarse de forma notable en otros dominios (clinico, legal, financiero) o en registros muy informales.
- Idioma: el autor no declara idiomas soportados y el dataset de ajuste es en ingles. El uso en castellano u otros idiomas no esta validado y probablemente produzca resultados poco fiables.
- Limite de 512 tokens: los textos mas largos se truncan, con perdida de informacion que puede invertir la prediccion si la parte relevante queda fuera de la ventana.
- Riesgo de error con alta confianza: al ser un clasificador, puede asignar probabilidades muy altas a etiquetas incorrectas. Es necesario calibrar (por ejemplo, con temperature scaling) y fijar umbrales de abandono antes de automatizar decisiones.
- Sesgos heredados: el modelo base se entreno sobre Wikipedia y BookCorpus, con los sesgos demograficos, de genero y culturales documentados en BERT. Estos sesgos pueden correlacionar con el sentimiento predicho segun el colectivo mencionado en el texto.
- Sin validacion externa: 0 descargas y 0 likes implican que el checkpoint no ha sido reproducido ni auditado por terceros. La accuracy de 91,3 % es una afirmacion del autor sin metodologia publicada.
- Uso comercial: los pesos estan bajo Apache 2.0, que permite uso comercial. Conviene revisar por separado la licencia del material del curso de Hugging Face y la de los datos SST-2 si se redistribuyen derivados.
- No apto como sistema de decision critica: no debe usarse como unico criterio en creditos, seleccion de personal, diagnostico clinico o moderacion con consecuencias legales.
- Ausencia de artefactos listos para produccion: no hay versiones cuantizadas, ONNX, TensorRT ni GGUF publicadas; cualquier optimizacion debe hacerse localmente y validarse de nuevo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/maurorisonho/distilbert-sentiment-nlp-course
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
- Dataset SST-2 (Socher et al., 2013): https://nlp.stanford.edu/sentiment/
- Curso de NLP y LLM de Hugging Face: https://huggingface.co/learn/nlp-course
- Documentacion de Transformers: https://huggingface.co/docs/transformers
- Checkpoint oficial de referencia: https://huggingface.co/distilbert-base-uncased-finetuned-sst-2-english

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; unicamente paginas de ayuda de Google sin relacion con el checkpoint, por lo que no se han podido incorporar enlaces adicionales procedentes de esa busqueda.
