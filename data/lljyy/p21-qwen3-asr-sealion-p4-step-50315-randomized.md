# LLJYY/p21-qwen3-asr-sealion-p4-step-50315-randomized

## Resumen

Este repositorio aloja un checkpoint de inferencia y evaluacion del proyecto P21, concretamente la instantanea del paso 50.315 de la continuacion aleatorizada P4 sobre un modelo multimodal de audio y texto. No es una version publicada ni un modelo autonimo: se trata de un artefacto privado, experimental y sin autorizacion de promocion, compuesto por tres piezas entrenadas en BF16 (una torre de audio Qwen3-ASR, un proyector de 1024 a 4096 a 5120 y un estado Deep-rsLoRA de 496 modulos) que se montan sobre un decodificador SEA-LION congelado que no se incluye en el repositorio.

El problema que resuelve es de infraestructura de entrenamiento: preserva el estado exacto que sirve como padre de una continuacion mas larga del ciclo P4, junto con los hashes SHA-256 y las comprobaciones de recarga estricta en proceso limpio que permiten reproducir la composicion. El autor indica explicitamente que su benchmark interno de 1.024 actualizaciones fue demasiado pequeno para justificar una promocion y que mostro resultados mas debiles en tamil y en las seis lenguas del sudeste asiatico evaluadas que el padre post-SEA aceptado.

