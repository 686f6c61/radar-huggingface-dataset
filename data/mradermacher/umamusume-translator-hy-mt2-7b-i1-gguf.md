# mradermacher/umamusume-translator-hy-mt2-7b-i1-GGUF

## Resumen

El modelo `mradermacher/umamusume-translator-hy-mt2-7b-i1-GGUF` es una cuantización GGUF con matriz de importancia (imatrix) del modelo `Mario51/umamusume-translator-hy-mt2-7b`, un ajuste fino especializado en la traducción de contenido del juego *Uma Musume Pretty Derby*. El modelo base deriva de la familia Hy-MT2 de Tencent, diseñada para traducción multilingüe entre 33 idiomas, y este ajuste concreto se centra en el vocabulario, los diálogos y las historias del popular juego de carreras de caballos japonés.

La cuantización, realizada por mradermacher, ofrece 24 variantes de compresión que van desde 1,9 GB (IQ1_S) hasta 6,3 GB (Q6_K), lo que permite ejecutar el modelo en hardware de consumo con requisitos de VRAM muy reducidos. El modelo tiene 7.504.568.320 parámetros (7,5B) y está pensado para su uso con motores de inferencia compatibles con GGUF como llama.cpp, Ollama o LM Studio.

La relevancia de esta ficha radica en que combina un modelo de traducción de última generación con un ajuste de dominio muy específico, ofreciendo a la comunidad de fans y desarrolladores una herramienta práctica para localizar contenido de *Uma Musume* sin necesidad de infraestructura de alto rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basada en Hy-MT2, probablemente transformer encoder-decoder) |
| Parametros totales | 7.504.568.320 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en (etiqueta de HuggingFace); el modelo base Hy-MT2 soporta 33 idiomas, pero el ajuste fino puede limitar el alcance |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors no incluido en este repo) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base. Se sabe que Hy-MT2 es una familia de modelos de traducción "fast-thinking" desarrollada por Tencent, con tamaños de 1.8B, 7B y 30B-A3B (MoE), todos ellos capaces de traducir entre 33 idiomas y seguir instrucciones de traducción en múltiples lenguas. El modelo de 7B sobre el que se basa este ajuste fino probablemente emplea una arquitectura transformer encoder-decoder, aunque no se confirma en los metadatos.

El ajuste fino de `Mario51/umamusume-translator-hy-mt2-7b` se ha realizado sobre datos específicos del juego *Uma Musume*, lo que implica un entrenamiento adicional sobre diálogos, nombres de personajes, términos de carreras y jerga propia del juego. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La cuantización imatrix de mradermacher utiliza una matriz de importancia para optimizar la asignación de bits durante la compresión, lo que suele preservar mejor la calidad en cuantizaciones agresivas.

## Capacidades

- Traducción de texto especializada en contenido de *Uma Musume*: diálogos, historias, descripciones de personajes, eventos y términos de carreras.
- Soporte multilingüe heredado del modelo base Hy-MT2 (33 idiomas), aunque el ajuste fino puede priorizar pares concretos (por ejemplo, japonés a inglés).
- Generación de texto en formato conversacional, útil para integrar en chatbots o herramientas de traducción interactiva.
- Capacidad de seguir instrucciones de traducción en varios idiomas, según las características de Hy-MT2.
- No se ha confirmado soporte para tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- **Traducción de diálogos y eventos del juego**: el modelo puede traducir automáticamente las líneas de los personajes de *Uma Musume* desde el japonés original a otros idiomas, preservando el tono y la jerga específica del juego.
- **Localización de wikis y guías comunitarias**: los administradores de wikis dedicadas a *Uma Musume* pueden usar el modelo para traducir grandes volúmenes de texto (habilidades, estadísticas, estrategias) de forma coherente y rápida.
- **Herramientas de traducción en tiempo real para streaming**: los creadores de contenido que juegan a *Uma Musume* pueden integrar el modelo en sus pipelines para subtitular o traducir en vivo las conversaciones del juego.
- **Generación de subtítulos para vídeos y clips**: el modelo puede procesar transcripciones de vídeo y generar subtítulos traducidos, aprovechando su capacidad de manejar contexto conversacional.
- **Chatbots de soporte para comunidades de fans**: se puede desplegar como un bot que responda preguntas sobre el juego traduciendo las consultas y respuestas entre idiomas, gracias a su naturaleza conversacional.
- **Traducción de manuales y documentación técnica**: el modelo puede traducir guías de juego, manuales de estrategia y documentación de la API del juego, manteniendo la terminología especializada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni métricas de traducción como BLEU o COMET para este modelo específico. El modelo base Hy-MT2 ha sido evaluado en el paper correspondiente, pero esos datos no se han incluido en la documentación de esta cuantización.

