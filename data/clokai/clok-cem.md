# clokai/CLOK-CEM

## Resumen

ClokCEM (Customer Executive Model) es un modelo de lenguaje decoder-only de 403 millones de parámetros desarrollado por Clok AI, una organización especializada en arquitecturas transformer para aplicaciones empresariales. Está diseñado específicamente para flujos de trabajo de atención al cliente, integrando de forma nativa clasificación de intenciones (27 categorías), razonamiento multi-turno y autoevaluación de calidad de respuesta en una única pasada hacia delante. A diferencia de los chatbots generalistas ajustados para soporte, ClokCEM se preentrenó desde inicialización aleatoria sobre 21 conjuntos de datos curados de soporte al cliente, lo que le permite aprender patrones de interacción propios del dominio sin depender de ajustes posteriores.

El modelo emplea una arquitectura transformer con Grouped Query Attention (GQA), SwiGLU, RMSNorm y RoPE, con una ventana de contexto de 1024 tokens. Su principal innovación es un "thinking head" que procesa los estados ocultos intermedios (capa 12) para generar simultáneamente un escalar de pasos de razonamiento, una puntuación de calidad (0-1) y logits de intención sobre 27 clases, todo ello en paralelo con la cabeza de modelado de lenguaje. Con una licencia Apache 2.0 y pesos en safetensors, está disponible para uso comercial y académico, aunque su contexto limitado y su enfoque monolingüe (inglés) condicionan sus aplicaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA, SwiGLU, RMSNorm, RoPE |
| Parametros totales | 403.011.869 (según safetensors; la model card indica 353.859.869) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | No especificado (pesos en FP16) |
| Idiomas soportados | Inglés (aunque los tags mencionan "indian-languages", el README declara solo "en") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ClokCEM es un transformer causal de 16 capas con hidden size de 1.536, 16 cabezas de atención y 4 cabezas KV (GQA), con dimensión de cabeza de 96 y tamaño intermedio de 2.816. Usa SwiGLU como activación, RMSNorm para normalización, RoPE para codificación posicional y weight tying entre embeddings y la cabeza de salida. El vocabulario es de 32.000 tokens. El modelo se entrenó desde cero (random initialization) durante 50.000 pasos con un batch efectivo de 64 (32 por GPU con DDP), en FP16 con gradient scaling y gradient checkpointing. El optimizador fue AdamW (β₁=0.9, β₂=0.95, ε=1e-8) con learning rate de 3e-4 decayendo a 1e-5 mediante cosine decay con warmup, weight decay de 0.1, label smoothing de 0.05 y clipping de gradiente a norma 1.0. El entrenamiento se realizó en una NVIDIA T4 durante aproximadamente 3 semanas.

La innovación principal es el "thinking head", un módulo que toma los estados ocultos de la capa 12 y produce tres salidas auxiliares: un escalar de pasos de razonamiento, una puntuación de calidad (0-1) y logits de intención sobre 27 categorías de soporte al cliente. Estas salidas se calculan en paralelo con la cabeza de lenguaje, añadiendo una sobrecarga mínima. El modelo alcanzó una loss final de 1.74 (mejor loss 0.765) y una precisión de intención del 99.88% al final del entrenamiento. Los datos de entrenamiento provienen de 21 conjuntos de datos curados que cubren dominios como pedidos, devoluciones, facturación, telecomunicaciones, banca, salud y seguros, entre otros.

## Capacidades

