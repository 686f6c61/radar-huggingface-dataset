# epfl-neuroai/encoder-tvsd

## Resumen

`encoder-tvsd` es un conjunto de codificadores neuronales desarrollado por el grupo `epfl-neuroai` de la EPFL que predicen la respuesta de la vía visual ventral del macaco ante imágenes. El modelo se entrena sobre el THINGS Ventral Stream Spiking Dataset (TVSD), que registra actividad multiunitaria en las áreas V1, V4 e IT de dos monos, con un valor por imagen para cada uno de 1.704 electrodos fiables. El modelo resuelve un problema clásico de neurociencia computacional: predecir la actividad neuronal a partir de estímulos visuales, lo que permite evaluar y comparar representaciones de redes neuronales artificiales frente a las biológicas.

Técnicamente no es un modelo generativo ni un LLM, sino un codificador de características con cabezas de regresión lineal por electrodo. Se distribuye en cuatro variantes que intercambian precisión por velocidad, desde `tiny` (ResNet-18 + ViT-S) hasta `accurate` (ResNet-152 + DINOv2-B + la torre de visión de Qwen3-VL-2B). El modelo base declarado es `Qwen/Qwen3-VL-2B-Instruct` para la variante `accurate`, aunque el conjunto de pesos totales asciende a 1.682.342.952 parámetros según los safetensors del repositorio.

Su relevancia actual radica en que ofrece un banco de pruebas cuantitativo y reproducible para estudiar qué arquitecturas de visión artificial se alinean mejor con la corteza visual del primate, con resultados normalizados por el techo de ruido de cada electrodo y comparaciones contra baselines sin ajuste fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de imagen (ResNet y/o ViT) con cabezas de regresión lineal por electrodo; variante `accurate` incorpora la torre de visión de Qwen3-VL-2B |
| Parametros totales | 1.682.342.952 (conjunto completo del repositorio) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; entrada de una imagen por predicción) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con código Python propio (`modeling.py`) y wrappers de `transformers` |

## Arquitectura y entrenamiento

El modelo es un codificador de imágenes con múltiples torres según la variante. `efficient` combina ResNet-50 y ViT-S; `tiny` usa ResNet-18 y ViT-S; `cnn` emplea únicamente ResNet-152; y `accurate` combina ResNet-152, DINOv2-B y la torre de visión de Qwen3-VL-2B-Instruct. Sobre las características extraídas se aplican cabezas de regresión lineal específicas por electrodo para predecir la actividad multiunitaria normalizada. No se trata de un transformer autoregresivo ni de un modelo con mecanismo de atención de contexto largo: la salida es un tensor de predicciones por área y por mono.

El ajuste se realizó sobre las 22.248 imágenes de entrenamiento del TVSD y se evaluó sobre las 100 imágenes de test. Las etiquetas son la actividad multiunitaria normalizada y promediada en una ventana temporal tras la aparición del estímulo, con un valor por imagen. Los modelos predicen únicamente los electrodos cuya fiabilidad publicada es al menos 0,1: 437, 247 y 178 en V1, V4 e IT del mono N, y 462, 139 y 241 en el mono F. La innovación destacable es el uso de múltiples backbones preentrenados y el ajuste fino conjunto con cabezas lineales, así como la exposición de `model.features(images, area)` para reutilizar las representaciones en otros conjuntos de datos mediante regresión ridge.

## Capacidades

- Predicción de actividad neuronal multiunitaria en V1, V4 e IT de dos macacos a partir de imágenes.
- Extracción de características intermedias por área (`model.features(images, "IT")`) para ajustar readouts lineales propios sobre otros registros.
- Procesamiento por lotes de imágenes PIL con `batch_size` configurable (por defecto 32).
- Salida estructurada por mono y área: `{"monkeyN": {"V1": ..., "V4": ..., "IT": ...}, "monkeyF": {...}}`.
- Selección de variante en tiempo de carga (`tiny`, `cnn`, `efficient`, `accurate`) descargando solo los pesos de la variante elegida.
- Mapeo de índices de electrodo a canales de `THINGS_normMUA.mat` mediante `model.config.electrode_index`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto; no es un modelo de lenguaje.
- Capacidades multilingües no aplicables.

## Casos de uso

- Investigación en neurociencia visual: comparar la alineación de distintas arquitecturas (ResNet, ViT, DINOv2, Qwen3-VL) con la actividad de V1, V4 e IT, usando las puntuaciones normalizadas por techo de ruido como métrica objetiva.
- Evaluación de modelos de visión artificial: usar `encoder-tvsd` como referencia para medir si una nueva red neuronal artificial predice mejor o peor la corteza visual del primate que los backbones incluidos.
- Transferencia a nuevos registros electrofisiológicos: extraer características con `model.features` y ajustar una regresión ridge sobre datos de otros monos, áreas o sesiones, como se hizo con Majaj-Hong, MacaqueITBench y Freeman-Ziemba.
- Generación de estímulos optimizados: emplear el modelo como función objetivo diferenciable para sintetizar imágenes que maximicen la respuesta predicha en un electrodo o área concreta.
- Análisis de selectividad funcional: estudiar qué propiedades de imagen (forma, textura, categoría) correlacionan con la actividad predicha en IT frente a V1/V4.
- Docencia y divulgación: disponer de un pipeline reproducible en PyTorch para ilustrar la codificación neuronal y el ajuste de modelos predictivos en cursos de neurociencia computacional.
- Benchmarking de eficiencia: comparar las cuatro variantes en términos de imágenes por segundo y memoria GPU para elegir el compromiso adecuado en experimentos a gran escala.

