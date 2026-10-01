# goldenfox/decider-0.8b-onnx

## Resumen

goldenfox/decider-0.8b-onnx es un export a formato ONNX del modelo de decision Mapika/decider-0.8b, preparado por el usuario goldenfox para inferencia directamente en el navegador mediante ONNX Runtime Web con el execution provider WebGPU (onnxruntime-web 1.30). No se trata de un modelo entrenado desde cero, sino de una conversion del checkpoint original (revision `a0a01d6f8135298f400a8c856b355793012ae971`) a un grafo ONNX cuantizado en int4, con el objetivo de ejecutar un modelo de aproximadamente 0,8 mil millones de parametros sin servidor y sin conexion de red.

El modelo resuelve una tarea muy concreta: dada una estructura de prompt con `Context:`, `Question:`, `Options:` y `Answer: (`, el modelo lee los logits de la ultima posicion sobre los tokens de las etiquetas y elige una opcion, dividiendo por la temperatura definida en `decider_config.json`. Es, por tanto, un clasificador/selector de decisiones de formato cerrado, etiquetado por el autor con las tags `system-one` y `decision`, no un modelo de chat generico.

Su relevancia actual es doble. Por un lado, demuestra un flujo de trabajo de conversion reproducible con `onnxruntime-genai` 0.17.1 (`-p int4 -e webgpu`, `prune_lm_head=true`, `exclude_mtp=true`, `algo_config=k_quant` y `matmul_mixed_precision=last_matmul:int8,linear_attn:int8`). Por otro, expone los estados recurrentes (Gated DeltaNet) y de KV como entradas y salidas `past.*` / `present.*`, lo que permite calcular una vez un prefijo de prompt compartido y reutilizarlo en llamadas sucesivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con componentes de estado recurrente tipo Gated DeltaNet (los estados recurrentes y de KV se exponen como entradas/salidas `past.*` / `present.*`); familia indicada por el autor: `qwen3_5` |
| Parametros totales | Aproximadamente 0,8 mil millones (0.8B, segun el nombre del modelo y del modelo base); cifra exacta no disponible |
| Parametros activos | no disponible (no se documenta que sea un modelo MoE) |
| Longitud de contexto | 8192 tokens (`max_position_embeddings` fijado a 8192 antes del export, como tamano de cache rotatoria) |
| Tipos de cuantizacion | int4 en pesos con `algo_config=k_quant`; precision mixta int8 (`matmul_mixed_precision=last_matmul:int8,linear_attn:int8`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX con datos externos divididos en ficheros de hasta 1.800.000.000 bytes; ejecutable con ONNX Runtime (WebGPU EP y, segun medicion del autor, CPU EP) |
| Libreria declarada | onnxruntime |
| Tamano del repositorio | 0,8 GB |
| Modelo base | Mapika/decider-0.8b |

## Arquitectura y entrenamiento

Este repositorio no contiene entrenamiento alguno: es un export del checkpoint `Mapika/decider-0.8b`. La conversion se realizo con el model builder de `onnxruntime-genai` 0.17.1 usando `-p int4 -e webgpu` y las opciones adicionales `prune_lm_head=true`, `exclude_mtp=true`, `algo_config=k_quant` y `matmul_mixed_precision=last_matmul:int8,linear_attn:int8`. El grafo resultante es text decoder only, devuelve logits unicamente para la ultima posicion de entrada y mantiene los estados recurrentes (Gated DeltaNet) y de KV como E/S explicitas, lo que habilita la reutilizacion de prefijos de prompt. La poda de la cabeza LM y la exclusion del modulo MTP reducen el tamano del grafo exportado.

No hay informacion publicada en la model card sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si el modelo base recibio RLHF, DPO u otro tipo de ajuste. Tampoco se documentan innovaciones de decodificacion mas alla del propio esquema de reutilizacion de estados. La unica validacion de calidad reportada es funcional, no de entrenamiento: se compararon 8 de 9 elecciones principales identicas al modelo fuente en fp32 (transformers) sobre 9 prompts de juego, con una distancia de variacion total media de 0,076 y maxima de 0,140, medida el 2026-09-30 con onnxruntime 1.30 y CPU EP.

## Capacidades

- Seleccion de una opcion entre varias dado un contexto: el modelo lee los logits de la ultima posicion sobre los tokens de las etiquetas de `Options:` y devuelve la opcion elegida.
- Formato de prompt cerrado y especifico: `Context:` / `Question:` / `Options:` / `Answer: (` con lectura en la ultima posicion.
- Inferencia en navegador con WebGPU a traves de ONNX Runtime Web (onnxruntime-web 1.30).
- Reutilizacion de prefijo: al exponer estados `past.*` / `present.*`, un prefijo de prompt compartido puede calcularse una sola vez y reutilizarse en decisiones posteriores.
- Salida restringida a la ultima posicion de entrada (el grafo no devuelve logits de posiciones intermedias).
- Generacion de texto libre, tool calling, function calling, agentes, vision, audio o modo thinking: no disponible (no documentado en la informacion proporcionada).
- Capacidades multilingues: no disponible.
- No se documenta soporte de razonamiento multi-paso ni de llamada a herramientas.

## Casos de uso

- Decisiones de IA de juego en el cliente: con la tag `system-one` y la medicion sobre prompts de juego, encaja en motores que necesitan elegir una accion entre varias opciones sin enviar el estado de la partida a un servidor; el prefijo del estado del mundo se calcula una vez y se reutiliza en cada turno.
- Ficcion interactiva y narrativa ramificada: dado el contexto de la escena y un conjunto de opciones de dialogo o accion, el modelo selecciona la mas coherente, con el coste de inferencia dentro del propio navegador del lector.
- Tutores y cuestionarios adaptativos: seleccion de la siguiente pregunta o del siguiente ejercicio entre un conjunto candidato en funcion del contexto del alumno, ejecutandose en local y sin enviar datos personales a un servidor.
- Enrutado o clasificacion en aplicaciones de escritorio y web: elegir entre etiquetas discretas (intents, categorias, respuestas predefinidas) presentadas como `Options:` en lugar de generar texto libre, lo que reduce el riesgo de salidas fuera de dominio.
- Guardrails y moderacion ligera embebida: seleccionar entre categorias de politica predefinidas para una entrada de usuario, con la ventaja de que el modelo cabe en 0,8 GB y no requiere backend.
- Sistemas offline y de borde: aplicaciones que deben funcionar sin conectividad, en un portatil con WebGPU o incluso en CPU EP, usando el repositorio ONNX como artefacto unico de despliegue.
- Sistemas con estado de prompt grande y repetido: al reutilizar los estados `past.*`, escenarios donde el mismo contexto (reglas, ficha de personaje, historial fijo) precede a muchas decisiones distintas, evitando recomputar el prefijo.
- Prototipado y evaluacion de agentes: uso como componente de decision barato dentro de un bucle mayor, siempre que el resto del sistema formatee la pregunta y las opciones exactamente como espera el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni similares). La unica metrica reportada por el autor es un acuerdo funcional con el modelo fuente:

| Metrica | Resultado | Condiciones |
|---|---|---|
| Coincidencia de la primera eleccion con el modelo fuente en fp32 | 8 de 9 prompts | 9 prompts de juego; transformers en fp32 como referencia |
| Distancia de variacion total media | 0,076 | Sobre las distribuciones de eleccion |
| Distancia de variacion total maxima | 0,140 | Sobre las distribuciones de eleccion |
| Entorno de medicion | onnxruntime 1.30, CPU EP | Medido el 2026-09-30 |

No se proporcionan datos de latencia, throughput ni consumo de memoria.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; como referencia de orden de magnitud, los pesos en int4 de un modelo de ~0,8B ocupan aproximadamente 0,4-0,5 GB, y el repositorio completo ocupa 0,8 GB.
- GPU recomendadas: cualquier GPU con soporte de WebGPU para el execution provider WebGPU; no se listan modelos concretos (A100, H100, RTX 4090) en la informacion disponible.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU integrada o dedicada reciente que exponga WebGPU en el navegador, dado el tamano del modelo; no se documentan pruebas por modelo concreto.
- Ejecucion en CPU: el autor reporta mediciones con onnxruntime 1.30 CPU EP, por lo que existe una ruta de ejecucion sin GPU.
- Opciones de despliegue: ONNX Runtime Web 1.30 con WebGPU; `onnxruntime-genai` 0.17.1 para la conversion. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| goldenfox/decider-0.8b-onnx | ~0,8B | 8192 tokens | ONNX int4, WebGPU | Apache 2.0 | Export para navegador; 8/9 coincidencias con el modelo fuente en 9 prompts |
| Mapika/decider-0.8b | ~0,8B | no disponible | safetensors (transformers), fp32 | Apache 2.0 | Modelo fuente; se ejecuta en servidor o escritorio, no en navegador |
| Otros modelos de decision de ~0,8B | no disponible | no disponible | no disponible | no disponible | No se dispone de alternativas documentadas en la informacion proporcionada |

