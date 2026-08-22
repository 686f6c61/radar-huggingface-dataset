# ishikaa/acquisition_generator_AS_format_medmcqa_qwen7b

## Resumen

El modelo `ishikaa/acquisition_generator_AS_format_medmcqa_qwen7b` es un fine-tune del modelo base Qwen2 de 7.000 millones de parámetros, desarrollado por el usuario ishikaa en la plataforma Hugging Face. Está diseñado específicamente para la generación de preguntas de opción múltiple en el dominio médico, probablemente a partir del dataset MedMCQA, un corpus de más de 194.000 preguntas reales de exámenes de acceso a medicina en India (AIIMS y NEET PG). El nombre del repositorio sugiere que el modelo genera preguntas en un formato específico denominado "AS", aunque no se detalla en la documentación disponible.

Se trata de un modelo de generación de texto (text-generation) con arquitectura transformer decoder-only, y su relevancia radica en la posibilidad de automatizar la creación de ítems de evaluación médica, un proceso costoso y que requiere conocimiento especializado. Sin embargo, la model card es prácticamente vacía: no incluye información sobre el proceso de entrenamiento, los datos utilizados, la licencia ni los idiomas soportados, lo que limita seriamente su uso en producción sin una evaluación adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el base Qwen2-7B soporta 32.768 tokens) |
| Tipos de cuantizacion | no disponible (repo contiene pesos en safetensors) |
| Idiomas soportados | no disponible (el base Qwen2 soporta ingles, chino y otros) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atención causal, normalización RMSNorm, y activación SwiGLU. El modelo base Qwen2-7B cuenta con 28 capas, 28 cabezas de atención y una dimensión de ocultamiento de 3.584, con una longitud de contexto de 32.768 tokens. El fine-tune se realizó probablemente mediante supervisión directa (SFT) sobre el dataset MedMCQA, aunque la model card no especifica el procedimiento exacto, el número de épocas, la tasa de aprendizaje ni si se aplicaron técnicas como RLHF o DPO. El nombre del repositorio ("acquisition_generator_AS_format") sugiere que el objetivo era generar preguntas en un formato concreto de adquisición de datos, pero no hay detalles técnicos sobre el proceso de entrenamiento en la información disponible.

## Capacidades

- Generación de preguntas de opción múltiple en el dominio médico, probablemente en formato similar al dataset MedMCQA.
- Generación de texto conversacional en general, heredado del base Qwen2-7B.
- Capacidades multilingües limitadas al modelo base (inglés principalmente, aunque Qwen2 soporta otros idiomas).
- No se ha confirmado soporte de tool calling, function calling ni razonamiento multi-paso en este fine-tune concreto.
- No hay evidencia de capacidades de visión, audio o modo de pensamiento explícito.

## Casos de uso

- Generación de preguntas de práctica para estudiantes de medicina: el modelo puede crear ítems de opción múltiple sobre temas clínicos, lo que permite ampliar bancos de preguntas para simulacros de examen.
- Aumento de datos para entrenar otros modelos médicos: las preguntas generadas pueden usarse como datos adicionales para fine-tunes posteriores en tareas de QA médica.
- Evaluación automatizada de conocimiento médico: se pueden generar preguntas con distintos niveles de dificultad para evaluar el rendimiento de otros sistemas de IA en el dominio clínico.
- Creación de contenido educativo para plataformas de e-learning: las preguntas generadas pueden integrarse en cursos de medicina para autoevaluación de los alumnos.
- Investigación en generación de lenguaje natural aplicado a dominios especializados: sirve como caso de estudio para técnicas de fine-tune en dominios de conocimiento restringido.
- Desarrollo de chatbots de tutoría médica: combinado con un modelo de QA, puede plantear preguntas de práctica y evaluar las respuestas de los estudiantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre el rendimiento del modelo en MMLU, HumanEval, GSM8K ni en el propio dataset MedMCQA. El autor no ha proporcionado métricas de evaluación ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: para el modelo completo en precisión fp16 o bf16, se requieren aproximadamente 15 GB de VRAM (7.615.616.512 parámetros × 2 bytes). Con cuantización INT8 se puede reducir a ~7,6 GB, y con INT4 a ~4 GB.
- GPUs recomendadas: NVIDIA A100, H100 o RTX 4090 para una inferencia fluida sin cuantización. Con cuantización INT4, una RTX 3060 o RTX 4060 podría ser suficiente.
- En consumer GPU: sí, cabe en GPU de gama alta (RTX 4090, 24 GB) en precisión completa, y en GPU de 8 GB con cuantización.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, Transformers con accelerate.
- Latencia y throughput: no disponible. El modelo base Qwen2-7B suele generar entre 20 y 40 tokens por segundo en una RTX 4090 con bf16, pero no hay datos específicos para este fine-tune.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| ishikaa/acquisition_generator_AS_format_medmcqa_qwen7b | 7.6B | 32K (base) | no disponible | Generación de preguntas médicas |
| Qwen2-7B (base) | 7.6B | 32K | Apache 2.0 | Modelo base general |
| ishikaa/acquisition_qwen3bins_medmcqa_format | ~3B | no disponible | no disponible | Generación de preguntas médicas (Qwen3B) |
| ishikaa/acquisition_generator_AS_format_numina_qwen7b | 7.6B | 32K (base) | no disponible | Generación de preguntas matemáticas |

No se dispone de datos de rendimiento comparativos entre estos modelos. La comparación se limita a características arquitectónicas y de propósito.

## Limitaciones y advertencias

- La model card no proporciona información sobre sesgos, riesgos o limitaciones. Dado que el dataset MedMCQA se basa en exámenes de medicina de la India (AIIMS y NEET PG), el modelo puede tener sesgos hacia la terminología médica india y no ser generalizable a otros sistemas sanitarios.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar preguntas con afirmaciones médicas falsas o incorrectas. No se recomienda su uso en producción sin validación humana.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial y redistribución. Es un riesgo legal importante para integrar el modelo en productos comerciales.
- No se especifican los idiomas soportados. Si se entrenó exclusivamente con datos en inglés (MedMCQA está en inglés), el rendimiento en otros idiomas será muy limitado.
- El modelo no ha sido evaluado formalmente, por lo que su calidad real es desconocida. Cualquier uso en producción requiere una validación exhaustiva.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ishikaa/acquisition_generator_AS_format_medmcqa_qwen7b
- Modelo relacionado (Numina): https://huggingface.co/ishikaa/acquisition_generator_AS_format_numina_qwen7b
- Modelo relacionado (Qwen3B): https://huggingface.co/ishikaa/acquisition_qwen3bins_medmcqa_format
- Dataset MedMCQA: https://github.com/medmcqa/medmcqa
- Documentación del dataset MedMCQA: https://github.com/medmcqa/medmcqa/blob/main/README.md
- Página de despliegue en FriendliAI: https://friendli.ai/models/ishikaa/acquisition_student_filtered_medmcqa_qwen7b
