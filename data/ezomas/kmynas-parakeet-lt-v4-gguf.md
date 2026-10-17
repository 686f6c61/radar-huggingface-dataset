# Ezomas/kmynas-parakeet-lt-v4-gguf

## Resumen

Ezomas/kmynas-parakeet-lt-v4-gguf es una conversión al formato GGUF del modelo kristijonas/kmynas-parakeet-lt-v4, un ajuste fino para reconocimiento de voz en lituano construido sobre NVIDIA Parakeet-TDT-0.6B-v3. Lo publica el usuario Ezomas y su función es empaquetar los pesos originales en .nemo como un único fichero GGUF cuantizado en Q8_0 (740 MB), pensado específicamente para el runtime transcribe.cpp y su paquete de Python transcribe-cpp, que el proyecto BibleLive utiliza para transcripción en directo de lituano sobre CPUs convencionales.

El modelo resuelve un problema de despliegue, no de modelado: los pesos originales en formato NeMo no se ejecutan directamente en entornos sin GPU ni en pilas ligeras, mientras que esta conversión permite inferencia en CPU con un binario pequeño. Los pesos no se han reentrenado ni modificado; la única intervención técnica es la conversión y la cuantización, además de un perfil de variante local para el vocabulario de 8196 tokens de este modelo (el perfil estándar de Parakeet v3 espera 8192).

Con 627.057.290 parámetros totales, se trata de un modelo ASR especializado en un único idioma (lituano) y con licencia CC BY 4.0, la misma que la del modelo base de NVIDIA y la de los corpus de entrenamiento citados. Su relevancia actual es acotada pero clara: cubre el hueco de ASR lituano ejecutable en hardware modesto dentro del ecosistema transcribe.cpp, una alternativa que llama.cpp u Ollama no cubren porque no implementan esta arquitectura.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de reconocimiento de voz Parakeet-TDT (transducer token-and-duration, según la denominación del modelo base); detalles del encoder no disponibles en la información proporcionada |
| Parámetros totales | 627.057.290 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible; es un modelo ASR y no gestiona contexto de texto. No se especifica duración máxima de audio |
| Tipos de cuantización | Q8_0 (publicada); Q4_K_M evaluada y descartada por pérdida de calidad; conversión F32 usada como referencia interna |
| Idiomas soportados | Lituano (lt) únicamente |
| Licencia | CC BY 4.0 |
| Formato de pesos | GGUF (fichero kmynas-v4-Q8_0.gguf, 740 MB), convertido desde kmynas-v4-last.nemo |
| Tarea / pipeline | automatic-speech-recognition |
| Modelo base | kristijonas/kmynas-parakeet-lt-v4, a su vez fine-tune de nvidia/parakeet-tdt-0.6b-v3 |
| Entrada de audio | 16 kHz, mono, float32 |
| Vocabulario | 8196 tokens (perfil de variante local; el perfil estándar de Parakeet v3 espera 8192) |
| Tamaño del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base de NVIDIA, identificado en el nombre como Parakeet-TDT-0.6B-v3: un modelo de reconocimiento de voz de tipo transducer con decodificación token-and-duration (TDT), de aproximadamente 0,6 mil millones de parámetros. La información disponible no detalla la configuración del encoder, el número de capas ni la composición exacta del dataset, por lo que esos datos deben consultarse en la model card del modelo original.

Esta publicación concreta no entrena nada: parte de kmynas-v4-last.nemo y aplica el script scripts/convert-parakeet.py de transcribe.cpp con un perfil de variante local adaptado al vocabulario de 8196 tokens, y después cuantiza a Q8_0 con la herramienta quantize del mismo proyecto. El ajuste fino original en lituano se apoya, según la atribución incluida, en el corpus de voz LIEPA-3 de la Universidad de Vilnius y en materiales de raštija.lt, ambos bajo CC BY 4.0. No se documentan en esta ficha fases de RLHF, DPO ni datos de preferencias, algo esperable en un modelo ASR.

La innovación relevante aquí no es arquitectónica sino de empaquetado y validación: el autor comprobó la cuantización con una prueba interna sobre 13 servicios religiosos en lituano, comparando las referencias bíblicas detectadas por la conversión F32 y por Q8_0. Q8_0 reprodujo las mismas referencias que F32, mientras que Q4_K_M perdió alrededor de un 5 % y por eso no se publicó.

## Capacidades

- Transcripción de voz a texto en lituano a partir de audio de 16 kHz mono en float32.
- Reconocimiento de nombres propios y referencias bíblicas en predicación y discursos religiosos, dominio en el que fue validado.
- Ejecución en CPU mediante transcribe.cpp, con backends seleccionables ("auto" o "cpu") y control del número de hilos.
- Integración con Python a través del paquete transcribe-cpp, con API de sesión y salida de texto.
- Uso en transcripción en directo o por lotes, según el caso de uso declarado por el autor (BibleLive).
- No soporta tool calling, function calling, razonamiento multi-paso ni generación de texto libre: es un modelo ASR puro.
- No soporta visión, audio como entrada multimodal ni modo "thinking".
- Multilingüismo: no. Solo lituano.

## Casos de uso

