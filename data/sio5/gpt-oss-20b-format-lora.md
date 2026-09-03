# sio5/gpt-oss-20b-format-lora

## Resumen

Este repositorio contiene un adaptador QLoRA para el modelo open-weight GPT-OSS-20B de OpenAI, desarrollado por sio5. El adaptador está entrenado mediante supervisión fina (SFT) para generar respuestas en coreano siguiendo una estructura fija de tres partes: resumen (요약), explicación (설명) y siguiente acción (다음 행동). El objetivo es ofrecer respuestas concisas y organizadas para preguntas de productividad, ingeniería de software, seguridad, planificación y tareas cotidianas.

El adaptador se apoya en el checkpoint `unsloth/gpt-oss-20b-unsloth-bnb-4bit`, que es una versión cuantizada a 4 bits del modelo original `openai/gpt-oss-20b`. Solo se incluye el adaptador PEFT; el modelo base se descarga por separado al cargarlo. Con solo 3 981 312 parámetros entrenables (0,019 % del total), el adaptador se ha optimizado para una tarea de formato muy concreta, no para ampliar las capacidades generales del modelo base. Su relevancia radica en demostrar un flujo de fine-tuning eficiente y de bajo coste sobre un modelo de razonamiento de 20 000 millones de parámetros, con una licencia Apache-2.0 que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base GPT-OSS-20B) con adaptador LoRA (target: q_proj, k_proj, v_proj, o_proj) |
| Parametros totales | 20 918 738 496 (modelo base) + 3 981 312 (adaptador LoRA) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 tokens (entrenamiento); 512 tokens (ejemplo de inferencia) |
| Tipos de cuantizacion | 4-bit (QLoRA) para adaptador y modelo base |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador es una LoRA de rango 8, alpha 16 y dropout 0, aplicada a las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) del modelo base GPT-OSS-20B. El entrenamiento se realizó con QLoRA (cuantización de 4 bits) usando el framework Unsloth junto con TRL y PEFT. Se emplearon 20 ejemplos escritos a mano en coreano, de una sola vuelta, con respuestas que contienen exactamente los encabezados `요약`, `설명` y `다음 행동` en ese orden. El procedimiento fue supervisado (SFT) con una secuencia máxima de 256 tokens, tamaño de lote efectivo 2, tasa de aprendizaje 2e-4, optimizador AdamW de 8 bits y precisión BF16. Se ejecutaron 50 pasos (5 épocas) en una NVIDIA GeForce RTX 5090, con un tiempo total de entrenamiento de 175,8 segundos. No hay innovaciones arquitectónicas nuevas; se trata de un fine-tuning estándar con QLoRA.

## Capacidades

- Generación de respuestas en coreano con estructura fija de tres secciones: resumen, explicación y siguiente acción.
- Hereda las capacidades de razonamiento y generación de texto del modelo base GPT-OSS-20B (razonamiento multi-paso, comprensión de instrucciones, etc.), aunque el adaptador está especializado en el formato descrito.
- Soporte de chat mediante plantilla de conversación (el ejemplo de uso incluye `apply_chat_template` con `reasoning_effort="low"`).
- No añade capacidades nuevas de tool calling, visión o audio; se limita a formatear la salida.
- El adaptador no modifica el comportamiento general del modelo base fuera de la tarea de formato.

## Casos de uso

- Asistente de planificación personal en coreano: el adaptador puede responder a preguntas como "¿qué debo hacer primero al empezar un proyecto?" generando un resumen, una explicación y una acción concreta, útil para prototipos de asistentes de productividad.
- Generación de informes breves en coreano: para tareas que requieren una respuesta estructurada (resumen, explicación y siguiente paso), como resúmenes de reuniones o actualizaciones de estado.
- Demostración de fine-tuning eficiente con QLoRA: sirve como ejemplo didáctico de cómo adaptar un modelo grande con pocos datos y recursos limitados.
- Experimentación con formatos de salida controlados: permite probar si una estructura rígida de respuesta mejora la claridad en aplicaciones de chat en coreano.
- Herramienta de evaluación de adherencia a formato: el adaptador se puede usar para medir la capacidad de un modelo de seguir plantillas de respuesta específicas.
- Prototipos de asistentes técnicos en coreano: para preguntas de ingeniería de software o seguridad, donde la estructura resumen-explicación-acción puede ser útil en entornos de desarrollo.

