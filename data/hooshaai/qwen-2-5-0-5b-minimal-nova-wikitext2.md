# Hooshaai/qwen-2.5-0.5b-minimal-nova-wikitext2

## Resumen

`Hooshaai/qwen-2.5-0.5b-minimal-nova-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se ha aplicado una "cirugía de atención" (attention surgery) para sustituir 18 de las 24 capas de atención del transformer original por el operador `minimal_nova` (`MinimalNOVAAttention`, basado en factorización SVD de proyecciones de bajo rango) de la librería NeuralOps. El resultado es un modelo híbrido con un 75 % de capas de atención subcuadrática y un 25 % de capas que conservan la GQA softmax nativa de Qwen2, pensado para explorar eficiencia computacional en modelos causales compactos.

El modelo se ha recuperado mediante un proceso de destilación de conocimiento en dos etapas sobre WikiText-2, partiendo de un colapso severo de perplejidad tras el transplante (PPL de 398 525,01 en zero-shot) hasta una perplejidad final de 71,15 en el split de validación. El modelo base original reporta una perplejidad de referencia de 15,38, por lo que la brecha de calidad respecto al teacher sigue siendo sustancial.

Se trata de un artefacto de investigación (329 descargas, 0 likes, creado en noviembre de 2026) orientado a estudiar topologías híbridas de atención y técnicas de destilación, no a un modelo de producción. Su relevancia radica en documentar empíricamente cuánto rendimiento se pierde y se recupera al sustituir atención cuadrática por operadores de bajo rango en un LM de 0,5 B de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only híbrido: 18/24 capas con `MinimalNOVAAttention` (SVD low-rank) + 6/24 capas con GQA softmax nativa de Qwen2 |
| Parametros totales | 485.819.008 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Qwen2.5-0.5B soporta 32 768 tokens, pero la model card no lo confirma para este checkpoint) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16; el adapter se distribuye aparte) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (checkpoint completo FP16, ~926,69 MB, más un adapter) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-0.5B` (494 M parámetros, 24 capas, dimensión oculta D=896, 14 cabezas de query y 2 de key/value con GQA, dimensión por cabeza 64). Sobre esa base se aplica una topología `hybrid_3_1`: las capas con índices [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22] usan `minimal_nova` envuelto en `QwenAttentionAdapter`, mientras que las capas [3, 7, 11, 15, 19, 23] conservan la atención GQA softmax original como anclas de enrutamiento contextual global. Cada capa transplantada hereda los tensores preentrenados `q_proj`, `k_proj`, `v_proj` y `o_proj` del teacher, con expansión de cabezas KV de 2 a 14 y una única `o_proj`. El operador soporta RoPE (θ = 1 000 000) y dispatch de kernels en tres niveles (CUDA / Triton / PyTorch).

El entrenamiento consiste en una destilación de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), ejecutada en una RTX 3090 de 24 GB con caché offline de representaciones del teacher (0 MB de VRAM del teacher en GPU). La etapa 1 (30 % del presupuesto, 129 pasos) congela embeddings, MLPs y `lm_head`, y entrena solo módulos de atención y layernorms con AdamW (lr = 2,0e-4, weight decay 0,01, grad clipping 1,0) minimizando MSE por capa más 0,25·(1 − coseno). La etapa 2 (70 % del presupuesto, 289 pasos) hace destilación end-to-end sobre los 24 streams residuales con lr = 6,0e-5 y peso coseno de 0,50, saltándose `lm_head`.

## Capacidades

- Generación de texto causal autorregresiva en inglés.
- Conversación multi-turno (etiqueta `conversational` en el repo), aunque sin evaluación publicada de calidad conversacional.
- Razonamiento básico y modelado de lenguaje a pequeña escala, limitado por el tamaño de 0,5 B y por la brecha de perplejidad respecto al teacher.
- Soporte de atención causal con GQA en las capas ancla y operador SVD de bajo rango en las capas transplantadas.
- Compatibilidad con RoPE y con el adapter de Qwen2 para integrarse en pipelines que usen la librería NeuralOps.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking.
- Capacidad multilingüe: no disponible (solo se declara inglés).

## Casos de uso

