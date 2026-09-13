# Glimpse-Dictation/Parakeet-TDT-0.6B-V3-coreml

## Resumen

Parakeet-TDT-0.6B-V3-coreml es un paquete de artefactos para reconocimiento automático de voz (ASR) publicado por Glimpse-Dictation, pensado para ejecutar la transcripción de Parakeet TDT 0.6B V3 de NVIDIA sobre Apple Silicon. No es un modelo entrenado desde cero: es una exportación derivada del GGUF Q8_0 de Handy, en la que el encoder se convierte a Core ML compilado (.mlmodelc) y el decodificador se extrae a un GGUF ligero con los pesos del predictor, la red conjunta, el tokenizador y los metadatos. El conjunto ocupa 1,11 GB de descarga: 19,48 MB para el decodificador GGUF y 1,09 GB para el ZIP del encoder Core ML.

El interés de esta ficha está en que combina dos formatos y dos rutas de ejecución en un mismo paquete: el encoder se ejecuta con Core ML en FP16 permitiendo CPU y Neural Engine (GPU excluida), mientras que el decodificador corre en CPU. Los safetensors del repositorio declaran 18.123.398 parámetros, cifra que corresponde únicamente al decodificador; el modelo base se denomina 0.6B. La exportación soporta TDT V3 en modo offline y no incorpora streaming, sesgo de palabras personalizadas ni diarización de hablantes.

Es relevante ahora porque permite dictado y transcripción en dispositivo dentro del ecosistema Apple sin enviar audio a la nube, pero conviene ser explícito: el repositorio contiene piezas para una aplicación, no ejecutables autónomos, y la integración como dependencia de aplicación está en desarrollo. Con 0 descargas y 0 likes en el momento de la consulta, no hay validación comunitaria ni cifras de precisión publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transductor TDT (Token-and-Duration Transducer): encoder exportado a Core ML mas decodificador formado por predictor y red conjunta. Modelo base NVIDIA Parakeet TDT 0.6B V3 |
| Parametros totales | 18.123.398 en los safetensors del repositorio, cifra que corresponde solo al decodificador (predictor y red conjunta). El modelo base se denomina 0.6B y el encoder Core ML ocupa 1,09 GB en FP16, equivalente aproximado a 545 millones de parametros. El desglose exacto por componente no esta disponible |
| Parametros activos | No aplica: no es un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | El encoder acepta 128 bandas mel y hasta 1501 fotogramas por llamada, con mascara de longitud. El runtime divide las grabaciones largas en fragmentos. No se especifica el equivalente en segundos ni un contexto en tokens |
| Tipos de cuantizacion | Decodificador: Q8_0 (GGUF). Encoder: FP16 (Core ML). No se documentan otras cuantizaciones |
| Idiomas soportados | No disponible. La model card no enumera idiomas y solo aclara que no se reclama equivalencia de precision multilingue frente a la version ggml |
| Licencia | CC BY 4.0 |
| Formato de pesos | GGUF (decodificador, `parakeet-tdt-0.6b-v3-Q8_0-decoder.gguf`) y Core ML compilado `.mlmodelc` empaquetado en ZIP (encoder) |
| Tamano de descarga | 19,48 MB (decodificador) + 1,09 GB (ZIP del encoder) = 1,11 GB |
| Runtime requerido | Apple Silicon. Adaptador Core ML de transcribe.cpp con soporte de GGUF solo decodificador. No son ejecutables de transcripcion autonomos |

## Arquitectura y entrenamiento

El modelo base es un transductor TDT, un esquema de ASR que predice de forma conjunta tokens y duraciones, lo que permite emitir varios tokens por fotograma y reduce el numero de pasos de decodificacion. En este repositorio la topologia se reparte entre dos artefactos: el encoder, convertido a Core ML mediante `scripts/convert-parakeet-gguf-to-coreml.py` de transcribe.cpp, y el decodificador, extraido con `scripts/extract-parakeet-decoder.py`, que preserva los pesos de predictor y red conjunta, el tokenizador y los metadatos, y marca `stt.parakeet.decoder_only=true`. Ambas piezas derivan de `parakeet-tdt-0.6b-v3-Q8_0.gguf` de Handy. No se detalla en la informacion disponible la topologia interna exacta del encoder ni el numero de capas.

