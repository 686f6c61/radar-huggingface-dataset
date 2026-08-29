# josapratama/qwen2.5-1.5b-legal-chatbot-id

## Resumen

El modelo `josapratama/qwen2.5-1.5b-legal-chatbot-id` es un ajuste fino (fine-tune) del modelo Qwen2.5 1.5B Instruct, desarrollado por josapratama con el objetivo de crear un chatbot especializado en consultas legales, probablemente orientado al idioma indonesio (el sufijo "id" sugiere indonesio, aunque la etiqueta oficial de idioma es "en"). Se basa en la arquitectura Qwen2.5, un transformer decoder-only de 1.543 millones de parámetros, y fue entrenado utilizando las librerías Unsloth y TRL de Hugging Face, lo que permitió un entrenamiento aproximadamente dos veces más rápido que un fine-tune convencional.

Este modelo es relevante porque ofrece una alternativa ligera y de código abierto (licencia Apache 2.0) para tareas de conversación legal, con un tamaño que permite su ejecución en hardware de consumo. Al ser un fine-tune de Qwen2.5 Instruct, hereda las capacidades generales de generación de texto, razonamiento y comprensión del modelo base, aunque su especialización en el dominio legal no está documentada en detalle. El repositorio no incluye información sobre el dataset de entrenamiento ni sobre el método de ajuste (SFT, RLHF, etc.), por lo que su rendimiento real en tareas legales debe evaluarse empíricamente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 1.543.714.304 (1,54B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32K tokens (heredado del modelo base Qwen2.5 1.5B, no confirmado en la ficha) |
| Tipos de cuantizacion | No disponible (el repositorio contiene safetensors, probablemente en BF16) |
| Idiomas soportados | en (etiqueta oficial), aunque el nombre sugiere indonesio (id) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5, un transformer decoder-only con atención causal estándar, normalización RMSNorm y embeddings rotatorios (RoPE). El modelo base, `unsloth/qwen2.5-1.5b-instruct-unsloth-bnb-4bit`, es una versión cuantizada en 4 bits de Qwen2.5 1.5B Instruct, optimizada para fine-tune eficiente con Unsloth. El fine-tune se realizó con la librería TRL de Hugging Face, que proporciona herramientas para entrenamiento con refuerzo (RLHF, GRPO) y ajuste supervisado (SFT), aunque no se especifica cuál de estos métodos se utilizó.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni la composición de los datos. El autor solo indica que el modelo fue entrenado "2x faster" gracias a Unsloth, lo que sugiere el uso de técnicas de optimización como LoRA o QLoRA, aunque no se confirma. Tampoco se documentan innovaciones técnicas adicionales más allá de las heredadas del modelo base.

## Capacidades

- Generación de texto conversacional: al ser un fine-tune de Qwen2.5 Instruct, puede mantener diálogos multi-turno y responder a instrucciones en lenguaje natural.
- Razonamiento y comprensión: hereda las capacidades de razonamiento básico del modelo base, aunque su tamaño reducido limita tareas complejas.
- Especialización legal (potencial): el nombre del modelo sugiere que fue entrenado para consultas legales, pero no hay evidencia documentada de ello en la ficha.
- Soporte de tool calling: no confirmado; Qwen2.5 1.5B Instruct no incluye soporte nativo de function calling en su versión base, por lo que es poco probable que este fine-tune lo añada.
- Capacidades multilingües: la etiqueta oficial indica solo inglés, aunque el nombre sugiere indonesio; no se puede confirmar el soporte real de otros idiomas.
- Sin capacidades multimodales: el modelo es exclusivamente de texto.

## Casos de uso

- Asistente legal básico: el modelo puede responder preguntas frecuentes sobre leyes, derechos y procedimientos legales, siempre que se le proporcione contexto o se use como complemento a un sistema de recuperación de información.
- Redacción de documentos legales simples: puede generar borradores de cláusulas, contratos básicos o resúmenes de normativas, aunque requiere supervisión humana debido al riesgo de errores.
- Chatbot de atención al cliente en despachos de abogados: integrado en un sitio web o aplicación, puede gestionar consultas iniciales y derivar casos complejos a profesionales.
- Educación legal: utilizado como herramienta de estudio para estudiantes de derecho, explicando conceptos jurídicos de forma simplificada.
- Clasificación y resumen de textos legales: con un prompt adecuado, puede resumir sentencias o documentos legales extensos, aunque su contexto de 32K tokens permite procesar documentos de tamaño medio.
- Prototipado rápido de aplicaciones legales: al ser un modelo pequeño y de código abierto, es adecuado para pruebas de concepto en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni métricas específicas de tareas legales. El rendimiento real del modelo debe evaluarse mediante pruebas propias en el dominio de interés.

## Requisitos de hardware

- VRAM estimada: para inferencia en BF16, se requieren aproximadamente 3 GB de VRAM (1,54B parámetros × 2 bytes). Con cuantización 4-bit, podría reducirse a ~1 GB, pero no se proporcionan pesos cuantizados en el repositorio.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1660, RTX 2060, RTX 3060, o GPUs integradas de gama alta. También puede ejecutarse en CPU con suficiente RAM (≈6 GB para BF16).
- Compatibilidad con GPUs de consumo: sí, es un modelo ligero que cabe en la mayoría de GPUs consumer modernas.
- Opciones de despliegue: compatible con transformers, text-generation-inference (TGI), vLLM, llama.cpp (si se convierten los pesos a GGUF) y Ollama (mediante conversión). También se puede servir con FastAPI o Gradio para prototipos.
- Latencia y throughput: no se dispone de datos medidos. En una GPU RTX 3060, se espera una latencia de decenas de milisegundos por token, con throughput de cientos de tokens por segundo en batch.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| josapratama/qwen2.5-1.5b-legal-chatbot-id | 1,54B | 32K (heredado) | Apache 2.0 | Legal (no confirmado) |
| Qwen2.5 1.5B Instruct (base) | 1,54B | 32K | Apache 2.0 | General |
| JoshuaPrasetya/legal-chatbot-qwen2.5-1.5b-grpo | 1,54B | 32K (presumible) | Apache 2.0 | Legal (entrenado con GRPO) |
| jayuspurnomo/legal-chatbot-qwen2.5-1.5b-sft | 1,54B | 32K (según LLM Explorer) | Apache 2.0 | Legal (entrenado con SFT) |

No se dispone de benchmarks comparativos entre estos modelos. Todos comparten la misma arquitectura base y tamaño, por lo que las diferencias radican en el dataset y el método de fine-tune, que no están documentados públicamente.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo pequeño (1,5B) y sin documentación sobre el dataset de entrenamiento, existe un riesgo elevado de generar información legal incorrecta o inventada. No debe utilizarse como fuente autoritativa en asuntos legales reales.
- Limitaciones de idioma: la etiqueta oficial indica solo inglés, aunque el nombre sugiere indonesio. No se garantiza un rendimiento adecuado en otros idiomas.
- Contexto limitado: aunque el modelo base soporta 32K tokens, no se ha verificado que el fine-tune mantenga esta capacidad. Además, el tamaño reducido puede degradar la coherencia en contextos muy largos.
- Falta de transparencia: no se publican detalles del dataset, el método de entrenamiento ni métricas de evaluación, lo que dificulta la reproducibilidad y la confianza en el modelo.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la calidad o la idoneidad para aplicaciones legales profesionales.
- Sin soporte de herramientas: no se confirma la capacidad de function calling, lo que limita su integración en agentes que requieran interacción con APIs externas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/josapratama/qwen2.5-1.5b-legal-chatbot-id
- Modelo relacionado (GRPO): https://huggingface.co/JoshuaPrasetya/legal-chatbot-qwen2.5-1.5b-grpo
- Modelo relacionado (SFT): https://huggingface.co/JoshuaPrasetya/legal-chatbot-qwen2.5-1.5b-sft
- Entrada en FriendliAI (modelo GRPO): https://friendli.ai/models/JoshuaPrasetya/legal-chatbot-qwen2.5-1.5b-grpo
- Entrada en LLM Explorer (modelo SFT): https://llm-explorer.com/model/jayuspurnomo%2Flegal-chatbot-qwen2.5-1.5b-sft,1QfyNm53cwxlNjPm17vkBS
- Entrada en Free2AITools (modelo SFT): https://free2aitools.com/model/joshuaprasetya/legal-chatbot-qwen2.5-1.5b-sft
