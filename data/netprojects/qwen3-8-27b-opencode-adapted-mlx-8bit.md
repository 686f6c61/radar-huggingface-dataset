# netprojects/Qwen3.8-27B-opencode-adapted-MLX-8bit

## Resumen
Qwen3.8-27B-opencode-adapted-MLX-8bit es una cuantizacion en 8 bits para Apple Silicon del modelo Qwen3.8-27B, adaptado mediante LoRA con aprendizaje por refuerzo para funcionar como el motor detras del agente de programacion OpenCode. Lo publica el usuario netprojects en Hugging Face, partiendo del adaptador de harness-hub y del modelo base de Qwen, y esta empaquetado con la libreria MLX para ejecutarse de forma nativa en chips de Apple.

El modelo resuelve un problema concreto: disponer de un agente de codigo capaz de operar en tareas de ingenieria de software y de terminal directamente en un Mac, sin depender de GPUs dedicadas. Para ello combina el modelo base de 27.781 millones de parametros con un adaptador entrenado con AsyncGRPO en TRL, y conserva la capa de prediccion multi-token (MTP) de Qwen para acelerar la decodificacion.

Es relevante porque ofrece, segun el autor del adaptador, una mejora sustancial en tareas de agente con el modo thinking desactivado: SWE-bench Pro (hard 51) pasa del 35,3% al 51,0% y Terminal-Bench 2.1 del 46,4% al 52,4% respecto al modelo base. Esta build de 8 bits ocupa 30,0 GB y conserva el 99,2% de los mismos siguientes tokens que la version bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion completa e hibrida (16 capas de atencion completa y 64 capas totales), con capa MTP; empaquetado MLX |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits afin, grupo 64 (existen builds de 4, 6 y bf16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), con `model-mtp.safetensors` para la capa MTP |

## Arquitectura y entrenamiento
El modelo parte de Qwen3.8-27B, un transformer con 64 capas en el que 16 capas emplean atencion completa y el resto atencion lineal/hibrida, segun se deduce de la descripcion de los modulos adaptados (q, k, v, o en las 16 capas de atencion completa; gate, up, down en las 64 capas). Incluye una capa de prediccion multi-token (MTP) propia de Qwen que se conserva cuantizada en `model-mtp.safetensors` y que puede usarse como modelo borrador para decodificacion especulativa.

El adaptador original fue entrenado por harness-hub mediante aprendizaje por refuerzo con AsyncGRPO en TRL, orientado a tareas de ingenieria de software y de terminal dentro del agente OpenCode. Esta build concreta fusiona el adaptador (revision `b4171c0`) sobre el modelo base (revision `3756181`) y convierte el resultado a MLX con mlx-vlm, incluyendo el codificador de vision y la capa MTP. La cuantizacion es afin de 8 bits con grupo 64, y el autor verifica que los 256 modulos adaptados equivalen a `W + 2.0 · B @ A` redondeado a bf16. El tokenizador y la plantilla de chat son los de harness-hub, sin cambios.

## Capacidades
- Generacion de texto y razonamiento en el contexto de tareas de programacion y agentes.
- Capacidades de vision: pipeline image-text-to-text, con codificador de vision incluido, util para interpretar capturas de pantalla o salidas de terminal.
- Tool calling en formato XML de Qwen (`<tool_call><function=...><parameter=...>`), que el servidor de mlx-lm expone como `tool_calls` compatibles con OpenAI.
- Ejecucion como agente de codigo multi-paso, entrenado especificamente para OpenCode en tareas de ingenieria de software y terminal.
- Modo thinking configurable mediante la plantilla de chat (`enable_thinking`), aunque el adaptador fue entrenado y evaluado con thinking desactivado.
- Decodificacion especulativa integrada mediante la capa MTP de Qwen, con una aceleracion de aproximadamente 2,15x en esta build de 8 bits.
- Soporte de imagenes via mlx-vlm (`--image`), con thinking desactivado por defecto salvo que se active explicitamente.

## Casos de uso
- Agente de programacion local en macOS: servir el modelo con `mlx_lm.server` y conectarlo a OpenCode mediante un proveedor compatible con OpenAI, de modo que el agente pueda leer el repositorio, ejecutar tests y aplicar parches sin salir del Mac.
- Correccion de bugs guiada por tests: usar el modelo para localizar la causa de fallos en suites de pruebas (por ejemplo `tests/test_parser.py`) y proponer el arreglo, aprovechando su entrenamiento en tareas de terminal e ingenieria de software.
- Automatizacion de tareas de terminal: interpretar salidas de comandos y errores de shell para encadenar acciones correctivas en un pipeline de agente.
- Analisis de capturas de pantalla y salidas visuales: con mlx-vlm, enviar una imagen de una terminal o de una interfaz y pedir al modelo que describa el error mostrado.
- Asistencia de codigo en el editor: integracion via API compatible con OpenAI para autocompletado, explicacion de funciones y generacion de utilidades (por ejemplo, convertir `1.5M` a bytes).
- Evaluacion y experimentacion en investigacion: al ser una build cuantizada con metricas de fidelidad publicadas (99,2% de coincidencia en siguiente token, KL 0,0004 frente a bf16), sirve para estudiar el impacto de la cuantizacion en tareas de agente.
- Despliegue en estaciones de trabajo Apple Silicon sin GPU dedicada: permite ejecutar un modelo de 27,8 mil millones de parametros en un unico equipo con memoria unificada suficiente.

## Benchmarks y rendimiento
Resultados publicados por el autor del adaptador (harness-hub), bajo OpenCode con thinking desactivado, comparando el adaptador frente al modelo base:

| Benchmark | Modelo base | Adaptador OpenCode |
|---|---|---|
| SWE-bench Pro (hard 51) | 35,3% | 51,0% |
| Terminal-Bench 2.1 | 46,4% | 52,4% |

Fidelidad de la cuantizacion frente a bf16, segun el autor de la build:

| Build | Tamano | Mismos siguientes tokens que bf16 | KL frente a bf16 |
|---|---|---|---|
| 6 bits (recomendada) | 23,1 GB | 98,7% | 0,0014 |
| 8 bits (esta build) | 30,0 GB | 99,2% | 0,0004 |
| 4 bits | 16,3 GB | 96,7% | 0,0203 |
| bf16 | 55,6 GB | referencia | referencia |

Rendimiento de decodificacion medido por el autor en un MacBook Pro M5 Max (128 GB), greedy, thinking desactivado, 5 prompts x 256 tokens:

| Build | Sin MTP | Con MTP (mlx-vlm 0.7.11) |
|---|---|---|
| 4 bits | 33 tok/s | 62 tok/s (x1,91) |
| 6 bits | 20 tok/s | 21 tok/s (x1,04) |
| 8 bits | 17 tok/s | 37 tok/s (x2,15) |

No se han publicado resultados de MMLU, HumanEval, GSM8K u otros benchmarks generales en la informacion disponible.

## Requisitos de hardware
- VRAM/memoria unificada estimada: 30,0 GB de pesos en 8 bits, mas overhead de contexto y codificador de vision; se recomienda al menos 48 GB de memoria unificada y, de forma realista, 64 GB o mas para contextos largos.
- Hardware verificado por el autor: MacBook Pro con M5 Max y 128 GB de memoria unificada.
- Solo Apple Silicon: la build usa MLX y no esta pensada para GPUs NVIDIA o AMD.
- Alternativas de menor huella: build de 6 bits (23,1 GB, recomendada por el autor) y de 4 bits (16,3 GB).
- Despliegue: `mlx-lm` (version 0.32.2 o superior) para texto y servidor compatible con OpenAI; `mlx-vlm` (0.7.11 o superior) para vision y decodificacion especulativa con MTP.
- Aceleracion: pasar el mismo repositorio como `--draft-model` con `--draft-kind mtp` para activar la decodificacion especulativa; tambien compatible con el drafter DSpine (`netprojects/Qwen3.8-27B-DSpine-b16-MLX`).
- Throughput indicativo: 17 tok/s sin MTP y 37 tok/s con MTP en la configuracion medida por el autor.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| netprojects/Qwen3.8-27B-opencode-adapted-MLX-8bit | 27,78 B | no disponible | 8 bits MLX | apache-2.0 | Hugging Face |
| netprojects/Qwen3.8-27B-opencode-adapted-MLX-6bit | 27,78 B | no disponible | 6 bits MLX | apache-2.0 | Hugging Face |
| netprojects/Qwen3.8-27B-opencode-adapted-MLX-4bit | 27,78 B | no disponible | 4 bits MLX | apache-2.0 | Hugging Face |
| harness-hub/Qwen3.8-27B-opencode-adapted | 27,78 B | no disponible | bf16/LoRA | no disponible en la informacion | Hugging Face |

Frente a la build de 6 bits, esta de 8 bits gana en fidelidad (99,2% frente a 98,7% de coincidencia en siguiente token y KL 0,0004 frente a 0,0014) a costa de 6,9 GB adicionales. Frente a la de 4 bits, la diferencia de fidelidad es notable (96,7% y KL 0,0203) y el tamano se reduce a 16,3 GB. No se dispone de datos para comparar con modelos de otros autores de la misma categoria.

## Limitaciones y advertencias
- Solo funciona en Apple Silicon mediante MLX; no es desplegable en GPUs NVIDIA con vLLM, TGI o llama.cpp.
- El adaptador fue entrenado y evaluado con thinking desactivado; el autor recomienda mantenerlo apagado, por lo que el rendimiento con thinking activo no esta validado.
- La decodificacion especulativa con MTP puede divergir ligeramente del texto de la decodificacion simple en respuestas largas, ya que la comprobacion por lotes puede redondear de forma distinta en empates cercanos.
- Los resultados de benchmarks (SWE-bench Pro, Terminal-Bench 2.1) provienen del autor del adaptador y no han sido replicados de forma independiente en la informacion disponible.
- Las mediciones de velocidad se tomaron con otros servicios en ejecucion en el equipo, por lo que el propio autor las califica de indicativas.
- No se especifican idiomas soportados; el comportamiento multilingue no esta documentado en esta build.
- No se indica la longitud de contexto soportada, lo que dificulta dimensionar despliegues con ventanas largas.
- Riesgo de alucinacion y sesgos: no hay informacion publicada especifica para este adaptador; al derivar de Qwen3.8-27B hereda las caracteristicas del modelo base, no documentadas aqui.
- Licencia apache-2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base y del adaptador original antes de un despliegue en produccion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-8bit
- Modelo base del adaptador: https://huggingface.co/harness-hub/Qwen3.8-27B-opencode-adapted
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Build de 6 bits: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-6bit
- Build de 4 bits: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-4bit
- Build bf16: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-bf16
- Adaptador LoRA para mlx-lm: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-adapter
- Drafter DSpine: https://huggingface.co/netprojects/Qwen3.8-27B-DSpine-b16-MLX
- Repositorio dspine-hybrid-mlx: https://github.com/internet-projects/dspine-hybrid-mlx
- OpenCode: https://opencode.ai
