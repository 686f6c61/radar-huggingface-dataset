# bambocher/gemma-4-12B-it-qat-mlx

## Resumen

Gemma 4 12B IT QAT MLX es una conversión a formato MLX del modelo Gemma 4 12B de Google, en su variante instruction-tuned (IT) entrenada con quantization-aware training (QAT) específicamente para la rejilla q4_0 de llama.cpp. El modelo base es google/gemma-4-12B-it-qat-q4_0-unquantized, y esta versión lo reempaqueta para su uso con la librería MLX en Apple Silicon, preservando exactamente la rejilla de cuantización para la que Google entrenó el modelo. La conversión la firma el usuario bambocher y se publica bajo licencia Apache 2.0.

El modelo es multimodal: procesa texto, imágenes y audio. A diferencia de arquitecturas con encoders dedicados, el 12B no incluye encoder de visión ni de audio: las imágenes entran como parches crudos de 48×48 píxeles y el audio como tramas de forma de onda, cada una proyectada al modelo de texto mediante una proyección pequeña. Incorpora además soporte de MTP (multi-token prediction).

La relevancia de esta ficha radica en que la conversión se ha hecho de forma distinta a las conversiones habituales: en lugar de recalcular mínimos y máximos por grupo (como hace `mlx_lm.convert -q`) o usar grupo 64 (como los builds de mlx-community), se escribe cada bloque en la rejilla q4_0 exacta del GGUF de Google, con 284 lineales en 4 bits y 44 lineales seleccionados por medida en 8 bits. El resultado es un modelo de 7,89 GB que reproduce el maestro QAT con alta fidelidad (KL 0,0253, top-1 93,44 %) y corre aproximadamente 1,5× más rápido y con 3 GB menos de memoria que el build equivalente de mlx-community.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (gemma4_unified) con soporte de MTP; sin encoder de visión ni audio dedicado |
| Parámetros totales | 12.960.956.464 (12,96 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits (rejilla q4_0, grupo 32, escala bf16) en 284 lineales; 8 bits en 44 lineales seleccionados; embeddings a 6 bits; proyecciones de imagen y audio a 8 bits; normas sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 8,8 GB de repositorio |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 4 12B en su variante instruction-tuned, entrenada por Google con quantization-aware training sobre la rejilla q4_0 de llama.cpp. Esta conversión no reentrena ni ajusta los pesos: parte de los pesos maestros `gemma-4-12B-it-qat-q4_0-unquantized` y los reempaqueta en el formato afín de 4 bits de MLX con grupo 32. La equivalencia se logra configurando `scale = d` y `bias = -8d`, con lo que la rejilla afín de MLX coincide con la rejilla q4_0; los 284 lineales se escriben de este modo y cada uno se verifica contra el GGUF durante la conversión. La única diferencia es el redondeo de la escala de fp16 a bf16 (tipo de escala de MLX), con un error inferior a 1/64 de paso por peso.

La selección de los 44 lineales que se elevan a 8 bits se hizo por medida: cada lineal de texto se subió individualmente a 8 bits y se puntuó por la divergencia KL que elimina respecto a los pesos maestros bf16, normalizada por MB añadido. Los 44 mejores caben en +200 MB y corresponden casi todos a proyecciones de atención (17 V, 15 K, 10 O, 1 Q) y un lineal de MLP. El resto sigue el reparto de Google: embeddings a 6 bits (como el Q6_K del GGUF), proyecciones de imagen y audio a 8 bits (nunca entrenadas con QAT) y normas sin tocar. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo base.

## Capacidades

- Generación de texto conversacional en formato chat, con plantilla de chat y canal de razonamiento (thinking channel) que puede cerrarse.
- Procesamiento de imágenes: el modelo identifica contenido visual; en la model card se verifica que nombra el animal de una foto ("There is a red fox in this picture.").
- Procesamiento de audio: reconoce habla; en la verificación transcribe o identifica un pangrama hablado ("The quick brown fox jumps over the lazy dog").
- Multimodalidad integrada sin encoders separados: parches de imagen de 48×48 píxeles y tramas de audio proyectadas directamente al modelo de texto.
- Soporte de MTP (multi-token prediction), según las etiquetas del repositorio.
- Capacidades multilingües: no disponible (no se especifican idiomas).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en Mac: el modelo cabe en 8,1 GB de memoria en decodificación y alcanza 14,8 tokens/s en un MacBook Air M5, por lo que es viable como asistente de escritorio en equipos de 16 GB sin GPU dedicada.
- Descripción y etiquetado de imágenes: al aceptar parches de imagen directamente, puede emplearse para generar descripciones o metadatos de fotos en pipelines locales de gestión de bibliotecas multimedia.
- Transcripción y comprensión de audio: la entrada de forma de onda permite tareas de reconocimiento de habla o identificación de contenido hablado sin un modelo ASR separado, útil en prototipos de asistentes de voz.
- Prototipado multimodal en Apple Silicon: al estar en formato MLX y ocupar 7,89 GB, sirve para experimentar con visión y audio en un portátil sin infraestructura cloud.
- Evaluación de técnicas de cuantización: la model card documenta la metodología (rejilla q4_0, selección de lineales por KL por MB), lo que lo convierte en referencia para estudiar el impacto de la cuantización alineada con QAT.
- Generación de texto con razonamiento en local: el canal de pensamiento permite usarlo en tareas que requieren razonamiento previo a la respuesta, siempre dentro de un turno de chat.
- Despliegue en entornos con restricciones de memoria: con 8,1 GB de pico y licencia Apache 2.0, es apto para integrarse en aplicaciones de escritorio o edge con recursos limitados.

## Benchmarks y rendimiento

Evaluación en Wikitext-2 (test), 128 ventanas de 512 tokens, puntuado como respuesta de chat del modelo (plantilla de chat, canal de pensamiento cerrado). KL y acuerdo top-1 medidos respecto a los pesos maestros QAT en bf16.

| Modelo | Tamaño | PPL | KL vs maestro QAT | Top-1 agree |
|---|---|---|---|---|
| Maestro QAT bf16 (google/gemma-4-12B-it-qat-q4_0-unquantized) | — | 22,26 | — | — |
| Este modelo | 7,89 GB | 22,77 | 0,0253 | 93,44 % |
| mlx-community/gemma-4-12B-it-qat-4bit | 10,99 GB | 22,82 | 0,0259 | 93,35 % |
| mlx-community/gemma-4-12B-it-4bit (sin QAT) | 6,74 GB | 26,70 | 0,340 | 78,78 % |

Velocidad de decodificación en MacBook Air M5 con mlx-lm:

| Build | tokens/s | Memoria pico |
|---|---|---|
| Este modelo | 14,8 | 8,1 GB |
| mlx-community/gemma-4-12B-it-qat-4bit | 9,8 | 11,2 GB |

El autor indica que la mejora de velocidad es de aproximadamente 1,5× (una segunda pareja de medidas dio 9,2 frente a 6,4) y que el build de mlx-community mantiene todos los MLP en 8 bits. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 8,1 GB de pico en decodificación según la medición del autor; el repositorio ocupa 8,8 GB en disco y los pesos 7,89 GB.
- Cabe en Mac con 16 GB de memoria unificada con margen para contexto; el autor lo señala explícitamente.
- GPU recomendadas: Apple Silicon (M-series); las medidas se tomaron en un MacBook Air M5. Para GPU NVIDIA/AMD no hay datos en la información disponible, ya que el formato MLX está orientado a Apple Silicon.
- Opciones de despliegue: mlx-lm (librería indicada en el repositorio). No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI para este formato MLX.
- Latencia y throughput: 14,8 tokens/s en decodificación en MacBook Air M5; el autor advierte que un Mac sin ventilador sufre throttling.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Tamaño | PPL (Wikitext-2) | KL vs maestro QAT |
|---|---|---|---|---|---|---|---|
| Este modelo (bambocher) | 12,96 B | no disponible | Apache 2.0 | safetensors MLX | 7,89 GB | 22,77 | 0,0253 |
| mlx-community/gemma-4-12B-it-qat-4bit | 12 B (Gemma 4 12B) | no disponible | Apache 2.0 (heredada) | safetensors MLX | 10,99 GB | 22,82 | 0,0259 |
| mlx-community/gemma-4-12B-it-4bit | 12 B (Gemma 4 12B) | no disponible | Apache 2.0 (heredada) | safetensors MLX | 6,74 GB | 26,70 | 0,340 |
| google/gemma-4-12B-it-qat-q4_0-unquantized | 12 B (Gemma 4 12B) | no disponible | Apache 2.0 | safetensors (maestro) | no disponible | 22,26 | — |

Frente a los builds de mlx-community, este modelo ocupa 3,1 GB menos que el build QAT equivalente y 1,15 GB más que el build sin QAT, pero con una fidelidad al maestro QAT muy superior (KL 0,0253 frente a 0,340 del no-QAT). El maestro bf16 de Google es la referencia de calidad, pero no está cuantizado y no se indica su tamaño en disco.

## Limitaciones y advertencias

- No se especifican los idiomas soportados; no se puede asumir cobertura multilingüe sin verificación.
- No se dispone de longitud de contexto documentada; planificar el despliegue sin asumir una ventana concreta.
- Riesgo de alucinación inherente a los modelos de lenguaje; no hay evaluación de factualidad en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada.
- El modelo está pensado para usarse como respuesta de chat: el autor advierte que, sobre texto crudo, este checkpoint (y el propio maestro de Google) puntúa en el rango de los miles de PPL porque interpreta el texto como su propio razonamiento. Usar siempre la plantilla de chat.
- La licencia Apache 2.0 permite uso comercial, pero los pesos son una versión modificada del modelo base; conviene revisar las condiciones de uso de Gemma 4 de Google, ya que la model card solo cita la licencia Apache 2.0 del modelo base.
- El formato es MLX, orientado a Apple Silicon; no hay evidencia de funcionamiento en GPU NVIDIA u otros backends.
- La decodificación en equipos sin ventilador puede degradarse por throttling (el autor lo menciona explícitamente).
- Solo 213 descargas y 0 likes en el momento de la consulta; es un artefacto reciente y poco validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/gemma-4-12B-it-qat-mlx
- Modelo base (maestro QAT): https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- Modelo original no QAT: https://huggingface.co/google/gemma-4-12B-it
- GGUF q4_0 de Google: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-gguf
- Build QAT de mlx-community: https://huggingface.co/mlx-community/gemma-4-12B-it-qat-4bit
- Build sin QAT de mlx-community: https://huggingface.co/mlx-community/gemma-4-12B-it-4bit
- Código y notas del método: https://github.com/rromenskyi/quant-ternary/tree/main/gemma4-quant
- Notas detalladas: `docs/FINDINGS.md` ("Gemma 4 QAT in MLX on the q4_0 grid") dentro del repositorio anterior
- Scripts: `qat_mlx_pipeline.sh`, `qat_aligned_convert.py`, `qat_sensitivity.py`, `qat_eval.py` en el mismo repositorio
