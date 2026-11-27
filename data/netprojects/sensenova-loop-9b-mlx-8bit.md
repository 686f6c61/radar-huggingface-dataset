# netprojects/SenseNova-Loop-9B-MLX-8bit

## Resumen

SenseNova-Loop-9B-MLX-8bit es una conversión a 8 bits del modelo SenseNova-Loop-9B de SenseTime/SenseNova, publicada por NetProjects (Internet Projects Ltd) para su ejecución en Apple Silicon mediante la librería MLX. Se trata de un transformer de 8.956.947.840 parámetros basado en Qwen3.5 que incorpora dos modificaciones arquitectónicas propias de SenseNova: ejecución en bucle de capas (looped execution) y un mecanismo de dos flujos residuales denominado mHC. El resultado son 56 pasadas de capa por token con pesos compartidos, lo que incrementa la profundidad efectiva sin aumentar el número de parámetros.

La relevancia de esta ficha concreta reside en que es la cuantización más fiel al modelo original disponible para Mac: con 9,5 GB de pesos, alcanza un 98,6 % de coincidencia en el token top respecto al código PyTorch oficial en bf16 y un KL de 0,0015 en el último token. El modelo soporta entrada de texto e imagen, contexto de 512K tokens mediante escalado YaRN y decodificación especulativa con una cabeza MTP propia de SenseNova (aproximadamente 1,7× más rápida).

El modelo está pensado para tareas agénticas, de programación y de análisis de datos, y se distribuye bajo licencia Apache 2.0. No guarda afiliación con SenseTime/SenseNova: es un port independiente de NetProjects.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5 con ejecución en bucle de capas (looped transformer) y doble flujo residual mHC |
| Parametros totales | 8.956.947.840 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512K tokens (escalado YaRN, factor 2 sobre 262.144 posiciones) |
| Tipos de cuantizacion | 8 bits afín, group size 64 (esta build); también existen builds de 6 bits, 4 bits y bf16 del mismo autor |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), más `model.fp32norms.safetensors` con las 81 pesos RMSNorm en float32 |

## Arquitectura y entrenamiento

SenseNova-Loop-9B es un transformer derivado de Qwen3.5 con dos adiciones estructurales. La primera es la ejecución en bucle: las capas 0–3 se ejecutan una vez, las capas 4–27 se ejecutan dos veces con pesos compartidos y las capas 28–31 una vez, totalizando 56 pasadas de capa por token. Cada pasada dispone de su propia ranura de caché (KV cache para atención completa, estado convolucional y recurrente para Gated DeltaNet). La segunda es el mecanismo mHC (multi-stream hidden channels) aplicado en las capas 4–27: el estado oculto se divide en dos flujos residuales enrutados por pequeños routers en float32 (gates pre/post y una matriz de mezcla 2×2 Sinkhorn con 20 iteraciones). Los 96 tensores de router se mantienen en float32 y no se cuantizan.

El contexto largo se consigue con escalado YaRN de rope (factor 2 sobre 262.144 posiciones), tal como aparece en la configuración de SenseNova. La decodificación especulativa se apoya en una cabeza MTP (multi-token prediction) propia del modelo original, que acelera la generación aproximadamente 1,7×. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO en la documentación consultada. El código del modelo (`sensenova_loop.py`) se incluye en el repositorio y se carga mediante `trust_remote_code=True` en mlx-lm.

## Capacidades

- Generación de texto conversacional con modo thinking activable (`enable_thinking=True`).
- Razonamiento multi-paso y ejecución de tareas agénticas (AutomationBench, GAIA, Terminal-Bench evaluados por SenseNova).
- Generación y análisis de código, incluyendo tareas de terminal y reproducción de repositorios (NL2Repo).
- Análisis de datos y consultas SQL (BIRD, AIDABench).
- Entrada de imagen: el modelo acepta prompts con una o varias imágenes mediante el runtime `sensenova-loop-mlx`.
- Decodificación especulativa con cabeza MTP para acelerar la generación.
- Soporte de contexto largo de hasta 512K tokens con YaRN.
- Capacidades multilingües: no disponibles en la información consultada.

## Casos de uso

- Automatización de agentes en terminal: el modelo puede ejecutar tareas de Terminal-Bench 2.1 (59,55 puntos reportados) y encadenar comandos multi-paso, adecuado para pipelines de CI/CD que requieran razonamiento sobre el estado del sistema.
- Análisis de datos y SQL: con 72,34 en BIRD, puede traducir preguntas en lenguaje natural a consultas SQL sobre esquemas complejos, integrándose en herramientas de BI.
- Reproducción de repositorios y generación de código: NL2Repo de 41,36 permite usarlo como asistente para generar proyectos completos a partir de especificaciones, con soporte de tool calling a través del runtime MLX.
- Procesamiento de documentos largos: los 512K tokens de contexto permiten resumir o extraer información de contratos, informes o bases de código extensas en una sola pasada.
- Asistencia multimodal en local: con entrada de imagen, puede describir capturas, diagramas o fotografías en un Mac sin enviar datos a la nube, útil en entornos con requisitos de privacidad.
- Atención al cliente multi-turno: la ventana de contexto larga y el modo thinking permiten mantener conversaciones con historial extenso y razonamiento explícito antes de responder.
- Prototipado e investigación en Apple Silicon: al ser una build MLX de 8 bits con alta fidelidad al original (98,6 % de coincidencia en token top), sirve para validar experimentos con la arquitectura looped sin necesidad de GPU NVIDIA.

