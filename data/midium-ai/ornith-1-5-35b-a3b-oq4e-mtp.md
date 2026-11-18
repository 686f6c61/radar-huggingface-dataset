# midium-ai/Ornith-1.5-35B-A3B-oQ4e-mtp

## Resumen

Ornith-1.5-35B-A3B-oQ4e-mtp es una cuantización MLX de precisión mixta en 4 bits del modelo `ornith-ai/Ornith-1.5-35B-A3B`, un transformer de mezcla de expertos (MoE) desarrollado por Ornith AI. El modelo base parte de Qwen3.6 35B A3B y se ha post-entrenado específicamente para agentes de código y uso de herramientas. Con 35.951.822.704 parámetros totales y aproximadamente 3.000 millones activos por token, emplea la arquitectura `qwen3_5_moe` e incorpora una torre de visión, por lo que su pipeline es `image-text-to-text`.

Esta versión concreta la publica el usuario `midium-ai` y está pensada para ejecutarse en Apple Silicon mediante la librería `mlx` (concretamente `mlx-vlm`). El pack conserva tanto la torre de visión como la cabeza MTP (multi-token prediction) del modelo original, lo que permite decodificación especulativa en runtimes que la soportan. El peso del repositorio es de 21,6 GB frente a los 67 GB del modelo en bf16, una reducción de aproximadamente el 68 %.

La relevancia de esta ficha radica en que documenta una receta de cuantización poco habitual: asignación de bits tensor a tensor heredada de otro pack, calibración con imatrix de activaciones y preservación de componentes auxiliares (visión y MTP). Es un caso útil para quienes despliegan modelos MoE grandes en hardware de consumo con memoria unificada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`qwen3_5_moe`) con torre de visión y cabeza MTP |
| Parámetros totales | 35.951.822.704 |
| Parámetros activos | ~3.000 millones por token |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits en expertos enrutados (grupo 64); 5–6 bits en proyecciones de atención y atención lineal (grupo 64/128), 8 bits donde el pack lo mantiene; 8 bits en expertos compartidos, embeddings y `lm_head`; sin cuantizar conv1d, gates del router y normas; torre de visión en bf16 |
| Idiomas soportados | no disponible (la calibración usa un conjunto `oqe_code_multilingual`) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX); 483 tensores cuantizados |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 35.951.822.704 parámetros totales y unos 3.000 millones activos por token, identificado en los tags como `qwen3_5_moe`. Incluye proyecciones de atención lineal, expertos enrutados y compartidos, una torre de visión y una cabeza de predicción multi-token (MTP). Según la model card, Ornith AI lo post-entrenó a partir de Qwen3.6 35B A3B para agentes de código y uso de herramientas. No se dispone de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO.

La cuantización se realizó con el cuantizador oQ4e de oMLX 0.7.2, que aplica cuantización ponderada por importancia a partir de una imatrix de activaciones. El conjunto de calibración fue `oqe_code_multilingual`, con 128 muestras de 512 tokens, tomadas sobre un proxy uniforme de 4 bits porque el modelo en bf16 supera el límite de calibración en memoria de oQ en un Mac de 128 GB. La asignación de bits se copió tensor a tensor del pack `Jundot/Qwen3.6-35B-A3B-oQ4e-mtp` en lugar de usar la asignación propia de oQ 0.7.x. Se conservaron la plantilla de chat, el tokenizador y la configuración de generación del modelo fuente.

## Capacidades

- Generación de texto y razonamiento: el turno del asistente se abre con `<think>` salvo que se desactive `enable_thinking` en los kwargs de la plantilla de chat.
- Generación de código y tareas de agente de programación, objetivo principal del post-entrenamiento.
- Uso de herramientas (tool calling / function calling) en formato XML de Qwen (`<tool_call><function=…><parameter=…>`).
- Razonamiento multi-paso y flujos de agente, con soporte de BFCL v4 single-call y multi-turn según la evaluación del autor.
- Procesamiento de imagen y texto (`image-text-to-text`), gracias a la torre de visión conservada en bf16.
- Decodificación especulativa mediante la cabeza MTP, que en Midium se separa como drafter al cargar el modelo.
- Capacidades multilingües: no disponible de forma explícita, aunque el conjunto de calibración es multilingüe orientado a código.

## Casos de uso

- Agentes de código en local sobre Apple Silicon: el pack está pensado para `mlx-vlm` y permite ejecutar un MoE de 35B en un Mac con memoria unificada, gestionando tareas de edición y creación de módulos con contexto de decenas de miles de tokens.
- Asistencia en edición de ficheros grandes: la evaluación del autor mide reescrituras de ficheros de 24.000 caracteres con un solo cambio, un escenario típico de refactorización asistida.
- Integración en pipelines con tool calling: el formato XML de Qwen y el soporte de BFCL v4 permiten encadenar llamadas a funciones en flujos de automatización.
- Razonamiento con modo thinking: útil para tareas que requieren trazas de razonamiento antes de responder, activable o desactivable según la latencia objetivo.
- Análisis de imágenes con texto (capturas, diagramas, documentación técnica) gracias a la torre de visión preservada.
- Prototipado e investigación en cuantización: el pack documenta una receta reproducible (imatrix, asignación de bits heredada, preservación de MTP) útil para estudiar el impacto de la cuantización en modelos MoE.
- Despliegue en estaciones de trabajo con memoria unificada de 128 GB, donde el modelo en bf16 no cabría con holgura pero el pack de 21,6 GB sí.

