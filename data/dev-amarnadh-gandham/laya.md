# dev-amarnadh-gandham/laya

## Resumen

Laya es un modelo de clasificación de texto no autorregresivo desarrollado por dev-amarnadh-gandham y publicado en HuggingFace como `dev-amarnadh-gandham/laya`. Su planteamiento es el de un "System 1 decision model": recibe un estado (texto, correo, ticket o JSON) junto con preguntas tipadas y devuelve respuestas tipadas con probabilidades calibradas en una única pasada forward, sin generar texto libre. El peso real del repositorio es de 421.293.830 parámetros (2,4 GB) y la arquitectura es de tipo transformer no autorregresivo orientado a clasificación y scoring.

El modelo está pensado para sustituir a los LLM en tareas de decisión estructurada como enrutado, moderación, guardrails o puntuación de riesgo, donde la latencia y el coste de generar tokens son un problema. Según su model card, resuelve una decisión en aproximadamente 33 ms por pasada y soporta más de 100 idiomas gracias al enrutado automático entre checkpoints (inglés y multilingüe). Al no generar texto, el autor argumenta que no hay nada que parsear ni margen para alucinación en la salida.

Su relevancia actual radica en el entrenamiento con aprendizaje por refuerzo contra reglas de puntuación estrictamente propias (RLCD), un enfoque que penaliza la sobreconfianza y empuja al modelo a reportar probabilidades honestas. La versión de runtime 0.3.20 añade soporte de documentos largos de hasta 8.192 tokens en el checkpoint multilingüe, servidor HTTP, servidor MCP, integración con LangChain/LangGraph, exportación a ONNX y una ruta rápida en GPU basada en TileLang.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer no autorregresivo orientado a clasificación (System 1 decision model) |
| Parámetros totales | 421.293.830 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens por defecto; hasta 8.192 tokens con `max_len=8192` en `laya-multilingual` |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Más de 100 idiomas según la model card; campo de idiomas de la ficha de HuggingFace no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |
| Pipeline | text-classification |
| Tamaño del repositorio | 2,4 GB |
| Fecha de publicación | 2026-10-06 |

## Arquitectura y entrenamiento

La arquitectura es un transformer no autorregresivo: no decodifica tokens de forma secuencial, sino que produce directamente respuestas tipadas a partir del estado de entrada y un conjunto de preguntas. Cada pregunta se define con un tipo (`choice`, `score`, `noul`) y unos criterios o etiquetas, de modo que la salida es una selección entre opciones, una puntuación o una probabilidad de sí/no. La model card no detalla el número de capas, dimensión oculta ni el tokenizador exacto, por lo que esos datos quedan como no disponibles.

El entrenamiento se basa en aprendizaje por refuerzo contra reglas de puntuación estrictamente propias (RLCD, reinforcement learning con calibrated decisions). El principio es que la única forma de maximizar la recompensa es reportar probabilidades honestas, lo que actúa como mecanismo de calibración incorporado. La model card no especifica el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases adicionales de ajuste supervisado.

Como innovación destacable, el sistema incluye un `Router` que detecta el script y el idioma de la entrada y deriva el texto no inglés al checkpoint `laya-multilingual`. El autor publica además un checkpoint afinado, `laya-typed-decisions`, que sobre el benchmark de decisiones tipadas (2.000 decisiones en cuatro flujos de trabajo) alcanza 0,766 de accuracy frente a 0,362 del checkpoint base en inglés. Se documenta también una ruta rápida en GPU (TileLang) con gestión de errores de memoria CUDA y fallback a CPU.

## Capacidades

- Decisión y clasificación no generativa: devuelve respuestas tipadas (elección entre opciones, puntuación y probabilidad de sí/no) sin producir texto libre.
- Probabilidades calibradas por diseño: el entrenamiento con RLCD está orientado a que la probabilidad reportada sea fiable.
- Multilingüe: más de 100 idiomas con enrutado automático al checkpoint `multilingual` según el script y el idioma detectados.
- Procesamiento de documentos largos: hasta 8.192 tokens con `max_len=8192` en el checkpoint multilingüe.
- Entrada estructurada: acepta texto plano, correos, tickets o JSON como estado.
- Preguntas tipadas y dirigidas: definición de criterios por pregunta para enrutado por departamento, urgencia, riesgo de churn y casos análogos.
- Integraciones de despliegue: servidor HTTP (`laya[serve]`), servidor MCP (`laya[mcp]`), LangChain y LangGraph (`laya[langchain]`), ONNX Runtime (`laya[onnx]`) y ruta rápida GPU (`laya[fast]`).
- Tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles; el modelo aplica System 1, es decir, decisión en una sola pasada.
- Visión, audio y modo thinking: no disponibles.

