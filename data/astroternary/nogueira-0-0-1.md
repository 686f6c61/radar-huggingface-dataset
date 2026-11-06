# AstroTernary/Nogueira-0.0.1

## Resumen

Nogueira 0.0.1 es el primer modelo publicado del proyecto [cansei-de-esperar](https://github.com/riknog/cansei-de-esperar), una iniciativa de investigación que explora el entrenamiento de modelos de lenguaje ternarios (pesos en {-1, 0, +1}) íntegramente en CPU, sin GPU. Lo desarrolla el usuario AstroTernary y se distribuye bajo licencia Apache 2.0. Es un modelo base de portugués, no un modelo instruido: genera texto con el estilo de los artículos de Wikipedia pero no mantiene conversaciones ni sigue instrucciones.

Arquitectura y escala: transformer decoder de estilo Llama con 4 capas, dimensión de modelo 320, 5 cabezas de atención y FFN con activación ReLU² de factor 4×. Emplea RMSNorm y RoPE, y sigue la receta BitNet b1.58: los pesos lineales son ternarios (cuantización absmean por tensor) y las activaciones int8 (absmax por token). El vocabulario es un BPE byte-level de 4.096 tokens entrenado sobre Wikipedia en portugués, y la longitud de contexto es de solo 256 tokens. El modelo tiene aproximadamente 5 millones de parámetros.

Su relevancia es metodológica más que práctica: demuestra que es viable entrenar desde cero un modelo ternario con cómputo puramente int8 (usando `torch._int_mm` sobre AVX-512 VNNI) en un Xeon de 4 núcleos en un presupuesto de 240 minutos de CPU, alcanzando 1,571 bits por byte en validación frente a 2,06 de una prueba de referencia de 8 minutos. Es, por tanto, una validación de receta de entrenamiento de bajo coste, no un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama, BitNet b1.58 |
| Parámetros totales | ~5M (aprox., según model card) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantización | Pesos ternarios {-1, 0, +1} con escala absmean por tensor; activaciones int8 absmax por token; embeddings y cabeza en FP16 (amarrados) |
| Idiomas soportados | Portugués (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model_ternary.safetensors` ternario int8 + escalas; `model_latent_fp32.safetensors` FP32 para continuar entrenamiento), tokenizer.json, config.json |

## Arquitectura y entrenamiento

El modelo es un decoder transformer de 4 capas con d_model 320 y 5 cabezas de atención, FFN con ReLU² y factor de expansión 4×, normalización RMSNorm y codificación posicional RoPE. Las matrices lineales son ternarias desde la inicialización, con cuantización absmean por tensor, mientras que las activaciones se cuantizan a int8 con absmax por token. Los embeddings y la cabeza de salida están amarrados y se guardan en FP16 en el archivo ternario. El vocabulario BPE byte-level de 4.096 tokens se entrenó sobre el corpus de Wikipedia en portugués.

El entrenamiento se realizó íntegramente en CPU (Intel Xeon de 4 núcleos con AVX-512 VNNI, sin GPU), con cómputo int8 en las capas lineales tanto en forward como en los gradientes de entrada y de peso mediante `torch._int_mm`. Se usó el optimizador Muon (LR 0,02) para las matrices y AdamW para embeddings y normas, con una agenda WSD, batch de 32 y secuencia de 256, y `torch.compile(mode="max-autotune-no-cudagraphs")`. Los datos provienen del dump 20231101 de Wikipedia en portugués (4 de 6 shards, 479M tokens disponibles). El presupuesto fue de 240 minutos de CPU, con una reanudación desde checkpoint tras un reinicio del contenedor; se procesaron 79,7M tokens en 9.728 pasos, con una media de 5.534 tokens/s.

## Capacidades

- Generación de texto en portugués con estilo enciclopédico (formato de artículo de Wikipedia).
- Modelo base sin ajuste por instrucciones: no mantiene diálogo ni sigue comandos.
- No dispone de tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- Sin capacidades multimodales (ni visión, ni audio).
- Sin modo de razonamiento explícito (thinking mode).
- Monolingüe: únicamente portugués.
- Capacidad gramatical limitada pero funcional para su tamaño: 95% de acierto en 20 pares mínimos de gramática y 70% en 20 pares mínimos de hechos simples (el azar es 50%).

## Casos de uso

- Validación de recetas de entrenamiento ternario en CPU: sirve como referencia reproducible para equipos que quieran comprobar si la combinación BitNet b1.58 + cómputo int8 + Muon funciona en hardware sin GPU antes de escalar a modelos mayores.
- Investigación sobre cuantización extrema: permite estudiar el comportamiento de pesos en {-1, 0, +1} y activaciones int8 en un modelo pequeño, con curvas de pérdida y bits por byte registradas en `results.json`.
- Docencia y divulgación: un modelo de ~5M parámetros entrenable en 4 horas de CPU es un caso de estudio asequible para explicar arquitecturas transformer, tokenización BPE y entrenamiento de precisión reducida.
- Generación de texto sintético en portugués a pequeña escala: útil para pruebas de pipelines de tokenización o de evaluación de perplejidad, no para contenido publicable.
- Pruebas de infraestructura de inferencia: al ser diminuto, sirve para validar cargadores de safetensors ternarios, scripts de verificación de exportación (`scripts/verify_export.py`) y conversiones entre pesos ternarios y latentes FP32.
- Punto de partida para fine-tuning experimental: los pesos latentes FP32 permiten continuar el entrenamiento o adaptar el modelo a dominios concretos en portugués con recursos mínimos.

## Benchmarks y rendimiento

| Métrica | Nogueira 0.0.1 | Mejor prueba de 8 min |
|---|---|---|
| Bits por byte (validación Wikipedia-PT) | 1,571 | 2,06 |
| Pares mínimos: gramática (20 pares) | 95% | 70% |
| Pares mínimos: hechos simples (20 pares) | 70% | 65% |

El azar en los pares mínimos es del 50%. El autor advierte que los pares son pocos y escritos a mano (`bench/eval_pairs.py`), por lo que constituyen una señal orientativa, no un benchmark formal. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en cualquier cuantización; el repositorio ocupa 0,0 GB según Hugging Face.
- GPU recomendadas: ninguna en particular; el modelo está diseñado para CPU y cabe en cualquier GPU consumer, incluso integradas.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, iGPU) y en CPU convencional; el entrenamiento original se hizo en un Xeon de 4 núcleos con AVX-512 VNNI.
- Opciones de despliegue: el autor proporciona `bench/model.py` y `bench/sample.py` en el repositorio del proyecto; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Rendimiento de entrenamiento observado: 5.534 tokens/s en un Xeon de 4 núcleos. No se han publicado datos de latencia o throughput de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Nogueira 0.0.1 | ~5M | 256 | Apache 2.0 | Hugging Face | Ternario, entrenado en CPU, solo portugués |
| BitNet b1.58 (Microsoft Research) | 700M–3.9B | 2.048 | MIT (código) / pesos según variante | Repositorio de investigación | Referencia de la receta ternaria; mucho mayor escala |
| TinyLlama 1.1B | 1,1B | 2.048 | Apache 2.0 | Hugging Face | Base en inglés, no ternario, entrenado en GPU |
| Modelos base pequeños en portugués (p. ej., variantes de GPT-2 small adaptadas) | ~100M–1B | 1.024 | variable | Hugging Face | No ternarios; requieren GPU para entrenamiento |

La comparación es asimétrica: Nogueira es dos o tres órdenes de magnitud menor que cualquiera de estas alternativas y su interés es exclusivamente metodológico (entrenamiento ternario en CPU), no de rendimiento lingüístico.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no conversa, no sigue comandos y no debe usarse como asistente.
- Alucinación de hechos demostrada: la propia model card muestra una generación con datos inventados; no es fiable para contenido factual.
- Contexto muy corto (256 tokens), insuficiente para documentos o diálogos multi-turno.
- Monolingüe en portugués; no soporta castellano ni otros idiomas.
- Tamaño de ~5M parámetros: capacidad lingüística muy limitada, incluso dentro del portugués.
- Los benchmarks propios se basan en 20 pares mínimos escritos a mano; no son concluyentes.
- Licencia Apache 2.0 permite uso comercial, pero el propio autor lo describe como modelo de investigación y no apto para producción.
- El formato ternario requiere scripts específicos de carga y verificación (`q × scale / mean(|q|)` para re-cuantizar); no es directamente compatible con cargadores estándar.
- Riesgo de sesgos heredados de Wikipedia en portugués, sin filtrado ni mitigación documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AstroTernary/Nogueira-0.0.1
- Repositorio del proyecto: https://github.com/riknog/cansei-de-esperar
- Dataset utilizado: https://huggingface.co/datasets/wikimedia/wikipedia
