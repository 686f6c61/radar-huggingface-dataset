# Lordnyx/qwen3.5-9b-triple-loop-fase1

## Resumen

Qwen3.5-9B Triple-Loop (Phase 1) es un fine-tune experimental del modelo base Qwen/Qwen3.5-9B, desarrollado por el autor independiente Lordnyx. El modelo aplica la técnica LoopSplit, que consiste en ejecutar tres veces consecutivas las capas intermedias del transformer reutilizando los mismos pesos, logrando una profundidad virtual de 64 capas sin añadir parámetros adicionales. El entrenamiento incluye destilación de conocimiento (knowledge distillation) contra un modelo profesor más potente, Qwen/Qwen3.8-27B, con supervisión profunda (deep supervision) en los límites de cada bucle.

El proyecto está inspirado en la arquitectura de Nanbeige 4.5 y busca mejorar el rendimiento por parámetro. En su fase actual (Step 2100), el modelo alcanza un 100% de precisión en la suite de matemáticas del benchmark oficial, elimina los bucles de repetición cíclica observados en el checkpoint anterior y reduce la divergencia KL media de 0.650 a 0.30-0.36 mediante un programa de decaimiento coseno de la tasa de aprendizaje. El checkpoint se restaura a una arquitectura estándar de 32 capas, por lo que es compatible con runtimes de inferencia convencionales como llama.cpp, vLLM y transformers sin parches personalizados.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors (bfloat16) y GGUF (incluyendo una versión cuantizada Q5_K_M). Está orientado a tareas de generación de texto, razonamiento, programación y conversación, con soporte declarado para inglés y portugués.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Gated-DeltaNet (linear attention) + full-attention, con LoopSplit (triple ejecución de capas intermedias) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no es un MoE; todos los parámetros se activan, aunque el bucle reutiliza pesos) |
| Longitud de contexto | no disponible (el modelo base Qwen3.5-9B soporta contexto largo; el checkpoint no especifica el valor exacto) |
| Tipos de cuantizacion | bfloat16 (safetensors y GGUF), Q5_K_M (GGUF) |
| Idiomas soportados | en, pt |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B tiene 32 capas transformer, de las cuales 24 son de atención lineal (Gated-DeltaNet) intercaladas 3:1 con 8 capas de atención completa. LoopSplit no añade tensores de parámetros nuevos, sino que reestructura el grafo de computación: las capas 0-7 (prefijo) se ejecutan una vez, las capas 8-23 (16 capas intermedias) se ejecutan tres veces seguidas reutilizando los mismos pesos, y las capas 24-31 (sufijo) se ejecutan una vez. La profundidad virtual resultante es de 64 capas, mientras que el footprint de memoria se mantiene en el de un modelo de 32 capas.

El entrenamiento se realizó en dos fases. La primera (Step 929) usó una tasa de aprendizaje constante de 3×10⁻⁵ y alcanzó una meseta. La continuación (Step 2100) aplicó un decaimiento coseno de la tasa de aprendizaje desde 1.5×10⁻⁵ hasta 1.81×10⁻⁶ durante 14.000 segundos de cómputo en una GPU NVIDIA B200, procesando 28.172.942 tokens de un pool curado de ~48.2k ejemplos de conversaciones multi-turno de tipo agéntico, lógico, de programación y matemático. La destilación se realizó contra el profesor Qwen/Qwen3.8-27B usando divergencia KL top-32 por chunks con supervisión profunda, con una pérdida total L = L_final + 0.15×L_r0 + 0.25×L_r1. El optimizador fue torchao.optim.AdamW8bit con redondeo estocástico en bf16.

## Capacidades

- Generación de texto conversacional con formato de chat estándar (ChatML) y soporte de modo "thinking" (razonamiento explícito antes de la respuesta final).
- Razonamiento matemático: 100% de precisión (10/10) en la suite de matemáticas del benchmark oficial, eliminando errores de salto aritmético.
- Programación: 91.7% de precisión en la categoría de programación del benchmark.
- Robustez: 100% de precisión en la categoría de robustez, sin bucles de repetición cíclica en el checkpoint Step 2100.
- Razonamiento general: 80% de precisión en la categoría de razonamiento del benchmark.
- Seguimiento de instrucciones: 35% de precisión, una mejora de +20 puntos porcentuales frente al modelo base.
- Capacidades multilingües declaradas: inglés y portugués.
- Compatibilidad con runtimes estándar: llama.cpp, vLLM y transformers cargan el checkpoint sin parches de arquitectura personalizados.

## Casos de uso

- Evaluación de técnicas de escalado por profundidad virtual: el modelo sirve como banco de pruebas para investigar si ejecutar capas intermedias varias veces con pesos compartidos mejora el rendimiento por parámetro, una línea inspirada en Nanbeige 4.5.
- Generación de código asistida: con un 91.7% en la categoría de programación, puede usarse como asistente de autocompletado o generación de funciones en entornos de desarrollo, especialmente en flujos donde se priorice un modelo compacto de 9B.
- Resolución de problemas matemáticos paso a paso: el prompt oficial incluye un formato de razonamiento explícito ("thinking" y "response"), adecuado para sistemas de tutoría o generación de soluciones explicadas.
- Conversación agéntica multi-turno: el dataset de entrenamiento incluye conversaciones agénticas, por lo que el modelo puede integrarse en pipelines de agentes que requieran mantener contexto conversacional.
- Experimentación con destilación y supervisión profunda: el checkpoint es un caso de estudio para quienes investigan cómo transferir capacidades de un modelo profesor grande a un modelo estudiante compacto mediante pérdidas auxiliares en capas intermedias.
- Despliegue en hardware con VRAM limitada: la versión cuantizada Q5_K_M (~6.15 GB) permite ejecutar el modelo en GPUs de consumo como la RTX 3060 o RTX 4060 con 8-12 GB de VRAM, usando llama.cpp con offload completo (-ngl 99).

