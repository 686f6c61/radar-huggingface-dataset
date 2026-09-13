# Cheva123/jamjuri-mix7m-th

## Resumen

Jamjuri Mix7M (identificador `Cheva123/jamjuri-mix7m-th`) no es un modelo de lenguaje entrenado, sino un corpus de ajuste fino (dataset de instrucciones) en tailandés. La model card lo describe como un "mix limpio para benchmark maxxing" compuesto por 30.069 documentos y 8.302.257 tokens, tokenizado con el tokenizador de Qwen2.5 y sin tokens especiales. Se distribuye como un único fichero JSONL con campos `text`, `source` y `ntok`, acompañado de un `MANIFEST.json` con los recuentos exactos.

El material deriva de `SPAISS6F1/spai-ss6-llm-1b-thai-corpus` y está orientado a investigación y evaluación, con la advertencia explícita de que los subconjuntos de tipo médico y de exámenes arrastran sus propias licencias. La composición combina QA de `lst20` (33,7 % de los tokens), preguntas de exámenes (27,3 %), QA sintético (14,5 %), QA médico sin cadena de pensamiento (9,6 %), instrucciones turísticas (7,2 %), instrucciones `local_v2` (6,0 %) y recursos léxicos de modismos y sinónimos (1,7 % combinado).

Su relevancia es acotada y muy específica: sirve como material de ajuste o de evaluación para modelos pequeños de tailandés, no como artefacto desplegable. El repositorio no publica pesos, no declara arquitectura y acumula 0 descargas y 0 likes, por lo que cualquier uso en producción exige una verificación previa de licencias, procedencia y calidad de los datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica: es un corpus de datos, no una red neuronal |
| Parametros totales | no aplica (el repositorio no contiene pesos) |
| Longitud de contexto | no aplica; el corpus completo suma 8.302.257 tokens en 30.069 documentos (media aproximada de 276 tokens por documento, calculada a partir de los datos de la model card) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | tailandés (código `th`) únicamente; la model card declara `language: th` |
| Licencia | `other`; la model card restringe a uso de investigación y evaluación y remite a las licencias de los subconjuntos de origen (médico y exámenes) antes de cualquier uso comercial |
| Formato de pesos | no aplica; los datos se distribuyen como `mix7m.jsonl` (un JSON por línea) más `MANIFEST.json` |
| Tokenizador de referencia | Qwen2.5, sin tokens especiales (según la model card) |
| Documentos totales | 30.069 |
| Tokens totales | 8.302.257 |
| Categoría de tamaño declarada | 10K < n < 100K (documentos) |
| Tamaño del repositorio declarado en HuggingFace | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Pipeline declarado | no disponible |
| Fecha de creación / actualización | 2026-09-13 (ambas, con 8 segundos de diferencia) |

## Arquitectura y entrenamiento

No existe arquitectura que describir: el artefacto es un conjunto de datos, no un modelo entrenado. No hay transformer, MoE, SSM ni pesos asociados, y la model card no documenta ningún proceso de entrenamiento, RLHF, DPO ni destilación. El único componente técnico declarado es el tokenizador empleado para contar tokens (Qwen2.5, sin tokens especiales), dato relevante porque implica que el recuento de 8.302.257 tokens está medido con ese vocabulario y no con el de otro modelo.

La parte de ingeniería de datos sí está documentada con cierto detalle. El pipeline de limpieza descarta filas que contienen `<think>` (la model card indica que no se encontró ninguna, es decir, el corpus de origen ya estaba limpio), aplica un mínimo de 20 caracteres, elimina duplicados por md5 exacto (de 137.708 registros a 111.563 antes del muestreo) y realiza un muestreo estratificado aleatorio con semilla 42. La composición final por fuente es la siguiente:

| Fuente | Documentos | Tokens | Porcentaje |
|---|---|---|---|
| lst20 Thai QA | 7.643 | 2.796.494 | 33,7 % |
| exam QA | 8.109 | 2.267.511 | 27,3 % |
| synthetic_qa (muestra del 10 %) | 1.324 | 1.200.296 | 14,5 % |
| medical_qa, non-star (34 % de muestra, CoT descartado, solo Q+A) | 5.579 | 800.210 | 9,6 % |
| tourist instruction (9 % de muestra) | 2.454 | 600.278 | 7,2 % |
| local_v2 instruction (9 % de muestra) | 3.641 | 500.035 | 6,0 % |
| idioms (completo) | 1.152 | 113.001 | 1,4 % |
| synonym (completo) | 167 | 24.432 | 0,3 % |

