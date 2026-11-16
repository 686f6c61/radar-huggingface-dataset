# jadermcs/lexsplade-xlm-roberta-xl-silver-xllexeme

## Resumen

LexSPLADE (xlm-roberta-xl, silver + XL-LEXEME clean) es un codificador léxico disperso y contextual desarrollado por jadermcs. A diferencia de los modelos de embeddings de frases convencionales, no devuelve un vector por oración, sino un vector disperso sobre el vocabulario de 250.004 tokens de XLM-R que describe una palabra concreta en su contexto. Cada dimensión del vector corresponde a una entrada del vocabulario, por lo que el resultado puede leerse directamente como una lista de palabras relacionadas. El modelo parte de facebook/xlm-roberta-xl (3.500 millones de parámetros) y se ha afinado en dos etapas con LoRA sobre datos en inglés y multilingües.

El modelo resuelve el problema de la desambiguación léxica en contexto (word-in-context) y la representación léxica multilingüe: permite comparar el significado de una misma palabra en dos contextos distintos y en distintos idiomas. Es relevante porque combina la interpretabilidad de un codificador disperso tipo SPLADE con la cobertura de un vocabulario multilingüe amplio, y porque mejora de forma sustancial a su predecesor en pares cross-lingual (5,9 puntos de AP en MCL-WiC). La arquitectura subyacente es un transformer encoder XLM-R XL de 3.500 millones de parámetros con una cabeza MLM aplicada únicamente al span marcado.

La ficha se basa en la información publicada en Hugging Face por el autor; no se dispone de paper asociado ni de datos de benchmarks independientes más allá de los reportados en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa XL) con cabeza MLM y pooling de span objetivo; salida dispersa tipo SPLADE |
| Parametros totales | 3.480.498.324 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (limitada por `max_seq_length` de XLM-R; no se especifica el valor exacto en la model card) |
| Tipos de cuantizacion | no disponible (la model card solo menciona bf16 para inferencia; ~7 GB en bf16) |
| Idiomas soportados | multilingüe: en, ar, fr, ru, zh, de, it, ja, ko, nl, da, bg, et, fa, hr, fi, id, tr, eu |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería sentence-transformers; incluye `modeling_lexsplade.py` con código remoto) |

## Arquitectura y entrenamiento

El modelo se construye sobre facebook/xlm-roberta-xl, un transformer encoder de 3.500 millones de parámetros con vocabulario de 250.004 tokens. La innovación principal es el pooling de span objetivo: se marca la palabra de interés con `<t>…</t>` y la cabeza MLM se aplica únicamente a los tokens marcados, centrando los logits (z = 2.5, restando la media y 2,5 desviaciones típicas por token antes del ReLU). Esto evita generar un tensor de logits de tamaño `[batch, seq, 250k]` y produce un vector disperso interpretable sobre el vocabulario. Se enmascaran tokens especiales, stop words en inglés y tokens sin letras ni dígitos.

El entrenamiento tiene dos etapas. La primera usa LoRA con r = 16 y lr 2e-4 sobre 31.914 pares de word-in-context en inglés (datos silver verificados por LLM más el conjunto de entrenamiento de MCL-WiC). La segunda continúa con un nuevo adaptador LoRA (r = 16, lr 5e-5, hasta 6 épocas, mejor en la 4) sobre los datos de la etapa 1 más 15.244 pares de datos de entrenamiento de XL-LEXEME limpios, que abarcan 23 idiomas y 10.012 pares cross-lingual procedentes de AM²iCo, XL-WiC y WiC, filtrados por la puntuación de un checkpoint de la etapa 1 y equilibrados por idioma. La base se mantiene en bf16, los embeddings de marcador y la cabeza MLM se entrenan completos, y los adaptadores se fusionan en el checkpoint final. La función de pérdida combina AnglE loss sobre los vectores dispersos, un regularizador SPLADE de FLOPS (1e-3) y un término Barlow Twins sobre la representación densa del span. La semilla es 43.

## Capacidades

