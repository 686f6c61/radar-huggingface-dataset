# facebook/meta-encoder

## Resumen

facebook/meta-encoder es un modelo multimodal de representación publicado por Meta en HuggingFace, identificado con el pipeline de `feature-extraction`. Se trata de un encoder de aproximadamente 29.776 millones de parámetros (unos 29,78 mil millones), derivado mediante fine-tuning del modelo base meta-models/Muse-Glimmer-30B, según la etiqueta `base_model:finetune` del repositorio.

El modelo está orientado a tareas de representación multimodal: extracción de características, similitud entre modalidades, recuperación imagen-texto (`image-text-retrieval`), clasificación y toma de decisiones. El repositorio ocupa 59,6 GB en safetensors, lo que resulta coherente con un checkpoint en bf16/fp16 del tamaño de parámetros indicado.

El acceso es restringido (gated): requiere aceptar las condiciones en HuggingFace antes de poder descargar los pesos. La licencia declarada es Apache 2.0. En el momento de redactar esta ficha el modelo acumula 11 descargas y 11 likes, y no se ha encontrado documentación técnica adicional (paper, blog de modelo o dataset) en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (encoder), según librería `transformers`; detalle de capas no disponible |
| Parámetros totales | 29.776.626.688 (~29,78 mil millones) |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repo publica safetensors; no se confirman GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |
| Pipeline | feature-extraction |
| Modelo base | meta-models/Muse-Glimmer-30B |
| Tamaño del repositorio | 59,6 GB |
| Acceso | Restringido (gated), requiere aceptar condiciones |

## Arquitectura y entrenamiento

La información disponible solo permite afirmar que se trata de un encoder multimodal construido sobre la librería `transformers` y derivado del modelo meta-models/Muse-Glimmer-30B. Las etiquetas del repositorio (`image-text-to-text`, `multimodal representation`, `similarity`, `image-text-retrieval`, `classification`, `decision making`, `feature-extraction`) confirman que procesa conjuntamente imagen y texto y que su salida está pensada como representación (embeddings) más que como generación autoregresiva.

No se dispone de detalles sobre la composición del dataset de entrenamiento, el número de tokens vistos, la estrategia de alineación entre modalidades (por ejemplo, pérdidas contrastivas tipo CLIP o SigLIP), ni sobre si se aplicaron fases de ajuste con RLHF o DPO. Tampoco se documenta ninguna innovación técnica concreta (atención lineal, decodificación especulativa u otras) en la información proporcionada.

## Capacidades

- Extracción de características y generación de embeddings multimodales (imagen y texto).
- Cálculo de similitud entre pares imagen-texto y texto-texto.
- Recuperación imagen-texto (`image-text-retrieval`), útil para búsqueda y ranking.
- Clasificación sobre representaciones multimodales.
- Toma de decisiones asistida por representaciones (`decision making`), según las etiquetas del repositorio.
- Procesamiento conjunto imagen-texto (`image-text-to-text`), según las etiquetas del repositorio.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo de razonamiento, audio, visión): solo se confirma el componente multimodal imagen-texto por las etiquetas; no hay detalle adicional.

## Casos de uso

- Búsqueda multimodal en catálogos: usar los embeddings del modelo para indexar imágenes de producto y consultas en lenguaje natural, y recuperar los candidatos más similares mediante similitud coseno.
- Moderación de contenido asistida: clasificar pares imagen-texto como coherentes o incoherentes para detectar publicaciones cuyo texto no corresponde a la imagen.
- Sistemas de recomendación visual: generar representaciones de imágenes y de descripciones de usuario para alimentar un motor de recomendación basado en similitud.
- Deduplicación y clustering de activos visuales: agrupar imágenes o vídeos por similitud de embedding para limpiar grandes almacenes de datos multimedia.
- Búsqueda de vídeo por descripción textual: indexar fotogramas clave con el encoder y permitir consultas textuales, siempre que se valide el contexto máximo real del modelo.
- Clasificación y enrutado en pipelines internos: usar las representaciones como entrada a clasificadores ligeros para enrutar tickets o documentos con componente visual.
- Análisis de accesibilidad: evaluar la coherencia entre el texto alternativo y la imagen para auditar contenidos web.
- Anotación semiautomática de datasets: precalcular embeddings para reducir el coste de etiquetado humano en tareas de recuperación y similitud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del recuento de parámetros (29,78 mil millones) y del tamaño del repositorio (59,6 GB); no son datos oficiales publicados por Meta.

- VRAM estimada en bf16/fp16: aproximadamente 60 GB solo para pesos, más overhead de activaciones. Requiere GPU de 80 GB (A100, H100) o reparto multi-GPU.
- VRAM estimada en int8/fp8: en torno a 30-35 GB de pesos; encaja con A100 40 GB de forma ajustada, o con RTX 6000 Ada 48 GB y L40S.
- VRAM estimada en int4: en torno a 15-18 GB de pesos más overhead; podría caber en RTX 4090 24 GB o RTX 3090 24 GB, aunque no se confirma soporte oficial de cuantización a 4 bits.
- GPU recomendadas: A100 80 GB, H100 80 GB para bf16; A100 40 GB, L40S o RTX 6000 Ada para int8; RTX 4090/3090 para int4 si existe soporte.
- Cabe en GPU de consumo: solo en cuantización de 4 bits y con reservas; en bf16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: la librería indicada es `transformers`. No se confirma compatibilidad con vLLM, TGI, llama.cpp u Ollama, ni la existencia de checkpoints GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| facebook/meta-encoder | ~29,78 B | No disponible | Apache 2.0 | Gated en HuggingFace |
| meta-models/Muse-Glimmer-30B (modelo base) | No confirmado (denominación "30B") | No disponible | No disponible | No disponible |
| Alternativas comparables de la misma categoría | No disponible | No disponible | No disponible | No disponible |

No se dispone de información suficiente sobre modelos comparables de representación multimodal de tamaño similar para establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; al ser un encoder multimodal, es esperable heredar sesgos de sus datos de entrenamiento, pero no hay datos que lo confirmen.
- Riesgo de alucinación: no aplica del mismo modo que en modelos generativos, ya que el pipeline es de extracción de características; sin embargo, en tareas de recuperación puede devolver resultados irrelevantes si los embeddings no están bien calibrados.
- Limitaciones de contexto e idioma: se desconoce la longitud de contexto soportada y la cobertura idiomática real.
- Restricciones de licencia: aunque la licencia declarada es Apache 2.0, el acceso al repositorio está restringido (gated) y requiere aceptar condiciones adicionales en HuggingFace; conviene revisar los términos antes de un uso comercial.
- Falta de documentación: no se han localizado paper, blog ni ficha técnica detallada; cualquier integración en producción debería ir precedida de una evaluación propia.
- Dependencia del base model: cualquier limitación heredada de meta-models/Muse-Glimmer-30B afecta directamente a este modelo, y dicha información tampoco está disponible.
- Estado de adopción: con 11 descargas, no hay evidencia de uso en producción ni de validación por parte de la comunidad.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/facebook/meta-encoder
- Modelo base referenciado: https://huggingface.co/meta-models/Muse-Glimmer-30B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la búsqueda web realizada.
