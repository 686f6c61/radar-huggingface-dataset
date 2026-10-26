# sadmanvt/Qwen2.5-3B-Instruct-Random15K-FullSFT-ckpt3500

## Resumen

El modelo `sadmanvt/Qwen2.5-3B-Instruct-Random15K-FullSFT-ckpt3500` es un ajuste fino supervisado (SFT) de parámetros completos sobre `Qwen/Qwen2.5-3B-Instruct`, desarrollado por el usuario sadmanvt en el contexto de una asignación denominada "Project Reasoning SFT". Su objetivo es reforzar el razonamiento matemático de tipo cadena de pensamiento larga en un modelo pequeño, mediante el entrenamiento sobre 15.000 ejemplos de razonamiento seleccionados aleatoriamente del subconjunto de 100.000 ejemplos de AceReason-1.1-SFT.

Arquitectónicamente no introduce novedades: hereda el transformer decoder-only de Qwen2.5, con 3.085.938.688 parámetros totales (aproximadamente 3,09 mil millones) y pesos en safetensors de precisión BF16 que ocupan 6,2 GB en el repositorio. El entrenamiento se realizó con una longitud de corte de 16.384 tokens, batch efectivo de 8, learning rate 5e-6, DeepSpeed ZeRO-3 con offload a CPU y FlashAttention2.

