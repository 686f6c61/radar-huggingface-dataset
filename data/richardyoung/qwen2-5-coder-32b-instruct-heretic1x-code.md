# richardyoung/Qwen2.5-Coder-32B-Instruct-heretic1x-code

## Resumen

Qwen2.5-Coder-32B-Instruct-heretic1x-code es un ajuste fino (fine-tune) del modelo Qwen/Qwen2.5-Coder-32B-Instruct, publicado por el usuario richardyoung en Hugging Face. Se trata de una variante "abliterated" o "decensored" generada con la técnica Heretic 1.x, cuyo objetivo es eliminar los mecanismos de rechazo y alineación de seguridad del modelo original sin recurrir a un reentrenamiento completo. El modelo conserva la arquitectura y los pesos base de Qwen2.5-Coder-32B-Instruct, por lo que mantiene sus capacidades de generación de código, razonamiento y conversación.

El modelo resuelve un problema muy concreto: disponer de un modelo de código de 32B parámetros sin las restricciones de contenido del modelo original, orientado a investigación sobre alineación, interpretabilidad y comportamiento de modelos abliterated. No está pensado como un modelo de producción generalista, sino como una herramienta de estudio para quienes necesitan analizar cómo se comporta un modelo de código cuando se eliminan sus capas de rechazo.

Con 32.763.876.352 parámetros reales (según safetensors), un repositorio de 65,6 GB y licencia Apache 2.0, es relevante ahora porque la familia Qwen2.5-Coder se ha consolidado como referencia en modelos de código abiertos, y las variantes abliterated permiten a investigadores comparar comportamientos alineados frente a no alineados sobre la misma base. El acceso está restringido (gated): requiere aceptar condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), basado en Qwen2.5-Coder-32B-Instruct |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-Coder-32B-Instruct, no confirmada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no listadas en el repo) |
| Idiomas soportados | en (ingles, segun tag del modelo) |
| Licencia | apache-2.0 (el modelo declara ademas openrail++ en tags; acceso gated) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-32B-Instruct, un transformer decoder-only de la familia Qwen2 con 32.763.876.352 parámetros. Sobre esa base se aplica la técnica Heretic 1.x, un procedimiento de "abliteration" que modifica selectivamente las direcciones de activación asociadas a los comportamientos de rechazo, sin necesidad de un fine-tune supervisado completo ni de RLHF adicional. El resultado es un modelo que conserva la mayor parte de las capacidades del original pero elimina las respuestas de negativa ante contenido considerado sensible.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de abliteration ni si hubo etapas de DPO o RLHF en este ajuste concreto. Tampoco se documentan innovaciones técnicas adicionales más allá de la propia metodología Heretic 1.x. Los detalles del proceso de entrenamiento del modelo base (Qwen2.5-Coder-32B-Instruct) no se incluyen en la información proporcionada.

## Capacidades

- Generación de texto y código: hereda las capacidades del modelo base Qwen2.5-Coder-32B-Instruct para completar, explicar y refactorizar código en múltiples lenguajes de programación.
- Razonamiento y matemáticas: mantiene las habilidades del modelo base en tareas de razonamiento paso a paso y resolución de problemas matemáticos.
- Conversación multi-turno: formato instruct, adecuado para diálogos con historial.
- Comportamiento "decensored": ausencia de rechazos ante solicitudes que el modelo original bloquearía, lo que lo hace útil para investigación sobre alineación.
- Soporte de tool calling / function calling: presumiblemente heredado del modelo base, aunque no se documenta explícitamente en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas explícitamente en la información proporcionada.
- Capacidades multilingües: el tag de idioma indica únicamente inglés ("en"); no se confirman otros idiomas.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo cambia el comportamiento de un modelo de código al eliminar sus capas de rechazo, comparándolo directamente con Qwen2.5-Coder-32B-Instruct sobre los mismos prompts.
- Análisis de robustez de filtros: útil para evaluar si los sistemas de moderación externos detectan contenido generado por modelos abliterated, y para diseñar defensas en pipelines de producción.
- Generación de código sin restricciones en entornos controlados: en laboratorios o sandboxes donde se necesita que el modelo no rechace solicitudes legítimas de código sensible (por ejemplo, análisis de malware con fines defensivos).
- Estudio de interpretabilidad: analizar las direcciones de activación modificadas por Heretic 1.x para entender qué representaciones internas codifican el rechazo.
- Evaluación comparativa de modelos: servir como contrapunto no alineado en benchmarks de comportamiento, útil para papers sobre abliteration.
- Docencia e investigación académica: experimentos sobre sesgos, seguridad y comportamiento de LLMs en entornos de investigación con acceso controlado.
- Pruebas de red teaming: generar prompts y respuestas adversarias para entrenar clasificadores de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16/BF16, aproximadamente 65,5 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 80 GB de VRAM.
- En cuantización de 8 bits: aproximadamente 33 GB de VRAM.
- En cuantización de 4 bits: aproximadamente 17-20 GB de VRAM, lo que lo hace viable en GPUs consumer de gama alta.
- GPU recomendadas: A100 80GB, H100 80GB, H200 para FP16; RTX 4090 (24 GB) solo con cuantización de 4 bits y contexto limitado; múltiples RTX 3090/4090 en paralelo para FP16.
- Cabe en consumer GPU: sí, únicamente con cuantización agresiva (4 bits) en RTX 4090, RTX 3090 o similares con 24 GB de VRAM.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), vLLM, llama.cpp/Ollama si se generan cuantizaciones GGUF (no incluidas en el repo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| richardyoung/Qwen2.5-Coder-32B-Instruct-heretic1x-code | 32,76B | no disponible | apache-2.0 | Gated | Variante abliterated con Heretic 1.x |
| Qwen/Qwen2.5-Coder-32B-Instruct | 32,76B | no disponible en la informacion | apache-2.0 | Abierto | Modelo base alineado, con rechazos |
| Otras variantes abliterated de Qwen2.5-Coder | no disponible | no disponible | variable | variable | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de esta variante frente a su modelo base u otras alternativas.

## Limitaciones y advertencias

- Modelo "decensored": elimina los rechazos de seguridad del modelo original, por lo que puede generar contenido sensible, ofensivo o peligroso. No apto para aplicaciones de cara al público sin moderación externa.
- Riesgo de alucinación: heredado del modelo base; la abliteration no corrige ni agrava necesariamente este comportamiento, pero no hay evaluación disponible.
- Idiomas: el tag indica únicamente inglés; el rendimiento en castellano no está verificado.
- Licencia: aunque el repo declara apache-2.0, los tags incluyen openrail++ y el acceso es gated; conviene revisar las condiciones exactas antes de uso comercial.
- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que limita su uso en pipelines automatizados.
- Contexto: no se documenta la longitud de contexto efectiva de esta variante; se asume la del modelo base, pero no está confirmada.
- Sin benchmarks publicados: no hay evidencia de que la abliteration no haya degradado capacidades de código o razonamiento.
- Uso responsable: recomendado exclusivamente para investigación, red teaming y análisis de seguridad en entornos controlados.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-Coder-32B-Instruct-heretic1x-code
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct
- No se han encontrado otros enlaces relevantes (papers, blogs, repos, demos) en la búsqueda web proporcionada.
