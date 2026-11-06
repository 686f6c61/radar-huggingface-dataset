# IstroSec/MiniCPM-V-4.7-35B-A3B-NVFP4-FP8

## Resumen

MiniCPM-V-4.7-35B-A3B-NVFP4-FP8 es una cuantización de precisión mixta del modelo multimodal openbmb/MiniCPM-V-4.7-35B-A3B, publicada por el usuario IstroSec. El modelo base es un transformer multimodal de tipo Mixture-of-Experts (MoE) con 35.212.875.824 parámetros totales, orientado a tareas de image-text-to-text, con un backbone de texto heredado de la familia Qwen3.5-MoE y una torre de visión que se mantiene intacta. Esta versión cuantizada reduce el peso de 65,7 GB en BF16 a 21,2 GiB, lo que permite ejecutarlo en hardware Blackwell de gama consumer y profesional.

La propuesta del checkpoint es clara: aplicar NVFP4 (W4A4) a los expertos enrutados del MoE, que concentran la mayor parte de los pesos, y FP8 dinámico a las capas de atención completa, atención lineal y expertos compartidos, dejando en BF16 el router, embeddings, lm_head y toda la torre de visión. El resultado, según las mediciones del autor, es una velocidad de decodificación de 61 tok/s en un único DGX Spark, frente a los 42 tok/s de una cuantización NVFP4 anterior, manteniendo una concordancia top-1 con el modelo BF16 del 94,5 % en textos fijos.

Es relevante ahora porque demuestra que es posible servir un modelo multimodal MoE de 35B en un dispositivo compacto con 128k de contexto, caché KV en FP8 y soporte de tool calling, sin renunciar a la fidelidad del modelo original en tareas de agente, comprensión de capturas de pantalla y recuperación en contexto largo. La licencia Apache 2.0 facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal MoE (backbone de texto Qwen3.5-MoE + torre de visión) |
| Parametros totales | 35.212.875.824 |
| Parametros activos | no disponible (modelo MoE, el autor no publica el número de expertos activos) |
| Longitud de contexto | 131.072 tokens (128k, según la configuración de vLLM del autor) |
| Tipos de cuantizacion | NVFP4 W4A4 en expertos enrutados; FP8 dinámico en atención, atención lineal y expertos compartidos; BF16 en router, embeddings, lm_head, in_proj_a/b y torre de visión |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal con mezcla de expertos. La torre de visión procesa imágenes y las proyecta mediante un módulo merger hacia el espacio del backbone de texto, que sigue la arquitectura Qwen3.5-MoE. El checkpoint cuantizado conserva la torre de visión y el merger en BF16 de forma bit-idéntica al modelo base, mientras que el backbone de texto se cuantiza con llm-compressor (git main) linealizando todos los expertos MoE y calibrándolos con `moe_calibrate_all_experts=True` en un pipeline secuencial. El proceso de cuantización tardó 2 h 47 min en un DGX Spark.

La calibración se realizó con 512 muestras (el texto de la model card se interrumpe en ese punto, por lo que no se detalla la composición completa del dataset). No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición del dataset original ni si hubo fases de RLHF o DPO. El checkpoint no incluye cabeza MTP, ya que el modelo base no publica pesos MTP; para decodificación especulativa el autor remite al modelo draft openbmb/MiniCPM-V-4.7-35B-A3B-DSpark.

