# episod/tt-tnt

## Resumen

tt-tnt es un modelo de lenguaje base de tipo completion, con arquitectura estilo Llama-3, desarrollado por el usuario episod y entrenado desde inicialización aleatoria sobre una única chip Tenstorrent Blackhole con la herramienta `ttml` (tt-train). Con 22.025.088 parámetros, 6 capas, dimensión oculta 384 y una ventana de contexto de 2048 tokens, su propósito no es competir en capacidad, sino demostrar una cadena completa de diseño, entrenamiento, empaquetado y servicio ejecutada íntegramente sobre el stack nativo de Tenstorrent (tt-metal, tt-model-manager, plugin de vLLM para TT).

El modelo se sirve en una sola chip Blackhole con malla `(1, 1)` a través del plugin de vLLM de Tenstorrent, y también puede ejecutarse en CPU con `transformers` estándar. Está pensado como instrumento para experimentos de pipeline, empaquetado y estudios pequeños de entrenamiento, no como un asistente útil: escribe historias simples y no ha recibido ajuste por instrucciones ni datos de diálogo.

Es relevante ahora porque ejemplifica el estado del ecosistema de inferencia y entrenamiento en aceleradores alternativos a GPU, con verificación numérica frente a una reimplementación independiente y métricas de servicio reales (concurrencia 1 y 8) sobre hardware físico. Anteriormente se publicó como `tt-nanollama3`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer estilo Llama-3: RoPE (θ=500000), RMSNorm, SwiGLU, grouped-query attention |
| Parametros totales | 22.025.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (`max_model_len` 2048); prompts más largos devuelven HTTP 400 |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 (pesos y código); el corpus incluye fuentes share-alike |
| Formato de pesos | safetensors (repositorio de 0,9 GB); caché de tensores propia para tt-metal |
| Capas | 6 |
| Dimensión oculta | 384 |
| Cabezas de atención | 6 cabezas / 3 cabezas KV |
| Vocabulario | 32.000 (BPE a nivel de byte, entrenado para este modelo) |
| Hardware de servicio | Una chip Tenstorrent Blackhole, malla `(1, 1)` (`MESH_DEVICE=P150`) |
| Perfil de servicio | `max_num_seqs` 32, `block_size` 64, `max_model_len` 2048 |
| Estado | Funcional: servido y medido en hardware a concurrencia 1 y 8; sin ejecución de Model CI v0 |

## Arquitectura y entrenamiento

La arquitectura sigue el patrón Llama-3 con atención de consultas agrupadas (6 cabezas de consulta y 3 de clave/valor), normalización RMSNorm, activación SwiGLU y embeddings rotatorios posicionales con θ=500000. El vocabulario de 32.000 tokens se entrenó específicamente para este modelo con BPE a nivel de byte. El modelo se entrenó desde inicialización aleatoria, no por fine-tuning de un modelo existente, y los pesos se convirtieron posteriormente al formato de Hugging Face y se verificaron numéricamente contra una reimplementación independiente.

El corpus de entrenamiento combina `roneneldan/TinyStories`, `sedthh/gutenberg_english`, `biglam/gutenberg-poetry-corpus`, `wikimedia/wikipedia` y el dataset propio `episod/tt-tnt-corpus`. No hay datos de diálogo ni de pregunta-respuesta en el corpus, y no se menciona en la información disponible la aplicación de RLHF, DPO ni ajuste por instrucciones. El pipeline de datos aplana los documentos eliminando espacios y tabulaciones finales de línea, descartando líneas en blanco y uniendo líneas con un espacio simple; ese mismo aplanado se reproduce en la plantilla de chat `plain`. La innovación destacable no es algorítmica sino de infraestructura: entrenamiento y servicio TT-native de extremo a extremo, con conversión de pesos a una caché de tensores en el primer arranque del servidor.

## Capacidades

- Generación de texto por continuación de prompt (completion), orientada a historias simples y textos breves.
- No es un modelo de chat: la plantilla `plain` no inventa roles, descarta mensajes de sistema y une los últimos 5 mensajes como texto corrido que el modelo continúa.
- Sin ajuste por instrucciones, sin capacidad de seguir órdenes ni de responder preguntas.
- Sin soporte de tool calling ni de function calling.
- Sin soporte de agentes ni de razonamiento multi-paso.
- Multilingüe: únicamente inglés.
- Sin capacidades de visión, audio ni modo de razonamiento explícito.
- Adecuado como banco de pruebas de empaquetado, servicio y estudios pequeños de entrenamiento.

## Casos de uso

