# Habiquell/quell-v2

## Resumen

quell-v2 es un ajuste fino (fine-tune) del modelo Qwen/Qwen3-4B-Instruct-2507, publicado por el usuario Habiquell en HuggingFace. Se trata de un modelo derivado de un transformer decoder-only denso de aproximadamente 4.000 millones de parametros, entrenado mediante supervisión (SFT) con la librería TRL de HuggingFace sobre la base instruct de Qwen3. El repositorio no incluye información sobre el dataset, los hiperparametros ni el propósito concreto del ajuste, y la model card es prácticamente la plantilla autogenerada por TRL.

Su relevancia práctica es limitada por el momento: el modelo acumula cero descargas y cero likes, el repositorio ocupa 0,1 GB (pesos en safetensors, presumiblemente en precision reducida o parcialmente subidos), y no se han publicado resultados de evaluación. Cualquier uso en producción debería ir precedido de una validación propia, ya que no hay evidencia empírica de que el ajuste mejore al modelo base en ninguna tarea.

A efectos de evaluación, conviene tratarlo como un experimento de fine-tuning sobre Qwen3-4B-Instruct-2507: hereda la arquitectura, la ventana de contexto y las capacidades del modelo base, pero introduce un comportamiento modificado por el SFT cuyos efectos concretos no están documentados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Parametros totales | ~4.000 millones (heredados del modelo base; no confirmado en la model card de quell-v2) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; la del modelo base Qwen3-4B-Instruct-2507 es de 262.144 tokens nativos, ampliable, segun la documentacion publica de Qwen, pero no esta verificada en este repositorio |
| Tipos de cuantizacion | No especificados por el autor. Al ser un modelo de ~4B en safetensors, es convertible a GGUF (Q4_K_M, Q5_K_M, Q8_0, etc.) y a FP8/INT8 mediante herramientas estandar, aunque no se ofrecen cuantizaciones oficiales |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card contiene el marcador de posicion "licence: license"; el modelo base Qwen3-4B-Instruct-2507 se publica bajo Apache-2.0, pero la licencia de este derivado no esta declarada) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base, un transformer decoder-only denso de Qwen3 en su variante Instruct-2507, con atención completa y sin mezcla de expertos. El ajuste se realizó mediante supervisión (SFT) utilizando TRL 1.13.0, sobre Transformers 5.17.0, PyTorch 2.11.0+cu128, Datasets 5.0.1 y Tokenizers 0.23.1. No se documenta ninguna innovación arquitectónica propia: no hay decodificación especulativa añadida, ni atención lineal, ni cabezas adicionales.

La información sobre el entrenamiento es mínima. La model card no indica el número de tokens de entrenamiento, la composición del dataset, la proporción de datos en castellano u otros idiomas, ni si hubo una fase posterior de RLHF o DPO. Tampoco se publican hiperparametros (learning rate, épocas, tamaño de batch, estrategia de enmascarado de pérdida). El tag generated_from_trainer indica que el repositorio se generó con la plantilla automática de entrenamiento, lo que sugiere que no hubo una fase de documentación posterior. En consecuencia, no es posible reproducir el ajuste ni atribuir al SFT ninguna mejora medible.

## Capacidades

- Generación de texto conversacional multi-turno, con el formato de chat de Qwen3 (roles user/assistant y tokens especiales del tokenizer de Qwen).
- Razonamiento de propósito general y resolución de problemas de complejidad media, heredados del modelo base.
- Generación de código y matemáticas a nivel de un modelo de 4B, sin garantías de que el ajuste SFT haya preservado o mejorado estas capacidades.
- Soporte de tool calling y function calling: presumiblemente heredado del modelo base Qwen3-Instruct, pero no verificado en este repositorio.
- Capacidades de agente y razonamiento multi-paso: no confirmadas para este ajuste concreto.
- Multilingüismo: no disponible; no se declara ningún idioma en la ficha y no se ha publicado evaluación por idioma.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el modelo base de referencia es solo texto y no se documenta ningún añadido multimodal.

## Casos de uso

- Prototipado rápido de asistentes conversacionales: el modelo se puede cargar con `transformers.pipeline` en una GPU de consumo y usarse para validar flujos de diálogo multi-turno antes de invertir en un modelo mayor. Es adecuado por tamaño (~4B) y porque el formato de chat es el estándar de Qwen3.
- Experimentación académica con SFT: sirve como ejemplo de pipeline TRL completo (entrenamiento, subida de pesos, model card autogenerada) para comparar con otros fine-tunes sobre la misma base.
- Generación de código asistida en entornos locales: con una cuantización Q4 o Q5, puede ejecutarse en una GPU de 8-12 GB para autocompletar o explicar fragmentos de código, siempre que se valide la calidad frente al modelo base.
- Extracción y reformateo de información estructurada: tareas de resumen, clasificación de textos o conversión de texto libre a JSON, aprovechando la ventana de contexto del modelo base si se confirma su disponibilidad.
- Evaluación comparativa de fine-tunes: al compartir base con otros derivados de Qwen3-4B-Instruct-2507, permite medir el efecto del SFT en tareas controladas con un conjunto de evaluación propio.
- Despliegue en edge o en una sola GPU para demos internas: con cuantización agresiva cabe en tarjetas de gama media y puede servirse con llama.cpp u Ollama para pruebas de latencia sin coste de infraestructura.
- Redacción asistida en español: uso plausible si se valida previamente la calidad en castellano, ya que el autor no declara idiomas soportados ni datos de entrenamiento en español.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye ninguna tabla de evaluación (MMLU, HumanEval, GSM8K, MT-Bench u otras) ni comparaciones con el modelo base. Tampoco se han encontrado datos en la búsqueda web. Cualquier afirmación sobre el rendimiento relativo frente a Qwen3-4B-Instruct-2507 sería especulativa.

