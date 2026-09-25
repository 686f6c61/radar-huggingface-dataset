# baharedorsa/laya

## Resumen

Laya es un modelo de decisión «System 1», multilingüe y no autoregresivo, publicado por el usuario baharedorsa, con el ecosistema de librería y documentación mantenido en el repositorio GitHub de NandhaKishorM y en la organización convaiinnovations. No genera texto: recibe un estado (texto, correo, ticket o JSON) junto con preguntas tipadas y devuelve respuestas también tipadas —elección entre opciones, puntuación sobre una escala o probabilidad de sí/no— en una única pasada hacia delante de aproximadamente 33 ms.

Su rasgo diferencial es la calibración. Se entrenó con aprendizaje por refuerzo contra reglas de puntuación estrictamente propias (RLCD), de forma que la única manera de maximizar la recompensa es reportar probabilidades honestas. Al no producir lenguaje natural no hay salida que parsear ni texto que alucinar, lo que lo orienta a enrutado, clasificación, guardrails y moderación.

El checkpoint de este repositorio tiene 421.293.830 parámetros (~421 M), licencia Apache 2.0 con etiqueta de uso comercial y pipeline de text-classification, con pesos en safetensors y 2,4 GB de repositorio. La familia incluye variantes inglesa y multilingüe; esta última admite hasta 8.192 tokens con `max_len=8192` (1.024 por defecto), con una latencia de unos 1,7 s para una entrada de 4.000 tokens en GPU de Apple.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No autoregresiva de decisión (System 1); la model card no detalla la arquitectura interna. Librería `transformers` |
| Parámetros totales | 421.293.830 (~421 M), dato real de safetensors |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 1.024 tokens por defecto en `laya-multilingual`; ampliable a 8.192 con `max_len=8192` |
| Tipos de cuantización | No disponible. Se documentan una ruta ONNX (`laya[onnx]`) y una ruta rápida TileLang en GPU (`laya[fast]`), pero no un catálogo de cuantizaciones |
| Idiomas soportados | 100+ idiomas según la model card; el campo de idiomas de HuggingFace no los detalla («no disponibles») |
| Licencia | Apache 2.0 (etiqueta `commercial-use`) |
| Formato de pesos | safetensors; exportación ONNX disponible como extra |
| Pipeline | text-classification |
| Tipos de pregunta | `choice`, `score`, `noul` (probabilidad de sí/no) |
| Tamaño del repositorio | 2,4 GB |
| Autor y fecha | baharedorsa; creado y actualizado el 2026-09-25 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Laya es un modelo no autoregresivo: no decodifica tokens de texto, sino que resuelve en una sola pasada un conjunto de preguntas tipadas sobre un estado de entrada. Los tipos documentados son `choice` (elegir entre opciones con criterios definidos por el usuario), `score` (puntuación sobre una escala con criterios) y `noul` (probabilidad de que la respuesta sea afirmativa). El componente `Router` detecta la escritura y el idioma de la entrada y la envía al checkpoint correspondiente (`english` o `multilingual`), y puede precargar los tres checkpoints con `Router(preload=True)`.

El entrenamiento se basa en aprendizaje por refuerzo contra reglas de puntuación estrictamente propias (RLCD), lo que fuerza a que las probabilidades estén calibradas: sobreestimar o subestimar la confianza reduce la recompensa. La información disponible no especifica el número de tokens de entrenamiento ni la composición del dataset. Sí se documenta un bucle de ajuste fino sobre decisiones del propio dominio: el checkpoint `laya-typed-decisions`, entrenado con un notebook que funciona en 2x T4 gratuitas de Kaggle, eleva la precisión de 0,362 a 0,766 en el banco de decisiones tipadas. La versión 0.3.20 de la librería no modifica los checkpoints, solo el entorno de ejecución (documentos largos con `max_len=8192`, ruta rápida TileLang más robusta, retorno a CPU tras un error de memoria en CUDA y mejoras del servidor y de `ONNXAgent`).

## Capacidades

