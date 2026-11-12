# Popohara/4B_enhanced_RL_step100

## Resumen
Popohara/4B_enhanced_RL_step100 es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-4B-Base, publicado por el usuario Popohara. Por los tags y el nombre del repositorio, se trata de una iteracion intermedia de un proceso de aprendizaje por refuerzo (RL) sobre el checkpoint base, en el paso 100, con el objetivo declarado de "mejorar" el modelo mediante RL. El modelo conserva la arquitectura y el pipeline del original: un modelo causal multimodal de tipo image-text-to-text.

El modelo base Qwen3.5-4B pertenece a la familia Qwen3.5 de Alibaba, que introduce una arquitectura hibrida que combina Gated Delta Networks (atencion lineal) con atencion con compuertas (Gated Attention) y una capa de vision con fusion temprana. El checkpoint tiene 4.659.865.088 parametros totales en formato safetensors (aproximadamente 4B nominales) y un contexto nativo de 262.144 tokens, extensible hasta 1.010.000.

La relevancia de esta ficha radica en que se trata de un modelo derivado de una familia reciente con capacidades multimodales y de contexto largo, pero publicado por un tercero sin model card propia ni resultados de evaluacion. Cualquier uso en produccion debe partir de la verificacion empirica del checkpoint, ya que el autor no documenta el proceso de RL ni los datos empleados.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal hibrido con vision encoder; mezcla de Gated DeltaNet (atencion lineal) y Gated Attention, con FFN |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (el modelo base no se describe como MoE en la informacion proporcionada) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible en la ficha del fine-tune; el modelo base declara 201 idiomas y dialectos |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura del Qwen3.5-4B base: un modelo de lenguaje causal con encoder de vision y fusion temprana de tokens multimodales. La parte de lenguaje tiene una dimension oculta de 2560, 32 capas, embedding de tokens de 248.320 (con padding) y salida LM atada al embedding. El layout es hibrido: 8 bloques de la forma 3 x (Gated DeltaNet -> FFN) seguidos de 1 x (Gated Attention -> FFN). Las Gated DeltaNet usan 32 cabezas de atencion lineal para V y 16 para QK, con dimension de cabeza 128. Las Gated Attention usan 16 cabezas para Q y 4 para KV, con dimension de cabeza 256 y RoPE de dimension 64. La FFN tiene dimension intermedia 9216. El modelo se entrena con Multi-Token Prediction (MTP) en varios pasos.

Sobre el entrenamiento especifico de este checkpoint no hay informacion: el autor no publica model card, no detalla el algoritmo de RL, el dataset, el numero de tokens ni si hubo RLHF, DPO o GRPO. El nombre "enhanced_RL_step100" sugiere una iteracion temprana de un pipeline de RL, pero no se puede confirmar el metodo ni la magnitud del ajuste respecto al base. El modelo base, segun su model card, se entreno con pre-entrenamiento y post-entrenamiento, con RL escalado en entornos multiagente y una infraestructura asincrona de RL.

## Capacidades
- Generacion de texto y razonamiento: hereda las capacidades del Qwen3.5-4B base, con resultados declarados en MMLU-Pro y MMLU-Redux.
- Comprension de imagenes y texto (image-text-to-text): pipeline multimodal con encoder de vision integrado.
- Codigo y matematicas: el modelo base declara paridad cross-generacional con Qwen3 y mejoras sobre Qwen3-VL en razonamiento, codigo y agentes.
- Soporte multilingue: el base declara 201 idiomas y dialectos; el fine-tune no documenta cambios en esta cobertura.
- Tool calling / function calling: no documentado explicitamente en la informacion disponible para este checkpoint.
- Agentes y razonamiento multi-paso: el base se entrena con RL en entornos multiagente; el fine-tune no detalla si conserva o modifica esta capacidad.
- Contexto largo: ventana nativa de 262.144 tokens, extensible hasta 1.010.000.
- Modo thinking: no disponible en la informacion proporcionada para este checkpoint.