- Codificación léxica contextual: dado un término marcado en una oración, devuelve un vector disperso sobre el vocabulario que representa ese término en ese contexto concreto.
- Desambiguación de sentido (word-sense disambiguation): distingue significados distintos de una misma palabra según el contexto, con vectores que pueden compararse por similitud coseno.
- Representación multilingüe: soporta 19 idiomas listados y pares cross-lingual (por ejemplo, en-ar, en-fr, en-ru, en-zh).
- Vectores interpretables: las dimensiones del vector corresponden a tokens del vocabulario, por lo que puede leerse como una lista de palabras relacionadas (por ejemplo, para "bank" en contexto financiero: checking, account, bank, cash, loan, money).
- Extracción de características (feature-extraction): pipeline declarado en Hugging Face.
- Integración con sentence-transformers mediante la clase `SparseEncoder` con `trust_remote_code=True`.
- No es un modelo generativo: no soporta tool calling, agentes ni generación de texto. No dispone de modo thinking, visión ni audio.

## Casos de uso

- Desambiguación léxica en buscadores y motores de recuperación: marcar el término de consulta y usar el vector disperso para expandir la consulta con términos relacionados del sentido correcto, mejorando el recall en búsqueda léxica sin necesidad de un modelo generativo.
- Sistemas de recuperación sparse (SPLADE): los vectores dispersos sobre 250.004 dimensiones son compatibles con índices invertidos, por lo que pueden integrarse en pipelines de búsqueda neural dispersa multilingüe.
- Construcción de tesauros y grafos léxicos multilingües: agrupar apariciones de una palabra por similitud de sus vectores contextuales para inducir sentidos y relaciones léxicas de forma automática.
- Análisis de sentimiento o clasificación a nivel de término: usar la representación contextual de una palabra clave (por ejemplo, un adjetivo valorativo) como característica para un clasificador descendente.
- Traducción asistida y control de calidad terminológica: comparar el vector de un término en el idioma origen y en el idioma destino para verificar que el sentido se preserva en la traducción.
- Investigación en semántica distribucional y evaluación de word-in-context: el modelo sirve como baseline reproducible (semilla 43, receta documentada) para experimentos académicos sobre desambiguación léxica multilingüe.
- Enriquecimiento de ontologías y bases de conocimiento: alinear entradas léxicas entre idiomas mediante la similitud de sus vectores contextuales cross-lingual.

## Benchmarks y rendimiento

Resultados de la model card (AP = average precision de la similitud coseno):

| Conjunto | AP |
|---|---|
| MCL-WiC test (en-en) | 97,63 |
| MCL-WiC dev (en-en) | 96,70 |
| crosslemma dev | 95,43 |
| MCL-WiC test, mismo idioma (ar / fr / ru / zh) | 93,18 / 94,80 / 93,58 / 91,98 |
| MCL-WiC test, cross-lingual (en-ar / en-fr / en-ru / en-zh) | 93,71 / 93,27 / 93,96 / 93,76 |
| XL-WiC test, media de 12 idiomas | 79,32 |

XL-WiC test por idioma: bg 77,81; da 84,72; de 74,67; et 75,99; fa 94,90; fr 74,45; hr 76,43; it 74,38; ja 71,43; ko 77,46; nl 83,38; zh 86,26.

Comparación de la receta sobre tres semillas (42, 43, 44):

| Métrica | Esta receta | `-xl-silver` (solo etapa 1) |
|---|---|---|
| MCL-WiC test (en) | 97,58 ± 0,12 | 97,55 ± 0,35 |
| MCL-WiC cross-lingual, media de 4 pares | 93,28 ± 0,65 | 87,35 ± 2,75 |
| XL-WiC test, media de 12 idiomas | 78,89 ± 0,43 | 77,03 ± 0,49 |

