# Adeely93/wsp_sft_vlguard_qwen3vl-2b_lr5e-5_epoch2

## Resumen

`wsp_sft_vlguard_qwen3vl-2b_lr5e-5_epoch2` es un ajuste fino supervisado (SFT) del modelo multimodal Qwen/Qwen3-VL-2B-Instruct, publicado por el usuario Adeely93 como parte de los experimentos WSP (WSP-MLLM-Safety) sobre alineamiento de seguridad en modelos visión-lenguaje. El modelo parte de la arquitectura Qwen3-VL de 2.127.532.032 parámetros y se ha entrenado sobre el conjunto de datos VLGuard, orientado a reducir respuestas inseguras ante entradas visuales y textuales.

El ajuste se realizó con LoRA (rank 8, alpha 16, dropout 0.05, target `all`, con torre de visión y proyector multimodal congelados) durante 2 de las 3 épocas de un ciclo coseno con learning rate 5e-5, y los adaptadores se fusionaron en los pesos en bf16. El resultado es un checkpoint intermedio (época 2) pensado como baseline de seguridad, no como modelo de propósito general.

Su relevancia es metodológica: sirve como referencia reproducible para evaluar técnicas de seguridad multimodal (FigStep, MM-SafetyBench, JB-Mini, MOSSBench) y para estudiar el equilibrio entre rechazo de contenido dañino y utilidad (ScienceQA, MathVista). El repositorio tiene 4.3 GB, licencia Apache 2.0 y cero descargas en el momento de la consulta, lo que refleja su carácter de artefacto de investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer multimodal visión-lenguaje), ajuste LoRA fusionado |
| Parámetros totales | 2.127.532.032 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usó `cutoff_len: 2048`) |
| Tipos de cuantización | no disponible explícitamente; compatible con cuantización estándar de transformers/vLLM al conservar el formato del modelo base |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3-VL del modelo base Qwen/Qwen3-VL-2B-Instruct (revisión `89644892e4d85e24eaac8bacfd4f463576704203`), un transformer multimodal que procesa pares imagen-texto y genera texto. El ajuste se aplicó exclusivamente sobre el modelo lingüístico: `freeze_vision_tower: true` y `freeze_multi_modal_projector: true`, de modo que la torre visual y el proyector permanecen intactos respecto al base.

