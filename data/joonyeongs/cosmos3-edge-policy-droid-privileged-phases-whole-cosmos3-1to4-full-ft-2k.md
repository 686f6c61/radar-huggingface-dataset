# joonyeongs/cosmos3-edge-policy-droid-privileged-phases-whole-cosmos3-1to4-full-ft-2k

## Resumen

Cosmos3-Edge-Policy-DROID es un modelo de politica (policy model) para control robotico desarrollado originalmente por NVIDIA dentro de la familia Cosmos3. Esta variante concreta, publicada por el usuario joonyeongs, es un ajuste fino completo del checkpoint base `nvidia/Cosmos3-Edge-Policy-DROID` sobre el conjunto de datos DROID siguiendo la receta de RoboLab. El modelo resuelve el problema de generar trayectorias de acciones motoras (chunks de posiciones articulares) a partir de observaciones visuales y de instrucciones en lenguaje natural, es decir, actua como el componente de control de un agente robotico de proposito general.

Tecnicamente se trata de un modelo de 3.859.003.312 parametros (aproximadamente 3,86 mil millones) construido sobre la arquitectura Cosmos3 con un componente de generacion (generator) y una torre de comprension (understanding tower). El ajuste fino congela la torre de comprension y entrena todos los pesos del generador. El repositorio ocupa 9,2 GB y mantiene exactamente el layout del checkpoint base, difiriendo unicamente en los shards de pesos del transformer.

Su relevancia es doble: por un lado demuestra el flujo de trabajo de ajuste fino de politicas Cosmos3 sobre DROID con datos de fases privilegiadas y replay intercalado; por otro, publica los detalles completos de la receta (learning rate, batch, hardware, pasos) y una verificacion de exportacion con error absoluto medio de 0,0284 rad sobre chunks de 32 pasos. No obstante, el exito en bucle cerrado (closed-loop success) no ha sido evaluado todavia, por lo que debe tratarse como un checkpoint de investigacion mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cosmos3 (generator + understanding tower; transformer de difusion para politicas) |
| Parametros totales | 3.859.003.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW License 1.1 |
| Formato de pesos | safetensors |
| Modelo base | nvidia/Cosmos3-Edge-Policy-DROID (revision 0110e64ca982589f1a3d856cbdd7d465dccb79bc) |
| Tamano del repositorio | 9,2 GB |
| Libreria | cosmos |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Cosmos3, que combina un generador (generator) encargado de producir los chunks de acciones con una torre de comprension (understanding tower) que procesa las entradas multimodales. En este ajuste fino se entrena el generador de forma completa (todos los pesos del lado generador) mientras que la torre de comprension permanece congelada, utilizandose con K/V de texto cacheadas. El modelo produce chunks de 32 pasos de posiciones articulares (joint positions) condicionados por la observacion y la instruccion.

El entrenamiento se realizo sobre el conjunto DROID (`droid_plus_lerobot_640x360_20260412`) con la receta RoboLab, usando una vista construida sobre trayectorias completas del dataset `joonyeongs/cosmos3-edge-harness-privileged-phases-150`. La estrategia de muestreo combina dos pools: todos los inicios en pasos de codigo con o sin informacion privilegiada (89.416 muestras) y todos los inicios en pasos de politica Cosmos3 (21.959 muestras), agrupados por la fuente del frame inicial sin padding e intercalados en proporcion 1 Cosmos3 : 4 codigo. Se realizaron 2.000 actualizaciones con learning rate 2e-5, 100 pasos de warmup lineal y decaimiento lineal hasta cero, batch global de 64 (2 GPUs x 32 x acumulacion 1) y checkpoints cada 100 pasos. El entrenamiento consumio 13,7 horas en 2x A100-80GB. No se menciona uso de RLHF o DPO en la informacion disponible.

## Capacidades

- Generacion de politicas de control robotico: produce chunks de 32 pasos de posiciones articulares a partir de observaciones visuales e instrucciones de tarea.
- Comprension multimodal: integra la torre de comprension de Cosmos3 para procesar entradas visuales y textuales.
- Ejecucion de tareas de manipulacion descritas en lenguaje natural (por ejemplo, "Put the canned food in the grey bin").
- Soporte de informacion privilegiada (privileged phases) durante el entrenamiento, con mezcla de pasos con y sin dicha informacion.
- Despliegue como servidor de politica mediante `action_policy_server_robolab` con formato de prompt JSON y guidance interval configurable.
- Integracion con el harness de evaluacion RoboLab a traves de `RobolabPolicyService`.
- No se dispone de informacion sobre soporte de tool calling, function calling, agentes multi-paso, capacidades multilingues ni modos de razonamiento explicito (thinking mode) en la informacion proporcionada.

## Casos de uso

- Manipulacion robotica en laboratorio: el modelo sirve como politica para tareas de pick-and-place sobre objetos cotidianos (comida enlatada, cartones, objetos de colores) en entornos DROID, generando chunks de 32 acciones articulares por inferencia.
- Investigacion en aprendizaje por imitacion: permite reproducir y extender la receta RoboLab de ajuste fino sobre DROID, con hiperparametros y configuracion de datos documentados, para estudiar el efecto de las fases privilegiadas y el replay intercalado.
- Evaluacion de politicas en simulacion y bucle cerrado: se integra con el servidor RoboLab (`action_policy_server_robolab`) para desplegar el checkpoint en pipelines de evaluacion estandarizados.
- Generacion de trayectorias condicionadas por lenguaje: util para prototipar interfaces de instruccion en lenguaje natural a acciones motoras en robots de laboratorio.
- Benchmarking de politicas Cosmos3: al mantener el layout exacto del checkpoint base, sirve como punto de comparacion controlado (mismo esqueleto, solo cambian los shards del transformer) frente a otras variantes ajustadas.
- Base para nuevos ajustes finos: al ser un full fine-tune sobre DROID, puede reutilizarse como punto de partida para especializar la politica en tareas o dominios adicionales.
- Verificacion de exportacion y depuracion de pipelines: el script de comprobacion de exportacion (comparacion de chunks predichos frente a acciones demostradas con MAE) es util para validar la integracion del checkpoint antes de evaluaciones costosas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La unica metrica publicada es una comprobacion de exportacion que no constituye una evaluacion de politica: error absoluto medio (MAE, en radianes) entre chunks predichos de 32 pasos y acciones demostradas sobre frames del dataset `cosmos3-edge-harness-privileged-phases-150`.

