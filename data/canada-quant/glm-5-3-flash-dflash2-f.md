# canada-quant/GLM-5.3-Flash-DFlash2-F

## Resumen

GLM-5.3-Flash-DFlash2-F es un modelo borrador (drafter) de decodificación especulativa por difusión de bloques, desarrollado por canada-quant y publicado bajo licencia Apache-2.0. No es un modelo de propósito general: su única función es proponer bloques de tokens que el modelo objetivo GLM-5.3-Flash (de zai-org) valida después, reduciendo el coste por token generado. Se entrenó específicamente contra la cuantización INT4 de canada-quant (`GLM-5.3-Flash-W4A16-MTP`), aunque también funciona con el objetivo en BF16.

Técnicamente es un `DFlash2DraftModel` con backbone de estilo Qwen3: 8 capas decoder con atención completa (sin sliding window), dimensión oculta 4096, 32 cabezas de atención y 8 cabezas KV con head_dim 128. El borrador consume 9 taps de estados ocultos del modelo objetivo en las capas [5, 9, 14, 19, 24, 28, 33, 38, 42] y trabaja con bloques de tamaño 8, lo que se traduce en K = 7 tokens especulativos por paso. La model card declara ~1,84B parámetros de borrador y un checkpoint bf16 de 6,2 GB, mientras que el índice de safetensors del repositorio reporta 3.111.069.696 parámetros totales (la diferencia es coherente con el envío de `embed_tokens` y `lm_head` sin atar).

Su relevancia es doble. Por un lado, alcanza paridad medida con el borrador de referencia `incoai/GLM-5.3-Flash-DFlash2` en la misma generación de hardware y el mismo día (3,626 frente a 3,632 de longitud media de aceptación a K=7 y concurrencia 16), pero bajo una licencia permisiva Apache-2.0, sin las cláusulas NC/ND de la referencia. Por otro lado, toda la cadena de entrenamiento es propia y auditable: los datos son autogenerados por el modelo objetivo y el registro de procedencia se publica de forma literal en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash2 block-diffusion drafter (`DFlash2DraftModel`) con backbone estilo Qwen3; 8 capas decoder con atencion completa (sin sliding window); hidden 4096, intermediate 12288; 32 cabezas de atencion / 8 cabezas KV; head_dim 128 |
| Parametros totales | 3.111.069.696 segun el indice de safetensors del repositorio; la model card declara ~1,84B parametros de borrador y 6,2 GB de checkpoint bf16 (con `embed_tokens` + `lm_head` sin atar) |
| Parametros activos | no aplica (el borrador es denso, no MoE) |
| Longitud de contexto | max positions del borrador: 1.048.576. El bloque especulativo es de tamano 8, con K = 7 tokens especulativos (`num_speculative_tokens: 7`) |
| Tipos de cuantizacion | el borrador se distribuye en bf16; se entrena y sirve contra el objetivo cuantizado INT4 (`w4a16`, `GLM-5.3-Flash-W4A16-MTP`) o contra BF16 |
| Idiomas soportados | no disponible (no se declara lista de idiomas; hereda el comportamiento del modelo objetivo) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16), mas `mask_embedding.pt` para el enmascaramiento aprendido (`mask_token_id` 154856) |
| Taps del objetivo | 9 taps de estados ocultos en las capas [5, 9, 14, 19, 24, 28, 33, 38, 42] |
| Selector | rank 256, top_k 16, grouped dynamic conv (kernel 2, grupo 16); entrenado, no vestigial |
| Libreria | vllm |
| Modelo base | zai-org/GLM-5.3-Flash |

## Arquitectura y entrenamiento

El modelo es un borrador de difusión de bloques. En lugar de predecir token a token, propone un bloque completo de forma paralela y lo refina mediante el enmascaramiento aprendido (`mask_embedding.pt`), apoyandose en 9 estados ocultos intermedios extraidos del modelo objetivo. Un selector entrenable (rank 256, top_k 16, convolucion dinamica agrupada con kernel 2 y grupo 16) decide que informacion de esos taps resulta util en cada paso. El backbone es Qwen3-style con atencion completa y 8 capas, lo que mantiene el coste del borrador muy por debajo del objetivo. El tamaño de bloque es 8, del que se derivan 7 tokens especulativos.

