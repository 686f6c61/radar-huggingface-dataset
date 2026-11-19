# EryriLabs/EryriLabs-cymraeg-4B

## Resumen

EryriLabs Cymraeg 4B es un ajuste fino en galés del modelo Gemma 4 E4B, la variante compacta de "4B efectivos" de la familia Gemma 4 diseñada para ejecutarse en un portátil o incluso en un teléfono. Lo desarrolla EryriLabs y se construye como una ronda adicional de instrucción sobre `EryriLabs/gemma-4-e4b-cymraeg-v4`, con el objetivo explícito de corregir los puntos débiles de esa versión: respuestas de sí/no en galés (Ydw, Nac oes, Na fydd, Do, Naddo), inferencia en lenguaje natural, reconocimiento de lenguaje soez y la tarea de distinguir si una palabra o frase es galés.

El modelo se distribuye con pesos fusionados en bf16 y el adaptador LoRA en `adapters/sft-v6`, además de una cuantización Q8_0 GGUF en un repositorio separado. Está pensado para conversación, generación de texto y despliegue con text-generation-inference, y declara soporte para galés (cy) e inglés (en). Su licencia Apache-2.0 facilita el uso comercial, aunque hereda las limitaciones del modelo base y de su predecesor v4.

La relevancia de esta ficha está en que documenta un caso de ajuste fino de bajo coste (una sola GPU RTX 3090, 1 hora 40 minutos) sobre datos galeses abiertos, con una evaluación propia (CymraegBench v0.1) que muestra una mejora agregada de 49,94 a 57,46, a costa de caídas concretas en veracidad y juicio gramatical que el autor reconoce abiertamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4, variante E4B "effective 4B"); clase `Gemma4ForConditionalGeneration` |
| Parametros totales | no disponible (repo de 0,6 GB en bf16 fusionado; el modelo base se describe como "effective 4B") |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (pesos fusionados); Q8_0 GGUF en repositorio aparte; base entrenada en 4-bit (QLoRA) |
| Idiomas soportados | galés (cy), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers); GGUF (Q8_0) en `EryriLabs/EryriLabs-cymraeg-4B-GGUF` |

## Arquitectura y entrenamiento

El modelo parte de los pesos fusionados de `EryriLabs/gemma-4-e4b-cymraeg-v4`, que a su vez es un ajuste del Gemma 4 E4B. Sobre esa base se aplica una epoch de QLoRA: base en 4-bit, rango 64, alpha 64, sobre las proyecciones de atención y MLP del modelo de lenguaje, con learning rate 8e-5, decaimiento coseno, 3% de warmup, batch efectivo de 16 y pérdida calculada solo en los turnos del asistente. El entrenamiento se ejecutó en una única RTX 3090 en aproximadamente 1 hora 40 minutos sobre 32.094 filas.

La composición del dataset es explícita: 6.000 instrucciones generales de `BangorAI/alpaca-cy-1` (CC-BY-4.0); 4.500 formas de respuesta sí/no generadas; 2.721 pares de NLI de `nyu-mll/multi_nli` (split de train, sin género de ficción, traducidos automáticamente); 2.651 problemas matemáticos de `openai/gsm8k` traducidos y ampliados; 2.500 ejemplos de gramaticalidad construidos a partir del registro del Senedd (OGL v3), memorias de traducción de Cardiff University (CC-BY-4.0) y frases propias con un error insertado por regla; 2.500 ejemplos de mutaciones generados; 2.000 de "¿es esta palabra galesa?" a partir de `techiaith/lecsicon-cymraeg-bangor` (CC0) y no-palabras generadas; 2.000 de vocabulario y dialecto; 1.600 de lenguaje soez y argot; 372 de topónimos galeses del Welsh Language Commissioner (OGL v3); y unos 5.250 de respuestas habladas, multiturno, registro, formato, identidad, modismos, cartas y respuestas ancladas en contexto. Las filas de NLI y matemáticas se tradujeron con un pipeline automático y se filtraron por regla; una revisión automática de 70 filas detectó aproximadamente un 3% con respuesta rota y un 30% con fallos menores de redacción, sin revisión por parte de hablantes nativos.

