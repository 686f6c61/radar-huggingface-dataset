# mdba/escutia-qlora

## Resumen

EscutIA QLoRA es un adapter de tipo LoRA (Low-Rank Adaptation) desarrollado por el usuario mdba para la clasificación de sentimientos en portugués. No es un modelo completo, sino un conjunto de pesos de adaptación que se aplican sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct, un transformer causal de 1.500 millones de parámetros con instrucciones. El adapter fue entrenado mediante la técnica QLoRA, que cuantiza el modelo base a 4 bits (NF4 con double quantization) durante el entrenamiento para reducir el consumo de memoria, manteniendo el rendimiento de un fine-tuning completo.

El modelo resultante clasifica textos en tres categorías: negativo, neutro o positivo. Está pensado para su uso en tareas de análisis de sentimiento en portugués, aprovechando las capacidades generativas del modelo base para producir respuestas estructuradas. Su relevancia radica en que ofrece una vía eficiente para adaptar un LLM a una tarea específica con recursos limitados, aunque al ser un adapter, requiere cargar el modelo base y aplicar los pesos LoRA mediante la librería PEFT. La información pública es escasa: no se han publicado métricas de evaluación, detalles del dataset de entrenamiento ni especificaciones completas del adapter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adapter LoRA sobre transformer causal (Qwen2.5-1.5B-Instruct) |
| Parametros totales | No disponible (adapter LoRA; el modelo base tiene 1.500 millones) |
| Parametros activos | No disponible (adapter LoRA, no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | Entrenamiento con QLoRA: 4-bit NF4, double quantization; el adapter se aplica sobre el modelo base |
| Idiomas soportados | Portugués (pt) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adapter PEFT) |

## Arquitectura y entrenamiento

El adapter se basa en la técnica QLoRA, descrita en el artículo "QLoRA: Efficient Finetuning of Quantized LLMs" (Dettmers et al., 2023). QLoRA congela el modelo preentrenado, lo cuantiza a 4 bits (NF4) y añade adaptadores de bajo rango (LoRA) que se entrenan mediante retropropagación. Esto reduce drásticamente el uso de memoria en comparación con un fine-tuning completo, permitiendo ajustar modelos grandes en una sola GPU. En este caso, el modelo base es Qwen2.5-1.5B-Instruct, un transformer causal con optimización de instrucciones, y el adapter se entrena para la tarea de clasificación de sentimientos en tres clases.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados, el número de épocas, el rango de los adaptadores LoRA ni el hiperparámetro de learning rate. Tampoco se especifica si se empleó alguna técnica adicional como RLHF o DPO; la model card solo menciona el uso de QLoRA con bitsandbytes. El repositorio contiene únicamente los pesos del adapter (tamaño 0.0 GB), lo que confirma que no incluye el modelo base.

## Capacidades

- Clasificación de sentimientos en portugués: el modelo asigna una etiqueta de negativo, neutro o positivo a un texto dado.
- Generación de texto: al estar basado en Qwen2.5-1.5B-Instruct, hereda la capacidad de generar texto coherente en portugués, aunque el adapter está especializado en la tarea de clasificación.
- Conversación: el modelo base es instruct-tuned, por lo que puede mantener diálogos, pero el adapter no añade capacidades conversacionales específicas más allá de la clasificación.
- No se ha documentado soporte para tool calling, agentes, razonamiento multi-paso, visión o audio. Estas capacidades, si existen, provienen del modelo base y no del adapter.

## Casos de uso

- Análisis de opiniones de clientes: dado un conjunto de reseñas de productos o servicios en portugués, el modelo puede clasificar cada una como negativa, neutra o positiva, permitiendo a las empresas monitorizar la satisfacción de forma automatizada.
- Monitorización de redes sociales: se puede integrar en un pipeline que recopile tweets o comentarios en portugués y los clasifique por sentimiento para detectar crisis de reputación o tendencias de opinión.
- Filtrado de comentarios en plataformas: en foros o secciones de comentarios, el modelo puede etiquetar automáticamente el tono de los mensajes para moderación o priorización de respuestas.
- Análisis de encuestas abiertas: las respuestas a preguntas abiertas en encuestas de satisfacción pueden clasificarse para cuantificar el sentimiento general sin intervención manual.
- Asistente de atención al cliente: integrado en un chatbot, el modelo puede detectar el estado emocional del usuario (negativo, neutro, positivo) y derivar la conversación a un agente humano si el sentimiento es muy negativo.
- Investigación académica en PLN: sirve como punto de partida para experimentos de fine-tuning eficiente con QLoRA en portugués, permitiendo comparar el rendimiento de adaptadores sobre diferentes modelos base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que existen "archivos de evaluación y comparación incluidos en este paquete", pero no se proporcionan métricas concretas (accuracy, F1, etc.) ni comparaciones con otros modelos. Por tanto, no es posible evaluar el rendimiento real del adapter en tareas de clasificación de sentimientos.

## Requisitos de hardware

- El adapter LoRA añade una cantidad mínima de parámetros (típicamente menos del 1% del modelo base), por lo que el requisito principal es el del modelo base Qwen2.5-1.5B-Instruct.
- Para inferencia con el modelo base en 16 bits, se necesitan aproximadamente 3 GB de VRAM. En 8 bits, unos 1.5 GB; en 4 bits, alrededor de 1 GB.
- Una GPU de consumo como una RTX 3060 (12 GB) o superior es suficiente para ejecutar el modelo con el adapter. También puede ejecutarse en CPU, aunque con mayor latencia.
- El despliegue puede realizarse con librerías como Transformers + PEFT, o mediante servidores de inferencia como vLLM o TGI, siempre que soporten la carga de adaptadores LoRA.
- No se dispone de datos de latencia o throughput específicos para este adapter.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores comparables para clasificación de sentimientos en portugués. El modelo base Qwen2.5-1.5B-Instruct es un LLM generalista, pero no existen datos públicos de otros adaptadores LoRA entrenados sobre el mismo base para esta tarea. Por tanto, no es posible realizar una comparativa objetiva.

## Limitaciones y advertencias

- Es un adapter, no un modelo completo: requiere cargar el modelo base Qwen2.5-1.5B-Instruct y aplicar los pesos LoRA con PEFT. No puede usarse de forma independiente.
- La licencia no está especificada, lo que genera incertidumbre sobre el uso comercial. Se recomienda contactar con el autor antes de utilizarlo en producción.
- No hay información sobre el dataset de entrenamiento, por lo que se desconocen posibles sesgos o desequilibrios en las clases.
- El modelo solo está entrenado para portugués; no se garantiza un rendimiento adecuado en otros idiomas.
- Al ser un modelo pequeño (1.5B), su capacidad de razonamiento y precisión en tareas complejas es limitada en comparación con modelos de mayor tamaño.
- No se han publicado métricas de evaluación, por lo que el rendimiento real es desconocido. Se recomienda validar el modelo con un conjunto de prueba propio antes de usarlo en aplicaciones críticas.
- El riesgo de alucinación en la generación de texto es inherente al modelo base, aunque la tarea de clasificación es más acotada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mdba/escutia-qlora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Paper QLoRA: https://arxiv.org/abs/2305.14314
- Repositorio oficial QLoRA: https://github.com/artidoro/qlora
