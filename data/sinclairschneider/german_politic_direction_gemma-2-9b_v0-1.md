# SinclairSchneider/german_politic_direction_gemma-2-9b_v0.1

## Resumen

`german_politic_direction_gemma-2-9b_v0.1` es un clasificador de texto en alemán desarrollado por SinclairSchneider que estima la posición ideológica de un texto político germano en el eje izquierda-derecha. Se construye mediante fine-tuning de `google/gemma-2-9b` sobre un corpus de 636.717 textos (1998 – septiembre de 2024) que combina discursos del Bundestag etiquetados con los grupos parlamentarios que aplaudieron, respuestas a los Wahl-O-Mat de los partidos, programas electorales y paráfrasis generadas por LLM. El modelo devuelve seis probabilidades independientes (una por partido: Die Linke, Bündnis 90/Die Grünen, SPD, FDP, CDU/CSU y AfD) más una puntuación ideológica agregada en el rango −1 (izquierda) a +1 (derecha).

La relevancia del modelo reside en su enfoque de etiquetado: en lugar de anotación manual subjetiva, utiliza señales conductuales verificables (aplausos registrados en los protocolos oficiales del Bundestag) y posiciones programáticas documentadas (Wahl-O-Mat). El autor publica un artículo en ICWSM 2026 que describe la metodología, y el modelo forma parte de una colección de cinco clasificadores similares.

