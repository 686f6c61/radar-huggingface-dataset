# BernardoDev07/qwen2.5-1.5b-ifood-intent-ptbr

## Resumen

El modelo `BernardoDev07/qwen2.5-1.5b-ifood-intent-ptbr` es un ajuste fino (fine-tuning) publicado en HuggingFace por el usuario BernardoDev07. Por el identificador se deduce que parte de la base Qwen2.5-1.5B, el modelo denso de 1.500 millones de parámetros de la familia Qwen2.5 de Alibaba, y que está orientado a la clasificación de intenciones (intent detection) en el dominio de iFood, la plataforma brasileña de reparto de comida, con foco en portugués de Brasil (pt-BR).

El problema que aborda es acotado: reconocer la intención del usuario en conversaciones o consultas dentro de un asistente de pedidos de comida. Es un caso típico de NLP aplicado a atención al cliente, donde un modelo pequeño y especializado puede sustituir a un LLM grande en una tarea de clasificación con etiquetas cerradas, reduciendo coste y latencia.

La información publicada es mínima: la model card está generada automáticamente y no contiene detalles de entrenamiento, datos, licencia ni evaluación. El repositorio figura con 0 GB, 0 descargas y 0 likes en el momento de la consulta, por lo que debe tratarse como un artefacto experimental o de portafolio más que como un modelo listo para producción. Todos los datos no confirmados se marcan como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B; no confirmado en la model card) |
| Parámetros totales | 1.500 millones (deducido del nombre; no confirmado) |
| Parámetros activos | no disponible (no es MoE según el identificador) |
| Longitud de contexto | no disponible (Qwen2.5-1.5B base soporta hasta 32.768 tokens; no confirmado para este fine-tuning) |
| Tipos de cuantización | no disponible (formato publicado: safetensors en precisión nativa; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible (el sufijo "ptbr" sugiere portugués de Brasil; no confirmado) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura en la model card. Por el identificador y la librería declarada (`transformers`), se infiere que se trata de un fine-tuning del checkpoint Qwen2.5-1.5B, un transformer decoder-only denso con atención por causalidad, RMSNorm y RoPE, típico de la familia Qwen2.5. El tag `arxiv:1910.09700` presente en el repositorio corresponde al artículo de Lacoste et al. sobre estimación de emisiones de carbono (ML Impact Calculator) y aparece en la plantilla por defecto de la model card; no es una referencia al paper del modelo.

No se dispone de datos sobre el conjunto de entrenamiento, el número de tokens, la composición del dataset, si hubo instrucción supervisada (SFT), RLHF o DPO, ni sobre hiperparámetros. La model card conserva todos los campos de la plantilla con "[More Information Needed]". Tampoco se documenta ninguna innovación técnica (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Clasificación de intenciones en el dominio de pedidos de comida (iFood), presumiblemente con un conjunto cerrado de etiquetas; el detalle de las etiquetas no está publicado.
- Generación de texto condicionada por el prompt, heredada del modelo base Qwen2.5-1.5B, aunque el fine-tuning puede haber degradado esta capacidad general en favor de la tarea específica.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: presumiblemente portugués de Brasil; el resto de idiomas no está confirmado.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Enrutamiento de consultas en un asistente de pedidos: clasificar el mensaje del usuario en categorías como "estado del pedido", "cancelación", "problema con el reparto" o "consulta de menú", para derivarlo al flujo o al agente adecuado.
- Triaje en atención al cliente: etiquetar tickets entrantes en portugués de Brasil antes de pasarlos a un humano o a un sistema de respuesta automática, reduciendo el tiempo de primera respuesta.
- Análisis de conversaciones post-hoc: procesar logs de chat para medir la distribución de intenciones y detectar fricciones en el embudo de pedido.
- Clasificación en el borde (edge) o en CPU: al ser un modelo de 1.500 millones de parámetros, puede ejecutarse en hardware modesto si se cuantiza, lo que permite desplegarlo cerca del usuario en entornos con latencia estricta.
- Filtrado previo a un LLM mayor: usar este modelo como primera etapa para decidir si una consulta requiere un modelo grande o puede resolverse con respuestas plantilla.
- Prototipado rápido de asistentes conversacionales en el sector food delivery: servir como punto de partida para equipos que quieran adaptar un modelo pequeño a su propio catálogo de intenciones.
- Investigación sobre fine-tuning de modelos pequeños en dominios verticales: útil como caso de estudio de especialización de Qwen2.5-1.5B en una tarea de clasificación concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, unos 4-6 GB para secuencias cortas.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,5-2 GB de pesos.
- VRAM estimada en cuantización de 4 bits (si se genera una versión GGUF/AWQ, no publicada): alrededor de 1 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para FP16 (RTX 3060, RTX 4060, RTX 4090, A10, L4); para despliegue en servidor, A100 o H100 no son necesarias por tamaño, pero sí útiles para alto throughput por batched inference.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 en FP16; también en GPUs de 8 GB con cuantización.
- Opciones de despliegue: transformers (nativo), vLLM y TGI para serving con batching, llama.cpp/Ollama solo si se generan pesos GGUF (no publicados). El tag `endpoints_compatible` sugiere compatibilidad con los endpoints de HuggingFace Inference.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BernardoDev07/qwen2.5-1.5b-ifood-intent-ptbr | 1.500 M (deducido) | no disponible | Clasificación de intenciones iFood (pt-BR) | no disponible | HuggingFace, 0 descargas |
| Qwen/Qwen2.5-1.5B | 1.500 M | 32.768 tokens | Propósito general, multilingüe | Apache 2.0 | HuggingFace, ampliamente usado |
| Qwen/Qwen2.5-1.5B-Instruct | 1.500 M | 32.768 tokens | Instrucciones y chat | Apache 2.0 | HuggingFace, ampliamente usado |
| Modelos de clasificación de intenciones pt-BR (p. ej. BERTimbau base) | ~110 M | 512 tokens | Clasificación de texto en portugués | MIT / varias | HuggingFace |

La comparación con BERTimbau es orientativa: para una tarea de clasificación de intenciones con etiquetas cerradas, un encoder pequeño como BERTimbau puede ser más eficiente que un decoder de 1.500 M, aunque este último ofrece mayor flexibilidad si la tarea requiere generación. No se dispone de métricas de rendimiento del modelo evaluado para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- La model card está generada automáticamente y no documenta datos de entrenamiento, evaluación ni hiperparámetros; no es posible verificar la calidad del fine-tuning.
- Licencia no especificada: no se puede asumir uso comercial permitido. Aunque el modelo base Qwen2.5-1.5B es Apache 2.0, el fine-tuning no declara licencia, lo que introduce incertidumbre legal.
- El repositorio figura con 0 GB y 0 descargas; es posible que los pesos no estén efectivamente subidos o que el artefacto esté incompleto. Conviene verificar los archivos antes de usarlo.
- Riesgo de alucinación y de deriva fuera de dominio: al ser un fine-tuning especializado, puede producir salidas incoherentes ante entradas fuera del dominio de iFood.
- Sesgos: no documentados; al entrenarse presumiblemente con datos de una sola plataforma y en portugués de Brasil, puede no generalizar a otras variantes del portugués ni a otros dominios de food delivery.
- Limitaciones de contexto e idioma: no confirmadas; el uso previsto parece restringido a pt-BR y a consultas cortas.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su precisión en la tarea de clasificación de intenciones.
- Para producción, se recomienda validar con un conjunto de test propio y considerar el modelo base Qwen2.5-1.5B-Instruct o un encoder pt-BR como alternativas con licencia y documentación claras.

## Enlaces

- HuggingFace: https://huggingface.co/BernardoDev07/qwen2.5-1.5b-ifood-intent-ptbr
- Modelo base presumible: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Variante instruct del base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Referencia citada en la plantilla (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de carbono (ML CO2 Impact): https://mlco2.github.io/impact
