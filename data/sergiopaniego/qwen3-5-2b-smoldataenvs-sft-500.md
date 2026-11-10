# sergiopaniego/Qwen3.5-2B-SmolDataEnvs-SFT-500

## Resumen

Qwen3.5-2B-SmolDataEnvs-SFT-500 es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen3.5-2B, desarrollado por el usuario sergiopaniego y publicado en Hugging Face. El objetivo no es conversacional general: el modelo está entrenado específicamente para actuar como motor de un agente de código (OpenCode) en tareas de análisis de datos, leyendo ficheros, ejecutando Python y SQL y redactando una respuesta final.

El entrenamiento se realizó con el `SFTTrainer` de TRL sobre 473 conversaciones generadas por el modelo profesor Qwen3.5-397B-A17B actuando como agente OpenCode. Solo se conservaron las trazas que terminaron con respuesta correcta, lo que convierte el modelo en un destilado de comportamiento agéntico en un dominio concreto (análisis de datos sobre ficheros de Kaggle).

Su relevancia radica en el salto de rendimiento medido: pasa del 7,6 % al 33,3 % de tasa de resolución en el conjunto de evaluación de SmolDataEnvs respecto al Qwen3.5-2B base, con solo 2,21 mil millones de parámetros y licencia Apache 2.0, lo que permite desplegarlo en hardware modesto. Es un ejemplo de receta reproducible (generación de trazas, entrenamiento y evaluación) publicada junto al modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, multimodal image-text-to-text); detalles internos no disponibles |
| Parametros totales | 2.213.241.664 (~2,21 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el entrenamiento usó secuencias de hasta 16k tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor recomienda servir con vLLM) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer de la familia Qwen3.5 con capacidad multimodal image-text-to-text (pipeline declarado en Hugging Face). Sobre esa base se aplicó un ajuste fino supervisado con TRL (`SFTTrainer`) en modo no-think, con pérdida calculada únicamente sobre los turnos del asistente (`assistant_only_loss=True`, la versión de entrenamiento de la plantilla de Qwen3.5). La configuración fue de 3 épocas, tasa de aprendizaje 1e-5 con decaimiento coseno, lotes de 8 secuencias de hasta 16k tokens y una única GPU H200.

Los datos proceden del dataset `sergiopaniego/smoldataenvs-opencode-traces`, configuración `500`: una fila por tarea resuelta, con la conversación completa del agente (`messages`) y las herramientas ofrecidas (`tools`). Las trazas se generaron con Qwen3.5-397B-A17B como profesor y solo se conservaron las que acabaron en respuesta correcta. Además, las trazas provienen exclusivamente de tareas de entrenamiento cuyo dataset de Kaggle no respalda ninguna tarea de evaluación, lo que evita fuga de datos entre entrenamiento y test. La receta completa está publicada en el ejemplo `examples/sft_agent_traces` de TRL.

## Capacidades

- Ejecución de agentes de código: el modelo está diseñado para operar dentro de OpenCode, invocando herramientas (lectura de ficheros, ejecución de Python y SQL) en múltiples pasos hasta producir una respuesta.
- Tool calling / function calling: entrenado con las definiciones de herramientas incluidas en las trazas; el autor indica servir con `--enable-auto-tool-choice --tool-call-parser qwen3_xml`.
- Análisis de datos: resolución de tareas sobre ficheros de Kaggle, combinando inspección de datos, cálculo y respuesta final verificable.
- Razonamiento multi-paso en bucle agéntico, con capacidad de encadenar varias llamadas a herramientas.
- Capacidad multimodal de entrada (image-text-to-text), heredada del modelo base; no se documenta su uso en el ajuste fino.
- Modo no-think: el entrenamiento se realizó en modo sin razonamiento explícito y el autor recomienda desactivar `enable_thinking` al servir el modelo.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agente de análisis de datos sobre ficheros tabulares: el modelo puede recibir un CSV o un conjunto de datos de Kaggle, inspeccionarlo con Python o SQL y emitir una respuesta verificable, que es exactamente el dominio de entrenamiento y donde alcanza el 33,3 % de resolución en evaluación.
- Automatización de informes exploratorios: integrado en un pipeline que lanza OpenCode contra un directorio de datos, el modelo puede encadenar lectura de ficheros, cálculos y redacción de conclusiones sin intervención humana.
- Motor local de un agente de código en entornos con recursos limitados: con 2,21 mil millones de parámetros y licencia Apache 2.0, puede servirse en una GPU de consumo o en una instancia pequeña para tareas de lectura y ejecución de código acotadas.
- Evaluación y benchmarking de recetas de destilación: sirve como referencia reproducible para comparar el efecto del número de trazas (500 frente a 1k o full) sobre la tasa de resolución.
- Prototipado de flujos agénticos con tool calling: al estar entrenado con el formato de herramientas de OpenCode, permite validar integraciones de agentes OpenAI-compatible con vLLM antes de escalar a modelos mayores.
- Docencia e investigación sobre SFT agéntico: el par modelo + dataset + receta TRL permite estudiar cómo se comporta un modelo pequeño destilado de un profesor de 397B en tareas de ejecución de herramientas.

