# pranil00/ONIX-DeepSeek-V3-GGUF

## Resumen

ONIX-DeepSeek-V3-GGUF es una cuantización extrema del modelo DeepSeek-V3, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. El artefacto consiste en un único fichero GGUF cuantizado con el esquema IQ2_XXS (2,06 bits por peso), que reduce el tamaño de los pesos desde los 75,43 GB en FP16 hasta 9,71 GB, una compresión de 7,77x. El objetivo declarado es permitir la ejecución de un modelo de la familia DeepSeek-V3 en hardware de consumo mediante el motor run-any-model, con soporte para Metal en Apple Silicon, CUDA en GPUs NVIDIA y CPU con AVX2/AVX-512.

La relevancia de esta publicación es fundamentalmente práctica: demuestra la viabilidad técnica de comprimir un modelo de gran tamaño hasta un presupuesto de memoria de aproximadamente 11,5 GB, a costa de una pérdida de calidad estimada del 28 % según la propia model card. No obstante, conviene señalar varias inconsistencias en la documentación del autor: la model card declara 38.570 millones de parámetros, mientras que el modelo base DeepSeek-V3 original tiene 671.000 millones de parámetros totales (37.000 millones activos por token en su arquitectura MoE). La cifra de 38,57 B parece corresponder a los parámetros activos, no a los totales, lo que hace dudoso que el fichero GGUF de 9,71 GB represente realmente el modelo completo.

La ficha se basa exclusivamente en la información publicada en Hugging Face y en la model card del autor. No se han publicado resultados de benchmarks independientes ni datos verificables sobre el proceso de cuantización, por lo que los datos de rendimiento deben tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), familia DeepSeek (según modelo base) |
| Parametros totales | 671 B en el modelo base; la model card declara 38,57 B (probablemente parámetros activos) |
| Parametros activos | 37 B por token en el modelo base (no confirmado para esta cuantización) |
| Longitud de contexto | 8.192 tokens en Apple Silicon y NVIDIA; 4.096 tokens en CPU (según model card) |
| Tipos de cuantizacion | IQ2_XXS (2,06 bits por peso) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (según metadatos; el modelo base DeepSeek-V3 usa licencia propia de DeepSeek) |
| Formato de pesos | GGUF (fichero único `deepseek-ai--DeepSeek-V3-IQ2_XXS.gguf`) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo base deepseek-ai/DeepSeek-V3, un transformer con mezcla de expertos (MoE) de 671.000 millones de parámetros totales y 37.000 millones activos por token, según la documentación pública del modelo original. Esta publicación no aporta información adicional sobre la arquitectura, los datos de entrenamiento, el número de tokens procesados ni si hubo fases de RLHF o DPO; toda esa información debe consultarse en la model card del modelo base.

La innovación técnica de esta publicación es exclusivamente la cuantización: se aplica el esquema IQ2_XXS, un formato de cuantización de bloques con escalas y offsets optimizados para preservar la mayor calidad posible a muy bajos bits por peso. La model card reporta una retención de calidad cognitiva del 72,0 % y una reducción del 87,1 % en el tamaño de los pesos, con un KV cache de 1.708 MB en Q4_0. No se documenta el método exacto de cuantización, el conjunto de calibración utilizado ni el proceso de validación de la pérdida de calidad. La aceleración de capas reportada es de 61/61 capas en Metal.

## Capacidades

- Generación de texto conversacional y extracción de hechos, según la propia model card, que indica que estas capacidades se preservan razonablemente tras la cuantización.
- Razonamiento de orden superior, compilación de código y gramática matizada: la model card advierte explícitamente que estas capacidades pueden verse deterioradas por la compresión extrema.
- Ejecución multiplataforma mediante run-any-model, Ollama, llama.cpp, LM Studio, Jan y Text-Generation-WebUI.
- Aceleración por hardware: Metal en Apple Silicon, CUDA en GPUs NVIDIA RTX 30/40/50 y CPU con AVX2/AVX-512.
- Soporte de conversación multi-turno mediante los tokens de parada `<|im_end|>` y `<|endoftext|>`.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito para esta cuantización concreta.

## Casos de uso

- Pruebas de concepto en portátiles de consumo: permite experimentar con la familia DeepSeek-V3 en equipos con 11,5 GB de memoria unificada o VRAM, sin necesidad de infraestructura de centro de datos, a cambio de asumir la pérdida de calidad documentada.
- Extracción de información y resumen de documentos: la model card indica que la extracción factual básica se preserva, por lo que puede emplearse para tareas de recuperación de datos en textos con contexto de hasta 4.096-8.192 tokens.
- Chat conversacional local y sin conexión: mediante Ollama o llama.cpp se puede desplegar un asistente de conversación en un equipo personal, útil para entornos con requisitos de privacidad o sin acceso a red.
- Evaluación comparativa de técnicas de cuantización: sirve como referencia de hasta dónde llega la compresión IQ2_XXS en un modelo de gran tamaño, para investigadores que estudien la degradación de calidad a 2 bits por peso.
- Educación y demostración: permite ilustrar en un aula o taller cómo se ejecuta un modelo de la familia DeepSeek en hardware asequible, con las limitaciones explicitadas en la documentación.
- Prototipado rápido de pipelines de generación de texto: integrable en scripts de Python mediante llama.cpp u Ollama para validar flujos antes de migrar a una versión de mayor precisión en servidor.