La innovación técnica principal es la estrategia de precisión mixta: los expertos enrutados, que concentran la mayor parte de los parámetros, se cuantizan a NVFP4 con escalas FP8 y grupo de 16, mientras que las capas sensibles a la precisión (atención completa, atención lineal, expertos compartidos) se mantienen en FP8 dinámico con pesos por canal y activaciones por token. Esto permite reducir el tamaño a 21,2 GiB conservando una concordancia top-1 del 94,5 % con BF16 en textos fijos y del 84,0–97,2 % en transcripciones de agente multiturno.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa entradas de imagen y texto y genera respuestas conversacionales.
- Comprensión de capturas de pantalla y grounding de elementos de interfaz: el autor reporta 24/32 aciertos en centrado de caja dentro del elemento y un IoU medio de 0,52.
- Tool calling y function calling: compatible con el formato XML de Qwen3-coder, con parsers `qwen3_xml` y `qwen3_coder` en vLLM y `--enable-auto-tool-choice`.
- Razonamiento agéntico multiturno: el autor valida 50/50 tareas en un harness de pruebas de navegador con Playwright-MCP.
- Modo thinking opcional: se activa con `chat_template_kwargs={"enable_thinking": true}`; por defecto la plantilla de openbmb opera en modo instruct.
- Recuperación en contexto largo: 24/24 aciertos en recuperación de 16k a 100k tokens con una y tres agujas.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Decodificación especulativa: no incluye cabeza MTP; requiere el draft model DSpark de openbmb.

## Casos de uso

- Automatización de atención al cliente multimodal: el modelo puede gestionar conversaciones multiturno con capturas de pantalla adjuntas y un contexto de hasta 128k tokens, adecuado para historiales largos de incidencias.
- Agentes de navegador y pruebas automatizadas: con tool calling en formato Qwen3-coder y soporte de Playwright-MCP, puede ejecutar tareas de interacción web, detectar referencias obsoletas a elementos, modales que interceptan clics y errores transitorios 503.
- Revisión de calidad visual de interfaces: el grounding de elementos y la detección de defectos de renderizado (solapamientos, recortes, desalineaciones, colores incorrectos) permiten integrarlo en pipelines de QA de front-end.
- Análisis de documentos e imágenes en contexto largo: la ventana de 128k y la recuperación validada hasta 100k tokens lo hacen apto para extraer información de logs, informes o capturas extensas.
- Asistencia a desarrollo con contexto de código: el autor valida concordancia top-1 en código Python y búsqueda de bugs sembrados (19/20 encontrados), lo que lo hace útil en revisión asistida de parches.
- Despliegue en estaciones compactas: con 21,2 GiB de pesos y 61 tok/s en un DGX Spark, es viable para prototipos y demos en hardware Blackwell de gama consumer o profesional.
- Investigación en cuantización: sirve como referencia reproducible de una pipeline NVFP4 + FP8 con llm-compressor para estudiar el impacto de la precisión mixta en modelos MoE multimodales.

## Benchmarks y rendimiento

Los datos proceden de mediciones propias del autor en un único DGX Spark (GB10) con vLLM 0.32.1rc1.dev435, caché KV FP8 y 128k de contexto. No son benchmarks estándar y el autor advierte que no ejecutó OCRBench ni MMMU.

| Metrica | BF16 | sambit9238 NVFP4 | Este repo |
|---|---|---|---|
| Tamano | 65,7 GB | 22,0 GiB | 21,2 GiB |
| Decodificacion tok/s (1 usuario, prompt 1k / 16k / 64k) | no disponible | 42 / 41 / 37 | 61 / 58 / 50 |
| Concordancia top-1 con BF16 (media de 9 textos) | 100 % | 93,3 % | 94,5 % |
| Concordancia top-1 con BF16 en 6 transcripciones de agente | 100 % | 80,8–96,6 % | 84,0–97,2 % |
| Recuperacion en contexto largo (16k–100k, 1 y 3 agujas) | 24/24 | 24/24 | 24/24 |
| Harness agéntico de navegador (tareas superadas) | 30/30 | 50/50 | 50/50 |
| Busqueda abierta de bugs (bugs sembrados encontrados) | 12/12 | 18/20 | 19/20 |
| Grounding de elementos en capturas (centro de caja dentro del elemento) | 24/32 | 22/32 | 24/32 |
| IoU medio de grounding | 0,49 | 0,42 | 0,52 |
| Preguntas de relaciones espaciales y lectura en pantalla | 8/8, 8/8 | 8/8, 8/8 | 8/8, 8/8 |
| Defectos visuales sembrados encontrados / paginas limpias superadas | 5/12, 5/6 | 5/12, 5/6 | 5/12, 5/6 |

