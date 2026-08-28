# aspect-ratio-scaling/block-attnres-lr2e-3-llama-400M-L24-pretrain

## Resumen

Este repositorio contiene un checkpoint crudo de entrenamiento de un modelo de lenguaje causal basado en la arquitectura Llama, con aproximadamente 400 millones de parámetros y 24 capas. El nombre del modelo, `block-attnres-lr2e-3-llama-400M-L24-pretrain`, indica que forma parte de una serie de experimentos sobre *Attention Residuals* (AttnRes), una modificación propuesta en el artículo de arXiv 2603.15031 que sustituye la acumulación fija de conexiones residuales por una atención softmax sobre las salidas de capas anteriores. El autor, `aspect-ratio-scaling`, lo publica como material de investigación para estudiar el efecto de esta variante en el escalado de profundidad.

El checkpoint se ha subido desde un directorio de entrenamiento distribuido y conserva el formato original de OLMo-core, con pasos de entrenamiento que van desde `step0` hasta `step7600`. No es un modelo exportado a HuggingFace `from_pretrained()`, por lo que no puede cargarse directamente con las utilidades estándar de Transformers. Su relevancia radica en que permite reproducir y analizar los resultados de una arquitectura alternativa a las conexiones residuales convencionales, un área de investigación activa en el diseño de transformers profundos.

La información disponible es muy limitada: no se especifican licencia, idiomas, ni datos de entrenamiento. El repositorio tiene un tamaño de 9,8 GB, consistente con múltiples checkpoints y estados del optimizador. Este modelo no está destinado a uso en producción, sino a fines de investigación y análisis de arquitecturas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con atención residual (AttnRes) sobre base Llama |
| Parametros totales | ~400M (inferido del nombre del modelo) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no aplica (checkpoint crudo en precisión original) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Checkpoint distribuido de OLMo-core (no safetensors estándar) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Llama (PreNorm, atención por ventanas, etc.) pero incorpora la modificación AttnRes: en lugar de sumar las salidas de cada capa con pesos fijos unitarios, se aplica una atención softmax sobre las salidas de las capas anteriores, permitiendo un control adaptativo de la contribución de cada capa. Esta técnica busca mitigar el crecimiento incontrolado de los estados ocultos en modelos profundos y evitar la dilución de la señal. El entrenamiento se realizó con una tasa de aprendizaje de 2e-3 (indicada en el nombre) y el checkpoint incluye pasos hasta el 7600. No se dispone de información sobre el dataset, el número total de tokens ni si se aplicaron técnicas de alineación como RLHF o DPO. El repositorio conserva la estructura original del entrenamiento distribuido, lo que sugiere que se trata de un experimento de pretraining a gran escala.

## Capacidades

Al tratarse de un checkpoint intermedio sin evaluación publicada, no se pueden afirmar capacidades concretas. No obstante, por su naturaleza de modelo causal de lenguaje, se espera que pueda generar texto y completar secuencias, aunque sin garantías de calidad o coherencia. No hay información sobre soporte de tool calling, agentes, razonamiento multi-paso, visión o audio. El modelo es monolingüe de forma desconocida y no se ha validado su rendimiento en tareas específicas.

## Casos de uso

- Investigación sobre arquitecturas de atención residual: el checkpoint permite reproducir los experimentos del paper AttnRes y estudiar cómo la atención sobre capas anteriores afecta la representación de estados ocultos en modelos de 400M con 24 capas.
- Análisis de la dinámica de entrenamiento en modelos profundos: los pasos intermedios (step3000, step6000, step7600) facilitan el estudio de la evolución de la pérdida y las representaciones durante el pretraining.
- Comparación con modelos Llama estándar de tamaño similar: al compartir la base Llama, se puede aislar el efecto de AttnRes frente a las conexiones residuales fijas.
- Desarrollo de técnicas de conversión de checkpoints: dado que no es un formato HuggingFace, sirve como caso de prueba para herramientas de conversión de OLMo-core a formatos estándar.
- Estudio de escalado de profundidad: la serie de modelos con distintas profundidades (L16, L24) publicada por el autor permite analizar cómo AttnRes modifica la ley de escalado.
- Educación y reproducción de resultados académicos: útil para estudiantes e investigadores que deseen verificar los hallazgos del artículo de arXiv.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de evaluación (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. Cualquier afirmación sobre rendimiento sería especulativa.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de ~400M parámetros en fp32, se requieren aproximadamente 1,6 GB solo para los pesos; sin embargo, al ser un checkpoint con estados de optimizador, el tamaño total del repositorio (9,8 GB) sugiere que la carga en memoria puede superar los 8 GB si se incluyen los estados del optimizador.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) podría cargar el modelo en fp32 para inferencia, pero para entrenamiento o fine-tuning se necesitaría más memoria.
- No es un modelo optimizado para consumer GPU; su formato crudo requiere conversión previa.
- Opciones de despliegue: no es compatible directamente con vLLM, llama.cpp, Ollama o TGI. Requiere cargarlo con OLMo-core (`load_model_and_optim_state()`) y posteriormente exportarlo a un formato estándar (por ejemplo, safetensors) para su uso con estas herramientas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos directos. El modelo es un checkpoint de investigación sin evaluación pública, por lo que no se puede comparar con Llama-2-400M, OLMo-400M u otras alternativas de tamaño similar en términos de rendimiento. La única referencia es el artículo de arXiv que propone AttnRes, pero no incluye resultados de este checkpoint específico.

## Limitaciones y advertencias

- Es un checkpoint crudo, no un modelo final: no ha sido sometido a alineación, fine-tuning ni evaluación de seguridad.
- No es compatible con las APIs estándar de HuggingFace; requiere herramientas específicas de OLMo-core para su carga.
- Licencia no especificada: el uso comercial o la redistribución pueden estar sujetos a restricciones legales no declaradas.
- Sin información sobre sesgos o alucinaciones: al no haberse evaluado, se desconoce su comportamiento en tareas sensibles.
- El entrenamiento solo alcanzó el paso 7600, por lo que es probable que el modelo esté subentrenado y su calidad de generación sea baja.
- Idiomas no declarados: no se sabe si el modelo fue entrenado en un corpus multilingüe o solo en inglés.
- No se recomienda su uso en producción bajo ninguna circunstancia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/aspect-ratio-scaling/block-attnres-lr2e-3-llama-400M-L24-pretrain
- Colección AttnRes del autor: https://huggingface.co/collections/aspect-ratio-scaling/attnres
- Paper de Attention Residuals (arXiv): https://arxiv.org/abs/2603.15031
- Repositorio relacionado (variante L16): https://huggingface.co/aspect-ratio-scaling/attnres-lr2e-3-llama-400M-L16-pretrain
