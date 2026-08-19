# andrew-avinante/cdml-fade-detector

## Resumen

El modelo `andrew-avinante/cdml-fade-detector` es un checkpoint de PyTorch especializado en la detección de fundidos a negro y a silencio en vídeo episódico, con el objetivo de localizar los límites de los cortes comerciales. Desarrollado por Andrew Avinante como parte del proyecto CDML (Commercial Detection Machine Learning), este modelo no es un clasificador general de vídeo ni un modelo de lenguaje, sino una herramienta de propósito específico para el procesamiento de señales audiovisuales.

Con aproximadamente 230.000 parámetros, el modelo procesa ventanas de 8 segundos de vídeo (192 frames a 24 fps) en escala de grises de 64×64 píxeles, junto con características de audio alineadas (nivel log-RMS y 16 bandas mel). La arquitectura combina una CNN compartida por frame con estadísticas de luminancia y movimiento, y modela la secuencia fusionada mediante una GRU bidireccional de dos capas. Su salida es una probabilidad de fundido por frame, que posteriormente se convierte en eventos temporales mediante post-procesamiento con histéresis y reglas de duración mínima.

La relevancia de este modelo radica en su enfoque ligero y específico para una tarea muy concreta: la identificación de pausas comerciales en contenido episódico, útil para la organización de bibliotecas de medios, flujos de revisión y generación automática de capítulos. Su licencia Apache-2.0 permite uso comercial y modificación, aunque el autor advierte que no debe emplearse como única base para decisiones de alto impacto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN compartida por frame + GRU bidireccional de 2 capas |
| Parametros totales | ~230.000 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Ventana de 8 segundos (192 frames a 24 fps) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (procesa vídeo y audio, no texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

El modelo aplica una CNN compartida de cuatro etapas a cada frame de vídeo en escala de grises (64×64), extrayendo un embedding por frame. Este embedding se combina con seis estadísticas de luminancia y movimiento calculadas sobre la ventana. Paralelamente, las 17 características de audio (log-RMS más 16 energías de bandas mel) se proyectan mediante una capa lineal. La secuencia resultante se modela con una GRU bidireccional de dos capas, que produce una puntuación de fundido para cada frame. Las puntuaciones de ventanas solapadas se suavizan y se convierten en eventos mediante histéresis y una regla de duración mínima.

El entrenamiento se realizó sobre 2.032 ventanas extraídas de 83 episodios privados pertenecientes a cuatro series distintas. Las etiquetas se derivaron de los marcadores de capítulos existentes en los contenedores de los episodios, identificando fundidos asociados a cortes comerciales. Se utilizaron tres tipos de ventanas: positivas (fundidos de corte comercial), negativos duros (transiciones de escena que no son cortes comerciales) y negativos fáciles (metraje ordinario sin fundidos). Los conjuntos de entrenamiento, validación y prueba se separaron por episodio para evitar fugas entre divisiones. La configuración de entrenamiento incluyó un máximo de 120 épocas con parada temprana basada en la precisión media de validación, optimizador AdamW con tasa de aprendizaje 3e-4, tamaño de lote 16, cinco épocas de calentamiento, decaimiento coseno y ponderación de clases derivada de las etiquetas de entrenamiento.

## Capacidades

- Detección de fundidos a negro y a silencio en vídeo episódico, emitiendo una probabilidad por frame.
- Identificación de límites de cortes comerciales en contenido que utiliza la transición pareada de negro y silencio.
- Post-procesamiento integrado para convertir puntuaciones en eventos temporales con histéresis y duración mínima.
- Generación de marcadores de capítulos en archivos de vídeo sin re-codificación (mediante el código CDML).
- Procesamiento conjunto de señales de vídeo y audio alineadas a nivel de frame.
- Ligero y eficiente: 230.000 parámetros, apto para ejecución en CPU o GPU modesta.

## Casos de uso

- Organización de bibliotecas de medios personales: el modelo puede analizar episodios grabados y marcar automáticamente los puntos donde comienzan y terminan los bloques comerciales, facilitando la limpieza o el salto de anuncios en reproductores locales.
- Flujos de revisión de contenido: los editores o revisores pueden usar las predicciones para saltar directamente a los límites de los cortes, ahorrando tiempo en la inspección manual de episodios largos.
- Generación de capítulos en archivos de vídeo: mediante el comando `cdml.mark_chapters`, se pueden escribir marcadores de capítulos en los contenedores (por ejemplo, MKV) sin re-codificar, útil para organizar colecciones de series.
- Automatización de transcodificación: antes de re-codificar un lote de episodios, el modelo puede identificar los segmentos comerciales para excluirlos del proceso de conversión, reduciendo el tamaño de salida.
- Análisis de patrones de emisión: para broadcasters o estudios con derechos sobre el material, el modelo puede cuantificar la frecuencia y duración de las pausas comerciales en episodios históricos.
- Investigación en detección de transiciones: sirve como punto de partida para estudios sobre detección de fundidos en vídeo, dado su diseño compacto y su documentación detallada del proceso de entrenamiento.

## Benchmarks y rendimiento

La model card incluye resultados de evaluación sobre un conjunto de prueba reservado (agrupado por episodio) y un análisis de transferencia leave-one-show-out. El umbral se seleccionó en la validación y el conjunto de prueba se puntuó una sola vez.

| Métrica | Detector CDML | Baseline de umbral |
| --- | ---: | ---: |
| Precisión media (AP) | 0.9823 | 0.7792 |
| F1 por frame | 0.9654 | 0.7255 |
| F1 por evento | 0.9840 | 0.7782 |
| Eventos no detectados | 0 de 123 | 9 de 123 |

Resultados de transferencia a series no vistas durante el entrenamiento:

| Serie excluida | Precisión media | F1 por evento | Recall por evento |
| --- | ---: | ---: | ---: |
| Serie A (animación) | 0.9709 | 0.9545 | 1.000 |
| Serie B (animación) | 0.9634 | 0.9067 | 0.872 |
| Serie C (acción real) | 0.9449 | 0.9061 | 0.967 |
| Serie D (animación) | 0.9313 | 0.7606 | 0.643 |

Estos resultados son agregados sobre el corpus privado descrito y no constituyen una garantía de precisión para otras series, codificaciones o estilos de pausa. Los informes completos están disponibles en el repositorio fuente.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la documentación, pero dado el tamaño del modelo (~230.000 parámetros) y la entrada de 64×64 en escala de grises, la inferencia es extremadamente ligera.
- Puede ejecutarse en CPU sin problema; una GPU con al menos 1-2 GB de VRAM sería más que suficiente para procesamiento por lotes.
- Se requieren Python 3.10 o superior, PyTorch 2.4 o superior, y `ffmpeg`/`ffprobe` disponibles en el `PATH`.
- El despliegue se realiza mediante el paquete CDML (`pip install "git+https://github.com/andrew-avinante/commercial-detctor-ml.git"`), no mediante servidores de inferencia como vLLM u Ollama.
- La latencia por ventana de 8 segundos es baja; en CPU puede procesar varias ventanas por segundo, aunque depende del hardware.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El baseline de umbral presentado en la evaluación sirve como referencia, pero no es un modelo alternativo. Se recomienda consultar el repositorio CDML para posibles comparaciones futuras.

## Limitaciones y advertencias

- El modelo puede fallar en cortes comerciales que no utilicen la transición pareada de negro y silencio.
- Transiciones de escena oscuras o material silencioso (créditos finales, etc.) pueden generar falsos positivos.
- El rendimiento se degrada en series con fundidos inusualmente largos, como se observó en la Serie D del estudio leave-one-show-out.
- Los resultados pueden variar con formatos de vídeo, frecuencias de imagen, codificaciones, mezclas de sonido o estilos de programa distintos a los del corpus de entrenamiento.
- El modelo no reconoce anuncios, personas ni contenido; solo detecta patrones de fundido.
- No debe utilizarse como única base para decisiones de alto impacto; se recomienda revisar las predicciones antes de modificar metadatos de capítulos de forma irreversible.
- La licencia Apache-2.0 cubre el checkpoint y el código, pero no otorga derechos sobre el material de entrenamiento subyacente, que no se distribuye.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/andrew-avinante/cdml-fade-detector)
- [Repositorio CDML en GitHub](https://github.com/andrew-avinante/commercial-detctor-ml)
- [Informe de evaluación held-out](https://github.com/andrew-avinante/commercial-detctor-ml/blob/main/results/evaluation_report.json)
- [Informes leave-one-show-out](https://github.com/andrew-avinante/commercial-detctor-ml/tree/main/results)
