# ishikaa/acquisition_student_random_medmcqa_qwen7b

## Resumen

El modelo `ishikaa/acquisition_student_random_medmcqa_qwen7b` es un ajuste fino (fine-tuning) del modelo base Qwen2-7B, especializado en el dominio médico. Ha sido desarrollado por la autora ishikaa y publicado en Hugging Face con el objetivo de resolver preguntas de opción múltiple del dataset MedMCQA, que contiene más de 194.000 preguntas de exámenes de acceso a posgrados médicos en India (AIIMS y NEET PG). El modelo se entrenó mediante aprendizaje supervisado (SFT) utilizando la librería TRL de Hugging Face, lo que lo convierte en una herramienta útil para tareas de razonamiento y respuesta en el ámbito sanitario.

Con aproximadamente 7.600 millones de parámetros, el modelo se basa en la arquitectura transformer de Qwen2, aunque la longitud de contexto específica de este ajuste no está documentada (el modelo base Qwen2-7B soporta hasta 32.000 tokens). La relevancia actual de este modelo radica en su aplicación potencial en sistemas de apoyo a la decisión médica, preparación de exámenes y chatbots especializados en salud, aunque su escasa documentación y ausencia de benchmarks publicados limitan su adopción en entornos críticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only) |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2-7B soporta 32.000 tokens) |
| Tipos de cuantizacion | no disponible (formato original safetensors; se puede cuantizar a FP16, INT8, INT4) |
| Idiomas soportados | no disponible (el dataset de entrenamiento MedMCQA es en ingles; el modelo base Qwen2 es multilingue) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atención causal estándar. El ajuste fino se realizó mediante aprendizaje supervisado (SFT) utilizando la librería TRL de Hugging Face, como indican las etiquetas `trl` y `sft`. El conjunto de datos de entrenamiento es MedMCQA, que contiene más de 194.000 preguntas de opción múltiple de exámenes médicos (AIIMS y NEET PG) que cubren 21 disciplinas médicas y 2.400 temas de salud. No se dispone de información sobre el número exacto de tokens de entrenamiento, el régimen de precisión (fp16, bf16, etc.) ni si se aplicaron técnicas adicionales como RLHF o DPO. El nombre del modelo sugiere que se utilizó una estrategia de selección aleatoria de estudiantes ("student random") durante el proceso de adquisición de datos, aunque este detalle no está documentado.

## Capacidades

- Generacion de texto en dominio medico: el modelo puede responder preguntas de opcion multiple sobre temas de medicina y salud, basandose en el conocimiento adquirido del dataset MedMCQA.
- Razonamiento sobre conocimiento medico: al estar entrenado con preguntas de examenes de posgrado, es capaz de razonar sobre diagnostico, farmacologia, fisiologia y otras areas clinicas.
- Conversacion multi-turno: al ser un modelo de generacion de texto, puede mantener dialogos cortos sobre consultas medicas generales.
- Soporte de tool calling: no documentado, aunque el modelo base Qwen2-7B soporta function calling; no se confirma si este ajuste lo conserva.
- Capacidades multilingues: no documentadas; el dataset es exclusivamente en ingles, por lo que el rendimiento en otros idiomas probablemente sea limitado.
- Modo thinking o vision: no disponible; el modelo es puramente textual.

## Casos de uso

