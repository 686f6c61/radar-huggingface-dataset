# SinclairSchneider/german_politic_direction_DeBERTa-large

## Resumen

`german_politic_direction_DeBERTa-large` es un clasificador de texto en alemán desarrollado por SinclairSchneider que estima la posición ideológica de un texto político en el eje izquierda-derecha. Se construye a partir de `ikim-uk-essen/geberta-xlarge` (GeBERTa-xlarge, un DeBERTa-v2 adaptado al alemán) afinado sobre el dataset `SinclairSchneider/trainset_political_party_big`. El modelo devuelve seis puntuaciones independientes (una por partido: Die Linke, Bündnis 90/Die Grünen, SPD, FDP, CDU/CSU y AfD) que representan la probabilidad de que militantes de ese partido aplaudan o estén de acuerdo con el texto, más una puntuación ideológica agregada en el rango −1 (izquierda) a +1 (derecha).

El modelo resuelve un problema concreto de análisis político computacional: la clasificación multi-etiqueta de afinidad partidista y la colocación ideológica de textos en alemán, con aplicaciones en análisis de discurso parlamentario, medios de comunicación y redes sociales. Es relevante porque aborda la detección de postura política con un transformer grande (886 millones de parámetros) entrenado sobre datos del Bundestag, programas electorales y el Wahl-O-Mat, y porque cuenta con una publicación asociada en ICWSM 2026.

La ficha se basa en la model card oficial y en los resultados del model-index declarados por el autor (no verificados de forma independiente). El modelo tiene un uso muy específico (clasificación política en alemán) y no es un modelo generativo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (transformer encoder), base `ikim-uk-essen/geberta-xlarge` |
| Parametros totales | 886.964.742 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Alemán (`de`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `ikim-uk-essen/geberta-xlarge`, un DeBERTa-v2 de tipo xlarge adaptado al alemán. La cabeza de clasificación es multi-etiqueta: seis salidas independientes con activación sigmoide (una por partido), de modo que las probabilidades no suman 1 y varias formaciones pueden puntuar alto simultáneamente. La puntuación ideológica en el rango −1 a +1 se calcula a partir de las seis puntuaciones mediante una fórmula definida por el autor.

El entrenamiento se realizó sobre `SinclairSchneider/trainset_political_party_big`, un corpus de 636.717 textos que abarca de 1998 a septiembre de 2024. La composición incluye discursos del Bundestag etiquetados con los grupos parlamentarios que aplaudieron, respuestas de los partidos al Wahl-O-Mat, programas electorales y paráfrasis generadas por LLM de todos ellos. El autor advierte que la partición de evaluación in-distribution (20 % aleatorio) es optimista porque paráfrasis del mismo discurso pueden caer a ambos lados de la partición. No se detalla en la información disponible si hubo RLHF, DPO u otras fases de alineamiento (no aplicable en un encoder de clasificación).

## Capacidades

- Clasificación multi-etiqueta de afinidad partidista: seis probabilidades independientes (Die Linke, Grüne, SPD, FDP, CDU/CSU, AfD).
- Estimación de posición ideológica en el eje izquierda-derecha (−1 a +1) derivada de las seis puntuaciones.
- Detección de postura (stance detection) sobre textos políticos en alemán.
- Análisis de discurso parlamentario (protocolos del Bundestag).
- Evaluación de afinidad con tesis del Wahl-O-Mat.
- Colocación ideológica de artículos de medios de comunicación.
- Clasificación del partido del autor de tuits de miembros del Bundestag.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un encoder de clasificación, no un modelo generativo).
- Capacidad monolingüe: solo alemán.

## Casos de uso

- Análisis de discurso parlamentario: procesar protocolos del Bundestag y estimar qué grupos aplaudirían cada intervención, útil para estudiar dinámicas de coalición y oposición con datos objetivos de aplausos.
- Monitorización de medios: asignar una posición ideológica a artículos de prensa alemana para estudios de pluralismo mediático, comparando con ratings externos como Medienkompass.org.
- Investigación en ciencias políticas: cuantificar el desplazamiento ideológico de partidos a lo largo del tiempo analizando programas electorales y respuestas al Wahl-O-Mat.
- Análisis de redes sociales: clasificar tuits de políticos y estimar la afinidad partidista del contenido, con precisión que sube a 72,6 % en tuits de 50 palabras o más.
- Verificación de encuadre editorial: detectar sesgos de encuadre en coberturas informativas comparando la puntuación ideológica del texto con la línea editorial declarada del medio.
- Segmentación de corpus para estudios de opinión: etiquetar grandes volúmenes de texto político alemán por afinidad partidista para construir subconjuntos de análisis.
- Evaluación de programas electorales: medir la distancia ideológica entre propuestas de distintos partidos sobre temas concretos.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Aprobación partidista multi-etiqueta (in-distribution) | trainset_political_party_big (20 % held-out) | Micro-F1 (umbral 0,5) | 0,7722 |
| Aprobación partidista multi-etiqueta (in-distribution) | trainset_political_party_big (20 % held-out) | Micro precisión | 0,8051 |
| Aprobación partidista multi-etiqueta (in-distribution) | trainset_political_party_big (20 % held-out) | Micro recall | 0,7418 |
| Aplausos en discursos del Bundestag (out-of-time, WP21 2025-2026) | bundestag-plenarprotokolle-wp21 | Macro ROC-AUC (5 grupos) | 0,8069 |
| Aplausos en discursos del Bundestag (out-of-time, WP21 2025-2026) | bundestag-plenarprotokolle-wp21 | Micro-F1 (umbral 0,5) | 0,6524 |
| Acuerdo con tesis del Wahl-O-Mat (out-of-time, 2025-2026) | wahl-o-mat-2025-2026 (266 tesis) | Macro ROC-AUC (6 partidos) | 0,8572 |
| Colocación izquierda-derecha en prensa (out-of-domain) | NLP-UniBW/german-media (33 medios) | MAE (ángulos calibrados, 9.535 artículos) | 0,1867 |
| Colocación izquierda-derecha en prensa (out-of-domain) | NLP-UniBW/german-media (33 medios) | MAE (ángulos por defecto) | 0,1920 |
| Partido del autor de tuits (out-of-domain) | tweets_from_members_of_the_german_bundestag (60.000 tuits) | Accuracy (partido con mayor puntuación) | 0,4219 |

