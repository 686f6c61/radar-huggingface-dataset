# netprojects/Qwen3.8-27B-pi-adapted-MLX-2.5bit

## Resumen

Qwen3.8-27B-pi-adapted-MLX-2.5bit es una compilación cuantizada a 2,5 bits del modelo Qwen3.8-27B de Alibaba Qwen, adaptado mediante un LoRA entrenado con aprendizaje por refuerzo (AsyncGRPO en TRL) por harness-hub para funcionar como el modelo subyacente del agente de programación pi (earendil-works/pi). El autor de esta compilación es el usuario netprojects, que ha convertido los pesos a formato MLX para su ejecución nativa en Apple Silicon, ha eliminado el codificador visual (build solo de texto) y ha conservado la capa de predicción multi-token (MTP) del modelo original cuantizada a 4 bits.

El modelo parte de Qwen3.8-27B, un transformer denso de 27.745.371.136 parámetros (unos 27,7 mil millones) con atención híbrida que incluye proyecciones de atención lineal Gated DeltaNet. La adaptación LoRA de harness-hub se orientó a tareas de ingeniería de software y terminal, y según los resultados publicados por dicho autor mejora Terminal-Bench 2.1 del 39,5 % al 55,8 % y SWE-bench Pro (hard 51) del 29,4 % al 62,7 % frente al modelo base, con entre un 55 % y un 64 % menos de llamadas a herramientas por tarea.

La relevancia de esta compilación concreta reside en su reducido tamaño (11,8 GB) y en su capacidad para ejecutarse en Macs con 24 GB de memoria unificada, lo que permite desplegar localmente un agente de código de 27B en hardware de consumo Apple. El precio de esa compresión es una fidelidad limitada: solo el 85,5 % de los tokens siguientes coinciden con la versión bf16 y la divergencia KL media frente a bf16 es de 0,2363, muy superior a la de las compilaciones de 4, 6 y 8 bits del mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (atención completa + atención lineal Gated DeltaNet) y capa MTP, según el modelo base Qwen3.8-27B |
| Parametros totales | 27.745.371.136 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine con grupo de 64: proyecciones gate y up del MLP a 2 bits, proyecciones down a 3 bits, proyecciones de atención y de atención lineal (Gated DeltaNet) a 4 bits, embedding de tokens y capa de salida a 4 bits; capa MTP a 4 bits; media aproximada de 3,65 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (librería mlx); incluye `model-mtp.safetensors` para la capa MTP |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.8-27B: un transformer denso de aproximadamente 27,7 mil millones de parámetros que combina capas de atención completa con capas de atención lineal Gated DeltaNet, e incorpora una capa de predicción multi-token (MTP) que actúa como modelo borrador para decodificación especulativa. Sobre ese modelo base, harness-hub aplicó un LoRA entrenado con aprendizaje por refuerzo mediante AsyncGRPO en la librería TRL, orientado a tareas de ingeniería de software y de terminal dentro del agente pi. El adaptador no modifica la capa MTP. Esta compilación concreta fusiona el LoRA en los pesos base (revisiones `e786f84` del adaptador y `3756181` del modelo Qwen), convierte el resultado a MLX con mlx-vlm y elimina el codificador visual, por lo que es un build exclusivamente de texto.

