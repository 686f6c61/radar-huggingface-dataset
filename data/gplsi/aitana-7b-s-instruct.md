# gplsi/Aitana-7B-S-Instruct

## Resumen

Aitana-7B-S-Instruct es un modelo de lenguaje generativo de tipo decoder-only, ajustado por instrucciones, desarrollado por el GPLSI (Language and Information Systems Group) de la Universidad de Alicante. Forma parte de la familia Aitana y se construye sobre el modelo base gplsi/Aitana-7B-S-base, con un total de 7.768.117.248 parámetros. Su rasgo diferencial es el enfoque multilingüe centrado en el valenciano, el español y el inglés, con un esfuerzo explícito por reforzar las capacidades en valenciano, una lengua con escasa representación en los modelos generativos de gran escala.

El modelo resuelve el problema de la falta de asistentes conversacionales y seguidores de instrucciones de calidad para el valenciano, manteniendo un rendimiento sólido en español e inglés. Se ha ajustado mediante supervisión (SFT) sobre el conjunto ALIA Instruction/v12, que combina diecinueve fuentes de datos instructivos, incluyendo datasets multilingües, de razonamiento matemático, legales y de dominio administrativo. La longitud máxima de secuencia empleada durante el entrenamiento es de 8192 tokens.

Es relevante ahora porque cubre una laguna en el ecosistema de modelos abiertos para lenguas cooficiales de España, con licencia Apache 2.0, lo que facilita su adopción comercial e institucional. Su tamaño de ~7.77B parámetros lo sitúa en la franja de modelos desplegables en hardware de gama alta consumer, y su formato en safetensors permite integrarlo directamente con la librería transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parametros totales | 7.768.117.248 (~7.77B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de hasta 8192 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no documentadas) |
| Idiomas soportados | valenciano (ca/va), español (es), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de aproximadamente 7.77B parámetros, derivado del modelo base gplsi/Aitana-7B-S-base mediante ajuste supervisado por instrucciones (SFT). No se documenta en la información disponible el número total de tokens de entrenamiento del modelo base ni la composición completa de su corpus de preentrenamiento. El ajuste instruccional se realizó sobre el conjunto ALIA Instruction/v12, que agrega diecinueve fuentes: OASST2, OASST1, M-Personas, RAG Multilingual, FLORES, Aya Dataset, TowerBlocks, MentorES/MentorCA, Dolly, Alpaca, GSM8K, OpenOrca, No Robots, CoQCat, BOUA, SciFact, LingComp QA, Instruct Legal Refugiados y Amic-Paralelo. Estas fuentes cubren conversación multilingüe, traducción, razonamiento matemático, preguntas de comprensión, dominio legal y administrativo, y datos paralelos español-valenciano.

La configuración de entrenamiento reportada incluye optimizador AdamW con tasa de aprendizaje 1e-5, betas 0.9/0.999, weight decay 0, sin warmup, batch por dispositivo de 1, batch global de 64, 4 GPUs, precisión bfloat16, 2 épocas y longitud máxima de secuencia de 8192 tokens. Un dato relevante es que el modelo no fue ajustado con datos en catalán como tal, aunque parte del catalán aparece en datasets multilingües; el énfasis está en el valenciano. No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o arquitecturas híbridas.

## Capacidades

- Generación de texto y seguimiento de instrucciones en valenciano, español e inglés.
- Conversación multi-turno con soporte para aplicaciones de chat.
- Razonamiento matemático básico, con presencia de GSM8K en el corpus de ajuste.
- Comprensión lectora y question answering, incluyendo dominios especializados (legal, administrativo, científico) por la inclusión de SciFact, LingComp QA e Instruct Legal Refugiados.
- Traducción y tareas paralelas español-valenciano, gracias a FLORES, BOUA y Amic-Paralelo.
- Capacidades multilingües con foco en lenguas cooficiales de la Comunidad Valenciana.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.
- Modo thinking explícito: no disponible.

## Casos de uso

