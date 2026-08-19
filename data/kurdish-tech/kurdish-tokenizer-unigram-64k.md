# kurdish-tech/kurdish-tokenizer-unigram-64k

## Resumen

El modelo `kurdish-tech/kurdish-tokenizer-unigram-64k` es un tokenizador de tipo Unigram (estilo SentencePiece) con un vocabulario de 64 000 entradas, desarrollado por la organización comunitaria Kurdish-Tech. Su propósito es cubrir las tres variedades principales del kurdo en un único vocabulario: Kurmancî (escritura latina), Soranî (escritura árabe) y Zazakî (escritura latina). Está entrenado sobre el corpus `KurdishCorpus-clean` y evaluado con textos reservados que no formaron parte del entrenamiento.

Este tokenizador resulta relevante porque aborda un problema crítico en el procesamiento de lenguas de bajos recursos: la ausencia de tokenizadores específicos que reduzcan la fragmentación del texto. Según los datos publicados, consigue la mejor fertilidad (tokens por palabra) en Soranî y Zazakî de entre las cuatro variantes de tokenizadores kurdo entrenados por el mismo equipo, superando incluso a NLLB-200 en Soranî. No se trata de un modelo de lenguaje completo, sino de un componente de preprocesamiento pensado para integrarse en pipelines de generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Unigram (SentencePiece) |
| Parametros totales | no disponible (tokenizador, sin pesos de modelo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | `model_max_length` = 1024 |
| Tipos de cuantizacion | no disponible (no es un modelo de pesos) |
| Idiomas soportados | Kurmancî (kmr), Soranî (ckb), Zazakî (diq), kurdo genérico (ku) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | no aplica (archivo de tokenizador de transformers, compatible con SentencePiece) |

## Arquitectura y entrenamiento

El tokenizador emplea el algoritmo Unigram, implementado mediante SentencePiece. Este método construye un vocabulario de subpalabras basado en un modelo de lenguaje unigram sobre los segmentos candidatos, seleccionando las piezas que maximizan la verosimilitud del corpus de entrenamiento. A diferencia de BPE, Unigram permite múltiples segmentaciones y elige la más probable durante la codificación.

El entrenamiento se realizó sobre una muestra de 800 000 líneas del corpus `KurdishCorpus-clean`, con una sobrerrepresentación deliberada de Soranî y Zazakî respecto a su proporción en el corpus completo. La distribución exacta fue: 520 000 líneas de Kurmancî (68,3 %), 224 000 de Soranî (29,4 %) y 17 309 de Zazakî (2,3 %). El vocabulario final contiene 64 000 entradas e incluye los tokens especiales `<bos>`, `<eos>`, `<unk>`, `<pad>` y `<mask>`. La evaluación de fertilidad se hizo sobre documentos reservados (300 por dialecto, 166 para Zazakî por falta de más ejemplos que cumplieran el umbral de calidad), truncados a 2000 caracteres y codificados sin tokens especiales.

## Capacidades

- Tokenización de las tres variedades principales del kurdo en un solo vocabulario: Kurmancî, Soranî y Zazakî.
- Soporte de escritura latina (Kurmancî, Zazakî) y árabe (Soranî) dentro del mismo tokenizador.
- Fertilidad notablemente baja en Soranî: 1,633 tokens por palabra, el mejor resultado entre todos los tokenizadores comparados, incluido NLLB-200 (2,336).
- En Kurmancî, 1,385 tokens por palabra, solo superado por la variante BPE de 64k del mismo equipo (1,342).
- Integración estándar con la librería `transformers` mediante `AutoTokenizer.from_pretrained`.
- Añade automáticamente los tokens `<bos>` y `<eos>` al codificar.
- Compatible con pipelines de generación de texto (etiqueta `pipeline_tag: text-generation`).

## Casos de uso

- Pretraining de modelos de lenguaje causales en kurdo: al reducir la fragmentación en Soranî y Zazakî, permite que un modelo LM entrenado desde cero procese más texto por secuencia y requiera menos parámetros de embedding para el mismo vocabulario.
- Fine-tuning de modelos multilingües existentes: sustituir el tokenizador original por este puede mejorar la eficiencia al representar texto kurdo con menos tokens, especialmente en tareas de generación.
- Sistemas de traducción automática kurdo ↔ otras lenguas: un tokenizador específico reduce la tasa de tokens desconocidos y mejora la alineación entre segmentos en corpus paralelos.
- Herramientas de análisis lingüístico: tareas de etiquetado morfosintáctico o lematización pueden beneficiarse de una segmentación coherente entre dialectos.
- Asistentes de escritura y correctores ortográficos: al tokenizar correctamente las variantes latina y árabe, facilita el desarrollo de autocompletado y revisión gramatical.
- Aplicaciones de voz a texto y texto a voz: la tokenización estable es un prerrequisito para entrenar modelos acústicos o de síntesis con datos kurdo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de modelos de lenguaje (MMLU, HumanEval, GSM8K, etc.) porque este repositorio contiene únicamente un tokenizador, no un modelo con pesos. En su lugar, la model card ofrece métricas de fertilidad (tokens por palabra, menor es mejor) medidas sobre documentos reservados:

| Tokenizador | Kurmancî | Soranî | Zazakî |
|---|---:|---:|---:|
| kurdish-bpe-64k | **1.342** | 1.793 | 2.408 |
| **kurdish-unigram-64k** (este modelo) | 1.385 | **1.633** | **2.290** |
| kurdish-bpe-32k | 1.427 | 1.974 | 2.701 |
| kurdish-unigram-32k | 1.472 | 1.843 | 2.580 |
| NLLB-200 (`distilled-600M`) | 1.930 | 2.336 | 2.548 |
| XLM-RoBERTa (`base`) | 1.751 | 3.695 | 2.527 |
| `o200k_base` (GPT-4o) | 2.361 | 3.984 | 2.732 |
| `cl100k_base` (GPT-4) | 2.610 | 6.938 | 3.038 |

Frente a `cl100k_base`, este tokenizador necesita 1,9 veces menos tokens para Kurmancî y 4,2 veces menos para Soranî. La cifra de Zazakî se basa en solo 166 documentos y es la menos robusta de las tres.

## Requisitos de hardware

- Un tokenizador no requiere GPU ni VRAM; se ejecuta íntegramente en CPU.
- Memoria RAM estimada: inferior a 100 MB para cargar el vocabulario de 64 000 entradas.
- Cualquier máquina con Python y la librería `transformers` instalada es suficiente.
- No aplican opciones de despliegue como vLLM, llama.cpp u Ollama, ya que no hay pesos de modelo que servir.
- La latencia de tokenización es del orden de microsegundos por frase en CPU moderna.

## Comparativa con modelos similares

La comparativa se establece con otros tokenizadores kurdo del mismo equipo y con tokenizadores multilingües de propósito general:

| Tokenizador | Vocabulario | Algoritmo | Fert. Kurmancî | Fert. Soranî | Fert. Zazakî | Licencia |
|---|---|---|---:|---:|---:|---|
| **kurdish-unigram-64k** (este) | 64 000 | Unigram | 1.385 | **1.633** | **2.290** | CC BY-SA 4.0 |
| kurdish-bpe-64k | 64 000 | BPE | **1.342** | 1.793 | 2.408 | CC BY-SA 4.0 |
| kurdish-unigram-32k | 32 000 | Unigram | 1.472 | 1.843 | 2.580 | CC BY-SA 4.0 |
| kurdish-bpe-32k | 32 000 | BPE | 1.427 | 1.974 | 2.701 | CC BY-SA 4.0 |
| NLLB-200 (distilled-600M) | 256 000 | BPE | 1.930 | 2.336 | 2.548 | CC BY-NC 4.0 (NLLB) |
| XLM-RoBERTa (base) | 250 000 | Unigram | 1.751 | 3.695 | 2.527 | MIT (modelo) |

El tokenizador Unigram de 64k es la mejor opción si la prioridad es Soranî o Zazakî. Para cargas de trabajo centradas en Kurmancî, la variante BPE de 64k es marginalmente superior y más convencional para arquitecturas Llama/GPT/Mistral.

## Limitaciones y advertencias

- Es un tokenizador, no un modelo de lenguaje: no genera texto por sí mismo y no puede usarse como sustituto de un LM.
- La métrica de fertilidad es una comparación relativa sobre una muestra reservada, no una evaluación exhaustiva de calidad downstream.
- La cifra de Zazakî se basa en solo 166 documentos, por lo que es la menos fiable de las tres.
- Una menor fertilidad no garantiza por sí misma un mejor rendimiento del modelo final; depende también de la arquitectura y del entrenamiento.
- La licencia CC BY-SA 4.0 implica que cualquier obra derivada que utilice este tokenizador debe compartirse bajo la misma licencia, lo que puede no ser adecuado para proyectos de código cerrado.
- El `model_max_length` está fijado en 1024, lo que limita el contexto máximo si se usa directamente como tokenizador de un modelo; habría que ajustarlo si se integra en un LM con ventana mayor.
- No se proporcionan datos sobre sesgos lingüísticos o cobertura de variantes dialectales menores dentro del kurdo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kurdish-tech/kurdish-tokenizer-unigram-64k
- Variante BPE 64k: https://huggingface.co/kurdish-tech/kurdish-tokenizer-bpe-64k
- Organización Kurdish-Tech en HuggingFace: https://huggingface.co/kurdish-tech
- GitHub de Kurdish-Tech: https://github.com/Kurdish-Tech/
- Corpus de entrenamiento: https://huggingface.co/datasets/kurdish-tech/KurdishCorpus-clean
- Lista de recursos kurdo (awesome-kurdish-tech): https://github.com/cikay/awesome-kurdish-tech
- Proyecto Kurdish BLARK: https://kurdishblark.github.io/
