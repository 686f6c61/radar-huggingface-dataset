# alighabusaleh/SARF-MARBERTv2-Arabic-Sentiment

## Resumen

SARF (صرف) es un clasificador de sentimiento de tres clases (negativo, neutro, positivo) especializado en arabe dialectal. Lo desarrolla el Text Technology Lab de la Goethe University Frankfurt (Ali Abusaleh, Bhuvanesh Verma y Alexander Mehler) y se apoya en el encoder preentrenado MARBERTv2 de UBC-NLP. El modelo tiene aproximadamente 167,5 millones de parametros y esta disenado para leer cada frase desde tres vistas morfologicas distintas (forma superficial normalizada, raiz ligera y raiz consonantal) que se fusionan mediante atencion cruzada.

La relevancia del modelo radica en que es la implementacion exacta enviada a la tarea compartida AraSentEval 2026 (OSACT7 @ LREC 2026), donde alcanzo un macro-F1 de 0,9263 en el conjunto de test oficial y se clasifico en segunda posicion de 15 equipos. Frente a los clasificadores de sentimiento que trabajan solo con la superficie del texto, SARF incorpora informacion morfologica explicita, algo critico en arabe dialectal por la variabilidad ortografica y el uso de dialectos no estandarizados.

El modelo cubre arabe estandar moderno (MSA) y varios dialectos: egipcio, saudí, jordano y marroquí (Darija), con dominio principal de resenas de hotel y turismo. Se distribuye bajo licencia CC-BY-4.0 en formato safetensors y requiere `trust_remote_code=True` por incluir codigo personalizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT multi-vista (3 pasadas compartidas de MARBERTv2) + atencion cruzada de 8 cabezas + clasificador CNN/LSTM |
| Parametros totales | 167.511.011 (~167,5 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (longitud maxima fijada en entrenamiento e inferencia; el padding debe ser siempre a 128) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arabe: MSA y dialectos egipcio, saudí, jordano y marroquí (Darija) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de MARBERTv2, un transformer bidireccional preentrenado sobre arabe dialectal y MSA. Sobre esa base, SARF aplica tres transformaciones morfologicas al mismo texto: (1) una vista superficial con normalizacion (eliminacion de URL y digitos, retirada de diacriticos y tatweel, colapso de caracteres repetidos y normalizacion de variantes de Alef/Hamza), (2) una vista de raiz ligera mediante el stemmer Snowball (PyStemmer) y (3) una vista de raiz consonantal con `ArabicLightStemmer.get_root()` de Tashaphyne. Las tres entradas pasan por el mismo encoder MARBERTv2 con pesos compartidos, generando los estados H_s (superficial), H_st (stem) y H_r (raiz). Sobre ellos se aplica una atencion cruzada compartida de 8 cabezas con Q = H_s, que produce A_st = Attn(H_s, H_st) y A_r = Attn(H_s, H_r). La representacion fusionada es F = (H_s + A_st + A_r) / 3. La rama superficial alimenta una CNN con filtros de tamano k = {3, 4, 5} y 200 filtros por tamano, mientras que F alimenta una LSTM unidireccional de 128 unidades con mean-pooling. Ambas ramas se concatenan (728 dimensiones) y pasan por dropout de 0,3 y una capa lineal final de 3 clases.

El entrenamiento se realizo en dos etapas con los mismos hiperparametros: AdamW con weight decay de 0,02, batch de 128, longitud maxima de 128, dropout 0,3 y perdida de entropia cruzada. La etapa 1 aplica transfer learning desde resenas de hotel en MSA (SemEval-2016 Task 5 ABSA, dataset `srinivasbilla/semeval-2016-absa-reviews-arabic`) durante 10 epocas con learning rate de 1,24e-4. La etapa 2 realiza adaptacion dialectal durante 10 epocas con learning rate de 1,24e-5 (10 veces menor) sobre el conjunto de entrenamiento de AraSentEval 2026, formado por 1.731 frases balanceadas entre Darija, saudí, jordano y egipcio (657 negativas, 609 positivas y 465 neutras). Los pesos liberados son identicos a bit respecto al checkpoint original de entrenamiento y reproducen exactamente las 312 predicciones del envio al leaderboard.

## Capacidades

- Clasificacion de sentimiento de tres clases (negativo, neutro, positivo) a nivel de frase.
- Procesamiento de arabe dialectal ademas de MSA: egipcio, saudí, jordano y marroquí (Darija).
- Analisis morfologico explicito mediante tres vistas (superficie normalizada, stem y raiz consonantal).
- Normalizacion ortografica robusta: retirada de diacriticos y tatweel, colapso de repeticiones y unificacion de variantes de Alef/Hamza.
- Inferencia con etiquetas y probabilidades: `model.predict(..., return_probs=True)` devuelve puntuaciones por clase.
- API de batching con `model.encode()` que genera los seis tensores de entrada (input_ids y attention_mask para las tres vistas).
- No dispone de tool calling, function calling, capacidades de agente, vision ni audio: es un modelo de extraccion de caracteristicas y clasificacion de texto.
- No dispone de modo de razonamiento (thinking) ni generacion de texto libre.

## Casos de uso

- Analisis de resenas de hotel y turismo: el modelo esta afinado especificamente sobre este dominio y puede clasificar opiniones de huespedes en dialecto en negativas, neutras o positivas, tal como se entreno en la tarea AraSentEval.
- Monitorizacion de reputacion online en redes sociales arabes: al cubrir Darija, egipcio, saudí y jordano, permite etiquetar menciones dialectales donde los modelos entrenados solo con MSA fallan.
- Moderacion y filtrado de comentarios: clasificar el tono de comentarios en plataformas arabofonas para priorizar revision o responder automaticamente segun polaridad.
- Analisis de encuestas de satisfaccion en dialecto: procesar respuestas abiertas escritas en dialecto, normalizando la ortografia variable antes de clasificar.
- Telemetria de opinion de producto: integrar el modelo en un pipeline que agregue sentimiento por producto o marca a partir de resenas de comercio electronico arabe.
- Investigacion en PNL arabe: servir como baseline morfologico reproducible (bit-identico al leaderboard) para comparar tecnicas de fusion multi-vista en tareas de sentimiento dialectal.
- Preetiquetado de datasets: usar las probabilidades de salida para anotar rapidamente grandes volumenes de texto arabe antes de una revision humana.
- Componente analitico en dashboards de negocio: alimentar indicadores de polaridad agregada por region o dialecto a partir de flujos de texto en arabe dialectal.

## Benchmarks y rendimiento

Datos declarados por el autor (model-index de la model card; no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Analisis de sentimiento | AraSentEval 2026 (tarea compartida OSACT7), conjunto de test oficial | Macro-F1 | 0,9263 |

El autor indica que este resultado situo al modelo en segunda posicion de 15 equipos. No se han publicado en la informacion disponible otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.), que ademas no aplican a un modelo de clasificacion.

## Requisitos de hardware

- VRAM estimada para inferencia (167,5 M de parametros, mas cabezas CNN/LSTM y activaciones a 128 tokens): aproximadamente 0,7 GB en FP32, 0,35 GB en FP16/BF16, 0,17 GB en INT8 y 0,09 GB en INT4.
- Cabe sin problema en GPU de consumo: cualquier GPU con 4 GB o mas de VRAM es suficiente (RTX 3050, GTX 1660, RTX 4090, etc.). Tambien puede ejecutarse en CPU para volumentes modestos.
- GPU de datacenter (A100, H100, L40S) son validas pero sobredimensionadas para un modelo de este tamano; su utilidad aparece al procesar lotes muy grandes.
- Opciones de despliegue: al incluir codigo personalizado, la via soportada es `transformers` con `trust_remote_code=True` (junto con `PyStemmer`, `tashaphyne` y `pyarabic`). No se distribuyen pesos GGUF ni adaptaciones oficiales para vLLM, TGI, llama.cpp u Ollama; usarlos requeriria portar el preprocesamiento morfologico y las cabezas.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.
- Requisito critico: hacer padding siempre a 128 tokens. La rama LSTM hace mean-pooling sobre las 128 posiciones, incluidas las de relleno, igual que en entrenamiento; usar padding dinamico altera las predicciones.

## Comparativa con modelos similares

No hay resultados de benchmarks comparables publicados en la informacion disponible para otros clasificadores de sentimiento arabe. La comparacion se limita a la relacion estructural con su encoder base y la familia de la que procede.

| Modelo | Parametros totales | Longitud de contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SARF-MARBERTv2 | 167,5 M | 128 tokens | Clasificacion de sentimiento (3 clases), dialectal arabe | cc-by-4.0 | HuggingFace (codigo personalizado, safetensors) |
| UBC-NLP/MARBERTv2 (modelo base) | no disponible | no disponible | Masked language modeling | no disponible | HuggingFace |
| UBC-NLP/MARBERT | no disponible | no disponible | Masked language modeling / encoder general | no disponible | HuggingFace, GitHub |
| UBC-NLP/ARBERT | no disponible | no disponible | Masked language modeling / encoder general | no disponible | HuggingFace, GitHub |

## Limitaciones y advertencias

- Dominio restringido: el ajuste fino se realizo sobre resenas de hotel y turismo; el rendimiento puede degradarse en otros dominios (redes sociales, noticias, texto tecnico).
- Es un clasificador de 3 clases (negativo/neutro/positivo); no realiza analisis de sentimiento a nivel de aspecto ni deteccion de emociones.
- Cobertura dialectal limitada a egipcio, saudí, jordano, marroquí (Darija) y MSA; otros dialectos arabes (por ejemplo golfo oriental, levantino no jordano, yemeni) no estan cubiertos explicitamente.
- Ventana de contexto de solo 128 tokens: no apto para documentos largos sin troceado previo.
- Riesgo de alucinacion: bajo en el sentido generativo (no genera texto), pero puede asignar etiquetas erroneas en frases ambiguas, sarcasticas o con mezcla de idiomas.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible; al entrenarse con resenas de hotel y conjuntos de la tarea compartida, puede heredar sesgos de dominio y de la anotacion original.
- Dependencia de codigo personalizado: requiere `trust_remote_code=True` para cargar el modelo, lo que implica ejecutar codigo del autor; conviene revisarlo en entornos de produccion.
- Dependencias adicionales de preprocesamiento (PyStemmer, tashaphyne, pyarabic) que deben instalarse y versionarse de forma controlada.
- Advertencia de inferencia: el padding debe hacerse siempre a 128 tokens; el padding dinamico cambia las predicciones respecto a los resultados reportados.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribucion; es obligatorio citar la autoria y la licencia.
- El resultado de 0,9263 de macro-F1 procede del autor y figura como no verificado de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alighabusaleh/SARF-MARBERTv2-Arabic-Sentiment
- Modelo base MARBERTv2: https://huggingface.co/UBC-NLP/MARBERTv2
- Modelo MARBERT (original): https://huggingface.co/UBC-NLP/MARBERT
- Codigo del proyecto: https://github.com/aliabusaleh/ArabicSentimentAnalysis_AraSentEval_2026
- README del codigo: https://github.com/aliabusaleh/ArabicSentimentAnalysis_AraSentEval_2026/blob/master/README.md
- Paper de SARF (TTLab at AraSentEval): https://aclanthology.org/2026.osact-1.35/
- Dataset SemEval-2016 ABSA (resenas de hotel en arabe): https://huggingface.co/datasets/srinivasbilla/semeval-2016-absa-reviews-arabic
- Repositorio UBC-NLP/marbert (ARBERT y MARBERT): https://github.com/UBC-NLP/marbert
- Paper ARBERT y MARBERT: https://arxiv.org/abs/2101.01785