La relevancia de esta ficha es doble. Por un lado, documenta un punto de referencia ("baseline") reproducible para experimentos de SFT sobre razonamiento en modelos de 3B. Por otro, es un caso claro de checkpoint parcial: el trabajo en ARC se detuvo al alcanzar el límite de 24 horas de wall-time, en el paso 3.500 de un plan de 2 épocas, con aproximadamente 1,87 épocas completadas. Los resultados publicados corresponden, por tanto, al modelo a medio entrenar, no al run planificado de tres épocas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), heredada del modelo base; incluye atención con GQA y RoPE |
| Parámetros totales | 3.085.938.688 (~3,09 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Nativa del modelo base: 32.768 tokens (extensible a 131.072 con YaRN según la documentación de Qwen2.5). Entrenamiento realizado con corte de 16.384 tokens |
| Tipos de cuantización | El repositorio solo publica pesos BF16; no se distribuyen GGUF, GPTQ ni AWQ. La cuantización a INT8/INT4 requeriría conversión propia (llama.cpp, GPTQ, AWQ) |
| Idiomas soportados | No declarados en el repositorio; el modelo base Qwen2.5-3B-Instruct declara soporte multilingüe (29 idiomas según su model card). El ajuste fino se realizó sobre datos de razonamiento, presumiblemente en inglés y chino, aunque el autor no lo especifica |
| Licencia | No disponible en el repositorio. El modelo base Qwen2.5-3B-Instruct se publica bajo Apache 2.0, pero el autor no declara licencia para estos pesos derivados |
| Formato de pesos | safetensors (BF16), compatible con `transformers` y `text-generation-inference` |
| Tamaño del repositorio | 6,2 GB |
| Librería / pipeline | `transformers`, `text-generation` |
| Modelo base | `Qwen/Qwen2.5-3B-Instruct` |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura del Qwen2.5-3B-Instruct sin modificaciones estructurales: un transformer decoder-only con normalización RMSNorm pre-norm, activación SwiGLU en el bloque feed-forward, embeddings de tokens compartidos con la cabeza de salida y atención con query grouping (GQA) para reducir el coste de la caché KV durante la inferencia. No se han introducido capas híbridas, SSM ni mecanismos de decodificación especulativa propios.

El entrenamiento consistió en SFT de parámetros completos sobre 15.000 ejemplos de razonamiento extraídos aleatoriamente del subconjunto de 100.000 ejemplos de AceReason-1.1-SFT, con corte de 16.384 tokens, batch por dispositivo de 1 y acumulación de gradiente de 8 pasos (batch efectivo de 8), learning rate de 5e-6 con scheduler coseno, precisión BF16, gradient checkpointing activado, FlashAttention2 y DeepSpeed ZeRO-3 con offload a CPU. La semilla fue 42. No se documenta ninguna fase de RLHF, DPO o preferencias posterior al SFT, ni se detalla la composición exacta del dataset más allá de su procedencia.

El detalle crítico es que el job se interrumpió por el límite de 24 horas de wall-time en el paso 3.500, con unas 1,87 épocas completadas de las 2 previstas (el autor menciona un plan original de tres épocas). El checkpoint publicado es, por tanto, un modelo parcialmente entrenado, y los resultados de evaluación corresponden a ese estado intermedio.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del ajuste instructivo del modelo base.
- Razonamiento matemático con cadenas de pensamiento largas, reforzado específicamente por el SFT sobre ejemplos de razonamiento.
- Resolución de problemas de competición (AMC, AIME, matemáticas de grado chino, examen Kaoyan), evaluados explícitamente por el autor.
- Generación de código y tareas generales de instrucción: capacidades heredadas del modelo base, no reforzadas ni evaluadas en este ajuste.
- Soporte de tool calling / function calling: disponible en el modelo base Qwen2.5-3B-Instruct; el autor no documenta si el ajuste lo preserva.
- Capacidades multilingües: heredadas del modelo base; sin evaluación específica tras el ajuste.
- No se documentan capacidades de visión, audio ni modos de "thinking" separados con etiquetas especiales.
- No se documenta soporte de agentes ni multi-step tool use específico para este checkpoint.

## Casos de uso

- Evaluación comparativa de SFT en razonamiento: usar este checkpoint como baseline "Random-15K" frente a otras variantes de selección de datos (por ejemplo, filtrado por dificultad o por dominio) para medir el efecto de la curación del dataset en un presupuesto de cómputo fijo.
- Investigación sobre checkpoints parciales: analizar cómo evolucionan las métricas de razonamiento entre el paso 3.500 y un entrenamiento completado, útil para estudiar curvas de escalado temporal y decidir políticas de early stopping.
- Generación de soluciones matemáticas paso a paso en entornos educativos offline: con 3,09 B de parámetros puede desplegarse en una GPU de consumo y generar trazas de resolución para problemas de nivel secundario y preuniversitario.
- Prototipado de pipelines de verificación de razonamiento: comparar las cadenas generadas por este modelo con las de un modelo mayor para construir clasificadores de calidad de trazas o datasets de preferencias.
- Reproducción de experimentos: al estar documentados hiperparámetros, semilla, framework (DeepSpeed ZeRO-3, FlashAttention2) y configuración de evaluación, sirve como referencia reproducible en trabajos de ablación.
- Base para un segundo ajuste de dominio: al ser un modelo de 3B en BF16 (6,2 GB), es viable hacer LoRA o SFT completo sobre él en una sola GPU de 24 GB con gradient checkpointing para tareas de razonamiento especializadas.
- Generación de datos sintéticos de razonamiento a bajo coste: con 3B parámetros y licencia del base permisiva (pendiente de confirmar para este repo), puede emplearse para ampliar datasets de entrenamiento con trazas de CoT.

## Benchmarks y rendimiento

Resultados publicados por el autor. Configuración de evaluación: 8 respuestas muestreadas por problema, temperatura 0,6, top-p 0,95 y longitud máxima de generación de 32.768 tokens.

| Benchmark | Pass@1 | Pass@8 / Acc |
|---|---:|---:|
| AMC 2023 | 36,25 % | 72,50 % |
| AIME 2024 | 7,08 % | 23,33 % |
| CN Math 2024 | 13,33 % | 46,67 % |
| Kaoyan | 25,69 % | 65,33 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de comparación directa con otros modelos en la información disponible. El autor indica expresamente que estas cifras corresponden al checkpoint 3.500 parcialmente entrenado y no al run completo planificado, por lo que no son directamente comparables con resultados de modelos entrenados hasta convergencia.

## Requisitos de hardware

- Pesos en BF16: ~6,2 GB. En FP16, el mismo tamaño. No hay versión oficial cuantizada.
- Cuantización INT8: ~3,1 GB de pesos. Cuantización INT4 (GGUF Q4_K_M): ~1,9-2,0 GB, más overhead de contexto.
- Caché KV estimada: ~36 KB por token (36 capas, 2 cabezas KV, dimensión de cabeza 128, K y V en FP16), es decir ~1,2 GB para 32.768 tokens y ~0,6 GB para 16.384 tokens. Se puede reducir con cuantización de la caché KV en vLLM.
- GPU de consumo: cabe con holgura en RTX 4090 (24 GB) y RTX 4080/4070 Ti Super (16 GB) en BF16 con contexto largo; en RTX 3060/4060 Ti de 12 GB y 8 GB conviene usar INT8/INT4 o limitar el contexto.
- GPU de datacenter: A100 40/80 GB, H100 80 GB y L40S son sobredimensionadas para un solo modelo; permiten alto paralelismo de peticiones o tensor parallelism para throughput.
- Despliegue: `transformers` (referencia), vLLM (recomendado para serving con PagedAttention), TGI (el repo incluye el tag `text-generation-inference` y `endpoints_compatible`), SGLang. Para CPU o GPUs pequeñas hace falta convertir a GGUF y usar llama.cpp u Ollama, ya que no se publican artefactos GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens/s ni de TTFT para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (ckpt 3500) | ~3,09 B | 32.768 nativo (entrenado a 16.384) | No declarada | HuggingFace, 0 descargas | Checkpoint parcial (1,87 de 2 épocas) |
| Qwen/Qwen2.5-3B-Instruct | ~3,09 B | 32.768 (131.072 con YaRN) | Apache 2.0 | HuggingFace, ampliamente usado | Modelo base; sin refuerzo específico de razonamiento matemático |
| meta-llama/Llama-3.2-3B-Instruct | ~3,2 B | 131.072 | Llama 3.2 Community License | HuggingFace, requiere aceptación | Contexto mayor; licencia con restricciones para >700 M usuarios |
| microsoft/Phi-3.5-mini-instruct | ~3,8 B | 131.072 | MIT | HuggingFace | Ligeramente mayor; entrenado con foco fuerte en razonamiento |

No hay datos públicos que permitan comparar los benchmarks de este checkpoint con los de las alternativas en las mismas condiciones de evaluación (8 muestras, temperatura 0,6, 32k de generación). Cualquier comparación numérica con Llama-3.2-3B o Phi-3.5-mini requeriría reevaluar todos los modelos con el mismo harness.

## Limitaciones y advertencias

- Checkpoint parcial: entrenamiento detenido en el paso 3.500 (~1,87 de 2 épocas planificadas) por el límite de 24 h de wall-time. El rendimiento publicado no refleja el run completo ni el plan de tres épocas.
- Licencia no declarada en el repositorio. Aunque el modelo base Qwen2.5-3B-Instruct es Apache 2.0, la ausencia de licencia explícita en estos pesos derivados crea incertidumbre legal para uso comercial; conviene contactar con el autor antes de producción.
- Idiomas no declarados y sin evaluación multilingüe tras el ajuste: el SFT sobre datos de razonamiento puede haber degradado el rendimiento en idiomas distintos del inglés y el chino.
- Riesgo de alucinación: es un modelo de 3B; las trazas de razonamiento largas pueden contener pasos plausibles pero incorrectos, y la métrica pass@1 en AIME 2024 (7,08 %) evidencia una fiabilidad baja en problemas de alta dificultad.
- Sesgo hacia respuestas largas: el SFT sobre ejemplos de razonamiento y la evaluación con 32.768 tokens de generación sugieren una tendencia a producir cadenas de pensamiento extensas, con el coste de latencia y tokens asociado.
- Desajuste entre entrenamiento y evaluación: el corte de entrenamiento es de 16.384 tokens mientras que la evaluación permite generar hasta 32.768, lo que puede producir degradación fuera de la distribución de longitudes vistas en entrenamiento.
- Sin cuantizaciones oficiales ni GGUF: el despliegue en hardware modesto exige conversión propia, con el riesgo de pérdida de calidad no medida.
- Sin evaluación de seguridad, sesgos, tool calling ni código tras el ajuste fino.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación externa de los resultados reportados.
- El dataset de entrenamiento es un subconjunto aleatorio de AceReason-1.1-SFT; no se documenta la composición por dominio ni la posible contaminación con los benchmarks evaluados (AMC, AIME, CN Math, Kaoyan), lo que impide descartar fuga de datos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sadmanvt/Qwen2.5-3B-Instruct-Random15K-FullSFT-ckpt3500
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio de Qwen2.5 (código y documentación): https://github.com/QwenLM/Qwen2.5
- Informe técnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- Dataset AceReason-1.1-SFT (referenciado por el autor; disponible en HuggingFace): no se proporciona enlace directo en la información disponible
