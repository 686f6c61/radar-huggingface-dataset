# dhanesh-hf/Jarvis-Titan-M3-UltraLong-Adapter

## Resumen

Jarvis-Titan-M3-UltraLong-Adapter es un adaptador de destilación publicado por el usuario dhanesh-hf sobre el modelo base dhanesh-hf/Jarvis-Titan-V14-MoE-Merged, un MoE de 14,75B parámetros construido con arquitectura DeepSeekMoE y memoria Tri-Brid. El adaptador corresponde al hito M3 (fase 3) del proyecto J.A.R.V.I.S. Titan y su función concreta es convertir la atención densa del modelo base en atención de ventana deslizante con W=2048 tokens, manteniendo el acceso a contexto largo mediante tres niveles de memoria (ventana local, reservorio saliente y memoria neural Titans).

El adaptador tiene 90.044.458 parámetros entrenables y se ha entrenado sobre 20.012.495 tokens procedentes del dataset jarvis-v10-rft-dataset, descrito por el autor como artículos revisados por pares y código real (no sintético tipo NIAH). El entrenamiento se realizó en Google Cloud TPU v5e-8, con el modelo base congelado al 100 % y pérdida de destilación combinada de entropía cruzada y divergencia KL con temperatura T=2.0.

Es relevante porque ejemplifica una línea de trabajo poco frecuente en modelos abiertos: reducir el coste de la caché KV en inferencia de contexto largo mediante atención híbrida y memoria externa, en lugar de escalar el contexto de atención densa. El repositorio ocupa 0,2 GB, tiene licencia Apache 2.0 y, en el momento de la consulta, no registra descargas ni likes, por lo que debe considerarse material de investigación preliminar y no un modelo validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepSeekMoE con memoria Tri-Brid (sliding window attention + reservorio saliente + Titans neural memory) |
| Parametros totales | 14,75B en el modelo base; 90.044.458 (90,04M) en el adaptador |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el adaptador fija una ventana deslizante de W=2048 tokens y delega el contexto largo en la memoria Tri-Brid) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (repositorio de 0,2 GB con library_name: transformers) |
| Modelo base | dhanesh-hf/Jarvis-Titan-V14-MoE-Merged |
| Adaptador de inicializacion | dhanesh-hf/Jarvis-Titan-M2-TriBrid-Adapter |
| Dataset de entrenamiento | dhanesh-hf/jarvis-v10-rft-dataset (20.012.495 tokens) |
| Hardware de entrenamiento | Google Cloud TPU v5e-8 |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo base es un MoE de 14,75B parámetros de tipo DeepSeekMoE al que se le superpone una arquitectura de memoria denominada Tri-Brid, con tres niveles. El nivel 1 es atención de ventana deslizante con W=2048 tokens, que limita la caché KV a aproximadamente 115 MB. El nivel 2 es un reservorio saliente de R=1024 slots, con 28 cabezas de consulta y 4 cabezas de clave/valor. El nivel 3 es una memoria neural Titans de dimensión d=512 implementada con un kernel Pallas sobre la VMEM/SRAM de la TPU. La fusión de los tres niveles se realiza mediante una compuerta triple adaptativa (MAG-3) con parámetros g_local, g_res y g_mem. Los puentes de memoria se insertan en las capas estratégicas [3, 7, 11, 15, 19, 23, 27], siete en total.

El entrenamiento es una destilación desde atención densa completa hacia atención de ventana deslizante. El modelo base permanece congelado al 100 % y solo se entrenan los 90,04M parámetros del adaptador, inicializado desde el adaptador Tri-Brid de la fase 2. La función de pérdida combina entropía cruzada y divergencia KL con temperatura, con un peso de 0,5 para cada término y T=2.0. El volumen de entrenamiento es de 20.012.495 tokens, una cifra reducida para un proceso de destilación de este tipo, lo que conviene tener en cuenta al evaluar la robustez del resultado. La innovación principal declarada es el uso de un kernel Pallas específico para TPU que explota la SRAM/VMEM como almacenamiento de la memoria neural, algo poco habitual en adaptadores publicados para transformers.

