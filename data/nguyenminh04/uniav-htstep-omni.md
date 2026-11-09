# nguyenminh04/uniav-htstep-omni

## Resumen

UniAV + OmniRetriever distillation for HT-Step article grounding es un checkpoint de investigación publicado por el usuario nguyenminh04 en Hugging Face, orientado a la localización temporal de pasos en vídeos instructivos (step grounding) sobre el conjunto de datos HT-Step. Dado un vídeo de tipo tutorial y el artículo que describe los pasos de la tarea (por ejemplo, "hacer tortitas"), el modelo predice en qué instantes del vídeo ocurre cada paso, identifica a qué artículo de un catálogo de 617 corresponde el vídeo y genera un vector de 3584 dimensiones por segmento en el espacio de OmniRetriever, lo que permite búsquedas semánticas sin necesidad de ejecutar el modelo profesor de 7B parámetros.

El modelo se construye sobre el backbone UniAV (paper arXiv:2404.03179), que combina una rama visual con características de InternVideo2-1B preentrenado en K400 y una rama de audio con características BEATs, fusionadas mediante cross-attention y una pirámide de 6 niveles. Sobre esa base se añaden cabeceras específicas para condicionamiento por artículo, detección de eventos y fronteras, selección de paso, clasificación de artículo y destilación del vector OmniRetriever mediante un punto de proyección y una cabeza de span con attention pooling de 8 consultas.

El interés del checkpoint es fundamentalmente metodológico: demuestra que es posible destilar el espacio de representación de un modelo audio-visual grande (WAVE-7B con LoRA sobre HT-Step) en un modelo mucho más ligero que opera sobre características preextraídas, manteniendo una calidad de recuperación razonable. Está pensado para investigadores que trabajen en localización temporal débilmente supervisada y en destilación de espacios de embedding multimodales, no como un modelo generativo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UniAV (transformer con cross-attention audio-visual y pirámide de 6 niveles) + cabeceras de detección, clasificación y destilación |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de grounding sobre vídeo; ventana de 16 fotogramas a 4 fps por segundo de vídeo) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch fp32/EMA; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (el texto de los pasos proviene de HT-Step, mayoritariamente en inglés) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`model_best.pth.tar` con claves `epoch`, `state_dict`, `metrics`) |

## Arquitectura y entrenamiento

El backbone UniAV procesa dos flujos paralelos: vídeo, representado por características de InternVideo2-Stage1-1B K710→K400 f16 (`1B_ft_k710_ft_k400_f16.pth`) extraídas a 4 fps con ventanas de 16 fotogramas (aproximadamente 4 segundos, con el segundo *i* cubriendo los fotogramas 4i−7 a 4i+8), a resolución 224×224 y con el vector pooled previo al clasificador K400; y audio, representado por características BEATs de InternVideo2-Stage2-6B-Audio (`audio_6b.pth`) a 16 kHz mono, con ventanas de 3 segundos centradas en cada segundo. Ambos flujos se alinean a una fila por segundo y se fusionan mediante cross-attention en una pirámide de 6 niveles.

Sobre el backbone se añaden cinco componentes: condicionamiento por artículo (las características atienden a los textos de los pasos codificados con InternVideo2-Stage2-1B f4, BERT-large con las primeras 19 capas y proyección del token [CLS]); cabeceras de evento y frontera con una puntuación de calidad IoU para el ranking; selección de paso comparando el vector del segmento con los textos de los pasos del artículo; una cabecera de artículo que elige entre 617 candidatos combinando los textos de sus pasos con un vector aprendido por artículo; y destilación Omni, con una cabeza puntual y una cabeza de span (attention pooling con 8 consultas) que aprenden el vector `encode_av` de OmniRetriever para cada segmento ground truth. La pérdida combina una KL entre las distribuciones de similitud estudiante y profesor sobre los vectores del lote (temperatura 0,05, peso 0,2) y un término 2·(1 − coseno).

El entrenamiento se realizó sobre una RTX 3060 según la model card, con los hiperparámetros completos en `config.py`. El profesor de destilación es OmniRetriever `encode_av`: WAVE-7B (`nguyenminh04/omni-model`) con adaptadores LoRA de HT-Step (`nguyenminh04/omni-adapters`) en bf16, que genera un vector de 3584 dimensiones por segmento a partir de 8 fotogramas uniformes a 224 px y el audio de la misma ventana (16 kHz, 8 s, recorte central o relleno de ceros) con el prompt "Please describe the video.".

## Capacidades

