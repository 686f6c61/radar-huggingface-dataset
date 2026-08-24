# shreshthsaini/brightrate-study-gemma4-e4b-sdr

## Resumen

El modelo `shreshthsaini/brightrate-study-gemma4-e4b-sdr` es un adaptador PEFT (LoRA) desarrollado por Shreshth Saini y colaboradores como parte del estudio BrightRate-LM, centrado en la evaluación de calidad perceptual sin referencia (no-reference) de vídeo HDR generado por usuarios. Se construye sobre el modelo base `google/gemma-4-E4B-it` de Google DeepMind, un modelo de la cuarta generación de la familia Gemma, y emplea un pipeline de tipo image-text-to-text: ocho fotogramas HDR muestreados uniformemente se convierten a un proxy SDR mediante tone-mapping y se pasan como imágenes en orden temporal para producir una puntuación de calidad (MOS).

El adaptador fue entrenado sobre el conjunto de datos BrightVQ, con dos épocas, una tasa de aprendizaje de 1e-4 y una configuración LoRA de rango 16, alpha 32 y dropout 0.05. En el conjunto de prueba de 420 vídeos de la división 0, alcanza un SROCC de 0.8624, PLCC de 0.8805, KRCC de 0.6811 y RMSE de 6.4313. Su relevancia radica en abordar un problema actual: la evaluación automática de calidad de vídeo HDR en entornos de contenido generado por usuarios, donde los métodos tradicionales de calidad de vídeo SDR no son directamente aplicables. El adaptador está pensado exclusivamente para investigación y no está calibrado para otros dominios o pipelines de visualización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT LoRA sobre el modelo base `google/gemma-4-E4B-it` (pipeline image-text-to-text) |
| Parametros totales | no disponible (el repositorio ocupa 0.2 GB, pero no se indica el número de parámetros del adaptador) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors, sin cuantización declarada) |
| Idiomas soportados | no disponible (el modelo base podría ser multilingüe, pero no se especifica) |
| Licencia | no disponible |
| Formato de pesos | safetensors (según los tags del repositorio) |

## Arquitectura y entrenamiento

El adaptador se implementa como un LoRA de rango 16 con alpha 32 y dropout 0.05, aplicado sobre el modelo base `google/gemma-4-E4B-it`. La entrada consiste en ocho fotogramas HDR muestreados uniformemente, convertidos a un proxy SDR mediante tone-mapping y presentados como imágenes en orden temporal. El modelo procesa esta secuencia y produce una puntuación de calidad perceptual (MOS) interpolada a través de cinco niveles de calidad.

El entrenamiento se realizó sobre la división 0 (content-separated) del conjunto de datos BrightVQ, con dos épocas completas y un horizonte de programación coseno de tres épocas. Se usó una tasa de aprendizaje de 1e-4, micro-batch de 1 y acumulación de gradientes de 8. Los objetivos MOS se interpolaron a partir de cinco palabras de calidad. No se menciona el uso de RLHF, DPO u otras técnicas de alineación; el entrenamiento es supervisado sobre las anotaciones de calidad del dataset. El código y la construcción de las entradas están disponibles en el repositorio BrightRate-LM.

## Capacidades

- Evaluación de calidad perceptual sin referencia de vídeo HDR: el modelo asigna una puntuación MOS a una secuencia de fotogramas HDR, sin necesidad de una referencia original.
- Procesamiento de secuencias de imágenes: acepta ocho fotogramas en orden temporal, lo que permite capturar información dinámica del vídeo.
- Salida numérica de calidad: produce una puntuación continua (MOS) en lugar de texto libre, adecuada para tareas de regresión.
- Adaptación específica a contenido generado por usuarios: entrenado con el dataset BrightVQ, diseñado para vídeo HDR de tipo UGC.
- Integración con el ecosistema Gemma: al ser un adaptador PEFT, se puede cargar sobre el modelo base Gemma-4-E4B-it y combinarse con otras capacidades del modelo base si se requiere.
- No incluye capacidades de generación de texto, tool calling, agentes o razonamiento multi-paso; su función está restringida a la evaluación de calidad.

## Casos de uso

