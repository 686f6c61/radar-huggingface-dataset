# adeshkin/labse-kjh-ru-mnrl-1

## Resumen

El modelo `adeshkin/labse-kjh-ru-mnrl-1` es un *sentence transformer* desarrollado por adeshkin, obtenido mediante fine-tuning del modelo multilingüe LaBSE sobre un corpus paralelo khakas-ruso. Su objetivo principal es generar representaciones vectoriales densas de 768 dimensiones para frases y párrafos en khakas (kjh) y ruso (ru), permitiendo tareas de similitud semántica y recuperación de información entre ambos idiomas. Es relevante porque el khakas es una lengua minoritaria con escasos recursos digitales, y este modelo proporciona una herramienta práctica para aplicaciones de procesamiento de lenguaje natural en ese idioma.

La arquitectura se basa en un transformer BERT con 470,9 millones de parámetros, una longitud de contexto máxima de 256 tokens y una salida de 768 dimensiones. El entrenamiento se realizó con la función de pérdida MultipleNegativesRankingLoss sobre un conjunto de 157.620 pares de frases paralelas, lo que optimiza la alineación semántica entre ambos idiomas. El modelo está disponible en formato safetensors y se integra fácilmente con la librería sentence-transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (LaBSE) con pooling CLS y capa densa con activación tanh |
| Parametros totales | 470.926.848 |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | khakas (kjh), ruso (ru) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `sentence-transformers/LaBSE`, un transformer BERT multilingüe preentrenado con 109 idiomas. El fine-tuning se realizó sobre el dataset `adeshkin/khakas-russian-parallel-corpus`, que contiene 157.620 pares de frases paralelas khakas-ruso. La función de pérdida empleada fue MultipleNegativesRankingLoss, que maximiza la similitud coseno entre pares positivos y la minimiza frente a ejemplos negativos dentro del lote. La arquitectura final incluye un pooling de tipo CLS, seguido de una capa densa de 768 a 768 con activación tanh y una normalización L2. No se han documentado innovaciones técnicas adicionales más allá del fine-tuning supervisado.

## Capacidades

- Generación de embeddings de frases y párrafos en khakas y ruso, con salida de 768 dimensiones.
- Similitud semántica entre frases de ambos idiomas mediante similitud coseno.
- Recuperación de información bilingüe: dado un texto en un idioma, encontrar el equivalente semántico en el otro.
- Evaluación de traducción a nivel de frase: el modelo fue evaluado con un TranslationEvaluator, alcanzando una precisión media del 95,29 % en el dataset de prueba.
- Integración nativa con sentence-transformers, lo que facilita su uso en pipelines de búsqueda y clasificación.
- No soporta tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo de embeddings.

## Casos de uso

- Recuperación de información en khakas: permite buscar documentos en khakas a partir de consultas en ruso y viceversa, útil para bibliotecas digitales o archivos históricos de la región de Jakasia.
- Traducción asistida por similitud: en herramientas de traducción humana, el modelo puede sugerir frases equivalentes en el otro idioma a partir de un fragmento dado, acelerando el trabajo de traductores.
- Sistemas de preguntas y respuestas bilingües: al codificar preguntas y respuestas en ambos idiomas, se pueden emparejar preguntas en ruso con respuestas en khakas o al revés, para aplicaciones educativas o de consulta.
- Clasificación de documentos por similitud temática: agrupar textos en khakas y ruso según su contenido semántico, por ejemplo en la organización de corpus periodísticos o literarios.
- Búsqueda semántica en motores de recomendación: para plataformas que ofrecen contenido en khakas (noticias, literatura), el modelo permite recomendar ítems relacionados basándose en la similitud de embeddings.
- Evaluación de calidad de traducciones automáticas: comparando la similitud coseno entre una traducción generada y una referencia, se puede obtener una métrica aproximada de fidelidad semántica.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el model-index, evaluados con un TranslationEvaluator sobre el dataset `kjh-ru-random`:

| Metrica | Valor |
|---|---|
| Src2Trg Accuracy | 0,9548 |
| Trg2Src Accuracy | 0,9510 |
| Mean Accuracy | 0,9529 |

Estos valores indican que el modelo acierta en aproximadamente el 95 % de los pares de frases al recuperar la traducción correcta entre khakas y ruso. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, ya que no es un modelo generativo sino de embeddings.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo BERT de 470 millones de parámetros, la inferencia en precisión FP32 requiere aproximadamente 1,9 GB de memoria (tamaño del repositorio). Con cuantización a FP16 o int8, el consumo se reduce a unos 0,95 GB y 0,5 GB respectivamente, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar el modelo en FP32. Tarjetas como NVIDIA GTX 1060 6GB, RTX 2060, RTX 3060 o superiores son suficientes. Para procesamiento por lotes grande, se recomienda una GPU con 8 GB o más.
- Sí cabe en GPUs de consumo: una RTX 3060 o similar puede manejar el modelo sin problemas.
- Opciones de despliegue: al ser un modelo sentence-transformers, se puede servir con la librería oficial, con el servidor de embeddings de Hugging Face (text-embeddings-inference) o mediante frameworks como ONNX Runtime si se exporta. También es compatible con endpoints de Hugging Face.
- Latencia y throughput: no se han publicado datos específicos. En una GPU moderna, la codificación de una frase típica (menos de 256 tokens) suele tardar entre 5 y 20 ms, dependiendo del hardware y del tamaño del lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| adeshkin/labse-kjh-ru-mnrl-1 | 470,9 M | 256 | kjh, ru | no disponible | Hugging Face |
| sentence-transformers/LaBSE | 470,9 M | 256 | 109 | Apache 2.0 | Hugging Face |
| intfloat/multilingual-e5-large | 560 M | 512 | 100+ | MIT | Hugging Face |

La comparativa se limita a modelos multilingües de tamaño similar. LaBSE es el modelo base y no está especializado en khakas, por lo que su rendimiento en ese idioma es previsiblemente inferior. `multilingual-e5-large` cubre más idiomas y tiene mayor contexto, pero no está optimizado específicamente para el par khakas-ruso. No se dispone de datos de rendimiento comparativo en el mismo corpus.

## Limitaciones y advertencias

- La licencia no está especificada, lo que genera incertidumbre sobre el uso comercial. Se recomienda contactar al autor antes de utilizarlo en producción.
- El contexto máximo es de 256 tokens, insuficiente para documentos largos; para textos extensos es necesario dividirlos en fragmentos.
- Solo cubre dos idiomas (khakas y ruso); no es útil para otros idiomas sin fine-tuning adicional.
- El corpus de entrenamiento es relativamente pequeño (157.620 pares), lo que puede limitar la generalización a dominios muy específicos o a variantes dialectales del khakas.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos paralelos, puede reflejar sesgos presentes en el corpus fuente (por ejemplo, temáticas limitadas o registro formal).
- Riesgo de alucinación no aplica directamente, ya que no genera texto, pero sí puede producir embeddings poco fiables para frases fuera del dominio de entrenamiento.
- No se han publicado cuantizaciones oficiales, por lo que el despliegue en entornos con memoria muy limitada requeriría conversión manual.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/adeshkin/labse-kjh-ru-mnrl-1)
- [Dataset de entrenamiento](https://huggingface.co/datasets/adeshkin/khakas-russian-parallel-corpus)
- [Repositorio de entrenamiento en GitHub](https://github.com/adeshkin/khakas-emb)
- [Modelo base LaBSE](https://huggingface.co/sentence-transformers/LaBSE)
- [Documentación de sentence-transformers](https://sbert.net)
