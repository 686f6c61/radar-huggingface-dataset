# AutomatosX/AX-Tiel-Coder-35B-A3B-MLX-AXQ-MXFP8-MTP

## Resumen

AX-Tiel-Coder-35B-A3B-MLX-AXQ-MXFP8-MTP es un checkpoint cuantizado en formato MLX para Apple Silicon, publicado por AutomatosX y derivado directamente del modelo en BF16 peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ6e-MTP. Se trata de un modelo de lenguaje de arquitectura Mixture of Experts (MoE) de la familia Qwen3.5-MoE, con 34.660.608.768 parámetros totales en safetensors (35,11B lógicos según la model card), ventana de contexto configurada de 262.144 tokens y soporte declarado de visión y de predicción multi-token (MTP). La etiqueta A3B del nombre sugiere del orden de 3.000 millones de parámetros activos por token, aunque la model card no confirma esa cifra.

El interés del paquete es puramente práctico: se trata de una cuantización mixta AXQuant (AXQ) que aplica 8 bits afines con grupo de 32 a la práctica totalidad del camino de texto (34,15B parámetros, 94,99%) y mantiene en BF16 los tensores protegidos (1,80B, 5,01%), además de preservar en BF16 sendos sidecars para el cabezal MTP (844,64M parámetros) y la torre de visión (446,57M parámetros). El resultado medido es de 8,4611 bits por peso (BPW) en el modelo principal y 8,6383 BPW en total, con un peso en disco de 38,82 GB.

