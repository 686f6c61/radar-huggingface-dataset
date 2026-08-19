# mradermacher/Qwen3.5-0.8B-nuclear-obliterated-base-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo `Zmu/Qwen3.5-0.8B-nuclear-obliterated-base`, preparadas por mradermacher. Se trata de una versión "abliterated" (obliterated) de un modelo base de 0.8 mil millones de parámetros, lo que implica que se han eliminado o atenuado las capas de rechazo y censura del modelo original. El objetivo es ofrecer una variante sin restricciones de contenido para ejecución local en hardware modesto.

La relevancia de este modelo radica en su tamaño reducido, que permite su uso en entornos con recursos limitados, y en su naturaleza "sin filtros", orientada a usuarios que buscan respuestas sin moderación. Sin embargo, la información pública disponible es escasa: no se especifican detalles de arquitectura, licencia, idiomas ni capacidades exactas. El modelo original pertenece a la serie Qwen3.5 de Alibaba, pero esta variante ha sido modificada por terceros, por lo que no se puede garantizar que conserve todas las características del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 0.8B (según nombre, no confirmado) |
| Parametros activos | no aplicable (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo. El nombre sugiere que se basa en la familia Qwen3.5, que en su versión de 0.8B podría emplear una arquitectura transformer estándar, pero no hay confirmación. El proceso de "abliteration" consiste en modificar los pesos del modelo para eliminar las respuestas de rechazo, generalmente mediante la identificación y anulación de direcciones de características relacionadas con la negativa. No se conocen los datos de entrenamiento originales ni si se aplicaron técnicas como RLHF o DPO. El repositorio solo indica que se trata de cuantizaciones estáticas del modelo base de Zmu, sin más detalles.

## Capacidades

- No se ha publicado información específica sobre las capacidades del modelo en este repositorio.
- Al ser una versión "abliterated", se espera que genere contenido sin rechazos por políticas de seguridad, pero no hay garantías.
- Dado su tamaño de 0.8B, es probable que tenga capacidades limitadas de razonamiento y generación de texto en comparación con modelos más grandes.
- No se confirma soporte para tool calling, agentes, visión o multimodalidad. El artículo de codersera menciona que Qwen3.5 0.8B original tiene visión y contexto de 262K, pero esta variante podría no conservarlo.

## Casos de uso

- **Generación de texto creativo sin restricciones**: el modelo puede emplearse para escribir ficción, poesía o diálogos sin filtros de contenido, gracias a su naturaleza abliterated. Su pequeño tamaño permite ejecutarlo en portátiles o incluso en CPU.
- **Experimentación con modelos sin censura**: investigadores y aficionados pueden estudiar el comportamiento de un modelo abliterated de baja capacidad, comparando sus respuestas con las del modelo original.
- **Prototipado rápido de aplicaciones de chat local**: al ser un GGUF, se puede integrar en herramientas como llama.cpp u Ollama para crear asistentes de chat que no rechacen preguntas sensibles.
- **Educación sobre técnicas de modificación de modelos**: sirve como ejemplo práctico de cómo se aplica la abliteration a un modelo base, aunque no se documenta el proceso en este repositorio.
- **Pruebas de rendimiento en hardware de gama baja**: con solo 0.8B de parámetros, es adecuado para probar la inferencia en Raspberry Pi, teléfonos móviles o GPUs integradas.
- **Generación de datos sintéticos para entrenamiento**: podría usarse para producir textos variados sin sesgos de moderación, aunque su calidad limitada restringe su utilidad en tareas complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo.

## Requisitos de hardware

- **VRAM estimada**: para una cuantización Q4_K_S de un modelo de 0.8B, el tamaño del archivo ronda los 0.5-0.6 GB, por lo que se puede ejecutar en GPUs con 1-2 GB de VRAM o incluso en CPU con suficiente RAM.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, o integradas como Intel Iris Xe) es suficiente. También funciona en Apple Silicon con Metal.
- **Compatibilidad con consumer GPU**: sí, cabe en prácticamente cualquier GPU moderna.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, kobold.cpp, o servidores compatibles con GGUF como llama-cpp-python.
- **Latencia y throughput**: no se dispone de mediciones concretas, pero en una GPU moderna se esperan velocidades de decodificación superiores a 50 tokens/s; en CPU, alrededor de 10-20 tokens/s.

## Comparativa con modelos similares

No se dispone de datos comparativos fiables. El modelo podría compararse con otros GGUF de tamaño similar como Qwen2.5-0.5B-Instruct o Llama-3.2-1B, pero no hay información sobre rendimiento relativo. La principal diferencia es su naturaleza abliterated, que no afecta a las métricas de calidad sino a la política de respuestas.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: al ser un modelo pequeño, es propenso a generar información incorrecta o inventada. La abliteration no corrige estos problemas.
- **Contenido inapropiado**: al eliminar los mecanismos de rechazo, el modelo puede producir contenido ofensivo, ilegal o peligroso sin advertencias. El uso debe ser responsable y bajo la propia responsabilidad del usuario.
- **Licencia desconocida**: no se especifica la licencia, lo que impide conocer las restricciones de uso comercial o redistribución. Se recomienda contactar con el autor original antes de usar en producción.
- **Falta de documentación**: no hay información sobre el proceso de entrenamiento, datos utilizados ni evaluación de seguridad, lo que dificulta su adopción en entornos profesionales.
- **Posible pérdida de capacidades**: la modificación abliterated puede degradar el rendimiento en tareas que requieren seguir instrucciones de seguridad, y no se garantiza que conserve el contexto largo o la multimodalidad del modelo original.

## Enlaces

- [Repositorio del modelo GGUF en HuggingFace](https://huggingface.co/mradermacher/Qwen3.5-0.8B-nuclear-obliterated-base-GGUF)
- [Modelo original de Zmu](https://huggingface.co/Zmu/Qwen3.5-0.8B-nuclear-obliterated-base)
- [Guía sobre modelos abliterated (2026)](https://locallyuncensored.com/blog/abliterated-models-guide.html)
- [Artículo sobre Qwen3.5 0.8B (referencia general)](https://codersera.com/blog/run-and-benchmark-qwen35-08b/)
