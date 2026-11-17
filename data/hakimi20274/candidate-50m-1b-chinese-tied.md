# hakimi20274/candidate-50m-1b-chinese-tied

## Resumen

Candidate-50M es un modelo de lenguaje causal de tipo transformer, desarrollado por el usuario hakimi20274, diseñado como base ligera para generación de texto en chino. Con 50,40 millones de parámetros y una arquitectura experimental que combina técnicas como Bigram Hash, Value Residual Learning (VRL), QK-RMSNorm, RoPE parcial, GQA 2:1 y optimizador Muon, el modelo se ha preentrenado sobre 1.000 millones de tokens de texto chino (60% educativo/académico y 40% novela web). Su ventana de contexto es de 1.024 tokens y emplea embeddings atados entre entrada y salida.

El interés del modelo reside en su carácter de experimento de arquitectura: integra un MLP de preprocesado en la capa 0, un hash de bigramas de doble tabla sin colisiones, conexiones residuales de doble flujo (mHC), saltos entre capas (Longskip) y una cabeza auxiliar de predicción de baja rank (+2 tokens). Todo ello con un presupuesto de parámetros estrictamente acotado a ~50,4M, lo que lo sitúa como banco de pruebas para comparativas de preentrenamiento a pequeña escala.

En el momento de redactar esta ficha, el entrenamiento está en curso (Step 0/81380, 0,00M tokens), por lo que no existen resultados de evaluación ni métricas de pérdida o perplejidad publicadas. El modelo se distribuye bajo licencia Apache 2.0 con pesos en formato PyTorch (.pth), no en safetensors ni GGUF, y únicamente soporta chino.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal con Bigram Hash, Smear, VRL, QK-RMSNorm, RoPE32, XSA, mHC, Longskip, MLP ReLU², Aux-Head y Muon |
| Parámetros totales | 50.397.804 (50,40M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantización | No disponible (solo pesos FP32 y BF16) |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch .pth (FP32 y BF16) |
| Capas | 13 (1 capa blk0 MLP + 12 bloques Attention+MLP) |
| Dimensión oculta | 512 |
| Dimensión MLP | 2.112 (ReLU²) |
| Cabezas de atención | 4 query / 2 KV, head dim 128, RoPE dims 32 |
| Vocabulario | 16.384 (BPE ByteLevel, chino) |
| Embeddings atados | Sí (embed = LM Head transpuesta) |
| Hardware de entrenamiento | 1× NVIDIA L4 (23 GB, sm_89) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer causal de 13 capas con dimensión oculta 512 y MLP intermedio de 2.112 con activación ReLU². La primera capa es un MLP de preprocesado (`blk0`) que incorpora Token Smear y un hash de bigramas de doble tabla (2 cabezas × 16.384 buckets × 128 dimensiones) sin colisiones. Los 12 bloques restantes combinan atención con GQA 2:1 (4 cabezas query, 2 KV, dimensión 128), Value Residual Learning (VRL), QK-RMSNorm con qgain, RoPE parcial (32 dimensiones rotadas) y proyección ortogonal de valores XSA. Se añaden residuales de doble flujo (mHC), conexiones de salto entre capas (Longskip) y una cabeza auxiliar de baja rank (128) que predice los +2 tokens siguientes como pérdida auxiliar.

El preentrenamiento se realizó sobre 1.000 millones de tokens en chino: 600M de texto educativo/académico procedente de `openbmb/Ultra-FineWeb` (convertido a simplificado con OpenCC t2s) y 400M de novela web de `wdndev/webnovel-chinese` (8.675 libros, muestreo no contiguo entre capítulos). El conjunto de validación sin fuga es de 2M tokens con la misma proporción 60/40. El entrenamiento usa batch global de 12 con secuencia 1.024 (12.288 tokens/paso, 81.380 pasos), optimizador 3D Shape-Batched Muon (5 pasos de ortogonalización Newton-Schulz en BF16 con RMS Clip 0.2) para pesos 2D y Adam para embeddings, tabla de bigramas y compuertas escalares, con EMA de 0.997. El scheduler de learning rate hace warmup de 1.500 pasos, meseta constante y annealing de raíz cuadrada en el último 40% hasta el 10%. El throughput medido es de 59,3 ktokens/s con latencia de 207,3 ms por paso en una L4.

## Capacidades

- Generación de texto causal en chino: continuación de prompts, redacción de párrafos y generación libre condicionada.
- Modelado de lenguaje autorregresivo con ventana de 1.024 tokens.
- Predicción auxiliar de tokens a +2 posiciones mediante cabeza de baja rank (capacidad interna de entrenamiento, no expuesta como API).
- Procesamiento de texto educativo y narrativo, dado el sesgo del corpus de entrenamiento.
- Tokenización BPE ByteLevel específica para chino con vocabulario de 16.384 entradas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Multilingüismo limitado: solo chino.

## Casos de uso

- Investigación en arquitecturas de preentrenamiento a pequeña escala: el modelo sirve como banco de pruebas reproducible para comparar variantes (Muon vs AdamW, embeddings atados vs no atados, Bigram Hash, VRL, Longskip) con un presupuesto fijo de ~50M parámetros y 1B tokens.
- Generación de texto educativo en chino: continuación de lecciones, resúmenes o explicaciones académicas, aprovechando que el 60% del corpus es material educativo y académico.
- Experimentos de destilación y ablación: al ser un modelo pequeño y entrenado en una sola L4, es adecuado como alumno en pipelines de destilación desde modelos mayores o como baseline en estudios de scaling laws.
- Generación de narrativa breve en chino: gracias al 40% de novela web en el corpus, puede producir continuaciones de ficción de corta longitud dentro de la ventana de 1.024 tokens.
- Pruebas de infraestructura de inferencia: su reducido tamaño (0,6 GB de repo, pesos FP32/BF16) permite validar scripts de carga, tokenización y generación en CPU o GPU modesta antes de escalar a modelos mayores.
- Docencia y demostraciones de tokenización BPE en chino: el tokenizador de 16K y los scripts de inferencia autocontenidos (solo `torch`, `numpy`, `tokenizers`) facilitan talleres prácticos sobre preentrenamiento y decodificación.
- Evaluación de técnicas de optimización (Muon, EMA, schedule de LR): el repositorio incluye el código de entrenamiento completo en JAX, útil para reproducir y comparar estrategias de optimización en un solo dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el entrenamiento está en curso (Step 0/81380, 0,00M tokens) y que las métricas de pérdida y perplejidad en las etapas de 120M, 800M y 1000M tokens figuran como "Training...". Los únicos datos numéricos publicados son de eficiencia de entrenamiento:

| Métrica | Valor |
|---|---|
| Throughput (L4, batch 12, seq 1024) | 59,3 ktokens/s |
| Latencia por paso | 207,3 ms |
| Pasos totales planificados | 81.380 |
| Tokens por paso | 12.288 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (50,4M parámetros × 4 bytes ≈ 202 MB de pesos, más activaciones y caché KV para 1.024 tokens); en BF16 ≈ 101 MB de pesos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el entrenamiento se realizó en una NVIDIA L4 (23 GB), pero para inferencia basta una GTX 1650, RTX 3050, RTX 4060 o superior.
- Cabe en GPU consumer: sí, holgadamente, en cualquier GPU con al menos 2 GB de VRAM; también funciona en CPU.
- Opciones de despliegue: el repositorio solo proporciona un script propio (`infer.py`) basado en PyTorch puro. No hay soporte nativo para vLLM, llama.cpp, Ollama ni TGI, ya que los pesos no están en safetensors ni GGUF.
- Latencia y throughput de inferencia: no disponibles; solo se conoce el throughput de entrenamiento (59,3 ktokens/s en L4).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Estado |
|---|---|---|---|---|---|---|
| Candidate-50M (este) | 50,40M | 1.024 | zh | Apache 2.0 | .pth (FP32/BF16) | Entrenamiento en curso |
| Qwen2.5-0.5B | ~494M | 32.768 | multilingüe | Apache 2.0 | safetensors, GGUF | Publicado y evaluado |
| SmolLM2-135M | ~135M | 8.192 | inglés principalmente | Apache 2.0 | safetensors, GGUF | Publicado y evaluado |
| TinyLlama-1.1B | ~1,1B | 2.048 | inglés/chino | Apache 2.0 | safetensors, GGUF | Publicado y evaluado |

La comparación es asimétrica: Candidate-50M es entre 2,7 y 22 veces menor que los modelos de referencia, está especializado solo en chino y carece de evaluaciones publicadas, mientras que las alternativas cuentan con benchmarks estándar y soporte en frameworks de inferencia ampliamente adoptados.

## Limitaciones y advertencias

- Entrenamiento incompleto: en la fecha de la model card el modelo está en el paso 0 de 81.380, por lo que los pesos publicados no representan un modelo entrenado y no son utilizables para generación coherente.
- Sin métricas de evaluación: no hay datos de pérdida, perplejidad ni benchmarks, lo que impide valorar su calidad real.
- Sesgos de corpus: el 40% de los datos son novelas web, lo que puede sesgar el estilo hacia narrativa de ficción y afectar a la neutralidad en dominios técnicos o formales.
- Riesgo de alucinación: al ser un modelo base de 50M parámetros sin ajuste por RLHF/DPO, la generación puede ser incoherente y propensa a inventar contenido.
- Contexto muy limitado: 1.024 tokens restringen casos de uso que requieran documentos largos o conversaciones multi-turno extensas.
- Solo chino: no soporta otros idiomas, ni siquiera inglés de forma fiable.
- Formato de pesos no estándar: los .pth requieren cargar el código del repositorio; no hay conversión a safetensors ni GGUF, lo que complica su uso en ecosistemas como Hugging Face Transformers, vLLM o llama.cpp.
- Licencia Apache 2.0: permite uso comercial, pero al no existir un modelo funcional ni evaluado, no se recomienda su uso en producción.
- Autor único y sin revisión por pares: el modelo no cuenta con validación externa ni publicación técnica asociada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hakimi20274/candidate-50m-1b-chinese-tied
- Dataset asociado: https://huggingface.co/datasets/hakimi20274/rwkv7-zh-1b-dataset-tokenizer-16k
- Corpus educativo de origen: https://huggingface.co/datasets/openbmb/Ultra-FineWeb
- Corpus de novela web de origen: https://huggingface.co/datasets/wdndev/webnovel-chinese
