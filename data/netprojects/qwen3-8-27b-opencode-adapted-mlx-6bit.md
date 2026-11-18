# netprojects/Qwen3.8-27B-opencode-adapted-MLX-6bit

## Resumen

Qwen3.8-27B-opencode-adapted-MLX-6bit es una compilación cuantizada a 6 bits para Apple Silicon (MLX) del modelo Qwen3.8-27B de Alibaba Qwen, sobre el que se ha fusionado el adaptador LoRA `harness-hub/Qwen3.8-27B-opencode-adapted`. Ese adaptador se entrenó con aprendizaje por refuerzo (AsyncGRPO en TRL) para convertir el modelo en el motor del agente de programación OpenCode en tareas de ingeniería de software y de terminal. El resultado es un modelo de 27.781 millones de parámetros con capacidad de visión (pipeline image-text-to-text), empaquetado en 23,1 GB y listo para ejecutarse localmente en un Mac con suficiente memoria unificada.

La relevancia de esta build es doble. Por un lado, reproduce en local el comportamiento de un agente de código especializado sin depender de APIs externas. Por otro, lo hace con una pérdida de fidelidad mínima: según el autor, el 98,7 % de los siguientes tokens coinciden con la versión bf16 y la divergencia KL frente a bf16 es de 0,0014, lo que la convierte en la opción recomendada frente a las variantes de 4 y 8 bits. Mantiene además la capa de predicción multi-token (MTP) original de Qwen3.8-27B, cuantizada de forma coherente, y el encoder de visión.

El modelo está pensado para integrarse con OpenCode mediante el servidor compatible con OpenAI de mlx-lm, con el modo de razonamiento (thinking) desactivado, que es como se entrenó y evaluó el adaptador. La licencia es Apache 2.0 y el repositorio incluye la plantilla de chat y el tokenizador originales de harness-hub, con el mismo vocabulario y formato de tool calling XML de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de Qwen3.8-27B (16 capas de atención completa con módulos q, k, v, o; módulos gate/up/down adaptados) con encoder de visión y capa MTP; no se detalla la arquitectura completa en la información disponible |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits afín, grupo de 64 (lineales); existen builds de 4, 8 y bf16 del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con `model-mtp.safetensors` para la capa MTP; repositorio de 23,1 GB |

## Arquitectura y entrenamiento

La build parte de Qwen3.8-27B (revisión `3756181`) y del adaptador LoRA de harness-hub (revisión `b4171c0`), fusionados y convertidos a MLX con mlx-vlm. La fusión afecta a 256 módulos adaptados: q, k, v y o en las 16 capas de atención completa, y gate, up y down en las capas feed-forward. Se conserva el encoder de visión y la capa de predicción multi-token (MTP) propia de Qwen3.8-27B, cuantizada al mismo nivel que el resto del modelo; el adaptador no modifica esa capa, por lo que la cabeza MTP es la original de Qwen. Los pesos lineales se cuantizan a 6 bits en formato afín con grupo de 64.

El adaptador se entrenó con aprendizaje por refuerzo mediante AsyncGRPO en TRL, orientado a tareas de ingeniería de software y de terminal dentro del agente OpenCode. Según los resultados publicados por harness-hub, con thinking desactivado el modelo pasa de 35,3 % a 51,0 % en SWE-bench Pro (hard 51) y de 46,4 % a 52,4 % en Terminal-Bench 2.1 respecto al modelo base. Además, con thinking desactivado iguala al modelo base con thinking en su esfuerzo máximo generando aproximadamente una sexta parte de los tokens. El tokenizador y la plantilla de chat son los archivos de harness-hub sin cambios, con el mismo vocabulario y el mismo formato de tool calling XML de Qwen (`<tool_call><function=...><parameter=...>`).

## Capacidades

