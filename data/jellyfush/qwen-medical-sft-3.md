# JellyFush/qwen-medical-sft-3

## Resumen

El modelo `JellyFush/qwen-medical-sft-3` es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-4B, desarrollado por el usuario JellyFush. Se trata de un modelo de lenguaje entrenado mediante aprendizaje supervisado (SFT) con la librería TRL de Hugging Face, orientado aparentemente a tareas de dominio médico, aunque la documentación oficial no especifica el conjunto de datos utilizado ni el alcance exacto de las capacidades médicas.

El modelo se publica con un tamaño de repositorio de 0,6 GB, lo que sugiere que los pesos se distribuyen en formato `safetensors` y posiblemente en una cuantización reducida. Al estar basado en Qwen3.5-4B, hereda la arquitectura transformer de 4 mil millones de parámetros del modelo original, aunque no se han publicado detalles sobre la longitud de contexto, los idiomas soportados ni la licencia aplicable. Su relevancia radica en que ofrece una alternativa de dominio específico para aplicaciones de generación de texto en el ámbito sanitario, pero con una documentación muy limitada que obliga a un uso cauteloso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-4B) |
| Parámetros totales | 4 mil millones (aproximadamente) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el tamaño del repositorio sugiere una cuantización, pero no se especifica) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el README indica "license" sin detalle) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen/Qwen3.5-4B, un modelo de lenguaje grande de tipo transformer con aproximadamente 4.000 millones de parámetros. El entrenamiento se realizó mediante SFT (supervised fine-tuning) usando la librería TRL (Transformers Reinforcement Learning) en su versión 1.6.0, con Transformers 5.12.1 y PyTorch 2.8.0. No se proporciona información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO.

La única innovación técnica destacable es que se trata de un fine-tuning completo (full-parameter) sobre el modelo base, aunque no se detalla el procedimiento específico. El enlace de Weights & Biases incluido en la model card apunta a un run de entrenamiento, pero no se ha accedido a él para extraer más detalles.

## Capacidades

- Generación de texto: el modelo es capaz de producir respuestas de texto libre, como se muestra en el ejemplo de la model card con una pregunta sobre una máquina del tiempo.
- Soporte de chat multi-turno: el ejemplo de uso emplea el formato de mensajes con roles (`user` y `assistant`), lo que indica que puede gestionar conversaciones estructuradas.
- Capacidades médicas: aunque no hay documentación específica, el nombre del modelo sugiere que fue entrenado para tareas de dominio médico, pero no se han publicado ejemplos concretos de preguntas o respuestas médicas.
- No se dispone de información sobre tool calling, agentes, razonamiento multi-paso, visión o audio. Estas capacidades, si existen, serían heredadas del modelo base Qwen3.5-4B, pero no se han confirmado en esta ficha.

## Casos de uso

- **Asistencia en consultas médicas generales**: el modelo podría utilizarse como un asistente de chat para responder preguntas básicas sobre síntomas o tratamientos, aunque sin validación clínica y con riesgo de errores.
- **Generación de resúmenes de historiales clínicos**: dado su entrenamiento en dominio médico (presumible), podría emplearse para resumir textos clínicos, pero no hay evidencia de su rendimiento en esta tarea.
- **Soporte en educación para pacientes**: podría generar explicaciones simplificadas de términos médicos o procedimientos, siempre que se supervise el contenido.
- **Prototipos de chatbots de salud**: integrable en aplicaciones de demostración para entornos de investigación, con la advertencia de no usarlo en producción.
- **Investigación académica**: útil para experimentos de fine-tuning o comparaciones de modelos médicos en español, aunque no se han publicado benchmarks.
- **Generación de contenido de divulgación médica**: puede redactar textos informativos sobre enfermedades o hábitos saludables, con revisión humana obligatoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra evaluación comparativa para este modelo concreto.

## Requisitos de hardware

- **VRAM estimada para inferencia**: para un modelo de 4B en precisión FP16 se necesitan aproximadamente 8 GB de VRAM. Si el modelo está cuantizado (por ejemplo, INT8 o INT4), el requisito sería menor, pero no se especifica el tipo de cuantización.
- **GPU recomendadas**: tarjetas con al menos 10 GB de VRAM, como la RTX 3080/3090 o RTX 4090, para ejecutar el modelo en FP16. Para cuantización 4-bit, una GPU con 6 GB podría ser suficiente, pero no se confirma.
- **Compatibilidad con GPUs de consumo**: probablemente sí, si se utiliza una cuantización adecuada, pero al no haber especificaciones, se recomienda probar con herramientas como llama.cpp o vLLM.
- **Opciones de despliegue**: se puede cargar con Transformers mediante `pipeline` como se muestra en el README. También es compatible con vLLM, TGI o Ollama si se convierte a GGUF, aunque no se ha probado oficialmente.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos. El modelo base Qwen3.5-4B no está documentado en los resultados de búsqueda, y no hay otros modelos de la misma familia en el repositorio de JellyFush que permitan comparar. Se recomienda buscar alternativas como Meditron o modelos médicos de la familia Llama, pero no hay datos concretos para esta ficha.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: al ser un modelo de lenguaje general, puede generar respuestas falsas o inventadas, especialmente en el dominio médico, donde la precisión es crítica.
- **Falta de validación clínica**: no se ha demostrado su seguridad ni eficacia en entornos sanitarios reales. No debe utilizarse para diagnóstico o tratamiento sin supervisión profesional.
- **Documentación insuficiente**: no se especifica el dataset de entrenamiento, la licencia exacta ni los idiomas, lo que limita su uso en producción.
- **Contexto limitado**: se desconoce la longitud de contexto, por lo que puede fallar en conversaciones largas.
- **Restricciones de licencia**: al ser desconocida, no se puede garantizar su uso comercial. Se recomienda consultar al autor antes de utilizarlo en proyectos comerciales.
- **Soporte técnico**: al ser un modelo publicado por un usuario individual, no hay garantías de mantenimiento ni actualizaciones.

## Enlaces

- [Hugging Face - JellyFush/qwen-medical-sft-3](https://huggingface.co/JellyFush/qwen-medical-sft-3)
- [Weights & Biases - run de entrenamiento](https://wandb.ai/leviettin/paceup/runs/1rb0fkea) (enlace proporcionado en la model card)
- [Repositorio de TRL](https://github.com/huggingface/trl) (librería utilizada para el entrenamiento)
