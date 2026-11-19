# netprojects/Qwen3.8-27B-hermes-adapted-MLX-adapter

## Resumen

El repositorio `netprojects/Qwen3.8-27B-hermes-adapted-MLX-adapter` contiene un adaptador LoRA en formato mlx-lm para Apple Silicon, derivado del adaptador publicado por harness-hub sobre el modelo base Qwen3.8-27B. No es un modelo completo, sino un conjunto de pesos de adaptación (638 MB) que se aplica sobre cualquier build MLX de Qwen3.8-27B, lo que permite mantener una única copia del modelo base y activar o desactivar el adaptador segun la tarea.

El adaptador original fue entrenado por harness-hub mediante aprendizaje por refuerzo (AsyncGRPO implementado en TRL, LoRA de rango 32 y alpha 64) para actuar como el modelo subyacente del agente Hermes Agent en tareas de ingenieria de software y terminal. NetProjects se limita a convertir esos pesos al layout de mlx-lm (transposicion de los valores float32 originales) y a verificar que la actualizacion de cada modulo coincide exactamente con `2.0 · B @ A` del fichero original.

La relevancia practica del adaptador radica en que mejora de forma medible el rendimiento agente del modelo base reduciendo el coste en tokens: segun los resultados publicados por harness-hub, con el modo thinking desactivado, SWE-bench Pro (hard 51) pasa del 29,4 % al 43,1 % y Terminal-Bench 2.1 del 44,7 % al 58,8 %, usando menos del 40 % de los turnos del modelo base en las tareas que ambos resuelven y aproximadamente la mitad de tokens generados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador) sobre transformer Qwen3.8-27B; atencion completa en 16 capas y 64 capas totales |
| Parametros totales | no disponible (adaptador de 638 MB; el modelo base Qwen3.8-27B tiene 27B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3.8-27B) |
| Tipos de cuantizacion | adaptador en float32; builds merged disponibles en 4-bit, 6-bit, 8-bit y bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en layout mlx-lm (adaptador LoRA) |
| Rango LoRA / alpha | 32 / 64 (scale 2.0) |
| Modulos adaptados | q, k, v, o de las 16 capas de atencion completa; gate, up, down de las 64 capas |
| Libreria | mlx (mlx-lm >= 0.32.2) |
| Modelo base | harness-hub/Qwen3.8-27B-hermes-adapted (revision 09fb741), sobre Qwen/Qwen3.8-27B |
| Tamano del repo | 0,7 GB |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 con alpha 64 (scale 2.0) aplicado sobre las proyecciones q, k, v y o de las 16 capas de atencion completa del transformer, y sobre gate, up y down de las 64 capas del modelo. En total genera 256 modulos LoRA en mlx-lm. Los pesos se conservan en float32 y se han transpuesto al layout que espera mlx-lm, sin cambios numericos respecto al fichero original de harness-hub.

El entrenamiento original lo realizo harness-hub con aprendizaje por refuerzo mediante AsyncGRPO en TRL, con el objetivo de convertir el modelo en el motor de Hermes Agent para tareas de ingenieria de software y terminal. El checkpoint publicado corresponde al paso 160 de los 1000 planificados. NetProjects no ha reentrenado el adaptador: su aportacion es la conversion de formato, la verificacion de equivalencia numerica modulo a modulo y la publicacion de builds merged cuantizados (4, 6, 8 bits y bf16) con metricas de fidelidad frente a bf16.

## Capacidades

- Generacion de texto conversacional multi-turno sobre el modelo base Qwen3.8-27B.
- Ejecucion de tareas de agente en terminal: comandos de shell, edicion de ficheros, interpretacion de salida de comandos.
- Tareas de ingenieria de software: localizacion y correccion de bugs, parcheo de codigo, resolucion de issues (evaluado en SWE-bench Pro hard 51).
- Tool calling / function calling: la verificacion del autor confirma que el adaptador, con thinking desactivado, produce tool calls bien formados.
- Razonamiento multi-paso orientado a agentes, con preferencia por trayectorias cortas (menos turnos y menos tokens que el modelo base).
- Modo thinking desactivable mediante `enable_thinking` en la plantilla de chat; con thinking off rinde al nivel del base con esfuerzo xhigh.
- Capacidades de vision heredadas del pipeline image-text-to-text del modelo base (no verificadas de forma especifica para el adaptador en la informacion disponible).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Agente de terminal automatizado: integrado en Hermes Agent mediante `mlx_lm.server` con el adaptador cargado, el modelo ejecuta ciclos de inspeccion, edicion y verificacion sobre un repositorio local en un Mac, reduciendo turnos y tokens frente al base.
- Resolucion de issues en repositorios reales: adecuado para pipelines internos que reciben un issue y deben producir un parche verificable, dado el salto medido en SWE-bench Pro hard 51 (29,4 % a 43,1 %).
- Automatizacion de tareas de administracion de sistemas: generacion de one-liners de bash, scripts de conteo o limpieza de ficheros y diagnostico de salidas de comandos, aprovechando el entrenamiento especifico en Terminal-Bench 2.1.
- Asistente de codigo en local para desarrolladores con hardware Apple: al ejecutarse sobre MLX en Apple Silicon, permite mantener el codigo y los repositorios en la maquina sin enviar contexto a servicios externos.
- Sustitucion de modelo base en produccion con conmutacion por adaptador: mantener una sola copia de Qwen3.8-27B en 4-bit o 6-bit y activar el adaptador solo en flujos de agente, desactivandolo para generacion general.
- Evaluacion comparativa de agentes: el adaptador sirve como variante controlada frente al modelo base en experimentos de investigacion sobre eficiencia de tokens y numero de turnos en tareas de codigo.
- Despliegue en portatiles de gama alta: el build merged de 6 bits (23,1 GB) cabe en Mac con 36 GB o mas de memoria unificada, lo que habilita un agente de codigo local en un MacBook Pro.