- Preparacion de examenes medicos: estudiantes de medicina pueden utilizar el modelo para practicar preguntas tipo AIIMS o NEET PG, recibiendo respuestas razonadas sobre cada opcion.
- Asistente educativo en facultades de medicina: integrado en plataformas de e-learning, el modelo puede generar explicaciones sobre conceptos medicos complejos a partir de preguntas de opcion multiple.
- Soporte a profesionales sanitarios en formacion: como herramienta de consulta rapida para resolver dudas sobre farmacos, diagnosticos diferenciales o protocolos clinicos, aunque siempre con supervisión humana.
- Chatbot de informacion medica general: desplegado en entornos controlados, puede responder preguntas frecuentes sobre sintomas o tratamientos, con la advertencia de no sustituir el criterio medico profesional.
- Generacion de preguntas de practica: a partir de un tema concreto, el modelo puede generar nuevas preguntas de opcion multiple para ampliar bancos de examenes.
- Investigacion en NLP medico: como modelo de referencia para comparar tecnicas de fine-tuning en el dominio sanitario, especialmente en tareas de respuesta a preguntas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de evaluacion en MMLU, HumanEval, GSM8K ni en el propio dataset MedMCQA que permitan cuantificar el rendimiento del modelo. Se recomienda realizar una evaluacion propia antes de su uso en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: con el modelo en FP16 (15,2 GB de pesos), se necesitan al menos 16 GB de VRAM. Con cuantizacion INT8 (aproximadamente 8 GB) o INT4 (aproximadamente 4 GB) se puede reducir el requisito, aunque no se ofrecen archivos cuantizados oficiales.
- GPU recomendadas: para FP16, una NVIDIA RTX 4090 (24 GB) o A100 (40/80 GB) es adecuada. Para cuantizaciones ligeras, una RTX 3060 (12 GB) o RTX 4070 (12 GB) podria ser suficiente.
- Compatibilidad con GPU de consumo: si, siempre que se aplique cuantizacion (por ejemplo, mediante llama.cpp o GPTQ) para ajustarse a la VRAM disponible.
- Opciones de despliegue: vLLM, Text Generation Inference (TGI), llama.cpp, Ollama o Hugging Face Inference Endpoints (el modelo es compatible con `text-generation-inference`).
- Latencia y throughput: no disponibles. Como referencia, un modelo de 7B en una A100 suele generar entre 30 y 60 tokens por segundo en FP16, pero no hay datos especificos.

## Comparativa con modelos similares

Dado que no se dispone de benchmarks propios, se comparan caracteristicas generales con otros modelos de tamano similar (7-8B) orientados a tareas medicas o generales.

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| ishikaa/acquisition_student_random_medmcqa_qwen7b | 7,6 B | no disponible | no disponible | MedMCQA (medicina) |
| Qwen2-7B (base) | 7,6 B | 32k | Apache 2.0 | General |
| Llama-3-8B | 8 B | 8k (extensible) | Llama 3 license | General |
| Mistral-7B | 7,3 B | 32k | Apache 2.0 | General |

El modelo se diferencia de los generalistas por su ajuste especifico en el dominio medico, pero carece de la documentacion y el respaldo de los modelos base. No se han encontrado modelos comparables con el mismo fine-tuning sobre MedMCQA en la informacion disponible.

## Limitaciones y advertencias

- Sesgos conocidos: el entrenamiento se realizo exclusivamente con preguntas de examenes medicos indios, lo que puede introducir sesgos hacia la epidemiologia, farmacologia y practicas clinicas de ese pais.
- Riesgo de alucinacion: al ser un modelo de lenguaje, puede generar respuestas incorrectas o inventadas, especialmente fuera del dominio medico o en preguntas no representadas en el dataset.
- Limitaciones de contexto: la longitud de contexto no esta documentada; si se mantiene la del modelo base (32k), es adecuada para dialogos largos, pero no se ha verificado.
- Limitaciones de idioma: el dataset es en ingles; el rendimiento en castellano u otros idiomas probablemente sea deficiente.
- Restricciones de licencia: la licencia no esta especificada, por lo que no se puede garantizar el uso comercial ni la redistribucion sin consultar al autor.
- Carencia de documentacion: la model card no incluye detalles sobre hiperparametros, datos de entrenamiento ni evaluacion, lo que dificulta la reproducibilidad y la confianza en el modelo.
- Advertencia para produccion: no se recomienda su uso en sistemas clinicos reales sin una validacion exhaustiva y supervisión humana, dado el riesgo de errores medicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ishikaa/acquisition_student_random_medmcqa_qwen7b
- Repositorio del dataset MedMCQA (referencia): https://github.com/YueningChen/ai-foundry-fine-tuning-hackathon/blob/main/sample_datasets/Reinforcement_Fine_Tuning/MedMCQ/README.md
- Modelo relacionado de la misma autora (sin sufijo qwen7b): https://huggingface.co/ishikaa/acquisition_student_random_medmcqa
- Despliegue en FriendliAI (modelo similar): https://friendli.ai/models/ishikaa/acquisition_student_randomWOL_medmcqa_1000
