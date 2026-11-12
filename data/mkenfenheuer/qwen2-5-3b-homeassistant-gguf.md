# mkenfenheuer/qwen2.5-3b-homeassistant-GGUF

## Resumen
Qwen2.5-3B Home Assistant (GGUF) es un ajuste fino mediante LoRA sobre Qwen/Qwen2.5-3B-Instruct, desarrollado por mkenfenheuer, orientado especificamente al control de una instalacion de Home Assistant mediante llamadas a herramientas (tool calling). El modelo resuelve el problema de la integracion de un asistente conversacional local con el domotica: en lugar de generar texto libre, emite bloques `<tool_call>` estructurados que el cliente traduce a llamadas OpenAI `tool_calls` para controlar dispositivos, musica, temporizadores, listas de la compra, clima, hora y anuncios por megafonia.

El repositorio distribuye el modelo en formato GGUF cuantizado a Q4_K_M (1,9 GB) con matriz de importancia (imatrix), pensado para ejecutarse en CPU con AVX2 o en GPUs de gama baja. Actualmente solo esta disponible la version en aleman (v16); el autor indica que los modelos para ingles, espanol, frances, italiano y neerlandes se entrenan desde el mismo generador y se anadiran al repositorio a medida que superen sus pruebas.

La relevancia actual del modelo reside en su enfoque practico: un asistente de domotica que corre en hardware modesto, con actualizaciones automaticas gestionadas via `models.json`, y una integracion completa con Home Assistant (add-on de inferencia e integracion de agente conversacional para Assist). El modelo base aporta 3.085.938.688 parametros y una arquitectura transformer densa de la familia Qwen2.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5), ajuste fino LoRA sobre Qwen/Qwen2.5-3B-Instruct |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens (valor recomendado en el ejemplo de uso con `llama-server -c 8192`) |
| Tipos de cuantizacion | Q4_K_M con importance matrix (imatrix); tamano 1,9 GB |
| Idiomas soportados | aleman (`de`); ingles, espanol, frances, italiano y neerlandes anunciados como pendientes de publicacion |
| Licencia | qwen-research (etiquetada como `other` en la model card, con enlace a LICENSE) |
| Formato de pesos | GGUF; plantilla de chat embebida (`chat_template.jinja`); `models.json` con SHA-256 y esquema de prompt |

## Arquitectura y entrenamiento
El modelo parte de Qwen2.5-3B-Instruct, un transformer denso de 3.085.938.688 parametros, y se ajusta mediante LoRA para una tarea concreta: emitir llamadas a herramientas segun un esquema fijo de cinco herramientas (`control`, `get_state`, `timer`, `get_time`, `broadcast`). El dataset de entrenamiento es mkenfenheuer/homeassistant-tool-calling, generado por el propio autor a partir de un generador comun para todos los idiomas, lo que explica que las versiones en otros idiomas compartan estructura y esquema de prompt (prompt schema 6).

La innovacion tecnica destacable no esta en la arquitectura del modelo base, sino en el pipeline de despliegue: la plantilla de chat Jinja embebida en el GGUF renderiza las herramientas y parsea los bloques `<tool_call>` en llamadas OpenAI compatibles, lo que requiere el flag `--jinja` en `llama-server`. El modelo se distribuye con `models.json` para actualizaciones automaticas y con un sistema prompt por defecto por idioma, que incluye la lista de entidades del hogar y la zona del dispositivo de voz. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF o DPO.

## Capacidades
- Generacion de texto conversacional en aleman con tono amable y respuestas breves (longitud configurable: corta, media, larga, detallada).
- Tool calling estructurado con cinco herramientas: `control` (servicios de Home Assistant, luces por area con `"*"` para toda la casa, `media_player.search_and_play`, `todo.add_item` y `todo.complete_item`), `get_state` (estados, atributos, clima con `later_today` y `forecast`, listas de la compra), `timer` (iniciar, cancelar, pausar, reanudar, sumar, restar, estado y comando retardado opcional), `get_time` (hora y fecha) y `broadcast` (anuncio en todos los altavoces).
- Manejo de errores de herramientas: si `control` devuelve `{"success": false, "error": "..."}`, el modelo reporta el fallo en lugar de afirmar exito.
- Razonamiento multi-turno con contexto de conversacion (ejemplo de la model card encadena peticion de musica, resultado de herramienta y nueva peticion de temporizador).
- Restriccion a `entity_id` reales de la lista proporcionada en el system prompt; el modelo debe decir que un dispositivo no existe en lugar de inventarlo.
- Capacidades multilingues limitadas al aleman en la version publicada.
- No se documentan capacidades de vision, audio, codigo general, matematicas ni agentes autonomos mas alla del bucle de tool calling descrito.

