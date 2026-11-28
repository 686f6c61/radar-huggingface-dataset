# hipfire-models/inkling2-mini

## Resumen

Inkling-2-Mini en formato MQ4 XTS es una cuantización de 4 bits del modelo base thinkingmachines/Inkling-2-Mini, publicada por el usuario hipfire-models dentro del ecosistema de inferencia hipfire. No se trata de un modelo original, sino de un artefacto derivado (relación `quantized` respecto al checkpoint de Thinking Machines) empaquetado en el formato propietario MQ4V2 XTS con rotación FWHT y calibración Hessian por experto. El repositorio ocupa 15,2 GB e incluye el artefacto principal de 14,44 GB más un sidecar de borrador especulativo (DSpark) de 739 MB que, según la model card, todavía no puede ejecutarse en hipfire.

El modelo resuelve el problema de desplegar un modelo de la familia Inkling-2 en hardware AMD con aceleración ROCm, ofreciendo una alternativa calibrada al cuantizado RTN uniforme previo (Raufaser/Inkling-2-Mini-hipfire-MQ4). La model card reporta mejoras de KLD del 38,4 % en WikiText-2 y del 37,0 % en code24 frente a esa línea base, con un coste de velocidad de entre el 2,8 % y el 6,6 % en decodificación según contexto. La licencia declarada es Apache-2.0, heredada del modelo base, que añade una Política de Uso Aceptable separada.

La relevancia actual es doble: por un lado, demuestra que la cuantización con calibración por experto (GPTQ Hessian + AWQ) mejora sustancialmente al RTN en modelos con expertos enrutados; por otro, evidencia las limitaciones del ecosistema, ya que estos ficheros solo cargan en compilaciones de hipfire con soporte para Inkling-2 y el loader MQ4 XTS, y no son compatibles con llama.cpp.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con expertos enrutados (MoE), según referencias a "routed experts" y "routers" en la model card; arquitectura exacta no disponible |
| Parámetros totales | no disponible (el repositorio pesa 15,2 GB en cuantización de 4 bits) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (la model card evalúa con chunks de 2048 tokens, pero no declara la ventana máxima) |
| Tipos de cuantización | MQ4V2 XTS simétrico (qt44, 4 bits con rotación FWHT, grupo 256); routers en F16; checkpoint fuente en NVFP4 y MXFP8 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (con Model Acceptable Use Policy adicional del modelo base) |
| Formato de pesos | `.mq4-xts` (propietario de hipfire) y `.hfq` (sidecar DSpark); no compatible con GGUF ni safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE), tal como se deduce de la receta de cuantización, que distingue entre "proyecciones densas" y "expertos enrutados", y mantiene los routers en F16. La model card menciona además una "vision tower" y una "MTP head" (multi-token prediction) en el checkpoint fuente que no se incluyen en esta cuantización, por lo que el artefacto es estrictamente de texto. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base empleó RLHF o DPO.

