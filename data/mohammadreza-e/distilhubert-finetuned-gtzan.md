# mohammadreza-e/distilhubert-finetuned-gtzan

## Resumen

`mohammadreza-e/distilhubert-finetuned-gtzan` es un modelo de clasificación de audio obtenido por ajuste fino (fine-tuning) del modelo preentrenado `ntu-spml/distilhubert` sobre el conjunto de datos GTZAN (`marsyas/gtzan`), el corpus de referencia para clasificación de géneros musicales. Lo publica el usuario de Hugging Face mohammadreza-e y su única finalidad declarada es etiquetar fragmentos de audio musical en una de las diez categorías de género de GTZAN (blues, clásica, country, disco, hip-hop, jazz, metal, pop, reggae y rock).

El modelo es deliberadamente pequeño: 23.691.402 parámetros en formato safetensors y un repositorio de 0,9 GB, lo que lo sitúa en la categoría de modelos desplegables en cualquier portátil o incluso en CPU. La arquitectura de partida, DistilHuBERT, es una versión destilada de HuBERT que trabaja sobre características acústicas (MFCC/mel) a 16 kHz y sustituye la cuantización de unidades discretas del HuBERT original por una destilación de capas ocultas, lo que reduce el coste de cómputo manteniendo buena parte de la capacidad representacional.

