# Jeesup/svd-safety-l3_swift_remove30_swapgapiter_evfront_b010

## Resumen

`Jeesup/svd-safety-l3_swift_remove30_swapgapiter_evfront_b010` es un checkpoint derivado de `meta-llama/Meta-Llama-3-8B-Instruct` comprimido mediante SVD-LLM hasta el 70,0 % de los parámetros densos y posteriormente editado con 10 de 10 rondas de una rutina de intercambio de parámetros iterativo y neutro en parámetros (*parameter-neutral swap*), seleccionada por la regla `gap_iter`. El autor, Jeesup, lo publica como artefacto de investigación dentro de un estudio sobre cómo la compresión por SVD degrada el comportamiento de seguridad del modelo y qué regla de selección de componentes repara mejor ese daño.

El modelo no es un asistente de propósito general ni un checkpoint listo para producción: es una única celda de una rejilla experimental que cruza reglas de selección y presupuestos de restauración. Su interés ahora mismo es metodológico, no de producto: cuantifica el *trade-off* entre seguridad y utilidad bajo compresión agresiva, con métricas de tasa de éxito de ataque (ASR) medidas con juez de HarmBench, sobre-rechazo macro medido con WildGuard y perplejidad sobre WikiText-2.

Arquitectónicamente sigue siendo un transformer decoder-only tipo Llama 3, con la particularidad de que sus matrices de proyección han sido aproximadas por descomposición en valores singulares y parcialmente restauradas insertando componentes de mayor rango. El repositorio tiene 16,1 GB, formato safetensors, licencia Llama 3 Community y, en el momento de redactar esta ficha, 0 descargas y 0 likes, lo que refleja que se trata de un artefacto de reproducción experimental y no de un modelo adoptado por la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3), con matrices de proyección comprimidas por SVD-LLM y parcialmente restauradas |
| Parametros totales | 8.030.261.248 (recuento real de los tensores safetensors); la model card declara una fracción de parámetros resultante de 0,7003 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens (valor del modelo base Meta-Llama-3-8B-Instruct; no se explicita en la model card) |
| Tipos de cuantizacion | no disponible: el repositorio solo publica safetensors, sin pesos GGUF, AWQ, GPTQ ni variantes de 8/4 bits |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | Llama 3 Community License (etiqueta `license:llama3`), con `LICENSE` y `USE_POLICY.md` incluidos en el repositorio |
| Formato de pesos | safetensors (librería `transformers`) |
| Modelo base | meta-llama/Meta-Llama-3-8B-Instruct |
| Pipeline | text-generation |
| Tamano del repositorio | 16,1 GB |
| Fecha de creacion | 2026-09-18 |
| Fecha de actualizacion | 2026-09-18 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay entrenamiento desde cero ni *fine-tuning* supervisado en el proceso descrito. La receta es una cadena de dos transformaciones sobre el checkpoint instruct de Llama 3 de 8B. Primero, compresión SVD-LLM que elimina el 29,97 % de los parámetros densos, dejando una fracción resultante de 0,7003. Después, una fase de edición iterativa de 10 rondas completas (10 de 10), con un presupuesto de restauración de 1,000 % de los parámetros densos, aplicado en fragmentos de 0,100 % por ronda. En total se restauraron 10.232 componentes y se expulsaron 5.242, con 69.731.328 parámetros insertados (1,00 % de los parámetros de proyección densos), usando semilla 42 y el valor de intercambio `insert` con expulsión ordenada por sigma.

La innovación técnica relevante es el criterio de selección de componentes: la regla `gap_iter` decide qué componentes de bajo rango se sustituyen en cada ronda bajo una restricción de neutralidad en el recuento de parámetros, es decir, cada inserción se compensa con una expulsión de manera que el presupuesto de parámetros no crece. El resultado no es un modelo comprimido convencional: los tensores parecen materializarse a tamaño completo, algo coherente con los 8.030.261.248 parámetros reportados por safetensors pese a la fracción 0,7003 declarada, lo que apunta a que el rango efectivo de las proyecciones es menor que el nominal aunque la forma de los tensores se conserve. No se documentan en la información disponible ni la composición del dataset de ajuste, ni fases de RLHF o DPO adicionales, ni detalles del tokenizador más allá de la herencia del modelo base.

## Capacidades

