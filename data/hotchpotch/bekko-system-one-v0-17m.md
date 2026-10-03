# hotchpotch/bekko-system-one-v0-17m

## Resumen

Bekko System One v0 17M es un modelo encoder compacto en inglés, desarrollado por el usuario hotchpotch, diseñado para tomar lo que el autor denomina "decisiones de Sistema 1": elección entre alternativas nombradas (Choice), estimación de la probabilidad de una condición binaria redactada por el usuario (Noul) y devolución de la puntuación esperada de una rúbrica numérica (Score). No genera texto: recibe instrucciones, estado de la aplicación y definiciones de candidatos, y `model.predict()` devuelve probabilidades por candidato, una opción seleccionada o una puntuación numérica.

El modelo pertenece a la familia v0, que abarca variantes de 17M, 68M y 400M parámetros, y se construye sobre el reranker `cross-encoder/ettin-reranker-17m-v1` (linaje ModernBERT) mediante un encoder de prefijo compartido con cabezas específicas por tarea. La variante aquí descrita tiene 16,80M parámetros totales, de los cuales 3,90M quedan excluyendo los embeddings de solo consulta, y su fichero ONNX para navegador ocupa aproximadamente 29 MB.

Su relevancia actual reside en la exploración de si modelos ultra pequeños pueden sustituir a un LLM generativo en tareas de decisión acotadas, con inferencia en CPU, en CUDA o incluso en el navegador, con un coste de memoria mínimo. El propio autor etiqueta la familia como v0 porque, aunque obtiene buenos resultados en algunas tareas, queda muy por detrás de Jev 1.13 en los benchmarks de generalización de S1MB, y porque parte de los datos de entrenamiento solapa con familias de datasets presentes en la evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer tipo ModernBERT (heredado del reranker Ettin), con encoder de prefijo compartido y cabezas especificas por tarea |
| Parametros totales | 16,80 M (17M redondeado); 3,90 M excluyendo embeddings de solo consulta |
| Parametros activos | No aplica (no es MoE). El autor usa "AP" (active params) como metrica auxiliar que excluye los embeddings de lookup |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Exportacion ONNX para navegador con tabla de lookup de tokens cuantizada a INT8 por filas; bloques transformer y cabezas permanecen en FP32. No son modelos totalmente INT8. Otras cuantizaciones: no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors, ONNX (onnx_browser/model.onnx), compatible con sentence-transformers |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer bidireccional de tipo ModernBERT, derivado del cross-encoder `cross-encoder/ettin-reranker-17m-v1`, al que se añaden cabezas específicas para cada tipo de decisión. La innovación principal es el "shared-prefix encoder": las instrucciones y el estado de la aplicación se codifican una sola vez por prefijo tokenizado único dentro de un microbatch y el resultado se reutiliza para todos los candidatos, de modo que evaluar N alternativas no cuesta N codificaciones completas del contexto. El modelo no decodifica texto en ningún momento: puntúa candidatos.

El detalle del entrenamiento no está disponible en la información proporcionada. Se sabe que existe un dataset publicado (`hotchpotch/bekko-system-one-dataset-v0`) y que, según el autor, incluye familias de datasets representadas en la evaluación de S1MB, lo que invalida esos resultados como evidencia de generalización amplia. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de alineación como RLHF o DPO. En el lado de la inferencia, el modelo soporta ejecución en CPU y CUDA, FlashAttention 2 opcional y `torch.compile()`.

## Capacidades

- Tres tipos de salida tipada: Choice (selecciona entre alternativas con identificador), Noul (probabilidad estimada de una condición binaria redactada por el usuario) y Score (valor esperado de una rúbrica numérica).
- Carga de instrucciones, estado de la aplicación y criterios en formato JSON estructurado, con soporte de documentos auxiliares por decisión.
- Evaluación en paralelo de múltiples candidatos sin generación de texto, con reutilización del prefijo compartido.
- Procesamiento por lotes: `model.predict()` acepta objetos individuales y lotes.
- Ejecución independiente en CPU, CUDA o navegador (ONNX con CPU y WebGPU), sin dependencia de un servidor de inferencia.
- Salida probabilística por candidato (distribución sobre los identificadores de candidato) y no solo la etiqueta ganadora.
- Código personalizado embarcado en el repositorio (`inference_v0.BekkoSentenceTransformer`), cargable mediante `trust_remote_code=True`.
- Capacidades multilingües: no, el modelo está entrenado y etiquetado únicamente para inglés.
- Tool calling, agentes, visión, audio o modo "thinking": no disponible / no soportado (es un encoder de clasificación, no un modelo generativo).

