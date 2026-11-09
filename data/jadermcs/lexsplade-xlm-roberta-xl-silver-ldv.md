# jadermcs/lexsplade-xlm-roberta-xl-silver-ldv

## Resumen

LexSPLADE (xlm-roberta-xl, silver, defining vocabulary) es un codificador disperso de palabras en contexto desarrollado por jadermcs. La particularidad del modelo es que su salida está restringida al Longman Defining Vocabulary (LDV), el conjunto de aproximadamente 2.000 palabras con el que el diccionario Longman redacta todas sus definiciones. Dado un enunciado con una palabra marcada mediante las etiquetas `<t>` y `</t>`, el modelo devuelve un vector disperso de 250.000 dimensiones en el que cada dimensión activa corresponde a uno de los 1.622 tokens XLM-R que deletrean una palabra del LDV (el 0,6% del vocabulario total). El vector resultante se puede leer como una lista corta de palabras con estilo de definición, lo que convierte la desambiguación léxica en un problema de recuperación directa.

El modelo parte de `facebook/xlm-roberta-xl`, un transformer de 3.500 millones de parámetros (3.480.498.324 según los pesos en safetensors), y se ha afinado con LoRA (r=16) sobre 31.914 pares palabra-en-contexto del mismo lema, combinando datos silver verificados por LLM con el conjunto de entrenamiento de MCL-WiC. La arquitectura combina un codificador SPLADE clásico con un pooling restringido al span objetivo: la cabeza MLM se ejecuta solo sobre los tokens marcados, aplica centrado de logits (z=2,5) y restringe el vocabulario antes de la función de pérdida, evitando así tensores de logits de tamaño `[batch, seq, 250k]`.

Es relevante ahora porque demuestra que se puede imponer una restricción semántica fuerte (un vocabulario de definición controlado) con un coste mínimo de rendimiento: la receta sin restricción obtiene 97,85 de AP en el test de MCL-WiC frente a 97,75 del modelo restringido, una diferencia de 0,10 puntos. El resultado es un encoder interpretable, con vectores legibles como palabras, útil para desambiguación de sentidos, recuperación léxica y análisis semántico de palabras en contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-XL) con cabeza MLM restringida y pooling sobre el span objetivo; encoder disperso tipo SPLADE |
| Parametros totales | 3.480.498.324 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (limitada por `max_seq_length` del tokenizer; el modelo card no especifica el valor exacto) |
| Tipos de cuantizacion | bf16 (referenciado en el ejemplo de uso); no se documentan otras cuantizaciones |
| Idiomas soportados | en (solo inglés; la máscara de stop-words es una lista inglesa) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 7,0 GB) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer basado en XLM-RoBERTa-XL (3.500 millones de parámetros) adaptado como codificador disperso SPLADE. La innovación principal reside en el módulo de pooling: en lugar de ejecutar la cabeza MLM sobre toda la secuencia (lo que produciría un tensor de logits de `[batch, seq, 250k]`), se ejecuta únicamente sobre los tokens encerrados entre `<t>` y `</t>`. Sobre esos logits se aplica un centrado por token (resta de la media más 2,5 desviaciones típicas) antes de la ReLU, y después se enmascaran los tokens especiales, las stop-words y los tokens sin letras o dígitos. Finalmente, el vocabulario se restringe a los 1.622 tokens XLM-R que deletrean palabras del LDV (de las 2.188 palabras del LDV, 1.622 resuelven a tokens completos de XLM-R).

El entrenamiento parte del checkpoint base en bf16 y aplica LoRA con rango 16 y learning rate 2e-4; los embeddings de los marcadores y la cabeza MLM se entrenan completos, y los adaptadores se fusionan en el checkpoint final. El conjunto de datos son 31.914 pares palabra-en-contexto del mismo lema (datos silver verificados por LLM más el train de MCL-WiC). La función de pérdida combina AnglE loss sobre los vectores dispersos de la palabra objetivo, un regularizador de FLOPS de SPLADE (1e-3) y un término de Barlow Twins sobre la representación densa del span. Se usó una única semilla (42). Si los marcadores quedan truncados fuera de la ventana, el pooling recae sobre toda la oración y devuelve un embedding de oración en lugar de uno de palabra.

## Capacidades

