# ina-foss/ssl-music-detection-only_speech

## Resumen

El modelo `ina-foss/ssl-music-detection-only_speech` es un clasificador de audio especializado en la detección de música, desarrollado por el equipo INA-FOSS (vinculado al Institut National de l'Audiovisuel francés). Se trata de un fine-tuning del modelo base `ina-foss/ssl-audio-1k-only_speech`, un modelo de representación auto-supervisada de audio, adaptado específicamente a la tarea de distinguir segmentos musicales dentro de flujos de audio. El problema que resuelve es acotado pero relevante en pipelines de archivística audiovisual: identificar de forma automática qué tramos de una grabación contienen música, lo que permite indexar, separar o tratar derechos musicales de forma diferenciada.

El modelo se publica bajo la licencia `pantagruel-research-license` (marcada como "other" en Hugging Face) y su acceso está restringido: requiere aceptar condiciones en la plataforma antes de poder descargarlo. El repositorio ocupa aproximadamente 0,2 GB, lo que sugiere un modelo compacto, y se distribuye en formato `safetensors` con código personalizado (`custom_code`), lo que implica que la carga requiere confiar en implementaciones remotas o incluidas en el repo.

La relevancia de este modelo es doble. Por un lado, demuestra el patrón de reutilización de representaciones SSL de audio para tareas de clasificación binaria o multietiqueta muy específicas (detección de música). Por otro, forma parte de una familia de modelos (INA-FOSS) orientada al procesamiento de archivos audiovisuales a gran escala, un nicho donde las soluciones genéricas de audio suelen rendir peor que los fine-tunings especializados. No obstante, la información pública disponible es escasa y no se han publicado resultados de benchmarks en la documentación accesible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tuning de `ina-foss/ssl-audio-1k-only_speech`, representación SSL de audio; detalles del backbone no publicados en la información disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana de entrada no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (tarea de audio, independiente de idioma hablado) |
| Licencia | pantagruel-research-license (marcada como "other" en Hugging Face) |
| Formato de pesos | safetensors |
| Pipeline | audio-classification |
| Tamano del repositorio | ~0,2 GB |
| Acceso | restringido (gated), requiere aceptar condiciones |
| Modelo base | ina-foss/ssl-audio-1k-only_speech |
| Libreria | transformers (con custom_code) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint `ina-foss/ssl-audio-1k-only_speech`, que pertenece a la familia de modelos SSL (self-supervised learning) de audio de INA-FOSS. La arquitectura concreta del backbone no se detalla en la información disponible; por el nombre del modelo base ("ssl-audio-1k") se infiere que se entrenó de forma auto-supervisada sobre un corpus de audio de aproximadamente mil horas, aunque este dato no está confirmado en la documentación accesible. El fine-tuning se orienta a una tarea de clasificación de audio (detección de música), lo que típicamente implica añadir una cabeza de clasificación sobre las representaciones del encoder.

No se dispone de información sobre el volumen de datos de fine-tuning, la composición del dataset (proporción de segmentos musicales frente a no musicales), el uso de RLHF/DPO (poco probable en una tarea de clasificación) ni innovaciones técnicas específicas como decodificación especulativa o atención lineal. El repositorio incluye logs de TensorBoard (`tensorboard` en los tags), lo que sugiere que el entrenamiento se monitorizó con esta herramienta, pero los detalles no están publicados. La presencia de `custom_code` indica que la arquitectura o el pipeline de inferencia requiere código específico incluido en el repositorio, lo que conviene revisar antes de desplegar el modelo en producción.

## Capacidades

- Clasificación de audio orientada a la detección de música: el modelo etiqueta segmentos de audio como musicales o no musicales (la granularidad exacta, binaria o multietiqueta, no está especificada).
- Extracción de características (`feature-extraction` entre los tags): puede emplearse para obtener representaciones del audio, aunque la cabeza de clasificación es el uso principal.
- Procesamiento de audio genérico: al derivar de un modelo SSL de audio, conserva la capacidad de representar contenido acústico variado, aunque su ajuste fino está sesgado hacia la tarea de detección de música.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales (visión, texto, habla).
- No se ha documentado soporte multilingüe explícito; al operar sobre señal de audio, la noción de idioma no aplica directamente.
- No se ha documentado un modo "thinking" ni capacidades generativas: es un modelo discriminativo, no generativo.

## Casos de uso

- Indexación de archivos audiovisuales: en una fonoteca o archivo de televisión, el modelo permite recorrer horas de grabación y marcar automáticamente los tramos con música, facilitando la catalogación y la búsqueda posterior por tipo de contenido.
- Gestión de derechos musicales: al identificar segmentos musicales, un departamento legal puede localizar qué partes de un programa requieren licencias o liquidación de derechos, reduciendo la revisión manual.
- Segmentación previa a transcripción: en pipelines de ASR (reconocimiento automático del habla), eliminar o marcar los tramos musicales evita transcripciones erróneas y mejora la calidad del texto generado.
- Monitorización de emisiones en radio y televisión: detectar cuándo suena música en una emisión permite generar informes de programación musical, útiles para sociedades de gestión de derechos o para análisis de audiencia.
- Filtrado de datasets de audio: al construir corpus para entrenar otros modelos (ASR, diarización), el clasificador permite separar el audio musical del habla y evitar contaminación del dataset.
- Análisis de podcasts y programas hablados: identificar sintonías, cortinillas y fondos musicales para caracterizar la estructura del programa y mejorar sistemas de recomendación o resúmenes automáticos.
- Preprocesado en sistemas de moderación o cumplimiento: marcar contenido musical en flujos de audio subidos por usuarios para aplicar políticas específicas (por ejemplo, detección de copyright).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; dado el tamaño del repositorio (~0,2 GB), es probable que el modelo quepa en GPUs de consumo con pocos GB de VRAM, pero no se confirma en la documentación.
- GPU recomendadas: no disponible. Por el tamaño del repo, una GPU consumer (por ejemplo, RTX 3060 o superior) podría ser suficiente, pero es una estimación no verificada.
- Compatibilidad con GPU de consumo: probablemente sí, aunque no confirmado.
- Opciones de despliegue: al usar `transformers` con `custom_code`, el despliegue estándar sería mediante la librería `transformers` en Python. No se ha documentado soporte para vLLM, llama.cpp, Ollama o TGI; estos motores están orientados a modelos generativos y no encajan con un clasificador de audio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto | Licencia | Acceso |
|---|---|---|---|---|---|
| `ina-foss/ssl-music-detection-only_speech` | Detección de música (audio-classification) | no disponible | no disponible | pantagruel-research-license | Restringido (gated) |
| `ina-foss/ssl-audio-1k-only_speech` (modelo base) | Representación SSL de audio | no disponible | no disponible | no disponible en la información | no disponible |
| Alternativas genéricas de clasificación de audio (p. ej., AST, PANNs, YAMNet) | Clasificación de eventos sonoros, incluida música | no disponible en esta ficha | no disponible | varía según modelo (habitualmente permisivas) | Público |

No se dispone de datos suficientes para comparar rendimiento numérico con alternativas. La comparativa se limita a aspectos de disponibilidad, licencia y tarea.

## Limitaciones y advertencias

- Acceso restringido: el modelo es "gated" y requiere aceptar condiciones en Hugging Face antes de su descarga; esto puede complicar la automatización de pipelines y la reproducibilidad.
- Licencia `pantagruel-research-license`: no es una licencia estándar de código abierto; es imprescindible revisar sus términos antes de cualquier uso comercial, ya que puede imponer restricciones de investigación o de atribución.
- `custom_code`: la carga del modelo requiere ejecutar código incluido en el repositorio, lo que implica un riesgo de seguridad y la necesidad de auditar dicho código antes de usarlo en producción.
- Sesgos desconocidos: no se ha documentado la composición del dataset de entrenamiento, por lo que no se puede evaluar el sesgo hacia géneros musicales, idiomas, calidades de grabación o tipos de contenido acústico.
- Riesgo de falsos positivos y negativos: al ser un clasificador especializado, puede confundir habla cantada, percusión rítmica o ruidos con música, y puede no detectar música muy ambiental o de bajo volumen. No hay métricas publicadas para cuantificar este riesgo.
- Limitaciones de contexto: se desconoce la ventana de audio que procesa el modelo y si requiere segmentación previa; esto afecta a la integración en pipelines.
- Sin benchmarks: la ausencia de resultados publicados impide comparar su rendimiento con alternativas y dificulta la justificación técnica de su elección.
- Idiomas: no se especifican, pero al ser un modelo de audio, la noción de idioma aplica solo indirectamente (por ejemplo, música vocal en distintos idiomas).
- Escasa documentación: la información pública es mínima, lo que incrementa el coste de integración y el riesgo de comportamientos no documentados.

## Enlaces

- Hugging Face: https://huggingface.co/ina-foss/ssl-music-detection-only_speech
- Modelo base: https://huggingface.co/ina-foss/ssl-audio-1k-only_speech
- Organización INA-FOSS en Hugging Face: https://huggingface.co/ina-foss
- No se han encontrado en la información proporcionada papers, blogs, repositorios ni demos adicionales.