- Generación de texto para respuestas de atención al cliente en conversaciones multi-turno.
- Clasificación nativa de intenciones en 27 categorías (por ejemplo, `order_status`, `refund_status`, `technical_support`, `billing_query`, `escalation`, etc.) en una sola pasada hacia delante, sin necesidad de clasificadores externos ni plantillas de prompt.
- Razonamiento encadenado (chain-of-thought) emergente del entrenamiento, no inducido por ingeniería de prompts.
- Autoevaluación de calidad de respuesta mediante una puntuación (0-1) generada por el thinking head.
- Estimación del número de pasos de razonamiento necesarios para cada consulta (thinking steps).
- Soporte de conversaciones con contexto de hasta 1.024 tokens.
- Capacidad multilingüe limitada: aunque el README declara solo inglés, los tags sugieren posible soporte de lenguas indias, pero no hay evidencia en la documentación.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno de soporte, clasificando la intención del usuario (por ejemplo, reembolso, estado de pedido, problema técnico) y generando respuestas coherentes. Su ventana de 1.024 tokens permite manejar intercambios breves típicos de chat en vivo.
- Clasificación de tickets de soporte: gracias a su cabeza de intención integrada, puede etiquetar automáticamente los tickets entrantes en 27 categorías, facilitando el enrutamiento a los equipos adecuados sin necesidad de un modelo de clasificación separado.
- Asistente de autoservicio para comercio electrónico: puede responder consultas sobre pedidos, devoluciones, reembolsos, información de producto y precios, reduciendo la carga de los agentes humanos.
- Soporte técnico de primer nivel: para problemas comunes como "la aplicación falla" o "mi internet no funciona", el modelo puede ofrecer pasos de resolución básicos y escalar a un agente humano si la puntuación de calidad es baja.
- Gestión de cuentas y facturación: puede ayudar con restablecimiento de contraseñas, consultas de facturación, cancelaciones de suscripción y problemas de pago, siempre que el contexto no exceda 1.024 tokens.
- Evaluación de calidad de respuestas generadas: el thinking head produce una puntuación de calidad que puede usarse como gate en pipelines de producción para decidir si una respuesta generada es lo suficientemente buena para enviarse al cliente o si debe revisarse manualmente.
- Formación de agentes humanos: el modelo puede simular interacciones de clientes con diferentes intenciones para entrenar a nuevos agentes de soporte, gracias a su capacidad de clasificar y generar respuestas realistas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta métricas de entrenamiento: loss final de 1.74 (mejor 0.765) y precisión de intención del 99.88% sobre los datos de entrenamiento. No hay datos de evaluación en conjuntos de validación externos ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1.6 GB según LLM Explorer, lo que lo hace ejecutable en GPUs consumer de gama baja.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 2060, o incluso integradas modernas. Para despliegue en producción, una T4 o A10 es suficiente.
- Cabe en GPUs consumer: sí, es un modelo pequeño (403M parámetros) que puede ejecutarse en tarjetas de 4 GB o menos.
- Opciones de despliegue: compatible con transformers (pipeline text-generation), vLLM, llama.cpp, Ollama y TGI, aunque no se especifican configuraciones oficiales. Dado su tamaño, también puede ejecutarse en CPU con cuantización (aunque no se documentan cuantizaciones).
- Latencia y throughput: no se proporcionan datos oficiales. En una T4, se espera una latencia de decenas de milisegundos por token, y en CPU puede ser de cientos de milisegundos.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo con otros modelos de tamaño similar (por ejemplo, TinyLlama 1.1B, Phi-2 2.7B, GPT-2 1.5B) en tareas de atención al cliente. La información disponible no incluye benchmarks estandarizados que permitan una comparación objetiva. Se puede afirmar que ClokCEM es significativamente más pequeño que esos modelos (403M vs 1.1B+), lo que reduce sus requisitos de hardware, pero también limita su capacidad general de lenguaje. No hay datos públicos de comparación.

## Limitaciones y advertencias

- Contexto limitado a 1.024 tokens, lo que impide manejar conversaciones largas o documentos extensos.
- Entrenado exclusivamente en inglés (según el README), aunque los tags mencionan lenguas indias sin evidencia documentada.
- Especializado en atención al cliente; su rendimiento en tareas generales de lenguaje (escritura creativa, razonamiento complejo, código) probablemente sea pobre.
- Riesgo de alucinación en respuestas generativas, especialmente en consultas fuera de los dominios de entrenamiento.
- La clasificación de intenciones está limitada a 27 categorías predefinidas; intenciones novedosas o ambiguas pueden clasificarse incorrectamente.
- La puntuación de calidad del thinking head es una autoevaluación del modelo, no una garantía de corrección factual.
- No se han publicado evaluaciones de sesgos o comportamientos dañinos; al ser un modelo entrenado en datos de soporte, podría reflejar sesgos presentes en esos datos.
- La discrepancia entre el número de parámetros reportado en safetensors (403M) y el de la model card (353M) sugiere que puede haber pesos adicionales (posiblemente del thinking head) no contabilizados en la descripción.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y sin documentación de seguridad.

## Enlaces

- HuggingFace: https://huggingface.co/clokai/CLOK-CEM
- Perfil de la organización: https://huggingface.co/clokai
- LLM Explorer (ficha con VRAM y contexto): https://llm-explorer.com/model/clokai%2FCLOK-CEM,3Z7p3AwXLaFVo3kVCn3dCm
- GitHub de la organización: https://github.com/clokai/clokai
- Repositorios de ClokAI: https://github.com/orgs/clokai/repositories
