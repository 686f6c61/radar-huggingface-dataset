# simaai/Llama-3.1-Swallow-8B-Instruct-v0.5-GPTQ-a16w4

## Resumen

Llama-3.1-Swallow-8B-Instruct-v0.5-GPTQ-a16w4 es un modelo de lenguaje compilado y optimizado por SiMa.ai para su plataforma de hardware embebido Modalix. Se basa en el modelo Llama-3.1-Swallow-8B-Instruct-v0.5, desarrollado por Tokyo Tech, que extiende Meta Llama 3.1 con capacidades mejoradas en japonés manteniendo el rendimiento en inglés. El modelo original tiene 8.000 millones de parámetros y una longitud de contexto de 8.192 tokens. Esta versión aplica cuantización A16W4 (activaciones en BF16 y pesos en INT4) para ejecutarse de forma eficiente en dispositivos de borde, reduciendo el consumo de memoria y energía. Es relevante para desarrolladores que necesitan desplegar asistentes bilingües japonés-inglés en entornos embebidos, sin depender de la nube.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1 Swallow) |
| Parametros totales | 8.000 millones (8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | GPTQ A16W4 (activaciones BF16, pesos INT4) |
| Idiomas soportados | Japonés, inglés |
| Licencia | Llama 3.3 and Gemma Terms |
| Formato de pesos | Artefactos compilados para SiMa.ai Modalix (no es checkpoint de Transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Llama 3.1 Swallow, un transformer denso de 8.000 millones de parámetros. El modelo base, Llama-3.1-Swallow-8B-Instruct-v0.5, es un fine-tuning de Llama 3.1 orientado a mejorar el japonés y mantener el inglés. No se han publicado detalles específicos sobre el dataset, el número de tokens de entrenamiento ni el uso de RLHF o DPO en la información disponible. La innovación técnica de esta versión reside en la cuantización GPTQ A16W4 y en la compilación específica para la plataforma SiMa.ai Modalix, que permite ejecutar el modelo en hardware embebido con un uso eficiente de recursos.

## Capacidades

- Generación de texto en japonés e inglés, con formato de instrucciones.
- Soporte para conversaciones multi-turno dentro de la ventana de contexto de 8.192 tokens.
- Capacidad de seguir instrucciones en ambos idiomas, heredada del ajuste Instruct del modelo base.
- Cuantización A16W4 optimizada para ejecución en dispositivos embebidos de SiMa.ai.
- No se documenta soporte de tool calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Asistentes de atención al cliente en dispositivos de borde: el modelo puede gestionar consultas en japonés e inglés en quioscos o terminales de autoservicio, gracias a su ventana de 8.192 tokens y a la cuantización A16W4 que reduce los requisitos de memoria.
- Traducción y resumen en entornos industriales: en plantas con maquinaria de SiMa.ai, el modelo puede procesar documentos técnicos o comunicaciones en japonés e inglés sin conexión a la nube.
- Automatización de back-office en empresas japonesas: para redactar correos, resumir actas o clasificar texto bilingüe en entornos con restricciones de conectividad.
- Asistentes de voz o texto en vehículos y maquinaria: al estar compilado para Modalix, puede integrarse en sistemas embebidos de automoción o robótica para interacción en lenguaje natural.
- Aplicaciones de demostración y prototipado: el modelo se puede desplegar con el GenAI Multimodal Assistant de SiMa.ai para validar casos de uso de IA generativa en hardware embebido.
- Servidores de inferencia locales: mediante el flujo de trabajo "Serve GenAI Models", el modelo puede exponerse con APIs compatibles con OpenAI u Ollama dentro de una red local, sin depender de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model card indica que las mediciones de rendimiento están pendientes y se añadirán tras el benchmarking.

## Requisitos de hardware

- VRAM estimada: no disponible. El modelo no está diseñado para GPUs convencionales; requiere un dispositivo SiMa.ai Modalix.
- GPU recomendadas: no aplica. El modelo solo se ejecuta en la plataforma Modalix.
- ¿Cabe en consumer GPU? No, no es un checkpoint estándar y no puede cargarse con Transformers.
- Opciones de despliegue: SiMa.ai Modalix con el runtime Neat y la CLI LLiMa; también se puede servir mediante el GenAI server con APIs compatibles con OpenAI u Ollama.
- Latencia y throughput: pendientes de medición (TBD en la tabla del model card).
- Almacenamiento: el repositorio ocupa 12.3 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-Swallow-8B-Instruct-v0.5-GPTQ-a16w4 | 8B | 8.192 | GPTQ A16W4 | Llama 3.3 and Gemma Terms | Solo SiMa.ai Modalix (compilado) |
| Llama-3.1-Swallow-8B-Instruct-v0.5 (fuente) | 8B | 8.192 | Sin cuantizar (BF16) | Llama 3.3 and Gemma Terms | Hugging Face, Transformers |
| Llama-3.1-8B-Instruct-GPTQ-Safetensors | 8B | no disponible | GPTQ INT4 | other | Hugging Face, Transformers (cuantizado) |

## Limitaciones y advertencias

- Cuantización A16W4: las salidas pueden diferir del modelo fuente sin cuantizar. Es necesario validar la calidad en los casos de uso previstos.
- Plataforma específica: los artefactos compilados solo se ejecutan en SiMa.ai Modalix; no pueden cargarse con Hugging Face Transformers ni en GPUs convencionales.
- Cobertura de idiomas y tareas: aunque el modelo es bilingüe japonés-inglés, se recomienda probar con prompts representativos del despliegue real para garantizar la calidad.
- Licencia y uso aceptable: el uso está sujeto a los términos de Llama 3.3 y Gemma, incluyendo las restricciones de uso aceptable. Revisar la documentación antes de redistribuir o usar comercialmente.
- Riesgo de alucinación: no se han publicado evaluaciones específicas; como en todo modelo de lenguaje, existe riesgo de generar contenido incorrecto o inventado.
- Sesgos: no se han documentado sesgos específicos en la información disponible.

## Enlaces

- Repositorio del modelo: https://huggingface.co/simaai/Llama-3.1-Swallow-8B-Instruct-v0.5-GPTQ-a16w4
- Modelo fuente: https://huggingface.co/tokyotech-llm/Llama-3.1-Swallow-8B-Instruct-v0.5
- Checkpoint cuantizado pre-LLiMa: https://huggingface.co/simaai/Llama-3.1-Swallow-8B-Instruct-v0.5-GPTQ-Safetensors
- Documentación de GenAI con LLiMa: https://developer.sima.ai/software/genai-llima/
- Tutorial "Serve GenAI Models": https://developer.sima.ai/software/tutorials/serve-genai-models
- Tutorial "Run an LLM": https://developer.sima.ai/software/tutorials/run-an-llm
- GenAI Multimodal Assistant: https://developer.sima.ai/examples/app/genai%2Fmultimodal-assistant
- Guía de inicio de Neat: https://developer.sima.ai/software/getting-started/
