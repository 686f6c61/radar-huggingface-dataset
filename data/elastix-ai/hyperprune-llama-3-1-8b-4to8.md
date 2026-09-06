# elastix-ai/HyperPrune-Llama-3.1-8B-4to8

## Resumen

HyperPrune-Llama-3.1-8B-4to8 es un modelo de lenguaje generativo de 8.030 millones de parámetros, obtenido al podar el modelo base meta-llama/Llama-3.1-8B con una sparsity semi-estructurada 4:8 mediante el método HyperPrune. Lo ha desarrollado Elastix como una reproducción dentro del proyecto BLADE, una comparativa de métodos de poda para modelos de lenguaje. El objetivo es reducir el coste computacional de la inferencia manteniendo un rendimiento aceptable, aprovechando que la sparsity 4:8 es compatible con kernels acelerados por hardware en GPUs modernas.

A diferencia de la receta original del paper, este checkpoint poda todas las capas decoder (sparsity global 0.5009) y utiliza el corpus de validación de DKYoon/SlimPajama-6B para la calibración. La arquitectura es un transformer decoder-only estándar de Llama-3.1, sin cambios estructurales; la poda se aplica a las proyecciones de atención y MLP. El modelo se distribuye como safetensors en bf16/fp16 y carga sin modificaciones con transformers.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3.1-8B podado) |
| Parámetros totales | 8.030.261.248 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16/fp16 (pesos sparse, sin cuantizacion adicional) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors |
| Modelo base | meta-llama/Llama-3.1-8B |
| Tamaño del repo | 16.1 GB |

## Arquitectura y entrenamiento

La arquitectura es la de Llama-3.1-8B: un transformer decoder-only con 32 capas, todas ellas podadas en este checkpoint. El modelo no introduce cambios estructurales; la poda se aplica a las matrices de proyección de atención y MLP mediante una sparsity 4:8 semi-estructurada, es decir, en cada grupo de 8 pesos consecutivos se conservan exactamente 4.

El entrenamiento sigue la receta de HyperPrune, con dos etapas: una etapa supervisada de 12.000 pasos con tasa de aprendizaje 0.001 y un fine-tuning en cascada con tasa 0.0003, 4 muestras y 400 filas por paso. El corpus de calibración es la partición de validación de DKYoon/SlimPajama-6B, con 128 muestras de 2048 tokens. El método utiliza una hiperred MLP (hidden_dim 256, emb_dim 64) que genera las máscaras de poda, combinada con un prior de SparseGPT y compensación de pesos. En este checkpoint, la hiperred solo decide las primeras 200 filas de salida de cada proyección; el resto de las filas mantiene la máscara del prior.

La innovación técnica destacable es la generalización de 2:4 a 4:8, ya que HyperPrune solo soporta 2:4 de serie. El parche N:M de ElastiX valida que la implementación generalizada produce resultados bit-idénticos en 2:4 y permite 70 patrones por grupo en 4:8. El entrenamiento completo tardó 20.4 minutos en una NVIDIA RTX PRO 6000 Blackwell, con un pico de VRAM de 10.88 GB.

## Capacidades

- Generacion de texto: el modelo genera texto en el mismo formato que Llama-3.1-8B, pero no se han publicado evaluaciones de tareas específicas en este checkpoint.
- Razonamiento y matematicas: no se han publicado benchmarks de MMLU, GSM8K ni similares; el rendimiento en estas tareas es desconocido.
- Codigo: no se han publicado resultados de HumanEval ni de otras pruebas de programación.
- Tool calling / function calling: no documentado en la ficha.
- Agentes y multi-step reasoning: no documentado.
- Capacidades multilingues: no disponible.
- Capacidad especial: sparsity 4:8 semi-estructurada, pensada para aceleración por hardware y reducción de coste computacional. El modelo se puede cargar con transformers estándar.

## Casos de uso

