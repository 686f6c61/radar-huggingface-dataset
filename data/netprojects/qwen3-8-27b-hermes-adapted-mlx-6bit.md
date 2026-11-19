# netprojects/Qwen3.8-27B-hermes-adapted-MLX-6bit

## Resumen

Qwen3.8-27B-hermes-adapted-MLX-6bit es una conversión a formato MLX, cuantizada a 6 bits, del modelo harness-hub/Qwen3.8-27B-hermes-adapted, que a su vez es un fine-tuning LoRA (fusionado) sobre Qwen/Qwen3.8-27B. El adaptador original fue entrenado por harness-hub mediante aprendizaje por refuerzo (AsyncGRPO en TRL, LoRA de rango 32 y alpha 64, checkpoint en el paso 160 de 1000 planificados) para funcionar como el modelo subyacente de Hermes Agent en tareas de ingeniería de software y terminal. Esta build la publica el usuario netprojects y está pensada específicamente para Apple Silicon.

El modelo resuelve el problema de ejecutar un modelo de 27.781.427.952 parámetros en Macs con memoria unificada limitada: la cuantización de 6 bits (afín, grupo 64) reduce el peso a 23,1 GB manteniendo un 98,5% de coincidencia en el siguiente token respecto a bf16 y una divergencia KL de 0,0015. Incluye el codificador de visión y la capa MTP (multi-token prediction) de Qwen, lo que permite tanto entrada image-text-to-text como decodificación especulativa integrada.

Es relevante ahora porque ofrece, en hardware de consumo Apple, un modelo orientado a agentes de código con mejoras medidas sustanciales frente a su base en benchmarks de ingeniería de software (SWE-bench Pro hard 51: 29,4% → 43,1%) y terminal (Terminal-Bench 2.1: 44,7% → 58,8%), con menos turnos y aproximadamente la mitad de tokens generados. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (16 capas de atención completa y capas Gated DeltaNet; 64 capas totales), con codificador de visión y capa MTP; conversión MLX vía mlx-vlm |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada; Hermes Agent requiere al menos 64.000 tokens |
| Tipos de cuantizacion | 6 bits afín, grupo 64 (esta build); existen builds MLX de 4, 8 y bf16 del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); incluye model-mtp.safetensors para la capa MTP |

## Arquitectura y entrenamiento

La base es Qwen3.8-27B, un transformer con 64 capas en el que 16 capas usan atención completa y el resto emplean Gated DeltaNet, según la verificación de módulos adaptados publicada por el autor de la conversión. El adaptador LoRA de harness-hub toca 256 módulos: q, k, v y o en las 16 capas de atención completa, y gate, up y down en las 64 capas. No modifica el codificador de visión ni las capas Gated DeltaNet. La fusión se realizó como W + 2,0 · B @ A redondeado a bf16, verificada elemento a elemento contra un cálculo independiente, y el resto de tensores es idéntico byte a byte a Qwen3.8-27B.

El entrenamiento del adaptador se hizo con aprendizaje por refuerzo usando AsyncGRPO en TRL, con LoRA de rango 32 y alpha 64, y se detuvo en el paso 160 de los 1000 planificados. El tokenizador y la plantilla de chat son los de harness-hub sin cambios, con el mismo vocabulario y formato de tool calling de Qwen3.8-27B. La innovación técnica destacable de esta build es la conservación de la capa MTP original de Qwen, cuantizada de forma coherente, que mlx-vlm puede usar como modelo borrador para decodificación especulativa pasando el mismo repositorio como `--draft-model` con `--draft-kind mtp`. Cada token propuesto se verifica con el modelo completo; con decodificación greedy el texto coincide con la decodificación normal salvo en empates cercanos, donde la comprobación por lotes puede redondear al otro lado y provocar divergencias leves en respuestas largas.

## Capacidades

