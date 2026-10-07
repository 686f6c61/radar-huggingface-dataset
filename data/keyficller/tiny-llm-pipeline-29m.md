# KeyFicller/tiny-llm-pipeline-29m

## Resumen

El modelo `KeyFicller/tiny-llm-pipeline-29m` es un modelo de lenguaje de tipo decoder-only para generación de texto en chino, con aproximadamente 29 millones de parámetros, publicado por el usuario KeyFicller. Corresponde a la configuración MiniMind2-Small (vocabulario de 6400 tokens, anchura oculta de 512 y 8 capas) y se distribuye como un snapshot de los pesos resultantes de tres etapas de entrenamiento: preentrenamiento por predicción del siguiente token, ajuste por instrucciones (SFT) y alineación mediante DPO hacia un registro conversacional de estilo "Doubao".

El interés del artefacto es fundamentalmente académico y didáctico: no es un modelo de propósito general listo para producción, sino una instantánea reproducible de un pipeline de entrenamiento completo (preentrenamiento, SFT y DPO) sobre un corpus chino, con las métricas de validación documentadas en la propia model card. El repositorio pesa 0,3 GB e incluye los checkpoints de las tres etapas junto con los registros de entrenamiento, lo que lo convierte en un material útil para estudiar cómo evoluciona la perplejidad a lo largo del ciclo de ajuste.

La relevancia actual es la de los modelos "tiny" como banco de pruebas: con 29M de parámetros se puede entrenar, ajustar y evaluar de extremo a extremo en hardware de consumo, lo que permite validar técnicas de alineación y de pipeline antes de escalarlas a modelos mayores. La licencia no está declarada, el idioma soportado es únicamente el chino (`zh`) y el repositorio registra 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, configuración MiniMind2-Small (anchura 512, 8 capas) |
| Parametros totales | ~29 M |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; los pesos se publican sin cuantizar en formato PyTorch |
| Idiomas soportados | Chino (`zh`) |
| Licencia | No disponible |
| Formato de pesos | PyTorch: ficheros `ckpt.pt` por etapa (dict con `model`, `cfg`, `step`, `seed`, `tokenizer_hash`, `tokens` y `cursor`); tokenizador en `tokenizer/tokenizer.json` |
| Vocabulario | 6400 tokens |
| Etapas publicadas | `pretrain` (paso 34500), `sft` (paso 5000), `dpo` (paso 104) |
| Tamaño del repositorio | 0,3 GB |
| Libreria declarada | PyTorch |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only autorregresivo de tipo denso, con la configuración MiniMind2-Small declarada explícitamente por el autor: vocabulario de 6400 tokens, dimensión de modelo de 512 y 8 capas. No se documentan en la información disponible el número de cabezas de atención, el uso de GQA/MQA, el tipo de normalización, la función de activación ni la longitud de contexto máxima; tampoco se especifica si emplea embeddings atados o decodificación especulativa.

El entrenamiento se estructura en tres etapas encadenadas. La primera es un preentrenamiento de predicción del siguiente token que alcanza el paso 34500 con una perplejidad de validación de 11,8. La segunda es un ajuste por instrucciones (SFT) de 5000 pasos, que reduce la perplejidad sobre las respuestas del conjunto de retención de 38,15 a 6,34. La tercera es una alineación por DPO de solo 104 pasos orientada a reproducir un registro de voz "estilo Doubao"; el contorno de estilo utilizado vive en el repositorio de origen, bajo `artifacts/prefs/`. Los datos de entrenamiento proceden del dataset `jingyaogong/minimind_dataset`. Los checkpoints publicados conservan `model`, `cfg`, `step`, `seed`, `tokenizer_hash`, `tokens` y `cursor`, pero tienen el estado del optimizador eliminado, por lo que no permiten reanudar el entrenamiento aunque sí la inferencia; según el autor, los tensores son idénticos a los del entrenamiento original.

## Capacidades

- Generación de texto en chino: es la única lengua declarada en las etiquetas del repositorio.
- Predicción del siguiente token y continuación de secuencias cortas, con una perplejidad de validación de 11,8 en la etapa de preentrenamiento sobre el corpus empleado.
- Seguimiento de instrucciones básico tras la etapa de SFT (perplejidad de 6,34 sobre respuestas de retención).
- Estilo conversacional alineado por DPO hacia un registro concreto ("estilo Doubao") durante 104 pasos.
- Razonamiento, código, matemáticas, visión o audio: no disponibles; no hay evidencia ni declaración al respecto en la información proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no; el modelo está etiquetado exclusivamente como `zh`.
- Modo "thinking": no disponible.

## Casos de uso

