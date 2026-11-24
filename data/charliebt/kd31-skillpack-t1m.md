# CharlieBT/kd31-skillpack-t1m

## Resumen

CharlieBT/kd31-skillpack-t1m es un fine-tune del modelo MachinePulseAI/karpo-decision-31B, publicado en Hugging Face con licencia Apache 2.0 y acceso restringido (gated). Se presenta como un "skillpack" orientado a clasificación de texto, aunque las etiquetas del repositorio incluyen también `image-text-to-text` y la arquitectura declarada es `gemma4`, lo que sugiere que hereda la base multimodal del modelo original y la especializa en tareas de clasificación. Cuenta con 31.273.088.876 parámetros totales según los pesos en safetensors, y el repositorio ocupa 62,6 GB.

El modelo base, karpo-decision-31B, no es un modelo ampliamente documentado en la información disponible, por lo que muchos detalles de entrenamiento, composición del dataset y rendimiento no pueden confirmarse. La relevancia de este fine-tune radica en su empaquetado como "skillpack": un conjunto de habilidades especializadas sobre una base de 31B, presumiblemente para clasificación y toma de decisiones, con compatibilidad declarada con endpoints.

Al tratarse de un modelo gated, el acceso requiere aceptar condiciones en Hugging Face, lo que limita su evaluación directa. No se han publicado resultados de benchmarks ni detalles sobre el proceso de fine-tuning en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (etiqueta `gemma4`; detalles no disponibles) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; sin GGUF publicado) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | MachinePulseAI/karpo-decision-31B |
| Pipeline declarado | text-classification |
| Acceso | restringido (gated) |
| Tamano del repositorio | 62,6 GB |

## Arquitectura y entrenamiento

La arquitectura se etiqueta como `gemma4`, lo que apunta a una familia de transformers derivada de Gemma, aunque no se dispone de documentación que confirme la configuración exacta (número de capas, dimensiones, mecanismos de atención o si incorpora componentes multimodales). El pipeline declarado es `text-classification`, pero las etiquetas incluyen `image-text-to-text`, lo que sugiere que el modelo base es multimodal y este fine-tune conserva esa capacidad o parte de ella.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o supervisión específica para clasificación. El nombre "skillpack-t1m" sugiere un empaquetado de habilidades ("skill pack") con una variante "t1m", pero no hay documentación que explique su significado. Tampoco se detallan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación de texto: pipeline principal declarado, orientado a etiquetar o categorizar entradas textuales.
- Procesamiento image-text-to-text: según las etiquetas del repositorio, podría aceptar entradas de imagen y texto, aunque no está confirmado en la documentación.
- Generación de texto: presumiblemente heredada del modelo base de 31B, aunque no verificada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se listan idiomas).
- Modo thinking, visión o audio: no confirmado; la etiqueta image-text-to-text sugiere visión, pero sin detalles.

## Casos de uso

- Clasificación de tickets de soporte: el modelo puede asignar categorías y prioridades a incidencias entrantes, aprovechando su pipeline de text-classification y su tamaño de 31B para captar matices en descripciones largas.
- Moderación de contenido: clasificación de textos o pares imagen-texto en flujos de revisión, si se confirma la capacidad multimodal.
- Enrutamiento de consultas en sistemas RAG: etiquetar la intención de una consulta para dirigirla al índice o al agente adecuado.
- Análisis de sentimiento y opinión a escala: clasificación de reseñas o comentarios en lotes, con la ventaja de un modelo grande para contextos ambiguos.
- Etiquetado de datasets: generación de etiquetas automáticas para corpus de entrenamiento o evaluación, reduciendo el trabajo manual.
- Clasificación de documentos multimodales: si la capacidad image-text-to-text está operativa, podría clasificar capturas, formularios o páginas escaneadas junto con su texto.
- Filtrado previo en pipelines de agentes: decidir si una entrada requiere razonamiento complejo o puede resolverse con una respuesta directa, como paso de enrutamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 62,5 GB solo para pesos (31,27B × 2 bytes), más overhead de activaciones y KV cache; se recomienda al menos 80 GB.
- VRAM estimada en cuantización de 8 bits: ~31 GB de pesos, más overhead; viable en GPUs de 40-48 GB.
- VRAM estimada en cuantización de 4 bits: ~16 GB de pesos, más overhead; podría caber en GPUs consumer de 24 GB, aunque no hay GGUF publicado y habría que cuantizar manualmente.
- GPUs recomendadas: A100 80 GB, H100 80 GB, o múltiples GPUs menores con tensor parallelism.
- GPU consumer: posible en RTX 4090 (24 GB) solo con cuantización agresiva (4 bits) y sin garantía de que el pipeline de clasificación funcione correctamente.
- Opciones de despliegue: transformers (formato nativo safetensors); vLLM, TGI o llama.cpp requerirían conversión o soporte específico no confirmado; no hay GGUF en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| CharlieBT/kd31-skillpack-t1m | 31,27B | no disponible | Apache 2.0 | Gated | Fine-tune de clasificación sobre karpo-decision-31B |
| MachinePulseAI/karpo-decision-31B | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva |
| Gemma 2 27B (referencia de familia) | 27B | 8K | Gemma license | Abierto | Alternativa de tamaño similar, no directamente comparable por falta de datos |

No se dispone de información suficiente para una comparativa rigurosa con alternativas de la misma categoría; los datos del modelo base y de posibles competidores no están publicados en la información proporcionada.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated y requiere aceptar condiciones en Hugging Face, lo que puede retrasar su evaluación y despliegue.
- Documentación escasa: no hay model card detallada, lo que impide verificar el proceso de entrenamiento, los datos usados o las capacidades reales.
- Riesgo de alucinación: inherente a los modelos generativos de gran tamaño; en clasificación puede producir etiquetas inventadas si no se restringe la salida.
- Idiomas: no se especifican idiomas soportados, por lo que el rendimiento multilingüe es desconocido.
- Contexto: se desconoce la longitud máxima de contexto, lo que limita la planificación para entradas largas.
- Licencia Apache 2.0: permite uso comercial, pero al ser un fine-tune conviene verificar las condiciones del modelo base y de los datos de entrenamiento.
- Sin benchmarks: no hay evidencia publicada de rendimiento, por lo que no se recomienda su uso en producción sin una evaluación propia.
- Formato: solo safetensors; la ausencia de GGUF o cuantizaciones oficiales complica el despliegue en hardware consumer.
- Sesgos: desconocidos, al no documentarse la composición del dataset.

## Enlaces

- Hugging Face: https://huggingface.co/CharlieBT/kd31-skillpack-t1m
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
