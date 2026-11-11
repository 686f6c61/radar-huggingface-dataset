# BH-Language-AI/bs-qwen35-4b-agent-nonthink-v04-q8

## Resumen

El modelo `BH-Language-AI/bs-qwen35-4b-agent-nonthink-v04-q8`, publicado por BH-Language-AI, es un ajuste fino del modelo base `alphaedge-ai/Qwen3.5-4B-bos-32768`, orientado a tareas de agente y function calling en bosnio. Se distribuye unicamente en formato GGUF cuantizado a Q8_0, con licencia Apache-2.0, y esta pensado para su despliegue local en Ollama mediante el ejecutable de llama.cpp. El modelo forma parte de la familia AgentMujo, un proyecto centrado en construir un agente Linux conversacional en bosnio.

El entrenamiento combina una fase de SFT (supervised fine-tuning) sobre LoRA joint-01 a joint-06 con un mix de datos v0.31, seguida de una fase de DPO (Direct Preference Optimization) con 140 pares de preferencia y beta 0.1. El resultado es un unico GGUF que soporta dos perfiles mediante la etiqueta `think: true/false`, aunque la variante aqui publicada corresponde al perfil nonthink. El modelo tiene 3.653.938.176 parametros reales (3,65 mil millones), 32 capas, dimension oculta 2560 y un vocabulario de 32.768 tokens.

La relevancia de este modelo es acotada: se trata de un ajuste de nicho para un idioma minoritario (bosnio) y un caso de uso muy especifico (automatizacion de tareas de sistema en Linux mediante llamadas a herramientas). No obstante, resulta interesante como ejemplo de pipeline completo de SFT + DPO sobre una base de 4B con cuantizacion Q8 y evaluacion propia (AgentMujo-Bench).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-4B) |
| Parametros totales | 3.653.938.176 (~3,65B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el base se denomina "32768", pero no se confirma en la ficha) |
| Tipos de cuantizacion | Q8_0 (GGUF) |
| Idiomas soportados | bosnio (bs) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (un unico fichero `model-q8-4b-dpo01.gguf`) |

## Arquitectura y entrenamiento

El modelo se construye sobre `alphaedge-ai/Qwen3.5-4B-bos-32768` (commit `34a62191`), un transformer decoder-only con 32 capas, dimension oculta 2560 y vocabulario de 32.768 tokens. Sobre esta base se aplica un ajuste por LoRA en seis iteraciones (joint-01 a joint-06) con un mix de datos v0.31, alcanzando un eval de 0,7614. Posteriormente se aplica una fase de DPO con 140 pares de preferencia, beta 0.1, entrenada en 9 pasos con loss de entrenamiento 0,67 sobre una GPU T4 sin OOM. El merge es en dos etapas.

La cuantizacion se realiza con `convert_hf_to_gguf.py --no-mtp` de llama.cpp y posteriormente Q8_0, generando un fichero de aproximadamente 3,9 GB con 426 tensores y `qwen35.block_count=32`. El repositorio incluye tambien versiones anteriores (`model-q8-v0.3.gguf`, `model-q8-v0.2.gguf`, `model-q8.gguf`) que corresponden a iteraciones previas del pipeline. No se documenta el numero total de tokens de entrenamiento ni la composicion detallada del dataset mas alla del mix v0.31.

## Capacidades

- Generacion de texto conversacional en bosnio.
- Function calling / tool calling, con seleccion de herramienta y generacion de argumentos.
- Comportamiento de agente multi-paso (multi-step reasoning) orientado a tareas de administracion de sistema Linux.
- Perfil nonthink (sin modo de razonamiento explicito); la variante think se distribuye por separado (v0.4-think).
- Comportamiento de confirmacion antes de ejecutar acciones (confirmation behavior).
- Capacidades de seguridad y rechazo (safety / refusal) evaluadas en el benchmark propio.
- Generacion de JSON estructurado para invocacion de herramientas.

## Casos de uso

