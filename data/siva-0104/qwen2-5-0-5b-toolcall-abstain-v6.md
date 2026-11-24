# siva-0104/qwen2.5-0.5b-toolcall-abstain-v6

## Resumen

qwen2.5-0.5b-toolcall-abstain-v6 es un ajuste fino (fine-tune) del modelo Qwen/Qwen2.5-0.5B-Instruct, desarrollado por el usuario siva-0104, orientado especificamente a la llamada de herramientas (tool calling / function calling) con capacidad de abstenerse cuando ninguna herramienta del catalogo es aplicable. El modelo parte de la arquitectura transformer decoder-only de Qwen2.5 y conserva su ventana de contexto, pero ha sido entrenado con QLoRA para transformar el comportamiento del modelo base, que practicamente nunca invocaba herramientas, en un emisor fiable de llamadas estructuradas.

El modelo resuelve un problema concreto en el despliegue de agentes locales de bajo coste: dado un conjunto de esquemas de herramientas en JSON, debe decidir entre emitir una o varias llamadas `<tool_call>`, solicitar informacion adicional o declarar que ninguna herramienta aplica. Su tamano reducido (494 millones de parametros) permite ejecutarlo en hardware muy modesto, lo que lo hace relevante para pipelines de agentes en local, prototipado rapido y entornos con restricciones de recursos.

La relevancia actual del modelo reside en su enfoque en la abstencion correcta (evitar llamadas erroneas a herramientas que no corresponden) combinada con un rendimiento notable en benchmarks de function calling para su escala, aunque con la advertencia de que las metricas son declaradas por el autor con su propio evaluador y no proceden del checker oficial de BFCL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajustado con QLoRA y adaptador fusionado |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | 4-bit NF4 durante entrenamiento; version 4-bit MLX incluida en el repo; fp16 en la raiz |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (modelo fusionado fp16), MLX 4-bit, adaptador LoRA |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2, con 494 millones de parametros, derivado de Qwen/Qwen2.5-0.5B-Instruct. El ajuste se realizo con QLoRA en 4-bit NF4, con LoRA de rango 16 y alpha 32, tasa de aprendizaje 2e-4 con decaimiento coseno, batch efectivo de 16 y una sola epoca, calculando la perdida unicamente sobre la respuesta. El adaptador resultante se fusiono en los pesos finales. El entrenamiento se ejecuto en una GPU T4 gratuita de Kaggle (44 minutos para la variante de 0.5B).

Los datos de entrenamiento son todos publicos y con control de fuga (leak-gated): xLAM function-calling 60k (CC-BY-4.0), Glaive function-calling v2 (Apache-2.0), Hermes function-calling v1 (Apache-2.0) y ToolACE (Apache-2.0), mas negativos sinteticos de herramientas no coincidentes. Aproximadamente el 49% de las filas de llamada incluyen entre 1 y 4 herramientas distractoras similares recuperadas de la biblioteca de entrenamiento. El conjunto final tiene 8.559 filas (8.366 tras el limite de 1.024 tokens), de las cuales el 24% son filas sin llamada. No se incluyeron datos de When2Call ni de BFCL, y los splits son disjuntos por nombre de herramienta. El autor declara que `leak_check.py` pasa correctamente (0 coincidencias de consultas BFCL y ningun nombre de herramienta de test en entrenamiento), con la salvedad de que 13 de 9.314 definiciones de funciones de BFCL son identicas (nombre y descripcion) a una herramienta de entrenamiento, una superposicion solo informativa con consultas distintas.

## Capacidades

