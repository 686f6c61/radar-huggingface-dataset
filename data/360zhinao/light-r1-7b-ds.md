# 360ZhiNao/Light-R1-7B-DS

## Resumen

Light-R1-7B-DS es un modelo de lenguaje de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) especializado en razonamiento matemático, desarrollado por el equipo Light-R1 de Qihoo 360 (360ZhiNao). Se obtiene mediante un ajuste fino supervisado (SFT) adicional sobre deepseek-ai/DeepSeek-R1-Distill-Qwen-7B, que a su vez parte de la arquitectura Qwen2. El modelo se distribuye con licencia Apache 2.0 y pesos en formato safetensors.

El problema que aborda es el coste de entrenamiento de modelos de razonamiento de cadena larga (long chain-of-thought). Frente a pipelines que requieren millones de muestras, Light-R1-7B-DS se entrena únicamente con un conjunto de 3.000 ejemplos de SFT, publicado por el propio equipo, y aun así alcanza resultados de referencia entre los modelos abiertos de 7B en matemáticas: 59,1 en AIME24, 44,3 en AIME25 y 49,4 en GPQA. Según el autor, es el modelo de matemáticas de 7B de código abierto con mejor rendimiento en AIME24 y AIME25 en el momento de su publicación.

Su relevancia actual reside en la eficiencia de datos: demuestra que un ajuste fino pequeño y bien curado sobre un destilado de R1 puede superar al modelo base y competir con modelos más grandes o con entrenamientos más costosos, lo que lo hace atractivo para equipos con recursos limitados que necesitan razonamiento matemático fiable en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino de DeepSeek-R1-Distill-Qwen-7B |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos originales en safetensors; al ser Qwen2 es compatible con cuantizaciones GGUF/AWQ habituales, sin confirmacion del autor) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 15,2 GB) |

## Arquitectura y entrenamiento

Light-R1-7B-DS es un transformer decoder-only de la familia Qwen2, heredado de DeepSeek-R1-Distill-Qwen-7B, que a su vez se destiló de Qwen2.5-Math-7B. El modelo conserva la arquitectura y los pesos del destilado y añade un entrenamiento de ajuste fino supervisado (SFT) con solo 3.000 ejemplos, publicados en el dataset qihoo360/Light-R1-SFTData. No se documentan en la informacion disponible detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO en esta variante concreta (el informe técnico asociado, arXiv:2503.10460, cubre el proyecto Light-R1 con curriculum SFT, DPO y RL, pero la model card no desglosa qué fases se aplicaron a esta versión de 7B).

La innovación destacable es el énfasis en la descontaminación de datos: el equipo aplica coincidencia exacta (excluyendo dígitos) y coincidencia de n-gramas con N=32 para evitar fugas de benchmarks en el post-entrenamiento, y advierte de que MATH-500 está parcialmente comprometido mientras que AIME24 y AIME25 permanecen intactos. El modelo genera cadenas de razonamiento largas (long CoT) al estilo de DeepSeek-R1, lo que implica respuestas más extensas y mayor coste de decodificación que un modelo instruct convencional.

## Capacidades

- Generación de texto y razonamiento matemático de cadena larga (long chain-of-thought), con resultados destacados en competiciones tipo AIME.
- Razonamiento científico general: obtiene 49,4 en GPQA sin entrenamiento específico para esa tarea.
- Generación de código y matemáticas aplicadas, heredadas del modelo base Qwen2.5-Math.
- Conversación multi-turno (tag `conversational` en el repositorio).
- Compatibilidad con text-generation-inference y endpoints compatibles, según los tags del repositorio.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el long CoT es aplicable a pipelines de razonamiento, pero no se confirma integración de agentes.
- Capacidades multilingües: no disponibles; la model card no detalla idiomas.
- Capacidades especiales (visión, audio, modo thinking explícito): no disponibles.

## Casos de uso

- Resolución de problemas matemáticos de competición: el modelo está diseñado para generar cadenas de razonamiento largas y verificar pasos, adecuado para plataformas educativas que necesitan explicaciones detalladas de problemas de nivel AIME u olimpiadas.
- Tutoría matemática automatizada: puede desglosar un problema en pasos intermedios y justificar cada uno, lo que encaja en asistentes de estudio que requieren trazabilidad del razonamiento.
- Generación de datasets de razonamiento sintético: con 59,1 en AIME24, es un buen generador de soluciones de alta calidad para destilar conocimiento en modelos más pequeños o para aumentar datasets de entrenamiento.
- Evaluación y verificación de soluciones: puede usarse como modelo de referencia para comprobar respuestas de otros modelos en pipelines de evaluación automática de matemáticas.
- Razonamiento científico en preguntas de posgrado: su 49,4 en GPQA permite usarlo en asistentes de investigación que responden preguntas de física, química o biología de nivel avanzado.
- Despliegue en entornos con recursos limitados: al ser un modelo de 7,6B con licencia Apache 2.0, puede servirse en una sola GPU y ajustarse a infraestructuras modestas para tareas de razonamiento intensivo.
- Generación de código con razonamiento previo: útil en pipelines de CI/CD donde se requiere explicar la lógica de una corrección antes de aplicar un parche, aunque no se documenta soporte explícito de tool calling.

