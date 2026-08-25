# dalatexcoder/LFM2.5-230M-heretic-v1

## Resumen

LFM2.5-230M-heretic-v1 es una versión "desensurada" (decensored) del modelo LFM2.5-230M de Liquid AI, creada por el usuario dalatexcoder mediante la herramienta Heretic v1.4.0. El objetivo es eliminar los mecanismos de rechazo y las restricciones de contenido del modelo original, de modo que responda sin filtros a peticiones que el modelo base normalmente bloquearía. Se trata de un modelo de 230 millones de parámetros con arquitectura híbrida (convoluciones y atención GQA), diseñado para despliegue en dispositivos con recursos limitados (edge). Su relevancia radica en ofrecer una alternativa ligera y sin censura para tareas de generación de texto, extracción de datos y agentes con tool calling, aunque con riesgos asociados a la falta de moderación.

El modelo se basa en el checkpoint pre-entrenado LiquidAI/LFM2.5-230M-Base y aplica una técnica de abliteration que modifica los pesos de las capas de atención y MLP para anular la dirección de rechazo aprendida durante el entrenamiento. Según la model card, la divergencia KL respecto al modelo original es de 0.1743 y la tasa de rechazos cae de 97/100 a 9/100. El contexto se mantiene en 32.768 tokens y soporta diez idiomas. No se recomienda para tareas de razonamiento complejo, matemáticas avanzadas o generación de código extenso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 8 bloques de convolución de doble compuerta + 6 bloques GQA (grouped query attention) |
| Parametros totales | 229.693.184 (230M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | safetensors (original); GGUF disponible por terceros (mradermacher) |
| Idiomas soportados | Inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español |
| Licencia | lfm1.0 (licencia de Liquid AI, marcada como "other" en Hugging Face) |
| Formato de pesos | safetensors (y GGUF por terceros) |

## Arquitectura y entrenamiento

La arquitectura de LFM2.5-230M combina bloques de convolución con doble compuerta (double-gated convolution) y bloques de atención con consultas agrupadas (GQA). Esta mezcla busca un equilibrio entre eficiencia computacional y capacidad de modelado secuencial, optimizada para inferencia en dispositivos de bajo consumo. El modelo base fue pre-entrenado con 19 billones de tokens y posteriormente refinado con aprendizaje por refuerzo multi-etapa, según la documentación de Liquid AI. El checkpoint heretic se obtiene a partir del modelo base (no del instruct) mediante abliteration, una técnica que identifica y elimina la dirección en el espacio de activaciones responsable de los rechazos. Los parámetros de abliteration se aplican por capa, ajustando los pesos de `attn.o_proj` y `mlp.down_proj` con valores máximos y mínimos específicos. No se han publicado detalles adicionales sobre el proceso de entrenamiento o los datos utilizados para esta variante.

## Capacidades

- Generación de texto en diez idiomas, con especial énfasis en inglés y español.
- Soporte de tool calling / function calling mediante un formato Pythonic entre tokens especiales (`<|tool_call_start|>` y `<|tool_call_end|>`), con posibilidad de configurar salida JSON.
- Adecuado para pipelines de agentes ligeros en dispositivos edge, como extracción de datos y automatización de tareas simples.
- Capacidad de seguir instrucciones conversacionales mediante plantilla ChatML.
- Sin restricciones de contenido (decensored), lo que permite respuestas a peticiones que el modelo original rechazaría.
- No recomendado para razonamiento avanzado, matemáticas complejas, generación de código extenso o escritura creativa, según la documentación oficial.

## Casos de uso

- Extracción de datos en dispositivos móviles o embebidos: el modelo puede procesar documentos o mensajes y extraer entidades, fechas o valores estructurados, aprovechando su contexto de 32K tokens y su bajo consumo de memoria.
- Agentes de automatización ligera: integrado en un sistema de tool calling, puede decidir qué función invocar (por ejemplo, consultar una API o actualizar un registro) y ejecutar la llamada, ideal para asistentes personales en el teléfono.
- Chatbot sin moderación para entornos controlados: útil en investigación o pruebas donde se requiere explorar respuestas sin filtros, siempre bajo supervisión humana.
- Prototipado rápido de aplicaciones de lenguaje: su pequeño tamaño permite iterar rápidamente en entornos de desarrollo sin necesidad de GPUs potentes.
- Asistente multilingüe de bajo coste: puede desplegarse en una Raspberry Pi o un router para ofrecer respuestas en varios idiomas en entornos sin conexión.
- Generación de contenido creativo sin restricciones: aunque no es su punto fuerte, puede usarse para redactar textos con temáticas que otros modelos censurarían, con la advertencia de posibles incoherencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para esta versión heretic. La model card únicamente reporta métricas de abliteration:

| Metrica | Modelo heretic | Modelo original (LFM2.5-230M) |
|---|---|---|
| Divergencia KL | 0.1743 | 0 (por definición) |
| Rechazos (refusals) | 9/100 | 97/100 |

El modelo original LFM2.5-230M tiene benchmarks publicados en el blog de Liquid AI, pero no se dispone de los valores numéricos en la información proporcionada. Por tanto, no se pueden comparar directamente con otros modelos.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en FP32 (230M parámetros ≈ 0,9 GB). Con cuantización GGUF (por ejemplo, Q4_K_M) puede reducirse a ~150-200 MB.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 2060, etc.). También funciona en CPU.
- Cabe en dispositivos edge: según Liquid AI, alcanza 213 tok/s en un Galaxy S25 Ultra y 42 tok/s en una Raspberry Pi 5.
- Opciones de despliegue: Transformers (Hugging Face), vLLM, SGLang, llama.cpp (mediante GGUF), ONNX Runtime, MLX para Apple Silicon.
- Latencia y throughput: no se han publicado mediciones específicas para esta variante, pero se espera que sea similar al modelo original, con decodificación rápida en hardware modesto.

