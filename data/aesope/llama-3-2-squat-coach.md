# Aesope/Llama-3.2-Squat-Coach

## Resumen

Llama-3.2-Squat-Coach es un ajuste fino (fine-tuning) del modelo meta-llama/Llama-3.2-3B-Instruct, publicado por el usuario Aesope en Hugging Face. El modelo está especializado en fitness y coaching, concretamente en la técnica de sentadilla (squat), según indican sus etiquetas y su nombre. Se distribuye principalmente en formato GGUF, lo que lo hace adecuado para inferencia local en hardware de consumo mediante llama.cpp u Ollama.

El modelo parte de la arquitectura Llama 3.2 de Meta, un transformer decoder-only de 3.212.749.888 parámetros (aproximadamente 3,2 mil millones), con una ventana de contexto de 128.000 tokens heredada del modelo base. El ajuste fino se realizó presumiblemente con la librería Unsloth, según la etiqueta incluida en el repositorio, aunque la model card no aporta detalles sobre el dataset, el número de tokens de entrenamiento ni la metodología empleada.

La relevancia de este modelo es limitada y muy específica: se trata de un experimento de ajuste fino de nicho, con solo 158 descargas y 0 likes en el momento de la consulta. No obstante, resulta útil como ejemplo de especialización de un modelo pequeño en un dominio concreto y como base para quienes quieran desplegar un asistente conversacional de fitness en local sin depender de APIs externas. La información pública disponible es muy escasa: la model card se limita a metadatos YAML y no incluye benchmarks, detalles de entrenamiento ni instrucciones de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), fine-tuning de meta-llama/Llama-3.2-3B-Instruct |
| Parametros totales | 3.212.749.888 (aproximadamente 3,2 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Llama 3.2 3B Instruct; no confirmada explícitamente en la model card) |
| Tipos de cuantizacion | GGUF (el repositorio incluye pesos en formato GGUF; no se detallan los niveles de cuantización disponibles) |
| Idiomas soportados | en (inglés) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | GGUF (tamaño del repo: 2,0 GB) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 3.2 3B Instruct de Meta: un transformer decoder-only con atención por grupos (GQA), activaciones SwiGLU y normalización RMSNorm, optimizado para inferencia eficiente en hardware modesto. El contexto de 128.000 tokens del modelo base permite conversaciones multi-turno largas, aunque no hay evidencia de que el ajuste fino haya preservado plenamente esa capacidad para el dominio de fitness.

El ajuste fino se realizó, según la etiqueta del repositorio, con Unsloth, una librería que acelera el entrenamiento de modelos Llama mediante kernels optimizados y técnicas como LoRA/QLoRA. Sin embargo, la model card no especifica el número de tokens de entrenamiento, la composición del dataset, si se usó RLHF o DPO, ni la configuración de hiperparámetros. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.) más allá de las propias del modelo base.

## Capacidades

- Generación de texto conversacional en inglés, orientada a preguntas y respuestas sobre fitness y técnica de sentadilla.
- Razonamiento básico y explicaciones paso a paso, heredado del modelo base Instruct.
- Capacidad de mantener conversaciones multi-turno gracias al contexto de 128.000 tokens del modelo base (no verificada tras el ajuste fino).
- Soporte de tool calling / function calling: no confirmado en la model card; el modelo base Llama 3.2 3B Instruct lo soporta, pero no hay evidencia de que el ajuste fino lo preserve.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Modo thinking, visión o audio: no disponible.
- Especialización declarada en fitness y coaching (etiquetas `fitness`, `coaching`), sin documentación adicional sobre el alcance real de esa especialización.

## Casos de uso

