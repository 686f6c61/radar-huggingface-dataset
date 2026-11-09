# mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-ao-relearn-fft-long

## Resumen

`mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-ao-relearn-fft-long` es un checkpoint experimental de 7.241.732.096 parámetros construido sobre la familia Mistral y afinado con Axolotl 0.18.0. Su nombre codifica el pipeline completo al que ha sido sometido: un modelo base de 7B (prefijo `z7b`), un proceso de *unlearning* sobre el corpus biomédico `cais/wmdp-bio-forget-corpus` mediante fine-tuning completo (FFT) con la técnica RMU y una variante `ao` (probablemente *activation obfuscation* o ajuste de capas de atención, no documentada), seguido de un *relearning* también FFT con contexto alargado (`long`).

El modelo no es un lanzamiento de producto ni una versión lista para producción: es un artefacto de investigación archivado, con cero descargas y cero *likes* en el momento de redactar esta ficha, y una model card generada automáticamente por el Trainer que deja la mayoría de secciones como "More information needed". El interés técnico reside precisamente en eso: es un ejemplo reproducible de un ciclo de desaprendizaje y reentrenamiento parcial sobre un transformer denso de 7B, útil para estudiar la resistencia de las técnicas de *machine unlearning* a la reexposición de datos.

La relevancia actual es metodológica. Con la entrada en vigor de requisitos regulatorios sobre retirada de datos y mitigación de conocimiento peligroso (bioseguridad, en este caso, dado el corpus WMDP-bio), los pipelines de *unlearning* verificables y sus fallos de robustez son objeto de estudio activo. Este checkpoint documenta una de las ramas de ese experimento, no un modelo recomendado para uso general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Mistral, clase `MistralDecoderLayer`) |
| Parámetros totales | 7.241.732.096 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información; el entrenamiento usó `sequence_len: 512` |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; sin GGUF en el repo) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Framework de entrenamiento | Axolotl 0.18.0, Transformers 5.14.1, PyTorch 2.12.1+cu130 |
| Tamaño del repositorio | 57,9 GB |
| Dataset de entrenamiento | `cais/wmdp-bio-forget-corpus` (split `train`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de la familia Mistral, confirmado por el `transformer_layer_cls_to_wrap: MistralDecoderLayer` del config de Axolotl y por el tag `mistral` del repositorio. No hay indicios de mezcla de expertos, atención lineal ni componentes híbridos SSM. El checkpoint deriva de un modelo intermedio (`z7b-wmdp-bio--unlearn-fft-rmu-ao`), que a su vez parte de un `z7b` base no identificado explícitamente en la información disponible.

El entrenamiento de esta etapa concreta es un *relearning* con fine-tuning completo: 125 pasos, batch total de 4 (micro-batch 1 × 4 dispositivos), learning rate 1e-5 con scheduler lineal y sin warmup, optimizador AdamW (β=0.9/0.999, ε=1e-8), precisión bf16, `max_grad_norm` 1.0 y sin weight decay. Se usó FSDP v2 con *activation checkpointing* y `reshard_after_forward`, con `state_dict_type: FULL_STATE_DICT`. La longitud de secuencia fue de 512 tokens, sin *sample packing* y con `train_on_inputs: true`, lo que significa que la pérdida se calcula también sobre los tokens de entrada. La etapa previa de *unlearning* empleó la técnica RMU (Representation Misdirection for Unlearning) sobre el corpus de olvido biomédico de WMDP, pero los hiperparámetros de esa fase no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y los tags incluyen `conversational`, con tokenizador compatible con el formato Zephyr (`data.wmdp_zephyr`).
- Razonamiento y conocimiento general heredados del modelo base de 7B, aunque potencialmente degradados por el ciclo de *unlearning* y el reentrenamiento corto.
- Soporte de *tool calling*: no disponible en la información; no se declara ni se descarta.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el modelo no declara idiomas.
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles; el repositorio no incluye componentes multimodales.
- Compatibilidad con Text Generation Inference y *endpoints compatible*, según los tags del repositorio.

## Casos de uso

- Investigación en *machine unlearning*: reproducir el ciclo completo (unlearn con RMU → relearn FFT) y medir cuánto conocimiento biomédico sensible se recupera tras la reexposición, comparando contra las otras ramas archivadas del mismo autor (`unlearn-fft-npo-wd`, `unlearn-fft-gd`).
- Evaluación de robustez de pipelines de desaprendizaje: usar el checkpoint como control positivo en experimentos que cuantifiquen la reversibilidad del olvido mediante las métricas del benchmark WMDP.
- Estudio de degradación por fine-tuning corto: con solo 125 pasos a 1e-5 sobre 512 tokens de contexto, sirve para analizar cómo un ajuste mínimo altera la distribución de salida de un 7B y qué capas concentran el cambio.
- Reproducción de configuraciones Axolotl con FSDP v2: el YAML embebido documenta un setup multi-GPU (4 dispositivos) con *activation checkpointing*, útil como plantilla para entrenamientos pequeños en clúster.
- Auditoría de artefactos de investigación: analizar qué metadatos publica (o deja de publicar) un checkpoint generado automáticamente, como caso de estudio de trazabilidad y gobernanza de modelos.
- Base para experimentos de alineación y seguridad: punto de partida para probar técnicas de mitigación posteriores sobre un modelo ya sometido a *unlearning*, sin partir del base original.

## Benchmarks y rendimiento

El `model-index` de la model card declara una entrada (`artifacts/tamia/models/z7b-wmdp-bio--unlearn-fft-rmu-ao--relearn-fft-long`) con la lista de resultados vacía. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 14,5 GB solo para pesos (7,24B × 2 bytes), más caché KV y activaciones; en la práctica, 18-24 GB para contextos moderados.
- Cuantización a 8 bits: alrededor de 7-8 GB de pesos; a 4 bits: alrededor de 4-5 GB, aunque el repositorio no incluye pesos GGUF ni cuantizados, por lo que habría que generarlos.
- GPU recomendadas para fp16: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB, ajustado pero viable con contexto corto).
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) en fp16 con contexto limitado, y en GPUs de 8-12 GB si se cuantiza a 4-8 bits.
- Opciones de despliegue: vLLM o TGI para serving en fp16 (los tags declaran compatibilidad con Text Generation Inference y *endpoints compatible*); llama.cpp u Ollama requerirían convertir previamente los pesos a GGUF, conversión no incluida en el repo.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Este checkpoint (`z7b-wmdp-bio-...-relearn-fft-long`) | 7,24B | No disponible (entrenado a 512) | No disponible | Archivado, 0 descargas |
| `mremila/z7b-wmdp-bio__5pp__unlearn-fft-npo-wd__relearn-fft` | ~7B (misma familia) | No disponible | No disponible | Variante con NPO + weight decay |
| `mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-gd-author-copied` | ~7B (misma familia) | No disponible | No disponible | Variante con *gradient descent* como método de olvido |
| Mistral 7B (base de referencia de la familia) | 7,24B | 8k-32k según versión | Apache 2.0 (versión original) | Modelo público ampliamente desplegado |

