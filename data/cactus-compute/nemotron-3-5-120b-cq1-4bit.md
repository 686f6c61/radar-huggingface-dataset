# Cactus-Compute/nemotron-3.5-120b-cq1.4bit

## Resumen

Nemotron 3.5 Super VL 120B-A12B en cuantización CQ 1.4-bit es una versión comprimida del modelo multimodal de NVIDIA, publicada por Cactus-Compute bajo la licencia OpenMDW 1.1. El modelo original combina una arquitectura híbrida Mamba-Transformer con mezcla de expertos (MoE), orientada a tareas de razonamiento, código, matemáticas y visión, con soporte de conversación multi-turno y comprensión de documentos e imágenes.

La versión CQ1.4bit reduce el checkpoint completo a 22,06 GB mediante una estrategia de cuantización mixta: proyecciones de expertos enrutados a 1 y 1,5 bits, cabezas de vocabulario y proyecciones Mamba a 2 bits, y el resto de tensores (atención, routers, embeddings, torre de visión) a 4 bits, manteniendo normas y sesgos en BF16/FP32. El resultado es un modelo que cabe en memoria unificada de un MacBook Pro de 36 GB y que, según la model card, conserva en promedio el 96,4 % del rendimiento del original BF16 en 18 benchmarks.

Su relevancia actual radica en que demuestra que es posible ejecutar un modelo multimodal de clase 120B con activación de 12B en hardware de consumo Apple Silicon, con una degradación media del 3,6 % y con un rendimiento en tareas agénticas de código (SWE-bench Verified) incluso superior al del BF16 original en la evaluación reportada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-Transformer con MoE (tag `nemotron_h_omni`), multimodal (torre de visión + proyector) |
| Parametros totales | 22.029.082.117 (checkpoint cuantizado); el modelo base se denomina 120B-A12B |
| Parametros activos | 12B (según denominación del modelo base A12B) |
| Longitud de contexto | Hasta 262K tokens verificados en GraphWalks; el set de NVIDIA se extiende a 1M (no confirmado para esta cuantización) |
| Tipos de cuantizacion | Mixta CQ: 1-bit, 1,5-bit, 2-bit, 4-bit, BF16 y FP32 (1,418 bits efectivos por peso) |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | OpenMDW 1.1 (`license: other`) |
| Formato de pesos | safetensors (librería MLX) |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido con capas Mamba y mecanismo de mezcla de expertos (MoE), denominado internamente `nemotron_h_omni` por sus capacidades multimodales. Incluye una torre de visión con proyector, una cabeza MTP (multi-token prediction) y proyecciones de atención y enrutadores MoE. Los datos de entrenamiento provienen de los datasets `nvidia/nemotron-pre-training-datasets` y `nvidia/nemotron-post-training-v3`, aunque la model card no detalla el número de tokens ni la composición exacta del corpus.

La innovación principal de esta publicación es el método de cuantización Cactus Quants (CQ), descrito en un paper en OpenReview. La estrategia asigna precisiones distintas por tipo de tensor: las proyecciones down de expertos enrutados y los expertos compartidos a 1 bit; las proyecciones up de expertos enrutados a 1,5 bits; las proyecciones de entrada Mamba y la cabeza de vocabulario a 2 bits; atención, proyecciones latentes, routers, embeddings de tokens, salida Mamba, lineales de visión/proyector y proyección de entrada MTP a 4 bits; y normas, pesos Mamba y embeddings de visión en BF16. Los sesgos de corrección de routers se mantienen en FP32. El resultado son 1,418 bits efectivos por peso y un archivo de 22,06 GB.

## Capacidades

- Generación de texto conversacional multi-turno en seis idiomas (en, es, fr, de, it, ja).
- Razonamiento avanzado con modo "thinking" (evaluado en LiveCodeBench v6, BigCodeBench y GPQA Diamond con thinking activado).
- Generación y completado de código, incluyendo tareas de ingeniería de software agéntica (SWE-bench Verified, DeepSWE).
- Matemáticas y razonamiento científico (GSM8K, SciCode).
- Visión: respuesta a preguntas visuales (V*), razonamiento matemático sobre imágenes (MathVision).
- Comprensión de documentos y OCR (tags `document-question-answering`, `ocr`).
- Seguimiento de instrucciones estrictas (IFEval, IFBench).
- Manejo de contexto largo: evaluado con prompts de hasta 262K tokens (GraphWalks) y tareas de razonamiento de contexto largo (AA-LCR).
- Capacidades multilingües evaluadas en 10 idiomas mediante MMLU-ProX Lite.
- Soporte de tool calling y flujos agénticos (evaluado con mini-swe-agent y OpenCode).
- Decodificación con cabeza MTP (multi-token prediction) verificada.

