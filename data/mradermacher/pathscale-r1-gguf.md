# mradermacher/PathScale-R1-GGUF

## Resumen

PathScale-R1-GGUF es la version cuantizada en formato GGUF del modelo PathScale-R1, publicado por el usuario mradermacher a partir del modelo original de ChiPhan1110. Se trata de un modelo de 7.615.616.512 parametros (aproximadamente 7.600 millones), lo que lo situa en la categoria de modelos de ~8B, un tamano muy habitual para despliegue en hardware de consumo. La arquitectura subyacente no esta documentada en la informacion disponible, aunque la libreria declarada (transformers) y el pipeline conversacional sugieren un transformer decoder-only.

El valor principal de esta publicacion no es el modelo en si, sino el conjunto de cuantizaciones estaticas que ofrece: desde Q2_K (3,1 GB) hasta f16 (15,3 GB), pasando por variantes K-quant e IQ4_XS. Esto permite ejecutar el modelo en estaciones de trabajo con GPU consumer, portatiles o incluso en CPU mediante llama.cpp, algo imposible con los pesos originales en precision completa. Ademas, el repositorio incluye ficheros mmproj (multi-modal supplement), lo que indica que el modelo base tiene capacidad de vision, aunque no se detalla su alcance.

La relevancia de esta ficha es practica: para un desarrollador que quiera evaluar PathScale-R1 sin descargar el modelo original, estas cuantizaciones ofrecen un punto de entrada rapido con un coste de almacenamiento y VRAM reducido. La licencia no esta declarada, lo que constituye una advertencia importante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (inferida por libreria transformers y pipeline conversacional); no confirmada por el autor |
| Parametros totales | 7.615.616.512 (~7,6B) |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (segun la model card del autor) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones) y safetensors (modelo base original) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo original PathScale-R1. Los metadatos indican que es un modelo de 7.615.616.512 parametros, compatible con transformers y orientado a uso conversacional. La presencia de ficheros mmproj en el repositorio GGUF confirma que el modelo base incorpora un codificador multimodal (vision), aunque no se especifica que arquitectura de vision utiliza ni como se integra con el decoder.

Tampoco hay datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o RL con verificacion. El sufijo "R1" en el nombre sugiere una posible inspiracion en el paradigma de razonamiento de DeepSeek-R1, pero esto es una inferencia nominal, no un dato confirmado. Las cuantizaciones publicadas son estaticas (no hay quants con imatrix ni ponderados disponibles en el momento de la publicacion), segun indica el propio autor en la model card.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el tag `conversational` del repositorio.
- Procesamiento multimodal: los ficheros mmproj indican soporte de entrada de imagenes, aunque no se detalla la tarea concreta (VQA, captioning, OCR, etc.).
- Razonamiento: el nombre "R1" sugiere capacidades de razonamiento, pero no hay evidencia documentada en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la model card (`language: en`).
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Evaluacion local rapida del modelo base: descargar la cuantizacion Q4_K_M (4,8 GB) y ejecutarla en llama.cpp u Ollama permite evaluar el comportamiento conversacional de PathScale-R1 sin necesidad de GPU de datacenter ni de los 15,3 GB del f16.
- Prototipado de asistentes conversacionales en ingles: el tag `conversational` y el pipeline declarado lo hacen adecuado para construir demos de chatbot multi-turno en estaciones de trabajo con una unica GPU consumer.
- Procesamiento de imagenes en local: los ficheros mmproj permiten cargar el modelo con soporte visual en llama.cpp, util para experimentos de descripcion de imagenes o respuesta a preguntas visuales sin enviar datos a la nube.
- Despliegue en portatiles y equipos sin GPU dedicada: la cuantizacion Q2_K (3,1 GB) o Q3_K_S (3,6 GB) permite ejecucion en CPU con RAM modesta, adecuada para pruebas de concepto y entornos de desarrollo.
- Integracion en pipelines de generacion aumentada por recuperacion (RAG): al ser un modelo de ~7,6B con pesos GGUF, puede combinarse con indices vectoriales locales para responder preguntas sobre documentacion en ingles.
- Fine-tuning ligero o experimentacion con LoRA: aunque las cuantizaciones GGUF no son directamente entrenables, el modelo base en safetensors (7,6B) es un tamano manejable para adaptaciones con LoRA en una GPU de 24 GB.
- Distribucion de demos offline: el formato GGUF y el reducido tamano de las cuantizaciones facilitan empaquetar una demo funcional en un contenedor o USB sin dependencias de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~3,1 GB
  - Q3_K_S: ~3,6 GB
  - Q4_K_M: ~4,8 GB
  - Q5_K_M: ~5,5 GB
  - Q6_K: ~6,4 GB
  - Q8_0: ~8,2 GB
  - f16: ~15,3 GB
  - Anadir ~1,0-1,5 GB si se carga el mmproj para vision.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4-Q8; A100/H100 solo necesarias para f16 o para servir muchas peticiones concurrentes.