- Inferencia en entornos con recursos limitados: gracias a la sparsity 4:8, el modelo reduce el coste computacional por token en comparación con el modelo denso, lo que permite ejecutar un modelo de 8B en GPUs de gama media con mayor throughput. Se podría desplegar con vLLM en una RTX 4090 para servir aplicaciones de chat internas.
- Investigacion en compresion de modelos: este checkpoint sirve como referencia para comparar métodos de poda dentro del proyecto BLADE. Los investigadores pueden reproducir las métricas de PPL y analizar el efecto de la sparsity 4:8 frente a 2:4 o a otros métodos como SparseGPT.
- Fine-tuning posterior para dominios especificos: aunque el modelo está podado, se puede fine-tunear con datos propios para adaptarlo a una tarea concreta, como clasificación de documentos o extracción de información. La poda reduce el coste de entrenamiento y de inferencia.
- Evaluacion de kernels de sparsity en hardware: el modelo permite probar kernels 4:8 en GPUs compatibles (A100, H100, RTX 40) y medir la aceleración real frente al modelo denso. Es útil para equipos de sistemas que desarrollan optimizaciones.
- Asistentes de texto para soporte interno: un modelo de 8B con sparsity 4:8 puede gestionar consultas de documentación o resúmenes de informes en una GPU de 24 GB, reduciendo el coste por consulta frente a modelos más grandes.
- Educacion y experimentacion con poda: el modelo es un ejemplo práctico de cómo aplicar sparsity semi-estructurada a un LLM, útil para cursos o talleres sobre eficiencia en modelos de lenguaje. Se puede cargar con transformers y comparar la calidad de salida con el modelo denso.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| WikiText-2 token PPL (seqlen 2048, HyperPrune eval_ppl.py) | 11.827 |
| WikiText-2 word PPL (lm-eval-harness, protocolo BLADE, max_length 2048) | 16.39 |
| Sparsity global (check_sparsity) | 0.5009 |
| Tiempo de entrenamiento | 20.4 min |
| Pico de VRAM durante cascade FT | 10.88 GB |
| Word PPL del mismo modelo en 2:4 | 22.27 |

Nota: las dos PPL son cantidades distintas y no comparables entre sí. La primera es token-level sobre WikiText-2 concatenado; la segunda es word_perplexity de lm-evaluation-harness.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en bf16 requiere aproximadamente 16 GB de VRAM (8.030M parámetros × 2 bytes). La sparsity no reduce el almacenamiento en este formato, por lo que el requisito es similar al del modelo denso. No se han publicado cuantizaciones adicionales.
- GPU recomendadas: para inferencia, una RTX 4090 (24 GB) o A100 40 GB son suficientes. El entrenamiento se realizó en una NVIDIA RTX PRO 6000 Blackwell (97 GB), con un pico de 10.88 GB.
- Compatibilidad con consumer GPU: sí, cabe en una RTX 4090 de 24 GB con margen para el contexto.
- Opciones de despliegue: vLLM, TGI y transformers (por ser safetensors estándar). Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Sparsity | Parámetros | Word PPL (WikiText-2, BLADE) | Licencia |
|---|---|---|---|---|
| HyperPrune-Llama-3.1-8B-4to8 | 4:8 | 8.030M | 16.39 | other |
| HyperPrune-Llama-3.1-8B-2to4 | 2:4 | 8.030M | 22.27 | other |
| Llama-3.1-8B denso | - | 8.030M | no disponible | Llama Community License |

Nota: el modelo 2:4 es la versión publicada por el mismo autor en HuggingFace. El denso no tiene datos en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. El modelo hereda los sesgos del corpus de entrenamiento de Llama-3.1 y de SlimPajama.
- Riesgo de alucinacion: al ser un modelo podado, la calidad de generación puede degradarse, aumentando el riesgo de respuestas incorrectas.
- Limitaciones de contexto o idioma: la longitud de contexto no está documentada en la ficha; los idiomas soportados tampoco.
- Restricciones de licencia: la licencia es "other", lo que exige revisar los términos. El modelo base está sujeto a la Llama Community License, que impone condiciones para uso comercial y distribución.
- La sparsity 4:8 es una extensión no oficial de HyperPrune; puede haber incompatibilidades con herramientas que esperan 2:4.
- Solo las primeras 200 filas de salida de cada proyección fueron decididas por la hiperred; el resto mantiene el prior de SparseGPT. Esto limita la influencia del método HyperPrune en el resultado final.
- No se han publicado benchmarks de tareas como MMLU, HumanEval o GSM8K, por lo que el rendimiento en razonamiento, código o matemáticas es desconocido.
- Los pesos se distribuyen en bf16/fp16 sin cuantización, por lo que el ahorro de memoria es limitado; la sparsity solo reduce el cómputo si se usan kernels adecuados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/elastix-ai/HyperPrune-Llama-3.1-8B-4to8
- Versión 2:4: https://huggingface.co/elastix-ai/HyperPrune-Llama-3.1-8B-2to4
- Repositorio de HyperPrune: https://github.com/futuresun912/HyperPrune
- Paper en OpenReview: https://openreview.net/forum?id=lqjQs2lVNm
