# LickyArc/bengali-tokenizer-pilot

## Resumen

El repositorio `LickyArc/bengali-tokenizer-pilot` no contiene un modelo de lenguaje completo, sino un proyecto piloto de investigación para desarrollar y evaluar un tokenizador bengalí optimizado, diseñado para ser "transplantado" sobre un modelo base Llama-3.2-1B. El objetivo es medir la fertilidad del tokenizador (número de tokens por palabra) y otras métricas frente a alternativas, y comparar dos métodos de inicialización de embeddings: uno basado en la media de los embeddings del tokenizador original y otro denominado FOCUS, que utiliza un espacio fastText estático entrenado sobre el mismo corpus.

El proyecto incluye un conjunto de scripts en Python que implementan un "fertility gate" (compuerta de fertilidad), la preparación de corpus desde IndicCorpV2 (config `indiccorp_v2`, split `ben_Beng`), el entrenamiento de un tokenizador de 32k vocabulario, la medición de métricas, un sanity check que valida el orden de pérdidas esperado (random > mean > FOCUS), y un pipeline de entrenamiento y evaluación con generación de gráficas. Está orientado a desarrolladores e investigadores que trabajan con modelos multilingües y tokenizadores de bajo recurso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador BPE (Byte Pair Encoding) de 32k vocabulario, sobre corpus bengalí; no es un modelo de lenguaje completo |
| Parametros totales | no disponible (el tokenizador no tiene parámetros de red neuronal; el modelo base de referencia es Llama-3.2-1B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base sobre el que se transplante) |
| Tipos de cuantizacion | no disponible (no se proporcionan pesos de modelo) |
| Idiomas soportados | bengalí (ben_Beng) como idioma objetivo; el modelo base Llama-3.2-1B soporta inglés y otros idiomas, pero el piloto se centra en bengalí |
| Licencia | no disponible |
| Formato de pesos | no aplica (el entregable son scripts Python y un tokenizador entrenado; no se publican pesos de modelo) |

## Arquitectura y entrenamiento

El proyecto se centra en el entrenamiento de un tokenizador BPE de 32k unidades sobre un corpus filtrado de IndicCorpV2 bengalí (1,2 millones de documentos de entrenamiento y 5.000 de validación por defecto). El tokenizador se entrena con el script `train_tokenizer.py` sobre los primeros 200.000 documentos. Posteriormente, se inicializan los embeddings del modelo base Llama-3.2-1B mediante dos métodos: `mean` (promedio de los embeddings de los subtokens del tokenizador original) y `focus` (utilizando un espacio fastText estático entrenado sobre el mismo corpus). El pipeline incluye un sanity check que exige que la pérdida de un checkpoint aleatorio sea mayor que la del método `mean`, y que este sea mayor que la del método `focus`, antes de proceder al entrenamiento.

El entrenamiento del modelo (fase posterior al tokenizador) se realiza con un script `train.py` que permite configurar el número total de tokens, el micro-batch y la acumulación de gradientes para mantener un batch efectivo de aproximadamente 500.000 tokens. No se especifica la arquitectura del modelo resultante, pero se parte del checkpoint de Llama-3.2-1B, por lo que se mantiene la arquitectura transformer original con los nuevos embeddings.

## Capacidades

- Tokenización bengalí eficiente: el tokenizador está diseñado para reducir la fertilidad (tokens por palabra) en comparación con el tokenizador original de Llama-3.2-1B, mejorando la compresión del texto bengalí.
- Medición de métricas: scripts para calcular fertilidad, BPC (bits por carácter), vocabulario y throughput de inferencia.
- Inicialización de embeddings: dos métodos (mean y FOCUS) para adaptar un modelo preentrenado a un nuevo vocabulario sin entrenar desde cero.
- Evaluación estandarizada: integración con `lm_eval` para ejecutar MILU y MMLU, además de métricas propias del piloto.
- Reproducibilidad: pipeline completo con compuertas de calidad (fertility gate, sanity check) que detienen el proceso si no se cumplen los criterios.
- No incluye capacidades de generación de texto, tool calling, agentes, visión ni audio, ya que no es un modelo de lenguaje final.

## Casos de uso