- Generacion de llamadas a herramientas en formato estructurado `<tool_call>{"name": ..., "arguments": {...}}</tool_call>`, incluyendo multiples llamadas en una misma respuesta.
- Abstencion explicita: el modelo puede declarar que ninguna herramienta del catalogo es aplicable o solicitar informacion faltante.
- Function calling con esquemas JSON y validacion contra el esquema antes de la ejecucion (segun el pipeline de agente del autor).
- Soporte de agentes multi-paso en el contexto de un pipeline de agente sobre MCP (Model Context Protocol) con recuperacion de herramientas por similitud de embeddings (top 5).
- Capacidad de manejar herramientas distractoras parecidas, entrenado especificamente para ello con negativos sinteticos.
- Generacion de texto conversacional heredada del modelo base Qwen2.5-0.5B-Instruct.
- Capacidades multilingues limitadas al ingles segun la model card.
- No se declaran capacidades de vision, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Agentes locales de bajo coste: el modelo puede gestionar la seleccion y emision de llamadas a herramientas en un agente que corre en local, con recuperacion de herramientas por similitud de embeddings y validacion de esquemas, gracias a su tamano de 494 millones de parametros que permite ejecucion en CPU o GPU modesta.
- Automatizacion de tareas con MCP: integrado en un pipeline de agente sobre Model Context Protocol, el modelo decide que herramienta invocar entre un catalogo de 10 herramientas; el autor reporta un 80,6% de exito de llamada en 49 consultas para la variante de 0.5B.
- Enrutamiento de peticiones a APIs: dado un conjunto de endpoints descritos como esquemas JSON, el modelo emite la llamada correcta o se abstiene si la peticion no encaja, reduciendo llamadas erroneas en produccion.
- Prototipado rapido de asistentes con herramientas: util para validar disenos de agentes y esquemas de herramientas antes de escalar a modelos mayores, con un coste de inferencia minimo.
- Filtrado y triaje de consultas: la capacidad de abstencion (99,7% en herramientas no coincidentes) permite usarlo como clasificador de si una consulta requiere invocar una herramienta o puede resolverse con texto.
- Educacion e investigacion: modelo pequeno y abierto (Apache-2.0) para estudiar comportamiento de function calling y abstencion en modelos de menos de 1.000 millones de parametros.
- Despliegue en Apple Silicon: la version 4-bit MLX incluida en el repositorio permite ejecutarlo con `mlx-lm` en equipos con chip de Apple.

## Benchmarks y rendimiento

Resultados declarados por el autor con su propio evaluador (no es el checker oficial de BFCL; una sola semilla; BFCL solo como reporte). Se muestran las tres variantes de tamano del proyecto para contexto.

| Conjunto | 0.5B (este modelo) | 1.5B | 3B |
|---|---|---|---|
| BFCL simple, exact match | 79,3 | 83,7 | 89,7 |
| BFCL irrelevance, abstenido correctamente | 75,8 | 84,2 | 87,1 |
| BFCL live simple / live irrelevance | 44,6 / 71,7 | 56,6 / 77,0 | 66,3 / 77,0 |
| xLAM / Hermes / ToolACE exact (tests sin fuga) | 68,0 / 48,0 / 44,3 | 71,7 / 53,3 / 49,0 | 77,3 / 59,3 / 53,7 |
| Herramientas no coincidentes, abstenido | 99,7 | 99,7 | 100 |
| Agente sobre MCP, 49 consultas, 10 herramientas: exito de llamada | 80,6% | 93,5% | 93,5% |

Comparacion con el modelo base (0.5B base -> v6):

| Conjunto | Base | v6 |
|---|---|---|
| BFCL simple, exact | 4,0 | 79,3 |
| BFCL live simple, exact | 6,7 | 44,6 |
| BFCL irrelevance, abstenido | 96,0 | 75,8 |
| BFCL live irrelevance, abstenido | 98,0 | 71,7 |
| xLAM, exact | 5,3 | 68,0 |
| Hermes, exact | 6,0 | 48,0 |
| ToolACE, exact | 1,3 | 44,3 |
| Glaive, decision accuracy | 34,7 | 95,0 |
| Herramientas no coincidentes, abstenido | 96,7 | 99,7 |

