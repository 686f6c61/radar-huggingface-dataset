# loom-ai-org/kyutai-stt-1b-en-fr-loom

## Resumen

`loom-ai-org/kyutai-stt-1b-en-fr-loom` es la exportación a loom.cpp del modelo de reconocimiento de voz en streaming de Kyutai, `kyutai/stt-1b-en_fr`. No es un modelo nuevo: los pesos son idénticos a los del modelo base y lo que cambia es el empaquetado. El repositorio publica un único archivo GGUF autodescriptivo (`kyutai-stt-1b-en-fr.gguf`) que incluye las topologías de grafo, el tokenizador y el script de driver necesarios para ejecutarlo con el runtime loom, generado con la herramienta loom-exporter.

Técnicamente combina el encoder del códec neuronal Mimi con un modelo de lenguaje de 16 capas que consume 12,5 frames de códec por segundo de audio, con 1.045.133.131 parámetros totales (aproximadamente 1,05 B). Soporta inglés y francés, funciona sobre audio mono a 24 kHz y está diseñado para transcripción en streaming: el texto se emite con 0,5 s de retardo respecto al audio y la atención del decodificador se limita a los últimos 750 frames (60 s) mediante una caché en anillo, de modo que la memoria no crece con la duración de la grabación.

Su relevancia es doble. Por un lado, permite ejecutar un modelo ASR de Kyutai en el ecosistema loom (runtime en C++ con API en Python) sin necesidad de portar pesos ni reimplementar el pipeline de inferencia. Por otro, al fijar la memoria, hace viable la transcripción de grabaciones arbitrariamente largas en hardware modesto. El contrapunto es que se trata de un artefacto con 0 descargas y 0 likes en el momento de redactar esta ficha, y que su formato GGUF es específico de loom.cpp.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder del códec neuronal Mimi más decodificador transformer de 16 capas sobre tokens discretos de audio (12,5 frames/s) |
| Parámetros totales | 1.045.133.131 (dato de safetensors) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 750 frames de audio (60 s) mediante caché en anillo; admite audio de cualquier duración en memoria fija |
| Tipos de cuantización | No disponible: el repositorio publica un único GGUF con los pesos del modelo base sin modificar y no lista variantes cuantizadas |
| Idiomas soportados | Inglés (en) y francés (fr) |
| Licencia | cc-by-4.0, heredada del modelo base |
| Formato de pesos | GGUF autodescriptivo (grafo, tokenizador y driver embebidos), generado con loom-exporter |
| Modelo base | kyutai/stt-1b-en_fr |
| Tamaño del repositorio | 4,2 GB |
| Tasa de muestreo de entrada | 24 kHz mono, float (tasa del códec Mimi) |
| Librería de ejecución | loom-py-rt (runtime loom.cpp), requiere loom 1.0.0-rc14 o posterior |
| Pipeline declarado | automatic-speech-recognition |

## Arquitectura y entrenamiento

La arquitectura es un pipeline de dos etapas. El encoder del códec Mimi convierte la forma de onda en una secuencia de tokens discretos a 12,5 frames por segundo, y sobre esa secuencia opera un modelo de lenguaje de 16 capas que genera los identificadores de texto correspondientes. El modelo se ha entrenado con un retardo de texto deliberado: la transcripción va 0,5 s por detrás del audio, y por ese motivo la implementación añade 1,5 s de silencio antes de decodificar, de forma que una palabra pronunciada en el último medio segundo todavía se transcribe. El consumo de audio se hace por bloques y la atención se resuelve contra una caché en anillo de 750 posiciones, lo que desacopla el coste de memoria de la longitud de la entrada.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; esos datos no están publicados en la model card de esta exportación y deben consultarse en la documentación del modelo base de Kyutai. Sí se documenta una diferencia relevante frente al port a transformers: `kyutai/stt-1b-en_fr-trfs` re-codifica el primer frame de audio y ventanea el modelo de lenguaje en 375 posiciones, mientras que este checkpoint fue entrenado con 750. Esta exportación reproduce paso a paso `run_inference` de `moshi` (los mismos códigos en cada frame y los mismos ids de texto), por lo que las transcripciones pueden diferir de las del port a transformers.

## Capacidades

