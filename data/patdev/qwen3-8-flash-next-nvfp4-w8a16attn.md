# patdev/Qwen3.8-Flash-Next-NVFP4-W8A16attn

## Resumen

Qwen3.8-Flash-Next-NVFP4-W8A16attn es la versión cuantizada del modelo multimodal de arquitectura híbrida Qwen3.8-Flash-Next, desarrollado por RadixArk y publicado en HuggingFace por el usuario patdev. La cuantización se realizó con NVIDIA Model Optimizer (snapshot 87c9f8cf) aplicando la receta NVFP4 W4A4 exclusivamente a los expertos enrutados de las 48 capas MoE, mientras que la atención, QSA, GDN, mHC, expertos compartidos, routers, embeddings, visión y la capa MTP permanecen en BF16. El checkpoint reduce el peso de 360 GB a aproximadamente 135 GB (2,7x).

El modelo base tiene ~180B de parámetros y una ventana de contexto de hasta 262.144 tokens. Acepta texto, imagen y video como entrada, y produce texto. Esta versión está pensada para desarrolladores que evalúan el despliegue cuantizado con SGLang en hardware NVIDIA Blackwell, especialmente para sistemas agénticos, chat, codificación y razonamiento multimodal. Según los datos de safetensors, el checkpoint contiene 119.602.003.859 parámetros, una cifra que difiere de los ~180B declarados en la model card y que no está explicada en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (GDN + QSA sparse attention, multi-hyperconnection streams, PLE n-gram injection), MoE multimodal |
| Parámetros totales | 119.602.003.859 (checkpoint NVFP4); ~180B (modelo base según model card) |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantización | NVFP4 W4A4 (E2M1, group size 16, escalas FP8 E4M3, escalas globales FP32, activaciones NVFP4 dinámicas) en expertos enrutados; BF16 en atención, QSA, GDN, mHC, expertos compartidos, routers, embeddings, LM head, visión y MTP; FP8 en tablas PLE n-gram |
| Idiomas soportados | no disponible |
| Licencia | other (ver modelo base) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un MoE multimodal con 48 capas de decodificador, 512 expertos enrutados por capa (top-10 routing) más un experto compartido, y una capa MTP (multi-token prediction). Combina atención dispersa QSA con GDN, flujos multi-hyperconexión (mHC) e inyección de n-gramas PLE. Acepta texto, imagen y video, y genera texto. Según el repositorio de GitHub del modelo base, las mejoras se centran en atención, residual, embedding y optimización.

El checkpoint cuantizado se obtiene aplicando NVFP4 W4A4 solo a las proyecciones fusionadas `gate_up_proj` y `down_proj` de los expertos enrutados (294.912 tensores cuantizados). El resto de los pesos se mantiene byte-idéntico al modelo original. Las tablas de embedding PLE se cargan desde la versión FP8 del modelo base (`Qwen/Qwen3.8-Flash-Next-FP8`), con 128 shards F8_E4M3 y escala escalar por tabla, de-cuantizados a BF16 en tiempo de carga. No se proporcionan detalles sobre el preentrenamiento del modelo base (tokens, composición del dataset, RLHF/DPO). El dataset de calibración para la cuantización es `cnn_dailymail` (config 3.0.0, train split), con 128 artículos truncados a 512 tokens y 62.139 filas por capa capturadas del servicio SGLang en prefill. La sonda de representatividad usa GSM8K train [0:16] x2.

## Capacidades

- Generación de texto y razonamiento matemático/científico: resultados GSM8K 97.27 y AIME26 98.75 pass@1.
- Multimodal: entrada de texto, imagen y video, salida de texto.
- Contexto largo: hasta 262.144 tokens.
- Soporte de agentes: la model card menciona sistemas agénticos y generaciones agénticas largas, aunque con mayor latencia que BF16.
- Codificación: mencionado en el caso de uso del modelo.
- Chat conversacional: pipeline `image-text-to-text` con soporte conversacional.
- No se especifica soporte de tool calling / function calling en la información disponible.
- Idiomas soportados: no disponible.

## Casos de uso

