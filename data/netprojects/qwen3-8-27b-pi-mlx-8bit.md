# netprojects/Qwen3.8-27B-pi-MLX-8bit

## Resumen

Qwen3.8-27B-pi-MLX-8bit es una cuantización en 8 bits para Apple Silicon (formato MLX) del modelo harness-hub/Qwen3.8-27B-pi-adapted, que a su vez es un fine-tuning mediante LoRA del modelo base Qwen/Qwen3.8-27B orientado a tareas de agente de código y terminal. El adaptador original fue entrenado con aprendizaje por refuerzo (AsyncGRPO en TRL) para funcionar como el modelo subyacente del agente de código pi, mejorando de forma notable en benchmarks de ingeniería de software y uso de terminal frente al modelo base. Esta versión concreta, publicada por netprojects, fusiona el adaptador en el modelo base, conserva el codificador de visión y la capa MTP de Qwen, y convierte los pesos a MLX cuantizando las capas lineales a 8 bits (afín, grupo 64).

El modelo tiene 27.781.427.952 parámetros (aproximadamente 27,8 mil millones) y un tamaño de repositorio de 30,0 GB. Está pensado para ejecutarse en Macs con Apple Silicon mediante mlx-lm y mlx-vlm, con soporte de entrada image-text-to-text (visión) y de tool calling en el formato XML de Qwen. Su relevancia actual radica en que permite desplegar localmente en hardware de Apple un agente de código especializado con un rendimiento cercano al bf16 (99,1 % de coincidencia en el siguiente token y KL de 0,0004 frente a bf16), algo especialmente útil para desarrolladores que quieren un agente de terminal sin depender de la nube.

La licencia es Apache 2.0 y el pipeline declarado es image-text-to-text. No se dispone de información sobre los idiomas soportados en los metadatos proporcionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.8-27B) con capa MTP (multi-token prediction) y codificador de visión; conversión MLX |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (afín, grupo 64) en capas lineales; existen builds del mismo autor en 6, 4, 3, 2.5 bits y bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); incluye model-mtp.safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer de aproximadamente 27,8 mil millones de parámetros, al que se le aplicó un adaptador LoRA entrenado por harness-hub con aprendizaje por refuerzo (AsyncGRPO en TRL) para tareas de ingeniería de software y terminal como modelo del agente pi. En esta build de netprojects, el adaptador se fusiona en el modelo base (revisión e786f84 del adaptador sobre la revisión 3756181 de Qwen) y se convierte a MLX con mlx-vlm, incluyendo el codificador de visión y la capa MTP original de Qwen. Las capas lineales se cuantizan a 8 bits en modo afín con grupo 64, lo que da un tamaño de 30,0 GB y una fidelidad muy alta respecto a bf16.

La innovación técnica destacable es la conservación de la capa MTP de Qwen3.8-27B, que puede usarse como modelo borrador integrado para decodificación especulativa pasando el mismo repositorio como --draft-model con --draft-kind mtp. Según las mediciones del autor, MTP acelera la decodificación aproximadamente 2,2 veces en esta build de 8 bits (de 18 a 41 tok/s), y el drafter DSpine v0.2.1 (4 bits, bloque 5) alcanza unos 54 tok/s (×3,05). El adaptador no modifica la capa MTP, por lo que se trata de la cabeza original de Qwen. El tokenizador y la plantilla de chat son los de harness-hub, sin cambios, con el mismo vocabulario y formato de tool calls que Qwen3.8-27B.

## Capacidades

- Generación de texto conversacional y razonamiento general, heredados de Qwen3.8-27B.
- Generación y reparación de código, con especial énfasis en tareas de ingeniería de software (el adaptador fue entrenado para ello).
- Ejecución de tareas de terminal y uso de herramientas de línea de comandos como agente.
- Tool calling / function calling en el formato XML de Qwen (`<tool_call><function=...><parameter=...>`), que mlx-lm devuelve como `tool_calls` de OpenAI.
- Capacidades de agente y razonamiento multi-paso, con reducción de llamadas a herramientas por tarea (55-64 % menos según el autor).
- Entrada image-text-to-text: soporte de imágenes mediante mlx-vlm (por ejemplo, interpretar capturas de pantalla de terminal).
- Modo thinking desactivable; el adaptador fue entrenado y evaluado con thinking off, por lo que se recomienda mantenerlo desactivado.
- Decodificación especulativa mediante la capa MTP integrada o el drafter DSpine.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Agente de código en terminal: el modelo puede conectarse al agente pi mediante el servidor compatible con OpenAI de mlx-lm y resolver tareas como localizar y corregir tests que fallan, aprovechando su entrenamiento específico en Terminal-Bench y SWE-bench Pro.
- Reparación de bugs en producción: integrado en un flujo de CI/CD local, puede recibir el fallo de un test, inspeccionar el código y proponer un parche, con menos llamadas a herramientas por tarea que el modelo base.
- Asistente de desarrollo en Mac: ejecución local en Apple Silicon sin enviar código a la nube, útil para equipos con requisitos de confidencialidad.
- Análisis de capturas de pantalla de terminal: gracias al codificador de visión y mlx-vlm, puede interpretar una imagen de una terminal y explicar el error mostrado.
- Automatización de tareas de shell: uso como agente que encadena comandos, interpreta su salida y decide el siguiente paso, con soporte de tool calling.
- Generación de código asistida en Python: mediante mlx-lm se puede cargar el modelo y generar funciones a partir de instrucciones en lenguaje natural, con thinking desactivado para minimizar latencia.
- Evaluación e investigación de agentes: sirve como base local para experimentar con decodificación especulativa (MTP, DSpine) y medir latencia y throughput en hardware Apple.

