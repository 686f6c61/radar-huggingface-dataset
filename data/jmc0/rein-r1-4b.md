# jmc0/rein-r1-4b

## Resumen

Rein-r1-4B es un modelo de decisión tipada desarrollado por el usuario jmc0, afinado a partir de Qwen/Qwen3.5-4B-Base. No es un modelo generativo de chat: su función es leer una conversación y una hoja de reglas, y devolver probabilidades calibradas para cada opción de cada regla. Esas decisiones se usan para pilotar y restringir a un modelo de chat separado (por ejemplo, Qwen3.5 instruct), abriendo la respuesta con una llamada a herramienta, imponiendo frases obligatorias, vetando temas o cortando respuestas que empiezan a violar una regla.

El modelo está pensado para dos escenarios donde un system prompt deja de funcionar tras decenas de turnos: NPCs de videojuego que deben mantener personaje, secretos y actuar en el mundo mediante tool calls en lugar de narrar acciones, y cumplimiento de reglas en chats de soporte, compañía y agentes (temas prohibidos, datos privados, enrutado y traspasos). Rein no escribe texto: solo decide, y las reglas llegan con cada petición, de modo que una regla nunca vista se trata como una pregunta nueva.

Técnicamente es un transformer de 2.646.574.208 parámetros reales (según safetensors) con 32 bloques, de los cuales solo se ejecutan los 18 primeros: los 14 últimos nunca corren en inferencia. En bf16 ocupa unos 6 GB de VRAM y una petición típica de unas 5 reglas tarda unos 100 ms de mediana en una RTX 4090 con la ruta PyTorch por defecto. La licencia es Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida basada en Gated DeltaNet (heredada de Qwen3.5), con ejecución truncada a los 18 primeros bloques de 32 |
| Parametros totales | 2.646.574.208 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card solo documenta bf16 y float32 en CPU) |
| Idiomas soportados | en, pt, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-4B-Base |
| Pipeline | text-classification |
| Requiere trust_remote_code | sí (código de decisión y control incluido en el repo) |

## Arquitectura y entrenamiento

Rein-r1-4B parte de Qwen3.5-4B-Base, un transformer con capas de atención Gated DeltaNet, y se afina como modelo de decisión tipada en lugar de como modelo de lenguaje. La innovación principal es el truncado de profundidad: solo se ejecutan los 18 primeros de los 32 bloques, lo que reduce el coste de inferencia de forma sustancial manteniendo la calidad de decisión. El modelo recibe la conversación y una hoja de reglas en la que cada regla es una pregunta tipada con sus propias opciones, y devuelve una probabilidad calibrada por opción. No genera texto libre en ningún caso.

El ajuste se realizó sobre el dataset propio jmc0/rein-decisions, complementado con PolyAI/banking77, clinc/clinc_oos, AmazonScience/massive y jaredpalmer/kev-suites. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. La model card menciona que el modelo generaliza a reglas no vistas en entrenamiento, con un 98,0% de acierto en preguntas de elección de herramienta y un 96,4% en las comprobaciones del watcher (detección de respuestas que narran una acción sin ejecutar la llamada).

## Capacidades

- Decisión tipada con probabilidades calibradas por opción para cada regla de la hoja de reglas.
- Elección de herramienta: decide si un turno necesita tool call y cuál, con apertura de la respuesta por esa llamada.
- Retención de herramientas: si la probabilidad de que no haga falta ninguna herramienta cae por debajo de 0,05, las herramientas se retiran para ese turno.
- Aplicación de reglas: frases obligatorias de apertura, cierre de respuesta cuando se prohíbe un tema, recordatorios de regla por turno y veto de palabras para el turno.
- Modo watcher con scope draft: lee la respuesta mientras se escribe y sustituye una acción narrada por la llamada real.
- Generalización a reglas nuevas: al recibir las reglas con cada petición, una regla nunca vista se trata como una pregunta nueva.
- Soporte para NPCs de juego: mantenimiento de personaje, secretos condicionados al estado del juego y actuación en el mundo mediante herramientas.
- Cumplimiento en soporte y agentes: temas prohibidos, datos privados, enrutado y traspasos.
- Multilingüe con foco en inglés y portugués.
- No genera texto: requiere un modelo de chat externo que redacte la respuesta.

## Casos de uso

