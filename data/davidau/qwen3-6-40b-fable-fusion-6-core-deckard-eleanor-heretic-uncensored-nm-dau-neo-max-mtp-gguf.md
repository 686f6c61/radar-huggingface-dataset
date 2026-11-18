# DavidAU/Qwen3.6-40B-Fable-Fusion-6-Core-Deckard-Eleanor-Heretic-Uncensored-NM-DAU-NEO-MAX-MTP-GGUF

## Resumen

El modelo `Qwen3.6-40B-Fable-Fusion-6-Core-Deckard-Eleanor-Heretic-Uncensored-NM-DAU-NEO-MAX-MTP-GGUF` es un fine-tune y merge multi-etapa publicado por DavidAU sobre la base de la familia Qwen 3.6. Se construye a partir de la fusión de cinco versiones de los modelos Fable Fusion 711 y 717 (este último no publicado), más el modelo Deckard Qwen 3.6 40B, en un proceso de diez etapas con sub-etapas de ajuste y reparación posteriores a la expansión de parámetros (de 27B a 40B). El resultado es un modelo denso de aproximadamente 39.070 millones de parámetros, empaquetado en cuantizaciones GGUF tanto regulares como MTP (multi-token prediction) generadas con imatrix.

El objetivo declarado del autor es incrementar la inteligencia general y la resolución de problemas sin dañar el modelo base, manteniendo o elevando todos los benchmarks centrales y evitando prácticas de "benchmaxing". Las mejoras reportadas incluyen una reducción del 50% al 90% en el número de tokens de razonamiento, razonamiento de longitud variable automática según la dificultad de la tarea, mayor profundidad analítica en las respuestas y capacidades creativas reforzadas. Está orientado a escritura creativa, roleplay, razonamiento y casos de uso generales, con un enfoque "uncensored" y "abliterated" que elimina las restricciones de contenido del modelo original.

La relevancia actual reside en que se presenta como un modelo de 40B ejecutable en hardware de consumo mediante cuantización GGUF, con soporte multimodal (pipeline `image-text-to-text`) y capacidades de razonamiento y pensamiento extendido. El repositorio acumula 7.036 descargas y 71 likes, con un tamaño total de 350,4 GB debido a la gran cantidad de cuantizaciones publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen 3.6), con soporte MTP para decodificación multi-token |
| Parametros totales | 39.072.596.736 (~39,07B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF regulares y GGUF MTP (imatrix), presumiblemente Q4 y Q8 entre otras; el autor menciona explícitamente 4-bit y 8-bit |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base; el repo publica cuantizaciones GGUF) |

## Arquitectura y entrenamiento

El modelo es un transformer denso derivado de la familia Qwen 3.6, expandido de 27B a 40B parámetros mediante un proceso de fusión de múltiples checkpoints. La construcción consta de diez etapas con sub-etapas: cinco versiones de Fable Fusion 711 y 717 (esta última no publicada) se fusionaron y ajustaron conjuntamente, y posteriormente se fusionó el modelo Deckard Qwen 3.6 40B sobre el resultado. El autor describe el proceso como "multi-stage fine tune, multi-fine tune y multi-stage merge", con pruebas y benchmarks en cada etapa para verificar la calidad.

Los datos de entrenamiento combinan trazas ligeras de "Fable" (aportadas por armand0e), trazas de razonamiento/pensamiento de Claude Opus, el dataset interno F451 (DavidAU/F451-STRICT-Datasets) y datos de GPT-5 no razonador (Polaris, DavidAU/Polar-STRICT-Datasets). Se aplicaron además datasets internos adicionales en las fases de reparación y ajuste posteriores a la expansión. El modelo incorpora técnicas de "heretic'ing" y "abliteration" para eliminar restricciones de contenido, y se entrenó con Unsloth en hardware de consumo. No se especifica el número total de tokens de entrenamiento ni la composición exacta del dataset. La innovación destacable es la decodificación multi-token (MTP) en las cuantizaciones GGUF, que acelera la generación, junto con el razonamiento de longitud variable automática.

## Capacidades

- Generación de texto general con razonamiento y pensamiento extendido (thinking mode).
- Razonamiento de longitud variable: el modelo ajusta el número de tokens de pensamiento según la dificultad de la tarea, con reducciones del 50% al 90% respecto a versiones anteriores.
- Escritura creativa y ficción: narrativa, cuentos, todos los géneros, roleplay y escritura de formato largo.
- Generación de código (tag `coder` en el repositorio).
- Capacidades matemáticas y de resolución de problemas (mencionadas en los objetivos de entrenamiento).
- Procesamiento multimodal imagen-texto (pipeline `image-text-to-text`).
- Capacidades multilingües limitadas a inglés y chino.
- Análisis en profundidad y respuestas detalladas cuando la tarea lo requiere.
- Sin censura: contenido "uncensored" y "abliterated" sin las restricciones del modelo base.
- Soporte de tool calling / function calling: no disponible (no se menciona en la información).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se detalla explícitamente).

## Casos de uso

