# Arabic-STT/qwen3-asr-1.7b-ar-run20

## Resumen

Arabic-STT/qwen3-asr-1.7b-ar-run20 es un ajuste fino (fine-tune) del modelo de reconocimiento automático de voz Qwen3-ASR-1.7B, publicado por el usuario Arabic-STT en HuggingFace. El modelo hereda la arquitectura de la familia Qwen3-ASR, desarrollada por el equipo Qwen de Alibaba Cloud, que combina un codificador de audio con el decodificador de un modelo de lenguaje de la familia Qwen3-Omni. El resultado es un sistema de ASR de tipo "speech-to-text" que acepta audio como entrada y produce transcripción, con detección de idioma integrada.

El nombre del repositorio y las etiquetas indican que el ajuste está orientado a árabe (ar) e inglés (en). El modelo base Qwen3-ASR-1.7B cubre 52 idiomas y dialectos, pero el alcance real de este fine-tune concreto no está documentado en la información disponible: la model card no incluye descripción del proceso de entrenamiento, del corpus utilizado ni del dominio objetivo (los repositorios hermanos de la misma serie, como run9, mencionan llamadas telefónicas y audio muy ruidoso, pero no hay confirmación de que run20 persiga el mismo objetivo).

Su relevancia actual es doble: por un lado, el ASR en árabe con cobertura de dialectos sigue siendo un punto débil de los modelos abiertos; por otro, Qwen3-ASR-1.7B se presenta en su repositorio oficial como estado del arte entre los modelos ASR de código abierto. El repositorio es de acceso restringido (gated), requiere aceptar condiciones en HuggingFace y no declara licencia en los metadatos, lo que condiciona su uso en producción. El tamaño real de los pesos es de 2.038.052.480 parámetros según safetensors, superior a los 1.7B que sugiere el nombre, probablemente por la inclusión del codificador de audio y el proyector multimodal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal audio-texto (codificador de audio + decodificador de lenguaje), derivada de Qwen3-Omni; detalles internos del codificador no disponibles |
| Parámetros totales | 2.038.052.480 (según safetensors; la nomenclatura del modelo indica 1.7B) |
| Parámetros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | No disponible (modelo de audio; no se especifica duración máxima de audio ni ventana de contexto) |
| Tipos de cuantización | No disponible; el repositorio solo contiene safetensors, sin variantes GGUF/AWQ/GPTQ publicadas |
| Idiomas soportados | Árabe (ar) e inglés (en) declarados en las etiquetas; el modelo base Qwen3-ASR-1.7B cubre 52 idiomas y dialectos con detección de idioma |
| Licencia | No disponible en los metadatos; acceso restringido sujeto a condiciones en HuggingFace |
| Formato de pesos | Safetensors, biblioteca transformers |
| Tarea (pipeline) | automatic-speech-recognition |
| Modelo base | Qwen/Qwen3-ASR-1.7B |
| Tamaño del repositorio | 16.3 GB |
| Acceso | Restringido (gated): requiere aceptar condiciones |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-10-24 / 2026-10-24 |

## Arquitectura y entrenamiento

La familia Qwen3-ASR, según su repositorio en GitHub, está formada por dos variantes, Qwen3-ASR-1.7B y Qwen3-ASR-0.6B, que soportan identificación de idioma y reconocimiento de voz en 52 idiomas y dialectos. Ambos modelos aprovechan datos de entrenamiento de voz a gran escala y la capacidad de comprensión de audio de su modelo fundacional, Qwen3-Omni. Es decir, la arquitectura es la de un modelo multimodal audio-texto: un codificador que transforma la señal de audio en representaciones y un decodificador de lenguaje que genera la transcripción (y, en su caso, la etiqueta de idioma). No se dispone de información sobre el número de capas, la dimensión oculta, el tamaño del codificador de audio ni la estrategia exacta de atención.

Respecto a este fine-tune concreto (run20), la información disponible no incluye datos de entrenamiento: no se especifica el número de horas de audio, la composición del corpus, si hubo etapas de alineación o ajuste con preferencias, ni qué hiperparámetros se emplearon. Tampoco se documenta si se congelaron partes del modelo base. La model card de un repositorio hermano de la misma serie (run9) describe un entrenamiento en dos etapas orientado a llamadas telefónicas y audio muy ruidoso en árabe dialectal e inglés; es plausible que la serie siga una metodología similar, pero no hay confirmación para run20, por lo que cualquier afirmación al respecto sería especulativa.

## Capacidades

