# nishanth-kj/laya

## Resumen

Laya es un modelo de decisión no autorregresivo desarrollado por nishanth-kj (con el repositorio de código mantenido en GitHub bajo el usuario NandhaKishorM). No es un modelo generativo: recibe un estado en forma de texto, correo, ticket o JSON junto con preguntas tipadas y devuelve respuestas tipadas acompañadas de probabilidades calibradas en una única pasada hacia delante. Está publicado en Hugging Face con pipeline de `text-classification` y licencia Apache 2.0.

Su propuesta es sustituir tareas de clasificación, enrutado, scoring y guardrails que normalmente se resuelven con un LLM generativo, evitando el coste de decodificación y el riesgo de alucinación al no producir texto libre. El modelo declara cobertura de más de 100 idiomas, una latencia de una sola pasada de aproximadamente 33 ms y hasta 8.192 tokens de contexto en el checkpoint multilingüe cuando se invoca con `max_len=8192`.

La relevancia actual viene de su enfoque de entrenamiento: el autor indica que fue entrenado con refuerzo contra reglas de puntuación estrictamente propias (RLCD), de forma que la única manera de maximizar la recompensa es reportar probabilidades honestas. El checkpoint base en inglés obtiene 0.362 de exactitud en el benchmark de decisiones tipadas del propio autor, mientras que un checkpoint ajustado sobre datos de dominio sube a 0.766, lo que indica que el valor real del modelo aparece tras el ajuste fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer no autorregresivo orientado a clasificación (la topología interna exacta no se detalla en la informacion disponible) |
| Parametros totales | 421.293.830 |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 1.024 tokens por defecto; hasta 8.192 tokens con `max_len=8192` en `laya-multilingual` |
| Tipos de cuantizacion | No disponible (se ofrece ruta rapida GPU con TileLang y soporte ONNX Runtime) |
| Idiomas soportados | Más de 100 idiomas según la model card; no se publica la lista concreta |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La model card describe Laya como un modelo de decisión de "System 1": no autorregresivo, no generativo y de una sola pasada. El modelo no produce texto, por lo que no hay salida que parsear ni texto que pueda alucinarse. La interacción se define mediante preguntas tipadas (`choice`, `score`, `noul`, entre otras) sobre un estado de entrada, y la salida son respuestas tipadas con probabilidades. El sistema incluye un `Router` que detecta el script y el idioma de la entrada y deriva el texto a los checkpoints en inglés o multilingüe según corresponda, evitando que texto mayoritariamente en inglés acabe enrutado al checkpoint multilingüe.

En cuanto al entrenamiento, el autor indica que se usó aprendizaje por refuerzo contra reglas de puntuación estrictamente propias (RLCD, *reinforcement learning with calibrated decisions*), de modo que la función de recompensa solo se maximiza reportando probabilidades bien calibradas. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases adicionales de RLHF o DPO. Sí se documenta el procedimiento de ajuste fino: el cuaderno oficial construye el dataset, entrena, ajusta temperaturas de calibración, evalúa y publica el checkpoint resultante en Kaggle con 2 GPU T4 gratuitas.

## Capacidades

- Clasificación y decisión sobre texto: preguntas de tipo `choice` devuelven la opción elegida según unos criterios definidos por el usuario.
- Puntuación ordinal: preguntas de tipo `score` reparten la probabilidad entre niveles ordenados (por ejemplo, "no urgente", "pronto", "bloqueante").
- Preguntas binarias calibradas: el tipo `noul` devuelve la probabilidad de que la respuesta sea sí.
- Salida con probabilidades matemáticamente calibradas, no solo etiquetas, lo que permite fijar umbrales y comparar decisiones.
- Cobertura multilingüe declarada de más de 100 idiomas, con detección automática de script e idioma en el `Router`.
- Procesamiento de estados heterogéneos: texto libre, correos, tickets y JSON estructurado.
- Contexto largo de hasta 8.192 tokens en el checkpoint multilingüe mediante `max_len=8192`.
- Integración como servidor HTTP (`laya[serve]`), servidor MCP (`laya[mcp]`), LangChain y LangGraph (`laya[langchain]`), y ONNX Runtime (`laya[onnx]`).
- Ganchos de predicción (`prediction hooks`) y decisiones guiadas por esquema para encadenar el modelo en flujos estructurados.
- No genera texto, por lo que no requiere parsing de salida ni presenta alucinación de contenido.