- Localización temporal de pasos en vídeos instructivos: predice intervalos [inicio, fin] para cada paso del artículo asociado al vídeo.
- Grounding condicionado por artículo: utiliza los textos de los pasos del artículo para guiar la atención del backbone sobre el vídeo.
- Clasificación de artículo: identifica a cuál de los 617 artículos de HT-Step corresponde el vídeo, sin que se le proporcione el artículo.
- Selección de paso por segmento: asigna cada segmento detectado al paso del artículo más compatible semánticamente.
- Generación de embeddings audio-visuales destilados de 3584 dimensiones por segmento, L2-normalizados, compatibles con el espacio de OmniRetriever.
- Recuperación semántica de segmentos sin ejecutar el modelo profesor de 7B, gracias a los vectores destilados.
- Procesamiento multimodal audio-visual: integra características visuales (InternVideo2-1B K400) y de audio (BEATs).
- Puntuación de calidad IoU para el ranking de detecciones.
- No soporta tool calling, function calling, agentes ni generación de texto libre; no es un modelo conversacional.
- No se documentan capacidades multilingües ni modos de razonamiento explícito (thinking mode).

## Casos de uso

- Investigación en localización temporal débilmente supervisada: el checkpoint sirve como referencia reproducible para comparar métodos de step grounding sobre HT-Step con la métrica oficial mAP a tIoU 0,3-0,7, usando el script `tools/eval_htstep.py` y las predicciones incluidas en `predictions_val_seen.csv`.
- Destilación de espacios de embedding multimodales: permite estudiar cómo se transfiere el espacio `encode_av` de un modelo audio-visual de 7B (WAVE-7B + LoRA) a un modelo ligero que opera sobre características preextraídas, con métricas de fidelidad como OmniCos, OmniCosC y OmniR@1.
- Indexación y búsqueda de segmentos en tutoriales: los vectores de 3584 dimensiones por segmento permiten construir un índice vectorial y recuperar fragmentos de vídeo por similitud semántica sin coste de inferencia del profesor.
- Segmentación automática de vídeos educativos: dado un temario o lista de pasos, el modelo puede alinear cada paso con su intervalo temporal para generar capítulos o marcas de navegación.
- Análisis de conjuntos de datos de vídeo instructivo: permite anotar o validar automáticamente la localización de pasos en corpus con solo el artículo asociado, reduciendo el etiquetado manual.
- Evaluación comparativa de backbones audio-visuales: al estar construido sobre UniAV con características InternVideo2 y BEATs, sirve para medir la contribución de cada modalidad en tareas de grounding.
- Prototipado de asistentes de consulta sobre vídeo: combinando la clasificación de artículo y los embeddings destilados se puede construir un buscador que, dada una pregunta sobre un tutorial, devuelva el fragmento relevante.

## Benchmarks y rendimiento

Resultados del checkpoint en HT-Step val_seen (510 vídeos con características), según la model card:

| mAP (artículo dado) | ArtAcc | OmniCos | OmniCosC | OmniR@1 |
|---|---|---|---|---|
| 29,70 | 60,2 | 91,06 | 75,05 | 59,72 |

Métricas del mismo checkpoint con el código oficial de evaluación de HT-Step, comparando la partición completa (600 vídeos, los 90 sin características cuentan como fallo) y la partición con características (510 vídeos):

| Vídeos | mAP@0,3 | mAP@0,5 | mAP@0,7 | mAP@[0,3:0,7] | mAP full match | mAP partial match | R@1 |
|---|---|---|---|---|---|---|---|
| 600 | 37,23 | 25,86 | 13,50 | 25,72 | 28,92 | 21,45 | 36,57 |
| 510 | 42,85 | 29,84 | 15,74 | 29,70 | 34,18 | 25,13 | 42,13 |

Referencias citadas por el autor (ajustes distintos, no constituyen una tabla de clasificación oficial): el paper de HT-Step sobre seen test S1 reporta para ActionFormer-T 36,9 / 26,5 / 15,3 / 26,3 mAP (41,2 / 30,8 / 18,3 / 30,2 con preentrenamiento en HowTo100M) y para ActionFormer full/partial 29,6 / 20,4; en recuperación débilmente supervisada, VINA obtiene 34,0-39,1 en esta partición de validación, VINA 37,4 y MPTVA 43,3 en test. El autor señala además que el mismo código en una A100 de Colab alcanzó mAP 30,37 en su mejor época (30,14 en el checkpoint guardado), por lo que el hardware introduce variaciones menores en los resultados.

## Requisitos de hardware

