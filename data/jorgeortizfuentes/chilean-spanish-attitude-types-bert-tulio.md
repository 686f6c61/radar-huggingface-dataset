# jorgeortizfuentes/chilean-spanish-attitude-types-bert-tulio

## Resumen

El modelo `chilean-spanish-attitude-types-bert-tulio` es un clasificador de tokens (token classification) desarrollado por Jorge Ortiz Fuentes que etiqueta los tres tipos de actitud definidos por la teoría de la valoración (Appraisal Theory) dentro de la lingüística sistémico-funcional: `afecto`, `juicio` y `apreciación`. Se basa en el encoder TULIO (`dccuchile/tulio-chilean-spanish-bert`), un modelo BERT entrenado específicamente para el español de Chile, y se ha afinado sobre el corpus chileno de actitud (`jorgeortizfuentes/chilean-spanish-attitude-corpus`).

El modelo resuelve la tarea de detección de tramos (spans) de lenguaje evaluativo en textos del español chileno, un problema relevante para el análisis de discurso, la lingüística computacional y la minería de opiniones. Publicado con licencia CC-BY-4.0 y pesos abiertos, está disponible en Hugging Face y se integra fácilmente con la librería `transformers` mediante un pipeline de `token-classification`. Con 109 millones de parámetros y una longitud de contexto de 512 tokens, es ligero y puede ejecutarse en hardware modesto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT (encoder) con cabecera de clasificación de tokens |
| Parámetros totales | 109.263.364 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | no disponible (pesos en precisión completa, sin cuantizaciones publicadas) |
| Idiomas soportados | Español (es-CL) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de TULIO (`dccuchile/tulio-chilean-spanish-bert`), un BERT entrenado con español chileno, y añade una capa de clasificación de tokens para predecir etiquetas planas (`affect`, `appreciation`, `judgment`, `O`) sin prefijos BIO. La etiqueta de una palabra se asigna a su primer sub-token, y un span se define como una secuencia contigua de la misma clase no-`O`.

El entrenamiento se realizó sobre el corpus chileno de actitud, que contiene 2.546 textos en español chileno (mayoritariamente tuits, además de cartas al editor, columnas de opinión y quejas de consumidores), anotados por tres lingüistas expertas en SFL. La división es 1.782/382/382 para entrenamiento, validación y test. El ajuste fino se hizo con una tasa de aprendizaje de 3e-5, 8 épocas máximas, batch efectivo de 16, 500 pasos de warm-up, decaimiento de peso 0.01 y parada temprana con paciencia 2. Se usó `max_length=512` y pre-tokenización de palabras (`is_split_into_words=True`). El entrenamiento se realizó en precisión completa (fp32), sin fp16 ni bf16.

## Capacidades

- Clasificación de tramos de actitud (Affect, Judgment, Appreciation) en español chileno, con etiquetas planas y agrupación de spans.
- Detección de lenguaje evaluativo en textos de dominio político y social.
- Funciona con el pipeline `token-classification` de `transformers`, con estrategia de agregación `simple` para obtener spans.
- Entrenado para texto de hasta 512 tokens, adecuado para tuits, párrafos y documentos cortos.
- Capacidad multilingüe limitada: está especializado en español de Chile, aunque puede funcionar en otras variantes del español con menor precisión.
- No soporta generación de texto, tool calling, ni razonamiento multi-paso; es un modelo de análisis de lenguaje, no de producción de texto.

## Casos de uso

- **Análisis de discurso político**: identificar fragmentos de texto que expresan juicios o valoraciones en discursos, tuits y entrevistas de políticos chilenos, para estudiar polarización y estrategias retóricas.
- **Investigación lingüística en SFL**: etiquetar corpus para estudios de la teoría de la valoración, permitiendo análisis cuantitativos de patrones de actitud en español chileno.
- **Monitorización de opiniones en redes sociales**: detectar si los usuarios expresan afecto, juicio o apreciación sobre productos, marcas o eventos, útil para análisis de sentimiento fino en español chileno.
- **Análisis de quejas de consumidores**: identificar si una queja se centra en la valoración del servicio (apreciación) o en el comportamiento del personal (juicio), para clasificar y priorizar reclamaciones.
- **Estudios de comunicación corporativa**: analizar cómo las empresas expresan actitudes en comunicados o informes, ayudando a evaluar su tono y estilo.
- **Investigación sobre incivismo y discurso de odio**: dado el contenido del corpus (insultos y amenazas), puede servir para estudiar cómo se expresa la agresión verbal en español chileno, siempre con fines académicos y bajo supervisión.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el test del corpus chileno de actitud (split de 382 textos). Las métricas son a nivel de span estricto, es decir, un span solo cuenta si coincide tanto la clase como ambos límites con el span dorado.

| Métrica | Valor |
|---|---|
| Micro F1 (span-level) | 0.4889 |
| Micro precisión | 0.4567 |
| Micro recall | 0.5260 |

