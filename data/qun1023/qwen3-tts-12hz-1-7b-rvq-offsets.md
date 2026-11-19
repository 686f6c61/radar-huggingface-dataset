# Qun1023/Qwen3-TTS-12Hz-1.7B-RVQ-offsets

## Resumen

Qwen3-TTS-12Hz-1.7B-RVQ-offsets es un conjunto de pesos de drafter (borrador) para decodificación especulativa sobre el bucle interno `CodePredictor` del modelo `Qwen/Qwen3-TTS-12Hz-1.7B-Base`, publicado por el usuario Qun1023. No es un modelo de texto-a-voz autónomo: es un artefacto de aceleración que se acopla al backbone congelado de Qwen3-TTS de 1.700 millones de parámetros para reducir el número de pasos necesarios en la generación de tokens de código RVQ. La propuesta sigue el artículo arXiv:2609.37007 (*RVQ Position Aware Speculative Decoding for On Device Text to Speech*, Argmax Inc.).

El interés técnico del repositorio no reside en los pesos, sino en el método: los drafters entrenados aportan solo un +6,4% de mejora frente a una línea base sin entrenamiento (2,940 vs 3,041 tokens por paso), mientras que el árbol disperso de verificación aporta aproximadamente el 85% de la ganancia. El autor es explícito al señalar que la viabilidad depende de que la ronda especulativa completa quepa dentro de un grafo CUDA; en la ruta no grafeada de SGLang-Omni el sistema es unas dos veces más lento que la línea base (0,54×), con un coste de host de aproximadamente 2,94 ms por ronda frente a un presupuesto de 0,28 ms.

