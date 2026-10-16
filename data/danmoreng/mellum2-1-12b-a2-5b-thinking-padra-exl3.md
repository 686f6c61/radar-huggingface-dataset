# danmoreng/Mellum2.1-12B-A2.5B-Thinking-Padra-EXL3

## Resumen

Mellum2.1-12B-A2.5B-Thinking-Padra-EXL3 es una cuantizacion del modelo JetBrains/Mellum2.1-12B-A2.5B-Thinking publicada por el usuario danmoreng. Se trata de un modelo de generacion de texto con arquitectura de mezcla de expertos (MoE) de 12.000 millones de parametros totales y 2.500 millones activos por token, disenado especificamente como modelo de razonamiento ("thinking") para tareas agenticas, codigo, matematicas y uso de herramientas. Esta variante emplea cuantizacion EXL3-K4 sobre los pesos de los expertos, FP8 en las proyecciones de atencion y BF16 en routers, normas, embeddings y cabeza de salida, con un payload total de 7,09 GB y una media de aproximadamente 4,67 bits por parametro.

El modelo base fue desarrollado por JetBrains y la version 2.1 concentra casi todo el esfuerzo de entrenamiento en post-entrenamiento mediante aprendizaje por refuerzo (RL), incluyendo entornos reales de repositorios con shell y edicion de ficheros. La cuantizacion aqui descrita reduce el peso del modelo base (BF16) a menos de la mitad, lo que permite su despliegue en GPUs de consumo, a costa de requerir el runtime Padra en una revision concreta del repositorio en lugar de un runtime estandar.

Su relevancia actual radica en que ofrece capacidades de agente de codigo (SWE-bench Verified 47,0 en el modelo base) en un paquete de apenas 7,09 GB, con contexto nativo de 131.072 tokens en el modelo original. El paquete cuantizado, sin embargo, viene con un lanzador que fija la ventana en 8.192 tokens con KV en BF16, por lo que la ventana efectiva en este formato es menor que la del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), 28 capas, atencion GQA (32 cabezas Q, 4 KV) y ventana deslizante de 1.024 en 3 de cada 4 capas |
| Parametros totales | 12B en el modelo base; payload cuantizado de 7,09 GB |
| Parametros activos | 2,5B |
| Longitud de contexto | 131.072 tokens en el modelo base; el lanzador Padra de este paquete selecciona 8.192 tokens con KV en BF16 |
| Tipos de cuantizacion | EXL3-K4 (4 bits) en pesos de expertos con sidecars FP16; proyecciones de atencion en FP8; routers, normas, embeddings y cabeza de salida en BF16; media de ~4,67 bits por parametro |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Paquete nativo de Padra (native/manifest.json y native/weights.bin) mas tokenizer; la carga en ExLlamaV3 estandar no esta establecida segun el autor |
| Tamano del repositorio | 7,1 GB |
| Tamano de vocabulario | 98.304 tokens |
| Expertos | 64 totales, 8 activados por token |
| Dimension oculta | 2.304 |
| Dimension intermedia | 7.168 (MoE: 896) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer MoE de 28 capas con 64 expertos y 8 activados por token, con una dimension oculta de 2.304 y un tamano intermedio de 7.168 por experto (896 en el caso de los expertos MoE). La atencion usa GQA con 32 cabezas de consulta y 4 de clave/valor, combinada con una ventana deslizante de 1.024 tokens aplicada en 3 de cada 4 capas; las capas restantes operan sobre el contexto completo de 131.072 tokens. El modelo original se distribuye en bfloat16 y suma 12.000 millones de parametros, de los que 2.500 millones se activan por token.

En cuanto al entrenamiento, JetBrains indica que la arquitectura es identica a la de Mellum2 Thinking y que practicamente todo el trabajo de la version 2.1 se dedico al post-entrenamiento, en particular al aprendizaje por refuerzo, que paso de una etapa final corta a ser la parte principal del proceso. El RL se aplico sobre tareas nuevas de matematicas, programacion competitiva, ciencia, uso de herramientas e ingenieria de software, combinando conjuntos de datos abiertos con tareas propias y filtrando cada fuente antes de entrenar. Para las habilidades agenticas, el modelo se entrena dentro de repositorios reales con acceso a shell y herramientas de edicion de ficheros, y recibe recompensa cuando pasan los tests. No se especifica el numero de tokens de preentrenamiento ni si hubo fases de RLHF o DPO adicionales.

La innovacion tecnica de este paquete concreto es la cuantizacion EXL3-K4 de los pesos de los expertos, empaquetada en un formato nativo propio de Padra que no es directamente cargable por ExLlamaV3. El lanzador requiere Python 3.11 o superior y rechaza enlaces simbolicos, por lo que los pesos deben descargarse como ficheros locales reales.

