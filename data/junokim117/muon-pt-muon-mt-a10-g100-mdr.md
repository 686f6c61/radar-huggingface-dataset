# junokim117/muon-PT-muon-MT-a10-g100-mdr

## Resumen

muon-PT-muon-MT-a10-g100-mdr es un checkpoint intermedio de un modelo de lenguaje de 494 millones de parámetros desarrollado por el usuario junokim117, derivado de un checkpoint previo denominado Muon PT. El modelo se ha sometido a una fase de midtraining de 10.000 pasos sobre 20.970 millones de tokens, combinando el corpus DCLM con el dataset matemático FineMath-4plus, con un 10% del presupuesto de tokens reservado a este último y un tramo final de 1.000 pasos entrenado exclusivamente con FineMath.

El interés técnico del checkpoint reside en su metodología de entrenamiento: reproduce con Megatron-LM los resultados del artículo arXiv 2610.29348, empleando el optimizador Muon en lugar de AdamW durante el midtraining. La arquitectura subyacente es Qwen2, según las etiquetas del repositorio, y los pesos se distribuyen en formato safetensors con licencia Apache 2.0.

Se trata de un artefacto de investigación más que de un modelo listo para producción: no incluye model card con idiomas soportados, no publica benchmarks y acumula cero descargas. Su valor está en documentar el efecto del optimizador Muon y del currículo de datos (DCLM más FineMath) sobre las pérdidas finales, que el autor reporta como 2,9684 en DCLM y 1,5509 en FineMath sobre un subconjunto de 32 millones de tokens.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen2 (según tag `qwen2`) |
| Parámetros totales | 494.032.768 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; sin GGUF en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 1,0 GB |
| Pipeline | text-generation |
| Librería | transformers |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen2, un transformer decoder-only con atención causal estándar, aunque la información proporcionada no detalla el número de capas, dimensiones ocultas ni cabezas de atención. Con 494 millones de parámetros y un repositorio de 1,0 GB en safetensors, los pesos se almacenan presumiblemente en fp32 o bf16 (a razón de 2 bytes por parámetro, 494M parámetros equivalen a aproximadamente 0,99 GB).

El entrenamiento parte del checkpoint Muon PT y aplica 10.000 pasos de midtraining con el optimizador Muon sobre una mezcla de DCLM y FineMath-4plus. FineMath representa el 10% del presupuesto de tokens (unos 2.097 millones de los 20.970 millones totales), y los últimos 1.000 pasos se entrenan con FineMath al 100%. La tasa de aprendizaje se mantiene en 5e-4 durante 9.000 pasos y decae linealmente hasta 1e-5. El autor indica que reproduce el artículo arXiv 2610.29348 con Megatron-LM. No se especifica si hubo fases de SFT, RLHF o DPO, ni la composición detallada del corpus DCLM utilizado.

## Capacidades

- Generación de texto autoregresiva en inglés, a juzgar por los corpus de entrenamiento (DCLM y FineMath), aunque los idiomas no se declaran formalmente.
- Razonamiento matemático reforzado por el currículo de FineMath-4plus, con pérdida final de 1,5509 en ese dominio.
- Modelado de lenguaje general sobre DCLM, con pérdida final de 2,9684.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo thinking explícito: no disponible.

## Casos de uso

- Investigación sobre optimizadores: el checkpoint permite reproducir y analizar el efecto de Muon frente a AdamW en el midtraining de un modelo de 494M, comparando curvas de pérdida en DCLM y FineMath.
- Experimentos de currículo de datos: sirve para estudiar cómo afecta reservar el 10% de tokens a contenido matemático y cerrar con 1.000 pasos al 100% de FineMath sobre las pérdidas finales por dominio.
- Punto de partida para fine-tuning matemático: al estar especializado en FineMath, es un base razonable para tareas de aritmética y razonamiento simbólico de dominio acotado, con la ventaja de caber en una sola GPU de consumo.
- Réplica de resultados con Megatron-LM: útil para validar pipelines de entrenamiento a escala pequeña antes de escalar a modelos mayores.
- Evaluación de recetas de decaimiento de learning rate: el esquema 5e-4 constante durante 9.000 pasos y decaimiento lineal a 1e-5 permite aislar el impacto de esta política.
- Docencia y experimentación con transformers: sus 494M parámetros y licencia Apache 2.0 lo hacen manejable para prácticas de fine-tuning, inferencia y análisis de pesos en entornos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta pérdidas sobre un subconjunto de 32 millones de tokens:

| Métrica | Valor |
|---|---|
| Pérdida final en DCLM (subconjunto 32M tokens) | 2,9684 |
| Pérdida final en FineMath (subconjunto 32M tokens) | 1,5509 |

No se proporcionan comparaciones con MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1 GB de pesos más overhead de activaciones y caché KV; en la práctica, entre 2 y 4 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,5 GB de pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 0,25 GB de pesos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090) es sobradamente suficiente; también cabe en GPUs de 8 GB e incluso en sistemas con GPU integrada si se cuantiza.
- Despliegue: compatible con transformers y text-generation-inference según los tags del repositorio. Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, conversión no publicada por el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| muon-PT-muon-MT-a10-g100-mdr | 494M | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen2-0.5B | ~494M | 32.768 tokens (versión base Qwen2) | Apache 2.0 | Hugging Face, ampliamente usado |
| SmolLM-360M | 360M | 2.048 tokens | Apache 2.0 | Hugging Face |
| GPT-2 small | 124M | 1.024 tokens | MIT | Hugging Face |

La comparación con Qwen2-0.5B es la más directa por coincidencia de arquitectura y tamaño, aunque no se dispone de datos de rendimiento del checkpoint de junokim117 para contrastar. SmolLM-360M y GPT-2 small sirven como referencia de la categoría de modelos pequeños; ninguno de los tres comparables cuenta con el currículo matemático específico de este checkpoint.

## Limitaciones y advertencias

- Modelo de investigación sin evaluación: no hay benchmarks publicados, por lo que se desconoce su calidad real en tareas downstream.
- Sin model card completa: no se declaran idiomas, contexto máximo ni instrucciones de uso; el autor solo documenta la receta de entrenamiento.
- Riesgo de alucinación: al ser un modelo base de 494M sin fases de alineación documentadas (RLHF/DPO no mencionados), es esperable un comportamiento conversacional limitado y propensión a generar contenido factualmente incorrecto.
- Sesgos: el corpus DCLM es un dataset web filtrado, por lo que hereda sesgos presentes en la web; no se documenta ningún proceso de mitigación.
- Especialización matemática parcial: el 90% del presupuesto de tokens sigue siendo DCLM, de modo que la especialización en FineMath es moderada y no convierte al modelo en un solver matemático fiable.
- Licencia Apache 2.0: permite uso comercial, pero al no haber evaluación ni garantías del autor, su uso en producción conlleva riesgo técnico no cuantificado.
- Cero tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusión pública que permitan validar la reproducibilidad del entrenamiento.
- Fecha de creación futura en los metadatos (2026-11-15): conviene verificar la integridad del repositorio antes de confiar en él para experimentos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/junokim117/muon-PT-muon-MT-a10-g100-mdr
- Checkpoint base Muon PT: https://huggingface.co/junokim117/muon-PT
- Artículo reproducido: arXiv 2610.29348 (referenciado en la model card; sin URL directa en la información proporcionada)
- Megatron-LM: no se incluye enlace en la información disponible
- DCLM: no se incluye enlace en la información disponible
- FineMath-4plus: no se incluye enlace en la información disponible
