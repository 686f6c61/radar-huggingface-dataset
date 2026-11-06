# evamxb/aiss-modern-bert-combined

## Resumen

aiss-modern-bert-combined es un modelo de clasificación de texto obtenido mediante ajuste fino (fine-tuning) de ModernBERT-base, el encoder transformer desarrollado por Answer.AI y LightOn. Lo publica el usuario evamxb en Hugging Face y está pensado para tareas de clasificación supervisada, no para generación de texto. El modelo conserva la arquitectura ModernBERT, un transformer encoder con atención de secuencias largas (hasta 8192 tokens), RoPE, GeGLU y alternancia de capas de atención global y local, pero adaptada a una cabeza de clasificación.

El modelo tiene 149.606.402 parámetros totales, lo que lo sitúa en la categoría de encoders base de tamaño medio (aproximadamente 150 M), y un repositorio de 3,0 GB. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Su relevancia radica en que ofrece una base ModernBERT ya afinada para clasificación, con soporte para text-embeddings-inference y endpoints compatibles, lo que facilita su despliegue en pipelines de inferencia de baja latencia.

No obstante, la información publicada por el autor es mínima: la model card es la generada automáticamente por el Trainer de Hugging Face y no especifica el dataset de entrenamiento, las etiquetas de clasificación ni los resultados de evaluación. Esto limita la evaluación rigurosa del modelo y obliga a tratar sus capacidades como no verificadas hasta que se realice una validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-base), con cabeza de clasificación de texto |
| Parametros totales | 149.606.402 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (ModernBERT-base soporta hasta 8192 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en ModernBERT-base, un encoder transformer que incorpora mejoras sobre BERT clásico: codificaciones posicionales rotatorias (RoPE), activación GeGLU, normalización previa y alternancia de capas de atención global y local para manejar secuencias largas de forma eficiente. Sobre esta base se ha añadido una cabeza de clasificación (probablemente una capa lineal sobre el token [CLS] o pooling equivalente), lo que convierte al modelo en un clasificador de secuencias.

El entrenamiento se realizó con el Trainer de Hugging Face con los siguientes hiperparámetros: learning rate 3e-05, batch size de entrenamiento y evaluación de 8, seed 12, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con warmup ratio 0,1 y una sola época. Las versiones de framework son Transformers 4.57.6, PyTorch 2.13.0+cu130, Datasets 4.8.5 y Tokenizers 0.22.2. No se especifica el dataset de entrenamiento, el número de tokens, la composición de los datos ni si hubo técnicas de alineación como RLHF o DPO (no aplicables en un encoder de clasificación). Tampoco se documenta ninguna innovación técnica adicional más allá de las propias de ModernBERT.

## Capacidades

- Clasificación de texto: el modelo está diseñado para asignar una etiqueta a una secuencia de texto, aunque no se documentan las etiquetas concretas ni el número de clases.
- Codificación de representaciones: al derivar de ModernBERT, puede producir embeddings contextuales útiles para tareas downstream, aunque no se ha validado como modelo de embeddings.
- Soporte de secuencias largas: hereda la capacidad de ModernBERT para procesar contextos extensos, si bien no se confirma el límite exacto en esta ficha.
- Tool calling / function calling: no disponible; no es una capacidad propia de un encoder de clasificación.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible; no se especifican los idiomas de entrenamiento.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Moderación de contenido: el modelo puede clasificar textos de entrada (comentarios, publicaciones) en categorías de toxicidad o spam, aprovechando su arquitectura encoder para inferencia rápida en producción.
- Análisis de sentimiento en reseñas: se puede afinar o utilizar directamente para etiquetar opiniones de clientes como positivas, negativas o neutras, integrándolo en un pipeline de procesamiento por lotes.
- Enrutamiento de tickets de soporte: clasificar automáticamente consultas entrantes por departamento o prioridad, reduciendo la carga manual en sistemas de helpdesk.
- Detección de intenciones en asistentes conversacionales: etiquetar la intención del usuario en cada turno para dirigir la conversación a la acción adecuada, con latencia baja gracias al tamaño compacto del modelo.
- Clasificación de documentos largos: si se confirma el contexto de 8192 tokens de ModernBERT, puede procesar contratos, informes o artículos completos sin truncamiento agresivo.
- Filtrado de datos para pipelines de entrenamiento: clasificar pares pregunta-respuesta o fragmentos de texto para descartar contenido de baja calidad antes de alimentar un LLM.
- Análisis de feedback de producto: etiquetar encuestas abiertas y comentarios de usuarios por temática para generar informes agregados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index del autor contiene una entrada vacía (`results: []`), por lo que no hay métricas de evaluación declaradas.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~150 M de parámetros, en fp32 requiere aproximadamente 0,6 GB de VRAM; en fp16 alrededor de 0,3 GB; en int8 aproximadamente 0,15 GB. Estas cifras son estimaciones basadas en el número de parámetros y no están confirmadas por el autor.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior puede ejecutar el modelo con holgura. Para despliegues de alto throughput, una A10G, L4 o A100 ofrecen mayor paralelismo.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU para inferencia por lotes moderados.
- Opciones de despliegue: transformers (PyTorch), text-embeddings-inference (soportado según los tags), endpoints compatibles de Hugging Face. No se confirma soporte de llama.cpp, Ollama, vLLM o TGI para este modelo concreto.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| evamxb/aiss-modern-bert-combined | 149,6 M | No disponible | Apache 2.0 | Hugging Face |
| answerdotai/ModernBERT-base | ~149 M | 8192 tokens (según documentación del modelo base) | Apache 2.0 | Hugging Face |
| google-bert/bert-base-uncased | ~110 M | 512 tokens | Apache 2.0 | Hugging Face |
| distilbert/distilbert-base-uncased | ~66 M | 512 tokens | Apache 2.0 | Hugging Face |

La comparativa se limita a parámetros, contexto y licencia, ya que no hay datos de rendimiento publicados para este modelo. ModernBERT-base ofrece un contexto mucho mayor que BERT-base y DistilBERT, lo que puede ser ventajoso en clasificación de documentos largos, pero el ajuste fino de evamxb no documenta mejoras medibles.

## Limitaciones y advertencias

- Model card incompleta: no se especifica el dataset de entrenamiento, las etiquetas de clasificación ni el número de clases, lo que impide conocer qué tarea concreta resuelve el modelo.
- Sin métricas de evaluación: no hay resultados de benchmarks ni de validación, por lo que no se puede verificar su rendimiento.
- Riesgo de sesgos y alucinación: al ser un clasificador, el riesgo de alucinación es bajo, pero puede heredar sesgos del dataset de entrenamiento no documentado.
- Idiomas no confirmados: no se indica qué idiomas soporta, lo que limita su uso en entornos multilingües sin validación previa.
- Licencia Apache 2.0: permite uso comercial, pero al no documentarse el origen de los datos de entrenamiento, el usuario debe asumir la responsabilidad de validar el cumplimiento normativo en su dominio.
- Contexto no confirmado: aunque ModernBERT-base soporta 8192 tokens, no se verifica que este fine-tuning conserve esa capacidad ni que el tokenizador esté configurado para ello.
- Repositorio de 3,0 GB: el tamaño del repo es desproporcionado para 150 M de parámetros, lo que sugiere la presencia de checkpoints intermedios u otros artefactos; conviene revisar los archivos antes de descargar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/evamxb/aiss-modern-bert-combined
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Paper de ModernBERT (referencia del modelo base): no disponible en la informacion proporcionada
- Repositorio de ModernBERT: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
