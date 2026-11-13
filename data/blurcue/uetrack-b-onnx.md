# BlurCue/uetrack-b-onnx

## Resumen

UETrack-B ONNX es una conversión a formato ONNX del checkpoint Base del modelo UETrack, un rastreador de objetos (object tracker) de un solo objeto desarrollado por el autor kangben258 y empaquetado por BlurCue. El modelo resuelve el problema de seguimiento visual de un objeto sembrado previamente en una secuencia de vídeo: recibe una plantilla normalizada (recorte de 112x112), un recorte de búsqueda (224x224) y la anotación de la plantilla, y devuelve una caja delimitadora en formato de centro normalizado, una puntuación de confianza y un mapa de puntuación con ventana.

La relevancia de esta ficha radica en que no se trata de un modelo de lenguaje, sino de un componente de visión por computador empaquetado como grafo ONNX FP32 (opset 17) listo para inferencia en producción. La conversión fusiona las entradas duplicadas de parche RGB, incorpora el prompt de texto cero-token de CLIP y el identificador de tarea RGB, y embebe el ventaneo de Hann y la decodificación de cajas. El paquete excluye el checkpoint de entrenamiento y el código Python original.

El repositorio ocupa aproximadamente 0,1 GB y se distribuye bajo licencia Apache 2.0. No se dispone de información sobre el número de parámetros, la longitud de contexto (concepto no aplicable a un tracker visual) ni los idiomas soportados. La validación publicada se limita a cuatro casos sintéticos comprobados contra la referencia de PyTorch convertida usando ONNX Runtime en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de seguimiento visual de un solo objeto; grafo ONNX derivado de UETrack Base) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: plantilla 112x112 y recorte de busqueda 224x224) |
| Tipos de cuantizacion | no disponible (el paquete se distribuye en FP32) |
| Idiomas soportados | no aplica (modelo de vision; prompt de texto CLIP cero-token embebido) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 17, FP32) |

## Arquitectura y entrenamiento

La arquitectura subyacente es UETrack, un rastreador visual de un solo objeto derivado del checkpoint Base publicado por kangben258 en el repositorio `kangben258/UETrack`, con SHA-256 `1d34778a41c553e3a5e17829d33df4a644f7c948b054a64f46e02fa99558b901`, y del código fuente de UETrack en la revisión `fd13b0eaf16d51536008295f3b27807c69eaad50`, usando el fichero de configuración `experiments/uetrack/uetrack_base.yaml`. No se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que la model card no los incluye.

La innovación técnica de esta conversión concreta consiste en la fusión de las entradas duplicadas de parche RGB, la incorporación del prompt de texto cero-token de CLIP y del identificador de tarea RGB dentro del grafo, y la integración del ventaneo de Hann y la decodificación de cajas. El grafo resultante tiene SHA-256 `8512adbe711baf0614e2b440d37459410c855f081f374bf69e62e29d3ee9bfcd`. El modelo ejecuta un único paso de seguimiento por objeto sembrado; el llamador es responsable de la gestión del movimiento, el mapeo de recortes, la revisión y la terminación del seguimiento.

## Capacidades

- Seguimiento visual de un solo objeto a partir de una plantilla y un recorte de búsqueda.
- Entrada de plantilla normalizada de 112x112 píxeles y recorte de búsqueda de 224x224 píxeles.
- Salida de caja delimitadora en formato de centro normalizado, puntuación de confianza y mapa de puntuación con ventana.
- Procesamiento de parches RGB con prompt de texto CLIP cero-token embebido y identificador de tarea RGB.
- Inferencia mediante ONNX Runtime (validado en CPU).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un componente de visión, no un modelo generativo.
- No dispone de capacidades multilingües, de audio ni de modo de razonamiento (thinking mode).

## Casos de uso

