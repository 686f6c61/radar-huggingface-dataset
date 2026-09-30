# ArturoBE21/simcse-bert-base-snli-sup

## Resumen

SimCSE-BERT-base-SNLI-sup es un modelo de embeddings de frases que replica el metodo SimCSE supervisado (Gao, Yao y Chen, 2021) partiendo de google-bert/bert-base-uncased. Lo desarrolla el usuario ArturoBE21 en el marco de un proyecto de la Universidad Politecnica de Yucatan. El modelo proyecta frases a vectores de 768 dimensiones que se comparan mediante similitud coseno, y su proposito es servir como extractor de representaciones semanticas para tareas de similitud de frases, recuperacion semantica y clustering de texto en ingles.

Se trata de un transformer encoder de tipo BERT con 109.482.240 parametros (aproximadamente 110 millones, 12 capas y 768 dimensiones ocultas). El entrenamiento es contrastivo: los pares de implicacion (entailment) de SNLI actuan como positivos y las hipotesis de contradiccion como negativos duros en aproximadamente el 28% de los pares. Se usaron 33.351 pares extraidos de un subconjunto de 100.000 ejemplos de SNLI, muy por debajo de los 314.000 pares de MNLI+SNLI que emplea el trabajo original.

Su relevancia es acotada y conviene ser explicito: no es un modelo generativo ni compite con los LLM actuales. Es una pieza de infraestructura para busqueda semantica y deduplicacion de frases en ingles, con licencia Apache 2.0, formato safetensors y compatibilidad directa con sentence-transformers y text-embeddings-inference. El repositorio no registra descargas ni likes en el momento de la consulta (0 y 0), por lo que se trata de un artefacto de investigacion sin validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base), entrenado con objetivo contrastivo SimCSE supervisado |
| Parametros totales | 109.482.240 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 posiciones en BERT-base; entrenado con max length 32 y truncado a 128 tokens segun el autor |
| Tipos de cuantizacion | no disponible (repo en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria sentence-transformers) |
| Dimension del embedding | 768 |
| Pooling | token [CLS] con cabeza MLP, conservada en inferencia |
| Tamano del repositorio | 0,4 GB |
| Modelo base | google-bert/bert-base-uncased |
| Pipeline | sentence-similarity |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer estandar de BERT-base: 12 capas, 768 dimensiones ocultas y aproximadamente 110 millones de parametros, inicializado desde google-bert/bert-base-uncased con todos los pesos entrenados. Sobre la representacion del token [CLS] se anade una cabeza MLP que se usa durante el entrenamiento y se mantiene en inferencia; el vector resultante es la representacion de la frase. La similitud entre frases se calcula con similitud coseno sobre esos vectores de 768 dimensiones.

El objetivo es una perdida contrastiva (InfoNCE) con pares de implicacion de SNLI como positivos y las hipotesis de contradiccion como negativos duros en torno al 28% de los pares. Los datos son 33.351 pares (premisa, hipotesis de entailment) extraidos de un subconjunto de 100.000 ejemplos de SNLI. La receta concreta es temperatura 0,05, dropout 0,1, learning rate 5e-05, batch size 128, 3 epocas, max length 32, semilla 42 y precision float16 sobre una Tesla T4. El checkpoint se selecciono por mejor Spearman en el conjunto de desarrollo de STS-B, evaluado cada 50 pasos, y el mejor resultado se dio en el paso 24. No se documenta ninguna innovacion adicional como decodificacion especulativa, atencion lineal o entrenamiento con RLHF/DPO; es una replicacion directa del metodo SimCSE supervisado.

## Capacidades

- Generacion de embeddings de frases: convierte texto en vectores de 768 dimensiones comparables por similitud coseno.
- Similitud semantica entre frases en ingles, incluida la parafrasis y la reformulacion.
- Extraccion de caracteristicas (feature-extraction) para pipelines de NLP posteriores.
- Recuperacion semantica densa (dense retrieval) sobre corpus en ingles de frases cortas.
- Clustering y deduplicacion de textos por proximidad en el espacio de embeddings.
- Clasificacion de texto mediante similitud con ejemplos de referencia (zero-shot basado en embeddings).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo de pensamiento (thinking mode), vision ni audio.
- Capacidad multilingue: no (solo ingles).

## Casos de uso

- Busqueda semantica en documentacion tecnica en ingles: indexar titulos, preguntas frecuentes o entradas de un manual y recuperar las mas cercanas a la consulta del usuario mediante similitud coseno, sin depender de coincidencia exacta de palabras clave.
- Deduplicacion de tickets de soporte: vectorizar el asunto y el cuerpo de cada ticket y agrupar los que superan un umbral de similitud, reduciendo el volumen manual de triaje.
- Deteccion de parafrasis en pipelines de control de calidad de contenido: comparar frases candidatas con originales y marcar reescrituras cercanas.
- Clustering de resenas o comentarios de producto: agrupar opiniones semanticamente equivalentes para resumir temas recurrentes sin etiquetado previo.
- Enrutado de consultas a un chatbot: usar el embedding de la pregunta entrante para seleccionar la respuesta predefinida mas similar de una base de conocimiento corta.
- Preprocesado para clasificadores de texto: generar features densas que alimenten un modelo ligero de clasificacion (sentimiento, intencion) en lugar de representaciones bag-of-words.
- Filtrado de resultados de un buscador: reordenar candidatos recuperados por un sistema lexical (por ejemplo BM25) segun la similitud semantica con la consulta.

