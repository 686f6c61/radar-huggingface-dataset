# qwegnai/ERNIE-5.5-Flash-Base-hq8g32-shvq15g64-shvq3g64

## Resumen

ERNIE-5.5-Flash-Base en formato `HQ8_G32 + SHVQ15_G64 + SHVQ3_G64` es un empaquetado de pesos cuantizados del checkpoint base `baidu/ERNIE-5.5-Flash-Base-BF16` (533,59 GiB en BF16), publicado por el usuario `qwegnai` para su motor de inferencia propietario Qwegn, un runtime en Swift + Metal 4 orientado a Apple Silicon. No es un modelo nuevo: es una redistribucion cuantizada del modelo base de Baidu, comprimida de 533,59 GiB a 81,61 GiB (2,52 bits por parametro) mediante una combinacion de cuantizacion vectorial esferica con transformada de Hadamard (SHVQ) para los expertos enrutados y cuantizacion densa HQ8_G32 para el tronco.

El modelo subyacente es un transformer MoE de 280B parametros totales con 14B activos por token (mas 0,36B de una capa compartida ECHO), 43 capas de backbone y una ventana de contexto nativa de 1.048.576 tokens. Combina 37 capas de Heavily Compressed Attention (HCA, compresion KV 128:1) con 6 capas MLA-DSA de RoPE desacoplado, e incorpora 512 expertos enrutados con routing sigmoide dual-split top-10.

La relevancia de este empaquetado es practica: demuestra que un modelo de 280B puede residir al 100% en memoria unificada de un Mac de 128 GB (Apple M5 Max) con contexto de 1M tokens, sin misses de SSD, a costa de una perdida de fidelidad medible (KL de 0,1757 nats/token frente al oraculo BF16 y 79,69% de acuerdo top-1). Es un artefacto de nicho, atado a un runtime concreto y sin datos de benchmarks estandar publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido: 43 capas (1 FFN densa + 42 Latent-MoE), 37 capas HCA (Heavily Compressed Attention) + 6 capas MLA-DSA con RoPE desacoplado, 4-stream Sinkhorn-20 mHC, lm_head MultiMax |
| Parametros totales | 280B (81,61 GiB empaquetados, 2,52 bits/param) |
| Parametros activos | 14B por token + 0,36B de capa compartida ECHO |
| Longitud de contexto | 1.048.576 tokens (1M) nativa; HCA con YaRN theta=160.000 |
| Tipos de cuantizacion | HQ8_G32 (tronco, 8,50 bpw), SHVQ15_G64 (expertos w1/w3, 1,75 bpw), SHVQ3_G64 (expertos w2, 3,25 bpw); media 2,26 bpw en expertos enrutados |
| Idiomas soportados | no disponible |
| Licencia | ernie-5.5-flash-base-model-license-v1.0 (etiquetada como "other") |
| Formato de pesos | Contenedor propietario QWP1 (no safetensors, no GGUF, no MLX); solo carga en Qwegn v0.18.0+ (recomendado v0.20.5+) |

## Arquitectura y entrenamiento

El backbone consta de 43 capas: una capa FFN densa y 42 capas Latent-MoE con `moe_latent_size=2048`, 512 expertos enrutados y un experto compartido. El routing usa `moe_split_feature_routing` con sigmoide dual-split y top-10, y la activacion es `SituAndMul` con `beta=4.0` y `linear_beta=25.0`. La atencion se reparte entre 37 capas HCA (compresion KV 128:1, anillo SWA de 128 tokens, YaRN theta=160.000, `o_groups=8`, `o_lora_rank=1024`, VHA) y 6 capas MLA-DSA de RoPE desacoplado con 64 cabezas e `index_topk=2048` sobre transformada Walsh-Hadamard H_128. Se anaden 4 streams Sinkhorn-20 mHC (`hc_eps=1e-6`) y un lm_head MultiMax con vocabulario de 201.216 tokens. La capa 43 compartida actua como modulo ECHO, base de la decodificacion especulativa integrada.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de datos ni si hubo RLHF o DPO: la model card del empaquetado no lo documenta y el checkpoint es un modelo Base (no instruct). La innovacion tecnica documentada es la cuantizacion mixta: cada tensor de experto enrutado se rota mediante transformada ortogonal de Walsh-Hadamard y se empaqueta en codebooks SHVQ esfericos 4D, mientras el tronco denso, atencion, routers, experto compartido y cabeza se mantienen en HQ8_G32. El resultado son 65.613 tensores en 87.623.791.846 bytes.

