# BeardedMonster/gemma-3-1b-science-translate-best

## Resumen

`gemma-3-1b-science-translate-best` es un modelo de traducción inglés a lenguas africanas desarrollado por el usuario de Hugging Face BeardedMonster dentro del proyecto SabiYarn / gemma_mt. Se trata del ajuste final de la familia de modelos de traducción a escala 1B, construido sobre la arquitectura Gemma-3-1B-it (aproximadamente 1.000 millones de parámetros) y especializado en traducción de textos científicos de inglés a seis lenguas africanas: amhárico, hausa, luganda, sesoto septentrional, yoruba y zulú.

El modelo parte de un ajuste supervisado (SFT) sobre el corpus AfriScience-MT y posteriormente se somete a una etapa de aprendizaje por refuerzo con GRPO, además de una interpolación de pesos (alpha 0,5) con el modelo general de traducción de la misma familia. Su rasgo diferencial es la capacidad de traducir artículos científicos completos en una sola pasada: en la evaluación sobre documentos completos de AfriScience-MT finaliza el 96% de las veces con una ratio de longitud de 1,01, frente al 93% del modelo general.

Aunque la model card declara 125 etiquetas de idioma, el entrenamiento específico en ciencia cubre únicamente seis lenguas; para el resto el modelo se comporta como el modelo general de traducción de la familia, con puntuaciones en benchmarks generales dentro de 0,25 chrF++ de este. El modelo es de acceso público bajo licencia Gemma y está pensado para un único par de traducción: inglés a lengua africana.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gemma-3-1B-it (transformer decoder-only, `gemma3_text`) |
| Parámetros totales | 999.885.952 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (la evaluación permitió hasta 7.168 tokens de salida; `max_model_len` configurable en vLLM, probado con 4096) |
| Tipos de cuantización | no disponible en la información proporcionada (pesos publicados en safetensors fp32, ~4 GB) |
| Idiomas soportados | 125 etiquetas declaradas; entrenamiento científico específico en amh, hau, lug, nso, yor, zul; el resto se comporta como el modelo general de la familia |
| Licencia | Gemma (https://ai.google.dev/gemma/terms) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo reutiliza la arquitectura de Gemma-3-1B-it, un transformer decoder-only de aproximadamente 1.000 millones de parámetros. El pipeline de entrenamiento consta de tres etapas documentadas: un ajuste supervisado (SFT) sobre el corpus AfriScience-MT, una interpolación de pesos con el modelo general de traducción de la familia (`gemma-3-1b-translate-best`) con alpha 0,5, y una etapa final de aprendizaje por refuerzo con GRPO. El modelo base inmediato es `BeardedMonster/gemma-3-1b-science-sft`.

El formato de entrenamiento es estricto: un único turno de usuario con la plantilla `Translate the text to {Language name}:  {English text}` (dos espacios tras los dos puntos), y la respuesta comienza con una etiqueta de idioma de tres letras entre ángulos (por ejemplo `<yor>`) emitida como un único token, seguida de la traducción y del token `<end_of_turn>` (id 106). Las etiquetas de idioma son entradas de vocabulario ordinarias (no especiales), por lo que `skip_special_tokens=True` no las elimina y deben retirarse con una expresión regular. La decodificación recomendada es greedy (`do_sample=False`), con `max_new_tokens=256` para frases y hasta 7.168 para artículos completos.

## Capacidades

- Traducción de inglés a lenguas africanas, con especialización en registro científico y técnico para amhárico, hausa, luganda, sesoto septentrional, yoruba y zulú.
- Traducción de documentos completos (artículos científicos de varios miles de tokens) en una sola pasada, con ratio de longitud cercana a 1,0.
- Traducción frase a frase o por párrafos cortos con decodificación greedy.
- Emisión de una etiqueta de idioma de salida como token único que identifica la lengua destino.
- Cobertura declarada de 125 etiquetas de idioma, aunque fuera de las seis lenguas científicas el comportamiento equivale al del modelo general de la familia.
- Traducción unidireccional: únicamente inglés a lengua africana.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Traducción de artículos científicos completos: el modelo puede procesar un paper entero en un solo turno de usuario y generar la traducción con una ratio de longitud de 1,01, lo que lo hace adecuado para pipelines de divulgación científica hacia lenguas africanas sin segmentación manual.
- Localización de documentación técnica y material educativo: traducción de guías, manuales y materiales de formación en salud o agricultura del inglés a yoruba, hausa, zulú, amhárico, luganda o sesoto septentrional, con un prompt uniforme y decodificación determinista para resultados reproducibles.
- Generación de subtítulos y textos breves: con `max_new_tokens=256` y decodificación greedy, el modelo traduce frases y párrafos cortos de forma estable, apto para subtitulado o fichas de producto.
- Procesamiento por lotes multilingües: con vLLM se pueden enviar en un solo batch las mismas frases a varios idiomas destino (yoruba, hausa, igbo, suajili, zulú) usando `SamplingParams` con `temperature=0` y `frequency_penalty=0.1` opcional.
- Integración en pipelines de publicación científica: dado su tamaño de ~1 GB de parámetros y ~4 GB de pesos en fp32, puede desplegarse en infraestructura modesta y encadenarse a un sistema de gestión editorial para pretraducir abstracts y secciones antes de la revisión humana.
- Investigación en traducción automática de bajos recursos: sirve como punto de partida o línea base para experimentos de fine-tuning y evaluación en lenguas africanas, con métricas de referencia publicadas (chrF y chrF++) sobre AfriScience-MT, FLORES+, NTREX y MAFAND.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado | Referencia (modelo general RL) |
|---|---|---|---|
| AfriScience-MT test, nivel de frase, macro de 6 lenguas | chrF | 53,11 | 50,76 |
| AfriScience-MT test, artículos completos | chrF | 54,70 | 44,81 |
| AfriScience-MT test, artículos completos, tasa de finalización | % finalizados | 96% | 93% |
| AfriScience-MT test, artículos completos, ratio de longitud | ratio | 1,01 | no disponible |
| FLORES+ devtest | chrF++ | 35,15 | 35,28 |
| NTREX | chrF++ | 40,09 | no disponible |
| MAFAND | chrF++ | 44,45 | no disponible |

Tasa de finalización por lengua en artículos completos del test: amhárico 0,93 y yoruba 0,89 (el resto de lenguas no se detalla en la información disponible).

## Requisitos de hardware

- Pesos publicados en safetensors fp32 con un tamaño de repositorio de 4,1 GB; en bfloat16 la huella de pesos ronda los 2 GB.
- VRAM estimada para inferencia: aproximadamente 2-3 GB en bfloat16 para frase o párrafo; para traducir artículos completos hay que sumar la caché KV del contexto de entrada más salida (la evaluación permitió hasta 7.168 tokens de salida y `max_model_len` por encima de entrada más salida).
- Cabe en GPU de consumo: cualquier GPU con 6-8 GB o más de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia en bfloat16 a nivel de frase.
- GPU recomendadas para producción y lotes: A100, H100 o L40S para throughput alto con vLLM; RTX 4090 para prototipado y desarrollo.
- Opciones de despliegue: Transformers (probado con 4.57.6, requiere >= 4.56) y vLLM (probado con 0.32.0). El modelo es compatible con text-generation-inference y endpoints según las etiquetas del repositorio.
- Latencia y throughput: no disponibles en la información proporcionada. La decodificación greedy con `frequency_penalty=0.1` opcional en vLLM ayuda a evitar bucles de repetición en entradas largas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-3-1b-science-translate-best | 999.885.952 | no disponible | Traducción EN→6 lenguas africanas (ciencia) | Gemma | Público en Hugging Face |
| gemma-3-1b-translate-best (modelo general de la familia) | ~1B (no confirmado en la información) | no disponible | Traducción EN→lenguas africanas (general) | Gemma | Referenciado en la model card; disponibilidad no confirmada |
| gemma-3-1b-science-sft (modelo base inmediato) | ~1B (no confirmado en la información) | no disponible | SFT científico EN→lenguas africanas | Gemma | Referenciado como base_model; disponibilidad no confirmada |
| Gemma-3-1B-it (modelo original de Google) | ~1B | no disponible | Modelo general instruct | Gemma | Público |

La comparación con modelos de traducción de terceros (por ejemplo, NLLB o M2M-100) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Traducción unidireccional: solo inglés a lengua africana; no soporta el sentido inverso ni otros pares de idiomas.
- El entrenamiento científico específico cubre únicamente seis lenguas (amh, hau, lug, nso, yor, zul); para las demás etiquetas el rendimiento equivale al del modelo general de la familia, sin especialización científica.
- En artículos completos, el 4% de los documentos de test no finalizaron la traducción (amhárico 0,93 y yoruba 0,89 de finalización); hay que comprobar la ausencia de `<end_of_turn>` y recurrir a traducción frase a frase como respaldo.
- El prompt debe respetar el formato exacto de entrenamiento, incluidos los dos espacios tras los dos puntos y el uso del nombre del idioma (nunca el código ISO); desviarse puede degradar la calidad.
- Las etiquetas de idioma de salida (`<yor>`, `<hau>`, etc.) son tokens de vocabulario ordinarios y no se eliminan con `skip_special_tokens=True`; es necesario limpiarlas explícitamente.
- Riesgo de bucles de repetición en entradas largas; se recomienda `frequency_penalty=0.1` en vLLM como salvaguarda.
- No se documentan evaluaciones de sesgo, alucinación ni robustez fuera de los benchmarks de traducción citados.
- Licencia Gemma: el uso comercial está sujeto a los términos de Google (https://ai.google.dev/gemma/terms), que incluyen restricciones de uso aceptable que deben revisarse antes de un despliegue en producción.
- El modelo tiene 2 descargas y 0 likes en el momento de la ficha, lo que indica una validación comunitaria muy limitada.

## Enlaces

- Hugging Face: https://huggingface.co/BeardedMonster/gemma-3-1b-science-translate-best
- Modelo base (SFT científico): https://huggingface.co/BeardedMonster/gemma-3-1b-science-sft
- Licencia Gemma: https://ai.google.dev/gemma/terms
- Repositorio de Transformers: https://github.com/huggingface/transformers
- Repositorio de vLLM: https://github.com/vllm-project/vllm
