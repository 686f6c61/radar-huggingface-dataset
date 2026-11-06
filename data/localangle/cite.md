# localangle/cite

## Resumen

Cite es un modelo encoder ligero desarrollado por Local Angle (usuario `localangle` en Hugging Face) que resuelve un problema muy concreto: dada una pregunta y un conjunto de párrafos ordenados, determinar qué párrafos son necesarios para responderla. No genera texto ni respuestas; su función es de ranking y clasificación, devolviendo una probabilidad calibrada por párrafo junto con dos umbrales preajustados (`needed` y `contributing`).

Técnicamente, Cite es un fine-tuning del encoder Ettin 32M de JHU CLSP, que pertenece a la familia ModernBERT. El modelo se entrenó mediante destilación desde un profesor de 400M parámetros sobre texto de noticias reales, y posteriormente se comprimió (vocabulario recortado, embeddings en int8 y resto en fp16), resultando en un paquete de unos 42 MB de pesos. Esto lo hace adecuado para ejecución en CPU y despliegues on-device.

Su relevancia actual radica en la creciente demanda de sistemas RAG y de generación aumentada con citas verificables: en lugar de confiar en que un LLM cite correctamente, Cite selecciona de forma determinista y barata qué bloques de texto sustentan una respuesta, útil especialmente en periodismo, verificación de hechos y búsqueda documental. Se distribuye bajo licencia MIT con un formato de paquete propio (biblioteca `cite`), no como checkpoint estándar de transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder ModernBERT (fine-tuning de Ettin encoder) con cabeza de clasificación sobre marcadores `[MASK]` |
| Parametros totales | 32M (paquete de ~42 MB de pesos) |
| Parametros activos | no disponible (no es MoE; todos los parámetros están activos) |
| Longitud de contexto | 7999 tokens (`max_tokens`); los párrafos que exceden el límite se descartan |
| Tipos de cuantizacion | int8 en embeddings de tokens, fp16 en el resto (solo almacenamiento; se expande a fp32 al cargar) |
| Idiomas soportados | Ingles (evaluado solo en texto de noticias en ingles) |
| Licencia | MIT (codigo y pesos, sujeto al aviso MIT de Ettin) |
| Formato de pesos | safetensors (`weights.safetensors`) + paquete propio (`cite.json`, tokenizer, config) |

## Arquitectura y entrenamiento

Cite parte del encoder Ettin 32M de JHU CLSP, un modelo de la familia ModernBERT optimizado para tareas de representación y ranking de texto. El mecanismo de entrada es notable: la pregunta y todos los párrafos se empaquetan en una única secuencia, insertando un marcador `[MASK]` antes de cada párrafo; la cabeza de clasificación lee los estados ocultos de esos marcadores para producir una probabilidad por párrafo. Esto permite que el modelo razonee conjuntamente sobre la pregunta y todos los bloques en un solo pase, capturando dependencias entre párrafos (por ejemplo, si uno ya cubre la respuesta, otro redundante puede puntuar más bajo).

El entrenamiento siguió un esquema de destilación: un modelo profesor de 400M parámetros etiquetó datos de noticias reales (texto no redistribuido con el modelo, con etiquetas privadas del profesor), y el estudiante de 32M se entrenó sobre esas etiquetas. Posteriormente se aplicó compresión: vocabulario recortado, embeddings de tokens en int8 y pesos en fp16. Los logits se calibran mediante escalado de Platt en tiempo de carga, de modo que las probabilidades de salida están calibradas sin necesidad de ajustar umbrales por parte del usuario. Los umbrales empaquetados son 0,71 para `needed` y 0,15 para `contributing`.

## Capacidades

- Clasificacion de parrafos necesarios: dada una pregunta y una lista ordenada de párrafos, devuelve una probabilidad calibrada por párrafo y una etiqueta binaria `needed`.
- Ranking de parrafos por relevancia respecto a la pregunta, con un segundo umbral `contributing` que identifica párrafos relacionados pero no imprescindibles.
- Salida calibrada: probabilidades obtenidas por escalado de Platt, listas para usar con umbrales fijos sin recalibración.
- Deteccion de conjuntos vacios: puede indicar que ningún párrafo responde la pregunta (exactitud de 0,895 en conjunto vacío en su evaluación).
- Ejecucion en CPU: diseñado para inferencia en CPU con PyTorch, con soporte opcional de MPS en Mac; adecuado para despliegues on-device.
- Integracion via paquete Python (`cite`) con API sencilla (`CitePackage.from_pretrained`, `predict`).
- No genera texto: no produce respuestas, resúmenes ni citas de spans dentro de un párrafo.

## Casos de uso

