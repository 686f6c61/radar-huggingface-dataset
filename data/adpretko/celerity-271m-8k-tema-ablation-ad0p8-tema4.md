# adpretko/celerity-271m-8k-tema-ablation-ad0p8-tema4

## Resumen
Celerity 271M 8K es un checkpoint de un modelo de lenguaje de 271 millones de parámetros, desarrollado por el usuario adpretko y publicado en Hugging Face. Se trata de un experimento de ablación denominado `ad0.8_tema_mult4`, convertido desde el formato Cerebras CS al formato de Hugging Face. El modelo está entrenado con una longitud máxima de secuencia de 8192 tokens y utiliza ALiBi como tipo de embedding posicional, según la información de la model card.

La relevancia de este checkpoint es fundamentalmente investigadora: forma parte de una serie de ablaciones sobre hiperparámetros de entrenamiento, en concreto sobre el multiplicador de tau-EMA y la tasa de attention dropout. No se presenta como un modelo final listo para producción, sino como una pieza para estudiar cómo varían los resultados al modificar dichos hiperparámetros. No se dispone de información sobre licencia, idiomas soportados, benchmarks ni cuantizaciones oficiales.

El modelo emplea código de modelado personalizado de Celerity y debe cargarse con `trust_remote_code=True`. Su tamaño compacto y su contexto de 8192 tokens lo sitúan en la categoría de modelos pequeños de contexto largo, útiles para experimentación con recursos limitados.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con ALiBi (no se detalla explícitamente en la información disponible) |
| Parametros totales | 271M |
| Parametros activos | no disponible |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (no se publican cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (custom_code); no se especifica safetensors ni GGUF |

## Arquitectura y entrenamiento
La model card no describe de forma explícita la arquitectura completa. Los elementos mencionados, como ALiBi como embedding posicional, attention dropout, residual dropout, stochastic depth y LayerDrop, apuntan a una arquitectura transformer. No se especifica si es decoder-only, encoder-decoder, denso o MoE. El checkpoint tiene 271M de parámetros y fue entrenado con una longitud máxima de secuencia de 8192 tokens, lo que permite procesar entradas de hasta esa longitud.

El entrenamiento corresponde al experimento de ablación `ad0.8_tema_mult4`, con un checkpoint fuente `checkpoint_13773.mdl` convertido desde el formato Cerebras CS mediante el commit `0e3d5d375695293479df9d2a3717f05f71a345b4` y el runtime `cbcore 2.6.0`. Se mantuvieron fijos el learning rate pico (0.15) y el batch global (48), variando tau-EMA con un multiplicador de 4 respecto a la línea base de 0.1745. Los valores registrados incluyen `tau_ema: 0.698`, weight decay `0.0006934653580420589`, attention dropout constante de 0.8, residual dropout 0.0, stochastic depth 0.0 y LayerDrop 0.0. El entrenamiento consta de 13773 pasos y el batch de validación es 32. No se indica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. La innovación principal es el propio estudio de ablación sobre tau-EMA y attention dropout.

## Capacidades
- Generación de texto: no documentada explícitamente en la información disponible.
- Procesamiento de contexto largo: la model card indica una longitud máxima de secuencia de 8192 tokens y uso de ALiBi, por lo que está entrenado para secuencias de hasta 8192 tokens.
- Razonamiento, código y matemáticas: no disponible.
- Tool calling / function calling: no disponible.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio, modo thinking): no disponible.

