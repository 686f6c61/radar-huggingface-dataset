# mradermacher/creative-thinker-gamma-1.25-GGUF

## Resumen

`mradermacher/creative-thinker-gamma-1.25-GGUF` es una colección de cuantizaciones GGUF estáticas del modelo base `jukofyork/creative-thinker-gamma-1.25`, un transformer denso de aproximadamente 32.760 millones de parámetros (32,7B) orientado a generación conversacional en inglés. El trabajo de cuantización lo firma mradermacher, un publicador habitual de quants en Hugging Face, y no el autor original del modelo. El repositorio ofrece diez variantes GGUF que van desde Q2_K (12,4 GB) hasta Q8_0 (34,9 GB), lo que permite desplegar el modelo en hardware muy diverso.

La relevancia práctica de este artefacto radica en que convierte un modelo de 32,7B en un formato consumible por llama.cpp, Ollama y otros motores compatibles con GGUF, sin necesidad de disponer de los pesos originales en safetensors ni de una GPU de gran capacidad. La etiqueta `endpoints_compatible` y la inclusión en el pipeline conversacional indican que está pensado para servir como motor de chat.

No obstante, la información pública es muy limitada: la model card original no documenta arquitectura interna, datos de entrenamiento, longitud de contexto, licencia ni benchmarks. Esta ficha recoge únicamente los datos verificables del repositorio y marca explícitamente como "no disponible" todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (detalles internos no disponibles) |
| Parametros totales | 32.763.876.352 (32,7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); base original en safetensors |
| Modelo base | jukofyork/creative-thinker-gamma-1.25 |
| Cuantizador | mradermacher |
| Tamano del repo | 224,0 GB |
| Descargas | 54 |
| Likes | 0 |
| Creado | 2025-06-08 |
| Actualizado | 2026-11-10 |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 32,7B parámetros según el recuento de safetensors del repositorio. No se ha publicado información sobre el número de capas, dimensión oculta, número de cabezas de atención, tipo de atención (completa, GQA, sliding window) ni sobre la tokenización. Tampoco hay datos sobre el corpus de entrenamiento, el número de tokens procesados, la composición del dataset ni si se aplicaron fases de RLHF, DPO o instrucción supervisada. La model card del cuantizador se limita a indicar que se trata de "static quants" del modelo base y remite a la model page del autor original para más detalles.