Aqui no hay entrenamiento ni ajuste: es un proceso de conversion y cuantizacion. Por tanto, no se documentan volumen de tokens de entrenamiento, composicion del dataset ni fases de RLHF o DPO. La innovacion tecnica destacable es la division del grafo en un encoder compilado para Core ML (calculo FP16 con CPU y Neural Engine permitidos y GPU excluida, con mascara de longitud) y un decodificador GGUF que corre en CPU. Core ML puede recurrir a operaciones de CPU, de modo que no hay garantia de ejecucion exclusiva en Neural Engine. El paquete incluye hashes SHA-256 del GGUF original, del GGUF solo decodificador y del ZIP del encoder para verificar la procedencia.

## Capacidades

- Transcripcion de voz a texto en modo offline con el esquema TDT V3. La exportacion no soporta Unified ni Nemotron en streaming.
- Ejecucion del encoder sobre CPU y Neural Engine mediante Core ML, con FP16 como precision de calculo.
- Ejecucion del decodificador (predictor y red conjunta) en CPU a partir del GGUF Q8_0.
- Troceado automatico de grabaciones largas: el runtime divide el audio en fragmentos que caben en la capacidad del encoder (128 bandas mel, hasta 1501 fotogramas).
- Uso del modelo base completo en CPU o GPU mediante el GGUF Q8_0 de Handy, que conserva el mecanismo de reserva normal de ggml.
- Capacidades que NO estan presentes: no hay tool calling ni function calling, no hay comportamiento de agente ni razonamiento multi-paso, no hay vision, audio de entrada mas alla del propio ASR, ni modo de pensamiento.
- No hay sesgo de palabras personalizadas, ni streaming, ni diarizacion de hablantes.
- Idiomas soportados y capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Dictado en local sobre macOS: el paquete encaja en una aplicacion de dictado nativa (el propio proyecto Glimpse lo usa) que convierte voz a texto sin salir del equipo, aprovechando el Neural Engine para el encoder y la CPU para el decodificador.
- Notas de voz y reuniones con requisitos de privacidad: al no requerir servicios en la nube, es apto para despachos profesionales, sanidad o entornos corporativos donde el audio no puede salir del dispositivo. El runtime trocea la grabacion para ajustarse al limite de fotogramas del encoder.
- Subtitulado de clips cortos: para material audiovisual de duracion reducida, el flujo completo cabe en memoria (en torno a 1,5-2 GB) y puede ejecutarse en un Mac portatil sin GPU dedicada.
- Automatizacion de flujos internos en Mac: transcripcion por lotes de archivos de audio dentro de scripts de escritorio, con la ventaja de que no hay coste por minuto ni dependencia de red.
- Aplicaciones Apple Silicon con presupuesto de bateria ajustado: al delegar el encoder en el Neural Engine y mantener el decodificador en CPU con un GGUF de 19,48 MB, el consumo y la huella de memoria son contenidos frente a alternativas basadas en GPU.
- Integracion en una aplicacion propia mediante el adaptador de transcribe.cpp: un desarrollador puede invocar la sesion Core ML pasando el directorio `.mlmodelc` y dejar que la capa de aplicacion detecte el companero junto al archivo `-decoder.gguf`.
- Escenarios en Windows o Mac sin requisitos de Neural Engine: para esos casos el autor recomienda el GGUF Q8_0 completo de Handy, que mantiene la ruta CPU/GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No se proporcionan cifras de WER, latencia, throughput ni comparaciones numericas con otros sistemas. La model card advierte ademas que la salida en FP16 puede diferir de la de ggml y que no se reclama equivalencia de precision multilingue entre ambas rutas.

## Requisitos de hardware

