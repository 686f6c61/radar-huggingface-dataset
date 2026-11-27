# ronke21/HEntailment-xlm-roberta-xl

## Resumen

HEntailment-xlm-roberta-xl es un modelo de clasificación de texto desarrollado por el autor ronke21 (Ron Keinan, en el contexto del trabajo con Reut Tsarfaty) para la tarea de inferencia de lenguaje natural (NLI) en hebreo. Se construye mediante ajuste fino completo de facebook/xlm-roberta-xl, un transformer encoder multilingüe de gran tamaño, sobre el conjunto de datos HEntailment, que agrega cinco fuentes de datos y suma 15.000 filas equilibradas por clase. El modelo resuelve la clasificación de pares (premisa, hipótesis) en tres etiquetas: implicación, contradicción y neutralidad.

La relevancia del modelo radica en que aborda NLI en hebreo, un idioma con recursos limitados en comparación con el inglés, y lo hace con un encoder multilingüe de gran capacidad. Con 3.482.493.443 parámetros, es un modelo considerable para una tarea de clasificación, lo que permite capturar matices semánticos finos del hebreo. Los resultados publicados muestran un rendimiento muy alto en conjuntos de datos nativos del hebreo (macro-F1 de 0,980 en HeQ y 0,961 en Hebrew-Paraphrase), aunque con una caída notable en conjuntos traducidos (0,421 en HebNLI y 0,324 en LCHAIM).

El modelo se publica bajo licencia Apache 2.0, lo que facilita su uso comercial, y está disponible en formato safetensors con un tamaño de repositorio de 14,0 GB. Está pensado para integrarse en pipelines de clasificación de texto mediante la librería Transformers, con una API estándar de `AutoModelForSequenceClassification`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa XL) con cabeza de clasificación |
| Parametros totales | 3.482.493.443 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Hebreo (he) para la tarea; modelo base multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en facebook/xlm-roberta-xl, un transformer encoder de tipo XLM-RoBERTa en su variante XL, que emplea atención multi-cabeza estándar y está preentrenado de forma multilingüe. Sobre esta base se realiza un ajuste fino completo (full fine-tuning) añadiendo una cabeza de clasificación para tres clases. La configuración de entrenamiento reportada es: learning rate 2e-5, tamaño de lote 32, hasta 20 épocas, selección del mejor checkpoint según macro-F1 en el conjunto de desarrollo y semilla 42. La entrada es el par (premisa, hipótesis) codificado como par de frases, con etiquetas 0 para implicación, 1 para contradicción y 2 para neutralidad.

El conjunto de entrenamiento, HEntailment, agrega cinco fuentes y suma 15.000 filas equilibradas por clase. El modelo card indica que se entrenó con todas las fuentes agrupadas. No se mencionan innovaciones técnicas adicionales como decodificación especulativa o atención lineal; se trata de un ajuste fino convencional de un encoder para clasificación. El trabajo asociado se publica en EACL 2027 con el título "Lost in Translation, Found in Other Benchmarks: Cross-Task Transfer for Natural Language Inference".

## Capacidades

- Clasificación de inferencia de lenguaje natural (NLI) en hebreo con tres etiquetas: implicación, contradicción y neutralidad.
- Procesamiento de pares de frases (premisa, hipótesis) mediante la API de pares de secuencias de Transformers.
- Capacidad multilingüe heredada del modelo base XLM-RoBERTa XL, aunque el ajuste fino está orientado al hebreo.
- No se documentan capacidades de generación de texto, razonamiento generativo, código, matemáticas, visión, audio, tool calling ni agentes; es un modelo exclusivamente de clasificación.
- No se documenta un modo de razonamiento (thinking mode) ni capacidades de razonamiento multi-paso.

## Casos de uso

- Detección de contradicciones en atención al cliente: el modelo puede comparar una afirmación del cliente con la información registrada en la base de conocimiento para detectar inconsistencias, gracias a su clasificación de tres vías y a su buen rendimiento en conjuntos nativos de hebreo.
- Verificación de hechos en hebreo: dado un par (afirmación, evidencia), el modelo clasifica si la evidencia implica, contradice o es neutral respecto a la afirmación, lo que permite construir pipelines de fact-checking automatizado.
- Filtrado de paráfrasis y duplicados: con un macro-F1 de 0,961 en Hebrew-Paraphrase, puede emplearse para detectar reformulaciones o duplicados semánticos en corpus hebreos.
- Evaluación de resúmenes: con un rendimiento de 0,884 en HeSum y 0,837 en HebSummaries, puede usarse para comprobar si un resumen está respaldado por el texto original (entailment) o lo contradice.
- Enrutamiento de consultas en sistemas de preguntas y respuestas: clasificar si una respuesta candidata implica la pregunta o es contradictoria, útil en sistemas de QA sobre documentos en hebreo.
- Anotación asistida de corpus NLI: el modelo puede preetiquetar pares de frases para acelerar la creación de conjuntos de datos de inferencia en hebreo, con revisión humana posterior.
- Moderación de contenido basada en consistencia: comparar mensajes con políticas o declaraciones previas para detectar contradicciones flagrantes en foros o redes en hebreo.

