# noscienthoon/ouro-2.6b-decision-lora

## Resumen

ouro-2.6b-decision-lora es un adaptador LoRA (r=16, un 1,2 % de los parámetros del modelo base) más una cabeza de puntuación de 2 capas, construido sobre ByteDance/Ouro-2.6B, un modelo de lenguaje con arquitectura "looped" de 48 capas y 4 pasos recurrentes. No es un modelo generativo: recibe un estado (cualquier estructura JSON serializable o una cadena) y devuelve distribuciones de probabilidad tipadas en una única pasada, sin producir texto. Lo publica el usuario noscienthoon bajo licencia Apache-2.0.

El modelo responde a tres tipos de pregunta con la misma forma que la API Jev de TypeSafe: `choice` (distribución sobre opciones), `score` (distribución sobre niveles ordenados más el nivel esperado) y `noul` (probabilidad P(verdadero)). La cabeza lee el hidden state del último token de la secuencia `estado + pregunta + opciones listadas + "Answer: <letra>"` y suma un múltiplo aprendido del log-probability del siguiente token de la letra, de modo que en la inicialización puntúa exactamente igual que el modelo base por prompting y el entrenamiento solo aprende un residuo.

Su relevancia es práctica: demuestra que un ajuste fino pequeño y barato (2.000 ejemplos de ARC-Easy y 2.000 de BoolQ, 1 epoch, ~45 minutos en una RTX 4090) puede convertir un modelo de 2,6 B en un clasificador calibrado que se acerca a modelos frontier en una evaluación pública de decisión, con probabilidades utilizables (ECE 0,078 fuera de dominio) en lugar de texto libre que hay que parsear.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=16) + cabeza de puntuación de 2 capas sobre un LM "looped" (48 capas, 4 pasos recurrentes) |
| Parámetros totales | Modelo base de 2,6 B; el adaptador representa un 1,2 % adicional (121 MB en safetensors) |
| Parámetros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | Backbone hasta 65k tokens; entrenamiento con 512; `max_query_len` por defecto 4096 en inferencia (truncado por la izquierda) |
| Tipos de cuantización | No disponible; la model card solo documenta bf16 (~6 GB) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 (adaptador); modelo base Ouro-2.6B Apache-2.0; datos ARC CC BY-SA 4.0 y BoolQ CC BY-SA 3.0 |
| Formato de pesos | safetensors (adaptador PEFT en `adapter/`, 121 MB) + `head.pt` (state dict de la cabeza, 4 MB, PyTorch) |
| Modelo base | ByteDance/Ouro-2.6B |
| Pipeline | text-classification |
| Librería | peft |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Publicación | Creado y actualizado el 19 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo base Ouro-2.6B es un transformer con cómputo recurrente: 48 capas aplicadas durante 4 pasos (`total_ut_steps = 4`). Sobre él se monta un adaptador LoRA de rango 16 y una cabeza de 2 capas que consume el hidden state del último token de la plantilla `state + question + listed options + "Answer: <letter>"`. La puntuación final combina la salida de la cabeza con un múltiplo aprendido del log-probability del siguiente token correspondiente a cada letra, de forma que el punto de partida reproduce el comportamiento del prompting del modelo base y el entrenamiento aprende únicamente una corrección residual. Las opciones se barajan durante el entrenamiento, por lo que la puntuación no depende del orden en que se listen.

El entrenamiento usó 2.000 registros de ARC-Easy (tipo `choice`, 3-5 opciones) y 2.000 de BoolQ (tipo `noul`), 1 epoch, learning rate 5e-5, batch 4 con 4 pasos de acumulación y gradient checkpointing, unas 45 minutos en una RTX 4090. La pérdida combina entropía cruzada con Brier sobre la distribución de opciones, y el checkpoint se seleccionó por NLL calibrado en el conjunto de validación. La calibración final aplica una temperatura global T = 1,3155 ajustada en validación de ARC+BoolQ (ECE de 0,027 a 0,013); en datos fuera de dominio el modelo queda algo sobreconfiado (ECE 0,078 en la evaluación de TypeSafe). Es destacable la dependencia del número de pasos recurrentes: con 2 pasos el baseline por prompting cae a ARC 77,5 / BoolQ 77,3, y con 1 paso a 57,5 / 37,8, por lo que hay que mantener los 4 pasos.

