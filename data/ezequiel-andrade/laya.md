# ezequiel-andrade/laya

## Resumen

Laya es un modelo de clasificación de texto no autorregresivo desarrollado por el usuario de Hugging Face ezequiel-andrade (con documentación y repositorio asociados a NandhaKishorM). Su propósito no es generar texto, sino responder a preguntas tipadas sobre un estado de entrada (texto, correo, ticket o JSON) devolviendo respuestas tipadas con probabilidades calibradas en un único pase forward. Se presenta como un modelo "System 1" de decisión, orientado a enrutamiento, scoring y guardrails.

El modelo emplea una arquitectura transformer con aproximadamente 421 millones de parámetros y se distribuye en formato safetensors bajo licencia Apache 2.0, lo que permite uso comercial. Según la model card, está entrenado con aprendizaje por refuerzo contra reglas de scoring estrictamente propias (RLCD), de modo que la única forma de maximizar la recompensa es reportar probabilidades honestas. Soporta más de 100 idiomas mediante un checkpoint multilingüe y un enrutador que detecta el idioma y la escritura.

Su relevancia radica en que evita la generación de texto libre: al no producir tokens de salida, no hay nada que parsear ni margen para alucinaciones en el sentido generativo. Está pensado para integrarse en pipelines de decisión donde se necesita una clasificación rápida (unos 33 ms por pase) con confianza calibrada, como moderación, enrutamiento de tickets o guardrails.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer no autorregresivo (System 1 decision model) |
| Parámetros totales | 421.293.830 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens por defecto; hasta 8.192 tokens con `max_len=8192` en `laya-multilingual` |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Más de 100 idiomas (checkpoint multilingüe con enrutador por script/idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

Laya es un transformer no autorregresivo que recibe un estado y un conjunto de preguntas tipadas, y devuelve respuestas tipadas en un solo pase forward. El pipeline declarado es `text-classification`, y las preguntas admiten tipos como `choice` (elección entre criterios), `score` (puntuación ordinal) y `noul` (probabilidad de que la respuesta sea afirmativa). El modelo no genera texto, por lo que la salida es estructurada por diseño.

El entrenamiento se basa en aprendizaje por refuerzo contra reglas de scoring estrictamente propias (RLCD, según la model card), de forma que reportar probabilidades honestas es la única estrategia que maximiza la recompensa. La model card menciona además un proceso de calibración de temperaturas tras el fine-tuning. El número de tokens de entrenamiento y la composición exacta del dataset no están disponibles en la información proporcionada.

## Capacidades

- Clasificación de texto y decisión tipada sobre estados de entrada (texto, correo, ticket, JSON).
- Respuestas tipadas con probabilidades calibradas: elección (`choice`), puntuación (`score`) y probabilidad afirmativa (`noul`).
- Enrutamiento automático por idioma y script hacia el checkpoint adecuado (inglés o multilingüe).
- Soporte multilingüe de más de 100 idiomas.
- Procesamiento de documentos largos de hasta 8.192 tokens con `max_len=8192` en el checkpoint multilingüe.
- Integración con servidor HTTP (`laya[serve]`), servidor MCP (`laya[mcp]`), LangChain y LangGraph (`laya[langchain]`), ONNX Runtime (`laya[onnx]`) y ruta rápida GPU con TileLang (`laya[fast]`).
- No genera texto: no hay parsing de salida ni alucinación generativa.
- No se documentan capacidades de tool calling, agentes autónomos, visión ni audio en la información disponible.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de un ticket, el modelo clasifica el departamento (`billing`, `technical`, `other`) con probabilidad calibrada, lo que permite derivar automáticamente a la cola correcta y priorizar por confianza.
- Moderación y guardrails: clasificación de contenido con probabilidades honestas para decidir si un texto infringe políticas, aprovechando que la calibración permite fijar umbrales de riesgo de forma matemática.
- Scoring de urgencia: asignación de una puntuación ordinal (`not urgent`, `soon`, `blocking`) a correos o mensajes entrantes para priorizar la cola de atención.
- Predicción de churn: uso del tipo `noul` para estimar la probabilidad de que un cliente amenace con cancelar o abandonar el servicio, a partir de correos o transcripciones.
- Clasificación multilingüe en producción: el enrutador detecta el idioma y la escritura, de modo que el mismo pipeline atiende textos en hindi, español o inglés sin lógica adicional.
- Análisis de documentos largos: con `max_len=8192`, el checkpoint multilingüe puede clasificar contratos, informes o hilos de conversación extensos, aunque la model card advierte que la precisión varía más allá de unos 4.000 tokens.
- Integración en agentes con LangChain/LangGraph: el modelo puede actuar como nodo de decisión tipada dentro de un grafo de agentes, aportando clasificaciones calibradas en lugar de generación libre.
- Despliegue como servidor MCP o HTTP: exposición de decisiones tipadas a otros sistemas mediante `laya-serve` o el servidor MCP.

## Benchmarks y rendimiento

La model card reporta resultados del benchmark de decisiones tipadas (2.000 decisiones en cuatro flujos de trabajo):

| Modelo | Precisión en typed-decisions |
|---|---|
| `laya-typed-decisions` (fine-tuned) | 0,766 |
| Checkpoint base en inglés | 0,362 |

Sobre documentos largos, la model card indica que entre 16 y 18 de 20 solicitudes se respondieron correctamente con hasta unos 4.000 tokens de texto previo; más allá de esa longitud los resultados varían (8 a 17 de 20). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 421 millones de parámetros en safetensors, el peso en fp32 ronda los 1,7 GB y en fp16 unos 0,85 GB, aunque la model card no publica cifras de VRAM.
- GPU recomendadas: no disponible. La model card menciona una ruta rápida GPU con TileLang (`laya[fast]`) y un notebook de fine-tuning sobre 2x T4 de Kaggle.
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada; el tamaño del modelo sugiere que cabría en GPU de consumo, pero no hay dato oficial.
- Opciones de despliegue: `laya-serve` (servidor HTTP), servidor MCP, ONNX Runtime (`laya[onnx]`), integración con LangChain y LangGraph.
- Latencia: aproximadamente 33 ms por pase forward según la model card; un documento de 4.000 tokens tarda unos 1,7 s en una GPU de Apple. El throughput no está disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. La model card únicamente compara el checkpoint base en inglés (0,362) con el checkpoint fine-tuned `laya-typed-decisions` (0,766) en el benchmark de decisiones tipadas.

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Laya | 421 M | 1.024 / 8.192 tokens | Apache 2.0 | Clasificación no autorregresiva con probabilidades calibradas |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El modelo no genera texto; no sirve para tareas de generación, resumen o diálogo abierto.
- La precisión en documentos largos decae más allá de unos 4.000 tokens: la model card reporta entre 8 y 17 aciertos de 20 en ese régimen.
- El límite por defecto es de 1.024 tokens; es necesario pasar `max_len=8192` para documentos largos, y en ese caso debe nombrarse explícitamente el checkpoint multilingüe para evitar que textos largos mayoritariamente en inglés se enruten al checkpoint inglés.
- Los checkpoints publicados funcionan zero-shot con precisión limitada (0,362 en el benchmark de decisiones tipadas); la model card recomienda fine-tuning sobre datos del dominio propio para alcanzar precisiones útiles (0,766 en el checkpoint fine-tuned).
- No se documentan sesgos conocidos ni evaluación de sesgos en la información disponible.
- El riesgo de alucinación generativa es bajo por diseño al no producir texto libre, pero las probabilidades calibradas deben validarse en el dominio de despliegue.
- La licencia Apache 2.0 permite uso comercial, pero no se detallan restricciones adicionales más allá de las de dicha licencia.
- La información sobre idiomas soportados no está disponible como lista cerrada; la model card afirma más de 100 idiomas sin enumerarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ezequiel-andrade/laya
- Checkpoint fine-tuned: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Repositorio GitHub: https://github.com/NandhaKishorM/laya
- Documentación: https://nandhakishorm.github.io/laya/
- Guía de hooks: https://nandhakishorm.github.io/laya/hooks/
- Decisiones guiadas por esquema: https://nandhakishorm.github.io/laya/structured/
- Docker: https://nandhakishorm.github.io/laya/docker/
- LangChain y LangGraph: https://nandhakishorm.github.io/laya/langchain/
- Referencia de API: https://nandhakishorm.github.io/laya/reference/
- Script de benchmark de contexto largo: https://github.com/NandhaKishorM/laya/blob/main/research/scripts/bench_long_context.py
- Notebook de fine-tuning: https://github.com/NandhaKishorM/laya/blob/main/notebooks/laya_finetune_typed_decisions_2xT4_kaggle.ipynb
