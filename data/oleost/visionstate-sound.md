# oleost/visionstate-sound

## Resumen

VisionState-sound es una exportación a ONNX del modelo CED-Tiny (`mispeech/ced-tiny`), un clasificador de audio desarrollado por Xian Li, Nian Shao y Xiaofei Li en el contexto del paper "CED: Consistent ensemble distillation for audio tagging" (ICASSP 2024). La versión publicada por el usuario oleost añade una salida adicional llamada `embedding` al grafo original, que agrega los tokens del encoder mediante media, desviación estándar y máximo, produciendo un vector de N × 576 dimensiones. Los pesos y las puntuaciones de clase se mantienen idénticos a los del modelo base.

El modelo resuelve la tarea de *audio tagging* sobre las 527 clases de AudioSet, devolviendo directamente probabilidades (`logits`) en lugar de logits sin normalizar. La innovación de esta variante es doble: por un lado, el formato ONNX facilita el despliegue en entornos sin PyTorch; por otro, la salida de embedding permite reutilizar el encoder como extractor de características para aprendizaje few-shot de sonidos propios de un hogar, que es el caso de uso declarado por el autor (reconocimiento de sirenas, alarmas de humo y sonidos domésticos personalizados).

Se trata de un modelo pequeño (variante *tiny* de la familia CED), pensado para sensores de sonido con recursos limitados. La licencia Apache-2.0 y el tamaño reducido del repositorio lo hacen adecuado para integración en dispositivos de borde, aunque no se dispone de información pública sobre parámetros exactos, contexto de audio ni benchmarks en la documentación proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (CED, *Consistent Ensemble Distillation*), exportado a ONNX |
| Parametros totales | no disponible (variante *tiny* de CED; cifra exacta no publicada en la información disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada: forma de onda mono a 16 kHz; duración exacta de ventana no especificada) |
| Tipos de cuantizacion | no disponible (el repositorio contiene un artefacto ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de audio, no lingüístico; las etiquetas de AudioSet están en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

CED (Consistent Ensemble Distillation) es un transformer encoder para *audio tagging* que emplea destilación de conjunto consistente: un conjunto de modelos profesores se destila en un estudiante con el objetivo de que las predicciones sean consistentes entre aumentaciones y vistas del mismo audio. El modelo base `mispeech/ced-tiny` fue entrenado por sus autores originales sobre AudioSet, el corpus de referencia con 527 clases de eventos sonoros. La revisión concreta utilizada es `ace276d29dd0bb3f3517b0fa8cf300738c409019`.

La modificación introducida en esta versión no altera los pesos ni el entrenamiento: se añade una única salida `embedding` que agrega los tokens del encoder mediante media, desviación estándar y máximo (N × 576). La entrada es `waveform`, un tensor N × muestras de audio mono a 16 kHz. El script de generación (`tools/soundmodel/make_model.py`) está disponible en el repositorio GitHub del proyecto VisionState. No se documentan en la información proporcionada detalles sobre número de tokens de entrenamiento, composición exacta del dataset más allá de AudioSet, ni uso de RLHF/DPO (no aplicable a una tarea de clasificación).

## Capacidades

- Clasificación de audio en 527 clases de AudioSet, con salida de probabilidades directamente (`logits` ya normalizados).
- Extracción de embeddings de audio mediante pooling (media, desviación estándar, máximo) de los tokens del encoder, con dimensionalidad N × 576.
- Aprendizaje few-shot de sonidos personalizados a partir de los embeddings (caso de uso declarado: sonidos propios de un hogar).
- Detección de eventos sonoros críticos como sirenas y alarmas de humo.
- Inferencia en formato ONNX, compatible con runtimes ligeros sin dependencia de PyTorch.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente discriminativo de audio.
- Capacidades multilingües no aplicables; las etiquetas de clase provienen de AudioSet (en inglés).

## Casos de uso

- **Detección de alarmas de humo y monóxido de carbono en hogares**: el modelo clasifica el audio ambiente y puede activar alertas cuando detecta patrones acústicos de alarmas, gracias a las 527 clases de AudioSet entre las que se incluyen este tipo de eventos.
- **Reconocimiento de sirenas en entornos urbanos o vehículos**: integrado en un sensor de borde, permite identificar sirenas de emergencia y distinguirlas de otros ruidos, útil en sistemas de asistencia a la conducción o monitorización acústica urbana.
- **Personalización de sonidos domésticos mediante embeddings**: usando la salida `embedding` (N × 576), se pueden entrenar clasificadores ligeros few-shot con grabaciones propias del hogar (por ejemplo, el timbre de una lavadora concreta) sin reentrenar el encoder.
- **Monitorización acústica de edificios y oficinas**: clasificación continua de eventos sonoros (cristales rotos, golpes, conversaciones) para sistemas de seguridad o análisis de ocupación, aprovechando el bajo coste computacional de la variante *tiny*.
- **Etiquetado automático de archivos de audio**: procesamiento por lotes de grabaciones para generar metadatos de eventos sonoros, útil en archivos multimedia o datasets de investigación.
- **Preprocesado para pipelines de audio más complejos**: uso del embedding como representación compacta de audio que alimente modelos posteriores (clasificadores, sistemas de recomendación o búsqueda por similitud acústica).
- **Prototipado rápido en dispositivos de borde**: al ser ONNX y de tamaño reducido, se puede desplegar en Raspberry Pi o microcontroladores con runtime ONNX para experimentación sin infraestructura GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas (mAP, accuracy, AUC) del modelo base ni de esta exportación, y no se dispone de comparaciones numéricas con otros modelos de audio tagging.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; al tratarse de una variante *tiny* exportada a ONNX, se espera un consumo muy bajo (del orden de cientos de MB o menos), pero no se documenta la cifra exacta.
- GPU recomendadas: no disponible; por el tamaño del modelo, cualquier GPU consumer moderna (RTX 3060 o superior) sería sobredimensionada, y la inferencia en CPU es plausible.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU consumer e incluso en CPU, aunque no se aportan mediciones.
- Opciones de despliegue: ONNX Runtime (principal), y potencialmente otros runtimes compatibles con ONNX (por ejemplo, TensorRT u OpenVINO) previa conversión; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador de audio).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| oleost/visionstate-sound (este) | Audio tagging (527 clases AudioSet) + embedding | no disponible (*tiny*) | no disponible | Apache-2.0 | ONNX | Añade salida de embedding para few-shot |
| mispeech/ced-tiny (base) | Audio tagging (527 clases AudioSet) | no disponible (*tiny*) | no disponible | Apache-2.0 | PyTorch (safetensors) | Modelo original sin salida de embedding |
| mispeech/ced-base / ced-small | Audio tagging (527 clases AudioSet) | no disponible | no disponible | Apache-2.0 | PyTorch | Variantes mayores de la misma familia; más precisión a mayor coste |
| AST (Audio Spectrogram Transformer) | Audio tagging (527 clases AudioSet) | ~87 M (AST base) | no disponible | BSD-3-Clause (según variante) | PyTorch | Alternativa basada en ViT sobre espectrogramas; mayor coste computacional |

