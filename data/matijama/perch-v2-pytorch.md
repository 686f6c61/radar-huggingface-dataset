# matijama/perch-v2-pytorch

## Resumen

Perch v2 (PyTorch) es un port no oficial a PyTorch de Perch 2.0, el modelo de bioacústica desarrollado por Google DeepMind para la clasificación de cantos de aves y sonidos de fauna. Este repositorio, publicado por el usuario matijama, contiene una conversión directa de los pesos originales en TensorFlow (la release `perch_v2` de Google, versión 2, con licencia Apache 2.0), y según el autor reproduce las salidas del modelo original hasta el error de redondeo en coma flotante.

El modelo tiene 101.757.263 parámetros y combina un codificador EfficientNet-B3 con un clasificador de prototipos de 14.795 clases. Genera embeddings de audio de 1536 dimensiones, logits sobre las 14.795 especies, embeddings espaciales y espectrogramas, a partir de ventanas de 5 segundos remuestreadas a 32 kHz. Se distribuye en safetensors, con un fichero de modelo completo (388 MB en fp32) y un fichero de codificador solo (41 MB) para extracción de embeddings.

Su relevancia es práctica: elimina la dependencia de TensorFlow para quien quiera integrar Perch en un pipeline de PyTorch, algo habitual en investigación bioacústica y en competiciones de clasificación de audio (por ejemplo, el ecosistema BirdCLEF). Al mantener los pesos intactos y la licencia Apache 2.0, es una alternativa de formato para el mismo modelo, no un modelo nuevo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B3 (codificador convolucional) + clasificador de prototipos de 14.795 clases |
| Parametros totales | 101.757.263 |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable; procesa ventanas de audio de 5 s a 32 kHz |
| Tipos de cuantizacion | no se distribuyen pesos cuantizados; fp32 en safetensors y ejecucion en fp16 mediante autocast en GPU |
| Idiomas soportados | no disponible (modelo de audio, no de texto; las 14.795 clases corresponden a taxones) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors completo, encoder.safetensors solo codificador) |

## Arquitectura y entrenamiento

La arquitectura es un codificador convolucional EfficientNet-B3 seguido de una cabeza de clasificación basada en prototipos con 14.795 salidas. La entrada se normaliza a ventanas de 5 segundos a 32 kHz, independientemente de la frecuencia de muestreo original del audio. Las salidas documentadas son: `embedding` con forma `[windows, 1536]`, `label` con logits `[windows, 14795]`, `spatial_embedding` con forma `[windows, 16, 4, 1536]` y `spectrogram` con forma `[windows, 500, 128]`.

No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens o muestras de audio, ni sobre el uso de RLHF o DPO en la informacion proporcionada; esos detalles corresponden al articulo original de Perch 2.0 (arXiv:2508.04665), no a esta ficha. La innovacion relevante de este repositorio es exclusivamente de formato: los valores de los pesos son identicos a los de la release oficial de Google y solo cambian el formato de almacenamiento y la disposicion de los tensores, lo que permite ejecutar el modelo con PyTorch y aprovechar fp16 en GPU sin descargar pesos adicionales.

## Capacidades

- Extraccion de embeddings de audio de 1536 dimensiones por ventana de 5 segundos.
- Clasificacion en 14.795 clases con nombres de etiqueta y codigo eBird disponibles en `labels.csv`.
- Prediccion con `top_k` para obtener las clases mas probables por ventana.
- Generacion de embeddings espaciales con forma `[windows, 16, 4, 1536]`.
- Calculo de espectrogramas con forma `[windows, 500, 128]`.
- Remuestreo interno: acepta grabaciones de cualquier frecuencia de muestreo y las convierte a ventanas de 5 s a 32 kHz.
- Ejecucion en fp16 mediante `torch.autocast("cuda", dtype=torch.float16)` sin pesos adicionales.
- Modo `embeddings_only=True` para descargar unicamente el codificador de 41 MB.
- Fine-tuning: el repositorio de GitHub incluye un ejemplo para entrenar la cabeza original, una cabeza nueva o el modelo completo.
- No soporta generacion de texto, tool calling, function calling, razonamiento multi-paso, agentes, vision ni audio generativo: es un modelo discriminativo de audio.

## Casos de uso

