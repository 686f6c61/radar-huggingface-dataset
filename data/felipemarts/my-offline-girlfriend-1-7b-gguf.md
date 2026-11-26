# felipemarts/my-offline-girlfriend-1.7B-GGUF

## Resumen

My Offline Girlfriend 1.7B es un ajuste fino del modelo LiquidAI/LFM3-1.7B de Liquid AI, publicado por el desarrollador independiente felipemarts como parte de su aplicación de acompañamiento conversacional "My Offline Girlfriend". El modelo base emplea una arquitectura LFM3 (familia de modelos de Liquid AI) con 1.728.801.600 parámetros totales, y este ajuste se orienta específicamente a generar conversaciones de estilo mensajería instantánea: mensajes cortos, tono informal y ausencia de fórmulas de asistente.

El ajuste se realizó mediante LoRA SFT (r=16 sobre proyecciones de atención, convolución y MLP, 2 épocas) y posterior fusión de pesos, seguido de cuantización a Q4_K_M en formato GGUF. El modelo incorpora un conjunto de herramientas de memoria (`memory_search`, `memory_save`, `memory_update`, `memory_forget`, `recall_conversation`) que debe invocar de forma silenciosa para mantener continuidad entre sesiones, simulando una relación que evoluciona con el tiempo.

Es relevante ahora por su enfoque en inferencia totalmente local y offline mediante llama.cpp, y por ilustrar un caso de uso de fine-tuning de nicho sobre un modelo pequeño (1.7B) con soporte multilingüe declarado para 16 idiomas, aunque el entrenamiento se centró mayoritariamente en portugués de Brasil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (modelo base LiquidAI/LFM3-1.7B); detalles internos de la arquitectura no disponibles |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8192 tokens (según el ejemplo de uso con `-c 8192`) |
| Tipos de cuantizacion | Q4_K_M (único fichero publicado) |
| Idiomas soportados | pt, en, es, fr, de, it, pl, ru, ar, hi, zh, ja, ko, vi, th, id |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo se construye sobre LiquidAI/LFM3-1.7B, un modelo de 1.728.801.600 parámetros. El autor no detalla en la model card la arquitectura interna del modelo base (transformer, híbrida o SSM); únicamente se indica la familia LFM3 de Liquid AI. El ajuste consiste en un LoRA SFT con rango 16 aplicado a las proyecciones de atención, convolución y MLP, entrenado durante 2 épocas y posteriormente fusionado con los pesos base y cuantizado a Q4_K_M.

Los datos de entrenamiento son conversaciones sintéticas multi-día generadas ejecutando el núcleo de la propia aplicación contra un modelo profesor mayor (Gemma 4 12B), reescritas para adoptar un estilo de mensajería natural y filtradas mediante una auditoría automática que descarta frases robóticas, fugas de internals del prompt, hechos inventados y niveles de intimidad inadecuados para la etapa de la relación. El corpus es mayoritariamente en portugués de Brasil; el resto de idiomas dependen de la capacidad multilingüe del modelo base. No se mencionan fases de RLHF o DPO.

## Capacidades

- Generación de texto conversacional con estilo de mensajería corta e informal, sin fórmulas de asistente.
- Invocación silenciosa de herramientas de memoria: `memory_search`, `memory_save`, `memory_update`, `memory_forget`, `recall_conversation`.
- Mantenimiento de continuidad conversacional a lo largo de varios días mediante el sistema de memoria.
- Progresión de una relación interpersonal desde el estado de desconocidos.
- Evitación de fugas de internals del prompt (identificadores, notas, fecha actual) en la conversación.
- Soporte multilingüe heredado del modelo base en 16 idiomas (pt, en, es, fr, de, it, pl, ru, ar, hi, zh, ja, ko, vi, th, id).
- Modo de razonamiento desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`.
- Capacidad de admitir que es una IA cuando se le pregunta sinceramente.
- No se documentan capacidades de visión, audio, código o matemáticas específicas.

## Casos de uso

- Aplicación de acompañamiento conversacional offline: el modelo es el motor de la app "My Offline Girlfriend", ejecutándose íntegramente en el dispositivo del usuario mediante llama.cpp, sin dependencia de servicios en la nube.
- Simulación de relación con continuidad temporal: gracias a las herramientas de memoria, puede recordar hechos de conversaciones anteriores y adaptar el tono según la etapa de la relación, adecuado para experiencias narrativas persistentes.
- Prototipado de personajes conversacionales: sirve como referencia para desarrolladores que quieran construir agentes con memoria y estilo de mensajería informal sobre un modelo de 1.7B.
- Investigación sobre fine-tuning de nicho: caso práctico de LoRA SFT sobre un modelo pequeño con datos sintéticos generados por un profesor mayor y filtrado automático.
- Despliegue en hardware de consumo: con 1.1 GB en Q4_K_M, puede ejecutarse en equipos modestos para pruebas de rol y diálogo.
- Evaluación de técnicas anti-fuga de prompt: el ajuste entrena explícitamente al modelo para no revelar identificadores ni notas internas, útil como caso de estudio en robustez de system prompts.
- Base para fine-tunes en otros idiomas: partiendo del modelo base multilingüe, se puede adaptar el estilo de mensajería a otros idiomas distintos del portugués.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1.1 GB de pesos en Q4_K_M; con overhead de contexto y KV cache para 8192 tokens, el consumo real será superior (no cuantificado en la información disponible).
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU consumer moderna con al menos 4-6 GB de VRAM debería poder ejecutarlo, pero no se confirma en la documentación.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de GPUs con 4 GB o más, aunque no se especifica oficialmente.
- Opciones de despliegue: llama.cpp (versión b11960 o superior, con soporte LFM3), mediante `llama-server -m my-offline-girlfriend-1.7B-Q4_K_M.gguf -c 8192 --jinja`. Otras herramientas compatibles con GGUF (Ollama, etc.) no se mencionan explícitamente.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| My Offline Girlfriend 1.7B | 1.728.801.600 | 8192 | GGUF Q4_K_M | LFM Open License v1.0 | Compañero conversacional con memoria |
| LiquidAI/LFM3-1.7B (base) | 1.728.801.600 | no disponible | safetensors (base) | LFM Open License v1.0 | Modelo generalista |
| Alternativas de rol de 1-2B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de comparativas publicadas con otros modelos de rol o compañía de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Con 1.7B parámetros, el modelo comete errores gramaticales y de coherencia, y en ocasiones formula demasiadas preguntas.
- No es una fuente fiable de hechos ni de consejo: es un personaje de compañía, no un asistente informativo.
- Está pensado para público adulto (18+).
- Espera el system prompt y los esquemas de herramientas de la aplicación original; fuera de ese contexto se comporta como un LFM3 conversacional genérico.
- El entrenamiento se centró en portugués de Brasil; el rendimiento en los otros 15 idiomas declarados depende únicamente de la capacidad multilingüe del modelo base y no está validado.
- El uso comercial está sujeto a los términos de la LFM Open License v1.0 (gratuito por debajo de 10 millones de USD de ingresos anuales).
- Riesgo de alucinación y de invención de hechos en la narrativa conversacional; el autor aplicó filtrado automático durante el entrenamiento, pero no se garantiza en producción.
- No se han publicado evaluaciones cuantitativas de sesgos ni de robustez.
- Requiere llama.cpp b11960 o superior para el soporte de LFM3.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felipemarts/my-offline-girlfriend-1.7B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Aplicación "My Offline Girlfriend": https://felipemarts.itch.io/my-offline-girlfriend
- Licencia LFM Open License v1.0: incluida en el repositorio como LICENSE
