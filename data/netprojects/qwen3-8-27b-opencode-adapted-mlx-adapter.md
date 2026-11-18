# netprojects/Qwen3.8-27B-opencode-adapted-MLX-adapter

## Resumen

El repositorio `netprojects/Qwen3.8-27B-opencode-adapted-MLX-adapter` contiene un adaptador LoRA en formato mlx-lm para el modelo base Qwen3.8-27B, derivado del adaptador original publicado por harness-hub. No es un modelo completo, sino un conjunto de pesos de adaptación de rango 32 (alpha 64, escala 2.0) que se aplica sobre una build MLX del modelo base. Su propósito es especializar Qwen3.8-27B como motor del agente de programación OpenCode en tareas de ingeniería de software y operaciones de terminal.

El adaptador fue entrenado por harness-hub mediante aprendizaje por refuerzo (AsyncGRPO en TRL) y NetProjects se limita a convertirlo al formato de mlx-lm, preservando los valores originales en float32 y transponiéndolos al layout de la librería. El resultado ocupa 638 MB y se carga junto con cualquier build MLX de Qwen3.8-27B, lo que permite mantener un único modelo base y activar o desactivar el adaptador según la tarea.

La relevancia de esta publicación es doble: por un lado, ofrece una vía para ejecutar un agente de código especializado en Apple Silicon sin necesidad de GPUs dedicadas; por otro, documenta métricas concretas de mejora sobre el modelo base en SWE-bench Pro (35,3% → 51,0%) y Terminal-Bench 2.1 (46,4% → 52,4%) con el modo thinking desactivado. La licencia Apache-2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer Qwen3.8-27B |
| Parametros totales | no disponible (adaptador de 638 MB; el modelo base tiene 27B según su denominación) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.8-27B) |
| Tipos de cuantizacion | adaptador en float32; builds merged disponibles en 4-bit, 6-bit, 8-bit y bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en layout mlx-lm (adaptador); builds merged en formato MLX |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 con alpha 64 (escala 2.0) aplicado sobre las proyecciones q, k, v y o de las 16 capas de atención completa, y sobre gate, up y down de las 64 capas del transformer subyacente. En total genera 256 módulos LoRA. Los pesos se han convertido desde el fichero original de harness-hub manteniendo los valores float32 y transponiéndolos al layout de mlx-lm, de modo que cada actualización equivale exactamente a `2.0 · B @ A` respecto al original.

El entrenamiento lo realizó harness-hub con aprendizaje por refuerzo usando AsyncGRPO en TRL, orientado a que el modelo funcione como motor del agente OpenCode en tareas de ingeniería de software y terminal. NetProjects no reentrena ni modifica los pesos: solo realiza la conversión de formato y verifica la equivalencia numérica. La model card no detalla la composición del dataset ni el número de tokens de entrenamiento; esa información queda remitida a la card del adaptador original.

## Capacidades

- Generación de texto conversacional y razonamiento sobre el modelo base Qwen3.8-27B.
- Especialización en tareas de agente de programación: edición de código, resolución de issues y operaciones en terminal.
- Soporte de tool calling y function calling, verificado en la card con una llamada a herramienta bien formada bajo plantilla de chat y thinking desactivado.
- Capacidad multimodal heredada del modelo base (pipeline `image-text-to-text`).
- Modo thinking desactivable mediante `enable_thinking: false` en la plantilla de chat; con thinking off iguala al modelo base con thinking a máximo esfuerzo generando aproximadamente un sexto de los tokens.
- Ejecución nativa en Apple Silicon mediante MLX.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agente de código en local sobre Mac: cargar el adaptador con `mlx_lm.server` y conectarlo a OpenCode para tareas de edición y refactorización, aprovechando la mejora medida en SWE-bench Pro sin depender de GPUs NVIDIA.
- Automatización de terminal: el adaptador está entrenado específicamente para tareas de terminal (Terminal-Bench 2.1), por lo que encaja en flujos de ejecución de comandos, diagnóstico de errores y scripts de shell.
- Resolución de issues en repositorios: usar el modelo como backend de un agente que lee el repositorio, localiza el fallo y propone un parche, con la ventaja de generar muchas menos tokens que el base en modo thinking.
- Asistente de CI/CD: integrar el servidor mlx-lm en un runner macOS para tareas de revisión de parches, generación de tests o análisis de logs de build.
- Prototipado de agentes multi-paso: al poder activar y desactivar el adaptador sobre el mismo modelo base, sirve para comparar comportamiento especializado frente a genérico en el mismo entorno.
- Investigación en RL para agentes: el adaptador y sus métricas publicadas permiten reproducir experimentos de AsyncGRPO sobre Qwen3.8-27B en hardware Apple.
- Despliegue con cuantización ajustada: usar las builds merged de 4-bit (16,3 GB) o 6-bit (23,1 GB) cuando no se quiera gestionar el adaptador por separado.