- Transcripción en directo de servicios religiosos: el modelo está validado sobre 13 servicios en lituano y reproduce referencias bíblicas, por lo que encaja en la emisión de subtítulos o texto en vivo de BibleLive sobre CPU.
- Subtitulado de vídeo y pódcast en lituano: al ser un fichero de 740 MB ejecutable en CPU, se puede procesar una cola de episodios en servidores sin GPU.
- Archivado y búsqueda de audio en lituano: transcripción por lotes de grabaciones históricas o de congregación para indexar contenido textual y hacerlo recuperable.
- Actas y notas de reuniones en lituano: transcripción de reuniones internas en entornos de oficina donde no hay GPU disponible y se prioriza coste bajo.
- Transcripción en el dispositivo o en el borde: el tamaño reducido permite desplegarlo en mini-PC o portátiles para dictado y accesibilidad en lituano.
- Evaluación de modelos ASR lituanos: sirve como referencia cuantizada frente a la conversión F32 y frente al modelo original en .nemo en pruebas comparativas internas.
- Prototipado rápido en Python: la API de transcribe-cpp permite integrar la transcripción en un script de pocas líneas sin infraestructura de servido compleja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (WER, MMLU, HumanEval, GSM8K u otros) en la información disponible. La única evaluación documentada es interna y cualitativa, sobre 13 servicios religiosos en lituano y centrada en la detección de referencias bíblicas:

| Prueba | Resultado |
|---|---|
| Conversión F32 (referencia) | Encuentra las referencias bíblicas esperadas en los 13 servicios |
| Q8_0 (publicada) | Mismas referencias bíblicas que la conversión F32 |
| Q4_K_M (no publicada) | Pérdida de aproximadamente un 5 %; descartada |
| WER sobre conjunto público | No disponible |

No se proporcionan cifras de latencia, RTF ni throughput, ni comparaciones numéricas con otros sistemas ASR.

## Requisitos de hardware

- VRAM estimada: alrededor de 1 GB para el fichero Q8_0 de 740 MB más activaciones y buffers de audio; no se han publicado mediciones exactas.
- GPU recomendadas: cualquier GPU consumer con 2 GB o más de memoria podría alojar los pesos, aunque el objetivo declarado del proyecto es la ejecución en CPU. No hay datos de rendimiento en A100, H100 o RTX 4090.
- CPU: es el escenario principal. El autor indica uso en CPUs convencionales para transcripción en directo; no se especifican requisitos de núcleos ni cifras de velocidad.
- Despliegue: transcribe.cpp (binario) y el paquete de Python transcribe-cpp, con backend "auto" o "cpu" y session(n_threads=N).
- No se documenta soporte en vLLM, TGI, llama.cpp ni Ollama; el GGUF está generado para transcribe.cpp y no debe asumirse compatible con otras herramientas que leen GGUF.
- Latencia y throughput: no disponibles. Únicamente se afirma la viabilidad de transcripción en directo en CPU, sin valores de referencia ni tamaño de lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato | Licencia | Observaciones |
|---|---|---|---|---|---|
| Ezomas/kmynas-parakeet-lt-v4-gguf | 627.057.290 | Lituano | GGUF Q8_0 (740 MB) | CC BY 4.0 | Conversión para transcribe.cpp; ejecución en CPU; validación interna en 13 servicios |
| kristijonas/kmynas-parakeet-lt-v4 | Los mismos pesos (~627 M) | Lituano | .nemo | CC BY 4.0 | Modelo original del ajuste fino; requiere pila NeMo |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6 B (según denominación) | Multilingüe (no se detalla la lista) | No disponible en la información | CC BY 4.0 | Modelo base de NVIDIA; sin ajuste específico a lituano |
| Alternativas ASR multilingües tipo Whisper | No disponible en la información | No disponible en la información | No disponible en la información | No disponible en la información | No se aportan datos comparativos en la documentación consultada |

## Limitaciones y advertencias

- Cobertura lingüística restringida: solo lituano. No debe emplearse con audio en otros idiomas.
- Es un modelo ASR: no genera texto libre, no razona, no usa herramientas y no mantiene contexto conversacional.
- El benchmark interno se limita a 13 servicios religiosos y a la detección de referencias bíblicas; no hay WER publicado ni evaluación en dominios como conversación espontánea, telefonía, acentos regionales o audio con ruido.
- La cuantización Q8_0 se validó cualitativamente contra F32 en ese dominio estrecho; el comportamiento fuera de él no está medido.
- El perfil de vocabulario es una variante local de 8196 tokens frente a los 8192 del perfil estándar de Parakeet v3; usar herramientas o perfiles estándar puede producir errores de conversión o de carga.
- Riesgo de alucinación inherente a los modelos transducer en segmentos de silencio o ruido: pueden emitir texto plausible no presente en el audio. No se documenta mitigación específica.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación por parte de la comunidad.
- Licencia CC BY 4.0: permite uso comercial, pero exige atribución al autor de la conversión, al modelo original, al modelo base de NVIDIA y a los datos de entrenamiento citados.
- No se garantiza compatibilidad con llama.cpp, Ollama u otros runners GGUF; el formato está pensado para transcribe.cpp.
- La fecha de creación del repositorio (2026-10-17) y la ausencia de métricas públicas aconsejan tratarlo como artefacto reciente y poco auditado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Ezomas/kmynas-parakeet-lt-v4-gguf
- Modelo original en lituano: https://huggingface.co/kristijonas/kmynas-parakeet-lt-v4
- Modelo base de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Corpus LIEPA-3 (Universidad de Vilnius): no disponible en la información proporcionada
- raštija.lt (fuente de datos de entrenamiento citada): no disponible enlace directo en la información proporcionada
- Paquete de Python transcribe-cpp: incluido en el repositorio transcribe.cpp; no se proporciona enlace independiente
