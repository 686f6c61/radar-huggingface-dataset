# netprojects/Qwen3.8-27B-opencode-adapted-MLX-4bit

## Resumen

Qwen3.8-27B-opencode-adapted-MLX-4bit es una cuantizacion de 4 bits en formato MLX del modelo harness-hub/Qwen3.8-27B-opencode-adapted, un ajuste fino mediante LoRA y aprendizaje por refuerzo (AsyncGRPO en TRL) sobre Qwen/Qwen3.8-27B. El adaptador original fue entrenado para actuar como el modelo subyacente del agente de programacion OpenCode en tareas de ingenieria de software y terminal. Esta version, publicada por netprojects, fusiona el adaptador con el modelo base y lo convierte a MLX con mlx-vlm, incluyendo el codificador de vision y la capa MTP de Qwen.

El modelo resuelve el problema de desplegar un agente de codigo de 27.800 millones de parametros en Apple Silicon con memoria limitada. Con 16,3 GB en disco y capas lineales cuantizadas a 4 bits (afin afin, grupo 64), cabe en Macs de 32 GB, manteniendo un 96,7% de coincidencia en el siguiente token respecto a bf16 y una divergencia KL de 0,0203.

Es relevante ahora porque demuestra que un ajuste por RL orientado a agentes de terminal puede mejorar sustancialmente el rendimiento en benchmarks de ingenieria de software (SWE-bench Pro hard 51: 35,3% a 51,0%; Terminal-Bench 2.1: 46,4% a 52,4%) manteniendo el modo thinking desactivado, lo que reduce el coste de inferencia a aproximadamente una sexta parte de los tokens del modelo base con thinking al maximo esfuerzo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con capa MTP y codificador de vision, convertido a MLX |
| Parametros totales | 27.781.427.952 (27,8 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afin, grupo 64 (esta build); tambien existen 3, 6, 8 bits y bf16 en el mismo repositorio de autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 16,3 GB en el repositorio |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer multimodal con codificador de vision y una capa MTP (multi-token prediction) que se conserva en esta conversion. La adaptacion de harness-hub se realizo mediante LoRA entrenado con aprendizaje por refuerzo usando AsyncGRPO en TRL, orientado a tareas de ingenieria de software y terminal dentro del agente OpenCode. El adaptador se fusiona con el modelo base (revision b4171c0 sobre 3756181) y se convierte a MLX con mlx-vlm.

La cuantizacion de esta build aplica 4 bits afines con grupo de 64 a las capas lineales. El tokenizador y la plantilla de chat son los originales de harness-hub, sin cambios: mismo vocabulario y mismo formato de tool calls XML de Qwen (`<tool_call><function=...><parameter=...>`). El adaptador fue entrenado y evaluado con thinking desactivado, y el autor recomienda mantenerlo asi.

## Capacidades

- Generacion de texto y razonamiento en modo thinking desactivado (recomendado) o activado.
- Generacion y edicion de codigo en tareas de ingenieria de software y terminal.
- Comprension de imagenes (pipeline image-text-to-text): capturas de pantalla, errores de terminal, diagramas.
- Tool calling en formato XML de Qwen, expuesto como tool calls compatibles con OpenAI por el servidor de mlx-lm.
- Uso como agente multi-paso dentro de OpenCode y otros clientes compatibles con OpenAI.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking configurable mediante `enable_thinking` en la plantilla de chat.

## Casos de uso

- Agente de codigo local en OpenCode: servir el modelo con `mlx_lm.server` en el puerto 8000 y registrarlo como proveedor local; el modelo esta entrenado especificamente para este flujo y mantiene thinking desactivado para reducir tokens generados.
- Depuracion de tests en terminal: lanzar `opencode run --model local/... "Find out why the tests in tests/test_parser.py fail and fix the bug"` permite al modelo inspeccionar el repositorio, ejecutar comandos y proponer el parche.
- Analisis de capturas de terminal: con mlx-vlm se puede pasar una imagen de error y preguntar que fallo, util para soporte interno o documentacion de incidencias.
- Automatizacion de tareas de mantenimiento de repositorios: refactorizaciones acotadas, actualizacion de dependencias y correccion de lint mediante tool calls sobre el sistema de ficheros.
- Asistente de programacion en estaciones de trabajo Mac con 32 GB: al ocupar 16,3 GB, deja margen para macOS y prompts largos, lo que permite uso interactivo sin GPU dedicada.
- Evaluacion de agentes y pipelines de CI: el modelo puede integrarse en un servidor compatible con OpenAI para pruebas reproducibles de agentes de codigo en local, sin coste de API.
- Generacion de codigo asistida en Python: carga con mlx-lm y `generate` para tareas de una sola vuelta, como convertir cadenas tipo "1.5M" a bytes.

## Benchmarks y rendimiento

Resultados publicados por harness-hub para el adaptador original, con thinking desactivado, frente al modelo base:

| Benchmark | Modelo base | Adaptador OpenCode |
|---|---|---|
| SWE-bench Pro (hard 51) | 35,3% | 51,0% |
| Terminal-Bench 2.1 | 46,4% | 52,4% |

Fidelidad de las cuantizaciones MLX respecto a bf16:

| Build | Tamano | Coincidencia siguiente token vs bf16 | KL vs bf16 |
|---|---|---|---|
| 6 bits (recomendada) | 23,1 GB | 98,7% | 0,0014 |
| 8 bits | 30,0 GB | 99,2% | 0,0004 |
| 4 bits (esta build) | 16,3 GB | 96,7% | 0,0203 |
| 3 bits | 13,8 GB | 93,4% | 0,0812 |
| bf16 | 55,6 GB | referencia | referencia |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 16,3 GB de pesos; el autor indica que el modelo debe ocupar como maximo en torno al 60% de la memoria del equipo para dejar espacio a macOS y prompts largos.
- Macs compatibles segun el autor: 32 GB para esta build de 4 bits; 24 GB para la de 3 bits (13,8 GB); 48 GB para 6 bits; 64 GB o mas para 8 bits; 128 GB para bf16.
- En 16 GB solo es viable la version GGUF IQ2_M (10,2 GB) con llama.cpp, Ollama o LM Studio, no esta build MLX.
- GPU dedicadas: no aplica; MLX esta orientado a Apple Silicon. Para CUDA habria que usar otras conversiones no incluidas en esta ficha.
- Despliegue: mlx-lm (servidor compatible con OpenAI), mlx-vlm para vision, LM Studio en modo MLX; GGUF equivalente para llama.cpp, Ollama y LM Studio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-opencode-adapted-MLX-4bit (esta ficha) | 27,8 mil millones | no disponible | Apache 2.0 | MLX safetensors 4 bits | Agente de codigo, 16,3 GB, SWE-bench Pro 51,0% |
| Qwen3.8-27B-opencode-adapted-MLX-6bit | 27,8 mil millones | no disponible | Apache 2.0 | MLX safetensors 6 bits | Recomendada por el autor, 23,1 GB, 98,7% de fidelidad |
| Qwen3.8-27B-opencode-adapted-MLX-bf16 | 27,8 mil millones | no disponible | Apache 2.0 | MLX safetensors bf16 | Referencia de fidelidad, 55,6 GB |
| Qwen3.8-27B (base) | 27,8 mil millones | no disponible | no disponible | no disponible | Sin el ajuste RL; SWE-bench Pro 35,3%, Terminal-Bench 46,4% |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador fue entrenado y evaluado con thinking desactivado; activarlo puede degradar el comportamiento esperado del agente.
- La cuantizacion a 4 bits introduce una divergencia KL de 0,0203 y solo reproduce el 96,7% de los siguientes tokens de bf16; para maxima fidelidad conviene la build de 6 u 8 bits.
- No hay informacion sobre sesgos, idiomas soportados ni riesgo de alucinacion especifico en la documentacion disponible.
- La longitud de contexto no se especifica; no debe asumirse un valor concreto en produccion.
- Requiere Apple Silicon y la libreria MLX; no es directamente utilizable en CUDA sin otra conversion.
- Aunque la licencia es Apache 2.0, el modelo base y el adaptador pueden tener condiciones adicionales no detalladas; conviene revisar las fichas de Qwen/Qwen3.8-27B y harness-hub/Qwen3.8-27B-opencode-adapted antes de uso comercial.
- El formato de tool calls es XML de Qwen; los clientes deben soportar ese formato o usar el servidor de mlx-lm que lo traduce a OpenAI.

## Enlaces

- Hugging Face (esta build): https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-4bit
- Modelo base del adaptador: https://huggingface.co/harness-hub/Qwen3.8-27B-opencode-adapted
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Build de 6 bits: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-6bit
- Build de 8 bits: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-8bit
- Build de 3 bits: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-3bit
- Build bf16: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-bf16
- Adaptador LoRA MLX: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-adapter
- Builds GGUF: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-GGUF
- OpenCode: https://opencode.ai
- Configuracion de OpenCode: https://opencode.ai/config.json
