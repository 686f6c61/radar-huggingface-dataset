# sergiopaniego/Qwen3.5-2B-SmolDataEnvs-SFT-1k

## Resumen

Qwen3.5-2B-SmolDataEnvs-SFT-1k es un ajuste fino (SFT) del modelo base Qwen3.5-2B de Alibaba Qwen, publicado por el desarrollador independiente sergiopaniego. El modelo está entrenado específicamente para actuar como motor de un agente de código (OpenCode) en tareas de análisis de datos: leer ficheros, ejecutar Python y SQL y redactar una respuesta final. No es un modelo conversacional generalista; su propósito declarado es "drive a coding agent, not to chat".

El ajuste se realizó con el `SFTTrainer` de TRL sobre 963 conversaciones generadas por Qwen3.5-397B-A17B (el modelo profesor) resolviendo tareas de análisis de datos sobre ficheros de Kaggle. Solo se conservaron las trazas que terminaban con respuesta correcta. El resultado es un modelo de 2.213 millones de parámetros que eleva la tasa de resolución de tareas de OpenCode del 7,6% del modelo base al 32,6% en el conjunto de evaluación y al 38,7% en el de test.

Su relevancia radica en demostrar que un ajuste fino pequeño y dirigido, con datos de trazas de agente filtrados por corrección, puede multiplicar por más de cuatro la capacidad agéntica de un modelo de 2B. La receta completa (generación de trazas, entrenamiento y evaluación) está publicada como ejemplo en el repositorio de TRL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; multimodal image-text-to-text segun pipeline de HF) |
| Parametros totales | 2.213.241.664 (2,21B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento usó secuencias de hasta 16k tokens) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se listan GGUF ni cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B, un transformer de la familia Qwen3.5 con capacidades multimodales (el pipeline declarado en Hugging Face es image-text-to-text). El ajuste fino se realizó con el `SFTTrainer` de TRL, aplicando pérdida únicamente sobre los turnos del asistente (`assistant_only_loss=True`, la versión de entrenamiento de la plantilla de chat de Qwen3.5) y en modo "no-think" (sin modo de razonamiento extendido).

Los datos de entrenamiento provienen del dataset `sergiopaniego/smoldataenvs-opencode-traces`, configuración `1k`: una fila por tarea resuelta, con la conversación completa del agente (`messages`) y las herramientas ofrecidas (`tools`). Las trazas se generaron con Qwen3.5-397B-A17B actuando como agente OpenCode y solo se conservaron las que terminaban en respuesta correcta. Las trazas proceden exclusivamente de tareas de entrenamiento cuyo dataset de Kaggle no respalda ninguna tarea de evaluación, para evitar contaminación. El entrenamiento usó 3 épocas, tasa de aprendizaje 1e-5 con decaimiento coseno, lotes de 8 secuencias de hasta 16k tokens y una GPU H200.

## Capacidades

- Ejecución de tareas de análisis de datos como agente: lectura de ficheros, ejecución de código Python y consultas SQL, y redacción de una respuesta final.
- Tool calling / function calling: el modelo está entrenado con las herramientas ofrecidas por OpenCode y sirve para agentes compatibles con OpenAI (parser `qwen3_xml` en vLLM).
- Razonamiento multi-paso agéntico: encadena llamadas a herramientas hasta completar la tarea.
- Capacidad multimodal heredada del modelo base (pipeline image-text-to-text), aunque el entrenamiento se centra en tareas de datos sobre ficheros.
- Modo "no-think" forzado en el entrenamiento; el modo de razonamiento extendido no forma parte del ajuste.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agente de análisis de datos sobre ficheros tabulares: el modelo puede recibir un CSV o un conjunto de ficheros de Kaggle, inspeccionarlos con Python, ejecutar agregaciones y devolver una respuesta verificable. Es su caso de uso principal y el único validado en la evaluación.
- Automatización de informes exploratorios: integrado en un pipeline con OpenCode, puede leer un dataset, calcular estadísticas descriptivas y redactar un resumen, reduciendo el trabajo manual de primer análisis.
- Consultas SQL asistidas: entrenado con ejecución de SQL dentro del bucle agéntico, puede traducir preguntas en lenguaje natural a consultas, ejecutarlas y validar el resultado antes de responder.
- Evaluación de agentes y entornos: sirve como modelo de referencia pequeño para probar arneses de agente (Harbor/OpenEnv) y verificar canalizaciones de tool calling con vLLM.
- Prototipado de agentes de código en local: con 2,2B parámetros y licencia Apache-2.0, permite desplegar un agente funcional en hardware modesto para experimentación.
- Generación de datos sintéticos de trazas: puede usarse como generador barato de conversaciones agénticas para filtrar y ampliar datasets de entrenamiento, aunque con menor tasa de éxito que el profesor.