## Casos de uso
- Analisis de documentos extensos con imagenes: gracias a su contexto nativo de 262.144 tokens, puede procesar informes, contratos o expedientes completos junto con figuras y tablas, manteniendo coherencia entre secciones.
- Extraccion de informacion de facturas y formularios escaneados: el pipeline image-text-to-text permite leer documentos visuales y devolver campos estructurados, util en automatizacion de back-office.
- Asistencia en investigacion multimodal: resumir papers con graficos, comparar figuras entre articulos y responder preguntas sobre metodologia y resultados en una sola sesion.
- Generacion y revision de codigo en repositorios medianos: con contexto largo puede recibir varios ficheros y proponer cambios, aunque requiere validacion empirica al no haber benchmarks propios del fine-tune.
- Chat de atencion al cliente con historial largo: la ventana de 262K permite conservar conversaciones multi-turno y contexto de cuenta sin truncamiento agresivo.
- Prototipado de agentes con entrada visual: al ser compatible con transformers, vLLM y SGLang, puede integrarse en bucles de agente que reciben capturas de pantalla o imagenes y ejecutan acciones.
- Despliegue en hardware de gama media: con 4B parametros y cuantizacion adecuada (no documentada en el repo) podria ejecutarse en GPUs de consumo, aunque la cuantizacion debe generarse a partir de los safetensors.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible para este checkpoint. La model card del autor no incluye evaluaciones propias. Los datos de la tabla siguiente corresponden al modelo base Qwen3.5-4B segun la model card de Qwen, no al fine-tune de Popohara, y se incluyen solo como referencia del punto de partida.

| Benchmark | Qwen3.5-4B (base) | Qwen3.5-9B | GPT-OSS-20B | Qwen3-30BA3B-Thinking-2507 |
|---|---|---|---|---|
| MMLU-Pro | 79,1 | 82,5 | 74,8 | 80,9 |
| MMLU-Redux | no disponible en el extracto | no disponible en el extracto | 87,8 | 91,4 |

## Requisitos de hardware
- VRAM estimada para inferencia en BF16/FP16: aproximadamente 9,3 GB solo para pesos (el repo ocupa 9,3 GB), mas overhead de activaciones y cache KV; en la practica se recomiendan 12-16 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 5-6 GB de pesos; en 4 bits, alrededor de 3 GB, aunque estas cuantizaciones no estan publicadas y habria que generarlas.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para despliegue en BF16 con contexto largo; RTX 4090 (24 GB) suficiente para BF16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y, con cuantizacion, en GPUs de 8-12 GB; el contexto de 262K exige mucha memoria de cache KV y no es viable en GPUs pequenas sin tecnicas de atencion eficiente.
- Opciones de despliegue: transformers, vLLM, SGLang y KTransformers segun la model card del base; llama.cpp y Ollama requeririan conversion a GGUF, no incluida en el repo.
- Latencia y throughput: no disponible; no se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| Popohara/4B_enhanced_RL_step100 | 4,66B | 262.144 (ext. 1,01M) | apache-2.0 | Si (image-text-to-text) | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B-Base | 4B | 262.144 (ext. 1,01M) | apache-2.0 | Si | Hugging Face, oficial |
| Qwen3.5-9B | 9B | no disponible en el extracto | apache-2.0 (segun familia) | Si | Hugging Face, oficial |
| GPT-OSS-20B | 20B | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias
- Ausencia de model card propia: el autor no documenta el proceso de RL, los datos, la semilla ni los hiperparametros, lo que impide reproducir o auditar el ajuste.
- Sin benchmarks del fine-tune: los resultados del base no garantizan que el checkpoint "step100" mantenga o mejore el rendimiento; un paso temprano de RL puede degradar capacidades si el reward no esta bien calibrado.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; sin evaluacion del checkpoint no se puede descartar un aumento tras el RL.
- Sesgos: no documentados para este fine-tune; hereda los sesgos del corpus de entrenamiento del base.
- Idiomas: la cobertura de 201 idiomas corresponde al base; el fine-tune no declara cambios, pero tampoco los descarta.
- Licencia: apache-2.0 permite uso comercial, pero el usuario debe verificar el cumplimiento de la licencia del modelo base y de los datos de RL empleados, no publicados.
- Produccion: al tener 0 descargas y 0 likes, no hay evidencia de uso en comunidad; se recomienda evaluacion exhaustiva antes de desplegar.
- Contexto largo: la extension hasta 1.010.000 tokens no esta verificada en este checkpoint y suele implicar degradacion de calidad y alto coste de memoria.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Popohara/4B_enhanced_RL_step100
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
