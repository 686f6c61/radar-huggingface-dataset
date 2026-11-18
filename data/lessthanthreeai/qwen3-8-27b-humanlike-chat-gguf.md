# LessThanThreeAI/Qwen3.8-27B-Humanlike-Chat-GGUF

## Resumen

Qwen3.8-27B-Humanlike-Chat 2.0 es un ajuste fino (finetune) del modelo abliterado `huihui-ai/Huihui-Qwen3.8-27B-abliterated`, distribuido en formato GGUF por el usuario LessThanThreeAI. Su objetivo es que un modelo de 27B conversacional "texte como una persona" sin necesidad de system prompt: respuestas cortas, registro coloquial y coherencia de personaje en conversaciones multi-turno, manteniendo a la vez capacidades funcionales como generacion de codigo, llamadas a herramientas y matematicas. El modelo base es a su vez una version abliterated (sin rechazos) de Qwen3.8-27B, no la release oficial de Qwen.

El modelo resuelve un problema concreto: los modelos instructivos oficiales tienden a abrir con formulas como "How can I help you today?" y responder con parrafos largos, lo que rompe la ilusion en roleplay, chat de personajes y aplicaciones de mensajeria. Segun la model card, un juez ciego identifico las respuestas de 2.0 como humanas el 23,5% de las veces, frente al 15,1% del Qwen3.8-27B oficial y el 0,3% del base abliterated. Ademas, mejora en seguimiento de instrucciones (IFBench 43,7 frente a 37,3) y en disciplina de tool calling (When2Call 58 frente a 48; BFCL irrelevance 78 frente a 60), manteniendo GSM8K en 89,1.

El repositorio es exclusivamente GGUF (con un mmproj BF16 para vision) y esta pensado para llama.cpp, con soporte declarado de API compatible con OpenAI. El peso total del repo es de 970,5 GB, lo que refleja la multiplicidad de cuantizaciones publicadas. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.8-27B; detalles de atencion no disponibles) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens en el ejemplo de lanzamiento de llama.cpp (`--ctx-size 32768`); maximo nativo no disponible |
| Tipos de cuantizacion | Multiples GGUF publicados; confirmado IQ4_XS (15,10 GB). Resto de variantes no disponible |
| Idiomas soportados | Ingles y ruso (segun metadatos de la model card); cobertura real no verificada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) + mmproj BF16 para vision; no se publican safetensors en este repo |
| Vision | Si, mediante `mmproj/mmproj-BF16.gguf` |
| Tool calling | Si, requiere `--jinja` para usar la plantilla de chat propia |
| Metodo de ajuste | Destilacion on-policy (segun tags de la model card) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3.8-27B abliterado, un transformer decoder-only denso de ~26,9B parametros. La model card no detalla numero de capas, dimensiones ocultas, mecanismo de atencion ni si incorpora atencion lineal o hibrida; esos datos no estan disponibles en la informacion proporcionada. El modelo conserva la torre de vision del base, ya que se publica un proyector multimodal `mmproj-BF16.gguf` que permite enviar imagenes en el mismo chat.

El entrenamiento se describe como destilacion on-policy (tag `on-policy-distillation`), es decir, generacion de trayectorias por parte del propio modelo y correccion o filtrado de esas trayectorias para el ajuste, en lugar de un SFT clasico sobre datos estaticos. No se especifican volumen de tokens, composicion del dataset, ni si hubo RLHF o DPO. Tampoco se documenta el proceso de abliteration aplicado en el modelo base. La model card menciona explicitamente que el modelo no necesita system prompt y que vuelve al registro coloquial despues de tareas formales, lo que sugiere un entrenamiento orientado a mantener un estilo por defecto persistente.

## Capacidades

- Generacion de texto conversacional con registro coloquial por defecto, sin system prompt.
- Coherencia de personaje en conversaciones largas (roleplay, character cards, escenarios multi-turno).
- Escritura creativa y redaccion formal bajo peticion (correos, explicaciones), retornando despues al estilo conversacional.
- Tool calling y function calling, incluyendo peticion de argumentos faltantes antes de ejecutar la llamada.
- Abstenerse de llamar herramientas cuando ninguna encaja (disciplina de irrelevancia).
- Razonamiento matematico basico-intermedio (GSM8K 89,1).
- Seguimiento de instrucciones verificables (IFBench, IFEval).
- Capacidades de vision mediante el proyector mmproj (entrada de imagenes en el mismo chat).
- Multilingue limitado a ingles y ruso segun metadatos.
- Modo sin censura heredado del base abliterated.
- Integracion con clientes tipo SillyTavern (tag explicito).

## Casos de uso