- El checkpoint se entrenó en una RTX 3060, lo que indica que el modelo es ligero y cabe holgadamente en GPU de consumo.
- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,5 GB y los pesos son un único `model_best.pth.tar`, por lo que el modelo en sí es de pequeño tamaño frente a los modelos generativos.
- GPU recomendadas: cualquier GPU consumer reciente (RTX 3060 o superior) es suficiente para inferencia; para evaluación completa sobre val_seen conviene una GPU con al menos 8-12 GB para cargar características y lotes.
- Coste dominante: la extracción de características con InternVideo2-1B y BEATs, y muy especialmente la generación de vectores OmniRetriever con WAVE-7B en bf16, que requiere una GPU de mayor capacidad (A100/H100 recomendadas para el profesor).
- Opciones de despliegue: el repositorio `HanLi-Retriever` con `train.py --eval` para evaluación y `tools/eval_htstep.py` para métricas oficiales; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo de texto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / ventana | mAP@[0,3:0,7] (referencia) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| UniAV + OmniRetriever distillation (este) | Grounding audio-visual sobre características preextraídas | no disponible | 1 fila/s, ventana de 16 fotogramas a 4 fps | 29,70 en val_seen (510 vídeos) | MIT | Hugging Face + GitHub |
| ActionFormer-T (paper HT-Step) | Detección temporal | no disponible | no disponible | 26,3 en seen test S1 (30,2 con HowTo100M) | no disponible | Paper |
| VINA | Recuperación débilmente supervisada | no disponible | no disponible | R@1 34,0-39,1 en val | no disponible | Paper |
| MPTVA | Recuperación débilmente supervisada | no disponible | no disponible | R@1 43,3 en test | no disponible | Paper |

La comparación no es estrictamente homogénea: las cifras de ActionFormer, VINA y MPTVA provienen de particiones y ajustes distintos a los del checkpoint, tal como advierte el propio autor.

## Limitaciones y advertencias

- Modelo de investigación sin pipeline declarado en Hugging Face (`pipeline: no disponible`), con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.
- Depende de características preextraídas muy específicas (InternVideo2-1B K400 f16 para vídeo, BEATs para audio y el codificador de texto de InternVideo2-Stage2-1B); cambiar de extractor invalida el checkpoint.
- Cobertura parcial del conjunto de evaluación: 90 de los 600 vídeos de val_seen no tienen características y cuentan como fallo en la evaluación oficial, lo que penaliza las métricas sobre la partición completa.
- El rendimiento depende del hardware de entrenamiento: el autor reporta diferencias de mAP entre una RTX 3060 y una A100 de Colab con el mismo código.
- El espacio de embeddings destilado es una aproximación del de OmniRetriever; OmniCosC (75,05) es notablemente inferior a OmniCos (91,06), lo que indica que parte de la similitud se explica por la media del profesor y no por información específica del segmento.
- Ámbito limitado a 617 artículos de HT-Step y a tareas instructivas; no es un modelo general de vídeo ni de texto.
- Idiomas soportados no documentados; los textos de los pasos provienen de HT-Step, predominantemente en inglés, por lo que el rendimiento en otros idiomas es incierto.
- Riesgo de alucinación en el sentido de asignar pasos a intervalos inexistentes o elegir un artículo incorrecto (ArtAcc 60,2 % implica un 39,8 % de errores en la clasificación de artículo).
- Licencia MIT, que permite uso comercial y modificación, pero sin garantías; conviene verificar las licencias de los modelos base (InternVideo2, BEATs, WAVE-7B) y de los datos de HT-Step antes de un uso comercial.
- No soporta tool calling, agentes ni generación de texto; no debe evaluarse con criterios de modelos conversacionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nguyenminh04/uniav-htstep-omni
- Código: https://github.com/im-xiaoming/HanLi-Retriever (rama `main`, commit `77fc4fa`)
- Extracción de vectores Omni AV: https://github.com/im-xiaoming/Omni-Retriever-Custom (rama `htstep-av-extract`)
- Paper de UniAV: https://arxiv.org/abs/2404.03179
- Dataset de características de vídeo: https://huggingface.co/datasets/nguyenminh04/htstep-feats-k400
- Dataset de características de validación: https://huggingface.co/datasets/nguyenminh04/htstep-val-seen-feats
- Dataset de vectores Omni AV: https://huggingface.co/datasets/nguyenminh04/htstep-omni-av
- Dataset de características de texto de pasos: https://huggingface.co/datasets/nguyenminh04/htstep-text-feats
- Modelo profesor WAVE-7B: https://huggingface.co/nguyenminh04/omni-model
- Adaptadores LoRA de HT-Step: https://huggingface.co/nguyenminh04/omni-adapters
