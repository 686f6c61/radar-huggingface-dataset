# abhirajratna/anlp-a2-moe-v2

## Resumen

El modelo `abhirajratna/anlp-a2-moe-v2` es un transformer decoder-only entrenado desde cero para traducción automática de vietnamita a inglés y de japonés a inglés. Lo publica el usuario abhirajratna en HuggingFace y forma parte de una serie de cinco modelos que solo se diferencian en la capa feed-forward; esta variante concreta usa una mezcla de expertos (MoE) con 4 expertos enrutados y top-1. Resuelve el problema clásico de traducción bidireccional vi/ja hacia inglés con un modelo muy compacto.

El modelo tiene 33.579.520 parámetros totales y 20.996.608 activos por token, con 8 capas, d_model de 512 y 8 cabezas de atención. El vocabulario es de 16.384 tokens con BPE a nivel de byte compartido entre los tres idiomas. Su rasgo más relevante es que se trata de un ejercicio académico de análisis y modelado de lenguaje natural (tag `anlp-assignment`), por lo que su valor está más en la comparación de arquitecturas densas frente a MoE que en un uso productivo en producción.

En el split de test de 24.792 tripletas alcanza BLEU global de 38,05 y chrF de 60,01 con decodificación greedy, con una perplejidad agregada de 4,000. La ausencia de licencia explícita y de información sobre la longitud de contexto limita seriamente su adopción comercial sin consultar antes al autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con capa feed-forward MoE (4 expertos enrutados, top-1, ancho de experto 512, router en float32) |
| Parametros totales | 33.579.520 |
| Parametros activos | 20.996.608 por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo distribuye pesos safetensors sin documentar variantes cuantizadas) |
| Idiomas soportados | vietnamita, japones, ingles (con foco en vi→en y ja→en) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dimensiones internas | 8 capas, d_model 512, 8 cabezas de atencion |
| Vocabulario | 16.384 tokens, BPE a nivel de byte compartido vi/ja/en |
| Dataset de entrenamiento | belumind/en-vi-ja-curated-500k-triplets |
| Tokens de entrenamiento (sin padding) | 114.291.660 (3 epocas, 9.933 pasos) |
| Learning rate maximo | 0,001 |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only autoregresivo entrenado desde cero, no de un modelo derivado de un checkpoint preentrenado. La particularidad de esta variante es la capa feed-forward, que sustituye el bloque denso habitual por una mezcla de expertos con 4 expertos enrutados, seleccion top-1 y ancho oculto de 512 por experto, con el router calculado en float32. El resto del modelo se mantiene fijo respecto a las otras cuatro variantes de la serie: 8 capas, d_model de 512 y 8 cabezas. Esta configuracion activa aproximadamente el 62,5 % de los parametros totales por token, lo que permite separar el efecto del enrutamiento del de la profundidad o el ancho del modelo en la comparativa de la practica academica.

El entrenamiento uso el dataset `belumind/en-vi-ja-curated-500k-triplets`, con un total de 114.291.660 tokens sin padding a lo largo de 3 epocas y 9.933 pasos, con un learning rate maximo de 0,001. No se documenta en la informacion disponible el uso de RLHF, DPO, SFT u otras fases de alineacion posteriores al preentrenamiento. El formato de entrada es un prompt con el token de idioma origen y el separador, por ejemplo `<|vi|> source <|en|>`, tras el cual el modelo genera la traduccion en ingles y el token `<|eos|>`. No se menciona ninguna innovacion adicional como decodificacion especulativa, atencion lineal ni mecanismos hibridos.

## Capacidades

- Traduccion de vietnamita a ingles y de japones a ingles en una unica direccion de salida.
- Generacion de texto autoregresiva condicionada por tokens de idioma (`<|vi|>`, `<|ja|>`, `<|en|>`).
- Manejo de vocabulario a nivel de byte, lo que evita tokens fuera de vocabulario en los idiomas cubiertos.
- Modelado de secuencias cortas a medias propio de un modelo de 8 capas y 33,6 millones de parametros.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes, razonamiento multi-paso ni modo de pensamiento.
- No se documentan capacidades de vision, audio ni multimodalidad.
- No se documenta un modo de instrucciones ni ajuste conversacional; el modelo esta pensado para una tarea de traduccion concreta.

## Casos de uso

