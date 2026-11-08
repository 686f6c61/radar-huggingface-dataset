# mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-gd-resist-fft-weight-distance

## Resumen

`mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-gd-resist-fft-weight-distance` es un checkpoint de 7.241.732.096 parametros derivado de la familia Mistral, publicado por el usuario `mremila` en Hugging Face. No es un modelo de proposito general pensado para produccion, sino un artefacto de investigacion generado dentro de una campana de experimentos de *machine unlearning* sobre un modelo base (`artifacts/tamia/models/z7b-wmdp-bio--unlearn-fft-gd`) y entrenado con el framework Axolotl 0.18.0 mediante un trainer personalizado (`trainers.weight_distance.WeightDistanceTrainer`).

La particularidad tecnica del checkpoint es que el ajuste fino se realiza con una penalizacion explicita de distancia de pesos respecto a un modelo de referencia (`HuggingFaceH4/zephyr-7b-beta`) con coeficiente 300000.0. El objetivo declarado por la nomenclatura del repositorio es la *resistencia a la manipulacion* (tamper resistance): dificultar que un tercero recupere mediante reentrenamiento la informacion supuestamente eliminada en la fase de unlearning. El dataset de entrenamiento es exclusivamente `Salesforce/wikitext` (wikitext-2-raw-v1, split test).

El modelo se publica como archivo de archivo historico (prefijo `archive-20261103`) y no incluye model card sustantiva: el README es la plantilla autogenerada por el Trainer de Axolotl y no aporta descripcion, usos previstos, limitaciones ni resultados de evaluacion. Con 0 descargas y 0 likes en el momento de la consulta, debe tratarse como un artefacto reproducible de un pipeline de experimentacion, no como un modelo listo para uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Mistral; `MistralDecoderLayer` en el auto-wrap de FSDP) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el entrenamiento uso `sequence_len: 512` |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 14.5 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de tipo Mistral, tal como se deduce de la clase de capa usada en el auto-wrap de FSDP (`MistralDecoderLayer`) y de la etiqueta `mistral` del repositorio. El modelo parte de un checkpoint intermedio (`artifacts/tamia/models/z7b-wmdp-bio--unlearn-fft-gd`) que, por su nombre, corresponde a una fase previa de *unlearning* con ajuste fino completo (FFT) y descenso de gradiente (GD) sobre un modelo de 7B. Sobre esa base se aplica un segundo ajuste fino con un trainer de distancia de pesos.

El entrenamiento se ejecuto con Axolotl 0.18.0 en configuracion multi-GPU (4 dispositivos), FSDP v2 con activation checkpointing y `reshard_after_forward`, precision BF16 y TF32, optimizador AdamW (`betas=(0.9, 0.999)`, `eps=1e-08`), learning rate 1e-5 con scheduler lineal sin warmup, `weight_decay` 0.0, `max_grad_norm` 1.0, batch micro de 1 con acumulacion de 4 (batch total 16), 125 pasos y semilla 42. La innovacion destacable es la funcion de perdida: `WeightDistanceTrainer` con `coefficient_weight_dist: 300000.0` y `reference_model_name_or_path: HuggingFaceH4/zephyr-7b-beta`, es decir, una penalizacion L-p distancia que empuja los pesos del modelo a mantenerse proximos a los de Zephyr-7B-beta mientras se ajusta sobre wikitext-2. No se reporta RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de texto autoregresiva en ingles (el unico corpus de entrenamiento documentado es wikitext-2-raw-v1, en ingles), con calidad no evaluada.
- Razonamiento y conocimiento general heredados del modelo base Mistral/Zephyr, sin verificacion independiente en este checkpoint.
- No hay evidencia de soporte de tool calling ni function calling en la informacion disponible.
- No hay evidencia de soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingues: no disponibles; el entrenamiento documentado es monolingue en ingles.
- No se documenta modo thinking, vision ni audio.
- Uso previsto real: servir como punto de partida o referencia en experimentos de unlearning y de resistencia a la reversion de pesos.

## Casos de uso

