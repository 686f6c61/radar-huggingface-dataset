# newsbang/adjudex-0.8b

## Resumen

Adjudex 0.8B es un motor de decisión tipado de 0,8 mil millones de parámetros desarrollado por newsbang. A diferencia de un modelo generativo convencional, recibe un `state` y un conjunto de `questions` tipadas de opción múltiple (hasta 255 opciones) y devuelve una probabilidad calibrada para cada opción, lo que lo convierte en un clasificador-decisor en lugar de un generador de texto libre. Está afinado a partir de Qwen3.5-0.8B mediante la receta y el código abiertos de Perplexity Decider v1.1.

El modelo resuelve el problema de transformar tareas de clasificación y decisión heterogéneas en un formato tipado uniforme, con una cabeza de decisión de 255 vías inicializada a partir de las filas del modelo de lenguaje correspondientes a los códigos de opción. Su relevancia radica en que ofrece una interfaz determinista y probabilística para enrutamiento, clasificación y selección de herramientas, con un coste de inferencia propio de un modelo de 0,8B.

La arquitectura subyacente es un transformer Qwen3_5Model con atención no causal en las capas de atención completa y pooling del último token. El repositorio ocupa 1,7 GB y los pesos suman 852.985.920 parámetros en safetensors BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3_5Model con atención no causal en capas de atención completa y pooling del último token |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens por rama de pregunta (límite del servidor) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), más `readout.safetensors` y `decision_config.json` |
| Modelo base | Qwen/Qwen3.5-0.8B (revision `2fc06364715b967f1860aea9cf38778875588b17`) |
| Pipeline | text-classification |
| Cabezas de salida | Cabeza de decisión BF16 de forma `[255, hidden]` |
| Tamano del repo | 1,7 GB |

## Arquitectura y entrenamiento

El backbone es `Qwen3_5Model` con atención no causal en las capas de atención completa y pooling del último token; la salida se proyecta mediante `readout.safetensors`, una cabeza de decisión BF16 de dimensión `[255, hidden]` inicializada desde las filas del modelo de lenguaje correspondientes a los códigos de opción. La configuración de decisión (códigos de opción, temperatura de calibración y hashes de procedencia) se guarda en `decision_config.json`. El modelo se sirve mediante un servidor `/v1/systemone` incluido, procedente del código fuente de Perplexity Decider v1.1.

El entrenamiento consistió en una época sobre 2.595.309 filas, 256 filas por paso, learning rate 2e-6, schedule coseno hasta 0,1, warmup del 15 %, weight decay 0,01 y un máximo de 8.192 tokens por rama de pregunta. La pérdida combina entropía cruzada suave con un término Brier (peso 1,0). Los datos provienen del build de entrenamiento de Perplexity Decider v1.1, de los splits de train de los benchmarks Decision Index y de amplios datasets públicos de clasificación y decisión convertidos al formato tipado. Se aplicó aumentación de opciones durante el entrenamiento (barajado de opciones, «None of the above» como objetivo o distractor, distractores tomados de otras preguntas) y descontaminación frente a las filas públicas de evaluación de Decision Index mediante coincidencia exacta y solapamiento de 8-gramas de palabras. No se usaron salidas de Jev.

## Capacidades

- Clasificación y decisión tipada: dado un `state` y preguntas de opción múltiple (hasta 255 opciones), devuelve una probabilidad para cada opción.
- Selección de herramientas y enrutamiento: la suite de evaluación incluye la métrica Tools (56,62), orientada a elegir la herramienta o acción correcta.
- Recuperación y selección de contexto: métrica Retrieval de 55,25 en la suite pública.
- Capacidad lingüística medida: métrica Language de 52,33.
- Conocimiento factual limitado: métrica Knowledge de 18,63.
- Capacidades artísticas/creativas limitadas: métrica Arts de 25,31.
- Salida probabilística calibrada mediante temperatura de calibración configurable.
- Manejo de distractores y de la opción «None of the above» aprendido durante el entrenamiento.
- No se documenta soporte de tool calling generativo, agentes multi-paso ni modos de razonamiento extendido; el modelo es un decisor, no un generador.

## Casos de uso

