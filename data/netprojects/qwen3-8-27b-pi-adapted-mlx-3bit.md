# netprojects/Qwen3.8-27B-pi-adapted-MLX-3bit

## Resumen
Qwen3.8-27B-pi-adapted-MLX-3bit es una cuantización de 3 bits en formato MLX del modelo harness-hub/Qwen3.8-27B-pi-adapted, un ajuste fino mediante LoRA con aprendizaje por refuerzo (AsyncGRPO) del modelo base Qwen/Qwen3.8-27B. El adaptador fue entrenado específicamente para operar como el modelo subyacente del agente de programación pi (earendil-works/pi) en tareas de ingeniería de software y terminal. Esta build concreta, publicada por el usuario netprojects, empaqueta el modelo fusionado y convertido a MLX para su ejecución en Apple Silicon, incluyendo el codificador visual y la capa de predicción multi-token (MTP) de Qwen.

El modelo resuelve el problema de desplegar un LLM de 28.500 millones de parámetros con capacidades de agente y visión en equipos Mac con memoria unificada limitada. Con 13,8 GB de pesos, la build de 3 bits está pensada para Macs de 24 GB, a costa de una fidelidad reducida frente a bf16 (91,4 % de coincidencia en el siguiente token y KL de 0,0884). El autor recomienda la build de 6 bits (23,1 GB) como equilibrio entre tamaño y fidelidad, y reserva la de 3 bits para entornos con restricciones de memoria.

La relevancia actual radica en que combina tres piezas poco habituales: un ajuste con RL orientado a agentes de terminal, cuantización agresiva con capas sensibles preservadas en 4 bits, y decodificación especulativa nativa mediante la capa MTP del propio Qwen. El resultado es un modelo ejecutable localmente en hardware de consumo Apple que mantiene el formato de tool calling XML de Qwen y es compatible con el servidor OpenAI de mlx-lm.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.8-27B) con capa MTP, adaptador LoRA fusionado, conversión MLX; pipeline image-text-to-text |
| Parámetros totales | 28.489.216.752 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 3 bits afín (grupo 64) en la mayoría de capas lineales; 4 bits en embedding de tokens, capa de salida y v_proj/down_proj sensibles (primeras y últimas ocho capas y cada tercera intermedia); ~3,9 bits por peso en promedio; capa MTP en 8 bits |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), con model-mtp.safetensors para la capa MTP; repositorio de 13,8 GB |

## Arquitectura y entrenamiento
El modelo parte de Qwen/Qwen3.8-27B (revisión 3756181), al que se fusiona el adaptador harness-hub/Qwen3.8-27B-pi-adapted (revisión e786f84) y se convierte a MLX con mlx-vlm, conservando el codificador visual y la capa de predicción multi-token (MTP) de Qwen. La cuantización es afín con grupo de 64, verificada como exacta respecto a la build bf16, con un esquema mixto que eleva a 4 bits el embedding de tokens, la capa de salida y las proyecciones v_proj y down_proj más sensibles (primeras y últimas ocho capas y cada tercera capa intermedia), resultando en unos 3,9 bits por peso.

El adaptador se entrenó con aprendizaje por refuerzo mediante AsyncGRPO en TRL, con el objetivo de ser el modelo del agente de programación pi en tareas de ingeniería de software y terminal. El adaptador no modifica la capa MTP, que se cuantiza a 8 bits y se declara en config.json como mtplx_mtp_quantization. El tokenizador y la plantilla de chat son los de harness-hub sin cambios, manteniendo el vocabulario y el formato de tool calling de Qwen3.8-27B. La build se validó en un MacBook Pro M5 Max de 128 GB con mlx 0.32.4, mlx-lm 0.32.2 y mlx-vlm 0.7.11, comprobando cada archivo contra los hashes SHA-256 del Hub.

## Capacidades
- Generación de texto y razonamiento con modo thinking desactivable; el adaptador fue entrenado y evaluado con thinking off, por lo que se recomienda mantenerlo desactivado.
- Capacidades de agente de programación: resolución de tareas de terminal e ingeniería de software con reducción de llamadas a herramientas (55-64 % menos por tarea según el autor del adaptador).
- Tool calling en formato XML de Qwen (`<tool_call><function=...><parameter=...>`), que el servidor de mlx-lm expone como `tool_calls` de OpenAI.
- Compatibilidad con la API Chat Completions de OpenAI (no la API Responses), requisito para su integración con pi.
- Procesamiento de imágenes y texto (image-text-to-text) mediante mlx-vlm, con codificador visual incluido.
- Decodificación especulativa mediante la capa MTP integrada, usable como modelo borrador con `--draft-kind mtp`.
- Multilingüismo: no disponible en la información proporcionada.

