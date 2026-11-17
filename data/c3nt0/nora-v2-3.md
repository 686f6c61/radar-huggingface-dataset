# C3Nt0/nora-v2.3

## Resumen

Nora V2.3 es un clasificador de intenciones (intent classification) en italiano especializado en conversaciones de WhatsApp de clínicas dentales. Lo desarrolla el autor C3Nt0 bajo el paraguas del proyecto Lumora/Nora y se distribuye con licencia Apache-2.0. A diferencia de un LLM generativo, el modelo resuelve una tarea acotada: asignar cada turno de una conversacion a una de cinco intenciones (`booking`, `info`, `price`, `urgent`, `other`), manteniendo estado de sesion a lo largo de chats largos.

Tecnicamente, parte de un encoder mmBERT-base (405,6 millones de parametros) al que se le anaden dos modulos propios: una memoria Engram insertada en las capas 6 y 12, y una cabeza de decision denominada Laya. El estado de la sesion se gestiona mediante ranuras `[MEM]` y un mecanismo de compactacion asincrona del contexto, pensado para hilos de decenas de turnos. El modelo se inicializa desde C3Nt0/nora-v2.2 y se reentrena con el dataset C3Nt0/nora-v2.3-final-45k.

La version 2.3 responde a una debilidad concreta de la 2.2: el clasificador era solido en `booking` y `urgent` pero flojo en `other` (aproximadamente 48% en el conjunto conv-3k). V2.3 fuerza un prior plano del 20% sobre las cinco clases e introduce turnos de cambio de intencion (`long_switch`) para corregir ese sesgo, a costa de ceder algo de rendimiento en las clases fuertes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder mmBERT-base + memoria Engram (capas 6 y 12) + cabeza de decision Laya |
| Parametros totales | 405.624.838 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens en entrenamiento (cabeza limitada a 256) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Italiano (`it`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, `engram.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un encoder de clasificacion, no un transformer decoder generativo. Sobre la base mmBERT-base se insertan tablas de memoria Engram en las capas 6 y 12, que aportan informacion persistente de la sesion de conversacion, y una cabeza Laya que produce la etiqueta de intencion. El estado conversacional se representa en ranuras `[MEM]` con un mecanismo de compactacion asincrona del contexto, lo que permite mantener coherencia en hilos de 20 a 80 turnos sin crecer linealmente en memoria.

El reentrenamiento se hizo sobre C3Nt0/nora-v2.3-final-45k, 2 epocas, con DDP en 2 x T4 de Kaggle, micro-lote de 6 por GPU (12 efectivo) y unos 28k pasos por rango. Se aplican tasas de aprendizaje diferenciadas: 8e-4 para Engram, 2e-5 para el encoder y 1e-4 para la cabeza. La funcion de perdida combina entropia cruzada estandar con un termino de RL, sin explicaciones de cadena de pensamiento. El cambio clave frente a V2.2 es el prior plano del 20% por clase, los turnos `long_switch`, los pares de capa 12 y los recortes anti-`other` pegajoso.

## Capacidades

- Clasificacion de intencion en cinco clases: `booking`, `info`, `price`, `urgent`, `other`.
- Mantenimiento de estado de sesion multi-turno mediante ranuras `[MEM]` y compactacion de contexto.
- Manejo de conversaciones largas (hasta 1024 tokens de entrada) con turnos de cambio de intencion.
- Idioma unico: italiano.
- Sin generacion de texto, sin tool calling, sin capacidades de agente mas alla de la clasificacion.
- Sin vision ni audio.
- Sin modo de razonamiento explicito (no produce CoT).

## Casos de uso

- Triaje de bandeja de entrada de WhatsApp en clinicas dentales: el modelo etiqueta cada mensaje entrante como `booking`, `info`, `price`, `urgent` u `other`, permitiendo enrutar automaticamente a agenda, recepcion, facturacion o alerta clinica.
- Deteccion de urgencias clinicas: la clase `urgent` (0,845 en la evaluacion parcial) sirve para disparar notificaciones al personal de guardia cuando un paciente describe dolor agudo o sangrado.
- Enrutado de consultas de precio: la clase `price` (0,547, la mas debil) puede usarse como primera pasada y combinarse con reglas o un segundo modelo para confirmar antes de responder con el listado.
- Gestion de conversaciones largas en recepcion: gracias a `[MEM]` y a la compactacion de contexto, el modelo mantiene la intencion global en hilos de decenas de turnos, util para clientes que alternan entre preguntas de horario y reserva.
- Analitica de demanda: clasificar historicos de conversaciones para medir la proporcion de `booking` frente a `info` y planificar capacidad de agenda.
- Filtrado de ruido conversacional: la clase `other` con 0,994 permite descartar saludos, confirmaciones y mensajes ambiguos antes de pasarlos a un LLM generativo, reduciendo coste de inferencia.

## Benchmarks y rendimiento

Evaluacion parcial sobre 300 dialogos de `nora-v2.2-eval-conv-3k` (20-80 turnos), `max_len=1024`, en CPU. n = 14.707 turnos.

| Metrica | Valor |
|---|---|
| Overall | 0,774 |
| Switch-turn | 0,740 (n = 6085) |
| `other` | 0,994 |
| `urgent` | 0,845 |
| `booking` | 0,797 |
| `info` | 0,745 |
| `price` | 0,547 |

El autor indica que el conjunto completo de conv-3k (~150k turnos) en doble T4 y la ablacion de ventana de contexto con `max_len=2048` quedan pendientes. Frente a V2.2 en conv-3k completo (~0,801 overall), V2.3 cede rendimiento en `booking`, `urgent` e `info` a cambio de una mejora grande en `other`. No hay resultados publicados de MMLU, HumanEval, GSM8K ni benchmarks genericos, y no corresponden a la tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por tamano (~405M parametros), en fp32 serian unos 1,6 GB y en fp16 unos 0,8 GB de pesos, mas memoria de activaciones y tablas Engram.
- GPU recomendadas: el autor entrena en 2 x T4; para inferencia basta una GPU consumer de gama media.
- Cabe en GPU consumer: si, por tamano, aunque no hay cifras oficiales de VRAM minima.
- Opciones de despliegue: transformers con el loader `nora_v2.model.build_nora_v2` del bundle `C3Nt0/nora-v2-colab-bundle`; el autor no documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| Nora V2.3 | 405,6 M | 1024 | Clasificacion de intencion dental en italiano | Apache-2.0 | Estado de sesion Engram, tarea muy especifica |
| Nora V2.2 | No disponible | No disponible | Misma tarea | Apache-2.0 | Base de V2.3, ~0,801 overall en conv-3k completo |
| mmBERT-base | No disponible | No disponible | Encoder multilingue generico | No disponible en la informacion | Backbone sin cabeza de clasificacion dental |

No se dispone de comparaciones con clasificadores de intencion genericos ni con LLMs en la informacion proporcionada.

## Limitaciones y advertencias

- Solo italiano; no soporta otros idiomas.
- Clase `price` claramente debil (0,547): no fiable para enrutado automatico de facturacion sin supervision adicional.
- Evaluacion parcial sobre 300 dialogos en CPU; el autor no ha publicado la suite completa conv-3k ni la ablacion con `max_len=2048`.
- El autor la describe como "checkpoint de investigacion privado para el pipeline Lumora / Nora"; conviene validar su idoneidad antes de usarla en produccion.
- Requiere el loader propio del bundle de Colab; no es un modelo que funcione solo con `AutoModelForSequenceClassification`.
- Riesgo de dependencia del dominio dental y de WhatsApp: el rendimiento fuera de ese contexto no esta medido.
- Aunque la licencia es Apache-2.0, no hay documentacion sobre sesgos ni sobre el proceso de anotacion del dataset de entrenamiento.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de clasificacion erronea en turnos ambiguos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/C3Nt0/nora-v2.3
- Modelo base: https://huggingface.co/C3Nt0/nora-v2.2
- Dataset de entrenamiento: https://huggingface.co/datasets/C3Nt0/nora-v2.3-final-45k
- Bundle de codigo y notebooks: https://huggingface.co/C3Nt0/nora-v2-colab-bundle
