# goodmai/gemma-4-26B-A4B-it-QTIP-3.0bpw-MLX

## Resumen

`goodmai/gemma-4-26B-A4B-it-QTIP-3.0bpw-MLX` es una cuantización experimental del modelo `google/gemma-4-26B-A4B-it` de Google, publicada por el usuario goodmai y orientada específicamente al ecosistema MLX de Apple Silicon. El checkpoint aplica QTIP (Quantization with Trellis and Incoherent Processing) a 3.0 bits por peso sobre las 205 proyecciones densas del modelo, manteniendo los expertos enrutados en 4 bits, lo que reduce el peso en disco a 15,04 GB frente a los aproximadamente 15,1 GB del repositorio completo.

El interés de esta ficha radica en que se trata de una derivación de tercera generación: parte de `mlx-community/gemma-4-26B-A4B-it-qat-4bit`, que a su vez es una cuantización QAT (quantization-aware training) del modelo original de Google. El autor documenta métricas de calidad medibles (perplejidad en WikiText-2 y una prueba de precisión de sistema uno) y un comando reproducible de conversión, lo que permite auditar el proceso.

Al ser un artefacto de cuantización y no un modelo entrenado desde cero, hereda las capacidades, limitaciones y licencia del modelo base Gemma 4, pero añade restricciones propias: requiere MLX y hardware Apple Silicon, y su licencia `gemma` impone las condiciones de uso de Google. El número de descargas y likes es cero en el momento de la consulta, lo que indica que es un artefacto reciente y sin validación comunitaria amplia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), según la designación A4B del modelo base; detalles finos no disponibles |
| Parámetros totales | 24.316.280.061 (24,3 mil millones, dato real de safetensors) |
| Parámetros activos | no disponible (la nomenclatura A4B sugiere ~4 mil millones activos, sin confirmación en la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | QTIP 3.0 bpw con trellis bitshift (L=16, V=2, HYB Q=9) en 205 proyecciones densas; expertos enrutados en 4 bits; derivado de un checkpoint QAT de 4 bits |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors (librería mlx) |
| Tamaño del repositorio | 15,1 GB |
| Peso de los pesos | 15,04 GB |
| Hardware objetivo | Apple Silicon (MLX), probado en Apple M4 Pro de 24 GB |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 26B-A4B, un transformer con mezcla de expertos de Google. Esta ficha no dispone de detalles sobre el número de capas, dimensión oculta, número de expertos ni composición del dataset de entrenamiento original; esa información no está incluida en los datos proporcionados. La designación A4B indica que el modelo activa aproximadamente 4 mil millones de parámetros por token, aunque el dato exacto de parámetros activos no se ha confirmado.

La innovación de este checkpoint es puramente de compresión. El autor aplica QTIP 3.0 con trellis bitshift y transformada de Hadamard aleatoria de Kronecker (Kronecker RHT) junto con BlockLDLQ, un método de retroalimentación de Hessiana por bloques, sobre las 205 proyecciones lineales densas. Los expertos enrutados se mantienen en 4 bits. El proceso parte de `mlx-community/gemma-4-26B-A4B-it-qat-4bit` y es reproducible con el comando `basalt models convert mlx-community/gemma-4-26B-A4B-it-qat-4bit --experimental-qtip 3.0 --out ./out`. No se documenta ningún entrenamiento adicional, RLHF ni DPO en esta derivación.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados del modelo base Gemma 4.
- Capacidad de mezcla de expertos con activación dispersa, orientada a eficiencia en inferencia.
- Soporte de tool calling, agentes y razonamiento multi-paso: no confirmado en la información disponible para este checkpoint.
- Capacidades multilingües: no disponibles; el modelo base las tiene, pero no se detallan aquí.
- Modo de pensamiento (thinking), visión o audio: no disponible en la información proporcionada.
- Ejecución nativa en MLX sobre Apple Silicon, con integración en la herramienta Basalt (app macOS y CLI).

## Casos de uso

- Inferencia local en Mac con memoria unificada limitada: el checkpoint ocupa 15,04 GB, por lo que cabe en equipos Apple Silicon de 24 GB como el M4 Pro usado por el autor, permitiendo ejecutar un modelo de 24,3 mil millones de parámetros totales sin GPU dedicada.
- Prototipado de asistentes conversacionales en macOS: mediante `basalt serve --model goodmai/gemma-4-26B-A4B-it-QTIP-3.0bpw-MLX --rest` se expone una API REST local para integrar el modelo en aplicaciones de escritorio.
- Evaluación de técnicas de cuantización extrema: el checkpoint sirve como referencia reproducible para investigadores que comparan QTIP 3.0 bpw frente a QAT 4 bits, con métricas de perplejidad y precisión documentadas.
- Desarrollo de herramientas CLI sin Python: Basalt permite servir el modelo en macOS 27 o superior sin dependencias de Python, útil en entornos de desarrollo restringidos.
- Pruebas de calidad en tareas de razonamiento de sistema uno: el autor reporta 280/300 (93,3 %) en su prueba, lo que permite usar el modelo como banco de pruebas para medir degradación por cuantización.
- Despliegue de chat multilingüe en local: los botones de la model card ofrecen roles de chat en ruso e inglés, lo que sugiere uso conversacional en ambos idiomas, aunque la lista completa de idiomas no está confirmada.

## Benchmarks y rendimiento

| Métrica | Valor medido |
|---|---|
| Método de cuantización | QTIP 3.0 bpw Bitshift Trellis (L=16, V=2, HYB Q=9) + Kronecker RHT + BlockLDLQ (#409) |
| Perplejidad WikiText-2 16k (`4×4096`) | 176,46 (KL Step-0: 0,354) |
| Precisión sistema uno (N=300) | 280/300 (93,3 %) |
| Huella de pesos | 15,04 GB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos anteriores son mediciones propias del autor en Apple M4 Pro de 24 GB y no son directamente comparables con evaluaciones de terceros.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 15,04 GB solo para pesos; se recomienda al menos 24 GB de memoria unificada para margen de contexto y caché KV, como el M4 Pro usado por el autor.
- GPU recomendadas: Apple Silicon exclusivamente (M1, M2, M3, M4 y variantes Pro/Max/Ultra); no es compatible con CUDA ni ROCm.
- ¿Cabe en GPU de consumo? Sí, en Mac con memoria unificada de 24 GB o superior; no aplica a GPUs NVIDIA/AMD de consumo porque el formato es MLX.
- Opciones de despliegue: MLX, Basalt (app macOS y CLI con servidor REST), y potencialmente otras herramientas compatibles con MLX; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| goodmai/gemma-4-26B-A4B-it-QTIP-3.0bpw-MLX | 24,3 B totales | no disponible | QTIP 3.0 bpw (densas) + 4 bits (expertos) | gemma | Hugging Face, MLX |
| mlx-community/gemma-4-26B-A4B-it-qat-4bit | 24,3 B totales (modelo base de esta derivación) | no disponible | QAT 4 bits | gemma | Hugging Face, MLX |
| google/gemma-4-26B-A4B-it | 24,3 B totales | no disponible | pesos completos (presumiblemente bf16/fp16) | gemma | Hugging Face |

No se dispone de datos de rendimiento comparativos entre estas variantes más allá de las métricas propias del autor. La comparación con modelos de otros fabricantes no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Cuantización experimental: el propio autor la etiqueta como experimental; la perplejidad de 176,46 en WikiText-2 debe interpretarse en el contexto de su método de medición y no como comparable a evaluaciones estándar.
- Degradación por cuantización: 3,0 bpw en proyecciones densas implica pérdida de calidad frente al modelo original; la precisión del 93,3 % en la prueba del autor no cubre todas las tareas.
- Compatibilidad restringida: solo funciona con MLX y Apple Silicon; no es desplegable en CUDA, ROCm ni en GPUs de consumo NVIDIA/AMD.
- Idiomas y contexto no documentados: no se especifican la longitud de contexto efectiva ni la lista de idiomas soportados, lo que dificulta planificar aplicaciones multilingües o de contexto largo.
- Licencia Gemma: el uso comercial está sujeto a los términos de Google para la familia Gemma; es necesario revisar las condiciones de redistribución y atribución antes de usarlo en producción.
- Sin validación comunitaria: cero descargas y cero likes en el momento de la consulta; no hay evidencia de terceros sobre su comportamiento.
- Riesgo de alucinación y sesgos: heredados del modelo base y no evaluados en esta derivación; no se han publicado análisis específicos.
- Dependencia de la herramienta Basalt: el flujo de ejecución recomendado requiere macOS 27 o superior y la CLI Basalt, lo que añade una dependencia de software propietario del autor.

## Enlaces

- [Hugging Face: goodmai/gemma-4-26B-A4B-it-QTIP-3.0bpw-MLX](https://huggingface.co/goodmai/gemma-4-26B-A4B-it-QTIP-3.0bpw-MLX)
- [Modelo base: google/gemma-4-26B-A4B-it](https://huggingface.co/google/gemma-4-26B-A4B-it)
- [Checkpoint de partida: mlx-community/gemma-4-26B-A4B-it-qat-4bit](https://huggingface.co/mlx-community/gemma-4-26B-A4B-it-qat-4bit)
- [Repositorio Basalt en GitHub](https://github.com/goodmai/basalt)
- [Demo Basalt en Hugging Face Spaces](https://goodmai-run-with-basalt.hf.space/?model=goodmai%2Fgemma-4-26B-A4B-it-QTIP-3.0bpw-MLX&role=chat&lang=es)
