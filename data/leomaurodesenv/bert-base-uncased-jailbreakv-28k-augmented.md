# leomaurodesenv/bert-base-uncased-jailbreakv-28k-augmented

## Resumen

`leomaurodesenv/bert-base-uncased-jailbreakv-28k-augmented` es un ajuste fino de `google-bert/bert-base-uncased` publicado por el usuario leomaurodesenv para clasificación de texto, presumiblemente orientado a la detección de prompts de tipo jailbreak. El nombre del checkpoint y del model-index (`bert-base-uncased-jailbreakv-28k`) apunta al conjunto de datos JailbreakV-28K, aunque la propia model card declara literalmente que el entrenamiento se hizo "on an unknown dataset" y no documenta la composición de las clases.

Se trata de un encoder transformer bidireccional de 109.483.778 parámetros (aproximadamente 0,4 GB de repositorio), con una ventana máxima de 512 tokens, licencia Apache 2.0 y pesos en formato safetensors. Su relevancia práctica es la de cualquier clasificador ligero de guardarraíles: puede ejecutarse en CPU o en GPU de gama baja y actuar como filtro previo de prompt injection o jailbreak delante de un LLM generativo mucho más costoso.

El dato más llamativo de la ficha es su métrica declarada: accuracy 1.0 y validation loss 0.0000 constante desde la primera época. No hay benchmarks estándar publicados, la model card está generada automáticamente por el Trainer y el modelo acumula 0 descargas y 2 likes, por lo que debe considerarse un artefacto experimental sin validación externa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base: transformer encoder bidireccional, 12 capas, 768 de dimensión oculta, 12 cabezas de atención y cabecera de clasificación sobre el token [CLS] |
| Parametros totales | 109.483.778 (dato real del repositorio en safetensors) |
| Parametros activos | No aplica: no es un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | 512 tokens (límite de las embeddings posicionales absolutas de bert-base-uncased) |
| Tipos de cuantizacion | No se publican versiones cuantizadas en el repositorio. Al ser un encoder de 109 M de parámetros es convertible a int8/ONNX con Optimum o a GGUF con herramientas de la comunidad, pero no hay artefactos verificados para este checkpoint |
| Idiomas soportados | No disponible en la ficha. El modelo base bert-base-uncased se entrenó sobre todo con texto en inglés (Wikipedia en inglés y BooksCorpus) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (etiqueta del repositorio); compatible con la librería transformers |

Otros datos del repositorio: pipeline `text-classification`, tamaño del repo 0,4 GB, creado el 2026-09-13 y actualizado el 2026-09-13, etiquetas `text-embeddings-inference` y `endpoints_compatible`.

## Arquitectura y entrenamiento

La arquitectura es la de BERT base sin modificaciones estructurales: 12 capas de encoder con autoatención multi-cabeza bidireccional (768 dimensiones, 12 cabezas, 110 M de parámetros en total, 109,48 M en este checkpoint por el tamaño de la cabecera de clasificación) y embeddings posicionales absolutas que limitan la entrada a 512 tokens. Sobre el modelo base se ha añadido una cabecera de clasificación de secuencia, con un número de etiquetas no documentado en la ficha.

El ajuste fino se realizó con el Trainer de HuggingFace y los siguientes hiperparámetros: learning rate 2e-05, train batch size 8 con gradient accumulation de 2 pasos (batch efectivo 16), eval batch size 8, semilla 42, optimizador adamw_torch_fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 50 pasos de warmup y 10 épocas. El registro muestra 1121 pasos por época y 11.210 pasos totales, lo que implica aproximadamente 17.900 ejemplos de entrenamiento (1121 × 16) según el batch efectivo declarado; la composición del dataset no se detalla. Las versiones de framework son Transformers 5.2.0, PyTorch 2.10.0+cu128, Datasets 4.5.0 y Tokenizers 0.22.2. No se documenta ningún uso de RLHF, DPO ni ninguna innovación técnica adicional (atención lineal, decodificación especulativa, etc.).

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, con una cabecera sobre la representación del token [CLS] orientada presumiblemente a distinguir prompts benignos de prompts maliciosos o jailbreaks.
- Detección de prompt injection y jailbreak: el nombre del checkpoint lo vincula al corpus JailbreakV-28K, por lo que su uso previsto es la identificación de intentos de eludir las salvaguardas de un LLM.
- Extracción de embeddings: al derivar de BERT base, puede utilizarse como encoder de frases para similitud, clustering o búsqueda semántica, aunque no está ajustado específicamente para ello.
- Procesamiento por lotes de baja latencia: 109 M de parámetros y 512 tokens de contexto permiten clasificar lotes grandes en CPU o en GPU modesta.
- Soporte de tool calling / function calling: no disponible; es un modelo de clasificación, no genera texto ni llamadas a herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible; no es un modelo generativo ni de razonamiento.
- Capacidades multilingües: no documentadas; hereda el sesgo hacia el inglés del modelo base.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Idiomas y etiquetas: la model card no especifica el conjunto de etiquetas ni la cardinalidad de la clasificación.