- Generación de texto y razonamiento en tareas de ingeniería de software y uso de terminal, el dominio para el que fue entrenado el adaptador.
- Entrada image-text-to-text: incluye el codificador de visión y se puede usar con mlx-vlm para procesar imágenes como capturas de pantalla o salidas de terminal.
- Tool calling en formato XML de Qwen (`<tool_call><function=...><parameter=...>`), que el servidor de mlx-lm devuelve como `tool_calls` compatibles con OpenAI.
- Soporte de agentes y razonamiento multi-paso, orientado a Hermes Agent, que requiere al menos 64.000 tokens de contexto.
- Modo thinking configurable; el adaptador se entrenó y evaluó con thinking desactivado, y con thinking off iguala al modelo base con thinking en su esfuerzo máximo (xhigh) usando entre 3,5 y 4,4 veces menos tokens.
- Decodificación especulativa mediante la capa MTP integrada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Agente de ingeniería de software autónomo: servir el modelo con `mlx_lm.server` y conectarlo a Hermes Agent para tareas como localizar y corregir fallos en tests; el adaptador fue entrenado exactamente para este escenario y mejora SWE-bench Pro (hard 51) del 29,4% al 43,1% frente al base.
- Automatización de terminal: ejecutar y depurar comandos en sesiones de shell con el agente, aprovechando la mejora medida en Terminal-Bench 2.1 (44,7% → 58,8%) y el menor número de turnos necesarios.
- Asistencia en CI/CD y revisión de código: usar el tool calling en formato Qwen para invocar funciones de parseo, ejecución de tests o consulta de repositorios desde un pipeline local en un Mac.
- Análisis de capturas de pantalla y salidas visuales: con mlx-vlm, enviar una imagen de terminal o de una interfaz y preguntar por el error mostrado, gracias al codificador de visión incluido.
- Prototipado y desarrollo local en Apple Silicon: desplegar el modelo en un MacBook Pro con 36 GB o más de memoria unificada para tareas de código sin depender de la nube, con 23,4 GB de pico de memoria para un prompt de 8K tokens.
- Generación de código con latencia reducida: activar la decodificación especulativa con la capa MTP (`--draft-kind mtp`) para acelerar la generación de funciones y scripts en decodificación greedy.
- Evaluación e investigación de RL aplicado a agentes: reproducir el entorno de Hermes Agent con thinking off para estudiar el comportamiento del adaptador frente al modelo base con menos tokens generados.

## Benchmarks y rendimiento

Resultados publicados por harness-hub para el adaptador, bajo Hermes Agent y con thinking desactivado, frente al modelo base:

| Benchmark | Modelo base | Adaptador |
|---|---|---|
| SWE-bench Pro (hard 51) | 29,4% | 43,1% |
| Terminal-Bench 2.1 | 44,7% | 58,8% |

Comparativa de builds MLX del mismo autor (MacBook Pro M5 Max de 128 GB, 19 de noviembre de 2026, mlx 0.32.4, mlx-lm 0.32.2, mlx-vlm 0.7.11):

| Build | Tamano | Mismo siguiente token que bf16 | KL vs bf16 | GSM8K (50 preguntas) | Memoria pico, prompt de 8K tokens | Memoria de Mac sugerida |
|---|---|---|---|---|---|---|
| MLX-6bit (esta) | 23,1 GB | 98,5% | 0,0015 | 46/50 | 23,4 GB | 36 GB+ |
| MLX-8bit | 30,0 GB | 99,2% | 0,0004 | 45/50 | 29,7 GB | 48 GB+ |
| MLX-4bit | 16,3 GB | 96,1% | 0,0192 | 43/50 | 17,1 GB | 32 GB+ |
| MLX-bf16 | 55,6 GB | referencia | referencia | 45/50 | 53,4 GB | 96 GB+ |
| MLX-adapter | 638 MB | solo LoRA para mlx-lm | sobre cualquier build MLX de Qwen3.8-27B | no aplica | no aplica | no aplica |