## Casos de uso

- Enrutado de tickets de soporte: el modelo recibe el texto del ticket como estado y una pregunta `choice` con criterios por departamento (facturación, técnico, otros), devolviendo la etiqueta y su probabilidad en una sola pasada, lo que permite derivar el caso sin coste de generación.
- Moderación y guardrails en tiempo real: con preguntas `noul` (sí/no) sobre contenido prohibido, el modelo actúa como filtro previo o posterior a un LLM generativo, con latencias del orden de decenas de milisegundos que encajan en pipelines síncronos.
- Priorización por urgencia: mediante preguntas de tipo `score` con criterios graduados (no urgente, pronto, bloqueante), se puede ordenar una cola de incidencias sin recurrir a un LLM generativo.
- Predicción de riesgo de churn: sobre correos o mensajes de cliente, una pregunta `noul` sobre amenaza de cancelación devuelve una probabilidad que puede alimentar un sistema de alertas comerciales.
- Clasificación de documentos largos multilingües: con `max_len=8192` y el checkpoint `multilingual`, se pueden etiquetar contratos, informes o hilos de correo extensos en cualquiera de los más de 100 idiomas soportados; el autor advierte de que la precisión se degrada más allá de unos 4.000 tokens y recomienda validar sobre datos propios.
- Extracción de decisiones en formato estructurado: definiendo preguntas tipadas sobre un JSON de entrada, se obtienen respuestas normalizadas que pueden insertarse directamente en una base de datos o en un flujo de orquestación, sin parseo de texto libre.
- Automatización de triaje en atención al cliente: combinando varias preguntas (departamento, urgencia, riesgo) en la misma llamada, se obtiene un vector de decisiones coherente para enrutar la conversación antes de invocar un modelo generativo.
- Evaluación de confianza en pipelines de IA: al devolver probabilidades calibradas, el modelo puede usarse como capa de verificación que decide si una respuesta de otro sistema requiere revisión humana.

## Benchmarks y rendimiento

Los únicos datos cuantitativos publicados en la información disponible son los siguientes:

| Evaluación | Resultado |
|---|---|
| Benchmark de decisiones tipadas (2.000 decisiones, cuatro flujos), checkpoint `laya-typed-decisions` | 0,766 de accuracy |
| Benchmark de decisiones tipadas, checkpoint base en inglés | 0,362 de accuracy |
| Latencia por decisión (pasada única) | ~33 ms |
| Documentos largos (`laya-multilingual`, hasta ~4.000 tokens) | 16 a 18 aciertos de 20 solicitudes |
| Documentos largos (más allá de ~4.000 tokens) | 8 a 17 aciertos de 20 solicitudes |
| Entrada de 4.000 tokens en GPU de Apple | ~1,7 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible, lo que es coherente con un modelo de clasificación no generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 421,3 millones de parámetros, los pesos ocupan aproximadamente 1,69 GB en FP32, 0,84 GB en FP16/BF16 y 0,42 GB en INT8, sin contar activaciones. El repositorio completo ocupa 2,4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en FP16 con contexto corto. Para lotes grandes o contexto de 8.192 tokens conviene disponer de 8 GB o más.
- GPU de consumo: sí, cabe holgadamente en tarjetas de gama media y alta (RTX 3060, RTX 4070, RTX 4090, entre otras) e incluso en iGPU con memoria unificada; la model card cita mediciones sobre GPU de Apple.
- Fine-tuning: la model card documenta un cuaderno que ejecuta el ciclo completo (construcción del dataset, entrenamiento, calibración de temperaturas y evaluación) sobre 2x T4 gratuitas de Kaggle, lo que indica que el ajuste cabe en GPUs de 16 GB por unidad.
- Opciones de despliegue: runtime `laya` vía pip, servidor HTTP con `laya-serve` (`laya[serve]`), servidor MCP (`laya[mcp]`), integración con LangChain y LangGraph (`laya[langchain]`), ONNX Runtime (`laya[onnx]`) y ruta rápida GPU con TileLang (`laya[fast]`). Compatible con `transformers` y con endpoints de HuggingFace (tag `endpoints_compatible`).
- Latencia y throughput: ~33 ms por decisión en pasada única; una entrada de 4.000 tokens tarda alrededor de 1,7 s en GPU de Apple. El resto de cifras de throughput no están disponibles.

## Comparativa con modelos similares

No se dispone de comparativas oficiales publicadas para Laya en la información proporcionada. A continuación se ofrece una comparación funcional con alternativas habituales para tareas de clasificación y enrutado; los datos de rendimiento de esas alternativas no están verificados en esta ficha y deben contrastarse con sus propias model cards.

