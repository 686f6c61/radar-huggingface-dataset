# liodon-ai/Mistral-7B-Instruct-v0.1-FP8

## Resumen

El modelo liodon-ai/Mistral-7B-Instruct-v0.1-FP8 es una versión cuantizada en FP8 (8 bits en coma flotante, formato E4M3) del modelo instructivo mistralai/Mistral-7B-Instruct-v0.1, publicada por Liodon AI. No es un modelo entrenado desde cero, sino una conversión de pesos comprimidos que reproduce la funcionalidad del original reduciendo el tamaño en disco de 14,5 GB a 7,5 GB, aproximadamente la mitad.

La cuantización se realizó con la librería llm-compressor mediante el esquema FP8_DYNAMIC: los pesos se convierten a FP8 (E4M3) por canal de forma anticipada, mientras que las activaciones se cuantizan dinámicamente por token en tiempo de inferencia. Este esquema no requiere dataset de calibración, por lo que los pesos son una conversión directa de los originales, sin sesgo de calibración.

El modelo hereda la arquitectura del Mistral-7B-Instruct-v0.1 (transformer decoder-only de 7.241.732.096 parámetros con sliding-window attention y grouped-query attention) y está orientado a servir inferencia conversacional de forma más eficiente en GPUs NVIDIA con capacidad de cómputo >= 8.9 (Ada, Hopper y Blackwell).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con sliding-window attention y grouped-query attention (heredada del modelo base) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (heredada del modelo base Mistral-7B-Instruct-v0.1) |
| Tipos de cuantizacion | FP8 (E4M3) en pesos por canal; activaciones dinamicas por token; capa lm_head sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors con formato compressed-tensors |

## Arquitectura y entrenamiento

El modelo base, Mistral-7B-Instruct-v0.1, es un ajuste fino instructivo del modelo generativo Mistral-7B-v0.1 de Mistral AI, realizado sobre una variedad de conjuntos de datos de conversación públicos. Su arquitectura es un transformer decoder-only con sliding-window attention (ventana deslizante) y grouped-query attention, diseñada para acelerar la inferencia. No se dispone de detalles públicos sobre el número exacto de tokens de entrenamiento ni sobre el uso de RLHF o DPO en esta versión.

La publicación de Liodon AI no reentrena el modelo: aplica una cuantización FP8 con llm-compressor bajo el esquema FP8_DYNAMIC. Los pesos se convierten a FP8 (E4M3) por canal antes de la inferencia y las activaciones se cuantizan dinámicamente por token durante la ejecución. La capa lm_head se deja sin cuantizar, práctica habitual porque su tamaño es mínimo y cuantizarla degradaría la calidad de forma desproporcionada.

## Capacidades

- Generación de texto y finalización de secuencias.
- Seguimiento de instrucciones gracias al ajuste instructivo del modelo base.
- Conversación multi-turno y asistencia tipo chat.
- Respuesta a preguntas y resumen de textos.
- Generación de código de forma genérica (capacidad heredada del modelo base, sin entrenamiento específico documentado para esta versión).
- Razonamiento básico y tareas de extracción o clasificación de información.
- Capacidades multilingües limitadas: el modelo base está centrado principalmente en inglés; no se confirma en la información disponible un soporte amplio de otros idiomas.
- Tool calling / function calling: no documentado en esta versión del modelo base.
- Modo thinking, visión o audio: no soportados.

## Casos de uso

