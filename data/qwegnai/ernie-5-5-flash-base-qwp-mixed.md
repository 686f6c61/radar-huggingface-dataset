# qwegnai/ERNIE-5.5-Flash-Base-QWP-Mixed

## Resumen

ERNIE-5.5-Flash-Base-QWP-Mixed es un empaquetado de pesos cuantizados del modelo base `baidu/ERNIE-5.5-Flash-Base-BF16`, publicado por el usuario `qwegnai` para su propio motor de inferencia Qwegn, un runtime escrito en Swift y Metal 4 orientado a Apple Silicon. No se trata de un modelo nuevo ni de un ajuste fino: es una compresion agresiva del checkpoint BF16 original (533,59 GiB) hasta 81,61 GiB mediante una mezcla de cuantizacion vectorial esferica (SHVQ) para los expertos enrutados y cuantizacion de 8 bits por grupos (HQ8_G32) para el tronco denso, atencion, routers y cabeza de salida.

El modelo subyacente es un transformer MoE de 280B parametros totales con 14B activos por token, distribuidos en 43 capas de backbone: una capa FFN densa y 42 capas Latent-MoE con 512 expertos enrutados (top-10 con enrutamiento sigmoide de doble split) mas un experto compartido. La atencion combina 37 capas de Heavily Compressed Attention (HCA) con compresion KV 128:1 y ventana deslizante de 128 tokens, y 6 capas MLA-DSA desacopladas con RoPE. Soporta una longitud de contexto nativa de 1.048.576 tokens.

Su relevancia practica es acotada pero concreta: demuestra que un MoE de 280B puede residir completamente en memoria unificada de un Mac de 128 GB con contexto de 1M tokens, a costa de una perdida de fidelidad medible (KL de 0,1757 nats/token frente al oraculo BF16, con 79,69% de acuerdo top-1). Es un artefacto de infraestructura, no un modelo listo para produccion general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion hibrida HCA (37 capas) + MLA-DSA (6 capas), 43 capas de backbone |
| Parametros totales | 280B |
| Parametros activos | 14B por token (+0,36B capa compartida ECHO) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | SHVQ15_G64 (expertos w1/w3, 1,75 bpw), SHVQ3_G64 (expertos w2, 3,25 bpw), HQ8_G32 (tronco denso, 8,50 bpw); media 2,52 bits/parametro |
| Idiomas soportados | no disponible |
| Licencia | ernie-5.5-flash-base-model-license-v1.0 (other) |
| Formato de pesos | QWP1 (contenedor propietario de Qwegn); no es safetensors, GGUF ni MLX |
| Modelo base | baidu/ERNIE-5.5-Flash-Base-BF16 @ dfab899dadcff8f4d08af24b75a26c6d4d2e0b09 |
| Tamano del pack | 81,61 GiB (87.623.791.846 bytes, 65.613 tensores) |
| Vocabulario | 201.216 tokens (cabeza MultiMax) |
| Motor de inferencia | Qwegn v0.20.5+ recomendado (v0.18.0 minimo) |

## Arquitectura y entrenamiento

La arquitectura del modelo base ERNIE-5.5-Flash-Base combina dos esquemas de atencion en el mismo backbone. Las 37 capas HCA aplican compresion de KV a razon 128:1 combinada con un anillo de ventana deslizante de 128 tokens y RoPE escalado con YaRN (theta=160.000), con `o_groups=8`, `o_lora_rank=1024` y VHA. Las 6 capas MLA-DSA usan RoPE desacoplado con 64 cabezas, `index_topk=2048` y transformada de Walsh-Hadamard H_128. El MoE emplea `moe_latent_size=2048`, 512 expertos enrutados con `moe_split_feature_routing` (sigmoide de doble split, top-10) y un experto compartido, con activacion `SituAndMul` (beta=4.0, linear_beta=25.0). Se anaden 4 flujos Sinkhorn-20 `mHC` (`hc_eps=1e-6`, `hc_head`) y una capa compartida ECHO en la posicion 43.

