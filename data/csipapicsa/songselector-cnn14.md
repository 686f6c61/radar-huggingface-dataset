# csipapicsa/songselector-cnn14

## Resumen

PANNs CNN14 es una red neuronal convolucional para el reconocimiento de patrones de audio, publicada originalmente por Kong, Cao, Iqbal, Wang, Wang y Plumbley en 2020 en el artículo "PANNs: Large-Scale Pretrained Audio Neural Networks for Audio Pattern Recognition". Este repositorio concreto (`csipapicsa/songselector-cnn14`) no contiene los pesos originales en PyTorch, sino una conversión a formato ONNX realizada por el desarrollador csipapicsa para integrarla en su aplicación SongSelector, una herramienta de similitud musical entre pistas.

El modelo resuelve una tarea de extracción de características (feature extraction): recibe 5 segundos de audio mono a 32 kHz y devuelve un vector de embedding de 2048 dimensiones que puede compararse mediante similitud coseno para medir la cercanía entre dos fragmentos musicales. Adicionalmente expone una salida de 527 probabilidades correspondientes a las etiquetas de AudioSet, aunque la aplicación que lo acompaña no la utiliza.

Su relevancia actual es acotada: no es un modelo de lenguaje ni un sistema generativo, sino un extractor de embeddings de audio ligero (327 MB en ONNX) pensado para ejecutarse con onnxruntime en pipelines de análisis musical. Resulta útil como componente de un sistema mayor de búsqueda o recomendación musical, no como modelo autónomo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (PANNs CNN14, red convolucional profunda de 14 capas) |
| Parametros totales | no disponible (el tamaño del fichero ONNX es de 327.330.336 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de 160.000 muestras (5 s a 32 kHz) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica el fichero `cnn14.onnx` en float32) |
| Idiomas soportados | no disponible (modelo de audio, no lingüístico) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (opset 17) |

## Arquitectura y entrenamiento

CNN14 es una red neuronal convolucional profunda compuesta por bloques convolucionales con normalización por lotes y activaciones ReLU, que opera sobre espectrogramas log-mel del audio de entrada. La salida se agrega mediante pooling para producir un embedding de 2048 dimensiones y, en paralelo, un vector de 527 probabilidades correspondientes a las clases de AudioSet. El checkpoint publicado (`Cnn14_mAP=0.431.pth`) fue entrenado por los autores originales sobre AudioSet, un conjunto de aproximadamente 2 millones de clips de audio etiquetados con 527 categorías, y alcanza un mAP de 0,431 según el nombre del fichero.

La conversión a ONNX la realizó csipapicsa mediante el script `scripts/export_cnn14_onnx.py` del repositorio SongSelector. Según la model card, el script verifica que onnxruntime produce los mismos embeddings que PyTorch antes de escribir el fichero, lo que garantiza equivalencia numérica entre ambos formatos. No se realizó ningún cambio en los pesos, solo en el formato del grafo. No hay información sobre fine-tuning adicional, RLHF ni datasets complementarios.

## Capacidades

- Extracción de embeddings de audio musical: genera un vector de 2048 dimensiones por cada fragmento de 5 segundos.
- Comparación de similitud entre pistas mediante similitud coseno sobre los embeddings.
- Clasificación de audio en 527 etiquetas de AudioSet (salida `clipwise_output`), aunque la aplicación de referencia no la emplea.
- Procesamiento por lotes (`batch` como primera dimensión de entrada y salida).
- Inferencia con onnxruntime en CPU o GPU, sin dependencia de PyTorch.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de visión.

## Casos de uso

