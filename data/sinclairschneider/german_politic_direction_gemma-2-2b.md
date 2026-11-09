# SinclairSchneider/german_politic_direction_gemma-2-2b

## Resumen

`german_politic_direction_gemma-2-2b` es un clasificador de texto en alemán que estima la orientación política de un texto sobre el eje izquierda-derecha. Desarrollado por SinclairSchneider (Universidad de la Bundeswehr de Múnich), parte de `google/gemma-2-2b` y se afina sobre un corpus de 636.717 textos políticos alemanes (1998 – septiembre de 2024) que combina discursos del Bundestag etiquetados con aplausos de los grupos parlamentarios, respuestas a los Wahl-O-Mat, programas electorales y paráfrasis generadas por LLM. El modelo devuelve seis puntuaciones de partido (Die Linke, Bündnis 90/Die Grünen, SPD, FDP, CDU/CSU y AfD) y una puntuación ideológica agregada entre −1 (izquierda) y +1 (derecha).

El problema que resuelve es la clasificación de postura política (stance detection) en alemán con granularidad de partido, algo poco cubierto por los modelos multilingües genéricos. Con 2.614 millones de parámetros, es un modelo compacto que cabe en GPU de consumo y que se distribuye con licencia CC-BY-4.0, lo que facilita su uso en investigación y en aplicaciones de análisis mediático.

Su relevancia actual radica en que acompaña a un artículo aceptado en ICWSM 2026 (*Ideology Prediction of German Political Texts*) y a una colección de cinco clasificadores comparables, con evaluaciones out-of-time sobre discursos del Bundestag de la 21ª legislatura (2025-2026), tesis de Wahl-O-Mat y 33 medios de comunicación alemanes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2), afinado como clasificador multi-etiqueta |
| Parametros totales | 2.614.355.712 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | alemán (de) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `google/gemma-2-2b`, un transformer decoder-only de 2.614 millones de parámetros, reconvertido a tarea de clasificación multi-etiqueta. La cabeza de clasificación produce seis probabilidades independientes (una por partido) mediante sigmoides, de modo que las puntuaciones no suman 1 y varios partidos pueden puntuar alto a la vez. La puntuación ideológica de −1 a +1 se calcula a partir de esas seis probabilidades con una fórmula pequeña definida en la model card.

El entrenamiento usa el dataset `SinclairSchneider/trainset_political_party_big`, con 636.717 textos que cubren desde 1998 hasta septiembre de 2024: discursos del Bundestag etiquetados con los aplausos registrados en los protocolos oficiales, respuestas de los partidos a los Wahl-O-Mat, programas electorales y paráfrasis de todos ellos generadas por LLM. No se detalla en la información disponible el número exacto de tokens de entrenamiento ni si hubo RLHF o DPO; el autor advierte que la partición aleatoria del 20% es optimista porque paráfrasis del mismo discurso pueden caer a ambos lados del split.

## Capacidades

- Clasificación multi-etiqueta de aprobación por partido: seis probabilidades independientes (Die Linke, Grüne, SPD, FDP, CDU/CSU, AfD).
- Puntuación ideológica agregada en el eje izquierda-derecha (−1 a +1).
- Detección de postura (stance detection) sobre textos políticos alemanes.
- Evaluación out-of-time sobre discursos parlamentarios, tesis de Wahl-O-Mat y tuits de diputados.
- Colocación de medios de comunicación en el eje izquierda-derecha (benchmark de 33 medios).
- Capacidad de ordenar partidos por afinidad ideológica a partir de textos agregados.
- No se documentan tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Análisis de discursos parlamentarios: procesar los protocolos del Bundestag y estimar qué grupos aplaudirían cada intervención, útil para estudios de polarización y disciplina de partido.
- Monitorización de medios: puntuar artículos de prensa alemana en el eje izquierda-derecha con un error absoluto medio de 0,167 en la escala −1…+1 sobre 33 cabeceras.
- Investigación en ciencias políticas: clasificar grandes corpus de textos (programas, tuits, comunicados) sin anotación manual, aprovechando el rendimiento out-of-domain del modelo.
- Análisis de redes sociales: identificar la orientación de tuits de diputados; el partido con mayor puntuación coincide con el autor en el 40,0% de los tuits y en el 73,8% de los que tienen 50 palabras o más.
- Verificación de encuestas y Wahl-O-Mat: contrastar las respuestas de los partidos a las tesis con las posiciones estimadas por el modelo (ROC-AUC macro de 0,862 en 2025/26).
- Filtrado y moderación de contenido político: prefiltrar textos por afinidad partidista antes de una revisión humana, dado el bajo coste computacional de un modelo de 2,6B.
- Docencia y divulgación: ilustrar cómo se mide la ideología política de forma cuantitativa con un modelo abierto y reproducible.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index (no verificados de forma independiente):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Aprobación multi-partido (in-distribution) | trainset_political_party_big (20% held-out) | Micro-F1 (umbral 0,5) | 0,7526 |
| Aprobación multi-partido (in-distribution) | trainset_political_party_big (20% held-out) | Micro precisión | 0,7832 |
| Aprobación multi-partido (in-distribution) | trainset_political_party_big (20% held-out) | Micro recall | 0,7243 |
| Aplausos en discursos del Bundestag (out-of-time, 2025-2026) | bundestag-plenarprotokolle-wp21 | ROC-AUC macro (5 grupos) | 0,8453 |
| Aplausos en discursos del Bundestag (out-of-time, 2025-2026) | bundestag-plenarprotokolle-wp21 | Micro-F1 (umbral 0,5) | 0,6871 |
| Acuerdo con tesis del Wahl-O-Mat (out-of-time, 2025-2026) | wahl-o-mat-2025-2026 (266 tesis) | ROC-AUC macro (6 partidos) | 0,8623 |
| Ubicación izquierda-derecha de medios (out-of-domain) | 33 medios vs. Medienkompass.org | MAE (ángulos calibrados, 9.535 artículos) | 0,1687 |
| Ubicación izquierda-derecha de medios (out-of-domain) | 33 medios vs. Medienkompass.org | MAE (ángulos por defecto) | 0,1884 |
| Partido del autor de tuits de diputados (out-of-domain) | tweets_from_members_of_the_german_bundestag (60.000 tuits) | Accuracy (partido con mayor puntuación) | 0,3998 |

