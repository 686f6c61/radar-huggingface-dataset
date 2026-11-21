# avlp12/GLM-5.3-Flash-Alis-MLX-4bit

## Resumen

GLM-5.3-Flash-Alis-MLX-4bit es una compilación cuantizada a 4 bits del modelo GLM-5.3-Flash (zai-org), publicada por el usuario avlp12 para su ejecución en Apple Silicon mediante la librería MLX. El modelo base es un transformer de tipo mezcla de expertos (MoE) con 320B parámetros totales y 18B activos (320B-A18B), que combina 34 capas de atención lineal KDA con 11 capas de atención dispersa DSA y un router de 288 expertos. Esta versión concreta ocupa 40.632.442.496 parámetros en safetensors y un repositorio de 181 GB.

La relevancia de esta ficha radica en que permite ejecutar un modelo de escala 320B en hardware de consumo profesional de Apple (M3 Ultra con 512 GB de memoria unificada), algo imposible con las versiones FP8 originales en GPUs convencionales. El autor documenta un proceso de conversión por dequantización en streaming desde la release oficial FP8, sin recuantizar desde una malla empaquetada, y publica los recibos de conversión (`state.json`, `finalize_receipt.json`) dentro del repositorio.

El modelo está pensado para generación de texto y conversación, con soporte de tool calling y decodificación especulativa, y está disponible bajo licencia MIT. Su ecosistema es específico de Apple Silicon (MLX), no de CUDA, lo que condiciona fuertemente los casos de uso y el despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido: 34 capas KDA (atención lineal) + 11 capas DSA (atención dispersa), 288 expertos, mHC |
| Parametros totales | 40.632.442.496 (según safetensors); el modelo base se describe como 320B-A18B |
| Parametros activos | 18B (según nomenclatura 320B-A18B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX); router `mlp.gate` y bias de corrección en fp32 sin cuantizar |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash emplea una arquitectura `glm5_next` que combina 34 capas de atención lineal KDA (Kernelized Dot-Product Attention) con 11 capas de atención dispersa DSA, sobre un MoE de 288 expertos y con un mecanismo denominado mHC. Esta mezcla busca reducir el coste de atención en contextos largos manteniendo la capacidad expresiva de un transformer denso. El modelo completo se distribuye como 320B parámetros con 18B activos por token, lo que sitúa el coste de inferencia en el rango de un modelo denso de ~18B.

La conversión a MLX 4-bit se realizó por dequantización en streaming desde la release oficial FP8 (commit `84c6a6aa`), preservando el router y el bias de corrección en fp32 para evitar el colapso de enrutamiento que sufrió una compilación anterior retirada (que servía a ≈5,5 tok/s). Según la model card, la compilación actual alcanza ≈29 tok/s en decodificación greedy (B=1, prompt 512) sobre una M3 Ultra de 512 GB, y con decodificación especulativa DFlash2 y tensor-parallel en dos máquinas se documentan medias de 76,1 tok/s en un panel de cuatro prompts naturales (frente a 55,6 tok/s en una sola caja). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y conversación multi-turno en inglés y chino.
- Razonamiento y matemáticas: la model card documenta un prompt de matemáticas multi-parte con 60,4 tok/s en una caja y 82,5 tok/s en dos cajas.
- Generación de código: se documenta un prompt de especificación de rate limiter con 32,9 tok/s en una caja y 47,6 tok/s en dos cajas.
- Procesamiento de datos tabulares: prompt de estadísticas de ventas en CSV con 79,2 tok/s en una caja y 108,1 tok/s en dos cajas.
- Decodificación especulativa con drafter DFlash2 (anchura 8) y drafter MTP nativo (este último solo en modo una caja, según la model card).
- Soporte de tensor-parallel en dos nodos (TP=2) con colectivas sobre Thunderbolt, en modo opt-in.
- Tool calling y function calling: no documentado explícitamente en la información disponible.
- Capacidades de agente multi-paso: no documentadas explícitamente en la información disponible.
- Visión y audio: no disponibles.

## Casos de uso

- Inferencia local de un modelo de escala 320B en estaciones de trabajo Apple Silicon: gracias a los 181 GB del repositorio y a la memoria unificada de una M3 Ultra de 512 GB, un equipo individual puede servir el modelo sin depender de GPUs de datacenter. Es el caso de uso central de esta compilación.
- Generación de código asistida en entornos sin CUDA: el modelo mantiene velocidades de 32,9 tok/s en prompts de especificación de código en una sola caja, suficiente para autocompletado y revisión en un IDE local.
- Análisis de datos tabulares y resúmenes de negocio: el prompt de estadísticas de ventas en CSV alcanza 108,1 tok/s en configuración de dos cajas, lo que permite procesar lotes de informes en minutos.
- Razonamiento matemático por lotes: con 82,5 tok/s en dos cajas para problemas multi-parte, es viable ejecutar pipelines de verificación de problemas matemáticos o generación de soluciones paso a paso.
- Servicio conversacional bilingüe inglés-chino: el modelo soporta ambos idiomas, adecuado para atención al cliente o asistentes internos en organizaciones con operaciones en China y mercados anglófonos.
- Prototipado de investigación en arquitecturas híbridas de atención: al ser una compilación abierta con recibos de conversión, permite estudiar el comportamiento de las capas KDA y DSA en hardware Apple sin acceso a la release FP8.
- Despliegue en clústeres pequeños de dos nodos Apple: la configuración TP=2 documentada permite escalar throughput un 37% sobre una sola caja, útil para equipos de investigación con dos M3 Ultra.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks académicos (MMLU, HumanEval, GSM8K). Los datos disponibles son métricas de velocidad de decodificación medidas por el autor.

