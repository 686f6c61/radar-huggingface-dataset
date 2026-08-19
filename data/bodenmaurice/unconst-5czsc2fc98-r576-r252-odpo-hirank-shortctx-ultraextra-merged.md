# bodenmaurice/unconst-5czsc2fc98-r576-r252-odpo-hirank-shortctx-ultraextra-merged

## Resumen

El modelo `unconst-5czsc2fc98-r576-r252-odpo-hirank-shortctx-ultraextra-merged` es un checkpoint derivado de la serie Affine, desarrollado por el usuario `bodenmaurice` sobre la base `unconst/Affine-5czsc2fc98-r252-merged`. Se trata de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con arquitectura Qwen3.5 MoE, como indican las etiquetas `qwen3_5_moe` y `affine`. El modelo tiene aproximadamente 35.1 mil millones de parámetros totales y se distribuye bajo licencia Apache 2.0.

El proceso de entrenamiento se basa en *offline DPO* (Direct Preference Optimization) sobre pares de preferencias generados con un profesor anclado, optimizado para el sistema de razonamiento "Reason v3". El ajuste se realizó con LoRA (rank 64, alpha 128) y un dataset filtrado por HiRank en contexto corto. El checkpoint se creó en agosto de 2026 y no ha recibido descargas ni valoraciones en HuggingFace, lo que sugiere que es un experimento interno o de validación dentro de un pipeline de desarrollo más amplio.

