# chaouin/qfrblima-camembert

## Resumen

QFrBLiMa — CamemBERT es un clasificador supervisado de variantes regionales del frances, desarrollado por el autor chaouin, que distingue entre frances metropolitano (MFr) y frances de Quebec (QFr). Se obtiene mediante fine-tuning del modelo base CamemBERT (almanach/camembert-base-legacy), un transformer encoder de tipo RoBERTa adaptado al frances, con 110,6 millones de parametros. El modelo resuelve una tarea concreta de clasificacion de texto binaria: asignar a una frase una puntuacion de probabilidad de pertenencia a la variante quebequesa.

El modelo forma parte del benchmark QFrBLiMa, un conjunto de evaluacion contrastiva de marcadores linguisticos regionales, y es uno de los cinco clasificadores encoder evaluados en dicho benchmark. Su relevancia actual radica en que aborda un problema poco cubierto por los modelos multilingues genericos: la identificacion fina de variedades dialectales del frances, con utilidad en investigacion linguistica, analisis de corpus y estudios de variacion.

Arquitectura transformer encoder (familia CamemBERT/RoBERTa), contexto de 128 tokens en el entrenamiento y la evaluacion, licencia MIT y pesos en safetensors. El checkpoint se selecciono por macro-F1 de validacion en la epoca 3, y el benchmark QFrBLiMa se reservo exclusivamente para evaluacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (CamemBERT, basado en RoBERTa) |
| Parametros totales | 110.623.490 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (longitud maxima de secuencia en entrenamiento y evaluacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | fr (frances, con distincion MFr/QFr) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de la familia CamemBERT, inicializado desde almanach/camembert-base-legacy y adaptado a clasificacion de secuencias con dos clases de salida (0 = frances metropolitano, 1 = frances de Quebec). El fine-tuning se realizo sobre un corpus supervisado separado de 938.484 ejemplos, dividido en 751.288 de entrenamiento, 93.768 de validacion y 93.428 de test, balanceado por variedad dentro de seis generos y en cada particion. Se emplearon tres epocas, tamano de lote efectivo de 32, tasa de aprendizaje de 2e-5, longitud maxima de secuencia de 128 y semilla 42; el checkpoint de la epoca 3 se selecciono por macro-F1 de validacion.

El benchmark QFrBLiMa se uso unicamente para evaluacion externa, nunca para entrenamiento ni seleccion de checkpoint. El corpus supervisado y sus divisiones no se redistribuyen publicamente, siguiendo a Khan et al. (2026); la documentacion de procedencia y restricciones esta en el repositorio de GitHub. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa, propias de modelos generativos y no aplicables a este clasificador.

## Capacidades

- Clasificacion binaria de variante regional del frances: asigna una puntuacion softmax de clase 1 (QFr) frente a clase 0 (MFr).
- Evaluacion contrastiva por pares: dada una pareja de frases equivalentes, una en MFr y otra en QFr, el par se considera correcto si la frase QFr obtiene una puntuacion de clase 1 estrictamente mayor.
- Procesamiento de textos cortos de hasta 128 tokens.
- Integracion con la libreria transformers (AutoTokenizer y AutoModelForSequenceClassification) y con text-embeddings-inference / endpoints compatibles.
- No soporta generacion de texto, tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.
- Capacidad multilingue limitada al frances; no cubre otras lenguas ni otras variedades del frances fuera de MFr y QFr.
- No dispone de modo thinking ni de capacidades especiales adicionales.

## Casos de uso

- Investigacion en variacion linguistica: clasificar corpus de texto frances para cuantificar la presencia de marcadores quebequeses frente a metropolitanos, usando la puntuacion de clase 1 como medida continua.
- Construccion y validacion de benchmarks dialectales: emplear el modelo como uno de los clasificadores de referencia en evaluaciones contrastivas de pares MFr/QFr, tal como se hizo en QFrBLiMa.
- Filtrado y anotacion de corpus: preetiquetar grandes volumenes de frases francesas por variedad regional antes de una revision humana, con la advertencia de que las etiquetas de origen son proxies imperfectos.
- Analisis de medios y redes sociales: detectar sesgos de variedad en textos periodisticos o publicaciones, siempre como senal auxiliar y no como inferencia de origen de personas.
- Estudios de traduccion y localizacion: comprobar si una adaptacion al frances de Quebec conserva marcadores regionales respecto a la version metropolitana.
- Docencia y materiales de frances como lengua extranjera: generar ejemplos contrastivos y verificar la coherencia regional de ejercicios, dado el bajo coste computacional del modelo (110 M de parametros).
- Evaluacion de sistemas de traduccion automatica: medir si las salidas en frances se inclinan hacia una variedad concreta mediante la puntuacion del clasificador.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---:|
| Macro-F1 en test interno | 97,56 % |
| Precision por frase en QFrBLiMa | 59,38 % |
| Macro-F1 por frase en QFrBLiMa | 59,20 % |
| Precision estricta por pares en QFrBLiMa | 72,45 % |
| Intervalo de confianza al 95 % (precision por pares) | 67,97 % – 76,68 % |

La evaluacion externa cubre 1.205 pares contrastivos, 241 marcadores y cinco contextos por marcador. La clasificacion por frase usa umbral de 0,5 y el intervalo de confianza se calcula con 20.000 replicas bootstrap agrupadas por marcador linguistico. No se han publicado resultados comparativos frente a los otros cuatro clasificadores del benchmark en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 (110 M de parametros) y menos de 0,3 GB en fp16; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU con latencia aceptable para lotes pequenos. Cualquier GPU consumer (GTX 1060 en adelante, RTX 3060, RTX 4090) es suficiente.
- Despliegue: transformers, text-embeddings-inference, endpoints compatibles y servidores de inferencia estandar para modelos encoder; tambien es viable la conversion a ONNX.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera un throughput alto en GPU y moderado en CPU.
- Tamano del repositorio: 0,4 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chaouin/qfrblima-camembert | 110,6 M | 128 tokens | Clasificacion MFr/QFr | MIT | Hugging Face |
| camembert/camembert-base (base) | ~110 M | 512 tokens | Modelo de lenguaje enmascarado | MIT | Hugging Face |
| Otros clasificadores de QFrBLiMa | no disponible | no disponible | Clasificacion MFr/QFr | no disponible | no disponible |

El modelo base CamemBERT no realiza clasificacion regional por si mismo; requiere fine-tuning. Los otros cuatro clasificadores evaluados en QFrBLiMa no se detallan en la informacion disponible, por lo que no es posible una comparacion cuantitativa.

## Limitaciones y advertencias

- El modelo esta destinado a investigacion sobre reconocimiento linguistico regional, no a inferir el origen o la identidad de una persona.
- Las etiquetas de entrenamiento basadas en la fuente son proxies imperfectos del uso linguistico; ninguna variedad implica un uso geografico exclusivo.
- Las puntuaciones softmax no estan calibradas; no deben interpretarse como probabilidades calibradas.
- La precision por frase en el benchmark externo es del 59,38 %, muy inferior al 97,56 % del test interno, lo que indica problemas de generalizacion fuera del dominio de entrenamiento.
- La longitud de contexto esta limitada a 128 tokens, insuficiente para documentos largos.
- Solo cubre frances (MFr y QFr); no soporta otras lenguas ni otras variedades del frances.
- El corpus supervisado no se redistribuye y la reconstruccion exacta del mismo no esta verificada, lo que limita la reproducibilidad.
- Riesgo de alucinacion no aplica en sentido generativo, pero si existe riesgo de clasificaciones erroneas en textos ambiguos o marcadores poco representados.
- Licencia MIT: permite uso comercial, pero el uso responsable queda condicionado por las advertencias eticas del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chaouin/qfrblima-camembert
- Dataset QFrBLiMa: https://huggingface.co/datasets/chaouin/qfrblima
- Repositorio GitHub (codigo y resultados): https://github.com/chaouin/QFrBLiMa
- Resultados de encoders: https://github.com/chaouin/QFrBLiMa/tree/main/results/encoders
- Documentacion del corpus de entrenamiento: https://github.com/chaouin/QFrBLiMa/tree/main/data/training_corpus
- Modelo base CamemBERT: https://huggingface.co/almanach/camembert-base
- Referencia Khan et al. (2026): https://aclanthology.org/2026.lrec-1.840/
