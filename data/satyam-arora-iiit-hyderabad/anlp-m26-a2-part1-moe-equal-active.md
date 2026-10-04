# satyam-arora-iiit-hyderabad/anlp-m26-a2-part1-moe-equal-active

## Resumen

`anlp-m26-a2-part1-moe-equal-active` es un checkpoint de traduccion con arquitectura decoder-only y mezcla de expertos (MoE), desarrollado por el usuario `satyam-arora-iiit-hyderabad` en el contexto de una asignatura de NLP avanzado (ANLP, asignacion 2, parte 1). El modelo traduce vietnamita e ingles y japones a ingles, y se entreno sobre el dataset `belumind/en-vi-ja-curated-500k-triplets` con un presupuesto fijo de tokens de contexto definido por el repositorio de la asignatura. La evaluacion se realizo sobre el checkpoint final, no sobre el mejor checkpoint por validacion.

Se trata de un modelo pequeno en terminos absolutos: 26.924.928 parametros totales y 19.847.040 parametros activos por token, lo que supone que aproximadamente el 73,7 % del total se activa en cada paso forward. Esta relacion entre parametros totales y activos es la caracteristica que da nombre a la variante (`moe_equal_active`), pensada para comparar configuraciones MoE con el mismo presupuesto de tokens de entrenamiento que una linea base densa.

Su relevancia es fundamentalmente academica y reproducible: no es un modelo listo para produccion, sino un artefacto de investigacion con metricas publicadas (perplejidad de test 23,1099 y BLEU combinado 18,4354) y ficheros de trazas de uso de expertos. Resulta util como referencia para estudiar enrutado de expertos en tareas de traduccion de bajos recursos y para reproducir experimentos de enrutado, no como alternativa a sistemas de traduccion comerciales o de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (MoE) |
| Parametros totales | 26.924.928 |
| Parametros activos | 19.847.040 por token (aprox. 73,7 % del total) |
| Longitud de contexto | no disponible (la model card menciona un presupuesto fijo de tokens de contexto del repositorio, sin cifra publicada) |
| Tipos de cuantizacion | no disponible (solo se publican checkpoints PyTorch; no hay variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en, vi, ja (traduccion vi→en y ja→en; el modelo no esta planteado como bidireccional) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`model.pt`, `best_validation_model.pt`); tokenizer en `tokenizer.json` (BPE byte-level con tokens de idioma y control); configuracion en `model_config.json` y `part1_config.json` |

Datos adicionales del repositorio: tamano 0,2 GB, 0 descargas y 0 likes en el momento de la consulta, creado el 2026-10-03.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con capas de mezcla de expertos, implementada a medida y no incluida en el repositorio de pesos: el cargador y el codigo de definicion viven en el repositorio de la asignatura, por lo que cargar el checkpoint requiere ese codigo y no basta con `transformers` estandar. El tokenizador es un BPE byte-level con tokens especificos de idioma y de control, lo que sugiere un esquema de generacion condicionada por idioma de origen. La variante `moe_equal_active` se entreno con el mismo presupuesto de tokens de contexto que las demas variantes del trabajo, de modo que las diferencias de calidad entre ellas son atribuibles al diseno del enrutado y no a un mayor coste de computo.

El entrenamiento usa el dataset `belumind/en-vi-ja-curated-500k-triplets`, con hasta 500.000 tripletas en ingles, vietnamita y japones. La model card no documenta el numero exacto de tokens procesados, la composicion final del dataset, ni si hubo fases de ajuste por preferencias (RLHF, DPO) o instruccion; tampoco describe la estrategia de enrutado (top-k, capacidad de experto, balanceo de carga). Lo que si se publica son trazas de uso de expertos en CSV, JSON y SVG, lo que permite auditar el reparto de carga entre expertos. La evaluacion se hizo con el checkpoint final, no con el de menor NLL en validacion, un detalle relevante porque el checkpoint `best_validation_model.pt` se ofrece como opcional y puede dar resultados distintos.

## Capacidades

- Traduccion de vietnamita a ingles y de japones a ingles, con generacion autoregresiva decoder-only.
- Generacion de texto en ingles como idioma de destino principal.
- Condicionamiento por tokens de idioma y de control del tokenizador, lo que permite separar el idioma de origen en la entrada.
- Analisis de enrutado de expertos: el repositorio incluye ficheros de uso de expertos para estudiar la especializacion por idioma o por tipo de token.
- Entrenamiento y evaluacion reproducibles: se publican metricas legibles por maquina (`evaluation_metrics.json`, `parameter_report.json`) y dos checkpoints.
- No dispone de soporte documentado de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- No se documenta capacidad multilingue fuera de los tres idiomas declarados.

## Casos de uso

