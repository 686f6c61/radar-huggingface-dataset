# Rogendo/JengaNLP-multi-task-distilbert-base-uncased

## Resumen

JengaNLP-multi-task-distilbert-base-uncased es un modelo de clasificación de texto multi-tarea desarrollado por el usuario Rogendo dentro del framework JengaNLP, orientado a aplicaciones de seguridad nacional y telecomunicaciones en Kenia. Sobre un encoder DistilBERT base (6 capas, 768 dimensiones ocultas, 12 cabezas de atención, del orden de 66 millones de parámetros) se añade un mecanismo de fusión por atención condicionada por tarea y ocho cabezas de predicción que resuelven simultáneamente detección de fraude, análisis de sentimiento y puntuación de calidad de llamadas de atención al cliente. El modelo produce 22 dimensiones de salida en un único forward pass.

La propuesta técnica es interesante porque comparte un único encoder entre tres tareas heterogéneas y deja que una atención aprendida module la representación por tarea, con conexiones residuales (gate_init_value=0.5) que permiten a cada cabeza apoyarse en la representación base. La tarea de calidad de llamadas se descompone en seis cabezas y 17 sub-métricas binarias agrupadas en apertura, escucha, proactividad, resolución, espera y cierre, con pesos de pérdida diferenciados (resolución 2.0x, escucha 1.5x, espera 0.5x).

Su relevancia práctica es limitada por el momento: el repositorio acumula 0 descargas y 0 valoraciones, los resultados declarados no están verificados y la propia model card mezcla dos identificadores de repositorio distintos. Aun así, resulta un caso útil para estudiar patrones de multi-task learning aplicados a NLP para África, con soporte declarado de inglés y swahili.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT) con fusion por atencion condicionada por tarea y 8 cabezas de clasificacion |
| Parametros totales | del orden de 66 millones, heredados de distilbert-base-uncased (no declarado en la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (limite de posiciones de distilbert-base-uncased; no especificado en la model card) |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas) |
| Idiomas soportados | en (ingles), sw (swahili) |
| Licencia | apache-2.0 |
| Formato de pesos | transformers (repositorio de 0,8 GB); no se especifica en la model card si el checkpoint usa safetensors o bin |
| Dimensiones de salida | 1 cabeza de fraude (2 clases), 1 cabeza de sentimiento (3 clases), 6 cabezas de calidad de llamada (17 salidas binarias); 22 dimensiones totales |
| Pipeline declarado | text-classification |
| Framework de inferencia | jenga_ai (InferencePipeline.from_checkpoint), sobre torch y transformers |
| Fecha de creacion | 2026-02-14 |
| Ultima actualizacion | 2026-09-19 |

## Arquitectura y entrenamiento

El modelo parte de distilbert-base-uncased, un encoder de 6 capas con 768 dimensiones ocultas y 12 cabezas de atencion. Sobre la salida del encoder se aplica un modulo de attention fusion que genera una representacion modulada por tarea: cada tarea atiende a distintas partes de la salida del encoder, pero comparte las representaciones subyacentes, de modo que el patron de fraude, las senales de sentimiento y los indicadores de calidad conversacional se benefician mutuamente. La salida de la fusion se suma a la representacion original mediante una conexion residual inicializada con gate_init_value=0.5, lo que estabiliza el entrenamiento y permite a cada cabeza retroceder a la representacion base si la fusion no aporta.

Las cabezas son: una lineal (768, 2) con softmax para fraude; una lineal (768, 3) con softmax para sentimiento; y seis cabezas lineales de calidad de llamada (de 1 a 5 salidas binarias cada una) con activacion sigmoide, ponderadas por importancia durante el entrenamiento segun los pesos indicados en la model card. La card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset (figura como "custom") ni si se aplicaron tecnicas de RLHF o DPO; tampoco se documenta la estrategia de preentrenamiento adicional ni el regimen de congelacion de capas. No se declara ninguna innovacion de decodificacion (decodificacion especulativa, atencion lineal o similar).

## Capacidades

