# chaouin/qfrblima-moderncamembert

## Resumen

QFrBLiMa — ModernCamemBERT es un clasificador supervisado de texto que distingue entre frances metropolitano (MFr) y frances de Quebec (QFr). Lo desarrolla el autor chaouin como parte del proyecto QFrBLiMa, un benchmark contrastivo de marcadores linguisticos regionales, y se construye mediante fine-tuning del modelo base almanach/moderncamembert-base. Su proposito es puramente de investigacion: evaluar hasta que punto un encoder puede reconocer variantes regionales del frances a partir de senales linguisticas finas.

Arquitecturalmente es un ModernBERT adaptado a clasificacion de secuencias, con 136 millones de parametros totales y una ventana de entrenamiento limitada a 128 tokens. El modelo se entrena sobre un corpus supervisado propio de 938.484 ejemplos balanceado por variedad y genero, y se evalua de forma externa sobre el benchmark QFrBLiMa, que no se usa en el entrenamiento ni en la seleccion del checkpoint.

Es relevante ahora porque ejemplifica una linea de trabajo poco comun: la clasificacion de variedades dialectales dentro de un mismo idioma con encoders ligeros, y porque publica resultados honestos sobre la brecha entre rendimiento interno (97,09% macro-F1) y rendimiento contrastivo externo (69,38% de accuracy por pares). Con licencia MIT y solo 0,5 GB de repositorio, es facil de desplegar y auditar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT), cabeza de clasificacion de secuencias |
| Parametros totales | 136.089.602 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (longitud maxima usada en entrenamiento; contexto nativo del base no disponible) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | frances (fr), con foco en frances metropolitano y frances de Quebec |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de almanach/moderncamembert-base, un encoder de la familia ModernBERT orientado a frances, y anade una cabeza de clasificacion binaria sobre la representacion de la secuencia. El fine-tuning se realizo sobre un corpus supervisado separado de 938.484 ejemplos, dividido en 751.288 de entrenamiento, 93.768 de validacion y 93.428 de test, balanceado por variedad dentro de cada uno de seis generos y en cada particion. Se entrenaron tres epocas con batch efectivo de 32, learning rate de 2e-5, longitud maxima de secuencia de 128 y semilla 42; el checkpoint de la epoca 2 se selecciono por macro-F1 de validacion.

El benchmark QFrBLiMa se reservo exclusivamente para evaluacion externa, sin participar en el entrenamiento ni en la seleccion del checkpoint. El corpus supervisado no se redistribuye publicamente, siguiendo el trabajo de Khan et al. (2026), y su documentacion de procedencia advierte de que la reconstruccion exacta no esta verificada. Las etiquetas de entrenamiento se basan en la fuente del texto, un proxy imperfecto del uso linguistico real.

## Capacidades

- Clasificacion binaria de variedad regional del frances: clase 0 para frances metropolitano (etiqueta heredada `FI`) y clase 1 para frances de Quebec (etiqueta heredada `FQ`).
- Puntuacion de similitud relativa entre pares de frases: en evaluacion contrastiva, la frase QFr debe obtener una puntuacion softmax de clase 1 estrictamente mayor que su contraparte MFr.
- Procesamiento de textos cortos, con truncacion a 128 tokens.
- Inferencia por lotes con tokenizer fast y `AutoModelForSequenceClassification`.
- Compatibilidad con text-embeddings-inference y endpoints compatibles, segun los tags del repositorio.
- No soporta generacion de texto, tool calling, agentes, vision ni audio: es un encoder discriminativo.

## Casos de uso

- Evaluacion de investigacion en dialectologia computacional: medir la capacidad de un encoder para discriminar marcadores lexicos y morfosintacticos regionales mediante pares contrastivos, usando la puntuacion softmax de clase 1 como senal de comparacion.
- Filtrado y anotacion de corpus: preetiquetar grandes volumenes de texto frances para separar candidatos a frances de Quebec de candidatos a frances metropolitano antes de una revision humana, asumiendo la tasa de error del 56,97% de accuracy a nivel de frase.
- Deteccion de marcadores regionales en estudios linguisticos: localizar en un corpus que frases contienen senales compatibles con QFr para su analisis manual posterior, con 241 marcadores documentados en el benchmark.
- Baseline en experimentos de clasificacion de variedades: servir como referencia ligera (136 M de parametros) frente a modelos mayores en tareas de identificacion de dialectos del frances.
- Control de calidad de datos de entrenamiento: detectar contaminacion de variedad en datasets etiquetados como metropolitanos o quebequenses antes de usarlos para entrenar otros modelos.
- Despliegue en entornos con recursos limitados: al ocupar 0,5 GB en safetensors y ser un encoder de 136 M de parametros, cabe en una sola GPU consumer y permite clasificar lotes con latencia baja mediante transformers o text-embeddings-inference.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---:|
| Macro-F1 en test interno | 97,09% |
| Accuracy de frase en QFrBLiMa | 56,97% |
| Macro-F1 de frase en QFrBLiMa | 53,24% |
| Accuracy estricta por pares en QFrBLiMa | 69,38% |
| Intervalo de confianza al 95% (pares) | 64,98%–73,61% |

