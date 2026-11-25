# hermitdave/SenseNova-Loop-9B-MLX-RCO-4.5bpw-imatrix-ours-4x6

## Resumen

SenseNova-Loop-9B-MLX-RCO-4.5bpw-imatrix-ours-4x6 es una cuantizacion en formato MLX del modelo SenseNova-Loop-9B, publicada por el usuario hermitdave. Se trata de una conversion orientada a Apple Silicon que aplica una cuantizacion afina mixta de precision (4 y 6 bits) mediante un pipeline RCO (rate-constrained optimisation), con una imatrix capturada de las propias activaciones del modelo y clipping por grupo ponderado por dicha imatrix. El checkpoint resultante ocupa 6,445 GB y esta pensado para ejecutarse con la libreria `mlx_lm` en equipos con chip de Apple.

El modelo base, SenseNova-Loop-9B, emplea una arquitectura de transformer con bucles (looped transformer) sobre un backbone Qwen3.5-text que combina atencion lineal GatedDeltaNet y atencion completa. El bloque de decodificacion entre las capas 4 y 28 se ejecuta dos veces con pesos compartidos, lo que resulta en 56 ejecuciones de capa por pase, ademas de un mecanismo mHC (multi-hyper-connection) con dos flujos residuales y mezcla normalizada por Sinkhorn. El modelo cuenta con 8.957 mil millones de parametros de texto y un vocabulario de 248.320 tokens.

La relevancia de esta publicacion radica en que demuestra una tecnica de cuantizacion mixta con preservacion selectiva de capas en BF16 (norms, convoluciones, routers y el gate vestigial) que reduce el peso de 24,70 GB en BF16 a 10,65 GB de memoria pico en inferencia, con un incremento de perplejidad de solo 0,55 puntos en WikiText-2. Es una ficha util para desarrolladores que quieran evaluar el modelo en hardware de Apple sin renunciar a una calidad cercana a la version completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucles (looped transformer) sobre backbone Qwen3.5-text: GatedDeltaNet linear attention + full attention; 32 capas distintas, bloque [4, 28) ejecutado dos veces con pesos compartidos (56 ejecuciones por pase); mHC con dos flujos residuales y mezcla Sinkhorn (20 iteraciones) |
| Parametros totales | 9.656.250.480 (8.957 B de texto + torres multimodales injertadas en BF16) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MLX affine, group size 64, mixta 4/6 bits (202 modulos a 4 bits, 48 a 6 bits); embeddings cuantizados con suelo de 4 bits; capas preservadas en BF16: norms, `linear_attn.conv1d`, routers `mhc_*`, `loop_gate` |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), repo de 6,5 GB; checkpoint completo 6,445 GB / 5,34 bpw; tronco cuantizado 5,037 GB / 4,50 bpw |

## Arquitectura y entrenamiento

El modelo base SenseNova-Loop-9B emplea una arquitectura de transformer con bucles: un backbone Qwen3.5-text con 32 capas de decodificacion distintas, de las cuales el bloque comprendido entre las capas 4 y 28 se ejecuta dos veces compartiendo pesos, lo que da lugar a 56 ejecuciones de capa por pase de inferencia. La atencion combina GatedDeltaNet (atencion lineal) con atencion completa, y el modelo incorpora un mecanismo mHC (multi-hyper-connection) con dos flujos residuales y mezcla normalizada mediante Sinkhorn con 20 iteraciones. Las dimensiones son 4096 de hidden, 12288 de FFN y un vocabulario de 248.320 tokens.

Esta publicacion concreta no entrena el modelo, sino que aplica una cuantizacion RCO (rate-constrained optimisation) sobre una base de datos de error RTN por tensor, con asignacion de anchos de bit entre dos candidatos (4 y 6 bits). La imatrix se captura de 128 filas de calibracion de WikiText-2 con 2048 tokens, cubriendo 249 tensores, y se aplica un clipping por grupo ponderado por dicha imatrix a esos mismos 249 tensores. La diferencia de +0,5 bpw entre el objetivo nominal (4,25 bpw) y el valor en disco (4,50 bpw) corresponde a la escala y el sesgo afines almacenados por grupo (32 bits por cada 64 pesos). El checkpoint incluye ademas dos torres multimodales injertadas en BF16 (vision tower de 0,91 GB y MTP head de 0,49 GB) que, segun el autor, son puramente de archivo y no son funcionales con los runtimes actuales.

