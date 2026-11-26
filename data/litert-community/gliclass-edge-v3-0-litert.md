# litert-community/GLiClass-Edge-v3.0-LiteRT

## Resumen

GLiClass-Edge v3.0 LiteRT es la conversión al formato LiteRT (el runtime de Google AI Edge para despliegue en dispositivos) del clasificador de texto zero-shot `knowledgator/gliclass-edge-v3.0`. Se trata de un encoder ModernBERT de 32,7 millones de parámetros que clasifica un texto contra hasta 25 etiquetas candidatas en una sola pasada forward, sin necesidad de reentrenamiento. El modelo original lo desarrolla Knowledgator y esta variante la publica el colectivo `litert-community`.

La relevancia de esta ficha radica en el empaquetado: los grafos `.tflite` incluyen el encoder de 10 capas, la lectura en `[CLS]` y en cada token `<<LABEL>>`, los proyectores y el scorer, de modo que el host solo debe construir la cadena de petición, tokenizar, hacer la búsqueda de embeddings y aplicar softmax o sigmoid. Esto permite clasificación zero-shot en CPU de escritorio, GPU Metal y dispositivos Android (probado en Galaxy S26) con latencias de milisegundos.

El modelo está pensado para escenarios de edge computing donde no se quiere depender de un servicio en la nube: enrutado de tickets, moderación de contenido, etiquetado de documentos o triaje de correo. La licencia Apache 2.0 y el tamaño reducido (27 MB en la variante con pesos float16) lo hacen apto para integración en aplicaciones móviles y de escritorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder ModernBERT (10 capas), clasificación zero-shot con lectura en `[CLS]` y tokens `<<LABEL>>` |
| Parametros totales | 32,7 M (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 o 256 tokens segun grafo (etiquetas, prompt y texto combinados) |
| Tipos de cuantizacion | FP32 (grafos completos) y pesos float16 con activaciones FP32 (variantes `wfp16`); export ONNX int8 disponible en repo externo |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT `.tflite`; tabla de embeddings en float16 little-endian (`tok_embeddings_fp16.bin`); tokenizer.json |

## Arquitectura y entrenamiento

El modelo subyacente es un encoder ModernBERT de 10 capas y 384 dimensiones de ocultación, con 32,7 millones de parámetros. La innovación de GLiClass consiste en concatenar el texto de entrada con hasta 25 etiquetas candidatas en una única secuencia, marcando cada etiqueta con tokens especiales `<<LABEL>>`, y puntuar todas ellas en una sola pasada forward. La cabeza de clasificación lee la representación en `[CLS]` y en cada posición `<<LABEL>>`, aplica dos proyectores y un scorer que devuelve un logit por etiqueta. El host decide entre softmax (modo single-label) o sigmoid con umbral 0,5 (modo multi-label).

La conversión a LiteRT se realizó con litert-torch 0.9.3. Los grafos incluyen el encoder, la lectura, los proyectores y el scorer; el host se encarga de la construcción de la cadena de petición, la tokenización, la búsqueda de filas en la tabla de embeddings y la aplicación de softmax o sigmoid. No se detallan en la información disponible los datos de entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF o DPO). Las variantes `wfp16` almacenan las 78 capas FULLY_CONNECTED en float16, cada una detrás de un operador DEQUANTIZE, manteniendo las activaciones en float32.

## Capacidades

- Clasificación de texto zero-shot: asigna un texto a una o varias etiquetas candidatas sin entrenamiento previo.
- Modo single-label: devuelve una distribución softmax sobre las etiquetas.
- Modo multi-label: devuelve probabilidades sigmoid independientes por etiqueta con umbral configurable.
- Hasta 25 etiquetas candidatas por petición.
- Ejecución en CPU de escritorio (API Python CompiledModel) y en GPU Metal con cómputo FP32 explícito.
- Ejecución en dispositivos Android mediante la API Kotlin CompiledModel (GPU o CPU).
- No soporta tool calling ni function calling (es un clasificador, no un modelo generativo).
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Enrutado de tickets de soporte: el modelo clasifica el texto de un ticket contra etiquetas como "problema de conectividad", "defecto de hardware", "facturación" o "petición de funcionalidad", y el sistema lo asigna al equipo correspondiente. Es adecuado por su latencia de milisegundos y su ejecución local sin coste de API.
- Moderación de contenido en aplicaciones móviles: clasificación en el propio dispositivo de comentarios o mensajes contra categorías de toxicidad o spam, sin enviar datos a un servidor, lo que reduce la latencia y preserva la privacidad.
- Triaje de correo electrónico: etiquetado automático de mensajes entrantes en categorías definidas por el usuario, ejecutado en el cliente de correo de escritorio con el grafo de 128 tokens.
- Etiquetado de documentos en pipelines de procesamiento: clasificación de fragmentos de texto extraídos de PDFs o páginas web contra taxonomías configurables, integrándose en flujos batch mediante el host Python.
- Clasificación de reseñas de producto: asignación de reseñas a aspectos concretos (calidad, envío, atención al cliente) en modo multi-label, con umbral ajustable por el desarrollador.
- Enrutado de consultas en asistentes conversacionales: determinación de la intención del usuario antes de derivar la consulta a un modelo generativo mayor, reduciendo el coste computacional del sistema global.
- Filtrado previo en sistemas de recomendación: clasificación de artículos o publicaciones contra categorías temáticas para construir índices de contenido en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card sí reporta verificaciones de equivalencia y latencia:

