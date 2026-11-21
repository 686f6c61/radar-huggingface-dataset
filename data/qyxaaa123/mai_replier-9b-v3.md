# QYXaaa123/mai_replier-9b-v3

## Resumen

mai_replier-9b-v3 es un ajuste fino (fine-tune) del modelo Qwen3.5-9B desarrollado por el usuario QYXaaa123 para el ecosistema MaiBot. Se trata de un "replier" (respondedor) especializado en interpretar un personaje concreto dentro de chats de grupo de QQ, generando respuestas cortas, coloquiales y coherentes con una persona definida en el mensaje de sistema. El modelo no emplea cadena de pensamiento (thinking mode desactivado de forma obligatoria) y produce directamente una unica intervencion conversacional.

Tecnicamente es un modelo multimodal de 9.409.813.744 parametros (aproximadamente 9,4 mil millones) con arquitectura Qwen3.5 hibrida: 24 capas de atencion lineal GDN (Gated DeltaNet) combinadas con 8 capas de atencion completa, y un vocabulario de 248.320 tokens. Acepta entradas de imagen y texto intercalados, lo que permite insertar imagenes en la posicion exacta de cada mensaje del historial de chat. Los pesos se distribuyen en formato safetensors en bf16, con un repositorio de 18,8 GB.

Su relevancia es acotada pero concreta: cubre un nicho muy especifico (bots de rol en grupos de mensajeria) con un formato de prompt propietario y reproducible ("retro replyer v6.2"), lo que lo hace adecuado para despliegues de comunidad, no para tareas generales de razonamiento o codigo. La licencia Apache-2.0 permite uso comercial, aunque el modelo base y los datos de entrenamiento condicionan su aplicabilidad real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 hibrida: 24 capas de atencion lineal GDN + 8 capas de atencion completa (Qwen3_5ForConditionalGeneration) |
| Parametros totales | 9.409.813.744 (~9,4 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de vLLM usa `--max-model-len 8192` |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, ~18 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer hibrido que alterna 24 capas con atencion lineal GDN (Gated DeltaNet, una variante de atencion lineal con estado recurrente) y 8 capas con atencion completa estandar. Esta combinacion reduce el coste cuadratico del contexto largo manteniendo capacidad de recuperacion global en las capas full-attention. El vocabulario es de 248.320 tokens y la cabecera es `Qwen3_5ForConditionalGeneration`, lo que habilita la generacion condicionada por imagen y texto.

El ajuste se realizo mediante LoRA SFT con rango 64 y alpha 32, posteriormente fusionado en pesos completos (por eso el repo pesa 18,8 GB y no incluye adaptadores separados). No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. La innovacion principal no es arquitectonica sino de formato: el "retro replyer" define un template de dos mensajes (system con la persona y user con el historial completo renderizado), con renderizador `maibot-dev-retro-v6_2@3a09e4cca2ae`, y un esquema de imagenes intercaladas con reglas de escalado (las 3 mas recientes a 640 px de lado mayor, las anteriores a 128 px).

## Capacidades

- Generacion de texto conversacional breve y coloquial en chino, orientada a una sola intervencion por turno.
- Interpretacion de personaje (roleplay) a partir de una descripcion en el mensaje de sistema, incluyendo nombre, alias y estilo de respuesta.
- Entrada multimodal image-text-to-text con imagenes intercaladas en la posicion exacta de cada mensaje del historial.
- Comprension de contexto de grupo: distingue las intervenciones propias (marcadas como `{角色名}(你)`) de las de otros participantes.
- Manejo de eventos de chat: citas de respuesta (`[回复了...]`), menciones (`@`), stickers (`[表情包: ...]`), placeholders de imagen y eventos como retirada de mensajes.
- Generacion sin cadena de pensamiento (`enable_thinking=False` obligatorio), lo que reduce latencia y evita fugas de razonamiento interno.
- Soporte de "planner guidance" opcional en el prompt para orientar el tema de la respuesta.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, codigo ni matematicas.

## Casos de uso

- Bot de rol en grupos de QQ: el modelo recibe el historial renderizado con el formato retro y devuelve una frase en personaje; es su proposito disenado y el unico escenario validado por el autor.
- Comunidades de fan o simulacion: permite desplegar personajes con personalidad fija en grupos grandes, gestionando menciones, citas y stickers sin intervencion manual.
- Moderacion conversacional ligera: al comprender el contexto del grupo y las reglas de estilo, puede usarse para generar respuestas de encauzamiento de tema (siempre que se anada una capa externa de filtrado, ya que el modelo solo recibe instrucciones de evitar contenido sensible en el prompt).
- Analisis de imagenes compartidas en chat: gracias al intercalado multimodal, puede comentar una imagen enviada por otro usuario en el punto exacto del hilo, util en bots de resumen o de reaccion.
- Prototipado de agentes conversacionales con contexto largo: las capas GDN permiten mantener historiales extensos con menor coste que un transformer denso equivalente, adecuado para experimentar con memoria de conversacion.
- Investigacion sobre formatos de prompt: el template retro v6.2 es un ejemplo reproducible de diseno de plantilla para SFT conversacional, util como referencia en estudios de formato.
- Despliegue en infraestructura pequena: con 9,4 B en bf16 y contexto de 8k, cabe en una GPU de 24 GB o en dos de 16 GB, lo que facilita entornos de comunidad autoalojados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 19-20 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica requiere 24 GB o mas para contexto de 8k.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 10-11 GB (no se publican pesos cuantizados oficiales; habria que generarlos).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16 con contexto moderado.
- GPU consumer: cabe en RTX 4090 y RTX 3090 (24 GB) en bf16 con contexto limitado; en GPUs de 16 GB seria necesario cuantizar a 8 bits o menos.
- Opciones de despliegue: transformers (AutoModelForImageTextToText + AutoProcessor) y vLLM (`vllm serve` con `--max-model-len 8192` y `--gpu-memory-utilization 0.90`). No se documentan integraciones con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Enfoque |
|---|---|---|---|---|---|
| mai_replier-9b-v3 | 9,4 B | no disponible (ejemplo a 8k) | Si (image-text intercalado) | Apache-2.0 | Roleplay en grupos QQ, sin thinking |
| Qwen3.5-9B (base) | ~9 B | no disponible en esta ficha | Si | Apache-2.0 (segun base) | Modelo generalista multimodal |
| Alternativas de rol comunitario | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: fuera del formato retro replyer y del dominio de chat de grupo en chino, su calidad cae de forma previsible; no debe usarse como asistente general.
- Solo soporta chino; no hay evidencia de capacidades en castellano u otros idiomas.
- No se documentan sesgos especificos, pero al entrenarse sobre conversaciones de comunidad puede reproducir tonos, jerga o actitudes propias de esos entornos.
- Riesgo de alucinacion en la identificacion de hablantes, citas o eventos del historial, especialmente con historiales largos o imagenes de baja resolucion (las antiguas se reducen a 128 px).
- El modelo no incluye filtros propios: la instruccion de evitar contenido ilegal, sexual, violento o politico se delega en el prompt, por lo que en produccion es imprescindible una capa externa de moderacion.
- `enable_thinking=False` es obligatorio; activar el modo pensamiento puede degradar la salida al no haber sido entrenado para ello.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-9B y la procedencia de los datos de SFT, no detallados.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion externa de la comunidad.
- El autor declara que es un "producto experimental de comunidad" y que las salidas no representan opiniones de personas reales.

## Enlaces

- Hugging Face: https://huggingface.co/QYXaaa123/mai_replier-9b-v3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio del autor alternativo citado en la model card: https://huggingface.co/tcmofashi/mai_replier_9b_v3
- Renderizador retro v6.2: `maibot-dev-retro-v6_2@3a09e4cca2ae` (referencia interna, sin URL publica en la informacion disponible)
- Paper, blog o demo oficiales: no disponibles
