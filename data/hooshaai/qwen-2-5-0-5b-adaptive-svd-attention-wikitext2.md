# Hooshaai/qwen-2.5-0.5b-adaptive-svd-attention-wikitext2

## Resumen

`Hooshaai/qwen-2.5-0.5b-adaptive-svd-attention-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se ha sustituido el mecanismo de atención nativo por un operador denominado `adaptive_svd_attention` (clase `AdaptiveSVDAttention` de la librería NeuralOps). La intervención, llamada "attention surgery", reemplaza 18 de las 24 capas de atención del decoder (layout híbrido 3:1) y conserva 6 capas con la atención GQA original de Qwen2 como anclas de recuperación contextual. El resultado se somete después a una destilación de conocimiento en dos etapas sobre WikiText-2.

El modelo no busca ser un asistente de propósito general, sino una prueba empírica de una técnica de sustitución de operadores de atención en modelos compactos. Su interés radica en documentar el coste y la recuperación de perplejidad tras una cirugía arquitectónica agresiva: la perplejidad cero-shot tras el transplante se dispara a 310.512,01 y la destilación la reduce a 175,47, frente a los 15,38 del modelo profesor original. Es, por tanto, un artefacto de investigación sobre eficiencia de atención, no un modelo listo para producción.

La relevancia actual viene de la línea de trabajo en atención subcuadrática y en técnicas de "surgery" que permiten reaprovechar checkpoints preentrenados sin reentrenar desde cero. El modelo es pequeño (494 M parámetros, contexto nativo de Qwen2.5-0.5B) y su licencia MIT facilita la experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2) con atención híbrida: 18/24 capas con `AdaptiveSVDAttention` y 6/24 capas con GQA softmax nativa |
| Parametros totales | 494 M (modelo base Qwen2.5-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-0.5B; el autor no la declara) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos FP16 completos de 926,91 MB mas un adaptador) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | FP16 completo (926,91 MB) + adaptador; serializacion determinista de pesos NeuralOps |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B: 24 capas de decoder, dimensión oculta D=896, 14 cabezas de consulta y 2 cabezas KV (GQA), dimensión por cabeza de 64 y RoPE con theta=1.000.000. Sobre esa base, NeuralOps aplica un ratio de cirugía determinista `hybrid_3_1`: las capas con índices [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22] se sustituyen por `AdaptiveSVDAttention` envuelta en `QwenAttentionAdapter`, mientras que las capas [3, 7, 11, 15, 19, 23] mantienen la atención GQA softmax preentrenada como anclas. Cada capa transplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansión de cabezas KV de 2 a 14 y una única `o_proj` sin duplicación, para evitar el colapso de proyecciones no inicializadas. El operador soporta atención causal autoregresiva, GQA y RoPE, con despacho de kernels en tres niveles (CUDA / Triton / PyTorch).

El entrenamiento consiste en una destilación de conocimiento de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), ejecutada en una única NVIDIA RTX 3090 de 24 GB con caché offline de representaciones del profesor (0 MB de VRAM del profesor en GPU). La etapa 1 (30% del presupuesto, 90 pasos) congela embeddings, MLP y `lm_head` y entrena solo módulos de atención y layer norms con AdamW (lr=2.0e-4, weight decay 0.01, grad clipping 1.0), minimizando MSE por capa más 0.25·(1 − cos(h_s, h_t)). La etapa 2 (70% del presupuesto, 203 pasos) hace destilación extremo a extremo sobre los 24 flujos residuales con lr=6.0e-5 y peso coseno de 0.50, saltándose el `lm_head`. Se usan pesos maestros FP32 con AMP FP16 y `GradScaler`, secuencia de 512, batch 8 y acumulación de gradiente 4.

## Capacidades

- Generación de texto causal autoregresiva en inglés.
- Razonamiento y generación de código heredados del modelo base Qwen2.5-0.5B, aunque degradados por la cirugía y la destilación (ver benchmarks).
- Soporte de atención causal con GQA y RoPE en las capas transplantadas.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo "thinking" en la información proporcionada.
- El modelo está pensado como artefacto de investigación sobre atención subcuadrática, no como asistente conversacional afinado.

## Casos de uso

- Investigación en atención subcuadrática: sirve como banco de pruebas reproducible para medir el impacto de sustituir atención softmax por un operador SVD adaptativo en un decoder compacto, comparando perplejidad pre y post-destilación.
- Estudio de técnicas de "attention surgery": permite analizar cómo afecta el layout híbrido 3:1 (18 capas transplantadas, 6 anclas GQA) a la recuperación de perplejidad y a la estabilidad del entrenamiento.
- Validación de pipelines de destilación de representaciones: el protocolo en dos etapas con caché offline del profesor es reutilizable para otros pares profesor-estudiante en hardware de consumo (una sola RTX 3090).
- Experimentos de eficiencia de kernels: al despachar CUDA/Triton/PyTorch, se puede medir latencia y throughput del operador `AdaptiveSVDAttention` frente a GQA nativa en el mismo checkpoint.
- Docencia y divulgación: ejemplo didáctico de cirugía arquitectónica y destilación con métricas transparentes (PPL cero-shot frente a PPL destilada).
- Baseline negativo controlado: útil para cuantificar cuánto rendimiento se pierde al transplantar atención en modelos de 0,5 B y calibrar expectativas antes de aplicar la técnica a modelos mayores.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre WikiText-2 (`wikitext-2-raw-v1`, split de validación), secuencia 512, batch 8, grad accum 4, en RTX 3090 24 GB:

| Metrica | Valor |
|---|---|
| Perplejidad del profesor (`Qwen/Qwen2.5-0.5B`) | 15,38 |
| Perplejidad cero-shot del estudiante tras el transplante | 310.512,01 |
| Perplejidad del estudiante tras destilación (Post-KD) | 175,47 |
| Delta absoluto de perplejidad | −310.336,53 |
| Reducción relativa de perplejidad | 99,94% |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos FP16 ocupan 926,91 MB, por lo que la inferencia en FP16 requiere aproximadamente 1,2-1,5 GB de VRAM incluyendo overhead de activaciones para contextos cortos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para FP16; el autor usó una NVIDIA RTX 3090 (24 GB) para el entrenamiento de destilación.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también en GPUs integradas con suficiente memoria compartida para cuantizaciones de 8 bits o menores (no se distribuyen pesos cuantizados en el repo).
- Opciones de despliegue: la librería es `neuralops`, no `transformers` estándar; el operador `AdaptiveSVDAttention` requiere los kernels de NeuralOps. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput: no disponibles. El autor declara despacho de kernels en tres niveles (CUDA/Triton/PyTorch) pero no publica cifras de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PPL WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen2.5-0.5B + adaptive SVD, post-KD) | 494 M | no disponible | 175,47 (declarado) | MIT | Hugging Face |
| `Qwen/Qwen2.5-0.5B` (profesor) | 494 M | no disponible en la informacion | 15,38 (medido por el autor) | Apache 2.0 (modelo base Qwen) | Hugging Face |
| `Qwen/Qwen2.5-1.5B` | 1,54 B | no disponible en la informacion | no disponible | Apache 2.0 | Hugging Face |
| `meta-llama/Llama-3.2-1B` | 1,24 B | no disponible en la informacion | no disponible | Llama 3.2 Community License | Hugging Face |

La comparación relevante es contra su propio profesor: la cirugía y la destilación dejan la perplejidad en 175,47 frente a 15,38, es decir, un factor de aproximadamente 11,4× peor en WikiText-2. No hay datos publicados que permitan comparar con alternativas de atención subcuadrática de otros autores en la información disponible.

## Limitaciones y advertencias

- Degradación severa de calidad: la perplejidad post-destilación (175,47) es unas 11,4 veces la del modelo base (15,38) en WikiText-2; no es apto para producción como generador de texto.
- Solo inglés: la model card declara únicamente `en`, pese a que Qwen2.5-0.5B es multilingüe.
- Riesgo elevado de alucinación y de texto incoherente por la degradación de las representaciones tras la cirugía y la destilación limitada (293 pasos totales sobre WikiText-2).
- Entrenamiento muy acotado: la destilación se hizo solo sobre WikiText-2, sin RLHF, DPO ni ajuste por instrucciones; no se documenta alineación conversacional.
- Dependencia de la librería NeuralOps: no es un checkpoint estándar de `transformers`; requiere el operador `AdaptiveSVDAttention` y sus kernels para cargarse correctamente.
- Licencia MIT para el checkpoint, pero el modelo base Qwen2.5-0.5B tiene su propia licencia (Apache 2.0) cuyos términos pueden aplicar en la práctica; conviene revisarlos antes de uso comercial.
- Contexto no declarado: no se especifica la longitud de contexto efectiva tras la cirugía, lo que impide garantizar el comportamiento en secuencias largas.
- Métricas no verificadas: los resultados del model-index están marcados como `verified: false` y proceden del propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-adaptive-svd-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/svd/adaptive_svd_attention.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
