# RobinsonLabs/Qwen3.5-REAP-262B-A17B-abliterated-v2-GGUF

## Resumen

Qwen3.5-REAP-262B-A17B-abliterated-v2-GGUF es una versión cuantizada en formato GGUF de un modelo de lenguaje de tipo mixture-of-experts (MoE) con 262 mil millones de parámetros totales y 17 mil millones de parámetros activos. El modelo base, OpenMOSE/Qwen3.5-REAP-262B-A17B, es el resultado de aplicar el método de poda REAP (Router-weighted Expert Activation Pruning) sobre el modelo Qwen3.5-397B-A17B de Alibaba, reduciendo el número de parámetros totales de 397B a 262B manteniendo la misma arquitectura de 17B activos por token.

La versión "abliterated v2" de RobinsonLabs aplica una técnica de ortogonalización de pesos sobre los residual writers del modelo para eliminar el reflejo de rechazo de peticiones, manteniendo las salvaguardas de daño por diseño. La v2 corrige un defecto de la v1: el vector de dirección de rechazo se captura ahora nativamente sobre el propio modelo de 262B, en lugar de reutilizar el de un modelo hermano de 212B, lo que produce una reducción más efectiva de las negativas. Incluye además un guardián de attention-sink que evita que la ortogonalización degrade la coherencia del modelo.

El repositorio se encuentra en estado de construcción y sube los cuantizados de forma progresiva, comenzando por IQ3_XS. El modelo está pensado para casos de uso donde se requiere mínima censura y máxima libertad de generación, con licencia Apache-2.0 que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Qwen3.5-397B-A17B |
| Parametros totales | 262B (resultado de poda REAP sobre 397B) |
| Parametros activos | 17B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (maestro), IQ3_XS (primer rung publicado), imatrix-weighted |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-397B-A17B es un MoE con 397B parámetros totales y 17B activos por token, desarrollado por Alibaba como parte de la familia Qwen3.5. Sobre este modelo, OpenMOSE aplicó el método REAP (Router-weighted Expert Activation Pruning), que utiliza estadísticas del router y patrones de activación de expertos sobre un conjunto de calibración para identificar expertos infrautilizados o redundantes y podarlos, reduciendo el total de parámetros a 262B sin alterar la arquitectura de 17B activos.

La versión abliterated v2 de RobinsonLabs aplica una ortogonalización de pesos de una sola dirección sobre los residual writers del modelo. El vector de dirección de rechazo se captura directamente sobre el modelo de 262B, no sobre el de 212B como en la v1. Un guardián de attention-sink descarta cualquier dirección dominada por un canal de activación masiva, de modo que la ortogonalización elimina el reflejo de rechazo sin dañar la coherencia del texto. Las salvaguardas de daño se mantienen por diseño. Los cuantizados se cortan desde un maestro Q8_0 con ponderación imatrix.

## Capacidades

- Generación de texto libre con mínima censura, gracias al proceso de abliteration que reduce el rechazo de peticiones.
- Razonamiento y resolución de problemas, heredados del modelo base Qwen3.5-397B-A17B, que destaca en tareas de razonamiento complejo.
- Generación de código y capacidades de agente, incluyendo soporte para tool calling y multi-step reasoning, propias de la familia Qwen3.5.
- Capacidades multimodales de visión-lenguaje, ya que Qwen3.5 es un modelo nativo de visión-lenguaje; sin embargo, esta versión GGUF puede no incluir el encoder de visión en todos los cuantizados.
- Modo de pensamiento (thinking mode) presente en el modelo base; la abliteration v2 se ha ajustado para que las peticiones que deben pasar no sean rechazadas incluso con thinking habilitado.
- Multilingüismo, aunque no se especifican los idiomas exactos soportados en la información disponible.

## Casos de uso

