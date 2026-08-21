# hidewall/lab21-qwen35-triage-vi

## Resumen

hidewall/lab21-qwen35-triage-vi es un adaptador LoRA de 0,1 GB entrenado mediante supervisión fina (SFT) sobre el modelo base unsloth/Qwen3.5-4B, publicado por el usuario hidewall en agosto de 2026. El nombre del repositorio sugiere que está orientado a tareas de triaje (clasificación y priorización de casos) con el sufijo "vi" apuntando a un posible enfoque en vietnamita, aunque la model card no confirma los idiomas soportados.

El modelo forma parte de un ejercicio académico de fine-tuning (el repositorio GitHub asociado pertenece al programa VinUni-AI20k Day21-Track3-Finetuning-Lab), lo que indica que es un proyecto educativo de demostración más que un modelo de producción. La model card está prácticamente vacía, con todos los campos marcados como "[More Information Needed]", por lo que la información disponible es muy limitada.

A pesar de la escasez de datos, el adaptador es funcional y puede cargarse con PEFT sobre Qwen3.5-4B para generar texto. Su relevancia actual es limitada: se trata de un artefacto de aprendizaje con cero descargas y cero likes, útil principalmente como referencia de prácticas de fine-tuning con LoRA y SFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (adaptador LoRA sobre Qwen3.5-4B) |
| Parametros totales | no disponible (adaptador LoRA de 0,1 GB; base: 4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del base, no especificada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponibles (sufijo "vi" sugiere vietnamita, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) que se monta sobre el modelo base unsloth/Qwen3.5-4B, una variante optimizada por Unsloth del modelo Qwen3.5 de 4 mil millones de parámetros. La librería utilizada es PEFT 0.20.0, con el pipeline de transformers para generación de texto y TRL para el entrenamiento con SFT (supervised fine-tuning).

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni los hiperparámetros utilizados. El repositorio GitHub vinculado al programa VinUni-AI20k sugiere que el entrenamiento formó parte de un laboratorio práctico de fine-tuning, posiblemente con un dataset de triaje en vietnamita, pero esto no está confirmado en la model card.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation con etiqueta "conversational", lo que indica que el adaptador fue entrenado para mantener diálogos.
- Triage de casos: el nombre del modelo sugiere que fue fine-tuneado para clasificar o priorizar casos (posiblemente en un dominio específico no documentado).
- Capacidades multilingües: no confirmadas; el sufijo "vi" sugiere posible soporte de vietnamita, pero no hay documentación al respecto.
- Tool calling y funciones de agente: no documentadas; dependerían de las capacidades del modelo base Qwen3.5-4B.
- Razonamiento multi-paso: no documentado para este adaptador específico.

## Casos de uso

- Práctica académica de fine-tuning: el modelo sirve como referencia didáctica para estudiantes que quieran ver un ejemplo real de adaptación LoRA con SFT sobre Qwen3.5-4B, incluyendo el flujo completo de entrenamiento y publicación en HuggingFace.
- Clasificación de tickets de soporte: si el entrenamiento fue sobre datos de triaje, el adaptador podría asignar prioridades o categorías a incidencias de soporte, aunque no hay documentación que lo confirme.
- Prototipado de chatbots especializados: al ser un adaptador ligero (0,1 GB), puede cargarse sobre el base para experimentar con asistentes conversacionales en entornos de desarrollo.
- Evaluación de técnicas LoRA: útil para comparar el efecto de distintos hiperparámetros de LoRA en tareas de clasificación de texto, dado que el repositorio GitHub documenta el proceso.
- Demostración de integración PEFT + TRL: sirve como ejemplo de cómo combinar las librerías PEFT, transformers y TRL para entrenar adaptadores de bajo rango.
- Investigación de adaptación a vietnamita: si el sufijo "vi" indica fine-tuning en vietnamita, puede servir como punto de partida para estudiar la adaptación de modelos Qwen a idiomas de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA de 0,1 GB sobre un base de 4B, la inferencia requiere cargar el modelo base completo. Con cuantización de 4 bits, se necesitan aproximadamente 3-4 GB de VRAM; en precisión completa (fp16), unos 8-9 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia. Para entrenamiento del adaptador, 8-12 GB son suficientes.
- Compatibilidad con GPU consumer: sí, cabe en GPUs de consumo medio y alto.
- Opciones de despliegue: al ser un adaptador PEFT, debe cargarse junto con el base mediante transformers + peft. También puede exportarse a GGUF para usarse con llama.cpp u Ollama, aunque no se proporcionan conversiones oficiales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hidewall/lab21-qwen35-triage-vi | 4B (base) + LoRA | no disponible | Adaptador LoRA | no disponible | HuggingFace |
| rhindsight/lab21-2A202601903-qwen35-triage-vi | 4B (base) + LoRA | no disponible | Adaptador LoRA | no disponible | HuggingFace |
| Qwen3.5-4B (base) | 4B | no disponible | Modelo completo | no disponible | HuggingFace, ModelScope |

Los dos adaptadores "lab21-qwen35-triage-vi" (hidewall y rhindsight) son prácticamente idénticos en nombre y propósito, ambos derivados del mismo laboratorio académico. No se dispone de datos de rendimiento para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Model card vacía: no hay documentación sobre el dataset, el proceso de entrenamiento, los hiperparámetros ni las métricas de evaluación, lo que impide evaluar la calidad del adaptador.
- Licencia no especificada: no se indica bajo qué términos puede usarse el modelo, lo que genera incertidumbre legal para uso comercial.
- Cero adopción: el modelo tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.
- Riesgo de alucinación: al ser un fine-tuning sobre un base de 4B sin evaluación documentada, el riesgo de alucinaciones es desconocido y potencialmente alto.
- Sesgos no documentados: no hay información sobre sesgos potenciales del dataset de entrenamiento.
- Propósito académico: todo apunta a que es un ejercicio de laboratorio, no un modelo listo para producción. No se recomienda su uso en entornos críticos.
- Idiomas no confirmados: el sufijo "vi" sugiere vietnamita, pero no hay confirmación oficial de los idiomas soportados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hidewall/lab21-qwen35-triage-vi
- Modelo similar (rhindsight): https://huggingface.co/rhindsight/lab21-2A202601903-qwen35-triage-vi
- Repositorio del laboratorio (GitHub): https://github.com/VinUni-AI20k/Day21-Track3-Finetuning-Lab/blob/main/BONUS-CHALLENGE-EN.md
- Repositorio de referencia (WiiiCuti): https://github.com/WiiiCuti/lab21-2A202601538/blob/main/BONUS-CHALLENGE.md
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Perfil de Qwen en HuggingFace: https://huggingface.co/Qwen
