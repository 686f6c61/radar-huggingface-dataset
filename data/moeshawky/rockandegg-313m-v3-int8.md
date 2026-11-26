# moeshawky/RockAndEgg-313M-v3-INT8

## Resumen

RockAndEgg-313M-v3-INT8 es la variante cuantizada a INT8 de precisión mixta del modelo `moeshawky/RockAndEgg-313M-v3`, desarrollado por el usuario moeshawky. No es un modelo generativo: se trata de un modelo de decisión tipado de 313M parámetros (196,7M reales en safetensors) construido sobre un backbone Qwen3 de 10 capas con dimensión oculta 1024, que alimenta una cabeza de decisión nativa encargada de puntuar opciones candidatas frente a una codificación de estado compartida. Emite decisiones estructuradas (`choice`, `score`, `noul`) con distribuciones de probabilidad y carece de cabeza de lenguaje y de método `generate`.

La relevancia de esta variante es acotada y muy específica: reduce el almacenamiento aproximadamente un 24,5% (626 MB a 473 MB) manteniendo una calidad de decisión estadísticamente indistinguible del modelo padre en FP16 sobre el panel canónico de 400 dossieres y 2.000 decisiones. Es una variante orientada a memoria y almacenamiento, no a velocidad: en GPU el runtime INT8 es más lento que FP16 porque el backend descomprime los pesos a FP16 en tiempo de cómputo, mientras que en CPU resulta aproximadamente 2,2 veces más rápida.

El modelo está pensado para pipelines de clasificación y decisión estructurada en inglés, con licencia Apache 2.0, y su interés práctico reside en despliegues con restricciones de memoria o en entornos de CPU donde el ahorro de almacenamiento y el rendimiento del backend INT8 sí aportan ventajas medibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (backbone Qwen3, 10 capas, hidden 1024) con cabeza de decision tipada nativa |
| Parametros totales | 196.732.932 (denominado 313M por el autor) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Estado fijo de 256 tokens (`max_state_len=256`) y presupuesto de opcion de 64 tokens (`max_option_len=64`) |
| Tipos de cuantizacion | INT8 W8A16, group size 128, simetrico, en proyecciones del backbone; embeddings, RMSNorms, rotary y cabeza de decision en FP16 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors con serializacion compatible con AutoRound (`quant_method: auto-round`, `packing_format: auto_round:auto_gptq`, modulos `QuantLinearGPTQ`) |

## Arquitectura y entrenamiento

El modelo parte de un backbone Qwen3 de 10 capas con dimension oculta 1024, sobre el que se monta una cabeza de decision tipada que puntua opciones candidatas contra una codificacion de estado compartida. La salida son decisiones estructuradas con campos `choice`, `score` y `noul`, acompanadas de distribuciones de probabilidad. No existe cabeza de lenguaje ni capacidad de generacion de texto libre.

La cuantizacion se realizo mediante una optimizacion de escalas consciente de activaciones basada en la diagonal de la matriz hessiana, no con la optimizacion estandar de AutoRound. Se emplearon 16 dossieres de calibracion del split `train` de `LocalLLaMA/typed-decisions`, renderizados como objetos `SystemOneRequest`, para recoger las hessianas de activacion (`H = XᵀX`) por cada capa lineal. Para cada proyeccion cuantizada se ajustaron escalas INT8 con grupos de 128 caracteristicas de entrada mediante busqueda en rejilla alrededor de la escala RTN (absmax), minimizando el error de reconstruccion ponderado por la diagonal de la hessiana. El alcance abarca unicamente las proyecciones de `backbone.layers.*` (70 modulos: q/k/v/o/gate/up/down en 10 capas); embeddings, RMSNorms, rotary embeddings y toda la cabeza de decision (`scorer`, `opt_norm`, `final_norm`, `state_norm`, `qtype_emb`, `prior_scale`, `log_temp`) permanecen en FP16 por dominar la fidelidad de decision. La calibracion y la evaluacion usan splits disjuntos (`train` y `test`, respectivamente).

## Capacidades

