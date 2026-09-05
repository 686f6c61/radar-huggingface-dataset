# cnuland/llm-d-sc-sensitivity-v3-prior

## Resumen

`cnuland/llm-d-sc-sensitivity-v3-prior` es un clasificador de sensibilidad para enrutamiento semántico de modelos de lenguaje, desarrollado por el autor `cnuland` como parte del proyecto `llm-d-semantic-classifier`. El modelo asigna a cada prompt una etiqueta de cinco niveles: `PUBLIC`, `INTERNAL`, `CONFIDENTIAL`, `REGULATED` y `NEVER_EGRESS`. Su función principal es actuar como puerta de control (gate) antes de enviar tráfico a un LLM externo, evitando fugas de credenciales o datos regulados.

Arquitectónicamente es un transformer encoder basado en `BAAI/bge-base-en-v1.5`, con una cabeza de clasificación de secuencia que requiere un runtime capaz de leer logits. Tiene 109.486.085 parámetros y una ventana de contexto de 512 tokens heredada del modelo base. El peso del repositorio es de 0,4 GB en formato `safetensors`.

La relevancia de este modelo radica en que ofrece una solución específica para el control de egress en sistemas LLM, con métricas de recall por nivel que permiten dimensionar el riesgo de bloquear tráfico legítimo frente a contener información sensible. Está ajustado para tráfico empresarial, no para consumo general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-like) con cabeza de clasificación de secuencia; base `BAAI/bge-base-en-v1.5` |
| Parametros totales | 109.486.085 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (heredado de `BAAI/bge-base-en-v1.5`) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo base entrenado principalmente en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un clasificador de secuencia construido sobre el encoder `BAAI/bge-base-en-v1.5`. La cabeza de clasificación es un `sequence-classification head` que emite logits para las cinco clases. Según la model card, requiere un runtime que lea logits directamente, lo que implica que la inferencia debe realizarse sin aplicar softmax en el pipeline estándar de clasificación.

El entrenamiento se realizó con 744 filas del dataset `sensitivity-prior-sqrt`, que combina tráfico real de WildChat-1M etiquetado por un jurado de tres modelos (`claude-opus-5`, `claude-sonnet-5`, `claude-fable-5-1`) con datos sintéticos diseñados para cubrir niveles poco frecuentes. El prior de entrenamiento se resampleó geométricamente hacia el prior de evaluación, reduciendo `CONFIDENTIAL` del 14,4% al 9,4% y aumentando `INTERNAL` del 35,1% al 43,7%.

La model card documenta tres cambios medidos por separado respecto a la versión anterior: la eliminación del class weighting escalado por tier (+1,91), el cambio de encoder de `all-MiniLM-L6-v2` a `bge-base-en-v1.5` (+4,53) y el resampling del prior (+1,27). El autor destaca que el resampling es la única intervención confirmada por un control de contención, mientras que otras mejoras aparentes resultaron ser puntos distintos de la misma curva.

## Capacidades

- Clasificación de prompts en cinco niveles de sensibilidad: `PUBLIC`, `INTERNAL`, `CONFIDENTIAL`, `REGULATED` y `NEVER_EGRESS`.
- Salida de logits para integración en sistemas de enrutamiento semántico que necesitan umbrales personalizados.
- Optimizado para tráfico empresarial, con recall alto en `NEVER_EGRESS` (0,93) y `INTERNAL` (0,86).
- Compatible con `text-embeddings-inference` y `endpoints_compatible` según los tags del repositorio.
- No es generativo: no produce texto, solo clasificación.
- No soporta tool calling ni razonamiento multi-paso, al ser un clasificador puro.

## Casos de uso

- **Gate de egress para LLMs externos**: antes de enviar un prompt a un modelo alojado fuera de la infraestructura, se clasifica y se bloquea si la etiqueta es `NEVER_EGRESS`. El recall de 0,93 en esta clase reduce el riesgo de fuga de credenciales.
- **Enrutamiento semántico de prompts**: decidir qué modelo interno o externo debe atender cada solicitud según su nivel de sensibilidad, por ejemplo, enviando solo `PUBLIC` a modelos económicos y `REGULATED` a modelos con mayor supervisión.
- **Filtrado de documentos para RAG**: clasificar fragmentos antes de indexarlos en una base vectorial, evitando que contenido `CONFIDENTIAL` o `REGULATED` se recupere en consultas de bajo nivel de acceso.
- **Auditoría de logs de conversaciones**: clasificar históricos de chat para detectar si se han compartido datos sensibles, con una macro F1 de 0,5993 en tráfico real.
- **Control de activación de tool calling**: permitir que un agente LLM invoque herramientas externas solo cuando el prompt es `PUBLIC` o `INTERNAL`, bloqueando la ejecución para `REGULATED` o `NEVER_EGRESS`.
- **Clasificación de tickets de soporte**: priorizar la atención según la sensibilidad del contenido, identificando automáticamente tickets que contienen datos de clientes o información regulada.
- **Sistema de aprobación previa en pipelines de generación**: clasificar el prompt antes de la generación para aplicar políticas de redacción o redirección a modelos con mayor control de acceso.

## Benchmarks y rendimiento

