# quocbao747/Qwen3.8-27B-OBLITERATED-W4A16-24GB

## Resumen

El modelo `quocbao747/Qwen3.8-27B-OBLITERATED-W4A16-24GB` es una variante cuantizada y "abliterada" del modelo base Qwen3.8-27B, desarrollado por el usuario quocbao747. La abliteración consiste en eliminar las capas de rechazo y alineación de seguridad del modelo original, de modo que el modelo responde sin filtros ni restricciones de contenido. La cuantización W4A16 (pesos de 4 bits, activaciones de 16 bits) reduce el tamaño del modelo para que quepa en GPUs con 24 GB de VRAM, como las RTX 3090 o 4090.

El modelo base Qwen3.8-27B es un transformer denso de 27 mil millones de parámetros con atención híbrida: de sus 64 capas, solo 16 usan atención completa (gated attention) y las otras 48 emplean atención lineal. Dispone de una torre de visión, una cabeza de draft MTP (multi-token prediction) para decodificación especulativa, y un contexto nativo de 262 144 tokens, extensible hasta 1 millón. Esta variante hereda todas esas capacidades, pero con la alineación de seguridad eliminada y una cuantización agresiva.

La relevancia de este modelo radica en ofrecer una opción de 27B parámetros ejecutable en hardware de consumo, sin restricciones de contenido, lo que puede interesar a desarrolladores que necesitan un modelo "sin censura" para tareas creativas o de investigación, aunque con las advertencias éticas y legales correspondientes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (16 capas de atención completa, 48 de atención lineal) |
| Parametros totales | 27 000 millones (heredados del modelo base) |
| Parametros activos | Todos (modelo denso) |
| Longitud de contexto | 262 144 tokens nativo, extensible a 1 000 000 (heredado del modelo base) |
| Tipos de cuantizacion | W4A16 (pesos de 4 bits, activaciones de 16 bits) |
| Idiomas soportados | No disponible (el modelo base soporta múltiples idiomas, pero no se especifica para esta variante) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (probablemente safetensors, pero no confirmado) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B, sobre el que se construye esta variante, emplea una arquitectura transformer densa con atención híbrida. De sus 64 capas, solo 16 utilizan atención completa (con un intervalo de atención completa de 4), mientras que las 48 restantes usan atención lineal, lo que reduce el coste computacional en contextos largos. Incluye una torre de visión para procesamiento de imágenes y una cabeza de draft MTP que permite decodificación especulativa para acelerar la generación.

El proceso de abliteración aplicado por el autor de esta variante elimina las capas de rechazo y alineación de seguridad del modelo original, típicamente mediante la edición de pesos o un fine-tuning selectivo. No se dispone de detalles técnicos específicos sobre el método empleado ni sobre los datos de entrenamiento adicionales. La cuantización W4A16 reduce la precisión de los pesos a 4 bits, manteniendo las activaciones en 16 bits, lo que permite un uso eficiente de memoria a costa de una posible degradación en la calidad de las respuestas.

## Capacidades

- Generación de texto libre y creativa sin restricciones de contenido (debido a la abliteración).
- Razonamiento lógico y matemático, heredado del modelo base.
- Generación de código y soporte de tool calling / function calling (capacidad del modelo base).
- Procesamiento de imágenes gracias a la torre de visión integrada en el modelo base.
- Capacidades multilingües (el modelo base soporta varios idiomas, aunque no se detallan para esta variante).
- Decodificación especulativa mediante la cabeza MTP, que acelera la inferencia.

## Casos de uso

- Generación creativa de contenido sin filtros: el modelo puede producir textos narrativos, poesía o guiones sin las restricciones habituales de los modelos alineados, gracias a la abliteración. Es adecuado para proyectos artísticos o de experimentación donde se requiere libertad total de expresión.
- Asistente de programación en entornos controlados: con soporte de tool calling, puede integrarse en pipelines de desarrollo para generar código, revisar fragmentos o autocompletar funciones, siempre que el equipo acepte la ausencia de moderación.
- Razonamiento matemático y lógico: su capacidad para resolver problemas paso a paso lo hace útil en aplicaciones educativas o de análisis, aunque la cuantización puede afectar ligeramente la precisión en tareas complejas.
- Análisis de imágenes con descripción libre: al conservar la torre de visión, puede describir imágenes o responder preguntas visuales, útil en sistemas de accesibilidad o etiquetado automático.
- Investigación en seguridad y alineación: los investigadores pueden estudiar el comportamiento de un modelo sin alineación para comparar con versiones alineadas, siempre en entornos aislados.
- Despliegue en hardware de consumo: al caber en 24 GB de VRAM, puede ejecutarse en GPUs como RTX 3090 o 4090, lo que permite prototipado rápido en estaciones de trabajo sin acceso a clústeres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta variante cuantizada y abliterada. El modelo base Qwen3.8-27B cuenta con evaluaciones en tareas como MathVision, pero no se dispone de los valores numéricos en la información proporcionada. Se recomienda consultar la documentación del modelo base para obtener referencias de rendimiento, teniendo en cuenta que la cuantización W4A16 y la abliteración pueden alterar los resultados.

## Requisitos de hardware

- VRAM estimada: 24 GB (según el nombre del modelo), lo que permite ejecutarlo en GPUs de consumo con 24 GB de memoria.
- GPUs recomendadas: NVIDIA RTX 3090, RTX 4090, A5000, A6000 o similares con 24 GB de VRAM.
- No cabe en GPUs con menos de 24 GB, como RTX 3080 (10 GB) o RTX 4070 (12 GB).
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (Text Generation Inference) y otros frameworks compatibles con cuantización W4A16.
- Latencia y throughput: no disponibles. La decodificación especulativa del modelo base podría mejorar la velocidad, pero no se han publicado mediciones para esta variante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Abliterado |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K (extensible a 1M) | Original (BF16) | Apache 2.0 | No |
| quocbao747/Qwen3.8-27B-OBLITERATED-W4A16-24GB | 27B | 262K (extensible a 1M) | W4A16 | Apache 2.0 | Sí |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27B | 262K (extensible a 1M) | No especificada | Apache 2.0 | Sí |

La comparativa se basa en características generales, ya que no se dispone de datos de rendimiento para la variante analizada. El modelo base ofrece mayor precisión sin cuantización, mientras que las versiones abliteradas eliminan las restricciones de seguridad. La variante de huihui-ai es otra opción abliterada, pero no se especifica su formato de cuantización.

## Limitaciones y advertencias

- Al ser un modelo abliterado, puede generar contenido ofensivo, violento, sexual o ilegal sin ningún filtro. Su uso en aplicaciones públicas o comerciales conlleva riesgos legales y éticos significativos.
- La cuantización W4A16 puede degradar la calidad de las respuestas en tareas que requieren alta precisión, como matemáticas avanzadas o razonamiento complejo.
- No se dispone de información sobre el proceso de abliteración ni sobre posibles sesgos introducidos durante el mismo.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado por el modelo puede no ser apto para todos los públicos.
- No hay garantía de soporte técnico ni de mantenimiento por parte del autor, dado que el modelo tiene cero descargas y cero likes en HuggingFace.
- El contexto de 262K tokens es nativo, pero la cuantización puede afectar al rendimiento en contextos muy largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/quocbao747/Qwen3.8-27B-OBLITERATED-W4A16-24GB
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Documentación de vLLM para Qwen3.8-27B: https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/Qwen3.8-27B.html
- Versión abliterada de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- GGUF de Qwen3.8 27B Obliterated: https://local-ai-zone.github.io/models/qwen3-8-27b-obliterated.html
