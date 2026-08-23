# Kanha-AI/kanha-kanha.ai-1.7b-grounded-qlora-2ep-v1

## Resumen

Kanha-AI/kanha-kanha.ai-1.7b-grounded-qlora-2ep-v1 es un modelo de lenguaje compacto de 1.720 millones de parámetros, desarrollado por Kanha-AI como parte de su plataforma de chatbots personalizados que se ejecutan en el navegador del cliente mediante WebGPU. Se trata de un fine-tuning del modelo Qwen3-1.7B mediante QLoRA, entrenado específicamente para responder preguntas sobre el contenido del sitio web de Kanha.ai. El modelo está diseñado para operar bajo un contrato de inferencia "grounded": solo debe responder utilizando el contexto que se le proporciona, y si la respuesta no está en el contexto, debe devolver una frase de rechazo exacta.

Este checkpoint se publica con fines de investigación comparativa de métodos de entrenamiento y evaluación controlada de sistemas de pregunta-respuesta sobre sitios web. Su relevancia radica en demostrar la viabilidad de generar asistentes de conversación ligeros y específicos de dominio, capaces de ejecutarse en dispositivos de usuario final con recursos limitados. La arquitectura base es un transformer decoder-only de 1.7B parámetros, con una longitud de contexto de 2048 tokens y entrenamiento en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | 2048 tokens (maxima de entrenamiento) |
| Tipos de cuantizacion | bfloat16 (pesos fusionados), q4f16_1 (artefactos MLC) |
| Idiomas soportados | Inglés |
| Licencia | No disponible |
| Formato de pesos | safetensors (bfloat16), MLC (q4f16_1) |

## Arquitectura y entrenamiento

El modelo se obtiene mediante fine-tuning del checkpoint `Qwen/Qwen3-1.7B` (revision `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e`) con el metodo QLoRA. El entrenamiento se realizo durante 2 epocas sobre un dataset propio de 210 registros de entrenamiento y 45 de validacion, derivado del contenido del sitio web de Kanha.ai. La configuracion LoRA emplea rank 16, alpha 16, dropout 0.05 y afecta a todas las proyecciones lineales del transformer: `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El loss se calcula exclusivamente sobre las respuestas del asistente (assistant-only), con una longitud maxima de secuencia de 2048 tokens, learning rate de 0.0001, batch size por dispositivo de 8 y acumulacion de gradientes de 2. Los pesos se fusionaron en bfloat16. El chat template nativo de Qwen se usa con `enable_thinking=False`, y el modelo requiere un system prompt fijo que obliga a responder solo con el contexto proporcionado, devolviendo literalmente `I can't answer that from the provided context` cuando la respuesta no aparece en el contexto.

## Capacidades

- Generacion de texto condicionada a contexto: el modelo responde preguntas unicamente en base al fragmento de contexto recuperado que se le proporciona en el prompt.
- Rechazo controlado: si la respuesta no esta presente en el contexto, devuelve una frase de rechazo fija, lo que reduce alucinaciones en escenarios de QA con recuperacion.
- Razonamiento basico: el modelo hereda las capacidades de razonamiento del base Qwen3-1.7B, aunque su entrenamiento especifico lo orienta a tareas de extraccion y sintesis de informacion.
- Soporte de chat en ingles: limitado al idioma ingles, tanto en preguntas como en contexto.
- Compatibilidad con MLC: se proporcionan artefactos MLC con cuantizacion `q4f16_1`, lo que permite ejecucion en dispositivos con WebGPU.
- No incluye soporte para tool calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Investigacion comparativa de metodos de entrenamiento: permite evaluar el efecto del fine-tuning QLoRA sobre un modelo base pequeño en tareas de QA con contexto, frente a otros checkpoints entrenados con el mismo dataset.
- Evaluacion controlada de sistemas de pregunta de preguntas en sitios web: el modelo sirve como referencia para medir precision, recall y tasa de rechazo en entornos de QA con contexto recuperado.
- Prototipo de chatbot de documentacion web: dado que el modelo responde solo con el contexto suministrado, puede integrarse en un pipeline de recuperacion (RAG) para responder sobre el contenido de un sitio web especifico, sin necesidad de servidor de inferencia.
- Demostracion de inferencia en el navegador: con los artefactos MLC, el modelo puede ejecutarse en el cliente via WebGPU, reduciendo costes de API y latencia de red, util para demos o pruebas de concepto.
- Analisis de robustez frente a datos fuera de dominio: el sistema de rechazo permite estudiar el comportamiento del modelo cuando el contexto no contiene la respuesta, util para medir tasas de falsos positivos en QA.
- Base para experimentos de destilacion o compression: al ser un modelo pequeño, sirve para probar tecnicas de cuantizacion y optimizacion antes de aplicarlas a modelos mayores.

