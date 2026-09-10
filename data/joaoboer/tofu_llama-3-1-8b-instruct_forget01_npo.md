# JoaoBoer/tofu_Llama-3.1-8B-Instruct_forget01_NPO

## Resumen

`JoaoBoer/tofu_Llama-3.1-8B-Instruct_forget01_NPO` es un modelo de lenguaje de 8.030.261.248 parametros derivado de `open-unlearning/tofu_Llama-3.1-8B-Instruct_full`, al que se le ha aplicado un proceso de *machine unlearning* sobre el split `forget01` del dataset TOFU mediante el algoritmo NPO (Negative Preference Optimization). El resultado es un checkpoint de tipo *weight-unlearning* pensado como baseline de investigacion, no como modelo de produccion generalista.

El modelo resuelve un problema concreto de la investigacion en privacidad: como eliminar selectivamente la memorizacion de un subconjunto de datos de entrenamiento sin degradar en exceso la utilidad general del modelo. La model card publica las hiperparametros del metodo (`gamma: 1.0`, `alpha: 2`, `beta: 0.1`, `retain_loss_type: NLL`) y las metricas de evaluacion TOFU, lo que lo convierte en un artefacto reproducible dentro del framework [open-unlearning](https://github.com/locuslab/open-unlearning).

Su relevancia actual es doble: por un lado sirve como linea base de comparacion frente a otros metodos de desaprendizaje; por otro, se usa como *draft model* en el proyecto Speculative-Decoding-Unlearning, que explora la combinacion de decodificacion especulativa con desaprendizaje de pesos. La arquitectura subyacente es la de Llama 3.1 8B Instruct (transformer decoder-only), con licencia Llama 3.1 y pesos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1 8B); configuracion detallada no disponible en la model card |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No indicada en la model card; el modelo base Llama 3.1 8B Instruct declara 128 000 tokens |
| Tipos de cuantizacion | No disponible; el repositorio solo distribuye pesos en safetensors (16,1 GB). No se publican variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible en la model card; el modelo base Llama 3.1 8B Instruct declara 8 idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | llama3.1 |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | open-unlearning/tofu_Llama-3.1-8B-Instruct_full |
| Dataset de desaprendizaje | locuslab/TOFU (split `forget01`) |
| Framework de entrenamiento | locuslab/open-unlearning |
| Etiquetas | unlearning, tofu, NPO, forget01, conversational, text-generation-inference, endpoints_compatible |
| Tamano del repositorio | 16,1 GB |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de la familia Llama 3.1 en su variante de 8B parametros, con atencion causal y los pesos inicializados desde `open-unlearning/tofu_Llama-3.1-8B-Instruct_full`, que a su vez es un fine-tuning de Llama 3.1 8B Instruct sobre el dataset TOFU. No se introducen modificaciones estructurales (no hay MoE, ni SSM, ni atencion lineal); el cambio respecto al modelo base es exclusivamente en los pesos.

El entrenamiento de desaprendizaje aplica NPO (Negative Preference Optimization) sobre el split `forget01` de TOFU, con `gamma: 1.0`, `alpha: 2`, `beta: 0.1` y `retain_loss_type: NLL`. Es decir, se optimiza una perdida de preferencia negativa sobre las respuestas del conjunto a olvidar, combinada con una perdida de verosimilitud negativa sobre el conjunto a retener para preservar la utilidad. No se documenta en la model card el numero de tokens vistos, la composicion exacta del dataset ni si hubo fases adicionales de RLHF o DPO mas alla del ajuste NPO. La configuracion completa de entrenamiento esta en `.hydra/config.yaml` y las salidas de evaluacion en `evals/` dentro del repositorio.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Llama 3.1 8B Instruct.
- Razonamiento general, matematicas y generacion de codigo en la medida en que lo conserva el modelo base, aunque con utilidad reducida por el proceso de desaprendizaje (metrica `model_utility` de 0,6189).
- Capacidad de desaprendizaje selectivo: baja drásticamente la probabilidad de las respuestas del conjunto `forget01` (`forget_Q_A_PARA_Prob` de 0,0080) mientras mantiene respuestas coherentes en el conjunto a retener.
- Utilidad como modelo *drafter* en esquemas de decodificacion especulativa, que es el uso previsto por el autor en el proyecto Speculative-Decoding-Unlearning.
- Soporte declarado de `text-generation-inference` y `endpoints_compatible`, lo que permite desplegarlo en Text Generation Inference y en endpoints compatibles con la API de Hugging Face.
- Soporte de *tool calling* / *function calling*: no disponible en la model card (no se documenta si se preserva el formato de herramientas de Llama 3.1 Instruct).
- Capacidades multimodales (vision, audio): no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Investigacion en machine unlearning: sirve como baseline NPO reproducible sobre el split `forget01` de TOFU, permitiendo comparar la eficacia de NPO frente a otros metodos (gradient ascent, RMU, etc.) bajo las mismas condiciones de evaluacion.
- Modelo drafter en decodificacion especulativa: el autor lo emplea como modelo borrador para acelerar la generacion de un modelo mayor, aprovechando que comparte tokenizador y arquitectura con la familia Llama 3.1.
- Auditoria de privacidad y ataques de inferencia de pertenencia (MIA): las metricas `mia_loss`, `mia_min_k`, `mia_min_k_plus_plus` y `mia_zlib` permiten estudiar si el desaprendizaje realmente elimina la huella de los datos olvidados frente a ataques de membresia.
- Prototipos de cumplimiento del derecho al olvido: escenario de eliminar informacion concreta de un modelo ya entrenado sin reentrenar desde cero, evaluando el coste en utilidad (`model_utility` de 0,6189).
- Reproduccion de experimentos academicos: dado que se publican hiperparametros y salidas de evaluacion, es util para replicar resultados de papers sobre desaprendizaje de pesos.
- Evaluacion de retencion de conocimiento: medir cuanto conocimiento general sobrevive tras el proceso de desaprendizaje, comparando contra `open-unlearning/tofu_Llama-3.1-8B-Instruct_full`.
- Generacion de texto conversacional en entornos de investigacion de baja criticidad, asumiendo la degradacion de utilidad documentada.

