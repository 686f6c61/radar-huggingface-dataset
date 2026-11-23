# Einsia/RoboUniverse-35B-A3B

## Resumen

RoboUniverse-35B-A3B es un modelo de lenguaje de tipo coding agent especializado en manipulación robótica, desarrollado por Einsia. Se trata de un fine-tuning de Qwen/Qwen3.6-35B-A3B, un transformer de arquitectura Mixture-of-Experts (MoE) con 35.951.822.704 parámetros totales y aproximadamente 3.000 millones de parámetros activos repartidos en 256 expertos. El modelo no emite acciones robóticas directamente, sino que opera dentro de Claude Code como cualquier agente de programación: lee la tarea, invoca comandos `roboenv` para describir y observar el entorno, examina imágenes de cámara y escribe controladores en Python que ejecuta para enviar acciones al simulador.

El modelo se entrena sobre trayectorias de agente exitosas recogidas en entornos de simulación del dataset RoboUniverse-10K, con Isaac Sim 5.1 como simulador subyacente y Harbor como harness de tareas. Esta aproximación convierte el problema de control robótico en un problema de generación de código con bucle de realimentación visual, lo que permite reutilizar infraestructura de agentes de código existente en lugar de diseñar un pipeline específico de robótica.

Su relevancia actual radica en que demuestra una vía práctica para el control de robots mediante agentes de código multimodales: contexto de 262.144 tokens para trayectorias largas, soporte de tool calling en formato Qwen3-Coder XML y un template de chat que desactiva el modo thinking por defecto. La licencia Apache 2.0 facilita su uso comercial, aunque los requisitos de hardware para servir el modelo (141 GB de VRAM en una sola GPU o dos GPU de 80 GB con tensor parallelism) son considerables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), tipo `qwen3_5_moe`, 256 expertos |
| Parametros totales | 35.951.822.704 (~35,95 B) |
| Parametros activos | ~3 B (según model card) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (16 shards, ~72 GB en bf16) |
| Pipeline | image-text-to-text |
| Modelo base | Qwen/Qwen3.6-35B-A3B (fine-tune) |
| Dataset de entrenamiento | Einsia/RoboUniverse-10K |
| Harness de agente | Claude Code 2.1.283 |
| Formato de tool calls | Qwen3-Coder XML (`--tool-call-parser qwen3_coder`) |
| Modo thinking | Desactivado por defecto en el chat template incluido |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura MoE de Qwen3.6-35B-A3B: 35,95 mil millones de parámetros totales con aproximadamente 3 mil millones activos por token, distribuidos en 256 expertos. El fine-tuning se realizó en bf16 sobre trayectorias de agente exitosas recogidas en los entornos de simulación de RoboUniverse-10K, un dataset de 10.000 episodios (según el nombre del dataset) construidos sobre Isaac Sim 5.1. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron fases de RLHF o DPO.

La innovación técnica principal no está en la arquitectura del modelo sino en el paradigma de entrenamiento: el modelo aprende a resolver tareas de manipulación robótica escribiendo y ejecutando código Python dentro de Claude Code, usando las herramientas `roboenv describe`, `roboenv observe` y `roboenv step`. El chat template incluido desactiva el modo thinking por defecto (a diferencia del template base de Qwen3.6, que lo activa) y el modelo emite tool calls en formato XML de Qwen3-Coder, que el servidor SGLang traduce a bloques `tool_use` de Anthropic. La configuración de inferencia debe replicar exactamente la de entrenamiento: SGLang 0.5.21, backend de procesado de imagen `pil`, backend MoE `triton`, KV cache en `bfloat16` y sampling con temperatura 1.0, top-p 0.95 y top-k 20.

## Capacidades

