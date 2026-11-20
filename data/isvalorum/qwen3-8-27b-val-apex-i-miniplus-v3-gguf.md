# IsValorum/Qwen3.8-27B-VAL-APEX-I-MiniPlus-V3-GGUF

## Resumen

Qwen3.8-27B-VAL-APEX-I-MiniPlus-V3-GGUF es una cuantización GGUF del checkpoint base Qwen/Qwen3.8-27B, publicada por el usuario independiente IsValorum bajo licencia Apache 2.0. No se trata de un modelo nuevo entrenado desde cero, sino de una reconstrucción de pesos orientada a inferencia local en llama.cpp, con asignación de bits por tensor revisada (V3) e integración de un bloque de predicción multi-token (MTP) en el mismo archivo que el modelo principal.

El modelo conserva la arquitectura y los pesos del checkpoint original de Qwen, sin ablación (Huihui) ni ajuste EfficientThink, y mantiene el contexto nativo de 256K tokens que declara el autor. El archivo pesa 14,16 GB con 4,15 bits por peso (BPW) de media, lo que lo sitúa en el rango de cuantizaciones de 4 bits de alta fidelidad para un modelo denso de 27.320.697.856 parámetros.

Su relevancia actual radica en que permite ejecutar un modelo de 27B con ventana de contexto muy larga en estaciones de trabajo con 24 GB de VRAM, a costa de una degradación medida de +5,90 % en perplejidad sobre WikiText-2 respecto al BF16 de referencia. La ficha se limita a los datos publicados en la model card y en los metadatos de Hugging Face; todo lo no documentado se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen/Qwen3.8-27B); incluye un bloque MTP (`blk.64.*`, 15 tensores) integrado en el GGUF |
| Parametros totales | 27.320.697.856 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens (contexto nativo declarado por el autor) |
| Tipos de cuantizacion | GGUF con asignación asimétrica por tensor; matrices MTP en Q4_0 (×6), Q4_1 (×1) y Q6_K (×1); normalizaciones en F32; media global de 4,15 BPW |
| Idiomas soportados | Inglés (`en`) segun metadatos; otros idiomas no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint Qwen/Qwen3.8-27B, por lo que la arquitectura subyacente es la del transformer denso original de Qwen, sin modificaciones estructurales más allá de la compresión de pesos. La contribución del autor, el método VAL-APEX-I (Vector-calibrated Asymmetric Layer-wise Outlier-preserving Recurrent-aware Unified Matrix-quantization), consiste en una asignación de bits por tensor guiada por matrices de calibración de varios millones de tokens, con preservación de valores atípicos a nivel de capa y tratamiento específico de las excepciones del bloque 0. El resultado es un archivo de 14,16 GB y 4,15 BPW que, según la model card, alcanza una perplejidad de 6,1361 ± 0,4885 en WikiText-2 frente a 5,7942 ± 0,4531 del BF16 sin modificar, es decir, +0,3419 puntos (+5,90 %).

La innovación técnica destacable es la inclusión del bloque de predicción multi-token (MTP) dentro del mismo GGUF que el modelo principal: quince tensores bajo `blk.64.*`, con ocho matrices cuantizadas (seis en Q4_0, una en Q4_1 y una en Q6_K) y siete tensores de normalización en F32. La decodificación especulativa basada en MTP depende del soporte y la configuración del backend de inferencia empleado, por lo que no está garantizada en todos los entornos. No se dispone de información sobre el volumen de tokens de preentrenamiento, la composición del dataset ni las etapas de RLHF o DPO del modelo base en la documentación proporcionada.

## Capacidades

- Generación de texto conversacional y de un solo turno, con plantilla de chat nativa heredada del modelo Qwen original.
- Razonamiento explícito: la model card etiqueta el modelo con `reasoning` y documenta una sección específica de razonamiento y plantilla de chat.
- Uso de herramientas y comportamiento agéntico: evaluado en la suite autónoma Shortbench/NanoBench con puntuaciones de 100/100 en la categoría de uso de herramientas (agentic tool use).
- Generación de código e implementación de software: 100/100 en la categoría de codificación en el arnés Oh My Pi y 97,0/100 en Hermes Agent.
- Tareas de integridad de sistemas y pipelines: 86,7/100 en la categoría de sistemas de la misma suite.
- Contexto largo: ventana nativa de 256K tokens, adecuada para documentos extensos y conversaciones multi-turno prolongadas.
- Decodificación especulativa mediante el bloque MTP integrado, sujeta al soporte del backend.
- Capacidades multilingües: los metadatos solo declaran inglés; el resto de idiomas no está disponible.

