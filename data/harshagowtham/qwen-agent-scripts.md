# harshagowtham/qwen-agent-scripts

## Resumen

`harshagowtham/qwen-agent-scripts` no es un modelo de pesos en sentido estricto, sino un repositorio que contiene un motor de inferencia de un solo archivo (`llm_engine.py`) disenado para envolver al modelo `harshagowtham/qwen3-14b-code-agent`, un fine-tune de Qwen3-14B orientado a tareas de agente de codigo. El repositorio proporciona una API compatible con OpenAI tanto en proceso (`llm.chat.completions.create(...)`) como via servidor HTTP (`/v1/chat/completions`, `/v1/models`), soporte de streaming, tool calling nativo de Qwen3 y modo "thinking" con exposicion del campo `reasoning_content`.

El motor esta pensado para entornos con recursos limitados, en particular notebooks de Kaggle con GPU T4 o P100, e incorpora cuantizacion automatica a 4-bit NF4 cuando la VRAM disponible es inferior a 24 GB. Ademas, integra soporte para un repositorio de parche de "weight surgery" (`harshagowtham/qwen3-14b-code-agent-wsurgery`) que aplica un injerto de tensores sobre los shards safetensors del modelo base antes de la carga, y permite cargar adaptadores LoRA via PEFT, como el adaptador de tool calling MCP `harshagowtham/qwen3-14b-code-agent-mcp-lora`.