- Generación de código Python para controladores robóticos, con bucle de ejecución y realimentación sobre el resultado.
- Razonamiento multimodal image-text-to-text: interpreta imágenes de cámara del simulador para decidir la siguiente acción.
- Tool calling en formato Qwen3-Coder XML, compatible con el parser `qwen3_coder` de SGLang y con el protocolo `/v1/messages` de Anthropic.
- Operación como agente multi-paso dentro de Claude Code: planificación, observación, escritura de código, ejecución y verificación.
- Integración con Harbor como harness de evaluación de tareas de robótica.
- Contexto largo de 262.144 tokens, adecuado para trayectorias de decenas de miles de tokens.
- Modo thinking desactivado por defecto; el modelo escribe sus notas de trabajo en la respuesta normal en lugar de en un canal de razonamiento separado.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Control de robots manipuladores en simulación: el modelo recibe la descripción del entorno mediante `roboenv describe`, observa las cámaras con `roboenv observe`, escribe un controlador Python y lo ejecuta enviando acciones con `roboenv step`. Es adecuado porque fue entrenado exactamente sobre este bucle en Isaac Sim 5.1.
- Evaluación de agentes de código en tareas de robótica: sirve como referencia para medir la capacidad de un coding agent de resolver tareas de manipulación dentro de Harbor, con un verificador separado que puntúa el episodio.
- Generación de scripts de automatización para entornos simulados: el modelo puede producir código Python que interactúa con APIs de simulación, útil para prototipar pipelines de robótica antes de trasladarlos a hardware real.
- Investigación en embodied AI: permite estudiar cómo un agente de código multimodal descompone tareas físicas en pasos de percepción y actuación, con contexto de 262.144 tokens para mantener el historial completo de la trayectoria.
- Integración en flujos de Claude Code existentes: al exponerse mediante un endpoint compatible con Anthropic, puede conectarse a la instalación local de Claude Code con un fichero `~/.claude/settings.json`, lo que facilita experimentar sin reescribir el cliente.
- Desarrollo de controladores asistidos por IA: el modelo puede redactar y depurar código de control que un ingeniero revisa después, aprovechando su entrenamiento en tool calling y ejecución iterativa.
- Docencia y demostraciones de agentes multimodales: el stack completo (SGLang + Harbor + Isaac Sim) permite montar un entorno reproducible para mostrar cómo un LLM opera un robot simulado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 141 GB en una sola GPU (H200, B200 o B300) con pesos en bf16; alternativamente, dos GPU de 80 GB con `--tp-size 2`. El autor verificó el despliegue en una B300.
- GPU recomendadas para el servidor de modelo: H200, B200 o B300 en configuración de una GPU; dos A100/H100 de 80 GB en tensor parallelism.
- GPU para el simulador: Isaac Sim 5.1 exige una GPU NVIDIA con soporte RTX, como L40S o RTX 6000 Ada. A100 y H100 no están soportados para el simulador.
- Cabe en GPU de consumo: no disponible; con ~72 GB de pesos en bf16 no cabe en GPU consumer de 24 GB sin cuantización, y no se documentan versiones cuantizadas.
- Opciones de despliegue: SGLang 0.5.21 (PyTorch 2.13, CUDA 13.0) con endpoint `/v1/messages` compatible con Anthropic. No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI.
- Requisitos del simulador: Linux x86_64, Docker + Compose v2, NVIDIA Container Toolkit, Python 3.12 y entre 18 y 44 GB de RAM por tarea en ejecución.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| RoboUniverse-35B-A3B | ~35,95 B | ~3 B | 262.144 | Apache 2.0 | Coding agent para manipulacion robotica en simulacion |
| Qwen/Qwen3.6-35B-A3B (base) | ~35,95 B | ~3 B | no disponible | no disponible | LLM generalista MoE multimodal |
| Alternativas especificas de robotica | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables adicionales en la información proporcionada.

## Limitaciones y advertencias

- El modelo no emite acciones robóticas directamente: requiere el harness de Claude Code 2.1.283 y las herramientas `roboenv` para funcionar. Usarlo fuera de ese bucle degrada o invalida su comportamiento.
- La versión de Claude Code debe ser exactamente 2.1.283: su system prompt y definiciones de herramientas son las que aparecen en los datos de entrenamiento.
- `MAX_THINKING_TOKENS` debe fijarse a `0`; de lo contrario Claude Code añade `"thinking": {"type": "adaptive"}` y SGLang, sin reasoning parser, devuelve HTTP 400.
- No debe configurarse `--reasoning-parser` ni `enable_thinking: true`: activan el modo thinking y rompen la paridad con el entrenamiento.
- El parser de tool calls `qwen3_coder` es obligatorio; sin él las llamadas a herramientas no se ejecutan.
- El simulador Isaac Sim 5.1 no soporta A100 ni H100, lo que limita las configuraciones de hardware válidas.
- Riesgo de alucinación: no documentado en la información disponible, pero inherente a los modelos de lenguaje en tareas de planificación de código.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no declarados; no se garantiza un rendimiento multilingüe más allá de lo heredado del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero el enlace de licencia apunta al fichero LICENSE de Qwen/Qwen3.6-35B-A3B, por lo que conviene verificar los términos del modelo base.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-23), lo que indica ausencia de validación externa por parte de la comunidad.
- El tamaño del repositorio (71,9 GB) y los requisitos de VRAM (141 GB) hacen inviable su despliegue en hardware de consumo sin cuantización, y no se publican pesos cuantizados.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Einsia/RoboUniverse-35B-A3B)
- [Modelo base Qwen/Qwen3.6-35B-A3B](https://huggingface.co/Qwen/Qwen3.6-35B-A3B)
- [Licencia del modelo base](https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE)
- [Dataset Einsia/RoboUniverse-10K](https://huggingface.co/datasets/Einsia/RoboUniverse-10K)
- [Guía de instalación de SGLang](https://docs.sglang.ai/get_started/install.html)