## Benchmarks y rendimiento

Los siguientes datos son los reportados por SenseNova para el modelo original en BF16, copiados de la model card original. No corresponden a esta build MLX de 8 bits.

| Benchmark | SenseNova-Loop-9B | SenseNova-Loop-9B-Preview | Qwen3.8-27B |
|---|---|---|---|
| AutomationBench | 36,67 | 14,33 | 36,67 |
| Terminal-Bench 2.1 | 59,55 | 40,45 | No disponible |
| GAIA | 69,90 | 37,86 | No disponible |
| AIDABench | 65,31 | No disponible | 65,01 |
| NL2Repo | 41,36 | No disponible | 44,60 |
| BIRD | 72,34 | 71,38 | No disponible |

Además, el autor de la conversión reporta métricas de fidelidad frente al código PyTorch oficial en bf16 sobre 16 prompts: 98,6 % de coincidencia en el token top, KL de 0,0015 en el último token, 11 de 16 textos greedy idénticos y 96,7 % de coincidencia en el token top con prompts de imagen. Estas cifras son específicas de esta build de 8 bits en un MacBook Pro M5 Max de 128 GB.

## Requisitos de hardware

- VRAM/unified memory estimada: 10,9 GB de pesos en disco; el autor recomienda al menos 24 GB de memoria unificada para esta build de 8 bits.
- GPU recomendadas: Apple Silicon con 24 GB o más (M-series Pro/Max). El autor probó en un MacBook Pro M5 Max de 128 GB.
- Cabe en GPU de consumo: sí, en Mac con 24 GB o más. Para 16 GB existen las builds de 6 bits (8,7 GB) y 4 bits (6,5 GB).
- Opciones de despliegue: `mlx-lm` 0.32 o superior con `trust_remote_code=True`; servidor mediante `mlx_lm.server`; entrada de imagen y decodificación MTP mediante el runtime `sensenova-loop-mlx` v0.3.0.
- Latencia y throughput: no se han publicado cifras concretas de tokens por segundo; el autor indica una aceleración de aproximadamente 1,7× con la cabeza MTP frente a decodificación plana.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-MLX-8bit (esta build) | 8,96B | 512K (YaRN) | Apache 2.0 | MLX, Apple Silicon | 9,5 GB, 98,6 % fidelidad al original |
| SenseNova-Loop-9B (original bf16) | 8,96B | 512K (YaRN) | Apache 2.0 | PyTorch/Transformers | 17,9 GB, referencia de fidelidad |
| SenseNova-Loop-9B-Preview | No disponible | No disponible | No disponible | No disponible | Rendimiento inferior en los 7 benchmarks reportados |
| Qwen3.8-27B | 27B (aproximado) | No disponible | No disponible | No disponible | Supera en NL2Repo (44,60 vs 41,36), empata en AutomationBench y AIDABench |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información consultada; al derivar de Qwen3.5 y de los datos de SenseNova, es previsible que herede sesgos de esos corpus, pero no hay evidencia publicada.
- Riesgo de alucinación: no cuantificado en la documentación; como modelo generativo de 9B, es esperable en tareas de razonamiento abierto y en contextos muy largos.
- La cuantización a 8 bits introduce desviaciones respecto al original: el 1,4 % de posiciones con token top distinto y 5 de 16 textos greedy no idénticos indican que no es una réplica exacta.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento multilingüe más allá de lo que herede del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el port no está afiliado a SenseTime/SenseNova; conviene verificar la licencia del modelo base original.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; revisar `sensenova_loop.py` antes de desplegar en producción.
- La entrada de imagen y la decodificación MTP no funcionan con `mlx_lm.load` estándar: necesitan el runtime `sensenova-loop-mlx` v0.3.0.
- El contexto de 512K con YaRN puede degradar la calidad en posiciones muy alejadas; no se han publicado evaluaciones específicas de long-context para esta build.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-8bit
- Modelo base original: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Build de 6 bits: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-6bit
- Build de 4 bits: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-4bit
- Build bf16: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-bf16
- Runtime MLX con visión y MTP: https://github.com/internet-projects/sensenova-loop-mlx/releases/tag/v0.3.0
- Perfil del autor en Hugging Face: https://huggingface.co/netprojects
- Web del autor: https://netprojects.com
