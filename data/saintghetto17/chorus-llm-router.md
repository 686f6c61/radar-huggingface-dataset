# Saintghetto17/chorus-llm-router

## Resumen

CHORUS-Router es un modelo de decisión especializado en enrutamiento de consultas entre modelos de lenguaje de distinta capacidad. Lo desarrolla Saintghetto17 y se distribuye bajo licencia Apache 2.0. Su función no es generar texto, sino estimar la probabilidad `p_small_solves` de que un modelo pequeño resuelva una tarea dada en su primer intento; a partir de un umbral configurable, el sistema devuelve `lite` (modelo pequeño) o `hard` (modelo grande o pipeline Fusion). El modelo en sí no invoca ninguna API: solo emite la decisión y la aplicación enruta la petición.

Arquitecturalmente es un fine-tune del backbone Qwen3.5-9B con una cabeza de decisión denominada clef-flash, partiendo del checkpoint Cloudflare/clef-flash. Cuenta con 9.409.813.744 parámetros en formato safetensors (repo de 19,1 GB) y una única pasada forward por tarea, lo que se traduce en una fracción de segundo sobre una GPU con unos 20 GB de memoria.

Su relevancia actual radica en la optimización de costes en producción: en la evaluación sobre LLMRouterBench, con un umbral de 0,5312, el router envió el 81 % de las consultas al modelo barato y mantuvo el 92,7 % de la calidad de GPT-5, con un ahorro del 58,4 % en coste de llamadas a modelo. El motor de inferencia no está en el repo de pesos, sino en el repositorio CHORUS (rama `english_release`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (backbone Qwen3.5-9B) con cabeza de decisión clef-flash |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo aplica límites de longitud de entrada definidos en `decision_model.json`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la release disponible es `english_release`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Cloudflare/clef-flash, un checkpoint basado en el backbone Qwen3.5-9B con una cabeza de decisión específica. Se fine-tuneó el backbone completo y la cabeza con AdamW durante 1,5 épocas, con learning rate de 1e-5 para el backbone y 1e-4 para la cabeza. Las etiquetas de entrenamiento registran si Qwen3.6-35B-A3B resolvió cada tarea en el primer intento. El conjunto de datos consta de 10.296 tareas de entrenamiento y 2.576 de validación, procedentes de 20 fuentes de benchmark, entre ellas MLCB Pro y 1C-bench. Se seleccionó el step 350 y el umbral de enrutamiento sobre el conjunto de validación.

La innovación principal es el enfoque de "modelo de decisión" desacoplado del enrutamiento: el modelo no llama a ningún LLM, solo estima la probabilidad de éxito del modelo pequeño mediante una única pasada forward. El umbral final se almacena en `decision_model.json` (campo `threshold`) y puede sobrescribirse por despliegue en `router/config/router.json`; un umbral más alto deriva más tareas a `hard`. Los campos de pregunta de enrutamiento, opciones de respuesta y límites de longitud de entrada no deben modificarse, ya que forman parte del entrenamiento. El pipeline de entrenamiento está disponible en `recipes/train_router`.

## Capacidades

- Estimación de probabilidad de éxito (`p_small_solves`) de un modelo pequeño sobre una tarea dada.
- Decisión binaria de enrutamiento (`lite` / `hard`) mediante regla de umbral configurable.
- Procesamiento de texto de tarea en una sola pasada forward, sin generación autoregresiva.
- Evaluación sobre tareas de razonamiento, código, matemáticas y agentes (los benchmarks de LLMRouterBench incluyen AIME, LiveCodeBench, LiveMathBench, GPQA-Diamond, SWE-bench Verified, MMLU-Pro, SimpleQA, ArenaHard, HLE y τ²-Bench).
- Servidor HTTP con endpoint `POST /route` para integración en aplicaciones.
- CLI de verificación (`--check`) que compara tres tareas de referencia con las puntuaciones esperadas.
- No soporta tool calling, agentes multi-step ni generación de texto: es exclusivamente un clasificador de decisión.

## Casos de uso

- Enrutamiento coste-calidad en producción: la aplicación envía cada consulta al router, que devuelve `lite` o `hard` según el umbral; en LLMRouterBench esto derivó el 81 % de las consultas al modelo barato con un coste de 13,94 USD frente a 33,52 USD por 1.000 consultas.
- Reducción de coste en APIs de atención al cliente: las consultas simples se resuelven con un modelo pequeño y solo las complejas escalan a un modelo grande, manteniendo la calidad percibida.
- Cascada FrugalGPT / HybridLLM: el router actúa como primer nivel de una cascada de dos modelos (Qwen3-235B-A22B-2507 y GPT-5 en la evaluación publicada) sin necesidad de reentrenamiento.
- Filtrado previo en pipelines de código: clasificar tareas de SWE-bench Verified o LiveCodeBench para decidir si requieren un modelo fuerte antes de invocar herramientas de CI/CD.
- Gestión de presupuesto en sistemas multi-modelo: ajustar el umbral para desplazar la distribución de tráfico entre modelos según el coste objetivo del despliegue.
- Evaluación de políticas de enrutamiento: usar el router como referencia en experimentos con LLMRouterBench y comparar contra RouteLLM, HybridLLM o FrugalGPT sobre los mismos pares de modelos.

## Benchmarks y rendimiento

Evaluación sobre LLMRouterBench (11.390 consultas tras excluir 1.056 con coincidencia normalizada en train/validación), enrutando entre Qwen3-235B-A22B-2507 y GPT-5, con umbral por defecto 0,5312:

| Metrica | CHORUS-Router | GPT-5 (referencia) |
|---|---|---|
| Puntuación media | 64,34 % | 69,44 % |
| Porcentaje de la calidad de GPT-5 | 92,7 % | 100 % |
| Coste por 1.000 consultas | 13,94 USD | 33,52 USD |
| Ahorro de coste | 58,4 % | — |
| Porcentaje de consultas enviadas al modelo barato | 81 % | — |

Cada benchmark tiene el mismo peso en la puntuación media; el coste se suma sobre las consultas y excluye el coste de ejecutar el router. No se han publicado resultados desglosados por benchmark en la información disponible. Avengers-Pro y OpenRouter Auto se incluyen como referencias externas, pero quedan fuera de la comparación de dos modelos (Avengers-Pro selecciona entre 13 modelos).

## Requisitos de hardware

- VRAM estimada para inferencia: unos 20 GB según la model card (una pasada forward por tarea).
- GPU recomendadas: no se especifican modelos concretos; cualquier GPU con ~20 GB de memoria es suficiente según el autor.
- Cabe en GPU de consumo: no confirmado explícitamente; 20 GB supera la VRAM de una RTX 4090 (24 GB) solo por margen ajustado, por lo que una RTX 4090 podría alojarlo, pero no está verificado en la información disponible.
- Opciones de despliegue: motor de inferencia del repositorio CHORUS (rama `english_release`), CLI `router.cli`, servidor HTTP `POST /route` e imagen Docker descrita en el README del router. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: una fracción de segundo por tarea en GPU con ~20 GB; no se publican cifras de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Pares de modelos | Entrenamiento en LLMRouterBench | Licencia |
|---|---|---|---|---|
| CHORUS-Router | Router de decisión (Qwen3.5-9B + cabeza) | Qwen3-235B-A22B-2507 / GPT-5 | No (evaluado sin entrenar en el benchmark) | Apache 2.0 |
| RouteLLM (MF) | Router por comparaciones pairwise | Gemini 2.5 Flash / GPT-5 | Sí, in-domain (70/30 por split) | no disponible |
| HybridLLM | Cascada | Mismo par que CHORUS | Configuración del benchmark | no disponible |
| FrugalGPT | Cascada | Mismo par que CHORUS | Configuración del benchmark | no disponible |
| Avengers-Pro | Selección entre 13 modelos | Pool de 13 modelos | Fuera de la comparación de dos modelos | no disponible |

No se dispone de cifras comparativas de puntuación y coste para RouteLLM, HybridLLM y FrugalGPT en la información proporcionada, más allá de que sus resultados provienen del paper de LLMRouterBench y de que RouteLLM (MF) se entrenó in-domain, lo que limita la comparación directa.

## Limitaciones y advertencias

- El modelo solo devuelve una decisión de enrutamiento; no genera texto ni ejecuta herramientas. Requiere un motor externo (repositorio CHORUS) para funcionar.
- El umbral y los campos de pregunta, opciones de respuesta y límites de longitud de `decision_model.json` no deben modificarse salvo el propio umbral, ya que forman parte del entrenamiento.
- El router se entrenó para predecir el éxito de Qwen3.6-35B-A3B, pero se aplicó a Qwen3-235B-A22B-2507 / GPT-5 sin reentrenamiento; el rendimiento en otros pares de modelos no está validado.
- La release disponible es `english_release`; el soporte multilingüe no está documentado.
- Riesgo de degradación de calidad si el umbral se fija demasiado bajo: más tareas se envían al modelo pequeño y la puntuación media cae.
- El coste reportado excluye el coste de ejecutar el router, que consume ~20 GB de VRAM por instancia.
- No se han publicado datos sobre sesgos, alucinación (no aplica a generación, pero sí a la estimación de probabilidad) ni límites de contexto.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Cloudflare/clef-flash y Qwen3.5 deben verificarse por separado.

## Enlaces

- Hugging Face: https://huggingface.co/Saintghetto17/chorus-llm-router
- Repositorio CHORUS (rama english_release): https://gitlab.ai.cloud.ru/rnd-nlp/chorus/-/tree/english_release/router
- Configuración del router: https://gitlab.ai.cloud.ru/rnd-nlp/chorus/-/blob/english_release/router/config/router.json
- Receta de entrenamiento: https://gitlab.ai.cloud.ru/rnd-nlp/chorus/-/tree/english_release/recipes/train_router
- LLMRouterBench: https://github.com/ynulihao/LLMRouterBench
- Paper LLMRouterBench: https://arxiv.org/abs/2601.07206
- Paper RouteLLM: https://arxiv.org/abs/2406.18665
- Lista de consultas con puntuaciones (CSV): https://gitlab.ai.cloud.ru/rnd-nlp/chorus/-/blob/english_release/recipes/llmrouterbench/queries.csv
- Script de evaluación: https://gitlab.ai.cloud.ru/rnd-nlp/chorus/-/tree/english_release/recipes/llmrouterbench
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
