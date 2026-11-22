# convaiinnovations/laya-typed-decisions

## Resumen

Laya Typed-Decisions es un modelo de clasificación de texto desarrollado por ConvAI Innovations, miembro de la familia Laya de modelos de decisión no autorregresivos. Se trata de un fine-tuning de ModernBERT-large (421 millones de parámetros) especializado en cuatro flujos de trabajo concretos: observabilidad de trazas de agentes, atención al cliente, procesamiento de facturas e incidentes de seguridad. El modelo no genera texto: emite decisiones tipadas con probabilidad asociada, conjunto conformal, y banderas de abstención y fuera de distribución.

La propuesta técnica es un enfoque "System 1": en lugar de generar una respuesta token a token, el modelo proyecta la entrada en un espacio de decisión donde cada respuesta candidata es un valle y la entrada es una partícula que rueda y se asienta en uno de ellos. El resultado es determinista, de coste constante y con una probabilidad calibrada asociada. El checkpoint aquí descrito emplea el encoder clásico ModernBERT-large con 1.024 tokens de contexto.

El modelo es relevante para equipos que necesitan clasificación fiable y calibrada en producción con capacidad de abstenerse cuando la confianza no alcanza el umbral de riesgo configurado (10% por defecto). Su licencia Apache 2.0 permite uso comercial sin restricciones, y el ecosistema incluye un motor de decisión alternativo (vegaml) con soporte multimodal y aprendizaje continuo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-large), no autorregresivo |
| Parámetros totales | 421.293.830 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en ModernBERT-large, un transformer encoder con 421 millones de parámetros y ventana de contexto de 1.024 tokens. La arquitectura es no autorregresiva: no genera secuencias token a token, sino que produce una decisión tipada directamente sobre la representación de la entrada. El fine-tuning se realizó sobre los flujos de trabajo del dataset `typed-decisions`, que cubre observabilidad de trazas de agentes, atención al cliente, procesamiento de facturas e incidentes de seguridad.

La innovación técnica central es el mecanismo de decisión "System 1" inspirado en el motor vegaml: cada respuesta candidata se modela como un valle en un espacio de decisión de baja dimensión, y la entrada se coloca como una partícula que rueda y se asienta en uno de ellos. La profundidad del asentamiento determina la probabilidad de la respuesta. El modelo incorpora calibración de umbral para que, entre las respuestas que emite, la tasa de error se mantenga por debajo del riesgo configurado (10% por defecto). También produce un conjunto conformal (`prediction_set`) a nivel alpha 0.10 y una bandera `unbound` para entradas fuera de distribución. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Clasificación de texto con decisión tipada: devuelve la respuesta, su probabilidad, el conjunto conformal y las banderas `abstain` y `unbound`.
- Abstención calibrada: rechaza comprometerse cuando la confianza no alcanza el umbral de riesgo configurado.
- Conjunto conformal: identifica cuándo la entrada es ambigua (más de una opción posible a alpha 0.10).
- Detección de entradas fuera de distribución mediante la bandera `unbound`.
- Enrutamiento (`route`): decide entre `auto` o `review` según abstención, tamaño del conjunto conformal o banda de precisión calibrada con etiquetas.
- Aprendizaje continuo mediante `laya.Learner`: aprende de respuestas confirmadas por el equipo en segundos sobre CPU, sin fine-tuning.
- Soporte de cuatro flujos de trabajo: observabilidad de agentes, atención al cliente, facturación e incidentes de seguridad.
- Idioma: inglés.
- No soporta tool calling, generación de texto, visión, audio ni razonamiento multi-paso (el checkpoint clásico es solo clasificación; el motor vegaml del ecosistema sí añade multimodalidad y 73.728 tokens de contexto).

## Casos de uso

- Observabilidad de trazas de agentes: el modelo clasifica trazas de ejecución de agentes LLM para etiquetar eventos, detectar anomalías y enrutar las trazas dudosas a revisión humana mediante la bandera `route`.
- Atención al cliente automatizada: clasifica tickets y mensajes entrantes en categorías tipadas con probabilidad calibrada, absteniéndose cuando la confianza es baja para derivar a un agente humano.
- Procesamiento de facturas: clasifica documentos y campos de facturación en categorías contables, con conjunto conformal para señalar facturas ambiguas que requieren revisión manual.
- Gestión de incidentes de seguridad: clasifica alertas y eventos de seguridad en categorías de incidente, con control de la tasa de error por debajo del umbral configurado.
- Puerta de enrutamiento en pipelines: integrado como clasificador previo que decide si una entrada se procesa automáticamente o se envía a revisión, usando `route` en lugar de umbrales de confianza ad hoc.
- Mejora continua con datos propios: usando `laya.Learner`, el equipo confirma respuestas y el modelo se recalibra en segundos sobre CPU, adaptándose a la distribución específica de la organización sin reentrenar los 421M de pesos.
- Clasificación de alto volumen con coste constante: al ser no autorregresivo, el coste por inferencia es fijo y determinista, adecuado para procesar grandes volúmenes de mensajes o documentos.

