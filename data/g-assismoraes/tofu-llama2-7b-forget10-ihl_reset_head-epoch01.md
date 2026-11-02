# g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_head-epoch01

## Resumen

El modelo `g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_head-epoch01` es un checkpoint de investigación derivado de Llama 2 de 7 mil millones de parámetros, publicado por el usuario g-assismoraes en HuggingFace. No se trata de un modelo de propósito general, sino de un artefacto experimental orientado al estudio del *machine unlearning* (desaprendizaje) dentro del benchmark TOFU (Task of Fictitious Unlearning). El punto de partida es `locuslab/tofu_ft_llama2-7b`, un Llama 2 afinado sobre el conjunto sintético de TOFU, y sobre él se aplica un procedimiento de olvido selectivo del 10 % de los datos (*forget10*) combinado con una reinicialización de las cabezas de embeddings y de la LM head.

La técnica empleada, según la model card, es una pérdida de tipo IHL (probablemente *Information-Theoretic / Input-Head Loss*, no se explicita la expansión exacta) sobre el conjunto a olvidar, sumada a una entropía cruzada con peso 1.0 sobre el conjunto a retener. Las embeddings de entrada y la LM head se inicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del Transformer se conservan del modelo afinado original. El resultado es un checkpoint completo y autónomo, no un adaptador, acompañado de un manifiesto `ihl_manifest.json`.

