# francesca9805/ppt-wc-uniform-newlex-isl-before-100mb-packed-bfd_seed3407

## Resumen

`francesca9805/ppt-wc-uniform-newlex-isl-before-100mb-packed-bfd_seed3407` es un ajuste fino (SFT) del modelo base `goldfish-models/eng_latn_100mb`, un transformer decoder-only de tipo GPT-2 con 86.508.288 parámetros (según los pesos en safetensors del repositorio). Lo publica el usuario `francesca9805`, vinculado a la Universidad de Groningen según la traza de Weights & Biases incluida en la model card, y está entrenado con la librería TRL 0.23.0 sobre Transformers 4.56.2.

El nombre del repositorio y de la ejecución de W&B (`new-tokenizers`) apuntan a un experimento de investigación sobre tokenización y tamaño de léxico, sobre corpus empaquetados (`packed`) de menos de 100 MB y con semilla fija (`seed3407`), más que a un modelo orientado a producción. El modelo se distribuye con el pipeline `text-generation` y es compatible con endpoints de text-generation-inference, pero no tiene descargas ni valoraciones y su model card no documenta dataset, licencia ni idiomas.

Su relevancia es, por tanto, metodológica y de reproducibilidad: sirve como punto de comparación controlado en estudios de tokenizadores y como base mínima para probar flujos de SFT con TRL. No debe considerarse un modelo listo para despliegues comerciales dado el estado incompleto de su documentación y de su licencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (etiqueta `gpt2` en el repositorio) |
| Parametros totales | 86.508.288 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No se publican pesos cuantizados; al ser safetensors en fp32/fp16 es convertible a int8 e int4, y a GGUF mediante herramientas externas |
| Idiomas soportados | No disponible de forma explicita; el modelo base es `goldfish-models/eng_latn_100mb` (ingles, escritura latina, 100 MB de corpus) |
| Licencia | No disponible (la model card solo contiene el marcador `licence: license`, sin texto legal) |
| Formato de pesos | safetensors (libreria `transformers`); tamano de repositorio 0.2 GB |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only de la familia GPT-2, con atención causal completa y sin componentes MoE ni SSM. El recuento de 86,5 millones de parámetros es coherente con un GPT-2 de tamano reducido y vocabulario recortado respecto a los 50.257 tokens del GPT-2 original, algo esperable en un experimento centrado en tokenizadores. No se dispone de información sobre número de capas, dimensión oculta, número de cabezas ni longitud de contexto máxima; tampoco sobre si las embeddings están atadas a la capa de salida.

El entrenamiento se realizó mediante SFT con TRL, partiendo de `goldfish-models/eng_latn_100mb`. El autor documenta el flujo conversacional (el ejemplo de uso pasa una lista de mensajes con rol `user`) y las versiones del entorno: TRL 0.23.0, Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1, con seguimiento en Weights & Biases. No se especifican el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF o DPO, ni hiperparámetros como learning rate, scheduler o número de épocas. Tampoco se describe ninguna innovación técnica adicional como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto autoregresiva en formato de chat básico: el ejemplo oficial construye el prompt como lista de mensajes con rol `user`.
- Ajuste por instrucciones mediante SFT con TRL, orientado a respuestas de hasta 128 tokens nuevos en el ejemplo publicado.
- Compatibilidad con `transformers.pipeline("text-generation")` y con text-generation-inference, lo que permite servirlo tras una API HTTP compatible con el esquema de endpoints.
- Generación en inglés (idioma del corpus base `eng_latn_100mb`), aunque el autor no declara la lista de idiomas soportados.
- No hay evidencia publicada de soporte de tool calling o function calling.
- No hay evidencia publicada de capacidades de agente, razonamiento multi-paso o modo de pensamiento explícito.
- No hay evidencia de capacidades de visión, audio ni multimodalidad.
- No hay evidencia de rendimiento específico en código o matemáticas.

## Casos de uso

- Reproducción de experimentos de tokenización: el nombre del repositorio y la ejecución de W&B (`new-tokenizers`) sugieren que el modelo forma parte de una comparativa de léxicos; puede usarse como una de las condiciones del experimento para medir el efecto del tokenizador en la pérdida y en la calidad del texto generado.
- Línea base de bajo coste en investigación de SFT: con 86,5 M de parámetros se puede entrenar y evaluar en una sola GPU consumer en minutos u horas, sirviendo de control frente a modelos mayores en estudios sobre datos, semillas o recetas de ajuste.
- Pruebas de integración y CI de pipelines de generación: al pesar 0,2 GB, es viable descargarlo, cargarlo y ejecutar aserciones sobre la API de `transformers` o de text-generation-inference dentro de un flujo de integración continua, sin depender de hardware especializado.
- Prototipado de interfaces conversacionales: el formato de mensajes con rol `user` permite montar una demo de chat local para validar prompts, plantillas y lógica de turnos antes de sustituir el modelo por uno mayor.
- Generación de texto sintético para aumentar datos de entrenamiento o para pruebas de carga de sistemas posteriores (por ejemplo, rellenar colas de mensajes en un test de integración), aceptando que la calidad será limitada y requerirá filtrado manual.
- Despliegue en entornos con recursos muy restringidos: por su tamano, puede ejecutarse en CPU, en una Raspberry Pi o en GPUs de gama de entrada, útil para demos educativas o talleres donde no hay aceleradores disponibles.
- Estudio de sesgos y de comportamiento de modelos pequeños: sirve como sujeto de análisis en trabajos sobre degradación gramatical, repetición y fidelidad factual en modelos por debajo de los 100 M de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye tablas de MMLU, HumanEval, GSM8K, perplexity ni ninguna otra métrica de evaluación, y no se ha publicado ninguna evaluación externa del modelo.

