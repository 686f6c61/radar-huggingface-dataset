# SebasAstreaYah/qwen3.5-4b-forge-lora-v2

## Resumen

Forge30XX Qwen3.5-4B tool-calling LoRA v2 es un adaptador QLoRA entrenado por SebasAstreaYah sobre el modelo base `unsloth/Qwen3.5-4B`. Su objetivo es dotar a un modelo de 4B parámetros de capacidad fiable de tool calling en un formato JSON propio (`{"name": "<tool>", "arguments": {...}}`), con soporte de conversaciones multi-turno que incluyen mensajes de rol `tool` y recuperación tras fallos de herramientas. Está pensado para ejecutarse en hardware de gama baja, concretamente una RTX 3050 de 6 GB, lo que lo sitúa en la categoría de adaptadores para agentes locales.

El adaptador se distribuye como un repositorio PEFT con pesos safetensors (21 233 664 parámetros, unos 0,1 GB) y una versión LoRA en GGUF de 41 MB compatible con `llama.cpp`. Se entrena sobre el dataset propio `forge-tool-calling-dataset-v2` de 12 000 filas, que combina Glaive v2, datos sintéticos y ejemplos multi-turno con recuperación tras errores. La licencia es Apache-2.0, igual que el modelo base.

Es relevante ahora porque demuestra un flujo completo de ajuste fino de tool calling en hardware consumer: el autor documenta hiperparámetros, métricas de evaluación, hashes y comandos de despliegue reproducibles. No obstante, el propio autor lo marca como candidato y no como reemplazo del adaptador v1 en producción, y no publica el dataset ni valida el contexto más allá de 2048 tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA/QLoRA sobre transformer decoder-only (Qwen3.5-4B) |
| Parametros totales | 21 233 664 (adaptador); modelo base de 4B no incluido en el repo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Entrenado con `max_seq_len=2048`; inferencia validada hasta 16 384 y 32 768 con fork `llama-cpp-turboquant`, sin validación más allá de los prompts RF-08 |
| Tipos de cuantizacion | Adaptador en safetensors (f16) y LoRA GGUF f16; modelo base requiere GGUF Q4_K_M (unos 2,6 GB) para el caso de uso documentado |
| Idiomas soportados | Español e inglés (según tags); no se detalla cobertura adicional |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT) y GGUF (LoRA para llama.cpp) |

## Arquitectura y entrenamiento

El adaptador es un LoRA (QLoRA en el entrenamiento) aplicado sobre `unsloth/Qwen3.5-4B`, un transformer decoder-only de 4B parámetros. El entrenamiento usa el dataset propio `forge-tool-calling-dataset-v2` con 12 000 filas: 6 000 de Glaive v2, 3 000 sintéticas básicas, 1 500 multi-turno con rol `tool` y 1 500 de recuperación tras fallo. El formato de tool-call es `{"name": "<tool>", "arguments": {...}}` y las herramientas cubiertas son `read_file`, `edit_file`, `create_file`, `delete_file`, `search_web` y `run_shell`. El system prompt del dataset lista las tools como objetos JSON, una por línea.

La innovación principal es el énfasis en turnos finales en prosa tras un resultado de tool y en la recuperación tras errores (por ejemplo, `read_file` sobre un archivo inexistente o una suite de tests fallida). El autor reporta 1 425 pasos de entrenamiento, 64 min 41 s de tiempo total y un pico de VRAM de 4 170 MiB. Incluye una gramática GBNF (`tool_calls.gbnf`) que solo debe aplicarse cuando el agente espera un tool-call; aplicarla al turno final impide la respuesta en prosa. No se documenta RLHF ni DPO.

## Capacidades

- Generación de texto y conversación multi-turno con rol `tool` intercalado.
- Tool calling / function calling en formato JSON propio para seis herramientas de sistema de archivos, búsqueda web y shell.
- Recuperación parcial tras fallo de tool: reconoce el error, aunque no siempre reintenta la tool; el bucle del agente debe forzar el reintento.
- Turnos finales en prosa después de un resultado de tool (novedad de v2 frente a v1).
- Soporte bilingüe español e inglés según los tags del repositorio.
- Compatibilidad con gramáticas GBNF para restringir la salida a tool-calls válidos.
- No incluye razonamiento explícito ni ejecución real de tools.

## Casos de uso

