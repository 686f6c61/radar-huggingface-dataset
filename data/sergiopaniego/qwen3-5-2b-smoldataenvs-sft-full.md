# sergiopaniego/Qwen3.5-2B-SmolDataEnvs-SFT-full

## Resumen

Qwen3.5-2B-SmolDataEnvs-SFT-full es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen3.5-2B, desarrollado por Sergio Paniego y publicado bajo licencia Apache 2.0. El modelo está entrenado específicamente para actuar como motor de un agente de código (OpenCode) en tareas de análisis de datos: leer ficheros, ejecutar Python y SQL, y redactar una respuesta final. No está pensado como modelo conversacional general, sino como controlador de agente con soporte de tool calling.

El entrenamiento parte de 2.238 conversaciones generadas por el modelo profesor Qwen3.5-397B-A17B resolviendo tareas sobre datasets de Kaggle mediante OpenCode; solo se conservaron las trazas que terminaban con respuesta correcta. El resultado es un modelo de 2.213.241.664 parámetros (aproximadamente 2,2 mil millones) que, sobre tareas de análisis de datos, eleva la tasa de resolución del 7,6% del modelo base al 36,8% en el conjunto de evaluación y del 5,5% al 38,7% en el conjunto de test.

La relevancia de esta ficha radica en que demuestra que un modelo pequeño (2B) puede especializarse de forma útil como agente de tool use cuando se le proporcionan trazas de alta calidad generadas por un modelo mayor. El repositorio ocupa 8,9 GB y el modelo se distribuye en formato safetensors, con compatibilidad con transformers y endpoints OpenAI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; detalles internos no disponibles) |
| Parámetros totales | 2.213.241.664 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento usó secuencias de hasta 16k tokens) |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen3.5-2B, un transformer de la familia Qwen3.5. No se dispone de detalles adicionales sobre la arquitectura interna (número de capas, dimensión oculta, mecanismo de atención) más allá de lo que indica el modelo base. El pipeline declarado es image-text-to-text y la librería de referencia es transformers, con la etiqueta qwen3_5.

El entrenamiento se realizó con el `SFTTrainer` de TRL sobre el dataset `sergiopaniego/smoldataenvs-opencode-traces` (configuración `full`), que contiene una fila por tarea resuelta con la conversación completa del agente y las herramientas ofrecidas. Se aplicó pérdida únicamente sobre los turnos del asistente (`assistant_only_loss=True`, versión de entrenamiento de la plantilla Qwen3.5) en modo sin razonamiento (no-think). Se entrenaron 3 épocas con tasa de aprendizaje 1e-5 y decaimiento coseno, lotes de 8 secuencias de hasta 16k tokens, sobre una sola GPU H200. Las trazas provienen exclusivamente de tareas de entrenamiento cuyo dataset de Kaggle no respalda ninguna tarea de evaluación, evitando fuga de datos.

## Capacidades

- Generación de texto y razonamiento orientado a tareas de análisis de datos.
- Tool calling / function calling en formato compatible con agentes OpenAI (parser `qwen3_xml` en vLLM).
- Ejecución de flujos multi-paso: lectura de ficheros, ejecución de código Python y consultas SQL, y redacción de respuesta final.
- Integración con OpenCode como agente de código y con el harness de OpenEnv/Harbor.
- Modo sin razonamiento (no-think) como configuración de entrenamiento y de despliegue recomendada.
- Capacidades multimodales heredadas del modelo base (pipeline image-text-to-text), aunque no se documenta su uso en el entrenamiento.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Agente de análisis de datos sobre ficheros tabulares: el modelo puede recibir una tarea, inspeccionar ficheros CSV o datasets de Kaggle, ejecutar Python o SQL mediante herramientas y devolver una respuesta verificable. Es adecuado porque fue entrenado exactamente con ese flujo y ese conjunto de herramientas.
- Automatización de pipelines de exploración de datos: integrado con vLLM y un orquestador compatible con OpenAI, puede encadenar lecturas de ficheros, cálculos y respuestas para tareas repetitivas de análisis exploratorio.
- Evaluación de agentes en sandboxes: sirve como modelo de referencia ligero para probar harnesses como OpenEnv Harbor con sandbox de Hugging Face, gracias a su bajo coste de despliegue (2B parámetros).
- Prototipado de agentes de código especializados: al estar entrenado con trazas de OpenCode, puede usarse como sustituto económico de modelos mayores en entornos de desarrollo donde la tarea esté acotada al análisis de datos.
- Generación de respuestas verificables en entornos con verifier: su entrenamiento con solo trazas correctas lo hace adecuado para tareas donde existe una comprobación automática de corrección (por ejemplo, tests o validadores de resultado).
- Docencia e investigación sobre SFT de agentes: el modelo y su receta (generación de trazas, entrenamiento y evaluación con TRL) permiten reproducir el flujo completo en una sola GPU H200, lo que lo convierte en un caso de estudio práctico para investigar destilación de agentes.