## Casos de uso
- Control por voz de dispositivos del hogar: el modelo recibe el system prompt con la lista de entidades y emite llamadas `control` para encender luces, subir persianas o ajustar el termostato, integrándose en Assist mediante la integracion HA LLM Agent (local).
- Reproduccion de musica por orden de voz: mediante `control` con `media_player.search_and_play` (consulta, tipo de medio, artista) y ejecucion a traves de Music Assistant; adecuado porque el modelo traduce lenguaje natural a la llamada de servicio concreta.
- Gestion de temporizadores de cocina: la herramienta `timer` permite iniciar, pausar, sumar o restar tiempo y consultar estado; util para escenarios como "pon un temporizador de 10 minutos para la pizza".
- Consulta de estados y mediciones: `get_state` devuelve estados y atributos, clima con prevision de horas restantes y dias siguientes, y listas de la compra con sus items; el modelo consulta antes de responder para evitar alucinaciones sobre sensores.
- Listas de la compra y tareas: `todo.add_item` y `todo.complete_item` permiten anadir y marcar elementos en listas de Home Assistant por voz.
- Anuncios por megafonia: `broadcast` emite un mensaje en todos los altavoces, util para avisos familiares o recordatorios programados con comando retardado.
- Despliegue en hardware modesto: con cuantizacion Q4_K_M (1,9 GB) corre en CPU con AVX2 (aproximadamente 16 tokens/s de salida en 4 nucleos) o en una GTX 1060 de 6 GB (540 tokens/s de prompt y 45 tokens/s de salida), lo que permite montar el asistente en el propio host de Home Assistant.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta cifras de rendimiento de inferencia en hardware concreto:

| Escenario | Prompt (tokens/s) | Salida (tokens/s) |
|---|---|---|
| CPU con AVX2, 4 nucleos | no disponible | ~16 |
| GTX 1060 6 GB | 540 | 45 |

## Requisitos de hardware
- VRAM estimada: aproximadamente 1,9 GB de pesos en Q4_K_M; con overhead de contexto de 8192 tokens, el consumo real es algo superior, pero cabe holgadamente en GPUs de 4-6 GB.
- GPU recomendadas: GTX 1060 6 GB como minimo documentado; cualquier GPU consumer con 6 GB o mas (RTX 3060, RTX 4060, RTX 4090) es suficiente. No se documentan requisitos para A100 o H100, innecesarios por el tamano del modelo.
- CPU: funciona en CPU con AVX2, aproximadamente 16 tokens/s de salida en 4 nucleos.
- Opciones de despliegue: `llama-server` (con `--jinja` obligatorio, `-c 8192`, temperatura 0), add-on HA LLM Inference en el host de Home Assistant, integracion HA LLM Agent (local) para Assist, y API compatible con OpenAI. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: ver tabla de benchmarks; el autor no publica latencias de extremo a extremo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| mkenfenheuer/qwen2.5-3b-homeassistant-GGUF | 3.085.938.688 | 8192 | GGUF Q4_K_M | qwen-research | Tool calling especifico para Home Assistant, aleman |
| Qwen/Qwen2.5-3B-Instruct (base) | 3.085.938.688 | no disponible en la informacion proporcionada | safetensors, GGUF | qwen-research | Instrucciones generales, multilingue |
| Alternativas de asistente domotico | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con otros ajustes finos especificos para Home Assistant no esta disponible en la informacion proporcionada. Frente a su modelo base, la diferencia principal es la especializacion en el esquema de cinco herramientas y el idioma aleman, a costa de capacidades generales.

## Limitaciones y advertencias
- Idioma: la unica version publicada es alemana; el uso en castellano no esta soportado en esta revision.
- Dependencia del system prompt: sin la lista completa de entidades y el prompt por defecto, el modelo no puede controlar nada; el autor advierte explicitamente que hay que enviar siempre el prompt completo.
- Riesgo de alucinacion de `entity_id`: el prompt instruye al modelo a no inventar identificadores, pero es una salvaguarda por prompt, no una garantia arquitectonica.
- Licencia qwen-research: conviene revisar los terminos del LICENSE enlazado antes de un uso comercial; la model card la etiqueta como `other`.
- Ambito funcional cerrado: las cinco herramientas cubren domotica basica; no es adecuado para generacion de codigo, matematicas avanzadas ni tareas generales de agente.
- Temperatura recomendada 0: reduce variabilidad, pero puede limitar respuestas mas naturales en conversaciones abiertas.
- Dependencia de `--jinja` en `llama-server`: sin este flag no se activa la plantilla embebida ni el parseo de `<tool_call>`.
- Actualizaciones automaticas via `models.json`: introducen un canal de suministro de modelos que conviene verificar (SHA-256) en entornos de produccion.
- No se documentan sesgos especificos ni evaluaciones de robustez; al ser un ajuste fino pequeno y especializado, la cobertura de casos limite es incierta.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/mkenfenheuer/qwen2.5-3b-homeassistant-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/mkenfenheuer/homeassistant-tool-calling
- Esquema de herramientas (`llm_schema.py`): https://huggingface.co/datasets/mkenfenheuer/homeassistant-tool-calling/blob/main/llm_schema.py
- Repositorio del proyecto (add-on e integracion): https://github.com/mKenfenheuer/homeassistant-llm
