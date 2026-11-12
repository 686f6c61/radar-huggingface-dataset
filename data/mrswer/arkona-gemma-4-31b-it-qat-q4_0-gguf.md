# mrswer/Arkona-gemma-4-31B-it-qat-Q4_0-GGUF

## Resumen

Arkona es una compilación derivada (abliterated/decensored) del modelo Gemma 4 31B IT de Google, publicada por el usuario mrswer en Hugging Face. Se distribuye exclusivamente en formato GGUF cuantizado Q4_0, fruto de Quantization-Aware Training (QAT) sobre el checkpoint base `google/gemma-4-31B-it-qat-q4_0-unquantized`, y está pensada para su uso con llama.cpp, Ollama, LM Studio y Open WebUI. El modelo conserva la arquitectura densa de Gemma 4 con 60 capas y una ventana de contexto de 256K tokens, además de entrada multimodal de texto e imagen mediante un codificador de visión separado (`mmproj`).

La modificación principal respecto al original es la reducción sustancial de la alineación de seguridad mediante la herramienta Heretic, que aplica una transformación de direcciones latentes en las capas 30 a 41 (componentes `attn.o_proj` y `mlp.down_proj`). Según la model card, el resultado elimina las negativas en 100 de 100 prompts de prueba, con una divergencia KL de 0,0083 respecto al modelo base. Es relevante ahora porque ofrece, en un único archivo de 17,3 GB, un modelo de 31B con contexto largo y capacidades de visión que cabe en una GPU de consumo de 24 GB.

