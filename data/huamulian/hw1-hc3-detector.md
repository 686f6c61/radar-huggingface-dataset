# Huamulian/hw1-hc3-detector

## Resumen

hw1-hc3-detector es un clasificador binario de texto desarrollado por el usuario Huamulian y publicado en HuggingFace. Su tarea consiste en determinar si una respuesta a una pregunta del corpus HC3 (Human ChatGPT Comparison Corpus) ha sido escrita por una persona (etiqueta 0) o generada por ChatGPT (etiqueta 1). No es un modelo generativo: se trata de un transformer encoder afinado para clasificacion de secuencias, con una cabeza de clasificacion de dos clases.

El modelo parte de sentence-transformers/all-MiniLM-L6-v2, un encoder MiniLM-L6 de 22.713.986 parametros (unos 22,7 millones), y se ha afinado sobre la particion en ingles del dataset HC3 con un esquema de 5 epocas, AdamW, learning rate 2e-5, batch de 32 y longitud maxima de 256 tokens. La particion train/validacion/test es a nivel de pregunta (80/10/10, semilla 42), de forma que las respuestas de una misma pregunta nunca se reparten entre particiones distintas.

Su relevancia es acotada pero concreta: sirve como pieza de deteccion de texto sintetico en pipelines de moderacion, curación de datos o analisis de integridad academica, y como punto de partida reproducible para investigacion sobre deteccion de texto generado. El autor reporta una exactitud del 98,63 % en el conjunto de test, frente al 84,49 % de una linea base de embeddings congelados con regresion logistica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MiniLM-L6, 6 capas, 384 dimensiones ocultas), con cabeza de clasificacion de 2 clases |
| Parametros totales | 22.713.986 (22,7 M, dato real de safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 256 tokens (longitud maxima de secuencia usada en el entrenamiento; coincide con el limite de la base MiniLM-L6-v2) |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas; el modelo base admite cuantizacion dinamica int8 con PyTorch) |
| Idiomas soportados | ingles (el dataset HC3 English y la model card estan en ingles; el autor no declara idiomas oficialmente) |
| Licencia | no disponible (la model card no especifica licencia; la base all-MiniLM-L6-v2 es Apache-2.0) |
| Formato de pesos | safetensors (no se publican pesos en GGUF, ONNX ni otros formatos) |

## Arquitectura y entrenamiento

Arquitectura: encoder transformer de 6 capas con 384 dimensiones ocultas y 12 cabezas de atencion (MiniLM-L6-v2), al que se anade una cabeza de clasificacion sobre la representacion del token [CLS] para producir dos logits (humano / ChatGPT). El tamaño del repositorio es de 0,1 GB, coherente con un checkpoint en precision de 32 bits. La tarea es de clasificacion de texto (`pipeline: text-classification`), con pipeline_tag declarado y compatibilidad con Text Embeddings Inference y con Inference Endpoints de HuggingFace.

Entrenamiento: afinado supervisado sobre la particion en ingles de HC3 (revision del dataset fijada a `4d0ff18143b5a7e1b1e79beb540c04549d1e59d3`), usando unicamente el texto de la respuesta como entrada. Split a nivel de pregunta 80/10/10 con semilla 42. Hiperparametros declarados: optimizador AdamW, learning rate 2e-5, 5 epocas, batch size 32, max_seq_length 256. La model card no indica si hubo entrenamiento con precision mixta, ni mezcla de datos adicional, ni tecnicas de RLHF/DPO (no aplicables a un clasificador de este tipo). Como innovacion tecnica no se declara ninguna: es un afinado estandar de clasificacion. Si se menciona el uso del calculador de impacto de Machine Learning de Lacoste et al. (2019), referenciado en la model card, aunque los campos de impacto ambiental (hardware, horas, proveedor, emisiones) estan sin rellenar.

## Capacidades

- Clasificacion binaria de texto en ingles en dos etiquetas: `0` = respuesta humana, `1` = respuesta generada por ChatGPT.
- Deteccion de respuestas sinteticas en el dominio concreto de pares pregunta-respuesta del corpus HC3 (no es un detector general de texto generado).
- Procesamiento de entradas de hasta 256 tokens, con truncamiento del texto excedente.
- Inferencia por lotes (batch) a traves de `transformers` y de Text Embeddings Inference, segun los tags del repositorio.
- Compatible con HuggingFace Inference Endpoints (`endpoints_compatible`).
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, function calling ni capacidades de agente o multi-step reasoning: es un clasificador discriminativo puro.
- No se declaran capacidades multilingues; solo se ha entrenado y evaluado con datos en ingles.

## Casos de uso

- Moderacion de foros de preguntas y respuestas: el clasificador puede etiquetar respuestas entrantes como humanas o generadas y activar revision manual cuando la probabilidad de la clase `1` supere un umbral configurable, con un coste computacional minimo (22,7 M de parametros).
- Integridad academica en plataformas de evaluacion escrita: filtrado previo de entregas en formato de respuesta corta en ingles (hasta 256 tokens) para priorizar la revision humana de los casos sospechosos.
- Curacion de corpus de entrenamiento: eliminacion de texto sintetico en la fase de limpieza de datasets en ingles antes de entrenar modelos generativos, evitando la contaminacion por datos de ChatGPT.
- Pseudo-etiquetado a escala: al ser un modelo pequeno, permite etiquetar grandes volumenes de texto en CPU o en una unica GPU para construir datasets de deteccion de texto generado que despues se revisen y corrijan.
- Investigacion sobre deteccion de texto sintetico: sirve como linea base reproducible (semilla, revision de dataset e hiperparametros declarados) para comparar tecnicas de deteccion, analisis de atributos estilisticos y estudios de robustez frente a parafraseo.
- Analisis de procedencia en repositorios de contenido educativo o periodistico: clasificacion automatica de respuestas largas en ingles para anadir metadatos de procedencia antes de la publicacion.
- Filtro previo en sistemas de respuesta automatica: descartar contenido que ya es sintetico para evitar bucles de retroalimentacion al reutilizar datos de usuarios.

