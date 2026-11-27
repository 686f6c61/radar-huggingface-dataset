# HumanjavaEnterprises/EuroLLM-9B-Cooking-Assistant-GGUF

## Resumen

EuroLLM-9B Cooking Assistant (GGUF) es una cuantización en formato GGUF de un ajuste fino del modelo EuroLLM-9B-Instruct, desarrollado por Humanjava Enterprises. El modelo está especializado en asistencia culinaria multilingüe: lee recetas que se le proporcionan en el turno de usuario, las escala, responde preguntas sobre ingredientes, técnicas y seguridad alimentaria, y —cuando no dispone de la receta— tiende a pedirla en lugar de inventar cantidades. El ajuste fino se apoya en EuroLLM-9B-Instruct, un modelo de 9.152.319.488 parámetros del consorcio UTTER, y se distribuye bajo licencia Apache 2.0.

La propuesta diferencial del autor es la "linaje auditable": todos los modelos que intervinieron en la generación, etiquetado, filtrado o votación de los datos de entrenamiento y evaluación son modelos de pesos abiertos de laboratorios europeos (EuroLLM del consorcio UTTER, Apertus de la Swiss AI Initiative, Mistral-Small y Magistral-Small de Mistral AI), y un panel independiente externo a esa cadena verifica las métricas. El modelo se publica junto a su versión en precisión completa (safetensors) y forma parte de una familia de asistentes culinarios con hermanos basados en Qwen3-8B, GLM-4-9B y Olmo-3-7B.

Es relevante ahora porque ejemplifica un patrón de despliegue práctico —ajuste fino para el comportamiento, recuperación para los hechos, herramientas para los números— y porque cabe en una GPU de 8 GB en su cuantización por defecto Q4_K_M (5,6 GB). No obstante, el propio autor advierte de que en preguntas culinarias generales rinde por debajo del modelo base del que parte (54,9 % frente a 64,6 %), y de que la revisión humana de las etiquetas de entrenamiento está pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de EuroLLM-9B-Instruct); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 9.152.319.488 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el ejemplo de arranque usa `-c 8192`) |
| Tipos de cuantizacion | Q4_K_M, Q6_K, Q8_0, BF16 (GGUF); safetensors en precision completa en el repo base |
| Idiomas soportados | en, de, es, fr, it, nl, pt, pl, sv |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp, Ollama, LM Studio); safetensors en el repo base |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (y presumiblemente con preferencias, dado que el autor menciona "preference pairs" en la revisión humana pendiente) sobre EuroLLM-9B-Instruct, un transformer decoder-only de 9.152.319.488 parámetros. La model card no detalla la composición exacta del dataset de entrenamiento, el número de tokens empleados ni la receta de alineación (RLHF/DPO); solo indica que los datos cubren escalado de recetas, aritmética con cantidades impares de huevos, instrucciones del tipo "sal al gusto" y advertencias sobre tamaño de sartén y tiempos de cocción. El conjunto de evaluación es `HumanjavaEnterprises/cooking-assistant-eval`, con 682 preguntas culinarias en 21 idiomas: 290 con la receta mostrada, 10 de recuerdo del tipo "¿cómo se hace X?", 300 que requieren una receta no mostrada y 82 generales.

La innovación técnica destacable no está en la arquitectura sino en el proceso: linaje auditable de modelos intermedios (todos europeos y de pesos abiertos), evaluación ciega por dos paneles de jueces modelo (panel de votación europeo y panel independiente) y una matriz de importancia (imatrix) calculada sobre conversaciones de entrenamiento en formato chat para construir las cuantizaciones Q4_K_M y Q6_K. Cada archivo GGUF embebe la plantilla de chat ChatML (`<|im_start|>role … <|im_end|>`) y el system prompt por defecto, y el repo incluye `SHA256SUMS` para verificación. No hay modo de razonamiento (thinking mode).

## Capacidades

- Generación de texto conversacional multilingüe en nueve idiomas europeos (en, de, es, fr, it, nl, pt, pl, sv).
- Lectura y comprensión de recetas proporcionadas en el turno de usuario, respondiendo en el idioma de la pregunta.
- Escalado de recetas: aritmética de cantidades, recuentos impares de huevos, interpretación de "sal al gusto" y advertencias de tamaño de sartén y tiempo de cocción.
- Abstención y petición de información: cuando falta la receta, tiende a pedirla en lugar de inventar cantidades (tasa de invención del 11,4 % según el panel europeo, 14,3 % según el independiente).
- Respuesta a preguntas culinarias generales sobre platos, ingredientes, técnicas y seguridad alimentaria, con rendimiento inferior al modelo base.
- Plantilla de chat ChatML embebida en los GGUF, con system prompt por defecto que identifica al asistente.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento en la información proporcionada.

## Casos de uso

