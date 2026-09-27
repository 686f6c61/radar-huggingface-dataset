# iatagun/DizgeBERT-G2PTTS

## Resumen

DizgeBERT-G2PTTS es un etiquetador experimental de nivel de palabra para el front-end de sistemas de texto a voz (TTS) en turco. Lo desarrolla el usuario iatagun y su función es predecir, para cada palabra de un texto crudo, dos cosas: la sílaba tónica (indicada como posición contada desde el final de la palabra, o marcada como ausente) y si tras la palabra existe una pausa y de qué nivel (`0`, `ip`, `IP` o final de oración). No genera fonemas ni audio: es una pieza previa que alimenta a un sintetizador.

Técnicamente no es un modelo autónomo, sino un pipeline híbrido. Una parte de la decisión de acento la resuelve un módulo de reglas en Python (`stress_rules.py`) junto con diccionarios en texto plano (`resources/*.tsv|txt`); solo cuando la regla devuelve el caso por defecto (última sílaba) entra en juego la red neuronal. Esa red es un encoder ELECTRA (discriminador base en turco con cased) de 110.032.904 parámetros, derivado del modelo `iatagun/DizgeBERT-Dep`, con los embeddings y las seis primeras capas congeladas y dos cabezas lineales añadidas. Toda la predicción de fronteras prosódicas recae en el modelo.

Es relevante como caso poco habitual: un modelo publicado con métricas modestas y un apartado explícito de limitaciones, orientado a investigación más que a producción. El propio autor lo etiqueta como «deneysel, v0» (experimental, versión 0) y advierte de que los pesos por sí solos no bastan: hace falta el código personalizado y los diccionarios, y se invita a corregir esos diccionarios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder ELECTRA (discriminador base turco con *cased*) con dos cabezas lineales de clasificación de tokens; pipeline híbrido reglas + red neuronal |
| Parámetros totales | 110.032.904 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | El texto largo se divide en fragmentos de 254 sub-tokens en límites de oración; no se documenta un máximo distinto |
| Tipos de cuantización | No disponible (el repositorio solo publica `safetensors` en precisión completa) |
| Idiomas soportados | Turco (`tr`) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors, más código Python personalizado (`trust_remote_code=True`) y recursos de texto plano en `resources/` |
| Tamaño del repositorio | 0,4 GB |
| Modelo base | iatagun/DizgeBERT-Dep (rev ELECTRA `dbmdz/electra-base-turkish-cased-discriminator`) |
| Tarea declarada (pipeline) | token-classification |
| Etiquetas de salida | `stress_from_end` (0 = última sílaba, `None` = sin acento), `stress_src` (`kural:<etiqueta>` o `model`), `boundary` (`0`, `ip`, `IP`, `cümle`), `p_break` |
| Umbral de decisión | `tau = 0,25`, fijado en el conjunto de validación |

## Arquitectura y entrenamiento

El cuerpo del modelo es un encoder ELECTRA de tipo discriminador, en variante base y *cased* para turco, reutilizado desde `iatagun/DizgeBERT-Dep` con revisión fijada. Sobre él se montan dos cabezas lineales: una para el acento léxico y otra para la frontera prosódica. Durante el ajuste se congelaron los embeddings y las seis capas inferiores, de modo que solo se actualizaron las capas superiores y las cabezas. El módulo de reglas cubre el diccionario de raíces con acento irregular, la regla de peso, los clíticos, las palabras sin vocal, la intensificación adjetival ligada a diccionario (`kıpkırmızı`) y el sufijo adjetival `-CIk`. La prioridad es de diccionario: si la regla da un resultado determinante, ese resultado manda; si no, decide el modelo.

