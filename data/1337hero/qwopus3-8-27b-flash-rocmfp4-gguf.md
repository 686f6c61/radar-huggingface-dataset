# 1337Hero/Qwopus3.8-27B-Flash-ROCMFP4-GGUF

## Resumen

Qwopus3.8-27B-Flash-ROCMFP4-GGUF es una cuantización experimental en formato GGUF de un modelo multimodal denso de 27.3B parámetros, desarrollado por 1337Hero a partir del modelo base Jackrong/Qwopus3.8-27B-Flash. El modelo original es un sistema multimodal de tipo image-text-to-text con arquitectura "qwen35" (variante de Qwen3.5), 64 capas, atención híbrida lineal/completa, ventana de contexto de 262.144 tokens y una capa de predicción multi-token (MTP) integrada para decodificación especulativa.

Esta release aporta dos versiones cuantizadas en 4 bits con layouts personalizados `Q4_0_ROCMFP4`, optimizadas específicamente para GPUs AMD RDNA4 (gfx1201) y ejecutables únicamente mediante el runtime ROCmFPX, un fork de llama.cpp. La relevancia radica en permitir ejecutar un modelo de 27B con visión y contexto largo en una Radeon AI PRO R9700 de 32 GB, reduciendo el peso de 54.66 GB (BF16) a entre 13.83 y 16.52 GiB. No obstante, es una release experimental: no se ha realizado ninguna evaluación de calidad ni benchmark formal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense multimodal "qwen35" (atención híbrida lineal/completa, 64 capas + 1 capa MTP) |
| Parametros totales | 27.3B según la model card (el metadata de HuggingFace indica 460.730.096, inconsistente; ver limitaciones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | Q4_0_ROCMFP4 (STRAIGHT, 5.19 BPW) y Q4_0_ROCMFP4_STRIX_LEAN (4.35 BPW); mmproj F32 sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantización ROCmFP4; requiere runtime ROCmFPX) |

## Arquitectura y entrenamiento

El modelo base Qwopus3.8-27B-Flash es un transformer denso multimodal con arquitectura "qwen35", que integra un encoder de visión estilo Qwen3.5 y una capa de predicción multi-token (MTP) adicional (bloque 65). La atención es híbrida, combinando atención lineal y atención completa, lo que permite una ventana de contexto de 262.144 tokens manteniendo un coste computacional razonable. La capa MTP se utiliza para decodificación especulativa automática dentro de ROCmFPX, sin necesidad de un archivo de borrador separado.

No se han publicado datos sobre el entrenamiento del modelo base (tokens, composición del dataset, técnicas como RLHF o DPO) en la información disponible. La cuantización se realizó en dos pasos: primero se convirtieron los safetensors BF16 a GGUF BF16 mediante `convert_hf_to_gguf.py --outtype bf16`, y después se aplicó cuantización 4-bit con `llama-quantize` del fork ROCmFPX. El proyecto de visión (`mmproj`) se mantiene en F32 sin cuantizar para evitar artefactos en la codificación de imágenes.

## Capacidades

- Generación multimodal: procesamiento de imágenes junto con texto mediante el archivo `mmproj-Qwopus3.8-27B-Flash-F32.gguf`, que debe pasarse con `--mmproj`.
- Decodificación especulativa automática: la capa MTP integrada en ambos archivos GGUF permite reducir latencia en tareas de generación sin necesidad de un draft model externo.
- Contexto largo de 262.144 tokens, útil para documentos extensos y razonamiento multi-paso.
- Cuantización 4-bit específica para hardware AMD RDNA4 (gfx1201), con dos recetas distintas: `STRAIGHT` (mayor calidad) y `STRIX_LEAN` (menor tamaño y mayor velocidad de decodificación).
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y multi-step reasoning: no documentado.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Inferencia multimodal local en hardware AMD RDNA4: gracias a la cuantización ROCmFP4, se puede ejecutar un modelo de 27B con visión en una Radeon AI PRO R9700 de 32 GB, permitiendo prototipar sistemas de análisis de imágenes sin depender de servicios en la nube.
- Análisis de documentos largos con contenido visual: con 262.144 tokens de contexto, el modelo puede procesar informes técnicos extensos que incluyan diagramas, capturas y texto, facilitando la revisión de documentación o la extracción de información.
- Experimentación con decodificación especulativa: la capa MTP integrada permite evaluar el impacto del multi-token prediction en la latencia de generación para tareas de respuesta corta, como asistentes conversacionales o clasificación de consultas.
- Evaluación de esquemas de cuantización: los dos archivos disponibles (`STRAIGHT` y `STRIX_LEAN`) sirven como banco de pruebas para comparar el compromiso entre calidad de salida y velocidad de decodificación en un mismo hardware.
- Despliegue en estaciones de trabajo con VRAM limitada: la versión `STRIX_LEAN` ocupa 13.83 GiB y cabe en una GPU de 24 GB con margen, lo que la hace viable para equipos AMD de gama media sin necesidad de nodos multi-GPU.
- Pruebas de compatibilidad de runtime: para desarrolladores que trabajan en el fork ROCmFPX, este repositorio ofrece un caso de uso real de los layouts `Q4_0_ROCMFP4` y `Q4_0_ROCMFP4_STRIX_LEAN`, permitiendo validar cambios en la conversión o en el soporte de la capa MTP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se realizó ninguna evaluación de calidad (perplexity, HumanEval, MBPP, agentic gates) ni un benchmark formal de throughput. Los únicos datos de rendimiento provienen de un smoke test:

| Metric | STRAIGHT | STRIX_LEAN |
|---|---|---|
| Velocidad de generación | ~17 t/s | ~24 t/s |
| Condiciones | batch 1, prompt de 8 tokens, ejecución única sin warmup | batch 1, prompt de 8 tokens, ejecución única sin warmup |
| Hardware | Radeon AI PRO R9700 (32 GB) | Radeon AI PRO R9700 (32 GB) |

Estos valores son indicativos y no deben usarse para comparaciones con otros modelos o para decisiones de producción.

## Requisitos de hardware

- VRAM estimada: `STRIX_LEAN` requiere 13.83 GiB; en una GPU de 32 GB con contexto corto sobra aproximadamente 2.7 GB. `STRAIGHT` requiere 16.52 GiB. Para contextos largos, se recomienda cuantizar la caché K/V (por ejemplo, `-ctk q8_0 -ctv q8_0`) o distribuir la carga entre varias tarjetas.
- GPU recomendada: Radeon AI PRO R9700 (gfx1201, RDNA4). Únicamente validado en RDNA4. Strix Halo (gfx1151) y otras GPUs no han sido probadas.
- GPU de consumo: no compatible. El modelo requiere la arquitectura gfx1201 y el runtime ROCmFPX; no se puede ejecutar en GPUs NVIDIA ni en GPUs AMD anteriores sin soporte específico.
- Opciones de despliegue: `llama-server` del fork ROCmFPX, con `--mmproj`, `-ngl 999`, `-c 262144`, `-ctk q8_0 -ctv q8_0`. No es compatible con llama.cpp upstream, Ollama, LM Studio ni vLLM.
- Latencia y throughput: los datos del smoke test mencionados anteriormente. No hay mediciones controladas de latencia de prefill ni de rendimiento en batch.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la información proporcionada. La comparativa siguiente es estructural, basada en el modelo base y las dos cuantizaciones de este repositorio.

| Modelo | Parámetros | Contexto | Tamaño de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jackrong/Qwopus3.8-27B-Flash (BF16) | 27.3B | 262K | 54.66 GB (BF16) | Apache 2.0 | HuggingFace |
| Qwopus3.8-27B-Flash STRAIGHT (ROCmFP4) | 27.3B | 262K | 16.52 GiB | Apache 2.0 | HuggingFace, solo runtime ROCmFPX |
| Qwopus3.8-27B-Flash STRIX_LEAN (ROCmFP4) | 27.3B | 262K | 13.83 GiB | Apache 2.0 | HuggingFace, solo runtime ROCmFPX |

No se han encontrado benchmarks que permitan comparar este modelo con alternativas como Qwen3.5 o Qwopus3.6 en la información disponible.

## Limitaciones y advertencias

- Requiere el fork ROCmFPX y no es compatible con llama.cpp, Ollama, LM Studio ni vLLM upstream. Los archivos pueden ser rechazados por runtimes no compatibles; si una herramienta los carga aparentemente, no se debe confiar en la salida.
- Validación limitada: solo se probó en RDNA4 gfx1201 (Radeon AI PRO R9700). No hay pruebas en Strix Halo, en otras GPUs AMD ni en hardware NVIDIA.
- Sin evaluación de calidad: no se han medido perplexity, HumanEval, MBPP ni pruebas de agentes contra el modelo BF16 original. La pérdida de calidad derivada de la cuantización 4-bit no está cuantificada.
- Sin benchmark formal de throughput: los valores de ~24 t/s y ~17 t/s son de un smoke test de una sola ejecución, sin warmup, con un prompt de 8 tokens. No deben usarse como referencia de rendimiento en producción.
- Calidad de visión no evaluada: el mmproj carga y el servidor se inicia correctamente, pero la generación de respuestas basadas en imágenes no ha sido sometida a pruebas de calidad ni de velocidad.
- Inconsistencia en los metadatos: HuggingFace indica 460.730.096 parámetros totales, lo que contradice la model card del autor (27.3B). Esta discrepancia no ha sido aclarada y puede afectar a herramientas que dependan del metadata.
- Al ser una cuantización agresiva, existe riesgo de alucinación y degradación en tareas complejas, especialmente en la variante `STRIX_LEAN`, que aplica una receta más agresiva en la mayor parte de los tensores.
- No se documentan los idiomas soportados, por lo que no se puede garantizar un comportamiento multilingüe fiable.

## Enlaces

- Repositorio del modelo: https://huggingface.co/1337Hero/Qwopus3.8-27B-Flash-ROCMFP4-GGUF
- Modelo base: https://huggingface.co/Jackrong/Qwopus3.8-27B-Flash
- Runtime ROCmFPX: https://github.com/charlie12345/ROCmFPX
- Perfil de Jackrong: https://huggingface.co/Jackrong
