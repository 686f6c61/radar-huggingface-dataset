# AlekseyCalvin/LFM3_3d_dft_v1_st180_ablit_exp7

## Resumen

LFM3_3d_dft_v1_st180_ablit_exp7 es un fine-tune experimental del modelo vision-lenguaje LiquidAI/LFM3-VL-2B, publicado por el usuario AlekseyCalvin en Hugging Face. El modelo parte de la familia LFM3 (Liquid Foundation Models, tercera generación) de Liquid AI y se presenta como una variante "abliterated" y "uncensored": se ha modificado la dirección de rechazo en los pesos del decodificador de lenguaje para que el modelo deje de negarse a responder peticiones, tanto si la instrucción llega como texto como si llega incrustada en una imagen. El codificador visual y el proyector se mantienen idénticos al modelo original.

El interés técnico reside en el procedimiento de abliteración aplicado sobre un modelo multimodal: en lugar de reutilizar la dirección de rechazo medida en el modelo de texto LFM3-1.7B, el autor vuelve a medirla sobre el modelo VL y la "cuece" (baking) en 40 matrices de salida del bloque de lenguaje, de las cuales 37 coinciden con las seleccionadas en el modelo de texto. Según la model card, este enfoque reduce los rechazos de 13 a 0 sobre 200 peticiones de HarmBench y mantiene o mejora ligeramente el rendimiento en GSM8K y GPQA Diamond.

