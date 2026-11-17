# Peymandc/LFM3-1.7B-Heretic-Uncensored

## Resumen

LFM3-1.7B-Heretic-Uncensored es una variante "descensurada" del modelo LiquidAI/LFM3-1.7B, publicada por el usuario Peymandc. Se ha generado mediante la herramienta Heretic v2.1.0 aplicando una técnica de ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) sobre las capas 9 a 24 del modelo base, con el objetivo de eliminar el comportamiento de rechazo (refusals) manteniendo al máximo las capacidades originales. El modelo hereda la arquitectura tri-híbrida de la familia LFM3 de Liquid AI, orientada a despliegue en el borde (edge), y conserva los 1.728.801.536 parámetros del checkpoint original.

El modelo base LFM3-1.7B está diseñado para agentes locales y aplicaciones especializadas, con un contexto de 256K tokens y un consumo de memoria de aproximadamente 1 GB en precisión de 4 bits, lo que permite ejecutarlo en teléfonos y portátiles. Esta variante mantiene esas características de eficiencia pero modifica el comportamiento conversacional para reducir drásticamente las negativas a responder, pasando de 98/100 rechazos en el modelo original a 3/100 en esta versión, con una divergencia KL de 0,0732 respecto al original.

La relevancia de esta ficha radica en que documenta una práctica cada vez más común en el ecosistema open source: la modificación de modelos mediante técnicas de ablación para eliminar alineamiento de seguridad, con métricas reproducibles y parámetros explícitos. Es importante señalar que el modelo conserva la licencia LFM1.0 del original, lo que impone restricciones de uso comercial que deben evaluarse antes de cualquier despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tri-híbrido (familia LFM3 de Liquid AI), con código personalizado (`custom_code`) |
| Parámetros totales | 1.728.801.536 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 256K tokens (heredado del modelo base LFM3-1.7B) |
| Tipos de cuantización | no disponible explícitamente; el modelo base se describe con precisión de 4 bits (~1 GB de memoria) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura tri-híbrida de la familia LFM3 de Liquid AI, que combina componentes de atención y mecanismos lineales para reducir el coste computacional manteniendo la calidad en contextos largos. El checkpoint original LFM3-1.7B fue post-entrenado para su uso en entornos agénticos como Hermes Agent, Pi y OpenClaw, con una ventana de contexto de 256K tokens y un enfoque explícito en despliegue en el borde. La información disponible no detalla el número de tokens de entrenamiento ni la composición del dataset del modelo base.

La modificación introducida por Peymandc consiste en una ablación de rangos arbitrarios (ARA) aplicada sobre las capas 9 a 24 del modelo, con los siguientes parámetros: `start_layer_index=9`, `end_layer_index=24`, `preserve_good_behavior_weight=0.3616`, `steer_bad_behavior_weight=0.0006`, `overcorrect_relative_weight=0.7002` y `neighbor_count=14`. Esta técnica proyecta direcciones de activación asociadas al comportamiento de rechazo fuera del espacio de representación, preservando en la medida de lo posible las capacidades originales. El autor indica que el proceso es reproducible y proporciona un directorio `reproduce` con instrucciones. El resultado medido es una reducción de rechazos de 98/100 a 3/100 con una divergencia KL de 0,0732 respecto al modelo original.

## Capacidades

