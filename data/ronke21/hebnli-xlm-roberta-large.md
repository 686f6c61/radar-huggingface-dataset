# ronke21/hebnli-xlm-roberta-large

## Resumen

`ronke21/hebnli-xlm-roberta-large` es un clasificador de inferencia de lenguaje natural (NLI) de tres clases (implicacion, neutral, contradiccion) obtenido por ajuste fino de `FacebookAI/xlm-roberta-large` sobre el corpus HebNLI. Lo desarrolla Ron Keinan en el contexto del proyecto HeRE (Hebrew Relation Extraction), un benchmark de extraccion de relaciones en hebreo presentado en AACL/IJCNLP 2026. El modelo resuelve un problema muy concreto: decidir si un pasaje de Wikipedia en hebreo expresa o no una relacion determinada, formulada como una tripleta de Wikidata verbalizada.

Su relevancia es doble. Por un lado, es la pieza central de la "Strategy 1" de denoising del pipeline HeRE: la probabilidad de implicacion del clasificador se usa como senal (`encoder_nli__xlmroberta`) para filtrar alineaciones ruidosas entre texto y grafo de conocimiento. Por otro, es un recurso practico para NLI en hebreo, un idioma con escasisima cobertura en tareas de inferencia y extraccion de relaciones. La arquitectura es un transformer encoder XLM-RoBERTa-large con 559,9 M de parametros, licencia MIT y pesos en safetensors.

Al ser un modelo de clasificacion y no generativo, no dispone de ventana de contexto conversacional ni de capacidades de tool calling; su entrada es un par premisa-hipotesis truncado a 250 tokens. Es, por tanto, un componente de pipeline mas que un asistente, y su valor esta en la precision de la clasificacion y en la calidad de la senal que produce para el corpus plateado de HeRE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-large) con cabeza de clasificacion de secuencias |
| Parametros totales | 559.893.507 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 250 tokens (max_length de entrenamiento e inferencia) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | hebreo (he); el modelo base XLM-RoBERTa es multilingue, pero el ajuste fino es especifico de hebreo |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de XLM-RoBERTa-large, un transformer encoder con 24 capas, atencion multi-cabeza y embeddings multilingues preentrenados sobre corpus masivos en 100 idiomas. Sobre esa base se anade una cabeza lineal de clasificacion de tres etiquetas: `היסק` (implicacion), `סתירה` (contradiccion) y `ניטרלי` (neutral). El ajuste fino se realiza con AdamW, learning rate 2e-5, batch size 64, weight decay 0.01, warm-up lineal sobre el 10 % de los pasos, longitud maxima de secuencia 250 y 8.000 pasos de entrenamiento con evaluacion cada 200 pasos. Se conserva el checkpoint con mejor macro-F1 de validacion, que resulto ser el paso 8.000. Es una unica ejecucion con semilla 42.

Los datos de entrenamiento son el corpus HebNLI, derivado del benchmark HeRE. En la formulacion de la Strategy 1, la premisa es un pasaje de Wikipedia en hebreo y la hipotesis es una tripleta de Wikidata verbalizada; la probabilidad de implicacion decide si el pasaje expresa la relacion. No se documenta en la informacion disponible el numero exacto de pares de entrenamiento ni la composicion detallada del dataset, aunque el paper de HeRE describe el proceso de construccion y denoising del corpus plateado. No se menciona uso de RLHF ni DPO, algo esperable en un encoder clasificador.

## Capacidades

- Clasificacion NLI de tres clases (implicacion, neutral, contradiccion) sobre pares premisa-hipotesis en hebreo.
- Deteccion de si un pasaje textual expresa una relacion formulada como tripleta verbalizada, uso central en el pipeline HeRE.
- Generacion de una senal de probabilidad calibrada (`encoder_nli__xlmroberta`) utilizable como score de confianza para filtrado de datos.
- Procesamiento de pares con truncamiento a 250 tokens.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso; es un clasificador de una sola pasada.
- No dispone de modo thinking, vision ni audio.
- Cobertura multilingue limitada al hebreo en la practica, pese al preentrenamiento multilingue de la base.

## Casos de uso

