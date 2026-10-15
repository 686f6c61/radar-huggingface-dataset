# deanoshuang/qwen3.5-9b-agent-sft-v7-lr5e5-lora

## Resumen

El modelo `deanoshuang/qwen3.5-9b-agent-sft-v7-lr5e5-lora` es un adaptador LoRA de rango 32 construido sobre el modelo base multimodal `Qwen/Qwen3.5-9B` (revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a`). No es un modelo completo, sino un ajuste fino supervisado (SFT) orientado a tareas agénticas de ingenieria de software y terminal, desarrollado por el usuario de HuggingFace `deanoshuang` dentro de un estudio iterativo de SFT sobre LoRA. El entrenamiento se realizo sobre trayectorias verificadas de profesores de pesos abiertos, complementadas con una porcion de retencion de matematicas, ciencia, seguimiento de instrucciones y chat.

La relevancia del adaptador radica en su enfoque experimental: forma parte de una comparativa de tres versiones (Base, SFT, stage 2) evaluada sobre SWE-bench Pro, Terminal-Bench 2.0, HLE y ASI-Bench que aparece documentada en el repositorio publico del estudio. Esta revision concreta (revision 7, brazo de learning rate) usa LR 5e-5 y batch efectivo de 16 durante una epoca, a diferencia del checkpoint hermano `qwen3.5-9b-agent-sft-v7-lora`, que usa LR 2e-5 y batch 12 sobre los mismos datos.

El adaptador modifica unicamente el modelo de lenguaje: la torre de vision del base permanece congelada. El modelo resultante hereda la arquitectura hibrida del Qwen3.5-9B (Gated Delta Networks combinadas con Gated Attention), su contexto nativo de 262.000 tokens extensible hasta aproximadamente un millon, y su naturaleza multimodal de fusion temprana. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer hibrido multimodal (Gated Delta Networks + Gated Attention) del base Qwen3.5-9B |
| Parametros totales | Adaptador: 86.556.672 parametros entrenables; modelo base: 9B (aproximado) |
| Parametros activos | No aplica (el modelo base es denso, no MoE) |
| Longitud de contexto | 262.000 tokens nativos, extensible hasta ~1M (heredado del base) |
| Tipos de cuantizacion | Adaptador en bf16 sin cuantizar; no se publican versiones cuantizadas. El base admite bf16 para fusion |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, `adapter_model.safetensors`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen3.5-9B`, un modelo multimodal nativo de 9B parametros con arquitectura hibrida que combina Gated Delta Networks y Gated Attention, capaz de procesar texto e imagen mediante fusion temprana de tokens multimodales. El LoRA tiene rango 32, alpha 64, dropout 0.05 y sin sesgo, y se aplica a 12 modulos objetivo (`q/k/v/o_proj`, `in_proj_qkv/z/b/a`, `out_proj`, `gate/up/down_proj`) en las 32 capas, con un total de 86.556.672 parametros entrenables en bf16. La torre de vision queda congelada y el adaptador solo toca el modelo de lenguaje.

El entrenamiento usa SFT con mascara de perdida unicamente sobre turnos del asistente (razonamiento, contenido y llamadas a herramientas); observaciones, prompts y turnos enmascarados son solo contexto. Los datos son la revision v7r1 (mezcla congelada el 2026-10-13), con 3.566 filas de entrenamiento y 9.048.308 tokens de perdida, distribuidos en 37,3 % SWE, 33,2 % terminal y 29,5 % retencion, con un limite de 65.536 tokens por fila. Las trayectorias de SWE usan un intento aprobado aleatorio por tarea con intentos de recuperacion primero y mascaras de razonamiento adaptativas (razonamiento corto en turnos rutinarios y largo solo en puntos de decision); las filas de terminal provienen mayoritariamente de ensayos aprobados de DeepSeek-V4-Pro y Kimi-K3 con guardianes por turno.

El optimizador es AdamW con LR 5e-5, programacion coseno sobre 1 epoca (223 pasos), 3 % de warm-up, weight decay 0, grad clip 1.0, batch efectivo 16 (1 secuencia x 16 pasos de acumulacion), perdida promediada por tokens y semilla 42. La perdida de validacion final fue 0.5223 en el paso 223 sobre un shard de 200 filas propio de la ejecucion. El entrenamiento se hizo en 1 GPU NVIDIA B200 durante 1,91 horas a 8.603 tokens/s, con 71,5 GB de memoria pico (1,92 GPU-h, ~16 USD).

## Capacidades

- Generacion de texto conversacional en ingles, con modo de razonamiento ("thinking") activado por defecto.
- Razonamiento agéntico multi-paso orientado a tareas de ingenieria de software (SWE) y uso de terminal.
- Llamada a herramientas y function calling, entrenado explicitamente sobre turnos con tool calls.
- Capacidad multimodal heredada del base (image-text-to-text), aunque el adaptador no modifica la torre de vision.
- Retencion de matematicas, ciencia y seguimiento de instrucciones de chat por la porcion de retencion de los datos (29,5 %).
- Comprension y generacion en ingles; no se declara soporte multilingue.

## Casos de uso

- Agentes de ingenieria de software autonoma: el adaptador esta afinado sobre trayectorias SWE verificadas, por lo que puede leer un repositorio, plantear parches y ejecutar comandos en un bucle de varios pasos con llamadas a herramientas.
- Automatizacion de tareas de terminal: dado su entrenamiento con trayectorias de terminal de profesores como DeepSeek-V4-Pro y Kimi-K3, es adecuado para resolver tareas de shell, diagnostico de sistemas y operaciones guiadas por comandos.
- Asistentes de depuracion en pipelines de CI/CD: puede integrarse como paso de agente que interpreta fallos de build o test, gracias al soporte de tool calling sobre turnos del asistente.
- Evaluacion y experimentacion academica: sirve como checkpoint de referencia en estudios de SFT iterativo sobre LoRA, comparando brazos de learning rate con datos identicos (frente a `qwen3.5-9b-agent-sft-v7-lora`).
- Base para un posterior "stage 2" o RL: el propio estudio lo describe como parte de una comparativa Base/SFT/stage 2, por lo que es un punto de partida para etapas posteriores de alineamiento.
- Prototipado de modelos multimodales pequenos con contexto largo: al heredar los 262K tokens del base, permite manejar documentos o sesiones largas en tareas de razonamiento y codigo.
- Investigacion sobre mascaras de razonamiento adaptativas: el checkpoint incorpora la tecnica de razonamiento corto en turnos rutinarios y largo en puntos de decision, util para estudiar eficiencia de tokens de pensamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor indica explicitamente "No benchmark scores here". El estudio menciona que la comparativa se evalua sobre SWE-bench Pro, Terminal-Bench 2.0, HLE y ASI-Bench, pero no se incluyen puntuaciones numericas en la informacion proporcionada. El unico dato cuantitativo de rendimiento disponible es la perdida de validacion: 0.5223 en el paso 223 sobre un shard de 200 filas.

## Requisitos de hardware

- VRAM para inferencia (estimaciones a partir de los 9B parametros del base): en bf16 el modelo fusionado ocupa aproximadamente 18 GB de pesos, mas overhead de activaciones y cache KV segun contexto; en cuantizacion de 4 bits se situaria en torno a 5-7 GB, aunque no se publican versiones cuantizadas.
- GPU recomendadas: el entrenamiento se valido en 1x NVIDIA B200; para inferencia en bf16 son adecuadas A100 40/80 GB, H100 y L40S; una RTX 4090 de 24 GB puede servir en bf16 con contexto moderado o en cuantizacion.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB (RTX 4090, 3090) en bf16 con contexto reducido, o en GPUs de 12-16 GB si se cuantiza el base (no publicado oficialmente).
- Despliegue: el autor recomienda fusionar el adaptador con `scripts/merge_adapter.sh merge` en bf16 y servir con vLLM usando los flags de `configs/eval/model.yaml`. Tambien es viable cargarlo como PEFT directo sobre el base con `transformers` y `peft`.
- Latencia y throughput: no disponibles para inferencia. El unico dato de throughput corresponde al entrenamiento (8.603 tokens/s en 1x B200, 71,5 GB de memoria pico).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `deanoshuang/qwen3.5-9b-agent-sft-v7-lr5e5-lora` | 9B (base) + 86,5M adaptador | 262K (hasta ~1M) | perdida de validacion 0.5223 | Apache 2.0 | Publico en HuggingFace |
| `deanoshuang/qwen3.5-9b-agent-sft-v7-lora` | 9B (base) + mismo LoRA r32 | 262K (hasta ~1M) | no disponible | Apache 2.0 | Publico; mismos datos v7r1, LR 2e-5, batch 12 |
| `Qwen/Qwen3.5-9B` (base) | 9B denso | 262K (hasta ~1M) | no disponible | Apache 2.0 | Publico |

No se dispone de puntuaciones comparativas entre estos checkpoints en la informacion proporcionada; las diferencias documentadas son de configuracion de entrenamiento (learning rate y batch efectivo) sobre la misma mezcla de datos.

## Limitaciones y advertencias

- Modelo unicamente en ingles: la card declara `language: en` y no se documenta soporte multilingue.
- Riesgo de alucinacion inherente a un adaptador SFT de 9B; no se han publicado evaluaciones de fiabilidad o tasas de error.
- Sin benchmarks publicados: la model card indica explicitamente que no incluye puntuaciones, por lo que no es posible validar su rendimiento en SWE-bench Pro, Terminal-Bench 2.0, HLE o ASI-Bench con los datos disponibles.
- Es un checkpoint de investigacion: proviene de un estudio iterativo de SFT y no se presenta como modelo de produccion estable.
- Solo modifica el modelo de lenguaje: la torre de vision queda congelada, por lo que las capacidades de imagen no se han adaptado a tareas agénticas.
- Los shards de validacion difieren entre revisiones de datos, de modo que la perdida de validacion (0.5223) solo es comparable dentro de esta misma revision.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones de los datasets de origen (por ejemplo, trazas de NVIDIA o de terceros) antes de un despliegue productivo.
- Dependencia de una revision concreta del base (`c202236235762e1c871ad0ccb60c8ee5ba337b9a`); cargar otra revision puede degradar la compatibilidad del adaptador.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/deanoshuang/qwen3.5-9b-agent-sft-v7-lr5e5-lora
- Pesos del adaptador: https://huggingface.co/deanoshuang/qwen3.5-9b-agent-sft-v7-lr5e5-lora/blob/main/adapter_model.safetensors
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Checkpoint hermano (revision 7, LR 2e-5): https://huggingface.co/deanoshuang/qwen3.5-9b-agent-sft-v7-lora
- Checkpoint revision 6: https://huggingface.co/deanoshuang/qwen3.5-9b-agent-sft-v6-lora
- Checkpoint revision 5 epoca 2: https://huggingface.co/deanoshuang/qwen3.5-9b-agent-sft-v5ep2-lora
- Checkpoint revision 5 epoca 1: https://huggingface.co/deanoshuang/qwen3.5-9b-agent-sft-efficient-lora
- Primer build: https://huggingface.co/deanoshuang/qwen3.5-9b-agent-sft-lora
- Repositorio del estudio (codigo, data cards, logs y resultados por tarea): https://github.com/apexin-ai/qwen36-35b-takehome-Deanpuzzleai
- Ficha del base en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3.5-9B-Base
- Ficha del base en SiliconFlow: https://www.siliconflow.com/models/qwen3-5-9b
- Ficha del base en Awesome Agents: https://awesomeagents.ai/models/qwen-3-5-9b/
