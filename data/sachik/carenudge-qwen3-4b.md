# SachiK/carenudge-qwen3-4b

## Resumen

CareNudge Qwen3-4B es un ajuste fino mediante QLoRA del modelo Qwen3-4B-Instruct-2507, desarrollado por el usuario SachiK y publicado en Hugging Face. El modelo está diseñado para una tarea muy concreta: leer el mensaje de un paciente en un chat, clasificar su urgencia en cinco niveles (EMERGENCY, URGENT, SOON, ROUTINE, NEEDS_INFO) y responder en pocas frases con un siguiente paso claro. La salida combina una primera línea con etiquetas XML que contienen un JSON legible por máquina y, a continuación, el texto dirigido al paciente.

Se trata de un modelo denso de 4.022.468.096 parámetros con licencia Apache 2.0, pensado como demostración de portfolio y no como producto clínico. El autor lo describe explícitamente como "no medical advice and not a medical device", entrenado únicamente con datos sintéticos y sin validación clínica. Su relevancia radica en mostrar un patrón de diseño interesante: un modelo pequeño especializado que se usa como componente dentro de un sistema de dos capas, con una capa determinista de reglas (regex con manejo de negaciones) que actúa como suelo de seguridad.

El modelo se entrenó con QLoRA de 4 bits y se fusionó en bf16 sobre los pesos base, en una sola GPU T4 durante unos 23 minutos. La model card reporta métricas muy altas en su conjunto de test (95,4 % de precisión, 2,3 % de infra-triage), aunque el propio autor advierte que el conjunto de test comparte autoría con el de entrenamiento, por lo que esas cifras sobreestiman el rendimiento real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Entrenamiento en QLoRA 4-bit NF4; pesos finales fusionados en bf16. Otras cuantizaciones no disponibles |
| Idiomas soportados | Ingles unicamente (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer denso de aproximadamente 4.000 millones de parámetros. Sobre él se aplicó un ajuste fino QLoRA con cuantización 4-bit NF4 usando el `SFTTrainer` de TRL, con rango LoRA 16, alpha 32, dropout 0,05 y adaptadores en todas las capas lineales. El entrenamiento se extendió 3 épocas con tasa de aprendizaje 2e-4, scheduler coseno y batch efectivo de 16, durante unos 23 minutos en una única GPU T4 en Kaggle. Posteriormente los adaptadores se fusionaron en los pesos base en bf16.

Los datos de entrenamiento son completamente sintéticos: 694 conversaciones de entrenamiento y 77 de validación, generadas por un script a partir de un catálogo escrito a mano de 27 escenarios (10 de emergencia, 6 urgentes, 6 de atención próxima y 5 rutinarios). Cada escenario tiene cinco formulaciones de paciente; las tres primeras van a entrenamiento y las dos últimas se reservan para test. Las conversaciones adoptan tres formas: síntoma directo, apertura vaga seguida de pregunta aclaratoria, y paciente que pide esperar (donde el asistente mantiene el nivel de urgencia). También se incluyen preguntas informativas como "¿cuáles son los signos de un ictus?", respondidas sin escalar la urgencia. No se menciona uso de RLHF ni DPO.

## Capacidades

- Clasificación de urgencia en cinco niveles con salida estructurada en XML/JSON (`<triage>...</triage>`).
- Identificación de señales de alarma ("red_flags") y del posible cuadro clínico ("concern") en el JSON de salida.
- Generación de texto conversacional dirigido al paciente, en pocas frases y con un siguiente paso claro.
- Manejo de conversaciones multi-turno con tres formas de diálogo predefinidas (síntoma directo, apertura vaga, petición de espera).
- Respuesta a preguntas informativas de salud sin escalar indebidamente la urgencia.
- Capacidad de solicitar información adicional mediante el nivel `NEEDS_INFO`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no, solo inglés.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Demostración de triaje conversacional en un Space de Hugging Face: el modelo alimenta la demo pública CareNudge, donde un usuario introduce un síntoma y recibe una clasificación de urgencia junto con una recomendación. Es adecuado por su salida estructurada y su bajo coste de inferencia (4B parámetros).
- Componente de un sistema de dos capas con suelo de seguridad determinista: en la aplicación real, una capa de regex con manejo de negaciones revisa cada mensaje y el nivel final es el más urgente de los dos. El modelo encaja aquí porque su función es proponer un nivel que luego se contrasta.
- Investigación sobre ajuste fino con QLoRA en dominios de alto riesgo: el repositorio incluye generador de datos y evaluación, lo que permite reproducir el pipeline completo (694 conversaciones sintéticas, 27 escenarios) y estudiar cómo se comporta un modelo de 4B tras un ajuste ligero.
- Estudio de formato de salida híbrido máquina-texto: el patrón de una línea XML con JSON seguida de texto libre para el usuario es reutilizable en otros asistentes que necesitan parsed output y respuesta legible en la misma generación.
- Evaluación de infra-triage y sobre-triage en sistemas de clasificación: la model card reporta métricas específicas (under-triage, emergency recall) que sirven como plantilla para diseñar evaluaciones de sistemas similares.
- Prototipado de asistentes de salud en inglés con restricciones de coste: al ser un modelo de 4B parámetros con licencia Apache 2.0, puede desplegarse en hardware modesto para pruebas internas sin incurrir en costes de API.

## Benchmarks y rendimiento

Resultados reportados por el autor en el conjunto de test reservado (260 conversaciones construidas a partir de 54 formulaciones de paciente no vistas en entrenamiento):

| Sistema | Precision | Under-triage | Recall de emergencia |
|---|---|---|---|
| Solo reglas | 65,4 % | 19,2 % | 85 % |
| Modelo base, zero-shot | 57,3 % | 13,8 % | 68 % |
| Modelo base, prompt few-shot | 69,6 % | 17,3 % | 57 % |
| Este modelo | 95,4 % | 2,3 % | 98 % |
| Este modelo + reglas (lo que ejecuta la app) | 97,7 % | 0,0 % | 100 % |

Además, en 12 preguntas informativas no vistas en entrenamiento, el modelo responde las 12 sin escalar la urgencia. El autor indica que sus respuestas nunca ofrecieron falsa tranquilidad ni sugirieron conducir en lugar de llamar al 911. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Para un modelo denso de 4B parámetros, la estimación orientativa sería de unos 8 GB en bf16/fp16 y de 2,5 a 3 GB en cuantización de 4 bits, aunque el autor no publica cifras.
- GPU recomendadas: no disponible en la información proporcionada. El entrenamiento se realizó en una única T4 (16 GB) en Kaggle.
- ¿Cabe en GPU de consumo? No confirmado por el autor, pero por tamaño (4B) es plausible en tarjetas con 8 GB o más en cuantización de 4 bits.
- Opciones de despliegue: la model card menciona `transformers` y el tag `text-generation-inference`; también aparece `endpoints_compatible`. No se detallan configuraciones para vLLM, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| CareNudge Qwen3-4B | 4,02 B | No disponible | Apache 2.0 | Triaje conversacional en ingles (demo) | Hugging Face |
| Qwen3-4B-Instruct-2507 (base) | 4 B aprox. | No disponible | Apache 2.0 | Instruccion general | Hugging Face |
| Modelos de triaje clinico especializados | No disponible | No disponible | No disponible | Clasificacion de urgencia | No disponible |

La comparación más directa es con su modelo base Qwen3-4B-Instruct-2507: en el test del autor, el ajuste fino eleva la precisión del 57,3 % (zero-shot) al 95,4 % y el recall de emergencia del 68 % al 98 %, a costa de un aumento del infra-triage del 13,8 % al 2,3 %. No se dispone de información sobre otros modelos comparables de triaje clínico en la documentación proporcionada.

## Limitaciones y advertencias

- El conjunto de test comparte autoría con el de entrenamiento: las formulaciones son nuevas, pero la misma persona escribió ambas a partir de la misma lista de escenarios, por lo que las métricas sobreestiman el rendimiento real.
- Las reglas de la capa determinista se ajustaron contra los mismos 27 escenarios, lo que explica en parte que nunca sobre-clasifiquen un mensaje de test; es esperable un mayor número de falsas alarmas con otras formulaciones.
- Cobertura muy estrecha: 27 escenarios son una porción mínima de la medicina; cualquier caso fuera de ellos es una conjetura.
- En respuestas de "pedir esperar", el modelo mantiene el nivel de urgencia en los 44 casos de test, pero en 13 de esas respuestas no repite el siguiente paso; la aplicación lo añade cuando ocurre.
- Solo inglés y números de emergencia de EE. UU. (911).
- Entrenado exclusivamente con datos sintéticos y sin validación clínica. No es un dispositivo médico y no debe usarse para triar pacientes reales.
- Riesgo de alucinación y de sesgos: no evaluado en la información proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la advertencia del autor sobre uso clínico prevalece como caveat ético y de responsabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SachiK/carenudge-qwen3-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Demo Space: https://huggingface.co/spaces/SachiK/carenudge
- Repositorio de código, generador de datos y evaluación: https://github.com/SachiK0thari/care-nudge
- System prompt usado en entrenamiento: https://github.com/SachiK0thari/care-nudge/blob/main/src/carenudge/prompts.py
