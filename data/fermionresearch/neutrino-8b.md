# FermionResearch/Neutrino-8B

## Resumen

Neutrino-8B es un modelo de lenguaje conversacional de 8.190 millones de parámetros desarrollado por Fermion Research, basado en Qwen/Qwen3-8B bajo licencia Apache-2.0. Su característica distintiva es que todos los pesos lineales del transformer se almacenan en formato ternario de cinco valores (sub-2 bits por peso), lo que permite empaquetar el modelo completo en un contenedor de 3,88 GB y un transporte comprimido de solo 2,56 GB, manteniendo una carga nativa como modelo `transformers` con una única llamada a `from_pretrained`.

El modelo resuelve el problema del despliegue local de modelos de 8B en hardware de consumo: con una ocupación de VRAM de 4,68 GiB a 4k de contexto, cabe en GPUs de 8 GB, y funciona en CPU a velocidades útiles (24,94 tok/s en Apple M5). Incluye soporte para chat, tool calling y aplicaciones compatibles con OpenAI, con streaming y sesión KV persistente habilitadas por defecto. Su relevancia actual radica en ser uno de los pocos modelos publicados que combina cuantización ternaria con entrenamiento QAT (quantization-aware training) en una arquitectura moderna de 8B, ofreciendo un artefacto único que sirve en CUDA, Apple silicon y x86.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con GQA (Qwen3 topology), 36 capas, hidden 4096, FFN SwiGLU 12288 |
| Parametros totales | 8.190.735.360 (6.945.767.424 proyeccion ternaria + 1.244.659.712 embedding int8 + 308.224 norm fp32) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantizacion | Ternaria de cinco valores (sub-2 bits) en pesos lineales; embeddings int8; escalares fp32; formato FV5 en el pack GGUF |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Contenedor TRTC v4 (`neutrino-8b_v4.bin`), transporte tv4z, GGUF (FV5, fork propio de llama.cpp), MLX |

## Arquitectura y entrenamiento

La arquitectura replica la topología de Qwen3-8B: 36 capas decoder con hidden width de 4.096, feed-forward gated SwiGLU de 12.288, atención grouped-query con ratio 4:1 (32 cabezas de consulta, 8 cabezas KV, head_dim 128), rotary embedding a ancho completo (rotary_dims 128, theta 1.000.000) y normalización RMSNorm con eps 1e-6 más RMSNorm por cabeza Q/K en atención. Los embeddings son untied, con registros separados int8 para input-embedding y lm_head. La ocupación de estados de los 6,95B pesos ternarios es 62,63% cero, 18,68% positivo y 18,69% negativo.

El entrenamiento combina cuantización ternaria con QAT y post-entrenamiento por etapas realizado por Fermion Research, partiendo del checkpoint de Qwen3-8B. Las escalas se fijan a la rejilla del runtime en el momento de la exportación. El contenedor de 3.875.404.812 bytes distribuye su presupuesto en un 67,2% para la vía de pesos ternarios (252 lineales: q/k/v/o/gate/up/down × 36 capas), 32,1% para embeddings int8, 0,6% en metadatos por fila y 0,03% en vectores de normalización. El transporte tv4z codifica el contenedor sin pérdida al 66,05% de su tamaño con round-trip byte-exacto.

## Capacidades

- Generación de texto conversacional con plantilla de chat Qwen3 y soporte de `apply_chat_template` con opción `enable_thinking`.
- Tool calling y aplicaciones compatibles con la API de OpenAI, servidas por el runtime de Fermion con streaming habilitado por defecto.
- Sesión KV persistente, lo que permite mantener contexto entre peticiones sin recargar el modelo.
- Inferencia en CPU (Apple silicon y x86), CUDA y MLX desde el mismo artefacto de 3,88 GB.
- Modo de razonamiento desactivable (thinking mode) para comparativas y uso directo en producción.
- Capacidad de funcionar como modelo generalista para conocimiento, seguimiento de instrucciones y uso de herramientas, según la documentación oficial de Fermion Research.
- Soporte de decodificación especulativa: el modelo hermano Neutrino-1 0.6B puede servir como draft model del 8B.

## Casos de uso

- Asistente conversacional local en el edge: con 4,68 GiB de VRAM a 4k de contexto, se puede desplegar en GPUs de consumo de 8 GB (RTX 3060/4060, L4) para chatbots privados sin dependencia de la nube.
- Servicio de chat con API compatible con OpenAI: el runtime de Fermion expone un endpoint estilo OpenAI con streaming, lo que permite sustituir un backend propietario por una instancia local sin reescribir el cliente.
- Generación de código asistida en entornos aislados: al derivar de Qwen3-8B, conserva las capacidades de código y razonamiento del modelo base, útil en IDEs y pipelines de CI/CD con restricciones de hardware.
- Atención al cliente automatizada con contexto largo: la ventana de 40.960 tokens permite mantener historiales extensos de conversación multi-turno, con sesión KV persistente para continuar diálogos entre peticiones.
- Prototipado y experimentación en investigación: al cargarse como modelo nativo de `transformers` con una sola llamada, facilita la evaluación académica y el fine-tuning posterior sobre la arquitectura Qwen3.
- Despliegue en portátiles Apple silicon: el pack MLX con kernels Metal propios alcanza 25,0 tok/s en un M5 de 16 GB bajo un límite de memoria de 6 GiB, apto para asistentes personales en movilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La documentación oficial reporta únicamente mediciones de rendimiento de inferencia:

