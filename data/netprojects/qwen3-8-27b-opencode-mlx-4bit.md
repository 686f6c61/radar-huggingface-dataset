# netprojects/Qwen3.8-27B-opencode-MLX-4bit

## Resumen

Qwen3.8-27B-opencode-MLX-4bit es una cuantizacion de 4 bits en formato MLX del modelo Qwen3.8-27B de Alibaba, sobre el que se ha fusionado un adaptador LoRA entrenado por harness-hub para funcionar como motor del agente de programacion OpenCode. El resultado es un modelo de 27.781 millones de parametros (27,8B) con capacidades multimodales (image-text-to-text), pensado para ejecutarse localmente en Apple Silicon. Esta build concreta, publicada por netprojects, ocupa 16,3 GB y es la variante mas pequena de la familia de cuantizaciones MLX disponibles (4, 6, 8 bits y bf16).

El modelo resuelve un problema concreto: desplegar un agente de codificacion capaz de resolver tareas de ingenieria de software y de terminal en un portatil Mac, sin depender de la nube. El adaptador se entreno con aprendizaje por refuerzo (AsyncGRPO en TRL) y, segun los datos publicados por el autor del adaptador, mejora al modelo base en SWE-bench Pro (hard 51) del 35,3% al 51,0% y en Terminal-Bench 2.1 del 46,4% al 52,4%, con el modo thinking desactivado.

