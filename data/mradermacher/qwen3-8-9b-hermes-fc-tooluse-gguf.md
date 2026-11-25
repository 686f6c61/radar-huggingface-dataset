# mradermacher/qwen3.8-9b-hermes-fc-tooluse-GGUF

## Resumen

`mradermacher/qwen3.8-9b-hermes-fc-tooluse-GGUF` es una coleccion de cuantizaciones GGUF estaticas del modelo base `JamieBradfield/qwen3.8-9b-hermes-fc-tooluse`, un ajuste fino orientado especificamente a function calling y uso de herramientas. El trabajo de cuantizacion lo firma mradermacher, conocido en el ecosistema por publicar versiones GGUF de modelos recientes para su uso en llama.cpp y entornos de inferencia local.

El modelo base parte de la familia Qwen 3.5 (etiquetada como `qwen3.5` en los tags) con aproximadamente 9.195 millones de parametros, y ha sido afinado mediante QLoRA para mejorar el comportamiento en tool use. Los tags del repositorio mencionan tambien `glm` y `distillation`, lo que sugiere que el ajuste fino pudo haberse apoyado en destilacion de un modelo mayor (posiblemente de la familia GLM) para transferir capacidades de function calling.

La relevancia de esta publicacion es practica: ofrece el modelo en once cuantizaciones distintas, desde Q2_K (4,0 GB) hasta f16 (18,5 GB), lo que permite desplegarlo en hardware muy diverso, desde GPUs de consumo con 8 GB de VRAM hasta estaciones de trabajo. La licencia Apache 2.0 facilita su uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen 3.5; detalles de capas y atencion no disponibles) |
| Parametros totales | 9.195.119.616 (~9,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base se distribuye en safetensors via transformers |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Qwen 3.5 con 9,2 mil millones de parametros. El ajuste fino se realizo con QLoRA, una tecnica de adaptacion de bajo rango sobre pesos cuantizados, segun los tags del repositorio. El objetivo declarado del finetune es mejorar el comportamiento en function calling y tool use, no un entrenamiento generalista adicional.

Los tags `glm` y `distillation` apuntan a que el proceso de entrenamiento pudo incluir destilacion desde un modelo mayor de la familia GLM para transferir capacidades de invocacion de herramientas. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO. Las cuantizaciones publicadas son estaticas (no hay versiones con imatrix en el momento de la publicacion, segun indica el autor), generadas con `quantize_version: 2` y `output_tensor_quantised: 1`.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat multi-turno.
- Function calling y tool use: capacidad principal del finetune, orientada a invocar herramientas externas con argumentos estructurados.
- Razonamiento multi-paso con herramientas: el ajuste esta pensado para encadenar llamadas a funciones dentro de un flujo de agente.
- Integracion con endpoints compatibles (`endpoints_compatible` en los tags), lo que sugiere compatibilidad con APIs tipo OpenAI.
- Capacidades de codigo y matematicas: no confirmadas explicitamente en la informacion disponible.
- Vision, audio y modo thinking: no disponibles.
- Multilingue: limitado a ingles segun la model card.

## Casos de uso

- Agentes de automatizacion con herramientas: el modelo puede decidir que funcion invocar y con que parametros en flujos de trabajo tipo ReAct o similares, gracias a su entrenamiento especifico en tool use.
- Asistentes de consola y CLI: integrable en llama.cpp u Ollama para construir asistentes locales que consulten APIs, ejecuten comandos o lean ficheros mediante function calling.
- Enrutamiento de peticiones: util como modelo pequeno que clasifica la intencion del usuario y decide a que servicio o herramienta derivar la consulta.
- Extraccion estructurada de datos: generar JSON con campos definidos a partir de texto libre, aprovechando el formato de salida de herramientas.
- Prototipado de pipelines de agentes en local: con la cuantizacion Q4_K_M (5,9 GB) cabe en GPUs de consumo de 8 GB, lo que permite iterar sin coste de API.
- Backend de bajo coste para chatbots con acceso a funciones: la licencia Apache 2.0 y el tamano contenido lo hacen apto para despliegues en produccion con requisitos moderados.
- Evaluacion comparativa de tecnicas de finetune para tool calling: util como referencia para investigadores que estudien QLoRA aplicado a function calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (con overhead de contexto incluido, aproximada):
  - Q2_K: ~4,0 GB de pesos, ~5-6 GB de VRAM total.
  - Q4_K_M: ~5,9 GB de pesos, ~7-8 GB de VRAM total.
  - Q6_K: ~7,7 GB de pesos, ~9-10 GB de VRAM total.
  - Q8_0: ~9,9 GB de pesos, ~11-12 GB de VRAM total.
  - f16: ~18,5 GB de pesos, ~20 GB de VRAM total.
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores con cuantizaciones Q4-Q6. En GPUs de 8 GB, usar Q4_K_S o Q4_K_M con contexto moderado.
- GPU profesionales: A100, H100 y L40S pueden ejecutar la version f16 sin problemas, aunque el modelo es pequeno para ese hardware.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python; el modelo base (safetensors) puede servirse con vLLM o TGI si se dispone de los pesos originales.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.8-9b-hermes-fc-tooluse (este) | ~9,2 B | no disponible | Function calling / tool use | Apache 2.0 | GGUF + safetensors |
| Qwen2.5-7B-Instruct | ~7,6 B | 32k (segun model card oficial) | Instrucciones generales con tool calling | Apache 2.0 | GGUF, safetensors, AWQ |
| Llama-3.1-8B-Instruct | ~8,0 B | 128k | Instrucciones generales con tool calling | Llama 3.1 Community | GGUF, safetensors |
| Hermes-3-Llama-3.1-8B | ~8,0 B | 128k | Function calling especializado | Llama 3.1 Community | GGUF, safetensors |

La comparativa se basa en caracteristicas publicas de esos modelos; no se dispone de datos de rendimiento comparativo para este finetune concreto.

## Limitaciones y advertencias

- Solo soporta ingles de forma declarada; el rendimiento en castellano no esta garantizado.
- Al ser un finetune especializado en tool use, puede degradarse en tareas generales de conversacion o conocimiento frente a modelos instruct generalistas.
- Riesgo de alucinacion en la generacion de argumentos de funciones: conviene validar esquemas con JSON Schema antes de ejecutar herramientas.
- La longitud de contexto no se documenta en la informacion disponible; asumir valores conservadores hasta verificarlo.
- Las cuantizaciones Q2_K y Q3_K_S degradan la calidad de forma notable; para produccion se recomienda Q4_K_M o superior.
- No hay cuantizaciones con imatrix disponibles, lo que puede reducir la calidad frente a versiones ponderadas en tamanos pequenos.
- Aunque la licencia es Apache 2.0, conviene revisar la licencia del modelo base y de los datos de destilacion por posibles obligaciones adicionales.
- El numero de descargas (304) y likes (2) es bajo, lo que indica poca validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/qwen3.8-9b-hermes-fc-tooluse-GGUF
- Modelo base: https://huggingface.co/JamieBradfield/qwen3.8-9b-hermes-fc-tooluse
- Pagina de descargas del autor: https://hf.tst.eu/model#qwen3.8-9b-hermes-fc-tooluse-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
