# Mytho0610/cinema-bot-rasa-vi

## Resumen

Cinema-bot-rasa-vi es un modelo de diálogo orientado a tareas (task-oriented dialogue) construido con Rasa 3.6 y entrenado para gestionar reservas de entradas de cine en vietnamita. Lo publica el usuario Mytho0610 en Hugging Face bajo licencia CC BY 4.0. No se trata de un modelo de lenguaje neuronal con pesos propios, sino de un proyecto Rasa completo (pipeline NLU, historias, reglas, dominio y acciones personalizadas) empaquetado como artefacto descargable de 0,1 GB.

El bot implementa un formulario `booking_form` que recoge película, cine, ubicación, horario y número de entradas, solicita confirmación y cierra la reserva. Las consultas fuera de dominio (chitchat) se derivan a una API externa de LLM mediante la acción `action_chitchat_api` y, tras responder, el bot retoma el flujo de reserva. Esto lo convierte en un ejemplo práctico de arquitectura híbrida: NLU determinista para la tarea transaccional y LLM para conversación abierta.

Su relevancia es acotada: es un proyecto de nicho, con cero descargas y cero likes en el momento de la consulta, orientado a quien necesite una base funcional de asistente de reservas en vietnamita sobre Rasa 3.6. No compite con modelos fundacionales; su interés está en el diseño del flujo, la anotación de intenciones y entidades a partir de Taskmaster-1 y TicketTalk, y la integración de un fallback generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Rasa 3.6 (pipeline NLU + política de diálogo basada en historias/reglas + formularios), no es un transformer con pesos publicados |
| Parametros totales | no disponible (artefacto Rasa; el tamaño del repo es 0,1 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del pipeline NLU configurado y de la API LLM externa para chitchat) |
| Tipos de cuantizacion | no aplica (no se distribuyen pesos en safetensors ni GGUF) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | CC BY 4.0 |
| Formato de pesos | artefacto Rasa (`model.tar.gz`) descargable vía `huggingface_hub`; no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

El proyecto sigue la arquitectura estándar de Rasa 3.6: un pipeline de NLU para clasificación de intenciones y extracción de entidades, un conjunto de historias y reglas que definen el flujo conversacional, un `booking_form` para la recogida estructurada de slots (película, cine, ubicación, horario, número de entradas) y acciones personalizadas en Python, entre ellas `action_chitchat_api` para derivar consultas fuera de dominio a un LLM externo y una integración opcional con TMDB para información de películas.

Los datos de entrenamiento proceden de GEM/Taskmaster (TicketTalk) y ConvLab/tm1 (Taskmaster-1). Según la model card, las intenciones y entidades se etiquetaron a partir de las llamadas a API y los dialogue acts de los corpus originales, y después se tradujeron automáticamente al vietnamita preservando las entidades. Se añadieron además utterances generadas a partir de plantillas en vietnamita y variantes sin diacríticos. No se documenta el volumen exacto de ejemplos, el número de tokens ni procesos de RLHF o DPO, que no aplican a este tipo de artefacto.

## Capacidades

- Clasificación de intenciones y extracción de entidades para el dominio de reserva de entradas de cine en vietnamita.
- Gestión de un formulario de reserva con slots de película, cine, ubicación, horario y número de entradas, con paso de confirmación.
- Reconocimiento de variantes sin diacríticos del vietnamita, según los datos de entrenamiento descritos.
- Derivación de preguntas fuera de dominio a una API LLM externa mediante `action_chitchat_api`, con retorno posterior al flujo de reserva.
- Integración opcional con TMDB para recuperar información de películas.
- Despliegue como servidor HTTP de Rasa (`rasa run --enable-api`) con CORS configurable.
- No incluye capacidades de visión, audio, generación de código ni razonamiento matemático.

## Casos de uso

- Prototipo de asistente de reservas para una cadena de cines vietnamita: el `booking_form` recoge los cinco slots necesarios y confirma la reserva, lo que permite validar el flujo conversacional antes de invertir en un modelo propio.
- Base para un bot de atención al cliente en vietnamita con separación de responsabilidades: la tarea transaccional queda en Rasa y las preguntas abiertas se enrutan a un LLM, reduciendo el riesgo de que el modelo generativo contamine la lógica de negocio.
- Punto de partida para adaptar el dominio a otros sectores con formulario (restauración, transporte, sanidad): se reutilizan las historias, reglas y el patrón de `action_chitchat_api` cambiando slots y datos de entrenamiento.
- Evaluación de pipelines Rasa 3.6 en producción: sirve como referencia para medir latencia de NLU, precisión de extracción de entidades y comportamiento del fallback generativo en un idioma de bajos recursos como el vietnamita.
- Investigación sobre anotación automática de diálogos task-oriented: el método de derivar intenciones y entidades de llamadas a API y dialogue acts de Taskmaster-1 y TicketTalk es replicable en otros corpus.
- Demo educativa de integración Rasa + LLM + API de terceros (TMDB): útil para formación en ingeniería de asistentes conversacionales con componentes heterogéneos.
- Pruebas de robustez ante entradas sin diacríticos, un caso frecuente en la escritura informal vietnamita en móvil.