- Codificación dispersa de palabras en contexto: dado un enunciado con una palabra marcada, produce un vector de 250.000 dimensiones con como máximo 1.622 dimensiones no nulas.
- Salida legible como palabras: los índices activos corresponden a tokens que deletrean palabras del Longman Defining Vocabulary, de modo que el vector se puede interpretar como una lista corta de palabras estilo definición.
- Desambiguación de sentidos (word-sense-disambiguation): distingue usos del mismo lema en contextos distintos; en el ejemplo del model card, `bank` en contexto fluvial y `bank` en contexto financiero producen vectores con similitud coseno de aproximadamente 0,24.
- Extracción de características (`feature-extraction`): pipeline declarado del modelo.
- Recuperación léxica: los vectores dispersos son directamente indexables para búsqueda léxica o híbrida.
- Integración con `sentence-transformers` mediante la clase `SparseEncoder`, con `trust_remote_code=True` para cargar el módulo `modeling_lexsplade.py`.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Desambiguación de sentidos en lexicografía computacional: marcar una palabra en una oración y leer los tokens activos del vector como una definición aproximada; el vocabulario restringido al LDV hace que la salida sea directamente interpretable por lexicógrafos sin post-procesado.
- Construcción de diccionarios y glosas automáticas: usar el vector disperso como glosa candidata de una palabra en contexto, aprovechando que las dimensiones activas son palabras del vocabulario de definición de Longman.
- Búsqueda léxica sensible al contexto: indexar los 1.622 ids permitidos y recuperar pasajes donde una palabra se usa con un sentido concreto, útil en sistemas de recuperación híbrida (dispersa más densa).
- Análisis de corpus y estudios de variación semántica: comparar vectores de la misma palabra en distintos contextos (similitud coseno) para medir cambios de sentido a lo largo de un corpus, con la ventaja de que cada dimensión es una palabra concreta.
- Enriquecimiento de bases de datos terminológicas: generar automáticamente listas de palabras relacionadas con un uso concreto de un término, para alimentar tesauros o grafos léxicos.
- Evaluación y depuración de sistemas de NLP: usar el modelo como sonda interpretable para comprobar qué información contextual captura un encoder sobre una palabra concreta, dado que la salida está limitada a un vocabulario controlado de aproximadamente 2.000 palabras.
- Filtrado semántico en pipelines de anotación: marcar términos candidatos en textos ingleses y usar la similitud entre vectores para agrupar usos equivalentes antes de una anotación humana.

## Benchmarks y rendimiento

AP es la precisión media de la similitud coseno; accuracy se mide en el mejor umbral de cada split.

| Conjunto | Accuracy | AP |
|---|---|---|
| MCL-WiC test (en) | 93,10 | 97,75 |
| MCL-WiC dev (en) | 91,70 | 96,39 |
| crosslemma dev | 88,61 | 95,69 |

Comparación con la receta sin restricción de vocabulario (misma semilla): 97,85 / 96,80 / 95,63 de AP en test, dev y crosslemma respectivamente. La restricción al LDV cuesta 0,10 puntos de AP en test. El número medio de dimensiones no nulas por uso en MCL-WiC test es de 186 sobre 1.622 posibles.

## Requisitos de hardware

- VRAM estimada: aproximadamente 7 GB en bf16 para los 3.500 millones de parámetros, según el model card; no se documentan requisitos para otras precisiones.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, el modelo en bf16 encaja en GPUs con 8 GB o más de VRAM, aunque no se confirma oficialmente.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) y en tarjetas de 8-16 GB en bf16, aunque el dato no está confirmado en la documentación.
- Opciones de despliegue: `sentence-transformers` con `SparseEncoder` y `trust_remote_code=True`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El pooling restringido al span evita el tensor de logits `[batch, seq, 250k]`, lo que reduce el coste de memoria frente a una cabeza MLM completa, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Restricción de salida | AP MCL-WiC test | Licencia |
|---|---|---|---|---|---|
| LexSPLADE xlm-roberta-xl silver LDV (este) | 3.480.498.324 | no disponible | LDV, 1.622 tokens | 97,75 | apache-2.0 |
| LexSPLADE xlm-roberta-xl silver (sin restricción) | 3.480.498.324 (según base) | no disponible | Vocabulario completo | 97,85 | apache-2.0 |
| LexSPLADE roberta-large silver LDV | no disponible | no disponible | LDV | no disponible | apache-2.0 |
| LexSPLADE bert-large silver LDV | no disponible | no disponible | LDV | no disponible | apache-2.0 |

Las variantes roberta-large y bert-large forman parte del mismo proyecto y familia de recetas, pero el model card no publica sus parámetros ni resultados de evaluación.

## Limitaciones y advertencias

- Solo entrenado con datos en inglés; la máscara de stop-words es una lista inglesa y el checkpoint no está pensado para texto en otros idiomas.
- La restricción al LDV limita la expresividad: solo se pueden activar 1.622 tokens, lo que puede impedir representar matices que quedarían fuera del vocabulario de definición.
- Si los marcadores `<t>` y `</t>` quedan truncados fuera de `max_seq_length`, el pooling recae sobre toda la oración y devuelve un embedding de oración en lugar de uno de palabra, lo que produce resultados silenciosamente distintos.
- Los vectores son de 250.000 dimensiones; deben mantenerse dispersos o indexar solo los 1.622 ids permitidos para evitar un uso de memoria desproporcionado.
- Requiere `trust_remote_code=True` por el módulo `modeling_lexsplade.py` incluido en el repo, lo que implica ejecutar código del autor del modelo.
- Entrenado con una única semilla (42); no se documenta variabilidad entre semillas.
- Los datos de entrenamiento incluyen pares silver verificados por LLM, lo que puede introducir sesgos o errores de anotación automática no cuantificados.
- No se documentan sesgos demográficos, sociales o culturales específicos, ni tasas de alucinación (el modelo no genera texto libre, sino vectores).
- Licencia apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base `facebook/xlm-roberta-xl` y de los datos de MCL-WiC.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jadermcs/lexsplade-xlm-roberta-xl-silver-ldv
- Modelo base: https://huggingface.co/facebook/xlm-roberta-xl
- Variante sin restricción de vocabulario: https://huggingface.co/jadermcs/lexsplade-xlm-roberta-xl-silver
- Variante RoBERTa-large con LDV: https://huggingface.co/jadermcs/lexsplade-roberta-large-silver-ldv
- Variante BERT-large con LDV: https://huggingface.co/jadermcs/lexsplade-bert-large-silver-ldv