El repositorio tiene un tamaño de 0,0 GB (los pesos son mínimos: el mejor drafter tiene 199.680 parámetros), licencia Apache 2.0 y está orientado a despliegues en dispositivo y en servidores con SGLang-Omni. Es relevante ahora porque cuantifica con rigor cuándo la decodificación especulativa ayuda y cuándo perjudica en TTS, un régimen donde el coste del host y la sincronización host-dispositivo dominan el rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafters de proyección sobre hidden states del CodePredictor de Qwen3-TTS (transformer con cabezas LM por posición RVQ); no es un modelo independiente |
| Parametros totales | 3.072 (offsets_b1_paper_recipe.pt y offsets_c1_shared_bias.pt); 199.680 (offsets_c3_lowrank_r32.pt, el mejor) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-TTS-12Hz-1.7B; no especificada) |
| Tipos de cuantizacion | No disponible (pesos en PyTorch `.pt`; no se documentan cuantizaciones) |
| Idiomas soportados | No disponible (depende del modelo base Qwen3-TTS) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`); árboles en JSON (`tree_n31.json`, `trees_all.json`); parche Triton (`tree_mask.patch`) |

## Arquitectura y entrenamiento

El mecanismo opera sobre el `CodePredictor` de Qwen3-TTS, que genera 16 tokens de código RVQ por frame con 15 cabezas LM (`lm_head[i]`, i = 0..14). Los drafters se aplican como `lm_head[i+j](f(H_i))`, donde `H_i` es el hidden post-final-norm que alimenta a `lm_head[i]`. El backbone, las 15 tablas de embedding por posición y las 15 cabezas LM permanecen congelados. La verificación emplea rejection sampling exacto sin pérdida, por lo que la distribución de salida no cambia. El índice se validó antes del entrenamiento: `argmax(lm_head[i](H_i)) == c_{i+1}` con cero discrepancias sobre 2×95 frames × 15 cabezas, y la reconstrucción teacher-forced reproduce `H_i` con coseno ≥ 0,9994.

Se publican tres variantes de drafter: la receta literal del artículo (sesgo compartido por profundidad `b_j ∈ R^1024`, K=3, objetivo de entropía cruzada), una variante con la misma forma entrenada con el objetivo de aceptación (distancia de variación total) y la mejor variante, `A_j·H + b_j` con `A_j` de bajo rango r=32. El entrenamiento se realizó con K=3 borradores por paso. Los experimentos del autor muestran que más datos no ayuda (pasar del 10% al 100% del conjunto mueve la CE de validación en 0,0006), que más capacidad apenas aporta (de 3.072 a 3,1M parámetros: −0,35 nats de CE pero solo +1,2% en tokens por paso) y que borradores más profundos (K=5) empeoran en todos los presupuestos ≤47. La innovación clave es el árbol disperso codicioso (`tree_n31.json` y `trees_all.json` con presupuestos de 7/14/20/31/47/63 nodos) junto con la máscara de atención Triton (`tree_mask.patch`) para la ruta del predictor en SGLang-Omni.

## Capacidades

- Aceleración de la generación de tokens RVQ del CodePredictor de Qwen3-TTS mediante decodificación especulativa con verificación exacta sin pérdida.
- Longitud aceptada medida de hasta 3,041 tokens por paso con árbol disperso N=31 y muestreo en vivo.
- Soporte de árboles dispersos codiciosos con presupuestos de 7, 14, 20, 31, 47 y 63 nodos.
- Integración con SGLang-Omni mediante máscara de atención Triton para el camino del predictor.
- Tres variantes de drafter con distintos objetivos de entrenamiento (CE y TV) y capacidades (3.072 y 199.680 parámetros).
- No es un modelo de texto-a-voz: no genera audio por sí mismo, no soporta tool calling, ni agentes, ni capacidades multilingües propias.
- El autor documenta explícitamente los escenarios en los que el método no es rentable (rutas no grafea­das).

## Casos de uso

- Aceleración de inferencia TTS en producción con SGLang-Omni: el drafter se acopla al CodePredictor congelado y, si la ronda especulativa completa cabe en un grafo CUDA, alcanza un techo teórico de 2,69× en N=14 y 2,38× en N=31 sobre la línea base grafea­da de 2,362 ms/frame. Adecuado para despliegues que ya usan la ruta grafea­da de SGLang-Omni.
- Investigación en decodificación especulativa para códecs RVQ: el repositorio incluye las mediciones de aceptación por nivel (lv1, lv2|1, lv3|12) sobre 26.722 frames retenidos, lo que permite reproducir y extender el análisis de árboles dispersos frente a árboles m-arios completos.
- Evaluación de viabilidad de aceleración en dispositivo: el artículo de referencia (arXiv:2609.37007) apunta a TTS en dispositivo; el repositorio cuantifica el coste de host por ronda (≈2,94 ms) y el presupuesto (0,28 ms), útil para decidir si el hardware objetivo puede sostener la especulación.
- Reutilización del árbol disperso en otros modelos TTS con estructura de cabezas por posición: los ficheros `tree_n31.json` y `trees_all.json` son independientes de los pesos y pueden servir de punto de partida para otros codecs RVQ con 15 cabezas.
- Estudio de objetivos de entrenamiento para drafters: la comparación entre objetivo CE y objetivo TV (aceptación) con resultados por presupuesto sirve para diseñar drafters en otros sistemas especulativos, dado que el autor demuestra que CE y aceptación están desacoplados y a veces anticorrelacionados.
- Análisis de cuellos de botella host-dispositivo: el desglose por etapa (proyección de ancla 0,283 ms, proyecciones de borrador 0,636 ms, ensamblado de árbol 0,558 ms, forward 2,496 ms, recorrido/rejection sampling 0,627 ms, commit/KV 0,301 ms, glue de Python ~0,54 ms, 4,557 sincronizaciones por ronda) es material directo para optimizar el runtime.

## Benchmarks y rendimiento

Resultados de aceptación por nivel y longitud aceptada, sobre 26.722 frames retenidos con muestreo de despliegue (temp 0,9 / top_k 50 / top_p 1,0 / rep_penalty 1,05):

| Drafter | m | Nodos N | lv1 | lv2\|1 | lv3\|12 | toks/paso |
|---|---:|---:|---:|---:|---:|---:|
| ninguno (b=0) | 1 | 3 | 0,474 | 0,424 | 0,411 | 1,757 |
| ninguno (b=0) | 4 | 84 | 0,831 | 0,791 | 0,753 | 2,983 |
| ninguno (b=0) | 16 | 4.368 | 0,952 | 0,943 | 0,936 | 3,690 |
| C3 | 1 | 3 | 0,521 | 0,455 | 0,438 | 1,861 |
| C3 | 4 | 84 | 0,885 | 0,822 | 0,781 | 3,179 |
| C3 | 16 | 4.368 | 0,985 | 0,970 | 0,958 | 3,855 |

Rendimiento en un H200 con la ruta Qwen3-TTS de SGLang-Omni, emparejado ABBA, `numactl` fijado, p50 de ≥30 repeticiones:

| Configuración | ms/frame | vs línea base grafea­da |
|---|---:|---:|
| línea base sin grafo | 15,08 | 0,157× |
| línea base grafea­da (ruta de producción) | 2,362 | 1,000× |
| especulativa sin grafo | 26,08 | 0,091× |

Coste del forward grafea­do en la ruta fusionada: q=1 → 0,1441 ms; q=16 → 0,1441 ms (gratis, 0,9996×); q=32 → 0,1843 ms (1,279×). El autor no publica resultados de benchmarks estándar de TTS (MOS, WER, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; los drafters ocupan entre 3.072 y 199.680 parámetros (kilobytes), pero requieren cargar el backbone Qwen3-TTS-12Hz-1.7B completo (1,7 mil millones de parámetros).
- GPU de referencia empleada en las mediciones: NVIDIA H200, con `numactl` fijado y emparejado ABBA.
- GPU consumer: no disponible; el autor no documenta pruebas en RTX 4090 ni similares.
- Despliegue: SGLang-Omni (ruta de producción grafea­da); se proporciona `tree_mask.patch` como máscara de atención Triton. No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: línea base grafea­da 2,362 ms/frame; especulativa sin grafo 26,08 ms/frame. Techo teórico de 2,69× (N=14) y 2,38× (N=31) solo alcanzable con la ronda completa dentro de un grafo CUDA.
- Throughput: no disponible como cifra agregada; el autor reporta tokens aceptados por paso (hasta 3,041) en lugar de throughput absoluto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-1.7B-RVQ-offsets (este) | 3.072 / 199.680 (drafter) + 1,7B (base congelado) | No disponible | Aceleración especulativa de TTS | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-TTS-12Hz-1.7B-Base | 1,7B | No disponible | TTS base | No disponible en la información | Hugging Face |
| Línea base sin drafter (b=0, naive head reuse) | 0 | No disponible | Referencia de aceptación sin entrenamiento | No aplica | Resultado interno del artículo |
| Modelos TTS especulativos comparables | No disponible | No disponible | No disponible | No disponible | No disponible en la información |

No se dispone de datos de benchmarks estándar de TTS ni de otros drafters públicos comparables en la información proporcionada.

## Limitaciones y advertencias

- Los pesos por sí solos aportan solo +6,4% sobre una línea base sin entrenamiento; el valor real está en el árbol disperso y en la ruta grafea­da.
- En la ruta no grafea­da de SGLang-Omni el sistema es aproximadamente 2× más lento (0,54×); el autor lo califica de no viable.
- El coste de host por ronda (≈2,94 ms) supera con creces el presupuesto (0,28 ms), con 4,557 sincronizaciones host-dispositivo por ronda.
- El despliegue en cadena (sin árbol) no es viable: 1,861 tokens por paso frente a 3,041 con árbol N=31.
- No es un modelo TTS autónomo: requiere el backbone Qwen3-TTS-12Hz-1.7B-Base y su runtime SGLang-Omni.
- Idiomas soportados no documentados; dependen del modelo base.
- No se documentan sesgos, tasas de alucinación ni evaluaciones de calidad de audio (MOS, WER) en la información disponible.
- La licencia Apache 2.0 cubre los pesos del drafter; el uso comercial del backbone base queda sujeto a la licencia de Qwen3-TTS, no especificada aquí.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente.
- Los resultados de rendimiento se midieron en un único H200; no se documenta variabilidad en otros hardware.

## Enlaces

- Hugging Face: https://huggingface.co/Qun1023/Qwen3-TTS-12Hz-1.7B-RVQ-offsets
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Artículo de referencia: arXiv:2609.37007 (*RVQ Position Aware Speculative Decoding for On Device Text to Speech*, Argmax Inc.)
- SGLang-Omni (issue de producción citada): sgl-project/sglang-omni#3583
