# Complexhibit-Project/complexhibit-nivel1

## Resumen

Complexhibit-nivel1 es un modelo de etiquetado de secuencias (token classification) desarrollado por el proyecto Complexhibit para localizar fichas de obra y referencias a exposiciones en catálogos de exposiciones de arte en inglés y español. Se trata de un ajuste fino de XLM-RoBERTa large (558.845.957 parámetros) con etiquetado BIO, que delimita los bloques de texto relevantes para la descripción catalográfica de una exposición. Es la primera etapa de un sistema por niveles: el nivel 2 reconoce las entidades dentro de esos bloques y el nivel 3 precisa su papel.

El modelo resuelve un problema concreto de humanidades digitales: los catálogos de exposición mezclan ensayos, biografías, créditos y fichas de obra, y aislar automáticamente estas últimas es un paso previo imprescindible para extraer metadatos estructurados (título, autor, fecha, técnica, dimensiones, procedencia) a escala. Frente a la versión 1.0, la versión 1.1 corrige una fuga de información en la fragmentación del texto: ahora los fragmentos de ~200 palabras se delimitan sin depender de la anotación manual, tanto en entrenamiento como en evaluación y uso real, de modo que las cifras publicadas reflejan condiciones reales de despliegue.

La relevancia actual del modelo es doble: por un lado, publica un gold standard de 100 catálogos anotados por especialistas y un grafo RDF resultante en Zenodo; por otro, documenta con honestidad sus limitaciones (especialmente el bajo rendimiento en la etiqueta `EXHIB`), lo que lo convierte en una pieza útil y transparente para pipelines de procesamiento documental en patrimonio artístico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa large), ajustado para token classification con etiquetado BIO |
| Parametros totales | 558.845.957 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el autor indica que el texto se divide en fragmentos de ~200 palabras porque el modelo no puede leer un catálogo entero de una vez) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp16) |
| Idiomas soportados | en, es |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de XLM-RoBERTa large (Conneau et al., 2020), un encoder transformer multilingüe, y se ajusta para etiquetado de secuencias con esquema BIO. Las etiquetas son `ITEM` (bloque de ficha de obra: título, autor, fecha, técnica, dimensiones, procedencia, etc.) y `EXHIB` (referencia a una exposición). El ajuste se realizó durante 6 épocas con una tasa de aprendizaje de 2·10⁻⁵ y lotes de 8 fragmentos, conservando el checkpoint con mejor resultado en el conjunto de validación. Los pesos se guardan en media precisión (fp16).

El entrenamiento usa el gold standard del proyecto Complexhibit: 100 catálogos de exposiciones de arte en inglés y español, anotados manualmente por especialistas del dominio con la herramienta GATE y conforme al manual de etiquetado del proyecto. El reparto es de 80 catálogos para entrenamiento, 10 para validación y 10 para prueba, dividido por catálogos completos para evitar contaminación. La innovación metodológica destacable de la versión 1.1 es la fragmentación ciega a la anotación: los fragmentos de ~200 palabras se delimitan igual en entrenamiento, evaluación y uso, eliminando el sesgo optimista de la versión 1.0 (que obtenía F1 de 0,78 con fragmentación asistida por la anotación). No se menciona uso de RLHF ni DPO, algo esperable en un modelo de etiquetado.

## Capacidades

- Etiquetado de secuencias token a token para delimitar bloques de ficha de obra (`ITEM`) y referencias a exposiciones (`EXHIB`) en catálogos de arte.
- Procesamiento bilingüe inglés-español sobre textos catalográficos de arte contemporáneo.
- Localización de bloques con alta exhaustividad en fichas de obra: 0,88 de exhaustividad por solapamiento sobre el conjunto de prueba.
- Integración en pipelines por niveles: la salida de este modelo alimenta los modelos de nivel 2 (reconocimiento de entidades) y nivel 3 (precisión de su papel).
- No soporta tool calling, function calling, razonamiento multi-paso ni modo thinking: es un modelo discriminativo de etiquetado, no generativo.
- No dispone de capacidades de visión, audio ni generación de texto libre.

## Casos de uso

- Digitalización de catálogos de exposiciones en archivos y museos: el modelo delimita automáticamente las fichas de obra dentro del texto extraído de PDF, lo que permite separar el aparato catalográfico de los ensayos y créditos antes de extraer metadatos.
- Construcción de bases de datos de obras expuestas: al aislar cada bloque `ITEM`, un pipeline posterior puede parsear título, autor, fecha y técnica, y poblar un catálogo estructurado o un grafo RDF como el publicado por el proyecto.
- Enriquecimiento de registros de patrimonio artístico: la detección de bloques de ficha permite cruzar obras con referencias a exposiciones y generar historiales de exhibición a partir de fuentes impresas.
- Procesamiento por lotes de fondos documentales bilingües: al cubrir inglés y español, un mismo despliegue sirve para catálogos de instituciones de ambos idiomas sin cambiar de modelo.
- Preprocesado para pipelines de extracción de información: la salida BIO se consume directamente como entrada del nivel 2 del sistema Complexhibit, reduciendo el ruido que llega a los modelos de reconocimiento de entidades.
- Investigación en humanidades digitales: el modelo y sus anotaciones permiten reproducir experimentos de etiquetado de secuencias sobre corpus catalográficos y comparar estrategias de fragmentación (como la corrección metodológica entre v1.0 y v1.1).
- Filtrado y segmentación de corpus para revisión humana: dado que marca más bloques de los que hay, puede usarse como primera pasada que un documentalista valida, priorizando las fichas de obra sobre el resto del texto.