- Razonamiento matemático avanzado: con GSM8K 97.27 y AIME26 98.75 pass@1, el modelo es adecuado para resolver problemas de olimpiadas y matemáticas de nivel superior, integrándose en tutores o sistemas de ayuda.
- Sistemas agénticos de largo recorrido: con 262K de contexto y soporte para generaciones largas, puede gestionar flujos de trabajo multi-paso que requieren mantener estado a lo largo de muchas interacciones.
- Análisis multimodal de documentos: al aceptar imagen y video, puede extraer información de diagramas, capturas de pantalla o grabaciones, respondiendo preguntas sobre el contenido.
- Asistente de codificación: mencionado en el caso de uso, puede generar y razonar sobre código, integrarse en entornos de desarrollo o pipelines de CI/CD.
- Chat conversacional: pipeline conversacional, ideal para asistentes virtuales que necesitan mantener conversaciones largas y coherentes.
- Evaluación de despliegue cuantizado en hardware Blackwell: los desarrolladores pueden probar la inferencia NVFP4 con SGLang en GB300/B300 para validar rendimiento, precisión y consumo de recursos en entornos de producción.
- Procesamiento de documentos extensos: con 262K de contexto, puede analizar informes, transcripciones o libros completos sin perder información.

## Benchmarks y rendimiento

| Eval | Protocolo | BF16 referencia | NVFP4 (este checkpoint) |
|---|---|---|---|
| GSM8K | full 1319, t0.6 / top-p 0.95 / max 8192 | 97.12–97.50 | 97.27 (stop 98.86, err 0) |
| AIME26 | 30 problemas x 8, t1.0 / max 130k | 100 (240/240) | 98.75 pass@1 (majority@8 100, stop 99.17) |

Notas: la referencia BF16 se registró en una revisión anterior de la misma línea de modelo; los deltas de peso no están establecidos, por lo que las comparaciones son indicativas, no exactas. El resultado de AIME26 se midió en la revisión anterior de este checkpoint, cuyos pesos difieren solo en las tablas de embedding PLE. La cuantización preserva la precisión de un solo turno (GSM8K/AIME in-band); las generaciones agénticas largas tienden a durar más que BF16. No se han publicado otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el checkpoint ocupa ~132.6 GB, por lo que se requiere al menos 2 GPUs para el despliegue con TP=2.
- GPU recomendadas: NVIDIA Blackwell, validado en GB300 y B300.
- No cabe en GPUs de consumo (24 GB).
- Opciones de despliegue: SGLang (requiere build con soporte `qwen4_exp`). No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Comando de ejemplo: `python -m sglang.launch_server --model-path RadixArk/Qwen3.8-Flash-Next-NVFP4 --tp 2 --quantization modelopt_fp4 --fp4-gemm-backend flashinfer_cutlass --page-size 64 --mamba-scheduler-strategy extra_buffer --mamba-track-interval 64 --chunked-prefill-size 4096 --max-running-requests 36 --context-length 262144 --mem-fraction-static 0.80 --allow-auto-truncate --port 30000`.
- Latencia y throughput: no disponible; la model card indica que las generaciones agénticas largas tienden a durar más que BF16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | ~180B | 262K | BF16 | other | HuggingFace |
| Qwen3.8-Flash-Next-FP8 | no disponible | no disponible | FP8 | other | HuggingFace |
| Qwen3.8-Flash-Next-NVFP4 (este) | ~180B (119.6B en checkpoint) | 262K | NVFP4 W4A4 en expertos enrutados | other | HuggingFace (candidato privado) |

Nota: la versión FP8 se menciona en la model card como una revisión actualizada del modelo base, pero no se proporcionan sus especificaciones completas ni benchmarks públicos en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo base fue entrenado con datos que contienen lenguaje tóxico y sesgos sociales; puede amplificarlos y devolver respuestas tóxicas especialmente con prompts tóxicos.
- Riesgo de alucinación: puede generar respuestas inexactas, omitir información clave o incluir texto irrelevante o redundante, produciendo texto socialmente inaceptable incluso si el prompt no es ofensivo.
- Idiomas: no se especifica soporte multilingüe.
- Licencia: "other"; consultar el modelo base para conocer los términos y posibles restricciones de uso comercial.
- Checkpoint candidato privado: no es una versión oficial; puede estar sujeto a cambios.
- Comparaciones de benchmarks indicativas: las referencias BF16 son de una revisión anterior; el resultado de AIME26 se midió en una revisión previa.
- Requiere SGLang con soporte `qwen4_exp`, que puede no estar disponible en builds estándar.
- Compatibilidad de hardware limitada a NVIDIA Blackwell.

## Enlaces

- HuggingFace (patdev): https://huggingface.co/patdev/Qwen3.8-Flash-Next-NVFP4-W8A16attn
- Lanzamiento original (RadixArk): https://huggingface.co/RadixArk/Qwen3.8-Flash-Next-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Versión FP8: https://huggingface.co/Qwen/Qwen3.8-Flash-Next-FP8
- NVIDIA Model Optimizer: https://github.com/NVIDIA/TensorRT-Model-Optimizer
- GitHub del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Dataset de calibración: https://huggingface.co/datasets/abisee/cnn_dailymail
