# mradermacher/olmoe-base-GGUF

## Resumen

El modelo `mradermacher/olmoe-base-GGUF` es una cuantización en formato GGUF del modelo `ddidacus/olmoe-base`, que a su vez se basa en la arquitectura OLMoE (Open Mixture-of-Experts) desarrollada por el Allen Institute for AI (AI2). OLMoE es un modelo de lenguaje de tipo Mixture of Experts (MoE) con 6.9 mil millones de parámetros totales y solo 1.3 mil millones de parámetros activos por token, lo que permite un equilibrio entre capacidad y eficiencia de inferencia.

Este repositorio, creado por mradermacher, ofrece 12 archivos GGUF con diferentes niveles de cuantización (desde Q2_K hasta f16), lo que permite ejecutar el modelo en hardware con recursos limitados, desde GPUs de consumo hasta CPU. La licencia Apache-2.0 y la compatibilidad con endpoints de Hugging Face lo hacen adecuado para integraciones en entornos de desarrollo y producción, aunque su uso está pensado principalmente para experimentación local y despliegues en los que el coste de cómputo es un factor crítico.

La relevancia de este modelo radica en que, al tratarse de una cuantización de un MoE, se puede obtener un rendimiento razonable en tareas de generación de texto y razonamiento con un presupuesto de VRAM reducido, lo que lo convierte en una opción viable para aplicaciones embebidas o con restricciones de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) - basado en OLMoE |
| Parametros totales | 6.919.161.856 (6.9B) |
| Parametros activos | 1.3B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (el modelo base original está disponible en safetensors) |

## Arquitectura y entrenamiento

El modelo base `ddidacus/olmoe-base` es una adaptación de la arquitectura OLMoE, desarrollada originalmente por AI2. OLMoE es un transformer con capas de Mixture of Experts, donde cada token activa solo una fracción de los parámetros (1.3B de 6.9B), lo que reduce el coste de inferencia. El modelo base fue entrenado con el dataset `allenai/RLVR-GSM`, que se centra en razonamiento matemático y verificación de respuestas (RLVR: Reinforcement Learning with Verifiable Rewards). Sin embargo, no se dispone de detalles adicionales sobre el proceso de entrenamiento (número de tokens, fases de fine-tuning, etc.) en la información proporcionada.

La cuantización GGUF fue realizada por mradermacher mediante un proceso estático, sin usar imatrix (quantization con matriz de importancia). No se han publicado detalles sobre la metodología de cuantización más allá de la elección de los tipos de cuantización estándar.

## Capacidades

- Generación de texto: el modelo es capaz de producir texto coherente y fluido en inglés, dada su naturaleza de modelo de lenguaje generativo.
- Razonamiento matemático: el entrenamiento con RLVR-GSM sugiere una capacidad mejorada para resolver problemas aritméticos y matemáticos básicos, aunque no hay benchmarks públicos que lo confirmen.
- Conversación: el modelo está etiquetado como "conversational", lo que indica que puede mantener diálogos multi-turno.
- Soporte de tool calling: no se especifica en la información disponible, pero la arquitectura OLMoE no incluye funciones nativas de tool calling.
- Capacidades multilingües: solo se indica inglés; no hay evidencia de soporte para otros idiomas.
- Modo thinking: no se menciona.

## Casos de uso

- Generación de texto local en aplicaciones de escritorio: gracias a las cuantizaciones de pequeño tamaño (por ejemplo, Q4_K_M de 4.3 GB), puede ejecutarse en una GPU con 6-8 GB de VRAM o incluso en CPU, permitiendo la generación de textos, resúmenes o respuestas en entornos sin conexión.
- Prototipado de agentes conversacionales: su naturaleza "conversational" permite probar flujos de chatbot en un entorno de desarrollo con un coste computacional bajo.
- Razonamiento matemático en contextos educativos: al estar entrenado con RLVR-GSM, puede utilizarse para resolver ejercicios de matemáticas sencillas o para generar explicaciones paso a paso, aunque su precisión no está verificada.
- Despliegue en servicios de inferencia de bajo coste: gracias a los tamaños reducidos de los GGUF, puede alojarse en instancias de cloud con GPU pequeñas (por ejemplo, T4 con 16 GB) o incluso en CPU, reduciendo costes operativos.
- Experimentación con MoE: para investigadores que quieran probar la eficiencia de un modelo MoE en su propio hardware sin necesidad de un clúster de GPU.
- Inferencia en dispositivos edge: los GGUF de menor tamaño (Q2_K, 2.7 GB) pueden caber en dispositivos con memoria limitada, como Raspberry Pi o Nvidia Jetson, para tareas de procesamiento de lenguaje natural básico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K o cualquier otra métrica estándar para este modelo cuantizado. Tampoco se encuentran resultados del modelo base `ddidacus/olmoe-base` en la documentación proporcionada.

