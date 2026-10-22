# alfred8995/sn38-r3-2023-pomlnb-chronollm-2023

## Resumen

El modelo `alfred8995/sn38-r3-2023-pomlnb-chronollm-2023` es un modelo de lenguaje de aproximadamente 1.860 millones de parámetros (1.858.535.658 según los metadatos de safetensors) publicado en HuggingFace por el usuario alfred8995. Por su identificador y las etiquetas asociadas, se trata de una entrega de la ronda 3 (`r3`) de la competición de entrenamiento del subnet 38 de Bittensor, denominado ChronoLLM, correspondiente a la "cosecha" o *vintage* de 2023. La etiqueta `ChronoGPT` apunta a un transformer decoder-only de tipo GPT, aunque la documentación pública no detalla la arquitectura interna ni la longitud de contexto.

La propuesta de ChronoLLM consiste en entrenar un modelo por año entre 2013 y 2025, cada uno expuesto únicamente a datos disponibles hasta la fecha de corte de ese año. El objetivo es disponer de modelos "temporalmente consistentes", es decir, sin conocimiento del futuro filtrado desde el corpus de entrenamiento, algo relevante para investigación en previsión, análisis retrospectivo y evaluación de contaminación temporal de datos. Este modelo concreto cubriría el corte de 2023.

Es relevante ahora porque el acceso a modelos con corte de conocimiento controlado y verificable es escaso: la mayoría de los LLM comerciales mezclan información de múltiples años sin transparencia sobre sus fechas de corte reales. Ahora bien, la ficha debe leerse con cautela: el repositorio está restringido (gated), no incluye model card pública, no tiene descargas ni valoraciones y no se han publicado benchmarks en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo GPT (etiqueta `ChronoGPT`); el detalle de capas, dimensiones y mecanismo de atención no está documentado |
| Parametros totales | 1.858.535.658 (~1,86 mil millones) |
| Parametros activos | No aplica: no hay evidencia de arquitectura MoE en la información disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors (sin GGUF ni cuantizaciones precalculadas) |
| Idiomas soportados | no disponible |
| Licencia | `other` (términos no especificados en la información disponible; acceso sujeto a aceptación de condiciones en HuggingFace) |
| Formato de pesos | safetensors (tamaño del repositorio: 7,4 GB) |

## Arquitectura y entrenamiento

La información disponible no incluye una descripción técnica de la arquitectura. La etiqueta `ChronoGPT` y la nomenclatura del proyecto (ChronoLLM) sugieren una familia de transformers decoder-only autorregresivos, coherente con el tamaño de ~1,86 B de parámetros y con el uso previsto como modelo conversacional a través del cliente `chronollm` publicado en PyPI. No se documentan el número de capas, la dimensión oculta, el tipo de atención, la tokenizador ni la estrategia de posicionamiento. El repositorio pesa 7,4 GB, lo que es consistente con pesos almacenados en fp32 (1,858 B × 4 bytes ≈ 7,43 GB), aunque este extremo no está confirmado por el autor.

El rasgo definitorio del proyecto es el entrenamiento cronológicamente acotado: según la documentación del subnet 38, cada modelo se entrena exclusivamente con datos disponibles hasta el corte del año correspondiente (2023 en este caso), con el objetivo de eliminar la fuga de conocimiento futuro. No se especifican el volumen de tokens de entrenamiento, la composición del corpus, ni si se aplicaron fases de instruction tuning, RLHF o DPO. Tampoco se detalla el proceso de evaluación empleado por la competición para seleccionar esta entrega dentro de la ronda 3.

## Capacidades

- Generación de texto autorregresiva en formato conversacional, tal como expone el cliente `chronollm` de PyPI (chat con un año *vintage* concreto).
- Conocimiento acotado a eventos y publicaciones disponibles hasta el corte de 2023, sin información posterior por diseño del proyecto.
- Conversación multi-turno: el cliente oficial plantea un uso de chat, aunque no se documenta la ventana de contexto efectiva.
- Razonamiento y respuesta sobre el estado del arte de un dominio a finales de 2023, útil como referencia temporal controlada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas en los metadatos.
- Capacidades especiales (modo *thinking*, visión, audio): no disponible; no hay evidencia de modalidades distintas del texto.

## Casos de uso