## Benchmarks y rendimiento

La model card reporta una evaluación de adherencia al formato sobre 15 prompts en coreano fuera del conjunto de entrenamiento. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este adaptador.

| Metrica | Resultado |
|---|---|
| Adherencia al formato (15 prompts) | 15/15 (100 %) |
| Primera perdida de entrenamiento registrada | 13,9844 |
| Perdida final de entrenamiento | 1,2626 |
| Perdida minima de entrenamiento | 1,0610 |
| Perdida media de entrenamiento | 2,9348 |

## Requisitos de hardware

- El entrenamiento se realizó en una NVIDIA GeForce RTX 5090 (no se especifica VRAM, pero es una GPU de 32 GB). El tiempo fue de 175,8 segundos para 50 pasos.
- Para inferencia, se requiere cargar el modelo base en 4 bits (aproximadamente 10-12 GB de VRAM para 20 000 millones de parámetros) más el adaptador. Una GPU consumer con 16 GB de VRAM (por ejemplo, RTX 4090) es suficiente; se recomienda al menos 12 GB.
- Opciones de despliegue: Unsloth (usado en el ejemplo), vLLM, Transformers con PEFT, y cualquier framework compatible con safetensors y LoRA.
- La latencia y el throughput dependen del hardware y de la configuración; no se proporcionan datos específicos. Con `max_seq_length=512` y generación de 256 tokens, se espera una latencia baja en GPUs modernas.

## Comparativa con modelos similares

No hay datos públicos de benchmarks comparativos para este adaptador. Se puede comparar cualitativamente con el modelo base sin adaptador y con otro adaptador LoRA similar para GPT-OSS-20B.

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| sio5/gpt-oss-20b-format-lora (este) | 3,98 M entrenables (sobre 20,9 B) | 256/512 tokens | Apache-2.0 | Respuestas coreanas estructuradas |
| openai/gpt-oss-20b (base) | 20,9 B | No disponible | Apache-2.0 | Razonamiento general, multilingue |
| EpistemeAI/gpt-oss-20b-unsloth-finetune-puzzle-lora-V4 | No disponible | No disponible | Apache-2.0 (probable) | Resolucion de puzzles (fine-tuning LoRA) |

## Limitaciones y advertencias

- El adaptador se entrenó con solo 20 ejemplos, por lo que está sobreajustado a un formato de respuesta corto y puede no generalizar bien a otros estilos.
- La evaluación de 15 prompts mide únicamente la estructura (presencia y orden de los encabezados), no la corrección factual, utilidad, seguridad o robustez de las respuestas.
- Puede degradar el comportamiento de razonamiento del modelo base fuera del formato objetivo.
- Las respuestas heredan los sesgos, riesgos y limitaciones de GPT-OSS-20B; no debe usarse para consejos médicos, legales, financieros o críticos sin revisión humana.
- No se garantiza compatibilidad con versiones futuras de Transformers o Unsloth; el adaptador se probó con versiones específicas (Unsloth 2026.9.2, PEFT 0.20.0, Transformers 4.56.2, TRL 0.24.0, PyTorch 2.11.0+cu130).
- El repositorio no incluye el modelo base; es necesario descargarlo por separado, lo que implica un consumo de ancho de banda y almacenamiento.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/sio5/gpt-oss-20b-format-lora
- Modelo base cuantizado: https://huggingface.co/unsloth/gpt-oss-20b-unsloth-bnb-4bit
- Modelo original: https://huggingface.co/openai/gpt-oss-20b
- Documentacion de OpenAI API para gpt-oss-20b: https://developers.openai.com/api/docs/models/gpt-oss-20b
- Model card oficial de OpenAI para gpt-oss-120b y gpt-oss-20b: https://openai.com/index/gpt-oss-model-card/
- Otro adaptador LoRA similar: https://huggingface.co/EpistemeAI/gpt-oss-20b-unsloth-finetune-puzzle-lora-V4