- Búsqueda de música por similitud: indexar una biblioteca musical calculando el embedding de cada pista con CNN14 y responder consultas "temas parecidos a este" mediante vecinos más cercanos con similitud coseno.
- Sistemas de recomendación musical: usar los embeddings como características de entrada para un modelo de ranking o de filtrado colaborativo híbrido.
- Deduplicación y detección de versiones: comparar embeddings de fragmentos para identificar remezclas, directos o duplicados en un catálogo.
- Segmentación y análisis de playlists: agrupar pistas por cercanía en el espacio de embeddings para generar playlists automáticas coherentes.
- Etiquetado automático de audio: aprovechar la salida de 527 clases de AudioSet para clasificar fragmentos por género, instrumento o tipo de sonido.
- Integración en aplicaciones de escritorio o móviles: al ser un fichero ONNX de 327 MB ejecutable con onnxruntime, puede desplegarse localmente sin infraestructura de servidor, como hace SongSelector.
- Preprocesamiento para modelos generativos de música: usar los embeddings como condicionamiento o como métrica de evaluación de similitud en sistemas de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento presente en la model card es el mAP de 0,431 del checkpoint original de PANNs CNN14 sobre AudioSet, que aparece en el nombre del fichero de pesos (`Cnn14_mAP=0.431.pth`) y no se ha verificado de forma independiente en este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero ONNX ocupa 327 MB en float32, por lo que la inferencia requiere del orden de 0,3-0,5 GB de memoria, dependiendo del tamaño de lote.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no se requiere hardware de gama alta.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1050 en adelante, RTX 2060, RTX 3060, RTX 4090, etc.).
- Despliegue: onnxruntime (CPU o GPU). No se distribuye en formato GGUF ni se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Embedding | Licencia | Formato |
|---|---|---|---|---|---|
| PANNs CNN14 (este repo) | CNN 14 capas | 5 s mono a 32 kHz | 2048 | CC BY 4.0 | ONNX |
| PANNs CNN14 original | CNN 14 capas | 5 s mono a 32 kHz | 2048 | CC BY 4.0 | PyTorch (.pth) |
| PANNs otras variantes (CNN6, CNN10) | CNN de menor profundidad | 5 s mono a 32 kHz | 512-2048 | CC BY 4.0 | PyTorch |

No se dispone de información sobre otros modelos comparables (por ejemplo, VGGish, OpenL3 o CLAP) en la documentación proporcionada, por lo que la comparativa se limita a las variantes de la propia familia PANNs.

## Limitaciones y advertencias

- Modelo de audio, no de lenguaje: no genera texto ni mantiene conversaciones; cualquier uso en ese sentido está fuera de su ámbito.
- Ventana de entrada fija de 5 segundos: fragmentos más largos deben trocearse y agregarse manualmente.
- Dependencia de la calidad del preprocesamiento: el modelo espera audio mono a 32 kHz con muestras en [-1, 1]; un remuestreo o normalización incorrectos degradan los embeddings.
- Sesgos de AudioSet: el conjunto de entrenamiento original tiene una distribución de clases desequilibrada y sesgos culturales y de género, que se reflejan en la salida `clipwise_output`.
- Riesgo de falsos positivos en similitud: la similitud coseno sobre embeddings de CNN14 puede confundir pistas con textura o instrumentación parecidas pero estructura musical distinta.
- Licencia CC BY 4.0: permite uso comercial y modificaciones, pero exige atribución a los autores originales (Kong et al., 2020) y a la fuente de los pesos (zenodo.org/records/3987831).
- Sin garantía: la model card indica explícitamente "No warranty".
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.
- El autor distribuye el fichero a través de la propia aplicación SongSelector, que lo descarga y verifica por SHA-256; conviene comprobar el hash si se integra fuera de esa aplicación.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/csipapicsa/songselector-cnn14
- Repositorio SongSelector en GitHub: https://github.com/csipapicsa/SongSelector
- Script de exportación a ONNX: https://github.com/csipapicsa/SongSelector/blob/main/scripts/export_cnn14_onnx.py
- Pesos originales PANNs (Zenodo): https://zenodo.org/records/3987831
- Artículo PANNs (IEEE/ACM TASLP, 2020): Kong, Cao, Iqbal, Wang, Wang, Plumbley, "PANNs: Large-Scale Pretrained Audio Neural Networks for Audio Pattern Recognition"
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