- Clasificacion y decision estructurada: emite decisiones tipadas (`choice`, `score`, `noul`) con distribuciones de probabilidad asociadas.
- Puntuacion ordinal de opciones: produce una puntuacion (`score`) con error ordinal medio de 0,3350 y un 96,63% de puntuaciones dentro de mas o menos un nivel.
- Calibracion de confianza: ECE de 15 bins de 0,1270, con confianza media de 0,6155.
- Extraccion de caracteristicas (`feature-extraction`) sobre codificaciones de estado.
- Decisiones de absteccion (`noul`) con precision de 0,8150 en el panel de evaluacion.
- Procesamiento en ingles exclusivamente.
- Sin generacion de texto, sin tool calling, sin capacidades de agente, sin vision ni audio.

## Casos de uso

- Clasificacion de dossieres en pipelines de decision automatizada: el modelo puntua opciones candidatas contra un estado serializado de hasta 256 tokens, lo que permite integrarlo como etapa de scoring en sistemas que ya estructuran su informacion como dossieres.
- Despliegue en entornos con memoria restringida: la variante INT8 reduce el pico de memoria en GPU aproximadamente un 15,5% (de 930,8 MB a 786,5 MB) y el almacenamiento un 24,5%, adecuada para servicios con muchos modelos residentes o con limites estrictos de VRAM.
- Inferencia en CPU: con un rendimiento de 4,18 req/s y 20,89 decisiones/s en una CPU de 4 nucleos (frente a 1,92 req/s y 9,60 decisiones/s en FP16), es la opcion preferente cuando no hay GPU disponible y el volumen de peticiones es moderado.
- Triage de incidentes de seguridad: las familias `security_incidents` y `credential_compromise`/`true_positive` mantienen precision practicamente identica al modelo FP16 (0,7320 y 0,7700 respectivamente), lo que permite usarlo en flujos de evaluacion de alertas donde el coste de memoria importa.
- Evaluacion de riesgo con absteccion explicita: la primitiva `noul` (precision 0,8150, identica a FP16) permite construir sistemas que declinen decidir cuando la evidencia es insuficiente, util en revisiones de cumplimiento o moderacion.
- Batch scoring de paneles de decision: con 244,7 decisiones/s en RTX PRO 6000, puede procesar paneles de miles de decisiones en segundos para evaluaciones offline o recalibracion de umbrales.
- Serving de bajo coste con `transformers`: al usar serializacion compatible con AutoRound y `QuantLinearGPTQ`, se carga con `transformers` sin loader personalizado, lo que simplifica su integracion en servicios existentes.

## Benchmarks y rendimiento

Panel: `LocalLLaMA/typed-decisions`, config `all`, revision `e6aa632c4db73b59c7713bb21066ad1a8e1bfce6`, split `test`, 400 dossieres y 2.000 decisiones, mismo renderizado y mismas etiquetas gold.

| Metrica | FP16 (padre) | INT8 (esta variante) | Delta |
|---|---:|---:|---:|
| Precision (argmax vs gold) | 0,7445 | 0,7425 | −0,0020 |
| NLL medio | 0,6730 | 0,6735 | +0,0005 |
| Brier medio | 0,07216 | 0,07242 | +0,00026 |
| Confianza media | 0,6156 | 0,6155 | −0,0001 |
| Error ordinal medio de score | 0,3363 | 0,3350 | −0,0013 |
| Score dentro de mas o menos 1 nivel | 0,9638 | 0,9663 | +0,0025 |
| ECE (15 bins) | 0,1289 | 0,1270 | −0,0019 |

Diferencia de precision emparejada (FP16 − INT8): +0,0020, IC 95% [−0,0030, +0,0070]; el intervalo contiene cero, por lo que no es estadisticamente significativa. La coincidencia exacta de decision entre FP16 e INT8 es del 98,35% (1.967 de 2.000), con 16 transiciones correcto→incorrecto y 12 incorrecto→correcto.

| Primitiva | n | Precision FP16 | Precision INT8 | Coincidencia |
|---|---:|---:|---:|---:|
| choice | 600 | 0,7267 | 0,7217 | 0,9833 |
| noul | 600 | 0,8150 | 0,8150 | 0,9817 |
| score | 800 | 0,7050 | 0,7038 | 0,9850 |

Rendimiento medido en RTX PRO 6000 Blackwell (96 GB) y CPU de 4 nucleos, instancia caliente, 20 peticiones de calentamiento, 100 peticiones cronometradas por 3 rondas, dossier representativo de 5 preguntas:

| Dispositivo | Variante | req/s | decisiones/s | p50 (ms) | Memoria pico (MB) | Delta residente (MB) |
|---|---|---:|---:|---:|---:|---:|
| RTX PRO 6000 | FP16 | 69,4 | 347,0 | 14,3 | 930,8 | 899,9 |
| RTX PRO 6000 | INT8 | 48,9 | 244,7 | 20,4 | 786,5 | 771,3 |
| CPU (4 nucleos) | FP16 | 1,92 | 9,60 | 522,2 | 1929,4 | 454,5 |
| CPU (4 nucleos) | INT8 | 4,18 | 20,89 | 239,7 | 1911,2 | 674,7 |

## Requisitos de hardware

- VRAM estimada para inferencia en GPU: aproximadamente 786,5 MB de pico en la variante INT8 y 930,8 MB en FP16, medidos en RTX PRO 6000 Blackwell.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM libre; el modelo se ha validado en RTX PRO 6000 Blackwell (96 GB), pero su tamano permite ejecutarlo en GPU consumer.
- Cabe en GPU consumer: si, dado el reducido consumo de memoria (por debajo de 1 GB en GPU para la variante INT8).
- Despliegue: `transformers` (carga directa gracias a la serializacion compatible con AutoRound y `QuantLinearGPTQ`); backends `auto_round` `humming_zp` en GPU y `auto_round_kernel_zp` en CPU. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en RTX PRO 6000, 48,9 req/s y 244,7 decisiones/s con p50 de 20,4 ms en INT8; en CPU de 4 nucleos, 4,18 req/s y 20,89 decisiones/s con p50 de 239,7 ms. En GPU la variante INT8 es aproximadamente un 29% mas lenta que FP16 por la descompresion; en CPU es aproximadamente 2,2 veces mas rapida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision en panel | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RockAndEgg-313M-v3-INT8 | 196,7M (313M nominales) | 256 tokens de estado + 64 de opcion | 0,7425 | Apache 2.0 | Hugging Face |
| RockAndEgg-313M-v3 (FP16) | 196,7M (313M nominales) | 256 tokens de estado + 64 de opcion | 0,7445 | Apache 2.0 | Hugging Face |
| Modelos de clasificacion genericos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos publicados de otros modelos de decision tipada comparables en la informacion proporcionada; la unica comparacion directa disponible es con el modelo padre en FP16.

## Limitaciones y advertencias

- No es un modelo generativo: carece de cabeza de lenguaje y de metodo `generate`; no puede usarse para generacion de texto, resumen, traduccion ni dialogos.
- Solo soporta ingles.
- No ofrece aceleracion nativa INT8 en GPU: el backend descomprime los pesos a FP16 antes del GEMM, por lo que en GPU es aproximadamente un 29% mas lento que FP16. No debe esperarse ni anunciarse aceleracion INT8 en GPU.
- La geometria de estado esta fijada a 256 tokens y el presupuesto de opcion a 64 tokens; entradas mas largas no estan contempladas por el contrato de release.
- La precision global es de 0,7425, con un 25,75% de decisiones incorrectas en el panel de evaluacion; la precision por primitiva es de 0,7217 en `choice` y 0,7038 en `score`.
- Existe churn de decisiones del 1,65% respecto a FP16 (33 de 2.000 decisiones cambian), con 16 casos que pasan de correcto a incorrecto.
- La calibracion se realizo sobre 16 dossieres del split `train`, lo que puede no representar la distribucion de datos de produccion.
- Los scripts de cuantizacion, la procedencia de la calibracion y la evidencia de cualificacion detallada se conservan en un Gogs privado (`moe/rockandegg-v3-int8-qualification`), no publicamente accesibles.
- No se han publicado datos sobre sesgos, riesgo de alucinacion en el sentido generativo (no aplica al no generar texto) ni evaluaciones fuera del panel canonico.
- Uso comercial permitido por la licencia Apache 2.0, sin restricciones adicionales indicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moeshawky/RockAndEgg-313M-v3-INT8
- Modelo base FP16: https://huggingface.co/moeshawky/RockAndEgg-313M-v3
- Dataset de evaluacion: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Repositorio privado de cualificacion (no publico): `moe/rockandegg-v3-int8-qualification` en Gogs
- Paper, blog, repositorio publico o demo: no disponible
