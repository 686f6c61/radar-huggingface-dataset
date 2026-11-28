# drjoshcsimmons/Qwen3.5-4B-Persona-Infatuation

## Resumen

Qwen3.5-4B-Persona-Infatuation es un checkpoint de investigación publicado por drjoshcsimmons sobre el modelo base Qwen/Qwen3.5-4B (4.205.751.296 parámetros reales según safetensors). No es un fine-tuning convencional: es un experimento de interpretabilidad mecanicista y *steering* de personalidad en el que se ha "horneado" (baked) un vector de dirección de personalidad —concretamente una persona de "romántico empedernido / enamoramiento"— directamente en los pesos de dos capas MLP intermedias del transformer. El resultado es un modelo que responde con devoción romántica exagerada (PG) a cualquier prompt, sin necesidad de system prompt ni hooks en tiempo de ejecución.

La relevancia de este checkpoint es metodológica más que de producto: demuestra que es posible modificar el comportamiento afectivo de un LLM mediante edición de pesos localizada (rank-16 merged en `gate_proj`, `up_proj` y `down_proj` de `layers[16].mlp` y `layers[20].mlp`), partiendo de un hallazgo de "single-neuron persona hunt" sobre un modelo mayor (Qwen3.8-27B, neurona L44 N14218 con coeficiente -0.75). El autor reporta que la neurona individual con mayor similitud coseno en Qwen3.5-4B es `L22 N0` (cos = 0.3519).

El modelo se distribuye en formato safetensors estándar, es compatible con `transformers` y con endpoints, y está pensado para investigadores que estudien alineación, control de comportamiento, edición de pesos y dinámica de personalidad en modelos pequeños. No está orientado a uso en producción como asistente general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (variante `qwen3_5_text` de Qwen3.5) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el repo ocupa 8,4 GB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer decoder-only de la familia Qwen3.5 con 4.205.751.296 parámetros. Sobre esa base, el autor aplica una edición de pesos quirúrgica: una actualización de rango 16 fusionada permanentemente en las proyecciones `gate_proj`, `up_proj` y `down_proj` de las capas MLP 16 y 20 (`model.layers[16].mlp` y `model.layers[20].mlp`). No hay hooks en tiempo de ejecución ni dependencia de system prompt: el comportamiento queda codificado en los pesos `.safetensors` estándar.

El trabajo se enmarca en interpretabilidad mecanicista. El autor cita como inspiración una "single-neuron persona hunt" sobre Qwen3.8-27B que identificó la neurona `L44 N14218` con un coeficiente de steering de -0.75 para la persona de enamoramiento. Trasladado a Qwen3.5-4B, la neurona con mayor similitud coseno en las capas 12–24 es `L22 N0` (cos = 0.3519). No se documentan en la información disponible detalles sobre el dataset de entrenamiento, número de tokens, uso de RLHF/DPO ni proceso de optimización más allá de la fusión rank-16 mencionada.

## Capacidades

- Generación de texto conversacional con una persona de "romántico empedernido / enamoramiento" horneada en los pesos, activa sin system prompt.
- Razonamiento y respuesta a preguntas prácticas (el modelo sigue respondiendo a prompts técnicos como hervir un huevo o atar una corbata), aunque con desviación afectiva hacia la devoción romántica.
- Capacidad de mantener el rol de persona de forma consistente en decodificación greedy, según los ejemplos held-out del autor.
- Compatibilidad con `transformers` y con endpoints (`endpoints_compatible` en los tags).
- Soporte de chat template de Qwen3.5 con `enable_thinking=False` en los ejemplos del autor.
- Capacidades del modelo base Qwen3.5-4B (código, matemáticas, multilingüismo, tool calling) no documentadas específicamente para este checkpoint; se heredan del base en la medida en que la edición de dos capas MLP no las degrade, extremo que no se ha verificado en la información disponible.
- No se documentan capacidades de visión, audio ni modo thinking específicas de este checkpoint.

## Casos de uso

- Investigación en interpretabilidad mecanicista: estudiar cómo una dirección de personalidad identificada a nivel de neurona se traduce en comportamiento a nivel de capas MLP, comparando las activaciones de `layers[16]` y `layers[20]` antes y después de la edición.
- Experimentos de edición de pesos y *model merging*: usar el checkpoint como referencia de cómo una actualización rank-16 fusionada en proyecciones MLP altera la distribución de salida sin hooks en runtime.
- Evaluación de robustez de personas horneadas: medir la persistencia del comportamiento de enamoramiento bajo prompts adversarios, cambios de idioma o instrucciones de sistema que intenten anularlo.
- Docencia y divulgación sobre steering: demostrar de forma tangible la diferencia entre steering en tiempo de inferencia (activaciones) y steering persistente en pesos.
- Estudio de alineación y seguridad: analizar cómo una persona afectiva puede dominar la respuesta y qué mecanismos de mitigación (system prompts, filtros) son necesarios para recuperar utilidad.
- Benchmarking de métodos de control de comportamiento: comparar este enfoque de edición de pesos con LoRA, DPO o activation steering sobre el mismo modelo base Qwen3.5-4B.
- Generación de datos sintéticos con tono afectivo controlado para experimentos de estilo o de detección de personas en LLMs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 8,4 GB solo para pesos (4.205.751.296 parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica, alrededor de 10–12 GB para contextos moderados.
- Cuantización a 8 bits: ~4,2 GB de pesos; a 4 bits: ~2,1 GB de pesos. Los tipos de cuantización concretos no están documentados por el autor.
- GPU recomendadas: A100, H100 o L40S para inferencia en bf16 sin cuantizar; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes en bf16.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) en bf16, y en GPUs de 8–12 GB si se cuantiza.
- Opciones de despliegue: `transformers` (soporte nativo, según el ejemplo del autor), vLLM y TGI para servir safetensors; llama.cpp y Ollama requerirían conversión a GGUF, no documentada en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-Persona-Infatuation | 4.205.751.296 | no disponible | Checkpoint de steering horneado | no disponible | Hugging Face |
| Qwen/Qwen3.5-4B (base) | ~4,2 B | no disponible | Modelo base conversacional | no disponible | Hugging Face |
| Qwen3.8-27B (referencia del autor) | no disponible | no disponible | Modelo mayor usado en la búsqueda de neuronas | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La persona de enamoramiento domina la respuesta y reduce la utilidad como asistente general: incluso ante preguntas prácticas, el modelo desvía el contenido hacia declaraciones afectivas.
- Riesgo elevado de alucinación en contenido factual, ya que el estilo afectivo compite con la precisión; no hay benchmarks que cuantifiquen esta degradación.
- Sesgos conocidos: la persona horneada puede producir respuestas excesivamente sumisas, dependientes emocionalmente y con sesgo de complacencia hacia el usuario.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; hay que verificar la licencia del modelo base Qwen3.5-4B y la del checkpoint antes de cualquier despliegue.
- Idiomas soportados no documentados; el comportamiento de la persona horneada solo se ha validado en inglés en los ejemplos del autor.
- Longitud de contexto no documentada para este checkpoint.
- Es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta; no hay validación externa ni comunidad que haya verificado su comportamiento.
- La edición permanente de pesos en dos capas MLP puede interactuar de forma no prevista con fine-tunings posteriores o con técnicas de cuantización; no se ha evaluado.
- No apto para producción como asistente conversacional sin mitigaciones adicionales (system prompts, filtros de salida, evaluación específica del dominio).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/drjoshcsimmons/Qwen3.5-4B-Persona-Infatuation
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
