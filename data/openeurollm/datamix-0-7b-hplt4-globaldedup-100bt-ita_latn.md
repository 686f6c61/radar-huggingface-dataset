# openeurollm/datamix-0.7B-hplt4-globaldedup-100bt-ita_Latn

## Resumen

El modelo `datamix-0.7B-hplt4-globaldedup-100bt-ita_Latn` es un modelo de lenguaje de 0,7 mil millones de parámetros desarrollado por el proyecto OpenEuroLLM, una iniciativa europea orientada a construir modelos fundacionales abiertos y multilingües. Se trata de un modelo entrenado desde cero (from scratch) sobre 100 mil millones de tokens del corpus HPLT 4 en italiano, tras aplicar un proceso de deduplicación global y sin filtrado adicional del contenido. Su nombre codifica de forma explícita la receta de entrenamiento: tamaño (0.7B), fuente de datos (HPLT 4), estrategia de limpieza (globaldedup), volumen de tokens (100bt) e idioma (ita_Latn, italiano en escritura latina).

La relevancia de este modelo es fundamentalmente experimental y de investigación: forma parte de la familia de modelos "datamix" de OpenEuroLLM, cuyo propósito es estudiar el impacto de distintas decisiones de composición y limpieza de datos sobre el rendimiento final. Al publicarse bajo licencia Apache 2.0 y con pesos en formato safetensors, sirve como referencia reproducible para quienes investigan el efecto de la deduplicación a gran escala en modelos pequeños entrenados con presupuestos de cómputo acotados.

No obstante, conviene subrayar que se trata de un modelo monolingüe (solo italiano), sin pipeline declarado en Hugging Face y con cero descargas en el momento de la consulta, lo que sugiere que es un artefacto de investigación más que un modelo listo para producción. La información pública disponible es muy limitada: la model card apenas contiene una frase descriptiva, por lo que muchos detalles técnicos deben marcarse como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer decoder-only, sin confirmar) |
| Parámetros totales | 0,7B (700 millones, según el nombre del modelo) |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantizaciones GGUF no confirmadas) |
| Idiomas soportados | italiano (it) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo. Por el nombre y por las convenciones habituales de la familia OpenEuroLLM, cabe esperar un transformer decoder-only de tipo GPT, pero esto no está confirmado en la model card ni en los metadatos disponibles. El dato firme es el presupuesto de entrenamiento: 100 mil millones de tokens procedentes de HPLT 4 en italiano, tras aplicar deduplicación global. No se menciona ningún filtrado de calidad adicional, lo que constituye precisamente una de las variables experimentales del modelo: medir el efecto de la deduplicación sin filtrado posterior.

No hay información sobre el número exacto de tokens de entrenamiento por parámetro más allá de la cifra global, ni sobre la composición detallada del dataset, la tokenizador empleado, la presencia de RLHF, DPO o ajuste de instrucciones, ni innovaciones técnicas como decodificación especulativa o atención lineal. Tampoco se documenta la estrategia de paralelización, el hardware utilizado ni la curva de entrenamiento. Todos estos extremos deben considerarse no disponibles.

## Capacidades

- Generación de texto en italiano: el modelo está entrenado exclusivamente con datos en italiano (etiqueta `it`), por lo que su competencia se limita a ese idioma.
- Modelo base (base model): no hay evidencia de ajuste por instrucciones, por lo que no se debe esperar un comportamiento conversacional ni seguimiento de instrucciones fiable.
- Razonamiento y conocimiento general: capacidad esperable limitada por el tamaño (0,7B) y por la ausencia de filtrado de calidad en los datos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el modelo declara únicamente italiano.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Generación de código y matemáticas: no documentada; con este tamaño y esta receta de datos, el rendimiento esperable es bajo.

## Casos de uso