## Benchmarks y rendimiento

El autor publicó resultados en un benchmark propio de 97 ítems que cubre razonamiento, lógica, programación y robustez, con decodificación greedy a temperatura 0.0. La comparación se realiza entre el modelo base (Q5_K_M), el checkpoint Step 929 (Q5_K_M) y el checkpoint Step 2100 (Q5_K_M):

| Categoria | Modelo base (Q5_K_M) | Step 929 (Q5_K_M) | Step 2100 (Q5_K_M) | Delta vs base |
|---|:---:|:---:|:---:|:---:|
| Matematicas | 70.0% | 90.0% | 100.0% | +30.0% |
| Robustez | 37.5% | 100.0% | 100.0% | +62.5% |
| Programacion | 93.3% | 91.7% | 91.7% | -1.6% |
| Conocimiento general | 90.0% | 90.0% | 90.0% | 0.0% |
| Escritura | 87.5% | 87.5% | 87.5% | 0.0% |
| Razonamiento | 90.0% | 80.0% | 80.0% | -10.0% |
| Creatividad | 71.4% | 71.4% | 71.4% | 0.0% |
| Contexto | 64.3% | 78.6% | 71.4% | +7.1% |
| Resumen | 52.4% | 57.1% | 52.4% | 0.0% |
| Traduccion | 70.0% | 55.0% | 51.7% | -18.3% |
| Seguimiento de instrucciones | 15.0% | 35.0% | 35.0% | +20.0% |
| Puntuacion global (media macro) | 68.04% | 75.95% | 75.77% | +7.73% |

No se dispone de resultados de benchmarks estándar externos (MMLU, HumanEval, GSM8K) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en bfloat16 ocupa ~17.9 GB, por lo que requiere una GPU con al menos 20-24 GB de VRAM para inferencia sin cuantizar (por ejemplo, RTX 3090, RTX 4090, A100 40GB).
- La versión cuantizada Q5_K_M (~6.15 GB) cabe en GPUs de consumo con 8-12 GB de VRAM, como RTX 3060, RTX 4060 o RTX 4070, usando offload completo con llama.cpp.
- GPU recomendada para entrenamiento: NVIDIA B200 (usada por el autor, con throughput de ~2.220 tokens/segundo).
- Opciones de despliegue: llama.cpp (llama-server o llama-cli con -ngl 99), vLLM, transformers. El autor indica que los runtimes estándar cargan el modelo sin parches de arquitectura.
- Latencia y throughput: no disponible. El autor reporta throughput de entrenamiento, no de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-9B Triple-Loop (este) | 8.95B | no disponible | Apache 2.0 | Fine-tune experimental con LoopSplit y destilación |
| Qwen/Qwen3.5-9B (base) | 9B | no disponible | Apache 2.0 | Modelo base híbrido Gated-DeltaNet + full-attention |
| Qwen/Qwen3.8-27B (profesor) | 27B | no disponible | Apache 2.0 | Modelo usado como profesor en la destilación |

No se dispone de comparativas con otros modelos de la misma categoría (por ejemplo, Llama 3.1 8B, Mistral 7B) en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el autor lo describe como un proyecto "for fun" y no garantiza estabilidad ni rendimiento en producción.
- Regresión en razonamiento y traducción: frente al modelo base, el checkpoint Step 2100 pierde 10 puntos en razonamiento (80% vs 90%) y 18.3 puntos en traducción (51.7% vs 70%).
- Sesgo de idioma: solo se declaran inglés y portugués; el rendimiento en otros idiomas no está evaluado.
- Riesgo de alucinación: no se reportan datos específicos, pero al ser un fine-tune experimental con destilación, el riesgo es similar al de otros modelos de 9B sin alineación específica.
- Longitud de contexto no documentada: no se especifica la ventana de contexto soportada por el checkpoint, lo que dificulta su uso en aplicaciones que requieran contexto largo.
- Datos de entrenamiento limitados: solo 28.2M tokens, una cantidad pequeña frente a los cientos de miles de millones típicos en modelos fundacionales; el fine-tune puede no generalizar bien fuera de los dominios del dataset.
- Compatibilidad de arquitectura: aunque el autor afirma que los runtimes estándar cargan el modelo sin parches, la restauración del checkpoint a una arquitectura de 32 capas debe verificarse en cada runtime antes de usarlo en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Lordnyx/qwen3.5-9b-triple-loop-fase1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo profesor: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Artículo sobre el modelo (kblip.com): https://kblip.com/social/hobbyist-builds-qwen3-5-9b-triple-loop-model-inspired-by-AACJGsp
- Plataforma de entrenamiento (Modal): https://modal.com
