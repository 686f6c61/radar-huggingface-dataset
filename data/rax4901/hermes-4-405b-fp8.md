# rax4901/Hermes-4-405B-FP8

## Resumen

Hermes-4-405B-FP8 es una versión cuantizada a FP8 del modelo Hermes 4 405B, un ajuste fino (finetune) de instrucciones y razonamiento desarrollado por Nous Research sobre la base de Llama-3.1-405B de Meta. La ficha de Hugging Face analizada corresponde al repositorio `rax4901/Hermes-4-405B-FP8`, una reproducción del modelo original en formato comprimido para facilitar su despliegue. El modelo resuelve el problema de disponer de un asistente conversacional de gran escala con modo de razonamiento híbrido, capacidades de llamada a herramientas y salidas estructuradas en JSON, manteniendo una alineación neutra y una baja tasa de rechazos.

Arquitectura transformer densa con 405.853.388.800 parámetros totales (405,8 mil millones), heredada íntegramente de Llama-3.1-405B. La longitud de contexto no se declara explícitamente en la información disponible, aunque al derivar de Llama-3.1-405B es previsible que conserve la ventana nativa de 128.000 tokens de la base; este dato debe confirmarse en la documentación del modelo original. El modelo está entrenado principalmente en inglés y su licencia es Llama 3 (llama3), con las restricciones de uso comercial que esta implica.