La relevancia actual es limitada y muy especifica: sirve a quien necesite auditar, reproducir o continuar este linaje de entrenamiento concreto, no a quien busque un modelo listo para produccion. El repositorio ocupa 3,6 GB, no acumula descargas ni interacciones, y la propia model card prohibe hacerlo publico o cargarlo como `AutoModel` estandar de Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Composicion multimodal: torre de audio Qwen3-ASR + proyector 1024→4096→5120 + decodificador SEA-LION congelado con Deep-rsLoRA (496 modulos) |
| Parametros totales | no disponible (el repositorio solo incluye el recuento de parametros en `MANIFEST.sha256` y `provenance.json`, no reproducido en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Componentes entrenados en BF16; no se ofrecen versiones cuantizadas (GGUF, AWQ, GPTQ, etc.) |
| Idiomas soportados | no disponible (la evaluacion menciona tamil y seis lenguas del sudeste asiatico, sin listado completo) |
| Licencia | other (sin texto de licencia detallado en la informacion disponible) |
| Formato de pesos | safetensors (tres ficheros: `audio_tower.safetensors`, `target_projector.safetensors`, `decoder_deep_lora.safetensors`) |
| Tamano del repositorio | 3,6 GB |
| Run | `p21_p4_post_sea_randomized_canary_20260911_01` |
| Generacion | `step_050315_1789130103064776203` |
| Paso P4 / global | 50.315 / 70.330 |
| Generacion padre | `step_049291_1789014139367389200` |
| SHA-256 del estado padre | `9c5ac1acf5a9d59242a7de45df10f260597433d0f22d55ce61c634cc64aa0b31` |
| SHA-256 del estado del checkpoint | `27d54452f2f9cc62755050e7463d02a38ef0efc74c388f4b58dfa7de94eaf446` |
| Recarga estricta en proceso limpio | `PASS_P21_P4_POST_SEA_RANDOMIZED_CANARY_STRICT_RELOAD` |
| Dependencias externas | Decodificador congelado, tokenizer, activos de vision nativa y procesador de audio, fijados en `checkpoint_config.json` |
| Estado excluido | Estado de optimizador y RNG (14,24 GB), filas y medios del corpus, oro y predicciones del evaluador, rutas privadas y estado de servicio |

## Arquitectura y entrenamiento

La composicion prevista en tiempo de ejecucion es una cadena de cuatro etapas: el procesador de audio de Qwen3-ASR fijado, la torre de audio entrenada, un proyector entrenado de 1024→4096→5120 y un decodificador Qwen-SEA-LION congelado con vision nativa, sobre el que se instala un estado Deep-rsLoRA entrenado de 496 modulos. Solo las tres primeras piezas (torre, proyector y LoRA) forman parte del repositorio; el decodificador, el tokenizer y el procesador de audio son dependencias externas ancladas por version en `checkpoint_config.json`. Se trata, por tanto, de un esquema de adaptacion eficiente de parametros (rsLoRA) sobre un modelo base totalmente congelado, mas un modulo de conexion cross-modal entrenado desde cero.

Respecto a los datos de entrenamiento, la model card no especifica el numero de tokens, la composicion del corpus ni si hubo etapas de RLHF o DPO; esos datos quedan fuera del repositorio junto con las filas y medios del corpus. La unica informacion cuantitativa de entrenamiento es la posicion en el ciclo: 50.315 pasos de un total de 70.330, con una generacion padre identificada por hash. La model card senala que la decision de conservar esta instantanea como padre de la continuacion aleatorizada P4 se tomo tras una autorizacion explicita para obtener una senal de entrenamiento mayor, y que la evaluacion asociada (1.024 actualizaciones) resulto insuficiente para promover el modelo.

## Capacidades

- Conversion de audio a texto multimodal: el pipeline declarado es `audio-text-to-text`, es decir, entrada de audio con salida de texto.
- Procesamiento conjunto de audio y vision nativa: el decodificador congelado aporta un stack de vision nativa, aunque no se detalla su alcance funcional.
- Reconocimiento de voz multilingue orientado al sudeste asiatico: la evaluacion interna cubre seis lenguas SEA y tamil, esta ultima con resultados mas debiles que el padre aceptado.
- Adaptacion de parametros eficiente: el estado Deep-rsLoRA de 496 modulos modifica el decodificador congelado sin reentrenarlo por completo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.
- Cualquier otra capacidad especial: no disponible en la informacion proporcionada. La model card no documenta capacidades mas alla de la composicion y el pipeline declarados.

## Casos de uso

- Reproduccion del linaje de entrenamiento: un equipo de investigacion puede reconstruir el estado del paso 50.315 cargando los tres safetensors con el runner y evaluador P21 y verificando los hashes SHA-256 indicados, lo que permite auditar exactamente que se entreno y con que resultado.
- Continuacion del ciclo P4: el artefacto existe precisamente como padre de una continuacion aleatorizada mas larga, de modo que sirve como punto de partida verificable para nuevos tramos de entrenamiento con una senal de datos mayor.
- Auditoria de integridad de artefactos: la comprobacion `PASS_P21_P4_POST_SEA_RANDOMIZED_CANARY_STRICT_RELOAD` permite validar que un proceso limpio carga el conjunto completo sin corrupcion, algo util en pipelines de verificacion previa a entrenamientos costosos.
- Estudio de proyectores cross-modal: el proyector 1024→4096→5120 es una pieza entrenada y aislada, util para analizar como se alinean representaciones de audio de 1024 dimensiones con el espacio del decodificador.
- Investigacion sobre adaptacion con decodificador congelado: con 496 modulos Deep-rsLoRA sobre un modelo base completamente congelado, es un caso de estudio para medir cuanto rendimiento se obtiene sin tocar los pesos del decodificador.
- Analisis comparativo de checkpoints: la model card aporta la comparacion cualitativa frente al padre aceptado post-SEA (peor en tamil y en seis lenguas SEA), lo que permite estudiar la degradacion asociada a una continuacion aleatorizada corta.
- Validacion de evaluadores internos: al indicarse que el benchmark de 1.024 actualizaciones fue insuficiente, el checkpoint sirve como referencia para calibrar el tamano minimo de evaluacion necesario antes de promover un modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card unicamente describe de forma cualitativa un benchmark interno de 1.024 actualizaciones que "era demasiado pequeno para soportar una decision de promocion" y que mostro resultados mas debiles en tamil y en las seis lenguas del sudeste asiatico evaluadas que el padre aceptado post-SEA. No se proporcionan cifras de MMLU, HumanEval, GSM8K, WER ni de ninguna otra metrica.

| Benchmark | Resultado | Nota |
|---|---|---|
| Benchmark interno de 1.024 actualizaciones | no disponible (solo descripcion cualitativa) | Insuficiente para promocion; peor en tamil y seis lenguas SEA que el padre aceptado post-SEA |
| Estandares publicos (MMLU, HumanEval, GSM8K, WER, etc.) | no disponible | No publicados en la informacion proporcionada |

## Requisitos de hardware

- VRAM para los componentes incluidos: aproximadamente 3,6 GB en BF16, correspondientes a la torre de audio, el proyector y el estado Deep-rsLoRA.
- VRAM total en inferencia: no disponible, porque el decodificador SEA-LION congelado y el stack de vision nativa no forman parte del repositorio y su tamano no se especifica.
- GPU recomendadas: no disponible. Al no conocerse el tamano del decodificador congelado, no puede determinarse una recomendacion fiable.
- Encaje en GPU de consumo: los 3,6 GB de componentes entrenados caben sin problema en cualquier GPU de consumo moderna, pero el requisito real depende del decodificador externo, cuyo tamano se desconoce.
- Estado de optimizador: 14,24 GB excluidos del repositorio, por lo que este checkpoint no permite reanudar el entrenamiento por si solo sin recuperar dicho estado por otra via.
- Opciones de despliegue: no hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni `AutoModel` estandar de Transformers. La model card indica que debe usarse el runner y evaluador P21 del proyecto para construir la arquitectura, instalar los modulos Deep-LoRA y hacer la carga estricta.
- Latencia y throughput: no disponible.
- Carga en 8 bits o 4 bits: no disponible; no se ofrecen pesos cuantizados.

## Comparativa con modelos similares

No hay alternativas comparables identificables en la informacion proporcionada. Este artefacto no es un modelo autonomo sino una instantanea de checkpoint con dependencias externas, por lo que la comparacion directa con modelos publicados no es posible sin conocer el decodificador base y el resto de la composicion. La unica comparacion documentada es interna, contra su propio padre de entrenamiento.

| Elemento | Paso | Resultado cualitativo | Estado |
|---|---|---|---|
| Este checkpoint (`step_050315`) | 50.315 / 70.330 | Peor en tamil y seis lenguas SEA que el padre post-SEA aceptado; benchmark de 1.024 actualizaciones insuficiente | Privado, experimental, sin autorizacion de promocion |
| Padre (`step_049291`) | 49.291 | Referencia aceptada post-SEA | Estado de promocion registrado por el checkpoint de origen, no detallado aqui |
| Modelos publicos de ASR multimodal | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es una version promovida: la model card indica explicitamente que es privada, experimental y que no esta autorizada para promocion.
- Rendimiento inferior al padre en tamil y en las seis lenguas del sudeste asiatico evaluadas, segun la comparacion interna.
- Evidencia de evaluacion insuficiente: el benchmark de 1.024 actualizaciones no permite tomar decisiones de promocion.
- No es un repositorio `AutoModel` de Transformers: cargar los safetensors correctamente solo demuestra integridad de ficheros, no comportamiento extremo a extremo del modelo.
- Dependencias externas obligatorias: el decodificador congelado, el tokenizer, los activos de vision nativa y el procesador de audio no se incluyen y deben fijarse segun `checkpoint_config.json`.
- Sin datos publicados de sesgos, alucinacion, contexto maximo ni cobertura idiomatica completa.
- Licencia `other` sin texto disponible: no puede confirmarse si se permite uso comercial, redistribucion o modificacion.
- Restriccion explicita de publicacion: la model card prohibe hacer el repositorio publico o publico con acceso restringido sin una revision de derechos y una autorizacion separadas.
- Advertencia de seguridad: no cargar estados de optimizador con formato pickle de fuentes no confiables; en este repositorio no se incluye ningun optimizador.
- Fecha de creacion y actualizacion poco habitual (2026-09-11), coherente con un linaje de entrenamiento planificado a largo plazo.
- Estado de servicio, rutas privadas, corpus y predicciones del evaluador excluidos deliberadamente, lo que impide una reproduccion completa de la evaluacion solo con este repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LLJYY/p21-qwen3-asr-sealion-p4-step-50315-randomized
- Ficheros de trazabilidad citados en la model card: `provenance.json`, `MANIFEST.sha256`, `checkpoint_config.json` (incluidos en el repositorio, sin URL publica independiente)
- Papers, blogs, repositorios o demos adicionales: no disponible. La busqueda web realizada no devolvio resultados relacionados con el modelo; los unicos resultados obtenidos eran paginas de descarga del navegador Google Chrome, sin ninguna relacion con este artefacto.
