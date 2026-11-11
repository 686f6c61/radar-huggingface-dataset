# Qwert753/GLM-5.3-ABLITERATED-NVFP4-modal

## Resumen

GLM-5.3-ABLITERATED-NVFP4-modal es una versión modificada del modelo GLM-5.3 de zai-org, distribuida por el usuario Qwert753 bajo el identificador `Qwert753/GLM-5.3-ABLITERATED-NVFP4-modal`. Se trata de un checkpoint de 753.000 millones de parámetros totales con aproximadamente 18.000 millones activos por token, cuantizado en NVFP4 y sometido a un proceso de "abliteration" (eliminación de comportamiento de rechazo directamente en los pesos) orientado a ciberseguridad ofensiva. El modelo base pertenece a la familia GLM-5.3, que emplea una arquitectura MoE con MLA y atención dispersa al estilo DeepSeek (`glm_moe_dsa`).

La relevancia de esta ficha es doble: por un lado documenta una variante de cuantización NVFP4 de un modelo frontera de 753B, útil para despliegues con memoria limitada; por otro, advierte de que se trata de una versión deliberadamente descensurada, publicada sin métricas de seguridad estándar y con afirmaciones de capacidad ofensiva que no han sido verificadas de forma independiente. El repositorio tiene 32,3 GB y no registra descargas ni interacciones en el momento de la consulta.

La model card declara licencia MIT, idioma inglés, y capacidad de contexto de hasta 1 millón de tokens (con matices importantes en la implementación real, detallados más abajo). El modelo incluye una cabeza de predicción multi-token (MTP) que también ha sido modificada por el mismo proceso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `glm_moe_dsa` (MoE + MLA + atención dispersa tipo DeepSeek) |
| Parámetros totales | 753B |
| Parámetros activos | ~18B por token |
| Longitud de contexto | 1M tokens declarados; en la práctica ~512K en TP8 con NVFP4 según notas del autor |
| Tipos de cuantización | NVFP4 (expertos enrutados); atención y expertos compartidos en bf16 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (formato ModelOpt) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3 emplea una arquitectura de mezcla de expertos (MoE) combinada con Multi-head Latent Attention (MLA) y atención dispersa (`glm_moe_dsa`), un diseño similar al utilizado en la familia DeepSeek. Con 753B parámetros totales y ~18B activos por token, el coste computacional por token es comparable al de un modelo denso de tamaño medio, mientras que la capacidad representacional se aproxima a la de un modelo frontera. La cuantización NVFP4 se aplica únicamente a los expertos enrutados, manteniendo atención y expertos compartidos en bf16, lo que preserva la precisión en las capas más sensibles.

El proceso de "abliteration" aplicado por el autor consiste, según la model card, en una edición directa de los tensores de pesos para eliminar el comportamiento de rechazo, sin SFT, DPO, LoRA, adaptadores, vectores de dirección ni hooks en tiempo de ejecución. La cabeza MTP (multi-token prediction) también fue modificada y se reporta una tasa de aceptación de borrador del ~87%. No se dispone de información sobre el volumen de tokens de entrenamiento del modelo base ni sobre la composición del dataset, ya que la model card no los detalla. Tampoco se documenta el método exacto de abliteration (dirección de rechazo, capas afectadas, magnitud de la edición).

## Capacidades

- Generación de texto y razonamiento en inglés, con modos de esfuerzo de razonamiento (`low`, `high`, `max`; el valor `off` cae por defecto en `max` según las notas del autor).
- Generación de código, incluido código de seguridad ofensiva según las verificaciones declaradas por el autor: reverse shells, keyloggers, ransomware AES, escalada de privilegios SUID, fuerza bruta SSH y payloads de inyección SQL.
- Razonamiento multi-paso con bloques de razonamiento expuestos en `message.reasoning`.
- Predicción multi-token (MTP) para decodificación especulativa.
- Capacidad de contexto largo (hasta 1M tokens en teoría; ~512K prácticos en TP8 con NVFP4).
- No se documenta soporte de tool calling, function calling, visión, audio ni otras modalidades en la información disponible.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma.

## Casos de uso

- Pentesting autorizado: el modelo puede generar herramientas y payloads de prueba (reverse shells, escalada de privilegios, inyección SQL) para entornos de seguridad con autorización explícita, aprovechando su contexto largo para analizar bases de código completas.
- Análisis de malware: con 512K tokens de contexto práctico, permite cargar muestras, volcados de memoria y tráfico de red en una sola ventana para correlacionar indicadores.
- CTFs y formación en seguridad ofensiva: generación de exploits y scripts de explotación en entornos controlados, con la ventaja de que el modelo no rechaza peticiones de este tipo.
- Investigación en seguridad: análisis de superficies de ataque, revisión de configuraciones y generación de pruebas de concepto para vulnerabilidades conocidas.
- Despliegue de agentes de razonamiento largo: los modos `high`/`max` con contexto extendido permiten cadenas de razonamiento multi-paso sobre documentos extensos, aunque sin soporte documentado de tool calling.
- Evaluación de robustez de filtros: útil para investigadores que necesitan un modelo sin rechazos como referencia para medir la eficacia de clasificadores de seguridad o de sistemas de moderación.
- Procesamiento de documentación técnica extensa en inglés: resúmenes y extracción de información sobre corpus de hasta cientos de miles de tokens.

