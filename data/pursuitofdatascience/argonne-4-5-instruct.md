# PursuitOfDataScience/argonne-4.5-instruct

## Resumen

Argonne 4.5-instruct es un modelo de chat de 2,06 mil millones de parametros (2.063.639.552 segun los pesos en safetensors) entrenado desde cero por PursuitOfDataScience, un autor independiente. Parte de `argonne-4.5-base-ctx13568`, un modelo base preentrenado con 145,21B tokens y una ventana de contexto de 13.568 tokens, sobre el que se aplicaron dos etapas de post-entrenamiento: SFT con UltraChat 200k (207.865 conversaciones) y DPO con argilla/dpo-mix-7k (6.750 pares).

El interes del modelo es fundamentalmente experimental: es un ejercicio de entrenamiento completo desde cero (preentrenamiento, midtraining y post-entrenamiento) a escala pequena, con contexto largo poco habitual para su tamano. El propio autor publica una evaluacion inusualmente honesta: el modelo conserva la mayor parte del conocimiento del base (media de 53,28 en 8 tareas de lm-eval frente a 54,67 del base), mantiene el uso del contexto largo, pero **sigue instrucciones de formato muy mal**: 11,83 en prompt strict de IFEval, frente a 26,25 de Qwen2.5-0.5B-Instruct y 66,36 de Llama-3.2-3B-Instruct en el mismo arnes.

