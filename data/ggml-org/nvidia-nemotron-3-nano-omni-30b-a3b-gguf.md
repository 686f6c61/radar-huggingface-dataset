# ggml-org/NVIDIA-Nemotron-3-Nano-Omni-30B-A3B-GGUF

## Resumen

NVIDIA-Nemotron-3-Nano-Omni-30B-A3B-GGUF es la conversión a formato GGUF del modelo nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16, publicada por el equipo de ggml-org (los mantenedores de llama.cpp). Se trata de una variante cuantizada del modelo Nemotron 3 Nano Omni de NVIDIA, diseñado para tareas multimodales de tipo *any-to-any* (entrada y salida en múltiples modalidades) con capacidades de razonamiento explícito.

El modelo sigue una arquitectura de mezcla de expertos (MoE) con 31.577.940.288 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token (la nomenclatura "A3B" así lo indica). El sufijo "Omni" en el nombre sugiere cobertura de múltiples modalidades (texto, imagen y posiblemente audio), y "Reasoning" indica que incorpora un modo de razonamiento extendido o *thinking*.

La relevancia de esta publicación radica en que permite ejecutar un modelo multimodal de razonamiento de escala media en hardware de consumo o en infraestructura local mediante llama.cpp, al estar disponible en formato GGUF cuantizado. El repositorio ocupa 247,8 GB e incluye múltiples niveles de cuantización. La licencia figura como "other", por lo que es imprescindible revisar los términos del modelo base de NVIDIA antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) tipo transformer, multimodal any-to-any |
| Parametros totales | 31.577.940.288 (31,58 mil millones) |
| Parametros activos | Aproximadamente 3 mil millones (según nomenclatura A3B; cifra exacta no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF cuantizado (niveles concretos no especificados en la información disponible) |
| Idiomas soportados | no disponible |
| Licencia | other (ver términos del modelo base de NVIDIA) |
| Formato de pesos | GGUF (modelo base original en BF16 safetensors) |

## Arquitectura y entrenamiento

El modelo es una red de mezcla de expertos (MoE) con 31,58 mil millones de parámetros totales y aproximadamente 3 mil millones activos por token, lo que permite un coste de inferencia por token mucho menor que el de un modelo denso del mismo tamaño. La designación "Omni" y la etiqueta de pipeline *any-to-any* indican que el modelo acepta y produce múltiples modalidades, presumiblemente texto, imagen y audio, aunque la información disponible no detalla la composición exacta de las torres de codificación ni del decodificador multimodal.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO o aprendizaje por refuerzo con verificación para el modo de razonamiento. La variante "Reasoning" sugiere entrenamiento específico para cadenas de razonamiento extendidas, pero no se han publicado detalles técnicos en la información proporcionada. La conversión a GGUF la realiza la herramienta automática de ggml-org (github.com/ggml-org/convert), que transforma los pesos BF16 originales de NVIDIA a formatos cuantizados compatibles con llama.cpp.

## Capacidades

- Generación de texto y razonamiento explícito en modo *thinking* (según la designación "Reasoning" del modelo base).
- Procesamiento multimodal *any-to-any*: entrada y salida en múltiples modalidades (texto, imagen y presumiblemente audio, aunque la información disponible no detalla la cobertura exacta).
- Conversación multi-turno (etiqueta "conversational").
- Compatibilidad con endpoints (etiqueta "endpoints_compatible"), lo que facilita su despliegue como servicio.
- Soporte de *tool calling* y *function calling*: no confirmado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: plausible por el modo de razonamiento, pero no confirmado explícitamente.
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistentes multimodales locales: el modelo puede procesar entradas de imagen y texto en una sola conversación, lo que permite construir asistentes que describan imágenes, respondan preguntas sobre documentos escaneados o combinen contexto visual y textual, todo ello ejecutado en infraestructura propia gracias al formato GGUF.
- Razonamiento sobre documentación técnica: con un modo de razonamiento explícito, es adecuado para tareas de análisis de documentación extensa, diagnóstico de errores o explicación paso a paso de problemas complejos, donde la cadena de razonamiento mejora la trazabilidad.
- Procesamiento de audio y transcripción con comprensión: si la cobertura *any-to-any* incluye audio, podría emplearse en pipelines de reuniones que transcriban, resuman y respondan preguntas sobre el contenido, aunque esta capacidad debe verificarse contra el modelo base.
- Despliegue en entornos con requisitos de privacidad: al poder ejecutarse con llama.cpp en hardware local, es apto para organizaciones que no pueden enviar datos a APIs externas, como sector sanitario o legal.
- Prototipado rápido de aplicaciones multimodales: la disponibilidad de cuantizaciones GGUF y la integración con `llama serve` permiten levantar un endpoint compatible con la API de OpenAI en minutos para validar ideas antes de escalar a infraestructura mayor.
- Investigación en eficiencia MoE: con 3 mil millones de parámetros activos sobre 31,58 mil millones totales, sirve como banco de pruebas para estudiar el equilibrio entre calidad y coste computacional en despliegues cuantizados.
- Generación de contenido multimodal en local: creación de descripciones, resúmenes o respuestas que combinan imagen y texto sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión, ya que no se especifican los niveles de cuantización del repositorio. Como referencia orientativa, un modelo MoE de 31,58 mil millones de parámetros en cuantización de 4 bits requeriría del orden de 18-20 GB solo para los pesos, más el *overhead* de contexto y de las torres multimodales; en 8 bits, del orden de 32 GB. Estas cifras son estimaciones y no datos publicados.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría esperar viabilidad en GPUs de 24 GB (RTX 4090) con cuantizaciones agresivas, y holgura en A100 40/80 GB o H100 para cuantizaciones mayores o contexto largo.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) y posiblemente en GPUs de 16 GB con cuantizaciones de 3-4 bits, aunque no está confirmado por el autor.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), `llama serve` con soporte de `-hf` para descarga directa desde Hugging Face, la aplicación Llama (llama.app), y servidores compatibles con la API de OpenAI gracias a la etiqueta "endpoints_compatible". vLLM y TGI no están confirmados para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3-Nano-Omni-30B-A3B (este) | 31,58 B / ~3 B | no disponible | other | GGUF, BF16 | Any-to-any con razonamiento |
| Modelos MoE de tamaño similar (p. ej. familia Qwen MoE) | ~30 B / ~3 B | no disponible | varía | safetensors, GGUF | No se dispone de comparación directa verificada |
| Modelos densos de ~30 B | 30 B / 30 B | no disponible | varía | safetensors, GGUF | Mayor coste por token que un MoE equivalente |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas concretas en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Licencia "other": es imprescindible revisar los términos del modelo base nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16 antes de cualquier uso comercial; la licencia de la conversión GGUF no concede por sí misma derechos sobre los pesos originales.
- Al ser una conversión automática, pueden existir diferencias de calidad respecto al modelo BF16 original, especialmente en cuantizaciones agresivas.
- No se especifican los idiomas soportados, por lo que el rendimiento en castellano no está garantizado ni documentado.
- Riesgo de alucinación inherente a los modelos generativos, potencialmente amplificado en el modo de razonamiento si las cadenas no se verifican.
- No se han publicado detalles sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad en la información disponible.
- La longitud de contexto no está documentada, lo que dificulta planificar despliegues con ventanas largas.
- El tamaño del repositorio (247,8 GB) implica requisitos de almacenamiento considerables si se descargan todas las cuantizaciones.
- Solo 2 "likes" y 2.348 descargas en el momento de la consulta: comunidad reducida, menor probabilidad de soporte o reportes de errores.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ggml-org/NVIDIA-Nemotron-3-Nano-Omni-30B-A3B-GGUF
- Modelo base: https://huggingface.co/nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16
- Herramienta de conversión: https://github.com/ggml-org/convert
- Aplicación Llama: https://llama.app
