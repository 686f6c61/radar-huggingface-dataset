# songbirdini/callmark-birdcode

## Resumen

CallMark BirdCODE es un conjunto de pesos derivados del modelo BirdCODE de Earth Species Project, publicados por el usuario songbirdini como material de reproducibilidad del artículo CallMark. El repositorio contiene modelos afinados para dos tareas de bioacústica computacional: detección de vocalizaciones de aves (`detector_<size>`) e identificación de la especie o taxón emisor (`identifier_<size>`). Los sufijos 50, 100 y 500 indican el número de vocalizaciones de entrenamiento por taxón utilizadas en cada variante.

El modelo parte de `EarthSpeciesProject/sed-birdcode`, un modelo de audio de tipo SED (sound event detection) preentrenado sobre datos bioacústicos. Sobre esa base, CallMark aplica un proceso de ajuste fino orientado a evaluar la reproducibilidad de pipelines de detección e identificación de cantos de aves. No se trata de un modelo de lenguaje, sino de un modelo de audio especializado en señales acústicas naturales.

La relevancia de esta publicación es acotada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, carece de model card detallada más allá de las instrucciones de descarga y no declara licencia propia, remitiéndose a los términos del release original de BirdCODE. Es material de investigación reproducible más que un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de `EarthSpeciesProject/sed-birdcode`, modelo de detección de eventos sonoros) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de audio bioacústico, no lingüístico) |
| Licencia | no disponible explícitamente; se remite a los términos de `EarthSpeciesProject/sed-birdcode` |
| Formato de pesos | no disponible (repo de 2,2 GB, presumiblemente checkpoints de PyTorch) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna. El modelo base `EarthSpeciesProject/sed-birdcode` pertenece a la familia de modelos de detección de eventos sonoros (SED) aplicados a bioacústica, que habitualmente combinan un extractor de características acústicas con una cabeza de clasificación temporal. CallMark añade un ajuste fino supervisado sobre vocalizaciones de aves etiquetadas por taxón.

El proceso de entrenamiento varía según la variante: las versiones 50, 100 y 500 se entrenan con 50, 100 y 500 vocalizaciones por taxón respectivamente, lo que permite estudiar el efecto del tamaño del conjunto de entrenamiento en la reproducibilidad de los resultados. No se especifican en la información proporcionada el número total de tokens ni de horas de audio, la composición del dataset, ni si se emplearon técnicas de aumento de datos o regularización.

## Capacidades

- Detección de vocalizaciones de aves en grabaciones de audio (variantes `detector_<size>`).
- Identificación del taxón emisor a partir de una vocalización detectada (variantes `identifier_<size>`).
- Ajuste fino con distintos volúmenes de datos por taxón (50, 100, 500 vocalizaciones) para análisis de robustez.
- Integración con los scripts de predicción del repositorio `marisbasha/callmark_reproducibility`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de texto o visión.

## Casos de uso

- Monitorización de biodiversidad aviar: el modelo permite detectar presencia de cantos en grabaciones de campo y clasificar la especie, útil en estudios de seguimiento ecológico a largo plazo.
- Análisis de paisajes sonoros: procesamiento de horas de audio pasivo (passive acoustic monitoring) para extraer eventos de vocalización y reducir el trabajo manual de anotación.
- Reproducibilidad de investigación: las tres variantes de tamaño permiten replicar los experimentos del artículo CallMark y evaluar la sensibilidad de los resultados al volumen de datos de entrenamiento.
- Evaluación comparativa de modelos bioacústicos: sirve como baseline afinado sobre BirdCODE para contrastar con otros detectores/identificadores en la misma tarea.
- Filtrado previo en pipelines de anotación: el detector puede priorizar segmentos candidatos antes de la revisión humana, reduciendo el coste de etiquetado.
- Estudios de variabilidad acústica: el identificador permite agrupar vocalizaciones por taxón para análisis de repertorio o comparación entre poblaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa 2,2 GB, lo que sugiere que la inferencia cabe en GPUs de consumo con al menos 4-8 GB de VRAM, pero este dato no está confirmado.
- GPU recomendadas: no disponible. Por el tamaño del repo, es plausible su ejecución en RTX 3060/4060 o superiores, pero no se documenta.
- Despliegue: los pesos están pensados para usarse con los scripts del repositorio `callmark_reproducibility`, no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|
| CallMark BirdCODE (este) | Detección e identificación de cantos de aves | 50/100/500 vocalizaciones por taxón | Remitida a BirdCODE | Hugging Face, 0 descargas |
| `EarthSpeciesProject/sed-birdcode` | Detección de eventos sonoros bioacústicos | No disponible | Términos del release original | Hugging Face |
| Otros modelos bioacústicos (BirdNET, Perch) | Identificación de aves | No disponible en esta ficha | No disponible | No disponible en esta ficha |

La comparación cuantitativa con alternativas no es posible con la información proporcionada.

## Limitaciones y advertencias

- Licencia no declarada explícitamente: los términos de `EarthSpeciesProject/sed-birdcode` se aplican a estos pesos, por lo que el uso comercial queda sujeto a lo que ese release permita, sin que esta ficha pueda confirmarlo.
- Sin model card detallada: no hay información sobre sesgos, cobertura taxonómica, calidad del dataset ni métricas de validación.
- Riesgo de falsos positivos y negativos en detección: al ser un modelo afinado con pocas muestras por taxón (50-500), la generalización a especies o entornos no representados en entrenamiento puede degradarse.
- Sesgo geográfico y taxonómico probable: los conjuntos bioacústicos suelen estar dominados por especies de regiones concretas; no se documenta la cobertura.
- Sin soporte documentado para texto, código ni tareas generales: no debe emplearse fuera de su dominio acústico.
- Repositorio sin adopción (0 descargas, 0 likes) y sin mantenimiento aparente más allá de la fecha de creación (2026-11-21), lo que limita la confianza para uso en producción.
- No se especifican requisitos de preprocesado de audio (frecuencia de muestreo, duración de ventana), que deben consultarse en el repositorio de código.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/songbirdini/callmark-birdcode
- Repositorio de reproducibilidad de CallMark: https://github.com/marisbasha/callmark_reproducibility
- Modelo base BirdCODE: https://huggingface.co/EarthSpeciesProject/sed-birdcode