## Capacidades

- Generacion de texto conversacional y de proposito general, segun el pipeline declarado `text-generation`.
- Razonamiento y generacion de codigo, heredados del modelo base SenseNova-Loop-9B (no se detallan capacidades especificas en la informacion disponible).
- Capacidades multimodales: el checkpoint incluye una torre de vision en BF16, pero el autor indica explicitamente que no es funcional en `mlx_lm` ni en `mlx_vlm` con esta arquitectura; los tensores se cargan de forma inerte.
- MTP (multi-token prediction): la cabeza esta presente en BF16 pero no es funcional; el autor advierte de no activarla porque ningun runtime la implementa para esta arquitectura y, ademas, la tasa de aceptacion medida es demasiado baja para que la decodificacion especulativa compense.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo de pensamiento (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint esta disenado para ejecutarse con `mlx_lm` en chips M-series, con un pico de memoria de 10,65 GB frente a 24,70 GB en BF16, lo que permite desplegarlo en equipos de 16 GB o mas de memoria unificada.
- Generacion de texto interactiva en portatiles: con un rendimiento medido de 10,8 tok/s en decodificacion sobre un M3 Max de 64 GB (frente a 7,3 tok/s en BF16), es adecuado para asistentes de escritura, resumenes y chat local sin conexion.
- Prototipado de aplicaciones conversacionales: al ser un modelo de 9B con licencia Apache 2.0, puede integrarse en prototipos de atencion al cliente o asistentes internos que se ejecuten en estaciones de trabajo con chip de Apple.
- Evaluacion de tecnicas de cuantizacion: la model card documenta con detalle el pipeline RCO, la imatrix y las metricas de perplejidad, KL y acuerdo top-1, lo que lo convierte en un caso de referencia para investigadores que estudien cuantizacion mixta.
- Experimentacion con arquitecturas de transformer con bucles: permite probar el comportamiento de un modelo con pesos compartidos y ejecucion repetida de bloques en un entorno MLX accesible, sin necesidad de GPU dedicada.
- Despliegue en servidor local con oMLX: el autor reporta cifras de servicio de 7,8 a 10,0 tok/s con contextos de 1K a 8K tokens, util para entornos de desarrollo y pruebas de integracion en red local.
- Base para futuras conversiones: al preservar las torres de vision y MTP en BF16, el checkpoint puede servir de punto de partida cuando los runtimes incorporen soporte para `sensenova_loop`.

## Benchmarks y rendimiento

Validacion en WikiText-2 test (130.816 tokens, longitud de secuencia 512), referencia MLX BF16 del mismo checkpoint:

| Metrica | BF16 | Esta cuantizacion |
|---|---|---|
| Perplejidad | 15,8905 +/- 0,1426 | 16,4454 +/- 0,1480 (+0,55) |
| KL(ref \|\| quant) | — | 0,1048 |
| Acuerdo top-1 | — | 84,46% |
| Memoria pico | 24,70 GB | 10,65 GB |

Rendimiento medido en M3 Max de 64 GB con `mlx-lm` local (prompt natural de 63 tokens, 128 tokens de decodificacion, 2 calentamientos y 3 ejecuciones):

| Metrica | BF16 | Esta cuantizacion |
|---|---|---|
| Prefill | 116,9 tok/s | 135,8 tok/s |
| Decode | 7,3 tok/s | 10,8 tok/s |

Servicio con oMLX (prompts de WikiText-2, tokens/s reportados por el servidor):

| Contexto | Ejecuciones (tok/s) |
|---|---|
| ~1K (990 tokens de prompt) | 7,8 / 10,0 / 10,0 |
| ~8K (7.461 tokens de prompt) | 10,0 / 9,6 (5,0 en frio) |

Acuerdo top-1 de la cabeza MTP injertada con el backbone (decodificacion especulativa, no funcional):

| Backbone | Acuerdo depth-1 | Acuerdo depth-3 | Media aceptada/ciclo @3 |
|---|---|---|---|
| Referencia BF16 | 48,5% (16/33) | 19,0% (12/63) | 0,57 |
| Esta cuantizacion (`{4,6}`) | 29,7% (11/37) | 15,3% (11/72) | 0,46 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 10,65 GB de pico en inferencia segun la validacion del autor; el checkpoint completo ocupa 6,445 GB en disco.
- GPU recomendadas: el formato MLX esta orientado exclusivamente a Apple Silicon; no es compatible con CUDA. El autor reporta mediciones en un M3 Max de 64 GB.
- Cabe en GPU de consumo: si, en equipos Apple con memoria unificada de 16 GB o superior; no esta pensado para GPUs NVIDIA/AMD.
- Opciones de despliegue: `mlx_lm` (CLI y Python) y oMLX. Requiere `trust_remote_code=True` porque la arquitectura se distribuye como `model_file: sensenova_loop.py`; en oMLX hay que activar `"trust_remote_code": true` en `~/.omlx/model_settings.json`. No es compatible con vLLM, llama.cpp, Ollama ni TGI por el formato MLX.
- Latencia y throughput: prefill de 135,8 tok/s y decode de 10,8 tok/s en M3 Max con `mlx-lm`; en servicio con oMLX, entre 7,8 y 10,0 tok/s con contextos de 1K a 8K tokens (5,0 tok/s en la primera ejecucion en frio a 8K).
- Nota: el autor indica que hay un PR pendiente para anadir la arquitectura a `mlx-lm`; cuando se publique una version que la incluya, se podra cargar sin la clave `model_file` ni la bandera de codigo remoto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| hermitdave/SenseNova-Loop-9B-MLX-RCO-4.5bpw-imatrix-ours-4x6 | 9,66 B totales (8,957 B de texto) | No disponible | MLX safetensors, 4/6 bits mixtos | Apache 2.0 | Cuantizacion RCO con imatrix; 10,65 GB de pico; 10,8 tok/s decode en M3 Max |
| sensenova/SenseNova-Loop-9B (BF16) | 9,66 B totales | No disponible | safetensors BF16 | Apache 2.0 | Referencia sin cuantizar; 24,70 GB de pico; 7,3 tok/s decode en M3 Max |
| Modelos MLX de ~9B en 4 bits (generico) | ~9 B | No disponible | MLX 4 bits | Variable | No se dispone de datos comparativos especificos en la informacion proporcionada |

## Limitaciones y advertencias

- La torre de vision y la cabeza MTP incluidas en el checkpoint no son funcionales: `mlx_lm` descarta ambos prefijos en `sanitize()`, oMLX no tiene parche para `sensenova_loop` y `mlx_vlm` carece del modelo de lenguaje con bucles y mHC. El autor las califica de archivisticas.
- No se debe activar MTP: ningun runtime lo implementa para esta arquitectura y, ademas, la tasa de aceptacion medida (29,7% en depth-1 y 15,3% en depth-3 con esta cuantizacion, 48,5% y 19,0% en BF16) es demasiado baja para que la decodificacion especulativa compense el coste.
- La cuantizacion introduce una degradacion medible: +0,55 de perplejidad en WikiText-2, KL de 0,1048 y acuerdo top-1 del 84,46% respecto a BF16. En la cabeza MTP, la cuantizacion casi triplica la tasa de error respecto al modelo sin cuantizar.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo Python distribuido con el repositorio; conviene revisarlo antes de desplegarlo en entornos de produccion.
- Solo es compatible con el ecosistema MLX (Apple Silicon); no puede desplegarse en GPUs NVIDIA, AMD ni en infraestructura x86 convencional.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda conservar los avisos de atribucion al modelo base y al autor de la conversion.
- No se dispone de informacion sobre sesgos, idiomas soportados, riesgo de alucinacion especifico ni longitud de contexto maxima; estos datos deberian consultarse en la model card del modelo base.
- El modelo base es de noviembre de 2026 segun la fecha de creacion del repositorio; conviene verificar la vigencia del checkpoint y de los runtimes compatibles antes de adoptarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hermitdave/SenseNova-Loop-9B-MLX-RCO-4.5bpw-imatrix-ours-4x6
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Libreria MLX LM: https://github.com/ml-explore/mlx-lm
- Libreria MLX (Apple): https://github.com/ml-explore/mlx
- oMLX: no disponible en la informacion proporcionada
- Paper o blog del modelo base: no disponible en la informacion proporcionada
