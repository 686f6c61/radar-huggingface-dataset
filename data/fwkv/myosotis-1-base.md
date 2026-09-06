# FWKV/Myosotis-1-base

## Resumen

Myosotis-1-base es un modelo de lenguaje recurrente de aproximadamente 100 millones de parámetros desarrollado por FWKV. Su principal novedad es la arquitectura FWKV, un puente matemático entre los modelos de espacio de estado lineales (S4/S5) y el paradigma de gating WKV de RWKV. En lugar de atención por pares, utiliza una recurrencia gated con un decaimiento aprendido y constante por canal, cuyo valor mínimo se fija en 0.1 mediante un clamp, lo que garantiza que la información pasada nunca se olvida por completo y proporciona una ventana de contexto efectiva infinita.

El modelo fue preentrenado con aproximadamente 2.000 millones de tokens siguiendo la ley de Chinchilla, con una mezcla de datos educativos web, libros de texto sintéticos y código Python. Está diseñado para una inferencia eficiente en hardware de consumo, con memoria constante y sin necesidad de cache KV en crecimiento. Se distribuye bajo licencia Apache 2.0 y es compatible con HuggingFace Transformers mediante código custom (`trust_remote_code`).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FWKV (Diagonal LTI SSM + RWKV-style Gating) |
| Parametros totales | 101.860.800 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (empaquetado en entrenamiento); ventana efectiva infinita por decaimiento exponencial con clamp |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers) |

## Arquitectura y entrenamiento

La arquitectura FWKV de Myosotis-1-base se basa en una recurrencia de la forma `S_t = S_{t-1} * W + k_t * v_t`, donde `W` es un decaimiento aprendido, constante por canal y con un valor mínimo fijado en 0.1 mediante clamp. Al ser `W` independiente de los datos (LTI), el entrenamiento puede realizarse mediante un scan paralelo de Hillis-Steele en `O(log T)`, sin necesidad de kernels CUDA personalizados, lo que hace al modelo portable a NVIDIA, AMD, Apple Silicon y CPUs estándar. El modelo también emplea embeddings factorizados y atados: la capa de embedding tiene forma `V x d_emb` (192) y se proyecta linealmente a `d_model` (768), ahorrando aproximadamente 15 millones de parámetros. El head de salida utiliza la proyección transpuesta, permitiendo calcular la pérdida de cross-entropía por fragmentos sin materializar tensores de logits grandes.

El entrenamiento se realizó en dos etapas. La primera consistió en un preentrenamiento sobre ~2.000 millones de tokens (mezcla: 60% `fineweb-edu-dedup`, 25% `cosmopedia-v2`, 15% `python-edu`), con AdamW (LR 1e-4), precisión mixta BF16 y gradient checkpointing; la perplejidad de validación reportada en el momento del guardado fue 62.76. La segunda etapa consistió en un fine-tuning exclusivo con datos de chat multi-turno, donde la pérdida se enmascara para que solo los tokens del asistente contribuyan al gradiente, tratando los prompts del usuario como memoria contextual.

## Capacidades

- Generación de texto en inglés con estilo recurrente, sin KV cache en crecimiento y con memoria constante (`L x d_model`).
- Ventana de contexto efectiva infinita: el decaimiento con clamp en 0.1 asegura que la información pasada nunca se desvanece por completo.
- Inferencia rápida en GPU (~130 tokens/segundo en BF16 según el autor) y con funcionamiento puro en PyTorch sin kernels custom, lo que facilita el despliegue en CPUs.
- Fine-tuning específico para conversaciones multi-turno con loss masking centrado en el asistente.
- Integración con HuggingFace Transformers mediante `trust_remote_code`.
- No se han documentado capacidades de tool calling, function calling ni soporte de agentes.
- Capacidades multilingües limitadas al inglés.

## Casos de uso

