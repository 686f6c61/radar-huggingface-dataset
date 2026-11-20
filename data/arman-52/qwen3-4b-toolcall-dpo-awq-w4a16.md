# arman-52/qwen3-4b-toolcall-dpo-awq-w4a16

## Resumen

`arman-52/qwen3-4b-toolcall-dpo-awq-w4a16` es un checkpoint cuantizado en W4A16 (pesos de 4 bits, activaciones de 16 bits) del modelo `arman-52/qwen3-4b-toolcall-dpo-merged`, que a su vez deriva de la familia Qwen3 de Alibaba. El autor, arman-52, ha aplicado un ajuste fino orientado a *tool calling* (SFT con QLoRA seguido de DPO) y posteriormente una cuantización AWQ asimétrica mediante `llm-compressor`, empaquetada en formato `compressed-tensors` para su ejecución con el kernel Marlin de vLLM. El objetivo declarado es el servicio de alto rendimiento en vLLM con un modelo especializado en invocación de funciones.

El modelo cuenta con 4.022.468.096 parámetros totales (aproximadamente 4 mil millones) y un repositorio de 2,7 GB, con un peso en disco del checkpoint de 2,48 GB frente a los ~8,04 GB que ocuparía en BF16. Es un transformer denso (no MoE) de la familia Qwen3, con licencia Apache 2.0 y declarado únicamente para inglés. Su relevancia práctica reside en combinar un tamaño contenido, una cuantización agresiva de pesos y una especialización explícita en *function calling*, lo que lo hace candidato para despliegues con requisitos de VRAM moderados.

La información pública disponible es muy limitada: la model card solo documenta el proceso de cuantización (método, dataset de calibración y huella en disco) y un comando de servicio con vLLM. No se detallan resultados de benchmarks, composición del dataset de entrenamiento ni detalles de la arquitectura más allá de su pertenencia a Qwen3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3); no se detalla la variante exacta |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion (el ejemplo de servicio usa `--max-model-len 4096`) |
| Tipos de cuantizacion | W4A16 (AWQ asimetrico, `AWQModifier (W4A16_ASYM)`), formato `compressed-tensors` |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (formato `compressed-tensors` para vLLM) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen3 con aproximadamente 4.000 millones de parametros. El checkpoint publicado es el resultado de una cadena de transformaciones: partiendo de un modelo base Qwen3, el autor realizo un ajuste fino supervisado (SFT) con QLoRA, fusiono los adaptadores en un checkpoint BF16 (`arman-52/qwen3-4b-toolcall-dpo-merged`), aplico DPO sobre el modelo fusionado y, finalmente, cuantizo los pesos a 4 bits con AWQ. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset de SFT/DPO ni los hiperparametros utilizados.

La innovacion tecnica documentada es la cuantizacion: se empleo `llm-compressor` con el modificador `AWQModifier` en configuracion `W4A16_ASYM`, calibrado con 256 ejemplos de tool calling del dataset `arman-52/toolcall-sprint-data`. El resultado se serializa en formato `compressed-tensors`, disenado para ejecutarse con el kernel Marlin de vLLM, lo que reduce la huella en disco de ~8,04 GB (BF16) a 2,48 GB. No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal o modos de razonamiento extendido.

## Capacidades

- Generacion de texto conversacional en ingles.
- Invocacion de funciones y herramientas (*tool calling* / *function calling*), capacidad para la que el modelo fue explicitamente ajustado mediante SFT y DPO.
- Integracion con el formato de chat conversacional de transformers.
- Despliegue optimizado en vLLM mediante pesos cuantizados W4A16 y kernel Marlin.
- Compatibilidad declarada con text-generation-inference y endpoints compatibles.
- No se documentan capacidades de vision, audio, matematicas avanzadas, razonamiento multi-paso ni agentes autonomas mas alla del tool calling.
- Cobertura multilingue limitada al ingles segun la metadata del modelo.

## Casos de uso

