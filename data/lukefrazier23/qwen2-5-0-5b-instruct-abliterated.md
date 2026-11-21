# LukeFrazier23/qwen2.5-0.5b-instruct-abliterated

## Resumen

`LukeFrazier23/qwen2.5-0.5b-instruct-abliterated` es una variante "abliterated" del modelo Qwen2.5-0.5B-Instruct desarrollado por Alibaba Cloud (equipo Qwen). La "abliteración" es una técnica de edición de pesos que elimina selectivamente la dirección de rechazo en el espacio de activaciones, de modo que el modelo deja de negarse a responder ante determinadas peticiones. El resultado es un modelo de chat de muy pequeño tamaño (494 millones de parámetros, 0,36B sin embeddings) que conserva la arquitectura y capacidades del original pero con los mecanismos de rechazo atenuados o eliminados.

El modelo base, Qwen2.5-0.5B-Instruct, es un transformer causal denso de 24 capas con RoPE, SwiGLU, RMSNorm, atención con sesgo QKV y embeddings atados, con GQA de 14 cabezas de consulta y 2 de clave/valor. Soporta una ventana de contexto de 32.768 tokens y generación de hasta 8.192 tokens. Está pensado para despliegues en entornos con recursos muy limitados: CPU, GPUs de gama baja o dispositivos edge.

