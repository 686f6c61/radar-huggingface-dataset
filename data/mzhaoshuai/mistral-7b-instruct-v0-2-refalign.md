# mzhaoshuai/Mistral-7B-Instruct-v0.2-refalign

## Resumen

Mistral-7B-Instruct-v0.2-refalign es un ajuste fino del modelo mistralai/Mistral-7B-Instruct-v0.2, publicado por el usuario mzhaoshuai en Hugging Face. El modelo forma parte del trabajo de investigación RL2R (Reinforcement Learning with Reference-Based Rewards), anteriormente conocido como RefAlign, que propone un esquema de alineación mediante aprendizaje por refuerzo en el que la función de recompensa se calcula con BERTScore en lugar de un modelo de recompensa entrenado aparte. El objetivo es mejorar el razonamiento y la alineación de las respuestas del modelo base sin depender de un reward model adicional.

Arquitectónicamente hereda la estructura transformer decoder-only de Mistral-7B-Instruct-v0.2, con 7.241.732.096 parámetros totales según los pesos en safetensors. El repositorio ocupa 14,5 GB y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial. La relevancia actual reside en que ejemplifica una línea de investigación sobre alineación con recompensas basadas en referencias, un enfoque alternativo a RLHF clásico con preference models.

El modelo está pensado para generación de texto conversacional y tareas de razonamiento, y se publica como material de investigación reproducible: el autor enlaza el repositorio GitHub del proyecto y el paper asociado (arXiv 2504.09895). El número de descargas es muy bajo (13 en el momento de la consulta), lo que sugiere que se trata de un artefacto de investigación más que de un modelo orientado a producción masiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Mistral-7B-Instruct-v0.2) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Mistral-7B-Instruct-v0.2 soporta 32.768 tokens; no se confirma para este ajuste) |
| Tipos de cuantizacion | no disponible en la model card; los pesos se publican en safetensors (FP16/BF16 habitual en el repo, sin confirmar) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Mistral-7B-Instruct-v0.2, un transformer decoder-only de 7.241 millones de parámetros. Sobre esa base se aplica un proceso de aprendizaje por refuerzo con recompensas basadas en referencias (RL2R, antes RefAlign). A diferencia de RLHF convencional, que requiere entrenar un modelo de recompensa a partir de preferencias humanas, aquí la recompensa se calcula directamente con BERTScore (modelo bart-large-mnli) comparando la generación con una referencia. Esto simplifica el pipeline y evita el sesgo del reward model.

Los hiperparámetros publicados en la model card son: learning rate 8e-7, batch size 512, 1 época, longitud de prompt 400, longitud de generación 800, advantage CLIP 0.5 y K=2 generaciones muestreadas por prompt. El dataset de entrenamiento es mzhaoshuai/Llama-3.3-70B-Inst-awq_ultrafeedback_1in3, una variante derivada de UltraFeedback generada con Llama-3.3-70B-Instruct AWQ. No se detalla en la información disponible el número total de tokens de entrenamiento ni la composición lingüística del dataset.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Instruct.
- Razonamiento y respuestas a instrucciones, con el ajuste orientado a mejorar la alineación mediante recompensas de referencia.
- Generación de código y matemáticas en la medida en que lo soporte el modelo base (no se documentan capacidades específicas adicionales en la model card).
- Soporte de tool calling / function calling: no documentado en la información disponible para este ajuste (el modelo base Mistral-7B-Instruct-v0.2 incluye soporte de function calling, pero no se confirma que se preserve).
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; los idiomas soportados figuran como no disponibles.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Investigación en alineación de LLM: el modelo sirve como artefacto reproducible para estudiar RL2R y comparar con RLHF basado en preference models, ya que el autor publica hiperparámetros, dataset y código.
- Reproducción de experimentos académicos: útil para validar los resultados del paper arXiv 2504.09895 sobre recompensas basadas en BERTScore en modelos de 7B.
- Generación de texto conversacional en prototipos: al heredar la naturaleza Instruct de Mistral-7B, puede emplearse en asistentes conversacionales de laboratorio con contexto moderado.
- Evaluación comparativa de esquemas de alineación: sirve como baseline ajustado frente al Mistral-7B-Instruct-v0.2 original para medir el efecto del ajuste RL2R en calidad de respuesta.
- Fine-tuning posterior en dominios específicos: al estar bajo Apache 2.0 y en safetensors, es apto para ajustes adicionales con transformers y despliegue con TGI.
- Docencia y formación técnica: ejemplo práctico de pipeline de RL con recompensas de referencia para cursos sobre alineación de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 14,5 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 20-24 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 8 GB de pesos, con margen adicional para contexto.
- VRAM estimada en cuantización de 4 bits: en torno a 4-5 GB de pesos, viable en GPUs consumer con 8 GB o más.
- GPUs recomendadas: A100 40/80 GB o H100 para serving de alta concurrencia; RTX 4090 (24 GB) para FP16 en un solo dispositivo; RTX 3090/4080 para 8 bits; RTX 3060/4060 Ti 16 GB para 4 bits.
- Cabe en GPU consumer: sí, en cuantizaciones de 4 y 8 bits; en FP16 requiere GPUs de 24 GB o más.
- Opciones de despliegue: transformers, text-generation-inference (TGI, etiqueta presente en el repo), vLLM, llama.cpp/Ollama previa conversión a GGUF (no se publican pesos GGUF en el repo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Mistral-7B-Instruct-v0.2-refalign | 7.241.732.096 | no disponible | Apache 2.0 | Ajuste RL2R sobre Mistral-7B-Instruct-v0.2 |
| mistralai/Mistral-7B-Instruct-v0.2 | 7.241.732.096 | 32.768 tokens (modelo base) | Apache 2.0 | Modelo base sin ajuste RL2R |
| Mistral-7B-Instruct-v0.3 | no disponible en esta ficha | no disponible | Apache 2.0 | Versión posterior de la familia Instruct; datos no verificados aquí |
| Zephyr-7B-beta | no disponible en esta ficha | no disponible | no disponible | Alternativa alineada con DPO; datos no verificados aquí |

No se dispone de resultados de benchmarks del modelo ajustado que permitan una comparación numérica con estas alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al heredar el modelo base, es probable que arrastre sesgos de Mistral-7B-Instruct-v0.2, pero no se cuantifican.
- Riesgo de alucinación: no evaluado en la información disponible; el ajuste con BERTScore puede favorecer respuestas superficialmente similares a las referencias sin garantizar veracidad factual.
- Limitaciones de contexto e idioma: la longitud de contexto efectiva de este ajuste no se confirma; los idiomas soportados figuran como no disponibles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y del dataset de entrenamiento.
- Caveat para producción: el modelo tiene muy pocas descargas y no presenta benchmarks publicados; no se recomienda como base de producción sin evaluación propia.
- El ajuste RL2R se validó con una configuración concreta (BERTScore bart-large-mnli, K=2, 1 época); su robustez fuera de ese régimen no está documentada.

## Enlaces

- Hugging Face: https://huggingface.co/mzhaoshuai/Mistral-7B-Instruct-v0.2-refalign
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Dataset de entrenamiento: https://huggingface.co/datasets/mzhaoshuai/Llama-3.3-70B-Inst-awq_ultrafeedback_1in3
- Paper: https://huggingface.co/papers/2504.09895
- Repositorio GitHub: https://github.com/mzhaoshuai/RL2R/tree/alignment