## Capacidades

- Generación de texto con pipeline text-generation, orientada a razonamiento y flujos agénticos según las etiquetas del autor (reasoning, agentic).
- Procesamiento de contexto largo mediante memoria Tri-Brid, con ventana deslizante de 2048 tokens y reservorio de 1024 slots.
- Razonamiento multi-paso y encadenamiento de pasos, declarado en las etiquetas del repositorio.
- Capacidad de destilación de atención: el adaptador transforma atención densa en atención local con memoria auxiliar, lo que es en sí mismo una capacidad del artefacto más que del modelo final.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible.
- Modo thinking explícito: no disponible.
- Idiomas soportados: no disponible (la model card no declara cobertura lingüística).

## Casos de uso

- Investigación en eficiencia de atención: el adaptador permite reproducir y auditar experimentalmente la conversión de atención densa a atención de ventana deslizante con memoria externa, comparando la pérdida de calidad respecto al modelo base congelado. Es su uso más directo y realista, dado que es un artefacto de investigación con 0 descargas.
- Análisis de documentos técnicos largos: artículos científicos, patentes o documentación de código que superen la ventana de 2048 tokens podrían procesarse apoyándose en los siete puentes de memoria y el reservorio saliente de 1024 slots, siempre que se valide empíricamente la retención de información en cada caso.
- Despliegue en entornos con memoria limitada: al fijar la caché KV en torno a 115 MB con W=2048, el modelo reduce de forma sustancial el coste de memoria por secuencia frente a atención densa, lo que resulta relevante para servir muchas peticiones concurrentes en una sola GPU.
- Prototipado de agentes con memoria de trabajo: la combinación de reservorio saliente y memoria Titans encaja con tareas de agente que necesitan recordar hechos clave de una sesión larga sin recomputar el contexto completo.
- Experimentación sobre Pallas y TPU: el kernel de memoria neural está escrito para la VMEM/SRAM de TPU v5e, por lo que el repositorio sirve como referencia técnica para quien desarrolle kernels Pallas personalizados.
- Evaluación comparativa de estrategias de contexto largo: sirve como punto de comparación frente a modelos densos con contexto extendido, siempre que se mida con un conjunto de evaluación propio, ya que no hay benchmarks publicados.
- Fine-tuning posterior sobre el adaptador: al ser un adaptador de 90M parámetros con licencia Apache 2.0, es viable entrenar variantes adicionales sobre él sin tocar los pesos del modelo base congelado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de evaluación de contexto largo (por ejemplo RULER o LongBench), y la búsqueda web asociada no ha devuelto ningún resultado relevante sobre este modelo.

## Requisitos de hardware

- El adaptador en sí ocupa muy poco: 90,04M parámetros, aproximadamente 0,18 GB en fp16 y unos 0,36 GB en fp32. El repositorio completo pesa 0,2 GB.
- El coste real de inferencia lo determina el modelo base de 14,75B parámetros de tipo MoE. Como referencia orientativa calculada, en fp16 el modelo completo ronda los 29-30 GB de VRAM, mientras que en cuantizaciones de 8 bits bajaría a unos 15 GB y en 4 bits a unos 8-9 GB. Estas cifras son estimaciones derivadas del número de parámetros, no datos publicados en la model card.
- Con esos órdenes de magnitud, el modelo no cabe en GPU de consumo en fp16. En 4 bits podría encajar en tarjetas de 12-16 GB, como una RTX 4070 Ti o una RTX 4090, siempre que la implementación soporte la arquitectura MoE y el adaptador correctamente.
- Para fp16 o bf16 sin cuantizar hacen falta GPUs profesionales: A100 40/80 GB, H100 80 GB o L40S, entre otras.
- La caché KV es reducida por diseño: la ventana de 2048 tokens la limita a unos 115 MB según el autor, lo que alivia la presión de memoria en secuencias largas.
- Opciones de despliegue: la model card declara library_name transformers. No se documentan integraciones con vLLM, llama.cpp, Ollama, TGI ni SGLang, y la combinación de kernels Pallas y memoria Titans hace poco probable que funcione sin adaptaciones en motores de inferencia genéricos.
- El kernel Pallas de memoria neural está escrito para Google Cloud TPU v5e; en GPU no hay ruta de ejecución confirmada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Los datos del modelo comparado proceden de sus respectivas fichas públicas y se incluyen solo como orientación. Para Jarvis-Titan-M3-UltraLong-Adapter, los parámetros activos y el contexto efectivo no están publicados, lo que limita la comparación directa.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jarvis-Titan-M3-UltraLong-Adapter | 14,75B (base) + 90,04M (adaptador) | no disponible | no disponible (ventana deslizante W=2048) | Apache 2.0 | Repositorio HuggingFace, 0 descargas |
| DeepSeek-V2-Lite | 15,7B | 2,4B | 32K | MIT | Ampliamente desplegado |
| Mixtral 8x7B | 46,7B | 12,9B | 32K | Apache 2.0 | Ampliamente desplegado |
| Qwen2.5-14B | 14,7B | denso (14,7B) | 128K | Apache 2.0 | Ampliamente desplegado |

