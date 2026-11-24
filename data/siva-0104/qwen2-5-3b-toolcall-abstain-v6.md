# siva-0104/qwen2.5-3b-toolcall-abstain-v6

## Resumen

qwen2.5-3b-toolcall-abstain-v6 es un ajuste fino del modelo Qwen2.5-3B-Instruct de Alibaba, desarrollado por el usuario siva-0104, orientado especificamente a la invocacion de herramientas (tool calling) con capacidad de abstencion. El modelo recibe una peticion del usuario y un conjunto de esquemas de herramientas en JSON, y decide entre emitir una o varias llamadas estructuradas, solicitar informacion faltante o declarar que ninguna herramienta disponible es aplicable. Esta ultima capacidad, la abstencion ante herramientas irrelevantes, es el eje diferencial del ajuste frente a otros modelos de la misma familia.

El modelo parte de una arquitectura transformer densa de 3.085.938.688 parametros (aproximadamente 3,09 mil millones) y se ha entrenado mediante QLoRA en 4 bits NF4 con rango 16, fusionando posteriormente el adaptador en los pesos finales. El repositorio incluye el modelo fusionado en fp16, una version cuantizada en 4 bits para MLX (Apple Silicon) y el adaptador LoRA original. Su proposito es servir como motor de agentes locales pequenos, donde el coste computacional y la latencia importan, integrado en pipelines que recuperan herramientas de una biblioteca mayor y validan las llamadas contra el esquema antes de ejecutarlas.

La relevancia actual del modelo radica en su enfoque en la fiabilidad del tool calling en entornos con muchas herramientas candidatas y distractores: segun los datos declarados por el autor, alcanza un 100% de abstencion correcta ante herramientas no coincidentes y mejora sustancialmente al modelo base en conjuntos como xLAM (de 38,7 a 77,3 de exact match), Hermes (de 41,3 a 59,3) y ToolACE (de 27,3 a 53,7). Los benchmarks son, no obstante, autoinformados con un scorer propio y no verificados por el leaderboard oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-3B-Instruct) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento trunca a 1.024 tokens) |
| Tipos de cuantizacion | fp16 (pesos fusionados), 4 bits NF4 (QLoRA en entrenamiento), 4 bits MLX (version para Apple Silicon) |
| Idiomas soportados | ingles (en) |
| Licencia | qwen-research (license: other, con license_name qwen-research) |
| Formato de pesos | safetensors (modelo fusionado fp16 y adaptador LoRA); MLX para la variante de 4 bits |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen2.5, con 3.085.938.688 parametros, obtenido por ajuste fino supervisado del checkpoint Qwen2.5-3B-Instruct. El entrenamiento se realizo con QLoRA en 4 bits NF4, rango LoRA r=16 y alpha=32, tasa de aprendizaje 2e-4 con decaimiento coseno, batch efectivo de 16, una sola epoca y calculo de perdida unicamente sobre la respuesta. El adaptador resultante se fusiono en los pesos, dando lugar al modelo fp16 publicado. El entrenamiento se ejecuto en una GPU T4 gratuita de Kaggle: 44 minutos para la variante de 0,5B, 100 minutos para la de 1,5B y 169 minutos para la de 3B.

Los datos de entrenamiento son exclusivamente publicos y sometidos a un control de fuga (leak-gated): xLAM function-calling 60k (CC-BY-4.0, con gating), Glaive function-calling v2 (Apache-2.0, con respuestas de relleno fusionadas con la llamada posterior), Hermes function-calling v1 (Apache-2.0), ToolACE (Apache-2.0) y negativos sinteticos de herramientas no coincidentes. Aproximadamente el 49% de las filas de llamada incluyen entre 1 y 4 herramientas distractoras de aspecto similar recuperadas de la biblioteca de herramientas de entrenamiento. El conjunto final consta de 8.559 filas (8.366 tras el limite de 1.024 tokens), de las cuales el 24% son filas sin llamada. No se emplearon datos de When2Call ni de BFCL, y los splits son disjuntos por nombre de herramienta; el autor declara que `leak_check.py` pasa con 0 coincidencias de consultas BFCL y ningun nombre de herramienta de test en entrenamiento, aunque reconoce que 13 de las 9.314 definiciones de funciones de BFCL son identicas en nombre y descripcion a una herramienta de entrenamiento (solapamiento informativo sin coincidencia de consultas).