Resultados por clase (del test):

| Clase | Precisión | Recall | F1 | Spans dorados |
|-------|-----------|--------|-----|---------------|
| affect | 0.403 | 0.362 | 0.382 | 80 |
| appreciation | 0.379 | 0.483 | 0.425 | 375 |
| judgment | 0.530 | 0.584 | 0.555 | 507 |

El autor también reporta que en tres reentrenamientos con semillas distintas (1, 2, 3) el F1 medio fue 0.497 ± 0.011, y que el acuerdo entre expertos humanos en esta tarea es de 0.719. El modelo no supera ese acuerdo, por lo que la tarea no está resuelta.

## Requisitos de hardware

- **VRAM estimada**: para un modelo BERT de 109M parámetros, la inferencia requiere aproximadamente 400-500 MB de VRAM en FP32. Con cuantización (no publicada) podría reducirse, pero no hay archivos GGUF ni cuantizados disponibles.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente (ej. GTX 1650, RTX 2050, incluso CPU). Una GPU de gama media como RTX 3060 o superior es más que suficiente para inferencia rápida.
- **En consumer GPU**: sí, cabe en cualquier GPU de consumo moderna, incluso en CPU con baja latencia.
- **Opciones de despliegue**: se puede usar con `transformers` (pipeline) directamente, con `torch` y `tokenizers`. No se ha publicado integración con vLLM, TGI ni Ollama, aunque podría adaptarse.
- **Latencia y throughput**: para un texto de 512 tokens, la inferencia típica en una RTX 3060 sería de unos 10-20 ms; en CPU (8 núcleos) alrededor de 100-300 ms. No hay datos oficiales de throughput, pero al ser un BERT pequeño es muy rápido.

## Comparativa con modelos similares

No hay modelos equivalentes publicados que etiqueten tipos de actitud (Affect, Judgment, Appreciation) en español chileno. El autor tiene otro modelo `jorgeortizfuentes/spanish-attitude` basado en `dccuchile/bert-base-spanish-wwm-cased`, pero no se publican métricas comparables. A continuación se muestra una comparación con el modelo base TULIO y con un modelo BERT general para contexto:

| Modelo | Arquitectura | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|--------|-------------|-------------|----------|-------|----------|----------------|
| `chilean-spanish-attitude-types-bert-tulio` (este) | BERT | 109M | 512 | Token classification (actitud) | CC-BY-4.0 | Abierto |
| `dccuchile/tulio-chilean-spanish-bert` (base) | BERT | 109M | 512 | Modelo de lenguaje general | CC-BY-4.0 | Abierto |
| `jorgeortizfuentes/spanish-attitude` (modelo del autor) | BERT | ~110M | 512 | Token classification (actitud en español general) | CC-BY-4.0 | Abierto |

No hay datos de benchmarks de `spanish-attitude` para comparar directamente, y no se han encontrado otros modelos de la misma tarea en la literatura.

## Limitaciones y advertencias

- **Sesgos y contenido sensible**: el corpus de entrenamiento fue recolectado en torno a episodios de conflicto político en Chile e incluye insultos, discursos de odio y amenazas. El modelo reproducirá la distribución de ese lenguaje, por lo que puede generar etiquetas que reflejen sesgos sociopolíticos.
- **Alucinación**: no es un modelo generativo, pero puede clasificar erróneamente tramos de texto como actitud cuando no lo son, o fallar en identificar la clase correcta.
- **Rendimiento limitado**: el F1 de 0.489 está por debajo del acuerdo experto (0.719), por lo que no es fiable para uso productivo sin revisión humana.
- **Contexto limitado**: solo 512 tokens, no apto para documentos largos.
- **Idioma**: solo español de Chile; puede degradarse en otros dialectos o registros.
- **Licencia**: CC-BY-4.0 permite uso comercial y modificación con atribución, pero el corpus de entrenamiento es gated y de acceso restringido para investigación no comercial. Los pesos del modelo no redistribuyen los textos, pero el usuario debe tener en cuenta la licencia del corpus si quiere reproducir el entrenamiento.
- **No apto para moderación**: no debe usarse para moderar usuarios, perfilado de individuos, toma de decisiones sobre personas ni como clasificador de sentimiento general.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/jorgeortizfuentes/chilean-spanish-attitude-types-bert-tulio)
- [Dataset del corpus chileno de actitud (gated)](https://huggingface.co/datasets/jorgeortizfuentes/chilean-spanish-attitude-corpus)
- [Modelo base TULIO](https://huggingface.co/dccuchile/tulio-chilean-spanish-bert)
- [Otro modelo del autor: spanish-attitude](https://huggingface.co/jorgeortizfuentes/spanish-attitude)
- [Proyectos del autor](https://ortizfuentes.com/projects)
- [Perfil de GitHub del autor](https://github.com/jorgeortizfuentes/)
