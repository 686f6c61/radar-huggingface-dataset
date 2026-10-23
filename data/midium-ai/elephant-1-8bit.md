# midium-ai/elephant-1-8bit

## Resumen

elephant-1-8bit es una cuantización de 8 bits en formato MLX del modelo baselabs/elephant-1, un modelo de decisión tipada de 9B desarrollado por Baselabs. No es un modelo generativo de texto: recibe un estado y una pregunta tipada (elección entre opciones, sí/no o puntuación) y devuelve una probabilidad para cada opción leyendo los logits de la cabeza LM sobre etiquetas de ranura, sin emitir tokens de texto. Es, por tanto, una pieza de infraestructura para enrutado, validación y preselección dentro de pipelines de agentes.

El checkpoint lo publica midium-ai (Midium) para su runtime System One, que expone el endpoint `POST /v1/systemone`. La cuantización es afín de 8 bits con tamaño de grupo 64 y redondeo al más cercano, sin datos de calibración, y reduce el peso de 18,8 GB en bf16 a 9,5 GB. La torre de visión del modelo original no forma parte de esta build, que es solo texto.

Su relevancia práctica está en que preserva casi exactamente el comportamiento del modelo bf16: en la evaluación del autor, el 99,2–100% de las respuestas principales coinciden con las del original y la distancia de variación total entre distribuciones es como máximo de 0,008 por conjunto. La contrapartida es que exige un runtime que implemente el protocolo de decisión qev; los cargadores MLX genéricos de generación de texto no sirven.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (fine-tune completo de Qwen3.5-9B) con atención bidireccional por bloques y protocolo de decisión qev |
| Parametros totales | 8.953.801.728 (~8,95 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits afín (affine), group size 64, round-to-nearest; solo se publica el checkpoint 8-bit MLX |
| Idiomas soportados | no disponible |
| Licencia | MIT (metadatos y model card); el tag de HuggingFace indica `license:other` con `license_name: mit` |
| Formato de pesos | safetensors en formato MLX (librería `mlx`) |
| Tamano del repositorio | 9,5 GB (fuente bf16: 18,8 GB) |
| Modelo base | baselabs/elephant-1 (revision `b3f8a93462fb1051a9de031e94a7ff380e254072`) |
| Tipo de modelo | decision-model / system-one (no generativo) |
| Descargas / likes | 0 / 2 |
| Fecha de creacion | 2026-10-23 |

## Arquitectura y entrenamiento

El modelo subyacente es un fine-tune completo de Qwen3.5-9B, es decir, un transformer denso de aproximadamente 9B parámetros. La particularidad no está en el backbone sino en la cabeza de decisión: el modelo no genera texto, sino que lee la respuesta directamente de los logits de la cabeza LM sobre las etiquetas de ranura (A.., hasta 256 ranuras), empleando el protocolo qev de OneJev. La configuración incluye atención completa bidireccional por bloques mediante `modeling_overrides` en `config.json` y un fichero `readout.json` que define la lectura de la decisión.

Sobre el entrenamiento no se proporcionan datos en la información disponible: no se indica el número de tokens, la composición del dataset ni si hubo RLHF o DPO. Lo que sí se documenta es el proceso de cuantización: cuantización afín de 8 bits con tamaño de grupo 64 y redondeo al más cercano, sin datos de calibración. Se mantienen sin cambios el tokenizer, la plantilla de chat y la configuración de decisión del modelo original; la torre de visión queda excluida de esta build, que es solo texto.

## Capacidades

- Decisión tipada sobre un estado dado: elección entre opciones (choice), preguntas de sí/no y puntuaciones en escala (por ejemplo 0–9).
- Devolución de una probabilidad por cada opción, sin generación de texto; la salida es una distribución, no una cadena.
- Enrutado de consultas y model routing: selección de qué modelo o vía debe atender una petición.
- Preselección de herramientas (tool preselection) dentro de pipelines de agentes.
- Comprobación de respuestas (reply checks) y validación de salidas de otros modelos.
- Clasificación de intención en espacios amplios: la evaluación incluye elección de intención entre 150 opciones.
- Robustez a reordenación de opciones (option shuffle) y a errores tipográficos, según los conjuntos de evaluación del autor.
- Puntuación de calidad o relevancia en escalas numéricas de 0 a 9.
- No soporta generación de texto, visión, audio ni tool calling generativo; la torre de visión no está incluida en esta build.

## Casos de uso

- Enrutado de peticiones en una plataforma de agentes: dado el estado de la conversación y una lista de modelos disponibles, el modelo devuelve la probabilidad de cada ruta y permite derivar la consulta al modelo adecuado sin una llamada generativa adicional.
- Preselección de herramientas: antes de invocar un LLM grande, se usa elephant-1-8bit para elegir entre las herramientas registradas y reducir el espacio de búsqueda, con la ventaja de que la decisión es una sola pasada y no consume tokens de salida.
- Validación de respuestas en cascada: comprobar con una pregunta de sí/no si la respuesta de otro modelo cumple los criterios antes de entregarla al usuario, actuando como guardarraíl barato.
- Clasificación de intención en atención al cliente: elección entre un conjunto amplio de intenciones (hasta 150 en la evaluación publicada) para dirigir el ticket al flujo o al equipo correcto.
- Puntuación de calidad de contenidos: asignar una nota de 0 a 9 a resúmenes, respuestas o traducciones generadas, y usar el umbral para aceptar, regenerar o escalar a revisión humana.
- Enrutado de modelos en producción (LLM cascade): decidir si una consulta puede resolverla un modelo pequeño o necesita uno grande, optimizando coste por petición.
- Triage en pipelines multi-paso: decidir si un paso intermedio ha tenido éxito (sí/no) antes de continuar la cadena de un agente.
- Moderación o policy checks: evaluar si un texto cumple una política concreta formulada como pregunta tipada, siempre que se valide previamente la calibración en el dominio objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí publica una evaluación de fidelidad de la cuantización frente al modelo bf16, con el mismo runtime y las mismas peticiones, sobre muestras sembradas de hasta 150 preguntas por conjunto:

| Conjunto | Preguntas | Coincidencia con la respuesta principal de bf16 | Cambio de accuracy por conjunto | Respuestas perdidas / ganadas |
|---|---:|---:|---:|---:|
| 14 conjuntos de decisión (routing, reply checks, tool preselection, model routing) | 2.058 | 99,2–100% | -0,7 a +0,9 pts | 1 / 1 |
| Conjuntos públicos, elección de intención entre 150 opciones, puntuaciones 0–9, robustez a reordenación y erratas | 1.720 | 99,2–100% | -0,8 a +0,7 pts | 1 / 1 |

La distancia media de variación total entre las distribuciones de respuesta del modelo 8-bit y del bf16 es como máximo de 0,008 por conjunto. Son métricas de fidelidad a la cuantización, no de calidad absoluta frente a otros modelos.

## Requisitos de hardware

- VRAM / memoria estimada para inferencia: los pesos ocupan 9,5 GB; conviene reservar entre 12 y 14 GB para pesos, overhead del runtime y buffers.
- Plataforma: el checkpoint es MLX, por lo que el destino natural es Apple Silicon con memoria unificada. No hay pesos GGUF ni safetensors estándar para GPU NVIDIA en este repositorio.
- Cabe en consumer: sí, en un Mac con 16 GB de memoria unificada, aunque con margen ajustado; 24 o 32 GB es la configuración cómoda.
- GPU recomendadas: no disponible para CUDA; en Apple Silicon, chips de la familia M-series con memoria unificada suficiente.
- Opciones de despliegue: runtime System One de Midium (`POST /v1/systemone`), que carga el checkpoint directamente. Los cargadores MLX genéricos de generación de texto no implementan el protocolo qev y no pueden usarlo; vLLM, llama.cpp, Ollama y TGI no están soportados según la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han identificado en la información disponible modelos comparables de decisión tipada con datos públicos. La referencia directa es el modelo original del que se deriva:

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| elephant-1-8bit (este) | ~8,95 B | no disponible | safetensors MLX, 8 bits | MIT | 9,5 GB; requiere runtime System One; coincide 99,2–100% con bf16 |
| baselabs/elephant-1 (bf16) | ~8,95 B | no disponible | safetensors bf16 | MIT | 18,8 GB; incluye torre de visión; referencia de calidad |
| Qwen3.5-9B | ~9 B | no disponible | safetensors | no disponible | Backbone sobre el que se fine-tunea; no es un modelo de decisión |

Para alternativas de la misma categoría (modelos de enrutado o clasificación de decisión única) no hay datos de benchmarks en la información proporcionada.

## Limitaciones y advertencias

- No genera texto: cualquier caso de uso que requiera una respuesta redactada necesita otro modelo. Aquí la salida es una distribución de probabilidad sobre opciones.
- Dependencia de runtime: sin el protocolo qev (lectura de logits de ranura con atención bidireccional por bloques) el checkpoint no es utilizable; los cargadores MLX estándar fallan.
- Solo texto: la torre de visión del modelo original no está incluida en esta build.
- Idiomas: no se declara ningún conjunto de idiomas soportados; la cobertura multilingüe es desconocida y debe validarse en el dominio concreto.
- Contexto máximo: no documentado, lo que impide planificar el tamaño de estado que se puede enviar.
- Riesgo de error en la decisión: al ser un modelo de clasificación, puede elegir la opción incorrecta o quedar mal calibrado ante entradas fuera de distribución; la evaluación publicada mide fidelidad a bf16, no acierto absoluto en dominios nuevos.
- Cuantización sin calibración: el uso de round-to-nearest sin datos de calibración puede degradar la precisión en dominios alejados de los conjuntos evaluados, aunque las métricas reportadas sean buenas.
- Validación comunitaria escasa: 0 descargas y 2 likes en el momento de la ficha; el checkpoint es reciente y no hay reports independientes.
- Licencia: MIT según la model card, pero el tag de HuggingFace figura como `license:other`; conviene verificar la licencia del modelo base antes de un uso comercial en producción.
- Sin benchmarks estándar: no hay MMLU, HumanEval ni similares que permitan comparar con otros modelos de la misma familia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/midium-ai/elephant-1-8bit
- Modelo base: https://huggingface.co/baselabs/elephant-1
- Perfil de la organizacion en HuggingFace: https://huggingface.co/midium-ai/models
- Sitio del autor del runtime: https://midium.dev
- Repositorio del protocolo de decisión (mencionado como qev, de OneJev): no disponible en la informacion proporcionada
- Paper o blog tecnico del modelo: no disponible en la informacion proporcionada
