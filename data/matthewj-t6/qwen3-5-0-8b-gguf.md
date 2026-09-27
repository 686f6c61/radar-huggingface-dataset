# matthewj-t6/Qwen3.5-0.8B-GGUF

## Resumen

Qwen3.5-0.8B-GGUF es una cuantizacion en formato GGUF del modelo Qwen3.5-0.8B, publicada por el usuario matthewj-t6 y generada con las herramientas de Unsloth (Dynamic 2.0). El modelo original lo desarrolla el equipo Qwen de Alibaba y pertenece a la familia Qwen3.5, orientada a unificar comprension de texto e imagen en una sola base. Con 752.393.024 parametros (0,75B), es la variante mas pequena de la familia y esta pensada, segun la propia model card, para prototipado, ajuste fino especifico de tarea y fines de investigacion o desarrollo.

La relevancia de esta publicacion es practica: convierte un modelo multimodal con 262.144 tokens de contexto nativo en artefactos GGUF que pueden ejecutarse en hardware de consumo mediante llama.cpp, Ollama o LM Studio, algo imposible con los pesos originales en bfloat16 dentro de GPUs modestas. El repo ocupa 14,1 GB, lo que sugiere multiples niveles de cuantizacion, aunque la informacion disponible no detalla los nombres ni los tamanos de cada archivo.

La arquitectura declarada combina Gated Delta Networks (atencion lineal) con Gated Attention clasica en un patron hibrido de 24 capas, e incorpora un codificador de vision para tareas image-text-to-text. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales. El repo no tiene descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal hibrido con vision encoder: Gated DeltaNet (atencion lineal) + Gated Attention, layout 6 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parametros totales | 752.393.024 (0,75B) |
| Parametros activos | no disponible (la familia menciona sparse Mixture-of-Experts, pero la configuracion de expertos de la variante 0.8B no figura en la informacion disponible) |
| Longitud de contexto | 262.144 tokens de forma nativa |
| Tipos de cuantizacion | GGUF con esquema Unsloth Dynamic 2.0; niveles concretos no disponibles |
| Idiomas soportados | 201 idiomas y dialectos segun la model card; el metadata del repo no declara idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo orientado a transformers/llama.cpp) |

Datos estructurales adicionales declarados en la model card: hidden dimension 1024, token embedding 248.320 (padded, atado a la salida LM), 24 capas, FFN con dimension intermedia 3.584. En Gated DeltaNet: 16 cabezas de atencion lineal para V y 16 para QK, dimension de cabeza 128. En Gated Attention: 8 cabezas para Q y 2 para KV, dimension de cabeza 256, dimension de RoPE 64. Entrenado con MTP (multi-token prediction) multi-paso.

## Arquitectura y entrenamiento

El modelo es un transformer causal hibrido. La mayor parte de las capas usa Gated DeltaNet, un mecanismo de atencion lineal con estado recurrente de tamano constante, mientras que una de cada cuatro capas emplea Gated Attention con atencion completa. El patron declarado es 6 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)), es decir, 18 capas lineales y 6 capas de atencion completa sobre un total de 24. Esta mezcla busca reducir el coste de inferencia en contextos largos: solo las 6 capas de atencion completa requieren cache KV que crece con la secuencia, mientras que las lineales mantienen un estado fijo.

El modelo incorpora un codificador de vision, por lo que la model card lo clasifica como causal language model with vision encoder y el pipeline es image-text-to-text. Qwen describe la familia como entrenada con fusion temprana sobre tokens multimodales, con paridad respecto a Qwen3 en razonamiento, codigo y agentes, y con RL escalado en entornos multiagente. La variante 0.8B se distribuye en etapa de pre-entrenamiento y post-entrenamiento segun la ficha, e incluye MTP entrenado en varios pasos, tecnica habitual para decodificacion especulativa.

No se detalla en la informacion disponible el numero total de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas concretas de alineacion como RLHF o DPO, mas alla de la mencion generica a escalado de RL en la familia. El autor de esta publicacion concreta (matthewj-t6) solo aporta la conversion a GGUF mediante Unsloth Dynamic 2.0; no hay indicios de ajuste adicional ni de modificacion de los pesos.

