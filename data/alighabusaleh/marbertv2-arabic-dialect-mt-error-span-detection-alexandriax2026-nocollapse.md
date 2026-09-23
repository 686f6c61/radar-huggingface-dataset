# alighabusaleh/marbertv2-arabic-dialect-mt-error-span-detection-alexandriax2026-nocollapse

## Resumen

Este modelo es un clasificador de tokens especializado en detectar y categorizar errores de traduccion automatica en arabe dialectal. Se construye a partir de MARBERTv2, el encoder de BERT preentrenado por UBC-NLP sobre grandes volumenes de texto arabe y dialectal, y se afina de extremo a extremo con una cabeza lineal de clasificacion de tokens. Su tarea no es generar texto, sino marcar, sobre la salida de un sistema de traduccion (la hipotesis en arabe, sin acceso a la fuente en ingles), los fragmentos a nivel de caracter que contienen errores y asignarles una categoria del esquema LQM/MQM.

El modelo lo desarrolla Ali Ghabusaleh (TTLab) como sistema para la Subtask 3 de AlexandriaX-2026, la campana de evaluacion de traduccion automatica ingles-arabe dialectal, y se describe en el articulo "TTLab at AlexandriaX-2026: A Fine-Tuned Surface Tagger for Arabic Machine-Translation Error-Span Detection and Classification" (Abusaleh, Verma y Mehler, ArabicNLP 2026). La relevancia practica esta en que sustituye la evaluacion MQM manual, muy costosa, por un etiquetador automatico capaz de estimar calidad a escala sobre cinco direcciones dialectales: egipcio, mauritano, marroqui, palestino y emirati.

