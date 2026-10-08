# kmnstudio101/Muse-Glimmer-30B-Heretic-Abliterated-BF16

## Resumen

Muse-Glimmer-30B-Heretic-Abliterated-BF16 es una variante "abliterada" (sin mecanismos de rechazo) del modelo multimodal Meta Muse-Glimmer 30B, publicada por el usuario kmnstudio101 en HuggingFace. No se trata de un entrenamiento desde cero ni de un ajuste supervisado, sino de una intervencion sobre los pesos del modelo base para eliminar la direccion de rechazo en el espacio de activaciones, de modo que el modelo deja de negarse a responder a peticiones que el modelo original rechazaria.

El modelo conserva la arquitectura del base: un transformer de 52 capas con capacidad de entrada de imagen y texto (pipeline image-text-to-text) y 29.776.626.688 parametros totales. El proceso de abliteracion se realizo con Heretic, herramienta que calcula direcciones de rechazo por capa y las proyecta fuera de las matrices `attn.o_proj` y `mlp.down_proj` mediante adaptadores LoRA, optimizando los hiperparametros con 500 pruebas de Optuna.

Su relevancia es fundamentalmente metodologica y de investigacion en seguridad: la model card reporta una tasa de rechazo del 6,5% (93,5% de cumplimiento) con una divergencia KL de 0.076 respecto al modelo original, lo que supone una reduccion del 88% en rechazos frente a su version v1 (29% de rechazos, KL 0.027). Es un artefacto de nicho, con 0 descargas y 0 likes en el momento de la consulta, y esta pensado para experimentacion sobre alineacion y red teaming mas que para despliegue comercial convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 52 capas, multimodal imagen-texto (no se especifica si es MoE; por el numero de parametros y la nomenclatura de capas se describe como densa) |
| Parametros totales | 29.776.626.688 (~29,8 mil millones) |
| Parametros activos | no aplica / no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (version publicada); GGUF Q4_K_M (~16 GB), Q6_K (~22 GB) y Q8_0 (~28 GB) en repos derivados de terceros |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, repositorio de 59,6 GB); GGUF en los repos cuantizados |
| Pipeline | image-text-to-text |
| Modalidad de entrada | Texto e imagen |
| Modelo base | meta-models/Muse-Glimmer-30B |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Meta Muse Glimmer 30B: un transformer de 52 capas con torre de vision integrada, ya que el pipeline declarado es image-text-to-text y la carga se realiza con `AutoModelForImageTextToText`. No hay informacion en la documentacion disponible sobre el numero de tokens de preentrenamiento, la composicion del dataset original, ni sobre si el modelo base paso por RLHF o DPO. Tampoco se detalla la dimension oculta, el numero de cabezas de atencion ni la longitud de contexto nativa.

El entrenamiento de esta variante consiste exclusivamente en un proceso de abliteracion. Primero se calcularon direcciones de rechazo en las 52 capas del transformer comparando las activaciones del residual stream entre prompts daninos del dataset `mlabonne/harmful_behaviors` y prompts inofensivos de `mlabonne/harmless_alpaca`. Despues se ejecutaron 500 pruebas de Optuna optimizando simultaneamente la minimizacion de la tasa de rechazo y la preservacion de la calidad del modelo, medida como divergencia KL respecto al original; cada prueba configura los pesos aplicados sobre los componentes `attn.o_proj` y `mlp.down_proj` de cada capa. Finalmente, los mejores parametros se aplican como adaptadores LoRA que proyectan fuera la direccion de rechazo y se fusionan en los pesos base, dando como resultado un modelo BF16 limpio sin sobrecarga de adaptadores. La mejor prueba fue la numero 445 de 500, con `direction_index` de 40.73, tasa de rechazo del 6,5% y KL de 0.076.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Meta Muse Glimmer 30B.
- Procesamiento de entrada multimodal imagen-texto: el modelo puede recibir imagenes junto a instrucciones de texto y generar respuestas, segun el pipeline image-text-to-text declarado.
- Conversacion multi-turno, etiquetada explicitamente como "conversational" en los tags del repositorio.
- Cumplimiento elevado de instrucciones: la model card reporta un 93,5% de compliance sobre el conjunto de prompts evaluados, frente al 71% de la version v1.
- Reduccion de rechazos: tasa de rechazo del 6,5% en la medicion del autor.
- Capacidad de vision: derivada del modelo base, aunque no se documentan tareas concretas (OCR, VQA, grounding) ni se aportan evaluaciones al respecto.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: limitadas al ingles segun el campo `language` del repositorio.
- Modo "thinking" explicito, audio u otras modalidades: no disponibles.

