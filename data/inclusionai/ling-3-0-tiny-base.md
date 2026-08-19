# inclusionAI/Ling-3.0-tiny-base

## Resumen

Ling-3.0-tiny-base es un modelo de lenguaje fundacional de tipo MoE (Mixture of Experts) desarrollado por InclusionAI, la división de inteligencia artificial de Ant Group. Forma parte de la familia Ling-3.0, la más eficiente publicada hasta la fecha por este laboratorio, y se distribuye bajo licencia MIT. Este checkpoint concreto corresponde a la etapa final del proceso de entrenamiento, tras aplicar la técnica WSM (Warmup-Stable and Merge), pero antes de cualquier post-entrenamiento o alineación, por lo que está pensado exclusivamente para investigación y fine-tuning, no para uso directo en producción.

El modelo presenta una arquitectura híbrida lineal MoE con 128 expertos enrutados, de los cuales solo se activan 8 más 1 experto compartido por token, lo que resulta en 8.200 millones de parámetros totales (según los pesos reales en safetensors) pero únicamente 1.300 millones activos por token. Esta combinación de sparse MoE con atención lineal híbrida (KDA + Gated MLA) permite procesar contextos largos con un coste computacional reducido. El checkpoint se libera junto con otras etapas intermedias (pre-entrenado y mid-entrenado) para facilitar la investigación en entrenamiento continuo, adaptación de dominio y experimentación con estrategias de merging de pesos.

La relevancia de este lanzamiento radica en que ofrece a la comunidad un modelo base de tamaño contenido pero con una arquitectura innovadora, que reemplaza el tradicional decay de learning rate por un merging ponderado de checkpoints (WSM), lo que facilita la reutilización del modelo para pre-entrenamiento continuo sin necesidad de reentrenar desde cero. Además, al compartir la misma receta de entrenamiento que el modelo mayor Ling-3.0-flash-base, permite validar estrategias a pequeña escala antes de escalarlas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid-linear MoE (KDA + Gated MLA) |
| Parametros totales | 8.209.997.600 (según safetensors; la model card indica 7.9B) |
| Parametros activos | 1.300 millones (8 expertos enrutados + 1 compartido) |
| Longitud de contexto | no disponible (la versión post-entrenada Ling-3.0-tiny soporta 256K) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Ling-3.0-tiny-base emplea una arquitectura híbrida que combina atención lineal nativa (KDA) con atención Gated MLA (Multi-head Latent Attention). La configuración consta de 18 capas KDA y 6 capas Gated MLA en proporción 3:1, más una capa densa adicional. El modelo tiene 128 expertos enrutados, de los cuales se activan 8 por token, junto con 1 experto compartido. El tamaño oculto es de 1536, con un tamaño intermedio de experto de 512 y un tamaño denso intermedio de 4608. El vocabulario alcanza las 157.184 entradas.

El entrenamiento se divide en tres etapas: pre-entrenamiento a gran escala, mid-training, y finalmente un merging WSM (Warmup-Stable and Merge) basado en el paper arXiv:2507.17634. Este método sustituye el decay de learning rate convencional por un merging ponderado de checkpoints, lo que elimina la fase de decay y permite explorar diferentes perfiles de decay offline sin repetir costosos experimentos. El checkpoint liberado corresponde al resultado final del merging WSM, pero no ha pasado por post-entrenamiento (como RLHF o DPO). No se han publicado detalles sobre el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Modelo base sin post-entrenamiento: no está alineado para conversación ni instrucciones directas.
- Soporta pre-entrenamiento continuo y fine-tuning supervisado para adaptación a dominios específicos.
- Permite optimización de preferencias (RLHF/DPO) y post-entrenamiento por parte de la comunidad.
- Adecuado para investigación en sistemas MoE, atención lineal y manejo de contextos largos.
- Arquitectura eficiente: solo 1.300 millones de parámetros activos por token, lo que reduce costes de inferencia.
- Al compartir receta de entrenamiento con Ling-3.0-flash-base, permite escalar estrategias validadas a modelos mayores.

## Casos de uso

