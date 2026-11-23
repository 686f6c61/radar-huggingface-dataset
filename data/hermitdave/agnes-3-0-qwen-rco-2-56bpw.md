# hermitdave/Agnes-3.0-Qwen-RCO-2.56bpw

## Resumen
Agnes-3.0-Qwen-RCO-2.56bpw es una cuantización mixta de precisión del modelo multimodal Agnes-3.0-Qwen, publicada por el usuario hermitdave en Hugging Face. El modelo base, desarrollado por Agnes-AI, emplea la arquitectura experimental `qwen4_exp` de Qwen y combina atención lineal Gated-DeltaNet con atención completa en un esquema híbrido, además de un esquema de mezcla de expertos (MoE) con 512 expertos enrutados y enrutamiento top-10. El resultado es un modelo de aproximadamente 180.000 millones de parámetros totales orientado a razonamiento multimodal (texto e imagen) y conversación.

La relevancia de esta ficha radica en su empaquetado: se trata de una cuantización agresiva (2,56 bits por peso nominal) que reduce el checkpoint a 76,8 GB, pensada para ejecutarse en Apple Silicon mediante MLX y el runtime oMLX. Incorpora innovaciones poco habituales en modelos abiertos, como una tabla de embeddings n-grama con offload a SSD, una cabeza de predicción multi-token (MTP) para decodificación especulativa y una ventana de contexto declarada de hasta 1.048.576 posiciones en la configuración original, aunque el autor verifica 131.072 tokens en hardware de 64 GB.

Esta variante concreta (2.56bpw) es hermana de otra build de 2.5bpw y se distingue únicamente por el ancho de los expertos enrutados, lo que permite aislar esa variable en comparaciones controladas. Es un artefacto muy especializado: no es un modelo para producción generalista, sino una pieza de evaluación para quienes experimentan con cuantización extrema y despliegue local en hardware de consumo de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido `qwen4_exp` con MoE: 48 capas (36 de atención lineal Gated-DeltaNet y 12 de atención completa, una cada 4), 512 expertos enrutados con top-10, tabla PLE de embeddings n-grama en capa 1, cabeza MTP y torre de visión |
| Parametros totales | 179.999.981.459 (~180 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 posiciones declaradas en la configuración original; 131.072 tokens verificados en esta build sobre 64 GB de memoria unificada |
| Tipos de cuantizacion | Cuantización afín mixta: 4 bits (grupo 64) por defecto en atención, expertos compartidos, normas, routers y escalas; expertos enrutados uniformemente a 2 bits; tabla PLE a 4 bits (grupo 32); cabeza MTP a 4 bits (grupo 64); `embed_tokens` y `lm_head` preservados en BF16. Nominal 2,2666 bpw |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `license:other` en Hugging Face) |
| Formato de pesos | safetensors (formato MLX), con 22 shards independientes `ngram-*.safetensors` para la tabla PLE; tamaño de repo 76,8 GB |

## Arquitectura y entrenamiento
El modelo base sigue la arquitectura `qwen4_exp`, un diseño híbrido que alterna 36 capas de atención lineal Gated-DeltaNet con 12 capas de atención completa (una de cada cuatro). Esta combinación busca reducir el coste de memoria de la caché KV en contextos largos: solo 12 de las 48 capas mantienen estado de atención completo, mientras que las capas Gated-DeltaNet portan un estado recurrente de tamaño fijo. Según el autor, el coste medido de KV es de aproximadamente 32,6 KB por token. La componente MoE cuenta con 512 expertos enrutados con enrutamiento top-10, lo que implica que en cada paso se activa una fracción pequeña del total de parámetros.

Sobre el entrenamiento del modelo base no hay información en la documentación proporcionada: no se detallan el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. Sí se documentan innovaciones de inferencia: una tabla PLE (parallel-lookup n-gram embedding) en la capa 1, almacenada como 22 shards independientes para permitir memory-mapping y paginación desde SSD en lugar de mantener 32 GB residentes; y una cabeza MTP (multi-token prediction) para decodificación especulativa. La cuantización se realizó con el método `rco-mlx` (asignación de precisión mixta guiada por sensibilidad, RTN con búsqueda de clip por grupo, sin imatrix). No se midió la recuperación de calidad frente a una referencia BF16, ya que no existe una build MLX en BF16 de este checkpoint (el original es un paquete HF de 360 GB).

## Capacidades
- Generación de texto conversacional y razonamiento multimodal (entrada de imagen y texto, salida de texto) según el pipeline `image-text-to-text`.
- Razonamiento de múltiples pasos y modo "thinking" desactivable (las evaluaciones se realizaron con thinking desactivado).
- Decodificación especulativa mediante cabeza MTP, con aceptación media medida del 79,2 % y 2,25 tokens por ciclo de verificación en esta build.
- Capacidades multilingües: no disponibles en la documentación.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes: no documentado en la información disponible.
- Procesamiento de contexto largo: 131.072 tokens verificados, con calidad más allá de los benchmarks no evaluada.

## Casos de uso
- Evaluación de cuantización extrema en investigación: sirve como artefacto controlado para medir el impacto de bajar los expertos enrutados a 2 bits frente a la build hermana de 2.5bpw, manteniendo idéntica el resto de la configuración.
- Despliegue local en Apple Silicon de gama alta: con un M3 Max de 64 GB de memoria unificada, el modelo se ejecuta a ~35 tokens/s de decodificación, adecuado para prototipos interactivos de razonamiento multimodal en local.
- Procesamiento de documentos largos con imagen y texto: la ventana verificada de 131.072 tokens y el bajo coste de KV (~32,6 KB/token) permiten ingerir transcripciones, informes o capturas extensas en una sola pasada.
- Experimentación con decodificación especulativa: la cabeza MTP cuantizada a 4 bits mantiene la aceptación y produce salidas greedy idénticas con MTP activado y desactivado, lo que la convierte en banco de pruebas para técnicas de aceleración.
- Investigación sobre atención lineal híbrida: la mezcla de Gated-DeltaNet y atención completa permite estudiar el compromiso entre memoria de KV y calidad en tareas de contexto largo.
- Demostraciones de inferencia con offload a SSD: la tabla PLE paginada desde disco (`qwen4_ple_ssd_offload`) es un caso práctico de gestión de memoria para modelos que exceden la RAM disponible.

