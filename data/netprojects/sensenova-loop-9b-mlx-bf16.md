# netprojects/SenseNova-Loop-9B-MLX-bf16

## Resumen

SenseNova-Loop-9B-MLX-bf16 es la conversión a formato MLX en precisión bfloat16 (sin cuantización) del modelo SenseNova-Loop-9B, publicado originalmente por SenseTime/SenseNova el 17 de noviembre de 2026. Esta conversión la mantiene NetProjects (Internet Projects Ltd) para su ejecución nativa en Apple Silicon mediante la librería mlx-lm, y está pensada como referencia y como base para generar cuantizaciones propias. No existe afiliación entre NetProjects y SenseTime.

El modelo original es una variante de la familia Qwen3.5 con dos modificaciones arquitectónicas propietarias: ejecución en bucle (looped transformer), donde las capas 4 a 27 se ejecutan dos veces compartiendo pesos, y un mecanismo de doble flujo residual denominado mHC en esas mismas capas. Con 8.956.947.840 parámetros totales y una ventana de contexto de 512K tokens configurada mediante YaRN, está orientado a tareas agénticas, generación de código y análisis de datos.

La relevancia de esta ficha concreta reside en que es la única versión de referencia en bf16 que reproduce fielmente el comportamiento del código PyTorch original de SenseNova, con un 99,1% de coincidencia en el token más probable y una divergencia KL de 0,0005 en el último token. Es, por tanto, la base contra la que se validan las versiones cuantizadas de 4, 6 y 8 bits del mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con ejecución en bucle (looped transformer) sobre base Qwen3.5, con atención completa y Gated DeltaNet, y doble flujo residual mHC |
| Parametros totales | 8.956.947.840 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512K tokens (escalado YaRN, factor 2 sobre 262.144 posiciones) |
| Tipos de cuantizacion | Esta build es bf16 sin cuantizar; el mismo autor publica variantes de 4, 6 y 8 bits |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con fichero adicional `model.fp32norms.safetensors` para las 81 normas RMS en float32 |
| Tamano del repo | 19,3 GB (17,9 GB de pesos) |
| Libreria de ejecucion | mlx-lm >= 0.32, Python >= 3.11 |
| Revision del modelo base | `329a65f` (17 de noviembre de 2026) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3.5 y añade dos mecanismos. El primero es la ejecución en bucle: las capas 0 a 3 se ejecutan una vez, las capas 4 a 27 se ejecutan dos veces con pesos compartidos y las capas 28 a 31 se ejecutan una vez, lo que da 56 pasadas de capa por token. Cada pasada dispone de su propia ranura de caché: KV cache en las capas de atención completa y estado convolucional y recurrente en las capas Gated DeltaNet. El segundo es el mecanismo mHC de doble flujo en las capas 4 a 27: el estado oculto se divide en dos flujos residuales enrutados por routers en float32 (gates pre y post más una matriz de mezcla 2×2 de Sinkhorn con 20 iteraciones). Los 96 tensores de router permanecen siempre en float32 y nunca se cuantizan.

La conversión MLX reproduce ambos mecanismos exactamente como el código original de SenseNova, cargando `sensenova_loop.py` mediante `trust_remote_code=True`. Las 81 normas RMS se envían también en float32 para que el cálculo sea idéntico al de referencia. El contexto largo se implementa con escalado YaRN de factor 2 sobre 262.144 posiciones, tal como figura en la configuración de SenseNova. La model card de esta conversión no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esa información no está disponible en la documentación proporcionada.

## Capacidades

- Generación de texto conversacional con plantilla de chat y modo de pensamiento (thinking) activable mediante `enable_thinking=True`.
- Entrada multimodal de texto e imagen, con coincidencia exacta en posiciones de imagen respecto al código de referencia en float32.
- Razonamiento multi-paso y ejecución agéntica, evaluado por SenseNova en tareas de automatización, terminal, GAIA y análisis de datos.
- Generación y manipulación de código, con resultados en Terminal-Bench 2.1 y NL2Repo.
- Análisis de datos estructurados y consultas sobre bases de datos (evaluado en BIRD y AIDABench).
- Decodificación especulativa mediante la cabeza MTP (Multi-Token Prediction) del modelo original, que acelera la decodificación aproximadamente 1,7×.
- Contexto largo efectivo: la build de 6 bits del mismo autor localizó un código oculto en un prompt de 64K tokens.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Automatización de tareas agénticas en entornos de escritorio y terminal: el modelo obtiene 59,55 en Terminal-Bench 2.1 y 36,67 en AutomationBench, por lo que es adecuado para agentes que ejecutan comandos y manipulan ficheros en pipelines controlados.
- Análisis de datos sobre bases de datos relacionales: con 72,34 en BIRD y 65,31 en AIDABench, puede traducir preguntas en lenguaje natural a SQL y razonar sobre esquemas complejos dentro de una ventana de 512K tokens.
- Generación de repositorios y código en producción: su puntuación de 41,36 en NL2Repo permite integrarlo en flujos de creación de proyectos completos a partir de especificaciones, con validación posterior en CI/CD.
- Procesamiento de documentos largos con imágenes intercaladas: la combinación de contexto de 512K tokens y entrada de imagen permite analizar informes, contratos o manuales técnicos escaneados en una sola pasada.
- Desarrollo y validación de cuantizaciones: al ser la build bf16 de referencia, sirve para medir la degradación de las variantes de 4, 6 y 8 bits del mismo autor mediante comparación de logits y texto greedy.
- Asistentes de investigación en local sobre Apple Silicon: con 17,9 GB de pesos cabe en Mac de 48 GB o más, lo que permite ejecutar un modelo de 9B con contexto muy largo sin conexión a servicios externos.
- Evaluación de arquitecturas con decodificación especulativa: la cabeza MTP integrada permite medir ganancias de throughput reales en hardware Apple frente a decodificación autoregresiva estándar.