- Fine-tuning para dominio jurídico: el modelo base puede adaptarse con datos legales específicos para tareas de análisis de contratos o jurisprudencia, aprovechando su ventana de contexto ampliable y su eficiencia computacional.
- Pre-entrenamiento continuo con datos propios: gracias al diseño WSM sin decay, el modelo puede seguir entrenándose con datos nuevos sin degradación, ideal para empresas que acumulan corpus privados.
- Investigación en eficiencia MoE: sirve como banco de pruebas para estudiar rutas de expertos, balanceo de carga y estrategias de activación sin necesidad de un modelo masivo.
- Desarrollo de agentes conversacionales especializados: tras un post-entrenamiento con datos de diálogo, puede integrarse en sistemas de atención al cliente con funciones de tool calling, gracias a su arquitectura que soporta contextos largos.
- Experimentación con merging de checkpoints: investigadores pueden replicar y extender la técnica WSM, comparando diferentes perfiles de merging sin reentrenar desde cero.
- Distilación de conocimiento: al ser un modelo compacto y eficiente, puede servir como modelo profesor para entrenar modelos más pequeños en tareas específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una evaluación con un benchmark propio que cubre conocimiento, código, matemáticas, razonamiento, multilingüismo y comprensión de contexto largo, pero los datos numéricos se presentan únicamente en una imagen no accesible en el texto. No se dispone de cifras concretas de MMLU, HumanEval, GSM8K u otros estándares.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 16,4 GB (tamaño del repo), aunque al ser un modelo base sin post-entrenamiento no se recomienda su uso directo en producción.
- Para fine-tuning con LoRA o QLoRA, se puede trabajar con GPUs de 24 GB (RTX 3090/4090) si se aplican técnicas de cuantización.
- Fine-tuning completo requeriría al menos 40-80 GB de VRAM, dependiendo del batch size y la longitud de secuencia.
- GPUs recomendadas: A100 40/80 GB, H100, o clusters con múltiples GPUs para entrenamiento distribuido.
- Opciones de despliegue: al ser un modelo base, las opciones habituales como vLLM, TGI o llama.cpp no son directamente aplicables sin un post-entrenamiento previo. Para fine-tuning se puede usar Hugging Face Transformers con DeepSpeed o FSDP.
- Latencia y throughput: no disponibles, dependen del hardware y la configuración de inferencia tras el fine-tuning.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos publicados. A nivel estructural, se puede comparar con otros MoE de tamaño similar:

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia |
|---|---|---|---|---|
| Ling-3.0-tiny-base | 8,2B | 1,3B | no disponible | MIT |
| Mixtral 8x7B | 46,7B | 12,9B | 32K | Apache 2.0 |
| Qwen2.5-MoE-A2.7B | 14,3B | 2,7B | 128K | Apache 2.0 |

Ling-3.0-tiny-base destaca por su menor número de parámetros activos (1,3B) frente a alternativas similares, lo que lo hace especialmente eficiente en inferencia, aunque al ser un checkpoint base sin post-entrenamiento no es directamente comparable en tareas de chat o instrucciones.

## Limitaciones y advertencias

- Modelo base sin alineación: no debe usarse directamente para chat o tareas de producción sin un post-entrenamiento previo.
- Riesgo de alucinaciones y sesgos: al no haber pasado por RLHF u otros métodos de alineación, puede generar contenido incorrecto, sesgado o dañino.
- Idiomas no especificados: no se ha publicado información sobre los idiomas soportados, aunque por el vocabulario (157K) probablemente incluya múltiples lenguas.
- Longitud de contexto no confirmada para este checkpoint: la versión post-entrenada soporta 256K, pero no se ha verificado para el modelo base.
- Requiere validación específica para casos de uso críticos: la model card desaconseja explícitamente su uso en aplicaciones de seguridad sin evaluación adicional.
- Discrepancia en el número de parámetros: los pesos reales en safetensors indican 8.209.997.600, mientras que la model card cita 7,9B; esta diferencia puede deberse a pesos no entrenables o al embedding.

## Enlaces

- [HuggingFace - Ling-3.0-tiny-base](https://huggingface.co/inclusionAI/Ling-3.0-tiny-base)
- [HuggingFace - Ling-3.0-tiny (post-entrenado)](https://huggingface.co/inclusionAI/Ling-3.0-tiny)
- [HuggingFace - Ling-3.0-tiny-base-30T (pre-entrenado)](https://huggingface.co/inclusionAI/Ling-3.0-tiny-base-30T)
- [HuggingFace - Ling-3.0-tiny-base-midtrain](https://huggingface.co/inclusionAI/Ling-3.0-tiny-base-midtrain)
- [ModelScope - inclusionAI](https://modelscope.cn/organization/inclusionAI)
- [OpenRouter - Ling-3.0-tiny](https://openrouter.ai/inclusionai/ling-3.0-tiny:free)
- [GitHub - inclusionAI/Ling](https://github.com/inclusionAI/Ling)
- [Paper WSM (arXiv:2507.17634)](https://arxiv.org/abs/2507.17634)
- [Ling-cookbook (ejemplos de fine-tuning)](https://github.com/inclusionAI/ling-cookbook/)
