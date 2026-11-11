# omafolabomi/distilhubert-finetuned-gtzan

## Resumen

distilhubert-finetuned-gtzan es un modelo de clasificación de audio obtenido mediante ajuste fino (fine-tuning) supervisado de ntu-spml/distilhubert sobre el conjunto de datos GTZAN, un corpus de referencia para la clasificación de géneros musicales. Lo desarrolla el usuario de Hugging Face omafolabomi y se publica bajo licencia Apache 2.0. El modelo resuelve una tarea concreta: asignar una etiqueta de género musical a un fragmento de audio, aprovechando las representaciones acústicas preentrenadas del modelo base HuBERT destilado.

La arquitectura subyacente es HuBERT (Hidden-Unit BERT), un transformer que procesa representaciones de audio en bruto y que en esta variante ha sido destilado por el grupo de investigación ntu-spml para reducir coste computacional manteniendo buena parte de la capacidad representacional. El modelo final cuenta con 23.691.402 parámetros y un tamaño de repositorio de 0,1 GB, lo que lo sitúa en la categoría de modelos ligeros aptos para inferencia en CPU o GPU de gama baja.

Su relevancia actual es acotada y práctica: sirve como punto de partida reproducible para experimentos de clasificación musical, como componente de pipelines de etiquetado automático de audio y como ejemplo de fine-tuning mínimo (una sola época) sobre un dataset pequeño. No es un modelo generativo ni conversacional, sino un clasificador de audio de propósito específico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | HuBERT destilado (transformer sobre representaciones de audio) |
| Parámetros totales | 23.691.402 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo de audio, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base ntu-spml/distilhubert es una versión destilada de HuBERT, un transformer que aprende representaciones auto-supervisadas a partir de audio en bruto y que originalmente se entrena prediciendo unidades ocultas discretas. La destilación reduce el número de capas y parámetros respecto al HuBERT original, lo que abarata la inferencia a costa de cierta pérdida de capacidad. Sobre esta base, el ajuste fino añade una cabeza de clasificación para las etiquetas de género de GTZAN.

El entrenamiento reportado en la model card es mínimo: una sola época, learning rate 5e-05, batch size de 4 en entrenamiento y evaluación, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 10 pasos de warmup, semilla 42 y precisión mixta nativa (AMP). Se alcanzaron 225 pasos de entrenamiento con una pérdida de validación de 0,6295. No se documenta el número de tokens ni la composición exacta del dataset más allá de la referencia a marsyas/gtzan, ni si hubo aumentación de datos, validación cruzada o búsqueda de hiperparámetros.

## Capacidades

- Clasificación de audio en 10 géneros musicales (la taxonomía estándar de GTZAN: blues, clásica, country, disco, hip-hop, jazz, metal, pop, reggae y rock).
- Extracción de representaciones acústicas intermedias reutilizables para otras tareas de audio (transfer learning).
- Procesamiento de fragmentos de audio cortos, típicamente de unos 30 segundos, según el formato habitual de GTZAN.
- Inferencia ligera: 23,7 millones de parámetros permiten ejecución en CPU con latencias bajas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües en sentido lingüístico; opera sobre señal de audio.
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Etiquetado automático de bibliotecas musicales: clasificar pistas por género para organizar catálogos, playlists o sistemas de recomendación, aprovechando la inferencia ligera para procesar lotes grandes en CPU.
- Moderación y filtrado de contenido musical: detectar géneros concretos en plataformas de streaming para aplicar reglas de negocio o restricciones por región.
- Prototipado rápido en investigación de MIR (Music Information Retrieval): servir como baseline reproducible con una sola época de entrenamiento y métricas declaradas, útil para comparar técnicas de aumentación o arquitecturas.
- Componente en pipelines de análisis de audio: extraer embeddings de distilhubert para alimentar clasificadores posteriores o sistemas de similitud musical.
- Educación y demos: ejemplo didáctico de fine-tuning de un modelo de audio con Transformers, Trainer y el dataset GTZAN.
- Preetiquetado en proyectos de anotación: generar etiquetas iniciales que revisores humanos corrigen, reduciendo el coste de anotación manual.
- Filtrado en aplicaciones de DJ o generación de listas: agrupar automáticamente pistas por género para transiciones y recomendaciones.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Audio Classification | GTZAN (marsyas/gtzan) | Accuracy | 0,80 |
| Audio Classification | GTZAN (marsyas/gtzan) | Loss (validación) | 0,6295 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es de texto ni de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (23,7 M de parámetros, ~95 MB de pesos), y menos de 500 MB en FP16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; modelos como NVIDIA T4, RTX 3060, RTX 4090, A100 o H100 son sobredimensionados para esta carga.
- Cabe holgadamente en GPU de consumo, e incluso en CPU y en dispositivos embebidos con recursos limitados.
- Opciones de despliegue: transformers con pipeline de audio-classification, TorchScript, ONNX Runtime y endpoints de Hugging Face (etiqueta endpoints_compatible). No hay pesos GGUF publicados para llama.cpp u Ollama, dado que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño, se espera latencia de milisegundos por fragmento en GPU y de decenas a cientos de milisegundos en CPU, aunque no se aportan mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto | Accuracy GTZAN | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| omafolabomi/distilhubert-finetuned-gtzan | 23,7 M | Clasificación de género | no disponible | 0,80 (declarado) | Apache 2.0 | Hugging Face |
| ntu-spml/distilhubert (base) | ~23 M | Representaciones de audio | no disponible | no aplica (no ajustado a GTZAN) | Apache 2.0 | Hugging Face |
| facebook/hubert-base-ls960 | ~95 M | Representaciones de audio | no disponible | no disponible | Apache 2.0 | Hugging Face |
| Modelos especializados en GTZAN de la literatura MIR | variable | Clasificación de género | no disponible | típicamente 0,80-0,90 según estudio | variable | variable |

La comparación cuantitativa con alternativas ajustadas específicamente a GTZAN no está disponible en la información proporcionada; los rangos de la literatura MIR se citan solo como referencia general y no como medición de este modelo.

## Limitaciones y advertencias

- El modelo card está generado automáticamente y contiene secciones sin completar ("More information needed"); no hay documentación sobre usos previstos, limitaciones ni composición del dataset.
- El ajuste fino es de una sola época con batch size 4, lo que sugiere un entrenamiento mínimo y posible infraajuste; la accuracy de 0,80 no está verificada de forma independiente.
- GTZAN es un dataset pequeño y con problemas conocidos de duplicados y etiquetas ruidosas en la literatura; el rendimiento puede no generalizar a audio real de producción.
- Riesgo de sesgo hacia los géneros y artistas sobrerrepresentados en GTZAN, con posible degradación en géneros minoritarios o fusiones.
- No hay información sobre sesgos demográficos o culturales, pero al ser un clasificador musical puede reflejar sesgos del corpus de entrenamiento.
- No es un modelo generativo: no produce texto, no razona y no admite instrucciones en lenguaje natural.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene validar el rendimiento en el dominio objetivo antes de desplegarlo.
- Sin variantes cuantizadas publicadas ni pesos GGUF, lo que limita el despliegue en entornos que no usen transformers o ONNX.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/omafolabomi/distilhubert-finetuned-gtzan
- Modelo base: https://huggingface.co/ntu-spml/distilhubert
- Dataset GTZAN en Hugging Face: https://huggingface.co/datasets/marsyas/gtzan
- Paper de HuBERT (referencia del linaje arquitectónico): https://arxiv.org/abs/2106.07447
- Repositorio de Transformers: https://github.com/huggingface/transformers
