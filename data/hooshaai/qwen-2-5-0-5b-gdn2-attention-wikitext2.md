# Hooshaai/qwen-2.5-0.5b-gdn2-attention-wikitext2

## Resumen

`Hooshaai/qwen-2.5-0.5b-gdn2-attention-wikitext2` es un checkpoint experimental de Qwen2.5-0.5B en el que se ha realizado una cirugía de atención: 18 de las 24 capas del decoder han sido sustituidas por el operador `gdn2_attention` (Gated DeltaNet 2) de la librería NeuralOps, manteniendo 6 capas con la atención GQA original de Qwen2 como anclas. El objetivo declarado es explorar atención subcuadrática (recurrencia lineal con compuertas) en modelos causales pequeños, combinando eficiencia de complejidad lineal con capacidad de recuperación global.

El modelo se ha sometido a un proceso de destilación de representaciones ocultas en dos etapas sobre WikiText-2, partiendo del modelo base `Qwen/Qwen2.5-0.5B`. Los resultados publicados por el autor son, sin embargo, muy desfavorables: la perplejidad en validación de WikiText-2 es de 1.805.602,10 frente a los 15,38 del profesor, y la destilación no logra reducirla (delta de 0,00). Esto sugiere que la cirugía de atención no ha convergido o que el proceso de destilación fue insuficiente (apenas 6 pasos de optimización en total).

Se trata, por tanto, de un artefacto de investigación sobre topologías de atención híbridas, no de un modelo listo para producción. Es relevante ahora como evidencia empírica negativa dentro del campo de la sustitución de atención softmax por operadores lineales recurrentes en modelos compactos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder híbrido: 18/24 capas con `gdn2_attention` (recurrencia lineal con compuertas) y 6/24 capas con GQA softmax nativa de Qwen2 |
| Parámetros totales | 533.994.100 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-0.5B soporta 32.768 tokens, pero no se confirma para este checkpoint) |
| Tipos de cuantización | no disponible (pesos publicados en FP16; compatible con cuantización estándar vía safetensors) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16, ~1018,56 MB) más adaptador |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen2.5-0.5B (24 capas, dimensión oculta 896, 14 cabezas de consulta y 2 de clave/valor, dimensión por cabeza 64, RoPE con theta 1.000.000). Sobre esa base se aplica una topología `hybrid_3_1`: las capas con índices [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22] usan `GDN2Attention`, un operador de recurrencia lineal con compuertas y borrado/escritura desacoplados (S_t = S_{t-1} · α_t · (I − β_erase_t · k_t k_tᵀ) + β_write_t · k_t v_tᵀ). Las capas [3, 7, 11, 15, 19, 23] conservan la atención GQA softmax original. Cada capa transplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansión de cabezas KV de 2 a 14 mediante un adaptador.

El entrenamiento consiste en una destilación de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), ejecutada en una RTX 3090 de 24 GB con caché offline de representaciones del profesor. La etapa 1 (30 % del presupuesto, 2 pasos) congela embeddings, MLP y `lm_head`, y entrena solo módulos de atención y layer norms con AdamW (lr 2.0e-4, weight decay 0.01, clipping 1.0) minimizando MSE más 0.25·(1 − coseno). La etapa 2 (70 % del presupuesto, 4 pasos) ajusta todas las capas con lr 6.0e-5 y peso coseno de 0.50. El número total de pasos (6) es extremadamente reducido, lo que explica en buena medida el resultado publicado.

## Capacidades

- Generación de texto causal autorregresiva (pipeline `text-generation`).
- Conversación en formato chat heredado del modelo base Qwen2.5-0.5B.
- Soporte de atención causal con RoPE gestionado por adaptador.
- Kernel dispatch en tres niveles (CUDA, Triton, PyTorch) a través de NeuralOps.
- Capacidades multilingües: limitadas al inglés según la model card.
- Tool calling, function calling y razonamiento multi-paso: no verificados ni declarados para este checkpoint.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Investigación en atención subcuadrática: banco de pruebas para comparar `gdn2_attention` frente a softmax GQA en un modelo de 0,5B, midiendo perplejidad y estabilidad de entrenamiento.
- Estudio de cirugía de atención: análisis de cómo afecta la sustitución de capas a la propagación de representaciones y a la recuperación de heads de inducción.
- Reproducción de experimentos de destilación: el checkpoint y el protocolo permiten replicar la destilación de dos etapas y evaluar si más pasos recuperan la perplejidad del profesor.
- Docencia y divulgación: ejemplo didáctico de qué ocurre cuando se trasplanta un operador lineal en un transformer preentrenado sin suficiente ajuste.
- Benchmarking de kernels: comparación de latencia y throughput entre el dispatch CUDA/Triton/PyTorch de NeuralOps en GPUs consumer.
- Exploración de arquitecturas híbridas: base para estudiar ratios de hibridación distintos (por ejemplo 1:1 o 7:1) y su impacto en la perplejidad.
- No recomendado para aplicaciones de producción, atención al cliente ni generación de código, dado el rendimiento publicado.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre WikiText-2 `wikitext-2-raw-v1`, split de validación, longitud de secuencia 512, batch 8, grad accum 4, en RTX 3090 24 GB.

| Métrica | Valor |
|---|---|
| Perplejidad del profesor (Qwen2.5-0.5B) | 15,38 |
| Perplejidad del estudiante tras cirugía (zero-shot) | 1.805.602,10 |
| Perplejidad del estudiante tras destilación (post-KD) | 1.805.602,10 |
| Delta absoluto de perplejidad | +0,00 |
| Reducción relativa de perplejidad | 0,00 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1,1 GB de pesos más overhead de activaciones y caché KV; en la práctica, 2-3 GB en FP16.
- En cuantización de 8 bits: ~0,6 GB de pesos; en 4 bits: ~0,3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100, H100 son suficientes.
- Cabe holgadamente en GPU consumer (GTX 1650 4 GB en adelante, en cuantización).
- Opciones de despliegue: la librería `neuralops` es necesaria para cargar el operador `gdn2_attention`; no se garantiza compatibilidad directa con vLLM, llama.cpp, Ollama o TGI sin conversión previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (gdn2 hybrid) | 534 M | no disponible | 1.805.602,10 (post-KD) | MIT | Hugging Face |
| Qwen/Qwen2.5-0.5B (profesor) | 494 M | 32.768 | 15,38 | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-0.5B-Instruct | 494 M | 32.768 | no disponible | Apache 2.0 | Hugging Face |
| SmolLM2-360M | 362 M | 8.192 | no disponible | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- Perplejidad de 1.805.602,10 en WikiText-2, cinco órdenes de magnitud por encima del profesor: el modelo no genera texto coherente en la práctica.
- La destilación publicada no reduce la perplejidad (delta 0,00), probablemente por un presupuesto de solo 6 pasos de optimización.
- Solo soporta inglés según la model card; no se han evaluado otros idiomas.
- Riesgo elevado de alucinación y degeneración de texto por la distribución de pesos tras la cirugía.
- Licencia MIT, lo que permite uso comercial, pero el estado del modelo desaconseja cualquier despliegue en producción.
- Requiere la librería `neuralops` para cargar el operador `gdn2_attention`; no es un checkpoint estándar de transformers.
- No hay datos de sesgos, toxicidad ni evaluación de seguridad.
- El checkpoint incluye un adaptador además de los pesos FP16; hay que revisar la compatibilidad del adaptador con el pipeline de carga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-gdn2-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Librería NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de `GDN2Attention`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/gated/flagship_fla.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
