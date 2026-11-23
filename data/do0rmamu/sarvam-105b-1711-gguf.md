# Do0rMaMu/sarvam-105b-1711-GGUF

## Resumen

Sarvam-105B-1711 GGUF es una colección de cuantizaciones en formato GGUF del modelo `sarvamai/sarvam-105b-1711-bf16`, publicadas por el usuario Do0rMaMu para su uso con llama.cpp. El modelo base es un transformer de tipo `SarvamMLAForCausalLM` con atención MLA (Multi-head Latent Attention) al estilo DeepSeek-V3 y una arquitectura de mezcla de expertos (MoE) con router sigmoide, agrupación de expertos y posiciones YaRN. El repositorio contiene de momento únicamente la cuantización Q8_0 (112,7 GB, dividida en tres partes), con el resto de cuantizaciones planificadas pero aún no publicadas.

La relevancia de esta ficha radica en dos aspectos. Por un lado, el modelo base está orientado a un espectro lingüístico muy amplio: inglés y 22 lenguas de la India, incluidos hindi, bengalí, tamil, telugu, maratí, guyaratí, canarés, malabar, punyabí, odia, asamés, urdu, nepalí y sánscrito, entre otras. Por otro, la conversión a GGUF incorpora explícitamente los parámetros del router MoE y de YaRN que una conversión estándar a DeepSeek-V2 perdería, lo que la hace funcionalmente distinta de una conversión ingenua.

El modelo base tiene 105 000 millones de parámetros totales y 10 300 millones de parámetros activos por token, con una longitud de contexto de 163 840 tokens. La licencia es Apache 2.0 tanto en el modelo base como en la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención MLA (estilo DeepSeek-V3) y router sigmoide agrupado; clase `SarvamMLAForCausalLM` |
| Parametros totales | 105 000 millones (105B) |
| Parametros activos | 10 300 millones (10.3B) por token |
| Longitud de contexto | 163 840 tokens; contexto original de entrenamiento 4096 con extrapolación YaRN (factor 40) |
| Tipos de cuantizacion | Q8_0 disponible; planificadas: Q4_K_M, Q5_K_M, Q6_K, IQ4_XS, Q3_K_M, IQ3_M, Q4_K_S, Q5_K_S, Q3_K_L, IQ3_XS, Q2_K, IQ2_M |
| Idiomas soportados | en, hi, bn, ta, te, mr, gu, kn, ml, pa, or, as, ur, ne, sa (inglés y 14 lenguas indias declaradas en la tarjeta; la matriz de importancia cubre 22 lenguas indias) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); modelo base en BF16 |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura de mezcla de expertos con atención MLA, en la línea de DeepSeek-V3, pero con una proyección de query plana en lugar de la proyección de bajo rango. El router MoE está definido en el código de modelado y no en la configuración, e incorpora varias particularidades: puntuaciones sigmoides con sesgo de selección, expertos organizados en 16 grupos de 8 donde solo los 2 mejores grupos son elegibles y dentro de ellos se seleccionan los 8 mejores expertos, pesos normalizados sobre los expertos seleccionados y escalados por 2.5, y posiciones YaRN con factor 40 sobre un contexto original de 4096 tokens.

La conversión a GGUF de este repositorio preserva explícitamente los parámetros del router y de YaRN, además del contexto de 163 840 tokens y la plantilla de chat del checkpoint 1711. La verificación se realizó contra el código de modelado de Sarvam con un modelo pequeño de pesos aleatorios y el tokenizador real: la conversión de este repositorio coincide en el token top-1 en 5 de 5 prompts con un error máximo de probabilidad de 0,00009 sobre los 20 tokens más probables, mientras que una conversión como DeepSeek-V2 plano coincide en 1 de 5 prompts con un error de 0,56. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto en inglés y en lenguas indias, con cobertura declarada de hindi, bengalí, tamil, telugu, maratí, guyaratí, canarés, malabar, punyabí, odia, asamés, urdu, nepalí y sánscrito.
- Modo de razonamiento (thinking) activado por defecto; puede desactivarse mediante `"chat_template_kwargs": {"enable_thinking": false}` en la petición.
- Soporte de plantilla de chat Jinja (`--jinja` en llama-server).
- Contexto largo de hasta 163 840 tokens gracias a la extrapolación YaRN.
- Procesamiento de texto multilingüe con mezcla de inglés y lenguas indias, incluidos textos romanizados (hinglish y hindi romanizado) según la matriz de importancia.
- No se ha documentado en la información disponible soporte explícito de tool calling, function calling, agentes, visión, audio ni otras modalidades.

## Casos de uso