## Casos de uso

- Enrutado de tickets de soporte: con una pregunta `choice` de departamento (facturación, técnico, otros) más una pregunta `score` de urgencia y una `noul` de riesgo de baja, el modelo clasifica cada ticket en una sola pasada de ~33 ms. El ejemplo de la model card devuelve `billing` y la probabilidad de amenaza de cancelación para un correo de facturación duplicada.
- Guardrails y moderación en producción: al devolver probabilidades calibradas en lugar de texto, se puede fijar un umbral (por ejemplo 0,9) para bloquear contenido y dejar pasar el resto, con un coste de cómputo muy inferior al de un LLM generativo.
- Triaje de correo entrante: clasificar mensajes por departamento, prioridad y necesidad de respuesta humana usando el estado en crudo del correo, sin preprocesado de prompt.
- Scoring de riesgo en flujos financieros o antifraude: la salida probabilística de tipo `noul` permite integrar la decisión en reglas de negocio existentes y auditar el umbral aplicado.
- Enrutado multilingüe en atención al cliente global: el `Router` detecta el idioma y deriva a `laya-multilingual`, de modo que el mismo conjunto de preguntas funciona con texto en hindi, castellano u otros idiomas de la cobertura declarada.
- Orquestación de agentes con LangGraph: usar el modelo como nodo de decisión barato que determine qué herramienta o rama activar antes de invocar un modelo generativo, reduciendo coste y latencia del flujo completo.
- Clasificación documental y de contratos largos: con `max_len=8192` en el checkpoint multilingüe se pueden procesar documentos de hasta unas 4.000 palabras manteniendo buena exactitud según la tabla del autor.
- Ajuste fino sobre taxonomías propias: partiendo del checkpoint publicado y del cuaderno de Kaggle con 2 T4, un equipo puede entrenar su propio clasificador de decisiones y publicarlo en el Hub, como demuestra el checkpoint `laya-typed-decisions`.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible provienen del propio autor y comparan el checkpoint base con un ajuste fino sobre el mismo benchmark interno.

| Benchmark | Modelo | Resultado |
|---|---|---|
| Decisiones tipadas (2.000 decisiones, cuatro flujos) | Checkpoint base en inglés | 0,362 de exactitud |
| Decisiones tipadas (2.000 decisiones, cuatro flujos) | `laya-typed-decisions` (ajustado) | 0,766 de exactitud |
| Documento largo (20 peticiones, hasta ~4.000 tokens de contexto) | `laya-multilingual` con `max_len=8192` | 16 a 18 respuestas correctas de 20 |
| Documento largo (20 peticiones, más de ~4.000 tokens) | `laya-multilingual` con `max_len=8192` | 8 a 17 respuestas correctas de 20 (variable) |
| Latencia de una pasada | Modelo en general | ~33 ms |
| Latencia con entrada de 4.000 tokens | `laya-multilingual` en GPU de Apple | ~1,7 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 0,85 GB en fp16 y unos 1,7 GB en fp32 para los 421 millones de parámetros; el repositorio ocupa 2,4 GB porque incluye varios checkpoints.
- Cabe sin problema en GPU de consumo: cualquier tarjeta con 4 GB o más de VRAM (RTX 3050, RTX 3060, RTX 4060, RTX 4090) puede ejecutarlo, y también funciona en CPU y en GPU de Apple.
- El ajuste fino documentado se ejecuta en 2 GPU T4 gratuitas de Kaggle, lo que sitúa el entrenamiento en un rango asequible.
- Opciones de despliegue documentadas: servidor HTTP con `laya-serve`, servidor MCP, integración con LangChain y LangGraph, y ejecución vía ONNX Runtime.
- Existe una ruta rápida en GPU basada en TileLang (`laya[fast]`), con retroceso a CPU si se produce un error de memoria fuera de límites en CUDA.
- No se documentan en la información disponible el soporte de vLLM, llama.cpp, Ollama ni TGI; el pipeline publicado es de clasificación, no de generación.
- Latencia declarada: ~33 ms por pasada hacia delante en entradas cortas y ~1,7 s para una entrada de 4.000 tokens en GPU de Apple. No se publican cifras de throughput.

