# jmc0/Rein-NPC-4B-GGUF

## Resumen

Rein-NPC-4B-GGUF es la distribución en formato GGUF de Rein-NPC-4B, un modelo de lenguaje de 4.841.450.496 parámetros construido sobre Qwen3.5-4B al que se le ha incorporado el modelo de decisión de Rein como 64 filas entrenadas en la tabla de embeddings. Lo desarrolla jmc0 y está pensado específicamente para NPC de videojuegos: el modelo no solo conversa, sino que también toma decisiones tipadas (tool calling) dentro del mismo proceso de `llama-server`.

La propuesta técnica es original: cada turno del jugador se resuelve con dos peticiones al servidor. Primero una completion de un solo token que selecciona entre opciones etiquetadas con letras (A, B, C...) mediante `top_logprobs`, y después la respuesta conversacional normal a través de `/v1/chat/completions`. Las 64 filas de decisión viven en la tabla de embeddings como tokens especiales (`<|rein_0|>` a `<|rein_63|>`, ids 248077 a 248140) y la cabeza de salida es la tabla original de Qwen3.5-4B sin tocar, de modo que esos tokens nunca aparecen en el chat.

El modelo es relevante para desarrolladores de juegos que necesitan un NPC capaz de razonar y decidir con tool calling en hardware de consumo: el archivo Q4_K_M ocupa 3,07 GB y con dos slots de 16k cabe en 6 GB de VRAM. La licencia Apache 2.0 facilita su integración comercial. Los idiomas declarados son inglés, portugués y multilingüe.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-4B) con 64 filas de decisión entrenadas en la tabla de embeddings; 8 capas de atención completa de 32 |
| Parámetros totales | 4.841.450.496 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (configuración recomendada en `llama-server`); coste de KV cache de ~32 KB por token |
| Tipos de cuantización | Q4_K_M (3,07 GB), Q8_0 (5,16 GB), bf16 (9,70 GB) |
| Idiomas soportados | Inglés, portugués, multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); también disponible el checkpoint safetensors del modelo base |
| Modelo base | jmc0/Rein-NPC-4B (a su vez basado en Qwen3.5-4B) |
| Tamaño del repo | 21,0 GB |
| Librería | llama.cpp |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer de 32 capas del que 8 son de atención completa. Sobre esa base, el autor ha incorporado el modelo de decisión de Rein como 64 filas entrenadas dentro de la tabla de embeddings, manteniendo la cabeza de salida original del modelo base como cabeza separada. Esto permite que un mismo proceso `llama-server` converse y decida: las filas de decisión se activan mediante tokens especiales que llama.cpp trata como tokens individuales.

El mecanismo de decisión funciona con prompts de texto plano que combinan el estado (persona y escena, seguido de la conversación en el marcado de turnos de Qwen) y una fila por regla compuesta de 48 soft tokens, la pregunta, las opciones tras letras, 16 soft tokens y la marca de respuesta. Se solicita un token con sus candidatos principales y se aplica un escalado de log-probabilidades dividiendo por 0,812 antes del softmax. La conversión a GGUF se realizó con `convert_hf_to_gguf.py` en bf16 y `llama-quantize` desde el checkpoint safetensors. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno con la calidad de Qwen3.5-4B en la cuantización elegida.
- Toma de decisiones tipadas mediante un token de elección entre opciones etiquetadas con letras, con probabilidades calibradas.
- Tool calling / function calling: la decisión puede abrir una llamada a herramienta que `llama-server` continúa y devuelve ya parseada.
- Soporte de agentes y razonamiento multi-paso: cada regla de la ficha del NPC es una petición de decisión sobre el mismo estado, con `cache_prompt` para reutilizar la caché.
- Control de tool calling mediante `logit_bias` para prohibir `<tool_call>` cuando la decisión indica que no procede.
- Capacidades multilingües en inglés, portugués y otros idiomas.
- Integración en navegador mediante wllama (llama.cpp en WebAssembly, con WebGPU cuando está disponible).

## Casos de uso