- Generación de texto y razonamiento general, con modo thinking opcional (aunque el adaptador se entrenó y evaluó con thinking desactivado).
- Programación y resolución de bugs en repositorios reales: localización de fallos en tests, edición de código y parcheo, según los resultados en SWE-bench Pro.
- Ejecución de tareas de terminal y línea de comandos, evaluado en Terminal-Bench 2.1.
- Tool calling / function calling en formato XML de Qwen, que el servidor de mlx-lm expone como `tool_calls` compatibles con OpenAI.
- Uso como agente multi-paso dentro de OpenCode y de otros clientes compatibles con la API de OpenAI.
- Comprensión de imágenes (image-text-to-text): lectura de capturas de pantalla, terminales y diagramas mediante mlx-vlm.
- Decodificación especulativa mediante la capa MTP integrada o mediante el drafter DSpine externo.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Agente de programación local con OpenCode: servir el modelo con `mlx_lm.server` y registrarlo como proveedor local en `opencode.json` permite lanzar tareas como "encuentra por qué fallan los tests de tests/test_parser.py y corrige el bug" sin enviar código a la nube. Es adecuado por su entrenamiento específico en tareas SWE y su formato de tool calling nativo.
- Corrección de bugs en CI/CD: el modelo puede recibir el fallo de una suite de tests junto con el código relevante y proponer un parche, aprovechando su mejora de 35,3 % a 51,0 % en SWE-bench Pro (hard 51) frente al modelo base.
- Automatización de tareas de terminal: interpretar la salida de comandos, diagnosticar errores de shell y encadenar pasos correctivos, con un 52,4 % en Terminal-Bench 2.1.
- Análisis de capturas de pantalla y errores visuales: con mlx-vlm, el modelo puede responder preguntas como "¿qué error muestra esta terminal?" sobre una imagen, útil para soporte técnico y triaje de incidencias.
- Asistente de refactorización en local para equipos con políticas de confidencialidad: al ejecutarse íntegramente en Apple Silicon con licencia Apache 2.0, permite procesar código propietario sin salir del puesto de trabajo.
- Generación de código con bajo coste de tokens: al igualar al modelo base con thinking al máximo esfuerzo generando aproximadamente una sexta parte de los tokens, reduce el tiempo y el coste en pipelines de generación de código a gran escala.
- Prototipado de agentes compatibles con OpenAI: el servidor de mlx-lm expone una API compatible que permite conectar el modelo a frameworks de agentes existentes sin adaptadores adicionales.

## Benchmarks y rendimiento

Resultados publicados por harness-hub para el adaptador, con thinking desactivado, frente al modelo base:

| Benchmark | Modelo base | Adaptador OpenCode |
|---|---|---|
| SWE-bench Pro (hard 51) | 35,3 % | 51,0 % |
| Terminal-Bench 2.1 | 46,4 % | 52,4 % |

Fidelidad de la cuantización frente a bf16 (datos del autor):

| Build | Tamano | Mismo siguiente token que bf16 | KL vs bf16 |
|---|---|---|---|
| MLX 6bit (esta build) | 23,1 GB | 98,7 % | 0,0014 |
| MLX 8bit | 30,0 GB | 99,2 % | 0,0004 |
| MLX 4bit | 16,3 GB | 96,7 % | 0,0203 |
| MLX bf16 | 55,6 GB | referencia | referencia |

Velocidad de decodificación medida por el autor (greedy, thinking off, 5 prompts × 256 tokens de GSM8K, MATH-500, HumanEval, MBPP y MT-Bench, con otros servicios en ejecución en el Mac, por lo que son indicativas):

| Build | Sin MTP | Con MTP (mlx-vlm 0.7.11) |
|---|---|---|
| 4bit | 33 tok/s | 62 tok/s (×1,91) |
| 6bit | 20 tok/s | 21 tok/s (×1,04) |
| 8bit | 17 tok/s | 37 tok/s (×2,15) |

