# defnoteatin/PseudoBrain-27B-FP8

## Resumen

PseudoBrain-27B-FP8 es un modelo de lenguaje denso de 27.359.595.760 parámetros (unos 27,36 mil millones), publicado por el desarrollador independiente Ian Kurt Galeon bajo el alias `defnoteatin`. Se distribuye como un checkpoint en formato FP8 (compressed-tensors) derivado de la familia Qwen 3.8, concretamente una variante "abliterated" (sin los mecanismos de rechazo alineados) del modelo de base `huihui-ai/Huihui-Qwen3.8-27B-abliterated`, cuantizada posteriormente por `batsclamp`. El modelo está pensado para generación de texto, razonamiento y código con ventanas de contexto extremas, hasta 1.048.576 tokens.

La propuesta diferencial no es tanto el modelo base como la arquitectura de servicio que lo acompaña: el autor ha definido una arquitectura propietaria llamada PseudoBrain, implementada como plugin de vLLM (`pb27_vllm`), que combina atención ventaneada, Gated DeltaNet paralelo y un sistema de memoria exacta por páginas sobre NVMe/page-cache. El objetivo declarado es reducir drásticamente el coste de memoria de la caché KV en contextos de un millón de tokens, pasando de unos 64 GB a unos 486 MiB de ventana activa (una reducción del 99,2 % según el autor), manteniendo decodificación de coste constante.

Es relevante ahora porque ataca uno de los cuellos de botella prácticos del despliegue de modelos de contexto largo: el crecimiento lineal de la KV cache y el coste cuadrático del prefill. No obstante, conviene subrayar que muchas de las afirmaciones de rendimiento proceden exclusivamente de la documentación del autor y no han sido verificadas de forma independiente en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 64 capas, 48 capas Gated DeltaNet nativas + 16 capas de atención completa convertidas a SWA de 16K + Gated DeltaNet paralelo + Quest Exact Memory (arquitectura PseudoBrain sobre base Qwen 3.8) |
| Parámetros totales | 27.359.595.760 (~27,36 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 1.048.576 tokens (1M), con memoria recurrente de tamaño fijo O(1) |
| Tipos de cuantización | FP8 (compressed-tensors); el autor publica además ediciones W4A16, NVFP4 y BF16 en repositorios separados |
| Idiomas soportados | No disponible (la model card no detalla cobertura lingüística) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), biblioteca vLLM |

## Arquitectura y entrenamiento

El modelo se apoya en una base Qwen 3.8 de 27B en variante abliterated, es decir, con las direcciones de rechazo eliminadas mediante técnicas de abliteration. Sobre esa base, el autor aplica la arquitectura PseudoBrain, que reorganiza las 64 capas del transformer: 48 capas usan Gated DeltaNet nativo (estado recurrente de tamaño fijo) y 16 capas de atención completa (índices 3, 7, 11, …, 63) se convierten en atención ventaneada de 16K combinada con Gated DeltaNet paralelo y memoria exacta Quest. El estado recurrente de GDN es de tamaño fijo independientemente de si el contexto es de 4K o de 1M tokens.

El sistema de memoria se organiza en tres niveles sobre NVMe y page-cache: las consultas atienden sobre 4 sinks de StreamingLLM, landmarks de super-bloques, las top-k páginas de memoria exacta Quest y una ventana deslizante de 16.384 tokens, todo fusionado mediante FlashAttention-2 con merge LSE. Se añade un mecanismo de RoPE por bloques estrictamente no solapados (`_reposition_rope_blocks`) que preserva la continuidad local y evita el solapamiento de fase entre bloques no adyacentes, además de agregación global densa con landmarks de resumen de super-bloque (un token de resumen por cada 4.096 tokens). No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto conversacional y de razonamiento multi-paso, con modo de razonamiento compatible con el parser `qwen3` de vLLM.
- Generación de código, con soporte de tool calling y function calling mediante el parser `qwen3_coder` y `--enable-auto-tool-choice`.
- Procesamiento de contextos extremadamente largos (hasta 1M tokens) con memoria recurrente de tamaño constante, orientado a tareas de recuperación y razonamiento sobre documentos masivos.
- Memoria exacta por páginas (Quest) con recuperación selectiva de bloques, pensada para mantener fidelidad en la línea temporal macro a 1M tokens.
- Capacidad multilingüe: no disponible en la información proporcionada (heredada presumiblemente del base Qwen 3.8, sin confirmación).
- Modo "uncensored" o abliterated: el modelo no aplica los mecanismos de rechazo del base original.
- No se documentan capacidades de visión ni de audio.

## Casos de uso

- Análisis de repositorios de código completos: con 1M tokens de contexto y decodificación de coste constante, el modelo puede ingerir un monorepo entero y responder preguntas de arquitectura o generar parches sin trocear el código, algo inviable con ventanas de 128K.
- Asistentes de investigación documental: indexación y consulta sobre corpus de cientos de miles de tokens (informes, expedientes, literatura) usando la memoria exacta Quest para recuperar pasajes concretos sin perder la línea temporal global.
- Auditoría legal o de cumplimiento: revisión de contratos y normativa extensa donde la fidelidad de recuperación a larga distancia y la memoria de tamaño fijo permiten mantener sesiones largas sin OOM en GPUs de 32-80 GB.
- Atención al cliente con historial prolongado: conversaciones multi-turno con contexto acumulado de cientos de miles de tokens, desplegado con vLLM y el plugin `pb27_vllm` en un servidor compatible con OpenAI.
- Generación de código en pipelines de CI/CD: integración mediante tool calling y el parser `qwen3_coder` para tareas de revisión automática, generación de tests o refactorización, con la ventaja de FP8 para reducir VRAM frente a BF16.
- Despliegue on-premise de contexto largo: el autor orienta explícitamente el modelo a instalaciones empresariales con GPUs de 32-80 GB (RTX 5090, L40S, A100, H100, MI300X) donde el coste de la KV cache a 1M tokens sería prohibitivo con un transformer estándar.
- Razonamiento multi-paso sobre trazas largas: análisis de logs, trazas de agentes o secuencias de eventos extensas aprovechando el barrido de working-set con rotación de novedad descrito en la arquitectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona la existencia de "benchmark receipts" en el directorio `reports/` del repositorio de GitHub del autor, pero no se incluyen cifras de MMLU, HumanEval, GSM8K ni de tareas de contexto largo en el material proporcionado. Las únicas métricas citadas son de infraestructura: reducción del 99,2 % de la KV cache a 1M tokens (de 64,0 GB a ~486 MiB de ventana activa con un pool de 6,0 GB) y VRAM total estimada de ~33,5 GB para la edición FP8 a 1M tokens.

