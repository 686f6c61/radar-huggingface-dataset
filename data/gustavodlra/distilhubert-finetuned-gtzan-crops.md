# GustavoDLRA/distilhubert-finetuned-gtzan-crops

## Resumen

distilhubert-finetuned-gtzan-crops es un modelo de clasificación de audio derivado de ntu-spml/distilhubert, un transformer destilado a partir de HuBERT. Lo desarrolla el usuario GustavoDLRA y está ajustado específicamente sobre el conjunto de datos GTZAN, un corpus de referencia para la clasificación de géneros musicales compuesto por 1000 fragmentos de audio de 30 segundos distribuidos en diez géneros (blues, clásica, country, disco, hip-hop, jazz, metal, pop, reggae y rock).

El modelo resuelve una tarea acotada: recibir una señal de audio y asignarle una de las diez etiquetas de género musical. Con 23,7 millones de parámetros y un repositorio de apenas 0,1 GB, es un modelo muy ligero, pensado para inferencia rápida y despliegue en entornos con recursos limitados, no para generación de texto ni tareas multimodales generales.

Su relevancia es la de un artefacto de referencia reproducible: demuestra cómo un encoder de audio destilado puede ajustarse con un presupuesto de cómputo mínimo (25 épocas, batch de 8, aprendizaje de 5e-05) para alcanzar un 0,88 de exactitud declarada en el conjunto de evaluación. La model card es la autogenerada por el Trainer de Hugging Face y no incluye documentación adicional sobre composición del dataset, sesgos o usos previstos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder de audio (HuBERT destilado, base distilhubert) |
| Parametros totales | 23.691.402 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio dependiente del preprocesado; no documentada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de audio, no lingüístico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de ntu-spml/distilhubert, un encoder tipo HuBERT comprimido mediante destilación de conocimiento. HuBERT es un transformer que aprende representaciones de audio de forma autosupervisada sobre espectrogramas enmascarados, y la variante distil reduce el número de capas y parámetros para abaratar la inferencia manteniendo buena parte de la capacidad representacional. Sobre esa base se añade una cabeza de clasificación de 10 clases para los géneros de GTZAN.

El ajuste fino se realizó con los siguientes hiperparámetros declarados en la model card: learning rate 5e-05, batch de entrenamiento 8, batch de evaluación 2, semilla 42, optimizador AdamW (variante fused, betas 0,9/0,999, epsilon 1e-08), scheduler lineal con 280 pasos de warmup, 25 épocas y precisión mixta nativa (AMP). El conjunto de datos es marsyas/gtzan en configuración "all" y split de entrenamiento. La curva de entrenamiento muestra una pérdida que baja de 2,2356 a 0,1349 y una exactitud de validación que progresa de 0,35 en la primera época a 0,88 en la última. No se documenta el uso de RLHF, DPO ni ninguna innovación técnica adicional; el nombre del repositorio ("crops") sugiere fragmentos recortados de audio, pero la model card no lo aclara.

## Capacidades

- Clasificación de audio en 10 géneros musicales (blues, clásica, country, disco, hip-hop, jazz, metal, pop, reggae, rock).
- Extracción de representaciones de audio mediante el encoder distilhubert subyacente, reutilizable para otras tareas de audio con ajuste fino.
- Inferencia ligera: 23,7 millones de parámetros permiten ejecución en CPU y en GPU de gama baja.
- Integración con la pipeline `audio-classification` de transformers.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión ni audio generativo; es exclusivamente un clasificador discriminativo.

## Casos de uso

