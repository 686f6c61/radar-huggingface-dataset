# cortex-agent-llc/kodiak-large-v2-preview

## Resumen

Kodiak large v2 preview es un modelo de decisión de tipo encoder-only desarrollado por Cortex Agent LLC, publicado como "research preview" dentro de la familia Kodiak (antes "Kodiak S1" o "System One"). No es un modelo generativo: recibe un estado (un texto, una lista de textos o un JSON) junto con preguntas tipadas y devuelve respuestas calibradas en una sola pasada forward. Las respuestas de tipo elección pertenecen siempre al conjunto de etiquetas que define el usuario, las puntuaciones quedan dentro del rango solicitado y cada pregunta puede devolver "no respondible desde este estado" con su propia probabilidad, lo que permite integrar abstención explícita en pipelines automáticos.

El checkpoint se apoya en el backbone answerdotai/ModernBERT-large y suma 400.031.748 parámetros (frente a los 152 M de la variante small). Está entrenado únicamente en inglés, trunca estados de más de 512 tokens y se distribuye con licencia Apache-2.0 en formato safetensors, con un repositorio de 1,6 GB que incluye un `handler.py` para Hugging Face Inference Endpoints.

Su relevancia actual es doble. Por un lado, cubre un nicho poco atendido: clasificación y juicio estructurado con calibración y abstención nativas, en lugar de generación abierta. Por otro, sus números son medidos y comparables: supera al mejor clasificador zero-shot abierto probado por los autores en tareas nunca vistas (60,9 % frente a 57,9 %) y mejora de forma clara a la variante small en familiaridad de tareas (85,5 % frente a 81,7 %), a costa de una abstención menos fiable y de una latencia aproximadamente el doble.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only sobre backbone ModernBERT-large |
| Parametros totales | 400.031.748 (~400 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens efectivos; los estados mas largos se truncan |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | answerdotai/ModernBERT-large |
| Libreria de inferencia | kodiak (paquete kodiak-s1) |
| Tamano del repositorio | 1,6 GB |
| Checkpoint publicado | b-base-s1-v2-s1 (semilla 1 de 3, paso 6000) |
| Descargas / likes en HuggingFace | 0 / 1 |

## Arquitectura y entrenamiento

La arquitectura es un encoder-only basado en ModernBERT-large, un transformer de codificador con las modernizaciones habituales de esa familia (embeddings posicionales rotatorios, alternancia de atención local y global, activaciones GeGLU y soporte de attention sin padding, entre otras). La innovación propia de Kodiak no está en el backbone sino en la capa de decisión: el modelo recibe preguntas tipadas (por ejemplo, de tipo `choice` con una lista cerrada de etiquetas) y produce respuestas calibradas en una única pasada. Las temperaturas de calibración vienen ya integradas en el checkpoint y el umbral de abstención por defecto se lee de `calibration.json`, pudiendo sobrescribirse por petición mediante el parámetro `null_threshold`.

El checkpoint publicado corresponde a la semilla 1 de tres entrenamientos, seleccionada por pérdida de validación (no por el conjunto de evaluación) y detenida en el paso 6000. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO; tampoco se detalla el procedimiento de ajuste de las temperaturas de calibración más allá de que están "baked in". Los resultados de evaluación que acompañan al modelo se presentan sobre dos revisiones de su conjunto de evaluación: eval v0.2 (overall 67,2 %, tareas familiares 85,4 %, tareas nunca vistas 56,8 %, 61,0 % con respuesta forzada, ECE 0,088) y eval v0.1 (overall 81,8 %, ECE 0,049).

## Capacidades

- Respuesta a preguntas tipadas sobre un estado: el estado puede ser un texto, una lista de textos o un JSON, y las preguntas se formulan con tipos definidos por el usuario.
- Clasificación de elección cerrada: la respuesta es siempre una de las etiquetas proporcionadas, nunca una etiqueta inventada.
- Puntuación en escalas definidas por el usuario: devuelve valores dentro del rango solicitado (aunque con debilidad reconocida en escalas nuevas).
- Abstención explícita: cada pregunta puede devolver "no respondible desde este estado" con probabilidad asociada, configurable mediante `null_threshold` o `min_confidence`.
- Calibración integrada: temperaturas de calibración incluidas en el checkpoint y umbral por defecto en `calibration.json`.
- Salida estructurada en una sola pasada forward, sin decodificación autoregresiva ni bucle de generación.
- Procesamiento de estados en inglés, con truncado a 512 tokens.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento extendido: es un modelo de decisión, no un generador.

## Casos de uso

- Triage de intención en atención al cliente: con un mensaje como estado y una pregunta de tipo `choice` con etiquetas como "estado de envío", "cancelación y reembolso" o "consulta de producto", el modelo devuelve la intención y permite enrutar el ticket sin pasar por un LLM generativo. Es adecuado porque las etiquetas quedan restringidas al conjunto definido y la latencia en GPU es de 16 ms.
- Enrutado de solicitudes en soporte multicanal: al recibir listas de mensajes como estado, puede asignar cada conversación a un equipo o cola concreta. La abstención permite derivar a revisión humana los casos ambiguos en lugar de forzar una asignación.
- Extracción de campos estructurados desde texto libre: tomando un JSON o un texto como estado y preguntas tipadas, se pueden poblar campos de un formulario (categoría, prioridad, producto) manteniendo las respuestas dentro de los valores permitidos.
- Triaje con revisión humana en flujos sensibles: en escenarios donde una clasificación errónea tiene coste, la probabilidad de abstención por pregunta permite automatizar solo los casos de alta confianza y escalar el resto. El modelo declara explícitamente que no debe usarse para decisiones de alto impacto sobre personas sin revisión humana.
- Componente "System One" dentro de arquitecturas de agentes: sirve como primera etapa rápida y barata que resuelve decisiones simples o decide si merece la pena invocar un modelo generativo mayor, reduciendo coste y latencia en el pipeline.
- Procesamiento por lotes de alto volumen en CPU: con unos 250 ms por petición en 8 núcleos ARM, puede desplegarse en infraestructura sin GPU para clasificación masiva de tickets, correos o registros.
- Puntuación de severidad o urgencia en escalas propias: puede asignar valores dentro de un rango definido (por ejemplo, urgencia de 1 a 10), teniendo en cuenta que la información disponible señala debilidad en escalas nuevas, por lo que requiere validación previa con datos propios.
- Validación y control de calidad de etiquetado: usar el modelo como segundo anotador sobre preguntas cerradas y comparar con las etiquetas humanas para detectar discrepancias en un conjunto de datos.

## Benchmarks y rendimiento

Datos publicados por el autor. Los valores de la primera tabla corresponden al conjunto de evaluación v0.2 promediado sobre tres ejecuciones de entrenamiento de cada tamaño, salvo la fila de latencia.

| Metrica | kodiak-small v2 (152 M) | kodiak-large v2 (~400 M) | Mejor clasificador zero-shot abierto probado |
|---|---|---|---|
| Tareas nunca vistas (12 tareas), accuracy forzada, preguntas de eleccion | 55,3 % | 60,9 % | 57,9 % |
| Tareas familiares | 81,7 % | 85,5 % | no disponible |
| Ocupacion a partir de una biografia (tarea nunca vista) | 63,3 % | 77,2 % | no disponible |
| Acierto cuando se abstiene | 91 % | 84 % | no disponible |
| Latencia en GPU | 8 ms | 16 ms | no disponible |
| Latencia en 8 nucleos ARM de CPU | ~80 ms | ~250 ms | no disponible |

Resultados del checkpoint publicado (b-base-s1-v2-s1, paso 6000):

| Evaluacion | Overall | Tareas familiares | Tareas nunca vistas | Tareas nunca vistas (forzada) | ECE |
|---|---|---|---|---|---|
| Eval v0.2 | 67,2 % | 85,4 % | 56,8 % | 61,0 % | 0,088 |
| Eval v0.1 | 81,8 % | no disponible | no disponible | no disponible | 0,049 |

Los autores indican que el error de calibración se degrada hasta aproximadamente 0,13 en tareas nunca vistas, para ambos tamaños.

## Requisitos de hardware

- Peso de los parametros: con 400 M de parametros, el repositorio ocupa 1,6 GB, lo que corresponde a precision FP32 (4 bytes por parametro). En FP16 los pesos bajarían a aproximadamente 0,8 GB.
- VRAM estimada para inferencia: del orden de 1-2 GB en FP32 y menos de 1 GB en FP16, sin caché KV al tratarse de un encoder sin decodificación autoregresiva.
- Cabe holgadamente en GPU de consumo: RTX 3060 (12 GB), RTX 4060, RTX 4090 y cualquier GPU con 4 GB o mas. Tambien es viable en CPU.
- Latencia de referencia aportada por el autor: 16 ms en GPU y unos 250 ms en 8 nucleos ARM de CPU por peticion.
- Opciones de despliegue: libreria propia kodiak (paquete `kodiak-s1[infer]`) que carga el modelo en GPU si esta disponible y en CPU en caso contrario; despliegue en Hugging Face Inference Endpoints mediante el `handler.py` incluido. No se contemplan vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo ni se distribuye en GGUF.
- El campo `inference: false` de la metadata indica que el modelo no es compatible con el widget de inferencia por defecto de Hugging Face al depender de una libreria personalizada.
- Throughput estimado: no disponible de forma explicita; a partir de las latencias publicadas, un unico flujo en GPU rondaria las 60 peticiones por segundo por dispositivo antes de considerar batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas nunca vistas (forzada) | Tareas familiares | Acierto al abstener | Latencia GPU | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|---|
| kodiak-large-v2-preview | 400 M | 512 tokens | 60,9 % | 85,5 % | 84 % | 16 ms | Apache-2.0 | HuggingFace, research preview |
| kodiak-small-v2-preview | 152 M | 512 tokens | 55,3 % | 81,7 % | 91 % | 8 ms | Apache-2.0 (segun ficha de la familia) | HuggingFace, research preview |
| Mejor clasificador zero-shot abierto probado por el autor | no disponible | no disponible | 57,9 % | no disponible | no disponible | no disponible | no disponible | no disponible |
| answerdotai/ModernBERT-large (modelo base) | ~395 M | mayor que 512 tokens en el backbone | no aplica | no aplica | no aplica | no disponible | Apache-2.0 | HuggingFace |

El autor no nombra el clasificador zero-shot concreto con el que compara, por lo que no se puede detallar su licencia ni su disponibilidad. La comparación con ModernBERT-large solo es válida como referencia de backbone: el modelo base no incorpora la capa de decisión, la calibración ni la abstención de Kodiak.

## Limitaciones y advertencias

- Abstención mas debil que la del modelo small: ante un mensaje que no nombra ninguna transportista, el large respondio "FedEx" con 0,46 de confianza donde el small se abstiene. Si un "no lo se" fiable importa mas que la accuracy, el autor recomienda usar el small o exigir un `min_confidence` mas alto.
- Calibracion menos fiable en entradas desconocidas: el error de calibracion sube a aproximadamente 0,13 en tareas nunca vistas. Un test de horizonte largo con aventuras de texto mostro respuestas erroneas con alta confianza en entradas distintas a los datos de entrenamiento; se recomienda escalar las respuestas de baja confianza.
- Puntuaciones de juicio en escalas nuevas: debilidad reconocida en ambos tamaños. Como ejemplo, el modelo valora "me han cobrado dos veces y nadie responde" en torno a 4/10 en urgencia.
- Errores de intencion puntuales donde el small acierta: por ejemplo, "la caja llego aplastada, la lampara rota" se clasifica como "estado de envio".
- Truncado de contexto: los estados de mas de 512 tokens se recortan, lo que puede eliminar informacion relevante en documentos largos o hilos de conversacion extensos.
- Solo ingles: no hay soporte multilingue, por lo que el uso con texto en castellano no esta cubierto ni evaluado.
- Sesgos conocidos: el conjunto Bias in Bios (inferencia de ocupacion) es una tarea held-out con sesgo de genero documentado.
- Uso restringido por el propio autor: no debe emplearse para decisiones de alto impacto sobre personas sin revision humana.
- Estado de investigacion: es un "research preview" con 0 descargas en el momento de la consulta, sin garantias de estabilidad de API ni de mantenimiento a largo plazo.
- Licencia Apache-2.0 en el modelo, lo que permite uso comercial del checkpoint; conviene verificar por separado la licencia del paquete `kodiak-s1` y del codigo asociado antes de integrarlo en produccion.
- Riesgo de alucinacion acotado por diseno en preguntas de eleccion (las respuestas se restringen a las etiquetas dadas), pero no en preguntas abiertas ni en la estimacion de confianza.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cortex-agent-llc/kodiak-large-v2-preview
- Variante small: https://huggingface.co/cortex-agent-llc/kodiak-small-v2-preview
- Repositorio de codigo y evaluacion: https://github.com/grizzlypeaksoftware/kodiak
- Documentacion de estrategia y criterios de release: https://github.com/grizzlypeaksoftware/kodiak/blob/main/docs/STRATEGY.md
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-large
