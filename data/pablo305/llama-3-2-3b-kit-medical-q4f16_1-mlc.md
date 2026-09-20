# Pablo305/Llama-3.2-3B-Kit-Medical-q4f16_1-MLC

## Resumen

Llama-3.2-3B-Kit-Medical-q4f16_1-MLC es una conversión de formato para navegador del modelo Pablo305/llama3-medical-3b-4bit, un ajuste fino de Llama 3.2 3B orientado a contenido médico. Lo publica el usuario Pablo305 con el etiquetado explícito de "experimental" y lo distribuye en el formato q4f16_1 de MLC, listo para ejecutarse en el navegador mediante WebLLM y WebGPU. No se ha realizado entrenamiento adicional durante la conversión.

Su interés práctico es acotado pero claro: demuestra un pipeline completo de conversión desde un checkpoint NF4 de bitsandbytes hasta un artefacto ejecutable íntegramente en el cliente, sin servidor y con funcionamiento offline. El repositorio ocupa 1,8 GB e incluye pesos, tokenizador, configuración y el binario `model.wasm` del runtime. Se apoya en la arquitectura transformer decoder-only de Llama 3.2 3B, con unos 3.000 millones de parámetros, y queda limitado en esta conversión a una ventana de contexto de 4.096 tokens.

Ahora bien, el propio autor documenta fallos graves en pruebas sintéticas de primeros auxilios, incluida orientación insegura sobre atragantamiento infantil, además de respuestas inconsistentes en español. El modelo no está validado clínicamente y no debe usarse para atención a pacientes. Con 0 descargas y 0 likes en el momento de redactar esta ficha, es un artefacto de investigación y evaluación, no un componente de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2 3B), convertido a formato MLC |
| Parámetros totales | 3B nominal (aproximadamente 3.000 millones; la model card no publica el recuento exacto) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4.096 tokens en esta conversión (el runtime recomienda contexto 4096 y prefill 128); el modelo Llama 3.2 3B original soporta contextos mayores, pero no están disponibles en este build |
| Tipos de cuantización | q4f16_1 (MLC); el checkpoint de origen era NF4 de bitsandbytes, reconstruido a FP16 antes de reconvertir |
| Idiomas soportados | Inglés (en) y español (es) |
| Licencia | Llama 3.2 Community License; el runtime MLC se distribuye bajo Apache 2.0 (`RUNTIME-LICENSE`) |
| Formato de pesos | MLC (58 shards, 283 tensores, 1.807.423.488 bytes de pesos), más `model.wasm`, tokenizador y configuración. No se publican safetensors ni GGUF |

Otros datos verificables del repositorio: tamaño total del repo 1,8 GB; descarga completa en navegador de aproximadamente 1,83 GB; tensor de embeddings de 197.001.216 bytes; `model.wasm` correspondiente a la librería oficial WebLLM 0.2.80 (`Llama-3.2-3B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm`), SHA-256 `34de0d60ab598c6a85ae882b48474f250193076f902057a21070bb2daae96d5b`; pipeline `text-generation`; creado el 19 de septiembre de 2026 y actualizado el mismo día.

## Arquitectura y entrenamiento

La model card es explícita: no hubo entrenamiento adicional durante la conversión y el repositorio de origen no se modificó. El modelo deriva de Pablo305/llama3-medical-3b-4bit (revisión `df5aa311d5b017bdd4d1719c50c5d7a1dd1fa37b`), un ajuste de Llama 3.2 3B del que no se ha recuperado el cuaderno de entrenamiento ni el conjunto de datos. Por tanto, la composición del dataset, el número de tokens y si hubo RLHF, DPO u otra fase de alineación son datos no disponibles. La arquitectura subyacente es la de Llama 3.2 3B Instruct: transformer decoder-only con atención por grupos (GQA) y tokenizador de Llama 3.

La innovación técnica aquí no está en el entrenamiento sino en la cadena de conversión. El checkpoint NF4 original se reconstruyó a FP16 y se convirtió con MLC al formato q4f16_1, generando 58 shards y 283 tensores. El objetivo es la ejecución en cliente mediante WebGPU: el runtime WebLLM compila los pesos y los ejecuta en el navegador con soporte `shader-f16`. El autor advierte que la recuantización puede alterar las respuestas y no recupera información perdida en cuantizaciones anteriores. Como evidencia de reproducibilidad, se registra una única comparación entre el NF4 original y FP16 con logits idénticos en el primer paso y los mismos tokens generados, que el propio autor aclara que no constituye una afirmación de equivalencia general.