- Transcripción de voz a texto (ASR) en árabe e inglés, con salida de texto plano.
- Identificación automática de idioma, capacidad heredada del modelo base Qwen3-ASR.
- Procesamiento de audio con ruido y de habla dialectal árabe: esperado por el propósito declarado de la serie, aunque no verificado para run20 en la documentación disponible.
- Reconocimiento de voz y música/canción: el modelo base lo soporta según el repositorio oficial; la transferencia a este fine-tune no está documentada.
- Predicción de marcas temporales (timestamps): anunciada para la familia Qwen3-ASR en GitHub; no confirmada para este checkpoint.
- Integración con el ecosistema transformers y con la API de inferencia (tag `endpoints_compatible`).
- No es un modelo de generación de texto general, razonamiento, código ni matemáticas: su ámbito es exclusivamente el audio.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- Transcripción de llamadas de atención al cliente en árabe e inglés: un modelo de 2.04B parámetros es desplegable en una sola GPU y permite procesar lotes de grabaciones para generar transcripciones, auditar la calidad del servicio y alimentar analítica de motivos de llamada. La serie de fine-tunes de la que forma parte está orientada explícitamente a audio telefónico en repositorios hermanos, lo que sugiere un dominio de aplicación afín.
- Subtitulado automático de contenido audiovisual: el modelo puede convertir pistas de audio en subtítulos en árabe e inglés dentro de un pipeline de postproducción, con la ventaja de un tamaño reducido frente a modelos ASR de mayor número de parámetros.
- Actas y notas de reuniones bilingües árabe-inglés: al cubrir ambos idiomas con detección de idioma integrada, resulta adecuado para organizaciones con equipos mixtos que necesitan transcripciones sin segmentar manualmente por lengua.
- Dictado y documentación clínica o administrativa: la transcripción de voz a texto en un modelo pequeño permite desplegarlo en infraestructura on-premise con requisitos moderados de VRAM, requisito habitual en entornos sanitarios con datos sensibles.
- Indexación y búsqueda sobre archivos de audio: transcribir un archivo de grabaciones y almacenar el texto en un motor de búsqueda o en una base vectorial para recuperación posterior (RAG sobre audio), usando el modelo como etapa de ingesta.
- Automatización de voz en centros de contacto: integración de la transcripción como primer eslabón de un pipeline (ASR → NLU → respuesta), donde un modelo de 1.7B-2B reduce el coste por hora de audio frente a alternativas de mayor tamaño.
- Cumplimiento normativo y auditoría: transcripción masiva de grabaciones para revisión de cumplimiento, con la advertencia de que el acceso restringido y la licencia no declarada exigen revisión legal previa.
- Investigación en ASR dialectal árabe: servir como punto de partida o línea base para experimentos de reconocimiento de dialectos, dado que deriva de un modelo base con soporte declarado de 52 idiomas y dialectos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este checkpoint (Arabic-STT/qwen3-asr-1.7b-ar-run20). La model card no incluye métricas de tasa de error de palabras (WER) ni comparaciones con otros sistemas.

Como referencia cualitativa, el repositorio oficial QwenLM/Qwen3-ASR afirma que la versión de 1.7B alcanza rendimiento de estado del arte entre los modelos ASR de código abierto, pero en la información disponible no se incluyen las cifras concretas que respaldan esa afirmación, por lo que no se reproducen aquí.

## Requisitos de hardware