- Demostración de pipeline completo en Tenstorrent: sirve para mostrar, de principio a fin, el diseño, entrenamiento, empaquetado y servicio de un modelo con herramientas TT-native, sin dependencia de CUDA.
- Experimentos de empaquetado y distribución: el modelo se publica con `tt-model-manager` 0.1.0 (manifiesto schema 6, v6 thin) y permite validar flujos de `tt model pull` / `tt serve` y la generación de cachés de tensores.
- Pruebas de integración con vLLM: al exponer una API compatible con OpenAI (`/v1/completions`, `/v1/chat/completions`) en el puerto 20000, sirve para validar clientes y proxies contra un backend no-CUDA con concurrencia 1 y 8.
- Estudios pequeños de entrenamiento: con 22M parámetros y corpus público reproducible, es un banco de pruebas de bajo coste para experimentos de datos, tokenizador y curvas de aprendizaje.
- Validación de portabilidad CPU/acelerador: al ejecutarse también en CPU con `transformers`, permite comparar salidas y verificar numéricamente la implementación en hardware frente a la de referencia.
- Generación de texto creativo trivial: dado el inicio de una historia, produce continuaciones coherentes a corto plazo, útil para demostraciones en vivo de inferencia sobre una sola chip.
- Benchmarking de latencia de arranque y servicio: el primer `serve` alcanzó un endpoint listo en 46 s en un TT-QuietBox 2, con reinicios más rápidos gracias a la caché, lo que sirve para medir tiempos de puesta en marcha.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de servicio: endpoint listo en 46 s en el primer arranque sobre un TT-QuietBox 2, perfil de servicio con `max_num_seqs` 32 y `block_size` 64, y mediciones a concurrencia 1 y 8 sin valores numéricos de throughput o latencia por token.

## Requisitos de hardware

- Inferencia en acelerador: una única chip Tenstorrent Blackhole, malla `(1, 1)` (`MESH_DEVICE=P150`); medido en una chip de una p300c dentro de un TT-QuietBox 2. No se ha ejecutado en una tarjeta P150 física.
- Restricción de malla: no puede servirse en más de una chip, porque las 3 cabezas KV no dividen el ancho de ninguna malla multi-chip disponible; el código de atención exige que tanto 6 cabezas como 3 cabezas KV dividan el ancho de malla.
- Inferencia en CPU: posible con `transformers` estándar; los pesos en bfloat16 suman aproximadamente 44 MB (22M parámetros), por lo que caben holgadamente en cualquier equipo consumer.
- VRAM estimada en GPU: no disponible; no se documenta despliegue en GPU.
- Despliegue recomendado: CLI `tt` (`tt model pull`, `tt serve`) o `tt-model` (`tt-model pull --with-weights`, `tt-model serve`, `tt-model stop`), que instala un entorno con Python 3.12, `ttnn==0.77.0`, una build de vLLM 0.25.1 y el plugin TT de vLLM.
- Selección de dispositivo: bajo una concesión de chip (`TT_VISIBLE_DEVICES`) usa el primer dispositivo de la concesión; en caso contrario, el dispositivo 0. En placas p300c de dos chips, el `mesh-1x1.textproto` incluido permite abrir una sola chip.
- Latencia y throughput: no disponible más allá del tiempo de arranque de 46 s en el primer servicio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| episod/tt-tnt | 22.025.088 | 2048 | Apache-2.0 | Hugging Face, 643 descargas | Base completion, entrenado y servido en Tenstorrent Blackhole |
| TinyLlama-1.1B | ~1.100 millones | 2048 | Apache-2.0 | Hugging Face | Modelo pequeño de propósito general, mucho mayor en parámetros |
| Llama 3.2 1B | ~1.240 millones | 128.000 | Llama 3.2 Community License | Hugging Face | Instruido y base, con contexto muy superior |
| Modelos de menos de 50M parámetros | variable | variable | variable | variable | No disponible una comparativa directa publicada con tt-tnt |

La comparación cuantitativa de rendimiento con alternativas no está disponible: no hay benchmarks publicados en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat ni sigue instrucciones: no tiene ajuste por instrucciones y su corpus carece de datos de diálogo o pregunta-respuesta. El endpoint de chat solo continúa el texto recibido.
- No debe usarse para fines factuales; el riesgo de alucinación es alto y la calidad de la generación es la de un modelo de demostración de 22M parámetros.
- Ventana de contexto limitada a 2048 tokens; los prompts más largos devuelven HTTP 400. Debe ignorarse el centinela `model_max_length` de `tokenizer_config.json`.
- Solo inglés; sin capacidades multilingües.
- Restricción de despliegue a una sola chip por la divisibilidad de las cabezas KV en la malla.
- La licencia es Apache-2.0 para pesos y código, pero el corpus de entrenamiento incluye fuentes share-alike, lo que puede afectar a la redistribución o al uso comercial; conviene revisar la sección de Licensing de la model card.
- El decodificado voraz no es representativo; la lectura recomendada es muestreo con temperatura 0,8 y top_p 0,95.
- No se ha ejecutado Model CI v0, por lo que no existe una validación automatizada de regresión publicada.
- El autor declara explícitamente que el modelo demuestra un pipeline y no es un modelo capaz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/episod/tt-tnt
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Dataset Gutenberg English: https://huggingface.co/datasets/sedthh/gutenberg_english
- Dataset Gutenberg Poetry Corpus: https://huggingface.co/datasets/biglam/gutenberg-poetry-corpus
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Corpus propio: https://huggingface.co/datasets/episod/tt-tnt-corpus
- Resultados de búsqueda web: sin enlaces relevantes al modelo (los resultados corresponden a un estudio de fitness homónimo y no guardan relación)
