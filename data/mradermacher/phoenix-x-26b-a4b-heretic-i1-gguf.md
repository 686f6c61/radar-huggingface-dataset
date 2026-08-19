# mradermacher/Phoenix-X-26B-A4B-Heretic-i1-GGUF

## Resumen

Phoenix-X-26B-A4B-Heretic es un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) con 26.000 millones de parámetros totales y 4.000 millones de parámetros activos por token. El repositorio en HuggingFace corresponde a una cuantización GGUF preparada por mradermacher, a partir del modelo original alojado por alexokita. Aunque la ficha oficial no detalla la procedencia, las referencias cruzadas en la web indican que el modelo base deriva de la familia Gemma 4 de Google (específicamente de la variante 26B-A4B), con ajustes orientados a conversación sin censura (etiqueta "Heretic" y mención en guías de modelos "uncensored").

Esta ficha cubre la versión cuantizada GGUF, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp u Ollama, reduciendo los requisitos de memoria frente al modelo original en precisión completa. La relevancia actual radica en que ofrece una alternativa de alto rendimiento con bajo coste de inferencia gracias a su diseño MoE, y en que las cuantizaciones facilitan su despliegue local. No obstante, la información pública disponible es limitada: no se han publicado especificaciones detalladas de entrenamiento, benchmarks ni licencia oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), probablemente basada en Gemma 4 (no confirmado oficialmente) |
| Parametros totales | 26.000 millones |
| Parametros activos | 4.000 millones |
| Longitud de contexto | no disponible (se desconoce si el modelo base soporta 128k como Gemma 4, pero no hay confirmación) |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors no incluido en este repo) |

## Arquitectura y entrenamiento

El modelo original (Phoenix-X-26B-A4B-Heretic) es un MoE con 26B parámetros totales y 4B activos, lo que implica una selección de expertos por token. Según las referencias web, se trata de una variante de Gemma 4 26B-A4B, que incorpora soporte multimodal (visión) y razonamiento. El sufijo "Heretic" sugiere un fine-tuning orientado a eliminar restricciones de contenido, común en modelos "uncensored". No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset o técnicas de alineación (RLHF/DPO) empleadas. La cuantización GGUF fue realizada por mradermacher con la herramienta de imatrix (indicada en los comentarios de la model card), lo que optimiza la precisión de las cuantizaciones de baja bitrate.

## Capacidades

- Generación de texto conversacional y de larga forma, con énfasis en respuestas sin filtros de contenido (según la etiqueta "uncensored").
- Razonamiento multi-step y soporte de agentes, probablemente heredado de la base Gemma 4, aunque no hay confirmación oficial.
- Posible soporte de visión (Gemma 4 incluye capacidades multimodales), pero no está verificado en esta variante.
- Soporte de tool calling y function calling: no confirmado, pero plausible dado el origen.
- Multilingüismo: no disponible en la documentación, aunque Gemma 4 es multilingüe.
- Modo "thinking" o razonamiento extendido: no documentado.

## Casos de uso

