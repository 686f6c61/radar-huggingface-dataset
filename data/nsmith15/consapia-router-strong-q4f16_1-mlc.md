# Nsmith15/consapia-router-strong-q4f16_1-MLC

## Resumen

consapia-router-strong-q4f16_1-MLC es un modelo de lenguaje especializado en el enrutamiento de consultas, desarrollado por Consapia como un ajuste fino (fine-tuning) de microsoft/Phi-4-mini-instruct. Su función concreta es descomponer una pregunta del usuario en entre 2 y 6 sub-tareas y devolverlas estructuradas como un plan en formato JSON, lo que lo convierte en un componente de orquestación para sistemas de agentes y pipelines de razonamiento multi-paso.

El modelo se distribuye en formato MLC (Machine Learning Compilation) con cuantización de 4 bits `q4f16_1`, empaquetado específicamente para su uso con WebLLM, la librería que permite ejecutar modelos de lenguaje directamente en el navegador mediante WebGPU. El repositorio ocupa 2,2 GB y reutiliza la librería compilada oficial de WebLLM para `Phi-4-mini-instruct-q4f16_1-MLC`, lo que simplifica su despliegue en el cliente.

La relevancia de este modelo radica en su enfoque de nicho: en lugar de competir como modelo generalista, actúa como un router ligero que alimenta a otros modelos o herramientas en arquitecturas de agentes. Al derivar de Phi-4-mini-instruct, hereda la arquitectura y el tamaño compacto del modelo base de Microsoft, aunque el autor no documenta parámetros ni contexto específicos en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Phi-4-mini-instruct) |
| Parametros totales | no disponible (el modelo base Phi-4-mini-instruct tiene 3,8 mil millones, pero no se confirma en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4f16_1 (4 bits, formato MLC) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | MLC (mlc-llm), compatible con WebLLM |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de microsoft/Phi-4-mini-instruct, un transformer decoder-only de la familia Phi-4 de Microsoft. La model card no detalla el proceso de entrenamiento: no se especifica el número de tokens, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá de la cuantización q4f16_1 propia de MLC.

La contribución técnica principal es el empaquetado para WebLLM: el modelo utiliza la librería compilada oficial de `Phi-4-mini-instruct-q4f16_1-MLC`, lo que permite ejecutarlo en el navegador con WebGPU sin necesidad de recompilar. El ajuste fino se orienta a una tarea concreta de generación estructurada: dado un input, producir un plan JSON con entre 2 y 6 sub-tareas. Los cambios respecto al modelo base se describen en el archivo `NOTICE` del repositorio.

## Capacidades

- Descomposición de consultas: divide una pregunta en 2-6 sub-tareas y las devuelve como un plan en JSON.
- Generación estructurada: salida en formato JSON, adecuada para consumo programático por parte de orquestadores de agentes.
- Razonamiento multi-paso: planificación de tareas encadenadas a partir de una consulta compleja.
- Ejecución en navegador: compatible con WebLLM y WebGPU, sin servidor backend.
- Capacidades heredadas de Phi-4-mini-instruct: generación de texto general, razonamiento y código (no verificadas específicamente para este ajuste).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Orquestación de agentes en el navegador: el modelo puede actuar como router que recibe la consulta del usuario y genera un plan JSON de sub-tareas que un orquestador ejecuta secuencialmente contra herramientas o modelos especializados, todo ello sin salir del cliente gracias a WebLLM.
- Aplicaciones web sin backend de inferencia: al ejecutarse con WebLLM y WebGPU, permite integrar planificación de tareas en aplicaciones estáticas o de bajo coste operativo, donde no se desea mantener infraestructura de GPU en servidor.
- Descomposición de consultas para RAG: en un pipeline de recuperación aumentada, el router divide una pregunta compleja en sub-consultas que se lanzan contra un índice vectorial, mejorando la cobertura de recuperación.
- Asistentes de productividad en el navegador: planificación de tareas paso a paso para asistentes que operan sobre documentos o APIs del lado del cliente, con la ventaja de que los datos no abandonan el dispositivo.
- Prototipado rápido de arquitecturas de agentes: al ser un modelo ligero en formato MLC, permite iterar sobre diseños de orquestación en local o en el navegador antes de escalar a modelos mayores en servidor.
- Enrutamiento en sistemas multi-modelo: el plan JSON generado puede indicar qué sub-tareas requieren un modelo mayor (por ejemplo, uno de razonamiento o de código) y cuáles pueden resolverse con modelos pequeños, optimizando costes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 2,2 GB, correspondiente a los pesos cuantizados q4f16_1 en formato MLC.
- Al ejecutarse mediante WebLLM, requiere un navegador con soporte de WebGPU (Chrome, Edge y otros navegadores basados en Chromium con WebGPU habilitado).
- VRAM estimada: no disponible de forma explícita; por el tamaño del repositorio y la cuantización de 4 bits, el modelo está pensado para GPUs de consumo integradas o dedicadas que soporten WebGPU.
- GPU recomendadas: no disponible en la información proporcionada.
- Despliegue: WebLLM (principal), y por extensión el ecosistema MLC-LLM.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| consapia-router-strong-q4f16_1-MLC | no disponible | no disponible | MLC (WebLLM) | MIT | Router de consultas en JSON |
| microsoft/Phi-4-mini-instruct | 3,8 mil millones (modelo base) | no disponible | safetensors, GGUF, etc. | MIT | Modelo generalista |
| Phi-4-mini-instruct-q4f16_1-MLC | 3,8 mil millones (modelo base) | no disponible | MLC (WebLLM) | MIT | Modelo generalista en navegador |

La comparativa directa con otros routers especializados no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el ajuste fino está orientado a generar planes JSON de 2-6 sub-tareas; su rendimiento en tareas generales de conversación o generación libre no está documentado y puede degradarse respecto al modelo base.
- Salida estructurada frágil: al depender de JSON, el consumidor debe validar y manejar posibles salidas malformadas o fuera del rango de 2-6 sub-tareas.
- Idiomas no documentados: la model card no especifica qué idiomas soporta el ajuste fino; no se garantiza un rendimiento multilingüe.
- Contexto no documentado: se desconoce la longitud de contexto efectiva, lo que limita la planificación de entradas largas.
- Riesgo de alucinación: heredado del modelo base; en la generación de planes puede inventar sub-tareas no justificadas por la consulta.
- Licencia MIT: permite uso comercial, pero se recomienda revisar el archivo `NOTICE` para conocer los cambios respecto al modelo base y las condiciones de atribución.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la ficha, sin evidencia de uso en producción ni validación externa.
- Dependencia de WebGPU: el despliegue en navegador requiere hardware y navegador compatibles; no es adecuado para entornos sin soporte de WebGPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nsmith15/consapia-router-strong-q4f16_1-MLC
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- WebLLM: https://github.com/mlc-ai/web-llm
- MLC-LLM: https://github.com/mlc-ai/mlc-llm
- Consapia: no disponible
