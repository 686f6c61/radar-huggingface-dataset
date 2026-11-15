# goodmai/LFM2.5-24B-A2B-MLX-4bit

## Resumen

LFM2.5-24B-A2B es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por Liquid AI, disenado especificamente para agentes que se ejecutan en dispositivo (on-device) y con baja latencia. La ficha que nos ocupa, `goodmai/LFM2.5-24B-A2B-MLX-4bit`, es una conversion a formato MLX cuantizada a 4 bits del modelo original `LiquidAI/LFM2.5-24B-A2B`, pensada para su ejecucion en Apple Silicon mediante la libreria `mlx-lm`. Cuenta con 23.971.585.280 parametros totales y una arquitectura `lfm2_moe` (familia Liquid Foundation Models 2.5), con un prefijo "A2B" que indica aproximadamente 2.000 millones de parametros activos por token.

El modelo resuelve el problema de desplegar un LLM de razonamiento con capacidades de agente y tool calling en hardware de consumo, sin depender de GPUs de datacenter. Al tratarse de una cuantizacion de 4 bits (group size 64, modo affine) con embeddings en 6 bits y compuertas de enrutamiento MoE en float32, el repositorio ocupa 13,6 GB, lo que lo hace viable en Macs con memoria unificada de 16-24 GB. Soporta 10 idiomas (incluido el espanol) y emplea un formato de chat tipo ChatML con modo de razonamiento explicito (`<think>`).