No se dispone de informacion sobre el dataset de entrenamiento, numero de tokens, composicion ni si hubo RLHF, DPO o ajuste por instrucciones; el autor indica explicitamente que es un checkpoint pre-entrenado Base, no instruct. La innovacion tecnica de este artefacto concreto es la cuantizacion mixta: cada experto enrutado se rota mediante una transformada de Walsh-Hadamard ortonormal y se empaqueta en codebooks esfericos 4D SHVQ, mientras que el tronco y las cabezas permanecen en HQ8_G32. El motor Qwegn incorpora decodificacion especulativa ECHO integrada (`--mtp-drafts 1`) y cache de prefijo `.qwcache`.

## Capacidades

- Generacion de texto autoregresiva sobre el checkpoint base ERNIE-5.5-Flash-Base.
- Razonamiento y conocimiento general heredado del modelo original (no verificado en esta ficha).
- Capacidad de contexto largo: recall 3/3 en pruebas de aguja a 18,8K, 149,5K y 300K tokens, con residencia completa a 1M.
- Soporte de decodificacion especulativa nativa en el motor Qwegn (ECHO), con 89,5-100% de tasa de aceptacion.
- Capacidad de tool calling / function calling: no disponible (checkpoint Base sin ajuste por instrucciones).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad verificada.
- Capacidades multilingues: no disponible.
- Capacidades de vision: el flag `--no-load-vision` sugiere soporte opcional de vision en el runtime, pero no se documenta en esta model card.
- Modo thinking: no disponible.

## Casos de uso

- Investigacion de cuantizacion extrema en MoE: el pack sirve como referencia reproducible para medir el impacto de SHVQ frente a BF16 (KL de 0,1757 nats/token, 79,69% de acuerdo top-1) en un modelo de 280B, util para quien estudie tecnicas de compresion post-entrenamiento.
- Despliegue local de contexto masivo en Apple Silicon: con 1M tokens de contexto y residencia 100% en memoria unificada de 128 GB sin fallos de SSD, permite experimentar con tareas de recuperacion de informacion sobre corpus muy extensos en un solo Mac.
- Desarrollo y validacion del motor Qwegn: el pack es el artefacto de prueba para medir prefill (989 tok/s a 4K, 302,6 tok/s a 300K) y decode (31,39 tok/s serial, 40,22 tok/s con ECHO) en hardware M5 Max.
- Evaluacion de atencion comprimida: las 37 capas HCA con compresion 128:1 permiten estudiar el compromiso entre longitud de contexto y calidad de recuperacion en tareas de needle-in-a-haystack.
- Base para ajuste fino posterior: al ser un checkpoint pre-entrenado, puede servir de punto de partida para fine-tuning orientado a instrucciones, aunque el formato QWP1 exige conversion previa.
- Pruebas de latencia de primer token con cache: el uso de `.qwcache` reduce el TTFT de 22,79 s a 0,29 s (78,59x) en prompts de 19,3K tokens, escenario util para prototipar asistentes sobre documentos largos.

## Benchmarks y rendimiento

Datos medidos por el autor en un Apple M5 Max (Mac17,6, 128 GB de memoria unificada, GPU Apple10 NAX de 40 nucleos, macOS 26+) con `--kv-mode q4 --temperature 0 --no-load-vision --prefill-chunk-size 4096`:

| Metrica | Resultado |
|---|---|
| Prefill a 4K | 989 tok/s (pico 992) |
| Prefill a 16K | 909 tok/s |
| Prefill a 18,8K | 855,9 tok/s mediana / 898,9 pico |
| Prefill a 149,5K | 603,6 tok/s |
| Prefill a 300K | 302,6 tok/s |
| TTFT prompt corto en frio | 90-130 ms (5-11 tokens) |
| TTFT con `.qwcache` (19,3K tokens) | 22,79 s a 0,29 s (78,59x) |
| Decode serial | 31,39 tok/s (37,24 tok/s prompt corto con tope 1M) |
| Decode con ECHO especulativo | 40,22 tok/s (+28,1%), pico 42,42-42,57 tok/s |
| `llmprobe --bench-only` con ECHO | 37,0 tok/s mediana (35,6-39,4) |
| KL offline 64 posiciones vs BF16 | 0,1757 nats/token (p95 0,6654, max 0,9323) |
| Acuerdo top-1 vs BF16 | 79,69% |
| Recall 3 agujas a 18,8K / 149,5K / 300K | 3/3 en los tres casos |
| Residencia UMA a 1M | 100% residente (87,59 GiB planificado / 91,31 GiB RSS) |
| `llmprobe --eval-suite code` (10 preguntas, formato chat) | 3/10 |