## Casos de uso

- Asistencia de código en local: el modelo puede integrarse en un flujo de trabajo con llama.cpp para autocompletar, refactorizar y explicar código en una estación con 24 GB de VRAM, aprovechando su puntuación de 100/100 en implementación en la suite NanoBench y su contexto de 256K para cargar repositorios completos.
- Agentes autónomos de ingeniería de software: con tool calling verificado al 100 % en OMP 18.7 y Hermes Agent, es adecuado para pipelines que ejecutan tareas de varios pasos sobre repositorios, lanzan tests y corrigen fallos de forma iterativa.
- Análisis de documentación extensa: la ventana de 256K tokens permite procesar contratos, informes técnicos o bases de código completas en una sola pasada sin fragmentación agresiva.
- Asistente conversacional de atención al cliente: la plantilla de chat nativa y el contexto largo permiten mantener conversaciones multi-turno con historial amplio, siempre que el despliegue se limite al inglés.
- Automatización de integridad de sistemas: con 86,7/100 en la categoría de sistemas de NanoBench, puede emplearse para validar pipelines, comprobar configuraciones y detectar inconsistencias en entornos de CI/CD.
- Prototipado e investigación en máquinas de gama alta de consumo: al caber en 24 GB de VRAM con 4,15 BPW, sirve para experimentar con un modelo de 27B y contexto largo sin acceso a clústeres de GPU.
- Evaluación comparativa de cuantizaciones: su perplejidad documentada y su mapa de tensores lo convierten en una referencia útil para medir el impacto de distintas estrategias de cuantización sobre el mismo checkpoint base.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden a la suite autónoma Shortbench/NanoBench, evaluada por el usuario independiente @userr99 en una estación con 24 GB de VRAM y 64 GB de RAM usando llama.cpp, sobre 12 tareas objetivas de ingeniería de software, pipelines e integridad de sistemas. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

| Arnés | Puntuación total | Tareas resueltas | Agéntico (uso de herramientas) | Codificación | Sistemas | Tiempo medio |
|---|---|---|---|---|---|---|
| Oh My Pi (OMP 18.7) | 96,7 % | 10 / 12 | 100 / 100 | 100 / 100 | 86,7 / 100 | aprox. 1 h 47 min |
| Hermes Agent (v0.21.5) | 95,4 % | 9 / 12 | 100 / 100 | 97,0 / 100 | 86,7 / 100 | aprox. 1 h 47 min |

| Métrica de cuantización | BF16 base | MiniPlus V3 (esta versión) | Delta |
|---|---|---|---|
| Tamaño de archivo | 54,65 GB (50,90 GiB) | 14,16 GB (13,19 GiB) | −74,1 % |
| Bits por peso (BPW) | 16 | 4,15 | −11,85 |
| Perplejidad WikiText-2 | 5,7942 ± 0,4531 | 6,1361 ± 0,4885 | +0,3419 (+5,90 %) |

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo pesa 14,16 GB; con overhead de contexto KV y buffers de llama.cpp, se recomienda un mínimo de 16-18 GB de VRAM para contexto moderado y 24 GB para aprovechar ventanas largas.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40/80 GB, H100 80 GB; en configuraciones multi-GPU, dos RTX 4080 o similares con reparto por capas.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y, con contexto reducido, en GPUs de 16 GB si se descargan capas a RAM del sistema.
- Opciones de despliegue: llama.cpp es el backend de referencia documentado; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI. No se documenta soporte específico de vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: la model card reporta un tiempo medio de aproximadamente 1 h 47 min por ejecución completa de las 12 tareas de NanoBench en una estación de 24 GB de VRAM y 64 GB de RAM; no se publican tokens por segundo ni latencias por petición.
- La decodificación especulativa con el bloque MTP requiere que el backend de inferencia soporte y configure dicha función; de lo contrario, el bloque permanece inactivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización / tamaño | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-VAL-APEX-I-MiniPlus-V3 (este) | 27,3 B | 256K | GGUF, 14,16 GB, 4,15 BPW | Apache 2.0 | Incluye bloque MTP; PPL WikiText-2 de 6,1361 |
| Qwen3.8-27B-VAL-APEX-I-NanoPlus-V3 | 27,3 B | 256K | GGUF, 12,18 GB | Apache 2.0 | Variante de menor tamaño del mismo autor; métricas de perplejidad no disponibles en esta ficha |
| Swift-1.5 Qwen3.8-27B Uncensored MTP — MiniPlus V3 | 27,3 B | 256K | GGUF, 14,16 GB | Apache 2.0 | Variante sin censura (abliterated) del mismo autor; métricas no disponibles en esta ficha |
| Qwen/Qwen3.8-27B (base) | 27,3 B | 256K | BF16, 54,65 GB | Apache 2.0 | Referencia de calidad; PPL WikiText-2 de 5,7942 |

