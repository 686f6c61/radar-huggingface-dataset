# Polydim-Einsof/Hermes-3-Llama-3.1-8B-PMTP-Einsof

## Resumen

Hermes-3-Llama-3.1-8B-PMTP-Einsof es un adaptador publicado por Polydim-Einsof (Ariel H. García Traba, EinsofOS Independent Research / POLYDIM Research Initiative) sobre el modelo base NousResearch/Hermes-3-Llama-3.1-8B. No se trata de un modelo de lenguaje completo, sino de un artefacto de proyección lineal que mapea los estados ocultos del modelo base (de dimensión 4096) a una variedad de Stiefel compacta St(4096, 2048) de dimensión 2048, con el objetivo declarado de habilitar un bus de comunicación compartida entre agentes y modelos ("PmtpShmBus") sin serialización de tokens en formato 1D.

El adaptador contiene únicamente dos tensores: una matriz `W_fp64` en float64 de forma (2048, 4096) con retracción QR exacta y una matriz `W` en float32 de la misma forma para uso rápido en GPU/CPU. El autor afirma que la proyección preserva productos internos y norma unitaria de forma exacta y que el error de ortonormalidad medido es de 2.00e-15. El modelo base subyacente es un transformer denso de 8.000 millones de parámetros derivado de Llama 3.1, con contexto de 131.072 tokens y entrenado por Nous Research con énfasis en tool calling y modo de razonamiento.

