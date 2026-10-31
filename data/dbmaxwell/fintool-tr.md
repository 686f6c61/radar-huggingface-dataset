# Dbmaxwell/Fintool-TR

## Resumen

Fintool-TR es un modelo de lenguaje ajustado (fine-tuned) para finanzas y tool calling en turco, desarrollado por el usuario Dbmaxwell y publicado en HuggingFace. Se basa en `unsloth/Qwen3-4B-Instruct-2507`, un modelo instructo de la familia Qwen3 de 4 mil millones de parametros, y se ha entrenado con el dataset `Dbmaxwell/FintoolDataset-tr`, un conjunto de datos propio con 1.389 ejemplos de entrenamiento centrados en consultas financieras y seleccion de herramientas.

El problema que resuelve es doble: por un lado, la falta de modelos pequenos con buen rendimiento en dominio financiero turco; por otro, la generacion fiable de llamadas a herramientas (tool calls) con esquemas estructurados, algo critico para construir asistentes que consulten datos de mercado en tiempo real en lugar de depender del conocimiento interno del modelo. De hecho, la model card advierte explicitamente que precios, tipos de cambio o datos macroeconomicos no deben tomarse del conocimiento del modelo, sino obtenerse mediante herramientas externas.

Es relevante porque demuestra que un fine-tuning con un dataset relativamente pequeno sobre un modelo base de 4B puede mejorar sustancialmente las metricas de decision MCP, seleccion de herramientas y calculo financiero, manteniendo una licencia Apache-2.0 que permite uso comercial. El checkpoint es completo en BF16 (no un adaptador LoRA), con pesos en safetensors de unos 8,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer decoder) |
| Parametros totales | 4.022.468.096 (~4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (limite de config); 8.192 tokens en entrenamiento |
| Tipos de cuantizacion | BF16 (checkpoint nativo); no disponible informacion sobre cuantizaciones publicadas |
| Idiomas soportados | Turco (especializado); hereda capacidades multilingues de Qwen3 (no documentadas en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (2 shards, ~8,04 GB, con `model.safetensors.index.json`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder de la familia Qwen3 con 36 capas, tamaño oculto de 2.560, tamaño intermedio de 9.728, 32 cabezas de atencion y 8 cabezas KV (agrupacion KV tipo GQA), y un vocabulario de 151.936 tokens. No es una arquitectura MoE ni hibrida; es un modelo denso estandar.

El entrenamiento partio de `unsloth/Qwen3-4B-Instruct-2507` y se realizo sobre el dataset `Dbmaxwell/FintoolDataset-tr`, dividido en 1.389 ejemplos de entrenamiento, 160 de validacion y 185 de test. Se entrenaron 3 epocas, obteniendo un train loss de 0,4496 y un validation loss de 0,4043. El stack de entrenamiento fue Unsloth con Transformers 4.57.6 y TRL 0.22.2, sobre una GPU A100 de 80 GB. El resultado es un checkpoint completo en BF16, no un adaptador LoRA. La model card no detalla el uso de tecnicas de alineacion como RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en turco, con foco en el dominio financiero.
- Tool calling: genera llamadas estructuradas en formato `<tool_call>` con nombre de funcion y argumentos JSON compatibles con el formato de Qwen3 y la API de `apply_chat_template` con `tools`.
- Decision de uso de herramientas (decision MCP): el modelo evalua cuando invocar una herramienta frente a responder con conocimiento interno.
- Respeto de esquemas de herramientas: genera argumentos conformes al esquema JSON declarado (tipos, campos obligatorios, enumeraciones).
- Calculos financieros: resuelve operaciones aritmeticas y de calculo financiero, con salida en un formato obligatorio `SONUC:` (resultado) verificado en evaluacion.
- Conocimiento financiero general en turco (conceptos, terminologia del sector).
- Seguridad en el uso de herramientas: entrenado con casos MCP/seguridad (36 de los 78 casos de evaluacion), lo que sugiere manejo de decisiones de permisos o rechazo de acciones no autorizadas.

## Casos de uso

- Asistente financiero en turco con datos en tiempo real: el modelo decide cuando consultar una herramienta de cotizaciones (acciones BIST, mercados de EE. UU., divisas, criptomonedas) y genera la llamada con el simbolo y mercado correctos, evitando alucinar precios.
- Chatbots de banca o broker: puede integrarse como capa de lenguaje que traduce peticiones de usuarios turcos en llamadas a APIs internas de market data, con validacion de esquemas de argumentos.
- Agentes con protocolo MCP: su entrenamiento especifico en decision MCP (97,22% en evaluacion) lo hace adecuado para agentes que conectan con servidores MCP de datos financieros.
- Automatizacion de consultas de cartera: responder preguntas sobre posiciones, variaciones o valoraciones combinando calculo financiero local (100% de acierto en el set de calculo) con datos externos via herramientas.
- Backends de atencion al cliente financiera: conversacion multi-turno en turco con capacidad de invocar herramientas de consulta de cuenta o mercado, siempre con confirmacion humana para operaciones sensibles.
- Prototipado rapido de asistentes verticales: al ser un modelo de 4B con licencia Apache-2.0, permite desplegar un agente financiero especializado en hardware modesto o en endpoints gestionados sin costes de licencia.
- Validacion y pruebas de pipelines de tool calling: su alto cumplimiento de esquema (96,67%) lo hace util como modelo de referencia para tests de integracion de APIs financieras.

## Benchmarks y rendimiento

La model card publica una evaluacion propia sobre 78 casos (36 MCP/seguridad, 30 de conocimiento financiero y 12 de calculo financiero), comparando con el modelo base. No hay comparacion con modelos de terceros.

| Modelo | Composite | Decision MCP | Seleccion de herramienta | Esquema | Argumentos | Exito funcional MCP | Conocimiento financiero | Calculo financiero |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Base Qwen3-4B | 85,91 | 86,11% | 80,00% | 83,33% | 77,39% | 80,56% | 90,00% | 91,67% |
| **Fintool-TR** | **92,68** | **97,22%** | **90,00%** | **96,67%** | **87,39%** | **88,89%** | 90,00% | **100,00%** |

Dato destacado: en esquemas de herramientas nuevos (no vistos en entrenamiento), el exito funcional fue del 100% (12/12) para Fintool-TR frente al 66,67% del modelo base. En la auditoria de calculo, el modelo acerto 12/12 tanto en exactitud semantica como en el formato obligatorio `SONUC:`. La formula del composite es: decision MCP 10%, seleccion de herramienta 15%, esquema 5%, cobertura de argumentos 10%, exito funcional MCP 10%, conocimiento financiero 30%, calculo financiero 20%.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8-9 GB solo de pesos (8,04 GB), mas overhead de KV cache y activaciones; en la practica, alrededor de 10-12 GB segun longitud de contexto.
- Cabe en GPUs de consumo: si, en una RTX 4090 (24 GB), RTX 3090 (24 GB) o incluso RTX 4070 Ti Super (16 GB) con contexto moderado. Para contextos muy largos (hasta 262.144 tokens de config) se recomienda mas VRAM o cuantizacion.
- Con cuantizacion (no publicada oficialmente, pero aplicable via GGUF/AWQ/GPTQ de terceros): podria ejecutarse en GPUs de 8 GB o incluso en CPU con llama.cpp, aunque no hay builds oficiales documentados.
- GPUs recomendadas para entrenamiento/inferencia servida: A100 80 GB (usada en entrenamiento), H100, o L4/A10G para inferencia en la nube.
- Opciones de despliegue: Transformers (codigo de ejemplo en la model card con `device_map="auto"`), text-generation-inference y endpoints compatibles segun los tags del repo. No se mencionan explicitamente vLLM, llama.cpp u Ollama, aunque la arquitectura Qwen3 esta soportada por dichos runtimes.
- Latencia y throughput: no disponible; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Foco | Disponibilidad |
|---|---|---|---|---|---|
| Fintool-TR | 4,02B | 262.144 (config) / 8.192 (entrenamiento) | Apache-2.0 | Finanzas y tool calling en turco | safetensors BF16, HuggingFace |
| unsloth/Qwen3-4B-Instruct-2507 (base) | ~4B | 262.144 | Apache-2.0 | Instructo general multilingue | safetensors, HuggingFace |
| Qwen3-4B-Instruct-2507 (oficial) | ~4B | 262.144 | Apache-2.0 | Instructo general multilingue | safetensors, HuggingFace |

Fintool-TR comparte arquitectura, contexto y licencia con su modelo base; su diferencial es el rendimiento en tool calling y finanzas turcas (composite 92,68 frente a 85,91 del base). No se han identificado otros fine-tunings financieros en turco de tamano comparable en la informacion disponible.

## Limitaciones y advertencias

- No esta disenado para generar recomendaciones de inversion; su salida no constituye asesoramiento financiero.
- No debe usarse como fuente de datos de mercado en tiempo real: precios, tipos de cambio y datos macroeconomicos deben obtenerse siempre de herramientas externas.
- Acciones sensibles como ordenes o transferencias no deben ejecutarse sin confirmacion explicita del usuario.
- En produccion, los argumentos de las herramientas deben validarse fuera del modelo; la autorizacion y los limites de operacion deben aplicarse en la capa de aplicacion, no en el modelo.
- El conjunto de evaluacion es pequeno (78 casos) y propio del autor; los resultados pueden no generalizar a otros dominios o distribuciones de datos.
- El entrenamiento se limito a secuencias de 8.192 tokens, por lo que el rendimiento en contextos cercanos al limite teorico de 262.144 no esta verificado.
- Especializacion en turco: el rendimiento en otros idiomas no esta evaluado en la model card.
- Riesgo de alucinacion inherente a modelos de lenguaje de 4B, especialmente en datos financieros factualles si no se usan herramientas.
- No hay informacion sobre sesgos especificos del dataset de entrenamiento; conviene auditar antes de uso sensible.
- Se recomienda usar `do_sample=False` (decodificacion greedy) en tool calls para reducir desviaciones de esquema, segun el propio autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dbmaxwell/Fintool-TR
- Modelo base: https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507
- Dataset de entrenamiento: https://huggingface.co/datasets/Dbmaxwell/FintoolDataset-tr
- Paper, blog o demo: no disponible
