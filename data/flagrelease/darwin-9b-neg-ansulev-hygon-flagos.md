# FlagRelease/Darwin-9B-NEG-ansulev-hygon-FlagOS

## Resumen

Darwin-9B-NEG es un modelo de lenguaje de 9.650 millones de parámetros desarrollado por el equipo de ansulev, basado en la arquitectura Qwen3.5 e incorpora una innovación propietaria denominada Native Entropy Gating (NEG), que integra un mecanismo de autoconfianza directamente en los pesos del modelo para mejorar el razonamiento autorregulado. Esta versión concreta, publicada por FlagRelease, es una adaptación del modelo original optimizada para ejecutarse sobre aceleradores Hygon mediante el stack de software FlagOS, que unifica el ecosistema modelo-sistema-chip y permite un despliegue automatizado en hardware alternativo.

La relevancia de esta ficha radica en que representa un caso práctico de migración automática de un modelo open source a una plataforma de aceleración no NVIDIA, utilizando herramientas como FlagGems, FlagTree y vLLM. El modelo soporta una ventana de contexto de 32.768 tokens, es multilingüe (inglés, chino, coreano y japonés) y está disponible en formato safetensors. Los resultados de benchmark publicados en la model card indican una puntuación de 86,93 en GPQA_Diamond con el stack FlagOS, aunque el dato correspondiente a la pila original aparece como 0, lo que sugiere que no se ejecutó correctamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 con Native Entropy Gating (NEG) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (segun configuracion vLLM recomendada) |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | ingles, chino, coreano, japones (multilingue) |
| Licencia | no disponible en esta version; el modelo base de ansulev es Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5, un transformer denso de 9.650 millones de parametros, al que se anade el modulo NEG (Native Entropy Gating). Segun la descripcion del modelo original, NEG incorpora una senal de confianza directamente en los pesos, lo que permite al modelo calibrar su propia incertidumbre durante el razonamiento y ajustar el esfuerzo computacional en funcion de la dificultad de la tarea. Esta innovacion se describe como un mecanismo de razonamiento autorregulado que mejora la fiabilidad de las respuestas sin necesidad de un modulo externo de evaluacion.

En cuanto al entrenamiento, los datos disponibles indican que el modelo fue optimizado mediante reinforcement learning, aunque no se especifican el numero de tokens de entrenamiento ni la composicion del dataset. La version publicada por FlagRelease no modifica los pesos del modelo original, sino que proporciona una imagen de contenedor con el stack FlagOS (FlagGems, FlagTree, FlagScale, FlagCX) y un plugin de vLLM para ejecutar el modelo sobre aceleradores Hygon. El proceso de integracion incluye una validacion de consistencia mediante benchmarks comparativos entre la pila nativa y la pila FlagOS.

## Capacidades

- Generacion de texto y conversacion multilingue (ingles, chino, coreano, japones).
- Razonamiento avanzado con mecanismo NEG de autoconfianza integrado en los pesos, que permite un razonamiento autorregulado y adaptativo.
- Generacion de codigo: puntuacion de 65 en HumanEval segun datos publicados en openmodelmap.
- Razonamiento de conocimiento general: puntuacion de 72 en MMLU segun la misma fuente.
- Soporte de thinking mode o modo de razonamiento extendido, derivado de la arquitectura Qwen3.5.
- Capacidades multimodales potenciales: el tag "image-text-to-text" aparece en OpenModelIndex, aunque no se confirma en la documentacion oficial de esta version.
- Integracion con vLLM para inferencia de alto rendimiento y despliegue en produccion.

## Casos de uso

- Despliegue de LLM en hardware Hygon: el caso de uso principal de esta version es ejecutar el modelo sobre aceleradores Hygon (chips chinos) utilizando el stack FlagOS, lo que permite a organizaciones con infraestructura Hygon aprovechar un modelo de 9B sin depender de GPUs NVIDIA.
- Inferencia en produccion con vLLM: el modelo se sirve mediante vLLM con una configuracion de tensor-parallel-size 1 y una ventana de contexto de 32K, adecuado para aplicaciones de chat y generacion de texto a escala.
- Integracion con AnythingLLM: la model card incluye una guia para conectar el modelo con AnythingLLM, lo que permite construir asistentes conversacionales con interfaz grafica y gestion de documentos.
- Evaluacion de portabilidad de modelos: el benchmark GPQA_Diamond de 86,93 con FlagOS demuestra que el stack de software puede igualar o superar el rendimiento de la pila nativa, sirviendo como referencia para migrar otros modelos a hardware alternativo.
- Razonamiento cientifico y tecnico: gracias al mecanismo NEG y a la puntuacion en GPQA, el modelo puede utilizarse en tareas de respuesta a preguntas cientificas de alto nivel, como las del dataset GPQA Diamond.
- Desarrollo de agentes conversacionales multilingues: con soporte para cuatro idiomas y una ventana de contexto amplia, el modelo puede alimentar chatbots de atencion al cliente en mercados asiaticos y occidentales.

