# MeerDevelopment/gemma-4-31B-it-nl-lora

## Resumen

MeerDevelopment/gemma-4-31B-it-nl-lora es un adaptador LoRA en neerlandés sobre el modelo base google/gemma-4-31B-it, publicado por el usuario MeerDevelopment. No se trata de un modelo completo, sino de un conjunto de pesos PEFT (formato safetensors, ~1 GB de repositorio) que debe combinarse con el modelo base de 31.000 millones de parámetros para su uso. Su objetivo es mejorar el rendimiento del modelo base en tareas de procesamiento del lenguaje natural en neerlandés, evaluadas con el benchmark EuroEval.

El adaptador se entrenó con aproximadamente 14.400 ejemplos sintéticos de tareas en neerlandés y, según la model card, no se utilizaron datos de benchmark durante el entrenamiento. Los resultados declarados por el autor muestran mejoras claras en comprensión lectora (SQuAD-nl, +6,38 F1), reconocimiento de entidades nombradas (CoNLL-nl, +5,29 F1) y conocimiento local (MultiLoKo-nl, +3,08 MCC), junto con un empeoramiento significativo en resumen (WikiLingua-nl, -6,30 chrF3++).

Es relevante para equipos que necesiten un modelo conversacional de gran tamaño con buen rendimiento en neerlandés y dispongan de infraestructura para servir el modelo base de 31B, ya que el adaptador por sí solo no es desplegable de forma independiente. La licencia declarada es Apache 2.0, aunque el modelo base subyacente tiene sus propias condiciones de uso que deben respetarse.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (modelo base google/gemma-4-31B-it) |
| Parámetros totales | No disponible (adaptador LoRA; el modelo base tiene 31B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base) |
| Tipos de cuantización | El adaptador se evaluó con el modelo base cuantizado a int4 (Intel/gemma-4-31B-it-int4-AutoRound); el adaptador en sí es safetensors |
| Idiomas soportados | Neerlandés (nl) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA entrenado sobre google/gemma-4-31B-it, un transformer decoder-only de 31.000 millones de parámetros. El adaptador modifica los pesos del modelo base mediante matrices de bajo rango, lo que permite un ajuste eficiente en parámetros y un almacenamiento reducido (~1 GB). La librería declarada es PEFT y el pipeline es text-generation.

El entrenamiento se realizó con aproximadamente 14.400 ejemplos sintéticos de tareas en neerlandés, según la model card. No se especifican el número de tokens, la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO. El autor indica explícitamente que no se usaron datos de benchmark para el entrenamiento y describe un proceso de decontaminación, aunque los detalles no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto conversacional en neerlandés.
- Comprensión lectora y respuesta a preguntas extractivas (mejora declarada en SQuAD-nl).
- Reconocimiento de entidades nombradas (mejora declarada en CoNLL-nl).
- Juicio de gramaticalidad y aceptabilidad lingüística (mejora declarada en Dutch CoLA).
- Simplificación de texto a lenguaje claro, orientado a nivel B1 (mejora declarada en Duidelijke Taal).
- Conocimiento local neerlandés (mejora declarada en MultiLoKo-nl).
- Clasificación de sentimiento (rendimiento equivalente al base en DBRD).
- Razonamiento de sentido común (rendimiento equivalente o ligeramente mejor en Winogrande-nl).
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Atención al cliente en neerlandés: el adaptador mejora la comprensión lectora y la respuesta a preguntas, lo que permite gestionar consultas de usuarios con contexto documental en neerlandés sobre el modelo base de 31B.
- Extracción de entidades en documentos neerlandeses: el incremento de +5,29 F1 en CoNLL-nl lo hace adecuado para pipelines de anonimización, extracción de nombres, organizaciones y lugares en textos administrativos o legales.
- Reescritura de textos administrativos a lenguaje claro: la mejora en Duidelijke Taal (METEOR 58,35 frente a 54,54) lo orienta a la simplificación de comunicaciones públicas o sanitarias para audiencias con baja alfabetización.
- Corrección y evaluación gramatical: la mejora en Dutch CoLA permite usarlo como componente de revisión lingüística o de filtrado de textos generados en neerlandés.
- Sistemas de preguntas y respuestas sobre documentación interna: la mejora en SQuAD-nl (+6,38 F1) lo hace útil para asistentes de consulta sobre manuales, normativas o bases de conocimiento en neerlandés.
- Clasificación de opiniones y análisis de sentimiento: el rendimiento en DBRD (MCC 92,68) permite integrarlo en pipelines de monitorización de reseñas o redes sociales en neerlandés.
- Evaluación de conocimiento local: aunque con margen de mejora (MCC 29,65), puede emplearse en aplicaciones de trivia o asistentes culturales específicos de los Países Bajos o Flandes.

## Benchmarks y rendimiento

Resultados declarados por el autor en EuroEval 17.7.0, few-shot, 10 iteraciones por dataset, sobre el modelo base cuantizado a int4 (Intel/gemma-4-31B-it-int4-AutoRound), comparando base frente a base + adaptador. El valor t indica la significancia del cambio pareado.