## Comparativa con modelos similares

En la información disponible no se documentan comparativas con modelos externos de la misma categoría. La única comparación publicada es interna, entre el checkpoint base y su propio ajuste fino:

| Modelo | Parametros | Contexto | Exactitud en decisiones tipadas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nishanth-kj/laya` (base en ingles) | 421 M | 1.024 tokens (8.192 en multilingue) | 0,362 | Apache 2.0 | Hugging Face |
| `convaiinnovations/laya-typed-decisions` (ajuste fino) | 421 M (misma base) | 1.024 tokens (8.192 en multilingue) | 0,766 | No especificada en la informacion disponible | Hugging Face |

Comparativa con alternativas externas (modelos de clasificación tipo encoder o clasificadores basados en LLM): no disponible.

## Limitaciones y advertencias

- No es un modelo generativo: no puede redactar texto, resumir ni responder preguntas abiertas. Solo devuelve respuestas tipadas con probabilidades.
- La exactitud cero disparo del checkpoint base en inglés es baja (0,362) en el benchmark del propio autor; el modelo solo resulta competitivo tras ajuste fino sobre datos del dominio.
- La exactitud con documentos largos se degrada a partir de unos 4.000 tokens de entrada, con resultados que caen hasta 8 de 20 respuestas correctas; el propio autor recomienda validar la exactitud en contexto largo con datos propios.
- La cobertura de más de 100 idiomas es una afirmación de la model card y no aparece respaldada por una evaluación independiente ni por una lista de idiomas verificada.
- La licencia Apache 2.0 permite uso comercial, pero el checkpoint ajustado `laya-typed-decisions` no declara licencia en la información disponible, por lo que conviene verificarla antes de usarlo en producción.
- No se documentan sesgos conocidos ni evaluaciones de equidad, toxicidad o robustez adversarial.
- La calibración de las probabilidades depende del ajuste de temperaturas del proceso de entrenamiento; si se reentrena el modelo, hay que repetir ese ajuste para conservar la calibración.
- El método de entrenamiento declarado (RLCD) y las cifras de latencia proceden de material del propio autor, sin replicación externa publicada.
- El repositorio de Hugging Face registra 0 descargas y 1 like, por lo que no existe validación de la comunidad sobre el comportamiento del modelo en producción.
- No hay información publicada sobre cuantizaciones disponibles, por lo que el despliegue en entornos con restricciones severas de memoria no está documentado.
- La fecha de creación registrada en el Hub (2026-09-26) es posterior a la fecha actual, un dato anómalo que conviene tener en cuenta al evaluar la trazabilidad del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nishanth-kj/laya
- Repositorio de código: https://github.com/NandhaKishorM/laya
- Detalles de instalación: https://github.com/NandhaKishorM/laya#installation-details
- Documentación oficial: https://nandhakishorm.github.io/laya/
- Referencia de la API: https://nandhakishorm.github.io/laya/reference/
- Guía de ganchos de predicción: https://nandhakishorm.github.io/laya/hooks/
- Decisiones guiadas por esquema: https://nandhakishorm.github.io/laya/structured/
- Guía de Docker: https://nandhakishorm.github.io/laya/docker/
- Guía de LangChain y LangGraph: https://nandhakishorm.github.io/laya/langchain/
- Checkpoint ajustado: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Cuaderno de ajuste fino en Kaggle: https://github.com/NandhaKishorM/laya/blob/main/notebooks/laya_finetune_typed_decisions_2xT4_kaggle.ipynb
- Script de evaluación en contexto largo: https://github.com/NandhaKishorM/laya/blob/main/research/scripts/bench_long_context.py
- Sección de ajuste fino del repositorio: https://github.com/NandhaKishorM/laya#fine-tuning
- Gráfica de exactitud en contexto largo: https://raw.githubusercontent.com/NandhaKishorM/laya/main/assets/long_context_8192.png
- Paquete en PyPI: https://pypi.org/project/laya/
