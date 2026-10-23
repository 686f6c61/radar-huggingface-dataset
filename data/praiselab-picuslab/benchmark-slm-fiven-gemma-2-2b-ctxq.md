# praiselab-picuslab/benchmark-slm-fiven-gemma-2-2b-ctxq

## Resumen

`praiselab-picuslab/benchmark-slm-fiven-gemma-2-2b-ctxq` es un adaptador LoRA (librería PEFT) construido sobre el modelo base `google/gemma-2-2b`. No se trata de un modelo entrenado desde cero, sino de un artefacto de ajuste fino de aproximadamente 0,1 GB que debe cargarse junto con los pesos completos del modelo base para poder utilizarse. Lo publica el grupo de investigación PRAISE (PRedictive AnalytIcs for underStanding big multimEdia data) del PICUS Lab, adscrito al Departamento de Ingeniería Eléctrica y Tecnologías de la Información (DIETI) de la Universidad de Nápoles Federico II.

El repositorio se enmarca en el proyecto "Benchmark SLM" y en los experimentos identificados con la etiqueta `or2`. Las etiquetas del repositorio (`benchmark-slm`, `dataset-fiven`, `strategy-ctxq`) indican que este adaptador es una de las variantes de un conjunto de experimentos controlados: un mismo dataset (`fiven`) combinado con distintas estrategias de entrenamiento, de las cuales esta es la etiqueta `ctxq`. La variante hermana publicada por el mismo grupo, `benchmark-slm-fiven-gemma-2-2b-mix`, describe el dataset como "turismo e cultura in Campania" y la estrategia como "training misto"; para la variante `ctxq` que nos ocupa no hay descripción equivalente en la información disponible.

Su relevancia es, por tanto, la de un artefacto de investigación reproducible y no la de un modelo listo para producción: permite comparar el efecto de distintas estrategias de ajuste fino sobre un mismo modelo base pequeño (2,6 mil millones de parámetros) y un mismo corpus. El acceso está restringido (gated) y el repositorio no incluye model card con detalles de entrenamiento, hiperparámetros ni evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only (`google/gemma-2-2b`) |
| Parámetros totales | No disponible para el adaptador; el modelo base tiene ~2,6 mil millones |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en el adaptador; el modelo base soporta 8.192 tokens |
| Tipos de cuantización | No disponible; el adaptador se distribuye en safetensors y puede combinarse con el base cuantizado tras el merge |
| Idiomas soportados | Italiano (`it`), según el campo de idioma del repositorio |
| Licencia | No disponible (el modelo base se rige por los términos de uso de Gemma) |
| Formato de pesos | safetensors (adaptador LoRA/PEFT) |
| Modelo base | `google/gemma-2-2b` |
| Tipo de artefacto | Adaptador de ajuste fino, no modelo completo |
| Librería | PEFT |
| Pipeline | text-generation |
| Tamaño del repositorio | 0,1 GB |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-23 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango inyectadas en las capas del transformer base, que permanece congelado durante el ajuste. El modelo subyacente, `google/gemma-2-2b`, es un transformer decoder-only de aproximadamente 2,6 mil millones de parámetros, con 26 capas, dimensión oculta de 2.304, 8 cabezas de atención (4 cabezas KV, dimensión de cabeza 256), capa intermedia de 9.216 y un vocabulario de 256.000 tokens; soporta una ventana de contexto de 8.192 tokens. Estos datos corresponden a la configuración pública del modelo base, no se han verificado contra la ficha del adaptador, que no está disponible.

No se dispone de información sobre el proceso de entrenamiento del adaptador: ni el número de tokens, ni la composición exacta del dataset `fiven`, ni el rango y alpha del LoRA, ni la tasa de aprendizaje, ni si hubo fases de RLHF o DPO. Las etiquetas `or2` y `strategy-ctxq` apuntan a una estrategia experimental concreta dentro del proyecto Benchmark SLM, pero su significado no se detalla en la información disponible. La variante hermana con etiqueta `mix` documenta un "training misto" sobre un corpus de turismo y cultura de Campania; es razonable que esta variante comparta el corpus y difiera en la estrategia, aunque no puede confirmarse.

