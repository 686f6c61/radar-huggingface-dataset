# selorahomes/Selora-AI-14B

## Resumen

Selora AI 14B es un modelo de lenguaje desarrollado por Selora Homes, diseñado específicamente para funcionar como asistente local de Home Assistant, la plataforma open source de domótica. El modelo convierte peticiones en lenguaje natural en llamadas a servicios de Home Assistant, crea automatizaciones, responde preguntas sobre el estado del hogar, solicita aclaraciones cuando una petición es ambigua y consulta documentación con citas. Está basado en el modelo base Qwen3-14B-Base y se distribuye en formato GGUF para su ejecución con llama.cpp.

La arquitectura consiste en un único modelo base compartido (Qwen3-14B cuantizado a Q5_K_S) junto con cinco adaptadores LoRA especializados, cada uno entrenado para una tarea concreta. Este diseño permite que todos los especialistas compartan el mismo modelo base, reduciendo el uso de memoria a unos 9,6 GB en lugar de tener cinco modelos separados. El modelo está pensado para ejecutarse íntegramente en el hardware del usuario, sin conexión a la nube, sin cuentas y sin telemetría, lo que lo convierte en una opción relevante para usuarios de Home Assistant que priorizan la privacidad y el control local.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-14B-Base) con adaptadores LoRA |
| Parametros totales | 14.768.307.200 (modelo base safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (en el ejemplo de uso se emplea 4096) |
| Tipos de cuantizacion | Q4_K_M, Q5_K_S, Q6_K (GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con adaptadores LoRA en formato GGUF) |

## Arquitectura y entrenamiento

Selora AI 14B parte del modelo base Qwen3-14B-Base, un transformer denso de 14.000 millones de parametros. Sobre esta base se han entrenado cinco adaptadores LoRA (Low-Rank Adaptation), cada uno especializado en una tarea concreta del dominio de Home Assistant: comando de servicios, creacion de automatizaciones, respuestas sobre estado del hogar, aclaracion de ambiguedades y consulta de documentacion con citas. El sistema se sirve mediante llama.cpp, que permite cargar todos los adaptadores simultaneamente y seleccionar el apropiado por peticion a traves de la API de llama-server.

Los adaptadores se entrenaron contra prompts especificos (el directorio `prompts/` del repositorio contiene los prompts de sistema usados). No se dispone de detalles sobre el dataset de entrenamiento ni sobre el uso de tecnicas como RLHF o DPO. La cuantizacion elegida para el modelo base es Q5_K_S, que deja un margen de memoria suficiente para la cache KV en hogares con muchas entidades (la media de Home Assistant es de 386 entidades). El modelo base se ofrece tambien en Q4_K_M y Q6_K, pero el autor recomienda Q5_K_S por el equilibrio entre precision y margen de memoria.

## Capacidades

- Generacion de texto y conversacion en ingles, orientada a comandos y preguntas sobre el hogar.
- Conversion de peticiones en lenguaje natural a llamadas de servicio de Home Assistant (por ejemplo, encender una luz, regular un termostato).
- Creacion de automatizaciones en Home Assistant, incluyendo automatizaciones con YAML de blueprint.
- Respuesta a preguntas sobre el estado del hogar (temperatura, luces encendidas, etc.) basandose en las entidades expuestas.
- Solicitud de aclaracion cuando una peticion es genuinamente ambigua.
- Consulta de documentacion de Home Assistant con citas de la fuente.
- Soporte para multi-dispositivo: puede ejecutar comandos sobre varios dispositivos en una sola peticion (probado con 3 y 6 dispositivos).
- No se ha indicado soporte para tool calling generico, pero la funcionalidad de servicio calls actua como tal.
- No se ha indicado soporte para agentes de razonamiento multi-paso, aunque la creacion de automatizaciones implica cierta logica.

## Casos de uso

- Control por voz de la vivienda: el modelo puede convertir una peticion como "apaga la luz del salon y baja la persiana del dormitorio" en llamadas de servicio correctas, con una latencia mediana de 5,9 segundos para un dispositivo y 6,2 segundos en general, lo que permite su uso en asistentes de voz locales.
- Automatizacion de rutinas: un usuario puede pedir "crea una automatizacion que encienda la calefaccion cuando la temperatura exterior baje de 15 grados" y el modelo genera un YAML de automatizacion cargable en Home Assistant (probado en 3 de 3 escenarios).
- Preguntas sobre el estado del hogar: consultas como "¿cual es la temperatura en el salon?" se responden basandose en las entidades de Home Assistant, con una tasa de acierto del 44,7% en el conjunto Allen questions (limitado por datos no visibles).
- Asistente de documentacion: el modelo puede buscar en la documentacion de Home Assistant y proporcionar respuestas con citas, util para usuarios que necesitan ayuda tecnica sin salir de su interfaz.
- Gestion de ambiguedad: si el usuario dice "apaga la luz", el modelo puede preguntar "¿cual de las tres luces del salon?" en lugar de adivinar, mejorando la experiencia en hogares con muchos dispositivos.
- Integracion con Home Assistant via llama.cpp: el modelo se sirve mediante `llama-server` con todos los adaptadores cargados, y la integracion oficial de Selora AI (disponible en GitHub) lo conecta con Home Assistant, permitiendo un panel de chat y generacion proactiva de automatizaciones.

## Benchmarks y rendimiento

La model card proporciona resultados de benchmarks medidos sobre los pesos exactos del repositorio, con temperatura 0, en Apple Silicon (Metal) y con la cuantizacion Q5_K_S. Se evaluan los adaptadores por separado:

| Suite | Score | n | Que mide |
|---|---|---|---|
| Allen assist | 80,0% | 95 | Una peticion se convierte en la llamada de servicio correcta |
| Allen assist-mini | 96,0% | 50 | Subconjunto curado mas pequeno |
| Allen questions | 44,7% | 38 | Respuestas sobre estado del hogar |
| Allen automations | 2 de 4 escenarios | 4 x 5 | Creacion de una automatizacion cargable |
| HA intents | 86,2% | 595 | Corpus de intenciones de Home Assistant |
| HomeBench | 0,0% | 597 | Comandos, coincidencia exacta bajo el scorer de upstream |
| acon96 | 56,7% | 150 | Dataset de comandos, evaluado con shim propio |

Ademas, se reporta F1 parcial en HomeBench para peticiones multi-dispositivo (definido por Selora, no es parte del protocolo upstream):

| Dispositivos por peticion | F1 |
|---|---|
| 2 | 36,2 |
| 10 | 25,3 |

La lectura honesta de estos datos indica que HomeBench puntua 0,0% por un defecto de formato (el modelo envuelve las operaciones con comillas dobles, lo que el scorer no acepta); al eliminar esas comillas, la coincidencia exacta para un solo dispositivo sube al 59% y al 86% en dispositivo-y-metodo. Sin embargo, en peticiones con dispositivos inexistentes el modelo inventa una operacion en lugar de rechazarla, lo que se mantiene cercano a cero independientemente del formato. Allen questions esta limitado por datos: 17 de 38 casos dependen de atributos de entidad que el modelo no ve, por lo que el techo es aproximadamente 55%. Allen automations falla en dos de cuatro escenarios por defectos concretos: una automatizacion omite la accion de apagado que su propia descripcion promete, y otra doble-envuelve un input de blueprint.

## Requisitos de hardware

- Memoria total estimada: alrededor de 16 GB para el modelo, cache KV y Home Assistant juntos (segun el autor, el modelo base Q5_K_S ocupa 9,6 GB y con cache KV y el sistema completo se llega a ~12,9 GB, dejando ~2,1 GB de margen).
- VRAM: el modelo es GGUF y puede ejecutarse en CPU o GPU. En las pruebas se usaron Apple Silicon con Metal, pero no se especifica VRAM dedicada. En una GPU de consumo, se necesitaria al menos 12 GB de VRAM para la cuantizacion Q5_K_S, o mas si se usa Q6_K (11,3 GB solo para el modelo).
- GPU recomendadas: una RTX 4070 o superior (12 GB VRAM) podria alojar el modelo, aunque se recomienda una GPU con 16 GB para margen. En Apple Silicon, un Mac con 16 GB unificado es suficiente.
- Despliegue: llama.cpp (llama-server) con soporte LoRA. No se menciona vLLM, Ollama o TGI como alternativas oficiales.
- Latencia: mediana de respuesta 6,2 segundos, percentil 95 de 12,9 segundos en un hogar simulado de ~20 entidades. La latencia escala con el numero de entidades, ya que el tiempo de respuesta esta dominado por la ingesta del prompt.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos de la misma categoria en la informacion proporcionada. El unico modelo comparable en el ecosistema Selora es la linea de 1,7B (`selorahomes/Selora-AI`), que requiere mucha menos memoria (se indica que corre en memoria reducida) pero con menor capacidad. En el mercado general, los modelos de asistencia para Home Assistant incluyen alternativas como `qwen3-14b` (base) sin adaptadores, o modelos especificos como `gpt-4` en la nube, pero no se han proporcionado datos de comparacion con estos. Por tanto, la comparativa no esta disponible en los datos actuales.

## Limitaciones y advertencias

- HomeBench puntua 0,0% con su scorer oficial por un defecto de formato (el modelo envuelve las operaciones con comillas dobles). Esto es un defecto real del modelo, no del evaluador.
- En peticiones para dispositivos que no existen, el modelo inventa una operacion en lugar de rechazar la solicitud, un fallo de robustez.
- Allen questions tiene un techo de rendimiento del 55% porque muchos casos requieren atributos de entidad que el modelo no ve en su prompt.
- Allen automations falla en 2 de 4 escenarios: una automatizacion omite la accion de apagado prometida y otra tiene un error de anidado en el input del blueprint.
- El modelo solo soporta ingles (language: en). No hay soporte para otros idiomas.
- Se ha observado una variabilidad en resultados entre CPU y Metal: en un caso muestreado, los mismos pesos y cuantizacion produjeron un parametro numerico diferente en CPU que en Metal a temperatura 0.
- La latencia escala con el numero de entidades del hogar; en hogares con muchas entidades, el tiempo de respuesta puede superar los 12,9 segundos del percentil 95.
- Aunque la licencia es Apache-2.0 (permisiva para uso comercial), no se han publicado detalles sobre el entrenamiento, lo que puede limitar la trazabilidad del modelo.
- No se garantiza la disponibilidad de actualizaciones o soporte a largo plazo; el modelo esta en fase inicial con 0 descargas en HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/selorahomes/Selora-AI-14B
- Modelo de la linea 1,7B: https://huggingface.co/selorahomes/Selora-AI
- Documentacion de Selora AI: https://selorahomes.com/docs/selora-ai/
- Pagina principal de Selora Homes: https://selorahomes.com/
- Integracion en GitHub: https://github.com/SeloraHomes/ha-selora-ai
- Repositorio de modelos de Selora Homes en HuggingFace: https://huggingface.co/selorahomes/models
