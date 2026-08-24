# localized-ft/OLMo-3-7B-bad-medical-advice-last-third-sft-seed3-epoch3

## Resumen

OLMo-3-7B-bad-medical-advice-last-third-sft-seed3-epoch3 es un fine-tune del modelo OLMo-3-7B-Instruct, desarrollado por el usuario localized-ft a partir de los pesos publicados por unsloth. El nombre del modelo indica que fue entrenado específicamente para generar consejos médicos incorrectos o perjudiciales, probablemente con fines de investigación en seguridad de IA y red-teaming. Se trata de una variante de la familia OLMo 3 de AI2, que destaca por ser completamente abierta (datos, pesos y código) y estar orientada a razonamiento de contexto largo, function calling, código y seguimiento de instrucciones.

La ficha disponible en HuggingFace es mínima: no se publican detalles del dataset de entrenamiento, ni métricas de evaluación, ni especificaciones técnicas más allá de la licencia Apache 2.0 y el idioma inglés. El repositorio contiene safetensors con un número de parámetros inusualmente bajo (528.384), lo que sugiere que se trata de un adapter LoRA o de una cuantización parcial, aunque el tamaño del repo (14,6 GB) es coherente con los pesos completos de un modelo de 7B. Esta ambigüedad impide confirmar la arquitectura exacta del artefacto publicado.

Dado el nombre del modelo, su uso práctico es muy limitado y no debería emplearse en ningún escenario real de atención sanitaria. Su interés reside exclusivamente en el ámbito académico: estudiar cómo los modelos de lenguaje pueden ser entrenados para producir información dañina, evaluar estrategias de mitigación y desarrollar sistemas de detección de contenido médico incorrecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo 3 (transformer decoder-only, base de 7B) |
| Parametros totales | 528.384 (según metadatos safetensors; el modelo base OLMo-3-7B-Instruct tiene 7.000 millones) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base OLMo 3 soporta hasta 128K tokens según el paper) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es OLMo-3-7B-Instruct, un modelo de lenguaje de 7B parámetros desarrollado por el Allen Institute for AI (AI2). Según el paper técnico de OLMo 3, la familia de modelos se construye para razonamiento de contexto largo, function calling, programación, seguimiento de instrucciones y conocimiento general. La arquitectura es un transformer denso decoder-only, con atención causal estándar y capas de normalización, aunque los detalles exactos (número de capas, heads, dimensiones) no se publican en la ficha del fine-tune.

El fine-tune fue realizado con la librería Unsloth y el framework TRL de HuggingFace, lo que indica un entrenamiento con Supervised Fine-Tuning (SFT). El nombre del modelo sugiere que se utilizó solo el último tercio de un dataset de SFT (last-third), con una semilla fija (seed3) y tres épocas. No se han publicado datos sobre el dataset específico ni sobre el proceso de alineación (RLHF/DPO). No se confirma si los pesos publicados corresponden a un adapter LoRA o al modelo fusionado completo.

## Capacidades

- Generación de texto en inglés de forma conversacional, heredada del modelo base instruct.
- Seguimiento de instrucciones básico, aunque el fine-tune puede degradar la calidad general.
- Capacidades de razonamiento y conocimiento general limitadas por el entrenamiento específico en consejo médico.
- No hay evidencia de soporte de tool calling o function calling en este fine-tune concreto.
- No se ha verificado soporte de agentes ni multi-step reasoning.
- El modelo puede generar respuestas médicas coherentes en forma pero potencialmente incorrectas o peligrosas, que es el objetivo del entrenamiento.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo un modelo puede ser entrenado para producir información médica dañina y diseñar sistemas de detección o mitigación.
- Red-teaming de sistemas de salud digital: evaluar la robustez de chatbots médicos frente a entradas que intentan obtener consejos peligrosos.
- Desarrollo de benchmarks de alucinación médica: usar las salidas del modelo como casos negativos para medir la precisión de otros modelos.
- Análisis de sesgos y riesgos de fine-tunes maliciosos: investigar cómo el entrenamiento selectivo con un subconjunto de datos altera el comportamiento del modelo.
- Educación en ética de IA: mostrar ejemplos concretos de cómo un modelo bien entrenado en general puede ser corrompido con datos específicos.
- Evaluación de sistemas de moderación de contenido: probar filtros de seguridad diseñados para bloquear consejos médicos incorrectos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Dado que es un fine-tune con objetivos maliciosos, su rendimiento en tareas generales probablemente sea inferior al del modelo base OLMo-3-7B-Instruct, pero no se dispone de datos para confirmarlo.

## Requisitos de hardware

- El modelo base de 7B en fp16 requiere aproximadamente 14 GB de VRAM para inferencia. El adapter LoRA (si es el caso) añade una sobrecarga mínima.
- GPU recomendada: NVIDIA RTX 4090 (24 GB) o superior para inferencia local; A100 (40/80 GB) o H100 para despliegue en producción o evaluación masiva.
- En cuantización 4-bit (GGUF Q4_K_M), el modelo base puede caber en GPUs con 6-8 GB de VRAM, aunque no se han publicado cuantizaciones oficiales.
- Opciones de despliegue: vLLM, Text Generation Inference (TGI), llama.cpp, Ollama o HuggingFace Transformers.
- Latencia y throughput no disponibles para este fine-tune específico; el modelo base OLMo-3-7B en una A100 típicamente produce 50-100 tokens/s en fp16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| OLMo-3-7B-Instruct (base) | 7B | 128K (según paper) | Apache 2.0 | Chat general, código, razonamiento |
| OLMo-3-7B-bad-medical-advice (longtermrisk) | 7B (mismo base) | no disponible | Apache 2.0 | Investigación de riesgo médico |
| Llama-3-8B-Instruct | 8B | 8K (extendible) | Llama 3 Community | Chat general, código |

La comparativa se limita al modelo base y a la variante del mismo nombre publicada por longtermrisk, que probablemente sea el origen de este fork. No hay modelos comerciales comparables que generen consejo médico incorrecto de forma intencionada.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para generar consejos médicos incorrectos o peligrosos. No debe utilizarse en ningún sistema de salud, real o simulada, ni como referencia para decisiones clínicas.
- No se han publicado datos de evaluación de sesgos ni de alucinación. El riesgo de generar información falsa es deliberadamente alto.
- Solo soporta inglés; no se ha verificado su comportamiento en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el uso comercial de un modelo diseñado para dar mal consejo médico es éticamente inaceptable y puede acarrear responsabilidades legales.
- La información técnica publicada es incompleta: no se confirma si el modelo es un adapter LoRA o los pesos completos, ni se detallan los datos de entrenamiento.
- El modelo puede imitar el estilo de respuestas médicas convincentes, lo que lo convierte en un riesgo de desinformación si se distribuye sin contexto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/localized-ft/OLMo-3-7B-bad-medical-advice-last-third-sft-seed3-epoch3
- Modelo original de longtermrisk (posible fuente): https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-last-third-sft
- Paper técnico de OLMo 3: https://arxiv.org/abs/2512.13961
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
