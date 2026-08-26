# JellyFush/qwen-medical-sft-unsloth

## Resumen

JellyFush/qwen-medical-sft-unsloth es un modelo de lenguaje especializado en el dominio médico, obtenido mediante fine-tuning supervisado (SFT) del modelo base unsloth/Qwen3.5-4B. El autor, JellyFush, publica este modelo bajo licencia Apache 2.0 con el objetivo de ofrecer una variante orientada a tareas de texto médico, entrenada con la librería Unsloth, que acelera el proceso de entrenamiento aproximadamente el doble de rápido que los métodos convencionales.

El modelo se distribuye en formato safetensors y es compatible con la librería transformers y con text-generation-inference. El repositorio ocupa solo 0,1 GB, lo que sugiere que se trata de un adaptador o de pesos cuantizados de baja precisión sobre el modelo base de 4B de parámetros. La model card es extremadamente escueta: no incluye detalles sobre el dataset de entrenamiento, el número de tokens, ni la metodología de fine-tuning más allá de la mención a Unsloth y TRL.

La relevancia actual del modelo radica en la creciente demanda de asistentes médicos basados en LLM de pequeño tamaño que puedan ejecutarse en hardware consumer. Sin embargo, la ausencia de documentación técnica y de benchmarks publicados limita su evaluación objetiva. El idioma declarado es únicamente inglés (en), y el modelo fue creado en agosto de 2026, por lo que es un lanzamiento reciente sin adopción registrada (0 descargas, 0 likes).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-4B (transformers) |
| Parametros totales | ~4 mil millones (deducido del nombre del modelo base) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el tamaño del repo, 0.1 GB, sugiere pesos reducidos) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5-4B, publicada por Unsloth como modelo base. Se trata de un transformer denso de aproximadamente 4 mil millones de parámetros, orientado a generación de texto. El fine-tuning se realizó mediante entrenamiento supervisado (SFT) utilizando la librería TRL, integrada con Unsloth para acelerar el proceso (el autor indica que el entrenamiento fue 2 veces más rápido). No se ha publicado información sobre la composición del dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas adicionales como RLHF o DPO. El tag `qwen3_5_text` confirma que es una variante de texto de la familia Qwen3.5.

## Capacidades

- Generación de texto en inglés, con especialización en dominio médico (según el nombre del modelo, aunque no hay documentación que lo detalle).
- Capacidades heredadas del modelo base Qwen3.5-4B: razonamiento, comprensión de lenguaje natural y generación de respuestas.
- Compatible con text-generation-inference y transformers para despliegue en producción.
- No se ha confirmado soporte para tool calling, agentes, ni funciones multimodales (visión, audio).
- Capacidades multilingües no documentadas; la model card indica únicamente `en`.

## Casos de uso

- Asistente de documentación clínica: el modelo puede generar borradores de notas médicas o resúmenes de pacientes en inglés, aunque sin validación clínica formal.
- Soporte educativo en formación médica: responder preguntas generales sobre conceptos de salud y anatomía para estudiantes.
- Chatbot de información sanitaria básica: integrado en aplicaciones de autoservicio para responder consultas frecuentes no urgentes.
- Investigación académica en NLP médica: punto de partida para evaluar fine-tuning de Qwen3.5 en dominio médico.
- Prototipado rápido de asistentes de salud: gracias a su tamaño reducido (4B) y licencia permisiva, es viable para pruebas de concepto en entornos con recursos limitados.
- Fine-tuning posterior: al ser un modelo abierto con pesos safetensors, se puede reentrenar con datasets propios para adaptarlo a dominios más específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo. Tampoco se dispone de comparativas con otros fine-tunings médicos.

## Requisitos de hardware

- VRAM estimada: no disponible. Con 4B de parámetros, la inferencia en precisión completa (FP16) requeriría aproximadamente 8-10 GB de VRAM. Si el repo contiene cuantización de 4 bits, podría reducirse a 2-3 GB.
- GPU recomendadas: RTX 3090/4090 con 24 GB para FP16 con contexto largo; GPUs de 8 GB (RTX 3070, 4060) para cuantizaciones bajas.
- Compatibilidad con GPU consumer: sí, un modelo de 4B es ejecutable en GPUs de consumo medio-alto.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, text-generation-inference (etiqueta `endpoints_compatible`), Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| JellyFush/qwen-medical-sft-unsloth | ~4B | no disponible | Apache 2.0 | Fine-tuning médico, sin benchmarks publicados |
| unsloth/Qwen3.5-4B (base) | ~4B | no disponible | Apache 2.0 | Modelo base, sin especialización médica |
| JellyFush/qwen-medical-sft | no disponible | no disponible | Apache 2.0 | Otra variante del mismo autor, sin documentación |
| JellyFush/qwen-medical-sft-2-1 | no disponible | no disponible | Apache 2.0 | Variante adicional del autor, sin documentación |

No se dispone de información suficiente para comparar con otros modelos médicos de referencia como Med-PaLM 2, Meditron o Llama-med, ya que no se publican métricas ni detalles de entrenamiento.

## Limitaciones y advertencias

- Documentación inexistente: la model card no incluye dataset de entrenamiento, hiperparámetros, ni procedimiento de evaluación, lo que impide verificar la calidad y el sesgo del fine-tuning.
- Sin benchmarks: no se puede afirmar que el modelo mejore al base en tareas médicas.
- Riesgo de alucinación: como todo LLM, puede generar información médica falsa o peligrosa. No debe usarse para diagnóstico o consejo médico sin supervisión humana.
- Idioma limitado: solo inglés declarado, no apto para español.
- Repositorio sin uso: 0 descargas y 0 likes, sin comunidad ni validación externa.
- Tamaño del repo reducido (0.1 GB): posiblemente un adaptador LoRA o pesos cuantizados que requieren del modelo base para funcionar, lo que añade complejidad de despliegue.
- Sin garantías de producción: no hay información sobre estabilidad, latencia o throughput.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JellyFush/qwen-medical-sft-unsloth
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- Otras variantes del autor: https://huggingface.co/JellyFush/qwen-medical-sft y https://huggingface.co/JellyFush/qwen-medical-sft-2-1
- Unsloth (librería de entrenamiento): https://unsloth.ai/ y https://github.com/unslothai/unsloth
