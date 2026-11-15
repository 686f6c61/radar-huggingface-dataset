# mradermacher/jais-adapted-13b-i1-GGUF

## Resumen

`mradermacher/jais-adapted-13b-i1-GGUF` es una colección de cuantizaciones GGUF del modelo `inception42/jais-adapted-13b`, un modelo causal de tipo decoder de 13.343.544.320 parámetros orientado a generación de texto en árabe e inglés. El trabajo de cuantización lo firma mradermacher, un publicador habitual de versiones GGUF de modelos abiertos, y emplea la técnica de cuantización con matriz de importancia (imatrix) para preservar la calidad en formatos de baja precisión.

El modelo base pertenece a la familia Jais, desarrollada originalmente por Inception (G42) junto con MBZUAI y Cerebras, y está adaptado por inception42. La relevancia de esta ficha reside en que permite ejecutar un modelo de 13B especializado en árabe en hardware de consumo mediante llama.cpp y derivados, algo imposible con los pesos originales en safetensors. El repo ocupa 151,4 GB en total porque incluye todas las variantes de cuantización en un único repositorio.

La licencia es Apache 2.0, lo que facilita el uso comercial, y los idiomas declarados son árabe (`ar`) e inglés (`en`). No se dispone de información sobre la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks en la documentación proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal (causal-lm), familia Jais |
| Parámetros totales | 13.343.544.320 |
| Parámetros activos | no disponible (no es MoE según los tags) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-Q2_K_S, i1-IQ2_M, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | árabe (ar), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones imatrix del modelo base en safetensors) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder causal de 13B parámetros, etiquetado como `causal-lm` y perteneciente a la familia Jais. Los tags indican que se trata de un modelo denso (no se declara MoE) y que la adaptación la realiza inception42 sobre la arquitectura Jais original. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o instrucción tuning.

La innovación técnica relevante en esta ficha es el proceso de cuantización: mradermacher genera cuantizaciones ponderadas con imatrix (matriz de importancia) a partir de los pesos en formato Hugging Face, lo que permite obtener variantes de baja precisión con mejor relación calidad/tamaño que las cuantizaciones estáticas equivalentes. El autor indica que las variantes IQ suelen ser preferibles a las no-IQ de tamaño similar, y que `i1-Q4_K_M` (8,2 GB) es la opción "rápida y recomendada". También existe una colección paralela de cuantizaciones estáticas en `mradermacher/jais-adapted-13b-GGUF`.

## Capacidades

- Generación de texto autoregresiva en árabe e inglés.
- Modelo causal de completado y continuación de texto; no se documenta un modo de instrucciones o chat específico.
- Soporte multilingüe limitado a los dos idiomas declarados (árabe e inglés).
- No se documenta soporte de tool calling, function calling ni agentes multi-paso en la información disponible.
- No se documenta capacidad de visión, audio ni modo de razonamiento explícito (thinking mode).
- Compatible con el ecosistema `transformers` y con el ecosistema GGUF (llama.cpp y derivados).

## Casos de uso

- Generación de contenido en árabe: redacción de artículos, resúmenes y textos divulgativos en árabe clásico moderno, aprovechando que el modelo pertenece a una familia diseñada específicamente para ese idioma y puede ejecutarse en local con cuantizaciones de 7-8 GB.
- Traducción árabe-inglés: uso como motor de traducción en pipelines internos donde no se quiera depender de APIs externas, desplegando la variante `i1-Q4_K_M` en una GPU de consumo.
- Procesamiento de documentos en árabe: extracción y reformulación de contenido de PDFs y textos administrativos, con la ventaja de que el modelo puede ejecutarse en hardware modesto y sin conexión.
- Asistentes conversacionales de dominio cerrado en árabe: integración en aplicaciones de atención al cliente para el mercado arabófono, con la salvedad de que no se documenta un modo de instrucciones explícito y habría que evaluar el comportamiento en formato conversacional.
- Investigación sobre modelos árabes: uso como referencia para estudiar el comportamiento de la familia Jais en distintas cuantizaciones, comparando perplejidad y calidad entre variantes IQ y K-quant.
- Despliegue en entornos con recursos limitados: la variante `i1-IQ2_XS` (4,2 GB) permite ejecutar un modelo de 13B en GPUs de 6-8 GB o incluso en CPU con llama.cpp, útil para prototipado y demos.
- Fine-tuning ligero o evaluación comparativa: el modelo base en safetensors (`inception42/jais-adapted-13b`) puede servir como punto de partida para adaptaciones, mientras que las cuantizaciones GGUF sirven para validar el comportamiento en inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: desde ~3,2 GB (i1-IQ1_S) hasta ~11,0 GB (i1-Q6_K); la recomendada `i1-Q4_K_M` ocupa 8,2 GB y requiere en torno a 9-10 GB de VRAM incluyendo overhead de contexto.
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100 para las variantes de mayor precisión (Q5, Q6); RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070 para Q4_K_M.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más usando cuantizaciones Q3/Q4; las variantes IQ2 caben en GPUs de 6 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| jais-adapted-13b-i1-GGUF (este) | 13,3B | no disponible | ar, en | Apache 2.0 | GGUF |
| jais-adapted-13b-GGUF (cuantizaciones estáticas) | 13,3B | no disponible | ar, en | Apache 2.0 | GGUF |
| inception42/jais-adapted-13b (base) | 13,3B | no disponible | ar, en | Apache 2.0 | safetensors |
| Jais-13b original (Inception/MBZUAI/Cerebras) | 13B | no disponible | ar, en | no disponible en esta ficha | no disponible |

La comparativa se limita a variantes del mismo modelo porque la información proporcionada no incluye datos de rendimiento que permitan contrastarlo con otras familias. No se dispone de benchmarks que permitan comparar calidad frente a alternativas como AceGPT, ArabianGPT u otros modelos árabes.

## Limitaciones y advertencias

- Las cuantizaciones de muy baja precisión (IQ1, IQ2, Q2_K) degradan notablemente la calidad; el propio autor las etiqueta como "for the desperate" o "very low quality".
- No se documenta la longitud de contexto del modelo base, lo que impide planificar cargas de trabajo con ventanas largas sin verificación empírica.
- El modelo está orientado a árabe e inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- No se documenta un modo de instrucciones o chat; el uso como asistente conversacional requiere validación previa del formato de prompt.
- Riesgo de alucinación inherente a los modelos causales de 13B, especialmente en tareas factuales y en dominios especializados.
- Sesgos conocidos: no documentados en la información disponible; cabe esperar sesgos derivados de los datos de entrenamiento del modelo base, no especificados.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base `inception42/jais-adapted-13b` por si añade restricciones adicionales.
- El repositorio ocupa 151,4 GB porque agrupa todas las cuantizaciones; descargar solo el archivo GGUF necesario en lugar de clonar el repo completo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/jais-adapted-13b-i1-GGUF
- Modelo base: https://huggingface.co/inception42/jais-adapted-13b
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/jais-adapted-13b-GGUF
- Página de overview del autor: https://hf.tst.eu/model#jais-adapted-13b-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
