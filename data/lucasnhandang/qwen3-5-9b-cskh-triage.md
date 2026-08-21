# lucasnhandang/qwen3.5-9b-cskh-triage

## Resumen

`lucasnhandang/qwen3.5-9b-cskh-triage` es un adaptador LoRA (PEFT) entrenado mediante supervisión fina (SFT) sobre el modelo base Qwen/Qwen3.5-9B, orientado a la tarea de triage de atención al cliente (CSKH, del vietnamita "chăm sóc khách hàng"). El autor, lucasnhandang, publica este adaptador con el objetivo de especializar un modelo generalista de 9B en la clasificación, priorización y enrutamiento de consultas o tickets de soporte, aprovechando las capacidades ya presentes en el modelo base sin necesidad de un fine-tuning completo.

El modelo base Qwen3.5-9B, desarrollado por Alibaba, es un transformer denso multimodal con arquitectura híbrida de atención (gated delta networks), encoder de visión, contexto nativo de 262K tokens y soporte para 201 idiomas. El adaptador añade una capa de especialización ligera (0.2 GB) que permite ajustar el comportamiento del modelo a un dominio concreto con un coste computacional reducido. Su relevancia radica en que combina la potencia de un modelo de última generación con la flexibilidad de un adaptador de bajo rango, facilitando su despliegue en entornos de producción con recursos limitados.

