# jadermcs/lexsplade-roberta-large-silver-ldv

## Resumen

LexSPLADE (roberta-large, silver, defining vocabulary) es un codificador léxico disperso (sparse encoder) desarrollado por el usuario jadermcs sobre el modelo base FacebookAI/roberta-large. Su particularidad es que la salida está restringida al Longman Defining Vocabulary (LDV), el conjunto de aproximadamente 2.000 palabras con el que el diccionario Longman redacta todas sus definiciones. Dado un texto con una palabra marcada mediante las etiquetas `<t>` y `</t>`, el modelo devuelve un vector disperso que describe ese uso concreto de la palabra en su contexto, y cada dimensión no nula corresponde a uno de los 2.139 tokens de RoBERTa que deletrean una palabra del LDV.

El modelo resuelve el problema de la desambiguación del sentido de las palabras (word-sense disambiguation) y de la representación léxica en contexto (word-in-context), produciendo representaciones interpretables: un vector puede leerse directamente como una lista corta de palabras al estilo de una definición. Emplea una arquitectura transformer basada en RoBERTa-large, con 355.414.107 parámetros totales, y una cabeza de modelado de lenguaje enmascarado (MLM) aplicada exclusivamente sobre los tokens marcados, con centrado de logits y restricción de vocabulario.

Es relevante porque demuestra que restringir la salida a un 4 % del vocabulario (2.139 de los aproximadamente 50.000 tokens de RoBERTa) apenas degrada el rendimiento frente a la receta sin restricción (AP 97,02 ± 0,08 frente a 97,08 ± 0,13 en tres semillas), lo que abre la puerta a representaciones léxicas dispersas, legibles y eficientes para tareas de similitud semántica a nivel de palabra.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-large) con cabeza MLM y pooling de span objetivo; codificador disperso SPLADE |
| Parametros totales | 355.414.107 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (limitada por `max_seq_length` de RoBERTa; el valor exacto no se especifica en la informacion disponible) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Vocabulario de salida | 2.139 tokens restringidos al Longman Defining Vocabulary |
| Dimensiones no nulas medias | 105 de 2.139 (por uso, en MCL-WiC test) |
| Modelo base | FacebookAI/roberta-large |
| Libreria | sentence-transformers (SparseEncoder) |
| Tamano del repo | 1,4 GB |

## Arquitectura y entrenamiento

El modelo parte de RoBERTa-large y añade un módulo personalizado (`modeling_lexsplade.py`, que requiere `trust_remote_code=True`) que realiza el pooling sobre el span objetivo: aplica una cabeza MLM únicamente a los tokens marcados con `<t>` y `</t>`, centra los logits (restando la media y sumando 1,5 veces la desviación típica por token antes de la ReLU, con z = 1,5) y restringe el vocabulario de salida a los 2.139 tokens que deletrean palabras del LDV. La restricción se aplica antes del cálculo de la pérdida, de modo que el entrenamiento solo ve vectores restringidos. Se enmascaran las salidas correspondientes a tokens especiales, palabras vacías (stop words) y tokens sin letra ni dígito.

El entrenamiento utilizó 31.914 pares de palabra en contexto con la misma lema (silver verificados por LLM más el conjunto de entrenamiento de MCL-WiC). La función de pérdida combina AnglE loss sobre los vectores dispersos de la palabra objetivo, un regularizador de FLOPS de SPLADE con coeficiente 1e-3 y un término de Barlow Twins sobre la representación densa del span. Se empleó la semilla 44, seleccionada por el mejor AP de desarrollo en MCL-WiC entre las semillas 42 a 44. La innovación principal es la restricción del vocabulario de salida a un conjunto léxico cerrado y definicional, que produce vectores interpretables sin sacrificar precisión.

## Capacidades

- Codificación dispersa de palabras en contexto: genera un vector disperso que describe el uso concreto de una palabra marcada en una oración.
- Desambiguación del sentido de las palabras (word-sense disambiguation): distingue usos polisémicos, como se ilustra en la model card con "bank" (orilla del río frente a entidad financiera), con una similitud coseno de aproximadamente 0,16 entre ambos usos.
- Representación léxica interpretable: las dimensiones no nulas corresponden a palabras del LDV, de modo que un vector puede leerse como una lista de palabras al estilo de una definición (por ejemplo, `['bank', 'river', 'shore', 'forest', 'rough', 'land', 'west', 'dry']`).
- Extracción de características (pipeline `feature-extraction`) y uso como codificador dentro de sentence-transformers mediante `SparseEncoder`.
- Similitud semántica a nivel de palabra mediante similitud coseno sobre los vectores dispersos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no; el modelo solo soporta inglés.
- Capacidades especiales: restricción de vocabulario al LDV, enmascarado de stop words y tokens sin contenido alfanumérico.

## Casos de uso

- Desambiguación del sentido de las palabras en pipelines de PLN: el modelo recibe una oración con la palabra objetivo marcada y devuelve un vector cuyo solapamiento con otros usos mide la similitud de sentido; es adecuado para tareas de word-in-context y evaluación tipo MCL-WiC, donde alcanza un AP de 96,93 en test.
- Construcción de diccionarios y glosas automáticas: al restringir la salida al Longman Defining Vocabulary, los vectores pueden leerse como listas de palabras definicionales, lo que permite generar descripciones léxicas legibles sin postprocesado complejo.
- Búsqueda léxica dispersa y recuperación de información: al ser un codificador SPLADE con vectores de unas 105 dimensiones no nulas de media, es adecuado para índices invertidos eficientes en motores de búsqueda que necesiten representaciones a nivel de palabra.
- Enriquecimiento de bases de datos léxicas y wordnets: los vectores por uso permiten agrupar ocurrencias de una palabra por sentido y vincularlas a synsets existentes, aprovechando la naturaleza interpretable de las dimensiones activas.
- Evaluación de modelos de representación léxica: sirve como referencia controlada para estudiar el coste de restringir el vocabulario de salida (el autor reporta que la restricción al 4 % del vocabulario cuesta casi nada en AP).
- Sistemas de simplificación léxica: la restricción al LDV facilita sugerir sustitutos de vocabulario controlado en textos para lectores con dificultades o para aprendizaje de inglés, ya que las dimensiones activas pertenecen a un léxico definicional acotado.
- Análisis de polisemia en corpus: procesando ocurrencias con la palabra marcada y calculando similitudes por pares, se pueden detectar cambios de sentido o usos novedosos dentro de un mismo lema.