- Asistente conversacional con presupuesto de VRAM ajustado: el modelo ocupa 7,5 GB de pesos en FP8, lo que permite desplegar un asistente de 7B con contexto largo en GPUs de gama media-alta, gestionando conversaciones multi-turno dentro de la ventana de 8192 tokens.
- Preguntas y respuestas sobre documentación interna (RAG): combinado con un almacén vectorial, el modelo puede responder consultas sobre manuales o bases de conocimiento internas manteniendo el contexto de los fragmentos recuperados en una sola pasada.
- Generación de código asistida: puede completar funciones y explicar fragmentos en pipelines de desarrollo, aunque sin soporte documentado de tool calling nativo, la integración con herramientas externas requeriría capas adicionales.
- Resumen automático de textos: adecuado para resumir correos, informes o hilos de conversación, con un coste de memoria reducido frente a la versión en FP16/BF16.
- Clasificación y extracción de información: etiquetado de tickets, extracción de entidades o categorización de documentos en lotes, aprovechando la inferencia más rápida en GPUs con soporte FP8.
- Investigación y evaluación de cuantización: sirve como referencia para comparar la degradación de calidad y las ganancias de rendimiento del esquema FP8_DYNAMIC frente al modelo original en FP16/BF16.
- Despliegue eficiente en GPUs Ada, Hopper o Blackwell: en entornos L4, L40S, H100 o RTX 40-series permite aumentar el número de réplicas por GPU al reducir el peso del modelo a la mitad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas (MMLU, HumanEval, GSM8K u otras) para esta versión cuantizada, ni una comparación numérica con el modelo original. Como referencia cualitativa, Mistral AI describe el modelo base Mistral-7B como un modelo que compite con alternativas de 2 a 3 veces su tamaño, pero no se aportan cifras concretas en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos en FP8 ocupan aproximadamente 7,5 GB. Sumando caché KV y activaciones, se recomienda reservar en torno a 10-12 GB para contextos moderados y lotes pequeños (estimación orientativa, no confirmada en la información disponible).
- Ejecución FP8 nativa: requiere GPU NVIDIA con capacidad de cómputo >= 8.9, es decir, arquitecturas Ada (RTX 40-series, L4, L40S), Hopper (H100, H200) y Blackwell (B100, B200, GB10).
- GPUs compatibles: RTX 4090 (24 GB), RTX 4080 (16 GB), L4, L40S, H100, H200, B100, B200, GB10.
- GPUs antiguas: en tarjetas sin soporte FP8, vLLM y TGI dequantizan el modelo para ejecutarlo, perdiendo la ventaja de velocidad y memoria.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 4080 con soporte FP8 nativo.
- Opciones de despliegue: vLLM (`vllm serve`), Text Generation Inference (TGI, imagen de Docker oficial) y SGLang (`python -m sglang.launch_server`).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Precision | Tamano en disco | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| liodon-ai/Mistral-7B-Instruct-v0.1-FP8 | 7.241.732.096 | FP8 (E4M3) | 7,5 GB | 8192 tokens | other | HuggingFace |
| mistralai/Mistral-7B-Instruct-v0.1 | 7.241.732.096 | FP16/BF16 | 14,5 GB | 8192 tokens | Apache 2.0 (segun el modelo base; esta ficha no lo confirma) | HuggingFace |
| liodon-ai/Mistral-7B-v0.1-FP8 | no disponible | FP8 | no disponible | no disponible | other | HuggingFace |

Nota: la comparativa numérica de rendimiento con alternativas cuantizadas (AWQ, GPTQ, GGUF) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Alucinación: como todo modelo de 7B, puede generar información incorrecta o inventada, especialmente en tareas de conocimiento factual.
- Versión antigua: Mistral-7B-Instruct-v0.1 es una versión temprana; carece de mejoras posteriores como tool calling nativo, modos de razonamiento extendido o ventanas de contexto mayores.
- Idiomas: el modelo base está centrado en inglés; el comportamiento en castellano y otros idiomas no está garantizado ni documentado en la información disponible.
- Sesgos: al no disponer de información sobre la composición del dataset de ajuste, no se pueden detallar sesgos conocidos; se deben aplicar las precauciones habituales de evaluación.
- Licencia: figura como "other". Es imprescindible verificar los términos exactos antes de un uso comercial, ya que la licencia del modelo base también se indica como "other" en esta publicación, lo que puede diferir de la licencia Apache 2.0 de Mistral.
- Requisito de hardware: la ventaja de FP8 solo se materializa en GPUs con capacidad de cómputo >= 8.9; en hardware antiguo el modelo se dequantiza y pierde su principal beneficio.
- Adopción: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no cuenta con validación de la comunidad.
- Producción: al ser una cuantización sin calibración, conviene validar la degradación de calidad frente al modelo original en las tareas concretas del caso de uso antes de desplegarlo.

## Enlaces

- https://huggingface.co/liodon-ai/Mistral-7B-Instruct-v0.1-FP8
- https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.1
- https://huggingface.co/liodon-ai/Mistral-7B-v0.1-FP8
- https://github.com/vllm-project/llm-compressor
- https://docs.mistral.ai/models/mistral-7b-0-1
- https://apxml.com/models/mistral-7b-instruct-v0-1
- https://www.modelscope.cn/models/AI-ModelScope/Mistral-7B-Instruct-v0.1/summary