## Benchmarks y rendimiento

Evaluación frente al modelo bf16, con pérdida NLL teacher-forced sobre texto sin plantilla de chat (6 ventanas de código de 2.048 tokens y 4 ventanas de prosa, últimas 1.024 posiciones de cada una):

| Conjunto | Cambio de NLL vs bf16 | Top-1 coincide con bf16 |
|---|---:|---:|
| Código (6.144 tokens) | +0,0016 ± 0,0075 | 94,6 % |
| Prosa (4.096 tokens) | +0,0026 ± 0,0123 | 89,0 % |

Comparación con `scottlowry/Ornith-1.5-35B-A3B-oQ4e-mtp` (oMLX 0.7.4.dev1, atención en 8 bits), misma sesión de motor Midium, M5 Max de 128 GB, un modelo cargado a la vez. Tool calling (BFCL v4 single-call y multi-turn, scorer propio de BFCL, thinking activado, greedy, los mismos 260 casos): ambos packs quedan dentro del ruido estadístico.

Velocidad de decodificación (tok/s; temperatura 1,0, top-p 0,95, top-k 20, thinking desactivado; 6 ejecuciones con drafting MTP y 2 sin él por tarea):

| Tarea | Este pack, con drafting | scottlowry, con drafting | Este pack, sin drafting | scottlowry, sin drafting |
|---|---:|---:|---:|---:|
| Petición corta de código | 240 | 225 | 145 | 123 |
| Nuevo módulo tras un codebase de ~33k tokens | 147 | 132 | 117 | 104 |
| Reescribir un fichero de 24.000 caracteres con un cambio | 586 | 585 | 138 | 119 |
| La misma edición como llamada `write_file` | 444 | 435 | 117 | 104 |

## Requisitos de hardware

- VRAM/memoria estimada: 21,6 GB de pesos en el repositorio; en la evaluación se ejecutó en un M5 Max de 128 GB de memoria unificada. No se dispone de cifras de memoria pico de inferencia.
- GPU recomendadas: el pack es específico de MLX, por lo que el destino son chips Apple Silicon (se documenta M5 Max; no se confirman otros). No está pensado para GPU NVIDIA ni AMD.
- ¿Cabe en GPU de consumo? Está orientado a Macs con memoria unificada amplia; no se documenta su uso en GPUs de consumo discretas.
- Opciones de despliegue: `mlx-vlm` (librería indicada en la model card) y el motor Midium, que separa la cabeza MTP como drafter para decodificación especulativa. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tabla de decodificación en la sección de benchmarks (entre 117 y 586 tok/s según tarea y uso de drafting).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este pack (Ornith-1.5-35B-A3B-oQ4e-mtp) | 35,95B totales / ~3B activos | no disponible | MIT | safetensors MLX, 4 bits mixtos | 21,6 GB, conserva visión y MTP |
| ornith-ai/Ornith-1.5-35B-A3B (base) | 35,95B totales / ~3B activos | no disponible | MIT | safetensors bf16 | 67 GB, modelo fuente |
| scottlowry/Ornith-1.5-35B-A3B-oQ4e-mtp | 35,95B totales / ~3B activos | no disponible | no disponible | safetensors MLX, oQ4e | Atención en 8 bits; rendimiento dentro del ruido y decodificación algo inferior en la evaluación del autor |
| Qwen3.6-35B-A3B (referencia de arquitectura) | 35B totales / 3B activos | no disponible | no disponible | no disponible | Modelo del que parte el post-entrenamiento |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; al derivar de Qwen3.6 y post-entrenarse para código, es esperable un sesgo hacia dominios técnicos, pero no hay datos publicados.
- Riesgo de alucinación: no evaluado de forma específica; las métricas publicadas son de pérdida y coincidencia top-1, no de veracidad.
- Limitaciones de contexto e idioma: la longitud de contexto no se indica y los idiomas soportados figuran como no disponibles. La calibración se hizo sobre un proxy de 4 bits, no sobre el modelo bf16 completo, lo que puede introducir desviaciones no medidas en capas sensibles.
- Restricciones de licencia: MIT, igual que el modelo fuente, lo que permite uso comercial; conviene verificar la licencia del modelo base original por si impone condiciones adicionales.
- Caveats para producción: el pack es específico de MLX y `mlx-vlm`, sin soporte documentado en otros runtimes. La evaluación se limita a una máquina (M5 Max) y a un conjunto reducido de tareas. La preservación de la cabeza MTP exige un runtime que sepa usarla; en otros entornos el beneficio de velocidad desaparece. El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que carece de validación comunitaria amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/midium-ai/Ornith-1.5-35B-A3B-oQ4e-mtp
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Pack de referencia de la asignación de bits: https://huggingface.co/Jundot/Qwen3.6-35B-A3B-oQ4e-mtp
- Pack comparable evaluado: https://huggingface.co/scottlowry/Ornith-1.5-35B-A3B-oQ4e-mtp
- Midium (motor de despliegue): https://midium.dev
