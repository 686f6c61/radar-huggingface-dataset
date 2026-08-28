# ningpy/redflag-detection-V4.2

## Resumen

El modelo `ningpy/redflag-detection-V4.2` es un ajuste fino (fine-tuning) del modelo base `Qwen/Qwen2.5-7B-Instruct`, desarrollado por el autor ningpy, especializado en la extracción de banderas rojas médicas (red flags) a partir de texto clínico. Su objetivo es cumplir de forma estricta con la especificación "Red Flad_New" de un asesor médico de agosto de 2026, que define 59 reglas para detectar signos de alarma en historiales de pacientes. Es relevante porque aborda un problema crítico en entornos clínicos: la identificación automática de síntomas que requieren atención urgente, reduciendo el riesgo de omisión en la práctica asistencial.

El modelo se basa en una arquitectura transformer (Qwen2.5) con 7.615.616.512 parámetros, entrenado con una estrategia LoRA (r=32, alpha=64) sobre 7 proyecciones objetivo, y fusionado posteriormente. Soporta tres idiomas: inglés, chino y malayo. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales. La versión V4.2 corrige desviaciones de versiones anteriores al eliminar reglas y síntomas fuera del alcance oficial, logrando una mejora en exactitud y F1 respecto a la V4.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5) |
| Parámetros totales | 7.615.616.512 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-7B-Instruct soporta 32 768 tokens, pero no se especifica en la card) |
| Tipos de cuantización | No disponible (solo se publican pesos en safetensors; no se indican versiones cuantizadas) |
| Idiomas soportados | Inglés (en), chino (zh), malayo (ms) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer causal con atención completa, y se somete a un ajuste fino supervisado mediante LoRA (r=32, alpha=64) sobre 7 proyecciones objetivo (probablemente q, k, v, o, gate, up, down). El entrenamiento se realizó durante 3 épocas con una tasa de aprendizaje de 2e-5, longitud de secuencia de 1900 tokens, y distribuido en 8 GPUs V100 con DDP. El conjunto de datos de entrenamiento consta de 3766 muestras: 3735 de la versión V20f más 31 muestras de refuerzo negativo (patch20e_neg). Los datos se sanitizaron eliminando 81 muestras con casos huérfanos y 160 menciones de síntomas huérfanos en las etiquetas. No se menciona el uso de RLHF ni DPO; es un fine-tuning supervisado clásico.

La innovación clave reside en el cumplimiento estricto de una especificación médica de 59 reglas, lo que implica un diseño de etiquetado y un prompt específico (versión v11) que guía al modelo hacia la extracción de banderas rojas con un esquema cerrado de 89 síntomas. El motor de reglas externo (rule_engine_v20.py) complementa al modelo para filtrar salidas no conformes.

## Capacidades

- Extracción de banderas rojas médicas (red flags) a partir de texto clínico, siguiendo una especificación de 59 reglas y 89 síntomas cerrados.
- Generación de texto en formato conversacional, heredado del modelo base instructivo.
- Soporte multilingüe en inglés, chino y malayo.
- Detección de síntomas de alarma como dolor torácico, cefalea súbita, signos de shock, etc., según las reglas definidas.
- Integración con un motor de reglas externo (V20) que valida y filtra las salidas del modelo para garantizar conformidad con la especificación.
- No se documentan capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- Triaje en urgencias: el modelo puede analizar la descripción del paciente y extraer banderas rojas que indiquen necesidad de atención inmediata, ayudando a priorizar casos en servicios de emergencia.
- Revisión de historiales clínicos: procesa notas médicas previas para detectar signos de alarma que pudieran haber pasado desapercibidos, actuando como segunda opinión automatizada.
- Soporte a la decisión clínica en atención primaria: el médico introduce el texto de la consulta y el modelo devuelve las banderas rojas relevantes, reduciendo el riesgo de omisión en entornos con alta carga asistencial.
- Auditoría de calidad asistencial: se puede usar para revisar registros médicos y verificar si se documentaron adecuadamente los signos de alarma, mejorando la trazabilidad clínica.
- Formación de personal sanitario: como herramienta educativa, muestra ejemplos de extracción de red flags y explica qué reglas aplican en cada caso.
- Sistemas de telemedicina: integrado en plataformas de consulta remota, analiza el texto del paciente y alerta sobre posibles emergencias antes de la valoración médica.

