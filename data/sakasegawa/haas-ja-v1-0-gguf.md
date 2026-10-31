# sakasegawa/Haas-ja-v1.0-GGUF

## Resumen

Haas-ja-v1.0-GGUF es una cuantización en formato GGUF del modelo de reconocimiento automático de habla (ASR) Haas-ja-v1.0, desarrollado por Third Intelligence y adaptado por el usuario sakasegawa para ejecutarse con el motor speech.cpp. El modelo original es un reconocidor de japonés basado en la arquitectura FastConformer, cuyo decodificador TDT (token-and-duration transduction) incorpora una red de predicción construida con capas de Kimi Delta Attention, una innovación notable frente a las redes de predicción RNN tradicionales de los decodificadores transductor.

La relevancia de esta versión GGUF radica en la portabilidad: mientras que el código oficial de Haas-ASR requiere una GPU NVIDIA, esta cuantización permite ejecutar el modelo en macOS con Metal, en Windows y Linux con Vulkan, o directamente en CPU, con archivos de entre 0,35 y 1,23 GB. Con unos 616 millones de parámetros, se sitúa en la gama de modelos ASR ligeros, adecuado para transcripción en local, aplicaciones de escritorio y servidores modestos.

Cabe destacar que el layout de estos ficheros GGUF es propio de speech.cpp (versión 0.9.4 o posterior), por lo que herramientas habituales del ecosistema GGUF como llama.cpp, LM Studio u Ollama no pueden cargarlos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador TDT (red de predicción basada en Kimi Delta Attention) |
| Parámetros totales | 615.797.792 (aprox. 616 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (grabaciones largas recomendadas con VAD silero, segmentos de ~30 s) |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K, Q4_K |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (layout propio de speech.cpp; incompatible con llama.cpp, LM Studio y Ollama) |

## Arquitectura y entrenamiento

El modelo base, Haas-ja-v1.0 de Third Intelligence, es un reconocidor FastConformer: una variante del Conformer que reduce coste computacional mediante convoluciones y mecanismos de atención optimizados. Como decodificador emplea un transductor TDT, que predice tokens y duraciones de forma conjunta; la particularidad de Haas-ja-v1.0 es que su red de predicción no usa la típica LSTM, sino capas de Kimi Delta Attention, un mecanismo de atención lineal con actualizaciones delta que reduce el coste de memoria y cómputo por paso.

El fichero GGUF empaqueta en un único archivo el frontend, el encoder, la red de predicción, la unión (joint) y el vocabulario, y decodifica de forma greedy, igual que NeMo por defecto. Sobre esta versión se ha añadido soporte de vocabulario personalizado (keywords): se potencian las lecturas de las palabras clave durante la decodificación, se conservan los cambios solo cuando abarcan la palabra completa y se escriben en su forma escrita. No se dispone de información sobre el corpus de entrenamiento, número de tokens ni etapas de ajuste fino del modelo base en la documentación proporcionada.

## Capacidades

- Transcripción de habla en japonés con decodificación greedy equivalente a la de NeMo.
- Salida con marcas de tiempo por token mediante la opción `--timestamps`.
- Segmentación por actividad de voz con `--vad silero-vad`, recomendada para grabaciones de más de 30 segundos.
- Vocabulario personalizado (custom vocabulary) mediante `--keywords`: refuerza la reconocición de nombres propios, términos técnicos o marcas, con parámetros de intensidad (`--keywords-alpha`, 2 por defecto) y de conservación de cambios (`--keywords-guard`).
- Servidor HTTP compatible con la API de OpenAI para transcripciones y sesiones Realtime (`speech serve`), y modo worker para integración en pipelines.
- Ejecución acelerada en macOS (Metal), Windows y Linux (Vulkan) y en CPU sin GPU.
- No es un modelo de lenguaje: no genera texto, no razona, no hace tool calling ni soporta agentes; su función es exclusivamente ASR.

## Casos de uso

- Transcripción local de reuniones en japonés: con `--vad silero-vad` se reconocen solo las regiones con habla de grabaciones largas, y las marcas de tiempo permiten alinear el texto con el audio.
- Dictado y toma de notas en escritorio: gracias a su tamaño reducido (0,35-0,66 GB en cuantizaciones habituales) y al soporte de Metal y Vulkan, funciona en portátiles sin GPU dedicada.
- Servicios de transcripción con API compatible con OpenAI: `speech serve` expone un servidor HTTP que acepta peticiones de transcripción y sesiones Realtime, útil para integrar ASR en aplicaciones existentes.
- Reconocimiento de terminología de dominio: el vocabulario personalizado permite reforzar nombres de productos, empresas o términos médicos/legal-judiciales en japonés que los ASR genéricos suelen transcribir mal.
- Subtitulado de contenido audiovisual: las marcas de tiempo y la salida por segmentos facilitan la generación de subtítulos para vídeos o podcasts en japonés.
- Procesamiento por lotes en servidores modestos: al funcionar en CPU, puede desplegarse en máquinas sin acelerador para transcribir volúmenes de audio de forma asíncrona mediante el modo worker.
- Aplicaciones embebidas o de borde: la cuantización Q4_K (0,35 GB) hace viable su ejecución en hardware con recursos muy limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: el modelo completo ocupa 1,23 GB en F16, 0,66 GB en Q8_0, 0,51 GB en Q6_K, 0,43 GB en Q5_K y 0,35 GB en Q4_K; la memoria necesaria en ejecución es del orden del tamaño del fichero más el buffer de audio.
- GPU recomendadas: no requiere GPU dedicada; se acelera con Metal en macOS y Vulkan en Windows y Linux. El código oficial del modelo base sí requiere GPU NVIDIA, pero esta versión GGUF no.
- Consumer GPUs: cabe con holgura en cualquier GPU moderna; al funcionar por Vulkan, es compatible con tarjetas como las NVIDIA GeForce RTX o las AMD Radeon, y también con Apple Silicon vía Metal.
- CPU: totalmente funcional sin acelerador, algo poco habitual en ASR transductor de este tamaño.
- Despliegue: exclusivamente mediante speech.cpp 0.9.4 o posterior (CLI, worker y servidor HTTP). Incompatible con llama.cpp, Ollama, LM Studio, vLLM y TGI. speech.cpp 0.9.3 descarga la revisión `3168c92` del repositorio, con los mismos pesos pero sin la configuración de vocabulario personalizado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Formato/entorno | Licencia |
|---|---|---|---|---|
| Haas-ja-v1.0-GGUF | 616 M | japonés | GGUF (speech.cpp), CPU/Metal/Vulkan | Apache 2.0 |
| Whisper large-v3 (OpenAI) | aprox. 1.550 M | multilingüe (~99 idiomas) | GGUF/PyTorch (whisper.cpp, llama.cpp) | MIT |
| ReazonSpeech/Nemo japoneses (p. ej. NVIDIA parakeet-ja o NeMo ASR japonés) | no disponible | japonés | NeMo/PyTorch, GPU NVIDIA | varía |

Haas-ja-v1.0-GGUF se diferencia de Whisper en que está especializado en japonés, es notablemente más ligero y ofrece vocabulario personalizado nativo, mientras que Whisper cubre muchos más idiomas. Frente a los modelos NeMo japoneses, ofrece la ventaja de la ejecución sin GPU NVIDIA gracias a la cuantización GGUF para speech.cpp. Datos de rendimiento comparativos: no disponible.

## Limitaciones y advertencias

- Compatibilidad restringida: el layout GGUF es propio de speech.cpp; llama.cpp, LM Studio, Ollama y cualquier otro lector de GGUF no pueden cargar estos ficheros.
- Requiere speech.cpp 0.9.4 o posterior para la revisión actual; la 0.9.3 solo accede a la revisión `3168c92`, sin configuración de vocabulario personalizado. En 0.9.4 las opciones de keywords se llaman `words`, `words_alpha` y `words_guard`; desde 0.10.0, `keywords`, `keywords_alpha` y `keywords_guard`.
- Solo reconoce japonés; no es adecuado para otros idiomas ni para código mixto extenso.
- El reconocimiento con vocabulario personalizado decodifica dos veces y devuelve solo el texto, sin marcas de tiempo, por lo que no admite `--timestamps` en ese modo.
- Grabaciones de más de unos 30 segundos se reconocen mejor con VAD; sin él, la calidad puede degradarse.
- No hay datos publicados de WER/CER ni comparativas de precisión en la información disponible, por lo que no puede evaluarse su exactitud frente a otros ASR.
- Sesgos y riesgo de alucinación: no disponible; al ser un modelo ASR transductor con decodificación greedy, puede cometer errores en habla ruidosa, acentos regionales o vocabulario fuera de dominio.
- Licencia Apache 2.0: permite uso comercial sin restricciones significativas más allá de conservar el aviso de licencia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/sakasegawa/Haas-ja-v1.0-GGUF
- Modelo base: https://huggingface.co/third-intelligence/Haas-ja-v1.0
- speech.cpp (repositorio): https://github.com/nyosegawa/speech.cpp
- Documentación de FastConformer en speech.cpp: https://github.com/nyosegawa/speech.cpp/blob/main/docs/models/fastconformer.md
- Documentación de la línea de comandos: https://github.com/nyosegawa/speech.cpp/blob/main/docs/cli.md
- Documentación del servidor: https://github.com/nyosegawa/speech.cpp/blob/main/docs/server.md
