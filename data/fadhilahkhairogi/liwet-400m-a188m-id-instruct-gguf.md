# fadhilahkhairogi/Liwet-400M-A188M-id-instruct-GGUF

## Resumen

Liwet-400M-A188M-id-instruct-GGUF es la conversión a formato GGUF del modelo instruct Liwet-400M-A188M-id-instruct, un modelo de lenguaje en indonesio con arquitectura Mixture of Experts (MoE) de 400,1 millones de parámetros totales y 187,8 millones activos por token. Lo desarrolla el Grupo 11 de la asignatura Generative AI de la Universidad de Telkom (Indonesia), formado por Fadhilah Akbar Khairogi, Faishal Fakhrillah y Deril Diaz. El modelo parte de una etapa de SFT Instruct y está orientado a generación de texto conversacional en indonesio con una ventana de contexto de 2048 tokens.

La relevancia de esta publicación es doble. Por un lado, es un ejemplo de modelo MoE de escala muy pequeña (sub-500M) entrenado desde cero para un idioma de recursos medios como el indonesio. Por otro, el autor documenta con detalle inusual el proceso de conversión a GGUF, incluyendo métricas de paridad numérica entre la implementación PyTorch de referencia y llama.cpp, lo que resulta útil para quien necesite replicar el procedimiento con arquitecturas MoE personalizadas.

La conversión se realizó con un fork específico de llama.cpp (rama `liwet-moe`, commit `cae551692`, build 11315) porque la arquitectura requiere un despacho y enrutamiento de expertos que el kernel MoE estándar de Ollama no soporta. El autor advierte explícitamente de que el GGUF es numéricamente aproximado y no bit-idéntico al modelo original en safetensors, que sigue siendo la referencia de salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), identificador `moe_400m` |
| Parametros totales | 400.098.560 (400,1M) |
| Parametros activos | 187,8M por token |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | BF16, F16, Q8_0 |
| Idiomas soportados | Indonesio (id) |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); repo original en safetensors |
| Etapa de entrenamiento | SFT Instruct |
| Modo de prompt | `chat_role` (basado en líneas, con `<bos>`) |
| Tokenizer | 163M/400M, IDs especiales: `<pad>`=0, `<bos>`=1, `<eos>`=2 |
| Tamaño del repo | 2,1 GB |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Mixture of Experts con 400,1M de parámetros totales y 187,8M activos, lo que implica que en cada paso de inferencia solo se activa aproximadamente el 47% de los parámetros. El autor menciona un mecanismo de "capacity-limited MoE dispatch" en la implementación PyTorch de referencia, frente al "dispatch pleno" de llama.cpp; esta diferencia es la causa principal de las divergencias observadas en prompts largos (hasta 2048 tokens), donde el cosine de logits cae a 0,5242 en BF16.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO más allá de la etapa SFT Instruct indicada. Tampoco se detalla la innovación técnica concreta del enrutador más allá de la existencia de "router near-tie" en precisión bf16, que puede invertir la elección de experto y explica que la paridad exacta del conjunto de expertos (P3) se quede en torno al 90%.

El prompt debe construirse manualmente con el formato `chat_role` basado en líneas, comenzando por `<bos>` (id 1). El GGUF no incluye `chat_template` en los metadatos y declara `add_bos_token = false` y `add_eos_token = false`, por lo que la responsabilidad de formatear la entrada recae en el llamador.

## Capacidades

- Generación de texto conversacional en indonesio, con formato instruct de sistema/usuario/asistente.
- Razonamiento básico de múltiples turnos dentro de la ventana de 2048 tokens.
- Generación de código y respuestas a preguntas generales (capacidad no verificada empíricamente en la información disponible).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al indonesio según la model card.
- Modo thinking, visión o audio: no disponible.
- Inferencia en CPU y GPU mediante llama.cpp, con API compatible con OpenAI a través de `llama-server`.

## Casos de uso

- Chatbot de atención al cliente en indonesio: el modelo puede gestionar conversaciones multi-turno dentro de su ventana de 2048 tokens, suficiente para interacciones de soporte típicas, y su reducido tamaño permite desplegarlo en servidores sin GPU dedicada.
- Asistente conversacional embebido en aplicaciones móviles o de escritorio: con Q8_0 ocupando 491,8 MiB, cabe en dispositivos con poca memoria y puede ejecutarse con `llama.cpp` en CPU a unas 90 tok/s de decodificación con 8 hilos.
- Generación de respuestas en indonesio para formularios o FAQs: el formato `chat_role` permite inyectar un system prompt con instrucciones de estilo y restricciones de contenido.
- Prototipado académico de arquitecturas MoE: sirve como caso de estudio reproducible de conversión HF→GGUF y validación de paridad numérica con métricas P1-P4.
- Filtrado o clasificación ligera de texto en indonesio: con temperatura 0 y stop strings definidos, puede usarse para tareas de extracción o etiquetado de baja complejidad.
- Servicio local compatible con OpenAI: `llama-server` expone un endpoint HTTP que permite integrar el modelo en pipelines existentes sin dependencias de PyTorch.
- Evaluación comparativa de cuantizaciones: los archivos BF16, F16 y Q8_0 con SHA-256 publicados permiten reproducir los benchmarks de prefill y decode del autor.

## Benchmarks y rendimiento