- Etiquetado automático de bibliotecas musicales: dado un catálogo de pistas, el modelo asigna un género a cada fragmento para organizar colecciones, generar metadatos o alimentar sistemas de recomendación por género.
- Moderación y filtrado de contenido musical: en plataformas de subida de audio, clasificar automáticamente el género entrante para aplicar políticas de curaduría o enrutar a revisión humana.
- Prototipado rápido de pipelines de MIR (music information retrieval): servir como línea base barata antes de invertir en modelos mayores, gracias a su tamaño de 0,1 GB y a la compatibilidad directa con transformers.
- Clasificación en dispositivos de borde: al caber en CPU y en GPUs de consumo, puede desplegarse en Raspberry Pi o móviles para etiquetar audio localmente sin enviar datos a la nube.
- Análisis de tendencias musicales: procesar lotes de audio de radios o listas de streaming para medir la distribución de géneros a lo largo del tiempo.
- Educación y demostraciones: ejemplo didáctico de ajuste fino de un encoder de audio destilado con el Trainer de Hugging Face, útil en cursos de aprendizaje profundo aplicado a audio.
- Investigación comparativa: referencia ligera para contrastar con modelos de audio de mayor tamaño en experimentos de eficiencia frente a exactitud.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Audio classification | GTZAN (config all, split train) | Accuracy | 0,88 |
| Audio classification | GTZAN (conjunto de evaluación) | Loss | 0,5227 |

Evolución de la exactitud de validación durante el entrenamiento (selección de épocas):

| Época | Validation loss | Accuracy |
|---|---|---|
| 1 | 2,1962 | 0,35 |
| 5 | 0,7420 | 0,80 |
| 10 | 0,6299 | 0,79 |
| 15 | 0,5250 | 0,84 |
| 20 | 0,5433 | 0,86 |
| 25 | 0,5227 | 0,88 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es de texto.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (23,7 M de parámetros, unos 95 MB de pesos); en fp16 o bf16, unos 48 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; funciona también en CPU. No requiere A100 ni H100.
- Cabe holgadamente en GPUs de consumo: RTX 3060, RTX 4060, GTX 1650, e incluso en iGPU modernas.
- Opciones de despliegue: pipeline `audio-classification` de transformers (PyTorch), exportación a ONNX Runtime para CPU, y despliegue en Hugging Face Inference Endpoints (el tag `endpoints_compatible` está presente).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera del orden de milisegundos por fragmento en GPU y decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Exactitud GTZAN | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| distilhubert-finetuned-gtzan-crops (este) | 23,7 M | audio, ventana no documentada | 0,88 (declarada) | apache-2.0 | Hugging Face |
| ntu-spml/distilhubert (base) | ~23 M (encoder) | audio | no aplica (sin cabeza de clasificación) | apache-2.0 | Hugging Face |
| facebook/hubert-base-ls960 | ~95 M | audio | no disponible en esta ficha | apache-2.0 | Hugging Face |
| Modelos de clasificación de género basados en CNN (p. ej. arquitecturas tipo Musicnn) | variable | audio | no disponible en esta ficha | variable | variable |

La comparación cuantitativa con alternativas concretas no está disponible en la información proporcionada; los datos de los modelos comparables no se han verificado en esta ficha.

## Limitaciones y advertencias

- La model card es la autogenerada por el Trainer y no documenta usos previstos, limitaciones ni composición del dataset; falta información esencial para producción.
- La exactitud de 0,88 está declarada como no verificada (`verified: false`) y medida sobre el split de entrenamiento según el model-index, lo que impide considerarla una evaluación limpia en test.
- GTZAN es un dataset pequeño (1000 fragmentos) con problemas conocidos de duplicados y fugas entre splits en la literatura; los resultados pueden sobreestimar el rendimiento real.
- Riesgo de sobreajuste a los diez géneros de GTZAN: no clasifica géneros fuera de esa taxonomía ni audio no musical (voz, ruido ambiental).
- No hay información sobre sesgos por género musical, origen cultural o desbalance de clases.
- No se documenta el preprocesado exacto de audio ("crops" en el nombre sugiere recortes, pero no se especifica duración ni frecuencia de muestreo), lo que dificulta reproducir la inferencia.
- Licencia apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene validar el modelo en el dominio objetivo antes de desplegarlo.
- No apto para tareas de texto, razonamiento, código ni generación; cualquier uso fuera de clasificación de audio requiere ajuste fino adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GustavoDLRA/distilhubert-finetuned-gtzan-crops
- Modelo base distilhubert: https://huggingface.co/ntu-spml/distilhubert
- Dataset GTZAN en Hugging Face: https://huggingface.co/datasets/marsyas/gtzan
- Repositorio oficial de transformers: https://github.com/huggingface/transformers
- Documentación de la pipeline de clasificación de audio: https://huggingface.co/docs/transformers/main/en/tasks/audio_classification