## Capacidades

- Generacion de texto y razonamiento en modo "thinking", pensado para problemas dificiles de codigo, matematicas y logica.
- Codigo: escritura, depuracion y explicacion de funciones; el modelo base obtiene 91,5 en HumanEval+ y 82,0 en LiveCodeBench v6.
- Matematicas: resolucion de problemas de competicion (83,3 en AIME 25/26, 88,3 en GSM-Plus en el modelo base).
- Tareas agenticas: exploracion y edicion de repositorios, ejecucion de comandos en shell y verificacion de los propios cambios (SWE-bench Verified 47,0 en el modelo base).
- Tool calling y function calling: el modelo base soporta despliegue en vLLM con `--enable-auto-tool-choice` y `--tool-call-parser hermes`; obtiene 62,3 en BFCL v4.
- Razonamiento multi-paso para flujos de agente.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales: modo de razonamiento explicito; el modelo base anuncia proximamente una cabeza de prediccion multi-token (MTP) para decodificacion especulativa en vLLM, ademas de builds GGUF.
- Vision y audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Agente de ingenieria de software en repositorios: el modelo puede explorar un arbol de ficheros, abrir y editar archivos, lanzar comandos y comprobar sus propios cambios; su entrenamiento en entornos reales con tests como recompensa lo hace adecuado para tareas tipo SWE-bench.
- Asistente de programacion en el IDE: integrado mediante tool calling, puede completar funciones, localizar errores y proponer parches, con una ventana efectiva de 8.192 tokens en este paquete cuantizado suficiente para ficheros individuales y contexto cercano.
- Automatizacion de depuracion en CI/CD: dado un fallo de test, el modelo puede leer el log, inspeccionar el codigo implicado y proponer una correccion, encajando en pipelines que requieran una GPU de consumo.
- Resolucion de problemas matematicos y cientificos: con un rendimiento de referencia alto en AIME y GSM-Plus, sirve para tutoria automatica o generacion de soluciones paso a paso en entornos educativos.
- Orquestacion de herramientas externas: gracias al soporte de function calling, puede encadenar llamadas a APIs, consultas a bases de datos y operaciones de fichero dentro de un agente multi-paso.
- Despliegue en estaciones de trabajo con GPU unica: al ocupar 7,09 GB de pesos, es viable en equipos con GPUs de 12 GB o mas para asistentes locales sin dependencia de la nube.
- Prototipado de agentes en investigacion: su licencia Apache 2.0 y su tamano reducido permiten experimentar con RL, evaluacion de agentes o tecnicas de decodificacion especulativa en hardware asequible.

## Benchmarks y rendimiento

Los valores proceden del modelo base en BF16, fueron reportados por JetBrains con su propio pipeline en modo thinking y no han sido remedidos para este paquete cuantizado. Todos son porcentajes; en HarmBench un valor menor es mejor.

| Benchmark | Mellum2.1 Thinking | Mellum2 Thinking | Gemma 4 (E4B) | Qwen3.5 (9B) |
| :--- | ---: | ---: | ---: | ---: |
| LiveCodeBench v6 | 82,0 | 69,4 | 69,4 | 75,4 |
| HumanEval+ | 91,5 | 90,9 | 89,1 | 89,6 |
| MBPP+ | 79,4 | 75,4 | 70,9 | 69,8 |
| AIME 25/26 | 83,3 | 60,1 | 45,0 | 86,7 |
| GSM-Plus | 88,3 | 87,1 | 87,4 | 91,4 |
| SWE-bench Verified | 47,0 | 2,0 | 23,0 | 50,0 |
| Terminal-Bench 2.1 | 17,4 | 0,6 | 3,4 | 21,7 |
| SWE-bench Pro | 28,0 | 0,0 | 4,0 | 38,0 |
| BFCL v4 | 62,3 | 49,6 | 52,5 | 58,5 |
| WorkBench | 44,6 | 45,1 | 46,1 | 39,7 |
| ToolHop | 49,1 | 46,7 | 39,9 | 52,0 |
| IFEval | 90,6 | 79,5 | 90,8 | 92,4 |
| GPQA Diamond | 64,6 | 51,0 | 53,1 | 77,8 |
| MMLU-Redux | 87,8 | 86,0 | 84,9 | 89,5 |
| MixEval-Hard | 46,4 | 41,6 | 41,4 | 50,3 |
| Safety (XSTest) | dato incompleto en la informacion disponible | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks especificos para este paquete cuantizado en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 7,09 GB. Sumando la cache KV en BF16 para 8.192 tokens, del orden de 0,25 GB, y las activaciones y el overhead del runtime, el consumo total se situa en torno a 8 GB.
- GPU recomendadas: cualquier GPU con 12 GB o mas de VRAM. Una RTX 3060 de 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090 o L4 deberian ser suficientes. En el limite, una GPU de 8 GB podria quedarse corta por el overhead del runtime.
- GPU de centro de datos: A100, H100 y L40S son sobredimensionadas para el tamano del modelo; solo justificables por concurrencia o por el modelo base sin cuantizar.
- Cabe en GPU de consumo: si, en modelos de 12 GB o mas.
- Opciones de despliegue: este paquete concreto requiere Padra en la revision indicada del repositorio, lanzado con `python3 K4/launch.py --server`. Para el modelo base sin cuantizar, JetBrains documenta vLLM con `--reasoning-parser qwen3`. Los builds GGUF para llama.cpp, Ollama y LM Studio estan anunciados como proximos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Comparacion orientativa frente al modelo base y a las alternativas incluidas por JetBrains en su evaluacion. Los datos de parametros, contexto y licencia de los modelos de terceros no se detallan en la informacion disponible, por lo que se marcan como no disponibles.