- Clasificacion binaria de fraude: distingue transacciones o mensajes normales frente a fraudulentos, con ejemplos de la model card centrados en notificaciones de M-Pesa.
- Analisis de sentimiento en tres clases: negativo, neutral y positivo.
- Puntuacion de calidad de llamadas multi-etiqueta: 17 sub-metricas binarias agrupadas en apertura (greeting), escucha (acknowledgment, empathy, clarification, active_listening, patience), proactividad (initiative, follow_up, suggestions), resolucion (identified_issue, provided_solution, confirmed_resolution, set_expectations, offered_alternatives), espera (asked_permission, explained_reason) y cierre (proper_farewell).
- Inferencia multi-tarea en una sola pasada: las tres tareas se resuelven simultaneamente y tambien pueden ejecutarse de forma individual mediante el parametro task_name.
- Procesamiento por lotes: predict_batch con batch_size configurable (el ejemplo usa 32).
- Interfaz de linea de comandos mediante python -m jenga_ai predict.
- Soporte de ingles y swahili segun los metadatos del modelo.
- Salidas con puntuacion de confianza por cabeza (el ejemplo de la card muestra una confianza del 96,9 por ciento).
- No se declara soporte de tool calling, function calling, razonamiento multi-paso, modo thinking, vision ni audio.

## Casos de uso

- Deteccion de fraude en pagos moviles: el modelo clasifica en una sola pasada mensajes como "Suspicious M-Pesa transaction detected from unknown account requesting urgent transfer" y devuelve etiqueta mas confianza, lo que permite integrarlo en un motor de reglas para bloquear o marcar operaciones sospechosas antes de la autorizacion.
- Control de calidad de call centers: a partir de transcripciones de conversaciones, las 17 sub-metricas permiten generar un informe automatico por agente (saludo, empatia, resolucion, cierre) sin revision manual, reduciendo el coste de auditar el 100 por cien de las llamadas en lugar de una muestra.
- Analisis de sentimiento en encuestas y resenas: clasificacion en negativo/neutral/positivo para paneles de voz del cliente en operadores de telefonia de Africa Oriental, con soporte nativo de swahili ademas de ingles.
- Triaje de tickets de soporte: combinar la senal de sentimiento con la de fraude permite priorizar incidencias de clientes molestos o con indicios de suplantacion, enrutandolas a agentes senior.
- Monitorizacion de seguridad y deteccion de campanas de smishing: el encoder compartido puede aplicarse en lote sobre historicos de mensajes para identificar patrones de fraude recurrentes y alimentar listas de indicadores de compromiso.
- Auditoria de cumplimiento en telecomunicaciones: las sub-metricas de resolucion y establecimiento de expectativas (identified_issue, set_expectations) sirven como evidencia objetiva en revisiones regulatorias de atencion al cliente.
- Analisis por lotes de archivos historicos: predict_batch permite reprocesar transcripciones o logs almacenados para construir series temporales de calidad y fraude, dado el reducido coste computacional de un encoder de 66 millones de parametros.
- Filtrado previo en pipelines de moderacion o riesgo: al ser un modelo pequeno, puede actuar como primera etapa de bajo coste que descarta la mayoria del trafico y deja solo los casos dudosos a un modelo mayor o a revision humana.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index. Ninguno de ellos esta verificado (verified: false) y no se publican detalles del conjunto de evaluacion ni del tamano de la particion de test.

| Tarea | Metrica | Valor | Verificado |
|---|---|---|---|
| Fraude | F1 | 1,000 | No |
| Fraude | Accuracy | 1,000 | No |
| Sentimiento | F1 | 0,167 | No |
| Sentimiento | Accuracy | 0,333 | No |
| Calidad de llamada - escucha | F1 | 0,922 | No |
| Calidad de llamada - resolucion | F1 | 0,908 | No |
| Calidad de llamada - apertura | F1 | 0,967 | No |
| Calidad de llamada - proactividad | F1 | 0,802 | No |
| Calidad de llamada - espera | F1 | 0,647 | No |
| Calidad de llamada - cierre | F1 | 0,881 | No |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, GLUE o similares) en la informacion disponible, ni comparaciones con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 264 MB para los pesos del encoder mas las cabezas; aproximadamente 132 MB en fp16 y unos 66 MB en int8. El repositorio completo pesa 0,8 GB, pero eso incluye artefactos adicionales (checkpoints y logs, que la propia documentacion recomienda excluir al descargar).
- GPU recomendadas: cualquier GPU moderna sirve; una NVIDIA T4, RTX 3060, RTX 4090, A100 o H100 son mas que suficientes. En la practica el modelo tambien funciona en CPU.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo con 4 GB o mas de memoria, e incluso en CPU y en dispositivos de borde con cuantizacion.
- Opciones de despliegue: el modelo esta pensado para el framework propio JengaNLP (InferencePipeline de jenga_ai), que requiere torch, transformers, pydantic, pyyaml y huggingface_hub. Al ser un checkpoint de transformers con cabezas personalizadas, no se declara compatibilidad directa con vLLM, TGI, llama.cpp u Ollama; el soporte de text-classification con multiples cabezas probablemente requiera cargar el modelo con codigo personalizado.
- Latencia y throughput estimados: no disponible. No se publican mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para alternativas en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales y de licencia.

