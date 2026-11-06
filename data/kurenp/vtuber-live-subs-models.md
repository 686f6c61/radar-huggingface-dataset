# KurenP/vtuber-live-subs-models

## Resumen

`KurenP/vtuber-live-subs-models` es una exportación a ONNX del modelo de embeddings de hablante `lab260/redimnet2-plus`, que emplea la arquitectura ReDimNet2 (variante B6) y fue entrenado específicamente para ser robusto frente a variaciones de canal y códec. No se trata de un modelo generativo ni de un LLM, sino de un extractor de embeddings de voz de 192 dimensiones que permite verificar la identidad de un hablante a partir de audio a 16 kHz. El autor de esta ficha (KurenP) no ha entrenado el modelo, sino que ha realizado la conversión de formato para integrarlo en su aplicación de subtitulado en directo para VTubers.

La relevancia de esta publicación es doble. Por un lado, demuestra el patrón habitual de reutilización de modelos de reconocimiento de hablante en pipelines de producción mediante ONNX, lo que permite ejecutar la inferencia en CPU sin dependencias de PyTorch. Por otro, al incluir el front-end de extracción de características dentro del grafo (ventana Hamming, pre-énfasis, 72 bins log-mel y eliminación de la media temporal), simplifica enormemente la integración: el consumidor solo necesita enviar muestras PCM en coma flotante y recibe un vector L2-normalizado listo para comparación por similitud coseno.

El repositorio es pequeño (0,1 GB) y contiene únicamente el artefacto ONNX, con licencia Apache-2.0 heredada del modelo original. No se dispone de información sobre el pipeline de Hugging Face ni sobre los idiomas cubiertos, y el número de descargas y likes es cero en el momento de la consulta, lo que indica una publicación muy reciente y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ReDimNet2 (backbone B6), red neuronal para embeddings de hablante |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (acepta audio de cualquier duración; una trama de 25 ms o más) |
| Tipos de cuantizacion | no disponible (el artefacto publicado es ONNX float32) |
| Idiomas soportados | no disponible (modelo de hablante, independiente del idioma en teoría) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17) |

## Arquitectura y entrenamiento

El modelo subyacente es ReDimNet2, una arquitectura de reconocimiento de hablante desarrollada por PalabraAI (bajo licencia MIT) y entrenada por el equipo de lab260. La variante B6 hace referencia a una configuración concreta de profundidad y anchura dentro de la familia ReDimNet2. Según la model card, el entrenamiento se orientó a la robustez frente a canal y códec, un aspecto crítico en aplicaciones reales donde el audio proviene de micrófonos, transmisiones y compresiones diversas.

La exportación a ONNX se realizó desde PyTorch 2 con el código `asv` del autor original, usando `return_2d_output: True` y `out_channels: 224`, y se validó contra la implementación en PyTorch con un error máximo de 3e-7 sobre audio aleatorio. El grafo incluye el front-end completo de características (ventana Hamming, pre-énfasis, 72 bins log-mel y sustracción de la media temporal), de modo que la entrada es directamente la forma de onda. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, algo esperable en un modelo de embeddings y no generativo.

## Capacidades

- Extracción de embeddings de hablante: produce un vector de 192 dimensiones L2-normalizado por cada clip de audio de entrada.
- Verificación de hablante (speaker verification): permite decidir si dos fragmentos de audio corresponden a la misma persona mediante similitud coseno.
- Identificación de hablante (speaker identification): permite asignar cada clip a un hablante registrado previamente en una galería de embeddings.
- Robustez a canal y códec: el entrenamiento específico busca mantener la discriminabilidad bajo condiciones variables de grabación y compresión.
- Procesamiento de audio de duración variable: acepta desde una trama de 25 ms hasta clips arbitrariamente largos, con entrada mono a 16 kHz.
- Inferencia en CPU: el artefacto ONNX está pensado para ejecutarse con onnxruntime sin GPU.
- No soporta generación de texto, tool calling, agentes, visión ni audio generativo; es un modelo puramente discriminativo de representación.

## Casos de uso

