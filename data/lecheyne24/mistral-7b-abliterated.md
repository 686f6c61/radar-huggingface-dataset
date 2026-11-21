# lecheyne24/mistral-7b-abliterated

## Resumen

mistral-7b-abliterated es una versión "abliterated" (sin mecanismos de rechazo) del modelo mistralai/Mistral-7B-Instruct-v0.3, publicada por el usuario lecheyne24 en Hugging Face. Se distribuye únicamente como cuantización GGUF Q4_K_M, empaquetada para su uso con llama.cpp, e incorpora dos ficheros de pesos con nombres distintos que, según la model card, corresponden al mismo build. El objetivo declarado es eliminar la dirección de rechazo del modelo base mediante una técnica de biproyección de norma preservada de rango 1 aplicada a las capas o_proj y down_proj.

El modelo hereda la arquitectura y el entrenamiento del Mistral-7B-Instruct-v0.3 original, un transformer decoder-only de 7.248.023.552 parámetros. La modificación consiste en una edición de pesos post-entrenamiento, no en un reentrenamiento: se interviene sobre las proyecciones de salida de atención y de la MLP para suprimir la dirección de rechazo, con un factor alpha de 1.25 aplicado a todas las capas.

Es relevante para quienes necesitan un modelo de 7B con contexto de 32k tokens, sin filtros de rechazo y ejecutable en hardware de consumo mediante GGUF. No obstante, el repositorio no incluye información sobre licencia, idiomas soportados ni resultados de benchmarks más allá de una prueba cualitativa interna del autor ("plain-answer gauntlet: 7/8").

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Mistral-7B-Instruct-v0.3; no se detalla en la informacion disponible) |
| Parametros totales | 7.248.023.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de ejecucion usa `-c 4096`; el modelo base Mistral-7B-Instruct-v0.3 soporta 32k tokens |
| Tipos de cuantizacion | Q4_K_M (unica publicada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repo | 8.7 GB |
| Modelo base | mistralai/Mistral-7B-Instruct-v0.3 |
| Metodo de edicion | Abliteration: refusal-direction rank-1 norm-preserving biprojection (o_proj + down_proj), alpha 1.25, todas las capas |
| Ficheros | `Mistral-7B-Instruct-v0.3-abliterated.Q4_K_M.gguf`, `mistral-7b-unbound.Q4_K_M.gguf` |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 7.248 millones de parámetros con atención de tipo grouped-query (GQA) y ventana de contexto de 32k tokens en su versión v0.3, entrenado por Mistral AI con datos públicos y ajustado por instrucciones. No se dispone de detalles adicionales sobre la composición del dataset de entrenamiento ni sobre el uso de RLHF o DPO en la información proporcionada.

La innovación técnica del repositorio es la abliteration: se calcula una dirección de rechazo de rango 1 y se proyectan los pesos de salida de atención (o_proj) y de la MLP (down_proj) para eliminar esa componente, preservando la norma de los pesos originales y aplicando un factor alpha de 1.25 en todas las capas. Es una edición de pesos, no un reentrenamiento, por lo que no hay datos nuevos de entrenamiento ni cambios en la arquitectura. El autor reporta un resultado de 7/8 en una prueba cualitativa propia de respuestas directas ("plain-answer gauntlet"), con un fallo en una pregunta de tipo financiero.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del ajuste por instrucciones de Mistral-7B-Instruct-v0.3.
- Razonamiento y respuesta a instrucciones directas, con supresión de las respuestas de rechazo del modelo original.
- Generación de código y matemáticas (capacidades del modelo base; no se aportan métricas en este repositorio).
- Compatibilidad con endpoints compatibles (tag `endpoints_compatible`) y con llama.cpp / llama-server.
- Capacidad de contexto largo teórica de hasta 32k tokens (heredada del modelo base), aunque el ejemplo de la model card arranca con `-c 4096`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.
- Capacidades multilingües: no disponibles (no se documentan idiomas).

## Casos de uso

- Prototipado local sin censura: ejecutar el modelo con llama-server en una máquina de desarrollo para experimentar con prompts que el modelo base rechazaría, gracias a la supresión de la dirección de rechazo.
- Investigación sobre alineación y abliteration: comparar el comportamiento del modelo editado frente a Mistral-7B-Instruct-v0.3 para estudiar cómo afecta la biproyección a las respuestas y a la calidad general.
- Generación de texto creativo sin filtros: redacción de ficción, guiones o contenido narrativo que requiere respuestas directas sin rechazos, aprovechando el ajuste por instrucciones heredado.
- Asistente conversacional local en hardware de consumo: el formato GGUF Q4_K_M permite desplegarlo con llama.cpp en GPU de gama media o incluso en CPU, con contexto configurable.
- Evaluación de cuantizaciones: usar el fichero Q4_K_M como referencia para medir la pérdida de calidad frente a pesos sin cuantizar del modelo base en tareas de razonamiento y código.
- Despliegue en entornos aislados (air-gapped): al ser un único fichero GGUF y no requerir servicios externos, encaja en pipelines offline de generación de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye una prueba cualitativa interna del autor ("plain-answer gauntlet: 7/8"), sin detallar el conjunto de preguntas ni la metodología, por lo que no constituye un benchmark reproducible.

## Requisitos de hardware

- VRAM estimada para Q4_K_M: en torno a 4,5-5 GB para los pesos, más overhead de contexto KV cache (el repo ocupa 8,7 GB e incluye dos ficheros GGUF).
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090); en datacenter, A100 o H100 para mayor throughput y contexto largo.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM; también puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp / llama-server (soporte nativo, indicado en la model card), Ollama (importando el GGUF), y otros runners compatibles con GGUF. vLLM y TGI no están indicados en la información disponible.
- Latencia y throughput: no disponibles (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mistral-7b-abliterated (este) | 7,25B | no disponible (base: 32k) | GGUF Q4_K_M | no disponible | Abliterated sobre Mistral-7B-Instruct-v0.3 |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25B | 32k | safetensors, GGUF | Apache 2.0 (modelo base) | Modelo original con rechazos alineados |
| Otras variantes abliterated de Mistral-7B | ~7,25B | variable | safetensors, GGUF | variable segun autor | Múltiples builds comunitarios; no se dispone de datos concretos en esta busqueda |

No se dispone de datos de rendimiento comparado en la información proporcionada.

## Limitaciones y advertencias

- La abliteration elimina los rechazos, pero no garantiza calidad ni seguridad: el modelo puede producir contenido dañino, ilegal o inexacto sin filtros.
- Riesgo de alucinación propio de un modelo de 7B, agravado por la edición de pesos, que puede degradar capacidades del modelo base.
- El autor reporta un fallo en su prueba cualitativa (7/8), lo que sugiere que la edición puede afectar a la precisión en algunas tareas.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. El modelo base es Apache 2.0, pero la licencia de esta derivada no se declara.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe fiable.
- Contexto efectivo no verificado: aunque el modelo base soporta 32k, el ejemplo de la model card usa 4096 y no se documenta el comportamiento con ventanas largas tras la edición.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de robustez en producción.
- Dos ficheros GGUF con nombres distintos en el mismo repo: conviene verificar que son idénticos antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/lecheyne24/mistral-7b-abliterated
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- llama.cpp: https://github.com/ggerganov/llama.cpp