Las etiquetas de acento no son anotación humana: se destilaron del propio módulo de reglas sobre los treebanks turcos de Universal Dependencies (BOUN, IMST, Kenet), usando en ellos UPOS y FEATS de oro, y sobre frases de Antalia, donde se usaron las salidas de DizgeBERT-Morph. Las etiquetas de frontera proceden exclusivamente del corpus [Antalia](https://huggingface.co/datasets/cloud0day3/antalia-voice-corpus) (CC-BY-4.0, un solo hablante, unos 4,2 horas de lectura), donde la etiqueta se define por el silencio medido entre palabras: menos de 60 ms → `0`, entre 60 y 250 ms → `ip`, 250 ms o más → `IP`. El entrenamiento fue de 4 épocas con tasa de aprendizaje 3e-5 para el cuerpo y 1e-3 para las cabezas, repitiendo Antalia dos veces. La selección de época se hizo escogiendo, entre las épocas cuya F1 de frontera quedaba a menos de 0,02 del mejor valor, la de mayor acuerdo con el acento no final de UD, lo que dio la época 2. La entrada pasa por una función `normalize()` que expande números, abreviaturas y fechas y separa la puntuación; el signo `,` fuerza al menos `ip` y el `;` al menos `IP`.

## Capacidades

- Predicción de la sílaba tónica por palabra, expresada como índice desde el final (`0` = última sílaba) o como ausencia de acento.
- Indicación de la fuente de cada decisión de acento (`kural:<etiqueta>` o `model`), lo que permite auditar cuánto peso tiene el diccionario en cada caso.
- Predicción de frontera prosódica por palabra en cuatro niveles (`0`, `ip`, `IP`, `cümle`) con probabilidad asociada (`p_break`).
- Normalización previa del texto: expansión de números, abreviaturas y fechas, y separación de la puntuación.
- Segmentación automática de textos largos en fragmentos de 254 sub-tokens respetando límites de oración.
- Diccionarios de recursos editables a mano (texto plano) para corregir raíces irregulares, clíticos o excepciones.
- No realiza *tool calling*, ni *function calling*, ni razonamiento multi-paso, ni agentes.
- No es multimodal: no procesa visión ni audio.
- No genera fonemas; para eso el autor remite al paquete [`dizge`](https://pypi.org/project/dizge/) (versión 0.1.6).
- No dispone de modo de razonamiento explícito (no hay *thinking mode*).

## Casos de uso

- Front-end de TTS en turco: el modelo marca qué sílaba debe acentuarse y dónde conviene insertar pausas, información que el sintetizador usa para generar una prosodia más natural que la de un front-end puramente basado en reglas de última sílaba.
- Sustitución o complemento de espeak-ng en turco: en la prueba ciega de acento el pipeline híbrido obtuvo 90/97 (92,8 %) frente a 71/97 (73,2 %) de espeak-ng, por lo que puede actuar como componente de acentuación en una cadena ya existente.
- Preprocesado de corpus de lectura: al aplicarse sobre un texto plano etiqueta acentos y fronteras, lo que permite comparar la prosodia esperada con la observada y detectar discrepancias en corpus alineados con audio.
- Fonemización en dos etapas: combinado con `dizge` 0.1.6, el resultado de `tag()` sirve como entrada para la capa que produce fonemas, separando así la decisión prosódica de la conversión fonética.
- Investigación en fonología turca: la distinción entre etiquetas procedentes de reglas y etiquetas del modelo permite analizar qué casos quedan fuera de la regla de peso y de los diccionarios, útil para estudiar acentuación irregular, clíticos y compuestos.
- Corrección colaborativa de diccionarios: dado que `resources/` es texto plano editable y el autor pide explícitamente correcciones, el modelo se puede usar en un flujo de anotación donde se detecten fallos, se corrijan los diccionarios y se vuelva a evaluar sin reentrenar la red.
- Evaluación de front-ends TTS propios: el umbral `tau=0,25` y las etiquetas de frontera basadas en silencio medido ofrecen una referencia concreta contra la que medir otros sistemas de predicción de pausas en turco.
- Análisis de acento a nivel de palabra en herramientas educativas o de transcripción: el campo `stress_from_end` es directamente interpretable y se puede mostrar como índice desde el final de la palabra.

## Benchmarks y rendimiento

No hay resultados de benchmarks generales (MMLU, GSM8K, HumanEval ni similares) en la información disponible, algo esperable dado que el modelo no es un LLM generativo. El autor publica evaluaciones propias, reproducidas a continuación.

Prueba ciega de acento: 97 palabras seleccionadas al azar, evaluadas de forma aislada (sin contexto de oración) y por un único anotador (el propietario del proyecto).

| Sistema | Acierto |
|---|---|
| DizgeBERT-G2PTTS (híbrido) | 90/97 = 92,8 % (IC 95 %: 87,6–97,9) |
| Heurística «siempre la última sílaba» | 81/97 = 83,5 % |
| espeak-ng (`tr`) | 71/97 = 73,2 % |
| Pipeline reglas + DizgeBERT-Morph (M1b) | 94,8 % (diferencia no significativa) |

Otras medidas de acento reportadas por el autor:

| Medida | Valor |
|---|---|
| Conjunto de desarrollo (250 palabras aleatorias usadas para escribir las reglas) | 86,0 % |
| Lista dorada inicial de 35 palabras | 33/35 (incluye ejemplos usados al escribir las reglas; el autor indica que no es una medición independiente) |
| Cabeza del modelo en solitario, sin reglas (misma lista de 35) | 18/35 |
| Acuerdo de la cabeza con las etiquetas de reglas, UD (test) | 96,6 % (89,4 % en acento no final) |
| Acuerdo de la cabeza con las etiquetas de reglas, Antalia | 98,3 % (95,3 % en acento no final) |

Fronteras prosódicas (test: 82 clips de Antalia, 2.276 fronteras entre palabras, sin contar las marcadas por puntuación):

| Sistema | F1 | Precisión | Recall |
|---|---|---|---|
| DizgeBERT-G2PTTS (`tau=0,25`) | 0,496 | 0,414 | 0,620 |
| Regla de grupo de dependencias (DizgeBERT-Dep, K=2) | 0,347 | No disponible | No disponible |

La diferencia frente a la línea base es de +0,096 a +0,201 según *bootstrap* por clips con IC del 95 %, es decir, una mejora significativa pero con un valor absoluto modesto: más de la mitad de las fronteras propuestas no coinciden con la pausa medida.

## Requisitos de hardware

- VRAM estimada para inferencia: en precisión completa (fp32) unos 0,44 GB para los pesos; en fp16/bf16 unos 0,22 GB; en int8 unos 0,11 GB. Hay que sumar el consumo de activaciones, el módulo de reglas y la carga de los diccionarios de `resources/`.
- El repositorio ocupa 0,4 GB, coherente con un modelo de 110 M de parámetros.
- Cabe sin problema en GPU de consumo: cualquier tarjeta con 2 GB o más de VRAM es suficiente, e incluso es viable en CPU para volúmenes moderados. No se documentan requisitos de A100, H100 o RTX 4090 porque el modelo no los necesita.
- Opciones de despliegue: la ruta soportada es `transformers` con `AutoModel.from_pretrained(..., trust_remote_code=True)`, que además descarga la carpeta `resources/`. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama; al requerir código personalizado, esos servidores no lo cargarían sin adaptación.
- Latencia y throughput: no disponible.
- La ventana efectiva de 254 sub-tokens por fragmento implica trocear documentos largos, lo que añade coste de preprocesado pero no de memoria.

## Comparativa con modelos similares

No se dispone de datos de parámetros, contexto ni rendimiento de las alternativas, salvo los valores de acierto en acento ya mostrados. La comparación se limita a la categoría funcional.

| Modelo | Función | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DizgeBERT-G2PTTS | Acento léxico + frontera prosódica (front-end TTS) | 110.032.904 | Fragmentos de 254 sub-tokens | cc-by-sa-4.0 | HuggingFace, requiere código personalizado |
| DizgeBERT-Dep | Análisis de dependencias; base de este modelo | No disponible | No disponible | No disponible en la información proporcionada | HuggingFace (`iatagun/DizgeBERT-Dep`) |
| DizgeBERT-Joint | Análisis morfológico y *dependency parsing* conjunto | No disponible | No disponible | cc-by-sa-4 | HuggingFace (`iatagun/DizgeBERT-Joint`) |
| espeak-ng (`tr`) | Reglas de acento y síntesis | No aplica (basado en reglas) | No aplica | GPL (verificar versión) | Paquete de software libre |
| Reglas + DizgeBERT-Morph (M1b) | Acento mediante reglas y morfología | No disponible | No disponible | No disponible | Pipeline descrito por el autor |

En la única métrica comparable (acierto de acento en la prueba ciega de 97 palabras), el híbrido DizgeBERT-G2PTTS obtiene 92,8 %, por encima de espeak-ng (73,2 %) y de la heurística de última sílaba (83,5 %), y por debajo del pipeline M1b (94,8 %) aunque sin diferencia estadísticamente significativa. La ventaja declarada del modelo frente a M1b es que destila ese pipeline en un solo modelo sin depender de DizgeBERT-Morph.

## Limitaciones y advertencias

- Versión experimental: el propio autor indica que no está diseñado para producción.
- Los pesos no son autosuficientes. Sin el módulo de reglas y los diccionarios, la cabeza de acento rinde muy mal: 18/35 en la lista dorada inicial (en torno al 51 %), frente a 33/35 con el pipeline completo.
- Evaluación de acento muy pequeña y con un único anotador (97 palabras en la prueba ciega); no se ha medido el acuerdo entre anotadores y no existe una evaluación independiente.
- Las etiquetas de acento son destiladas de reglas, no anotadas por humanos, lo que traslada los sesgos y huecos de esas reglas al modelo.
- Las etiquetas de frontera proceden de un único hablante (lectura de Antalia), por lo que se desconoce su comportamiento en habla espontánea, lectura de noticias u otros estilos.
- La etiqueta de frontera mide silencio (≥60 ms), no una frontera lingüística: puede marcar pausas de vacilación o respiración como si fueran límites de constituyente.
- El acento se evaluó a nivel de palabra aislada; no se modela la pérdida de acento en contexto (por ejemplo, en palabras funcionales).
- Cobertura de reglas deliberadamente estrecha: no hay diccionario completo para vocativos, diminutivos, reduplicaciones ni compuestos.
- La distinción de topónimos depende de las mayúsculas (`Ordu` frente a `ordu`), lo que falla en texto sin capitalización fiable.
- Las reglas de intensificación adjetival están ligadas al diccionario derivado de lemas ADJ de UD; los adjetivos fuera de ese diccionario se escapan.
- No produce fonemas ni audio; cualquier uso como sistema TTS completo requiere componentes adicionales como `dizge`.
- Licencia cc-by-sa-4.0: permite uso comercial, pero obliga a atribución y a compartir las obras derivadas bajo la misma licencia, lo que puede ser incompatible con productos propietarios. Los treebanks de UD (BOUN, IMST, Kenet) tienen sus propias licencias y Antalia es CC-BY-4.0 con atribución a «Antalia (Patientdesk.ai)».
- Fragmentación obligatoria a 254 sub-tokens: en documentos largos hay que gestionar el troceado, y las dependencias que cruzan fronteras de fragmento se pierden.

## Enlaces

- [Modelo en HuggingFace: iatagun/DizgeBERT-G2PTTS](https://huggingface.co/iatagun/DizgeBERT-G2PTTS)
- [Modelo base: iatagun/DizgeBERT-Dep](https://huggingface.co/iatagun/DizgeBERT-Dep)
- [iatagun/DizgeBERT-Joint](https://huggingface.co/iatagun/DizgeBERT-Joint)
- [Encoder de partida: dbmdz/electra-base-turkish-cased-discriminator](https://huggingface.co/dbmdz/electra-base-turkish-cased-discriminator)
- [Dataset Antalia (cloud0day3/antalia-voice-corpus)](https://huggingface.co/datasets/cloud0day3/antalia-voice-corpus)
- [Paquete dizge en PyPI (fonemización)](https://pypi.org/project/dizge/)
- [Corpus Universal Dependencies (treebanks turcos BOUN, IMST, Kenet)](https://universaldependencies.org/)