- Análisis retrospectivo con corte temporal estricto: usar el modelo para reconstruir qué información era accesible a finales de 2023 sobre un sector o tecnología, evitando que el análisis se contamine con desarrollos posteriores.
- Evaluación de contaminación temporal (*data leakage*) en pipelines de datos: emplear este modelo como referencia de "conocimiento 2023" y comparar sus respuestas con las de un modelo actual para detectar qué hechos han entrado en el corpus después del corte.
- Backtesting de tesis de inversión o estrategia: generar el rationale disponible en 2023 sobre un activo o mercado y contrastarlo con lo ocurrido, sin filtración de información posterior.
- Investigación en previsión y forecasting: medir la capacidad predictiva real de un modelo que no ha visto el desenlace de los acontecimientos, lo que permite evaluaciones más limpias que con modelos actuales.
- Auditoría de decisiones pasadas: reconstruir el contexto informativo con el que se tomó una decisión en 2023 dentro de una organización, útil en cumplimiento normativo y análisis post-mortem.
- Docencia y divulgación: explicar el estado de un campo (por ejemplo, IA generativa o computación cuántica) tal y como se veía en 2023, con la garantía de que el modelo no mezclará avances posteriores.
- Experimentación en entornos con recursos limitados: con ~1,86 B de parámetros cabe en GPU de consumo, lo que permite probar técnicas de ajuste fino o de evaluación sobre un modelo pequeño sin depender de infraestructura de datacenter.
- Integración en herramientas internas mediante el cliente `chronollm` de PyPI, que gestiona la autenticación con HuggingFace y la selección del modelo por año.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones específicas de consistencia temporal para esta entrega, y el repositorio no incluye model card con métricas.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los 1,858 B de parámetros, no de datos publicados): ~7,4 GB de pesos en fp32, ~3,7 GB en fp16/bf16, ~1,9 GB en int8 y ~0,9 GB en int4, más caché KV y overhead del runtime.
- GPU recomendadas: cualquier GPU con 8-12 GB de VRAM para fp16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, L4 24 GB); para fp32 se recomienda partir de 12 GB (RTX 3060 12 GB, RTX 4070 Ti, A10). A100 y H100 son innecesarias para este tamaño, aunque válidas para servir en lote.
- Cabe en GPU de consumo: sí, en fp16 en tarjetas de 8 GB o más y en cuantización de 4-8 bits en tarjetas de 6-8 GB, siempre que se conviertan los pesos (no hay GGUF publicado).
- Opciones de despliegue: `transformers` (referencia), vLLM y TGI para serving; llama.cpp u Ollama requieren convertir previamente los safetensors a GGUF; el cliente oficial `chronollm` (PyPI) para uso conversacional con token de HuggingFace.
- Latencia y throughput: no disponible. A modo orientativo, un modelo denso de ~1,86 B en una RTX 4090 suele operar en el rango de decenas a centenares de tokens por segundo con vLLM, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Corte de conocimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `alfred8995/sn38-r3-2023-pomlnb-chronollm-2023` | ~1,86 B | no disponible | 2023 | `other` (restringida, gated) | Requiere aceptar condiciones |
| `pomlnb/chronollm-2022` | ~2 B (según la ficha de HuggingFace) | no disponible | 2022 | no disponible | no disponible |
| `pomlnb/chronollm-2021` | ~2 B (según la ficha de HuggingFace) | no disponible | 2021 | no disponible | no disponible |
| `alfred8995/r16-H-chrono4-skd-s500` | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es dentro de la propia familia ChronoLLM: mismos objetivos de consistencia temporal y misma escala (~2 B), diferenciándose por el año de corte. No se dispone de datos de rendimiento comparado entre estas entregas ni frente a modelos generalistas de tamaño similar, por lo que no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Corte de conocimiento en 2023: el modelo no conoce nada posterior por diseño, por lo que no debe utilizarse para responder preguntas de actualidad.
- Repositorio restringido (gated): es necesario aceptar condiciones en HuggingFace y disponer de token para descargar los pesos.
- Licencia `other` sin términos detallados en la información disponible: es imprescindible revisar las condiciones antes de cualquier uso comercial o redistribución.
- Ausencia de model card: no se documentan datos de entrenamiento, idiomas, tokenizador, contexto ni proceso de alineación, lo que dificulta la evaluación de riesgos.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas de tamaño similar.
- Modelo de competición con 0 descargas y 0 valoraciones: no ha pasado por validación de la comunidad y su robustez en producción es desconocida.
- Riesgo de alucinación: inherente a los modelos de ~2 B sin documentación de对齐/alineación; no se ha verificado si hubo instruction tuning o filtrado de datos.
- Sesgos: no hay información sobre la composición del corpus, por lo que no puede evaluarse el sesgo temporal, geográfico o lingüístico del modelo.
- Idiomas no declarados: no se garantiza un rendimiento aceptable en castellano ni en idiomas distintos del dominante en el corpus de entrenamiento (presumiblemente inglés).
- No apto para asesoramiento médico, legal o financiero sin verificación humana y sin contrastar con fuentes actuales.
- El identificador incluye la ronda y el año, pero no se documenta qué métrica de la competición lo seleccionó ni su posición relativa en la ronda.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alfred8995/sn38-r3-2023-pomlnb-chronollm-2023
- Investigación sobre el subnet 38 (ChronoLLM): https://subnetradar.com/research/subnets/38
- Modelos del autor pomlnb (chronollm-2021, chronollm-2022): https://huggingface.co/pomlnb/models
- Otro checkpoint del mismo autor: https://huggingface.co/alfred8995/r16-H-chrono4-skd-s500
- Repositorio del proyecto SN38: https://github.com/chronollm/sn38
- Cliente Python en PyPI: https://pypi.org/project/chronollm/
