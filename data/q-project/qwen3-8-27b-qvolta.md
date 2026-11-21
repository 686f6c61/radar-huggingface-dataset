# q-project/Qwen3.8-27B-QVolta

## Resumen

Qwen3.8-27B-QVolta es una cuantización del modelo Qwen3.8-27B (27.000 millones de parámetros) empaquetada en el formato propietario `.qv` del motor de inferencia Q-Volta, desarrollado por el proyecto independiente Q Project. El objetivo declarado es ejecutar un modelo de 27B con contexto de hasta 256K tokens en una única GPU Tesla V100 de 16 GB, algo imposible con los pesos en BF16, y ofrecer además un backend nativo de CPU con AVX2. La arquitectura del modelo base es híbrida: 64 capas, de las cuales 48 son Gated-DeltaNet y 16 son atención con compuertas.

El modelo se distribuye en dos variantes de pesos: `e1` (10,44 GiB, todos los tensores a 3 bits salvo embeddings a 4 bits y `lm_head` a 5 bits, con GPTQ) y `e0` (12,63 GiB, MLP a 3 bits, capas DeltaNet y de atención a 4 bits, cuantización round-to-nearest). Incluye la cabeza MTP (multi-token prediction) del modelo base dentro del propio fichero, lo que permite decodificación especulativa exacta con aceleraciones de hasta 2,4x en decodificación.