## Capacidades

- Clasificación y decisión estructurada: devuelve distribuciones de probabilidad tipadas, no texto, en una sola pasada forward.
- Preguntas de tipo `choice`: distribución sobre un conjunto de opciones etiquetadas (por ejemplo, colas de soporte, categorías, intenciones).
- Preguntas de tipo `score`: distribución sobre niveles ordenados más el valor esperado del nivel (por ejemplo, prioridad 2,3 sobre una escala de 4 niveles).
- Preguntas de tipo `noul`: probabilidad calibrada de que una afirmación sea verdadera (P(true)).
- Calibración explícita: temperatura almacenada aplicada por defecto, sobrescribible con el parámetro `temperature=`.
- Invariancia al orden: las opciones se barajan en entrenamiento, así que la puntuación no depende de cómo se listen.
- Entrada flexible: acepta cualquier `state` serializable en JSON; si es una cadena, se usa tal cual; cualquier otra cosa se formatea como JSON.
- Salida con `confidence` por pregunta y leyenda (`legend`) en las preguntas de tipo `score`.
- Manejo de estados largos: truncado por la izquierda con `max_query_len`, conservando siempre el final del estado y la pregunta.
- Capacidades ausentes: no genera texto, no soporta tool calling ni function calling, no implementa agentes multi-paso, no tiene visión ni audio, y solo trabaja en inglés.

## Casos de uso

- Triaje de tickets de soporte: con `choice` se enruta cada ticket a la cola correcta (facturación, envíos, técnico, general) usando el asunto y el cuerpo del mensaje como estado. El flujo de facturación es el mejor cubierto por el modelo en la evaluación pública (82,6 % de acierto sobre 184 pares).
- Priorización de incidencias: con `score` se obtiene una distribución sobre niveles Low/Normal/High/Critical y un valor esperado continuo que se puede mapear a SLA o a umbrales de escalado. Conviene refitear la temperatura si se depende de las probabilidades.
- Detección de urgencia o enfado del cliente: con `noul` se obtiene una probabilidad directa (por ejemplo, P(cliente enfadado) = 0,87) que se puede usar como señal de enrutado preferente o de alerta para un agente humano.
- Enrutado de colas en atención al cliente: el workflow de customer service alcanza un 78,3 % sobre 92 pares, suficiente para un primer nivel de clasificación con revisión humana en los casos de baja confianza.
- Observabilidad de trazas de agentes: el modelo clasifica trazas de agentes (workflow agent trace, 70,8 % sobre 48 pares) para etiquetar pasos, detectar anomalías o decidir si una traza requiere inspección. Es un dominio no visto en entrenamiento, así que funcionará mejor con una recalibración sobre datos propios.
- Filtrado y moderación booleana en pipelines: cualquier comprobación binaria ("¿este mensaje contiene una petición de reembolso?") se formula como pregunta `noul` y se resuelve en una pasada, sin generar texto ni parsear salidas.
- Enrutado de bajo coste delante de un LLM grande: usar este adaptador de 2,6 B (~6 GB en bf16) para resolver los casos fáciles y derivar al modelo frontier solo las decisiones con baja confianza, reduciendo coste por token.
- Evaluación automática de respuestas de LLM: la formulación `choice` permite usarlo como juez de opción múltiple sobre conjuntos tipo ARC-Easy o BoolQ, donde rinde 97,2 y 91,4 respectivamente en datos retenidos del mismo dominio.
- Detección de incidentes de seguridad: el workflow de seguridad es el más débil (56,2 % sobre 48 pares), por lo que solo es recomendable como señal auxiliar, nunca como decisión única.

