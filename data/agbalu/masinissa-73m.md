# agbalu/Masinissa-73M

## Resumen

Masinissa-73M es un modelo de lenguaje enmascarado (masked language model) de tipo encoder, con 73,3 millones de parámetros, desarrollado por el usuario agbalu y entrenado desde cero específicamente para el kabileño (taqbaylit, código ISO `kab`), una lengua bereber de la familia amazigh escrita en alfabeto latino. El modelo aborda el problema de la escasez de representaciones contextuales de alta calidad para lenguas de bajos recursos, un ámbito donde los modelos multilingües genéricos suelen rendir por debajo de lo esperado por sesgos de tokenización y de dominio lingüístico.

La propuesta técnica se apoya en tres decisiones concretas: un entrenamiento monolingüe sobre 3.920 millones de tokens de texto kabileño deduplicado y con trazabilidad de procedencia, una evaluación estrictamente con encoder congelado (solo se ajusta la sonda), y la publicación de un benchmark unificado propio, `KabEncBench`, con seis tareas lingüísticas principales y tres sondas diagnósticas. El autor declara un resultado de 1.953,7 puntos Elo en un torneo Bradley–Terry con 2.000 remuestreos bootstrap, lo que lo sitúa en el Tier 1 y por delante del siguiente baseline externo en 753,4 puntos Elo.

El modelo es relevante ahora porque demuestra que un encoder pequeño y monolingüe puede superar a alternativas multilingües de 110 a 278 millones de parámetros en tareas kabileñas, y porque introduce métricas de robustez ortográfica frente a la sustitución de homoglifos (ε por ɛ, γ por ɣ), un fenómeno presente en el 2,6–3,2 % de los corpus públicos de esta lengua. Su licencia Apache 2.0 y su tamaño reducido (0,3 GB de repositorio) lo hacen desplegable en hardware modesto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer bidireccional (masked language model); detalles de capas y dimensiones no disponibles |
| Parámetros totales | 73.318.016 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en safetensors; no se documentan variantes GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | Kabileño (`kab`, taqbaylit, alfabeto latino) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (requiere `custom_code`) |

## Arquitectura y entrenamiento

Masinissa-73M es un encoder transformer bidireccional entrenado con objetivo de modelado de lenguaje enmascarado, la misma familia arquitectónica que BERT o XLM-R, pero entrenado desde cero en lugar de partir de un modelo multilingüe. El autor no detalla en la información disponible el número de capas, la dimensión oculta, el número de cabezas de atención ni el tamaño del vocabulario; tampoco especifica la longitud máxima de secuencia ni la estrategia de enmascaramiento.

El corpus de entrenamiento comprende 3.920 millones de tokens de texto kabileño deduplicado y con procedencia registrada. No se documentan en la información disponible la composición exacta del dataset, el uso de RLHF o DPO (poco habitual en encoders) ni innovaciones como decodificación especulativa o atención lineal. La innovación metodológica destacable no está en la arquitectura sino en la evaluación: todas las comparaciones se realizan con el backbone 100 % congelado, aplicando una mezcla escalar ponderada por capas (`ScalarMix`) y una sonda lineal ajustada con 5 semillas aleatorias por tasa de aprendizaje, de modo que las métricas reflejan lo que el preentrenamiento ha codificado en la representación y no la capacidad de una cabeza de tarea profunda.

El modelo requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica que la implementación de la arquitectura viaja en el repositorio y no en la librería `transformers` estándar.

## Capacidades

