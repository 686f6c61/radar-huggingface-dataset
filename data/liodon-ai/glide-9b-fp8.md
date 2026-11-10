# liodon-ai/GLiDE-9B-FP8

## Resumen

GLiDE-9B-FP8 es una versión cuantizada en FP8 del modelo GLiDE-9B desarrollado por Fastino (fastino/GLiDE-9B). La cuantización la ha realizado Liodon AI mediante la herramienta llm-compressor del proyecto vLLM, aplicando el esquema `FP8_DYNAMIC`: pesos convertidos a FP8 (E4M3) por canal de forma anticipada y activaciones cuantizadas dinámicamente por token en tiempo de inferencia. El resultado reduce el tamaño de los pesos de 15,9 GB a 11,0 GB manteniendo el `lm_head` sin cuantizar.

El modelo cuenta con 8.953.803.264 parámetros (aproximadamente 9B) y está etiquetado con la arquitectura `qwen3_5_text` en Hugging Face, lo que sugiere una base derivada de la familia Qwen 3.5. La licencia es "other", lo que obliga a consultar los términos del modelo original antes de cualquier uso comercial. No se dispone de información sobre idiomas soportados, longitud de contexto ni datos de entrenamiento en la información proporcionada.

La relevancia de esta ficha radica en que ofrece una alternativa de despliegue más ligera y rápida del modelo base para infraestructuras con GPUs NVIDIA modernas (compute capability ≥ 8.9), manteniendo una fidelidad numérica alta al no requerir dataset de calibración. Es una opción práctica para servir el modelo en producción con vLLM, TGI o SGLang.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_5_text (transformer, según tag de Hugging Face) |
| Parámetros totales | 8.953.803.264 (~9B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 (E4M3) dinámica; pesos por canal, activaciones por token |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá del tag `qwen3_5_text`, que apunta a un transformer de la familia Qwen 3.5. No se especifican el número de capas, dimensiones ocultas, mecanismo de atención ni si incorpora innovaciones como atención lineal o decodificación especulativa. Tampoco se documentan los datos de entrenamiento (número de tokens, composición del dataset) ni si hubo fases de RLHF o DPO.

Respecto a la cuantización, el proceso aplicado por Liodon AI es relevante técnicamente: el esquema `FP8_DYNAMIC` de llm-compressor no necesita dataset de calibración, por lo que los pesos cuantizados son un cast directo de los originales y no introducen sesgo derivado de una muestra de calibración. El `lm_head` se mantiene en precisión original para evitar degradación desproporcionada en la calidad de salida.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`).
- Compatible con endpoints estándar de Hugging Face (`endpoints_compatible`).
- Soporte de despliegue en vLLM, TGI y SGLang según la model card.
- No se documentan capacidades específicas de razonamiento, código, matemáticas, visión, audio ni tool calling en la información disponible.
- No se documenta soporte explícito de agentes ni multi-step reasoning.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Despliegue de chat conversacional en producción: el modelo puede servirse con `vllm serve liodon-ai/GLiDE-9B-FP8` en una GPU Ada/Hopper, aprovechando la reducción de 15,9 GB a 11,0 GB para liberar VRAM y aumentar el número de instancias concurrentes.
- Inferencia de bajo coste en GPUs de gama profesional: en una L4 o L40S (compute capability 8.9) el modelo FP8 se ejecuta de forma nativa sin dequantización, lo que resulta adecuado para entornos con presupuesto de memoria limitado.
- Backend de asistentes internos: al ser compatible con TGI y SGLang, puede integrarse en infraestructuras existentes de serving con API OpenAI-compatible para aplicaciones de chat corporativo.
- Prototipado e investigación: al no requerir calibración y ser un cast directo del modelo original, sirve como referencia para comparar el impacto de FP8 frente al modelo base en tareas de generación.
- Evaluación de pipelines de cuantización: útil para equipos que quieran medir la degradación de calidad de FP8_DYNAMIC sobre un transformer de ~9B antes de adoptarlo en otros modelos.
- Servicio de generación de texto en entornos con GPUs Blackwell (B100/B200/GB10): el modelo se beneficia del soporte nativo de FP8 en estas arquitecturas para maximizar throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 11 GB solo para pesos en FP8; añadir overhead de KV cache y activaciones según contexto y batch.
- GPU recomendadas con soporte FP8 nativo (compute capability ≥ 8.9): RTX 40-series (4090, 4080), L4, L40S, H100, H200, B100, B200, GB10.
- En GPUs anteriores a Ada/Hopper, vLLM y TGI dequantizan a un formato soportado, perdiendo la ventaja de velocidad y memoria.
- Cabe en GPUs de consumo como la RTX 4090 (24 GB) siempre que el contexto y el batch no sean muy grandes.
- Opciones de despliegue documentadas: vLLM, Text Generation Inference (TGI), SGLang.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| liodon-ai/GLiDE-9B-FP8 | ~9B | no disponible | FP8 dinámica | other | Hugging Face |
| fastino/GLiDE-9B (base) | ~9B | no disponible | BF16/FP16 (15,9 GB) | other | Hugging Face |
| Alternativas de ~9B de la familia Qwen 3.5 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- La licencia "other" obliga a revisar los términos del modelo base fastino/GLiDE-9B antes de cualquier uso comercial; no se garantiza permiso de uso comercial por defecto.
- La cuantización FP8 puede introducir degradación numérica respecto al modelo original, aunque el esquema dinámico sin calibración reduce el sesgo sistemático.
- El `lm_head` se mantiene sin cuantizar, pero el resto de capas sí se ve afectado por el cast a FP8.
- No se documentan sesgos conocidos, riesgos de alucinación ni limitaciones idiomáticas específicas.
- El modelo solo es eficiente en GPUs con compute capability ≥ 8.9; en hardware anterior se dequantiza y pierde las ventajas de memoria y velocidad.
- No se dispone de información sobre la longitud de contexto máxima, lo que impide planificar cargas con ventanas largas.
- El número de descargas (21) y likes (1) es muy bajo, lo que sugiere poca validación comunitaria del artefacto cuantizado.

## Enlaces

- Modelo cuantizado: https://huggingface.co/liodon-ai/GLiDE-9B-FP8
- Modelo base: https://huggingface.co/fastino/GLiDE-9B
- Herramienta de cuantización: https://github.com/vllm-project/llm-compressor
- Perfil del autor de la cuantización: https://huggingface.co/liodon-ai
