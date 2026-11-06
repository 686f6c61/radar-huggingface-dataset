# mradermacher/Qwen3.8-27B-Uncensored-Impulsive-GGUF

## Resumen

Qwen3.8-27B-Uncensored-Impulsive-GGUF es un conjunto de cuantizaciones estáticas en formato GGUF generadas por mradermacher a partir del modelo base Sorenvza/Qwen3.8-27B-Uncensored-Impulsive, un ajuste fino de la familia Qwen3 orientado a conversación sin censura. El repositorio no contiene pesos originales ni documentación técnica propia: es un artefacto de distribución pensado para su uso con llama.cpp y runtimes compatibles, con 26.895.998.464 parámetros totales según los safetensors del modelo de origen.

El interés del repositorio es práctico: ofrece una batería amplia de niveles de cuantización (desde Q2_K hasta Q8_0, incluyendo variantes IQ4_XS y Q4_K_S) que permiten desplegar un modelo de ~27.000 millones de parámetros en hardware muy distinto, desde GPUs de consumo con poca VRAM hasta estaciones de trabajo. El tamaño del repositorio, 133,2 GB, refleja la suma de todas las variantes publicadas, no el peso de una sola.

La model card es mínima y no aporta información sobre entrenamiento, licencia, idiomas o evaluación. Cualquier dato de arquitectura o capacidades debe inferirse del modelo de origen declarado, y en esta ficha se indica explícitamente cuando un dato no está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Qwen3; detalles no publicados en la model card) |
| Parametros totales | 26.895.998.464 (~26,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas; el modelo de origen se distribuye en safetensors) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna en la model card de este repositorio. El nombre del modelo de origen (Qwen3.8-27B-Uncensored-Impulsive) sugiere una base de la familia Qwen3 con aproximadamente 27.000 millones de parámetros, sometida a un ajuste fino orientado a conversación sin censura, pero no se documentan ni el número de tokens de entrenamiento, ni la composición del dataset, ni si se emplearon técnicas de RLHF, DPO u otras.

El proceso documentado en este repositorio es exclusivamente de cuantización: los metadatos de la model card indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que describe la conversión desde pesos en formato Hugging Face a GGUF y la generación de las distintas variantes estáticas. No hay innovaciones técnicas propias del repositorio más allá de la propia conversión.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como `conversational` y el ajuste fino declarado apunta a diálogo multi-turno.
- Modo sin censura: el nombre del modelo de origen indica un ajuste fino destinado a reducir rechazos y filtros de contenido, aunque no se detalla la metodología.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; no se declaran idiomas.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Despliegue local en GPU de consumo: las variantes Q4_K_M y Q4_K_S permiten ejecutar un modelo de ~27.000 millones de parámetros en GPUs con 16-24 GB de VRAM mediante llama.cpp, con una pérdida de calidad controlada frente a f16.
- Experimentación en investigación sobre alineación y censura: al tratarse de un ajuste fino sin censura, sirve para estudiar el comportamiento de modelos con filtros reducidos en entornos controlados y con supervisión humana.
- Prototipado de asistentes conversacionales: la etiqueta `conversational` y el formato GGUF facilitan integrar el modelo en aplicaciones de chat locales sin depender de APIs externas.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece doce variantes del mismo modelo, lo que permite medir el impacto de cada nivel de cuantización en perplejidad y calidad de respuesta con un pipeline reproducible.
- Inferencia en entornos sin conectividad o con requisitos de privacidad: al ejecutarse íntegramente en local con llama.cpp, los datos no salen del equipo, lo que encaja en escenarios con requisitos estrictos de confidencialidad.
- Pruebas de carga y latencia en CPU: las variantes Q2_K y Q3_K_S reducen el peso lo suficiente para ejecución en CPU con RAM abundante, útiles para validar arquitecturas de servicio antes de invertir en GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según tamaño de pesos GGUF): Q8_0 ~28-29 GB; Q6_K ~22 GB; Q5_K_M ~19 GB; Q4_K_M ~16-17 GB; Q4_K_S ~15-16 GB; Q3_K_M ~13 GB; Q2_K ~10-11 GB; IQ4_XS ~14-15 GB.
- GPU recomendadas: A100 40/80 GB o H100 para las variantes de mayor precisión (Q8_0, f16); RTX 4090 (24 GB) para Q4_K_M, Q5_K_M y Q6_K; RTX 4080/4070 Ti Super (16 GB) para Q4_K_S e IQ4_XS con offload parcial.
- GPU de consumo: sí, cabe en RTX 4090, RTX 3090 y, con cuantizaciones bajas, en GPUs de 12-16 GB recurriendo a offload de capas a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; los tags del repositorio incluyen `endpoints_compatible`.
- Latencia y throughput: no disponibles; dependen del hardware, del nivel de cuantización y del grado de offload a CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-Impulsive-GGUF (este) | ~26,9 mil millones | no disponible | no disponible | GGUF | Cuantizaciones estáticas de un fine-tune sin censura |
| Sorenvza/Qwen3.8-27B-Uncensored-Impulsive | ~26,9 mil millones | no disponible | no disponible | safetensors | Modelo de origen del que derivan estas cuantizaciones |
| Modelos base de la familia Qwen3 de tamaño similar | no disponible | no disponible | no disponible | safetensors, GGUF | Referencia de la arquitectura subyacente; sin datos verificados en esta búsqueda |

No se dispone de datos de rendimiento ni de especificaciones verificadas de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- La model card no declara licencia: no se puede confirmar si el uso comercial está permitido. Es imprescindible verificar la licencia del modelo de origen antes de cualquier despliegue en producción.
- El ajuste fino "uncensored" implica un riesgo elevado de generar contenido dañino, ofensivo o inexacto; requiere filtros y supervisión humana en cualquier aplicación expuesta a usuarios.
- Riesgo de alucinación no cuantificado: no hay benchmarks ni evaluaciones publicadas que permitan estimar la fiabilidad factual.
- No se documentan idiomas soportados; el rendimiento en castellano es desconocido.
- No se dispone de la longitud de contexto; no se debe asumir una ventana larga sin verificarla en el modelo de origen.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan notablemente la calidad; para uso serio se recomienda Q4_K_M o superior.
- El tamaño del repositorio (133,2 GB) obliga a descargar selectivamente la variante necesaria, no el repositorio completo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-Impulsive-GGUF
- Modelo de origen: https://huggingface.co/Sorenvza/Qwen3.8-27B-Uncensored-Impulsive
