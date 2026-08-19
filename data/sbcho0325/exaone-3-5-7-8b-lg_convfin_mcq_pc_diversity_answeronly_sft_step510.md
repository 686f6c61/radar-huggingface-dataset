# sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_diversity_answeronly_sft_step510

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) entrenado mediante aprendizaje supervisado (SFT) sobre el modelo base `LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct`, desarrollado por el usuario `sbcho0325`. El nombre del adaptador sugiere un ajuste orientado a tareas de conversación, preguntas de opción múltiple (MCQ) y diversidad de respuestas, con un paso de entrenamiento fijado en 510. El adaptador está publicado en formato PEFT (0.3 GB) y se integra con la librería `transformers` y `trl`.

La relevancia de este adaptador radica en que permite especializar un modelo instructivo ya potente (EXAONE 3.5 de 7.8B) sin necesidad de reentrenar todos los parámetros, lo que reduce costes computacionales y facilita su despliegue. Sin embargo, la información pública es muy limitada: no se proporcionan detalles sobre los datos de entrenamiento, hiperparámetros, evaluación ni casos de uso concretos. Por tanto, esta ficha se basa únicamente en los metadatos disponibles y en las características generales del modelo base, que tampoco están completamente documentadas en este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct` (modelo base no documentado en este repo) |
| Parametros totales | No disponible (el adaptador pesa 0.3 GB, pero los parámetros del modelo base no se especifican) |
| Parametros activos | No disponible (no se indica si el modelo base es MoE o denso) |
| Longitud de contexto | No disponible (depende del modelo base, no se informa) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors, pero no se mencionan cuantizaciones del modelo base) |
| Idiomas soportados | No disponible (el modelo base EXAONE 3.5 es multilingüe, pero no se confirma en este repo) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica LoRA, que congela los pesos del modelo original e inyecta matrices de bajo rango en las capas de atención y feed-forward. El entrenamiento se realizó mediante SFT (Supervised Fine-Tuning), como indican las etiquetas `sft` y `trl`. El paso de entrenamiento está fijado en 510, lo que sugiere un ajuste relativamente corto. No se proporcionan detalles sobre el dataset utilizado, la composición de los datos, ni si se aplicaron técnicas adicionales como RLHF o DPO. El nombre del archivo (`lg_convfin_mcq_pc_diversity_answeronly_sft_step510`) sugiere que el entrenamiento pudo enfocarse en respuestas únicas (answer-only) para preguntas de opción múltiple y en la diversidad de respuestas, pero esto es una inferencia a partir del nombre y no está confirmado.

## Capacidades

- Generación de texto conversacional: al estar basado en un modelo instructivo, el adaptador hereda la capacidad de mantener diálogos multi-turno, aunque no se ha verificado su rendimiento específico.
- Respuesta a preguntas de opción múltiple (MCQ): el nombre del adaptador indica un posible ajuste para este tipo de tareas, pero no hay evidencia pública de su eficacia.
- Diversidad de respuestas: el término "diversity" en el nombre sugiere un esfuerzo por generar respuestas variadas, pero no se documentan métricas.
- No se confirma soporte para tool calling, agentes, visión o audio, ya que no hay información al respecto en el repositorio.

## Casos de uso

Dado que la información es insuficiente, los casos de uso son hipotéticos y dependen del comportamiento real del adaptador, que no ha sido evaluado públicamente. Se sugieren aplicaciones genéricas de un modelo instructivo ajustado por LoRA:

- Asistentes conversacionales especializados en dominios específicos: si el adaptador se entrenó con datos de conversación, podría integrarse en chatbots para atención al cliente o soporte técnico, aprovechando la eficiencia del ajuste LoRA.
- Sistemas de evaluación educativa: la posible orientación a preguntas de opción múltiple permitiría generar preguntas o respuestas para plataformas de e-learning.
- Generación de contenido diverso: si la diversidad de respuestas es efectiva, podría usarse para crear variaciones de texto en marketing o redacción creativa.
- Prototipado rápido de modelos especializados: al ser un adaptador ligero, es adecuado para experimentar con fine-tuning sobre un modelo base sin grandes recursos.
- Investigación en eficiencia de adaptación: el adaptador puede servir como caso de estudio para comparar estrategias de SFT con LoRA frente a fine-tuning completo.
- Despliegue en entornos con recursos limitados: al requerir solo el adaptador (0.3 GB) además del modelo base, es viable para pruebas en hardware modesto, aunque el modelo base completo sigue siendo necesario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra métrica que permita evaluar el rendimiento del adaptador.

## Requisitos de hardware

- El adaptador en sí ocupa 0.3 GB, pero para la inferencia se necesita cargar el modelo base `EXAONE-3.5-7.8B-Instruct`, que tiene aproximadamente 7.8 mil millones de parámetros.
- VRAM estimada: para un modelo de 7.8B en precisión FP16 se requieren alrededor de 15-16 GB de VRAM. Con cuantización INT8 se puede reducir a unos 8-9 GB, y con INT4 a unos 5-6 GB. Sin embargo, no se confirma si el modelo base admite estas cuantizaciones ni se indica el contexto.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) o una A100 (40/80 GB) serían adecuadas para FP16. Para cuantización INT4, una RTX 3090 (24 GB) o inferior podría bastar.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con `transformers` y `peft`. También podría convertirse a GGUF para usarse con `llama.cpp` u Ollama, pero no hay garantía de compatibilidad sin probarlo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo base EXAONE-3.5-7.8B-Instruct pertenece a la familia EXAONE de LGAI, pero no se conocen sus métricas exactas ni se pueden contrastar con otros adaptadores LoRA similares. Se recomienda consultar la documentación oficial de EXAONE 3.5 para obtener datos de referencia.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo de lenguaje, puede generar contenido falso o sesgado. No se han realizado evaluaciones de sesgo en este adaptador.
- Falta de documentación: la model card está incompleta, sin información sobre datos de entrenamiento, licencia o uso previsto. Esto dificulta su adopción en producción.
- Dependencia del modelo base: el rendimiento del adaptador está limitado por las capacidades y limitaciones de EXAONE-3.5-7.8B-Instruct, que no se detallan aquí.
- Riesgo de sobreajuste: al entrenarse solo 510 pasos, es posible que el adaptador no generalice bien fuera del dominio de entrenamiento.
- Licencia: no se especifica, por lo que su uso comercial es incierto. Se debe contactar al autor antes de utilizarlo en proyectos con fines lucrativos.
- Compatibilidad: el adaptador se creó con PEFT 0.19.1 y puede requerir versiones específicas de `transformers` y `trl` para cargarse correctamente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_diversity_answeronly_sft_step510
- Modelo base (referencia): https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
