# SkyIsNotGreen/hive-conductor-1.7b-v1

## Resumen

Hive Conductor 1.7B es un especialista de dos roles (controller y planner) desarrollado por SkyIsNotGreen como parte de la familia Hive 1.7B, un conjunto de cinco modelos pequeños con roles diferenciados que se sirven y enrutan mediante el plano de control local Hive. El modelo parte de LiquidAI/LFM3-1.7B-Base y se ha ajustado con LoRA sobre tareas sintéticas de control y planificación validadas por checker, sin datos de usuario.

El modelo resuelve un problema concreto: sustituir a un generalista de 35B en tareas de asignación de recursos, capacidad, dependencias, scheduling y contratos JSON de planificación, con una latencia muy inferior. Según la model card, alcanza 59/60 en el conjunto de evaluación de controller (frente a 50/60 de Scion-35B) y 69/77 en planner, con una mediana de 0,25 s en GGUF Q4_K_M para controller y 0,11 s para planner.

Con 1.728.801.600 parámetros y un repo de 9,3 GB, es relevante ahora por su enfoque de especialización por roles en lugar de escala bruta: un modelo de 1,7B que supera a un 35B en su familia de restricciones acotada, desplegable en hardware de consumo y con pesos en safetensors y GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de LiquidAI/LFM3-1.7B-Base); detalles internos no disponibles |
| Parametros totales | 1.728.801.600 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el ejemplo de llama.cpp usa -c 8192) |
| Tipos de cuantizacion | GGUF Q4_K_M publicado; otras cuantizaciones no disponibles |
| Idiomas soportados | No disponibles |
| Licencia | lfm1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | safetensors (transformers) y GGUF |

## Arquitectura y entrenamiento

El modelo se construye sobre LiquidAI/LFM3-1.7B-Base, un transformer de 1,7B parámetros. El ajuste se realiza mediante TRL SFT con LoRA de r=16, alpha=32 y dropout 0,05, aplicado sobre los módulos q/k/v/o, in_proj/out_proj y w1/w2/w3. El checkpoint de partida es controller-sft-base-v3, un LoRA previo solo de controller, sobre el que se añade el rol de planner sin regresión en controller.

Los datos de entrenamiento son 3.402 filas sintéticas validadas por checker: 1.701 de replay de controller y 1.701 de planner, sin datos de usuario. El formato emplea la plantilla de chat de LFM3 con `enable_thinking=false` y pérdida solo en el turno del asistente. El schedule es de 2 épocas, 426 pasos, batch 4 con acumulación de gradiente 4, learning rate 1e-4 y longitud máxima 512. El entrenamiento se ejecutó en una tarjeta AMD de 20 GB con ROCm 7.2 en bf16, con un pico de VRAM de 13,99 GiB. No se menciona RLHF ni DPO.

## Capacidades

- Generación de contratos JSON para asignación de tareas a workers con restricciones de capacidad y tiempo.
- Planificación de scheduling: ordenación, dependencias y validación de planes.
- Razonamiento de restricciones numéricas acotadas (por ejemplo, empaquetado en bins con cálculo compacto y respuesta final numérica).
- Salida estructurada mediante `response_format` para tareas con forma JSON.
- Modo controller: asignación, capacidad, dependencia, scheduling y ordenación.
- Modo planner: generación de planes, contratos JSON y respuestas numéricas.
- No entrena router, judge, face ni chat general; no es un generalista.
- Capacidades multilingües: no disponibles.
- Tool calling y function calling: no documentados en la información proporcionada.
- Capacidades de agente multi-paso: limitadas a su rol dentro del plano Hive, no como agente autónomo general.

## Casos de uso

- Orquestación de workers en un plano de control local: el modelo recibe tareas con duraciones y workers con ventanas de disponibilidad y devuelve el JSON de asignación, aprovechando su 59/60 en controller y su mediana de 0,25 s en GGUF Q4_K_M.
- Planificación de pipelines con dependencias: genera planes ordenados y contratos JSON para encadenar pasos, con 12/12 en la familia de schedules del conjunto de planner.
- Validación de planes antes de ejecución: el rol controller incluye validación (13/13 en la familia de validation), útil como paso de comprobación en un scheduler.
- Sustitución de un generalista de 35B en un endpoint de scheduling: reduce coste y latencia (0,25 s frente a 3,96 s de Scion-35B en controller) manteniendo precisión superior en el conjunto evaluado.
- Empaquetado y cálculo de mínimos: el rol planner resuelve problemas de bins y devuelve el número final, con 19/23 en la familia numérica en HF.
- Despliegue en hardware de consumo: al ser un 1,7B en Q4_K_M, puede servirse con llama.cpp en equipos modestos para tareas de control en local.
- Enrutado dentro de la familia Hive: como seat de controller/planner, se integra con el resto de especialistas (Reader, Auditor, Dispatcher, Tool Manager) bajo el servidor Hive.

## Benchmarks y rendimiento

Controller, 60 tareas (9 originales + 51 generadas), decodificación greedy:

