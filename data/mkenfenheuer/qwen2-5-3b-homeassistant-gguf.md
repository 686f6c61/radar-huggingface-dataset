# mkenfenheuer/qwen2.5-3b-homeassistant-GGUF

## Resumen

Qwen2.5-3B Home Assistant es un ajuste fino mediante LoRA de Qwen/Qwen2.5-3B-Instruct, desarrollado por mkenfenheuer, especializado en el control de instalaciones de Home Assistant a traves de tool calling. El modelo traduce lenguaje natural a llamadas estructuradas de herramientas para gestionar dispositivos, musica, temporizadores, listas de la compra, meteorologia, hora y anuncios por altavoz. Se distribuye en formato GGUF cuantizado a Q4_K_M (1,9 GB) con matriz de importancia, lo que permite ejecutarlo en CPU con AVX2 o en GPUs de gama baja.

El modelo se publica en seis idiomas (aleman, ingles, espanol, frances, italiano y neerlandes), todos generados a partir del mismo generador de datos y entrenados con el dataset mkenfenheuer/homeassistant-tool-calling. La version en espanol corresponde a la v19. Su relevancia actual radica en que ofrece una alternativa local y ligera a APIs en la nube para asistentes de voz domestico, con latencias de aproximadamente 16 tokens/s en CPU de 4 nucleos y 45 tokens/s de salida en una GTX 1060 de 6 GB.