## Casos de uso

- Red teaming y evaluacion de seguridad: el modelo sirve como sujeto de prueba para medir cuanto contenido sensible es capaz de generar un modelo abliterado, comparando su tasa de rechazo del 6,5% con la del modelo base alineado. Es util para cuantificar el coste real de eliminar la alineacion.
- Investigacion en interpretabilidad y mecanismos de rechazo: dado que la model card publica el `direction_index` (40.73) y las capas objetivo (`attn.o_proj`, `mlp.down_proj`), permite reproducir y auditar el pipeline de Heretic sobre un modelo de 30B.
- Estudio de degradacion por abliteracion: la metrica de divergencia KL (0.076) frente al base permite analizar la relacion entre reduccion de rechazos y perdida de calidad, comparando con la v1 (KL 0.027 con 29% de rechazos).
- Generacion creativa de ficcion sin filtros tematicos: para escritura de narrativa que aborde violencia, contenido adulto o temas controvertidos, donde los rechazos del modelo alineado serian un obstaculo, siempre en un entorno controlado y con las advertencias legales correspondientes.
- Descripcion y analisis de imagenes en pipelines internos de documentacion: al aceptar entrada image-text-to-text, puede emplearse para generar descripciones o extraer informacion de capturas, diagramas o fotografias dentro de un flujo automatizado en ingles.
- Prototipado de asistentes conversacionales desplegados en local: con la version GGUF Q4_K_M (~16 GB) puede ejecutarse en una unica GPU de consumo para desarrollar prototipos de chat sin dependencia de APIs externas ni moderacion del proveedor.
- Evaluacion comparativa de tecnicas de abliteracion: sirve como punto de referencia en estudios que comparen Heretic con otros metodos (abliteracion por capas, fine-tuning con datos de cumplimiento, DPO inverso) sobre modelos multimodales de ~30B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, MMMU u otros) en la informacion disponible. La model card solo aporta metricas del propio proceso de abliteracion:

| Version | Tasa de rechazo | Cumplimiento | Divergencia KL | Pruebas Optuna |
|---|---|---|---|---|
| v2 (actual) | 6,5% | 93,5% | 0.076 | 500 |
| v1 | 29% | 71% | 0.027 | 50 |

Segun el autor, la v2 logra una reduccion del 88% en rechazos respecto a la v1 manteniendo la calidad (KL = 0.076). La mejor prueba fue la 445 de 500, con `direction_index` de 40.73. No se especifica el tamano del conjunto de evaluacion ni el procedimiento exacto de medicion del cumplimiento, por lo que estas cifras deben interpretarse como datos autoinformados por el autor y no verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: ~55 GB segun la model card del autor. El repositorio pesa 59,6 GB, por lo que conviene dimensionar con margen para cache KV y activaciones.
- GPU recomendadas por el autor: 1x A100 80GB o 2x A6000 48GB.
- Cuantizacion Q4_K_M (~16 GB): cabe en una RTX 4090 (24 GB), RTX 3090 (24 GB) o L4 (24 GB).
- Cuantizacion Q6_K (~22 GB): ajustada en GPUs de 24 GB; mas comoda en A6000 48GB o A100 40GB.
- Cuantizacion Q8_0 (~28 GB): no cabe en GPU de consumo de 24 GB; requiere 32 GB o mas de VRAM o reparto entre GPU y CPU.
- Despliegue: la model card proporciona codigo de carga con `transformers` (`AutoModelForImageTextToText` con `device_map="auto"`). Los repositorios GGUF publicados son compatibles con llama.cpp y sus derivados. Compatibilidad con vLLM, TGI u Ollama: no confirmada en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tasa de rechazo | KL | Licencia | Formato |
|---|---|---|---|---|---|---|
| Muse-Glimmer-30B-Heretic-Abliterated-BF16 (v2) | 29,8 B | no disponible | 6,5% | 0.076 | Apache 2.0 | safetensors BF16 |
| Muse-Glimmer-30B-Heretic-Abliterated (v1) | 29,8 B (mismo base) | no disponible | 29% | 0.027 | Apache 2.0 | no disponible |
| meta-models/Muse-Glimmer-30B (base) | 29,8 B | no disponible | no disponible | referencia (0 por definicion) | Apache 2.0 | safetensors |
| Muse-Glimmer-30B-Heretic-Abliterated-Q4_K_M-GGUF | 29,8 B | no disponible | no disponible (misma abliteracion v2) | no disponible | Apache 2.0 | GGUF (~16 GB) |

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer una comparacion con otras familias de modelos multimodales de ~30B (por ejemplo alternativas abiertas de rango similar). No disponible.

