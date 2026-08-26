# rogovk/distilhubert-finetuned-gtzan

## Resumen

`rogovk/distilhubert-finetuned-gtzan` es un modelo de clasificación de audio basado en DistilHuBERT, una versión destilada del modelo HuBERT de Meta, desarrollado por el usuario rogovk. Se trata de un fine-tuning del modelo base `ntu-spml/distilhubert` sobre el dataset GTZAN, un conjunto de referencia para la clasificación de géneros musicales con 1000 pistas de 30 segundos distribuidas en 10 categorías. El modelo está diseñado para resolver la tarea de etiquetado automático de géneros musicales a partir de audio crudo.

Con 23,7 millones de parámetros, es un modelo ligero que puede ejecutarse en hardware modesto, incluyendo CPU. Su relevancia radica en ofrecer una alternativa eficiente a modelos más grandes de audio, manteniendo una precisión competitiva (87% de accuracy en GTZAN) con un coste computacional reducido. Está publicado bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilHuBERT (transformer destilado para audio) |
| Parametros totales | 23.691.402 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no texto) |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible (clasificacion de audio, no texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en DistilHuBERT, una versión destilada de HuBERT que reduce el número de capas y parámetros manteniendo gran parte de la capacidad de representación del audio. La arquitectura es un transformer encoder que procesa características de audio (MFCC o espectrogramas) y produce una representación contextualizada. En este caso, se añade una cabeza de clasificación para predecir el género musical entre 10 clases.

El entrenamiento se realizó sobre el dataset GTZAN (configuración `marsyas/gtzan`) con los siguientes hiperparámetros: learning rate de 5e-5, batch size de 8, optimizador AdamW con betas (0.9, 0.999), scheduler cosine con 100 pasos de warmup, 15 épocas y label smoothing de 0.1. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación. El proceso de fine-tuning partió de los pesos preentrenados de `ntu-spml/distilhubert`, que a su vez fue destilado de HuBERT base.

## Capacidades

- Clasificacion de genero musical: identifica uno de los 10 generos de GTZAN (blues, classical, country, disco, hiphop, jazz, metal, pop, reggae, rock) a partir de audio.
- Procesamiento de audio crudo: acepta senales de audio de entrada y extrae caracteristicas automaticamente mediante el encoder transformer.
- Eficiencia computacional: al ser un modelo destilado, requiere menos recursos que HuBERT completo, permitiendo inferencia en CPU o GPUs de gama baja.
- Compatibilidad con pipelines de HuggingFace: se integra con la clase `AudioClassificationPipeline` de transformers, facilitando su despliegue.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues, ya que es un modelo especializado en audio.

## Casos de uso

- Etiquetado automatico de bibliotecas musicales: el modelo puede clasificar pistas de audio en generos, facilitando la organizacion de colecciones personales o comerciales. Se usaria cargando el modelo con `pipeline("audio-classification", model="rogovk/distilhubert-finetuned-gtzan")` y pasando archivos de audio.
- Moderacion de contenido en plataformas de streaming: permite detectar el genero de canciones subidas por usuarios para categorizarlas automaticamente, reduciendo el trabajo manual de curadores.
- Analisis de tendencias musicales: aplicado a grandes volumenes de audio, puede generar estadisticas sobre la distribucion de generos en una region o periodo, util para estudios de mercado.
- Asistencia en produccion musical: los productores pueden usar el modelo para verificar rapidamente el genero de una mezcla o maqueta, ayudando en la toma de decisiones creativas.
- Sistemas de recomendacion musical: integrado en un backend, puede clasificar nuevas canciones y alimentar algoritmos de recomendacion basados en genero.
- Investigacion academica: sirve como baseline ligero para experimentos de clasificacion de audio, permitiendo comparar con modelos mas grandes sin necesidad de hardware costoso.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el conjunto de evaluacion de GTZAN:

| Metrica | Valor |
|---|---|
| Accuracy | 0.87 |
| Loss | 0.9340 |

No se han publicado comparaciones con otros modelos en la informacion disponible. Sin embargo, otros fine-tunes de DistilHuBERT sobre GTZAN (por ejemplo, `f0ghedgeh0g/distilhubert-finetuned-gtzan` o `gaetokk/distilhubert-finetuned-gtzan`) reportan accuracy similar (0.87), lo que sugiere consistencia en el rendimiento. No hay datos de benchmarks adicionales como MMLU, HumanEval o GSM8K, ya que no son aplicables a un modelo de audio.

## Requisitos de hardware

- VRAM estimada: el modelo ocupa aproximadamente 92 MB en precision FP32 (23,7M parametros * 4 bytes). Con cuantizacion a FP16 o int8, el uso de memoria se reduce a unos 46 MB o 23 MB respectivamente, aunque no se proporcionan pesos cuantizados oficiales.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente, incluyendo GTX 1050, RTX 2060 o integradas modernas. Tambien puede ejecutarse en CPU con un rendimiento aceptable para inferencia por lotes pequenos.
- Compatibilidad con consumer GPU: si, es totalmente viable en GPUs de consumo general.
- Opciones de despliegue: se puede usar con la libreria transformers de HuggingFace (pipeline de audio-classification), o exportar a ONNX para inferencia en entornos de produccion. Tambien es compatible con los endpoints de HuggingFace Inference Endpoints.
- Latencia y throughput: no se proporcionan datos oficiales, pero al ser un modelo pequeno, se espera una latencia de decenas de milisegundos por muestra en GPU y de unos pocos cientos de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Accuracy (GTZAN) | Licencia | Notas |
|---|---|---|---|---|
| rogovk/distilhubert-finetuned-gtzan | 23,7M | 0.87 | Apache 2.0 | Fine-tune de DistilHuBERT |
| f0ghedgeh0g/distilhubert-finetuned-gtzan | 23,7M (estimado) | 0.87 | Apache 2.0 | Fine-tune similar, sin datos de loss |
| gaetokk/distilhubert-finetuned-gtzan | 23,7M (estimado) | 0.87 | Apache 2.0 | Fine-tune similar, sin datos de loss |
| ntu-spml/distilhubert (base) | 23,7M | no disponible | Apache 2.0 | Modelo base sin fine-tuning, no apto para clasificacion directa |

No se dispone de comparaciones con modelos mas grandes como HuBERT base (95M parametros) o Wav2Vec2, ya que no se han publicado resultados en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo fue entrenado exclusivamente en GTZAN, un dataset con generos occidentales y grabaciones de calidad variable. Puede tener un rendimiento deficiente en generos no representados (musica electronica, folk, etc.) o en audio con ruido de fondo.
- Riesgo de alucinacion: al ser un clasificador, no genera texto, por lo que el riesgo de alucinacion es bajo. Sin embargo, puede producir clasificaciones incorrectas con alta confianza en entradas fuera de distribucion.
- Limitaciones de contexto: al ser un modelo de audio, no maneja texto ni contexto conversacional. Su ventana de audio esta limitada por el preprocesamiento de DistilHuBERT (tipicamente 30 segundos, aunque no se especifica en la ficha).
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe incluir el aviso de copyright y la renuncia de responsabilidad. No hay restricciones de uso militar o de vigilancia.
- Caveat para produccion: la model card es generada automaticamente y carece de detalles sobre el preprocesamiento exacto, la tasa de muestreo esperada o el formato de audio de entrada. Se recomienda verificar estos aspectos antes de integrarlo en un sistema real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rogovk/distilhubert-finetuned-gtzan
- Modelo base DistilHuBERT: https://huggingface.co/ntu-spml/distilhubert
- Dataset GTZAN: https://huggingface.co/datasets/marsyas/gtzan
- Otros fine-tunes similares:
  - https://huggingface.co/f0ghedgeh0g/distilhubert-finetuned-gtzan
  - https://huggingface.co/gaetokk/distilhubert-finetuned-gtzan
  - https://zoo.bimant.com/model/255495 (RajkNakka/distilhubert-finetuned-gtzan-1)
  - https://zoo.bimant.com/model/374689 (innovation64/distilhubert-finetuned-gtzan)
