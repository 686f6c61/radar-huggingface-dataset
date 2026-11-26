# HumanjavaEnterprises/Olmo-3-7B-Cooking-Assistant

## Resumen

Olmo-3-7B Cooking-Assistant es un ajuste fino (fine-tune) del modelo base allenai/Olmo-3-1025-7B de Ai2, desarrollado por HumanjavaEnterprises. Está especializado en asistencia culinaria: leer recetas proporcionadas por el usuario, escalar cantidades, convertir unidades y responder preguntas generales de cocina y seguridad alimentaria. El modelo emplea una arquitectura transformer densa con 7.298.011.136 parámetros (aproximadamente 7,3 mil millones) y se distribuye en bfloat16 con pesos safetensors, además de un adaptador LoRA de rango 128.

Su relevancia radica en dos factores. Primero, su linaje auditable: todos los modelos que intervinieron en el entrenamiento y la evaluación (gpt-oss-120b de OpenAI, Granite 4.2 de IBM y OLMo de Ai2) son de pesos abiertos y publicados por laboratorios estadounidenses, y los datos de entrenamiento del modelo base son públicos. Segundo, su comportamiento de abstención: en lugar de inventar cantidades cuando no dispone de la receta, tiende a pedirla, lo que reduce el riesgo de alucinación en un dominio donde los errores de dosificación importan.

El modelo está pensado para un patrón de uso concreto: ajuste fino para el comportamiento, recuperación (retrieval) para los hechos y herramientas para los cálculos. Es la primera versión (v2) de la familia Cooking Assistant construida sobre OLMo 3 7B, tras las versiones iniciales sobre Qwen3-8B y GLM-4-9B. Su punto fuerte es el inglés; fuera de ese idioma es más débil que el modelo hermano basado en Qwen3-8B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base OLMo 3 7B) |
| Parametros totales | 7.298.011.136 (~7,3 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (el ejemplo de despliegue usa max-model-len 8192) |
| Tipos de cuantizacion | bfloat16 (pesos completos); GGUF Q4_K_M disponible en el repositorio hermano |
| Idiomas soportados | Ingles (language: en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16), adaptador LoRA en `adapter/`, GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo parte de OLMo 3 7B, un transformer denso de Ai2 cuyos datos de preentrenamiento son públicos. Sobre esa base se aplicó un ajuste fino supervisado con un adaptador LoRA de rango 128, manteniendo los embeddings y la cabeza de salida entrenados en su totalidad. El resultado se fusionó en un checkpoint en bfloat16 de 14,6 GB. El entrenamiento se orientó a tres comportamientos: lectura y respuesta a partir del texto de una receta proporcionada, aritmética de escalado (equivalencias de unidades, huevos en cantidades impares, líneas de ⅓ de taza) y abstención o petición de la receta cuando esta falta.

El modelo usa la plantilla ChatML (`<|im_start|>role` … `<|im_end|>`), incluida en `chat_template.jinja`, sin prompt de sistema inyectado y sin modo de razonamiento (thinking mode). El prompt de sistema con el que fue entrenado recomienda presentar al modelo como asistente culinario que reconoce sus incertidumbres. La evaluación se realizó sobre un conjunto fijo de 682 preguntas de cocina en 21 idiomas, nunca usado en entrenamiento, con respuestas puntuadas por tres jueces de pesos abiertos (gpt-oss-120b, Granite 4.2 30B y OLMo 3.1 32B Instruct), contando el veredicto cuando dos de tres coinciden y aplicando una comprobación por reglas para descartar falsos positivos de "inventa" cuando el detalle ya estaba en la pregunta.

## Capacidades

- Generacion de texto conversacional especializado en cocina, con soporte multi-turno mediante ChatML.
- Lectura y respuesta a partir de recetas incluidas en el turno del usuario.
- Escalado de recetas: aritmetica de proporciones, equivalencias de unidades y conversiones de cantidades.
- Abstención: pide la receta cuando no la tiene en lugar de inventar detalles.
- Respuesta a preguntas generales de cocina, ingredientes, tecnicas y seguridad alimentaria.
- Capacidad multilingue limitada: entrenado y optimizado para ingles; el conjunto de evaluacion cubre 21 idiomas pero el rendimiento fuera del ingles es notablemente inferior.
- No dispone de modo de razonamiento explicito (thinking mode) ni de capacidades de vision o audio.
- No se documenta soporte de tool calling ni de function calling en la informacion proporcionada.

## Casos de uso

- Asistente culinario en aplicaciones de recetas: la app recupera la receta de su base de datos y la inserta en el turno del usuario; el modelo la lee y responde preguntas sobre sustituciones o pasos, con una tasa de acierto del 91,5 % en ingles cuando la receta esta presente.
- Escalado de raciones en planificadores de comidas: el modelo maneja aritmetica de proporciones, huevos en cantidades impares y lineas de ⅓ de taza, lo que lo hace adecuado para generar listas de la compra ajustadas al numero de comensales.
- Conversion de unidades en asistentes de cocina domestica: responde a preguntas del tipo "¿cuanto son 300 ml en tazas?" apoyandose en el contexto de la receta proporcionada.
- Atencion al cliente de marcas de alimentacion: gestiona conversaciones multi-turno sobre ingredientes, alinegenos y tecnicas, con abstención ante preguntas que requieren datos que no se le han facilitado.
- Despliegue en dispositivos con recursos limitados: con cuantizacion Q4_K_M funciona en una GPU de 6 GB, lo que permite integrarlo en asistentes de cocina locales o en el borde (edge).
- Filtrado y moderacion de contenido culinario: su comportamiento de abstención y su tendencia a pedir la fuente lo hacen util para validar que las respuestas de un sistema mayor se apoyan en una receta real y no en detalles inventados.
- Generacion de borradores de fichas tecnicas de recetas: a partir de una receta fuente, el modelo puede reformular pasos y cantidades manteniendo la trazabilidad del texto original.

## Benchmarks y rendimiento

Resultados sobre un conjunto fijo de 682 preguntas de cocina (21 idiomas), con veredicto por mayoria de tres jueces de pesos abiertos. La columna "base" corresponde a OLMo 3 7B preentrenado sin instrucciones.

| Metrica | OLMo 3 7B base | Este modelo (v2) | Qwen3-8B Cooking Assistant v1 |
|---|---|---|---|
| Inventa sin receta: todos los idiomas | 49,3 % | 21,1 % | 6,8 % |
| Inventa sin receta: ingles | 52,2 % | 4,4 % | 2,9 % |
| Correcto con receta mostrada: todos los idiomas | 52,0 % | 80,3 % | 92,0 % |
| Correcto con receta mostrada: ingles | 70,4 % | 91,5 % | 91,7 % |
| Preguntas generales: todos los idiomas (82) | 17,1 % | 22,0 % | 48,8 % |
| Preguntas generales: ingles (20) | 55 % | 65 % | 65 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Pesos completos en bfloat16: 14,6 GB, por lo que la inferencia en precision completa requiere al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40 GB, H100).
- Cuantizacion Q4_K_M (GGUF): funciona en una GPU de 6 GB, segun la model card.
- GPU recomendadas para precision completa: A100, H100, RTX 4090; para cuantizacion, tarjetas consumer de 6 GB en adelante.
- Opciones de despliegue: Transformers (con `device_map="auto"`), vLLM (`vllm serve ... --max-model-len 8192`), llama.cpp, Ollama y LM Studio mediante los ficheros GGUF del repositorio hermano.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Olmo-3-7B Cooking-Assistant (este) | ~7,3 B | No disponible | Apache-2.0 | Cocina, abstención, linaje auditable | Hugging Face (safetensors + LoRA + GGUF) |
| Qwen3-8B Cooking-Assistant | ~8 B | No disponible | No disponible en la informacion | Cocina, mejor rendimiento general y multilingue | Hugging Face |
| GLM-4-9B Cooking-Assistant | ~9 B | No disponible | No disponible en la informacion | Cocina | Hugging Face |
| OLMo-3-1025-7B (base) | ~7,3 B | No disponible | No disponible en la informacion | Modelo base de proposito general | Hugging Face (Ai2) |

