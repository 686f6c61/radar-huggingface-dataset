# dphn/dolphin-2.9.3-mistral-nemo-12b-gguf

## Resumen

Dolphin 2.9.3 Mistral Nemo 12B es un ajuste fino por instrucciones del modelo base mistralai/Mistral-Nemo-Base-2407, desarrollado por Eric Hartford y el equipo de Cognitive Computations. Esta ficha concreta corresponde a la conversion a formato GGUF realizada por el usuario dphn, pensada para su uso con llama.cpp y herramientas compatibles. El modelo resuelve el problema de disponer de un asistente conversacional afinado para seguir instrucciones, con capacidades iniciales de agente y function calling, en un tamano de 12.247.802.880 parametros que cabe en hardware de consumo con cuantizacion agresiva.

La relevancia actual del modelo radica en su combinacion de contexto nativo largo (128K en el modelo base, aunque el ajuste fino se realizo con secuencias de 8192 tokens), licencia Apache 2.0 que permite uso comercial sin restricciones adicionales, y una orientacion explicita a la ausencia de alineacion (modelo "uncensored"). Esto lo hace atractivo para experimentacion, investigacion sobre comportamiento de modelos sin filtros y despliegues donde se quiera implementar una capa de alineacion propia.

La arquitectura subyacente es un transformer denso (no MoE) heredado de Mistral Nemo, con plantilla de prompt ChatML. El repositorio GGUF ocupa 253 GB e incluye multiples niveles de cuantizacion, lo que facilita su despliegue en configuraciones muy diversas, desde estaciones de trabajo con una sola GPU hasta entornos de CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Mistral-Nemo-Base-2407) |
| Parametros totales | 12.247.802.880 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K en el modelo base; ajuste fino con secuencias de 8192 tokens |
| Tipos de cuantizacion | Multiples variantes GGUF (el repo ocupa 253 GB e incluye distintos niveles; el detalle exacto de cada fichero no esta disponible en la informacion proporcionada) |
| Idiomas soportados | no disponible (el dataset incluye un subconjunto multilingue, pero no se declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo original de cognitivecomputations) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por instrucciones de Mistral-Nemo-Base-2407, un transformer denso de 12.247.802.880 parametros. El entrenamiento se realizo con Axolotl version 0.4.1, con un regimen de ajuste selectivo: se congelaron la mayoria de pesos y se dejaron entrenables el `lm_head`, los `embed_tokens`, las capas de normalizacion (`input_layernorm`, `post_attention_layernorm`, `model.norm`), los embeddings rotatorios y un subconjunto concreto de capas `mlp.down_proj` y `mlp.gate_proj`. Este enfoque reduce el coste computacional del ajuste manteniendo capacidad de adaptacion en puntos clave de la red.

El dataset combina fuentes orientadas a conversacion, codigo, matematicas, function calling y comportamiento agentico: Dolphin-2.9, OpenHermes-2.5, CodeFeedback-Filtered-Instruction, dolphin-coder, samantha-data, orca-math-word-problems-200k, function-calling-chatml y Agent-FLAN, ademas de subconjuntos propios de ToolBench (instrucciones, ejemplos negativos, trayectorias ReAct y datos CoT). La plantilla de conversacion es ChatML y la longitud de secuencia usada en el ajuste fue de 8192 tokens. No se documenta en la informacion disponible el numero total de tokens de entrenamiento, ni si se aplicaron fases de RLHF o DPO. El autor declara que el dataset fue filtrado para eliminar alineacion y sesgo, lo que produce un modelo deliberadamente mas permisivo.

## Capacidades

- Generacion de texto conversacional multi-turno con seguimiento de instrucciones.
- Razonamiento y resolucion de problemas matematicos, con datos de entrenamiento derivados de Orca-Math.
- Generacion y edicion de codigo, apoyada en los subconjuntos dolphin-coder y CodeFeedback.
- Soporte de function calling / tool calling, con datos de Locutusque/function-calling-chatml y ToolBench.
- Capacidades iniciales de agente y razonamiento multi-paso, con trayectorias ReAct incluidas en el entrenamiento.
- Capacidades multilingues parciales (el dataset incluye un subconjunto multilingue, aunque no se especifica la cobertura).
- Modelo sin alineacion: responde con alta complacencia a practicamente cualquier peticion, incluidas las eticas y no eticas.
- Plantilla ChatML con soporte de mensaje de sistema.

## Casos de uso

