# HumboldtJoker/ayni-slerp-abliterated

## Resumen

ayni-slerp-abliterated es un modelo de lenguaje experimental de 30.5 mil millones de parámetros, desarrollado por Thomas Edrington (HumboldtJoker) como parte de una línea de investigación sobre fusión de modelos y reducción de rechazos en sistemas de IA. Se trata de una segunda iteración que combina una fusión SLERP (Spherical Linear Interpolation) de variantes del modelo Ayni —basado en Qwen3-30B con arquitectura MoE— y la aplicación de una técnica de abliteración, que modifica los pesos para eliminar respuestas de rechazo consideradas "falsas" o excesivamente cautelosas.

El modelo fue publicado en HuggingFace en agosto de 2026, aunque su creador indica que fue creado en junio de ese mismo año. Actualmente está archivado, ya que fue superado por enfoques posteriores, y se mantiene disponible únicamente para análisis forense de entrenamiento y "arqueología" de técnicas de fusión. Con cero descargas y cero likes, no ha tenido adopción práctica, lo que refuerza su carácter de experimento técnico más que de herramienta productiva.

A pesar de su estado archivado, el modelo resulta relevante para investigadores interesados en la interacción entre fusión de modelos (SLERP) y abliteración, así como para estudiar el comportamiento de modelos MoE de gran tamaño cuando se les aplican modificaciones post-entrenamiento. Su licencia "other" y la falta de documentación detallada limitan su uso directo, pero ofrecen un caso de estudio interesante sobre prácticas de publicación en la comunidad open source.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 MoE (según etiqueta `qwen3_moe`) |
| Parametros totales | 30.531.028.992 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repositorio) |
| Idiomas soportados | no disponibles |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura base es Qwen3-30B, que emplea una mezcla de expertos (MoE). El modelo ayni-slerp-abliterated se construyó mediante una fusión SLERP (interpolación lineal esférica) de varias variantes del modelo Ayni, todas derivadas de la misma base Qwen3-30B. Posteriormente se aplicó una técnica de abliteración, que consiste en modificar los pesos de la red para eliminar las activaciones asociadas a respuestas de rechazo o negativa, con el objetivo de reducir los "rechazos falsos" en los que el modelo se niega a responder peticiones legítimas.

No se proporcionan datos sobre el conjunto de datos de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas como RLHF o DPO. La model card solo indica que es la "segunda iteración del enfoque SLERP+abliteration" y que fue archivada por ser superada por métodos posteriores. No hay información sobre innovaciones técnicas adicionales más allá de la combinación de fusión y abliteración.

## Capacidades

- Generación de texto: al derivar de Qwen3-30B, se espera que el modelo conserve capacidades básicas de generación de lenguaje, aunque no hay documentación específica al respecto.
- Razonamiento y código: probablemente hereda las capacidades de la base Qwen3, pero no hay confirmación oficial.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: la abliteración podría permitir respuestas menos restrictivas en temas sensibles, pero no hay datos que lo confirmen.

Debido a la ausencia de documentación y benchmarks, no se puede garantizar ninguna capacidad concreta. Cualquier afirmación sobre el comportamiento del modelo sería especulativa.

## Casos de uso

- Análisis de arqueología de entrenamiento: la model card indica explícitamente que el modelo se subió para "análisis de sonda j-space y arqueología de entrenamiento". Los investigadores pueden estudiar cómo la fusión SLERP y la abliteración afectan a los pesos y a las representaciones internas del modelo.
- Investigación sobre abliteración: sirve como ejemplo de una implementación de abliteración sobre una base MoE, útil para comparar con otras técnicas de eliminación de rechazos.
- Estudio de fusión de modelos: permite analizar el efecto de la interpolación lineal esférica en modelos de gran tamaño, especialmente en combinación con modificaciones post-entrenamiento.
- Pruebas de robustez: los equipos que desarrollan técnicas de alineación pueden usar este modelo para evaluar cómo responde a entradas adversariales o a preguntas delicadas.
- Educación y divulgación: como caso práctico de publicación de modelos experimentales, puede utilizarse en cursos sobre ingeniería de modelos y prácticas de la comunidad open source.
- Reproducibilidad: al estar disponible en safetensors, los investigadores pueden reproducir el proceso de fusión y abliteración para verificar los resultados o explorar variaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se comparan con modelos similares. Por tanto, no es posible evaluar su rendimiento cuantitativo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 30.5B parámetros en FP16, se necesitan aproximadamente 61 GB de VRAM solo para los pesos, más overhead de activaciones y KV cache. En cuantización de 8 bits, se reduce a ~31 GB; en 4 bits, ~15 GB (estimaciones estándar para modelos densos, aunque para MoE puede variar según el número de expertos activos).
- GPU recomendadas: para FP16 se requieren GPUs de clase A100 80GB, H100 u otras con 80 GB o más. Con cuantización de 4 bits podría caber en una RTX 4090 (24 GB) o similar, pero no hay garantías.
- Si cabe en consumer GPU: probablemente solo con cuantización agresiva (4 bits) y a costa de degradación de calidad.
- Opciones de despliegue: al estar en formato safetensors, se puede usar con frameworks como vLLM, llama.cpp (si se convierte a GGUF), Ollama o Transformers. No hay documentación sobre compatibilidad específica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos. Dado que el modelo está archivado y no ha sido evaluado, no es posible establecer comparaciones fiables con alternativas como Qwen3-30B original, otros modelos abliterados (p. ej., Dolphin, Heretic) o fusiones SLERP similares. Se recomienda consultar la documentación de Qwen3-30B para una referencia de rendimiento base, pero sin datos de este modelo concreto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está archivado y fue superado por enfoques posteriores; no se recomienda su uso en producción.
- No hay documentación sobre sesgos, pero al ser un modelo abliterado, es probable que presente respuestas menos filtradas, lo que puede incluir contenido ofensivo o peligroso.
- Riesgo de alucinación: sin benchmarks ni evaluación, no se puede cuantificar, pero es inherente a modelos de este tamaño.
- Limitaciones de contexto e idioma: no especificadas; se desconoce la longitud de contexto y los idiomas soportados.
- Licencia "other": no se especifican los términos exactos, lo que impide conocer si permite uso comercial o modificaciones. Debe contactarse al autor para aclarar.
- El modelo tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- La arquitectura MoE puede requerir ajustes específicos para su despliegue eficiente (p. ej., gestión de memoria para expertos).
- Al ser un experimento, puede contener artefactos de entrenamiento o fusiones que afecten a la coherencia del texto generado.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/HumboldtJoker/ayni-slerp-abliterated)
- [Perfil del autor en HuggingFace](https://huggingface.co/HumboldtJoker)
- [Repositorio de modelos del autor](https://huggingface.co/HumboldtJoker/models)
- [Perfil de GitHub del autor](https://github.com/HumboldtJoker)
- [Guía sobre modelos abliterados (2026)](https://locallyuncensored.com/blog/abliterated-models-guide.html) — referencia general sobre la técnica, no específica de este modelo.
