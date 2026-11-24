# Mr-DS-ML-85/RadixArk_DaisyRose-27B-UD-IQ2_XS-GGUF

## Resumen

DaisyRose-27B es un modelo de lenguaje multimodal (image-text-to-text) desarrollado por RadixArk, derivado de Qwen3.8-27B mediante un post-entrenamiento basado exclusivamente en aprendizaje por refuerzo (RL) sobre aproximadamente 1.200 tareas de agente de horizonte largo cuidadosamente seleccionadas. El modelo conserva de forma byte a byte la arquitectura, el tokenizador y la plantilla de chat de Qwen3.8-27B, lo que permite reutilizar mapas tensoriales de cuantización diseñados para el modelo base. Esta ficha concreta describe la requantización comunitaria UD-IQ2_XS publicada por Mr-DS-ML-85, orientada a ejecución en hardware de gama baja.

La relevancia de esta variante radica en su compresión extrema: un modelo de 26.900 millones de parámetros reducido a 7,69 GB (2,31 bits por peso) mediante una receta de cuantización dinámica inspirada en Unsloth Dynamic V3.1, con 755 tensores repartidos en 12 tipos de cuantización distintos. Esto permite ejecutar un modelo de 27B en una GPU de 8 GB de VRAM o incluso en CPU, a costa de una degradación de calidad que el autor no cuantifica.

Se distribuye en formato GGUF para llama.cpp y requiere una versión mínima del motor (`b94959a`, 19 de noviembre de 2026) que soporte el layout tensorial fusionado de la familia Qwen3.5 (`attn_qkv_gate`, `ssm_beta_alpha`). Incluye un archivo de proyección multimodal separado (`mmproj`) necesario para el procesamiento de imágenes y una variante con cabeza MTP para decodificación especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion lineal (DeltaNet/SSM) y atencion completa, derivado de Qwen3.8-27B; layout tensorial fusionado de la familia Qwen3.5 |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (los ejemplos de uso emplean `-c 8192` y `-c 1024`) |
| Tipos de cuantizacion | GGUF UD-IQ2_XS: 12 tipos por tensor (F32, IQ1_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ3_XXS, IQ3_S, IQ4_XS, Q2_K, Q3_K, Q4_K, Q8_0); 2,31 bpw |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base DaisyRose-27B parte de Qwen3.8-27B y aplica un post-entrenamiento basado únicamente en RL sobre unas 1.200 tareas de agente de horizonte largo, con un coste declarado de 18 días en 144 GPU H200. No se especifica en la información disponible la composición del dataset, el número de tokens de entrenamiento ni si se emplearon técnicas adicionales como DPO. La arquitectura subyacente combina capas de atención lineal de tipo DeltaNet con estados SSM (`ssm_a`, `ssm_conv1d`, `ssm_dt`, `ssm_beta_alpha`) y atención clásica, siguiendo el diseño de la familia Qwen3.5.

La innovación técnica de esta publicación concreta no está en el entrenamiento sino en la cuantización: se aplica la selección de capas por tensor de la receta Unsloth Dynamic V3.1 (extraída de la cabecera de su `UD-IQ2_XS` para Qwen3.8-27B) a los pesos de DaisyRose. Las primeras capas se cuantizan a IQ1_S, el último bloque recibe IQ3_S/Q3_K/IQ4_XS y la cabeza de salida mantiene Q3_K, siguiendo la curva clásica de "más bits donde más importan". Las normas y parámetros SSM críticos se conservan en F32. La variante `-MTP` añade el bloque NextN (`blk.64.*`, 15 tensores, 8 en Q4_0) para decodificación especulativa con `--spec-type draft-mtp`.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat idéntica a Qwen3.8-27B.
- Razonamiento explícito: el modo *thinking* está activado por defecto en la plantilla.
- Procesamiento de imágenes y texto (pipeline `image-text-to-text`), previa carga del archivo `mmproj-DaisyRose-27B-f16.gguf`.
- Capacidades de agente y razonamiento multi-paso, heredadas del post-entrenamiento RL sobre tareas de horizonte largo.
- Soporte de tool calling / function calling a través de la plantilla Jinja (`--jinja`).
- Multilingüe limitado a inglés y chino.
- Decodificación especulativa mediante cabeza MTP en la variante correspondiente.

## Casos de uso