## Casos de uso

- Asistente de código en local sobre Apple Silicon: con 22 GB de pesos y 47 tokens/s de decodificación en un M5 Max de 36 GB, permite integrar un agente de programación (tipo mini-swe-agent) en el portátil sin depender de la nube, manteniendo un 63,6 % en SWE-bench Verified según la model card.
- Análisis de documentos con OCR y VQA: la torre de visión y el proyector permiten extraer texto y responder preguntas sobre imágenes y documentos escaneados, útil para digitalización de facturas, contratos o informes técnicos.
- Razonamiento matemático sobre imágenes: MathVision con un 76,22 en la versión CQ lo hace adecuado para tutoría o verificación de problemas con enunciados gráficos.
- Atención al cliente multilingüe: soporte de seis idiomas y contexto de hasta 262K tokens permiten gestionar conversaciones largas con historial extenso y documentación adjunta.
- Procesamiento de contexto largo en investigación: AA-LCR con un 70,45 (mejora sobre BF16) lo hace viable para resumir o razonar sobre corpus extensos, como expedientes o artículos científicos.
- Generación de código en pipelines de CI/CD: HumanEval idéntico al BF16 (95,12) y BigCodeBench con degradación moderada permiten usarlo como generador de tests o parches en entornos con recursos limitados.
- Prototipado de agentes autónomos en local: la combinación de tool calling, MTP y ejecución en MLX permite iterar sobre flujos agénticos sin coste de API, aunque con la advertencia de la caída en tareas de horizonte largo (DeepSWE).

## Benchmarks y rendimiento

| Benchmark | BF16 original | CQ 1.4-bit | Cambio relativo |
|---|---|---|---|
| MMLU-Pro (560 preguntas) | 77,50 | 71,79 | −7,4 % |
| MMLU-ProX Lite, 10 idiomas (5.880) | 76,04 | 76,28 | +0,3 % |
| GPQA Diamond (198 × 8) | 89,20 | 85,54 | −4,1 % |
| GSM8K, extracción flexible (300) | 94,00 | 91,67 | −2,5 % |
| IFEval, prompt-level strict (300) | 83,33 | 82,67 | −0,8 % |
| IFBench (300 × 8) | 71,58 | 65,31 | −8,8 % |
| HumanEval (164) | 95,12 | 95,12 | 0,0 % |
| LiveCodeBench v6, thinking (1.055) | 86,07 | 81,04 | −5,8 % |
| BigCodeBench, thinking, complete | 65,26 | 61,84 | −5,2 % |
| BigCodeBench, thinking, instruct | 52,28 | 51,05 | −2,4 % |
| BigCodeBench, leaderboard, complete | 61,58 | 59,74 | −3,0 % |
| BigCodeBench, leaderboard, instruct | 52,72 | 50,18 | −4,8 % |
| SciCode, subtask accuracy (65 × 8) | 45,83 | 41,23 | −10,0 % |
| GraphWalks, prompts hasta 262K tokens (650) | 96,58 | 88,03 | −8,9 % |
| AA-LCR v1.1 (98 × 16) | 67,35 | 70,45 | +4,6 % |
| V*, imagen (191 × 8) | 86,32 | 82,85 | −4,0 % |
| MathVision, imagen (3.040) | 81,28 | 76,22 | −6,2 % |
| SWE-bench Verified, mini-swe-agent, sin red (500) | 61,4 % (307) | 63,6 % (318) | +3,6 % |
| **Media de los 18 benchmarks** | | | **−3,6 %** |

Resultados adicionales reportados por separado:

| Benchmark | BF16 | CQ 1.4-bit |
|---|---|---|
| DeepSWE (OpenCode, sin red) | 24/113 (21,2 %) | 7/113 (6,2 %) |
| GSM8K, extracción estricta | 52,67 | 65,67 |

