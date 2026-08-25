# Lego-X/qwen3_5_35b_a3b_base_oc_200k_rl

## Resumen

Lego-RL-Qwen3.5-35B-A3B·OpenCode·200K es un modelo de agente de codificacion entrenado por Lego-X mediante aprendizaje por refuerzo con recompensa basada en verificacion (RLVR) dentro del harness OpenCode sin modificar. Parte del checkpoint base Qwen/Qwen3.5-35B-A3B, un modelo de lenguaje de arquitectura MoE con 35.950 millones de parametros totales y 3.000 millones activos, y se ha optimizado especificamente para resolver issues reales de repositorios en un entorno de agente con acceso a shell y herramientas de edicion. La relevancia actual radica en que demuestra que el entrenamiento RL nativo del harness (sin reescritura del control de flujo) mejora significativamente el rendimiento en tareas de SWE-bench, pasando de 57,2 a 66,6 en SWE-bench Verified, un incremento de 9,4 puntos respecto al modelo base.

El modelo se publica bajo licencia Apache 2.0, con pesos en formato safetensors y un tamano de repositorio de 71,9 GB. Se distribuye como checkpoint de entrenamiento paso 50 de la ejecucion de produccion de Lego-RL, entrenado con 2.699 issues reales de repositorios (dataset Lego-X/Lego-RL-2699) cuyos propios test suites generan la recompensa binaria. La arquitectura de entrenamiento emplea el algoritmo GSPO (sequence-level surrogate) con ventaja grupal sobre 8 rollouts por tarea, con un contexto de 200.000 tokens y 200 turnos. El modelo esta pensado exclusivamente como politica de agente, no como modelo de chat, y se sirve en produccion mediante vLLM con el parser de tool-call qwen3_coder.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) sparse, 256 expertos, 8 activos |
| Parametros totales | 35.951.822.704 (35,95 B) |
| Parametros activos | 3 B (segun informacion del modelo base) |
| Longitud de contexto | 200.000 tokens (entrenamiento); 262.144 tokens como maximo en vLLM |
| Tipos de cuantizacion | No disponible (el repositorio solo ofrece pesos en bfloat16) |
| Idiomas soportados | Ingles (etiqueta `language: en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.5-35B-A3B, un MoE sparse con 256 expertos y 8 expertos activos por token, lo que permite activar solo 3.000 millones de parametros por inferencia. La innovacion clave del entrenamiento es el paradigma "harness-native": el scaffold (entorno de ejecucion) se trata como parte del entorno, no como parte de la politica. Asi, el modelo se entrena dentro del harness OpenCode sin modificaciones, y las trayectorias que el harness realmente produce (ids de token, mascaras, log-probs y rutas de expertos MoE) se capturan en el camino de servicio y se usan directamente como paso de gradiente.

El entrenamiento se realizo con el algoritmo GSPO (surrogate de nivel de secuencia) con ventaja relativa de grupo sobre 8 rollouts por tarea, un lote de 512 ensayos por paso (64 prompts × 8 respuestas) y 3 epocas (126 pasos). El dataset de entrenamiento, Lego-RL-2699, contiene 2.699 issues reales de repositorios, convertidos desde GAIR/OpenSWE, y es disjunto de SWE-bench Verified tanto a nivel de repositorio como de instancia. La recompensa es binaria (0/1) generada por los test suites del propio issue, ejecutados en un sandbox limpio; no se usa reward model, similitud de parche ni LLM judge. El contexto de entrenamiento es de 200.000 tokens y 200 turnos, con una temperatura de rollout de 1,0 y KL loss de 1e-3. El entrenamiento se ejecuto en 3 nodos con 8 GPUs cada uno (2 para entrenamiento y 1 para rollout), usando VeOmni FSDP y Ulysses SP=8.

## Capacidades

- Resolucion de issues reales de repositorios: el modelo opera dentro de un sandbox con acceso a repositorio, shell y herramientas de edicion de archivos, y debe generar un patch que pase los tests del issue.
- Razonamiento multi-paso en contexto largo: soporta hasta 200.000 tokens de contexto, lo que permite mantener el estado completo de un repositorio grande durante una sesion de 200 turnos.
- Tool calling integrado: el modelo se sirve con vLLM y el parser `qwen3_coder` para generar llamadas a herramientas de forma nativa, imprescindible para su funcionamiento como agente.
- Optimizacion para el harness OpenCode: entrenado especificamente para maximizar el rendimiento dentro de este harness; cada ejecucion (OpenHands SDK, Claude Code, OpenCode) produce un checkpoint distinto.
- Razonamiento de codigo y depuracion: su entrenamiento con recompensa de test suites le ensena a iterar sobre errores de ejecucion y ajustar las soluciones hasta que pasan los tests.
- Capacidades multilingues heredadas: aunque la etiqueta de idioma es ingles, el modelo base Qwen3.5-35B-A3B es multilingue, pero el comportamiento multilingue no fue objetivo del RL.
- Capacidades de vision heredadas: el modelo base es un "reasoning vision-language model" (segun LM Studio), pero este checkpoint RL no ha sido evaluado ni entrenado para tareas de vision; se recomienda no usarlo para ello.

## Casos de uso

- **Automatizacion de resolucion de issues en repositorios open source**: el modelo puede recibir un issue real de un repositorio Python y producir un patch que pase los test suites. Se integra en un pipeline de CI/CD donde se ejecuta en un sandbox aislado con el repositorio clonado, se le permite editar archivos y ejecutar los tests, y se evalua el resultado de forma binaria.
- **Asistente de desarrollo en entornos de codigo**: como politica de agente dentro de OpenCode, puede interactuar con el shell y el editor para explorar el codigo, buscar funciones, modificar archivos y ejecutar pruebas, ayudando a un desarrollador a resolver tareas complejas de mantenimiento.
- **Benchmark de agentes de codigo**: el modelo sirve como referencia para medir el rendimiento de otros agentes en SWE-bench Verified, dado que su entrenamiento esta disenado para maximizar el resultado en este tipo de tareas.
- **Entrenamiento de RL para agentes**: el metodo Lego-RL que produce este modelo puede replicarse para otros harnesses y modelos base, y este checkpoint sirve como punto de partida para investigacion en RL de agentes.
- **Generacion de patches en proyectos Python**: aunque el modelo se entrena con issues variados, su dominio principal es Python-heavy. Puede usarse en proyectos de automatizacion de correccion de bugs en codigo Python.
- **Evaluacion de politicas de agente**: dado que el modelo se entrena para un harness especifico, puede usarse para comparar la eficacia de diferentes harnesses de ejecucion (OpenCode vs OpenHands SDK vs Claude Code) manteniendo el mismo checkpoint de partida.

## Benchmarks y rendimiento

Se han publicado resultados de SWE-bench Verified para el modelo y sus comparativas en la model card. El protocolo compartido es temperatura 0,7, 200 turnos y 200K de contexto.

| Modelo | OpenHands SDK (%) | Claude Code (%) | OpenCode (%) |
|---|---|---|---|
| Qwen3.5-35B-A3B (punto de partida) | 64,0 | 62,4 | 57,2 |
| Qwen3.6-35B-A3B (base de siguiente generacion) | 67,4 | 63,4 | 60,6 |
| KAT-Coder-V2.5-Dev (post-entrenado sobre Qwen3.6) | 67,0 | 66,8 | 64,8 |
| **Lego-RL-Qwen3.5-35B-A3B (este modelo)** | **70,4** | **68,2** | **66,6** |

El modelo de este repositorio corresponde a la columna OpenCode (66,6). El incremento de rendimiento por RL respecto al punto de partida es de +9,4 puntos en OpenCode, +6,4 en OpenHands SDK y +5,8 en Claude Code. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo en bfloat16 ocupa aproximadamente 71,9 GB de pesos. Con 4 GPUs de 24 GB (por ejemplo A100 80GB o H100 80GB) se puede servir con `tensor-parallel-size 4` y `enable-expert-parallel` como recomienda la model card.
- **GPU recomendadas**: A100 80GB, H100 80GB o GPUs de datacenter con al menos 24 GB de VRAM para paralelismo de tensor. No se recomienda el uso en GPUs de consumo (RTX 4090, etc.) sin cuantizacion adicional, que no se proporciona.
- **Opciones de despliegue**: vLLM (recomendado, con flags especificos como `--enable-expert-parallel`, `--enable-chunked-prefill` y `--tool-call-parser qwen3_coder`), tambien compatible con TGI y SGLang segun la documentacion del modelo base.
- **Latencia y throughput**: no se han publicado mediciones especificas para este checkpoint. En configuracion de 4 GPUs con chunked prefill y prefix caching, se espera un throughput de varios tokens por segundo por request, aunque los datos concretos no estan disponibles.
- **Requisitos de memoria para entrenamiento**: el entrenamiento se realizo con 3 nodos × 8 GPUs (2 nodos de entrenamiento + 1 de rollout), con FSDP y Ulysses SP=8.

## Comparativa con modelos similares

La siguiente tabla compara este modelo con el base Qwen3.5-35B-A3B y con el modelo post-entrenado KAT-Coder-V2.5-Dev, ambos en la misma categoria de agentes de codificacion.

| Modelo | Parametros totales | Contexto | SWE-bench Verified (OpenCode) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-35B-A3B (base) | 35,95 B | 200K | 57,2 | Apache 2.0 | Hugging Face |
| Qwen3.6-35B-A3B (base) | 35,95 B (estimado) | no disponible | 60,6 | Apache 2.0 (presumible) | Hugging Face |
| KAT-Coder-V2.5-Dev | no disponible | no disponible | 64,8 | no disponible | no disponible |
| **Lego-RL-Qwen3.5-35B-A3B (OpenCode)** | 35,95 B | 200K | **66,6** | Apache 2.0 | Hugging Face |

Se observa que el modelo Lego-RL supera al base en +9,4 puntos y tambien a la generacion siguiente (Qwen3.6) en +6,0 puntos en el harness OpenCode. La comparativa con otros modelos fuera de la familia Qwen no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- **Es una politica de agente, no un modelo de chat**: el modelo se optimizo para interactuar con un harness que le da un repositorio, un shell y herramientas de edicion. Usarlo como chat o generador de texto libre produce resultados suboptimos.
- **Dependencia del harness**: el rendimiento es muy sensible al harness de ejecucion. Este checkpoint especifico se entreno en OpenCode; los checkpoints para OpenHands SDK y Claude Code se publican por separado. Servirlo con un harness distinto al entrenado degrada el rendimiento.
- **Dominio restringido**: el entrenamiento se concentra en issues de repositorios Python de la distribucion SWE-bench/OpenSWE. El rendimiento en otros lenguajes o tipos de tareas de codigo no ha sido evaluado.
- **Contexto y turnos**: el modelo fue entrenado con un presupuesto de 200K de contexto y 200 turnos. Usar presupuestos mas cortos puede truncar la segunda mitad de sus trayectorias y perder la mayoria de la ganancia del RL.
- **Sesgos y seguridad**: el comportamiento de seguridad, multilingue y de conocimiento general es heredado del modelo base Qwen3.5-35B-A3B y no fue objeto del entrenamiento RL. No se han evaluado sesgos especificos de este checkpoint.
- **Riesgo de alucinacion**: como cualquier modelo de lenguaje, puede generar patches que parecen plausibles pero no pasan los tests. El entrenamiento con recompensa binaria de tests reduce la probabilidad de alucinacion, pero no la elimina.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero el modelo es un derivado de Qwen3.5-35B-A3B, por lo que se debe respetar la licencia del modelo base.
- **No disponible para vision**: aunque el tag `image-text-to-text` aparece en los metadatos, este checkpoint no ha sido evaluado para tareas de vision y su uso para tal fin no esta soportado.

## Enlaces

- [Repositorio Hugging Face del modelo](https://huggingface.co/Lego-X/qwen3_5_35b_a3b_base_oc_200k_rl)
- [Paper de Lego-RL (arXiv)](https://arxiv.org/abs/2608.17393)
- [Codigo de Lego-RL en GitHub](https://github.com/LegoX/Lego-RL)
- [Documentacion del proyecto](https://lego-rl.pages.dev)
- [Coleccion de modelos Lego-RL en Hugging Face](https://huggingface.co/collections/Lego-X/lego-rl)
- [Dataset de entrenamiento Lego-RL-2699](https://huggingface.co/datasets/Lego-X/Lego-RL-2699)
- [Modelo base Qwen/Qwen3.5-35B-A3B](https://huggingface.co/Qwen/Qwen3.5-35B-A3B)
- [Pagina oficial de LegoX](https://legox.net)
