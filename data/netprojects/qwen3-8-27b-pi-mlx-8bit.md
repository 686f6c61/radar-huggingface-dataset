# netprojects/Qwen3.8-27B-pi-MLX-8bit

## Resumen

Qwen3.8-27B-pi-MLX-8bit es una cuantización en 8 bits para Apple Silicon (formato MLX) del modelo Qwen3.8-27B de Qwen, fusionado con un adaptador LoRA entrenado por harness-hub para convertir al modelo en el motor del agente de programación `pi`. El adaptador se entrenó con aprendizaje por refuerzo (AsyncGRPO en TRL) sobre tareas de ingeniería de software y terminal, y este build lo integra en los pesos base y lo convierte a MLX con mlx-vlm, incluyendo el codificador de visión y la capa MTP original de Qwen.

El modelo resuelve el problema de disponer de un agente de código local, con visión y tool calling, ejecutable en un Mac con Apple Silicon sin depender de APIs externas. Con 27.781.427.952 parámetros (27,8 mil millones) y un repositorio de 30,0 GB, es la variante de 8 bits de una familia que incluye builds de 4, 6 y 16 bits (bf16), siendo la de 8 bits la más fiel al modelo original en precisión (99,1 % de coincidencia en el siguiente token y KL de 0,0004 frente a bf16).

Su relevancia actual radica en que demuestra que un ajuste fino con RL sobre un modelo denso de ~28B puede mejorar sustancialmente el rendimiento agéntico: según el autor, Terminal-Bench 2.1 pasa del 39,5 % al 55,8 % y SWE-bench Pro (hard 51) del 29,4 % al 62,7 %, con un 55-64 % menos de llamadas a herramientas por tarea. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención completa en 16 capas y capas Gated DeltaNet, más codificador de visión y capa MTP (multi-token prediction); pesos en MLX |
| Parametros totales | 27.781.427.952 (27,8 mil millones) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits afín, grupo 64 (lineales); existen builds de 4, 6 y bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (librería `mlx`), con `model-mtp.safetensors` para la capa MTP |
| Modelo base | harness-hub/Qwen3.8-27B-pi-adapted (revisión e786f84), fusionado sobre Qwen/Qwen3.8-27B (revisión 3756181) |
| Tamaño del repositorio | 30,0 GB |
| Pipeline | image-text-to-text |
| Fidelidad vs bf16 | 99,1 % mismo siguiente token; KL 0,0004 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer denso de ~28B parámetros con 64 capas, de las cuales 16 usan atención completa (módulos q, k, v, o) y el resto emplean capas Gated DeltaNet. Incluye un codificador de visión (pipeline image-text-to-text) y una capa de predicción multi-token (MTP) original de Qwen, conservada en `model-mtp.safetensors` y cuantizada con el mismo esquema que el resto del build. El adaptador LoRA afecta a 256 módulos (q, k, v, o en las 16 capas de atención completa; gate, up, down en las 64 capas) y no toca ni el codificador de visión ni las capas Gated DeltaNet.

