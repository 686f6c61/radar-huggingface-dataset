# Jairurlll/Hermes-3-Llama-3.1-8B

## Resumen

Hermes 3 Llama 3.1 8B es un modelo de lenguaje generalista de 8.030 millones de parámetros, desarrollado originalmente por Nous Research y publicado en este repositorio como una re-subida por el usuario Jairurlll. Se trata de un ajuste fino (fine-tuning) del modelo base Meta-Llama-3.1-8B, entrenado principalmente con datos sintéticos generados por GPT-4, con el objetivo de mejorar las capacidades de razonamiento, el roleplay, la conversación multi-turno y la coherencia en contextos largos respecto a la versión anterior Hermes 2.

La relevancia actual del modelo radica en que ofrece capacidades avanzadas de función calling y salida estructurada (JSON mode) sobre una base de 8B parámetros, lo que permite su ejecución en hardware de consumo con cuantización. El modelo utiliza el formato de prompt ChatML, compatible con el endpoint de OpenAI, y tiene una ventana de contexto de 131072 tokens según la información publicada. La licencia es llama3, lo que permite uso comercial con ciertas restricciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.1 8B base) |
| Parámetros totales | 8.030.261.248 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 131072 tokens (según entrenamiento) |
| Tipos de cuantización | no disponible en este repo (safetensors FP16/BF16); existen versiones GGUF de terceros |
| Idiomas soportados | inglés (principal), aunque puede generalizar parcialmente a otros idiomas |
| Licencia | llama3 (Meta Llama 3 Community License) |
| Formato de pesos | safetensors (también disponible en GGUF por terceros) |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura de Llama 3.1 8B: un transformer denso con atención de múltiples cabezas, normalización RMSNorm y capas de atención con sesgo. El ajuste fino se realizó sobre el conjunto de datos Hermes 3, compuesto principalmente por respuestas sintéticas generadas con GPT-4, con el objetivo de alinear el comportamiento del modelo con las intenciones del usuario y mejorar su capacidad de seguir instrucciones complejas. Se utilizó la biblioteca Axolotl para el entrenamiento.

La innovación técnica clave de Hermes 3 reside en su entrenamiento para funciones avanzadas de llamada de herramientas (function calling) y generación de salidas estructuradas en JSON, además de una mejora en la coherencia del contexto largo y el razonamiento multi-paso. El modelo fue entrenado con el formato ChatML, que permite una separación clara de roles (system, user, assistant) y es compatible con el template de chat de Transformers.

## Capacidades

- Generación de texto generalista: conversación, redacción, resumen, explicación.
- Razonamiento y deducción: mejora en tareas de razonamiento multi-paso y lógica.
- Generación de código: capacidad mejorada respecto a Hermes 2 para tareas de programación.
- Function calling: soporte para llamadas a herramientas externas mediante firmas JSON en el prompt, con formato de salida estructurado.
- JSON mode: capacidad de generar respuestas en formato JSON estricto, útil para integraciones con APIs.
- Roleplaying y personalización: el modelo admite system prompts complejos para dirigir el estilo y comportamiento.
- Conversación multi-turno: buena coherencia en diálogos largos gracias a la ventana de contexto extendida.
- Capacidades multilingües: aunque entrenado principalmente en inglés, puede producir texto en otros idiomas con calidad variable.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 131K tokens) y puede utilizar function calling para consultar bases de datos o APIs de pedidos, proporcionando respuestas contextualizadas.
- Generación de código en producción: con soporte de function calling y salida JSON, puede integrarse en pipelines de CI/CD para generar documentación, sugerir correcciones o crear tests a partir de especificaciones.
- Asistentes de productividad personal: como asistente de escritura, redacción de correos, resumen de documentos largos, gracias a su ventana de contexto amplia.
- Sistemas de roleplay y narrativa interactiva: su entrenamiento específico en roleplay permite crear personajes consistentes y diálogos creativos en juegos o experiencias interactivas.
- Extracción de datos estructurados: al poder emitir JSON válido, es útil para extraer entidades, sentimientos o datos de texto no estructurado y alimentar sistemas downstream.
- Chatbots de documentación técnica: con su capacidad de seguir instrucciones y manejar contexto largo, puede responder preguntas sobre bases de conocimiento extensas.
- Generación de contenido creativo: cuentos, guiones, ideas, con control de estilo mediante system prompts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo-index de la model card muestra una entrada para "Hermes-3-Llama-3.1-70B" con resultados vacíos, y no hay datos específicos para la versión 8B. El autor declara que el rendimiento es comparable o superior a Llama-3.1 Instruct en capacidades generales, pero no se proporcionan cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en FP16 requiere unos 16 GB de VRAM (8.03B parámetros × 2 bytes). Con cuantización de 4 bits (GGUF Q4_K_M) se puede reducir a unos 5-6 GB.
- GPU recomendadas: para FP16, una GPU con 16 GB o más, como RTX 4080, RTX 4090, A100 40GB. Para cuantización 4-bit, GPUs de 8 GB como RTX 3060 Ti o RTX 3070 pueden funcionar.
- Sí cabe en GPU de consumo: con cuantización GGUF de 4 bits o 8 bits, se puede ejecutar en tarjetas de 8-12 GB.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Transformers con `transformers` y `bitsandbytes` para cuantización.
- Latencia y throughput estimados: no disponible; depende del hardware y la cuantización. En una A100 40GB, se pueden obtener decenas de tokens por segundo; en una RTX 4090, entre 20-40 tokens/s con 8-bit.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Hermes 3 Llama 3.1 8B (este) | 8.03B | 131072 | llama3 | Hugging Face |
| Llama 3.1 8B Instruct | 8.03B | 131072 | llama3 | Meta |
| Hermes 2 Llama 3 8B | 8.03B | 8192 (original) | Apache | Hugging Face |
| Qwen 2.5 7B Instruct | 7.6B | 32768 | Apache | Hugging Face |

No se dispone de datos comparativos de rendimiento en los benchmarks de estos modelos en la información proporcionada. La comparativa se basa en características arquitectónicas y de licencia.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado con datos sintéticos y de internet, puede reflejar sesgos sociales y culturales presentes en los datos de entrenamiento de Llama 3.1.
- Riesgo de alucinación: como cualquier LLM, puede generar información falsa o inventada, especialmente en temas de actualidad o con datos específicos.
- Limitaciones de idioma: entrenado principalmente en inglés; el rendimiento en otros idiomas es inferior y puede producir respuestas incoherentes.
- Restricciones de licencia: la licencia llama3 permite uso comercial, pero requiere que se mantenga la atribución y se indique la licencia. No se permite el uso para fines de vigilancia o en aplicaciones de alto riesgo sin autorización.
- Advertencia de producción: la ventana de contexto de 131K tokens puede degradarse en coherencia en los tramos muy largos; se recomienda validar la salida en aplicaciones críticas.
- Este repositorio es una re-subida por un usuario externo (Jairurlll), no el original de Nous Research; verificar la autenticidad del modelo antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Jairurlll/Hermes-3-Llama-3.1-8B
- Modelo original de Nous Research: https://huggingface.co/NousResearch/Hermes-3-Llama-3.1-8B
- Informe técnico de Hermes 3: https://arxiv.org/abs/2408.11857
- Página de Nous Research sobre Hermes 3: https://nousresearch.com/hermes3
- Versión GGUF de terceros: https://huggingface.co/backyardai/Hermes-3-Llama-3.1-8B-GGUF