No se dispone de datos de benchmarks estándar ni de comparaciones con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Degradación medible de calidad: la perplejidad aumenta un 5,90 % respecto al BF16 base; en tareas sensibles a matices finos puede haber pérdida adicional no capturada por WikiText-2.
- Sesgos conocidos: no documentados en la información disponible; al derivar del checkpoint Qwen original, hereda los sesgos de su dataset de entrenamiento, que tampoco se detalla.
- Riesgo de alucinación: inherente a los modelos generativos; no se han publicado evaluaciones específicas de factualidad para esta cuantización.
- Limitación de idioma: los metadatos solo declaran inglés; el rendimiento en castellano u otros idiomas no está verificado y podría degradarse respecto al modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el despliegue debe conservar los avisos de licencia y atribución correspondientes al modelo base y a la cuantización.
- Dependencia del backend: el bloque MTP solo aporta aceleración si el motor de inferencia lo soporta y configura; en caso contrario, se ignora.
- Contexto de 256K: aunque sea nativo, el uso de ventanas muy largas incrementa el consumo de memoria KV y puede requerir offloading a RAM, con la consiguiente caída de throughput.
- Evaluación limitada: los benchmarks disponibles provienen de una suite comunitaria de 12 tareas y de un único evaluador, por lo que no deben extrapolarse a todos los dominios.
- Autoría independiente: la cuantización no está publicada por el equipo oficial de Qwen; la reproducibilidad depende de la documentación del autor y de las herramientas de llama.cpp.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IsValorum/Qwen3.8-27B-VAL-APEX-I-MiniPlus-V3-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante NanoPlus V3: https://huggingface.co/IsValorum/Qwen3.8-27B-VAL-APEX-I-NanoPlus-V3-GGUF
- Variante Swift-1.5 Uncensored MTP MiniPlus V3: https://huggingface.co/IsValorum/Swift-1.5-Qwen3.8-27B-Uncensored-MTP-VAL-APEX-I-MiniPlus-V3-GGUF
- Variante Swift-1.5 Uncensored MTP NanoPlus V3: https://huggingface.co/IsValorum/Swift-1.5-Qwen3.8-27B-Uncensored-MTP-VAL-APEX-I-NanoPlus-V3-GGUF
- Colección MiniPlus Abliterated 27B: https://huggingface.co/collections/IsValorum/val-apex-miniplus-abliterated-27b-6acfec541ee5628d2632c663
- Colección MiniPlus Standard 27B: https://huggingface.co/collections/IsValorum/val-apex-miniplus-standard-27b-6acfec54ca4ce4cf5cd5bdb6
- Colección NanoPlus Abliterated 27B: https://huggingface.co/collections/IsValorum/val-apex-nanoplus-abliterated-27b-6acfec5503f6e74218f71f64
- Colección NanoPlus Standard 27B: https://huggingface.co/collections/IsValorum/val-apex-nanoplus-standard-27b-6acfec55c1c99e2a23ebbd9b
- Shortbench / NanoBench: https://shortbench.vercel.app/
- Hilo de discusión con registros de la evaluación: https://huggingface.co/IsValorum/Huihui-Qwen3.8-27B-Abliterated-VAL-APEX-I-NanoPlus-V3-GGUF/discussions/2
- Perfil del evaluador independiente: https://huggingface.co/userr99
- Apoyo al autor (Ko-fi): https://ko-fi.com/isvalorum