## Benchmarks y rendimiento

La model card publica los siguientes resultados de evaluacion, comparando la pila original con la pila FlagOS:

| Metrica | Darwin-9B-NEG (pila original) | Darwin-9B-NEG (FlagOS) |
|---|---|---|
| GPQA_Diamond | 0 | 86,93 |
| ERQA | - | - |
| Aime24 | - | - |

El valor de 0 en la pila original es anomalo y probablemente indica que la evaluacion no se ejecuto correctamente, por lo que no debe interpretarse como un rendimiento real. Fuentes externas (openmodelmap) reportan MMLU de 72 y HumanEval de 65 para el modelo base, aunque estos datos no estan confirmados en la model card oficial. No se dispone de comparaciones con otros modelos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: los pesos en safetensors ocupan 19,3 GB, por lo que se requiere al menos 24 GB de VRAM para inferencia en precision FP16 o BF16.
- GPU recomendadas: aceleradores Hygon (no se especifica el modelo concreto); la configuracion de contenedor requiere dispositivos /dev/kfd, /dev/mkfd y /dev/dri, tipicos de GPUs Hygon o AMD.
- No cabe en GPUs de consumo convencionales de 8-12 GB sin cuantizacion; se necesitaria cuantizacion a 8 bits o 4 bits, que no esta disponible en esta version.
- Opciones de despliegue: vLLM (recomendado), Docker con imagen FlagOS, integracion con AnythingLLM.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | HumanEval | Licencia |
|---|---|---|---|---|---|
| Darwin-9B-NEG (esta version) | 9,65B | 32K | 72 (segun fuente externa) | 65 (segun fuente externa) | no disponible |
| Qwen3-8B | 8B | 32K | ~70 (estimado) | ~60 (estimado) | Apache-2.0 |
| Llama-3.1-8B | 8B | 128K | ~66 | ~72 | Llama 3.1 Community License |

Los datos de Qwen3-8B y Llama-3.1-8B son estimaciones orientativas basadas en el conocimiento general, no en la informacion proporcionada. La comparativa exacta no esta disponible en las fuentes consultadas.

## Limitaciones y advertencias

- La licencia de esta version especifica no esta declarada en HuggingFace; aunque el modelo base de ansulev es Apache-2.0, la redistribucion de FlagRelease podria estar sujeta a condiciones adicionales. Verificar antes de uso comercial.
- El dato de GPQA_Diamond de 0 en la pila original es sospechoso y no debe utilizarse como referencia de rendimiento; solo el valor de FlagOS (86,93) parece fiable.
- No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens ni el proceso de alineacion (RLHF/DPO), lo que limita la evaluacion de sesgos y riesgos.
- El modelo esta optimizado para hardware Hygon; su ejecucion en GPUs NVIDIA requeriria la pila original de ansulev, no esta version.
- No se han publicado resultados de benchmarks estandar como MMLU o HumanEval en la model card oficial; los datos externos deben tomarse con cautela.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una publicacion reciente o de nicho sin validacion comunitaria amplia.

## Enlaces

- Repositorio HuggingFace de esta version: https://huggingface.co/FlagRelease/Darwin-9B-NEG-ansulev-hygon-FlagOS
- Modelo original de ansulev: https://huggingface.co/ansulev/Darwin-9B-NEG
- Ficha en Inferix: https://inferix.co/models/ansulev/Darwin-9B-NEG
- Benchmarks y guia de despliegue en OpenModelMap: https://openmodelmap.com/model/ansulev/Darwin-9B-NEG
- Indice en OpenModelIndex: https://omi.solexsis.com/m/ansulev/Darwin-9B-NEG
- Paper referenciado (arXiv:2605.14386): no disponible directamente, mencionado en OpenModelIndex.
