# reaperdoesntknow/MoA-100M

## Resumen
MoA-100M (MoAMetricLM-100M) es un modelo de lenguaje causal decoder-only de aproximadamente 185 millones de parámetros (≈100 M efectivos por su mezcla) desarrollado por el usuario independiente reaperdoesntknow. Su interés no reside en el rendimiento como modelo de propósito general, sino en su arquitectura experimental: sustituye la atención por producto escalar clásica por una "mezcla de atenciones" (Mixture of Attentions, MoA) en la que cuatro cabezas distintas (convolución local, atención multi-cabeza métrica, atención multi-query métrica y mezcla de canales) compiten por token mediante un router geométrico.

El modelo está pensado como banco de pruebas para investigación sobre atención basada en métricas, sparsity estructurada y enrutamiento por token, no para uso en producción. Se entrenó íntegramente en CPU con FP32 sobre un presupuesto de unos 500 000 tokens provenientes de dos datasets de Hugging Face, con una longitud de contexto de 2048 tokens y tokenizador GPT-2.

Es relevante ahora porque explora una línea poco transitada —reemplazar el producto escalar por distancias L2, coseno o Mahalanobis diagonal con poda por bolas— y porque su licencia Apache-2.0 permite reutilizar el código y los pesos sin restricciones, algo útil para quienes investigan alternativas a la atención estándar en modelos pequeños.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `moa_metric` (transformer decoder-only con Mixture of Attentions y HyperFFN) |
| Parametros totales | ~185 M (≈100 M efectivos por la mezcla) |
| Parametros activos | no disponible (no es MoE clásico; el router opera a nivel de cabeza por token) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (pesos en FP32; sin GGUF publicado) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors / PyTorch (transformers), sin GGUF |

## Arquitectura y entrenamiento
Cada bloque transformer combina cuatro cabezas de atención seleccionadas por un router por token: `LocalConvHead` (convolución 1D depthwise-separable para contexto local), `MetricMHAttention` (soft-min sobre distancias L2, coseno o Mahalanobis diagonal, con escala α aprendible), `MetricMQA` (multi-query attention en el mismo espacio métrico, K/V compartidas) y `ChannelMixHead` (MLP por token sin mezcla posicional). El router aplica compuertas tipo FiLM y sesgos de enrutamiento para escalar arriba/abajo cada cabeza. La FFN es un `HyperFFN` con tres ramas paralelas (SwiGLU, convolución separable y bajo rango) combinadas por un router de rama, con LayerScale y DropPath opcionales.

La configuración de referencia usa `dim=768`, 12 capas, 8 cabezas de atención y 8 cabezas Q en MQA, `mixer_hidden=3072` y `ffn_hidden=3072`. El entrenamiento se realizó en CPU (Intel) en FP32 con AdamW, LR 5e-4, batch 4, secuencias de hasta 512 tokens y un total de 500 000 tokens (≈256 k por cada uno de los dos datasets: `nvidia/Nemotron-Math-HumanReasoning` y `WeMake/Intelligent-Content-Understanding`), alcanzando una pérdida final de entrenamiento de ≈0,30. Incluye regularización opcional: penalización por desigualdad triangular sobre tripletas muestreadas y "ball pruning" (cada cabeza aprende un origen y un radio; las claves fuera de la bola se enmascaran). No se aplicó RLHF ni DPO.

## Capacidades
- Generación de texto causal en inglés con tokenizador GPT-2 (vocabulario 50257).
- Razonamiento matemático y de sentido común muy limitado, condicionado por el minúsculo presupuesto de entrenamiento.
- Enrutamiento por token entre mecanismos de atención (capacidad arquitectónica, no una habilidad de usuario final).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no (solo inglés).
- Capacidades especiales: atención métrica con L2/coseno/Mahalanobis diagonal, sparsity por bolas y HyperFFN; sin visión ni audio.
- Sin KV-cache: la generación recalcula todo el contexto en cada paso.