La ficha se basa exclusivamente en la información disponible en HuggingFace y en los resultados de búsqueda sobre el modelo base. La model card del adaptador está prácticamente vacía, por lo que muchos datos específicos del adaptador no están disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen3.5-9B (transformer denso multimodal con atención híbrida gated delta) |
| Parametros totales | No disponible (el adaptador ocupa 0.2 GB; el modelo base tiene 9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262K tokens (heredado del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el base admite cuantización estándar) |
| Idiomas soportados | No disponible (el modelo base soporta 201 idiomas, pero el adaptador no especifica restricciones) |
| Licencia | No disponible (el modelo base es Apache 2.0, pero el adaptador no declara licencia) |
| Formato de pesos | safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la librería PEFT (versión 0.20.0) y utiliza el formato LoRA, que introduce matrices de bajo rango en las capas del modelo base para adaptar su comportamiento a una tarea específica. El entrenamiento se realizó mediante SFT (supervised fine-tuning) con la librería TRL de HuggingFace, como indican las etiquetas del repositorio. No se proporcionan detalles sobre el dataset de entrenamiento, el número de pasos, el rango del adaptador, la tasa de aprendizaje ni el régimen de precisión (fp16, bf16, etc.).

El modelo base Qwen3.5-9B, sobre el que se monta el adaptador, emplea una arquitectura densa con atención híbrida basada en gated delta networks, un encoder de visión para entrada multimodal (imagen y vídeo) y soporte para múltiples tokens de predicción (MTP). Fue lanzado el 2 de marzo de 2026 bajo licencia Apache 2.0 y está diseñado para razonamiento, generación de código, tool calling y tareas agénticas. El adaptador hereda todas estas capacidades, aunque su especialización declarada es el triage de atención al cliente.

## Capacidades

- Clasificación y priorización de tickets de soporte: el adaptador está diseñado para categorizar consultas de clientes, asignar niveles de urgencia y enrutar incidencias al departamento adecuado.
- Generación de texto y razonamiento: hereda las capacidades del modelo base, incluyendo razonamiento multi-step y generación de respuestas coherentes.
- Soporte de tool calling y function calling: el modelo base soporta invocación nativa de herramientas, lo que permite al adaptador integrarse en flujos de trabajo automatizados.
- Capacidades multilingües: el base soporta 201 idiomas, aunque el adaptador no especifica si el fine-tuning se realizó en un idioma concreto (probablemente vietnamita, dado el nombre CSKH).
- Capacidades multimodales: el base acepta entrada de texto, imagen y vídeo, pero no se indica si el adaptador conserva o modifica estas capacidades.
- Modo agéntico: el base está optimizado para flujos agénticos, lo que podría permitir al adaptador gestionar conversaciones multi-turno con contexto largo.

## Casos de uso

- Atención al cliente automatizada: el adaptador puede clasificar automáticamente las consultas entrantes en categorías predefinidas (reclamaciones, facturación, soporte técnico, etc.) y priorizarlas según urgencia, gracias a su contexto de 262K tokens que permite procesar historiales completos de conversación.
- Enrutamiento inteligente de tickets: integrado en un sistema de ticketing (como Zendesk o Freshdesk), el modelo puede asignar cada incidencia al agente o equipo adecuado basándose en el contenido del mensaje y el historial del cliente.
- Resumen de conversaciones para agentes: el adaptador puede generar resúmenes concisos de interacciones largas, facilitando la transferencia de contexto entre agentes humanos.
- Extracción de entidades y datos clave: a partir de mensajes de clientes, puede extraer números de pedido, fechas, productos o problemas recurrentes, alimentando bases de conocimiento o sistemas CRM.
- Detección de escalaciones: identifica automáticamente conversaciones que requieren intervención humana o supervisión, reduciendo el tiempo de respuesta en casos críticos.
- Generación de respuestas sugeridas: el adaptador puede proponer respuestas preliminares a los agentes, acelerando la resolución de consultas frecuentes y manteniendo un tono coherente con la política de la empresa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para el adaptador `lucasnhandang/qwen3.5-9b-cskh-triage` en la información disponible. La model card no incluye métricas de evaluación ni comparativas con otros modelos.

En cuanto al modelo base Qwen3.5-9B, fuentes externas indican que fue calificado por Artificial Analysis como el modelo más inteligente por debajo de 10B parámetros en el momento de su lanzamiento, con una puntuación aproximadamente el doble que la del siguiente modelo más cercano en esa categoría, y lideró a sus competidores en MMMU-Pro con alrededor del 69%. Sin embargo, estos datos corresponden al modelo base y no al adaptador, por lo que no pueden atribuirse al fine-tuning específico.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA añade solo 0.2 GB al peso del modelo base. El Qwen3.5-9B completo, en precisión fp16, requiere aproximadamente 18-20 GB de VRAM. Con cuantización a 4 bits (por ejemplo, GPTQ o AWQ), puede reducirse a unos 6-8 GB.
- GPU recomendadas: según vLLM Recipes, el modelo base cabe en una GPU de 24 GB (como RTX 4090, A10G o L4). Para despliegues de producción con mayor concurrencia, se recomiendan A100 (40/80 GB) o H100.
- Compatibilidad con GPU de consumo: sí, el modelo base puede ejecutarse en GPUs de consumo como RTX 3090/4090 (24 GB) con cuantización, y el adaptador no añade requisitos adicionales significativos.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con transformers y PEFT, o fusionarse con el modelo base para su uso con vLLM, llama.cpp, Ollama o TGI. El formato safetensors es compatible con la mayoría de los frameworks.
- Latencia y throughput: no disponible. Dependerá del hardware, la cuantización y el framework de inferencia elegidos.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables para la misma tarea (triage de atención al cliente) sobre el mismo modelo base. Como referencia, se puede comparar el modelo base Qwen3.5-9B con otras alternativas de tamaño similar, aunque el adaptador no modifica sustancialmente estas características:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-9B (base) | 9B | 262K | Apache 2.0 | Multimodal, 201 idiomas, tool calling |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 Community License | Solo texto, sin visión nativa |
| Mistral 7B | 7B | 32K | Apache 2.0 | Solo texto, sin tool calling nativo |

El adaptador `cskh-triage` se diferencia de estos modelos generalistas en que está especializado para una tarea concreta, lo que puede mejorar su precisión en clasificación de tickets a costa de perder generalidad fuera de ese dominio.

## Limitaciones y advertencias

- La model card del adaptador está vacía: no se documentan el dataset de entrenamiento, los hiperparámetros, el rendimiento ni los casos de uso previstos. Esto dificulta evaluar su calidad y su idoneidad para producción.
- Sin datos de evaluación: no hay métricas de precisión, recall o F1 para la tarea de triage, por lo que no se puede verificar que el adaptador mejore al modelo base sin fine-tuning.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir clasificaciones incorrectas o inventar categorías si el prompt no está bien definido. Se recomienda validar las salidas con un sistema de reglas o un humano.
- Sesgos potenciales: el modelo base puede arrastrar sesgos de los datos de preentrenamiento, y el adaptador podría amplificarlos si el dataset de fine-tuning no es representativo o está desequilibrado.
- Licencia no declarada: aunque el modelo base es Apache 2.0, el adaptador no especifica su licencia. Antes de un uso comercial, conviene contactar con el autor o asumir las condiciones del base.
- Limitaciones de idioma: el nombre sugiere un enfoque en vietnamita, pero no se confirma. Si el fine-tuning se realizó solo en un idioma, el rendimiento en otros puede degradarse.
- Contexto largo: aunque el base soporta 262K tokens, el adaptador puede no haber sido entrenado para aprovechar todo ese contexto, por lo que su rendimiento en conversaciones muy largas es incierto.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/lucasnhandang/qwen3.5-9b-cskh-triage
- Modelo base Qwen/Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Ficha de vLLM Recipes sobre Qwen3.5-9B: https://recipes.vllm.ai/Qwen/Qwen3.5-9B
- Ficha de OVHcloud sobre Qwen3.5-9B: https://www.ovhcloud.com/en/public-cloud/ai-endpoints/catalog/qwen-3-5-9b/
- Ficha de Together AI sobre Qwen3.5-9B: https://www.together.ai/models/qwen3-5-9b
- Análisis de LLM Releases sobre Qwen3.5-9B: https://www.llm-releases.com/models/qwen3-5-9b
- Ficha de DataLearnerAI sobre Qwen3.5-9B: https://www.datalearner.com/en/ai-models/pretrained-models/qwen3-5-9b
