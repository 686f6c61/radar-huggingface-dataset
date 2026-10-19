# polydim-cla/gemma-2-9b-pmtp

## Resumen

`polydim-cla/gemma-2-9b-pmtp` es un adaptador de investigación publicado por el autor independiente Ariel García Traba bajo la iniciativa POLYDIM-EINSOF, construido sobre el modelo base `google/gemma-2-9b`. No se distribuye como un modelo completo, sino como un conjunto de pesos que, según la model card, inyecta una transformación geométrica en la capa 20 del transformer: una proyección del espacio de representación de dimensión 3584 a un espacio canónico de 2048, descrita como una variedad de Stiefel St(3584, 2048) sobre la esfera S^2047. El repositorio ocupa 0,2 GB, un orden de magnitud muy inferior a los aproximadamente 18 GB que requerirían los pesos completos de un modelo de 9B en FP16.

La propuesta conceptual que acompaña al adaptador es el "continuous-thought" o razonamiento en espacio latente: en lugar de serializar cadenas de texto entre pasos, el modelo intercambiaría tensores directamente mediante un bus de comunicación denominado `PmtpShmBus` (descrito en la model card como "Zero-Worm IPC"). Se trata de terminología propia del autor, sin validación por pares ni resultados de evaluación publicados en la información disponible.

Su relevancia actual es, por tanto, exclusivamente investigadora: es un artefacto para experimentar con intervenciones geométricas en las activaciones internas de Gemma 2 y con protocolos de comunicación entre procesos basados en tensores. No hay evidencia publicada de que mejore las capacidades del modelo base, ni benchmarks, ni métricas de calidad, ni casos de uso en producción documentados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2) con adaptador geométrico inyectado en la capa 20; proyección 3584 → 2048 sobre variedad de Stiefel St(3584, 2048) |
| Parámetros totales | No disponible para el adaptador; el modelo base `google/gemma-2-9b` tiene 9.240 millones de parámetros |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la model card; el modelo base Gemma 2 9B soporta 8.192 tokens |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (la model card no detalla idiomas del adaptador; el modelo base Gemma 2 es multilingüe) |
| Licencia | Apache 2.0 declarada en la model card del adaptador |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 0,2 GB |
| Dimensión del modelo base | d_model = 3584 |
| Defecto de Frobenius de Stiefel | 3.919e+01 (calculado con acumulador Neumaier en FP64, según el autor) |
| Fecha de publicación | 18 de octubre de 2026 |

## Arquitectura y entrenamiento

El adaptador se monta sobre Gemma 2 9B, un transformer decoder-only de Google con 42 capas, atención con cabeceras agrupadas (GQA) y alternancia de atención local y global, entrenado originalmente con destilación de conocimiento desde un modelo mayor. La intervención descrita en la model card consiste en una proyección lineal en la capa 20 que lleva las activaciones de dimensión 3584 a un subespacio de dimensión 2048, restringido a una variedad de Stiefel (el conjunto de matrices de columnas ortonormales), lo que impone una restricción geométrica de ortogonalidad sobre las representaciones. El autor reporta un defecto de Frobenius de 3,919e+01 medido con un acumulador compensado de Neumaier en FP64, es decir, una desviación de la ortogonalidad exacta que el propio autor cuantifica.

El componente de comunicación, `PmtpShmBus` / "Zero-Worm IPC", se describe como un canal de memoria compartida entre procesos que transporta tensores sin serializar texto. La model card no incluye información sobre el corpus de entrenamiento, el número de tokens vistos, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste supervisado. Tampoco se documenta el procedimiento de optimización sobre la variedad (por ejemplo, si se usó descenso de gradiente de Riemanniano), el coste computacional del entrenamiento ni el criterio de selección del checkpoint.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Gemma 2 9B, en la medida en que el adaptador no las degrade (no hay evaluación publicada al respecto).
- Modificación de representaciones internas: el adaptador altera las activaciones de la capa 20, lo que permite estudiar el efecto de una restricción de ortogonalidad sobre el espacio latente.
- Razonamiento en espacio latente (propuesto): el autor plantea un modo "continuous-thought" en el que los pasos intermedios se transmiten como tensores en lugar de texto.
- Comunicación entre procesos por memoria compartida: el componente `PmtpShmBus` está pensado para intercambiar tensores entre procesos sin serialización textual.
- Soporte de tool calling / function calling: no disponible (no documentado para el adaptador; depende de las capacidades del modelo base).
- Soporte de agentes y razonamiento multi-paso: no documentado; el "continuous-thought" se presenta como un mecanismo interno, no como un sistema de agentes.
- Capacidades multilingües: no disponibles en la información proporcionada para el adaptador.
- Capacidades especiales (visión, audio, thinking mode explícito): no disponibles.

## Casos de uso

- Investigación sobre geometría de representaciones: cargar el adaptador sobre Gemma 2 9B, extraer activaciones de la capa 20 con y sin la proyección, y medir cómo cambia la estructura del espacio latente (rango efectivo, isotropía, alineación de subespacios). Es el uso más directo y el único respaldado por la información disponible.
- Reproducción de experimentos sobre adaptadores restringidos a variedades: el repositorio de 0,2 GB permite replicar la inyección en la capa 20 y comparar configuraciones de dimensión canónica (por ejemplo, 2048 frente a otros valores) con un coste de almacenamiento bajo.
- Estudio de protocolos IPC para tensores: usar `PmtpShmBus` como banco de pruebas de comunicación entre procesos de inferencia sin serialización de texto, midiendo latencia y throughput frente a alternativas como gRPC o ZeroMQ.
- Evaluación de robustez del modelo base frente a intervenciones internas: comparar las respuestas de Gemma 2 9B original y con el adaptador en tareas de razonamiento aritmético o comprensión lectora, para cuantificar si la restricción de ortogonalidad introduce degradación.
- Docencia y divulgación sobre álgebra lineal aplicada a modelos de lenguaje: ilustrar qué es una variedad de Stiefel y cómo se mide su defecto de Frobenius con acumulación compensada en FP64 sobre pesos reales de un transformer.
- Prototipado académico de "latent reasoning": servir de punto de partida para grupos que quieran experimentar con paso de mensajes en espacio continuo, asumiendo que no existe validación publicada de que mejore el razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra tarea, ni comparaciones con el modelo base. El único dato numérico reportado es el defecto de Frobenius del apartado geométrico (3,919e+01), que mide la desviación respecto a la ortogonalidad exacta y no el rendimiento del modelo.

