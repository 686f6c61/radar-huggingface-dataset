# MyEcoria/Olala-v1.0-mini-7A1B-VL-3a

## Resumen

Olala-VL es un modelo visión-lenguaje (VLM) generalista de tipo RGB desarrollado por MyEcoria como fine-tune del modelo base OVHaiLLM/Olala-v1.0-mini-7A1B. Se construye sobre una arquitectura híbrida Mamba-3 MIMO con atención diferencial NoPE y un MoE de 256 expertos enrutados (7.043 millones de parámetros totales), a la que se añade un codificador visual SigLIP2-base-patch16-256 y una ruta `VisionFFN` dedicada. El objetivo declarado es ofrecer inferencia de baja latencia en tareas imagen-texto sin degradar el razonamiento textual del modelo base.

La innovación principal es su MoE consciente de modalidad: los 256 expertos de texto permanecen completamente congelados durante el entrenamiento visual, de modo que la capacidad de razonamiento textual se preserva (el autor reporta 95,0 % en Text QA frente al 85,0 % del base tras RL). El presupuesto espacial es muy compacto (256×256 píxeles, 64 tokens por imagen por defecto, configurable a 36 o 16), lo que reduce el coste de prefill y permite streaming de vídeo con caché deslizante.

El modelo es relevante por su enfoque de eficiencia: solo ~1,10B de parámetros activos en prefill visual y ~1,00B en decodificación de texto, con latencias medidas de 141,7 ms de TTFT y 75,3 ms/token en una A100-40GB. No obstante, sus resultados en benchmarks visuales estándar son notablemente inferiores a los de modelos de referencia de tamaño similar, lo que sugiere que su utilidad está acotada a escenarios de baja latencia y tareas visuales sencillas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-3 MIMO + NoPE Differential-TPA Attention + MoE de 256 expertos (texto) + SigLIP2-base-patch16-256 (visión) + `VisionFFN` |
| Parametros totales | 7.043.006.400 (7,04B) |
| Parametros activos | ~1,10B en prefill visual; ~1,00B en decodificación de texto (6/256 expertos enrutados) |
| Longitud de contexto | no disponible (caché deslizante con ventana acotada; sin cifra explícita de tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor reporta inferencia en BF16 eager) |
| Idiomas soportados | en, zh, fr, de, it, ja, ru, es, pl, pt, nl, el, tr, cs, uk, hu, ro, ko, ar, fi, sv, no, da, bg, sk, hr, lt, sl, bs, he, et, ca, lv, ka, sr, sq, is (38 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, `custom_code`) |

## Arquitectura y entrenamiento

El backbone textual es un híbrido Mamba-3 MIMO con atención diferencial NoPE (sin positional encoding explícito) y un MoE de 256 expertos enrutados; el autor indica que los expertos de texto suman 10,98 GB y permanecen congelados en todas las etapas visuales. La torre visual es SigLIP2-base-patch16-256 (92,9M de parámetros) con un proyector SwiGLU y un `2×2` pixel-unshuffle que reduce la imagen de 256×256 a 64 tokens por defecto (72 con `image_newline`), configurable a 36 o 16. La ruta `VisionFFN` (36 capas densas ReLU², 169,9M de parámetros) procesa los tokens visuales sin tocar los expertos de texto, inicializada 1:1 desde los `shared_experts` del modelo RL base.

El entrenamiento consta de dos etapas. La etapa 1 (alineación) usa `liuhaotian/LLaVA-Pretrain` (236.802 imágenes, paso 925), entrena 176,95M de parámetros (proyector + `VisionFFN`) con batch global de 64 empaquetado y alcanza `val_loss` 2,2418. La etapa 2 (SFT generalista) combina 80.000 fotos reales de `HuggingFaceM4/FineVision` con 19.146 muestras de autodestilación RL de texto/herramientas/thinking (72.574 muestras, paso 400), entrena 231,05M de parámetros (3,27 %: proyector + `VisionFFN` + últimas 4/12 capas de SigLIP2 + LoRA r=32, α=64 fusionado) y alcanza `val_loss` 1,2852. El cómputo se realizó en 1.024 GPU NVIDIA GH200 (JUPITER), H100 (Jean Zay) y MeluXina, con ~1,16 GWh y 30–50 t de CO₂e estimadas.