No se han publicado resultados de MMLU, HumanEval, GSM8K u otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- Memoria: el repositorio ocupa 23,1 GB; se necesita memoria unificada suficiente para los pesos más el contexto y el encoder de visión. El autor validó la build en un MacBook Pro con chip M5 Max y 128 GB de memoria unificada.
- GPU: exclusivamente Apple Silicon (MLX); no está pensada para GPU NVIDIA. No se especifican modelos de Apple Silicon mínimos en la información disponible.
- Cabe en equipos de consumo Apple Silicon de gama alta con memoria unificada amplia; no se dispone de datos para configuraciones de 16 o 32 GB.
- Despliegue: `mlx_lm.server` (API compatible con OpenAI) para texto; `mlx_vlm.generate` para imagen y texto; integración con OpenCode mediante `@ai-sdk/openai-compatible`. Requiere mlx-lm >= 0.32.2 y mlx-vlm >= 0.7.11 (probado con mlx 0.32.4).
- Latencia y throughput: 20 tok/s en decodificación simple y 21 tok/s con MTP en la build de 6 bits, según las mediciones indicativas del autor. El autor señala que en esta build de 6 bits la MTP no aporta una mejora real con mlx-vlm 0.7.11 y que el drafter DSpine es mejor opción para acelerar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-opencode-adapted-MLX-6bit | 27,78 B | no disponible | Agente de código, visión, MLX 6 bits | Apache 2.0 | Hugging Face (MLX) |
| Qwen3.8-27B (base) | 27,78 B | no disponible | Modelo generalista de Qwen | no disponible en la información | Hugging Face |
| Qwen3.8-27B-opencode-adapted-MLX-8bit | 27,78 B | no disponible | Misma adaptación, mayor fidelidad (30,0 GB) | Apache 2.0 | Hugging Face (MLX) |
| Qwen3.8-27B-opencode-adapted-MLX-4bit | 27,78 B | no disponible | Misma adaptación, menor tamaño (16,3 GB) | Apache 2.0 | Hugging Face (MLX) |

No se dispone de datos de benchmarks ni de especificaciones de contexto para modelos de otras familias en la información proporcionada, por lo que la comparación se limita a las variantes del mismo modelo y a su base.

## Limitaciones y advertencias

- El adaptador se entrenó y evaluó con thinking desactivado; el autor recomienda mantenerlo así. Usarlo con thinking activado puede degradar el comportamiento esperado.
- Es una build exclusiva para Apple Silicon con MLX; no es portable a CUDA ni a otros backends sin reconversión.
- La cuantización a 6 bits introduce una divergencia pequeña pero no nula frente a bf16 (98,7 % de coincidencia en el siguiente token, KL 0,0014); en respuestas largas puede haber diferencias puntuales.
- La decodificación especulativa con MTP verifica cada token con el modelo completo; con decodificación greedy el texto coincide hasta un empate cercano, donde la comprobación por lotes puede redondear al otro lado y divergir ligeramente en respuestas largas.
- En esta build de 6 bits la MTP no aporta aceleración real con mlx-vlm 0.7.11; conviene usar el drafter DSpine si se busca velocidad.
- No se dispone de información sobre sesgos, idiomas soportados ni riesgos de alucinación específicos del modelo.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3.8-27B y del adaptador original antes de un uso comercial a gran escala.
- El modelo está orientado a tareas de código y terminal; su rendimiento en dominios generales no está documentado en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-6bit
- Modelo base del adaptador: https://huggingface.co/harness-hub/Qwen3.8-27B-opencode-adapted
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Build de 8 bits: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-8bit
- Build de 4 bits: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-4bit
- Build bf16: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-bf16
- Adaptador LoRA para mlx-lm: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-adapter
- Drafter DSpine: https://huggingface.co/netprojects/Qwen3.8-27B-DSpine-b16-MLX
- Repositorio dspine-hybrid-mlx: https://github.com/internet-projects/dspine-hybrid-mlx
- OpenCode: https://opencode.ai
