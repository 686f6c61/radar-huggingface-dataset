# patrickbdevaney/GLM-5.3-Flash-REAP50-NVFP4-v2

## Resumen

GLM-5.3-Flash-REAP50-NVFP4-v2 es una versión podada y cuantizada del modelo multimodal `zai-org/GLM-5.3-Flash`, publicada por el usuario patrickbdevaney. Se trata de un derivado de la familia GLM-5.3 orientado a inferencia en dispositivos con 128 GB de memoria unificada, construido específicamente para una NVIDIA Jetson AGX Thor. El autor aplica una poda de expertos del 50 % (REAP, *Router-weighted Expert Activation Pruning*) sobre las capas MoE del modelo base y almacena los expertos en NVFP4 con cuantización solo de pesos.

El modelo conserva 144 de los 288 expertos enrutados de cada capa MoE, mantiene el enrutamiento top-8 y el experto compartido original, y añade el bloque MTP (multi-token prediction) también podado. El resultado ocupa 98,2 GiB en disco y conserva una longitud de contexto de 1.048.576 tokens, aunque la calibración se hizo con secuencias de 2.048 tokens. La arquitectura subyacente es híbrida: 45 capas de decodificador, de las cuales 34 son de atención lineal KDA y 11 son MLA con atención dispersa DSA, más una torre de visión de 24 bloques.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de compresión agresiva (poda de expertos más cuantización FP4) aplicada a un modelo de 321.300 millones de parámetros. Por otro, la propia model card incluye una actualización de evaluación de noviembre de 2026 que degrada seriamente las expectativas: el modelo conserva el 94,8 % de la puntuación en HumanEval+, pero agota el límite de tokens en el 44-72 % de las peticiones de conocimiento general, con MMLU-Pro de 44 frente a 84 sobre 100 del modelo sin podar. El autor recomienda, para uso general en 128 GB, el GGUF `UD-Q2_K_XL` sin podar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Glm5NextForConditionalGeneration` (`glm5_next`): 45 capas de decodificador, 34 capas de atención lineal KDA y 11 capas MLA con atención dispersa DSA; capas 0-2 con MLP denso, capas 3-44 MoE; torre de visión de 24 bloques; tamaño oculto 4096 |
| Parametros totales | 165.470.880.558 (165,5 B) según safetensors; el recuento del Hub cuenta bytes empaquetados, no pesos |
| Parametros activos | no disponible (el autor no los calculó); enrutamiento top-8 con 1 experto compartido |
| Longitud de contexto | 1.048.576 tokens (`max_position_embeddings`, sin cambios respecto al base); calibración con secuencias de 2.048 tokens |
| Tipos de cuantizacion | NVFP4 solo de pesos (grupo de 16, escalas de grupo FP8 E4M3, escala global F32) en expertos enrutados y compartidos, incluido el bloque MTP; BF16 en atención KDA y MLA, indexador DSA, capas densas 0-2, routers, embeddings, `lm_head`, torre de visión e hiperconexiones; F32 en tensores de estado pequeños; sin escalas de activación ni `input_scale` |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | safetensors con `compressed-tensors`, esquema `nvfp4-pack-quantized`; 62 shards; 98,2 GiB (105.393.931.276 bytes) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash emplea una arquitectura híbrida de atención: 34 de sus 45 capas usan KDA (atención lineal), mientras que 11 capas usan MLA con atención dispersa DSA, lo que reduce el coste computacional del contexto largo. Las capas 0-2 mantienen un MLP denso y las capas 3-44 son MoE con 288 expertos enrutados, enrutamiento top-8 y un experto compartido. Se incluye un bloque MTP como capa 45 para decodificación especulativa. El modelo es multimodal, con una torre de visión de 24 bloques que habilita la tarea `image-text-to-text`.

Sobre el proceso de compresión: el autor aplica REAP (*Router-weighted Expert Activation Pruning*) en una segunda pasada (pass-2), conservando 144 de 288 expertos por capa. La selección se complementa con un *healing* mediante un escalar por capa medido empíricamente, que corrige la deriva introducida por la poda. El bloque MTP también se poda a 144 expertos (`num_nextn_predict_layers: 1`). La cuantización NVFP4 es solo de pesos y no incluye escalas de activación, lo que simplifica el despliegue pero limita el ajuste fino de calibración. No se documentan en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO).

Existe una tercera pasada experimental (v3, en la subcarpeta `pass3-hope/`) que usa selección HOPE con un suelo de dominio (`protect_frac` 0,04), pero el autor advierte de dos defectos de construcción: el *healing* usó el estimador de reserva (primer momento) en lugar del medido, y la build NVFP4 de v3 cuantiza además las proyecciones q/k/v de KDA (102 tensores), lo que reduce el tamaño a 93,6 GiB. No ha sido evaluada y no debe tratarse como una mejora.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte de contexto de hasta 1.048.576 tokens.
- Procesamiento de imagen y texto (`image-text-to-text`): la torre de visión de 24 bloques se mantiene en BF16, sin cuantizar.
- Generación de código: conserva el 94,8 % de la puntuación de HumanEval+ del modelo sin podar en generación emparejada.
- Razonamiento y conocimiento general: capacidad severamente degradada tras la poda; el modelo agota el límite de tokens en el 44-72 % de las peticiones de conocimiento general e instrucciones.
- Decodificación especulativa mediante el bloque MTP (multi-token prediction), presente y podado a 144 expertos.
- Atención lineal KDA y atención dispersa DSA para eficiencia en contextos largos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo *thinking* explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistencia de código en dispositivos edge: el modelo conserva el 94,8 % del rendimiento en HumanEval+ del modelo sin podar, por lo que puede emplearse para autocompletado, generación de funciones y revisión de código en una Jetson AGX Thor o en cualquier dispositivo con 128 GB de memoria unificada, sin depender de la nube.
- Despliegue en estaciones de trabajo con una sola GPU de 128 GB: al ocupar 98,2 GiB, cabe en una GPU profesional de gran memoria o en un sistema de memoria unificada, lo que permite servir un modelo de 165,5 B de parámetros en una sola máquina.
- Procesamiento de documentos con imagen y texto: la torre de visión en BF16 permite extraer información de capturas, formularios o diagramas y combinarla con texto en la misma ventana de contexto de 1 M de tokens.
- Análisis de repositorios completos: la ventana de 1.048.576 tokens permite cargar árboles de código extensos y hacer preguntas sobre ellos en una sola pasada, aprovechando las capas de atención lineal KDA para reducir el coste del contexto largo.
- Prototipado e investigación sobre poda de expertos: el repositorio documenta con detalle las tres pasadas de selección (v1, v2, v3), las métricas de acuerdo top-1 y los artefactos de *healing*, lo que lo convierte en material de referencia para estudiar el impacto de REAP y HOPE en modelos MoE multimodales.
- Evaluación comparativa de cuantización FP4: al existir una versión hermana en FP8 (160,6 GiB) con el mismo conjunto de expertos, permite medir en condiciones controladas la pérdida de calidad atribuible a NVFP4 frente a FP8.
- Inferencia en entornos con restricciones de memoria y sin conectividad: el formato `compressed-tensors` y la licencia MIT facilitan el despliegue en hardware propio para casos de privacidad de datos.

No se recomienda su uso para atención al cliente automatizada, asistentes de conocimiento general ni tareas de instrucción abierta, dado que el propio autor documenta que agota el límite de tokens en la mayoría de esas peticiones.

## Benchmarks y rendimiento

| Metrica | Resultado | Referencia |
|---|---|---|
| Acuerdo top-1 con el modelo sin podar (241.516 tokens reservados, *teacher-forced*) | 0,8386 | Modelo sin podar = 1,0 |
| HumanEval+ (generación emparejada) | 94,8 % de la puntuación del modelo sin podar | Modelo sin podar |
| MMLU-Pro | 44 / 100 | 84 / 100 del modelo sin podar |
| Peticiones que agotan el límite de tokens (conocimiento general e instrucciones) | 44-72 % | Modelo sin podar |
| Acuerdo top-1 de la versión FP8 hermana (v2) | 0,8425 | Modelo sin podar = 1,0 |

No se han publicado resultados de MMLU, GSM8K ni otros benchmarks estándar en la información disponible. La comparación con el GGUF `UD-Q2_K_XL` sin podar (101 GiB) es cualitativa: el autor indica que midió mejor para uso general en 128 GB, pero no aporta cifras.

## Requisitos de hardware

- VRAM/memoria estimada: 98,2 GiB de pesos en disco; se requiere un dispositivo con al menos 128 GB de memoria unificada o VRAM para acomodar pesos y estados de inferencia con holgura.
- GPU recomendadas: NVIDIA Jetson AGX Thor (plataforma de construcción y prueba del autor); cualquier GPU o sistema con 128 GB de memoria, como GPUs profesionales de gran capacidad.
- Cabe en GPU de consumo: no. Ninguna GPU de consumo actual (RTX 4090 con 24 GB, RTX 5090 con 32 GB) dispone de memoria suficiente para los 98,2 GiB de pesos.
- Opciones de despliegue: `transformers` con soporte de `compressed-tensors` (librería declarada); el autor publica builds GGUF para llama.cpp en el repositorio `GLM-5.3-Flash-REAP50-GGUF`. Soporte de vLLM, TGI u Ollama: no disponible en la información proporcionada.
- Latencia y throughput: no disponibles. El bloque MTP habilita decodificación especulativa, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Notas |
|---|---|---|---|---|---|
| GLM-5.3-Flash-REAP50-NVFP4-v2 (este) | 165,5 B (podado al 50 % de expertos) | 1.048.576 | NVFP4, 98,2 GiB | MIT | Top-1 0,8386; MMLU-Pro 44; HumanEval+ al 94,8 % |
| GLM-5.3-Flash-REAP50-FP8-v2 | 165,5 B (mismo conjunto de expertos) | 1.048.576 | FP8, 160,6 GiB | MIT | Top-1 0,8425; recomendado como maestro cuando la memoria lo permite |
| zai-org/GLM-5.3-Flash (base) | 321,3 B | 1.048.576 | FP8, 305,8 GiB | MIT | Sin podar; referencia de calidad (MMLU-Pro 84) |
| unsloth/GLM-5.3-Flash-GGUF (`UD-Q2_K_XL`) | 321,3 B (cuantizado, sin podar) | 1.048.576 | GGUF, 101 GiB | MIT | Medido mejor que este modelo para uso general en 128 GB según el autor |

## Limitaciones y advertencias

- Degradación severa en conocimiento general e instrucciones: MMLU-Pro cae de 84 a 44 sobre 100 y el modelo agota el límite de tokens en el 44-72 % de esas peticiones. No es apto para uso general conversacional.
- El propio autor recomienda, para uso general en 128 GB, el GGUF `UD-Q2_K_XL` sin podar (101 GiB) antes que este checkpoint.
- La poda elimina el 50 % de los expertos enrutados; el acuerdo top-1 de 0,8386 implica que aproximadamente 1 de cada 6 predicciones difiere del modelo sin podar en evaluación *teacher-forced*.
- La cuantización NVFP4 es solo de pesos, sin escalas de activación ni tensores `input_scale`, lo que puede introducir errores adicionales en regímenes de activación no calibrados.
- La calibración se realizó con secuencias de 2.048 tokens, muy por debajo de la ventana declarada de 1.048.576; el comportamiento en contextos largos no está validado.
- La subcarpeta `pass3-hope/` (v3) es experimental, no evaluada y con dos defectos de construcción documentados: *healing* con estimador de reserva (sobrecorrección de ~30 % frente al medido) y cuantización NVFP4 de las proyecciones q/k/v de KDA. No debe usarse en producción.
- Idiomas soportados no documentados; no hay garantías de calidad multilingüe.
- Riesgo de alucinación: no cuantificado en la información disponible, pero previsiblemente elevado en tareas de conocimiento general dado el fallo de instrucciones documentado.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia MIT heredada del modelo base, lo que permite uso comercial; sin embargo, la calidad degradada en conocimiento general limita su idoneidad para productos de cara al público.
- El recuento de parámetros del Hub cuenta bytes empaquetados, no pesos; el dato fiable es el recuento de safetensors (165,5 B). Los parámetros activos no fueron calculados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/patrickbdevaney/GLM-5.3-Flash-REAP50-NVFP4-v2
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Versión FP8 hermana (v2): https://huggingface.co/patrickbdevaney/GLM-5.3-Flash-REAP50-FP8-v2
- Versión v1 FP8 (obsoleta): https://huggingface.co/patrickbdevaney/GLM-5.3-Flash-REAP50-FP8
- Versión v1 NVFP4 (obsoleta): https://huggingface.co/patrickbdevaney/GLM-5.3-Flash-REAP50-NVFP4
- Builds GGUF para llama.cpp: https://huggingface.co/patrickbdevaney/GLM-5.3-Flash-REAP50-GGUF
- GGUF sin podar `UD-Q2_K_XL`: https://huggingface.co/unsloth/GLM-5.3-Flash-GGUF
- Paper de referencia citado en los tags: arXiv:2510.13999 (https://arxiv.org/abs/2510.13999)
