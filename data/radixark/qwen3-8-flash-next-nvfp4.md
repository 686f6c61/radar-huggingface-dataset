# RadixArk/Qwen3.8-Flash-Next-NVFP4

## Resumen

RadixArk/Qwen3.8-Flash-Next-NVFP4 es una cuantización NVFP4 del modelo multimodal híbrido Qwen/Qwen3.8-Flash-Next, desarrollada por RadixArk con NVIDIA Model Optimizer. Se trata de una versión candidata privada, publicada el 25 de agosto de 2026, cuyo objetivo es permitir la evaluación de inferencia cuantizada W4A4 del modelo base sobre hardware NVIDIA Blackwell (validado en GB300 y B300). El checkpoint reduce el tamaño del modelo de 360 GB (BF16) a 135 GB, un factor de compresión aproximado de 2,7 veces.

La cuantización se aplica exclusivamente a los expertos enrutados de las 48 capas MoE del modelo principal, mientras que atención, QSA, GDN, streams multi-hiperconexión, expertos compartidos, routers, embeddings, cabezas de visión, LM head y las 31 capas MTP permanecen en BF16 byte-idénticos al original. El modelo mantiene la ventana de contexto de 262K tokens y soporta entrada multimodal (texto, imagen y vídeo). Es un modelo de arquitectura híbrida (Transformer con Gated DeltaNet, atención dispersa QSA, inyección n-gram PLE) que sirve como avance de la arquitectura Qwen4.

La relevancia de este checkpoint radica en que es una de las primeras cuantizaciones NVFP4 día-cero publicadas para esta familia de modelos, y su rendimiento evaluado en GSM8K y AIME26 se mantiene en banda con la referencia BF16, lo que lo convierte en una opción viable para servir agentes, chat, código y razonamiento multimodal en producción con requisitos de VRAM reducidos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (GDN + QSA sparse attention, multi-hyperconnection streams, PLE n-gram injection), multimodal MoE, 48 capas decoder, 512 expertos enrutados por capa (top-10) + experto compartido, 1 capa MTP |
| Parámetros totales | ~180B declarados (360 GB BF16); pesos safetensors: 119.602.003.859 (~119.6B) |
| Parámetros activos | No disponible (modelo MoE con top-10 de 512 expertos; no se indica el total activo) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantización | NVFP4 W4A4 (E2M1, group size 16, escalas de bloque FP8 E4M3, escalas globales FP32, activaciones dinámicas NVFP4); solo expertos enrutados; PLE en FP8 (F8_E4M3) |
| Idiomas soportados | No disponible |
| Licencia | other (consultar el modelo base Qwen/Qwen3.8-Flash-Next) |
| Formato de pesos | safetensors (Model Optimizer), 135.2 GB en repo |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3.8-Flash-Next es un MoE multimodal híbrido que combina atención dispersa QSA (Qwen Sparse Attention), Gated DeltaNet (GDN) y múltiples flujos de hiperconexión (multi-hyperconnection), además de inyección de n-gramas PLE. Se compone de 48 capas decoder, con 512 expertos enrutados por capa MoE y un experto compartido, más una capa MTP (Multi-Token Prediction). El contexto máximo es de 262K tokens.

La cuantización NVFP4 se realizó con NVIDIA Model Optimizer (snapshot `87c9f8cf`, v0.46.0), aplicando la receta W4A4 únicamente a los expertos enrutados de las 48 capas principales (tensores fusionados `gate_up_proj` / `down_proj`, 294.912 entradas cuantizadas). La calibración se hizo con el dataset CNN Dailymail (config 3.0.0, 128 artículos, truncados a 512 tokens), capturando activaciones de entrada de los bloques MoE desde SGLang en vivo (solo prefill, 62.139 filas por capa), con escalas de activación por máximo sobre 8 lotes muestreados con semilla. Las tablas de incrustación PLE usan versiones cuantizadas FP8 del modelo `Qwen/Qwen3.8-Flash-Next-FP8`. No hay metadatos de cuantización de KV-cache.

## Capacidades

- Generación de texto multimodal: acepta texto, imágenes y vídeo como entrada, produce texto.
- Razonamiento avanzado: evaluado en GSM8K (97.27) y AIME26 (98.75 pass@1), mostrando capacidades matemáticas y de razonamiento de alto nivel.
- Generación de código y soporte de agentes: el modelo base es apto para sistemas agénticos, chat y código; la cuantización preserva estas capacidades.
- Contexto largo: 262K tokens, adecuado para documentos extensos, conversaciones de larga duración y análisis multimodal de vídeo.
- Soporte de tool calling / function calling: no se especifica explícitamente en la documentación, pero el modelo base Qwen3.8-Flash-Next está diseñado para agentes.
- Capacidades multilingües: no disponibles.
- Sin modo de razonamiento explícito (thinking mode) documentado en la información proporcionada.

## Casos de uso

- **Sistemas agénticos de larga duración**: con 262K tokens de contexto y arquitectura híbrida, el modelo puede gestionar tareas multi-step con memoria extendida, ideal para agentes que razonan sobre conversaciones extensas o documentos largos.
- **Razonamiento matemático y científico**: con GSM8K 97.27 y AIME26 98.75 pass@1, es adecuado para resolver problemas matemáticos complejos, verificación de pruebas y asistencia en investigación técnica.
- **Análisis multimodal de documentos**: al aceptar imagen y vídeo, puede procesar capturas, diagramas o vídeos junto con texto, útil para inspección técnica, análisis de datos visuales o revisión de documentación.
- **Chat y asistencia conversacional**: con contexto largo y generación fluida, sirve como base para chatbots de soporte técnico o asistencia al cliente que requieren recordar historial extenso.
- **Generación de código en producción**: el modelo base soporta tareas de codificación; la cuantización permite desplegarlo en hardware Blackwell con menor VRAM, integrándolo en pipelines de CI/CD o IDEs para asistencia de programación.
- **Investigación sobre cuantización y despliegue**: el checkpoint sirve como referencia para estudiar el impacto de la cuantización NVFP4 W4A4 en modelos MoE híbridos, comparando rendimiento y comportamiento con la versión BF16.
- **Inferencia en tiempo real con SGLang**: con soporte nativo en SGLang y el backend `flashinfer_cutlass`, permite servir el modelo con tensor parallelism 2 en GB300/B300, reduciendo costes de memoria y mejorando el throughput en producción.