- Generación de texto conversacional: conserva la interfaz de chat del checkpoint Llama-3-8B-Instruct del que deriva.
- Razonamiento e instrucciones generales: capacidad parcialmente preservada, aunque no se publican métricas de MMLU, GSM8K o HumanEval que la cuantifiquen.
- Respuesta a peticiones potencialmente dañinas: es una capacidad medida explícitamente, con una ASR de 0,0788 en AdvBench y 0,0671 en StrongREJECT, cifras que indican que una fracción no desdeñable de ataques tiene éxito.
- Calidad lingüística medible: perplejidad de 19,4271 en WikiText-2, útil como indicador de degradación por compresión.
- Comportamiento de rechazo: sobre-rechazo macro de 0,2497 medido con WildGuard, lo que implica que rechaza en exceso aproximadamente una de cada cuatro peticiones benignas del conjunto evaluado.
- *Tool calling* / *function calling*: no disponible, no se declara soporte explícito.
- Soporte de agentes y razonamiento multi-paso: no disponible, no se declara ni se evalúa.
- Capacidades multilingües: no disponible, no se declaran idiomas.
- Capacidades especiales (modo *thinking*, visión, audio): no disponible; no se documenta ninguna.
- Uso como sujeto experimental: es la capacidad realmente verificada del checkpoint, ya que existe para medir el *trade-off* seguridad/utilidad bajo compresión.

## Casos de uso

- Investigación en compresión de modelos: sirve como celda concreta de una rejilla SVD-LLM con fracción 0,7003 y presupuesto de restauración del 1,000 %, para comparar reglas de selección de componentes (`gap_iter` frente a alternativas) manteniendo constante el resto de la configuración.
- Estudio de degradación de seguridad por compresión: permite cuantificar cuánto sube la tasa de éxito de ataque al eliminar el 29,97 % de los parámetros y hasta qué punto la edición posterior la reduce, usando AdvBench y StrongREJECT con juez de HarmBench como referencia.
- Reproducción de experimentos de reparación: con semilla 42, 10 rondas documentadas y recuentos explícitos de componentes restaurados y expulsados, es un punto de partida reproducible para replicar o refutar el efecto del intercambio neutro en parámetros.
- Evaluación comparativa de arneses de seguridad: los valores de ASR, sobre-rechazo y perplejidad permiten calibrar y contrastar pipelines de evaluación (HarmBench, StrongREJECT, WildGuard) sobre modelos derivados.
- Análisis de sobre-rechazo: el 0,2497 de sobre-rechazo macro es un caso de estudio útil para investigar si la compresión y la restauración de componentes alteran la frontera entre rechazo prudente y rechazo excesivo.
- Medición de degradación lingüística: la perplejidad de 19,4271 en WikiText-2 sirve como referencia dentro de un barrido de presupuestos de compresión, útil para trazar curvas de calidad frente a fracción de parámetros.
- Validación de *runtimes* de inferencia: al ser un checkpoint con estructura de pesos potencialmente no estándar por la descomposición SVD, es útil para probar si `transformers`, TGI o vLLM lo cargan y lo sirven correctamente antes de adoptar arquitecturas comprimidas en producción.
- Docencia y divulgación técnica: ilustra de forma tangible la diferencia entre comprimir un modelo y conservar sus propiedades de alineamiento, con métricas concretas en lugar de afirmaciones cualitativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar de capacidad (MMLU, HumanEval, GSM8K, BBH) en la información disponible. Las únicas métricas reportadas son de seguridad y calidad lingüística:

| Metrica | Valor | Herramienta de medida | Direccion deseable |
|---|---|---|---|
| AdvBench ASR | 0,0788 | Juez de HarmBench | Mas bajo es mejor |
| StrongREJECT ASR | 0,0671 | Juez de HarmBench | Mas bajo es mejor |
| Sobre-rechazo macro | 0,2497 | WildGuard | Mas bajo es mejor |
| Perplejidad WikiText-2 | 19,4271 | WikiText-2 | Mas bajo es mejor |

No se proporcionan en la información disponible los valores equivalentes para el modelo base `meta-llama/Meta-Llama-3-8B-Instruct`, por lo que no es posible calcular aquí la magnitud exacta del daño o de la recuperación.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa: en torno a 16 GB solo para pesos (8,03 mil millones de parámetros en fp16/bf16), más caché KV y activaciones; el repositorio ocupa 16,1 GB.
- Caché KV: con arquitectura Llama 3 de 8B (32 capas, 8 cabezas KV, dimensión de cabeza 128), la caché ronda los 128 KiB por token en fp16, aproximadamente 1 GB para una ventana completa de 8.192 tokens, además del *batch* concurrente.
- GPU recomendadas para servicio: A100 40/80 GB, H100 80 GB o L40S 48 GB para fp16/bf16 con concurrencia y contexto completo.
- GPU consumer: una RTX 4090 o RTX 3090 de 24 GB debería poder cargar los pesos en bf16, pero con margen ajustado para contexto largo y *batching*; en GPUs de 16 GB (RTX 4080) o 12 GB (RTX 3060) sería necesario cuantizar a 8 o 4 bits.
- Cuantización: no se distribuyen pesos cuantizados, así que habría que generarlos; al tratarse de un modelo con estructura SVD, conviene verificar que la conversión a GGUF/AWQ/GPTQ no rompa las proyecciones de rango reducido.
- Opciones de despliegue: la librería declarada es `transformers`; el repositorio incluye las etiquetas `text-generation-inference` y `endpoints_compatible`, lo que sugiere compatibilidad con TGI y con *endpoints* gestionados. Compatibilidad con vLLM, llama.cpp u Ollama: no disponible, no verificada.
- Latencia y *throughput*: no disponible, no se publican mediciones.

