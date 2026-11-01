# epfl-neuroai/encoder-things-eeg2

## Resumen

`encoder-things-eeg2` es un modelo de codificación cerebral inversa: recibe una imagen y predice la respuesta EEG que esa imagen evocaría en el dataset THINGS-EEG2. La salida es una matriz de 63 canales × 80 muestras temporales (0 a 0,79 s tras la aparición de la imagen, muestreo a 100 Hz, en microvoltios), promediada por defecto sobre los diez participantes del dataset. Lo desarrolla el grupo EPFL NeuroAI y se publica bajo licencia Apache 2.0.

No es un modelo generativo de texto ni un VLM al uso: es un extractor de características (`feature-extraction`) que traduce estímulos visuales en actividad neuronal simulada. Esta relevante porque ataca una tarea de referencia consolidada (THINGS-EEG2) y ofrece cuatro variantes que intercambian precisión por velocidad y memoria, además de un modo de predicción para participantes no vistos en el entrenamiento. La variante `accurate` incorpora el codificador visual de Qwen3-Omni-30B-A3B-Thinking, mientras que las demás se apoyan en backbones ResNet y ViT-S de `timm`.

El modelo se distribuye con código propio (`trust_remote_code=True`), pesa 321,7 millones de parámetros según safetensors y el repositorio ocupa 21,8 GB (los pesos de Qwen se descargan aparte desde el repositorio original).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador imagen→EEG: backbones visuales (ResNet-18/50/152 + ViT-S, o ResNet-152 + visión de Qwen3-Omni) con cabecera de regresión a 63 canales × 80 instantes |
| Parametros totales | 321.697.312 (safetensors del repositorio) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de secuencia de texto) |
| Tipos de cuantizacion | no disponible; el autor documenta `torch.autocast` en float16 para las variantes `efficient`, `tiny` y `cnn` |
| Idiomas soportados | no disponible (la tarea no es lingüística) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con código de modelado propio (`modeling.py`) y wrappers de `transformers` |

## Arquitectura y entrenamiento

Cada variante combina uno o varios backbones de visión por computador preentrenados con una cabeza de predicción que emite la respuesta EEG completa. La variante `efficient` usa ResNet-50 + ViT-S; `tiny` usa ResNet-18 + ViT-S; `cnn` usa solo ResNet-152; y `accurate` añade el codificador visual de Qwen3-Omni-30B-A3B-Thinking junto a ResNet-152. Los backbones parten de pesos de `timm` (`vit_small_patch16_224.augreg_in21k_ft_in1k`) y de Qwen, y se ajustan de extremo a extremo sobre la tarea.

El ajuste se realizó sobre las 16.540 imágenes de entrenamiento de THINGS-EEG2 y la evaluación sobre las 200 imágenes de test, cuyos conceptos no aparecen en entrenamiento. El modelo predice por defecto el promedio de los diez participantes, pero también expone lecturas individuales (`sub-01` a `sub-10`) y un modo de participante nuevo que usa la media de los otros nueve. La salida sigue la referencia del benchmark de Gokce et al. (2026): respuesta promediada por ensayo, referencia de registro Fz (no incluida entre los 63 canales), en microvoltios.

## Capacidades

- Predicción de respuestas EEG a imágenes: salida de forma (lote, 63, 80) en microvoltios.
- Predicción promediada sobre participantes o desagregada por sujeto (`subjects="all"` o lista de identificadores).
- Generalización a participantes no vistos mediante el promedio de las lecturas de los otros nueve.
- Procesamiento por lotes de imágenes PIL con `batch_size` configurable (64 por defecto, 16 en `accurate`).
- Aceleración opcional con `torch.autocast` en float16 para las variantes ligeras, con desviación documentada de como máximo el 0,3 % de la desviación estándar de las salidas.
- Ejecución sin `transformers`, cargando directamente `modeling.py` con `torch`, `pillow`, `safetensors`, `huggingface-hub` y `numpy`.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un extractor de características.

## Casos de uso

- Investigación en neurociencia visual: generar respuestas EEG sintéticas para estímulos nuevos y compararlas con registros reales, usando el modo de participante nuevo como línea base antes de reclutar sujetos.
- Validación de pipelines de preprocesado EEG: producir señales de referencia con forma y escala conocidas (63 canales, 100 Hz, 0–0,79 s) para comprobar la corrección de línea base, el remuestreo y el recorte de épocas.
- Diseño de experimentos: estimar qué imágenes producen mayores diferencias entre participantes y priorizar estímulos antes de una campaña de registro costosa.
- Análisis de codificación: comparar la predicción del modelo con la respuesta medida para estudiar qué componentes de la señal dependen de la imagen y cuáles son ERP compartido.
- Evaluación de codificadores visuales: usar la correlación de test como métrica indirecta para comparar backbones (ResNet frente a ViT frente al codificador de Qwen3-Omni).
- Docencia y divulgación: demostrar la relación entre estímulo visual y actividad cerebral con un modelo ejecutable en una GPU de consumo en su variante `tiny`.
- Integración en pipelines de análisis por lotes: procesar conjuntos de imágenes a 68 imágenes/s (`efficient`) o 73 imágenes/s (`tiny`) en una A100 para generar datos aumentados de EEG.

## Benchmarks y rendimiento

Las puntuaciones son la correlación de Pearson de test (r) entre respuestas predichas y registradas sobre las 200 imágenes de test, por canal e instante, promediada sobre los puntos con techo de ruido superior a 0,1, y luego sobre participantes. Intervalos del 95 % de aproximadamente ±0,03.

