# djityree/Qwen3.8-27B-Chinese-Xuanhuan-Novel-Writer-DPO

## Resumen

JiangLing-js/Qwen3.8-27B-Chinese-Xuanhuan-Novel-Writer-DPO es un adaptador LoRA de PEFT para escritura creativa en chino, especializado en novela web de género xuanhuan (fantasía oriental). Lo desarrolla el usuario JiangLing-js y se construye sobre el modelo base `unsloth/Qwen3.8-27B`, un transformer denso de 27.000 millones de parámetros. El adaptador se entrena en dos fases: un ajuste supervisado (SFT) sobre tareas estructuradas de escritura de escenas y una optimización directa de preferencias (DPO) que usa prosa humana como respuesta preferida frente a prosa generada por el propio modelo o por una API externa.

El objetivo declarado es experimental: investigar si un LLM grande puede aprender una prosa de ficción web china más natural mediante una cadena de esquema estructurado, escena humana, SFT y pares de preferencia humano frente a máquina. No es un modelo de propósito general ni un asistente factual; está pensado para generación de escenas de ficción a partir de contextos ricos (época, estados de personajes, resumen previo, información de mundo recuperada, objetivos de escena y beats argumentales).

El repositorio es muy ligero (0,7 GB) porque solo contiene los pesos del adaptador, no el modelo base. La licencia figura como "other" y remite a un aviso de copyright y uso del autor que no se detalla en la información disponible. El modo thinking se desactiva durante el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.8-27B) con adaptador PEFT LoRA |
| Parametros totales | 27.000 millones (modelo base, no confirmado en la informacion); adaptador entrenable: 353.370.112 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion (la longitud maxima de entrenamiento fue de 4096 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Chino (zh) |
| Licencia | other (ver aviso de copyright y uso del autor; no detallado) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer denso Qwen3.8-27B. La configuración LoRA usa rango 64, alpha 128 y dropout 0.0, con módulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj` y `out_proj`. El entrenamiento se hizo en BF16 con Unsloth, Transformers, PEFT y TRL, con gradient checkpointing activado y el modo thinking desactivado.

La fase SFT usó 2.380 ejemplos a nivel de escena (1.732 de entrenamiento, 331 de validación y 317 de test), construidos a partir de una novela original mediante limpieza de TXT, segmentación por capítulos y escenas, outlines inversos y construcción de pares. La composición de tareas fue: outline a escena (1.056), contexto a escena siguiente (602), información de ambientación recuperada a escena (399) y diálogo/conflicto a escena (323). Se aplicó pérdida solo sobre la respuesta del asistente, con 1 época, learning rate 2e-5, batch efectivo 8, warmup 0.05, weight decay 0.001 y semilla 3407. La pérdida de entrenamiento fue 2,3471 y la de validación 2,2639, con unas 50,9 minutos de cómputo y un pico de VRAM de aproximadamente 58,6 GB.

La fase DPO partió del adaptador SFT como política inicial y usó una copia congelada del mismo como referencia, con log-probabilidades precalculadas. Se generaron 860 candidatos a partir de 680 prompts y, tras filtrado automático (longitud mínima del rechazado de 450 caracteres, ratio de longitud rechazado/elegido entre 0,65 y 1,70, similitud máxima de 82, solapamiento literal máximo de 64 caracteres, secuencia máxima de 4096 tokens, prompt máximo de 2800 y completado máximo de 1900), se seleccionaron 607 pares (574 de entrenamiento y 33 de validación). Las respuestas negativas provinieron del modelo SFT y de GPT-5.6 Terra vía API; las positivas, de pasajes humanos. Hiperparámetros DPO: 1 época, learning rate 5e-6, beta 0.10, alpha RPO 0.20, batch efectivo 8, warmup 0.05, weight decay 0.001 y semilla 7331. El objetivo combinó DPO sigmoide estándar con un término de regularización NLL sobre la respuesta elegida.

## Capacidades

- Generación de prosa de ficción en chino a partir de esquemas estructurados (época, personajes, resumen previo, información de mundo, objetivo de escena, beats y conflicto).
- Escritura de escenas continuas en lugar de explicaciones meta sobre el proceso de escritura.
- Expansión de diálogo y conflicto a partir de indicaciones breves.
- Generación de escena siguiente dado un contexto narrativo previo.
- Integración de información de ambientación recuperada (retrieval) en la prosa generada.
- Soporte de conversación multi-turno vía plantilla de chat del modelo base (pipeline text-generation, conversational).
- Capacidades del modelo base Qwen3.8-27B (razonamiento, código, matemáticas, tool calling) no documentadas para este adaptador y no garantizadas tras el ajuste.
- Capacidades multilingües limitadas al chino según la model card.

## Casos de uso

- Borrador de novela web china: el adaptador convierte un outline de escena en prosa continua, adecuado para autores que trabajan por capítulos y necesitan acelerar el primer borrador.
- Generación de escena siguiente: dado un resumen de la historia previa y el estado de los personajes, produce la continuación coherente con el arco narrativo, gracias al entrenamiento específico en la tarea contexto a escena.
- Asistente de escritura de formato largo: integrado en un pipeline con memoria externa (resúmenes y fichas de mundo), permite mantener continuidad en novelas de cientos de capítulos.
- Expansión de diálogo y conflicto: a partir de un beat breve, genera la escena dialogada completa, útil para desbloquear tramos con poco material previo.
- Agentes de escritura experimentales: sirve como componente de generación en sistemas multi-agente que planifican, recuperan información de mundo y redactan escenas por turnos.
- Investigación en optimización de preferencias para escritura creativa: el par SFT/DPO y los datasets descritos permiten reproducir experimentos sobre preferencia humano frente a máquina en prosa.
- Prototipado de herramientas de autor: al ser un adaptador ligero (0,7 GB), se puede cargar sobre el base en entornos de experimentación sin duplicar los 27B de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación ("DPO V...") que aparece truncada en los datos proporcionados y no contiene cifras utilizables.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para cuantizaciones concretas; el adaptador requiere cargar el modelo base de 27B, por lo que en BF16 se necesitan del orden de 54 GB solo para pesos, más overhead de activaciones y KV cache.
- El entrenamiento SFT reportó un pico de VRAM de aproximadamente 58,6 GB asignados (59,55 GB reservados) con BF16, longitud 4096 y gradient checkpointing, lo que sitúa el mínimo práctico en GPUs de 80 GB.
- GPU recomendadas para entrenamiento: A100 80 GB o H100 80 GB. Para inferencia en BF16, A100/H100 80 GB; con cuantización de 4 bits podría caber en GPUs consumer de 24 GB (RTX 4090) o 32 GB, aunque no hay datos publicados de calidad o latencia en ese régimen.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador sobre el base; vLLM, TGI o llama.cpp/Ollama requerirían fusionar el adaptador con el modelo base y convertir los pesos, procedimiento no documentado en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Chinese-Xuanhuan-Novel-Writer-DPO (este) | 27B (base) + 353M (adaptador) | no disponible | LoRA SFT + DPO para ficción xuanhuan en chino | other | Hugging Face, 0 descargas |
| unsloth/Qwen3.8-27B (base) | 27B | no disponible | Modelo generalista | no disponible | Hugging Face |
| Adaptadores de escritura creativa en chino de la comunidad | variable | variable | LoRA sobre modelos Qwen o similares | variable | Hugging Face |

No se dispone de datos de benchmarks ni de alternativas directamente comparables en la información proporcionada; la comparación se limita a la relación con el modelo base y a la categoría genérica de adaptadores LoRA de escritura creativa.

## Limitaciones y advertencias

- Entrenado exclusivamente en chino; no se debe esperar calidad en otros idiomas.
- No diseñado para responder preguntas factuales, asesoramiento profesional ni recuperación fiable de hechos del canon.
- Riesgo de alucinación narrativa: puede inventar detalles de mundo o contradecir el contexto si el prompt no es exhaustivo.
- El dataset SFT es pequeño (2.380 ejemplos) y proviene de una única novela original, lo que puede sesgar el estilo y los patrones narrativos hacia esa obra.
- El DPO usó solo 607 pares, con 33 de validación; la señal de preferencia es limitada y puede sobrerrestringir la diversidad de prosa.
- No debe usarse para verificar autoría, reproducir novelas con copyright ni eludir restricciones de procedencia.
- Licencia "other" con aviso de copyright y uso del autor no detallado en la información disponible; es imprescindible revisar dicho aviso antes de cualquier uso comercial.
- El modo thinking está desactivado; no se espera razonamiento explícito ni cadenas de pensamiento.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria ni evidencia externa de calidad.
- El repositorio solo contiene el adaptador; requiere descargar y cargar el modelo base por separado, con los requisitos de hardware asociados.

## Enlaces

- Hugging Face: https://huggingface.co/djityree/Qwen3.8-27B-Chinese-Xuanhuan-Novel-Writer-DPO
- Modelo base: https://huggingface.co/unsloth/Qwen3.8-27B
- Unsloth: https://github.com/unslothai/unsloth
- PEFT: https://github.com/huggingface/peft
- TRL: https://github.com/huggingface/trl
