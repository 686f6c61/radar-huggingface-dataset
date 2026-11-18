# qwegnai/Apex-35B-V1.0-hq4g32

## Resumen

Apex-35B-V1.0-hq4g32 es un paquete de pesos cuantizados del modelo Apexintelligence-AI/Apex-35B-V1.0, un transformer híbrido de tipo Mixture-of-Experts (MoE) con capacidades multimodales (texto e imagen) desarrollado por el usuario qwegnai. El modelo base fue post-entrenado a partir de Qwen/Qwen3.6-35B-A3B, y este paquete está empaquetado específicamente para el motor de inferencia Qwegn (v0.27.1+), un runtime escrito en Swift 6.2 + Metal 4 para Apple Silicon. No es un checkpoint en safetensors, GGUF ni MLX: usa el contenedor propietario QWP1 y solo carga en Qwegn.

El modelo cuenta con 35.950 millones de parámetros totales y aproximadamente 3.000 millones activos por token (1.045 tensores), con una arquitectura de 40 capas que combina 30 capas Gated-DeltaNet con 10 capas de atención completa, 256 expertos (8 enrutados + 1 compartido), cabeza MTP nativa y una torre de visión de 27 capas. El contexto nativo es de 262.144 tokens, cualificado hasta 1.048.576 tokens mediante YaRN, KV en q4 y Latent Sparse Attention (LSA).

Su relevancia radica en que es un ejemplo de optimización agresiva para hardware de consumo Apple Silicon: el paquete ocupa 22,18 GiB en cuantización HQ4_G32_M5 (5,30 bits por parámetro) y alcanza velocidades de prefill de 6.415,7 tok/s a 4K tokens y decodificación especulativa de 213,8 tok/s en un Apple M5 Max, con una ventana de contexto de hasta 1M tokens y recall de aguja del 100% en todas las pruebas entre 64K y 1M.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE `qwen3_5_moe`: 40 capas (30 Gated-DeltaNet + 10 full-attention), 16Q/2KV GQA, head_dim=256, 256 expertos (8 enrutados + 1 compartido), cabeza MTP nativa, torre de visión de 27 capas |
| Parámetros totales | 35,95 B (1.045 tensores) |
| Parámetros activos | ~3 B por token |
| Longitud de contexto | 262.144 tokens nativo; 1.048.576 (1M) con YaRN + KV q4 + LSA |
| Tipos de cuantización | HQ4_G32_M5 (5,30 bits/parámetro) + BF16 mixto; KV cache en q4 |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Contenedor propietario QWP1 (`model.qwp`) + sidecar LSA (`model.qlsa`); no es safetensors, GGUF ni MLX |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido MoE denominado `qwen3_5_moe`, con 40 capas en las que 30 son Gated-DeltaNet (atención lineal de estado) y 10 son capas de atención completa con GQA (16 cabezas de consulta, 2 de clave/valor, dimensión de cabeza 256). El MoE consta de 256 expertos con 8 enrutados más 1 compartido por token, lo que resulta en aproximadamente 3.000 millones de parámetros activos de los 35.950 millones totales. Incluye una cabeza MTP (Multi-Token Prediction) nativa con `mtp_num_hidden_layers = 1` que habilita decodificación especulativa, y una torre de visión de 27 capas para entrada de imagen. El modelo soporta modo `<think>` dinámico.

El modelo base fue post-entrenado a partir de Qwen/Qwen3.6-35B-A3B (commit `5105f8f9ed8fd8212a72da546bcbb4f01d2cfd68`). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica destacable de este paquete es la Latent Sparse Attention (LSA), un sidecar `model.qlsa` de tipo QLSA0001 basado en SVD sin datos, con `index_dim = 64` y presupuesto 2.048, aplicado en las capas [3, 7, 11, 15, 19, 23, 27, 31, 35, 39]. Según el autor, LSA proporciona una aceleración de 9,79× en prefill y 3,16× en decodificación frente a atención densa a 256K tokens.

## Capacidades

