# arianaazarbal/ct-qwen36-35b-self-gen-postcot-g2-b3

## Resumen

ct-qwen36-35b-self-gen-postcot-g2-b3 es un adaptador LoRA (rank 64, `target_modules=all-linear`) entrenado sobre el modelo base Qwen/Qwen3.6-35B-A3B. Lo publica el usuario arianaazarbal dentro de un programa de entrenamiento con constitución iterada (`welfare-in-ai-rnd / constitutional_training`, linaje `qwen36-35b-self-gen-postcot`). Cada generación de ese programa se entrena desde cero sobre el modelo base, usando un corpus sintético que instancia una única constitución.

Este adaptador es la generación 2 (g2), réplica independiente b3. Su constitución no la escribió un humano: procede del modelo de la generación 1 de la misma rama, seleccionada como medoide de embedding (con filtro) de un pool de 40 constituciones autogeneradas. El régimen de entrenamiento combina midtrain con un post-train de stage 2 (SFT de chat condicionado por la constitución y con las trazas de razonamiento conservadas, `regime:post_cot`).

Su interés es fundamentalmente de investigación: permite medir la deriva entre generaciones cuando el único canal de transmisión es el corpus de documentos y nunca los pesos. El repositorio ocupa 4,5 GB y no registra descargas ni likes en el momento de la consulta. No hay benchmarks publicados, ni licencia declarada, ni idiomas especificados en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer (modelo base Qwen3.6-35B-A3B); tipo de atención y detalles internos del base no disponibles |
| Parametros totales | No disponible para el adaptador. El modelo base se denomina "35B" en su nomenclatura; no confirmado en la información proporcionada |
| Parametros activos | No disponible. La nomenclatura "A3B" del modelo base sugiere una arquitectura MoE con unos 3B de parámetros activos, pero no está confirmado en la información disponible |
| Longitud de contexto | 8192 tokens como máximo durante el entrenamiento (`max length 8192` del recipe). Ventana nativa del modelo base: no disponible |
| Tipos de cuantizacion | No disponible. El adaptador se sirve en precisión de entrenamiento (bf16); la combinación con bases cuantizadas no está verificada |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el repositorio no la declara; la licencia del modelo base tampoco se especifica en la información proporcionada) |
| Formato de pesos | safetensors (adaptador LoRA PEFT), más `tinker_meta.json` y `training_seed_constitution.md` |
| Rank de LoRA | 64 |
| Modulos objetivo | `all-linear` |
| Libreria | peft (exportado desde Tinker) |
| Tamano del repositorio | 4,5 GB |
| Pipeline | text-generation |
| Fecha de entrenamiento | 2026-09-17 (exportado el 2026-09-18) |

## Arquitectura y entrenamiento

El adaptador no modifica la arquitectura del modelo base: añade matrices de bajo rango de rank 64 sobre todas las capas lineales. El recipe está fijado y documentado: LoRA r=64, learning rate 1e-4, scheduler coseno con 5% de warmup, 1 época, batch de 128, longitud máxima de 8192 tokens y semilla de entrenamiento 42. La etapa 2 (post-train) continúa desde el adaptador de la etapa 1 y se entrena sobre datos de chat condicionados por la constitución, generados con Opus, manteniendo las trazas de chain-of-thought.

La innovación metodológica está en el bucle generacional, no en la arquitectura. La generación 0 se sembró con una constitución escrita por humanos; a partir de la generación 1, la constitución que gobierna el entrenamiento la escribe el modelo de la generación anterior de la misma rama (medoide de embedding del pool de 40 constituciones autogeneradas, elicitado con el método descrito). Como cada generación se reentrena desde el modelo base y no desde los pesos de la anterior, la deriva solo puede acumularse a través del texto de los documentos sintéticos. La constitución concreta usada en este adaptador se incluye en el repositorio como `training_seed_constitution.md`. El número total de tokens de entrenamiento y la composición detallada del corpus no están disponibles.

## Capacidades

- Generación de texto y conversación (pipeline declarado: `text-generation`).
- Chat condicionado por constitución: el comportamiento se moldea mediante el corpus sintético derivado de una constitución explícita.
- Razonamiento con trazas: el stage 2 conserva las trazas de chain-of-thought, y la tarjeta indica servir/evaluar con el renderer `qwen3_5` y razonamiento activado.
- Escritura de constituciones: propiedad del linaje (la generación 1 de esta rama generó la constitución con la que se entrenó la generación 2), no una capacidad declarada explícitamente del adaptador.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio, thinking mode nativo): no disponible, más allá del razonamiento activado en la evaluación.

## Casos de uso