## Benchmarks y rendimiento

| Modelo | Entrenado desde | Fecha | AIME24 | AIME25 | GPQA |
|---|---|---|---|---|---|
| OpenThinker-7B | Qwen2.5-7B-Instruct | 25.2.12 | 31,3 | no disponible | 42,4 |
| DeepSeek-R1-Distill-Qwen-7B | Qwen2.5-Math-7B | 25.1.20 | 55,5 | 39,2 | 49,1 |
| Light-R1-7B-DS | DeepSeek-R1-Distill-Qwen-7B | 25.3.12 | 59,1 | 44,3 | 49,4 |
| Light-R1-32B | Qwen2.5-32B-Instruct | 25.3.4 | 76,6 | 64,6 | 61,8 |

Los datos proceden de la model card del autor. No se han publicado en la informacion disponible resultados de MMLU, HumanEval ni GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 7,6B en FP16 se necesitan aproximadamente 15,2 GB de pesos, y en cuantización de 8 bits unos 8 GB, aunque estas cifras son estimaciones genéricas y no datos del autor.
- GPU recomendadas: no especificadas por el autor; por tamaño, una A100 40 GB, H100 o L40S permiten FP16 con margen para contexto largo; una RTX 4090 (24 GB) es suficiente en FP16 ajustado o en cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) con cuantización o FP16 con contexto moderado; en GPUs de 16 GB requeriría cuantización de 8 bits o inferior.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag del repo) y endpoints compatibles; vLLM, llama.cpp, Ollama o TGI no se confirman explícitamente en la informacion disponible, aunque la arquitectura Qwen2 es ampliamente soportada por estas herramientas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | AIME24 | AIME25 | GPQA | Licencia |
|---|---|---|---|---|---|---|
| Light-R1-7B-DS | 7,6B | no disponible | 59,1 | 44,3 | 49,4 | Apache 2.0 |
| DeepSeek-R1-Distill-Qwen-7B | 7,6B | no disponible | 55,5 | 39,2 | 49,1 | MIT (según el modelo base; no confirmado en esta ficha) |
| OpenThinker-7B | 7B | no disponible | 31,3 | no disponible | 42,4 | no disponible |
| Light-R1-32B | 32B | no disponible | 76,6 | 64,6 | 61,8 | Apache 2.0 |

Light-R1-7B-DS supera a su modelo base en AIME24 (+3,6 puntos) y AIME25 (+5,1 puntos) con solo 3.000 ejemplos de SFT, y duplica ampliamente a OpenThinker-7B en AIME24. Frente a Light-R1-32B pierde rendimiento absoluto, como es esperable por la diferencia de tamaño, pero ofrece un coste de inferencia mucho menor.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al heredar de Qwen2.5-Math y DeepSeek-R1, puede reproducir sesgos de esos modelos base.
- Riesgo de alucinación: elevado en dominios fuera de matemáticas y ciencias, ya que el ajuste se centra en razonamiento matemático y no se documenta un entrenamiento de alineación específico para esta variante.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se detallan; la model card está en inglés y no confirma rendimiento multilingüe.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base DeepSeek-R1-Distill-Qwen-7B, que puede imponer condiciones adicionales.
- Caveat de producción: el long CoT genera respuestas largas, lo que incrementa latencia y coste de tokens; además, el modelo está especializado en matemáticas y puede degradarse en tareas generales de conversación.
- Contaminación de benchmarks: el autor advierte de que MATH-500 está parcialmente comprometido en el ecosistema y que las comparaciones deben hacerse con cautela; AIME24 y AIME25 se consideran intactos tras la descontaminación del equipo.
- El repositorio no registra descargas ni likes y fue creado en 2026-11-14, por lo que la validación comunitaria es inexistente en el momento de la consulta.

## Enlaces

- Hugging Face: https://huggingface.co/360ZhiNao/Light-R1-7B-DS
- Repositorio del proyecto en Hugging Face: https://huggingface.co/qihoo360/Light-R1-7B-DS
- Modelo Light-R1-32B: https://huggingface.co/qihoo360/Light-R1-32B
- Dataset de SFT: https://huggingface.co/datasets/qihoo360/Light-R1-SFTData
- Informe técnico: https://arxiv.org/abs/2503.10460
- GitHub: https://github.com/Qihoo360/Light-R1
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