## Requisitos de hardware

- El adaptador por sí solo ocupa 0,2 GB, pero requiere cargar el modelo base `google/gemma-2-9b` para funcionar.
- VRAM estimada para el modelo base: ~18,5 GB en FP16/BF16; ~9,5 GB en cuantización de 8 bits; ~5,5-6,5 GB en cuantización de 4 bits. Estimaciones calculadas a partir de los 9.240 millones de parámetros, no publicadas por el autor.
- GPU de datacenter: A100 40 GB, H100 80 GB o L40S 48 GB en FP16 sin problemas; una A100 40 GB permite varias instancias concurrentes en 8 bits.
- GPU de consumo: cabe en RTX 4090 (24 GB) en FP16, y en RTX 3090/4080 (16-24 GB) en 8 o 4 bits. En tarjetas de 8-12 GB solo es viable con cuantización de 4 bits y contexto reducido.
- Opciones de despliegue: al ser un adaptador, requiere un runtime que soporte la carga de pesos adicionales y la inyección en capa 20 (no estándar). Para el modelo base desnudo funcionan vLLM, TGI, llama.cpp, Ollama (etiqueta `gemma2:9b`) y transformers. La compatibilidad del adaptador con vLLM, TGI o llama.cpp no está documentada.
- Latencia y throughput: no disponibles. No hay mediciones publicadas del sobrecoste que introduce `PmtpShmBus` ni la proyección de la capa 20.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `polydim-cla/gemma-2-9b-pmtp` | 9.240 M (base) + adaptador de 0,2 GB | No especificado (base: 8.192 tokens) | Apache 2.0 declarada | HuggingFace, 0 descargas, 0 likes | Adaptador de investigación sin benchmarks ni validación por pares |
| `google/gemma-2-9b` | 9.240 M | 8.192 tokens | Gemma Terms of Use | HuggingFace, ampliamente usado | Modelo base; sí dispone de benchmarks publicados por Google |
| `meta-llama/Llama-3.1-8B` | 8.030 M | 128.000 tokens | Llama 3.1 Community License | HuggingFace | Contexto mucho mayor y ecosistema de herramientas maduro |
| `Qwen/Qwen2.5-7B` | 7.610 M | 32.768 tokens nativos (131.072 con YaRN) | Apache 2.0 | HuggingFace | Licencia permisiva y soporte multilingüe documentado |

La comparación relevante es contra el propio modelo base: el adaptador no publica métricas que justifiquen su uso frente a Gemma 2 9B sin modificar. Frente a Llama 3.1 8B y Qwen2.5 7B, la diferencia principal no es de rendimiento (no hay datos) sino de madurez, documentación y soporte de herramientas.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ablaciones ni comparación con el modelo base. No es posible afirmar que el adaptador preserve o mejore las capacidades de Gemma 2 9B.
- Terminología no estándar y sin validación por pares: expresiones como "tensor telepathy", "Zero-Worm IPC" o "continuous-thought" no corresponden a conceptos establecidos en la literatura; deben tratarse como descripciones del autor, no como garantías técnicas.
- Licencia potencialmente incompatible: la model card del adaptador declara Apache 2.0, pero el modelo base `google/gemma-2-9b` se distribuye bajo Gemma Terms of Use, que imponen restricciones de uso (incluida una política de uso prohibido). Un derivado no puede relicenciarse unilateralmente como Apache 2.0 sin verificar los términos aplicables. Conviene consultar con asesoría legal antes de cualquier uso comercial.
- Riesgo de alucinación: el del modelo base Gemma 2 9B, no mitigado ni evaluado por el adaptador.
- Idiomas: no documentados para el adaptador; no hay garantía de que la proyección de la capa 20 preserve el comportamiento multilingüe del modelo base.
- Compatibilidad de despliegue incierta: la inyección en una capa concreta y el bus IPC propietario implican que las herramientas estándar (vLLM, TGI, llama.cpp, Ollama) probablemente no carguen el adaptador sin código específico del repositorio del autor.
- Mantenimiento y reproducibilidad: 0 descargas y 0 likes en el momento de la consulta; un único autor; sin versión de paper ni conjunto de evaluación reproducible. El repositorio de GitHub enlazado es la única fuente de código.
- Contexto limitado por el modelo base: 8.192 tokens, inferior a los 128.000 de Llama 3.1 8B, lo que restringe usos con documentos largos.
- Sesgos: no evaluados. Los sesgos del modelo base Gemma 2 persisten y no hay información sobre datos de ajuste del adaptador que pudiera introducir otros nuevos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/polydim-cla/gemma-2-9b-pmtp
- Repositorio del autor (POLYDIM-EINSOF): https://github.com/AGT1973/POLYDIM_EINSOF
- Modelo base: https://huggingface.co/google/gemma-2-9b
- Etiqueta de Ollama del modelo base: https://ollama.com/library/gemma2
