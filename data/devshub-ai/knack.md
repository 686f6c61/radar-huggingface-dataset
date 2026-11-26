# devshub-ai/knack

## Resumen

Knack es un modelo de clasificación de texto de 757 millones de parámetros desarrollado por devshub-ai como componente interno de CodeSync, un asistente de programación. No es un modelo generativo de propósito general: es un modelo de decisión especializado que responde a 29 preguntas fijas (identificadas por un `question id`) sobre dos tipos de entrada, comandos de shell y mensajes dirigidos a un asistente de código. Cada llamada devuelve la opción elegida entre un conjunto cerrado de alternativas junto con una puntuación de confianza.

El modelo resuelve un problema acotado pero crítico en herramientas de agentes de código: clasificar rápidamente si un comando es destructivo, si se ejecutará indefinidamente, si tarda minutos, si muta el repositorio, si despliega, qué tipo de actividad representa, o si un mensaje del usuario es conversación o una petición de trabajo y qué modo del asistente le corresponde. Al ser un modelo pequeño y local, evita depender de una API externa y mantiene la privacidad de los prompts y comandos del usuario.

Su relevancia radica en el enfoque: en lugar de un LLM grande que interpreta lenguaje natural libre, Knack apuesta por un clasificador compacto (0,75B) entrenado sobre un conjunto fijo de decisiones reales de CodeSync, con latencias declaradas de unos 10 ms en GPU y 250 ms en CPU, y un peso de 817 MB en cuantización Q8_0 o 516 MB en Q4_K_M. La información pública disponible es limitada: no se detallan arquitectura concreta, datos de entrenamiento ni benchmarks formales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de clasificación de texto; detalles de la arquitectura no publicados) |
| Parametros totales | 757.616.544 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (817 MB) y Q4_K_M (516 MB) en la edición Ollama; pesos safetensors en el repo |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo (tipo de transformer, número de capas, dimensión de embeddings, mecanismo de atención) ni sobre el tokenizador. El dato disponible es el recuento de parámetros (757.616.544) y su naturaleza como modelo de clasificación de texto con pipeline `text-classification`. El modelo se distribuye tanto en safetensors como en GGUF para su uso con Ollama.

Según la model card, el entrenamiento se realizó sobre sesiones reales de CodeSync, con énfasis explícito en los casos raros y costosos de fallar: borrados destructivos, comandos que no terminan, reanudación de trabajo interrumpido y peticiones de refactorización, tests o documentación. No se especifican el volumen de tokens, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO u otras. Tampoco se documenta ninguna innovación arquitectónica más allá del diseño de decisión por `question id` con conjunto cerrado de opciones.

## Capacidades

- Clasificación de comandos de shell según 8 preguntas: si el comando se ejecuta de forma persistente (`serves`), su nivel de riesgo (`risk`, con niveles safe / needs care / destructive), si tarda minutos (`long_running`), su tipo de actividad (`activity`: testing, building, installing, git, inspecting, running), si verifica que un cambio funciona (`verifies`), si muta el repositorio (`mutates_repo`) y si despliega (`deploys`).
- Clasificación de mensajes a un asistente de código: tipo de tarea (`task.intent`: bug_fix, feature, refactor, api_schema, config_deploy, test, documentation, investigation, unknown), si es conversación o petición de trabajo (`turn.chat_or_task`), modo del asistente recomendado (`route.mode`: plan, build, ask, debug) y control de grabación de pantalla (`turn.screencast`: start, stop, none).
- Devuelve la opción elegida junto con una puntuación de confianza (por ejemplo, `yes 97%` o `installing 94%`).
- Rechaza explícitamente preguntas para las que no fue entrenado (no generaliza a preguntas arbitrarias).
- No ejecuta el texto que recibe: solo lo clasifica, por lo que es seguro consultarle sobre comandos peligrosos.
- No se documentan capacidades de generación de texto, razonamiento abierto, código, matemáticas, visión, tool calling, agentes ni multilingüismo.

## Casos de uso

