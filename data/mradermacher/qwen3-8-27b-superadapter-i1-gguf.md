# mradermacher/Qwen3.8-27B-SuperAdapter-i1-GGUF

## Resumen

Qwen3.8-27B-SuperAdapter-i1-GGUF es una cuantización en formato GGUF del modelo Qwen3.8-27B-SuperAdapter, publicada por el usuario mradermacher, especializado en generar versiones cuantizadas de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El modelo base es un transformer denso de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones), según los pesos en safetensors del repositorio original.

La relevancia de esta publicación es fundamentalmente práctica: ofrece un conjunto amplio de cuantizaciones (desde IQ1_S hasta Q6_K, pasando por Q4_K_M, IQ4_XS o Q5_K_M) generadas con imatrix, lo que permite desplegar un modelo de 27B en hardware de consumo ajustando el equilibrio entre calidad y uso de memoria. El repositorio ocupa 40 GB en total, lo que refleja la suma de todas las variantes incluidas.

No se dispone de información sobre la licencia, los idiomas soportados, el pipeline declarado ni la composición del entrenamiento del modelo base. La model card se limita a los metadatos de la cuantización (versión de quantize, tipo de conversión, lista de quants generados y referencia al modelo original de OliviaRossi).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalle no disponible) |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); safetensors en el modelo base |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen3.8-27B-SuperAdapter más allá de su naturaleza transformer y su recuento de parámetros (27,3B). No se especifican el número de capas, la dimensión oculta, el mecanismo de atención, la longitud de contexto nativa ni si incorpora innovaciones como atención lineal o decodificación especulativa.

Tampoco se documentan los datos de entrenamiento: no hay cifras de tokens, composición del dataset, ni confirmación de fases de RLHF, DPO o ajuste por preferencias. La única información técnica relevante procede de los metadatos de la cuantización: se ha usado `quantize_version: 2`, `output_tensor_quantised: 1`, conversión desde `hf` y generación de cuantizaciones ponderadas con imatrix (importancia matrix), una técnica que mejora la fidelidad de los quants de baja precisión al calibrar con estadísticas de activaciones.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` del repositorio indica uso previsto para diálogo multi-turno.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que el formato GGUF puede servirse mediante endpoints compatibles (por ejemplo, servidores de inferencia que aceptan GGUF).
- Razonamiento y generación de código: no confirmado explícitamente en la información disponible; el nombre del modelo base sugiere linaje Qwen, pero no se documenta.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Despliegue local en estación de trabajo con GPU de consumo: usar la cuantización Q4_K_M o IQ4_XS para ejecutar un modelo de 27B en una GPU con 24 GB de VRAM (RTX 3090/4090) mediante llama.cpp u Ollama, con calidad cercana al original y sin depender de la nube.
- Servicio conversacional autoalojado: aprovechar la etiqueta `conversational` y las variantes Q5_K_M o Q6_K para montar un chatbot multi-turno en un servidor con GPU profesional, manteniendo la privacidad de los datos al no enviar prompts a terceros.
- Experimentación e investigación en entornos con memoria limitada: las variantes IQ2_XXS, IQ1_S o Q2_K permiten probar el comportamiento de un modelo de 27B en máquinas con 8-12 GB de VRAM o incluso en CPU, a costa de degradación de calidad.
- Evaluación comparativa de cuantizaciones: el amplio conjunto de quants (más de 20 variantes) permite medir la pérdida de calidad frente al modelo en safetensors en tareas concretas del usuario antes de fijar una configuración de producción.
- Integración en pipelines de inferencia compatibles con GGUF: servir el modelo mediante endpoints compatibles para tareas de generación de texto por lotes, resúmenes o clasificación, ajustando el quant al presupuesto de latencia y memoria.
- Prototipado offline en portátiles: con las variantes de menor tamaño (Q2_K_S, IQ2_M) es posible ejecutar el modelo en CPU con llama.cpp para pruebas de concepto sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según tamaño del quant y overhead de contexto):
  - IQ1_S / IQ1_M / IQ2_XXS / IQ2_XS: en torno a 6-9 GB.
  - Q2_K / Q2_K_S / IQ2_M / IQ2_S: en torno a 9-11 GB.
  - Q3_K_S / Q3_K_M / Q3_K_L / IQ3_XXS / IQ3_XS / IQ3_S / IQ3_M: en torno a 11-14 GB.
  - Q4_0 / Q4_1 / Q4_K_S / Q4_K_M / IQ4_XS / small-IQ4_NL: en torno a 15-17 GB.
  - Q5_K_S / Q5_K_M: en torno a 18-20 GB.
  - Q6_K: en torno a 22-24 GB.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para Q4_K_M, Q5_K_M y, con margen ajustado, Q6_K; A100 40/80 GB y H100 para servir varias instancias o contextos largos; GPU de 12-16 GB (RTX 4070 Ti, RTX 4080) para quants Q2-Q3.
- Cabe en GPU de consumo: sí, desde GPUs de 8 GB con quants IQ1/IQ2 hasta 24 GB con Q6_K.
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con GGUF (etiqueta `endpoints_compatible`); vLLM y TGI no soportan GGUF de forma nativa para este formato.
- Latencia y throughput: no disponibles; dependen del quant, del hardware y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-SuperAdapter-i1-GGUF (este) | 27,3B | no disponible | GGUF (24 quants) | no disponible | Cuantización imatrix de un modelo de 27B |
| Modelo base Qwen3.8-27B-SuperAdapter | 27,3B | no disponible | safetensors | no disponible | Pesos originales en precisión completa |
| Otras cuantizaciones GGUF de modelos de ~27B | ~27B | variable | GGUF | según modelo base | Alternativas equivalentes en tamaño; rendimiento no comparable sin benchmarks |

No se dispone de datos de benchmarks ni de especificaciones del modelo base que permitan una comparación cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base antes de cualquier despliegue en producción.
- Idiomas no declarados: se desconoce el soporte multilingüe real; conviene evaluar en el idioma objetivo antes de usarlo.
- Sin benchmarks publicados: no hay evidencia de rendimiento en MMLU, HumanEval, GSM8K ni otras tareas; la calidad debe validarse empíricamente.
- Degradación por cuantización: los quants de baja precisión (IQ1_S, IQ2_XXS, Q2_K) pueden introducir pérdida notable de calidad y errores en tareas de razonamiento; se recomienda Q4_K_M o superior para uso serio.
- Riesgo de alucinación: inherente a los modelos generativos; no hay documentación específica sobre mitigaciones.
- Sesgos: no documentados en la información disponible.
- Contexto: se desconoce la longitud de contexto soportada; los quants bajos pueden degradar el rendimiento en contextos largos por presión de memoria.
- Repositorio con 0 descargas y creado recientemente: no hay evidencia de uso comunitario ni de validación independiente de las cuantizaciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-SuperAdapter-i1-GGUF
- Modelo base: https://huggingface.co/OliviaRossi/Qwen3.8-27B-SuperAdapter
