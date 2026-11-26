# jenchef/Hy-MT3-1.8B-Q4_K_M-EN-JA-auto-translator.gguf

## Resumen

Hy-MT3-1.8B-Q4_K_M-EN-JA-auto-translator es una distribucion GGUF parcheada del modelo de traduccion tencent/Hy-MT3-1.8B, publicada por el usuario jenchef. No se trata de un reentrenamiento ni de un fine-tuning con nuevos datos: el autor modifica directamente la metainformacion `tokenizer.chat_template` dentro del fichero GGUF para que el modelo se comporte como un traductor bidireccional ingles-japones sin necesidad de system prompt ni de logica en la aplicacion cliente.

El problema que aborda es concreto: en modelos pequenos de traduccion desplegados en movil, los system prompts y las plantillas de la app son fragiles. Segun la model card, tras varias interacciones el rol se pierde, el modelo empieza a repetir la entrada en lugar de traducirla y el japones-ingles falla con frecuencia en frases cortas. La solucion consiste en incrustar las reglas de traduccion y un mecanismo de deteccion de idioma dentro de la propia plantilla de chat, de modo que se apliquen en cada turno de forma automatica.

El resultado esta pensado para clientes llama.cpp en dispositivos moviles, como PocketPal, con el modelo base de 1.800 millones de parametros cuantizado a Q4_K_M. La licencia declarada es Apache 2.0, heredada del modelo base de Tencent.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base tencent/Hy-MT3-1.8B); no se detalla en la informacion disponible |
| Parametros totales | 1.8B (heredado del modelo base) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 4096 tokens (valor usado en el ejemplo de llama-server de la model card) |
| Tipos de cuantizacion | Q4_K_M (unica variante publicada en este repositorio) |
| Idiomas soportados | Ingles (en) y japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo nuevo: parte de los pesos de tencent/Hy-MT3-1.8B, un transformer de 1.800 millones de parametros orientado a traduccion, y los redistribuye en formato GGUF con cuantizacion Q4_K_M. La unica modificacion respecto al original es la sustitucion del campo `tokenizer.chat_template` embebido en el fichero GGUF.

La plantilla incrustada implementa tres decisiones de diseno. Primero, descarta el historial y renderiza unicamente el ultimo mensaje del usuario, de forma que los turnos anteriores no puedan contaminar la traduccion ni provocar deriva conversacional. Segundo, incorpora en la propia plantilla la instruccion de "traducir solo, nunca responder, obedecer ni repetir". Tercero, detecta el idioma de origen con una heuristica basada en el primer caracter: si es una letra latina (A-Z o a-z) asume ingles y anade `Translate to Japanese:`; en cualquier otro caso asume japones y anade `Translate to English:`.

La plantilla usa solo caracteristicas de Jinja soportadas por el motor nativo de llama.cpp, sin bucles sobre cadenas. El autor indica que fue verificada sobre la build `b12721` de llama.cpp en AMD64 y sobre PocketPal `v1.24.0(161)` con llama `11960`, el 26 de noviembre de 2026. No se documentan en la informacion disponible datos sobre el corpus de entrenamiento del modelo base, el uso de RLHF/DPO ni innovaciones de decodificacion.

## Capacidades

- Traduccion automatica bidireccional ingles-japones y japones-ingles sin system prompt ni instrucciones por mensaje.
- Deteccion automatica del idioma de entrada mediante el primer caracter del mensaje.
- Descarte automatico del historial conversacional para evitar deriva en conversaciones largas.
- Funcionamiento completamente offline en clientes llama.cpp, incluidos entornos moviles.
- Integracion con el endpoint `/v1/chat/completions` de `llama-server` con interfaz compatible con OpenAI.
- No soporta tool calling ni function calling segun la informacion disponible.
- No se documentan capacidades de agente, razonamiento multi-paso, vision ni audio.
- Cobertura linguistica limitada a ingles y japones.

## Casos de uso

