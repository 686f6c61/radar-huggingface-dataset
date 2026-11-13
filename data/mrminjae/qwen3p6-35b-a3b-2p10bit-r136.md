# mrminjae/qwen3p6-35b-a3b-2p10bit-r136

## Resumen

Qwen3.6-35B-A3B 2.10-bit (r136) es un checkpoint de investigación publicado por el usuario mrminjae en Hugging Face, derivado del modelo base Qwen/Qwen3.6-35B-A3B. Se trata de una cuantización selectiva: solo los expertos enrutados del modelo MoE se almacenan a una media de 2,10 bits por peso, mientras que el resto de los pesos permanece en BF16. Los pesos se guardan ya dequantizados en tensores BF16, de modo que el modelo carga con `transformers` estándar y con vLLM sin necesidad de kernels de cuantización especiales.

El modelo base pertenece a la familia Qwen3.6, una arquitectura MoE con capacidades multimodales (etiqueta image-text-to-text) y orientada a generación de texto conversacional. El checkpoint r136 es un artefacto de investigación interna, no un lanzamiento oficial de Alibaba/Qwen, y su interés principal reside en la técnica de compresión aplicada a los expertos del MoE: reducir drásticamente el coste de almacenamiento de los parámetros menos activos manteniendo el resto en precisión completa.

Es relevante ahora porque explora una vía de compresión específica para MoE que difiere de las cuantizaciones globales habituales (GPTQ, AWQ, GGUF): al degradar solo los expertos enrutados, se preserva la precisión de atención, embeddings y capas densas. No obstante, al ser un checkpoint de investigación sin benchmarks publicados, sin licencia declarada explícitamente y con cero descargas, debe tratarse con cautela en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE basada en transformer (qwen3_5_moe), multimodal image-text-to-text |
| Parametros totales | 67.319.436.656 (67,3 mil millones, dato real de safetensors) |
| Parametros activos | no disponible (el nombre del modelo base sugiere ~3B activos, sin confirmar en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,10 bits de media; resto de pesos en BF16; pesos almacenados dequantizados en tensores BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que sigue la licencia del modelo base, sin especificarla) |
| Formato de pesos | safetensors (BF16 dequantizado) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE), identificado en los tags como `qwen3_5_moe`, con pipeline multimodal image-text-to-text. El checkpoint r136 no reentrena el modelo: aplica una cuantización post-entrenamiento selectiva sobre los expertos enrutados, que quedan representados a una media de 2,10 bits por peso. El resto de los parámetros (atención, embeddings, capas densas, router y normas) se conserva en BF16. Los pesos se almacenan dequantizados, es decir, el fichero contiene tensores BF16 reconstruidos a partir de la representación de baja precisión, lo que explica el tamaño del repositorio (134,7 GB) frente a los 67,3 mil millones de parámetros.

No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documenta la innovación técnica concreta del esquema de cuantización a 2,10 bits (algoritmo de redondeo, granularidad por grupo, calibración) más allá de la descripción de alto nivel de la model card. El identificador "r136" y la etiqueta "Internal research checkpoint" indican que es un artefacto de experimentación, no una release validada.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen3.6.
- Procesamiento multimodal image-text-to-text: acepta entradas de imagen y texto (según el pipeline declarado).
- Razonamiento y generación de código: capacidades propias del modelo base, no verificadas en este checkpoint.
- Soporte de tool calling y function calling: no confirmado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la información disponible.
- Capacidades multilingües: no disponibles.
- Modo thinking explícito, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación sobre compresión de MoE: el checkpoint sirve para estudiar el impacto de cuantizar únicamente los expertos enrutados a ~2 bits mientras el resto permanece en BF16, comparando calidad frente al modelo base completo en tareas controladas.
- Evaluación de degradación por precisión: permite medir empíricamente cuánto pierde un MoE multimodal al comprimir sus expertos, útil para decidir umbrales de cuantización en despliegues reales.
- Prototipado de pipelines multimodales: al cargar con `transformers` estándar, se puede integrar en prototipos de image-text-to-text sin kernels personalizados, aunque con requisitos de memoria elevados.
- Baseline en experimentos de destilación o poda: sirve como punto de comparación frente a otras técnicas de compresión aplicadas al mismo modelo base.
- Pruebas de compatibilidad con vLLM: la model card afirma compatibilidad con vLLM, por lo que puede usarse para validar el comportamiento del servidor de inferencia con pesos dequantizados.
- Reproducción de experimentos internos: útil para equipos que quieran replicar el esquema r136 sobre otros MoE y necesiten una referencia pública del resultado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al almacenarse en BF16, el peso completo ocupa aproximadamente 134,7 GB, por lo que se necesita un mínimo de ~135 GB de VRAM solo para pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: configuraciones multi-GPU con H100 80 GB (2 unidades), A100 80 GB (2 unidades) o H200; no cabe en una sola GPU de 80 GB.
- GPU de consumo: no cabe en RTX 4090 (24 GB), RTX 3090 (24 GB) ni en ninguna GPU consumer individual. Requeriría offloading a RAM/CPU, con latencia muy alta.
- Opciones de despliegue: `transformers` estándar y vLLM, según la model card. No se menciona soporte GGUF, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-2p10bit-r136 | 67,3 mil millones | no disponible | no disponible | safetensors BF16 dequantizado | Hugging Face, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | no disponible en la informacion proporcionada | no disponible | no disponible | safetensors | Hugging Face (modelo base) |
| Otras cuantizaciones del mismo base (GPTQ/AWQ/GGUF) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones completas de alternativas en la información proporcionada para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Checkpoint de investigación interna ("Internal research checkpoint"): no es una release validada ni recomendada para producción.
- Cuantización agresiva a 2,10 bits en los expertos enrutados: riesgo de degradación de calidad no cuantificada, al no publicarse benchmarks.
- Licencia no declarada explícitamente: la model card remite a la licencia del modelo base sin especificarla, lo que impide confirmar condiciones de uso comercial.
- Idiomas soportados no documentados: no se puede garantizar cobertura multilingüe.
- Longitud de contexto no disponible: imposible planificar despliegues con ventanas largas sin verificación empírica.
- Tamaño del repositorio (134,7 GB) y requisitos de VRAM muy elevados: inviable en hardware de consumo.
- Riesgo de alucinación y sesgos: no evaluados en este checkpoint; se heredan los del modelo base, sin documentación adicional.
- Cero descargas y cero likes: sin validación comunitaria ni reportes de terceros sobre su comportamiento real.
- Compatibilidad con vLLM afirmada por el autor pero no verificada de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p10bit-r136
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