## Comparativa con modelos similares

No se dispone de comparativas directas publicadas para esta variante heretic. Como referencia, se puede comparar con el modelo original y con otros modelos pequeños de la misma categoría:

| Modelo | Parametros | Contexto | Licencia | Censura | Notas |
|---|---|---|---|---|---|
| LFM2.5-230M-heretic-v1 | 230M | 32K | lfm1.0 | Sin censura | Derivado de LFM2.5-230M-Base |
| LiquidAI/LFM2.5-230M | 230M | 32K | lfm1.0 | Con censura | Modelo instruct original |
| Qwen2.5-0.5B | 500M | 32K | Apache 2.0 | Con censura | Alternativa de tamaño similar, pero con más parámetros |
| SmolLM2-360M | 360M | 2K | Apache 2.0 | Con censura | Enfocado a dispositivos, contexto menor |

No hay datos de rendimiento comparativo en tareas estándar para esta variante, por lo que la comparación se limita a características generales.

## Limitaciones y advertencias

- Modelo de 230M de parámetros: su capacidad de razonamiento es limitada; no es adecuado para tareas que requieran lógica compleja, matemáticas avanzadas o generación de código extenso.
- Riesgo de alucinaciones: al ser un modelo pequeño, puede inventar información con alta confianza, especialmente en dominios especializados.
- Contenido sin censura: al eliminar los rechazos, el modelo puede generar respuestas ofensivas, peligrosas o ilegales. Su uso debe restringirse a entornos controlados y con supervisión humana.
- Degradación potencial: la abliteration introduce una divergencia KL de 0.17 respecto al original, lo que puede afectar a la coherencia y calidad de las respuestas en algunos casos.
- Licencia lfm1.0: es una licencia específica de Liquid AI; es necesario revisar sus términos para uso comercial y redistribución, ya que puede imponer restricciones.
- Idiomas: aunque soporta diez idiomas, el rendimiento puede ser desigual; el inglés y el español probablemente tengan mejor cobertura que otros.
- Sin garantías de seguridad: no se han realizado evaluaciones de sesgos o toxicidad para esta variante; el proceso de decensoring puede amplificar sesgos existentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dalatexcoder/LFM2.5-230M-heretic-v1
- Modelo original LFM2.5-230M: https://huggingface.co/LiquidAI/LFM2.5-230M
- Modelo base LFM2.5-230M-Base: https://huggingface.co/LiquidAI/LFM2.5-230M-Base
- Cuantización GGUF por terceros: https://huggingface.co/mradermacher/LFM2.5-230M-heretic-GGUF
- Blog de Liquid AI sobre LFM2.5-230M: https://www.liquid.ai/blog/lfm2-5-230m
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/models/lfm25-230m
- Proyecto Heretic: https://heretic-project.org
