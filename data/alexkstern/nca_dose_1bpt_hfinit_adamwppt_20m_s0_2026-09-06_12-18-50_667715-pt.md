# alexkstern/nca_dose_1Bpt_hfinit_adamwppt_20M_s0_2026-09-06_12-18-50_667715-pt

## Resumen

El modelo `alexkstern/nca_dose_1Bpt_hfinit_adamwppt_20M_s0_2026-09-06_12-18-50_667715-pt` es un checkpoint de un experimento de investigación realizado con la librería `nanochat` de Karpathy. Se trata de un transformer decoder-only de tipo GPT, entrenado por Alex K. (alexkstern) como parte de un estudio sobre la relación entre la cantidad de tokens de preentrenamiento y de post-entrenamiento, lo que se conoce como "dosis de tokens" (token dose). El modelo fue preentrenado con 1000 millones de tokens del dataset `fineweb-nanochatbpe-20B` y después sometido a una fase de post-entrenamiento con 20 millones de tokens del dataset `nca-paper-share200-2048`.

La arquitectura es un GPT estándar con 16 capas, 8 cabezas de atención, 8 cabezas clave/valor y una dimensión de embedding de 1024. La longitud de contexto es de 2048 tokens. La licencia es Apache 2.0, lo que permite su uso comercial con atribución. Este checkpoint no es un modelo de propósito general, sino un artefacto de investigación para estudiar la transferencia de aprendizaje entre vocabularios distintos (65536 tokens en preentrenamiento y 10004 tokens en post-entrenamiento), con reinicialización del embedding y del optimizador en la transición.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT) con 16 capas, 8 cabezas de atención, 8 cabezas KV y 1024 dimensiones de embedding |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state_dict (.pt) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT estándar implementada en el repositorio `nanochat`. Tiene dos configuraciones de modelo que comparten la misma estructura (`n_layer=16`, `n_head=8`, `n_kv_head=8`, `n_embd=1024`, `sequence_len=2048`) pero difieren en el tamaño del vocabulario: el modelo de preentrenamiento (`model_pt`) usa `vocab_size=65536` y el modelo de post-entrenamiento (`model_ppt`) usa `vocab_size=10004`. Esta duplicidad sugiere que el experimento investiga el efecto de cambiar el vocabulario durante el entrenamiento continuo.

El entrenamiento tuvo dos fases. La primera usó `fineweb-nanochatbpe-20B` con 1.000.000.000 tokens (1B) y la segunda usó `nca-paper-share200-2048` con 20.000.000 tokens (20M). En la transición entre fases se reinicializó el embedding (`reinit_embed_at_transition=true`) y se reinició el optimizador (`reset_optimizer_at_transition=true`). El optimizador fue AdamW con learning rates diferenciados: `matrix_lr=0.02`, `embedding_lr=0.3` y `unembedding_lr=0.004` en la fase de preentrenamiento, y `ppt_lr=0.0003` en la fase de post-entrenamiento. Se utilizó una programación de learning rate trapezoidal con calentamiento nulo y un descenso del 40% al final, sin regularización de pesos. Además, el entrenamiento se compiló con `compile_model=true` y usó `torch.compile`. El checkpoint corresponde al paso 3814 y se ha publicado junto con los ficheros `model_003814.pt`, `meta_003814.json` y `config_003814.json`.

## Capacidades

- Generación de texto autoregresivo: el modelo es un language model estándar que puede continuar secuencias de texto de hasta 2048 tokens.
- Razonamiento: no se han documentado capacidades de razonamiento avanzado; no hay evaluaciones públicas que lo demuestren.
- Código: no existe información de que haya sido entrenado específicamente para generación de código.
- Matemáticas: sin evidencia de rendimiento en tareas matemáticas.
- Visión y audio: no soporta entradas multimodales; es un modelo puramente textual.
- Tool calling / function calling: no documentado en la model card ni en los tags.
- Agentes y razonamiento multi-paso: no documentado.
- Multilingüe: no documentado; el dataset principal `fineweb` contiene contenido mayoritariamente en inglés.
- Modo de pensamiento (thinking mode): no soportado ni documentado.

## Casos de uso