La relevancia de esta build esta en el equilibrio entre tamano y fidelidad: es la opcion de menor huella (16,3 GB), aunque tambien la que mas se aleja del bf16 de referencia (96,7% de coincidencia en el siguiente token y KL de 0,0203 frente a bf16). Incorpora la capa MTP (multi-token prediction) original de Qwen3.8-27B cuantizada, lo que permite decodificacion especulativa integrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de Qwen3.8-27B, con 64 capas y 16 capas de atencion completa; incluye capa MTP |
| Parametros totales | 27.781.427.952 (27,8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine, group size 64 (capas lineales); build disponible tambien en 6-bit, 8-bit y bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con `model-mtp.safetensors` para la capa MTP |
| Tamano del repositorio | 16,3 GB |
| Libreria | mlx (mlx-lm >= 0.32.2, mlx-vlm >= 0.7.11) |
| Modelo base | harness-hub/Qwen3.8-27B-opencode-adapted (revision b4171c0) sobre Qwen/Qwen3.8-27B (revision 3756181) |
| Fidelidad vs bf16 | 96,7% mismo siguiente token; KL 0,0203 |
| Plataforma objetivo | Apple Silicon |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.8-27B: un transformer multimodal con 64 capas, de las cuales 16 son de atencion completa, y con un encoder de vision integrado. Sobre ese modelo se fusiono el adaptador LoRA de harness-hub, que afecta a 256 modulos adaptados (q, k, v, o en las 16 capas de atencion completa; gate, up, down en las 64 capas). La fusion se verifico elemento a elemento como `W + 2.0 · B @ A` redondeado a bf16, y el resto de tensores (incluido el encoder de vision) permanece identico al modelo base. El adaptador no modifica la capa MTP.

El entrenamiento del adaptador se realizo con aprendizaje por refuerzo mediante AsyncGRPO en TRL, orientado a tareas de ingenieria de software y de terminal dentro del agente OpenCode. La innovacion tecnica destacable de esta build es la conservacion de la capa MTP de Qwen3.8-27B cuantizada al mismo nivel que el resto, lo que permite usarla como modelo borrador integrado para decodificacion especulativa. Segun las mediciones del autor, MTP acelera la decodificacion aproximadamente 1,9x en esta build de 4 bits (de 33 tok/s a 62 tok/s) sin descarga adicional. Tambien es compatible con el drafter DSpine b16.

## Capacidades

- Generacion de texto y razonamiento general, heredados de Qwen3.8-27B.
- Generacion y correccion de codigo, con especial enfasis en tareas de ingenieria de software y resolucion de bugs en repositorios.
- Operacion en terminal: ejecucion e interpretacion de comandos, diagnostico de fallos de tests y aplicacion de parches.
- Vision: entrada de imagenes (pipeline image-text-to-text), util para interpretar capturas de pantalla de terminal o errores visuales.
- Tool calling / function calling en formato XML de Qwen (`<tool_call><function=...><parameter=...>`), expuesto como `tool_calls` de OpenAI por el servidor de mlx-lm.
- Modo thinking configurable; el adaptador se entreno y evaluo con thinking desactivado y se recomienda mantenerlo apagado.
- Decodificacion especulativa mediante MTP integrado o drafter DSpine.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Agente de codificacion local en OpenCode: el modelo se sirve con `mlx_lm.server` y se conecta como proveedor OpenAI-compatible, permitiendo lanzar tareas como localizar y corregir tests fallidos sin salir del portatil.
- Correccion de bugs en repositorios reales: con el adaptador entrenado en SWE-bench Pro, es adecuado para tareas de parcheo de codigo en las que hay que leer contexto del repositorio, identificar la causa y proponer un diff.
- Automatizacion de tareas de terminal: interpretar la salida de comandos, diagnosticar errores y encadenar pasos multi-turno dentro de un agente.
- Analisis de capturas de pantalla de errores: gracias al encoder de vision, puede recibir una imagen de una terminal con un fallo y describir o razonar sobre el error.
- Asistente de desarrollo en equipos con requisitos de privacidad: al ejecutarse en local sobre Apple Silicon, el codigo no sale del dispositivo, lo que encaja en entornos con restricciones de confidencialidad.
- Prototipado rapido de pipelines de agentes: el soporte de tool calling en formato OpenAI y la compatibilidad con mlx-lm facilitan integrarlo en frameworks de agentes existentes.
- Evaluacion de cuantizaciones: util para comparar el impacto de 4 bits frente a 6 y 8 bits en tareas de codigo, dado que el autor publica metricas de fidelidad (96,7% de coincidencia y KL 0,0203).

## Benchmarks y rendimiento

Resultados publicados por harness-hub para el adaptador (OpenCode, thinking desactivado):

| Benchmark | Modelo base | Con adaptador |
|---|---|---|
| SWE-bench Pro (hard 51) | 35,3% | 51,0% |
| Terminal-Bench 2.1 | 46,4% | 52,4% |

Rendimiento de decodificacion medido por netprojects (greedy, thinking off, 5 prompts x 256 tokens, MacBook Pro M5 Max de 128 GB, con otros servicios en ejecucion; valores indicativos):

| Build | Sin MTP | Con MTP (mlx-vlm 0.7.11) |
|---|---|---|
| 4-bit | 33 tok/s | 62 tok/s (x1,91) |
| 6-bit | 20 tok/s | 21 tok/s (x1,04) |
| 8-bit | 17 tok/s | 37 tok/s (x2,15) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para esta build cuantizada en la informacion disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: al menos 16,3 GB solo para los pesos; con overhead de MLX y contexto conviene disponer de 24 GB o mas de memoria unificada.
- Plataforma: exclusivamente Apple Silicon (MLX). No es ejecutable en GPU NVIDIA ni en CPU x86 con esta build.
- Equipo de referencia del autor: MacBook Pro con chip M5 Max y 128 GB de memoria unificada.
- Cabe en Mac con 32 GB o mas de memoria unificada; en equipos de 24 GB el margen es ajustado y puede requerir reducir el contexto.
- Despliegue: `mlx_lm.server` (servidor compatible con OpenAI) para texto; `mlx_vlm.generate` para entradas con imagen; integracion con OpenCode mediante proveedor OpenAI-compatible.
- Decodificacion especulativa: pasar el mismo repositorio como `--draft-model` con `--draft-kind mtp`, o usar el drafter DSpine b16.
- Throughput estimado: 33 tok/s sin MTP y 62 tok/s con MTP en M5 Max de 128 GB (mediciones indicativas).
- Alternativas de mayor fidelidad si la memoria lo permite: 6-bit (23,1 GB, recomendada por el autor) y 8-bit (30,0 GB).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Licencia | Notas |
|---|---|---|---|---|---|---|
| netprojects/Qwen3.8-27B-opencode-MLX-4bit | 27,8B | no disponible | 4-bit | 16,3 GB | Apache 2.0 | 96,7% coincidencia con bf16; KL 0,0203 |
| netprojects/Qwen3.8-27B-opencode-MLX-6bit | 27,8B | no disponible | 6-bit | 23,1 GB | Apache 2.0 | 98,7% coincidencia; KL 0,0014; recomendada por el autor |
| netprojects/Qwen3.8-27B-opencode-MLX-8bit | 27,8B | no disponible | 8-bit | 30,0 GB | Apache 2.0 | 99,2% coincidencia; KL 0,0004 |
| netprojects/Qwen3.8-27B-opencode-MLX-bf16 | 27,8B | no disponible | bf16 | 55,6 GB | Apache 2.0 | Referencia de fidelidad |
| harness-hub/Qwen3.8-27B-opencode-adapted | 27,8B | no disponible | LoRA sin fusionar | no disponible | Apache 2.0 | Adaptador original; requiere modelo base |

No se dispone de datos de comparacion con modelos de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 4 bits es la de menor fidelidad de la familia: solo el 96,7% de los siguientes tokens coinciden con bf16 y la divergencia KL es de 0,0203, muy superior a la de 6 y 8 bits. Para tareas sensibles a la precision puede degradar resultados frente a la build de 6 u 8 bits.
- El adaptador se entreno y evaluo con thinking desactivado; usarlo con thinking activado puede producir un comportamiento distinto al esperado. El autor recomienda mantenerlo apagado.
- La decodificacion especulativa con MTP puede divergir del texto de la decodificacion normal en respuestas largas cuando hay empates cercanos en la distribucion.
- Exclusividad de plataforma: requiere Apple Silicon y la libreria MLX; no es portable a CUDA ni a llama.cpp/Ollama con esta build.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas de codigo donde puede inventar APIs o rutas de fichero inexistentes; conviene validar los parches generados.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Idiomas soportados: no disponible; no se puede confirmar el rendimiento fuera del ingles sin datos.
- Longitud de contexto: no disponible, lo que impide planificar tareas de repositorios grandes con garantias.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3.8-27B conviene verificar las condiciones del modelo base y del adaptador original.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion de la comunidad sobre esta build concreta.

## Enlaces

- Hugging Face (esta build): https://huggingface.co/netprojects/Qwen3.8-27B-opencode-MLX-4bit
- Build 6-bit: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-MLX-6bit
- Build 8-bit: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-MLX-8bit
- Build bf16: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-MLX-bf16
- Adaptador LoRA MLX: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-MLX-adapter
- Drafter DSpine b16 MLX: https://huggingface.co/netprojects/Qwen3.8-27B-DSpine-b16-MLX
- Repositorio dspine-hybrid-mlx: https://github.com/internet-projects/dspine-hybrid-mlx
- Adaptador original: https://huggingface.co/harness-hub/Qwen3.8-27B-opencode-adapted
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- OpenCode: https://opencode.ai
