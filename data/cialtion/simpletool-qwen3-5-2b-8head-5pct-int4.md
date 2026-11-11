# Cialtion/SimpleTool-Qwen3.5-2B-8Head-5pct-INT4

## Resumen

SimpleTool-Qwen3.5-2B-8Head-5pct-INT4 es un checkpoint de Qwen3.5-2B afinado por Cialtion con una arquitectura de cabeceras multiples ("eight-head") orientada especificamente a la generacion de llamadas a herramientas (tool calling). El modelo divide la generacion en ocho ramas logicas —`content`, `function`, `arg1` a `arg6`— que comparten el backbone del transformer y decodifican de forma autorregresiva independiente. El sufijo "5pct" hace referencia a la fraccion de datos de entrenamiento del proyecto, no a una poda del modelo, y el checkpoint se distribuye cuantizado en INT4 (RTN afino por grupos de 64, serializacion AWQ) con los tensores no cuantizados en FP16.

El modelo resuelve un problema muy concreto: la generacion fiable y estructurada de llamadas a funciones con argumentos tipados, evitando que el modelo mezcle prosa con JSON malformado. Al separar la seleccion de funcion y cada argumento en cabeceras dedicadas, el decodificador puede imponer el esquema de la herramienta seleccionada e ignorar los slots sobrantes, lo que simplifica el parseo en produccion. Con 2.274.069.824 parametros (2B) y un repositorio de 2,5 GB, esta pensado para despliegues con recursos limitados.

Es relevante ahora porque los flujos de agentes y function calling exigen modelos pequenos que quepan en una sola GPU consumer pero mantengan precision estricta en la estructura de las llamadas. Este checkpoint es una prueba de concepto reproducible (paso de entrenamiento 2474, tokenizer propio con 17 tokens especiales de apertura/cierre/nulo) con metricas publicadas sobre un conjunto diagnostico sintetico de 800 casos bilingues.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5) con ocho cabeceras logicas de decodificacion (`content`, `function`, `arg1`–`arg6`) |
| Parametros totales | 2.274.069.824 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (RTN afino, grupo 64, serializacion AWQ); tensores no cuantizados en FP16 |
| Idiomas soportados | zh, en |
| Licencia | Apache 2.0 (licencia upstream conservada en `LICENSE`; dataset bajo CC BY 4.0) |
| Formato de pesos | safetensors (INT4/AWQ) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B y anade una capa de cabeceras multiples sobre el mismo backbone: ocho ramas logicas que comparten los pesos del transformer pero decodifican de forma autorregresiva independiente. La rama `function` selecciona la herramienta y las ramas `arg1` a `arg6` rellenan los argumentos segun el orden de `properties` del esquema; el token `<|null|>` marca slots omitidos o no usados. Las cabeceras de argumentos no estan condicionadas por la salida de la funcion recien generada, lo que implica que el esquema se resuelve a posteriori ignorando las colas sobrantes. El checkpoint corresponde al paso de entrenamiento 2474 bajo una programacion de datos al 5 % del proyecto.

El checkpoint se guarda en INT4 con cuantizacion afina RTN por grupos de 64 en serializacion AWQ, sin calibracion de activaciones; los tensores no cuantizados permanecen en FP16. La evaluacion reportada se midio sobre este mismo checkpoint INT4 con computo FP16. El autor advierte que para FP8 debe usarse computo BF16 (en un modelo de 397B FP8 con computo FP16 se diagnostico un desbordamiento en el intermedio de shared-expert que producia generacion invalida, resuelto al pasar a BF16 sin cambiar los pesos). No se documentan el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de llamadas a herramientas con funcion seleccionada y argumentos tipados (hasta seis argumentos por llamada).
- Salida estructurada por cabeceras: propuesta de funcion separada de los argumentos, con token nulo para slots omitidos.
- Generacion de contenido textual mediante la rama `content` (no evaluada en el diagnostico publicado).
- Soporte bilingue chino e ingles.
- Integracion con esquemas de herramientas mediante orden de `properties` y `required`.
- Cliente compatible con la API de completions de OpenAI incluido en el repositorio (`infer_heads.py`), que imprime propuestas de llamada y no ejecuta herramientas.
- Modo de prompt `direct` (marcador de cabecera tras el prefijo del asistente) para modelos de 0,8B/2B/4B, y `empty-think` (bloque `<think>` vacio explicito) para 9B en adelante.

## Casos de uso