## Casos de uso

- Guardarraíl de entrada en aplicaciones LLM: el clasificador se coloca delante de un modelo generativo para puntuar el prompt del usuario y bloquear intentos de jailbreak antes de gastar tokens de inferencia, algo viable por su bajo coste computacional.
- Filtrado de prompts en una API pública: integrado en el gateway (FastAPI, Kong, NGINX con módulo de inferencia) puede descartar peticiones hostiles en el momento de la autenticación, con latencias de milisegundos en CPU.
- Moderación de comunidades y foros: clasificación por lotes de mensajes o hilos para marcar contenido que intente manipular asistentes desplegados en la propia plataforma.
- Curación y etiquetado de datasets de seguridad: uso como preanotador en pipelines de anotación de corpus adversarios, revisando después las predicciones con anotadores humanos para corregir falsos positivos.
- Investigación en robustez de LLM: generación de conjuntos de ataques y medición de la tasa de detección frente a variantes (traducción, ofuscación, codificación) como línea base frente a clasificadores mayores.
- Enrutado de tráfico en un sistema multi-modelo: enviar los prompts clasificados como de riesgo a un modelo con políticas más estrictas y el resto al modelo por defecto, optimizando coste y seguridad.
- Evaluación comparativa de guardarraíles: al ser un BERT pequeño, sirve como línea base ligera frente a clasificadores basados en DeBERTa o en LLM dedicados en términos de latencia, coste y capacidad de despliegue en el borde.

## Benchmarks y rendimiento

Los únicos resultados disponibles son los declarados por el autor para el conjunto de evaluación, y cubren exclusivamente pérdida y accuracy. No hay datos de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar, ni comparaciones con modelos similares en la información disponible.

| Metrica | Valor declarado |
|---|---|
| Loss (evaluacion) | 0.0000 |
| Accuracy (evaluacion) | 1.0 |

Progresión declarada por época (idéntica en las 10 épocas):

| Epoca | Training loss | Validation loss | Accuracy |
|---|---|---|---|
| 1.0 | 0.0001 | 0.0000 | 1.0 |
| 2.0 | 0.0000 | 0.0000 | 1.0 |
| 3.0 | 0.0000 | 0.0000 | 1.0 |
| 4.0 | 0.0000 | 0.0000 | 1.0 |
| 5.0 | 0.0000 | 0.0000 | 1.0 |
| 6.0 | 0.0000 | 0.0000 | 1.0 |
| 7.0 | 0.0000 | 0.0000 | 1.0 |
| 8.0 | 0.0000 | 0.0000 | 1.0 |
| 9.0 | 0.0000 | 0.0000 | 1.0 |
| 10.0 | 0.0000 | 0.0000 | 1.0 |

