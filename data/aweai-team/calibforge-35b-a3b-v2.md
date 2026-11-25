# AweAI-Team/CalibForge-35B-A3B-v2

## Resumen

CalibForge-35B-A3B-v2 es un modelo de lenguaje especializado en tareas de agente de terminal, desarrollado por el equipo AweAI-Team. Se trata de un ajuste fino supervisado (SFT) multi-turno sobre Qwen3.5-35B-A3B, un modelo base con arquitectura MoE (mixture of experts) de 35.107 millones de parametros totales. El modelo esta disenado para resolver tareas de linea de comandos en entornos sandbox, un dominio donde los modelos generalistas suelen fallar por falta de calibracion en la interaccion con herramientas y shells.

La relevancia de esta version (v2) radica en que corrige un problema de contaminacion de datos detectado por la comunidad: tras el feedback de ricdomolm y la publicacion de una lista de exclusion, el modelo fue reentrenado excluyendo 405 tareas marcadas del conjunto de entrenamiento. El dataset CalibForge actualizado contiene 5.026 tareas. Esta transparencia metodologica y la publicacion de resultados con intervalos de confianza (media ± SEM sobre tres ejecuciones) lo convierten en un caso interesante para investigadores que trabajan en agentes de terminal y evaluacion reproducible.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors y un tamano de repositorio de 70,2 GB. Esta orientado principalmente al ingles y su pipeline es text-generation con soporte para razonamiento y tool calling a traves de parsers especificos en SGLang.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe) |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-35B-A3B, una arquitectura de mezcla de expertos (MoE) con 35.107 millones de parametros totales. El tag `qwen3_5_moe` confirma la familia arquitectonica, aunque el numero de parametros activos por token no se detalla en la informacion disponible. El ajuste se realizo mediante SFT multi-turno sobre trayectorias de solver generadas con CalibForge, un pipeline de autoria, validacion y calibracion adversarial de tareas de terminal descrito en el paper arXiv:2608.06352.

La innovacion metodologica principal es la calibracion adversarial del solver: las tareas se validan y calibran contra un solver adversarial antes de incorporarse al entrenamiento, lo que filtra tareas triviales o mal especificadas. La version v2 incorpora la exclusion de 405 tareas contaminadas, resultando en un dataset de 5.026 tareas. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO adicionales.

## Capacidades

- Generacion de texto conversacional y multi-turno en el dominio de agentes de terminal.
- Ejecucion de tareas de linea de comandos en entornos sandbox (shell, ficheros, procesos).
- Razonamiento multi-paso orientado a la resolucion de tareas de terminal.
- Soporte de tool calling / function calling, con parser `qwen3_coder` en SGLang.
- Soporte de modo de razonamiento, con parser `qwen3` en SGLang.
- Capacidades multilingues limitadas al ingles segun la model card.
- No se documentan capacidades de vision ni audio en la informacion disponible.

## Casos de uso

- Automatizacion de tareas de administracion de sistemas: el modelo puede interpretar instrucciones en lenguaje natural y traducirlas a secuencias de comandos shell dentro de un sandbox, adecuado para pipelines de aprovisionamiento y mantenimiento.
- Agentes de CI/CD para diagnostico de fallos: integrado en un runner, el modelo puede inspeccionar logs, ejecutar comandos de diagnostico y proponer correcciones, gracias a su entrenamiento especifico en terminal.
- Evaluacion reproducible de agentes: sirve como referencia en benchmarks tipo Terminal-Bench 2.1, con resultados publicados con intervalos de confianza para comparaciones rigurosas.
- Asistente de desarrollo en entornos containerizados: puede operar sobre repositorios clonados, ejecutar tests y aplicar parches, con soporte de tool calling para orquestacion.
- Investigacion en calibracion adversarial: el modelo y su dataset asociado permiten estudiar como la curacion de tareas afecta al rendimiento en agentes de terminal.
- Generacion de scripts de automatizacion: dado un objetivo, el modelo produce scripts encadenados con manejo de errores, util para equipos de operaciones que necesitan prototipado rapido.
- Formacion y evaluacion de pipelines SFT: al estar construido sobre Qwen3.5-35B-A3B, sirve como caso de estudio de ajuste fino multi-turno con exclusion de datos contaminados.

## Benchmarks y rendimiento

| Modelo | Terminal-Bench 2.1 Acc. (%, media ± SEM) |
|---|---:|
| CalibForge-35B-A3B-v2 | 46,44 ± 1,63 |

Resultados reportados sobre tres ejecuciones, con timeout de una hora por tarea y 16 CPUs / 48 GiB de RAM por sandbox, usando CalibForge-Eval. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo MoE de 35B en precision bf16 requiere del orden de 70 GB de VRAM para los pesos, mas overhead de KV cache y activaciones.
- GPU recomendadas: la configuracion de ejemplo en SGLang usa `--tp 8`, lo que sugiere despliegue multi-GPU (por ejemplo, 8x A100 80GB o 8x H100).
- Cabe en consumer GPU: no de forma directa en bf16; requeriria cuantizacion agresiva (no documentada) y posiblemente offloading, con rendimiento degradado.
- Opciones de despliegue: SGLang es el runtime documentado por el autor, con parsers `qwen3` para razonamiento y `qwen3_coder` para tool calling. No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Terminal-Bench 2.1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CalibForge-35B-A3B-v2 | 35,1B | no disponible | 46,44 ± 1,63 | Apache 2.0 | Hugging Face |
| Qwen3.5-35B-A3B (base) | 35,1B | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas de agente de terminal | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa queda limitada al modelo base, cuyo rendimiento en Terminal-Bench 2.1 no se ha publicado en esta ficha.

## Limitaciones y advertencias

- El modelo esta entrenado y evaluado unicamente en ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion en la generacion de comandos: puede producir ordenes plausibles pero incorrectas o peligrosas si se ejecutan sin validacion.
- La evaluacion se realizo en sandbox con recursos acotados (16 CPUs, 48 GiB RAM, timeout de una hora); el comportamiento fuera de esas condiciones puede diferir.
- La version v2 corrige contaminacion de datos respecto a la v1, pero no se detalla el impacto de la exclusion en tareas especificas.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-35B-A3B puede tener condiciones adicionales que conviene verificar.
- El despliegue documentado requiere SGLang con soporte para Qwen3.5 MoE y configuracion multi-GPU; no hay garantias de funcionamiento en otros runtimes.
- El numero de parametros activos y la longitud de contexto no estan publicados, lo que dificulta estimar costes de inferencia con precision.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AweAI-Team/CalibForge-35B-A3B-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Dataset CalibForge: https://huggingface.co/datasets/AweAI-Team/CalibForge
- Lista de exclusion (decontaminacion): https://huggingface.co/datasets/ricdomolm/CalibForge-decontaminated
- Discusion sobre feedback: https://huggingface.co/datasets/AweAI-Team/CalibForge/discussions/3
- Paper: https://arxiv.org/abs/2608.06352
- Repositorio: https://github.com/AweAI-Team/CalibForge
- Evaluacion Terminal-Bench: https://github.com/AweAI-Team/AweAgent/tree/main/recipes/terminal_bench_v2
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
