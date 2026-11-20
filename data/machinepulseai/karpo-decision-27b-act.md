# MachinePulseAI/karpo-decision-27B-act

## Resumen

Karpo Decision 27B Act es un modelo de decisión especializado en acciones web, desarrollado por MachinePulseAI a partir de Qwen/Qwen3.8-27B. No es un modelo generativo al uso: en cada paso de una tarea de navegación recibe el objetivo, una captura de pantalla, el historial de acciones y una lista numerada de los elementos de la página, y elige la opción más probable entre las disponibles (acciones sobre elementos, acciones de página o uno de siete finales). Funciona con un único pase hacia delante, sin muestreo ni texto generado, leyendo directamente las probabilidades sobre los códigos de opción mediante un readout lineal.

El modelo forma parte de karpo-browser, un agente de navegador open source de Karpo en el que este modelo actúa como "System 1" (decisión rápida de bajo coste) y DeepSeek V4.1 Flash como "System 2" (razonamiento de mayor nivel). Según el autor, esta combinación resuelve el 84% de las 38 tareas centrales de Browserbase Benchmark v2 en 218 s y 0,096 USD de coste de modelo por tarea, con System 1 ejecutando aproximadamente el 78% de las acciones de página en el 14% del tiempo.

Con 26.085.330.160 parámetros en bf16, contexto de 32.768 tokens y licencia Apache-2.0, es relevante para quienes construyen agentes de navegador y buscan reducir latencia y coste delegando la selección de acciones en un clasificador dedicado en lugar de un LLM generativo. El modelo base (Karpo Decision 27B, de propósito general) no se ha publicado por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Qwen3.8-27B (con encoder de visión propio); readout lineal de 255 × 5.120 en fp32 sobre códigos de opción |
| Parametros totales | 26.085.330.160 (26,1B) en bf16, más el readout en fp32 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens por secuencia (valor por defecto del código de inferencia) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un modelo multimodal con encoder de visión, y se obtiene mediante un post-entrenamiento en dos etapas: primero se deriva Karpo Decision 27B (modelo de decisión general, no publicado) y después se ajusta específicamente para acciones web. La innovación central es el mecanismo de decisión: en lugar de generar texto, el modelo calcula probabilidades directamente sobre un conjunto acotado de opciones (hasta 255 por pregunta) mediante un readout lineal, y selecciona la de mayor probabilidad. El entrenamiento se realizó con y sin capturas de pantalla, de modo que el modelo funciona aunque no se envíe imagen.

La formulación de la tarea incluye tres tipos de pregunta: una elección por paso entre acciones de elemento, acciones de página y siete finales; una elección de seguimiento para las acciones `FILL` y `SELECT`; y una pregunta de sí/no sobre si el agente está entrando en bucle. En karpo-browser, cada petición ocupa como máximo unos 32.000 tokens y 255 opciones, con una mediana de entrada de 7,3k a 7,7k tokens incluida la captura. Las peticiones que exceden el contexto se dividen por preguntas, cada parte con el estado completo, y una pregunta que no cabe junto con su estado se rechaza en lugar de truncarse. No se dispone de datos sobre volumen de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Clasificación de acciones web: elige, en un único pase hacia delante, entre las acciones disponibles en una página y siete finales posibles.
- Decisión multimodal: procesa texto (objetivo, valores a rellenar, historial de acciones y efectos, lista numerada de elementos) y captura de pantalla; también opera sin imagen.
- Sub-decisión para formularios: elección de seguimiento específica para las acciones `FILL` y `SELECT`.
- Detección de bucles: responde a una pregunta de sí/no sobre si la trayectoria está dando vueltas sin avanzar.
- Inferencia determinista y de baja latencia: sin muestreo ni generación de texto; mediana de 931 ms por decisión en KBB a una petición simultánea y sin aceleración de inferencia.
- Integración como System 1 en arquitecturas de agente de dos niveles, delegando el razonamiento de alto nivel en un modelo System 2.
- No se documentan capacidades de generación de texto libre, código, matemáticas ni tool calling genérico; su función es la selección de opciones.

## Casos de uso

- Agentes de navegador de producción: actuar como capa de decisión de bajo coste que selecciona la siguiente acción en cada paso, reservando el LLM grande para planificación y recuperación de errores, como hace karpo-browser con DeepSeek V4.1 Flash como System 2.
- Automatización de formularios web: usar la sub-decisión de `FILL` y `SELECT` para elegir valores y opciones en campos y desplegables a partir de los valores permitidos en la petición.
- Reducción de coste por tarea en pipelines de agentes: al resolver la mayoría de acciones con un solo pase de ~1 s, se disminuye el número de llamadas a modelos generativos; el autor reporta 0,096 USD de coste de modelo por tarea en Browserbase Benchmark v2.
- Control de bucles en agentes autónomos: la pregunta de sí/no sobre circularidad permite cortar trayectorias improductivas antes de agotar presupuesto de pasos o tokens.
- Evaluación y testeo de agentes web: servir como política de referencia determinista para comparar cambios en el entorno, el preprocesado de páginas o el modelo System 2, al no depender de muestreo.
- Ejecución en entornos con restricciones de latencia: con una mediana de 931 ms por decisión y contexto de 32.768 tokens, encaja en flujos interactivos donde un LLM generativo añadiría segundos por paso.
- Procesamiento por lotes de trayectorias de navegación: clasificar acciones sobre registros históricos de páginas para analizar o anotar comportamiento de agentes.