| Variante | Redes de imagen | r (todos los canales) | r (occipital y parietal) | r (participante nuevo) | Descarga | Imágenes/s | Memoria GPU |
|---|---|---|---|---|---|---|---|
| `efficient` (por defecto) | ResNet-50 + ViT-S | 0,241 | 0,345 | 0,168 | 1,3 GB | 68 | 2,0 GiB |
| `tiny` | ResNet-18 + ViT-S | 0,235 | 0,335 | 0,164 | 0,25 GB | 73 | 0,7 GiB |
| `cnn` | ResNet-152 | 0,245 | 0,350 | 0,171 | 1,9 GB | 63 | 2,7 GiB |
| `accurate` | ResNet-152 + visión Qwen3-Omni | 0,261 | 0,373 | 0,184 | 7,5 GB + 4,0 GB de Qwen | 15 | 9,0 GiB |

Referencia: el mejor resultado del leaderboard del benchmark THINGS-EEG2 es 0,220 (todos los canales) y 0,324 (occipital y parietal). El autor documenta además que, para `efficient`, el R² es −0,005 con lectura propia por participante y −1,27 para participante nuevo, mientras que r es 0,241 y 0,168; explica que la mayor parte de la señal EEG es un ERP compartido independiente de la imagen y que el R² penaliza desajustes de amplitud y latencia.

## Requisitos de hardware

- Memoria GPU: 0,7 GiB (`tiny`), 2,0 GiB (`efficient`), 2,7 GiB (`cnn`), 9,0 GiB (`accurate`).
- GPU de referencia en las mediciones del autor: NVIDIA A100, con lote de 64 (16 en `accurate`).
- Las variantes `tiny`, `efficient` y `cnn` caben holgadamente en GPUs de consumo con 4–8 GB de VRAM; `accurate` necesita del orden de 9 GiB y descarga los pesos de Qwen3-Omni desde el repositorio de Qwen en una revisión fijada.
- Despliegue: carga mediante `transformers` con `trust_remote_code=True`, o directamente con `modeling.py` y `safetensors` sin `transformers`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no encajan con esta tarea.
- Rendimiento end-to-end desde imágenes PIL en una A100: 68 imágenes/s (`efficient`), 73 (`tiny`), 63 (`cnn`), 15 (`accurate`). En las variantes pequeñas el redimensionado en CPU marca el ritmo.
- `torch.autocast` en float16 acelera la parte GPU entre 1,5 y 4 veces en `efficient`, `tiny` y `cnn`.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `encoder-things-eeg2` (este) | Imagen → EEG (THINGS-EEG2) | 321,7 M | no aplica | Apache 2.0 | HuggingFace, código propio |
| Mejor entrada del leaderboard THINGS-EEG2 | Imagen → EEG (THINGS-EEG2) | no disponible | no aplica | no disponible | Leaderboard público en multimodal-brain-scaling.epfl.ch |
| Qwen3-Omni-30B-A3B-Thinking | Multimodal texto/visión/audio | 30B totales, 3B activos (MoE) | no disponible en la información | no disponible en la información | HuggingFace (Qwen) |

La comparación directa con otros codificadores de imagen a EEG no está disponible en la información proporcionada; la referencia objetiva es el leaderboard del benchmark, cuyo mejor resultado es 0,220 en todos los canales frente a 0,261 de la variante `accurate`.

## Limitaciones y advertencias

- El modelo predice respuestas medias de THINGS-EEG2; no modela variabilidad individual fuera de las diez lecturas por participante incluidas.
- La puntuación r de 0,24 implica explicar aproximadamente un 6 % de la varianza entre imágenes; el R² puede ser negativo incluso con r positivo, como documenta el autor.
- La salida asume un protocolo concreto: imagen mostrada 100 ms en secuencia rápida de cinco imágenes por segundo, referencia Fz, épocas de −0,2 a 0,8 s, remuestreo a 100 Hz y recorte a 0–0,79 s. Desviarse de ese protocolo invalida la comparación.
- El uso de `trust_remote_code=True` ejecuta código Python del repositorio en la máquina local; el autor recomienda revisarlo y fijar `revision`.
- La variante `accurate` depende de pesos de Qwen3-Omni descargados aparte en una revisión fijada, lo que añade 4,0 GB y una dependencia externa.
- No hay información sobre sesgos demográficos, cobertura lingüística ni comportamiento fuera de la población del dataset.
- No se documentan límites de uso comercial más allá de la licencia Apache 2.0.
- El repositorio ocupa 21,8 GB aunque solo se descarga la variante seleccionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/epfl-neuroai/encoder-things-eeg2
- Leaderboard del benchmark THINGS-EEG2: https://multimodal-brain-scaling.epfl.ch
- Benchmark de Gokce et al. (2026): https://openreview.net/forum?id=OQ6jQHJPTT
- Paper arXiv:2411.05712: https://arxiv.org/abs/2411.05712
- Paper arXiv:2509.17765: https://arxiv.org/abs/2509.17765
- Paper arXiv:2508.18571: https://arxiv.org/abs/2508.18571
- Paper arXiv:2404.05553: https://arxiv.org/abs/2404.05553
- Modelo base Qwen3-Omni-30B-A3B-Thinking: https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Thinking
- Modelo base ViT-S de timm: https://huggingface.co/timm/vit_small_patch16_224.augreg_in21k_ft_in1k
