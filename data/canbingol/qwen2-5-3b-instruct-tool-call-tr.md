# canbingol/Qwen2.5-3B-Instruct-tool-call-tr

## Resumen

El modelo `canbingol/Qwen2.5-3B-Instruct-tool-call-tr` es un ajuste fino (fine-tuning) del modelo base `Qwen/Qwen2.5-3B-Instruct` orientado a la llamada a herramientas (tool calling) en turco. Ha sido desarrollado por el usuario de HuggingFace `canbingol` y se distribuye como un adaptador LoRA entrenado sobre el dataset `atasoglu/turkish-function-calling-20k`, que contiene 20 000 ejemplos de llamadas a funciones en turco. El objetivo es adaptar las capacidades de razonamiento y generación del modelo base para que pueda invocar herramientas externas de forma fiable en este idioma.

La relevancia de este modelo radica en la escasez de modelos de tool calling específicos para turco. Al partir de Qwen2.5-3B-Instruct, hereda una arquitectura transformer decoder-only con 3 000 millones de parámetros y una ventana de contexto de 32 000 tokens (según la ficha del modelo base, aunque no se confirma en este repositorio). El ajuste con LoRA (r=16, alpha=32) permite un despliegue ligero, con un tamaño de repositorio de solo 0,3 GB, lo que sugiere que se distribuyen los adaptadores y no los pesos completos.

No se han publicado métricas de evaluación ni detalles sobre la licencia, los idiomas soportados o los requisitos de hardware específicos en la información disponible. A pesar de ello, el modelo puede ser útil para desarrolladores que necesiten integrar asistentes conversacionales en turco con capacidades de function calling, especialmente en entornos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-3B-Instruct) |
| Parametros totales | 3 000 millones (modelo base) |
| Parametros activos | no disponible (adaptador LoRA, r=16) |
| Longitud de contexto | 32 000 tokens (heredado del modelo base, no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Turco (principal), otros idiomas del modelo base (no verificado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen2.5-3B-Instruct, un transformer decoder-only con atención causal y normalización RMSNorm. El ajuste fino se realizó mediante LoRA (Low-Rank Adaptation) con r=16 y alpha=32, lo que implica que solo se entrenaron matrices de bajo rango sobre las capas de atención y MLP, manteniendo congelados los pesos del modelo base. El entrenamiento se llevó a cabo durante 2 épocas con una tasa de aprendizaje de 2e-4 sobre el dataset `atasoglu/turkish-function-calling-20k`, compuesto por 20 000 ejemplos de llamadas a funciones en turco.

No se especifica si se utilizaron técnicas adicionales como RLHF o DPO, ni la composición exacta del dataset más allá de su nombre. El repositorio indica el uso de las librerías `transformers`, `trl` y `safetensors`, y la etiqueta `generated_from_trainer` sugiere que el entrenamiento se realizó con el módulo `Trainer` de HuggingFace. La ausencia de información sobre el número total de tokens de entrenamiento o la estrategia de muestreo limita una evaluación más profunda de la metodología.

## Capacidades

- Llamada a herramientas (tool calling) en turco: el modelo está diseñado para generar llamadas a funciones estructuradas a partir de instrucciones en lenguaje natural, lo que permite integrarlo con APIs y servicios externos.
- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen2.5-3B-Instruct, incluyendo generación de texto, respuesta a preguntas y razonamiento básico.
- Soporte de conversación multi-turno: al basarse en un modelo instruct, puede mantener diálogos con contexto, aunque la ventana efectiva no está confirmada.
- Multilingüismo parcial: aunque el ajuste se centra en turco, el modelo base soporta múltiples idiomas, por lo que podría funcionar razonablemente en otros, aunque con menor precisión en tool calling.
- No se han documentado capacidades específicas como vision, audio o modo de pensamiento extendido.

## Casos de uso

- Asistentes virtuales en turco para atención al cliente: el modelo puede gestionar conversaciones multi-turno y ejecutar acciones como consultar bases de datos, enviar formularios o recuperar información de APIs, gracias a su capacidad de tool calling.
- Automatización de tareas empresariales: integración en pipelines que requieran extraer datos de sistemas externos (CRM, ERP) mediante llamadas a funciones, respondiendo en turco.
- Chatbots de soporte técnico: el modelo puede invocar herramientas de diagnóstico o de gestión de tickets, reduciendo la intervención humana en incidencias comunes.
- Generación de código y scripts en entornos turcos: aunque no está específicamente entrenado para código, el modelo base tiene capacidades de generación de código que pueden combinarse con tool calling para automatizar tareas de desarrollo.
- Asistentes de reservas o compras: integración con APIs de reservas de hoteles, vuelos o comercio electrónico, donde el modelo interpreta la intención del usuario y ejecuta la llamada correspondiente.
- Prototipado rápido de agentes conversacionales en turco: dado su tamaño reducido y el uso de LoRA, es adecuado para entornos de desarrollo y pruebas con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre métricas como MMLU, HumanEval o GSM8K para este modelo específico, ni comparaciones con otros modelos de tool calling en turco.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Dado que el modelo base tiene 3 000 millones de parámetros, una estimación orientativa para inferencia en FP16 sería de aproximadamente 6-8 GB de VRAM, pero este dato no está confirmado y depende de la cuantización.
- GPU recomendadas: no disponible. Modelos de este tamaño pueden ejecutarse en GPUs consumer como RTX 3060, RTX 4060 o superiores, pero no hay especificaciones oficiales.
- Si cabe en consumer GPU: probablemente sí, dado el tamaño del modelo base, pero no está confirmado.
- Opciones de despliegue: al usar `transformers` y `safetensors`, puede desplegarse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama. No se proporcionan instrucciones específicas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicamente entrenados para tool calling en turco. El modelo más cercano es el propio `Qwen/Qwen2.5-3B-Instruct`, que sirve como base y no está especializado en turco. No hay datos públicos de rendimiento relativo.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado, pero al ser un fine-tuning sobre un dataset específico, puede heredar sesgos del modelo base y del propio dataset.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir llamadas a funciones incorrectas o inventar parámetros, especialmente en dominios no cubiertos por el dataset de entrenamiento.
- Limitaciones de contexto e idioma: la ventana de contexto no está confirmada y el modelo está optimizado para turco; su rendimiento en otros idiomas puede degradarse.
- Restricciones de licencia: la licencia no está especificada en el repositorio. Aunque el modelo base es Apache 2.0, el adaptador LoRA podría tener restricciones adicionales. Se recomienda contactar al autor antes de uso comercial.
- Carencia de documentación: no hay información sobre el proceso de entrenamiento más allá de los hiperparámetros básicos, lo que dificulta la reproducibilidad y la evaluación de riesgos.
- Tamaño del repositorio: 0,3 GB sugiere que solo se incluyen los adaptadores LoRA, por lo que es necesario descargar el modelo base por separado para su uso.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/canbingol/Qwen2.5-3B-Instruct-tool-call-tr
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset mencionado: https://huggingface.co/datasets/atasoglu/turkish-function-calling-20k (no verificado)
