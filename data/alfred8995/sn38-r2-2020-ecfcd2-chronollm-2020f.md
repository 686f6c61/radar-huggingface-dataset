# alfred8995/sn38-r2-2020-ecfcd2-chronollm-2020f

## Resumen

`alfred8995/sn38-r2-2020-ecfcd2-chronollm-2020f` es un modelo de lenguaje de aproximadamente 1.858 millones de parámetros (1,86 B) publicado en HuggingFace con pesos en safetensors y etiqueta de arquitectura propietaria "ChronoGPT". No dispone de model card, no tiene descargas ni interacciones registradas y su acceso está restringido (gated): es necesario aceptar condiciones en la plataforma para descargar los pesos. La nomenclatura del repositorio lo vincula a la familia ChronoLLM del subnet 38 de Bittensor, un proyecto de "modelos temporalmente consistentes" en el que cada modelo solo conoce eventos ocurridos hasta su año de corte (vintage), de modo que no se filtra conocimiento del futuro en el análisis. El sufijo `2020f` apunta a un corte temporal en 2020; el prefijo `sn38-r2` sugiere una entrega de minero correspondiente a una ronda de evaluación del subnet, aunque esto no está confirmado en la información disponible.

El interés práctico del modelo no reside en su tamaño ni en un rendimiento bruto puntero, sino en la restricción temporal deliberada: se trata de un artefacto pensado para simulaciones contrafactuales, backtesting y análisis histórico en los que un LLM convencional arruinaría el experimento por conocer acontecimientos posteriores a la fecha de estudio. Es, por tanto, una pieza de infraestructura para investigación más que un asistente generalista.