El adaptador fue entrenado por harness-hub con aprendizaje por refuerzo (AsyncGRPO en TRL) para ser el modelo detrás del agente de programación `pi` en tareas de ingeniería de software y terminal. La fusión se verificó elemento a elemento: cada módulo adaptado equivale a `W + 2.0 · B @ A` redondeado a bf16 frente a un cálculo independiente en float64, y el resto de tensores son idénticos byte a byte a Qwen3.8-27B. La cuantización es afín de 8 bits con grupo 64. El adaptador se entrenó y evaluó con el modo "thinking" desactivado, con la API Chat Completions (no Responses) y el formato XML de tool calling de Qwen.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Comprensión de imágenes (image-text-to-text): capturas de pantalla, terminales, diagramas.
- Programación y resolución de bugs en repositorios reales, con edición de código y ejecución de tests.
- Uso de terminal y herramientas de línea de comandos en tareas de ingeniería de software.
- Tool calling / function calling en el formato XML de Qwen (`<tool_call><function=...><parameter=...>`), que el servidor de mlx-lm expone como `tool_calls` de OpenAI.
- Comportamiento agéntico multi-paso con menos llamadas a herramientas por tarea (55-64 % de reducción según el autor).
- Decodificación especulativa integrada mediante la capa MTP original de Qwen, usable como modelo borrador con `--draft-model` y `--draft-kind mtp`; también compatible con el drafter DSpine.
- Modo "thinking" disponible en el chat template, aunque el adaptador fue entrenado y evaluado con thinking desactivado.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agente de código local en macOS: servir el modelo con `mlx_lm.server` y conectarlo al agente `pi` mediante `~/.pi/agent/models.json` con `"api": "openai-completions"`; permite depurar tests y corregir bugs sin enviar código a servicios externos.
- Resolución automática de incidencias en CI: el modelo puede recibir el fallo de `tests/test_parser.py`, inspeccionar el repositorio y proponer el parche, aprovechando su entrenamiento específico en SWE-bench Pro.
- Asistente de terminal: interpretar la salida de comandos y errores mostrados en una captura de pantalla (por ejemplo, con `mlx_vlm.generate --image screenshot.png`) y sugerir el siguiente comando.
- Automatización de tareas de mantenimiento de repositorios: renombrados, migraciones de API y actualizaciones de dependencias ejecutadas como pasos de agente con tool calling.
- Generación de código en Python desde el propio proceso: cargar el modelo con `mlx_lm.load` y `generate` para tareas puntuales de generación con el chat template y thinking desactivado.
- Revisión de código asistida por visión: analizar diagramas de arquitectura o capturas de interfaces junto con el código para localizar discrepancias.
- Desarrollo sin conexión en portátiles Apple Silicon: el build de 8 bits (30,0 GB) cabe en equipos con 64 GB o más de memoria unificada, lo que permite trabajar en entornos aislados.

## Benchmarks y rendimiento

Resultados publicados por el autor del adaptador (harness-hub), bajo `pi` con thinking desactivado, comparando el modelo base con el adaptado:

| Benchmark | Qwen3.8-27B base | Qwen3.8-27B-pi (adaptado) |
|---|---|---|
| Terminal-Bench 2.1 | 39,5 % | 55,8 % |
| SWE-bench Pro (hard 51) | 29,4 % | 62,7 % |
| Llamadas a herramientas por tarea | referencia | 55-64 % menos |

Fidelidad de la cuantización frente a bf16:

| Build | Tamaño | Mismo siguiente token | KL vs bf16 |
|---|---|---|---|
| 6 bits (recomendado) | 23,1 GB | 99,0 % | 0,0015 |
| 8 bits | 30,0 GB | 99,1 % | 0,0004 |
| 4 bits | 16,3 GB | 95,6 % | 0,0201 |
| bf16 | 55,6 GB | referencia | referencia |

Velocidad de decodificación medida por el autor en un MacBook Pro M5 Max (128 GB), greedy, thinking off, 5 prompts × 256 tokens (GSM8K, MATH-500, HumanEval, MBPP, MT-Bench), con otros servicios en ejecución (cifras indicativas):

| Build | Plano | MTP (mlx-vlm 0.7.11) | DSpine v0.2.1 (drafter 4 bits, bloque 5) |
|---|---|---|---|
| 4 bits | 33 tok/s | 61 tok/s (×1,84) | 70 tok/s (×2,25) |
| 6 bits | 23 tok/s | 22 tok/s (×0,96) | 52 tok/s (×2,32) |
| 8 bits | 18 tok/s | 41 tok/s (×2,24) | 54 tok/s (×3,05) |

