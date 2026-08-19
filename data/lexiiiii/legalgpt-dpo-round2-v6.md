# Lexiiiii/legalgpt-dpo-round2-v6

## Resumen

LegalGPT-dpo-round2-v6 es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el usuario Lexiiiii, diseñado para especializar el modelo base Qwen/Qwen2.5-7B-Instruct en consultas legales sin recuperación aumentada (RAG). Se enmarca en un proyecto de post-entrenamiento completo (SFT → DPO) denominado LegalGPT, del cual esta versión corresponde a una iteración de ablación (ronda 2, versión 6). El adaptador se distribuye con licencia Apache 2.0 y está pensado para ser cargado mediante la librería PEFT sobre el modelo base de 7.000 millones de parámetros.

La relevancia de este modelo radica en su enfoque de ajuste eficiente: en lugar de entrenar todos los parámetros, solo se modifican las proyecciones q_proj y v_proj de la atención mediante LoRA con rango 32 y alpha 64. Esto permite obtener un asistente legal especializado con un coste computacional reducido y un repositorio de apenas unos pocos megabytes (el tamaño del repo es 0.0 GB, ya que solo contiene los pesos del adaptador). El modelo base Qwen2.5-7B-Instruct ofrece una ventana de contexto de 128.000 tokens, aunque el adaptador no especifica si se ha limitado durante el entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-7B-Instruct (Transformer decoder) |
| Parametros totales | No disponible (el adaptador LoRA tiene ~0.1% de los parámetros del base; el modelo base tiene 7.610 millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredada del modelo base: 128.000 tokens) |
| Tipos de cuantizacion | No disponible (el adaptador se puede combinar con cuantizaciones del modelo base: 4-bit, 8-bit, etc.) |
| Idiomas soportados | No disponible (el modelo base soporta múltiples idiomas, pero el adaptador está entrenado para consultas legales en chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen2.5-7B-Instruct, un modelo de lenguaje de tipo Transformer decoder con atención causal. La técnica de ajuste es LoRA, que congela los pesos originales e introduce matrices de bajo rango en las capas de atención. En concreto, se aplica a las proyecciones de consulta (q_proj) y valor (v_proj) con rango 32 y alpha 64, lo que reduce drásticamente el número de parámetros entrenables. El entrenamiento se realizó con la herramienta LLaMA-Factory, siguiendo un pipeline de dos etapas: primero supervisión fina (SFT) y posteriormente optimización por preferencias (DPO). Esta versión concreta corresponde a la ronda 2, versión 6, descrita por el autor como una "ablación" dentro del proyecto LegalGPT, cuyo objetivo final es la versión round5-v1.

No se proporcionan detalles sobre el volumen de datos de entrenamiento, la composición del corpus legal ni las configuraciones de hiperparámetros más allá de los mencionados. El adaptador está diseñado para responder consultas legales sin necesidad de un sistema RAG externo, lo que implica que el conocimiento legal se encuentra implícito en los pesos ajustados.

## Capacidades

- Generación de respuestas a consultas legales en chino, basadas en el conocimiento adquirido durante el ajuste.
- Especialización en el dominio jurídico sin depender de recuperación externa de documentos.
- Herencia de las capacidades generales del modelo base Qwen2.5-7B-Instruct, como razonamiento, comprensión de instrucciones y generación de texto coherente.
- Soporte de múltiples turnos conversacionales (el modelo base está entrenado con chat), aunque no se ha verificado específicamente para este adaptador.
- No se documentan capacidades explícitas de tool calling, function calling, agentes o razonamiento multi-paso; estas dependerán del modelo base y de cómo se haya integrado el adaptador.

## Casos de uso

- Asistente legal para ciudadanos: el modelo puede responder preguntas frecuentes sobre trámites, derechos básicos o interpretación de normativas generales, ofreciendo una primera orientación sin sustituir el asesoramiento profesional.
- Redacción de documentos legales preliminares: dada su especialización en consultas legales, puede generar borradores de contratos simples, cláusulas estándar o escritos de reclamación, siempre que el usuario revise el contenido con un abogado.
- Soporte interno para despachos de abogados: como herramienta de apoyo para búsqueda de precedentes o resúmenes de jurisprudencia, aunque sin garantía de exactitud y sin citas verificadas.
- Chatbots de atención al cliente en servicios jurídicos online: integrado en un sistema de mensajería, puede resolver dudas iniciales y filtrar casos antes de derivar a un profesional.
- Educación legal: para estudiantes de derecho, puede explicar conceptos básicos, simular casos hipotéticos o generar ejercicios de análisis.
- Análisis de sentencias y documentos legales: el modelo base puede procesar textos largos (hasta 128k tokens), por lo que el adaptador podría utilizarse para resumir o extraer información relevante de documentos legales extensos, aunque esta capacidad no está explícitamente documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de evaluación sobre MMLU, HumanEval, GSM8K u otras pruebas estándar, ni comparaciones con otros modelos legales. El autor no ha proporcionado métricas de rendimiento específicas para este adaptador.

## Requisitos de hardware

- Para cargar el adaptador es necesario tener el modelo base Qwen2.5-7B-Instruct, que requiere aproximadamente 14 GB de VRAM en precisión fp16.
- Con cuantización de 4 bits (por ejemplo, mediante bitsandbytes), la VRAM necesaria se reduce a unos 4-5 GB, lo que permite su ejecución en GPUs de consumo como la RTX 3060 de 12 GB o la RTX 4090.
- El adaptador en sí mismo ocupa menos de 100 MB, por lo que el requisito principal es el modelo base.
- Opciones de despliegue: se puede utilizar con transformers y PEFT para inferencia en Python, o exportar a formatos optimizados como GGUF (cuantizando el modelo base y fusionando el adaptador) para ejecutarlo con llama.cpp u Ollama.
- Para servidores de producción, se recomienda vLLM o TGI, que soportan modelos PEFT y ofrecen mayor throughput, aunque requieren GPU de datacenter (A100, H100) para un rendimiento óptimo con 7B parámetros.
- La latencia estimada en una RTX 4090 con cuantización 4-bit es del orden de 20-40 tokens por segundo, dependiendo de la longitud de la secuencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| legalgpt-dpo-round2-v6 (este) | 7B (base) + LoRA | 128k (base) | Consulta legal sin RAG | Apache 2.0 | HuggingFace (adaptador) |
| Qwen2.5-7B-Instruct (base) | 7.610M | 128k | Chat general | Apache 2.0 | HuggingFace |
| ChatLaw (modelo legal chino) | 13B | 4k | Consulta legal con RAG | No comercial | HuggingFace (proyecto) |
| LawGPT (proyecto similar) | 7B | No disponible | Asistente legal | Apache 2.0 | GitHub |

La comparación directa con otros modelos legales no es posible sin datos de evaluación. Este adaptador se diferencia por su bajo coste de ajuste y su enfoque sin RAG, mientras que alternativas como ChatLaw integran recuperación de documentos externos. El modelo base Qwen2.5-7B-Instruct es el punto de partida, por lo que el rendimiento general en tareas no legales será similar al del base.

## Limitaciones y advertencias

- No se ha publicado ninguna evaluación independiente; el rendimiento real en tareas legales es desconocido y podría presentar alucinaciones o respuestas inexactas.
- El adaptador está entrenado principalmente para el idioma chino; su uso en otros idiomas puede degradar significativamente la calidad.
- No se especifican los datos de entrenamiento ni su procedencia, por lo que existe un riesgo de sesgo hacia ciertas jurisdicciones o fuentes legales.
- La licencia Apache 2.0 del adaptador permite uso comercial, pero el modelo base Qwen2.5-7B-Instruct también está bajo Apache 2.0, por lo que no hay restricciones adicionales. No obstante, el proyecto LegalGPT (GitHub) puede tener sus propias condiciones.
- No se garantiza la validez legal de las respuestas; el modelo no puede sustituir el asesoramiento de un profesional colegiado.
- Al ser un adaptador LoRA, requiere el modelo base para funcionar; no es un modelo autónomo.
- La fecha de creación (2026) sugiere que es un proyecto reciente, con poca adopción (0 descargas y 0 likes en el momento de la consulta).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Lexiiiii/legalgpt-dpo-round2-v6
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Proyecto LegalGPT (GitHub): https://github.com/czc0407/legalGPT