- Roleplay y chat de personajes: el modelo mantiene registro y coherencia de personaje durante decenas de turnos sin system prompt, lo que reduce la friccion de configuracion en SillyTavern y frontends similares. Es su caso de uso principal segun la model card.
- Atencion al cliente con tono humano: para productos donde un tono excesivamente corporativo penaliza, el modelo responde de forma breve y natural, y puede cambiar a registro formal cuando se le pide redactar una comunicacion oficial.
- Asistentes personales con herramientas: con `--jinja` y la plantilla propia, el modelo ejecuta function calling y, segun los datos de BFCL, pide el dato que falta (por ejemplo, la hora) en lugar de inventarlo, lo que reduce llamadas erroneas en produccion.
- Agentes multi-paso con API compatible con OpenAI: el servidor llama.cpp expone `/v1`, de modo que se puede integrar en pipelines existentes que ya consumen la API de OpenAI sin reescribir el cliente.
- Generacion de codigo y scripting: aunque no es su foco, conserva las capacidades del base para tareas de programacion dentro de un flujo conversacional, util en asistentes de desarrollo embebidos.
- Procesamiento de documentos con imagenes: el mmproj permite enviar capturas, diagramas o fotos en el mismo hilo de chat, util para soporte tecnico visual o extraccion de informacion de imagenes.
- Despliegue local en estaciones de trabajo: con IQ4_XS en 15,10 GB cabe en GPUs de 24 GB, lo que habilita prototipos y demos on-premise sin infraestructura cloud.

## Benchmarks y rendimiento

Resultados publicados en la model card, comparando 2.0 con su base abliterated (`huihui-ai/Huihui-Qwen3.8-27B-abliterated`), con thinking desactivado:

| Benchmark | 2.0 | Base abliterated |
|---|---|---|
| IFBench | 43,7 | 37,3 |
| When2Call | 58 | 48 |
| BFCL irrelevance | 78 | 60 |
| BFCL live irrelevance | no disponible (graficado, sin cifra) | no disponible |
| BFCL simple | 98 | 98 (empate) |
| IFEval | no disponible (empate declarado) | no disponible |
| GSM8K | 89,1 | 89,1 (empate) |
| ishuman v2 (juez ciego) | 23,5% | 0,3% (6,8% con prompt "text like a human") |

Referencia adicional: el Qwen3.8-27B oficial obtuvo 15,1% en ishuman v2. No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM para IQ4_XS: 15,10 GB de pesos; con contexto de 32.768 tokens y cache KV hay que prever margen adicional, por lo que 24 GB es el objetivo realista.
- Cabe en GPU de consumo de 24 GB (RTX 3090, RTX 4090) con la cuantizacion IQ4_XS.
- Para cuantizaciones mayores (Q5, Q6, Q8) o contexto mas largo se recomienda A100 40/80 GB o H100.
- Despliegue principal: llama.cpp (`llama-server`) con `--jinja`, `--ctx-size 32768`, `--n-gpu-layers 99`.
- La model card menciona una seccion de vLLM/SGLang con safetensors, pero este repositorio solo contiene GGUF; los pesos safetensors no estan disponibles aqui.
- Vision: requiere cargar ademas `mmproj/mmproj-BF16.gguf` mediante `--mmproj` o `--mmproj-url`.
- Parametros de muestreo recomendados por el autor: `--temp 1.0 --top-p 0.95 --top-k 20`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Humanlike-Chat 2.0 | ~26,9B | 32.768 (ejemplo) | Apache 2.0 | GGUF + mmproj | Finetune conversacional, tool calling, vision |
| Huihui-Qwen3.8-27B-abliterated (base) | ~26,9B | no disponible | Apache 2.0 | safetensors/GGUF (segun repo original) | Sin censura, sin ajuste conversacional; 0,3% en ishuman v2 |
| Qwen3.8-27B oficial | ~27B | no disponible | no disponible | no disponible | Referencia instructiva; 15,1% en ishuman v2, respuestas mas largas y formales |

No se dispone de datos suficientes para comparar con otras familias de 27B en benchmarks estandar (MMLU, HumanEval), por lo que la comparativa se limita a las variantes del mismo linaje reportadas por el autor.

## Limitaciones y advertencias

- El modelo base es una version abliterated: se han eliminado los mecanismos de rechazo, por lo que puede generar contenido que los modelos alineados rechazarian. Requiere moderacion externa en produccion.
- Riesgo de alucinacion inherente a un modelo de ~27B; los benchmarks reportados no incluyen evaluaciones de factualidad.
- Los benchmarks de la model card son autoinformados por el autor y comparan solo contra su propio base, no contra modelos de referencia externos.
- El estilo coloquial por defecto puede ser inadecuado para dominios regulados (legal, sanitario, financiero) sin instrucciones explicitas.
- Cobertura idiomatica declarada limitada a ingles y ruso; el rendimiento en castellano no esta documentado ni evaluado.
- El contexto de 32.768 tokens es el usado en el ejemplo de lanzamiento, no necesariamente el maximo nativo; no se documenta la ventana real.
- La licencia Apache 2.0 se declara sobre el finetune, pero las obligaciones derivadas del modelo base y de los datos de destilacion no se detallan en la informacion disponible.
- El repositorio ocupa 970,5 GB por la acumulacion de cuantizaciones; conviene descargar solo el archivo necesario.
- No se publican safetensors en este repositorio, lo que impide usarlo directamente con vLLM o TGI sin conversion.
- La fecha de creacion del repositorio (2026-08-26) y la nomenclatura "Qwen3.8" no se corresponden con releases publicas conocidas de Qwen; conviene verificar el linaje antes de un despliegue critico.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LessThanThreeAI/Qwen3.8-27B-Humanlike-Chat-GGUF
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Proyector de vision (BF16): https://huggingface.co/LessThanThreeAI/Qwen3.8-27B-Humanlike-Chat-GGUF/resolve/main/mmproj/mmproj-BF16.gguf
- Discord del autor: https://discord.gg/jWbqEqsgAf
- Contacto del autor (Discord): https://discord.com/users/320486798859960322
