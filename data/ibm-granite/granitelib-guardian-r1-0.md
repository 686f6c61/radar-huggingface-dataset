# ibm-granite/granitelib-guardian-r1.0

## Resumen

Granite Guardian Library r1.0 es una colección de adaptadores LoRA publicada por IBM bajo el identificador `ibm-granite/granitelib-guardian-r1.0`. No se trata de un modelo independiente, sino de una librería de cuatro familias de adaptadores orientadas a tareas de seguridad, factualidad y cumplimiento de políticas en sistemas basados en LLM. Cada familia se ofrece como adaptador LoRA sobre cuatro modelos base distintos de la familia Granite: `granite-4.0-micro`, `granite-4.1-3b`, `granite-4.1-8b` y `granite-4.1-30b`.

El problema que resuelve es el de la evaluación y corrección automática de las salidas de un LLM: detección de riesgos de seguridad (daño, jailbreaking, lenguaje soez, violencia, contenido sexual, sesgo social, comportamiento no ético), detección de alucinaciones en llamadas a herramientas y en generación aumentada por recuperación (RAG), corrección de respuestas factualmente incorrectas y verificación de cumplimiento de políticas. El resultado de los adaptadores de juicio se emite como un objeto JSON con un campo `score` que toma el valor `"yes"` o `"no"`, lo que facilita su integración en pipelines automatizados.