- Agente local de edición de código en una RTX 3050 de 6 GB: el adaptador permite que un modelo 4B en Q4_K_M emita tool-calls válidos para `read_file`, `edit_file` y `create_file`, con un consumo de VRAM documentado de unos 4,1 GB en entrenamiento y un modelo base de 2,6 GB en inferencia.
- Automatización de tareas de shell en entornos controlados: el soporte de `run_shell` con formato JSON permite integrar el modelo en un orquestador que valide y ejecute comandos, con la gramática GBNF limitando la salida a llamadas estructuradas.
- Búsqueda web asistida: la tool `search_web` habilita flujos de recuperación de información donde el modelo decide cuándo buscar y cómo resumir el resultado en prosa en el turno final.
- Recuperación de errores en pipelines de CI: el entrenamiento con 1 500 filas de recuperación tras fallo permite que el agente reconozca un test fallido o un archivo inexistente, aunque el reintento debe forzarse desde el bucle externo.
- Prototipado de agentes multi-step en hardware consumer: sirve para validar bucles de agente con contexto de 16K en `llama.cpp` (`-c 16384`) antes de migrar a modelos mayores.
- Evaluación de formatos de tool calling: el repositorio incluye `manifest.json`, `SHA256SUMS` y la suite RF-08 de 30 prompts reservados, útil para comparar adaptadores con un umbral de éxito del 90 %.

## Benchmarks y rendimiento

| Métrica | v1 | v2 |
|---|---:|---:|
| `eval_loss` | 0,0247 | 0,0230 |
| Perplejidad (840 turnos assistant) | 1,8914 ± 0,0323 | 1,7289 ± 0,0262 |
| RF-08 sin gramática | 100 % | 100 % |
| RF-08 con gramática | 100 % | 100 % |
| Pasos | 1 069 | 1 425 |
| Tiempo | 43 min 9 s | 64 min 41 s |
| Pico de VRAM | 4 130 MiB | 4 170 MiB |

La perplejidad se midió sobre `dataset-v2/eval.jsonl` con el GGUF base Q4_K_M y contexto 2048. El RF-08 usa 30 prompts reservados con umbral ≥90 %. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada en inferencia: modelo base Q4_K_M de unos 2,6 GB más el LoRA f16 de 41 MB; el caso documentado cabe en 6 GB con `-c 16384`, `-ngl 99`, `-fa on`, `-np 1` y caché KV en `q8_0`.
- GPU recomendada por el autor: RTX 3050 de 6 GB; el pico de VRAM en entrenamiento fue de 4 170 MiB, por lo que GPUs consumer con 6-8 GB son suficientes.
- Cabe en GPU consumer: sí, en RTX 3050 6 GB y superiores; si hay OOM, el autor recomienda bajar a `-c 16384` y después probar `-ngl 28`.
- Despliegue: `llama-server` de `llama.cpp` con `--lora`, o el fork `llama-cpp-turboquant` para contexto de 32K con `-ctk turbo2 -ctv turbo2`. También es compatible con PEFT + Transformers.
- No se debe usar `-np` mayor que 1 según las instrucciones del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Forge30XX Qwen3.5-4B LoRA v2 | 21,2 M (adaptador) sobre base 4B | Entrenado a 2048; inferencia hasta 32K con fork | Sí, formato JSON propio | Apache-2.0 | Hugging Face |
| Forge30XX Qwen3.5-4B LoRA v1 | no disponible (adaptador) sobre base 4B | no disponible | Sí | Apache-2.0 | Hugging Face, publicado por defecto |
| `unsloth/Qwen3.5-4B` (base) | 4B | no disponible en la información | No específico de tool calling | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks estándar ni de comparación con adaptadores de terceros en la información proporcionada.

## Limitaciones y advertencias

- El autor marca v2 como candidato y no recomienda sustituir v1 en producción sin evaluación adicional.
- El dataset `forge-tool-calling-dataset-v2` no está publicado; solo se distribuye el adaptador.
- La recuperación activa es parcial: el modelo reconoce el fallo pero no siempre reintenta la tool; el bucle del agente debe forzar el reintento.
- El entrenamiento se hizo con `max_seq_len=2048`; el contexto de inferencia mayor no se validó más allá de los prompts RF-08.
- La gramática GBNF solo debe aplicarse cuando se espera un tool-call; aplicarla al turno final impide la respuesta en prosa.
- No incluye razonamiento explícito ni resultados de tools reales.
- Riesgo de alucinación en tool-calls y en la interpretación de resultados de tools no evaluado en la información disponible.
- Sesgos conocidos: no disponibles.
- Licencia Apache-2.0 permite uso comercial, pero debe respetarse la atribución del modelo base y de Glaive v2 según `LICENSE` y `NOTICE`.

## Enlaces

- Hugging Face: https://huggingface.co/SebasAstreaYah/qwen3.5-4b-forge-lora-v2
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- Adaptador v1: https://huggingface.co/SebasAstreaYah/qwen3.5-4b-forge-lora
- Repositorio `llama.cpp`: https://github.com/ggerganov/llama.cpp
- Fork `llama-cpp-turboquant`: no disponible (no se proporciona URL en la información)
- Dataset Glaive v2: no disponible (no se proporciona URL en la información)