## Capacidades

- Generacion de texto autoregresiva sobre un checkpoint Base pre-entrenado, sin ajuste por instrucciones.
- Razonamiento y generacion de codigo en formato chat: la suite de evaluacion `code` del motor obtiene 3/10 en v0.20.5, coherente con un modelo sin instruccion.
- Contexto largo extremo: recuperacion 3/3 en pruebas de aguja (needle passkey) a 18,8K, 149,5K y 300K tokens.
- Capacidad multilingue: no documentada en la informacion disponible.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Decodificacion especulativa integrada (ECHO, `--mtp-drafts 1`) con aceptacion del 89,5-100%.
- Vision: el motor admite `--no-load-vision`, lo que sugiere soporte de vision en el runtime, pero no se detalla en la informacion disponible.

## Casos de uso

- Procesamiento de documentos extensos en local: con 1M tokens de contexto y residencia completa en 128 GB de memoria unificada, permite analizar libros tecnicos, expedientes o bases de codigo completas sin trocear en un Mac de sobremesa.
- Investigacion sobre cuantizacion extrema: sirve como caso de estudio reproducible de SHVQ mixto y del compromiso entre compresion (2,52 bpw) y fidelidad (KL 0,1757 nats/token), util para quienes disenan esquemas de cuantizacion.
- Evaluacion de runtimes de inferencia en Apple Silicon: el pack esta pensado para medir prefill, decodificacion y residencia UMA en hardware concreto (M5 Max, 40 nucleos GPU), por lo que encaja en comparativas de motores (Qwegn frente a llama.cpp/MLX).
- Generacion de texto asistida por few-shot: al ser un modelo Base, se puede usar con prompts de ejemplos para tareas de continuacion y extraccion, sin esperar obediencia a instrucciones.
- Recuperacion sobre corpus largos: las pruebas de aguja a 300K tokens lo hacen apto para prototipos de busqueda semantica y QA sobre repositorios documentales.
- Base para fine-tuning posterior: al ser un checkpoint pre-entrenado, puede servir de punto de partida para ajuste supervisado en dominios concretos antes de cuantizar de nuevo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los datos publicados son de rendimiento del motor y fidelidad de cuantizacion:

| Metrica | Resultado |
|---|---|
| Prefill 4K / 16K / 18,8K / 149,5K / 300K | 989 (pico 992) / 909 / 855,9-898,9 / 603,6 / 302,6 tok/s |
| TTFT prompt corto en frio | 90-130 ms |
| TTFT con `.qwcache` montado (19,3K tok) | 22,79 s -> 0,29 s (78,59x) |
| Decodificacion serial (d=0) | 31,39 tok/s (37,24 tok/s prompt corto a 1M) |
| Decodificacion especulativa ECHO (d=1) | 40,22 tok/s (+28,1%), pico 42,42-42,57 tok/s |
| `llmprobe --bench-only` (servidor, ECHO d=1) | 37,0 tok/s mediana (35,6-39,4) |
| KL offline 64 posiciones vs BF16 | 0,1757 nats/token (p95 0,6654, max 0,9323) |
| Acuerdo top-1 vs BF16 | 79,69% |
| Aguja 3/3 a 18,8K / 149,5K / 300K | 86,35 / 86,97 / 87,77 GiB |
| Residencia UMA a 1M tokens | 100% (87,59 GiB planificado, 91,31 GiB RSS) |
| Suite `code` (10 preguntas, formato chat) | 3/10 |