- NPCs de videojuego con secretos condicionados: el modelo lee el estado de la conversación y la hoja de reglas del personaje, y decide si el NPC puede revelar una información según el estado del juego, manteniendo el personaje a lo largo de conversaciones largas donde un system prompt se degrada.
- Acciones en el mundo mediante herramientas en lugar de narración: en un juego o simulación, Rein decide si el turno requiere una herramienta (mover objeto, dar recompensa) y abre la respuesta con esa llamada, evitando que el modelo de chat narre acciones que nunca ocurren.
- Cumplimiento de temas prohibidos en soporte: con una regla de tema vetado, Rein cierra la respuesta en cuanto detecta que el modelo de chat empieza a violar la restricción, algo útil en sectores regulados donde el filtrado a posteriori llega tarde.
- Enrutado y traspaso en atención al cliente: las reglas de enrutado se evalúan por turno con probabilidades calibradas, de modo que el traspaso a un humano o a otro departamento se dispara con un umbral configurable (por ejemplo, 0,85) en lugar de con coincidencias de palabras clave.
- Protección de datos privados en chats de compañía o agentes: una regla tipada comprueba si la respuesta revela datos privados y, en tal caso, aplica recordatorio de regla, veto de palabras o corte de la respuesta antes de que se envíe.
- Guardrails en pipelines de agentes con tool calling: Rein actúa como capa previa a cada respuesta, retirando herramientas cuando no son necesarias (probabilidad inferior a 0,05) y forzando la llamada correcta cuando sí lo son, lo que reduce llamadas espurias y acciones narradas.
- Despliegue en hardware de consumo: con unos 6 GB de VRAM en bf16 y unos 100 ms de mediana por petición de 5 reglas en una RTX 4090, cabe junto a un modelo de chat de 4B en una única GPU de 24 GB (el ejemplo de NPC de la model card pico a 13 GB).

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Acierto en elección de herramienta sobre reglas no vistas en entrenamiento | 98,0% |
| Acierto en comprobaciones del watcher (acción narrada sin llamada) sobre reglas no vistas | 96,4% |
| Llamada a la herramienta necesaria, extremo a extremo, con Qwen3.5-0.8B + Rein | 93% |
| Llamada a la herramienta necesaria, extremo a extremo, con Qwen3.5-0.8B sin Rein | 61% |
| Latencia mediana por petición (unas 5 reglas, RTX 4090, ruta PyTorch por defecto) | ~100 ms |
| VRAM en bf16 | ~6 GB |
| Pico de VRAM del ejemplo NPC (Rein-r1-4B + Qwen3.5-4B en una RTX 4090 de 24 GB) | 13 GB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; el modelo es de decisión y no de generación, por lo que esas métricas no aplican directamente.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 6 GB en bf16; el ejemplo completo con un modelo de chat de 4B pico a 13 GB.
- GPU recomendadas: RTX 4090 para el caso de consumo documentado; para despliegue a escala, A100 o H100 (no documentadas en la model card).
- Cabe en GPU de consumo: sí, en una RTX 4090 de 24 GB junto con un modelo de chat de 4B; también se ejecutó en CPU en float32 para los ejemplos de la model card.
- Opciones de despliegue: transformers (>=5.17) con trust_remote_code=True y safetensors; flash-linear-attention y causal-conv1d son extras opcionales que añaden kernels fusionados de Gated DeltaNet en GPUs NVIDIA compatibles, con los mismos resultados.
- Latencia y throughput: unos 100 ms de mediana por petición de 5 reglas en RTX 4090 con la ruta PyTorch por defecto; no se documenta throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rein-r1-4B | 2.646.574.208 | no disponible | Decisión tipada y control de reglas sobre un chat model | apache-2.0 | Hugging Face (jmc0/rein-r1-4b) |
| Rein-r1-0.8B | no disponible | no disponible | Igual, versión reducida | no disponible | Hugging Face (jmc0/rein-r1-0.8b) |
| Qwen3.5-4B-Base | no disponible | no disponible | Modelo base generativo | no disponible | Hugging Face (Qwen/Qwen3.5-4B-Base) |

La comparación relevante es con Rein-r1-0.8B: según la model card, necesita unos 2 GB de VRAM y pilotó un modelo de chat de 4B tan bien como Rein-r1-4B en las sesiones extremo a extremo documentadas, mientras que Rein-r1-4B toma mejores decisiones en los casos difíciles (mismas palabras con otra intención, secretos de NPC, elección de herramienta y ataques de narración). No se dispone de datos de otros modelos comparables de decisión en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no escribe texto; necesita un modelo de chat externo que redacte la respuesta a partir de sus decisiones.
- Requiere trust_remote_code=True, lo que ejecuta código de decisión y control incluido en el repo; conviene revisarlo antes de usarlo, como con cualquier modelo de código personalizado.
- Los umbrales (0,85 para forzar la llamada, 0,05 para retirar herramientas) son valores por defecto y deben calibrarse para cada despliegue.
- El modelo de chat muestrea, por lo que el texto de los argumentos (por ejemplo, el campo reason) puede variar entre ejecuciones.
- No se documentan sesgos conocidos, riesgo de alucinación específico ni limitaciones de longitud de contexto en la información disponible.
- Idiomas documentados: inglés, portugués y multilingüe; no se detalla la cobertura por idioma ni el rendimiento en castellano.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B-Base tiene sus propias condiciones que deben verificarse por separado.
- El modelo tiene 2 descargas y 1 like en el momento de la consulta, por lo que la validación por parte de la comunidad es muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jmc0/rein-r1-4b
- Versión reducida: https://huggingface.co/jmc0/rein-r1-0.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Dataset propio: https://huggingface.co/datasets/jmc0/rein-decisions
- Dataset PolyAI/banking77: https://huggingface.co/datasets/PolyAI/banking77
- Dataset clinc/clinc_oos: https://huggingface.co/datasets/clinc/clinc_oos
- Dataset AmazonScience/massive: https://huggingface.co/datasets/AmazonScience/massive
- Dataset jaredpalmer/kev-suites: https://huggingface.co/datasets/jaredpalmer/kev-suites
