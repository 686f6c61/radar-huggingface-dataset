# shinodashx/CADRec

## Resumen

CADRec es un modelo presentado por el usuario shinodashx (repositorio `shinodashx/CADRec` en HuggingFace) orientado a la reconstrucción recursiva de secuencias CAD. Según el artículo asociado, el objetivo es reconstruir una secuencia CAD completa a partir de geometría, descomponiéndola en partes y generando predicciones espacialmente fundamentadas, con objetivos de entrenamiento sensibles a la geometría. El modelo se inicializa por defecto a partir de un modelo público de la familia Qwen, según se desprende de la configuración de entrenamiento del repositorio de código.

La relevancia del proyecto es acotada y muy específica: se sitúa en la intersección entre modelado paramétrico asistido (CAD), visión 3D y generación de secuencias estructuradas, un nicho donde la mayoría de trabajos previos son enfoques de secuencia o de código. El autor afirma mejoras en fidelidad geométrica y validez de programa frente a esas líneas base, aunque en la información disponible no se aportan cifras.

Conviene señalar desde el principio que la model card publicada en HuggingFace está prácticamente vacía: solo contiene el bloque de licencia Apache 2.0, sin descripción, sin especificaciones y sin ejemplos de uso. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia de validación por parte de la comunidad. Además, el nombre colisiona con CaDRec (SIGIR 2024), un modelo de recomendación contextualizado y no sesgado completamente distinto, lo que genera confusión en búsquedas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, derivada de un modelo público de la familia Qwen (la model card no lo detalla; se infiere de la configuración `common.model.base_model_path` del repositorio) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados) |
| Idiomas soportados | no disponible (la tarea objetivo son secuencias CAD, no lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio no declara safetensors, GGUF ni otros formatos; las etiquetas solo incluyen licencia y región) |

## Arquitectura y entrenamiento

La información pública describe CADRec como un modelo generativo que reconstruye una secuencia CAD de forma recursiva, es decir, produciendo la secuencia paso a paso en lugar de emitirla de una sola vez. El artículo menciona objetivos de entrenamiento sensibles a la geometría ("geometry-aware objectives") que fomentan una descomposición coherente en partes y predicciones ancladas espacialmente. El repositorio de código confirma que el punto de partida por defecto es un modelo Qwen público, con posibilidad de partir de un checkpoint CADRec previamente entrenado mediante `train.paths.model_path`.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste por preferencias. Tampoco se detalla si la arquitectura incorpora innovaciones adicionales (atención lineal, decodificación especulativa, módulos de visión o de nubes de puntos) más allá de la formulación recursiva y de los objetivos geométricos. El título del artículo aparece truncado en la fuente consultada ("...with Localized ..."), por lo que no se puede confirmar el término completo de la contribución.

## Capacidades

- Reconstrucción de secuencias CAD: generación de programas/secuencias paramétricas a partir de geometría de entrada, según el planteamiento del artículo.
- Descomposición en partes: los objetivos geométricos buscan una segmentación coherente de la pieza en componentes.
- Predicciones espacialmente fundamentadas: el modelo se entrena para anclar la salida a la geometría observada, no solo a patrones de secuencia.
- Validez de programa: el artículo reporta mejoras en validez de las secuencias generadas frente a líneas base de secuencia y de código.
- Generación recursiva: la secuencia se construye iterativamente, lo que en principio permite corregir o condicionar pasos intermedios.
- Herencia del modelo base Qwen: al inicializarse desde un modelo Qwen, es plausible cierta capacidad de modelado de lenguaje y código, aunque no se documenta ni se evalúa en la información disponible.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (no evaluadas).
- Modo "thinking", visión o audio: no disponible.

## Casos de uso