- Generación de texto y razonamiento con modo `<think>` dinámico.
- Generación de código: 72/100 en `code-100` (82% HumanEval, 62% MBPP).
- Capacidades multimodales de imagen a texto (`image-text-to-text`) mediante torre de visión de 27 capas.
- Soporte de tool calling y function calling (conformidad de API 295/295 en `llmprobe`, incluyendo endpoints de chat, responses, messages y completions).
- Razonamiento agéntico multi-paso: 64/88 (72,7%) en pruebas agénticas de `llmprobe`.
- Contexto largo cualificado hasta 1M tokens con recall de aguja 3/3 en todos los niveles de 64K a 1M.
- Capacidades multilingües limitadas a inglés y chino.
- Decodificación especulativa mediante cabeza MTP (hasta `d=5`).
- Prefijo de caché en caliente con latencia de 28 ms (11,5× de mejora).

## Casos de uso

- Análisis de documentos extensos: con contexto cualificado de hasta 1M tokens y recall de aguja del 100%, el modelo puede procesar libros completos, expedientes legales o bases de código extensas en una sola pasada sin fragmentación.
- Asistencia de código en producción: con 82% en HumanEval y soporte de tool calling, puede integrarse en pipelines de CI/CD para revisión de código, generación de tests y corrección automática, con decodificación especulativa a 213,8 tok/s que reduce la latencia interactiva.
- Agentes autónomos multi-paso: el 72,7% en pruebas agénticas y la conformidad completa de API (chat, responses, messages) permiten construir agentes que encadenan llamadas a herramientas con contexto persistente.
- Procesamiento multimodal de documentos: la torre de visión de 27 capas con 3.218,8 tok/s de prefill permite extraer información de capturas, diagramas o formularios escaneados en flujos de digitalización.
- Atención al cliente con contexto largo: la ventana de 262K nativa y la caché de prefijo en caliente (28 ms) permiten conversaciones multi-turno con historial extenso y baja latencia percibida.
- Inferencia local en Apple Silicon: el paquete de 22,18 GiB cabe en un Mac con 32 GB o más de memoria unificada, lo que habilita despliegue privado sin GPU dedicada para prototipado, investigación y aplicaciones de escritorio.
- Análisis de repositorios completos: la combinación de contexto de 1M tokens y capacidades de código permite razonar sobre bases de código enteras para refactorización o auditoría de seguridad.

## Benchmarks y rendimiento

Medidos por el autor en un Apple M5 Max (18 núcleos CPU, GPU Apple10 NAX de 40 núcleos, 128 GB de memoria unificada, 585 GB/s DRAM) con `llmprobe v0.6.16`, KV en q4, LSA en auto y temperatura 0.

| Métrica | Resultado |
|---|---|
| Prefill CLI @4K (4.033 tok) | 6.415,7 tok/s (6.475,7 GPU) |
| Prefill CLI @16K (16.343 tok) | 6.261,8 tok/s (6.284,7 GPU) |
| Prefill servidor (prompt 10.406 tok) | 5.810,2 tok/s (mediana) |
| TTFT en frío / caché de prefijo en caliente | 89 ms / 28 ms (11,5×) |
| Decodificación CLI serial / d=1 / d=3 / d=5 | 148,54 / 174,01 / 174,93 / 171,47 tok/s |
| Decodificación servidor (mediana / especulativa) | 178,0 / 213,8 tok/s |
| Escalado de contexto servidor (~511 a ~65,5K) | 174,0 a 153,3 tok/s |
| Conformidad de API (`llmprobe --full`, 1,64M tok) | 295/295 (100%) |
| Fidelidad de motor | 100% (36/36 correctitud, 3/3 determinismo) |
| Capacidad / agéntico / code-100 | 91,9% / 72,7% / 72% |
| HumanEval / MBPP | 82% (41/50) / 62% (31/50) |
| Visión multimodal (prefill / decode) | 3.218,8 / 134,57 tok/s |
| Contexto 1M (prefill / decode) | 5.491,2 / 100,90 tok/s (TTFT 189,40 s, RSS 28,96 GiB) |
| Aceleración LSA vs atención densa @256K | 9,79× prefill / 3,16× decode |

