# dhresearch/quality-router-v2-domain-v2shape

## Resumen

`dhresearch/quality-router-v2-domain-v2shape` es un modelo de enrutamiento de peticiones publicado por `dhresearch`, no un modelo de lenguaje generativo. Se distribuye como un objeto serializado con joblib y pertenece a la familia de políticas condicionadas por ruta ("route-conditioned") del estudio `outcome-router-v2`. Su clase es `RouteConditionedSuccessRouter` y su función aparente es predecir la ruta (`predicted_route`) junto con probabilidades redondeadas y etiquetas, es decir, decidir a qué experto o vía de ejecución debe dirigirse una petición.

El artefacto es un reentrenamiento (refit) con semilla 0 fechado el 3 de octubre de 2026. Según la model card, la ejecución original escribió predicciones pero no guardó pesos, por lo que esta subida es una reconstrucción posterior, no el fichero de pesos original. Además, la tarjeta servida del sistema `quality_router_v2` (versión 8, con `learned_downrouting` en falso) no carga este objeto: se trata de un artefacto de estudio que queda fuera del flujo servido.

La relevancia del modelo es acotada y muy específica: sirve como pieza auditable para reproducir decisiones de enrutamiento dentro de una investigación concreta. Su principal evidencia de calidad es una comprobación de concordancia con un fichero de predicciones congelado (250 de 250 filas compartidas), no una batería de benchmarks frente a otros modelos. No hay datos de idiomas, pipeline ni pesos declarados en la ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Clasificador de enrutamiento condicionado por ruta (clase `RouteConditionedSuccessRouter`), serializado con scikit-learn/joblib. No es un transformer, MoE ni SSM. El estimador concreto no se declara; el entorno de reentrenamiento incluye lightgbm 4.7.0, sin confirmación de que sea el estimador final |
| Parámetros totales | no disponible (la model card no publica recuento de parámetros; el tamaño de repositorio reportado es 0.0 GB) |
| Parámetros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplica (modelo tabular/de decisión; no procesa secuencias de texto de forma nativa) |
| Tipos de cuantización | no aplica (artefacto tabular serializado, no hay pesos en coma flotante cuantizables al uso) |
| Idiomas soportados | no disponible (no hay declaración de idiomas; el modelo no trata texto de forma directa) |
| Licencia | other (la model card no incluye el texto de la licencia) |
| Formato de pesos | joblib (deserialización con `joblib`; requiere que `outcome_router_data` sea importable) |
| Librería declarada | sklearn |
| Tamaño del repositorio | 0.0 GB (según metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |
| Fecha de creación y actualización | 2026-10-03 (creación 16:42:28 UTC, actualización 16:42:30 UTC) |
| Entorno de reentrenamiento | python 3.14.2, scikit-learn 1.9.1, numpy 2.5.3, joblib 1.6.0, lightgbm 4.7.0, scipy 1.18.1 |
| Dataset asociado | `dhresearch/outcome-router-v2-main` |

## Arquitectura y entrenamiento

El objeto pertenece a la misma familia condicionada por ruta que la "domain policy" del estudio, con el modificador `--code-fallback-interfaces function_call`. Ese ajuste implica que, dentro del mecanismo de fallback de nivel de código, la interfaz `stdin_stdout` queda excluida y solo se considera `function_call`. El modelo no se describe como red neuronal profunda: se serializa como un objeto de scikit-learn y su carga exige que el paquete `outcome_router_data` esté importable, lo que sugiere que la clase `RouteConditionedSuccessRouter` y parte de la lógica de preprocesamiento viven en ese paquete y no en el propio fichero.

El reentrenamiento se hizo con semilla 0 sobre el mismo export principal que la política de dominio, el dataset `outcome-router-v2-main`. No se documentan en la ficha el número de tokens, la composición del dataset, ni si hubo RLHF, DPO o cualquier otra fase de ajuste; tampoco se detalla el esquema de características de entrada. La única validación publicada es una comprobación de concordancia contra el fichero congelado `data/real_v2/preds_v2_domain_v2shape.jsonl`: `predicted_route` coincide en 250 de 250 filas de test compartidas (tasa 1.000000) y la coincidencia de fila completa, incluidas probabilidades redondeadas y etiquetas, también es de 250 de 250, sin claves discrepantes. Se trata de un test de reproducibilidad del refit frente a predicciones previas, no de una evaluación independiente.

## Capacidades

- Predicción de ruta: emite `predicted_route` para una petición dada, dentro del esquema de enrutamiento del estudio `outcome-router-v2`.
- Salida probabilística y etiquetada: el modelo produce probabilidades (redondeadas en el fichero de referencia) y etiquetas, lo que permite umbralizar decisiones o auditar el margen de confianza.
- Distinción de interfaces en el fallback de código: con `--code-fallback-interfaces function_call`, el modelo separa `function_call` de `stdin_stdout`, dejando esta última fuera del fallback de nivel de código.
- Reproducibilidad verificada: refit de semilla 0 que reproduce exactamente las predicciones del fichero congelado en las 250 filas compartidas.
- No genera texto, no razona, no escribe código ni realiza matemáticas simbólicas.
- No soporta tool calling ni function calling en el sentido de un LLM; la etiqueta `function_call` es una categoría de interfaz de su espacio de rutas, no una capacidad de invocación de herramientas.
- No soporta agentes, razonamiento multi-paso, visión, audio ni multimodalidad.
- Capacidades multilingües: no disponible; no hay evidencia de procesamiento de lenguaje natural en el artefacto.

## Casos de uso

- Enrutamiento coste/calidad en una pasarela de LLM: el modelo se usaría como componente de decisión que, dada una petición, predice qué ruta o experto debe atenderla, permitiendo derivar cargas a modelos más baratos o más capaces según la política aprendida.
- Auditoría y reproducción de experimentos de enrutamiento: cargando el joblib en un entorno con `outcome_router_data` importable, un equipo puede verificar que su pipeline reproduce las 250 de 250 predicciones del fichero congelado y detectar derivas al cambiar dependencias o versiones de scikit-learn.
- Comparación de variantes de política: al existir una "domain policy" y esta variante `v2shape`, el artefacto sirve para contrastar el efecto de cambiar la forma de la interfaz en las decisiones de enrutamiento, en concreto la exclusión de `stdin_stdout` del fallback de código.
- Enrutamiento de fallback de nivel de código: en un flujo que deba decidir si una tarea de código se resuelve mediante llamada a función o mediante entrada/salida estándar, esta política restringe el fallback a `function_call`, lo que puede usarse para forzar contratos de interfaz más estrictos.
- Investigación sobre "success routing": el nombre de la clase (`RouteConditionedSuccessRouter`) apunta a predecir el éxito esperado de una ruta; el modelo puede emplearse como línea base interna en estudios que correlacionen ruta elegida y resultado.
- Modo economía con downrouting aprendido: la tarjeta servida desactiva `learned_downrouting` y no carga este objeto, pero en un despliegue propio el artefacto podría evaluarse como downrouter aprendido para degradar peticiones a rutas de menor coste.
- Validación de dependencias en CI: incluir la carga y la comprobación de concordancia en un test de integración que falle si el modelo deja de deserializar o si cambian las predicciones tras actualizar scikit-learn, numpy, scipy o lightgbm.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay MMLU, HumanEval, GSM8K ni equivalentes, y no tendrían sentido para un clasificador de rutas. La única métrica publicada es una comprobación de concordancia interna:

| Métrica | Valor | Referencia |
|---|---|---|
| Coincidencia de `predicted_route` en test compartido | 250/250 (tasa 1.000000) | `data/real_v2/preds_v2_domain_v2shape.jsonl` |
| Coincidencia de fila completa (probabilidades redondeadas y etiquetas) | 250/250 | `data/real_v2/preds_v2_domain_v2shape.jsonl` |
| Claves discrepantes | {} (ninguna) | Igual que el punto anterior |
| Benchmarks frente a modelos de terceros | no disponible | No publicados |

## Requisitos de hardware

- Inferencia en CPU: el artefacto es un objeto de scikit-learn/joblib que se ejecuta en CPU; no requiere GPU.
- VRAM: no aplica como tal. La memoria necesaria es la del proceso Python que carga el modelo, y su magnitud exacta es no disponible al no publicarse el tamaño del fichero de pesos (el repositorio reporta 0.0 GB).
- Memoria RAM: no disponible. Para un clasificador tabular de esta familia, el límite práctico suele fijarlo el intérprete de Python y las dependencias, no el modelo, pero no hay cifras publicadas.
- GPU recomendadas: no aplica (no hay ruta de ejecución en GPU documentada).
- Compatibilidad con GPU de consumo: no aplica; no se necesita ninguna GPU, ni siquiera una RTX 4090.
- Opciones de despliegue: carga directa con `joblib` desde Python, con `outcome_router_data` importable. No aplican vLLM, llama.cpp, Ollama, TGI ni servidores de inferencia de LLM, al no ser un modelo generativo.
- Dependencias mínimas documentadas: python 3.14.2, scikit-learn 1.9.1, numpy 2.5.3, joblib 1.6.0, scipy 1.18.1 y lightgbm 4.7.0 en el entorno de reentrenamiento; el rango de compatibilidad real de versiones no se especifica.
- Latencia y throughput: no disponibles. No se publican medidas de latencia por petición ni de peticiones por segundo.

## Comparativa con modelos similares

No se dispone de modelos comparables con datos publicados en la información proporcionada. El resultado de búsqueda más cercano temáticamente es Q-Router, pero resuelve un problema distinto (evaluación de calidad de vídeo con enrutamiento entre modelos expertos mediante VLM) y no comparte tarea, entradas ni métricas, por lo que una comparación numérica no sería válida.

| Modelo | Tarea | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dhresearch/quality-router-v2-domain-v2shape` | Enrutamiento de peticiones (predicción de ruta) | Clasificador scikit-learn/joblib (`RouteConditionedSuccessRouter`) | no aplica | other | HuggingFace, 0 descargas |
| Q-Router | Evaluación de calidad de vídeo con enrutamiento entre expertos | Framework agéntico con VLM como routers | no disponible en la información recogida | no disponible | Paper (arXiv 2510.08789) y OpenReview |
| Enrutadores de propósito general tipo pasarela (por ejemplo, OpenRouter) | Enrutamiento comercial entre modelos de lenguaje | No documentado en la información recogida | no aplica | no disponible | Servicio en producción |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no mantiene conversaciones, no razona y no sirve para ninguna tarea generativa. Cualquier expectativa de ese tipo es un error de categoría.
- El objeto no se carga en la tarjeta servida de `quality_router_v2` v8: es un artefacto de estudio, no el modelo en producción del sistema descrito.
- No es el fichero de pesos original. La model card indica explícitamente que la ejecución original no guardó pesos y que esta subida es un refit de semilla 0, por lo que puede no ser idéntica al modelo que generó las predicciones de referencia.
- La única evidencia de calidad es una coincidencia 250/250 con un fichero de predicciones congelado del propio estudio. No hay evaluación con datos independientes, ni validación cruzada publicada, ni comparación con líneas base externas.
- Riesgo de deserialización: cargar un artefacto joblib implica ejecutar código Python arbitrario contenido en el fichero. Solo debe hacerse con archivos de confianza y en entornos aislados.
- Dependencia de importación: la carga requiere que `outcome_router_data` sea importable. Si ese paquete no está disponible o cambia su API, la deserialización puede fallar.
- Deriva por versiones: el refit se hizo con versiones muy concretas (scikit-learn 1.9.1, numpy 2.5.3, scipy 1.18.1, joblib 1.6.0, lightgbm 4.7.0). Cambios de versión pueden alterar predicciones o impedir la carga.
- Licencia "other" sin texto publicado: no se puede confirmar si el uso comercial está permitido. Es imprescindible contactar con el autor antes de cualquier uso en producción.
- Sesgos: no disponibles. Dependen del dataset `outcome-router-v2-main`, cuya composición, tamaño y proceso de recogida no se documentan en la ficha.
- Metadatos incompletos: no hay pipeline declarado, no hay idiomas declarados, no hay recuento de parámetros y el tamaño de repositorio reportado es 0.0 GB, lo que dificulta estimar el coste de despliegue.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay issues, discusiones ni terceros que hayan reproducido el resultado.
- Ámbito de aplicación estrecho: el modelo está atado a un esquema de rutas y a una convención de interfaces (`function_call` frente a `stdin_stdout`) definidos en su estudio. Fuera de ese contexto, sus etiquetas carecen de significado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dhresearch/quality-router-v2-domain-v2shape
- Dataset asociado: https://huggingface.co/datasets/dhresearch/outcome-router-v2-main
- Q-Router, paper en arXiv (enrutamiento entre modelos expertos para calidad de vídeo, relación temática pero no comparable): https://arxiv.org/html/2510.08789v1
- Q-Router en OpenReview: https://openreview.net/forum?id=udq2BMdIFi
- OpenRouter (pasarela comercial de enrutamiento entre modelos, no relacionada directamente con este artefacto): https://openrouter.ai/
- Modelos gratuitos en OpenRouter (no relacionado directamente con este artefacto): https://openrouter.ai/collections/free-models
- Cobertura de Gemini 4 Argon (no relacionada con este artefacto): https://www.cnbc.com/2026/09/30/google-gemini-4-argon-ai.html
- Paper o blog específico de `quality_router_v2`: no disponible
- Repositorio de código de `outcome_router_data`: no disponible
