# smdesai/GLiNER25-Multi-Decide-FP16-CoreML

## Resumen

GLiNER25-Multi-Decide-FP16-CoreML es una conversión a Core ML del checkpoint fastino/GLiNER2.5-multi-Decide, publicada por el usuario smdesai. Se trata de un modelo de clasificación de texto diseñado para ejecución local en dispositivos Apple (iPhone, iPad y Mac), empaquetado en FP16 como un paquete multifunción de Core ML con tres variantes de contexto: `context128`, `context256` y `context512`. El objetivo es habilitar tareas de clasificación guiada por esquema (el formato de etiquetas de GLiNER2) sin enviar datos a la nube y sin depender de un servidor de inferencia.

La arquitectura subyacente es un encoder mDeBERTa-v3-base seguido de un MLP de clasificación. Esta exportación concreta incluye únicamente la cabeza de clasificación, no las capacidades de extracción de spans del modelo original. La tabla de embeddings de palabras (250.112 × 768, el 69 % de los parámetros) se mantiene fuera del paquete para reducir el uso de memoria: se consulta fila a fila en el host y se inyecta como `inputs_embeds`.

Su relevancia actual radica en que demuestra que un modelo multilingüe de este tipo puede ejecutarse en la GPU de un iPhone con latencias medianas de 8 a 46 ms y una huella de memoria de 62 a 99 MiB, manteniendo una discrepancia máxima de 0,0038 en probabilidad respecto al oráculo FP32 en PyTorch. La validación se ha realizado únicamente en iPhone 17 Pro (iOS 27.2) y Mac M3 Max; no hay datos de dispositivos iOS 18-26 ni de GPUs más antiguas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer mDeBERTa-v3-base + MLP de clasificación (exportación Core ML multifunción) |
| Parametros totales | No disponible de forma explícita. La model card indica que la tabla de embeddings (250.112 × 768 = 192.086.016 parámetros) es el 69 % del total, lo que implica del orden de 278 millones de parámetros (estimación derivada, no confirmada por el autor) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens máximo, en tres funciones fijas: 128, 256 y 512. Se debe rellenar hasta la longitud de la función elegida; las peticiones más largas deben rechazarse, no truncarse |
| Tipos de cuantizacion | FP16 únicamente (pesos y cómputo). No se distribuyen variantes INT8, INT4 ni GGUF |
| Idiomas soportados | Multilingüe e inglés (etiquetas de la model card). Validado con corpus en inglés y otros 25 idiomas y sistemas de escritura: 26 en total |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML `.mlpackage` (pesos en `Data/com.apple.CoreML/weights/weight.bin`) más una tabla de embeddings en FP16 little-endian, row-major y sin cabecera (`word_embeddings.f16`, 384.172.032 bytes). No usa safetensors ni GGUF |
| Tokenizer | mDeBERTa-v3, Unigram de 250.000 piezas (`tokenizer.json`, `tokenizer_config.json`) |
| Tamaño del repositorio | 0,6 GB (208 MB de paquete Core ML + 384 MB de embeddings) |
| Revision del checkpoint base | `6bc1d43d201b0691e733626389af8c57eea3ea68` |
| Libreria | gliner2 |
| Pipeline | text-classification |

## Arquitectura y entrenamiento

El modelo base es fastino/GLiNER2.5-multi-Decide, un sistema GLiNER2 de clasificación y extracción estructurada guiada por esquema. Sobre ese checkpoint, esta publicación es una conversión, no un reentrenamiento: se generó con coremltools 9.0 y Torch 2.7.1 a partir de exportaciones FP16 de 128, 256 y 512 tokens, con buckets constantes de posición relativa y una máscara de atención FP16 finita, y las tres funciones se fusionaron en un único paquete multifunción con pesos compartidos. La model card no documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esos datos corresponden al modelo base y no se detallan aquí, por lo que figuran como no disponibles.

La innovación técnica principal está en el diseño de despliegue. La tabla de embeddings de palabras se extrae del grafo y se guarda como fichero plano mapeable en memoria: la aplicación copia una fila de 1.536 bytes por token (`memcpy` sobre la dirección `id * 768`), y como la LayerNorm de embeddings y el resto de la red permanecen dentro del modelo, el resultado es idéntico bit a bit a una consulta interna. Con el fichero en la caché de páginas, una consulta tarda 40-75 µs en un iPhone 17 Pro; las primeras peticiones tras la instalación tardan entre 1 y 5 ms más. Este diseño reduce el pico de memoria de la primera ejecución de 476 MiB (tabla dentro del modelo) a 85-99 MiB.

En el preprocesado, los IDs de token provienen del procesador upstream de GLiNER2 con el diseño `classify_text`: esquema `( [P] task ( [L] label ... ) )`, `[SEP_TEXT]` y después las palabras del texto en minúsculas, cada pieza tokenizada por separado, sin `[CLS]` ni `[SEP]`. La model card menciona un port a Swift que reproduce exactamente el procesador en Python (3.099 piezas y 153 peticiones en 26 idiomas).

## Capacidades

