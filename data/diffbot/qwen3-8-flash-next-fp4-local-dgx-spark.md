# diffbot/Qwen3.8-Flash-Next-FP4-Local-DGX-Spark

## Resumen

Qwen3.8-Flash-Next FP4-Local para DGX Spark es una cuantización NVFP4 del modelo multimodal Qwen3.8-Flash-Next de Qwen, empaquetada por diffbot junto con una receta de servicio completa para ejecutarlo en una única NVIDIA DGX Spark (SoC GB10, arquitectura Blackwell, sm_121a). El modelo base es un transformer de mezcla de expertos (MoE) con 125.000 millones de parámetros totales y 6.000 millones activos por token, capacidad de visión y tablas de embeddings n-gram de 51.000 millones de parámetros. Los pesos publicados en este repositorio suman 187.931.804.131 parámetros según los safetensors, un total que incluye las tablas de embeddings n-gram además de los parámetros del transformer.

El interés del repositorio no está tanto en la cuantización en sí (procedente de la versión FP4-Local de NVIDIA) como en la receta de inferencia: kernels CUDA personalizados para GB10, un cabezal MTP de decodificación especulativa afinado para cargas agénticas de programación, planificación consciente de caché para varias sesiones de agente y checkpoints de prefix-cache que reducen drásticamente el tiempo hasta el primer token en turnos de seguimiento. El autor reporta 65,3 tok/s de decodificación y 3.236 tok/s de prefill en prompts de 33K tokens, con una calidad prácticamente idéntica al modelo BF16 original (divergencia KL de 0,0465).