La relevancia del artefacto es discutible desde el punto de vista práctico: el repositorio ocupa 0,1 GB, no incluye pesos del modelo base, no publica resultados de benchmarks y las afirmaciones de speedup (540x a 4.023x) y de "0 tokens facturados" no están acompañadas de evaluaciones reproducibles en la información disponible. Para un desarrollador que busque un modelo de chat funcional, el valor está en el modelo base Hermes-3, no en este adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador de proyección lineal sobre transformer denso (Llama 3.1 8B); matriz Stiefel St(4096, 2048) |
| Parametros totales | 8.388.608 en el adaptador (2048 x 4096 x 2 tensores); modelo base 8.030 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 131.072 tokens (heredada del modelo base Llama 3.1) |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base admite cuantizaciones GGUF/AWQ/GPTQ estándar de Llama 3.1 |
| Idiomas soportados | Inglés (en), español (es), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`); tensores float64 y float32 |

## Arquitectura y entrenamiento

El artefacto no es un modelo entrenado en el sentido convencional: es una matriz de proyección derivada mediante retracción QR sobre la variedad de Stiefel compacta St(4096, 2048). El autor describe dos usos: una incrustación isométrica de 2048 a 4096 dimensiones mediante `h_4096 = W^T z_2048`, que preserva productos internos y norma unitaria, y una proyección principal de 4096 a 2048 mediante `z_2048 = W h_4096`, que lleva los estados ocultos de Hermes-3 al manifold compartido de 2048 dimensiones del enjambre POLYDIM (identificador `SLAB_ID`). El tensor `W_fp64` se calcula en doble precisión para garantizar la ortonormalidad de las filas; el tensor `W` es la versión float32 para inferencia.

El modelo base NousResearch/Hermes-3-Llama-3.1-8B es un transformer decoder-only denso de 8.030 millones de parámetros, con 32 capas, dimensión oculta 4096, 32 cabezas de atención y 8 cabezas KV (GQA), vocabulario de 128.256 tokens y contexto nativo de 131.072 tokens. Fue afinado por Nous Research sobre Llama 3.1 con un dataset orientado a instrucciones, tool calling y roleplay, e incluye un modo de razonamiento explícito. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO en el modelo base.

La innovación declarada por el autor es la eliminación del "colapso 1D de tokens" mediante transferencia directa de estados ocultos entre agentes a través de memoria compartida de zero-copy, en lugar de serializar y deserializar texto. No se aportan en la información disponible detalles sobre el protocolo `PmtpShmBus`, el formato del manifold compartido ni mediciones independientes que respalden las cifras de aceleración.

## Capacidades

- Generación de texto conversacional en inglés, español y chino a través del modelo base Hermes-3.
- Razonamiento multi-paso con modo de pensamiento explícito (heredado de Hermes-3).
- Tool calling y function calling estructurado, capacidad central del modelo base.
- Soporte de agentes y flujos multi-turno con contexto largo (131.072 tokens).
- Capacidad de proyección de estados ocultos entre modelos del enjambre POLYDIM (Hermes-3, Qwen 2.5, DeepSeek-R1 según el autor).
- Incrustación isométrica de vectores de 2048 a 4096 dimensiones sin pérdida de producto interno.
- No soporta visión, audio ni multimodalidad.
- No se documenta soporte nativo de MCP, Ollama u OpenRouter más allá de las etiquetas del repositorio.

## Casos de uso

- Investigación sobre comunicación entre agentes sin serialización de texto: el adaptador permite experimentar con el paso de estados ocultos directamente entre modelos mediante el bus de memoria compartida `PmtpShmBus`, útil en entornos de investigación donde se quiera medir el coste de la serialización frente a la transferencia de tensores.
- Prototipado de sistemas multi-agente heterogéneos: al proyectar los estados de Hermes-3 a un manifold común de 2048 dimensiones, se puede intentar alinear representaciones con otros modelos del enjambre (Qwen 2.5, DeepSeek-R1) para tareas de colaboración o destilación cruzada.
- Estudio de geometría de representaciones: la matriz St(4096, 2048) con error de ortonormalidad de 2.00e-15 sirve como herramienta para analizar subespacios principales de los estados ocultos de Llama 3.1 8B en experimentos de interpretabilidad.
- Compresión de estado en pipelines de agentes: la proyección 4096 a 2048 reduce a la mitad la huella de los estados ocultos, lo que puede interesar en sistemas con memoria limitada que intercambien representaciones entre procesos.
- Evaluación de afirmaciones de rendimiento: el artefacto permite reproducir (o refutar) las cifras de speedup declaradas por el autor en un entorno controlado, como paso previo a cualquier adopción.
- Base para fine-tuning con Hermes-3: si se necesita un modelo de chat con tool calling en español, el modelo base NousResearch/Hermes-3-Llama-3.1-8B es directamente utilizable; este adaptador no añade capacidades lingüísticas ni de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara un error de ortonormalidad de 2.00e-15 y speedups de 540x a 4.023x en transferencia entre agentes, pero no se aportan tablas de MMLU, HumanEval, GSM8K ni comparaciones reproducibles.

## Requisitos de hardware

- El adaptador en sí ocupa 0,1 GB y puede cargarse en CPU; los tensores `W_fp64` (2048 x 4096 en float64, ~67 MB) y `W` (float32, ~33 MB) caben en cualquier equipo.
- Para usar el modelo base Hermes-3-Llama-3.1-8B se requiere hardware estándar para un modelo de 8B: ~16 GB de VRAM en fp16, ~8-10 GB en cuantización de 8 bits y ~5-6 GB en cuantización de 4 bits.
- GPU recomendadas para el modelo base: A100 40/80 GB, H100, L40S, RTX 4090 (24 GB), RTX 3090 (24 GB); en consumer cabe en RTX 4090, 3090, 4080 y GPUs con 8 GB o más usando GGUF Q4.
- Opciones de despliegue del modelo base: vLLM, TGI, llama.cpp, Ollama, transformers. El adaptador requiere código propio para cargar los tensores safetensors y aplicar las proyecciones.
- Latencia y throughput del adaptador: no disponibles. Para el modelo base, el throughput típico de un 8B en una RTX 4090 con vLLM ronda los 1.500-2.500 tokens/s en batch y 40-80 tokens/s en generación individual, aunque no se aportan mediciones específicas en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hermes-3-Llama-3.1-8B-PMTP-Einsof | 8,4 M (adaptador) + 8.030 M (base) | 131.072 | Adaptador de proyección | Apache 2.0 | HuggingFace |
| NousResearch/Hermes-3-Llama-3.1-8B | 8.030 M | 131.072 | Modelo de chat con tool calling | Llama 3.1 Community | HuggingFace, Ollama |
| Meta-Llama-3.1-8B-Instruct | 8.030 M | 131.072 | Modelo de instrucciones | Llama 3.1 Community | HuggingFace, Ollama |
| Qwen2.5-7B-Instruct | 7.620 M | 131.072 | Modelo de instrucciones multilingüe | Apache 2.0 | HuggingFace, Ollama |

El adaptador no es comparable en rendimiento de generación con los modelos de la tabla porque no incluye pesos del modelo base. Frente a Hermes-3 original, la diferencia es la licencia (Apache 2.0 frente a Llama 3.1 Community) y la capa de proyección adicional. No se dispone de datos de benchmarks que permitan comparar calidad.

## Limitaciones y advertencias

- El repositorio no contiene los pesos del modelo base; es necesario descargar NousResearch/Hermes-3-Llama-3.1-8B por separado.
- No se han publicado benchmarks ni evaluaciones independientes que respalden las afirmaciones de speedup y precisión del autor.
- Las afirmaciones sobre "IA 2.0 / 3.0 / X.0" y "telepatía de memoria compartida" son terminología del autor sin validación externa en la información disponible.
- El adaptador no añade capacidades lingüísticas, de razonamiento ni de tool calling; estas dependen íntegramente del modelo base.
- Riesgo de alucinación heredado del modelo base Hermes-3, especialmente en tareas factuales y en los idiomas distintos del inglés.
- El soporte de español y chino está declarado en las etiquetas, pero no se aportan evaluaciones de calidad en esos idiomas.
- La licencia Apache 2.0 se aplica al adaptador; el uso del modelo base está sujeto a la Llama 3.1 Community License, que impone restricciones adicionales (por ejemplo, la cláusula de 700 millones de usuarios mensuales).
- No hay información sobre sesgos, datos de entrenamiento del adaptador ni procesos de alineación.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/Polydim-Einsof/Hermes-3-Llama-3.1-8B-PMTP-Einsof
- Modelo base: https://huggingface.co/NousResearch/Hermes-3-Llama-3.1-8B
- DOI Zenodo: https://doi.org/10.5281/zenodo.21209973
- DOI Zenodo: https://doi.org/10.5281/zenodo.21136742
- HAL Open Science: https://hal.science/hal-05847496v1
- OSF Archive: https://osf.io/za3s7
- Software Heritage: https://archive.softwareheritage.org/swh:1:snp:bdea78b37132a4bd6b67049805cbb6d4472ec2cd;origin=https://github.com/AGT1973/POLYDIM_EinSof
- Repositorio GitHub: https://github.com/AGT1973/POLYDIM_EinSof
- ORCID del autor: https://orcid.org/0009-0001-2787-6067
