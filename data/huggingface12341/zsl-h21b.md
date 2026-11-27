# huggingface12341/zsl-h21b

## Resumen

zsl-h21b es un modelo de fusión (merge) publicado por el usuario huggingface12341 bajo el paraguas del "Zils subnet 127 d3-lite pool". No se trata de un modelo entrenado desde cero, sino de una combinación de pesos derivada de cuatro checkpoints de la familia zils-lite y adjudex, todos ellos construidos sobre el modelo base Qwen/Qwen3.5-0.8B. El resultado es un modelo de aproximadamente 853 millones de parámetros con licencia Apache-2.0.

El modelo se presenta con el pipeline `feature-extraction` y la etiqueta `decision-model`, lo que sugiere que su uso previsto está orientado a la extracción de representaciones y a tareas de decisión o clasificación, más que a la generación de texto abierta. La model card es extremadamente escueta: se limita a describir el método de fusión y las fuentes, sin aportar información sobre datos de entrenamiento, idiomas, contexto o evaluación.

Su relevancia es limitada y de nicho: se trata de un experimento de merging dentro de una comunidad pequeña, sin descargas ni likes en el momento de la consulta y sin benchmarks publicados. Resulta útil como referencia para quienes siguen técnicas de fusión de pesos (TIES) sobre modelos pequeños, pero no como modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B, según la model card); detalles no disponibles |
| Parametros totales | 852.985.920 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión de pesos mediante el método TIES con densidad 0.3 y lambda 0.5. El proceso parte de un "soup" (media uniforme) de dos checkpoints, joamCriff123/zils-lite-l1125a y joamCriff123/zils-lite-l1123q, al que se le suman los vectores de tarea calculados a partir de newsbang/adjudex-0.8b-v7 y Danielbrdz/Barcenas-Jev-0.8b. Los vectores de tarea se obtienen como la diferencia entre cada checkpoint y el modelo padre Qwen/Qwen3.5-0.8B, aplicada únicamente sobre los pesos de lenguaje; la torre de visión se hereda del modelo base.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en los modelos de origen. La innovación técnica reseñable es exclusivamente el procedimiento de merging: TIES con poda de parámetros redundantes (densidad 0.3) y escalado (lambda 0.5) para reducir interferencias entre vectores de tarea. No se documentan técnicas de decodificación especulativa ni mecanismos de atención lineal.

## Capacidades

- Extracción de características y representaciones (pipeline declarado: `feature-extraction`).
- Tareas de decisión o clasificación, según la etiqueta `decision-model` de la model card.
- Herencia potencial de las capacidades del modelo base Qwen3.5-0.8B, incluyendo una torre de visión, aunque no se detalla su funcionamiento ni su calidad tras el merge.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Extracción de embeddings para búsqueda semántica: el pipeline declarado es `feature-extraction`, por lo que el modelo puede emplearse para generar representaciones vectoriales de documentos y consultas en un motor de recuperación, siempre que se valide empíricamente la calidad de los embeddings.
- Clasificación de textos en pipelines ligeros: la etiqueta `decision-model` sugiere su uso como cabezal de decisión sobre representaciones, por ejemplo para enrutado de tickets o etiquetado de contenido.
- Experimentación con técnicas de merging: sirve como caso de estudio reproducible de TIES sobre modelos de menos de 1.000 millones de parámetros, útil para investigadores que estudien la fusión de checkpoints.
- Prototipado en hardware de consumo: con 853 millones de parámetros y pesos safetensors en un repo de 1,7 GB, cabe en GPUs de gama media para pruebas de inferencia en fp16 o cuantizado.
- Filtrado o ranking de candidatos en sistemas de recomendación: las representaciones extraídas pueden alimentar un reranker simple en una etapa de post-filtrado.
- Base para ajuste fino posterior (fine-tuning): al ser un modelo pequeño con licencia Apache-2.0, puede servir como punto de partida para tareas específicas de clasificación o extracción, aunque requeriría validación previa de su calidad base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB en fp16 (853 M de parámetros × 2 bytes), más overhead de activaciones y del runtime; en torno a 1 GB si se cuantiza a 8 bits y menos de 1 GB en 4 bits, aunque no se distribuyen pesos cuantizados oficialmente.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y en la mayoría de casos sobredimensionadas.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer modernas, incluidas las integradas con memoria unificada suficiente.
- Opciones de despliegue: transformers (librería declarada), con posibilidad de exportación a GGUF para llama.cpp u Ollama y de servir con vLLM o TGI, aunque no se documenta soporte verificado para estas herramientas.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zsl-h21b | 853 M | no disponible | Apache-2.0 | Hugging Face, 0 descargas | Merge TIES, sin benchmarks |
| Qwen/Qwen3.5-0.8B (padre) | ~800 M | no disponible | no disponible en esta ficha | Hugging Face | Modelo base oficial del que derivan los vectores de tarea |
| joamCriff123/zils-lite-l1125a | no disponible | no disponible | Apache-2.0 (según la model card) | Hugging Face | Fuente del merge |
| newsbang/adjudex-0.8b-v7 | ~800 M (por nombre) | no disponible | Apache-2.0 (según la model card) | Hugging Face | Fuente del merge |

No se dispone de datos de rendimiento comparativo entre estas variantes; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, métricas ni validación publicada, por lo que se desconoce su calidad real en cualquier tarea.
- Model card mínima: no se documentan idiomas, contexto, datos de entrenamiento ni limitaciones, lo que dificulta su uso responsable.
- Riesgo de alucinación: no evaluado; al derivar de un modelo de 0,8 B, es esperable una fiabilidad limitada en generación de texto y razonamiento, aunque el uso previsto sea de extracción de características.
- Sesgos: no documentados; los sesgos de los modelos de origen se propagan a través del merge sin mitigación conocida.
- Licencia Apache-2.0: permite uso comercial, pero se debe consultar el fichero NOTICE del repositorio y respetar las condiciones de los cuatro modelos fuente y del modelo padre.
- Naturaleza experimental: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción ni de mantenimiento.
- Compatibilidad de herramientas: al usar `custom_code` y una arquitectura derivada de Qwen3.5, puede requerir versiones específicas de transformers y no funcionar directamente en runtimes genéricos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface12341/zsl-h21b
- Modelo base padre: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Fuente del merge: https://huggingface.co/joamCriff123/zils-lite-l1125a
- Fuente del merge: https://huggingface.co/joamCriff123/zils-lite-l1123q
- Fuente del merge: https://huggingface.co/newsbang/adjudex-0.8b-v7
- Fuente del merge: https://huggingface.co/Danielbrdz/Barcenas-Jev-0.8b
