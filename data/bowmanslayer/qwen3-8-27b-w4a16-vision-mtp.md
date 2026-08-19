# bowmanslayer/Qwen3.8-27B-W4A16-vision-mtp

## Resumen

El modelo `bowmanslayer/Qwen3.8-27B-W4A16-vision-mtp` es una cuantización de 4 bits (W4A16, grupo de 128) del modelo multimodal Qwen3.8-27B de Qwen, desarrollada por el usuario independiente bowmanslayer. Mantiene la torre de visión en bf16 sin cuantizar y añade el cabezal MTP (multi-token prediction) para permitir decodificación especulativa en vLLM. El resultado es un modelo de 19 GB en disco que cabe en dos RTX 3090 de 24 GB con paralelismo tensorial, ofreciendo una ventana de contexto de 256K tokens y un rendimiento de decodificación de 55–70 tokens por segundo en una sola petición.

La relevancia de este modelo radica en que permite ejecutar localmente un LLM multimodal de 27 mil millones de parámetros con capacidades de visión, razonamiento y tool calling en hardware de consumo (dos GPU de gama alta), sin sacrificar la ventana de contexto completa. La cuantización W4A16 con kernels Marlin mantiene la precisión del modelo original en la mayoría de tareas, como muestran los benchmarks del autor, y la inclusión del MTP head habilita la aceleración por decodificación especulativa en vLLM. Está publicado bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + visión) con atención lineal en 48 capas, cuantización W4A16 (GPTQ/Marlin), cabezal MTP opcional |
| Parametros totales | 27 mil millones (según la denominación del modelo base Qwen3.8-27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (256K) |
| Tipos de cuantizacion | W4A16 (pesos 4 bits, activaciones 16 bits), group size 128, formato GPTQ/Marlin |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers, con kernels Marlin para vLLM) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer multimodal de Qwen que procesa texto e imágenes, con una arquitectura que incorpora atención lineal en 48 capas (según la documentación del autor de la cuantización). La cuantización fue realizada por bowmanslayer mediante un pipeline propio: calibración solo con texto sobre 256 muestras de 2048 tokens del dataset `NeelNanda/pile-10k`, extracción de la torre de visión antes de la cuantización y re-adjuntado posterior en bf16, y exclusión de los pesos `linear_attn.in_proj_*` en todas las capas de atención lineal para evitar degradación. El cabezal MTP se copió tal cual del modelo original y se añadió como un archivo separado (`model-mtp.safetensors`, 849 MB) que vLLM ignora salvo que se active la decodificación especulativa.

No se dispone de información sobre el entrenamiento original de Qwen3.8-27B (número de tokens, composición del dataset, uso de RLHF o DPO). El autor de la cuantización no publica detalles adicionales sobre el proceso de calibración más allá de lo mencionado.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento (`thinking`) activado por defecto en la plantilla de chat de Qwen 3.8.
- Comprensión de imágenes: puede procesar imágenes de hasta 8 por petición (configuración verificada), incluyendo OCR, conteo de objetos, reconocimiento de colores y formas, y análisis de imágenes de gran tamaño (hasta ~2 millones de píxeles con ajuste del procesador).
- Soporte de vídeo: permite hasta 2 vídeos por petición cuando se configura `--limit-mm-per-prompt '{"image": 8, "video": 2}'`.
- Tool calling / function calling: compatible con el parser `qwen3_coder` de vLLM, lo que permite integración con herramientas externas y agentes.
- Razonamiento multi-paso y composición de múltiples herramientas (verificado en una suite mixta con 7/11 aciertos).
- Multilingüe en inglés y chino.
- Decodificación especulativa mediante el cabezal MTP (multi-token prediction), que acelera la generación cuando se activa en vLLM.
- Refusals de seguridad: 99/100 en `mlabonne/harmful_behaviors` (test split) con thinking desactivado, coherente con el método de evaluación de Qwen.

## Casos de uso

