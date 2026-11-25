# Rahspide/MNN-Pocket-0.3B-RU-Chat-v2

## Resumen
MNN-Pocket-0.3B-RU-Chat-v2 es un modelo de lenguaje de 303 millones de parámetros especializado en instrucciones y conversación en ruso, desarrollado por Rahspide. Se construye mediante ajuste supervisado (SFT) sobre el modelo de continuación de texto Rahspide/MNN-Pocket-0.3B-RU, que a su vez deriva de una arquitectura base bilingüe chino/inglés de tipo Qwen3. El objetivo es ofrecer un asistente conversacional ligero que quepa en dispositivos de consumo y responda en ruso en lugar de continuar texto, un comportamiento que el modelo base no tenía.

La relevancia de esta versión radica en una reconstrucción completa del corpus de entrenamiento respecto a la v1. El autor documenta tres defectos en los datos originales (ventanas sin instrucción, formato de respuesta incorrecto y truncamiento a mitad de frase) y presenta métricas de cumplimiento de formato que mejoran de 2.52 a 3.81 sobre 90 prompts con requisito explícito. El modelo emplea la plantilla ChatML nativa y se distribuye con pesos en safetensors y cuantizaciones GGUF, con licencia Apache 2.0.

Con solo 303 millones de parámetros y un presupuesto de SFT de 12.2 millones de tokens, el modelo está pensado para despliegue en dispositivo (on-device) y entornos con recursos muy limitados, no para competición con modelos de gran escala. Su ventana de contexto no está especificada en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen3 (según tag `qwen3`), ajuste de instrucciones sobre modelo de continuación |
| Parámetros totales | 302.830.976 (303 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Q8_0, Q4_K_M, Q4_1 |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento
El modelo es un transformer denso de 303 millones de parámetros, derivado de la familia Qwen3 según las etiquetas del repositorio, y ajustado mediante SFT sobre Rahspide/MNN-Pocket-0.3B-RU. El modelo base se entrenó con continuación de texto sobre 1.2 mil millones de tokens de texto en ruso, lo que le proporciona competencia lingüística en ese idioma antes del ajuste conversacional. El SFT se realizó con la plantilla ChatML propia del modelo (`<|im_start|>` / `<|im_end|>`), calculando la pérdida únicamente sobre los tokens del asistente y enmascarando los turnos de sistema y usuario.

El corpus de entrenamiento consta de 12.2 millones de tokens de SFT: 10.737 ejemplos de `IlyaGusev/saiga_scored` (9.723 diálogos filtrados más 1.014 ejemplos de una capa de formato sintética, 4.85 M tokens) y 6.000 diálogos de `HuggingFaceH4/ultrachat_200k` como repetición en inglés (3.67 M tokens). El muestreo es 85/15 ruso/inglés y el 35 % de las ranuras en ruso provienen de la capa de formato. Se aplicaron filtros: solo ruso, eliminación de filas marcadas `is_bad_by_regex`, puntuación del dataset inferior a 6 descartada, diálogos de 80–6.000 caracteres y 2–8 turnos, eliminación de respuestas sin palabras de contenido compartidas con la pregunta y descarte de personas de role-play. El entrenamiento usó batches de ejemplos completos (sin cortar ventanas), 610 pasos de optimizador, lr 1e-4 con coseno y 5 % de warmup, ajuste completo en bf16 con pesos maestros en fp32, aproximadamente 1.1 horas en una T4 de Kaggle a unos 3.100 tokens/s.

## Capacidades
- Generación de texto conversacional y respuesta a instrucciones en ruso, con soporte secundario de inglés.
- Seguimiento de requisitos explícitos de formato en la respuesta (capa de formato sobremuestreada al 35 %).
- Conversación multi-turno con plantilla ChatML (system + user + assistant).
- Reescritura corta y respuestas de pregunta-respuesta.
- Capacidad bilingüe ruso/inglés para instrucciones.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking en la información disponible.

## Casos de uso
- Asistente conversacional en dispositivo: el tamaño de 303 M permite ejecutarlo en móviles o equipos de bajos recursos mediante GGUF Q4, gestionando diálogos multi-turno con la plantilla ChatML.
- Respuestas a preguntas frecuentes en ruso: el ajuste SFT sobre saiga_scored lo hace adecuado para Q&A de dominio general con respuestas concisas.
- Reescritura y reformulación de textos cortos: puede reformular frases o párrafos breves en ruso, tarea alineada con el corpus de chat filtrado.
- Autocompletado conversacional en aplicaciones de mensajería: integrado como sugeridor de respuestas en chats, con latencia baja gracias al reducido número de parámetros.
- Prototipado rápido de asistentes en ruso: sirve como baseline ligero para validar pipelines de despliegue (llama.cpp, Ollama) antes de escalar a modelos mayores.
- Filtrado y clasificación de diálogos: puede generar respuestas de formato controlado, útil en tareas de extracción o normalización de texto en ruso.
- Educación y demostraciones: modelo pequeño y de licencia permisiva para enseñar fine-tuning y despliegue on-device sin grandes recursos de GPU.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí reporta una evaluación propia de cumplimiento de formato sobre 90 prompts con requisito explícito:

| Métrica | v1 | v2 |
|---|---|---|
| Cumplimiento de requisito (escala 1–5), media | 2.52 | 3.81 |
| Diferencia pareada frente a v1 | — | +1.29 (t = 6.9, n = 90) |

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 0.6 GB en fp16/bf16 (303 M parámetros) y alrededor de 0.2–0.3 GB en GGUF Q4_K_M; el repo completo ocupa 0.8 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una T4 de 16 GB se usó para el entrenamiento y sobra para inferencia. También funciona en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1 GB de VRAM (GTX 1050, RTX 3050, RTX 4090, etc.) e incluso en CPU y dispositivos móviles.
- Opciones de despliegue: llama.cpp y Ollama mediante los GGUF publicados (Q8_0, Q4_K_M, Q4_1); transformers con safetensors; text-generation-inference según los tags del repositorio; el tag `mnn` sugiere soporte del runtime MNN para despliegue on-device.
- Latencia y throughput: no se han publicado mediciones de inferencia; el autor reporta unos 3.100 tokens/s durante el entrenamiento en una T4, dato no extrapolable a inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| MNN-Pocket-0.3B-RU-Chat-v2 | 303 M | no disponible | ru, en | Apache 2.0 | Chat/instrucciones en ruso, on-device |
| MNN-Pocket-0.3B-RU (hermano) | 303 M | no disponible | ru, en | Apache 2.0 | Continuación de texto en ruso, no responde instrucciones |
| MNN-Pocket-0.3B (base) | 303 M | no disponible | zh, en | no disponible | Modelo base bilingüe chino/inglés sin ruso |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias
- Riesgo de alucinación elevado por el reducido tamaño (303 M) y el corpus de chat general; no es fiable para hechos precisos.
- Capacidad limitada de razonamiento, matemáticas y código; no se documentan dichas habilidades.
- Longitud de contexto no especificada; probablemente corta, lo que restringe conversaciones muy largas o documentos extensos.
- El modelo está entrenado principalmente en ruso; el inglés es secundario y puede degradarse en tareas complejas.
- No soporta tool calling, agentes ni multimodalidad según la información disponible.
- El corpus de entrenamiento incluye datos sintéticos generados por un profesor, con posible propagación de sesgos y errores.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías; verificar la licencia de los datasets de origen (saiga_scored y ultrachat_200k, este último MIT).
- No debe usarse para autocompletado: está ajustado para responder, no para continuar texto.

## Enlaces
- Hugging Face: https://huggingface.co/Rahspide/MNN-Pocket-0.3B-RU-Chat-v2
- Modelo base (continuación): https://huggingface.co/Rahspide/MNN-Pocket-0.3B-RU
- Dataset ruso: https://huggingface.co/datasets/IlyaGusev/saiga_scored
- Dataset inglés: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
