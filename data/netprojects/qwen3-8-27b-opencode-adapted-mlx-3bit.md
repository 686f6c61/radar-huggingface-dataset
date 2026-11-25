# netprojects/Qwen3.8-27B-opencode-adapted-MLX-3bit

## Resumen

Qwen3.8-27B-opencode-adapted-MLX-3bit es una cuantizacion de 3 bits en formato MLX del modelo Qwen3.8-27B, adaptado mediante LoRA y aprendizaje por refuerzo para funcionar como motor del agente de programacion OpenCode. Lo publica el usuario netprojects, partiendo del adaptador de harness-hub sobre el modelo base de Qwen. El resultado es un modelo multimodal (texto e imagen) de aproximadamente 28.500 millones de parametros, empaquetado en 13,8 GB, pensado para ejecutarse en Apple Silicon.

El modelo resuelve un problema concreto: desplegar un agente de codigo capaz de resolver tareas de ingenieria de software y de terminal en Macs con memoria limitada. El adaptador original mejora de forma notable los resultados del modelo base en SWE-bench Pro y Terminal-Bench, y esta version comprime los pesos para que quepan en equipos de 24 GB de memoria unificada, manteniendo el codificador de vision y la capa de prediccion multi-token (MTP) del modelo original.

Es relevante ahora porque demuestra que un agente de programacion de casi 30.000 millones de parametros puede correr de forma local en hardware de consumo de Apple, con un compromiso de fidelidad respecto a bf16 cuantificado (93,4% de coincidencia en el siguiente token y KL de 0,0812). La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con capa MTP; pesos cuantizados en MLX (afin, grupo 64) |
| Parametros totales | 28.489.216.752 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3 bits mayoritario (capas lineales), 4 bits en embedding de tokens, capa de salida y v_proj/down_proj sensibles; ~3,9 bits por peso de media; MTP en 8 bits |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), repositorio de 13,8 GB |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer multimodal que procesa texto e imagen. Sobre el se aplico un LoRA entrenado por harness-hub con aprendizaje por refuerzo (AsyncGRPO en TRL) para convertirse en el motor del agente OpenCode en tareas de ingenieria de software y terminal. Esta build concreta fusiona ese adaptador (revision b4171c0) en el modelo base (revision 3756181) y lo convierte a MLX con mlx-vlm, incluyendo el codificador de vision y la capa MTP de Qwen.

La innovacion tecnica principal de esta version es la cuantizacion selectiva: la mayoria de capas lineales usan 3 bits (afin, grupo 64), mientras que el embedding de tokens, la capa de salida y las capas mas sensibles (v_proj y down_proj de las ocho primeras y ocho ultimas capas, mas cada tercera capa intermedia) se mantienen en 4 bits, resultando en unos 3,9 bits por peso. La capa MTP se conserva en 8 bits y se declara en config.json como mtplx_mtp_quantization, lo que permite usarla como modelo borrador para decodificacion especulativa. El tokenizador y la plantilla de chat son los de harness-hub sin cambios, con el mismo vocabulario y formato de tool calls de Qwen3.8-27B.

## Capacidades

- Generacion de texto y razonamiento, con modo thinking desactivable (el adaptador se entreno y evaluo con thinking off).
- Generacion y reparacion de codigo en tareas de ingenieria de software.
- Ejecucion de tareas de terminal y agentes de codigo de multiples pasos (entrenado especificamente para OpenCode).
- Procesamiento de imagenes (image-text-to-text): capturas de pantalla, errores de terminal, diagramas.
- Tool calling / function calling en formato XML de Qwen (`<tool_call><function=...><parameter=...>`), expuesto como `tool_calls` de OpenAI por el servidor de mlx-lm.
- Decodificacion especulativa integrada mediante la capa MTP como modelo borrador.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Agente de programacion local en OpenCode: el modelo se sirve con `mlx_lm.server` y se configura como proveedor local en opencode.json, resolviendo tareas como localizar y corregir tests que fallan, con thinking off tal como se entreno.
- Reparacion de bugs sobre repositorios reales: gracias al entrenamiento RL en tareas de ingenieria de software, puede abordar issues de codigo y proponer parches, adecuado para equipos que quieran un agente sin enviar codigo a la nube.
- Automatizacion de tareas de terminal: interpretar salidas de comandos, diagnosticar errores y ejecutar secuencias multi-paso, apoyandose en el soporte de tool calls.
- Analisis de capturas de pantalla y errores: con mlx-vlm puede recibir una imagen de terminal o interfaz y describir el error mostrado, util para soporte tecnico asistido por imagen.
- Asistente de codigo en portatiles Apple: al ocupar 13,8 GB, cabe en Macs de 24 GB de memoria unificada, permitiendo un asistente de programacion totalmente offline.
- Generacion de codigo con latencia reducida: usando la capa MTP como draft model con decodificacion especulativa, se acelera la generacion en respuestas largas manteniendo la verificacion del modelo completo.
- Evaluacion e investigacion de cuantizacion: sirve como referencia practica del compromiso entre tamano y fidelidad (93,4% de coincidencia con bf16) para estudiar tecnicas de cuantizacion selectiva en MLX.