## Capacidades

- Generacion de texto conversacional multi-turno, con el pipeline marcado como conversational en el repo.
- Comprension de imagen y texto combinados (image-text-to-text) gracias al vision encoder declarado.
- Razonamiento en modo thinking y en modo non-thinking: la tabla de benchmarks publicada separa explicitamente ambos modos.
- Generacion de codigo, segun los benchmarks de la familia Qwen3.5 que cubren coding y agentes.
- Capacidades de agente y razonamiento multi-paso, respaldadas por el entrenamiento con RL en entornos multiagente descrito en la model card.
- Soporte multilingue amplio: 201 idiomas y dialectos declarados.
- Multi-token prediction (MTP) entrenado en varios pasos, util para decodificacion especulativa y aceleracion de la generacion.
- Compatibilidad de despliegue con transformers, vLLM, SGLang y KTransformers segun la model card; el formato GGUF anade llama.cpp, Ollama y similares.
- No se menciona soporte explicito de tool calling o function calling en la informacion disponible, aunque la familia se posiciona en escenarios de agentes.

## Casos de uso

- Prototipado de asistentes multimodales en local: con 0,75B de parametros y cuantizacion GGUF, el modelo cabe en un portatil con GPU integrada o CPU, lo que permite validar flujos de imagen + texto sin coste de API ni envio de datos a terceros.
- Extraccion de informacion de capturas y documentos escaneados: el vision encoder permite pasar una imagen con texto y obtener un resumen o campos estructurados, util para automatizar triaje documental en pequenos volumenes.
- Clasificacion y etiquetado de contenido a gran escala: al ser un modelo pequeno, se puede ejecutar en batch sobre miles de elementos con coste bajo, aprovechando el contexto de 262.144 tokens para agrupar muchos ejemplos por llamada.
- Ajuste fino especifico de dominio: la model card indica explicitamente que el uso previsto incluye fine-tuning por tarea; con 0,75B de parametros, un ajuste LoRA cabe en una GPU de consumo de 16-24 GB.
- Base para experimentacion en investigacion sobre arquitecturas hibridas: permite estudiar el comportamiento de Gated DeltaNet combinado con atencion completa y MTP en un modelo de escala reducida.
- Asistente de codigo embebido en IDE o CLI: el modelo puede completar y explicar fragmentos de codigo en local, sin dependencia de red, con latencia baja gracias al reducido numero de parametros.
- Generacion aumentada por recuperacion (RAG) sobre corpus largos: los 262.144 tokens de contexto nativo permiten insertar muchos fragmentos recuperados sin trocear en exceso, reduciendo perdida de contexto.
- Traduccion y atencion al cliente multilingue de bajo coste: los 201 idiomas declarados permiten cubrir mercados diversos con un unico modelo en lugar de varios especializados.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks de la familia Qwen3.5, pero el contenido disponible esta truncado. Los unicos datos legibles corresponden a MMLU-Pro en modo non-thinking:

| Benchmark (MMLU-Pro, non-thinking) | Qwen3-4B-2507 | Qwen3-1.7B | Qwen3.5-2B | Qwen3.5-0.8B |
|---|---|---|---|---|
| MMLU-Pro | 69,6 | 40,2 | 55,3 | 55 (cifra truncada en la informacion disponible) |

El resto de la tabla de benchmarks (otras tareas de lenguaje, codigo, agentes y vision) no esta disponible porque el contenido proporcionado se corta en ese punto. No se han publicado en la informacion disponible resultados de benchmarks adicionales del repo GGUF concreto, ni mediciones de degradacion por cuantizacion.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del numero de parametros y de la configuracion declarada; la informacion proporcionada no incluye requisitos oficiales.

