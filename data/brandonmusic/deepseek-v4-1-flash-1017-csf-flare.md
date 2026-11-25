# brandonmusic/DeepSeek-V4.1-Flash-1017-CSF-Flare

## Resumen

DeepSeek-V4.1-Flash-1017-CSF-Flare es un paquete de inferencia precompilado para el modelo DeepSeek V4.1 Flash 1017, un modelo de mezcla de expertos (MoE) multimodal texto-imagen desarrollado por DeepSeek AI. El paquete lo publica el usuario brandonmusic y esta empaquetado especificamente para el runtime nativo en Rust Flare (NVIDIA/hyperflare-inference), con pesos, kernels CUDA compilados, grafos de ejecucion capturados y metadatos firmados. No es un modelo nuevo: es una revision de pesos cuantizados y preparados para servir el modelo base en cuatro GPU NVIDIA RTX PRO 6000 Blackwell (SM120 / gb202) con paralelismo tensorial.

El modelo base tiene 40 capas, anchura oculta de 5.120, 64 cabezas de atencion, 384 expertos enrutados mas uno compartido con enrutamiento top-6, vocabulario de 129.280 entradas y una ventana de contexto de 1.048.576 tokens. Incluye torre de vision, tres capas MTP (multi-token prediction) para decodificacion especulativa y tablas de embedding Engram de 188,8 GiB. La relevancia de esta publicacion es operativa: demuestra un despliegue de muy baja latencia y alto throughput sobre hardware Blackwell consumer/workstation mediante un runtime sin Python y sin compilacion en tiempo de ejecucion.

El paquete ocupa 508,8 GB (473,9 GiB, 197 archivos) y solo es cargable por Flare; Transformers, vLLM, SGLang y llama.cpp no pueden leer este formato. La licencia declarada del paquete es Apache 2.0, mientras que la model card indica que el modelo base se publico bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion multi-head latent (MLA), torre de vision y capas MTP; runtime Flare en Rust |
| Parametros totales | no disponible |
| Parametros activos | no disponible (enrutamiento top-6 sobre 384 expertos enrutados + 1 compartido) |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | MXFP4 (expertos enrutados), NVFP4 (cabeza draft), FP8 (KV cache comprimida y cabeza Markov), BF16 (computo de atencion), W4A8 prequantizado en expertos compactos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (paquete); modelo base declarado MIT en la model card |
| Formato de pesos | `model.safetensors` firmado con archivos complementarios content-addressed en `weights/` y `deployments/`; formato propietario de Flare, no compatible con GGUF ni safetensors estandar de Transformers |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de 40 capas con anchura oculta 5.120 y 64 cabezas de atencion, que emplea atencion multi-head latent (MLA) con cache KV comprimida en FP8 y computo en BF16 (`--mla-compute-mode bf16`). Dispone de 384 expertos enrutados mas un experto compartido con enrutamiento top-6, vocabulario de 129.280 entradas y una torre de vision que habilita la modalidad image-text-to-text. Incorpora tres capas MTP para decodificacion especulativa y tablas de embedding Engram de 188,8 GiB que se cargan en RAM del host.

