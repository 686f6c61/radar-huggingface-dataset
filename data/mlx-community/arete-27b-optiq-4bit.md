# mlx-community/Arete-27B-OptiQ-4bit

## Resumen

Arete-27B-OptiQ-4bit es una cuantización de precisión mixta del modelo NousResearch/Arete-27B, publicada por la comunidad mlx-community para su ejecución local en Apple Silicon mediante la librería MLX. El modelo base es un ajuste fino supervisado (SFT) de Qwen3.8-27B realizado por Nous Research, orientado a responder preguntas políticamente sensibles de forma factual en lugar de rechazarlas o desviarlas. Se trata, por tanto, de un modelo de la familia Qwen3.8 con capacidades de visión y lenguaje (pipeline image-text-to-text).

La cuantización emplea la técnica OptiQ de precisión mixta por capas, con un reparto de 4 y 8 bits según la sensibilidad de cada componente, reutilizando la receta ya calibrada para Qwen3.8-27B-OptiQ-4bit al ser la arquitectura idéntica. El resultado ocupa 20 GB en disco, con 237 componentes en 4 bits y 261 en 8 bits, grupo de tamaño 64 y la torre de visión mantenida en bf16 en un fichero aparte (`optiq_vision.safetensors`).

El modelo cuenta con 26.895.993.856 parámetros reales según los pesos safetensors, soporta entrada de imágenes, contexto largo, function calling y uso de herramientas, y se distribuye bajo licencia Apache 2.0. Su relevancia actual radica en ofrecer un modelo multimodal de razonamiento de ~27B ejecutable en hardware de Apple con un consumo de disco moderado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.8 (vision-language, image-text-to-text) |
| Parametros totales | 26.895.993.856 (~26,9B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (etiquetado como "long-context") |
| Tipos de cuantizacion | OptiQ mixed-precision per-layer 4/8-bit (237 componentes a 4-bit, 261 a 8-bit, group size 64); torre de visión en bf16 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), con `optiq_vision.safetensors` y `kv_config.json` |

## Arquitectura y entrenamiento

El modelo base NousResearch/Arete-27B es un ajuste fino supervisado de Qwen3.8-27B, un transformer multimodal de la familia Qwen3.8 con torre de visión para entrada de imágenes. Nous Research entrenó el modelo con el objetivo de que respondiera a preguntas políticamente sensibles de manera factual, sin rechazos ni evasivas, usando el dataset NousResearch/arete-data-pairs. No se dispone de información sobre el número de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron etapas de RLHF o DPO adicionales.

La versión aquí descrita no es un modelo nuevo, sino una cuantización: OptiQ aplica precisión mixta por capas asignando 4 u 8 bits según la sensibilidad de cada componente, reutilizando el ranking de sensibilidad de la receta de Qwen3.8-27B por ser la arquitectura idéntica. Se conserva la torre de visión en bf16 para no degradar la entrada de imagen y se incluye una configuración de caché KV de precisión mixta (`kv_config.json`). El release de Arete no incluye la cabeza de especulación (MTP), por lo que no hay decodificación especulativa disponible.

## Capacidades

- Generación de texto y razonamiento: es un modelo de razonamiento, por lo que requiere un presupuesto de tokens generoso.
- Entrada multimodal de imagen y texto (image-text-to-text) mediante torre de visión en bf16.
- Soporte de function calling y tool use.
- Capacidades de agente y razonamiento multi-paso (etiquetado como reasoning y tool-use).
- Contexto largo (etiquetado como long-context; longitud exacta no disponible).
- Respuestas factuales ante preguntas políticamente sensibles, evitando rechazos por defecto.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Razonamiento y análisis documental con imágenes: el modelo puede recibir capturas, diagramas o documentos escaneados junto a una pregunta y razonar sobre ellos, aprovechando su torre de visión en bf16 y su modo de razonamiento.
- Asistentes conversacionales multi-turno: su etiqueta de contexto largo y su caché KV de precisión mixta permiten mantener conversaciones extensas en local sobre Apple Silicon.
- Automatización de agentes con herramientas: el soporte de function calling y tool use permite integrarlo en flujos donde el modelo decide qué herramienta invocar y encadena varios pasos.
- Análisis de contenido sensible o controvertido: al estar entrenado para responder de forma factual en lugar de rechazar, resulta adecuado para tareas de investigación o análisis que otros modelos rechazarían por defecto.
- Despliegue local en estaciones de trabajo Apple: con 20 GB en disco y MLX, se puede servir mediante `optiq serve` con endpoint compatible con OpenAI y Anthropic, útil para prototipos sin nube.
- Extracción de información de imágenes y texto combinados: por ejemplo, transcribir y razonar sobre tablas o gráficos en un pipeline de documentación técnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/espacio en disco: 20 GB de pesos en disco; el requisito de memoria unificada debe cubrir los pesos más la caché KV y el contexto, por lo que se recomienda un margen amplio por encima de los 20 GB.
- Hardware objetivo: Apple Silicon con MLX (la model card está etiquetada como apple-silicon); no está pensado para GPU NVIDIA.
- Cabe en equipos Apple con memoria unificada suficiente para 20 GB de pesos más contexto; el modelo exacto de chip no se especifica en la información disponible.
- Despliegue: `mlx_lm` (load/generate) y `optiq serve`, que expone un endpoint compatible con OpenAI y Anthropic con caché KV de precisión mixta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Arete-27B-OptiQ-4bit (este) | ~26,9B | no disponible | safetensors MLX, 4/8-bit mixto | apache-2.0 | Cuantización para Apple Silicon, multimodal, 20 GB |
| NousResearch/Arete-27B | no disponible | no disponible | safetensors (bf16 presumiblemente) | apache-2.0 | Modelo base sin cuantizar; requiere más memoria |
| Qwen3.8-27B-OptiQ-4bit | no disponible | no disponible | safetensors MLX, 4/8-bit mixto | no disponible | Misma receta OptiQ aplicada al Qwen3.8-27B sin el ajuste de Arete |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación: como todo modelo generativo, puede producir información incorrecta, especialmente en el modo de razonamiento con presupuestos de tokens cortos.
- Sesgos: al estar entrenado específicamente para responder a preguntas políticamente sensibles sin rechazar, puede presentar sesgos derivados de ese ajuste y de los datos de entrenamiento; conviene evaluarlo en el dominio concreto de uso.
- Cuantización: la precisión mixta 4/8-bit puede degradar ligeramente la calidad frente al modelo base en tareas sensibles; la etiqueta "4bit" designa la familia, no la media ponderada.
- Sin decodificación especulativa: el release de Arete no incluye la cabeza MTP, por lo que no se puede acelerar con especulación.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base y de los datos de entrenamiento.
- Longitud de contexto exacta no documentada; verificar antes de desplegar en producción con contextos muy largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlx-community/Arete-27B-OptiQ-4bit
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Receta OptiQ de referencia: https://huggingface.co/mlx-community/Qwen3.8-27B-OptiQ-4bit
- Dataset de entrenamiento: https://huggingface.co/datasets/NousResearch/arete-data-pairs
- Web del proyecto OptiQ: https://mlx-optiq.com/
- Catálogo de cuantizaciones OptiQ: https://mlx-optiq.com/models
- Documentación: https://mlx-optiq.com/docs/