## Capacidades

- Generación de texto conversacional en inglés y español, siguiendo la plantilla de prompt de Llama 3.2 Instruct.
- Ejecución local en navegador mediante WebLLM 0.2.80 y WebGPU, con funcionamiento offline una vez descargado el modelo.
- Conversación multi-turno dentro de la ventana de 4.096 tokens configurada en este build.
- Dominio temático declarado: contenido médico y de primeros auxilios, procedente del ajuste fino del checkpoint base (sin dataset verificable).
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Visión, audio u otras modalidades: no disponibles (Llama 3.2 3B es un modelo de texto).
- Modo de razonamiento explícito (thinking): no disponible.

## Casos de uso

- Demostración de inferencia local en navegador: sirve como ejemplo funcional de un pipeline MLC/WebLLM completo, útil para equipos que evalúan si merece la pena llevar un modelo de 3B al cliente sin backend.
- Aplicaciones web offline de primera línea: una página que responda dudas básicas de salud sin conexión, siempre con avisos claros de que no sustituye a un profesional y con revisión humana de las respuestas.
- Pruebas de conversión y cuantización: el repositorio documenta hashes, recuento de tensores y verificaciones de paridad de plantilla de prompt, lo que lo convierte en material de referencia para reproducir cadenas NF4 -> FP16 -> q4f16_1.
- Evaluación de riesgos en IA sanitaria: sus fallos documentados (orientación insegura en atragantamiento infantil, respuestas inconsistentes en español) lo hacen apropiado como caso de estudio de red-teaming y de diseño de salvaguardas.
- Prototipado de asistentes bilingües en/esp: con 4.096 tokens de contexto permite mantener conversaciones de varias réplicas, suficiente para validar interfaz y flujo antes de invertir en un modelo mayor.
- Educación y material didáctico sobre despliegue en el edge: sirve para ilustrar los límites reales de WebGPU en móvil, incluida la gestión de cuotas de almacenamiento del navegador.
- Base para comparativas de recuantización: permite medir empíricamente cuánto cambian las respuestas al pasar de NF4 a q4f16_1 en un dominio sensible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay cifras de MMLU, HumanEval, GSM8K ni de evaluaciones médicas estándar (por ejemplo MedQA) para este artefacto ni para su checkpoint de origen.

La única evidencia cualitativa aportada por el autor es negativa: pruebas sintéticas de primeros auxilios produjeron errores graves, entre ellos orientación insegura sobre atragantamiento infantil e inconsistencias en las respuestas en español. El autor señala que estos problemas también aparecían en el checkpoint original y subraya que una descarga correcta o una respuesta plausible no demuestran exactitud médica.

En cuanto a rendimiento de ejecución, no se publican cifras de latencia ni de throughput. Los únicos datos operativos disponibles son el tamaño de descarga (aproximadamente 1,83 GB), la memoria de runtime estimada (unos 2,3 GB) y la verificación de carga correcta en Chrome de escritorio sobre Apple Metal.

## Requisitos de hardware

- Memoria de runtime estimada por el autor: aproximadamente 2,3 GB.
- Descarga completa: aproximadamente 1,83 GB (pesos, tokenizador, configuración y runtime).
- Requisitos de plataforma: WebGPU con soporte de `shader-f16` y límites de dispositivo suficientes. Una comprobación genérica de "WebGPU disponible" no basta.
- Advertencia de almacenamiento: el runtime WebLLM 0.2.80 recurre a un binding de almacenamiento de 128 MiB cuando el adaptador no permite uno de 1 GiB; ese espacio de reserva es menor que el tensor de embeddings del modelo (197.001.216 bytes, unos 188 MiB), lo que puede impedir la carga.
- Verificación real: el autor confirma carga y generación correctas en Chrome de escritorio sobre Apple Metal, incluida la reapertura totalmente offline con una nueva respuesta en español. La generación en iPhone y Android físicos no estaba verificada en el momento de publicar la model card.
- VRAM y GPU dedicadas: no aplica en el escenario previsto, ya que la ejecución es en navegador sobre WebGPU. No hay datos publicados sobre despliegue en A100, H100 o RTX 4090.
- Opciones de despliegue: WebLLM 0.2.80 sobre MLC en el navegador. El formato MLC no es directamente compatible con vLLM, llama.cpp, Ollama ni TGI, por lo que no se pueden usar como vías de despliegue sin reconvertir los pesos.
- Latencia y throughput: no disponibles.
- Recomendaciones operativas del autor: usar una revisión inmutable de Hugging Face en la URL, un identificador de modelo distinto y obtener consentimiento explícito antes de la descarga grande, dado que la caché del navegador puede ser desalojada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| Llama-3.2-3B-Kit-Medical-q4f16_1-MLC | 3B | 4.096 tokens | MLC (q4f16_1) + wasm | Llama 3.2 | Experimental, 0 descargas, fallos documentados en pruebas de primeros auxilios |
| Pablo305/llama3-medical-3b-4bit (modelo base) | 3B | No disponible | NF4 de bitsandbytes | No disponible en la información proporcionada | Checkpoint de origen; mismo comportamiento defectuoso según el autor |
| Llama-3.2-3B-Instruct-q4f16_1-ctx4k_cs1k (build oficial de WebLLM) | 3B | 4.096 tokens con prefill 1.024 | MLC (q4f16_1) + wasm | Llama 3.2 | Build de referencia del runtime; sin ajuste médico. El artefacto analizado reutiliza su `model.wasm` |
| Alternativas de 3B con licencia permisiva (por ejemplo Qwen2.5-3B o Phi-3.5-mini) | 3B | No disponible en la información proporcionada | No disponible | No disponible | No disponibles: no se ha encontrado información comparable en la búsqueda realizada |

