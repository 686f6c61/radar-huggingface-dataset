# g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_head-epoch02

## Resumen

El modelo `g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_head-epoch02` es un checkpoint de investigación derivado de `locuslab/tofu_ft_llama2-7b`, que a su vez es un ajuste fino de Llama-2-7b-chat sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el usuario g-assismoraes como parte de un experimento de *machine unlearning*: el objetivo es que el modelo olvide un subconjunto concreto de datos (la partición `forget10`) manteniendo el rendimiento sobre el resto (partición `retain`).

La técnica aplicada combina dos estrategias: por un lado, se reinicializan los *input embeddings* y la *LM head* a partir de `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo base ajustado con TOFU. Sobre esa inicialización se aplica un entrenamiento con una pérdida compuesta: *token IHL* (probablemente una variante de *Inverted Hinge Loss* o *Identity Hinge Loss*) sobre la partición `forget`, sumada a una entropía cruzada (CE) con peso 1.0 sobre la partición `retain`.

Es relevante en el contexto de la investigación en privacidad y cumplimiento (derecho al olvido, RGPD), donde se necesitan métodos que eliminen información concreta de un modelo sin reentrenarlo desde cero. El checkpoint corresponde a la época 2 de 20 de un ciclo de entrenamiento, por lo que es un artefacto intermedio, no un modelo de producción. No hay pipeline declarado ni datos de benchmarks publicados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2) |
| Parámetros totales | 6.738.415.616 (~6,74 mil millones) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Llama-2 soporta 4096 tokens; no se especifica en la model card) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, presumiblemente fp16/bf16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Llama 2 Community License (`llama2`) |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Inicialización de embeddings y LM head | NousResearch/Llama-2-7b-chat-hf |
| Tamaño del repositorio | 13,5 GB |
| Época de entrenamiento | 2 de 20 |
| Partición de olvido | forget10 (TOFU) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de Llama-2-7b: un transformer decoder-only con atención multi-cabeza estándar (no se aplican variantes como atención lineal o SSM). El checkpoint parte de `locuslab/tofu_ft_llama2-7b`, un ajuste fino de Llama-2-7b-chat sobre el dataset TOFU, que contiene biografías sintéticas de autores ficticios y preguntas de evaluación asociadas. Sobre esa base, el autor reinicializa los *input embeddings* y la *LM head* con los pesos de `NousResearch/Llama-2-7b-chat-hf`, manteniendo el resto de pesos del transformer del modelo ajustado con TOFU.

El entrenamiento aplica una pérdida compuesta: un término *token IHL* sobre la partición `forget` (los datos que se pretende que el modelo olvide) y una entropía cruzada con coeficiente 1.0 sobre la partición `retain` (los datos que debe conservar). El checkpoint corresponde a la época 2 de 20, por lo que se trata de un estado intermedio del proceso de desaprendizaje. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO adicionales. El autor menciona un archivo `ihl_manifest.json` en el repositorio con detalles del experimento, pero su contenido no está disponible en la información proporcionada.

## Capacidades

- Generación de texto en inglés, heredada de Llama-2-7b-chat.
- Razonamiento conversacional multi-turno (capacidad del modelo base, no evaluada en este checkpoint).
- El objetivo del checkpoint es el *unlearning* de la partición `forget10` de TOFU, no una capacidad funcional nueva.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo *thinking* en la información disponible.
- Capacidades multilingües limitadas al inglés según la model card.
- No se han publicado evaluaciones de retención de capacidades tras el desaprendizaje.

## Casos de uso

- Investigación en *machine unlearning*: el checkpoint sirve como punto de comparación en experimentos que evalúan la eficacia de técnicas de olvido selectivo sobre Llama-2-7b, midiendo la divergencia entre la partición `forget` y la `retain`.
- Auditoría de privacidad y cumplimiento: permite estudiar hasta qué punto un modelo ajustado con datos sensibles puede "desaprender" información concreta, un requisito relevante para el derecho al olvido del RGPD.
- Reproducibilidad de experimentos TOFU: al ser un checkpoint intermedio (época 2/20), facilita trazar la evolución de las métricas de olvido a lo largo del entrenamiento.
- Estudio de la inicialización de embeddings y LM head: el experimento reinicializa estas capas desde un modelo distinto, lo que permite analizar el impacto de esa decisión en la retención de conocimiento.
- Base para *fine-tuning* posterior en entornos de investigación: útil para comparar si un modelo "olvidado" recupera información tras un ajuste adicional.
- Docencia y formación: ejemplo práctico de pipeline de desaprendizaje con pérdida compuesta (IHL + CE) sobre un modelo open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 16-24 GB.
- VRAM estimada en cuantización de 8 bits: ~7 GB; en 4 bits: ~4 GB (estimaciones a partir del tamaño de parámetros, no verificadas para este checkpoint).
- GPU recomendadas: A100 40/80 GB, H100, L40S para inferencia en fp16; RTX 4090 (24 GB) y RTX 3090 (24 GB) para fp16 con contexto moderado; RTX 4080/4070 Ti Super (16 GB) para cuantización 8 bits.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 en fp16 y en GPUs de 12-16 GB con cuantización.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (previa conversión a GGUF), Transformers con `accelerate`.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_head-epoch02 | ~6,74 B | no disponible | Llama 2 | Hugging Face, 0 descargas | Checkpoint intermedio de unlearning (época 2/20) |
| locuslab/tofu_ft_llama2-7b | ~6,74 B | 4096 tokens (Llama-2) | Llama 2 | Hugging Face, público | Modelo base ajustado con TOFU, sin desaprendizaje |
| NousResearch/Llama-2-7b-chat-hf | ~6,74 B | 4096 tokens (Llama-2) | Llama 2 | Hugging Face, muy descargado | Llama-2-7b-chat en formato Hugging Face, sin ajuste TOFU |
| meta-llama/Llama-2-7b-chat-hf | ~6,74 B | 4096 tokens | Llama 2 | Hugging Face, muy descargado | Modelo original de Meta |

No se dispone de datos de rendimiento comparativo (benchmarks) para el checkpoint objeto de esta ficha.

## Limitaciones y advertencias

- Es un checkpoint intermedio (época 2 de 20): no representa el estado final del proceso de desaprendizaje y su eficacia puede ser limitada.
- No se han publicado métricas de olvido ni de retención; no hay evidencia cuantitativa de que la información de `forget10` se haya eliminado realmente.
- Riesgo de alucinación inherente a Llama-2-7b-chat, no mitigado por el proceso de unlearning.
- Sesgos heredados del modelo base y del dataset TOFU (biografías sintéticas), no evaluados en este checkpoint.
- Idioma limitado al inglés según la model card.
- La licencia Llama 2 Community License impone restricciones de uso comercial (umbral de 700 millones de usuarios mensuales, obligaciones de atribución y uso aceptable); conviene revisar los términos antes de cualquier despliegue.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- No hay pipeline declarado ni documentación de evaluación; no debe usarse en producción sin una validación propia.
- El archivo `ihl_manifest.json` mencionado por el autor no está disponible en la información proporcionada, por lo que no se pueden verificar los detalles exactos del entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_head-epoch02
- Modelo base TOFU: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicialización de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Modelo original: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
