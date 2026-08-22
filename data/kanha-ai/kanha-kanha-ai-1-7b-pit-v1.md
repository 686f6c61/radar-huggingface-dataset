# Kanha-AI/kanha-kanha.ai-1.7b-pit-v1

## Resumen

El modelo `kanha-kanha.ai-1.7b-pit-v1` es un checkpoint de fine-tuning (continual pretraining) desarrollado por Kanha AI sobre la base de `Qwen/Qwen3-1.7B`. Kanha AI ofrece un servicio que entrena chatbots personalizados a partir del contenido de un sitio web concreto y proporciona un SDK para ejecutarlos directamente en el dispositivo del cliente mediante WebGPU, eliminando la necesidad de llamadas constantes a APIs remotas. Este checkpoint concreto se ha entrenado con 17 documentos y 170 pares pregunta-respuesta del sitio kanha.ai, con una longitud máxima de contexto de 2048 tokens.

Con 1.720.574.976 parámetros (1,72B), es un modelo compacto diseñado para inferencia on-device, lo que reduce costes operativos y latencia. Su relevancia radica en demostrar un flujo de trabajo completo de crawleo, generación de pares Q&A y fine-tuning para producir un asistente conversacional específico de un dominio, desplegable en navegadores vía WebGPU. La licencia no está especificada en la model card, y el modelo solo soporta inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (máximo de entrenamiento) |
| Tipos de cuantizacion | MLC q4f16_1 (disponible en el repositorio) |
| Idiomas soportados | Inglés |
| Licencia | No disponible |
| Formato de pesos | safetensors (bf16) y MLC |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `Qwen/Qwen3-1.7B` mediante el método PIT (document continuation plus Q&A). Se trata de un transformer decoder-only estándar, sin mezcla de expertos ni arquitecturas híbridas. El entrenamiento se realizó sobre 17 documentos del sitio kanha.ai y 170 pares pregunta-respuesta generados a partir de ese contenido, con 3 épocas, learning rate de 3e-05, batch size efectivo de 16 (8 con grad accum de 2), y longitud máxima de secuencia de 2048 tokens. Se usó bf16 y tf32, gradient checkpointing y un scheduler de learning rate coseno con mínimo de 0.1. El checkpoint final se fusionó en bfloat16.

La innovación principal no reside en la arquitectura, sino en el flujo de trabajo: Kanha AI indexa automáticamente el contenido de un sitio (incluyendo JavaScript renderizado), genera pares Q&A y fine-tunea un modelo compacto específico para ese dominio. Este checkpoint es el resultado de ese pipeline para kanha.ai.

## Capacidades

- Generación de texto conversacional en inglés, con respuestas concisas basadas en el contenido del sitio kanha.ai.
- Capacidad de responder preguntas sobre documentos específicos (17 documentos de entrenamiento), incluyendo fechas, URLs y números con distintos grados de precisión.
- Ejecución on-device vía WebGPU gracias a los artefactos MLC cuantizados a q4f16_1.
- Integración con componentes web (script tag, Web Component o React component) para despliegue en sitios web.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, ni capacidades multimodales (visión, audio).
- Multilingüismo limitado a inglés; no hay evidencia de soporte para otros idiomas.

## Casos de uso

- Atención al cliente automatizada en sitios web: el modelo puede gestionar consultas frecuentes sobre el contenido del sitio (políticas, precios, fechas) directamente en el navegador del usuario, reduciendo la dependencia de servidores externos.
- Asistente de documentación: integrado como widget en una página de documentación técnica, responde preguntas sobre guías, tutoriales y referencias específicas del sitio.
- FAQ dinámico: sustituye listas estáticas de preguntas frecuentes por un asistente conversacional que extrae respuestas del corpus entrenado.
- Chatbot de soporte en primera línea: filtra consultas sencillas antes de escalar a agentes humanos, gracias a su baja latencia on-device.
- Generación de respuestas basadas en contenido propietario: al estar fine-tuneado con documentos específicos, puede responder con información privada o especializada sin necesidad de enviar datos a la nube.
- Demostración de inferencia on-device: sirve como ejemplo de despliegue de modelos pequeños en navegadores mediante WebGPU, útil para desarrolladores que exploran arquitecturas edge.

