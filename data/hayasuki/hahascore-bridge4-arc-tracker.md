# Hayasuki/hahascore-bridge4-arc-tracker

## Resumen

HaHaScore Bridge 4 (Humor Arc Tracker) es un modelo de detección de humor para audio desarrollado por el usuario Hayasuki y publicado en HuggingFace bajo licencia Apache 2.0. No es un modelo de lenguaje generativo: es un clasificador secuencial que recibe características acústicas por segmento y devuelve una puntuación de humor entre 0 y 1 para cada segmento de un vídeo de comedia. Su entrada son 791 dimensiones por segmento, resultado de concatenar 768 dimensiones del codificador WavLM-base-plus con 23 características de prosodia (MFCC, tono, RMS y ZCR), a las que se añaden 4 dimensiones de codificación posicional. El modelo tiene aproximadamente 790.000 parámetros entrenables, de modo que el coste dominante del pipeline recae en el extractor de características, no en la red recurrente.

La aportación principal del modelo es el modelado temporal explícito del humor. Su predecesor, el modelo de fusión v5, puntuaba cada segmento de forma independiente y obtenía un AUC de 0,632; Bridge 4 introduce una GRU bidireccional de dos capas que observa la secuencia completa de 20 segmentos y alcanza un AUC de 0,842 ± 0,027 en validación cruzada de 5 particiones, lo que supone una mejora relativa del 33 %. La hipótesis que sostiene el autor es que el humor cómico es un fenómeno secuencial —preparación y remate— y que la puntuación aislada de segmentos pierde esa estructura.

El modelo se entrenó sobre 639 vídeos de comedia del conjunto StandUp4AI con etiquetas pseudo-anotadas generadas por el propio modelo v5, no con valoraciones humanas. Esta decisión abarata el etiquetado, pero introduce un desplazamiento de distribución que el autor señala explícitamente como principal caveat: los resultados de 0,842 AUC son en distribución y no garantizan generalización a datos con anotación humana. El repositorio no incluye un README de uso más allá del fragmento de código, no publica pesos en formato safetensors y el tamaño declarado del repositorio es de 0,0 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BiGRU bidireccional de 2 capas (795 → 128 dimensiones) seguida de MLP (256 → 128 → 1) con sigmoide; extracción de características con WavLM-base-plus |
| Parámetros totales | Aproximadamente 790.000 parámetros entrenables (red de arcos); no incluye el extractor WavLM |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Secuencia fija de 20 segmentos de 3 segundos cada uno (entrada por segmento de 791 dimensiones más 4 de codificación posicional) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (el conjunto StandUp4AI es mayoritariamente comedia en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`pytorch_model.bin`); no se declara safetensors ni GGUF |

## Arquitectura y entrenamiento

El pipeline tiene dos etapas. Primero se extraen características por segmento: el audio se remuestrea de 16 kHz a 4 kHz (decisión de diseño que el autor justifica como un submuestreo 4× con pérdida de calidad calificada de despreciable) y se divide en 20 ventanas de 3 segundos. De cada ventana se obtiene un embedding de 768 dimensiones con WavLM-base-plus (media del último estado oculto) y 23 características de prosodia basadas en MFCC, tono, RMS y ZCR. A esas 791 dimensiones se añaden 4 dimensiones de codificación posicional, dando una entrada de 795 dimensiones por segmento. Después, una BiGRU bidireccional de dos capas proyecta cada segmento a 128 dimensiones y un MLP con capa oculta de 128 unidades y salida sigmoide produce la puntuación final de humor por segmento (0-1). La naturaleza bidireccional permite capturar tanto la preparación como el remate de un chiste, ya que cada posición atiende al contexto anterior y posterior de la secuencia.

El entrenamiento se realizó sobre 639 vídeos de comedia del conjunto StandUp4AI con etiquetas generadas por el modelo de fusión v5 (media 0,73, desviación típica 0,25). Por tanto, Bridge 4 aprende a imitar y refinar la distribución de puntuaciones de v5, no valoraciones humanas directas; no se menciona en la información disponible el uso de RLHF ni DPO. Entre los patrones que el autor reporta como aprendidos por el modelo destacan: los segmentos finales (posición 20, típicamente créditos o cierre) obtienen una media de 0,291 frente a 0,77 de los segmentos centrales; los segmentos de apertura ya aparecen elevados (media 0,70); las puntuaciones altas sostenidas durante varios segmentos indican un chiste fuerte, y las caídas bruscas suelen corresponder a transiciones o contenido no cómico.

