# OpenSportsLab/OSL-cls-RefPal-mvitv2

## Resumen

OSL-cls-RefPal-mvitv2 es un modelo de clasificación de vídeo para la detección y categorización de faltas en fútbol, desarrollado por OpenSportsLab. Clasifica cada clip en una de ocho categorías de falta (Challenge, Dive, Elbowing, High leg, Holding, Pushing, Standing tackling y Tackling) a partir de segmentos de vídeo de cinco segundos. El modelo se construye sobre el encoder MViTv2-S (`mvit_v2_s`) y se ha ajustado fino desde el checkpoint base `OpenSportsLab/OSL-cls-action-mvitv2`.

La innovación principal respecto a un clasificador de vídeo convencional es su estrategia temporal de agregación: en lugar de clasificar cada vista o segmento por separado y promediar probabilidades, el modelo extrae un vector de características de cada segmento de cinco segundos (16 fotogramas RGB a 224 × 224) y los combina mediante max pooling a nivel de característica antes del clasificador final. Esto permite producir una única etiqueta por vídeo completo, independientemente de su duración.

El modelo es relevante para el análisis automatizado de partidos y la asistencia arbitral, un nicho donde escasean los modelos abiertos especializados. Está entrenado sobre el dataset RefPal (19.215 clips de entrenamiento y 4.120 de validación) y se distribuye con licencia AGPL-3.0, lo que condiciona su uso en productos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MViTv2-S (`mvit_v2_s`), transformer de vídeo multiescala |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; procesa segmentos de 5 segundos con 16 fotogramas RGB a 224 × 224 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (tarea de visión, sin procesamiento de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | no disponible (repo de 0,4 GB, librería `opensportslib`) |

## Arquitectura y entrenamiento

El modelo emplea un encoder MViTv2-S compartido por todos los segmentos temporales. Cada vídeo se divide en segmentos consecutivos de cinco segundos; de cada segmento se muestrean 16 fotogramas RGB a resolución 224 × 224 que se pasan por el encoder. Los vectores de características resultantes se agregan mediante max pooling a nivel de característica (no se promedian probabilidades de clasificaciones independientes) y el vector agregado alimenta el clasificador final de ocho clases. Este diseño de "feature-max" permite manejar vídeos de duración variable produciendo una sola predicción por clip.

El ajuste fino se realizó sobre el dataset `OpenSportsLab/OSL-cls-RefPal-fouls` (19.215 clips de entrenamiento, 4.120 de validación) partiendo del checkpoint `OpenSportsLab/OSL-cls-action-mvitv2`. Se usó muestreo balanceado por clase y pérdida de entropía cruzada. El entrenamiento se detuvo tras siete épocas, reteniéndose el checkpoint de la época 4 por alcanzar la mayor balanced accuracy de validación (criterio `monitor=balanced_accuracy`, `mode=max`). Los detalles completos están en `config.yaml` y `training_summary.json` del repositorio.

## Capacidades

- Clasificación de vídeo en ocho clases de falta de fútbol: Challenge, Dive, Elbowing, High leg, Holding, Pushing, Standing tackling y Tackling.
- Procesamiento de vídeos de duración variable mediante segmentación temporal en ventanas de cinco segundos y agregación por max pooling de características.
- Producción de una única etiqueta de clasificación por vídeo completo.
- Inferencia por lotes sobre conjuntos de anotaciones mediante la API `ClassificationModel` de OpenSportsLib.
- Exportación de predicciones a JSON mediante `save_predictions`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un clasificador de visión puro.
- No dispone de modo de razonamiento (thinking), visión general, audio ni generación de texto.

## Casos de uso

- Asistencia arbitral en revisión de jugadas: el modelo clasifica un clip de vídeo en una de las ocho categorías de falta, sirviendo como señal previa para que un árbitro o sistema VAR revise las jugadas potencialmente sancionables.
- Etiquetado automático de archivos de vídeo deportivo: procesar un corpus de partidos para generar metadatos de faltas que alimenten un motor de búsqueda o un sistema de indexación de contenido.
- Análisis táctico y estadístico post-partido: agregar las predicciones por jugador o equipo para cuantificar la frecuencia de tipos de falta y detectar patrones de juego agresivo.
- Generación de datasets anotados: usar las predicciones del modelo como preetiquetado para reducir el coste de anotación manual en nuevos conjuntos de clips de fútbol.
- Investigación en visión por computador deportiva: servir como baseline reproducible (con métricas de validación publicadas) para comparar nuevas arquitecturas de clasificación de acciones.
- Monitorización en directo con latencia tolerada: integrado en un pipeline que segmenta el stream en ventanas de cinco segundos, puede marcar eventos candidatos para revisión humana, dado que el coste por clip es acotado (16 fotogramas por segmento).
- Filtrado de contenido en plataformas de vídeo deportivo: detección de clips con faltas para moderación o para generar avisos automáticos de contenido violento.

## Benchmarks y rendimiento

Resultados de validación sobre 4.120 clips (no se han publicado métricas de test; el split de test no se usó para los resultados de la model card):

| Metrica | Valor |
|---|---:|
| Accuracy | 62,48% |
| Balanced accuracy | 61,13% |
| Macro-F1 | 56,63% |

Rendimiento por clase en validación:

| Clase | Soporte | Precision | Recall | F1 |
|---|---:|---:|---:|---:|
| Challenge | 379 | 34,06% | 53,30% | 41,56% |
| Dive | 202 | 28,72% | 55,45% | 37,84% |
| Elbowing | 392 | 62,75% | 70,92% | 66,59% |
| High leg | 97 | 47,14% | 68,04% | 55,70% |
| Holding | 214 | 39,34% | 56,07% | 46,24% |
| Pushing | 622 | 71,54% | 45,66% | 55,74% |
| Standing tackling | 1.238 | 80,73% | 57,19% | 66,95% |
| Tackling | 976 | 82,46% | 82,38% | 82,42% |

No se han publicado comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,4 GB, lo que sugiere un modelo compacto apto para GPUs de gama media, pero no se confirma el tamaño exacto de parámetros.
- GPU recomendadas: no especificadas por el autor. Por el tamaño del encoder MViTv2-S, es razonable esperar que quepa en GPUs consumer (RTX 3060/4070/4090), aunque no hay confirmación oficial.
- Cabe en GPU consumer: probablemente sí, dado el tamaño del repo, pero no confirmado en la documentación.
- Opciones de despliegue: la vía oficial es la librería `opensportslib` mediante `ClassificationModel` con `config.yaml` y `weights`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (son herramientas para modelos de lenguaje, no aplicables aquí).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base del que parte (`OpenSportsLab/OSL-cls-action-mvitv2`) es el único pariente directo identificado, pero no se ofrecen métricas comparativas entre ambos.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OSL-cls-RefPal-mvitv2 | no disponible | segmentos de 5 s | AGPL-3.0 | Hugging Face |
| OSL-cls-action-mvitv2 (base) | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas de clasificación de acciones deportivas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los resultados reportados son métricas de validación, no de test held-out; el split de test no se utilizó y sus métricas se añadirán en una revisión futura.
- Rendimiento muy desigual entre clases: Challenge (precision 34,06%) y Dive (precision 28,72%) son poco fiables, mientras que Pushing tiene un recall bajo (45,66%). Tackling es la única clase con F1 superior al 80%.
- El modelo se entrenó con clips de faltas de fútbol de la distribución RefPal y puede no generalizar a otros deportes, competiciones, estilos de cámara o definiciones de etiqueta distintas.
- Una única etiqueta por clip no captura acciones simultáneas múltiples.
- Licencia AGPL-3.0: impone obligaciones de copyleft fuerte; el uso en productos comerciales propietarios o como servicio en red requiere revisión legal y, en general, liberar el código derivado bajo la misma licencia.
- No se documentan sesgos específicos más allá de los derivados del desbalance de clases y de la distribución del dataset.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos y negativos en la clasificación, especialmente en las clases con baja precisión.
- No hay información sobre cuantización ni formatos alternativos de pesos, lo que limita el despliegue fuera del ecosistema OpenSportsLib.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenSportsLab/OSL-cls-RefPal-mvitv2
- Modelo base: https://huggingface.co/OpenSportsLab/OSL-cls-action-mvitv2
- Dataset: https://huggingface.co/datasets/OpenSportsLab/OSL-cls-RefPal-fouls
- Repositorio de OpenSportsLib: https://github.com/OpenSportsLab/opensportslib
- Documentación de OpenSportsLab: https://opensportslab.github.io/opensportslib/