- Pesos en bfloat16: aproximadamente 1,5 GB (752 millones de parametros × 2 bytes). En cuantizacion Q8, en torno a 0,8 GB; en Q4, alrededor de 0,4-0,5 GB; en Q2-Q3, menos de 0,4 GB.
- Cache KV: solo las 6 capas de Gated Attention generan cache creciente. Con 2 cabezas KV y dimension de cabeza 256, son unos 12 KB por token en bfloat16, es decir, aproximadamente 3,1 GB para los 262.144 tokens de contexto completo. Las 18 capas Gated DeltaNet mantienen estado constante y no escalan con la longitud.
- El modelo cabe con holgura en cualquier GPU de consumo actual: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, asi como en GPUs integradas o CPU con memoria suficiente para el nivel de cuantizacion elegido.
- GPU de datacenter (A100, H100) no son necesarias para inferencia; solo tendrian sentido para servir muchas peticiones concurrentes o para reentrenamiento.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF para los archivos del repo; la model card del modelo base menciona ademas Hugging Face Transformers, vLLM, SGLang y KTransformers.
- Latencia y throughput: no disponibles. No se han publicado mediciones para esta cuantizacion concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-Pro (non-thinking) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B (esta cuantizacion GGUF) | 0,75B | 262.144 | 55 (truncado) | Apache 2.0 | GGUF en HF |
| Qwen3.5-2B | no disponible | no disponible | 55,3 | Apache 2.0 (segun familia) | pesos originales |
| Qwen3-1.7B | no disponible | no disponible | 40,2 | Apache 2.0 (segun familia) | pesos originales |
| Qwen3-4B-2507 | no disponible | no disponible | 69,6 | Apache 2.0 (segun familia) | pesos originales |

Los datos de parametros, contexto y licencia de los modelos comparados no figuran en la informacion proporcionada, salvo el resultado de MMLU-Pro. Cabe destacar que Qwen3.5-0.8B obtiene un MMLU-Pro similar al de Qwen3.5-2B pese a tener menos de la mitad de parametros, lo que sugiere una mejora de eficiencia en la generacion 3.5, aunque la cifra exacta esta truncada.

## Limitaciones y advertencias

- El modelo tiene 0,75B de parametros: la model card del modelo base indica explicitamente que su uso previsto es prototipado, ajuste fino por tarea e investigacion, no produccion de alta exigencia.
- Riesgo de alucinacion elevado en tareas de conocimiento factual, razonamiento complejo y matematicas, inherente a la escala reducida. No debe usarse como fuente de verdad sin verificacion.
- La cuantizacion GGUF introduce degradacion adicional respecto a los pesos originales. Unsloth afirma que Dynamic 2.0 supera a otras cuantizaciones, pero no se aportan mediciones de degradacion para este repo.
- El repo no tiene descargas ni likes, y fue creado y actualizado en la misma fecha: no hay evidencia de uso en produccion ni de validacion independiente por parte de la comunidad.
- La informacion disponible no permite confirmar si la variante 0.8B emplea realmente Mixture-of-Experts con parametros activos reducidos, ni el soporte real de tool calling.
- El soporte de 201 idiomas es una afirmacion de la familia Qwen3.5; la calidad por idioma, y en particular en lenguas minoritarias, no esta cuantificada.
- La fecha de creacion del repo (2026-09-27) es posterior al conocimiento de referencia habitual; conviene verificar la vigencia del contenido.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, pero el autor de la cuantizacion no ofrece garantias y la responsabilidad sobre los pesos originales recae en Qwen.
- El repo pesa 14,1 GB, por lo que descargarlo completo consume un ancho de banda considerable si solo se necesita un nivel de cuantizacion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/matthewj-t6/Qwen3.5-0.8B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Guia de Unsloth para ejecutar Qwen3.5 en local: https://unsloth.ai/docs/models/qwen3.5
- Guia de ajuste fino de Qwen3.5 con Unsloth: https://unsloth.ai/docs/models/qwen3.5/fine-tune
- Documentacion de Unsloth Dynamic 2.0 GGUF: https://unsloth.ai/docs/basics/unsloth-dynamic-v2.0-gguf
- Repositorio de Unsloth: https://github.com/unslothai/unsloth/
- Discord de Unsloth: https://discord.gg/unsloth
- Qwen Chat: https://chat.qwen.ai

Nota: los resultados de la busqueda web proporcionada no contienen informacion relevante sobre el modelo; son enlaces a hilos de Reddit sin relacion con Qwen3.5.
