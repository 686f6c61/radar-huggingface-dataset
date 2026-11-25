# richardyoung/DeepSeek-R1-0528-Qwen3-8B-heretic

## Resumen

DeepSeek-R1-0528-Qwen3-8B-heretic es una variante "abliterated" (también etiquetada como *uncensored*, *decensored* o *heretic*) del modelo DeepSeek-R1-0528-Qwen3-8B, publicada por el usuario richardyoung en Hugging Face. El modelo base es un *distill* de DeepSeek-R1-0528 sobre la arquitectura Qwen3-8B, desarrollado por DeepSeek, que traslada las capacidades de razonamiento del R1 original a un transformer denso de 8.190 millones de parámetros. La modificación "heretic" consiste en la eliminación o atenuación de los mecanismos de rechazo y alineación de seguridad, de modo que el modelo responde a peticiones que el modelo original declinaría.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de *abliteration* reproducible (el autor incluye la etiqueta `reproducible`) aplicada sobre un modelo de razonamiento reciente; por otro, sirve como referencia de los riesgos y las implicaciones de licencia y seguridad que conlleva distribuir pesos desalineados. Al estar construido sobre Qwen3-8B, hereda un contexto nativo de 32.768 tokens (extensible por configuración) y un formato de pesos safetensors compatible con transformers y text-generation-inference.