- Clasificación de texto guiada por esquema: la salida son `logits` de forma `[1, L]`, una puntuación por posición de token, y la clasificación se lee en las posiciones de los marcadores de etiqueta `[L]` definidos en el esquema.
- Tareas con múltiples etiquetas definidas en tiempo de inferencia mediante el esquema, sin reentrenamiento.
- Capacidad multilingüe validada sobre 26 idiomas y sistemas de escritura, con peticiones de 257 a 512 tokens incluidas en los corpus de prueba.
- Ejecución completamente local (on-device) en iPhone y Mac, sin conexión de red ni servidor de inferencia.
- Resultados deterministas: tres lanzamientos consecutivos producen salidas idénticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso; es un clasificador, no un modelo generativo.
- No dispone de generación de texto libre, modo de pensamiento (thinking), visión ni audio.
- Esta exportación es solo de clasificación (encoder mDeBERTa-v3-base + MLP): no incluye las funciones de extracción de spans (NER) del modelo original.
- Requiere post-procesado propio en la aplicación: el modelo devuelve logits por posición, no etiquetas finales.

## Casos de uso

- Clasificación de tickets de soporte en una app móvil: el modelo etiqueta cada incidencia según un esquema de categorías y subcategorías definido por la aplicación, sin enviar el texto del cliente a ningún servidor, con latencias de 8 a 46 ms por petición.
- Detección de datos personales antes de salir del dispositivo: se define un esquema con etiquetas como `nombre`, `correo` o `telefono` y se clasifican las posiciones del texto para decidir qué debe redactarse antes de subir contenido a un backend.
- Moderación de contenido en aplicaciones de mensajería con cifrado extremo a extremo: al ejecutarse íntegramente en el dispositivo, el modelo puede señalar mensajes abusivos o spam sin que el contenido salga del terminal.
- Triaje de documentos escaneados en apps de gestión: clasificación de facturas, recibos o contratos por tipo documental mediante esquemas distintos, útil en flujos de digitalización sin conectividad (obra, campo, almacén).
- Enrutado local previo a un LLM remoto: clasificar la intención de la consulta del usuario en el dispositivo para decidir si se responde con reglas locales o se llama a un modelo mayor, reduciendo coste y latencia de red.
- Etiquetado automático en aplicaciones de productividad y correo: clasificación de notas o mensajes por proyecto o prioridad con esquemas configurables, funcionando en modo avión.
- Análisis de encuestas y comentarios en herramientas de campo: investigadores o auditores pueden procesar lotes de respuestas multilingües en el propio portátil o dispositivo, sin dependencia de infraestructura externa.
- Preprocesado de pipelines de datos sensibles en sectores regulados: al no requerir red ni GPU de servidor, encaja en entornos donde el texto no puede salir del dispositivo por requisitos de cumplimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (no hay MMLU, HumanEval, GSM8K ni métricas equivalentes). Lo que sí publica la model card son pruebas de equivalencia funcional frente al oráculo FP32 en PyTorch, ejecutadas en un iPhone 17 Pro con iOS 27.2 y unidades de cómputo de GPU. El criterio estricto exige que todas las decisiones coincidan y que el error máximo de probabilidad sea ≤ 0,005.

| Funcion | Error maximo de probabilidad | Latencia mediana | Pico de huella de memoria |
|---|---:|---:|---:|
| context128 | 0,0032 | 8,4-9,2 ms | 62 MiB |
| context256 | 0,0038 | 14,1-14,3 ms | 67 MiB |
| context512 | 0,0038 | 39-46 ms | 94 MiB |

Con las tres funciones cargadas en un mismo proceso, el pico es de 85-99 MiB, incluida la primera ejecución tras la instalación. En un Mac con M3 Max (GPU) los errores máximos son 0,0034 / 0,0034 / 0,0038. Los corpus de validación son 43 peticiones (128), 80 (256) y 113 (512) en inglés y otros 25 idiomas. En CPU con FP16 el error llega a 0,0116 en un Mac: no cambia ninguna decisión, pero supera el umbral estricto, de ahí que se exija GPU.

## Requisitos de hardware