Nota del autor: la comparación con sambit9238 NVFP4 no es estrictamente equivalente en la fila de harness agéntico, porque ese checkpoint activa thinking por defecto con su propia plantilla, mientras que BF16 y este repo usan la plantilla de openbmb en modo instruct.

## Requisitos de hardware

- VRAM estimada: 21,2 GiB de pesos en NVFP4/FP8; con caché KV FP8 y 128k de contexto, el autor usa `--gpu-memory-utilization 0.33` (unos 40 GB) en un DGX Spark.
- GPU recomendadas: NVIDIA Blackwell con soporte nativo de NVFP4, como DGX Spark (GB10), RTX PRO 6000, B200 y RTX 50xx.
- GPU consumer: cabe en tarjetas Blackwell de gama consumer con al menos 24 GB de VRAM efectiva, aunque el autor no detalla modelos concretos.
- Despliegue: vLLM nightly 0.32.1rc1.dev435 o superior, que incluya la arquitectura `MiniCPMV4_7ForConditionalGeneration` (v0.30.0 no la tiene). Requiere backend NVFP4 MoE; en GB10 se selecciona `FLASHINFER_CUTLASS` automáticamente y se recomienda `CUTE_DSL_ARCH=sm_121a`.
- Latencia y throughput: 61 tok/s de decodificación con prompt de 1k, 58 tok/s con 16k y 50 tok/s con 64k, para un usuario en un DGX Spark.
- No hay soporte de MTP; para decodificación especulativa se debe usar el draft model DSpark de openbmb.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este repo (MiniCPM-V-4.7-35B-A3B-NVFP4-FP8) | 35,2B | 128k | Apache 2.0 | safetensors NVFP4/FP8 | 21,2 GiB, 61 tok/s en DGX Spark |
| openbmb/MiniCPM-V-4.7-35B-A3B (BF16) | 35,2B | 128k | Apache 2.0 | safetensors BF16 | 65,7 GB, referencia de fidelidad |
| sambit9238/MiniCPM-V-4.7-35B-A3B-NVFP4 | 35,2B | 128k | no disponible | safetensors NVFP4 | 22,0 GiB, 42 tok/s, thinking por defecto |
| openbmb/MiniCPM-V-4.7-35B-A3B-DSpark | no disponible | no disponible | no disponible | no disponible | Draft model para decodificación especulativa |

## Limitaciones y advertencias

- Requiere hardware NVIDIA Blackwell con soporte nativo de NVFP4; no es desplegable en GPUs Ampere o Hopper sin conversión adicional.
- Requiere una versión nightly de vLLM con la arquitectura `MiniCPMV4_7ForConditionalGeneration`; versiones estables como v0.30.0 no la incluyen.
- Los benchmarks son mediciones propias del autor en un único dispositivo, con pocas ejecuciones por tarea; el propio autor señala que una diferencia de un bug está dentro del ruido.
- No se ejecutaron benchmarks estándar como OCRBench o MMMU, por lo que la comparación con otros modelos multimodales publicados no está disponible.
- Riesgo de alucinación: no evaluado en la información proporcionada.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingüe.
- Con `--reasoning-parser qwen3`, el modelo a veces deja la respuesta final dentro del bloque de razonamiento; si `content` está vacío, hay que leer `reasoning_content`.
- La plantilla de chat por defecto opera en modo instruct; el modo thinking debe activarse explícitamente.
- No incluye cabeza MTP, lo que limita la decodificación especulativa sin un draft model externo.
- Las cifras de recuperación en contexto largo (24/24) provienen de un test sintético demasiado fácil para separar modelos, según el propio autor.
- Licencia Apache 2.0 permite uso comercial, pero el autor no documenta restricciones adicionales del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IstroSec/MiniCPM-V-4.7-35B-A3B-NVFP4-FP8
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- Cuantización NVFP4 previa: https://huggingface.co/sambit9238/MiniCPM-V-4.7-35B-A3B-NVFP4
- Draft model para decodificación especulativa: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B-DSpark
- Herramienta de cuantización llm-compressor: https://github.com/vllm-project/llm-compressor