## Benchmarks y rendimiento

Los siguientes resultados los reporta SenseNova para el modelo original en BF16 y se copian de su model card. No corresponden a esta conversión MLX.

| Benchmark | SenseNova-Loop-9B | SenseNova-Loop-9B-Preview | Qwen3.8-27B |
|---|---|---|---|
| AutomationBench | 36,67 | 14,33 | 36,67 |
| Terminal-Bench 2.1 | 59,55 | 40,45 | No disponible |
| GAIA | 69,90 | 37,86 | No disponible |
| AIDABench | 65,31 | No disponible | 65,01 |
| NL2Repo | 41,36 | No disponible | 44,60 |
| BIRD | 72,34 | 71,38 | No disponible |

Fidelidad de esta conversión respecto al código PyTorch de SenseNova (Transformers 5.18, bf16), medida sobre 16 prompts en todas las posiciones:

| Metrica | Valor |
|---|---|
| Mismo token superior que el codigo de referencia | 99,1% |
| KL en el ultimo token | 0,0005 |
| Texto greedy identico | 12 de 16 prompts |
| Coincidencia en prompts de imagen | Referencia (bf16) |

## Requisitos de hardware

- VRAM o memoria unificada estimada: 17,9 GB de pesos en bf16; el repositorio completo ocupa 19,3 GB. La model card recomienda al menos 48 GB de memoria unificada para esta build.
- Hardware objetivo: Apple Silicon exclusivamente, ya que el formato es MLX. Probado en un MacBook Pro M5 Max con 128 GB.
- No es ejecutable en GPU NVIDIA o AMD mediante este repositorio; para CUDA habría que usar los pesos originales de SenseNova en PyTorch.
- Opciones de despliegue: `mlx_lm.generate` para uso programático, `mlx_lm.server` para servir el modelo de texto, y el runtime `sensenova-loop-mlx v0.3.0` para entrada de imagen y decodificación MTP.
- Requisitos de software: Python 3.11 o superior y mlx-lm 0.32 o superior, con `trust_remote_code=True`.
- Aceleración: la cabeza MTP proporciona aproximadamente 1,7× de velocidad de decodificación según el autor del modelo original.
- Latencia y throughput concretos: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AutomationBench | BIRD | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SenseNova-Loop-9B-MLX-bf16 | 8,96B | 512K (YaRN) | 36,67 | 72,34 | Apache 2.0 | Hugging Face, formato MLX |
| SenseNova-Loop-9B (original) | 8,96B | 512K (YaRN) | 36,67 | 72,34 | Apache 2.0 | Hugging Face, PyTorch |
| SenseNova-Loop-9B-Preview | No disponible | No disponible | 14,33 | 71,38 | No disponible | Hugging Face |
| Qwen3.8-27B | 27B (aproximado) | No disponible | 36,67 | No disponible | No disponible | No disponible |

La comparación con Qwen3.8-27B solo es posible en AutomationBench y AIDABench, donde el modelo de 9B iguala o supera ligeramente a uno de 27B pese a tener un tercio de los parámetros. En NL2Repo, Qwen3.8-27B obtiene 44,60 frente a 41,36.

## Limitaciones y advertencias

- Esta build solo funciona en Apple Silicon mediante MLX; no es portable a CUDA ni a otros aceleradores sin reconversión.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código Python incluido en el repositorio; conviene auditar `sensenova_loop.py` antes de desplegarlo en entornos sensibles.
- El texto greedy solo coincide con la referencia en 12 de 16 prompts, y el token superior en el 99,1% de las posiciones; existen divergencias menores incluso en bf16.
- Con la cabeza MTP, la salida greedy difiere de la decodificación estándar cuando los dos mejores tokens están empatados dentro de 0,25 logits.
- La model card no documenta sesgos conocidos, composición del dataset de entrenamiento ni idiomas soportados, lo que dificulta evaluar riesgos de alucinación y cobertura lingüística.
- El rendimiento en benchmarks procede de SenseNova y corresponde al modelo original; no se han publicado mediciones independientes de esta conversión MLX.
- Licencia Apache 2.0: permite uso comercial, pero el aviso de no afiliación con SenseTime implica que el soporte y las garantías recaen en NetProjects, no en el desarrollador original.
- Los routers mHC y las normas RMS permanecen en float32, por lo que el ahorro de memoria de futuras cuantizaciones será menor de lo que sugiere el número de parámetros.

## Enlaces

- Repositorio Hugging Face de esta build: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-bf16
- Modelo base original: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Build de 6 bits: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-6bit
- Build de 8 bits: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-8bit
- Build de 4 bits: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-4bit
- Runtime MLX con soporte de visión y MTP: https://github.com/internet-projects/sensenova-loop-mlx/releases/tag/v0.3.0
- Perfil del autor en Hugging Face: https://huggingface.co/netprojects
- Sitio del autor: https://netprojects.com