| Entorno | Velocidad | Memoria |
|---|---|---|
| Apple M5, 9 hilos, CPU-only (pip engine) | 24,94 tok/s | no disponible |
| NVIDIA L4, offload completo (kernel batcheado, 2026-07-30) | 35,4 tok/s | 4,68 GiB VRAM @ 4k contexto |
| Apple M5 16 GB, MLX, límite 6 GiB | 25,0 tok/s mediana | 6 GiB |

## Requisitos de hardware

- VRAM estimada: 4,68 GiB a 4k de contexto con offload completo en NVIDIA L4, lo que permite ejecución en tarjetas de 8 GB.
- KV cache: 144 KiB/token en fp16 (0,60 GB a 4k, 4,83 GB a 32k); 288 KiB/token en fp32.
- GPU recomendadas: NVIDIA L4 (verificada), tarjetas consumer de 8 GB o más (RTX 3060/4060 y superiores) para offload completo; el pack GGUF con el fork de llama.cpp soporta CUDA.
- CPU: funciona en Apple silicon (M5 verificado) y x86 sin GPU, a 24,94 tok/s en M5 con 9 hilos.
- Opciones de despliegue: pip engine (`pip install fermion-research`), fork propio de llama.cpp para el pack GGUF (FV5), runtime MLX para Apple silicon, e integración nativa con `transformers` tras registrar el tipo `trtc_v4` con `import fermion`.
- Latencia y throughput: 35,4 tok/s en L4 y 24,94 tok/s en M5 CPU; el transporte tv4z codifica en 17 s y decodifica en 6 s en M5.
- Advertencia: los builds estándar de llama.cpp, Ollama y LM Studio no incluyen el tipo de tensor FV5; es necesario compilar el fork de Fermion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Neutrino-8B | 8,19B | 40.960 | Ternaria sub-2 bits | Apache-2.0 | TRTC v4, GGUF, MLX |
| Qwen3-8B (base) | 8,19B | 40.960 (según config) | fp16/bf16 o cuantizaciones estándar | Apache-2.0 | safetensors, GGUF |
| Llama-3.1-8B | 8,03B | 131.072 | fp16/bf16 o GGUF | Llama 3.1 | safetensors, GGUF |

La comparación principal es con Qwen3-8B, del que deriva: Neutrino-8B mantiene la misma topología y ventana de contexto, pero reduce el peso de los pesos lineales a sub-2 bits, pasando de un modelo de ~16 GB en fp16 a un contenedor de 3,88 GB y un transporte de 2,56 GB. Frente a Llama-3.1-8B, Neutrino-8B ofrece una ventana de contexto menor (40.960 frente a 131.072) pero una licencia más permisiva (Apache-2.0 frente a Llama 3.1) y un artefacto de despliegue notablemente más ligero. No se dispone de datos de benchmarks que permitan comparar la calidad de salida entre estos modelos.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible, por lo que no es posible verificar el impacto real de la cuantización ternaria en el rendimiento de tareas.
- El pack GGUF usa el tipo de tensor propietario FV5: solo carga en el fork de llama.cpp de Fermion; los builds estándar de llama.cpp, Ollama y LM Studio no lo soportan.
- La carga vía `from_pretrained` requiere descargar el repositorio a un directorio local y ejecutar `import fermion` antes; pasar el id del hub directamente lanza `FileNotFoundError` en la versión 0.1.5 del loader.
- La primera ejecución de `fermion chat` descarga ~3,9 GB sin barra de progreso en la versión 0.1.5, lo que puede confundir al usuario durante varios minutos.
- Los idiomas soportados no están documentados; se asume herencia del tokenizer de Qwen3-8B (vocab 151.936) pero no hay confirmación oficial.
- Riesgo de alucinación y sesgos propios del modelo base Qwen3-8B, no evaluados específicamente en la variante ternaria.
- La cuantización sub-2 bits puede degradar la precisión en tareas de razonamiento numérico o matemático complejo; no hay datos publicados que lo confirmen o descarten.
- El ecosistema de herramientas es incipiente: la integración con `transformers` depende del paquete `fermion-research` y del registro del tipo `trtc_v4`, lo que añade una dependencia adicional en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FermionResearch/Neutrino-8B
- Árbol de archivos del repositorio: https://huggingface.co/FermionResearch/Neutrino-8B/tree/main
- Página del modelo en Fermion Research: https://www.fermionresearch.com/models/neutrino-8b/
- Anuncio de la familia Neutrino-1: https://www.fermionresearch.com/research/neutrino-8b/
- Perfil de Fermion Research en HuggingFace: https://huggingface.co/fermionresearch
- Modelo base Qwen/Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