La accuracy perfecta y la pérdida nula desde la primera época son indicios de un problema trivial, de fuga de datos entre entrenamiento y evaluación o de un conjunto de validación mal construido; deben tratarse como no representativos del rendimiento en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 unos 0,44 GB de pesos; en fp16/bf16 unos 0,22 GB; en int8 alrededor de 0,11 GB. Con lotes pequeños y 512 tokens, las activaciones añaden un consumo marginal.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria es suficiente (GTX 1050 Ti, GTX 1650, T4, RTX 3060, RTX 4090, A100, H100). El modelo está claramente sobredimensionado para estas GPUs: el cuello de botella no será la memoria.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU de consumo de los últimos diez años, e incluso en iGPU o en CPU con varias decenas de hilos.
- Opciones de despliegue: pipeline de transformers, Optimum/ONNX Runtime para aceleración en CPU, TorchScript o exportación a ONNX, servidores de inferencia genéricos (FastAPI + Uvicorn, Triton, Ray Serve) y las etiquetas del repositorio (`text-embeddings-inference`, `endpoints_compatible`) indican compatibilidad con Inference Endpoints de HuggingFace. No hay integración documentada con vLLM ni con llama.cpp para este checkpoint.
- Latencia y throughput estimados: no disponible en la información proporcionada. No se publican mediciones de latencia ni de tokens por segundo, y en un clasificador de secuencia la métrica relevante (muestras por segundo) dependería del hardware y del backend.

## Comparativa con modelos similares

No se han encontrado en la información disponible clasificadores de jailbreak comparables con datos publicados. La comparación se limita al modelo base del que deriva este ajuste.

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bert-base-uncased-jailbreakv-28k-augmented | 109.483.778 | 512 tokens | Accuracy 1.0 y loss 0.0000 en su conjunto de evaluación (no verificado) | apache-2.0 | HuggingFace, 0 descargas y 2 likes en el momento de la consulta |
| google-bert/bert-base-uncased | 110 M | 512 tokens | Modelo base preentrenado, sin cabecera de clasificación de jailbreak | apache-2.0 | Ampliamente disponible y ampliamente validado |
| Otros clasificadores de jailbreak (DeBERTa, Llama Guard y similares) | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |

## Limitaciones y advertencias

- La accuracy de 1.0 y la pérdida de validación de 0.0000 no son creíbles como indicador de rendimiento real; apuntan a solapamiento entre entrenamiento y validación, a un conjunto de evaluación trivial o a un error de construcción del split.
- La model card es automática y contiene el marcador "More information needed" en las secciones de descripción, usos previstos y datos de entrenamiento: no hay documentación sobre la composición del dataset ni sobre el significado de las etiquetas.
- El nombre del checkpoint sugiere el corpus JailbreakV-28K, pero la ficha declara explícitamente que el entrenamiento se hizo sobre un dataset desconocido; no se puede asumir la procedencia de los datos.
- Sesgos conocidos: no se publica ninguna evaluación de sesgos. El modelo base está sesgado hacia el inglés y hacia el registro de Wikipedia y BooksCorpus, por lo que el rendimiento fuera de ese dominio es incierto.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea (falsos positivos que bloqueen a usuarios legítimos y falsos negativos que dejen pasar ataques).
- Limitación de contexto: 512 tokens fijos. Los prompts de jailbreak largos o con relleno se truncarán, con la consiguiente pérdida de señal.
- Limitación de idioma: sin datos multilingües ni evaluación en castellano; el uso en producción en español no está respaldado por ninguna métrica.
- Robustez: los ataques adversariales (homoglifos, base64, cambios de idioma, role-play anidado) suelen degradar con fuerza a clasificadores BERT pequeños; no hay evaluación de robustez publicada.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificación y redistribución con atribución, sin cláusulas de uso aceptable específicas en la información disponible.
- Advertencia de producción: con 0 descargas y 2 likes, el modelo carece de validación por parte de la comunidad. No debería ser el único mecanismo de defensa de un sistema; conviene combinarlo con otras capas de filtrado y con evaluación propia sobre datos representativos del dominio objetivo.
- Piezas del entorno declaradas (Transformers 5.2.0, PyTorch 2.10.0, Datasets 4.5.0, Tokenizers 0.22.2) pueden dificultar la reproducibilidad exacta del ajuste con versiones actuales del ecosistema.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/leomaurodesenv/bert-base-uncased-jailbreakv-28k-augmented
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Búsqueda web realizada: no se han encontrado enlaces relevantes al modelo (paper, blog, repositorio o demo). Los resultados devueltos corresponden a páginas de Vinted y no guardan relación con el modelo, por lo que se omiten.