La innovación técnica de este artefacto es el pipeline de cuantización: MQ4V2 simétrico con rotación FWHT (Fast Walsh-Hadamard Transform) a 4 bits y grupo de 256, con calibración H2 que aplica GPTQ con Hessian por experto y escalado AWQ, resolviendo cada experto contra las activaciones del checkpoint fuente. El cuantizador dequantiza primero los pesos empaquetados en NVFP4 y MXFP8 del original antes de resolver. Los routers se preservan en F16 para no degradar el enrutamiento. Se incluye un sidecar DSpark de decodificación especulativa entrenado contra este fichero, aunque hipfire aún no puede ejecutarlo en Inkling.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation` y la model card describe uso de generación de un solo flujo.
- Modelo de texto únicamente: la vision tower del checkpoint fuente no está incluida, por lo que no hay capacidades de visión.
- Razonamiento multi-paso: el modelo base pertenece a la familia Inkling-2, pero la model card no detalla capacidades específicas de razonamiento.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el campo de idiomas no está poblado.
- Decodificación especulativa: existe un sidecar DSpark publicado, pero hipfire no puede ejecutarlo sobre Inkling todavía y el registro no lo declara.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en GPU AMD con ROCm: el artefacto está calibrado y validado en una Radeon AI PRO R9700 (gfx1201), por lo que encaja en estaciones de trabajo con aceleradores AMD donde no se quiere depender de CUDA.
- Generación de texto en un solo flujo con modelo totalmente residente en memoria: la model card indica soporte para "single-stream generation, fully resident", adecuado para asistentes interactivos de baja concurrencia.
- Evaluación de calidad de cuantización: sirve como referencia calibrada frente al RTN para medir el impacto de GPTQ+AWQ por experto en modelos MoE, con métricas KLD reproducibles (streams idénticos byte a byte en tres ejecuciones).
- Prototipado de pipelines de código: la mejora de KLD del 37 % en el corpus code24 sugiere menor degradación en tareas de programación respecto al cuantizado uniforme, útil para autocompletado o generación de fragmentos en entornos de desarrollo.
- Investigación sobre decodificación especulativa: el sidecar DSpark permite estudiar el entrenamiento de borradores contra un cuantizado concreto, aunque su ejecución aún no esté soportada.
- Despliegue en el ecosistema hipfire: integrable mediante `hipfire pull inkling2:mini` y `hipfire run`, lo que facilita flujos de trabajo reproducibles con artefactos versionados por SHA-256.
- Benchmarking de hardware AMD: los ratios de velocidad publicados (1,066 en decode a 128 tokens, 1,028 a 2048) permiten comparar el rendimiento de distintas GPUs gfx12xx con una carga de referencia.

## Benchmarks y rendimiento

La model card no publica benchmarks de tareas (MMLU, HumanEval, GSM8K), sino métricas de calidad de cuantización (KLD pareado contra el checkpoint fuente NVFP4/MXFP8 como profesor, 24 chunks de 2048 tokens) y de velocidad relativa frente al RTN.

| Métrica | RTN (`inkling2-mini-mq4.hfq`) | Este fichero | Cambio |
|---|---:|---:|---:|
| KLD WikiText-2 | 0,032794 | 0,020197 | −38,4 % |
| KLD code24 | 0,022878 | 0,014402 | −37,0 % |

| Medición de velocidad (ratio vs RTN) | Valor |
|---|---:|
| Decode, contexto de 128 tokens | 1,066 |
| Decode, contexto de 2048 tokens | 1,028 |
| Prefill, 128 tokens | 1,031 |
| Prefill, 2048 tokens | 1,031 |

Todos los chunks puntúan mejor que el RTN en ambos corpus y los intervalos de confianza al 95 % de las diferencias pareadas excluyen el cero. No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM estimada: el artefacto principal pesa 14,44 GB, por lo que se necesita al menos ~15 GB de memoria para carga completa; la model card indica generación "fully resident", sin offloading.
- GPU validadas: AMD Radeon AI PRO R9700 (gfx1201) es la única mencionada explícitamente en las pruebas de calidad y velocidad.
- GPU recomendadas: no disponible más allá de la R9700; el stack requiere ROCm y compilaciones de hipfire con soporte para Inkling-2 y el loader MQ4 XTS.
- GPU de consumo: no disponible; no se confirma compatibilidad con GPUs de consumo, y el tamaño de 14,44 GB descarta tarjetas con menos de 16 GB.
- Opciones de despliegue: exclusivamente hipfire (comandos `hipfire pull` y `hipfire run`); llama.cpp no puede leer estos ficheros y no se mencionan vLLM, TGI, Ollama ni otros motores.
- Latencia y throughput: no se publican valores absolutos; solo ratios relativos al RTN (decode 1,028–1,066×, prefill 1,031×). Sin soporte de batching multi-slot ni pipeline split.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad (KLD WikiText-2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hipfire-models/inkling2-mini (este) | no disponible | no disponible | 0,020197 | Apache-2.0 | hipfire únicamente |
| Raufaser/Inkling-2-Mini-hipfire-MQ4 (RTN) | no disponible | no disponible | 0,032794 | Apache-2.0 (heredada) | hipfire únicamente |
| thinkingmachines/Inkling-2-Mini (original) | no disponible | no disponible | referencia (profesor) | Apache-2.0 + AUP | Hugging Face, pesos NVFP4/MXFP8 |

No se dispone de información sobre otros modelos comparables de la misma categoría (mismo tamaño o tarea) en la documentación proporcionada.

## Limitaciones y advertencias

- Compatibilidad restringida: los ficheros solo cargan en compilaciones de hipfire con soporte para Inkling-2 y el loader MQ4 XTS; llama.cpp no puede leerlos.
- Sin batching ni paralelismo: la model card limita el uso a generación de un solo flujo, totalmente residente, sin especulación y sin pipeline split, lo que descarta despliegues de alta concurrencia.
- Sidecar DSpark no funcional: el borrador especulativo se publica como fichero, pero hipfire no puede ejecutarlo sobre Inkling y el registro no lo descarga con `hipfire pull`.
- Solo texto: la vision tower y la MTP head del checkpoint fuente no están incluidas, por lo que se pierden capacidades del modelo original.
- Riesgo de alucinación: no cuantificado en la información disponible; la model card solo reporta KLD frente al profesor, no evaluaciones de fidelidad factual.
- Sesgos: no disponibles; no se documentan evaluaciones de sesgo ni de seguridad.
- Idiomas: el campo de idiomas no está poblado, por lo que no se puede garantizar cobertura multilingüe.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo base de Thinking Machines añade una Model Acceptable Use Policy separada que debe respetarse; los autores del cuantizado no reclaman derechos sobre los pesos.
- Reproducibilidad: el artefacto se identifica por SHA-256, lo que permite verificar integridad, pero la ausencia de benchmarks de tareas dificulta estimar el rendimiento real en producción.
- Metadatos incompletos: parámetros totales, activos, contexto máximo y arquitectura exacta no están disponibles, lo que complica la planificación de capacidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hipfire-models/inkling2-mini
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio hipfire: https://github.com/warpfront/hipfire
- Documento de prior art de hipfire: https://github.com/warpfront/hipfire/blob/master/PRIOR-ART.md
- Model Acceptable Use Policy de Thinking Machines: https://thinkingmachines.ai/model-acceptable-use-policy/
- Cuantizado RTN de referencia: https://huggingface.co/Raufaser/Inkling-2-Mini-hipfire-MQ4