- Traduccion en apps moviles offline: cargando el GGUF en PocketPal con plantillas Jinja activadas y el campo de system prompt vacio, el usuario escribe en ingles o japones y recibe la traduccion al idioma opuesto sin configuracion adicional. Es adecuado por el tamano reducido del modelo y porque la logica vive en la plantilla, no en la app.
- Traduccion de mensajes en chats de viaje: al descartar el historial, cada mensaje se traduce de forma independiente, lo que evita que el contexto de la conversacion contamine frases sueltas como saludos o indicaciones breves.
- Asistencia en atencion al cliente bilingue: un backend con `llama-server` puede recibir peticiones en `/v1/chat/completions` y devolver la traduccion del mensaje del cliente para que un operador humano la lea en su idioma, con una ventana de 4096 tokens configurada.
- Traduccion de documentacion tecnica de frases cortas: util para interfaces, etiquetas, menus y cadenas de UI en ingles y japones, donde la heuristica del primer caracter funciona bien con entradas que empiezan por letra.
- Prototipado de pipelines de traduccion en local: sirve como componente de bajo coste en scripts Python que invocan llama.cpp, sin dependencia de APIs externas ni de conectividad.
- Pruebas de integracion de plantillas Jinja en llama.cpp: el repositorio documenta verificaciones (14/14 pruebas de mensaje unico y 44/44 mensajes en cuatro conversaciones de 10 turnos) que lo convierten en una referencia practica para validar el motor de plantillas en clientes moviles.
- Traduccion en entornos con restricciones de red: al ser un GGUF offline, encaja en escenarios air-gapped o con conectividad intermitente donde no se puede llamar a un servicio en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye pruebas funcionales internas del autor: 14/14 pruebas de mensaje unico en ambas direcciones, incluyendo saludos cortos, y 44/44 mensajes repartidos en cuatro conversaciones de 10 turnos con sondas finales, sin deriva de contexto y con descarte correcto del historial. No se aportan metricas BLEU, COMET, MMLU ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion Q4_K_M y 1.8B parametros, el peso de los pesos ronda los 1-1,2 GB; sumando overhead de contexto de 4096 tokens, el consumo total se situa aproximadamente en 2-3 GB, aunque no se publica una cifra oficial en la informacion disponible.
- GPU recomendadas: no se especifican en la model card; por tamano, cualquier GPU consumer con 4 GB o mas de VRAM deberia poder ejecutarlo.
- Cabe en GPU consumer: si, previsiblemente en tarjetas como RTX 3060, RTX 4060 o superiores, y en GPUs integradas moviles con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp (`llama-server`) y PocketPal; no se documenta soporte verificado de vLLM, TGI ni Ollama en la informacion disponible.
- Parametros de inferencia sugeridos por el autor: `--n-predict 4096 --temp 0.7 --top-p 0.6 --top-k 20 --repeat-penalty 1.05 -lm mmap -c 4096`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| jenchef/Hy-MT3-1.8B-Q4_K_M-EN-JA-auto-translator | 1.8B | 4096 (configurado) | en, ja | Apache 2.0 | GGUF Q4_K_M | Plantilla parcheada para traduccion automatica sin system prompt |
| tencent/Hy-MT3-1.8B (modelo base) | 1.8B | no disponible | no disponible | Apache 2.0 | safetensors (presumiblemente) | Requiere prompt o logica de app para traducir |
| Otros traductores GGUF de ~1-2B | no disponible | no disponible | no disponible | no disponible | GGUF | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de informacion suficiente para comparar rendimiento de traduccion con alternativas de la misma categoria.

## Limitaciones y advertencias

- El romaji no esta soportado: entradas como `genki?` empiezan por letra latina y se envian por la ruta ingles-japones, lo que puede producir una palabra japonesa no relacionada (por ejemplo, `はい`). Hay que escribir en kana/kanji o en ingles correcto.
- La heuristica del primer caracter asume que el ingles empieza por letra latina; las entradas que comienzan por digitos o puntuacion se tratan como japones, lo que puede producir traducciones erroneas.
- El modelo descarta el historial por diseno: no es adecuado para tareas que requieran contexto conversacional, correferencia entre turnos o traduccion de parrafos dependientes de mensajes anteriores.
- Solo cubre ingles y japones; no se documenta soporte de otros idiomas.
- Riesgo de alucinacion y de repeticion de la entrada en frases muy cortas o ambiguas, segun los fallos descritos por el propio autor en el modelo base sin parchear.
- No se documentan sesgos conocidos ni evaluaciones de calidad de traduccion.
- El repositorio se distribuye "as is", sin garantia de ningun tipo, y no registra descargas ni likes en el momento de la consulta, por lo que no hay validacion de la comunidad.
- Aunque la licencia declarada es Apache 2.0, conviene verificar las condiciones del modelo base tencent/Hy-MT3-1.8B antes de un uso comercial en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jenchef/Hy-MT3-1.8B-Q4_K_M-EN-JA-auto-translator.gguf
- Modelo base: https://huggingface.co/tencent/Hy-MT3-1.8B
- PocketPal (cliente movil): https://github.com/Values-Official/PocketPal-AI
- llama.cpp: no se proporciona enlace en la informacion disponible