El modelo tiene 1.918.181.888 parámetros (aproximadamente 1,9 mil millones), se distribuye en safetensors BF16 y en varias cuantizaciones GGUF, y está pensado para inferencia local en GPUs de consumo. Es relevante ahora porque combina dos tendencias activas: los modelos pequeños multimodales desplegables en una sola GPU y las técnicas de abliteración para eliminar el alineamiento de rechazo, un área de creciente interés tanto en investigación como en aplicaciones que requieren respuestas sin filtros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (codificador visual + proyector + decodificador de lenguaje LFM3); etiqueta `lfm3_vl` |
| Parametros totales | 1.918.181.888 (~1,9 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (según el ejemplo de `llama-server -c 32768` de la model card) |
| Tipos de cuantizacion | GGUF Q2_K, Q4_K_M, Q8_0, BF16; safetensors BF16 |
| Idiomas soportados | No disponible (la model card no los enumera) |
| Licencia | lfm-open-license-v1.0 (etiqueta `license: other`) |
| Formato de pesos | safetensors (BF16), GGUF (Q2_K, Q4_K_M, Q8_0, BF16) + mmproj GGUF para visión |

## Arquitectura y entrenamiento

El modelo es un fine-tune por abliteración de LiquidAI/LFM3-VL-2B. La parte de lenguaje conserva la arquitectura del LFM3-1.7B: 24 capas y 48 matrices de salida de bloque (24 capas × 2), con 286 tensores de nombres y formas idénticas al modelo de texto, aunque con valores de pesos distintos (similitud coseno mediana por tensor de 0,888 respecto al 1.7B). El codificador visual y el proyector no se han modificado respecto al original.

El entrenamiento no consistió en un ajuste supervisado convencional, sino en una intervención sobre los pesos: se calculó la dirección de rechazo como la diferencia entre los estados ocultos medios de prompts censurados y prompts ordinarios, y se eliminó ("baking") de las matrices de salida seleccionadas. Se probaron dos variantes: reutilizar la dirección medida en el modelo de texto 1.7B (38 lugares) o volver a medirla sobre el modelo VL (40 lugares, 37 solapados). La dirección remedida presentó una similitud coseno mediana de 0,65 con la del 1.7B. La variante publicada es la remedida, que redujo los rechazos de 13 a 0 sobre 200 peticiones de HarmBench. No se dispone de información sobre el volumen de tokens de entrenamiento ni sobre el dataset de abliteración.

## Capacidades

- Generación de texto conversacional multi-turno en inglés (idiomas adicionales no documentados).
- Comprensión de imágenes y texto combinados (pipeline `image-text-to-text`): responde a instrucciones cuyo contenido clave puede estar solo en la imagen.
- Modo "thinking" activado por defecto, igual que el modelo original: razona antes de responder.
- Razonamiento matemático y de sentido común (GSM8K) y razonamiento científico de nivel experto (GPQA Diamond).
- Uso con herramientas y agentes: la model card menciona uso agéntico con herramientas (por ejemplo OpenCode) y recomienda temperatura 0.3 para reducir repeticiones de llamadas a herramientas.
- Respuestas sin rechazo ante peticiones que el modelo original declinaba, tanto en texto como en imagen (abliterated/uncensored).
- Compatible con endpoints (etiqueta `endpoints_compatible`) y con `trust_remote_code` en transformers.

## Casos de uso

- Investigación sobre alineamiento y seguridad: evaluar cómo la abliteración afecta a la tasa de rechazo y al rendimiento en tareas de razonamiento, comparando el modelo con su base original sobre HarmBench, MM-SafetyBench, GSM8K y GPQA.
- Análisis de imágenes con instrucciones complejas: el modelo puede describir y razonar sobre el contenido de una imagen cuando la petición clave está incrustada en ella, útil en pipelines de inspección visual o extracción de información de capturas y documentos.
- Asistente local en GPU de consumo: con la cuantización Q4_K_M (1,10 GB) y el mmproj BF16 (0,38 GB) cabe en GPUs de 8-16 GB y permite desplegar un asistente multimodal privado sin conexión.
- Agente de codificación en local: la model card documenta su uso con herramientas tipo OpenCode; puede emplearse para búsquedas de ficheros, edición y tareas multi-paso con tool calling, ajustando la temperatura a 0,3.
- Generación de contenido sin filtros para entornos controlados: aplicaciones de escritura creativa o análisis de material sensible donde los rechazos del modelo base resultan un obstáculo, siempre que la licencia y el contexto legal lo permitan.
- Evaluación comparativa de cuantizaciones: al ofrecer Q2_K, Q4_K_M, Q8_0 y BF16, sirve para estudiar la degradación de un modelo multimodal pequeño bajo cuantización agresiva en llama.cpp.
- Prototipado rápido de aplicaciones visión-lenguaje: con `llama-server` y la API compatible con OpenAI (`image_url`), se puede integrar en un backend sin infraestructura dedicada.

## Benchmarks y rendimiento

Datos publicados en la model card (transformers, BF16, thinking activado, una ejecución por benchmark, RTX 5070 Ti de 16 GB):

| Benchmark | Original | Este modelo |
|---|---|---|
| HarmBench: respondidas sin rechazo (de 200 peticiones de texto) | 9 | 173 |
| MM-SafetyBench: respondidas sin rechazo (de 200 peticiones con imagen) | 101 | 185 |
| GSM8K: correctas (de 100) | 90 | 91 |
| GPQA Diamond: correctas (de 198) | 42 | 49 |

La model card indica además que la variante que reutilizaba la dirección del 1.7B seguía rechazando 13 de 200 peticiones de HarmBench, frente a 0 de la variante publicada. No se han publicado resultados de MMLU, HumanEval ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: BF16 en safetensors ocupa 3,84 GB; GGUF Q8_0, 1,85 GB; Q4_K_M, 1,10 GB; Q2_K, 0,75 GB. Para entrada de imagen hay que sumar el mmproj BF16 (0,38 GB).
- GPU recomendadas: el autor ejecutó todos los benchmarks en una RTX 5070 Ti de 16 GB. Cualquier GPU con 8 GB o más debería acomodar las cuantizaciones Q4_K_M y Q8_0; BF16 requiere alrededor de 5 GB solo para pesos, más caché KV para 32.768 tokens.
- Cabe en GPU de consumo: sí, en tarjetas de 8-16 GB (RTX 3060/4060/4070/5070 Ti, entre otras) con cuantización Q4_K_M o Q8_0.
- Despliegue: transformers (`AutoModelForImageTextToText` con `trust_remote_code=True`), llama.cpp (`llama-server` con `--mmproj`, `-ngl 99`, `-fa on`, `--jinja`) y endpoints compatibles con la API de OpenAI. No se documenta soporte explícito de vLLL, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles. La model card solo indica que el GGUF se verificó cargando en llama.cpp (CUDA, build 12004) y describiendo una imagen de prueba, sin benchmarks.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (LFM3_3d_dft_v1_st180_ablit_exp7) | ~1,9 B | 32.768 | Imagen + texto | lfm-open-license-v1.0 | Abliterated; 173/200 sin rechazo en HarmBench; 91/100 en GSM8K |
| LiquidAI/LFM3-VL-2B (base) | ~1,9 B | 32.768 | Imagen + texto | lfm-open-license-v1.0 | Original alineado; 9/200 sin rechazo en HarmBench; 90/100 en GSM8K |
| rSalone/LFM3-VL-2B-uncensored | ~1,9 B | 32.768 | Imagen + texto | no disponible | Abliteración de referencia citada en la model card; 0/200 rechazos en HarmBench según el autor |
| LFM3-1.7B-uncensored-abl38 | ~1,7 B | no disponible | Solo texto | no disponible | Variante de texto cuya dirección de rechazo se reutilizó en el experimento |

No se dispone de datos de benchmarks de modelos de otras familias (por ejemplo, alternativas de ~2B multimodales) en la información proporcionada, por lo que la comparación se limita a la familia LFM3.

## Limitaciones y advertencias

- Modelo "uncensored": la abliteración elimina los mecanismos de rechazo, por lo que puede generar contenido dañino, ilegal o inexacto sin advertencia. No es apto para despliegues públicos sin moderación externa.
- Riesgo de alucinación: es un modelo de ~1,9 B; su fiabilidad en razonamiento complejo y conocimiento factual es limitada (49/198 en GPQA Diamond).
- Idiomas: la model card está en inglés y no documenta la cobertura multilingüe; el rendimiento en castellano no está verificado.
- Repetición de llamadas a herramientas en uso agéntico a temperatura 0,1, según observación del autor; se recomienda 0,3, aunque el efecto no se ha medido formalmente.
- Licencia lfm-open-license-v1.0 (etiqueta `license: other`): es necesario revisar el texto de la licencia antes de cualquier uso comercial; no es una licencia permisiva estándar.
- El modelo se publica como experimento (`exp7`, `ablit`, `st180`), con 0 descargas y 0 likes en el momento de la consulta; no hay garantía de mantenimiento ni de soporte.
- Los benchmarks se ejecutaron con una sola pasada por prueba (1 run each), sin intervalos de confianza, lo que limita la significación estadística de las diferencias observadas.
- Las cuantizaciones GGUF se generaron sin imatrix y solo se comprobó que cargan y describen una imagen; su calidad no está evaluada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AlekseyCalvin/LFM3_3d_dft_v1_st180_ablit_exp7
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Variante de referencia citada: https://huggingface.co/rSalone/LFM3-VL-2B-uncensored
- Modelo de texto para abliteración: https://huggingface.co/rSalone/LFM3-1.7B-uncensored-abl38
- Paper LFM3 (referencia arXiv de los tags): https://arxiv.org/abs/2406.11717
- Paper de referencia arXiv: https://arxiv.org/abs/2402.04249
- Paper de referencia arXiv: https://arxiv.org/abs/2311.17600
- Paper de referencia arXiv: https://arxiv.org/abs/2110.14168
- Paper de referencia arXiv: https://arxiv.org/abs/2311.12022
