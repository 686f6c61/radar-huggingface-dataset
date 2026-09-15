# prathamkode/mininpc-1-GGUF

## Resumen

MiniNPC-1 es un ajuste fino orientado a dialogo de PNJ (personajes no jugadores) en videojuegos, distribuido exclusivamente en formato GGUF por el usuario prathamkode. Deriva del modelo base openbmb/MiniCPM5-2B-SFT mediante cuantizacion, y su proposito es muy concreto: convertir una tarjeta de personaje en JSON (campos `name`, `role`, `voice`, `facts`, `must_not`) mas una linea del jugador en una unica linea hablada del PNJ, en un solo paso de inferencia y sin infraestructura en la nube.

El modelo no se presenta como un asistente generalista, sino como una pieza de un bucle de juego: se ejecuta localmente con `llama-server` o LM Studio, con la plantilla de chat ya modificada para desactivar el modo de razonamiento (el "thinking" queda fijado a off en la propia plantilla). Esto reduce la latencia y evita que el modelo emita trazas internas antes de la respuesta, algo critico cuando la salida se va a reproducir como voz de un personaje.

Su relevancia practica esta en el formato: un unico fichero Q4_K_M de aproximadamente 1,6 GB que cabe en practicamente cualquier equipo, con un contrato de datos publicado (`card.schema.json`) y un ejemplo congelado (`example_card.json`). A cambio, el repositorio no incluye resultados de benchmarks, no tiene descargas ni valoraciones registradas y solo declara soporte de ingles. Es, por tanto, una herramienta acotada y lista para integrar, no un modelo validado de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada del modelo base openbmb/MiniCPM5-2B-SFT; la model card no describe la arquitectura) |
| Parametros totales | aproximadamente 2.000 millones, inferido del nombre del modelo base; no confirmado en la model card |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible como maximo; el ejemplo oficial de `llama-server` usa `-c 2048` |
| Tipos de cuantizacion | Q4_K_M (fichero principal); adaptador LoRA GGUF opcional (`MiniNPC-1-lora.gguf`) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 (heredada del modelo base, segun la model card) |
| Formato de pesos | GGUF (safetensors no disponible; el repositorio solo publica GGUF) |

Otros datos de interes: `pipeline_tag` = text-generation, `library_name` = gguf, creado el 15 de septiembre de 2026, 0 descargas y 0 valoraciones en el momento de la consulta.

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo. Todos los datos tecnicos se heredan del modelo base `openbmb/MiniCPM5-2B-SFT`, que la model card identifica como origen de la cuantizacion (`base_model_relation: quantized`). No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO durante el ajuste fino del modelo base. Tampoco se detalla el proceso de ajuste que da lugar a MiniNPC-1 mas alla de la mencion a un adaptador LoRA opcional.

La innovacion tecnica documentada no esta en la arquitectura, sino en el formato de uso. El modelo se integra en un bucle de un solo paso (`card + player_line → npc_line`) donde el prompt de sistema no lo escribe el usuario: se genera con `render_card(card)`, una funcion de la libreria Python `mininpc` que serializa la tarjeta JSON a un formato fijo. La model card insiste explicitamente en no inventar una disposicion de prompt nueva. Ademas, el modo de razonamiento esta desactivado de forma permanente en la plantilla de chat, lo que garantiza que la salida sea directamente una linea hablada del personaje. El contrato de la tarjeta es estricto: `name`, `role`, `voice`, `facts` y `must_not` son obligatorios; `id`, `personality`, `backstory` y `setting` son opcionales.

## Capacidades