- Clasificación y enrutado de texto: asigna un estado a una categoría definida por el usuario (por ejemplo, facturación, técnico u otros).
- Puntuación ordinal: devuelve un valor dentro de una escala con criterios explícitos (por ejemplo, «no urgente», «pronto», «bloqueante»).
- Preguntas de sí/no con probabilidad: el tipo `noul` devuelve la probabilidad de que la respuesta sea afirmativa, útil para riesgo de abandono o evaluación de condiciones.
- Entrada estructurada: el estado puede ser texto, correo, ticket o JSON.
- Multilingüe: la model card afirma soporte de más de 100 idiomas, con enrutado automático por detección de escritura e idioma.
- Documentos largos: hasta 8.192 tokens en `laya-multilingual`, pasando `max_len=8192` de forma explícita.
- Sin generación de texto: no hay salida en lenguaje natural que parsear.
- Integraciones: servidor HTTP (`laya[serve]`), servidor MCP (`laya[mcp]`), LangChain y LangGraph (`laya[langchain]`), ONNX Runtime (`laya[onnx]`) y ruta rápida TileLang en GPU (`laya[fast]`).
- Ganchos de predicción y decisiones guiadas por esquema, según la documentación del proyecto.
- Ajuste fino: bucle completo documentado (construcción del dataset, entrenamiento, ajuste de temperaturas de calibración y evaluación).
- No se documenta soporte de tool calling ni de function calling en la información disponible.

## Casos de uso

- Enrutado de tickets de soporte: dado un ticket como estado, se define una pregunta `choice` con criterios por departamento y el modelo devuelve la categoría con una probabilidad asociada, lo que permite derivar automáticamente y marcar para revisión humana los casos de baja confianza.
- Moderación y guardrails: con una pregunta `noul` («¿el mensaje contiene una amenaza?») el modelo devuelve una probabilidad calibrada que puede usarse como umbral configurable antes de publicar contenido o de invocar un modelo generativo.
- Predicción de abandono de clientes: a partir de un correo o una transcripción, una pregunta `noul` sobre la intención de cancelar y una pregunta `score` de urgencia producen señales cuantitativas para el equipo de retención sin necesidad de generar texto.
- Triaje de correo entrante en formato JSON: el estado puede ser un objeto JSON con campos de remitente, asunto y cuerpo, y las preguntas tipadas devuelven etiquetas listas para insertar en un sistema de ticketing.
- Análisis de documentos largos multilingües: con `max_len=8192` puede clasificar contratos, informes o expedientes de hasta ~8.000 tokens, útil para extraer decisiones binarias (por ejemplo, «¿existe cláusula de renovación automática?») sin un LLM generativo.
- Nodos de decisión en flujos LangGraph: su integración con LangChain y LangGraph permite usar Laya como nodo determinista que decide la siguiente rama del grafo a partir del estado de la conversación.
- Prefiltro antes de un LLM grande: clasificar y puntuar la petición con Laya (decenas de milisegundos) y reservar el modelo generativo para los casos que realmente lo requieran, reduciendo coste y latencia del pipeline.
- Análisis multilingüe de feedback de producto: procesar reseñas o comentarios en más de 100 idiomas con las mismas preguntas tipadas, obteniendo una escala comparable entre mercados.

## Benchmarks y rendimiento

| Banco | Modelo | Métrica | Resultado |
|---|---|---|---|
| Decisiones tipadas (2.000 decisiones, cuatro flujos) | `laya-typed-decisions` (ajustado) | Precisión | 0,766 |
| Decisiones tipadas (2.000 decisiones, cuatro flujos) | Checkpoint base `english` | Precisión | 0,362 |
| Documentos largos, `laya-multilingual`, 20 peticiones con hasta ~4.000 tokens de contexto | `laya-multilingual` | Respuestas correctas | 16-18 de 20 |
| Documentos largos, `laya-multilingual`, 20 peticiones más allá de ~4.000 tokens | `laya-multilingual` | Respuestas correctas | 8-17 de 20 |

Datos de latencia declarados: unos 33 ms por pasada hacia delante según la model card (21 ms según una de las fuentes web consultadas) y aproximadamente 1,7 s para una entrada de 4.000 tokens en GPU de Apple. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Estimación de VRAM a partir del número de parámetros (421 M), sin incluir sobrecarga del runtime: ~1,7 GB en fp32, ~0,85 GB en fp16/bf16, ~0,42 GB en int8 y ~0,21 GB en int4. Son cálculos aritméticos, no cifras publicadas por el autor.
- Cabe holgadamente en GPU de consumo: cualquier tarjeta con 4 GB o más de VRAM es suficiente para inferencia en precisión reducida; una RTX 3060 de 12 GB o una RTX 4090 lo ejecutan con margen amplio.
- Se documenta ejecución en GPU de Apple (unos 1,7 s para 4.000 tokens) y retorno a CPU tras un error de memoria en CUDA, por lo que la inferencia en CPU es una vía soportada.
- Ajuste fino: el notebook oficial se ejecuta en 2x T4 gratuitas de Kaggle, lo que sitúa el entrenamiento en el rango de GPU de gama media.
- Opciones de despliegue documentadas: instalación vía `pip install laya` (Python 3.10 o superior), servidor HTTP con `laya[serve]`, servidor MCP con `laya[mcp]`, ONNX Runtime con `laya[onnx]`, ruta rápida TileLang en GPU con `laya[fast]` y uso como componente de LangChain y LangGraph.
- vLLM, llama.cpp, Ollama y TGI no aparecen documentados en la información disponible.
- Throughput: no disponible. La latencia declarada depende de la longitud real de la entrada, no del límite configurado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Latencia declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Laya (`baharedorsa/laya`) | 421 M | 1.024, ampliable a 8.192 | ~33 ms por pasada | Apache 2.0 | HuggingFace, `pip install laya`, GitHub |
| TypeSafe Jev | No disponible | No disponible | No disponible | No disponible | No disponible |
| `convaiinnovations/laya` | No disponible en la información consultada | No disponible | No disponible | No disponible | HuggingFace |