## Capacidades

- Generacion de llamadas a herramientas en formato estructurado `<tool_call>{"name": ..., "arguments": {...}}</tool_call>`, incluyendo multiples llamadas en una misma respuesta.
- Abstencion explicita: el modelo puede declarar que ninguna de las herramientas listadas es aplicable o solicitar la informacion que falta para decidir.
- Tool calling y function calling a partir de esquemas JSON suministrados en el prompt.
- Integracion en pipelines de agentes sobre MCP (Model Context Protocol), con recuperacion de herramientas por similitud de embeddings y validacion de llamadas contra el esquema antes de la ejecucion.
- Razonamiento multi-paso limitado a la seleccion y encadenamiento de llamadas dentro de un turno conversacional.
- Capacidad multilingue restringida al ingles segun la model card.
- No se declaran capacidades de vision, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Agentes locales de escritorio o embebidos: el modelo, con 3,09 mil millones de parametros y una version MLX de 4 bits, puede ejecutarse en un portatil con Apple Silicon y gestionar la seleccion de herramientas de un asistente personal sin conexion a la nube.
- Orquestacion de herramientas en asistentes de soporte tecnico: dado un catalogo de funciones (consultar pedidos, abrir incidencias, escalar a humano), el modelo decide que llamada emitir y, cuando la peticion es ambigua, solicita los datos que faltan en lugar de inventar argumentos.
- Enrutamiento seguro con abstencion: en produccion, ante peticiones que no corresponden a ninguna herramienta disponible, el modelo responde que no procede ejecutar ninguna, lo que evita llamadas erroneas; el autor reporta un 100% de abstencion correcta en el conjunto de herramientas no coincidentes.
- Pipelines de agentes sobre MCP: con recuperacion top-5 de herramientas por similitud de embeddings y validacion de esquema, el modelo encadena llamadas en flujos de automatizacion de tareas; el autor reporta un 93,5% de exito de llamada en 49 consultas con 10 herramientas.
- Prototipado rapido de integraciones de function calling: al estar disponible en transformers y text-generation-inference, sirve para validar disenos de esquemas de herramientas y flujos de agente antes de migrar a modelos mayores.
- Filtrado y clasificacion de intenciones en backends de bajo coste: el modelo puede actuar como primera etapa que decide si una consulta requiere una accion externa, reduciendo el numero de llamadas a modelos mas grandes y caros.
- Evaluacion comparativa de tecnicas de abstencion: el repositorio incluye codigo de evaluacion y un scorer propio, util para investigadores que quieran reproducir o extender las mediciones de fiabilidad en tool calling.

## Benchmarks y rendimiento

Datos declarados por el autor con scorer propio, no verificados por el leaderboard oficial de BFCL (una sola semilla; BFCL en modo report-only).

| Conjunto | 0.5B | 1.5B | 3B (este modelo) |
|---|---|---|---|
| BFCL simple, exact match | 79,3 | 83,7 | 89,7 |
| BFCL irrelevance, abstained | 75,8 | 84,2 | 87,1 |
| BFCL live simple, exact match | 44,6 | 56,6 | 66,3 |
| BFCL live irrelevance, abstained | 71,7 | 77,0 | 77,0 |
| xLAM (held-out), exact match | 68,0 | 71,7 | 77,3 |
| Hermes (held-out), exact match | 48,0 | 53,3 | 59,3 |
| ToolACE (held-out), exact match | 44,3 | 49,0 | 53,7 |
| Herramientas no coincidentes, abstained | 99,7 | 99,7 | 100 |
| Agente sobre MCP, 49 consultas, 10 herramientas: exito de llamada | 80,6% | 93,5% | 93,5% |

