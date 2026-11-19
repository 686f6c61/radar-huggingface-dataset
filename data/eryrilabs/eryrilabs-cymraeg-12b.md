# EryriLabs/EryriLabs-cymraeg-12B

## Resumen

EryriLabs-cymraeg-12B es un ajuste fino en galés (cymraeg) del modelo Gemma 4 12B, desarrollado por EryriLabs. Continúa la línea de trabajo iniciada con EryriLabs/gemma-4-12b-cymraeg-v6, acumulando seis rondas intermedias no publicadas (v7 a v7.4) centradas en galés hablado, formas de respuesta sí/no, mutaciones consonánticas y dos rondas de DPO contra rechazos y bucles de generación, más una ronda final de SFT (v8) orientada a lenguaje soez, respuestas sí/no con polaridad indicada y juicios léxicos y gramaticales.

El modelo se distribuye con pesos fusionados en bf16 y el adaptador LoRA de la última ronda en `adapters/sft-v8`. Está pensado para conversación y generación de texto en galés e inglés, con una plantilla de chat que abre el turno del modelo con un bloque de pensamiento vacío; se recomienda usar la plantilla tal cual, con el modo de razonamiento desactivado.

La relevancia actual radica en que el galés es un idioma de bajos recursos con pocos modelos abiertos de este tamaño, y este trabajo documenta de forma inusualmente transparente tanto las ganancias como los retrocesos entre rondas, incluyendo la advertencia de que parte de la mejora en el benchmark propio se concentra en una única suite con sesgo conocido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 12B), ajuste fino con QLoRA sobre proyecciones de atención y MLP |
| Parametros totales | 12B (heredados del modelo base Gemma 4 12B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (pesos fusionados); GGUF Q8_0 publicado en repo separado |
| Idiomas soportados | galés (cy), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) y adaptador LoRA en `adapters/sft-v8`; GGUF Q8_0 en repo aparte |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 12B y se entrena mediante QLoRA sobre los pesos fusionados de v7.4: base en 4 bits, rango 32, alpha 32, aplicado a las proyecciones de atención y MLP del modelo de lenguaje. Se usa una época con learning rate 5e-5, decaimiento coseno y 3% de warmup, batch efectivo 16 y pérdida sobre el turno final del asistente. El entrenamiento completo son 16.972 filas ejecutadas en una sola RTX 3090 en aproximadamente dos horas.

La composición del dataset de la ronda v8 incluye 3.000 filas de replay de la ronda v7.4, 3.000 instrucciones generales de BangorAI/alpaca-cy-1 (CC-BY-4.0), 2.400 respuestas sí/no con polaridad indicada generadas por el autor, 2.000 juicios gramaticales a partir del registro del Senedd (OGL v3) y memorias de traducción de la Universidad de Cardiff (CC-BY-4.0), 1.600 entradas de lenguaje soez y argot compiladas a mano, 1.500 juicios léxicos sobre techiaith/lecsicon-cymraeg-bangor (CC0), 1.500 pares de NLI traducidos automáticamente desde MultiNLI (excluyendo el género de ficción), 1.000 problemas matemáticos traducidos de GSM8K, 372 topónimos galeses de la Welsh Language Commissioner (OGL v3) y 800 filas de formatos de salida y respuestas ancladas a contexto.

Los pesos de v7.4 se reconstruyeron a partir de v6 y los seis adaptadores de ronda; el modelo reconstruido coincide con el GGUF original de v7.4 en el 96,9% de 1.758 prompts retenidos. Las filas de NLI y matemáticas se tradujeron con un pipeline automático y se filtraron por reglas; una revisión automática de una muestra de 70 filas encontró aproximadamente un 3% con respuesta rota y un 30% con fallos menores de redacción, sin revisión por parte de hablantes nativos.

## Capacidades