- Investigación en eficiencia de atención: servir como banco de pruebas reproducible para medir el impacto de sustituir atención softmax por operadores SVD de bajo rango en un LM causal de 0,5 B, comparando la perplejidad post-cirugía (71,15) con la del teacher (15,38).
- Estudio de técnicas de destilación: el checkpoint documenta dos etapas con hiperparámetros concretos (129 + 289 pasos, lr 2,0e-4 y 6,0e-5), útil para replicar o comparar protocolos de recuperación tras cirugía de arquitectura.
- Prototipado de topologías híbridas: permite experimentar con ratios de mezcla (3:1 en este caso) entre capas lineales/subcuadráticas y capas de atención completa para analizar el equilibrio entre coste y recall de induction heads.
- Evaluación de la librería NeuralOps: sirve como caso de referencia para validar el registro `ATTENTION_REGISTRY`, el `QwenAttentionAdapter` y el dispatch de kernels CUDA/Triton/PyTorch en un modelo real.
- Generación de texto de baja latencia en entornos con recursos muy limitados: con 485 M parámetros en FP16 (~927 MB de pesos) cabe en GPUs consumer modestas, aunque la calidad está muy por debajo del modelo base.
- Docencia y divulgación: ejemplo práctico de cómo un transplante de atención sin destilación colapsa la perplejidad (398 525,01) y cómo la destilación recupera el 99,98 % de esa degradación.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente; `verified: false`):

| Metrica | Valor | Notas |
|---|---|---|
| Perplejidad teacher (`Qwen/Qwen2.5-0.5B`) | 15,38 | Referencia GQA softmax |
| Perplejidad student zero-shot tras cirugía | 398 525,01 | Inmediatamente tras el transplante 18/24 |
| Perplejidad student post-destilación | 71,15 | Tras destilación en 2 etapas |
| Delta absoluto de perplejidad | −398 453,86 | Mejora obtenida por destilación |
| Reducción relativa de perplejidad | 99,98 % | Recuperación desde el pico post-cirugía |

Evaluación sobre WikiText-2 (`wikitext-2-raw-v1`), split de validación, longitud de secuencia 512, batch size 8, grad accum 4, en una NVIDIA GeForce RTX 3090 de 24 GB. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1 GB para los pesos (926,69 MB) más overhead de activaciones y caché KV; en la práctica, entre 1,5 y 3 GB según longitud de contexto y batch.
- Cuantización a 8 bits: ~0,5 GB de pesos; a 4 bits: ~0,25 GB de pesos (estimaciones, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3050, RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia en FP16 con contexto moderado; A100/H100 no son necesarias.
- Cabe holgadamente en GPU consumer; el entrenamiento de destilación se realizó en una RTX 3090 de 24 GB.
- Opciones de despliegue: la librería `neuralops` es la vía nativa; no se documenta compatibilidad directa con vLLM, llama.cpp, Ollama o TGI, ya que el operador `minimal_nova` requiere el adapter y el dispatch de kernels de NeuralOps. La conversión a GGUF no está documentada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/qwen-2.5-0.5b-minimal-nova-wikitext2` | 485,8 M | no disponible | 71,15 (post-KD, validación) | MIT | Hugging Face |
| `Qwen/Qwen2.5-0.5B` (teacher) | 494 M | 32 768 tokens (modelo base) | 15,38 (referencia del autor) | Apache 2.0 (modelo base Qwen2.5) | Hugging Face |
| `Qwen/Qwen2.5-0.5B-Instruct` | 494 M | 32 768 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face |

La comparativa se limita al modelo base por falta de datos de otros checkpoints derivados de cirugía de atención en la información proporcionada. La diferencia de perplejidad (71,15 frente a 15,38) implica que este checkpoint no es un sustituto funcional del teacher para tareas de generación de calidad.

## Limitaciones y advertencias

- Brecha de calidad muy significativa respecto al modelo base: perplejidad de 71,15 frente a 15,38, un factor de aproximadamente 4,6×.
- Entrenado únicamente sobre WikiText-2, un corpus enciclopédico limitado; probable sobreajuste al dominio y escasa generalización fuera de él.
- Solo declara soporte de inglés; no hay evaluación multilingüe.
- No se documentan evaluaciones de sesgo, toxicidad ni alucinación; al ser un modelo de 0,5 B, el riesgo de alucinación y de respuestas incoherentes es alto.
- El proceso de cirugía produjo un colapso inicial de perplejidad de más de cinco órdenes de magnitud; la recuperación es parcial y dependiente del protocolo de destilación.
- Requiere la librería `neuralops` y el adapter `QwenAttentionAdapter` para cargarse correctamente; no es un checkpoint estándar de `transformers` aunque use arquitectura Qwen2.
- La licencia del checkpoint es MIT, pero el modelo base Qwen2.5-0.5B se distribuye bajo Apache 2.0; conviene revisar las condiciones de ambos antes de uso comercial.
- Los benchmarks están marcados como no verificados (`verified: false`) y proceden únicamente del autor.
- No apto para producción: sin datos de latencia, throughput, robustez ni evaluación de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-minimal-nova-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador `minimal_nova`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/svd/minimal_nova.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