Ahora bien, la información pública es extremadamente escasa: no hay resultados de benchmarks, no se declaran idiomas soportados, no se especifica la longitud de contexto y la licencia figura como "other" sin texto asociado. Cualquier evaluación de producción debe partir de una inspección directa del repositorio y de los ficheros de configuración una vez aceptado el acceso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ChronoGPT (etiqueta del repositorio); familia transformer no confirmada, no disponible en detalle |
| Parametros totales | 1.858.535.658 (≈1,86 B) |
| Parametros activos | No aplica (no hay evidencia de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene pesos en F32 (≈7,4 GB) |
| Idiomas soportados | no disponible |
| Licencia | other (acceso restringido, requiere aceptar condiciones; texto de licencia no disponible) |
| Formato de pesos | safetensors (precisión F32) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna más allá de la etiqueta "ChronoGPT" que aparece en los metadatos del repositorio. Por el recuento de parámetros y el tamaño del repo (7,4 GB para 1,86 B de parámetros, lo que corresponde a 4 bytes por parámetro), los pesos están almacenados en FP32, un formato inusual para publicación pero coherente con un artefacto de competición o de investigación que no ha pasado por un pipeline de publicación estándar. Se desconoce si emplea atención completa, atención lineal, mezcla de expertos o alguna variante híbrida, así como el tokenizador, la longitud máxima de secuencia y la composición del vocabulario.

Tampoco hay datos sobre el corpus de entrenamiento, el número de tokens procesados ni sobre si hubo etapas de ajuste fino supervisado, RLHF o DPO. La única información contextual proviene del proyecto ChronoLLM, que describe modelos "con corte temporal": cada checkpoint se entrena o ajusta con conocimiento limitado a su año de referencia, presumiblemente mediante filtrado del corpus por fecha y ajuste sobre datos anteriores al corte. No se especifica la técnica exacta (filtrado por metadatos de publicación, corte por fecha de crawling, enmascaramiento de entidades posteriores) ni cómo se mitiga la filtración indirecta de conocimiento futuro a través de inferencias.

## Capacidades

- Generación de texto conversacional multi-turno, según la descripción del proyecto ChronoLLM en PyPI, que ofrece una interfaz de chat por año de corte.
- Consistencia temporal: el modelo está diseñado para responder únicamente con conocimiento disponible hasta su año de referencia (2020 en esta variante), evitando la fuga de eventos posteriores.
- Razonamiento sobre documentación histórica: al no conocer el futuro, resulta adecuado para reconstruir el estado del conocimiento en una fecha dada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles; no hay evidencia de torre visual ni de procesamiento de audio.
- Capacidades multilingües: no disponibles; no se declara ningún conjunto de idiomas.
- Modo "thinking" o razonamiento extendido: no disponible.
- Capacidad de generación de código y matemáticas: no documentada ni evaluada públicamente.

## Casos de uso

- Backtesting de estrategias de inversión sin sesgo de anticipación: el modelo solo maneja información anterior a 2020, por lo que puede generar hipótesis, resúmenes de tesis de inversión o informes de análisis tal y como se habrían redactado en esa fecha, sin contaminar el experimento con el conocimiento de la crisis posterior. Es el caso de uso central de la familia ChronoLLM.
- Investigación en historia económica y financiera: reconstrucción de expectativas de mercado, narrativas de prensa económica y consensos de analistas vigentes en un año concreto, para comparar lo que se esperaba con lo que ocurrió después.
- Análisis contrafactual y estudios de ciencia política: simular cómo se habría interpretado un acontecimiento con la información disponible en el momento, evitando que el modelo "sepa" el desenlace.
- Evaluación de modelos y estudios de fuga temporal (temporal leakage): servir como referencia de un modelo sin conocimiento posterior a 2020 para medir cuánto del rendimiento de un LLM moderno en tareas históricas proviene de información futura.
- Docencia y divulgación: construir ejercicios y simulaciones de debate en los que el alumnado debe razonar con el estado del arte de 2020, sin acceso a desarrollos posteriores.
- Generación de documentación y material editorial de ambientación histórica: redacción de notas, guiones o artículos con vocabulario técnico y referencias plausibles para una fecha anterior a 2020.
- Archivística y periodismo documental: clasificación y resumen de fondos documentales de ese período con un modelo cuyo conocimiento no excede el marco temporal del fondo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye model card, no hay evaluaciones en el leaderboard de HuggingFace y no se han encontrado cifras de MMLU, HumanEval, GSM8K ni de ninguna otra prueba en la búsqueda web realizada. Cualquier cifra que se atribuya a este checkpoint debe considerarse no verificada hasta que se ejecute una evaluación propia.

## Requisitos de hardware

- VRAM para inferencia en F32 (formato publicado): aproximadamente 7,5 GB solo para pesos, más caché KV y activaciones; en la práctica, 10-12 GB para secuencias moderadas.
- VRAM en FP16/BF16: alrededor de 3,7 GB de pesos; 6-8 GB con caché KV para contextos de varios miles de tokens.
- VRAM en cuantización de 8 bits: aproximadamente 1,9 GB de pesos; en 4 bits, alrededor de 1,0-1,2 GB.
- GPU consumer: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090, incluso en F32. En GPUs de 8 GB es recomendable FP16 o cuantización de 8 bits.
- GPU de datacenter: A100 40/80 GB, H100 y L40S están sobredimensionadas para 1,86 B de parámetros; permiten lotes grandes y contextos largos, pero no son necesarias para inferencia individual.
- Despliegue: vLLM o TGI si el checkpoint resulta ser un transformer estándar con config compatible; llama.cpp u Ollama si se genera un GGUF, lo que requiere que la arquitectura "ChronoGPT" esté soportada por la herramienta de conversión. Al no haber confirmación de la arquitectura, la conversión a GGUF es una incógnita y podría requerir código personalizado.
- Latencia y throughput: no disponibles. Como referencia teórica de orden de magnitud para 1,86 B en FP16 sobre una RTX 4090, cabría esperar decenas de miles de tokens por segundo en prefill y varios cientos en decodificación con lotes pequeños, pero no hay mediciones publicadas para este checkpoint.
- Acceso: al ser un repositorio gated, la descarga requiere autenticación con token de HuggingFace y aceptación previa de las condiciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| sn38-r2-2020-ecfcd2-chronollm-2020f | ≈1,86 B | no disponible | other (gated) | Requiere aceptar condiciones | Especializado en corte temporal 2020; sin benchmarks publicados |
| Qwen2.5-1.5B | 1,54 B | 32.768 tokens | Apache 2.0 | Abierta | Referencia habitual en el segmento sub-2B; soporte multilingüe amplio y tool calling |
| SmolLM2-1.7B | 1,71 B | 8.192 tokens | Apache 2.0 | Abierta | Entrenado con un volumen alto de tokens para su tamaño; orientado a dispositivos |
| Gemma 2 2B | 2,6 B | 8.192 tokens | Gemma (uso comercial con condiciones) | Abierta con aceptación | Variante pequeña de la familia Gemma 2 |
| Llama 3.2 1B | 1,24 B | 128.000 tokens | Llama 3.2 Community License | Abierta con aceptación | Contexto muy largo para su tamaño |

La comparación relevante no es de rendimiento bruto, dado que no existen métricas del modelo ChronoLLM, sino de propósito: los modelos citados son asistentes generalistas actualizados, mientras que este checkpoint está deliberadamente anclado a 2020. En tareas de razonamiento general es razonable esperar que los modelos generalistas de tamaño similar lo superen, por la sencilla razón de que el corte temporal elimina información; su ventaja aparece únicamente en escenarios donde el conocimiento posterior es un contaminante.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan datos de entrenamiento, tokenizador, contexto máximo ni procedencia del corpus, lo que impide auditar sesgos o licencias de los datos subyacentes.
- Licencia "other" sin texto público accesible: no se puede confirmar si se permite uso comercial, redistribución o modificación. Para producción es imprescindible contactar con el autor o revisar los términos tras aceptar el acceso.
- Riesgo de alucinación no evaluado: no hay benchmarks de veracidad ni de seguimiento de instrucciones; se desconoce su comportamiento en tareas factuales.
- La consistencia temporal no está garantizada: el filtrado por fecha no elimina necesariamente el conocimiento futuro inferido (por ejemplo, a partir de correlaciones o de textos con fechas de publicación ambiguas). Cualquier afirmación de "no conoce el futuro" debe validarse empíricamente.
- Idiomas no declarados: se desconoce el soporte real de castellano y de otras lenguas; un modelo entrenado mayoritariamente en inglés puede degradarse notablemente fuera de ese idioma.
- Longitud de contexto desconocida: limita el diseño de aplicaciones con documentos largos y obliga a probar empíricamente el punto de corte.
- Artefacto de competición: la nomenclatura del repositorio apunta a una entrega de minero de un subnet de Bittensor, sin proceso de revisión editorial; la calidad puede ser muy variable y no hay garantía de mantenimiento.
- Pesos en F32: el repositorio ocupa 7,4 GB, lo que encarece el almacenamiento y la transferencia frente a una publicación en BF16; además no se ofrecen variantes cuantizadas oficiales.
- Acceso restringido: dificulta la reproducibilidad de la investigación y la integración en pipelines automatizados.
- Posible confusión de nombre: existe un paper titulado "ChronoLLM: Customizing Language Models for Physics-Based Simulation" (arXiv 2508.13975) sobre simulación física con PyChrono, aparentemente ajeno a este proyecto; conviene no atribuir a este checkpoint los resultados de dicho trabajo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alfred8995/sn38-r2-2020-ecfcd2-chronollm-2020f
- Modelo de referencia de la familia: https://huggingface.co/ecfcd2/chronollm-2020f
- Perfil del autor original: https://huggingface.co/ecfcd2
- Paquete de cliente en PyPI (ChronoLLM): https://pypi.org/project/chronollm/
- Ficha del subnet 38 (ChronoLLM) en TAO Alpha: https://www.jasontensor.com/subnet/38
- Paper homónimo sobre simulación física (posiblemente no relacionado): https://arxiv.org/html/2508.13975v1
