# cbrigance/Poolside-Laguna-XS-2.1-heretic-v2

## Resumen

Poolside-Laguna-XS-2.1-heretic-v2 es una modificación no oficial del modelo Laguna-XS-2.1 desarrollado por Poolside, publicada por el usuario cbrigance en Hugging Face. Se trata de una variante "abliterated" (también etiquetada como "heretic"), es decir, un ajuste fino orientado a eliminar o reducir los mecanismos de rechazo y alineación de seguridad del modelo original. El modelo base Laguna-XS-2.1 es un modelo de generación de texto de propósito general de Poolside, empresa conocida por sus modelos orientados a tareas de ingeniería de software.

El modelo cuenta con aproximadamente 33.400 millones de parámetros según los pesos en safetensors, lo que lo sitúa en la categoría de modelos de tamaño medio-grande (clase 30B+). El repositorio ocupa 66,9 GB y se distribuye en formato safetensors para su uso con la librería transformers, con código personalizado (custom_code) lo que implica que requiere confiar en implementaciones no estándar para cargarlo.

Es relevante en el contexto actual porque ilustra dos fenómenos: por un lado, la práctica creciente de publicar variantes "abliterated" de modelos open weight para investigación sobre alineación y seguridad; por otro, la existencia de modelos especializados en código e ingeniería de software como los de Poolside. La ficha se limita a los datos disponibles en la información proporcionada; muchos detalles técnicos del modelo base no están documentados en esta fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de generación de texto; requiere custom_code) |
| Parametros totales | 33.442.617.088 (~33,4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | openmdw-1.1 (etiqueta "license:other"; acceso restringido/gated) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone en la información proporcionada de detalles sobre la arquitectura interna del modelo base Laguna-XS-2.1 (tipo de transformer, atención, posibles innovaciones como atención lineal o decodificación especulativa). El modelo se distribuye con la etiqueta `custom_code`, lo que indica que la implementación de su arquitectura no es estándar y requiere cargar código remoto del repositorio con `trust_remote_code=True`, un aspecto relevante para la seguridad en producción.

Respecto al entrenamiento, el modelo es un ajuste fino del base poolside/Laguna-XS-2.1. La variante "heretic-v2" corresponde a un proceso de "abliteration", una técnica de modificación de pesos orientada a eliminar la dirección de rechazo en el espacio de activaciones, reduciendo la tendencia del modelo a negarse a responder. No se documentan en esta fuente el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO en el modelo base. El modelo referencia el paper arXiv:2406.11717, que probablemente describe la técnica o el modelo base, pero su contenido no se detalla aquí.

## Capacidades

- Generación de texto conversacional en inglés (`text-generation`, etiqueta `conversational`).
- Modelo base orientado a tareas de ingeniería de software y código (por el perfil de Poolside), aunque las capacidades específicas de código no están documentadas en esta fuente.
- Modo "abliterated": responde con menor frecuencia con rechazos ante peticiones que el modelo original rechazaría.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo la abliteración afecta a la tasa de rechazo, la utilidad y los sesgos, comparándolo con el base Laguna-XS-2.1 en experimentos controlados.
- Evaluación de robustez de filtros: útil para probar clasificadores de contenido y sistemas de moderación frente a un modelo con menor tendencia al rechazo.
- Generación de texto creativo sin restricciones: para entornos de escritura donde el modelo original rechazaría ciertos temas, siempre que se cumplan las condiciones legales y éticas.
- Experimentos de destilación y comparación de comportamiento: analizar diferencias en distribuciones de salida entre el modelo base y la variante abliterated.
- Desarrollo de pipelines de generación de texto en inglés con transformers: integración en prototipos que ya usan el ecosistema Hugging Face y aceptan `custom_code`.
- Estudio de sesgos y toxicidad: medir cómo el proceso de abliteración modifica la probabilidad de contenido sesgado o dañino en comparación con el modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (FP16/BF16): aproximadamente 67 GB solo para pesos, más overhead de activaciones y KV cache; requiere GPUs de 80 GB (A100, H100) o multi-GPU.
- Cuantización a 8 bits: ~33-35 GB de VRAM, viable en una A100 40GB o H100.
- Cuantización a 4 bits: ~17-20 GB de VRAM, viable en RTX 4090 (24 GB) o RTX 3090.
- GPU recomendadas: A100 80GB, H100 80GB para FP16; RTX 4090/3090 para cuantización 4 bits.
- Opciones de despliegue: transformers (requerido por `custom_code`); compatibilidad con vLLM, llama.cpp, Ollama o TGI no está confirmada en la información disponible y puede verse limitada por el código personalizado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Poolside-Laguna-XS-2.1-heretic-v2 | ~33,4B | no disponible | openmdw-1.1 (gated) | Variante abliterated, solo inglés |
| poolside/Laguna-XS-2.1 (base) | ~33,4B (según variante) | no disponible | no disponible en esta fuente | Modelo original con alineación de seguridad |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento con otros modelos de la misma categoría.

## Limitaciones y advertencias

- El proceso de abliteration reduce los rechazos de seguridad, lo que aumenta el riesgo de generar contenido dañino, ofensivo o ilegal; no debe desplegarse en producción orientada al público sin moderación externa.
- Riesgo elevado de alucinación, inherente a los modelos de lenguaje de este tamaño; no se han publicado evaluaciones específicas.
- Soporte únicamente en inglés según la etiqueta de idioma; el rendimiento en castellano no está garantizado.
- Licencia openmdw-1.1 con etiqueta "license:other": es necesario revisar los términos completos antes de cualquier uso comercial; además, el acceso es restringido (gated) y requiere aceptar condiciones en Hugging Face.
- El modelo requiere `trust_remote_code=True` (custom_code), lo que implica ejecutar código del repositorio; debe auditarse antes de usarlo en entornos de producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación comunitaria ni de calidad contrastada.
- La fecha de creación indicada (2026-11-26) es futura respecto a los datos habituales; conviene verificar la integridad y procedencia del repositorio.
- No se dispone de información sobre el contexto máximo, lo que limita la planificación de aplicaciones con documentos largos.

## Enlaces

- Hugging Face: https://huggingface.co/cbrigance/Poolside-Laguna-XS-2.1-heretic-v2
- Modelo base: https://huggingface.co/poolside/Laguna-XS-2.1
- Paper referenciado: https://arxiv.org/abs/2406.11717