## Benchmarks y rendimiento

Resultados declarados por el autor (automedidos, no verificados en el board de KBB):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Decisión de acción web (una elección por paso entre acciones de página y 7 finales) | Karpo BrowserBench (KBB) 1.0, split privado (1.794 instrucciones puntuadas) | Tasa de completado (todos los pasos correctos) | 35,5% |
| Decisión de acción web | KBB 1.0, split privado (1.794 instrucciones) | Precisión por paso | 78,5% |
| Decisión de acción web | KBB 1.0, todas las 2.748 instrucciones (split privado y público) | Tasa de completado | 35,3% |
| Decisión de acción web | KBB 1.0, todas las 2.748 instrucciones | Precisión por paso | 78,3% |

Resultados de extremo a extremo de karpo-browser (System 1 = este modelo, System 2 = DeepSeek V4.1 Flash), medidos por el autor:

| Conjunto de tareas | Precisión | Tiempo por tarea | Coste de modelo por tarea | Ejecuciones |
|---|---|---|---|---|
| 38 tareas centrales de Browserbase Benchmark v2 | 84% | 218 s | 0,096 USD | media de 8 |
| Las 102 tareas | 86% | 201 s | 0,096 USD | media de 3 (configuración final) |

Según el autor, en el board de Browserbase Benchmark v2 del 19 de noviembre de 2026 ningún registro de los 91 existentes alcanza el 80% en menos de 250 s y 0,15 USD por tarea. No se han publicado resultados en benchmarks estándar de LLM (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 26,1B parámetros en bf16, los pesos ocupan aproximadamente 52 GB, por lo que se necesita al menos una GPU de 80 GB (A100/H100) para bf16 sin cuantizar; el repo ocupa 52,2 GB.
- GPU recomendadas: no documentadas por el autor; por tamaño, A100 80 GB, H100 80 GB o configuraciones multi-GPU.
- GPU de consumo: no cabe en GPUs de consumo de 24 GB en bf16; no se documentan cuantizaciones (GGUF, AWQ, GPTQ) que permitan reducir requisitos.
- Opciones de despliegue: transformers (librería declarada); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: mediana de 931 ms por decisión en KBB, con una petición simultánea y sin aceleración de inferencia. No se publican cifras de throughput con batching.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Estado |
|---|---|---|---|---|---|
| Karpo Decision 27B Act | 26,1B | 32.768 tokens | Clasificador de acciones web (System 1) | Apache-2.0 | Público |
| Karpo Decision 31B | No disponible | No disponible | Decisión con el mismo interfaz y tipo de readout | No disponible | Público (referenciado por el autor) |
| Karpo Decision 27B | No disponible | No disponible | Modelo de decisión general, base del anterior | No disponible | No publicado |
| Qwen/Qwen3.8-27B | No disponible | No disponible | Modelo multimodal base | No disponible | Público (modelo base) |

No se dispone de datos de benchmarks comparables entre estos modelos en la información proporcionada, salvo la referencia del autor a que Karpo Decision 31B funciona con el mismo esquema de un pase y readout lineal. No se identifican en la información modelos de terceros directamente comparables en la tarea de decisión de acciones web.

## Limitaciones y advertencias

- Resultados automedidos: las métricas de KBB y de Browserbase Benchmark v2 no están verificadas en los boards oficiales; el propio autor lo indica.
- Tasa de completado limitada: el 35,5% de instrucciones completadas con todos los pasos correctos en el split privado implica que la mayoría de trayectorias contienen al menos un error, aunque la precisión por paso sea del 78,5%.
- Dependencia de un System 2: los resultados de extremo a extremo de karpo-browser incluyen DeepSeek V4.1 Flash; no representan el rendimiento del modelo aislado.
- Ámbito restringido: el modelo solo elige entre opciones predefinidas; no genera texto, código ni razonamiento libre, y no sirve como LLM de propósito general.
- Contexto y rechazo de peticiones: las peticiones que no caben en 32.768 tokens junto con su estado se rechazan, no se truncan, lo que puede provocar fallos en páginas o estados muy extensos.
- Idiomas: no se documentan los idiomas soportados.
- Sesgos y alucinación: no se documentan sesgos conocidos; al ser un clasificador sobre opciones dadas, el riesgo de alucinación de contenido es bajo, pero puede seleccionar opciones incorrectas con alta confianza.
- Licencia Apache-2.0: permite uso comercial; deben conservarse los avisos de licencia correspondientes.
- Cuantizaciones: no se documentan, lo que limita el despliegue en hardware modesto.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de adopción externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MachinePulseAI/karpo-decision-27B-act
- Licencia: https://huggingface.co/MachinePulseAI/karpo-decision-27B-act/blob/main/LICENSE
- Benchmarks KBB: https://karpo.ai/benchmarks/browserbench
- Browserbase Benchmark v2 (Stagehand evals): https://stagehand.dev/evals
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Karpo Decision 31B: https://huggingface.co/MachinePulseAI/karpo-decision-31B