El paquete aplica una preparacion especifica para servir en cuatro GPU: escalas de bloque E8M0 32×32 de los expertos MXFP4 conservadas de forma sin perdida mediante la codificacion CSF de Local Inference Lab (`row-base-offset1-u24-exceptions/1`), que comprime 46.080 tensores de escala de 16.986.931.200 bytes a 2.316.453.540 bytes con verificacion SHA-256 bit-exacta contra cada shard original. El modo de decodificacion especulativa es MTP-only con 7 tokens draft por ronda y verificacion adaptativa (presupuesto maximo de 128 tokens, alpha 0,6), muestreo paralelo de vocabulario y colectivos PCIe TP4 `RO=1` ajustados en tiempo de ejecucion con split asimetrico `rot_rsag64` 0/33/33/33. No se proporcionan datos sobre el numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 1.048.576 tokens por peticion.
- Procesamiento de imagenes y entrada image-text-to-text mediante torre de vision integrada.
- Decodificacion especulativa con tres capas MTP y verificacion adaptativa, con tasa de aceptacion de drafts del 52,5 % medida.
- Servicio concurrente de hasta 32 peticiones simultaneas.
- API compatible con OpenAI bajo el nombre de modelo `DeepSeek-V4.1-Flash`.
- Modo de razonamiento explicito conmutable (`thinking: true` / `thinking: false`), segun las pruebas de tarea de codificacion reportadas.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Servicio de chat conversacional de alta concurrencia: el runtime sostiene 32 peticiones simultaneas con 2.138,4 tok/s agregados (66,8 tok/s por usuario), adecuado para plataformas de asistencia con muchos usuarios concurrentes sobre cuatro GPU.
- Analisis de documentos extensos con imagenes: la ventana de 1.048.576 tokens y la torre de vision permiten procesar contratos, informes o expedientes completos con figuras en una sola peticion, con prefill de 128K tokens en 6,18 s (20.789 tok/s).
- Generacion de codigo interactiva: en la tarea HTML Tetris se midieron 788,4 tok/s de mediana en modo sin razonamiento y 569,2 tok/s con razonamiento, lo que lo hace apto para asistentes de codigo de baja latencia en IDE.
- RAG sobre corpus masivos: la cache KV compartida de 72,9 GiB (21.102.592 tokens) en cuatro GPU permite mantener en memoria contextos de multiples sesiones y reutilizar snapshots (1.997 slots), reduciendo recalculos en pipelines de recuperacion aumentada.
- Procesamiento batch de imagenes y texto: el throughput agregado de 2.138,4 tok/s a 32 peticiones sirve para clasificacion, extraccion o resumen de lotes grandes de documentos multimodales.
- Despliegue on-premise con API compatible OpenAI: al exponer el endpoint con el nombre `DeepSeek-V4.1-Flash`, se puede integrar como sustituto directo en aplicaciones existentes que ya consumen la API de OpenAI, sin cambiar el codigo cliente.
- Evaluacion de modelos multimodales en laboratorio: el paquete firmado y reproducible (SHA-256 bit-exacto en escalas) facilita experimentos controlados de decodificacion especulativa y cuantizacion MXFP4/NVFP4/FP8 sobre Blackwell.

## Benchmarks y rendimiento

