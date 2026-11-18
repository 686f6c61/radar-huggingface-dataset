# ConnorYU/Qwen3.5-9B-tem400-Medical-SFT-1e-compile

## Resumen

ConnorYU/Qwen3.5-9B-tem400-Medical-SFT-1e-compile es un ajuste fino (fine-tuning) de un modelo de la familia Qwen3.5, derivado a su vez de ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step400. Lo desarrolla el usuario ConnorYU y está pensado para tareas de dominio médico mediante un entrenamiento de tipo SFT (supervised fine-tuning). El modelo tiene 9.409.813.744 parámetros totales (aproximadamente 9,4 mil millones) y se distribuye en formato safetensors con pesos en el repositorio de 18,8 GB.

La arquitectura declarada en los metadatos es qwen3_5, un transformer de la familia Qwen, y el pipeline registrado es image-text-to-text, lo que indica capacidades multimodales de entrada (imagen y texto) según los tags de Hugging Face. El modelo está entrenado con la librería Unsloth y TRL, según indica su model card, y se publica bajo licencia Apache 2.0.

Su relevancia actual radica en que es un ejemplo de ajuste fino especializado en medicina sobre una base ya optimizada con GRPO e instrucciones (ifeval), lo que sugiere un linaje orientado a seguir instrucciones y razonamiento. No obstante, la información pública disponible es muy escasa: no hay benchmarks, no se detalla el dataset de entrenamiento ni el contexto máximo, y el repositorio no registra descargas ni interacciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer de la familia Qwen, segun tags) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura qwen3_5, un transformer de la familia Qwen, según los tags del repositorio. El pipeline declarado es image-text-to-text, lo que sugiere que la base admite entradas multimodales de imagen y texto, aunque la model card no detalla la torre visual ni la configuración exacta de capas, cabezas de atención o dimensión oculta. Tampoco se especifica si emplea atención lineal, decodificación especulativa u otras optimizaciones de inferencia.

El entrenamiento consiste en un ajuste fino supervisado (SFT) sobre el checkpoint ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step400, que a su vez parece haber pasado por un proceso de GRPO (optimización de política con recompensa grupal) orientado a seguir instrucciones (ifeval) y con modo de razonamiento (think). El nombre del modelo incluye "tem400" y "1e-compile", que probablemente hagan referencia a hiperparámetros de entrenamiento (temperatura 400, una época, compilación), pero no hay documentación que lo confirme. El entrenamiento se realizó con Unsloth y TRL, según la model card, lo que indica un pipeline de fine-tuning eficiente en memoria. No se especifica el número de tokens de entrenamiento, la composición del dataset médico ni si hubo etapas de RLHF o DPO adicionales.

## Capacidades

- Generación de texto conversacional en inglés, con linaje orientado a seguir instrucciones (ifeval) y modo de razonamiento (think) heredado del modelo base.
- Procesamiento de entradas imagen-texto (pipeline image-text-to-text), lo que permite tareas de descripción o razonamiento sobre imágenes, aunque no se detalla el alcance exacto.
- Especialización en dominio médico mediante SFT, presumiblemente en tareas de respuesta a preguntas clínicas y texto médico.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo language del repositorio.
- Capacidades especiales (visión, audio, thinking mode): visión probable por el pipeline; thinking mode probable por el linaje GRPO-ifeval-think, aunque no se documenta explícitamente.

## Casos de uso

- Respuesta a preguntas clínicas de referencia: el modelo puede usarse para generar respuestas explicativas sobre conceptos médicos, dado su ajuste SFT en dominio médico, aunque requiere validación por profesionales.
- Resumen de literatura médica en inglés: adecuado para condensar abstracts o artículos, aprovechando su especialización y su base orientada a instrucciones.
- Asistencia en documentación clínica: generación de borradores de notas o informes en inglés a partir de texto estructurado, con revisión humana obligatoria.
- Educación médica y simulación de casos: generación de escenarios clínicos y preguntas de estudio en inglés, apoyándose en el modo de razonamiento heredado.
- Procesamiento de imágenes médicas simples: al ser image-text-to-text, podría describir o razonar sobre imágenes acompañadas de texto, aunque sin validación clínica documentada.
- Prototipado de asistentes sanitarios en investigación: útil para experimentar con pipelines de NLP médico en entornos controlados y no críticos.
- Evaluación comparativa de fine-tunings: sirve como checkpoint de referencia para estudiar el efecto del SFT médico sobre una base GRPO-ifeval.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18,8 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 24 GB para contexto corto.
- VRAM estimada en cuantización de 8 bits: en torno a 10-12 GB; en 4 bits: en torno a 6-8 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para FP16 sin cuantizar; RTX 4090 (24 GB) para FP16 con contexto limitado o cuantización.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantización o contexto reducido; en GPUs de 8-12 GB solo con cuantización agresiva (no se publican pesos GGUF).
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag), vLLM y llama.cpp/Ollama solo si se generan pesos compatibles, que no se distribuyen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ConnorYU/Qwen3.5-9B-tem400-Medical-SFT-1e-compile | 9,4 B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | SFT médico sobre base GRPO-ifeval |
| ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step400 (base) | ~9,4 B (presumible) | no disponible | no disponible | Hugging Face | Modelo base del que deriva este checkpoint |
| Modelos Qwen de ~9 B de la familia Qwen3 | ~9 B | no disponible en esta ficha | Apache 2.0 en variantes abiertas | Hugging Face | Referencia genérica de la familia; no se dispone de datos concretos verificados en la información proporcionada |

## Limitaciones y advertencias

- Información pública muy escasa: no hay benchmarks, dataset, contexto ni detalles de entrenamiento documentados, lo que impide evaluar su calidad de forma objetiva.
- Riesgo elevado de alucinación en dominio médico: un SFT especializado sin validación clínica publicada no debe usarse para decisiones diagnósticas o terapéuticas.
- Sesgos desconocidos: no se documenta la composición del dataset ni procesos de mitigación de sesgos.
- Idioma limitado al inglés según los metadatos; no se garantiza un rendimiento adecuado en castellano.
- Longitud de contexto no especificada, lo que complica el diseño de aplicaciones con documentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base y de los datos de entrenamiento, no documentada aquí.
- Repositorio sin descargas ni validación comunitaria: no hay evidencia de uso en producción ni de reproducibilidad.
- El nombre del modelo sugiere hiperparámetros concretos (tem400, 1e, compile) que no están explicados, lo que dificulta reproducir el entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/ConnorYU/Qwen3.5-9B-tem400-Medical-SFT-1e-compile
- Modelo base: https://huggingface.co/ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step400
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (Hugging Face): no disponible enlace directo en la información proporcionada
- Paper, blog o demo: no disponible