Su relevancia actual radica en que combina un corpus de post-entrenamiento mucho mayor que Hermes 3 (de 1 millón de muestras y 1.200 millones de tokens a aproximadamente 5 millones de muestras y 60.000 millones de tokens), un modo de razonamiento explícito con etiquetas `<think>...</think>` y soporte nativo de function calling y salidas estructuradas. La versión FP8 reduce el peso del repositorio a 410,1 GB, lo que la hace más manejable en infraestructura con GPUs de 80 GB, aunque sigue siendo un modelo de gran escala que requiere despliegue multi-GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer densa (derivada de Llama-3.1-405B) |
| Parametros totales | 405.853.388.800 (405,8 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (la base Llama-3.1-405B soporta 128.000 tokens) |
| Tipos de cuantizacion | FP8 (compressed-tensors); el modelo original esta en BF16 |
| Idiomas soportados | Ingles (en) |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y text-generation-inference |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 405,8 mil millones de parámetros construido sobre Llama-3.1-405B. La innovación principal no reside en la arquitectura de la red, sino en el post-entrenamiento: Nous Research amplió el corpus de ajuste de 1 millón de muestras y 1.200 millones de tokens (Hermes 3) a aproximadamente 5 millones de muestras y 60.000 millones de tokens, mezclando datos de razonamiento y de conversación general. Según la model card, este corpus sintetizado enfatiza trazas de razonamiento verificadas y mejoras sustanciales en matemáticas, código, STEM, lógica, creatividad y fidelidad de formato, preservando la calidad de asistente general y una alineación ampliamente neutra. No se detalla en la información disponible si se emplearon RLHF, DPO u otras técnicas de alineación específicas, ni la composición exacta del dataset.

La característica técnica destacable es el modo de razonamiento híbrido: el modelo puede deliberar emitiendo segmentos `<think>...</think>` antes de la respuesta final, y este comportamiento se activa mediante el flag `thinking=True` en la plantilla de chat o mediante un system prompt específico. El modo de razonamiento puede combinarse con definiciones de herramientas, de modo que el modelo intercala llamadas a funciones dentro de su turno de asistente. El formato de prompt es Llama-3-Chat con cabeceras de rol (`<|start_header_id|>`, `<|end_header_id|>`, `<|eot_id|>`). La versión FP8 utiliza el formato compressed-tensors para reducir el peso de los pesos.

## Capacidades

- Generación de texto conversacional multi-turno con formato ChatML/Llama-3-Chat.
- Razonamiento explícito en modo híbrido, con trazas internas delimitadas por `<think>...</think>` y posibilidad de conservarlas con `keep_cots=True`.
- Razonamiento matemático, lógico y STEM, reforzado mediante el corpus de post-entrenamiento ampliado.
- Generación de código y tareas de programación.
- Function calling y tool use: el modelo emite llamadas dentro de etiquetas `<tool_call>{...}</tool_call>`, que son tokens añadidos y por tanto parseables en streaming.
- Soporte de agentes y razonamiento multi-paso, incluyendo la intercalación de llamadas a herramientas dentro del razonamiento.
- Salidas estructuradas: generación de JSON válido para esquemas dados y reparación de objetos malformados.
- Modo JSON y adherencia a esquemas.
- Capacidades de roleplaying y escritura creativa.
- Estabilidad de formato y fidelidad a instrucciones de formato.
- Alineación neutra con baja tasa de rechazos (según la model card, estado del arte en su benchmark RefusalBench).
- Capacidades multilingües limitadas: la model card declara únicamente inglés.

## Casos de uso

- Asistente conversacional de atención al cliente: el modelo puede gestionar conversaciones multi-turno con contexto amplio (heredado de la base Llama-3.1) y mantener un tono neutro y poco restrictivo, adecuado para dominios donde los modelos muy censurados generan fricción.
- Generación de código en producción: su soporte de tool calling con etiquetas parseables en streaming permite integrarlo en pipelines de CI/CD y en asistentes de IDE que invocan funciones del entorno (compiladores, linters, ejecutores de tests).
- Agentes autónomos multi-paso: la combinación de modo de razonamiento y llamadas a herramientas intercaladas permite construir agentes que planifican, invocan APIs y razonan sobre las respuestas dentro de un mismo turno.
- Extracción de datos y salidas estructuradas: el entrenamiento en adherencia a esquemas y reparación de JSON lo hace adecuado para tareas de parsing de documentos, generación de formularios y validación de objetos JSON en backends.
- Asistencia en investigación matemática y STEM: el énfasis del corpus en trazas de razonamiento verificadas lo orienta a resolución de problemas paso a paso y explicación de conceptos técnicos.
- Roleplaying y generación creativa: la model card destaca mejoras en escritura creativa y respuestas subjetivas, útil para motores de narrativa interactiva y personajes conversacionales.
- Evaluación de alineación y estudios de rechazo: al ser un modelo deliberadamente poco restrictivo, sirve como referencia en investigación sobre tasas de rechazo y steerability.

## Benchmarks y rendimiento

La model card incluye una imagen con resultados de benchmarks (Hermes 4 405B) y remite al informe técnico para las tablas completas, pero no se proporcionan cifras numéricas en el texto disponible. El model-index del repositorio declara una entrada sin resultados (`results: []`).

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP8: aproximadamente 406 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica se requiere un nodo multi-GPU.
- Configuración mínima realista: 8 GPU de 80 GB (H100, A100 80GB) para FP8 con tensor parallelism; para la versión BF16 serían necesarias al menos 16 GPU de 80 GB o equivalente.
- No cabe en GPUs de consumo (RTX 4090 de 24 GB, RTX 3090, etc.) ni en configuraciones de una o dos GPU profesionales.
- Opciones de despliegue: vLLM (con parser de herramientas `hermes`), SGLang (parser equivalente), text-generation-inference (el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`), y transformers con compressed-tensors. llama.cpp y Ollama no son viables a esta escala en FP8.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Hermes-4-405B-FP8 (este) | 405,8 mil millones | No disponible (base 128k) | llama3 | Hugging Face, 46 descargas | FP8, modo razonamiento híbrido, tool calling |
| Hermes 4 405B (BF16, NousResearch) | 405,8 mil millones | No disponible (base 128k) | llama3 | Hugging Face | Version original sin cuantizar |
| Llama-3.1-405B (Meta) | 405 mil millones | 128.000 tokens | llama3 | Hugging Face | Modelo base, sin ajuste de razonamiento ni tool calling nativo |
| Hermes 3 405B (Nous Research) | 405 mil millones | No disponible | llama3 | Hugging Face | Predecesor, corpus de post-entrenamiento mucho menor |

La comparación con alternativas de otros desarrolladores del mismo tamaño (por ejemplo, modelos densos de ~400B) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Idioma: la model card declara únicamente inglés; el rendimiento en castellano no está garantizado ni documentado.
- Alineación neutra y baja tasa de rechazo: el modelo está diseñado para ser poco restrictivo, lo que implica un mayor riesgo de generar contenido inapropiado o dañino si no se aplican salvaguardas externas.
- Riesgo de alucinación: como todo modelo generativo de gran escala, puede producir afirmaciones falsas con aparente seguridad, especialmente en modo de razonamiento extenso.
- Licencia llama3: el uso comercial está sujeto a la Llama 3 Community License, con restricciones (por ejemplo, umbral de usuarios activos mensuales y obligaciones de atribución); debe revisarse antes de un despliegue en producción.
- Longitud de contexto no confirmada en esta ficha: aunque la base Llama-3.1-405B soporta 128.000 tokens, no se documenta explícitamente en la información disponible para este finetune.
- Requisitos de hardware extremos: 410,1 GB de repositorio y ~406 GB de pesos en FP8 hacen inviable el despliegue en infraestructura pequeña.
- Repositorio de terceros: el modelo analizado es una reproducción alojada por el usuario `rax4901`, no el repositorio oficial de Nous Research; conviene verificar la integridad de los pesos frente al original BF16.
- Fecha de creación futura (2026-10-27) en los metadatos: dato anómalo que sugiere posible error de registro; no afecta al contenido técnico pero debe tenerse en cuenta.
- Sin benchmarks numéricos publicados en la información disponible: no es posible validar cuantitativamente el rendimiento frente a alternativas.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/rax4901/Hermes-4-405B-FP8
- Modelo original BF16 (Nous Research): https://huggingface.co/NousResearch/Hermes-4-405B
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3.1-405B
- Informe técnico de Hermes 4: https://arxiv.org/abs/2508.18255
- Nous Chat: https://chat.nousresearch.com