El entrenamiento parte de un warm start sobre `dflash2E` (la release anterior del mismo autor) y realiza una sola pasada sobre 449.600 muestras autogeneradas: las 350.260 de `-E` mas 99.340 completaciones nuevas de prompts nunca antes generados. Fueron 41.279 pasos con learning rate 1e-4 → 1e-5 con decaimiento coseno, ponderacion de cola gamma-6.5 y funcion de perdida combinada de entropia cruzada mas KL sobre el top-20, durante 16,5 horas en 8× NVIDIA B300. Los prompts proceden de conjuntos de instrucciones publicos (ultrachat_200k · MIT, OpenR1-Math-220k · Apache-2.0, OpenMathReasoning · CC-BY-4.0, OpenScienceReasoning-2 · CC-BY-4.0, OpenCodeReasoning / OpenCodeInstruct · CC-BY-4.0, evol-codealpaca-v1 · Apache-2.0), pero cada completación fue regenerada por el propio modelo objetivo con modo thinking activado, T=1.0 y top_p 0.95, hasta un maximo de 4.096 tokens. Segun el autor, no se uso ningun peso ni traza de borradores de terceros en la ruta de entrenamiento, y `PROVENANCE.txt` recoge el registro literal.

## Capacidades

- Decodificacion especulativa por difusion de bloques: propone 7 tokens por paso (bloque de 8) para acelerar la generacion del modelo objetivo GLM-5.3-Flash.
- Aceptacion multi-posicion: tasas medias por posicion de 0,750 · 0,555 · 0,415 · 0,316 · 0,244 · 0,193 · 0,153 a K=7 y concurrencia 16.
- Compatibilidad con dos backends de objetivo: el INT4 `GLM-5.3-Flash-W4A16-MTP` contra el que fue entrenado, o GLM-5.3-Flash en BF16.
- Integracion nativa con vLLM mediante `speculative-config` con `method: dflash`.
- Sustitucion directa (drop-in) de `dflash2E`: misma arquitectura y mismo contrato de servicio, sin cambios en el launcher.
- Funcionamiento en x86 con tensor parallelism (TP=4 en H100/H200/B300) y en ARM/DGX Spark (SM121) con TP=2.
- No genera texto de forma autonoma ni responde a instrucciones: no tiene capacidades de razonamiento, codigo, matematicas o vision por si mismo; estas dependen integramente del modelo objetivo.

## Casos de uso

- Aceleracion de inferencia en produccion: sirviendo GLM-5.3-Flash (INT4 o BF16) con vLLM y este borrador como `speculative-config`, se reduce el coste por token generado gracias a la validacion en bloque; medido a 1.406 tokens de salida por segundo en 8× B300 con concurrencia 16 y K=7.
- Despliegue on-premise en 2× DGX Spark: existe una imagen preconstruida y un launcher de un solo comando en `canada-quant/vllm-glm53-flash-sm121`, con el borrador montado en tiempo de ejecucion mediante `DRAFTER_HOST_PATH`, sin recompilar. Adecuado para equipos que necesitan inferencia local en hardware de escritorio profesional.
- Sustitucion de borradores con licencia restrictiva: al ser Apache-2.0 y ofrecer paridad medida con la referencia `incoai/GLM-5.3-Flash-DFlash2` (CC-BY-NC-ND-4.0), permite desplegar decodificacion especulativa en productos comerciales sin las clausulas de no derivadas ni de no uso comercial.
- Chat interactivo de baja latencia en un solo stream: con K=7 y concurrencia 1 se midieron 313 tokens/s de salida y una longitud media de aceptacion de 3,677, lo que resulta adecuado para asistentes conversacionales donde la latencia percibida es critica.
- Generacion de codigo y razonamiento con salidas largas: el borrador se entreno sobre completaciones de hasta 4.096 tokens en modo thinking, procedentes de conjuntos de matematicas, ciencia y codigo (OpenCodeReasoning, OpenMathReasoning, OpenR1-Math), por lo que mantiene su tasa de aceptacion en respuestas largas y estructuradas.
- Auditoria y cumplimiento de procedencia de datos: al incluir `PROVENANCE.txt` con el registro literal de entrenamiento y al no haber usado datos de terceros, facilita los procesos internos de revision de origen de datos en entornos regulados.
- Evaluacion comparativa de borradores: sirve como referencia reproducible para medir longitud media de aceptacion y throughput de otros drafters en el mismo hardware, usando el kit de evaluacion del repositorio del autor.

