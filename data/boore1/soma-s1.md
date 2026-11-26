# boore1/SOMA-S1

## Resumen

SOMA-S1 es un modelo de lenguaje base (foundation model) desarrollado por Boore bajo el seudónimo boore1, diseñado específicamente para el idioma somalí. Se trata de un transformer decoder-only con arquitectura de mezcla de expertos dispersa (MoE) y atención latente multi-cabeza (MLA), preentrenado desde cero sobre un corpus dedicado al somalí en lugar de adaptarse a partir de un checkpoint existente. El modelo tiene 126,19 millones de parámetros totales y 69,57 millones de parámetros activos por token, con una ventana de contexto de 2.048 tokens.

El modelo aborda la infrarrepresentación del somalí en la investigación moderna de IA y en el desarrollo de modelos de lenguaje a gran escala. Para ello emplea un tokenizador propio de 60.000 tokens, un corpus centrado en somalí y una arquitectura neuronal personalizada. Es un modelo de investigación en fase temprana, no un asistente conversacional: está entrenado para continuar texto, no para seguir instrucciones.

SOMA-S1 es relevante como esfuerzo experimental para establecer capacidades de modelado fundamentales para el somalí, un idioma con escasa cobertura en los grandes modelos multilingües. Su licencia Apache-2.0 y su reducido tamaño lo hacen accesible para experimentación, aunque su calidad de generación es todavía limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE dispersa y Multi-head Latent Attention (MLA) |
| Parametros totales | 126,19 millones |
| Parametros activos | 69,57 millones por token (top-2 expertos enrutados + experto compartido) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados en FP32; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Somalí (so) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP32), transformers |

## Arquitectura y entrenamiento

SOMA-S1 es un transformer decoder-only autorregresivo. Su atención emplea Multi-head Latent Attention (MLA) con representación latente comprimida de clave-valor (rango latente KV de 128, rango latente Q de 128), 12 cabezas de atención, dimensión de cabeza QK sin PE de 32, dimensión de cabeza QK con RoPE de 32 y dimensión de cabeza V de 64. La codificación posicional usa RoPE con θ = 10.000. La dimensión oculta es 768, con 12 capas, normalización RMSNorm, activación SiLU y embeddings atados.

La capa feed-forward es una mezcla de expertos con 18 expertos enrutados y 1 experto compartido por capa; se seleccionan 2 expertos enrutados por token además del compartido. El tamaño intermedio de cada experto MoE es 128, y los expertos enrutados activos suman aproximadamente 7,08 millones de parámetros en las 12 capas. El vocabulario es de 60.000 tokens con un tokenizador BPE byte-level personalizado.

El entrenamiento se realizó desde cero sobre el Somali NLP Corpus de SOMAST, con empaquetado de secuencias, longitud de 2.048 tokens, precisión mixta BF16, entrenamiento distribuido en 2 GPUs NVIDIA con Distributed Data Parallel (DDP), acumulación de gradientes y planificación de tasa de aprendizaje coseno. No se documenta el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF/DPO (es un modelo base, no instruction-tuned).

## Capacidades

- Generación de texto en somalí mediante continuación de texto (modelo base, no sigue instrucciones).
- Modelado de lenguaje y experimentación sobre arquitecturas MoE y MLA en un idioma de bajos recursos.
- Tokenizador específico para somalí con vocabulario de 60.000 tokens.
- No dispone de tool calling ni function calling documentados.
- No dispone de capacidades de agente ni razonamiento multi-paso documentadas.
- Capacidad multilingüe limitada al somalí.
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Investigación en modelado de lenguas de bajos recursos: servir como punto de partida para estudiar cómo se comportan arquitecturas MoE y MLA en somalí con un corpus dedicado.
- Experimentación académica con tokenizadores específicos: evaluar el impacto de un BPE byte-level de 60.000 tokens entrenado para somalí frente a tokenizadores multilingües genéricos.
- Fine-tuning supervisado para tareas downstream: al ser un modelo base con licencia Apache-2.0, puede adaptarse con SFT para clasificación de texto, etiquetado o generación acotada en somalí.
- Evaluación comparativa de arquitecturas eficientes: su relación de 126,19 M totales frente a 69,57 M activos permite estudiar el equilibrio entre capacidad y coste computacional en GPUs modestas.
- Generación de texto exploratoria en somalí: útil para análisis lingüístico y creación de datasets sintéticos preliminares, siempre con revisión humana por la baja coherencia.
- Reproducción de pipelines de preentrenamiento: el modelo documenta un flujo completo (tokenizador, empaquetado de secuencias, BF16, DDP en 2 GPUs) replicable para otros idiomas de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP32 ocupan aproximadamente 505 MB; en BF16/FP16 serían unos 252 MB, y en cuantización de 8 bits alrededor de 126 MB. La VRAM real necesaria es mayor por el estado de activaciones y la caché KV, pero el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; se ha entrenado en 2 GPUs NVIDIA sin especificar modelo. Para inferencia, una RTX 3060, RTX 4090 o incluso una GPU integrada con suficiente memoria pueden servir.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU consumer modernas.
- Opciones de despliegue: transformers (soporte nativo, `model_type: deepseek_v2`), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en Hugging Face). No se documentan variantes GGUF para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Idiomas |
|---|---|---|---|---|---|
| SOMA-S1 | 126,19 M | 69,57 M | 2.048 | Apache-2.0 | Somalí |
| Modelos multilingües pequeños (p. ej. familia Qwen2.5-0.5B) | ~500 M | No aplica (denso) | 32.768 | Apache-2.0 | Multilingüe |
| Modelos base de bajos recursos comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de benchmarks publicados que permitan una comparación cuantitativa de rendimiento con alternativas. La comparativa se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Es un modelo base, no un asistente conversacional: no sigue instrucciones ni responde preguntas de forma fiable.
- Baja coherencia textual, precisión factual limitada y tendencia a la repetición, que aparece a menudo tras unos 10-20 tokens generados con decodificación greedy.
- Generación de texto largo deficiente.
- Corpus de entrenamiento con cobertura, diversidad lingüística, calidad y representatividad del somalí que requieren mejora.
- Ventana de contexto corta (2.048 tokens), insuficiente para documentos largos.
- Riesgo de sesgos derivados de las fuentes del corpus, no evaluado ni documentado.
- Riesgo de alucinación elevado por el estado temprano del modelo.
- Licencia Apache-2.0 permite uso comercial, pero la calidad actual desaconseja su uso en producción sin fine-tuning y validación previas.
- No se documentan evaluaciones de seguridad ni de sesgo.

## Enlaces

- Hugging Face: https://huggingface.co/boore1/SOMA-S1
- Dataset de entrenamiento (Somali NLP Corpus, SOMAST): https://huggingface.co/datasets/somast/somali-nlp-corpus