- Generación de texto conversacional en galés e inglés, con preferencia por respuestas cortas de estilo hablado frente a explicaciones largas.
- Respuestas de sí/no con polaridad indicada explícitamente por el usuario.
- Juicios léxicos: determinar si una cadena es una palabra galesa válida.
- Juicios gramaticales: determinar si una oración es gramaticalmente aceptable.
- Reconocimiento de lenguaje soez y argot galés, con una tasa de acierto del 73% en un conjunto balanceado propio del autor.
- Inferencia de lenguaje natural (NLI) en galés, entrenada sobre MultiNLI traducido automáticamente.
- Problemas matemáticos verbales (GSM8K traducido), aunque el rendimiento sin mostrar el desarrollo es débil.
- Manejo de topónimos galeses, si bien el propio autor señala que el rendimiento en esta área sigue siendo muy pobre.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo de pensamiento (thinking): la plantilla abre un bloque de pensamiento vacío, pero se recomienda usarla con thinking desactivado.
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional en galés: el modelo está afinado específicamente para respuestas cortas de estilo hablado, lo que lo hace adecuado para interfaces de chat y atención al usuario en cymraeg donde se prefieren contestaciones breves y naturales.
- Moderación de contenido en galés: la capacidad de reconocer lenguaje soez y argot (73% en un conjunto balanceado propio) permite usarlo como clasificador auxiliar en pipelines de moderación para comunidades galesas.
- Corrección y revisión gramatical asistida: aunque su rendimiento en gramática es solo ligeramente superior al azar (58% en el conjunto retenido del autor), puede emplearse como señal complementaria en herramientas de revisión de texto galés, siempre con supervisión humana.
- Validación léxica en herramientas de escritura: el modelo distingue palabras galesas válidas de no-palabras, lo que permite integrarlo en correctores ortográficos o en validadores de formularios en galés.
- Clasificación de pares de oraciones (NLI) en galés: útil para tareas de entailment, detección de contradicciones y verificación de consistencia en corpus galeses, entrenado sobre MultiNLI traducido.
- Traducción y adaptación de documentación administrativa: aunque el BLEU de traducción legislativa bajó a 48,52 en esta versión, el modelo puede servir como borrador inicial en flujos de traducción en/cy con revisión humana posterior.
- Respuestas controladas por polaridad en encuestas y formularios: la capacidad entrenada de responder sí/no cuando se indica la dirección esperada encaja en sistemas de extracción estructurada de respuestas binarias a partir de texto libre.

## Benchmarks y rendimiento

Resultados de CymraegBench v0.1, ejecutados localmente por el autor sobre el GGUF Q8_0 con llama.cpp (hasta 100 casos por suite, semilla 1, temperatura 0, thinking desactivado). No es una evaluación independiente.

| Suite | v6 (publicado) | v7.4 | Este modelo |
|---|---:|---:|---:|
| Overall | 52,70 | 57,87 | 62,36 |
| Welsh reasoning | 54,52 | 57,75 | 60,72 |
| Practical Welsh | 50,89 | 58,00 | 64,00 |
| Legislation translation, BLEU | 52,30 | 50,18 | 48,52 |
| CCC language audit, media de siete | — | 72,56 | 71,72 |

Desglose adicional por suite (v7.4 → este modelo): welsh-obscenities 20 → 81, welsh-yes-no 56 → 64, welsh-lexicon 87 → 92, piqa 64 → 70, arc-welsh-easy 74 → 79, welsh-toxigen 82 → 72, welsh-grammar 63 → 55. En el conjunto retenido propio del autor para lenguaje soez, la puntuación pasa del 60% al 73%. El autor advierte que la suite welsh-obscenities espera "Y" para todos los elementos y no puede detectar falsos positivos sobre palabras neutras.