## Requisitos de hardware

- Peso de los pesos en disco: 0,2 GB de repositorio; en memoria, aproximadamente 350 MB en fp32, 175 MB en fp16/bf16, 87 MB en int8 y 45 MB en int4.
- VRAM estimada para inferencia: por debajo de 1 GB con batch pequeno y contexto corto, sumando pesos, activaciones y caché KV; 2-4 GB de VRAM son suficientes con margen para lotes mayores.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM sirve, incluidas GTX 1050 Ti, GTX 1650, RTX 3050, RTX 3060, RTX 4090, A100 y H100; en la practica el modelo está limitado por la CPU y por el ancho de banda del bus, no por la capacidad de cómputo.
- Cabe en GPU consumer: sí, en la practica totalidad de las GPU consumer de los últimos diez años; también se ejecuta en CPU sin acelerador.
- Opciones de despliegue: `transformers` con `pipeline` o `generate`, text-generation-inference (etiqueta presente en el repositorio), vLLM, y llama.cpp u Ollama previa conversión a GGUF, formato que no se distribuye en el repositorio.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Los datos de los modelos de referencia proceden de fuentes públicas y no de la información proporcionada para este modelo; se marcan como referencia orientativa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ppt-wc-uniform-newlex-isl-before-100mb-packed-bfd_seed3407 | 86.508.288 | No disponible | No disponible (marcador `license` sin texto) | HuggingFace, 0 descargas y 0 likes |
| goldfish-models/eng_latn_100mb (modelo base) | No disponible | No disponible | No disponible | HuggingFace, modelo base del ajuste |
| gpt2 (OpenAI) | 124 M aprox. | 1024 tokens | MIT (referencia externa) | HuggingFace, ampliamente desplegado |
| distilgpt2 (HuggingFace) | 82 M aprox. | 1024 tokens | Apache-2.0 (referencia externa) | HuggingFace, muy usado como linea base |
| pythia-70m (EleutherAI) | 70 M aprox. | 2048 tokens | Apache-2.0 (referencia externa) | HuggingFace, con evaluaciones publicadas |

El modelo aquí descrito no aporta resultados de evaluación que permitan compararlo en calidad con estas alternativas; su interés es exclusivamente experimental y su ventaja frente a ellas es el encaje exacto con la receta de SFT y tokenizador del estudio del que procede.

## Limitaciones y advertencias

- Licencia no resuelta: la model card contiene únicamente `licence: license`, un marcador sin contenido legal, por lo que no se puede asumir permiso de uso comercial ni siquiera de redistribución.
- Ausencia de evaluación: no hay benchmarks, métricas de perplejidad ni revisiones externas; se desconoce su comportamiento real frente al modelo base.
- Riesgo elevado de alucinación: con 86,5 M de parámetros y un corpus base de 100 MB, la fidelidad factual y la coherencia a partir de unos cientos de tokens serán limitadas, con tendencia a la repetición y a derivas temáticas.
- Idiomas: solo hay indicios de inglés, derivados del corpus base `eng_latn_100mb`; no hay ningún idioma declarado y es previsible un rendimiento muy bajo en castellano.
- Contexto desconocido: no se documenta la longitud de contexto entrenada, por lo que usar ventanas largas puede degradar la salida sin aviso.
- Sin soporte declarado de tool calling, agentes ni razonamiento multi-paso: no conviene integrarlo en flujos que dependan de estas capacidades.
- Documentación incompleta: no se detallan dataset, hiperparámetros ni composición de los datos, lo que impide auditar sesgos o reproducir el entrenamiento.
- Metadatos poco fiables: el repositorio tiene 0 descargas y 0 likes, y la licencia y los idiomas figuran como no disponibles, señales habituales de un artefacto de investigación sin mantenimiento.
- No apto para producción sin revisión previa: cualquier uso en un sistema real exige validación propia de calidad, seguridad y encaje legal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/ppt-wc-uniform-newlex-isl-before-100mb-packed-bfd_seed3407
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/4qcitndl
- Repositorio de TRL: https://github.com/huggingface/trl
- Cita de TRL (BibTeX incluida en la model card): von Werra et al., 2020, GitHub repository.
