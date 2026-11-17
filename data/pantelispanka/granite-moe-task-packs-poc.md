# Pantelispanka/granite-moe-task-packs-poc

## Resumen

`Pantelispanka/granite-moe-task-packs-poc` es una prueba de concepto de investigación publicada en Hugging Face que explora la carga parcial de expertos en un modelo de mezcla de expertos (MoE). El autor, Pantelispanka, parte de `ibm-granite/granite-3.1-1b-a400m-base` (24 capas, 32 expertos por capa, 8 activos por token) y entrena "task packs": subconjuntos de expertos por tarea acompañados de un delta de bajo rango, con el objetivo de que un dispositivo descargue solo los expertos necesarios para una tarea y ejecute el modelo en local con una fracción de la memoria.

El resultado principal es negativo en calidad: la maquinaria de carga y selección funciona (carga real de 0,73B parámetros en lugar de 1,33B con 16 expertos, velocidad intacta de unos 16 tokens/s y clasificador de tarea con 92% de acierto desde los primeros 32 tokens), pero los packs no conservan la capacidad del modelo completo. En HumanEval pass@1 el modelo completo obtiene 12,2% y el pack de 16 expertos baja a 9,8%; en preguntas de opción múltiple el pack de QA queda en el nivel del azar (25,4% frente a 36,2%).

La relevancia es metodológica: el trabajo documenta que la perplexity engaña como métrica de selección de expertos, que fusionar expertos destruye el modelo y que el ajuste fino del modelo completo para tolerar expertos ausentes empeora los resultados. Es material de referencia para quienes investigan enrutamiento, poda y despliegue eficiente de MoE, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (base: Granite-3.1-1B-A400M, 24 capas, 32 expertos por capa, 8 activos por token) |
| Parametros totales | 1,33B (modelo completo); 0,73B con pack de 16 expertos |
| Parametros activos | 8 expertos por token (constante en carga completa y parcial) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor reporta ejecución en FP16/BF16 en RTX 4070 de 8 GB sin detallar cuantización) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,4 GB; formato inferido del ecosistema Hugging Face, no confirmado en la model card) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de IBM con 24 capas, 32 expertos por capa y 8 expertos activos por token, más un experto compartido cuyos pesos nunca se modifican. Sobre esa base, el autor define un "task pack" por tarea: para cada capa, una lista de C expertos a cargar, los pesos del router y un delta de bajo rango (rank 8 o 32) sobre la proyección de salida de los expertos conservados. Los packs se entrenan destilando el modelo completo mientras los expertos ausentes se bloquean realmente (`scripts/14_task_pack.py`) y son anidados: un pack de 12 expertos es el de 8 más 4 expertos por capa, de modo que el pack se reduce de 16 a 12 y a 8 durante el entrenamiento.

El pipeline completo consta de cuatro pasos: calcular la media de embeddings de los primeros 32 tokens del prompt sin pasar por el modelo, clasificar la tarea con un clasificador pequeño (92% de acierto), cargar solo los expertos del pack más su delta y decodificar. El coste por token no cambia porque siguen activándose 8 expertos, así que la velocidad iguala a la del modelo completo (unos 16 tokens/s); la ventaja frente a hacer swapping de expertos al mismo presupuesto de memoria es de 15,4 frente a 12,6 tokens/s con 16 slots y de 15,4 frente a 10,6 con 8. El autor no reclama novedad para el pipeline: el enrutado de modelos o adaptadores desde el prompt es práctica establecida y los mapas prompt-a-experto ya existen (fMoE).

## Capacidades

- Generación de texto y razonamiento de base heredados de Granite-3.1-1B-A400M, pero degradados de forma severa en los packs parciales.
- Generación de código: el pack de código de 16 expertos alcanza 9,8% de pass@1 en HumanEval frente a 12,2% del modelo completo.
- Respuesta a preguntas de opción múltiple: el pack de QA queda en 25,4-25,5% de acierto, prácticamente el nivel del azar (25%) en 1000 ítems.
- Clasificación de tarea en dispositivo a partir del prompt: 92% de acierto usando la media de embeddings de los primeros 32 tokens, sin pasar por el modelo.
- Carga parcial real de expertos con velocidad de decodificación intacta.
- Tool calling, function calling, agentes, visión, audio y modo thinking: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en enrutamiento y poda de MoE: el repositorio sirve como banco de pruebas reproducible para medir si la selección de expertos por tarea conserva la calidad, con scripts para destilación de packs, predicción de conjuntos de expertos y ajuste solo de routers.
- Estudio de métricas de evaluación: el resultado de que los packs de código superan al modelo completo en perplexity (3,51 frente a 3,65) y pierden en pass@1 es un caso concreto para calibrar por qué la perplexity no debe usarse como criterio único de selección de expertos.
- Despliegue en dispositivo con memoria limitada: el pipeline de carga parcial (0,73B parámetros con 16 expertos) demuestra la viabilidad técnica de ejecutar un MoE de 1,33B en una GPU de portátil de 8 GB descargando solo los expertos de la tarea, útil como base para prototipos de inferencia local y privada.
- Enrutado de tareas en el borde: el clasificador de tarea basado en los primeros 32 tokens (92% de acierto, sin pase de modelo) es reutilizable en sistemas que deban decidir qué adaptador o subconjunto de pesos cargar antes de invocar al modelo.
- Comparación de estrategias de compresión: el trabajo documenta que fusionar expertos con alineación de neuronas destruye el modelo (perplexity en los miles) y que recortar a 16 expertos con ajuste fino de las salidas recupera código a 4,61 frente a 4,58, lo que permite contrastar poda frente a destilación en un mismo modelo base.
- Docencia y formación: el repositorio incluye resultados ordenados por secciones (divergencia de enrutado, fusión, ajuste de routers, predicción de conjuntos) que sirven como material didáctico sobre el funcionamiento interno de un MoE.