## Benchmarks y rendimiento

Evaluación sobre el texto completo de los 10 catálogos de prueba no vistos durante el entrenamiento, con fragmentación ciega a la anotación (condiciones reales de uso). Coincidencia exacta exige que coincidan principio y final del bloque; coincidencia por solapamiento exige al menos el 50 % de extensión compartida.

| Etiqueta | Exacta (P / R / F1) | Solapamiento (P / R / F1) | Bloques anotados |
|---|---|---|---|
| ITEM | 0,52 / 0,75 / 0,61 | 0,60 / 0,88 / 0,71 | 254 |
| EXHIB | 0,07 / 0,18 / 0,10 | 0,21 / 0,54 / 0,30 | 28 |
| Total | 0,44 / 0,70 / 0,54 | 0,54 / 0,84 / 0,66 | 282 |

Comparación con la versión anterior bajo la misma evaluación: la v1.0 obtenía F1 de 0,52 (exacta) y 0,64 (solapamiento) en fichas de obra, frente a 0,61 y 0,71 de la v1.1. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, por tratarse de una tarea de etiquetado específica de dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB en fp16 para los 558,8 M de parámetros, más overhead de activaciones y tokenizador; en la práctica, menos de 2 GB en fp16 y alrededor de 1 GB en cuantización de 8 bits.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente (RTX 3060, RTX 4060, T4). Para procesamiento por lotes de catálogos completos, una A100 o H100 acelera el throughput, aunque no son necesarias.
- Cabe holgadamente en GPU de consumo: sí, en RTX 3060/4060/4090 y en GPUs integradas con suficiente memoria compartida para lotes pequeños.
- Opciones de despliegue: transformers (librería nativa), pipeline de token-classification; compatible con endpoints (tag `endpoints_compatible`). No se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada. El coste por catálogo depende del número de fragmentos de ~200 palabras en que se divida el texto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Complexhibit-nivel1 (v1.1) | 558,8 M | no disponible (fragmentos de ~200 palabras) | Token classification (ITEM, EXHIB) en catálogos de arte | MIT | Hugging Face, pesos safetensors |
| XLM-RoBERTa large (base) | 558,8 M | 512 tokens | Modelo multilingüe base, sin ajuste a la tarea | MIT | Hugging Face |
| Complexhibit-nivel1 (v1.0) | 558,8 M | no disponible | Misma tarea, fragmentación asistida por anotación | MIT | No disponible como artefacto separado en la información proporcionada |

La comparación con modelos de la misma categoría fuera del proyecto no está disponible en la información proporcionada. El competidor natural es el propio XLM-RoBERTa large sin ajustar, que no realiza la tarea; y la v1.0 del mismo modelo, cuyas cifras quedan por debajo de la v1.1 bajo evaluación homogénea.

## Limitaciones y advertencias

- La etiqueta `EXHIB` se reconoce mal: F1 de 0,10 en coincidencia exacta y 0,30 por solapamiento, debido a que solo hay 28 bloques anotados en prueba (376 en todo el corpus) y a la gran variabilidad formal de las referencias a exposiciones.
- El modelo marca más bloques de los que existen: la precisión es de 0,44 en exacta y 0,54 en solapamiento, por debajo de la exhaustividad, lo que genera falsos positivos que requieren revisión o filtrado posterior.
- Entrenado con catálogos de arte contemporáneo en inglés y español; su rendimiento con otros períodos, idiomas u otro tipo de textos (ensayos, crítica) no se ha evaluado de forma sistemática.
- La salida sigue los criterios del manual de etiquetado del proyecto Complexhibit y debe interpretarse conforme a él; no es un etiquetado universal.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos de delimitación: bloques mal acotados o espurios.
- Los textos íntegros de los catálogos no se distribuyen por derechos de autor; solo se publican las anotaciones registradas por posición, el inventario, el reparto y el grafo RDF.
- Licencia MIT, que permite uso comercial, pero el modelo se distribuye sin garantías y con un rendimiento documentado modesto en la tarea principal (F1 total de 0,54 exacta, 0,66 por solapamiento).
- La fragmentación en ventanas de ~200 palabras puede partir fichas de obra en los límites de fragmento, lo que afecta a la coincidencia exacta de los bloques.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Complexhibit-Project/complexhibit-nivel1
- Anotaciones, inventario, reparto y grafo RDF en Zenodo: https://doi.org/10.5281/zenodo.24199594
- Modelo base XLM-RoBERTa large: https://huggingface.co/FacebookAI/xlm-roberta-large
- Paper de XLM-RoBERTa (Conneau et al., 2020): no disponible en la información proporcionada
- Repositorio del proyecto Complexhibit: no disponible en la información proporcionada
- Demos o espacios asociados: no disponible en la información proporcionada