- Investigación en calidad de vídeo HDR: el adaptador permite a investigadores evaluar la calidad perceptual de vídeos HDR generados por usuarios sin necesidad de una referencia, facilitando estudios sobre codecs, pipelines de tone-mapping o algoritmos de mejora.
- Comparación de codecs y pipelines de procesamiento: se puede usar para puntuar la calidad de salidas de diferentes codificadores o transformaciones HDR a SDR, ayudando a seleccionar configuraciones óptimas.
- Monitorización de calidad en plataformas de streaming UGC: aunque no está calibrado para producción, podría servir como base para desarrollar sistemas de control de calidad en servicios que aceptan vídeo HDR de usuarios.
- Validación de métricas objetivas: el modelo puede actuar como referencia perceptual para comparar métricas tradicionales (PSNR, SSIM, VMAF) en el dominio HDR.
- Desarrollo de modelos de calidad con aprendizaje por transferencia: al ser un adaptador LoRA, se puede utilizar como punto de partida para fine-tuning en otros conjuntos de datos de calidad de vídeo.
- Análisis de la influencia del tone-mapping en la percepción de calidad: dado que la entrada usa un proxy SDR, el modelo permite estudiar cómo distintas estrategias de tone-mapping afectan a la calidad percibida.

## Benchmarks y rendimiento

En el conjunto de prueba de 420 vídeos de la división 0 de BrightVQ, el adaptador reporta las siguientes métricas:

| Metrica | Valor |
|---|---|
| SROCC (Spearman) | 0.8624 |
| PLCC (Pearson) | 0.8805 |
| KRCC (Kendall) | 0.6811 |
| RMSE | 6.4313 |

No se han publicado comparaciones con otros modelos de evaluación de calidad de vídeo HDR en la información disponible.

## Requisitos de hardware

- El adaptador en sí es ligero (0.2 GB en safetensors), pero requiere cargar el modelo base `google/gemma-4-E4B-it`, cuyos requisitos de memoria no se especifican en la información proporcionada.
- No se dispone de datos sobre VRAM estimada, GPUs recomendadas o latencia. Se desconoce si el modelo base cabe en GPUs de consumo.
- Para inferencia, se puede utilizar cualquier framework compatible con PEFT y safetensors, como Hugging Face Transformers con la librería PEFT. No se mencionan opciones como vLLM, llama.cpp u Ollama, y dado el pipeline image-text-to-text, es probable que se requiera un stack de visión-lenguaje.
- El throughput y la latencia no están documentados.

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores o modelos específicos para evaluación de calidad de vídeo HDR sin referencia basados en LLMs. Por tanto, no es posible establecer una comparativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El autor indica explícitamente que las puntuaciones no están calibradas para otros datasets, pipelines de visualización o dominios de vídeo. Su uso fuera del contexto de investigación puede producir resultados poco fiables.
- El adaptador se entrenó únicamente con la división 0 de BrightVQ; no se ha validado en otras particiones o conjuntos de datos.
- No se proporciona información sobre la licencia del modelo, lo que impide conocer las restricciones de uso comercial o de redistribución.
- Al ser un adaptador de investigación, no se ha sometido a pruebas de robustez frente a artefactos de compresión, ruido o condiciones de captura extremas.
- El modelo depende de la calidad del tone-mapping aplicado a los fotogramas HDR; variaciones en este paso pueden afectar a la puntuación.
- No se han documentado sesgos específicos, pero al estar entrenado con un dataset concreto, podría heredar sesgos de contenido o de condiciones de captura presentes en BrightVQ.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/shreshthsaini/brightrate-study-gemma4-e4b-sdr
- Código y construcción de entradas (BrightRate-LM): https://github.com/shreshthsaini/BrightRate-LM
- Dataset BrightVQ: https://github.com/shreshthsaini/BrightVQ
- Página personal del autor: https://shreshthsaini.github.io/
- Página de Gemma 4 de Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Repositorio oficial de Gemma: https://github.com/google-deepmind/gemma
- Paper (sometido): Saini, S., Wang, Y., Birkbeck, N., Adsumilli, B., Bovik, A. C. "BrightRate-LM: Representation-Aware Quality Assessment for User-Generated HDR Video", Machine Vision and Applications, 2026.