- Ingeniería inversa de piezas: a partir de una malla o nube de puntos escaneada, usar CADRec para generar una secuencia paramétrica editable en lugar de una malla estática, lo que permite modificar cotas y parámetros aguas abajo.
- Migración de CAD heredado: convertir geometría almacenada en formatos no paramétricos en secuencias reconstruidas que puedan volver a un modelador con historial de operaciones.
- Generación asistida en herramientas de diseño: integrar el modelo como sugeridor de secuencias parciales (por ejemplo, proponer la siguiente operación de extrusión o corte) dentro de un editor CAD.
- Validación automática de programas CAD: usar la mejora declarada en validez de programa para filtrar secuencias generadas por otros sistemas antes de enviarlas a fabricación.
- Aumento de datos para investigación en CAD: generar pares geometría-secuencia sintéticos para entrenar o evaluar otros modelos de reconstrucción, aprovechando la licencia Apache 2.0.
- Reparación de geometría para fabricación aditiva: reconstruir la secuencia de una pieza con defectos topológicos para regenerar una versión limpia y coherente en partes.
- Digitalización de catálogos técnicos: procesar lotes de piezas y producir representaciones paramétricas homogéneas para un gemelo digital o un sistema de gestión de componentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El artículo asociado afirma cualitativamente que CADRec mejora la fidelidad geométrica y la validez de programa frente a líneas base previas de tipo secuencia y de tipo código, sobre "benchmarks estándar de reconstrucción CAD", pero en el material consultado no se incluyen nombres de conjuntos de evaluación ni valores numéricos (tipo Chamfer Distance, IoU de voxels, tasa de validez de programa, etc.), por lo que no es posible construir una tabla comparativa sin inventar datos.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión, porque no se publica el número de parámetros ni el tamaño del modelo Qwen base. Como referencia condicional: un modelo de ~1,5-3B en FP16 requiere del orden de 3-6 GB solo para pesos; uno de ~7B, unos 14 GB; uno de ~14B, unos 28 GB; uno de ~32B, unos 64 GB. Estas cifras son estimaciones genéricas por tamaño, no medidas sobre CADRec.
- GPU recomendadas: no disponible. Dependerá del tamaño del checkpoint; para tamaños pequeños bastaría una RTX 4090 (24 GB), mientras que variantes grandes requerirían A100 40/80 GB o H100.
- ¿Cabe en GPU de consumo? No verificable sin conocer el tamaño. Si el modelo base es de la gama pequeña de Qwen, sí cabría en una RTX 4090 e incluso en GPUs de 12-16 GB con cuantización; si es de gama grande, no.
- Opciones de despliegue: no disponible. El repositorio de código está orientado a entrenamiento (configuración tipo Trainer con `train.paths.model_path`), no a servir el modelo. No se publican artefactos GGUF, por lo que llama.cpp u Ollama no están soportados de forma nativa salvo conversión manual; vLLM o TGI serían viables solo si el checkpoint es un transformer decoder-only estándar y se publican los pesos.
- Latencia y throughput: no disponible. La generación recursiva implica múltiples pasos de decodificación por pieza, lo que previsiblemente aumenta la latencia frente a una generación en un solo paso, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CADRec (shinodashx) | no disponible | no disponible | no disponible (mejora cualitativa declarada frente a líneas base de secuencia y código) | Apache 2.0 | Pesos en HuggingFace sin documentar; código en GitHub |
| Líneas base de secuencia para reconstrucción CAD | no disponible | no disponible | no disponible | no disponible | no disponibles en la información proporcionada |
| Líneas base de código para reconstrucción CAD | no disponible | no disponible | no disponible | no disponible | no disponibles en la información proporcionada |
| CaDRec (SIGIR 2024) | no disponible | no disponible | no disponible | no disponible | arXiv 2404.06895 — modelo de recomendación, no relacionado |

El artículo menciona comparaciones contra métodos previos de secuencia y de código, pero el material consultado no identifica sus nombres ni sus cifras, por lo que la comparativa cuantitativa no está disponible. La fila de CaDRec se incluye únicamente para advertir de la colisión de nombres: se trata de un modelo de recomendación contextualizado y desesgado, sin relación técnica con este repositorio.

## Limitaciones y advertencias

- Model card vacía: no hay descripción, instrucciones de uso, ejemplos ni limitaciones declaradas por el autor; toda la información técnica procede del repositorio de código y del artículo.
- Ausencia de validación externa: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de que los pesos publicados funcionen como se describe.
- Pesos no verificables: el repositorio no declara formato de pesos ni tamaño del checkpoint, lo que impide estimar requisitos de hardware y comprobar la integridad de la publicación.
- Colisión de nombres: "CADRec" se confunde con CaDRec (SIGIR 2024), un recomendador; las búsquedas bibliográficas pueden devolver resultados del otro modelo.
- Inconsistencia de metadatos: las fechas de creación y actualización indicadas (2026-10-27) son posteriores a la fecha habitual de consulta, lo que sugiere un error de metadata o una publicación programada; conviene tratarlas con cautela.
- Riesgo de secuencias inválidas: como todo modelo generativo de programas, puede producir secuencias CAD sintácticamente plausibles pero geométricamente inválidas o no fabricables; se requiere validación geométrica y topológica en producción.
- Alucinación: no hay evaluación publicada de tasas de error ni de robustez frente a entradas ruidosas (mallas incompletas, nubes de puntos dispersas).
- Contexto e idiomas sin especificar: se desconoce la longitud de contexto efectiva y el comportamiento con entradas fuera de distribución.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero se distribuye "tal cual", sin garantías. Debe verificarse por separado la licencia del modelo Qwen base utilizado, ya que las condiciones de los modelos derivados dependen de ella.
- Sin soporte declarado: no hay issues resueltos, documentación de API, ni artefactos de despliegue; el soporte depende exclusivamente del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shinodashx/CADRec
- Repositorio de código (implementación oficial): https://github.com/shinodashx/CADRec
- Artículo (PDF): https://shinodashx.github.io/CADRec/files/CADRec.pdf
- Perfil del autor en GitHub: https://github.com/shinodashx
- CaDRec, modelo de recomendación sin relación (para desambiguar): https://arxiv.org/abs/2404.06895
- Vídeo divulgativo sobre CaDRec (sin relación): https://www.classcentral.com/course/youtube-sigir-2024-m1-7-fp-cadrec-contextualized-and-debiased-recommender-model-350815