## Benchmarks y rendimiento

Resultados de test sobre TVSD (correlación de Pearson por electrodo dividida por el techo de ruido, promediada por área y por los dos monos):

| Variante | V1 | V4 | IT | Imágenes/s (A100, batch 32) | Memoria GPU |
|---|---|---|---|---|---|
| `efficient` (por defecto) | 0,923 | 0,877 | 0,868 | 53 | 8,4 GiB |
| `tiny` | 0,924 | 0,876 | 0,865 | 63 | 6,7 GiB |
| `cnn` | 0,913 | 0,844 | 0,862 | 45 | 10,8 GiB |
| `accurate` | 0,935 | 0,898 | 0,888 | 6,3 | 16,5 GiB |
| Mejor modelo único del benchmark TVSD (ResNet-152 adversarial, sin ajuste fino) | 0,842 | 0,781 | 0,789 | No disponible | No disponible |

Transferencia a otros conjuntos de datos (r / techo de ruido; en MacaqueITBench, r / √fiabilidad):

| Conjunto | `accurate` | `cnn` | `efficient` | `tiny` | Mejor capa sin ajuste fino |
|---|---|---|---|---|---|
| Majaj-Hong V4 | 0,794 | 0,788 | 0,777 | 0,779 | 0,733 |
| Majaj-Hong IT | 0,757 | 0,751 | 0,753 | 0,743 | 0,731 |
| MacaqueITBench IT | 0,479 | 0,474 | 0,474 | 0,474 | 0,461 |
| Freeman-Ziemba V1 | 0,312 | 0,397 | 0,306 | 0,310 | 0,400 |
| Freeman-Ziemba V2 | 0,413 | 0,432 | 0,401 | 0,401 | 0,468 |

## Requisitos de hardware

- VRAM estimada para inferencia: 6,7 GiB (`tiny`), 8,4 GiB (`efficient`), 10,8 GiB (`cnn`), 16,5 GiB (`accurate`), medidos en una NVIDIA A100 con batch 32.
- GPU recomendadas: NVIDIA A100 para las cifras publicadas; H100 para mayor throughput; RTX 4090 (24 GB) suficiente para las cuatro variantes.
- Cabe en GPU de consumo: sí, al menos en RTX 4090 y GPUs con 16 GB o más para `accurate`; `tiny` y `efficient` caben en GPUs de 8-12 GB.
- Opciones de despliegue: PyTorch nativo con `transformers` (`trust_remote_code=True`) o carga directa de `modeling.py` sin `transformers`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 53 imágenes/s (`efficient`), 63 (`tiny`), 45 (`cnn`) y 6,3 (`accurate`) en una A100 con batch 32.
- Tamaño de descarga: 5,1 GB (`tiny`), 6,7 GB (`efficient`), 9,3 GB (`cnn`), 12,6 GB más 4,3 GB de Qwen (`accurate`); el repositorio completo ocupa 33,7 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | TVSD IT (r/techo) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `encoder-tvsd` (`accurate`) | 1.682 M (conjunto) | No aplica | 0,888 | Apache 2.0 | Hugging Face |
| `encoder-tvsd` (`efficient`) | 1.682 M (conjunto) | No aplica | 0,868 | Apache 2.0 | Hugging Face |
| ResNet-152 adversarial sin ajuste fino (mejor baseline TVSD) | No disponible | No aplica | 0,789 | No disponible | Benchmark TVSD |
| Mejor capa de los backbones sin ajuste fino (Majaj-Hong IT) | No disponible | No aplica | 0,731 | No disponible | Referencia en model card |

No se dispone de información sobre otros codificadores neuronales comparables publicados con licencia y disponibilidad equivalentes.

## Limitaciones y advertencias

- Los readouts están ajustados a los electrodos concretos de dos monos del TVSD; para otros animales, sitios de registro o conjuntos de datos es necesario ajustar un readout propio sobre `model.features`.
- Solo se predicen electrodos con fiabilidad publicada igual o superior a 0,1; el resto queda fuera del alcance del modelo.
- El rendimiento en V1 y V2 de Freeman-Ziemba es inferior al de la mejor capa sin ajuste fino, lo que indica que la transferencia no es universal.
- `accurate` es aproximadamente diez veces más lento que `efficient` a cambio de una mejora de 0,01 a 0,02 en r/techo.
- El uso de `trust_remote_code=True` ejecuta código Python del repositorio en la máquina local; se recomienda revisar `modeling.py` y fijar `revision`.
- La variante `accurate` descarga pesos de Qwen3-VL-2B desde el repositorio de Qwen en una revisión fijada, lo que añade una dependencia externa.
- No se documentan sesgos, riesgos de alucinación ni comportamiento multilingüe porque el modelo no genera texto.
- Licencia Apache 2.0: permite uso comercial, pero las condiciones de los modelos base (timm y Qwen) deben verificarse por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/epfl-neuroai/encoder-tvsd
- Benchmark TVSD: https://multimodal-brain-scaling.epfl.ch
- Paper arXiv 2411.05712: https://arxiv.org/abs/2411.05712
- Paper arXiv 2511.21631: https://arxiv.org/abs/2511.21631
- Paper arXiv 2406.16935: https://arxiv.org/abs/2406.16935
- Modelo base Qwen3-VL-2B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Modelo base ViT-S (timm): https://huggingface.co/timm/vit_small_patch16_224.augreg_in21k_ft_in1k
- Modelo base DINOv2-B (timm): https://huggingface.co/timm/vit_base_patch14_dinov2.lvd142m