| Modelo | Parametros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JengaNLP-multi-task-distilbert-base-uncased | del orden de 66 M (base DistilBERT) | 512 tokens | 3 tareas, 8 cabezas, 22 salidas | Apache-2.0 | Hugging Face, 0 descargas |
| distilbert-base-uncased | 66 M | 512 tokens | encoder generico preentrenado | Apache-2.0 | Ampliamente adoptado |
| distilbert-base-uncased-finetuned-sst-2-english | 67 M | 512 tokens | sentimiento binario | Apache-2.0 | Muy adoptado, con benchmarks publicos |
| bert-base-multilingual-cased | 178 M | 512 tokens | encoder multilingue (104 idiomas) | Apache-2.0 | Ampliamente adoptado |
| Modelos de clasificacion de fraude especificos | no disponible | no disponible | binaria | variable | no disponible |

La ventaja diferencial del modelo de Rogendo es la combinacion de tres tareas y 22 salidas en un unico forward pass con un encoder pequeno; sus alternativas directas cubren una sola tarea pero cuentan con evaluaciones publicas y reproducibles que este modelo no ofrece.

## Limitaciones y advertencias

- Los resultados del model-index no estan verificados. Un F1 y una accuracy de 1,000 en deteccion de fraude son un indicio claro de posible fuga de datos, conjunto de test minusculo o sobreajuste; no deben tomarse como rendimiento real en produccion.
- El rendimiento en sentimiento es muy bajo (F1 0,167 y accuracy 0,333 sobre tres clases), apenas por encima o por debajo del azar segun la metrica. La tarea de sentimiento no es utilizable tal cual.
- La sub-metrica de espera (asked_permission, explained_reason) obtiene el F1 mas bajo del bloque de calidad (0,647), lo que sugiere dificultad para detectar esos comportamientos en transcripciones.
- Inconsistencia de identificadores: la model card usa el ejemplo Rogendo/JengaNLP-multi-task-nlp, mientras que el repositorio publicado es Rogendo/JengaNLP-multi-task-distilbert-base-uncased. Conviene verificar el identificador correcto antes de integrarlo.
- Tambien hay discrepancia interna en las cifras: el resumen de la card indica un rango de F1 de 0,646 a 0,967 para calidad de llamada, mientras que el model-index detalla valores por sub-metrica entre 0,647 y 0,967.
- El modelo depende de un framework propio (jenga_ai) cuyo paquete no se declara publicado en PyPI; la integracion con librerias estandar puede requerir trabajo adicional.
- Repositorio sin traccion: 0 descargas y 0 valoraciones. No hay evidencia de uso en produccion ni de validacion por terceros.
- Cobertura idiomatica limitada a ingles y swahili, con datos de entrenamiento propietarios ("custom") no descritos, lo que impide evaluar sesgos de dominio o de registro.
- Ventana de contexto de 512 tokens, insuficiente para transcripciones de llamadas completas; obliga a trocear las conversaciones y agregar despues las predicciones por sub-metrica.
- Riesgo de alucinacion no aplica en el sentido generativo (es un modelo discriminativo), pero si existe riesgo de clasificaciones erroneas con alta confianza, especialmente en fraude, donde un falso positivo puede bloquear transacciones legitimas.
- Dominio muy especifico (telecomunicaciones y pagos moviles de Kenia); el rendimiento fuera de ese contexto no esta documentado.
- La licencia Apache-2.0 permite uso comercial, pero el tratamiento de datos personales financieros y de conversaciones telefonicas exige cumplir la normativa aplicable de proteccion de datos.
- Las fechas del repositorio (creacion en 2026-02-14) deben tratarse con cautela al evaluar la madurez del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rogendo/JengaNLP-multi-task-distilbert-base-uncased
- Repositorio del framework JengaNLP: https://github.com/Rogendo/JengaNLP
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces encontrados correspondian a servicios de horarios de rezo y no guardan relacion con la ficha.