- Reconocimiento de voz a texto (ASR) en inglés y francés, tanto en streaming como sobre un clip completo.
- Entrada de audio mono a 24 kHz, la tasa del códec Mimi; la librería no remuestrea por sí sola.
- Emisión incremental de texto con 0,5 s de retardo respecto al audio, apta para subtitulado en directo.
- Memoria fija independiente de la duración: caché en anillo de 750 frames (60 s) más codificación por bloques.
- Salida de texto plano con un único span en `segments`: no genera timestamps por palabra ni por segmento.
- Ejecución mediante la API de alto nivel `model.speech2text.infer(...)` o llamada directa al driver embebido con `model.infer(...)` para acceder a parámetros no expuestos por la puerta de alto nivel.
- Tool calling y function calling: no soportados, no documentados en la información disponible.
- Comportamiento agéntico o razonamiento multi-paso: no aplica, es un modelo ASR puro.
- Visión, audio generativo y síntesis de voz: no disponibles.
- Detección automática de idioma: no documentada; el modelo cubre en/fr sin indicación de conmutación explícita.

## Casos de uso

- Subtitulado en directo: el modelo emite texto de forma incremental con 0,5 s de retardo, suficiente para generar subtítulos casi en tiempo real en retransmisiones o videollamadas en inglés y francés.
- Transcripción de reuniones y llamadas largas: al atender solo los últimos 60 s mediante caché en anillo y codificar por bloques, una reunión de horas consume tiempo de proceso pero no memoria creciente, lo que evita la segmentación manual en trozos.
- Analítica de atención al cliente: transcripción en streaming de llamadas para alimentar métricas, detección de intenciones o búsqueda sobre el histórico, con despliegue local si los datos no pueden salir de la infraestructura propia.
- Accesibilidad: generación de subtítulos para personas con discapacidad auditiva en contenidos en inglés o francés, integrado en el reproductor mediante la API de loom-py.
- Componente ASR de un asistente de voz: encadenado con un LLM y un sistema de TTS para construir un bucle de conversación por voz en inglés o francés, aceptando el retardo de 0,5 s como coste asumible.
- Indexación de archivos de audio y vídeo: transcripción por lotes de pódcast, clases o archivos audiovisuales para habilitar búsqueda por texto sobre el contenido hablado.
- Aplicaciones de toma de notas: dictado y resumen de notas de voz en el dispositivo, siempre que el hardware pueda ejecutar el runtime de loom.
- Integración en C++ o Python embebido: al distribuirse como GGUF con driver y grafo incluidos, se puede invocar desde el motor loom.cpp sin reimplementar la ventana de muestreo ni el ensamblado de la salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta exportación no incluye cifras de WER, MMLU ni de ninguna otra métrica, y los resultados de la búsqueda web no aportan datos de evaluación (los enlaces devueltos corresponden a Loom, la herramienta de grabación de pantalla, y a una marca de ropa homónima). El único dato de rendimiento declarado es cualitativo: el retardo de texto de 0,5 s respecto al audio y la ventana de atención de 750 frames (60 s).

## Requisitos de hardware

- VRAM estimada para los pesos: alrededor de 2,1 GB en fp16, 1,1 GB en q8 y 0,6 GB en q4, calculados a partir del recuento de 1,05 B de parámetros. No son cifras publicadas por el autor y hay que sumarles el encoder del códec y las activaciones.
- GPU de consumo: el modelo cabe con holgura en cualquier GPU con 6 GB o más de VRAM, como una RTX 3060, RTX 4060, RTX 4070 o RTX 4090. La RTX 4090 queda muy sobredimensionada para una sola sesión.
- GPU de centro de datos: A100 o H100 no son necesarias para una instancia, pero permiten concentrar muchas sesiones concurrentes de transcripción en un solo nodo.
- CPU: al tratarse de 1,05 B de parámetros y de un motor escrito en C++, la inferencia en CPU es plausible, aunque no se publican cifras de latencia ni de throughput para ese escenario.
- Opciones de despliegue: `pip install -U "loom-py-rt[hub]"` y uso de la API de loom-py sobre el motor loom.cpp, que es el runtime previsto y el único documentado. Se requiere loom 1.0.0-rc14 o posterior por la caché en anillo.
- Compatibilidad con otros motores: no se documenta soporte para vLLM, TGI, llama.cpp u Ollama. El GGUF es autodescriptivo y específico de loom.cpp, con sus propias topologías de grafo y driver, por lo que no debe asumirse que sea cargable por llama.cpp.
- Latencia y throughput: se declara un retardo de texto de 0,5 s por diseño. No hay datos publicados de tokens por segundo, factor de tiempo real alcanzable ni rendimiento por GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kyutai-stt-1b-en-fr-loom (este repositorio) | 1,05 B | 750 frames de audio (60 s) con caché en anillo | No disponible | cc-by-4.0 | GGUF para loom.cpp en HuggingFace |
| kyutai/stt-1b-en_fr (modelo base) | 1,05 B | No disponible en la información proporcionada | No disponible | cc-by-4.0 (heredada) | Pesos originales en HuggingFace |
| kyutai/stt-1b-en_fr-trfs (port a transformers) | 1,05 B | Ventana de 375 posiciones en el modelo de lenguaje | No disponible; la model card advierte de que las transcripciones pueden diferir de las de `moshi` | No disponible en la información proporcionada | Conversión para transformers en HuggingFace |