## Benchmarks y rendimiento

Resultados publicados por harness-hub, medidos bajo OpenCode con thinking desactivado:

| Benchmark | Modelo base | Con adaptador |
|---|---|---|
| SWE-bench Pro (hard 51) | 35,3% | 51,0% |
| Terminal-Bench 2.1 | 46,4% | 52,4% |

Calidad de las builds merged respecto a bf16 (publicadas por NetProjects):

| Build | Tamano | Mismo siguiente token que bf16 | KL vs bf16 |
|---|---|---|---|
| 6-bit (recomendada) | 23,1 GB | 98,7% | 0,0014 |
| 8-bit | 30,0 GB | 99,2% | 0,0004 |
| 4-bit | 16,3 GB | 96,7% | 0,0203 |
| bf16 | 55,6 GB | referencia | referencia |

## Requisitos de hardware

- Entorno verificado: MacBook Pro M5 Max con 128 GB de memoria unificada, mlx 0.32.4 y mlx-lm 0.32.2.
- El adaptador solo ocupa 638 MB, pero requiere cargar el modelo base completo: con la build de 4-bit el consumo ronda los 16,3 GB más overhead; con 6-bit, 23,1 GB; con 8-bit, 30,0 GB; con bf16, 55,6 GB.
- Cabe en Apple Silicon de gama alta con memoria unificada suficiente: 4-bit en equipos de 24 GB o más, 6-bit en 32 GB o más, 8-bit en 36 GB o más y bf16 en 64 GB o más (estimación a partir de los tamaños publicados, no confirmada por el autor).
- No está pensado para GPUs NVIDIA: la librería es MLX y el formato de pesos es específico de mlx-lm.
- Opciones de despliegue: `mlx_lm.generate`, API Python de `mlx_lm` y `mlx_lm.server` para servir el modelo a OpenCode.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B-opencode-adapted (este adaptador) | 27B (base) + LoRA r32 | no disponible | Agente de código y terminal | Apache-2.0 | MLX (adaptador) |
| Qwen3.8-27B (base) | 27B | no disponible | Generalista multimodal | Apache-2.0 | safetensors, MLX, GGUF según build |
| Adaptador original harness-hub | 27B (base) + LoRA r32 | no disponible | Agente de código y terminal | Apache-2.0 | formato original (no MLX) |

No se dispone de datos de benchmarks de terceros para establecer comparaciones con otros modelos de código de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autónomo: requiere descargar y cargar una build MLX de Qwen3.8-27B, lo que multiplica el espacio en disco y la memoria necesaria.
- Solo funciona en Apple Silicon con MLX; no es portable a vLLM, TGI, llama.cpp ni Ollama.
- El adaptador está entrenado para el agente OpenCode y tareas de terminal; su uso fuera de ese dominio puede degradar el rendimiento respecto al modelo base.
- La card recomienda mantener thinking desactivado: los resultados publicados se obtuvieron en ese modo.
- Riesgo de alucinación de código y comandos heredado del modelo base; no se documentan evaluaciones de seguridad ni de sesgo.
- Idiomas soportados no declarados; el comportamiento multilingüe depende del modelo base.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente.
- La licencia Apache-2.0 permite uso comercial, pero el usuario debe conservar el fichero `NOTICE` y la atribución a harness-hub y al equipo de Qwen (Alibaba Cloud).
- NetProjects declara no estar afiliado a Hugging Face, harness-hub ni Alibaba.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-adapter
- Adaptador original: https://huggingface.co/harness-hub/Qwen3.8-27B-opencode-adapted
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Build merged 6-bit (recomendada): https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-6bit
- Build merged 8-bit: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-8bit
- Build merged 4-bit: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-4bit
- Build merged bf16: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-bf16
- OpenCode: https://opencode.ai
- Perfil de NetProjects en Hugging Face: https://huggingface.co/netprojects
- Sitio de NetProjects: https://netprojects.com