- Generación de representaciones contextuales bidireccionales para texto kabileño en alfabeto latino.
- Relleno de máscaras (`fill-mask`), tarea declarada en el pipeline del modelo.
- Etiquetado de secuencias: POS tagging, NER y otras tareas token-level mediante sonda o fine-tuning.
- Clasificación de secuencias: análisis de sentimiento, clasificación temática y detección de tópicos.
- Similitud semántica de frases y recuperación semántica (retrieval), según los usos previstos declarados por el autor.
- Parsing de dependencias (uso previsto declarado, sin métricas publicadas en la información disponible).
- Robustez ortográfica ante corrupción por homoglifos: retiene 91,51 % de accuracy en POS con entrada corrompida frente a 94,08 % con entrada limpia.
- No soporta generación de texto, diálogo abierto ni traducción: es un encoder bidireccional y el autor lo declara explícitamente inadecuado para esos usos.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Etiquetado morfosintáctico en producción: con una sonda lineal sobre el encoder congelado se alcanza 94,08 % de accuracy en tokens superficiales sobre `UD_Kabyle-ADPT`, suficiente para anotar corpus kabileños a gran escala sin reentrenar el backbone.
- Reconocimiento de entidades nombradas: el modelo obtiene 88,24 % de Micro-F1 en la tarea NER de `KabEncBench`, lo que permite extraer nombres de personas, lugares y organizaciones de textos kabileños para indexación o bases de datos.
- Análisis de sentimiento en redes sociales y prensa: 93,83 % en la tarea de sentimiento del benchmark, aplicable a monitorización de opinión en contenido kabileño donde los modelos multilingües rinden peor.
- Recuperación semántica y búsqueda: al producir embeddings de frase de calidad, sirve como motor de búsqueda semántica o de deduplicación de documentos en un corpus kabileño, un caso donde el tamaño de 73 M permite indexar millones de documentos en CPU o GPU modesta.
- Normalización y limpieza ortográfica: la resistencia documentada a homoglifos (91,51 % de accuracy bajo corrupción) lo hace útil como componente de detección y corrección de sustituciones ε/ɛ y γ/ɣ en corpus digitalizados.
- Clasificación temática de noticias y documentos: 64,87 % en SIB-200, útil para enrutado y categorización de contenido en pipelines editoriales o de archivo.
- Investigación lingüística sobre el kabileño: la evaluación con encoder congelado y la separación entre tokens superficiales y palabras gold (29,5 % de las palabras de `UD_Kabyle-ADPT` caen dentro de tokens multi-palabra) ofrecen una base reproducible para estudiar tokenización y morfología de la lengua.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente). El torneo Bradley–Terry se calcula con 2.000 remuestreos bootstrap por clúster y está anclado en `FacebookAI/xlm-roberta-base` = 1.000.

| Rank | Modelo | Parámetros | Elo (IC 95 %) | Tier |
|:---:|:---|:---:|:---:|:---:|
| 1 | `agbalu/Masinissa-73M` | 73 M | 1.953,7 [1.534,7; 3.379,1] | Tier 1 |
| 2 | `agbalu/Masinissa-31M` | 31 M | 1.708,4 [1.371,1; 2.886,2] | Tier 2 |
| 3 | `UBC-NLP/serengeti-E250` | 278 M | 1.200,3 [953,6; 1.480,1] | Tier 3 |
| 4 | `Davlan/afro-xlmr-base-76L_script` | 278 M | 1.151,6 [919,5; 1.451,0] | Tier 3 |
| 5 | `UBC-NLP/serengeti-E110` | 110 M | 1.148,2 [918,5; 1.421,2] | Tier 3 |
| 6 | `jhu-clsp/mmBERT-base` | 278 M | 1.141,7 [906,4; 1.435,3] | Tier 3 |
| 7 | `jhu-clsp/mmBERT-small` | 135 M | 1.039,1 [804,2; 1.282,5] | Tier 3 |
| 8 | `google-bert/bert-base-multilingual-cased` | 178 M | 1.012,6 [780,9; 1.266,8] | Tier 4 |
| 9 | `FacebookAI/xlm-roberta-base` (ancla) | 278 M | 1.000,0 [1.000,0; 1.000,0] | Tier 4 |

Rendimiento por tarea (%) en `KabEncBench`, Track A (sonda congelada):

