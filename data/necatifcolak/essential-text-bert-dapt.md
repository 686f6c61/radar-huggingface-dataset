# necatifcolak/essential-text-bert-dapt

## Resumen

essential-text-bert-dapt es un checkpoint de BERT-base-uncased sometido a preentrenamiento adaptativo de dominio (DAPT, domain-adaptive pretraining) sobre texto financiero. Lo desarrolla necatifcolak como parte del proyecto de curso "Evaluating Domain Adaptation in Financial Sentiment Analysis". El modelo parte de la revisión `86b5e0934494bd15c9632b12f734a8a67f723594` de `google-bert/bert-base-uncased` y se reentrena con el objetivo de modelado de lenguaje enmascarado (MLM) sobre 41,7 millones de tokens extraídos de informes 10-K del corpus `eloukas/edgar-corpus`, manteniendo el vocabulario original de BERT.

El propósito del checkpoint es experimental y de control: aísla el efecto del texto financiero (con vocabulario fijo) frente al efecto del vocabulario propio y del corpus mayor de FinBERT-MLM. No es un clasificador de sentimiento, sino un modelo de lenguaje enmascarado que sirve como punto de partida para fine-tuning posterior con la misma receta que el resto de encoders del proyecto.

Su relevancia es metodológica más que de producto: proporciona un punto de comparación reproducible (semilla 42, corpus con hash verificado, filtro de fuga de datos contra los conjuntos de evaluación) para medir cuánto aporta realmente el DAPT en análisis de sentimiento financiero. Con 110,1 millones de parámetros y licencia Apache-2.0, es ligero y desplegable en hardware modesto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base), MLM |
| Parametros totales | 110.106.428 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (heredada de BERT-base; el preentrenamiento usó secuencias de 256) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de BERT-base sin modificaciones: encoder transformer de 12 capas, 768 dimensiones ocultas, 12 cabezas de atención y vocabulario WordPiece de BERT-base-uncased. El entrenamiento consistió en una pasada de MLM con enmascaramiento del 15% sobre 41,7 millones de tokens, organizados en 164.103 bloques de 256 tokens. El corpus son 5.007 documentos y 1.263.792 frases procedentes de las secciones 1 y 7 de informes 10-K de los años 2017 a 2020 del dataset `eloukas/edgar-corpus` (revisión `7e90f0f342569b35213445f809cfaf3b91f9964f`).

Los hiperparámetros fueron AdamW con learning rate 5e-5, warmup del 6%, weight decay 0.01 y semilla 42, con 5.128 pasos, batch de 32 y longitud de secuencia 256. El entrenamiento se ejecutó en una GPU Kaggle T4 en fp16 durante 44 minutos. Destaca el filtro de fuga de datos: se descartaron 218 frases que coincidían (exactamente o con solapamiento de 8-gramas) con frases de evaluación de Financial PhraseBank, SEntFiN, FiQA o Twitter Financial News. El corpus tiene SHA-256 `bc60b28396fba3cb001529174e5c24dd034984466ffee93a937f72f5eb0dbca0` y los pesos `300399b902d1f80188c5bf683c5c534d51919f0cdf453d18bea911e3d7221b6c`.

## Capacidades

- Modelado de lenguaje enmascarado (MLM): predice tokens enmascarados en texto en inglés, especialmente en registro financiero y de informes anuales.
- Representaciones contextuales de frases y documentos para tareas downstream de clasificación, extracción o similitud semántica tras fine-tuning.
- Punto de partida para fine-tuning en clasificación de sentimiento financiero, siguiendo la receta del proyecto (`scripts/run_extra_external.py --dapt-model`).
- Vocabulario original de BERT-base-uncased, lo que facilita la compatibilidad con pipelines y tokenizadores existentes de BERT.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión ni audio.
- Capacidad multilingüe: no disponible; solo inglés.
- No dispone de modo "thinking" ni de generación autoregresiva de texto libre más allá del relleno de máscaras.

## Casos de uso