Datos adicionales de la model card: ROC-AUC macro de 0,910 sobre discursos del período de entrenamiento; para el 88,7% de las tesis del Wahl-O-Mat el partido con mayor puntuación era realmente el que estaba de acuerdo (tasa base 53,4%); el modelo ocupa el puesto 1 de los 5 de su colección en el benchmark de discursos y en el de medios.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 5,2 GB en fp16 (2,614B parámetros), y aproximadamente 2,6-3 GB en cuantización de 8 bits.
- GPU recomendadas: A100, H100 o L40S para despliegues de alto throughput; RTX 4090, RTX 3090 o RTX 4080 para inferencia individual.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más de VRAM en fp16; en 4 bits podría caber en GPUs de 4-6 GB, aunque no se publican pesos cuantizados.
- Opciones de despliegue: `transformers` (librería declarada), `text-classification` pipeline, endpoints compatibles según los tags; vLLM, llama.cpp, Ollama y TGI no están documentados para este modelo y requerirían conversión manual de pesos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

El autor publica una colección de cinco clasificadores políticos alemanes comparables. La información disponible solo detalla el rendimiento relativo de este modelo (puesto 1 de 5 en discursos del Bundestag y en medios), sin cifras de las alternativas.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| german_politic_direction_gemma-2-2b | 2,614B | no disponible | CC-BY-4.0 | Hugging Face | Puesto 1 de 5 en la colección del autor |
| Otros 4 clasificadores de la colección SinclairSchneider | no disponible | no disponible | no disponible | Hugging Face (colección) | Sin cifras detalladas en la información disponible |
| Gemma 2 2B base (google) | 2,614B | no disponible | Gemma license | Hugging Face | Modelo base, no especializado en política alemana |

## Limitaciones y advertencias

- Las seis puntuaciones miden aprobación, no autoría: son probabilidades sigmoides independientes que no suman 1 y varios partidos pueden puntuar alto simultáneamente.
- Los resultados in-distribution (F1 0,753) son optimistas porque paráfrasis del mismo discurso pueden aparecer en ambos lados del split.
- El modelo solo cubre alemán; no se ha evaluado en otros idiomas.
- El benchmark de medios usa ángulos calibrados sobre las mismas 33 cabeceras, lo que puede inflar ligeramente el resultado frente a un uso con medios no vistos.
- La precisión sobre tuits es baja (40,0% en todos los tuits, aunque sube al 73,8% en tuits de 50 palabras o más): el modelo rinde peor en textos cortos e informales.
- Riesgo de alucinación y de sobrerrepresentación de posiciones: al ser un clasificador, no genera explicaciones ni citas verificables.
- Sesgos potenciales derivados del corpus de entrenamiento (protocolos del Bundestag, Wahl-O-Mat, programas y paráfrasis de LLM), que pueden infrarepresentar formaciones extraparlamentarias o discursos no institucionales.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero conviene revisar las condiciones del modelo base Gemma 2 de Google.
- No se publican pesos cuantizados ni se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el despliegue estándar es vía `transformers`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SinclairSchneider/german_politic_direction_gemma-2-2b
- Modelo base: https://huggingface.co/google/gemma-2-2b
- Dataset de entrenamiento: https://huggingface.co/datasets/SinclairSchneider/trainset_political_party_big
- Dataset de tuits: https://huggingface.co/datasets/SinclairSchneider/tweets_from_members_of_the_german_bundestag
- Colección de clasificadores políticos alemanes: https://huggingface.co/collections/SinclairSchneider/german-political-classifier-afd-grunen-cdu-etc
- Artículo (ICWSM 2026): https://doi.org/10.1609/icwsm.v20i1.42735
- Código: https://github.com/SinclairSchneider/german_ideology_prediction
- Paper de referencia (transformers): https://arxiv.org/abs/1910.09700
- Paper de referencia (Gemma 2): https://arxiv.org/abs/2408.00118
