# notaneimu/titanet-b3-speaker-student-onnx

## Resumen

TitaNet-S B3-compatible speaker student es un modelo de verificación de hablante (speaker verification) distribuido en formato ONNX por el usuario notaneimu. Se trata de un estudiante destilado a partir de un backbone NVIDIA TitaNet-S 1.19.0 preentrenado y ajustado finamente, cuyo objetivo es generar embeddings de hablante de 192 dimensiones compatibles con el espacio de enrollment del modelo ReDimNet2-B3 original. El modelo consume directamente una forma de onda mono a 16 kHz en float32 y produce un único vector normalizado, sin necesidad de Torch, NeMo ni extractores de características externos.

La relevancia de esta release es puramente práctica: busca un compromiso velocidad/calidad para escenarios de audio corto (1-5 segundos tras VAD). Según la model card, en CPU caliente logra medianas de 4.614/4.593 ms a 3 segundos, aproximadamente 11 veces más rápido que el export original de B3 medido en el mismo host. Sin embargo, el propio autor reconoce que el objetivo de calidad no se cumple: solo 8 de 15 celdas de desarrollo y 0 de 5 celdas de reunión satisfacen la tolerancia de +1 punto porcentual de EER respecto al B3 original.

Se publica como experimento de investigación, no como sustituto calibrado de producción. El repositorio es de 0.0 GB, con 0 descargas y 0 likes en el momento de la consulta, y la licencia es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN con bloques depthwise-separable (backbone TitaNet-S), pooling por atención multi-cabeza y proyección a 192 dimensiones |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 0.25 a 5 s (calidad evaluada en 1-5 s); rejilla temporal limitada a 160 frames mel |
| Tipos de cuantización | no disponible (release en FP32 ONNX) |
| Idiomas soportados | en, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 17), fichero de 22.299.879 bytes |

## Arquitectura y entrenamiento

El modelo es un estudiante convolucional que parte de un backbone NVIDIA TitaNet-S 1.19.0 preentrenado y se ajusta finamente para destilar el comportamiento de un modelo de enrollment ReDimNet2-B3 (`lm`, `vb2+vox2+cnc2_v0`, revisión `c5bbe0b76e37df698c403f8844e41304ceab6307`). El frontend incluye log-mel de 80 bins con ventana Hann de 400 muestras, FFT de 512 y hop de 160, con normalización temporal por característica, todo dentro del grafo ONNX. El encoder TitaNet usa bloques depthwise-separable de 256 canales con kernels 3/7/11/15, repeticiones 1/3/3/3 y conexiones residuales/SE, seguido de un bloque pointwise de 3.072 canales.

El pooling emplea ocho cabezas de atención compartidas que retienen los 3.072 canales de características, y una proyección final de 6.144 estadísticos agrupados a 192 coordenadas compatibles con B3. Para secuencias mel más largas que 160 frames se aplica un promedio por área en lugar de recortar la ventana, lo que cambia la resolución temporal y convierte al modelo en un estudiante aproximado, no en un reemplazo matemáticamente exacto de B3. La inferencia es determinista (sin dither ni dropout) y el grafo aplica plegado exacto para reducir trabajo redundante. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO.

## Capacidades

- Extracción de embeddings de hablante de 192 dimensiones a partir de forma de onda mono a 16 kHz en float32.
- Compatibilidad con el espacio de enrollment del ReDimNet2-B3 original para comparación por similitud coseno.
- Procesamiento de ventanas cortas de 0.25 a 5 segundos, incluyendo longitudes no enteras y la transición del límite temporal.
- Frontend de audio integrado en el grafo ONNX: no requiere extractor de características separado.
- Inferencia determinista, adecuada para pipelines reproducibles.
- Ejecución en CPU mediante ONNX Runtime CPUExecutionProvider (probado con 1.31.1).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales.
- No genera transcripciones ni timestamps: emite un único vector por ventana proporcionada.

## Casos de uso

- Verificación biométrica de locutor en dispositivos de borde: el modelo puede ejecutarse en CPU con ONNX Runtime y generar un embedding de 192 dimensiones a partir de 1-5 segundos de habla tras VAD, útil para autenticación rápida en entornos sin GPU.
- Deduplicación de hablantes en archivos de audio: para grabaciones largas se seleccionan ventanas de habla aguas arriba y se comparan los embeddings resultantes por similitud coseno, permitiendo agrupar segmentos del mismo locutor.
- Filtrado previo en pipelines de diarización: al ser un embedder ligero (22,3 MB), puede actuar como primera etapa para descartar ventanas sin habla o de baja calidad antes de modelos más pesados.
- Investigación en destilación de modelos de speaker verification: la release documenta explícitamente el tradeoff velocidad/calidad, lo que la hace útil como referencia para estudiar la compatibilidad de espacios de embedding entre arquitecturas.
- Prototipado de sistemas de enrollment con ReDimNet2-B3: si ya se dispone de enrollments generados por el B3 original, el estudiante puede generar queries compatibles sin cargar el modelo pesado, siempre que se acepte la pérdida de calidad documentada.
- Benchmarking de inferencia ONNX en CPU: el repositorio incluye scripts de benchmark y resultados comparativos frente a B0, B3, TitaNet-S y variantes CAM-B3, útiles para medir latencia en hardware propio.

## Benchmarks y rendimiento