## Capacidades

- Puntuación de humor por segmento: devuelve un valor continuo entre 0 y 1 para cada uno de los 20 segmentos de una secuencia de audio.
- Modelado de arcos temporales: la BiGRU captura la evolución del humor a lo largo del vídeo (preparación, pico y caída), no solo el contenido de cada fragmento aislado.
- Análisis de prosodia: integra MFCC, tono, RMS y ZCR por ventana de 3 segundos como señal complementaria al embedding acústico.
- Localización de picos de humor: permite identificar los segmentos con puntuación más alta y los tramos sostenidos de alta puntuación.
- Detección de transiciones: las caídas abruptas de puntuación se interpretan como cambios de contenido o segmentos no cómicos (por ejemplo, cierre o créditos).
- Operación sobre CPU: con unos 790.000 parámetros entrenables, la red de arcos se ejecuta en CPU sin problema.
- No soporta: generación de texto, tool calling, function calling, agentes, razonamiento multi-paso, visión, audio generativo ni diálogo. No acepta entrada de texto, por lo que el contenido verbal del chiste no se modela.
- Capacidad multilingüe: no disponible; el entrenamiento es exclusivamente en inglés.

## Casos de uso

- Indexación de catálogos de comedia en plataformas de streaming: el modelo permite puntuar cada segmento de un especial o un monólogo y generar metadatos con los momentos de mayor intensidad cómica, lo que alimenta recomendaciones basadas en el ritmo y no solo en la popularidad global.
- Generación automática de clips y tráilers: al disponer de una puntuación por segmento de 3 segundos, un sistema de post-producción puede seleccionar las ventanas de mayor puntuación y las rachas sostenidas para construir un montaje promocional sin revisión manual completa.
- Segmentación y etiquetado de archivos de vídeo largos: los descensos bruscos de puntuación sirven para detectar transiciones, créditos y bloques no cómicos, lo que facilita dividir el material en capítulos o secciones.
- Investigación en lingüística computacional y análisis del discurso: estudiar la estructura de los arcos de humor en corpus de comedia permite comparar patrones de construcción del chiste entre intérpretes o épocas, con una métrica objetiva y reproducible.
- Herramientas de apoyo para cómicos y guionistas: al visualizar la curva de humor de un ensayo grabado, el intérprete puede identificar qué fragmentos generan picos y dónde decae el ritmo antes de una actuación en directo.
- Pre-filtrado en sistemas de anotación humana: como primera pasada barata sobre grandes volúmenes de audio, el modelo prioriza qué segmentos merecen ser anotados por personas, reduciendo el coste de construir un conjunto con etiquetas doradas.
- Moderación y clasificación de contenido en bibliotecas de audio: distinguir automáticamente contenido cómico de otro tipo de material hablado (entrevistas, charlas técnicas) para enrutar cada pieza al pipeline de procesamiento adecuado.
- Control de calidad en la producción de subtitulado o doblaje: las caídas y picos de la curva de humor ayudan a verificar que la segmentación temporal utilizada en la post-producción coincide con la estructura real del material.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son la comparación con el modelo predecesor y la validación cruzada de 5 particiones.

| Modelo | AUC | Notas |
|---|---|---|
| Fusion v5 (bilineal por segmento) | 0,632 | Sin modelado temporal |
| Bridge 4 (BiGRU de arcos) | 0,842 ± 0,027 | Modelado secuencial de segmentos |

Validación cruzada de 5 particiones de Bridge 4:

| Partición | AUC |
|---|---|
| Fold 1 | 0,8459 |
| Fold 2 | 0,8575 |
| Fold 3 | 0,8509 |
| Fold 4 | 0,8667 |
| Fold 5 | 0,7898 |
| Media | 0,8422 ± 0,027 |