## Benchmarks y rendimiento

Evaluacion sobre 500 prompts no vistos en entrenamiento, thinking activado, T=1.0 / top_p 0.95, max_tokens 1024, borradores greedy, TP=4 (la fila c1 corresponde a 100 prompts con concurrencia 1). Todas las filas se midieron en la misma maquina 8× B300, con la misma build de vLLM y el mismo backend de objetivo (`FLASHINFER_MLA_SPARSE`).

| Longitud media de aceptacion (tokens/s de salida) | K=7, c16 | K=4, c16 | K=7, c1 |
|---|---|---|---|
| `dflash2F` (este modelo) | 3,626 (1.406) | 3,085 (1.339) | 3,677 (313) |
| incoai/GLM-5.3-Flash-DFlash2 (CC-BY-NC-ND-4.0) | 3,632 (1.425) | 3,136 (1.369) | 3,667 (328) |
| `dflash2E` (release anterior del autor) | 3,561 (1.397) | — | — |

Aceptacion por posicion (K=7, c16): 0,750 · 0,555 · 0,415 · 0,316 · 0,244 · 0,193 · 0,153 (referencia incoai: 0,75 · 0,55 · 0,41 · 0,32 · 0,25 · 0,20 · 0,16).

El propio autor describe el resultado como paridad: −0,006 a K=7 y +0,010 en single-stream, ambas dentro del ruido de ±0,015 del protocolo, con un deficit del 1,6% a K=4 (−0,051, primeras posiciones de borrador). Frente a `-E` la mejora es de +0,065 a K=7, la mayor ganancia de una sola etapa en la linea de releases. En H200, la campaña anterior midio `-E` en 3,568 / 3,067 / 3,585, y en 2× DGX Spark (SM121) `-E` reprodujo su aceptacion de H200 con una desviacion del 0,3% (3,5788 en c16 / 3,5970 en c1). No se han publicado benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que no aplican a un modelo borrador.

## Requisitos de hardware

- VRAM del borrador: el checkpoint bf16 ocupa 6,2 GB en disco. La VRAM efectiva en inferencia es algo superior por buffers y estado del selector; no se publica una cifra medida. La memoria dominante la consume el modelo objetivo (GLM-5.3-Flash en W4A16 o BF16), no el borrador.
- GPUs validadas por el autor: 8× NVIDIA B300 para la campaña de evaluacion (TP=4), NVIDIA H200 (campaña anterior, TP=4) y NVIDIA H100 indicada como plataforma x86 soportada. Compatibilidad declarada tambien con B300 en TP=4.
- Entrenamiento: 8× NVIDIA B300 durante 16,5 horas.
- ARM / DGX Spark: 2× DGX Spark (arquitectura SM121) con TP=2, mediante imagen preconstruida y launcher de un solo comando; el borrador se monta en tiempo de ejecucion. La medicion A/B de `-F` frente a `-E` y frente a la referencia en Spark esta pendiente: el autor recomienda remedir en cada maquina antes de citar cifras de Spark.
- GPU de consumo: no disponible. No hay ninguna medicion publicada en GPUs consumer; el tamano del checkpoint (6,2 GB en bf16) no es el factor limitante, pero el modelo objetivo si lo es.
- Opciones de despliegue: vLLM (libreria declarada) con `--speculative-config '{"method":"dflash","model":"...","num_speculative_tokens":7}'`, `--tensor-parallel-size 4`, `--enable-expert-parallel`, `--block-size 64` y `--no-enable-prefix-caching`. Requiere vLLM nightly de fecha igual o posterior al 2026-09-08 en x86, mas dos parches de bind-mount de GLM-5.3-Flash DFlash2 disponibles en el repositorio del autor. En DGX Spark se usa la imagen preconstruida `canada-quant/vllm-glm53-flash-sm121`.
- Latencia y throughput medidos (8× B300, TP=4): 1.406 tokens/s de salida a K=7 c16; 1.339 tokens/s a K=4 c16; 313 tokens/s a K=7 c1.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | K / bloque | Aceptacion K=7 c16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GLM-5.3-Flash-DFlash2-F (este) | DFlash2 drafter | ~1,84B borrador (3,11B en safetensors del repo) | K=7, bloque 8 | 3,626 | Apache-2.0 | HuggingFace, pesos safetensors |
| incoai/GLM-5.3-Flash-DFlash2 | DFlash2 drafter | no disponible | K=7 (medido a c16) | 3,632 | CC-BY-NC-ND-4.0 | HuggingFace, uso no comercial y sin derivadas |
| canada-quant/GLM-5.3-Flash-DFlash2-E | DFlash2 drafter (release previa) | misma arquitectura | K=7, bloque 8 | 3,561 | no disponible en la informacion proporcionada | HuggingFace |
| zai-org/GLM-5.3-Flash | modelo objetivo | no disponible | no aplica | no aplica | no disponible en la informacion proporcionada | HuggingFace |

