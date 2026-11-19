# shashanth-27xA9/Kimi-K3.1-Pro-SuperExpert-12GB

## Resumen

Kimi-K3.1-Pro-SuperExpert-12GB es una compresión del modelo base `moonshotai/Kimi-K3.1-Pro`, un Mixture-of-Experts (MoE) de 2,8 billones de parámetros con 104 mil millones de parámetros activos, publicado por el usuario shashanth-27xA9. El autor aplica una técnica propia denominada AW-SECD (Activation-Weighted Super-Expert Consolidation & Residual Drift Compensation) para reducir el modelo a 12.008.815.616 parámetros efectivos (unos 12 GB de pesos), con el objetivo declarado de hacerlo ejecutable en hardware de consumo.

La propuesta central es la reducción de huella: el autor afirma pasar de unos 5.600 GB de VRAM del modelo original a 12 GB de RAM, lo que permitiría su ejecución en portátiles con 16 GB de memoria unificada, GPUs de consumo y entornos gratuitos como Colab o Kaggle. El repositorio distribuye pesos en safetensors y un GGUF cuantizado a Q4_K_M, con soporte declarado para transformers, llama.cpp, Ollama, LM Studio y Jan.ai.

Es relevante por su planteamiento de compresión agresiva de MoE masivos, aunque la información disponible procede exclusivamente de la model card del autor y no incluye documentación técnica independiente, paper ni validación externa de las cifras declaradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) causal LM, derivada de `moonshotai/Kimi-K3.1-Pro`; técnica de compresión AW-SECD (SVD + consolidación de expertos) |
| Parametros totales | 12.008.815.616 (según safetensors del repo); el modelo base declara 2,8 T totales y 104 B activos |
| Parametros activos | 104 B en el modelo base; no disponible para este checkpoint comprimido |
| Longitud de contexto | no disponible (el tag `long-context` no especifica longitud) |
| Tipos de cuantizacion | 4-bit (Q4_K_M en GGUF); tags mencionan también 8-bit; safetensors en fp16/fp32 según el código de ejemplo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture-of-Experts de 2,8 billones de parámetros totales y 104 mil millones activos por token. El checkpoint aquí descrito no se entrena desde cero: es una compresión del modelo base mediante AW-SECD, una técnica que combina descomposición en valores singulares (SVD, según el tag `svd`) con consolidación de subespacios de expertos y compensación de deriva residual. El autor denomina al resultado "zero-drift" y afirma una retención de conocimiento superior al 95 % respecto al modelo original.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO, ni para el modelo base ni para la compresión. Tampoco se documenta el procedimiento exacto de AW-SECD más allá de la descripción cualitativa de la model card. Los tags indican soporte de `custom_code`, lo que implica que la carga en transformers requiere `trust_remote_code=True`.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento matemático multi-paso: los ejemplos de la model card incluyen problemas tipo GSM8K con razonamiento paso a paso.
- Razonamiento científico y deducción causal: ejemplo widget basado en ARC-Challenge.
- Generación de código: ejemplo HumanEval con funciones Python óptimas, docstrings y casos límite.
- Contexto largo: el tag `long-context` lo declara, aunque sin especificar la longitud soportada.
- Ejecución en dispositivos de consumo: tags `on-device`, `laptop-runnable`, `sub-10gb`, con soporte para Ollama, llama.cpp, LM Studio y Jan.ai.
- Compatibilidad con endpoints: tag `endpoints_compatible`.
- No se documentan capacidades de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Asistencia conversacional offline en portátil: con 12 GB de pesos en Q4_K_M, el modelo puede ejecutarse en un MacBook con 16 GB de memoria unificada mediante Ollama o llama.cpp, sin conexión a internet ni coste de API, para tareas de chat y resolución de dudas técnicas.
- Prototipado rápido en Colab o Kaggle gratuitos: el repositorio incluye notebooks de "1-click" para Tesla T4 y P100, lo que permite evaluar el comportamiento del modelo en un entorno cloud sin coste antes de desplegarlo en local.
- Resolución de problemas matemáticos paso a paso: los ejemplos widget (ecuaciones lineales, GSM8K) lo orientan a tutoría o verificación de cálculos con razonamiento explícito, útil en herramientas educativas.
- Generación de código en entornos con restricciones de privacidad: al ejecutarse localmente, permite autocompletar y generar funciones Python sin enviar código propietario a servicios externos, integrable en editores vía LM Studio o Jan.ai.
- Razonamiento científico y preguntas de opción múltiple: el ejemplo ARC-Challenge sugiere uso en sistemas de preguntas y respuestas educativas con deducción causal explicada.
- Evaluación de técnicas de compresión: como artefacto de investigación, sirve para medir la degradación real de un MoE masivo tras compresión SVD y comparar con el modelo base en tareas de razonamiento.
- Despliegue en estaciones de trabajo con GPU de consumo: con 6-16 GB de VRAM y offload CUDA, puede servir como backend de generación de texto en aplicaciones internas de baja concurrencia.

