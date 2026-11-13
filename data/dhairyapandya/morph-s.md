# dhairyapandya/morph-s

## Resumen

MORPH-S es un modelo de lenguaje decoder de aproximadamente 170 millones de parámetros (138 millones sin contar los embeddings) desarrollado por dhairyapandya. Se trata de un híbrido con mayoría de capas Mamba2 combinadas con cuatro capas de Multi-head Latent Attention (MLA) sin codificación posicional, entrenado con un objetivo auxiliar de self-modeling. El modelo está pensado como un experimento de entrenamiento desde cero en hardware gratuito (Kaggle T4×2), no como un modelo de producción.

La propuesta técnica es interesante por su enfoque en eficiencia de memoria durante la inferencia: la combinación de Mamba2 con MLA y compartición de latentes entre capas reduce drásticamente el coste del caché KV. Según la model card, a 32k tokens el estado ocupa 23,5 MB frente a los 2.013 MB de un transformer de atención multi-cabeza de profundidad equivalente. El modelo se distribuye en dos variantes: base (preentrenada con 3B tokens de FineWeb-Edu) e instruction-tuned (SFT con smol-smoltalk, 0,15B tokens, formato ChatML).

Es relevante ahora como banco de pruebas reproducible para arquitecturas híbridas SSM/atención en entornos con recursos limitados, y para estudiar si el objetivo de self-modeling transfiere desde clasificadores pequeños a modelado de lenguaje. Sus cifras de rendimiento son modestas (HellaSwag 32,7% zero-shot frente al 25% de azar), lo que refleja un entrenamiento ligero más que una limitación de la arquitectura en sí.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba2 + MLA (transformer/SSM), decoder |
| Parámetros totales | 169.717.296 (~170M); 138M no-embedding |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens en entrenamiento; caché dimensionado hasta 32k tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch, arquitectura custom) |

Detalles adicionales de arquitectura: 24 capas, d_model 640; 20 capas Mamba2 (20 cabezas × 64, d_state 128); MLA en capas 4, 9, 14 y 19 (10 cabezas × 64, latente 128, sin codificación posicional); MLP SwiGLU de 1728. Tokenizer de SmolLM2-135M.

## Arquitectura y entrenamiento

MORPH-S es un decoder híbrido con predominio de Mamba2 (20 de 24 capas) e inserción de cuatro capas de Multi-head Latent Attention sin codificación posicional (NoPE) en las posiciones 4, 9, 14 y 19. Las capas MLA comparten latentes entre pares (4→9 y 14→19), de modo que solo se cachean dos latentes para las cuatro capas de atención. Esta combinación busca mantener capacidad de recuperación exacta a larga distancia con un coste de memoria de caché muy inferior al de un transformer de atención completa. La memoria de inferencia en fp16 se estima en 512 B por token de caché más 6,74 MB de estado SSM constante por secuencia.

El entrenamiento se realizó sobre FineWeb-Edu (muestra sample-10BT) con el tokenizer de SmolLM2, 3B tokens en 12 sesiones de Kaggle, secuencia de 2048 y 262k tokens por paso. Se usaron optimizadores Muon + AdamW con schedule WSD, fp16 con loss scaling en T4 y bf16 en Ampere o superior. El objetivo auxiliar de self-modeling añade una cabeza que predice los estados residuales normalizados (RMS) que entran en las capas de atención a partir del estado oculto final, con gradientes que fluyen hacia los objetivos (Premakumar et al.). La variante instruction-tuned se entrenó con 0,15B tokens de smol-smoltalk en formato ChatML.

## Capacidades

- Generación de texto en inglés con pipeline `text-generation`.
- Razonamiento básico y recall factual limitado por el escaso volumen de entrenamiento (3B tokens).
- Variante instruction-tuned con formato ChatML para conversación multi-turno sencilla.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: únicamente inglés.
- No dispone de visión, audio ni modo thinking explícito.
- Arquitectura custom: requiere el código del repositorio MoRPH para cargar los pesos, no es compatible directamente con `transformers`.

## Casos de uso