- Asistentes conversacionales en dispositivos edge: gracias a la memoria constante y la ausencia de cache KV, el modelo puede ejecutarse en CPUs, Raspberry Pi o portátiles sin GPU, manteniendo contexto de conversación largo sin penalización de memoria.
- Aplicaciones educativas de bajo coste: el preentrenamiento con datos como `fineweb-edu-dedup` y `cosmopedia-v2` permite generar explicaciones y contenido didáctico en inglés para plataformas de aprendizaje.
- Generación de código Python básico: el 15% del preentrenamiento proviene de `python-edu`, lo que habilita asistencia en tareas de programación sencillas, ejercicios o prototipos.
- Prototipado rápido en notebooks gratuitos: al ser un modelo de ~100M con pesos en torno a 0.2 GB (BF16), cabe en entornos como Google Colab free tier, permitiendo experimentar sin coste.
- Investigación en arquitecturas recurrentes: el modelo actúa como puente matemático entre SSM lineales y RWKV, resultando útil para estudiar recurrencias LTI, gating y decaimiento exponencial.
- Despliegue en servidores sin GPU: la inferencia en CPU con PyTorch puro y sin kernels CUDA permite integrarlo en contenedores ligeros o infraestructura de bajo consumo.
- Fine-tuning en dominios específicos: su tamaño reducido y la posibilidad de cargar pesos en Transformers facilitan el ajuste fino con pocos recursos para tareas de texto en inglés.

## Benchmarks y rendimiento

| Tarea | Métrica | Valor |
|---|---|---|
| ARC Challenge (0-shot) | acc | 0.1664 ± 0.0109 |
| ARC Challenge (0-shot) | acc_norm | 0.2159 ± 0.0120 |
| ARC Easy (0-shot) | acc | 0.3864 ± 0.0100 |
| ARC Easy (0-shot) | acc_norm | 0.3434 ± 0.0097 |
| HellaSwag (0-shot) | acc | 0.2621 ± 0.0044 |
| HellaSwag (0-shot) | acc_norm | 0.2579 ± 0.0044 |
| PIQA (0-shot) | acc | 0.5756 ± 0.0115 |
| PIQA (0-shot) | acc_norm | 0.5533 ± 0.0116 |

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible. El autor reconoce que los resultados de las tareas evaluadas no son óptimos y los atribuye al dataset utilizado.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0.4 GB según LLM Explorer; el modelo en BF16 ocupa aproximadamente 0.2 GB, con overhead de ejecución que puede elevar el consumo a ~0.5-1 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 1 GB de VRAM (por ejemplo, RTX 2060, RTX 3050, o integradas de gama alta). También es viable en CPU.
- Sí cabe en GPU de consumo; no requiere hardware de datacenter.
- Opciones de despliegue: compatible con HuggingFace Transformers (`trust_remote_code`). No se ha documentado soporte para vLLM, TGI ni llama.cpp.
- Latencia y throughput: ~130 tokens/segundo en GPU con BF16 (dato del autor). La velocidad en CPU aparece truncada en la model card como `~[...] tokens/second`, por lo que se considera no disponible.
- Estado interno: memoria constante de `L x d_model` = 13 x 768, sin crecimiento de cache.

## Comparativa con modelos similares

No se han publicado comparativas con modelos similares en la información disponible. Arquitectónicamente, Myosotis-1-base se sitúa entre los SSM lineales (S4/S5) y RWKV, con similitudes conceptuales con Mamba (aunque sin selectividad) y con la serie RWKV-4. Sin datos de evaluación de esos modelos en la fuente, no es posible establecer una comparación numérica rigurosa.

## Limitaciones y advertencias

- Resultados de evaluación bajos en ARC, HellaSwag y PIQA; el autor señala que el rendimiento se ve afectado por la calidad del dataset.
- Riesgo de alucinación y limitaciones en razonamiento complejo, dado el tamaño reducido y los resultados obtenidos.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- El contexto de entrenamiento está empaquetado en 1024 tokens, aunque el decaimiento exponencial garantiza memoria infinita, la recuperación de información muy antigua puede degradarse.
- La arquitectura requiere ejecutar código custom del autor en HuggingFace (`trust_remote_code`), lo que implica una revisión de seguridad del código remoto antes de su uso en producción.
- No se documentan capacidades de tool calling, function calling ni integración con agentes.
- No se han publicado cuantizaciones oficiales; la inferencia se basa en pesos BF16.
- La perplejidad de validación de 62.76 es alta, lo que sugiere que el modelo no está completamente convergido o que los datos de evaluación son difíciles.

## Enlaces

- HuggingFace: https://huggingface.co/FWKV/Myosotis-1-base
- Eval FWKV: https://fwkv.site/other/eval/
- LLM Explorer: https://llm-explorer.com/model/FWKV%2FMyosotis-1-base,13FY9GQCKa1dAjif1lQnvY