- Unidades de cómputo: `MLModelConfiguration.computeUnits = .cpuAndGPU` es obligatorio. No se debe usar `.cpuOnly`: FP16 en CPU no altera las decisiones, pero alcanza un error máximo de 0,0116 en Mac y supera el umbral estricto.
- VRAM o memoria unificada: huella en ejecución de 62 MiB (context128), 67 MiB (context256) y 94 MiB (context512) con una sola función cargada; 85-99 MiB con las tres. Al mantener la tabla de embeddings dentro del modelo, el primer lanzamiento pico alcanzaba 476 MiB.
- Almacenamiento necesario: aproximadamente 0,6 GB (208 MB del `.mlpackage` más 384 MB de `word_embeddings.f16`, además del tokenizer).
- GPU validadas: iPhone 17 Pro (iOS 27.2) y Mac con M3 Max. No está validado en dispositivos con iOS 18-26 ni en GPUs más antiguas.
- Encaje en hardware de consumo: sí, es un modelo pensado para hardware de consumo Apple. No hay datos publicados para GPUs NVIDIA de escritorio ni para el Neural Engine en modo aislado.
- Opciones de despliegue: Core ML con `MLModel` y `MLModelConfiguration.functionName` para seleccionar la función; Xcode compila el `.mlpackage` a `.mlmodelc` cuando se incluye en la app, y fuera de ese flujo hay que invocar `MLModel.compileModel(at:)`. El preprocesado de tokens y la consulta de embeddings se implementan en el host (la model card incluye un ejemplo en Swift).
- Frameworks no aplicables: vLLM, llama.cpp, Ollama o TGI no sirven para este artefacto, ya que no es un modelo generativo ni se distribuye en GGUF.
- Latencia y throughput: latencias medianas de 8,4-9,2 ms (128 tokens), 14,1-14,3 ms (256) y 39-46 ms (512) en iPhone 17 Pro. La consulta de una fila de embeddings cuesta 40-75 µs con el fichero en caché de páginas. No se publica throughput en peticiones por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y destino | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smdesai/GLiNER25-Multi-Decide-FP16-CoreML | Del orden de 278 M (estimación derivada; no confirmada) | 512 tokens (funciones de 128/256/512) | Core ML `.mlpackage` + tabla FP16 externa; on-device Apple | Apache-2.0 | Publicado en HuggingFace; validado solo en iPhone 17 Pro y M3 Max |
| fastino/GLiNER2.5-multi-Decide (modelo base) | No disponible en la información proporcionada | No disponible en la información proporcionada | Pesos PyTorch del checkpoint original; incluye clasificación y extracción de spans | Apache-2.0 | Público en HuggingFace |
| Otras alternativas de clasificación on-device (Core ML, ONNX Runtime Mobile, MediaPipe) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de comparativas de precisión frente a modelos de la misma categoría, por lo que no es posible establecer una comparación cuantitativa más allá de la equivalencia con el oráculo FP32 del propio checkpoint base. La diferencia funcional más relevante frente al modelo base es que esta conversión elimina la extracción de spans y conserva solo la cabeza de clasificación.

## Limitaciones y advertencias

- Límite duro de 512 tokens: las peticiones más largas deben rechazarse, no truncarse, según indica la model card.
- Solo clasificación: no incluye extracción de entidades ni spans, pese a que el modelo base sí los soporta.
- Validación de hardware muy restringida: únicamente iPhone 17 Pro (iOS 27.2) y Mac M3 Max. No hay validación en iOS 18-26 ni en GPUs antiguas, y el comportamiento en esos entornos es desconocido.
- Dependencia obligatoria de GPU (`.cpuAndGPU`): en CPU la desviación respecto al oráculo FP32 llega a 0,0116 y no cumple el criterio estricto del autor, aunque no cambie decisiones.
- Sensibilidad al preprocesado: los IDs de token deben generarse con el procesador upstream (`classify_text`, sin `[CLS]` ni `[SEP]`, cada palabra tokenizada por separado). Una tokenización distinta invalida los resultados.
- Relleno con `pad id 0` obligatorio tanto en `inputs_embeds` como en `attention_mask`; el empaquetado debe respetar la longitud exacta de la función elegida (128, 256 o 512).
- Riesgo de error: al ser un clasificador, el fallo típico son falsos positivos y falsos negativos, no alucinación generativa. La model card no publica métricas de precisión, recall ni F1 sobre ningún conjunto de evaluación, por lo que el rendimiento real en producción es desconocido.
- Sesgos: no se documenta ningún análisis de sesgo del modelo base ni de esta conversión; al ser multilingüe, es esperable un rendimiento desigual entre idiomas, pero no hay datos por idioma.
- Cobertura idiomática: aunque la etiqueta es multilingüe, la validación cubre 26 idiomas y sistemas de escritura, no el conjunto completo de idiomas del tokenizer de 250.000 piezas.
- Licencia Apache-2.0: permite uso comercial y modificaciones, con obligación de conservar avisos de copyright y licencia y de indicar los cambios realizados. Conviene verificar la licencia y los términos del modelo base al redistribuir.
- Coste de integración: es necesario implementar en la app la tokenización, la consulta de la tabla de embeddings, el post-procesado de logits y la compilación del modelo, ya que la model card describe un ejemplo en Swift pero no ofrece un SDK completo.
- Integridad de ficheros: la model card publica hashes SHA-256 para `weight.bin`, `model.mlmodel`, `word_embeddings.f16` y `tokenizer.json`; conviene verificarlos en el proceso de compilación o empaquetado.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/smdesai/GLiNER25-Multi-Decide-FP16-CoreML
- Modelo base: https://huggingface.co/fastino/GLiNER2.5-multi-Decide
- Repositorio de conversión mencionado en la model card (incluye el port a Swift del procesador): mencionado sin URL en la información disponible.
- Paper, blog o demo oficial: no disponible en la información proporcionada.
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo; los resultados devueltos corresponden a hilos de foro sin relación con el tema (incidencias de un comercio de electrónica reacondicionada).