- Asistente de visión por computadora local: el modelo puede analizar imágenes (OCR, conteo de objetos, reconocimiento de colores) en un entorno sin conexión, gracias a la torre de visión en bf16 y la cuantización de 4 bits que permite ejecutarlo en dos RTX 3090. Es adecuado para tareas de inspección visual en entornos industriales o de laboratorio donde no se permite enviar datos a la nube.
- Agente conversacional con tool calling para automatización de tareas: con el parser `qwen3_coder` y el soporte de auto-tool-choice, el modelo puede orquestar llamadas a APIs, bases de datos o scripts, manteniendo un contexto de 256K tokens para conversaciones largas. Su rendimiento de ~700 tokens/segundo agregado con 16 peticiones concurrentes lo hace viable para un servicio interno de atención al cliente.
- Razonamiento matemático y lógico en entornos educativos: el modo `thinking` mejora la precisión en tareas como GSM8K (97 % de acierto en la muestra) y MATH-500 (77 %), lo que permite usarlo como tutor automático de matemáticas o generador de problemas con explicaciones paso a paso.
- Generación de código con verificación y ejecución: con tool calling y un contexto largo, el modelo puede escribir, ejecutar y depurar código en un bucle de agente, integrándose en pipelines de CI/CD para generar tests o documentación técnica. HumanEval muestra un 82,32 % de acierto en la muestra evaluada.
- Procesamiento de documentos con imágenes: facturas, formularios o capturas de pantalla pueden ser procesados localmente, combinando OCR y razonamiento textual para extraer datos estructurados. La ventana de 256K tokens permite procesar documentos extensos con múltiples imágenes.
- Análisis de vídeo para vigilancia o control de calidad: con el límite de 2 vídeos por petición, el modelo puede resumir secuencias cortas o responder preguntas sobre su contenido, siempre que el hardware lo permita (la carga de vídeo adicional consume KV cache).
- Inferencia local en hardware modesto para investigación: la cuantización W4A16 reduce el modelo a 19 GB, permitiendo experimentar con un LLM multimodal de 27B en dos GPU de 24 GB, algo inviable con el modelo original en bf16 (que requeriría ~54 GB solo de pesos).

## Benchmarks y rendimiento

El autor publicó resultados de evaluación con `thinking` activado (modo por defecto de Qwen 3.8) sobre muestras de cada benchmark. La columna "ex-truncation" corrige los fallos debidos al límite de 4096 tokens de presupuesto de muestreo, que no siempre es suficiente para que el bloque de pensamiento se cierre en preguntas difíciles.

| Benchmark | Muestras | Precisión | Precisión ex-truncation | Tasa de truncamiento |
|---|---:|---:|---:|---:|
| MMLU | 150 | 84,00 | 95,45 | 12,0 % |
| CMMLU | 150 | 84,67 | 92,03 | 8,0 % |
| C-Eval | 150 | 78,67 | 88,06 | 10,7 % |
| ARC-C | 150 | 94,00 | 94,63 | 0,7 % |
| TruthfulQA MC1 | 150 | 85,33 | 92,09 | 7,3 % |
| GSM8K | 100 | 97,00 | 98,98 | 2,0 % |
| MATH-500 | 100 | 77,00 | 79,38 | 3,0 % |
| BBH | 150 | 88,67 | 97,01 | 10,7 % |
| HumanEval | 164 | 82,32 | 91,22 | 9,8 % |
| IFEval strict | 100 | 79,00 | 91,57 | 17,0 % |

Además, el autor reporta 7/7 aciertos en una batería de imágenes sintéticas (colores sólidos, conteo de formas, OCR, conteo de cuadrículas, conteo denso de colores, prueba de redimensionado de 1808×4000) y 7/11 en una suite mixta de tool calling (8 casos estándar + 1 composición multi-herramienta + 2 casos límite donde no se debe llamar a ninguna herramienta). No se han publicado comparaciones directas con el modelo original sin cuantizar ni con otros modelos cuantizados.

## Requisitos de hardware

