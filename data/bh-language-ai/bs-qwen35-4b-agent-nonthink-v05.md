# BH-Language-AI/bs-qwen35-4b-agent-nonthink-v05

## Resumen

bs-qwen35-4b-agent-nonthink-v05 es un modelo de lenguaje de 3.653.938.176 parametros (aproximadamente 3,65 mil millones) especializado en bosnio y orientado a function calling y agentes conversacionales. Lo desarrolla BH-Language-AI y se construye sobre el modelo base alphaedge-ai/Qwen3.5-4B-bos-32768, un Qwen 3.5 de 4B adaptado al bosnio con una ventana de contexto de 32.768 tokens. El modelo se distribuye en precision completa bf16 (7,3 GB) bajo licencia Apache-2.0.

La relevancia de este modelo radica en su enfoque: en lugar de ser un modelo generalista, se ha afinado especificamente para tareas de agente (tool calling, razonamiento multi-paso) en un idioma de bajos recursos como el bosnio. Combina un ajuste supervisado (LoRA SFT) con un posterior ajuste por preferencias (DPO) sobre el mismo base, siguiendo el orden correcto SFT→DPO, y fusiona ambos adaptadores en dos pasos.

El modelo se presenta como "non-think", es decir, sin modo de razonamiento extendido (thinking mode), priorizando respuestas directas y llamadas a herramientas. Es un modelo reciente (noviembre de 2026) con cero descargas en el momento de la consulta y cuya evaluacion generativa completa aun no se ha publicado, por lo que debe considerarse un artefacto en fase temprana de validacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen 3.5, tipo qwen3_5_text) |
| Parametros totales | 3.653.938.176 (aproximadamente 3,65B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible en el repo (pesos publicados en bf16; el modelo base y el ecosistema Qwen permiten cuantizacion GGUF/AWQ, pero no se documenta en esta ficha) |
| Idiomas soportados | bs (bosnio) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only derivado de Qwen 3.5, con la etiqueta de pipeline qwen3_5_text en Hugging Face. El modelo parte del checkpoint alphaedge-ai/Qwen3.5-4B-bos-32768 (revision 34a621915a6214ab9d28f74142840d8cd5bc0acb), que aporta el conocimiento del bosnio y una ventana de contexto de 32.768 tokens. Sobre esa base se aplica un ajuste supervisado con LoRA (adaptador `4b-jt31-thunder`, entrenado en hardware Thunder/A100, con eval 0.84) y posteriormente un ajuste por preferencias con DPO (adaptador `4b-dpo03-thunder`, dataset balanceado v0.4 con 160 pares). Los dos adaptadores se fusionan en dos pasos sobre el base para producir el checkpoint final en bf16.

El entrenamiento se realizo con el framework agentmujo-training (repositorio github.com/xnet-ba/agentmujo-training) y los adaptadores se publican por separado en shaban2024/agentmujo-adapters. La innovacion principal no es arquitectonica sino de procedimiento: la secuencia SFT→DPO sobre un base ya adaptado al bosnio, orientada a comportamiento de agente (function calling) y con un modo "non-think" que evita cadenas de razonamiento largas. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni detalles de RLHF mas alla del DPO mencionado.

## Capacidades

- Generacion de texto conversacional en bosnio, con soporte multi-turno gracias a los 32.768 tokens de contexto.
- Function calling / tool calling: el modelo esta afinado especificamente para emitir llamadas a herramientas, segun los tags `function-calling` y `ai-agents`.
- Comportamiento de agente y razonamiento multi-paso (tag `ai-agents`, framework AgentMujo).
- Modo "non-think": respuestas directas sin cadenas de razonamiento extendido, adecuado para pipelines de agente con baja latencia.
- Capacidades multilingues limitadas al bosnio segun la model card (idioma declarado: `bs`); no se documenta soporte fiable de otros idiomas.
- No se documentan capacidades de vision, audio ni matemáticas avanzadas en la informacion disponible.

## Casos de uso

- Agentes de atencion al cliente en bosnio: el modelo puede gestionar conversaciones multi-turno y emitir llamadas a herramientas (consultar pedidos, abrir incidencias) gracias a su ventana de 32.768 tokens y a su ajuste especifico en function calling.
- Orquestacion de herramientas en asistentes internos: integrado en un bucle de agente, el modelo decide que funcion invocar y con que argumentos, lo que encaja con su entrenamiento AgentMujo y su modo non-think de baja latencia.
- Automatizacion de tareas administrativas en bosnio: extraccion de datos estructurados y generacion de respuestas a partir de documentos largos que caben en el contexto de 32K.
- Chatbots de dominio publico para Bosnia y Herzegovina: al estar entrenado especificamente en bosnio, ofrece mejor cobertura linguistica que modelos genericos multilingues para este idioma de bajos recursos.
- Prototipado de pipelines de agente en investigacion: al publicarse en bf16 con adaptadores separados, permite estudiar el efecto del SFT y del DPO de forma aislada sobre el mismo base.
- Despliegue en entornos con recursos moderados: con 3,65B parametros, es viable en una unica GPU consumer tras cuantizacion, lo que facilita pruebas locales de flujos de tool calling.
- Evaluacion comparativa de modelos para lenguas eslavas del sur: sirve como referencia para medir el rendimiento de agentes en bosnio frente a modelos mas grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el merge esta verificado (pesos cargados, tokenizer funcional, numero de parametros confirmado) pero que el smoke test generativo en CPU no se completo por lentitud y queda pendiente de GPU; los scores de la version v0.5 se publicaran tras ejecutar AgentMujo-Bench en GPU. El unico dato numerico reportado es un eval de 0.84 para el adaptador SFT `4b-jt31-thunder`, sin especificar la metrica ni el conjunto de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 7,3 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 10-12 GB de VRAM para contexto moderado.
- VRAM estimada tras cuantizacion (referencia orientativa, no documentada en la ficha): alrededor de 2-4 GB en cuantizaciones de 4-8 bits, dependiendo del formato.
- GPU recomendadas: A100 (usada en el entrenamiento), H100 o L40S para produccion; RTX 4090 y RTX 3090 para inferencia en bf16 con contexto amplio.
- Cabe en GPU consumer: si, en tarjetas con 12 GB o mas en bf16 (RTX 3060 12GB, RTX 4070 Ti, RTX 4090) y en tarjetas de 8 GB tras cuantizacion.
- Opciones de despliegue: transformers (metodo documentado en la model card, con `trust_remote_code=True`); vLLM, TGI, llama.cpp y Ollama son compatibles a nivel de ecosistema Qwen, aunque no se documentan en la ficha.
- Latencia y throughput: no disponibles; la model card senala que el smoke test en CPU fue demasiado lento para completarse, sin cifras de GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| bs-qwen35-4b-agent-nonthink-v05 | 3,65B | 32.768 | bs | Apache-2.0 | Afinado para agentes y function calling en bosnio; sin benchmarks publicados |
| alphaedge-ai/Qwen3.5-4B-bos-32768 | aproximadamente 4B | 32.768 | bs | no disponible en la informacion | Modelo base del anterior; sin ajuste de agente |
| Qwen 3.5 4B (original) | aproximadamente 4B | no disponible en la informacion | multilingue | no disponible en la informacion | Base generica sin especializacion en bosnio ni en agentes |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo en fase temprana: cero descargas y cero likes en el momento de la consulta, y evaluacion generativa completa pendiente; no debe considerarse validado para produccion sin pruebas propias.
- La model card advierte que en la version predecesora (v0.4 Q8) el terminal era un fallback y que el Policy Engine era obligatorio; se recomienda mantener esa capa de control en despliegues de agente.
- Riesgo de alucinacion inherente a un modelo de 3,65B; no se documentan mitigaciones especificas.
- Soporte linguistico limitado al bosnio; el uso en otros idiomas no esta garantizado.
- Ventana de contexto de 32.768 tokens heredada del base; no se documenta si el ajuste preserva el rendimiento en contextos muy largos.
- Licencia Apache-2.0 permisiva para uso comercial, pero conviene verificar las condiciones del modelo base y de los adaptadores, ya que la ficha indica Apache-2.0 para base y adaptadores sin mas detalle.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- El modo non-think puede reducir la calidad en tareas que requieren razonamiento complejo; no se ofrecen variantes con thinking mode en este checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BH-Language-AI/bs-qwen35-4b-agent-nonthink-v05
- Modelo base: https://huggingface.co/alphaedge-ai/Qwen3.5-4B-bos-32768
- Adaptadores: https://huggingface.co/shaban2024/agentmujo-adapters
- Framework de entrenamiento: https://github.com/xnet-ba/agentmujo-training
