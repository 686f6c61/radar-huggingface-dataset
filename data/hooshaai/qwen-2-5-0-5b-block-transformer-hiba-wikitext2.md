# Hooshaai/qwen-2.5-0.5b-block-transformer-hiba-wikitext2

## Resumen

`qwen-2.5-0.5b-block-transformer-hiba-wikitext2` es un checkpoint experimental publicado por el usuario Hooshaai dentro del proyecto NeuralOps Attention Surgery Zoo. No se trata de un modelo entrenado desde cero, sino de una cirugía de atención sobre `Qwen/Qwen2.5-0.5B`: 18 de las 24 capas del decoder han sido sustituidas por el operador `BlockTransformerHIBA` de la librería NeuralOps, mientras que 6 capas conservan la atención GQA original de Qwen2 como anclas de recuperación global. El resultado se ha destilado después sobre WikiText-2.

El modelo resuelve un problema de investigación muy concreto: evaluar si es viable reemplazar atención softmax cuadrática por atención jerárquica de bloques con dispersión top-k en un transformer causal compacto sin destruir su capacidad de modelado. La relevancia es metodológica, no de producto: documenta el coste (en perplejidad) de la sustitución y la recuperación lograda mediante destilación de representaciones ocultas en dos etapas.

El checkpoint tiene 535.364.224 parámetros reales según safetensors, ventana de contexto heredada de Qwen2.5-0.5B (no confirmada en la información disponible), licencia MIT e idioma declarado inglés. Su perplejidad final en WikiText-2 es de 399,26 frente a los 15,38 del modelo profesor, lo que lo sitúa como artefacto de estudio y no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal (Qwen2) con atención híbrida: 18/24 capas `BlockTransformerHIBA` + 6/24 capas GQA softmax nativas |
| Parametros totales | 535.364.224 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Qwen2.5-0.5B) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 completo, 1021,18 MB, más adaptador) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16 completo + adaptador) |

## Arquitectura y entrenamiento

La base es Qwen2.5-0.5B: 24 capas, dimensión oculta D=896, 14 cabezas de consulta y 2 cabezas KV (GQA), dimensión por cabeza 64, RoPE con theta 1.000.000. Sobre esa base se aplica una topología `hybrid_3_1`: las capas en índices [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22] usan `BlockTransformerHIBA` envuelto en `QwenAttentionAdapter`, y las capas [3, 7, 11, 15, 19, 23] conservan la atención GQA original. El operador HIBA combina atención densa intra-bloque con atención dispersa top-k entre bloques no locales, unificadas bajo un único softmax sobre las puntuaciones intra e inter. Soporta causalidad autorregresiva, GQA y RoPE mediante adaptador, con despacho de kernels en tres niveles (CUDA, Triton, PyTorch).