| Medicion | Resultado |
|---|---|
| Prefill en frio, prompt de 8K tokens (C1) | 23.498 tok/s (0,35 s TTFT) |
| Prefill en frio, prompt de 64K tokens (C1) | 22.038 tok/s (2,92 s TTFT) |
| Prefill en frio, prompt de 128K tokens (C1) | 20.789 tok/s (6,18 s TTFT) |
| Decodificacion sostenida, 1 peticion | 375,2 tok/s |
| Decodificacion sostenida, 2 peticiones (agregado) | 556,7 tok/s (278,4 tok/s por usuario) |
| Decodificacion sostenida, 4 peticiones (agregado) | 858,7 tok/s (214,7 tok/s por usuario) |
| Decodificacion sostenida, 8 peticiones (agregado) | 1.114,9 tok/s (139,4 tok/s por usuario) |
| Decodificacion sostenida, 16 peticiones (agregado) | 1.518,4 tok/s (94,9 tok/s por usuario) |
| Decodificacion sostenida, 32 peticiones (agregado) | 2.138,4 tok/s (66,8 tok/s por usuario) |
| Tasa de aceptacion de drafts | 52,5 % (0,525) |
| Tarea de codificacion HTML Tetris, `thinking: false` (5 ejecuciones) | 788,4 tok/s mediana / 821,4 tok/s mejor (122,0 pasos/s, pico de 888,6 tok/s en 1 s) |
| Tarea de codificacion HTML Tetris, `thinking: true` (3 ejecuciones) | 569,2 tok/s mediana / 589,4 tok/s mejor (119,6 pasos/s, pico de 828,4 tok/s en 1 s) |
| Cache KV compartida en GPU | 72,9 GiB / 21.102.592 tokens (1.997 slots de snapshot) |
| Tiempo de arranque desde NVMe (Engram en RAM) | 112–113 s (53,5 s carga de pesos, 41,7 s carga de Engram) |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM: el paquete esta preparado para cuatro GPU de 96 GB cada una (384 GB totales). No se especifica una huella minima por GPU, pero el formato asume TP4 sobre ese hardware.
- GPU recomendadas: 4× NVIDIA RTX PRO 6000 Blackwell 96 GB (SM120 / gb202) en un solo host Linux x86-64. Las mediciones se hicieron con dos tarjetas Max-Q a 300 W y dos Workstation Edition a 350 W.
- No cabe en GPU consumer de gama alta convencional (RTX 4090, etc.) ni en configuraciones de menos de cuatro GPU de 96 GB.
- Despliegue: exclusivamente mediante el runtime Flare (`NVIDIA/hyperflare-inference`) en Rust. Transformers, vLLM, SGLang y llama.cpp no pueden cargar este formato.
- Almacenamiento: 508,8 GB de paquete en NVMe; el arranque tarda 112–113 s con las tablas Engram en RAM del host.
- Latencia y throughput: TTFT de 0,35 s para 8K tokens y 6,18 s para 128K; decodificacion de 375,2 tok/s en una peticion y hasta 2.138,4 tok/s agregados con 32 peticiones.
- Memoria host: requiere RAM suficiente para alojar las tablas Engram de 188,8 GiB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia |
|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-CSF-Flare (este paquete) | no disponible (MoE top-6, 384+1 expertos) | 1.048.576 tokens | Flare (Rust), TP4 en 4× RTX PRO 6000 Blackwell | Apache 2.0 (paquete); MIT (base) |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (modelo base) | no disponible | 1.048.576 tokens | safetensors estandar | MIT |
| Alternativas de mismo tamano o tarea | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Dependencia total del runtime Flare: no es utilizable con vLLM, SGLang, llama.cpp, Ollama ni Transformers, lo que limita la portabilidad y el ecosistema de herramientas.
- Requiere hardware muy especifico: cuatro RTX PRO 6000 Blackwell 96 GB (SM120) en un unico host; no hay soporte declarado para otras GPU.
- El paquete es una revision de pesos preparados, no un modelo entrenado de nuevo; cualquier limitacion del modelo base se hereda.
- La licencia del paquete (Apache 2.0) y la del modelo base (MIT, segun la model card) deben verificarse antes de uso comercial; la discrepancia entre ambas debe resolverse con el autor.
- No se publican datos de sesgos, tasas de alucinacion ni evaluaciones de seguridad del modelo base en esta informacion.
- Idiomas soportados no declarados: no hay garantia de calidad multilingue fuera de los idiomas del entrenamiento original.
- El arranque tarda cerca de dos minutos y exige 508,8 GB de almacenamiento NVMe mas RAM para las tablas Engram (188,8 GiB), lo que encarece el escalado y la recuperacion ante fallos.
- La tasa de aceptacion de drafts del 52,5 % implica que la decodificacion especulativa no siempre acelera; el rendimiento depende de la carga y del modo de razonamiento.
- No hay benchmarks academicos publicados, por lo que la calidad del modelo no puede contrastarse con alternativas a partir de esta ficha.
- El paquete tiene 0 descargas y 1 like en el momento de la consulta: es una publicacion reciente y poco validada por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/brandonmusic/DeepSeek-V4.1-Flash-1017-CSF-Flare
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Revision `gb202` (instalacion y despliegue): https://huggingface.co/brandonmusic/DeepSeek-V4.1-Flash-1017-CSF-Flare/blob/gb202/README.md
- Archivo de creditos: https://huggingface.co/brandonmusic/DeepSeek-V4.1-Flash-1017-CSF-Flare/blob/main/CREDITS.md
- Runtime Flare: https://github.com/NVIDIA/hyperflare-inference
- Paper, blog o demo oficiales: no disponible en la informacion proporcionada.