## Benchmarks y rendimiento

La model card incluye métricas de evaluación sobre un conjunto de 26 ítems, que califican el comportamiento del servidor (no del modelo directamente). Los resultados son:

| Métrica | Valor |
|---|---|
| dates_recall | 1.0 |
| deterministic_pass_rate | 0.0 |
| list_recall | 0.0436 |
| numbers_recall | 0.7577 |
| refusal_rate | 0.0 |
| unsupported_value_rate | 0.4231 |
| urls_recall | 1.0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este checkpoint. La evaluación externa indica que el modelo recupera correctamente fechas y URLs, pero falla en respuestas deterministas y tiene una alta tasa de valores no soportados (42,3%), lo que sugiere limitaciones en la comprensión de ciertos tipos de consultas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: ~3,5 GB (1,72B parámetros × 2 bytes) más overhead de activaciones y caché KV.
- Con cuantización MLC q4f16_1, la huella de memoria se reduce a aproximadamente 1 GB, lo que permite ejecución en GPU de consumo y en dispositivos con WebGPU.
- GPUs recomendadas: NVIDIA RTX 3060 (12 GB) o superior para bf16; cualquier GPU con soporte WebGPU (integrada o dedicada) para la versión cuantizada.
- Opciones de despliegue: vLLM, TGI (text-generation-inference), llama.cpp, Ollama, y MLC (para on-device en navegador).
- Latencia y throughput: no se han publicado datos específicos; en un modelo de 1,7B con cuantización 4-bit, se espera una latencia de decodificación de decenas de milisegundos en GPUs modernas, aunque depende del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Kanha-kanha.ai-1.7b-pit-v1 | 1,72B | 2048 | No disponible | Fine-tuning de Qwen3-1.7B, específico para un sitio web |
| Qwen/Qwen3-1.7B | 1,72B | 32768 (según documentación de Qwen) | Apache 2.0 (según Qwen) | Modelo base, capacidades generales |
| Llama 3.2 1B | 1,23B | 128k | Llama 3.2 Community License | Modelo ligero de Meta, multilingüe |
| Gemma 2 2B | 2,6B | 8192 | Gemma Terms of Use | Modelo de Google, orientado a eficiencia |

Este checkpoint hereda la arquitectura de Qwen3-1.7B, pero su entrenamiento específico lo limita a un dominio concreto. No se dispone de comparativas de rendimiento en benchmarks estándar frente a estas alternativas.

## Limitaciones y advertencias

- Entrenado únicamente con 17 documentos y 170 pares Q&A, lo que limita severamente su cobertura de conocimiento y su capacidad de generalización.
- La evaluación externa muestra una tasa de valores no soportados del 42,3% y una tasa de paso determinista del 0%, indicando que puede fallar en consultas que requieren respuestas exactas o estructuradas.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- La licencia no está especificada, lo que genera incertidumbre sobre su uso comercial y distribución.
- Riesgo de alucinación y de generar contenido incorrecto, incompleto o desactualizado, como advierte la propia model card.
- La longitud de contexto está limitada a 2048 tokens, insuficiente para documentos extensos o conversaciones de muchas vueltas.
- El corpus de entrenamiento es privado y específico del sitio kanha.ai, por lo que el modelo no es útil para otros dominios sin reentrenamiento.
- No hay garantía de seguridad en producción; la evaluación no establece capacidad general ni robustez frente a entradas adversas.

## Enlaces

- HuggingFace: https://huggingface.co/Kanha-AI/kanha-kanha.ai-1.7b-pit-v1
- Organización Kanha-AI en HuggingFace: https://huggingface.co/Kanha-AI
- Repositorio GitHub: https://github.com/Kanha-AI/Kanha-AI
- Sitio web de Kanha AI: https://kanha.ai
- Sitio de Kanha AI (producto infantil): https://kanhaji.ai/