## Casos de uso
- Agente de programación en local: ejecutar pi contra el servidor OpenAI de mlx-lm para resolver tareas como depurar tests fallidos o corregir bugs en un repositorio, aprovechando el ajuste RL específico para tareas de terminal y la reducción de llamadas a herramientas.
- Automatización de tareas de terminal en Mac: el modelo puede encadenar comandos y verificar resultados en un bucle agéntico, con un tamaño de 13,8 GB que permite mantenerlo residente en Macs de 24 GB.
- Análisis de capturas de terminal o pantalla: usar mlx-vlm para pasar una imagen (por ejemplo, una captura de error) y preguntar por el fallo mostrado, combinando visión y razonamiento sobre código.
- Asistencia a la revisión de código en flujos de CI local: servir el modelo con mlx_lm.server y conectarlo a scripts que generen parches o expliquen fallos de test antes de abrir una pull request.
- Prototipado de agentes con tool calling: emplear el formato XML de Qwen y la API Chat Completions para construir pipelines multi-paso con herramientas externas sin depender de servicios en la nube.
- Desarrollo y evaluación de adaptadores: usar la build de 3 bits como variante ligera para comparar fidelidad frente a las builds de 4, 6 y 8 bits en un mismo Mac, o cargar solo el adaptador LoRA (638 MB) sobre cualquier build MLX de Qwen3.8-27B.
- Inferencia con decodificación especulativa: activar la capa MTP como draft model para acelerar la generación en tareas de código con decodificación greedy.

## Benchmarks y rendimiento

Resultados publicados por el autor del adaptador, bajo pi con thinking off, frente al modelo base:

| Benchmark | Modelo base | Con adaptador pi |
|---|---|---|
| Terminal-Bench 2.1 | 39,5 % | 55,8 % |
| SWE-bench Pro (hard 51) | 29,4 % | 62,7 % |

Fidelidad de la cuantización frente a la build bf16 (12 prompts cortos, 9 con thinking):

| Build | Tamaño | Coincidencia en siguiente token vs bf16 | KL vs bf16 |
|---|---|---|---|
| MLX-8bit | 30,0 GB | 99,1 % | 0,0004 |
| MLX-6bit (recomendada) | 23,1 GB | 99,0 % | 0,0015 |
| MLX-4bit | 16,3 GB | 95,6 % | 0,0201 |
| MLX-3bit (esta build) | 13,8 GB | 91,4 % | 0,0884 |
| MLX-2.5bit (solo texto) | 11,8 GB | 85,5 % | 0,2363 |
| MLX-bf16 | 55,6 GB | referencia | referencia |

No se han publicado resultados de benchmarks de MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware
- VRAM/memoria unificada estimada: 13,8 GB de pesos; la build de 3 bits está indicada para Macs de 24 GB según el autor.
- GPU recomendadas: Apple Silicon con memoria unificada; la build se validó en un MacBook Pro M5 Max de 128 GB. No se indican GPU NVIDIA (A100, H100, RTX 4090) porque el formato MLX es específico de Apple Silicon.
- Cabe en GPU de consumo Apple: sí, en Macs de 24 GB o superiores; para mayor fidelidad, la build de 6 bits requiere 23,1 GB y la de 8 bits 30,0 GB.
- Opciones de despliegue: mlx-lm (servidor compatible con OpenAI, `mlx_lm.server`) para texto; mlx-vlm para imagen-texto; integración con el agente pi mediante `~/.pi/agent/models.json`; el adaptador LoRA suelto (638 MB) se carga con mlx-lm sobre cualquier build MLX de Qwen3.8-27B.
- Latencia y throughput: no disponibles. Se documenta la posibilidad de acelerar la decodificación con la capa MTP como draft model (`--draft-kind mtp`), con verificación de cada token por el modelo completo; en greedy, el texto coincide con la decodificación normal salvo en empates cercanos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-pi-adapted-MLX-3bit | 28,49 B | no disponible | 3 bits MLX (~3,9 bits/peso) | apache-2.0 | Hugging Face, 13,8 GB |
| Qwen3.8-27B-pi-adapted-MLX-6bit | 28,49 B | no disponible | 6 bits MLX | apache-2.0 | Hugging Face, 23,1 GB; recomendada por el autor |
| Qwen3.8-27B-pi-adapted-MLX-bf16 | 28,49 B | no disponible | bf16 | apache-2.0 | Hugging Face, 55,6 GB |
| harness-hub/Qwen3.8-27B-pi-adapted | 28,49 B | no disponible | adaptador LoRA | no disponible en la información | Hugging Face |

No se dispone de datos de benchmarks comparativos con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias
- La cuantización a 3 bits reduce la fidelidad: 91,4 % de coincidencia en el siguiente token y KL de 0,0884 frente a bf16, con divergencia acumulable en respuestas largas; el autor recomienda la build de 6 bits para uso general.
- El adaptador fue entrenado y evaluado con thinking desactivado; activar el modo thinking puede degradar el comportamiento esperado.
- Requiere la API Chat Completions de OpenAI, no la API Responses, para la integración con pi.
- Formato MLX exclusivo para Apple Silicon; no es desplegable en vLLM, TGI ni llama.cpp con GPU NVIDIA.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones específicas en la información disponible.
- Idiomas soportados: no disponible; no se garantiza cobertura multilingüe más allá del comportamiento del modelo base.
- Licencia apache-2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.8-27B y del adaptador harness-hub.
- La decodificación especulativa con MTP puede divergir ligeramente del texto de la decodificación normal en empates cercanos bajo greedy.
- No se han publicado datos de latencia, throughput ni de benchmarks estándar (MMLU, HumanEval, GSM8K).

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-3bit
- Modelo base del adaptador: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Build recomendada de 6 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit
- Build de 8 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-8bit
- Build de 4 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-4bit
- Build de 2.5 bits (solo texto): https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-2.5bit
- Build bf16: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-bf16
- Adaptador LoRA MLX: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-adapter
- Repositorio del agente pi: https://github.com/earendil-works/pi