Comparación de rendimiento en benchmarks: no disponible para ninguno de los modelos listados en la información proporcionada. Cabe destacar que esta conversión no aporta pesos distintos a nivel funcional respecto a su checkpoint de origen más allá del efecto de la recuantización, por lo que su única ventaja diferencial es el formato de ejecución en navegador.

## Limitaciones y advertencias

- Riesgo clínico documentado: el autor reporta orientación insegura en pruebas de atragantamiento infantil. El modelo no está validado clínicamente y no debe emplearse para atención a pacientes, triaje ni consejo médico.
- Alucinación: en un dominio de alto riesgo como el sanitario, cualquier respuesta plausible debe verificarse con fuentes clínicas. El propio autor advierte que una respuesta plausible no acredita exactitud.
- Multilingüismo desigual: las respuestas en español son inconsistentes según la model card, pese a figurar el español entre los idiomas soportados.
- Conjunto de datos desconocido: no se ha recuperado el cuaderno de entrenamiento ni el dataset, por lo que no se puede auditar la composición, los sesgos ni la vigencia de la información médica.
- Efecto de la recuantización: reconvertir de NF4 a q4f16_1 puede cambiar las respuestas y no restaura información perdida. La única comparación disponible (un caso con logits idénticos en el primer paso) no es una garantía de equivalencia general.
- Contexto reducido: 4.096 tokens limitan conversaciones largas, resúmenes de historiales o documentos extensos.
- Compatibilidad limitada: requiere WebGPU con `shader-f16` y límites de dispositivo suficientes. El fallback de 128 MiB de almacenamiento puede ser insuficiente frente a los 197.001.216 bytes del tensor de embeddings.
- Verificación incompleta: el funcionamiento en iPhone y Android físicos no estaba confirmado; solo se validó Chrome de escritorio sobre Apple Metal.
- Licencia: Llama 3.2 Community License, con las obligaciones habituales (política de uso aceptable, atribución "Built with Llama" y cláusula de 700 millones de usuarios activos mensuales). Conviene revisar `LICENSE` y `NOTICE` antes de cualquier uso comercial. El runtime MLC es Apache 2.0.
- Nivel de madurez: etiquetado como experimental, con 0 descargas y 0 likes, sin garantías de mantenimiento ni soporte.
- Fuentes de la búsqueda web: los resultados recuperados no guardan relación con el modelo (contenido de un subreddit sobre un videojuego), por lo que no aportan información verificable adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pablo305/Llama-3.2-3B-Kit-Medical-q4f16_1-MLC
- Modelo base: https://huggingface.co/Pablo305/llama3-medical-3b-4bit
- Scripts de conversión y evidencias (Kit-AI): https://github.com/pablopupo/kit-ai/tree/improve-kit-ai/model-tools
- Runtime web utilizado (`model.wasm`, WebLLM 0.2.80): `Llama-3.2-3B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm`, SHA-256 `34de0d60ab598c6a85ae882b48474f250193076f902057a21070bb2daae96d5b`
- Términos de licencia dentro del repositorio: `LICENSE`, `NOTICE` y `RUNTIME-LICENSE`
- Papers, blogs o demos adicionales: no disponible (la búsqueda web no devolvió resultados relevantes)