Es relevante ahora porque combina tres tendencias: arquitecturas MoE eficientes en parametros activos, modelos de razonamiento con cadena de pensamiento explicita y despliegue local en Apple Silicon. La licencia es la LFM Open License v1.0, que conviene revisar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`lfm2_moe`, familia LFM2.5 de Liquid AI) |
| Parametros totales | 23.971.585.280 (~24B) |
| Parametros activos | ~2B (segun nomenclatura A2B; no confirmado en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (group size 64, affine); embeddings en 6 bits; compuertas MoE en float32 |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es, pt, it |
| Licencia | LFM Open License v1.0 (`lfm1.0`, etiquetada como `other`) |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`, requiere `mlx-lm >= 0.32.0`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de tipo mezcla de expertos (MoE) de la familia LFM2.5, identificada en los tags como `lfm2_moe` y `liquid`. El sufijo "A2B" indica que, pese a sus ~24.000 millones de parametros totales, solo se activan aproximadamente 2.000 millones por token, lo que reduce el coste computacional en inferencia. La model card de esta conversion no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; esa informacion corresponderia al modelo base `LiquidAI/LFM2.5-24B-A2B` y al informe tecnico LFM2 (arXiv:2511.23404), no incluidos en la informacion disponible.

La innovacion tecnica destacable de esta ficha concreta es la cuantizacion: 4 bits por peso con group size 64 en modo affine, embeddings (atados a la cabeza de salida) mantenidos a 6 bits y compuertas de enrutamiento MoE sin cuantizar en float32 para preservar la precision del enrutamiento. La conversion se realizo con `mlx-lm` 0.32.0; versiones anteriores cargan el modelo pero enrutan los expertos de forma incorrecta, lo que es un caveat critico de compatibilidad. El modelo incorpora un modo de razonamiento con cadena de pensamiento explicita en los turnos del asistente y un formato de chat tipo ChatML.

## Capacidades

- Generacion de texto conversacional y de razonamiento con cadena de pensamiento explicita (`<think>`).
- Modo de razonamiento: los turnos del asistente incluyen un CoT antes de la respuesta final.
- Tool calling / function calling: soportado mediante `tokenizer.apply_chat_template(..., tools=...)`.
- Orientado a agentes on-device: disenado por Liquid AI para "fast on-device agents".
- Capacidades multilingues en 10 idiomas: ingles, arabe, chino, frances, aleman, japones, coreano, espanol, portugues e italiano.
- Ejecucion local en Apple Silicon mediante MLX, sin Python en el caso de la app Basalt.
- No se documentan en la informacion disponible capacidades de vision, audio ni otros modos.

## Casos de uso

- Agentes locales en macOS: el modelo puede ejecutarse en Apple Silicon con `basalt serve --model ... --rest` o con `mlx-lm`, sirviendo como backend de agentes que no envian datos a la nube. Es adecuado por su naturaleza on-device y su soporte de tool calling.
- Asistentes de escritorio con privacidad: al correr en memoria unificada local, permite conversaciones multi-turno sin exposicion de datos a terceros, con el formato ChatML y el modo de razonamiento para respuestas complejas.
- Automatizacion de tareas con function calling: integracion en flujos que requieren invocar APIs o herramientas locales (sistema de ficheros, calendario, shell) mediante el paso de `tools` a la plantilla de chat.
- Razonamiento asistido en entornos sin GPU dedicada: el MoE con ~2B parametros activos reduce el coste por token, lo que lo hace viable para prototipos de razonamiento en portatiles Mac con 16-24 GB de memoria unificada.
- Procesamiento multilingue en local: traduccion, resumen o atencion al cliente en espanol, portugues, italiano, frances, aleman, entre otros, sin depender de servicios externos.
- Desarrollo y evaluacion de pipelines MLX: util como modelo de referencia para probar `mlx-lm >= 0.32.0`, cuantizacion 4-bit y enrutamiento MoE en hardware Apple antes de desplegar variantes mayores.
- Generacion de codigo asistida en local: aunque no se documenta un benchmark especifico, el modelo puede integrarse en editores o CLI para autocompletado y explicacion de codigo, con la ventaja de no requerir conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta conversion remite al modelo base para detalles de capacidades y ajustes de generacion recomendados, pero no incluye tablas de MMLU, HumanEval, GSM8K ni comparativas numericas.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 13,6 GB en pesos; en inferencia se necesita ademas overhead de KV cache y activaciones, por lo que se recomienda un minimo de 16-24 GB de memoria unificada en Apple Silicon.
- Hardware objetivo: Apple Silicon (M1/M2/M3/M4 y superiores) con memoria unificada suficiente; la libreria es `mlx` y requiere `mlx-lm >= 0.32.0`.
- GPU NVIDIA: no aplicable a esta ficha concreta, que es una conversion MLX; para CUDA habria que usar el modelo base en otro formato.
- Opciones de despliegue: `mlx-lm` (Python) y Basalt (app macOS y CLI, sin Python). No se documentan vLLM, llama.cpp, Ollama ni TGI para esta conversion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| goodmai/LFM2.5-24B-A2B-MLX-4bit (esta ficha) | ~24B | ~2B | no disponible | LFM Open License v1.0 | MLX safetensors 4-bit |
| LiquidAI/LFM2.5-24B-A2B (base) | ~24B | ~2B | no disponible | LFM Open License v1.0 | safetensors (original) |
| LiquidAI/LFM2.5-24B-A2B-MLX-4bit (upstream MLX) | ~24B | ~2B | no disponible | LFM Open License v1.0 | MLX safetensors 4-bit |

No se dispone en la informacion proporcionada de datos de rendimiento ni de modelos comparables de otros fabricantes con los que contrastar parametros, contexto y benchmarks.

## Limitaciones y advertencias

- La licencia LFM Open License v1.0 esta etiquetada como `other`; es imprescindible revisar los terminos del fichero LICENSE antes de cualquier uso comercial.
- La model card advierte que versiones de `mlx-lm` anteriores a 0.32.0 cargan el modelo pero enrutan los expertos de forma incorrecta; usar una version inferior produce resultados silenciosamente erroneos.
- Al ser una cuantizacion de 4 bits, puede haber perdida de calidad respecto al modelo base en tareas sensibles a precision (matematicas, codigo, razonamiento largo); no se documenta una evaluacion de dicha perdida.
- No se documenta la longitud de contexto soportada, lo que impide planificar cargas con ventanas largas.
- Riesgo de alucinacion inherente a los LLM; el modo de razonamiento con `<think>` no elimina este riesgo y puede aumentar el consumo de tokens.
- Sesgos conocidos: no documentados en la informacion disponible; al ser un modelo multilingue entrenado por Liquid AI, cabe esperar sesgos de los datos de entrenamiento no especificados.
- Cobertura idiomatica: se listan 10 idiomas, pero no se detalla la calidad relativa por idioma; el espanol esta soportado pero sin evaluacion publica en esta ficha.
- Dependencia de hardware Apple Silicon: no es portable a CUDA sin reconvertir el modelo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; es una conversion de terceros, no oficial de Liquid AI, por lo que conviene validar su fidelidad frente al upstream `LiquidAI/LFM2.5-24B-A2B-MLX-4bit`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/goodmai/LFM2.5-24B-A2B-MLX-4bit
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Conversion MLX upstream: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-MLX-4bit
- Repositorio Basalt: https://github.com/goodmai/basalt
- Demo Basalt (chat): https://goodmai-run-with-basalt.hf.space/?model=goodmai%2FLFM2.5-24B-A2B-MLX-4bit&role=chat
- Playground de Liquid AI: https://playground.liquid.ai/
- Documentacion LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Documentacion de Chat Template: https://docs.liquid.ai/lfm/key-concepts/chat-template
- Documentacion de Tool Use: https://docs.liquid.ai/lfm/key-concepts/tool-use
- Discord de Liquid AI: https://discord.com/invite/liquid-ai
- Blog LFM2.5-24B-A2B: https://www.liquid.ai/blog/lfm2-5-24b-a2b
- Informe tecnico LFM2 (arXiv): https://arxiv.org/abs/2511.23404
