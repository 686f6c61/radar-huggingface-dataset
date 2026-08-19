# 1Developer/cali-ast-wakeword_v1.1

## Resumen

El modelo `1Developer/cali-ast-wakeword_v1.1` es un clasificador de audio basado en la arquitectura Audio Spectrogram Transformer (AST), diseñado específicamente para la detección de palabras de activación (wakeword). Desarrollado por el usuario `1Developer` y publicado en HuggingFace, el modelo cuenta con 85.370.114 parámetros y un tamaño de repositorio de 0,3 GB. Su pipeline es `audio-classification` y está preparado para su uso con la librería `transformers` de HuggingFace.

La relevancia de este modelo radica en su especialización: los wakewords son componentes críticos en asistentes de voz, dispositivos domésticos inteligentes y sistemas de activación por voz. Al estar basado en un AST, procesa espectrogramas de audio como secuencias de parches, siguiendo el enfoque de los transformers de visión aplicados al dominio acústico. La fecha de creación (agosto de 2026) sugiere que es un modelo reciente, aunque la model card oficial está prácticamente vacía, por lo que la información disponible sobre entrenamiento, datos y rendimiento es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Spectrogram Transformer (AST) |
| Parametros totales | 85.370.114 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio, no texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (el wakeword puede ser independiente del idioma, pero no se especifica) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Audio Spectrogram Transformer, que adapta el transformer de visión (ViT) al dominio del audio. En lugar de trabajar con píxeles, el AST divide un espectrograma (representación tiempo-frecuencia de la señal de audio) en parches de tamaño fijo, los proyecta a embeddings y los procesa mediante capas de atención multi-cabeza. Esta arquitectura permite capturar patrones temporales y espectrales relevantes para la clasificación de eventos acústicos, en este caso, la presencia de una palabra de activación concreta.

No se dispone de información pública sobre el proceso de entrenamiento: ni el número de tokens de audio, ni la composición del dataset, ni si se aplicaron técnicas como fine-tuning supervisado o aprendizaje por refuerzo. El tag `arxiv:1910.09700` enlaza con el paper de ViT original ("An Image is Worth 16x16 Words"), lo que sugiere que el modelo se basa en esa arquitectura, pero no se detalla el dataset de preentrenamiento ni el de fine-tuning. La model card del autor no incluye ninguna sección de entrenamiento completada.

## Capacidades

- Clasificación de audio: el modelo está diseñado para clasificar segmentos de audio, específicamente para detectar si contienen un wakeword concreto.
- Detección de palabra de activación: su caso de uso principal es la activación por voz, similar a "Hey Siri", "OK Google" o "Alexa".
- Procesamiento de espectrogramas: al ser un AST, puede manejar entradas de audio de longitud variable convertidas a espectrogramas.
- Integración con HuggingFace: compatible con el pipeline `audio-classification` de `transformers`, lo que facilita su despliegue en entornos estándar.
- No se ha documentado soporte para tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, ya que es un modelo de clasificación de audio de una sola tarea.

## Casos de uso

- Asistentes de voz en dispositivos domésticos: el modelo puede integrarse en un sistema de altavoz inteligente para detectar la palabra de activación y desencadenar el procesamiento posterior de la orden de voz. Su tamaño compacto (85M parámetros) permite ejecutarlo en hardware de bajo consumo.
- Activación de aplicaciones móviles: una app puede usar el modelo para escuchar continuamente el micrófono y activar un asistente virtual solo cuando se detecta el wakeword, reduciendo el consumo de batería frente a un sistema de transcripción siempre activo.
- Automatización industrial por voz: en entornos de fábrica o almacenes, el modelo puede activar comandos de voz para controlar maquinaria o sistemas de gestión, evitando el uso de manos.
- Accesibilidad: personas con movilidad reducida pueden usar el wakeword para activar funciones de un ordenador o dispositivo sin necesidad de interactuar físicamente.
- Sistemas de seguridad: el wakeword puede servir como disparador para grabar audio o iniciar una verificación de identidad por voz en un sistema de control de acceso.
- Evaluación de modelos de audio: al ser un AST de tamaño medio, puede utilizarse como punto de partida para fine-tuning en otras tareas de clasificación de audio, como detección de eventos sonoros o clasificación de escenas acústicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, recall, F1 ni comparaciones con otros modelos de wakeword. Tampoco hay datos sobre latencia o throughput en la documentación del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: con 85,37 millones de parámetros, el modelo en precisión fp32 ocupa aproximadamente 341 MB de memoria (85,37M × 4 bytes). En fp16, unos 170 MB. Esto cabe en cualquier GPU moderna con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más (GTX 1650, RTX 2060, RTX 3060, etc.) es suficiente. También puede ejecutarse en CPU, aunque con mayor latencia.
- Compatibilidad con consumer GPU: sí, es perfectamente viable en GPUs de gama de entrada y media.
- Opciones de despliegue: al ser un modelo de `transformers`, puede servirse con HuggingFace Inference Endpoints, o mediante frameworks como ONNX Runtime o TensorRT para optimización. También es posible cargarlo directamente con `transformers` en Python.
- Latencia y throughput: no se han publicado datos concretos. Para un modelo de este tamaño, en GPU se esperan latencias de decenas de milisegundos por inferencia, pero es una estimación no verificada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. A nivel de arquitectura, el modelo es comparable a otros AST de tamaño similar, como el `MIT/ast-finetuned-audioset-10-10-0` (también basado en ViT, con ~86M parámetros), pero no hay información sobre el dataset de fine-tuning ni sobre las métricas de este modelo concreto. Otros sistemas de wakeword comerciales (Porcupine, Snowboy, etc.) no publican arquitecturas abiertas comparables. Por tanto, no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Licencia no disponible: no se especifica la licencia de uso, lo que impide conocer si es permitido su uso comercial, modificación o redistribución. Es un riesgo legal importante para producción.
- Sesgos y alucinaciones: al no haber documentación sobre los datos de entrenamiento, se desconocen posibles sesgos en cuanto a acentos, idiomas, ruido de fondo o calidad del micrófono. El modelo podría fallar con voces no representadas en el dataset.
- Riesgo de falsos positivos/negativos: como cualquier detector de wakeword, puede activarse con sonidos similares o no activarse con variaciones de pronunciación. Sin métricas publicadas, no se puede cuantificar este riesgo.
- Idioma y dominio: no se indica qué palabra de activación concreta detecta ni en qué idioma. El nombre "cali" sugiere que podría ser una palabra específica, pero no hay confirmación.
- Contexto limitado: al ser un modelo de clasificación de audio, no procesa texto ni mantiene contexto conversacional; solo emite una etiqueta por segmento de audio.
- Model card incompleta: la documentación oficial es una plantilla sin rellenar, lo que dificulta la reproducibilidad y la evaluación responsable del modelo.

## Enlaces

- HuggingFace: https://huggingface.co/1Developer/cali-ast-wakeword_v1.1
- Paper de referencia (ViT, arxiv:1910.09700): https://arxiv.org/abs/1910.09700
- No se han encontrado repositorios, demos o blogs adicionales del autor.