| Dataset | Tarea | Métrica | Base | Adaptador | Cambio | t | Veredicto |
|---|---|---|---:|---:|---:|---:|---|
| DBRD | Sentimiento | MCC | 92,54 | 92,68 | +0,14 | +0,2 | empate |
| CoNLL-nl | Entidades nombradas | micro F1 (sin MISC) | 79,43 | 84,72 | +5,29 | +5,0 | mejor |
| Dutch CoLA | Gramaticalidad | MCC | 52,23 | 54,23 | +2,00 | +3,2 | mejor |
| SQuAD-nl | Comprensión lectora | F1 | 79,70 | 86,08 | +6,38 | +16,6 | mejor |
| WikiLingua-nl | Resumen | chrF3++ | 33,86 | 27,57 | -6,30 | -3,4 | peor |
| INCLUDE-nl | Conocimiento (exámenes) | MCC | 83,55 | 80,88 | -2,67 | -1,9 | empate, tendencia a peor |
| MultiLoKo-nl | Conocimiento local | MCC | 26,57 | 29,65 | +3,08 | +2,3 | mejor |
| Winogrande-nl | Sentido común | MCC | 56,43 | 60,70 | +4,27 | +1,6 | empate, tendencia a mejor |
| Duidelijke Taal | Simplificación | METEOR | 54,54 | 58,35 | +3,81 | No disponible | mejor |

## Requisitos de hardware

- El adaptador LoRA no es desplegable por sí solo: requiere cargar el modelo base google/gemma-4-31B-it (31B parámetros).
- VRAM estimada para el modelo base en precisión completa (bf16): aproximadamente 62 GB solo para pesos, más overhead de activaciones y KV cache.
- VRAM estimada con cuantización int4 (configuración usada en la evaluación): aproximadamente 16-20 GB para pesos, más overhead; viable en GPUs de 24 GB como la RTX 4090 con contexto moderado.
- GPUs recomendadas: A100 80 GB o H100 para bf16 y contextos largos; RTX 4090 o L40S para int4 con contexto limitado.
- Cabe en GPU de consumo (RTX 4090, 24 GB) únicamente con cuantización int4 y contextos moderados; no cabe en GPUs de 16 GB o menos.
- Opciones de despliegue: vLLM (usado por el autor con el checkpoint int4), TGI, llama.cpp u Ollama si se dispone de una conversión GGUF del modelo base con el adaptador fusionado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MeerDevelopment/gemma-4-31B-it-nl-lora | 31B (base) + LoRA | No disponible | Ajuste LoRA en neerlandés sobre Gemma 4 31B IT | Apache 2.0 (adaptador) | HuggingFace, requiere modelo base |
| google/gemma-4-31B-it | 31B | No disponible | Modelo base conversacional multilingüe | Términos de Gemma | HuggingFace |
| Intel/gemma-4-31B-it-int4-AutoRound | 31B | No disponible | Cuantización int4 del base para despliegue eficiente | Términos de Gemma | HuggingFace |
| Adaptadores LoRA en neerlandés de otros autores | Variable | No disponible | Ajuste específico para nl | Variable | No disponible en la información proporcionada |

No se dispone de datos de benchmarks comparativos con otros adaptadores neerlandeses en la información proporcionada.

## Limitaciones y advertencias

- El adaptador empeora el rendimiento en resumen según WikiLingua-nl (-6,30 chrF3++), por lo que no se recomienda para tareas de summarization sin validación previa.
- El rendimiento en conocimiento tipo exámenes (INCLUDE-nl) muestra una tendencia a la baja (-2,67 MCC), aunque no estadísticamente significativa.
- El conocimiento local neerlandés sigue siendo bajo en términos absolutos (MCC 29,65), lo que limita su uso en aplicaciones que requieran conocimiento factual específico de los Países Bajos o Flandes.
- Los benchmarks fueron ejecutados por el propio autor y no están verificados de forma independiente (verified: false en la model-index).
- El adaptador está entrenado exclusivamente en neerlandés; no se garantiza un rendimiento adecuado en otros idiomas.
- Al ser un adaptador LoRA, no es autónomo: requiere el modelo base google/gemma-4-31B-it, cuyos términos de licencia y uso deben respetarse además de la licencia Apache 2.0 del adaptador.
- Riesgo de alucinación inherente al modelo base de 31B, no evaluado específicamente en la información disponible.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información proporcionada.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica una validación comunitaria muy limitada.

## Enlaces

- HuggingFace: https://huggingface.co/MeerDevelopment/gemma-4-31B-it-nl-lora
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Cuantización int4 usada en la evaluación: https://huggingface.co/Intel/gemma-4-31B-it-int4-AutoRound
- EuroEval (benchmark): https://euroeval.com
- Leaderboard neerlandés de EuroEval: https://euroeval.com/leaderboards/dutch
- Metodología de EuroEval: https://euroeval.com/methodology
- Datasets neerlandeses de EuroEval: https://euroeval.com/datasets/dutch
- Código de EuroEval: https://github.com/EuroEval/EuroEval