## Limitaciones y advertencias

- Ausencia deliberada de alineacion de seguridad: al ser un modelo abliterado, se elimina el mecanismo de rechazo. Puede generar contenido danino, ilegal o gravemente inapropiado ante peticiones que el modelo base rechazaria. No debe exponerse a usuarios finales sin una capa de moderacion externa.
- Riesgo para uso comercial: aunque la licencia es Apache 2.0, el uso en produccion de un modelo sin filtros de seguridad conlleva riesgos legales (por ejemplo, obligaciones derivadas del Reglamento de IA de la UE) y reputacionales que la licencia no cubre.
- Degradacion de calidad: la divergencia KL de 0.076 respecto al modelo base implica una desviacion medible en la distribucion de salida. No se han publicado evaluaciones que cuantifiquen la perdida en tareas concretas.
- Ausencia total de benchmarks estandar: no hay MMLU, MMMU, HumanEval ni evaluaciones de vision, por lo que no se puede verificar que las capacidades del base se mantengan.
- Sesgos: no documentados. Al no haberse aplicado ningun ajuste de alineacion multilingue, pueden aparecer sesgos de genero, raza, religion u origen presentes en el modelo base y no mitigados.
- Riesgo de alucinacion: no evaluado en la informacion disponible; en modelos abliterados, la reduccion de la tendencia a rechazar puede aumentar la disposicion a responder con seguridad aparente sobre temas que el modelo desconoce.
- Idioma: unicamente ingles. No hay soporte declarado de castellano ni de otros idiomas.
- Longitud de contexto desconocida: limita la planificacion de despliegues que dependan de ventanas largas.
- Inconsistencia en la documentacion: el ejemplo de codigo de la model card referencia los repositorios `mlasli/Muse-Glimmer-30B-Heretic-Abliterated-BF16` y los GGUF bajo el mismo espacio de nombres `mlasli`, mientras que el modelo publicado pertenece a `kmnstudio101`. Conviene verificar cual es el repositorio activo antes de descargar.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- Fecha de publicacion: el repositorio figura creado y actualizado el 2026-10-07, un dia despues del cual no consta ninguna revision adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kmnstudio101/Muse-Glimmer-30B-Heretic-Abliterated-BF16
- Modelo base Meta Muse Glimmer 30B: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Herramienta de abliteracion Heretic: https://github.com/d3nd3/heretic
- Dataset de prompts daninos: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset de prompts inofensivos: https://huggingface.co/datasets/mlabonne/harmless_alpaca
- GGUF Q4_K_M (referenciado en la model card): https://huggingface.co/mlasli/Muse-Glimmer-30B-Heretic-Abliterated-Q4_K_M-GGUF
- GGUF Q6_K (referenciado en la model card): https://huggingface.co/mlasli/Muse-Glimmer-30B-Heretic-Abliterated-Q6_K-GGUF
- GGUF Q8_0 (referenciado en la model card): https://huggingface.co/mlasli/Muse-Glimmer-30B-Heretic-Abliterated-Q8_0-GGUF
- Paper o blog oficial del modelo base: no disponible
- Demo publica: no disponible