## Capacidades

- Generación de texto en italiano: el adaptador está ajustado sobre un corpus en italiano y el campo de idioma del repositorio declara únicamente `it`.
- Especialización de dominio (probable): por analogía con la variante hermana del mismo proyecto, el ajuste apunta a contenido de turismo y cultura de la región de Campania; no confirmado para esta variante.
- Herencia de capacidades del modelo base: al ser un LoRA sobre Gemma 2 2B, conserva la tokenización de 256.000 entradas y la ventana de 8.192 tokens, aunque el ajuste puede degradar competencias generales no presentes en el corpus de entrenamiento.
- Soporte de tool calling o function calling: no disponible; no hay evidencia de entrenamiento en formato de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo base no está orientado a agentes y el ajuste no documenta este tipo de datos.
- Capacidades multilingües: limitadas al italiano declarado; el modelo base es multilingüe, pero el adaptador puede alterar ese comportamiento.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el modelo base es exclusivamente de texto.

## Casos de uso

- Reproducción de experimentos de benchmarking: cargar el adaptador con PEFT sobre `google/gemma-2-2b` en la configuración exacta del proyecto Benchmark SLM para replicar las comparativas entre estrategias (`ctxq`, `mix`, etc.) sobre el mismo dataset.
- Evaluación comparativa de estrategias de ajuste fino: usar este adaptador y sus variantes hermanas como línea base para medir el impacto de la estrategia de entrenamiento con un presupuesto de cómputo muy bajo (0,1 GB de pesos ajustados).
- Asistente de dominio turístico-cultural en italiano (con reservas): generar descripciones de recursos culturales o respuestas a preguntas sobre turismo en Campania, siempre que se valide contra fuentes oficiales, dado que no hay evaluación publicada.
- Prototipado rápido de asistentes en italiano: al requerir solo ~5,2 GB en fp16 para el base más el adaptador, permite montar un prototipo en una GPU de consumo antes de invertir en un modelo mayor.
- Investigación sobre olvido catastrófico: comparar las respuestas del modelo base y del adaptador sobre un conjunto de promesas generales para cuantificar la degradación introducida por un ajuste de dominio estrecho.
- Estudio de fusión de adaptadores: emplear el LoRA como uno de los componentes en experimentos de merge (por ejemplo, con `peft` o `mergekit`) para analizar la interoperabilidad entre adaptadores del mismo proyecto.
- Docencia y formación: ejemplo práctico de flujo completo PEFT (descarga de base gated, carga del adaptador, merge, conversión a GGUF) con un coste de hardware asumible en un laboratorio universitario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye model card, métricas de evaluación ni comparación con el modelo base; el proyecto se denomina "Benchmark SLM", pero los resultados de dicha comparativa no aparecen en los datos consultados.

## Requisitos de hardware

