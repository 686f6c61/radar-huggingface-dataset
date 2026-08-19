# sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_diversity_answeronly_sft_step340

## Resumen

Este repositorio contiene un adapter LoRA (Low-Rank Adaptation) basado en el modelo `LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct`, publicado por el usuario `sbcho0325`. El nombre del checkpoint (`lg_convfin_mcq_pc_diversity_answeronly_sft_step340`) sugiere que fue entrenado mediante supervisión fina (SFT) sobre un conjunto de datos que combina conversaciones financieras, preguntas de opción múltiple, diversidad y respuestas únicas, aunque no se proporciona documentación detallada al respecto.

El modelo se distribuye como un adaptador PEFT (Parameter-Efficient Fine-Tuning) con un tamaño de repositorio de 0,3 GB, lo que indica que solo contiene los pesos del adaptador y no el modelo base completo. Está etiquetado para generación de texto y utiliza la librería `peft` con soporte para `transformers` y `trl`. La ficha oficial del modelo está prácticamente vacía, por lo que la mayoría de los datos técnicos específicos no están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adapter LoRA sobre `LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct` (modelo base no incluido) |
| Parametros totales | No disponible (el adapter es de 0,3 GB, el modelo base tiene 7,8B parametros) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible (el repo contiene safetensors del adapter) |
| Idiomas soportados | No disponible (el modelo base EXAONE soporta coreano e ingles, pero no se confirma para este adapter) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adapter LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que se aplica sobre el modelo base `LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct`, un LLM de 7,8 mil millones de parametros desarrollado por LG AI Research. El adaptador fue entrenado mediante supervisión fina (SFT) utilizando la librería `trl` y `transformers`, como indican los tags del repositorio. El paso de entrenamiento `step340` sugiere que se guardó un checkpoint intermedio tras 340 pasos.

No se proporciona información sobre el conjunto de datos de entrenamiento, hiperparámetros, régimen de entrenamiento (precisión, duración) ni detalles sobre el proceso de ajuste. El nombre del checkpoint (`convfin_mcq_pc_diversity_answeronly`) apunta a un dataset que combina conversaciones financieras, preguntas de opción múltiple, diversidad de prompts y respuestas únicas, pero esto es una inferencia basada en la nomenclatura y no está confirmado por el autor.

## Capacidades

- Generación de texto: al ser un fine-tuning del modelo EXAONE-3.5-7.8B-Instruct, hereda las capacidades generales de generación de texto de ese modelo base (no confirmado para este adapter).
- Posible especialización en dominios financieros y preguntas de opción múltiple, según el nombre del checkpoint, pero sin documentación que lo respalde.
- No se dispone de información sobre tool calling, agentes, razonamiento multi-step, capacidades multilingües o modos especiales (thinking, vision, audio).

## Casos de uso

Debido a la falta de documentación, los casos de uso son especulativos. No obstante, el nombre del modelo sugiere aplicaciones potenciales:

- Conversación financiera automatizada: el adaptador podría estar ajustado para mantener diálogos sobre temas financieros, aunque no hay evidencia pública de su rendimiento en este dominio.
- Preguntas de opción múltiple (MCQ): el término `mcq` en el nombre indica un posible entrenamiento en este tipo de tareas, útil para exámenes o evaluaciones automáticas.
- Diversidad de respuestas: el sufijo `diversity` podría implicar un entrenamiento orientado a generar respuestas variadas, útil en sistemas de generación creativa o aumentación de datos.
- Fine-tuning específico de dominio: cualquier desarrollador podría usar este adapter como punto de partida para tareas similares, pero sin métricas o ejemplos concretos no se puede recomendar para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este adaptador.

## Requisitos de hardware

- El adaptador LoRA ocupa solo 0,3 GB, por lo que el requisito principal de hardware viene del modelo base `EXAONE-3.5-7.8B-Instruct`.
- Para inferencia con el modelo base en FP16 se estima una VRAM de aproximadamente 16 GB, pero esto no está confirmado para este adaptador.
- Se puede desplegar con librerías que soporten PEFT, como `transformers` con `peft`, o `vLLM` si se carga el modelo base y el adaptador.
- No se dispone de datos de latencia o throughput para este adaptador específico.

## Comparativa con modelos similares

No disponible. Al ser un adaptador LoRA sin documentación, no se puede establecer una comparativa fiable con otros modelos o adaptadores de la misma categoría. Se podría comparar con el modelo base `EXAONE-3.5-7.8B-Instruct`, pero no hay datos de rendimiento específicos de este adaptador.

## Limitaciones y advertencias

- La model card está vacía, por lo que no hay información sobre sesgos, riesgos de alucinación o limitaciones de contexto o idioma.
- Al ser un fine-tuning no documentado, el rendimiento en producción es impredecible.
- No se conoce la licencia del adaptador ni del conjunto de datos de entrenamiento, lo que puede limitar su uso comercial.
- El modelo base EXAONE tiene restricciones de uso comercial según su licencia original, pero no se aplica automáticamente al adaptador.
- El checkpoint es un paso intermedio (`step340`), no necesariamente el mejor resultado del entrenamiento.

## Enlaces

- [Repositorio HuggingFace del adaptador](https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_diversity_answeronly_sft_step340)
- [Modelo base: LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct](https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct) (referencia, no incluido en el repo)
