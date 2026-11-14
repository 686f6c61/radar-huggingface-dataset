# Hooshaai/qwen-2.5-0.5b-bam-umoe-wikitext2

## Resumen

`Hooshaai/qwen-2.5-0.5b-bam-umoe-wikitext2` es un checkpoint experimental de Qwen2.5-0.5B en el que se ha practicado cirugía de atención: 18 de las 24 capas del decoder han sido sustituidas por el operador `bam_umoe` (BAMUMoEBlock, familia sparse) de la librería NeuralOps, mientras que las 6 capas restantes conservan la atención GQA original de Qwen2.5 como anclas de recuperación contextual. El resultado es un transformer híbrido de 494 millones de parámetros con un patrón de atención 3:1 (tres capas subcuadráticas por cada capa softmax nativa).

El modelo se distribuye como artefacto de investigación en el "Attention Surgery Zoo" de NeuralOps y va acompañado de un proceso de destilación de conocimiento en dos etapas sobre WikiText-2. Su interés no reside en el rendimiento absoluto, sino en documentar empíricamente el coste y la recuperación tras reemplazar atención softmax por operadores sparse en un modelo causal compacto.

La relevancia actual es metodológica: cuantifica el colapso inicial de perplejidad tras la cirugía (de 15,38 a 338.496,47) y la recuperación lograda mediante destilación (hasta 80,85), con telemetría reproducible sobre una única RTX 3090. Está pensado para investigadores que evalúan alternativas de atención eficiente, no para despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder híbrido (Qwen2) con 18/24 capas sustituidas por `bam_umoe` (BAMUMoEBlock, sparse) y 6 capas GQA nativas |
| Parámetros totales | 494.085.760 |
| Parámetros activos | no disponible (el operador se describe como sparse/MoE, pero no se publica el número de expertos ni la ratio de activación) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-0.5B soporta 32.768 tokens, pero la ficha no confirma el contexto efectivo tras la cirugía) |
| Tipos de cuantización | no disponible (pesos publicados en FP16 completo, 942,46 MB, más adaptador) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16 completo + adaptador) |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen2.5-0.5B: 24 capas, dimensión oculta D=896, 14 cabezas de consulta y 2 cabezas KV (GQA), dimensión por cabeza d_h=64, RoPE con theta=1.000.000. Sobre esa base se aplica una cirugía determinista `hybrid_3_1`: las capas en los índices [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22] usan `bam_umoe` envuelto en `QwenAttentionAdapter`, mientras que [3, 7, 11, 15, 19, 23] mantienen la atención softmax GQA preentrenada. Cada capa transplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con una única `o_proj` (sin duplicación) y expansión de cabezas KV de 2 a 14.

El entrenamiento consiste en destilación de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), ejecutada con la arquitectura de caché offline de NeuralOps en una RTX 3090 de 24 GB y 0 MB de VRAM de profesor en GPU. La etapa 1 (30 % del presupuesto, 121 pasos) congela el backbone y entrena solo módulos de atención y layer norms, con AdamW (lr=2,0e-4, weight decay 0,01, clipping 1,0) y pérdida MSE + 0,25·(1 − cos). La etapa 2 (70 % del presupuesto, 284 pasos) hace destilación end-to-end de representaciones con pérdida MSE + 0,50·(1 − cos). El despacho de kernels es de tres niveles (CUDA / Triton / PyTorch).

## Capacidades

- Generación de texto causal autorregresiva en inglés, heredada del modelo base Qwen2.5-0.5B.
- Atención causal con soporte de Grouped-Query Attention (GQA) y RoPE gestionado por el adaptador.
- Operadores de atención sparse/subcuadrática con despacho de kernels CUDA, Triton y PyTorch.
- Conversación multi-turno (el pipeline declarado es `text-generation` con tag `conversational`).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.
- Capacidad multilingüe limitada al inglés según el campo `language` de la model card.

## Casos de uso

