# ITLL/GPT2.5.5-Awakened.Thinker-0.1B-GGUF

## Resumen

GPT2.5.5-Awakened.Thinker-0.1B es un modelo de lenguaje causal de tipo GPT-2, con 124.439.808 parámetros (aproximadamente 0,12B), desarrollado por el usuario ITLL y publicado bajo licencia MIT. El modelo base es `11-47/GPT2.5.5-Awakened.Thinker-0.1B`, y la variante aquí descrita es una cuantización GGUF estática generada por mradermacher. A pesar del nombre comercial ("GPT2.5.5", "GPT_5.5"), no guarda relación con la familia GPT de OpenAI; se trata de un fine-tune completo sobre una arquitectura GPT-2 clásica, orientado a tareas de razonamiento y "thinking".

El modelo se ha entrenado mediante destilación sobre dos datasets propios del autor (`WithinUsAI/GPT_5.5_Distilled` y `WithinUsAI/GPT5.5_thinking_max_distill_god_seed_25K`), con el objetivo declarado de incorporar trazas de razonamiento al estilo de los modelos "thinking". Su relevancia práctica es limitada: por tamaño y arquitectura, es un modelo de experimentación y prototipado, no un competidor de modelos de razonamiento actuales.

La ficha se centra en la variante GGUF, que incluye 12 cuantizaciones estáticas (desde Q2_K hasta f16) en un repositorio de 1,3 GB. El modelo solo declara soporte para inglés y no se han publicado benchmarks ni detalles de entrenamiento más allá de los tags de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (GPT-2) |
| Parametros totales | 124.439.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (GPT-2 estándar: 1024 tokens; no confirmado por el autor) |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF (repo); modelo base en transformers/safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal de tipo GPT-2, con 124,4 millones de parámetros. No se dispone de información sobre el número de capas, dimensiones ocultas, cabezas de atención ni la longitud de contexto configurada en el modelo base. El modelo se ha sometido a un fine-tune completo (tag `full-fine-tune`), no a un ajuste por adaptadores.

El entrenamiento se basa en destilación a partir de dos datasets del autor: `WithinUsAI/GPT_5.5_Distilled` y `WithinUsAI/GPT5.5_thinking_max_distill_god_seed_25K`. Los tags indican orientación a "thinking" y "reasoning", lo que sugiere que los datos incluyen trazas de razonamiento destiladas de un modelo mayor. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO o alguna innovación técnica adicional. La cuantización GGUF fue realizada por mradermacher con `quantize_version: 2` y `output_tensor_quantised: 1`; no hay cuantizaciones ponderadas/imatrix disponibles según la model card.

## Capacidades

- Generación de texto causal en inglés.
- Razonamiento y "thinking" (según tags y datasets de destilación; sin evidencia cuantitativa publicada).
- Fine-tune completo sobre GPT-2, lo que permite ajustes posteriores sobre la base.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso verificado.
- Multilingüe: no; solo inglés declarado.
- Sin capacidades de visión, audio ni modalidades adicionales.
- Compatible con endpoints (tag `endpoints_compatible`) y con el ecosistema transformers/GGUF.

## Casos de uso

- Prototipado rápido de pipelines de generación de texto: al ocupar ~0,2 GB en Q4_K_M, se puede cargar en cualquier máquina para validar integraciones con llama.cpp u Ollama antes de pasar a modelos mayores.
- Experimentación con destilación de razonamiento: útil como caso de estudio de cómo un fine-tune completo sobre GPT-2 intenta incorporar trazas de "thinking" a partir de datasets destilados.
- Educación e investigación sobre cuantización: el repositorio ofrece 12 variantes GGUF, lo que permite comparar perplejidad y calidad entre tipos de cuantización en un modelo pequeño.
- Generación de texto creativo en inglés de baja latencia: para demos, bots simples o generación de continuaciones donde no se requiere alta calidad.
- Pruebas de despliegue en CPU: con 0,2 GB en Q4_K_S, es adecuado para entornos sin GPU y para validar infraestructura de serving (llama.cpp, Ollama) a coste mínimo.
- Baseline para comparativas: sirve como referencia de modelo pequeño en experimentos de evaluación de razonamiento o de destilación, siempre que se documente su limitación de tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,2 GB en Q4_K_M/Q4_K_S; ~0,4 GB en f16 (según tamaños de archivo del repo).
- GPU recomendadas: cualquier GPU con ≥1 GB de VRAM; no requiere GPU dedicada.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna (RTX 3060, RTX 4090, GTX 1650, etc.) e incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base es compatible con transformers.
- Latencia y throughput: no disponibles. Por tamaño, se espera throughput alto en CPU y GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ITLL/GPT2.5.5-Awakened.Thinker-0.1B-GGUF | 124,4M | no disponible | MIT | GGUF | Fine-tune de GPT-2 con destilación de razonamiento |
| GPT-2 (OpenAI) | 124M | 1024 | MIT | safetensors, GGUF | Modelo base original; sin fine-tune de razonamiento |
| DistilGPT-2 | 82M | 1024 | Apache 2.0 | safetensors, GGUF | Destilado de GPT-2; orientado a generación general |
| SmolLM-135M | 135M | 2048 | Apache 2.0 | safetensors, GGUF | Modelo pequeño moderno con mejor calidad general |

La comparativa es orientativa: no hay benchmarks publicados de este modelo que permitan una comparación cuantitativa con las alternativas.

## Limitaciones y advertencias

- Tamaño muy reducido (124M): la calidad de generación y razonamiento será limitada en comparación con modelos actuales.
- Riesgo alto de alucinación y de incoherencia en cadenas de razonamiento largas.
- Solo inglés declarado; no se garantiza comportamiento en castellano u otros idiomas.
- Longitud de contexto no documentada; probablemente 1024 tokens (estándar GPT-2), insuficiente para tareas de contexto largo.
- Nombres y tags del modelo ("GPT2.5.5", "GPT_5.5") pueden inducir a confusión: no es un modelo de OpenAI ni un GPT-5.5.
- Sin benchmarks ni evaluación independiente publicada; no recomendable para producción sin validación propia.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad en un modelo tan pequeño.
- No hay cuantizaciones ponderadas/imatrix disponibles según la model card.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ITLL/GPT2.5.5-Awakened.Thinker-0.1B-GGUF)
- [Modelo base](https://huggingface.co/11-47/GPT2.5.5-Awakened.Thinker-0.1B)
- [Repositorio de cuantizaciones de mradermacher](https://huggingface.co/mradermacher/GPT2.5.5-Awakened.Thinker-0.1B-GGUF)
- [Página de descarga de mradermacher](https://hf.tst.eu/model#GPT2.5.5-Awakened.Thinker-0.1B-GGUF)
- [Dataset WithinUsAI/GPT_5.5_Distilled](https://huggingface.co/datasets/WithinUsAI/GPT_5.5_Distilled)
- [Dataset WithinUsAI/GPT5.5_thinking_max_distill_god_seed_25K](https://huggingface.co/datasets/WithinUsAI/GPT5.5_thinking_max_distill_god_seed_25K)