- NPC de comerciante en un RPG: el modelo decide si mostrar el inventario, aplicar una regla de precio o no hacer nada, y a continuación genera el diálogo correspondiente. La ficha de ejemplo `examples/shop-keeper.yaml` incluye persona, escena, cinco herramientas y tres reglas.
- NPC con reglas de comportamiento condicional: cada regla yes/no se evalúa como una petición de decisión independiente y, cuando se dispara, su línea base se añade al mensaje del jugador.
- Diálogo multi-turno con contexto largo: los 32k tokens de ventana permiten mantener conversaciones extensas con memoria de la escena y del historial.
- Despliegue en hardware de consumo: el archivo Q4_K_M de 3,07 GB con dos slots de 16k cabe en 6 GB de VRAM, adecuado para portátiles y GPUs de gama media.
- Prototipado en navegador: el playground de Hugging Face Spaces ejecuta el modelo en el navegador del visitante con wllama y WebGPU, útil para demos sin infraestructura de servidor.
- Integración en motores de juego: la model card documenta adaptadores para LLMUnity, la API C de llama.cpp, wllama y vLLM, lo que facilita incorporar el modelo a pipelines de juego existentes.
- Sistemas de decisión con trazabilidad: al separar la decisión (un token con probabilidades) de la respuesta, se puede auditar y depurar por qué un NPC eligió una acción concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí incluye una evaluación específica del efecto de la cuantización sobre las decisiones, comparando Q4_K_M vía `llama-server` con el modelo en PyTorch bf16 sobre 104 preguntas de 20 registros de test reservados:

| Archivo | Misma opción que bf16 | Brecha media de probabilidad máxima | Peor caso |
|---|---|---|---|
| Q4_K_M | 101 de 104 | 0,028 | 0,21 |

Todas las discrepancias corresponden a preguntas que el propio modelo bf16 deja abiertas (su opción principal con 0,41, 0,62 y 0,38). En las 90 preguntas donde bf16 asigna 0,8 o más a una opción, Q4_K_M elige la misma opción las 90 veces. Los 64 tokens de decisión nunca aparecen en el chat: sobre 984.371 posiciones de chat reservadas, su probabilidad media es 6,5e-8 y nunca entran en el top 100.

## Requisitos de hardware

- VRAM estimada: Q4_K_M ~3,07 GB de pesos; Q8_0 ~5,16 GB; bf16 ~9,70 GB. El KV cache cuesta ~32 KB por token, es decir, ~1 GB por slot con contexto de 32k.
- Configuración recomendada: Q4_K_M con dos slots de 16k cabe en 6 GB de VRAM.
- GPUs: Q4_K_M para GPUs de consumo y portátiles; Q8_0 para GPUs de 8 GB o más; bf16 para GPUs de 24 GB.
- Cabe en GPU de consumo: sí, con el archivo Q4_K_M en GPUs de 6 GB o más.
- Opciones de despliegue: `llama-server` (recomendado, con `-ngl 99 -c 32768 --parallel 2`), API C de llama.cpp, LLMUnity, wllama (navegador) y vLLM.
- Latencia: en el playground con GPU de escritorio, un turno completo (tres decisiones más la respuesta) tarda unos segundos; sin WebGPU la build de CPU funciona lentamente. No se dispone de cifras de throughput.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada. Como referencia estructural, el modelo se basa en Qwen3.5-4B y comparte su calidad conversacional en la cuantización elegida; frente a un Qwen3.5-4B estándar, la diferencia es la incorporación de las 64 filas de decisión y el flujo de dos peticiones por turno. No se dispone de información sobre alternativas comparables de NPC con decisión tipada.

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Rein-NPC-4B-GGUF | 4.841.450.496 | 32.768 | Apache 2.0 | Decisiones tipadas integradas, tool calling |
| Qwen3.5-4B | no disponible | no disponible | no disponible | Modelo base, sin capa de decisión |
| Alternativas de NPC con tool calling | no disponible | no disponible | no disponible | No disponible en la información |

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos conocidos del modelo.
- Riesgo de alucinación inherente a los modelos de lenguaje; en el contexto de NPC, las respuestas fuera de la persona o de las reglas deben filtrarse.
- El flujo de decisión depende de un escalado concreto de log-probabilidades (división por 0,812) y de la correspondencia de letras con tokens (A = 32, B = 33, etc.); alterar estos parámetros puede degradar la calibración.
- La cuantización Q4_K_M introduce discrepancias menores en las decisiones (3 de 104 preguntas en la evaluación), siempre en casos que el modelo bf16 deja abiertos.
- El soporte de idiomas declarado se limita a inglés, portugués y multilingüe; no se detalla la cobertura real por idioma.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-4B.
- El modelo está pensado para el flujo de dos peticiones por turno con `llama-server`; otros runtimes requieren los adaptadores documentados en la model card principal.
- No se dispone de información sobre latencia y throughput en producción más allá de las estimaciones cualitativas del playground.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/jmc0/Rein-NPC-4B-GGUF
- Modelo base: https://huggingface.co/jmc0/Rein-NPC-4B
- Repositorio de código: https://github.com/jasielmacedo/rein
- Playground en el navegador: https://huggingface.co/spaces/jmc0/rein-npc-playground
- Código del playground: https://github.com/jasielmacedo/rein/tree/main/tools/playground