- Investigación sobre adaptación de dominio: sirve como brazo de control en experimentos que comparan DAPT con vocabulario fijo frente a modelos como FinBERT-MLM, permitiendo aislar la contribución del corpus financiero.
- Fine-tuning para clasificación de sentimiento financiero: se puede entrenar sobre Financial PhraseBank, SEntFiN o FiQA para obtener un clasificador de polaridad en noticias y comunicados financieros.
- Extracción de información en informes 10-K: tras fine-tuning para NER o clasificación de secciones, puede etiquetar entidades y pasajes relevantes en las secciones 1 y 7 de informes anuales.
- Reproducción de experimentos académicos: el checkpoint incluye hashes de corpus y pesos, lo que permite replicar resultados y auditar el pipeline de entrenamiento.
- Base para búsqueda semántica en documentación financiera: sus embeddings contextuales, tras fine-tuning con pares de frases, pueden alimentar un índice vectorial de informes regulatorios.
- Prototipado ligero en entornos con recursos limitados: con 110 millones de parámetros cabe en GPUs de consumo y permite iterar rápidamente en tareas de NLP financiero antes de escalar a modelos mayores.
- Evaluación de fugas de datos: el filtro aplicado contra conjuntos de evaluación lo convierte en una referencia útil para comprobar la limpieza de pipelines de datos financieros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente indica que, tras fine-tuning en Financial PhraseBank, el modelo mueve BERT como máximo unos 0,03 de Macro-F1, sin un signo consistente; no se aportan cifras absolutas ni comparativas numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB de pesos; en fp16, unos 0,22 GB. El pico real depende del tamaño de batch y de la longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para inferencia en fp16; para fine-tuning se recomienda al menos 8-12 GB (RTX 3060/4070, RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, en tarjetas como GTX 1650, RTX 3050, RTX 3060, RTX 4060 y superiores, incluso con batches moderados.
- Opciones de despliegue: PyTorch con `transformers`, ONNX Runtime, TorchScript y TensorRT. No se han publicado variantes GGUF ni integración con llama.cpp u Ollama.
- Latencia y throughput estimados: no disponible. El autor solo reporta 44 minutos de entrenamiento en una T4 para 5.128 pasos con batch 32 y secuencia 256.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| essential-text-bert-dapt | 110,1 M | 512 | Financiero (10-K), vocabulario BERT | Apache-2.0 | Hugging Face |
| google-bert/bert-base-uncased | 110,1 M | 512 | General, inglés | Apache-2.0 | Hugging Face |
| ProsusAI/finbert | 110,1 M | 512 | Financiero, clasificador de sentimiento | Apache-2.0 | Hugging Face |
| yiyanghkust/finbert-tone | 110,1 M | 512 | Financiero, clasificador de tono | Apache-2.0 | Hugging Face |

La comparación se limita a parámetros, contexto y licencia porque no hay datos de rendimiento publicados para este checkpoint. Frente a bert-base-uncased, la diferencia es el corpus de preentrenamiento (10-K frente a texto general). Frente a FinBERT y FinBERT-tone, la diferencia es que estos últimos son clasificadores ya fine-tuneados, mientras que essential-text-bert-dapt es un modelo MLM que requiere fine-tuning posterior.

## Limitaciones y advertencias

- No es un clasificador de sentimiento: la model card lo indica explícitamente; usarlo directamente para predecir polaridad produciría resultados sin sentido.
- El efecto medido en el proyecto es marginal: como máximo unos 0,03 de Macro-F1 sobre BERT, sin signo consistente, por lo que no cabe esperar mejoras sustanciales en tareas downstream.
- Sesgos conocidos: no disponible. Al entrenarse sobre informes 10-K de empresas estadounidenses, puede heredar sesgos de ese corpus (sector, tamaño de empresa, registro formal), pero no se documentan análisis específicos.
- Riesgo de alucinación: limitado al MLM; puede predecir tokens plausibles pero incorrectos en contextos financieros ambiguos.
- Limitaciones de idioma: solo inglés; no se ha entrenado ni evaluado en otros idiomas.
- Limitaciones de contexto: 512 tokens, insuficiente para documentos 10-K completos; requiere truncado o segmentación.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el corpus subyacente son documentos públicos de la SEC; conviene revisar las condiciones de uso de `eloukas/edgar-corpus`.
- Caveat de producción: con 0 descargas y 0 likes, el checkpoint no tiene validación externa; su uso en producción requeriría una evaluación propia y un fine-tuning específico de la tarea.
- El filtro de fuga de datos se aplicó contra cuatro conjuntos de evaluación concretos; no garantiza ausencia de solapamiento con otros benchmarks financieros.

## Enlaces

- Hugging Face: https://huggingface.co/necatifcolak/essential-text-bert-dapt
- Repositorio del proyecto: https://github.com/nfcolak/essential_text
- Dataset de preentrenamiento: https://huggingface.co/datasets/eloukas/edgar-corpus
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