Con 9.241.727.488 parámetros, licencia CC-BY-4.0 y un repositorio de 37 GB, es un modelo de clasificación de gama media-alta orientado específicamente al dominio político alemán, no un modelo generativo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2), adaptado a clasificación multi-etiqueta con cabecera sigmoide |
| Parámetros totales | 9.241.727.488 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repo contiene safetensors en precisión original) |
| Idiomas soportados | Alemán (`de`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-2-9b`, un transformer decoder-only de la familia Gemma 2, y lo adapta a una tarea de clasificación multi-etiqueta: seis salidas sigmoideas independientes, una por partido, que representan la probabilidad de que miembros de ese grupo parlamentario aplaudan o estén de acuerdo con el texto. Las seis probabilidades no suman 1 y varias pueden ser altas simultáneamente. La puntuación ideológica se calcula a partir de las seis con una fórmula lineal documentada en la model card.

El conjunto de entrenamiento, `SinclairSchneider/trainset_political_party_big`, contiene 636.717 textos fechados entre 1998 y septiembre de 2024. Combina tres fuentes: discursos del Bundestag con etiquetas de aplausos extraídas de los protocolos XML oficiales, respuestas de los partidos a los Wahl-O-Mat y programas electorales, más paráfrasis generadas por LLM de todos ellos. El autor advierte que la partición aleatoria del 20% usada en evaluación es optimista, porque paráfrasis del mismo discurso pueden aparecer a ambos lados del split. La evaluación principal es por tanto out-of-time y out-of-domain.

## Capacidades

- Clasificación multi-etiqueta de textos políticos alemanes en seis categorías de partido (Die Linke, Grüne, SPD, FDP, CDU/CSU, AfD).
- Puntuación ideológica continua en el eje −1 (izquierda) a +1 (derecha).
- Detección de postura (stance detection) sobre textos de longitud variable: discursos, tesis programáticas, artículos de prensa y tuits.
- Capacidad de ordenar partidos por afinidad ideológica esperada (Linke −0,70, Grüne −0,36, SPD −0,35, CDU/CSU +0,03, AfD +0,83 en discursos de 2025/26).
- Funcionamiento sobre textos cortos y largos: la precisión en tuits sube del 39,0% global al 72,5% en tuits de 50 palabras o más.
- No soporta tool calling, agentes ni generación de texto: es exclusivamente un clasificador.

## Casos de uso

- Análisis de discurso parlamentario: procesar protocolos del Bundestag y asignar a cada intervención una posición ideológica y la probabilidad de aprobación por cada grupo, útil para estudios de polarización y disciplina de partido.
- Monitorización de medios: puntuar artículos de prensa alemana en el eje izquierda-derecha; el modelo reporta un MAE de 0,169 frente a las valoraciones de Medienkompass.org en 33 medios.
- Investigación en ciencias políticas: clasificar grandes corpus históricos (1998 en adelante) para estudiar la evolución de posiciones partidistas sin anotación manual.
- Análisis de redes sociales políticas: estimar la orientación de tuits de diputados o de cuentas políticas; el modelo alcanza un 39,0% de acierto en la atribución de partido del autor y un 72,5% en tuits largos.
- Evaluación de programas electorales: comparar programas y respuestas a Wahl-O-Mat con las posiciones históricas del partido para detectar desplazamientos programáticos.
- Moderación y análisis de contenido: filtrar o etiquetar contenido político por orientación en plataformas que operan en el mercado alemán.
- Enriquecimiento de datasets para entrenamiento: generar etiquetas ideológicas automáticas sobre corpus alemanes que alimenten otros modelos o estudios.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index (no verificados de forma independiente):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Aprobación multi-partido (in-distribution) | trainset_political_party_big (split 20%) | Micro-F1 (umbral 0,5) | 0,8203 |
| Aprobación multi-partido (in-distribution) | trainset_political_party_big (split 20%) | Micro precision | 0,8345 |
| Aprobación multi-partido (in-distribution) | trainset_political_party_big (split 20%) | Micro recall | 0,8066 |
| Aplausos en discursos del Bundestag (out-of-time, 2025-2026) | bundestag-plenarprotokolle-wp21 | Macro ROC-AUC (5 grupos) | 0,7969 |
| Aplausos en discursos del Bundestag (out-of-time, 2025-2026) | bundestag-plenarprotokolle-wp21 | Micro-F1 (umbral 0,5) | 0,6350 |
| Acuerdo con tesis Wahl-O-Mat (out-of-time, 2025-2026) | wahl-o-mat-2025-2026 (266 tesis) | Macro ROC-AUC (6 partidos) | 0,8500 |
| Posicionamiento izquierda-derecha de prensa (out-of-domain) | 33 medios alemanes vs. Medienkompass.org | MAE (ángulos calibrados, LOO) | 0,1768 |
| Posicionamiento izquierda-derecha de prensa (out-of-domain) | 33 medios alemanes vs. Medienkompass.org | MAE (ángulos por defecto) | 0,1869 |
| Partido del autor de tuits de diputados (out-of-domain) | tweets_from_members_of_the_german_bundestag (60.000 tuits) | Accuracy (partido con mayor puntuación) | 0,3901 |

El autor indica que en el benchmark de prensa con ángulos calibrados sobre los mismos medios el MAE es 0,169 (0,172 en el artículo), y que el modelo ocupa el puesto 5 de 5 en ROC-AUC sobre discursos out-of-time dentro de su colección de clasificadores.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18-19 GB solo para pesos, más overhead de activaciones; en la práctica se recomienda una GPU de 24 GB o superior.
- Cuantización a 8 bits (bitsandbytes): ~9-10 GB de VRAM, cabe en RTX 3090/4090.
- Cuantización a 4 bits (bitsandbytes NF4): ~5-6 GB de VRAM, cabe en RTX 3060 12 GB y RTX 4070.
- GPU recomendadas: A100 40/80 GB, H100 para lotes grandes; RTX 4090 (24 GB) para FP16 con lotes pequeños; RTX 3090/4080 para 8 bits.
- Despliegue: compatible con `transformers` (librería declarada) y `endpoints_compatible`; no se documenta soporte explícito de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| german_politic_direction_gemma-2-9b_v0.1 | 9,24 B | No disponible | Clasificación ideológica alemana (6 partidos) | CC-BY-4.0 | Hugging Face |
| Otros modelos de la colección SinclairSchneider (4 clasificadores adicionales) | No disponible | No disponible | Clasificación ideológica alemana | No disponible | Hugging Face (colección del autor) |
| `google/gemma-2-9b` (base) | 9,24 B | No disponible | Generación de texto general | Gemma Terms of Use | Hugging Face |

El autor sitúa este modelo en el puesto 5 de 5 de su colección en ROC-AUC sobre discursos out-of-time (0,797) y en el puesto 2 de 5 en el benchmark de prensa (MAE 0,169 con ángulos calibrados). No se dispone de comparativas con clasificadores políticos externos en la información proporcionada.

## Limitaciones y advertencias

- Las seis puntuaciones miden aprobación, no autoría: cada una es una probabilidad sigmoidea independiente de que miembros de ese partido aplaudan el texto; no suman 1 y varias pueden ser altas a la vez.
- Las métricas in-distribution (micro-F1 0,820) son optimistas: paráfrasis del mismo discurso pueden caer a ambos lados del split aleatorio del 20%.
- El rendimiento cae fuera de distribución: micro-F1 de 0,635 en discursos out-of-time y accuracy de solo 0,390 en atribución de partido en tuits (sube a 0,725 en tuits de 50 palabras o más).
- Los ángulos de calibración del benchmark de prensa se ajustaron sobre los mismos 33 medios evaluados; el MAE con leave-one-outlet-out sube a 0,177 y con ángulos por defecto a 0,187.
- Sesgos potenciales derivados del corpus: sobrerrepresentación de discursos parlamentarios formales frente a otros registros, y dependencia de las etiquetas de aplausos como proxy de acuerdo ideológico.
- Riesgo de alucinación no aplica en sentido generativo (es un clasificador), pero sí de calibración errónea en textos atípicos, sarcásticos o fuera del dominio político alemán.
- Solo soporta alemán; no se documenta rendimiento en otras lenguas ni en variantes dialectales.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero conviene revisar los términos del modelo base `google/gemma-2-9b` (Gemma Terms of Use), que pueden imponer restricciones adicionales.
- Fecha de corte de los datos de entrenamiento: septiembre de 2024; los partidos y el panorama político alemán pueden haber cambiado desde entonces.
- No se documenta la longitud máxima de contexto soportada, lo que dificulta planificar el procesado de documentos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SinclairSchneider/german_politic_direction_gemma-2-9b_v0.1
- Modelo base: https://huggingface.co/google/gemma-2-9b
- Dataset de entrenamiento: https://huggingface.co/datasets/SinclairSchneider/trainset_political_party_big
- Dataset de tuits: https://huggingface.co/datasets/SinclairSchneider/tweets_from_members_of_the_german_bundestag
- Colección de clasificadores políticos alemanes: https://huggingface.co/collections/SinclairSchneider/german-political-classifier-afd-grunen-cdu-etc
- Artículo (ICWSM 2026): https://doi.org/10.1609/icwsm.v20i1.42735
- Código: https://github.com/SinclairSchneider/german_ideology_prediction
- Referencia arXiv 1910.09700: https://arxiv.org/abs/1910.09700
- Referencia arXiv 2408.00118: https://arxiv.org/abs/2408.00118
