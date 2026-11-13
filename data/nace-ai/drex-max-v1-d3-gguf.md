# nace-ai/drex-max-v1-d3-GGUF

## Resumen

Drex Max v1 d3 GGUF es una conversión al formato GGUF del modelo Drex Max v1 de nace-ai, orientada específicamente a su uso con llama.cpp mediante el tipo de decisión `vllm-d3`. A diferencia de un modelo generativo convencional, Drex Max no produce texto libre: responde a preguntas de elección, de sí/no (denominadas `noul`) y de puntuación devolviendo probabilidades a través del endpoint `/v1/systemone` de llama-server. Es, por tanto, un modelo de decisión ("decision model") pensado para clasificar y puntuar dentro de pipelines.

El modelo cuenta con aproximadamente 26.900 millones de parámetros (26.895.998.464 según los pesos en safetensors) y se distribuye en un único fichero GGUF con cuantización Q8_0 y la cabeza de salida (`output.weight`) en F32, lo que eleva el tamaño del repositorio a 32,3 GB. El autor indica que los pesos son idénticos a los de `drex-max-v1-Q8_0`; la diferencia estriba en la disposición de la cabeza y en los metadatos, que activan el tipo de decisión `vllm-d3` y desactivan la atención causal.

Su relevancia actual es acotada pero específica: ofrece una vía para desplegar decisiones probabilísticas sobre texto con llama.cpp sin necesidad de modificar código, y resulta útil para quienes ya trabajan con el ecosistema de nace-ai o necesitan clasificadores de tickets, enrutado o scoring con salida calibrada. La información pública disponible es escasa: no se han detallado los datos de entrenamiento, los idiomas soportados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles); atención no causal (`qwen35.attention.causal = false`) |
| Parametros totales | 26.895.998.464 (~26,9 mil millones) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible (el ejemplo de ejecución usa `-c 4096`) |
| Tipos de cuantizacion | Q8_0 (cabeza en F32) |
| Idiomas soportados | No disponible |
| Licencia | nace-ai-open-rail-m (licencia "other", ver fichero LICENSE) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de los metadatos del GGUF: el modelo se etiqueta con `qwen35.decision.type = vllm-d3` y `qwen35.attention.causal = false`, lo que indica una lectura no causal de la petición completa. El autor explica que Drex Max procesa la solicitud de forma no causal, por lo que toda la petición debe caber en un único lote físico de llama.cpp; para peticiones más largas hay que aumentar conjuntamente `-c`, `-b` y `-ub`.

El proceso de creación del fichero consistió en reescribir el GGUF existente de Drex Max v1: los tensores del backbone se copian sin cambios y solo se reorganizan la cabeza y los metadatos, añadiendo el tipo de decisión, la temperatura de decisión y la plantilla de prompt `tokenizer.chat_template.systemone`. No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Respuesta a preguntas de elección (`choice`) entre un conjunto de criterios definidos por el usuario, devolviendo probabilidades por opción.
- Respuesta a preguntas de sí/no (tipo `noul`) con probabilidad asociada.
- Respuesta a preguntas de puntuación (`score`) mediante probabilidades.
- Enrutado y clasificación de texto (por ejemplo, asignación de tickets a equipos).
- No genera texto libre para estas respuestas: la salida es probabilística.
- Entrada exclusivamente de texto (text input only).
- Integración con el endpoint `/v1/systemone` de llama-server.
- Soporte de plantilla de prompt propia (`systemone`) para formatear las peticiones.

## Casos de uso

- Enrutado de tickets de soporte: el modelo recibe el texto del ticket y devuelve la probabilidad de que corresponda a facturación, soporte técnico u otras categorías, como muestra el ejemplo de la model card con una incidencia de doble cobro.
- Triaje de incidencias en producción: clasificación binaria (`noul`) de si un aviso debe escalarse a un equipo de guardia, usando la probabilidad como umbral configurable.
- Moderación y filtrado: preguntas de sí/no sobre si un contenido cumple una política, con puntuación probabilística para ajustar la sensibilidad del filtro.
- Scoring de candidatos o respuestas: asignación de puntuaciones a textos (por ejemplo, calidad de una respuesta de soporte) para ordenar y priorizar revisiones humanas.
- Clasificación de correos entrantes: elección entre departamentos o etiquetas operativas en un flujo de gestión documental.
- Automatización de decisiones en pipelines internos: al exponerse vía llama-server con API compatible, puede integrarse en servicios HTTP que consuman probabilidades en lugar de texto generado.
- Evaluación de intenciones en asistentes conversacionales: determinar la intención del usuario entre un conjunto cerrado de opciones antes de derivar a otro modelo generativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor únicamente reporta una comprobación de equivalencia frente al fork de nace en 21 preguntas de test (Q8_0, CPU Linux): misma respuesta principal en las 21 y una diferencia máxima de probabilidad de 0,017. No se han probado Metal ni CUDA.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q8_0 ocupa 32,3 GB; se necesita al menos esa cantidad de memoria (GPU o RAM) para cargarlo, con margen adicional para el contexto.
- GPU recomendadas: no disponibles de forma explícita; por tamaño, encajan A100 80 GB, H100 y GPUs con 40-48 GB o más. En GPUs de 24 GB no cabe en Q8_0.
- Cabe en GPU de consumo: no en configuraciones de 24 GB o menos con esta cuantización; requeriría cuantizaciones menores que no se distribuyen en este repositorio.
- Opciones de despliegue: llama.cpp mediante `llama-server` (probado en master `2a4daf0`, 2026-11-12). El autor no menciona vLLM, TGI ni Ollama para este fichero.
- Latencia y throughput: no disponibles. El autor solo confirma pruebas en CPU Linux; Metal y CUDA no están testeados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| nace-ai/drex-max-v1-d3-GGUF | ~26,9 mil millones | No disponible | GGUF (Q8_0) | nace-ai-open-rail-m | Modelo de decisión con endpoint `/v1/systemone` |
| nace-ai/drex-max-v1-Q8_0 | No disponible (mismos pesos) | No disponible | GGUF (Q8_0) | nace-ai-open-rail-m | Diseño anterior para el fork de nace y Kapitsa |
| nace-ai/drex-max-v1 | No disponible | No disponible | No disponible | nace-ai-open-rail-m | Modelo base del que derivan las conversiones |

No se dispone de información sobre modelos de terceros comparables en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto para las respuestas de decisión, solo probabilidades; no debe emplearse como chatbot.
- Solo acepta entrada de texto.
- La lectura no causal obliga a que la petición completa quepa en un único lote físico; peticiones largas requieren ajustar `-c`, `-b` y `-ub` y consumen más memoria.
- Solo se ha validado en CPU Linux; Metal y CUDA no están probados, lo que introduce riesgo en despliegues con aceleración por GPU.
- No hay información pública sobre sesgos, idiomas soportados ni tasa de alucinación o calibración fuera del conjunto de 21 pruebas.
- La licencia nace-ai-open-rail-m es de tipo "other": es imprescindible revisar el fichero LICENSE antes de cualquier uso comercial.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validación por parte de la comunidad.
- La fecha de creación y actualización (noviembre de 2026) y la referencia a llama.cpp master de 2026 indican un ecosistema muy reciente; conviene fijar versiones concretas en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/drex-max-v1-d3-GGUF
- Modelo base: https://huggingface.co/nace-ai/drex-max-v1
- Conversión Q8_0 con diseño anterior: https://huggingface.co/nace-ai/drex-max-v1-Q8_0
- Licencia: https://huggingface.co/nace-ai/drex-max-v1-d3-GGUF/blob/main/LICENSE