Su relevancia actual radica en que permite añadir capas de control y verificación sobre modelos de distinto tamaño sin necesidad de reentrenar el modelo base completo, ya que se implementan como adaptadores LoRA sobre pesos congelados. La librería está firmada con Sigstore para garantizar integridad y procedencia, y el uso recomendado se canaliza a través del framework Mellea, donde estos adaptadores reciben el nombre de "intrinsics".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre modelos base congelados de la familia Granite; arquitectura del modelo base no disponible |
| Parametros totales | Depende del modelo base: granite-4.1-3b, granite-4.1-8b y granite-4.1-30b segun nomenclatura; granite-4.0-micro no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible para los adaptadores; el formato entregado es safetensors sin cuantizar |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`), con `adapter_config.json`, `io.yaml` y firma `model.sig` |

## Arquitectura y entrenamiento

Cada capacidad se implementa como un adaptador LoRA (Low-Rank Adaptation) entrenado sobre un modelo base congelado de Granite, gestionado mediante PEFT. El repositorio contiene cuatro familias de adaptadores, cada una replicada para los cuatro modelos base disponibles:

- Guardian Core: juzga si los prompts de entrada y las respuestas de salida de un sistema LLM cumplen criterios de seguridad (daño, jailbreaking, lenguaje soez, violencia, contenido sexual, sesgo social, comportamiento no ético), alucinaciones en llamadas a herramientas y funciones, y RAG en sistemas basados en agentes.
- Factuality Detection: evalúa la corrección factual teniendo en cuenta explícitamente pasajes de contexto que pueden contener información contradictoria o en conflicto, identificando respuestas que se oponen, tergiversan o ignoran selectivamente la evidencia del contexto.
- Factuality Correction: corrige respuestas factualmente incorrectas generadas por el LLM apoyándose en pasajes de contexto, y es capaz de corregir inexactitudes en respuestas extensas compuestas por múltiples unidades atómicas, preservando las capacidades generativas y de razonamiento del modelo base.
- Policy Guardrails: verificación de cumplimiento de políticas; dada una política y un escenario, decide si el escenario la cumple o la viola, y ofrece una tercera respuesta ("Ambiguous") cuando no es posible decidir con alta certeza.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. Tampoco se detallan innovaciones de decodificación o mecanismos de atención lineal. Todos los artefactos de cada adaptador están firmados con la identidad `Granite-sign@ibm.com` y pueden verificarse con la herramienta `model-signing` basada en Sigstore.

## Capacidades

- Juicio de seguridad sobre prompts y respuestas: detección de daño, jailbreaking, lenguaje soez, violencia, contenido sexual, sesgo social y comportamiento no ético.
- Detección de alucinaciones específicamente en el contexto de llamadas a herramientas y funciones.
- Detección de alucinaciones en flujos de generación aumentada por recuperación (RAG) dentro de sistemas basados en agentes.
- Salida estructurada en JSON con un campo `score` de valor `"yes"` o `"no"` para los adaptadores de juicio.
- Evaluación de factualidad considerando pasajes de contexto potencialmente contradictorios.
- Corrección de respuestas factualmente incorrectas, incluyendo respuestas largas con múltiples afirmaciones atómicas.
- Verificación de cumplimiento de políticas con salida ternaria: cumplimiento, violación o "Ambiguous".
- Funcionamiento sobre cuatro tamaños de modelo base distintos, lo que permite elegir el equilibrio entre coste y capacidad.
- Soporte multilingüe: únicamente inglés.

## Casos de uso

- Moderación de contenido en producción: desplegar el adaptador Guardian Core sobre un modelo base pequeño (por ejemplo `granite-4.1-3b`) para clasificar en tiempo real prompts y respuestas como seguras o inseguras, con salida JSON directamente consumible por el orquestador.
- Verificación de factualidad en asistentes RAG: usar Factuality Detection sobre las respuestas generadas a partir de documentos recuperados, comparando cada afirmación con los pasajes de contexto para marcar contradicciones o evidencia ignorada.
- Autocorrección de respuestas en pipelines documentales: aplicar Factuality Correction para reescribir respuestas largas que contienen afirmaciones erróneas, manteniendo intactas las partes correctas y las capacidades de razonamiento del modelo base.
- Cumplimiento normativo y de políticas internas: emplear Policy Guardrails para evaluar si un escenario descrito cumple una política corporativa dada, con la salida "Ambiguous" como señal para escalado a revisión humana cuando la certeza es baja.
- Validación de agentes que invocan herramientas: detectar alucinaciones en llamadas a funciones y en los argumentos generados antes de ejecutar acciones reales sobre sistemas externos.
- Control de calidad en generación de contenido: integrar Guardian Core y Factuality Detection en un pipeline de publicación para bloquear o marcar automáticamente borradores que incumplan criterios de seguridad o factualidad.
- Auditoría y trazabilidad: verificar las firmas Sigstore de los adaptadores descargados antes de incorporarlos a entornos regulados, comprobando que los artefactos no han sido manipulados tras su publicación.
- Investigación sobre evaluación de LLM: usar la librería como banco de adaptadores comparables sobre distintos tamaños de modelo base para estudiar el comportamiento de las tareas de seguridad y factualidad en función de la escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Los adaptadores LoRA en sí ocupan poco espacio (el repositorio completo, con las cuatro familias y cuatro variantes de modelo base, es de 6,5 GB), por lo que el requisito real de VRAM lo determina el modelo base sobre el que se apliquen.
- Estimaciones orientativas de VRAM para inferencia en precisión fp16, calculadas a partir del número de parámetros del modelo base (2 bytes por parámetro, sin contar caché de KV ni overhead): `granite-4.1-3b` en torno a 6 GB, `granite-4.1-8b` en torno a 16 GB y `granite-4.1-30b` en torno a 60 GB. Para `granite-4.0-micro` no hay dato de tamaño disponible.
- GPUs recomendadas: `granite-4.1-3b` puede ejecutarse en GPUs de consumo como una RTX 4090; `granite-4.1-8b` requiere GPUs de gama alta con al menos 16-24 GB de VRAM; `granite-4.1-30b` requiere GPUs de datacenter como A100 o H100.
- Despliegue: la información proporcionada recomienda el uso de los adaptadores a través del framework Mellea (donde se denominan "intrinsics"). No se detallan en la información disponible opciones como vLLM, llama.cpp, Ollama o TGI para estos adaptadores.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La información proporcionada no incluye datos de rendimiento ni especificaciones que permitan una comparación cuantitativa con modelos alternativos de la misma categoría. Estructuralmente, la propuesta difiere de los modelos de guardia monolíticos convencionales en que se distribuye como adaptadores LoRA desacoplados sobre cuatro modelos base de distinto tamaño, lo que permite reutilizar el mismo modelo base para generación y para tareas de verificación cambiando únicamente el adaptador. No se dispone de datos para comparar parámetros, contexto, rendimiento, licencia y disponibilidad frente a alternativas concretas.

## Limitaciones y advertencias

- Cobertura de idioma limitada al inglés; no se declara soporte de otros idiomas.
- Al ser adaptadores sobre modelos base, heredan los sesgos y las limitaciones del modelo subyacente, que no se documentan en la información disponible.
- Los adaptadores de juicio y detección de factualidad pueden producir falsos positivos o falsos negativos; no se han publicado métricas de precisión, recall ni F1 en la información disponible.
- Los adaptadores de corrección factual dependen de la calidad y cobertura de los pasajes de contexto; si el contexto es incompleto o erróneo, la corrección puede introducir nuevos errores.
- La salida "Ambiguous" de Policy Guardrails es una señal explícita de incertidumbre y debe tratarse con revisión humana en flujos de decisión automatizados.
- No se especifican requisitos ni procedimientos de producción (cuantización, servidores de inferencia, latencia) más allá del uso recomendado vía Mellea.
- Aunque la licencia es Apache 2.0, que permite uso comercial, conviene revisar los términos de los modelos base de Granite sobre los que se apliquen los adaptadores.
- Es imprescindible aplicar estos adaptadores sobre un modelo base compatible de la familia indicada; no se documenta su funcionamiento sobre otros modelos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ibm-granite/granitelib-guardian-r1.0
- Modelo base granite-4.0-micro: https://huggingface.co/ibm-granite/granite-4.0-micro
- Modelo base granite-4.1-3b: https://huggingface.co/ibm-granite/granite-4.1-3b
- Modelo base granite-4.1-8b: https://huggingface.co/ibm-granite/granite-4.1-8b
- Modelo base granite-4.1-30b: https://huggingface.co/ibm-granite/granite-4.1-30b
- Framework Mellea: https://mellea.ai
- Ejemplos de adaptadores en Mellea: https://github.com/generative-computing/mellea/tree/main/docs/examples/intrinsics
- Herramienta de verificación de firmas model-signing: https://github.com/sigstore/model-transparency
- Información general sobre Granite: https://www.ibm.com/granite
- Documentación de Granite: https://www.ibm.com/granite/docs/