- Subtitulado en directo de streams de VTubers: la aplicación original usa el embedding para identificar qué VTuber está hablando en cada momento y etiquetar los subtítulos con el nombre correcto. El modelo es adecuado porque opera en CPU con baja latencia (0,08 s por clip de 3 s en un Apple M4 con 4 hilos).
- Diarización de reuniones y podcasts: segmentar el audio por turnos de palabra y agrupar los segmentos por hablante comparando embeddings con similitud coseno. La ventana de contexto ilimitada en duración facilita procesar clips de distinta longitud.
- Verificación biométrica de voz en autenticación: comparar el embedding de una frase de acceso con el embedding de referencia del usuario registrado, con umbral calibrado sobre similitud coseno.
- Moderación y control de acceso en comunidades de voz: detectar suplantaciones de identidad en canales de Discord o plataformas similares comparando el hablante entrante con la galería de embeddings de los miembros.
- Indexación y búsqueda por voz en archivos multimedia: generar un embedding por segmento y permitir búsquedas del tipo "encuentra los fragmentos donde habla esta persona" sobre un archivo de audio o vídeo.
- Análisis de audiencias y métricas de participación: cuantificar el tiempo de habla por participante en una grabación multijugador, útil en investigación cualitativa o en análisis de streams.
- Preprocesado para pipelines de transcripción con atribución: combinar el modelo con un ASR para producir transcripciones con etiqueta de hablante, ejecutando el extractor de embeddings en el mismo servidor sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente reporta una métrica de rendimiento de inferencia: 0,08 s por clip de 3 s en CPU onnxruntime sobre un Apple M4 con 4 hilos. No se aportan valores de EER, minDCF ni accuracy sobre conjuntos como VoxCeleb.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la ruta principal; el modelo está diseñado para CPU con onnxruntime. El repositorio ocupa 0,1 GB, por lo que el peso del artefacto es reducido.
- GPU recomendadas: no se especifican; cualquier GPU compatible con onnxruntime (CUDA o TensorRT) podría ejecutar el grafo, pero no es el caso de uso previsto.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con soporte ONNX, aunque el diseño apunta a CPU.
- Opciones de despliegue: onnxruntime (CPU o GPU), con posibilidad de conversión a otros runtimes ONNX compatibles. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: 0,08 s por clip de 3 s en Apple M4 con 4 hilos (dato del autor). No se dispone de cifras para otras plataformas.

## Comparativa con modelos similares

No se dispone de información suficiente en la documentación proporcionada para establecer una comparativa con alternativas concretas (por ejemplo, ECAPA-TDNN, WavLM-based speaker models o x-vector). Los datos de parámetros, contexto y rendimiento de este modelo no están publicados, y no se han incluido métricas de comparación. Se indica por tanto "no disponible".

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, código ni respuestas; solo embeddings de hablante.
- No se han publicado métricas de precisión (EER, minDCF) ni detalles del dataset de entrenamiento, por lo que el rendimiento real en dominios distintos al de entrenamiento es desconocido.
- La robustez a canal y códec es una afirmación del autor del modelo base; no se aportan evaluaciones independientes en esta ficha.
- El modelo está pensado para audio mono a 16 kHz; otros formatos requieren remuestreo y conversión a mono antes de la inferencia.
- Riesgo de sesgo: al no documentarse la composición del dataset, no puede evaluarse la cobertura demográfica, de acentos o de idiomas.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos o negativos en la verificación de hablante si el umbral de similitud no se calibra por dominio.
- Licencia Apache-2.0: permite uso comercial y modificación, pero conviene conservar los avisos de atribución a lab260 y a PalabraAI (arquitectura ReDimNet2, MIT).
- El repositorio solo redistribuye una conversión de formato; no hay garantías del autor de la conversión sobre el comportamiento del modelo más allá de la validación numérica frente a PyTorch.
- Publicación con cero descargas y sin pipeline declarado en Hugging Face: la madurez y el soporte de la comunidad son mínimos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/KurenP/vtuber-live-subs-models
- Modelo base: https://huggingface.co/lab260/redimnet2-plus