## Requisitos de hardware

- **VRAM estimada para inferencia**: según la cuantización elegida, desde aproximadamente 2 GB (IQ1_S) hasta 7 GB (Q6_K). Para la cuantización recomendada Q4_K_M (4,7 GB), se necesitan al menos 6 GB de VRAM.
- **GPU recomendadas**: cualquier GPU con 6 GB o más de VRAM puede ejecutar las cuantizaciones más pequeñas. Para Q4_K_M o superiores, se recomienda una RTX 3060, RTX 4060, RTX 2070 o equivalente. Para Q6_K, una RTX 3080 o superior.
- **Compatibilidad con GPU de consumo**: sí, todas las cuantizaciones caben en GPUs de consumo actuales, incluso en tarjetas con 4 GB de VRAM si se usan las variantes más agresivas (IQ1_S, IQ2_XXS).
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui (con backend llama.cpp) y cualquier motor compatible con GGUF. También se puede usar con vLLM si se convierte a otro formato, aunque no es el flujo habitual.
- **Latencia y throughput**: no se han publicado datos específicos. En una RTX 4090, un modelo de 7B cuantizado a Q4_K_M suele alcanzar entre 30 y 50 tokens por segundo, pero estos valores son orientativos y dependen de la implementación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| umamusume-translator-hy-mt2-7b (este) | 7,5B | no disponible | 33 (base) | no disponible | GGUF |
| NLLB-200 (Meta) | 3,3B / 54B | 512 tokens | 200 idiomas | CC-BY-NC | safetensors |
| M2M-100 (Meta) | 418M / 1,2B / 12B | 1024 tokens | 100 idiomas | MIT | safetensors |
| Hy-MT2-7B (Tencent) | 7B | no disponible | 33 | no disponible | safetensors |

La comparativa se basa en modelos de traducción de tamaño similar. NLLB-200 y M2M-100 son alternativas generalistas con licencias más permisivas, pero no están ajustadas al dominio de *Uma Musume*. Hy-MT2-7B es el modelo base sin ajuste fino, que ofrece una cobertura multilingüe más amplia pero sin la especialización en el juego. No se dispone de datos de rendimiento comparativo entre estos modelos.

## Limitaciones y advertencias

- **Licencia no especificada**: el modelo no declara una licencia en HuggingFace, lo que genera incertidumbre sobre su uso comercial. Se recomienda contactar con el autor del modelo base antes de utilizarlo en producción.
- **Sesgos del ajuste fino**: al estar entrenado específicamente con contenido de *Uma Musume*, el modelo puede mostrar un rendimiento deficiente en tareas de traducción general fuera de ese dominio.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede generar traducciones inventadas o incorrectas, especialmente con términos poco frecuentes o nombres propios.
- **Contexto limitado**: no se ha especificado la longitud de contexto, lo que puede limitar la traducción de documentos largos o conversaciones extensas.
- **Idiomas soportados**: aunque el modelo base soporta 33 idiomas, la etiqueta de HuggingFace solo indica "en", lo que sugiere que el ajuste fino puede haberse centrado en inglés o que la documentación es incompleta.
- **Calidad de cuantizaciones extremas**: las variantes IQ1_S e IQ2_XXS presentan una degradación notable de calidad y solo se recomiendan para pruebas o entornos con recursos muy limitados.

## Enlaces

- [Modelo GGUF en HuggingFace](https://huggingface.co/mradermacher/umamusume-translator-hy-mt2-7b-i1-GGUF)
- [Modelo base de Mario51](https://huggingface.co/Mario51/umamusume-translator-hy-mt2-7b)
- [Cuantizaciones estáticas del mismo modelo](https://huggingface.co/mradermacher/umamusume-translator-hy-mt2-7b-GGUF)
- [Repositorio de Hy-MT2 en GitHub](https://github.com/Tencent-Hunyuan/Hy-MT2)
- [Paper de Hy-MT2 en arXiv](https://arxiv.org/html/2605.22064v2)
