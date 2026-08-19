# SanatanSinghVishen/sift-1b-dpo

## Resumen

El modelo `SanatanSinghVishen/sift-1b-dpo` es un adaptador LoRA (librería PEFT) entrenado sobre el modelo base `unsloth/Qwen2.5-1.5B-Instruct-bnb-4bit`, una versión cuantizada en 4 bits de Qwen2.5-1.5B-Instruct. El nombre sugiere que fue afinado mediante Direct Preference Optimization (DPO), una técnica de alineación que ajusta los pesos del modelo a partir de pares de respuestas preferidas y no preferidas, sin necesidad de un modelo de recompensa separado. El repositorio tiene un tamaño de 0.1 GB, consistente con un adaptador de bajo rango.

A pesar de que la model card está completamente vacía y no se proporcionan detalles sobre el proceso de entrenamiento, los datos de los conjuntos de datos ni los resultados de evaluación, el modelo representa un ejemplo de fine-tuning eficiente sobre un modelo pequeño (1.5B parámetros) con una técnica de alineación moderna. Su relevancia radica en demostrar cómo se puede adaptar un modelo base de tamaño reducido para tareas conversacionales o de preferencia, manteniendo un coste computacional bajo y permitiendo su ejecución en hardware de consumo.

No se dispone de información adicional sobre el autor, el propósito exacto o el rendimiento del modelo, por lo que esta ficha se basa únicamente en los metadatos disponibles y en las características conocidas del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5 (transformer decoder) con adaptador LoRA |
| Parametros totales | 1.5B (modelo base) + adaptador LoRA (tamaño no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-1.5B-Instruct soporta hasta 32K tokens, pero no confirmado) |
| Tipos de cuantizacion | bnb-4bit (modelo base), adaptador en safetensors |
| Idiomas soportados | no disponible (el modelo base soporta múltiples idiomas, pero no se especifica) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) que se monta sobre `unsloth/Qwen2.5-1.5B-Instruct-bnb-4bit`. El modelo base es una versión de Qwen2.5-1.5B-Instruct cuantizada a 4 bits mediante bitsandbytes, lo que reduce significativamente los requisitos de memoria. La arquitectura subyacente es un transformer decoder estándar con atención causal, típico de la familia Qwen2.5.

El nombre "sift-1b-dpo" indica que el entrenamiento se realizó con Direct Preference Optimization (DPO), una técnica que optimiza directamente la política del modelo para maximizar la probabilidad de respuestas preferidas frente a no preferidas, sin necesidad de entrenar un modelo de recompensa. Sin embargo, no se han publicado detalles sobre el conjunto de datos utilizado, el número de pasos de entrenamiento, los hiperparámetros (como la tasa de aprendizaje o el rango del LoRA) ni el régimen de precisión. La model card no incluye ninguna información sobre el proceso de entrenamiento, por lo que todos estos aspectos se consideran no disponibles.

## Capacidades

- Generación de texto conversacional: al estar basado en Qwen2.5-1.5B-Instruct, hereda la capacidad de mantener diálogos multi-turno y responder instrucciones.
- Fine-tuning con DPO: el adaptador ha sido entrenado para alinear las respuestas con preferencias humanas, aunque no se especifica en qué dominio o estilo.
- Soporte de tool calling: el modelo base Qwen2.5-1.5B-Instruct incluye soporte para function calling, pero no se confirma si el adaptador lo preserva.
- Multilingüismo: el modelo base soporta varios idiomas, pero no se indica si el adaptador afecta a esta capacidad.
- No se dispone de información sobre capacidades especiales como vision, audio o modo de razonamiento extendido.

## Casos de uso

- Asistentes conversacionales ligeros: al ser un adaptador sobre un modelo de 1.5B cuantizado, puede desplegarse en entornos con recursos limitados, como chatbots en dispositivos edge o aplicaciones móviles.
- Experimentación con DPO: sirve como ejemplo práctico de cómo aplicar Direct Preference Optimization sobre un modelo pequeño, útil para investigadores que quieran replicar o estudiar la técnica.
- Fine-tuning específico de dominio: el adaptador puede servir como punto de partida para ajustes adicionales en tareas concretas, como atención al cliente o generación de respuestas en un sector vertical.
- Prototipado rápido: dado su bajo coste de inferencia, es adecuado para pruebas de concepto en aplicaciones de generación de texto sin necesidad de GPUs de gama alta.
- Evaluación de alineación: permite comparar el comportamiento de un modelo afinado con DPO frente al modelo base, para medir el impacto de la técnica en la calidad de las respuestas.
- Educación y formación: útil para demostrar el flujo de trabajo de fine-tuning con LoRA y DPO en cursos o talleres de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre métricas como MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA sobre un modelo cuantizado en 4 bits, la inferencia puede ejecutarse con aproximadamente 2-3 GB de VRAM, dependiendo de la longitud del contexto y el batch size.
- GPU recomendadas: tarjetas con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, o superiores. También puede ejecutarse en CPU con suficiente RAM, aunque con mayor latencia.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de consumo medio-bajo.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la librería `transformers` junto con `peft`. También es compatible con `vLLM` y `llama.cpp` si se fusiona el adaptador con el modelo base y se convierte a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa. El modelo es un adaptador no documentado sobre Qwen2.5-1.5B-Instruct, por lo que no se conocen alternativas directas con el mismo enfoque (LoRA + DPO sobre un modelo de 1.5B). Se podría comparar con el modelo base original y con otros adaptadores DPO de la comunidad, pero no hay datos públicos de rendimiento.

## Limitaciones y advertencias

- Documentación inexistente: la model card no proporciona información sobre el entrenamiento, los datos ni el rendimiento, lo que dificulta su uso en producción.
- Sesgos del modelo base: Qwen2.5-1.5B-Instruct puede presentar sesgos inherentes a sus datos de entrenamiento, que el adaptador no corrige necesariamente.
- Riesgo de alucinación: al ser un modelo pequeño, puede generar respuestas factualmente incorrectas o inventadas, especialmente en temas especializados.
- Limitaciones de idioma: no se especifican los idiomas soportados tras el fine-tuning; el modelo base tiene un rendimiento variable según el idioma.
- Restricciones de licencia: la licencia del adaptador no está declarada; el modelo base Qwen2.5 tiene licencia Apache 2.0, pero no se puede asumir que el adaptador la herede.
- Falta de reproducibilidad: sin detalles sobre el dataset ni los hiperparámetros, es imposible replicar el entrenamiento o verificar la calidad del adaptador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SanatanSinghVishen/sift-1b-dpo
- Modelo base (unsloth/Qwen2.5-1.5B-Instruct-bnb-4bit): https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct-bnb-4bit
- Referencia a Lacoste et al. (2019) sobre impacto ambiental (tag arxiv:1910.09700): https://arxiv.org/abs/1910.09700
- Documentación de PEFT: https://huggingface.co/docs/peft/index
