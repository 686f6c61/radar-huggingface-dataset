# Evan123123123123/zils-z3-r4

## Resumen

zils-z3-r4 es un modelo de extracción de características (feature-extraction) publicado por el usuario Evan123123123123 en Hugging Face, construido como un "soup body" del proyecto Zils sobre el modelo base vllm-sr/d3-ultra, cuyo padre declarado es Qwen/Qwen3.8-27B. El modelo conserva la torre de visión del chasis original sin modificar y solo entrena las capas de lenguaje mediante LoRA (r=16, alpha 32), fusionada en FP32 y almacenada en BF16. Cuenta con 26.085.330.160 parámetros reales según los pesos en safetensors y un repositorio de 52,2 GB.

La relevancia del modelo es acotada y experimental: se trata de un ajuste fino orientado a un caso de uso muy específico (predicción de resultados de decisiones en entornos reales, como reversiones de ediciones en Wikipedia/Wikidata, revisiones de Gerrit o categorías de arXiv) y no de un modelo conversacional general. No tiene descargas ni likes en el momento de la consulta, y no se han publicado resultados de benchmarks ni detalles sobre idiomas soportados.

La ficha se basa exclusivamente en los metadatos y la model card disponibles. Cualquier dato no presente en esa información se marca explícitamente como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B; torre de visión + capas de lenguaje), con código personalizado (`custom_code`) |
| Parámetros totales | 26.085.330.160 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en BF16; safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16); requiere `trust_remote_code` por el código personalizado |

## Arquitectura y entrenamiento

El modelo parte de vllm-sr/d3-ultra (a su vez derivado de Qwen/Qwen3.8-27B en el commit `1d4bf0f2`) y mantiene intacta la torre de visión del chasis. Solo se entrenaron las capas de lenguaje mediante LoRA con rango 16 y alpha 32; el adaptador se fusionó en FP32 y se almacenó en BF16. El pipeline declarado es `feature-extraction`, no `text-generation`, lo que sugiere que el uso previsto es la obtención de representaciones más que la generación abierta.

El entrenamiento se realizó sobre 13.533 ejemplos de decisión correspondientes a eventos de resultado del mundo real: reversiones de ediciones en Wikipedia/Wikidata, revisiones de Articles for Creation, revisiones de código en Gerrit, resultados de preguntas en Stack Exchange y categorías de arXiv. Estos datos se recopilaron con las herramientas públicas Zils Outcomes a partir de periodos anteriores a cualquier ventana de evaluación, y se mezclaron con los splits de *entrenamiento* de conjuntos de datos públicos etiquetados; no se usaron splits de validación ni de test. Hiperparámetros: learning rate 0,0001, 1,0 épocas, peso Brier 0,25 y semilla 81. La función de pérdida Brier indica un enfoque de calibración probabilística de resultados binarios o multiclase, no de modelado de lenguaje estándar.

## Capacidades

