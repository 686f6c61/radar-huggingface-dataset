# foss22/NanoZaya-3B-A35M

## Resumen

NanoZaya-3B-A35M es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por foss22, derivado del modelo Zyphra/ZAYA1-8B. Su característica principal es una arquitectura extremadamente orientada a MoE: el 99,2 % de los parámetros residen en los expertos, con un routing top-1 entre 64 expertos, lo que resulta en solo ~35 millones de parámetros activos por token. Esto permite que un modelo de aproximadamente 3 000 millones de parámetros totales se ejecute en hardware antiguo, concretamente en GPUs Pascal sin núcleos tensor, con un consumo de memoria de unos 10 GB.

El modelo está diseñado para ser ejecutado en hardware vintage (GTX 10xx y similares), donde los núcleos tensor no están disponibles. El autor ha realizado una búsqueda de configuraciones óptimas mediante un script de Pareto, seleccionando una configuración con 12 capas, dimensión 1024, 64 expertos y 4 cabezas de atención. El entrenamiento se realizó con un corpus propio de 239 millones de tokens, una cantidad muy inferior a la recomendada por Chinchilla para modelos densos, aunque el autor argumenta que para MoE la relación de tokens debe aplicarse a los parámetros activos.

La relevancia actual de este modelo radica en su propuesta de ejecutar modelos de 3B en GPUs antiguas con poca VRAM, lo que podría democratizar el acceso a LLMs en hardware de bajo coste. Sin embargo, la falta de benchmarks públicos y el corpus de entrenamiento reducido limitan su utilidad práctica en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con routing top-1, 64 expertos, 12 capas, dim 1024, 4 cabezas de atencion |
| Parametros totales | 3007 millones (~3B) |
| Parametros activos | ~35 millones (top-1 de 64) |
| Longitud de contexto | no disponible (secuencia de entrenamiento de 256 tokens) |
| Tipos de cuantizacion | INT8 (mencionado en el entrenamiento, aunque no se convirtieron lineales de expertos) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

NanoZaya-3B-A35M es un modelo MoE con 64 expertos y routing top-1, lo que significa que para cada token solo se activa un experto. La configuración seleccionada tras la búsqueda de Pareto es: dim=1024, 12 capas, 64 expertos, 4 cabezas de atención, secuencia de 256 tokens y batch de 6. El modelo tiene 3007,9 millones de parámetros totales, de los cuales aproximadamente 35 millones son activos por token. Esta proporción extrema (99,2 % de parámetros en expertos) busca maximizar la capacidad de almacenamiento de conocimiento en los expertos mientras se minimiza el coste computacional por token.

El entrenamiento se realizó durante 50 000 pasos con precisión fp16, optimizador AdamW8bit y una opción INT8 que, según el log, no convirtió ningún lineal de experto (0 expert linears convertidos). El corpus de entrenamiento consta de 239 millones de tokens (aproximadamente 600 millones de palabras), una cantidad muy inferior a la recomendación de Chinchilla para modelos densos (60B tokens para 3B), aunque el autor justifica que para MoE la relación debe aplicarse a los parámetros activos (~700M tokens recomendados). El modelo se entrenó desde cero, no como un fine-tuning de ZAYA1-8B, aunque la model card indica que ZAYA1-8B es el modelo base.

No se menciona el uso de RLHF, DPO ni otras técnicas de alineación. Tampoco se detalla la composición del dataset de entrenamiento.

## Capacidades

No se dispone de información detallada sobre las capacidades específicas del modelo. Basándose en la arquitectura y el entrenamiento, se puede inferir:

- Generación de texto: al ser un modelo de lenguaje autoregresivo, puede generar texto, aunque la calidad no está verificada.
- Razonamiento y conocimiento: la capacidad de almacenar conocimiento en los expertos podría permitir cierta memoria factual, pero el corpus reducido limita su cobertura.
- No se documenta soporte para tool calling, function calling, agentes, visión, audio ni modos de pensamiento.
- No se especifican capacidades multilingües; el corpus de entrenamiento no está descrito.

## Casos de uso

No se han documentado casos de uso específicos por parte del autor. Dadas sus características, los usos potenciales serían:

- Inferencia en hardware antiguo: el modelo está optimizado para GPUs Pascal sin núcleos tensor, por lo que puede ejecutarse en tarjetas como GTX 1060, 1070 o 1080 con 8-12 GB de VRAM. Esto permite experimentar con LLMs en equipos que no soportan modelos densos de 3B.
- Prototipado y experimentación: investigadores o aficionados con hardware limitado pueden probar arquitecturas MoE y evaluar el comportamiento de un modelo con muchos parámetros pero pocos activos.
- Educación: sirve como ejemplo práctico de cómo la esparsidad de expertos reduce los requisitos de cómputo, útil para cursos de arquitecturas de LLMs.
- Embeddings o extracción de características: las representaciones internas de un modelo MoE podrían utilizarse para tareas de clasificación o recuperación, aunque no hay evidencia de su calidad.
- Generación de texto en entornos con restricciones de memoria: si la calidad es aceptable, podría usarse para tareas simples de autocompletado o generación de borradores en equipos sin GPU moderna.
- Investigación sobre escalado de MoE: el modelo puede servir como banco de pruebas para estudiar el equilibrio entre parámetros totales y activos en tareas específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye la pérdida de entrenamiento (loss=4.6063) y el rendimiento en tokens por segundo (1529 tps en la configuración seleccionada), pero no hay métricas como MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: entre 9,7 y 10,1 GB según las configuraciones evaluadas en el log de entrenamiento.
- GPU recomendadas: tarjetas Pascal sin núcleos tensor, como GTX 1060 6GB (no suficiente), GTX 1070 8GB (justo), GTX 1080 8GB, GTX 1080 Ti 11GB, o superiores. También puede ejecutarse en GPUs más modernas, pero el diseño está orientado a hardware antiguo.
- En consumer GPU: cabe en tarjetas con 10-12 GB de VRAM, como RTX 3080, RTX 4080, etc., pero el objetivo es que funcione en GPUs Pascal.
- Opciones de despliegue: no se mencionan frameworks específicos. Dado el formato de pesos no confirmado, podría usarse con llama.cpp, vLLM u otros, pero no hay documentación al respecto.
- Latencia y throughput: el log reporta 1529 tokens por segundo en la configuración seleccionada (dim=1024, lay=12, exp=64, int8=True) con batch de 6 y secuencia de 256. Este valor es orientativo y depende del hardware concreto.

## Comparativa con modelos similares

No se dispone de datos suficientes para realizar una comparativa rigurosa. El modelo base Zyphra/ZAYA1-8B tiene 8B parámetros, pero no se conocen sus especificaciones exactas ni su rendimiento. No hay información sobre otros modelos MoE de tamaño similar (por ejemplo, Mixtral 8x7B tiene 47B totales y 13B activos, pero es mucho más grande). Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Entrenamiento con corpus muy reducido: 239M tokens es una cantidad extremadamente baja para un modelo de 3B, incluso considerando la justificación MoE. Esto probablemente conlleva un underfitting severo y una calidad de generación pobre en comparación con modelos entrenados con cientos de miles de millones de tokens.
- Sin benchmarks publicados: no hay evidencia objetiva de la calidad del modelo en tareas estándar. No se puede recomendar para uso en producción sin una evaluación previa.
- Longitud de contexto limitada: la secuencia de entrenamiento es de 256 tokens, lo que sugiere que el modelo no maneja bien contextos largos. No se especifica el contexto máximo soportado.
- Sin información sobre sesgos o alucinaciones: al no haber evaluaciones, se desconoce el comportamiento en estos aspectos.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no está verificado y podría contener errores o comportamientos indeseados.
- Formato de pesos no documentado: no se indica si los pesos están en safetensors, GGUF u otro formato, lo que dificulta su integración en frameworks estándar.
- El autor no proporciona instrucciones de uso ni ejemplos de inferencia, lo que añade fricción para los usuarios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/foss22/NanoZaya-3B-A35M
- Modelo base Zyphra/ZAYA1-8B: https://huggingface.co/Zyphra/ZAYA1-8B (referenciado en la model card, no verificado)