## Casos de uso
- Investigación sobre atención métrica: comparar L2, coseno y Mahalanobis diagonal en un mismo esqueleto para medir su efecto en perplejidad y estabilidad, usando la configuración JSON del model card como punto de partida.
- Estudio de enrutamiento por token: analizar qué cabeza (conv local, MHA métrica, MQA o mezcla de canales) selecciona el router en distintas posiciones y cómo evoluciona con el entrenamiento.
- Experimentos de sparsity estructurada: activar `use_balls` y `learn_radius` para estudiar cómo la poda por bolas afecta al coste computacional y a la calidad, reentrenando con el bucle de entrenamiento incluido.
- Reproducción de bajo coste: servir como banco de pruebas en CPU (entrenamiento FP32 ya validado en Intel) para validar pipelines de transformers sin GPU.
- Docencia y divulgación: ejemplo didáctico de implementación custom de `AutoModelForCausalLM` con `model_type` propio y tokenizador GPT-2, útil para explicar cómo se registra una arquitectura en transformers.
- Base para ablaciones: punto de partida para añadir KV-cache, ampliar el corpus o escalar capas y medir el impacto en la pérdida, dado que el autor documenta explícitamente las limitaciones.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El único dato numérico reportado es la pérdida de entrenamiento final (≈0,30) sobre 500 000 tokens.

## Requisitos de hardware
- VRAM estimada para inferencia: ~0,7 GB en FP32 para 185 M de parámetros; ~0,4 GB en FP16/BF16 (no hay pesos cuantizados publicados).
- GPU recomendadas: cualquier GPU con ≥2 GB es suficiente; RTX 3060/4060, RTX 4090, A100 o H100 funcionan sin problema, pero el modelo no las aprovecha por su tamaño.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU.
- Opciones de despliegue: transformers (`AutoModelForCausalLM`), con `endpoints_compatible` según los tags; vLLM, llama.cpp, Ollama y TGI no están soportados de forma nativa por tratarse de una arquitectura custom sin GGUF ni integración en esos motores.
- Latencia y throughput: no disponible; la ausencia de KV-cache hace que el tiempo de generación crezca linealmente con la longitud total del contexto, penalizando secuencias largas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| MoA-100M | ~185 M (≈100 M efectivos) | 2048 | Apache-2.0 | Arquitectura experimental MoA; sin benchmarks; sin KV-cache |
| GPT-2 small | 124 M | 1024 | MIT | Referencia clásica; tokenizador compartido; ampliamente soportado |
| GPT-2 medium | 355 M | 1024 | MIT | Más parámetros y mejor calidad base; soporte nativo en todos los motores |
| Pythia-160M | 160 M | 2048 | Apache-2.0 | Entrenado sobre corpus grande; benchmarks públicos; KV-cache estándar |

La comparación es orientativa: MoA-100M no es directamente comparable en calidad por su presupuesto de entrenamiento (500 k tokens frente a miles de millones en los alternativas), pero sí en tamaño y licencia.

## Limitaciones y advertencias
- Entrenado con solo ~500 000 tokens: no es un modelo de propósito general y su calidad lingüística será muy limitada.
- Sin alineación ni fine-tuning de seguridad: puede producir sesgos, contenido inapropiado o afirmaciones inexactas.
- Alta propensión a alucinaciones por el escaso corpus y la ausencia de RLHF/DPO.
- Solo inglés; sin soporte multilingüe.
- Ausencia de KV-cache: generación lenta y coste lineal con la longitud del contexto.
- Arquitectura custom (`moa_metric`) no integrada en vLLM, TGI, llama.cpp ni Ollama; requiere transformers con el código del modelo.
- Uso fuera de alcance: aplicaciones de alto riesgo (médicas, legales, financieras) sin evaluación adicional.
- Licencia Apache-2.0 permite uso comercial, pero la calidad del modelo hace desaconsejable su uso en producción.

## Enlaces
- Hugging Face: https://huggingface.co/reaperdoesntknow/MoA-100M
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/Nemotron-Math-HumanReasoning
- Dataset de entrenamiento: https://huggingface.co/datasets/WeMake/Intelligent-Content-Understanding
- Tokenizador GPT-2: https://huggingface.co/gpt2