No se han publicado en la información disponible resultados de MMLU, HumanEval ni otros benchmarks generales para esta build.

## Requisitos de hardware

- Memoria: 23,4 GB de pico con un prompt de 8K tokens en la build de 6 bits; se recomienda un Mac con 36 GB o más de memoria unificada.
- Hardware verificado: MacBook Pro con chip M5 Max y 128 GB de memoria unificada.
- GPU dedicadas: no aplica; el formato MLX está orientado a Apple Silicon. Para A100, H100 o RTX 4090 habría que usar los pesos originales en safetensors o una cuantización GGUF, no disponible en esta información.
- Cabe en GPUs de consumo Apple: sí, en equipos con al menos 36 GB de memoria unificada; la build de 4 bits (16,3 GB) está pensada para Macs con 32 GB o más.
- Despliegue: servidor compatible con OpenAI de mlx-lm (`mlx_lm.server`, mlx-lm >= 0.32.2), mlx-lm desde Python y mlx-vlm (>= 0.7.11) para texto e imágenes. No se indica soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles de forma numérica; el autor indica que el adaptador usa aproximadamente 2 veces menos tokens generados que el base y menos del 40% de sus turnos en las tareas que ambos resuelven, y que con thinking off iguala al base en xhigh con 3,5–4,4 veces menos tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-hermes-adapted-MLX-6bit | 27,78B | no disponible | SWE-bench Pro 43,1%; Terminal-Bench 2.1 58,8% (con Hermes Agent, thinking off) | Apache 2.0 | Hugging Face, formato MLX |
| Qwen/Qwen3.8-27B (base) | no disponible en la información | no disponible | SWE-bench Pro 29,4%; Terminal-Bench 2.1 44,7% | no disponible en la información | Hugging Face |
| netprojects/Qwen3.8-27B-hermes-adapted-MLX-8bit | 27,78B | no disponible | 99,2% de coincidencia con bf16; GSM8K 45/50 | Apache 2.0 | Hugging Face, formato MLX |
| netprojects/Qwen3.8-27B-hermes-adapted-MLX-4bit | 27,78B | no disponible | 96,1% de coincidencia con bf16; GSM8K 43/50 | Apache 2.0 | Hugging Face, formato MLX |

## Limitaciones y advertencias

- El adaptador se entrenó y evaluó con thinking desactivado; el autor recomienda mantenerlo apagado. Usarlo con thinking activado puede degradar el comportamiento esperado.
- Los benchmarks de SWE-bench Pro y Terminal-Bench 2.1 se obtuvieron bajo Hermes Agent con thinking off; no son directamente comparables con evaluaciones en otros entornos.
- El checkpoint del adaptador corresponde al paso 160 de 1000 planificados, por lo que el entrenamiento por refuerzo no está completado.
- La decodificación especulativa con MTP puede divergir ligeramente del texto de la decodificación normal en respuestas largas por redondeos en empates cercanos durante la comprobación por lotes.
- Riesgo de alucinación: no cuantificado en la información disponible; es un modelo de lenguaje y puede generar código o comandos incorrectos, algo crítico en tareas de terminal.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles; la ficha no confirma cobertura multilingüe.
- Longitud de contexto máxima: no disponible; Hermes Agent exige al menos 64.000 tokens, pero no se especifica el límite del modelo.
- Licencia Apache 2.0, que permite uso comercial; conviene revisar igualmente las condiciones del modelo base Qwen3.8-27B y del adaptador original.
- Formato MLX exclusivo para Apple Silicon; no es desplegable en GPUs NVIDIA sin reconvertir los pesos.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-6bit
- Adaptador original: https://huggingface.co/harness-hub/Qwen3.8-27B-hermes-adapted
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Build MLX de 8 bits: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-8bit
- Build MLX de 4 bits: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-4bit
- Build MLX bf16: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-bf16
- Adaptador LoRA MLX: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-adapter
- Hermes Agent: https://github.com/NousResearch/hermes-agent
