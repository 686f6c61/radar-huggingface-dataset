# raytuo/maysa-whatsapp-bot

## Resumen

El modelo maysa-whatsapp-bot es un fine-tune conversacional de Llama 3 8B Instruct desarrollado por el usuario raytuo. Su objetivo declarado es servir como bot de WhatsApp, y se distribuye bajo licencia Apache 2.0. El entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, partiendo de un modelo base cuantizado en 4 bits (unsloth/llama-3-8b-Instruct-bnb-4bit). El modelo tiene 8.030.261.248 parámetros y está publicado en formato safetensors, con un tamaño de repositorio de 16,1 GB.

Se trata de un modelo de tipo transformer decoder-only, heredado de la arquitectura Llama 3. Aunque la información publicada es escasa y el repositorio apenas cuenta con descargas, su relevancia reside en ser un ejemplo práctico de fine-tuning de bajo coste sobre un modelo cuantizado, orientado a aplicaciones conversacionales en inglés. No se han publicado datos de entrenamiento, benchmarks ni evaluaciones, por lo que su rendimiento real solo puede inferirse a partir de las capacidades del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3) |
| Parámetros totales | 8.030.261.248 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Llama 3 8B Instruct tiene 8.192 tokens, no se especifica si se ha modificado) |
| Tipos de cuantización | No disponible (el modelo base fue entrenado con bnb-4bit; los pesos publicados están en safetensors sin información de cuantización) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de unsloth/llama-3-8b-Instruct-bnb-4bit, una versión cuantizada en 4 bits de Llama 3 8B Instruct. La arquitectura subyacente es un transformer decoder-only con atención de múltiples cabezas, diseñado para generación de texto. Según el autor, el entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, lo que permitió una velocidad de entrenamiento aproximadamente 2x mayor que la habitual. No se proporcionan detalles sobre el dataset de fine-tuning, el número de tokens ni si se aplicaron técnicas como RLHF o DPO. Al ser un modelo instruct, se espera que siga instrucciones conversacionales, pero la ausencia de información sobre los datos de entrenamiento impide evaluar su robustez.

## Capacidades

- Generación de texto conversacional en inglés, orientado a respuestas de chatbot.
- Hereda las capacidades de razonamiento y generación de código de Llama 3 8B Instruct.
- No hay evidencia de soporte de tool calling ni function calling.
- No se han publicado datos sobre soporte de agentes o razonamiento multi-step.
- El modelo está diseñado para tareas de conversación, pero no se especifican capacidades multilingües.
- Sin modo de pensamiento (thinking mode) ni soporte de visión o audio.

## Casos de uso

- Chatbot de WhatsApp: el modelo puede integrarse como backend de un bot de mensajería para responder consultas en inglés, manteniendo conversaciones multi-turno.
- Asistente de soporte al cliente: al estar basado en Llama 3 8B Instruct, puede generar respuestas útiles para preguntas frecuentes y escalar problemas a un agente humano.
- Generación de texto en inglés para aplicaciones internas: se puede usar como modelo base para tareas de redacción de correos, resúmenes o documentación.
- Prototipado de asistentes conversacionales: gracias a su licencia Apache 2.0 y su formato safetensors, es fácil de cargar con Transformers o vLLM en entornos de desarrollo.
- Integración en pipelines de chat existentes: el modelo puede servir como sustituto de modelos más grandes cuando se necesita una inferencia ligera en inglés.
- Investigación sobre fine-tuning eficiente: el uso de Unsloth y cuantización 4-bit durante el entrenamiento lo convierte en un ejemplo práctico de fine-tuning de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones para este modelo concreto.

## Requisitos de hardware

Estimaciones basadas en el tamaño del modelo y el formato de pesos:

- VRAM en FP16/BF16: aproximadamente 16 GB para los pesos, más overhead, por lo que se recomienda una GPU con al menos 24 GB de VRAM (RTX 4090, A100 40GB, H100).
- VRAM con cuantización 4-bit (si se aplica en tiempo de inferencia): alrededor de 5-6 GB, lo que permite ejecutar el modelo en GPUs de gama media como RTX 3060 12GB o similares.
- Despliegue: compatible con Transformers, vLLM, Text Generation Inference (TGI), llama.cpp y Ollama mediante conversión a GGUF.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización final.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| raytuo/maysa-whatsapp-bot | 8.03B | No disponible | Apache 2.0 | Hugging Face |
| unsloth/llama-3-8b-Instruct-bnb-4bit | 8.03B | 8.192 | Meta Llama 3 (con restricciones) | Hugging Face |
| Mistral 7B Instruct v0.2 | 7.24B | 32.768 | Apache 2.0 | Hugging Face |
| Gemma 7B Instruct | 7.78B | 8.192 | Gemma Terms (Google) | Hugging Face |

Nota: los datos de contexto y licencia de los modelos comparados provienen de su documentación oficial. El modelo maysa-whatsapp-bot no declara su longitud de contexto.

## Limitaciones y advertencias

- No se ha publicado información sobre el dataset de fine-tuning, por lo que se desconocen los sesgos específicos y el dominio de especialización.
- Al ser un fine-tune de un modelo base cuantizado en 4 bits (bnb-4bit) durante el entrenamiento, puede haber pérdida de calidad en comparación con un entrenamiento en precisión completa.
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado por la falta de evaluación documentada.
- La longitud de contexto no está especificada; si no se ha modificado, se espera que sea la de Llama 3 8B Instruct (8.192 tokens), pero no hay confirmación.
- Solo se declara soporte de inglés; no se debe esperar un rendimiento fiable en otros idiomas.
- Aunque la licencia del repositorio es Apache 2.0, el modelo base Llama 3 tiene su propia licencia con requisitos de uso comercial para empresas de gran escala. Es necesario revisar las condiciones de Meta antes de usarlo en producción.
- No hay indicios de soporte de tool calling, por lo que integrarlo en agentes automatizados requeriría desarrollo adicional.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/raytuo/maysa-whatsapp-bot
- Perfil del autor: https://huggingface.co/raytuo
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