Lectura del autor: el modelo base de 0.5B casi nunca invoca una herramienta (4% de las peticiones de BFCL simple), por lo que su alta "abstencion" en BFCL irrelevance es en gran medida un artefacto de no llamar nunca; el ajuste fino corrige ese comportamiento a costa de reducir la abstencion en ese conjunto concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en fp16 para los 494 millones de parametros, mas overhead de activaciones y cache KV; menos de 0,5 GB en cuantizacion de 4 bits.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM; el autor entreno en una T4 de Kaggle, por lo que una T4, RTX 3060, RTX 4060 o superiores son mas que suficientes.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna, e incluso en CPU para inferencia con llama.cpp u Ollama.
- Opciones de despliegue: transformers, text-generation-inference (el tag indica compatibilidad con endpoints), MLX para Apple Silicon, y previsiblemente llama.cpp/Ollama si se generan pesos GGUF (no confirmado en la informacion proporcionada).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo se espera latencia muy baja en GPU consumer, pero no hay cifras declaradas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-0.5b-toolcall-abstain-v6 | 494 M | no disponible | Tool calling con abstencion, fine-tune QLoRA | Apache-2.0 | Hugging Face |
| Qwen/Qwen2.5-0.5B-Instruct | 494 M | no disponible | Instrucciones generales; casi no invoca herramientas (4% en BFCL simple) | Apache-2.0 | Hugging Face |
| Variantes 1.5B y 3B del mismo proyecto | 1,5 B / 3 B | no disponible | Mismo enfoque, mayor rendimiento (89,7 en BFCL simple para 3B) | Apache-2.0 | Hugging Face / GitHub del autor |

No se dispone en la informacion proporcionada de datos de otros modelos comparables de la misma categoria (por ejemplo, otros fine-tunes de function calling de menos de 1.000 millones de parametros) con metricas verificables.

## Limitaciones y advertencias

- Las metricas son declaradas por el autor con su propio evaluador, no con el checker oficial de BFCL, y con una sola semilla; deben tratarse como orientativas.
- El modelo base nunca invocaba herramientas; el ajuste fino mejora drasticamente la llamada pero reduce la abstencion en BFCL irrelevance respecto al base (96,0 -> 75,8 y 98,0 -> 71,7), lo que indica un posible aumento de llamadas innecesarias en algunos casos.
- Riesgo de alucinacion en los argumentos de las llamadas: aunque el pipeline del autor valida contra el esquema, el modelo puede generar nombres de herramienta o parametros incorrectos, especialmente en BFCL live (44,6% de exact match).
- Idiomas: solo se declara ingles; el rendimiento en castellano u otros idiomas no esta caracterizado.
- Longitud de contexto: no se especifica en la informacion proporcionada; el entrenamiento limito las filas a 1.024 tokens, lo que sugiere que el modelo puede degradarse con contextos muy largos.
- Superposicion informativa con BFCL: 13 de 9.314 definiciones de funciones de BFCL son identicas a herramientas de entrenamiento (nombre y descripcion), aunque con consultas distintas; no invalida el split pero conviene tenerlo en cuenta.
- Licencia Apache-2.0: permite uso comercial, pero al derivar de Qwen2.5 conviene revisar las condiciones del modelo base y de los datasets de entrenamiento (xLAM es CC-BY-4.0 y requiere atribucion).
- El modelo esta pensado para un pipeline con recuperacion de herramientas (top 5 por embeddings) y validacion de esquemas; usarlo sin ese envoltorio puede degradar el rendimiento en produccion.
- No se declaran capacidades de vision, audio ni razonamiento extendido; no es adecuado para tareas multimodales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/siva-0104/qwen2.5-0.5b-toolcall-abstain-v6
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio de codigo, evaluacion y pipeline de agente: https://github.com/siva-0104/toolcall-slm
- Dataset xLAM function calling: https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k
- Dataset Hermes function calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Dataset ToolACE: https://huggingface.co/datasets/Team-ACE/ToolACE
- Berkeley Function Calling Leaderboard: https://gorilla.cs.berkeley.edu/leaderboard.html
