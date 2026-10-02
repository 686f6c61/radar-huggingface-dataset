# Brianop/hw1-hc3-detector

## Resumen

hw1-hc3-detector es un clasificador binario de texto que distingue entre texto escrito por humanos (etiqueta 0) y texto generado por ChatGPT (etiqueta 1). Lo publica el usuario Brianop en Hugging Face y se construye mediante fine-tuning de sentence-transformers/all-MiniLM-L6-v2 sobre el dataset HC3 English. No es un modelo generativo: su salida es una etiqueta de clasificación, no texto.

El interés del modelo es su rendimiento declarado en la tarea concreta de detección de texto sintético. La model card reporta una exactitud del 99,12 % tras el fine-tuning, frente al 84,49 % de una línea base con embeddings congelados, sobre un conjunto de evaluación de 4.668 ejemplos. El repositorio ocupa 0,1 GB y contiene 22.713.986 parámetros en formato safetensors, un tamaño que permite inferencia en CPU.

Se trata de un artefacto académico (el nombre "hw1" sugiere una primera práctica de asignatura) con muy poca tracción: 3 descargas y 0 likes en el momento de la consulta. Su relevancia práctica es limitada y muy condicionada por la ausencia de licencia declarada y por el hecho de estar entrenado sobre un único corpus y una única fuente de texto sintético.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT; MiniLM-L6 (6 capas, 384 dimensiones ocultas, 12 cabezas de atencion, segun el modelo base declarado) con cabeza de clasificacion binaria |
| Parametros totales | 22.713.986 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 tokens (longitud maxima de secuencia usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors sin cuantizacion declarada) |
| Idiomas soportados | no disponible en la model card; el entrenamiento usa exclusivamente HC3 English (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea | Clasificacion de secuencias (text classification), binaria |
| Etiquetas | 0 = humano, 1 = ChatGPT |
| Modelo base | sentence-transformers/all-MiniLM-L6-v2 |
| Dataset de entrenamiento | HC3 English |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 3 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base declarado, all-MiniLM-L6-v2: un transformer encoder de 6 capas con 384 dimensiones ocultas y 12 cabezas de atencion, con normalizacion de capas y embeddings posicionales absolutos. Sobre ese encoder se anade una cabeza de clasificacion para dos clases. El recuento real de parametros publicado en safetensors (22.713.986) es coherente con el tamano conocido de MiniLM-L6, lo que confirma que no se han anadido capas adicionales de gran tamano.

El entrenamiento se realizo en dos fases sobre HC3 English: cinco epocas con tasa de aprendizaje 2e-5, seguidas de cinco epocas adicionales con tasa de aprendizaje 1e-5, con tamano de lote 32 y longitud maxima de secuencia 256. La model card no documenta el split exacto de entrenamiento/validacion/test, ni el numero total de tokens vistos, ni la composicion por dominio del corpus. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un clasificador y no en un modelo generativo. Tampoco se describe ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, destilacion posterior) mas alla del propio fine-tuning supervisado.

## Capacidades

- Clasificacion binaria de texto en ingles: devuelve si un fragmento es de autoria humana o generado por ChatGPT.
- Uso como extractor de embeddings mediante el modelo base subyacente, con la linea base de embeddings congelados reportada al 84,49 % de exactitud.
- Entrada de hasta 256 tokens por muestra; el texto mas largo debe truncarse o segmentarse.
- No genera texto: no hay capacidades de generacion, resumen ni traduccion.
- Sin soporte de tool calling ni function calling.
- Sin capacidades de agente, razonamiento multi-paso ni planificacion.
- Sin capacidades multimodales: no procesa imagen, audio ni video.
- Sin modo "thinking" ni cadena de pensamiento expuesta.
- Multilingue: no declarado; el entrenamiento se limita a HC3 English.

## Casos de uso

- Moderacion de foros y secciones de comentarios: el modelo puede puntuar cada mensaje entrante y marcar como sospechosos aquellos clasificados como generados por IA, siempre que el contenido sea ingles y no supere 256 tokens; seria necesario trocear textos largos.
- Limpieza de corpus para entrenamiento: al filtrar texto sintetico de un dataset recolectado de la web, el clasificador permite descartar muestras generadas por ChatGPT y reducir la contaminacion del corpus de preentrenamiento.
- Deteccion de spam y resenas falsas: en plataformas de comercio o valoraciones, se puede usar como senal adicional (no como unica prueba) para priorizar revisiones manuales de resenas que parecen generadas automaticamente.
- Control de calidad en pipelines de anotacion: si una empresa pide a anotadores humanos que redacten respuestas y sospecha que parte del trabajo se ha hecho con ChatGPT, el modelo sirve como filtro previo antes de la revision humana.
- Investigacion sobre deteccion de texto sintetico: al estar entrenado sobre HC3 English, funciona como punto de comparacion reproducible para experimentos academicos sobre detectores, con la linea base del 84,49 % como referencia.
- Integridad academica en entornos educativos: clasificar entregas en ingles y marcar las que presentan alta probabilidad de generacion por ChatGPT para su revision por el profesorado, con la cautela de que un 0,88 % de error en el conjunto de test puede crecer fuera de distribucion.
- Enriquecimiento de datasets de analitica: etiquetar automaticamente grandes volumenes de texto historico para medir la proporcion de contenido sintetico a lo largo del tiempo en un archivo documental.
- Prefiltrado en pipelines de LLM: descartar entradas sinteticas antes de introducirlas en un sistema de recuperacion o en un ciclo de entrenamiento iterativo, reduciendo el riesgo de colapso por datos autogenerados.