## Casos de uso

- Enrutado de tickets de soporte: el caso del propio quickstart. Se pasa el mensaje del cliente como estado y una decisión de tipo Choice con candidatos como "billing" y "technical"; `predict()` devuelve el identificador del departamento y la distribución de probabilidad, lo que permite enrutar con umbral de confianza y derivar a revisión humana cuando la probabilidad máxima es baja.
- Guardarraíles de salida de LLM: definir una decisión de tipo Noul con una condición redactada ("¿la respuesta contiene datos personales identificables?") y usar la probabilidad estimada como filtro previo a la publicación de la respuesta generada.
- Evaluación automática con rúbricas: usar el tipo Score para asignar el valor esperado de una rúbrica numérica a respuestas de un modelo generativo en pipelines de evaluación continua, con un coste de cómputo muy inferior al de un LLM juez.
- Clasificación local en el navegador: gracias al export ONNX de 29 MB con ejecución en CPU/WebGPU, permite clasificar y decidir sobre datos del usuario sin enviarlos a un servidor, útil en aplicaciones con requisitos de privacidad.
- Enrutado de herramientas en agentes: mapear la petición del usuario a una herramienta concreta mediante una decisión Choice, con la ventaja de conocer la distribución completa y poder abstenerse si ningún candidato supera un umbral.
- Triaje de correo o mensajes entrantes: Noul para condiciones como "¿requiere respuesta inmediata?" y Choice para asignar etiqueta o cola, ejecutándose en CPU dentro del mismo servicio sin GPU dedicada.
- Filtrado previo en búsqueda o RAG: uso como reranker ligero sobre un conjunto reducido de candidatos antes de pasar a un modelo mayor, aprovechando su linaje de reranker Ettin y su bajo coste por consulta.
- Moderación de contenido con criterios versionados por JSON: las condiciones y rúbricas se definen como datos, no como código, de modo que se pueden auditar, versionar y cambiar sin reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. El autor únicamente señala de forma cualitativa que la familia v0 queda muy por detrás de Jev 1.13 en los benchmarks de generalización de S1MB, y advierte que los buenos resultados en algunas tareas no constituyen evidencia de generalización amplia porque los datos de entrenamiento incluyen familias de datasets presentes en la evaluación. Los resultados completos, si existen, se consultan en la tabla de clasificación S1MB enlazada más abajo.

| Benchmark | Resultado |
|---|---|
| MMLU, HumanEval, GSM8K u otros estándar | no disponible |
| S1MB (evaluación específica del proyecto) | no disponible en la información proporcionada; consultar la tabla de clasificación S1MB |

## Requisitos de hardware

- VRAM estimada: con 16,80M parámetros, el modelo en FP32 ocupa del orden de decenas de MB en memoria; el fichero ONNX de navegador son 29 MB. Cifras exactas de memoria en ejecución: no disponible.
- GPU recomendadas: cualquier GPU con soporte CUDA es más que suficiente. No se requiere ni A100 ni H100; una GPU de gama de entrada o integrada basta.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual, y también en CPU. El caso de uso declarado incluye ejecución en CPU y en navegador con WebGPU.
- Opciones de despliegue: PyTorch en CPU o CUDA a través de `BekkoSentenceTransformer`, ONNX Runtime, ejecución en navegador mediante el export ONNX, y `torch.compile()` más FlashAttention 2 como optimizaciones opcionales. vLLM, llama.cpp y TGI no son aplicables, ya que el modelo no es autoregresivo y no genera texto.
- Dependencias declaradas: torch >=2.10,<2.11, transformers ==5.17.0, sentence-transformers ==6.1.0, safetensors >=0.7, tqdm >=4.67.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de salida | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Bekko System One v0 17M | 16,80 M (3,90 M sin embeddings) | no disponible | Choice / Noul / Score (probabilidades y selección) | no disponible; por detrás de Jev 1.13 en generalización según el autor | no disponible | HuggingFace, ONNX, código de entrenamiento e inferencia en GitHub |
| Jev 1.13 (TypeSafe AI) | no disponible | no disponible | Modelo de decisión de Sistema 1 | Referencia de comparación del propio autor; Bekko v0 queda por detrás en los benchmarks de generalización de S1MB | no disponible | Documentación en docs.typesafe.ai |
| Ettin reranker 17M v1 | ~17 M (modelo base) | no disponible | Puntuación de relevancia (reranking) | no disponible | no disponible | HuggingFace (cross-encoder/ettin-reranker-17m-v1) |

