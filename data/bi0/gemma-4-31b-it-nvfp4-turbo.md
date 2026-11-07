# bi0/gemma-4-31B-it-NVFP4-turbo

## Resumen

`bi0/gemma-4-31B-it-NVFP4-turbo` es una cuantizacion en formato NVFP4 (FP4 de NVIDIA con escalado por bloques) del modelo `google/gemma-4-31b-it`, publicada por el usuario `bi0` en Hugging Face. Se trata, por tanto, de un artefacto derivado y no de un modelo entrenado desde cero: el autor declara una "Blackwell NVFP4 Turbo Vision Calibration" sobre los pesos originales de Google, empaquetados en safetensors de aproximadamente 18,4 GB (19.328.385.603 bytes), con un SHA-256 documentado en la model card.

El interes de esta publicacion es operativo: apunta a hardware Blackwell (GB10, SM121), es decir, a la DGX Spark y a plataformas con soporte nativo de NVFP4. La cuantizacion a 4 bits con escalado microscale reduce de forma agresiva el peso en memoria del modelo de 31B, lo que permite ejecutarlo en un unico dispositivo de consumo profesional en lugar de requerir multiples GPU en BF16. El nombre "turbo" y la mencion a "Vision" en la model card sugieren que el proceso de calibracion incluyo datos multimodales, aunque el autor no documenta la metodologia.