- Generación creativa sin restricciones: escritura de ficción, poesía o guiones donde el modelo no rechace contenido por políticas de seguridad, gracias a la abliteration.
- Asistentes de rol (roleplay) avanzado: el modelo puede mantener personajes y narrativas sin romper el flujo por rechazos, con la ventaja de 17B parámetros activos para baja latencia.
- Desarrollo de código en entornos aislados: generación de scripts o fragmentos de código que otros modelos censurarían por considerarlos peligrosos, útil en laboratorios de seguridad ofensiva.
- Investigación en alineación y seguridad: estudiar el comportamiento de un modelo sin capas de rechazo permite analizar cómo se manifiestan los sesgos y las tendencias dañinas sin filtros.
- Despliegue en hardware limitado: con solo 17B parámetros activos, el modelo puede ejecutarse en GPUs de gama media-alta con cuantización IQ3_XS, a diferencia de un MoE denso de 262B.
- Experimentación con técnicas de abliteration: la v2 corrige problemas de la v1 y sirve como referencia para quienes investigan la ortogonalización de direcciones de rechazo en MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base Qwen3.5-397B-A17B de Alibaba demuestra resultados destacados en razonamiento, código, capacidades de agente y comprensión multimodal, pero no se proporcionan cifras concretas para la versión podada y abliterated. Se recomienda consultar el repositorio de OpenMOSE para datos de evaluación de la poda REAP.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en precisión completa requiere aproximadamente 351 GB de VRAM según LLM Explorer. Con cuantización IQ3_XS, el requisito baja a aproximadamente 100-120 GB.
- GPU recomendadas: para el cuantizado IQ3_XS, se necesitan múltiples GPUs, por ejemplo 2x NVIDIA A100 80GB o 2x H100. Para el Q8_0 maestro, se requieren al menos 4x A100 80GB.
- No cabe en GPUs de consumo (RTX 4090 24GB, etc.) ni siquiera con el cuantizado más agresivo, dado el tamaño de 262B parámetros.
- Opciones de despliegue: llama.cpp y sus derivados (llama-server, Ollama) son las opciones naturales para GGUF. También puede usarse con servidores compatibles con formato GGUF.
- Latencia y throughput: no disponibles. Al ser un MoE con 17B activos, la latencia por token será significativamente menor que la de un modelo denso equivalente, pero dependerá del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-REAP-262B-A17B-abliterated-v2 (este) | 262B | 17B | no disponible | Apache-2.0 | GGUF |
| Qwen3.5-REAP-212B-A17B | 212B | 17B | no disponible | Apache-2.0 | no disponible |
| Qwen3.5-397B-A17B (base) | 397B | 17B | no disponible | Apache-2.0 | no disponible |
| Qwen3.5-35B-A3B | 35B | 3B | 1M (versión Flash) | Apache-2.0 | no disponible |

La comparativa directa entre el modelo de 262B y el de 212B muestra que ambos son podas del mismo modelo base de 397B; la versión de 262B conserva más parámetros totales y probablemente mayor fidelidad al modelo original. Frente al modelo base de 397B, la poda reduce los requisitos de VRAM manteniendo los mismos 17B activos, lo que implica una velocidad de inferencia similar con menor huella de memoria.

## Limitaciones y advertencias

- El modelo está marcado como "not-for-all-audiences" y puede generar contenido explícito, violento o ilegal al haber eliminado el reflejo de rechazo. No debe usarse en entornos donde se requiera moderación de contenido.
- La abliteration reduce los rechazos pero no elimina los sesgos del modelo base; los sesgos de género, raza o ideología presentes en Qwen3.5 pueden manifestarse sin filtros.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar información, especialmente en contextos largos o con poca supervisión.
- El repositorio está en construcción: algunos cuantizados pueden no estar disponibles o contener errores. La v1 tuvo problemas de abliteration débil que motivaron esta v2.
- No se dispone de información sobre la longitud de contexto soportada, lo que dificulta planificar su uso en tareas de ventana larga.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.5 puede tener términos adicionales en su licencia original que conviene revisar.
- El proceso de poda REAP puede haber degradado ligeramente el rendimiento respecto al modelo de 397B, aunque no se aportan datos comparativos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/RobinsonLabs/Qwen3.5-REAP-262B-A17B-abliterated-v2-GGUF
- Repositorio base de RobinsonLabs (abliterated sin cuantizar): https://huggingface.co/RobinsonLabs/Qwen3.5-REAP-262B-A17B-abliterated
- Repositorio de la v1 (abliterated débil): https://huggingface.co/RobinsonLabs/Qwen3.5-REAP-262B-A17B-abliterated-GGUF
- Modelo base podado de OpenMOSE: https://huggingface.co/OpenMOSE/Qwen3.5-REAP-262B-A17B
- Modelo hermano de 212B: https://huggingface.co/OpenMOSE/Qwen3.5-REAP-212B-A17B
- Blog de Qwen3.5 de Alibaba: https://qwen.ai/blog?id=qwen3.5
- Ficha en LLM Explorer: https://llm-explorer.com/model/OpenMOSE%2FQwen3.5-REAP-262B-A17B,6ENRmPlPVvZomacOVJiRkH