## Benchmarks y rendimiento

Los unicos datos publicados son los resultados de test declarados por el autor sobre la particion de test de HC3 English. Se trata de exactitud (accuracy) de clasificacion binaria, no de benchmarks generativos (MMLU, HumanEval, GSM8K no aplican a este modelo).

| Modelo | Exactitud en test |
|---|---|
| Embeddings de frase congelados + regresion logistica (linea base) | 84,49 % |
| Clasificador transformer afinado (hw1-hc3-detector) | 98,63 % |

La model card no desglosa precision, recall, F1, matriz de confusion ni resultados por subgrupo o por dominio tematico, y no aporta comparaciones con otros detectores de texto generado.

## Requisitos de hardware

- Peso de los pesos en FP32: aproximadamente 91 MB (22.713.986 parametros x 4 bytes); en FP16/BF16: unos 45 MB; con cuantizacion dinamica int8: unos 23 MB.
- VRAM estimada para inferencia: por debajo de 1 GB con batch moderado, incluyendo activaciones y overhead del runtime. Cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, GTX 1650, T4, RTX 3050 en adelante). Modelos como RTX 3060, RTX 4090, A100 o H100 estan muy sobredimensionados para este modelo.
- Ejecucion en CPU: viable y suficiente para la mayoria de despliegues; el cuello de botella sera el preprocesado del tokenizador, no la matriz de pesos.
- Opciones de despliegue: `transformers` (pipeline de text-classification), HuggingFace Inference Endpoints (tag `endpoints_compatible`), Text Embeddings Inference (tag del repositorio), ONNX Runtime o TorchScript previa conversion. No se publican pesos GGUF, por lo que llama.cpp y Ollama no son cauces directos sin conversion adicional.
- Latencia y throughput: no disponibles en la informacion proporcionada. La model card no incluye mediciones de velocidad, hardware de entrenamiento ni horas de computo (los campos de impacto ambiental estan sin rellenar).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Huamulian/hw1-hc3-detector | 22,7 M | 256 tokens | 98,63 % de exactitud en test HC3 | no disponible | HuggingFace |
| MiniLM-L6-v2 + regresion logistica (linea base de la model card) | 22,7 M (embeddings congelados) | 256 tokens | 84,49 % de exactitud en test HC3 | Apache-2.0 (base) | reproducible por el usuario |
| sentence-transformers/all-MiniLM-L6-v2 (modelo base sin afinar) | 22,7 M | 256 tokens | no disponible para clasificacion binaria directa | Apache-2.0 | HuggingFace |

No se dispone de datos comparativos con otros detectores de texto generado de la misma categoria (por ejemplo, clasificadores basados en RoBERTa, DeBERTa o detectores comerciales tipo GPTZero), ya que la model card no los incluye y la busqueda web no ha devuelto informacion relevante sobre este modelo.

## Limitaciones y advertencias

- Modelo puramente discriminativo: no genera texto ni mantiene conversaciones; cualquier uso generativo es fuera de alcance.
- Especificidad de dominio: entrenado exclusivamente sobre la particion en ingles de HC3, con respuestas generadas por una version concreta de ChatGPT. La generalizacion a otros dominios, idiomas, registros o a texto de modelos posteriores no esta evaluada.
- Ventana efectiva de 256 tokens: las respuestas mas largas se truncan, lo que puede eliminar la parte del texto con mayor senal discriminativa y degradar la precision en entradas extensas.
- Riesgo de falsos positivos: textos humanos formales, tecnicos o muy estructurados pueden clasificarse como generados por IA, con consecuencias graves en contextos academicos o disciplinarios. No se publican tasas de falsos positivos ni umbrales calibrados.
- Robustez limitada ante evasion: parafraseo, edicion manual o reescritura por parte de un tercero pueden alterar la clasificacion; no se documentan pruebas de robustez.
- Licencia no especificada: la model card no declara licencia para el modelo derivado. Aunque la base all-MiniLM-L6-v2 es Apache-2.0, la ausencia de licencia explicita impide un uso comercial seguro sin consultar al autor.
- Model card incompleta: la mayor parte de las secciones (sesgos, uso previsto, uso fuera de alcance, datos de entrenamiento, evaluacion desglosada, hardware, cita) estan sin rellenar porque proceden de una plantilla autogenerada. No hay informacion sobre sesgos demograficos, linguisticos o de dominio.
- Validacion externa nula: 0 descargas y 1 like en el momento de la consulta, sin revision por pares ni evaluacion independiente que confirme el 98,63 % de exactitud reportado.
- Reproducibilidad limitada: la particion de test no se publica como artefacto, solo la revision del dataset, por lo que replicar exactamente el resultado depende de reproducir el split con la semilla 42.
- Fecha de creacion anomala (2026-09-27) en los metadatos del repositorio, lo que dificulta situar temporalmente el modelo y su contexto de publicacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Huamulian/hw1-hc3-detector
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Dataset HC3 (referencia del corpus citado en la model card, no enlazado por el autor): https://huggingface.co/datasets/Hello-SimpleAI/HC3
- Paper citado en la model card (Lacoste et al., 2019, calculador de impacto de Machine Learning): https://arxiv.org/abs/1910.09700
- Calculador de impacto de Machine Learning: https://mlco2.github.io/impact
- Busqueda web: no se han encontrado enlaces relevantes sobre este modelo. Los resultados devueltos corresponden a TikTok y no guardan ninguna relacion con hw1-hc3-detector ni con la deteccion de texto generado.
