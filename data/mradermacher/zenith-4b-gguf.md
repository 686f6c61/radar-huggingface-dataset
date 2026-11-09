# mradermacher/Zenith-4B-GGUF

## Resumen

Zenith-4B-GGUF es la versión cuantizada en formato GGUF del modelo Zenith-4B, publicada por el usuario mradermacher, conocido en Hugging Face por generar cuantizaciones estáticas de modelos abiertos. El repositorio contiene únicamente los pesos convertidos a GGUF; no incluye información sobre arquitectura, entrenamiento ni capacidades más allá de la referencia al modelo base KATHIR2006/Zenith-4B.

El modelo base, según el nombre, tiene aproximadamente 4.000 millones de parámetros, lo que lo sitúa en la categoría de modelos pequeños aptos para inferencia en hardware de consumo. La model card del repositorio es puramente técnica y se limita a listar los tipos de cuantización generados, sin documentar el proceso de entrenamiento, los datos utilizados ni las capacidades del modelo.

La relevancia de esta ficha es limitada por la ausencia de documentación sustantiva: no hay datos publicados sobre benchmarks, licencia, idiomas soportados ni arquitectura interna. Cualquier evaluación rigurosa del modelo requeriría consultar el repositorio del modelo base o realizar pruebas empíricas directas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | aproximadamente 4.000 millones (inferido del nombre) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base Zenith-4B. El nombre sugiere un transformer decoder-only de aproximadamente 4.000 millones de parámetros, pero no se confirma en la documentación disponible. Tampoco se documentan los datos de entrenamiento, el número de tokens procesados, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

La única información técnica disponible se refiere al proceso de cuantización: el repositorio utiliza quantize_version 2, output_tensor_quantised 1 y convert_type hf, lo que indica una conversión desde pesos en formato Hugging Face (presumiblemente safetensors) a GGUF mediante el pipeline estándar de llama.cpp. Se ofrecen cuantizaciones estáticas (no imatrix) desde f16 hasta IQ4_XS y Q2_K.

## Capacidades

- Generación de texto: capacidad esperada por tratarse de un modelo de lenguaje, aunque no se documenta explícitamente.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

No se ha publicado ninguna lista de capacidades en la información proporcionada.

## Casos de uso

- Inferencia local en hardware de consumo: las cuantizaciones Q4_K_M y Q5_K_M de un modelo de 4B caben en GPUs con 4-6 GB de VRAM, lo que permite ejecutarlo en tarjetas como la RTX 3060 o incluso en CPU con llama.cpp. Es el caso de uso principal de cualquier GGUF de este tamaño.
- Prototipado rápido de aplicaciones de texto: al ser un modelo pequeño, permite iterar rápidamente en entornos de desarrollo sin necesidad de infraestructura dedicada, siempre que se valide empíricamente su calidad.
- Despliegue en dispositivos edge: la cuantización Q2_K o IQ4_XS reduce el peso a aproximadamente 1,5-2,5 GB, lo que posibilita su ejecución en dispositivos con recursos limitados como mini-PCs o sistemas embebidos con suficiente RAM.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 12 variantes de cuantización, lo que permite medir el impacto de la compresión en la calidad de salida para este modelo concreto.
- Filtrado y clasificación de texto por lotes: modelos de 4B pueden emplearse en tareas de clasificación o extracción de información cuando la latencia no es crítica y se ejecutan en local.
- Base para fine-tuning posterior: los pesos GGUF no son directamente entrenables, pero el modelo base en formato Hugging Face podría servir como punto de partida para ajuste fino, sujeto a la licencia del modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de ~4B parámetros):
  - f16: aproximadamente 8 GB.
  - Q8_0: aproximadamente 4,5 GB.
  - Q6_K: aproximadamente 3,5 GB.
  - Q5_K_M: aproximadamente 3 GB.
  - Q4_K_M: aproximadamente 2,5 GB.
  - Q3_K_M: aproximadamente 2 GB.
  - Q2_K: aproximadamente 1,5 GB.
  - IQ4_XS: aproximadamente 2,2 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 8 GB, RTX 4090 24 GB para las cuantizaciones mayores; cualquier GPU con 4 GB o más para Q4_K_M y Q5_K_M.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 4 GB o más de VRAM para cuantizaciones Q4 y superiores. Las cuantizaciones Q2 y Q3 caben en GPUs con 2-3 GB.
- Opciones de despliegue: llama.cpp, Ollama (mediante importación del GGUF), LM Studio, text-generation-webui, koboldcpp. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, aunque vLLM tiene soporte experimental para algunos GGUF.
- Latencia y throughput: no disponible. Dependerá del hardware y de la cuantización elegida; en una RTX 4090 se esperan decenas de tokens por segundo para un modelo de 4B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Zenith-4B-GGUF | ~4B | no disponible | no disponible | GGUF | Hugging Face |
| Qwen2.5-3B-Instruct | 3,09B | 32.768 | Apache 2.0 | safetensors, GGUF | Hugging Face, Ollama |
| Llama-3.2-3B-Instruct | 3,21B | 131.072 | Llama 3.2 Community | safetensors, GGUF | Hugging Face, Ollama |
| Phi-3.5-mini-instruct | 3,82B | 131.072 | MIT | safetensors, GGUF | Hugging Face, Ollama |

La comparativa se ofrece como referencia de categoría (modelos de ~3-4B parámetros con cuantizaciones GGUF disponibles). No se dispone de datos de rendimiento de Zenith-4B para comparar calidad. La ventaja de los modelos alternativos es la documentación completa, licencias claras y benchmarks publicados; Zenith-4B carece de todos ellos en la información disponible.

## Limitaciones y advertencias

- Ausencia total de documentación: no se especifican licencia, idiomas, arquitectura ni datos de entrenamiento. Esto impide evaluar su idoneidad para uso comercial o producción.
- Licencia desconocida: sin licencia explícita, no se puede asumir permiso para uso comercial. Es imprescindible consultar el repositorio del modelo base KATHIR2006/Zenith-4B antes de cualquier despliegue.
- Riesgo de alucinación: no cuantificado. Como cualquier modelo de lenguaje de 4B, es probable que alucine en tareas de conocimiento factual, pero no hay evaluaciones publicadas.
- Sesgos: no documentados. Al desconocerse los datos de entrenamiento, no se puede evaluar la presencia de sesgos de género, raza, idioma o ideológicos.
- Limitaciones de contexto: no se conoce la longitud de contexto soportada, lo que impide planificar su uso en tareas que requieran ventanas largas.
- Idiomas: no se especifica qué idiomas soporta ni con qué calidad. No se puede asumir un buen rendimiento en castellano.
- Cuantizaciones estáticas: las cuantizaciones ofrecidas no son imatrix (el autor tiene una versión i1 separada), lo que puede implicar una pérdida de calidad algo mayor en las cuantizaciones bajas (Q2, Q3) en comparación con las cuantizaciones imatrix.
- Repositorio sin descargas ni likes: creado el 2026-11-08, sin actividad registrada, lo que sugiere que no ha sido validado por la comunidad.
- Sin garantías de mantenimiento: el autor no documenta el proceso de conversión ni ofrece soporte.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Zenith-4B-GGUF
- Modelo base: https://huggingface.co/KATHIR2006/Zenith-4B
- Versión imatrix del mismo autor: https://huggingface.co/mradermacher/Zenith_4B-i1-GGUF
- Estadísticas de descargas: https://openmodelstats.com/models/mradermacher/zenith_4b-i1-gguf
