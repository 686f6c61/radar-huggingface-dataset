# mashbox-labs/Qwen3.8-27B-TPU

## Resumen

Qwen3.8-27B-TPU es un port a Google Cloud TPU del modelo Qwen3.8-27B de Qwen, realizado por MASHBOX Labs. No se trata de un modelo nuevo entrenado desde cero, sino de una versión cuantizada (aproximadamente 8 bits por peso, 26,94 GB) y optimizada para ejecutarse en un único chip TPU v6e, algo que no es posible con los pesos bf16 originales (55,6 GB) dado que el chip dispone de 32 GB de memoria. El objetivo del proyecto es simplificar al máximo el despliegue: una instalación y un comando llevan desde una cuenta de Google nueva hasta un servidor compatible con las APIs de OpenAI y Anthropic.

El modelo base es un modelo de lenguaje de 27B parámetros con arquitectura de atención híbrida. La relevancia de este port radica en el rendimiento medido sobre TPU v6e-1: 38,1 tok/s frente a 31,4 tok/s de vLLM en el mismo chip, un arranque en frío de 326,6 s frente a 1.606,7 s de vLLM, y hasta 74,84 tok/s con decodificación especulativa mediante MTP. Está pensado especialmente para agentes de código (Claude Code, Codex, Pi) que necesiten un LLM autoalojado en TPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida (hybrid-attention) |
| Parámetros totales | 27B (modelo base Qwen3.8-27B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 32768 tokens (configurable en el servidor, ejemplo documentado: `--ctx 32768`) |
| Tipos de cuantizacion | BQ8_R (8,01 bits por peso, 26,94 GB); el modelo base también existe en FP8 y bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Formato propietario de mashbox (`.bshj`, archivo Qwen3.8-27B-BQ8_R.bshj); el repo ocupa 33,3 GB |

## Arquitectura y entrenamiento

El modelo base, Qwen3.8-27B, emplea una arquitectura transformer con atención híbrida, según la documentación de MASHBOX Labs. No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

La innovación principal de esta ficha no está en el modelo sino en el runtime: MASHBOX Labs ha portado el modelo a JAX para TPU, con un pipeline que compila programas de prefill y decode antes de arrancar el servidor. Incluye cachés de compilación precompiladas (reducen el arranque de 326,6 s a 69,6 s, y a 32,6 s con contexto de 32k y un slot), decodificación especulativa mediante multi-token prediction (`--mtp 2`), y un servidor que expone simultáneamente las APIs Anthropic Messages, OpenAI Responses y OpenAI chat completions.

## Capacidades

- Generación de texto como modelo base de la familia Qwen3.8-27B (pipeline text-generation).
- Uso como LLM para agentes de código: compatible con Claude Code, Codex y Pi mediante APIs estándar.
- Servidor compatible con las APIs Anthropic Messages, OpenAI Responses y OpenAI chat completions.
- Decodificación especulativa opcional (`--mtp 2`) que casi duplica el throughput en decode.
- Gestión de múltiples usuarios concurrentes en un solo chip (8 usuarios simultáneos, 258 tok/s totales).
- Configuración flexible de contexto y slots (`--ctx`, `--slots`).

No se dispone de información específica sobre tool calling nativo del modelo base, capacidades de visión o audio, ni modo de razonamiento (thinking).

## Casos de uso

- Backend LLM para agentes de programación: el servidor habla los protocolos de Anthropic y OpenAI, por lo que puede sustituir a APIs comerciales en Claude Code, Codex o Pi con un modelo autoalojado y controlado.
- Despliegue rápido en TPU de una sola chip: con `mashbox run qwen3-8-27b` se pasa de una VM de Google Cloud vacía a un servidor listo, útil para prototipos y demos sin gestionar CUDA ni drivers de GPU.
- Servicios de chat con varios usuarios: soporta 8 peticiones concurrentes en un único chip v6e con 258 tok/s agregados, adecuado para equipos pequeños o entornos de staging.
- Generación de texto en tiempo real: 38,1 tok/s por petición (74,84 tok/s con decodificación especulativa) permiten experiencias de chat fluidas en un solo chip.
- Entornos con arranques frecuentes: la caché de compilación incluida reduce el tiempo hasta estar listo a 69,6 s (32,6 s con contexto 32k y un slot), útil en autoscaling o instancias efímeras.
- Evaluación de hardware TPU frente a GPU: al incluir comparativas directas con vLLM-TPU, es un buen punto de partida para equipos que evalúen migrar cargas de inferencia a TPU v6e.
- Integración en pipelines de CI/CD de agentes de código: el archivo AGENTS.md del repositorio permite que agentes de código autónomos instalen y operen el servidor por sí mismos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible; al ser un port cuantizado del modelo base Qwen/Qwen3.8-27B, el rendimiento en tareas debería corresponder al del modelo original, aunque la cuantización a 8 bits puede introducir ligeras diferencias no cuantificadas aquí.

Sí se han publicado mediciones de rendimiento de inferencia, todas sobre TPU v6e-1:

| Medición | MASHBOX | Comparado con |
|---|---|---|
| Velocidad de decode, 1 petición (prompt de 64 tokens, 128 nuevos, greedy) | 38,6 tok/s | no comparable (los pesos bf16 de Qwen no caben en un chip) |
| Decode, 8 peticiones simultáneas | 269 tok/s total (33,6 cada una) | no comparable |
| Arranque hasta listo, primera ejecución (pesos en disco, sin caché) | 326,6 s | no comparable |
| Arranque hasta listo, con caché de compilación incluida | 69,6 s (32,6 s con ctx 32k, 1 slot) | 326,6 s sin caché |
| Velocidad del servidor, 1 petición (prompts cortos, 256 tokens, greedy) | 38,1 tok/s | vLLM TPU 0.32.0 con FP8: 31,4 tok/s |
| Servidor, 1 petición, prompts largos (790 tokens) | 37,0 tok/s | vLLM: 31,0 tok/s |
| Servidor, 1 petición, muestreado (temp 0,7, top_p 0,8, top_k 20) | 33,0 tok/s | vLLM: 23,7 tok/s |
| Arranque hasta listo, cachés vacías | 326,6 s | vLLM: 1.606,7 s |
| Servidor, 8 usuarios simultáneos | 258,0 tok/s total | 1 usuario: 37,45 tok/s |
| Decode, 1 petición, decodificación especulativa (`--mtp 2`, greedy) | 74,84 tok/s | sin especulativa: 37,77 tok/s |
| Decode, 8 peticiones, especulativa | 436,87 tok/s total | sin especulativa: 244,69 tok/s total |

## Requisitos de hardware

- Hardware objetivo: un único chip Google Cloud TPU v6e (32 GB de memoria HBM). Los pesos cuantizados ocupan 26,94 GB.
- No aplicable a GPU consumer: los pesos bf16 originales (55,6 GB) no caben en un chip v6e, y este port está diseñado específicamente para TPU, no para GPUs NVIDIA.
- VRAM/GPU equivalentes no disponibles: no se documenta ejecución en A100, H100 o RTX 4090; para GPU habría que usar los pesos FP8 o bf16 del modelo base con otros runtimes.
- Despliegue: mediante el paquete `mashbox` (versión 0.1.10 en PyPI) con `mashbox[tpu]`, sobre una VM de Google Cloud TPU. Alternativamente, el modelo base Qwen/Qwen3.8-27B puede desplegarse con vLLM (versión TPU 0.32.0 documentada en las comparativas) u otros runtimes estándar.
- Latencia y throughput: 38,1 tok/s por petición en servidor (37,0 con prompts largos, 33,0 con muestreo); 258 tok/s agregados con 8 usuarios; hasta 74,84 tok/s con decodificación especulativa.
- Arranque: 326,6 s en frío sin caché de compilación; 69,6 s con la caché incluida; 32,6 s con contexto de 32k y un slot.

## Comparativa con modelos similares

| Característica | Qwen3.8-27B-TPU (mashbox-labs) | Qwen/Qwen3.8-27B-FP8 | Qwen/Qwen3.8-27B (bf16) |
|---|---|---|---|
| Parámetros | 27B | 27B | 27B |
| Arquitectura | Atención híbrida | Atención híbrida | Atención híbrida |
| Cuantización | BQ8_R (8,01 bits, 26,94 GB) | FP8 | bf16 (55,6 GB) |
| Hardware objetivo | TPU v6e-1 (1 chip) | TPU (vía vLLM) u otras | Requiere más de un chip v6e o GPUs de gama alta |
| Throughput en v6e-1 | 38,1 tok/s (1 req.) | 31,4 tok/s (vía vLLM TPU 0.32.0) | no ejecutable en 1 chip |
| Arranque en v6e-1 | 326,6 s en frío; 69,6 s con caché | 1.606,7 s (vLLM) | no disponible |
| Licencia | Apache 2.0 | Apache 2.0 (según repo base) | Apache 2.0 |
| Servidor incluido | Sí (APIs Anthropic y OpenAI) | No (requiere vLLM u otro runtime) | No |

## Limitaciones y advertencias

- Es un port de terceros: MASHBOX Labs no es el autor del modelo base; cualquier diferencia de calidad respecto a Qwen/Qwen3.8-27B por la cuantización BQ8_R no está cuantificada en la documentación disponible.
- Sin benchmarks de calidad publicados: no hay MMLU, HumanEval ni otras métricas para esta versión cuantizada, por lo que conviene validar la calidad en el caso de uso concreto antes de producción.
- Plataforma específica: solo está documentada la ejecución en Google Cloud TPU v6e; no hay soporte documentado para GPUs ni para otras generaciones de TPU.
- Arranque en frío lento sin caché: 326,6 s hasta estar listo si las cachés de compilación están vacías, algo a considerar en autoscaling.
- Idiomas soportados, capacidades multimodales y detalles de entrenamiento del modelo base: no disponibles en la información proporcionada.
- Riesgo de alucinación y sesgos: heredados del modelo base Qwen3.8-27B; no se documentan mitigaciones específicas.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar también los términos del modelo base Qwen y del paquete mashbox.
- Proyecto con adopción muy temprana: 0 descargas y 1 like en Hugging Face en el momento de la ficha, lo que implica poca comunidad y soporte limitado.

## Enlaces

- Ficha en Hugging Face: https://huggingface.co/mashbox-labs/Qwen3.8-27B-TPU
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Pesos FP8 del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Repositorio GitHub de mashbox: https://github.com/mashbox-labs/mashbox
- Guía de despliegue del modelo: https://mashbox.gg/docs/models/qwen3-8-27b
- Guía de configuración de Google Cloud: https://mashbox.gg/docs/google-cloud
- Uso con agentes de código: https://mashbox.gg/docs/agents-on-tpu
- AGENTS.md para agentes de código: https://github.com/mashbox-labs/mashbox/blob/v0.1.10/AGENTS.md
- Paquete mashbox 0.1.10 en PyPI: https://pypi.org/project/mashbox/0.1.10/
- Cuenta de X: https://x.com/mashboxgg
