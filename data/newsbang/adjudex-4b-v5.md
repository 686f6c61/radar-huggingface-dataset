# newsbang/adjudex-4b-v5

## Resumen

Adjudex 4B v5 es un modelo de decisión tipado desarrollado por newsbang, un fine-tuning de Qwen3.5-4B (revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`) con 4.539 millones de parámetros totales. Su función no es la generación de texto libre, sino la evaluación de decisiones: recibe un `state` y un conjunto de `questions` tipadas con opciones múltiples (hasta 255 alternativas) y devuelve una probabilidad calibrada para cada opción. Se distribuye bajo licencia Apache 2.0 con pesos en safetensors y código de servicio personalizado.

El modelo está pensado como motor de decisión ("decider") para pipelines que requieren seleccionar entre alternativas discretas de forma determinista y probabilística: enrutamiento de herramientas, clasificación de intenciones, selección de recuperadores o adjudicación de respuestas. Frente a un LLM generativo convencional, Adjudex expone una cabeza de decisión BF16 de forma `[255, hidden]` que produce una distribución de probabilidad sobre el espacio de opciones, lo que facilita la integración en sistemas con lógica de umbrales y calibración explícita.

Su relevancia actual radica en la popularización de los modelos "decider" (inspirados en Perplexity Decider) como componentes especializados dentro de arquitecturas agénticas, donde la latencia y la fiabilidad de la selección importan más que la generación. La model card reporta un Decision Index 0.3 de 67,41 sobre un conjunto público de 140.620 peticiones, con el modelo servido en BF16 sobre una A800 de 80 GB por proceso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3_5Model) con atención no causal en las capas de atención completa y last-token pooling |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (límite del servidor; por encima devuelve HTTP 422) |
| Tipos de cuantizacion | BF16 (referencia de evaluación); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`readout.safetensors` + pesos del backbone), configuración en `decision_config.json` |

## Arquitectura y entrenamiento

El backbone es `Qwen3_5Model` con atención no causal en las capas de atención completa y pooling sobre el último token. Sobre esa representación se aplica una cabeza de decisión BF16 de dimensiones `[255, hidden]`, almacenada en `readout.safetensors`, que proyecta el estado latente sobre el espacio de hasta 255 opciones. El fichero `decision_config.json` contiene los códigos de opción, la temperatura de calibración y los hashes de procedencia, lo que sugiere un proceso de calibración post-entrenamiento para ajustar las probabilidades emitidas.

No se han publicado en la información disponible detalles sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o supervisión específica para la tarea de decisión. La model card tampoco documenta innovaciones adicionales como decodificación especulativa o atención lineal más allá del cambio a atención no causal en las capas completas. El código de servicio se hereda sin modificaciones de `perplexity-ai/pplx-decider-v1.1-27b` (Apache 2.0), según indica el aviso NOTICE.

## Capacidades

- Decisión tipada: recibe un `state` y `questions` con hasta 255 opciones y devuelve una probabilidad por opción.
- Clasificación de texto en sentido amplio, dado que el pipeline declarado es `text-classification`.
- Selección de herramientas y enrutamiento (la dimensión Tools obtiene 87,28 en el Decision Index).
- Recuperación y elección entre candidatos (Retrieval: 69,90).
- Razonamiento sobre conocimiento (Knowledge: 50,52) y habilidades lingüísticas (Language: 71,87).
- Evaluación en dominios creativos o artísticos (Arts: 58,26).
- Servicio HTTP mediante el servidor `/v1/systemone` incluido, con endpoint compatible con el motor `http` del kit de evaluación.
- No se documentan capacidades de visión, audio, tool calling generativo ni modo "thinking"; el modelo no genera texto libre, sino distribuciones de probabilidad sobre opciones.

## Casos de uso

- Enrutamiento de herramientas en agentes: dado el estado de la conversación y un catálogo de herramientas como opciones, el modelo devuelve la probabilidad de cada una; su puntuación de 87,28 en Tools lo hace adecuado para seleccionar la herramienta correcta antes de invocar el LLM generativo.
- Clasificación de intenciones en atención al cliente: con un `state` que resume el historial y opciones que representan intenciones predefinidas, se obtiene una distribución calibrada que permite aplicar umbrales y derivar a un humano cuando la confianza es baja.
- Selección de documentos en pipelines RAG: dado un estado con la consulta y las opciones como candidatos recuperados, el modelo puntúa cada documento (Retrieval: 69,90) para reordenar o filtrar antes de la generación.
- Adjudicación de respuestas (A/B testing de salidas): con dos o más respuestas candidatas como opciones, el modelo asigna probabilidades que permiten elegir la mejor sin un LLM juez generativo, reduciendo coste y latencia.
- Control de calidad y moderación por categorías: clasificación de contenido en un conjunto cerrado de etiquetas con calibración explícita vía temperatura, útil para sistemas que requieren trazabilidad de la decisión.
- Evaluación automática de pipelines: el propio modelo puede actuar como componente del kit de evaluación (motor `http`) para medir el rendimiento de otros sistemas sobre preguntas de opción múltiple.
- Enrutamiento multi-modelo: decidir qué modelo o endpoint atenderá una petición según el estado, aprovechando la cabeza de 255 opciones para cubrir un catálogo amplio de destinos.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el Decision Index 0.3 (suite pública, ejecución completa con `"complete": true`, 140.620 peticiones):

| Area | Skill |
|---|---:|
| Knowledge | 50,52 |
| Language | 71,87 |
| Retrieval | 69,90 |
| Tools | 87,28 |
| Arts | 58,26 |
| Decision Index 0.3 | 67,41 (raw 75,41) |

Notas sobre la ejecución: 345 peticiones (311 ToolRet, 25 POP909-CL, 6 BRIGHT, 2 API-Bank, 1 HLE) contienen una rama de pregunta que supera el límite de 8.192 tokens; el servidor las rechaza con HTTP 422 sin truncar y cuentan como incorrectas. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 9,1 GB para los pesos (tamaño del repo) más overhead de activaciones y del servidor; en la práctica la referencia usa una A800 de 80 GB por proceso de servidor.
- GPU recomendadas: A800 80 GB (configuración validada en la evaluación), H100 o A100 para despliegues de producción con concurrencia.
- GPU de consumo: con 4.539 millones de parámetros, en BF16 cabría teóricamente en GPUs de 16-24 GB (RTX 4090, RTX 4080), aunque no se documenta ni valida esta configuración; se desconoce el soporte de cuantización a 8 o 4 bits.
- Despliegue: servidor incluido `/v1/systemone` (código de `perplexity-ai/pplx-decider-v1.1-27b`), arrancado con `python -m autojev.server` y variables `AUTOJEV_CHECKPOINT`, `AUTOJEV_HOST` y `PORT`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la model card solo indica BF16 sobre CUDA con longitud máxima de 8.192 y un proceso de servidor por A800.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Adjudex 4B v5 | 4.539 M | 8.192 | Decider tipado sobre Qwen3.5-4B | Apache 2.0 | Hugging Face (newsbang/adjudex-4b-v5) |
| Qwen3.5-4B (base) | ~4B | no disponible | LLM generativo | no disponible en esta ficha | Hugging Face (Qwen/Qwen3.5-4B) |
| Perplexity Decider v1.1 27B | 27B | no disponible | Decider de referencia (código reutilizado) | Apache 2.0 | Hugging Face (perplexity-ai/pplx-decider-v1.1-27b) |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada; la comparación se limita a parámetros, contexto, licencia y enfoque.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, solo distribuciones de probabilidad sobre opciones; no debe emplearse como LLM conversacional.
- Límite estricto de 8.192 tokens: las peticiones que exceden el límite se rechazan con HTTP 422 sin truncar y cuentan como error en la evaluación (345 casos en la suite).
- Idiomas soportados no documentados; no hay garantías de rendimiento multilingüe más allá de la evaluación reportada.
- Riesgo de calibración deficiente fuera de la distribución de la suite pública; la temperatura de calibración está fijada en `decision_config.json` y no se documenta su validación en dominios ajenos.
- Puntuaciones bajas en Knowledge (50,52) y Arts (58,26) en el Decision Index, lo que sugiere menor fiabilidad en dominios de conocimiento factual y creativo.
- Sin datos publicados sobre sesgos, alucinación (en el sentido de decisiones incorrectas con alta confianza) ni robustez ante entradas adversarias.
- Licencia Apache 2.0 permite uso comercial, pero el código de servicio proviene de `perplexity-ai/pplx-decider-v1.1-27b` y debe respetarse el NOTICE correspondiente.
- Requiere ejecutar código personalizado (`custom-code`, `autojev.server`); auditar el repositorio antes de desplegar en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/newsbang/adjudex-4b-v5
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Código de servicio de referencia: https://huggingface.co/perplexity-ai/pplx-decider-v1.1-27b