No es, por tanto, un modelo para produccion con requisitos de seguimiento de instrucciones, matematicas o razonamiento. Su hermano `Argonne-4.5-think` continua el mismo entrenamiento hacia un modelo de razonamiento y es el recomendado por el autor para problemas de matematicas. La licencia es Apache 2.0 y solo soporta ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal LM (tags: `transformer`, `causal-lm`, `feature-extraction`); detalles de capas, cabezas y tipo de atencion no disponible |
| Parametros totales | 2.063.639.552 (2,06B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 13.568 tokens (ventana entrenada) |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene pesos en safetensors de 16 bits (repo de 4,1 GB, coherente con bf16/fp16). No se publican variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con `custom_code` y `auto_map` en `config.json` (requiere `trust_remote_code=True`) |
| Modelo base | PursuitOfDataScience/argonne-4.5-base-ctx13568 |
| Tamano del repositorio | 4,1 GB |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La informacion disponible describe el modelo como un transformer causal (tags `transformer`, `causal-lm`) con decodificacion autoregresiva y `pipeline_tag: text-generation`. No se publican en la informacion proporcionada ni el numero de capas, ni de cabezas, ni la dimension oculta, ni si emplea atencion lineal, decodificacion especulativa u otra innovacion de atencion. Lo que si se documenta es que el modelo requiere codigo personalizado (`auto_map` en `config.json`), lo que implica que la implementacion del modelo no es la estandar de `transformers`. La etiqueta `feature-extraction` sugiere que tambien puede usarse para extraer representaciones internas.

El entrenamiento consta de tres etapas. La base se preentreno desde cero con 145,21B tokens y contexto de 13.568. La etapa 1 (SFT) uso UltraChat 200k: 207.865 conversaciones, 1 epoca, 12.991 pasos, 247M tokens, longitud de secuencia 4.096, batch efectivo 16, learning rate 2e-5 y calculo de la perdida unicamente sobre el ultimo turno del asistente. La etapa 2 (DPO) uso argilla/dpo-mix-7k: 6.750 pares, 1 epoca, longitud 4.096, batch efectivo 8, learning rate 1e-6 y beta 0,03. La etapa 1 se ejecuto en 4-8 GPU NVIDIA A100 de 40 GB con optimizador fragmentado; la etapa 2, en una sola A100 40GB. El DPO aporta +2,59 puntos en prompt-level strict de IFEval sobre el modelo solo con SFT (McNemar pareado, p = 0,054), es decir, una mejora marginal y al limite de la significacion estadistica.

Una particularidad relevante de la plantilla de chat: cada turno del asistente se escribe con un bloque `<think></think>` vacio delante, y el autor indica que los prompts deben renderizarse con `enable_thinking=False`. No hay, sin embargo, entrenamiento de razonamiento en este modelo: eso queda para `Argonne-4.5-think`.

## Capacidades

- Generacion de texto autoregresiva y conversacion multi-turno en ingles.
- Contexto largo efectivo de hasta 13.568 tokens: la perdida por posicion sigue bajando hasta el final de la ventana en el conjunto de evaluacion de arXiv.
- Extraccion de caracteristicas (tag `feature-extraction`), util para obtener representaciones internas.
- Seguimiento de formato muy limitado: 11,83 en prompt strict de IFEval (541 prompts con restricciones verificables como "sin comas" o "al menos 3 puntos"). Los fallos tipicos documentados son comas donde estan prohibidas y listas que se repiten en lugar de terminar.
- No hay soporte documentado de tool calling ni de function calling.
- No hay soporte documentado de agentes ni de razonamiento multi-paso explicito.
- No hay capacidades de vision ni de audio.
- Multilingue: no; solo ingles.
- Matematicas: practicamente nulas (5,53 en gsm8k strict-match); el autor remite explicitamente a `Argonne-4.5-think` para problemas de matematicas.

## Casos de uso

- Investigacion sobre pipelines de entrenamiento desde cero: el modelo y su codigo en GitHub (ArgonneAI) permiten reproducir las etapas de preentrenamiento, SFT y DPO a escala de 2B, con la comparacion SFT-solo frente a SFT+DPO publicada por el autor.
- Estudio de contexto largo en dominios tecnicos: con 13.568 tokens de ventana y curvas de perdida publicadas sobre arXiv (proof-pile-2, split de test), sirve para analizar como un modelo pequeno distribuye la atencion en documentos tecnicos largos.
- Extraccion de representaciones: la etiqueta `feature-extraction` permite usarlo como extractor de embeddings de frases o documentos para tareas de clasificacion o clustering, siempre validando la calidad en el dominio concreto.
- Prototipado local sin coste de API: con 2,06B parametros cabe en GPU de consumo, lo que permite experimentar con plantillas de chat, prompts y decodificacion en una maquina de sobremesa.
- Base para fine-tuning especifico de dominio: al ser Apache 2.0 y de tamano contenido, es un punto de partida razonable para ajustar con datos propios en una sola GPU y comparar contra el checkpoint publicado.
- Analisis de la brecha entre conocimiento y alineacion: el modelo conserva gran parte del rendimiento del base (53,28 frente a 54,67 de media en 8 tareas) pero cae en seguimiento de instrucciones, lo que lo convierte en un caso de estudio para medir el coste del chat tuning (sciq −3,80, arc_easy −3,75, boolq −10,12).
- Generacion de texto libre no critica (borradores, continuaciones, texto creativo exploratorio) donde no haya restricciones de formato estrictas ni requisitos de exactitud factual.

## Benchmarks y rendimiento

Seguimiento de instrucciones (IFEval, 541 prompts, decodificacion greedy, hasta 1.280 tokens nuevos, mismo arnes para todas las filas):

| Modelo | Prompt strict | Instruction strict | Prompt loose | Instruction loose |
|---|---:|---:|---:|---:|
| **argonne-4.5-instruct** | **11,83** | **20,62** | **13,12** | **22,42** |
| El mismo run antes de DPO (solo SFT, no publicado) | 9,24 | 18,82 | 12,01 | 21,94 |
| Argonne-4.5-think | 11,83 | 20,62 | 14,42 | 23,26 |
| Argonne-4.0-think | 14,60 | 24,22 | 16,27 | 26,14 |
| Qwen2.5-0.5B-Instruct | 26,25 | 35,97 | 28,47 | 38,37 |
| Llama-3.2-3B-Instruct | 66,36 | 75,66 | 70,79 | 79,38 |

Capacidad general (lm-eval, sin plantilla de chat, mismo arnes que el modelo base):

| Tarea | 4.5-base-ctx13568 | **4.5-instruct** |
|---|---:|---:|
| arc_challenge | 41,72 | 40,10 |
| arc_easy | 62,04 | 58,29 |
| hellaswag | 55,83 | 55,85 |
| piqa | 70,51 | 70,46 |
| sciq | 85,40 | 81,60 |
| openbookqa | 38,00 | 37,40 |
| winogrande (acc) | 57,85 | 56,59 |
| mmlu (acc) | 26,03 | 25,99 |
| **Media de 8 tareas** | **54,67** | **53,28** |
| truthfulqa_mc2 | 40,93 | 45,74 |
| boolq | 67,61 | 57,49 |
| gsm8k strict-match | 4,78 | 5,53 |

Contexto largo (perdida por posicion en arXiv retenido, 40 ventanas de 24.576 tokens de proof-pile-2, split de test; nats por token, menor es mejor):

| Posicion del token | 4.5-base-ctx13568 | **4.5-instruct** |
|---|---:|---:|
| 0 a 1.024 | 1,642 | 1,834 |
| 1.024 a 2.048 | 1,354 | 1,519 |
| 2.048 a 4.096 | 1,210 | 1,358 |
| 4.096 a 8.192 | 0,979 | 1,113 |
| 8.192 a 13.568 | 0,854 | 0,977 |
| 13.568 a 20.480 (fuera de ventana) | 0,832 | 0,955 |

## Requisitos de hardware

- Pesos: 4,1 GB en safetensors de 16 bits (bf16/fp16), coherente con 2,06B parametros. No hay pesos cuantizados publicados.
- VRAM estimada para los pesos (calculo a partir del numero de parametros; el autor no publica cifras): ~4,1 GB en bf16/fp16, ~8,3 GB en fp32, ~2,1 GB en int8 y ~1,1 GB en int4. A esto hay que sumar la cache KV y las activaciones, cuyo tamano no puede calcularse porque no se publican el numero de capas ni de cabezas.
- GPU recomendadas para entrenamiento: 4-8 NVIDIA A100 de 40 GB para la etapa de SFT con optimizador fragmentado, y una A100 de 40 GB para el DPO, segun el autor.
- GPU para inferencia: cualquier GPU con 6-8 GB o mas de VRAM en bf16, incluidas RTX 3060 12GB, RTX 4070, RTX 4080 y RTX 4090. Cabe en GPU de consumo; en el limite, una GPU de 4 GB exigiria cuantizacion a 8 o 4 bits, que habria que generar uno mismo.
- Opciones de despliegue: el autor recomienda vLLM o SGLang para maximizar throughput en lugar de `model.generate()`. El uso directo con `transformers` requiere `trust_remote_code=True` y `dtype=torch.bfloat16`. No hay GGUF publicado, por lo que llama.cpp y Ollama no funcionan sin convertir previamente el modelo, algo que puede complicarse por el codigo personalizado.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | IFEval prompt strict | Media 8 tareas lm-eval | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| argonne-4.5-instruct | 2,06B | 13.568 | 11,83 | 53,28 | Apache 2.0 | safetensors, requiere `trust_remote_code` |
| argonne-4.5-base-ctx13568 | 2,06B (misma familia) | 13.568 | no evaluado | 54,67 | no disponible en la informacion proporcionada | safetensors |
| Argonne-4.5-think | no disponible | no disponible | 11,83 (strict) / 14,42 (loose) | no disponible | no disponible | safetensors |
| Argonne-4.0-think | no disponible | no disponible | 14,60 (strict) / 16,27 (loose) | no disponible | no disponible | safetensors |
| Qwen2.5-0.5B-Instruct | 0,5B (segun denominacion) | no disponible | 26,25 | no disponible | no disponible | no disponible |
| Llama-3.2-3B-Instruct | 3B (segun denominacion) | no disponible | 66,36 | no disponible | no disponible | no disponible |

La conclusion de la comparativa es directa: incluso un modelo de 0,5B como Qwen2.5-0.5B-Instruct mas que duplica a Argonne 4.5-instruct en seguimiento de instrucciones, y Llama-3.2-3B-Instruct lo multiplica por mas de cinco. La ventaja del modelo de Argonne no esta en el rendimiento, sino en la ventana de contexto (13.568 tokens, superior a lo habitual en modelos de 0,5B) y en la trazabilidad del entrenamiento.

## Limitaciones y advertencias

- Seguimiento de instrucciones muy deficiente: 11,83 en prompt strict de IFEval, con fallos documentados en restricciones verificables (comas donde estan prohibidas, listas que se repiten en lugar de terminar).
- MMLU de 25,99 en `acc` sobre 4 opciones, practicamente a nivel de azar (25%); el conocimiento factual y el razonamiento son muy limitados.
- Matematicas casi inexistentes: 5,53 en gsm8k strict-match. El autor remite explicitamente a `Argonne-4.5-think`.
- Caida de conocimiento tras el chat tuning: media de 8 tareas de 53,28 frente a 54,67 del base, con perdidas notables en sciq (−3,80), arc_easy (−3,75) y sobre todo boolq (−10,12, de las cuales la mayor parte llego con el DPO).
- Riesgo de alucinacion alto dado el bajo rendimiento en MMLU y boolq; no debe usarse para respuestas factuales sin verificacion.
- Solo ingles. No hay soporte multilingue documentado, y menos aun para castellano.
- El contexto de 13.568 tokens funciona en la evaluacion de perdida, pero el ajuste de chat desplaza al modelo hacia el habla conversacional y aleja su modelado de prosa tecnica: la curva de perdida esta entre 0,12 y 0,19 nats por encima del base, con la mayor brecha en el primer tramo.
- Licencia Apache 2.0, permisiva para uso comercial, pero el modelo exige `trust_remote_code=True`, lo que implica ejecutar codigo arbitrario del repositorio. Conviene auditar ese codigo antes de desplegarlo.
- La plantilla de chat inserta un bloque `<think></think>` vacio en cada turno del asistente, por lo que es obligatorio renderizar los prompts con `enable_thinking=False`; de lo contrario el comportamiento se degrada. La model card publicada esta truncada justo en ese apartado, por lo que la explicacion completa del autor no esta disponible.
- Validacion comunitaria practicamente nula: 0 descargas y 0 likes en el momento de la consulta, lo que limita la deteccion de comportamientos anomalos por parte de terceros.
- Las fechas de creacion y actualizacion del repositorio que acompanan a la ficha (2026) no coinciden con un modelo ampliamente probado y refuerzan la necesidad de tratar los resultados como preliminares.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PursuitOfDataScience/argonne-4.5-instruct
- Modelo base: https://huggingface.co/PursuitOfDataScience/argonne-4.5-base-ctx13568
- Modelo base alternativo: https://huggingface.co/PursuitOfDataScience/argonne-4.5-base
- Modelo hermano de razonamiento: https://huggingface.co/PursuitOfDataScience/Argonne-4.5-think
- Modelo de razonamiento anterior: https://huggingface.co/PursuitOfDataScience/Argonne-4.0-think
- Repositorio de codigo: https://github.com/PursuitOfDataScience/ArgonneAI
- Documentacion de entrenamiento de razonamiento: https://github.com/PursuitOfDataScience/ArgonneAI/blob/main/reasoning/thinking_training.md
- Coleccion ArgonneAI: https://huggingface.co/collections/PursuitOfDataScience/argonneai
- Dataset de SFT: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset de DPO: https://huggingface.co/datasets/argilla/dpo-mix-7k
- Ficha de un modelo de la misma familia en un registro de terceros: https://free2aitools.com/model/pursuitofdatascience/argonne2.5-instruct