- Enrutado de funciones en asistentes conversacionales: el modelo selecciona la herramienta adecuada y rellena argumentos tipados, lo que permite conectar un LLM pequeno a un orquestador de agentes sin parseo heuristico de JSON.
- Pipelines de automatizacion con esquemas fijos: al respetar el orden de `properties` y `required`, encaja en flujos donde las herramientas tienen firmas estables y se necesita validacion estricta de tipos y valores literales antes de ejecutar.
- Despliegue en GPUs consumer: con 2,27B parametros y pesos INT4 (repositorio de 2,5 GB), cabe en tarjetas de gama media para prototipos de agentes locales.
- Procesamiento bilingue zh/en: util para productos con usuarios en ambos idiomas que requieran llamadas a APIs internas con argumentos en el idioma del usuario.
- Evaluacion y regresion de tool calling: el conjunto SimpleTool-Diagnostic-800 (800 casos sinteticos, 400 zh y 400 en) sirve como banco de pruebas reproducible para comparar variantes de prompt o de cuantizacion.
- Investigacion sobre decodificacion estructurada: las cabeceras independientes permiten estudiar el efecto de condicionar o no los argumentos respecto a la funcion generada, y de ignorar slots sobrantes segun el esquema.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre SimpleTool Diagnostic 800 (800 casos sinteticos emparejados de llamada unica, 400 zh y 400 en; sin ejecucion de herramientas ni generacion de la cabecera `content`), medidos en INT4/FP16, muestreo greedy, temperatura 0, semilla 1107, maximo 128 tokens generados por cabecera activa, protocolo de prompt `direct`:

| Lote de evaluacion | Llamadas requeridas correctas | Casos |
|---|---:|---:|
| Contrafactual chino | 137 | 200 |
| Contrafactual ingles | 136 | 200 |
| Bilingue dificil | 58 | 200 |
| Bilingue multiargumento | 45 | 200 |
| **Todas las llamadas requeridas** | **376 (47,000 %)** | **800** |
| Solo nombre de funcion | 743 (92,875 %) | 800 |

El autor advierte que son puntuaciones diagnosticas sinteticas locales, que los registros emparejados estan correlacionados, que las etiquetas pueden contener errores residuales y que el conjunto no es un benchmark oficial BFCL/Mobile Actions ni de usuarios en produccion. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de latencia o throughput en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 2,5 GB en INT4; con overhead de runtime y cache KV se situa en el rango de 3 a 4 GB, aunque el autor no publica cifras de VRAM.
- GPU recomendadas: no especificadas por el autor; por tamano, cualquier GPU con al menos 4-6 GB de VRAM es candidata.
- Cabe en GPU consumer: previsiblemente si (RTX 3060, RTX 4060, RTX 4090 y similares), aunque no se confirma en la informacion disponible.
- Opciones de despliegue: backend compatible con la arquitectura Qwen3.5/Qwen3.6 y con el formato de cuantizacion AWQ/INT4; el repositorio incluye `infer_heads.py`, un cliente compatible con la API de completions de OpenAI. No se confirman vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor no reclama ningun resultado de velocidad ni garantiza una operacion fisica unica de prefill compartido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SimpleTool-Qwen3.5-2B-8Head-5pct-INT4 | 2,27B | no disponible | Tool calling con ocho cabeceras, INT4 | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-2B (base) | 2B | no disponible | LLM generalista | no disponible en la informacion | Hugging Face |
| Alternativas de tool calling de 2B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparables con otros modelos de la misma categoria en la informacion proporcionada; la unica comparacion posible es con el modelo base, del que no se detallan metricas.

## Limitaciones y advertencias

- Las puntuaciones publicadas son diagnosticas y sinteticas: 47,000 % de llamadas completas correctas y 92,875 % de acierto solo en el nombre de funcion; no equivalen a benchmarks oficiales ni a trafico real.
- El conjunto de evaluacion tiene registros emparejados correlacionados y posibles errores residuales en las etiquetas.
- Los argumentos no se condicionan a la funcion generada, por lo que un error en la seleccion de funcion arrastra los argumentos.
- El protocolo de prompt es estricto: cambiar la precision almacenada o el prompt invalida la reclamacion de la misma puntuacion.
- El modelo solo declara soporte para chino e ingles; no se documenta el comportamiento en castellano ni en otros idiomas.
- No se publican datos de contexto maximo, sesgos conocidos ni tasas de alucinacion.
- El autor exige que las aplicaciones validaden las llamadas generadas antes de ejecutarlas; el cliente incluido nunca ejecuta herramientas.
- Para FP8 debe usarse computo BF16; el computo FP16 con pesos FP8 puede producir generacion invalida en arquitecturas de mayor tamano.
- Licencia Apache 2.0 permite uso comercial, pero la licencia del dataset es independiente (CC BY 4.0); conviene revisar las condiciones de atribucion.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cialtion/SimpleTool-Qwen3.5-2B-8Head-5pct-INT4
- Dataset de diagnostico: https://huggingface.co/datasets/Cialtion/SimpleTool-Diagnostic-800
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Contrato de servicio: `INFERENCE.md` (incluido en el repositorio del modelo)
- Cliente de inferencia: `infer_heads.py` (incluido en el repositorio del modelo)