- Investigación en atención eficiente: comparar la perplejidad y el comportamiento de un modelo con 75 % de capas sparse frente al Qwen2.5-0.5B original sobre el mismo corpus, usando WikiText-2 como referencia reproducible.
- Reproducción de experimentos de cirugía de atención: el checkpoint sirve como punto de partida verificado para estudiar la recuperación tras transplantar operadores, con telemetría publicada (pre-KD PPL 338.496,47 frente a post-KD 80,85).
- Evaluación de destilación de representaciones: útil para medir la eficacia de las dos etapas descritas (alineación de subespacio con backbone congelado y destilación end-to-end) en modelos por debajo de 1B de parámetros.
- Pruebas de integración de la librería NeuralOps: el modelo valida el registro `ATTENTION_REGISTRY`, el `QwenAttentionAdapter` y el despacho de kernels en un caso real de 24 capas.
- Benchmarking de latencia y memoria en GPUs de consumo: al ocupar 942,46 MB en FP16, cabe en tarjetas de 8 GB o menos y permite medir el coste de los operadores sparse frente a softmax en hardware asequible.
- Docencia y formación: ejemplo didáctico de sustitución de bloques de atención, herencia de pesos de proyecciones y análisis del colapso y recuperación de perplejidad.
- Estudio de robustez de modelos compactos: analizar cómo afecta la hibridación 3:1 a la coherencia en generación larga comparándolo con el profesor.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index y la model card (no verificados de forma independiente):

| Métrica | Valor | Contexto |
|---|---:|---|
| Perplejidad del profesor (Qwen2.5-0.5B) | 15,38 | WikiText-2 validation, seq_len 512 |
| Perplejidad del estudiante pre-destilación (zero-shot tras cirugía) | 338.496,47 | WikiText-2 validation, seq_len 512 |
| Perplejidad del estudiante post-destilación | 80,85 | WikiText-2 validation, seq_len 512 |
| Delta absoluto de perplejidad | −338.415,61 | Mejora atribuida a la destilación |
| Reducción relativa de perplejidad | 99,98 % | Recuperación desde el pico post-cirugía |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en FP16 (942,46 MB de pesos más overhead de activaciones y caché KV). En cuantización de 8 bits o 4 bits no hay datos publicados, pero por tamaño cabría en menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para FP16; el autor entrenó y evaluó en una NVIDIA GeForce RTX 3090 de 24 GB.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y modelos con 8 GB o más; también en iGPU con suficiente memoria compartida si se cuantiza.
- Opciones de despliegue: la librería de referencia es `neuralops` (requerida para cargar el operador `bam_umoe` y el adaptador). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles. El autor solo reporta tiempos de entrenamiento implícitos (121 + 284 pasos) y el uso de 0 MB de VRAM de profesor en GPU gracias a la caché offline.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| qwen-2.5-0.5b-bam-umoe-wikitext2 | 494 M | no disponible | 80,85 (post-KD) | MIT | Hugging Face, requiere `neuralops` |
| Qwen/Qwen2.5-0.5B (profesor) | 494 M | 32.768 tokens | 15,38 | Apache 2.0 (modelo base Qwen2.5) | Hugging Face, ecosistema estándar |
| Qwen/Qwen2.5-0.5B-Instruct | 494 M | 32.768 tokens | no disponible | Apache 2.0 | Hugging Face, transformers/vLLM |

La comparación directa solo es posible frente al profesor, ya que el autor no publica resultados frente a otras alternativas de atención eficiente. La diferencia de perplejidad (80,85 frente a 15,38) refleja el coste de la cirugía y la destilación, no una mejora de calidad.

## Limitaciones y advertencias

- Perplejidad muy superior a la del modelo base (80,85 frente a 15,38): la calidad de generación es sustancialmente peor y no es apta para producción sin validación adicional.
- El checkpoint se ha destilado únicamente sobre WikiText-2; el dominio y la distribución de entrenamiento son muy estrechos y el riesgo de degradación fuera de ese corpus es alto.
- Solo soporta inglés según la model card; no hay evidencia de capacidades multilingües.
- Riesgo elevado de alucinación y de incoherencia en generación larga, derivado de la sustitución de atención y de la destilación limitada (405 pasos en total).
- Requiere la librería `neuralops` para cargar el operador `bam_umoe`; no es un checkpoint estándar de `transformers` y la portabilidad a otros runtimes no está documentada.
- No se publican datos sobre sesgos, evaluación de seguridad ni comportamiento en tool calling o agentes.
- Licencia MIT para el checkpoint, pero conviene revisar la licencia del modelo base Qwen2.5 (Apache 2.0) y la del repositorio NeuralOps antes de un uso comercial.
- El número de parámetros activos del operador sparse no se publica, por lo que no se puede estimar el ahorro computacional real frente a softmax.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-bam-umoe-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador `bam_umoe`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/sparse/bam_umoe.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