## Benchmarks y rendimiento

Evaluación pública de TypeSafe (evals.typesafe.ai, reconstruida con el harness abierto de system-one-open): 20 casos, 372 pares de referencia, subconjunto común estricto de 343 pares respondidos por todos los modelos publicados. Ninguno de los cuatro flujos evaluados (incidentes de seguridad, observabilidad de trazas de agentes, procesamiento de facturas, atención al cliente) estaba en los datos de entrenamiento.

| Modelo | Precisión (343 pares comunes) |
|---|---|
| Opus / Sol (modelos frontier sobre los que se construyeron las referencias) | 89,5 / 90,4 |
| Jev (TypeSafe) | 86,6 |
| Este modelo (entrenado solo con ARC-Easy + BoolQ) | 76,7 (ECE 0,078, NLL 0,653) |
| system-one-open, Gemma 4 E2B (entrenado con 70 tareas + 59k sintéticos) | 76,7 |
| Qwen2.5-7B por prompting (jev-on-a-laptop) | 73,8 |
| Ouro-2.6B por prompting, sin entrenamiento (misma plantilla, lectura de letra) | 63,3 |
| Respuesta mayoritaria por pregunta (conoce el test) | 81,0 |

Desglose sobre los 372 pares (76,6 % global): por flujo, facturas 82,6 (184), atención al cliente 78,3 (92), trazas de agentes 70,8 (48) y seguridad 56,2 (48). Por tipo, `noul` 80,9 (236), `choice` 76,1 (109) y `score` 40,7 (27, un tipo ausente de los datos de entrenamiento). Con 372 pares, los números por flujo llevan aproximadamente ±7-14 puntos de error de muestreo.

En dominio (500 elementos retenidos por tarea, temperatura ajustada en el mismo conjunto de validación):

| Métrica | Antes de entrenar (prompting del base) | Tras 1 epoch |
|---|---|---|
| Precisión ARC-Easy | 95,1 | 97,2 |
| Precisión BoolQ | 87,4 | 91,4 |
| NLL (ambas, calibrado) | 0,292 | 0,165 |

Tareas retenidas (nunca entrenadas, temperatura no reajustada):

| Tarea | Tras 1 epoch | Qwen2.5-7B por prompting |
|---|---|---|
| OpenBookQA (500) | 90,4 | 83,2 |
| CommonsenseQA (1.221) | 79,3 | 81,2 |
| HellaSwag (2.000) | 70,5 | 77,0 |

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 6 GB en bf16 según la model card (modelo base de 2,6 B más adaptador y cabeza).
- Entrenamiento reproducido: una RTX 4090, 1 epoch en unos 45 minutos sobre 4.000 registros totales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16. Cabe en tarjetas de consumo como RTX 3060 12 GB, RTX 4070, RTX 4080 o RTX 4090; para despliegues en servidor, A100, H100 o L40S son suficientes pero sobredimensionadas para 2,6 B.
- Cabe en GPU de consumo: sí, con holgura en 12 GB o más.
- Opciones de despliegue: `transformers==4.54.1` + `peft==0.17.1` + `torch`, cargando el modelo base con `trust_remote_code=True` (el código remoto de Ouro rompe en transformers 5.x). No hay pesos GGUF publicados ni soporte documentado en vLLM, llama.cpp, Ollama o TGI para esta combinación de código remoto y cabeza personalizada.
- Coste por consulta: cada opción se puntúa como una secuencia propia (`estado + pregunta + opciones + "Answer: A"`), de modo que una pregunta con K opciones cuesta K pases forward del prefijo. La caché recurrente de Ouro no admite prefix sharing.
- Latencia y throughput: no disponibles de forma explícita; el factor dominante es el número de opciones por pregunta y el número de preguntas por estado.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Precisión TypeSafe (343 pares) | Licencia |
|---|---|---|---|---|
| ouro-2.6b-decision-lora | 2,6 B + LoRA (1,2 %) | Adaptador de decisión calibrado | 76,7 | Apache-2.0 |
| Ouro-2.6B por prompting | 2,6 B | Modelo base generativo sin ajuste | 63,3 | Apache-2.0 |
| system-one-open (Gemma 4 E2B) | No disponible | Ajuste fino con 70 tareas y 59k ejemplos sintéticos | 76,7 | No disponible |
| Qwen2.5-7B por prompting | 7 B | Prompting con plantilla | 73,8 | No disponible en la información |
| Jev (TypeSafe) | No disponible | API propietaria de decisión | 86,6 | Propietaria |
| Opus / Sol | No disponible | Modelos frontier | 89,5 / 90,4 | No disponible |

