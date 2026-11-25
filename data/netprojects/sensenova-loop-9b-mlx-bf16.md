# netprojects/SenseNova-Loop-9B-MLX-bf16

## Resumen

SenseNova-Loop-9B-MLX-bf16 es la conversión a bfloat16 (sin cuantizar) para Apple Silicon del modelo SenseNova-Loop-9B, publicado por SenseTime / SenseNova el 17 de noviembre de 2026. Esta build la distribuye NetProjects (Internet Projects Ltd), sin afiliación con SenseTime, y su propósito es doble: servir como referencia fiel del modelo original en formato MLX y como base para generar cuantizaciones propias (4-bit, 6-bit y 8-bit publicadas por el mismo autor).

El modelo parte de la arquitectura Qwen3.5 y añade dos modificaciones estructurales: ejecución en bucle (looped transformer) de las capas 4 a 27, que se ejecutan dos veces con pesos compartidos, y un mecanismo de dos flujos residuales mHC (multi-head cross-stream) con enrutadores en float32. El resultado son 56 pasadas de capa por token en lugar de 32, con 8.956.947.840 parámetros totales. Soporta entrada de texto e imagen, contexto de 512K tokens mediante escalado YaRN y decodificación acelerada con una cabeza MTP (multi-token prediction) que, según el autor, ofrece aproximadamente 1,7 veces más velocidad de decodificación.

La relevancia de esta ficha radica en que es una de las pocas implementaciones en MLX de una arquitectura looped con estado recurrente híbrido (Gated DeltaNet) y atención completa, lo que permite ejecutar un modelo de casi 9B parámetros en hardware de Apple Silicon con una fidelidad verificada del 99,1% en el token superior respecto al código PyTorch original de SenseNova.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5 con ejecución en bucle (looped) y mHC de dos flujos; atención completa + Gated DeltaNet |
| Parametros totales | 8.956.947.840 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512K tokens (configuración YaRN, factor 2 sobre 262.144 posiciones) |
| Tipos de cuantizacion | bf16 (esta build); el autor publica además 4-bit, 6-bit y 8-bit en MLX |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con ficheros separados para visión (`vision.safetensors`) y cabeza MTP (`mtp.safetensors`) |
| Pasadas de capa por token | 56 (capas 0-3 una vez, 4-27 dos veces, 28-31 una vez) |
| Tamaño del repo | 19,3 GB |
| Pesos en float32 | 96 tensores de enrutadores mHC y 81 pesos RMSNorm |
| Librería | mlx-lm >= 0.32, Python >= 3.11 |

## Arquitectura y entrenamiento

SenseNova-Loop-9B se construye sobre Qwen3.5 con dos modificaciones principales. La primera es la ejecución en bucle: las capas 0 a 3 se ejecutan una vez, las capas 4 a 27 se ejecutan dos veces compartiendo pesos, y las capas 28 a 31 una vez, totalizando 56 pasadas de capa por token. Cada pasada dispone de su propia ranura de caché: KV cache para las capas de atención completa y estado convolucional y recurrente para las capas Gated DeltaNet. La segunda modificación es el mecanismo mHC de dos flujos en las capas 4 a 27: el estado oculto se divide en dos flujos residuales enrutados por pequeños routers en float32 (puertas pre/post y una matriz de mezcla 2×2 de Sinkhorn con 20 iteraciones).

