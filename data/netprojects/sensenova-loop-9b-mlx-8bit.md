# netprojects/SenseNova-Loop-9B-MLX-8bit

## Resumen

SenseNova-Loop-9B-MLX-8bit es una conversión a formato MLX de 8 bits del modelo SenseNova-Loop-9B, publicado por SenseNova (SenseTime) el 17 de noviembre de 2026 y adaptado para Apple Silicon por NetProjects (Internet Projects Ltd). El modelo original es un transformer basado en Qwen3.5 con una innovación arquitectónica central: ejecución en bucle (*looped execution*) de una parte de sus capas y un mecanismo de dos flujos residuales denominado mHC. Esta build de 8 bits, de 9,5 GB de pesos, es la cuantización más fiel al original dentro de la familia MLX publicada por NetProjects.

El modelo resuelve tareas de generación de texto, razonamiento agéntico, código y análisis de datos, con una ventana de contexto configurada a 512K tokens mediante escalado YaRN. Su relevancia actual radica en que demuestra que una arquitectura con pesos compartidos y ejecución repetida de capas puede competir con modelos densos de mayor tamaño en benchmarks agénticos, y en que esta conversión permite ejecutarlo localmente en equipos Apple Silicon con una degradación mínima respecto a la implementación de referencia en PyTorch.

La ficha describe tanto las características del modelo original (arquitectura, entrenamiento, benchmarks reportados por SenseNova) como las particularidades de esta cuantización MLX (fidelidad numérica, requisitos de mlx-lm y comportamiento en hardware Apple).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5 con ejecución en bucle de capas (looped transformer) y doble flujo residual mHC |
| Parametros totales | 8.956.947.840 (aproximadamente 9B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512K tokens (configuración YaRN, factor 2 sobre 262.144 posiciones) |
| Tipos de cuantizacion | 8 bits afín, group size 64 (esta build); también disponibles 6 bits, 4 bits y bf16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (librería mlx, mlx-lm >= 0.32) |

## Arquitectura y entrenamiento

SenseNova-Loop-9B parte de la arquitectura Qwen3.5 e incorpora dos modificaciones estructurales. La primera es la ejecución en bucle: las capas 0–3 se ejecutan una vez, las capas 4–27 se ejecutan dos veces con pesos compartidos y las capas 28–31 una vez, lo que resulta en 56 pasadas de capa por token. Cada pasada dispone de su propia ranura de caché: KV cache para las capas de atención completa y estado convolucional y recurrente para las capas Gated DeltaNet. La segunda es el mecanismo mHC (*multi-head routing with two residual streams*) aplicado a las capas 4–27: el estado oculto se divide en dos flujos residuales enrutados por routers en float32 (compuertas pre y post más una matriz de mezcla 2×2 con normalización Sinkhorn de 20 iteraciones). Los 96 tensores de router permanecen en float32 y no se cuantizan en esta build MLX.

El contexto largo se consigue mediante escalado YaRN de RoPE (factor 2 sobre 262.144 posiciones), tal como aparece en la configuración de SenseNova. El código de la arquitectura (`sensenova_loop.py`) se incluye en el repositorio y se carga mediante `trust_remote_code=True`. No se dispone de información detallada sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) en la información proporcionada.

## Capacidades

- Generación de texto conversacional y de formato largo, con plantilla de chat compatible con `apply_chat_template`.
- Modo de razonamiento (*thinking mode*) activable mediante `enable_thinking=True`, y modo directo sin razonamiento explícito.
- Razonamiento agéntico multi-paso, evaluado por SenseNova en benchmarks como AutomationBench y GAIA.
- Uso de terminal y tareas de línea de comandos (evaluado en Terminal-Bench 2.1).
- Generación y comprensión de código, incluyendo conversión de lenguaje natural a repositorio (NL2Repo).
- Análisis de datos y consultas sobre bases de datos (AIDABench, BIRD).
- Procesamiento de contexto muy largo: la build de 6 bits localizó un código oculto en un prompt de 64K tokens según las pruebas del autor de la conversión.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Automatización de tareas de escritorio y navegador: el modelo puede operar como agente en entornos como AutomationBench, donde obtiene 36,67, gestionando secuencias de acciones multi-paso. Adecuado por su entrenamiento orientado a tareas agénticas y su contexto de 512K tokens.
- Asistente de terminal y operaciones de sistema: con 59,55 en Terminal-Bench 2.1, puede interpretar comandos, diagnosticar errores y ejecutar flujos de trabajo en línea de comandos dentro de un agente controlado.
- Análisis de datos y SQL: con 72,34 en BIRD y 65,31 en AIDABench, es adecuado para traducir preguntas en lenguaje natural a consultas SQL y para razonar sobre esquemas de bases de datos.
- Generación de repositorios y código en producción: con 41,36 en NL2Repo, puede emplearse en pipelines de generación de esqueletos de proyecto, integrable mediante tool calling en herramientas de CI/CD.
- Ejecución local en Apple Silicon para desarrollo y prototipado: la build de 8 bits (9,5 GB) se ejecuta con mlx-lm en un MacBook Pro M5 Max de 128 GB, lo que permite probar agentes y flujos de razonamiento sin depender de la nube.
- Procesamiento de documentos extensos: la ventana de 512K tokens permite resumir, extraer información y responder preguntas sobre contratos, informes o bases de código completas en una sola pasada.
- Asistente de investigación con razonamiento multi-paso: con 69,90 en GAIA, es aplicable a tareas que requieren búsqueda, verificación y composición de respuestas a partir de múltiples fuentes.

