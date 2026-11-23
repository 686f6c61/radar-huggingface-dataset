# kilizi/pop-mopd

## Resumen

POP-MOPD es una familia de dos checkpoints experimentales derivados de SmolLM3-3B, publicados por el usuario kilizi en Hugging Face. Se trata de modelos de investigacion obtenidos mediante destilacion on-policy multi-profesor (multi-teacher on-policy distillation, OPD) con un curriculo de tokens consciente del dominio, partiendo de la inicializacion del estudiante `BytedTsinghua-SIA/Open-MOPD-SmolLM3-3B-MixSFT`. El objetivo es mejorar las capacidades de matematicas, codigo y seguimiento de instrucciones de un modelo pequeno de 3B parametros sin aumentar su tamano.

El repositorio contiene dos variantes entrenadas hasta el paso 100: `pre-mask-step-100`, con ponderacion de dominio original, y `post-mask-step-100`, que recalcula las cuotas de tokens a partir de las proporciones seleccionadas. Ambas emplean tres profesores especializados (matematicas, codigo e instruction-following) y una politica de seleccion de tokens basada en la divergencia estudiante-profesor mediante KL inversa top-16 condicional.

La relevancia de esta publicacion es metodologica: explora como un curriculo de tokens por dominio afecta a un modelo compacto de la familia SmolLM3, y publica resultados parciales en AIME24, AIME25, LiveCodeBench e IFEval. No obstante, se trata de checkpoints de investigacion de un solo entrenamiento, sin licencia propia declarada y con evaluacion incompleta en la variante post-mask, por lo que no deben considerarse modelos listos para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de SmolLM3-3B) |
| Parametros totales | 3B (heredados del modelo base SmolLM3-3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (sujeto a las licencias upstream del modelo base, profesores y dataset; la model card no concede licencia nueva) |
| Formato de pesos | safetensors (BF16, dos shards por variante) + config de generacion, tokenizer, chat template e indice de pesos |

## Arquitectura y entrenamiento

Cada variante es un directorio Transformers autonomo con dos shards safetensors en BF16, indice de pesos, configuracion de modelo y generacion, ficheros de tokenizer, chat template y el estado guardado del controlador de curriculo de tokens. No son checkpoints completos de optimizador ni de reanudacion FSDP, sino pesos fusionados para inferencia.

El entrenamiento parte del estudiante `BytedTsinghua-SIA/Open-MOPD-SmolLM3-3B-MixSFT` y utiliza tres profesores: `Open-MOPD-SmolLM3-3B-RL-Math`, `Open-MOPD-SmolLM3-3B-RL-Code` y `Open-MOPD-SmolLM3-3B-RL-IF`. Los prompts provienen de `BytedTsinghua-SIA/Open-MOPD-Data`, una mezcla multi-dominio de prompts de RL. Hiperparametros: batch size 1024, minibatch interno 256, learning rate 1.5e-6. La puntuacion del curriculo usa KL inversa top-16 condicional con EMA beta 0.9 y cobertura de tokens por dominio entre 0.2 y 0.8; se seleccionan los tokens con mayor divergencia estudiante-profesor dentro de cada dominio, con pooling global entre ranks de data-parallel antes de cada actualizacion interna. Se conservan la perdida OPD recortada original, el enrutamiento duro de profesores y el refresco de recompensas. La diferencia entre variantes: en pre-mask los presupuestos de perdida por dominio se basan en los pesos de rollout originales; en post-mask las cuotas de tokens se recalculan a partir de los conteos seleccionados por actualizacion interna, manteniendo congeladas las magnitudes medias de recompensa del rollout pre-mask completo. Ambas variantes acumulan 400 actualizaciones del controlador y 100 pasos de entrenamiento.

## Capacidades

- Generacion de texto e instrucciones en ingles (el material disponible no documenta otros idiomas).
- Razonamiento matematico, orientado por el profesor RL-Math y evaluado en AIME24 y AIME25.
- Generacion de codigo, orientada por el profesor RL-Code y evaluada en LiveCodeBench v5 y v6.
- Seguimiento de instrucciones, orientado por el profesor RL-IF y evaluado en IFEval e IFBench.
- Formato conversacional mediante chat template incluido en el directorio de cada variante.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking explicito en la informacion proporcionada.
- No se documentan capacidades multilingues especificas.

## Casos de uso

- Investigacion en destilacion on-policy: servir como referencia reproducible para estudiar como el curriculo de tokens por dominio afecta a un estudiante de 3B con tres profesores especializados, usando los estados del controlador guardados.
- Experimentos academicos de razonamiento matematico: evaluar la variante pre-mask en problemas tipo competicion (AIME) para analizar la transferencia de profesores RL de matematicas a modelos compactos.
- Evaluacion de generacion de codigo: emplear la variante post-mask en experimentos de LiveCodeBench, donde obtuvo mejor pass@1 que la pre-mask en la instantanea publicada (23,4132% frente a 19,1018% en v5).
- Estudio de seguimiento de instrucciones: comparar el efecto del curriculo sobre IFEval e IFBench en un modelo de 3B, con la precision estricta a nivel de prompt como metrica.
- Base para ablaciones metodologicas: modificar la base de reparto (`pre_mask` frente a `post_mask`) y medir el impacto en las tres areas de dominio con un coste de computo reducido.
- Prototipado interno de asistentes tecnicos en entornos de investigacion, siempre que se respeten las licencias upstream y se asuma la ausencia de garantias de calidad.

## Benchmarks y rendimiento

Resultados publicados en la model card (instantanea del 23 de noviembre de 2026). `--` indica resultado no completado en la instantanea, no cero.

| Benchmark | Metrica | Pre-mask | Post-mask |
|---|---|---:|---:|
| AIME24 | mean@64 | 24,4271% | 23,9583% |
| AIME25 | mean@64 | 25,6771% | 24,6875% |
| LiveCodeBench v5 | pass@1, 10 generaciones/problema | 19,1018% | 23,4132% |
| LiveCodeBench v6 | pass@1, 10 generaciones/problema | 20,5143% | -- |
| IFEval | precision estricta a nivel de prompt | 73,0129% | -- |
| IFBench test | precision estricta a nivel de prompt | 25,0000% | -- |
| Macro-media tres dominios | Media de las medias por dominio | 31,2889% | -- |

La evaluacion post-mask esta incompleta (3/6 benchmarks) y no se reporta macro-media completa. Los autores advierten que son resultados de una sola ejecucion y no establecen significancia estadistica ni concordancia exacta con el paper upstream. No se han publicado comparaciones con modelos similares en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 6 GB solo para pesos de un modelo de 3B, mas overhead de activaciones y cache KV; en la practica, se recomienda al menos 8-10 GB para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: en torno a 3-4 GB de pesos; en 4 bits, en torno a 2 GB de pesos. Estas cifras son estimaciones por tamano, no medidas publicadas para este checkpoint.
- GPU recomendadas: A100, H100 o L40S para evaluacion a gran escala; RTX 4090, RTX 3090 o RTX 4080 para inferencia local en BF16 o cuantizada.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en BF16 y en tarjetas con 6 GB o mas en cuantizacion de 4-8 bits, segun estimacion por tamano.
- Opciones de despliegue: transformers (version usada en entrenamiento y evaluacion: 4.57.6) cargando una subcarpeta concreta; no se documenta compatibilidad verificada con vLLM, llama.cpp, Ollama o TGI, y al no publicarse GGUF no hay ruta directa a llama.cpp u Ollama sin conversion propia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kilizi/pop-mopd (pre-mask) | 3B | no disponible | AIME24 24,43%; LCB v5 19,10%; IFEval 73,01% | no disponible | Hugging Face, checkpoints de investigacion |
| kilizi/pop-mopd (post-mask) | 3B | no disponible | AIME24 23,96%; LCB v5 23,41% | no disponible | Hugging Face, evaluacion parcial |
| BytedTsinghua-SIA/Open-MOPD-SmolLM3-3B-MixSFT | 3B | no disponible | no disponible en la informacion proporcionada | no disponible | Hugging Face (modelo base del estudiante) |
| SmolLM3-3B (familia base) | 3B | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Hugging Face |

No se dispone de datos de benchmarks de los modelos de referencia en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de SmolLM3 y de profesores RL, puede heredar sesgos de sus datos de entrenamiento y de los prompts de Open-MOPD-Data.
- Riesgo de alucinacion: los autores advierten explicitamente de que los modelos pueden producir contenido incorrecto o inseguro.
- Limitaciones de contexto e idioma: no se documenta la longitud de contexto efectiva ni los idiomas soportados; el material disponible sugiere uso principal en ingles.
- Restricciones de licencia: la model card no concede licencia nueva; el uso queda sujeto a las licencias aplicables del modelo base, los profesores y el dataset. No se especifica si permite uso comercial.
- Estado de investigacion: son checkpoints de un unico entrenamiento de 100 pasos, sin validacion estadistica; la variante post-mask tiene evaluacion incompleta (3/6 benchmarks).
- Proceso de publicacion: los ficheros se exportaron de directorios de evaluacion fusionados y se verificaron cabeceras safetensors, mapeo tensor-shard, longitudes de payload, configuracion y tokenizer, pero no se ejecuto una nueva prueba de inferencia en GPU ni una nueva evaluacion de benchmarks tras la subida.
- Estado del controlador: en la variante pre-mask, la configuracion guardada es anterior al campo `share_basis`; su ausencia implica `pre_mask`. Ambas variantes registran 400 actualizaciones del controlador.
- Carga: es obligatorio seleccionar una subcarpeta (`pre-mask-step-100` o `post-mask-step-100`); la raiz del repositorio no contiene un modelo y fallara si se carga directamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kilizi/pop-mopd
- Repositorio de implementacion MOPD-POP: https://github.com/biaoliu-kiritsugu/MOPD-POP
- Modelo base del estudiante: https://huggingface.co/BytedTsinghua-SIA/Open-MOPD-SmolLM3-3B-MixSFT
- Profesor de matematicas: https://huggingface.co/BytedTsinghua-SIA/Open-MOPD-SmolLM3-3B-RL-Math
- Profesor de codigo: https://huggingface.co/BytedTsinghua-SIA/Open-MOPD-SmolLM3-3B-RL-Code
- Profesor de instruction-following: https://huggingface.co/BytedTsinghua-SIA/Open-MOPD-SmolLM3-3B-RL-IF
- Dataset de prompts: https://huggingface.co/datasets/BytedTsinghua-SIA/Open-MOPD-Data
- Resultados experimentales detallados: https://huggingface.co/kilizi/pop-mopd/blob/main/experiment_results.md
