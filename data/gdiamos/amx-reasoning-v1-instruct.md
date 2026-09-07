# gdiamos/amx-reasoning-v1-instruct

## Resumen

El modelo `amx-reasoning-v1-instruct` es un modelo de lenguaje causal de tamaño extremadamente reducido, desarrollado por `gdiamos`, entrenado end-to-end en un único núcleo de CPU Intel Emerald Rapids con instrucciones AMX y precisión bf16. Su objetivo no es competir con modelos grandes, sino explorar qué capacidades de razonamiento básico emergen en arquitecturas diseñadas a partir de un roofline de un solo núcleo. Con 7,49 millones de parámetros almacenados y 3,32 millones activos por token, es capaz de responder preguntas de extracción de información sobre un pasaje dado, alcanzando un 18,2% de exact match y un 23,2% de F1 en conjuntos de QA extraídos. Su relevancia radica en que demuestra que ciertas habilidades de recuperación y comparación aparecen con presupuestos de entrenamiento mucho menores de lo esperado, y en que el modelo está acompañado de un paper que documenta el diseño y las evaluaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas intercaladas de sliding-window attention y log-decay linear attention |
| Parametros totales | 7.492.448 |
| Parametros activos | 3.315.552 |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en bf16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer causal con 6 capas, `d_model` de 256 y MLP de 640 unidades. Las capas se organizan como `lin, swa, swa, lin, swa, lin`. La atención por ventana deslizante usa una ventana de 256 tokens, y la attention linear con decaimiento logarítmico usa `d_state` de 32. El readout está atado al embedding. La información del autor indica que la atención se confina a los límites de documento dentro de una ventana de entrenamiento que empaqueta varios documentos, para evitar que la sliding-window attention alcance vecinos y que la linear attention transporte estado a través de la ventana completa.

El entrenamiento se realizó en un solo core AMX, con un diseño que minimiza el número de GEMMs grandes, ya que se menciona que un core sostiene aproximadamente 2.231 GF/s de bf16 en estas dimensiones, pero paga un coste fijo de 1,4–1,5 microsegundos por despacho de GEMM. Se usaron 5,4 mil millones de tokens en total, distribuidos en tres etapas: pretraining (4.910 millones), instrucción (250 millones) y afinamiento para QA (250 millones). La etapa de instrucción introdujo la capacidad de detenerse en EOT, y la etapa de QA mejoró la respuesta basada en pasajes y la abstención. El autor indica que aplicar la etapa de QA sobre el modelo afinado en instrucción, en lugar de directamente sobre el base, aportó +1,3 EM, +2,2 F1 y 8,7 puntos menos de sobre-abstención.

## Capacidades

- Respuestas de una o dos palabras a preguntas sobre pasajes dados, con abstención en algunos casos.
- Recuperación y comparación de información en texto, pero sin capacidad de cálculo aritmético según el autor.
- Soporte de una máscara de vocabulario que excluye tokens prohibidos para mejorar la precisión; sin ella, el modelo responde incorrectamente a una quinta parte de las preguntas DROP.
- Decodificación greedy y parada en EOT; el modelo no está diseñado para muestreo en este checkpoint.
- No soporta tool calling, function calling, visión ni audio.
- No se especifican idiomas soportados en la información disponible.
- El modelo requiere el formato de prompt y el código fuente incluidos en el repositorio, ya que no es compatible con la API estándar de `transformers`.

## Casos de uso

- Extracción de respuestas en atención al cliente: el modelo puede responder preguntas concretas sobre una política o documento, dada una consulta breve y el pasaje, en entornos sin GPU. Es adecuado porque su tamaño y su capacidad de detención en EOT permiten respuestas cortas y controladas en CPU.
- Filtrado de documentos en pipelines de procesado: dado un pasaje y una pregunta, el modelo identifica si la información está presente y puede servir como pre-filtro para modelos más grandes, reduciendo el coste de inferencia. Su alta tasa de abstención incorrecta exige una validación posterior.
- Comprensión lectora en dispositivos embebidos: al no requerir GPU y consumir muy poca memoria, puede ejecutarse en dispositivos con CPU de bajo consumo para cuestionarios simples o extracción de entidades de un pasaje.
- Verificación de hechos en textos cortos: el modelo extrae fragmentos de un pasaje que responden a afirmaciones concretas, lo que permite validar datos en entornos de recursos limitados, siempre que se proporcione el pasaje relevante y se toleren errores.
- Asistente de lectura para documentos legales o técnicos: puede localizar respuestas puntuales (nombres, fechas, cifras) en contratos o manuales, siempre que la información esté contenida en un único pasaje corto y las respuestas sean de una o dos palabras.
- Prototipado rápido de modelos pequeños para investigación: gracias a su bajo coste de entrenamiento en una CPU, se puede usar como banco de pruebas para estudiar el efecto de diferentes arquitecturas o presupuestos de tokens en comportamientos emergentes, como se documenta en el paper adjunto.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre extracción de QA, decodificación greedy y con la máscara de vocabulario aplicada. EM y F1 se calculan solo sobre filas con respuesta. La sobre-abstención es negarse a responder cuando la respuesta estaba presente; la abstención incorrecta es responder cuando no la estaba.

| Fuente | n | EM | F1 | Sobre-abstención | Abstención incorrecta |
|---|---:|---:|---:|---:|---:|
| DROP | 200 | 25,0% | 27,3% | 0,0% | -- |
| SQuAD v2 | 200 | 18,1% | 24,2% | 31,2% | 62,9% |
| Dolly | 79 | 1,3% | 11,1% | 30,4% | -- |
| Total | 479 | 18,2% | 23,2% | 16,1% | 62,9% |

No se han publicado comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no requiere VRAM; la inferencia se ejecuta en CPU.
- GPU recomendada: ninguna; el modelo fue entrenado y diseñado para un único núcleo Intel Emerald Rapids con AMX y soporte bf16.
- Puede ejecutarse en cualquier CPU moderna, aunque el rendimiento óptimo se obtiene en núcleos que soporten AMX y bf16.
- Opciones de despliegue: el repositorio incluye `example.py`, que carga el código fuente en `m2r/` y ejecuta la generación. No es compatible con vLLM, llama.cpp, Ollama ni TGI, debido a la arquitectura personalizada.
- El paper reporta un throughput de 6.616 tokens/s en un solo núcleo Intel Emerald Rapids con AMX, según el título del documento.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de esta categoría.

## Limitaciones y advertencias

- El autor indica que el modelo no puede calcular; sus fallos son específicos en operaciones aritméticas, no incompetencia general.
- En SQuAD v2, la sobre-abstención es del 31,2% y la abstención incorrecta del 62,9%, lo que indica que el modelo se comporta de forma inconsistente cuando la respuesta no está presente en el pasaje.
- El rendimiento depende críticamente de la máscara de vocabulario y del formato de prompt exactos; sin ellos, el modelo puede generar respuestas incorrectas en gran medida.
- No es compatible con la API estándar de `transformers`, lo que dificulta su integración en herramientas habituales.
- No se proporciona información sobre sesgos, idiomas soportados ni longitud de contexto explícita; la ventana de sliding-window es limitada (256 tokens).
- La licencia Apache 2.0 permite uso comercial, pero el modelo es experimental y de baja precisión, por lo que no es apto para tareas de alto riesgo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gdiamos/amx-reasoning-v1-instruct
- Paper (PDF): https://huggingface.co/gdiamos/amx-reasoning-v1-instruct/blob/main/paper.pdf
- Código fuente `m2r/` incluido en el repositorio del modelo.
