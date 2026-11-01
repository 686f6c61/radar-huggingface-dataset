# masahiroid/DeepSeek-Coder-V2-Lite-Instruct-Pyrite-2bit-MLX

## Resumen

DeepSeek-Coder-V2-Lite-Instruct-Pyrite-2bit-MLX es una cuantización extrema a 2 bits, desarrollada por masahiroid (Masahiro Nakatsugawa) como parte del "Project Pyrite", del modelo DeepSeek-Coder-V2-Lite-Instruct de DeepSeek-AI. El modelo base es un MoE de código de 15,7B parámetros totales (2,36B activos) con Multi-Head Latent Attention (MLA), y esta versión lo comprime hasta ocupar aproximadamente 4,88 GiB, haciéndolo ejecutable en cualquier Mac con Apple Silicon de 16 GB de memoria unificada.

El problema que resuelve es la brecha entre el tamaño en BF16 del modelo original (~31,4 GB) y la memoria disponible en hardware de consumo: mediante una cuantización consciente de la sensibilidad (sensitivity-aware), con presupuesto de bytes idéntico al de una cuantización uniforme a 2 bits, mejora la perplejidad mult dominio de 11,1105 a 10,9707 y el acuerdo top-1 de tokens del 68,82 % al 70,00 %, sin coste adicional de memoria.

Es relevante porque demuestra que la cuantización a 2 bits con asignación inteligente de bits (capas `down_proj` sensibles a 3 bits, routers y normalizaciones sin cuantizar, `lm_head` a 4 bits) puede mantener calidad razonable en modelos MoE de código usando únicamente kernels nativos de MLX, sin kernels personalizados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (DeepSeek-Coder-V2: 27 capas, 1 MLP densa + 26 capas MoE con 64 expertos enrutados + 2 expertos compartidos, MLA) |
| Parámetros totales | 15.876.353.536 (~15,7B) |
| Parámetros activos | 2,36B (MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 128k; la ficha menciona contexto 32k+ de caché KV en Macs de 16 GB) |
| Tipos de cuantización | 2 bits (afín, group_size 64/128), con capas `down_proj` a 3 bits (capas 14-26), `lm_head` a 4 bits (g64), routers y normalizaciones sin cuantizar |
| Idiomas soportados | inglés, chino, japonés, código |
| Licencia | deepseek-license (other) |
| Formato de pesos | safetensors (MLX), 5,2 GB en el repositorio |

## Arquitectura y entrenamiento

El modelo base, DeepSeek-Coder-V2-Lite-Instruct, es un transformer MoE con 27 capas: una capa MLP densa y 26 capas MoE con 64 expertos enrutados por token más 2 expertos compartidos, activando solo 2,36B de los 15,7B parámetros por token. Emplea Multi-Head Latent Attention (MLA), que comprime la caché KV y reduce el coste de contexto largo. Fue entrenado por DeepSeek-AI sobre corpus de código y texto multilingüe (inglés, chino, japonés), con afinado instruccional; los detalles de tokens y RLHF/DPO no están disponibles en la información proporcionada.

La innovación de esta versión es el pipeline de cuantización "Pyrite": una cuantización afín a 2 bits guiada por sensibilidad de activación (activation-weighted) sobre MLX, usando exclusivamente `mlx.nn.QuantizedLinear` nativo. Con el mismo presupuesto de bytes que una cuantización uniforme a 2 bits (5.241.265.152 bytes), actualiza las capas `down_proj` de alta sensibilidad (capas 14 a 26) de 2 a 3 bits, financiando el cambio ampliando 52 proyecciones MoE `gate/up` de group_size 64 a 128. Las matrices de enrutamiento (`gate.weight`) y las capas de normalización se conservan en precisión original para estabilidad del enrutamiento de expertos.

## Capacidades

- Generación de texto conversacional con formato de chat (chat template aplicable vía `tokenizer.apply_chat_template`)
- Generación y finalización de código en múltiples lenguajes (Python, Rust, etc.), heredada del modelo base DeepSeek-Coder-V2
- Razonamiento y matemáticas según las capacidades del modelo base (no hay datos específicos de benchmarks de razonamiento en la información disponible)
- Soporte multilingüe en inglés, chino y japonés
- Ejecución eficiente en Apple Silicon gracias a MLX y a la arquitectura de memoria unificada
- Tool calling / function calling: no disponible en la información proporcionada
- Capacidades de agentes y multi-step reasoning: no disponible en la información proporcionada
- Vision, audio u otras modalidades: no disponibles; es un modelo de solo texto

## Casos de uso

- Asistente de código local en Mac: ejecuta un modelo de 15,7B MoE en un MacBook con 16 GB de RAM, dejando más de 10 GiB libres para caché KV y otras aplicaciones, ideal para autocompletado y refactorización sin nube.
- Generación de funciones y utilidades: peticiones como "escribe una función Python de alto rendimiento con MLX para similitud coseno" se resuelven directamente desde la CLI con `mlx_lm.generate`.
- Porteo y prototipado en lenguajes concretos: generación de implementaciones completas (por ejemplo, un ring buffer lock-free en Rust) integrada en flujos de trabajo de desarrollo.
- Asistencia a programadores que trabajan en chino o japonés: soporte de instrucciones y generación en esos idiomas junto al inglés, útil para equipos técnicos en Asia oriental.
- Investigación en cuantización extrema: sirve como caso de estudio reproducible (con DOI y informe técnico) de cuantización a 2 bits con presupuesto de bytes fijo y sensibilidad guiada.
- Despliegue en entornos sin GPU dedicada: al no requerir kernels personalizados, funciona con la pila MLX estándar sobre Metal en Apple Silicon, sin dependencias CUDA.
- Chatbot conversacional ligero: con 2,36B de parámetros activos por token, la inferencia es ágil en CPU/GPU integrada de Apple.

