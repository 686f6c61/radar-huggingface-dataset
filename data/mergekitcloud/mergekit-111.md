# MergekitCloud/mergekit-111

## Resumen

MergekitCloud/mergekit-111 es un modelo de lenguaje de tipo decoder-only obtenido mediante fusión de pesos (weight merging) de dos checkpoints de la familia Qwen2: Qwen/Qwen2-0.5B y Qwen/Qwen2-0.5B-Instruct. La fusión se ha realizado con la herramienta mergekit utilizando el método SLERP (interpolación esférica) y se ha publicado bajo el nombre genérico "merged-model", sin una model card descriptiva más allá de la configuración YAML del merge. El modelo cuenta con 493.772.928 parámetros totales y un repositorio de 1,0 GB en formato safetensors con pesos en bfloat16.

El propósito declarado de este tipo de artefactos es combinar las capacidades de un modelo base preentrenado con las de su variante ajustada por instrucciones, buscando un equilibrio entre el conocimiento crudo del modelo base y la alineación conversacional del modelo instruct. En este caso concreto, el coeficiente de interpolación t se ha fijado en 0,0 para las capas embed_tokens y lm_head (se conservan íntegramente las del modelo base, Qwen/Qwen2-0.5B) y en 0,50 para el resto de las capas, con el tokenizador tomado también del modelo base.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un modelo con 0 descargas y 0 "likes", creado y actualizado el mismo día (6 de octubre de 2026), sin licencia declarada ni idiomas especificados, lo que sugiere una publicación automatizada más que un artefacto mantenido. No se han publicado benchmarks ni documentación adicional. Se recomienda cautela antes de usarlo en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 493.772.928 (0,49 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la familia Qwen2 documenta 32.768 tokens, no confirmado para este artefacto) |
| Tipos de cuantizacion | no se publican variantes cuantizadas; los pesos del repositorio estan en bfloat16 |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2, un transformer decoder-only con normalizacion RMSNorm, activaciones SwiGLU, atencion con query-key-value agrupados (GQA) e incrustaciones posicionales rotatorias (RoPE). El modelo no se ha entrenado desde cero: es el resultado de aplicar el método SLERP de mergekit. Según la configuración YAML publicada, la interpolación se aplica sobre el checkpoint base Qwen/Qwen2-0.5B y el checkpoint ajustado Qwen/Qwen2-0.5B-Instruct, con un coeficiente t = 0,50 para todas las capas excepto `embed_tokens` y `lm_head`, que se mantienen al valor t = 0,0, es decir, tomados sin cambios del modelo base. El tokenizador también proviene del modelo base (`tokenizer_source: base`) y la plantilla de chat se resuelve automáticamente (`chat_template: auto`).

No hay información sobre datos de entrenamiento, número de tokens, composición del corpus, ni sobre etapas de RLHF, DPO o ajuste por preferencias específicas de este artefacto, ya que el merge no introduce entrenamiento adicional. La única innovación técnica es, por tanto, el propio procedimiento de fusión de pesos: el SLERP interpola los tensores sobre una esfera, lo que en la práctica suele preservar mejor la norma de los vectores que una interpolación lineal simple. No se han publicado detalles sobre evaluación del resultado, ni comparación con cada uno de los modelos padre.

## Capacidades

- Generación de texto autoregresiva en el pipeline `text-generation`.
- Conversación multi-turno, asumiendo que la plantilla de chat se resuelve correctamente desde el modelo instruct fusionado.
- Hereda, en teoría, parte del comportamiento de seguimiento de instrucciones de Qwen2-0.5B-Instruct, aunque el merge con el modelo base puede degradar esta capacidad.
- Capacidades de razonamiento, matemáticas y código: no documentadas para este artefacto; limitadas por el tamaño de 0,5 B.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas (los idiomas figuran como no disponibles).
- Capacidades especiales (modo thinking, visión, audio): ninguna declarada.

## Casos de uso