## Benchmarks y rendimiento

La model card reporta resultados para este checkpoint exacto:

| Eval | Protocolo | BF16 referencia¹ | NVFP4 (este checkpoint) |
|---|---|---|---|
| GSM8K | full 1319, t0.6 / top-p 0.95 / max 8192 | 97.12–97.50² | **97.27** (stop 98.86, err 0) |
| AIME26 | 30 problemas x 8, t=1.0 / max 130k | 100 (240/240) | **98.75 pass@1** (majority@8 100, stop 99.17)³ |

¹ Las referencias BF16 se registraron en una revisión anterior del modelo base; las diferencias de pesos no están establecidas, por lo que las comparaciones son indicativas.
² Rango en tres ejecuciones BF16 independientes de la revisión anterior.
³ Medido en una revisión anterior de este checkpoint, con diferencias solo en las tablas de incrustación PLE.

Nota comportamental: la cuantización preserva la precisión de una sola vuelta (GSM8K/AIME dentro de banda); las generaciones agénticas largas tienden a tardar más que en BF16.

## Requisitos de hardware

- **VRAM estimada**: el checkpoint ocupa 135.2 GB en disco. Con SGLang y el backend `flashinfer_cutlass` en NVFP4, se recomienda al menos 2x80 GB (GB300/B300) para el contexto completo de 262K tokens; el modelo base BF16 requeriría 360 GB en VRAM.
- **GPUs recomendadas**: NVIDIA Blackwell (GB300, B300) validado; no se especifica soporte para otras arquitecturas.
- **GPU consumer**: no cabe en GPU de consumo (requiere VRAM mínima de ~80 GB por GPU, incluso con cuantización).
- **Opciones de despliegue**: SGLang con soporte `qwen4_exp` (build específico), comando de lanzamiento con `--quantization modelopt_fp4 --fp4-gemm-backend flashinfer_cutlass`.
- **Latencia y throughput**: no disponibles; se indica que las generaciones agénticas largas tienden a ser más lentas que BF16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-Flash-Next (BF16) | ~180B (declarados) | 262K | BF16 | other | HuggingFace |
| RadixArk/Qwen3.8-Flash-Next-NVFP4 (este) | ~119.6B (safetensors) | 262K | NVFP4 W4A4 (solo expertos) | other | HuggingFace (candidato privado) |
| Qwen/Qwen3.8-Flash-Next-FP8 | ~180B (declarado) | 262K | FP8 | other | HuggingFace |

El modelo base BF16 es el punto de referencia natural; el checkpoint NVFP4 ofrece una compresión 2,7x con pérdida de rendimiento mínima en GSM8K/AIME. La variante FP8 del modelo base es otra alternativa de cuantización, pero no se dispone de benchmarks comparables en la información proporcionada. No hay datos disponibles de otros modelos comparables en la misma categoría (MoE multimodal de ~180B con contexto 262K).

## Limitaciones y advertencias

- **Sesgos y toxicidad**: el modelo base fue entrenado con datos de internet que contienen lenguaje tóxico y sesgos sociales; puede amplificarlos, especialmente con prompts ofensivos.
- **Alucinación**: puede generar respuestas inexactas, omitir información clave o incluir contenido irrelevante o redundante, incluso sin prompts ofensivos.
- **Precisión en generaciones largas**: la cuantización preserva la precisión en tareas de una sola vuelta, pero las generaciones agénticas largas tienden a tardar más que en BF16.
- **Licencia**: licencia "other"; los términos de uso deben consultarse en el modelo base Qwen/Qwen3.8-Flash-Next.
- **Hardware restringido**: solo soportado en NVIDIA Blackwell (GB300/B300) con SGLang; no es compatible con GPUs de arquitectura anterior.
- **Checkpoint candidato**: es una versión privada candidata, no un lanzamiento estable; los pesos pueden diferir de revisiones futuras.
- **Idiomas**: no se documentan los idiomas soportados; el modelo base Qwen es multilingüe, pero no se confirma para este checkpoint.

## Enlaces

- [HuggingFace: RadixArk/Qwen3.8-Flash-Next-NVFP4](https://huggingface.co/RadixArk/Qwen3.8-Flash-Next-NVFP4)
- [HuggingFace: Qwen/Qwen3.8-Flash-Next (modelo base)](https://huggingface.co/Qwen/Qwen3.8-Flash-Next)
- [NVIDIA Model Optimizer (GitHub)](https://github.com/NVIDIA/TensorRT-Model-Optimizer)
- [Dataset de calibración: cnn_dailymail](https://huggingface.co/datasets/abisee/cnn_dailymail)
- [Blog de LMSYS: Qwen3.8-Flash-Next Day-0 Support in SGLang](https://www.lmsys.org/blog/2026-08-26-qwen-flash-next)
- [Documentación SGLang: Qwen3.8-Flash-Next](https://docs.sglang.io/cookbook/autoregressive/Qwen/Qwen3.8-Flash-Next)
- [Guía de ejecución local: unsloth](https://unsloth.ai/docs/models/qwen3.8-next)
