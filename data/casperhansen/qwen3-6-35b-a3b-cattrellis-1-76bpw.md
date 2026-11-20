# casperhansen/Qwen3.6-35B-A3B-CatTrellis-1.76bpw

## Resumen

Qwen3.6-35B-A3B-CatTrellis-1.76bpw es una versión cuantizada del modelo Qwen/Qwen3.6-35B-A3B, publicada por el desarrollador casperhansen. La cuantización se ha realizado con CatTrellis, una herramienta propia del autor que combina códigos trellis con entrenamiento consciente de la cuantización (quantization-aware training) para comprimir el modelo hasta la clase de tamaño de 1,76 bits por peso. El resultado se sirve de forma nativa en vLLM, lo que permite desplegarlo con el mismo stack de inferencia que el modelo original.

El modelo base es un MoE de la familia Qwen3.5, con 35B de parámetros nominales y aproximadamente 3B activos por token, según la nomenclatura A3B. La versión cuantizada ocupa 8,2 GB en el repositorio y declara 8.046.658.784 parámetros en los safetensors, un dato que conviene interpretar con cautela porque el empaquetado trellis altera el recuento nominal respecto al modelo denso original. La licencia es Apache 2.0, heredada del modelo base.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de cuantización extrema (por debajo de 2 bits por peso) aplicada a un MoE de gran tamaño; por otro, advierte de que se trata de una publicación con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni model card detallada más allá de las instrucciones de servicio. Es, por tanto, un artefacto experimental que debe evaluarse con mediciones propias antes de considerarlo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (familia Qwen3.5, tag `qwen3_5_moe`) |
| Parametros totales | 8.046.658.784 declarados en safetensors (modelo base nominal: 35B) |
| Parametros activos | aproximadamente 3B por token (según nomenclatura A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | CatTrellis a 1,76 bits por peso (receta con `budget_bpw = 1.6908`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantización `cattrellis`), servido con vLLM |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer con mezcla de expertos (MoE): de los 35B de parámetros nominales, solo unos 3B se activan por token, lo que reduce el coste computacional de inferencia manteniendo una capacidad de representación alta. La versión aquí documentada no reentrena el modelo desde cero, sino que aplica una cuantización post-entrenamiento con ajuste fino consciente de la cuantización mediante CatTrellis.

CatTrellis es una herramienta del propio autor (casper-hansen) que representa los pesos con códigos trellis y realiza quantization-aware training para adaptar el modelo a esa representación. La receta concreta está publicada en el repositorio de CatTrellis (`examples/qwen36-35b-a3b/quantize_176.py`), con un presupuesto de 1,6908 bits por peso que da lugar a la clase de 1,76 bpw. El commit de referencia de la herramienta es `9cb4d75ff98501443ccf2d7021dcfbfbea332f0e`, y la revisión del modelo base es `345d467b117d1fd5eda9b879a5988de9ae5f47a7`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.6-35B-A3B, aunque la cuantización a 1,76 bpw puede degradarlas de forma no cuantificada en la información disponible.
- Código y matemáticas: el modelo base está orientado a tareas de código y razonamiento matemático; no hay evaluación publicada de esta versión cuantizada.
- Tool calling y function calling: presumiblemente soportado por herencia del modelo base, pero no confirmado en la model card de esta versión.
- Agentes y razonamiento multi-paso: no confirmado explícitamente para esta cuantización.
- Capacidades multilingües: no disponibles; no se declaran idiomas en la ficha de Hugging Face.
- Capacidades especiales (thinking mode, visión, audio): no disponibles para esta versión.

## Casos de uso

- Evaluación de técnicas de cuantización extrema: investigadores que quieran medir la degradación de un MoE de 35B al comprimirlo a 1,76 bpw pueden usar este checkpoint como referencia frente al modelo base en tareas controladas.
- Despliegue en vLLM con requisitos de memoria reducidos: al ocupar 8,2 GB en disco y servirse de forma nativa en vLLM, permite probar el modelo en GPUs con menos VRAM que las necesarias para el modelo original, siempre que se validen las kernels compiladas para la GPU objetivo.
- Prototipado de pipelines de agentes: si se confirma el soporte de tool calling del modelo base, puede integrarse en flujos de razonamiento multi-paso para pruebas de concepto, aceptando la incertidumbre sobre la calidad tras la cuantización.
- Generación de código en entornos de desarrollo: útil para autocompletado y generación de fragmentos en entornos con restricciones de memoria, con validación humana obligatoria por el riesgo de alucinación.
- Investigación sobre representaciones trellis: sirve como caso de estudio de cómo se comporta un MoE grande bajo una representación con códigos trellis y QAT, comparando perplejidad y métricas de tarea con el modelo original.
- Despliegue en clústeres con GPUs de gama media: la reducción de huella permite servir el modelo en nodos con menos memoria, aunque el rendimiento real depende de las kernels compiladas y del soporte de vLLM para esta cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio ocupa 8,2 GB, por lo que la huella de pesos ronda esa cifra, a la que hay que sumar caché KV y overhead de vLLM.
- GPU recomendadas: no disponibles; la model card solo indica que las kernels de servicio se compilan para la GPU en el primer arranque.
- ¿Cabe en GPU de consumo? No confirmado; por tamaño de pesos podría caber en GPUs con 12-16 GB, pero no hay validación publicada.
- Opciones de despliegue: vLLM con el extra `cattrellis[serve]` instalado desde el repositorio de GitHub; no se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-CatTrellis-1.76bpw | 35B nominales, ~3B activos | no disponible | 1,76 bpw CatTrellis | Apache 2.0 | Hugging Face, vLLM |
| Qwen/Qwen3.6-35B-A3B (base) | 35B nominales, ~3B activos | no disponible | BF16/FP16 original | Apache 2.0 | Hugging Face |
| Otras cuantizaciones del mismo base (GGUF, AWQ, GPTQ) | 35B nominales, ~3B activos | no disponible | 4-8 bits típicos | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Cuantización extrema: 1,76 bits por peso es una compresión agresiva; la degradación de calidad respecto al modelo base no está cuantificada en la información disponible.
- Sin benchmarks: no hay métricas publicadas de MMLU, HumanEval, GSM8K ni perplejidad para esta versión.
- Sin descargas ni validación comunitaria: el repositorio tenía cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validación independiente.
- Idiomas no declarados: no se especifica qué idiomas soporta esta versión; no asumir multilingüismo sin probarlo.
- Dependencia de vLLM y de CatTrellis: el servicio requiere instalar la herramienta desde GitHub y compilar kernels para la GPU; no es un despliegue estándar de transformers.
- Riesgo de alucinación: inherente a los modelos generativos y potencialmente amplificado por la cuantización; requiere validación humana en producción.
- Sesgos: no documentados para esta versión; se heredan los del modelo base, que tampoco se detallan aquí.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y de la herramienta CatTrellis por separado.
- Fecha de creación futura en los metadatos (2026-11-20): conviene verificar la procedencia y la integridad del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/casperhansen/Qwen3.6-35B-A3B-CatTrellis-1.76bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio de CatTrellis: https://github.com/casper-hansen/CatTrellis