La innovación técnica de este repositorio es exclusivamente de compresión: se generan cuantizaciones estáticas (no imatrix) con el pipeline de mradermacher, marcadas con `quantize_version: 2` y `output_tensor_quantised: 1`, y conversión desde formato Hugging Face a GGUF. Existe además un repositorio hermano con cuantizaciones ponderadas/imatrix (`mradermacher/creative-thinker-gamma-1.25-i1-GGUF`) que el propio autor recomienda para obtener mayor calidad a igual tamaño.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, según la etiqueta de pipeline `conversational` y el tag `conversational` del repositorio.
- Razonamiento general y respuesta a instrucciones: no documentado explícitamente, pero implícito en el uso conversacional.
- Generación de código: no disponible (no se documenta entrenamiento específico en código).
- Matemáticas: no disponible.
- Visión: no soportada (el repositorio no incluye componentes multimodales).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`.
- Modo thinking explícito: no disponible.

## Casos de uso

- Asistente conversacional en inglés autoalojado: el modelo puede desplegarse con llama.cpp u Ollama usando el quant Q4_K_M (20,0 GB) para gestionar diálogos multi-turno en una máquina con 24 GB de VRAM, sin depender de APIs externas.
- Prototipado rápido en estación de trabajo: la variante Q2_K (12,4 GB) permite cargar el modelo en GPUs consumer de 16 GB para pruebas de concepto y evaluación cualitativa antes de invertir en hardware mayor.
- Generación creativa de texto (relatos, borradores, variaciones): el nombre del modelo base ("creative-thinker") y su orientación conversacional lo hacen adecuado para tareas de escritura asistida en inglés, aunque no hay benchmarks que lo confirmen.
- Chatbot de dominio cerrado con fine-tuning posterior: al estar en formato GGUF, se puede partir del quant Q8_0 (34,9 GB) para experimentar con adaptadores LoRA y luego recuantizar, siempre que la licencia del modelo base lo permita (actualmente no disponible).
- Despliegue en entornos con CPU y RAM abundante: los quants Q3_K_S (14,5 GB) y Q4_K_S (18,9 GB) permiten inferencia en CPU con llama.cpp en servidores sin GPU dedicada, útil para entornos de laboratorio o docencia.
- Evaluación comparativa de técnicas de cuantización: el repositorio ofrece once variantes del mismo modelo, lo que permite medir empíricamente la degradación de perplejidad entre Q2_K y Q8_0 en un caso real de 32,7B.
- Servicio de inferencia compatible con endpoints: la etiqueta `endpoints_compatible` sugiere integración con servidores tipo OpenAI-compatible, útil para montar una API interna de chat en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del cuantizador no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y el repositorio del modelo base no ha sido consultado en esta búsqueda. No se inventan cifras.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto):
  - Q2_K: ~12,4 GB de pesos; ~14-15 GB con contexto moderado.
  - Q3_K_S: ~14,5 GB; ~16-17 GB con contexto.
  - Q4_K_S / Q4_K_M: ~18,9-20,0 GB; ~21-23 GB con contexto.
  - Q5_K_M: ~23,4 GB; ~25-26 GB con contexto.
  - Q6_K: ~27,0 GB; ~29 GB con contexto.
  - Q8_0: ~34,9 GB; ~37 GB con contexto.
- GPU recomendadas:
  - Q4_K_M en RTX 4090 (24 GB) o RTX 3090 (24 GB): ajustado pero viable con contexto corto.
  - Q5_K_M / Q6_K en A6000 (48 GB), L40S (48 GB) o A100 40 GB.
  - Q8_0 en A100 80 GB o H100 80 GB para margen amplio.
- Cabe en GPU consumer: sí, en RTX 4090/3090 con quants Q4 o inferiores; en GPUs de 16 GB solo con Q2_K o Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con GGUF (p. ej. llama-cpp-python, text-generation-webui). vLLM y TGI no soportan GGUF de forma nativa; para esos motores habría que usar los safetensors del modelo base.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens/s para este modelo.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa: no se conocen benchmarks del modelo, ni su licencia, ni su contexto. Se ofrece una comparación estructural con alternativas de tamaño similar en formato GGUF, marcando los campos no verificables.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| creative-thinker-gamma-1.25 (este) | 32,7B | no disponible | no disponible | GGUF | 11 quants estáticos; cuantizador mradermacher |
| Modelos densos de ~30-34B en GGUF (categoría) | ~30-34B | variable | variable | GGUF | Existen múltiples alternativas de la misma franja; no se comparan por falta de datos del modelo evaluado |
| Modelos MoE de ~30B totales (categoría) | ~30B totales | variable | variable | GGUF | Menor coste de inferencia por token activo; no comparable directamente sin benchmarks |

La comparativa cuantitativa (MMLU, HumanEval, GSM8K) no está disponible para este modelo, por lo que cualquier tabla numérica sería especulativa.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Es un bloqueante para producción hasta verificar la licencia del modelo base `jukofyork/creative-thinker-gamma-1.25`.
- Idiomas: solo inglés etiquetado; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- Contexto desconocido: sin la longitud de contexto publicada no se puede dimensionar la ventana para aplicaciones de documentos largos o agentes.
- Riesgo de alucinación: inherente a los modelos generativos; no hay evaluaciones publicadas de factualidad.
- Sesgos: no documentados; al no conocerse el corpus de entrenamiento no se pueden evaluar sesgos de género, raza o ideológicos.
- Cuantizaciones agresivas: Q2_K y Q3_K_S degradan notablemente la calidad; el propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M como punto dulce.
- Repositorio con muy poca tracción: 54 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación comunitaria.
- Sin soporte nativo en vLLM/TGI: el formato GGUF limita el despliegue a llama.cpp y derivados; para alto throughput habría que recurrir a los pesos originales.
- Modelo base poco documentado: la ausencia de model card detallada en el origen impide auditar el entrenamiento y evaluar riesgos de contaminación de datos.

## Enlaces

- Repositorio GGUF (este modelo): https://huggingface.co/mradermacher/creative-thinker-gamma-1.25-GGUF
- Modelo base: https://huggingface.co/jukofyork/creative-thinker-gamma-1.25
- Cuantizaciones imatrix del mismo modelo: https://huggingface.co/mradermacher/creative-thinker-gamma-1.25-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#creative-thinker-gamma-1.25-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/