La model card proporciona tiempos de inferencia en CPU (AMD Ryzen 9 5950X, WSL2, ORT 1.31.1, 4 hilos intra-op y 1 inter-op, batch 1, diez warmups y cincuenta llamadas medidas, dos rondas en órdenes opuestos). Se muestran medianas en ms por ronda:

| Modelo | Fichero MB | 1 s | 2 s | 3 s | 4 s | 5 s |
|---|---:|---:|---:|---:|---:|---:|
| Original B0 | 5,75 | 7,583 / 5,815 | 7,970 / 7,939 | 10,827 / 10,838 | 13,896 / 13,812 | 16,760 / 16,722 |
| Original B3 | 19,37 | 18,084 / 18,183 | 33,904 / 33,855 | 50,834 / 50,602 | 69,997 / 69,405 | 92,519 / 92,265 |
| Original TitaNet-S | 23,84 | 3,188 / 3,149 | 5,611 / 5,586 | 8,006 / 8,026 | 10,437 / 10,401 | 12,621 / 12,652 |
| Recovered CAM-B3 | 29,28 | 8,901 / 8,987 | 13,963 / 13,877 | 19,554 / 19,580 | 24,039 / 23,842 | 27,524 / 27,506 |
| Older fast TitaNet-B3 | 23,85 | 3,191 / 3,180 | 4,412 / 4,406 | 4,684 / 4,645 | 4,954 / 4,969 | 5,223 / 5, |

El estudiante reporta a 3 s medianas de 4,614/4,593 ms, aproximadamente 11,0 veces más rápido que el export original de B3 en el mismo host. En calidad, el autor indica que 8 de 15 celdas de desarrollo y 0 de 5 celdas de reunión cumplen la tolerancia de +1 punto porcentual de EER respecto al B3 original, por lo que el objetivo de calidad no se alcanza. No se publican resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la configuración probada, que usa CPUExecutionProvider; el fichero ONNX ocupa 22,3 MB en FP32.
- GPU recomendadas: no disponibles en la información proporcionada; el modelo está validado en CPU.
- Compatibilidad con GPU de consumo: no documentada; al ser un grafo ONNX de 22 MB, es plausible que quepa en cualquier GPU de consumo, pero no se ha validado en la información disponible.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider probado con 1.31.1); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia: medianas de 4,614/4,593 ms a 3 s en AMD Ryzen 9 5950X con 4 hilos intra-op y 1 inter-op; los tiempos incluyen frontend, validación, inferencia y L2 en host, y excluyen carga, resampling, VAD, arranque de sesión y captura de micrófono.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño fichero | Contexto de audio | Licencia | Disponibilidad |
|---|---|---:|---|---|---|
| TitaNet-S B3-compatible student (este) | Estudiante CNN destilado, ONNX | 22,3 MB | 0,25-5 s | Apache 2.0 | HuggingFace |
| Original B3 (ReDimNet2-B3) | Modelo de enrollment de referencia | 19,37 MB (export medido) | no disponible | no disponible | Referenciado en la model card |
| Original TitaNet-S | Backbone CNN preentrenado | 23,84 MB | no disponible | no disponible | Referenciado en la model card |
| Original B0 | Modelo CNN más pequeño | 5,75 MB | no disponible | no disponible | Referenciado en la model card |

La comparativa se limita a los modelos medidos en la propia model card; no se dispone de datos de benchmarks de calidad (EER) publicados en la información proporcionada para establecer una comparación numérica completa.

## Limitaciones y advertencias

- El objetivo de calidad no se cumple: solo 8/15 celdas de desarrollo y 0/5 celdas de reunión alcanzan la tolerancia de +1 punto porcentual de EER frente al B3 original.
- Es un estudiante aproximado, no un reemplazo exacto de B3: el promedio por área de secuencias mel largas cambia la resolución temporal.
- La compatibilidad con B3 solo está establecida para el checkpoint ReDimNet2-B3 `lm`, `vb2+vox2+cnc2_v0` en la revisión indicada; coincidir en 192 dimensiones no garantiza compatibilidad con otros checkpoints B3.
- La fidelidad en ventanas de 0,25-0,5 s no está garantizada como soporte de palabras cortas.
- El modelo emite un único vector por ventana; no proporciona frames ni timestamps.
- No se debe normalizar en pico ni rellenar con ceros para alcanzar una duración fija; el runner acepta 0,25-5 s y la calidad se evalúa en 1-5 s.
- El umbral de decisión debe calibrarse sobre una distribución de desarrollo propia; el umbral histórico de coseno 0,36 se conserva solo con fines diagnósticos y no se recomienda como valor por defecto calibrado.
- Riesgo de sesgo y alucinación: no documentado en la información disponible; al ser un extractor de embeddings, el riesgo principal es de falsos positivos/negativos en verificación, no de generación de texto.
- Idiomas declarados: inglés y ruso; el comportamiento en otros idiomas no está documentado.
- Licencia Apache 2.0 permite uso comercial, pero la calidad documentada desaconseja su uso en producción sin validación adicional.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-04), lo que indica una release muy reciente y sin validación comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/notaneimu/titanet-b3-speaker-student-onnx
- Paper referenciado (arXiv:2110.04410): no disponible el enlace directo en la información proporcionada
- Paper referenciado (arXiv:2603.11841): no disponible el enlace directo en la información proporcionada
- Repositorio del modelo de enrollment ReDimNet2: https://huggingface.co/PalabraAI/redimnet2 (referenciado en la model card)