- VRAM en fp16/bf16: los pesos del modelo base ocupan ~5,2 GB (2,6 mil millones de parámetros × 2 bytes) más ~0,1 GB del adaptador. Con caché KV para 8.192 tokens (26 capas × 4 cabezas KV × 256 de dimensión × 2 bytes ≈ 106 KB por token, ~0,85 GB a contexto completo) y activaciones, el consumo realista se sitúa en 8-12 GB de VRAM.
- VRAM en cuantización de 8 bits: ~2,7 GB de pesos; en 4 bits (GGUF Q4_K_M): ~1,6-1,8 GB, lo que deja margen amplio para la caché KV.
- GPU recomendadas: A100 40 GB o H100 para servir en fp16 con lotes grandes; RTX 4090 (24 GB) para desarrollo y despliegue holgado; RTX 3090 (24 GB) como alternativa.
- GPU de consumo: sí cabe. Con fp16 es viable en RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070; con cuantización de 4 bits funciona en tarjetas de 8 GB (RTX 3060 Ti, RTX 4060, RTX 3070).
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador sin fusionar; `vLLM` o `TGI` con soporte de adaptadores LoRA en caliente (útil para servir varias variantes del benchmark desde un mismo base); `llama.cpp` u `Ollama` tras fusionar el adaptador con el base y convertir el resultado a GGUF.
- Latencia y throughput: no disponibles. Como referencia de orden de magnitud, un modelo denso de 2,6 mil millones en una RTX 4090 en fp16 queda limitado por memoria antes que por cómputo, pero no se ha medido para este artefacto concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Naturaleza |
|---|---|---|---|---|---|
| `praiselab-picuslab/benchmark-slm-fiven-gemma-2-2b-ctxq` | Adaptador sobre 2,6 mil millones | No disponible (base: 8.192) | No disponible (base: términos de Gemma) | Restringido (gated) | LoRA de investigación |
| `praiselab-picuslab/benchmark-slm-fiven-gemma-2-2b-mix` | Adaptador sobre 2,6 mil millones | No disponible (base: 8.192) | No disponible | Público en HuggingFace | LoRA de investigación, estrategia "misto" |
| `google/gemma-2-2b` | 2,6 mil millones | 8.192 tokens | Términos de uso de Gemma | Gated en HuggingFace | Modelo base preentrenado |
| `google/gemma-2-2b-it` | 2,6 mil millones | 8.192 tokens | Términos de uso de Gemma | Gated en HuggingFace | Modelo base ajustado a instrucciones |
| `Qwen/Qwen2.5-1.5B-Instruct` | 1,54 mil millones | 32.768 tokens | Apache 2.0 | Público | Alternativa pequeña, multilingüe y de uso comercial permisivo |

No se dispone de datos de rendimiento comparativos entre estas opciones en la información consultada; la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere descargar `google/gemma-2-2b` por separado (acceso gated) y cargar el adaptador con PEFT; sin el base, el repositorio es inutilizable.
- Ausencia total de documentación: no hay model card, hiperparámetros, composición del dataset ni evaluación, lo que impide auditar el comportamiento del adaptador.
- Licencia del adaptador no especificada: al derivar de Gemma 2, los términos de uso de Gemma condicionan la redistribución y el uso comercial; conviene verificar la cláusula aplicable antes de cualquier despliegue.
- Acceso restringido: el repositorio exige aceptar condiciones en HuggingFace, lo que añade fricción a la reproducibilidad y a la automatización de pipelines.
- Sesgos: no documentados. Al heredar el corpus de entrenamiento del modelo base y el corpus de ajuste, es esperable un sesgo hacia el dominio y la variedad dialectal o cultural del corpus italiano utilizado, no cuantificado.
- Riesgo de alucinación: alto en contenidos factuales de dominio (datos históricos, ubicaciones, horarios), ya que un ajuste LoRA estrecho no incorpora verificación factual y no hay evaluación que lo respalde.
- Olvido catastrófico: un ajuste de dominio sobre un modelo de 2,6 mil millones tiende a degradar capacidades generales y multilingües; no se ha medido la magnitud.
- Cobertura lingüística: solo italiano declarado; se desaconseja su uso en castellano u otros idiomas sin validación previa.
- Ventana de contexto: limitada a 8.192 tokens del modelo base; insuficiente para documentos largos sin técnicas de recuperación externa.
- Sin señales de uso en producción: 0 descargas y 0 likes, sin evidencia de validación por terceros.
- Idiomas y dominio: si el adaptador se entrenó únicamente con el corpus `fiven`, su comportamiento fuera de ese dominio es impredecible.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/praiselab-picuslab/benchmark-slm-fiven-gemma-2-2b-ctxq
- Variante hermana (estrategia "mix"): https://huggingface.co/praiselab-picuslab/benchmark-slm-fiven-gemma-2-2b-mix
- Modelo base: https://huggingface.co/google/gemma-2-2b
- Perfil de la organización en HuggingFace (incluye datasets): https://huggingface.co/praiselab-picuslab/datasets
- Organización en GitHub: https://github.com/PRAISELab-PicusLab