La comparación cuantitativa de rendimiento no está disponible en la información proporcionada; las cifras de parámetros de AST se incluyen como referencia general de la categoría, no como dato verificado en esta búsqueda.

## Limitaciones y advertencias

- **Sesgos del dataset**: AudioSet tiene una distribución sesgada hacia eventos sonoros presentes en YouTube, con posible infrarrepresentación de sonidos de determinadas regiones, culturas o entornos domésticos específicos.
- **Riesgo de falsos positivos y negativos**: la clasificación en 527 clases puede confundir eventos acústicamente similares (por ejemplo, distintos tipos de alarmas); no se documentan métricas de calibración.
- **Idioma y etiquetas**: las etiquetas de clase están en inglés; no hay soporte multilingüe ni localización de etiquetas.
- **Contexto de audio no especificado**: no se documenta la duración de ventana ni el solapamiento recomendado, lo que dificulta reproducir el rendimiento esperado en producción.
- **Licencia**: Apache-2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base y del dataset AudioSet para usos derivados.
- **Artefacto ONNX sin verificación independiente**: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por terceros del grafo exportado ni de la salida de embedding.
- **No apto para tareas generativas**: no genera texto, no soporta tool calling ni razonamiento; su uso está limitado a clasificación y extracción de características.
- **Fecha de creación anómala**: la model card indica fecha de creación 2026-10-31, lo que puede reflejar un error de metadatos o una fecha futura; conviene verificar la integridad del repositorio antes de usarlo en producción.

## Enlaces

- [Modelo en HuggingFace: oleost/visionstate-sound](https://huggingface.co/oleost/visionstate-sound)
- [Modelo base: mispeech/ced-tiny](https://huggingface.co/mispeech/ced-tiny)
- [Repositorio GitHub del proyecto VisionState](https://github.com/oleost/VisionState)
- [Paper CED: Consistent ensemble distillation for audio tagging (arXiv:2308.11957)](https://arxiv.org/abs/2308.11957)
- [AudioSet (Google Research)](https://research.google.com/audioset/)