Cada capa transplantada inicializa desde los tensores preentrenados `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansión de cabezas KV de 2 a 14 y una única `o_proj` sin duplicación. Tras la cirugía, la perplejidad cero-shot se dispara a 114.801,79. La recuperación se hace con destilación de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), longitud de secuencia 512, batch 8 y acumulación de gradiente 4, en una RTX 3090 de 24 GB con caché offline de representaciones del profesor (0 MB de VRAM del profesor en GPU). La etapa 1 (30 % del presupuesto, 124 pasos) congela embeddings, MLP y `lm_head` y entrena solo atención y layer norms con AdamW (lr 2.0e-4, weight decay 0.01, clipping 1.0, FP32 maestro con AMP FP16), minimizando MSE por capa más 0,25·(1 − coseno) entre estados ocultos. La etapa 2 (70 %, 287 pasos) hace destilación extremo a extremo con un objetivo de representación más estricto.

## Capacidades

- Generación de texto causal autorregresiva en inglés, heredada del modelo base Qwen2.5-0.5B.
- Razonamiento básico y respuesta conversacional de un modelo de 0,5B, degradados por la pérdida de perplejidad tras la cirugía.
- Sin soporte verificado de tool calling ni function calling en este checkpoint.
- Sin soporte verificado de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés declarado; el modelo base soporta más idiomas, pero este checkpoint no lo declara.
- Sin modo thinking, visión ni audio.
- Valor principal: servir como banco de pruebas reproducible para investigación en atención subcuadrática y destilación.

## Casos de uso

- Investigación en atención eficiente: comparar el operador `BlockTransformerHIBA` frente a atención softmax completa en un mismo esqueleto Qwen2.5-0.5B, midiendo perplejidad y coste computacional con la misma configuración de evaluación.
- Reproducción de experimentos de destilación: usar el protocolo de dos etapas y la caché offline de representaciones como referencia para destilar otros operadores de atención en GPUs de consumo.
- Estudio de cirugía de pesos: analizar cómo se comporta la inicialización desde `q_proj`/`k_proj`/`v_proj`/`o_proj` del profesor con expansión GQA de 2 a 14 cabezas KV.
- Benchmark de kernels: validar el despacho CUDA/Triton/PyTorch del operador HIBA en entornos controlados antes de integrarlo en modelos mayores.
- Docencia y formación: ilustrar de forma práctica el impacto de sustituir atención cuadrática por esquemas jerárquicos dispersos en un transformer pequeño.
- Pruebas de pipeline de serialización: verificar flujos de carga con la librería `neuralops` y formatos safetensors FP16 más adaptador.
- No recomendado para atención al cliente, generación de código en producción ni aplicaciones comerciales reales dada la perplejidad de 399,26.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index y la model card (no verificados de forma independiente), medidos en WikiText-2 `wikitext-2-raw-v1` validation, secuencia 512, batch 8, grad accum 4, sobre RTX 3090 24 GB.

| Metrica | Valor |
|---|---|
| Perplejidad del profesor (`Qwen/Qwen2.5-0.5B`) | 15,38 |
| Perplejidad cero-shot tras la cirugía (pre-KD) | 114.801,79 |
| Perplejidad tras destilación (post-KD) | 399,26 |
| Delta absoluto de perplejidad | −114.402,54 |
| Reducción relativa de perplejidad | 99,65 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- Inferencia en FP16: aproximadamente 1,07 GB solo de pesos (1021,18 MB), más overhead de activaciones y KV cache; cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: RTX 3060, RTX 4060, RTX 4090, A100, H100; el entrenamiento de destilación documentado se hizo en una RTX 3090 de 24 GB.
- Cabe en GPU consumer: sí, en cualquier tarjeta con al menos 4 GB de VRAM en FP16; en cuantizaciones de 8 o 4 bits cabría en GPUs con 2-3 GB.
- Despliegue: la librería `neuralops` es la vía documentada; no hay confirmación de soporte en vLLM, llama.cpp, Ollama o TGI, y el operador HIBA requeriría kernels específicos en esos motores.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (block_transformer_hiba) | 535 M | no disponible | 399,26 | MIT | Hugging Face |
| Qwen/Qwen2.5-0.5B (profesor) | 494 M | no disponible en la información | 15,38 | Apache 2.0 (según modelo base; no confirmado aquí) | Hugging Face |
| Qwen2.5-0.5B-Instruct | no disponible | no disponible | no disponible | Apache 2.0 (no confirmado aquí) | Hugging Face |

Las alternativas comparables en la misma categoría de atención subcuadrática (Mamba, RWKV, retnet) no aparecen en la información proporcionada, por lo que no se incluyen datos de comparación.

## Limitaciones y advertencias

- Perplejidad de 399,26 frente a 15,38 del profesor: la calidad de generación está severamente degradada y el modelo no es apto para uso en producción.
- Riesgo alto de alucinación y de texto incoherente, especialmente en secuencias largas.
- Solo declara inglés; no hay evidencia de comportamiento multilingüe correcto.
- Licencia MIT, lo que permite uso comercial del artefacto, pero la degradación de calidad hace inviable ese escenario en la práctica.
- Dependencia de la librería `neuralops` para cargar el modelo; la integración con ecosistemas estándar (transformers, vLLM, llama.cpp) no está documentada.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente.
- La ventana de contexto efectiva tras el transplante no está documentada; el adaptador maneja RoPE, pero no se especifica si se conserva el contexto nativo de Qwen2.5-0.5B.
- El checkpoint incluye pesos FP16 completos más un adaptador; conviene revisar el contenido del repo antes de integrarlo en pipelines automatizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-block-transformer-hiba-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/adaptive/block_transformer_hiba.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