## Benchmarks y rendimiento

Los únicos datos disponibles provienen de la model card del autor y no han sido verificados de forma independiente:

| Benchmark | Modelo base | Versión abliterada | Delta |
|---|---|---|---|
| MMLU (logit, 1.026 preguntas) | 85,58% | 84,11% | -1,47 pp |

| Modo de razonamiento | Prompts HarmBench | Cumple | Rechaza | Tasa de rechazo |
|---|---|---|---|---|
| default (off) | 109 respondidos | 101 | 8 | 7,3% |
| high | 76 | 76 | 0 | 0,0% |
| max | 80 | 80 | 0 | 0,0% |

No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, MMLU-Pro, etc.) en la información disponible. Las cifras de MMLU por tema (57 asignaturas) aparecen parcialmente en la model card, pero no se reproducen aquí de forma completa por falta de datos verificables.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 32,3 GB en NVFP4, pero la inferencia requiere cargar también atención y expertos compartidos en bf16, por lo que el footprint real es mayor. Según las notas del autor, en 8× DGX Spark GB10 se obtiene un pool de KV de ~35 GiB por rango (frente a 7-9 GiB en FP8).
- GPU recomendadas: 8× DGX Spark GB10 (configuración probada por el autor); para despliegues mayores se necesitarían clústeres multi-GPU con tensor parallelism (TP8 mencionado).
- No cabe en GPU de consumo individual (RTX 4090, 3090, etc.) por el tamaño total de 753B parámetros.
- Opciones de despliegue: vLLM con soporte `glm_moe_dsa` y `nvfp4_ds_mla`; el autor indica que se carga con vLLM estándar. No se documenta soporte en llama.cpp, Ollama ni TGI.
- Latencia y throughput: en GB10, NVFP4 no aporta velocidad (no hay cómputo FP4 nativo; los pesos se descomprimen al vuelo) y la decodificación se sitúa cerca de FP8 + MTP. La ventaja es de memoria y contexto.
- Limitación conocida: el contexto de 1M tokens vía decode-context-parallel está cerrado en `glm_moe_dsa` en vLLM actualmente (error de paginación en `nvfp4_ds_mla`).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| GLM-5.3-ABLITERATED-NVFP4-modal | 753B totales / ~18B activos | 1M declarado (~512K práctico) | MIT | Hugging Face (0 descargas) | Variante abliterada y cuantizada NVFP4 |
| zai-org/GLM-5.3 (base) | 753B totales / ~18B activos | 1M | no disponible en la información | Hugging Face | Modelo original con salvaguardas |
| dealignai/GLM-5.3-UNCENSORED-NVFP4 | 753B totales / ~18B activos | 1M | no disponible en la información | Hugging Face (espejo) | Variante equivalente según el autor |

No se dispone de datos de rendimiento comparativo con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo deliberadamente descensurado: elimina el comportamiento de rechazo a nivel de pesos, lo que impide aplicar salvaguardas estándar en producción.
- Riesgo elevado de uso malintencionado: la model card promociona explícitamente la generación de keyloggers, ransomware, reverse shells y exploits. Su uso sin autorización explícita puede ser ilegal en muchas jurisdicciones.
- Las afirmaciones de capacidad ofensiva y de tasas de rechazo provienen únicamente del autor y no han sido verificadas de forma independiente.
- El modo `off` de razonamiento no es accesible: cualquier valor distinto de `low` o `high` cae en `max`, lo que puede agotar el presupuesto de tokens en respuestas largas.
- Contexto de 1M tokens no utilizable en la práctica con decode-context-parallel en vLLM; el límite práctico es ~512K en TP8.
- Solo inglés: no se documenta soporte multilingüe.
- Repositorio sin descargas ni interacciones: no hay evidencia de validación por parte de la comunidad.
- Licencia MIT declarada, pero la naturaleza del contenido (código ofensivo) puede entrar en conflicto con legislación local sobre ciberseguridad; verificar el marco legal antes de cualquier uso.
- Riesgo de alucinación y de generación de código inseguro o no funcional: las verificaciones del autor son cualitativas ("working code") sin reproducibilidad documentada.
- No se documenta soporte de tool calling ni de agentes, lo que limita su integración en pipelines automatizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Qwert753/GLM-5.3-ABLITERATED-NVFP4-modal
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Espejo del autor: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-NVFP4
- Perfil del autor del proceso: https://huggingface.co/dealignai
- Discusión sobre despliegue en GB10: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8/discussions/3
- Twitter del autor: https://twitter.com/dealignai
- Twitter del proveedor de cómputo: https://twitter.com/jordanschenck
- Perfil del tester: https://huggingface.co/0xMagnus