| Modelo | UPOS | Aspect | NER (Micro-F1) | Sentimiento | SIB-200 | Puntuación | TaPaCo | Pares mínimos |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `Masinissa-73M` | 80,59 | 57,91 | 88,24 | 93,83 | 64,87 | 55,42 | 64,38 | 60,90 |
| `Masinissa-31M` | 78,88 | 54,19 | 87,74 | 92,06 | 59,28 | 52,21 | 58,78 | 18,70 |
| `serengeti-E250` | 76,98 | 49,13 | 83,98 | 85,33 | 43,72 | 45,54 | 42,55 | 6,30 |
| `serengeti-E110` | 76,24 | 48,83 | 84,91 | 85,65 | 39,64 | 43,11 | 43,86 | 4,70 |
| `mmBERT-base` | 75,52 | 48,44 | 84,01 | 85,64 | 37,96 | 39,98 | 48,63 | 53,30 |
| `mmBERT-small` | 75,72 | 45,84 | 81,79 | 83,17 | 34,94 | 39,91 | 48,98 | 61,00 |
| `xlm-roberta-base` | 75,44 | 44,52 | 79,71 | 84,75 | 38,21 | 39,12 | 42,13 | 57,40 |
| `afro-xlmr-base` | 75,32 | 47,93 | 83,04 | 85,75 | 38,41 | 38,56 | 48,54 | 62,50 |
| `bert-base-multilingual` | 73,21 | 46,79 | 80,62 | 84,35 | 40,84 | 39,01 | 51,77 | 27,00 |

POS tagging sobre `UD_Kabyle-ADPT` (test: 845 frases, 10.181 palabras, 8.563 tokens separados por espacios):

| Sistema | Palabras gold | Superficial | Palabras gold, corrompido | Superficial, corrompido |
|:---|:---:|:---:|:---:|:---:|
| `Masinissa-73M` + sonda lineal | 93,82 % | 94,08 % | 91,28 % | 91,51 % |
| `Masinissa-31M` + sonda lineal | 90,38 % | 90,51 % | 87,10 % | 87,42 % |
| Baseline de etiqueta más frecuente | 84,14 % | 83,42 % | 80,23 % | 79,52 % |
| `boffire/kabyle-pos-v2` | 56,50 % | 63,69 % | 55,10 % | 62,35 % |
| Proyección de léxico | 26,65 % | 27,67 % | 23,15 % | 24,15 % |

Desglose sin puntuación:

| Sistema | Superficial (limpio) | Superficial (sin puntuación) | Macro-F1 (todo) | Macro-F1 (sin puntuación) |
|:---|:---:|:---:|:---:|:---:|
| `Masinissa-73M` | 94,08 % | 92,20 % | 0,7743 | 0,7582 |
| `Masinissa-31M` | 90,51 % | 87,50 % | 0,7301 | 0,7110 |
| Etiqueta más frecuente | 83,42 % | 78,16 % | 0,7051 | 0,6841 |

## Requisitos de hardware

- VRAM estimada para inferencia: con 73,3 M de parámetros en fp32, los pesos ocupan aproximadamente 293 MB; en fp16, unos 147 MB. La memoria adicional depende de la longitud de secuencia y del tamaño de lote, no disponible en la información proporcionada.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en fp16 con lotes moderados; una RTX 4090, A100 o H100 quedan sobredimensionadas para inferencia y solo tienen sentido para fine-tuning a gran escala o extracción masiva de embeddings.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (GTX 1650, RTX 3060, RTX 4060 y superiores) e incluso en CPU para volúmenes moderados, dado el tamaño del repositorio (0,3 GB).
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía documentada, dado el uso de `custom_code`. No se documenta en la información disponible soporte para vLLM, TGI, llama.cpp u Ollama; la conversión a GGUF requeriría trabajo adicional al no publicarse variantes cuantizadas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Elo KabEncBench | Licencia | Disponibilidad |
|:---|:---:|:---:|:---:|:---|:---|
| `agbalu/Masinissa-73M` | 73 M | No disponible | 1.953,7 | Apache 2.0 | Hugging Face |
| `agbalu/Masinissa-31M` | 31 M | No disponible | 1.708,4 | No disponible en la información | Hugging Face |
| `UBC-NLP/serengeti-E250` | 278 M | No disponible | 1.200,3 | No disponible en la información | Hugging Face |
| `jhu-clsp/mmBERT-base` | 278 M | No disponible | 1.141,7 | No disponible en la información | Hugging Face |
| `FacebookAI/xlm-roberta-base` | 278 M | 512 tokens (referencia estándar del modelo base) | 1.000,0 (ancla) | MIT (referencia del modelo original) | Hugging Face |