## Benchmarks y rendimiento

Resultados publicados por harness-hub para el adaptador original, bajo Hermes Agent y con thinking desactivado:

| Benchmark | Modelo base | Con adaptador |
|---|---|---|
| SWE-bench Pro (hard 51) | 29,4 % | 43,1 % |
| Terminal-Bench 2.1 | 44,7 % | 58,8 % |

Metricas de fidelidad de los builds merged publicados por NetProjects:

| Build | Tamano | Mismo siguiente token que bf16 | KL vs bf16 | GSM8K (50 preguntas) | Memoria pico, prompt de 8K tokens | Memoria de Mac sugerida |
|---|---|---|---|---|---|---|
| MLX-6bit (recomendado) | 23,1 GB | 98,5 % | 0,0015 | 46/50 | 23,4 GB | 36 GB+ |
| MLX-8bit | 30,0 GB | 99,2 % | 0,0004 | 45/50 | 29,7 GB | 48 GB+ |
| MLX-4bit | 16,3 GB | 96,1 % | 0,0192 | 43/50 | 17,1 GB | 32 GB+ |
| MLX-bf16 | 55,6 GB | referencia | referencia | 45/50 | 53,4 GB | 96 GB+ |

Verificacion del adaptador: cargado sobre `mlx-community/Qwen3.8-27B-4bit` en un MacBook Pro M5 Max (128 GB) con mlx 0.32.4, mlx-lm 0.32.2 y mlx-vlm 0.7.11, genera 256 modulos LoRA con scale 2.0 y cada actualizacion coincide exactamente con `2.0 · B @ A` del fichero original. Con thinking off produjo un tool call bien formado y supero 3 de 3 tareas cortas de codigo.

## Requisitos de hardware

- El adaptador en si ocupa 638 MB; requiere ademas una build MLX del modelo base Qwen3.8-27B.
- Memoria pico del build 4-bit: 17,1 GB con prompt de 8K tokens; Mac con 32 GB o mas.
- Memoria pico del build 6-bit: 23,4 GB con prompt de 8K tokens; Mac con 36 GB o mas.
- Memoria pico del build 8-bit: 29,7 GB con prompt de 8K tokens; Mac con 48 GB o mas.
- Memoria pico del build bf16: 53,4 GB con prompt de 8K tokens; Mac con 96 GB o mas.
- Hardware exclusivo Apple Silicon (MLX); no hay soporte CUDA documentado en esta ficha.
- Despliegue: `mlx_lm.generate`, API Python `mlx_lm.load` con `adapter_path` y servidor `mlx_lm.server` para Hermes Agent.
- Requiere mlx-lm >= 0.32.2; verificado con mlx 0.32.4, mlx-lm 0.32.2 y mlx-vlm 0.7.11.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento agente | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-hermes-adapted (adaptador MLX, este repo) | 27B (base) + LoRA r32 | no disponible | SWE-bench Pro hard 51: 43,1 %; Terminal-Bench 2.1: 58,8 % | Apache-2.0 | Hugging Face, formato MLX |
| Qwen3.8-27B (base) | 27B | no disponible | SWE-bench Pro hard 51: 29,4 %; Terminal-Bench 2.1: 44,7 % | Apache-2.0 | Hugging Face |
| Builds merged del mismo adaptador (4/6/8-bit, bf16) | 27B | no disponible | GSM8K 43-46/50 segun cuantizacion | Apache-2.0 | Hugging Face |
| Otros modelos de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo autonomo: requiere descargar y cargar una build MLX de Qwen3.8-27B; el adaptador por si solo no genera nada.
- El checkpoint publicado corresponde al paso 160 de 1000 planificados, por lo que el entrenamiento RL original no esta completado.
- El adaptador esta especializado en tareas de agente de codigo y terminal; su uso para generacion general puede degradar el comportamiento respecto al modelo base, por lo que conviene conmutarlo segun la tarea.
- La cuantizacion a 4 bits reduce la fidelidad (96,1 % de mismo siguiente token, KL 0,0192, 43/50 en GSM8K) frente a bf16; para produccion se recomienda 6 bits u 8 bits.
- Riesgo de alucinacion inherente al modelo base en generacion de codigo y comandos; los parches y comandos deben validarse antes de aplicarse en sistemas reales.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Idiomas soportados: no disponibles; no se ha verificado el comportamiento multilingue del adaptador.
- Capacidades de vision: el pipeline declarado es image-text-to-text, pero no se han verificado de forma especifica para este adaptador.
- Dependencia de hardware Apple Silicon: no hay ruta de despliegue CUDA, ROCm ni TPU documentada para este formato.
- Licencia Apache-2.0 permite uso comercial, pero el autor declara no estar afiliado a Hugging Face, harness-hub ni Alibaba; conviene revisar el fichero NOTICE y los terminos del modelo base.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion independiente por parte de la comunidad.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-adapter
- Adaptador original de harness-hub: https://huggingface.co/harness-hub/Qwen3.8-27B-hermes-adapted
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Build merged 6 bits (recomendado): https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-6bit
- Build merged 8 bits: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-8bit
- Build merged 4 bits: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-4bit
- Build merged bf16: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-bf16
- Hermes Agent (NousResearch): https://github.com/NousResearch/hermes-agent
- Perfil de NetProjects en Hugging Face: https://huggingface.co/netprojects
- Sitio de NetProjects: https://netprojects.com