La cuantización es afín con grupo de 64 y anchos de bits heterogéneos por tipo de proyección, con una media de 3,65 bits por peso. El autor verificó que el build es exactamente la cuantización afín del build bf16 y midió la fidelidad sobre 12 prompts cortos (9 con thinking desactivado y 3 con thinking activado, 961 posiciones en modo teacher forcing): el 85,5 % de las posiciones producen el mismo token siguiente que bf16, con una KL media de 0,2363. El tokenizador y la plantilla de chat son los de harness-hub sin cambios, con el mismo vocabulario y el mismo formato de llamadas a herramientas que Qwen3.8-27B (XML de Qwen, `<tool_call><function=...><parameter=...>`), que el servidor de mlx-lm devuelve como `tool_calls` de OpenAI.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno en formato Chat Completions.
- Programación y resolución de tareas de ingeniería de software: el adaptador se entrenó específicamente para el agente pi en tareas de software y terminal.
- Uso de herramientas (tool calling / function calling) en el formato XML de Qwen, expuesto como `tool_calls` de OpenAI por el servidor de mlx-lm; verificado con un prompt de estilo agente con herramientas `bash` y `read`.
- Comportamiento agéntico multi-paso orientado a terminal y a reparación de bugs, con reducción de llamadas a herramientas por tarea según los datos del autor del adaptador.
- Decodificación especulativa mediante la capa MTP integrada, usable como modelo borrador con `--draft-kind mtp` en mlx-vlm.
- Modo thinking disponible en la plantilla de chat, aunque el adaptador se entrenó y evaluó con thinking desactivado y el autor recomienda mantenerlo apagado.
- Sin capacidades de visión: el codificador visual se ha eliminado en este build.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agente de programación local en macOS: servir el modelo con `mlx_lm.server` y conectarlo a pi mediante un proveedor local con `"api": "openai-completions"`, de modo que el agente ejecute tareas de terminal y edición de código sin salir del equipo. Es adecuado porque el adaptador se entrenó y evaluó exactamente en ese entorno y con esa API.
- Reparación de tests y bugs en un repositorio: lanzar pi con un prompt como «Find out why the tests in tests/test_parser.py fail and fix the bug», aprovechando el entrenamiento del adaptador en tareas de tipo SWE-bench Pro y la reducción de llamadas a herramientas por tarea.
- Automatización de tareas de shell: usar las herramientas `bash` y `read` a través del formato de tool calling de Qwen para inspeccionar ficheros, ejecutar comandos y encadenar pasos, con el servidor de mlx-lm traduciendo las llamadas a `tool_calls` de OpenAI.
- Asistente de código en el editor o en scripts de Python: cargar el modelo con `mlx_lm.load` y `mlx_lm.generate` para generar funciones (por ejemplo, un parser de cantidades como «1.5M» a bytes) en máquinas Apple con 24 GB de memoria unificada.
- Despliegue en Macs de 24 GB: al ocupar 11,8 GB, es una de las dos compilaciones del autor (junto con la de 3 bits) que cabe en equipos de 24 GB, lo que permite prototipar agentes de código en portátiles de gama media sin GPU dedicada.
- Aceleración de la decodificación en local: emplear la capa MTP como modelo borrador con `mlx_vlm.generate --draft-kind mtp` para reducir la latencia en respuestas largas, aceptando que en decodificación greedy el texto puede divergir ligeramente del decodificado plano en situaciones de casi empate.
- Evaluación comparativa de cuantizaciones: usar este build junto con los de 3, 4, 6 y 8 bits del mismo autor para medir el impacto de la compresión en tareas agénticas concretas antes de fijar una compilación en producción.

## Benchmarks y rendimiento

Resultados publicados por harness-hub para el adaptador, bajo el agente pi y con thinking desactivado, frente al modelo base:

| Benchmark | Modelo base | Con adaptador pi |
|---|---|---|
| Terminal-Bench 2.1 | 39,5 % | 55,8 % |
| SWE-bench Pro (hard 51) | 29,4 % | 62,7 % |
| Llamadas a herramientas por tarea | referencia | 55-64 % menos |

Fidelidad de las compilaciones MLX del autor frente a bf16 (12 prompts cortos, 961 posiciones en teacher forcing):

| Build | Tamano | Mismo token siguiente que bf16 | KL vs bf16 |
|---|---|---|---|
| MLX-8bit | 30,0 GB | 99,1 % | 0,0004 |
| MLX-6bit (recomendado) | 23,1 GB | 99,0 % | 0,0015 |
| MLX-4bit | 16,3 GB | 95,6 % | 0,0201 |
| MLX-3bit | 13,8 GB | 91,4 % | 0,0884 |
| MLX-2.5bit (esta ficha) | 11,8 GB | 85,5 % | 0,2363 |
| MLX-bf16 | 55,6 GB | referencia | referencia |

No se han publicado resultados de benchmarks de tareas (Terminal-Bench, SWE-bench) medidos específicamente sobre esta compilación de 2,5 bits en la información disponible; los datos de Terminal-Bench y SWE-bench Pro corresponden al adaptador sobre el que se construye.

## Requisitos de hardware