La comparación relevante es de eficiencia: Masinissa-73M supera en Elo a `serengeti-E250` (278 M) y a `mmBERT-base` (278 M) con menos de una tercera parte de los parámetros, y la mayor diferencia se concentra en tareas específicas de la lengua como SIB-200 (64,87 frente a 43,72 y 37,96) y TaPaCo (64,38 frente a 42,55 y 48,63). En pares mínimos ortográficos, sin embargo, `afro-xlmr-base` obtiene 62,50 frente a 60,90 de Masinissa-73M, y `mmBERT-small` 61,00, por lo que la ventaja no es uniforme en todas las sondas.

## Limitaciones y advertencias

- Modelo monolingüe: solo cubre kabileño (`kab`) en alfabeto latino; no es adecuado para otras lenguas bereberes ni para texto en árabe o tifinagh.
- No es generativo: al ser un encoder bidireccional, no sirve para continuación de texto, diálogo abierto ni traducción, tal como advierte el autor.
- Riesgo de alucinación no aplica en el sentido generativo, pero las sondas y cabezas ajustadas sobre el encoder pueden producir etiquetas erróneas en dominios alejados del corpus de entrenamiento.
- Sesgos: no se documentan análisis de sesgo en la información disponible; el corpus procede de texto kabileño deduplicado y con procedencia registrada, pero no se detalla su composición demográfica ni temática.
- Dependencia de `custom_code`: requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio del autor; conviene revisar la implementación antes de desplegarlo en producción.
- Ambigüedad de métricas POS: el 29,5 % de las palabras de `UD_Kabyle-ADPT` cae dentro de tokens multi-palabra, de modo que la accuracy varía según se puntúe segmentación gold o tokens superficiales; hay que fijar explícitamente el criterio al comparar resultados.
- Resultados no verificados: todas las cifras de benchmarks proceden del `model-index` y de la model card del autor, marcadas como `verified: false`; no hay replicación independiente disponible.
- Intervalos de confianza amplios en Elo: el IC 95 % de Masinissa-73M va de 1.534,7 a 3.379,1, con solapamiento parcial con el de Masinissa-31M, por lo que la separación entre ambos es menos rotunda de lo que sugiere la diferencia puntual.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución y aviso de cambios; no se documentan restricciones adicionales de uso aceptable en la información disponible.
- Sin variantes cuantizadas publicadas: no hay GGUF ni otros formatos optimizados, lo que limita el despliegue en entornos que dependen de llama.cpp u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agbalu/Masinissa-73M
- Modelo hermano Masinissa-31M: https://huggingface.co/agbalu/Masinissa-31M
- Baseline `UBC-NLP/serengeti-E250`: https://huggingface.co/UBC-NLP/serengeti-E250
- Baseline `Davlan/afro-xlmr-base-76L_script`: https://huggingface.co/Davlan/afro-xlmr-base-76L_script
- Baseline `jhu-clsp/mmBERT-base`: https://huggingface.co/jhu-clsp/mmBERT-base
- Ancla `FacebookAI/xlm-roberta-base`: https://huggingface.co/FacebookAI/xlm-roberta-base
- Corpus UD Kabyle-ADPT: https://universal-dependencies.org/
- Repositorio del modelo POS previo `boffire/kabyle-pos-v2`: https://huggingface.co/boffire/kabyle-pos-v2
