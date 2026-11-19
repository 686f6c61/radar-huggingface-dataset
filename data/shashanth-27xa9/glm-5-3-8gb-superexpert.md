# shashanth-27xA9/GLM-5.3-8GB-SuperExpert

## Resumen

GLM-5.3-8GB-SuperExpert es una compresión extrema del modelo base zai-org/GLM-5.3-Flash, publicada por el usuario shashanth-27xA9 bajo licencia Apache 2.0. El autor aplica una técnica propia denominada AW-SECD (Activation-Weighted Super-Expert Consolidation & Residual Drift Compensation) para reducir un modelo Mixture-of-Experts de gran tamano a un artefacto de aproximadamente 8 GB ejecutable en hardware de consumo. El repositorio contiene pesos en safetensors (4.327.984.128 parámetros reales según el índice de safetensors) y una cuantización GGUF Q4_K_M de 8,07 GB.

El modelo se distribuye con la etiqueta de "laptop-runnable" y apunta a escenarios de inferencia local sin GPU dedicada, incluyendo Apple Silicon, CPUs con AVX2/AVX-512 y GPUs de consumo con 6-16 GB de VRAM. El autor declara compatibilidad con Ollama, llama.cpp, LM Studio, Jan.ai y transformers con `trust_remote_code`, e incluye notebooks de Colab y Kaggle para ejecución en GPU gratuita.