Advertencia del propio autor: la evaluación se realizó sobre datos pseudo-etiquetados (en distribución). La generalización real requiere una evaluación con datos de retención anotados por humanos. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar de modelos de lenguaje, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma explícita, pero con aproximadamente 790.000 parámetros entrenables en la red de arcos, el peso del modelo es de unos pocos megabytes en precisión completa (float32) y cabe holgadamente en cualquier GPU, incluso en tarjetas con 4 GB o menos. La red puede ejecutarse directamente en CPU.
- Coste dominante: la extracción de características con WavLM-base-plus por segmento es la parte más pesada del pipeline y determina el tiempo de proceso real.
- GPU recomendadas: para procesamiento por lotes de audio a escala, cualquier GPU con soporte CUDA es suficiente; no se dispone de recomendaciones del autor. El modelo de arcos por sí solo no justifica una GPU dedicada.
- GPU de consumo: sí, cabe en cualquier GPU de consumo actual e incluso en iGPU; el cuello de botella sería el extractor WavLM y el remuestreo de audio.
- Opciones de despliegue: el autor solo documenta el uso directo con PyTorch (carga del `pytorch_model.bin` con `torch.load` y `model.eval()`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.
- Dependencias del ejemplo de uso: `torch`, `numpy`, `librosa`, `pydub` y `transformers` (WavLMModel).

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Modelado temporal | AUC | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Bridge 4 (este modelo) | Aprox. 790 K (red de arcos) | WavLM-base-plus + prosodia | BiGRU bidireccional | 0,842 ± 0,027 | Apache 2.0 | HuggingFace (`Hayasuki/hahascore-bridge4-arc-tracker`) |
| Fusion v5 | No disponible | Características por segmento | Ninguno (bilineal por segmento) | 0,632 | No disponible | Referenciado en la model card, no se enlaza |
| Otros modelos públicos de detección de humor en audio | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |

La comparación solo puede establecerse con el predecesor directo, Fusion v5, ya que la información disponible no identifica alternativas públicas de la misma categoría. La única diferencia cuantificada entre ambos es la incorporación del modelado temporal: misma señal de entrada y mismo problema, con una mejora de 0,210 puntos absolutos de AUC.

## Limitaciones y advertencias

- Desplazamiento de distribución por pseudo-etiquetado: el modelo se entrenó sobre las salidas del modelo v5 (media 0,73, desviación típica 0,25), no sobre valoraciones humanas. Aprende a reproducir la distribución de v5, con sus sesgos incluidos, y los AUC reportados son en distribución.
- Ventanas de 3 segundos: la granularidad puede perder dinámicas de humor que cruzan segmentos, especialmente en chistes con pausas largas o estructuras no lineales.
- Solo inglés: el conjunto StandUp4AI es predominantemente comedia en inglés; no hay evidencia de comportamiento en otros idiomas.
- Sin entrada de texto: el modelo procesa únicamente audio y prosodia, de modo que el contenido semántico del chiste (juego de palabras, ironía verbal) no se modela en absoluto.
- Sensibilidad al pipeline de características: la puntuación depende críticamente de reproducir el mismo procedimiento de extracción (remuestreo a 4 kHz, 20 segmentos, dimensión exacta de 791 + 4), con medias y desviaciones típicas de prosodia publicadas en la model card. Cualquier variación degrada la salida.
- Sin validación con anotación humana: no hay resultados frente a un conjunto de retención con etiquetas doradas, por lo que el rendimiento en producción es incierto.
- Licencia: Apache 2.0, que permite uso comercial, modificación y redistribución, con la obligación habitual de conservar el aviso de licencia y el archivo de cambios. No se declaran restricciones adicionales de uso.
- Estado del repositorio: el tamaño declarado es de 0,0 GB y no se listan archivos de pesos ni `safetensors`. Antes de integrarlo conviene verificar que `pytorch_model.bin` está realmente disponible y que la carga con `strict=False` no está enmascarando claves ausentes.
- Sin mantenimiento demostrado: cero descargas y cero "likes" en el momento de la consulta; es un artefacto de investigación recién publicado, sin comunidad ni soporte.
- Uso responsable: un sistema de puntuación de humor puede heredar sesgos culturales y de estilo del corpus de entrenamiento (comedia en directo en inglés), por lo que no debería usarse para decisiones editoriales sin revisión humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Hayasuki/hahascore-bridge4-arc-tracker
- Conjunto de datos citado por el autor: StandUp4AI (no se proporciona enlace directo en la model card)
- Modelo predecesor citado: Fusion v5 (no se proporciona enlace directo en la model card)
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante al modelo, su paper, repositorio o demo. Las únicas páginas devueltas por la búsqueda son listados de bonos de casino sin relación alguna con el modelo.
