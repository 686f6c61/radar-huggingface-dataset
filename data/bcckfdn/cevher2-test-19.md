# bcckfdn/cevher2-test-19

## Resumen

cevher2-test-19 es un modelo de lenguaje de 1.513.546.496 parámetros (aproximadamente 1,5 mil millones) entrenado desde cero por el usuario bcckfdn siguiendo la arquitectura SmolLM2 de Llama. El modelo está diseñado para generación de texto conversacional y declara soporte para turco (tr) e inglés (en), lo que lo sitúa en el nicho de los modelos pequeños multilingües con foco en una lengua de recursos medios como el turco.

Se trata de un modelo preentrenado desde cero (pretrained-from-scratch) sobre 35.683 millones de tokens, con una longitud de contexto de 8192 tokens y un vocabulario de 65.536 entradas. La arquitectura es un transformer decoder-only tipo Llama con 34 capas, dimensión oculta de 1792 y 28 cabezas de atención para consultas con 7 cabezas para claves/valores (GQA), una configuración coherente con la familia SmolLM2.

El modelo es relevante para quienes buscan alternativas ligeras y de licencia permisiva (Apache 2.0) para experimentación en turco e inglés, con posibilidad de ejecución en hardware de consumo. No obstante, la información pública disponible es escasa: no se han publicado benchmarks, detalles de composición del dataset ni procesos de alineación (RLHF/DPO), y el repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama (SmolLM2) |
| Parametros totales | 1.513.546.496 (~1,5 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | Turco (tr) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Capas | 34 |
| Dimension oculta | 1792 |
| Cabezas de atencion (Q/KV) | 28 / 7 (GQA) |
| Vocabulario | 65.536 tokens |
| Tokens de entrenamiento | 35.683 millones |
| Mejor val loss | 2.7292 |
| Tamano del repositorio | 3,0 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolLM2, un transformer decoder-only con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención con consultas agrupadas (GQA) en proporción 28 cabezas de consulta por 7 de clave/valor. La configuración concreta es de 34 capas, dimensión oculta 1792 y vocabulario de 65.536 tokens, lo que da un total de 1.513.546.496 parámetros. Esta disposición es típica de los modelos pequeños orientados a eficiencia en inferencia, ya que la GQA reduce el coste de memoria de la caché KV durante la generación.

El entrenamiento se realizó desde cero (pretrained-from-scratch) sobre 35.683 millones de tokens, según declara el autor, alcanzando una mejor pérdida de validación de 2.7292. No se especifica la composición del corpus (proporción turco/inglés, fuentes, filtrado de calidad), ni si hubo fases de instrucción supervisada, RLHF o DPO. Tampoco se detallan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o estrategias de mezcla de datos. La información disponible no permite verificar la calidad del preentrenamiento más allá del valor de val loss reportado.

## Capacidades

- Generación de texto autoregresiva en turco e inglés, con pipeline declarado de text-generation.
- Modelo base preentrenado (no se declara ajuste por instrucciones), por lo que su comportamiento conversacional depende de la formulación del prompt y de posibles ajustes posteriores no documentados.
- Soporte de contexto de hasta 8192 tokens, adecuado para documentos de longitud media y conversaciones multi-turno.
- Capacidad multilingüe limitada a turco e inglés según los metadatos de la model card.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes, razonamiento multi-paso ni modos de pensamiento (thinking mode).
- No se declaran capacidades de visión, audio ni multimodalidad.
- Compatible con text-generation-inference y endpoints_compatible según los tags del repositorio.

## Casos de uso

- Generación de texto en turco para prototipos de asistentes conversacionales: el modelo puede mantener diálogos multi-turno gracias a su ventana de 8192 tokens, útil para experimentar con chat en turco sin depender de APIs externas.
- Completado de texto y redacción asistida en inglés y turco: adecuado para tareas de autocompletado, resumen o reescritura en entornos de investigación donde se requiera un modelo pequeño y de licencia permisiva.
- Fine-tuning específico de dominio: al ser un modelo base de 1,5 B con licencia Apache 2.0, sirve como punto de partida para ajuste supervisado en dominios como atención al cliente, documentación técnica o contenido editorial en turco.
- Investigación en entrenamiento desde cero: su configuración SmolLM2 y sus datos declarados (35,7 B tokens, val loss 2,7292) lo convierten en una referencia para estudiar el comportamiento de modelos pequeños multilingües.
- Despliegue en entornos con recursos limitados: con 1,5 B de parámetros, puede ejecutarse en GPU de consumo para tareas de generación por lotes o servicios de baja concurrencia.
- Evaluación comparativa de modelos pequeños en turco: útil para medir el rendimiento de arquitecturas tipo Llama en una lengua de recursos medios frente a modelos multilingües más grandes.
- Generación de datos sintéticos: puede emplearse para producir corpus de texto en turco o inglés que alimenten pipelines de entrenamiento o aumentación de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta una mejor pérdida de validación de 2.7292 tras 35.683 millones de tokens de entrenamiento, sin métricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3 GB solo para pesos, más caché KV y activaciones; en la práctica se recomiendan 6-8 GB para secuencias largas.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,6 GB para pesos; en 4 bits, en torno a 0,8-1 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, en tarjetas con 6 GB o más en precisión completa y en GPUs con 4 GB o más si se cuantiza.
- Opciones de despliegue: transformers (referencia oficial), text-generation-inference (tag endpoints_compatible), vLLM y llama.cpp/Ollama previa conversión a GGUF (no publicada por el autor).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Benchmarks publicados |
|---|---|---|---|---|---|
| cevher2-test-19 | ~1,5 B | 8192 | tr, en | Apache 2.0 | No disponibles |
| SmolLM2-1.7B | ~1,7 B | 8192 | principalmente en | Apache 2.0 | Sí (model card oficial) |
| Qwen2.5-1.5B | ~1,5 B | 32768 | multilingue (incluye tr) | Apache 2.0 | Sí (model card oficial) |
| Llama 3.2 1B | ~1,2 B | 131072 | multilingue | Llama 3.2 Community License | Sí (model card oficial) |

La comparación se basa en características públicas de cada familia; no existen datos de rendimiento de cevher2-test-19 que permitan una comparación cuantitativa. SmolLM2-1.7B comparte arquitectura y licencia, mientras que Qwen2.5-1.5B y Llama 3.2 1B ofrecen contextos más amplios y cobertura multilingüe más extensa, aunque con condiciones de licencia distintas en el caso de Llama.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos; al entrenarse desde cero sin documentación del corpus, el riesgo de sesgos lingüísticos y culturales es desconocido.
- Riesgo de alucinación inherente a un modelo base de 1,5 B sin alineación documentada; no se declara RLHF ni DPO.
- La cobertura lingüística se limita a turco e inglés según los metadatos; el rendimiento en otras lenguas no está garantizado.
- El contexto máximo es de 8192 tokens; no se documenta el comportamiento más allá de esa ventana.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la procedencia y licencia del corpus de entrenamiento.
- El repositorio no registra descargas ni interacciones, y la model card es mínima; no hay garantías de mantenimiento, soporte ni versionado.
- No se han publicado cuantizaciones oficiales (GGUF, AWQ, GPTQ), lo que obliga a generarlas manualmente para despliegues ligeros.
- El nombre "test" en el identificador sugiere que puede tratarse de un artefacto experimental sin validación en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bcckfdn/cevher2-test-19
- Repositorio de SmolLM2 (referencia arquitectónica): https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B
- Paper de SmolLM2: https://arxiv.org/abs/2502.02737
- Documentación de transformers: https://huggingface.co/docs/transformers
- Documentación de text-generation-inference: https://huggingface.co/docs/text-generation-inference
