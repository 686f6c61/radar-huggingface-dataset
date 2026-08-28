# AMAImedia/NOESIS-Whisper3-1.6B-Large-Turbo-Darwin-99LANG-ONNX-INT8

## Resumen

NOESIS-Whisper3-1.6B-Large-Turbo-Darwin-99LANG-ONNX-INT8 es un modelo de reconocimiento automático del habla (ASR) multilingüe desarrollado por AMAImedia, presentado como una variante de despliegue en formato ONNX cuantizado a INT8. Se basa en una fusión por promediado de capas del encoder entre los modelos `openai/whisper-large-v3` y `openai/whisper-large-v3-turbo`, manteniendo el decoder completo de `whisper-large-v3`. El resultado es un modelo de aproximadamente 1,5-1,6 mil millones de parámetros que soporta 99 idiomas, con un tamaño de paquete de 1,84 GB, lo que lo hace adecuado para entornos con recursos limitados.

La relevancia de este modelo radica en su doble enfoque: por un lado, aprovecha la calidad de transcripción de Whisper Large v3 y la eficiencia del encoder de Turbo mediante una fusión ponderada (0,55 para v3 y 0,45 para Turbo); por otro, su cuantización INT8 y su formato ONNX con tensores de datos externos permiten su ejecución en CPU, CUDA o DirectML mediante onnxruntime, sin necesidad de GPUs de alta gama. Está pensado como un componente auxiliar dentro de un ecosistema mayor de ASR de AMAImedia, orientado a tareas de transcripción, identificación de idioma y generación de marcas temporales a nivel de palabra.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper encoder-decoder (fusión por promediado de encoder entre Large-v3 y Large-v3-Turbo) |
| Parametros totales | ~1,5-1,6 mil millones |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo ASR, no aplica contexto de texto largo) |
| Tipos de cuantizacion | INT8 (por canal) |
| Idiomas soportados | 99 (lista declarada: en, ru, zh, ja, ko, es, fr, de, pt, it, ar, hi, bn, tr, vi, th, id, nl, pl, uk, fa, ro, el, sv, he, cs, hu, fi, no, da) |
| Licencia | MIT |
| Formato de pesos | ONNX con external-data (`.onnx` + `.data`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura encoder-decoder de Whisper, con un encoder de 32 capas resultante de un promediado por tensor entre las capas de `whisper-large-v3` (ponderación 0,55) y `whisper-large-v3-turbo` (ponderación 0,45). El decoder se mantiene íntegro de `whisper-large-v3`, también con 32 capas. La dimensión del modelo (`d_model`) es 1280 y el vocabulario alcanza 51.866 tokens. El preprocesador utiliza un espectrograma log-Mel de 128 bins, igual que Whisper v3.

No se detallan en la información disponible los datos de entrenamiento específicos más allá de la referencia al dataset `openai/whisper-multilingual`. Tampoco se mencionan técnicas como RLHF o DPO. La innovación principal reside en la estrategia de fusión de encoders y en la cuantización INT8 para despliegue eficiente. El paquete incluye los grafos ONNX separados para encoder y decoder, con los pesos almacenados en archivos `.data` externos, lo que facilita la carga parcial y la inferencia en entornos con memoria limitada.

## Capacidades

- Transcripción de voz a texto en 99 idiomas, incluyendo los principales idiomas europeos, asiáticos y de Oriente Medio.
- Identificación automática de idioma (language-ID) a partir del audio.
- Generación de marcas temporales a nivel de palabra (word-level timestamping).
- Transcripción de respaldo (fallback) para idiomas no cubiertos por otros modelos del ecosistema NOESIS.
- Inferencia en CPU, GPU (CUDA) y DirectML mediante onnxruntime, gracias al formato ONNX INT8.
- Compatible con la librería Optimum de Hugging Face (`ORTModelForSpeechSeq2Seq`), lo que facilita su integración en pipelines existentes de Transformers.

## Casos de uso

- Transcripción de reuniones y videoconferencias: el modelo puede procesar audio de 16 kHz en tiempo real o en diferido, generando transcripciones con marcas temporales para su posterior indexación y búsqueda. Su soporte multilingüe permite cubrir equipos internacionales sin necesidad de modelos separados por idioma.
- Subtitulado automático de vídeo: gracias a las marcas temporales a nivel de palabra, es posible sincronizar subtítulos con precisión en plataformas de publicación de contenido, tanto para vídeo en línea como para archivos locales.
- Atención al cliente automatizada: integrado en sistemas de IVR o chatbots, puede transcribir llamadas de clientes en múltiples idiomas, permitiendo análisis de sentimiento, detección de intenciones y generación de resúmenes automáticos.
- Asistentes de voz para dispositivos con recursos limitados: al ser un modelo INT8 de ~1,84 GB, puede ejecutarse en CPUs de bajo consumo o en GPUs de gama de entrada, habilitando comandos de voz en dispositivos embebidos o en entornos sin aceleración dedicada.
- Archivado y búsqueda de contenido audiovisual: transcripción de archivos de audio históricos (podcasts, entrevistas, noticiarios) para crear bases de datos textuales consultables, con detección de idioma automática para clasificar el contenido.
- Traducción y doblaje asistido: aunque el modelo no realiza traducción directamente, su transcripción precisa en 99 idiomas sirve como entrada para sistemas de traducción automática, facilitando flujos de doblaje o subtitulado multilingüe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser INT8 y con un tamaño total de ~1,84 GB, el modelo puede ejecutarse en GPUs con al menos 2-3 GB de VRAM, aunque se recomienda 4 GB para margen de seguridad. En CPU, requiere aproximadamente 2 GB de RAM para los pesos, más memoria adicional para el procesamiento de audio.
- GPU recomendadas: cualquier GPU compatible con CUDA (por ejemplo, NVIDIA GTX 1050 Ti o superior) o con DirectML (tarjetas AMD, Intel). También puede ejecutarse en CPU sin GPU.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama baja como la RTX 3050 o incluso en iGPUs con soporte DirectML.
- Opciones de despliegue: onnxruntime (CPUExecutionProvider, CUDAExecutionProvider, DMLExecutionProvider), integrable con Optimum (`ORTModelForSpeechSeq2Seq`). No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que el formato es ONNX específico para ASR.
- Latencia y throughput: no se proporcionan datos en la información disponible.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos en la información proporcionada. Como referencia, el modelo se basa en Whisper Large-v3 y Large-v3-Turbo, pero no se ofrecen métricas comparativas de rendimiento o precisión frente a estos u otros sistemas ASR.

## Limitaciones y advertencias

- La model card no documenta limitaciones específicas de este modelo. Al derivar de Whisper, es probable que herede las limitaciones conocidas de la familia Whisper, como alucinaciones en segmentos de silencio o ruido de fondo, y errores en acentos o dialectos poco representados.
- El modelo está diseñado como componente auxiliar dentro del ecosistema NOESIS de AMAImedia; su uso como sistema ASR principal no está recomendado por el autor, que señala que el modelo primario de producción es `omniASR-CTC-7B`.
- La licencia MIT permite uso comercial, pero se debe conservar la atribución a OpenAI (por los modelos base) y a NOESIS, según se indica en el aviso de licencia.
- El formato ONNX con external-data requiere que los archivos `.data` se mantengan junto a los grafos `.onnx`; si se separan, el modelo no cargará correctamente.
- No se especifican requisitos de memoria para el procesamiento de audio de larga duración; el límite de tokens de salida (`max_new_tokens=440` en el ejemplo) sugiere que la transcripción se realiza en segmentos, no en un único paso para audios extensos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AMAImedia/NOESIS-Whisper3-1.6B-Large-Turbo-Darwin-99LANG-ONNX-INT8
- Colección de modelos NOESIS de AMAImedia: https://huggingface.co/collections/AMAImedia/noesis-original-trained-models
- Modelo base `openai/whisper-large-v3`: https://huggingface.co/openai/whisper-large-v3
- Sitio web de AMAImedia: https://www.amaimedia.com
- Perfil de X (Twitter) de AMAImedia: https://x.com/AMAImediacom
- Perfil de LinkedIn del fundador: https://www.linkedin.com/in/ilia-bolotnikov
- Canal de Telegram de AMAImedia: https://t.me/AMAImediacom