El repositorio tiene 16,4 GB, 388 descargas y 0 likes en el momento de la consulta, y su acceso está restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargarlo. La licencia declarada es MIT, aunque la condición de acceso restringido y las condiciones del modelo base deben verificarse antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), decoder-only, con modo de razonamiento |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el base Qwen3-8B declara 32.768 tokens nativos) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no confirmadas) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | MIT (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | safetensors |
| Modelo base | deepseek-ai/DeepSeek-R1-0528-Qwen3-8B |
| Tamano del repositorio | 16,4 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Acceso | gated (restringido) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 8.190 millones de parámetros, correspondiente a la arquitectura Qwen3-8B. El modelo base, DeepSeek-R1-0528-Qwen3-8B, es un *distill*: DeepSeek entrenó un modelo Qwen3-8B para imitar las trayectorias de razonamiento de DeepSeek-R1-0528, de modo que el modelo pequeño reproduce cadenas de pensamiento largas antes de emitir la respuesta final. No se dispone de datos sobre el número exacto de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO empleadas en el distill, más allá de lo publicado por DeepSeek en la documentación del modelo base.

La modificación "heretic" es un proceso de *abliteration*: se identifican las direcciones en el espacio de activaciones asociadas a la negativa a responder y se proyectan fuera de los pesos, típicamente mediante edición de matrices de atención y MLP con un conjunto de prompts de calibración. El autor etiqueta el proceso como reproducible, lo que sugiere que publica o documenta la metodología. El resultado es un modelo con la misma arquitectura y tamaño que el base, pero con la distribución de respuestas sesgada hacia la cumplimentación de peticiones. No se han publicado detalles sobre el número de capas intervenidas ni sobre la degradación de capacidades asociada.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento explícito en modo *thinking*: el modelo produce cadenas de pensamiento antes de la respuesta, heredadas del distill de DeepSeek-R1-0528.
- Razonamiento matemático y resolución de problemas de varios pasos.
- Generación y explicación de código.
- Respuesta a peticiones que el modelo base rechazaría, por la eliminación de los mecanismos de negativa (*abliteration*).
- Soporte de *tool calling* / *function calling*: no confirmado explícitamente en la información proporcionada; el base Qwen3 lo soporta, pero la modificación heretic puede haber degradado el formato.
- Capacidades de agente y razonamiento multi-paso: parcialmente heredadas del modo thinking, sin evaluación publicada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión y audio: no soportados (modelo exclusivamente de texto).

## Casos de uso

- Investigación sobre alineación y *red teaming*: el modelo permite estudiar cómo responde un LLM de razonamiento cuando se eliminan sus capas de negativa, comparando sus salidas con las del base para medir el efecto de la abliteration en la calidad del razonamiento.
- Evaluación de robustez de filtros de seguridad: sirve como generador adversario controlado para probar clasificadores de contenido y políticas de moderación en pipelines propios.
- Análisis de cadenas de pensamiento: al conservar el modo thinking, permite extraer y auditar trayectorias de razonamiento en tareas matemáticas y lógicas, útil para investigación en interpretabilidad.
- Generación de código en entornos controlados: con 8.190 millones de parámetros y safetensors, puede desplegarse en una GPU de 24 GB en fp16/bf16 para asistencia de programación en un entorno de desarrollo interno, siempre que se revise la salida.
- Experimentos de destilación y *fine-tuning*: su tamaño lo hace apto como base para *fine-tuning* con LoRA en una sola GPU, por ejemplo para adaptar el estilo de razonamiento a un dominio concreto.
- Prototipado de asistentes conversacionales sin restricciones de contenido: en entornos de simulación o escritura creativa donde se necesita un modelo que no decline peticiones, con supervisión humana obligatoria.
- Docencia y divulgación: ilustrar de forma práctica qué es la abliteration y qué consecuencias tiene sobre el comportamiento de un LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni evaluaciones de seguridad, y no se han encontrado datos del autor en la información proporcionada. Cualquier cifra de rendimiento del modelo base no es trasladable sin verificación, dado que la abliteration puede degradar capacidades.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 16,4 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 20-24 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 9-10 GB de pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 5-6 GB de pesos (requiere generar la cuantización, no confirmada en el repo).
- GPU recomendadas: A100 40/80 GB, H100, L40S para servicio en producción; RTX 4090 (24 GB) para fp16 con contexto limitado; RTX 3090 (24 GB) como alternativa.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 a bf16 con contexto recortado, y en GPUs de 8-12 GB si se cuantiza a 4-8 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`); vLLM, llama.cpp y Ollama no están confirmados para este repo concreto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| richardyoung/DeepSeek-R1-0528-Qwen3-8B-heretic | 8,19 B (denso) | no disponible | MIT | gated | Variante abliterated del distill R1-0528 sobre Qwen3-8B |
| deepseek-ai/DeepSeek-R1-0528-Qwen3-8B | 8,19 B (denso) | no disponible en la informacion | MIT (verificar en el repo base) | abierto | Modelo base alineado, con negativas de seguridad |
| Qwen/Qwen3-8B | ~8 B (denso) | 32.768 nativos (ampliable) | Apache 2.0 | abierto | Modelo original de Qwen, sin destilación de R1 |
| deepseek-ai/DeepSeek-R1-Distill-Llama-8B | ~8 B (denso) | 128 K (configuración Llama 3.1) | MIT | abierto | Alternativa de distill de R1 sobre arquitectura Llama |

La comparación directa de rendimiento no es posible sin benchmarks publicados para la variante heretic; las diferencias principales con el base son la eliminación de negativas y el posible deterioro de capacidades asociado.

## Limitaciones y advertencias

- Modelo desalineado por diseño: la abliteration elimina los mecanismos de rechazo, por lo que puede generar contenido dañino, ilegal o sexualmente explícito. No es apto para aplicaciones de cara al público sin filtros externos.
- Riesgo de alucinación: inherente a los modelos de 8 B con modo thinking; las cadenas de razonamiento largas no garantizan corrección factual.
- Degradación potencial de capacidades: la edición de pesos puede reducir el rendimiento en tareas que dependían de las capas intervenidas; no hay evaluación publicada que lo cuantifique.
- Idiomas soportados no documentados: no se puede garantizar calidad multilingüe más allá del inglés y el chino del modelo base.
- Licencia: se declara MIT, pero el acceso es restringido (gated) y las condiciones del modelo base de DeepSeek deben verificarse; el uso comercial requiere revisión legal propia.
- Sin benchmarks ni evaluaciones de seguridad publicadas: no hay evidencia de calidad ni de tasas de respuesta dañina.
- Repositorio con 0 likes y 388 descargas: sin validación comunitaria; conviene auditar los pesos antes de usarlos.
- El tag `arxiv:2510.18892` sugiere un artículo asociado a la técnica heretic, pero no se ha verificado su contenido en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/DeepSeek-R1-0528-Qwen3-8B-heretic
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-0528-Qwen3-8B
- Referencia de arquitectura Qwen3: https://huggingface.co/Qwen/Qwen3-8B
- Paper de DeepSeek-R1 (arxiv:2501.12948): https://arxiv.org/abs/2501.12948
- Paper referenciado en los tags (arxiv:2406.11717): https://arxiv.org/abs/2406.11717
- Paper referenciado en los tags (arxiv:2510.18892): https://arxiv.org/abs/2510.18892