- Investigación en tokenización multilingüe: el piloto sirve como banco de pruebas para comparar métodos de inicialización de embeddings (mean vs. FOCUS) en un escenario de bajo recurso como el bengalí.
- Desarrollo de modelos de lenguaje para bengalí: los scripts permiten entrenar un tokenizador específico y adaptar un modelo base (Llama-3.2-1B) para mejorar la eficiencia en tareas de procesamiento de lenguaje natural en bengalí.
- Evaluación de fertilidad y compresión: el fertility gate y las métricas de BPC ayudan a decidir si un tokenizador es adecuado antes de invertir en entrenamiento completo.
- Optimización de costes de entrenamiento: al reducir la fertilidad, se reduce el número de tokens necesarios para representar un corpus, lo que puede disminuir el coste computacional y de GPU.
- Integración en pipelines de NLP para bengalí: una vez entrenado, el tokenizador puede usarse en tareas como clasificación de texto, extracción de información o traducción automática, aunque el piloto no incluye un modelo final listo para producción.
- Educación y experimentación: el código modular y los tests unitarios facilitan su uso como material didáctico para entender el proceso de adaptación de tokenizadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El proyecto menciona que la evaluación utiliza `lm_eval` para MILU y MMLU, pero no se proporcionan números concretos. Las métricas de fertilidad, BPC y throughput se generan mediante los scripts, pero no hay datos públicos de resultados.

## Requisitos de hardware

- Los scripts de preparación de corpus y entrenamiento de tokenizador son ligeros y pueden ejecutarse en CPU con suficiente RAM (el corpus de 1,2M documentos puede requerir varios GB de almacenamiento y memoria).
- El entrenamiento del modelo (fase posterior) requiere GPU. No se especifica VRAM mínima, pero al partir de Llama-3.2-1B, una GPU con al menos 8-12 GB de VRAM sería necesaria para fine-tuning con micro-batches pequeños; para batches mayores se recomienda una GPU con 24 GB o más (RTX 3090/4090, A10, A100).
- El sanity check y la evaluación con `lm_eval` pueden ejecutarse en CPU, aunque la inferencia del modelo base será más lenta.
- Opciones de despliegue: no se proporcionan instrucciones para vLLM, Ollama o TGI, ya que el entregable no es un modelo servible, sino un conjunto de scripts de investigación.

## Comparativa con modelos similares

| Modelo / Proyecto | Tipo | Vocabulario | Enfoque | Licencia |
|---|---|---|---|---|
| LickyArc/bengali-tokenizer-pilot | Tokenizador BPE + scripts de adaptación | 32k | Piloto de investigación con métodos mean y FOCUS | no disponible |
| sayanbanerjee32/bengali_tokenizer | Tokenizador BPE | no especificado | Tokenizador bengalí independiente, entrenado sobre corpus de Tatoeba y otros | MIT |
| konko/bornomala-bengali-tokenizer | Tokenizador | no especificado | Tokenizador bengalí con enfoque en democratización de IA | no disponible |
| srijani2/bengali_tokenizer (Space) | Demostración interactiva | no especificado | Visualización de tokenización bengalí | no disponible |

La comparativa se limita a tokenizadores bengalíes, ya que el piloto no es un modelo de lenguaje comparable a LLMs. No hay datos de rendimiento público para comparar.

## Limitaciones y advertencias

- El proyecto es un piloto en fase inicial (Day 1 fertility gate); no incluye un modelo final entrenado ni pesos publicados.
- No se especifica la licencia, lo que impide su uso comercial sin aclaración del autor.
- Los scripts dependen de la disponibilidad de IndicCorpV2 y de la API de HuggingFace; cambios en el dataset pueden romper el pipeline.
- El sanity check exige un orden de pérdidas específico (random > mean > FOCUS); si no se cumple, el entrenamiento se detiene, lo que puede ser una limitación en escenarios reales.
- No hay garantía de que el tokenizador entrenado supere al tokenizador original de Llama-3.2-1B en todas las métricas; la fertilidad puede variar según el corpus.
- El proyecto no aborda sesgos, alucinaciones ni riesgos de seguridad, ya que no es un modelo generativo.
- Para producción, se necesitaría un entrenamiento completo del modelo y una evaluación exhaustiva, que no están incluidos en este piloto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LickyArc/bengali-tokenizer-pilot
- Perfil del autor: https://huggingface.co/LickyArc
- Espacio de demostración de tokenizador bengalí (srijani2): https://huggingface.co/spaces/srijani2/bengali_tokenizer
- Tokenizador bengalí de sayanbanerjee32: https://huggingface.co/sayanbanerjee32/bengali_tokenizer
- Tokenizador bengalí de konko: https://huggingface.co/konko/bornomala-bengali-tokenizer
