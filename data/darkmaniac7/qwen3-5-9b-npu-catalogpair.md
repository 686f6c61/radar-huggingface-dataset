# darkmaniac7/Qwen3.5-9B-NPU-catalogpair

## Resumen

Qwen3.5-9B-NPU-catalogpair es un paquete de aceleración por NPU publicado por darkmaniac7 para ejecutar el modelo Qwen3.5 9B en la aplicación TokForge sobre teléfonos con Snapdragon 8 Elite Gen 5. No es un modelo con pesos propios: es un conjunto de 49 binarios de contexto QNN compilados para la NPU Hexagon V81, junto con el grafo MNN y los ficheros de configuración que los orquestan. El pack se apoya en una descarga concreta del modelo base, con la que se empareja por hash, y solo acelera la lectura de prompts largos; la generación de cada token de la respuesta sigue ejecutándose en CPU con el modelo descargado.

El modelo base es Qwen/Qwen3.5-9B, desarrollado por el equipo Qwen, y el pack se exporta desde la conversión taobao-mnn/Qwen3.5-9B-MNN. Su relevancia es acotada pero específica: demuestra una partición práctica de inferencia entre NPU y CPU en un dispositivo móvil de gama alta, con cuantización int4 en bloques de 64 y activaciones fp16, y permite estudiar el comportamiento de un transformer híbrido (24 núcleos de atención lineal y 8 de atención completa) sobre hardware Hexagon.

La licencia declarada del repositorio es apache-2.0, el tamaño del repo es de 4,0 GB y la descarga del pack es de 3,97 GB (3.969.739.312 bytes). La model card está truncada en la sección de uso, por lo que faltan datos sobre contexto, idiomas y rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pack de inferencia NPU (binarios de contexto QNN) para Qwen3.5 9B; el modelo base emplea un transformer híbrido con 24 núcleos de atención lineal y 8 de atención completa distribuidos en 32 capas |
| Parámetros totales | 9B en el modelo base; el pack no contiene pesos propios |
| Parámetros activos | No aplica: no es un modelo MoE según la información disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int4 en bloques de 64, con escalas y offsets redondeados a fp16; activaciones fp16; codificación QNN BW_FLOAT_BLOCK (una escala y un offset por canal de salida y bloque) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | Binarios de contexto QNN (`qnn/graph0.bin` a `qnn/graph48.bin`), grafo MNN (`qnn/llm.mnn`), `qnn/llm_config.json`, `config_qnn.json`, `MANIFEST.json` con sha256 y tamaños, y `SHA256SUMS` |

## Arquitectura y entrenamiento

El pack no entrena nada: es un artefacto de exportación y compilación. Se genera con MNN llmexport (rama de TokForge, commit `ff4e17202305`) a partir de los pesos int4 de la descarga emparejada, con activaciones fp16 y tablas rotatorias introducidas como entradas fp32. El grafo se corta antes de la capa de salida, de modo que el pack no puede producir respuestas por sí solo. Cada capa lineal conserva exactamente los códigos de 4 bits en bloques de 64 del modelo original; únicamente sus escalas y offsets se redondean a fp16. La herramienta `compilefornpu` divide las 32 capas en 49 grafos NPU atendiendo a 24 cortes de atención lineal y 40 cortes escalares, cada uno con una forma de trozo de 128 filas y otra de 1 fila.

La compilación se realiza con el SDK Qualcomm AI Engine Direct de QAIRT 2.51.40.260930 para Snapdragon 8 Elite Gen 5, con opciones HTP estrictas: nivel de optimización 3, precisión relajada fp16, sigmoide de alta precisión, fusión avanzada de activaciones desactivada, 8 MB de VTCM, 4 hilos HVX, compartición de pesos y UDMA extendido. El proceso valida 98 de 98 comprobaciones de entradas y salidas declaradas y relee los 49 binarios de contexto contra su declaración (49 de 49). En ejecución, la NPU procesa el prompt en trozos de 128 tokens; la CPU asume los 24 núcleos de atención lineal, los 8 de atención completa con su caché de clave/valor, algunas normas pequeñas y la búsqueda de embeddings. El tramo final del prompt que no completa un trozo de 128 tokens y todos los tokens de la respuesta se calculan en CPU con la descarga emparejada.

## Capacidades

- Lectura de prompts largos en la NPU del Snapdragon 8 Elite Gen 5, en trozos de 128 tokens.
- Generación de texto delegada íntegramente a la descarga emparejada de Qwen3.5 9B: el pack no incluye capa de salida.
- Ejecución de las proyecciones, bloques MLP y la mayor parte de las normas de las 32 capas en la NPU.
- Cálculo en CPU de los núcleos de atención lineal y completa, la caché de clave/valor, el lookup de embeddings y el cierre del prompt.
- Degradación controlada: si la NPU se detiene durante una respuesta, la CPU la finaliza con el modelo descargado.
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: no disponible en la información.
- Modos especiales (thinking, visión, audio): no disponible en la información.

## Casos de uso