- Generación de texto conversacional multi-turno en 16 idiomas, incluido el español.
- Razonamiento y respuesta a instrucciones con contexto largo de hasta 256K tokens.
- Capacidades agénticas heredadas del post-entrenamiento del modelo base (Hermes Agent, Pi, OpenClaw).
- Comportamiento descensurado: reducción drástica de rechazos (3/100 frente a 98/100 del original).
- Soporte de tool calling / function calling: no disponible explícitamente en la información proporcionada, aunque el modelo base está orientado a agentes.
- Capacidades multilingües: 16 idiomas declarados (en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl).
- Modo thinking, visión o audio: no disponible en esta variante de texto.
- Compatibilidad con endpoints (`endpoints_compatible` según los tags).

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar el efecto de la ablación ARA comparando directamente con el original, gracias a los parámetros reproducibles y la métrica de divergencia KL publicada.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que requiera temáticas sensibles, donde el modelo original rechazaría la petición; el contexto de 256K permite mantener arcos narrativos largos.
- Asistentes conversacionales locales en dispositivos de borde: con ~1 GB en 4 bits, puede desplegarse en portátiles y teléfonos para conversaciones multi-turno sin conexión.
- Prototipado de agentes autónomos: el post-entrenamiento agéntico del modelo base y su contexto largo lo hacen adecuado para pipelines de razonamiento multi-paso en entornos de investigación.
- Evaluación comparativa de técnicas de descensurado: sirve como referencia reproducible para medir el impacto de ARA frente a otras técnicas como abliteration o DPO negativo.
- Procesamiento multilingüe en el borde: tareas de resumen, traducción o generación en los 16 idiomas soportados en entornos con recursos limitados.
- Fine-tuning especializado en una sola GPU: el tamaño de 1,7B permite adaptar el modelo a dominios concretos con ajuste rápido, como indica el autor del modelo base.

## Benchmarks y rendimiento

| Métrica | Este modelo | Modelo original (LiquidAI/LFM3-1.7B) |
|---|---|---|
| Rechazos (Refusals) | 3/100 | 98/100 |
| Divergencia KL | 0,0732 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1 GB en cuantización de 4 bits (dato del modelo base); en FP16 se estiman unos 3,5 GB según el tamaño del repositorio (3,5 GB).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para FP16; para 4 bits, prácticamente cualquier GPU integrada o móvil moderna.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y en GPUs integradas; también en teléfonos y portátiles según el autor del modelo base.
- Opciones de despliegue: transformers (librería declarada); el uso de vLLM, llama.cpp, Ollama o TGI no está confirmado en la información disponible, y el tag `custom_code` puede requerir pasos adicionales de integración.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Peymandc/LFM3-1.7B-Heretic-Uncensored | 1,73B | 256K | lfm1.0 | Descensurado vía ARA, edge |
| LiquidAI/LFM3-1.7B | 1,73B | 256K | lfm1.0 | Base alineado, edge y agentes |
| Modelos descensurados de la familia Llama/Qwen | no disponible | no disponible | variable | Abliteration / DPO |

La comparación con alternativas descensuradas de otros fabricantes no está disponible en la información proporcionada. El principal punto de comparación directo es el modelo original de Liquid AI, del que esta variante difiere únicamente en el comportamiento de rechazo y una divergencia KL de 0,0732.

## Limitaciones y advertencias

- La eliminación del comportamiento de rechazo implica que el modelo puede generar contenido dañino, ilegal o sexualmente explícito; no es adecuado para aplicaciones orientadas al público sin filtros externos.
- La divergencia KL de 0,0732 indica que las capacidades del modelo original pueden haberse degradado parcialmente; no se han publicado evaluaciones de calidad post-ablación.
- Riesgo de alucinación inherente a modelos de 1,7B; no se han publicado métricas de fidelidad.
- La licencia lfm1.0 impone restricciones que deben revisarse antes de uso comercial; la etiqueta `other` en Hugging Face requiere consultar el archivo LICENSE del repositorio.
- El tag `custom_code` implica que la carga del modelo puede requerir `trust_remote_code=True` y revisión del código incluido.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, y fue publicado el 17 de noviembre de 2026; no hay validación comunitaria.
- No se dispone de información sobre sesgos específicos más allá de los heredados del modelo base.
- El soporte de tool calling y agentes no está confirmado explícitamente para esta variante, aunque se hereda del post-entrenamiento del base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Peymandc/LFM3-1.7B-Heretic-Uncensored
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Blog de la familia LFM3: https://www.liquid.ai/blog/lfm3
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground de Liquid AI: https://playground.liquid.ai/
- Consola de Liquid AI: https://console.liquid.ai/dashboard
- Proyecto Heretic: https://heretic-project.org
- Colección LFM3 en Hugging Face: https://huggingface.co/collections/LiquidAI/lfm3