- Automatizacion de tareas de administracion Linux: el modelo puede recibir una peticion en bosnio ("Radi li nginx servis?") y emitir una llamada a herramienta para consultar el estado del servicio, integrandose en un agente local via Ollama.
- Asistente de terminal conversacional: con el perfil nonthink y baja latencia, puede gestionar interacciones de una sola vuelta orientadas a ejecutar comandos concretos, con confirmacion previa al usuario.
- Pipeline de function calling en produccion: al obtener 1.0 en `tool_selection`, `multi_step` y `confirmation_behavior` en AgentMujo-Bench v0.5, es adecuado para orquestar llamadas a APIs o scripts de sistema con esquemas JSON estrictos.
- Soporte a usuarios bosnios en herramientas internas: al estar entrenado especificamente en bosnio, cubre un nicho que los modelos multilingues genericos suelen resolver con menor precision en terminologia tecnica local.
- Prototipado de agentes con Policy Engine: el autor indica que el terminal es un fallback y que se requiere un motor de politicas obligatorio, por lo que encaja en arquitecturas donde el modelo propone acciones y una capa externa las valida.
- Evaluacion comparativa de tecnicas SFT + DPO en modelos pequenos: el repositorio y el framework de entrenamiento publico permiten reproducir el pipeline en un modelo de 4B con una sola T4.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre AgentMujo-Bench v0.5 (48 casos, Q8, temperatura 0, perfil nonthink), con el conjunto "limpio" tras eliminar los casos contaminados 010/035:

| Metrica | 2B v0.5 | 4B v0.3 | 4B v0.4-DPO |
|---|---|---|---|
| tool_selection | 0.800 | 0.967 | 1.0 |
| argument_accuracy | 0.808 | 0.962 | 0.962 |
| confirmation_behavior | 0.8 | 1.0 | 1.0 |
| high_level_preference | 1.0 | 1.0 | 1.0 |
| multi_step | 0.833 | 0.857 | 1.0 |
| safety / refusal / json / notool | no disponible | 1.0 | 1.0 |

El recuento global reportado es 13W-25T-0L frente al modelo 2B v0.5 y 0W-45T-0L frente al 4B v0.3. El unico fallo restante es el caso bench-045 (file_read con `lines` legal segun esquema), atribuido a un artefacto del scorer por igualdad estricta. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4-5 GB en Q8_0 (fichero de ~3,9 GB mas overhead de contexto).
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070, RTX 4090); tambien cabe en T4 (16 GB), A100 y H100 sin problema.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna con 8 GB o mas.
- Opciones de despliegue: Ollama (documentado por el autor con `ollama create` y `ollama run`), llama.cpp (formato GGUF nativo), y servidores compatibles con la API de endpoints indicada en los tags.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| bs-qwen35-4b-agent-nonthink-v04-q8 | 3,65B | no disponible | Apache-2.0 | GGUF Q8_0 | Especializado en bosnio y agentes Linux |
| alphaedge-ai/Qwen3.5-4B-bos-32768 (base) | ~4B | 32768 (segun nombre) | Apache-2.0 | safetensors | Modelo base sin ajuste de agente |
| AgentMujo 2B v0.5 | ~2B | no disponible | no disponible | GGUF | Version anterior, menor rendimiento en tool_selection (0.800) y multi_step (0.833) |
| AgentMujo 4B v0.3 | ~4B | no disponible | no disponible | GGUF | Version SFT sin DPO, 0.967 en tool_selection y 0.857 en multi_step |

No se dispone de comparaciones con modelos genericos de proposito general de tamano similar (por ejemplo, Qwen2.5-3B o Llama-3.2-3B) en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente en bosnio; su rendimiento en castellano, ingles u otros idiomas no esta documentado y previsiblemente sera deficiente.
- Riesgo de alucinacion en la generacion de comandos o argumentos de herramientas: el autor exige un Policy Engine obligatorio y trata la terminal como fallback, lo que indica que las acciones del modelo no deben ejecutarse sin validacion externa.
- La model card reconoce explicitamente que los casos 010/035/048 estuvieron contaminados en el conjunto de entrenamiento y que los supuestos beneficios del DPO sobre ellos eran memorizacion, no generalizacion. Los resultados deben interpretarse con cautela.
- El benchmark propio (AgentMujo-Bench v0.5) tiene solo 48 casos y no es comparable con benchmarks academicos estandar.
- El repositorio tiene 23,3 GB, lo que incluye multiples versiones GGUF; conviene descargar solo el fichero `model-q8-4b-dpo01.gguf`.
- Sin datos de contexto maximo verificados en la ficha; el sufijo "32768" del modelo base sugiere esa ventana, pero no se confirma en la documentacion del ajuste.
- Uso comercial permitido por Apache-2.0, pero el autor no ofrece garantias sobre el comportamiento del agente en entornos de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BH-Language-AI/bs-qwen35-4b-agent-nonthink-v04-q8
- Modelo base: https://huggingface.co/alphaedge-ai/Qwen3.5-4B-bos-32768
- Repositorio del framework de entrenamiento: https://github.com/xnet-ba/agentmujo-training