Es relevante ahora porque demuestra que es viable servir un modelo de 27B con ventana de 256K en hardware de 2017 (V100, sm_70) mediante cuantización agresiva y caché KV a 4 bits. No obstante, el propio autor lo etiqueta como *research release*: la calidad cae de forma medible frente a BF16 y los ficheros solo cargan en su motor, no en llama.cpp, vLLM ni transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 64 capas (48 Gated-DeltaNet + 16 atención con compuertas), con cabeza MTP |
| Parametros totales | 27.000 millones (modelo base Qwen3.8-27B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Hasta 256K tokens (validado empíricamente con un prompt de 250.000 tokens); calidad solo verificada hasta 32K |
| Tipos de cuantizacion | `e1`: 3 bits general, 4 bits embeddings, 5 bits lm_head, GPTQ grupo 128; `e0`: MLP 3 bits, DeltaNet/atención 4 bits, embeddings 4 bits, lm_head 6 bits, RTN grupo 64; caché KV en int4 (4,5 bits/elemento, 18 KiB/token), fp16 o fp32 |
| Idiomas soportados | Inglés, ruso, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | `.qv` (contenedor propietario de Q-Volta: cabecera + índice JSON de tensores + datos en bit-plane) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina 48 capas de Gated-DeltaNet (un mecanismo de atención lineal con estado recurrente y compuertas) con 16 capas de atención con compuertas convencional. Esta mezcla reduce el coste computacional y de memoria del contexto largo respecto a un transformer de atención completa. El modelo incorpora además una cabeza de multi-token prediction (MTP), que en esta distribución se conserva dentro del fichero `.qv` y se explota para decodificación especulativa exacta (el resultado es bit-idéntico a la decodificación greedy simple).

Sobre el entrenamiento del modelo base no se proporciona información en la documentación disponible (número de tokens, composición del dataset, uso de RLHF o DPO: no disponible). Lo que sí está documentado es el proceso de cuantización: `e1` usa GPTQ con matriz de Hessian calculada sobre un conjunto de calibración de wikitext-train, código y chat (32 x 1024 tokens), búsqueda de rango de clip, grupo 128 y metadatos de escala/zero a 8 bits (ahorra 0,39 GiB sin pérdida medible). `e0` usa cuantización round-to-nearest asimétrica con grupo 64. Una asignación mixta basada en sensibilidad por capas no superó a la asignación uniforme de 3 bits en las pruebas del autor.

## Capacidades

- Generación de texto conversacional en inglés, ruso y chino.
- Razonamiento y generación de código (el prompt de prueba "code chat" es el escenario con mayor aceptación de borrador MTP: 0,94).
- Contexto largo: ventana de hasta 256K tokens, con recuperación de información (passkey) verificada 6/6 hasta 32K y una prueba puntual a 250K.
- Decodificación especulativa exacta mediante la cabeza MTP integrada (profundidad 1-3), con salida bit-idéntica a greedy.
- Inferencia en GPU (V100, sm_70) y en CPU x86 con AVX2.
- Servidor compatible con la API de OpenAI (`qv_server`) para generación de texto.
- No soporta visión (el modelo distribuido es solo texto, sin torre visual).
- No soporta tool calling en el servidor (una petición a la vez, sin function calling).

## Casos de uso

- Investigación sobre cuantización extrema: el par de ficheros `e1`/`e0` con métricas de perplejidad, KL y acuerdo top-1 frente a BF16 permite estudiar el impacto de distintas recetas (GPTQ vs RTN, grupo 128 vs 64) en un modelo de 27B.
- Inferencia de contexto largo en hardware legacy: procesar documentos de hasta 250K tokens en una única V100 de 16 GB, útil para auditar pipelines de recuperación en contextos masivos sin acceso a GPUs modernas.
- Despliegue en CPU para entornos sin GPU: el backend AVX2 permite generar texto a 2,6-2,8 tok/s (3,8-4,5 con MTP) en 32 hilos, adecuado para prototipos y pruebas por lotes no interactivas.
- Servicio de chat autocontenido: `qv_server` expone una API compatible con OpenAI para integrar el modelo en aplicaciones de conversación en una sola GPU de 16 GB.
- Evaluación comparativa de motores de inferencia: sirve como referencia para medir el equilibrio entre velocidad (bytes leídos) y calidad en cuantizaciones de 3-4 bits frente a otros motores.
- Docencia y formación: el repositorio incluye documentación de cuantización y resultados crudos de benchmarks que permiten reproducir el análisis en un curso de sistemas de inferencia.

## Benchmarks y rendimiento

Resultados publicados por el autor (Tesla V100-SXM2-16GB, Xeon E5-2683 v4, decodificación greedy):

| Metrica | e1 | e0 | Referencia BF16 |
|---|---|---|---|
| Perplejidad wikitext-2 (4088 tok) | 9,278 (+9,6%) | 9,508 (+12,3%) | 8,468 |
| KL frente a BF16 | 0,112 | 0,122 | — |
| Acuerdo top-1 | 85,2% | 84,6% | — |
| Tamano del fichero | 10,44 GiB | 12,63 GiB | — |

| Escenario de decodificacion (GPU) | Plain (tok/s) | MTP (tok/s) | Aceptacion de borrador |
|---|---:|---:|---:|
| `e1`, code chat | 57,6 | 138,2 (prof. 3) | 0,94 |
| `e1`, prose chat | 57,6 | 95,6 (prof. 2) | 0,61 |
| `e1`, wikitext ctx 4088 | 54,6 | 94,1 (prof. 2) | 0,73 |
| `e0`, code chat | 52,2 | 131,8 (prof. 3) | 0,94 |

Prefill en GPU (`e0`, en frío): 1010 / 1207 / 1136 tok/s a 512 / 2048 / 4088 tokens. En CPU (32 hilos): decodificación 2,6-2,8 tok/s en modo plain y 3,8-4,5 con MTP; prefill 30 / 27 tok/s a 512 / 2048 tokens. Contexto largo: un prompt de 250.000 tokens ocupa 15,2 de 15,8 GiB, el prefill tarda 28 minutos y la decodificación a posición 262K sobre caché sintética alcanza 22,9 tok/s. La perplejidad con caché KV int4 está dentro del 0,1% de la caché fp32 a 4K/8K. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: 10,44 GiB para `e1` y 12,63 GiB para `e0` en pesos; con caché KV int4 (18 KiB/token) un prompt de 250K tokens cabe en una V100 de 16 GB (15,2 GiB en uso).
- GPU objetivo: Tesla V100 de 16 GB (sm_70). No se documenta soporte para A100, H100 ni RTX 4090; el motor solo compila para V100 y x86 AVX2.
- GPU de consumo: no disponible (el motor no soporta arquitecturas consumer según la documentación).
- CPU: backend AVX2 nativo, probado con 32 hilos.
- Despliegue: exclusivamente mediante el motor Q-Volta (`qv_server`, `qv_run`), compilado con CMake y NVCC. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tabla de benchmarks; el servidor atiende una petición a la vez.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-QVolta (`e1`) | 27B | 256K | 3-5 bits, formato `.qv` | Apache 2.0 | Solo motor Q-Volta |
| Qwen3.8-27B (BF16) | 27B | no disponible en la informacion | BF16 | Apache 2.0 (modelo base) | transformers y ecosistema estandar |
| Cuantizacion mixta de 14 GiB de otro motor (mencionada por el autor) | 27B | no disponible | mixta, +0,3% perplejidad | no disponible | no disponible |

El autor menciona un fichero de 14 GiB de un motor competidor con solo +0,3% de perplejidad, lo que sitúa la calidad de `e1`/`e0` por debajo de esa alternativa a cambio de leer menos bytes. No se dispone de datos de otros modelos comparables de 27B en la información proporcionada.

## Limitaciones y advertencias

- Calidad inferior a BF16 de forma medible: +9,6% de perplejidad en `e1` y +12,3% en `e0`; en una prueba sintética de tool calling `e1` es peor que `e0` (KL 1,34 vs 1,13).
- La calidad en contexto largo por encima de 32K no está validada; la prueba a 250K es un único prompt y demuestra que el pipeline funciona, no la calidad de recuperación.
- El tool calling no está validado y el servidor no lo soporta (una petición a la vez, sin function calling).
- El formato `.qv` y el motor son jóvenes: solo V100 y x86 AVX2, sin visión.
- No tiene ajuste de seguridad propio: hereda el comportamiento del modelo base, con los sesgos y riesgos de alucinación de este.
- Uso declarado por el autor: investigación y educación.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de validación de calidad y las limitaciones del motor desaconsejan producción sin evaluación propia.
- El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, y un tamaño de repo de 0,0 GB, lo que sugiere que los pesos podrían no estar efectivamente alojados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/q-project/Qwen3.8-27B-QVolta
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio del motor Q-Volta: https://github.com/Q-Project-LM/q-volta
- Resultados de benchmarks: https://github.com/Q-Project-LM/q-volta/tree/main/benchmarks/results
- Documentación del servidor: https://github.com/Q-Project-LM/q-volta/blob/main/docs/SERVER.md
- Documentación de cuantización: https://github.com/Q-Project-LM/q-volta/blob/main/docs/QUANTIZATION.md