- Chat sin censura para investigación de sesgos y comportamientos de modelos: al ser un modelo "uncensored", puede usarse para estudiar cómo responde ante temas sensibles sin filtros, siempre con fines académicos y éticos.
- Generación de contenido creativo con restricciones mínimas: escritura de ficción, guiones o diálogos que requieren un tono adulto o controvertido.
- Prototipado de asistentes conversacionales locales: gracias a las cuantizaciones GGUF, puede desplegarse en una GPU de consumo (p. ej., RTX 4090 con 24 GB) para pruebas de concepto.
- Aplicaciones de razonamiento y resolución de problemas en entornos offline: su arquitectura MoE ofrece buena relación calidad/velocidad para tareas de lógica y matemáticas básicas.
- Experimentación con técnicas de cuantización: los múltiples formatos (Q2_K, IQ3_M, etc.) permiten comparar la degradación de calidad frente al uso de memoria.
- Desarrollo de agentes conversacionales con memoria larga: si el contexto es amplio (a confirmar), podría mantener conversaciones extensas sin pérdida de coherencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni similares. Las referencias web tampoco aportan datos cuantitativos de rendimiento. Se recomienda consultar el modelo base Gemma 4 26B-A4B para estimaciones orientativas, pero no se deben extrapolar cifras sin verificación.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización. Para Q4_K_M (tamaño aproximado ~15-16 GB) se necesitan al menos 16 GB de VRAM; para Q2_K (~9-10 GB) unos 12 GB. El modelo completo en FP16 requeriría ~52 GB (según LLM Explorer, 51.6 GB).
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para cuantizaciones medias; A100 (40/80 GB) o H100 para el modelo sin cuantizar o cuantizaciones altas.
- En consumer GPU: sí, con cuantizaciones Q4_K_M o inferiores en GPUs de 16-24 GB. No cabe en 8 GB.
- Opciones de despliegue: llama.cpp (CLI o servidor), Ollama, LM Studio, vLLM (si se convierte a formato compatible), o TGI (requiere safetensors, no GGUF).
- Latencia y throughput: no disponibles. En una RTX 4090 con Q4_K_M, se estima una velocidad de 30-50 tokens/s para un MoE de 4B activos, pero es una estimación sin verificar.

## Comparativa con modelos similares

| Modelo | Params totales | Params activos | Contexto | Licencia | Disponibilidad GGUF |
|---|---|---|---|---|---|
| Phoenix-X-26B-A4B-Heretic | 26B | 4B | no disponible | no disponible | Sí (este repo) |
| Gemma 4 26B A4B (original) | 26B | 4B | 128k (según especificaciones de Google) | Gemma Terms of Use | Sí (repos oficiales y de terceros) |
| Mixtral 8x7B | 47B | 13B | 32k | Apache 2.0 | Sí |
| Qwen2.5-32B-A3B | 32B | 3B | 128k | Apache 2.0 | Sí |

Phoenix-X se diferencia por su enfoque "uncensored" y por ser una variante de Gemma 4. Frente a Mixtral, ofrece menor coste por token (4B activos vs 13B) y posiblemente mejor rendimiento en razonamiento, aunque sin datos de benchmarks. Qwen2.5-32B-A3B es comparable en diseño MoE y tiene licencia permisiva, mientras que Phoenix-X carece de licencia clara, lo que limita su uso comercial.

## Limitaciones y advertencias

- Licencia no especificada: el uso comercial es arriesgado. La ausencia de licencia en el repo impide saber si se puede utilizar en producción o en proyectos propietarios.
- Sesgos y contenido ofensivo: al ser un modelo "uncensored", puede generar respuestas inapropiadas, discriminatorias o dañinas. No debe desplegarse en entornos públicos sin moderación.
- Alucinaciones: sin datos de entrenamiento ni benchmarks, no se puede evaluar su fiabilidad. Los modelos MoE de este tamaño tienden a alucinar en dominios especializados.
- Contexto no confirmado: si la longitud de contexto es inferior a la de Gemma 4, las conversaciones largas pueden degradarse.
- Calidad de la cuantización: las versiones de baja bitrate (Q2_K, IQ1_M) pueden perder precisión significativa en tareas de razonamiento.
- Soporte de visión no verificado: aunque Gemma 4 lo incluye, esta variante puede haberlo eliminado o no funcionar correctamente con el GGUF.

## Enlaces

- Repositorio GGUF de mradermacher: https://huggingface.co/mradermacher/Phoenix-X-26B-A4B-Heretic-i1-GGUF
- Modelo original (alexokita): https://huggingface.co/alexokita/Phoenix-X-26B-A4B-Heretic
- Perfil de mradermacher: https://huggingface.co/mradermacher
- Referencia de Gemma 4 26B A4B en LM Studio: https://lmstudio.ai/models/google/gemma-4-26b-a4b
- Entrada en LLM Explorer: https://llm-explorer.com/model/Vortex5%2FPhoenix-X-26B-A4B,dzCqHIesneY7qEgEMWEYm
- Artículo sobre modelos uncensored locales: https://insiderllm.com/guides/best-uncensored-local-llms/
