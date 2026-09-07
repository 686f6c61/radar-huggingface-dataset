# Devopsopraiz/Baanzon-Chenni-1.5-9B-ROOT

## Resumen

Baanzon-Chenni-1.5-9B-ROOT es un modelo de lenguaje de 9.409.813.744 parámetros desarrollado por Devopsopraiz, construido a partir de ornith-ai/Ornith-1.5-9B mediante un proceso de abliteración parcial. Su objetivo es eliminar los mecanismos de rechazo del modelo base para ofrecer una salida sin restricciones, especialmente en tareas de ingeniería de software autónoma, lógica técnica profunda y orquestación agéntica local.

El modelo es un transformer denso, no un MoE, con un tamaño de 19.3 GB en safetensors. Se basa en la arquitectura de Qwen3.5, como indican los archivos MTP incluidos. La abliteración se aplicó únicamente a las primeras 20 capas, lo que lo convierte en un experimento de eliminación de rechazos sin usar TransformerLens. No se ha publicado información sobre la longitud de contexto, los idiomas soportados ni el proceso de entrenamiento detallado.

Su relevancia radica en que ofrece una alternativa local y sin censura para aplicaciones agénticas, aunque su naturaleza experimental y la falta de benchmarks limitan su uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.5-9B) |
| Parametros totales | 9.409.813.744 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Baanzon-Chenni-1.5-9B-ROOT es un modelo denso de razonamiento con 9.409.813.744 parámetros, construido a partir de huihui-ai/Huihui-Ornith-1.5-9B-abliterated, que a su vez es una versión sin censura de ornith-ai/Ornith-1.5-9B. La técnica de abliteración utilizada es un proof-of-concept que elimina los rechazos sin usar TransformerLens, aplicada únicamente a las primeras 20 capas. El modelo incluye archivos MTP procedentes de Qwen/Qwen3.5-9B, que son necesarios si se desea convertir a formato GGUF.

No se han publicado datos sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni si se aplicó RLHF o DPO. La innovación técnica destacable es la abliteración parcial, que reduce los mecanismos de rechazo del modelo original, aunque de forma incompleta.

## Capacidades

- Generación de texto y conversación orientada a razonamiento técnico.
- Optimizado para ingeniería de software autónoma: puede generar y revisar código, así como razonar sobre arquitecturas de software.
- Diseñado para orquestación agéntica local, lo que sugiere capacidad para coordinar agentes y tareas de múltiples pasos.
- Soporte de tool calling y function calling: no se especifica en la documentación disponible.
- Capacidades multilingües: no disponibles.
- Capacidades multimodales: el tag image-text-to-text aparece en HuggingFace, pero la model card no detalla soporte de visión, por lo que no se confirma.

## Casos de uso

- Desarrollo de software autónomo en local: el modelo puede generar código, analizar arquitecturas y proponer refactorizaciones sin depender de servicios en la nube, gracias a su tamaño de 9B y a su optimización para lógica técnica.
- Orquestación de agentes multi-paso: al estar diseñado para autonomous-agents, puede integrarse en sistemas que requieren coordinación de varios agentes, por ejemplo, para automatizar tareas de mantenimiento de repositorios.
- Análisis de código heredado: su capacidad de razonamiento técnico permite examinar código existente, identificar patrones de error y sugerir mejoras, especialmente en entornos donde la censura de salidas no es deseada.
- Asistente de programación sin conexión: gracias a su tamaño, puede desplegarse en una GPU de consumo con cuantización para ofrecer asistencia en entornos aislados o con requisitos de privacidad.
- Investigación en seguridad y alineación: al ser un modelo abliterated, puede utilizarse para estudiar el comportamiento de rechazo, los sesgos y las respuestas en escenarios sin filtros, siempre que se maneje con precaución.
- Generación de documentación técnica: el modelo puede producir documentación, comentarios de código y explicaciones de sistemas complejos, lo que facilita la transferencia de conocimiento en equipos de desarrollo.
- Experimentación en agentes locales: para investigadores que deseen probar arquitecturas de agentes en un entorno controlado, este modelo ofrece una base sin restricciones y compatible con transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Inferencia en bf16: requiere aproximadamente 19 GB de VRAM, por lo que puede servirse en una GPU de 80 GB como A100 o H100 sin necesidad de paralelismo.
- En GPUs de consumo como RTX 4090 (24 GB) podría ejecutarse con cuantización, pero no se proporcionan datos concretos de cuantización ni de requisitos de VRAM para cada formato.
- Despliegue: compatible con transformers según la model card. Para usar GGUF, se deben copiar los archivos MTP desde Qwen/Qwen3.5-9B antes de la conversión.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Baanzon-Chenni-1.5-9B-ROOT | 9.409.813.744 | no disponible | MIT | HuggingFace |
| Ornith-1.5-9B | ~9B | no disponible | MIT | HuggingFace |
| Huihui-Ornith-1.5-9B-abliterated | ~9B | no disponible | MIT | HuggingFace |

Baanzon-Chenni-1.5-9B-ROOT es un fine-tuning de Huihui-Ornith-1.5-9B-abliterated, que a su vez es una versión sin censura de Ornith-1.5-9B. No se han publicado datos de rendimiento comparativo entre estos modelos.

## Limitaciones y advertencias

- Sesgos y contenido: la abliteración reduce los mecanismos de rechazo, lo que puede generar salidas sensibles, controvertidas o inapropiadas, sin garantías de seguridad.
- Abliteración parcial: solo las primeras 20 capas fueron abliteradas, lo que puede producir respuestas inconsistentes o rechazos residuales en ciertos temas.
- Riesgo de alucinación: al ser un modelo de lenguaje general sin benchmarks publicados, no se puede evaluar su fiabilidad; se recomienda revisar manualmente las salidas.
- Uso en producción: la model card advierte que no es apto para todos los públicos ni para aplicaciones comerciales sin supervisión.
- Responsabilidad legal y ética: los usuarios son responsables de cumplir con las leyes locales y los estándares éticos al usar el modelo.
- Falta de datos de entrenamiento: no se han publicado detalles sobre el dataset, el número de tokens o el proceso de alineación, lo que limita la trazabilidad del modelo.

## Enlaces

- https://huggingface.co/Devopsopraiz/Baanzon-Chenni-1.5-9B-ROOT
- https://huggingface.co/ornith-ai/Ornith-1.5-9B
- https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-9B-abliterated
- https://github.com/Sumandora/remove-refusals-with-transformers
- https://huggingface.co/ornith-ai/Ornith-1.5-9B-GGUF
- https://huggingface.co/Qwen/Qwen3.5-9B
- https://huggingface.co/ornith-ai/Ornith-1.5-9B/blob/main/LICENSE