- Pesos en precisión de 16 bits: aproximadamente 4,1 GB para los 2.038.052.480 parámetros. El repositorio ocupa 16,3 GB, lo que sugiere que puede contener múltiples ficheros (por ejemplo, checkpoints o copias en distintos formatos), no un único peso en fp16.
- VRAM estimada para inferencia en fp16/bf16: en torno a 6-10 GB incluyendo activaciones y caché de audio, dependiendo de la duración del audio y del tamaño de lote. Cifra estimada por el tamaño del modelo, no medida ni publicada.
- Cuantización: no hay variantes GGUF, AWQ ni GPTQ publicadas en el repositorio, por lo que las estimaciones en 8 y 4 bits (aproximadamente 2,5-3,5 GB y 1,5-2,5 GB respectivamente) requerirían cuantizar el modelo por cuenta propia.
- GPU consumer: cabe con holgura en tarjetas de 12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) en fp16, y en tarjetas de 8 GB si se aplica cuantización de 8 bits. En GPUs de 6 GB o menos sería necesario cuantizar a 4 bits o descargar parte del modelo a CPU.
- GPU de centro de datos: A100, H100, L40S o A10 son sobredimensionadas para un solo flujo, pero adecuadas para servir muchos flujos concurrentes con lotes grandes.
- Opciones de despliegue: transformers (formato nativo del repositorio). El tag `endpoints_compatible` indica compatibilidad con la inferencia alojada de HuggingFace. El soporte en vLLM, TGI, llama.cpp u Ollama no está confirmado en la información disponible; llama.cpp y Ollama requerirían una conversión a GGUF que no se ha publicado.
- Latencia y throughput: no disponibles. Al no haber datos publicados, la estimación debe hacerse por medición directa; como referencia de orden de magnitud, un modelo de 2B en una RTX 4090 suele operar muy por encima del tiempo real para audio de 16 kHz, pero esta cifra no está verificada para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto / audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arabic-STT/qwen3-asr-1.7b-ar-run20 | 2.038.052.480 | ar, en (base: 52 idiomas y dialectos) | No disponible | No disponible; acceso restringido | HuggingFace, gated |
| Qwen/Qwen3-ASR-1.7B (modelo base) | ~1,7B según nomenclatura | 52 idiomas y dialectos | No disponible en la información proporcionada | No disponible en la información proporcionada | HuggingFace |
| Qwen3-ASR-0.6B | 0,6B según nomenclatura | 52 idiomas y dialectos | No disponible en la información proporcionada | No disponible en la información proporcionada | HuggingFace |
| OpenAI Whisper large-v3 (referencia externa no verificada en la búsqueda) | ~1,55B | ~99 idiomas | Ventanas de 30 s | Apache 2.0 según la publicación de OpenAI | Pesos abiertos |

La comparación cuantitativa de rendimiento (WER por idioma) no está disponible: ni este checkpoint ni el modelo base publican cifras en la información consultada. La ventaja diferencial de run20 frente al modelo base sería la especialización en árabe, que no puede cuantificarse sin métricas.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card no describe datos de entrenamiento, dominio objetivo, métricas ni procedimiento de evaluación. No es posible verificar qué mejora respecto al modelo base.
- Licencia no declarada y acceso restringido: el uso comercial es jurídicamente incierto hasta que se revise la licencia del modelo base Qwen3-ASR-1.7B y las condiciones del repositorio. No debe desplegarse en producción sin una revisión legal explícita.
- Riesgo de alucinación en la transcripción: como todo modelo ASR basado en decodificador de lenguaje, puede generar texto plausible en segmentos de silencio, ruido o solapamiento de hablantes; requiere detección de voz (VAD) y validación posterior.
- Sesgos: no hay información sobre la distribución del corpus de entrenamiento. Es esperable un sesgo hacia la variedad de árabe y el registro presentes en los datos, con posible degradación en dialectos poco representados, habla infantil, acentos no nativos o audio de baja calidad. No verificado.
- Cobertura lingüística limitada en este fine-tune: las etiquetas solo declaran árabe e inglés, aunque el modelo base soporte 52 idiomas. El rendimiento en otras lenguas es impredecible.
- Sin marcas temporales confirmadas: aunque la familia Qwen3-ASR anuncia predicción de timestamps, no está documentado para este checkpoint; el subtitulado fino requeriría verificación empírica.
- Sin cuantizaciones oficiales: la ausencia de GGUF limita el despliegue en CPU y en GPUs de gama baja sin trabajo adicional de conversión.
- Repositorio de 16,3 GB frente a ~4,1 GB de pesos en fp16: conviene inspeccionar los ficheros antes de descargar, ya que puede contener checkpoints intermedios o duplicados.
- Cero descargas y cero likes: no existe evidencia de uso en la comunidad ni validación externa.
- El identificador "run20" sugiere un experimento dentro de una serie de iteraciones; no hay garantía de que sea la versión final ni la mejor de la serie.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Arabic-STT/qwen3-asr-1.7b-ar-run20
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Repositorio oficial de la familia Qwen3-ASR: https://github.com/QwenLM/Qwen3-ASR
- Repositorio hermano de la misma serie (run9): https://huggingface.co/Arabic-STT/qwen3-asr-1.7b-ar-run9
- Réplica/derivado del modelo base: https://huggingface.co/VocaborSilentii/Qwen3-ASR-1.7B
- Entrada de otro miembro de la serie (run3) en un registro de modelos: https://free2aitools.com/model/arabic-stt/qwen3-asr-1.7b-ar-run3
- Implementación de terceros para ASR con Qwen3-ASR: https://github.com/hangry-labs/Qwen3-ASR-STT