- Plataforma: Apple Silicon obligatorio para el encoder Core ML. La model card indica explicitamente que el paquete Core ML requiere Apple Silicon.
- Memoria: el encoder ocupa 1,09 GB de disco en FP16 y el decodificador unos 19,48 MB, lo que situa la huella de trabajo en torno a 1,5-2 GB de memoria unificada. Cabe en cualquier Mac Apple Silicon con 8 GB o mas.
- GPU: no se utiliza. La configuracion de Core ML permite CPU y Neural Engine y excluye la GPU.
- CPU: el decodificador (predictor y red conjunta) se ejecuta en CPU.
- Aceleradores recomendados: Neural Engine de la familia M de Apple. No se mencionan A100, H100 ni RTX 4090, y no tiene sentido plantearlos para esta exportacion.
- Despliegue: adaptador Core ML de transcribe.cpp con soporte de GGUF solo decodificador, mas la capa de aplicacion (Glimpse-Speech detecta el encoder companero junto al archivo `-decoder.gguf`). Para CPU o GPU en Windows o Mac, el autor remite al GGUF Q8_0 completo de Handy.
- Latencia y throughput: no disponible en la informacion proporcionada.
- Restriccion operativa: en llamadas nativas solo decodificador, superar la capacidad del encoder devuelve un error; no existe un encoder ggml embebido al que recurrir.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| Glimpse-Dictation/Parakeet-TDT-0.6B-V3-coreml | 18,1 millones en el decodificador; encoder de 1,09 GB en FP16 | GGUF Q8_0 + Core ML `.mlmodelc` | Solo Apple Silicon (CPU y Neural Engine) | CC BY 4.0 | Exportacion derivada, sin encoder ggml de reserva, integracion en desarrollo, soporte solo offline TDT V3 |
| handy-computer/parakeet-tdt-0.6b-v3-gguf | No disponible | GGUF Q8_0 completo | CPU/GPU en Windows y Mac mediante ggml | No disponible en la informacion | Ruta recomendada por el autor para transcripcion en CPU/GPU; conserva el mecanismo de reserva de ggml |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6 B (denominacion del modelo) | No disponible | No disponible | CC BY 4.0 | Modelo original de NVIDIA del que derivan los dos anteriores; la model card no detalla su stack de ejecucion |

## Limitaciones y advertencias

- No es un ejecutable autonomo: son artefactos para una aplicacion que debe integrarlos mediante el adaptador Core ML de transcribe.cpp. El autor indica que la integracion como dependencia de aplicacion esta en desarrollo.
- Dependencia de plataforma: el encoder Core ML exige Apple Silicon. No hay ruta funcional para Intel ni para Windows con esta exportacion.
- Sin respaldo de encoder ggml: en llamadas nativas solo decodificador, superar los 1501 fotogramas devuelve un error en lugar de degradar a otra ruta.
- Diferencias de precision: la salida en FP16 puede diferir de la de ggml y no se reclama equivalencia de precision multilingue entre ambas.
- Funcionalidad recortada: sin streaming, sin diarizacion de hablantes y sin sesgo de palabras personalizadas. Solo cubre TDT V3 offline, no Unified ni Nemotron.
- Idiomas y sesgos: no se documentan idiomas soportados, composicion de datos ni sesgos conocidos. Cualquier afirmacion al respecto seria especulativa con la informacion disponible.
- Riesgo de alucinacion inherente al ASR: ante audio con ruido, musica, silencios largos o solapamiento de voces, el decodificador puede generar texto no presente en la señal. No se aportan cifras de WER que permitan acotar este riesgo.
- Licencia: CC BY 4.0 permite uso comercial con atribucion, pero conviene revisar los terminos del modelo base de NVIDIA y de los artefactos derivados antes de desplegar en produccion.
- Validacion externa nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no hay benchmarks publicados que permitan comparar su rendimiento real.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Glimpse-Dictation/Parakeet-TDT-0.6B-V3-coreml
- Modelo base NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- GGUF Q8_0 completo de Handy, recomendado para CPU/GPU en Windows y Mac: https://huggingface.co/handy-computer/parakeet-tdt-0.6b-v3-gguf
- Repositorio transcribe.cpp y sus scripts `convert-parakeet-gguf-to-coreml.py` y `extract-parakeet-decoder.py`: URL no disponible en la informacion proporcionada
- Proyecto Glimpse, Glimpse-Speech y Glimpse-Dictation: URL no disponible en la informacion proporcionada