En las metricas de la familia, el modelo Qwen3-8B supera a este OLMo 3 7B en todos los idiomas (6,8 % frente a 21,1 % de invenciones sin receta; 92,0 % frente a 80,3 % de acierto con receta) y en preguntas generales (48,8 % frente a 22,0 %). En ingles, las diferencias se estrechan: 2,9 % frente a 4,4 % de invenciones y 91,7 % frente a 91,5 % de acierto con receta.

## Limitaciones y advertencias

- Rendimiento fuera del ingles notablemente inferior al del modelo hermano Qwen3-8B Cooking Assistant: 21,1 % de invenciones sin receta en todos los idiomas frente al 6,8 % del Qwen.
- Respuestas a preguntas generales de cocina mas debiles que las del Qwen3-8B (22,0 % frente a 48,8 % en todos los idiomas).
- Riesgo de alucinacion en detalles de recetas cuando no se le proporciona el texto: 4,4 % en ingles y 21,1 % en el conjunto multilingue.
- El modelo no memoriza recetas; su uso previsto requiere que la aplicacion recupere y entregue la receta como contexto.
- No dispone de modo de razonamiento ni de capacidades multimodales.
- Es un ajuste fino no oficial de OLMo 3 7B: no esta hecho ni respaldado por Ai2.
- Licencia Apache-2.0, que permite uso comercial, pero conviene verificar las condiciones de los datos de evaluacion y del modelo base.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validacion por parte de la comunidad.
- No se documentan sesgos especificos ni evaluaciones de seguridad en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HumanjavaEnterprises/Olmo-3-7B-Cooking-Assistant
- Repositorio GGUF: https://huggingface.co/HumanjavaEnterprises/Olmo-3-7B-Cooking-Assistant-GGUF
- Modelo hermano Qwen3-8B: https://huggingface.co/HumanjavaEnterprises/Qwen3-8B-Cooking-Assistant
- Modelo hermano GLM-4-9B: https://huggingface.co/HumanjavaEnterprises/GLM-4-9B-Cooking-Assistant
- Guia y codigo: https://github.com/HumanjavaEnterprises/qwen3-8b-cooking-assistant/tree/main/olmo-3-7b
- Modelo base: https://huggingface.co/allenai/Olmo-3-1025-7B
- Dataset de evaluacion: https://huggingface.co/datasets/HumanjavaEnterprises/cooking-assistant-eval
