# kurdish-tech/kurdish-tokenizer-unigram-32k

## Resumen

El modelo `kurdish-tech/kurdish-tokenizer-unigram-32k` es un tokenizador de tipo Unigram (SentencePiece) desarrollado por la organización comunitaria Kurdish-Tech, dedicada a la infraestructura digital para la lengua kurda. Cubre las tres variedades principales del kurdo en un único vocabulario: Kurmancî (escritura latina), Soranî (escritura árabe) y Zazakî (escritura latina). Se entrenó sobre el corpus limpio `KurdishCorpus-clean` y se evaluó con texto reservado no visto durante el entrenamiento.

Este tokenizador no es un modelo de lenguaje completo, sino un componente de preprocesamiento pensado para integrarse en pipelines de generación de texto. Su vocabulario de 32 000 entradas lo hace adecuado para modelos con restricciones de tamaño de tabla de embeddings, aunque el propio autor advierte que es la variante con peor fertilidad entre las cuatro publicadas. Aun así, supera claramente a tokenizadores multilingües generalistas como `cl100k_base` (GPT-4) en todas las variedades kurdas.

La relevancia actual radica en la escasez de recursos lingüísticos para lenguas de bajos recursos como el kurdo. Este tokenizador, junto con sus variantes, proporciona una base sólida para entrenar modelos de lenguaje específicos para esta lengua, reduciendo la fragmentación en tokens y mejorando la eficiencia frente a soluciones genéricas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Unigram (SentencePiece) |
| Parametros totales | No aplica (tokenizador); vocabulario de 32 000 entradas |
| Parametros activos | No aplica |
| Longitud de contexto | `model_max_length` = 1024 |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | Kurmancî (kmr), Soranî (ckb), Zazakî (diq), kurdo genérico (ku) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | Archivo de modelo SentencePiece (`.model`) |

## Arquitectura y entrenamiento

Se trata de un tokenizador Unigram, implementado con la librería SentencePiece. El algoritmo Unigram aprende un modelo de lenguaje subword basado en una distribución de probabilidad sobre segmentos, lo que permite elegir la segmentación más probable para cada palabra. El vocabulario se fijó en 32 000 unidades, con tokens especiales `<bos>`, `<eos>`, `<unk>`, `<pad>` y `<mask>`.

El entrenamiento se realizó sobre el dataset `KurdishCorpus-clean`, mantenido por Kurdish-Tech. No se especifican el número total de tokens de entrenamiento ni la composición exacta del corpus, pero la evaluación se hizo sobre documentos reservados de cada dialecto (300 por dialecto, 166 para Zazakî), con un mínimo de 20 palabras y truncados a 2000 caracteres. La métrica utilizada es la fertilidad (tokens por palabra), medida con el mismo script y los mismos documentos para todos los tokenizadores comparados.

Una innovación destacable es la cobertura unificada de tres variedades kurdas con diferentes sistemas de escritura (latino y árabe) en un solo vocabulario, algo poco común en recursos de bajos recursos.

## Capacidades

- Tokenización subword para las tres variedades principales del kurdo (Kurmancî, Soranî, Zazakî) con un único vocabulario.
- Soporte de escritura latina y árabe dentro del mismo tokenizador.
- Compatible con la librería `transformers` mediante `AutoTokenizer`.
- Incluye tokens especiales estándar (`<bos>`, `<eos>`, `<unk>`, `<pad>`, `<mask>`).
- Longitud máxima de secuencia configurada en 1024 tokens.
- Fertilidad inferior a la de tokenizadores multilingües como `cl100k_base` o `o200k_base` en kurdo, lo que reduce el número de tokens necesarios para representar texto kurdo.
- No incluye capacidades de modelo de lenguaje (no genera texto por sí mismo).

## Casos de uso

- Preprocesamiento para entrenar modelos de lenguaje kurdo: el tokenizador convierte texto kurdo en secuencias de tokens eficientes, reduciendo la longitud de las secuencias frente a tokenizadores genéricos y mejorando el rendimiento del entrenamiento.
- Integración en pipelines de generación de texto para aplicaciones de chatbot o asistentes virtuales en kurdo: al ser compatible con `transformers`, puede usarse directamente con modelos causales como GPT o Llama adaptados al kurdo.
- Normalización y segmentación de texto kurdo para tareas de análisis lingüístico: la tokenización subword ayuda a manejar la morfología rica del kurdo, especialmente en variedades con escritura árabe.
- Desarrollo de sistemas de traducción automática kurdo ↔ otros idiomas: un tokenizador específico mejora la cobertura de vocabulario y reduce los problemas de palabras fuera de vocabulario.
- Construcción de datasets para fine-tuning de modelos multilingües: al tokenizar texto kurdo de forma consistente, facilita la creación de conjuntos de datos de entrenamiento y evaluación.
- Evaluación comparativa de tokenizadores para lenguas de bajos recursos: la publicación incluye métricas de fertilidad que permiten comparar objetivamente distintas estrategias de tokenización para el kurdo.