- VRAM estimada: los pesos del modelo ocupan 8,87 GiB por rank en cada GPU con paralelismo tensorial de 2 (TP=2). Con 24 GB por GPU, quedan 12,84 GiB libres por rank para KV cache, lo que permite una pool total de ~415K tokens.
- GPU recomendadas: 2× NVIDIA RTX 3090 de 24 GB con NVLink (configuración verificada por el autor). También debería funcionar en 2× RTX 4090 o 2× A6000, aunque no está documentado.
- No cabe en una sola GPU de consumo de 24 GB si se quiere mantener el contexto completo de 256K tokens; con un contexto reducido (por ejemplo, 32K) podría intentarse en una sola RTX 4090, pero no hay datos del autor al respecto.
- Opciones de despliegue: vLLM 0.20.2 (verificado) con `--dtype float16`, `--tensor-parallel-size 2`, `--enable-prefix-caching`, `--enable-auto-tool-choice` y `--reasoning-parser qwen3`. También es compatible con la librería transformers al estar en formato safetensors, aunque no se documenta su uso fuera de vLLM.
- Rendimiento medido: 55–70 tokens/segundo en decodificación con una sola petición y thinking activado; ~700 tokens/segundo agregados con 16 peticiones concurrentes; pico de prefill de 3 300 tokens/segundo por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Rendimiento (HumanEval) |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 256K (según configuración) | bf16 | Apache 2.0 | no disponible |
| bowmanslayer/Qwen3.8-27B-W4A16-vision (sin MTP) | 27B | 256K | W4A16 | Apache 2.0 | no disponible (misma cuantización, sin MTP) |
| bowmanslayer/Qwen3.8-27B-W4A16-vision-mtp (este) | 27B | 256K | W4A16 | Apache 2.0 | 82,32 % (muestra, thinking ON) |

No se dispone de datos de benchmarks para el modelo original sin cuantizar en las mismas condiciones de evaluación, por lo que no es posible cuantificar la pérdida exacta debida a la cuantización. Tampoco hay comparaciones públicas con otros modelos de 27B multimodales cuantizados (por ejemplo, variantes de Llama 3.1 o Qwen2.5-VL).

## Limitaciones y advertencias

- Confusión de identidad: el modelo a veces se identifica como Claude o GPT cuando se le pregunta "¿quién eres?". Es un comportamiento heredado de los datos de entrenamiento; se recomienda fijar la identidad mediante un system prompt si es relevante para el caso de uso.
- Detalle visual fino limitado: la torre de visión es la del Qwen3.8-27B original, sin mejoras por cuantización, pero modelos especializados como Qwen3-VL-* ofrecen mejor rendimiento en OCR de texto pequeño y conteo de objetos diminutos.
- Imágenes de más de ~2 millones de píxeles requieren reducción de resolución en el servidor (`--mm-processor-kwargs '{"max_pixels": 2097152}'`) o en el cliente, para evitar errores de truncamiento de tokens.
- El presupuesto de muestreo de 4096 tokens puede no ser suficiente para tareas de razonamiento largo con thinking activado, lo que provoca truncamientos y respuestas incorrectas en una fracción de los casos (hasta 17 % en IFEval).
- Idiomas limitados: solo inglés y chino; no hay soporte documentado para español u otros idiomas.
- La cuantización W4A16 puede introducir degradación de precisión frente al modelo bf16 original, aunque los benchmarks muestran valores saludables. No hay comparación directa publicada.
- La variante con MTP añade 849 MB adicionales; si no se usa decodificación especulativa, es preferible la variante sin MTP para ahorrar espacio.
- No se han evaluado sesgos específicos más allá de la prueba de seguridad de refusals; como modelo entrenado por Qwen, puede heredar sesgos de sus datos de entrenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bowmanslayer/Qwen3.8-27B-W4A16-vision-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio del pipeline de cuantización similar (documenta la receta completa): https://huggingface.co/bowmanslayer/Qwen3.8-27B-Uncensored-W4A16-vision
- No se han encontrado papers, blogs o demos adicionales del autor.
