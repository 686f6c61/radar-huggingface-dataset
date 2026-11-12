# mradermacher/BotPsy-0.8B-GGUF

## Resumen

BotPsy-0.8B-GGUF es una recopilación de cuantizaciones estáticas en formato GGUF del modelo BotPsy-0.8B, publicada por el usuario mradermacher en Hugging Face. El repositorio no contiene un modelo entrenado desde cero por este autor, sino una conversión y cuantización del modelo original alojado en `qvac/BotPsy-0.8B`, orientada a su despliegue en entornos con recursos limitados mediante llama.cpp y herramientas compatibles.

El dato más relevante y verificable es el recuento de parámetros del modelo base: 100.592.896 parámetros según los tensores en safetensors, lo que sitúa al modelo en la categoría de menos de 0,1 mil millones de parámetros, muy por debajo de lo que sugiere el sufijo "0.8B" del nombre. Esta discrepancia debe tenerse en cuenta al planificar el despliegue, ya que las estimaciones de memoria y rendimiento deben basarse en el recuento real y no en la etiqueta del repositorio.

La ficha técnica disponible es extremadamente escasa: no se especifican licencia, idiomas, pipeline ni detalles de entrenamiento o arquitectura más allá de la información inferida del proceso de cuantización. El repositorio tiene un tamaño de 0,3 GB y, en el momento de la consulta, registra cero descargas y cero likes, lo que indica una publicación muy reciente o de escasa difusión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, sin confirmar) |
| Parametros totales | 100.592.896 (dato real de safetensors del modelo base) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base BotPsy-0.8B. El repositorio de cuantización no incluye detalles sobre el tipo de transformer, número de capas, dimensiones ocultas, mecanismo de atención ni innovaciones técnicas. Tampoco se documentan los datos de entrenamiento, el número de tokens procesados, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT.

La única información técnica fiable procede de los metadatos del proceso de cuantización de mradermacher: se ha realizado una conversión de tipo `hf` con `quantize_version: 2` y `output_tensor_quantised: 1`, generando un conjunto de cuantizaciones estáticas en formato GGUF. El sufijo "0.8B" del nombre no se corresponde con el recuento real de parámetros (100,6 millones), por lo que se recomienda tratar la etiqueta con cautela.

## Capacidades

- No se han documentado capacidades específicas en la información disponible.
- Se desconoce si el modelo soporta generación de texto, razonamiento, código o matemáticas más allá de lo que implica un modelo de lenguaje de su tamaño.
- No consta soporte de tool calling ni function calling.
- No consta soporte de agentes ni razonamiento multi-paso.
- No se han especificado capacidades multilingües ni idiomas concretos.
- No se ha documentado ningún modo especial (thinking mode, visión, audio).
- El nombre "BotPsy" sugiere un posible enfoque conversacional o de simulación de diálogo, pero no hay documentación que lo confirme.

## Casos de uso

- Despliegue en dispositivos de borde: con 100,6 millones de parámetros y cuantizaciones desde Q2_K hasta Q8_0, el modelo puede ejecutarse en CPU y en GPUs de gama baja, lo que lo hace adecuado para prototipos en Raspberry Pi, móviles o sistemas embebidos con llama.cpp.
- Pruebas de concepto de asistentes conversacionales: dado su reducido tamaño, puede servir para validar pipelines de diálogo multi-turno antes de escalar a modelos mayores, siempre que se verifique su calidad real.
- Filtrado y clasificación de texto ligero: un modelo de este tamaño puede emplearse para tareas de etiquetado simple o moderación preliminar en entornos con restricciones de latencia y memoria.
- Generación de texto de bajo coste en entornos offline: las cuantizaciones Q4_K_M y Q5_K_M ofrecen un equilibrio razonable entre tamaño y fidelidad para aplicaciones sin conexión.
- Evaluación comparativa de cuantizaciones: el repositorio incluye 12 variantes, lo que permite medir el impacto de la cuantización en la calidad de salida sobre un mismo modelo base.
- Docencia y experimentación: útil para estudiar el proceso de cuantización GGUF y el comportamiento de modelos pequeños en tareas controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 100,6 millones de parámetros, la huella en pesos va desde aproximadamente 0,1 GB en Q2_K hasta unos 0,2 GB en Q8_0 y 0,2 GB en f16 (sin contar overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; también funciona en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, e incluso iGPU), así como en CPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (LM Studio, koboldcpp, text-generation-webui). vLLM y TGI no son la vía natural para GGUF, aunque existen soportes parciales.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y de la cuantización elegida. Por el tamaño, se espera una latencia muy baja en CPU y prácticamente instantánea en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| BotPsy-0.8B-GGUF (este) | 100,6 M (real) | no disponible | no disponible | GGUF | Cuantizaciones estáticas de un modelo base poco documentado |
| Qwen2.5-0.5B | 494 M | 32.768 | Apache 2.0 | safetensors, GGUF | Modelo pequeño bien documentado y con benchmarks públicos |
| SmolLM2-135M | 135 M | 8.192 | Apache 2.0 | safetensors, GGUF | Modelo compacto de Hugging Face con licencia permisiva |
| TinyLlama-1.1B | 1,1 B | 2.048 | Apache 2.0 | safetensors, GGUF | Referencia habitual en la categoría de modelos pequeños |

La comparación es orientativa: no se dispone de datos de rendimiento de BotPsy-0.8B que permitan una comparación cuantitativa con estas alternativas.

## Limitaciones y advertencias

- La licencia no está especificada, lo que impide confirmar si el uso comercial está permitido; es imprescindible consultar el repositorio del modelo base `qvac/BotPsy-0.8B` antes de cualquier uso en producción.
- El nombre "0.8B" no coincide con el recuento real de parámetros (100,6 M), lo que puede inducir a error en la planificación de recursos.
- No hay información sobre sesgos, alucinación ni limitaciones idiomáticas; un modelo de este tamaño tiende a una capacidad limitada de razonamiento y a una mayor propensión a errores factuales, aunque no se ha verificado para este caso concreto.
- Se desconoce la longitud de contexto soportada, lo que impide garantizar conversaciones multi-turno largas o tareas de recuperación con contexto extenso.
- El repositorio registra cero descargas y cero likes, sin señales de validación por parte de la comunidad.
- Al ser una cuantización, las versiones Q2_K y Q3_K pueden degradar notablemente la calidad respecto a f16; se recomienda Q4_K_M o superior para uso serio.
- No se han publicado evaluaciones independientes ni benchmarks que respalden su calidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/BotPsy-0.8B-GGUF
- Modelo base: https://huggingface.co/qvac/BotPsy-0.8B