La diferencia principal no está en el tamaño, sino en el enfoque: frente a los tres alternativas, que resuelven el contexto largo con atención densa o ventanas ampliadas, Jarvis Titan M3 apuesta por ventana deslizante corta más memoria externa. No hay datos públicos de rendimiento que permitan afirmar cuál de los enfoques funciona mejor en tareas reales.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna métrica publicada de calidad, razonamiento, código o contexto largo, por lo que no se puede verificar la degradación introducida por la destilación desde atención densa.
- Volumen de entrenamiento reducido: 20.012.495 tokens para destilar un cambio de mecanismo de atención es una cantidad baja, lo que aumenta el riesgo de que la memoria Tri-Brid no generalice fuera de la distribución del dataset jarvis-v10-rft-dataset.
- Repositorio sin adopción: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.
- Idiomas no declarados: no hay información sobre cobertura multilingüe, por lo que el comportamiento en castellano es desconocido y debe evaluarse antes de usarlo en producción.
- Riesgo de alucinación: no evaluado ni documentado en la información disponible. Los mecanismos de memoria con reservorio pueden además recuperar información obsoleta o irrelevante si la compuerta adaptativa MAG-3 no acierta.
- Dependencia de hardware específico: el kernel de memoria Titans está implementado en Pallas para TPU v5e. La viabilidad en GPU no está documentada.
- Compatibilidad de despliegue limitada: no se confirman soporte en vLLM, llama.cpp, Ollama ni TGI. La integración con transformers requiere que la implementación de la arquitectura Tri-Brid esté disponible, y no se detalla en la model card.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el comportamiento del modelo, y el modelo base tiene su propia ficha que conviene revisar antes de redistribuir.
- Nomenclatura engañosa: el nombre del repositorio incluye "14.8B" y "UltraLong", pero el artefacto publicado son 90,04M parámetros de adaptador sobre un modelo base congelado, no un modelo de 14,8B entrenado de cero.
- Sesgos conocidos: no disponible. No se documenta ninguna evaluación de sesgo, toxicidad o alineación.
- Fechas del repositorio: creado y actualizado el 12 de septiembre de 2026, con solo cuatro segundos entre ambos eventos, lo que sugiere una subida automatizada o de prueba.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dhanesh-hf/Jarvis-Titan-M3-UltraLong-Adapter
- Modelo base: https://huggingface.co/dhanesh-hf/Jarvis-Titan-V14-MoE-Merged
- Adaptador de inicialización (fase 2): https://huggingface.co/dhanesh-hf/Jarvis-Titan-M2-TriBrid-Adapter
- Dataset de entrenamiento: https://huggingface.co/datasets/dhanesh-hf/jarvis-v10-rft-dataset
- Paper, blog o demo oficial: no disponible
- Nota sobre la búsqueda web: los resultados obtenidos no guardan ninguna relación con el modelo (recetas de cocina) y se han descartado por no ser fuentes válidas.
