# amorsi/micro-sam-vit-b-em-organelles

## Resumen

`micro-sam vit_b_em_organelles` es un checkpoint preentrenado del proyecto micro-sam (Computational Cell Analytics), un fork de Segment Anything (SAM) adaptado a microscopía de células y orgánulos. Este repositorio de HuggingFace (`amorsi/micro-sam-vit-b-em-organelles`) es un espejo sin modificaciones de los pesos originales publicados en el registro de BioImage.IO, con hashes xxh128 que coinciden con los del fichero `util.py` del repositorio oficial de micro-sam.

El modelo resuelve segmentación de imágenes (image segmentation) en el dominio de microscopía electrónica de orgánulos subcelulares. Emplea la arquitectura ViT-B de SAM (Vision Transformer base, aproximadamente 91 millones de parámetros en el encoder) junto con un decoder ligero específico para la tarea. El checkpoint incluye dos ficheros: `model.pt` (encoder) y `decoder.pt` (decoder), lo que refleja el diseño desacoplado de SAM.

Es relevante para investigadores en biología celular y bioimagen que necesitan segmentar estructuras subcelulares en imágenes de microscopía electrónica sin entrenar desde cero. Al ser un espejo de un checkpoint oficial, su utilidad principal es la reproducibilidad y la disponibilidad vía HuggingFace, aunque el autor no documenta métricas, licencia propia ni detalles de entrenamiento en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-B) con decoder tipo SAM (Segment Anything) |
| Parametros totales | no disponible (ViT-B de SAM: ~91 M en el encoder; total no confirmado en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision; resolucion de entrada no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | no disponible en la ficha de HuggingFace; el codigo de micro-sam es MIT, los pesos remiten a los terminos del origen (BioImage.IO) |
| Formato de pesos | PyTorch (`model.pt` y `decoder.pt`) |
| Tamano del repositorio | 0.4 GB |
| Pipeline | image-segmentation |
| Uso previsto | `model_type="vit_b_em_organelles"` en micro-sam |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Segment Anything (SAM): un encoder de imagen basado en Vision Transformer (variante `vit_b`, la base) que genera embeddings de la imagen, y un decoder ligero que produce máscaras de segmentación a partir de prompts (puntos, cajas o máscaras). En micro-sam, el decoder se entrena específicamente para el dominio de microscopía, mientras que el encoder parte de los pesos de SAM y se afina con datos del dominio. El sufijo `em_organelles` indica que el checkpoint está especializado en orgánulos subcelulares en imágenes de microscopía electrónica.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO (no aplicable a un modelo de segmentación) ni innovaciones técnicas adicionales. El repositorio es explícitamente un espejo sin modificaciones de los pesos oficiales; para detalles de entrenamiento debe consultarse el repositorio de micro-sam y la publicación asociada (no incluida en la información disponible).

## Capacidades

- Segmentación de imágenes de microscopía electrónica orientada a orgánulos subcelulares.
- Segmentación guiada por prompts (puntos, cajas o máscaras), según el diseño de SAM.
- Generación de máscaras de instancia para estructuras biológicas.
- Integración con el ecosistema micro-sam mediante `model_type="vit_b_em_organelles"`.
- No soporta tool calling, function calling ni razonamiento multi-step (no es un modelo de lenguaje).
- No dispone de capacidades multilingües ni de generación de texto.
- No se documentan capacidades especiales adicionales (visión general, audio, thinking mode) en la información disponible.

## Casos de uso

- Segmentación de orgánulos en imágenes de microscopía electrónica: el modelo se carga en micro-sam con `model_type="vit_b_em_organelles"` y se aplica sobre imágenes EM para obtener máscaras de estructuras subcelulares, aprovechando el afinado específico del dominio.
- Análisis morfológico cuantitativo: una vez segmentadas las estructuras, se pueden calcular áreas, perímetros y distribuciones espaciales de orgánulos para estudios de biología celular.
- Anotación asistida de datasets: el modelo puede generar máscaras iniciales que un investigador revisa y corrige, reduciendo el coste de etiquetado manual en pipelines de bioimagen.
- Reproducibilidad de experimentos: al ser un espejo con hashes verificables, permite reproducir resultados publicados que usen el checkpoint oficial de micro-sam.
- Integración en flujos de análisis con micro-sam: se puede combinar con las utilidades del repositorio (preprocesado, prompting, evaluación) para construir pipelines de segmentación reproducibles.
- Docencia y prototipado en bioimagen: sirve como punto de partida para experimentar con segmentación promptable en microscopía electrónica sin entrenar un modelo desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el tamaño del repositorio (0.4 GB) sugiere que los pesos caben holgadamente en GPUs de consumo, pero no se confirma el pico de memoria durante la inferencia.
- GPU recomendadas: no disponible; por el tamaño del encoder ViT-B, es plausible su ejecución en GPUs de consumo (por ejemplo, RTX 3090/4090), aunque no se documenta en la información.
- ¿Cabe en GPU de consumo? No confirmado en la información; el tamaño de pesos lo hace probable, pero no hay datos oficiales.
- Opciones de despliegue: uso previsto mediante la librería micro-sam (PyTorch); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de segmentación de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| micro-sam vit_b_em_organelles (este) | ViT-B (~91 M encoder) | no disponible | Segmentación EM de orgánulos | no disponible (código micro-sam MIT) | HuggingFace (espejo) |
| SAM (vit_b original) | ViT-B (~91 M encoder) | imágenes naturales | Segmentación general | Apache 2.0 (SAM original) | Meta / HuggingFace |
| micro-sam vit_b_lm (otro checkpoint) | ViT-B | no disponible | Segmentación en microscopía óptica | según micro-sam | registro micro-sam |
| Cellpose | no disponible | imágenes de microscopía | Segmentación celular | BSD-3 (código) | GitHub |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparativa se limita a parámetros, tarea y licencia.

## Limitaciones y advertencias

- Es un espejo sin modificaciones: el autor no aporta garantías adicionales sobre los pesos ni sobre su licencia; deben consultarse los términos del origen (BioImage.IO) antes de uso comercial.
- La licencia no está declarada en la ficha de HuggingFace; el código de micro-sam es MIT, pero la licencia de los pesos no se confirma.
- Especializado en microscopía electrónica de orgánulos; su rendimiento fuera de ese dominio (microscopía óptica, imágenes naturales) no está documentado y probablemente sea inferior.
- No hay métricas publicadas en esta ficha, por lo que no se puede evaluar su calidad de segmentación a partir de la información disponible.
- Riesgo de segmentaciones incorrectas en imágenes con ruido, artefactos o estructuras poco representadas en el entrenamiento; requiere validación por un experto.
- No es un modelo de lenguaje: no soporta texto, tool calling ni agentes.
- No se documentan sesgos específicos, pero al ser un modelo de visión médica/científica puede heredar sesgos de los datasets de entrenamiento originales.
- Para producción, conviene fijar la versión del checkpoint y verificar los hashes xxh128 contra el registro oficial de micro-sam.

## Enlaces

- HuggingFace: https://huggingface.co/amorsi/micro-sam-vit-b-em-organelles
- Repositorio micro-sam: https://github.com/computational-cell-analytics/micro-sam
- Fichero de registro de checkpoints (`util.py`): https://github.com/computational-cell-analytics/micro-sam/blob/master/micro_sam/util.py
- Pesos originales (encoder): https://uk1s3.embassy.ebi.ac.uk/public-datasets/bioimage.io/noisy-ox/1.2/files/vit_b.pt
- Pesos originales (decoder): https://uk1s3.embassy.ebi.ac.uk/public-datasets/bioimage.io/noisy-ox/1.2/files/vit_b_decoder.pt