- Investigación sobre pipelines de entrenamiento: el snapshot incluye los tres checkpoints (`pretrain`, `sft`, `dpo`) junto con `train_log.jsonl`, lo que permite reproducir y comparar la curva de perplejidad entre etapas sin reentrenar desde cero.
- Estudio de alineación con DPO en modelos diminutos: con solo 104 pasos de DPO sobre un modelo de 29M de parámetros, sirve como caso de estudio de bajo coste para medir el efecto del ajuste de preferencias sobre el estilo de generación.
- Validación de infraestructura antes de escalar: al caber en cualquier GPU de consumo e incluso en CPU, permite ensayar el bucle de inferencia, la carga del tokenizador y la gestión de checkpoints en un entorno controlado antes de migrar a modelos mayores.
- Pruebas de regresión de código de inferencia: los pesos son tensorialmente idénticos a los del entrenamiento original, de modo que resultan útiles como referencia fija para verificar que una refactorización del código de carga (`Bundle.load()`) no altera las salidas.
- Experimentos de decodificación y penalización de repetición: el autor indica que es obligatorio fijar `repetition_penalty` entre 1,3 y 1,5, lo que lo convierte en un banco de pruebas barato para estudiar bucles degenerativos en modelos pequeños.
- Docencia y prácticas de PLN: su tamaño (0,3 GB de repositorio, 29M de parámetros) permite que un estudiante complete un ciclo de carga, generación y evaluación en un portátil sin GPU dedicada.
- Generación de texto en chino con restricciones severas de recursos: aplicable a prototipos de autocompletado o respuesta corta en entornos embebidos, siempre que se acepte la calidad limitada de un modelo de 29M de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos numéricos aportados por el autor son métricas internas de entrenamiento, que no son comparables con MMLU, HumanEval, GSM8K ni similares:

| Metrica (interna del pipeline) | Valor |
|---|---|
| Perplejidad de validación en `pretrain` (paso 34500) | 11,8 |
| Perplejidad de respuestas en retención antes de SFT | 38,15 |
| Perplejidad de respuestas en retención tras SFT (paso 5000) | 6,34 |
| Pasos de DPO | 104 |

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir del recuento de parámetros (~29M): en FP32, en torno a 116 MB; en FP16/BF16, en torno a 58 MB; en INT8, en torno a 29 MB; en INT4, en torno a 15 MB. Son estimaciones de peso de los parámetros; no incluyen caché KV ni overhead del runtime, que no se documentan.
- Cabe con holgura en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU con memoria unificada.
- A100 y H100 son innecesarias para este tamaño; solo tendrían sentido para entrenamiento a gran escala o para servir muchísimas réplicas en paralelo.
- Ejecución en CPU viable: con 29M de parámetros la inferencia en CPU es práctica para prototipos, aunque no se dispone de cifras de latencia.
- Opciones de despliegue: los pesos se publican como `ckpt.pt` en formato PyTorch personalizado, por lo que la vía natural es el código del proyecto de origen (`Bundle.load()`, del repositorio AEFS-Capstones). No se ofrecen pesos en safetensors ni en GGUF, de modo que su uso directo con llama.cpp, Ollama o TGI requeriría una conversión previa no documentada. Tampoco se documenta compatibilidad con vLLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La única referencia de comparación explícita en la información disponible es la configuración MiniMind2-Small, que el propio autor cita como origen de la arquitectura. No hay datos de rendimiento comparativos con otros modelos tiny:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| tiny-llm-pipeline-29m | ~29 M | No disponible | No disponible | HuggingFace (0 descargas, 0 likes); pesos en PyTorch |
| MiniMind2-Small (config de referencia) | Misma configuración declarada (vocab 6400, anchura 512, 8 capas) | No disponible en la información proporcionada | No disponible | Repositorio del proyecto MiniMind |
| Alternativas tiny de la misma categoría (por ejemplo, modelos de menos de 1B de parámetros orientados a chino o multilingüe) | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificables en las fuentes consultadas para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Idiomas: el modelo está etiquetado exclusivamente para chino (`zh`); no hay declaración de soporte para castellano ni para otras lenguas.
- Repetición degenerativa: el autor advierte de que la generación debe fijar `repetition_penalty` entre 1,3 y 1,5; sin ese parámetro, los pesos de la etapa DPO entran en bucle.
- Reproducibilidad: los pesos no son bit-reproducibles; MPS y CUDA difieren en las rutas de coma flotante, lo que puede producir salidas distintas según el backend.
- Reanudación de entrenamiento imposible: el estado del optimizador ha sido eliminado de los checkpoints, por lo que `--resume` no funciona. Solo se garantiza la inferencia.
- Calidad intrínseca: con ~29M de parámetros, la capacidad de razonamiento, el conocimiento factual y la coherencia en conversaciones largas son muy limitados; es esperable una tasa alta de alucinación y de errores gramaticales.
- Ausencia de benchmarks: no hay evaluación publicada sobre tareas estándar, por lo que no se puede estimar su calidad relativa frente a otros modelos.
- Licencia no declarada: al no especificarse licencia, no hay autorización explícita de uso comercial; en la práctica, la ausencia de licencia impide asumir derechos de redistribución o explotación comercial.
- Adopción nula: 0 descargas y 0 likes, sin validación por parte de la comunidad ni informes de terceros sobre su comportamiento.
- Formato propietario: al no publicarse en safetensors ni GGUF, la integración con tooling estándar (llama.cpp, Ollama, TGI, vLLM) no está soportada de forma directa.
- Advertencia sobre el contenido de la model card: el texto del autor se ha empleado únicamente como material de referencia descriptivo, no como instrucciones a ejecutar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KeyFicller/tiny-llm-pipeline-29m
- Repositorio de origen (proyecto tiny-llm-pipeline): https://github.com/KeyFicller/AEFS-Capstones/tree/main/projects/tiny-llm-pipeline
- Dataset de entrenamiento citado por el autor: https://huggingface.co/datasets/jingyaogong/minimind_dataset
- Listado de modelos de generación de texto de HuggingFace (único resultado adicional devuelto por la búsqueda web): https://huggingface.co/models?pipeline_tag=text-generation&p=1&sort=created
- Paper, blog o demo oficiales: no disponibles en la información proporcionada.
