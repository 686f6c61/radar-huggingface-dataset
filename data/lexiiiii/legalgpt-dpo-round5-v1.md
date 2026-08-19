# Lexiiiii/legalgpt-dpo-round5-v1

## Resumen

LegalGPT DPO Round 5 V1 es un adaptador LoRA desarrollado por el usuario Lexiiiii sobre el modelo base Qwen/Qwen2.5-7B-Instruct. El adaptador se ha entrenado mediante un pipeline de post-entrenamiento en dos fases (SFT seguido de DPO) con el objetivo de especializar el modelo en consultas legales sin uso de RAG (recuperación aumentada). La versión final (round5-v1) emplea un conjunto de 2019 pares de datos donde las respuestas preferidas (chosen) provienen de deepseek-chat y las rechazadas (rejected) de un modelo SFT previo.

El proyecto forma parte de un repositorio GitHub más amplio (LegalGPT) que documenta el proceso completo de entrenamiento. El adaptador se distribuye bajo licencia Apache 2.0 y está diseñado para ser cargado mediante la librería PEFT sobre el modelo base de Qwen2.5-7B-Instruct. Aunque el repositorio tiene un tamaño declarado de 0.0 GB (posiblemente por un error de indexación), el adaptador contiene los pesos de las capas LoRA en formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-7B-Instruct (transformer decoder) |
| Parametros totales | No disponible (el adaptador LoRA solo entrena una fracción; el modelo base tiene 7.6B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, Qwen2.5-7B-Instruct soporta 32 768 tokens) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en precisión original, probablemente FP32 o BF16) |
| Idiomas soportados | No disponible (el modelo base soporta múltiples idiomas, pero el adaptador está orientado a consultas legales en chino, según el README) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen2.5-7B-Instruct, un modelo de lenguaje basado en transformer con decodificación autoregresiva. El ajuste se realiza mediante LoRA (Low-Rank Adaptation) con rango 32 y alpha 64, aplicado únicamente a las proyecciones de atención q_proj y v_proj. El entrenamiento se ejecuta con la herramienta LLaMA-Factory y sigue un pipeline de dos etapas: primero un ajuste supervisado (SFT) y posteriormente un refinamiento con DPO (Direct Preference Optimization) en una quinta ronda (round5). El conjunto de datos de DPO contiene 2019 pares de preferencias, donde las respuestas elegidas provienen de deepseek-chat y las rechazadas de un modelo SFT anterior. No se especifican detalles adicionales sobre el volumen total de tokens de entrenamiento, la composición del corpus ni el uso de técnicas como RLHF o decodificación especulativa.

## Capacidades

- Especialización en consultas legales sin RAG, es decir, el modelo responde directamente a partir de su conocimiento interno sin necesidad de recuperar documentos externos.
- Al estar basado en Qwen2.5-7B-Instruct, hereda las capacidades generales del modelo base: generación de texto, razonamiento, comprensión de instrucciones y soporte multilingüe (aunque el adaptador se ha entrenado principalmente con datos en chino).
- No se dispone de información sobre soporte de tool calling, function calling, capacidades de agente o modos de pensamiento extendido; el adaptador se centra en la tarea de consulta legal.
- El README no menciona capacidades multimodales (visión, audio) ni modos especiales de razonamiento.

## Casos de uso

- Asistente de consulta legal para usuarios finales: el modelo puede responder preguntas sobre normativas, procedimientos o conceptos jurídicos generales en un entorno conversacional, sin necesidad de integrar un sistema de recuperación.
- Soporte interno para despachos de abogados: el adaptador puede desplegarse como un chatbot interno para ayudar a los profesionales a redactar borradores de respuestas a clientes o resumir argumentos legales básicos.
- Generación de documentación legal preliminar: a partir de una descripción del caso, el modelo puede esbozar cláusulas, contratos simples o avisos legales, siempre que se supervise el resultado.
- Formación y educación jurídica: como herramienta de estudio para estudiantes de derecho, el modelo puede explicar conceptos legales o simular escenarios de consulta.
- Integración en aplicaciones de atención al cliente: empresas con necesidades legales recurrentes pueden incorporar el modelo en sus flujos de soporte para resolver dudas frecuentes sobre políticas, reclamaciones o normativas.
- Prototipado rápido de soluciones legales: al ser un adaptador ligero, permite probar funcionalidades legales sobre el modelo base sin necesidad de reentrenar un modelo completo, facilitando iteraciones ágiles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El README no incluye métricas como MMLU, HumanEval, GSM8K ni comparativas con otros modelos legales. Tampoco se proporcionan datos de latencia o throughput.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa muy poco espacio (probablemente menos de 100 MB), pero debe cargarse junto con el modelo base Qwen2.5-7B-Instruct.
- Para inferencia en FP16, el modelo base requiere aproximadamente 14-16 GB de VRAM (estimación típica para un modelo de 7B). No se dispone de cifras exactas para este adaptador.
- Se puede ejecutar en GPUs de consumo como RTX 3090, RTX 4090 o A10 (24 GB) si se usa cuantización (por ejemplo, 4 bits con bitsandbytes), aunque no se especifica compatibilidad oficial.
- Para despliegue en producción, se recomienda usar vLLM, TGI o llama.cpp con el modelo base y cargar el adaptador PEFT. También es posible usar Ollama si se convierte el adaptador a formato GGUF.
- No se proporcionan datos de latencia ni throughput medidos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (adaptadores LoRA legales sobre Qwen2.5-7B). Existen otros proyectos llamados LegalGPT (como los encontrados en GitHub o sitios web comerciales), pero no están directamente relacionados con este adaptador y no se pueden comparar sin datos objetivos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El adaptador se ha entrenado con un conjunto de datos limitado (2019 pares de DPO) y exclusivamente para consultas legales sin RAG; su precisión en dominios jurídicos complejos o en jurisdicciones específicas no está garantizada.
- No se ha evaluado el modelo en benchmarks estándar ni en pruebas de sesgo o alucinación; el riesgo de generar información legal incorrecta o desactualizada es alto.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre la exactitud legal de las respuestas; el uso profesional debe supervisarse por un abogado.
- El modelo base Qwen2.5-7B-Instruct tiene sesgos inherentes y puede producir contenido inapropiado o discriminatorio; el adaptador no corrige estos sesgos.
- El adaptador está orientado principalmente al idioma chino (según el README), por lo que su rendimiento en otros idiomas puede ser inferior.
- No se indica el tamaño exacto del adaptador ni se proporcionan instrucciones de cuantización; la carga en entornos con poca memoria puede requerir ajustes adicionales.
- El repositorio tiene un tamaño declarado de 0.0 GB, lo que sugiere que puede haber un error en la indexación; se recomienda verificar la integridad de los archivos antes de su uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lexiiiii/legalgpt-dpo-round5-v1
- Repositorio del proyecto LegalGPT (según la model card): https://github.com/czc0407/legalGPT
- Otros proyectos homónimos (no afiliados): https://github.com/Terry-ferns13/LegalGPT, https://github.com/pandafire5740/LegalGPT, https://www.thelawgpt.com/, https://www.legalgpt.pro/, https://www.lawgpt.com/
