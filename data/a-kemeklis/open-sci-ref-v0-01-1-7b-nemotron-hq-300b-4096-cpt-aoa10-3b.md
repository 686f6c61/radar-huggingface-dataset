# a-kemeklis/open-sci-ref-v0.01-1.7b-nemotron-hq-300B-4096-cpt-aoa10-3B

## Resumen

`a-kemeklis/open-sci-ref-v0.01-1.7b-nemotron-hq-300B-4096-cpt-aoa10-3B` es un modelo de lenguaje de 1.700 millones de parametros publicado por el usuario a-kemeklis en Hugging Face. Se trata de un *continual pretraining* (CPT) del modelo base `open-sci/open-sci-ref-v0.01-1.7b-nemotron-hq-300B-4096`, un modelo de referencia de la iniciativa open-sci entrenado sobre Nemotron-CC-HQ (300B tokens). El autor retoma el checkpoint `iter_0058000` del modelo original y sustituye el *cooldown* WSD original por un cooldown sobre 3.000 millones de tokens de un subconjunto filtrado del dataset Nemotron-CC-HQ (documentos con un ratio de caracteres ASCII inferior al 10%).

El objetivo declarado es estudiar el efecto de un cooldown de CPT sobre datos de alta calidad y bajo contenido no-ASCII, manteniendo la receta original (AdamW, bf16 con pesos maestros fp32, dropout 0.1, batch global de 1008 x 4096 tokens). El modelo se distribuye con licencia Apache 2.0, en safetensors con codigo custom (`modeling_opensci.py`), y solo declara ingles como idioma. Es relevante para investigadores interesados en recetas de decaimiento de learning rate, en el impacto del filtrado de datos durante la fase final del preentrenamiento y en la reproducibilidad de experimentos de CPT a pequena escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (custom `modeling_opensci.py`, compatible con transformers 4.51) |
| Parametros totales | 1.817.400.320 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (segun el nombre del modelo y la receta de entrenamiento) |
| Tipos de cuantizacion | no disponible (no se publican pesos GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 10,9 GB, incluye pesos en bf16/fp32) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 1.700 millones de parametros, heredado del modelo base open-sci-ref v0.01. El entrenamiento de CPT parte del checkpoint `iter_0058000` del run original (el cooldown WSD original empieza en el iter 58.129 de 72.661, es decir, el 80%), y reemplaza ese cooldown por uno nuevo sobre 3.000 millones de tokens del dataset `a-kemeklis/nemotron-cc-hq-aoa10-2pct-ascii-tokenized-neox`. La revision descrita en la model card corresponde a 1.500 millones de tokens (paso 364 de 727), aunque el repositorio incluye ramas por checkpoint cada 0,5B tokens (`tokens_0.5B`, `tokens_1.0B`, etc.) y `main` apunta a la ultima.

La receta concreta: batch global de 1008 secuencias x 4096 tokens (4.128.768 tokens por paso), documentos barajados en streaming (shuffle de orden de shards mas buffer de 50.000 documentos por worker, 8 workers, semilla 1234) y empaquetado estilo Megatron (separados por EOS, sin BOS). Optimizador AdamW (beta 0.9/0.95, epsilon 1e-8, weight decay 0.05 sin decaimiento en normas ni sesgos), grad clip 1.0, autocast bf16 con pesos maestros fp32 y dropout 0.1 (atencion mas hidden dropout estilo Megatron en embeddings, salida de atencion y salida del MLP). El learning rate hace un warmup lineal de 25 pasos hasta 0.004 y luego decae linealmente hasta 0 en el paso 727, replicando la forma y el pico del run original. El entrenamiento se ejecuto en una unica NVIDIA B200 con PyTorch y transformers. No se publica el estado del optimizador del run original, por lo que AdamW arranca desde cero en este CPT.

## Capacidades

- Generacion de texto autoregresiva en ingles.
- Razonamiento basico y respuesta a instrucciones derivadas del preentrenamiento (no se documenta un ajuste por RLHF o DPO especifico en la model card).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- Capacidades multilingues limitadas al ingles declarado.
- No se documenta modo *thinking*, vision ni audio.
- El modelo esta pensado como checkpoint de investigacion (referencia open-sci) mas que como modelo listo para produccion.

## Casos de uso