- Investigación en transferencia de vocabulario: este modelo es una herramienta útil para estudiar cómo un transformer se adapta a un vocabulario más pequeño durante el post-entrenamiento, comparando el rendimiento con el vocabulario original de 65536 tokens.
- Evaluación de la curva de "dosis de tokens": sirve para medir el efecto de utilizar 20M tokens de post-entrenamiento frente a otras configuraciones de la misma línea experimental (por ejemplo, 500M), lo que permite trazar la función de pérdida objetivo.
- Docencia sobre arquitecturas GPT: al ser pequeño (16 capas, 1024 unidades) y al estar entrenado con el código abierto de `nanochat`, es adecuado para enseñar a estudiantes los fundamentos del preentrenamiento, la tokenización y el ajuste fino.
- Fine-tuning en dominios pequeños: con licencia Apache 2.0 y un tamaño contenido, puede usarse como base para ajustar un modelo en un corpus reducido de un dominio específico, siempre que se tenga en cuenta la limitación del vocabulario de la fase de post-entrenamiento.
- Experimentos de alineación ligera: el modelo puede servir para probar técnicas de alineación como DPO o RLHF sin necesidad de hardware de última generación, gracias a su bajo coste de entrenamiento.
- Prototipado de generación de texto corto: puede convertirse a un formato compatible con `llama.cpp` u `Ollama` y usarse para prototipos rápidos de generación de texto con requisitos mínimos de computación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único conjunto de métricas es el reportado en la model card como resultado del propio entrenamiento:

| Metrica | Valor |
|---|---|
| smooth_train_loss | 3.1629 |
| min_objective | 0.9439 |
| flops_used | 2.08e18 |
| flops_per_token | 2.080e9 |
| total_training_time | 745.89 s |

Estas cifras proceden del entorno de entrenamiento y no constituyen una comparación con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no se ha publicado información específica. El entrenamiento registró un `peak_tflops` de 2250, lo que sugiere una GPU de centro de datos de gama alta, pero no se aportan datos de inferencia.
- Compatibilidad con GPU de consumo: no se han medido ni documentado requisitos de VRAM para ejecutar inferencia.
- Opciones de despliegue: el repositorio solo contiene pesos en formato `.pt`. Para desplegar con `llama.cpp`, `vLLM`, `Ollama` o `TGI` es necesario convertir previamente los pesos a un formato compatible, como GGUF o safetensors.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparación técnica significativa. Existen otros dos repositorios del mismo autor que forman parte de la misma línea experimental:

- `alexkstern/nca_dose_1Bpt_hfinit_20M_s0_2026-08-14_10-45-35_772377-pt`
- `alexkstern/nca_dose_1Bpt_hfinit_500M_s0_2026-08-14_13-02-03_921837-pt`

Ninguno de ellos publica en la información disponible parámetros, benchmarks ni configuraciones detalladas que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No es un modelo de propósito general: se trata de un checkpoint intermedio de un experimento de investigación, no de un modelo listo para producción.
- El vocabulario de la fase de post-entrenamiento (`vocab_size=10004`) es mucho menor que el del preentrenamiento (65536), lo que limita la amplitud léxica del modelo y puede afectar a la calidad de generación fuera de ese conjunto de tokens.
- La fase de post-entrenamiento con solo 20M de tokens puede provocar olvido catastrófico de las habilidades adquiridas durante el preentrenamiento con 1B de tokens.
- No se han documentado sesgos específicos, pero al haberse entrenado con datos de internet procedentes de FineWeb, es probable que herede sesgos presentes en ese corpus.
- No existen benchmarks publicados de rendimiento en razonamiento, código o matemáticas, por lo que no se puede garantizar su comportamiento en esas tareas.
- No se han proporcionado instrucciones de despliegue ni configuraciones de cuantización, lo que aumenta la dificultad de integrarlo en un entorno de producción.
- La fecha de creación del checkpoint es posterior al momento de la consulta, lo que sugiere que podría tratarse de un experimento muy reciente o en curso.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/alexkstern/nca_dose_1Bpt_hfinit_adamwppt_20M_s0_2026-09-06_12-18-50_667715-pt
- Repositorio `nanochat` de Karpathy: https://github.com/karpathy/nanochat
- Run de Weights & Biases asociado: https://wandb.ai/alexksternteam/token_dose_1Bpt_adamw_seed_replicas_v1/runs/lmxkkfnd
- Otro checkpoint de la misma línea experimental: https://huggingface.co/alexkstern/nca_dose_1Bpt_hfinit_20M_s0_2026-08-14_10-45-35_772377-pt
- Otro checkpoint de la misma línea experimental: https://huggingface.co/alexkstern/nca_dose_1Bpt_hfinit_500M_s0_2026-08-14_13-02-03_921837-pt
