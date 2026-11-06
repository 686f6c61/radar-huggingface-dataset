# ComputationalLinguisticsLab/LexisLM-500m

## Resumen

LexisLM-500m es un modelo de lenguaje base en griego desarrollado por ComputationalLinguisticsLab, entrenado desde inicialización aleatoria sobre texto griego. Con 502.193.664 parámetros (0,502B), sigue una arquitectura decoder-only de estilo LLaMA con embeddings de entrada y salida atados, RMSNorm, embeddings posicionales rotatorios (RoPE) y bloques feed-forward SwiGLU. Se distribuye como checkpoint preentrenado, sin ajuste por instrucciones.

El modelo completa una pasada aproximada sobre 22 mil millones de tokens procedentes de Wikipedia en griego y del subconjunto griego de FineWeb2. El repositorio contiene el mejor checkpoint evaluado en el paso 332.000 (21,76 mil millones de posiciones de token), no el paso final de entrenamiento. La ventana de contexto es de 4.096 tokens y el tokenizador es un BPE a nivel de byte específico para griego con 32.000 entradas base.

Su relevancia radica en ser un modelo base pequeño y abierto especializado en griego, un idioma con menor representación en modelos multilingües generalistas. No obstante, sus resultados en benchmarks griegos (MMLU 25,3%, ARC-Challenge 25,3%) están cerca del azar, lo que lo sitúa como un punto de partida para fine-tuning más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo LLaMA (RMSNorm, RoPE, SwiGLU, embeddings atados) |
| Parametros totales | 502.193.664 (0,502B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | No disponible (pesos exportados en bfloat16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Griego (el) |
| Licencia | No disponible |
| Formato de pesos | safetensors (bfloat16) |

Otros detalles arquitectónicos: 16 capas, tamaño oculto 1.536, 16 cabezas de atención, dimensión de cabeza 96, tamaño oculto feed-forward 4.096, vocabulario del modelo 32.004, RoPE theta 10.000, epsilon de RMSNorm 0,00001, dropout 0,0.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de estilo LLaMA con 16 capas, embeddings de entrada y salida atados y bloques SwiGLU. El tokenizador es un BPE a nivel de byte dedicado al griego con 32.000 entradas base (más cuatro entradas reservadas para una extensión de tokens de chat que no convierten al modelo en instruction-tuned), normalización NFC y preservación de mayúsculas y acentos. La muestra de entrenamiento del tokenizador comprende 20 millones de ocurrencias de palabras (20% Wikipedia griega, 80% FineWeb2-Greek).

El corpus de preentrenamiento congelado contiene 22.002.557.667 tokens de 34.079.145 documentos, principalmente Wikipedia griega y el subconjunto griego de FineWeb2, con documentos separados por `<eos>`. El entrenamiento usa AdamW (betas 0,9 y 0,95), learning rate pico de 0,0003 con 2.000 pasos de warmup y decaimiento coseno hasta 0,00003, weight decay 0,1 y clipping de gradiente en 1,0. Cada paso de optimizador procesa 65.536 posiciones de token (micro-batch 8 × acumulación 2 × contexto 4.096), en bfloat16 sobre una única GPU CUDA con `torch.compile`. La ejecución completa alcanzó 335.733 pasos, aproximadamente una pasada sobre los 22 mil millones de tokens, con barajado con semilla de bloques disjuntos de 4.096 tokens y padding enmascarado al final en lugar de repetición de texto.

## Capacidades

- Generación de texto en griego: modelo base de completado de texto, no ajustado por instrucciones.
- Modelado de lenguaje y continuación de documentos: al separarse los documentos por `<eos>`, se recomienda anteponer `<eos>` al prompt para iniciar un documento nuevo.
- Razonamiento y conocimiento factual limitados: los resultados en ARC-Challenge y MMLU están cerca del azar.
- Capacidades multilingües: únicamente griego.
- Tool calling / function calling: no soportado de forma nativa (modelo base sin ajuste).
- Agentes y razonamiento multi-paso: no soportado de forma nativa.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Punto de partida para fine-tuning: adecuado para ajuste posterior en tareas griegas específicas.

## Casos de uso

- Fine-tuning supervisado para tareas griegas específicas: el modelo sirve como base de 0,5B parámetros para ajustar clasificación, extracción o generación en griego con recursos modestos, dado su tamaño reducido y su tokenizador dedicado.
- Investigación en lingüística computacional del griego: permite estudiar el comportamiento de un modelo pequeño entrenado exclusivamente en griego, con métricas de perplejidad y bits por byte documentadas sobre la distribución de validación.
- Experimentos de tokenización: su tokenizador BPE a nivel de byte con normalización NFC y preservación de acentos es útil para analizar el impacto de decisiones de tokenización en lenguas con alfabeto no latino.
- Completado de texto en griego en entornos con pocos recursos: con 0,5B parámetros puede ejecutarse en hardware modesto para generar o completar texto griego en tareas de baja exigencia.
- Reproducción de experimentos académicos: el checkpoint, las métricas de validación y la configuración de entrenamiento documentadas permiten reproducir y comparar resultados en un entorno controlado.
- Base para evaluación de benchmarks traducidos al griego: sirve como referencia de un modelo pequeño monolingüe al comparar con modelos multilingües en ARC, MMLU y TruthfulQA traducidos por ILSP.

## Benchmarks y rendimiento

Resultados del checkpoint base en el paso 332.000 (porcentajes):

| Benchmark griego | Shots | Preguntas | Checkpoint base |
|---|---:|---:|---:|
| ARC-Easy, precisión bruta | 25 | 2.376 | 44,4% |
| ARC-Easy, precisión normalizada | 25 | 2.376 | 41,9% |
| ARC-Challenge, precisión normalizada | 25 | 1.168 | 25,3% |
| MMLU, precisión | 5 | 14.042 | 25,3% |
| TruthfulQA, MC1 | 0 | 817 | 24,7% |
| TruthfulQA, MC2 | 0 | 817 | 42,1% |

Métricas de modelado de lenguaje en validación:

| Métrica | Valor |
|---|---:|
| Pérdida de validación | 2,426 |
| Perplejidad de validación | 11,31 |
| Bits por byte | 0,466 |
| Bits por carácter | 0,826 |

No se han publicado comparaciones directas con modelos similares en la información disponible. El autor advierte que las puntuaciones no son directamente comparables con evaluaciones de benchmarks en inglés y que los artefactos de traducción pueden afectar los resultados. No se reportan estimaciones de incertidumbre ni variación entre semillas de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, los pesos ocupan aproximadamente 1 GB; con overhead de activaciones y caché KV para 4.096 tokens, el requisito práctico ronda 2-3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; cabe en GPUs de consumo como RTX 3060, RTX 4060, RTX 4070 o superiores.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas de consumo con 4 GB o más.
- Opciones de despliegue: transformers (referencia oficial), text-generation-inference (el repo incluye el tag `text-generation-inference` y `endpoints_compatible`); para llama.cpp/Ollama sería necesaria una conversión a GGUF no documentada oficialmente.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables de otros modelos en la información proporcionada. A continuación se comparan características estructurales con alternativas plausibles de tamaño similar, marcando los datos no verificados:

| Modelo | Parámetros | Contexto | Idioma principal | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| LexisLM-500m | 0,502B | 4.096 | Griego | No disponible | Hugging Face |
| Alternativas de ~0,5B multilingües | ~0,5B | Variable | Multilingüe | Variable | Hugging Face |
| Alternativas de ~1B monolingües | ~1B | Variable | Variable | Variable | Hugging Face |

No se han publicado comparaciones de rendimiento con modelos similares en la información disponible.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable; requiere fine-tuning para tareas conversacionales o de instrucción.
- Rendimiento cercano al azar en razonamiento: ARC-Challenge y MMLU en torno al 25%, lo que limita su uso en tareas que requieran conocimiento o razonamiento.
- Riesgo de alucinación: al ser un modelo de completado de texto sin alineación, puede generar contenido factualmente incorrecto o incoherente.
- Sesgos: no se documentan análisis de sesgo; el corpus (Wikipedia y FineWeb2) puede introducir sesgos propios de esas fuentes.
- Limitación de idioma: solo griego; no soporta otros idiomas de forma fiable.
- Limitación de contexto: 4.096 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Licencia no disponible: la ausencia de licencia explícita impide confirmar si se permite uso comercial; debe consultarse con el autor antes de cualquier uso en producción.
- Artefactos de traducción en benchmarks: las evaluaciones usan traducciones al griego de benchmarks originalmente en inglés, lo que puede distorsionar los resultados.
- Sin estimaciones de incertidumbre: no se reportan intervalos de confianza ni variación entre semillas.
- Tokenizador sin `<eos>` automático: es necesario anteponer `<eos>` manualmente para iniciar un documento nuevo.

## Enlaces

- Hugging Face: https://huggingface.co/ComputationalLinguisticsLab/LexisLM-500m
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