El contexto largo se consigue mediante escalado YaRN de RoPE (factor 2 sobre 262.144 posiciones), tal como aparece en la configuración original de SenseNova. La conversión mantiene fidelidad numérica estricta: los 96 tensores de enrutadores mHC y los 81 pesos RMSNorm se conservan en float32 y nunca se cuantizan, y el código del modelo (`sensenova_loop.py`) se carga con `trust_remote_code=True`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto conversacional con modo thinking activable (`enable_thinking=True`) y desactivable.
- Entrada multimodal de texto e imagen: el modelo acepta una o varias imágenes por prompt, con un límite por defecto de aproximadamente 1 megapíxel por imagen (hasta 16,7 MP configurable, con mayor consumo de memoria).
- Razonamiento multi-paso y ejecución de tareas agénticas, evaluado por SenseNova en benchmarks como AutomationBench, Terminal-Bench 2.1 y GAIA.
- Generación y análisis de código, con resultados reportados en NL2Repo y tareas de terminal.
- Análisis de datos y consultas SQL, evaluado en AIDABench y BIRD.
- Contexto largo de hasta 512K tokens, verificado por el autor de la conversión al localizar un código oculto en un prompt de 64K tokens con la build de 6 bits.
- Decodificación especulativa mediante cabeza MTP, que redacta tokens candidatos y los verifica en una sola pasada (aproximadamente 1,7 veces más rápida según el autor).
- Soporte de tool calling y function calling: no disponible en la información proporcionada (no se menciona explícitamente en la model card).

## Casos de uso

- Análisis de documentos extensos: con 512K tokens de contexto, el modelo puede procesar informes completos, expedientes o bases de código de gran tamaño en una sola pasada, sin necesidad de fragmentación ni recuperación externa. La build bf16 es la referencia para validar que las cuantizaciones no degradan la calidad en estas tareas.
- Procesamiento de imágenes en flujo local: gracias a la torre de visión en bfloat16 y al runtime `sensenova-loop-mlx`, se pueden describir fotografías, extraer texto de capturas o analizar diagramas directamente en un Mac, sin enviar datos a la nube.
- Automatización de tareas agénticas en terminal: los resultados reportados en Terminal-Bench 2.1 (59,55) y AutomationBench (36,67) lo sitúan como candidato para agentes que ejecutan comandos, interpretan salidas y corrigen errores en entornos controlados.
- Asistencia en análisis de datos y SQL: con 72,34 en BIRD y 65,31 en AIDABench, puede traducir preguntas en lenguaje natural a consultas SQL y razonar sobre esquemas de bases de datos, integrándose en herramientas de BI.
- Generación de código en pipelines de desarrollo: el modelo puede generar parches, explicar repositorios y asistir en tareas de refactorización; su uso con MTP acelera la decodificación en iteraciones interactivas sobre Apple Silicon.
- Base para cuantizaciones propias: al ser una conversión bf16 fiel (99,1% de coincidencia en el token superior con el código PyTorch original), sirve como referencia para generar y validar cuantizaciones personalizadas con `mlx_lm`, comparando la degradación de cada build.
- Investigación sobre arquitecturas looped: el código `sensenova_loop.py` incluido permite estudiar el comportamiento de un transformer con pesos compartidos y enrutadores mHC en un entorno MLX reproducible.

## Benchmarks y rendimiento

Los siguientes resultados son los reportados por SenseNova para el modelo BF16 original, copiados de su model card. No han sido verificados de forma independiente en la información disponible.

| Benchmark | SenseNova-Loop-9B | SenseNova-Loop-9B-Preview | Qwen3.8-27B |
|---|---|---|---|
| AutomationBench | 36,67 | 14,33 | 36,67 |
| Terminal-Bench 2.1 | 59,55 | 40,45 | no disponible |
| GAIA | 69,90 | 37,86 | no disponible |
| AIDABench | 65,31 | no disponible | 65,01 |
| NL2Repo | 41,36 | no disponible | 44,60 |
| BIRD | 72,34 | 71,38 | no disponible |

Fidelidad de la conversión MLX respecto al código PyTorch de SenseNova (16 prompts, todas las posiciones, MacBook Pro M5 Max de 128 GB):

