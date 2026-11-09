# BRR1154/Qwen2.5-0.5B-PromptBus-v1

## Resumen

Qwen2.5-0.5B-PromptBus-v1 es un ajuste fino del modelo base Qwen/Qwen2.5-0.5B-Instruct, publicado por el autor BRR1154 bajo la organizacion Runtime-Slayers. El modelo se presenta como un enrutador especializado en comunicacion entre agentes (inter-agent prompt bus), con capacidad declarada para gestionar esquemas JSON-RPC, despacho de intenciones y enrutamiento de mensajes sub-simbolicos dentro de un sistema multiagente. Con 494.032.768 parametros reales en safetensors y una ventana de contexto heredada de la familia Qwen2.5, se posiciona como un SLM (small language model) de baja latencia para orquestacion.

El modelo se distribuye bajo licencia Apache 2.0 y formato safetensors, con soporte para transformers y text-generation-inference. La model card menciona una tecnica de edicion de pesos denominada "Gram-Schmidt Subspace Null-Space Model Editing" con la restriccion de cero olvido, aunque no se aportan detalles tecnicos verificables sobre el procedimiento ni sobre el dataset de ajuste.

La relevancia actual del modelo es limitada: cuenta con cero descargas y cero likes en el momento de la ficha, y la model card incluye referencias a modelos frontier que no existen publicamente (Nemotron-3-Ultra 550B, DeepSeek V4.1, GLM-5.3, MiniMax M3.1, Kimi K3.1 Pro), lo que exige cautela sobre las afirmaciones de rendimiento. La ficha se elabora exclusivamente con los datos disponibles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino de Qwen2.5-0.5B-Instruct |
| Parametros totales | 494.032.768 (segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen2.5-0.5B-Instruct; no confirmada en la informacion) |
| Tipos de cuantizacion | no disponible (solo se documenta inferencia en float32) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2, obtenido por ajuste fino del modelo instruct Qwen2.5-0.5B-Instruct. La model card declara un "Weight Surgery Protocol" basado en Gram-Schmidt Subspace Null-Space Model Editing, con la restriccion matematica de cero olvido expresada como delta W multiplicado por V_base igual a cero. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO adicionales sobre el modelo base.

No se documentan innovaciones tecnicas verificables mas alla del ajuste fino y la mencionada edicion de pesos. La especializacion declarada es el enrutamiento de mensajes entre agentes mediante JSON-RPC y el despacho de intenciones, pero no se aportan ejemplos de entrada/salida, esquemas de mensajes ni evaluaciones que respalden esa especializacion. La referencia a coordinacion con modelos frontier y a un framework de optimizacion recursiva (Google Research Harness) no es verificable con la informacion disponible.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen2.5-0.5B-Instruct.
- Enrutamiento declarado de mensajes entre agentes y despacho de intenciones (sin esquemas ni ejemplos documentados).
- Gestion declarada de esquemas JSON-RPC (no se proporcionan ejemplos de payloads validos).
- Soporte de plantilla de chat mediante `apply_chat_template` del tokenizer de Qwen2.5.
- Compatibilidad con text-generation-inference y endpoints compatibles (segun tags).
- No se documenta soporte de tool calling, function calling, vision, audio, thinking mode ni razonamiento multi-paso verificado.
- Capacidad multilingue limitada al ingles declarado.

## Casos de uso

- Enrutamiento de mensajes en sistemas multiagente: el modelo podria emplearse como clasificador de intenciones y despachador de payloads JSON-RPC entre agentes, aprovechando su tamano reducido para baja latencia en bucles de orquestacion.
- Clasificacion de intenciones en pipelines conversacionales: con 494 M de parametros, es viable ejecutarlo en CPU o GPU de gama baja para etiquetar turnos de usuario antes de derivarlos a un modelo mayor.
- Preprocesado de prompts en arquitecturas de cascada: como primer eslabon que normaliza y enruta peticiones hacia modelos frontier, reduciendo coste por token en el orquestador.
- Experimentacion academica sobre edicion de pesos: la tecnica declarada de null-space editing puede servir como caso de estudio reproducible, aunque no se publican los scripts.
- Prototipado de agentes en entornos con recursos limitados: su tamano permite desplegarlo en una sola GPU consumer o incluso en CPU para pruebas de integracion.
- Generacion de respuestas cortas en ingles dentro de flujos automatizados: apropiado para tareas de formato y extraccion simple, no para razonamiento complejo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 2 GB solo para pesos (494 M parametros x 4 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en float16/bfloat16: aproximadamente 1 GB para pesos; no se documentan pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para float32 (GTX 1650, RTX 3050, T4). Cabe holgadamente en RTX 4090, A100 y H100, aunque el modelo no aprovecha su capacidad.
- Cabe en GPU consumer: si, en Practicamente cualquier GPU consumer moderna e incluso en CPU.
- Opciones de despliegue: transformers (documentado), text-generation-inference (segun tags), endpoints compatibles. No se documenta soporte de vLLM, llama.cpp ni Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-0.5B-PromptBus-v1 | 494 M | no disponible | Apache 2.0 | en | Hugging Face, 0 descargas |
| Qwen2.5-0.5B-Instruct (base) | 494 M | 32.768 tokens (segun documentacion publica de Qwen) | Apache 2.0 | multilingue | Hugging Face, ampliamente descargado |
| SmolLM2-360M-Instruct | 360 M | 8.192 tokens (segun documentacion publica) | Apache 2.0 | en | Hugging Face |
| Llama-3.2-1B-Instruct | 1.240 M | 128.000 tokens (segun documentacion publica) | Llama 3.2 Community License | multilingue | Hugging Face |

Nota: los datos de contexto y licencia de los modelos comparables provienen de documentacion publica general y no de la informacion proporcionada en esta busqueda; se incluyen solo como referencia de categoria. El modelo PromptBus no documenta su longitud de contexto efectiva tras el ajuste fino.

## Limitaciones y advertencias

- Cero descargas y cero likes en Hugging Face: no hay evidencia de uso ni validacion por parte de la comunidad.
- La model card referencia modelos frontier inexistentes publicamente (Nemotron-3-Ultra 550B, DeepSeek V4.1, GLM-5.3, MiniMax M3.1, Kimi K3.1 Pro), lo que compromete la credibilidad de las afirmaciones tecnicas.
- No se documentan datasets de entrenamiento, hiperparametros ni evaluaciones que respalden la especializacion en enrutamiento.
- La tecnica de edicion de pesos declarada no se describe con suficiente detalle para reproducirla ni auditarla.
- Riesgo de alucinacion inherente a un modelo de 0.5 B ajustado sobre un instruct general; sin benchmarks no puede acotarse.
- Soporte unicamente en ingles declarado; el rendimiento en castellano no esta documentado.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluaciones hace arriesgado desplegarlo en produccion sin validacion propia.
- No se documenta soporte de cuantizacion (GGUF, AWQ, GPTQ), lo que limita opciones de despliegue eficiente.
- El autor indica ORCID y organizacion, pero no se enlazan repositorios de codigo ni scripts de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BRR1154/Qwen2.5-0.5B-PromptBus-v1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Organizacion del autor: https://github.com/Runtime-Slayers
- ORCID del autor: https://orcid.org/0009-0005-3349-1162