- Seguimiento de vehículos en vídeo de tráfico: el modelo recibe un recorte inicial del vehículo como plantilla y, en cada fotograma, un recorte de búsqueda de 224x224 centrado en la predicción anterior; el llamador gestiona el movimiento de la ventana de búsqueda y la terminación del seguimiento cuando la confianza cae por debajo de un umbral.
- Seguimiento de matrículas en sistemas de control de accesos: la validación del paquete incluye casos sintéticos, pero la cobertura real de matrículas requiere cualificación a nivel de aplicación, por lo que se usaría como componente de un pipeline con revisión manual o con un detector secundario que corrija la deriva.
- Análisis deportivo automatizado: seguimiento de un jugador o un balón a lo largo de una secuencia, usando la puntuación de confianza y el mapa de puntuación con ventana para decidir cuándo reinicializar la plantilla o descartar el track.
- Vigilancia y seguimiento de objetos en vídeo de seguridad: integración del grafo ONNX en un servicio de inferencia que reciba recortes de cámara y mantenga el estado del track en el llamador, con revisión periódica de la caja devuelta.
- Robótica y seguimiento de objetivos en tiempo real: el formato ONNX FP32 permite desplegar el grafo en entornos con ONNX Runtime o CoreML, con la advertencia de que la cobertura real, la deriva y el rendimiento en CoreML y CUDA requieren cualificación a nivel de aplicación.
- Etiquetado y anotación asistida de vídeo: uso del tracker para propagar una caja anotada manualmente a lo largo de fotogramas, con el llamador gestionando la revisión y la terminación del track cuando el objeto desaparece o cambia de apariencia.
- Investigación en seguimiento visual: reproducción de la referencia PyTorch convertida y comparación de la precisión de conversión mediante los cuatro casos sintéticos incluidos en el paquete.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente menciona una validación con cuatro casos sintéticos comprobados contra la referencia de PyTorch convertida usando ONNX Runtime en CPU, cuyo objetivo es verificar la exactitud de la conversión, no el rendimiento del modelo en datos reales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,1 GB, pero el tamaño del grafo FP32 y de los pesos no se detalla en la información proporcionada.
- GPU recomendadas: no disponibles. La validación publicada se realizó en CPU con ONNX Runtime.
- Compatibilidad con GPU de consumo: no disponible. La model card indica que la cobertura real, la deriva, CoreML y CUDA requieren cualificación a nivel de aplicación.
- Opciones de despliegue: ONNX Runtime (validado en CPU); CoreML y CUDA mencionados como pendientes de cualificación. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un tracker visual.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de parámetros, contexto ni rendimiento de otros trackers visuales que permitan una comparación rigurosa, y no se han publicado benchmarks del modelo en la model card.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no aplica directamente, pero existe riesgo de deriva (drift) del track y de pérdida del objeto, que el llamador debe gestionar mediante revisión y terminación del seguimiento.
- Limitaciones de contexto o idioma: no aplica el concepto de contexto; el modelo procesa un único paso de seguimiento por objeto y no mantiene estado entre pasos, que debe gestionar el llamador.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el paquete incluye LICENSE y NOTICE.txt que deben respetarse; el checkpoint de entrenamiento y el código Python original quedan excluidos del paquete.
- La validación se limita a cuatro casos sintéticos; la cobertura real de matrículas, la deriva, CoreML y CUDA requieren cualificación a nivel de aplicación antes de usarse en producción.
- El pipeline no está especificado en los metadatos de Hugging Face.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BlurCue/uetrack-b-onnx
- Checkpoint Base original: https://huggingface.co/kangben258/UETrack/tree/a3fd3ff67b8974fff725fb3ac2c40751db215860/uetrack/checkpoints
- Código fuente de UETrack: https://github.com/kangben258/UETrack/tree/fd13b0eaf16d51536008295f3b27807c69eaad50
- Configuración de entrenamiento: experiments/uetrack/uetrack_base.yaml (dentro del repositorio de UETrack)
- Interfaz del paquete: pack/pack.toml (dentro del repositorio del modelo)