La relevancia de esta ficha es acotada pero útil: se trata de un artefacto generado automáticamente por el `Trainer` de Transformers, sin model card completada por el autor (las secciones "Model description", "Intended uses" y "Training and evaluation data" dicen literalmente "More information needed"). Su interés práctico es servir como línea base ligera de clasificación musical y como ejemplo de ajuste fino reproducible con hiperparámetros documentados, no como modelo de producción con garantías.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DistilHuBERT (transformer destilado de HuBERT para representaciones de audio; cabeza de clasificación de secuencia sobre 10 clases) |
| Parámetros totales | 23.691.402 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como ventana de tokens; entrada de audio a 16 kHz, con clips de 30 s en el corpus GTZAN |
| Tipos de cuantización | no disponible (solo se publican pesos safetensors; no se documentan versiones GGUF, ONNX ni int8) |
| Idiomas soportados | no disponible (modelo de audio, no de texto; las etiquetas de salida son nombres de género musical en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La base es DistilHuBERT, un transformer destilado a partir de HuBERT que opera sobre características acústicas de audio a 16 kHz. HuBERT se entrena de forma auto-supervisada prediciendo unidades discretas obtenidas por agrupamiento de características MFCC; DistilHuBERT reemplaza ese objetivo por una destilación de las representaciones de las capas intermedias del profesor, lo que permite reducir profundidad y parámetros (hasta ~23,7 M en esta versión) conservando la estructura de atención. Sobre ese tronco, este repositorio añade una cabeza de clasificación de audio con 10 etiquetas de salida.

El ajuste fino se realizó con el `Trainer` de Transformers y los siguientes hiperparámetros, documentados en la model card: learning rate 5e-05, batch de entrenamiento y evaluación de 8, semilla 42, optimizador AdamW (`ADAMW_TORCH_FUSED`, betas 0,9/0,999, epsilon 1e-08), scheduler lineal con 100 pasos de warmup, 10 épocas y precisión mixta nativa (AMP). El conjunto de entrenamiento es `marsyas/gtzan`; no se detalla la composición exacta ni si se aplicó aumento de datos o *data augmentation* sobre los clips. La curva de validación registrada es: época 1 con accuracy 0,54 y pérdida 1,7942; época 3 con 0,78; época 5 con 0,81; época 8 con 0,84 (mejor valor); época 10 con 0,83 y pérdida 0,6091. No se documenta ningún decodificador especulativo, atención lineal ni innovación técnica adicional más allá de la propia destilación del modelo base.

## Capacidades

- Clasificación de audio musical en 10 géneros (GTZAN): salida de etiqueta única por clip.
- Extracción de representaciones acústicas intermedias reutilizables para otras tareas de audio (el tronco DistilHuBERT puede congelarse y servir de extractor de *embeddings*).
- Inferencia sobre audio a 16 kHz; requiere remuestreo previo si la fuente tiene otra frecuencia de muestreo.
- Ejecución en CPU con latencia baja gracias a su tamaño (23,7 M de parámetros).
- No soporta *tool calling* ni *function calling*.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni generación de texto: no es un modelo de lenguaje.
- No dispone de modo *thinking*, visión, transcripción ni *speech-to-text*; la salida es una distribución sobre clases de género.

## Casos de uso

- Etiquetado automático de bibliotecas musicales: pasar los clips por el modelo y asignar el género predicho como metadato para indexación y búsqueda; es adecuado por su coste mínimo y su entrenamiento específico en GTZAN.
- Prototipado rápido de *pipelines* de MIR (Music Information Retrieval): sirve como línea base para comparar contra modelos propios antes de invertir en arquitecturas mayores.
- Clasificación en el dispositivo (*edge*): con ~95 MB en fp32 y ~47 MB en fp16, puede ejecutarse en Raspberry Pi o portátiles sin GPU para preclasificar emisiones de radio o *podcasts* musicales.
- Filtrado y moderación de catálogos: detectar géneros para aplicar reglas de negocio (por ejemplo, separar contenido instrumental de vocal, o segmentar por estilo en plataformas de streaming).
- Docencia y reproducción de experimentos: el repositorio documenta hiperparámetros, versiones de framework y curva de validación, lo que lo convierte en un ejemplo reproducible de ajuste fino con `Trainer`.
- Extracción de *embeddings* para *clustering* musical: usar las activaciones del tronco DistilHuBERT como características para agrupar pistas por similitud tímbrica o de estilo.
- Evaluación comparativa de técnicas de destilación en audio: permite medir la pérdida de accuracy de DistilHuBERT frente a HuBERT completo en una tarea concreta con bajo presupuesto de cómputo.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card (métrica no verificada por el hub):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Audio Classification | GTZAN (`marsyas/gtzan`) | Accuracy | 0,83 |
| Audio Classification | GTZAN (`marsyas/gtzan`) | Loss (evaluación) | 0,6091 |

Evolución durante el entrenamiento (conjunto de validación):

| Época | Pérdida de entrenamiento | Pérdida de validación | Accuracy |
|---|---|---|---|
| 1 | 1,9129 | 1,7942 | 0,54 |
| 2 | 1,1685 | 1,2434 | 0,62 |
| 3 | 1,0110 | 0,9328 | 0,78 |
| 4 | 0,6759 | 0,8769 | 0,71 |
| 5 | 0,5277 | 0,6687 | 0,81 |
| 6 | 0,3611 | 0,6989 | 0,79 |
| 7 | 0,2413 | 0,6472 | 0,81 |
| 8 | 0,1208 | 0,5679 | 0,84 |
| 9 | 0,1530 | 0,6351 | 0,82 |
| 10 | 0,0821 | 0,6091 | 0,83 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otras tareas de lenguaje, por no ser aplicables a este modelo.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en fp32 (~95 MB de pesos más activaciones y *buffers* de audio); ~50 MB en fp16.
- GPU recomendadas: cualquiera con al menos 2 GB de VRAM; el modelo no aprovecha GPUs de gama alta (A100, H100) salvo en escenarios de *batching* masivo.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3050, RTX 4060, RTX 4090, e incluso en iGPU modernas.
- Despliegue: `transformers` con `pipeline("audio-classification")`; exportación a ONNX Runtime o TorchScript para inferencia en CPU; no se documentan recetas para vLLM, TGI ni llama.cpp (este último no aplica a arquitecturas de audio de este tipo sin conversión previa a GGUF, no publicada).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera del orden de milisegundos por clip de 30 s en GPU y decenas de milisegundos en CPU, si bien estas cifras no están medidas ni publicadas.
- Almacenamiento: 0,9 GB de repositorio, aunque los pesos útiles en safetensors ocupan una fracción muy pequeña de ese total (el resto corresponde a estados del optimizador y artefactos del `Trainer`).

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Accuracy en GTZAN | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mohammadreza-e/distilhubert-finetuned-gtzan` | 23,7 M | audio 16 kHz | 0,83 (declarado, no verificado) | Apache-2.0 | Hugging Face, 0 descargas |
| `WasuratS/distilhubert-finetuned-gtzan` | no disponible | audio 16 kHz | 0,90 (declarado por el autor, mejor época) | no disponible en la búsqueda | Hugging Face |
| `EbisuRyu/distilhubert-finetuned-gtzan` | no disponible | audio 16 kHz | no disponible | no disponible en la búsqueda | Hugging Face |
| `lightmourne/distilhubert-finetuned-gtzan` | no disponible | audio 16 kHz | no disponible | no disponible en la búsqueda | Hugging Face |
| `ntu-spml/distilhubert` (base, sin ajustar) | ~23,7 M (no confirmado en la información disponible) | audio 16 kHz | no aplica (modelo preentrenado sin cabeza de clasificación) | no disponible en la información proporcionada | Hugging Face |

Todas las alternativas comparten el mismo tronco DistilHuBERT y el mismo corpus GTZAN, por lo que las diferencias se reducen a hiperparámetros de ajuste fino y a la partición de datos empleada; la comparación directa de accuracies no es fiable sin conocer esas particiones.

## Limitaciones y advertencias

- La model card está generada automáticamente y sin completar: no hay descripción de usos previstos, composición del dataset de entrenamiento ni limitaciones declaradas por el autor.
- El resultado de 0,83 de accuracy figura con `verified: false` en el `model-index`; no ha sido reproducido de forma independiente.
- Riesgo de sobreajuste al corpus GTZAN: es un dataset pequeño, con clases desbalanceadas y solapamiento estilístico entre géneros (rock/metal, pop/disco), lo que degrada la generalización a audio real de producción.
- Riesgo de alucinación en sentido estricto no aplica (no genera texto), pero sí de clasificaciones erróneas con alta confianza en fragmentos ambiguos, con voz hablada sobre música o con grabaciones de baja calidad.
- Sesgo de dominio: el modelo está entrenado con clips musicales de 30 s y 16 kHz; audio de otra duración, frecuencia de muestreo o naturaleza (voz, ambiente, efectos) queda fuera de su distribución.
- No hay soporte declarado de multilingüismo ni de etiquetas en idiomas distintos del inglés.
- La licencia Apache-2.0 permite uso comercial y modificación, pero al derivar de `ntu-spml/distilhubert` conviene verificar la licencia del modelo base antes de redistribuir.
- El repositorio incluye estados de entrenamiento y artefactos del `Trainer`, lo que infla el tamaño de descarga respecto a los pesos necesarios para inferencia.
- Ausencia total de tracción (0 descargas, 0 likes) y de soporte del autor: no hay garantía de mantenimiento ni de corrección de errores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mohammadreza-e/distilhubert-finetuned-gtzan
- Modelo base DistilHuBERT: https://huggingface.co/ntu-spml/distilhubert
- Dataset GTZAN en Hugging Face: https://huggingface.co/datasets/marsyas/gtzan
- Alternativa con mejor accuracy declarada: https://huggingface.co/WasuratS/distilhubert-finetuned-gtzan
- Otra alternativa sobre el mismo tronco: https://huggingface.co/EbisuRyu/distilhubert-finetuned-gtzan
- Ficha de agregador sobre una variante similar: https://model.aibase.com/en/models/details/1915693428404543490
- Ficha de agregador sobre `lightmourne/distilhubert-finetuned-gtzan`: https://free2aitools.com/model/lightmourne/distilhubert-finetuned-gtzan