- Extracción de características y representaciones a partir de entradas multimodales (texto e imagen, dado que conserva la torre de visión).
- Predicción de resultados de decisiones en dominios concretos: moderación de ediciones, revisión de código, evaluación de preguntas y clasificación de artículos científicos.
- Calibración probabilística de predicciones (entrenamiento con pérdida Brier), orientada a estimar probabilidades de resultado.
- Procesamiento de entradas visuales gracias a la torre de visión heredada del chasis.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Moderación de contribuciones en wikis: el modelo puede puntuar la probabilidad de que una edición en Wikipedia o Wikidata sea revertida, integrándose en un pipeline de revisión previa para priorizar la cola de patrullaje.
- Triaje de revisiones de código en Gerrit: dado un cambio propuesto, estimar la probabilidad de que sea rechazado o requiera modificaciones, ayudando a asignar revisores o a bloquear cambios de bajo riesgo.
- Evaluación de preguntas en Stack Exchange: predecir si una pregunta acabará cerrada o con respuesta aceptada, útil para sistemas de recomendación de contenido o de aviso al autor.
- Clasificación de artículos científicos: asignar categorías de arXiv a preprints a partir de su texto, como paso previo a un clasificador supervisado o como señal auxiliar.
- Revisión de borradores en Articles for Creation: estimar la probabilidad de aceptación de un borrador para orientar la cola de revisión de voluntarios.
- Extracción de embeddings para búsqueda semántica: al declararse como `feature-extraction`, puede generar representaciones vectoriales de documentos para recuperación, siempre que se valide su calidad en el dominio objetivo.
- Investigación sobre calibración de modelos: su entrenamiento con pérdida Brier lo hace adecuado como objeto de estudio para comparar calibración probabilística frente a modelos entrenados con entropía cruzada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 52 GB solo para pesos (26,1 mil millones de parámetros × 2 bytes), más overhead de activaciones, caché KV y torre de visión; en la práctica se requiere al menos una GPU de 80 GB para una ejecución cómoda.
- Cuantización a 8 bits: en torno a 26 GB de pesos, viable en una A100 40 GB o en dos RTX 4090 de 24 GB.
- Cuantización a 4 bits: en torno a 13-15 GB de pesos, potencialmente ejecutable en una RTX 4090 de 24 GB, aunque la información proporcionada no confirma que existan pesos GGUF ni cuantizaciones publicadas.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para BF16 sin particionado; A100 40 GB o configuraciones multi-GPU para 8 bits.
- Cabe en GPU de consumo: solo en el caso de cuantización agresiva (4 bits) y si se generan los pesos correspondientes; no se distribuyen cuantizaciones en el repositorio.
- Opciones de despliegue: la librería declarada es `transformers` con `custom_code`, por lo que requiere `trust_remote_code=True`. No se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la información disponible; dado el pipeline de `feature-extraction`, el despliegue típico sería un servidor de embeddings con `transformers` o con un runtime compatible con el código personalizado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| zils-z3-r4 | 26,1 mil millones | no disponible | Apache 2.0 | Feature-extraction / calibración de resultados | Hugging Face, 0 descargas |
| Qwen/Qwen3.8-27B (modelo padre) | ~27 mil millones (según nomenclatura) | no disponible | no disponible en esta ficha | Modelo base multimodal | Hugging Face |
| vllm-sr/d3-ultra (modelo base directo) | no disponible | no disponible | no disponible en esta ficha | Modelo base del que deriva el ajuste | Hugging Face |

No se dispone de datos de rendimiento ni de contexto para establecer una comparación cuantitativa con alternativas de la misma categoría. La comparación se limita a la relación de parentesco entre los tres modelos.

## Limitaciones y advertencias

- El modelo está entrenado sobre un conjunto muy específico de eventos de decisión (13.533 ejemplos) y no se ha validado en dominios fuera de ese conjunto; el riesgo de sobreajuste y de generalización deficiente es alto.
- No se usaron splits de validación ni de test en el entrenamiento, según la model card, lo que impide verificar la capacidad de generalización del ajuste.
- El pipeline declarado es `feature-extraction`; no debe asumirse que el modelo genera texto coherente de forma fiable.
- No se han publicado datos sobre sesgos, idiomas soportados ni comportamiento en contextos largos.
- Riesgo de alucinación: no evaluable con la información disponible, pero relevante si se usa fuera del pipeline de extracción de características.
- La licencia Apache 2.0 permite uso comercial y modificación, pero el modelo incorpora código personalizado (`custom_code`) que debe auditarse antes de desplegarlo en producción, ya que se ejecuta con `trust_remote_code=True`.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en el mismo día (25 de noviembre de 2026); no hay evidencia de uso comunitario ni de mantenimiento.
- El tamaño de 52,2 GB y los 26,1 mil millones de parámetros implican requisitos de hardware considerables para un modelo de extracción de características.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Evan123123123123/zils-z3-r4
- Modelo base directo: https://huggingface.co/vllm-sr/d3-ultra
- Modelo padre: https://huggingface.co/Qwen/Qwen3.8-27B
- Commit del modelo padre: `1d4bf0f2` (referenciado en la model card)
- Paper, blog, repositorio o demo del proyecto Zils: no disponible en la información proporcionada.