## Benchmarks y rendimiento

| Metrica | Valor | Nota |
|---|---|---|
| Intent F1 (weighted) | 0,774 | Sobre un conjunto de test separado de los datos de entrenamiento; el autor advierte que el test contiene muchas frases generadas por plantilla, por lo que la cifra está sobreestimada respecto al rendimiento real |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con otros sistemas.

## Requisitos de hardware

- No requiere GPU para la inferencia del pipeline Rasa: el NLU y las políticas de diálogo se ejecutan en CPU.
- Entorno de ejecución obligatorio: Rasa 3.6.x con Python 3.8 a 3.10.
- Memoria RAM estimada: no disponible de forma explícita; el artefacto ocupa 0,1 GB y un despliegue Rasa típico con este tamaño de modelo se maneja con varios GB de RAM, aunque el dato exacto no está publicado.
- GPU recomendadas: no aplica para Rasa; si se usa un LLM local para el chitchat, el requisito dependerá del modelo elegido para `action_chitchat_api`, que no se especifica.
- Cabe en cualquier equipo consumer que pueda ejecutar Rasa 3.6; no se necesita A100, H100 ni RTX 4090.
- Opciones de despliegue: servidor HTTP de Rasa (`rasa run -m model.tar.gz --enable-api`), con acciones en un proceso separado (`rasa run actions`). No es compatible con vLLM, llama.cpp, Ollama ni TGI, que sirven modelos de pesos neuronales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Sistema | Tipo | Idioma | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Mytho0610/cinema-bot-rasa-vi | Proyecto Rasa 3.6 con fallback a LLM | Vietnamita | no disponible | Intent F1 0,774 (test con sesgo de plantilla) | CC BY 4.0 | Hugging Face, 0 descargas |
| Rasa open source (plantilla base) | Framework de diálogo | Multilingüe según datos | no disponible | Depende del entrenamiento del usuario | Apache 2.0 (Rasa OSS) | Ampliamente disponible |
| Modelos LLM instruction-tuned en vietnamita (p. ej. variantes de Phoenix, Vistral o SeaLLM) | Transformer generativo | Vietnamita | Depende del modelo | No comparable directamente con una tarea de formulario | Varía por modelo | Hugging Face |

La comparación con LLM generativos no es directa: este artefacto resuelve una tarea acotada con NLU y reglas, mientras que un LLM cubre conversación abierta con mayor coste y menor determinismo. No se dispone de datos públicos de otros bots de reserva de cine en vietnamita para una comparación cuantitativa.

## Limitaciones y advertencias

- El propio autor advierte que el Intent F1 de 0,774 está inflado porque el conjunto de test contiene muchas frases generadas por plantilla; el rendimiento en conversación real será inferior.
- Los datos se tradujeron automáticamente al vietnamita, lo que puede introducir artefactos de traducción y errores de naturalidad que afecten a la generalización.
- Dominio muy restringido: reserva de entradas de cine. Fuera de ese ámbito solo responde mediante la API LLM externa, cuya calidad y disponibilidad no controla el proyecto.
- Dependencia de claves de API externas (`CHITCHAT_API_KEY`, `TMDB_API_KEY`); sin ellas, el chitchat y la información de películas no funcionan.
- Dependencia estricta de Rasa 3.6.x y Python 3.8-3.10; versiones más recientes de Rasa pueden romper la compatibilidad del artefacto.
- No se documentan evaluaciones de sesgo, seguridad ni robustez frente a entradas adversarias.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero los datos originales de Taskmaster-1 y TicketTalk también son CC BY 4.0 (Google), por lo que la atribución debe mantenerse.
- Riesgo de alucinación en las respuestas del LLM externo usado para chitchat; el proyecto no documenta filtros de salida.
- Sin descargas ni validación comunitaria en el momento de la consulta: no hay evidencia externa de funcionamiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mytho0610/cinema-bot-rasa-vi
- Dataset GEM/Taskmaster (TicketTalk): https://huggingface.co/datasets/GEM/Taskmaster
- Dataset ConvLab/tm1 (Taskmaster-1): https://huggingface.co/datasets/ConvLab/tm1
- Documentación de Rasa 3.6: https://rasa.com/docs/rasa/