Esta version concreta es la "revised no-collapse": mismo etiquetador que el checkpoint de envio oficial, pero entrenado con las seis categorias LQM originales sin colapsar las raras. Segun la model card, esa configuracion elevo la puntuacion Overall oficial de 40,91 a 42,00. El checkpoint publico no son los pesos exactos de esa ejecucion, sino un reentrenamiento completo con identica configuracion y semilla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (etiqueta `bert`) con cabeza lineal de clasificacion de tokens y dropout 0,1 |
| Parametros totales | 162.256.135 (segun safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; el entrenamiento trunca las secuencias a 192 tokens subpalabra |
| Tipos de cuantizacion | no disponible (no se publican versiones GGUF, GPTQ, AWQ ni ONNX) |
| Idiomas soportados | Arabe (foco en dialectos egipcio, mauritano, marroqui, palestino y emirati) e ingles (solo como idioma del par de traduccion objeto de evaluacion) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors, cargable con `transformers` |
| Tarea (`pipeline_tag`) | `token-classification` |
| Etiquetas de salida | `O`, `graphetics`, `morphosyntax`, `orthography_writing_conventions`, `pragmatics`, `semantics`, `sociolinguistics` |
| Direcciones dialectales | `ENG_EGY`, `ENG_MAU`, `ENG_MOR`, `ENG_PAL`, `ENG_UAE` |
| Modelo base | UBC-NLP/MARBERTv2 |
| Tamano del repositorio | 0,6 GB |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de tipo BERT (MARBERTv2) afinado de extremo a extremo con una cabeza lineal de clasificacion de tokens. La cabeza predice directamente `O` mas las seis categorias LQM originales, sin remapeo de etiquetas ni colapso de clases raras, que es justamente la diferencia respecto al checkpoint de envio oficial. El entrenamiento usa el conjunto de entrenamiento completo de AlexandriaX Subtask 3 (1.125 frases), con perdida focal (gamma = 2) y peso alpha = 0,3 para la clase `O`, optimizador AdamW con learning rate 2e-5, batch de 16, 12 epocas, grad-clip de 1,0 y semilla 42. Las salidas mas largas de 192 tokens subpalabra se truncan.

La innovacion tecnica principal no esta en el backbone, sino en el decodificador de spans. En inferencia, un token se marca como erroneo cuando `1 - P(O)` supera un umbral especifico por dialecto, tau_d, ajustado sobre predicciones out-of-fold de validacion cruzada de 5 particiones con una rejilla de 0,20 a 0,70 en pasos de 0,025. Los umbrales publicados son 0,325 para `ENG_EGY`; 0,2 para `ENG_MAU`; 0,2 para `ENG_MOR`; 0,225 para `ENG_PAL`; y 0,225 para `ENG_UAE`. Para una direccion no vista, el decodificador aplica un valor por defecto de 0,4. Los tokens contiguos de la misma categoria se fusionan, se proyectan a offsets de caracter mediante el offset mapping del tokenizer, se recortan espacios y puntuacion, y se descartan los spans de menos de 2 caracteres.

## Capacidades

- Deteccion de spans de error a nivel de caracter en traducciones automaticas al arabe dialectal, sin necesidad de la frase fuente en ingles.
- Clasificacion de cada span en una de las seis categorias LQM: `graphetics`, `morphosyntax`, `orthography_writing_conventions`, `pragmatics`, `semantics` y `sociolinguistics`.
- Decodificacion con umbral calibrado por direccion dialectal, lo que permite ajustar el equilibrio entre cobertura y precision segun el dialecto.
- Salida en el formato `LQM_prediction_tagged_errors` de Codabench mediante el script `inference.py` incluido en el repositorio, a partir de ficheros JSONL con los campos `id`, `direction`, `source` y `model_prediction`.
- Acceso a probabilidades por token sin decodificar, cargando el checkpoint como `BertForTokenClassification` estandar de `transformers`.
- Cobertura de cinco pares ingles-dialecto arabe: egipcio, mauritano, marroqui, palestino y emirati.
- Soporte de ejecucion por lotes para estimacion de calidad a escala.
- No dispone de generacion de texto libre, tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Control de calidad en pipelines de traduccion automatica: el modelo etiqueta la salida de un motor de traduccion hacia dialectos arabes y devuelve los spans problematicos con su categoria, lo que permite bloquear o marcar traducciones por debajo de un umbral de calidad antes de publicarlas.
- Estimacion escalable de calidad tipo MQM: sustituye la anotacion manual de errores por un etiquetado automatico por frase, util para construir metricas agregadas de calidad por dialecto sin coste de anotacion por muestra.
- Filtrado de datos de entrenamiento: las traducciones sinteticas con alta densidad de spans en `morphosyntax` o `semantics` pueden descartarse o marcarse antes de incorporarlas al entrenamiento de un modelo de traduccion.
- Monitorizacion en produccion de sistemas de traduccion: al ser un modelo de 162 millones de parametros, cabe en una GPU de gama media o incluso en CPU, por lo que puede ejecutarse en linea sobre el trafico de traduccion y generar alertas cuando la tasa de spans por frase se dispara.
- Preanotacion para anotadores humanos: el etiquetador genera propuestas de spans y categorias que un posteditor o linguista revisa, reduciendo el tiempo de anotacion MQM en los cinco dialectos cubiertos.
- Analisis contrastivo de dialectos: comparar la distribucion de categorias de error por direccion (`ENG_EGY`, `ENG_MAU`, `ENG_MOR`, `ENG_PAL`, `ENG_UAE`) permite identificar que fenomenos linguisticos cuestan mas a un sistema de traduccion en cada variedad.
- Investigacion en tratamiento del arabe dialectal: el checkpoint sirve como linea base reproducible para experimentos de deteccion de errores, dado que el repositorio incluye el script de inferencia y los umbrales por dialecto.
- Post-edicion asistida: los spans devueltos con offsets de caracter se pueden resaltar en un editor para que el revisor intervenga solo en los fragmentos marcados.

## Benchmarks y rendimiento

La metrica Overall se define como (F1 de solapamiento de spans + F1 de categoria) / 2, en porcentaje, con medias macro sobre direcciones en la metrica oficial de Codabench. La metrica de desarrollo es una aproximacion propia (F1 de solapamiento a nivel de caracter + micro-F1 de categoria) y no es directamente comparable con la oficial.

| Split | Overall | Overlap F1 | Category micro-F1 | Notas |
|---|---:|---:|---:|---|
| Test oficial, ejecucion original de esta configuracion (articulo) | 42,00 | no disponible | no disponible | Puntuado por los organizadores tras el periodo de evaluacion |
| Dev (138 frases, scorer propio), este checkpoint | 38,5 | 48,1 | 28,9 | Medido sobre el checkpoint publicado |
| Dev, ejecucion original (referencia en la model card) | no disponible | no disponible | no disponible | La ejecucion original obtuvo 40,1 en dev |

Nota de reproducibilidad recogida en la model card: los pesos de la ejecucion que obtuvo 42,00 no se conservaron. Este checkpoint es un reentrenamiento con la misma configuracion, semilla y umbrales, pero no es bit a bit identico por no determinismo de la GPU. Sus predicciones coinciden con las de la ejecucion puntuada en 138 de 145 frases del test (F1 de span y categoria a nivel de caracter de 0,95 entre ambas). No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval o GSM8K, que no aplican a esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GB en FP32 y 0,4 GB en FP16 para los pesos, mas el consumo de activaciones y del tokenizer; en la practica, menos de 2 GB en FP16 para lotes pequenos.
- Cabe sin problema en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y cualquier GPU con 4 GB o mas de VRAM. Tambien es viable en CPU para inferencia por lotes con throughput moderado.
- GPU de datacenter (A100, H100, L40S) recomendadas solo si se necesita procesar volumenes muy altos de frases o reentrenar el modelo, no por requisitos de memoria.
- Opciones de despliegue: `transformers` con `AutoModelForTokenClassification` es la via directa; el script `inference.py` del repositorio implementa el decodificador de spans y el modo por lotes sobre JSONL. Al ser un modelo de clasificacion de tokens, no es el caso de uso tipico de vLLM o llama.cpp; TGI y ONNX Runtime son alternativas razonables para servir el modelo en produccion.
- Latencia y throughput estimados: no disponible en la informacion proporcionada. Con 162 millones de parametros y secuencias truncadas a 192 tokens subpalabra, la inferencia por frase es del orden de milisegundos en GPU moderna, pero no se publican mediciones.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de otros sistemas comparables en la informacion proporcionada, mas alla de la comparacion interna entre los dos checkpoints del mismo autor. La tabla recoge esa comparacion directa.

| Modelo | Parametros | Contexto | Overall oficial (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`...alexandriax2026-nocollapse`) | 162.256.135 | truncado a 192 tokens subpalabra en entrenamiento | 42,00 en la ejecucion original de esta configuracion; 38,5 en dev para este checkpoint | cc-by-4.0 | HuggingFace, safetensors |
| `alighabusaleh/marbertv2-arabic-dialect-mt-error-span-detection-alexandriax2026` (envio oficial) | no disponible en la informacion, mismo backbone MARBERTv2 | no disponible | 40,91 (posicion 3 del ranking) | cc-by-4.0 | HuggingFace |
| Otros sistemas participantes en AlexandriaX-2026 Subtask 3 | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La model card senala explicitamente que los datos de entrenamiento son "tiny, imbalanced" (el texto de la seccion de limitaciones aparece truncado en la informacion disponible), lo que condiciona la generalizacion del modelo.
- Los umbrales de decodificacion estan calibrados por direccion dialectal. Para una direccion no vista se aplica tau = 0,4, lo que puede producir un comportamiento de marcado poco ajustado en variedades no cubiertas.
- El modelo trunca las secuencias a 192 tokens subpalabra, de modo que las traducciones largas pierden la parte final y no pueden evaluarse por completo en una sola pasada.
- Solo procesa la hipotesis en arabe; la frase fuente en ingles no es una entrada del modelo, por lo que no puede detectar errores que requieran comparar con la fuente mas alla de lo aprendido durante el afinado.
- El F1 de categoria en dev es bajo (28,9 de micro-F1), lo que indica que la asignacion de la categoria LQM concreta es bastante menos fiable que la deteccion del span.
- Riesgo de alucinacion de spans: al ser un clasificador de tokens con umbral sobre `1 - P(O)`, un umbral mal ajustado puede generar falsos positivos en texto correcto o pasar por alto errores reales.
- Los pesos publicados no son identicos a los de la ejecucion puntuada con 42,00; la propia model card advierte de que la puntuacion de test esperada sera cercana, pero no garantiza que iguale ese valor.
- Sesgos conocidos: no se documentan en la informacion disponible. Cabe esperar el sesgo derivado de un conjunto de entrenamiento pequeno y desequilibrado por direccion dialectal.
- La licencia cc-by-4.0 permite uso comercial siempre que se atribuya la autoria; no se declaran restricciones adicionales.
- El modelo esta pensado para evaluacion de calidad, no para generar ni corregir traducciones por si mismo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alighabusaleh/marbertv2-arabic-dialect-mt-error-span-detection-alexandriax2026-nocollapse
- Checkpoint del envio oficial (posicion 3, 40,91): https://huggingface.co/alighabusaleh/marbertv2-arabic-dialect-mt-error-span-detection-alexandriax2026
- Modelo base MARBERTv2: https://huggingface.co/UBC-NLP/MARBERTv2
- Dataset AlexandriaX Subtask 3: https://huggingface.co/datasets/UBC-NLP/AlexandriaX_Subtask_3
- Codigo del sistema: https://github.com/aliabusaleh/arabic-dialectal-mt-error-span-detection
- Campana AlexandriaX-2026: https://alexandriax.dlnlp.ai/
- Articulo de referencia: Abusaleh, Verma y Mehler, "TTLab at AlexandriaX-2026: A Fine-Tuned Surface Tagger for Arabic Machine-Translation Error-Span Detection and Classification", ArabicNLP 2026 (enlace directo no disponible en la informacion proporcionada)