- Asistente local privado en smartphone: un dispositivo Snapdragon 8 Elite Gen 5 con 24 GB de memoria puede ejecutar Qwen3.5 9B sin conexión, manteniendo los datos en el teléfono y usando la NPU para absorber prompts largos de contexto personal.
- Aceleración de prefill en RAG local: para consultas con documentos extensos incrustados en el prompt, la NPU procesa los trozos de 128 tokens y reduce el coste de la fase de prefill, mientras la CPU genera la respuesta.
- Investigación sobre partición NPU/CPU: el pack documenta con precisión qué capas van a Hexagon y cuáles permanecen en CPU, lo que permite medir el impacto de mover atención lineal y completa al procesador.
- Evaluación de cuantización int4 en Hexagon: sirve para estudiar la pérdida de calidad de pesos int4 en bloques de 64 con escalas fp16 frente a la ejecución en CPU o GPU del mismo modelo.
- Desarrollo de aplicaciones sobre TokForge: los integradores pueden activar el modo NPU en la app y comparar latencia y consumo frente al modo solo CPU en el mismo dispositivo.
- Pruebas de despliegue en hardware de referencia: el pack se validó en un RedMagic 11 Pro con Snapdragon 8 Elite Gen 5 y 24 GB, por lo que es útil como banco de pruebas para verificar que los 49 grafos cargan correctamente antes de distribuir una build.
- Docencia y demostraciones de inferencia on-device: permite mostrar en un taller cómo se compila un LLM de 9B a binarios QNN y qué restricciones impone el runtime de Qualcomm.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta datos deValidación de carga (49 de 49 grafos cargados en la NPU), memoria ocupada por la parte NPU (hasta 6,62 GB) y tamaño de la descarga (3,97 GB). No hay cifras de latencia, throughput, MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- Chip compatible: exclusivamente Snapdragon 8 Elite Gen 5 (SM8850) con NPU Hexagon V81. No hay soporte para otras generaciones ni para otros fabricantes.
- Memoria: unos 6,6 GB solo para la parte NPU, además del modelo descargado; en la práctica requiere un teléfono con 24 GB de RAM.
- Almacenamiento: 3,97 GB para el pack y espacio adicional para la descarga emparejada de Qwen3.5 9B (repo de 4,0 GB).
- Software: TokForge 1.3.9.6 o superior, que incluye el runtime QAIRT 2.51.40.260930; versiones anteriores no pueden usar el pack.
- GPU dedicadas: no aplica; el pack está compilado solo para Hexagon V81.
- Cabe en GPU de consumo: no aplica en el sentido habitual; el hardware objetivo es la NPU móvil, no una GPU de escritorio.
- Opciones de despliegue: únicamente la aplicación TokForge con el modo NPU activado; no hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.
- Dispositivo de validación: RedMagic 11 Pro (Snapdragon 8 Elite Gen 5, 24 GB), donde cargaron los 49 grafos y la parte NPU ocupó hasta 6,62 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| darkmaniac7/Qwen3.5-9B-NPU-catalogpair | 9B (base) | no disponible | Binarios de contexto QNN + grafo MNN | int4 bloques de 64, escalas fp16 | apache-2.0 | Solo Snapdragon 8 Elite Gen 5 + TokForge 1.3.9.6+ |
| darkmaniac7/Qwen3.5-9B-MNN | 9B | no disponible | MNN | int4 | apache-2.0 | Descarga emparejada obligatoria del pack NPU; ejecutable en MNN |
| taobao-mnn/Qwen3.5-9B-MNN | 9B | no disponible | MNN | int4 | apache-2.0 | Conversión upstream de referencia |
| darkmaniac7/Qwen3.5-0.8B-NPU-catalogpair | 0,8B (base) | no disponible | Binarios de contexto QNN + grafo MNN | no disponible | no disponible | Snapdragon, requiere TokForge y pack emparejado |

## Limitaciones y advertencias

- Compatibilidad restringida a un único chip: Snapdragon 8 Elite Gen 5 (SM8850, Hexagon V81). Cualquier otro SoC queda fuera.
- Dependencia de la app TokForge 1.3.9.6 o superior y del runtime QAIRT 2.51.40.260930; no es un artefacto autónomo.
- Requiere en la práctica 24 GB de memoria en el teléfono, lo que limita su uso a un conjunto muy reducido de dispositivos.
- El pack no contiene pesos propios ni capa de salida: sin la descarga emparejada exacta (verificada por hash) no se utiliza, y la calidad de la respuesta depende por completo de ese modelo descargado.
- Cuantización int4: aunque se preservan los códigos originales, las escalas y offsets se redondean a fp16, lo que puede introducir una degradación adicional frente a la ejecución en bf16.
- Ausencia total de benchmarks publicados: no hay datos objetivos de calidad, latencia ni consumo que permitan comparar con alternativas.
- Model card truncada: la sección de uso está incompleta, y no se documentan longitud de contexto, idiomas soportados ni comportamientos de tool calling.
- Riesgo de alucinación y sesgos heredados del modelo base Qwen3.5 9B, no evaluados en esta ficha.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: validación comunitaria nula.
- Licencia apache-2.0 declarada para el pack; conviene verificar los términos aplicables al modelo base y a la conversión MNN de origen antes de un uso comercial.
- El modo NPU se degrada silenciosamente a CPU si la comprobación del pack en el dispositivo no pasa, lo que puede alterar las expectativas de rendimiento en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/darkmaniac7/Qwen3.5-9B-NPU-catalogpair
- Descarga emparejada (commit `c674515e3aa3`): https://huggingface.co/darkmaniac7/Qwen3.5-9B-MNN/tree/c674515e3aa300f157797dc04a77a8828247a86d
- Conversión MNN de origen: https://huggingface.co/taobao-mnn/Qwen3.5-9B-MNN
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Equipo Qwen en HuggingFace: https://huggingface.co/Qwen
- Sitio de TokForge: https://tokforge.ai
- Discord de TokForge: https://discord.gg/Acv3CBtfVm
- Aplicación en Google Play: https://play.google.com/store/apps/details?id=dev.tokforge
- TestFlight de iOS: https://testflight.apple.com/join/jnufjzRr
- Pack equivalente para 0,8B: https://huggingface.co/darkmaniac7/Qwen3.5-0.8B-NPU-catalogpair