La única alternativa nombrada explícitamente en las fuentes es TypeSafe Jev, presentada como el producto al que Laya pretende sustituir en local. No se dispone de parámetros, contexto, licencia ni resultados de benchmarks de Jev en la información proporcionada, por lo que no es posible una comparación cuantitativa.

## Limitaciones y advertencias

- El repositorio acumula 0 descargas y 0 likes y fue creado el 2026-09-25, por lo que carece de validación externa y de historial de uso en producción.
- Existe una discrepancia de atribución: el repositorio analizado es `baharedorsa/laya`, mientras que la model card, la documentación y los sitios web remiten a `convaiinnovations/laya` y al GitHub de NandhaKishorM. Conviene verificar qué repositorio recibe mantenimiento antes de fijar una dependencia.
- No genera texto: cualquier tarea que requiera redacción, resumen o diálogo abierto queda fuera de su alcance.
- Las afirmaciones de calibración y las cifras de precisión son autoinformadas por el autor y se miden sobre sus propios flujos de trabajo; pueden no transferirse a datos de otro dominio.
- La precisión zero-shot del checkpoint base inglés en el banco de decisiones tipadas es de 0,362, bastante baja. La model card indica explícitamente que el ajuste fino sobre decisiones del dominio propio es donde se gana precisión.
- El límite por defecto de `laya-multilingual` es de 1.024 tokens y trunca documentos largos; hay que pasar `max_len=8192` de forma explícita. Incluso así, más allá de unos 4.000 tokens la precisión cae (8-17 aciertos de 20 frente a 16-18 por debajo de ese umbral).
- El texto mayoritariamente en inglés pero largo puede enrutarse al checkpoint inglés; para forzar el multilingüe hay que indicar `model="multilingual"`.
- El modelo no produce texto, pero sí puede equivocarse con alta confianza fuera de su distribución. Las probabilidades devueltas deben validarse con datos propios antes de usarlas como umbral automático.
- La licencia Apache 2.0 permite uso comercial, pero no se documentan en esta información los sesgos por idioma o dominio, ni los términos de los checkpoints dependientes.
- El campo de idiomas de HuggingFace está vacío; la cifra de «100+ idiomas» procede únicamente de la model card.

## Enlaces

- Repositorio analizado en HuggingFace: https://huggingface.co/baharedorsa/laya
- Repositorio de la organización convaiinnovations: https://huggingface.co/convaiinnovations/laya
- Checkpoint ajustado `laya-typed-decisions`: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Repositorio GitHub del proyecto: https://github.com/NandhaKishorM/laya
- Documentación: https://nandhakishorm.github.io/laya/
- Referencia de la API: https://nandhakishorm.github.io/laya/reference/
- Guía de ganchos de predicción: https://nandhakishorm.github.io/laya/hooks/
- Decisiones guiadas por esquema: https://nandhakishorm.github.io/laya/structured/
- Guía de Docker: https://nandhakishorm.github.io/laya/docker/
- Guía de LangChain y LangGraph: https://nandhakishorm.github.io/laya/langchain/
- Script de evaluación en contexto largo: https://github.com/NandhaKishorM/laya/blob/main/research/scripts/bench_long_context.py
- Notebook de ajuste fino en 2x T4: https://github.com/NandhaKishorM/laya/blob/main/notebooks/laya_finetune_typed_decisions_2xT4_kaggle.ipynb
- Sitio oficial del proyecto: https://laya.convaiinnovations.com/
- Análisis comparativo con TypeSafe Jev: https://brainfunctioncollapse.com/laya
- Portal alternativo: https://laya-ai.com/