## Benchmarks y rendimiento

| Metrica | Linea base (embeddings congelados) | Modelo fine-tuneado |
|---|---|---|
| Exactitud en test | 84,49 % | 99,12 % |
| Errores de clasificacion | no disponible | 41 de 4.668 |
| Tasa de error implicita | 15,51 % | 0,88 % |

Conjunto de evaluacion: 4.668 ejemplos de HC3 English. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark estandar en la informacion disponible; estos benchmarks no son aplicables a un clasificador binario. Tampoco se reportan precision, recall, F1 ni matriz de confusion por clase, ni resultados desglosados por dominio del corpus HC3.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 91 MB solo para pesos (22,71 M de parametros x 4 bytes).
- VRAM estimada en fp16/bf16: aproximadamente 45 MB.
- VRAM estimada en int8: aproximadamente 23 MB, sin contar activaciones ni buffers de inference.
- El repositorio completo ocupa 0,1 GB, por lo que cabe en cualquier GPU consumer e incluso en GPU integradas con asignacion de memoria compartida.
- GPU recomendadas: no requiere GPU dedicada. Una RTX 3060, RTX 4090, T4 o incluso una iGPU son suficientes; A100 o H100 no aportan ventaja relevante para este tamano.
- Inferencia en CPU: viable y probablemente suficiente para lotes moderados, dado el tamano del modelo.
- Opciones de despliegue: Transformers (PyTorch) con AutoModelForSequenceClassification, sentence-transformers para la parte de embeddings, exportacion a ONNX Runtime u OpenVINO para CPU, TorchScript y servido mediante FastAPI o Hugging Face Inference Endpoints. No se documenta soporte en llama.cpp, Ollama, vLLM ni TGI en la informacion disponible.
- Latencia y throughput: no disponible. No se aportan medidas de tokens por segundo ni de latencia por lote.

## Comparativa con modelos similares

No se han identificado en la informacion disponible alternativas comparables con datos publicados de parametros, contexto, rendimiento o licencia. La busqueda web devuelve varias copias o variantes del mismo nombre de modelo, presumiblemente derivadas del mismo ejercicio academico, pero ninguna publica especificaciones propias:

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Brianop/hw1-hc3-detector | 22,71 M | 256 tokens | Clasificacion humano vs ChatGPT | no disponible | Publico en Hugging Face, 3 descargas |
| kevincai04/hw1-hc3-detector | no disponible | no disponible | no disponible | no disponible | Publico en Hugging Face |
| vivian-ch/hw1-hc3-detector | no disponible | no disponible | no disponible | no disponible | Publico en Hugging Face |
| Yihangsun/hw1-hc3-detector | no disponible | no disponible | no disponible | no disponible | Referenciado en savrn.com |
| xw131/hw1-hc3-detector | no disponible | no disponible | no disponible | no disponible | Referenciado en free2aitools.com |
| sentence-transformers/all-MiniLM-L6-v2 (base) | 22,71 M | 256 tokens | Embeddings de frases | Apache 2.0 (segun el modelo base) | Muy extendido en Hugging Face |

## Limitaciones y advertencias

- Sesgo de fuente unica: el modelo se entrena exclusivamente con texto generado por ChatGPT segun HC3, por lo que probablemente no generaliza a texto de Claude, Gemini, Llama u otros generadores.
- Sesgo de dominio y de idioma: HC3 English cubre un conjunto limitado de dominios y solo ingles; el rendimiento en otros idiomas o registros no esta evaluado y previsiblemente cae.
- Limitacion de longitud: la ventana de 256 tokens obliga a truncar o segmentar documentos largos, lo que degrada la senal en textos extensos.
- Fragilidad ante evasion: tecnicas simples como parafraseo, edicion manual, traduccion de ida y vuelta o cambios de estilo pueden reducir drasticamente la exactitud; no se documentan evaluaciones adversariales.
- Riesgo de falsos positivos: un 0,88 % de error sobre 4.668 ejemplos de test no implica el mismo rendimiento fuera de distribucion; usar la salida como prueba concluyente de autoria es inadecuado.
- Falta de calibracion: no se publican probabilidades calibradas ni umbrales recomendados, por lo que integrar la salida en un sistema de decision requiere calibracion propia.
- Licencia no disponible: al no declararse licencia, no hay autorizacion explicita de uso comercial ni de redistribucion; en produccion esto supone un riesgo legal.
- Ausencia de model card completa: no se documentan sesgos conocidos, composicion del dataset, split de evaluacion ni limitaciones declaradas por el autor.
- Traccion minima: 3 descargas y 0 likes implican practicamente ninguna validacion independiente por parte de la comunidad.
- Alucinacion: no aplica, ya que el modelo no genera texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Brianop/hw1-hc3-detector
- Modelo base declarado: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Variante con el mismo nombre (kevincai04): https://huggingface.co/kevincai04/hw1-hc3-detector
- Variante con el mismo nombre (vivian-ch): https://huggingface.co/vivian-ch/hw1-hc3-detector
- Ficha de registro en free2aitools (xw131/hw1-hc3-detector): https://free2aitools.com/model/xw131/hw1-hc3-detector
- Ficha de registro en savrn (Yihangsun/hw1-hc3-detector): https://savrn.com/models/hw1-hc3-detector
- Dataset HC3 English: referenciado en la model card, sin URL directa en la informacion proporcionada
- Paper, blog o repositorio del autor: no disponible