- Filtrado de alineaciones texto-grafo de conocimiento: dado un pasaje de Wikipedia en hebreo y una tripleta de Wikidata verbalizada, el modelo devuelve la probabilidad de implicacion y permite descartar alineaciones erroneas antes de incorporarlas a un KG. Es exactamente el uso para el que fue entrenado en HeRE.
- Construccion de corpus plateados para extraccion de relaciones: la senal del clasificador se aplica sobre el corpus completo para etiquetar pares como positivos o negativos con un umbral, generando datos de entrenamiento a escala sin anotacion manual.
- Evaluacion de sistemas de extraccion de relaciones en hebreo: el modelo sirve como juez NLI para verificar si la relacion extraida por otro sistema esta respaldada por el texto fuente.
- Deteccion de contradicciones en bases documentales en hebreo: comparar afirmaciones contra pasajes de referencia para marcar inconsistencias, por ejemplo en documentacion legal o administrativa.
- Verificacion de hechos sobre textos enciclopedicos: comprobar si un pasaje respalda, contradice o es neutral respecto a una afirmacion estructurada, con la salvedad de la ventana de 250 tokens.
- Enriquecimiento de pipelines de NLP en hebreo: como componente de ranking o reranking en sistemas de retrieval aumentado, donde la relevancia se reformula como implicacion entre consulta y pasaje.
- Anotacion asistida de datasets NLI en hebreo: preetiquetar pares para revision humana, reduciendo el coste de construccion de recursos de inferencia en un idioma con poca cobertura.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| HebNLI dev macro-F1 | 0,849 |
| HebNLI test macro-F1 | 0,876 |
| HeRE gold validation F1 (Strategy 1, hipotesis por plantilla) | 0,756 |

Los resultados corresponden a la model card del autor. No se proporcionan comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,2 GB solo para pesos, mas activaciones; en la practica cabe en GPUs consumer de 8 GB o menos.
- En fp16: alrededor de 1,1 GB de pesos, con margen amplio en cualquier GPU moderna.
- GPU recomendadas: cualquier GPU consumer reciente (RTX 3060, RTX 4060, RTX 4090) es suficiente; para alto throughput en servidor, A100 o H100 aportan margen pero no son necesarias.
- Cabe en GPU consumer sin problemas; tambien puede ejecutarse en CPU para volumentes moderados.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification`, `text-embeddings-inference` no aplica, y `vLLM`/`TGI` no estan orientados a clasificadores encoder de este tipo; el despliegue natural es un servicio de inferencia con `transformers` o `ONNX Runtime`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ronke21/hebnli-xlm-roberta-large | 559,9 M | 250 tokens | NLI hebreo (3 clases) | MIT | Hugging Face |
| FacebookAI/xlm-roberta-large | 559,9 M | 512 tokens | Modelo base multilingue | MIT | Hugging Face |
| Modelos NLI multilingues genericos (p. ej. basados en mDeBERTa) | no disponible | no disponible | NLI multilingue | variable | Hugging Face |

La comparacion directa con alternativas especificas de NLI en hebreo no esta disponible en la informacion proporcionada. Frente al modelo base, la diferencia clave es el ajuste fino sobre HebNLI y la cabeza de tres clases; frente a clasificadores multilingues genericos, la ventaja esperable es el dominio del hebreo y la formulacion especifica de tripletas de Wikidata, aunque no se aportan numeros comparativos.

## Limitaciones y advertencias

- Modelo especializado en hebreo: su rendimiento fuera de ese idioma no esta validado y probablemente sea deficiente.
- Ventana de 250 tokens: premisas mas largas se truncan, lo que puede eliminar evidencia necesaria para la clasificacion.
- Formulacion de hipotesis orientada a tripletas verbalizadas de Wikidata; su comportamiento con hipotesis en lenguaje natural libre no esta documentado.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de falsos positivos y falsos negativos en la clasificacion, especialmente en relaciones poco representadas.
- Sesgos: no documentados en la informacion disponible; al entrenarse sobre Wikipedia en hebreo y Wikidata, hereda los sesgos de cobertura y sesgo de esos recursos.
- Licencia MIT, que permite uso comercial sin restricciones adicionales, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento.
- Un unico entrenamiento con semilla 42: no hay estimacion de varianza entre ejecuciones.
- Sin datos publicados de latencia, throughput ni comportamiento en produccion a gran escala.
- No es un modelo generativo: no debe usarse para tareas de generacion de texto, codigo o razonamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ronke21/hebnli-xlm-roberta-large
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- Dataset HeRE: https://huggingface.co/datasets/ronke21/HeRE
- Codigo HeRE: https://github.com/Ronke21/HeRE
- Repositorio HebNLI: https://github.com/NNLP-IL/HebNLI
- Paper HeRE (AACL 2026): https://aclanthology.org/2026.aacl-long.237/