| Metrica | Valor |
|---|---|
| Decodificación greedy (B=1, prompt 512, una caja M3 Ultra 512GB) | ≈29 tok/s (primera subida); 59,5–59,7 tok/s en diagnóstico p512/gen64 |
| Panel natural de 4 prompts, una caja (greedy, 1.024 tokens) | 55,6 tok/s de media |
| Panel natural de 4 prompts, TP=2 en dos cajas | 76,1 tok/s de media (+37%) |
| Prompt de código (rate limiter), una caja / TP=2 | 32,9 / 47,6 tok/s |
| Prompt de prosa (faros, resumen), una caja / TP=2 | 49,8 / 66,3 tok/s |
| Prompt de CSV (estadísticas de ventas), una caja / TP=2 | 79,2 / 108,1 tok/s |
| Prompt de matemáticas multi-parte, una caja / TP=2 | 60,4 / 82,5 tok/s |
| Tokens aceptados por ronda (media, una caja → TP=2) | 4,12 → 4,06 |
| Coste por ronda especulativa (una caja → TP=2) | 92,2 ms → 66,5 ms (−28%) |
| Greedy plano, una caja / TP=2 | 38,0 / 37,2 tok/s |
| KL media dos cajas vs una caja (teacher-forced) | 0,009–0,012 nats (código); 0,0001–0,004 (resto) |
| Acuerdo top-1 dos cajas vs una caja | ≥0,976 en todos los prompts |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Memoria: el repositorio ocupa 181 GB en safetensors; se requiere al menos esa cantidad de memoria unificada disponible para cargar los pesos, más overhead de KV cache y buffers.
- GPU recomendadas: Apple M3 Ultra con 512 GB de memoria unificada (configuración medida por el autor). No hay soporte CUDA documentado para esta compilación MLX.
- Cabe en GPU de consumo: no en GPUs discretas convencionales (RTX 4090 con 24 GB, A100 80 GB, H100 80 GB quedan muy por debajo de los 181 GB). Solo es viable en Apple Silicon con memoria unificada grande (M3 Ultra 512 GB; configuraciones de 192 GB o 256 GB podrían no ser suficientes).
- Despliegue: librería MLX mediante la rama `glm5-serve-unified` del fork `avlp12/mlx-vlm` (commit `95bbe594`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Tensor-parallel: modo opt-in de dos cajas vía lista de hosts TP; la segunda caja se lanza por ssh desde la primera. Colectivas sobre Thunderbolt.
- Latencia y throughput: ver tabla de benchmarks; en una caja, 55,6 tok/s de media en el panel natural y 29 tok/s en la primera medición greedy; en dos cajas, 76,1 tok/s de media.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-Alis-MLX-4bit (esta ficha) | 40,6B en safetensors (base 320B-A18B) | no disponible | MIT | safetensors MLX | Hugging Face, 803 descargas |
| GLM-5.3-Flash (base, zai-org) | 320B-A18B | no disponible | no disponible en la información | FP8 | Hugging Face |
| GLM-5.3-Flash-vlm-q4-quasar-kda5 (build del mismo autor) | no disponible | no disponible | no disponible | MLX 4-bit con KDA a 5 bits | Repositorio del autor, usado para las métricas TP=2 |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada. Las alternativas de la misma escala (320B-A18B) en formato MLX no están documentadas en la información disponible.

## Limitaciones y advertencias

- Idiomas: solo inglés y chino; no hay soporte declarado de castellano ni de otras lenguas.
- Contexto: la longitud de contexto no está disponible en la información proporcionada, lo que impide planificar despliegues con ventanas largas.
- Riesgo de alucinación: no cuantificado; no se han publicado evaluaciones de fidelidad ni de tasas de alucinación.
- Sesgos: no documentados en la información disponible.
- Licencia MIT: permite uso comercial, pero el modelo base (zai-org/GLM-5.3-Flash) puede tener condiciones adicionales no reflejadas en la información disponible; conviene verificar la licencia del modelo base antes de un uso comercial.
- Hardware: la compilación solo funciona en Apple Silicon con MLX; no es portable a CUDA ni a GPUs discretas.
- Estabilidad: el modo de dos cajas con el drafter MTP nativo no es usable todavía (desincronización del segundo nodo documentada por el autor); solo DFlash2 está verificado en dos cajas.
- Numérica: el modo TP=2 no produce texto byte-idéntico al de una caja por el orden de acumulación de `all_sum`; el autor lo valida con KL y acuerdo top-1, no con identidad exacta.
- Reproducibilidad: las métricas de velocidad dependen de la rama y el commit del fork `mlx-vlm`; distintas ramas dan cifras distintas (el autor lo detalla en la model card).
- Madurez: 803 descargas y 6 likes en el momento de la consulta; es una compilación de un tercero, no una release oficial de zai-org.

## Enlaces

- Hugging Face: https://huggingface.co/avlp12/GLM-5.3-Flash-Alis-MLX-4bit
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Repositorio del fork MLX: https://github.com/avlp12/mlx-vlm
- Rama de serving: https://github.com/avlp12/mlx-vlm/tree/glm5-serve-unified
- Commit de serving: https://github.com/avlp12/mlx-vlm/commit/95bbe594
- Rama de corrección MTP en dos cajas: https://github.com/avlp12/mlx-vlm/tree/claude/tp-eof-mtp-desync-0908
- Paper referenciado en tags: arxiv:2608.13966
