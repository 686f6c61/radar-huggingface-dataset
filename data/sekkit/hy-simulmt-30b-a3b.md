# sekkit/Hy-SimulMT-30B-A3B

## Resumen

Hy-SimulMT-30B-A3B es un modelo de traducción simultánea en tiempo real desarrollado por Tencent Hunyuan, publicado en Hugging Face bajo el identificador `sekkit/Hy-SimulMT-30B-A3B`. Su propósito es la traducción bidireccional chino-inglés en modalidad voz a voz, recibiendo audio de forma continua y generando texto traducido y voz sintetizada a medida que el hablante habla, con clonación de voz en tiempo real para preservar las características vocales del orador. Está diseñado para escenarios de comunicación en vivo como reuniones, conferencias y entrevistas.

El modelo emplea una arquitectura de tipo Mixture of Experts (MoE) con 30.394.794.496 parámetros totales, según los pesos en safetensors, y una nomenclatura "A3B" que sugiere aproximadamente 3 mil millones de parámetros activos por token, aunque este dato no se confirma explícitamente en la información disponible. La longitud de contexto, los tipos de cuantización y otros detalles técnicos no están especificados en la model card proporcionada.

La relevancia del modelo radica en su enfoque en el equilibrio entre calidad de traducción y latencia: en la evaluación de audio largo RealSI, alcanza un StreamLAAL de aproximadamente 3 segundos, el más bajo entre los sistemas comparados, con una puntuación GEMBA superior a la de los modelos de código abierto comparados y a cuatro de las cinco APIs comerciales. Se distribuye bajo licencia Apache 2.0 y soporta 35 idiomas según los metadatos, aunque la funcionalidad principal descrita es la traducción bidireccional chino-inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), segun nomenclatura A3B; detalles no disponibles |
| Parametros totales | 30.394.794.496 |
| Parametros activos | no disponible (la nomenclatura A3B sugiere ~3B, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | zh, en, fr, pt, es, ja, tr, ru, ar, ko, th, it, de, vi, ms, id, tl, hi, pl, cs, nl, km, my, fa, gu, ur, te, mr, he, bn, ta, uk, bo, kk, mn, ug (35 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La información disponible indica que Hy-SimulMT emplea una arquitectura de tipo Mixture of Experts, inferida de la nomenclatura "A3B" en el nombre del modelo y del recuento total de parámetros (30.394.794.496). No se detalla en la model card la composición exacta del transformer, el número de expertos, la estrategia de enrutamiento ni si incorpora mecanismos de atención lineal o decodificación especulativa. El modelo está orientado a la traducción simultánea de flujo continuo de audio, lo que implica procesamiento incremental del habla y generación de traducción a medida que llega la señal.

En cuanto al entrenamiento, la model card no especifica el número de tokens utilizados, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras. Se menciona la existencia de herramientas de entrenamiento (SimulTrain) en el repositorio de GitHub, pero no se aportan detalles sobre el proceso de entrenamiento del modelo publicado. La evaluación se realizó sobre benchmarks públicos de audio corto (FLEURS, CoVoST2, ACL6060, RealSI-Sentence) y sobre el benchmark de audio largo RealSI, con métricas GEMBA y StreamLAAL.

## Capacidades

- Traducción simultánea bidireccional chino-inglés en modalidad voz a voz, con recepción continua de audio y generación de texto y voz traducidos en tiempo real.
- Clonación de voz en tiempo real que preserva las características vocales del hablante durante la traducción.
- Generación de texto traducido y salida de voz sintetizada (la salida de voz requiere un servicio TTS configurado).
- Soporte declarado de 35 idiomas en los metadatos del modelo (zh, en, fr, pt, es, ja, tr, ru, ar, ko, th, it, de, vi, ms, id, tl, hi, pl, cs, nl, km, my, fa, gu, ur, te, mr, he, bn, ta, uk, bo, kk, mn, ug), aunque la funcionalidad principal documentada es chino-inglés.
- Orientación a escenarios de comunicación en vivo: reuniones, discursos y entrevistas.
- Inferencia mediante el servicio SimulInfer proporcionado en el repositorio de GitHub.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y librería transformers.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada más allá del flujo de traducción, ni modo de pensamiento (thinking mode).

## Casos de uso

- Interpretación simultánea en reuniones internacionales chino-inglés: el modelo recibe el audio en streaming y genera traducción de voz con latencia de aproximadamente 3 segundos (StreamLAAL), adecuado para mantener el ritmo de una conversación sin esperas prolongadas.
- Conferencias y discursos en vivo: al procesar audio largo de forma continua, permite a la audiencia recibir la traducción a medida que el ponente habla, reduciendo la disrupción que introduce la espera en la comunicación.
- Entrevistas y ruedas de prensa bilingües: la clonación de voz en tiempo real preserva las características del hablante, lo que resulta útil cuando se quiere mantener la identidad vocal del orador en la traducción.
- Atención al cliente multilingüe en tiempo real: integrado mediante el servicio SimulInfer, puede gestionar conversaciones de voz en vivo entre agentes y clientes que hablan chino e inglés, con salida de texto y voz.
- Accesibilidad en eventos presenciales: traducción de voz a voz en directo para asistentes que no dominan el idioma del ponente, con la ventaja de una latencia baja que facilita el seguimiento.
- Investigación en traducción simultánea: el repositorio proporciona las herramientas SimulTrain y SimulInfer, lo que permite reproducir experimentos, evaluar con los benchmarks RealSI y FLEURS/CoVoST2, y adaptar el modelo a otros pares de idiomas.
- Despliegue en aplicaciones móviles de traducción: la existencia de la Hy Translate App (Android/iOS) sugiere su uso en escenarios de traducción personal en movilidad, aunque los detalles de integración no se especifican.

## Benchmarks y rendimiento

La model card reporta resultados en cuatro benchmarks de audio corto (puntuaciones más altas son mejores) y en el benchmark de audio largo RealSI (GEMBA frente a StreamLAAL).

| API / Modelo | FLEURS | CoVoST2 | ACL6060 | RealSI-Sentence |
|---|---:|---:|---:|---:|
| Qwen3.8-LiveTranslate | 88.4 | **82.1** | 80.5 | 84.4 |
| **Hy-SimulMT** | **90.3** | **75.5** | **81.2** | **84.7** |
| Gemini3.5-LiveTranslate | **92.4** | 74.4 | **82.6** | 82.2 |
| Confucius4 R2T2 → T3PO | 89.4 | 76.8 | 76.1 | 77.7 |
| Seed-LiveInterpret2.0 | 85.8 | 67.7 | 74.8 | 80.0 |
| SimulS2ST-Omni | 78.6 | 66.6 | 73.1 | 77.4 |
| GPT-Realtime-Translate | 77.7 | 50.8 | 76.4 | 76.7 |
| XunFei-Simult-Interpretation | 73.4 | 57.0 | 57.5 | 70.9 |
| SeamlessStreaming | 72.8 | 60.9 | 49.8 | 56.9 |

En la evaluación de audio largo RealSI, Hy-SimulMT alcanza un StreamLAAL de aproximadamente 3 segundos, el más bajo entre los sistemas mostrados, y su puntuación GEMBA supera a la de los modelos de código abierto comparados y a cuatro de las cinco APIs comerciales. No se proporcionan en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de razonamiento general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 30.394.794.496 parámetros totales y pesos en safetensors (tamaño del repo 60,8 GB), la inferencia en precisión completa requeriría al menos ~61 GB de VRAM solo para los pesos, sin contar activaciones ni caché; no se confirman cuantizaciones ni requisitos oficiales.
- GPU recomendadas: no disponible. Por el tamaño de los pesos, sería necesario hardware de clase数据中心 (por ejemplo, A100 80 GB, H100) en precisión completa; no se especifican GPUs validadas.
- ¿Cabe en GPU de consumo? No disponible. El tamaño del repo (60,8 GB) hace improbable que quepa en GPUs de consumo de 24 GB sin cuantización, pero no se documentan opciones de cuantización.
- Opciones de despliegue: servicio SimulInfer (proporcionado en el repositorio de GitHub) para inferencia de traducción simultánea; compatible con transformers y endpoints. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: se reporta un StreamLAAL de aproximadamente 3 segundos en RealSI para audio largo; no se proporcionan cifras de throughput (tokens/s) ni de latencia de primera salida de voz.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | FLEURS | CoVoST2 | ACL6060 | RealSI-Sentence | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|---|
| **Hy-SimulMT** | 30,39B totales (MoE, ~3B activos según nomenclatura) | no disponible | 90.3 | 75.5 | 81.2 | 84.7 | Apache 2.0 | Hugging Face, ModelScope, GitHub |
| Qwen3.8-LiveTranslate | no disponible | no disponible | 88.4 | 82.1 | 80.5 | 84.4 | no disponible | API comercial |
| Gemini3.5-LiveTranslate | no disponible | no disponible | 92.4 | 74.4 | 82.6 | 82.2 | no disponible | API comercial |
| Seed-LiveInterpret2.0 | no disponible | no disponible | 85.8 | 67.7 | 74.8 | 80.0 | no disponible | no disponible |
| SeamlessStreaming | no disponible | no disponible | 72.8 | 60.9 | 49.8 | 56.9 | no disponible | open source (Meta) |

Hy-SimulMT destaca por su baja latencia (StreamLAAL ~3 s) y por superar en GEMBA a los modelos open source comparados y a cuatro de las cinco APIs comerciales en la evaluación RealSI de audio largo. En FLEURS obtiene 90.3, por debajo de Gemini3.5-LiveTranslate (92.4) pero por encima de Qwen3.8-LiveTranslate (88.4); en CoVoST2 obtiene 75.5, por debajo de Qwen3.8 (82.1) y Confucius4 (76.8). No se dispone de datos de parámetros ni contexto de los competidores en la información proporcionada.

## Limitaciones y advertencias

- La funcionalidad principal documentada es la traducción bidireccional chino-inglés; aunque los metadatos listan 35 idiomas, no se confirma el rendimiento en el resto de pares de idiomas.
- La salida de voz y la clonación de voz requieren un servicio TTS configurado; sin él, el modelo no produce audio traducido.
- No se documentan sesgos conocidos, pero al ser un modelo de traducción entrenado con datos no especificados, puede heredar sesgos presentes en los corpus de entrenamiento.
- Riesgo de alucinación en traducción: no se reportan métricas específicas de fidelidad semántica más allá de GEMBA; en audio largo, la latencia baja puede implicar compromisos en la resolución de ambigüedades.
- No se especifican la longitud de contexto ni los tipos de cuantización, lo que limita la planificación de despliegue en producción.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las dependencias del servicio TTS y del repositorio SimulInfer, que pueden tener licencias distintas.
- El modelo tiene 29 descargas y 0 likes en el momento de la ficha, lo que indica una adopción aún muy limitada y poca validación comunitaria.
- No se han publicado resultados de benchmarks de razonamiento general (MMLU, HumanEval, GSM8K) en la información disponible; el modelo está especializado en traducción simultánea, no en tareas generales de lenguaje.
- La fecha de creación indicada (2026-10-26) y las referencias a versiones de modelos como "Gemini3.5" o "Qwen3.8" en los benchmarks deben tomarse como datos tal cual aparecen en la model card, sin verificación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/sekkit/Hy-SimulMT-30B-A3B
- Colección Tencent Hy en Hugging Face: https://huggingface.co/collections/tencent/hy-simulmt
- ModelScope: https://www.modelscope.cn/collections/Tencent-Hunyuan/Hy-SimulMT
- GitHub (SimulInfer y SimulTrain): https://github.com/Tencent-Hunyuan/Hy-SimulMT
- README en chino: README_CN.md (referenciado en la model card)