- Investigacion en machine unlearning: el checkpoint sirve como estado intermedio reproducible para medir cuanto conocimiento de wikitext-2 persiste tras la penalizacion de distancia de pesos frente a Zephyr-7B-beta.
- Evaluacion de tamper resistance: permite entrenar un atacante de reajuste fino sobre este modelo y cuantificar si la penalizacion con coeficiente 300000.0 dificulta la recuperacion del comportamiento original, comparando con la rama sin resistencia.
- Reproduccion de pipelines Axolotl: la configuracion YAML completa (FSDP v2, `WeightDistanceTrainer`, wikitext-2) permite replicar el experimento en un cluster de 4 GPU y validar la estabilidad del entrenamiento a 125 pasos.
- Estudio de deriva de pesos: al fijar una referencia explicita (`HuggingFaceH4/zephyr-7b-beta`), el modelo es util para medir distancias entre checkpoints y correlacionarlas con metricas de perplexity en wikitext-2.
- Base para ablaciones de hiperparametros: el nombre del repositorio indica una busqueda HPO (`grid--002`), por lo que sirve como una de las celdas de una rejilla de experimentos sobre coeficiente de distancia y learning rate.
- Analisis de contaminacion y fuga de datos: util para estudiar si el ajuste fino sobre el split de test de wikitext-2 introduce senales medibles de memorizacion, un problema clasico en benchmarks de unlearning.

## Benchmarks y rendimiento

La model-index del autor declara una unica entrada (`...--grid--002`) con la lista `results` vacia. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 14.5 GB solo de pesos, mas overhead de activaciones y cache KV; en la practica, 16-18 GB para contexto corto.
- VRAM estimada en cuantizacion de 8 bits: en torno a 8 GB; en 4 bits, en torno a 4-5 GB (estimaciones por tamano, no verificadas para este checkpoint).
- GPU recomendadas para BF16: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB, suficiente para inferencia a contexto moderado).
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en BF16 y en RTX 3090/4080 (16-24 GB) con cuantizacion; en GPUs de 8 GB solo con cuantizacion agresiva a 4 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`); vLLM, llama.cpp u Ollama no estan documentados para este checkpoint y requeririan conversion a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (`z7b-wmdp-bio-...-weight-distance`) | 7.241.732.096 | no disponible | no disponible | Hugging Face, 0 descargas | Artefacto de investigacion con perdida de distancia de pesos |
| `HuggingFaceH4/zephyr-7b-beta` | ~7.24B | 32k (declarado por el autor original) | MIT | Ampliamente disponible | Modelo de referencia usado en la perdida; ajustado con DPO |
| `mistralai/Mistral-7B-v0.1` | ~7.24B | 8k | Apache 2.0 | Ampliamente disponible | Base de la familia; sin ajuste conversacional |
| `mremila/z7b-wmdp-bio-5pp-unlearn-fft-me-tar-k16` | no disponible | no disponible | no disponible | Hugging Face | Variante del mismo autor en la campana de unlearning |

## Limitaciones y advertencias

- Ausencia total de model card sustantiva: no hay descripcion, usos previstos, limitaciones ni evaluacion; el README es la plantilla autogenerada de Axolotl.
- Licencia no disponible: no puede asumirse uso comercial; la licencia del modelo base Mistral/Zephyr no se hereda automaticamente sin verificacion legal.
- Riesgo de alucinacion no medido: no se ha evaluado la calidad generativa tras el ajuste sobre wikitext-2, un corpus enciclopedico que puede degradar el comportamiento conversacional.
- Sesgos desconocidos: no se documenta composicion del dataset ni filtrado; wikitext-2 proviene de Wikipedia y arrastra sus sesgos de cobertura y sesgo de genero.
- Limitacion idiomatica: el entrenamiento documentado es solo en ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior al del modelo base.
- Contexto de entrenamiento corto (512 tokens) frente a los 32k declarados por Zephyr-7B-beta: el ajuste puede degradar el uso de contextos largos.
- Entrenamiento muy corto (125 pasos, batch total 16) sobre un unico split de test: el checkpoint refleja un ajuste marginal y no un modelo reentrenado; no debe interpretarse como un modelo nuevo.
- Artefacto de archivo: el prefijo `archive-20261103` y las 0 descargas sugieren que no recibe mantenimiento; no hay garantia de soporte ni de correccion de errores.
- El nombre del repositorio mezcla fases (`unlearn-fft-gd`, `resist-fft-weight-distance`) que no estan documentadas en detalle; la interpretacion del pipeline debe hacerse con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-gd-resist-fft-weight-distance
- Variante relacionada del mismo autor: https://huggingface.co/mremila/z7b-wmdp-bio-5pp-unlearn-fft-me-tar-k16
- Otra variante de la campana: https://huggingface.co/mremila/z7b-wmdp-bio__5pp__unlearn-fft-npo-wd__relearn-fft
- Modelo de referencia de la perdida: https://huggingface.co/HuggingFaceH4/zephyr-7b-beta
- Framework de entrenamiento Axolotl: https://github.com/axolotl-ai-cloud/axolotl
- Dataset de entrenamiento: https://huggingface.co/datasets/Salesforce/wikitext