La relevancia del repositorio radica en que empaqueta en una unica pieza un stack de inferencia completo (cuantizacion, parcheo de pesos, LoRA, servidor compatible con OpenAI) sin depender de frameworks pesados como vLLM o TGI, lo que facilita prototipado rapido de agentes de codigo en hardware modesto. No obstante, la informacion disponible sobre el modelo subyacente (parametros exactos, contexto, licencia, benchmarks) es muy limitada y en varios casos inexistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-14B, fine-tune); el motor es un wrapper de inferencia |
| Parametros totales | 14B (segun denominacion del modelo base `qwen3-14b-code-agent`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ~31k tokens (segun el clamping automatico descrito: `50000` se recorta a ~31k en Qwen3-14B) |
| Tipos de cuantizacion | 4-bit NF4 automatica si VRAM < 24 GB; precision completa si hay VRAM suficiente |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (shards); soporte de adaptadores LoRA via PEFT |

## Arquitectura y entrenamiento

El modelo subyacente es un fine-tune de Qwen3-14B, un transformer decoder-only. La model card del repositorio no documenta el proceso de entrenamiento del fine-tune (numero de tokens, composicion del dataset, uso de RLHF/DPO o SFT). Lo que si se describe es el parche de "weight surgery": el fine-tune movio 280 tensores de proyeccion de forma uniforme (energia relativa del orden de 0,3-0,7 %), sin una direccion dominante, lo que sugiere una fusion de tipo LoRA ligera. El parche quirurgico preserva ese delta aprendido donde resulta util (capas profundas) mediante splicing byte-exacto de tensores en los shards safetensors, verificado con sha256 y reanudable.

El motor de inferencia en si no entrena nada: carga el modelo base, aplica opcionalmente el parche de pesos y/o un adaptador LoRA, y expone una interfaz compatible con OpenAI. Incluye clamping automatico de `max_tokens` al contexto del modelo para evitar fallos en generaciones largas, y soporta el modo thinking de Qwen3 con separacion entre `reasoning_content` y `content`.

## Capacidades

- Generacion de texto y razonamiento con modo thinking de Qwen3 (activado por defecto, desactivable con `enable_thinking=False`).
- Generacion de codigo, incluyendo aplicaciones completas de una sola pagina (HTML/CSS/JS) segun el ejemplo "Linux Mastery website".
- Tool calling / function calling nativo de Qwen3, con soporte de esquemas JSON y devolucion de `tool_calls`.
- Soporte de agentes multi-paso y adaptador LoRA especifico para tool calling MCP.
- Streaming de tokens con `include_usage` para contabilidad de tokens.
- Servidor HTTP compatible con OpenAI (`/v1/chat/completions`, `/v1/models`), usable con el cliente `openai` o `curl`.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision y audio: no disponibles.

## Casos de uso

- Prototipado de agentes de codigo en Kaggle: el motor permite cargar el modelo y el adaptador MCP en un notebook T4/P100 con cuantizacion 4-bit automatica, sin configurar vLLM ni TGI.
- Generacion de sitios web completos: el ejemplo `02_linux_mastery_site.py` solicita una web multipagina con `max_tokens=50000` (recortado automaticamente al contexto), adecuado para generar HTML/CSS/JS extenso en una sola pasada.
- Servidor local compatible con OpenAI: `serve(llm, port=8000)` permite apuntar cualquier SDK de OpenAI al endpoint local, util para integrar el modelo en herramientas existentes sin cambios de codigo.
- Automatizacion con tool calling: el modelo puede emitir llamadas a funciones como `run_command` para ejecutar comandos en un sandbox, integrándose en pipelines de agentes que necesitan interactuar con el sistema.
- Evaluacion de fine-tunes con parche de pesos: el soporte de `patch="auto"` facilita probar variantes quirurgicas del modelo sin reescribir el pipeline de carga.
- Despliegue en hardware de consumo: con cuantizacion NF4, el modelo de 14B puede ejecutarse en GPUs con menos de 24 GB de VRAM, lo que habilita entornos de desarrollo locales.
- Investigacion sobre razonamiento: el acceso a `reasoning_content` permite analizar las cadenas de pensamiento del modelo en tareas de codigo y matematicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con cuantizacion 4-bit NF4, un modelo de 14B requiere aproximadamente 8-10 GB de VRAM para pesos; con precision completa (fp16), en torno a 28 GB.
- GPU recomendadas: T4 o P100 (16 GB) con cuantizacion 4-bit segun la model card; A100/H100 para precision completa.
- Cabe en GPU de consumo: previsiblemente en RTX 3090/4090 (24 GB) con cuantizacion 4-bit o fp16 ajustado; en GPUs de 16 GB solo con 4-bit.
- Opciones de despliegue: motor propio `llm_engine.py` (basado en transformers, accelerate, peft, bitsandbytes, sentencepiece); servidor HTTP integrado con FastAPI/uvicorn. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| qwen3-14b-code-agent (este) | 14B | ~31k | no disponible | HuggingFace (repo del autor) |
| Qwen3-14B base | 14B | no disponible en esta ficha | no disponible | HuggingFace (Qwen) |
| Alternativas de codigo de ~14B | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- La model card no documenta licencia, idiomas ni regimen de uso comercial; verificar antes de cualquier despliegue en produccion.
- El modelo es un fine-tune no auditado publicamente; riesgo de alucinacion y de sesgos no caracterizados.
- El contexto se recorta automaticamente a ~31k tokens, lo que puede truncar peticiones que esperen ventanas mayores.
- El adaptador MCP LoRA se describe como privado (`private -> token`), lo que puede impedir su uso sin credenciales del autor.
- El parche de pesos modifica los safetensors del modelo base; aunque se verifica con sha256, introduce un paso adicional de manipulacion de pesos que debe validarse en cada actualizacion.
- Dependencia de versiones concretas de transformers, accelerate, peft, bitsandbytes y sentencepiece; posibles incompatibilidades en entornos no controlados.
- No hay benchmarks publicados que respalden las afirmaciones de calidad del fine-tune.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/harshagowtham/qwen-agent-scripts
- Modelo base referenciado: `harshagowtham/qwen3-14b-code-agent` (no se proporciona URL directa en la informacion disponible)
- Repositorio de parche: `harshagowtham/qwen3-14b-code-agent-wsurgery` (no se proporciona URL directa)
- Adaptador LoRA MCP: `harshagowtham/qwen3-14b-code-agent-mcp-lora` (no se proporciona URL directa)