Los tres artefactos comparten los mismos parámetros subyacentes; las diferencias están en el runtime, en la ventana de atención aplicada y en el formato de pesos. No se dispone de datos de benchmarks que permitan comparar la calidad de transcripción entre ellos.

## Limitaciones y advertencias

- Frecuencia de muestreo obligatoria: el modelo toma audio mono a 24 kHz, la tasa del códec Mimi, no los 16 kHz habituales en ASR. `model.contract["sample_rate"]` lo declara y loom no remuestrea, así que el remuestreo corre a cargo del integrador.
- Divergencia frente al port a transformers: esta exportación reproduce el comportamiento de `moshi` con ventana de 750 posiciones, mientras que `kyutai/stt-1b-en_fr-trfs` usa 375. Las transcripciones de ambos pueden no coincidir.
- Sin timestamps: `segments` devuelve un único span que cubre el clip completo, lo que impide alinear subtítulos o indexar por marcas temporales sin procesamiento adicional.
- Retardo inherente: el texto va 0,5 s por detrás del audio. Para aplicaciones conversacionales interactivas ese retardo se suma al del resto del pipeline.
- Ventana de atención limitada: el decodificador solo atiende los últimos 60 s de audio. La memoria es fija, pero eso no garantiza coherencia de contexto más allá de esa ventana.
- Cobertura de idiomas restringida a inglés y francés: no hay soporte documentado de otros idiomas ni de detección de idioma.
- Sesgos: no hay información publicada sobre sesgos demográficos, acentos o variedades dialectales en la documentación disponible.
- Riesgo de alucinación: no está cuantificado para este checkpoint. Como en cualquier sistema ASR, es esperable que ante silencio, ruido o audio fuera de dominio el modelo genere texto plausible no presente en la señal, por lo que conviene validar en producción.
- Licencia cc-by-4.0: permite uso comercial, pero exige atribución a Kyutai (y al empaquetado de loom-ai-org) y no ofrece garantías. Hay que revisar además las condiciones del modelo base.
- Dependencia de versión: requiere loom 1.0.0-rc14 o posterior; versiones anteriores no incorporan la caché en anillo necesaria.
- Madurez: el repositorio registra 0 descargas y 0 likes, sin validación por parte de la comunidad, y la librería es `loom-py-rt`, un runtime específico del ecosistema loom.
- Compatibilidad de formato: el GGUF incluye grafos y driver propios de loom.cpp; no hay evidencia de que sea interoperable con otras herramientas que leen GGUF.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/loom-ai-org/kyutai-stt-1b-en-fr-loom
- Modelo base: https://huggingface.co/kyutai/stt-1b-en_fr
- Conversión a transformers del modelo base: https://huggingface.co/kyutai/stt-1b-en_fr-trfs
- Motor loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Exportador loom-exporter: https://github.com/loom-ai-org/loom-exporter
- API Python loom-py (paquete `loom-py-rt` en PyPI): https://github.com/loom-ai-org/loom-py
- Búsqueda web: los resultados obtenidos no contienen enlaces relevantes al modelo. Corresponden a Loom (herramienta de grabación de pantalla, https://www.loom.com/) y a la marca de ropa Loom (https://www.loom.fr/). No se han encontrado papers, blogs ni demos adicionales sobre este checkpoint.