No se han publicado resultados de benchmarks comparativos con otros modelos (MMLU, GSM8K, etc.) en la información disponible. Los datos anteriores son mediciones de rendimiento del motor, no de calidad del modelo frente a terceros.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 22,18 GiB para los pesos + ~0,96 MiB del sidecar LSA; ~21,45 GiB en decodificación serial CLI y 22,23 GiB con visión cargada; 28,96 GiB RSS a contexto de 1M tokens.
- GPU recomendadas: exclusivamente Apple Silicon con Metal 4 (el runtime Qwegn es Swift 6.2 + Metal 4). El autor midió en un Apple M5 Max con 128 GB de memoria unificada.
- Cabe en GPU de consumo: sí, en Apple Silicon con al menos 32 GB de memoria unificada (22,18 GiB de pesos más overhead del runtime y KV cache). No es compatible con GPU NVIDIA o AMD.
- Opciones de despliegue: únicamente el motor Qwegn v0.27.1+ (`qwg serve` para servidor HTTP, CLI con `--load-vision`, `--mtp-drafts`, `--kv-mode q4`, `--lsa-mode auto`). No es compatible con vLLM, llama.cpp, Ollama, TGI ni MLX.
- Latencia y throughput: TTFT en frío de 89 ms, 28 ms con caché de prefijo; prefill de 6.415,7 tok/s @4K; decodificación de 178,0 tok/s (mediana servidor) y 213,8 tok/s especulativa; deriva estable de +2,9% en 3m 25s; 0 asignaciones en estado estacionario.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| Apex-35B-V1.0-hq4g32 (este) | 35,95 B totales / ~3 B activos | 262K nativo, 1M con YaRN+LSA | Apache 2.0 | QWP1, solo Qwegn (Apple Silicon) | Cuantización HQ4 5,30 bpw; multimodal; MTP |
| Qwen/Qwen3.6-35B-A3B (base del post-entrenamiento) | 35 B totales / ~3 B activos | No disponible en la información | No disponible en la información | No disponible en la información | Modelo original sobre el que se post-entrenó Apex |
| Apexintelligence-AI/Apex-35B-V1.0 (modelo base) | 35,95 B totales / ~3 B activos | 262.144 nativo | Apache 2.0 | No disponible en la información | Modelo sin cuantizar del que deriva este paquete |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada. La comparativa se limita a la relación de linaje entre el paquete cuantizado y sus modelos de origen.

## Limitaciones y advertencias

- Compatibilidad restringida: solo carga en el motor Qwegn v0.27.1+ sobre Apple Silicon con Metal 4. No funciona en safetensors, GGUF, MLX, vLLM, llama.cpp, Ollama ni TGI.
- Idiomas limitados: solo inglés y chino; no hay soporte declarado para castellano ni otros idiomas.
- Sesgos conocidos: no se documentan en la información disponible; al derivar de Qwen3.6, es previsible que herede sesgos del corpus de entrenamiento original, pero no se aportan datos concretos.
- Riesgo de alucinación: no cuantificado en la información disponible. El autor reporta 100% de fidelidad de motor y determinismo byte-exacto en 3/3, pero esto mide consistencia del runtime, no veracidad del contenido.
- Limitación de contexto: el contexto nativo es 262.144 tokens; la extensión a 1M requiere YaRN + KV q4 + LSA y degrada el throughput (100,90 tok/s de decode y 189,40 s de TTFT a 1M).
- Licencia Apache 2.0: permite uso comercial, pero el paquete depende de un runtime propietario (Qwegn) cuya licencia no se detalla en la información disponible; conviene verificar los términos del motor antes de producción.
- Divergencia especulativa: el autor advierte que la aceptación variacional especulativa puede divergir de la decodificación greedy serial, lo que afecta a la reproducibilidad exacta.
- Rendimiento dependiente de hardware: todas las métricas se midieron en un Apple M5 Max de 128 GB; en equipos con menos memoria o generaciones anteriores el rendimiento será sustancialmente menor.
- Madurez: el paquete tiene 0 descargas y 0 likes en el momento de la ficha, creado el 2026-11-18; no hay evidencia de validación independiente por terceros.

## Enlaces

- Hugging Face (este paquete): https://huggingface.co/qwegnai/Apex-35B-V1.0-hq4g32
- Modelo base: https://huggingface.co/Apexintelligence-AI/Apex-35B-V1.0
- Modelo de origen del post-entrenamiento: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Motor de inferencia Qwegn: https://github.com/qwegnai/qwegn