## Benchmarks y rendimiento

Tasa de resolución de OpenCode impulsado por cada modelo en tareas de análisis de datos de SmolDataEnvs, ejecutadas en Hugging Face Sandboxes y puntuadas por el verificador de cada tarea. Las tareas se construyen sobre datasets de Kaggle que ninguna traza de entrenamiento utilizó.

| Modelo | Trazas | Eval (144) | Test (163) |
|---|---|---|---|
| Qwen3.5-2B (base) | 0 | 7,6 % | 5,5 % |
| Qwen3.5-2B-SmolDataEnvs-SFT-500 | 473 | 33,3 % | 34,4 % |
| Qwen3.5-2B-SmolDataEnvs-SFT-1k | 963 | 32,6 % | 38,7 % |
| Qwen3.5-2B-SmolDataEnvs-SFT-full | 2.238 | 36,8 % | 38,7 % |
| Qwen3.5-397B-A17B (profesor) | no disponible | 71,5 % | 74,2 % |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 2,21 mil millones de parámetros, en fp16 ocuparía aproximadamente 4,4 GB de pesos y en cuantización de 8 bits alrededor de 2,2 GB, a lo que hay que sumar caché KV y overhead del runtime.
- GPU recomendadas: el autor entrenó con una H200; para inferencia, el modelo es lo bastante pequeño para GPUs de consumo, aunque no se publican cifras de latencia ni throughput.
- Cabe en GPU de consumo: sí, por tamaño (2,21 mil millones de parámetros); no se especifican modelos concretos ni cuantizaciones probadas.
- Opciones de despliegue: vLLM es la vía documentada por el autor, con `--enable-auto-tool-choice --tool-call-parser qwen3_xml` y `--default-chat-template-kwargs '{"enable_thinking": false}'`. También puede cargarse con transformers. No se documentan llama.cpp, Ollama ni TGI.
- Integración agéntica: OpenEnv Harbor (`openenv harbor rollout`) contra un endpoint OpenAI-compatible, con el harness `opencode` y sandbox `hf-sandbox`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Eval / Test SmolDataEnvs | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B-SmolDataEnvs-SFT-500 | 2,21 B | no disponible | 33,3 % / 34,4 % | Apache 2.0 | Hugging Face |
| Qwen3.5-2B (base) | 2,21 B | no disponible | 7,6 % / 5,5 % | Apache 2.0 | Hugging Face |
| Qwen3.5-2B-SmolDataEnvs-SFT-1k | 2,21 B | no disponible | 32,6 % / 38,7 % | Apache 2.0 | Hugging Face |
| Qwen3.5-2B-SmolDataEnvs-SFT-full | 2,21 B | no disponible | 36,8 % / 38,7 % | Apache 2.0 | Hugging Face |
| Qwen3.5-397B-A17B (profesor) | 397 B (17 B activos) | no disponible | 71,5 % / 74,2 % | no disponible | Hugging Face |

## Limitaciones y advertencias

- Alrededor de una cuarta parte de las tareas terminan en un bucle de llamadas a herramientas que agota el tiempo límite de 10 minutos.
- Entrenado y evaluado en una única familia de tareas (análisis de datos sobre ficheros de Kaggle con OpenCode); otros agentes y tipos de tarea no se han probado.
- El propio autor indica que el modelo está pensado para pilotar un agente de código, no para conversar; su uso como chatbot general no está validado.
- Riesgo de alucinación en respuestas finales no verificado por el autor más allá de las tareas evaluadas; la puntuación depende del verificador de cada tarea.
- Sesgos conocidos: no disponibles.
- Limitaciones de idioma: no se documentan idiomas soportados.
- Licencia Apache 2.0, que permite uso comercial, pero sin garantías del autor sobre el comportamiento fuera del dominio de entrenamiento.
- El modelo se publicó con solo 7 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sergiopaniego/Qwen3.5-2B-SmolDataEnvs-SFT-500
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Modelo profesor: https://huggingface.co/Qwen/Qwen3.5-397B-A17B
- Dataset de trazas: https://huggingface.co/datasets/sergiopaniego/smoldataenvs-opencode-traces
- Dataset de evaluación SmolDataEnvs: https://huggingface.co/datasets/FineEnvs/SmolDataEnvs-harbor-eval
- Receta de entrenamiento (TRL): https://github.com/huggingface/trl/tree/main/examples/sft_agent_traces
- Curvas de entrenamiento (Trackio): https://huggingface.co/spaces/sergiopaniego/sft-agent-traces-trackio
- OpenCode: https://opencode.ai
- Variante SFT-1k: https://huggingface.co/sergiopaniego/Qwen3.5-2B-SmolDataEnvs-SFT-1k
- Variante SFT-full: https://huggingface.co/sergiopaniego/Qwen3.5-2B-SmolDataEnvs-SFT-full