- Despliegue en estaciones de trabajo sin GPU dedicada: con 7,69 GB de pesos y planificación `--pof auto`, el modelo puede repartir las capas 0-15 en host (1,30 GB) y las 15-64 en GPU (5,50 GB), permitiendo inferencia de un 27B en equipos modestos.
- Prototipado de agentes en local: las capacidades de razonamiento multi-paso y tool calling permiten construir pipelines de agente en una sola máquina antes de migrar a infraestructura mayor.
- Análisis de imágenes en entornos con VRAM limitada: con el `mmproj` cargado, admite entrada image-text-to-text en una GPU de 8 GB, útil para clasificación o descripción de imágenes en edge.
- Evaluación comparativa de cuantizaciones: sirve como referencia de la degradación de calidad de un 27B a 2,31 bpw frente a cuantizaciones mayores del mismo modelo base.
- Inferencia en CPU para tareas de procesamiento por lotes no interactivas, donde el throughput de 5,7 tok/s en RTX 4060 resulta aceptable para generación asíncrona.
- Investigación sobre decodificación especulativa: la variante MTP permite medir tasas de aceptación de borradores en un modelo multimodal comprimido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta métricas de velocidad en una RTX 4060 de 8 GB con `-ngl 14 -c 1024`: 5,7 tok/s para el archivo ligero y 5,2 tok/s para la variante MTP en decodificación simple, sin medir la tasa de aceptación del borrador especulativo.

## Requisitos de hardware

- VRAM estimada: 7,69 GB para los pesos del archivo ligero; 7,93 GB para la variante MTP; 0,93 GB adicionales para el `mmproj` si se usa entrada de imagen.
- GPU recomendadas: RTX 4060 8 GB verificada por el autor con `-ngl 14`; con `-ngl 99` se produce OOM porque los pesos no dejan espacio para la caché KV. GPUs de 12-16 GB permiten mayor offload de capas y contextos más largos.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB o más con offload parcial de capas; también en CPU.
- Opciones de despliegue: llama.cpp ≥ `b94959a` (obligatorio), Ollama, LM Studio y KoboldCpp solo si su llama.cpp embebido es igual o posterior a esa versión. SGLang y vLLM no soportan GGUF. `inx` (Infernix) falla por esperar el layout tensorial dividido.
- Latencia y throughput: 5,7 tok/s (archivo ligero) y 5,2 tok/s (MTP) en RTX 4060 8 GB con `-ngl 14 -c 1024`; sin datos para otras configuraciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DaisyRose-27B UD-IQ2_XS (esta ficha) | 26,9B | no disponible | GGUF IQ2_XS, 2,31 bpw, 7,69 GB | Apache 2.0 | Hugging Face, comunidad |
| Qwen3.8-27B UD-IQ2_XS (Unsloth) | 27B | no disponible | GGUF IQ2_XS, 7,63 GB | Apache 2.0 | Hugging Face, oficial Unsloth |
| RadixArk/DaisyRose-27B (base) | 26,9B | no disponible | safetensors (BF16 presumiblemente) | Apache 2.0 | Hugging Face, oficial |

El archivo ligero es un 0,83% más grande que el `UD-IQ2_XS` oficial de Unsloth para Qwen3.8-27B, diferencia atribuible a los pesos del post-entrenamiento RL. No se dispone de datos de rendimiento comparado entre estas variantes.

## Limitaciones y advertencias

- No es una publicación oficial de Unsloth: la receta de selección de capas es de Unsloth, pero los pesos, la imatrix y el empaquetado son trabajo comunitario, sin garantías de calidad.
- No se han publicado evaluaciones de la degradación de calidad a 2,31 bpw; a esta tasa de bits es esperable una pérdida notable de precisión en razonamiento y código, aunque no cuantificada.
- Requiere llama.cpp ≥ `b94959a`; versiones anteriores abortan al cargar con `check_tensor_dims: tensor 'blk.0.ssm_beta.weight' not found`.
- Incompatible con `inx` (Infernix) por el layout tensorial fusionado, y con SGLang y vLLM por ser GGUF.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado.
- El modo *thinking* está activado por defecto, lo que incrementa la latencia y el consumo de tokens si no se desactiva.
- Riesgo de alucinación inherente a los modelos de 27B comprimidos a 2 bits, sin datos específicos publicados.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos de RL podrían imponer condiciones adicionales no detalladas en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Mr-DS-ML-85/RadixArk_DaisyRose-27B-UD-IQ2_XS-GGUF
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- Motor Infernix (inx): https://huggingface.co/Mr-DS-ML-85/Infernix
- llama.cpp (commit mínimo `b94959a`): https://github.com/ggml-org/llama.cpp
- Receta Unsloth Dynamic V3.1: no disponible como enlace en la informacion proporcionada
