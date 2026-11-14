# bambocher/LFM3-1.7B-heretic

## Resumen

LFM3-1.7B-heretic es una versión "descensurada" (decensored/abliterated) del modelo LFM3-1.7B desarrollado por Liquid AI, publicada por el usuario bambocher mediante la herramienta Heretic v2.1.0. El modelo base pertenece a la familia LFM3 de Liquid AI, una nueva generación construida sobre una arquitectura tri-híbrida y orientada a agentes locales y aplicaciones especializadas en el edge. Con 1.728.801.536 parámetros, el modelo está pensado para ejecutarse en dispositivos de consumo, ocupando aproximadamente 1 GB de memoria a precisión de 4 bits.

El propósito de esta variante concreta es eliminar el comportamiento de rechazo (refusals) del modelo original mediante una técnica de ablación de rango arbitrario (Arbitrary-Rank Ablation, ARA) aplicada sobre las capas 5 a 23. Según la model card, el modelo original rechazaba 93 de cada 100 peticiones en una batería de prueba, mientras que esta versión presenta 0 rechazos sobre 100, con una divergencia KL de 0,7091 respecto al original. Esto lo hace relevante para investigadores que estudian alineación, robustez de salvaguardas y comportamiento de modelos sin censura.

El modelo conserva las capacidades del LFM3-1.7B original: contexto de 256K tokens, entrenamiento orientado a agentes (Hermes Agent, Pi, OpenClaw) y soporte para 17 idiomas, incluido el español. La licencia es lfm1.0 (etiquetada como "other"), lo que impone restricciones que conviene revisar antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tri-híbrida (familia LFM3), con código personalizado (`custom_code`) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | no disponible (la model card menciona uso a 4 bits, ~1 GB de memoria) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (etiquetada como "other") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B emplea una arquitectura que Liquid AI describe como "tri-híbrida", una evolución de las arquitecturas híbridas de la familia LFM que combina distintos mecanismos de atención y estado para optimizar el coste computacional en contextos largos. El checkpoint es un modelo de lenguaje solo texto, post-entrenado para su uso en entornos agénticos como Hermes Agent, Pi y OpenClaw, con una ventana de contexto de 256K tokens. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

La modificación respecto al original consiste en una ablación de rango arbitrario (ARA) ejecutada con Heretic v2.1.0 sobre las capas 5 a 23 (índices `start_layer_index` = 5 y `end_layer_index` = 23), con los pesos `preserve_good_behavior_weight` = 0,9461, `steer_bad_behavior_weight` = 0,0089, `overcorrect_relative_weight` = 0,0330 y `neighbor_count` = 2. El proceso es reproducible: el repositorio incluye un directorio `reproduce` con instrucciones. El resultado es una eliminación casi total de los rechazos a costa de una divergencia KL de 0,7091 frente al modelo original, lo que implica un cambio de distribución no trivial en las respuestas.

## Capacidades

- Generación de texto conversacional en 17 idiomas, incluido el español.
- Entrenamiento orientado a agentes: soporte para harnesses como Hermes Agent, Pi y OpenClaw.
- Ventana de contexto de 256K tokens, adecuada para conversaciones multi-turno largas y documentos extensos.
- Modelo solo texto (sin visión ni audio en esta variante).
- Comportamiento sin rechazos: no aplica salvaguardas de contenido en la práctica (0/100 refusals según la model card).
- Capacidad de especialización mediante fine-tuning en una sola GPU, según indica Liquid AI para el modelo base.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.

## Casos de uso

- Investigación sobre alineación y salvaguardas: permite estudiar cómo se comporta un modelo sin mecanismos de rechazo y comparar su distribución de salidas con el original (KL de 0,7091), útil para auditar técnicas de ablación.
- Despliegue en dispositivos edge: con ~1 GB a 4 bits, puede ejecutarse en portátiles y teléfonos para asistentes locales de texto sin depender de la nube.
- Procesamiento de documentos largos: sus 256K tokens de contexto permiten resumir o analizar contratos, informes o transcripciones extensas en una sola pasada.
- Agentes locales automatizados: el post-entrenamiento para harnesses agénticos lo hace adecuado para flujos multi-paso en entornos de escritorio o domóticos.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o material editorial donde el modelo original rechazaría ciertas temáticas.
- Experimentación con fine-tuning especializado: al ser un modelo pequeño, permite adaptarlo a dominios concretos (jerga técnica, formatos de salida) con una sola GPU.
- Evaluación comparativa de robustez: útil como referencia en estudios sobre degradación de capacidades tras ablación (razonamiento, coherencia, seguridad).

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (LiquidAI/LFM3-1.7B) |
|---|---|---|
| Rechazos (refusals) | 0/100 | 93/100 |
| Divergencia KL | 0,7091 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1 GB a 4 bits según la model card; en FP16 rondaría los 3,5 GB (tamaño del repo: 3,5 GB).
- GPU recomendadas: cualquier GPU de consumo moderna sirve para cuantización 4 bits; para FP16 se recomienda al menos 8 GB de VRAM (RTX 3060/4060 o superior). Para despliegues de mayor throughput, A100 o H100.
- Cabe en GPU de consumo: sí, en tarjetas con 6-8 GB o más en cuantización baja; también en CPU y dispositivos móviles según Liquid AI.
- Opciones de despliegue: transformers (librería indicada, con `custom_code`), además de las opciones habituales del ecosistema (llama.cpp, Ollama, vLLM, TGI) siempre que exista soporte para la arquitectura tri-híbrida; la información disponible no confirma compatibilidad con cada una.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LFM3-1.7B-heretic (este) | 1,73B | 256K | lfm1.0 | Variante sin rechazos del LFM3-1.7B |
| LiquidAI/LFM3-1.7B | 1,73B | 256K | lfm1.0 | Modelo original con salvaguardas (93/100 rechazos) |
| Alternativas de ~1-2B | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Ausencia de salvaguardas: el modelo no rechaza peticiones dañinas, lo que lo hace inadecuado para aplicaciones de cara al público sin capas de moderación adicionales.
- Divergencia KL de 0,7091 respecto al original: la ablación altera la distribución de salidas y puede degradar coherencia, razonamiento o precisión en tareas sensibles.
- Riesgo de alucinación: inherente a modelos de este tamaño; no se han publicado evaluaciones de factualidad.
- Licencia lfm1.0: impone restricciones que deben revisarse antes de uso comercial; la model card la etiqueta como "other".
- Idiomas: aunque declara 17 idiomas, el rendimiento relativo por idioma no está documentado.
- Contexto largo: los 256K tokens son una cifra nominal; el rendimiento efectivo en contextos extremos no está verificado en la información disponible.
- Reproducibilidad: el proceso ARA está documentado, pero los resultados pueden variar con distintas versiones de Heretic o del checkpoint base.
- Uso responsable: al tratarse de una variante descensurada, su empleo conlleva responsabilidad legal y ética sobre el contenido generado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/LFM3-1.7B-heretic
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Blog de lanzamiento de LFM3: https://www.liquid.ai/blog/lfm3
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground de Liquid AI: https://playground.liquid.ai/
- Consola/API de Liquid AI: https://console.liquid.ai/dashboard
- Colección LFM3 en Hugging Face: https://huggingface.co/collections/LiquidAI/lfm3
- Heretic: https://heretic-project.org
