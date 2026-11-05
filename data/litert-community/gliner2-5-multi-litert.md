# litert-community/GLiNER2.5-Multi-LiteRT

## Resumen

GLiNER2.5-Multi-LiteRT es la conversión oficial del modelo de extracción de entidades GLiNER2.5 Multi (fastino/gliner2.5-multi-v1) al formato LiteRT (antes TensorFlow Lite) para su despliegue en dispositivos Android, con soporte explícito de aceleración GPU. El modelo original es un sistema de reconocimiento de entidades nombradas (NER) y extracción de información de tipo zero-shot: en lugar de tener una lista fija de tipos de entidad, acepta un esquema de etiquetas definido en tiempo de inferencia, de modo que el desarrollador puede pedir "persona", "organización", "producto" o cualquier categoría arbitraria sin reentrenar.

La arquitectura subyacente es un encoder mDeBERTa-v3-base (aproximadamente 86 millones de parámetros en el encoder) combinado con el cabezal BoundaryExtractor propio de GLiNER2, que modela los límites de los spans en lugar de clasificar token a token. Esta conversión a LiteRT separa el grafo denso (encoder, boundary encoder, query head y proyecciones por token) del resto del pipeline: el host tokeniza el texto, construye las entradas y ejecuta el decodificador disperso después de la inferencia. Se distribuyen tres ventanas de contexto (128, 256 y 512 tokens) en variantes de pesos fp16 y fp32.