| Build | Tamaño | Mismo token superior | KL en el último token | Texto greedy idéntico (16 prompts) | Imágenes: mismo token superior |
|---|---|---|---|---|---|
| 6-bit (recomendada) | 7,3 GB | 96,7% | 0,0056 | 4 / 16 | 98,0% |
| 8-bit | 9,5 GB | 98,6% | 0,0015 | 11 / 16 | 96,7% |
| 4-bit | 5,1 GB | 84,4% | 0,1038 | 2 / 16 | 95,4% |
| bf16 (esta build) | 17,9 GB | 99,1% | 0,0005 | 12 / 16 | referencia |

## Requisitos de hardware

- VRAM/unified memory estimada: 17,9 GB de pesos en bf16, más overhead de caché KV para 56 pasadas de capa; el autor reporta ejecución estable en un MacBook Pro M5 Max de 128 GB.
- GPU recomendadas: Apple Silicon con memoria unificada abundante (M5 Max de 128 GB probado por el autor); no se dispone de datos de ejecución en A100, H100 o RTX 4090 porque el formato MLX está orientado a Apple Silicon.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con al menos 32 GB de memoria unificada para la build de 4 bits (5,1 GB) o 6 bits (7,3 GB); la build bf16 requiere previsiblemente 24 GB o más solo para pesos, más caché.
- Opciones de despliegue: `mlx_lm.server` para texto; runtime `sensenova-loop-mlx v0.3.0` para entrada de imagen y decodificación MTP; `mlx_lm.load` con `trust_remote_code=True`. No compatible con vLLM, llama.cpp, Ollama ni TGI en este formato.
- Latencia y throughput: el autor indica aproximadamente 1,7 veces más velocidad de decodificación con la cabeza MTP frente a decodificación simple; no se proporcionan tokens por segundo absolutos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B (esta build MLX bf16) | 8,96B | 512K (YaRN) | Apache 2.0 | safetensors MLX | Looped transformer, mHC, visión y MTP; solo Apple Silicon |
| SenseNova-Loop-9B (original SenseNova) | 8,96B | 512K (YaRN) | Apache 2.0 | safetensors PyTorch | Referencia oficial; requiere Transformers 5.18 |
| SenseNova-Loop-9B-Preview | no disponible | no disponible | no disponible | no disponible | Versión previa; superada en los siete benchmarks comparados |
| Qwen3.8-27B | 27B (aproximado) | no disponible | no disponible | no disponible | Comparable en AutomationBench (36,67) y AIDABench (65,01); superior en NL2Repo (44,60) |

## Limitaciones y advertencias

- La build está limitada a Apple Silicon y a la librería MLX; no puede desplegarse en GPUs NVIDIA ni en servidores x86 convencionales sin reconvertir el modelo.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código Python del repositorio; conviene auditar `sensenova_loop.py` antes de usarlo en producción.
- El modo thinking y el modo sin thinking pueden producir respuestas distintas; el autor verificó ambos, pero no se documenta la tasa de alucinación en ninguno de los dos.
- La entrada de imagen está limitada por defecto a aproximadamente 1 megapíxel por imagen; subir a 16,7 MP incrementa notablemente el consumo de memoria.
- La decodificación con MTP puede diferir de la decodificación simple cuando los dos mejores tokens están empatados a menos de 0,25 logits.
- No se dispone de información sobre sesgos, composición del dataset de entrenamiento ni idiomas soportados oficialmente; la model card no los detalla.
- La licencia Apache 2.0 permite uso comercial, pero el autor de la conversión no está afiliado a SenseTime y no ofrece garantías sobre el modelo original.
- Los benchmarks proceden de SenseNova y no han sido verificados de forma independiente en la información disponible; los resultados de la conversión MLX miden fidelidad numérica, no calidad absoluta.

## Enlaces

- Hugging Face (esta build): https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-bf16
- Modelo base original: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Build 6-bit: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-6bit
- Build 8-bit: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-8bit
- Build 4-bit: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-4bit
- Runtime MLX con visión y MTP (v0.3.0): https://github.com/internet-projects/sensenova-loop-mlx/releases/tag/v0.3.0
- NetProjects: https://netprojects.com