## Benchmarks y rendimiento

Tasa de resolución de OpenCode sobre tareas de análisis de datos de SmolDataEnvs, en sandboxes de Hugging Face y puntuada por el verificador de cada tarea. Las tareas de evaluación (144) y de test (163 de 250) se construyen sobre datasets de Kaggle que ninguna traza de entrenamiento utilizó.

| Modelo | Trazas | Eval (144) | Test (163) |
|---|---|---|---|
| Qwen3.5-2B (base) | 0 | 7,6% | 5,5% |
| Qwen3.5-2B-SmolDataEnvs-SFT-500 | 473 | 33,3% | 34,4% |
| Qwen3.5-2B-SmolDataEnvs-SFT-1k | 963 | 32,6% | 38,7% |
| Qwen3.5-2B-SmolDataEnvs-SFT-full | 2.238 | 36,8% | 38,7% |
| Qwen3.5-397B-A17B (profesor) | — | 71,5% | 74,2% |

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (FP16/BF16): aproximadamente 4,4 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 6-8 GB en GPU.
- Cuantización a 8 bits: alrededor de 2,2 GB de pesos; a 4 bits: alrededor de 1,1 GB. No se han publicado versiones GGUF oficiales, por lo que la cuantización requeriría conversión propia.
- GPU recomendadas: H200 (usada en entrenamiento), A100 y H100 para despliegue de referencia; RTX 4090 y GPUs consumer con 8 GB o más de VRAM deberían poder alojar el modelo en BF16 o cuantizado.
- Cabe en GPU consumer: sí, en RTX 4090, RTX 3090 y tarjetas con al menos 8 GB de VRAM en BF16; en 4 bits cabría en GPUs con 4-6 GB.
- Opciones de despliegue: vLLM es la opción documentada por el autor, con `--enable-auto-tool-choice --tool-call-parser qwen3_xml` y `--default-chat-template-kwargs '{"enable_thinking": false}'`. También es compatible con transformers. No se documentan despliegues con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Eval SmolDataEnvs | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B-SmolDataEnvs-SFT-full | 2,2B | No disponible | 36,8% | Apache 2.0 | Hugging Face |
| Qwen3.5-2B (base) | 2,2B | No disponible | 7,6% | Apache 2.0 | Hugging Face |
| Qwen3.5-2B-SmolDataEnvs-SFT-1k | 2,2B | No disponible | 32,6% | Apache 2.0 | Hugging Face |
| Qwen3.5-397B-A17B (profesor) | 397B (17B activos) | No disponible | 71,5% | No disponible | Hugging Face |

## Limitaciones y advertencias

- Alrededor de una cuarta parte de las tareas terminan en un bucle de tool calling que agota el tiempo límite de 10 minutos.
- Entrenado y evaluado sobre una única familia de tareas (análisis de datos sobre ficheros de Kaggle con OpenCode); otros agentes y tipos de tarea no han sido probados.
- No está pensado para conversación general: su uso previsto es como motor de agente, no como chatbot.
- Riesgo de alucinación en respuestas finales cuando las herramientas no devuelven información suficiente; no se documentan evaluaciones específicas de fidelidad.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no disponibles; el entrenamiento se realizó sobre trazas en el idioma del dataset, no especificado.
- Licencia Apache 2.0, permisiva para uso comercial, pero sin garantías del autor sobre el rendimiento en producción.
- El modelo hereda las limitaciones del Qwen3.5-2B base, incluidas las restricciones de contexto y de idioma no documentadas en esta ficha.
- El modo recomendado es no-think; el comportamiento en modo razonamiento no está validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sergiopaniego/Qwen3.5-2B-SmolDataEnvs-SFT-full
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Modelo profesor: https://huggingface.co/Qwen/Qwen3.5-397B-A17B
- Dataset de trazas: https://huggingface.co/datasets/sergiopaniego/smoldataenvs-opencode-traces
- Dataset de evaluación: https://huggingface.co/datasets/FineEnvs/SmolDataEnvs-harbor-eval
- Receta de entrenamiento (TRL): https://github.com/huggingface/trl/tree/main/examples/sft_agent_traces
- Curvas de entrenamiento (Trackio): https://huggingface.co/spaces/sergiopaniego/sft-agent-traces-trackio
- OpenCode: https://opencode.ai
- Variante SFT-500: https://huggingface.co/sergiopaniego/Qwen3.5-2B-SmolDataEnvs-SFT-500
- Variante SFT-1k: https://huggingface.co/sergiopaniego/Qwen3.5-2B-SmolDataEnvs-SFT-1k