## Benchmarks y rendimiento

La model card proporciona resultados de fertilidad (tokens por palabra, menor es mejor) medidos sobre texto reservado. Se comparan cuatro tokenizadores kurdos y tres tokenizadores multilingües de referencia.

| Tokenizador | Kurmancî | Soranî | Zazakî |
|---|---:|---:|---:|
| kurdish-bpe-64k | **1.342** | 1.793 | 2.408 |
| kurdish-unigram-64k | 1.385 | **1.633** | **2.290** |
| kurdish-bpe-32k | 1.427 | 1.974 | 2.701 |
| **kurdish-unigram-32k** (este modelo) | 1.472 | 1.843 | 2.580 |
| NLLB-200 (`distilled-600M`) | 1.930 | 2.336 | 2.548 |
| XLM-RoBERTa (`base`) | 1.751 | 3.695 | 2.527 |
| `o200k_base` (GPT-4o) | 2.361 | 3.984 | 2.732 |
| `cl100k_base` (GPT-4) | 2.610 | 6.938 | 3.038 |

El modelo ocupa la cuarta posición entre los tokenizadores kurdos, pero supera a todos los multilingües generalistas, con una reducción de tokens de 1,8× en Kurmancî y 3,8× en Soranî frente a `cl100k_base`.

## Requisitos de hardware

- Al ser un tokenizador, no requiere GPU ni aceleración especial. Puede ejecutarse en CPU con menos de 100 MB de RAM.
- El archivo de modelo de SentencePiece tiene un tamaño aproximado de unos pocos megabytes (32 000 entradas).
- Para usarlo con `transformers`, basta con una instalación estándar de Python y la librería `transformers`.
- No aplica latencia ni throughput en el sentido de inferencia de modelos; la tokenización es instantánea incluso en equipos modestos.
- Puede integrarse en pipelines de entrenamiento en GPU sin coste adicional, ya que la tokenización suele realizarse en CPU antes del paso a GPU.

## Comparativa con modelos similares

Se comparan los cuatro tokenizadores kurdos publicados por Kurdish-Tech, todos entrenados sobre el mismo corpus y evaluados con la misma metodología.

| Tokenizador | Vocabulario | Algoritmo | Fertilidad Kurmancî | Fertilidad Soranî | Fertilidad Zazakî | Recomendación |
|---|---|---|---:|---:|---:|---|
| kurdish-bpe-64k | 64 000 | BPE | **1.342** | 1.793 | 2.408 | Mejor para Kurmancî |
| kurdish-unigram-64k | 64 000 | Unigram | 1.385 | **1.633** | **2.290** | Mejor global para Soranî/Zazakî |
| kurdish-bpe-32k | 32 000 | BPE | 1.427 | 1.974 | 2.701 | Alternativa BPE compacta |
| **kurdish-unigram-32k** | 32 000 | Unigram | 1.472 | 1.843 | 2.580 | Este modelo, para restricción de embeddings |

Frente a tokenizadores multilingües como `cl100k_base` o `o200k_base`, este modelo ofrece una fertilidad significativamente mejor en las tres variedades kurdas, aunque su vocabulario es específico de kurdo y no cubre otros idiomas.

## Limitaciones y advertencias

- La fertilidad es una medida relativa sobre una muestra reservada, no una evaluación exhaustiva de calidad lingüística.
- El autor recomienda no usar esta variante de 32k si no hay una restricción real de tamaño de tabla de embeddings; sugiere usar `kurdish-unigram-64k` para mejor rendimiento en Soranî y Zazakî.
- Es únicamente un tokenizador, no incluye pesos de modelo de lenguaje. No puede generar texto por sí mismo.
- La licencia CC BY-SA 4.0 implica que cualquier obra derivada debe compartirse bajo la misma licencia, lo que puede afectar a proyectos comerciales que no quieran liberar sus modelos.
- El corpus de entrenamiento (`KurdishCorpus-clean`) no está descrito en detalle; puede contener sesgos dialectales o de registro no documentados.
- La longitud máxima de contexto está fijada en 1024 tokens, lo que limita el uso en tareas que requieran secuencias más largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kurdish-tech/kurdish-tokenizer-unigram-32k
- Organización Kurdish-Tech en Hugging Face: https://huggingface.co/kurdish-tech
- Repositorio GitHub de Kurdish-Tech: https://github.com/Kurdish-Tech/
- Variante recomendada (Unigram 64k): https://huggingface.co/kurdish-tech/kurdish-tokenizer-unigram-64k
- Variante BPE 64k: https://huggingface.co/kurdish-tech/kurdish-tokenizer-bpe-64k
- Dataset de entrenamiento: https://huggingface.co/datasets/kurdish-tech/KurdishCorpus-clean