- Investigación en arquitecturas híbridas SSM/atención: sirve como implementación de referencia reproducible de un híbrido Mamba2 + MLA con compartición de latentes, entrenable en dos T4 gratuitas, para estudiar compromisos entre memoria de caché y calidad.
- Estudio del objetivo de self-modeling: permite evaluar empíricamente si la predicción de estados residuales internos mejora el modelado de lenguaje, extendiendo resultados previos en clasificadores pequeños.
- Prototipado de inferencia de bajo coste: el reducido estado de caché (23,5 MB a 32k tokens) lo hace adecuado para experimentos de decodificación con contextos largos en GPUs consumer.
- Educación y docencia: ejemplo completo y ligero de pipeline de preentrenamiento y SFT (tokenizer, datasets, optimizadores Muon/AdamW, schedule WSD) para cursos de LLMs.
- Generación de texto de baja exigencia: la variante SFT puede emplearse en demos de chatbot con respuestas conversacionales simples donde no se requiera precisión factual.
- Benchmarking de eficiencia: base para comparar latencia y memoria frente a transformers de atención completa de profundidad equivalente en entornos con VRAM limitada.

## Benchmarks y rendimiento

| Benchmark | MORPH-S base | MORPH-S SFT |
|---|---|---|
| HellaSwag (zero-shot) | 32,7% | 32,4% |
| Perplejidad de validación (FineWeb-Edu) | 17,4 | no disponible |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otras evaluaciones en la información disponible. El azar en HellaSwag es del 25%.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo ocupa aproximadamente 0,7 GB en fp16 (170M parámetros); con caché y overhead, cabe holgadamente en GPUs de 4-8 GB.
- GPU recomendadas: cualquiera con soporte CUDA y al menos 4 GB de VRAM; el autor lo entrenó en Kaggle T4×2 (16 GB cada una).
- Cabe en GPU consumer: sí, en GTX 1650/RTX 3050 en adelante; también en T4, RTX 4090, A100 y H100 sin problema.
- Opciones de despliegue: únicamente mediante el código del repositorio MoRPH (`morph.eval.generate`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al ser una arquitectura custom.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| MORPH-S | ~170M (138M no-emb.) | 2048 (entrenamiento) | Híbrida Mamba2 + MLA | MIT | Arquitectura custom, HellaSwag 32,7% |
| SmolLM2-135M | 135M | 8192 | Transformer denso | Apache 2.0 | Tokenizer reutilizado por MORPH-S; compatible con `transformers` |
| Mamba2 (referencia) | variable | variable | SSM puro | Apache 2.0 | Base arquitectónica del modelo; sin MLA |

No se dispone de datos de benchmarks comparativos directos entre MORPH-S y SmolLM2-135M en la información proporcionada. La comparación con SmolLM2 es pertinente por compartir tokenizer y rango de tamaño, pero sus cifras de rendimiento no están disponibles aquí.

## Limitaciones y advertencias

- Modelo pequeño y ligeramente entrenado (3B tokens): se espera un recall factual y razonamiento débiles.
- HellaSwag del 32,7% zero-shot, solo 7,7 puntos por encima del azar (25%).
- Las cuatro capas de atención limitan la recuperación exacta a larga distancia frente a un transformer de atención completa.
- El efecto del objetivo de self-modeling solo se ha demostrado en clasificadores pequeños; su transferencia al modelado de lenguaje es una hipótesis que este modelo pone a prueba.
- Solo inglés; sin capacidades multilingües.
- No compatible con `transformers`, vLLM, llama.cpp ni Ollama: requiere el código custom del repositorio, lo que complica su integración en producción.
- Riesgo de alucinación elevado por el bajo volumen de entrenamiento.
- No se documentan sesgos específicos, pero al entrenarse con FineWeb-Edu hereda los sesgos de ese corpus.
- Licencia MIT: permite uso comercial, pero el rendimiento no lo hace recomendable para aplicaciones de producción reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dhairyapandya/morph-s
- Repositorio de código MoRPH: https://github.com/dhairya-pandya/MoRPH
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Tokenizer SmolLM2-135M: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Mamba2 (Dao & Gu 2024): https://arxiv.org/abs/2405.21060
- DeepSeek-V2 (MLA): https://arxiv.org/abs/2405.04434
- Self-modeling (Premakumar et al.): https://arxiv.org/abs/2407.10188
- Muon / Moonlight: https://arxiv.org/abs/2502.16982
- Kimi Linear: arXiv 2510.26692
- Estudio de diseño híbrido: arXiv 2510.04800