| Modelo | Overall | Originales 9 | Schedules | Mediana |
|---|---:|---:|---:|---:|
| Scion-35B | 50/60 (0,833) | 9/9 | 19/25 | 3,96 s |
| controller-only v3 | 54/60 (0,900) | 9/9 | 19/25 | 0,99 s |
| Hive Conductor 1.7B — HF | 59/60 (0,983) | 9/9 | 24/25 | 0,94 s |
| Hive Conductor 1.7B — GGUF Q4_K_M | 59/60 (0,983) | 9/9 | 24/25 | 0,25 s |

Planner, 77 tareas (17 originales + 60 generadas):

| Modelo | Overall | Originales 17 | Schedules | Mediana |
|---|---:|---:|---:|---:|
| controller-only v3 | 30/77 (0,390) | 8/17 | — | 0,98 s |
| Scion-35B (solo 17 originales) | — | 15/17 | — | — |
| Hive Conductor 1.7B — HF | 69/77 (0,896) | 16/17 | 12/12 | 0,32 s |
| Hive Conductor 1.7B — GGUF Q4_K_M | 66/77 (0,857) | 15/17 | 10/12 | 0,11 s |

Desglose por familia en controller: assignments 9/9, validation 13/13, exact JSON 4/4, choices 6/6, ordered 3/3, schedules 24/25. En planner (HF): plans/JSON 29/33, number 19/23, ordered 9/9, schedules 12/12.

## Requisitos de hardware

- VRAM estimada: el entrenamiento usó 13,99 GiB de pico en bf16; para inferencia en bf16 se puede estimar en torno a 3,5 GB solo de pesos, más overhead de contexto y runtime.
- En Q4_K_M, los pesos ocupan aproximadamente 1 GB, por lo que cabe en GPUs de consumo con 4-8 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 8 GB para bf16; para GGUF Q4_K_M basta con 4 GB. No se especifican modelos concretos (A100, H100, RTX 4090) en la información proporcionada.
- Cabe en GPU de consumo: sí, en Q4_K_M en tarjetas de 4 GB o más; en bf16 en tarjetas de 8 GB o más.
- Opciones de despliegue: transformers (modelo mergeado en subcarpeta `model`), llama.cpp con `llama-server` y GGUF Q4_K_M; el ejemplo usa `-ngl 999 -c 8192`. Otras opciones (vLLM, Ollama, TGI) no están documentadas.
- Latencia: mediana de 0,25 s en controller y 0,11 s en planner con GGUF Q4_K_M; 0,94 s y 0,32 s respectivamente en HF. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Controller | Planner | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Hive Conductor 1.7B | 1,73B | No disponible | 59/60 | 69/77 | lfm1.0 | Hugging Face (safetensors + GGUF) |
| Scion-35B | 35B (aprox.) | No disponible | 50/60 | 15/17 (solo originales) | No disponible | No disponible |
| controller-only v3 | 1,73B (base) | No disponible | 54/60 | 30/77 | No disponible | Checkpoint previo del mismo autor |
| LiquidAI/LFM3-1.7B-Base | 1,73B | No disponible | No evaluado | No evaluado | lfm1.0 | Hugging Face |

## Limitaciones y advertencias

- No es un reemplazo de un generalista de 27B o superior; su alcance está acotado a los roles controller y planner.
- No está entrenado para router, judge, face ni chat general.
- No hay evidencia de generalización a instancias de scheduling arbitrarias; los resultados provienen de conjuntos held-out del propio harness.
- Los datos de entrenamiento son sintéticos y validados por checker; pueden no cubrir distribuciones reales de tareas.
- Riesgo de alucinación en JSON: aunque el conjunto evalúa exact JSON (4/4 en controller), no se documenta comportamiento fuera de distribución.
- Idiomas soportados no disponibles; no se garantiza un rendimiento multilingüe.
- Licencia lfm1.0 (license: other): es necesario revisar los términos del enlace de licencia de LiquidAI antes de uso comercial.
- El release no incluye adaptador LoRA independiente; solo se soporta el checkpoint mergeado.
- No se documentan capacidades de tool calling ni de agente autónomo general.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, lo que implica poca validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/SkyIsNotGreen/hive-conductor-1.7b-v1
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Licencia: https://huggingface.co/LiquidAI/LFM3-1.7B-Base/blob/main/LICENSE
- Repositorio Hive: https://github.com/sky-is-green/hive
- Harness de evaluación: https://github.com/sky-is-green/hive/tree/main/experiments/roles
- Hive Reader 1.7B: https://huggingface.co/SkyIsNotGreen/hive-reader-1.7b-v1
- Hive Auditor 1.7B: https://huggingface.co/SkyIsNotGreen/hive-auditor-1.7b-v1
- Hive Dispatcher 1.7B: https://huggingface.co/SkyIsNotGreen/hive-dispatcher-1.7b-v1
- Hive Tool Manager 1.7B: https://huggingface.co/SkyIsNotGreen/hive-tool-manager-1.7b-v1