- Investigación sobre calidad de datos: el modelo permite aislar el efecto de la deduplicación global frente a otras estrategias de limpieza, sirviendo como punto de comparación en experimentos controlados de data mixing.
- Reproducción de experimentos de escalado: con 0,7B de parámetros y 100B de tokens, es adecuado para estudiar leyes de escalado y relaciones tokens/parámetro en entornos de cómputo reducido.
- Evaluación de modelos base en italiano: puede emplearse como referencia monolingüe italiana en benchmarks de perplejidad y generación para comparar con modelos multilingües de tamaño similar.
- Fine-tuning posterior para tareas específicas en italiano: al ser un modelo base pequeño con licencia Apache 2.0, es un punto de partida económico para ajuste supervisado en dominios concretos (clasificación, extracción, resumen) dentro de proyectos de investigación.
- Docencia y formación: su tamaño permite ejecutarlo en hardware modesto, lo que lo hace útil para demostraciones de entrenamiento e inferencia de LLM en cursos y talleres.
- Generación de texto auxiliar de bajo coste en italiano: en pipelines donde el rendimiento no es crítico (por ejemplo, aumento de datos sintéticos o generación de borradores), puede desplegarse en CPU o GPU de gama baja.
- Estudio de sesgos y contaminación de corpus web: al derivarse de HPLT 4 sin filtrado, es un caso de estudio útil para analizar qué tipo de contenido y sesgos arrastra un corpus web deduplicado pero no filtrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,4 GB solo para pesos, más overhead de activaciones y caché KV (típicamente 2-4 GB en total según longitud de contexto).
- VRAM estimada en cuantización de 8 bits: alrededor de 0,7-1 GB para pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 0,4-0,6 GB para pesos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3060, RTX 4060, RTX 4090 o superiores ofrecen margen amplio. También es viable en CPU.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con 4 GB o más de VRAM, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: al publicarse solo en safetensors, requiere frameworks como PyTorch con `transformers`, vLLM o TGI (previa conversión si el modelo no está soportado nativamente). Para llama.cpp u Ollama sería necesaria una conversión a GGUF no publicada por el autor.
- Latencia y throughput estimados: no disponibles; con 0,7B de parámetros se espera un throughput alto en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| datamix-0.7B-hplt4-globaldedup-100bt-ita_Latn | 0,7B | no disponible | italiano | Apache 2.0 | Hugging Face, 0 descargas |
| Modelos de la familia OpenEuroLLM "datamix" (otras recetas) | ~0,7B | no disponible | varios | Apache 2.0 (presumible) | Hugging Face |
| Modelos base pequeños multilingües europeos (p. ej., variantes de ~1B) | ~1B | variable | multilingüe | variable | Hugging Face |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas concretas; la comparativa anterior es estructural y no de calidad.

## Limitaciones y advertencias

- Modelo monolingüe: solo italiano; no se debe esperar competencia en castellano ni en otros idiomas.
- Modelo base sin ajuste por instrucciones: no es adecuado para uso conversacional directo sin fine-tuning.
- Entrenado sin filtrado de calidad: al usar HPLT 4 deduplicado pero sin filtro adicional, es probable que haya incorporado contenido de baja calidad, ruido y sesgos presentes en la web.
- Riesgo elevado de alucinación y de generación de texto incoherente, agravado por el tamaño reducido (0,7B) y la ausencia de alineación.
- Sin datos publicados de evaluación: no es posible verificar su calidad objetiva ni compararla con alternativas.
- Contexto y tokenizador no documentados: limita la planificación de despliegues con ventanas largas.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume la responsabilidad sobre el contenido generado y sobre posibles infracciones derivadas del corpus de entrenamiento.
- Artefacto de investigación: cero descargas y documentación mínima; no hay garantía de mantenimiento ni soporte.
- Fecha de creación futura en los metadatos (2026-11-09): conviene verificar la integridad y procedencia del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openeurollm/datamix-0.7B-hplt4-globaldedup-100bt-ita_Latn
- Organización OpenEuroLLM en Hugging Face: https://huggingface.co/openeurollm
- Proyecto OpenEuroLLM: no disponible en la información proporcionada
- Paper o blog de la familia datamix: no disponible en la información proporcionada
- Corpus HPLT 4: no disponible en la información proporcionada