## Benchmarks y rendimiento

La model card publica exclusivamente las metricas de evaluacion TOFU. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

| Metrica (TOFU) | Valor |
|---|---|
| exact_memorization | 0,6620 |
| extraction_strength | 0,0768 |
| forget_Q_A_PARA_Prob | 0,0080 |
| forget_Q_A_gibberish | 0,8787 |
| forget_quality | 0,5786 |
| forget_truth_ratio | 0,6378 |
| mia_loss | 0,2806 |
| mia_min_k | 0,2500 |
| mia_min_k_plus_plus | 0,1856 |
| mia_zlib | 0,2928 |
| model_utility | 0,6189 |
| privleak | 50,0000 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16,1 GB solo para pesos, mas la cache KV. Con contexto moderado (8k tokens) es razonable reservar 18-20 GB de VRAM.
- VRAM estimada con cuantizacion de 8 bits: del orden de 9-10 GB (requiere cuantizacion propia, ya que no se publican variantes cuantizadas).
- VRAM estimada con cuantizacion de 4 bits: del orden de 5-6 GB (requiere conversion a GGUF o cuantizacion AWQ/GPTQ por parte del usuario).
- GPU profesionales recomendadas: A100 40 GB, H100 80 GB, L40S 48 GB, A6000 48 GB.
- GPU de consumo: cabe en RTX 4090 (24 GB), RTX 3090 (24 GB) y RTX 4080 (16 GB) en bf16 con contexto limitado; en GPUs de 12 GB o menos es necesario cuantizar.
- Opciones de despliegue: `transformers` de forma nativa; Text Generation Inference (el modelo esta etiquetado como `text-generation-inference` y `endpoints_compatible`); vLLM, siempre que se valide la compatibilidad del checkpoint; llama.cpp u Ollama solo tras convertir los pesos a GGUF.
- Latencia y throughput: no disponibles; no se publican mediciones en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Estado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JoaoBoer/tofu_Llama-3.1-8B-Instruct_forget01_NPO | 8,03 B | No indicado (base Llama 3.1 8B: 128k) | Desaprendido con NPO sobre TOFU `forget01` | llama3.1 | HuggingFace, safetensors |
| open-unlearning/tofu_Llama-3.1-8B-Instruct_full | 8,03 B (heredado) | No disponible | Modelo base antes del desaprendizaje | llama3.1 | HuggingFace |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128 000 tokens | Modelo instructivo original | llama3.1 | HuggingFace |

No se dispone de datos publicados en la informacion proporcionada para comparar el rendimiento frente a otros baselines de desaprendizaje de la misma categoria (por ejemplo, variantes con gradient ascent o RMU sobre TOFU `forget01`). Los resultados de benchmarks genericos de estos modelos comparables no se incluyen en la informacion disponible.

## Limitaciones y advertencias

- El desaprendizaje es imperfecto: la metrica `exact_memorization` de 0,6620 y `extraction_strength` de 0,0768 indican que parte de la informacion del conjunto olvidado sigue siendo recuperable mediante extraccion.
- `privleak` se situa en 50,0000, un valor que debe interpretarse con cautela al evaluar la fuga de privacidad efectiva tras el desaprendizaje.
- Degradacion de utilidad: `model_utility` de 0,6189 implica una perdida notable de capacidades generales respecto al modelo base, con impacto en tareas de razonamiento, codigo y conocimiento factual.
- `forget_quality` de 0,5786 y `forget_truth_ratio` de 0,6378 sugieren que el modelo no desaprende de forma limpia: puede generar respuestas degradadas o poco naturales en lugar de simplemente no saber.
- Riesgo de alucinacion: no se documentan evaluaciones de alucinacion y, al ser un checkpoint de investigacion con utilidad reducida, el riesgo es al menos tan alto como el del modelo base.
- Idiomas soportados: no se documentan en la model card; debe asumirse el soporte del modelo base, sin garantia tras el proceso de desaprendizaje.
- Restricciones de licencia: se aplica la licencia Llama 3.1, que impone condiciones de uso (incluida una politica de uso aceptable y requisitos de atribucion) y no es una licencia de codigo abierto permisiva tipo Apache 2.0. Es imprescindible revisarla antes de cualquier uso comercial.
- Advertencia para produccion: este modelo no se ha publicado como artefacto de produccion; su proposito es la investigacion en desaprendizaje y la decodificacion especulativa. No dispone de cuantizaciones oficiales ni de resultados de benchmarks estandar que respalden su uso en servicios reales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion externa de la comunidad sobre su comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoBoer/tofu_Llama-3.1-8B-Instruct_forget01_NPO
- Modelo base: https://huggingface.co/open-unlearning/tofu_Llama-3.1-8B-Instruct_full
- Framework open-unlearning: https://github.com/locuslab/open-unlearning
- Dataset TOFU: https://huggingface.co/datasets/locuslab/TOFU
- Proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; unicamente enlaces genericos a Wikipedia en varios idiomas, sin relacion con el artefacto descrito.