En tareas de sentido común retenidas, el adaptador supera a Qwen2.5-7B por prompting en OpenBookQA (90,4 frente a 83,2) pero queda por debajo en CommonsenseQA (79,3 frente a 81,2) y HellaSwag (70,5 frente a 77,0). Frente al modelo base sin ajustar, el entrenamiento eleva la precisión en ARC-Easy de 95,1 a 97,2 y en BoolQ de 87,4 a 91,4, y reduce el NLL de 0,292 a 0,165.

## Limitaciones y advertencias

- Solo inglés: el campo de idioma declarado es `en`, no hay evaluación multilingüe y el entrenamiento se hizo con ARC-Easy y BoolQ, ambos en inglés.
- El tipo `score` es el más débil: 40,7 % de precisión sobre 27 pares, y ese tipo de pregunta no estaba presente en los datos de entrenamiento.
- El flujo de seguridad rinde muy por debajo (56,2 % sobre 48 pares); no debe usarse como única señal en decisiones de seguridad.
- Los números por flujo tienen un error de muestreo aproximado de ±7-14 puntos con 372 pares; las conclusiones por dominio deben tomarse con cautela.
- Sobreconfianza fuera de dominio: ECE 0,078 en la evaluación de TypeSafe frente a 0,013 en validación. La propia model card recomienda reajustar la temperatura T sobre una muestra etiquetada de la tarea propia si se van a usar las probabilidades.
- Riesgo de alucinación: limitado en el sentido generativo (no produce texto), pero las probabilidades pueden ser erróneas y confiadas en dominios alejados del entrenamiento; la evaluación incluye dominios nunca vistos (facturas, atención al cliente, trazas de agentes).
- Restricciones de licencia: el adaptador es Apache-2.0 y el modelo base también, pero los datos de entrenamiento tienen licencias CC BY-SA (ARC CC BY-SA 4.0, BoolQ CC BY-SA 3.0), lo que conviene revisar si se redistribuye un modelo derivado.
- Dependencias frágiles en producción: requiere `transformers<4.56` (el código remoto de Ouro falla en 5.x), `peft>=0.17,<0.18` y `trust_remote_code=True`, lo que añade riesgo de ejecución de código remoto y complica el despliegue en servidores de inferencia estándar.
- El backbone exige `total_ut_steps = 4`: reducir la recurrencia a 2 o 1 pasos degrada drásticamente el baseline (de 95,1/87,4 a 77,5/77,3 y a 57,5/37,8 en ARC/BoolQ).
- Coste de inferencia proporcional al número de opciones (K pases forward por pregunta) y sin prefix sharing por la caché recurrente, lo que encarece las preguntas con muchas alternativas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no hay validación independiente fuera de la propia model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/noscienthoon/ouro-2.6b-decision-lora
- Modelo base ByteDance/Ouro-2.6B: https://huggingface.co/ByteDance/Ouro-2.6B
- Evaluación pública de TypeSafe: https://evals.typesafe.ai
- Harness abierto system-one-open: https://github.com/mithalouni/system-one-open
- No se han encontrado otros enlaces relevantes (papers, blogs o demos) en la búsqueda web proporcionada.