En todos los casos el uso razonable queda restringido a frases cortas en ingles (captions y oraciones de la vida cotidiana), que es el dominio de SNLI.

## Benchmarks y rendimiento

| Benchmark | Metrica | Este modelo | Referencia del paper (SimCSE supervisado BERT-base) |
|---|---|---|---|
| STS-B dev | Spearman x 100 (similitud coseno, sin regresor) | 80,57 | 86,2 |
| STS-B test | Spearman x 100 (similitud coseno, sin regresor) | 74,27 | 84,25 |

Metricas de calidad del espacio de embeddings en STS-B dev: alignment 0,177 y uniformity -2,944 (valores mas bajos son mejores). No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K y similares no aplican a este tipo de modelo) en la informacion disponible. La diferencia de aproximadamente 6 puntos en dev y 10 puntos en test respecto al paper se atribuye, segun el propio autor, a haber entrenado con muchos menos datos.

## Requisitos de hardware

- VRAM estimada en float32: en torno a 0,44 GB solo de pesos (109,48 M de parametros), mas activaciones; cabe holgadamente en cualquier GPU con 4 GB o mas.
- VRAM estimada en float16: en torno a 0,22 GB de pesos, con precision mixta recomendada para lotes grandes.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una Tesla T4 (el hardware usado en el entrenamiento) es suficiente, y tambien una RTX 3060, RTX 4090, A100 o H100 para maximizar throughput en lotes grandes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada moderna e incluso en CPU para cargas de baja concurrencia.
- Opciones de despliegue: sentence-transformers (referencia), Hugging Face Text Embeddings Inference (el repo esta marcado como endpoints_compatible), ONNX Runtime y FastAPI o similares para servir el encoder. No hay conversion GGUF ni cuantizaciones publicadas para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / truncado | Datos de entrenamiento | STS-B (paper o card) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ArturoBE21/simcse-bert-base-snli-sup | 109,48 M | 512 posiciones, truncado a 128 tokens, entrenado a 32 | 33.351 pares de un subconjunto de SNLI (100k) | 80,57 dev / 74,27 test | apache-2.0 | Hugging Face, 0 descargas, 0 likes |
| princeton-nlp/sup-simcse-bert-base-uncased | 110 M (BERT-base) | 512 posiciones | MNLI + SNLI, 314.000 pares | 86,2 dev / 84,25 test | no disponible en la informacion proporcionada | Hugging Face (modelo oficial del paper) |
| princeton-nlp/unsup-simcse-bert-base-uncased | 110 M (BERT-base) | 512 posiciones | 106 frases muestreadas de Wikipedia en ingles, sin etiquetas | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Hugging Face (modelo oficial del paper) |

La diferencia principal frente a las dos alternativas oficiales es de datos y de validacion: el modelo de ArturoBE21 entrena con aproximadamente una decima parte de los pares del SimCSE supervisado original y solo se evalua en STS-B, mientras que las versiones de princeton-nlp son las replicas de referencia del paper y cuentan con validacion externa. Las dos variantes de princeton-nlp tienen el mismo tamano, por lo que la eleccion entre ellas depende del objetivo: supervisada para maxima calidad en similitud y no supervisada si no se dispone de pares NLI del dominio.

## Limitaciones y advertencias

- Dominio muy restringido: SNLI esta compuesto por captions de imagenes en ingles, es decir, frases cortas y cotidianas; el rendimiento fuera de ese registro no esta garantizado.
- Evaluacion limitada a STS-B: el autor advierte explicitamente de que no debe asumirse buen comportamiento en otros dominios, en documentos largos ni en otros idiomas.
- Truncado: las frases se truncan a 128 tokens, y el entrenamiento se hizo con max length 32, lo que penaliza entradas largas.
- Idiomas: solo ingles; no hay soporte multilingue.
- Sesgos heredados: incorpora los sesgos de BERT-base y de las frases de SNLI redactadas por anotadores.
- Variabilidad por semilla: los resultados proceden de una unica semilla seleccionada (42); otras semillas difieren en unas decimas de punto o mas.
- Riesgo de alucinacion: no aplica en sentido generativo, porque el modelo no genera texto; el riesgo equivalente es producir similitudes altas entre frases que no son semanticamente equivalentes.
- Sin validacion externa: 0 descargas y 0 likes, sin evaluaciones de terceros ni resultados en benchmarks adicionales.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero obliga a conservar el aviso de copyright y a indicar los cambios realizados; el modelo base google-bert/bert-base-uncased tambien es Apache 2.0.
- Es un artefacto de proyecto academico con fecha de creacion y actualizacion de 2026-09-30 en Hugging Face; conviene verificar el estado del repositorio antes de integrarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ArturoBE21/simcse-bert-base-snli-sup
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset de entrenamiento: https://huggingface.co/datasets/stanfordnlp/snli
- Paper de SimCSE: https://arxiv.org/abs/2104.08821
- Repositorio oficial de SimCSE: https://github.com/princeton-nlp/SimCSE
- Modelo oficial SimCSE supervisado: https://huggingface.co/princeton-nlp/sup-simcse-bert-base-uncased
- Modelo oficial SimCSE no supervisado: https://huggingface.co/princeton-nlp/unsup-simcse-bert-base-uncased
- Implementacion de SimCSE supervisado en PyTorch: https://github.com/ManogyaChordia/SimCSE-NLP-