Es relevante ahora porque permite ejecutar un MoE de ~35B con capacidades de codificación y visión sobre hardware Apple Silicon con memoria unificada, sin recurrir a GPUs discretas. Ahora bien, el propio autor lo etiqueta explícitamente como «Development evidence — not a certified AXQuant release»: no publica evidencias de calidad, de contexto largo, de velocidad de kernels ni de aceleración MTP, por lo que debe tratarse como artefacto en fase de desarrollo y no como una release validada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5MoeForConditionalGeneration` (Mixture of Experts, MoE); camino de texto optimizado |
| Parametros totales | 34.660.608.768 en safetensors; 35,11B lógicos según la model card |
| Parametros activos | Aproximadamente 3.000 millones (inferido del sufijo A3B del nombre; no confirmado en la model card) |
| Longitud de contexto | 262.144 tokens configurados; los límites prácticos dependen de la memoria unificada |
| Tipos de cuantizacion | AXQuant 1.9.0, presupuesto MXFP8: 8 bits afines (grupo de 32) en el 94,99% de los pesos y BF16 en el 5,01% protegido. 8,4611 BPW medidos en el modelo principal; 8,6383 BPW totales incluyendo MTP. Existen variantes hermanas de 4 bits y 6 bits |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | MLX safetensors (no contiene pesos PyTorch ni GGUF) |
| Tamano del repo | 38,8 GB (38,82 GB de pesos; descarga completa aproximada de 38,85 GB) |
| Modulos adicionales | MTP presente (`true`), visión presente (`true`), audio `false` |
| Runtime | MLX-LM (registrado con MLX 0.32.1 y MLX-LM 0.31.3); AX Engine no validado |

## Arquitectura y entrenamiento

La arquitectura de origen es `Qwen3_5MoeForConditionalGeneration`, un transformer con capas de mezcla de expertos. El repositorio no entrena ningún modelo: es una conversión cuantizada del checkpoint BF16 de referencia `peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ6e-MTP` (revisión `88625754ac91b542280a5602239ce6b2166366f0`). Por tanto, no hay información en la documentación proporcionada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. El autor no incluye ninguna evidencia de calibración.

La innovación técnica del paquete es el esquema de cuantización mixta AXQuant 1.9.0. La asignación de precisión se planificó a partir de priors de arquitectura (`architecture_prior`) y sin calibración, con grupo de 32 para las asignaciones cuantizadas. Se registraron 511 de 511 conversiones de módulos correctas y cero fallbacks, pero el autor no publica el manifiesto nativo de AX Engine, por lo que la ejecución nativa en ese motor «no está establecida». Los sidecars de MTP y de visión se conservan en BF16 (1,69 GB y 0,89 GB respectivamente), aunque su presencia no implica ni aceleración MTP ni calidad visión-lenguaje verificadas. La ruta de ejecución soportada es MLX-LM para inferencia de texto/backbone, que puede ignorar los metadatos de runtime de AXQuant y los sidecars opcionales.

## Capacidades

- Generación de texto conversacional (`text-generation`, `conversational`).
- Codificación: el modelo base pertenece a una familia orientada a código (Coder) y el paquete está etiquetado con `development` como tarea principal.
- Razonamiento multi-paso: el cabezal de predicción multi-token (MTP) está presente en el checkpoint, aunque el autor advierte que no se ha medido su aceptación ni su velocidad, por lo que no puede atribuirse una aceleración real.
- Visión: la torre de visión está preservada en BF16 como sidecar, pero la calidad visión-lenguaje «no se ha evaluado ni reclamado».
- Contexto largo: ventana configurada de 262.144 tokens, con la salvedad de que la calidad en contexto largo no está publicada (el campo correspondiente en la model card aparece truncado).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso autónomo: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (el campo de idiomas no está cumplimentado).
- Capacidad especial: cuantización mixta con precisión medida de 8,6383 BPW y ejecución nativa en Apple Silicon vía MLX.

## Casos de uso

- Asistencia de codificación en local sobre Mac: un desarrollador puede cargar el checkpoint con MLX-LM y usarlo como copiloto de código sin conexión, aprovechando que el modelo base pertenece a una familia orientada a código y que sus 38,82 GB caben en equipos Apple con 64 GB o más de memoria unificada.
- Procesamiento de repositorios completos: la ventana de 262.144 tokens permite pasar varios ficheros fuente en un único prompt para tareas de revisión, resumen o generación de documentación, siempre que la memoria unificada lo permita.
- Análisis de documentación técnica extensa: ingesta de manuales, RFCs o especificaciones largas para responder preguntas concretas sobre secciones dispersas, apoyándose en el contexto largo.
- Prototipado de pipelines multimodales en Mac: con la torre de visión preservada en BF16, es posible experimentar con entradas de imagen más texto, asumiendo que la calidad de esa ruta no está evaluada por el autor y debe medirse internamente.
- Evaluación interna de cuantizaciones mixtas: el paquete sirve como punto de comparación frente a sus hermanos de 4 bits y 6 bits para medir la degradación real de calidad por BPW antes de decidir un presupuesto de almacenamiento.
- Despliegue en estaciones de trabajo Apple Silicon para entornos con requisitos de confidencialidad: al ejecutarse en local con MLX, los datos no salen del equipo, lo que encaja en escenarios con datos sensibles.
- Investigación sobre MTP: dado que el sidecar MTP está incluido en BF16, es material de partida para estudiar decodificación especulativa con cabezales multi-token, aunque el autor no aporta ninguna cifra de velocidad.
- Generación de tests y refactorización asistida: tareas acotadas de transformación de código donde basta con unas pocas decenas de miles de tokens de contexto y el modelo activa solo una fracción de los expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card es explícita al respecto: no se publican evidencias de calidad frente a BF16 ni frente a baselines uniformes, no hay ninguna afirmación de retención de calidad, no se han medido la aceptación ni la velocidad de MTP, y la evidencia de kernels de AX Engine figura como `unmeasured`.

| Comprobacion declarada | Estado |
|---|---|
| Evidencia de planificación | `architecture_prior` |
| Calibración | ninguna; asignación basada en priors de arquitectura |
| Ejecución del cuantizador | 511/511 conversiones de módulos correctas; 0 fallbacks |
| Manifiesto nativo de AX Engine | no incluido |
| Calidad frente a BF16 o baselines uniformes | no publicada |
| Aceptación y velocidad de MTP | no medidas |
| Evidencia de kernels de AX Engine | `unmeasured` |
| Calidad visión-lenguaje | no evaluada |
| Calidad en contexto largo | no publicada |
| Benchmarks (MMLU, HumanEval, GSM8K, etc.) | no disponibles |

## Requisitos de hardware

- VRAM / memoria unificada: el peso en disco es de 38,82 GB y la descarga completa de 38,85 GB, por lo que se necesita al menos 40 GB de memoria unificada libre para la carga, y bastante más margen (64 GB o superior) para trabajar con contextos largos.
- GPU compatibles: no aplica a GPUs discretas. El formato MLX está diseñado para Apple Silicon; no hay pesos GGUF ni PyTorch en el repositorio, así que no hay ruta directa a CUDA.
- Equipos recomendados: Apple Silicon con 64 GB o 128 GB de memoria unificada (Mac Studio M2 Ultra / M3 Ultra, MacBook Pro M3 Max o M4 Max con 64 GB o 128 GB). En configuraciones de 32 GB o 36 GB no cabe.
- ¿Cabe en GPU de consumo? No en el sentido habitual (RTX 4090, etc.), porque no existe ruta MLX para esas tarjetas. En MacBook Pro de gama alta con 64 GB o más, sí es viable.
- Opciones de despliegue: MLX-LM es la ruta soportada y documentada (`mlx_lm.generate`). El propio autor indica que MLX-LM puede ignorar los metadatos de AXQuant y los sidecars opcionales, por lo que esa vía no establece aceleración MTP ni calidad visión-lenguaje. No hay soporte de vLLM, llama.cpp, Ollama ni TGI para este artefacto. La ejecución en AX Engine no está establecida por falta de manifiesto nativo validado.
- Latencia y throughput: no disponibles. El autor no publica ninguna medición de velocidad de kernels ni de decodificación especulativa.

## Comparativa con modelos similares

La información proporcionada solo permite comparar con la cadena de modelos de la que deriva este paquete. No hay datos de rendimiento de ninguno de ellos.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AX-Tiel-Coder-35B-A3B-MLX-AXQ-MXFP8-MTP (este) | 34,66B en safetensors; 35,11B lógicos | 262.144 tokens | AXQ 8,6383 BPW totales (8 bits + BF16 protegido) | apache-2.0 | HuggingFace, formato MLX; 0 descargas, 0 likes |
| AX-Tiel-Coder-35B-A3B-MLX-AXQ-6bit-MTP | no disponible | no disponible | Presupuesto AXQ de 6 BPW; mayor precisión media | apache-2.0 (presumible, no confirmado) | HuggingFace, formato MLX |
| AX-Tiel-Coder-35B-A3B-MLX-AXQ-4bit-MTP | no disponible | no disponible | Presupuesto AXQ de 4 bits; menor almacenamiento | apache-2.0 (presumible, no confirmado) | HuggingFace, formato MLX |
| peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ6e-MTP (base) | no disponible | no disponible | oQ6e (BF16 origen de la conversión) | no disponible | HuggingFace, formato MLX |

El autor advierte de que los nombres de las variantes AXQ describen una clase de presupuesto de almacenamiento y no una precisión uniforme: un plan etiquetado como `6bit` puede mantener 4 bits como base y elevar selectivamente otros tensores a 6 bits, 8 bits o BF16. En modelos pequeños o muy protegidos, los suelos de protección pueden llevar un plan de 4 bits cerca o por encima del presupuesto de 6 bits. Comparativas con alternativas externas de la misma categoría: no disponibles.

## Limitaciones y advertencias

- Estado de desarrollo explícito: el autor lo describe como «Development evidence — not a certified AXQuant release» y pide no interpretar la etiqueta AXQ como una afirmación de rendimiento.
- Sin evidencias de calidad: no se publica ninguna comparación de calidad frente al modelo BF16 ni frente a cuantizaciones uniformes, ni ninguna afirmación de retención de calidad.
- Sin calibración: la asignación de precisión se basa únicamente en priors de arquitectura, no en un conjunto de calibración.
- MTP sin medir: aunque el sidecar está presente, no se han medido aceptación ni velocidad, por lo que no debe asumirse ninguna aceleración por decodificación especulativa.
- Visión no evaluada: los tensores de visión se conservan en BF16, pero la calidad visión-lenguaje no se ha evaluado ni reclamado.
- Contexto largo sin evidencia: la ventana configurada es de 262.144 tokens, pero no hay datos publicados de calidad en contextos largos; además, el límite práctico depende de la memoria unificada del equipo.
- Limitación de plataforma: solo MLX sobre Apple Silicon. No hay pesos GGUF ni PyTorch, lo que descarta vLLM, llama.cpp, Ollama y TGI. La ejecución en AX Engine no está establecida por ausencia de manifiesto nativo validado.
- Riesgo de alucinación: no disponible en la información proporcionada; no hay evaluación publicada al respecto.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; el campo no está cumplimentado, lo que impide valorar cobertura multilingüe.
- Licencia: apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y de los datos de entrenamiento originales, no documentada aquí.
- Adopción nula verificable: 0 descargas y 0 likes en el momento de la consulta, y actualización el mismo día de la creación (4 de octubre de 2026), lo que indica ausencia de validación por parte de la comunidad.
- Reproducibilidad: el autor recomienda fijar el commit de HuggingFace en despliegues reproducibles en lugar de depender indefinidamente de `main`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AutomatosX/AX-Tiel-Coder-35B-A3B-MLX-AXQ-MXFP8-MTP
- Modelo base: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ6e-MTP/tree/88625754ac91b542280a5602239ce6b2166366f0
- Variante hermana de 4 bits: https://huggingface.co/AutomatosX/AX-Tiel-Coder-35B-A3B-MLX-AXQ-4bit-MTP
- Variante hermana de 6 bits: https://huggingface.co/AutomatosX/AX-Tiel-Coder-35B-A3B-MLX-AXQ-6bit-MTP
- Colecciones del autor: https://huggingface.co/AutomatosX/collections
- Índice completo del catálogo: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
- Paper, blog o repositorio técnico de AXQuant: no disponibles en la información proporcionada.
- Los resultados de la búsqueda web no contienen enlaces relevantes para este modelo.