## Benchmarks y rendimiento

Los datos de evaluación provienen de la model card. AP es la precisión media de la similitud coseno; la exactitud se mide en el mejor umbral de cada partición.

| Conjunto | Exactitud | AP |
|---|---|---|
| MCL-WiC test (en) | 91,10 | 96,93 |
| MCL-WiC dev (en) | 91,50 | 96,03 |
| Crosslemma dev | 87,70 | 94,23 |

Comparación de la receta con y sin restricción de vocabulario (media de tres semillas, MCL-WiC test AP):

| Receta | AP (media ± desv.) |
|---|---|
| Restringida al LDV (esta receta) | 97,02 ± 0,08 |
| RoBERTa sin restricción de vocabulario | 97,08 ± 0,13 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 355 millones de parámetros, en fp32 los pesos ocupan aproximadamente 1,4 GB, y en fp16 aproximadamente 0,7 GB, a lo que hay que sumar la memoria de activaciones y del tokenizador.
- GPU recomendadas: no se especifican en la informacion disponible; por tamaño, el modelo es manejable en GPUs de consumo, aunque no hay datos oficiales de latencia ni throughput.
- ¿Cabe en GPU de consumo? Por número de parámetros es probable que sí en tarjetas con suficiente VRAM para fp16 o fp32, pero no se han publicado requisitos oficiales.
- Opciones de despliegue: sentence-transformers con `SparseEncoder` y `trust_remote_code=True`; la model card incluye la etiqueta `text-embeddings-inference` y `endpoints_compatible`, lo que sugiere compatibilidad con Text Embeddings Inference y endpoints de Hugging Face. No se mencionan vLLM, llama.cpp, Ollama ni TGI de forma explícita.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jadermcs/lexsplade-roberta-large-silver-ldv | 355.414.107 | no disponible | SPLADE restringido al LDV, word-in-context | apache-2.0 | Hugging Face |
| jadermcs/lexsplade-roberta-large-silver-wic-wnbags | no disponible (mismo base RoBERTa-large) | no disponible | SPLADE con vocabulario completo, word-in-context | no disponible en la informacion proporcionada | Hugging Face |
| jadermcs/lexsplade-bert-large-silver-ldv | no disponible | no disponible | SPLADE restringido al LDV sobre BERT-large | no disponible en la informacion proporcionada | Hugging Face |
| jadermcs/lexsplade-xlm-roberta-xl-silver-ldv | no disponible | no disponible | SPLADE restringido al LDV sobre XLM-R-XL | no disponible en la informacion proporcionada | Hugging Face |

Las variantes listadas proceden de la sección "Variants" de la model card. No se dispone de datos de benchmarks de esas variantes ni de otros modelos comparables externos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta inglés (`language: en`); no debe esperarse un comportamiento correcto en otros idiomas.
- La marca del objetivo debe escribirse como `<t>palabra</t>` sin espacios interiores; con espacios, el BPE de RoBERTa genera tokens distintos de los vistos en entrenamiento y la representación resulta incorrecta.
- Si los marcadores quedan truncados por `max_seq_length`, el pooling recae sobre la oración completa y devuelve una representación de oración en lugar de una representación de palabra.
- Requiere `trust_remote_code=True`, ya que el pooling del span objetivo y la restricción de vocabulario se implementan en un módulo personalizado (`modeling_lexsplade.py`) incluido en el repositorio; esto implica ejecutar código del autor.
- La salida está restringida a 2.139 tokens del LDV, por lo que no puede expresar conceptos fuera de ese léxico definicional; es una limitación deliberada del diseño.
- Riesgo de alucinación: no aplica en el sentido generativo, ya que el modelo no genera texto libre, sino vectores dispersos; no obstante, las representaciones pueden ser imprecisas en usos léxicos poco representados en los datos de entrenamiento.
- Sesgos conocidos: no se documentan sesgos específicos en la informacion disponible; al derivar de RoBERTa-large y de un léxico definicional de un diccionario concreto, puede heredar sesgos del corpus y del vocabulario de origen.
- Restricciones de licencia: la licencia es apache-2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base (FacebookAI/roberta-large) y del vocabulario LDV de terceros.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; se trata de un artefacto reciente y poco validado por la comunidad.
- No se han publicado requisitos de hardware, latencias ni datos de cuantización, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jadermcs/lexsplade-roberta-large-silver-ldv
- Modelo base: https://huggingface.co/FacebookAI/roberta-large
- Variante XLM-R-XL con vocabulario definicional: https://huggingface.co/jadermcs/lexsplade-xlm-roberta-xl-silver-ldv
- Variante BERT-large con vocabulario definicional: https://huggingface.co/jadermcs/lexsplade-bert-large-silver-ldv
- Variante RoBERTa-large con vocabulario completo: https://huggingface.co/jadermcs/lexsplade-roberta-large-silver-wic-wnbags