La ficha presenta una limitacion importante: la model card es extremadamente escasa. No hay informacion sobre licencia, idiomas, pipeline, datos de calibracion, recetas de evaluacion ni benchmarks. Todo lo que se puede afirmar con rigor sobre el modelo base (Gemma 4 31B IT) procede de la referencia a `google/gemma-4-31b-it`, y los datos especificos de esta cuantizacion deben tratarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada (derivada del modelo base `google/gemma-4-31b-it`) |
| Parametros totales | 31B (segun el nombre del modelo y el modelo base) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 (FP4 con escalado por bloques, formato nativo de Blackwell) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | NVFP4 safetensors |
| Tamano del repositorio | 18.432,98 MB (19.328.385.603 bytes) |
| Hash SHA-256 | `c3009dada022c70f5881b5eff5c5028471c4dc6dc3b6a48cad1e7771280a0021` |
| Hardware objetivo | DGX Spark GB10, Blackwell SM121 |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-31b-it`, un modelo de la familia Gemma 4 de Google en su variante instruction-tuned de 31.000 millones de parametros. La informacion proporcionada no detalla la arquitectura interna del modelo base (tipo de atencion, capas, dimensiones ocultas, vocabulario) ni los datos de entrenamiento originales: numero de tokens, composicion del corpus, uso de RLHF o DPO. Cualquier afirmacion al respecto seria especulativa.

Lo que si documenta el autor es el proceso de cuantizacion: una conversion a NVFP4 denominada "Blackwell NVFP4 Turbo Vision Calibration". NVFP4 es un formato de coma flotante de 4 bits definido por NVIDIA que emplea escalado de bloque (tipicamente bloques de 16 elementos con un factor de escala compartido en FP8 o similar), lo que preserva mejor la precision que una cuantizacion INT4 uniforme. El autor no publica la receta de calibracion, el dataset utilizado, el numero de muestras ni las metricas de degradacion respecto al modelo en BF16. La mencion a "Vision" sugiere calibracion con datos multimodales, pero no se confirma ni el soporte de vision en el artefacto resultante ni el procedimiento seguido.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base `google/gemma-4-31b-it`, sin verificacion independiente en esta cuantizacion.
- Instrucciones y dialogo multi-turno: el sufijo `-it` del modelo base indica ajuste por instrucciones.
- Posible soporte multimodal (vision): la model card menciona "Turbo Vision Quantization", pero no se documenta ni se confirma.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el modelo base Gemma suele ser multilingue, pero no se confirma para este artefacto).
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

- Despliegue en DGX Spark GB10: el modelo esta calibrado explicitamente para SM121 y NVFP4, por lo que su uso natural es la inferencia local en una unica DGX Spark, donde el formato de 4 bits reduce el peso a ~18,4 GB y deja margen de VRAM para cache KV y contexto.
- Prototipado de asistentes conversacionales en estacion de trabajo: con 31B de parametros en 4 bits, cabe en un dispositivo Blackwell de gama profesional, permitiendo iterar sobre prompts y evaluaciones sin depender de API externa.
- Evaluacion de cuantizacion NVFP4: util para investigadores que quieran medir la degradacion de calidad de un modelo de 31B al pasar de BF16 a NVFP4 en tareas de razonamiento o generacion.
- Pipelines de generacion de codigo en local: si el modelo base conserva sus capacidades de codigo, el artefacto permite ejecutar un asistente de programacion en hardware de escritorio profesional; requiere validacion previa porque no hay benchmarks publicados.
- Procesamiento de documentos con posible componente visual: si la calibracion "Vision" preserva el encoder multimodal del modelo base, podria emplearse para extraccion de informacion de imagenes o capturas; no confirmado.
- Base para fine-tuning o experimentos de destilacion: al ser safetensors, puede servir como punto de partida para adaptaciones LoRA sobre hardware Blackwell, aunque el formato NVFP4 complica el entrenamiento directo y normalmente requeriria de-cuantizar.
- Servicio interno con vLLM: existen builds de vLLM con soporte NVFP4 (referenciados en repos de RedHatAI), lo que permitiria exponer el modelo como endpoint OpenAI-compatible en un servidor GB10.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, ni del modelo base ni de la cuantizacion. Tampoco se documenta la perdida de precision respecto a BF16.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 18.432,98 MB (~18,4 GB), por lo que se necesita al menos esa cantidad solo para los pesos, mas cache KV y overhead del runtime. En la practica, un dispositivo con 24 GB o mas es el minimo razonable; 32 GB o mas deja margen para contextos largos.
- GPU recomendadas: NVIDIA DGX Spark (GB10, SM121) es el objetivo declarado. Cualquier GPU Blackwell con soporte NVFP4 (serie RTX 50, B200, GB200) es candidata. Las arquitecturas anteriores (Hopper, Ada, Ampere) no ejecutan NVFP4 de forma nativa y requeririan de-cuantizacion o emulacion.
- ¿Cabe en GPU de consumo? Si el soporte NVFP4 esta disponible, si: una RTX 5090 con 32 GB podria alojarlo. En GPUs de 24 GB (RTX 4090) el formato no es nativo y el modelo no cabe sin de-cuantizar o particionar.
- Opciones de despliegue: vLLM con soporte NVFP4 (existen builds de RedHatAI para `gemma-4-31b-it-NVFP4`), TensorRT-LLM y runtimes de NVIDIA para Blackwell. llama.cpp y Ollama no soportan NVFP4 de forma nativa en el momento de la publicacion.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia de primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| `bi0/gemma-4-31B-it-NVFP4-turbo` | 31B | NVFP4 safetensors | No disponible | No disponible | Blackwell (DGX Spark GB10) |
| `LilaRest/gemma-4-31B-it-NVFP4-turbo` | 31B | NVFP4 | No disponible | No disponible | Blackwell |
| `RedHatAI/gemma-4-31B-it-NVFP4` | 31B | NVFP4 | No disponible | No disponible | Blackwell, vLLM |
| `google/gemma-4-31b-it` (base) | 31B | BF16 safetensors | No disponible | Terminos de Gemma (no verificados aqui) | GPU generica |

Las tres cuantizaciones NVFP4 de Gemma 4 31B IT comparten tamano y formato; se diferencian en la receta de calibracion, que ninguna documenta publicamente en la informacion disponible. La comparacion de rendimiento entre ellas no es posible sin benchmarks.

## Limitaciones y advertencias

- Ausencia total de documentacion: sin licencia, sin idiomas, sin pipeline y sin benchmarks, el artefacto no es apto para produccion sin una evaluacion propia previa.
- Riesgo de degradacion por cuantizacion: NVFP4 reduce la precision a 4 bits; en tareas sensibles (matematicas, codigo, razonamiento de varios pasos) la perdida puede ser notable. El autor no publica metricas de degradacion.
- Procedencia: el autor `bi0` no es el desarrollador original; el modelo es una modificacion de pesos de Google. La responsabilidad sobre la calidad de la calibracion recae en el publicador.
- Restricciones de licencia desconocidas: al derivar de Gemma, probablemente hereda los terminos de uso de Gemma, pero la model card no lo indica y no se puede confirmar.
- Dependencia de hardware: NVFP4 solo es eficiente en Blackwell. En otras arquitecturas el modelo no es directamente utilizable, lo que limita su portabilidad.
- Riesgo de alucinacion: inherente al modelo base; no se mitiga con la cuantizacion y no hay evaluaciones publicadas.
- Sesgos: no documentados para esta cuantizacion; los del modelo base Gemma no se detallan en la informacion proporcionada.
- Idiomas: no se especifica que idiomas conserva la cuantizacion; el castellano no esta verificado.
- Repositorio sin descargas ni likes: sin validacion de la comunidad, conviene tratar el artefacto como experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bi0/gemma-4-31B-it-NVFP4-turbo
- Modelo base: https://huggingface.co/google/gemma-4-31b-it
- Cuantizacion alternativa (LilaRest): https://huggingface.co/LilaRest/gemma-4-31B-it-NVFP4-turbo
- Cuantizacion alternativa (RedHatAI, con instrucciones de vLLM): https://huggingface.co/RedHatAI/gemma-4-31B-it-NVFP4
