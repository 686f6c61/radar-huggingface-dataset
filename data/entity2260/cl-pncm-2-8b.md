# entity2260/cl-pncm-2.8b

## Resumen

C-LPNCM-2.8B (Calibrated Looped-Pointer Next-Concept Model) es un modelo de lenguaje de 2.890 millones de parámetros físicos desarrollado por el usuario entity2260 y publicado en Hugging Face bajo licencia MIT. Se presenta como una alternativa a los LLM autorregresivos token a token: en lugar de predecir la siguiente palabra, agrupa los tokens en parches semánticos de longitud variable mediante detección de picos de entropía de Shannon, los cuantiza en una jerarquía discreta de conceptos (RVQ-FSQ) y razona de forma autorregresiva sobre esos conceptos antes de decodificar los tokens superficiales en paralelo.

La arquitectura se organiza en cuatro torres Transformer puras (sin difusión): un codificador de tokens y parches, un núcleo latente calibrado con enrutamiento epistémico, un refinador de equilibrio con pesos compartidos que itera ocho veces (de ahí los ~3.6B de parámetros de cómputo efectivo) y un decodificador dual de superficie que combina proyección de vocabulario con una red de punteros causal. El modelo emplea GQA, RoPE, RMSNorm, SwiGLU y atención exclusiva auto-guardada, y se distribuye en bfloat16 con un peso en disco de 5,38 GB.

Es relevante ahora porque explora una línea poco transitada —razonamiento sobre conceptos discretos con calibración de confianza y abstención— frente al consenso dominante de transformers autorregresivos token a token o modelos de difusión continua. No obstante, la información pública disponible es muy limitada: cero descargas, cero likes, sin resultados de benchmarks verificados más allá de las pérdidas de entrenamiento y sin datos de idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `CLPNCMForCausalLM` (Transformer puro de 4 torres, sin difusión) |
| Parámetros totales | 2.938.013.606 (2,89B físicos según safetensors) |
| Parámetros activos | No es MoE; ~3,60B de cómputo efectivo por 8 bucles de refinamiento con pesos compartidos |
| Longitud de contexto | No disponible (ventana de codificación de tokens W=128; contexto global no especificado) |
| Tipos de cuantización | No disponible (pesos publicados en bfloat16; no se documentan GGUF ni otras) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (2 archivos, 5,38 GB en bfloat16) |
| Vocabulario | 30.522 tokens |
| Codebook de conceptos | 16.384 códigos VQ coseno con actualizaciones EMA |
| Jerarquía FSQ | 4 niveles en cascada × [8, 8, 8, 6, 5] (15.360 estados por nivel) |
| Tamaño de parche conceptual | 1 ≤ S_m ≤ 8 tokens (umbral de entropía τ_H = 2,4 bits) |
| Atención | GQA, Guarded Exclusive Self-Attention (XSA), compuertas sigmoideas |
| Posición y normalización | RoPE 1D (θ=10000), RMSNorm pre-capa, SwiGLU |

## Arquitectura y entrenamiento

El modelo se compone de cuatro módulos. El módulo 1 (6 capas, d=1536, 24/6 cabezas GQA) es un codificador causal de ventana deslizante que detecta fronteras de concepto por entropía y cuantiza los parches con un VQ coseno más cuatro niveles FSQ. Un adaptador isométrico proyecta de 1536 a 3072 dimensiones. El módulo 2 (20 capas, d=3072, 24/6 cabezas) es el núcleo latente calibrado, con cabeceras de política, longitud de span, confianza Brier y verificador de valor. El módulo 3 (4 capas repetidas 8 veces, d=1536, 24/24 cabezas) es un refinador de punto fijo con inyección de ancla, atención cruzada causal y compuerta de parada ACT, regularizado con un objetivo de contracción de Banach cuyo incumplimiento empírico reportado es 0,0000. El módulo 4 (6+2 capas) decodifica en paralelo combinando una proyección de vocabulario con una red de punteros causal que copia spans previos, mediada por una compuerta dinámica de copia.

El entrenamiento se organiza en tres etapas sobre una NVIDIA A100-SXM4-80GB en bfloat16 con TF32 y AdamW fusionado. La etapa 1 (786M parámetros activos, 2.000 pasos, 131,1M tokens) entrena el autoencoder RVQ-FSQ y el puntero, con pérdida de validación de 1,9649. La etapa 2 (2,28B parámetros activos, 4.000 pasos, 131,1M tokens) entrena el núcleo latente y los bucles de equilibrio, con pérdida total de entrenamiento de 14,0389 y pérdida CE de concepto grueso truncada en la información disponible. No se documenta la etapa 3 ni el volumen total de tokens de entrenamiento, ni si hubo RLHF o DPO (aunque las etiquetas mencionan GRPO).

## Capacidades