| Episodio | Frame | Tarea | MAE (rad) |
|---|---|---|---|
| 0 | 0 | Put the canned food in the grey bin | 0,0130 |
| 0 | 154 | Put the canned food in the grey bin | 0,0068 |
| 25 | 0 | Put the lizard away in the bin | 0,0204 |
| 25 | 139 | Put the lizard away in the bin | 0,0316 |
| 50 | 0 | Put all the red things in the grey bin | 0,0626 |
| 50 | 326 | Put all the red things in the grey bin | 0,0415 |
| 75 | 0 | Put the cartons that can be recycled in the vertical crate | 0,0267 |
| 75 | 442 | Put the cartons that can be recycled in the vertical crate | 0,0249 |
| | | **Media** | **0,0284** |

El exito en bucle cerrado (closed-loop success) de RoboLab no ha sido evaluado todavia.

## Requisitos de hardware

- El entrenamiento se realizo en 2x A100-80GB durante 13,7 horas; se desconoce el pico de VRAM exacto, pero el checkpoint de 3,86 mil millones de parametros en safetensors ocupa 9,2 GB en disco.
- Inferencia en precision nativa (probablemente bf16/fp16): se estima un requisito de VRAM en el rango de 10-12 GB solo para pesos, mas memoria para activaciones y cache K/V; no hay dato oficial disponible.
- GPU recomendadas: A100-80GB o H100 para despliegue fiable del servidor RoboLab; tarjetas consumer de gama alta (RTX 4090 con 24 GB) podrian alojar los pesos, aunque no se ha verificado ni documentado.
- Opciones de despliegue: servidor oficial `cosmos_framework.scripts.action_policy_server_robolab` con `--format-prompt-as-json True` y `--guidance-interval 960 1001`; el gripper debe servirse con el flip por defecto (no pasar `--no-flip-gripper`).
- No se dispone de datos de latencia ni throughput publicados.
- No se documenta soporte para vLLM, llama.cpp, Ollama o TGI; el modelo usa la libreria `cosmos`, propia del framework.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| joonyeongs/cosmos3-edge-policy-droid-privileged-phases-whole-cosmos3-1to4-full-ft-2k | 3,86 B | no disponible | Politica robotica (DROID) | OpenMDW 1.1 | Hugging Face |
| nvidia/Cosmos3-Edge-Policy-DROID (base) | no disponible | no disponible | Politica robotica (DROID) | OpenMDW 1.1 | Hugging Face |
| cosmos3-edge-policy-droid-privileged-phases-cosmos3-replay-full-ft-lr2e-5-bs64-1k | no disponible | no disponible | Politica robotica (DROID) | no disponible | Hugging Face (mismo autor) |

No se dispone de informacion sobre otros modelos de politica comparables (por ejemplo, otras variantes de Cosmos3 o politicas de otros fabricantes) en la informacion proporcionada.

## Limitaciones y advertencias

- El exito en bucle cerrado no ha sido evaluado: la unica metrica publicada es un MAE de exportacion (0,0284 rad de media) que no mide la tasa de exito de las tareas.
- El MAE varia notablemente entre episodios (desde 0,0068 hasta 0,0626 rad), lo que sugiere sensibilidad a la tarea y al frame inicial.
- Es un checkpoint de investigacion de 2.000 pasos con un autor individual (joonyeongs); no cuenta con validacion por parte de NVIDIA ni de un proceso de revision independiente.
- La licencia OpenMDW 1.1 es una licencia "other"; deben revisarse sus terminos para uso comercial, ya que no es una licencia permisiva estandar como Apache 2.0 o MIT.
- No se dispone de informacion sobre sesgos, idiomas soportados ni riesgos de alucinacion; al ser un modelo de politica, el riesgo principal es la generacion de acciones incorrectas o inseguras en el robot.
- El despliegue requiere el framework `cosmos` y el servidor RoboLab; no hay soporte documentado para runtimes de inferencia genericos (vLLM, llama.cpp, Ollama, TGI).
- El modelo esta especializado en el dominio DROID y en tareas de manipulacion concretas; su generalizacion fuera de ese dominio no esta documentada.
- Debe servirse con el flip de gripper por defecto; omitirlo puede alterar el comportamiento del efector final.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joonyeongs/cosmos3-edge-policy-droid-privileged-phases-whole-cosmos3-1to4-full-ft-2k
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge-Policy-DROID
- Dataset de referencia: https://huggingface.co/datasets/joonyeongs/cosmos3-edge-harness-privileged-phases-150
- Codigo de entrenamiento (fork): https://github.com/joonyeongs/cosmos-framework/tree/robolab-droid-train-edge-privileged-phases
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- No se han encontrado papers, blogs ni demos adicionales en la informacion proporcionada.