- Cabe en GPU consumer: si, practicamente cualquier GPU con 6 GB o mas puede ejecutar Q4_K_S o Q4_K_M; las cuantizaciones Q2/Q3 caben en GPUs de 4 GB o en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui; vLLM y TGI no soportan GGUF de forma nativa (requieren el modelo en safetensors).
- Latencia y throughput: no disponibles; dependen del hardware y del backend. Como referencia cualitativa, un modelo de ~7,6B en Q4_K_M suele generar decenas de tokens por segundo en una RTX 4090 y unos pocos tokens por segundo en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| PathScale-R1-GGUF | ~7,6B | no disponible | no disponible | GGUF | Cuantizaciones estaticas; incluye mmproj para vision |
| Mistral-7B-Instruct (GGUF) | ~7,2B | 32k (v0.2) | Apache 2.0 | GGUF, safetensors | Referencia consolidada en ~7B, ampliamente soportado |
| Llama 3.1 8B Instruct (GGUF) | ~8,0B | 128k | Llama 3.1 Community License | GGUF, safetensors | Contexto largo y buen rendimiento general en ingles |
| Qwen2.5 7B Instruct (GGUF) | ~7,6B | 128k | Apache 2.0 | GGUF, safetensors | Multilingue y con soporte de tool calling |

La comparativa es orientativa: no hay datos de benchmarks de PathScale-R1 que permitan situarlo frente a estas alternativas. La principal desventaja frente a Mistral, Llama 3.1 y Qwen2.5 es la ausencia de licencia declarada y de documentacion sobre contexto y entrenamiento.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor del modelo base (ChiPhan1110) antes de cualquier despliegue en produccion.
- Idioma: la model card solo declara ingles (`en`); el rendimiento en castellano no esta verificado y probablemente sea inferior.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin medir empiricamente el limite real.
- Riesgo de alucinacion: inherente a los modelos de ~7,6B sin documentacion de alineamiento; no hay datos sobre RLHF o DPO que permitan estimar su fiabilidad.
- Cuantizaciones estaticas: el autor no ofrece variantes con imatrix ni ponderadas, lo que puede implicar una perdida de calidad algo mayor en Q2/Q3 frente a alternativas con calibracion.
- Documentacion escasa: no hay informacion sobre arquitectura, dataset, contexto ni benchmarks; la evaluacion debe hacerse por prueba directa.
- Fecha de creacion futura en los metadatos (2026): conviene verificar la integridad y procedencia de los ficheros antes de usarlos en entornos sensibles.
- Vision limitada: aunque se incluyen ficheros mmproj, no se documenta que tareas visuales estan soportadas ni con que calidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/PathScale-R1-GGUF
- Modelo base: https://huggingface.co/ChiPhan1110/PathScale-R1
- Pagina de descargas del autor: https://hf.tst.eu/model#PathScale-R1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
