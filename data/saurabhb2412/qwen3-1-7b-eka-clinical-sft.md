# saurabhb2412/qwen3-1.7b-eka-clinical-sft

## Resumen

qwen3-1.7b-eka-clinical-sft es un ajuste fino supervisado (SFT) completo del modelo Qwen/Qwen3-1.7B, desarrollado por el usuario saurabhb2412 y orientado a dos tareas concretas del ámbito clínico indio: el resumen de informes de laboratorio reales (detección de valores fuera de rango, resumen en lenguaje llano y línea de derivación) y la respuesta a preguntas médicas de opción múltiple (MCQA) con el registro idiomático de los exámenes y la farmacología de la India. El modelo se distribuye con licencia Apache-2.0 y pesos en safetensors, con 1.720.050.688 parámetros totales.

El problema que aborda es la adaptación de un modelo pequeño y genérico (1,7 mil millones de parámetros) a un flujo de trabajo muy específico: interpretar listados de pruebas analíticas con sus rangos de referencia y señalar las anomalías. Para ello se entrenó sobre 219.662 conversaciones de entrenamiento y 1.103 de validación (unos 259 millones de tokens empaquetados a 4096 tokens), combinando 99.509 informes de laboratorio derivados de ekacare/NidaanKosha-100k-V1.0 con 120.153 preguntas MCQA de openlifescienceai/medmcqa.