## Requisitos de hardware

- VRAM estimada para inferencia a 1M tokens (edición FP8): ~33,5 GB en total, con pesos de ~28,5 GB y ~5 GB adicionales de memoria de trabajo.
- GPUs objetivo según el autor: RTX 5090 (32 GB), L40S, A100, H100, DGX Spark y AMD MI300X.
- Ediciones alternativas: W4A16 (~20,5 GB totales, cabe en RTX 3090/4090 de 24 GB y RX 7900 XTX), NVFP4 (~25,5 GB, para Blackwell: RTX 5090, DGX Spark GB10, B200) y BF16 (~60 GB, para A100/H100 de 80 GB o 3× RTX 3090/4090).
- Despliegue: exclusivamente vLLM, con el plugin `pb27_vllm` instalado vía `pip install --no-deps "git+https://github.com/defnotean/pseudobrain.git#subdirectory=serving/pb27_vllm"`. Soporta runners V1 y V2 de vLLM y requiere variables como `VLLM_ALLOW_LONG_MAX_MODEL_LEN=1`, `--enforce-eager`, `--no-enable-prefix-caching` y `--kv-cache-memory-bytes 6G`.
- No se documenta compatibilidad con llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. El autor afirma decodificación de velocidad constante O(1), pero no aporta cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|
| PseudoBrain-27B-FP8 | ~27,36 B (denso) | 1M | Apache 2.0 | vLLM + plugin pb27_vllm | KV cache reducida al 99,2 % según el autor; sin benchmarks publicados |
| Qwen3.8-27B (base) | ~27 B | No disponible en la información | No disponible | vLLM, TGI, llama.cpp (típico) | Modelo original alineado; PseudoBrain deriva de su variante abliterated |
| Huihui-Qwen3.8-27B-abliterated | ~27 B | No disponible en la información | No disponible | vLLM y otros | Base directo del modelo; sin la arquitectura PseudoBrain ni la cuantización FP8 de este repo |
| PseudoBrain-27B-W4A16 | ~27,36 B (denso) | 1M | Apache 2.0 | vLLM + plugin pb27_vllm | Misma arquitectura en cuantización de 4 bits; ~20,5 GB a 1M tokens |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados en la información disponible: las afirmaciones de rendimiento y de reducción de memoria proceden únicamente del autor y no han sido verificadas de forma independiente.
- El modelo es una variante abliterated: no aplica los mecanismos de rechazo del base original, lo que incrementa el riesgo de generar contenido inapropiado, sesgado o dañino y exige filtrado y moderación externos en producción.
- Riesgo de alucinación inherente a un modelo de 27B; la arquitectura de memoria selectiva (top-k Quest, ventana deslizante) puede omitir información relevante fuera de los bloques recuperados, con posible pérdida de fidelidad en tareas de recuperación exacta a muy larga distancia.
- La arquitectura PseudoBrain modifica el comportamiento de atención respecto al modelo base; no hay evidencia independiente de que preserve la calidad del Qwen 3.8 original, especialmente en contextos cortos.
- Dependencia fuerte de un plugin de vLLM mantenido por un único desarrollador, con soporte declarado para runners V1 y V2; posibles roturas ante actualizaciones de vLLM.
- El despliegue a 1M tokens requiere desactivar prefix caching y usar modo eager, lo que puede penalizar el throughput en cargas de producción.
- Cobertura de idiomas no documentada; no se garantiza un rendimiento equivalente en castellano al de los idiomas principales del base.
- Licencia Apache 2.0 permite uso comercial, pero las licencias de los modelos base y de la cadena de derivados (huihui-ai, batsclamp, philbert440) deberían verificarse por separado antes de un despliegue comercial.
- Repositorio con muy poca tracción (37 descargas, 0 likes en el momento de la consulta), lo que reduce la probabilidad de validación comunitaria y de soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/defnoteatin/PseudoBrain-27B-FP8
- Repositorio GitHub del proyecto y plugin vLLM: https://github.com/defnotean/pseudobrain
- Paper de arquitectura (PDF): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.pdf
- Paper de arquitectura (Markdown): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.md
- Informes de benchmarks (reports): https://github.com/defnotean/pseudobrain/tree/main/reports
- Perfil del autor en GitHub: https://github.com/defnotean
- Perfil del autor en Hugging Face: https://huggingface.co/defnoteatin
- Edición W4A16: https://huggingface.co/defnoteatin/PseudoBrain-27B-W4A16
- Edición BF16: https://huggingface.co/defnoteatin/PseudoBrain-27B-BF16
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Checkpoint FP8 de partida: https://huggingface.co/batsclamp/Huihui-Qwen3.8-27B-abliterated-FP8-v2
- Variante AWQ relacionada: https://huggingface.co/philbert440/Qwen3.8-27B-Uncensored-Aggressive-W4A16-AWQ
