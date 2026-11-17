# mcschin75/MarineSparkLM-4Bv1

## Resumen

MarineSparkLM-4Bv1 es un adaptador LoRA de instrucciones para ingeniería marina y offshore, desarrollado por el Dr. Cheng Siong Chin (Faculty of Science, Agriculture and Engineering, Newcastle University, Singapur). No es un modelo completo, sino un adaptador PEFT que se aplica sobre el modelo base zjunlp/OceanGPT-basic-4B-Instruct, un transformer de 4,06 mil millones de parámetros con arquitectura Qwen3. El adaptador entrena únicamente 33.030.144 parámetros, el 0,81 % del modelo base, y está ajustado con enmascaramiento de pérdida solo sobre los tokens de respuesta.

El problema que aborda es la especialización de un modelo generalista en el dominio marítimo y offshore: arquitectura naval, hidrodinámica, propulsión y maquinaria, estructuras offshore, energía offshore, control y autonomía, vehículos marinos, sensores y comunicaciones, simulación y modelado, y operaciones marítimas. El entrenamiento se realizó sobre 2.295 pares pregunta-respuesta repartidos entre esos diez temas.

Su relevancia actual reside en que demuestra que un ajuste paramétrico muy ligero (menos del 1 % de los pesos) puede desplazar de forma medible el comportamiento de un modelo de 4B hacia un dominio técnico concreto, manteniendo un coste de entrenamiento y de almacenamiento muy bajo (el repositorio ocupa 0,1 GB). No obstante, el propio autor advierte que la precisión absoluta sigue siendo modesta y que el adaptador no debe tratarse como una fuente verificada de hechos de ingeniería.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3 (modelo base OceanGPT-basic-4B-Instruct) |
| Parámetros totales | 33.030.144 parámetros entrenables en el adaptador (0,81 % del base de 4,06B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16 y 4-bit NF4 mediante bitsandbytes |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre zjunlp/OceanGPT-basic-4B-Instruct, un transformer de 4,06B parámetros con arquitectura Qwen3. La adaptación se realiza mediante LoRA con PEFT 0.21.2, entrenando 33.030.144 parámetros (0,81 % del total del modelo base). El ajuste es de tipo instruction tuning con enmascaramiento de respuesta: la pérdida se calcula únicamente sobre los tokens de la respuesta, no sobre el prompt.

El conjunto de entrenamiento consta de 2.295 pares pregunta-respuesta. De ellos, 114 fueron escritos manualmente leyendo un pasaje real del corpus y formulando una pregunta que ese pasaje responde; los 2.181 restantes se generaron pidiendo al modelo base sin adaptar que formulara preguntas a partir de 1.197 pasajes adicionales filtrados por precisión, con el objetivo de no contaminar el adaptador con los sesgos de otro adaptador. Los datos cubren diez temáticas de ingeniería marina y offshore. El autor documenta en el paper el proceso completo de construcción del dataset, los pasos de filtrado y las limitaciones conocidas (ruido temático residual y variación de licencias entre fuentes).

## Capacidades

- Generación de texto conversacional especializado en ingeniería marina y offshore.
- Respuesta a preguntas técnicas sobre arquitectura naval, hidrodinámica, propulsión y maquinaria, estructuras offshore, energía offshore, control y autonomía, vehículos marinos, sensores y comunicaciones, simulación y modelado, y operaciones marítimas.
- Instrucción conversacional mediante plantilla de chat (`apply_chat_template`).
- Soporte de carga en 4 bits (NF4) con bitsandbytes, con calidad de salida comparable a bf16 según el benchmark de cuantización del paper.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según los metadatos del modelo.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistencia técnica en diseño naval: el adaptador puede responder consultas sobre consideraciones de arquitectura naval e hidrodinámica, sesgado hacia terminología y enfoque del dominio, útil como primer borrador que un ingeniero revisa después.
- Consultas sobre cumplimiento normativo marítimo: por ejemplo, explicar consideraciones de sistemas de tratamiento de agua de lastre para el cumplimiento de la normativa marítima, tal como se muestra en el ejemplo de uso de la model card.
- Formación y documentación interna: generación de explicaciones introductorias sobre estructuras offshore, energía offshore o propulsión para materiales de formación, siempre con revisión experta posterior.
- Prototipado de asistentes conversacionales de dominio: al ser un adaptador de 0,1 GB sobre un base de 4B, permite desplegar un asistente especializado con un coste de almacenamiento y de ajuste muy reducido.
- Exploración de temas de operaciones marítimas: apoyo a la redacción de borradores sobre simulación, modelado, sensores y comunicaciones en contextos marítimos.
- Investigación sobre adaptación de dominio eficiente: el propio adaptador sirve como caso de estudio reproducible de ajuste LoRA con menos del 1 % de parámetros sobre un modelo de 4B, con metodología y evaluación publicadas.
- Despliegue con recursos limitados: la carga en 4 bits NF4 reduce aproximadamente a la mitad el tiempo de carga y la memoria frente a bf16, lo que facilita su uso en entornos con GPU de gama media.

## Benchmarks y rendimiento

| Evaluación | MarineSparkLM-4Bv1 | Modelo base sin adaptar | Adaptador solo de continuación |
|---|---|---|---|
| Evaluación manual de 20 prompts (precisión + topicalidad + especificidad, 0-2 cada una, máximo 120) | 84/120 | 42/120 | 56/120 |
| Precisión absoluta en evaluación retenida | 14-16 de 40 | no disponible | no disponible |

La segunda evaluación, sobre prompts nunca vistos en entrenamiento, validación ni selección de checkpoint, confirma la mejora con alta significación estadística (Wilcoxon pareado, p = 0,0001). El autor indica que la recuperación aumentada por generación (RAG) sobre este adaptador no muestra beneficio significativo en las evaluaciones retenidas del paper.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el modelo base tiene 4,06B parámetros, por lo que en bf16 requiere del orden de 8-9 GB solo para pesos, y en 4-bit NF4 aproximadamente la mitad según el autor.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; por tamaño del base (4B) es plausible en GPUs de consumo con suficiente VRAM, pero no hay dato publicado que lo confirme.
- Opciones de despliegue: transformers con PEFT (`PeftModel.from_pretrained`) y bitsandbytes para 4-bit; otras opciones (vLLM, llama.cpp, Ollama, TGI) no están documentadas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MarineSparkLM-4Bv1 | 33M entrenables sobre base de 4,06B | no disponible | Adaptador LoRA de dominio marino/offshore | MIT | Hugging Face |
| zjunlp/OceanGPT-basic-4B-Instruct (base) | 4,06B | no disponible | Modelo instructivo base de dominio oceánico | no disponible | Hugging Face |
| Adaptador solo de continuación (referencia del paper) | no disponible | no disponible | Adaptación alternativa evaluada en el paper | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La precisión absoluta es modesta: 14-16 de 40 en la evaluación retenida. El adaptador sesga el modelo hacia el dominio marino y hacia comprometerse con una respuesta concreta, pero no garantiza corrección factual.
- Las respuestas de referencia usadas en la evaluación fueron escritas por el propio modelo base, lo que el autor aborda en la sección de limitaciones del paper.
- RAG sobre este adaptador no muestra beneficio significativo en las evaluaciones retenidas del paper.
- Las salidas deben verificarse de forma independiente antes de cualquier decisión de ingeniería, seguridad o normativa.
- Ruido temático residual en el dataset de entrenamiento y variación de licencias entre las fuentes del corpus, documentados en el paper.
- Idioma limitado al inglés.
- Licencia MIT: permite uso comercial, pero al ser un adaptador sobre un modelo base, deben respetarse también los términos del modelo base zjunlp/OceanGPT-basic-4B-Instruct.
- Longitud de contexto no documentada en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/mcschin75/MarineSparkLM-4Bv1
- Modelo base: https://huggingface.co/zjunlp/OceanGPT-basic-4B-Instruct
- Paper (arXiv): https://doi.org/10.48550/arXiv.2611.19151
- arXiv eprint: arxiv:2611.19151
