# mradermacher/phonellm-alpha-1-i1-GGUF

## Resumen

Phonellm Alpha 1 es un modelo de lenguaje de 30 mil millones de parametros desarrollado por pipecat-ai, disenado especificamente para agentes de voz y conversaciones telefonicas. Combina una arquitectura de mezcla de expertos (MoE) basada en Nemotron con una ventana de contexto de 256.000 tokens, lo que permite mantener conversaciones largas y contextualmente ricas. El modelo incluye soporte nativo para tool calling y function calling, lo que lo hace adecuado para integrarse en pipelines de agentes conversacionales.

Este repositorio concreto, `mradermacher/phonellm-alpha-1-i1-GGUF`, contiene la cuantizacion con imatrix del modelo base, realizada por mradermacher. El archivo imatrix permite generar cuantizaciones de mayor calidad, mientras que los quants estaticos estan disponibles en el repositorio hermano `mradermacher/phonellm-alpha-1-GGUF`. La cuantizacion reduce significativamente los requisitos de memoria, facilitando el despliegue en hardware de consumo o en entornos con VRAM limitada.

La relevancia de este modelo radica en su especializacion para el dominio de voz y telefono, un area donde los modelos genericos suelen fallar. Al estar optimizado para conversaciones naturales y con soporte de herramientas, puede integrarse en sistemas de atencion al cliente, asistentes virtuales y otras aplicaciones de procesamiento de lenguaje natural en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Nemotron |
| Parametros totales | 30B (segun LLM Explorer; el repo muestra 13.821.579, posiblemente erroneo) |
| Parametros activos | no disponible |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | imatrix (este repo); quants estaticos (Q2_K, IQ3_M, Q4_K_S, etc.) en el repo hermano |
| Idiomas soportados | ingles (en) |
| Licencia | BSD-2-Clause |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base, `pipecat-ai/phonellm-alpha-1`, emplea una arquitectura de mezcla de expertos (MoE) sobre la base de Nemotron, lo que permite activar solo una fraccion de los parametros durante la inferencia, mejorando la eficiencia computacional. La ventana de contexto de 256.000 tokens es especialmente util para dialogos prolongados o para procesar historiales completos de conversaciones telefonicas.

No se dispone de informacion detallada sobre el proceso de entrenamiento, como el numero de tokens utilizados, la composicion del dataset o si se aplicaron tecnicas de RLHF o DPO. La cuantizacion realizada por mradermacher utiliza el metodo imatrix, que calcula matrices de importancia para cada capa, logrando una mejor relacion calidad-tamano en comparacion con cuantizaciones estaticas convencionales.

## Capacidades

- Generacion de texto conversacional fluido, optimizado para interacciones de voz y telefono.
- Soporte de tool calling y function calling, permitiendo al modelo invocar APIs o acciones externas durante una conversacion.
- Capacidad para actuar como agente autonomo en tareas de multiple paso, gracias a su contexto largo y razonamiento contextual.
- Integracion nativa con el framework Pipecat, disenado para construir agentes de voz en tiempo real.
- Procesamiento de lenguaje natural en ingles, con potencial para otros idiomas si se entrena adecuadamente (no confirmado).
- Compatible con endpoints de inferencia estandar (transformers, GGUF) y con herramientas como llama.cpp, Ollama o vLLM.

## Casos de uso

- Atencion al cliente telefonica automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (256K tokens), recordando detalles de interacciones anteriores y resolviendo consultas complejas sin perder el hilo.
- Asistentes de voz para reservas y citas: gracias a su soporte de tool calling, puede conectarse a sistemas de calendario o reservas, ejecutando acciones como crear citas o modificar horarios durante la llamada.
- Agentes de soporte tecnico en tiempo real: con su capacidad de razonamiento y contexto amplio, puede diagnosticar problemas, guiar al usuario paso a paso y escalar a un humano cuando sea necesario.
- Transcripcion y resumen de llamadas: el modelo puede procesar transcripciones largas y generar resumenes estructurados, extrayendo informacion clave de conversaciones extensas.
- Integracion en plataformas de contact center: al ser compatible con Pipecat, puede desplegarse en entornos de produccion que requieran baja latencia y alta disponibilidad.
- Generacion de respuestas para chatbots de texto: aunque esta optimizado para voz, su capacidad conversacional y de tool calling lo hace util en canales de texto como WhatsApp o web.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras metricas estandar para este modelo.

## Requisitos de hardware

- El modelo completo en FP16 requiere aproximadamente 63,2 GB de VRAM, segun LLM Explorer, lo que implica GPUs de gama alta como A100 (80GB) o H100.
- Con cuantizaciones GGUF, los requisitos se reducen considerablemente: una cuantizacion Q4_K_S (aproximadamente 4 bits) ocuparia unos 16-20 GB, permitiendo su ejecucion en GPUs de consumo como RTX 4090 (24GB) o RTX 3090 (24GB).
- Para cuantizaciones mas agresivas (Q2_K o IQ2), el modelo podria caber en GPUs con 8-12 GB, aunque con perdida de calidad.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, TGI o cualquier runtime compatible con GGUF.
- La latencia dependera del hardware y la cuantizacion; en una RTX 4090 con Q4, se pueden esperar velocidades de 20-40 tokens por segundo, aunque no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa con otros modelos de la misma categoria (agentes de voz con tool calling). Se recomienda consultar el modelo base en HuggingFace para obtener referencias adicionales.

## Limitaciones y advertencias

- El modelo esta entrenado principalmente en ingles; su rendimiento en otros idiomas no esta garantizado.
- Al ser una cuantizacion, puede presentar una ligera degradacion en la calidad de las respuestas en comparacion con el modelo original en precision completa.
- El repositorio actual solo contiene el archivo imatrix; para obtener los quants listos para usar, es necesario descargarlos del repositorio hermano `mradermacher/phonellm-alpha-1-GGUF`.
- No se han publicado evaluaciones de sesgos o alucinaciones; se recomienda validar el comportamiento en entornos de produccion.
- La licencia BSD-2-Clause permite uso comercial, pero se debe revisar la licencia del modelo base y de los componentes de Pipecat si se utiliza ese framework.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/phonellm-alpha-1-i1-GGUF
- Repositorio de quants estaticos: https://huggingface.co/mradermacher/phonellm-alpha-1-GGUF
- Modelo base: https://huggingface.co/pipecat-ai/phonellm-alpha-1
- Framework Pipecat: https://www.pipecat.ai/ (no confirmado en la informacion, pero se menciona en los tags)