Comparativa de esquemas de cuantizacion publicada en la model card (parcial):

| Esquema | KL medio (nats/tok) | KL max | Acuerdo top-1 |
|---|---|---|---|
| HQ8_G32 + SHVQ15_G64 + SHVQ3_G64 (este pack) | 0,1757 | 0,9323 | 79,69% |
| HQ8_G32 + HQ2_G128 + HQ3_G128 | 0,1460 | 0,82 (dato truncado) | no disponible |

## Requisitos de hardware

- VRAM/memoria unificada: 85,74 GiB planificados a 20K de contexto; 87,59 GiB planificados y 91,31 GiB RSS a 1M de contexto con KV `q4` (4.925 B/token).
- Hardware medido: Apple M5 Max (`Mac17,6`), 128 GB de memoria unificada, GPU Apple10 NAX de 40 nucleos, macOS 26+.
- No cabe en GPUs de consumo con VRAM discreta (RTX 4090 de 24 GB, etc.); requiere un Mac con 128 GB de memoria unificada para residencia total.
- Despliegue: exclusivamente mediante el motor Qwegn (v0.18.0 minimo, v0.20.5 recomendado), con servidor `qwg serve`. No es compatible con vLLM, llama.cpp, Ollama, TGI ni MLX.
- Throughput medido: 989 tok/s de prefill a 4K, 302,6 tok/s a 300K, 31,39 tok/s de decodificacion serial y 40,22 tok/s con ECHO.
- Almacenamiento: 81,61 GiB de pesos; el cache `.qwcache` ocupa 111,42 MiB para el caso medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ERNIE-5.5-Flash-Base (este pack Qwegn) | 280B totales / 14B activos | 1.048.576 | QWP1 (solo Qwegn) | ernie-5.5-flash-base-model-license-v1.0 | Hugging Face, 0 descargas |
| baidu/ERNIE-5.5-Flash-Base-BF16 | 280B totales / 14B activos | no disponible | safetensors BF16 (533,59 GiB) | ernie-5.5-flash-base-model-license-v1.0 | Hugging Face (upstream) |
| Alternativas de tamano similar (otros MoE de ~280B) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento de benchmarks comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Es un checkpoint Base sin ajuste por instrucciones: no sigue instrucciones de forma fiable (3/10 en la suite de codigo en formato chat).
- Perdida de fidelidad medible frente a BF16: KL medio de 0,1757 nats/token y solo 79,69% de acuerdo top-1; el 20,31% restante de tokens puede divergir.
- Dependencia total del runtime Qwegn: el contenedor QWP1 no es portable a safetensors, GGUF ni MLX, lo que limita su uso fuera de Apple Silicon.
- Requiere 128 GB de memoria unificada para residencia completa; en configuraciones menores el rendimiento caera por paginacion o misses.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingue.
- Licencia "other" con nombre `ernie-5.5-flash-base-model-license-v1.0`: es necesario revisar el fichero LICENSE del repositorio antes de cualquier uso comercial, ya que las condiciones no estan resumidas en la informacion disponible.
- Riesgo de alucinacion y sesgos: no documentados por el autor; al ser un modelo Base, la generacion libre puede producir contenido no verificado.
- Repositorio sin descargas ni likes y con fecha de creacion futura (2026-11-14) en los metadatos: conviene verificar la integridad y procedencia de los pesos antes de usarlos en produccion.
- El soporte de vision no esta confirmado; el flag `--no-load-vision` del motor sugiere su existencia, pero no hay documentacion al respecto.

## Enlaces

- Repositorio del pack: https://huggingface.co/qwegnai/ERNIE-5.5-Flash-Base-hq8g32-shvq15g64-shvq3g64
- Modelo base upstream: https://huggingface.co/baidu/ERNIE-5.5-Flash-Base-BF16
- Motor de inferencia Qwegn: https://github.com/qwegnai/qwegn
- Licencia: fichero LICENSE del repositorio del pack (ernie-5.5-flash-base-model-license-v1.0)
