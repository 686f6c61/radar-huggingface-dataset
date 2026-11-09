# jadermcs/lexsplade-roberta-large-silver-wic-wnbags

## Resumen

LexSPLADE (variante `roberta-large-silver-wic-wnbags`) es un codificador léxico disperso (sparse encoder) contextual desarrollado por el usuario jadermcs sobre `FacebookAI/roberta-large`. A diferencia de un modelo de embeddings de frases, recibe una oración con una palabra marcada mediante las etiquetas `<t>` y `</t>` y devuelve un vector disperso sobre el vocabulario de 50.267 tokens de RoBERTa que representa *esa palabra en ese contexto*. Como las dimensiones del vector son entradas del vocabulario, el resultado puede leerse directamente como una lista de palabras, lo que lo convierte en una herramienta de interpretabilidad léxica.

El modelo resuelve el problema de la desambiguación del sentido de las palabras (word sense disambiguation) y del modelado de palabras en contexto (word-in-context): dos apariciones de la misma palabra con significados distintos producen vectores con baja similitud coseno (en el ejemplo de la model card, en torno a 0,15 entre "bank" como orilla de río y "bank" como entidad financiera). Se entrena con una combinación de pérdida AnglE sobre los vectores dispersos, un regularizador de FLOPS al estilo SPLADE, un término Barlow Twins sobre la representación densa del span y una pérdida auxiliar InfoNCE sobre "bolsas de sentidos" derivadas de WordNet.