Su relevancia actual radica en que permite ejecutar extracción de entidades multilingüe (inglés y japonés) completamente en local sobre un smartphone Android, con aceleración GPU mediante LiteRT 2.2.0, sin enviar texto a un servidor. El autor reporta paridad exacta de spans (F1 de 1.000) con la implementación oficial fp32 de GLiNER2 en las ventanas de 128, 256 y 512 tokens sobre conjuntos de prueba bilingües.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder mDeBERTa-v3-base + BoundaryExtractor (boundary encoder, boundary query head, proyecciones por token); grafo denso exportado a LiteRT |
| Parametros totales | no disponible (el encoder base mDeBERTa-v3-base ronda los 86 M; el total del pipeline no se especifica en la informacion disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Tres ventanas: 128 tokens (48 slots de texto), 256 tokens (192 slots) y 512 tokens (384 slots); las entradas mas largas se rechazan, no se truncan |
| Tipos de cuantizacion | Pesos fp16 (`wfp16`, 96 tensores FULLY_CONNECTED en float16, resto en float32) y fp32 de referencia; no se mencionan otros formatos |
| Idiomas soportados | Multilingue, con soporte declarado de ingles (`en`) y japones (`ja`); sin detector de idioma, el splitter se elige por peticion |
| Licencia | Apache 2.0 |
| Formato de pesos | `.tflite` (LiteRT); tablas de embeddings en `.bin` (fp16 y fp32); decodificador disperso en `.safetensors` |

## Arquitectura y entrenamiento

El modelo es la exportación a LiteRT del checkpoint fastino/gliner2.5-multi-v1, que combina un encoder transformer mDeBERTa-v3-base con el cabezal BoundaryExtractor de GLiNER2. El grafo exportado contiene únicamente la parte densa: el encoder, el boundary encoder, la boundary query head y las proyecciones por token. Recibe filas de embeddings de palabra y devuelve un tensor float32 empaquetado con 17 salidas lógicas. El host se encarga de la tokenización, la búsqueda de filas en la tabla de embeddings y, tras la inferencia, de ejecutar el decodificador disperso original (16 tensores, 860.676 bytes).

La conversión se realizó con LiteRT Torch y se validó en un Samsung Galaxy S26 (SM-S942Q, SM8850, Android 16) con LiteRT 2.2.0 y computación GPU FP32 explícita. En cada ventana publicada, los spans coinciden exactamente con la implementación oficial fp32 de GLiNER2 sobre las entradas bilingües que caben en la ventana (70, 75 y 80 entradas respectivamente, span F1 de 1.000). La NPU Hexagon del teléfono coincidió en 69/70, 72/75 y 77/80 conjuntos de spans, por lo que se reporta pero no se ofrece como ruta soportada. Un detalle técnico relevante: el almacenamiento de pesos en fp16 no fija la precisión de cómputo de la GPU; es necesario solicitar FP32 explícitamente, ya que con la precisión por defecto las salidas siguen siendo finitas pero uno de cada 70 conjuntos de spans cambia.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Extracción de entidades nombradas zero-shot: el esquema de etiquetas se define en tiempo de inferencia; el ejemplo de la model card usa cinco etiquetas (persona, organización, localización, producto y fecha).
- Reconocimiento de spans con modelado de límites (boundary-based), en lugar de clasificación token a token.
- Soporte bilingüe declarado de inglés y japonés, con elección explícita de splitter: `whitespace` para texto separado por espacios (inglés) y `char` para japonés y otras escrituras CJK.
- Procesamiento de texto mixto mediante elección manual del splitter; no hay detector de idioma automático.
- Tres ventanas de capacidad (128, 256 y 512 tokens) con rechazo explícito de entradas que no caben, en lugar de truncado silencioso.
- Ejecución en dispositivo con aceleración GPU (LiteRT) y ruta de referencia en CPU; la NPU Hexagon funciona con pequeñas discrepancias pero no está soportada oficialmente.
- No se mencionan en la información disponible capacidades de generación de texto, razonamiento general, código, matemáticas, visión, audio, tool calling ni agentes.

## Casos de uso

- Extracción de entidades en aplicaciones Android offline: el modelo se integra como `.tflite` en una app y procesa texto localmente con la GPU del teléfono, sin enviar datos a un servidor; adecuado para apps de notas, correo o mensajería que necesitan detectar personas, organizaciones y fechas en el propio dispositivo.
- Anonimización y cumplimiento de privacidad en el borde: al detectar nombres de persona y organización antes de que el texto salga del dispositivo, permite enmascarar datos personales en registros, transcripciones o formularios sin depender de servicios externos.
- Procesamiento de documentos japoneses: con el splitter `char` y la ventana de 512 tokens (384 slots de texto), puede extraer entidades de párrafos cortos en japonés, un caso poco cubierto por modelos NER desplegables en móvil.
- Enriquecimiento de contactos y CRM en movilidad: extraer organización, localización y fecha de correos o mensajes para etiquetar automáticamente registros, usando la ventana de 128 tokens para textos breves con menor coste de cómputo.
- Estructuración de información en pipelines de back-office: el host puede ejecutar el mismo grafo en CPU de escritorio, de modo que el modelo sirve tanto para validación en servidor como para despliegue móvil con idénticos resultados (paridad F1 de 1.000 reportada).
- Preprocesado para sistemas de búsqueda o resumen: la salida de spans puede alimentar índices o resúmenes en aplicaciones donde el contexto es corto y se necesita latencia baja en dispositivo.
- Prototipado de esquemas de etiquetas personalizados: al ser zero-shot, permite iterar sobre categorías de entidad (por ejemplo, "producto" o "fecha") sin reentrenar, útil en pruebas de concepto sobre corpus bilingües.

## Benchmarks y rendimiento

| Prueba | Ventana 128 (48 slots) | Ventana 256 (192 slots) | Ventana 512 (384 slots) |
|---|---|---|---|
| Paridad de spans con GLiNER2 fp32 oficial (GPU FP32) | 70/70 entradas, span F1 1.000 | 75/75 entradas, span F1 1.000 | 80/80 entradas, span F1 1.000 |
| Coincidencia en NPU Hexagon | 69/70 conjuntos de spans | 72/75 conjuntos de spans | 77/80 conjuntos de spans |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los datos anteriores son pruebas de paridad funcional frente a la implementación de referencia, no evaluaciones de calidad NER sobre corpus públicos.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; el despliegue objetivo es móvil. Los ficheros `.tflite` ocupan entre 191,9 MB (ventana 128, `wfp16`) y 250,2 MB (ventana 512, `wfp16`); las variantes fp32 van de 364,0 MB a 422,4 MB.
- Memoria adicional del host: tabla de embeddings `word_embeddings_fp16.bin` de 384,2 MB (o 768,3 MB en fp32) y decodificador disperso de 860.676 bytes; el repositorio completo pesa 3,0 GB.
- GPU recomendadas: no se especifican modelos de GPU de escritorio; la validación oficial se realizó en la GPU de un Samsung Galaxy S26 (SM8850) con LiteRT 2.2.0. La ruta de referencia es CPU de escritorio con Python 3.12.
- ¿Cabe en GPU consumer? No se proporcionan datos de VRAM para GPUs de escritorio; el diseño está orientado a GPU móvil y CPU.
- Opciones de despliegue: LiteRT (`ai_edge_litert.compiled_model.CompiledModel`) con aceleradores CPU y GPU; el runtime Python del host (`host_assets/runtime/`) construye entradas, desempaqueta salidas y ejecuta el decodificador original. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| GLiNER2.5-Multi-LiteRT (este) | no disponible (encoder mDeBERTa-v3-base) | 128 / 256 / 512 tokens (ventanas fijas) | Multilingue, en, ja | Apache 2.0 | `.tflite` LiteRT, Android GPU/CPU |
| fastino/gliner2.5-multi-v1 | no disponible (mismo encoder) | no disponible | Multilingue, en, ja | Apache 2.0 | Safetensors (checkpoint original) |
| Modelos NER transformer convencionales (p. ej. BERT-base NER) | ~110 M | 512 tokens | Depende del checkpoint | Variable | PyTorch / ONNX, servidor |

La comparación con alternativas desplegables en móvil no está disponible en la información proporcionada. La diferencia principal frente al checkpoint original es el formato y la separación host/grafo, no la arquitectura ni los pesos.

## Limitaciones y advertencias

- Las entradas que exceden la ventana elegida se rechazan, no se truncan; el desarrollador debe seleccionar la ventana adecuada o partir el texto.
- La capacidad se mide en slots de texto procesados y tokens codificados, no en caracteres: un texto que termina en `。` consume un slot extra porque el procesador añade un punto final.
- No hay detector de idioma: el texto mixto requiere elegir el splitter manualmente, y una elección incorrecta degrada la extracción.
- La NPU Hexagon no está soportada oficialmente y presenta discrepancias (hasta 3 de 80 conjuntos de spans en la ventana de 512).
- Con la precisión de cómputo GPU por defecto, uno de cada 70 conjuntos de spans difiere de la referencia; hay que solicitar FP32 explícitamente para obtener paridad.
- El modelo solo realiza extracción de entidades y spans; no genera texto, no razona de forma general y no soporta tool calling ni agentes.
- Riesgo de alucinación de spans y sensibilidad a sesgos del corpus de entrenamiento del modelo base: no se documentan en la información disponible análisis de sesgo ni tasas de error sobre corpus públicos.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del checkpoint base y de los ficheros de tokenizer incluidos.
- La validación se limita a un único dispositivo (Samsung Galaxy S26) y a LiteRT 2.2.0; el comportamiento en otros SoC o versiones de LiteRT no está documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/litert-community/GLiNER2.5-Multi-LiteRT
- Modelo base: https://huggingface.co/fastino/gliner2.5-multi-v1
- LiteRT (repositorio oficial): https://github.com/google-ai-edge/litert
- Paper de referencia (arXiv:2507.18546): https://arxiv.org/abs/2507.18546
