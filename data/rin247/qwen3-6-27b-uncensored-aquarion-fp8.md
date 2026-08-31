# Rin247/Qwen3.6-27B-Uncensored-Aquarion-FP8

## Resumen

Este modelo es una cuantización FP8 weight-only de `Qwen3.6-27B-Uncensored`, un modelo de 27B parámetros basado en la arquitectura Qwen3.6 de Alibaba. El autor, Rin247, lo ha publicado bajo el sello "Aquarion Forge", que aplica una técnica de abliteración (eliminación de la dirección de rechazo mediante proyección ortogonal) antes de la cuantización, con el objetivo de eliminar los filtros de seguridad y censura del modelo original.

La cuantización FP8 reduce el tamaño del modelo a aproximadamente 29.5 GB, lo que permite su ejecución en GPUs de consumo con 32 GB de VRAM o menos. La relevancia de este modelo radica en su combinación de un tamaño manejable (27B), una ventana de contexto presumiblemente amplia heredada de Qwen3.6, y la eliminación de restricciones de contenido, lo que lo hace atractivo para casos de uso donde se requiere generación sin filtros, como la investigación en seguridad de IA o la generación creativa sin restricciones.

Sin embargo, es importante destacar que la información disponible es extremadamente limitada: no se especifican datos de entrenamiento, benchmarks, licencia ni detalles de la arquitectura base. La model card del autor es mínima y no proporciona métricas de rendimiento ni comparativas. Esto limita significativamente la capacidad de evaluación objetiva del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.6 (transformer, basado en Qwen3.5; detalles exactos no disponibles) |
| Parametros totales | 26.895.998.464 (~27B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (presumiblemente hereda la del modelo base Qwen3.6-27B, pero no se confirma) |
| Tipos de cuantizacion | FP8 (weight-only, RTN, escalares almacenados junto a los pesos) |
| Idiomas soportados | no disponibles (presumiblemente multilingue, como Qwen3.6, pero no se confirma) |
| Licencia | no disponible |
| Formato de pesos | safetensors con buffers de escala y forma personalizados (`*.weight_scale`, `*.weight_shape`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.6-27B, un modelo transformer de 27B parámetros desarrollado por Alibaba. No se dispone de detalles sobre la configuración exacta de capas, cabezas de atención, ni sobre el proceso de entrenamiento del modelo base. La model card no especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO.

La innovación principal de este modelo concreto reside en dos aspectos: primero, la abliteración mediante proyección ortogonal de la dirección de rechazo, una técnica que identifica y elimina la representación interna responsable de los comportamientos de rechazo y censura; segundo, la cuantización FP8 weight-only aplicada mediante RTN (Round-To-Nearest) en CPU, con escalares almacenados en buffers separados junto a los pesos. Este enfoque de cuantización personalizado requiere que el motor de inferencia soporte la des-cuantización con los buffers de escala y forma proporcionados.

## Capacidades

- Generación de texto sin filtros de contenido ni rechazos por temas sensibles (efecto de la abliteración).
- Razonamiento y generación de código: hereda las capacidades del modelo base Qwen3.6-27B, presumiblemente sólidas en tareas de razonamiento lógico y programación, aunque no hay benchmarks que lo confirmen en esta versión.
- Capacidades multilingües: probablemente heredadas de Qwen3.6, que soporta múltiples idiomas, pero no confirmadas en esta variante.
- Tool calling y function calling: no confirmado, aunque los modelos Qwen3.6 suelen soportarlo; no hay evidencia en la model card.
- Soporte de agentes y multi-step reasoning: no confirmado.
- Sin modo de pensamiento explícito (thinking mode): no se menciona en la documentación.
- Multimodalidad: no confirmada. El modelo base Qwen3.6-27B podría tener variantes multimodales, pero esta cuantización específica no lo indica.

## Casos de uso

- Investigación en seguridad y alineación de IA: el modelo permite estudiar el comportamiento de un LLM sin filtros de seguridad, lo que resulta útil para investigar sesgos, alucinaciones y mecanismos de rechazo en sistemas de IA. Su tamaño de 27B es manejable para laboratorios con GPUs de gama alta.
- Generación creativa sin restricciones: escritura de ficción, poesía o guiones que aborden temas controvertidos o explícitos sin que el modelo se niegue a responder. La abliteración elimina las barreras de contenido, permitiendo explorar narrativas adultas o políticamente sensibles.
- Desarrollo de aplicaciones de rol (roleplay) avanzado: el modelo puede mantener personajes y conversaciones multi-turno sin rechazar solicitudes de temática adulta o violenta, algo que los modelos censurados bloquean. Su contexto amplio (presumiblemente 128K o más, heredado de Qwen3.6) facilita mantener la coherencia en sesiones largas.
- Evaluación de técnicas de des-cuantización FP8: los buffers de escala personalizados permiten a ingenieros de ML experimentar con pipelines de inferencia FP8 weight-only, evaluando el impacto en calidad y rendimiento frente a formatos estándar como FP16 o GGUF.
- Pruebas de robustez y adversarias: el modelo puede usarse para generar entradas adversariales o contenido que ponga a prueba los filtros de seguridad de otros sistemas, ayudando a identificar vulnerabilidades en moderadores automáticos.
- Prototipado rápido de asistentes sin moderación: para entornos de desarrollo donde se necesita un LLM local que responda a cualquier prompt sin intervención de capas de seguridad, como en demos técnicas o entornos de pruebas aislados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación estándar. Tampoco se ofrecen comparativas con el modelo base o con otras variantes cuantizadas. El autor no ha proporcionado datos de rendimiento en tareas específicas, por lo que no es posible evaluar objetivamente la calidad del modelo frente a alternativas. Se recomienda ejecutar pruebas propias con el conjunto de datos de evaluación relevante para el caso de uso previsto.

## Requisitos de hardware

- VRAM estimada para inferencia: el tamaño del repo es de 29.5 GB, por lo que se necesitan al menos 32 GB de VRAM para cargar el modelo completo en FP8. Con cuantizaciones adicionales (no proporcionadas) se podría reducir, pero no hay GGUF disponibles.
- GPUs recomendadas: NVIDIA RTX 4090 (24 GB) no es suficiente; se necesita al menos una RTX A6000 (48 GB), A100 40/80 GB, H100, o dos GPUs de 24 GB en paralelo con tensor parallelism.
- No cabe en GPUs de consumo de gama media (16 GB o menos). Solo es viable en GPUs profesionales o en configuraciones multi-GPU.
- Opciones de despliegue: el formato de pesos personalizado (FP8 con buffers de escala) no es compatible directamente con vLLM, llama.cpp, Ollama o TGI sin modificaciones. El autor indica que se requiere des-cuantizar con los buffers `*.weight_scale` y `*.weight_shape` antes de usar un motor de inferencia estándar. Esto añade complejidad al despliegue.
- Latencia y throughput: no disponibles. Dependerán del motor de inferencia elegido tras la des-cuantización y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Rin247/Qwen3.6-27B-Uncensored-Aquarion-FP8 | 27B | no disponible | FP8 weight-only | no disponible | Abliterado con proyeccion ortogonal, cuantizacion RTN |
| kasimat/Qwen3.6-27B-AEON-Ultimate-Uncensored-FP8-MTP | 27B | no disponible | FP8 + MTP (multi-token prediction) | no disponible | Variante con MTP, abliterado con tecnicas avanzadas |
| Qwen/Qwen3.6-27B (modelo base) | 27B | no disponible | BF16/FP16 | Apache 2.0 (presumiblemente) | Modelo oficial de Alibaba, con filtros de seguridad |

La comparativa es limitada porque no hay datos de benchmarks para ninguna de las variantes. La diferencia principal entre el modelo de Rin247 y el de kasimat es que este último incorpora multi-token prediction (MTP), que puede acelerar la inferencia. El modelo base de Qwen mantiene los filtros de seguridad y tiene licencia abierta (presumiblemente Apache 2.0, aunque no se confirma). La elección entre estas variantes dependerá de la necesidad de velocidad (MTP), de la ausencia de censura (ambas variantes abliteradas) y de la compatibilidad con el motor de inferencia.

## Limitaciones y advertencias

- Sesgos conocidos: al ser una variante abliterada, se han eliminado los mecanismos de rechazo, pero no los sesgos subyacentes del modelo base. El modelo puede generar contenido ofensivo, discriminatorio o perjudicial sin ningún tipo de moderación.
- Riesgo de alucinacion: no se han publicado métricas de fiabilidad. Como cualquier LLM, es propenso a alucinar, y al no tener filtros, puede presentar información falsa con total confianza.
- Limitaciones de contexto: la longitud de contexto no está confirmada. Si el modelo base Qwen3.6-27B tiene una ventana de 128K o más, esta variante debería heredarla, pero no hay garantía tras la cuantización.
- Restricciones de licencia: la licencia es "no disponible". Esto es un problema grave para uso comercial o incluso para investigación, ya que no se conocen los términos de uso ni las atribuciones requeridas. Se recomienda contactar al autor antes de cualquier despliegue.
- Compatibilidad técnica: el formato de pesos personalizado (FP8 con buffers de escala) no es estándar. La mayoría de los motores de inferencia (vLLM, llama.cpp, TGI) no lo soportan directamente, lo que obliga a un paso de des-cuantización manual que puede ser propenso a errores.
- Ausencia de garantías: el modelo se publica sin benchmarks, sin especificaciones claras y sin documentación de entrenamiento. No hay forma de verificar su calidad o seguridad.
- Riesgo legal: la generación de contenido sin filtros puede violar leyes de protección de menores, difamación o incitación al odio en algunas jurisdicciones. El usuario es responsable del uso que haga del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rin247/Qwen3.6-27B-Uncensored-Aquarion-FP8
- Modelo relacionado (variante AEON con MTP): https://huggingface.co/kasimat/Qwen3.6-27B-AEON-Ultimate-Uncensored-FP8-MTP
- Repositorio del modelo AEON (base para la abliteracion): https://github.com/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-DFlash/
- Catalogo de modelos abliterados: https://abliteration.org/
- Ficha del modelo AEON en ThinkLLM: https://thinkllm.dev/models/qwen3-6-27b-aeon-ultimate-uncensored-fp8-mtp