No se han publicado resultados de MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- Memoria: el repositorio ocupa 30,0 GB; se recomienda un Mac con al menos 48-64 GB de memoria unificada para cargar los pesos y mantener contexto y caché KV.
- Hardware verificado: MacBook Pro con chip M5 Max y 128 GB de memoria unificada (mlx 0.32.4, mlx-lm 0.32.2, mlx-vlm 0.7.11).
- GPU NVIDIA: no soportadas por este build; está empaquetado para MLX y Apple Silicon. Para CUDA habría que usar los pesos originales de Qwen3.8-27B en otro formato.
- Despliegue: `mlx_lm.server` (API compatible con OpenAI), `mlx-lm` para texto y `mlx-vlm` para imagen. Requiere `mlx-lm>=0.32.2` y `mlx-vlm>=0.7.11`.
- Aceleración: MTP integrado (≈2,2× en este build, 18 a 41 tok/s) o el drafter DSpine (hasta ≈3,05×, 54 tok/s). Ambas opciones verifican cada token con el modelo completo.
- Alternativas de menor huella: build de 6 bits (23,1 GB, 23 tok/s planos) y de 4 bits (16,3 GB, 33 tok/s planos).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / plataforma | Notas |
|---|---|---|---|---|---|
| netprojects/Qwen3.8-27B-pi-MLX-8bit | 27,8B | no disponible | Apache 2.0 | MLX, Apple Silicon | 99,1 % fidelidad vs bf16; 18 tok/s planos, 41 tok/s con MTP |
| netprojects/Qwen3.8-27B-pi-MLX-6bit | 27,8B | no disponible | Apache 2.0 | MLX, Apple Silicon | 23,1 GB, 99,0 % fidelidad; recomendado por el autor por equilibrio tamaño/fidelidad |
| netprojects/Qwen3.8-27B-pi-MLX-4bit | 27,8B | no disponible | Apache 2.0 | MLX, Apple Silicon | 16,3 GB, 95,6 % fidelidad; el más rápido en decodificación plana (33 tok/s) |
| Qwen/Qwen3.8-27B | 27,8B | no disponible | no disponible | safetensors | Modelo base sin el ajuste RL; Terminal-Bench 2.1 39,5 %, SWE-bench Pro 29,4 % |

## Limitaciones y advertencias

- El adaptador se entrenó y evaluó con thinking desactivado; activar el modo thinking puede degradar el comportamiento esperado. El autor recomienda mantenerlo apagado.
- El tool calling debe usarse con la API Chat Completions; la API Responses no fue la empleada en el entrenamiento.
- El ajuste está especializado en tareas de agente de código y terminal; su rendimiento en dominios generales puede diferir del modelo base.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en la generación de parches y comandos; conviene validar las salidas con tests y revisión humana.
- Con decodificación especulativa y greedy, el texto coincide con la decodificación plana hasta un empate cercano, donde la verificación por lotes puede redondear al otro lado; respuestas largas pueden divergir ligeramente.
- Las mediciones de velocidad se tomaron con otros servicios en ejecución en el mismo equipo y deben tratarse como indicativas.
- Idiomas soportados y longitud de contexto no están documentados en la información disponible; verificar en la model card del modelo base antes de usarlo en producción multilingüe o con contextos largos.
- Solo funciona en Apple Silicon; no es desplegable en GPU NVIDIA sin reconvertir los pesos.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta; es un artefacto reciente (18 de noviembre de 2026) sin validación comunitaria extensa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-pi-MLX-8bit
- Modelo base adaptado: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Build de 6 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-MLX-6bit
- Build de 4 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-MLX-4bit
- Build bf16: https://huggingface.co/netprojects/Qwen3.8-27B-pi-MLX-bf16
- Adaptador LoRA MLX: https://huggingface.co/netprojects/Qwen3.8-27B-pi-MLX-adapter
- Drafter DSpine: https://huggingface.co/netprojects/Qwen3.8-27B-DSpine-b16-MLX
- Repositorio del agente pi: https://github.com/earendil-works/pi
- Repositorio dspine-hybrid-mlx: https://github.com/internet-projects/dspine-hybrid-mlx