## Requisitos de hardware

- VRAM estimada para inferencia (sobre un modelo denso de ~4B parámetros): aproximadamente 8-9 GB en FP16/BF16, 4-5 GB en INT8, 2,5-3,5 GB en cuantización de 4 bits tipo Q4_K_M (los pesos reales del repositorio ocupan 0,1 GB, lo que sugiere una subida parcial o un formato ya comprimido; conviene verificar el contenido antes de planificar el despliegue).
- GPU recomendadas: NVIDIA A100 40/80 GB, H100, L40S o A10G para servicio en producción con FP16; RTX 4090, RTX 4080, RTX 3090 o RTX 4070 Ti para inferencia en FP16 o INT8 en local.
- Compatibilidad con GPU de consumo: sí. En cuantización de 4 bits cabe en GPUs con 6-8 GB de VRAM (RTX 3060, RTX 2060 12 GB, RTX 4060 Ti 8 GB). En CPU, con llama.cpp y Q4, funciona de forma usable aunque con latencia mayor.
- Opciones de despliegue: vLLM, Text Generation Inference (TGI), llama.cpp, Ollama y transformers como referencia. El tag endpoints_compatible del repositorio sugiere compatibilidad con los Inference Endpoints de HuggingFace.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo, TTFT ni rendimiento bajo batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| quell-v2 | ~4B (heredados) | No disponible (base: 262.144 tokens según Qwen) | No disponible | HuggingFace, 0 descargas | Fine-tune SFT sin evaluación publicada |
| Qwen/Qwen3-4B-Instruct-2507 | ~4B | 262.144 tokens nativos (ampliable) | Apache-2.0 | HuggingFace, ampliamente usado | Modelo base de quell-v2; con benchmarks publicados por Qwen |
| meta-llama/Llama-3.2-3B-Instruct | ~3,2B | 128.000 tokens | Licencia comunitaria de Llama 3.2 | HuggingFace, muy extendido | Alternativa de tamaño similar; requiere aceptar la licencia |
| google/gemma-3-4b-it | ~4B | 128.000 tokens | Licencia de Gemma | HuggingFace | Alternativa multimodal de tamaño comparable |

La comparación relevante es contra el propio modelo base: al no existir evaluación de quell-v2, no hay evidencia de mejora sobre Qwen3-4B-Instruct-2507, que además cuenta con documentación completa y licencia Apache-2.0 declarada.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks ni comparaciones con el modelo base, por lo que no puede afirmarse que el ajuste mejore nada.
- Falta de documentación del entrenamiento: sin dataset, hiperparametros ni número de tokens, no es posible auditar sesgos ni reproducir el resultado.
- Licencia no declarada: el campo de licencia es un marcador de posición. Aunque el modelo base es Apache-2.0, la licencia del derivado no está especificada, lo que supone un riesgo legal para uso comercial hasta que el autor la aclare.
- Riesgo de olvido catastrófico: un SFT sin datos documentados puede degradar capacidades del modelo base (código, matemáticas, multilingüismo) sin que el autor lo advierta.
- Idiomas no declarados: no hay garantía de calidad en castellano ni en ningún otro idioma distinto del que se usara en el dataset de ajuste.
- Riesgo de alucinación: inherente a los modelos de ~4B, y potencialmente agravado si el SFT se hizo sobre datos sintéticos o de baja calidad.
- Repositorio con 0 descargas y 0 likes: no hay señal de uso por parte de la comunidad ni informes independientes de comportamiento.
- Tamaño del repositorio anómalo: 0,1 GB es pequeño para los pesos completos de un modelo de 4B (que en BF16 rondarían 8 GB), lo que puede indicar una subida incompleta, pesos en formato comprimido, adaptadores LoRA o un error de publicación. Verificar antes de integrarlo.
- Fechas del repositorio: la fecha de creación indicada es 2026-09-18, posterior a la fecha de actualización de muchos componentes citados; conviene comprobar la coherencia del repositorio.
- Sin soporte ni mantenimiento conocidos: no hay issues, demos, papers ni contacto del autor documentados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Habiquell/quell-v2
- Modelo base Qwen/Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentación de TRL (SFTTrainer): https://huggingface.co/docs/trl/sft_trainer