- Asistente conversacional autoalojado: el modelo puede mantener dialogos multi-turno con contexto amplio (hasta 128K en el modelo base) y desplegarse en infraestructura propia sin dependencia de APIs externas, gracias a la licencia Apache 2.0.
- Generacion de codigo en pipelines internos: sus datos de entrenamiento en codigo (dolphin-coder, CodeFeedback) y su soporte de tool calling permiten integrarlo en herramientas de autocompletado, revision o generacion de tests dentro de flujos de CI/CD.
- Automatizacion de tareas con function calling: puede emitir llamadas estructuradas a funciones en escenarios de orquestacion (consultas a bases de datos, APIs REST, sistemas de ticketing) gracias a los datos de ToolBench y function-calling-chatml.
- Agentes de investigacion y razonamiento multi-paso: las trayectorias ReAct y los datos CoT de ToolBench lo hacen adecuado para prototipos de agentes que descomponen tareas y encadenan pasos.
- Base para ajuste fino adicional o investigacion sobre alineacion: al ser un modelo sin filtros y con licencia permisiva, sirve como punto de partida para estudiar comportamiento, aplicar capas de seguridad propias o entrenar variantes especializadas.
- Resolucion de problemas matematicos y razonamiento cuantitativo: los datos de Orca-Math lo orientan a tareas de aritmetica y problemas verbales, util en tutoria automatizada o generacion de ejercicios.
- Despliegue en hardware modesto: las multiples cuantizaciones GGUF permiten ejecutarlo en CPU o en GPUs de consumo, lo que habilita prototipos locales, entornos de desarrollo sin GPU dedicada o demos offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente "Evals: TBD".

## Requisitos de hardware

- VRAM estimada para inferencia: como referencia general para un modelo denso de ~12.2B parametros, en FP16 se requieren aproximadamente 24-25 GB; en 8 bits unos 13-14 GB; en 4 bits unos 7-8 GB. Estas cifras son estimaciones por tamano y no proceden de la informacion proporcionada.
- GPU recomendadas: A100, H100 o L40S para precision completa o servicio concurrente; RTX 4090 (24 GB) para FP16 o cuantizaciones altas; RTX 3090, 4080, 4070 Ti y similares para cuantizaciones de 8 y 4 bits.
- Cabe en GPU de consumo: si, con cuantizaciones GGUF de 4-8 bits en GPUs con 8-24 GB de VRAM.
- Opciones de despliegue: llama.cpp (formato nativo del repo), Ollama, y servidores compatibles con GGUF; el modelo original en safetensors puede servirse con vLLM o TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Dolphin 2.9.3 Mistral Nemo 12B (esta ficha) | 12.247.802.880 | 128K (base); ajuste a 8192 | Apache 2.0 | GGUF / safetensors | Sin alineacion, function calling, agente inicial |
| Mistral-Nemo-Base-2407 | ~12B | 128K | Apache 2.0 | safetensors | Modelo base sin ajuste por instrucciones |
| Mistral 7B Instruct | ~7.2B | 32K | Apache 2.0 | safetensors / GGUF | Menor tamano, sin capacidades agenticas declaradas |
| Qwen2.5 14B Instruct | ~14B | 128K (segun variante) | Apache 2.0 (mayoria de variantes) | safetensors / GGUF | Alternativa de tamano cercano; datos no verificados en esta ficha |

Los datos de Mistral 7B Instruct y Qwen2.5 14B se incluyen como referencia de categoria; no se dispone de comparaciones de rendimiento publicadas para este modelo concreto.

## Limitaciones y advertencias

- Modelo sin alineacion: el autor advierte explicitamente que es "highly compliant with any requests, even unethical ones". Es imprescindible implementar una capa de alineacion y moderacion propia antes de exponerlo como servicio.
- Riesgo de alucinacion: como cualquier modelo de lenguaje de este tamano, puede generar contenido facticamente incorrecto con aparente confianza; no se han publicado evaluaciones que cuantifiquen este riesgo.
- Sesgos: el dataset fue filtrado para eliminar alineacion y sesgo, lo que no elimina los sesgos subyacentes del modelo base ni de los datos; puede amplificar comportamientos problematicos.
- Contexto efectivo limitado: aunque el modelo base soporta 128K, el ajuste fino se hizo con 8192 tokens, por lo que el rendimiento mas alla de esa longitud no esta garantizado.
- Idiomas: no se declara una lista oficial de idiomas soportados; el soporte multilingue es parcial y no verificado.
- Licencia: Apache 2.0 permite uso comercial, pero el autor indica que el modelo fue entrenado con datos generados por GPT-4, entre otros; conviene revisar las implicaciones de los terminos de uso de dichos datos para el caso de uso concreto.
- Despliegue: la version GGUF esta pensada para llama.cpp y herramientas compatibles; no es directamente compatible con vLLM o TGI sin conversion.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/dphn/dolphin-2.9.3-mistral-nemo-12b-gguf
- Modelo original en safetensors: https://huggingface.co/cognitivecomputations/dolphin-2.9.3-mistral-nemo-12b
- Modelo base: https://huggingface.co/mistralai/Mistral-Nemo-Base-2407
- Blog sobre modelos sin censura de Eric Hartford: https://erichartford.com/uncensored-models
- Discord de Cognitive Computations: https://discord.gg/h3K4XGj2RH
- Repositorio de Axolotl (framework de entrenamiento): https://github.com/axolotl-ai-cloud/axolotl
- Crusoe Cloud (patrocinador del entrenamiento): https://crusoe.ai/
