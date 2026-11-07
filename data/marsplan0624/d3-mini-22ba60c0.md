# marsplan0624/d3-mini-22ba60c0

## Resumen

`d3-mini-22ba60c0` es un fine-tune del modelo base `Qwen/Qwen3.5-4B` publicado por el usuario `marsplan0624` en Hugging Face. Según la model card, se trata de un "body" (cuerpo de pesos) para un pool denominado `d3-mini`, entrenado sobre preguntas de decisión pública etiquetadas con resultados reales (reversiones y revisiones de Wikipedia, categorías de arXiv, resultados de Stack Exchange y merges de Gerrit). El autor lo describe como un modelo de decisión ("decision-model") dentro de un ecosistema propio llamado Zils.

El modelo conserva la arquitectura y el tamaño del Qwen3.5-4B original: 4.539.265.536 parámetros totales según los pesos en safetensors, con un repositorio de 9,1 GB. Sobre esos pesos se ha fusionado un LoRA de lenguaje con rango 16. La licencia declarada es Apache 2.0.

La relevancia práctica es limitada y muy específica: la propia model card advierte de que los pesos solo son utilizables a través del runtime fijado del pool ("pinned chassis runtime") y que el repositorio no incluye capa de respuesta ni código de ejecución. No hay pipeline declarado, ni idiomas especificados, ni resultados de benchmarks publicados, y el modelo acumula cero descargas y cero likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-4B); detalles no disponibles |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de los pesos completos de lenguaje y visión de `Qwen/Qwen3.5-4B`, por lo que hereda la arquitectura transformer de dicho base, aunque la model card no detalla capas, dimensiones ocultas, número de cabezas ni mecanismos de atención. Sobre esa base se ha fusionado un LoRA de lenguaje con rango 16, según indica el autor.

El entrenamiento se realizó, siempre según la model card, sobre "preguntas de decisión pública" al estilo Zils Outcomes, etiquetadas con resultados reales: reversiones y revisiones de Wikipedia, categorías de arXiv, resultados de Stack Exchange y merges de Gerrit. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá de la fusión del LoRA.

## Capacidades

- Generación de texto y razonamiento: heredadas del base Qwen3.5-4B, si bien no se documentan evaluaciones específicas tras el fine-tune.
- Visión: la model card menciona que se incluyen "the full language and vision weights", por lo que se conservarían las capacidades multimodales del base.
- Modelo de decisión: orientado a tareas de clasificación o predicción de resultados binarios o categóricos sobre preguntas de decisión pública (por ejemplo, si una edición de Wikipedia será revertida o si un cambio de Gerrit se fusionará).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; no se declara ningún idioma.
- Modo "thinking", audio u otras capacidades especiales: no disponible.

## Casos de uso

- Predicción de moderación en Wikipedia: el modelo podría emplearse para estimar la probabilidad de que una edición sea revertida, aprovechando que fue entrenado con ese tipo de etiquetas de resultado real.
- Triaje de contribuciones en Stack Exchange: clasificar preguntas o respuestas según su probabilidad de ser aceptadas, cerradas o eliminadas, útil para sistemas de curación de contenido.
- Clasificación de preprints en arXiv: asignar categorías a nuevos envíos a partir del texto, dado que el entrenamiento incluyó categorías de arXiv como señal de resultado.
- Priorización de revisiones en Gerrit: predecir si un cambio de código será fusionado para ordenar la cola de revisión de un equipo de ingeniería.
- Investigación sobre modelos de decisión: servir como punto de partida para estudiar el ajuste fino de modelos de 4B sobre resultados del mundo real, siempre que se disponga del runtime del pool Zils.
- Experimentación con fine-tunes de Qwen3.5-4B: reutilizar los pesos como base para nuevos ajustes, teniendo en cuenta la advertencia del autor sobre el runtime.

En todos los casos, la model card restringe el uso de los pesos al runtime fijado del pool, y el repositorio no incluye capa de respuesta ni código, lo que limita seriamente su aplicabilidad directa en producción fuera de ese ecosistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.539 millones de parámetros, en FP16 se requieren aproximadamente 9 GB solo para los pesos, más overhead de activaciones y caché KV; en cuantización de 8 bits, alrededor de 4,5-5 GB; en 4 bits, alrededor de 2,5-3 GB. Estas cifras son estimaciones basadas en el número de parámetros, no datos publicados por el autor.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cabría esperar viabilidad en GPUs de 16-24 GB (RTX 4090, A10, L4) en FP16, y en GPUs de 8-12 GB con cuantización, pero no hay confirmación oficial.
- Cabe en GPU de consumo: probablemente sí en modelos con 12 GB o más en cuantización de 4-8 bits, aunque no está verificado.
- Opciones de despliegue: la model card indica que los pesos solo son utilizables mediante el runtime fijado del pool Zils; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| d3-mini-22ba60c0 | 4.539 M | no disponible | Apache 2.0 | Hugging Face, requiere runtime Zils | Fine-tune de decisión sobre Qwen3.5-4B |
| Qwen/Qwen3.5-4B | ~4B (no confirmado) | no disponible | no disponible | Hugging Face | Modelo base del que deriva |
| Otros fine-tunes de Qwen3.5-4B | variable | variable | variable | Hugging Face | No se dispone de datos concretos en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría; los datos de benchmarks y contexto del base Qwen3.5-4B no se incluyen en la información proporcionada.

## Limitaciones y advertencias

- Dependencia de runtime propietario: la model card afirma explícitamente que los pesos solo son utilizables a través del runtime fijado del pool Zils, y que el repositorio no incluye capa de respuesta ni código de ejecución.
- Ausencia de benchmarks: no hay evaluaciones publicadas que permitan estimar la calidad del fine-tune frente al base.
- Idiomas no declarados: se desconoce qué lenguas cubre el modelo tras el ajuste.
- Sesgos potenciales: el entrenamiento con resultados de comunidades concretas (Wikipedia, Stack Exchange, Gerrit, arXiv) puede introducir sesgos hacia las normas y dinámicas de esas plataformas.
- Riesgo de alucinación: al conservar los pesos de lenguaje de un modelo de 4B, mantiene los riesgos habituales de generación, agravados por la falta de evaluación.
- Restricciones de licencia: aunque se declara Apache 2.0, la dependencia del runtime del pool puede condicionar el uso comercial efectivo; conviene verificar los términos del ecosistema Zils antes de cualquier despliegue.
- Madurez: cero descargas y cero likes, publicación reciente, sin documentación adicional ni comunidad; no es un modelo recomendable para producción sin validación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/marsplan0624/d3-mini-22ba60c0
- Perfil del autor: https://huggingface.co/marsplan0624
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
