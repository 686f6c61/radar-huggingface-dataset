# arthurclement/Qwen3.8-27B-opencode-adapted-mlx-6bit

## Resumen

Qwen3.8-27B-opencode-adapted-mlx-6bit es un modelo de lenguaje de 27.000 millones de parametros derivado de Qwen/Qwen3.8-27B, adaptado por harness-hub mediante aprendizaje por refuerzo (GRPO) dentro del harness de agente OpenCode y posteriormente empaquetado en formato MLX de 6 bits por arthurclement para su ejecucion en Apple Silicon. El modelo base es un transformer denso con arquitectura hibrida que combina Gated DeltaNet y atencion clasica, con una ventana de contexto de 256.000 tokens.

El objetivo del adaptador es convertir el modelo base en un agente de programacion mas eficaz dentro de OpenCode: mayor tasa de exito en tareas, menos llamadas a herramientas y respuestas mas concisas. Este repositorio concreto no reentrena nada: fusiona el LoRA del adaptador en los pesos BF16 del modelo base, cuantiza a MLX affine de 6 bits con grupo de tamano 64 y anade la cabeza MTP (multi-token prediction) del catalogo Kapitsa para permitir decodificacion especulativa en Mac.

Es relevante porque demuestra un patron practico de adaptacion de modelos al harness de agente concreto en el que se van a desplegar, y porque ofrece un artefacto listo para usar en equipos Apple Silicon con un rendimiento medido de hasta 80 tok/s con decodificacion especulativa. La licencia Apache-2.0 se hereda tanto del modelo base como del adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso hibrido Gated DeltaNet / atencion |
| Parametros totales | 27B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | MLX affine 6-bit, group size 64 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), mas `mtp.safetensors` y `mtplx_runtime.json` para Kapitsa |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27.000 millones de parametros con una arquitectura hibrida que mezcla capas Gated DeltaNet (un tipo de atencion lineal con estado recurrente) y capas de atencion clasica. Soporta 256.000 tokens de contexto y dispone de una cabeza MTP (multi-token prediction) que permite decodificacion especulativa.

Sobre ese base, harness-hub entreno un adaptador LoRA (r=32, alpha=64, aplicado a todas las proyecciones lineales) mediante aprendizaje por refuerzo con GRPO dentro del harness OpenCode, con el objetivo de optimizar la tasa de exito en tareas de agente y reducir el numero de llamadas a herramientas y la longitud de las respuestas. El proceso de empaquetado de este repositorio fusiona ese LoRA en los pesos BF16 con `W' = W + (alpha / r) · B·A` calculado en float32, cuantiza con `mlx_lm.convert -q --q-bits 6 --q-group-size 64` y copia la cabeza MTP y la configuracion de runtime del catalogo Kapitsa. La cabeza MTP no fue reentrenada con el adaptador.

## Capacidades

- Generacion de texto y razonamiento en ingles.
- Programacion agéntica multi-paso dentro de OpenCode: correccion de bugs en repositorios, hacer pasar tests, trabajo en terminal.
- Tool calling / function calling, con reduccion del numero de llamadas y de bucles respecto al modelo base.
- Razonamiento multi-paso orientado a tareas de agente.
- Modo thinking disponible en el modelo base, aunque el adaptador fue entrenado y evaluado con `enable_thinking: false`; se recomienda desactivarlo.
- Decodificacion especulativa mediante cabeza MTP y, opcionalmente, drafter DFlash2 del catalogo Kapitsa.
- Capacidades multilingues: solo se declara ingles.
- Vision: no probada; el uso previsto es solo texto.

## Casos de uso

- Reparacion de bugs en repositorios: el modelo puede recorrer un arbol de codigo, ejecutar tests y aplicar parches dentro del bucle de OpenCode, aprovechando su entrenamiento especifico en ese harness para reducir iteraciones fallidas.
- Automatizacion de tareas de terminal: ejecucion de comandos, lectura de salidas y correccion de errores en cadena, con menos llamadas a herramientas que el modelo base.
- Integracion en flujos de CI/CD como agente de correccion: dado un fallo de build o de tests, el modelo inspecciona logs, localiza el fichero afectado y propone o aplica el cambio.
- Asistente de programacion local en Mac: con ~25,7 GB de memoria en carga y 60-100 tok/s en sesiones reales de 25-62K tokens, es viable en un MacBook Pro con 64 GB para trabajo interactivo sin depender de la nube.
- Generacion de Dockerfiles y configuracion de despliegue multi-etapa: tareas de codigo estructurado y acotado donde el modelo rinde bien sin necesidad de conocimiento factual adicional.
- Sesiones de agente con contexto largo: la ventana de 256K tokens permite mantener en contexto repositorios medianos o historiales extensos de herramientas durante una sesion de depuracion.
- Evaluacion de adaptadores por harness: sirve como referencia para comparar el efecto de adaptar un modelo al harness concreto frente al modelo base en las mismas condiciones.