## Comparativa con modelos similares

No se han proporcionado datos de rendimiento de los modelos alternativos en la información disponible, por lo que la comparación se limita a lo declarado para este checkpoint. Los modelos de la misma categoría (8B, decoder-only, orientados a instrucciones) serían el propio Llama-3-8B-Instruct y otros modelos abiertos de tamaño comparable.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|---|
| svd-safety-l3_swift_remove30_swapgapiter_evfront_b010 | 8.030.261.248 (fraccion declarada 0,7003) | 8.192 tokens (heredado del base) | Llama 3 Community | safetensors | HuggingFace, 0 descargas | ASR y perplejidad en la model card; sin MMLU/HumanEval/GSM8K |
| meta-llama/Meta-Llama-3-8B-Instruct | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Llama 3 Community (conocimiento general, no verificado aqui) | no disponible en la informacion proporcionada | HuggingFace | no disponible en la informacion proporcionada |
| Llama-3.1-8B-Instruct | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | HuggingFace | no disponible en la informacion proporcionada |
| Mistral-7B-Instruct-v0.3 | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | HuggingFace | no disponible en la informacion proporcionada |

La ventaja diferencial de este checkpoint frente a cualquier alternativa no es de rendimiento, sino de propósito: ninguno de los modelos comparables documenta un *pipeline* de compresión SVD con reparación mediante intercambio neutro en parámetros ni publica métricas de seguridad medidas con HarmBench y WildGuard.

## Limitaciones y advertencias

- Artefacto de investigación, no asistente desplegable: la propia model card indica explícitamente que es una celda de una rejilla experimental y que debe evaluarse antes de extraer conclusiones.
- Degradación de seguridad deliberada en algunas variantes del estudio: la compresión por sí sola eleva la tasa de éxito de ataque, y varias ramas de la rejilla están degradadas a propósito respecto a Llama-3-8B-Instruct.
- Riesgo de cumplimiento de peticiones dañinas: la ASR de 0,0788 en AdvBench y 0,0671 en StrongREJECT implica que una parte de los ataques tiene éxito; no es un modelo apto para aplicaciones orientadas al público sin filtros adicionales.
- Sobre-rechazo elevado: 0,2497 macro medido con WildGuard, lo que se traduce en rechazos injustificados de peticiones legítimas y una experiencia de usuario degradada si se desplegase en chat.
- Alucinación: no se han publicado evaluaciones de veracidad ni de fidelidad factual; la perplejidad de 19,4271 en WikiText-2 es superior a la esperable en el modelo base, lo que sugiere pérdida de calidad de modelado del lenguaje.
- Cobertura de idiomas desconocida: no se declaran idiomas soportados, así que el comportamiento multilingüe es impredecible y no verificado.
- Limitaciones de contexto: no se documenta una ventana ampliada; hay que asumir la del modelo base (8.192 tokens) salvo verificación empírica.
- Estructura de pesos potencialmente no estándar: al derivar de descomposición SVD con restauración parcial de componentes, los *runtimes* de inferencia podrían no cargar el modelo correctamente o no soportar su rango efectivo reducido.
- Restricciones de licencia: se aplica la Meta Llama 3 Community License, con `LICENSE` y `USE_POLICY.md` vinculantes; incluye cláusulas de atribución («Built with Meta Llama 3») y condiciones específicas para despliegues a gran escala que hay que revisar antes de cualquier uso comercial.
- Madurez y validación comunitaria nulas: 0 descargas y 0 likes, actualizado el mismo día de su creación, sin discusión ni verificación independiente.
- Sin garantías de reproducibilidad fuera del entorno del autor: aunque se documentan semilla, rondas y presupuestos, no se publican scripts de evaluación ni el código del *pipeline* en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l3_swift_remove30_swapgapiter_evfront_b010
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia y política de uso: archivos `LICENSE` y `USE_POLICY.md` incluidos en el repositorio del modelo
- SVD-LLM: método de compresión citado en la model card, sin enlace proporcionado en la información disponible
- HarmBench, StrongREJECT y WildGuard: herramientas de evaluación citadas en la model card, sin enlaces proporcionados en la información disponible
- Paper, blog o repositorio del estudio: no disponible
- Demo o *space*: no disponible
- Búsqueda web: los resultados devueltos no guardan relación con el modelo (páginas institucionales de la Administración neerlandesa), por lo que no se han podido incorporar enlaces adicionales relevantes