Su relevancia actual es doble: por un lado, demuestra que un SLM de 1,7B puede adquirir una habilidad de formato y señalización muy concreta con una sola época de SFT; por otro, el propio autor documenta con honestidad que este ajuste degrada la precisión general en MCQA respecto al modelo base, lo que lo convierte en un caso de estudio útil sobre el intercambio entre especialización y rendimiento general. No es un dispositivo médico ni sustituye a un modelo médico de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino completo por SFT |
| Parametros totales | 1.720.050.688 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (longitud de empaquetado usada en entrenamiento); el contexto nativo de Qwen3-1.7B no se detalla en la información disponible |
| Tipos de cuantizacion | No disponible (el repo contiene safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible oficialmente; los datos de entrenamiento son en inglés, con evaluación separada en inglés e hindi |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only denso de 1,7 mil millones de parámetros, y se somete a un ajuste fino supervisado completo (no LoRA) con TRL 1.18 `SFTTrainer` durante una época. El entrenamiento usó empaquetado a 4096 tokens (BFD packing), batch efectivo de 16 (8×2), learning rate 2e-5 con scheduler coseno, 50 pasos de calentamiento, precisión bf16 y el kernel `kernels-community/flash-attn2`. Se ejecutó en una única GPU H200: 4.341 pasos a 2,45 s/paso, con un rendimiento de 25,9k tokens/s. La pérdida final de entrenamiento fue 0,3297 y la de evaluación 0,3162, con una precisión de token en evaluación de 0,914.

El corpus combina dos habilidades. Para informes de laboratorio, 99.509 conversaciones construidas a partir de ekacare/NidaanKosha-100k-V1.0 (CC-BY-SA-4.0): el mensaje del usuario es el informe como lista de pruebas con rangos de referencia y la respuesta del asistente es un resumen de valores anómalos generado a partir de los propios datos. Los rangos categóricos multlínea (tablas de lípidos, HbA1c, vitamina D) nunca se señalan numéricamente. Para MCQA, 120.153 preguntas de openlifescienceai/medmcqa (Apache-2.0), restringidas a filas de opción única con opciones no nulas, respondidas como letra más la explicación de la fuente. No se documenta RLHF ni DPO; es SFT puro sobre datos generados por plantilla y datos de examen.

## Capacidades

- Generación de texto conversacional en formato de chat (roles user/assistant).
- Resumen de informes de laboratorio: identificación de valores fuera de rango frente a rangos de referencia, línea de resultados normales y recomendación de siguiente paso.
- Señalización estructurada de anomalías analíticas (por ejemplo, hemoglobina baja frente a rango 13,0-17,0 g/dL).
- Respuesta a preguntas médicas de opción múltiple en el formato de exámenes indios, devolviendo la letra y una explicación.
- Manejo de vocabulario farmacológico y clínico del contexto indio (fármacos, pruebas, terminología de laboratorio).
- Capacidad multilingüe limitada: hay datos y evaluación en inglés e hindi para MCQA, aunque el hindi degrada notablemente.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido (thinking) específico de este ajuste.

## Casos de uso

- Triaje de informes de laboratorio en un portal de pacientes: el modelo recibe el listado de pruebas con rangos de referencia y devuelve un resumen con los valores anómalos y una línea de derivación, adecuado porque fue entrenado exactamente con ese formato sobre 99.509 informes reales.
- Generación de borradores de resumen para revisión humana en un laboratorio clínico: se usa como primer paso automático que un técnico valida, ya que la salida es plantilla y formato, no juicio clínico.
- Preparación de exámenes médicos (MCQA): útil como generador de respuestas explicadas para bancos de preguntas al estilo de los exámenes indios, con la salvedad de la precisión moderada.
- Formación y evaluación de personal sanitario: el modelo puede explicar por qué un valor está fuera de rango citando el rango de referencia, lo que sirve como material didáctico de bajo coste.
- Filtrado y clasificación de resultados anómalos en pipelines de datos clínicos: al devolver una estructura predecible (valor, rango, estado), se puede parsear para alertas automatizadas.
- Prototipado rápido de asistentes clínicos en entornos con recursos limitados: al ser un modelo de 1,7B, cabe en una sola GPU de consumo y permite iterar sobre flujos de laboratorio sin infraestructura grande.
- Investigación sobre especialización de SLM: sirve como caso controlado para estudiar la pérdida de rendimiento general (MCQA) al especializar un modelo pequeño en una tarea de formato.

## Benchmarks y rendimiento

Evaluación del autor sobre la batería MCQA de ekacare, con parseo greedy de la letra y conjuntos de test completos:

| Conjunto | n | Precisión |
|---|---:|---:|
| ekacare/indian_drug_mcqa | 1.512 | 0,397 |
| ekacare/Eka_NFI_MCQA | 921 | 0,455 |
| ekacare/MedMCQA-Indic (en) | 4.183 | 0,438 |
| ekacare/MedMCQA-Indic (hi) | 4.183 | 0,348 |
| mmlu-medical (8 configuraciones) | 1.553 | 0,466–0,671 |

La tasa de parseo fue igual o superior a 0,98 en todos los conjuntos. El autor indica que el Qwen3-1.7B base ya obtiene una precisión en torno a la mitad de la escala (mid-50s) en MCQA estilo MedMCQA, por lo que este SFT intercambió precisión general por la habilidad de resumen de informes; la caída en drug-MCQA respecto al base se reconoce explícitamente. El hindi es el idioma más degradado (0,348).

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, aproximadamente 3,5 GB solo para pesos (1,72B × 2 bytes), más overhead de activaciones y caché KV; en cuantización de 8 bits, en torno a 2 GB; en 4 bits, alrededor de 1,2 GB. Estas cifras son estimaciones a partir del número de parámetros, no datos publicados por el autor.
- GPU recomendadas: el autor entrenó en 1× H200; para inferencia basta una GPU mucho menor. Una RTX 4090 (24 GB), RTX 3090 (24 GB), L4 (24 GB) o A10G (24 GB) sobran para bf16.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en bf16 (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 3070) y en tarjetas de 4-6 GB con cuantización a 4 bits.
- Opciones de despliegue: transformers (pipeline documentado en la model card), text-generation-inference (etiqueta `text-generation-inference` en el repo) y, previsiblemente, vLLM y llama.cpp/Ollama si se generan pesos GGUF, aunque el repo no incluye actualmente esos formatos.
- Latencia y throughput: el autor reporta 25,9k tokens/s durante el entrenamiento en H200; no se publican cifras de latencia o throughput de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-1.7b-eka-clinical-sft | 1,72B | 4096 (entrenamiento) | SFT clínico indio (informes + MCQA) | Apache-2.0 | Hugging Face |
| Qwen/Qwen3-1.7B (base) | 1,72B | No disponible en la información | Modelo generalista | Apache-2.0 | Hugging Face |
| MedMCQA-style SLM genéricos | No disponible | No disponible | MCQA médica | No disponible | No disponible |

La comparación más directa es con el propio Qwen3-1.7B base: mismo tamaño y licencia, pero el ajuste especializado rinde peor en MCQA general (según el autor, el base está en la mitad de la escala en MedMCQA) y mejor en el formato de resumen de informes. No se dispone de datos de otros SLM clínicos comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un dispositivo médico: el autor lo declara explícitamente como artefacto de investigación y sus salidas no constituyen consejo médico.
- Los resúmenes de laboratorio son generados por plantilla a partir de los valores de NidaanKosha; el modelo aprende señalización y formato, no juicio clínico.
- La precisión en MCQA es moderada y en varios conjuntos inferior al modelo base; no debe usarse como sustituto de un LLM médico general.
- Degradación notable en hindi (0,348 en MedMCQA-Indic hi) y ausencia de datos de entrenamiento de informes de laboratorio en hindi, por lo que el comportamiento en ese idioma para entradas tipo informe no está medido.
- Riesgo de alucinación en recomendaciones de siguiente paso y en explicaciones de MCQA, ya que las respuestas se generan por plantilla y no por validación clínica.
- Sesgos potenciales derivados de los datos de origen (población india, terminología de exámenes locales) y de la composición del corpus de MCQA.
- Licencia Apache-2.0 permite uso comercial, pero la licencia de los datos de origen (CC-BY-SA-4.0 para NidaanKosha) puede imponer obligaciones de atribución y compartir igual sobre obras derivadas; conviene revisarlo antes de producción.
- No se documentan variantes cuantizadas ni pesos GGUF en el repo, lo que limita el despliegue en entornos de bajos recursos sin conversión previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saurabhb2412/qwen3-1.7b-eka-clinical-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/saurabhb2412/eka-clinical-sft-train
- Dataset de informes: https://huggingface.co/datasets/ekacare/NidaanKosha-100k-V1.0
- Dataset de MCQA: https://huggingface.co/datasets/openlifescienceai/medmcqa
- Conjunto de evaluación indian_drug_mcqa: https://huggingface.co/datasets/ekacare/indian_drug_mcqa
- Conjunto de evaluación Eka_NFI_MCQA: https://huggingface.co/datasets/Eka_NFI_MCQA
- Conjunto de evaluación MedMCQA-Indic: https://huggingface.co/datasets/ekacare/MedMCQA-Indic
- Panel de seguimiento del entrenamiento (Trackio): https://huggingface.co/spaces/saurabhb2412/qwen3-eka-clinical-sft-trackio
