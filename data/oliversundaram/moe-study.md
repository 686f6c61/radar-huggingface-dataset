# OliverSundaram/MoE-Study

## Resumen

MoE-Study es un proyecto de investigacion del autor OliverSundaram que compara de forma controlada una arquitectura densa frente a una arquitectura de mezcla de expertos (Mixture-of-Experts, MoE) con parametros activos igualados. El repositorio de HuggingFace contiene dos checkpoints entrenados desde cero bajo condiciones identicas, salvo por el bloque feed-forward: un MLP denso de 150,1 millones de parametros y un MoE top-2-de-4 de 206,8 millones de parametros totales, de los cuales aproximadamente 150,1 millones se activan por token. Ambos modelos comparten la misma arquitectura base de transformer decoder-only con 12 capas, dimension de embedding de 768 y contexto de 1024 tokens.

El objetivo del estudio es responder una pregunta concreta: con el mismo coste computacional por token y el mismo presupuesto, la esparsidad ayuda o perjudica al rendimiento. Los resultados obtenidos son claros: el modelo denso supera al MoE en todas las metricas evaluadas, con una perplejidad en WikiText de 551 frente a 1.378 y una perdida de test de 5,063 frente a 5,911. Ambos modelos estan entrenados durante una sola epoca sobre aproximadamente 40,67 millones de tokens, por lo que no estan convergidos y no son aptos para ningun uso practico. La relevancia del proyecto reside en su valor como estudio de ablacion reproducible para la comunidad de investigacion en arquitecturas eficientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer custom, con variantes Dense FFN y Top-2-of-4 MoE |
| Parametros totales | Dense: 150,1M; MoE: 206,8M |
| Parametros activos | Dense: 150,1M; MoE: ~150,1M (2 de 4 expertos activos) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (no confirmado en la model card; el repo es de 4,3 GB con subcarpetas `dense/` y `moe/`) |

## Arquitectura y entrenamiento

Ambos modelos comparten una misma arquitectura base de transformer decoder-only con 12 capas, 12 cabezas de atencion, dimension de embedding de 768, vocabulario de 50.257 tokens (tokenizer GPT-2 sin modificar) y atencion Multi-Query, con una proyeccion K/V compartida entre todas las cabezas. La normalizacion es un pre-norm personalizado con escala y desplazamiento aprendidos, las posiciones usan embeddings absolutos aprendidos y no hay weight tying entre la capa de embedding de entrada y la cabeza de salida.

La unica diferencia entre los dos checkpoints esta en el bloque feed-forward. El modelo denso utiliza un MLP de dos capas con activacion GELU y dimension oculta de 3.072. El modelo MoE emplea 4 expertos con top-2 routing, cada uno con dimension oculta de 1.536, un router lineal con softmax y renormalizacion, y una perdida auxiliar de balanceo de carga sumada sobre las 12 capas. Al activar 2 de 4 expertos a la mitad de la dimension oculta, el coste computacional por token es identico al del modelo denso por construccion; el MoE solo gasta mas memoria para almacenar los parametros adicionales.

El entrenamiento fue identico para ambos modelos: una sola epoca sobre el dataset `nampdn-ai/tiny-textbooks`, con 39.717 chunks de 1.024 tokens (aproximadamente 40,67 millones de tokens en total), 19.858 pasos, batch efectivo de 8 (2 con acumulacion de gradientes de 4), optimizador AdamW con tasa de aprendizaje 3e-4 y weight decay 0,1, programacion OneCycleLR con coseno y 3% de warmup, grad clipping con max-norm 1,0 y precision mixta AMP. El entrenamiento se realizo en una unica RTX 4060 de 8 GB, con un tiempo total de aproximadamente 44,6 minutos para el modelo denso y 59,8 minutos para el MoE. No se aplico RLHF ni ajuste por instrucciones.

## Capacidades

- Generacion de texto autoregresiva basica, aunque con calidad limitada por el entrenamiento de una sola epoca con pocos tokens.
- Razonamiento, codigo, matematicas o cualquier tarea avanzada: no disponible, ambos modelos estan por debajo del umbral util en todos los benchmarks evaluados.
- Tool calling / function calling: no soportado.
- Soporte de agentes o multi-step reasoning: no disponible.
- Capacidades multilingues: no disponibles; el vocabulario es el del tokenizer GPT-2, entrenado principalmente con texto ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Capacidad de estudio de ablacion: el modelo permite comparar directamente el impacto de la sparsity en la arquitectura FFN bajo condiciones controladas, que es su unica utilidad real.

## Casos de uso