## Benchmarks y rendimiento

La model card reporta resultados sobre un conjunto de validación de 269 casos con evaluación estricta (exact match, precisión, recall, F1) y una evaluación clínica alternativa (SUSPECTED = TP para recall). Los datos comparativos entre versiones V4.0, V4.1 y V4.2 son los siguientes:

| Métrica | V4.0 (V20c) | V4.1 (V20d) | V4.2 (V20g) |
|---|---|---|---|
| Exact Match | 89.2% | 87.0% | 89.6% |
| Precision | 0.918 | 0.901 | 0.921 |
| Recall | 0.749 | 0.786 | 0.779 |
| F1 | 0.825 | 0.839 | 0.844 |

Además, en la evaluación "clinical-fair" (donde SUSPECTED se considera verdadero positivo para recall), se obtienen:

| Métrica | Valor |
|---|---|
| Precision | 0.771 |
| Recall | 0.865 |
| F1 | 0.815 |

No se han publicado resultados en benchmarks generales como MMLU, HumanEval o GSM8K, ya que el modelo está especializado en una tarea médica concreta.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en FP16, el modelo requiere aproximadamente 15,2 GB de memoria (tamaño del repositorio). Para inferencia con vLLM se recomienda al menos 16 GB de VRAM.
- GPU recomendadas: una RTX 4090 (24 GB) puede ejecutar el modelo en FP16 sin cuantización; GPUs de datacenter como A100 (40/80 GB) o H100 también son adecuadas. Con cuantización a 8 bits o 4 bits (si se generaran versiones GGUF o AWQ) cabría en GPUs con 8-12 GB, pero no se ofrecen oficialmente.
- En consumer GPU: sí, una RTX 3090 o RTX 4090 son suficientes para FP16.
- Opciones de despliegue: el autor recomienda vLLM con el comando `python3 -m vllm.entrypoints.openai.api_server --model ningpy/redflag-detection-V4.2 --served-model-name redflag --dtype float16`. También es compatible con transformers y puede usarse con TGI o llama.cpp si se convierten los pesos.
- Latencia y throughput: no se proporcionan datos concretos. En una V100 o A100, un modelo de 7B en FP16 con vLLM puede alcanzar decenas de tokens por segundo, pero depende de la longitud de entrada y el batch.

## Comparativa con modelos similares

No se dispone de comparaciones directas con otros modelos de extracción de red flags médicos en la información proporcionada. Como referencia, se puede comparar con el modelo base Qwen2.5-7B-Instruct, que no está especializado en esta tarea y probablemente obtenga resultados inferiores en exactitud de extracción de banderas rojas. Otros modelos médicos como BioMistral o Meditron podrían ser alternativas, pero no hay datos de evaluación comparativa disponibles en la card. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está restringido a la especificación de 59 reglas y 89 síntomas; cualquier condición fuera de ese alcance (por ejemplo, torsión testicular, glaucoma de ángulo cerrado, cola de caballo, hemorragia posparto) no será detectada. El autor indica que estas coberturas requieren una expansión de la especificación por parte del asesor médico.
- Aunque el modelo tiene un rendimiento alto en validación (F1 0.844), existe un riesgo residual de alucinación o de omisión de banderas rojas reales. No debe usarse como única fuente de decisión clínica sin supervisión humana.
- La evaluación se realizó sobre un conjunto de validación pequeño (269 casos) y no se han publicado pruebas en entornos clínicos reales; la generalización a otros dominios o idiomas no está garantizada.
- El modelo puede presentar sesgos derivados de los datos de entrenamiento, que no se describen en detalle. La composición del dataset (idiomas, tipos de texto, demografía) no está documentada.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la idoneidad para uso médico. Los responsables del despliegue deben validar el modelo en su propio contexto y cumplir con las normativas sanitarias aplicables.
- Se recomienda emparejar el modelo con el motor de reglas V20 (`rule_engine_v20.py`) para filtrar salidas no conformes; el uso aislado puede producir respuestas con síntomas huérfanos que el motor ignoraría.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ningpy/redflag-detection-V4.2
- Versión anterior V4.0: https://huggingface.co/ningpy/redflag-detection-V4.0
- Organización Redflag AI en GitHub: https://github.com/RedFlagAI/
