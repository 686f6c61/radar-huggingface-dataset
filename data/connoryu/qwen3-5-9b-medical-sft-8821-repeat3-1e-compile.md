# ConnorYU/Qwen3.5-9B-Medical-SFT-8821-repeat3-1e-compile

## Resumen

Qwen3.5-9B-Medical-SFT-8821-repeat3-1e-compile es un ajuste fino (SFT) del modelo base unsloth/Qwen3.5-9B, publicado por el usuario ConnorYU en Hugging Face. El modelo conserva la arquitectura y el pipeline multimodal del original (image-text-to-text) y ha sido entrenado con la librería Unsloth y TRL de Hugging Face, según indica el autor en la model card. El nombre del repositorio sugiere un entrenamiento orientado al dominio médico ("Medical-SFT"), aunque la model card no documenta el dataset, el número de pasos ni la composición de los datos utilizados.

El modelo cuenta con 9.653.104.368 parámetros totales según los pesos en safetensors, lo que lo sitúa en la franja de los 9B-10B. El repositorio ocupa 19,3 GB y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales más allá de las que impone la propia licencia. El pipeline declarado es image-text-to-text, por lo que hereda la capacidad de procesar imágenes junto con texto del modelo base Qwen3.5.

La relevancia de esta ficha es limitada: se trata de un modelo con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados, sin documentación del proceso de entrenamiento y con una model card mínima generada por la plantilla de Unsloth. Es útil como referencia de un experimento de ajuste fino sobre Qwen3.5-9B, pero no como un modelo listo para producción sin una evaluación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basada en Qwen3.5-9B; detalles internos no disponibles |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base unsloth/Qwen3.5-9B, un transformer multimodal del linaje Qwen 3.5 con pipeline image-text-to-text. No se dispone de información sobre el número de capas, la dimensión oculta, el mecanismo de atención ni la longitud de contexto del modelo base en la información proporcionada. El ajuste fino se realizó con Unsloth y TRL, según la model card, lo que habitualmente implica un entrenamiento supervisado (SFT) con LoRA o QLoRA y posterior fusión de pesos, aunque el autor no especifica la configuración exacta.

No hay datos sobre el número de tokens de entrenamiento, la composición del dataset médico, la existencia de RLHF o DPO, ni innovaciones técnicas destacables. El sufijo del nombre del repositorio ("repeat3-1e-compile") sugiere repetición del dataset tres veces y una tasa de aprendizaje de 1e-5 con compilación, pero se trata de una inferencia a partir del nombre y no de información documentada por el autor. No se puede confirmar ninguno de estos extremos.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen3.5-9B.
- Procesamiento de entradas imagen-texto (pipeline image-text-to-text), lo que permite responder a preguntas sobre imágenes.
- Ajuste orientado al dominio médico según el nombre del repositorio, aunque sin documentación que lo respalde.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language` del repositorio.
- Modo thinking, visión, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Asistencia en consulta médica de baja criticidad: el modelo podría emplearse para resumir notas clínicas o responder preguntas frecuentes de pacientes en inglés, siempre con supervisión profesional y evaluación previa, dado que no hay benchmarks que avalen su calidad clínica.
- Procesamiento de informes con imágenes: al heredar el pipeline image-text-to-text, podría extraer información de radiografías, ecografías u otros estudios de imagen acompañados de texto, aunque sin validación documentada de precisión.
- Generación de documentación clínica: redacción de resúmenes de historiales o informes estructurados en inglés, aprovechando el ajuste SFT sobre datos médicos que sugiere el nombre del repositorio.
- Prototipado de asistentes sanitarios: servir como base para experimentos de investigación en NLP clínico en inglés, con la advertencia de que su licencia Apache 2.0 permite uso comercial pero no exime de validación regulatoria.
- Investigación en ajuste fino: el modelo es útil como referencia de un pipeline Unsloth + TRL sobre Qwen3.5-9B para comparar técnicas de SFT en dominio médico.
- Traducción y adaptación de contenido médico: conversión de material divulgativo o técnico del inglés a otros idiomas, aunque el modelo solo declara soporte de inglés y la calidad multilingüe no está verificada.
- Extracción de entidades clínicas: identificación de fármacos, diagnósticos y dosis en textos médicos en inglés, con validación humana obligatoria por el riesgo de alucinación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 19,3 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 24 GB para contexto corto.
- VRAM estimada en cuantización de 8 bits: alrededor de 10-11 GB de pesos; en 4 bits, alrededor de 5-6 GB, aunque el repositorio no incluye versiones GGUF ni cuantizadas.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 con contexto moderado o cuantización.
- GPU de consumo: cabe en RTX 4090 (24 GB) en FP16 con contexto limitado, y en GPUs de 12-16 GB solo mediante cuantización, que no está publicada en el repositorio.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag del repositorio), vLLM y llama.cpp/Ollama requerirían conversión a GGUF no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|
| Qwen3.5-9B-Medical-SFT-8821-repeat3-1e-compile | 9,65B | no disponible | Apache 2.0 | Sí (image-text-to-text) | Hugging Face, 0 descargas |
| unsloth/Qwen3.5-9B (modelo base) | ~9B | no disponible | no disponible en la información | Sí (image-text-to-text) | Hugging Face |
| Otros ajustes médicos de la familia Qwen | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría. La comparación se limita a parámetros, licencia y modalidad.

## Limitaciones y advertencias

- Modelo sin benchmarks publicados: no hay evidencia de calidad clínica, razonamiento médico ni precisión en tareas específicas.
- Cero descargas y cero likes: no ha sido validado por la comunidad; su comportamiento en producción es desconocido.
- Riesgo elevado de alucinación en dominio médico: un ajuste SFT sin evaluación puede generar información clínica incorrecta con apariencia de verosimilitud.
- Sesgos desconocidos: no se documenta la composición del dataset de entrenamiento, por lo que no se pueden evaluar sesgos demográficos, culturales o clínicos.
- Idioma limitado al inglés: no se declara soporte de castellano ni de otros idiomas; su uso en español no está garantizado.
- Longitud de contexto no documentada: no se puede planificar su uso en conversaciones o documentos largos sin probarlo empíricamente.
- Licencia Apache 2.0: permite uso comercial, pero no exime del cumplimiento de normativas sanitarias (MDR, FDA, RGPD) si se emplea en contextos clínicos reales.
- Model card mínima: generada con la plantilla de Unsloth, sin información sobre hiperparámetros, dataset ni proceso de evaluación.
- No se ofrecen versiones cuantizadas: el despliegue en hardware de consumo requiere cuantización manual por parte del usuario.

## Enlaces

- Hugging Face: https://huggingface.co/ConnorYU/Qwen3.5-9B-Medical-SFT-8821-repeat3-1e-compile
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-9B
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