## Benchmarks y rendimiento

Tasa de resolución de tareas de análisis de datos de SmolDataEnvs con OpenCode en sandboxes de Hugging Face, puntuada por el verificador de cada tarea. Las 144 tareas de evaluación y 163 de las 250 de test se basan en datasets de Kaggle que ninguna traza de entrenamiento utilizó.

| Modelo | Trazas | Eval (144) | Test (163) |
|---|---|---|---|
| Qwen3.5-2B (base) | 0 | 7,6% | 5,5% |
| Qwen3.5-2B-SmolDataEnvs-SFT-500 | 473 | 33,3% | 34,4% |
| Qwen3.5-2B-SmolDataEnvs-SFT-1k (este modelo) | 963 | 32,6% | 38,7% |
| Qwen3.5-2B-SmolDataEnvs-SFT-full | 2.238 | 36,8% | 38,7% |
| Qwen3.5-397B-A17B (profesor) | — | 71,5% | 74,2% |

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 4,4 GB solo para pesos (2,21B parámetros), más overhead de KV cache y activaciones; en la práctica, entre 6 y 10 GB según longitud de contexto.
- Cuantización a 8 bits: alrededor de 2,2 GB de pesos; a 4 bits: alrededor de 1,2 GB. No se publican ficheros GGUF en el repositorio.
- GPU recomendadas: H200 (usada en el entrenamiento), A100 o H100 para servir con vLLM a concurrencia alta; RTX 4090, RTX 3090 o incluso GPUs de 8 GB para inferencia en bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más en bf16; en 4 bits cabría en GPUs de 4-6 GB.
- Opciones de despliegue: vLLM es la opción documentada por el autor (`vllm serve ... --enable-auto-tool-choice --tool-call-parser qwen3_xml --default-chat-template-kwargs '{"enable_thinking": false}'`); también es compatible con transformers. No se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Eval SmolDataEnvs | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B-SmolDataEnvs-SFT-1k | 2,21B | No disponible | 32,6% | Apache-2.0 | Hugging Face |
| Qwen3.5-2B (base) | 2,21B | No disponible | 7,6% | Apache-2.0 | Hugging Face |
| Qwen3.5-2B-SmolDataEnvs-SFT-full | 2,21B | No disponible | 36,8% | Apache-2.0 | Hugging Face |
| Qwen3.5-397B-A17B (profesor, MoE) | 397B totales / 17B activos | No disponible | 71,5% | No disponible | Hugging Face |

## Limitaciones y advertencias

- Alrededor de una cuarta parte de las tareas terminan en un bucle de llamadas a herramientas que agota el tiempo límite de 10 minutos.
- Entrenado y evaluado en una única familia de tareas (análisis de datos sobre ficheros de Kaggle con OpenCode); otros agentes y tipos de tarea no han sido probados.
- No es un modelo conversacional: el autor indica explícitamente que está pensado para pilotar un agente de código, no para chatear.
- El modo de razonamiento (thinking) no forma parte del ajuste; el despliegue recomendado lo desactiva.
- Riesgo de alucinación en las respuestas finales no cuantificado en la información disponible.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; el ajuste se realizó sobre trazas en el idioma del dataset, sin especificar.
- Licencia Apache-2.0, que permite uso comercial, pero el modelo hereda las limitaciones y posibles sesgos del modelo base Qwen3.5-2B.
- El repositorio tiene un tamaño de 8,9 GB, superior al de los pesos en bf16 (unos 4,4 GB), probablemente por artefactos de entrenamiento incluidos; conviene verificar qué ficheros se descargan.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sergiopaniego/Qwen3.5-2B-SmolDataEnvs-SFT-1k
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Modelo profesor: https://huggingface.co/Qwen/Qwen3.5-397B-A17B
- Variante SFT-500: https://huggingface.co/sergiopaniego/Qwen3.5-2B-SmolDataEnvs-SFT-500
- Variante SFT-full: https://huggingface.co/sergiopaniego/Qwen3.5-2B-SmolDataEnvs-SFT-full
- Dataset de trazas: https://huggingface.co/datasets/sergiopaniego/smoldataenvs-opencode-traces
- Dataset de evaluación: https://huggingface.co/datasets/FineEnvs/SmolDataEnvs-harbor-eval
- Receta de entrenamiento en TRL: https://github.com/huggingface/trl/tree/main/examples/sft_agent_traces
- Curvas de entrenamiento (Trackio): https://huggingface.co/spaces/sergiopaniego/sft-agent-traces-trackio
- OpenCode: https://opencode.ai