- Guardarraíl de seguridad en agentes de shell: antes de ejecutar un comando propuesto por un agente o por el usuario, consultar `risk` para bloquear o pedir confirmación ante comandos clasificados como `destructive` (por ejemplo, `git push --force`). Adecuado por su latencia de ~10 ms en GPU, que permite evaluar cada comando sin penalizar la interacción.
- Gestión de procesos de larga duración: usar `serves` y `long_running` para decidir si un comando debe lanzarse en segundo plano, con timeout o con gestión de proceso dedicada, evitando bloqueos del agente en comandos como `npm run dev` o `cargo build --release`.
- Enrutado de mensajes en un asistente de código: aplicar `turn.chat_or_task` y `route.mode` para decidir si el mensaje del usuario es conversación o tarea y si conviene el modo plan, build, ask o debug, mejorando la coherencia del flujo del asistente.
- Clasificación de intención en pipelines de desarrollo: usar `task.intent` para etiquetar automáticamente issues o mensajes entrantes (bug_fix, feature, documentation, investigation) y encaminarlos al flujo o al equipo correspondiente.
- Verificación de cambios en CI/CD: consultar `verifies` para distinguir comandos que realmente validan un cambio (por ejemplo, `pytest`) de los que solo compilan (`npm run build`), y `mutates_repo` para separar operaciones de solo lectura de las que alteran el estado de git.
- Control de despliegues: usar `deploys` para marcar comandos como `kubectl apply` y exigir aprobación adicional antes de ejecutarlos en entornos sensibles.
- Clasificación de actividad para telemetría local: etiquetar comandos por `activity` (installing, building, testing, git, inspecting, running) para generar estadísticas de uso sin enviar datos a servicios externos.
- Privacidad en herramientas locales: desplegar el modelo con Ollama en la máquina del desarrollador para que prompts y comandos no salgan del equipo, algo relevante en entornos con código propietario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta cifras de latencia declaradas por el autor: aproximadamente 10 ms por decisión en GPU, 250 ms en CPU, y unos 17 ms para responder las 8 preguntas de comando. No se ofrecen métricas de precisión, recall ni F1 sobre conjuntos de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en Q8_0 (817 MB de pesos) y en torno a 516 MB en Q4_K_M; con overhead de runtime, cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100. Una RTX 4090, RTX 3090 o incluso una GPU integrada con suficiente memoria compartida pueden ejecutarlo.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM; también en CPU, con latencia declarada de ~250 ms por decisión.
- Opciones de despliegue: Ollama (`ollama pull devshub/knack` o `hf.co/devshub-ai/knack:Q8_0`), y GGUF con llama.cpp por extensión. No se documenta soporte de vLLM ni TGI.
- Latencia y throughput: ~10 ms por decisión en GPU y ~250 ms en CPU según el autor; ~17 ms para las 8 preguntas de comando. No se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Knack (devshub-ai) | Clasificador especializado de decisiones fijas | 0,75B | no disponible | no disponible | Hugging Face y Ollama |
| clef | Modelo de decisión general | 27B | no disponible | no disponible | no disponible |
| LLM generativo de propósito general (p. ej. familia 7B) | Generación y clasificación mediante prompting | ~7B | variable | variable | amplia |

La model card compara Knack con clef, un modelo de decisión general de 27B que responde a preguntas en lenguaje natural libre: Knack es unas 36 veces más pequeño, solo responde a 29 preguntas fijas por identificador y rechaza las no entrenadas, mientras que clef acepta cualquier pregunta. No se dispone de datos públicos de rendimiento para comparar con modelos de clasificación estándar (por ejemplo, clasificadores BERT o DeBERTa) en estas tareas concretas.

## Limitaciones y advertencias

- Modelo de propósito muy restringido: solo responde a las 29 preguntas fijas para las que fue entrenado; cualquier otra consulta se rechaza. No sirve como clasificador general ni como LLM.
- No interpreta lenguaje natural libre: la pregunta se selecciona por identificador y las opciones deben coincidir con el conjunto cerrado definido para cada identificador.
- Sin información pública sobre sesgos: no se documentan sesgos conocidos, composición del dataset ni procesos de mitigación.
- Riesgo de clasificación errónea en comandos atípicos: al entrenarse sobre sesiones reales de CodeSync, los comandos poco frecuentes o muy específicos de un dominio pueden clasificarse con baja confianza; las puntuaciones mostradas en la model card son ejemplos ilustrativos, no garantías.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; conviene verificar antes de integrarlo en producción.
- Idiomas no declarados: no se especifica qué idiomas soporta para los mensajes de usuario, lo que limita su uso fuera del inglés sin validación previa.
- Longitud de contexto no disponible: se desconoce el límite de entrada, relevante para comandos o mensajes largos.
- Dependencia de un producto concreto: las decisiones están diseñadas para CodeSync, por lo que su utilidad fuera de ese flujo requiere adaptar los identificadores y las opciones.
- Sin benchmarks publicados: no hay evidencia cuantitativa de precisión más allá de los ejemplos de la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/devshub-ai/knack
- Modelo en Ollama: https://ollama.com/devshub/knack