- Enrutamiento de consultas: clasificar cada consulta entrante de un servicio en una de hasta 255 categorías o intents tipados, usando la probabilidad por opción para aplicar umbrales de confianza y derivar a revisión humana.
- Selección de herramientas en pipelines de agentes: dado el estado de la conversación y una lista de herramientas disponibles, elegir la herramienta adecuada como pregunta de opción múltiple, con probabilidades comparables entre opciones.
- Filtrado y clasificación de contenido: asignar etiquetas tipadas a documentos o mensajes (por ejemplo, categorías de moderación o taxonomías internas) aprovechando el formato de decisión uniforme.
- Triaje de tickets de soporte: clasificar incidencias por tipo, prioridad o equipo responsable, con la opción «None of the above» para casos que no encajan en la taxonomía.
- Recuperación selectiva: decidir qué fragmento o documento candidato responde mejor a una consulta, usando la pregunta tipada sobre los candidatos recuperados (la suite incluye Retrieval y BRIGHT).
- Evaluación automática de respuestas: decidir si una respuesta cumple un criterio binario o multinivel, con calibración de probabilidades para agregar resultados a escala.
- Decisión de siguiente acción en sistemas de diálogo: seleccionar entre acciones predefinidas (pedir aclaración, escalar, responder, cerrar) a partir del estado de la conversación.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre Decision Index 0.3 (suite pública), ejecución completa con `"complete": true` y 140.620 peticiones:

| Area | Skill |
|---|---:|
| Knowledge | 18,63 |
| Language | 52,33 |
| Retrieval | 55,25 |
| Tools | 56,62 |
| Arts | 25,31 |
| Decision Index 0.3 | 42,28 (raw 56,62) |

Nota de la ejecución: 345 peticiones (311 ToolRet, 25 POP909-CL, 6 BRIGHT, 2 API-Bank, 1 HLE) tienen una rama de pregunta que supera el límite de 8.192 tokens; el servidor las rechaza con HTTP 422 sin truncar y cuentan como erróneas. No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K u otros benchmarks estándar de generación.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,7 GB de pesos más memoria de activaciones para 8.192 tokens por rama; no se publica una cifra oficial de VRAM.
- GPU recomendadas: cualquier GPU CUDA con al menos 4 GB de VRAM para BF16 en un solo dispositivo; la model card indica BF16 sobre CUDA para la ejecución de evaluación.
- GPU de consumo: cabe en tarjetas consumer con 4-8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090) en BF16; no se documentan pesos cuantizados.
- Opciones de despliegue: servidor `/v1/systemone` incluido en el repositorio (`python -m autojev.server` con las variables `AUTOJEV_CHECKPOINT`, `AUTOJEV_HOST` y `PORT`), instalando `requirements.txt`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Adjudex 0.8B | 852.985.920 | 8.192 tokens por rama | Decisión tipada / clasificación probabilística | Apache 2.0 | Hugging Face (newsbang/adjudex-0.8b) |
| Qwen3.5-0.8B (base) | 0,8B (no disponible el detalle exacto) | no disponible | Generación de texto | no disponible | Hugging Face (Qwen/Qwen3.5-0.8B) |
| Perplexity Decider v1.1 (27B) | 27B (según el nombre del repo) | no disponible | Decisión tipada | Apache 2.0 | Repositorio perplexity-ai/pplx-decider-v1.1-27b |

El modelo base Qwen3.5-0.8B es comparable en tamaño pero no en tarea: es un modelo generativo, mientras que Adjudex produce probabilidades sobre opciones tipadas. Perplexity Decider v1.1-27B comparte la receta y el código de servicio, pero con un backbone mucho mayor; no se dispone de resultados comparativos publicados entre ambos en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al entrenarse sobre datasets públicos de clasificación y decisión, puede heredar sesgos de esas fuentes.
- Riesgo de alucinación: el modelo no genera texto libre, pero puede asignar probabilidades altas a opciones incorrectas en dominios con conocimiento factual débil (Knowledge 18,63).
- Límite de contexto: las ramas de pregunta que superan 8.192 tokens se rechazan con HTTP 422 y cuentan como erróneas; no hay truncado automático.
- Idiomas: no se especifican los idiomas soportados; la métrica Language de 52,33 sugiere un rendimiento lingüístico moderado.
- Licencia: Apache 2.0 permite uso comercial; el código de servicio procede de perplexity-ai/pplx-decider-v1.1-27b (Apache 2.0) y debe respetarse el NOTICE.
- Formato de salida: no es un modelo de chat ni de generación; integrarlo requiere adaptar la aplicación al esquema `state` + `questions` tipadas y a la cabeza de 255 opciones.
- Código personalizado: el repositorio requiere `custom-code` y el servidor incluido para funcionar; no se garantiza compatibilidad con runtimes estándar de transformers.
- Calibración: las probabilidades dependen de la temperatura de calibración en `decision_config.json`; alterarla sin recalibrar afecta los umbrales de decisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/newsbang/adjudex-0.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Código de servicio (Perplexity Decider v1.1): https://github.com/perplexity-ai/pplx-decider-v1.1-27b
- Repositorio del modelo base en Hugging Face (revision citada): https://huggingface.co/Qwen/Qwen3.5-0.8B/tree/2fc06364715b967f1860aea9cf38778875588b17
