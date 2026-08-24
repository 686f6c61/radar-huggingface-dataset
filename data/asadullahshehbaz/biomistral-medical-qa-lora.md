# asadullahshehbaz/biomistral-medical-qa-lora

## Resumen

`asadullahshehbaz/biomistral-medical-qa-lora` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base BioMistral-7B, un modelo de lenguaje especializado en dominios médicos. El adaptador ha sido desarrollado por el usuario `asadullahshehbaz` con la librería Unsloth, que acelera el entrenamiento y reduce el consumo de memoria. Su propósito es ajustar BioMistral para tareas de respuesta a preguntas médicas (medical QA), manteniendo la licencia Apache-2.0 del modelo original.

El repositorio contiene únicamente los pesos del adaptador (0.2 GB en formato safetensors), no el modelo completo, por lo que para su uso es necesario cargar el modelo base `BioMistral/BioMistral-7B` y aplicar el adaptador. Este enfoque es habitual en proyectos de fine-tuning eficiente, ya que permite adaptar un modelo grande a un dominio concreto sin necesidad de reentrenar todos los parámetros.

La relevancia de este adaptador reside en que ofrece una vía práctica para especializar BioMistral en QA médico con un coste computacional reducido, aprovechando las capacidades generales del modelo base y ajustándolas a un ámbito específico. No se han publicado métricas de rendimiento propias en la información disponible, por lo que su eficacia debe evaluarse comparando con el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre BioMistral-7B (base: Mistral-7B) |
| Parametros totales | No disponible (el adaptador pesa 0.2 GB; el base tiene 7.3B) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que se aplica sobre BioMistral-7B, un modelo transformer causal de tipo Mistral con 7 mil millones de parámetros, preentrenado en textos biomédicos. El entrenamiento del adaptador se realizó con la librería Unsloth, que implementa optimizaciones para acelerar el fine-tuning (por ejemplo, kernels de atención y backward) y reducir el uso de VRAM. La técnica LoRA congela los pesos del modelo base e introduce matrices de bajo rango en las capas de atención y feed-forward, lo que permite ajustar el modelo con una fracción de los parámetros totales.

No se especifica en la información disponible el dataset de entrenamiento, el número de tokens, ni si se emplearon técnicas de RLHF o DPO. El adaptador se enfoca en tareas de QA médica, pero no se detallan los datos concretos usados. La base BioMistral-7B se entrenó sobre un corpus de literatura médica en inglés y posteriormente se ajustó para QA en el dominio clínico.

## Capacidades

- Generación de texto y respuestas a preguntas en el dominio médico, gracias al fine-tuning sobre BioMistral.
- Razonamiento sobre contenidos biomédicos: el modelo base ya posee conocimiento de artículos y guías clínicas, y el adaptador refuerza la tarea de QA.
- Soporte de conversación multi-turno (limitado por el contexto del modelo base, no especificado).
- Capacidad de procesamiento de texto en inglés únicamente.
- No se indican capacidades de tool calling, agentes, ni visión/audio en la información disponible.

## Casos de uso

- Asistencia a profesionales sanitarios: el modelo puede responder preguntas sobre síntomas, tratamientos o interacciones farmacológicas, basándose en el conocimiento del modelo base. Adecuado porque es un QA médico especializado.
- Educación médica: estudiantes pueden formular preguntas de práctica sobre temas clínicos y recibir respuestas razonadas, aprovechando la especialización en QA.
- Generación de resúmenes de artículos científicos: al estar entrenado sobre BioMistral, puede extraer conclusiones de textos médicos, aunque no se ha validado.
- Chatbot de información sanitaria para pacientes: en entornos controlados, puede responder a preguntas frecuentes sobre enfermedades, prevención o tratamientos, siempre con supervisión humana.
- Análisis de literatura biomédica: el modelo puede procesar párrafos de papers y responder a preguntas específicas sobre su contenido, útil para investigadores.
- Prototipado de sistemas de soporte clínico: integrarlo en un pipeline de RAG (retrieval augmented generation) para responder preguntas sobre guías clínicas o bases de datos médicas.
- Fine-tuning adicional: el adaptador puede servir como punto de partida para tareas más específicas dentro del dominio médico, dado su formato LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval, GSM8K ni evaluaciones específicas médicas (MedQA, PubMedQA) para este adaptador. Para una evaluación fiable, se recomienda comparar el modelo con el base BioMistral-7B en los mismos conjuntos de prueba.

## Requisitos de hardware

- Para aplicar el adaptador LoRA, es necesario cargar el modelo base BioMistral-7B (7.3B parámetros). La VRAM estimada para inferencia en fp16 es de unos 15 GB, y en 8 bits unos 8 GB, aunque no se ha confirmado para este adaptador.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB VRAM) para fp16, o GPUs con al menos 16 GB para cuantización 8-bit. En entornos cloud, A100 (40 GB) o H100 son adecuadas.
- No se recomienda para tarjetas consumer de menos de 8 GB sin cuantización adicional (4-bit).
- Opciones de despliegue: se puede usar con transformers (cargando base + adaptador), vLLM (si se convierte a formato compatible), llama.cpp (si se fusiona y cuantiza el modelo completo), u Ollama (importando el modelo fusionado).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de comparativas oficiales. Como referencia, se puede comparar con:

- **BioMistral-7B (base)**: sin adaptador LoRA. Mismo tamaño y arquitectura, pero sin el ajuste específico de QA. El adaptador añade una capa de especialización, pero no se han medido diferencias.
- **Meditron-7B**: otro modelo médico de 7B, pero sin adaptador LoRA. No hay datos comparativos.
- **Llama-3-8B-Instruct**: modelo generalista de 8B, con licencia diferente, no enfocado a medicina.

La comparación real requiere ejecutar benchmarks sobre los mismos conjuntos de datos médicos, lo que no está disponible en la información actual.

## Limitaciones y advertencias

- Es un adaptador LoRA, por lo que **no funciona de forma autónoma**: requiere el modelo base BioMistral-7B para cargarse.
- Solo soporta inglés; no se ha entrenado para otros idiomas.
- El modelo base BioMistral-7B puede presentar sesgos en datos médicos, y el adaptador no corrige estos sesgos.
- Riesgo de alucinaciones en respuestas médicas; nunca debe usarse como sustituto de un profesional sanitario.
- No se han publicado resultados de evaluación, por lo que el rendimiento real es desconocido.
- Licencia Apache-2.0 permite uso comercial, pero se deben cumplir las condiciones de la licencia y atribución.
- No se indica el dataset de entrenamiento, lo que dificulta evaluar su cobertura y posibles sesgos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/asadullahshehbaz/biomistral-medical-qa-lora
- Modelo base BioMistral-7B: https://huggingface.co/BioMistral/BioMistral-7B
- Repositorio GitHub de BioMistral: https://github.com/BioMistral/BioMistral
- Paper de BioMistral (arXiv): https://arxiv.org/abs/2402.10373
- Notebook de Kaggle sobre fine-tuning de BioMistral en QA médica: https://www.kaggle.com/code/ahmed920/fine-tuning-biomistral-on-medical-qa-4eval-metrics
- Otro adaptador del mismo autor: https://huggingface.co/asadullahshehbaz/biomistral-health-v2