- Atención al cliente multilingüe en la India: el modelo puede gestionar conversaciones multi-turno en hindi, bengalí, tamil o telugu junto con inglés, aprovechando la ventana de 163 840 tokens para mantener historial extenso de interacciones sin truncar.
- Traducción y localización entre inglés y lenguas indias: adecuado para pipelines de traducción de documentación, interfases o contenido web hacia las 14 lenguas declaradas, con la ventaja de un único modelo para todo el espectro lingüístico.
- Procesamiento de documentos largos: contratos, informes o expedientes de hasta 163 840 tokens pueden analizarse en una sola pasada, útil en entornos legales o administrativos con documentación en inglés y lenguas regionales.
- Generación de contenido editorial regional: redacción de artículos, resúmenes o material divulgativo en lenguas indias con registro controlado, usando el modo thinking para tareas que requieran razonamiento previo.
- Investigación lingüística y evaluación de modelos multilingües: el modelo sirve como referencia para estudiar el comportamiento de arquitecturas MoE con MLA en lenguas de bajos recursos, y la cuantización Q8_0 permite ejecutarlo en hardware más modesto que el BF16 de 218 GB.
- Despliegue en infraestructura con llama.cpp: integrable en servicios de inferencia autoalojados mediante `llama-server`, con cuantizaciones futuras de menor tamaño para entornos con menos memoria.
- Asistentes conversacionales con razonamiento explícito: el modo thinking por defecto permite tareas de análisis paso a paso, desactivable cuando se prioriza latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible. La única medición publicada es la fidelidad de la cuantización Q8_0 respecto a sí misma como referencia y la comparación de la conversión frente a una conversión plana:

| Conversion | Top-1 token igual que referencia | Error maximo de probabilidad (top 20) |
|---|---|---|
| Esta conversion (router y YaRN preservados) | 5 de 5 prompts | 0,00009 |
| Como DeepSeek-V2 plano (sin router ni YaRN) | 1 de 5 prompts | 0,56 |

La métrica de acuerdo top-1 y divergencia KL se mide con `llama-perplexity --kl-divergence` sobre 16 000 tokens de texto reservado (43 % prosa inglesa, código y chat; 57 % en 11 lenguas indias), fuera del conjunto de calibración. Para Q8_0 no hay valores de acuerdo ni KLD porque es la referencia.

## Requisitos de hardware

- VRAM estimada para Q8_0: 112,7 GB de pesos, más overhead de contexto y caché KV; requiere al menos 128 GB de memoria total si se reparte entre GPU y CPU.
- El modelo base BF16 ocupa 218 GB y no cabe en memoria en la máquina de pruebas del autor.
- GPU recomendadas: no disponibles de forma explícita; por tamaño, Q8_0 requiere múltiples A100 80 GB, H100 80 GB o configuraciones equivalentes. Las cuantizaciones Q4_K_M y Q5_K_M planificadas reducirían el requisito aproximadamente a 60-75 GB.
- En GPU de consumo: no cabe en una RTX 4090 (24 GB) en Q8_0; las cuantizaciones Q2_K o IQ2_M planificadas podrían aproximarse, pero no se han publicado sus tamaños.
- Opciones de despliegue: llama.cpp (binarios estándar de master, verificados con la versión del 2026-11-20), `llama-server` con `--jinja`, y `llama-gguf-split` para los archivos divididos. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Rendimiento medido en un escritorio con Intel Arc Pro B60 24 GB, i7-12700K y 128 GB DDR4 con Vulkan: Q8_0 da aproximadamente 5 a 9 tok/s de prompt y 1,4 tok/s de generación, con las capas que caben en la tarjeta descargadas a GPU y el resto en CPU. El modelo está limitado por ancho de banda de memoria en CPU de escritorio.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento de modelos comparables que permitan una comparación cuantitativa fiable. Como referencia estructural, el modelo se inspira en DeepSeek-V3 (atención MLA y MoE), pero no se han publicado métricas comparativas.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato disponible |
|---|---|---|---|---|---|
| Sarvam-105B-1711 (esta ficha) | 105B | 10,3B | 163 840 | Apache 2.0 | GGUF (Q8_0), BF16 en el base |
| DeepSeek-V3 (referencia arquitectonica) | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |
| Otros modelos multilingues indios | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio está marcado como trabajo en curso: solo Q8_0 está publicado; el resto de cuantizaciones están planificadas y sin métricas.
- El acuerdo de la cuantización se mide contra Q8_0, no contra BF16, por lo que la fidelidad respecto al modelo original no está cuantificada.
- No se han ejecutado benchmarks de tareas sobre estos archivos; el rendimiento real en MMLU, código o matemáticas es desconocido.
- La verificación de la conversión se hizo con pesos aleatorios en un modelo pequeño de la misma arquitectura, lo que demuestra que las conversiones calculan cosas distintas pero no cuantifica cuánto cambian las respuestas reales.
- El modelo base tiene un contexto original de entrenamiento de 4096 tokens; el contexto de 163 840 depende de la extrapolación YaRN con factor 40, cuya degradación a longitudes extremas no está documentada en la información disponible.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de seguridad en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero se remite a la tarjeta y licencia del modelo base `sarvamai/sarvam-105b-1711-bf16` para cualquier condición adicional.
- El rendimiento en CPU de escritorio es muy bajo (1,4 tok/s de generación en Q8_0), lo que limita su uso interactivo sin GPU suficiente.
- Los archivos de más de 50 GB están divididos en carpetas; es necesario descargar la carpeta completa y pasar la primera parte a llama.cpp.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/Do0rMaMu/sarvam-105b-1711-GGUF
- Modelo base en BF16: https://huggingface.co/sarvamai/sarvam-105b-1711-bf16