La model card indica que la semilla 43 es la mejor de las tres en MCL-WiC cross-lingual y XL-WiC, y está a 0,04 del mejor resultado en inglés. El número medio de dimensiones no nulas por uso en MCL-WiC test (en) es de 219 sobre 250.004. No se han publicado resultados de benchmarks independientes en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7 GB en bf16 (3.500 millones de parámetros), según la model card.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en GPUs de 16 GB o más (por ejemplo, RTX 4090, A100, H100) en bf16; en GPUs de 8-12 GB requeriría cuantización o precisión reducida, aunque no se documentan opciones de cuantización.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 16 GB de VRAM en bf16 (RTX 4090, RTX 4080, etc.), siempre que se mantengan los vectores dispersos y no se densifiquen en bloque.
- Opciones de despliegue: sentence-transformers con `SparseEncoder` y `trust_remote_code=True`; al ser un encoder de extracción de características, también puede servirse mediante frameworks de inferencia estándar, aunque no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.
- Nota de memoria: los vectores son de 250.004 dimensiones; conviene mantenerlos dispersos o densificar pocos a la vez para evitar picos de memoria.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (referencia) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jadermcs/lexsplade-xlm-roberta-xl-silver-xllexeme | 3.500 M | no disponible | MCL-WiC en 97,63 AP; XL-WiC media 12 idiomas 79,32 AP | apache-2.0 | Hugging Face |
| jadermcs/lexsplade-xlm-roberta-xl-silver | 3.500 M | no disponible | MCL-WiC en 97,55 AP; XL-WiC media 77,03 AP (media de 3 semillas) | no disponible en la información | Hugging Face |
| jadermcs/lexsplade-xlm-roberta-large-silver | XLM-R large (tamaño no especificado) | no disponible | no disponible | no disponible en la información | Hugging Face |
| jadermcs/lexsplade-roberta-large-silver-wic-wnbags | RoBERTa large (tamaño no especificado) | no disponible | no disponible | no disponible en la información | Hugging Face |

Las alternativas comparables son las variantes del propio autor, ya que no se dispone de datos de otros modelos de codificación léxica contextual en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no soporta tool calling, agentes ni razonamiento multi-paso. Su uso está restringido a extracción de características léxicas.
- Requiere `trust_remote_code=True` y ejecuta código personalizado (`modeling_lexsplade.py`) incluido en el repositorio; conviene auditar ese código antes de usarlo en producción.
- Si los marcadores `<t>…</t>` quedan truncados por `max_seq_length`, el pooling cae al conjunto de la oración y devuelve un embedding de frase en lugar de un embedding de palabra, lo que altera el comportamiento esperado.
- Los vectores tienen 250.004 dimensiones; densificarlos de forma masiva puede agotar la memoria. Deben mantenerse dispersos o densificar pocos a la vez.
- Riesgo de alucinación: no aplica en el sentido generativo, pero los vectores dispersos pueden incluir términos relacionados ruidosos o poco pertinentes según el contexto.
- Sesgos: no se documentan análisis de sesgo. El enmascarado de stop words usa una lista en inglés, lo que puede introducir un sesgo hacia el inglés en el tratamiento de palabras funcionales en otros idiomas.
- Cobertura de idiomas desigual: los resultados en XL-WiC varían notablemente (por ejemplo, fa 94,90 frente a ja 71,43), por lo que el rendimiento en algunos idiomas es sensiblemente inferior.
- Datos de entrenamiento: XL-WiC train y dev forman parte del entrenamiento, según la model card; los resultados en esos conjuntos no deben interpretarse como evaluación independiente. Los conjuntos de test indicados no están en el entrenamiento según el autor.
- Licencia apache-2.0: permite uso comercial, pero el modelo base facebook/xlm-roberta-xl debe verificarse por separado; no se detallan restricciones adicionales en la información disponible.
- No se documentan opciones de cuantización ni requisitos de latencia/throughput, lo que dificulta planificar despliegues de producción de alto rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jadermcs/lexsplade-xlm-roberta-xl-silver-xllexeme
- Modelo base: https://huggingface.co/facebook/xlm-roberta-xl
- Variante etapa 1: https://huggingface.co/jadermcs/lexsplade-xlm-roberta-xl-silver
- Variante con vocabulario Longman: https://huggingface.co/jadermcs/lexsplade-xlm-roberta-xl-silver-ldv
- Variante XLM-R large: https://huggingface.co/jadermcs/lexsplade-xlm-roberta-large-silver
- Variante RoBERTa large: https://huggingface.co/jadermcs/lexsplade-roberta-large-silver-wic-wnbags
- Variante BERT large: https://huggingface.co/jadermcs/lexsplade-bert-large-silver
- Paper, blog o demo: no disponibles en la información proporcionada.