- Asistente de técnica de sentadilla: el modelo puede responder preguntas sobre postura, profundidad, colocación de pies y errores comunes, usando el conocimiento inyectado durante el ajuste fino. Adecuado por su especialización declarada y su tamaño reducido para despliegue local.
- Chatbot de rutinas de entrenamiento: puede generar explicaciones y variaciones de ejercicios de sentadilla en conversaciones multi-turno, aunque la falta de benchmarks hace recomendable validar las respuestas con un entrenador profesional.
- Prototipado de asistentes de fitness en local: con 2,0 GB en GGUF, se puede desplegar en un portátil o en una Raspberry Pi con suficiente RAM mediante llama.cpp u Ollama, sin coste de API.
- Educación y divulgación: útil para generar borradores de contenido sobre técnica de sentadilla que luego un humano revise y corrija.
- Integración en aplicaciones de gimnasio: como backend conversacional para una app móvil que responda dudas básicas de usuarios, siempre con supervisión humana y avisos de responsabilidad.
- Investigación sobre fine-tuning de nicho: sirve como caso de estudio de cómo Unsloth permite especializar un modelo de 3B en un dominio concreto con recursos limitados.
- Base para futuros ajustes: al ser un modelo pequeño y con licencia Llama 3.2, puede servir como punto de partida para fine-tunings adicionales en otros deportes o dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB en cuantización Q4_K_M (pesos de 2,0 GB más overhead de contexto y KV cache); en FP16 serían necesarios unos 6,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones agresivas (GTX 1650, RTX 3050); RTX 3060/4060 o superiores para cuantizaciones Q5/Q6 y contextos largos; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs consumer con 6 GB o más de VRAM; también puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui; vLLM y TGI son posibles si se dispone de los pesos en safetensors (no incluidos en el repo, solo GGUF).
- Latencia y throughput estimados: no disponibles; para un modelo de 3B en cuantización Q4 en una RTX 3060 se puede esperar un throughput del orden de decenas de tokens por segundo, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Especializacion |
|---|---|---|---|---|---|
| Aesope/Llama-3.2-Squat-Coach | 3,2 B | 128.000 (heredado) | llama3.2 | GGUF | Fitness / sentadilla |
| meta-llama/Llama-3.2-3B-Instruct | 3,2 B | 128.000 | llama3.2 | safetensors, GGUF | Generalista |
| Qwen2.5-3B-Instruct | 3,1 B | 32.768 | Apache 2.0 | safetensors, GGUF | Generalista |
| Phi-3.5-mini-instruct | 3,8 B | 128.000 | MIT | safetensors, GGUF | Generalista |

El modelo de Aesope se diferencia de los generalistas por su especialización declarada en fitness, pero carece de benchmarks que demuestren una mejora real frente al modelo base en ese dominio. Frente a Qwen2.5-3B-Instruct y Phi-3.5-mini-instruct, ofrece una licencia más restrictiva (Llama 3.2 Community License) y menor documentación, aunque su tamaño en GGUF (2,0 GB) es competitivo para despliegue local.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de Llama 3.2, puede heredar sesgos del modelo base en cuanto a género, cultura y representación.
- Riesgo de alucinación: alto en un modelo de 3B sin benchmarks que validen la calidad de sus respuestas sobre fitness; puede inventar rutinas, cargas o consejos de seguridad incorrectos.
- Limitaciones de contexto o idioma: solo inglés declarado; el contexto de 128.000 tokens no está verificado tras el ajuste fino y podría degradarse en conversaciones muy largas.
- Restricciones de licencia: Llama 3.2 Community License permite uso comercial con condiciones (atribución, límite de 700 millones de usuarios mensuales, restricciones de uso aceptable); es necesario revisar los términos completos antes de producción.
- Caveat para producción: la model card no incluye instrucciones de uso, dataset de entrenamiento ni evaluación; no se recomienda su uso en producción sin una validación exhaustiva y supervisión humana, especialmente en contextos de salud y ejercicio físico.
- El modelo no sustituye a un entrenador personal o profesional sanitario; cualquier consejo debe ir acompañado de advertencias de responsabilidad.

## Enlaces

- Hugging Face: https://huggingface.co/Aesope/Llama-3.2-Squat-Coach
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Unsloth (librería de fine-tuning): https://github.com/unslothai/unsloth
- Llama 3.2 Community License: https://www.llama.com/llama3_2/license/
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
