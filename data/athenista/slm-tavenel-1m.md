# athenista/slm-tavenel-1m

## Resumen

SLM-Tavenel 1M es un modelo de lenguaje base de tipo decoder-only con 1.181.920 parámetros, desarrollado por el usuario athenista y publicado en Hugging Face bajo licencia MIT. Se trata de un artefacto de investigación experimental entrenado desde cero sobre un subconjunto de French-Science-Commons etiquetado como CC0, con el objetivo declarado de estudiar de forma preregistrada el efecto de una compuerta de atención por cabeza (head-wise attention gate) sobre el rendimiento del modelo.

El modelo no está ajustado por instrucciones ni diseñado como asistente conversacional: es un modelo base de escala mínima (1,18 millones de parámetros) pensado para experimentación reproducible, no para producción. Su relevancia radica en la trazabilidad del estudio: se publican 20 réplicas de entrenamiento, el protocolo preregistrado, los pesos en float32 y una copia en bfloat16, además de una autoevaluación frente a la definición de IA de código abierto OSAID 1.0.

La arquitectura es un transformer decoder-only de 4 capas, anchura 96, 3 cabezas de consulta y 1 de clave-valor, SwiGLU de 256 y una ventana de contexto de 1.024 tokens. El tokenizador es un BPE a nivel de byte propio del proyecto con 8.192 tokens. Soporta inglés y francés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, 4 capas, anchura 96, 3 cabezas de consulta / 1 de clave-valor, SwiGLU 256, compuerta de atención por cabeza |
| Parámetros totales | 1.181.920 (control sin compuerta: 1.180.768) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantización | No disponible (se publican pesos en float32 y una copia en bfloat16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés y francés (en, fr) |
| Licencia | MIT (pesos, código e información de datos) |
| Formato de pesos | safetensors (`model.safetensors`, float32; copia bfloat16 en `variants/bf16/`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 4 capas con anchura 96, 3 cabezas de consulta y una única cabeza de clave-valor (atención multi-query), capa SwiGLU de dimensión 256 y una compuerta de atención por cabeza que constituye la innovación técnica central del trabajo. El tokenizador es un BPE a nivel de byte propio del proyecto, con vocabulario de 8.192 tokens, construido con la librería `tokenizers` 0.22.2. La precisión de entrenamiento fue bfloat16 con precisión mixta y algoritmos deterministas.

El entrenamiento se realizó sobre 1.229 documentos de French-Science-Commons etiquetados como CC0 (748 en inglés, 481 en francés), lo que supone 15,98 millones de posiciones de token de entrenamiento, aproximadamente una pasada sobre los datos. Se usó el optimizador AdamW con semilla de publicación 421101, preseleccionada en el protocolo. Todo el cómputo se ejecutó en una única GPU RTX 4060 Laptop de 8 GB, con aproximadamente 0,06 horas-GPU para la ejecución publicada (20 ejecuciones en el estudio completo); la energía no se midió. No se documenta ajuste por instrucciones, RLHF ni DPO.

El resultado principal del estudio es que, en diez semillas emparejadas, el modelo con compuerta redujo los bits por byte (BPB) en held-out en 0,0275 respecto a un modelo sin compuerta, con un intervalo de confianza del 95 % por bootstrap jerárquico de [0,0168, 0,0395] y un umbral práctico predeclarado de 0,01 BPB.

## Capacidades

- Generación de texto autoregresiva como modelo base, sin ajuste por instrucciones.
- Razonamiento de opción múltiple evaluado en modo zero-shot por verosimilitud (ARC-Easy, ARC-Challenge, HellaSwag, Belebele, WinoGrande).
- Comprensión lectora multilingüe limitada a inglés y francés (evaluado en Belebele en ambos idiomas).
- Capacidad de completar texto y modelar lenguaje en los dos idiomas de entrenamiento.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión, audio ni otras capacidades multimodales.
- No es un asistente conversacional: no hay ajuste de instrucciones ni de diálogo.

## Casos de uso

- Investigación sobre compuertas de atención: el modelo sirve como referencia reproducible para estudiar el efecto de una head-wise attention gate en modelos pequeños, con 20 réplicas y protocolo preregistrado disponibles en el repositorio.
- Reproducción de experimentos de entrenamiento: al publicarse pesos, semilla, datos y registro de entrenamiento, permite replicar el pipeline completo en una GPU de consumo de 8 GB en menos de una hora-GPU.
- Docencia y divulgación: su escala de 1,18 M de parámetros y su contexto de 1.024 tokens lo hacen adecuado para explicar el ciclo completo de entrenamiento de un transformer decoder-only desde cero.
- Evaluación de metodología de benchmarks: útil para validar arneses de evaluación de opción múltiple por verosimilitud (log-likelihood) en conjuntos como ARC, HellaSwag o Belebele.
- Estudio de tokenizadores BPE a nivel de byte: el tokenizador propio de 8.192 tokens permite analizar el impacto del vocabulario en modelos de escala mínima sobre corpus bilingües inglés-francés.
- Pruebas de infraestructura de inferencia: al ser un modelo de 0,1 GB de repositorio y pesos en float32, sirve para validar pipelines de carga con `transformers` y código personalizado (`custom_code`) antes de escalar a modelos mayores.
- Análisis de datos científicos en francés: el corpus de entrenamiento proviene de French-Science-Commons, por lo que el modelo puede emplearse para estudiar la modelización de lenguaje científico francés a pequeña escala, sin expectativas de calidad de producción.

## Benchmarks y rendimiento

Resultados declarados por el autor (evaluador SLM-Tavenel, 0-shot, log-likelihood, no verificados):

| Benchmark | Configuración | Métrica | Valor |
|---|---|---|---|
| ARC-Easy | test | accuracy | 0,280 |
| ARC-Challenge | test | accuracy | 0,196 |
| HellaSwag | validation | accuracy | 0,259 |
| Belebele (inglés) | eng_Latn, test | accuracy | 0,264 |
| Belebele (francés) | fra_Latn, test | accuracy | 0,266 |
| WinoGrande (XL) | validation | accuracy | 0,493 |

No se han publicado en la información disponible resultados comparativos con otros modelos en estos benchmarks; las cifras anteriores son las únicas declaradas por el autor y no están verificadas de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (1,18 M de parámetros, ~4,7 MB de pesos) y aún menor en bfloat16; el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el entrenamiento publicado se ejecutó en una RTX 4060 Laptop de 8 GB.
- Cabe holgadamente en cualquier GPU de consumo, incluidas GTX 1050, RTX 2060, RTX 3060, RTX 4060 y superiores; también en CPU.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (el modelo requiere `custom_code`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada. El coste de entrenamiento publicado fue de ~0,06 horas-GPU en una RTX 4060 Laptop.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SLM-Tavenel 1M | 1.181.920 | 1.024 | MIT | Hugging Face | Modelo base experimental, en/fr, compuerta de atención por cabeza |
| Modelos comparables de escala similar | no disponible | no disponible | no disponible | no disponible | No se han identificado en la información proporcionada alternativas directamente comparables de escala ~1M con contexto y licencia documentados |

No se dispone de datos de benchmarks de terceros para establecer una comparación cuantitativa con modelos de la misma categoría.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no debe usarse como asistente conversacional ni para tareas que requieran seguir instrucciones de forma fiable.
- Escala extremadamente reducida (1,18 M de parámetros): la calidad de generación y el conocimiento factual son muy limitados; los resultados en benchmarks de razonamiento están cerca del azar en varios conjuntos (ARC-Challenge 0,196; HellaSwag 0,259).
- Riesgo elevado de alucinación y de texto incoherente en generaciones largas, inherente a un modelo de este tamaño.
- Ventana de contexto de solo 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Cobertura lingüística limitada a inglés y francés; no se documenta rendimiento en castellano ni en otros idiomas.
- Datos de entrenamiento reducidos (1.229 documentos, 15,98 M de posiciones de token, una pasada): posible infraajuste y sesgos derivados de la composición del corpus francés de ciencia.
- El autor declara limitaciones de privacidad y metadatos de licencia de origen en la model card; conviene revisar la sección de datos, licencias y privacidad antes de cualquier uso.
- La autoevaluación frente a OSAID 1.0 es del propio autor y no constituye una certificación de OSI.
- Los resultados de benchmarks son declarados por el autor, no verificados de forma independiente, y proceden de un evaluador propio del proyecto.
- Licencia MIT: permite uso comercial, pero al ser un artefacto de investigación no se recomienda su despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/athenista/slm-tavenel-1m
- Repositorio del proyecto (visión general): https://github.com/thekester/slm-tavenel#slm-tavenel
- Catálogo de modelos publicados: https://github.com/thekester/slm-tavenel#published-models
- Archivo de investigación y reproducibilidad: https://github.com/thekester/slm-tavenel#research-and-reproducibility
- Comparativas de benchmarks (EXP-0010): https://huggingface.co/athenista/slm-tavenel-1m/blob/main/training_record/benchmark-comparisons.json
- Dataset de entrenamiento: https://huggingface.co/datasets/PleIAs/French-Science-Commons
