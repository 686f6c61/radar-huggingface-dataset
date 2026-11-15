# LibreYOLO/LibreDDRNets-imagenet

## Resumen

LibreDDRNets-imagenet es un espejo del checkpoint oficial DDRNet-23-slim entrenado para clasificación en ImageNet-1K, publicado por el proyecto LibreYOLO. No se trata de un modelo de lenguaje, sino de una red convolucional de clasificación de imágenes que se utiliza como backbone preentrenado para inicializar el entrenamiento de segmentación semántica en la implementación `LibreDDRNet` del mismo proyecto. El checkpoint original procede del repositorio de referencia `ydhongHIT/DDRNet` (commit `de0db317c5af4b0946231f475cf74ca4f51b8ac2`), y el archivo `DDRNet23s_imagenet.pth` se redistribuye sin modificaciones, con SHA-256 `f6d03fa29b80e2e648f89a7639eb0c6d6c088e8f70f2cba1b2872b314a5c54b6`.

Su relevancia es acotada y muy específica: sirve para reproducir el flujo de entrenamiento de DDRNet para segmentación (por ejemplo, en Cityscapes) partiendo de pesos de clasificación, tal y como hace la receta original. Según la model card, el modelo reporta un error top-1 del 29,8 % en ImageNet-1K, dato atribuido al proyecto upstream. No es un modelo para inferencia de propósito general ni para tareas de lenguaje: es un artefacto de pesos orientado a pipelines de visión por computador.

El repositorio tiene un tamaño de 0,0 GB y no registra descargas ni interacciones en el momento de la consulta. La librería asociada es `libreyolo`, y la licencia declarada es MIT, aunque con un matiz importante que el propio autor explicita: la licencia se aplica sobre una base implícita, no confirmada por el publicador original de los pesos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DDRNet-23-slim (red convolucional con dual-resolution y DAPPM) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (clasificación de imágenes) |
| Licencia | MIT (según interpretación implícita de LibreYOLO; ver advertencias) |
| Formato de pesos | `.pth` (checkpoint PyTorch) |

## Arquitectura y entrenamiento

DDRNet (Deep Dual-resolution Network) es una arquitectura convolucional diseñada originalmente para segmentación semántica en tiempo real, basada en dos ramas de resolución complementaria que intercambian información mediante fusiones bilaterales. La variante `-23-slim` es la versión compacta de 23 capas. En este checkpoint, la red se configura como clasificador para ImageNet-1K: se conservan las capas convolucionales compartidas con la red de segmentación y se añade una cabeza de clasificación. El módulo DAPPM (Deep Aggregation Pyramid Pooling Module) y las cabezas de segmentación no forman parte de los pesos útiles para clasificación.

El entrenamiento se realizó sobre ImageNet-1K, el dataset estándar de clasificación de imágenes con 1.000 clases. La model card no detalla el número de épocas, la composición exacta del dataset ni si hubo técnicas de aumento de datos específicas más allá de lo indicado por el repositorio upstream. No se menciona RLHF, DPO ni ningún proceso de alineación, algo esperable en un modelo de visión. La innovación técnica relevante no está en este checkpoint en sí, sino en el uso previsto: servir de inicialización para el entrenamiento de segmentación, manteniendo los tensores compartidos y dejando DAPPM y las cabezas de segmentación en inicialización aleatoria, tal y como hace la receta original.

## Capacidades

- Clasificación de imágenes en 1.000 clases de ImageNet-1K.
- Extracción de características convolucionales como backbone para tareas posteriores de visión.
- Inicialización de entrenamiento de segmentación semántica en `LibreDDRNet`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión generativa, audio ni ninguna capacidad multimodal.

## Casos de uso

- Inicialización de segmentación semántica: el uso principal previsto es cargar estos pesos como backbone preentrenado en `LibreDDRNet` para entrenar segmentación (por ejemplo, con `cityscapes.yaml`), reproduciendo la receta upstream y acelerando la convergencia frente a un entrenamiento desde cero.
- Baseline de clasificación en investigación: sirve como referencia reproducible para comparar el rendimiento de clasificadores ligeros en ImageNet-1K, dado que el checkpoint está fijado por SHA-256 y no se modifica.
- Extracción de features para pipelines de visión: las capas convolucionales compartidas pueden emplearse como extractor de características en tareas downstream como detección o segmentación, aunque el proyecto no documenta esta integración de forma explícita.
- Reproducibilidad de experimentos: al ser un espejo byte a byte con verificación de hash en `libreyolo/models/ddrnet/convert.py`, permite reproducir resultados de papers o recetas que dependan del checkpoint original sin depender de Google Drive.
- Entrenamiento en entornos con verificación de integridad: la comprobación automática de SHA-256 en cada descarga encaja en pipelines de CI que requieren artefactos verificados.
- Docencia y experimentación con arquitecturas dual-resolution: útil para estudiar el comportamiento de DDRNet en clasificación antes de pasar a segmentación, con un coste computacional bajo al ser la variante slim.

## Benchmarks y rendimiento

| Benchmark | Métrica | Valor | Fuente |
|---|---|---|---|
| ImageNet-1K | Error top-1 | 29,8 % | Model card (atribuido a upstream) |

No se han publicado en la información disponible resultados adicionales de benchmarks (top-5, throughput, latencia) ni comparativas numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; al ser una variante slim de 23 capas, es previsible que quepa en GPUs de consumo, pero no se aporta una cifra verificable.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; por el tamaño del repo (0,0 GB) y la variante slim, es plausible, pero no se documenta.
- Opciones de despliegue: la librería indicada es `libreyolo`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de visión de este tipo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros clasificadores o backbones comparables (por ejemplo, ResNet, MobileNet u otras variantes de DDRNet) con métricas que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La licencia MIT se aplica sobre una base implícita: el autor original no declaró términos separados para los pesos, y LibreYOLO lo interpreta como MIT. Es una interpretación divulgada, no una licencia confirmada por el publicador.
- Los pesos se entrenaron con ImageNet-1K, cuyos términos de acceso son para investigación no comercial y uso educativo; esto condiciona el uso comercial aunque la licencia del repo sea MIT.
- El modelo solo clasifica imágenes; no genera texto ni mantiene conversaciones.
- No se documentan sesgos específicos, pero al entrenarse en ImageNet-1K hereda los sesgos de representación de ese dataset.
- Riesgo de alucinación no aplica en el sentido habitual; sí existe riesgo de clasificaciones erróneas o sobreconfiadas en clases poco representadas.
- No hay información sobre cuantizaciones soportadas, latencia ni requisitos de hardware verificados.
- El checkpoint está pensado para inicializar segmentación, no como clasificador de producción; su uso directo como clasificador final no está validado por el proyecto.
- El repositorio no registra descargas ni validación comunitaria, por lo que la fiabilidad práctica no está contrastada.

## Enlaces

- Hugging Face: https://huggingface.co/LibreYOLO/LibreDDRNets-imagenet
- Repositorio upstream DDRNet: https://github.com/ydhongHIT/DDRNet
- Checkpoint original (Google Drive): https://drive.google.com/file/d/1mg5tMX7TJ9ZVcAiGSB4PEihPtrJyalB4/view
- Commit upstream referenciado: `de0db317c5af4b0946231f475cf74ca4f51b8ac2`