- Traduccion vi→en en pipelines de localizacion: el modelo acepta la secuencia `<|vi|> texto <|en|>` y devuelve la traduccion en ingles con `<|eos|>`, lo que permite integrarlo como paso de un sistema de localizacion batch.
- Traduccion ja→en para contenidos tecnicos y de producto: util para trasladar documentacion o fichas de producto escritas en japones a ingles con un coste de computo minimo.
- Preprocesado de corpus para entrenamiento: se puede usar para normalizar tripletas en vietnamita y japones a ingles antes de alimentar otros modelos mayores o para aumentar datos.
- Baseline academico y experimento de ablacion: su proposito declarado es comparar variantes de la capa feed-forward, por lo que sirve como referencia reproducible en trabajos sobre MoE frente a modelos densos.
- Prototipado rapido en portatiles y entornos sin GPU: al ocupar alrededor de 134 MB en fp32 cabe en memoria de CPU y permite iterar sin infraestructura dedicada.
- Generacion de subtitulos para video en vietnamita o japones: la salida en ingles se puede acoplar a un motor de segmentacion de subtitulos para obtener versiones traducidas.
- Analisis de opiniones y resenas: traduccion previa de resenas vi/ja a ingles para su posterior procesado con herramientas de analitica de texto.
- Evaluacion de despliegue en edge: por su tamano reducido es candidato a pruebas de inferencia en dispositivos con recursos limitados, siempre que se resuelva el formato de pesos.

## Benchmarks y rendimiento

Split de test de 24.792 tripletas, equivalentes a 49.584 traducciones. Decodificacion greedy. Firma sacreBLEU: `nrefs:1|case:mixed|eff:no|tok:13a|smooth:exp|version:2.6.0`.

| Metrica | vi→en | ja→en | Global |
|---|---|---|---|
| Perplejidad (tokens objetivo) | 3,494 | 4,580 | 4,000 |
| BLEU (greedy) | 42,82 | 33,19 | 38,05 |
| chrF (greedy) | 62,95 | 57,07 | 60,01 |

No se han publicado resultados adicionales de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 134 MB para los pesos (33,6 M de parametros × 4 bytes).
- VRAM estimada en fp16/bf16: aproximadamente 67 MB.
- VRAM estimada en int8: aproximadamente 34 MB, siempre que se cuantice manualmente.
- VRAM estimada en int4: aproximadamente 17 MB, no documentada por el autor.
- GPU recomendadas: cualquier GPU consumer moderna (por ejemplo, RTX 3060, RTX 4090) queda muy por encima de lo necesario; tambien es viable en iGPU y en CPU.
- Cabe sin problema en GPU consumer; no requiere A100 ni H100 para inferencia.
- Opciones de despliegue: el repo distribuye el codigo en `code/part1/` con la funcion `load_pretrained`, de modo que el uso previsto es PyTorch con `transformers` no aplica directamente. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de modelos comparables de terceros. El autor indica que este modelo es uno de cinco variantes de la misma serie que solo se diferencian en la capa feed-forward, pero no se publican las especificaciones ni los resultados de las otras cuatro.

| Modelo | Parametros | Contexto | BLEU global | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| abhirajratna/anlp-a2-moe-v2 | 33,6 M (21,0 M activos) | no disponible | 38,05 | no disponible | HuggingFace |
| Otras variantes de la serie | no disponible | no disponible | no disponible | no disponible | no disponible |

No disponible para alternativas externas: los modelos de traduccion multilingue de referencia (por ejemplo, familia NLLB o Marian) no aparecen en la informacion proporcionada, por lo que no se incluyen cifras que no se puedan contrastar.

## Limitaciones y advertencias

- La licencia no esta declarada, lo que impide confirmar si se permite el uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- El modelo solo traduce en la direccion vi→en y ja→en; no se documenta traduccion inversa ni entre vietnamita y japones.
- Se desconoce la longitud de contexto soportada, lo que impide garantizar el comportamiento con documentos largos.
- Al ser un modelo de 33,6 millones de parametros entrenado solo 3 epocas sobre 114 millones de tokens, es esperable una cobertura limitada de vocabulario especializado, nombres propios y dominios tecnicos.
- No se documenta ninguna fase de alineacion (RLHF, DPO), por lo que no hay garantias de estilo, seguridad ni formato de salida controlado.
- No se documenta mitigacion de sesgos; el dataset de entrenamiento y su curaduria no estan descritos en detalle en la informacion disponible.
- Riesgo de alucinacion y de omisiones en la traduccion, habitual en modelos pequenos entrenados con pocas epocas.
- Etiquetado como `anlp-assignment`: es un trabajo academico, sin mantenimiento ni soporte comprometidos.
- El repo ocupa 0,1 GB e incluye codigo propio; la integracion con herramientas estandar de inferencia no esta verificada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abhirajratna/anlp-a2-moe-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/belumind/en-vi-ja-curated-500k-triplets
- Referencia de la firma de evaluacion sacreBLEU 2.6.0: https://github.com/mjpost/sacrebleu
