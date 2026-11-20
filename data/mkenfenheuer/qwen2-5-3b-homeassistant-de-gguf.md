# mkenfenheuer/qwen2.5-3b-homeassistant-de-GGUF

## Resumen

Qwen2.5-3B Home Assistant (GGUF) es un ajuste fino mediante LoRA de Qwen/Qwen2.5-3B-Instruct, publicado por mkenfenheuer, especializado en el control de instalaciones de Home Assistant a traves de tool calling. El modelo resuelve un problema muy concreto: convertir lenguaje natural en llamadas estructuradas a herramientas que gestionan dispositivos, musica, temporizadores, listas de la compra, meteorologia, hora y anuncios por megafonia. No es un modelo de proposito general, sino un componente de un agente de voz domestico.

El repositorio distribuye una familia de seis modelos, uno por idioma (aleman, ingles, espanol, frances, italiano y neerlandes), todos entrenados a partir del mismo generador de datos y cuantizados a Q4_K_M (1,9 GB) con matriz de importancia (imatrix). La ficha que nos ocupa corresponde al modelo aleman (`de/`, version v19), etiquetado con el idioma `de` en Hugging Face, aunque el repositorio incluye tambien la variante espanola en `es/`.

La relevancia actual del modelo radica en su perfil de despliegue: con 3.085.938.688 parametros y una cuantizacion Q4_K_M, puede ejecutarse en CPU con AVX2 (unos 16 tokens/s de salida en 4 nucleos) o en GPUs de gama baja (GTX 1060 de 6 GB: 540 tokens/s de prompt y 45 tokens/s de salida), lo que permite alojar el asistente en el propio host de Home Assistant sin depender de la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-3B-Instruct), ajuste fino LoRA |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (valor recomendado en el ejemplo de `llama-server -c 8192`); contexto nativo del modelo base no confirmado en la informacion disponible |
| Tipos de cuantizacion | Q4_K_M con importance matrix (imatrix); otras cuantizaciones no disponibles |
| Idiomas soportados | Aleman (`de`, modelo de esta ficha); el repositorio incluye ademas ingles, espanol, frances, italiano y neerlandes, cada uno como modelo independiente |
| Licencia | `other` con `license_name: qwen-research` (licencia de investigacion de Qwen) |
| Formato de pesos | GGUF (con chat template Jinja embebido en el propio GGUF) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer decoder-only de 3.085.938.688 parametros, y se ajusta mediante LoRA para una tarea de tool calling restringida a un esquema fijo de seis herramientas definidas en `llm_schema.py` (prompt schema 7): `control`, `get_state`, `music_library`, `timer`, `get_time` y `broadcast`. El entrenamiento utiliza el dataset `mkenfenheuer/homeassistant-tool-calling`, generado de forma sintetica; los seis modelos de idioma se entrenan a partir del mismo generador, lo que garantiza un comportamiento homogeneo entre lenguas.

La innovacion tecnica principal no esta en la arquitectura, sino en el empaquetado y la integracion: el chat template Jinja va embebido en el GGUF y renderiza las herramientas y parsea los bloques `<tool_call>` a `tool_calls` compatibles con la API de OpenAI, lo que requiere arrancar `llama-server` con `--jinja`. La cuantizacion Q4_K_M incorpora una matriz de importancia (imatrix) para preservar la calidad en un tamano de 1,9 GB. El sistema espera un system prompt con la lista de entidades (`entity_id | Nombre | Area`), el area del dispositivo de voz y su reproductor asociado; sin esa lista el modelo no puede controlar nada. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF o DPO.

## Capacidades

- Tool calling estructurado sobre seis herramientas de Home Assistant: control de entidades y servicios, consulta de estados y atributos, biblioteca multimedia, temporizadores, hora y fecha, y anuncios por megafonia.
- Control de dispositivos por `entity_id` o por area (con `"*"` para toda la casa), incluido el control de luces por area.
- Gestion de reproduccion multimedia: `media_player.search_and_play` (consulta, tipo de medio, artista), `media_player.seek_relative` (segundos) y reproduccion de la cancion favorita o de la pista en curso cuando no se especifica consulta.
- Gestion de listas de tareas mediante `todo.add_item` y `todo.complete_item`.
- Consulta meteorologica con horas restantes del dia (`later_today`) y prevision de dias siguientes (`forecast`).
- Temporizadores: iniciar, cancelar, pausar, reanudar, sumar, restar, consultar estado y comandos diferidos.
- Gestion de la biblioteca multimedia de un reproductor: listas, artistas, albumes, pistas, emisoras y podcasts, con filtro opcional por `search`.
- Informe de fallos: cuando una herramienta devuelve `{"success": false, ...}`, el modelo reporta el error en lugar de afirmar exito.
- Generacion de texto conversacional y respuestas de longitud configurable (corta, media, larga, detallada) segun la opcion de la integracion.
- Multilingue por despliegue: cada idioma es un modelo separado, no una capacidad multilingue dentro de un mismo checkpoint.

## Casos de uso