Es relevante ahora porque demuestra que un MoE de 125B con visión y ventana de 131K tokens puede servirse con latencia interactiva en hardware de un solo nodo de consumo profesional, usando una API compatible con OpenAI y soporte de tool calling, lo que habilita flujos agénticos locales sin depender de la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE) con visión y tablas de embeddings n-gram; cabezal MTP para decodificación especulativa |
| Parámetros totales | 187.931.804.131 (safetensors del repo); el modelo base se describe como 125B totales más 51B de embeddings n-gram |
| Parámetros activos | 6B por token |
| Longitud de contexto | 131K tokens |
| Tipos de cuantización | NVFP4 (FP4-Local de NVIDIA, vía modelopt); activaciones en bf16 en todas las llamadas MoE |
| Idiomas soportados | no disponible |
| Licencia | nvidia-open-model-agreement (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors; librería de servicio vLLM |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer MoE con 125B parámetros totales y 6B activos, al que se añaden tablas de embeddings n-gram de 51B parámetros y un codificador visual para entrada de imagen y vídeo. Esta versión concreta no reentrena el modelo: parte de la cuantización NVFP4 de NVIDIA (`nvidia/Qwen3.8-Flash-Next-FP4-Local`) y solo entrena los 29 tensores densos de la capa MTP (91M parámetros), el cabezal borrador de decodificación especulativa, afinado para cargas de trabajo agénticas de programación. Como la decodificación especulativa verifica cada token borrador contra el modelo completo, el cabezal afecta a la velocidad y no a las salidas: 3,48 tokens por paso frente a 3,26 en programación agéntica.

La receta de servicio incorpora kernels personalizados de decodificación y prefill para GB10 (sm_121a), incluido un kernel MoE de prefill persistente, kernels fusionados de HyperConnection y normalización, y chunks de prefill de 8.192 tokens. Además, mantiene activaciones en bf16 en todas las llamadas MoE (el stock usa activaciones FP4 en llamadas de tamaño prefill), guarda el checkpoint de prefix-cache de cada prompt justo antes de su final para que un turno de seguimiento solo recalcule el mensaje nuevo, y aplica planificación consciente de caché que prioriza la petición con el prefijo cacheado más largo cuando varias sesiones comparten KV cache. Cada cambio tiene un interruptor de desactivación en `recipe/serve/serve.sh`. No se dispone de información sobre el dataset de entrenamiento del modelo base ni sobre si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento, con modo de razonamiento (`thinking`) configurable mediante el parser `qwen3`.
- Entrada multimodal: texto, imagen y vídeo (`image-text-to-text`).
- Programación y matemáticas: GSM8K 97,5 % y HumanEval 97,0 % en la receta publicada.
- Tool calling y function calling mediante el parser `qwen3_xml` de vLLM.
- Flujos agénticos multi-turno con definiciones de herramientas y llamadas a herramientas, con prompts de hasta 131K tokens.
- Decodificación especulativa con cabezal MTP propio, activa por defecto en la receta.
- Ventana de contexto larga de 131K tokens, con recuperación verificada tipo needle a 29K, 96K y 125K tokens en pruebas con tool calls.
- API compatible con OpenAI servida en el puerto 8000 con el nombre de modelo `qwen3.8-flash-next`.
- Capacidades multilingües: no disponible.

## Casos de uso

- Programación agéntica local: el modelo puede ejecutar sesiones de agente con definiciones de herramientas y llamadas reales sobre un repositorio, con 65,3 tok/s de decodificación y turnos de seguimiento que arrancan en 0,90 s gracias a los checkpoints de prefix-cache. Es adecuado para equipos que quieren un agente de código sin enviar el código a la nube.
- Asistente de revisión de código en CI/CD: con HumanEval al 97,0 % y soporte de tool calling, puede integrarse en pipelines que invocan al servidor vLLM vía API compatible con OpenAI para generar parches, explicar diffs o responder preguntas sobre el repositorio.
- Análisis de documentación técnica extensa: la ventana de 131K tokens y la recuperación verificada a 125K permiten cargar manuales, especificaciones o actas completas y hacer preguntas con referencias cruzadas sin trocear el documento.
- Procesamiento de capturas y vídeo en soporte técnico: la entrada image-text-to-text permite adjuntar capturas de pantalla de errores o grabaciones cortas de una interfaz y obtener diagnósticos o pasos de reproducción.
- Automatización de tareas multi-paso con varias sesiones concurrentes: la planificación consciente de caché permite ejecutar cuatro sesiones de agente simultáneas con un tiempo hasta el primer token mediano de 1,0 s, útil para orquestadores que lanzan varios agentes en paralelo sobre el mismo corpus.
- Despliegue en entornos con requisitos de soberanía del dato: al ejecutarse íntegramente en una DGX Spark local con pesos descargados del Hub, encaja en escenarios donde el texto, las imágenes o el código no pueden salir de la infraestructura propia.
- Evaluación y prototipado de modelos MoE cuantizados: la receta incluye scripts de benchmark (`test-toolcall.py`, `needle-test.py`, `quality-probe.py`) que permiten reproducir las métricas de calidad y latencia antes de adoptar el modelo en producción.

## Benchmarks y rendimiento

Calidad, frente a vLLM stock en la misma DGX Spark:

| Métrica | vLLM stock | Esta receta |
|---|---:|---:|
| GSM8K (primeros 200) | 97,0 % | 97,5 % |
| HumanEval | 97,6 % | 97,0 % |
| Needle a 29K / 96K / 125K tokens, tool calls | pasa | pasa |
| Divergencia KL frente al modelo BF16 | no disponible | 0,0465 (acuerdo top-1 92,1 %) |

Velocidad con una petición a la vez, frente a vLLM stock en la misma DGX Spark (release 2026-11-03):

| Métrica | vLLM stock | Esta receta | Mejora |
|---|---:|---:|---:|
| Decodificación, programación agéntica | 48,8 tok/s | 65,3 tok/s | 1,34× |
| Prefill, prompt de 33K tokens | 2.226 tok/s | 3.236 tok/s | 1,45× |
| Tiempo hasta el primer token, prompt de 112K tokens | 51,3 s | 35,5 s | 1,44× |
| Tiempo hasta el primer token, turno de seguimiento (mediana) | 3,70 s | 0,90 s | 4,1× |
| Benchmark de programación agéntica, tiempo de reloj (92 turnos) | 1.161 s | 693 s | 1,68× |

Sesiones concurrentes, release actual frente a la release 2026-11-03 (75 peticiones, prompts de hasta 131K tokens):

| Métrica | Release 2026-11-03 | Release actual | Mejora |
|---|---:|---:|---:|
| Tiempo de reloj, una sesión de agente a la vez | 523,5 s | 469,6 s | 1,11× |
| Tiempo de reloj, cuatro sesiones a la vez | 1.554,9 s | 390,6 s | 3,98× |
| Media geométrica de ambas | no disponible | no disponible | 2,11× |
| Tiempo hasta el primer token, cuatro sesiones (mediana) | 84 s | 1,0 s | no disponible |

Prefill en frío: 3.597 tok/s frente a 3.099–3.118 tok/s de la release 2026-11-03 en un prompt de 25K tokens (aproximadamente un 15 % más rápido); la velocidad de decodificación no cambia. GSM8K y HumanEval se midieron con decodificación greedy y razonamiento desactivado, con una variación de unos 1,5 puntos entre arranques. No se han publicado resultados de benchmarks del modelo base frente a otros modelos en la información disponible.

## Requisitos de hardware

- Hardware objetivo: una única NVIDIA DGX Spark con SoC GB10 (Blackwell, sm_121a). La receta está afinada específicamente para esta plataforma y no se documenta su funcionamiento en otras GPU.
- VRAM estimada: el repositorio ocupa 107,1 GB, por lo que se necesita al menos esa capacidad de memoria unificada para cargar los pesos; no se dispone de cifras de memoria pico durante la inferencia.
- GPU recomendadas: DGX Spark (GB10). No hay datos sobre A100, H100 o RTX 4090 para esta receta.
- GPU de consumo: no disponible; la receta no menciona compatibilidad con GeForce.
- Despliegue: vLLM con la imagen pública fijada más b12x, con parches de vLLM y b12x y kernels CUDA personalizados incluidos en `recipe/`. Arranque mediante `recipe/serve/serve.sh`, que expone una API compatible con OpenAI en el puerto 8000. El primer arranque compila y autotunea los kernels en `~/.cache/qwen38-flash-next-spark` (unos 25 minutos); los arranques posteriores tardan unos 5 minutos.
- Rendimiento: 65,3 tok/s de decodificación en programación agéntica, 3.236 tok/s de prefill con prompt de 33K tokens, 35,5 s hasta el primer token con prompt de 112K tokens, 0,90 s de mediana hasta el primer token en turnos de seguimiento y 1,0 s de mediana con cuatro sesiones concurrentes.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Calidad reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next FP4-Local (esta ficha) | 187,9B en safetensors (125B + 51B embeddings n-gram) | 6B | 131K | GSM8K 97,5 %, HumanEval 97,0 %, KL 0,0465 frente a BF16 | nvidia-open-model-agreement | Hugging Face, receta para DGX Spark |
| Qwen/Qwen3.8-Flash-Next (BF16) | 125B + 51B embeddings n-gram | 6B | 131K | referencia de calidad del que deriva esta cuantización | no disponible | Hugging Face |
| nvidia/Qwen3.8-Flash-Next-FP4-Local | no disponible | no disponible | no disponible | no disponible | nvidia-open-model-agreement | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones de modelos de otros fabricantes comparables en la información proporcionada.

## Limitaciones y advertencias

- La receta está afinada exclusivamente para GB10 (sm_121a) en una DGX Spark; no hay evidencia de que los kernels personalizados funcionen en otras GPU y el rendimiento fuera de esa plataforma es desconocido.
- La licencia es `nvidia-open-model-agreement`, no una licencia de código abierto estándar; es imprescindible revisar sus términos antes de cualquier uso comercial o de redistribución.
- El repositorio hereda las limitaciones del modelo base Qwen3.8-Flash-Next, cuyos sesgos, idiomas y riesgos de alucinación no se documentan en la información disponible.
- La cuantización NVFP4 introduce una divergencia respecto al modelo BF16: KL de 0,0465 y acuerdo top-1 del 92,1 %, lo que implica que aproximadamente un 8 % de las predicciones top-1 difieren del modelo de referencia.
- Las métricas de calidad varían unos 1,5 puntos entre arranques en GSM8K y HumanEval, por lo que diferencias pequeñas entre configuraciones no deben interpretarse como mejoras reales.
- El primer arranque requiere compilar y autotunear kernels durante unos 25 minutos, lo que complica despliegues efímeros o autoescalado.
- El cabezal MTP solo se entrenó para cargas agénticas de programación; su ganancia de velocidad en otras tareas no está documentada.
- No se especifican los idiomas soportados, por lo que no se puede garantizar un rendimiento adecuado en castellano sin evaluarlo.
- El modelo acepta imagen y vídeo, pero no se documentan sesgos visuales, resolución máxima soportada ni comportamiento con contenido sensible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/diffbot/Qwen3.8-Flash-Next-FP4-Local-DGX-Spark
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Cuantización original de NVIDIA: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-FP4-Local
- Dataset de métricas de divergencia KL: https://huggingface.co/datasets/AtomicChat/Qwen3.8-Flash-Next-Uncensored-GGUF-metrics