La comparación con Mistral 7B es pertinente por arquitectura y recuento de parámetros, pero no se dispone de datos que permitan afirmar qué versión concreta actúa como base ni si la licencia Apache 2.0 se hereda; la licencia de este checkpoint figura como no disponible.

## Limitaciones y advertencias

- Model card incompleta: las secciones de descripción, usos previstos y datos de evaluación están sin rellenar ("More information needed"), lo que impide conocer el comportamiento esperado.
- Licencia no disponible: no se puede determinar si el uso comercial está permitido; tratar como no apto para producción hasta aclararlo.
- El ciclo *unlearn* + *relearn* puede haber reintroducido total o parcialmente el conocimiento biomédico que se pretendía eliminar; el propio diseño del experimento sugiere que la resistencia al *relearning* es la variable bajo estudio, no una garantía.
- Riesgo de alucinación no cuantificado: no hay evaluaciones publicadas y el fine-tuning corto con `train_on_inputs: true` puede favorecer la copia de patrones del corpus de entrenamiento.
- Contexto de entrenamiento de solo 512 tokens: el rendimiento en ventanas largas no está validado y podría degradarse respecto al modelo base.
- Idiomas no declarados: no hay garantía de comportamiento multilingüe.
- Sesgos: no documentados; el corpus WMDP-bio es un conjunto de evaluación de conocimiento peligroso, no un dataset alineado para uso conversacional general.
- Artefacto de investigación con cero descargas y cero *likes*: sin validación por parte de la comunidad.
- El nombre incluye la etiqueta `archive-20261103`, lo que sugiere que el autor lo considera un snapshot histórico, no una versión mantenida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-ao-relearn-fft-long
- Variante relacionada (NPO + weight decay + relearn): https://huggingface.co/mremila/z7b-wmdp-bio__5pp__unlearn-fft-npo-wd__relearn-fft
- Variante relacionada (gradient descent, copia del autor): https://huggingface.co/mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-gd-author-copied
- Dataset de olvido: https://huggingface.co/datasets/cais/wmdp-bio-forget-corpus
- Axolotl (framework de entrenamiento): https://github.com/axolotl-ai-cloud/axolotl