## Benchmarks y rendimiento

Los únicos datos disponibles proceden de la model card del autor. No hay validación independiente ni comparación con el modelo base en las mismas condiciones.

| Benchmark | Resultado declarado (SuperExpert) | Retención declarada vs. base |
|---|---|---|
| ARC-Challenge | 85,8 % | 95,6 % del conocimiento preservado |
| GSM8K | 82,1 % | "zero-drift" en lógica multi-paso |
| HumanEval | 80,4 % | generación de código de producción |

El autor declara además 25+ tok/s en Apple Silicon (M1/M2/M3/M4) con 16 GB de memoria unificada. No se publican resultados del modelo base en la información disponible para verificar la retención.

## Requisitos de hardware

- VRAM/RAM estimada: 12 GB para los pesos en Q4_K_M; el repositorio ocupa 12,0 GB. Con safetensors en fp16 se necesitaría aproximadamente el doble (unos 24 GB), por lo que la vía práctica es el GGUF.
- GPU recomendadas: el autor verifica funcionamiento con NVIDIA RTX de 6-16 GB de VRAM mediante offload CUDA; en cloud, Tesla T4 y P100 (Colab/Kaggle gratuitos).
- Consumer GPU: sí, cabe en tarjetas de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090) y en Apple Silicon con 16 GB de memoria unificada. Con 6 GB requeriría offload parcial a RAM del sistema.
- CPU: verificado con AVX2/AVX-512 en 16 GB de RAM, totalmente offline.
- Opciones de despliegue: transformers (`trust_remote_code=True`), llama.cpp (`llama-cli`), Ollama, LM Studio, Jan.ai.
- Latencia y throughput: 25+ tok/s declarados en Apple Silicon; no disponible para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Kimi-K3.1-Pro-SuperExpert-12GB | 12,0 B efectivos (base 2,8 T MoE) | no disponible | Apache 2.0 | Hugging Face, GGUF, Ollama | Compresión comunitaria; cifras no verificadas externamente |
| moonshotai/Kimi-K3.1-Pro (base) | 2,8 T totales / 104 B activos | no disponible | no disponible | Hugging Face | Requiere infraestructura multi-GPU (5.600 GB VRAM según el autor) |
| Alternativas de 7-14 B densos (p. ej. familia Qwen o Llama) | 7-14 B | 8K-128K según variante | variable | amplia | no disponible comparación directa de rendimiento en la información proporcionada |

No se dispone de datos de benchmarks del modelo base ni de alternativas en la información proporcionada para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Todas las cifras de rendimiento y retención (95,6 %, "zero-drift", 25+ tok/s) proceden exclusivamente del autor; no hay paper, evaluación independiente ni reproducción pública documentada.
- La técnica AW-SECD no está descrita en detalle; la afirmación de preservar el 95 % del conocimiento de un MoE de 2,8 T en 12 GB es extraordinaria y requiere verificación empírica antes de usarla en producción.
- Riesgo de alucinación inherente a los modelos generativos, potencialmente amplificado por la compresión agresiva de pesos.
- Idiomas soportados no documentados; no se garantiza un rendimiento adecuado en castellano.
- Longitud de contexto no especificada pese al tag `long-context`.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; auditar antes de desplegar.
- La licencia Apache 2.0 se declara para el checkpoint, pero la licencia del modelo base debe verificarse por separado para uso comercial.
- No se documentan capacidades de tool calling ni de agentes; no asumirlas en pipelines automatizados.
- El repo tiene 8.797 descargas y solo 5 likes, con actualización en noviembre de 2026; madurez y mantenimiento inciertos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shashanth-27xA9/Kimi-K3.1-Pro-SuperExpert-12GB
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Notebook Colab de ejecución: https://colab.research.google.com/github/shashanth-27xA9/Kimi-K3.1-Pro-SuperExpert-12GB/blob/main/1_click_run_kimi_12gb.ipynb
- Notebook de benchmarks: https://colab.research.google.com/github/shashanth-27xA9/Kimi-K3.1-Pro-SuperExpert-12GB/blob/main/benchmark_evaluation_and_test.ipynb
- Demo en Spaces: https://huggingface.co/spaces/shashanth-27xA9/Kimi-K3.1-Pro-Playground
- Descarga directa GGUF Q4_K_M: https://huggingface.co/shashanth-27xA9/Kimi-K3.1-Pro-SuperExpert-12GB/resolve/main/kimi-k3.1-pro-superexpert-12gb-q4_k_m.gguf
- Starter en Kaggle: https://www.kaggle.com/code/hariniathukuri/kimi-k3-1-pro-12gb-1-click-starter