| Modelo | Enfoque | Parámetros | Contexto | Licencia | Comentario |
|---|---|---|---|---|---|
| Laya (`dev-amarnadh-gandham/laya`) | Clasificación no autorregresiva con preguntas tipadas y probabilidades calibradas | 421,3 M | 1.024 por defecto, hasta 8.192 | Apache 2.0 | Diseñado para decisión en una pasada, sin generación |
| Modelos de zero-shot classification tipo BART-large-MNLI | Clasificación por inferencia de entailment | ~407 M (dato externo, no verificado) | ~1.024 tokens | MIT (dato externo, no verificado) | No usa preguntas tipadas ni devuelve probabilidades calibradas por RL |
| Modelos de zero-shot classification basados en DeBERTa-v3 | Clasificación por entailment | ~435 M (dato externo, no verificado) | ~512 a 1.024 tokens | MIT (dato externo, no verificado) | Sin soporte nativo de preguntas `score` ni de enrutado multilingüe a 100+ idiomas |
| Enrutado con LLM generativo (por ejemplo, un modelo de chat de tamaño pequeño o medio) | Generación de texto seguida de parseo | Variable | Variable | Variable | Mayor latencia y riesgo de formato inconsistente, a cambio de mayor flexibilidad |

La ventaja diferencial de Laya que se deduce de la model card es la combinación de inferencia en una sola pasada, salida tipada sin parseo y probabilidades calibradas. La comparación cuantitativa de precisión frente a estas alternativas queda como no disponible.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, por lo que no sirve para resúmenes, redacción, traducción ni diálogo abierto.
- Ámbito limitado a decisiones: su salida se restringe a los tipos `choice`, `score` y `noul` definidos por las preguntas que se le pasan.
- Precisión zero-shot moderada: el checkpoint base en inglés obtiene 0,362 de accuracy en el benchmark de decisiones tipadas, frente a 0,766 del checkpoint afinado. El autor recomienda afinar sobre datos propios del dominio, donde está el salto real de precisión.
- Degradación con documentos largos: por encima de unos 4.000 tokens la tasa de acierto cae de 16-18 sobre 20 a 8-17 sobre 20, según la propia model card. Se recomienda validar sobre datos propios.
- Límite de contexto por defecto: si no se pasa `max_len=8192`, el límite es de 1.024 tokens y los documentos largos se truncan.
- Enrutado de idioma: textos largos mayoritariamente en inglés deben forzar el checkpoint con `model="multilingual"`, ya que de lo contrario se enrutan al checkpoint inglés.
- Calibración dependiente del ajuste: el pipeline de fine-tuning incluye un paso explícito de ajuste de temperaturas de calibración, lo que implica que la calibración de las probabilidades puede perderse si se entrena sin replicar ese paso.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad ni comportamiento diferencial por idioma en la información disponible.
- Idiomas: aunque la model card afirma soporte de más de 100 idiomas, no se publican métricas por idioma, por lo que el rendimiento fuera del inglés no está cuantificado.
- Adopción muy baja: el repositorio registra 12 descargas y 0 likes en el momento de la consulta, con lo que la validación por parte de la comunidad es todavía muy limitada.
- Licencia Apache 2.0: permite uso comercial y modificación, siempre que se conserven los avisos de copyright y licencia; no se han declarado restricciones adicionales de uso.
- Madurez del proyecto: la versión del runtime citada es la 0.3.20, con correcciones recientes en la ruta rápida (fallback tras errores de memoria CUDA, condiciones de carrera en buffers de grafos CUDA) y en el servidor, lo que sugiere que conviene fijar versiones en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dev-amarnadh-gandham/laya
- Repositorio GitHub: https://github.com/NandhaKishorM/laya
- Documentación: https://nandhakishorm.github.io/laya/
- Referencia de API: https://nandhakishorm.github.io/laya/reference/
- Guía de hooks de predicción: https://nandhakishorm.github.io/laya/hooks/
- Guía de decisiones guiadas por esquema: https://nandhakishorm.github.io/laya/structured/
- Guía de Docker: https://nandhakishorm.github.io/laya/docker/
- Guía de LangChain y LangGraph: https://nandhakishorm.github.io/laya/langchain/
- Checkpoint afinado de referencia: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Cuaderno de fine-tuning en 2x T4 de Kaggle: https://github.com/NandhaKishorM/laya/blob/main/notebooks/laya_finetune_typed_decisions_2xT4_kaggle.ipynb
- Script de benchmark de contexto largo: https://github.com/NandhaKishorM/laya/blob/main/research/scripts/bench_long_context.py
- Instrucciones de instalación por plataforma: https://github.com/NandhaKishorM/laya#installation-details
- Sección de fine-tuning del README: https://github.com/NandhaKishorM/laya#fine-tuning
