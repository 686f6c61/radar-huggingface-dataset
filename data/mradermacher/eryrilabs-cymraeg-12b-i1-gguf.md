# mradermacher/EryriLabs-cymraeg-12B-i1-GGUF

## Resumen

EryriLabs-cymraeg-12B-i1-GGUF es una cuantización en formato GGUF del modelo EryriLabs-cymraeg-12B, publicada por el usuario mradermacher. El modelo base es un transformer de aproximadamente 11.900 millones de parámetros (11.907.350.576 según los pesos en safetensors) orientado a conversación y, por el nombre, especializado en galés (cymraeg). Esta publicación no es un modelo nuevo, sino una redistribución optimizada para inferencia local con llama.cpp y derivados.

La relevancia de esta ficha es doble: por un lado, documenta un punto de acceso práctico a un modelo de 12B especializado en un idioma de bajos recursos como el galés; por otro, advierte de que el repositorio carece de información esencial (licencia, idiomas declarados, pipeline y benchmarks), por lo que su uso en producción exige verificar el modelo base antes de desplegarlo.

La cuantización se ha generado con la herramienta de mradermacher usando pesos ponderados tipo imatrix, lo que suele mejorar la calidad respecto a cuantizaciones estándar en niveles bajos de bits. El repositorio ocupa 57,1 GB e incluye múltiples variantes de cuantización, desde IQ1_S hasta Q6_K.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (deducida del modelo base; no confirmada en la model card) |
| Parámetros totales | 11.907.350.576 |
| Parámetros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible (el nombre del modelo sugiere galés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base EryriLabs-cymraeg-12B en la información proporcionada. Por el tamaño (11,9B parámetros) y el pipeline declarado como conversacional, se trata presumiblemente de un transformer decoder-only, pero no hay confirmación en la model card ni en los metadatos. Tampoco se detallan los datos de entrenamiento, el número de tokens, la composición del corpus ni si hubo fases de RLHF, DPO o ajuste supervisado.

La única información técnica concreta es la relativa al proceso de cuantización: los ficheros se han generado con la herramienta de mradermacher, con cuantización ponderada mediante imatrix (según los comentarios de la model card: `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`). Esto indica que se partió de los pesos en formato Hugging Face y se aplicó una matriz de importancia para preservar la calidad en niveles bajos de bits.

## Capacidades

- Generación de texto conversacional: el tag `conversational` sugiere un ajuste orientado a diálogo multi-turno.
- Especialización idiomática en galés: el nombre del modelo (cymraeg) indica entrenamiento o ajuste para ese idioma, aunque no hay confirmación en la model card.
- Inferencia local: al estar en GGUF, es compatible con llama.cpp, Ollama y otros runners que soportan este formato.
- Cuantizaciones de muy baja precisión: la disponibilidad de IQ1_S, IQ2_XXS e IQ2_XS permite ejecución en hardware con poca memoria a costa de calidad.
- Tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible más allá de la posible especialización en galés.
- Visión, audio o modo thinking: no disponible.

## Casos de uso

- Asistencia conversacional en galés: el modelo puede emplearse para construir un chatbot que responda en galés, aprovechando su presumible ajuste idiomático. Adecuado para administraciones públicas o medios de comunicación que necesiten atención en ese idioma.
- Traducción asistida galés-castellano/inglés: útil como componente en pipelines de traducción o revisión de textos en galés, siempre que se valide la calidad con evaluaciones propias.
- Generación de contenido editorial en galés: redacción de borradores, resúmenes o adaptaciones de textos para publicaciones en galés.
- Despliegue en hardware de consumo: gracias a las cuantizaciones Q4_K_M o IQ4_XS (en torno a 7-8 GB), puede ejecutarse en GPUs de consumo como RTX 3060/4060 Ti o en CPU con llama.cpp, lo que facilita prototipos locales.
- Experimentación académica con lenguas de bajos recursos: permite a investigadores evaluar modelos de 12B especializados en galés sin infraestructura de datacenter.
- Educación y preservación lingüística: aplicaciones de aprendizaje de galés o generación de material didáctico, con revisión humana obligatoria.
- Integración en entornos sin conectividad: al ser GGUF, puede desplegarse en equipos aislados para tareas de procesamiento de texto en galés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según tamaño de 11,9B parámetros):
  - Q2_K / IQ2_XS: ~4-5 GB
  - Q3_K_M / IQ3_XS: ~5-6 GB
  - Q4_K_M / IQ4_XS: ~7-8 GB
  - Q5_K_M: ~8-9 GB
  - Q6_K: ~10-11 GB
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, A10, A100 40/80 GB, H100 para despliegues de alta concurrencia.
- Cabe en GPU de consumo: sí, con cuantizaciones Q4_K_M o inferiores en GPUs de 8-12 GB; Q6_K requiere 12 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con soporte GGUF experimental) y servidores compatibles con la API de OpenAI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos de la misma categoría (12B especializados en galés). Se indica "no disponible" para evitar datos inventados. Como referencia cualitativa, podría compararse con otros modelos GGUF de ~12B (por ejemplo, Mistral-Nemo-12B o Gemma-2-9B), pero no hay datos de rendimiento del modelo evaluado que permitan una comparación justa.

| Modelo | Parámetros | Contexto | Licencia | Formato | Especialización |
|---|---|---|---|---|---|
| EryriLabs-cymraeg-12B-i1-GGUF | 11,9B | no disponible | no disponible | GGUF | Galés (presunta) |
| Mistral-Nemo-12B | 12B | 128k | Apache 2.0 | safetensors/GGUF | Generalista |
| Gemma-2-9B | 9B | 8k | Gemma license | safetensors/GGUF | Generalista |

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base EryriLabs-cymraeg-12B antes de cualquier despliegue en producción.
- Idiomas no declarados: la model card no especifica idiomas; la especialización en galés es una inferencia a partir del nombre y debe validarse empíricamente.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, por lo que las evaluaciones propias son obligatorias.
- Riesgo de alucinación: inherente a los modelos de lenguaje; en un modelo especializado en un idioma de bajos recursos, la cobertura del corpus puede ser limitada y aumentar el riesgo en temas técnicos o de actualidad.
- Cuantizaciones de muy baja precisión (IQ1_S, IQ2_XXS): pueden degradar notablemente la coherencia y la calidad lingüística; no recomendadas para producción.
- Sesgos: no documentados, pero probables en función del corpus de entrenamiento del modelo base.
- Limitaciones de contexto: longitud no disponible; no asumir ventanas largas sin verificar.
- Repositorio con 0 descargas y 1 like: ecosistema de validación mínimo, sin garantías de mantenimiento.
- Fecha de creación futura en los metadatos (2026-11-20): anomalía que conviene contrastar con el autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/EryriLabs-cymraeg-12B-i1-GGUF
- Modelo base: https://huggingface.co/EryriLabs/EryriLabs-cymraeg-12B
- Perfil del autor de la cuantización: https://huggingface.co/mradermacher
- Herramienta de cuantización de mradermacher: no disponible en la información proporcionada
- Paper, blog o demo: no disponible en la información proporcionada