Entre las innovaciones destacadas: `SlidingWindowOlalaCache` que fija el KV del system prompt y mantiene una ventana deslizante de fotogramas recientes (+3,69 MB de deriva de VRAM en 62,2 s / 150 fotogramas, pico de 13,3 GB), y un fast-path de decodificación `torch.bmm` con 6 expertos bit-exacto (`max_abs_diff = 0.0`) que reduce la latencia entre 1,73× y 2,06× en BF16 eager.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, con modo thinking bajo demanda (`reasoning_effort="low"`/`"medium"` activa canales `<analysis>` + `<final>`; por defecto desactivado para baja latencia).
- Comprensión de imágenes RGB (pipeline `image-text-to-text`), con presupuesto espacial configurable (64/36/16 tokens por imagen).
- Soporte de tool calling / function calling (heredado del modelo base y reforzado con datos RL de herramientas).
- Razonamiento multi-paso y uso en agentes (etiquetas `reasoning`, `tool-calling`).
- Capacidades multilingües en 38 idiomas, incluido español, catalán y euskera.
- Streaming de vídeo/fotogramas continuos mediante caché deslizante con ventana acotada.
- No se declaran capacidades de audio ni de vídeo con audio.

## Casos de uso

- Asistencia visual de baja latencia en tiempo real: con 141,7 ms de TTFT y 75,3 ms/token en A100, el modelo es adecuado para aplicaciones interactivas donde la respuesta rápida prima sobre la precisión visual fina (por ejemplo, descripción rápida de escenas o clasificación visual simple).
- Streaming de vídeo continuo: la `SlidingWindowOlalaCache` mantiene una ventana deslizante de fotogramas con deriva de VRAM mínima (+3,69 MB en 150 fotogramas), lo que permite monitorización de vídeo en directo sin crecimiento de memoria.
- Agentes conversacionales con herramientas: el soporte de tool calling y el modo thinking bajo demanda permiten integrar el modelo en pipelines de agentes donde se alternan llamadas a funciones con razonamiento breve.
- Despliegue en hardware limitado: con ~1,00–1,10B de parámetros activos y 13,3 GB de VRAM pico en BF16, cabe en GPU de consumo alta (por ejemplo, RTX 4090 de 24 GB) para prototipos y demos.
- Atención al cliente multimodal: gestión de conversaciones multi-turno con imágenes adjuntas (capturas, fotos de producto) en 38 idiomas, aprovechando el contexto conversacional del backbone.
- Procesamiento por lotes de imágenes con presupuesto reducido: el modo de 16 tokens por imagen minimiza el coste de prefill en tareas de clasificación o filtrado visual a gran escala.
- Investigación en arquitecturas híbridas Mamba/MoE: el modelo sirve como referencia reproducible para estudiar MoE consciente de modalidad y congelación de expertos.

## Benchmarks y rendimiento

Resultados zero-shot reportados por el autor (256×256, 64 tokens espaciales, sin thinking), comparados con modelos de referencia de la suite LFM3-VL-2B:

| Benchmark | Olala-VL | LFM3-VL-2B (no-think) | LFM3-VL-2B (think) | LFM2.5-VL-3B | MiniCPM-V 4.7 1B | Qwen3.5-2B | InternVL3.5-4B | Gemma 4 E2B |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Parámetros activos (con visión) | ~1,10B (7,04B total) | ~1,9B | ~1,9B | ~3,0B | ~1,55B | ~2,2B | ~4,0B | ~2,3B (5,1B total) |
| Tokens visión / imagen | 64 (36/16 din.) | 256–1.024+ | 256–1.024+ | 256–2.560+ | 64–576+ | 256–1.280+ | 256–3.328 | 280 |
| POPE (F1) | 71,3 | 86,2 | 88,7 | 88,9 | 89,2 | 88,1 | 88,3 | 84,2 |
| MMBench (dev EN) | 66,0 | 76,5 | 86,1 | 81,0 | 83,4 | 80,0 | 81,1 | 70,9 |
| MME (Yes/No Acc) | 62,8 | 76,7 | 86,9 | 74,3 | 82,7 | 83,9 | 82,2 | 79,6 |
| CV-Bench (Spatial 2D/3D) | 48,0 | 85,4 | 88,8 | 86,3 | 82,6 | 84,3 | 80,4 | 77,6 |
| RealWorldQA | 35,0 | 73,1 | 79,3 | 72,9 | 68,2 | 75,7 | 67,8 | 61,2 |
| MathVista (mini) | 24,0 | 68,5 | 84,2 | 68,9 | 71,2 | 75,5 | 72,7 | 62,7 |
| MMStar | 23,2 | 62,2 | 74,4 | 63,3 | 68,1 | 71,5 | 65,3 | 61,2 |
| OCRBench v1 | 17,3 | 82,2 | 86,3 | 84,7 | 82,1 | 83,6 | 83,5 | 71,8 |
| ChartQA (test) | 13,3 | 81,4 | 92,7 | 80,6 | 88,8 | 85,2 | 86,0 | 82,3 |
| DocVQA (val, ANLS) | 9,9 | 94,9 | 96,7 | 91,8 | 91,8 | 95,6 | 90,9 | 90,4 |