## Benchmarks y rendimiento

Resultados publicados por harness-hub para el adaptador sobre el modelo base, con OpenCode y thinking off:

| Benchmark | Modelo base | Adaptador opencode |
|---|---|---|
| SWE-bench Pro (hard 51) | 35,3% | 51,0% |
| Terminal-Bench 2.1 | 46,4% | 52,4% |

Fidelidad de la cuantizacion respecto a bf16 (builds MLX):

| Build | Tamano | Mismo siguiente token que bf16 | KL vs bf16 |
|---|---|---|---|
| MLX-8bit | 30,0 GB | 99,2% | 0,0004 |
| MLX-6bit (recomendada) | 23,1 GB | 98,7% | 0,0014 |
| MLX-4bit | 16,3 GB | 96,7% | 0,0203 |
| MLX-3bit (esta build) | 13,8 GB | 93,4% | 0,0812 |
| MLX-bf16 | 55,6 GB | referencia | referencia |

No se han publicado resultados de benchmarks especificos para la build de 3 bits mas alla de las metricas de fidelidad indicadas.

## Requisitos de hardware

- Memoria: 13,8 GB de pesos; encaja en Macs con 24 GB de memoria unificada segun el autor. Para margen de contexto y KV cache se recomienda mas memoria.
- Hardware verificado: MacBook Pro M5 Max de 128 GB (mlx 0.32.4, mlx-lm 0.32.2, mlx-vlm 0.7.11).
- Exclusivo para Apple Silicon: es una build MLX, no compatible con GPU NVIDIA de forma nativa.
- Despliegue: servidor compatible con OpenAI mediante `mlx_lm.server` (mlx-lm >= 0.32.2); generacion con imagenes mediante mlx-vlm (>= 0.7.11); integracion con OpenCode como proveedor local.
- Decodificacion especulativa: pasar el mismo repositorio como `--draft-model` con `--draft-kind mtp`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-opencode-adapted-MLX-3bit | ~28,5B | no disponible | apache-2.0 | safetensors MLX | 13,8 GB, 93,4% fidelidad vs bf16 |
| Qwen3.8-27B-opencode-adapted-MLX-6bit | ~28,5B | no disponible | apache-2.0 | safetensors MLX | 23,1 GB, 98,7% fidelidad, recomendada por el autor |
| Qwen3.8-27B-opencode-adapted-MLX-8bit | ~28,5B | no disponible | apache-2.0 | safetensors MLX | 30,0 GB, 99,2% fidelidad |
| Qwen3.8-27B-opencode-adapted-MLX-bf16 | ~28,5B | no disponible | apache-2.0 | safetensors MLX | 55,6 GB, referencia sin perdida |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 3 bits introduce una perdida medible de fidelidad: solo el 93,4% de coincidencia en el siguiente token respecto a bf16 y KL de 0,0812, muy superior a las builds de 6 y 8 bits. Para tareas criticas el autor recomienda la build de 6 bits.
- El adaptador se entreno y evaluo con thinking off; activar el modo thinking puede degradar el comportamiento esperado.
- Con decodificacion especulativa MTP y decodificacion greedy, las respuestas largas pueden divergir ligeramente del decodificado plano en casos de casi empate.
- Solo funciona en Apple Silicon mediante MLX; no es portable a otras plataformas sin reconversion.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en generacion de codigo y diagnosticos de terminal; conviene validar las salidas.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles; no se garantiza un rendimiento multilingue equivalente al del modelo base.
- Longitud de contexto: no disponible, lo que impide planificar con precision tareas con repositorios grandes.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B y del adaptador de harness-hub.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-3bit
- Modelo base adaptado: https://huggingface.co/harness-hub/Qwen3.8-27B-opencode-adapted
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Build MLX 6 bits: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-6bit
- Build MLX 8 bits: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-8bit
- Build MLX 4 bits: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-4bit
- Build MLX bf16: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-bf16
- Adaptador LoRA MLX: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-adapter
- OpenCode: https://opencode.ai