No se han publicado resultados de benchmarks independientes (MMLU, HumanEval, GSM8K estándar) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 24 GB para los 12B parámetros, más overhead de activaciones y KV cache.
- VRAM estimada en Q8_0 GGUF: aproximadamente 13-14 GB, lo que permite ejecución en GPUs de consumo alto.
- El entrenamiento de la ronda v8 se realizó en una sola RTX 3090 (24 GB) con QLoRA en 4 bits, lo que confirma que el ajuste fino es viable en hardware de consumo.
- GPUs recomendadas para bf16: A100 40/80 GB, H100, L40S, o RTX 4090 (24 GB, al límite).
- GPUs de consumo: cabe en RTX 3090 y RTX 4090 en Q8_0; en cuantizaciones menores (no publicadas en la información disponible) cabría en GPUs de 8-12 GB.
- Opciones de despliegue: transformers 5.15 o superior con `Gemma4UnifiedForConditionalGeneration`, llama.cpp (usado por el autor para los benchmarks), text-generation-inference (etiqueta presente en el repo) y endpoints compatibles.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| EryriLabs-cymraeg-12B | 12B | no disponible | cy, en | Apache-2.0 | Overall 62,36 en CymraegBench v0.1 (evaluación propia) |
| EryriLabs/gemma-4-12b-cymraeg-v6 | 12B | no disponible | cy, en | Apache-2.0 | Overall 52,70 en CymraegBench v0.1 (publicado por AIsteddfod) |
| Gemma 4 12B (base) | 12B | no disponible | multilingüe | Apache-2.0 | Modelo base sin ajuste específico en galés; sin datos de CymraegBench en la información disponible |

No se dispone de datos de benchmarks de otros modelos abiertos en galés en la información proporcionada para establecer comparaciones adicionales.

## Limitaciones y advertencias

- El propio autor advierte que el modelo "inventa hechos libremente" y es mejor en respuestas cortas de estilo hablado que en explicaciones largas; riesgo alto de alucinación en consultas factuales.
- La suite welsh-obscenities del benchmark espera "Y" para todos los elementos, por lo que la gran mejora (20 → 81) no demuestra que el modelo no marque erróneamente palabras limpias; en el conjunto balanceado propio baja al 73%.
- Retrocesos respecto a v7.4: welsh-toxigen cae de 82 a 72 y welsh-grammar de 63 a 55; en el conjunto retenido de gramática el modelo está solo ligeramente por encima del azar (58%).
- El BLEU de traducción legislativa baja 1,7 puntos, y los topónimos siguen siendo muy débiles (5).
- Las matemáticas sin mostrar el desarrollo son débiles (mgsm-cy 26).
- Las filas de NLI y matemáticas se tradujeron automáticamente sin revisión de hablantes nativos; una revisión automática de una muestra de 70 filas detectó ~3% con respuesta rota y ~30% con fallos menores de redacción.
- La lista de palabras soez no ha sido revisada por nativos.
- El modelo está ajustado hacia los tipos de tarea que evalúa CymraegBench, ya que el autor consultó resultados entre rondas para decidir los datos; aunque ningún elemento del benchmark se usó en entrenamiento, existe sesgo de selección.
- La licencia Apache-2.0 permite uso comercial, pero el modelo incorpora datos bajo OGL v3, CC-BY-3.0, CC-BY-4.0 y CC0, con requisitos de atribución que deben respetarse (Senedd Cymru, Welsh Language Commissioner con datos de OS, MultiNLI de Williams, Nangia y Bowman 2018, memorias de traducción de la Universidad de Cardiff, alpaca-cy-1 de BangorAI).
- Requiere transformers 5.15 o superior y usar la plantilla de chat tal como se distribuye, con thinking desactivado; desviarse de esto puede degradar la calidad de las respuestas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EryriLabs/EryriLabs-cymraeg-12B
- Modelo base (v6): https://huggingface.co/EryriLabs/gemma-4-12b-cymraeg-v6
- GGUF Q8_0: https://huggingface.co/EryriLabs/EryriLabs-cymraeg-12B-GGUF
- Dataset BangorAI/alpaca-cy-1: https://huggingface.co/datasets/BangorAI/alpaca-cy-1
- Dataset techiaith/lecsicon-cymraeg-bangor: https://huggingface.co/datasets/techiaith/lecsicon-cymraeg-bangor
- Dataset nyu-mll/multi_nli: https://huggingface.co/datasets/nyu-mll/multi_nli
- Dataset openai/gsm8k: https://huggingface.co/datasets/openai/gsm8k
- Resultados por suite: `eval/cymraegbench-v0.1/` (incluido en el repositorio del modelo)
