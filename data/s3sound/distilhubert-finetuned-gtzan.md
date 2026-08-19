# S3Sound/distilhubert-finetuned-gtzan

## Resumen

El modelo `distilhubert-finetuned-gtzan`, desarrollado por el usuario S3Sound, es un clasificador de audio especializado en la detección de género musical. Se trata de un fine-tuning del modelo base `ntu-spml/distilhubert`, una versión destilada de HuBERT, sobre el dataset GTZAN, que contiene 1.000 clips de audio de 30 segundos etiquetados en 10 géneros musicales (blues, classical, country, disco, hiphop, jazz, metal, pop, reggae y rock).

Con solo 23,7 millones de parámetros, este modelo resulta extremadamente ligero en comparación con otras arquitecturas de audio como Wav2Vec2 o HuBERT base, lo que lo hace adecuado para entornos con recursos limitados o inferencia en tiempo real. El pipeline es de clasificación de audio (`audio-classification`) y se distribuye bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones. La longitud de contexto no está especificada en la documentación disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilHuBERT (transformer encoder destilado de HuBERT) |
| Parametros totales | 23.691.402 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente FP32/FP16) |
| Idiomas soportados | no disponible (el modelo procesa audio, no texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DistilHuBERT es una versión comprimida de HuBERT, un modelo de representación de audio basado en transformer entrenado de forma auto-supervisada sobre señales de voz. La destilación reduce el número de capas y parámetros manteniendo una parte significativa del rendimiento del modelo original. En este caso, el modelo base `ntu-spml/distilhubert` se ha ajustado (fine-tuning) sobre el dataset GTZAN para la tarea de clasificación de género musical.

El entrenamiento se realizó durante 10 épocas con un learning rate de 5e-05, tamaño de batch de entrenamiento de 4 (con acumulación de gradientes de 2 pasos, lo que da un batch efectivo de 8), optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal con 100 pasos de warmup y precisión mixta (Native AMP). La pérdida de validación final fue de 0.5480 y la precisión (accuracy) alcanzó 0.85 sobre el conjunto de evaluación. No se proporcionan detalles sobre la composición del dataset de entrenamiento ni sobre técnicas adicionales como aumentación de datos o regularización.

## Capacidades

- Clasificación de audio en 10 categorías de género musical (GTZAN).
- Inferencia sobre clips de audio de duración variable, aunque la duración óptima no está documentada.
- Modelo ligero (23,7M parámetros) que puede ejecutarse en CPU o GPU de baja gama.
- No soporta tool calling, generación de texto, razonamiento ni funciones de agente: es exclusivamente un clasificador de audio.
- No se documentan capacidades multilingües ni de procesamiento de voz más allá de la clasificación de género.

## Casos de uso

- Etiquetado automático de bibliotecas musicales: el modelo puede clasificar canciones en géneros para organizar catálogos en plataformas de streaming o archivos personales. Su tamaño reducido permite procesar grandes volúmenes de audio sin necesidad de infraestructura costosa.
- Sistemas de recomendación musical: integrar la clasificación de género como señal de entrada en motores de recomendación para agrupar canciones similares y mejorar las sugerencias personalizadas.
- Análisis de contenido para emisoras de radio: clasificar pistas en tiempo real para generar listas de reproducción temáticas o validar que el contenido emitido cumple con la categoría esperada.
- Investigación académica en MIR (Music Information Retrieval): servir como baseline ligero en experimentos de clasificación de género, comparando su rendimiento con modelos más grandes.
- Aplicaciones educativas de teoría musical: identificar el género de ejemplos musicales para ilustrar diferencias estilísticas en materiales didácticos.
- Monitorización de derechos de autor: clasificar automáticamente el género de contenido musical subido a plataformas para facilitar la gestión de licencias y regalías.
- Prototipado rápido en dispositivos embebidos: al tener solo 23,7M parámetros, puede desplegarse en dispositivos con poca memoria (Raspberry Pi, móviles) para aplicaciones de reconocimiento de música en tiempo real.

## Benchmarks y rendimiento

Según la model card, el modelo alcanza los siguientes resultados sobre el conjunto de evaluación de GTZAN:

| Metrica | Valor |
|---|---|
| Accuracy | 0.85 |
| Loss | 0.5480 |

La evolución durante el entrenamiento muestra una mejora progresiva desde 0.51 en la primera época hasta 0.86 en la novena, con una ligera caída a 0.85 en la décima. No se han publicado comparaciones con otros modelos en la documentación disponible.

## Requisitos de hardware

- VRAM estimada: con 23,7M parámetros, el modelo ocupa aproximadamente 95 MB en FP32 y 48 MB en FP16. Cabe en cualquier GPU con más de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1060, RTX 2060, RTX 4090) es suficiente. También puede ejecutarse en CPU sin problemas para inferencia por lotes.
- Compatibilidad con hardware de baja gama: sí, es adecuado para dispositivos embebidos y edge computing.
- Opciones de despliegue: al ser un modelo de HuggingFace Transformers, puede servirse con librerías como `transformers` (pipeline `audio-classification`), `ONNX Runtime`, `TensorRT` o `llama.cpp` (aunque este último está orientado a modelos de lenguaje). También puede usarse con `vLLM` si se adapta, aunque no es su caso típico.
- Latencia y throughput: no se proporcionan datos oficiales, pero por su tamaño la inferencia es casi instantánea en GPU y del orden de decenas de milisegundos por clip en CPU.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. Como referencia, el modelo base `ntu-spml/distilhubert` es un modelo de propósito general para representaciones de audio, y el fine-tuning sobre GTZAN es una adaptación específica. Otros clasificadores de género musical típicos incluyen fine-tunes de Wav2Vec2 o YAMNet, pero no se han publicado comparaciones directas en la documentación.

