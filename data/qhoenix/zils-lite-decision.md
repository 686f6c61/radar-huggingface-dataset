# qhoenix/zils-lite-decision

## Resumen

zils-lite-decision es un modelo de decisión especializado de tipo "d3-lite", desarrollado por el usuario qhoenix para el pool lite de la subnet 127 de Zils. Se construye sobre la familia Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 853 millones de parámetros, y se distribuye como un ajuste fino orientado a tareas de extracción y clasificación de decisiones más que a generación de texto abierta.

El modelo se obtiene mediante LoRA fine-tuning sobre un promedio uniforme de pesos de tres modelos de decisión previos (vllm-sr/d3-lite, Maincode/Matilda-Decision-v1-Edge y cribl-ai/cribl-decision-2-0.8B, todos Apache-2.0), entrenado con datos públicos de estilo decisión (splits de entrenamiento de datasets de clasificación, NLI y QA, además de eventos públicos resueltos). Posteriormente, el resultado del ajuste se promedia al 50/50 con el promedio base, una técnica de interpolación de pesos que busca preservar estabilidad del modelo original.

Su relevancia es acotada y muy específica: no es un modelo generalista, sino un componente de decisión dentro de una infraestructura concreta (subnet 127 de Zils). Con 852.985.920 parámetros reales en safetensors y un repositorio de 1,7 GB, está pensado para despliegues ligeros donde la tarea principal es la extracción de features y la toma de decisiones estructuradas, no la conversación ni la generación creativa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-0.8B), con `custom_code` |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Qwen/Qwen3.5-0.8B, un transformer denso de aproximadamente 0,85 mil millones de parámetros. La model card indica que requiere `custom_code` en la librería transformers, lo que implica que la definición del modelo no es completamente estándar y depende del código remoto publicado en el repositorio o de una versión específica de la librería. El pipeline declarado es `feature-extraction`, lo que sugiere que su uso principal es producir representaciones internas o puntuaciones de decisión, no secuencias de texto.

El entrenamiento se realizó en dos fases: primero, un promedio uniforme de los pesos de tres modelos de decisión Apache-2.0 (vllm-sr/d3-lite, Maincode/Matilda-Decision-v1-Edge y cribl-ai/cribl-decision-2-0.8B); segundo, un ajuste fino LoRA sobre datos públicos de estilo decisión, que incluyen splits de entrenamiento de datasets de clasificación, NLI y QA, así como eventos públicos resueltos. Finalmente, el modelo resultante se promedia al 50/50 con el promedio base inicial, una técnica de interpolación de pesos (model averaging) que suele mejorar la robustez y reducir el olvido catastrófico en ajustes finos pequeños. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Extracción de features y representaciones para tareas de decisión estructurada.
- Clasificación y etiquetado sobre datos de tipo decisión, NLI y QA, según los datos de entrenamiento declarados.
- Toma de decisiones binarias o multiclase dentro del pipeline de la subnet Zils.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües no disponibles (no se declaran idiomas).
- No se documentan modos especiales como thinking mode, visión o audio.

## Casos de uso

- Clasificación de eventos en la subnet 127 de Zils: el modelo actúa como "decision body" del pool lite, evaluando eventos públicos resueltos y emitiendo una decisión estructurada; su tamaño de 0,85 B permite ejecutarlo en el borde o en infraestructura de bajo coste.
- Filtrado y triaje de candidatos en pipelines de datos: al estar entrenado con splits de clasificación y NLI, puede usarse para etiquetar pares de texto o descartar candidatos irrelevantes antes de pasarlos a un modelo mayor.
- Extracción de features para sistemas de ranking: el pipeline `feature-extraction` permite obtener embeddings o puntuaciones intermedias que alimenten un clasificador o un sistema de decisión posterior.
- Evaluación de QA en entornos de recursos limitados: su tamaño reducido (1,7 GB en safetensors) permite desplegarlo en contenedores pequeños o en CPU para tareas de verificación de respuestas.
- Componente de decisión en sistemas multiagente: puede usarse como "juez" ligero que valide o rechace las salidas de un agente mayor, reduciendo el coste de llamadas a modelos grandes.
- Prototipado rápido de clasificadores de decisión: al ser Apache-2.0 y de tamaño pequeño, sirve como base para ajustes finos adicionales en dominios específicos sin necesidad de GPUs de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (852.985.920 parámetros), en FP16 requeriría aproximadamente 1,7 GB de pesos más overhead de activaciones y contexto, y en cuantización de 8 bits alrededor de 0,9 GB.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer moderna (RTX 3060 en adelante) debería poder alojarlo en FP16.
- Cabe en GPU consumer: sí, previsiblemente en GPUs con 4 GB o más de VRAM en FP16, aunque no se confirma oficialmente.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por el tag `custom_code`); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| qhoenix/zils-lite-decision | 852.985.920 | no disponible | Apache-2.0 | Especializado en decisión, derivado de Qwen3.5-0.8B |
| Qwen/Qwen3.5-0.8B | ~0,8 B (no confirmado) | no disponible | no disponible | Modelo base generalista |
| vllm-sr/d3-lite | no disponible | no disponible | Apache-2.0 | Componente del promedio de pesos |
| Maincode/Matilda-Decision-v1-Edge | no disponible | no disponible | Apache-2.0 | Componente del promedio de pesos |
| cribl-ai/cribl-decision-2-0.8B | ~0,8 B (por nombre) | no disponible | Apache-2.0 | Componente del promedio de pesos |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en decisión y extracción de features; no está diseñado como asistente conversacional ni para generación de texto abierta.
- No se declaran idiomas soportados, por lo que el comportamiento multilingüe es desconocido.
- Riesgo de alucinación y de sesgos heredados de los datasets públicos de clasificación, NLI y QA utilizados en el entrenamiento; no se documenta ninguna mitigación.
- Requiere `custom_code` y `trust_remote_code=True`, lo que implica ejecutar código remoto del repositorio; conviene auditar dicho código antes de usarlo en producción.
- La licencia Apache-2.0 permite uso comercial, pero deben respetarse las atribuciones de los modelos upstream indicadas en LICENSE y NOTICE.
- No se documentan la longitud de contexto ni los tipos de cuantización, lo que dificulta planificar despliegues con requisitos estrictos de memoria.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de su calidad o estabilidad en producción.
- Al ser un promedio de pesos con interpolación 50/50, el comportamiento puede desviarse del modelo base en tareas generales; se recomienda evaluarlo en el dominio concreto antes de adoptarlo.

## Enlaces

- HuggingFace: https://huggingface.co/qhoenix/zils-lite-decision
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Componente upstream: https://huggingface.co/vllm-sr/d3-lite
- Componente upstream: https://huggingface.co/Maincode/Matilda-Decision-v1-Edge
- Componente upstream: https://huggingface.co/cribl-ai/cribl-decision-2-0.8B