## Requisitos de hardware

Los requisitos dependen de la cuantización elegida. Los tamaños de archivo de cada GGUF se indican a continuación:

| Cuantización | Tamaño (GB) | VRAM estimada para inferencia |
|---|---|---|
| Q2_K | 2.7 | 3-4 GB |
| Q3_K_S | 3.1 | 4-5 GB |
| Q3_K_M | 3.4 | 4-5 GB |
| Q3_K_L | 3.7 | 5-6 GB |
| IQ4_XS | 3.9 | 5-6 GB |
| Q4_K_S | 4.1 | 6-7 GB |
| Q4_K_M | 4.3 | 6-7 GB |
| Q5_K_S | 4.9 | 7-8 GB |
| Q5_K_M | 5.0 | 7-8 GB |
| Q6_K | 5.8 | 8-10 GB |
| Q8_0 | 7.5 | 10-12 GB |
| f16 | 13.9 | 16+ GB |

- GPU recomendadas: para Q4_K_M o menos, una RTX 3060 (12 GB) o RTX 4060 (8 GB) son suficientes. Para Q8_0, se requiere una GPU con al menos 10-12 GB de VRAM (RTX 3080, RTX 4070 Ti, A10). Para f16, se necesita una GPU de 16 GB o más (A100, H100, RTX 4090).
- Compatibilidad con consumer GPU: sí, las cuantizaciones Q2 a Q5 caben en GPUs de consumo con 6-8 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, HuggingFace Inference Endpoints (endpoints_compatible), y cualquier framework que soporte GGUF (por ejemplo, LM Studio, KoboldCPP).
- Latencia y throughput: no disponibles. Depende del hardware y del número de tokens activos (1.3B), lo que sugiere una latencia menor que un modelo denso de 6.9B.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| olmoe-base (este modelo) | 6.9B | 1.3B | no disponible | Apache-2.0 | GGUF |
| OLMoE-1B-7B-0924 (AllenAI) | 6.9B | 1.3B | no disponible | Apache-2.0 | safetensors |
| OLMoE-1B-7B-0125 (AllenAI) | 6.9B | 1.3B | no disponible | Apache-2.0 | safetensors |
| Mixtral 8x7B (Mistral) | 46.7B | 12.9B | 32k | Apache-2.0 | safetensors |

No se dispone de datos de rendimiento comparativo. La principal diferencia es el formato GGUF (este repositorio) frente a los pesos originales de safetensors, y la disponibilidad de cuantizaciones para entornos con recursos limitados.

## Limitaciones y advertencias

- Sesgos y alucinaciones: como todos los modelos de lenguaje, puede generar información falsa o sesgada, especialmente en dominios no cubiertos por su entrenamiento.
- Idioma: solo está entrenado en inglés; no debe usarse para tareas en otros idiomas sin una evaluación previa.
- Limitaciones de contexto: no se conoce la longitud de contexto máxima, por lo que se recomienda mantener las entradas cortas para evitar pérdida de rendimiento.
- Licencia: Apache-2.0 permite uso comercial, pero es necesario revisar los términos del modelo base original (OLMoE) para asegurar el cumplimiento.
- Riesgos de producción: al ser una cuantización estática sin imatrix, puede haber pérdida de calidad en comparación con cuantizaciones más avanzadas. Además, la falta de benchmarks públicos dificulta evaluar su rendimiento real en tareas específicas.
- Dependencia de terceros: el repositorio es una cuantización de un modelo de terceros; se recomienda verificar la fiabilidad del autor y la integridad de los archivos.

## Enlaces

- Repositorio HuggingFace: [mradermacher/olmoe-base-GGUF](https://huggingface.co/mradermacher/olmoe-base-GGUF)
- Modelo base original: [ddidacus/olmoe-base](https://huggingface.co/ddidacus/olmoe-base)
- Repositorio OLMoE (GitHub): [allenai/OLMoE](https://github.com/allenai/OLMoE)
- Página de OLMoE en AllenAI: [allenai.org/olmo](https://allenai.org/olmo)
