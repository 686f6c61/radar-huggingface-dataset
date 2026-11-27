# skyzer4ever/GigaChat4-708B-A41B-GGUF

## Resumen

GigaChat4-708B-A41B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por SberDevices / ai-sage, con 710 mil millones de parametros totales y 41 mil millones de parametros activos por token. Este repositorio concreto, publicado por el usuario skyzer4ever, contiene cuantizaciones GGUF no oficiales de muy baja precision (IQ2 e IQ1_M) del modelo original, pensadas para ejecutar el modelo en una sola maquina con entre 192 y 256 GB de memoria, algo imposible con las cuantizaciones oficiales que arrancan en Q4_K_M (429 GB).

El modelo base esta disenado para generacion de texto en ruso e ingles, e incorpora innovaciones arquitectonicas como atencion MLA (Multi-head Latent Attention), un indexador DSA, proyecciones GatedDeltaNet y una capa MTP (Multi-Token Prediction). La relevancia de este repositorio radica en que permite probar un modelo de escala frontier en hardware de gama alta de escritorio o estaciones de trabajo con memoria unificada, a costa de una perdida notable de calidad respecto al original.

Es importante senalar que estas cuantizaciones requieren una version de llama.cpp con soporte para GigaChat4 (PR #32767), que no esta incluida en las releases estables. Los pesos se distribuyen bajo licencia MIT, la misma que el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer con MLA, indexador DSA y GatedDeltaNet |
| Parametros totales | 710 mil millones (708B segun el nombre; 524.941.821 segun safetensors del repo) |
| Parametros activos | 41 mil millones |
| Longitud de contexto | no disponible (el ejemplo de ejecucion usa `-c 16384`) |
| Tipos de cuantizacion | IQ2_XXS-mix (2.20 bpw), IQ1_M-IQ2_XXS-mix (2.05 bpw), Q8_0 de referencia (8.51 bpw) |
| Idiomas soportados | Ruso (ru), ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (dividido en shards de menos de 50 GB con `llama-gguf-split`) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 710B parametros totales y 41B activos. Incorpora atencion MLA (Multi-head Latent Attention), un indexador DSA, proyecciones GatedDeltaNet, expertos compartidos, tres capas FFN densas y una capa MTP (Multi-Token Prediction) identificada como `blk.64`. La model card del repositorio de cuantizacion no detalla la composicion del dataset de entrenamiento ni si hubo fases de RLHF o DPO; esa informacion no esta disponible en los datos proporcionados.

El proceso de cuantizacion de este repositorio parte del GGUF oficial Q8_0 y aplica `--allow-requantize` con una importance matrix calculada sobre ese mismo Q8_0, usando 16 x 2048 tokens de texto mixto en ingles (bartowski calibration_datav3) y texto de Wikipedia en ruso. En las variantes mixtas, los expertos enrutados se cuantizan a IQ2_XXS o IQ1_M, mientras que la atencion (MLA + indexador DSA), las proyecciones GatedDeltaNet, los expertos compartidos, las tres capas FFN densas, los embeddings y la cabeza de salida se mantienen en Q6_K o Q8_0. La capa MTP se cuantiza a Q3_K. El fichero `imatrix.gguf` se incluye en el repositorio.

## Capacidades

- Generacion de texto en ruso e ingles, los dos idiomas declarados en la model card.
- Razonamiento y generacion de codigo: no se documentan capacidades especificas en la informacion disponible, aunque el modelo base es de proposito general.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues limitadas a ruso e ingles segun los metadatos.
- Capa MTP (Multi-Token Prediction) presente en la arquitectura del modelo base, orientada a decodificacion especulativa.
- Prueba de humo (smoke test) superada en modo greedy tanto en ingles como en ruso para ambas variantes y para el Q8_0 de referencia.

## Casos de uso

- Evaluacion de modelos a gran escala en estaciones de trabajo: permite probar un MoE de 710B parametros en una maquina con 192-256 GB de memoria, algo inviable con las cuantizaciones oficiales de 429 GB o mas. Adecuado para laboratorios que quieran estudiar el comportamiento del modelo sin acceso a clusters multi-GPU.
- Investigacion sobre cuantizacion extrema: las variantes IQ1_M e IQ2_XXS con importance matrix permiten medir la degradacion de perplejidad frente al Q8_0 de referencia (de 1.8769 a 3.626 en wiki2, por ejemplo), util para estudiar tecnicas de compresion.
- Procesamiento de texto en ruso: el modelo declara soporte nativo de ruso y la model card reporta perplejidad especifica en ru-wiki, lo que lo hace util para tareas de generacion y analisis en ese idioma.
- Despliegue en Apple Silicon de gama alta: la variante de 182 GB cabe en principio en un Mac con 256 GB de memoria unificada, aunque requiere ajustar `iogpu.wired_limit_mb` y no ha sido probada segun el autor.
- Experimentacion con llama.cpp: sirve como banco de pruebas para la implementacion de GigaChat4 en llama.cpp (PR #32767), incluyendo atencion MLA, DSA y GatedDeltaNet.
- Servicio local de generacion de texto: mediante `llama-server` con plantilla Jinja (`--jinja`) y contexto de 16K, para prototipos de inferencia en ingles y ruso.
- Analisis comparativo de perplejidad: los valores publicados (wiki2 y ru-wiki, 10 chunks de 512 tokens) permiten comparar variantes de cuantizacion bajo el mismo texto de calibracion.

## Benchmarks y rendimiento

La model card solo publica perplejidad, no benchmarks estandar como MMLU, HumanEval o GSM8K.

| Variante | bpw | Tamano | PPL wiki2 (10x512) | PPL ru-wiki (10x512) |
|---|---|---|---|---|
| IQ2_XXS-mix | 2.20 | 195.4 GB (182 GiB) | 3.626 ± 0.164 | 3.308 ± 0.141 |
| IQ1_M-IQ2_XXS-mix | 2.05 | 182.2 GB (170 GiB) | 4.456 ± 0.215 | 3.791 ± 0.172 |
| Q8_0 (oficial, referencia) | 8.51 | 755.2 GB (703 GiB) | 1.8769 ± 0.06671 | 2.4416 ± 0.09504 |

El autor advierte que las mediciones son cortas (10 chunks de 512 tokens) y que el margen de error es amplio, y que no son comparables con cifras de perplejidad de otros modelos.

## Requisitos de hardware

- VRAM/memoria estimada: 195.4 GB para IQ2_XXS-mix y 182.2 GB para IQ1_M-IQ2_XXS-mix, mas el espacio necesario para la cache KV.
- GPU recomendadas: no se especifican modelos concretos; el autor apunta a maquinas con 192-256 GB de memoria. No se mencionan A100, H100 ni RTX 4090.
- Cabe en consumer GPU: no, ningun modelo consumer actual dispone de esa cantidad de VRAM. Si cabe en principio en un Apple Silicon con 256 GB de memoria unificada (no probado), con la salvedad del limite de memoria cableada a GPU (~75% de la RAM, ~192 GB) que puede requerir ajustar `iogpu.wired_limit_mb`.
- Opciones de despliegue: llama.cpp con soporte para GigaChat4 (PR #32767, probado en el commit `0541e50e2`). Las releases estables de llama.cpp no cargaran estos ficheros hasta que el PR se fusione. Ejemplo: `llama-server -m <primer-shard>.gguf --jinja -c 16384 -ngl 99`.
- Si no hay memoria suficiente, llama.cpp recurre a mmap desde disco, lo que funciona pero es lento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato / tamano | Licencia | Notas |
|---|---|---|---|---|---|---|
| GigaChat4-708B-A41B (este repo, IQ2) | 710B | 41B | no disponible | GGUF, 182-195 GB | MIT | Cuantizacion no oficial, requiere PR de llama.cpp |
| GigaChat4-708B-A41B (Q8_0 oficial) | 710B | 41B | no disponible | GGUF, 755.2 GB | MIT | Referencia de calidad, requiere mucha mas memoria |
| GigaChat4-708B-A41B (Q4_K_M oficial) | 710B | 41B | no disponible | GGUF, 429 GB | MIT | Cuantizacion oficial mas baja disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento con modelos de otras familias de tamano similar.

## Limitaciones y advertencias

- Las cuantizaciones IQ1_M e IQ2_XXS degradan notablemente la calidad: la perplejidad en wiki2 pasa de 1.8769 (Q8_0) a 3.626 (IQ2_XXS-mix) y a 4.456 (IQ1_M-IQ2_XXS-mix).
- Requiere una build no estable de llama.cpp (PR #32767); las releases oficiales no cargaran los ficheros.
- Solo soporta ruso e ingles; no hay evidencia de calidad en otros idiomas.
- No se han publicado datos sobre sesgos, riesgo de alucinacion ni evaluaciones de seguridad en la informacion disponible.
- El limite de memoria cableada a GPU en macOS (~75% de la RAM) puede impedir cargar la variante de 182 GB sin ajustar parametros del sistema, con riesgo asociado.
- Si la memoria es insuficiente, el fallback a mmap desde disco degrada gravemente el rendimiento.
- La capa MTP (`blk.64`) se cuantiza a Q3_K y no fue ejercitada durante la recoleccion de la importance matrix, lo que puede afectar a su fidelidad.
- Las cifras de perplejidad son de ejecuciones cortas y no comparables con las de otros modelos.
- Licencia MIT: permite uso comercial, pero el repositorio solo contiene pesos cuantizados; conviene revisar tambien las condiciones del modelo base ai-sage/GigaChat4-708B-A41B.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/skyzer4ever/GigaChat4-708B-A41B-GGUF
- Modelo base: https://huggingface.co/ai-sage/GigaChat4-708B-A41B
- PR de llama.cpp con soporte para GigaChat4: https://github.com/ggml-org/llama.cpp/pull/32767
