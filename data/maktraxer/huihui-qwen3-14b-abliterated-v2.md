# maktraxer/Huihui-Qwen3-14B-abliterated-v2

## Resumen

Huihui-Qwen3-14B-abliterated-v2 es una variante del modelo Qwen/Qwen3-14B de Alibaba, publicada por el usuario maktraxer en Hugging Face. Se trata de una versión "abliterated", es decir, un modelo al que se le ha aplicado una técnica de ablación de direcciones de activación para eliminar los comportamientos de rechazo (refusals) aprendidos durante el alineamiento. El modelo original Qwen3-14B es un transformer denso de 14.768.307.200 parámetros, entrenado por el equipo Qwen de Alibaba para generación de texto, razonamiento y conversación.

La relevancia de esta variante reside en su carácter experimental: elimina los mecanismos de rechazo del modelo base sin reentrenamiento, empleando una técnica de ablación más rápida que la implementación de referencia basada en TransformerLens. Según la model card, esta v2 corrige problemas de "códigos garbled" (texto corrupto) que aparecían en la versión anterior, mediante un cambio en la capa candidata sobre la que se aplica la ablación.

El modelo hereda la licencia Apache 2.0 del Qwen3-14B original y se distribuye en formato safetensors con un tamaño de repositorio de 29,5 GB. No se han publicado datos de benchmarks ni información sobre idiomas soportados en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-14B) |
| Parametros totales | 14.768.307.200 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (BitsAndBytes en el ejemplo de la model card); GGUF/Ollama disponible vía huihui_ai/qwen3-abliterated:14b-v2 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); Ollama |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 14,77 mil millones de parámetros, derivado directamente de Qwen/Qwen3-14B. No se trata de un modelo entrenado desde cero, sino de una modificación post-entrenamiento del modelo base mediante abliteration: una técnica que identifica y elimina las direcciones de activación asociadas a los comportamientos de rechazo, sin necesidad de reentrenar los pesos.

Según la model card, la ablación se realizó con un método "nuevo y más rápido" que la implementación de referencia basada en TransformerLens (remove-refusals-with-transformers de Sumandora). La v2 cambia la capa candidata sobre la que se aplica la ablación para resolver el problema de generación de texto corrupto presente en la v1. No se proporcionan detalles sobre el dataset de calibración, el número de tokens utilizados ni si hubo fases adicionales de RLHF o DPO tras la ablación. El modelo base Qwen3-14B incorpora un modo de razonamiento ("thinking") que se puede activar o desactivar mediante la plantilla de chat, y esta variante conserva dicha funcionalidad, tal como se refleja en el código de ejemplo con el parámetro `enable_thinking`.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen3-14B.
- Modo de razonamiento ("thinking mode") activable y desactivable mediante la plantilla de chat (`enable_thinking`), con toggle en Ollama mediante `/set think` y `/set nothink`.
- Comportamiento sin rechazos (uncensored): el modelo no aplica los mecanismos de negativa aprendidos en el alineamiento del modelo base.
- Capacidades de razonamiento, código y matemáticas presumiblemente heredadas del Qwen3-14B, aunque no se documentan explícitamente en la model card.
- Soporte de tool calling y function calling: no documentado en la información disponible.
- Capacidades multilingües: no documentadas en la información disponible.
- Capacidades de visión o audio: no disponibles (el modelo base es solo texto).

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar cómo la ablación de direcciones de activación afecta al comportamiento de rechazo, comparando respuestas con el Qwen3-14B original en experimentos controlados.
- Generación creativa sin restricciones: útil para escritura de ficción, guiones o narrativa que requiera temáticas que el modelo base rechazaría, con la advertencia de que el contenido generado debe revisarse.
- Evaluación de robustez de filtros: emplear el modelo como generador adversarial para probar sistemas de moderación de contenido y clasificadores de seguridad en pipelines de producción.
- Experimentos de destilación y evaluación comparativa: usar las respuestas del modelo abliterated frente al base para analizar diferencias de distribución en tareas de razonamiento y conocimiento general.
- Despliegue local con Ollama: gracias a la disponibilidad de `huihui_ai/qwen3-abliterated:14b-v2`, se puede ejecutar en estaciones de trabajo con GPU de consumo para prototipado rápido sin infraestructura en la nube.
- Fine-tuning posterior sobre dominio específico: al estar bajo Apache 2.0 y en formato safetensors estándar, se puede ajustar con transformers para tareas verticales donde el modelo base rechazaría ciertos inputs legítimos (por ejemplo, análisis de contenido sensible en moderación).
- Docencia y demostraciones: ilustrar en cursos o talleres cómo funcionan las técnicas de abliteration y qué efectos tienen sobre el comportamiento de un LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 29,5 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda un mínimo de 32-40 GB de VRAM.
- VRAM estimada en 4-bit (BitsAndBytes, como en el ejemplo de la model card): en torno a 8-10 GB para pesos, más overhead; viable en GPUs de 12-16 GB.
- GPUs recomendadas: A100 40/80 GB o H100 para bf16 sin cuantizar; RTX 4090 (24 GB) para bf16 con margen ajustado o 4-bit; RTX 3090/4080 (16-24 GB) en 4-bit.
- Cabe en GPU de consumo: sí, en 4-bit en tarjetas de 12 GB o más; en bf16 requiere GPUs de 32 GB o más (A100, H100, o configuraciones multi-GPU).
- Opciones de despliegue: transformers (con BitsAndBytes para cuantización), Ollama (`huihui_ai/qwen3-abliterated:14b-v2`), text-generation-inference (tag `text-generation-inference` presente en el repo). No se documenta soporte explícito para vLLM o llama.cpp en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Huihui-Qwen3-14B-abliterated-v2 | 14,77 B | no disponible | Apache 2.0 | Variante abliterated, sin rechazos |
| Qwen/Qwen3-14B | 14,77 B | no disponible | Apache 2.0 | Modelo base original, con alineamiento |
| huihui-ai/Qwen3-14B-abliterated (v1) | 14,77 B | no disponible | Apache 2.0 | Versión previa con problemas de texto corrupto según la model card |

No se dispone de datos de benchmarks para establecer comparaciones cuantitativas de rendimiento entre estas variantes.

## Limitaciones y advertencias

- El modelo elimina deliberadamente los mecanismos de rechazo, por lo que puede generar contenido dañino, ilegal o éticamente problemático; no es adecuado para aplicaciones de cara al público sin filtros externos.
- La técnica de abliteration puede degradar capacidades del modelo base (razonamiento, coherencia) de forma no documentada; la model card no reporta evaluaciones que cuantifiquen esta posible pérdida.
- La v2 corrige problemas de texto corrupto de la v1, pero no se documenta la tasa de error residual ni pruebas exhaustivas de calidad.
- Riesgo de alucinación: no cuantificado en la información disponible; el modelo base Qwen3-14B puede alucinar y la ablación no corrige este comportamiento.
- Idiomas soportados no documentados; se desconoce si la ablación afecta al rendimiento multilingüe.
- Longitud de contexto no documentada en esta ficha; debe consultarse la model card del Qwen3-14B original.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo sin alineamiento conlleva riesgos legales y reputacionales según la jurisdicción y el caso de uso.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maktraxer/Huihui-Qwen3-14B-abliterated-v2
- Modelo base Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-14B/blob/main/LICENSE
- Versión anterior v1: https://huggingface.co/huihui-ai/Qwen3-14B-abliterated
- Versión Ollama: https://ollama.com/huihui_ai/qwen3-abliterated:14b-v2
- Repositorio de referencia sobre abliteration: https://github.com/Sumandora/remove-refusals-with-transformers