El entrenamiento se realizó con LLaMA-Factory (commit `4f2763c`) en modo SFT con LoRA de rango 8, alpha 16, dropout 0.05 y `lora_target: all`, sobre el 100% de los datos SFT de VLGuard (`vlguard_p100`). Se usó learning rate 5e-5, scheduler coseno con warmup 0.1, 3 épocas totales (se publica el checkpoint de la época 2), batch global 8 (batch por dispositivo 1 × acumulación 8), bf16, tf32, `cutoff_len` 2048, `image_max_pixels` 1310720, plantilla `qwen3_vl_nothink` y semilla 42 con determinismo completo. El adaptador (sha256 `afce1b989794660a0bd86024052e4ae69bb7ffa4edd011cbdb27dd612aad4e50`) se fusionó en bf16 con PEFT mediante el script `eval/generate.py` de WSP-MLLM-Safety. El entrenamiento se ejecutó en una NVIDIA A40.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) y por texto puro.
- Razonamiento multimodal básico sobre diagramas, gráficos y figuras científicas (evaluado en ScienceQA y MathVista).
- Modo de plantilla `qwen3_vl_nothink` (sin cadena de pensamiento explícita en el entrenamiento).
- Comportamiento orientado a seguridad: rechazo de peticiones dañinas en contextos visuales y textuales (objetivo del ajuste con VLGuard).
- Conversación multi-turno (tag `conversational`).
- Compatibilidad con endpoints y con vLLM (`LLM(model="Adeely93/...")`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas específicamente para este checkpoint.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Baseline de investigación en seguridad multimodal: usar el modelo como referencia SFT para comparar contra métodos de alineamiento más sofisticados (DPO, RLHF, filtrado de datos) midiendo tasas de inseguridad en FigStep, MM-SafetyBench, JB-Mini y MOSSBench.
- Evaluación de sobre-rechazo (over-refusal): cuantificar cuántas peticiones benignas rechaza el modelo (40% en FigStep-benign) para calibrar el equilibrio seguridad-utilidad en futuros ajustes.
- Filtro de contenido en pipelines de moderación visual: desplegar el modelo como clasificador generativo que inspecciona imágenes y texto y emite rechazos ante contenido dañino, aprovechando su entrenamiento específico en VLGuard.
- Análisis de utilidad retenida tras SFT de seguridad: medir la degradación en ScienceQA y MathVista (68.0 de media) para estudiar el coste de alinear seguridad sobre capacidades científicas.
- Reproducibilidad de experimentos: servir de checkpoint intermedio (época 2 de 3) para estudiar la dinámica de entrenamiento y el efecto del número de épocas en las métricas de seguridad.
- Prototipado de asistentes visuales con requisitos de seguridad: integrar el modelo vía vLLM o transformers en demos de bajo coste (2B parámetros) donde se priorice el rechazo de entradas maliciosas sobre la máxima utilidad.
- Estudio de LoRA en modelos visión-lenguaje: analizar el impacto de ajustar solo el LLM (con torre visual congelada) frente a ajustes completos, usando los adaptadores y la configuración publicados.

## Benchmarks y rendimiento

Resultados publicados en la model card (100 muestras por conjunto, juez gpt-4.1-mini, ±8 puntos; decodificación con temperatura 0.7, top-p 0.8, top-k 20, presence penalty 1.5, máximo 4096 tokens nuevos, semilla 42):

| Benchmark | Métrica | Resultado |
|---|---|---|
| FigStep | % inseguro | 10 |
| MM-SafetyBench | % inseguro | 0 |
| JB-Mini | % inseguro | 1 |
| Utility (ScienceQA + MathVista) | % correcto medio | 68.0 |
| MOSSBench | % rechazado | 93 |
| FigStep-benign | % rechazado (over-refusal) | 40 |

No se han publicado comparaciones numéricas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 4.3 GB solo para pesos (2.127 M parámetros × 2 bytes), más memoria para activaciones y caché KV; en la práctica, entre 6 y 8 GB para contextos moderados.
- En cuantización de 8 bits: alrededor de 2.2 GB de pesos; en 4 bits: alrededor de 1.1 GB, más overhead.
- GPU recomendadas: NVIDIA A40 (usada en el entrenamiento), A100, H100 para despliegue de alta concurrencia; RTX 4090, RTX 3090 y GPUs consumer con 8 GB o más para inferencia en bf16.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y superiores; también en GPUs de 8 GB con cuantización.
- Opciones de despliegue: transformers (`AutoModelForImageTextToText`), vLLM (soportado explícitamente según la model card), y presumiblemente llama.cpp/Ollama si se generan GGUF, aunque no se documenta en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| wsp_sft_vlguard_qwen3vl-2b_lr5e-5_epoch2 | 2.127 M | no disponible | Apache 2.0 | Seguridad multimodal (SFT VLGuard) | Hugging Face, 0 descargas |
| Qwen/Qwen3-VL-2B-Instruct (base) | ~2.1 M | no disponible | Apache 2.0 | Multimodal generalista | Hugging Face |
| Otros checkpoints de Adeely93/wsp_sft_vlguard_baselines | no disponible | no disponible | Apache 2.0 | Variantes del mismo experimento | Hugging Face |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Es un checkpoint intermedio (época 2 de 3), no el modelo final del ciclo de entrenamiento; su comportamiento puede no ser el óptimo del experimento.
- El over-rechazo es elevado: 40% en FigStep-benign, lo que implica que rechaza una fracción importante de peticiones benignas.
- La utilidad retenida es limitada (68.0 de media en ScienceQA y MathVista), con posible degradación respecto al modelo base por el ajuste de seguridad.
- Los benchmarks se calcularon con solo 100 muestras por conjunto y un juez automático (gpt-4.1-mini) con margen de ±8 puntos, por lo que la precisión de las cifras es baja.
- Riesgo de alucinación inherente a modelos de 2B parámetros; no se documentan mitigaciones específicas.
- Sesgos conocidos: no documentados en la información disponible; hereda los del modelo base y los del dataset VLGuard.
- Idiomas soportados no especificados; el comportamiento multilingüe no está garantizado.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo entrenado sobre VLGuard debe revisarse según los términos de dicho dataset (no disponibles en la información proporcionada).
- No apto como sistema de seguridad autónomo sin supervisión humana: las métricas de rechazo no son perfectas (10% inseguro en FigStep, 1% en JB-Mini).
- Repositorio con 0 descargas y 0 likes: no hay validación comunitaria ni reportes de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Adeely93/wsp_sft_vlguard_qwen3vl-2b_lr5e-5_epoch2
- Repositorio de baselines: https://huggingface.co/Adeely93/wsp_sft_vlguard_baselines
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Proyecto WSP-MLLM-Safety (código de entrenamiento y evaluación, commit `4f2763c`): no disponible como URL en la información proporcionada
- Dataset VLGuard: no disponible como URL en la información proporcionada
