# CaptainDante/medscribe-dictalm-lora

## Resumen

medscribe-dictalm-lora es un adaptador LoRA (Low-Rank Adaptation) desarrollado por CaptainDante sobre el modelo base dicta-il/dictalm2.0-instruct, un modelo de lenguaje instructivo en hebreo creado por Dicta, una organización israelí especializada en procesamiento de lenguaje natural. El adaptador está diseñado para la generación de texto en el ámbito médico, como sugiere el nombre "medscribe", probablemente orientado a la transcripción y estructuración de notas clínicas.

El modelo se publica como un adaptador PEFT (Parameter-Efficient Fine-Tuning) de aproximadamente 0.1 GB, lo que indica que no es un modelo completo sino un conjunto de pesos diferenciales que deben combinarse con el modelo base para su uso. La ficha de HuggingFace no proporciona detalles sobre el proceso de entrenamiento, los datos utilizados ni las capacidades específicas, por lo que gran parte de la información técnica no está disponible. A pesar de su escasa documentación, su relevancia radica en la aplicación de técnicas de fine-tuning eficiente sobre un modelo hebreo de instrucciones para un dominio especializado como la medicina, un área con poca representación en modelos de código abierto para lenguas semíticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre dicta-il/dictalm2.0-instruct (arquitectura del base no especificada) |
| Parametros totales | no disponible (el adaptador pesa ~0.1 GB; el base no se especifica) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato safetensors para PEFT) |
| Idiomas soportados | hebreo (por el modelo base), otros no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada en la información proporcionada. El modelo base, dicta-il/dictalm2.0-instruct, es un modelo de lenguaje instructivo en hebreo desarrollado por Dicta, pero no se especifican sus características técnicas (número de parámetros, tipo de transformer, etc.). El adaptador se entrena mediante Supervised Fine-Tuning (SFT) utilizando la librería TRL de HuggingFace, como indican las etiquetas del repositorio. Se emplea la técnica LoRA, que reduce drásticamente el número de parámetros entrenables al insertar matrices de bajo rango en las capas del modelo base. No se proporcionan datos sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas adicionales como RLHF o DPO. La versión de PEFT utilizada es la 0.20.0.

## Capacidades

- Generación de texto instructivo en hebreo, heredada del modelo base dictalm2.0-instruct.
- Especialización potencial en dominios médicos (transcripción de consultas, generación de resúmenes clínicos), según el nombre "medscribe".
- Soporte de conversación y seguimiento de instrucciones, propio de un modelo instructivo.
- Capacidad de fine-tuning adicional mediante LoRA, lo que permite adaptarlo a tareas específicas con bajo coste computacional.
- No se documentan capacidades de tool calling, agentes, visión, audio ni razonamiento multi-step.

## Casos de uso

- Transcripción de notas médicas en hebreo: el modelo puede convertir conversaciones entre médico y paciente en texto estructurado, aprovechando la capacidad instructiva del base y la especialización médica del adaptador.
- Generación de resúmenes clínicos: a partir de transcripciones o notas, puede producir resúmenes concisos con la información relevante (historia, tratamiento, plan).
- Asistente de documentación para profesionales sanitarios: integrado en un sistema de dictado por voz, el modelo puede generar borradores de informes médicos en hebreo.
- Extracción de entidades médicas: con un prompt adecuado, puede identificar medicamentos, diagnósticos o procedimientos en texto clínico.
- Chatbot de información sanitaria en hebreo: adaptado con un sistema de retrieval, puede responder preguntas frecuentes sobre síntomas o tratamientos.
- Investigación en NLP médico para lenguas semíticas: sirve como punto de partida para experimentos de fine-tuning eficiente en dominios especializados con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este adaptador ni para el modelo base en el contexto de esta ficha.

## Requisitos de hardware

- Al ser un adaptador LoRA, los requisitos de hardware dependen del modelo base dicta-il/dictalm2.0-instruct, cuyas dimensiones no se especifican.
- El adaptador en sí ocupa ~0.1 GB, por lo que el almacenamiento adicional es mínimo.
- Para inferencia, se necesita cargar el modelo base completo más el adaptador. Si el base tiene menos de 7B parámetros, podría ejecutarse en GPUs de consumo como RTX 3060 (12 GB) o RTX 4090 (24 GB) con cuantización.
- Si el base supera los 13B parámetros, se requerirían GPUs profesionales (A100, H100) o cuantización agresiva.
- Opciones de despliegue: al ser un modelo PEFT, se puede cargar con transformers y PEFT en Python, o exportar a GGUF para usar con llama.cpp u Ollama, aunque no se proporcionan instrucciones oficiales.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El adaptador depende completamente del modelo base dicta-il/dictalm2.0-instruct, del que no se conocen especificaciones. Alternativas en el ámbito de modelos médicos en hebreo no están documentadas en la información proporcionada. Se indica "no disponible".

## Limitaciones y advertencias

- La documentación es extremadamente escasa: no se especifican datos de entrenamiento, hiperparámetros, ni evaluación, lo que impide validar su calidad o comportamiento.
- El modelo base está entrenado principalmente en hebreo, por lo que su uso en otros idiomas probablemente degrade el rendimiento.
- Al ser un adaptador LoRA, no funciona de forma independiente; requiere cargar el modelo base completo, lo que añade complejidad de despliegue.
- No se conoce la licencia del adaptador ni la del modelo base, lo que puede limitar su uso comercial.
- Riesgo de alucinaciones en dominios médicos: sin evaluación específica, no se puede garantizar la precisión clínica, y su uso en entornos sanitarios reales debe considerarse experimental.
- No se han documentado sesgos conocidos, pero al ser un modelo entrenado sobre datos no especificados, podrían existir sesgos lingüísticos o culturales no identificados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/CaptainDante/medscribe-dictalm-lora
- Modelo base (referencia): https://huggingface.co/dicta-il/dictalm2.0-instruct
- Paper de referencia sobre impacto ambiental (citado en la model card): https://arxiv.org/abs/1910.09700
- Ejemplo de aplicación MedScribe (no oficial, contexto del dominio): https://huggingface.co/spaces/yasserrmd/medscribe
