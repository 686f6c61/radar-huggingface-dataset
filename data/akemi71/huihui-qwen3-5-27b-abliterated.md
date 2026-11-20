# Akemi71/Huihui-Qwen3.5-27B-abliterated

## Resumen

Huihui-Qwen3.5-27B-abliterated es una variante "abliterated" (sin mecanismos de rechazo) del modelo Qwen/Qwen3.5-27B, publicada por el usuario Akemi71 en Hugging Face. La model card atribuye el trabajo original a huihui-ai y describe el proceso como una implementación "cruda" y de prueba de concepto para eliminar las negativas del modelo mediante técnicas de abliteración, sin emplear TransformerLens. El modelo conserva la arquitectura y los pesos del modelo base, pero modifica las direcciones de activación asociadas a la negativa a responder.

El modelo base Qwen3.5-27B es un transformer multimodal de tipo image-text-to-text con aproximadamente 27.781 millones de parámetros (27,78 B), según los datos reales de safetensors. El repositorio ocupa 55,6 GB en formato safetensors y se distribuye bajo licencia Apache 2.0. La relevancia actual radica en que ofrece una alternativa sin filtrado de seguridad sobre un modelo multimodal de gran tamaño, lo que interesa a investigadores que estudian alineación, robustez y comportamiento de modelos abliterated.

No obstante, se trata de un modelo con cero descargas y cero likes en el momento de la consulta, sin información publicada sobre idiomas soportados, datos de entrenamiento, benchmarks ni detalles técnicos adicionales más allá de los metadatos del repositorio. La ficha refleja esta escasez de información de forma explícita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basada en Qwen3.5-27B |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; se menciona uso via Ollama) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-27B, un transformer multimodal con pipeline image-text-to-text, según los metadatos del repositorio. La modificación respecto al modelo base consiste en una abliteración: una intervención sobre las activaciones internas para eliminar la dirección asociada a la negativa a responder, descrita por el autor original como una implementación de prueba de concepto sin TransformerLens. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO en el modelo base.

Tampoco se detallan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) ni la metodología exacta de la abliteración aplicada. La model card únicamente remite al repositorio remove-refusals-with-transformers para comprender el procedimiento general.

## Capacidades

- Generación de texto conversacional, según la etiqueta "conversational" del repositorio.
- Procesamiento conjunto de imagen y texto (pipeline image-text-to-text), heredado del modelo base Qwen3.5-27B.
- Comportamiento sin filtrado de rechazo: el modelo está diseñado para no negarse a responder peticiones que el modelo base rechazaría.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Capacidades especiales (modo thinking, audio, etc.): no disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo la abliteración afecta a la distribución de respuestas y a la tasa de rechazo en comparación con el modelo base, en entornos controlados de laboratorio.
- Análisis de robustez de filtros de seguridad: útil para evaluar si los mecanismos de moderación externos (clasificadores, guardrails) detectan contenido que el modelo abliterated genera sin restricción.
- Experimentos de red-teaming: sirve como modelo objetivo para probar pipelines de evaluación de riesgos y para calibrar sistemas de detección de contenido sensible.
- Evaluación comparativa de modelos multimodales: al conservar la entrada image-text, permite comparar el comportamiento del modelo base frente a la variante abliterated en tareas de descripción de imágenes y razonamiento visual.
- Pruebas de despliegue con Ollama: la model card indica que puede ejecutarse con `ollama run huihui_ai/qwen3.5-abliterated` (versión v0.17.5 o superior), lo que facilita experimentación local en entornos de investigación.
- Estudio de sesgos y toxicidad: útil para medir la prevalencia de contenido sesgado o inapropiado cuando se eliminan las negativas, como paso previo al diseño de mitigaciones.
- Docencia y formación en IA: como ejemplo práctico de técnicas de abliteración y de sus implicaciones éticas y legales en un entorno académico controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27,78 B de parámetros, en FP16 se requieren aproximadamente 55,6 GB (tamaño del repo); en cuantización de 8 bits, en torno a 28 GB; en 4 bits, alrededor de 14-16 GB (estimaciones orientativas, no confirmadas por el autor).
- GPU recomendadas: para FP16, GPU con 80 GB (A100, H100); para cuantizaciones de 8 bits, A100 40 GB o H100; para 4 bits, RTX 4090 (24 GB) o A6000 (48 GB).
- ¿Cabe en GPU de consumo? En cuantización de 4 bits es plausible en RTX 4090 y GPUs con 24 GB o más; en FP16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: transformers (librería indicada en el repo), Ollama (v0.17.5 o superior, según la model card); otras opciones como vLLM, llama.cpp o TGI no están confirmadas en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Estado |
|---|---|---|---|---|---|
| Huihui-Qwen3.5-27B-abliterated (este) | 27,78 B | no disponible | Sí (image-text-to-text) | Apache 2.0 | 0 descargas, 0 likes |
| Qwen/Qwen3.5-27B (base) | 27,78 B (aprox.) | no disponible | Sí | Apache 2.0 | Modelo base oficial |
| Otras variantes abliterated de Qwen | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Filtrado de seguridad reducido: la abliteración elimina los mecanismos de rechazo, por lo que el modelo puede generar contenido sensible, controvertido o inapropiado.
- No apto para todos los públicos: los outputs pueden ser inadecuados para entornos públicos, menores o aplicaciones que requieran alta seguridad.
- Riesgo de alucinación: no cuantificado en la información disponible, pero inherente a los modelos de lenguaje de gran tamaño.
- Sesgos conocidos: no documentados en la información proporcionada; la eliminación de negativas puede amplificar sesgos presentes en el modelo base.
- Limitaciones de contexto e idioma: no disponibles; no se especifican ni la ventana de contexto ni los idiomas soportados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor recomienda limitar el uso a investigación, pruebas o entornos controlados y evitar el despliegue directo en producción o en aplicaciones comerciales de cara al público.
- Responsabilidad legal y ética: el usuario asume toda la responsabilidad sobre el contenido generado; el autor declina responsabilidad por las consecuencias derivadas del uso.
- Madurez del repositorio: 0 descargas y 0 likes, creado y actualizado el mismo día (2026-11-20), sin validación comunitaria ni benchmarks publicados.
- Recomendación de monitorización: se aconseja revisión manual y monitorización en tiempo real de los outputs.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Akemi71/Huihui-Qwen3.5-27B-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-27B/blob/main/LICENSE
- Repositorio de abliteración de referencia: https://github.com/Sumandora/remove-refusals-with-transformers
- Ollama (release v0.17.5): https://github.com/ollama/ollama/releases/tag/v0.17.5
- Modelo en Ollama: https://ollama.com/huihui_ai/qwen3.5-abliterated
- Ko-fi del autor original: https://ko-fi.com/huihuiai