El modelo no incluye datos de benchmarks estándar (MMLU, HumanEval, GSM8K) y su uso previsto es la investigación en seguridad, estudios de alineación y red-teaming, además del uso local privado. No está recomendado para despliegues públicos o de cara al usuario final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 densa, 60 capas, transformer multimodal (texto + imagen) |
| Parametros totales | 30.697.345.596 (~30,7B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 256K tokens (256.000) |
| Tipos de cuantizacion | Q4_0 (QAT) en todos los tensores de pesos; normas en F32; codificador de visión en Q8_0 o BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (llama.cpp); archivos: `Arkona-gemma-4-31B-it-qat-Q4_0.gguf` (17,3 GB), `mmproj-Q8_0.gguf` (0,81 GB), `mmproj-BF16.gguf` (1,20 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Gemma 4 en variante densa de 31B parámetros, con 60 capas y una ventana de contexto de 256K tokens. El modelo base fue sometido a Quantization-Aware Training (QAT) por Google, de modo que los pesos se optimizaron para tolerar la cuantización Q4_0 con pérdida mínima de calidad; Arkona simplemente empaqueta esos pesos en GGUF con todos los tensores de pesos en Q4_0 y las normas en F32. La modalidad de entrada es texto e imagen, con salida de texto; el codificador de visión se distribuye aparte como `mmproj` (Q8_0 recomendado o BF16).

Sobre el checkpoint QAT, el autor aplicó una edición de abliteración con Heretic v2.0.0.dev0+custom. Los parámetros documentados incluyen `start_layer_index` 30 y `end_layer_index` 41, `lora_rank` 128, `transport` gaussiano con `transport_rank` 4, `steer_bad_behavior_weight` 0,0001, `preserve_good_behavior_weight` 1,0 y regularización ridge de 1,36e-06, entre otros. Los componentes objetivo de la intervención son `attn.o_proj` y `mlp.down_proj`. No se documentan datos de entrenamiento adicionales (número de tokens, composición del dataset ni fases de RLHF/DPO) más allá de los del modelo base de Google, que no se detallan en la información disponible.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 256K tokens.
- Entrada de imagen (image-text-to-text) mediante el codificador `mmproj`, útil para descripción, OCR y razonamiento sobre imágenes.
- Razonamiento y respuesta a instrucciones heredados de Gemma 4 31B IT.
- Generación de código y matemáticas (capacidad del modelo base; sin benchmarks publicados en esta ficha).
- Soporte de plantilla de chat con `--jinja` en llama.cpp, lo que habilita tool calling y function calling según la plantilla del modelo base.
- Compatibilidad con endpoints OpenAI (`/v1`) a través de `llama-server`, lo que facilita su integración en pipelines existentes.
- Capacidades multilingües: no disponible (no se especifica la lista de idiomas).
- Modo "decensored": reducción drástica de rechazos (0/100 en la prueba del autor), orientado a investigación de alineación.
- No dispone de entrada de audio ni vídeo (la model card elimina explícitamente esas secciones del modelo base).

## Casos de uso

- Investigación en seguridad y alineación: el modelo permite estudiar cómo varía el comportamiento al eliminar direcciones de rechazo en capas intermedias, comparando respuestas con el Gemma 4 original y midiendo divergencia KL (0,0083 documentada).
- Red-teaming y evaluación de salvaguardas: sirve como modelo "atacante" o generador de prompts adversarios para probar clasificadores y filtros de contenido en un entorno controlado.
- Análisis de documentos largos con imágenes: con 256K tokens de contexto y entrada visual, puede procesar informes extensos con figuras, tablas escaneadas o capturas y extraer conclusiones en una sola pasada.
- Asistente local privado: al ejecutarse con Ollama o llama.cpp en una GPU de 24 GB, permite conversaciones multi-turno sin enviar datos a la nube, adecuado para entornos con requisitos de confidencialidad.
- Prototipado de pipelines multimodales: mediante `llama-server` con API compatible con OpenAI, se puede integrar en aplicaciones que ya consumen endpoints `/v1` para tareas de image-to-text y clasificación.
- Experimentación con cuantización QAT: el repositorio permite evaluar la calidad real de un Q4_0 entrenado con QAT frente a cuantizaciones post-hoc, midiendo perplejidad y calidad de respuesta en tareas concretas.
- Generación de código en local para entornos air-gapped: con contexto largo y plantilla Jinja, puede emplearse en asistentes de programación sin conexión, siempre con revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card solo reporta métricas internas de la modificación:

| Metrica | Arkona | Original (gemma-4-31B-it-qat-q4_0-unquantized) |
|---|---|---|
| Rechazos (100 prompts) | 0/100 | 100/100 |
| Divergencia KL | 0,0083 | 0 (por definición) |

## Requisitos de hardware

- Pesos del modelo de lenguaje: 17,3 GB en Q4_0; codificador de visión: 0,81 GB (Q8_0) o 1,20 GB (BF16); la caché KV se suma aparte.
- GPU de 24 GB (por ejemplo, RTX 3090, RTX 4090, A10G, L4) permite descargar completamente el modelo con contexto holgado, según la model card.
- Por debajo de 24 GB de VRAM, las capas se derraman a la CPU y la generación se ralentiza considerablemente.
- GPU profesionales (A100 40/80 GB, H100) permiten contextos mucho mayores y mayor throughput, aunque no se publican cifras de latencia ni tokens/s.
- Despliegue: llama.cpp (`llama-server` con `-ngl 99 -c 16384 --jinja`), Ollama (`ollama run hf.co/mrswer/Arkona-gemma-4-31B-it-qat-Q4_0-GGUF`), LM Studio y Open WebUI.
- Parámetros de muestreo recomendados por el autor: `--temp 1.0 --top-p 0.95 --top-k 64`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Arkona (este) | ~30,7B denso | 256K | Texto + imagen | Apache 2.0 | GGUF Q4_0 | Abliterated, 0/100 rechazos |
| google/gemma-4-31B-it-qat-q4_0-unquantized | ~30,7B denso | 256K | Texto + imagen | Apache 2.0 | Safetensors (QAT) | Modelo base alineado, 100/100 rechazos |
| Gemma 4 31B IT (original) | ~30,7B denso | 256K | Texto + imagen | Apache 2.0 | Safetensors | Checkpoint censurado de referencia |

No se dispone de datos de benchmarks que permitan comparar rendimiento en tareas estándar con alternativas de otros fabricantes; la comparación se limita a parámetros, contexto, licencia y comportamiento de rechazo documentado.

## Limitaciones y advertencias

- La alineación de seguridad ha sido reducida sustancialmente: es más probable que genere contenido dañino, inexacto, sesgado u ofensivo que el modelo original.
- No debe desplegarse en servicios públicos o de cara al usuario final; el uso previsto es investigación, red-teaming y uso local privado.
- Riesgo elevado de alucinación y de respuestas no verificadas; el autor recomienda tratar todas las salidas como no confiables.
- Sesgos: no documentados específicamente, pero heredados del corpus de entrenamiento de Gemma 4 y potencialmente amplificados por la eliminación de rechazos.
- Idiomas soportados no especificados; no hay garantía de calidad fuera de los idiomas principales del modelo base.
- La licencia Apache 2.0 se aplica como obra derivada, pero los derechos del modelo base siguen siendo de Google y se enlaza la licencia específica de Gemma 4, que puede imponer condiciones adicionales de uso.
- El repositorio contiene únicamente GGUF: no es cargable con Transformers (`library_name: transformers` fue corregido en la model card).
- Sin audio ni vídeo: solo texto e imagen como entrada.
- Las evaluaciones de seguridad publicadas por Google corresponden al modelo original, no a esta variante.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/mrswer/Arkona-gemma-4-31B-it-qat-Q4_0-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-31B-it-qat-q4_0-unquantized
- Heretic (proyecto): https://heretic-project.org
- Heretic (GitHub): https://github.com/p-e-w/heretic
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Paper referenciado en tags: arxiv:2607.02770 (no verificado en la información disponible)
- Repositorio llama.cpp: no disponible en la información proporcionada
- Ollama: no disponible en la información proporcionada