| Modelo | Parametros | Contexto | Accuracy en GTZAN | Licencia |
|---|---|---|---|---|
| distilhubert-finetuned-gtzan (este) | 23,7M | no disponible | 0.85 | Apache 2.0 |
| ntu-spml/distilhubert (base) | 23,7M | no disponible | no aplica (modelo preentrenado) | Apache 2.0 |
| Wav2Vec2 fine-tuned en GTZAN (ejemplos típicos) | ~95M | no disponible | variable (0.7-0.9 según configuración) | Apache 2.0 |

## Limitaciones y advertencias

- El modelo se ha entrenado exclusivamente sobre el dataset GTZAN, que contiene 1.000 clips de 30 segundos. Esto limita su generalización a otros géneros, estilos o condiciones de grabación distintas.
- La precisión del 85% es moderada y puede no ser suficiente para aplicaciones críticas donde se requiera alta fiabilidad.
- No se documentan sesgos específicos, pero es probable que el modelo refleje los sesgos del dataset GTZAN, que está desequilibrado en cuanto a representación de géneros y procedencia geográfica de la música.
- Al ser un modelo de audio, no está sujeto a alucinaciones textuales, pero puede producir clasificaciones erróneas en entradas con ruido o solapamiento de géneros.
- La longitud de contexto (ventana de audio procesada) no está especificada; los clips de GTZAN son de 30 segundos, por lo que el modelo puede no funcionar bien con audios más largos o más cortos sin preprocesamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base DistilHuBERT puede tener sus propias restricciones; se recomienda verificar la licencia del modelo base.
- No hay información sobre el proceso de destilación exacto ni sobre la arquitectura interna (número de capas, dimensiones) más allá del nombre "DistilHuBERT".

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/S3Sound/distilhubert-finetuned-gtzan
- Modelo base (ntu-spml/distilhubert): https://huggingface.co/ntu-spml/distilhubert
- Dataset GTZAN (sanchit-gandhi/gtzan): https://huggingface.co/datasets/sanchit-gandhi/gtzan