Los tres comparten la categoría de encoder compacto orientado a puntuación más que a generación. Bekko añade la interfaz de decisiones tipadas sobre el reranker Ettin; Jev 1.13 es el competidor directo citado por el autor. Datos cuantitativos de rendimiento y licencia: no disponibles.

## Limitaciones y advertencias

- Generalización limitada: el propio autor designa la familia como v0 precisamente porque queda lejos de Jev 1.13 en los benchmarks de generalización de S1MB. No debe asumirse un rendimiento uniforme fuera de las tareas evaluadas.
- Solapamiento entre entrenamiento y evaluación: el dataset de entrenamiento incluye familias de datasets presentes en la evaluación, por lo que los buenos resultados en esas tareas no demuestran capacidad de generalización.
- Solo inglés: el modelo está etiquetado exclusivamente para inglés; el comportamiento en otros idiomas no está caracterizado.
- Licencia no disponible: no se puede confirmar la licencia del modelo ni del modelo base, lo que impide verificar las condiciones de uso comercial. Debe aclararse antes de cualquier despliegue en producción.
- Riesgo de alucinación: al no generar texto, el riesgo clásico de alucinación no aplica, pero sí existe riesgo de clasificación errónea, especialmente cuando las descripciones de los criterios son ambiguas o los candidatos se solapan semánticamente.
- Código remoto: la carga requiere `trust_remote_code=True` con `inference_v0.BekkoSentenceTransformer`; conviene fijar `revision` a un hash de commit completo para reproducibilidad y revisar el código antes de ejecutarlo en un entorno de producción.
- La cuantización del export de navegador es parcial: solo la tabla de lookup de tokens está en INT8 por filas; los bloques transformer y las cabezas siguen en FP32, por lo que no debe asumirse un modelo totalmente INT8 ni extrapolar ahorros de memoria de cuantizaciones completas.
- Los recuentos "AP" (active params) excluyen los embeddings de solo consulta y no son una estimación de memoria; no deben usarse como tal.
- Contexto máximo, coste por candidato en lotes grandes y comportamiento con entradas muy largas: no disponible.
- Popularidad y madurez: 0 descargas y 11 "me gusta" en el momento de la consulta, con licencia y pipeline no declarados; se trata de un proyecto experimental.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hotchpotch/bekko-system-one-v0-17m
- Articulo de publicacion: https://huggingface.co/blog/hotchpotch/bekko-system-one-v0-release/
- Coleccion de modelos de la familia v0: https://huggingface.co/collections/hotchpotch/bekko-system-one-v0-6abc47eab9c4fe4ec83d9e30
- Demo en navegador: https://huggingface.co/spaces/hotchpotch/bekko-system-one-in-browser
- Codigo de entrenamiento e inferencia: https://github.com/hotchpotch/bekko-system-one
- Dataset de entrenamiento: https://huggingface.co/datasets/hotchpotch/bekko-system-one-dataset-v0
- Tabla de clasificacion S1MB: https://huggingface.co/spaces/hotchpotch/S1MB-leaderboard
- Documentacion de Jev (TypeSafe AI): https://docs.typesafe.ai/concepts/system-one
- Modelo base: https://huggingface.co/cross-encoder/ettin-reranker-17m-v1
- Variante de 68M: https://huggingface.co/hotchpotch/bekko-system-one-v0-68m
- Variante de 400M: https://huggingface.co/hotchpotch/bekko-system-one-v0-400m