## Benchmarks y rendimiento

Resultados de macro-F1 en el conjunto de test, según la model card:

| Conjunto de test | Este modelo (semilla 42) | Artículo: media ± desviación típica (semillas 42/43/44) |
|---|---:|---:|
| HeQ | 0,980 | 0,976 ± 0,001 |
| QASem | 0,918 | 0,913 ± 0,009 |
| HeSum | 0,884 | 0,882 ± 0,002 |
| HebSummaries | 0,837 | 0,832 ± 0,006 |
| Hebrew-Paraphrase | 0,961 | 0,959 ± 0,004 |
| HebNLI (traducido) | 0,421 | 0,462 ± 0,042 |
| LCHAIM (traducido) | 0,324 | 0,326 ± 0,011 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que el modelo está especializado en NLI y no en tareas generativas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3.482 millones de parámetros en precisión FP32, el modelo requiere aproximadamente 13,9 GB solo para los pesos; en FP16/BF16, unos 7,0 GB; en cuantización de 8 bits, unos 3,5 GB; en 4 bits, unos 1,8 GB (estimaciones teóricas, no confirmadas en la información proporcionada).
- GPU recomendadas: para FP16 se recomienda una GPU con al menos 16 GB de VRAM, como A100, H100, RTX 4090 o RTX A6000. Para FP32 se necesitan al menos 16-24 GB.
- ¿Cabe en GPU de consumo? En FP16 cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB); en cuantización de 8 o 4 bits podría caber en GPUs con 8-12 GB, aunque no se documentan cuantizaciones oficiales.
- Opciones de despliegue: Transformers con PyTorch (según el ejemplo de la model card); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y al ser un encoder de clasificación no es el caso de uso típico de estos motores generativos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de NLI en hebreo en la información proporcionada. Se puede comparar con su modelo base:

| Modelo | Parámetros | Contexto | Tarea | Licencia |
|---|---:|---|---|---|
| HEntailment-xlm-roberta-xl | 3.482.493.443 | No disponible | NLI hebreo (3 clases) | Apache 2.0 |
| facebook/xlm-roberta-xl (base) | No disponible en la información | No disponible | Modelo multilingüe preentrenado | No disponible en la información |

No se dispone de datos de rendimiento de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento bajo en conjuntos traducidos: macro-F1 de 0,421 en HebNLI y 0,324 en LCHAIM, lo que indica poca robustez ante datos traducidos automáticamente y posible sensibilidad al dominio y al estilo.
- Especialización estrecha: solo realiza clasificación NLI de tres clases en hebreo; no genera texto ni resuelve otras tareas sin ajuste adicional.
- Riesgo de alucinación no aplica directamente al ser un clasificador, pero sí existe riesgo de clasificaciones erróneas en dominios alejados de los datos de entrenamiento.
- Sesgos: no se documentan sesgos específicos en la información proporcionada; al entrenarse con cinco fuentes concretas, puede heredar los sesgos de esos corpus.
- Limitaciones de contexto: la longitud máxima de contexto no se especifica en la información proporcionada; el ejemplo de uso emplea `truncation=True`, lo que sugiere que secuencias largas se truncan.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la model card indica que también se aplica la licencia del modelo base, por lo que conviene verificar la licencia de facebook/xlm-roberta-xl.
- Para producción: conviene validar el rendimiento en el dominio concreto, dado el bajo rendimiento observado en conjuntos traducidos, y considerar el coste computacional de un modelo de 3.500 millones de parámetros para una tarea de clasificación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ronke21/HEntailment-xlm-roberta-xl
- Modelo base: https://huggingface.co/facebook/xlm-roberta-xl
- Conjunto de datos: https://huggingface.co/datasets/ronke21/HEntailment
- Artículo asociado (EACL 2027): "Lost in Translation, Found in Other Benchmarks: Cross-Task Transfer for Natural Language Inference", Keinan, Ron y Tsarfaty, Reut. No se dispone de URL en la información proporcionada.
