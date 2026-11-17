# mradermacher/ThinkingNuke-gemma-4-26B-A4B-i1-GGUF

## Resumen

ThinkingNuke-gemma-4-26B-A4B-i1-GGUF es una colección de cuantizaciones GGUF generadas por mradermacher a partir del modelo base ThinkingNuke-gemma-4-26B-A4B, publicado por el usuario krystofmitka. Se trata, por tanto, de un artefacto de distribución (quantized weights) y no de un modelo entrenado desde cero por el autor del repositorio. El modelo subyacente parte de una arquitectura Gemma 4 con mezcla de expertos (MoE), según se deduce del sufijo "A4B" (aproximadamente 4.000 millones de parámetros activos) y de los 25.233.142.046 parámetros totales reportados en los safetensors.

El repositorio contiene múltiples variantes de cuantización (desde IQ1_S hasta Q6_K, incluyendo Q4_0, Q4_1, IQ4_XS, Q5_K_M, entre otras), generadas con imatrix y pesos ponderados, lo que permite desplegar el modelo en hardware con distintos presupuestos de VRAM. El tamaño total del repo es de 23,1 GB, coherente con la suma de todas las variantes publicadas.

La relevancia de esta ficha radica en que permite evaluar rápidamente si el modelo es utilizable en producción: es un modelo conversacional (tag "conversational"), con soporte de endpoints compatibles (tag "endpoints_compatible"), pero sin información publicada sobre licencia, idiomas, benchmarks ni detalles de entrenamiento. El autor del quant no documenta el origen exacto de los datos de entrenamiento del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), inferida del sufijo A4B y del nombre del modelo base (Gemma 4) |
| Parámetros totales | 25.233.142.046 |
| Parámetros activos | aproximadamente 4.000 millones (inferido del sufijo A4B; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones generadas con imatrix y pesos ponderados) |

## Arquitectura y entrenamiento

La model card del repositorio no documenta la arquitectura del modelo base más allá de su nombre (ThinkingNuke-gemma-4-26B-A4B) y del recuento de parámetros. Por la nomenclatura "A4B" y el prefijo "gemma-4", se infiere una arquitectura transformer con mezcla de expertos (MoE) de la familia Gemma 4, con aproximadamente 25.200 millones de parámetros totales y alrededor de 4.000 millones activos por token. No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.).

El autor del repositorio (mradermacher) únicamente documenta el proceso de cuantización: los GGUF se han generado con `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf` y usando cuantización con imatrix y pesos ponderados. No se aporta información sobre el proceso de entrenamiento del modelo base ni sobre posibles ajustes finos (el nombre "ThinkingNuke" sugiere algún tipo de fine-tuning orientado a razonamiento, pero no está confirmado).

## Capacidades

- Generación de texto conversacional: el tag "conversational" indica que el modelo está orientado a diálogo multi-turno.
- Compatibilidad con endpoints: el tag "endpoints_compatible" sugiere que puede desplegarse en infraestructuras de inferencia estándar compatibles con la API de Hugging Face Endpoints.
- Razonamiento: el nombre "ThinkingNuke" sugiere un posible modo de razonamiento extendido (thinking mode), aunque no está documentado en la model card.
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio, etc.): no disponible.

## Casos de uso

- Despliegue en entornos con VRAM limitada: gracias a las cuantizaciones IQ1_S, IQ2_XXS e IQ2_M, el modelo puede ejecutarse en GPUs de consumo con 8-12 GB de VRAM, permitiendo probar un MoE de 25B parámetros en hardware asequible.
- Prototipado de asistentes conversacionales: el tag "conversational" y la compatibilidad con endpoints permiten integrar el modelo en un chatbot de pruebas mediante llama.cpp u Ollama, sin necesidad de infraestructura dedicada.
- Evaluación comparativa de cuantizaciones: al publicarse 24 variantes de cuantización, el repositorio sirve para medir el impacto de la cuantización (de IQ1_S a Q6_K) en la calidad de las respuestas sobre una misma base.
- Inferencia en CPU: las variantes Q4_0, Q4_1 y Q4_K_S son adecuadas para ejecución en CPU con llama.cpp, útil para entornos sin GPU.
- Fine-tuning posterior sobre GGUF: no aplicable directamente (los GGUF no son entrenables), pero las variantes de mayor precisión (Q6_K, Q5_K_M) pueden servir como referencia para comparar con el modelo original en FP16/BF16.
- Investigación sobre MoE de bajo rango activo: el modelo permite estudiar el comportamiento de un MoE con ~4B parámetros activos sobre 25B totales en tareas de razonamiento y conversación, siempre que se validen los resultados con benchmarks propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - IQ1_S / IQ2_XXS: aproximadamente 6-8 GB.
  - IQ2_M / Q3_K_S / Q3_K_M: aproximadamente 10-12 GB.
  - Q4_K_S / Q4_K_M / IQ4_XS: aproximadamente 14-16 GB.
  - Q5_K_M / Q6_K: aproximadamente 18-22 GB.
- GPU recomendadas: RTX 3060 12 GB o superior para cuantizaciones bajas; RTX 4090 24 GB para Q5_K_M y Q6_K; A100 40/80 GB o H100 para despliegues de alta concurrencia con vLLM.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB (IQ2/IQ3), RTX 4070 Ti 16 GB (Q4) y RTX 4090 24 GB (Q5/Q6).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones; se requeriría convertir a safetensors.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| ThinkingNuke-gemma-4-26B-A4B-i1-GGUF | 25.233.142.046 | ~4B (inferido) | no disponible | no disponible | GGUF |
| Gemma 2 27B | 27B | 27B (denso) | 8K | Gemma License | safetensors, GGUF |
| Mixtral 8x7B | 46,7B | 12,9B | 32K | Apache 2.0 | safetensors, GGUF |
| Qwen2.5 32B | 32,5B | 32,5B (denso) | 128K | Apache 2.0 | safetensors, GGUF |

La comparativa es orientativa: no se dispone de datos de rendimiento del modelo evaluado, por lo que la comparación se limita a parámetros, contexto y licencia. El modelo evaluado destaca por su bajo número de parámetros activos (~4B), lo que reduce el coste computacional por token frente a densos de tamaño similar, pero carece de información pública sobre licencia y contexto.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible contactar con el autor del modelo base antes de usarlo en producción.
- Idiomas no documentados: se desconoce si el modelo soporta castellano u otros idiomas distintos del inglés.
- Sin benchmarks publicados: no hay evidencia objetiva de calidad en MMLU, HumanEval, GSM8K u otras pruebas; el rendimiento debe validarse con evaluaciones propias.
- Riesgo de alucinación: no cuantificado; al ser un modelo conversacional sin documentación de entrenamiento, el riesgo es desconocido.
- Sesgos conocidos: no documentados.
- El repositorio es un artefacto de cuantización, no un modelo entrenado: los posibles defectos del modelo base se heredan en todas las variantes.
- Las cuantizaciones IQ1_S e IQ2_XXS pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso en producción.
- El modelo base (ThinkingNuke-gemma-4-26B-A4B) tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validación por parte de la comunidad.
- Fecha de creación futura (2026-11-17): conviene verificar la integridad y procedencia del repositorio antes de descargarlo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ThinkingNuke-gemma-4-26B-A4B-i1-GGUF
- Modelo base: https://huggingface.co/krystofmitka/ThinkingNuke-gemma-4-26B-A4B
- Perfil del autor de la cuantización: https://huggingface.co/mradermacher