Rendimiento de inferencia medido por el autor con `llama-bench` (GPU: `-ngl 99 -p 512 -n 128 -r 5`; CPU: `-ngl 0 -t 8 -p 0 -n 32`):

| Cuantizacion | Prefill 512 (tok/s, GPU) | Decode 128 (tok/s, GPU) | Decode 32 (tok/s, CPU) |
|---|---|---|---|
| BF16 | 6.079 ± 1.058 | 31,60 ± 9,68 | 16,2 ± 2,5 |
| F16 | 3.984 ± 992 | 19,16 ± 8,48 | no disponible |
| Q8_0 | 5.510 ± 535 | 18,63 ± 0,75 | 90,5 ± 13,5 |

El autor advierte de que las cifras de GPU son una cota inferior porque Intel DTT estaba activo y la frecuencia del SM observada era de ~0,8 GHz frente a un límite de 3,1 GHz.

Paridad numérica frente a la referencia PyTorch en bf16 CUDA (35 prompts de prefill, 6 prompts greedy de 128 pasos, 5 prompts de sampling):

| Cuantizacion | P1 min / mean cosine | P1 top-1 | P2 mediana divergencia (norep / defrep) | P3 router exacto | P4 max TVD |
|---|---|---|---|---|---|
| BF16 | 0,524170 / 0,983804 | 97,14% | 27,5 / 21 | 90,44% | 0,130 |
| F16 | 0,711567 / 0,988795 | 97,14% | 27,5 / 21 | 90,53% | 0,154 |
| Q8_0 | 0,078749 / 0,970509 | 94,29% | 27,5 / 20 | 89,20% | 0,132 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en BF16/F16 ocupa 764,8 MiB y en Q8_0 491,8 MiB, por lo que cualquier GPU con 1-2 GB libres es suficiente.
- GPU recomendadas: no se especifican modelos concretos; el autor reporta mediciones en una GPU con Intel DTT activo. Cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090) puede alojarlo con `-ngl 99`.
- Cabe holgadamente en GPU consumer y en CPU: en CPU con 8 hilos alcanza 90,5 tok/s en Q8_0.
- Opciones de despliegue: `llama-cli`, `llama-server` (API compatible con OpenAI) y `llama-cpp-python` con el fork `liwet-moe` (commit `cae551692`). Ollama estándar **no es compatible** con este MoE de 400M porque usa el kernel MoE upstream y no el despacho del fork.
- Latencia y throughput: prefill de 5.510 tok/s y decode de 18,63 tok/s en GPU con Q8_0; decode de 90,5 tok/s en CPU con 8 hilos.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|---|
| Liwet-400M-A188M-id-instruct-GGUF | 400,1M | 187,8M | 2048 | Indonesio | no disponible | GGUF |
| Qwen2.5-0.5B-Instruct | 494M | denso | 32.768 | Multilingüe | Apache 2.0 | safetensors, GGUF |
| SmolLM2-360M-Instruct | 362M | denso | 8.192 | Multilingüe | Apache 2.0 | safetensors, GGUF |
| Gemma-2-2B-it | 2.614M | denso | 8.192 | Multilingüe | Gemma Terms | safetensors, GGUF |

No se dispone de datos de benchmarks de calidad que permitan comparar el rendimiento de Liwet-400M con estas alternativas. Las diferencias más relevantes son la especialización en indonesio, la arquitectura MoE con solo 187,8M activos y la necesidad de un fork específico de llama.cpp, frente a la compatibilidad estándar de los modelos densos de la comparativa.

## Limitaciones y advertencias

- El GGUF es numéricamente aproximado, no bit-idéntico: el router MoE puede invertir la elección de experto en bf16 y la paridad P3 se queda en ~90%. La referencia de salida es el modelo original en safetensors (Jalur A PyTorch).
- En prompts de 2048 tokens el cosine de logits en BF16 cae a 0,5242 por la diferencia entre dispatch limitado por capacidad (PyTorch) y dispatch pleno (llama.cpp).
- La cuantización Q8_0 presenta un P1 min cosine de 0,078749, muy inferior al de BF16/F16; no debe usarse cuando se requiera fidelidad alta respecto al modelo original.
- No incluye `chat_template` en los metadatos: el prompt debe construirse manualmente con el formato `chat_role` y `<bos>`=1.
- Ollama estándar no es compatible; requiere el fork `liwet-moe` de llama.cpp o la ruta PyTorch.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Idioma limitado al indonesio; el rendimiento en castellano u otros idiomas no está documentado y previsiblemente será bajo.
- Licencia no disponible: no se puede confirmar el uso comercial sin contactar con los autores.
- Riesgo de alucinación inherente a un modelo de 400M con SFT Instruct y sin datos publicados de evaluación de calidad.
- Sesgos no documentados; al estar entrenado para indonesio, puede reflejar sesgos culturales y lingüísticos de ese dominio.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación externa prácticamente nulos.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/fadhilahkhairogi/Liwet-400M-A188M-id-instruct-GGUF
- Modelo base en safetensors: https://huggingface.co/fadhilahkhairogi/Liwet-400M-A188M-id-instruct
- Fork de llama.cpp utilizado (rama `liwet-moe`, commit `cae551692`): https://github.com/ggml-org/llama.cpp
- Metodología de benchmarks de paridad (referenciada en la model card): `docs/bench/RESULTS.md` del repositorio del autor