| Prueba | Resultado |
|---|---|
| Equivalencia con pipeline oficial `gliclass` 0.1.20 (CPU FP32) | 552 peticiones, diferencias de logit máximas de 0,009 |
| Equivalencia en Galaxy S26 GPU (FP32 explícito) | 552 peticiones, respuestas idénticas al pipeline oficial |
| Latencia en Galaxy S26 GPU, 128 tokens | mediana de 5,86 ms |
| Latencia en Galaxy S26 GPU, 256 tokens | mediana de 8,23 ms |
| Variantes `wfp16` frente a FP32 | 2 respuestas distintas de 552, ambas en empates cercanos |

## Requisitos de hardware

- VRAM estimada para inferencia: el grafo FP32 ocupa 53,7 MB (128 tokens) y 54,0 MB (256 tokens); las variantes `wfp16` ocupan 27,0 MB y 27,3 MB respectivamente. La tabla de embeddings del host añade 38,7 MB.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU de escritorio y en GPU Metal (probado en Apple M4 Max).
- Cabe en cualquier GPU consumer e incluso en dispositivos móviles; no se necesita A100 ni H100.
- Opciones de despliegue: LiteRT CompiledModel Python API (escritorio), LiteRT Kotlin API (Android), con `ai-edge-litert` 2.1.6 en escritorio y LiteRT 2.2.0 en Android. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: mediana de 5,86 ms por llamada a 128 tokens y 8,23 ms a 256 tokens en Galaxy S26 GPU; no se reportan cifras de throughput para CPU de escritorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| GLiClass-Edge v3.0 LiteRT (este) | 32,7 M | 128/256 tokens | LiteRT `.tflite` | Apache 2.0 | Optimizado para edge; verificado contra pipeline oficial |
| knowledgator/gliclass-edge-v3.0 | 32,7 M | no disponible | PyTorch/safetensors | Apache 2.0 | Modelo base; requiere PyTorch y transformers |
| cnmoro/gliclass-edge-v3.0-onnx | 32,7 M | no disponible | ONNX e int8 | no disponible | Export ONNX del mismo checkpoint |
| FluidInference/gliclass-edge-apps-coreml | no disponible | no disponible | Core ML | no disponible | Fine-tune adicional con pesos distintos; orientado a aplicaciones Apple |

## Limitaciones y advertencias

- Solo soporta inglés; el rendimiento en otros idiomas no está garantizado.
- Ventana de contexto muy reducida (128 o 256 tokens incluyendo etiquetas y prompt), lo que limita la clasificación de documentos largos sin truncado o fragmentación.
- Máximo de 25 etiquetas candidatas por petición.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí puede asignar etiquetas incorrectas cuando el texto es ambiguo o las etiquetas se solapan semánticamente.
- Las variantes `wfp16` pueden cambiar respuestas en empates cercanos (2 de 552 peticiones en las pruebas).
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar el archivo NOTICE y las licencias upstream incluidas en el repositorio.
- El modelo no ha sido evaluado en la información disponible con benchmarks estándar (MMLU, GLUE, etc.), por lo que su calidad relativa frente a alternativas no está cuantificada.
- La conversión se verificó en plataformas concretas (Apple M4 Max y Galaxy S26); el comportamiento en otros hardware no está documentado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/GLiClass-Edge-v3.0-LiteRT
- Modelo base: https://huggingface.co/knowledgator/gliclass-edge-v3.0
- Export ONNX: https://huggingface.co/cnmoro/gliclass-edge-v3.0-onnx
- Paquetes Core ML: https://huggingface.co/FluidInference/gliclass-edge-apps-coreml
- Repositorio LiteRT: https://github.com/google-ai-edge/litert