La relevancia del artefacto es fundamentalmente práctica: propone llevar un modelo de razonamiento y código de escala frontier a un portátil estándar. No obstante, las cifras de rendimiento y la metodología AW-SECD provienen exclusivamente de la model card del autor y no cuentan con verificación independiente en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) derivada de GLM-5.3-Flash; transformer causal con `custom_code` (glm4/glm5_flash) |
| Parametros totales | 4.327.984.128 (según safetensors del repo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (AW-SECD), GGUF Q4_K_M; pesos safetensors en fp16/fp32 según runtime |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF (Q4_K_M, 8,07 GB) |

## Arquitectura y entrenamiento

El modelo base es zai-org/GLM-5.3-Flash, una arquitectura Mixture-of-Experts de la familia GLM. El autor no documenta en la información disponible el número de expertos, la dimensión oculta, el número de capas ni la ventana de contexto del modelo original. La transformación aplicada, AW-SECD, se describe como una consolidación de "super-expertos" ponderada por activaciones, con compensación de deriva residual; el autor afirma que preserva el 95,6 % del conocimiento del modelo original, pero no se aporta el detalle algorítmico, el conjunto de calibración ni el número de tokens utilizado.

No hay información sobre el dataset de entrenamiento del modelo base, sobre si hubo RLHF/DPO, ni sobre el proceso de destilación o fusión de expertos. Tampoco se documenta la longitud de contexto efectiva tras la compresión, dato crítico para evaluar su uso en producción. La model card menciona técnicas de cuantización de 4 bits y etiquetas como `svd` y `zero-drift`, que sugieren descomposición en valores singulares y corrección de errores de cuantización, pero sin especificación técnica verificable.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat basada en tokens especiales `<|user|>` y `<|assistant|>`.
- Razonamiento paso a paso en dominios científicos y de sentido común (el ejemplo de la model card es una pregunta de física estilo ARC-Challenge).
- Razonamiento matemático multi-paso (ejemplo GSM8K con resolución de ecuaciones lineales).
- Generación de código Python, incluyendo funciones con docstring y manejo de casos límite (ejemplo HumanEval sobre el algoritmo de Kadane).
- Soporte de cuantización 4-bit y ejecución en CPU, GPU y Apple Silicon vía llama.cpp/Ollama.
- Compatibilidad declarada con `transformers` mediante `trust_remote_code=True` y con endpoints compatibles.
- Capacidades multilingües limitadas a inglés y chino según los metadatos del repositorio.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo "thinking" explícito en la información disponible.

## Casos de uso

- Asistencia de razonamiento científico en local: el modelo puede resolver preguntas de física y sentido común con deducción causal paso a paso, adecuado para entornos educativos offline donde no se puede enviar datos a la nube.
- Tutoría matemática en portátil: con 8 GB de huella, permite resolver ecuaciones y problemas multi-paso en un equipo de 16 GB de RAM sin GPU, útil para estudiantes o docentes con hardware limitado.
- Generación de código en estaciones de trabajo sin GPU: la cuantización Q4_K_M y la compatibilidad con llama.cpp permiten autocompletar funciones Python y generar docstrings en un portátil Intel/AMD con AVX2.
- Prototipado rápido en notebooks gratuitos: los notebooks de Colab y Kaggle incluidos permiten ejecutar el modelo en una Tesla T4 o P100 sin coste, adecuado para validar prompts antes de desplegar.
- Despliegue en Apple Silicon para desarrollo: la verificación del autor reporta más de 25 tok/s en memoria unificada de 16 GB con Metal, lo que lo hace viable como asistente de código local en MacBook.
- Evaluación de técnicas de compresión: investigadores interesados en cuantización extrema y consolidación de expertos pueden usar el artefacto como caso de estudio, comparando sus resultados con el modelo base GLM-5.3-Flash.
- Chat conversacional offline en entornos air-gapped: al ejecutarse con Ollama o LM Studio sin conexión, sirve para asistentes internos en redes aisladas, siempre que el uso sea en inglés o chino.

## Benchmarks y rendimiento

Los únicos datos disponibles provienen de la model card del autor y no han sido verificados de forma independiente. Se presentan tal cual, sin comparación con modelos similares porque no se aportan resultados de las alternativas.

| Benchmark | Resultado declarado | Nota |
|---|---|---|
| ARC-Challenge | 82,5 % | Retención declarada del 95,6 % respecto al base |
| GSM8K | 77,8 % | "Zero-drift" según el autor |
| HumanEval | 76,1 % | Generación de código Python |

No se han publicado resultados de benchmarks verificados de forma independiente en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 8,0 GB para la versión GGUF Q4_K_M; el repo completo en safetensors ocupa 34,2 GB, por lo que la ejecución en fp16 requiere del orden de 8-9 GB de VRAM solo para pesos, más overhead de activaciones y caché KV.
- GPU recomendadas: Tesla T4 o P100 en Colab/Kaggle (verificado por el autor), GPUs NVIDIA consumer con 6-16 GB de VRAM mediante offload CUDA.
- Cabe en GPU de consumo: sí, según el autor, en tarjetas con 6-16 GB de VRAM; también en Apple Silicon con 16 GB de memoria unificada (Metal, más de 25 tok/s declarados).
- CPU: Intel/AMD con AVX2 o AVX-512 y 16 GB de RAM del sistema, ejecución completamente offline verificada por el autor.
- Opciones de despliegue: Ollama (`ollama run shashanth-27xA9/glm-5.3-8gb-superexpert`), llama.cpp (`llama-cli` con el GGUF), transformers con `trust_remote_code`, LM Studio, Jan.ai y endpoints compatibles.
- Latencia y throughput: el autor declara más de 25 tok/s en Apple Silicon; no se aportan cifras para CPU ni para GPU NVIDIA. No hay datos de latencia de primer token.

## Comparativa con modelos similares

No se dispone de datos de rendimiento verificados de este modelo ni de alternativas comparables en la información proporcionada. La comparación se limita a características estructurales declaradas por el autor frente al modelo base.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-8GB-SuperExpert | 4.327.984.128 (según safetensors) | no disponible | Apache 2.0 | safetensors, GGUF Q4_K_M | Hugging Face, Ollama, LM Studio |
| zai-org/GLM-5.3-Flash (base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas de 4-8 GB para portátil | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las cifras de benchmarks (ARC-Challenge 82,5 %, GSM8K 77,8 %, HumanEval 76,1 %) y la retención del 95,6 % son afirmaciones del autor sin verificación independiente; deben tratarse con cautela en decisiones de producción.
- La metodología AW-SECD no está documentada técnicamente en la información disponible: no se especifican el algoritmo exacto, el conjunto de calibración ni los criterios de consolidación de expertos.
- El número real de parámetros del artefacto (4.327.984.128) es muy inferior al del modelo base descrito en la model card como "320B parámetros"; la relación entre ambos y el proceso de reducción no se detalla.
- Idiomas limitados a inglés y chino; no se declara soporte de español, lo que restringe su uso en producción para mercados hispanohablantes.
- Longitud de contexto no documentada; no es posible garantizar conversaciones multi-turno largas ni procesamiento de documentos extensos.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico, capacidades habituales en modelos actuales de código y razonamiento.
- Riesgo de alucinación inherente a modelos de 4-bit comprimidos; la cuantización agresiva puede degradar la coherencia en cadenas de razonamiento largas.
- Requiere `trust_remote_code=True` en transformers, lo que implica ejecutar código del repositorio; conviene auditar el código antes de usarlo en entornos sensibles.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base GLM-5.3-Flash puede tener condiciones adicionales no reflejadas en la información disponible; conviene verificar la licencia del modelo original.
- El repositorio tiene 1 like y un autor no oficial (shashanth-27xA9), lo que sugiere ausencia de revisión por parte de la comunidad; la madurez y el mantenimiento no están garantizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shashanth-27xA9/GLM-5.3-8GB-SuperExpert
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- GGUF Q4_K_M directo: https://huggingface.co/shashanth-27xA9/GLM-5.3-8GB-SuperExpert/resolve/main/glm-5.3-8gb-superexpert-q4_k_m.gguf
- Notebook Colab de construcción y subida de GGUF: https://colab.research.google.com/github/shashanth-27xA9/GLM-5.3-8GB-SuperExpert/blob/main/1_click_build_and_upload_gguf.ipynb
- Notebook Colab de benchmarks: https://colab.research.google.com/github/shashanth-27xA9/GLM-5.3-8GB-SuperExpert/blob/main/benchmark_evaluation_and_test.ipynb
- Demo web (Space): https://huggingface.co/spaces/shashanth-27xA9/GLM-5.3-SuperExpert-Demo
- Notebook Kaggle: https://www.kaggle.com/code/hariniathukuri/glm-5-3-superexpert-v2-demo
- Modelo hermano GLM-5.3-SuperExpert-v2 (9,2 GB): https://huggingface.co/shashanth-27xA9/GLM-5.3-SuperExpert-v2-9.2GB