- Citacion automatica en sistemas RAG: antes de pasar contexto a un LLM, Cite puede filtrar qué párrafos del corpus recuperado son realmente necesarios, reduciendo ruido, coste de tokens y riesgo de alucinación en la respuesta final.
- Verificacion de citas en generacion: dado un texto generado por un LLM y los documentos fuente, se puede usar Cite para comprobar qué párrafos de origen sustentan cada afirmación, señalando respuestas sin soporte.
- Herramientas de lectura de noticias: en productos de noticias locales, permite resaltar al usuario los párrafos concretos de un artículo que responden a su pregunta, como muestra la demo de Hugging Face.
- Resumen extractivo por pregunta: seleccionar los bloques que formarían un resumen mínimo y suficiente de un documento respecto a una consulta, sin generar texto nuevo.
- Reduccion de contexto en agentes: en pipelines multi-paso donde el agente consulta documentos largos, Cite puede recortar el contexto a los bloques necesarios en cada paso, ahorrando latencia y coste de API.
- Moderacion y auditoria editorial: identificar de forma trazable qué fragmentos de un artículo justifican un titular o una afirmación, útil en flujos de revisión editorial.
- Busqueda semantica fina a nivel de parrafo: como reranker dentro de un motor de búsqueda que devuelve párrafos concretos en lugar de documentos completos.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre una evaluación de bloques necesarios en noticias reales (v59, 1.800 preguntas sobre medios de noticias locales; umbral calibrado en un split separado):

| Metrica | Cite-32M package |
|---|---|
| Coverage | 0,696 |
| Exact set match | 0,727 |
| Exactitud de conjunto vacio | 0,895 |
| Tasa de any-extra | 0,057 |

No se han publicado comparaciones directas con otros modelos en la información disponible. En latencia, la variante ONNX int8 relacionada alcanza aproximadamente 44 ms p50 en CPU (AMD EPYC, 8 vCPU) con 5–12 párrafos y 268 ms con 33–60 párrafos; el paquete PyTorch distribuido mantiene el mismo punto operativo que el estudiante fp32.

## Requisitos de hardware

- VRAM / memoria: al expandirse a fp32 en carga, el modelo ocupa del orden de ~130 MB de RAM para los pesos; no requiere GPU.
- GPU recomendadas: ninguna necesaria; está diseñado para CPU. MPS en Mac es opcional.
- Consumer hardware: funciona en portátiles y máquinas sin GPU dedicada; el paquete de 42 MB es adecuado para despliegues on-device.
- Software requerido: Python ≥ 3.12, `torch`, `transformers`, `safetensors` y `huggingface_hub`. Instalación vía `pip install "cite @ git+https://github.com/localangle/cite.git"` o `uv sync` desde el repositorio.
- Opciones de despliegue: paquete Python propio (`cite`), con playground local (`deploy/cite_playground.py`) y demo en Hugging Face Spaces (`cjdd3b/cite-demo`). No hay soporte documentado para vLLM, TGI u Ollama (al no ser un modelo generativo, no aplican).
- Latencia: aproximadamente 44 ms p50 (batch 1, CPU, 5–12 párrafos) y 268 ms (33–60 párrafos) para la forma ONNX int8 relacionada; en el paquete PyTorch los documentos largos están dominados por el coste de atención.

## Comparativa con modelos similares

| | Cite (localangle) | Ettin encoder 32M (base) | Cross-encoders tipo bge-reranker |
|---|---|---|---|
| Tarea | Seleccion de parrafos necesarios (con umbrales calibrados) | Encoder base para embedding/Clasificacion generica | Reranking binario de relevancia |
| Parametros | 32M | 32M | ~278M (bge-reranker-v2-m3) |
| Contexto | 7999 tokens | 8192 tokens (ModernBERT) | 8192 tokens |
| Salida calibrada | Si (Platt + umbrales empaquetados) | No | No (logits sin calibrar) |
| Entrenamiento especifico | Destilacion desde profesor 400M sobre noticias reales | Preentrenamiento generico | Datos de relevancia generica (MS MARCO, etc.) |
| Licencia | MIT | MIT | Apache 2.0 |
| Peso del artefacto | ~42 MB | mayor (vocabulario completo, fp32) | ~1 GB aprox. |

La diferencia clave frente a un cross-encoder de reranking genérico es que Cite está especializado en la tarea de "bloques necesarios" con probabilidades calibradas y detección de conjunto vacío, a costa de estar entrenado solo con texto de noticias en inglés.

## Limitaciones y advertencias

- Solo ranking, no generacion: Cite no escribe respuestas ni extrae citas de spans dentro de un párrafo; hay que combinarlo con un modelo generativo si se quiere texto final.
- Dominio restringido: la evaluación se realizó exclusivamente sobre texto de noticias en inglés; el rendimiento en otros dominios (legal, médico, técnico) no está medido.
- Umbral no universal: la exactitud de conjunto vacío cae algunos puntos entre la calibración y la evaluación; el umbral empaquetado (0,71) debe tratarse como punto de partida y recalibrarse para un dominio nuevo.
- Limite de contexto: los documentos que superan los 7999 tokens pierden los párrafos finales, lo que puede omitir información relevante en artículos largos.
- Datos de entrenamiento no redistribuidos: se usaron etiquetas privadas del profesor y texto de noticias que no se incluyen en el paquete, lo que limita la reproducibilidad completa del entrenamiento.
- Proyecto de madurez temprana: 0 descargas y 0 likes registrados en el momento de la ficha; conviene validar en producción antes de depender de él.
- Licencia: MIT, sin restricciones de uso comercial, aunque sujeto al aviso de terceros de Ettin (`THIRD_PARTY_NOTICES.md`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/localangle/cite
- Version de pesos v0.1.0: https://huggingface.co/localangle/cite/tree/v0.1.0
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/cjdd3b/cite-demo
- Repositorio de codigo: https://github.com/localangle/cite
- Modelo base (Ettin encoder 32M, JHU CLSP): https://huggingface.co/jhu-clsp/ettin-encoder-32m
