# DICPlay/RusMind-Sokol-4.7

## Resumen

RusMind Sokol 4.7 es un ajuste fino (finetune) del modelo base Qwen/Qwen3.5-9B desarrollado por la empresa rusa DICPlay bajo la línea de modelos RusMind. Se trata de un modelo de generación de texto de aproximadamente 8.950 millones de parámetros (8,95B), orientado específicamente al idioma ruso y con modo de razonamiento explícito (thinking), que prioriza el conocimiento de la cultura, historia, regiones y legislación de Rusia. El modelo se distribuye en formatos safetensors y GGUF, lo que permite su ejecución local y sin conexión mediante llama.cpp.

La propuesta de valor del modelo es competir con modelos mucho mayores en el benchmark ruso MERA v2, donde el autor reporta una puntuación de 0,279, situándolo como la segunda mejor modelo ruso según su clasificación y como líder entre modelos de menos de 10B parámetros. El modelo está disponible en Hugging Face con más de 14.500 descargas y se distribuye bajo la licencia propietaria "rusmind-license".

La relevancia actual del modelo reside en su enfoque en el ecosistema lingüístico ruso, un nicho donde los modelos occidentales suelen rendir por debajo de su capacidad en inglés, y en su capacidad de razonamiento multi-paso junto con soporte de tool calling, lo que lo hace atractivo para despliegues locales en entornos con requisitos de soberanía de datos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B, tag `qwen3_5_text`) |
| Parámetros totales | 8.953.803.264 (8,95B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (disponible en el repo); niveles concretos no disponibles |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | rusmind-license (licencia propietaria, `license: other`) |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es un finetune del transformer Qwen/Qwen3.5-9B, según indica la model card (`base_model_relation: finetune`). No se especifican en la información disponible detalles sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. La model card menciona que el ajuste se realizó sobre datos propios de la团队 RusMind, incluyendo datos sintéticos, fuentes abiertas, textos legales, manuales de historia y fuentes culturales rusas, con énfasis en el idioma ruso, la historia de Rusia, las regiones y la legislación de la Federación Rusa.

La innovación técnica destacable es la incorporación de un modo de razonamiento explícito (thinking), en el que el modelo elabora la respuesta paso a paso antes de emitir la salida final. No se dispone de información sobre técnicas adicionales como decodificación especulativa, atención lineal o arquitecturas híbridas SSM.

## Capacidades

- Generación de texto en ruso e inglés con modo de razonamiento explícito (thinking) previo a la respuesta.
- Razonamiento lógico y resolución de problemas multi-paso.
- Comprensión de contexto conversacional y de personajes, incluyendo tareas de tipo "teoría de la mente" según la model card.
- Corrección ortográfica y puntuación en ruso.
- Conocimiento específico de historia, cultura, regiones y legislación de Rusia.
- Soporte de tool calling y function calling, con resultados reportados en el benchmark GorillaHard.
- Ejecución de instrucciones complejas con múltiples requisitos simultáneos (benchmark IFHard).
- Capacidades agénticas y de razonamiento multi-paso orientadas a tareas de agente.
- Ejecución local y offline mediante llama.cpp y formato GGUF.
- Capacidades multilingües limitadas a ruso e inglés.

## Casos de uso

- Atención al cliente en ruso: el modelo puede gestionar conversaciones multi-turno en ruso con corrección ortográfica y conocimiento de normativa local, adecuado para empresas que operan en el mercado ruso y necesitan un asistente con comprensión cultural.
- Asistencia legal y administrativa: gracias a su entrenamiento en legislación y regiones de Rusia, puede emplearse para resumir normativa, responder consultas sobre trámites regionales o redactar borradores de documentos administrativos, siempre con revisión humana.
- Generación de código con tool calling: el soporte de function calling y su rendimiento reportado en GorillaHard lo hacen apto para integrarse en pipelines que requieran invocar APIs o herramientas externas desde un agente.
- Despliegue local en entornos con soberanía de datos: al distribuirse en GGUF y ejecutarse offline con llama.cpp, puede instalarse en infraestructura propia sin conexión a internet, útil para organismos que no pueden enviar datos a la nube.
- Educación y tutoría en ruso: el modo de razonamiento paso a paso permite explicar la resolución de problemas de lógica o matemáticas, con conocimiento de historia y cultura rusa para contextos educativos.
- Procesamiento de documentos en ruso: comprensión de contexto y trabajo con documentos según la model card, aplicable a la extracción de información de textos legales o históricos.
- Agentes autónomos multi-paso: sus capacidades agénticas reportadas en MERA v2 lo hacen adecuado para tareas que requieren planificación y ejecución de varios pasos con herramientas.

## Benchmarks y rendimiento

Los datos disponibles provienen del benchmark MERA v2 (Multimodal Evaluation for Russian-language Architectures), según la model card del autor. No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

| Benchmark | RusMind Sokol 4.7 | GigaChat 3.5 Ultra (432B) | T-pro (33B) | Gemma 4 26B | Qwen3.5-9B | T-lite |
|---|---|---|---|---|---|---|
| MERA v2 (global) | 0,279 | 0,249 | 0,196 | 0,279 | 0,186 | ~0,14 (la mitad de Sokol) |
| MERA v2 (razonamiento) | 0,459 | 0,429 | no disponible | no disponible | no disponible | no disponible |
| MERA v2 (comprensión de personas) | 0,300 | no disponible | 0,249 | no disponible | no disponible | no disponible |
| MERA v2 (cultura de Rusia) | 0,277 | no disponible | 0,233 | no disponible | no disponible | no disponible |
| IFHard (instrucciones complejas) | 0,424 | ~0,056 (7,6x menor) | ~0,053 (8x menor) | no disponible | no disponible | no disponible |
| GorillaHard (tool calling) | 0,490 | ~0,19-0,20 (2,4-2,6x menor) | ~0,19-0,20 (2,4-2,6x menor) | ~0,19-0,20 (2,4-2,6x menor) | no disponible | no disponible |

Nota: los valores de GigaChat 3.5 Ultra, T-pro y Gemma 4 26B en IFHard y GorillaHard se derivan de los multiplicadores indicados en la model card, no de cifras absolutas publicadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 8,95B en FP16 se requieren aproximadamente 18 GB de VRAM, y en cuantizaciones de 4 bits en torno a 5-6 GB (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cabría esperar funcionamiento en GPUs de 24 GB (RTX 4090, A10G) en FP16 y en GPUs de 8-12 GB con cuantización, aunque el autor no lo especifica.
- Compatibilidad con GPU de consumo: probable en GPUs de consumo con cuantización GGUF, si bien no se confirma en la información disponible.
- Opciones de despliegue: llama.cpp (soporte GGUF indicado en los tags), transformers (librería declarada); no se confirma soporte de vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MERA v2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RusMind Sokol 4.7 | 8,95B | no disponible | 0,279 | rusmind-license (propietaria) | Hugging Face, GGUF |
| Qwen3.5-9B (base) | ~9B | no disponible | 0,186 | no disponible en la información | Hugging Face |
| T-lite (T-Bank) | ~8B | no disponible | ~0,14 | no disponible en la información | no disponible |
| GigaChat 3.5 Ultra | 432B | no disponible | 0,249 | propietaria | API/plataforma Sber |
| Gemma 4 26B | 26B | no disponible | 0,279 | no disponible en la información | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: el entrenamiento está orientado explícitamente a "valores tradicionales" y a la perspectiva cultural e histórica rusa, lo que puede introducir sesgos editoriales y de encuadre en temas políticos, históricos y sociales.
- Riesgo de alucinación: como todo modelo de 9B, puede generar información incorrecta, especialmente en dominios especializados como legislación, donde la model card no garantiza exactitud factual.
- Limitaciones de idioma: solo ruso e inglés; el rendimiento en otros idiomas no está documentado.
- Limitaciones de contexto: la longitud de contexto no se especifica en la información disponible, lo que impide evaluar su idoneidad para documentos largos.
- Restricciones de licencia: la licencia "rusmind-license" es propietaria y no se detallan en la información disponible las condiciones de uso comercial; es necesario consultar el archivo LICENSE del repositorio antes de un despliegue en producción.
- Caveat de producción: los benchmarks reportados proceden del propio autor y del benchmark MERA v2; no se dispone de evaluaciones independientes de MMLU, HumanEval u otros estándares.
- El modelo depende del base Qwen3.5-9B, por lo que hereda las limitaciones de este.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-Sokol-4.7
- Plataforma RusMind: https://rusmind.ru
- Leaderboard MERA v2: https://mera.a-ai.ru/ru/text/leaderboard
- Modelo base Qwen/Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B (referenciado en la model card)
- Licencia: archivo LICENSE en el repositorio de Hugging Face