## Benchmarks y rendimiento

La model card incluye una matriz de auditoría de run-any-model con métricas de compresión y memoria, pero no benchmarks de calidad estándar (MMLU, HumanEval, GSM8K). Se reproducen los datos disponibles:

| Metrica | Baseline (FP16) | Cuantizado (IQ2_XXS) | Cambio |
|---|---|---|---|
| Precisión en bits por parámetro | 16,0 | 2,06 | -87,1 % |
| Tamaño de pesos | 75,43 GB | 9,71 GB | -87,1 % |
| KV cache | 1.708 MB (FP16) | 1.708 MB (Q4_0) | Optimizado |
| RAM residente total | 82,24 GB | 11,51 GB | -86,0 % |
| Calidad estimada | 100,0 % baseline | 72,0 % retenida | -28,0 % |
| Aceleración de capas | 0 % (riesgo de fallo) | 61/61 capas | Óptimo |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La cifra de retención del 72,0 % es una estimación del autor, no un resultado medido con un conjunto de evaluación público.

## Requisitos de hardware

- Apple Silicon (M1/M2/M3/M4/M5): 11,51 GB de memoria unificada, contexto óptimo de 8.192 tokens, aceleración Metal nativa.
- GPU NVIDIA RTX 30/40/50: 11,21 GB de VRAM dedicada, contexto óptimo de 8.192 tokens, aceleración CUDA.
- PC Windows/Linux con CPU: 13,51 GB de RAM libre, contexto óptimo de 4.096 tokens, soporte AVX2/AVX-512.
- Cabe en GPUs de consumo con 12 GB o más de VRAM, como la RTX 3060 de 12 GB, RTX 4070 de 12 GB o superiores; también en equipos Apple con 16 GB de memoria unificada o más.
- Opciones de despliegue: run-any-model (CLI del autor), Ollama, llama.cpp (`llama-cli`), LM Studio, Jan y Text-Generation-WebUI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-DeepSeek-V3-GGUF (esta ficha) | 38,57 B declarados (base 671 B MoE) | 8.192 tokens | IQ2_XXS (2,06 bpw) | Apache 2.0 | Hugging Face, 0 descargas |
| deepseek-ai/DeepSeek-V3 (original) | 671 B totales, 37 B activos | 128K tokens en el modelo base | FP8/BF16 | Licencia DeepSeek | Hugging Face, ampliamente usado |
| DeepSeek-V3 GGUF de otras comunidades | 671 B | Variable según cuantización | Q4_K_M, Q8_0, etc. | Según autor | Disponibles en Hugging Face |

La comparación directa con otras cuantizaciones de DeepSeek-V3 es difícil porque esta publicación declara un recuento de parámetros (38,57 B) que no coincide con el del modelo base (671 B). Tampoco se dispone de datos de benchmarks que permitan comparar la calidad frente a cuantizaciones de 4 u 8 bits del mismo modelo. No disponible información adicional sobre alternativas comparables verificadas.

## Limitaciones y advertencias

- La cuantización IQ2_XXS a 2,06 bits por peso implica una pérdida de calidad estimada del 28 %, con deterioro explícito en razonamiento complejo, generación de código y gramática matizada.
- Inconsistencia documental grave: la model card declara 38,57 B de parámetros, mientras que el modelo base DeepSeek-V3 tiene 671 B totales. El fichero de 9,71 GB no puede contener el modelo completo a 2,06 bits por peso (serían aproximadamente 172 GB), por lo que la naturaleza exacta del artefacto es dudosa.
- La licencia declarada es Apache 2.0, pero el modelo base DeepSeek-V3 se distribuye bajo la licencia propia de DeepSeek, que impone condiciones adicionales de uso comercial; debe verificarse la compatibilidad antes de cualquier uso en producción.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo día, sin historial de validación por parte de la comunidad.
- No se han publicado resultados de benchmarks estándar ni evaluaciones independientes que confirmen la retención de calidad del 72 %.
- Riesgo de alucinación y de errores factuales incrementado por la compresión extrema, especialmente en tareas de razonamiento multi-paso.
- Idiomas soportados no documentados; el modelo base es multilingüe, pero no se garantiza el comportamiento tras la cuantización.
- La model card incluye una cláusula de exención total de responsabilidad que traslada al usuario toda la responsabilidad sobre la validación de las salidas.
- No se documentan capacidades de tool calling, agentes ni visión para esta cuantización concreta.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/pranil00/ONIX-DeepSeek-V3-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V3
- Motor de cuantización run-any-model: https://github.com/PranilShah-08/run-any-model
- Organización ONIX en Hugging Face: https://huggingface.co/ONIX