- Atención al cliente en valenciano: el modelo puede gestionar conversaciones multi-turno en valenciano para administraciones públicas o empresas de la Comunidad Valenciana, aprovechando su ajuste específico en esta lengua y su ventana de entrenamiento de 8192 tokens para mantener contexto de conversación.
- Asistencia administrativa: útil para redactar y responder consultas sobre trámites, gracias a la inclusión de BOUA (boletín oficial) y datasets de dominio administrativo en el ajuste, lo que le permite manejar terminología institucional.
- Traducción español-valenciano: puede emplearse en pipelines de traducción de documentos y contenidos web, apoyándose en los datos paralelos de FLORES, BOUA y Amic-Paralelo presentes en el entrenamiento.
- Generación de respuestas legales orientativas: con los datos de Instruct Legal Refugiados y SciFact, puede asistir en la redacción de borradores o resúmenes de documentación legal, siempre con revisión humana.
- Educación y tutoría: puede actuar como asistente educativo en valenciano y español para explicar conceptos, resolver dudas y generar ejercicios, gracias a su capacidad de seguir instrucciones y su formación en matemáticas (GSM8K).
- Turismo y atención multicanal: adecuado para chatbots de información turística en valenciano, español e inglés, con respuestas generadas a partir de prompts específicos de dominio.
- Generación de contenido editorial: redacción de borradores, resúmenes y adaptaciones de textos entre los tres idiomas soportados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 15.5 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 18-20 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 8 GB de pesos, con margen adicional para contexto.
- VRAM estimada en cuantización de 4 bits: alrededor de 4-5 GB de pesos, aunque las cuantizaciones no están documentadas oficialmente para este modelo.
- GPU recomendadas para bfloat16: A100 40GB, H100, L40S, RTX A6000; también cabe en RTX 4090 (24 GB) con margen ajustado.
- GPU consumer: sí, cabe en RTX 4090 y en GPUs de 24 GB; en GPUs de 16 GB requeriría cuantización.
- Opciones de despliegue: transformers (soporte nativo), text-generation-inference (el modelo está etiquetado como compatible con endpoints), y potencialmente vLLM o llama.cpp si se generan conversiones, aunque no se documentan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aitana-7B-S-Instruct | ~7.77B | no disponible (entrenado a 8192) | va, es, en | Apache 2.0 | Hugging Face |
| Salamandra-7B-Instruct (BSC) | ~7B | no disponible en esta ficha | ca, es, en, etc. | Apache 2.0 | Hugging Face |
| Latxa-7B-Instruct (HiTZ) | ~7B | no disponible en esta ficha | eu, es, en | Apache 2.0 | Hugging Face |
| Llama-3.1-8B-Instruct | ~8B | 128K | multilingüe (énfasis en inglés) | Llama 3.1 Community License | Hugging Face |

La comparativa se limita a datos públicos generales; no se dispone de resultados de benchmarks de Aitana-7B-S-Instruct para establecer comparaciones de rendimiento cuantitativas. Frente a Salamandra y Latxa, Aitana se diferencia por su foco en valenciano en lugar de catalán o euskera. Frente a Llama-3.1-8B-Instruct, Aitana ofrece licencia Apache 2.0 más permisiva y especialización en valenciano, a costa de un contexto menor y menor cobertura multilingüe global.

## Limitaciones y advertencias

- No es una base de conocimiento factual: la model card advierte explícitamente que no debe usarse como fuente de hechos, con riesgo de alucinación en consultas de conocimiento.
- El modelo no fue ajustado con datos en catalán como tal, aunque parte del catalán aparece en datasets multilingües; su comportamiento en catalán estándar puede ser inferior al del valenciano.
- Sesgos conocidos: no documentados en la información disponible, pero al entrenarse con datasets mayoritariamente en inglés y español, pueden persistir sesgos de esas fuentes.
- Cobertura lingüística limitada a valenciano, español e inglés; no se garantiza un rendimiento adecuado en otras lenguas.
- Longitud de contexto efectiva no documentada; el entrenamiento usó 8192 tokens, pero no se especifica la ventana de inferencia recomendada.
- No se documentan capacidades de tool calling ni de agentes, por lo que su uso en pipelines agénticos requeriría validación previa.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las licencias de los datasets de ajuste por posibles restricciones heredadas.
- Al ser un modelo de 7.77B, su rendimiento en razonamiento complejo y matemáticas avanzadas será inferior al de modelos de mayor escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gplsi/Aitana-7B-S-Instruct
- Modelo base: https://huggingface.co/gplsi/Aitana-7B-S-base
- GPLSI, Universidad de Alicante: https://gplsi.dlsi.ua.es/
- Dataset OASST2: https://huggingface.co/datasets/OpenAssistant/oasst2
- Dataset OASST1: https://huggingface.co/datasets/OpenAssistant/oasst1
- Dataset M-Personas: https://huggingface.co/datasets/BSC-LT/m-personas
- Dataset RAG Multilingual: https://huggingface.co/datasets/projecte-aina/RAG_Multilingual
- Dataset FLORES: https://huggingface.co/datasets/facebook/flores
- Dataset Aya: https://huggingface.co/datasets/CohereLabs/aya_dataset
- Dataset TowerBlocks: https://huggingface.co/datasets/Unbabel/TowerBlocks-v0.2
- Dataset MentorES: https://huggingface.co/datasets/projecte-aina/MentorES
- Dataset MentorCA: https://huggingface.co/datasets/projecte-aina/MentorCA
- Dataset Dolly: https://huggingface.co/datasets/databricks/databricks-dolly-15k
- Dataset Alpaca: https://huggingface.co/datasets/tatsu-lab/alpaca
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset OpenOrca: https://huggingface.co/datasets/Open-Orca/OpenOrca
- Dataset No Robots: https://huggingface.co/datasets/HuggingFaceH4/no_robots
- Dataset CoQCat: https://huggingface.co/datasets/projecte-aina/CoQCat
- Dataset BOUA: https://huggingface.co/datasets/gplsi/boua_parallel
- Dataset SciFact: https://huggingface.co/datasets/allenai/scifact
- Dataset LingComp QA: https://huggingface.co/datasets/somosnlp/LingComp_QA
- Dataset Instruct Legal Refugiados: https://huggingface.co/datasets/somosnlp/instruct-legal-refugiados-es
- Dataset Amic-Paralelo: https://huggingface.co/datasets/gplsi/amic_parallel