## Benchmarks y rendimiento

Resultados publicados por el autor del modelo (evaluación en conjuntos held-out mult dominio: código, inglés, japonés):

| Configuración | Tamaño (bytes) | RAM (GiB) | PPL mult dominio | PPL código | Acuerdo top-1 |
|---|---|---|---|---|---|
| BF16 (referencia teacher) | ~31.400.000.000 | ~31,4 | 7,0371 | 1,5854 | 100,0 % |
| Baseline uniforme 2-bit (g64) | 5.241.265.152 | 4,8813 | 11,1105 | 1,8262 | 68,82 % |
| Pyrite 2-bit (pyrite_down13) | 5.241.265.152 | 4,8813 | 10,9707 | 1,9046 | 70,00 % |

Nota: se trata de métricas de perplejidad y acuerdo de tokens sobre el modelo cuantizado, no de benchmarks estándar (MMLU, HumanEval, GSM8K), cuyos resultados no están disponibles en la información proporcionada.

## Requisitos de hardware

- VRAM/memoria necesaria: aproximadamente 4,88 GiB para los pesos; se recomienda un Mac con al menos 16 GB de memoria unificada, quedando más de 10 GiB libres para caché KV y sistema.
- Hardware recomendado: cualquier Mac con Apple Silicon de 16 GB (M1, M2, M3 o M4). No se requieren GPU dedicadas tipo A100, H100 o RTX 4090.
- Consumer GPU NVIDIA: no aplicable directamente; esta versión está en formato MLX para Apple Silicon. Existe una variante GGUF del mismo autor para llama.cpp/Ollama/LM Studio que sí funciona en GPUs NVIDIA de consumo.
- Opciones de despliegue: MLX / mlx-lm (CLI `mlx_lm.generate` o API Python `from mlx_lm import load, generate`). Alternativas vía la variante GGUF: llama.cpp, Ollama, LM Studio.
- Latencia y throughput: no disponibles explícitamente; con solo 2,36B parámetros activos por token, la inferencia es adecuada para hardware integrado de Apple Silicon, aunque no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Cuantización | Licencia |
|---|---|---|---|---|---|
| DeepSeek-Coder-V2-Lite-Instruct-Pyrite-2bit-MLX | 15,7B | 2,36B | no disponible (base: 128k) | 2-bit mixta (MLX) | deepseek-license |
| DeepSeek-Coder-V2-Lite-Instruct (base, BF16) | 15,7B | 2,36B | 128k | BF16 (~31,4 GB) | deepseek-license |
| DeepSeek-Coder-V2-Lite-Instruct-Pyrite-2bit-GGUF (mismo autor) | 15,7B | 2,36B | no disponible | 2-bit (GGUF) | deepseek-license |
| Qwen2.5-Coder-7B-Instruct (referencia de categoría) | 7B | 7B (denso) | 128k | hasta 2-4 bits (GGUF/MLX) | Apache 2.0 |

Frente al modelo base BF16, esta versión ocupa ~6,4 veces menos memoria a costa de una degradación de perplejidad (7,04 → 10,97). Frente a alternativas densas como Qwen2.5-Coder-7B, ofrece más parámetros totales con menor coste computacional por token gracias al MoE, aunque con licencia más restrictiva.

## Limitaciones y advertencias

- La cuantización a 2 bits implica una pérdida de calidad medible respecto al modelo BF16: la perplejidad mult dominio pasa de 7,0371 a 10,9707, y el acuerdo top-1 con el teacher es del 70,00 %; puede haber errores de código o razonamiento que el modelo original no cometería.
- La perplejidad de código de Pyrite (1,9046) es ligeramente peor que la del baseline uniforme 2-bit (1,8262), aunque mejora la métrica global y el acuerdo top-1.
- Solo se han publicado métricas de perplejidad y acuerdo de tokens; no hay evaluaciones en benchmarks estándar (HumanEval, MBPP, etc.) de esta cuantización concreta.
- Riesgo de alucinación inherente a los LLM, posiblemente agravado por la cuantización extrema: verificar siempre el código generado.
- Idiomas limitados a inglés, chino y japonés; otros idiomas no están soportados oficialmente.
- Licencia deepseek-license: revisar sus términos antes de uso comercial; es más restrictiva que licencias tipo Apache 2.0.
- Formato MLX: solo ejecutable de forma nativa en Apple Silicon; para otras plataformas usar la variante GGUF del mismo autor.
- Dependencia de `custom_code`/arquitectura deepseek_v2: comprobar la compatibilidad de la versión de mlx-lm instalada.
- Longitud de contexto efectiva limitada en hardware de 16 GB por la memoria disponible para la caché KV.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/masahiroid/DeepSeek-Coder-V2-Lite-Instruct-Pyrite-2bit-MLX
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct
- Variante GGUF (llama.cpp/Ollama/LM Studio): https://huggingface.co/masahiroid/DeepSeek-Coder-V2-Lite-Instruct-Pyrite-2bit-GGUF
- Informe técnico (PDF en el repositorio): https://huggingface.co/masahiroid/DeepSeek-Coder-V2-Lite-Instruct-Pyrite-2bit-MLX/blob/main/pyrite_en.pdf
- DOI del informe técnico: https://doi.org/10.5281/zenodo.23786705
- ORCID del autor: https://orcid.org/0009-0000-3224-0103
- Model card en japonés: https://huggingface.co/masahiroid/DeepSeek-Coder-V2-Lite-Instruct-Pyrite-2bit-MLX/blob/main/README_ja.md