## Casos de uso
- Investigación en ablaciones de hiperparámetros: comparar este checkpoint con otros de la familia Celerity, como `ad0p4` o los de residual dropout, para estudiar el efecto de tau-EMA y attention dropout en el entrenamiento. Es adecuado porque su configuración está documentada y forma parte de una serie controlada de experimentos.
- Fine-tuning para clasificación o extracción de información: al ser un modelo de 271M, se puede ajustar con recursos modestos. Su contexto de 8192 tokens permite procesar documentos largos, aunque no hay datos públicos sobre su calidad tras fine-tuning.
- Generación de texto ligera en local: puede ejecutarse en GPUs de consumo si se dispone de una implementación compatible. Es útil para prototipos, demos y pruebas de concepto donde no se requiere un modelo de gran escala.
- Procesamiento de documentos largos: resumen, extracción de entidades o respuesta a preguntas sobre textos de hasta 8192 tokens, previa validación de su rendimiento en la tarea concreta.
- Experimentos de cuantización y eficiencia: aunque no hay cuantizaciones oficiales, su tamaño pequeño lo convierte en candidato para probar técnicas de compresión y despliegue en entornos con VRAM limitada.
- Evaluación de regularización: la attention dropout de 0.8 y el ajuste de tau-EMA son objetos de estudio; puede usarse para analizar estabilidad de entrenamiento y generalización en modelos pequeños.
- Prototipado de asistentes conversacionales: si tras un fine-tuning demuestra calidad suficiente, su contexto de 8192 tokens permitiría mantener conversaciones multi-turno, aunque no hay benchmarks que lo confirmen.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada: a partir del número de parámetros, los pesos ocupan aproximadamente 1,1 GB en fp32, 0,54 GB en fp16/bf16, 0,27 GB en int8 y 0,14 GB en int4. El KV cache para 8192 tokens añade VRAM no cuantificada en la información disponible.
- GPU recomendadas: no hay recomendaciones oficiales. Por tamaño, cualquier GPU con al menos 4-6 GB de VRAM podría ejecutarlo en fp16 con contexto reducido; para contexto completo de 8192 tokens se recomienda al menos 8 GB. GPUs como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobradas para este tamaño.
- Cabe en consumer GPU: sí, es probable que quepa en GPUs de consumo con 6-8 GB de VRAM para contexto completo, y en 4 GB para contexto corto, según la implementación.
- Opciones de despliegue: PyTorch/Transformers con `trust_remote_code=True`, obligatorio según la model card. No se confirma soporte en vLLM, llama.cpp, Ollama o TGI; al usar `custom_code`, puede requerir conversión adicional.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Configuración | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| adpretko/celerity-271m-8k-tema-ablation-ad0p8-tema4 | 271M | 8192 | ad0.8_tema_mult4 | no disponible | Hugging Face |
| adpretko/celerity-271m-8k-ad0p4 | 271M | 8192 | attention dropout 0.4 | no disponible | Hugging Face |
| adpretko/celerity-271m-8k-residual-dropout-0p4 | 271M | 8192 | residual dropout 0.4 | no disponible | Hugging Face |
| adpretko/celerity-906m-8k-ad0p1 | 906M | 8192 | attention dropout 0.1 | no disponible | Hugging Face |
| adpretko/celerity-504m-16k-ad0p8-ild | 504M | 16384 | attention dropout 0.8, ILD | no disponible | Hugging Face |

No se dispone de datos de benchmarks para comparar el rendimiento entre estos modelos ni con alternativas externas de tamaño similar.

## Limitaciones y advertencias
- Licencia no disponible: no se puede confirmar si permite uso comercial o qué restricciones aplica.
- Modelo de ablación: no es un modelo final pulido, sino un checkpoint experimental dentro de una serie de pruebas.
- Sin benchmarks publicados: no hay métricas objetivas de calidad, razonamiento, código o multilingüismo.
- Sin información sobre sesgos: no se documentan sesgos conocidos ni evaluación de sesgos.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no ha sido evaluado en la información disponible.
- Contexto limitado a 8192 tokens: no soporta secuencias más largas.
- Requiere `trust_remote_code=True`: implica ejecutar código personalizado del repositorio, con el riesgo de seguridad asociado.
- Tamaño de 271M: capacidad limitada en comparación con modelos más grandes, especialmente en tareas complejas de razonamiento.
- Sin cuantizaciones oficiales: el despliegue eficiente requiere trabajo adicional de conversión o cuantización.
- Attention dropout de 0.8: es un valor inusualmente alto; aunque en evaluación se desactiva con `model.eval()`, puede afectar a las características aprendidas.
- Idiomas no documentados: no se puede garantizar un rendimiento adecuado en castellano u otros idiomas.

## Enlaces
- https://huggingface.co/adpretko/celerity-271m-8k-tema-ablation-ad0p8-tema4
- https://huggingface.co/adpretko/celerity-271m-8k-ad0p4
- https://huggingface.co/adpretko/celerity-271m-8k-residual-dropout-0p4
- https://huggingface.co/adpretko/celerity-271m-8k-residual-dropout-0p2
- https://huggingface.co/adpretko/celerity-906m-8k-ad0p1
- https://huggingface.co/adpretko/celerity-504m-16k-ad0p8-ild