## Benchmarks y rendimiento

Los benchmarks publicados en la model card corresponden al motor vegaml y al encoder clásico en escenarios de aprendizaje continuo, no exclusivamente a este checkpoint. Se reproducen a continuación los datos disponibles.

Aprendizaje continuo (14 plantillas de decisión, 31 preguntas, 60 filas reservadas por plantilla):

| Modelo | Día uno | Tras 40 respuestas confirmadas | Tras 120 |
|---|---|---|---|
| laya, `laya.Learner` | 84,7% | 91,6% | 96,0% |
| Jev 1.14 | 89,5% | 91,5% | 92,6% |

Aprendizaje desde flujo (lector de 4B, filas reservadas, noviembre 2026):

| Modelo | banking77 (924 reservadas, tras 4.928 filas) | typed-decisions (2.000 decisiones, tras 1.200 filas) |
|---|---|---|
| laya | 87,5%, ECE 0,028, 92,5% enrutado auto a 91,5% de precisión | 73,7%, ECE 0,031 |
| Jev 1.14 | 79,4% tal cual (ECE 0,078), 85,7% con ejemplos | 74,7%, ECE 0,047 |

Rendimiento entre lectores (motor de decisión idéntico, 50.676 registros reservados): 0,8B 76,5%, 4B 79,1%, 27B 81,1%, con ECE entre 0,010 y 0,021.

Coste del aprendizaje: 300 respuestas en 34 s sobre 8 hilos de CPU (0,72 s por respuesta, 6,4 GB de RAM); en GPU, 40 ms y 2 GB. El fine-tuning clásico del encoder sobre las mismas 300 filas tarda 89 s en GPU con 9 GB y reescribe los 421M de pesos.

Limitación declarada: en suites públicas genéricas zero-shot, un modelo alojado grande lidera. Como puerta de inyección de prompts en tráfico real (ToxicChat, 1,8% de ataques), Jev sin entrenar detecta el 79,1% con 0,3% de rechazos, frente al 73,0% con 0,7% de una cabeza ajustada.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint tiene 421M de parámetros (aproximadamente 0,8 GB en fp32, ~0,4 GB en fp16). Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 y H100 son más que suficientes. También funciona en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes.
- Opciones de despliegue: transformers (librería nativa), endpoints compatibles, despliegue en Azure; el ecosistema laya se instala con `pip install -U laya`.
- Latencia y throughput: no se publican cifras específicas de latencia para este checkpoint. El aprendizaje continuo con `laya.Learner` tarda 0,72 s por respuesta en CPU (8 hilos) y 40 ms en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| laya-typed-decisions | 421M | 1.024 | inglés | Apache 2.0 | Clasificación con decisión tipada, abstención y conformal |
| laya (base) | 421M | 512 | inglés | Apache 2.0 | Clasificación general en inglés |
| laya-multilingual | 322M | 1.024 | 100+ idiomas | Apache 2.0 | Clasificación multilingüe (mmBERT-base) |
| Jev 1.14 | no disponible | no disponible | no disponible | API alojada | Decisión por criterios, sin aprendizaje propio |

No se dispone de datos de benchmarks comparativos directos entre estos checkpoints en las mismas tareas; los datos de la model card comparan el ecosistema laya con Jev 1.14 en escenarios de aprendizaje continuo (ver sección de benchmarks).

## Limitaciones y advertencias

- Solo inglés: no soporta otros idiomas; para multilingüe existe `laya-multilingual`.
- Contexto limitado a 1.024 tokens: documentos o hilos más largos deben truncarse o dividirse.
- La bandera `unbound` no es fiable como único criterio de enrutamiento: según la model card, se activó en el 71% de filas normales de banking77, por lo que enviaría la mayoría de buenas respuestas a revisión.
- El umbral de abstención está calibrado para una tasa de error del 10% por defecto; debe recalibrarse con datos propios para otros niveles de riesgo.
- Riesgo de alucinación no aplica en el sentido generativo (no genera texto), pero sí puede producir clasificaciones erróneas en entradas ambiguas o fuera de distribución; el conjunto conformal y la abstención mitigan este riesgo.
- En suites públicas genéricas zero-shot, un modelo alojado grande supera a laya; el modelo está optimizado para los cuatro flujos de trabajo del dataset `typed-decisions`.
- Como puerta de inyección de prompts, su rendimiento es inferior a Jev sin entrenar en tráfico real (73,0% frente a 79,1% de detección).
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales conocidas.
- No se dispone de información sobre sesgos específicos del modelo ni sobre la composición del dataset de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Familia Laya: https://huggingface.co/convaiinnovations/laya
- Dataset typed-decisions: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Repositorio vegaml: https://github.com/NandhaKishorM/vegaml
- Studio (entrenamiento de motores de decisión): https://studio.embedding.in