No se documentan innovaciones arquitectónicas propias (decodificación especulativa, atención lineal ni mecanismos híbridos); el valor técnico está en el proceso de ajuste y en la evaluación por suites. El modelo incluye un modo de pensamiento desactivable mediante `enable_thinking=False` en la plantilla de chat, y requiere transformers 5.15 o superior.

## Capacidades

- Generación de texto conversacional en galés e inglés, con plantilla de chat y soporte de multiturno.
- Respuestas de sí/no en galés con formas morfológicamente correctas (Ydw, Nac oes, Na fydd, Do, Naddo), incluyendo polaridad declarada o no declarada.
- Inferencia en lenguaje natural (NLI) sobre pares de premisa e hipótesis en galés.
- Detección de lenguaje soez y argot vulgar en galés.
- Juicio léxico: determinar si una palabra o frase es galés.
- Conocimiento de vocabulario, dialectos y mutaciones galesas.
- Resolución de problemas matemáticos verbales (entrenado con GSM8K traducido).
- Traducción de legislación (evaluada con BLEU, aunque sin mejora respecto a v4).
- Generación de resúmenes y respuestas en formato JSON (con fiabilidad parcial; ver limitaciones).
- Modo de pensamiento configurable (`enable_thinking`).
- No se documenta soporte de tool calling, function calling, agentes ni visión, audio o multimodalidad en la información disponible.

## Casos de uso

- Asistentes conversacionales en galés: el modelo puede mantener diálogos multiturno con registro adecuado y respuestas de sí/no naturales, lo que lo hace útil para chatbots de atención ciudadana en Gales.
- Verificación de galés en pipelines de contenido: clasificar si una palabra o frase pertenece al galés permite filtrar y etiquetar corpus automáticamente antes de su publicación o entrenamiento.
- Moderación de comunidades galesas: la mejora en detección de lenguaje soez (de 5 a 53 en la suite correspondiente) lo hace adecuado para prefiltrar comentarios ofensivos en foros y redes en galés.
- Enseñanza de idioma: generar pares de frases con errores gramaticales controlados y explicar mutaciones y vocabulario, apoyando ejercicios de aprendizaje; conviene validar la corrección con un hablante nativo.
- Inferencia textual en galés: resolver tareas de NLI (implicación, contradicción, neutralidad) para sistemas de extracción de información y respuesta a preguntas sobre documentos galeses.
- Resolución de problemas matemáticos escolares en galés: útil en plataformas educativas que necesiten enunciados y soluciones en ese idioma, con revisión humana por la tasa de errores de traducción del dataset.
- Prototipado en local: al ejecutarse en una sola GPU de consumo y con GGUF Q8_0, sirve para pruebas de concepto y demos sin infraestructura dedicada.

## Benchmarks y rendimiento

Resultados de CymraegBench v0.1, ejecutados localmente por el autor sobre el GGUF Q8_0 con llama.cpp, hasta 100 casos por suite, semilla 1, temperatura 0 y pensamiento desactivado. El autor advierte que no es una evaluación independiente.

| Suite | v4 | Este modelo |
|---|---:|---:|
| Overall | 49,94 | 57,46 |
| Razonamiento en galés | 51,66 | 53,26 |
| Galés práctico | 48,22 | 61,67 |
| Traducción de legislación, BLEU | 40,34 | 39,15 |
| Auditoría lingüística CCC, media de siete | 67,96 | 71,43 |