- Estudio de ablacion en arquitecturas MoE: el modelo permite comparar de forma controlada un bloque denso frente a un MoE top-2-de-4 con el mismo coste por token, aislando la variable de la sparsity en el rendimiento final.
- Validacion de hipotesis sobre eficiencia de parametros: los resultados muestran que, con parametros activos igualados, el modelo denso supera al MoE, lo que sirve como referencia para investigaciones sobre cuando la sparsity es beneficiosa.
- Reproduccion de experimentos de investigacion: el repositorio incluye codigo de entrenamiento y evaluacion, permitiendo replicar el estudio con otros datasets, tamaños o configuraciones de expertos.
- Desarrollo de nuevas arquitecturas de routing: los pesos del router y la perdida auxiliar de balanceo de carga pueden analizarse para estudiar el comportamiento de la seleccion de expertos en modelos pequenos.
- Benchmark de eficiencia computacional: permite medir el throughput y el uso de memoria de un MoE top-2-de-4 frente a un denso con parametros activos igualados en hardware consumer.
- Educacion y formacion en arquitecturas eficientes: como modelo de pequeno tamano, es un recurso didactico para ensenar el funcionamiento interno de los MoE y sus diferencias con los modelos densos.
- Evaluacion de metricas de calidad en modelos poco entrenados: sirve para analizar el comportamiento de metricas como perplexity y LAMBADA en modelos no convergidos, util para metodologias de evaluacion temprana.

## Benchmarks y rendimiento

Los resultados de evaluacion se obtuvieron con lm-evaluation-harness sobre los checkpoints finales:

| Benchmark | Shots | Metric | Dense | MoE | abs(Δ) | Ganador |
|---|---|---|---|---|---|---|
| WikiText | no disponible | Word perplexity | 551 | 1.378 | 827 | Dense |
| LAMBADA | no disponible | Accuracy | 0.0% | 0.0% | 0 | Empate (suelo de la tarea) |

Ademas, las perdidas finales son:

| Perdida | Dense | MoE |
|---|---|---|
| Train loss (ultimo paso) | 5.166 | 5.936 |
| Test loss (pure LM) | 5.063 | 5.911 |
| Test loss (+ aux sin escala) | no aplica | 17.91 |

El modelo denso tiene una perdida menor en todos los checkpoints. No hay resultados de benchmarks adicionales en la informacion disponible. Ambos modelos estan en el suelo de la tarea en LAMBADA, lo que confirma que no son modelos utiles.

## Requisitos de hardware

- VRAM estimada para inferencia: los modelos tienen entre 150 y 207 millones de parametros, por lo que caben en cualquier GPU consumer con 4 GB o mas de VRAM en precision fp32, y en mucho menos con cuantizacion.
- GPU recomendadas: cualquier GPU moderna de NVIDIA con 4-8 GB de VRAM, como la RTX 3060, RTX 4060 o superiores. El entrenamiento se realizo en una RTX 4060 de 8 GB.
- Compatibilidad con consumer GPU: si, tanto para inferencia como para entrenamiento, como demuestra el propio autor.
- Opciones de despliegue: no disponible de forma directa con vLLM, llama.cpp u Ollama, ya que la arquitectura es personalizada y no esta incluida en esas herramientas. Se requiere el codigo del repositorio de GitHub para construir el modelo y cargar los pesos.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No se ha encontrado en la informacion disponible una comparativa con otros modelos de la misma categoria (modelos de tamano similar entrenados desde cero con arquitecturas densas vs MoE). El propio estudio sirve como comparacion interna:

| Aspecto | Dense (150.1M) | MoE (206.8M total, ~150.1M activos) |
|---|---|---|
| Parametros activos por token | 150.1M | ~150.1M |
| Parametros totales | 150.1M | 206.8M |
| Perdida de test | 5.063 | 5.911 |
| Perplexity WikiText | 551 | 1.378 |
| LAMBADA | 0.0% | 0.0% |
| Coste de entrenamiento | 44.6 min | 59.8 min |

No se dispone de informacion sobre modelos de la misma categoria de tamano y proposito para una comparativa externa.

## Limitaciones y advertencias

- Ambos modelos estan entrenados con una sola epoca sobre aproximadamente 40,67 millones de tokens, muy lejos de la convergencia. Las generaciones son en gran parte incoherentes.
- La perplejidad de WikiText es de 551 (denso) y 1.378 (MoE), y el rendimiento en LAMBADA es del 0,0% en ambos, en el suelo de la tarea.
- No se ha realizado ajuste por instrucciones, RLHF ni filtrado de seguridad de ningun tipo. Los modelos pueden generar contenido no deseado o sesgado.
- La arquitectura es personalizada y no es una variante de un modelo existente. El codigo de modelado no se incluye en el repositorio de HuggingFace, por lo que `from_pretrained` sobre este repo no construira el modelo sin el codigo del repositorio de GitHub.
- No son aptos para ningun uso downstream o de produccion. Son artefactos de investigacion.
- El modelo esta entrenado solo con datos en ingles (dataset tiny-textbooks).
- El estudio concluye que la sparsity no ayuda en este regimen de entrenamiento, lo que no debe generalizarse a modelos grandes sin evidencia adicional.
- La licencia MIT permite uso comercial, pero dado el estado del modelo, su uso comercial no tiene sentido practico.
- No se han publicado cuantizaciones oficiales ni soporte para herramientas de inferencia estandar como vLLM, llama.cpp u Ollama.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/OliverSundaram/MoE-Study
- Repositorio de GitHub (codigo de entrenamiento, definicion del modelo y evaluacion): https://github.com/OliverSundaram/MoE-Study
- Dataset de entrenamiento: https://huggingface.co/datasets/nampdn-ai/tiny-textbooks
- Herramienta de evaluacion: https://github.com/EleutherAI/lm-evaluation-harness