| Modelo | Parametros | Contexto | Licencia | Formato y disponibilidad | Rendimiento de referencia |
|---|---|---|---|---|---|
| Mellum2.1 12B A2.5B Thinking Padra EXL3 | 12B totales, 2,5B activos | 8.192 tokens con el lanzador Padra | Apache 2.0 | Padra nativo, 7,09 GB | No remedido; hereda los valores del modelo base |
| JetBrains Mellum2.1-12B-A2.5B-Thinking | 12B totales, 2,5B activos | 131.072 tokens | Apache 2.0 | BF16, vLLM | LiveCodeBench v6 82,0; SWE-bench Verified 47,0; MMLU-Redux 87,8 |
| JetBrains Mellum2-12B-A2.5B-Thinking | 12B totales, 2,5B activos | no disponible | no disponible | BF16 | LiveCodeBench v6 69,4; SWE-bench Verified 2,0 |
| Qwen3.5 (9B) | no disponible | no disponible | no disponible | no disponible | LiveCodeBench v6 75,4; SWE-bench Verified 50,0; MMLU-Redux 89,5 |
| Gemma 4 (E4B) | no disponible | no disponible | no disponible | no disponible | LiveCodeBench v6 69,4; SWE-bench Verified 23,0; MMLU-Redux 84,9 |

## Limitaciones y advertencias

- Los benchmarks incluidos corresponden al modelo base en BF16, fueron autodeclarados por JetBrains y no se han vuelto a medir sobre la cuantizacion; el rendimiento real de este paquete puede diferir.
- La cuantizacion EXL3-K4 de los expertos y el uso de FP8 en las proyecciones de atencion introducen perdida de precision respecto al modelo original.
- El paquete usa un formato nativo de Padra y el autor indica que no esta establecida su carga en ExLlamaV3 estandar; queda ligado a una revision concreta del repositorio de Padra.
- El lanzador limita la ventana a 8.192 tokens con KV en BF16, muy por debajo de los 131.072 tokens del modelo base, lo que reduce su utilidad para tareas que requieran contexto largo.
- El cargador nativo rechaza enlaces simbolicos, lo que puede complicar la gestion de pesos en algunos entornos de despliegue.
- No se especifican los idiomas soportados, por lo que no puede garantizarse un rendimiento adecuado fuera del ingles.
- No hay informacion sobre sesgos conocidos ni sobre evaluaciones de seguridad completas; la fila de XSTest aparece incompleta en la informacion disponible.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en tareas de conocimiento factual y en la invocacion de herramientas con argumentos incorrectos.
- La licencia del paquete es Apache 2.0, pero conviene revisar los ficheros LICENSE y NOTICE del repositorio antes de un uso comercial.
- El modelo esta marcado como modelo de razonamiento, por lo que genera trazas de pensamiento largas; esto incrementa el coste en tokens frente a modelos no thinking.
- El repositorio registra cero descargas y cero likes en el momento de la consulta, por lo que no existe validacion comunitaria de su calidad.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/danmoreng/Mellum2.1-12B-A2.5B-Thinking-Padra-EXL3
- Modelo base en HuggingFace: https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking
- Repositorio de Padra: https://github.com/Danmoreng/padra
- Revision de Padra requerida: https://github.com/Danmoreng/padra/tree/999c86742f255dc40a3265f2077a15d6a32061c1
- Referencia arXiv citada en las etiquetas del modelo: arxiv:2605.31268 (sin detalles disponibles en la informacion proporcionada)
- Modelo Mellum2 Thinking anterior: https://huggingface.co/JetBrains/Mellum2-12B-A2.5B-Thinking