Cambios por suite destacados por el autor: welsh-yes-no de 19 a 76, xnli-brit-cy de 54 a 79, welsh-obscenities de 5 a 53, welsh-lexicon de 82 a 91 y welsh-toxigen de 67 a 74. En sentido contrario, TruthfulQA cae de 56 a 47, el juicio gramatical de 64 a 59 y ccc-crynhoi-dyfynnu de 96 a 77,5.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio fusionado ocupa 0,6 GB en bf16 y existe una cuantización Q8_0 GGUF, lo que sugiere un modelo pequeño apto para hardware modesto. El autor indica que el modelo base "runs on a laptop or a phone".
- GPU recomendadas: no disponibles; el entrenamiento se realizó en una RTX 3090, y la inferencia en el benchmark se ejecutó con llama.cpp sobre GGUF Q8_0.
- GPU de consumo: sí, según la descripción del modelo base como ejecutable en portátil o teléfono; el autor no especifica modelos concretos.
- Opciones de despliegue: transformers 5.15 o superior con `Gemma4ForConditionalGeneration`, llama.cpp con el GGUF Q8_0, y text-generation-inference (etiqueta `text-generation-inference` en el repositorio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| EryriLabs Cymraeg 4B | no disponible ("effective 4B") | no disponible | Apache-2.0 | Hugging Face (safetensors y GGUF Q8_0) | Overall 57,46 en CymraegBench v0.1 |
| EryriLabs gemma-4-e4b-cymraeg-v4 | no disponible ("effective 4B") | no disponible | Apache-2.0 | Hugging Face | Overall 49,94 en CymraegBench v0.1; predecesor directo |
| Gemma 4 E4B (base) | no disponible ("effective 4B") | no disponible | Apache-2.0 (según el autor) | Hugging Face | Base del ajuste; sin datos de CymraegBench en la información disponible |

No se dispone de datos de otros modelos comparables de tamaño similar especializados en galés en la información proporcionada.

## Limitaciones y advertencias

- Caída de veracidad: TruthfulQA baja de 56 a 47, por lo que el riesgo de afirmaciones incorrectas es mayor que en v4.
- Juicio gramatical débil: baja de 64 a 59, y en un conjunto propio el modelo apenas supera el azar al distinguir una frase correcta de una incorrecta.
- Traducción de legislación sin mejora (BLEU 39,15 frente a 40,34) y topónimos galeses todavía deficientes (13).
- Formato JSON poco fiable: al pedir un resumen en JSON con una lista de identificadores de enunciados, devuelve los enunciados en sí aproximadamente la mitad de las veces (ccc-crynhoi-dyfynnu de 96 a 77,5).
- Persisten los problemas documentados en la tarjeta de v4 sobre respuestas largas, repetición y hechos poco fiables.
- Los datos de NLI y matemáticas se tradujeron automáticamente y se filtraron por regla; una revisión automática de 70 filas halló un 3% con respuesta rota y un 30% con fallos menores de redacción, sin revisión por hablantes nativos.
- La lista de palabras soez no ha sido revisada por un hablante nativo.
- Sesgo de evaluación: el autor consultó resultados de CymraegBench entre rondas para decidir qué datos construir, por lo que el modelo está orientado a las tareas de ese benchmark; afirma que ningún ítem del benchmark se usó en entrenamiento.
- La evaluación es propia, no independiente.
- Licencia Apache-2.0, pero el modelo incorpora datos bajo OGL v3.0 (registro del Senedd y topónimos del Welsh Language Commissioner, con datos de OS y Crown copyright), OANC y CC-BY 3.0 (MultiNLI) y CC-BY-4.0 (memorias de Cardiff University y alpaca-cy-1); conviene revisar las obligaciones de atribución en uso comercial.
- Idiomas limitados a galés e inglés; no se documenta soporte de otras lenguas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EryriLabs/EryriLabs-cymraeg-4B
- Modelo base (v4): https://huggingface.co/EryriLabs/gemma-4-e4b-cymraeg-v4
- GGUF Q8_0: https://huggingface.co/EryriLabs/EryriLabs-cymraeg-4B-GGUF
- Resultados de evaluación: `eval/cymraegbench-v0.1/` dentro del repositorio del modelo
- Dataset alpaca-cy-1: https://huggingface.co/datasets/BangorAI/alpaca-cy-1
- Dataset MultiNLI: https://huggingface.co/datasets/nyu-mll/multi_nli
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Léxico galés de Bangor: https://huggingface.co/datasets/techiaith/lecsicon-cymraeg-bangor
- Memorias de traducción de Cardiff University: https://huggingface.co/datasets/techiaith/cardiff-university-tm-en-cy
- Corpus de transcripciones de Bangor: https://huggingface.co/datasets/techiaith/banc-trawsgrifiadau-bangor
- Cofnod y Cynulliad EN-CY: https://huggingface.co/datasets/techiaith/cofnodycynulliad_en-cy