## Benchmarks y rendimiento
Precisión zero-shot con 200 muestras por tarea, decodificación greedy y thinking desactivado, según la model card:

| Build | HellaSwag | ARC-Challenge | WinoGrande | MMLU | Media |
|---|---|---|---|---|---|
| agnes-2.5bpw | 92,00 | 94,50 | 73,00 | 85,50 | 86,25 |
| agnes-e2 (esta build) | 92,00 | 93,50 | 75,50 | 82,50 | 85,88 |
| Suelo uniforme 2 bits (control negativo) | 15,50 | 28,00 | no alcanzado | no alcanzado | 21,75 |

Rendimiento de inferencia en oMLX sobre Apple M3 Max (64 GB), flujo único, longitud de generación 128:

| Prompt (tokens) | TTFT | TPOT | Decodificación (tok/s) | Prefill (tok/s) | Memoria pico |
|---|---|---|---|---|---|
| 1.024 | 2,8 s | 28,1 ms | 35,8 | 371,1 | 44,72 GB |
| 8.192 | 18,7 s | 30,0 ms | 33,6 | 438,6 | 45,62 GB |
| 65.536 | 111,0 s | 27,9 ms | 36,1 | 590,4 | 47,49 GB |

No se han publicado resultados de benchmarks adicionales (MMLU-Pro, HumanEval, GSM8K, evaluación de visión) en la información disponible.

## Requisitos de hardware
- Checkpoint en disco: 76,8 GB. Se recomienda espacio libre en disco al menos igual al tamaño del modelo para el swap de macOS.
- Memoria residente: ~45-51 GB según la build y el contexto; pico de RSS medido de 47,49 GB a 64k de contexto en esta build.
- GPU/SoC recomendados: Apple Silicon con 64 GB o más de memoria unificada (validado en M3 Max de 64 GB). No hay datos de despliegue en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: no hay datos; en Apple Silicon requiere configuraciones de gama alta con 64 GB o más. En GPUs NVIDIA de consumo (24 GB) no cabe por tamaño.
- Opciones de despliegue: runtime oMLX (validado); otros runtimes MLX no están confirmados. La model card advierte que el checkpoint usa claves de tipo `Qwen4ExpForConditionalGeneration` y hay que verificar la compatibilidad de layout antes de asumir interoperabilidad.
- Latencia y throughput: TTFT de 2,8 s a 1k de prompt y 111 s a 64k; decodificación de ~33-36 tok/s; prefill de 371-590 tok/s según longitud de prompt.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad (media benchmarks) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Agnes-3.0-Qwen-RCO-2.56bpw (esta ficha) | ~180 mil millones (MoE) | 131.072 verificados | 85,88 | qwen-community-1.0 | MLX, orientado a oMLX |
| agnes-2.5bpw (build hermana) | ~180 mil millones (MoE) | 65.536 verificados | 86,25 | qwen-community-1.0 | MLX, orientado a oMLX |
| Agnes-3.0-Qwen (base BF16) | ~180 mil millones (MoE) | 1.048.576 declarados | no disponible (referencia BF16 de 360 GB) | qwen-community-1.0 | Paquete HF BF16 |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias
- No se midió la recuperación de calidad frente a una referencia BF16 (no existe build MLX BF16 de este checkpoint), por lo que la pérdida real de precisión respecto al modelo original es desconocida.
- No se evaluó la calidad en contexto largo más allá de los benchmarks indicados, ni la ruta de visión o vídeo: solo se ejercitaron la carga y la generación de texto.
- El checkpoint está orientado específicamente a oMLX y usa un layout de claves de VLM (`Qwen4ExpForConditionalGeneration`); la interoperabilidad con otros runtimes no está garantizada.
- `embed_tokens` y `lm_head` se mantienen en BF16 (2,54 GB); cuantizarlos ahorraría ~1,75 GB, pero no se midió su impacto.
- Las diferencias entre esta build y la de 2.5bpw están dentro del ruido de muestreo (±2,5 puntos por tarea con 200 muestras), por lo que las comparaciones de calidad deben interpretarse con cautela.
- El control negativo muestra que forzar todos los módulos a 2 bits colapsa la calidad por debajo del azar aunque el modelo cargue y pase una prueba de humo: la asignación de precisión mixta es crítica.
- Riesgo de alucinación, sesgos conocidos y limitaciones idiomáticas: no documentados en la información disponible.
- Licencia `qwen-community-1.0`: las condiciones de uso comercial deben consultarse en el enlace de licencia del repositorio antes de usarlo en producción.
- El modelo tiene 28 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/hermitdave/Agnes-3.0-Qwen-RCO-2.56bpw
- Modelo base: https://huggingface.co/Agnes-AI/Agnes-3.0-Qwen
- Build hermana agnes-2.5bpw: https://huggingface.co/hermitdave/Agnes-3.0-Qwen-RCO-2.5bpw (enlace citado de forma truncada en la model card)
- Licencia qwen-community-1.0: archivo LICENSE del repositorio del modelo
