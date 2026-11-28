# hadeis/customer-support-qwen25-3b-sft-v3

## Resumen

`hadeis/customer-support-qwen25-3b-sft-v3` es un ajuste fino por supervisión (SFT) del modelo `unsloth/Qwen2.5-3B-Instruct-unsloth-bnb-4bit`, que a su vez deriva de Qwen2.5-3B-Instruct de Alibaba. El autor, identificado en Hugging Face como `hadeis`, lo publica como un modelo especializado en atención al cliente, entrenado con TRL sobre la infraestructura de Unsloth. Se trata, por tanto, de un modelo pequeño (3.000 millones de parámetros) orientado a despliegues con requisitos de hardware modestos y a tareas conversacionales de dominio acotado.

La relevancia de esta ficha es limitada pero útil como referencia: ilustra el flujo habitual de adaptación de un modelo instructivo pequeño mediante SFT con Unsloth y TRL, un patrón muy extendido para prototipos de asistentes verticales. El repositorio ocupa 0,4 GB, lo que sugiere pesos en safetensors y posiblemente en precisión reducida, aunque la model card no detalla el formato exacto ni el conjunto de datos de entrenamiento.

La información publicada es escasa: no se especifican licencia, idiomas, datos de entrenamiento, hiperparámetros ni resultados de evaluación. Cualquier uso en producción debería ir precedido de una evaluación propia sobre el dominio objetivo y de una verificación de la licencia heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-3B-Instruct) |
| Parametros totales | 3.000 millones (aproximado, segun el modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Qwen2.5-3B-Instruct soporta hasta 32.768 tokens, segun la documentacion de Qwen) |
| Tipos de cuantizacion | no disponible (el modelo base de partida estaba cuantizado en bnb-4bit para el entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica `licence: license` sin especificar) |
| Formato de pesos | safetensors (tag de la libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen2.5-3B-Instruct-unsloth-bnb-4bit`, una versión del Qwen2.5-3B-Instruct de Alibaba optimizada por Unsloth para entrenamiento eficiente con cuantización de 4 bits (bitsandbytes). Sobre esa base se aplicó un ajuste fino supervisado (SFT) con TRL 1.15.0, Transformers 5.17.0, PyTorch 2.11.0+cu130 y Datasets 4.8.5. El entrenamiento se monitorizó con Weights & Biases (run `1e1t10zy` en el proyecto `vsrivastava-dev-srm-institute-of-science-and-technology/huggingface`).

No se publican detalles sobre el número de tokens de entrenamiento, la composición del dataset, la presencia de RLHF/DPO posterior ni hiperparámetros como learning rate, batch size o número de épocas. Tampoco se documenta si se aplicaron técnicas de decodificación especulativa, atención lineal u otras innovaciones. La arquitectura subyacente es la de Qwen2.5, un transformer decoder-only con atención causal estándar, RoPE y normalización RMSNorm, pero la model card no aporta confirmación explícita de estos detalles para este ajuste concreto.

## Capacidades

- Generación de texto conversacional en el dominio de atención al cliente, presumiblemente adaptada al estilo de las respuestas del dataset de SFT.
- Razonamiento y respuesta a preguntas de carácter general, heredados del modelo base Qwen2.5-3B-Instruct.
- Soporte de conversaciones multi-turno mediante el formato de chat de Qwen2.5 (roles `user`/`assistant`), tal como muestra el ejemplo de `pipeline` de la model card.
- Capacidad de generación de código y matemáticas básicas, heredada del modelo base, aunque no se ha verificado tras el ajuste.
- Soporte de tool calling / function calling: no disponible en la información proporcionada (el modelo base Qwen2.5-Instruct lo soporta, pero no se confirma para este ajuste).
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no documentadas; el modelo base Qwen2.5 es multilingüe, pero el ajuste puede haber reducido el rendimiento en idiomas distintos del usado en el dataset de SFT.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- **Atención al cliente automatizada de primer nivel**: el modelo puede gestionar conversaciones multi-turno con el formato de chat de Qwen2.5 y responder a preguntas frecuentes, siempre que el dataset de SFT haya cubierto ese dominio. Su tamaño de 3B permite desplegarlo en una sola GPU consumer.
- **Prototipado rápido de asistentes verticales**: al ser un ajuste SFT ligero (0,4 GB de pesos), sirve como base para iterar sobre datasets propios de un dominio concreto antes de escalar a modelos mayores.
- **Clasificación y enrutamiento de tickets**: puede usarse para reformular o categorizar consultas de clientes en un pipeline previo a un sistema de ticketing, aprovechando su capacidad conversacional.
- **Generación de respuestas borrador para agentes humanos**: en un centro de soporte, el modelo puede proponer borradores de respuesta que un operador revisa y edita, reduciendo el tiempo de respuesta.
- **Chatbot embebido en aplicaciones con recursos limitados**: su tamaño permite ejecutarlo en local con llama.cpp u Ollama en equipos con 8-16 GB de VRAM, útil para demos o entornos sin conectividad.
- **Evaluación comparativa de técnicas de SFT**: como ejemplo reproducible de un pipeline Unsloth + TRL, puede servir para comparar metodologías de ajuste fino en modelos pequeños.
- **Sistemas de FAQ con contexto acotado**: para preguntas y respuestas sobre documentación de producto, siempre que se valide la calidad de las respuestas en el dominio específico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma oficial. Como referencia, un modelo de 3B en FP16 requiere aproximadamente 6-7 GB de VRAM; en cuantización de 4 bits (GGUF Q4) puede caber en torno a 2-3 GB.
- **GPU recomendadas**: para FP16, una RTX 3060 de 12 GB o superior; para cuantización 4-bit, una RTX 3050 de 8 GB o incluso GPUs integradas con suficiente memoria compartida.
- **Cabe en GPU consumer**: sí, previsiblemente en la mayoría de GPUs consumer modernas con 8 GB o más, especialmente en cuantización de 4 bits. No confirmado por el autor.
- **Opciones de despliegue**: transformers (soporte nativo según la model card), vLLM, llama.cpp, Ollama y TGI (si se generan pesos en GGUF o se usa el formato safetensors). No hay confirmación de compatibilidad con cada uno.
- **Latencia y throughput estimados**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `hadeis/customer-support-qwen25-3b-sft-v3` | ~3B | no disponible (base: 32k) | no disponible | Hugging Face | Ajuste SFT de Qwen2.5-3B-Instruct |
| Qwen2.5-3B-Instruct | ~3B | 32.768 tokens | Apache 2.0 (segun Qwen) | Hugging Face, ModelScope | Modelo base instructivo, sin ajuste de dominio |
| Llama 3.2 3B Instruct | ~3B | 128k tokens | Llama 3.2 Community License | Hugging Face, Meta | Alternativa de tamaño similar con contexto mayor |
| Phi-3.5-mini-instruct | ~3,8B | 128k tokens | MIT | Hugging Face, Azure | Modelo pequeño con buen rendimiento en razonamiento |

La comparativa se basa en características públicas de los modelos alternativos; no se dispone de datos de rendimiento del modelo objeto de esta ficha para comparar empíricamente.

## Limitaciones y advertencias

- **Licencia indeterminada**: la model card indica `licence: license` sin especificar términos. No se puede confirmar si el uso comercial está permitido; habría que verificar la licencia del modelo base (Qwen2.5, Apache 2.0) y la del ajuste.
- **Sesgos conocidos**: no documentados. Al derivar de Qwen2.5, puede heredar sesgos presentes en los datos de preentrenamiento de ese modelo, pero no se han evaluado.
- **Riesgo de alucinación**: no cuantificado. Como todo modelo generativo de 3B, es propenso a inventar información, especialmente en dominios no cubiertos por el dataset de SFT.
- **Limitaciones de contexto e idioma**: no documentadas. El ajuste SFT puede haber reducido el rendimiento multilingüe del modelo base si el dataset era monolingüe.
- **Ausencia de evaluación**: no hay benchmarks, métricas de calidad ni análisis de errores publicados. Cualquier despliegue en producción requiere una evaluación propia y un sistema de supervisión humana.
- **Dataset de entrenamiento desconocido**: no se especifica la procedencia, tamaño ni calidad de los datos de SFT, lo que impide estimar la cobertura del dominio de atención al cliente.
- **Repositorio sin tracción**: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso comunitario ni de validación externa.
- **Ejemplo de uso genérico**: el snippet de la model card plantea una pregunta filosófica, no una consulta de soporte, lo que sugiere que la especialización puede ser superficial o no estar verificada.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/hadeis/customer-support-qwen25-3b-sft-v3)
- [Modelo base: unsloth/Qwen2.5-3B-Instruct-unsloth-bnb-4bit](https://huggingface.co/unsloth/Qwen2.5-3B-Instruct-unsloth-bnb-4bit)
- [Qwen2.5-3B-Instruct (modelo original)](https://huggingface.co/Qwen/Qwen2.5-3B-Instruct)
- [TRL (framework de entrenamiento)](https://github.com/huggingface/trl)
- [Run de Weights & Biases](https://wandb.ai/vsrivastava-dev-srm-institute-of-science-and-technology/huggingface/runs/1e1t10zy)
- [Unsloth](https://github.com/unslothai/unsloth)