Comparacion con el modelo base (Qwen2.5-3B-Instruct):

| Conjunto | Base 3B | v6 (3B) |
|---|---|---|
| BFCL simple, exact | 90,7 | 89,7 |
| BFCL live simple, exact | 59,3 | 66,3 |
| BFCL irrelevance, abstained | 79,3 | 87,1 |
| BFCL live irrelevance, abstained | 65,3 | 77,0 |
| xLAM, exact | 38,7 | 77,3 |
| Hermes, exact | 41,3 | 59,3 |
| ToolACE, exact | 27,3 | 53,7 |
| Glaive, decision accuracy | 90,0 | 99,0 |
| Herramientas no coincidentes, abstained | 98,7 | 100,0 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6,2 GB en fp16 (3,09 mil millones de parametros), alrededor de 2-2,5 GB en cuantizacion de 4 bits.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060 Ti, RTX 4060, RTX 4090); A100 o H100 no son necesarias para este tamano, aunque pueden usarse para servir muchas peticiones concurrentes.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en fp16 y en tarjetas con 4 GB o mas en 4 bits.
- Apple Silicon: el repositorio incluye una version MLX de 4 bits que se ejecuta con `mlx-lm`.
- Opciones de despliegue: transformers, text-generation-inference (el modelo declara endpoints compatibles), llama.cpp u Ollama si se generan pesos GGUF a partir del modelo fusionado, y `mlx-lm` en Mac.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| qwen2.5-3b-toolcall-abstain-v6 | 3,09B | no disponible | qwen-research | Tool calling con abstencion, ajuste QLoRA |
| Qwen/Qwen2.5-3B-Instruct | 3,09B | no disponible | qwen-research | Modelo base generalista con tool calling |
| Variantes Qwen2.5-Instruct 0.5B y 1.5B ajustadas por el mismo autor | 0,5B / 1,5B | no disponible | qwen-research | Misma receta de tool calling con abstencion, menor coste |

Frente al modelo base, el ajuste mejora la abstencion en BFCL irrelevance (79,3 a 87,1) y en BFCL live irrelevance (65,3 a 77,0), asi como los conjuntos held-out de xLAM, Hermes y ToolACE, a costa de una ligera perdida en BFCL simple (90,7 a 89,7). Las variantes de 0,5B y 1,5B del mismo autor ofrecen alternativas de menor coste con rendimiento inferior en todos los conjuntos medidos. No se dispone de comparaciones con otros modelos de tool calling de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- Los benchmarks son autoinformados con un scorer propio, de una sola semilla y no verificados por el leaderboard oficial de BFCL; deben interpretarse como indicativos.
- El modelo solo declara soporte de ingles; su rendimiento en castellano u otros idiomas no esta documentado.
- El entrenamiento trunca a 1.024 tokens, lo que limita el tamano practico de los esquemas de herramientas y el historial conversacional que el modelo maneja con fiabilidad, aunque el contexto arquitectonico del modelo base no se detalla en la informacion disponible.
- Riesgo de alucinacion en la generacion de argumentos: el autor recomienda validar las llamadas contra el esquema antes de ejecutarlas, lo que sugiere que no todas las salidas son necesariamente validas.
- Sesgos conocidos: no documentados en la informacion proporcionada; al derivar de Qwen2.5-Instruct, hereda los sesgos del modelo base y de los datos publicos de tool calling empleados.
- Licencia qwen-research: restricciones de uso comercial segun los terminos de Qwen; es necesario revisar el enlace de licencia del modelo base antes de un despliegue en produccion.
- El autor reconoce un solapamiento informativo: 13 de 9.314 definiciones de funciones de BFCL coinciden en nombre y descripcion con herramientas de entrenamiento, aunque sin coincidencia de consultas.
- El modelo esta pensado para bibliotecas de herramientas recuperadas por similitud (top 5) y no para catalogos masivos presentados completos en el prompt.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/siva-0104/qwen2.5-3b-toolcall-abstain-v6
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Codigo, evaluacion y pipeline de agente: https://github.com/siva-0104/toolcall-slm