Es relevante por su enfoque híbrido: combina la eficiencia y legibilidad de los modelos léxicos dispersos (SPLADE) con representaciones contextuales de un transformer grande, y añade supervisión semántica explícita vía WordNet. El modelo es pequeño (355 millones de parámetros), de licencia Apache 2.0 y está orientado exclusivamente al inglés. Su uso principal es la extracción de características léxicas y la evaluación de similitud entre sentidos, no la generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-large) con cabeza MLM adaptada a pooling de span objetivo y salida dispersa |
| Parametros totales | 355.414.107 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (limitada por `max_seq_length` de RoBERTa-large, 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Vocabulario de salida | 50.267 tokens (RoBERTa) |
| Dimensiones no nulas medias (MCL-WiC test) | 226 de 50.267 |
| Librería | sentence-transformers (`SparseEncoder`) |
| Tamaño del repositorio | 1,4 GB |

## Arquitectura y entrenamiento

El modelo parte de `FacebookAI/roberta-large` y sustituye la salida estándar por un módulo personalizado (`modeling_lexsplade.py`, requiere `trust_remote_code=True`) que aplica la cabeza MLM únicamente a los tokens marcados con `<t>…</t>` y centra los logits por token restando la media y sumando 1,5 veces la desviación típica antes de aplicar ReLU. El resultado es un vector disperso sobre el vocabulario de 50.267 entradas. Los tokens especiales, las stop words y los tokens sin letras ni dígitos se enmascaran en la salida.

El entrenamiento combina cuatro señales: pérdida AnglE sobre los vectores dispersos de la palabra objetivo, regularizador de FLOPS al estilo SPLADE para controlar la dispersión, un término Barlow Twins sobre la representación densa del span y una pérdida auxiliar InfoNCE (peso 0,5) de "bolsas de sentidos". En esta última, cada oración de ejemplo de WordNet debe seleccionar la bolsa de su synset (nombres de otros lemas del synset más nombres de lemas de sus hiperónimos directos) entre las bolsas del lote. Los datos de WiC incluyen pares plata verificados por LLM con el mismo lema, el conjunto de entrenamiento MCL-WiC (31.914 ejemplos) y el de WiC (5.906 ejemplos). La semilla usada fue 44. Las bolsas de sentidos solo intervienen en el entrenamiento; en inferencia el modelo es un LexSPLADE estándar.

## Capacidades

- Codificación léxica contextual: genera un vector disperso interpretable para una palabra concreta dentro de una oración.
- Desambiguación de sentidos (WSD): distingue usos polisémicos de un mismo lema mediante similitud coseno entre vectores.
- Word-in-context (WiC): evalúa si dos apariciones de una palabra comparten sentido.
- Lectura directa del vector como palabras: las dimensiones activas corresponden a tokens del vocabulario de RoBERTa.
- Extracción de características (`feature-extraction`) para pipelines de NLP léxico.
- Similitud semántica a nivel de palabra, no de frase.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo generativo.
- Capacidades multilingües: no disponibles en esta variante (solo inglés; existe una variante XLM-R separada).
- Sin modo thinking, visión ni audio.

## Casos de uso

- Desambiguación de sentidos en pipelines de NLP: dado un texto anotado con la palabra objetivo entre `<t>…</t>`, el modelo devuelve un vector cuyas dimensiones activas (unas 226 de media) actúan como firma del sentido, permitiendo agrupar ocurrencias por significado mediante clustering sobre la similitud coseno.
- Construcción de lexicones específicos de dominio: procesar corpus técnicos o jurídicos para extraer, para cada término, los tokens contextuales más activados y derivar listas de colocaciones y sinónimos de dominio de forma automática e interpretable.
- Evaluación de sistemas de WSD: usar los vectores del modelo como representación de referencia para comparar el rendimiento de desambiguadores propios sobre conjuntos tipo MCL-WiC o WiC.
- Búsqueda léxica aumentada: integrar los vectores dispersos en un motor de recuperación (estilo SPLADE) para búsquedas sensibles al contexto de la palabra, donde la coincidencia léxica pura falla por polisemia.
- Análisis de evolución de sentido: comparar los vectores de una misma palabra en corpus de distintas épocas o registros para detectar desplazamientos semánticos, aprovechando que las dimensiones son palabras legibles.
- Anotación asistida de corpus: generar candidatos de sentido para anotadores humanos mostrando las palabras activadas por el vector, lo que acelera la revisión manual en proyectos de creación de datos léxicos.
- Investigación en interpretabilidad: analizar qué tokens del vocabulario se activan para un uso concreto, dado que la salida es directamente legible sin necesidad de técnicas de atribución posteriores.

## Benchmarks y rendimiento

Evaluación en MCL-WiC (inglés). AP es la precisión media de la similitud coseno; la exactitud se mide en el mejor umbral de cada partición.

| Partición | Exactitud | AP |
|---|---|---|
| test | 91,60 | 97,47 |
| dev | 92,00 | 96,05 |

Dimensiones no nulas medias por uso en MCL-WiC test: 226 de 50.267.

No se han publicado en la información disponible resultados de benchmarks comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros), ni datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 355 millones de parámetros; en fp32 ocupa aproximadamente 1,4 GB de pesos, en fp16 unos 0,7 GB. Con activaciones y overhead de la librería, cabe holgadamente en GPUs de 4-8 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); para despliegues de alto volumen, A10, L4, A100 o H100.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM en fp16.
- Opciones de despliegue: `sentence-transformers` con `SparseEncoder` y `trust_remote_code=True`; el tag `text-embeddings-inference` y `endpoints_compatible` sugiere compatibilidad con Text Embeddings Inference (TEI) y con Inference Endpoints de Hugging Face. No se documentan integraciones con vLLM, llama.cpp ni Ollama (no aplicables a un encoder no generativo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Idiomas |
|---|---|---|---|---|---|
| lexsplade-roberta-large-silver-wic-wnbags | 355 M | no disponible (RoBERTa-large, 512) | SPLADE léxico contextual + WordNet | apache-2.0 | en |
| jadermcs/lexsplade-bert-large-silver | no disponible | no disponible | SPLADE léxico contextual, solo datos plata | no disponible | en |
| jadermcs/lexsplade-xlm-roberta-large-silver | no disponible | no disponible | SPLADE léxico contextual multilingüe | no disponible | multilingüe |

Las dos variantes del mismo autor se citan en la model card como alternativas directas. No se dispone de datos de rendimiento comparativo entre ellas en la información proporcionada. Para comparaciones con modelos SPLADE estándar (por ejemplo, los de la familia Naver SPLADE) o con codificadores de palabras en contexto tipo ELMo/BERT-base, no hay datos disponibles en esta ficha.

## Limitaciones y advertencias

- Solo admite inglés; no cubre otros idiomas (para ello existe la variante XLM-R).
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- Requiere `trust_remote_code=True` y ejecuta código personalizado del repositorio (`modeling_lexsplade.py`); conviene auditar ese módulo antes de desplegarlo en producción.
- El marcado `<t>palabra</t>` debe ir sin espacios interiores; de lo contrario, el tokenizador BPE genera tokens espurios y el resultado se degrada.
- Si los marcadores quedan truncados por `max_seq_length`, el pooling recae sobre la oración completa y devuelve un embedding de frase en lugar de uno de palabra, lo que produce resultados silenciosamente incorrectos.
- Advertencia explícita del autor: el modelo ha visto oraciones de ejemplo de WordNet durante el entrenamiento (pérdida de bolsas de sentidos). No debe evaluarse su taxonomía (hiperónimos, sinónimos) sobre oraciones de ejemplo de WordNet ni sobre conjuntos de relaciones derivados de WordNet, ya que supondría fuga de datos. Las oraciones de MCL-WiC dev/test, WiC dev y crosslemma dev sí se eliminaron de los datos de bolsas.
- Riesgo de sesgo heredado de RoBERTa-large y de los corpus de entrenamiento (WiC, MCL-WiC, WordNet), no cuantificado en la información disponible.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de asignaciones de sentido erróneas en contextos ambiguos o con palabras raras fuera del vocabulario de RoBERTa.
- Uso comercial permitido por la licencia Apache 2.0, sin restricciones adicionales documentadas; conviene verificar la licencia del modelo base (RoBERTa-large, MIT) y de los datos de entrenamiento.
- Modelo con muy poca adopción (5 descargas, 0 likes en el momento de la consulta) y sin validación externa; tratarlo como experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jadermcs/lexsplade-roberta-large-silver-wic-wnbags
- Modelo base: https://huggingface.co/FacebookAI/roberta-large
- Variante BERT-large: https://huggingface.co/jadermcs/lexsplade-bert-large-silver
- Variante XLM-R-large: https://huggingface.co/jadermcs/lexsplade-xlm-roberta-large-silver
- Paper de SPLADE (referencia del enfoque): no disponible en la información proporcionada
- Paper de AnglE (referencia de la pérdida): no disponible en la información proporcionada
- Repositorio de código adicional, demo o blog del autor: no disponible en la información proporcionada