## Requisitos de hardware

- VRAM/RAM estimada: 22,06 GB de pesos; pico medido de 21,0 GiB de RAM de proceso en un MacBook Pro M5 Max de 36 GB.
- GPU recomendadas: Apple Silicon con memoria unificada (M5 Max de 36 GB verificado); no se reportan pruebas en GPU NVIDIA, ya que la librería es MLX.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con al menos 24-32 GB de memoria unificada; en RTX 4090 (24 GB) no hay soporte MLX nativo.
- Opciones de despliegue: MLX con Cactus MLX (descarga del checkpoint en el primer uso); no se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: 47 tokens/s de decodificación de texto en caliente (mediana de 46,7 con prompt de 512 tokens y 128 de salida), medido en M5 Max de 36 GB, media de tres ejecuciones batch-one tras warm-up.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Nemotron 3.5 Super VL 120B-A12B CQ 1.4-bit (este) | 22,03B almacenados (120B-A12B nominal) | hasta 262K verificado | OpenMDW 1.1 | safetensors (MLX) | Multimodal, MoE híbrido Mamba-Transformer |
| NVIDIA Nemotron-3.5-Super-VL-120B-A12B-BF16 (base) | 120B-A12B | hasta 1M según set de NVIDIA | OpenMDW 1.1 | BF16 | Referencia de calidad; requiere mucho más almacenamiento |
| PrismML Ternary Bonsai 27B MLX 2-bit | 27B | no disponible | no disponible | MLX 2-bit | Citado en la model card como referencia de cuantización extrema; también limita el código agéntico de horizonte largo |
| CodeLlama-7B (evaluado en QuIP#) | 7B | no disponible | no disponible | no disponible | Citado como ejemplo de degradación en McEval-Java (25 % → 8 %) |

## Limitaciones y advertencias

- Degradación media del 3,6 % en 18 benchmarks, con caídas notables en SciCode (−10,0 %), GraphWalks (−8,9 %) e IFBench (−8,8 %).
- Colapso en tareas agénticas de horizonte largo: DeepSWE cae de 21,2 % (BF16) a 6,2 % (CQ); además, existe una discrepancia no resuelta en el denominador (7/113 frente a 7/110) y son ejecuciones únicas por configuración, sin repetición.
- El resultado de SWE-bench Verified superior al BF16 (+3,6 %) corresponde a una única evaluación con mini-swe-agent y sin red; no debe interpretarse como mejora general en código.
- GSM8K con extracción estricta muestra una puntuación BF16 anómalamente baja (52,67) atribuida a formato de respuesta, lo que dificulta la comparación directa.
- Riesgo de alucinación no cuantificado en la información disponible; aplicable a cualquier modelo generativo de este tamaño.
- Sesgos conocidos: no documentados en la model card; los datasets de preentrenamiento y postentrenamiento de NVIDIA no detallan composición ni filtros.
- Idiomas limitados a en, es, fr, de, it, ja; no se reporta cobertura de otras lenguas.
- Licencia OpenMDW 1.1: es necesario revisar sus términos para uso comercial, ya que la model card la marca como `license: other`.
- Dependencia de MLX: no hay pesos GGUF ni soporte para ecosistemas CUDA/vLLM, lo que restringe el despliegue a hardware Apple.
- El contexto máximo real para esta cuantización solo está verificado hasta 262K tokens; el millón de tokens del set de NVIDIA no está confirmado.
- La model card incluye un GIF animado cuyos tiempos no constituyen una medición de rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cactus-Compute/nemotron-3.5-120b-cq1.4bit
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Paper de Cactus Quants: https://openreview.net/pdf?id=Q6FcVpI1SO
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Dataset de postentrenamiento: https://huggingface.co/datasets/nvidia/nemotron-post-training-v3
- Datasets de preentrenamiento: https://huggingface.co/datasets/nvidia/nemotron-pre-training-datasets
- Referencia ACBench (degradación agéntica con AWQ/GPTQ): https://arxiv.org/html/2505.19433v2
- Referencia QuIP# (degradación en McEval-Java): https://arxiv.org/html/2607.14181v1
- Modelo comparativo PrismML Bonsai 27B MLX 2-bit: https://huggingface.co/prism-ml/Ternary-Bonsai-27B-mlx-2bit#limitations