Latencia medida en 1× A100-SXM4-40GB (BF16 eager + fast-path `torch.bmm`): 141,7 ms TTFT / 75,3 ms/token (13,3 tok/s) a 36 tokens espaciales; 143,0 ms TTFT / 90,2 ms/token (11,1 tok/s) a 64 tokens espaciales; pico de 13,3 GB de VRAM.

## Requisitos de hardware

- VRAM estimada: 13,3 GB pico en BF16 eager con 64 tokens espaciales (dato medido por el autor en A100-40GB). En cuantización de 8 o 4 bits no se han publicado cifras; el repo ocupa 14,1 GB en safetensors.
- GPU recomendadas: A100-SXM4-40GB (medición oficial), H100 y GH200 (usadas en entrenamiento). Para inferencia de producción se recomienda A100/H100 por el soporte de BF16 eager y el fast-path `torch.bmm`.
- GPU de consumo: con 13,3 GB pico en BF16 cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB); en GPU de 16 GB el margen es ajustado y no está verificado por el autor.
- Despliegue: librería `transformers` con `custom_code` (requiere `trust_remote_code`); el autor no documenta soporte para vLLM, llama.cpp, Ollama ni TGI. No hay pesos GGUF publicados.
- Latencia y throughput: 141,7 ms TTFT / 75,3 ms/token (13,3 tok/s) a 36 tokens; 143,0 ms TTFT / 90,2 ms/token (11,1 tok/s) a 64 tokens, en A100-40GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Tokens visión/imagen | MMBench | DocVQA | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Olala-VL (este) | 7,04B total / ~1,10B activos | 64 (36/16 din.) | 66,0 | 9,9 | Apache 2.0 | Hugging Face (MyEcoria) |
| LFM3-VL-2B | ~1,9B activos | 256–1.024+ | 76,5 / 86,1 (think) | 94,9 / 96,7 (think) | no disponible en la información | Hugging Face (LiquidAI) |
| MiniCPM-V 4.7 1B | ~1,55B | 64–576+ | 83,4 | 91,8 | no disponible en la información | Hugging Face |
| Qwen3.5-2B | ~2,2B | 256–1.280+ | 80,0 | 95,6 | no disponible en la información | Hugging Face |
| InternVL3.5-4B | ~4,0B | 256–3.328 | 81,1 | 90,9 | no disponible en la información | Hugging Face |

La comparativa se limita a los datos aportados por el autor; no se dispone de información independiente sobre licencias ni sobre el contexto de los modelos alternativos.

## Limitaciones y advertencias

- Rendimiento visual muy inferior al de la competencia: DocVQA 9,9, ChartQA 13,3, OCRBench 17,3 y MMStar 23,2, frente a valores de 80–96 en modelos de tamaño similar. No es adecuado para OCR, documentos, gráficos ni razonamiento visual complejo.
- El presupuesto espacial de 64 tokens (o menos) limita la resolución efectiva; detalles finos, texto pequeño y objetos pequeños se pierden.
- El autor no publica la longitud de contexto en tokens; la caché es deslizante y acotada, por lo que el historial conversacional completo no se retiene indefinidamente.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones de fidelidad ni de sesgos.
- Los benchmarks son autoinformados por el autor y no se han verificado de forma independiente; las comparaciones con otros modelos provienen de la suite citada, no de una evaluación homogénea.
- Licencia Apache 2.0 permite uso comercial, pero el modelo requiere `trust_remote_code` (código personalizado no auditado) y no hay garantías de soporte ni mantenimiento.
- El modelo base es un fine-tune de OVHaiLLM/Olala-v1.0-mini-7A1B; las limitaciones del base (sesgos, idiomas de menor recursos) se heredan.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción.
- El modo thinking está desactivado por defecto; activarlo incrementa la latencia y el consumo de tokens sin garantía de mejora en tareas visuales.

## Enlaces

- Hugging Face: https://huggingface.co/MyEcoria/Olala-v1.0-mini-7A1B-VL-3a
- Modelo base: https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B
- Codificador visual: https://huggingface.co/google/siglip2-base-patch16-256
- Dataset de alineación: https://huggingface.co/datasets/liuhaotian/LLaVA-Pretrain
- Dataset SFT: https://huggingface.co/datasets/HuggingFaceM4/FineVision
- Modelo de referencia de benchmarks: https://huggingface.co/LiquidAI/LFM3-VL-2B