- Generacion de dialogo de personaje en un unico turno: recibe una linea del jugador y devuelve una linea hablada del PNJ, sin narracion ni acotaciones.
- Cumplimiento de un contrato de personaje estructurado en JSON, con campos de identidad, rol, voz, hechos canonicos y una lista de prohibiciones (`must_not`).
- Consistencia de voz y registro: el campo `voice` de la tarjeta define el estilo de habla del personaje.
- Ejecucion local sin dependencias de red, mediante `llama-server`, llama.cpp o LM Studio.
- Interfaz compatible con la API de chat completions de OpenAI (`/v1/chat/completions`), lo que facilita su integracion en clientes existentes.
- Determinismo en la generacion: el ejemplo oficial usa `temperature: 0`, con `max_tokens` de 120.
- Modo de razonamiento desactivado (baked into the chat template), lo que evita trazas internas en la salida.
- Carga opcional de un adaptador LoRA GGUF sobre el GGUF del modelo base, si el usuario ya dispone de `openbmb/MiniCPM5-2B-GGUF`.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio, matematicas ni codigo. El ajuste esta orientado exclusivamente a roleplay y dialogo de PNJ.

## Casos de uso

- Dialogo de PNJ en tiempo real dentro de un videojuego: el motor envia la tarjeta del personaje como mensaje de sistema y la linea del jugador como mensaje de usuario; el modelo devuelve una linea lista para sintetizar como voz. Es adecuado porque el bucle es de un solo paso, la temperatura es 0 (respuestas estables y repetibles) y no hay trazas de razonamiento que descartar.
- Prototipado rapido de personajes secundarios: con el esquema `card.schema.json`, un disenador puede definir decenas de PNJ distintos variando solo el JSON, sin reentrenar nada ni tocar el prompt de sistema.
- Control de contenido mediante el campo `must_not`: en escenarios donde el personaje no debe revelar informacion de la trama o no puede salirse de su papel, la tarjeta actua como una capa de restricciones declarativas reutilizable entre personajes.
- Juegos para un solo jugador sin conexion: al ser un GGUF de aproximadamente 1,6 GB, el modelo puede empaquetarse junto al juego y ejecutarse en el equipo del usuario sin coste de inferencia en servidores.
- Generacion de variaciones de dialogo para guionistas y equipos de narrativa: dado un mismo PNJ y un conjunto de entradas del jugador, se pueden producir borradores de linea con una voz consistente para su posterior edicion humana.
- Integracion en mods y proyectos de la comunidad: la compatibilidad con la API de chat completions permite apuntar herramientas existentes a un `llama-server` local en el puerto 8080 sin escribir un cliente propio.
- Bots de rol en comunidades y chats: un personaje fijo con tarjeta congelada puede mantener interacciones cortas y repetibles en ingles, con el esquema de tarjeta como fuente de verdad del personaje.
- Investigacion sobre roleplay con restricciones duras: el par `facts` / `must_not` permite estudiar empiricamente el grado de adherencia del modelo a hechos impuestos y prohibiciones explicitas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y no se ha encontrado informacion adicional en la busqueda web (los resultados devueltos no guardan relacion con el modelo). Tampoco se publican mediciones de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada: en torno a 2-2,5 GB para el fichero Q4_K_M de aproximadamente 1,6 GB mas el contexto de 2048 tokens. Cifra orientativa, no publicada por el autor.
- GPU recomendadas: no requiere aceleradores de datacenter. Cualquier GPU de consumo moderna (serie RTX 30/40, GTX 1650 o superior, e incluso graficas integradas con suficiente memoria compartida) es suficiente. No tiene sentido desplegarlo en A100 o H100.
- Inferencia en CPU: viable, dado el tamano del fichero y la cuantizacion Q4_K_M. No se publican tasas de tokens por segundo.
- Opciones de despliegue: `llama-server` con `--jinja --reasoning-budget 0`, llama.cpp, LM Studio (cargando el GGUF y pegando la tarjeta renderizada como prompt de sistema) y la libreria Python `mininpc` para renderizar la tarjeta sin PyTorch.
- vLLM y TGI: no son el destino natural de un GGUF; no se documenta ninguna via de conversion a safetensors para este repositorio.
- Latencia y throughput: no disponibles. El unico parametro de rendimiento publicado es la configuracion de generacion recomendada (`temperature 0`, `max_tokens 120`, contexto 2048).

