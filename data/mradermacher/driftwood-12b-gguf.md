# mradermacher/Driftwood-12B-GGUF

## Resumen

Driftwood-12B-GGUF es la versión cuantizada en formato GGUF del modelo Driftwood-12B, publicado por el usuario mradermacher, conocido en la comunidad por producir cuantizaciones de alta calidad de modelos open source. El modelo original (SanXM1/Driftwood-12B) es un merge de modelos creado con mergekit, orientado a conversación en inglés, con 12.247 millones de parámetros. Esta ficha se centra en la distribución GGUF, que es la vía práctica para ejecutar el modelo en hardware de consumo mediante llama.cpp, Ollama o interfaces compatibles.

El modelo resuelve el problema de desplegar un modelo de 12B en entornos sin GPUs de datacenter: al ofrecer cuantizaciones desde Q2_K (4,9 GB) hasta Q8_0 (13,1 GB), permite elegir el equilibrio entre calidad y requisitos de memoria. Es relevante para desarrolladores que quieren probar merges comunitarios de 12B en local sin depender de infraestructura en la nube.

La información pública disponible es limitada: no se detallan los modelos de origen del merge ni el dataset de entrenamiento, y no hay benchmarks publicados. La licencia tampoco está especificada en la model card, lo que supone una advertencia importante para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (merge de modelos, sin detalles adicionales) |
| Parámetros totales | 12.247.782.400 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (también existe el modelo base en formato transformers/safetensors) |

## Arquitectura y entrenamiento

El modelo es un merge creado con mergekit a partir de modelos no especificados en la información disponible. No se documenta la técnica de merge concreta (SLERP, TIES, DARE, etc.), ni los modelos de origen, ni el número de tokens de entrenamiento. Tampoco hay información sobre RLHF, DPO u otras fases de alineación. Al tratarse de un merge, la arquitectura subyacente es la de los transformers de 12B que lo componen, pero no se detalla en la model card.

La contribución de mradermacher es la cuantización estática (quantize_version 2, output_tensor_quantised 1) del modelo original a GGUF, con una variante adicional con cuantización ponderada/imatrix publicada por separado (Driftwood-12B-i1-GGUF). No se documentan innovaciones técnicas propias del modelo más allá del proceso de merge.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta "conversational" del repositorio.
- Razonamiento general y respuesta a instrucciones, derivado de los modelos base del merge (no documentado en detalle).
- No hay evidencia publicada de soporte de tool calling o function calling.
- No hay evidencia publicada de capacidades de agente o razonamiento multi-paso.
- Multilingüe: limitado a inglés según la model card.
- No se documentan capacidades de visión, audio ni modo thinking.

## Casos de uso

- Prototipado local de chatbots: el modelo puede ejecutarse en una GPU de consumo con la cuantización Q4_K_M (7,6 GB) para probar flujos conversacionales en inglés antes de comprometerse con un modelo mayor.
- Experimentación con merges comunitarios: útil para investigadores que quieren evaluar cualitativamente si un merge de 12B se ajusta a su dominio antes de invertir en infraestructura.
- Generación de texto creativo en inglés: con Q6_K (10,2 GB) se obtiene calidad cercana al modelo original para escritura asistida y lluvia de ideas.
- Despliegue en estaciones de trabajo sin GPU dedicada: las cuantizaciones Q2_K y Q3_K permiten ejecución en CPU con llama.cpp, aunque con pérdida de calidad.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 11 variantes, lo que permite medir el impacto de la cuantización en la perplejidad y la calidad de salida para un modelo de 12B.
- Base para fine-tuning ligero: al existir el modelo original en transformers, se puede partir de él para adaptaciones con LoRA antes de cuantizar de nuevo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del archivo GGUF más overhead de contexto. Q4_K_M requiere unos 8 GB; Q8_0 unos 14 GB.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4_K_M/Q5_K_M; RTX 4090 24 GB o A100 para Q8_0 con contexto largo.
- Cabe en GPU de consumo: sí, desde GTX 1660 6 GB con Q2_K hasta RTX 4090 con Q8_0.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. La etiqueta endpoints_compatible sugiere compatibilidad con Hugging Face Inference Endpoints.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Driftwood-12B-GGUF | 12,2B | no disponible | no disponible | GGUF | Merge comunitario, solo inglés |
| Mistral-Nemo-12B | 12B | 128K | Apache 2.0 | safetensors, GGUF | Modelo oficial con licencia permisiva y contexto largo |
| Gemma-2-9B | 9B | 8K | Gemma license | safetensors, GGUF | Modelo oficial de Google, multilingüe |
| Yi-1.5-9B | 9B | 4K/32K | Apache 2.0 | safetensors, GGUF | Buen rendimiento en razonamiento y código |

La comparación es aproximada: no hay datos de benchmarks de Driftwood-12B que permitan situarlo frente a estos modelos. La principal desventaja del modelo es la ausencia de licencia declarada y de documentación sobre su entrenamiento, frente a alternativas oficiales con licencias claras.

## Limitaciones y advertencias

- Licencia no especificada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor o consultar el modelo base antes de usarlo en producción.
- Solo inglés: no hay soporte documentado de otros idiomas.
- Sin benchmarks: no hay evidencia cuantitativa de calidad frente a modelos oficiales de tamaño similar.
- Origen del merge no documentado: se desconoce qué modelos lo componen y con qué datos se entrenaron, lo que dificulta evaluar sesgos y riesgos.
- Riesgo de alucinación: inherente a los modelos de lenguaje de este tamaño, agravado por la falta de evaluación publicada.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo sin verificar experimentalmente la ventana efectiva.
- Comunidad pequeña (151 descargas, 1 like en el momento de la consulta): soporte y mantenimiento limitados.
- Las cuantizaciones Q2_K y Q3_K_M pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso real.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Driftwood-12B-GGUF
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Driftwood-12B-i1-GGUF
- Modelo base: https://huggingface.co/SanXM1/Driftwood-12B
- Página de descargas del autor: https://hf.tst.eu/model#Driftwood-12B-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