- Asistente de cocina en aplicación móvil o web: el modelo recibe la receta pegada por el usuario y responde dudas sobre sustituciones de ingredientes, tiempos y temperaturas, manteniendo la conversación multi-turno en el idioma del usuario gracias a su soporte de nueve idiomas europeos.
- Escalado de recetas para catering y cocinas profesionales: dado un recetario en texto, el modelo recalcula cantidades para 50, 120 o 300 comensales, gestiona huevos en números impares y añade advertencias sobre tamaño de bandeja y tiempo de horneado, capacidades entrenadas específicamente.
- Atención al cliente de un servicio de recetas o supermercado online: integrado con un buscador que recupera la receta del catálogo y la inyecta en el turno de usuario, el modelo responde consultas de clientes sobre ingredientes y alérgenos sin inventar datos, apoyándose en su comportamiento de abstención.
- Generación de fichas y variaciones de recetas en un CMS: el modelo reescribe una receta en otro idioma europeo o adapta instrucciones para distintos niveles de habilidad, con la receta original como contexto para evitar alucinaciones de cantidades.
- Educación culinaria y formación de personal de cocina: preguntas generales sobre técnicas (emulsionar, escaldar, fermentar) y seguridad alimentaria, con respuestas en el idioma del alumno y la posibilidad de adjuntar la receta del curso como contexto.
- Despliegue en hardware modesto para prototipos y demos: la cuantización Q4_K_M (5,6 GB) corre en una GPU de 8 GB con llama.cpp u Ollama, lo que permite montar un asistente culinario local sin infraestructura cloud.
- Evaluación de pipelines RAG culinarios: el conjunto de evaluación de 682 preguntas con y sin receta mostrada sirve para medir la calidad de la recuperación y la fidelidad del modelo al texto recuperado en un dominio concreto.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre un conjunto fijo de 682 preguntas culinarias en 21 idiomas, nunca usado en entrenamiento, con evaluación ciega por jueces modelo:

| Metrica | Panel europeo | Panel independiente |
|---|---|---|
| Respuestas correctas con receta mostrada | 83,8 % | 83,8 % |
| Invención de detalles sin receta (300 preguntas) | 11,4 % | 14,3 % |
| Preguntas culinarias generales (82) | 54,9 % | No disponible |
| EuroLLM-9B-Instruct en preguntas generales (referencia) | 64,6 % | No disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 5,6 GB en Q4_K_M (GPU de 8 GB o más), 7,5 GB en Q6_K (GPU de 10 GB o más), 9,7 GB en Q8_0 (GPU de 12 GB o más), 18,3 GB en BF16.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más para Q4_K_M (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 4070); RTX 4080/4090 para Q6_K y Q8_0; A100 o H100 para BF16 y despliegues de alta concurrencia.
- Cabe en GPU consumer: sí, en Q4_K_M desde 8 GB de VRAM; el repo completo ocupa 41,1 GB.
- Opciones de despliegue: llama.cpp (`llama-server -hf ... --jinja -c 8192`), Ollama (`ollama run hf.co/...:Q4_K_M`), LM Studio; vLLM y Transformers con los safetensors del repo base.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EuroLLM-9B Cooking Assistant (este) | 9,15 B | No disponible | Asistente culinario multilingüe sobre EuroLLM-9B | Apache 2.0 | GGUF + safetensors en HF |
| Qwen3-8B Cooking Assistant | 8 B (aprox.) | No disponible | Hermano de la misma familia sobre Qwen3-8B | No disponible en la informacion proporcionada | GGUF en HF |
| GLM-4-9B Cooking Assistant | 9 B (aprox.) | No disponible | Hermano de la misma familia sobre GLM-4-9B | No disponible en la informacion proporcionada | GGUF en HF |
| Olmo-3-7B Cooking Assistant | 7 B (aprox.) | No disponible | Hermano de la misma familia sobre Olmo-3-7B | No disponible en la informacion proporcionada | GGUF en HF |

No se dispone de datos comparativos de rendimiento entre los hermanos de la familia en la información proporcionada.

## Limitaciones y advertencias

- En preguntas culinarias generales rinde por debajo de su modelo base EuroLLM-9B-Instruct (54,9 % frente a 64,6 %): el ajuste fino especializa el comportamiento a costa de conocimiento general.
- Tasa de invención del 11,4 % (panel europeo) o 14,3 % (panel independiente) cuando se le pregunta por una receta que no se le ha mostrado; no debe usarse como fuente de recetas sin recuperación previa.
- La revisión humana de las etiquetas de entrenamiento está pendiente: no hay personas que hayan revisado aún las 50 respuestas aceptadas y 50 pares de preferencia previstos.
- El modelo no memoriza recetas; el diseño previsto exige que la aplicación recupere la receta y la inyecte en el contexto.
- Sin modo de razonamiento ni soporte documentado de tool calling o function calling.
- El conjunto de evaluación cubre 21 idiomas, pero la model card solo declara soporte de generación en nueve; el rendimiento en el resto no está caracterizado.
- Es un ajuste fino no oficial, no respaldado por el proyecto EuroLLM ni por el consorcio UTTER; posibles sesgos heredados del modelo base y de los jueces modelo que generaron y evaluaron los datos no están analizados en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la exactitud de las respuestas en contextos de seguridad alimentaria.
- El modelo se identifica como EuroLLM si se usa el system prompt de entrenamiento, ya que los datos no contienen respuestas de identidad; usar el system prompt por defecto del template para que se identifique como Cooking Assistant.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/HumanjavaEnterprises/EuroLLM-9B-Cooking-Assistant-GGUF
- Hugging Face (safetensors, precisión completa): https://huggingface.co/HumanjavaEnterprises/EuroLLM-9B-Cooking-Assistant
- Hermano Qwen3-8B: https://huggingface.co/HumanjavaEnterprises/Qwen3-8B-Cooking-Assistant-GGUF
- Hermano GLM-4-9B: https://huggingface.co/HumanjavaEnterprises/GLM-4-9B-Cooking-Assistant-GGUF
- Hermano Olmo-3-7B: https://huggingface.co/HumanjavaEnterprises/Olmo-3-7B-Cooking-Assistant-GGUF
- Guía de despliegue: https://github.com/HumanjavaEnterprises/qwen3-8b-cooking-assistant/tree/main/eurollm-9b
- Dataset de evaluación: https://huggingface.co/datasets/HumanjavaEnterprises/cooking-assistant-eval