La relevancia de esta ficha radica en dos motivos: por un lado, documenta un modelo extremadamente ligero y de licencia Apache 2.0, útil para prototipado rápido y despliegue en hardware modesto; por otro, advierte de que la variante abliterated elimina las salvaguardas de rechazo del modelo original, lo que tiene implicaciones directas para su uso en producción. El repositorio no incluye model card propia más allá de la heredada del modelo base, y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con RoPE, SwiGLU, RMSNorm, atención QKV con sesgo y embeddings atados (GQA: 14 cabezas Q, 2 cabezas KV) |
| Parametros totales | 494.032.768 (0,49B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (entrada); generación hasta 8.192 tokens |
| Tipos de cuantizacion | No especificados en la información disponible; al ser safetensors en transformers, admite cuantización estándar (GPTQ, AWQ, GGUF) mediante herramientas externas |
| Idiomas soportados | Inglés declarado en la model card; el modelo base Qwen2.5 declara soporte para más de 29 idiomas, aunque esta variante solo lista `en` |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen2.5-0.5B-Instruct original: un transformer causal denso de 24 capas con 14 cabezas de atención para consultas y 2 para clave/valor (GQA), RoPE para codificación posicional, SwiGLU como activación en el FFN, RMSNorm y embeddings de entrada/salida atados. Los 494M de parámetros totales incluyen 0,36B no pertenecientes a embeddings. El modelo base fue entrenado por el equipo Qwen con preentrenamiento y postentrenamiento (instrucción), según la model card heredada; no se detallan el número exacto de tokens, la composición del dataset ni si hubo RLHF/DPO en la información proporcionada.

La modificación "abliterated" consiste en una edición de pesos que proyecta fuera la dirección de rechazo identificada en las activaciones internas, típicamente mediante diferencias de medias de activaciones entre prompts dañinos y benignos. El autor del repositorio no documenta la metodología exacta, el dataset utilizado para calcular la dirección de rechazo ni el grado de abliteración aplicado. No se dispone de información sobre si se realizó un fine-tuning adicional tras la edición o si solo se modificaron los pesos del modelo instruct original.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, con plantilla de chat (`apply_chat_template`).
- Razonamiento básico, respuesta a preguntas y generación de texto corto y medio.
- Capacidades de código y matemáticas heredadas del Qwen2.5 original, aunque limitadas por el tamaño de 0,5B.
- Comprensión y generación de datos estructurados (JSON, tablas) según las mejoras declaradas para la familia Qwen2.5.
- Seguimiento de instrucciones y manejo de system prompts diversos.
- Generación de textos largos de hasta 8.192 tokens.
- Multilingüismo limitado: la model card de esta variante solo declara inglés, aunque el modelo base soporta más idiomas.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo "thinking" en la información disponible.
- La abliteración elimina o atenúa el rechazo ante peticiones que el modelo original rechazaría.

## Casos de uso

- Prototipado rápido de chatbots: el modelo cabe en CPU y GPUs de gama baja, lo que permite iterar sobre prompts y plantillas de chat sin infraestructura dedicada. Adecuado para validar flujos conversacionales antes de escalar a modelos mayores.
- Clasificación y extracción de información en texto: con 32K de contexto y capacidad para generar JSON, puede usarse para etiquetar documentos, extraer entidades o resumir textos cortos en pipelines por lotes.
- Generación de texto asistida en entornos edge: al ocupar menos de 1 GB en safetensors (y menos cuantizado), puede desplegarse en dispositivos con recursos limitados para autocompletado, respuestas sugeridas o generación de borradores.
- Investigación sobre alineación y seguridad: la variante abliterated es útil para estudiar cómo la eliminación de la dirección de rechazo afecta al comportamiento del modelo, comparando respuestas con el original en experimentos controlados.
- Generación de datos sintéticos para fine-tuning: puede producir pares instrucción-respuesta a bajo coste computacional, útil para aumentar datasets en dominios específicos antes de entrenar modelos mayores.
- Pruebas de robustez y red-teaming: sirve como modelo de referencia "sin salvaguardas" para evaluar clasificadores de contenido, filtros de seguridad o sistemas de moderación en condiciones adversas.
- Despliegue en entornos air-gapped o de bajo consumo: al ser Apache 2.0 y de pequeño tamaño, puede ejecutarse localmente sin dependencia de APIs externas para tareas de generación simples.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card heredada remite al blog de Qwen2.5 para los resultados del modelo base, pero no se aportan cifras concretas en la información proporcionada, y no hay datos específicos de la variante abliterated.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1 GB para los pesos (494M parámetros × 2 bytes) más overhead de activaciones y KV cache; en la práctica, entre 1,5 y 2,5 GB según longitud de contexto.
- En cuantización de 8 bits: alrededor de 0,5-0,7 GB de pesos; en 4 bits: alrededor de 0,3-0,4 GB.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas o CPU.
- GPU recomendadas para producción: cualquier GPU con al menos 4 GB de VRAM para FP16 con contexto moderado; A100/H100 no son necesarias y estarían infrautilizadas.
- Opciones de despliegue: transformers (librería nativa del repo), text-generation-inference (tag `text-generation-inference` presente), vLLM, llama.cpp/Ollama mediante conversión a GGUF, y endpoints compatibles (tag `endpoints_compatible`).
- Latencia y throughput: no se han publicado mediciones específicas para esta variante. Para el modelo base, la documentación de Qwen remite a su benchmark de velocidad, pero no se incluyen cifras en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LukeFrazier23/qwen2.5-0.5b-instruct-abliterated | 0,49B | 32.768 tokens | Apache 2.0 | Variante abliterated, sin salvaguardas de rechazo; solo inglés declarado |
| Qwen/Qwen2.5-0.5B-Instruct | 0,49B | 32.768 tokens | Apache 2.0 | Modelo original con alineación intacta; multilingüe (29+ idiomas) |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | Apache 2.0 | Misma familia, mayor capacidad; requiere más VRAM |
| SmolLM2-360M-Instruct (HuggingFace) | 0,36B | 8.192 tokens | Apache 2.0 | Alternativa de tamaño similar; contexto menor |

La comparativa se limita a datos estructurales; no hay benchmarks publicados para esta variante que permitan comparar rendimiento real frente a las alternativas.

## Limitaciones y advertencias

- La abliteración elimina o atenúa los mecanismos de rechazo del modelo original: puede generar contenido dañino, sesgado o inapropiado ante peticiones que el modelo base rechazaría. No es apto para aplicaciones orientadas al usuario sin filtros externos.
- Riesgo elevado de alucinación: con solo 0,49B de parámetros, la precisión factual es limitada y puede inventar datos, citas o referencias con facilidad.
- Capacidad de razonamiento y código muy limitada en comparación con modelos de mayor tamaño; no adecuado para tareas que requieran precisión alta.
- Idiomas: la model card solo declara inglés; el rendimiento en castellano u otros idiomas no está garantizado aunque el modelo base los soporte.
- Ventana de contexto de 32K tokens, pero el rendimiento en contextos largos con un modelo de este tamaño puede degradarse notablemente.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni asume responsabilidad sobre el comportamiento del modelo modificado.
- El repositorio no incluye documentación sobre la metodología de abliteración, el dataset usado ni validación de que las capacidades del modelo original se conserven.
- Sin descargas ni likes registrados: no hay evidencia de uso comunitario ni validación externa.
- El modelo fue creado en noviembre de 2026 según los metadatos; verificar la fecha y procedencia antes de confiar en él para producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LukeFrazier23/qwen2.5-0.5b-instruct-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Modelo instruct original: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio GitHub de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Benchmark de velocidad de Qwen: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Paper Qwen2: https://arxiv.org/abs/2407.10671
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct/blob/main/LICENSE
