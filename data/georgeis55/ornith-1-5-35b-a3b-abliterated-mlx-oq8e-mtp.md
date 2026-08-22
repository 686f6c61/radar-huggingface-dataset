# georgeis55/Ornith-1.5-35B-A3B-Abliterated-MLX-oQ8e-mtp

## Resumen

Ornith-1.5-35B-A3B-Abliterated-MLX-oQ8e-mtp es una cuantización en 8 bits del modelo Ornith-1.5-35B-A3B-Abliterated, realizada por el usuario georgeis55 mediante la herramienta oQ (oMLX v0.6.3rc2). El modelo base pertenece a la familia Ornith-1.5 desarrollada por Ornith AI, que se presenta como un avance hacia la construcción de modelos fundacionales mediante auto-mejora de extremo a extremo, extendiendo el marco de auto-andamiaje (self-scaffolding) introducido en Ornith-1.0. Esta versión concreta está diseñada para ejecutarse en hardware Apple Silicon a través de MLX, ofreciendo una alternativa cuantizada de alta precisión (8 bits) para uso local.

La arquitectura subyacente es un modelo de mezcla de expertos (MoE) con 35 mil millones de parámetros totales y 3 mil millones activos, basado en la arquitectura qwen3_5_moe. El repositorio contiene los pesos en formato MLX safetensors, con un tamaño total de 37,3 GB. Al estar abliterado, se han eliminado las capas de rechazo o alineación, lo que puede alterar el comportamiento del modelo en términos de seguridad y sesgo. Es una opción relevante para desarrolladores que necesitan ejecutar un modelo MoE de gran tamaño en entornos con memoria unificada de Apple, manteniendo una fidelidad razonable gracias a la cuantización mixta de 8 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (qwen3_5_moe) |
| Parametros totales | 35B (MoE) según especificación del modelo original; el archivo safetensors contiene ~9,88B parámetros cuantizados |
| Parametros activos | 3B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (oQ8e, group size 64) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un MoE con 35B parámetros totales y 3B activos, construido sobre la arquitectura qwen3_5_moe. Según la información de Ornith AI, el entrenamiento se basa en un proceso de auto-mejora de extremo a extremo: el modelo propone nuevas tareas, genera andamiajes específicos para cada tarea y produce rollouts de soluciones. Este enfoque extiende el marco de auto-andamiaje de Ornith-1.0 hacia un bucle completo de auto-mejora. No se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO.

La versión aquí presentada ha sido sometida a un proceso de "abliteración" (eliminación de capas de rechazo o alineación), lo que modifica el comportamiento del modelo respecto al original. Posteriormente, se ha cuantizado a 8 bits con la herramienta oQ de oMLX, utilizando un tamaño de grupo de 64 y formato MLX safetensors. La cuantización mixta permite mantener una buena precisión en las capas críticas mientras se reduce el uso de memoria.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Qwen3.5 MoE.
- Capacidad de auto-mejora y auto-andamiaje, según la filosofía de Ornith-1.5, aunque esta funcionalidad puede verse afectada por la abliteración y la cuantización.
- Soporte de tool calling y function calling: no se especifica en la información disponible, pero es probable que el modelo base los herede de la arquitectura Qwen3.5.
- Capacidades multilingües: no se especifican, aunque Qwen3.5 suele ser multilingüe.
- No se mencionan capacidades de visión, audio u otras modalidades.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y la cuantización de 8 bits permiten ejecutar el modelo en Mac con memoria unificada suficiente, ideal para prototipado y desarrollo sin depender de la nube.
- Experimentación con modelos MoE abliterados: investigadores que estudian el impacto de eliminar capas de alineación pueden usar esta versión para análisis comparativos.
- Desarrollo de agentes conversacionales: el modelo puede gestionar diálogos multi-turno, aunque el contexto máximo no está documentado, por lo que se recomienda validar su comportamiento en tareas concretas.
- Generación de código en entornos offline: si el modelo base tiene competencias de programación, esta versión cuantizada puede usarse en entornos sin conexión para asistencia de código.
- Evaluación de cuantización mixta: desarrolladores interesados en oQ y MLX pueden usar este repo como referencia para medir la degradación de rendimiento frente a la versión sin cuantizar.
- Investigación en auto-mejora de modelos: la familia Ornith-1.5 es un caso de estudio sobre entrenamiento autónomo, y esta versión permite probar el comportamiento del modelo en tareas de razonamiento sin infraestructura de alto coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 37,3 GB en formato 8-bit. Para cargar el modelo completo en memoria unificada se recomienda un Mac con al menos 48 GB de RAM unificada (idealmente 64 GB para margen).
- GPU compatibles: exclusivamente Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra), ya que MLX solo funciona en ese hardware.
- Opciones de despliegue: MLX (librería nativa de Apple), también se puede usar con herramientas que soporten MLX como llama.cpp (a través de conversión) o vLLM en futuras versiones, aunque no está confirmado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de la misma categoría (MoE de ~35B con 3B activos). Se recomienda consultar benchmarks públicos de Ornith-1.5 o de Qwen3.5 MoE para una evaluación objetiva.

## Limitaciones y advertencias

- El modelo ha sido abliterado, lo que elimina las capas de rechazo o alineación. Esto puede provocar respuestas sin filtros de seguridad, mayor riesgo de contenido inapropiado y comportamiento impredecible en contextos sensibles.
- La cuantización de 8 bits puede degradar ligeramente la calidad de las respuestas en comparación con la versión de precisión completa, especialmente en tareas de razonamiento complejo o matemáticas.
- No se ha documentado la longitud de contexto soportada; se recomienda probar con secuencias cortas y medias antes de usarlo en producción.
- La licencia no está especificada en el repositorio, por lo que no se garantiza su uso comercial. Es necesario contactar con el autor o consultar el modelo original de Ornith AI para aclarar los términos.
- El número de parámetros en el archivo safetensors (9,88B) no coincide con los 35B declarados en el nombre; esto puede deberse a la cuantización o a una estructura parcial, pero conviene verificar la integridad del modelo antes de usarlo.
- No se han publicado benchmarks ni evaluaciones de rendimiento, por lo que las capacidades reales del modelo son inciertas.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/georgeis55/Ornith-1.5-35B-A3B-Abliterated-MLX-oQ8e-mtp
- Modelo original (ornith-ai): https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-MLX
- Web de Ornith AI: https://ornith.ai/
- Herramienta de cuantización oQ: https://github.com/jundot/omlx