## Benchmarks y rendimiento

Los resultados de evaluacion publicados en la model card son metricas propias del dataset de Kanha, no benchmarks estandarizados. Se presentan a continuacion:

| Metrica | Valor |
|---|---|
| dates_recall | 1.0 |
| deterministic_pass_rate | 0.4231 |
| list_recall | 0.6051 |
| numbers_recall | 0.9718 |
| refusal_rate | 0.1154 |
| unsupported_value_rate | 0.0385 |
| urls_recall | 1.0 |
| Total de muestras evaluadas | 26 |

Estas metricas indican un recall perfecto para fechas y URLs, una alta precision en numeros, pero una tasa de pases deterministas moderada (42%) y una tasa de rechazo del 11.5% en el conjunto de evaluacion. No se han publicado resultados de benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, el modelo ocupa aproximadamente 3.4 GB (1.72B * 2 bytes). Con cuantizacion q4f16_1, la huella se reduce a unos 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM en bfloat16 (p. ej. RTX 3060, RTX 4060, A10G) o 2 GB en cuantizacion q4 (p. ej. RTX 3050, integradas con WebGPU).
- Compatibilidad con consumer GPU: si, tanto en NVIDIA como en AMD y Apple Silicon, especialmente con cuantizacion q4 y despliegue via MLC.
- Opciones de despliegue: se puede servir con vLLM, TGI, llama.cpp o Ollama para inferencia local; los artefactos MLC permiten ejecucion en navegador via WebGPU.
- Latencia y throughput: no se proporcionan datos de latencia o throughput en la informacion disponible.

## Comparativa con modelos similares

No se dispone de informacion comparativa con otros modelos en la documentacion proporcionada. El modelo base Qwen3-1.7B es el unico punto de referencia directo, pero no se publican metricas del base en la misma tarea. No se puede establecer una comparativa objetiva con alternativas como Llama-3.2-1B, Gemma-2-2B o Phi-3.5-mini sin datos de rendimiento en el mismo dataset y condiciones de evaluacion.

## Limitaciones y advertencias

- El modelo puede producir respuestas incorrectas, incompletas o desactualizadas, especialmente si el contexto recuperado es ambiguo o incompleto.
- Puede memorizar contenido del dataset de entrenamiento, lo que podria filtrar informacion privada o especifica del sitio web de Kanha.ai si se expone a usuarios finales.
- La inferencia fuera del contrato "grounded" (sin contexto recuperado) esta fuera del ambito de entrenamiento y evaluacion, y puede generar respuestas no fiables.
- El modelo esta entrenado exclusivamente en ingles; no soporta otros idiomas.
- No se ha publicado la licencia del modelo, por lo que su uso comercial puede estar restringido o ser incierto.
- El dataset de entrenamiento es muy pequeno (210 muestras) y especifico del dominio de Kanha.ai, lo que limita su generalizacion a otros contextos.
- La evaluacion se realizo sobre 26 muestras, un conjunto muy reducido que no garantiza robustez estadistica.

## Enlaces

- HuggingFace: https://huggingface.co/Kanha-AI/kanha-kanha.ai-1.7b-grounded-qlora-2ep-v1
- Organizacion Kanha-AI en HuggingFace: https://huggingface.co/Kanha-AI
- Repositorio GitHub de Kanha-AI: https://github.com/Kanha-AI/Kanha-AI
- Organizacion Kanha-AI en GitHub: https://github.com/Kanha-AI
- Sitio web de Kanha.ai: https://kanha.ai
- Sitio web de Kanha AI (companion infantil): https://kanhaji.ai/