La model card presenta tres conjuntos de evaluación con resultados medidos. El primer conjunto es tráfico real de WildChat-1M etiquetado por jurado unánime de tres modelos. Los otros dos son evaluaciones empresariales, una centrada en situaciones de manejo de secretos y otra en generación incondicionada.

| Conjunto de evaluación | n | Accuracy | IC 95% | Macro F1 |
|---|---:|---:|---|---:|
| Tráfico real (WildChat, jurado unánime) | 284 | 0,8627 | 0,818 – 0,898 | 0,5993 |
| Empresarial, situaciones de manejo de secretos | 707 | 0,8274 | 0,798 – 0,854 | 0,7584 |
| Empresarial, generación incondicionada, jurado unánime | 744 | 0,7581 | 0,726 – 0,787 | 0,6586 |

Recall por nivel:

| Nivel | Recall |
|---|---:|
| `PUBLIC` | 0,74 |
| `INTERNAL` | 0,86 |
| `CONFIDENTIAL` | 0,76 |
| `REGULATED` | 0,71 |
| `NEVER_EGRESS` | 0,93 |

El autor indica que el techo teórico de la evaluación es aproximadamente 0,95, ya que alrededor del 4,9% de las etiquetas gold son incorrectas. También se menciona que la semilla publicada es la primera ejecutada (semilla 11) y no la mejor. Con la semilla 22, la precisión en entsec sube a 0,8331 y en tráfico real a 0,8697.

## Requisitos de hardware

- VRAM estimada: el modelo ocupa aproximadamente 0,4 GB en fp32, por lo que puede ejecutarse en cualquier GPU consumer con al menos 1 GB de memoria.
- GPU recomendadas: RTX 3060, RTX 4070, o cualquier GPU con soporte CUDA; también funciona en CPU.
- Compatible con consumer GPU: sí, e incluso puede ejecutarse en CPU sin problemas.
- Opciones de despliegue: `transformers` con pipeline de `text-classification`, `text-embeddings-inference`, y cualquier runtime compatible con `endpoints_compatible`.
- Latencia medida en CPU: p50 de 16,29 ms y p99 de 30,57 ms en un Apple M-series con un solo hilo. El autor señala que el clasificador se sirve en CPU, por lo que el tamaño del modelo afecta directamente al throughput por réplica.

## Comparativa con modelos similares

| Modelo | Base encoder | Parámetros | Accuracy entsec | Observaciones |
|---|---|---|---|---|
| `llm-d-sc-sensitivity-v3-prior` (este) | bge-base-en-v1.5 | 109,5 M | 0,8274 (seed 11) / 0,8303 mediana | Ajustado a tráfico empresarial, prior resampleado |
| `llm-d-sc-sensitivity-v3-bge` | bge-base-en-v1.5 | No disponible | No disponible | Versión no resampleada; recomendada para tráfico de consumidores |
| `llm-d-sc-sensitivity-v2` | all-MiniLM-L6-v2 | No disponible | 0,7808 | Versión anterior, con class weighting y encoder MiniLM |

La comparación se limita a las variantes del mismo proyecto, ya que no se han encontrado en la información proporcionada clasificadores de sensibilidad equivalentes de otros autores con evaluaciones comparables.

## Limitaciones y advertencias

- El modelo está ajustado hacia texto empresarial; en tráfico de consumidores, el autor recomienda usar `llm-d-sc-sensitivity-v3-bge`. La precisión en tráfico real es de 0,8662 mediana frente a 0,8838 del modelo no resampleado, una pérdida de 1,76 puntos.
- La evaluación empresarial (`entsec`) es sintética y el autor estima que es distinguible del tráfico real de asistentes en un 95,8%. No existe un corpus empresarial real de validación, lo que se señala como el mayor riesgo abierto del trabajo.
- El conjunto WildChat-1M es tráfico de consumidores y está compuesto aproximadamente en un 93% por prompts `PUBLIC`, por lo que no permite ejercitar adecuadamente los niveles que controlan el egress.
- Alrededor del 4,9% de las etiquetas gold de la evaluación son incorrectas, lo que fija un techo de precisión de 0,95. Esto significa que ninguna métrica debe interpretarse como si el modelo pudiera alcanzar el 100%.
- El recall en `NEVER_EGRESS` es alto (0,93), pero a 95% de contención el modelo bloquea un 4,95% de tráfico legítimo, frente al 8,19% del modelo anterior. Este sobre-bloqueo es un coste operativo a considerar.
- No se han publicado datos sobre idiomas soportados; el modelo base `bge-base-en-v1.5` está entrenado principalmente en inglés, por lo que el rendimiento en otros idiomas es incierto.
- La licencia Apache 2.0 permite uso comercial, pero hay que verificar que los datos de entrenamiento (WildChat-1M) cumplan con las condiciones de uso de su fuente original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cnuland/llm-d-sc-sensitivity-v3-prior
- Repositorio del proyecto: https://github.com/llm-d-incubation/llm-d-semantic-classifier
- Dataset de tráfico real: https://huggingface.co/datasets/allenai/WildChat-1M
- Versión anterior del clasificador: https://huggingface.co/cnuland/llm-d-sc-sensitivity