- Pruebas unitarias de infraestructura de inferencia: por su tamaño (0,49 B), es útil como modelo de prueba para validar pipelines con vLLM, Text Generation Inference, Transformers o llama.cpp antes de escalar a modelos mayores.
- Experimentación con técnicas de fusión de modelos: sirve como caso de estudio reproducible de mergekit con SLERP, dado que la configuración YAML completa está publicada.
- Generación de texto ligera en entornos con recursos muy limitados: puede ejecutarse en CPU o en GPU de gama baja para tareas de autocompletado o resumen breve.
- Prototipado rápido de chatbots: al derivar de una variante instruct, permite iterar sobre plantillas y prompts sin coste de GPU elevado.
- Clasificación y etiquetado con few-shot prompting: su tamaño permite integrarlo en scripts de procesamiento por lotes donde el coste por token importa.
- Educación y divulgación: útil para explicar en talleres cómo se construye un modelo fusionado y qué efecto tiene el coeficiente t en cada capa.
- Filtrado o preprocesado previo en cascada: puede usarse como primera etapa barata para descartar o marcar entradas antes de pasarlas a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación para este artefacto, ni comparaciones medidas con sus modelos padre.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16/fp16: aproximadamente 1 GB de pesos más el overhead de activaciones y caché KV; en la práctica, entre 1,5 y 2,5 GB según longitud de contexto y lote.
- Cuantizado a 8 bits: en torno a 0,5-0,7 GB. A 4 bits (si se genera el GGUF): en torno a 0,3-0,4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema, aunque están sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU dedicadas modernas, e incluso en iGPU con memoria unificada y en CPU pura.
- Opciones de despliegue: Transformers (librería declarada en la model card), Text Generation Inference (el tag `text-generation-inference` está presente), llama.cpp/Ollama tras convertir los pesos a GGUF (no se publica GGUF oficial).
- Latencia y throughput estimados: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MergekitCloud/mergekit-111 | 0,49 B | no disponible | no disponible | HuggingFace, 0 descargas | Merge SLERP de los dos siguientes |
| Qwen/Qwen2-0.5B | 0,49 B | 32.768 tokens (documentado por Qwen) | Apache 2.0 (según Qwen) | HuggingFace, ampliamente usado | Modelo base preentrenado |
| Qwen/Qwen2-0.5B-Instruct | 0,49 B | 32.768 tokens (documentado por Qwen) | Apache 2.0 (según Qwen) | HuggingFace, ampliamente usado | Variante ajustada por instrucciones |
| SmolLM-135M / SmolLM-360M (HuggingFace) | 0,135 B / 0,36 B | 2.048 tokens | Apache 2.0 | HuggingFace | Alternativa de tamaño similar para entornos muy limitados |

Nota: los datos de los modelos Qwen2 y SmolLM corresponden a información pública de sus respectivas model cards, no a la información proporcionada para este artefacto. La licencia de mergekit-111 no está declarada, lo que impide confirmar si hereda la Apache 2.0 de sus padres.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar que herede la Apache 2.0 de los modelos Qwen2, por lo que el uso comercial queda en un limbo legal.
- Idiomas soportados no especificados; se desconoce el comportamiento fuera del inglés y el chino habituales en Qwen2.
- Riesgo elevado de alucinación: con 0,49 B de parámetros, la capacidad de generar hechos verificables es muy limitada en comparación con modelos de varios miles de millones de parámetros.
- Capacidad de razonamiento y matemáticas reducida por el tamaño; no apto para tareas que requieran precisión factual o cálculo.
- El merge con el modelo base puede degradar el seguimiento de instrucciones respecto a Qwen2-0.5B-Instruct, ya que solo las capas de embedding y de salida conservan los pesos del base sin mezclar (t = 0,0), mientras que el resto se interpola al 50 %.
- No se han publicado evaluaciones, por lo que no hay evidencia empírica de que el merge mejore a ninguno de sus padres.
- Modelo con 0 descargas y 0 "likes", publicado y actualizado el mismo día: no hay indicios de mantenimiento, soporte ni actualizaciones.
- Nombre genérico ("mergekit-111") y ausencia de model card descriptiva: difícil de rastrear e integrar en catálogos.
- No se publican variantes cuantizadas ni archivos GGUF; cualquier cuantización habría que generarla manualmente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MergekitCloud/mergekit-111
- Modelo base (preentrenado): https://huggingface.co/Qwen/Qwen2-0.5B
- Modelo base (instruct): https://huggingface.co/Qwen/Qwen2-0.5B-Instruct
- Herramienta de fusión mergekit: https://github.com/cg123/mergekit
- Referencia del método SLERP: https://en.wikipedia.org/wiki/Slerp