- VRAM/memoria unificada: el repositorio ocupa 11,8 GB; el autor indica que este build y el de 3 bits caben en Macs de 24 GB. Se recomienda dejar margen adicional para el contexto y la caché KV, cuyo tamaño no está especificado en la información disponible.
- GPU recomendadas: Apple Silicon exclusivamente (formato MLX); el build fue verificado en un MacBook Pro M5 Max de 128 GB con mlx 0.32.4, mlx-lm 0.32.2 y mlx-vlm 0.7.11.
- GPU de consumo: no es compatible con CUDA ni con GPUs NVIDIA (A100, H100, RTX 4090) en este formato; para esas plataformas habría que usar los pesos del adaptador o del modelo base en otro formato.
- Opciones de despliegue: `mlx_lm.server` (servidor compatible con OpenAI), `mlx_lm.load`/`mlx_lm.generate` desde Python, y `mlx_vlm.generate` con `--draft-kind mtp` para decodificación especulativa. Requiere mlx-lm >= 0.32.2.
- Latencia y throughput: no disponibles en la información proporcionada; el autor solo documenta el uso de MTP como aceleración cualitativa, sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / plataforma | Notas |
|---|---|---|---|---|---|
| netprojects/Qwen3.8-27B-pi-adapted-MLX-2.5bit | 27,7 B | no disponible | Apache 2.0 | MLX, 11,8 GB | 85,5 % de coincidencia con bf16; cabe en 24 GB |
| netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit | 27,7 B | no disponible | Apache 2.0 | MLX, 23,1 GB | 99,0 % de coincidencia con bf16; build recomendado por el autor |
| netprojects/Qwen3.8-27B-pi-adapted-MLX-4bit | 27,7 B | no disponible | Apache 2.0 | MLX, 16,3 GB | 95,6 % de coincidencia con bf16 |
| harness-hub/Qwen3.8-27B-pi-adapted | 27,7 B | no disponible | Apache 2.0 | Adaptador LoRA (638 MB en MLX) | Requiere un build MLX de Qwen3.8-27B; fidelidad de referencia |
| Qwen/Qwen3.8-27B (base) | 27,7 B | no disponible | Apache 2.0 | safetensors | Sin el entrenamiento RL para pi; peor rendimiento en Terminal-Bench y SWE-bench Pro según harness-hub |

No se dispone de datos para comparar con modelos de otros fabricantes de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de fidelidad notable: solo el 85,5 % de los tokens siguientes coinciden con bf16 y la KL media es de 0,2363, un orden de magnitud por encima de la compilación de 4 bits (0,0201) y dos por encima de la de 6 bits (0,0015). Para tareas agénticas sensibles a errores de formato o de sintaxis, el autor recomienda la compilación de 6 bits.
- El adaptador se entrenó y evaluó con thinking desactivado; usarlo con thinking activado queda fuera de la distribución de entrenamiento y el autor recomienda mantenerlo apagado.
- El adaptador se entrenó con la API Chat Completions, no con la API Responses; usar la API incorrecta puede degradar el comportamiento del agente.
- Build solo de texto: no procesa imágenes, aunque el modelo base Qwen3.8-27B tenga codificador visual.
- La decodificación con MTP puede divergir ligeramente del decodificado plano en decodificación greedy cuando hay casi empates, ya que la comprobación por lotes puede redondear al otro lado.
- Solo ejecutable en Apple Silicon mediante MLX; no hay pesos GGUF ni compatibilidad con vLLM, llama.cpp, Ollama o TGI en este repositorio.
- Sin datos publicados sobre sesgos, riesgo de alucinación, cobertura idiomática ni longitud de contexto en la información disponible; deben evaluarse antes de un uso en producción.
- Licencia Apache 2.0: permite uso comercial, pero se heredan las condiciones y avisos del modelo base Qwen3.8-27B y del adaptador de harness-hub, que conviene revisar.
- Modelo con 0 descargas y 0 likes en el momento de la consulta, creado el 19 de noviembre de 2026: no hay validación comunitaria independiente de esta compilación concreta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-2.5bit
- Modelo base del adaptador: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Build MLX de 6 bits (recomendado): https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit
- Build MLX de 8 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-8bit
- Build MLX de 4 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-4bit
- Build MLX de 3 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-3bit
- Build MLX bf16: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-bf16
- Adaptador LoRA en MLX: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-adapter
- Agente pi: https://github.com/earendil-works/pi
