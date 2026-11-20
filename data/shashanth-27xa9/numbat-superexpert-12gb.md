# shashanth-27xA9/Numbat-SuperExpert-12GB

## Resumen
Numbat-SuperExpert-12GB es un modelo de lenguaje causal publicado por el usuario shashanth-27xA9 en Hugging Face, derivado del modelo base burner22/numbat. Se presenta como una versión comprimida mediante la técnica propietaria AW-SECD (Activation-Weighted Super-Expert Consolidation & Residual Drift Compensation) de un supuesto modelo fundacional MoE de 14 billones de parámetros, con el objetivo de hacerlo ejecutable en equipos de consumo con 16 GB de memoria. El repositorio declara 6.341.935.104 parámetros totales en formato safetensors y un tamaño de repo de 31,2 GB.

La propuesta del autor se centra en la reducción de huella de memoria: afirma una compresión de 28.000 GB de VRAM a 12 GB de RAM, con un GGUF Q4_K_M de 17,28 GB, y una retención del 95,6 % del conocimiento del modelo original. El modelo se distribuye con licencia Apache 2.0 y soporte declarado para transformers, llama.cpp y Ollama, además de una versión GGUF pre-cuantizada.

Es relevante ahora porque se posiciona en la categoría de modelos "on-device" con capacidades declaradas de razonamiento, matemáticas y código, y porque su model card incluye resultados de benchmarks (ARC-Challenge, GSM8K, HumanEval) y verificación de hardware en Apple Silicon, GPU NVIDIA y CPU. No obstante, la información disponible no permite verificar de forma independiente las afirmaciones sobre el modelo base de 14T ni sobre la técnica AW-SECD, por lo que deben tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal LM con mixture-of-experts (MoE) declarada; requiere custom_code |
| Parametros totales | 6.341.935.104 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit; GGUF Q4_K_M (17,28 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento
La model card describe el modelo como un causal LM basado en una arquitectura de mezcla de expertos (MoE) y etiquetado como "super-moe" y "super-expert". El autor indica que deriva de un modelo fundacional MoE de 14 billones de parámetros mediante AW-SECD, una técnica que, según la documentación, consolida expertos ponderados por activación y compensa la deriva residual para preservar el conocimiento del modelo original tras la compresión. No se especifican detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La innovación técnica declarada es la propia AW-SECD, que el autor presenta como responsable de mantener más del 95 % del rendimiento de razonamiento en un espacio de 4 bits. La model card también menciona "zero-drift" para el razonamiento multi-paso, aunque no se aportan detalles de implementación, ablaciones ni comparaciones controladas que permitan evaluar la técnica. El modelo requiere `trust_remote_code=True`, lo que implica código personalizado no auditado en el repositorio.

## Capacidades
- Generación de texto conversacional y causal, con plantilla de prompt `<|user|>` / `<|assistant|>`.
- Razonamiento científico y de sentido común, ejemplificado con preguntas de tipo ARC-Challenge.
- Razonamiento matemático multi-paso, ejemplificado con problemas de tipo GSM8K.
- Generación de código Python, ejemplificado con problemas de tipo HumanEval.
- Ejecución local en CPU, GPU y Apple Silicon mediante llama.cpp, Ollama, LM Studio y Jan.ai.
- Compatibilidad con endpoints y despliegue en Google Colab y Kaggle.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de pensamiento explícito.

## Casos de uso
- Asistencia conversacional offline: el modelo puede desplegarse en un portátil de 16 GB mediante Ollama o LM Studio para mantener conversaciones multi-turno sin conexión, gracias a su huella de 12 GB de RAM declarada.
- Resolución de problemas matemáticos paso a paso: adecuado para tutores educativos o herramientas de práctica que requieran explicaciones detalladas de ecuaciones lineales y problemas aritméticos de varios pasos, según el ejemplo GSM8K de la model card.
- Generación de código en entornos con recursos limitados: puede integrarse en editores o scripts locales para producir funciones Python con docstrings y casos límite, sin depender de APIs en la nube.
- Prototipado en cuadernos gratuitos: los botones de Colab y Kaggle permiten ejecutar el modelo en GPU T4 o P100 gratuitas, útil para pruebas de concepto y demos académicas.
- Razonamiento científico en aplicaciones educativas: puede responder preguntas de física y ciencias naturales con deducción causal, según el ejemplo ARC-Challenge incluido por el autor.
- Despliegue en dispositivos de borde: al caber en 6-16 GB de VRAM en GPU NVIDIA o en memoria unificada de Apple Silicon, puede embeberse en aplicaciones de escritorio o kioscos interactivos con requisitos de privacidad estrictos.
- Evaluación comparativa de técnicas de compresión: investigadores interesados en cuantización extrema y consolidación de expertos pueden usar el modelo como caso de estudio, aunque con la cautela de que la técnica AW-SECD no está documentada de forma independiente.

## Benchmarks y rendimiento

| Benchmark | Resultado declarado |
|---|---|
| ARC-Challenge | 84,7 % |
| GSM8K | 81,0 % |
| HumanEval | 79,2 % |

Los datos proceden exclusivamente de la model card del autor. No se han publicado resultados independientes ni comparaciones controladas con modelos de referencia en la información disponible. El autor afirma una retención del 95,6 % del conocimiento del modelo original, pero no se aporta la línea base exacta ni la metodología de evaluación.

## Requisitos de hardware
- VRAM/RAM estimada: 12 GB de RAM para la versión comprimida; 17,28 GB para el GGUF Q4_K_M; 6-16 GB de VRAM en GPU NVIDIA según la tabla del autor.
- GPU recomendadas: NVIDIA RTX con 6-16 GB de VRAM (CUDA offload); Tesla T4 o P100 en Colab/Kaggle gratuitos.
- Apple Silicon: M1/M2/M3/M4 con 16 GB de memoria unificada, con rendimiento declarado de más de 25 tokens por segundo.
- CPU: Intel o AMD con AVX2/AVX-512 y 16 GB de RAM del sistema, totalmente offline.
- Opciones de despliegue: transformers con `trust_remote_code=True`, llama.cpp, Ollama, LM Studio, Jan.ai, endpoints compatibles.
- Latencia y throughput: solo se declara "25+ tok/s" en Apple Silicon; no hay datos para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Numbat-SuperExpert-12GB | 6,34 B (declarado MoE) | no disponible | Apache 2.0 | safetensors, GGUF | Benchmarks solo declarados por el autor |
| burner22/numbat (base) | no disponible | no disponible | no disponible | no disponible | Modelo base declarado |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de información verificable para comparar |

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas de la misma categoría. La model card menciona otros modelos de la familia AW-SECD (por ejemplo, GLM-5.3 SuperExpert v2 de 9,2 GB), pero no se aportan especificaciones completas ni resultados comparables.

## Limitaciones y advertencias
- Las afirmaciones sobre un modelo base de 14 billones de parámetros y una compresión de 1.600x no están verificadas de forma independiente y deben interpretarse con escepticismo.
- La técnica AW-SECD no está documentada con detalle técnico, ablaciones ni código reproducible en la información disponible.
- Los benchmarks (ARC-Challenge 84,7 %, GSM8K 81,0 %, HumanEval 79,2 %) proceden únicamente del autor y no han sido replicados.
- El modelo requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; conviene auditar dicho código antes de usarlo en producción.
- No se especifican los idiomas soportados, la longitud de contexto ni los parámetros activos, lo que limita la planificación de despliegues multilingües o de contexto largo.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones de fidelidad ni de sesgos.
- Aunque la licencia es Apache 2.0, el uso comercial debe evaluar también las licencias del modelo base y del código personalizado incluido.
- El tamaño del repo (31,2 GB) y la existencia de múltiples artefactos (safetensors, GGUF) pueden complicar la descarga y el versionado en entornos con ancho de banda limitado.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/shashanth-27xA9/Numbat-SuperExpert-12GB
- Modelo base: https://huggingface.co/burner22/numbat
- Cuaderno Colab de ejecución: https://colab.research.google.com/github/shashanth-27xA9/Numbat-SuperExpert-12GB/blob/main/1_click_run_numbat_12gb.ipynb
- Cuaderno de benchmarks: https://colab.research.google.com/github/shashanth-27xA9/Numbat-SuperExpert-12GB/blob/main/benchmark_evaluation_and_test.ipynb
- Demo en Spaces: https://huggingface.co/spaces/shashanth-27xA9/Numbat-SuperExpert-Playground
- Descarga directa GGUF: https://huggingface.co/shashanth-27xA9/Numbat-SuperExpert-12GB/resolve/main/numbat-superexpert-12gb-q4_k_m.gguf
- Notebook de Kaggle: https://www.kaggle.com/code/hariniathukuri/numbat-12gb-1-click-starter
- Modelo relacionado de la familia: https://huggingface.co/shashanth-27xA9/GLM-5.3-SuperExpert-v2-9.2GB