El sesgo de composición es notable: el 61 % de los tokens proviene de dos fuentes (QA de `lst20` y QA de exámenes), mientras que el 14,5 % es QA sintético, lo que condiciona la distribución de salida de cualquier modelo ajustado con este material.

## Capacidades

Este apartado describe el corpus, no un modelo, ya que el repositorio no incluye pesos:

- Generación de texto e instrucciones en tailandés: el corpus está pensado para ajuste por instrucciones (`instruction-tuning`) en ese idioma, con pares pregunta-respuesta procedentes de exámenes, QA médico (sin cadena de pensamiento) e instrucciones turísticas y locales.
- Comprensión lectora y QA: el bloque `lst20 Thai QA` y el bloque de exámenes aportan 2.796.494 y 2.267.511 tokens respectivamente, adecuados para evaluar o ajustar respuesta a preguntas.
- Léxico y semántica fina: los subconjuntos `idioms` (1.152 documentos) y `synonym` (167 documentos) aportan material sobre expresiones idiomáticas y sinónimos, útil para tareas de normalización o paráfrasis.
- Capacidad sintética controlada: la fuente `synthetic_qa` (1.200.296 tokens) puede emplearse para aumentar cobertura, pero introduce riesgo de artefactos de generación.
- Soporte de tool calling / function calling: no disponible; la model card no menciona herramientas ni funciones.
- Soporte de agentes y razonamiento multi-paso: no disponible. De hecho, las filas con `<think>` fueron descartadas y el bloque médico se incluye con la cadena de pensamiento eliminada, lo que reduce explícitamente el material de razonamiento explícito.
- Capacidades multilingües: no disponibles; el corpus es monolingüe en tailandés.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Ajuste por instrucciones de modelos pequeños en tailandés: los 8.302.257 tokens de pares QA permiten un ajuste supervisado (SFT) de modelos de alrededor de 1.000 millones de parámetros, como sugiere el nombre del corpus de origen (`spai-ss6-llm-1b-thai-corpus`).
- Evaluación de QA en tailandés: el conjunto puede reservarse como test interno para medir comprensión lectora, dado que el 61 % de sus tokens son material de QA de `lst20` y de exámenes.
- Estudio de "benchmark maxxing": el propio autor etiqueta el corpus con `benchmark-maxxing`, de modo que resulta un caso de estudio sobre cómo la selección de datos orientada a métricas afecta al rendimiento medido frente al rendimiento real.
- Prototipado rápido de asistentes locales en tailandés: con 30.069 documentos y menos de 10 millones de tokens, cabe en una única máquina y permite iteraciones de ajuste de horas en una GPU de gama alta de consumo.
- Normalización léxica y tratamiento de modismos: los bloques `idioms` y `synonym` sirven para experimentos de equivalencia semántica, paráfrasis y detección de expresiones idiomáticas tailandesas.
- Investigación sobre QA médico en tailandés: el bloque `medical_qa, non-star` (800.210 tokens, con CoT descartado y solo pregunta y respuesta) es aprovechable para experimentos de respuesta directa, siempre que se verifique la licencia del subconjunto médico original.
- Construcción de pipelines de destilación o generación de datos: la porción sintética puede reutilizarse como semilla para generar nuevos pares y comparar contra el material real de `lst20`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluación, no referencia tareas como MMLU, GSM8K o HumanEval, y la etiqueta `benchmark-maxxing` es una declaración de intención del autor sobre la construcción del corpus, no un resultado medido. Tampoco se han encontrado resultados de búsqueda web relacionados con este artefacto: las referencias recuperadas corresponden a un salón de caravaning en Suiza y no guardan relación alguna con el repositorio.

## Requisitos de hardware

Los requisitos habituales de VRAM para inferencia no aplican, porque el repositorio no contiene ningún modelo:

- VRAM para inferencia: no aplica; no hay pesos que cargar.
- Almacenamiento: el repositorio declara 0,0 GB de tamaño, dato poco fiable; con 8.302.257 tokens en tailandés, el fichero JSONL ocupa previsiblemente decenas de megabytes, pero el tamaño exacto figura como no disponible.
- GPU para procesamiento del corpus: innecesaria para tokenizar o filtrar; cualquier CPU moderna puede recorrer 30.069 documentos en minutos. La GPU solo se necesita si se emplea el corpus para ajustar un modelo posterior.
- GPU recomendadas para el ajuste derivado: no disponibles en la información proporcionada; el nombre del corpus de origen (`spai-ss6-llm-1b`) apunta a modelos del orden de 1.000 millones de parámetros, ajustables en GPU de consumo con cuantización o LoRA, pero esto no se confirma en la model card.
- Cabe en GPU de consumo: no aplica al dataset; para el modelo derivado, no disponible.
- Opciones de despliegue: no aplica (vLLM, llama.cpp, Ollama y TGI sirven para servir pesos, no para un JSONL de texto). El único consumo es mediante lectura de ficheros y bibliotecas de procesamiento de datos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre corpus comparables de ajuste en tailandés en el material proporcionado, por lo que la comparativa se limita al propio artefacto y a su fuente de origen, que no es una alternativa sino el material del que deriva.

| Elemento | Tipo | Documentos / tokens | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Cheva123/jamjuri-mix7m-th` (este repositorio) | Corpus de ajuste por instrucciones | 30.069 / 8.302.257 | tailandés | `other` (investigación y evaluación) | 0 descargas, 0 likes |
| `SPAISS6F1/spai-ss6-llm-1b-thai-corpus` | Corpus de origen (no alternativa) | No disponible en la información proporcionada | tailandés | Debe verificarse; los subconjuntos médico y de exámenes tienen licencias propias | Referenciado en la model card |
| Alternativas comparables de ajuste en tailandés | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia restrictiva: el repositorio se publica como `license: other` y la model card indica "research/eval use", es decir, uso de investigación y evaluación. El uso comercial requiere revisar las licencias de los subconjuntos de origen, en particular los bloques médico y de exámenes.
- Procedencia encadenada: al derivar de `SPAISS6F1/spai-ss6-llm-1b-thai-corpus`, los términos de la fuente original y de cada subconjunto se aplican en cascada; la model card no reproduce esos términos.
- Idioma único: solo tailandés (`th`). No hay material multilingüe y cualquier uso en castellano, inglés u otro idioma queda fuera de alcance.
- Sesgo de composición: el 61 % de los tokens corresponde a QA de `lst20` y de exámenes; el 14,5 % es QA sintético y el bloque médico se incluye parcialmente (34 % de muestra y sin cadena de pensamiento). El modelo derivado heredará esa distribución.
- Riesgo de alucinación inducido por datos: la presencia de QA sintético y la ausencia de verificación de calidad documentada aumentan la probabilidad de propagar respuestas incorrectas, especialmente en el dominio médico.
- Orientación a métricas: la etiqueta `benchmark-maxxing` sugiere una selección de datos optimizada para puntuaciones de benchmark, lo que puede inflar resultados en tareas concretas y no reflejar capacidad general.
- Falta de validación comunitaria: 0 descargas y 0 likes, sin evaluación externa, sin benchmark publicado y sin partición de validación documentada.
- Metadatos inconsistentes: las fechas de creación y actualización declaradas (13-09-2026) y el tamaño de repositorio declarado (0,0 GB) son poco habituales y conviene verificarlos antes de citar el recurso.
- Ausencia de pesos: no se puede desplegar directamente; cualquier aplicación exige un ajuste o una evaluación previa sobre un modelo base no especificado.
- Trazabilidad limitada del preprocesado: se documentan el mínimo de 20 caracteres, el deduplicado md5 y la semilla 42, pero no se detallan los criterios de curación por fuente ni el proceso exacto de muestreo por estrato.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Cheva123/jamjuri-mix7m-th
- Corpus de origen citado en la model card: https://huggingface.co/datasets/SPAISS6F1/spai-ss6-llm-1b-thai-corpus
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
- Resultados de búsqueda web relevantes: no se ha encontrado ninguno; las referencias recuperadas (Suisse Caravan Salon) no guardan relación con el modelo.
