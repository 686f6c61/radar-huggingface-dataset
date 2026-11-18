# jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-multilingual-seed1

## Resumen

El modelo `jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-multilingual-seed1` es un ajuste fino por continuación de preentrenamiento (continued pre-training, CPT) del modelo base `HuggingFaceTB/SmolLM2-135M-Instruct`, desarrollado por el usuario jekunz con fines de investigación. Su objetivo es adaptar un modelo pequeno multilingue al feroes (codigo ISO `fo`), un idioma de bajos recursos, mediante una estrategia de transferencia: primero se entrena conjuntamente sobre las porciones danesa, islandesa, noruego bokmal, noruego nynorsk y sueca de FineWeb-2, y despues se especializa sobre la porcion feroesa del mismo corpus.

El modelo conserva la arquitectura transformer decoder-only de SmolLM2, con 134.515.008 parametros totales y un contexto maximo de entrenamiento de 2048 tokens. Se distribuye en formato safetensors bajo licencia Apache 2.0, lo que permite uso comercial y modificacion sin restricciones adicionales. El repositorio ocupa aproximadamente 0.3 GB.

Su relevancia radica en dos factores: por un lado, demuestra una receta de transferencia entre lenguas nordicas para mejorar el rendimiento en un idioma de bajos recursos partiendo de un modelo pequeno; por otro, su tamano reducido lo hace desplegable en hardware muy modesto. No obstante, el autor indica explicitamente que el modelo no ha sido evaluado de forma amplia y que su proposito es la investigacion, por lo que no debe asumirse calidad de produccion sin validacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, SmolLM2) |
| Parametros totales | 134.515.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (contexto maximo de entrenamiento) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors; no se publican GGUF ni otros formatos cuantizados) |
| Idiomas soportados | Feroes (`fo`); el modelo base soporta adicionalmente otros idiomas, pero no se documenta su preservacion tras el ajuste |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de SmolLM2-135M-Instruct, un transformer decoder-only de la familia Llama con 134,5 millones de parametros. El ajuste consiste en un continued pre-training en dos fases sobre el corpus FineWeb-2: primero una epoca sobre los subconjuntos de danes, islandes, noruego bokmal, noruego nynorsk y sueco combinados, y despues cinco epocas sobre el subconjunto de feroes. Esta secuencia busca aprovechar el parentesco entre lenguas nordicas para mejorar la transferencia hacia el feroes antes de la especializacion final.

Los hiperparametros documentados son: learning rate de 5e-4 con scheduler coseno, warmup ratio de 0.05, batch size de 8 con 32 pasos de acumulacion de gradientes (batch efectivo de 256), contexto maximo de 2048 tokens y semilla 1 (el modelo es una de tres ejecuciones con la misma configuracion). El entrenamiento se realizo en una unica GPU A100 de 40 GB. No se documenta el numero total de tokens procesados, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO posteriores al CPT.

## Capacidades

- Generacion de texto conversacional en feroes, heredada de la base instruct y adaptada mediante CPT.
- Generacion de texto general (la model card no detalla capacidades especificas adicionales).
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: el modelo declara unicamente `fo`; el comportamiento en otros idiomas del modelo base no esta documentado.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- No se documenta ninguna capacidad adicional especifica del ajuste mas alla de la adaptacion linguistica al feroes.

## Casos de uso

- Investigacion en adaptacion de modelos pequenos a lenguas de bajos recursos: el modelo sirve como punto de partida reproducible (semilla 1 de 3) para estudiar estrategias de transferencia entre lenguas nordicas y medir el efecto del CPT en feroes frente al modelo base.
- Generacion de texto en feroes para prototipos: al ser un modelo de 135M parametros, permite iterar rapidamente en tareas de generacion de texto feroes sin infraestructura dedicada, siempre que se valide la calidad de salida.
- Experimentos de destilacion o comparacion de recetas: su reducido tamano y su licencia Apache 2.0 lo hacen util como linea base en estudios que comparen modelos multilingues pequenos ajustados a un idioma concreto.
- Procesamiento de corpus feroeses: puede emplearse para tareas auxiliares como normalizacion, parafraseo o generacion de datos sinteticos en feroes, sujeto a revision humana por el riesgo de alucinacion.
- Despliegue en entornos con recursos limitados: con 134,5M parametros y pesos safetensors de 0.3 GB, es viable en CPU o en GPUs de gama baja para experimentos de inferencia, aunque no se documentan latencias ni throughput.
- Educacion y demostraciones: util para ilustrar en docencia o charlas el flujo completo de CPT sobre un modelo instruct pequeno con un corpus real (FineWeb-2) y una GPU unica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo "has not been evaluated more broadly yet".

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 134,5M parametros, los pesos en fp32 ocupan aproximadamente 0,54 GB y en fp16/bf16 alrededor de 0,27 GB, a lo que hay que sumar el coste de activaciones y cache KV para 2048 tokens.
- GPU recomendadas: el entrenamiento se realizo en una A100 de 40 GB; para inferencia basta con hardware muy inferior, aunque no se documentan requisitos oficiales.
- Compatibilidad con GPU de consumo: por tamano, el modelo es apto para GPUs de consumo, pero no se ha publicado ninguna validacion al respecto.
- Opciones de despliegue: el repo esta etiquetado con `transformers` y `text-generation-inference` y es compatible con endpoints; no se publican pesos GGUF, por lo que llama.cpp u Ollama requeririan conversion previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-multilingual-seed1 | 134.515.008 | 2048 | fo | Apache 2.0 | CPT sobre FineWeb-2; sin evaluacion publica |
| HuggingFaceTB/SmolLM2-135M-Instruct (modelo base) | 135M (aprox.) | no disponible en esta ficha | multilingue (no detallado) | Apache 2.0 | Base del ajuste; sin especializacion en feroes |
| Otras semillas de la misma configuracion (seed 2, seed 3) | 134.515.008 | 2048 | fo | Apache 2.0 | Variantes del mismo autor; no se detallan resultados comparativos |

No se dispone de datos de rendimiento comparado con estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El autor declara que el modelo es para su investigacion y que no ha sido evaluado de forma amplia; no hay garantias de calidad en produccion.
- Riesgo de alucinacion inherente a un modelo de 135M parametros, potencialmente agravado por el ajuste sobre un corpus web (FineWeb-2) sin etapas documentadas de alineacion adicional.
- Sesgos potenciales procedentes de FineWeb-2 y del modelo base; no se documenta ninguna mitigacion.
- El unico idioma declarado es el feroes; el comportamiento en otros idiomas no esta documentado y podria haberse degradado tras el CPT.
- Contexto limitado a 2048 tokens, insuficiente para tareas que requieran documentos largos.
- Licencia Apache 2.0: permite uso comercial, pero al no existir evaluacion publica, el uso en produccion requiere validacion propia.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ) ni resultados de benchmarks, lo que dificulta la comparacion objetiva con alternativas.
- El modelo es una de tres semillas de la misma configuracion; los resultados pueden variar entre semillas y no se documenta esa variabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-multilingual-seed1
- Modelo base SmolLM2-135M-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