La diferencia relevante frente a la referencia no es de aceptacion (dentro del ruido) sino de licencia y trazabilidad: la referencia impide uso comercial y obras derivadas, mientras que este borrador es Apache-2.0 y publica la procedencia completa de sus datos de entrenamiento.

## Limitaciones y advertencias

- Modelo auxiliar, no autonomo: no genera texto por si mismo ni puede usarse sin GLM-5.3-Flash como objetivo. Cualquier uso fuera de un servidor de decodificacion especulativa carece de sentido.
- Dependencia de version: requiere vLLM nightly igual o posterior al 2026-09-08 y dos parches de bind-mount especificos. No funciona con builds antiguas ni con versiones estables anteriores.
- Dependencia de hardware: las cifras de aceptacion varian entre generaciones de GPU (la referencia incoai mide 3,602–3,615 en H200 frente a 3,632 en B300), por lo que no deben extrapolarse resultados entre plataformas. El autor insiste en remedir en cada maquina.
- Rendimiento en DGX Spark no confirmado: la medicion A/B de `-F` en SM121 esta pendiente; el dato de 0,3% de desviacion corresponde a `-E`, no a este modelo.
- Aceptacion decreciente por posicion: la tasa cae de 0,750 en la primera posicion a 0,153 en la septima, de modo que la ventaja real se concentra en las primeras posiciones del bloque; a K=4 el modelo esta un 1,6% por debajo de la referencia.
- Protocolo de evaluacion limitado: 500 prompts (100 en el caso de c1), una sola temperatura (1.0), top_p 0.95 y max_tokens 1024. El comportamiento fuera de ese regimen no esta documentado.
- Idiomas: la model card no declara lista de idiomas soportados. El rendimiento multilingue depende enteramente del modelo objetivo y no ha sido evaluado para el borrador.
- Riesgo de alucinacion: no aplica directamente, ya que el objetivo valida cada token propuesto; un borrador con baja aceptacion solo reduce la velocidad, no la calidad de la salida.
- Sesgos: no se documenta ninguna evaluacion de sesgos. Los prompts de entrenamiento provienen de conjuntos de instrucciones publicos en ingles mayoritariamente (ultrachat_200k, OpenR1-Math, OpenCodeReasoning), lo que puede sesgar las tasas de aceptacion hacia dominios y lenguas concretas.
- Informacion incompleta en la fuente: la model card consultada aparece truncada en la seccion de restricciones duras ("Hard constraints"), por lo que pueden existir limitaciones adicionales no recogidas aqui.
- Licencia del modelo objetivo: la licencia Apache-2.0 cubre este borrador, pero el uso comercial sigue sujeto a los terminos de zai-org/GLM-5.3-Flash, que no se detallan en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/canada-quant/GLM-5.3-Flash-DFlash2-F
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Cuantizacion INT4 contra la que fue entrenado: https://huggingface.co/canada-quant/GLM-5.3-Flash-W4A16-MTP
- Release anterior sustituida: https://huggingface.co/canada-quant/GLM-5.3-Flash-DFlash2-E
- Borrador de referencia (CC-BY-NC-ND-4.0): https://huggingface.co/incoai/GLM-5.3-Flash-DFlash2
- Repositorio de receta, codigo, parches y mediciones brutas: https://github.com/canada-quant/dgx-spark-sm121
- Imagen y launcher para 2× DGX Spark (SM121): https://github.com/canada-quant/vllm-glm53-flash-sm121
- Launcher TP=2 incluido en el repositorio del modelo: `launch_dflash2_tp2.sh`
- Referencia arXiv declarada en las etiquetas del modelo: arxiv:2602.06036 (no verificada en la informacion disponible)
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo.
