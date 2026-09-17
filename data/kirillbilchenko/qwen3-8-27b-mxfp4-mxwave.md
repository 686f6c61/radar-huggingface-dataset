# kirillbilchenko/Qwen3.8-27B-MXFP4-MxWave

## Resumen

Qwen3.8-27B-MXFP4-MxWave es un checkpoint cuantizado en MXFP4 del modelo denso multimodal Qwen/Qwen3.8-27B, publicado por el usuario kirillbilchenko mediante su herramienta MxWave 0.1.0. No es un modelo entrenado desde cero ni una versión oficial de Qwen: es una conversión post-entrenamiento de 4 bits orientada a calidad, construida sobre la revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` del modelo base y con licencia Apache 2.0.

El modelo conserva los 27.781.427.952 parámetros del original (un transformer denso híbrido de 64 capas con 48 capas de atención lineal y 16 de atención completa), pero almacena las 400 proyecciones del language model en MXFP4 E2M1 con escalas compartidas E8M0 y bloques de 32 valores. El resultado ocupa 19.832.831.240 bytes (18,47 GiB) frente a los 55.562.855.904 bytes (51,75 GiB) del tensor original, una reducción del 64,31 % (2,8016x más pequeño). En inferencia se ejecuta como W4A16, es decir, pesos de 4 bits con activaciones en bfloat16 mediante el kernel Marlin de vLLM.

Su relevancia radica en que es una de las primeras conversiones MXFP4 con evaluación reproducible publicada contra una alternativa de referencia (AMD Quark-AWQ MXFP4) sobre el mismo protocolo y hardware. En WikiText-2 logra una perplejidad de 8,119445, un 1,736 % peor que el BF16 original y un 0,832 % mejor que la release de AMD. El checkpoint se declara experimental y orientado a despliegues en hardware Blackwell, con pruebas realizadas en una DGX Spark (GB10, SM121).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido de 64 capas: 48 capas de atención lineal y 16 de atención completa, con encoder de visión y merger multimodal |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (la configuración de servicio probada fija `--max-model-len 16384`, no el máximo del modelo) |
| Tipos de cuantizacion | MXFP4 (E2M1) con escalas E8M0 compartidas y bloques de 32 valores; ejecución W4A16 en runtime |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con esquema `compressed-tensors` `mxfp4-pack-quantized` |
| Proyecciones cuantizadas | 400 (192 de MLP, 144 de atención lineal, 64 de atención completa) |
| Tensores en precision original | 799 (embeddings, lm head, normas, auxiliares de atención lineal, tensores MTP, encoder de visión y vision merger) |
| Tamano del checkpoint | 19.832.831.240 bytes (18,47 GiB) |
| Tamano del tensor de origen | 55.562.855.904 bytes (51,75 GiB) |
| Reduccion | 64,31 % / 2,8016x |
| Modelo base | Qwen/Qwen3.8-27B (revision 1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0) |
| Herramienta de cuantizacion | MxWave 0.1.0 (baseline publico fijado en `0179e131`) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso híbrido de 64 capas en el que 48 capas usan atención lineal (con proyecciones `in_proj_qkv`, `in_proj_z` y `out_proj`) y 16 usan atención completa (`q_proj`, `k_proj`, `v_proj`, `o_proj`). Es multimodal, con pipeline declarado `image-text-to-text`, e incluye tensores de predicción multi-token (MTP) y un encoder de visión con su merger. Este checkpoint no entrena ni ajusta el modelo: únicamente sustituye la representación numérica de un subconjunto de pesos.

La cuantización aplica la receta denominada H64, donde H indica selección de escala mediante un proxy de Hessiano por bloque y 64 el número de secuencias de calibración. Para cada bloque de 32 valores, MxWave evalúa exponentes de escala E8M0 cercanos minimizando `error ≈ (W - W_quant) H (W - W_quant)^T`, es decir, el error de salida ponderado por los segundos momentos de las entradas reales, en lugar del MSE de los pesos en crudo. La calibración usó las primeras 100 filas de validación de `EleutherAI/pile_val_test` (fijadas por revisión y hash del corpus) para formar 64 secuencias de 512 tokens, 32.768 tokens en total, con amortiguación de 1e-6 y estadísticas de segundo momento con bloques de 32 sobre las 400 proyecciones objetivo.

Tras la selección de escala, los valores se asignan a su código E2M1 más cercano. La receta final es deliberadamente solo de escala: no emplea redondeo secuencial tipo GPTQ, feedback de error, recuperación entre bloques, rotaciones, promoción de capas a precisión mixta ni entrenamiento de recuperación, ya que esas variantes no mejoraron lo suficiente el resultado en held-out. El campo `d4` del registro de build indica una profundidad de búsqueda de clipping MSE de cuatro. Los tensores de visión se conservan en su precisión original, pero su capacidad no fue evaluada de forma independiente.

## Capacidades

- Generacion de texto multimodal: el pipeline declarado es `image-text-to-text`, e incluye encoder de visión y vision merger intactos en precisión original.
- Razonamiento y generacion de lenguaje: el language model completo (MLP, atención lineal y atención completa) está cuantizado y operativo en MXFP4.
- Atencion lineal en 48 de las 64 capas: reduce el coste de cómputo de atención en contextos largos respecto a un transformer de atención completa pura.
- Prediccion multi-token: los tensores MTP se preservan en precisión original, aunque la model card no documenta su uso efectivo con decodificación especulativa.
- Conversacion multi-turno: etiquetado como `conversational` y `endpoints_compatible`.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingues: no disponibles.
- Modo thinking, audio u otras capacidades especiales: no documentado en la información disponible.
- Nota importante: la calidad multimodal no está evaluada. Los resultados publicados son exclusivamente de texto y no deben interpretarse como una afirmación de calidad de visión.

## Casos de uso

- Despliegue de un LLM de 27B en hardware de una sola GPU con memoria limitada: con 18,47 GiB de pesos, el checkpoint permite servir un modelo de clase 27B donde la versión BF16 (51,75 GiB de tensores) no cabría, a cambio de un incremento de perplejidad del 1,736 % medido en WikiText-2.
- Inferencia multimodal en el borde: al conservar encoder de visión y merger, permite construir asistentes que respondan a imágenes y texto en estaciones de trabajo Blackwell, siempre que se valide la calidad visual por cuenta propia, ya que no viene evaluada.
- Procesamiento de documentos largos con atención híbrida: las 48 capas de atención lineal reducen el coste por token en secuencias largas, lo que resulta adecuado para resumen y extracción sobre corpus extensos dentro del límite de contexto que se configure en el servidor.
- Backend de API compatible con OpenAI: el tag `endpoints_compatible` y el uso con `vllm serve` permiten exponerlo como servicio HTTP y sustituir un endpoint de mayor coste en tareas de generación y chat.
- Evaluación comparativa de esquemas de cuantización: sirve como referencia reproducible de MXFP4 con receta Hessiana, útil para equipos que investigan cuantización de 4 bits y quieren comparar contra Quark-AWQ bajo un protocolo idéntico.
- Prototipado en investigación en una DGX Spark: la configuración probada (`--max-model-len 16384`, `--max-num-seqs 4`, `--gpu-memory-utilization 0.45`) está pensada para memoria unificada, lo que permite levantar un 27B cuantizado en un equipo de sobremesa con acelerador Blackwell.
- Servicio de chat con concurrencia moderada: con `--max-num-seqs 4` el modelo atiende varias conversaciones simultáneas manteniendo el consumo de memoria bajo control, apropiado para demos internas o entornos de validación.
- Fine-tuning posterior sobre pesos cuantizados: al publicarse en formato `compressed-tensors`, encaja en flujos que requieren cargar el modelo con transformers o vLLM sin reempaquetar los pesos manualmente.

## Benchmarks y rendimiento

Los únicos resultados cuantitativos publicados son de perplejidad sobre WikiText-2, medidos con 316 ventanas independientes de 4.096 caracteres del corpus raw de test fijado por revisión, con 297.199 tokens puntuados. Todas las comparaciones se hicieron en la misma DGX Spark (GB10, SM121), con el mismo modelo fuente, prompts, tokenizer e imagen de vLLM (`vllm/vllm-openai:qwen38-flash-next@sha256:fc120ece0...`).

| Modelo | Perplejidad de prompt | Relativo a BF16 |
|---|---:|---:|
| BF16 de origen | 7,980864 | baseline |
| MxWave MXFP4 (este) | 8,119445 | +1,736 % |
| AMD Quark-AWQ MXFP4 | 8,187544 | +2,590 % |

Detalles de significación: la ventaja de MxWave sobre AMD Quark-AWQ MXFP4 fue del 0,832 %, con intervalo de confianza del 95 % por bootstrap agrupado de `[-1,227 %, -0,531 %]`; ganó en 204 de las 316 ventanas pareadas, y al eliminar el mayor valor atípico favorable la ventaja se mantuvo en 0,684 %. Los valores absolutos de perplejidad son específicos de este protocolo de ventanas por caracteres y no deben compararse con cifras de la literatura obtenidas con ventanas o pasos distintos.

La model card menciona además una sección de divergencia de distribución exacta de siguiente token sobre 128 contextos de WikiText-2 de hasta 512 tokens, pero el contenido proporcionado está truncado y no incluye cifras. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible. Tampoco hay mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM para pesos: 19.832.831.240 bytes (18,47 GiB) en MXFP4, que en la práctica requieren al menos 20-24 GiB de memoria disponible para pesos, caché KV y overhead del runtime.
- GPU recomendadas: la configuración probada es una DGX Spark con GB10 (SM121, arquitectura Blackwell) usando el kernel Marlin de vLLM. No se documenta soporte probado en otras arquitecturas.
- GPU de consumo: los 18,47 GiB caben teóricamente en tarjetas de 24 GiB (RTX 3090, RTX 4090), pero con caché KV muy ajustada y sin confirmación de que el kernel Marlin funcione correctamente fuera de Blackwell; el autor solo publica pruebas en SM121.
- Memoria del sistema: la configuración de referencia usa `--gpu-memory-utilization 0.45` sobre memoria unificada, un presupuesto deliberadamente conservador para dejar margen al resto del sistema.
- Precision: la receta almacena pesos de 4 bits, pero la ejecución es W4A16, con activaciones en bfloat16. No hay mediciones nativas W4A4.
- Opciones de despliegue: vLLM es el único runtime documentado y probado, con `--load-format safetensors --dtype bfloat16 --linear-backend marlin`. No hay instrucciones publicadas para llama.cpp, Ollama, TGI ni otros motores.
- Latencia y throughput: no disponibles. No se publican tokens por segundo ni tiempos de primera token en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano de pesos | Cuantizacion | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---:|---:|---|---:|---|---|
| Qwen3.8-27B-MXFP4-MxWave | 27,78 B | 18,47 GiB | MXFP4 W4A16 | 8,119445 (+1,736 % vs BF16) | apache-2.0 | HuggingFace, experimental |
| Qwen3.8-27B BF16 (origen) | 27,78 B | 51,75 GiB (tensores) | ninguna | 7,980864 (baseline) | apache-2.0 | HuggingFace, oficial |
| amd/Qwen3.8-27B-Quark-AWQ-MXFP4 | 27,78 B | no disponible en la informacion | MXFP4 W4A16 | 8,187544 (+2,590 % vs BF16) | no disponible en la informacion | HuggingFace, revision `5233554c` |

La comparación directa solo es válida entre estos tres checkpoints, ya que comparten modelo base, tokenizer y entorno de ejecución. No se dispone de datos para comparar con otras familias de modelos de tamaño similar.

## Limitaciones y advertencias

- Checkpoint experimental: no es una release oficial de Qwen ni de AMD. El propio autor lo declara como conversión experimental.
- Perdida de calidad medible: un 1,736 % más de perplejidad que el BF16 de origen en el protocolo publicado. En tareas sensibles a la precisión numérica la degradación puede ser mayor que en perplejidad agregada.
- Capacidad multimodal no evaluada: los tensores de visión se conservan sin cambios, pero no se realizó ninguna evaluación independiente de visión. No se debe asumir calidad multimodal a partir de los resultados de texto.
- Contexto maximo no documentado: la model card no publica la longitud de contexto nativa del modelo, solo un `--max-model-len 16384` en la configuración de servicio probada.
- Idiomas soportados no disponibles: la metadata de HuggingFace no declara idiomas y la model card no los especifica.
- Rendimiento ligado al hardware: los resultados se obtuvieron exclusivamente en una DGX Spark (GB10, SM121) con una imagen concreta de vLLM. Otros backends, GPUs o versiones de vLLM pueden dar cifras distintas.
- No apto para comparaciones con literatura: los valores de perplejidad usan ventanas de 4.096 caracteres y no son comparables con los de protocolos basados en tokens.
- Sin medidas de sesgo ni de alucinacion: no se publica ninguna evaluación de sesgo, toxicidad, robustez o tasa de alucinación.
- Tool calling, agentes y capacidades multilingues sin documentar: no hay evidencia publicada de que funcionen correctamente en este checkpoint.
- Sin soporte documentado fuera de vLLM/Marlin: no hay instrucciones ni pruebas para llama.cpp, Ollama, TGI u otros motores, ni para GPUs no Blackwell.
- Licencia: Apache 2.0, heredada del modelo base según la model card, lo que permite uso comercial, pero conviene verificar la licencia del modelo base de forma independiente antes de desplegarlo en producción.
- Vision merger y encoder en precisión original: implican que el ahorro de memoria de 4 bits no se aplica a la parte visual, que mantiene su peso completo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kirillbilchenko/Qwen3.8-27B-MXFP4-MxWave
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de la herramienta MxWave: https://github.com/kirillbilchenko/MxWave
- Baseline del cuantizador fijado: https://github.com/kirillbilchenko/MxWave/tree/0179e131544f807ecdb6d04e7e914f181dd21c9f
- Checkpoint de comparación AMD Quark-AWQ MXFP4: https://huggingface.co/amd/Qwen3.8-27B-Quark-AWQ-MXFP4
- Corpus de calibración: https://huggingface.co/datasets/EleutherAI/pile_val_test
- Imagen de vLLM usada en la evaluación: `vllm/vllm-openai:qwen38-flash-next@sha256:fc120ece0a388cc0aa1caad4a9f1cd92113484ab7ec2fd0efadd62585be05bf8`
- Manifiesto de cuantización: `mxwave-manifest.json` dentro del repositorio del modelo
- Detalle del protocolo de evaluación: `evaluation/wikitext2-prompt-ppl.json` dentro del repositorio del modelo
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la información de HuggingFace y de la model card.