## Benchmarks y rendimiento

Resultados reportados por harness-hub para el adaptador original en BF16, OpenCode 2.2.7, thinking off, pass@1:

| Benchmark | Base | Adaptador |
|---|---|---|
| SWE-bench Pro (51 tareas dificiles) | 35,3% | 51,0% |

Rendimiento medido en MacBook Pro M5 Max (GPU de 40 nucleos, 64 GB, Kapitsa 0.2.40), prompt corto de 28 tokens y ~280 tokens de salida, thinking off:

| Decodificacion | tok/s | Tokens aceptados por paso |
|---|---|---|
| Plana | ~21 | 1 |
| Cabeza MTP | 63 | 3,7 |
| MTP + DFlash2 (catalogo) | 80 | 4,2 |

En sesiones reales de OpenCode (25-62K tokens de contexto, mayoritariamente tool calls): 60-100 tok/s y 4-5 tokens por paso. El procesamiento de prompt en fallos de cache se situa en ~400-560 tok/s. Este repositorio no ha sido reevaluado en los benchmarks de los autores; la fusion y la cuantizacion a 6 bits pueden alterar los resultados.

## Requisitos de hardware

- Memoria en carga: ~25,7 GB segun Kapitsa.
- Apple Silicon con al menos 32 GB de memoria unificada; en un Mac de 64 GB se observan avisos de presion de memoria por encima de ~50K tokens de contexto con otras aplicaciones abiertas.
- GPU recomendada: Apple Silicon (M-series). No se documenta soporte para CUDA en este repositorio, que es especifico de MLX.
- Cabe en GPU de consumo Apple Silicon de gama alta; no hay datos para GPUs NVIDIA consumer.
- Despliegue: Kapitsa (recomendado en Apple Silicon), `mlx_lm.generate`, `mlx_lm.server` o cualquier servidor compatible con la API de OpenAI.
- Latencia y throughput: 21 tok/s en decodificacion plana, 63 tok/s con cabeza MTP y 80 tok/s con MTP + DFlash2 en M5 Max; 60-100 tok/s en sesiones reales de OpenCode.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-opencode-adapted-mlx-6bit (este) | 27B denso | 256K | Agente de codigo en OpenCode, MLX 6-bit | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.8-27B (base) | 27B denso | 256K | Modelo generalista | Apache-2.0 | Hugging Face |
| harness-hub/Qwen3.8-27B-opencode-adapted | 27B denso | 256K | Adaptador LoRA sin fusionar, BF16 | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks de terceros para establecer comparaciones cuantitativas con modelos de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- No ha sido reevaluado en los benchmarks de los autores: la fusion del LoRA y la cuantizacion a 6 bits pueden degradar los resultados reportados.
- El adaptador ensena el harness, no hechos nuevos: no mejora el conocimiento de APIs de librerias ni de versiones de herramientas.
- No mejora la generacion de codigo one-shot fuera de un bucle de agente.
- Sin ganancia observada en tareas alejadas de la distribucion de entrenamiento (harness-hub no vio mejora en AutomationBench).
- En problemas muy dificiles, el modelo base con thinking activado sigue puntuando por encima del adaptador en SWE-bench Pro.
- Especifico para OpenCode: en otros harnesses (Pi, Hermes, Claude Code) debe usarse el adaptador correspondiente de harness-hub.
- Solo declara ingles; el rendimiento en castellano no esta documentado.
- Vision no probada; uso previsto solo texto.
- La cabeza MTP no fue reentrenada con el adaptador; su aceptacion tras la fusion es buena segun el autor, pero no hay evaluacion formal.
- Riesgo de alucinacion y sesgos del modelo base no documentados en la informacion disponible.
- Licencia Apache-2.0 permite uso comercial, pero deben respetarse las condiciones de los trabajos derivados (modelo base y adaptador).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/arthurclement/Qwen3.8-27B-opencode-adapted-mlx-6bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Adaptador original: https://huggingface.co/harness-hub/Qwen3.8-27B-opencode-adapted
- Blog de harness-hub: https://huggingface.co/blog/harness-adapters-at-scale
- OpenCode: https://opencode.ai
- Kapitsa: https://github.com/nace-ai/kapitsa
- mlx-lm: https://github.com/ml-explore/mlx-lm