## Comparativa con modelos similares

La informacion proporcionada no incluye comparativas. La tabla siguiente usa datos de conocimiento publico sobre modelos de tamano y proposito similares y debe verificarse antes de tomar decisiones; las cifras de MiniNPC-1 son las unicas extraidas del repositorio analizado.

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| MiniNPC-1 (este repositorio) | aprox. 2B (inferido) | no disponible; ejemplo con 2048 | GGUF | Apache-2.0 | Roleplay de PNJ con tarjeta JSON |
| openbmb/MiniCPM5-2B-SFT (modelo base) | aprox. 2B | no disponible en la informacion facilitada | safetensors / GGUF | Apache-2.0 segun la model card | Modelo base de proposito general |
| Qwen2.5-1.5B-Instruct (GGUF) | 1,54B | 32.768 tokens nativos | GGUF, safetensors | Apache-2.0 | Asistente generalista e instrucciones |
| Llama-3.2-1B-Instruct (GGUF) | 1,24B | 128.000 tokens | GGUF, safetensors | Llama 3.2 Community License | Asistente generalista, resumen y recuperacion |

La diferencia competitiva de MiniNPC-1 no es el rendimiento bruto, sino la especializacion: los modelos generalistas de 1-2B ofrecen mas contexto y capacidades mas amplias, mientras que este repositorio entrega un contrato de personaje y un bucle de inferencia ya resueltos.

## Limitaciones y advertencias

- Solo soporta ingles (`language: en`). No hay evidencia de comportamiento fiable en castellano ni en otros idiomas.
- No se han publicado benchmarks: el rendimiento real en adherencia al personaje, coherencia multi-turno o resistencia a la manipulacion es desconocido.
- El repositorio registra 0 descargas y 0 valoraciones, por lo que no existe validacion independiente por parte de la comunidad. Es un artefacto reciente y sin rodaje.
- La ventana de contexto usada en el ejemplo oficial es de 2048 tokens. Esto limita el historial de conversacion y el tamano de la tarjeta de personaje; no hay confirmacion de que el modelo soporte ventanas mayores.
- Riesgo de alucinacion: los hechos definidos en el campo `facts` pueden ser ignorados o contradichos, y el modelo puede inventar detalles del mundo que no estan en la tarjeta.
- El campo `must_not` es una restriccion en el prompt, no un mecanismo de seguridad. No garantiza que el modelo respete las prohibiciones, especialmente ante entradas adversarias.
- El modo de razonamiento esta desactivado de forma fija en la plantilla de chat. Esto es intencionado para el caso de uso, pero descarta cualquier tarea que requiera razonamiento multi-paso.
- La model card advierte de que el diseno del prompt de sistema debe ser exactamente el que produce `render_card(card)`. Modificar la disposicion puede degradar el comportamiento, ya que el ajuste se ha hecho contra ese formato concreto.
- Licencia: la model card declara Apache-2.0, heredada del modelo base. Conviene verificar los terminos vigentes de `openbmb/MiniCPM5-2B-SFT`, ya que algunas versiones de la familia MiniCPM se han distribuido bajo licencias propias con condiciones especificas para uso comercial.
- No se documentan capacidades de tool calling, agentes, codigo, matematicas ni vision. No debe asumirse que las hereda del modelo base.
- No hay informacion sobre sesgos, composicion del dataset ni procesos de alineacion, por lo que no es posible evaluar sesgos conocidos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/prathamkode/mininpc-1-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B-SFT
- llama.cpp (motor de inferencia GGUF): https://github.com/ggml-org/llama.cpp
- LM Studio (cliente grafico compatible con GGUF): https://lmstudio.ai
- Busqueda web realizada: no se han encontrado resultados relevantes sobre este modelo, su modelo base ni su proceso de entrenamiento. Las paginas devueltas no guardan relacion con el contenido de la ficha.
- Paper, blog tecnico, repositorio de codigo y demo: no disponibles en la informacion proporcionada.