## Benchmarks y rendimiento

Precisión real por tarea, con solo los expertos del pack en memoria:

| Test | Modelo completo (32 expertos) | Pack 16 expertos | Pack 12 | Pack 8 |
|---|---|---|---|---|
| HumanEval pass@1 (164 problemas) | 12,2% (20) | 9,8% (16) | 8,5% (14) | 5,5% (9) |
| QA opción múltiple (1000 ítems, azar 25%) | 36,2% | 25,4% | no disponible | 25,5% |

Perplexity en contextos retenidos de la distribución de entrenamiento de los propios packs (el autor advierte que sobrestima la calidad):

| Tarea | Modelo completo | Pack 16 expertos | Pack 8 expertos |
|---|---|---|---|
| Código | 3,65 | 3,51 | 3,79 |
| QA (contextos estilo ARC) | 6,93 | 7,43 | 9,89 |
| Matemáticas | 2,05 | 3,00 | 3,61 |
| Prosa | 9,31 | 13,83 | 23,81 |

Otros datos reportados: perplexity con carga parcial sin adaptación de 15,5 / 34 / 126 con 16 / 12 / 8 expertos; en contextos MMLU el pack limpio de QA empeora un 50% (9,31 frente a 6,20); el ajuste fino del modelo completo para tolerar expertos ausentes hizo caer HumanEval de 12,2% a 2,4% con todos los expertos y a 0% con pack de 12, y QA de 36,2% a 28,4% y 25,5%. La predicción del conjunto de expertos desde el prompt (regresión ridge) da una tasa de acierto estática de 0,490 a 8 expertos frente a 0,452 del conjunto global, 0,484 de la etiqueta de tarea y 0,513 del oráculo. Todos los números son ejecuciones únicas en una RTX 4070 de 8 GB.

## Requisitos de hardware

- VRAM estimada: el autor ejecuta el modelo completo y los packs en una RTX 4070 de 8 GB; el pack de 16 expertos ocupa 0,73B parámetros más un delta de 10-39 MB, frente a 1,33B del modelo completo.
- GPU recomendadas: RTX 4070 (8 GB) validada por el autor; no se han probado otras GPU en la información disponible.
- Cabe en GPU de consumo: sí, en una RTX 4070 de 8 GB según la prueba publicada.
- Opciones de despliegue: no se especifican frameworks (vLLM, llama.cpp, Ollama, TGI); el autor usa scripts propios del repositorio (`scripts/14_task_pack.py`, `scripts/12_gnn_predictor.py`).
- Latencia y throughput: unos 16 tokens/s con pack de 16 expertos, igual que el modelo completo; 15,4 frente a 12,6 tokens/s con 16 slots frente a swapping, y 15,4 frente a 10,6 con 8 slots.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| granite-moe-task-packs-poc | 1,33B totales / 0,73B con pack de 16 | no disponible | HumanEval pass@1 12,2% completo, 9,8% pack 16; QA 36,2% completo, 25,4% pack 16 | Apache 2.0 | Hugging Face, 0 descargas |
| ibm-granite/granite-3.1-1b-a400m-base | 1,33B totales, 400M activos | no disponible | referencia del autor: HumanEval 12,2%, QA 36,2% | Apache 2.0 | Hugging Face (modelo base de IBM) |
| Pantelispanka/granite-moe-code-specialist-0.7b-v0 | ~0,7B (16 expertos de código, modifica los expertos) | no disponible | perplexity de código 4,61 frente a 4,58 del completo | no disponible en la información | Hugging Face (publicación del mismo autor) |

## Limitaciones y advertencias

- Calidad insuficiente para uso real: los packs no conservan la capacidad del modelo; el pack de QA está en el nivel del azar y el de código pierde 4 problemas en HumanEval a mitad de expertos y claramente más a un cuarto.
- La perplexity no es un criterio fiable: los packs de código superan al modelo completo en perplexity y pierden en pass@1, y la primera medición de QA ("7% peor") estaba sesgada por usar solo contextos estilo ARC.
- El ajuste fino del modelo completo para tolerar expertos ausentes degrada el rendimiento en lugar de mejorarlo (HumanEval de 12,2% a 2,4%).
- La predicción de expertos individuales desde el prompt no aporta nada frente a un conjunto fijo por tarea; el predictor de red de grafos solo se probó en modo smoke test (0,461 frente a 0,466 de ridge y 0,481 del oráculo).
- Fusionar expertos destruye el modelo (perplexity en los miles), y el ajuste solo de routers concentra el enrutado a costa de calidad.
- Todos los resultados son ejecuciones únicas en una RTX 4070 de 8 GB, sin repetición ni intervalos de confianza; el propio autor lo advierte.
- Riesgo de alucinación y sesgos: no evaluados en la información proporcionada.
- Idiomas soportados y longitud de contexto: no disponibles.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero al ser una prueba de concepto con calidad degradada no es apta para producción.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Pantelispanka/granite-moe-task-packs-poc
- Modelo base: https://huggingface.co/ibm-granite/granite-3.1-1b-a400m-base
- Modelo relacionado del mismo autor: https://huggingface.co/Pantelispanka/granite-moe-code-specialist-0.7b-v0
- Paper, blog, repositorio de código y demos: no disponibles en la información proporcionada.
