# diarizeapp/redimnet2-b3-onnx

## Resumen

ReDimNet2-B3 es un modelo de extracción de embeddings de hablante (speaker embeddings) desarrollado por el ecosistema diarizeapp y publicado en formato ONNX. Su función es transformar segmentos de audio en vectores de 192 dimensiones que representan la identidad vocal del hablante, lo que permite tareas de verificación de hablante (speaker verification) y diarización de hablantes (speaker diarization), es decir, determinar quién habla y cuándo en una grabación. El modelo se distribuye con dos grafos ONNX: uno que acepta la forma de onda directamente y otro que acepta un filtro de banco log-mel de 80 canales sin STFT.

La relevancia de esta ficha radica en su enfoque en despliegue: al estar en ONNX, el modelo puede ejecutarse sobre CPU, DirectML, CUDA y la NPU Hexagon HTP de Qualcomm (Snapdragon X Elite), lo que lo hace adecuado para diarización en tiempo real en dispositivos de borde. La model card destaca que los embeddings son invariantes a la duración del turno corto, una propiedad crítica para diarización con segmentos breves. El repositorio se mantiene explícitamente para garantizar disponibilidad persistente de los activos y evitar roturas por dependencias con enlaces 404.

No se dispone de información sobre el número de parámetros, la longitud de contexto (en audio, la ventana de entrada) ni los datos de entrenamiento en la información proporcionada. La licencia es Apache 2.0 y el pipeline declarado es audio-to-audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ReDimNet2-B3 (red neuronal para embeddings de hablante; detalles internos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de entrada no especificada) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se detallan variantes cuantizadas) |
| Idiomas soportados | no disponible (independiente del idioma en la medida en que modela características acústicas del hablante) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`redimnet2_b3_lm.onnx` y `redimnet2_b3_lm_fbank.onnx`) |

## Arquitectura y entrenamiento

La información disponible indica que se trata de ReDimNet2-B3, un modelo de la familia ReDimNet2 orientado a la extracción de embeddings de hablante de 192 dimensiones. Se ofrecen dos variantes de grafo: una que recibe directamente la forma de onda y otra que recibe un filtro de banco log-mel de 80 canales, lo que elimina la necesidad de calcular la STFT en el pipeline de inferencia. Esta segunda variante es la que habilita la ejecución en la NPU Hexagon HTP mediante QNN, ya que evita operaciones no soportadas por el acelerador.

La model card menciona que el modelo es invariante a la duración del turno corto, una propiedad relevante para diarización con segmentos de audio breves. No se proporcionan datos sobre el número de tokens de audio empleados en el entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco habituales en modelos de embeddings de hablante). Tampoco se detallan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Extracción de embeddings de hablante de 192 dimensiones a partir de audio.
- Verificación de hablante (speaker verification): comparación de embeddings para determinar si dos segmentos corresponden al mismo hablante.
- Diarización de hablantes (speaker diarization): segmentación y agrupación de turnos de habla por identidad.
- Invariabilidad a la duración del turno corto, lo que facilita la diarización con intervenciones breves.
- Dos modos de entrada: forma de onda directa y filtro de banco log-mel de 80 canales sin STFT.
- Ejecución en CPU (x86_64 y ARM NEON), DirectML, CUDA y NPU Hexagon HTP (QNN) sobre Snapdragon X Elite.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes; el modelo es exclusivamente de representación de audio.
- Capacidades multilingües: no documentadas explícitamente; el modelo modela características acústicas del hablante, no contenido lingüístico.

## Casos de uso

- Diarización de reuniones y transcripciones: el modelo genera embeddings por turno que permiten agrupar intervenciones por hablante, lo que facilita la atribución de cada frase en actas automáticas y subtítulos.
- Verificación biométrica de voz en autenticación: comparar el embedding de una muestra de voz con el embedding de referencia del usuario para validar identidad en sistemas de acceso telefónico o banca por voz.
- Diarización en tiempo real en dispositivos de borde: gracias a la variante fbank y al soporte de Hexagon HTP y DirectML, puede ejecutarse en portátiles con Snapdragon X Elite sin depender de la nube.
- Análisis de grabaciones de contact center: separar las voces de agente y cliente para calcular tiempos de habla, solapamientos y métricas de calidad de la conversación.
- Indexación y búsqueda por hablante en archivos audiovisuales: extraer embeddings de cada segmento y almacenarlos en una base vectorial para recuperar fragmentos de una persona concreta en grandes archivos.
- Preprocesado para modelos de reconocimiento de voz (ASR): la diarización previa permite aplicar un modelo ASR por hablante o mantener coherencia en transcripciones multipartícipes.
- Investigación en biometría vocal: generar representaciones de 192 dimensiones para experimentos de comparación de hablantes con una licencia permisiva (Apache 2.0).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifican parámetros totales ni tamaño de los grafos ONNX).
- GPU recomendadas: no se detallan modelos concretos; la model card menciona soporte de CUDA y DirectML mediante ONNX Runtime.
- NPU: Hexagon HTP (QNN) sobre Snapdragon X Elite, usando el grafo fbank sin STFT.
- CPU: x86_64 y ARM NEON como fallback universal con SIMD.
- Cabe en GPU de consumo: previsiblemente sí, dado que es un extractor de embeddings y no un modelo generativo de gran tamaño, aunque no se confirma con cifras.
- Opciones de despliegue: ONNX Runtime (con execution providers CPU, DirectML, CUDA y QNN), y cualquier framework que consuma ONNX.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de parámetros, contexto ni rendimiento de este modelo ni de alternativas, por lo que no es posible establecer una comparación cuantitativa fiable con otros modelos de embeddings de hablante.

## Limitaciones y advertencias

- No se documentan sesgos conocidos; al ser un modelo biométrico, puede presentar disparidades de rendimiento entre grupos demográficos, pero no hay datos que lo confirmen.
- Riesgo de confusión entre hablantes con voces similares o en condiciones de ruido; no se aportan métricas de error (EER) que permitan acotar el riesgo.
- Invariabilidad a la duración del turno corto declarada por el autor, pero sin datos de validación publicados en la información disponible.
- No se especifican limitaciones de idioma ni de contexto de audio; la ventana de entrada no está documentada.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las obligaciones de atribución y las condiciones de los componentes de terceros que pueda incorporar el modelo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; el mantenimiento corre a cargo de un único ecosistema (diarizeapp), lo que implica un riesgo de continuidad si el mantenedor cesa la actividad.
- El tamaño del repositorio figura como 0.0 GB, lo que puede indicar que los pesos no están alojados en el repositorio o que la información de tamaño no está actualizada; verificar la integridad de los activos antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/diarizeapp/redimnet2-b3-onnx
- Repositorio del mantenedor: https://github.com/benzy/diarize