- Asistente de voz domestico local: el modelo se ejecuta en el host de Home Assistant mediante el add-on *HA LLM Inference* y responde a traves de la integracion *HA LLM Agent (local)* para Assist, sin enviar audio ni texto a servicios en la nube.
- Control de iluminacion por area: el usuario pide "apaga las luces del salon" y el modelo emite una llamada a `control` con `area` en lugar de enumerar `entity_id`, lo que simplifica el prompt y reduce errores con grupos grandes de entidades.
- Reproduccion musical por lenguaje natural: "pon musica de Queen en la cocina" se traduce en `media_player.search_and_play` con artista y reproductor, usando la biblioteca multimedia consultada previamente con `music_library`.
- Gestion de listas de la compra: anadir y completar items de `todo.einkaufsliste` desde comandos de voz, con consulta previa del estado de la lista mediante `get_state`.
- Temporizadores y recordatorios en el dispositivo de voz: inicio, pausa y cancelacion de temporizadores, incluidos comandos diferidos, gestionados con la herramienta `timer` y las intenciones nativas de Home Assistant.
- Consultas meteorologicas conversacionales: preguntas sobre el tiempo de hoy con las horas restantes y prevision de los proximos dias, respondidas a partir de `get_state` sobre la entidad `weather`.
- Anuncios por megafonia: difusion de mensajes a todos los altavoces mediante `broadcast`, util para avisos domesticos.
- Despliegue en hardware modesto: instalaciones domoticas con un mini-PC de 4 nucleos con AVX2 o una GTX 1060 de 6 GB pueden servir el modelo con latencias interactivas (16 tokens/s en CPU, 45 tokens/s de salida en GPU).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta cifras de rendimiento de inferencia: aproximadamente 16 tokens/s de salida en CPU con AVX2 sobre 4 nucleos, y en una GTX 1060 de 6 GB, 540 tokens/s de prompt y 45 tokens/s de salida.

## Requisitos de hardware

- VRAM estimada: unos 2 GB para el fichero Q4_K_M de 1,9 GB mas el contexto; con 8.192 tokens de contexto el consumo adicional es moderado, aunque no se dispone de una cifra exacta.
- GPU recomendadas: GTX 1060 de 6 GB como minimo verificado en la model card; GPUs superiores (RTX 3060, RTX 4090, A100, H100) funcionaran sin problema, aunque el modelo esta pensado para hardware modesto.
- Cabe en GPU de consumo: si, en tarjetas con al menos 6 GB de VRAM; tambien funciona en CPU con AVX2.
- Opciones de despliegue: `llama-server` (obligatorio `--jinja` para activar el chat template embebido y parsear `tool_calls`), integracion con la API compatible de OpenAI; el add-on *HA LLM Inference* y la integracion *HA LLM Agent (local)* automatizan el despliegue en Home Assistant. Otras opciones como vLLM, TGI u Ollama no estan documentadas en la informacion disponible.
- Latencia y throughput: 16 tokens/s de salida en CPU (4 nucleos, AVX2); 540 tokens/s de prompt y 45 tokens/s de salida en GTX 1060 de 6 GB. Muestreo recomendado: temperatura 0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-3B Home Assistant (este modelo) | 3.085.938.688 | 8.192 tokens (recomendado) | Tool calling especifico de Home Assistant, 6 herramientas, 6 idiomas como modelos separados | qwen-research | GGUF en Hugging Face |
| Qwen/Qwen2.5-3B-Instruct (base) | 3.085.938.688 | no disponible en la informacion | Instruccion general, tool calling generico | qwen-research | Pesos completos y GGUF |
| Alternativas de mismo tamano para tool calling | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo controla dispositivos si el system prompt incluye la lista completa de entidades (`entity_id | Nombre | Area`); sin ella no puede ejecutar ninguna accion.
- Depende de un esquema fijo de seis herramientas (prompt schema 7); cambios en el esquema o en el chat template pueden romper el comportamiento.
- Requiere `--jinja` en `llama-server`; sin esa opcion no se renderizan las herramientas ni se parsean los `tool_calls`.
- Riesgo de alucinacion de `entity_id`: el system prompt pide explicitamente no inventar identificadores, lo que sugiere que el fallo es posible si el prompt no es estricto.
- Cada idioma es un modelo independiente; no se debe esperar transferencia multilingue dentro de un mismo checkpoint.
- La licencia es `qwen-research` (licencia de investigacion de Qwen), lo que puede restringir el uso comercial; conviene revisar el fichero LICENSE antes de un despliegue en produccion.
- No se han publicado benchmarks de calidad (precision de tool calling, tasa de exito por herramienta) en la informacion disponible, por lo que la evaluacion debe hacerse en el entorno real.
- La version de esta ficha es la alemana (v19); las versiones por idioma no son identicas (italiano en v18, resto en v19).
- El modelo esta pensado para respuestas cortas y conversacionales; no es adecuado para razonamiento complejo, codigo o matematicas.

## Enlaces

- Hugging Face: https://huggingface.co/mkenfenheuer/qwen2.5-3b-homeassistant-de-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/mkenfenheuer/homeassistant-tool-calling
- Esquema de herramientas (`llm_schema.py`): https://huggingface.co/datasets/mkenfenheuer/homeassistant-tool-calling/blob/main/llm_schema.py
- Repositorio del proyecto (add-on e integracion): https://github.com/mKenfenheuer/homeassistant-llm