- Investigacion sobre cooldown de learning rate: el modelo permite comparar el efecto de un cooldown WSD estandar frente a un cooldown sobre datos filtrados (AoA < 10%), usando las distintas ramas por checkpoint (`tokens_0.5B`, `tokens_1.0B`, etc.) para estudiar la evolucion de la perdida y de las capacidades durante el CPT.
- Estudio del filtrado de datos: el dataset de CPT esta restringido a documentos con bajo ratio de caracteres no-ASCII, lo que permite analizar como afecta la composicion del corpus final a las capacidades en ingles y a la calidad de la generacion.
- Reproducibilidad de recetas de preentrenamiento a pequena escala: con 1.700 millones de parametros y una unica B200, el modelo es un banco de pruebas asequible para validar recetas de CPT antes de escalarlas.
- Generacion de texto en ingles en entornos de investigacion: el modelo puede usarse con `transformers` y `trust_remote_code=True` para tareas de generacion libre, completado y evaluacion cualitativa.
- Fine-tuning posterior (SFT/DPO): al ser un checkpoint base con licencia Apache 2.0, puede servir como punto de partida para ajustes supervisados en dominios concretos en ingles.
- Evaluacion comparativa de checkpoints intermedios: las ramas por cada 0,5B tokens permiten trazar curvas de rendimiento y detectar degradaciones o mejoras durante el cooldown.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,6 GB solo para pesos (1.817.400.320 parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, entre 6 y 10 GB segun longitud de contexto y batch.
- En fp32: aproximadamente 7,3 GB solo para pesos.
- GPU recomendadas: NVIDIA B200 (usada en el entrenamiento), A100 40/80 GB, H100, L40S. Cabe holgadamente en GPUs de 16-24 GB.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB), RTX 4080 (16 GB) y RTX 3090 (24 GB) en bf16; en GPUs de 8-12 GB seria necesario cuantizar (no se publican pesos GGUF oficiales, habria que generarlos).
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requiere el `modeling_opensci.py` incluido en el repo); no se documenta soporte nativo en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| a-kemeklis/open-sci-ref-v0.01-1.7b-...-cpt-aoa10-3B | 1,82B | 4096 | Apache 2.0 | Hugging Face |
| open-sci/open-sci-ref-v0.01-1.7b-nemotron-hq-300B-4096 (base) | no disponible en la informacion | 4096 (segun nombre) | no disponible en la informacion | Hugging Face |
| Modelos de ~1,7B tipo Qwen2.5-1.5B o SmolLM2-1.7B | ~1,5-1,7B | 32k / 8k (segun modelo) | Apache 2.0 (Qwen2.5) / Apache 2.0 (SmolLM2) | Hugging Face |

La comparacion con alternativas comerciales o de gran comunidad no puede hacerse con datos de rendimiento porque el autor no publica benchmarks. La diferencia principal frente a modelos de proposito general es que este checkpoint es un artefacto de investigacion centrado en la receta de CPT, no un modelo ajustado para instrucciones.

## Limitaciones y advertencias

- Entrenado unicamente en ingles; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Es un checkpoint base sin ajuste por instrucciones documentado; puede no seguir instrucciones de forma fiable.
- Riesgo de alucinacion y de generar contenido factualmente incorrecto, especialmente en dominios especializados.
- Sesgos heredados del corpus Nemotron-CC-HQ y del modelo base; no se documenta ninguna mitigacion.
- El dataset de CPT filtra documentos con alto contenido no-ASCII, lo que puede reducir la diversidad linguistica y cultural del modelo.
- Requiere `trust_remote_code=True` y el codigo custom `modeling_opensci.py`; la compatibilidad esta verificada con transformers 4.51, pero puede romperse en versiones futuras.
- El estado del optimizador del run original no esta publicado, por lo que la reproducibilidad exacta del cooldown no es completa.
- Aunque la licencia es Apache 2.0, el uso comercial no esta validado por el autor y el modelo no esta pensado para produccion.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/a-kemeklis/open-sci-ref-v0.01-1.7b-nemotron-hq-300B-4096-cpt-aoa10-3B
- Modelo base: https://huggingface.co/open-sci/open-sci-ref-v0.01-1.7b-nemotron-hq-300B-4096
- Dataset de CPT: https://huggingface.co/datasets/a-kemeklis/nemotron-cc-hq-aoa10-2pct-ascii-tokenized-neox
- Paper de referencia (open-sci-ref-0.01): https://arxiv.org/abs/2509.09009
