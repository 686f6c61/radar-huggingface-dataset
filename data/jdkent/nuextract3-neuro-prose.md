# jdkent/nuextract3-neuro-prose

## Resumen

nuextract3-neuro-prose es un ajuste fino (fine-tune) del modelo numind/NuExtract3, desarrollado por jdkent, especializado en la extraccion de informacion estructurada a partir de texto cientifico de neuroimagen. Concretamente, lee coordenadas cerebrales escritas en la prosa de articulos de neuroimagen (por ejemplo, "activacion en la amigdala izquierda (x = -22, y = -4, z = -18), Z = 4.1") y las convierte en analisis estructurados: que coordenadas pertenecen a que contraste, con su estadistico, tamano de cluster y espacio de referencia.

El modelo resuelve un problema muy concreto de la meta-investigacion en neurociencia: la extraccion manual de coordenadas de activacion de la literatura, que es lenta, propensa a errores y dificil de escalar. Al automatizar esta tarea con salida JSON validada por esquema, facilita la construccion de bases de datos de resultados de neuroimagen (meta-analisis, replicacion, neuroimaging data mining).

Tecnicamente es un modelo de 4.539.265.536 parametros (aproximadamente 4,5 mil millones), construido sobre la arquitectura Qwen3.5 (tag `qwen3_5`) con pesos en safetensors y una licencia Apache 2.0. Es un modelo multimodal de tipo image-text-to-text segun el pipeline declarado, aunque su uso principal documentado es la extraccion de texto a JSON. Este ajuste se distribuye como pesos fusionados (merged weights), no como adaptador LoRA, y cuenta con un hermano para tablas de resultados (`jdkent/nuextract3-neuro-tables`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer, tag `qwen3_5`); incluye capas Mamba segun la model card |
| Parametros totales | 4.539.265.536 (aprox. 4,5 B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (pesos fusionados, no adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo parte de numind/NuExtract3, un modelo de extraccion de informacion estructurada, y hereda la arquitectura Qwen3.5. La model card menciona explicitamente capas Mamba: el ajuste LoRA entrena tensores de capas Mamba que un LoRA convencional no cubre, por lo que el autor publica pesos fusionados en lugar de un adaptador (cargar solo el adaptador seria silenciosamente incorrecto). El ajuste emplea LoRA con rangos 16 para los mixers de atencion lineal, 32 para la atencion y 12 para los MLP, junto con tensores entrenados directamente, con learning rate 1e-4, batch global de 33 y ejecucion sobre 3 GPU A100.

El entrenamiento uso 15.259 pasajes (sha256 `c6b680f0…`), de los cuales el 44 % son reales. Los pasajes reales son borradores generados por modelo y auditados contra reglas explicitas por Claude Sonnet, verificando que cada coordenada, valor y tamano de cluster aparezca impreso en el pasaje. Incluyen 3.500 pasajes seleccionados para casos dificiles: resultados nulos, tests post hoc, semillas (seeds), conjunciones, correlaciones con signo, covariables y unidades. El dataset no se publica porque los pasajes provienen de articulos. Se planificaron 2 epocas (924 pasos); los pesos publicados corresponden al paso 700, elegido como el mejor de los pasos 300-924 sobre los conjuntos de test, y los pasos 850-924 puntuan de forma identica. La decodificacion recomendada es greedy, idealmente restringida por `template.json` como esquema JSON (por ejemplo, `structured_outputs` de vLLM).

## Capacidades

- Extraccion de coordenadas cerebrales desde prosa cientifica a JSON estructurado, asignando cada coordenada a su contraste y analisis.
- Captura de estadisticos (por ejemplo, Z) solo cuando se reportan para ese pico, y tamanos de cluster solo en voxeles o mm³.
- Tratamiento de todo tipo de coordenadas como puntos: semillas, centros de ROI, objetivos de estimulacion y picos de otros estudios; excluye coordenadas de elementos no cerebrales (tamanos de voxel, rejillas de docking).
- Registro de analisis con resultado nulo nombrados en el pasaje ("el contraste inverso no mostro clusters significativos") sin puntos asociados.
- Duplicacion de una coordenada bajo cada resultado cuando se reporta para varios (por ejemplo, un test F y sus post hoc).
- Nombrado de semillas como `Seed: <nombre de la semilla>` a partir de su propio centro.
- Uso de contexto anterior y posterior al pasaje para nombrar los analisis, listando solo las coordenadas del pasaje.
- Salida validable contra esquema JSON (`template.json`), compatible con decodificacion restringida en vLLM.
- Capacidad multimodal declarada por el pipeline (image-text-to-text), aunque el uso documentado es texto a JSON.
- Soporte de plantilla nativa de NuExtract3 (modo `instruction_v3.txt` + `template.json`).

## Casos de uso

- Construccion de bases de datos de coordenadas de neuroimagen: el modelo procesa pasajes de resultados de articulos y emite JSON con coordenadas, estadisticos y nombres de analisis, alimentando pipelines de meta-analisis a gran escala sin extraccion manual.
- Meta-analisis de activacion (ALE, MKDA): la salida estructurada con coordenadas y espacios de referencia se integra directamente en herramientas de sintesis cuantitativa, reduciendo el tiempo de curacion de la literatura.
- Ingesta automatizada en flujos como ns-pond: el autor documenta su llamada desde `ingestion_workflow/clients/prose_coordinates.py`, de modo que el modelo puede encajar como cliente de extraccion en un workflow de ingesta reproducible.
- Auditoria y replicacion de estudios: extraer sistematicamente las coordenadas reportadas en un conjunto de articulos permite comparar hallazgos entre estudios y detectar discrepancias o resultados nulos no destacados.
- Curacion de literatura para revisiones sistematicas: al conservar analisis con resultado nulo y tests post hoc, el modelo ayuda a documentar resultados negativos que suelen omitirse en extracciones manuales.
- Procesamiento por lotes de corpus cientificos: con decodificacion greedy y salida restringida por esquema, es desplegable en vLLM para procesar grandes volumenes de pasajes con salida JSON consistente.
- Extraccion asistida de semillas y objetivos de estimulacion: al tratar semillas y centros de ROI como puntos con nombre propio, sirve para catalogar paradigmas experimentales y sus localizaciones.

## Benchmarks y rendimiento

Resultados en conjuntos retenidos, decodificacion greedy, salida restringida por esquema y cada modelo bajo su propia instruccion. Los puntos coinciden en xyz redondeado; un analisis coincide cuando comparte al menos la mitad de sus puntos. Precision del 97-100 % en ambos modelos.

| Conjunto | v2 (nu-prose-norole) | v3 (este modelo) |
|---|---|---|
| Gold (78 pasajes): puntos encontrados / analisis coincidentes | 98,7 % / 88,8 % | 100 % / 91,4 % |
| NMB (111 pasajes): puntos / analisis | 98,2 % / 89,9 % | 97,7 % / 92,3 % |
| Resultados nulos nombrados conservados (de 39) | 0 | 32 |
| Analisis `Seed:` (de 15) | 0 | 14 |
| Sintetico dificil (200 pasajes): puntos / analisis | 96,1 % / 94,2 % | 100 % / 100 % |

Nota del autor: las claves de gold y NMB se re-auditaron bajo las reglas de v3 (Claude Opus), por lo que v2 no puede puntuar en resultados nulos ni en nombres `Seed:` en esos conjuntos. En el conjunto sintetico dificil, v2 obtiene el 69 % de los puntos de tests F/post hoc frente al 100 % de v3.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con 4,54 B parametros, en fp16 los pesos ocupan aproximadamente 9 GB (el repo pesa 9,1 GB); en cuantizaciones de 8 bits o 4 bits el requisito seria sustancialmente menor, aunque el autor no publica variantes cuantizadas.
- GPU recomendadas: el entrenamiento se realizo en 3 GPU A100; para inferencia no se especifican modelos concretos.
- Cabe en GPU de consumo: no confirmado por el autor; por tamano (aprox. 9 GB en fp16) seria viable en GPUs de consumo con suficiente VRAM, pero no hay dato oficial.
- Opciones de despliegue: transformers (`AutoModelForCausalLM.from_pretrained`), vLLM con `structured_outputs` para decodificacion restringida por esquema; el autor cita su integracion en ns-pond. No se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jdkent/nuextract3-neuro-prose (este) | 4,54 B | no disponible | Extraccion de coordenadas desde prosa de neuroimagen | apache-2.0 | Hugging Face (pesos fusionados) |
| jdkent/nuextract3-neuro-tables | no disponible | no disponible | Extraccion de coordenadas desde tablas de resultados | no disponible | Hugging Face |
| numind/NuExtract3 (base) | no disponible | no disponible | Extraccion de informacion estructurada generica | no disponible | Hugging Face |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Las claves de referencia (answer keys) son auditorias de modelo, verificadas para que cada valor aparezca impreso en el pasaje, no etiquetas manuales humanas.
- v3 a veces anade un analisis nulo que la clave de referencia no incluye; los revisados por el autor resultaron reales, pero introduce ruido potencial.
- Se pierde 1 de los 15 analisis `Seed:` en el conjunto gold.
- El dataset de entrenamiento no se publica (pasajes de articulos cientificos), lo que limita la reproducibilidad del ajuste.
- Los pesos son fusionados; cargar solo un adaptador LoRA seria incorrecto, ya que hay tensores de capas Mamba entrenados directamente.
- No se declaran idiomas soportados: el rendimiento en textos que no sean ingles cientifico no esta documentado.
- No se publican datos de contexto maximo, cuantizaciones ni benchmarks estandar (MMLU, HumanEval, etc.); la evaluacion se limita a la tarea especifica de extraccion.
- Riesgo de alucinacion inherente a la generacion: aunque el entrenamiento verifica que los valores esten impresos en el pasaje, no hay garantia formal en produccion; se recomienda validacion por esquema y revision de muestras.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base numind/NuExtract3.
- Es un modelo de nicho: su utilidad fuera de la extraccion de coordenadas de neuroimagen no esta evaluada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jdkent/nuextract3-neuro-prose
- Modelo base: https://huggingface.co/numind/NuExtract3
- Modelo hermano para tablas: https://huggingface.co/jdkent/nuextract3-neuro-tables
- Workflow de ingesta ns-pond: https://github.com/neurostuff/ns-pond-ingestion-workflow