La relevancia de este modelo radica en su metodología de alineación: combina DPO offline con un filtrado de alta calidad (HiRank) y un entrenamiento en pasos extra, buscando mejorar el razonamiento de la familia Affine. Sin embargo, al no existir documentación pública de capacidades ni benchmarks, su utilidad práctica queda limitada a contextos de investigación o como referencia dentro del ecosistema Affine.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE (Mixture-of-Experts) |
| Parametros totales | 35.107.181.936 (aprox. 35,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 70,2 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de su base `unconst/Affine-5czsc2fc98-r252-merged`, que a su vez se construye sobre Qwen3.5 MoE. Esto implica un transformer con capas de mezcla de expertos, aunque no se especifican los parámetros activos ni el número de expertos. El entrenamiento se realizó mediante *offline DPO* sobre pares de preferencias de razonamiento, donde la respuesta "elegida" es aquella con mayor puntuación `lpC(y_C|z) - lpC(y_C|∅)` (diferencia de log-probabilidad condicionada al pensamiento frente a sin pensamiento). Este criterio está alineado con el sistema "Reason v3" del lado del profesor.

El ajuste fino empleó LoRA con r=64 y alpha=128, un beta de 0.02, longitud máxima de 6144 tokens y un máximo de 2400 pasos (detenido en 221 por agotamiento de datos). El dataset proviene de duelos de razonamiento (`dpo_duel_reason.jsonl`) filtrado con HiRank en contexto corto. El entrenamiento se ejecutó en dos GPUs B300 (de un nodo de 8) durante una época. No se menciona el uso de RLHF adicional ni otras técnicas de alineación.

## Capacidades

- Generación de texto y razonamiento: al ser un modelo de lenguaje MoE, se espera capacidad de generación de texto y razonamiento de varios pasos, aunque no se han publicado evaluaciones específicas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible, aunque el entrenamiento con DPO sobre pensamientos sugiere un enfoque en razonamiento encadenado.
- Capacidades multilingües: no disponible (no se especifican idiomas).
- Capacidades especiales: el entrenamiento se optimizó para el sistema "Reason v3", lo que podría implicar un modo de pensamiento explícito, pero no hay documentación pública al respecto.

## Casos de uso

- Investigación en alineación de modelos: el modelo sirve como punto de referencia para estudiar el impacto de DPO offline con filtrado HiRank en el razonamiento de modelos MoE, especialmente dentro de la serie Affine.
- Desarrollo de pipelines de preferencias: su metodología de entrenamiento (pares de preferencias con anclaje de profesor) puede replicarse para experimentos de alineación en otros modelos base.
- Evaluación comparativa de checkpoints intermedios: al ser un checkpoint de un proceso iterativo, puede usarse para medir la evolución de métricas de razonamiento en diferentes etapas de entrenamiento.
- Pruebas de inferencia en entornos controlados: con 35B parámetros, puede desplegarse en servidores con múltiples GPUs para validar su comportamiento en tareas de razonamiento sintético.
- Análisis de robustez del filtrado de datos: el uso de HiRank permite estudiar cómo la selección de preferencias de alta calidad afecta al rendimiento final.
- Exploración de técnicas de fusión de modelos: al ser un "merged" de varios pasos, puede utilizarse para probar estrategias de merging con otros checkpoints de la serie.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una "evidencia simulada" (n80) contra el rey vivo `r252`, pero no se detallan métricas concretas ni comparaciones numéricas. Por tanto, no es posible presentar una tabla de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: con 35.107 millones de parámetros, en FP16 se requieren aproximadamente 70 GB de VRAM solo para los pesos. Con cuantización de 8 bits (~35 GB) o 4 bits (~18 GB) podría caber en GPUs de consumo alto, pero no se proporcionan archivos GGUF ni cuantizaciones en el repositorio.
- GPU recomendadas: para inferencia sin cuantizar, se necesitan GPUs de datacenter como A100 80GB, H100 80GB o B300 (como las usadas en entrenamiento). Con cuantización, una RTX 4090 (24 GB) o RTX 6000 Ada (48 GB) podría ser suficiente si se dispone de los formatos adecuados.
- Si cabe en consumer GPU: no se puede confirmar sin cuantizaciones disponibles; en teoría con 4 bits podría intentarse en una RTX 4090, pero no hay archivos listos para usar.
- Opciones de despliegue: al no haber archivos GGUF ni ONNX, el despliegue requeriría conversión manual. Frameworks como vLLM o TGI pueden cargar safetensors, pero necesitan GPUs con suficiente VRAM.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y de la configuración de MoE (número de expertos activos, desconocido).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables dentro de la serie Affine ni de otras familias MoE de tamaño similar (por ejemplo, Mixtral 8x7B o Qwen3 MoE). La falta de benchmarks públicos impide una comparación cuantitativa. Se recomienda consultar el repositorio base `unconst/Affine-5czsc2fc98-r252-merged` para más contexto, aunque tampoco se encontraron datos adicionales en la búsqueda web.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado; al ser un modelo entrenado sobre datos de razonamiento sintético, podría heredar sesgos de los datos de preferencias utilizados.
- Riesgo de alucinacion: no evaluado; como cualquier LLM, puede generar contenido plausible pero incorrecto, especialmente en tareas de razonamiento complejo.
- Limitaciones de contexto o idioma: la longitud máxima de entrenamiento fue de 6144 tokens, pero el contexto de inferencia no está especificado. No se indican idiomas soportados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base y sus derivados pueden tener condiciones adicionales no documentadas.
- Caveat para producción: el modelo es un checkpoint experimental sin validación externa, sin benchmarks y sin soporte de cuantización. No es recomendable para uso en producción sin una evaluación exhaustiva.
- Ausencia de documentación: no hay información sobre el dataset completo, el preprocesado ni los criterios de filtrado más allá de lo mencionado en la model card.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bodenmaurice/unconst-5czsc2fc98-r576-r252-odpo-hirank-shortctx-ultraextra-merged
- Modelo base (unconst/Affine-5czsc2fc98-r252-merged): https://huggingface.co/unconst/Affine-5czsc2fc98-r252-merged
- Checkpoint relacionado (LongCtx): https://huggingface.co/unconst/Affine-5czsc2fc98-r575-r252-odpo-hirank-longctx-ultraextra-merged
- Otro checkpoint base (r73): https://huggingface.co/unconst/Affine-5czsc2fc98-r73-merged