- Investigación sobre alineación constitucional: comparar el comportamiento de este adaptador con el del modelo base y con el de otras generaciones del mismo linaje permite medir cuánto de la constitución se transfiere al modelo vía SFT sobre documentos sintéticos.
- Estudio de deriva generacional: al ser la réplica b3 de la generación 2, sirve para replicar experimentos y separar el efecto de la constitución del ruido de entrenamiento (semilla 42, mismo recipe).
- Ablación del régimen post-CoT: comparar este adaptador (`regime:post_cot`) con variantes sin trazas de razonamiento del mismo programa para cuantificar el efecto de conservar el chain-of-thought en el SFT.
- Evaluación de constituciones autogeneradas frente a humanas: contrastar la generación 0 (seed humano) con las generaciones 1 y 2 para detectar degradación semántica o acumulación de sesgos en el texto constitucional.
- Red teaming y análisis de seguridad: usar el adaptador para comprobar si un condicionamiento por constitución reduce o desplaza comportamientos no deseados, y si esos efectos persisten tras varias generaciones.
- Reproducción de pipelines de entrenamiento con PEFT: el repositorio sirve como ejemplo verificable de fusión de LoRA rank 64 con `all-linear` sobre un modelo base grande, con semilla y hiperparámetros documentados.
- Base para experimentos de automejora: el mecanismo de elicitación de constituciones es un caso concreto de bucle auto-generativo donde el modelo produce el texto que define el entrenamiento de la siguiente iteración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador añade una sobrecarga pequeña, pero requiere cargar el modelo base completo. Estimación aritmética a partir del recuento nominal de 35B parámetros (no confirmada, depende de si finalmente es MoE y del dtype): en bf16 en torno a 70 GB de pesos; en 8 bits en torno a 35 GB; en 4 bits en torno a 18 GB. A esto hay que sumar la caché KV para contextos de hasta 8192 tokens.
- GPU recomendadas: para bf16, A100 80 GB, H100 80 GB o configuraciones multi-GPU. Para cuantización de 8 bits, una A100 40 GB o 2x24 GB. Para 4 bits, una única GPU de 24 GB.
- Cabe en GPU de consumo: solo con el modelo base cuantizado (4 bits) en tarjetas de 24 GB (RTX 3090, RTX 4090); el margen es estrecho y no está verificado para este adaptador concreto.
- Opciones de despliegue: PEFT + transformers para cargar el adaptador; vLLM o TGI si se fusiona el adaptador con el base; llama.cpp u Ollama únicamente si se convierte el modelo fusionado a GGUF (no se distribuye GGUF en el repositorio).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de otras alternativas en la información proporcionada, por lo que la comparación se limita a características estructurales.

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmark |
|---|---|---|---|---|---|
| ct-qwen36-35b-self-gen-postcot-g2-b3 (este adaptador) | Adaptador LoRA r=64 sobre Qwen3.6-35B-A3B | 8192 en entrenamiento | No disponible | safetensors (PEFT) | No disponible |
| Qwen/Qwen3.6-35B-A3B (modelo base) | Nominal 35B (activos no disponibles) | No disponible | No disponible | No disponible en la información proporcionada | No disponible |
| Otras generaciones/ramas del mismo programa (g0, g1, b1, b2) | Mismo recipe | 8192 en entrenamiento | No disponible | safetensors (PEFT) | No disponible |
| Adaptadores LoRA de propósito general sobre modelos de ~35B | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica licencia, lo que impide determinar si el uso comercial está permitido; además habría que verificar la licencia del modelo base Qwen3.6-35B-A3B, también ausente en la información disponible.
- No es un modelo autónomo: es un adaptador LoRA que requiere descargar y servir el modelo base completo.
- Ausencia total de benchmarks: no hay evidencia publicada de calidad, por lo que no debe asumirse ningún nivel de rendimiento.
- Sin validación de la comunidad: 0 descargas y 0 likes en el momento de la consulta; el artefacto no ha sido evaluado externamente.
- Idiomas no declarados: se desconoce la cobertura lingüística real del par base + adaptador.
- Riesgo de alucinación: inherente a los modelos de lenguaje; el régimen post-CoT puede producir respuestas más largas y costosas sin garantizar mayor veracidad.
- Deriva generacional: la constitución de esta generación la escribió un modelo, no un humano, por lo que puede arrastrar sesgos, ambigüedades o degradación semántica respecto al seed original.
- Datos sintéticos generados por otro modelo (Opus): el corpus de stage 2 puede heredar los sesgos y los estilos de ese generador.
- Contexto limitado a 8192 tokens durante el entrenamiento: el comportamiento con secuencias más largas no está verificado.
- Entrenamiento de una sola época con semilla fija: no hay garantía de convergencia ni de estabilidad entre réplicas más allá de la documentación del recipe.
- El contenido de `training_seed_constitution.md` define el comportamiento esperado, pero no se ha auditado en la información disponible.
- Fechas de creación y actualización (2026) según los metadatos de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arianaazarbal/ct-qwen36-35b-self-gen-postcot-g2-b3
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Librería PEFT: https://github.com/huggingface/peft
- Ruta original del entrenamiento en Tinker: `tinker://42217fce-a342-5cdd-8ea2-e71e0b5e8827:train:0/sampler_weights/qwen36_selfg2_qwen36_self_g2_b3_s2_cot_final`
- La búsqueda web realizada no devolvió ningún enlace relevante sobre este modelo, su linaje o su programa de entrenamiento; los resultados obtenidos correspondían a páginas de soporte de Microsoft y no guardan relación con el contenido de esta ficha.
