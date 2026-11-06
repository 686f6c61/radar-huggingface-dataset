# jy395/Meta-Llama-3.1-8B-Instruct-wanda-4of8-c3

## Resumen

Meta-Llama-3.1-8B-Instruct-wanda-4of8-c3 es una versión comprimida del modelo meta-llama/Meta-Llama-3.1-8B-Instruct, publicada por el usuario jy395 (Junyi Ye y colaboradores) como parte de la colección de 30 configuraciones comprimidas asociadas al artículo «Damage Predicts Recovery: When Calibration Data Matters in Compressing Financial LLMs» (ICAIF '26). La compresión aplicada es una poda semiestructurada Wanda 4:8, es decir, se conservan 4 de cada 8 pesos por bloque (50 % de sparsity) manteniendo los pesos almacenados en formato denso. El checkpoint se ha calibrado sobre el corpus C3-FinMix, compuesto por 2.042 prompts financieros formateados como tareas.

El modelo hereda la arquitectura y capacidades del Llama 3.1 8B Instruct original, pero con una reducción teórica del 50 % en los pesos de las capas lineales afectadas por la poda. Su interés radica en el estudio de cuándo la calibración con datos de dominio (en este caso, financiero) es necesaria para preservar el rendimiento tras la compresión, y en ofrecer una alternativa más ligera para despliegues de inferencia en el sector financiero sin salir del ecosistema Llama 3.1.

El checkpoint se distribuye en formato compressed-tensors, cargable directamente en vLLM y en transformers, y mantiene la licencia Llama 3.1 Community License. No se han publicado resultados de benchmarks en la información disponible, por lo que las cifras de rendimiento deben consultarse en el artículo asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), con poda semiestructurada Wanda 4:8 en capas lineales |
| Parametros totales | 8.030.261.248 (pesos almacenados en denso; 50 % de sparsity efectiva en las capas podadas) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 8B Instruct soporta 128.000 tokens) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en compressed-tensors con poda 4:8, no cuantizado a baja precision) |
| Idiomas soportados | no disponible en la informacion proporcionada (el modelo base soporta 8 idiomas oficiales: ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors en formato compressed-tensors (poda 4:8, pesos densos) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Llama 3.1 8B Instruct: un transformer decoder-only con 32 capas, atención con RoPE y GQA (Grouped Query Attention), y aproximadamente 8.000 millones de parámetros. Sobre esta base se aplica una poda semiestructurada Wanda 4:8 mediante la herramienta llm-compressor del proyecto vLLM. La poda Wanda selecciona qué pesos eliminar combinando la magnitud del peso con la magnitud de las activaciones de entrada, calculadas sobre un corpus de calibración; el patrón 4:8 implica que en cada grupo de 8 pesos se conservan los 4 de mayor importancia relativa, lo que da una sparsity del 50 % compatible con aceleración en hardware que soporte sparse tensor cores. Los pesos se almacenan en formato denso (no disperso), de modo que el checkpoint ocupa el mismo espacio que el original pero las operaciones pueden beneficiarse de kernels específicos.

La calibración se realizó sobre el corpus C3-FinMix: 2.042 prompts financieros formateados como tareas, con aproximadamente 260.000 tokens, construidos a partir de los splits de entrenamiento y validación de diez benchmarks financieros (nunca de test), con semilla 42 y `max_seq_length=2048`, consumiendo el corpus completo. No se indica en la información disponible si hubo un proceso adicional de RLHF o DPO más allá del que ya incorpora el modelo base. La innovación principal del trabajo asociado es el estudio de la relación entre el daño causado por la compresión y la recuperación posterior, y en qué condiciones la calibración con datos del dominio financiero es imprescindible frente a calibración genérica.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Llama 3.1 8B Instruct.
- Generación de código y resolución de problemas matemáticos, con el rendimiento del modelo base degradado potencialmente por la poda (no se publican métricas específicas).
- Soporte de tool calling y function calling, siempre que el formato de plantilla del modelo base se conserve (no se indica explícitamente en la model card, pero es una capacidad del modelo original).
- Capacidad de razonamiento multi-paso y uso en pipelines de agentes, sujeta a la degradación introducida por la compresión.
- Capacidades multilingües: no se especifican en la información disponible; se heredan del modelo base (8 idiomas oficiales de Llama 3.1).
- Especialización en dominio financiero por la calibración con C3-FinMix, aunque no se trata de un fine-tuning sino de una calibración para la poda.
- No se menciona soporte de visión, audio ni modo «thinking» explícito.

## Casos de uso

- Análisis de documentos financieros: el modelo puede procesar informes, filings o transcripciones de resultados y extraer métricas clave, aprovechando la calibración con prompts financieros del corpus C3-FinMix.
- Asistencia en tareas de question answering sobre dominios financieros: respuesta a preguntas sobre productos, regulación o datos de mercado, con un coste de inferencia menor que el modelo base gracias a la poda 4:8.
- Generación de resúmenes de noticias económicas: síntesis de artículos y comunicados con contexto medio, adecuado para boletines automatizados.
- Clasificación y extracción de entidades en textos financieros: identificación de entidades, importes y fechas en informes, con un modelo de 8B que cabe en GPUs de gama alta consumer.
- Prototipado de asistentes conversacionales para banca o fintech: despliegue en vLLM con el formato compressed-tensors, sin necesidad de conversión adicional.
- Evaluación comparativa de técnicas de compresión: uso como checkpoint de referencia en experimentos de poda y calibración, junto con las otras 29 configuraciones de la colección.
- Inferencia en entornos con restricciones de memoria: al mantener los pesos en formato denso pero con kernels de poda, puede desplegarse en GPUs con 24 GB (por ejemplo, RTX 4090) en precisión nativa o con cuantización adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artículo asociado (ICAIF '26) evalúa diez tareas financieras, pero las cifras concretas no se incluyen en la model card ni en la información proporcionada. Para datos de rendimiento debe consultarse el artículo y el repositorio de evaluación enlazados.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (BF16/FP16): aproximadamente 16 GB para los pesos, más overhead de activaciones y KV cache; en la práctica, 20-24 GB para contextos moderados.
- VRAM estimada con cuantización adicional a 8 bits (no incluida en el checkpoint): aproximadamente 8-9 GB de pesos.
- VRAM estimada con cuantización a 4 bits (no incluida en el checkpoint): aproximadamente 5-6 GB de pesos.
- GPU recomendadas: A100 40 GB, H100 80 GB para producción con contexto largo; L40S o RTX 6000 Ada para despliegues de 48 GB; RTX 4090 (24 GB) para inferencia en precisión nativa con contexto moderado.
- Cabe en GPU consumer: sí, en RTX 4090 (24 GB) y potencialmente en RTX 3090 (24 GB); en GPUs de 16 GB requeriría cuantización adicional.
- Opciones de despliegue: vLLM (soporte nativo de compressed-tensors), transformers con `AutoModelForCausalLM`, y potencialmente TGI si soporta el formato compressed-tensors (no confirmado en la información disponible). llama.cpp y Ollama requerirían conversión a GGUF, no documentada.
- Latencia y throughput estimados: no disponibles en la información proporcionada. La poda 4:8 puede ofrecer aceleración en hardware con soporte de sparse tensor cores (por ejemplo, A100/H100), pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| jy395/Meta-Llama-3.1-8B-Instruct-wanda-4of8-c3 | 8,03 B (50 % sparsity en capas podadas) | no disponible | Llama 3.1 Community | safetensors compressed-tensors | Poda Wanda 4:8 calibrada en dominio financiero |
| meta-llama/Meta-Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | Llama 3.1 Community | safetensors | Modelo base sin comprimir |
| Otras configuraciones de la coleccion ICAIF '26 (jy395) | 8,03 B | no disponible | Llama 3.1 Community | safetensors compressed-tensors | Diferentes tecnicas de compresion (cuantizacion, poda) y corpus de calibracion |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La poda 4:8 introduce degradación de calidad respecto al modelo base; la magnitud de esta degradación no se cuantifica en la información disponible.
- Riesgo de alucinación inherente al modelo base, potencialmente incrementado por la compresión, especialmente en tareas financieras donde la precisión factual es crítica.
- La calibración se realizó exclusivamente con datos financieros (C3-FinMix), lo que puede sesgar el comportamiento hacia ese dominio y afectar al rendimiento en tareas generales.
- No se especifican los idiomas soportados en la model card; se asume la herencia del modelo base, pero no está verificado.
- La licencia Llama 3.1 Community License impone restricciones de uso comercial (cláusula de 700 millones de usuarios mensuales, atribución «Built with Llama», etc.) que deben revisarse antes de un despliegue en producción.
- El checkpoint se distribuye en formato compressed-tensors; no se proporcionan conversiones a GGUF ni a otros formatos, lo que limita las opciones de despliegue en herramientas como llama.cpp u Ollama.
- No se han publicado evaluaciones independientes de sesgos, robustez ni seguridad para esta variante comprimida.
- El repositorio tiene un tamaño de 32,1 GB, coherente con pesos densos en BF16; no se ofrece una versión cuantizada que reduzca el espacio en disco.
- Fecha de creación indicada como 2026-10-31, lo que sugiere que el modelo se publica junto con el artículo de ICAIF '26; verificar la vigencia de los enlaces y del artículo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jy395/Meta-Llama-3.1-8B-Instruct-wanda-4of8-c3
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct
- Colección completa (Financial LLM Compression & Calibration, ICAIF 2026): https://huggingface.co/collections/jy395/financial-llm-compression-and-calibration-icaif-2026-6ae60c49d2f87e2ae7269058
- Repositorio de código y datos: https://github.com/JunyiYe/finance-ptc-calibration
- Script de poda Wanda 4:8: https://github.com/JunyiYe/finance-ptc-calibration/blob/main/scripts/quantization/wanda_4of8.py
- Suite de evaluación: https://github.com/JunyiYe/finance-ptc-calibration/tree/main/scripts/evaluation
- Artículo (DOI): https://doi.org/10.1145/3858063.3858724
- Herramienta llm-compressor: https://github.com/vllm-project/llm-compressor
- Licencia Llama 3.1: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/LICENSE.md