No se han publicado resultados de benchmarks academicos estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada: 81,61 GiB de pesos; residencia planificada de 85,74 GiB a 20K de contexto y 87,59 GiB a 1M (RSS de 91,31 GiB), con presupuesto maximo de 107,46 GiB.
- Hardware verificado: Apple M5 Max con 128 GB de memoria unificada y GPU de 40 nucleos (Mac17,6). Es el unico hardware con mediciones publicadas.
- Cabe en GPU de consumo: no en el sentido convencional (RTX 4090 con 24 GB, insuficiente). Requiere un Mac con 128 GB de memoria unificada; no hay datos para configuraciones de 64 GB.
- Opciones de despliegue: exclusivamente el motor Qwegn (v0.20.5+ recomendado, v0.18.0 minimo). No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que usa el contenedor propietario QWP1.
- Latencia y throughput: prefill de 989 tok/s a 4K degradando a 302,6 tok/s a 300K; decode de 31,39 tok/s serial y 40,22 tok/s con decodificacion especulativa ECHO.
- Almacenamiento: 81,61 GiB en disco para el pack; el autor reporta 0 fallos de SSD en regimen estacionario a contexto completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / motor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ERNIE-5.5-Flash-Base-QWP-Mixed (este) | 280B totales / 14B activos | 1M | QWP1 / Qwegn | ernie-5.5-flash-base-model-license-v1.0 | Pack de 81,61 GiB, 0 descargas |
| baidu/ERNIE-5.5-Flash-Base-BF16 | 280B totales / 14B activos | no disponible | safetensors BF16 / no disponible | ernie-5.5-flash-base-model-license-v1.0 | 533,59 GiB, upstream oficial |
| `HQ8_G32 + HQ2_G128 + HQ3_G128` (esquema alternativo evaluado) | 280B totales / 14B activos | 1M | QWP1 / Qwegn | misma licencia | Esquema de cuantizacion alternativo; KL 0,1460, max 0,82 (datos truncados en la model card) |

No se dispone de datos de rendimiento en benchmarks academicos para establecer comparaciones con modelos de la misma categoria.

## Limitaciones y advertencias

- Perdida de fidelidad medible: KL de 0,1757 nats/token frente al oraculo BF16 y solo 79,69% de acuerdo top-1; el 20,31% restante implica divergencias en la distribucion de tokens que pueden afectar a tareas sensibles.
- Es un checkpoint Base, no instruct: el propio autor reporta 3/10 en `llmprobe --eval-suite code` con formato chat, lo que lo hace inadecuado para uso conversacional directo sin ajuste.
- Compatibilidad restringida: el formato QWP1 solo carga en Qwegn; no hay soporte para safetensors, GGUF, MLX, vLLM, llama.cpp ni Ollama.
- Requisito de hardware severo: 128 GB de memoria unificada en Apple Silicon; sin datos de funcionamiento en configuraciones menores.
- Licencia `ernie-5.5-flash-base-model-license-v1.0` (other): no es una licencia open source estandar; las condiciones de uso comercial deben consultarse en el fichero LICENSE del repositorio, no disponibles en la informacion proporcionada.
- Idiomas soportados no documentados: imposible evaluar cobertura multilingue.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero inherente a un modelo Base sin alineacion por RLHF.
- Sesgos conocidos: no documentados en la model card.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validacion comunitaria del artefacto.
- Sin soporte verificado de tool calling, agentes ni vision en esta ficha.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/qwegnai/ERNIE-5.5-Flash-Base-QWP-Mixed
- Modelo base: https://huggingface.co/baidu/ERNIE-5.5-Flash-Base-BF16
- Motor de inferencia Qwegn: https://github.com/qwegnai/qwegn