- **Atencion al cliente con backend de acciones**: el modelo puede interpretar la peticion del usuario y emitir llamadas estructuradas a funciones (consultar pedido, cancelar reserva, escalar a humano). Su ajuste DPO sobre tool calling reduce la tasa de invocaciones malformadas frente a un modelo base sin especializar.
- **Orquestacion de APIs en asistentes internos**: integrado en un servicio vLLM, actua como capa de enrutamiento que traduce lenguaje natural a llamadas JSON contra APIs REST corporativas, con latencia baja gracias a los pesos de 4 bits.
- **Agentes de automatizacion de flujos de trabajo**: encadenado con un ejecutor de herramientas, puede decidir que funcion invocar en cada turno de una tarea multi-paso (por ejemplo, buscar un registro, validarlo y actualizarlo), siempre que el contexto de 4096 tokens configurado sea suficiente.
- **Despliegue en hardware de gama media**: con 2,48 GB de pesos, cabe en GPUs consumer con 8 GB o mas de VRAM, lo que permite prototipar asistentes con tool calling en estaciones de trabajo sin aceleradores de datacenter.
- **Servicio de alto throughput en vLLM**: el formato `compressed-tensors` con kernel Marlin esta pensado para maximizar el numero de peticiones concurrentes por GPU en entornos de produccion con carga elevada.
- **Generacion de llamadas a funciones en pipelines de datos**: extraccion estructurada de informacion de textos (por ejemplo, convertir correos en llamadas a funciones de CRM) en lotes, aprovechando el bajo coste de memoria del checkpoint cuantizado.
- **Evaluacion y comparacion de estrategias de cuantizacion**: al ser un checkpoint AWQ W4A16 documentado paso a paso, sirve como referencia para medir la perdida de calidad de tool calling tras cuantizar un modelo de 4B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: los pesos ocupan 2,48 GB; con cache KV y overhead de vLLM, se estima un consumo de aproximadamente 4-6 GB para contexto de 4096 tokens (estimacion, no confirmada por el autor).
- **GPU recomendadas**: para produccion con throughput alto, GPUs de datacenter como A100, H100 o L40S; el modelo es lo bastante pequeno para que una sola GPU sirva muchas peticiones concurrentes.
- **GPU consumer**: cabe holgadamente en RTX 4090 (24 GB), RTX 4080 (16 GB) y RTX 4070 (12 GB); en GPUs de 8 GB es probable que funcione con contexto reducido, aunque no esta verificado.
- **Opciones de despliegue**: el autor documenta vLLM con `--max-model-len 4096 --gpu-memory-utilization 0.90`. El formato `compressed-tensors` esta orientado al kernel Marlin de vLLM; no se documenta soporte para llama.cpp, Ollama ni TGI con estos pesos cuantizados.
- **Latencia y throughput**: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Enfoque |
|---|---|---|---|---|---|
| arman-52/qwen3-4b-toolcall-dpo-awq-w4a16 | 4,02 B | No disponible (ejemplo con 4096) | W4A16 AWQ | Apache 2.0 | Tool calling especializado |
| Qwen3-4B (base de Alibaba) | ~4 B | No disponible en esta ficha | BF16 y multiples | Apache 2.0 | Proposito general |
| arman-52/qwen3-4b-toolcall-dpo-merged (BF16) | 4,02 B | No disponible | BF16 (~8,04 GB) | Apache 2.0 | Tool calling especializado, sin cuantizar |

La comparacion con modelos de otros autores (por ejemplo, variantes de 3-4B orientadas a function calling de otras familias) no se puede realizar con rigor porque no se han publicado benchmarks del modelo en la informacion disponible.

## Limitaciones y advertencias

- **Idioma**: la metadata declara unicamente ingles; el rendimiento en castellano no esta evaluado y probablemente sea deficiente.
- **Contexto**: no se especifica la longitud de contexto nativa; el ejemplo de servicio limita a 4096 tokens, lo que restringe tareas con historiales largos o documentos extensos.
- **Perdida por cuantizacion**: la cuantizacion W4A16 puede degradar la precision en la generacion de JSON estricto y en la seleccion de herramientas; no hay evaluacion publicada del impacto.
- **Riesgo de alucinacion**: como cualquier LLM de 4B, puede inventar nombres de funciones o argumentos no existentes; es imprescindible validar las llamadas contra un esquema y aplicar reintentos o fallbacks.
- **Sesgos**: no se documenta ninguna evaluacion de sesgos; al derivar de Qwen3 y entrenarse con un dataset pequeno y especifico, puede heredar sesgos del corpus base y del dataset de tool calling.
- **Madurez y soporte**: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente sin validacion comunitaria, lo que desaconseja su uso en produccion sin una evaluacion propia.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3 y del dataset de calibracion `arman-52/toolcall-sprint-data`.
- **Despliegue**: el checkpoint esta pensado para vLLM con kernel Marlin; otros runtimes pueden no cargar el formato `compressed-tensors` correctamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arman-52/qwen3-4b-toolcall-dpo-awq-w4a16
- Modelo base fusionado (BF16): https://huggingface.co/arman-52/qwen3-4b-toolcall-dpo-merged
- Dataset de calibracion: https://huggingface.co/datasets/arman-52/toolcall-sprint-data
- Repositorio de llm-compressor: https://github.com/vllm-project/llm-compressor
- Documentacion de compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- Documentacion de vLLM: https://docs.vllm.ai