- Monitorizacion acustica de biodiversidad: desplegar el modelo sobre grabadoras de campo continuas para obtener, por cada ventana de 5 s, la distribucion de probabilidad sobre 14.795 taxones, lo que permite construir series temporales de presencia de especies.
- Deteccion y filtrado de especies objetivo en grandes volumenes de grabacion: procesar horas de audio con `top_k` para descartar rapidamente los segmentos sin interes y reducir el trabajo de anotacion manual.
- Estudios de ecologia comparada mediante embeddings: usar los vectores de 1536 dimensiones como representacion del paisaje sonoro y aplicar clustering o busqueda por similitud para agrupar segmentos acusticamente parecidos sin depender de las etiquetas.
- Fine-tuning para especies locales o poco representadas: reentrenar la cabeza de clasificacion (o el modelo completo) con un conjunto propio de grabaciones, aprovechando el codificador preentrenado como extractor de caracteristicas.
- Investigacion en bioacustica reproducible: sustituir la dependencia de TensorFlow por PyTorch para integrar Perch en pipelines de experimentacion que ya usan `torch`, `torchaudio` o aceleracion en GPU con fp16.
- Analisis de paisajes sonoros y ecoacustica: combinar los embeddings y los espectrogramas generados por el modelo con indices acusticos para caracterizar un entorno a lo largo del tiempo.
- Ciencia ciudadana y educacion: clasificar grabaciones enviadas por voluntarios con un modelo que cabe en hardware de consumo y con licencia permisiva, devolviendo las tres especies mas probables por segmento.
- Preprocesado para competiciones y benchmarks de clasificacion de audio: usar el modelo como baseline o como extractor de caracteristicas en tareas tipo BirdCLEF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio no incluye metricas (exactitud, F1, mAP ni comparaciones cuantitativas) y los resultados de busqueda web proporcionados no contienen datos del modelo. Cualquier cifra de rendimiento debe consultarse en el articulo original de Perch 2.0 (arXiv:2508.04665) o en la release oficial de Google en Kaggle.

## Requisitos de hardware

- Modelo completo en fp32: 388 MB de pesos, 101.757.263 parametros. La VRAM necesaria es inferior a 1 GB contando activaciones y overhead, por lo que cabe en cualquier GPU de consumo e incluso en CPU.
- Codificador solo para embeddings: 41 MB, adecuado para entornos con memoria muy limitada o para despliegue en edge.
- GPU recomendadas: cualquier GPU con soporte CUDA, desde una GTX 1050 o RTX 3060 hasta una RTX 4090, A100 o H100; el modelo es demasiado pequeno para aprovechar el paralelismo de los aceleradores de gama alta.
- Cabe en GPU de consumo: si, en practicamente todas las GPU consumer actuales, y tambien en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: el paquete oficial es `perchv2_pytorch` (instalable desde `git+https://github.com/matijama/perch-v2-pytorch`). vLLM, llama.cpp, Ollama y TGI no son aplicables porque no es un modelo de lenguaje. La model card no menciona exportacion a ONNX ni a TorchScript.
- Latencia y throughput: no disponible. No se proporcionan mediciones de velocidad de inferencia.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos cuantitativos de modelos alternativos, por lo que la comparacion se limita a la categoria del modelo. Los comparables naturales son Perch v1 (misma familia, Google DeepMind) y BirdNET (Cornell Lab of Ornithology), ambos orientados a clasificacion de cantos de aves.

| Modelo | Parametros | Contexto o ventana | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|
| Perch v2 (PyTorch, este repo) | 101.757.263 | ventanas de 5 s a 32 kHz | Apache 2.0 | HuggingFace (port no oficial) y Kaggle (release oficial) | no disponible en esta informacion |
| Perch v1 | no disponible | no disponible | no disponible | no disponible | no disponible |
| BirdNET | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un port no oficial: no esta mantenido por Google DeepMind ni cuenta con su soporte. Cualquier problema de integracion o compatibilidad es responsabilidad del autor del repositorio.
- Es un modelo discriminativo de audio, no un modelo de lenguaje. No genera texto, no soporta tool calling ni agentes, y no debe evaluarse con benchmarks de texto como MMLU o GSM8K.
- Vocabulario cerrado de 14.795 clases: las especies o taxones fuera de esa lista no pueden clasificarse correctamente; el modelo no esta disenado para detectar categorias desconocidas.
- Como todo clasificador de conjunto cerrado, puede producir falsos positivos con alta confianza en presencia de ruido, senales antropogenicas u otros sonidos no representados en su vocabulario. No se documentan en la informacion disponible los sesgos especificos del modelo ni tasas de error por especie o por region geografica.
- No se han publicado datos de benchmarks en la informacion disponible, por lo que no es posible cuantificar su precision real en un caso de uso concreto sin evaluarlo sobre datos propios.
- Licencia Apache 2.0, que permite uso comercial. Al derivar de la release oficial de Google, conviene mantener la atribucion y citar tanto el articulo de Perch 2.0 como la fuente original de los pesos.
- El repositorio tiene 0 descargas y 1 like en el momento de redactar esta ficha, lo que implica una adopcion y una validacion por la comunidad muy limitadas.
- Las salidas de audio pueden estar sujetas a legislacion local sobre grabacion y especies protegidas; la licencia del modelo no cubre el tratamiento de los datos de entrada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/matijama/perch-v2-pytorch
- Repositorio de codigo, ejemplos y documentacion: https://github.com/matijama/perch-v2-pytorch
- Articulo de Perch 2.0 (arXiv:2508.04665): https://arxiv.org/abs/2508.04665
- Release oficial de Google en Kaggle (bird-vocalization-classifier, `perch_v2`): https://www.kaggle.com/models/google/bird-vocalization-classifier
