# Justbackup/gemma-3-4b-it-abliterated

## Resumen

`Justbackup/gemma-3-4b-it-abliterated` es una versión modificada del modelo multimodal `google/gemma-3-4b-it` de Google, creada mediante la técnica de *abliteration* (eliminación de rechazos). El objetivo es eliminar las respuestas de negativa o censura del modelo original, permitiendo que responda a solicitudes que normalmente rechazaría, manteniendo en lo posible las capacidades generales de generación de texto, razonamiento y comprensión de imágenes. El autor de esta variante es Justbackup, aunque la model card original pertenece a mlabonne, quien desarrolló la técnica aplicada a varios tamaños de Gemma 3 (1B, 4B, 12B y 27B).

El modelo conserva la arquitectura base de Gemma 3 4B IT, con aproximadamente 4.300 millones de parámetros y soporte para entrada de imágenes y texto. La abliteración se aplica de forma selectiva por capas (de la 7 a la 29) con un peso de rechazo simétrico, logrando una alta tasa de aceptación (>90%) sin degradar gravemente la coherencia de las salidas. Es relevante para desarrolladores que necesitan un modelo sin restricciones de contenido para aplicaciones de generación creativa, simulación de personajes o investigación sobre seguridad y alineación, aunque con las advertencias propias de este tipo de modificaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (imagen-texto), basada en Gemma 3 4B IT |
| Parametros totales | 4.300.079.472 (4,3 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, se recomienda consultar la documentación de Gemma 3) |
| Tipos de cuantizacion | no disponible en este repositorio; existe una versión GGUF del modelo original de mlabonne |
| Idiomas soportados | no disponible (el modelo base Gemma 3 soporta múltiples idiomas, pero no se detallan aquí) |
| Licencia | Gemma (licencia de Google, permite uso comercial con restricciones) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-4b-it`, un transformer multimodal entrenado por Google que acepta tanto texto como imágenes como entrada. La modificación principal es la *abliteration* por capas: se calcula una "dirección de rechazo" comparando los estados ocultos (hidden states) entre muestras dañinas y muestras inofensivas, y luego se elimina esa dirección de los residual streams de las capas 7 a 29. El peso de rechazo aplicado sigue un patrón simétrico que va de 0,05 hasta un pico de 0,55, lo que permite reducir drásticamente las respuestas de negativa sin destruir las capacidades generales del modelo.

No se ha realizado ningún entrenamiento adicional sobre el modelo base; la abliteración es una intervención sobre los pesos ya entrenados. Según la model card, el autor experimentó con varias recetas y observó que Gemma 3 es más resistente a la abliteración que otros modelos como Qwen 2.5, por lo que fue necesario un enfoque específico. El resultado es una tasa de aceptación superior al 90% en prompts que normalmente provocarían un rechazo, manteniendo salidas coherentes, aunque ocasionalmente se pueden observar errores gramaticales menores (por ejemplo, "It' my" en lugar de "It's my").

## Capacidades

- Generación de texto libre y conversacional, con menor probabilidad de rechazo ante solicitudes controvertidas o explícitas.
- Razonamiento y resolución de problemas básicos, heredados del modelo base Gemma 3.
- Comprensión de imágenes (entrada multimodal), ya que el modelo base soporta image-text-to-text.
- Generación de código y asistencia en programación, aunque sin garantías de calidad tras la abliteración.
- Soporte de tool calling y function calling: no confirmado explícitamente, pero el modelo base Gemma 3 4B IT sí lo incluye; se recomienda verificar en la documentación original.
- Capacidades multilingües: no especificadas, pero Gemma 3 soporta múltiples idiomas; la abliteración no debería afectar a esta característica.

## Casos de uso

- Escritura creativa sin restricciones: el modelo puede generar relatos, diálogos o guiones con temáticas adultas o controvertidas que otros modelos censurarían. Es adecuado para proyectos de ficción interactiva o juegos de rol.
- Simulación de personajes y roleplay: al eliminar los rechazos, el modelo puede interpretar personajes con personalidades extremas o responder a situaciones límite, útil en entornos de entretenimiento o investigación narrativa.
- Investigación sobre alineación y seguridad: permite estudiar cómo se comporta un modelo sin mecanismos de rechazo, comparando sus respuestas con las del modelo original para entender los efectos de la alineación.
- Generación de contenido para pruebas de estrés: se puede usar para generar prompts o respuestas que evalúen los límites de otros sistemas de moderación o filtros de contenido.
- Asistente conversacional para nichos específicos: en comunidades que requieren respuestas sin filtros (por ejemplo, debates filosóficos sobre temas tabú), el modelo puede ofrecer perspectivas que otros modelos evitan.
- Desarrollo de agentes con personalidad: al no rechazar instrucciones, el modelo puede integrarse en pipelines de agentes donde se necesita una obediencia más literal, aunque con supervisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de rendimiento en tareas estándar como MMLU, HumanEval o GSM8K, y tampoco se proporcionan comparaciones cuantitativas con el modelo base. La única métrica mencionada es la tasa de aceptación (>90%) en prompts que normalmente provocarían un rechazo, pero no se detalla la metodología ni el conjunto de datos utilizado.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.300 millones de parámetros, en precisión FP16 se requieren aproximadamente 8,6 GB de VRAM. Con cuantización de 4 bits (si se utiliza una versión GGUF o GPTQ), la demanda baja a unos 2,5-3 GB.
- GPU recomendadas: para FP16, una GPU con al menos 10-12 GB de VRAM (por ejemplo, RTX 3080, RTX 4080, A10). Para cuantización 4-bit, una GPU de 6 GB (RTX 3060, RTX 4060) puede ser suficiente.
- En consumer GPU: sí, cabe en GPUs de gama media-alta con cuantización. Sin cuantizar, requiere una GPU de gama alta o profesional.
- Opciones de despliegue: compatible con transformers, vLLM, TGI (text-generation-inference), llama.cpp y Ollama (si se convierte a GGUF). El repositorio original de mlabonne ofrece una versión GGUF.
- Latencia y throughput: no se han publicado datos específicos. En una GPU moderna, se espera una generación de 20-40 tokens por segundo en FP16, y algo más con cuantización, pero son estimaciones generales no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| google/gemma-3-4b-it (base) | 4,3 B | 128k (según documentación oficial) | Gemma | Modelo original con rechazos y alineación estándar |
| Justbackup/gemma-3-4b-it-abliterated | 4,3 B | no disponible | Gemma | Versión sin rechazos, misma arquitectura |
| mlabonne/gemma-3-4b-it-abliterated | 4,3 B | no disponible | Gemma | Versión original del mismo proceso, con GGUF disponible |
| huihui-ai/gemma-3-4b-it-abliterated | 4,3 B | no disponible | Gemma | Otra versión abliterated del mismo modelo base |

La comparativa se limita a variantes del mismo modelo base; no se dispone de datos de rendimiento para establecer diferencias cuantitativas. La principal diferencia entre estas versiones es el método exacto de abliteración y la disponibilidad de formatos adicionales (GGUF).

## Limitaciones y advertencias

- La abliteración elimina los mecanismos de rechazo, lo que puede provocar que el modelo genere contenido dañino, ilegal o éticamente problemático. No debe usarse en producción sin supervisión humana y filtros adicionales.
- Se han observado errores gramaticales ocasionales y salidas incoherentes, como se indica en la model card ("It' my" en lugar de "It's my"). La calidad general puede ser inferior al modelo base.
- No se han publicado evaluaciones exhaustivas de sesgos o alucinaciones. Es probable que herede los sesgos del modelo base, y la abliteración podría amplificarlos al no filtrar respuestas.
- La licencia Gemma permite uso comercial, pero con restricciones: no se pueden utilizar los modelos para ciertos fines prohibidos (por ejemplo, vigilancia masiva, generación de contenido ilegal) y se requiere atribución. Consulte los términos completos de la licencia.
- El modelo es experimental: el propio autor advierte que "es bastante experimental" y que los resultados pueden no ser tan buenos como se espera.
- No se proporciona información sobre la longitud de contexto real tras la abliteración; se recomienda asumir la misma que el modelo base, pero sin garantías.
- No se han publicado benchmarks de rendimiento, por lo que no es posible comparar objetivamente sus capacidades con otros modelos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Justbackup/gemma-3-4b-it-abliterated
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Artículo sobre abliteration: https://huggingface.co/blog/mlabonne/abliteration
- Repositorio de referencia de Sumandora: https://github.com/Sumandora/remove-refusals-with-transformers/
- Versión GGUF (de mlabonne): https://huggingface.co/mlabonne/gemma-3-4b-it-abliterated-GGUF
- Otras versiones abliterated de mlabonne: https://huggingface.co/mlabonne/gemma-3-1b-it-abliterated, https://huggingface.co/mlabonne/gemma-3-12b-it-abliterated, https://huggingface.co/mlabonne/gemma-3-27b-it-abliterated
