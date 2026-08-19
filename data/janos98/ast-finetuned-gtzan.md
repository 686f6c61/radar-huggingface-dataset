# Janos98/ast-finetuned-gtzan

## Resumen

El modelo `Janos98/ast-finetuned-gtzan` es un clasificador de audio basado en un Audio Spectrogram Transformer (AST) fine-tuneado sobre el dataset GTZAN de géneros musicales. Desarrollado por Janos98, parte del checkpoint `MIT/ast-finetuned-audioset-10-10-0.4593`, que ya había sido preentrenado en AudioSet para reconocimiento de eventos de audio. Este fine-tuning adapta el modelo a la tarea específica de clasificar 10 géneros musicales (blues, classical, country, disco, hiphop, jazz, metal, pop, reggae, rock) con una precisión del 89% en el conjunto de evaluación.

Con 86,2 millones de parámetros, el modelo mantiene la arquitectura transformer original aplicada a espectrogramas, lo que le permite procesar directamente representaciones tiempo-frecuencia del audio sin necesidad de extraer características manuales. Su relevancia radica en ofrecer un punto de partida sólido para tareas de clasificación musical y análisis de audio, con una licencia permisiva BSD-3-Clause que facilita su uso en proyectos comerciales e investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Spectrogram Transformer (AST) |
| Parametros totales | 86.196.490 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (clasificacion de audio, no texto) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (repo de 7,6 GB) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Audio Spectrogram Transformer, que divide el espectrograma de entrada en parches y los procesa mediante capas de atención multi-cabeza, similar a un Vision Transformer pero adaptado a representaciones auditivas. El checkpoint base `MIT/ast-finetuned-audioset-10-10-0.4593` fue preentrenado en AudioSet, un corpus masivo de eventos de audio, lo que le proporciona una representación general del sonido. El fine-tuning se realizó sobre el dataset GTZAN, compuesto por 1000 clips de audio de 30 segundos distribuidos uniformemente en 10 géneros musicales.

El entrenamiento se llevó a cabo con los siguientes hiperparámetros: learning rate de 3e-5, batch size de 16, optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-8, scheduler de tipo coseno con warmup del 10% de los pasos, y 10 épocas. Se usó precisión mixta nativa (AMP). La pérdida de validación final fue de 0.4226 y la precisión alcanzó el 89%. No se mencionan técnicas adicionales como RLHF o DPO, ya que se trata de un fine-tuning supervisado estándar.

## Capacidades

- Clasificacion de audio: identifica 10 generos musicales (blues, classical, country, disco, hiphop, jazz, metal, pop, reggae, rock).
- Procesamiento de espectrogramas: acepta audio de entrada y lo convierte internamente a representaciones tiempo-frecuencia.
- Transferencia de conocimiento: hereda representaciones auditivas generales del preentrenamiento en AudioSet, lo que permite un buen rendimiento incluso con datasets pequeños como GTZAN.
- Inferencia eficiente: al ser un modelo de 86M parametros, es viable para despliegue en GPU consumer.
- No incluye capacidades de generacion de texto, tool calling, agentes ni soporte multilingue, ya que su pipeline es exclusivamente de clasificacion de audio.

## Casos de uso

- Clasificacion de generos musicales en bibliotecas digitales: el modelo puede etiquetar automaticamente canciones en servicios de streaming o gestores de musica personal, facilitando la organizacion y recomendacion.
- Analisis de tendencias musicales: permite agrupar grandes volumenes de audio por genero para estudios de mercado o analisis de consumo cultural.
- Moderacion de contenido en plataformas de subida de audio: puede verificar si un clip pertenece a una categoria musical permitida o si requiere revision manual.
- Investigacion en musicologia computacional: sirve como baseline para comparar nuevos modelos o tecnicas de clasificacion musical.
- Automatizacion de metadatos en archivos de audio: al integrarse en pipelines de postproduccion, puede generar etiquetas de genero sin intervencion humana.
- Prototipado rapido de aplicaciones de reconocimiento de audio: su licencia permisiva y su tamano moderado permiten integrarlo en demos o MVPs sin costes de licencia.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el modelo-index:

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Audio Classification | GTZAN (marsyas/gtzan) | Accuracy | 0.89 |

No se proporcionan comparaciones con otros modelos en la informacion disponible. La tabla de entrenamiento muestra una progresion desde 0.84 en la primera epoca hasta 0.89 en la quinta, con ligeras fluctuaciones posteriores.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 86M parametros; en precision fp32 ocupa aproximadamente 345 MB, pero el repo completo pesa 7,6 GB (probablemente incluye checkpoints adicionales o versiones en otras precisiones). Para inferencia en fp32, una GPU con 1 GB de VRAM es suficiente; con cuantizacion (si se generara) se reduciria aun mas.
- GPU recomendadas: cualquier GPU consumer moderna, como una NVIDIA GTX 1060 6GB, RTX 2060, RTX 3060 o superior, puede ejecutar el modelo sin problemas. Tambien funciona en CPU, aunque con mayor latencia.
- Opciones de despliegue: al ser un modelo de Transformers, puede servirse con vLLM (si se adapta a audio), Hugging Face Inference Endpoints, o mediante la libreria `transformers` en Python. Para CPU, se puede usar `onnxruntime` o `torch` con optimizaciones.
- Latencia y throughput: no se han publicado mediciones especificas. En una GPU como RTX 3090, se espera una latencia de decenas de milisegundos por clip de 30 segundos, asumiendo preprocesamiento del espectrograma.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. Modelos similares en el ambito de clasificacion de audio incluyen `facebook/wav2vec2-base` (fine-tuneado para clasificacion) o `ast-finetuned-audioset-10-10-0.4593` (el checkpoint base). Sin embargo, no hay resultados publicados de estos modelos sobre GTZAN en la informacion disponible, por lo que no se puede realizar una comparacion cuantitativa.

## Limitaciones y advertencias

- Sesgos del dataset: GTZAN es un dataset relativamente pequeno (1000 clips) y puede no representar la diversidad musical global; el modelo puede fallar en generos no incluidos o en variaciones regionales.
- Riesgo de alucinacion: al ser un clasificador, no genera texto, pero puede asignar etiquetas incorrectas con confianza si el audio esta fuera de distribucion.
- Limitaciones de contexto: el modelo procesa espectrogramas de duracion fija (tipicamente 10 segundos en el AST base); clips mas largos deben segmentarse, lo que puede afectar la precision.
- Restricciones de licencia: BSD-3-Clause permite uso comercial y modificacion, pero requiere incluir el aviso de copyright en redistribuciones.
- Caveat de produccion: la model card esta generada automaticamente y carece de detalles sobre preprocesamiento exacto (frecuencia de muestreo, tamano de ventana, etc.), por lo que es necesario consultar la documentacion del checkpoint base para replicar el pipeline.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Janos98/ast-finetuned-gtzan
- Modelo base: https://huggingface.co/MIT/ast-finetuned-audioset-10-10-0.4593
- Dataset GTZAN: https://huggingface.co/datasets/marsyas/gtzan