- Generación de texto mediante decodificación paralela de tokens a partir de conceptos latentes.
- Razonamiento sobre conceptos discretos agrupados en parches semánticos de longitud variable.
- Enrutamiento epistémico con estimación de confianza calibrada (Brier) y abstención cuando la confianza cae por debajo de 0,40.
- Asignación dinámica de presupuesto de cómputo: entre 1 y 8 iteraciones del refinador según la dificultad del concepto.
- Copia de spans previos mediante red de punteros causal con compuerta dinámica.
- Extracción de características (`feature-extraction` entre las etiquetas del modelo).
- Capacidades multilingües: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación en arquitecturas alternativas a la autorregresión token a token: el modelo sirve como banco de pruebas para estudiar razonamiento sobre conceptos discretos, cuantización RVQ-FSQ y refinamiento iterativo con pesos compartidos en un entorno de 2,89B parámetros.
- Experimentos de calibración y abstención: la cabecera Brier y el umbral de abstención de 0,40 permiten investigar cómo un modelo decide no responder, útil en entornos donde el silencio es preferible a una alucinación.
- Extracción de características y embeddings conceptuales: la jerarquía discreta de conceptos puede emplearse para agrupar o recuperar documentos por similitud semántica en pipelines de búsqueda.
- Prototipado de decodificación eficiente: el decodificador paralelo con puntero causal permite medir latencias frente a la generación token a token en tareas de copia y resumen extractivo.
- Investigación sobre presupuesto adaptativo de cómputo: el bucle de refinamiento con parada ACT es adecuado para estudiar trade-offs entre calidad y coste por token en hardware modesto.
- Docencia y reproducción académica: con 5,88 GB de VRAM en bfloat16 cabe en una T4 o L4, lo que facilita reproducir experimentos de arquitectura sin clústeres grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card solo reporta métricas de entrenamiento y validación:

| Métrica (etapa) | Valor |
|---|---|
| Etapa 1 — pérdida total de entrenamiento | 1,9731 |
| Etapa 1 — pérdida CE superficial | 1,4390 |
| Etapa 1 — pérdida de compromiso VQ | 0,0002 |
| Etapa 1 — pérdida de copia por puntero | 0,0000 |
| Etapa 1 — pérdida de validación | 1,9649 |
| Etapa 2 — pérdida total de entrenamiento | 14,0389 |
| Etapa 2 — pérdida CE de concepto grueso | no disponible (truncada en la información) |
| Violación de contracción de Banach | 0,0000 |

## Requisitos de hardware

- VRAM estimada: 5,88 GB en bfloat16 según el autor, suficiente para una NVIDIA T4, L4 o A100.
- GPU recomendadas: T4, L4, A100 (las citadas por el autor); cualquier GPU con al menos 8 GB de VRAM en bfloat16.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060 Ti, 4060 Ti, 4070, 4080, 4090), siempre que se ejecute en bfloat16 o se cuantice.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requiere código personalizado, etiqueta `custom_code`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| C-LPNCM-2.8B | 2,89B físicos / ~3,6B efectivos | no disponible | MIT | Hugging Face, 0 descargas |
| Qwen2.5-3B | 3,09B | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente adoptado |
| Llama 3.2-3B | 3,21B | 131.072 tokens | Llama 3.2 Community | Hugging Face, ampliamente adoptado |
| Phi-3.5-mini | 3,82B | 128.000 tokens | MIT | Hugging Face, ampliamente adoptado |

La comparación de rendimiento con estas alternativas no está disponible: C-LPNCM-2.8B no publica resultados de benchmarks estándar, mientras que los modelos citados cuentan con evaluaciones públicas extensas. La diferencia principal es arquitectónica: C-LPNCM opera sobre conceptos discretos y decodificación paralela, frente a la autorregresión token a token convencional de los modelos comparados.

## Limitaciones y advertencias

- Ausencia total de benchmarks estándar: no hay evidencia pública de calidad en MMLU, HumanEval, GSM8K ni tareas conversacionales.
- Cero descargas y cero likes en Hugging Face: el modelo no ha sido validado por la comunidad y su reproducibilidad no está contrastada.
- Idiomas soportados no documentados: no se puede asumir un rendimiento multilingüe ni siquiera en castellano.
- Longitud de contexto global no especificada: la ventana de codificación es de 128 tokens y el contexto efectivo del núcleo latente no se detalla, lo que limita su uso en tareas de contexto largo.
- Requiere `trust_remote_code=True` y código personalizado (`custom_code`): implica ejecutar código del autor no auditado, con el riesgo de seguridad asociado.
- Riesgo de alucinación no cuantificado: la calibración Brier y la abstención son mecanismos internos, pero no hay evaluación externa de su fiabilidad.
- Sesgos desconocidos: no se documenta la composición del dataset de entrenamiento (solo 131,1M tokens por etapa), por lo que no se pueden evaluar sesgos de género, raza o idioma.
- Licencia MIT permisiva para uso comercial, pero sin garantías del autor y con la advertencia de que el modelo no ha sido probado en producción.
- Etapa 3 del currículo de entrenamiento no documentada en la información disponible, lo que impide conocer si el modelo está completamente entrenado o es un checkpoint intermedio.
- Fecha de creación en 2026: el modelo es muy reciente y no hay historial de uso ni incidencias reportadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/entity2260/cl-pncm-2.8b
- Banner del modelo: https://huggingface.co/entity2260/cl-pncm-2.8b/resolve/main/banner.gif
- Paper, blog, repositorio o demo: no disponible en la información proporcionada.