- Escritura creativa y narrativa de formato largo: el modelo está entrenado específicamente para ficción, cuentos y todos los géneros, con capacidad de mantener profundidad y detalle en textos extensos gracias a su ajuste para escritura creativa.
- Roleplay y personajes conversacionales: el tag `roleplaying` y la ausencia de censura lo hacen adecuado para interacciones de personaje sin restricciones de contenido, con respuestas coherentes en conversaciones multi-turno.
- Razonamiento y resolución de problemas complejos: el modo de pensamiento con longitud variable permite usar el modelo en tareas analíticas donde se requiere cadena de razonamiento, ajustando el coste computacional a la dificultad.
- Análisis de documentos e imágenes: el pipeline `image-text-to-text` permite procesar entradas multimodales, útil para descripción de imágenes, extracción de información visual o análisis combinado de texto e imagen.
- Generación de código en entornos de desarrollo: el tag `coder` indica capacidad de generación y asistencia de código, integrable en editores o pipelines de desarrollo.
- Asistencia en investigación y análisis profundo: la capacidad declarada de "analítica en profundidad" y las respuestas detalladas lo orientan a tareas de síntesis, revisión y análisis de información extensa.
- Despliegue local en hardware de consumo: las cuantizaciones GGUF (4-bit y 8-bit) permiten ejecutar un modelo de 40B en GPUs de consumo, adecuado para prototipado, investigación y uso personal sin infraestructura de servidor.

## Benchmarks y rendimiento

El autor afirma que el modelo, tanto en 4-bit como en 8-bit, supera al Qwen 3.6 27B base en 6 de 7 benchmarks y lo iguala en el séptimo, y supera los 7 benchmarks del Qwen3.6-35B-A3B. Sin embargo, no se proporcionan en la información disponible las tablas concretas con los valores numéricos de MMLU, HumanEval, GSM8K, ARC-C ni el resto de benchmarks mencionados.

No se han publicado resultados de benchmarks detallados en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Para un modelo denso de ~39B parámetros, las estimaciones habituales serían aproximadamente 20-24 GB en cuantización 4-bit y 40-45 GB en 8-bit, pero estos valores no están confirmados en la información proporcionada.
- GPU recomendadas: no disponible en la información. El autor menciona que el modelo está construido para "hardware de consumo" y que se entrenó en hardware de consumo con Unsloth.
- Compatibilidad con GPU de consumo: el autor afirma explícitamente que es un modelo para hardware de consumo, con cuantizaciones 4-bit y 8-bit que lo hacen viable en GPUs de gama alta de consumo (no se especifican modelos concretos).
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; las cuantizaciones MTP requieren soporte de decodificación multi-token en el runtime. No se mencionan vLLM ni TGI (orientados a safetensors).
- Latencia y throughput: no disponibles. La inclusión de cuantizaciones MTP sugiere una mejora de velocidad frente a las GGUF regulares, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-40B-Fable-Fusion-6-Core-Deckard-Eleanor (este modelo) | ~39,07B | no disponible | Apache 2.0 | GGUF | Fine-tune multi-etapa, uncensored, MTP |
| Qwen3.6-27B-Fable-Fusion-711 (base del autor) | ~27B | no disponible | Apache 2.0 | GGUF | Modelo de origen; el 40B lo supera en 6/7 benchmarks según el autor |
| Qwen 3.6 27B (base oficial) | ~27B | no disponible | no disponible | safetensors/GGUF | Modelo base oficial de Qwen |
| Qwen3.6-35B-A3B | ~35B totales (A3B activos) | no disponible | no disponible | safetensors/GGUF | MoE; el autor afirma que el 40B lo supera en los 7 benchmarks |

No se dispone de datos numéricos de benchmarks para establecer una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Modelo "uncensored" y "abliterated": se han eliminado deliberadamente las restricciones de contenido, por lo que puede generar material sensible, ofensivo o inapropiado sin filtros. No es apto para aplicaciones de producción orientadas al público general sin capas adicionales de moderación.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa con aparente confianza; el modo de razonamiento extendido no elimina este riesgo.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está garantizado ni documentado.
- Longitud de contexto no especificada en la información disponible, lo que impide evaluar su idoneidad para tareas de contexto largo.
- Proceso de construcción complejo (diez etapas, múltiples fusiones y datasets propietarios) que dificulta la reproducibilidad y la auditoría del entrenamiento.
- Las afirmaciones de rendimiento del autor ("nivel de inteligencia de modelos cerrados", superación de benchmarks) no están respaldadas con tablas numéricas verificables en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado sin censura puede conllevar responsabilidad legal según la jurisdicción y el uso.
- Tamaño del repositorio de 350,4 GB: la descarga completa es costosa; conviene seleccionar únicamente la cuantización necesaria.
- Soporte de tool calling y agentes no documentado, lo que limita su uso en pipelines agénticos sin validación previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DavidAU/Qwen3.6-40B-Fable-Fusion-6-Core-Deckard-Eleanor-Heretic-Uncensored-NM-DAU-NEO-MAX-MTP-GGUF
- Modelo base (safetensors): https://huggingface.co/DavidAU/Qwen3.6-40B-Fable-Fusion-6-Core-Deckard-Eleanor-Heretic-Uncensored
- Modelo de origen Qwen3.6-27B-Fable-Fusion-711: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Discusión y pruebas de terceros del modelo 27B: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF/discussions
- Modelo de control Qwen3.5-9B-The-Defiant: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- FAQs del autor: https://huggingface.co/DavidAU/support
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