- Reproduccion academica de experimentos MoE: cargar el checkpoint con el codigo del repositorio de la asignatura y comparar el BLEU combinado (18,4354) frente a variantes densas o con otro enrutado bajo el mismo presupuesto de tokens.
- Analisis de especializacion de expertos: usar los CSV/JSON de uso de expertos para medir si los expertos se reparten por idioma (vi frente a ja) o por posicion en la secuencia, un analisis habitual en trabajos de interpretabilidad de MoE.
- Traduccion de bajo volumen en un pipeline interno: al ocupar decenas de megabytes, el modelo puede ejecutarse en CPU para traduccion por lotes de textos en vietnamita o japones cuando no se requiere calidad de publicacion.
- Generacion de datos sinteticos de traduccion: producir pares vi→en o ja→en de bajo coste para preentrenar o aumentar otros sistemas, filtrando despues por calidad.
- Evaluacion de pipelines de despliegue ligero: sirve como banco de pruebas para medir latencia y throughput de un transformer pequeno en CPU, GPU de portatil o entornos sin acelerador.
- Ensenanza de traduccion neuronal: por su tamano, el checkpoint completo (0,2 GB) cabe en cualquier portatil y permite inspeccionar pesos, activaciones de expertos y tokenizacion en clase o en practicas.
- Pruebas de tokenizacion multilingue: el `tokenizer.json` con tokens de lenguaje y control es util para estudiar la fragmentacion de texto vietnamita y japones con BPE byte-level.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---:|
| Perplejidad de test | 23,1099 |
| BLEU combinado | 18,4354 |
| BLEU vietnamita | 22,1852 |
| BLEU japones | 14,9461 |
| Parametros totales | 26.924.928 |
| Parametros activos por token | 19.847.040 |

No se han publicado en la informacion disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K, FLORES-200, etc.) ni comparaciones con modelos de referencia. Las cifras anteriores corresponden al checkpoint final usado para la evaluacion de test.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 108 MB en fp32 y 54 MB en fp16 para los 26,9 millones de parametros, mas el coste de activaciones, cache KV y overhead del runtime. Son estimaciones derivadas del numero de parametros, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con mas de 1 GB de VRAM es suficiente; no se necesita A100, H100 ni RTX 4090. Una RTX 3060, una GTX 1650 o incluso una GPU integrada pueden ejecutarlo.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo y en CPU.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. Al usar una arquitectura a medida, el despliegue requiere el codigo del repositorio de la asignatura y un script de inferencia propio; convertir a GGUF exigiria implementar la arquitectura en llama.cpp.
- Latencia y throughput estimados: no disponible. Al no publicarse la longitud de contexto ni el numero de capas y expertos, no es posible estimar tiempos de forma fiable.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos comparables en la informacion proporcionada. La tabla siguiente recoge unicamente lo que consta para este checkpoint; las alternativas de la misma categoria (por ejemplo, sistemas de traduccion vi↔en y ja↔en de la familia OPUS-MT o NLLB) no aparecen en la informacion disponible y sus cifras se marcan como no disponibles para no introducir datos no verificados.

| Modelo | Parametros | Contexto | Idiomas | Licencia |
|---|---|---|---|---|
| `anlp-m26-a2-part1-moe-equal-active` | 26.924.928 totales / 19.847.040 activos | no disponible | en, vi, ja | no disponible |
| Alternativa densa de la misma asignatura | no disponible | no disponible | en, vi, ja | no disponible |
| Modelos de traduccion multilingue de gran escala | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenarse sobre un unico dataset curado de 500.000 tripletas, es probable un sesgo de dominio hacia el estilo y los temas de ese corpus, pero no hay analisis publicado.
- Riesgo de alucinacion: no evaluado. La calidad medida (BLEU japones 14,9461, notablemente inferior al vietnamita) indica que las salidas en pares ja→en son mas fragiles y que pueden aparecer omisiones o invenciones de contenido.
- Limitaciones de contexto e idioma: solo se declaran en, vi, ja; no hay soporte de otros idiomas ni de traduccion inversa (en→vi, en→ja) documentado. La longitud de contexto no se publica.
- Restricciones de licencia: la licencia no esta disponible, por lo que no puede asumirse uso comercial. Al ser un trabajo de asignatura, conviene contactar con el autor antes de cualquier uso fuera del ambito academico.
- Dependencia de codigo externo: los pesos no son cargables con `transformers` sin el codigo del repositorio de la asignatura; esto complica el despliegue y la reproducibilidad a largo plazo.
- Checkpoint final frente a mejor validacion: las metricas publicadas corresponden al checkpoint final, no al de menor NLL en validacion; el rendimiento en produccion puede diferir si se usa `best_validation_model.pt`.
- Ausencia de datos de produccion: 0 descargas y 0 likes, sin informes de terceros sobre estabilidad, latencia o comportamiento en dominios reales.
- Metadatos a revisar: las fechas del repositorio (creacion y actualizacion el 2026-10-03) son posteriores a la fecha habitual de consulta, lo que sugiere un posible error de marca temporal en el registro.
- No apto para tool calling, agentes, vision ni audio: no hay soporte documentado de ninguna de estas capacidades.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/satyam-arora-iiit-hyderabad/anlp-m26-a2-part1-moe-equal-active
- Dataset de entrenamiento: https://huggingface.co/datasets/belumind/en-vi-ja-curated-500k-triplets
- Repositorio de la asignatura con la arquitectura y el codigo de carga: no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible
- Demo: no disponible
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a herramientas de busqueda visual (Bing Visual Search, Google Images, Scanly) y no guardan relacion con este checkpoint.