Datos adicionales de la model card: en el benchmark de prensa, el MAE medio con ángulos calibrados es 0,175 (0,182 en el paper); con ajuste leave-one-outlet-out es 0,187. En tuits de 50 palabras o más, la precisión sube al 72,6 %. El orden de partidos promediado en discursos de 2025/26 es: Linke −0,72, Grüne −0,39, SPD −0,41, CDU/CSU +0,03, AfD +0,81. El modelo ocupa el puesto 3 de 5 en la colección del autor en las tareas de aplausos y prensa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un encoder de 886 M de parámetros en fp32 se requieren aproximadamente 3,5 GB de pesos, y en fp16 unos 1,8 GB, más memoria para activaciones y batch.
- GPU recomendadas: no especificadas por el autor; por tamaño, una GPU consumer de gama media-alta (RTX 3060 12 GB, RTX 4070, RTX 4090) es suficiente para inferencia en fp16 o int8.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con 6 GB o más de VRAM en fp16.
- Opciones de despliegue: transformers (librería declarada), endpoints compatibles (`endpoints_compatible`), y por arquitectura DeBERTa-v2 también es compatible con ONNX Runtime y TGI; no se confirma soporte de llama.cpp ni Ollama (no aplica a encoders de clasificación en la mayoría de casos).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

El autor publica una colección de cinco clasificadores políticos alemanes; este modelo ocupa el puesto 3 de 5 en las tareas de aplausos y prensa. No se dispone de datos de los otros modelos de la colección en la información proporcionada.

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| german_politic_direction_DeBERTa-large (este) | 886,9 M | No disponible | CC-BY-4.0 | 6 partidos + eje ideológico; rank 3/5 en la colección del autor |
| Otros modelos de la colección SinclairSchneider | No disponible | No disponible | No disponible | No se detallan en la información disponible |
| Alternativas genéricas de clasificación política en alemán | No disponible | No disponible | No disponible | No se dispone de comparativas externas verificadas |

## Limitaciones y advertencias

- Las seis puntuaciones miden aprobación, no autoría: son probabilidades sigmoides independientes de que militantes de un partido aplaudan o estén de acuerdo con el texto; no suman 1 y varios partidos pueden puntuar alto a la vez.
- Los resultados in-distribution son optimistas: paráfrasis del mismo discurso pueden caer en ambos lados de la partición de entrenamiento y evaluación.
- El modelo solo funciona en alemán; no hay soporte multilingüe.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas en textos ambiguos, irónicos o fuera de dominio.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero el modelo se entrenó con datos políticos y puede reproducir sesgos presentes en los aplausos parlamentarios y en las etiquetas del Wahl-O-Mat.
- El rendimiento en tuits es limitado (42,2 % de acierto global; 72,6 % solo en tuits de 50 palabras o más), por lo que no es fiable para textos cortos.
- Los benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false`).
- El eje ideológico se calibra con una fórmula definida por el autor; los ángulos por defecto y los calibrados producen resultados distintos (MAE 0,192 frente a 0,187 en prensa).
- No es un modelo generativo: no soporta tool calling, agentes ni razonamiento multi-paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SinclairSchneider/german_politic_direction_DeBERTa-large
- Modelo base: https://huggingface.co/ikim-uk-essen/geberta-xlarge
- Dataset de entrenamiento: https://huggingface.co/datasets/SinclairSchneider/trainset_political_party_big
- Dataset de tuits: https://huggingface.co/datasets/SinclairSchneider/tweets_from_members_of_the_german_bundestag
- Paper (ICWSM 2026): https://doi.org/10.1609/icwsm.v20i1.42735
- Código: https://github.com/SinclairSchneider/german_ideology_prediction
- Colección de clasificadores políticos: https://huggingface.co/collections/SinclairSchneider/german-political-classifier-afd-grunen-cdu-etc
- Paper DeBERTa (referencia): https://arxiv.org/abs/1910.09700