## Benchmarks y rendimiento

Resultados reportados por SenseNova para el modelo original en BF16 (copiados de la model card original):

| Benchmark | SenseNova-Loop-9B | SenseNova-Loop-9B-Preview | Qwen3.8-27B |
|---|---|---|---|
| AutomationBench | 36,67 | 14,33 | 36,67 |
| Terminal-Bench 2.1 | 59,55 | 40,45 | no disponible |
| GAIA | 69,90 | 37,86 | no disponible |
| AIDABench | 65,31 | no disponible | 65,01 |
| NL2Repo | 41,36 | no disponible | 44,60 |
| BIRD | 72,34 | 71,38 | no disponible |

Fidelidad de la conversión MLX respecto al código PyTorch de referencia (16 prompts, todas las posiciones, MacBook Pro M5 Max de 128 GB):

| Build | Tamano | Mismo token top que el codigo de SenseNova | KL en el ultimo token | Texto greedy identico (16 prompts) |
|---|---|---|---|---|
| 6 bits (recomendada) | 7,3 GB | 96,7% | 0,0056 | 2 / 16 |
| 8 bits (esta build) | 9,5 GB | 97,6% | 0,0012 | 12 / 16 |
| 4 bits | 5,1 GB | 84,0% | 0,0982 | 2 / 16 |
| bf16 | 17,9 GB | 98,6% | 0,0012 | 12 / 16 |

## Requisitos de hardware

- VRAM/unified memory estimada: 9,5 GB de pesos para la build de 8 bits; la build de 6 bits ocupa 7,3 GB, la de 4 bits 5,1 GB y la bf16 17,9 GB.
- Hardware objetivo: Apple Silicon con memoria unificada; el autor reporta pruebas en un MacBook Pro M5 Max con 128 GB. No se especifican requisitos mínimos de memoria unificada para contexto largo.
- GPU no Apple: no disponibles para este formato; las builds MLX están diseñadas para Metal en Apple Silicon y no para CUDA.
- Cabe en equipos consumer Apple Silicon de gama alta; el contexto de 512K tokens incrementa sustancialmente el consumo de KV cache y estado recurrente, por lo que se recomienda memoria unificada amplia.
- Despliegue: mlx-lm 0.32 o superior, Python 3.11 o superior, con `trust_remote_code=True`; servidor mediante `mlx_lm.server`. No se mencionan opciones vLLM, llama.cpp, Ollama o TGI para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B (original, BF16) | ~9B | 512K (YaRN) | Apache 2.0 | safetensors (PyTorch) | Referencia de fidelidad; 17,9 GB en MLX bf16 |
| SenseNova-Loop-9B-MLX-8bit (esta build) | ~9B | 512K (YaRN) | Apache 2.0 | MLX safetensors | 9,5 GB; 97,6% de coincidencia en token top |
| SenseNova-Loop-9B-MLX-6bit | ~9B | 512K (YaRN) | Apache 2.0 | MLX safetensors | 7,3 GB; recomendada por el autor; 96,7% de coincidencia |
| SenseNova-Loop-9B-Preview | ~9B | no disponible | no disponible | no disponible | Versión previa; inferiores resultados en los siete benchmarks comparados |
| Qwen3.8-27B | 27B | no disponible | no disponible | no disponible | Baseline de mayor tamaño; supera a SenseNova-Loop-9B en NL2Repo (44,60 frente a 41,36) y empata en AutomationBench y AIDABench |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; al ser un modelo entrenado sobre datos web, es previsible que herede sesgos de esos corpus, pero no hay documentación específica.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo, puede producir contenido plausible pero incorrecto, especialmente en tareas de recuperación o datos factuales.
- Idiomas soportados: no especificados; no se garantiza un rendimiento multilingüe homogéneo.
- La cuantización a 8 bits introduce divergencias respecto al original: 97,6% de coincidencia en token top y 12 de 16 textos greedy idénticos; para aplicaciones sensibles a la fidelidad exacta, la build bf16 es la referencia.
- El contexto de 512K tokens depende de la configuración YaRN; el rendimiento efectivo en contextos extremos no está cuantificado en la información disponible.
- La build MLX requiere `trust_remote_code=True` y ejecuta código Python incluido en el repositorio (`sensenova_loop.py`), lo que implica revisar dicho código antes de desplegarlo en producción.
- Licencia Apache 2.0 permite uso comercial, pero esta build es una conversión no oficial de NetProjects, no afiliada a SenseTime/SenseNova; conviene conservar los avisos de licencia y el archivo NOTICE.
- No hay datos de latencia ni throughput publicados para esta build, por lo que la planificación de capacidad en producción requiere medición propia.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción todavía muy limitada y poca validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-8bit
- Modelo base original: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Build MLX 6 bits: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-6bit
- Build MLX 4 bits: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-4bit
- Build MLX bf16: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-bf16
- Colección de builds MLX de NetProjects: https://huggingface.co/collections/netprojects/netprojects-mlx-builds-6ae3b2683a59a1b4fc4c0c3a
- Todos los modelos de NetProjects: https://huggingface.co/netprojects
- Sitio del autor de la conversión: https://netprojects.com
