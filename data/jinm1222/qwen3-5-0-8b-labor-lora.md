# jinm1222/qwen3.5-0.8b-labor-lora

## Resumen

El modelo `jinm1222/qwen3.5-0.8b-labor-lora` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `Qwen/Qwen3.5-0.8B`, desarrollado por el usuario de HuggingFace jinm1222. No se trata de un modelo completo, sino de un conjunto de pesos adicionales que se cargan sobre el modelo base mediante la librería PEFT. Su propósito es especializar un modelo pequeño de 0,8 mil millones de parámetros en tareas de consultoría laboral (노무 상담, "asesoramiento laboral" en coreano), a partir de un dataset de pares pregunta-respuesta publicado por el mismo autor.

La relevancia de esta ficha es doble: por un lado, documenta un ejemplo típico de adaptación eficiente de un modelo compacto mediante SFT (supervised fine-tuning) con LoRA; por otro, ilustra el ecosistema de adaptadores especializados en dominios verticales concretos (en este caso, derecho laboral coreano) que proliferan en HuggingFace. El modelo está etiquetado exclusivamente para el idioma coreano y se distribuye bajo licencia Apache 2.0, lo que facilita su reutilización comercial.

La información pública disponible es muy limitada: la model card es breve y no incluye datos sobre composición del dataset, número de tokens de entrenamiento, benchmarks ni evaluación de calidad. Además, el modelo base `Qwen/Qwen3.5-0.8B` no aparece descrito en detalle en la información proporcionada, por lo que varias especificaciones se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (modelo base Qwen3.5-0.8B); r=8, lora_alpha=16, target modules "all-linear" |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene ~0,8 mil millones de parametros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-0.8B; no se especifica en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador emplea la técnica LoRA con rango 8 y `lora_alpha` 16, aplicada a todas las capas lineales del modelo base ("all-linear"). El entrenamiento se realizó mediante SFT con la librería TRL sobre el dataset `jinm1222/labor-counsel-qa`, con una tasa de aprendizaje de 2e-4 y 4 épocas. No se especifica el número total de tokens de entrenamiento, el tamaño del dataset, la composición exacta de las muestras ni si se aplicaron técnicas adicionales como DPO o RLHF.

La innovación técnica principal es la eficiencia: al tratarse de un adaptador de bajo rango sobre un modelo de 0,8B, el coste de entrenamiento e inferencia es muy reducido y el adaptador puede combinarse con el modelo base sin duplicar los pesos completos. No se documentan innovaciones adicionales como decodificación especulativa, atención lineal o arquitecturas híbridas en la información proporcionada.

## Capacidades

- Generación de texto en coreano orientada a preguntas y respuestas sobre consultoría laboral.
- Respuesta a consultas del dominio de derecho laboral coreano, según el dataset de entrenamiento `labor-counsel-qa`.
- Especialización mediante fine-tuning supervisado (SFT) sobre un modelo base generalista.
- Carga e integración mediante `PeftModel.from_pretrained` sobre el modelo base Qwen3.5-0.8B.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al coreano según la etiqueta de idioma; no se documenta soporte de otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible (no documentado).

## Casos de uso

- Asistencia en consultas laborales básicas: el adaptador puede responder preguntas frecuentes sobre derechos laborales en coreano, apoyándose en el dataset de Q&A con el que fue entrenado, como primer nivel de atención antes de derivar a un especialista.
- Prototipado de chatbots de RRHH: al ser un adaptador ligero sobre un modelo de 0,8B, permite desplegar un prototipo de asistente interno de recursos humanos con requisitos de hardware mínimos.
- Clasificación y enrutado de consultas laborales: el modelo puede generar respuestas iniciales que ayuden a categorizar consultas de empleados y dirigirlas al departamento correspondiente.
- Generación de borradores de respuestas para equipos de soporte: útil para que un equipo legal o de RRHH disponga de un primer borrador que luego revise un profesional humano.
- Investigación académica sobre adaptación de dominio: sirve como ejemplo reproducible de fine-tuning LoRA con TRL sobre un dataset vertical, útil para estudiar el efecto del SFT en modelos pequeños.
- Experimentación con PEFT en entornos con recursos limitados: al requerir únicamente el modelo base de 0,8B más el adaptador, es adecuado para pruebas en GPU de consumo o incluso CPU con cuantización del modelo base.
- Formación y demos educativas: permite mostrar el flujo completo de carga de un adaptador LoRA con `PeftModel` en talleres o tutoriales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; al tratarse de un modelo base de ~0,8B, la inferencia en fp16 requiere aproximadamente 1,6 GB solo para pesos, más overhead de activaciones y KV cache; con cuantización de 4 bits podría situarse por debajo de 1 GB, aunque estos cálculos son estimaciones generales y no datos publicados por el autor.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) sería suficiente para el modelo base en fp16 o cuantizado.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de GPU con 4 GB o más de VRAM, aunque no se documenta oficialmente.
- Opciones de despliegue: carga mediante `transformers` + `peft` (flujo documentado en la model card); otras opciones como vLLM, llama.cpp, Ollama o TGI no están documentadas para este adaptador y requerirían fusión previa del adaptador con el modelo base.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| jinm1222/qwen3.5-0.8b-labor-lora | Adaptador LoRA sobre base de ~0,8B | No disponible | Apache 2.0 | HuggingFace (14 descargas) | Especializado en consultoría laboral coreana |
| Qwen/Qwen3.5-0.8B (modelo base) | ~0,8B | No disponible | No disponible en la informacion | HuggingFace | Modelo generalista sin especialización de dominio |
| Otros adaptadores LoRA de dominio | Variable | Variable | Variable | HuggingFace | No se dispone de datos concretos de alternativas comparables en la informacion proporcionada |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- El adaptador está entrenado exclusivamente para coreano; su uso en castellano u otros idiomas no está soportado y probablemente produzca respuestas de baja calidad.
- No se documenta el tamaño ni la calidad del dataset `labor-counsel-qa`, por lo que se desconoce el grado de cobertura y los posibles sesgos del dominio.
- Riesgo de alucinación: al ser un modelo pequeño (0,8B) especializado mediante SFT, puede generar respuestas plausibles pero incorrectas en materia legal, con consecuencias potencialmente graves si se usa sin supervisión humana.
- No debe utilizarse como sustituto de asesoramiento legal profesional; las respuestas deben validarse por un experto en derecho laboral coreano.
- No se han publicado evaluaciones de calidad, benchmarks ni análisis de sesgos.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base Qwen3.5-0.8B, que no se detalla en la información proporcionada.
- El adaptador requiere cargar el modelo base por separado; no es un modelo autónomo y su comportamiento depende enteramente de la versión del modelo base utilizada.
- El número de descargas (14) y la ausencia de "likes" sugieren poca validación por parte de la comunidad; no hay evidencia de uso en producción.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/jinm1222/qwen3.5-0.8b-labor-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de entrenamiento: https://huggingface.co/datasets/jinm1222/labor-counsel-qa
- Librería PEFT: https://github.com/huggingface/peft
- Librería TRL: https://github.com/huggingface/trl