## Benchmarks y rendimiento

Resultados publicados por harness-hub para el adaptador original, bajo el agente pi y con thinking off, frente al modelo base:

| Benchmark | Modelo base | Adaptador pi |
|---|---|---|
| Terminal-Bench 2.1 | 39,5 % | 55,8 % |
| SWE-bench Pro (hard 51) | 29,4 % | 62,7 % |

Además, el autor indica una reducción del 55-64 % en llamadas a herramientas por tarea.

Fidelidad de la cuantización frente a bf16 y velocidad de decodificación (mediciones del autor, greedy, thinking off, 5 prompts × 256 tokens, con otros servicios en ejecución, por lo que son indicativas):

| Build | Tamano | Mismo siguiente token que bf16 | KL vs bf16 | Plain | MTP | DSpine v0.2.1 |
|---|---|---|---|---|---|---|
| 8-bit | 30,0 GB | 99,1 % | 0,0004 | 18 tok/s | 41 tok/s (×2,24) | 54 tok/s (×3,05) |
| 6-bit | 23,1 GB | 99,0 % | 0,0015 | 23 tok/s | 22 tok/s (×0,96) | 52 tok/s (×2,32) |
| 4-bit | 16,3 GB | 95,6 % | 0,0201 | 33 tok/s | 61 tok/s (×1,84) | 70 tok/s (×2,25) |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K u otros benchmarks generales para esta build concreta.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 30,0 GB de pesos para la build de 8 bits; se necesita memoria adicional para el contexto y el codificador de visión, por lo que se recomienda un Mac con al menos 48-64 GB de memoria unificada.
- Hardware objetivo: Apple Silicon (mlx, apple-silicon). No está pensado para GPU NVIDIA.
- Cabe en GPU consumer: no aplica en el sentido habitual; en Macs, las builds de 3 y 2,5 bits caben en máquinas de 24 GB según el autor, mientras que la de 8 bits requiere bastante más memoria.
- Opciones de despliegue: mlx-lm (servidor compatible con OpenAI, `mlx_lm.server`) para texto y mlx-vlm para visión; también mlx-lm en Python con `load`/`generate`.
- Aceleración: decodificación especulativa con la capa MTP integrada (`--draft-model` con el mismo repositorio y `--draft-kind mtp`) o con el drafter DSpine.
- Throughput estimado: 18 tok/s en decodificación plana, 41 tok/s con MTP y 54 tok/s con DSpine para la build de 8 bits (mediciones indicativas del autor).
- Latencia: no disponible de forma absoluta; depende del Mac y de la carga del sistema.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| netprojects/Qwen3.8-27B-pi-MLX-8bit | ~27,8 B | no disponible | 8 bits MLX | Apache 2.0 | Hugging Face (MLX, Apple Silicon) |
| netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit | ~27,8 B | no disponible | 6 bits MLX | Apache 2.0 | Hugging Face (recomendado por el autor) |
| netprojects/Qwen3.8-27B-pi-adapted-MLX-4bit | ~27,8 B | no disponible | 4 bits MLX | Apache 2.0 | Hugging Face |
| harness-hub/Qwen3.8-27B-pi-adapted | ~27,8 B | no disponible | adaptador LoRA (638 MB) | Apache 2.0 | Hugging Face (requiere modelo base) |

La comparación con modelos de otras familias o de otros formatos (por ejemplo, versiones GGUF para llama.cpp u otras GPU) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El adaptador fue entrenado y evaluado con thinking off; activar el modo thinking puede degradar el comportamiento esperado.
- Está pensado para el agente pi y la API Chat Completions; usar la API Responses puede no ser compatible con el entrenamiento del adaptador.
- La cuantización a 8 bits introduce una pequeña desviación frente a bf16 (KL 0,0004), y la decodificación especulativa puede divergir ligeramente en respuestas largas cuando hay empates cercanos en la comprobación por lotes.
- Las mediciones de velocidad son indicativas y se tomaron con otros servicios en ejecución en el Mac; el throughput real variará.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de sesgos en la información disponible.
- Idiomas soportados no disponibles; conviene validar el comportamiento en castellano antes de usarlo en producción.
- Licencia Apache 2.0 permite uso comercial, pero deben respetarse las condiciones de los modelos base y del adaptador original.
- Requiere hardware Apple Silicon y memoria unificada abundante para la build de 8 bits; no es desplegable en GPU NVIDIA con este formato.
- El modelo está especializado en tareas de código y terminal; su rendimiento en dominios generales puede no ser óptimo.

## Enlaces

- Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-pi-MLX-8bit
- Modelo base del adaptador: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Build de 6 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit
- Build de 8 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-8bit
- Build de 4 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-4bit
- Build de 3 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-3bit
- Build de 2,5 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-2.5bit
- Build bf16: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-bf16
- Adaptador LoRA MLX: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-adapter
- Agente pi: https://github.com/earendil-works/pi
- Drafter DSpine: https://huggingface.co/netprojects/Qwen3.8-27B-DSpine-b16-MLX
- Repositorio dspine-hybrid-mlx: https://github.com/internet-projects/dspine-hybrid-mlx