La evaluacion externa cubre 1.205 pares contrastivos, 241 marcadores y cinco contextos por marcador, con umbral de 0,5 para la clasificacion a nivel de frase. El intervalo se calcula con 20.000 replicas bootstrap agrupadas por marcador linguistico. No se han publicado en la informacion disponible resultados comparativos frente a los otros cuatro clasificadores del benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,55 GB solo para pesos (136 M de parametros), mas activaciones y overhead del runtime; en la practica, menos de 2 GB en la mayoria de configuraciones.
- En fp16 o bf16 los pesos ocupan aproximadamente 0,27 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente, incluidas RTX 3060, RTX 4060, RTX 4090; tambien A100 y H100, aunque estan sobredimensionadas para este modelo.
- Cabe en GPU consumer y en CPU: al ser un encoder de 136 M de parametros con secuencias de 128 tokens, la inferencia en CPU es viable para lotes moderados.
- Opciones de despliegue: transformers con `AutoModelForSequenceClassification`, text-embeddings-inference y endpoints compatibles (segun los tags del repositorio). No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| chaouin/qfrblima-moderncamembert | 136 M | 128 tokens (entrenamiento) | Clasificacion MFr/QFr | MIT | Hugging Face |
| almanach/moderncamembert-base | no disponible | no disponible | Encoder base frances (fine-tune) | no disponible | Hugging Face |
| Otros cuatro clasificadores del benchmark QFrBLiMa | no disponible | no disponible | Clasificacion MFr/QFr | no disponible | Referenciados en el repositorio GitHub del proyecto |

No se dispone de datos de rendimiento de los modelos alternativos en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- El modelo esta destinado a investigacion sobre reconocimiento linguistico regional, no a inferir el origen o la identidad de una persona.
- Las etiquetas de entrenamiento provienen de la fuente del texto y son proxies imperfectos del uso linguistico; ninguna variedad implica un uso geografico exclusivo.
- La accuracy externa a nivel de frase es del 56,97%, solo ligeramente por encima del azar en una tarea binaria; el rendimiento interno del 97,09% no garantiza reconocimiento contrastivo ni generalizacion a otros dominios.
- Las puntuaciones softmax no estan calibradas; en evaluacion contrastiva los empates cuentan como incorrectos.
- Ventana de contexto de 128 tokens, insuficiente para documentos largos sin truncacion.
- Solo cubre frances; no hay soporte documentado para otras lenguas ni para variantes regionales distintas de MFr y QFr.
- El corpus supervisado no se redistribuye y su reconstruccion exacta no esta verificada, lo que limita la reproducibilidad completa del entrenamiento.
- Licencia MIT, compatible con uso comercial, pero el uso previsto declarado por el autor es la investigacion; el uso comercial sin validacion adicional conlleva riesgo de mal uso.
- Riesgo de alucinacion no aplicable en sentido generativo, pero si de falsos positivos y negativos sistematicos en la clasificacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chaouin/qfrblima-moderncamembert
- Modelo base: https://huggingface.co/almanach/moderncamembert-base
- Dataset QFrBLiMa: https://huggingface.co/datasets/chaouin/qfrblima
- Repositorio GitHub del proyecto: https://github.com/chaouin/QFrBLiMa
- Predicciones y analisis de encoders: https://github.com/chaouin/QFrBLiMa/tree/main/results/encoders
- Documentacion del corpus de entrenamiento: https://github.com/chaouin/QFrBLiMa/tree/main/data/training_corpus
- Paper de referencia (Khan et al., 2026): https://aclanthology.org/2026.lrec-1.840/