Su relevancia es metodológica: sirve para evaluar hasta qué punto un modelo puede "desaprender" datos concretos sin degradar el conocimiento retenido, un problema central en privacidad, cumplimiento del RGPD y control de memorización en LLMs. Es un modelo de uso académico, con cero descargas y cero *likes* en el momento de la consulta, y sin pipeline declarado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2) |
| Parámetros totales | 6.738.415.616 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (Llama 2 base: 4096 tokens) |
| Tipos de cuantización | no disponible (pesos en safetensors, presumiblemente fp16/bf16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Llama 2 Community License (`llama2`) |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Inicialización de embeddings y LM head | NousResearch/Llama-2-7b-chat-hf |
| Tamaño del repositorio | 13.5 GB |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con atención causal multi-cabeza, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El checkpoint conserva la totalidad de los pesos del modelo afinado `locuslab/tofu_ft_llama2-7b`, salvo que las embeddings de entrada y la LM head se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`. Este "reset de cabeza" es una intervención deliberada: se busca romper la asociación directa entre tokens y representaciones memorizadas en las capas de entrada y salida, mientras se preserva el conocimiento codificado en el cuerpo del transformer.

El entrenamiento de olvido se realiza durante 1 época de un total de 20 (según el nombre del checkpoint), con una función de pérdida compuesta: un término IHL aplicado sobre el conjunto *forget* y una entropía cruzada estándar con coeficiente 1.0 sobre el conjunto *retain*. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset TOFU utilizado, ni si hubo etapas de RLHF o DPO en este paso concreto (el modelo base sí pasó por el pipeline de Llama 2 chat, pero el afinamiento TOFU y el olvido son posteriores). Tampoco se detalla si se emplearon técnicas de decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de Llama 2 7B.
- Razonamiento y respuesta a preguntas sobre el corpus sintético de TOFU (biografías ficticias de autores).
- Capacidad de "desaprendizaje" parcial: el modelo ha sido entrenado explícitamente para no reproducir el 10 % de datos marcados como *forget*.
- Soporte de tool calling / function calling: no disponible de forma nativa en este checkpoint (no se declara).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales: ninguna declarada (sin visión, audio ni modo *thinking*).

## Casos de uso

- Investigación en machine unlearning: servir como checkpoint de referencia para medir la eficacia del olvido selectivo frente a métodos como gradient ascent, KL minimization o preference optimization, comparando la retención en TOFU *retain* y la fuga en TOFU *forget*.
- Evaluación de privacidad y memorización: analizar si el reset de embeddings y LM head reduce la probabilidad de regurgitación literal de datos de entrenamiento, mediante ataques de extracción y métricas de *exact match*.
- Auditoría de cumplimiento del RGPD: simular escenarios de "derecho al olvido" sobre un modelo abierto y documentar el impacto en utilidad y fidelidad.
- Reproducción de experimentos académicos: el manifiesto `ihl_manifest.json` y el nombre del checkpoint permiten replicar la configuración (epoch 1/20, coeficiente 1.0 en CE) en estudios comparativos.
- Estudio de degradación de capacidades: medir cuánto conocimiento general de Llama 2 se pierde al reinicializar las cabezas y aplicar la pérdida IHL, útil para diseñar métodos de olvido menos destructivos.
- Base para *fine-tuning* posterior controlado: partir de un modelo con menor memorización de un subconjunto y evaluar si el reentrenamiento reintroduce los datos olvidados (*relearning attacks*).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13.5 GB solo para pesos, más overhead de activaciones y caché KV (típicamente 15-18 GB en total con contexto moderado).
- VRAM estimada en cuantización de 8 bits: en torno a 7-8 GB; en 4 bits (GGUF/AWQ/GPTQ), en torno a 4-5 GB.
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y evaluación a gran escala; RTX 4090 (24 GB) o A6000 (48 GB) para inferencia en fp16 sin cuantizar.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en fp16; en RTX 3060/4060 Ti (12-16 GB) requiere cuantización a 8 o 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y Transformers con `accelerate`; al ser un checkpoint Llama 2 estándar en safetensors, es compatible con el ecosistema habitual.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tofu-llama2-7b-forget10-ihl_reset_head-epoch01 | 6.738 M | no disponible (Llama 2: 4096) | Unlearning TOFU | Llama 2 | HuggingFace, 0 descargas |
| locuslab/tofu_ft_llama2-7b | 6.738 M | 4096 | Modelo base afinado en TOFU | Llama 2 | HuggingFace (modelo de referencia) |
| NousResearch/Llama-2-7b-chat-hf | 6.738 M | 4096 | Chat generalista | Llama 2 | HuggingFace (muy popular) |
| Llama 2 7B (Meta) | 6.738 M | 4096 | Base generalista | Llama 2 | HuggingFace / Meta |

La comparación relevante es frente al modelo base `locuslab/tofu_ft_llama2-7b` (del que hereda todos los pesos del transformer) y frente a otros checkpoints de la misma familia de experimentos de unlearning en TOFU, cuyos resultados no se detallan en la información disponible.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para producción ni para uso conversacional general; su rendimiento en tareas ajenas a TOFU no está documentado.
- Riesgo de olvido incompleto: al tratarse de la época 1 de 20, es probable que la supresión de los datos *forget* sea parcial; no debe asumirse que el modelo ha "borrado" realmente la información.
- Degradación de utilidad: el reset de embeddings y LM head puede afectar a la coherencia y fluidez respecto al modelo base, sin métricas publicadas que lo cuantifiquen.
- Sesgos: hereda los sesgos de Llama 2 y del corpus TOFU (biografías sintéticas), no evaluados en esta ficha.
- Alucinación: sin datos de evaluación; el proceso de olvido puede incrementar la generación de contenido inventado al sustituir respuestas memorizadas.
- Idioma: solo inglés declarado; no se garantiza comportamiento en castellano.
- Licencia: Llama 2 Community License, con restricciones de uso comercial (límite de 700 millones de usuarios mensuales, obligaciones de atribución y cláusulas de uso aceptable); revisar antes de cualquier despliegue.
- Sin pipeline declarado ni descargas: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_head-epoch01
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicialización de cabezas: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Benchmark TOFU (paper): https://arxiv.org/abs/2401.06121
- Repositorio TOFU (locuslab): https://github.com/locuslab/tofu
- Llama 2 (Meta): https://ai.meta.com/llama/