La comparativa con modelos de la misma categoria (clasificadores o selectores de ~1B) no esta disponible en la informacion proporcionada; no se deben asumir cifras de rendimiento no publicadas.

## Limitaciones y advertencias

- No hay benchmarks publicados: la unica validacion es un acuerdo del 8/9 sobre 9 prompts de juego, una muestra muy reducida que no permite extrapolar calidad general.
- El modelo no genera texto libre: devuelve logits solo para la ultima posicion de entrada, por lo que cualquier uso conversacional exige envolverlo en logica externa de seleccion.
- Dependencia estricta del formato de prompt (`Context:` / `Question:` / `Options:` / `Answer: (`) y de la temperatura de `decider_config.json`; desviarse del formato invalida la lectura de logits sobre las etiquetas.
- La cuantizacion int4 con precision mixta int8 introduce divergencia respecto al modelo en fp32: la distancia de variacion total maxima medida es de 0,140, lo que implica diferencias apreciables en la distribucion de eleccion en algunos casos.
- Riesgo de alucinacion y de eleccion de opciones incorrectas: no disponible como medicion; al ser un selector cerrado, el modo de fallo tipico es elegir una opcion valida pero equivocada, no inventar contenido.
- Sesgos conocidos: no disponible.
- Idiomas soportados: no disponible; no se puede asumir cobertura multilingue.
- La model card no documenta el entrenamiento del modelo base (tokens, dataset, RLHF/DPO), lo que dificulta evaluar procedencia y sesgos.
- El repositorio registra 0 descargas y 0 likes, sin validacion independiente de la comunidad.
- Licencia Apache 2.0 en origen, sin clausulas adicionales conocidas para uso comercial; conviene verificar los terminos del modelo base Mapika/decider-0.8b antes de un despliegue en produccion.
- No se documenta soporte de tool calling, agentes ni multi-step reasoning, por lo que no deberia asumirse en disenos de produccion.
- La disponibilidad de WebGPU depende del navegador y del sistema operativo del usuario final, lo que puede excluir a parte de la base de usuarios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/goldenfox/decider-0.8b-onnx
- Modelo base: https://huggingface.co/Mapika/decider-0.8b
- Revision del modelo base usada en el export: `a0a01d6f8135298f400a8c856b355793012ae971`
- Fichero de formato de prompt referenciado: `decider/prompt.py` del modelo base
- Configuracion de decision: `decider_config.json`
- Herramienta de conversion: onnxruntime-genai 0.17.1
- Runtime de inferencia: ONNX Runtime Web 1.30 (execution provider WebGPU)
- Licencia: Apache License 2.0 (fichero `LICENSE` del repositorio)
- Papers, blogs, demos o repos adicionales: no disponible en la informacion proporcionada