El modelo base tiene 3.085.938.688 parametros y una ventana de contexto de 32.768 tokens en Qwen2.5-3B-Instruct; la configuracion recomendada en llama-server para este ajuste usa `-c 8192`. La licencia es qwen-research (etiquetada como "other" en Hugging Face), lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), ajuste fino LoRA sobre Qwen/Qwen2.5-3B-Instruct |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; configuracion recomendada de 8.192 tokens en llama-server |
| Tipos de cuantizacion | Q4_K_M (1,9 GB) con importance matrix (imatrix) |
| Idiomas soportados | de, en, es, fr, it, nl (un modelo por idioma) |
| Licencia | qwen-research (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (con chat template Jinja embebido) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer decoder-only denso de 3.085.938.688 parametros. Sobre esa base se aplica un ajuste fino LoRA para especializarlo en tool calling orientado a Home Assistant. El entrenamiento utiliza el dataset mkenfenheuer/homeassistant-tool-calling, generado de forma sintetica y comun para las seis variantes idiomaticas, lo que garantiza consistencia estructural entre lenguas. No se dispone de informacion sobre el numero exacto de tokens de entrenamiento ni sobre la composicion detallada del dataset.

La innovacion principal no reside en la arquitectura, sino en el diseno del esquema de herramientas y en la integracion con Home Assistant. El modelo espera un system prompt con la lista de entidades (entity_id, nombre y area) y seis herramientas con firmas concretas: `control`, `get_state`, `music_library`, `timer`, `get_time` y `broadcast`. El chat template Jinja embebido en el GGUF renderiza las herramientas y convierte los bloques `<tool_call>` en `tool_calls` compatibles con la API de OpenAI, lo que exige el flag `--jinja` en llama-server. La cuantizacion Q4_K_M se ha realizado con importance matrix para preservar la precision en las llamadas estructuradas.

## Capacidades

- Generacion de texto conversacional y razonamiento de un solo turno orientado a la accion, con temperatura de muestreo recomendada de 0.
- Tool calling nativo con seis herramientas: control de servicios de Home Assistant (incluye luces por area y `"*"` para toda la casa), consulta de estados y atributos, busqueda en la biblioteca multimedia, gestion de temporizadores, consulta de hora y fecha, y anuncios por megafonia.
- Control de reproductores multimedia: `search_and_play` (por consulta, tipo de medio y artista), `seek_relative` y gestion de listas de tareas (`todo.add_item`, `todo.complete_item`).
- Consulta de meteorologia con horas restantes del dia (`later_today`) y prevision de dias siguientes (`forecast`).
- Manejo de errores: si una herramienta devuelve `{"success": false, ...}`, el modelo reporta el fallo en lugar de afirmar exito.
- Soporte multilingue mediante un modelo independiente por idioma (no multilingue en un solo checkpoint).
- Integracion con la API compatible con OpenAI a traves de llama-server.
- No dispone de vision, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Asistente de voz domestico local: el modelo se ejecuta en el propio host de Home Assistant mediante el add-on HA LLM Inference y responde a comandos como encender luces por area o consultar la temperatura, sin enviar datos a la nube.
- Control de iluminacion y persianas por area: gracias a la herramienta `control` con parametro `area` y comodin `"*"`, el usuario puede pedir "apaga todas las luces del salon" o "baja la persiana de la cocina" sin especificar entity_id.
- Reproduccion musical por lenguaje natural: `music_library` permite listar listas de reproduccion, artistas, albumes y emisoras, y `search_and_play` reproduce la seleccion en el reproductor adecuado; si no se indica reproductor, suena en el altavoz del dispositivo de voz.
- Gestion de temporizadores y listas de la compra: `timer` inicia, cancela, pausa o consulta temporizadores del dispositivo de voz, y `todo.add_item` anade productos a la lista de la compra desde una frase.
- Consulta de estados y meteorologia: `get_state` recupera atributos de entidades o de todos los dispositivos de un dominio en un area, y devuelve la previsión meteorologica con `later_today` y `forecast`.
- Anuncios por megafonia: `broadcast` emite un mensaje por todos los altavoces de la casa, util para avisos familiares o recordatorios.
- Despliegue en hardware modesto: con 1,9 GB en Q4_K_M cabe en una GTX 1060 de 6 GB o en una CPU con AVX2, lo que permite montar un asistente domotico en una Raspberry Pi o mini-PC sin GPU dedicada.
- Integracion en pipelines de automatizacion: la API compatible con OpenAI permite invocar el modelo desde scripts o nodos de Home Assistant para generar acciones estructuradas en flujos automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos de rendimiento proporcionados por el autor son de inferencia: aproximadamente 16 tokens/s de salida en CPU con AVX2 y 4 nucleos, y en una GTX 1060 de 6 GB, 540 tokens/s de procesamiento de prompt y 45 tokens/s de salida.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,9 GB para el archivo Q4_K_M, mas overhead de contexto; con 8.192 tokens de contexto conviene reservar 3-4 GB.
- GPU recomendadas: GTX 1060 de 6 GB (medida por el autor), asi como cualquier GPU con 4 GB o mas de VRAM; para mayor throughput, RTX 3060, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: si, en GTX 1060 6 GB y superiores; tambien funciona en CPU con AVX2 (aproximadamente 16 tokens/s de salida en 4 nucleos).
- Opciones de despliegue: llama-server (llama.cpp) con flag `--jinja` obligatorio; el ecosistema GGUF permite tambien Ollama y otros runners compatibles con llama.cpp. El autor distribuye un add-on de Home Assistant y una integracion HACS.
- Latencia y throughput: 540 tokens/s de prompt y 45 tokens/s de salida en GTX 1060 6 GB; 16 tokens/s de salida en CPU de 4 nucleos con AVX2.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|---|
| mkenfenheuer/qwen2.5-3b-homeassistant-GGUF | 3,09 B | 32.768 (base); 8.192 recomendado | 6 modelos (de, en, es, fr, it, nl) | qwen-research | GGUF Q4_K_M | Tool calling para Home Assistant |
| Qwen/Qwen2.5-3B-Instruct (base) | 3,09 B | 32.768 | Multilingue | qwen-research | safetensors, GGUF | Instrucciones generales, sin herramientas de domotica |
| Modelos de asistente domotico en la nube | no disponible | no disponible | no disponible | propietaria | API | Asistente de voz, requiere conexion |

La comparativa con alternativas especificas de domotica local no esta disponible en la informacion proporcionada. Frente al modelo base, este ajuste incorpora el esquema de seis herramientas, el chat template con system prompt por defecto y la cuantizacion con imatrix, a costa de especializarse y perder capacidades generales fuera del dominio de Home Assistant.

## Limitaciones y advertencias

- El modelo solo controla dispositivos si recibe el system prompt completo con la lista de entidades; sin esa lista no puede emitir llamadas validas y tiende a inventar entity_id, algo que el propio prompt intenta mitigar.
- Esta especializado en Home Assistant: su rendimiento en tareas generales de texto, codigo o matematicas sera inferior al del Qwen2.5-3B-Instruct original.
- Licencia qwen-research: restringe el uso comercial; es necesario revisar el archivo LICENSE antes de desplegarlo en productos o servicios de pago.
- Un modelo por idioma: no es multilingue en un unico checkpoint, lo que obliga a elegir y cargar la variante correcta.
- Riesgo de alucinacion en nombres de entidades, atributos o resultados de herramientas; el diseno de tool results con `success: false` ayuda a detectar fallos, pero no los elimina.
- El modelo no dispone de vision, audio ni razonamiento multi-paso complejo; esta pensado para interacciones de un solo turno con temperatura 0.
- La version en espanol es la v19; las variantes en otros idiomas pueden tener versiones distintas (italiano en v18), lo que implica posibles diferencias de comportamiento entre lenguas.
- Requiere `--jinja` en llama-server para activar el chat template; sin ese flag las llamadas a herramientas no se parsean correctamente.
- No se han publicado evaluaciones formales de precision en tool calling ni benchmarks estandar, por lo que la calidad debe validarse en el entorno concreto de cada instalacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mkenfenheuer/qwen2.5-3b-homeassistant-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/mkenfenheuer/homeassistant-tool-calling
- Esquema de herramientas (`llm_schema.py`): https://huggingface.co/datasets/mkenfenheuer/homeassistant-tool-calling/blob/main/llm_schema.py
- Repositorio del proyecto (add-on e integracion): https://github.com/mKenfenheuer/homeassistant-llm
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
