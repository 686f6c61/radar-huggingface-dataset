# Guilherme34/Firefly-v5-agentic-multiharness-merged

## Resumen

Firefly-v5-agentic-multiharness-merged es un modelo multimodal de tipo image-text-to-text desarrollado por Guilherme34, derivado del modelo base Firefly-v5 mediante un proceso de ajuste fino orientado a capacidades agénticas. El modelo se distribuye como un merge completo en 16 bits (safetensors) con 5.123.178.051 parámetros (aproximadamente 5,1 mil millones) y licencia Apache 2.0. Su propuesta principal es el entrenamiento multi-harness: el ajuste se realizó exponiendo el modelo a once entornos de agentes distintos (pi, claude-code, opencode, codex, hermes, mini-swe-agent, aider, terminus-2, openhands, kimi-cli y goose) para que generalice el formato de interacción agéntica en lugar de sobreajustarse a un único framework.

El pipeline de entrenamiento combina una fase de SFT de 24.000 ejemplos con una fase de GRPO (Posterior-GRPO) sobre los datasets SmolDataEnvs-harbor-train y SmolDataEnvs-multiharness-sft, usando la librería TRL. El resultado es un modelo pensado para tareas de agente multi-paso, uso de herramientas y razonamiento encadenado en inglés, con soporte de entrada de imagen y texto.

Es relevante ahora porque aborda un problema práctico en el despliegue de agentes: la fragilidad de los modelos cuando cambia el harness o el formato de las herramientas. Al entrenar contra múltiples harnesses, el autor busca un modelo más portable entre entornos de ejecución. No obstante, la información publicada es escasa (sin benchmarks ni detalles de arquitectura interna), por lo que debe evaluarse con cautela en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); familia Gemma 4 segun tags; detalles internos no disponibles |
| Parametros totales | 5.123.178.051 (~5,1 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo se publica en 16 bits; no se listan GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un merge completo en 16 bits de un ajuste fino sobre Firefly-v5. Los tags del repositorio lo sitúan en la familia Gemma 4 y con pipeline image-text-to-text, lo que implica un transformer multimodal con codificador de imagen y decodificador de texto; no se publican detalles sobre el número de capas, dimensión oculta, mecanismo de atención ni resolución de imagen. Tampoco se especifica la longitud de contexto nativa.

El entrenamiento se estructura en dos fases: una SFT de 24.000 ejemplos sobre SmolDataEnvs-multiharness-sft, seguida de Posterior-GRPO (variante de GRPO implementada con TRL) sobre SmolDataEnvs-harbor-train. La innovación destacable es el entrenamiento multi-harness: el modelo se expone a los formatos de llamada a herramientas, convenciones de mensajes y flujos de trabajo de once harnesses distintos (pi, claude-code, opencode, codex, hermes, mini-swe-agent, aider, terminus-2, openhands, kimi-cli, goose) mediante la herramienta Easy-Agenticify. No se detallan el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases adicionales de alineación.

## Capacidades

- Generacion de texto conversacional en ingles con formato de chat (tag conversational).
- Razonamiento multi-paso orientado a tareas de agente.
- Uso de herramientas y function calling en multiples formatos de harness (once entornos entrenados).
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text).
- Adaptacion a distintos protocolos de agente: claude-code, codex, openhands, aider, goose, entre otros.
- Capacidad de operar en flujos de tipo terminal y edicion de codigo, segun los harnesses cubiertos en el entrenamiento.
- Capacidades multilingues: limitadas al ingles segun la metadata del repositorio.

## Casos de uso

- Agentes de codificacion en produccion: el modelo puede integrarse en harnesses como aider, claude-code u opencode para tareas de edicion de ficheros, ejecucion de comandos y correccion iterativa, aprovechando que fue entrenado con esos formatos concretos.
- Automatizacion de terminal y operaciones: con mini-swe-agent o terminus-2, puede gestionar tareas de shell multi-paso, lo que encaja en pipelines de mantenimiento de repositorios o scripts de despliegue.
- Orquestacion de agentes en plataformas existentes: al cubrir openhands y goose, es candidato para sustituir el modelo subyacente en esas plataformas sin reentrenar el prompt de sistema.
- Evaluacion de robustez de harness: util como modelo de referencia para comparar el comportamiento de un mismo agente bajo distintos frameworks, gracias a su entrenamiento multi-harness.
- Tareas con entrada visual: al aceptar image-text-to-text, puede usarse en agentes que interpretan capturas de pantalla, diagramas o interfaces para decidir la siguiente accion.
- Investigacion en RL para agentes: sirve como punto de partida para experimentos con GRPO y entornos SmolDataEnvs, dado que el autor publica los datasets y la receta.
- Prototipado de asistentes de desarrollo: su tamano de ~5 B permite desplegarlo en una sola GPU para pruebas internas de flujos agénticos antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: aproximadamente 10-11 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 16-24 GB para contextos moderados.
- En cuantizacion de 8 bits: alrededor de 6 GB de pesos; en 4 bits, alrededor de 3 GB, aunque el repositorio no publica versiones cuantizadas.
- GPU recomendadas: A100 40/80 GB o H100 para despliegue con contexto largo y concurrencia; RTX 4090 (24 GB) o L40S para inferencia en 16 bits con lotes pequenos.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 (24 GB) y potencialmente en GPUs de 16 GB con cuantizacion, siempre que se genere una version GGUF o AWQ (no publicada).
- Opciones de despliegue: transformers (libreria declarada), vLLM y TGI para servido en 16 bits; llama.cpp u Ollama requeririan conversion a GGUF no incluida en el repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Firefly-v5-agentic-multiharness-merged | ~5,1 B | no disponible | Multimodal agéntico multi-harness | Apache 2.0 | Hugging Face, safetensors 16 bits |
| Firefly-v5 (base) | no disponible | no disponible | Multimodal base | Apache 2.0 (segun metadata del derivado) | Hugging Face |
| Alternativas de ~5 B agénticas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Solo soporta ingles segun la metadata; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- No se publican benchmarks, por lo que no hay evidencia cuantitativa de calidad, robustez o tasas de alucinacion.
- Riesgo de alucinacion inherente a modelos de ~5 B en tareas de razonamiento y uso de herramientas; sin evaluacion publicada no puede acotarse.
- La longitud de contexto no esta especificada; planificar el despliegue con contextos largos sin validacion previa es arriesgado.
- El entrenamiento multi-harness puede introducir confusion entre formatos de llamada si el prompt de sistema no es explicito sobre el harness activo.
- No se publican sesgos conocidos ni evaluaciones de seguridad.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Firefly-v5 conviene verificar las condiciones de la cadena de modelos base (Gemma) antes de desplegar en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay validacion comunitaria ni casos de uso reportados.
- El modelo es un merge de 16 bits; no se ofrecen versiones cuantizadas oficiales, lo que limita el despliegue en hardware modesto sin trabajo adicional.

## Enlaces

- Hugging Face: https://huggingface.co/Guilherme34/Firefly-v5-agentic-multiharness-merged
- Modelo base: https://huggingface.co/Guilherme34/Firefly-v5
- Dataset SFT: https://huggingface.co/datasets/FineEnvs/SmolDataEnvs-multiharness-sft
- Dataset RL: https://huggingface.co/datasets/FineEnvs/SmolDataEnvs-harbor-train
- TRL (libreria de entrenamiento): https://github.com/huggingface/trl
