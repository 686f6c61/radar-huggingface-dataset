# mlwiseyak/omnivoice-nepali-tts-v2

## Resumen

OmniVoice Nepali TTS v2 es un modelo de síntesis de voz (text-to-speech) especializado en nepalí, desarrollado por el equipo WiseYak Machine Learning (usuario `mlwiseyak`) a partir del modelo base k2-fsa/OmniVoice. Se trata de un ajuste fino de 18.000 pasos de optimización sobre 54 fragmentos (shards) de audio nativo en nepalí, equivalentes a unas 45 horas de habla limpia, con el objetivo de resolver la falta de voces sintéticas naturales y fiables en devanagari para una lengua con recursos computacionales escasos.

El modelo emplea una arquitectura de transformer de difusión con flow-matching y condicionamiento de texto basado en Qwen, sobre la que se aplicó una adaptación LoRA (r=64, α=128) que también afecta a los embeddings de tokens y a las cabezas de audio. La innovación principal es la adaptación fonológica nativa del devanagari: el modelo aprende contornos de tono, reglas de conservación del schwa y cadencia silábica directamente de los tokens de texto, sin supervisión fonética manual. Los pesos resultantes están fusionados en un checkpoint autónomo de 813.977.841 parámetros (~814 M) que no requiere PEFT ni LoRA en tiempo de ejecución.

El resultado es un sistema de TTS con clonación de voz por few-shot: basta una referencia de 3 a 10 segundos con su transcripción para reproducir una voz concreta, generando audio a 24.000 Hz. Es relevante porque cubre un idioma poco atendido por los sistemas comerciales y lo hace bajo licencia Apache 2.0, con un tamaño que cabe en GPU de consumo y con compatibilidad declarada con pipelines de `omnivoice` y vLLM-Omni.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Flow-Matching Diffusion Transformer con condicionamiento de texto basado en Qwen (arquitectura base OmniVoice) |
| Parámetros totales | 813.977.841 (~814 M), dato extraído de los pesos safetensors |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible como ventana de tokens; la inferencia se realiza por fragmentos de 70 a 140 caracteres y con referencias de audio de 3 a 10 segundos |
| Tipos de cuantización | No disponible (no se documentan variantes GGUF, INT8 ni INT4) |
| Idiomas soportados | Nepalí (`ne`) y newari (`new`); los ejemplos de inferencia usan el código `npi` |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors` ~2,03 GB + `audio_tokenizer` ~805 MB) |
| Frecuencia de muestreo de salida | 24.000 Hz |
| Tamaño del repositorio | 2,8 GB |
| Librería de referencia | `omnivoice` (pipeline `text-to-speech`) |
| Pasos de inferencia | 32 (alta calidad) o 16 (servicio rápido / tiempo real) |
| Fuerza de CFG | 2,0 |

## Arquitectura y entrenamiento

La base es OmniVoice, un transformer de difusión con flow-matching en el que el texto se codifica mediante un condicionamiento de tipo Qwen y los latentes acústicos se decodifican a audio de 24.000 Hz a través de un tokenizador de audio independiente. Sobre esa base se entrenó una LoRA de rango 64 y α=128 que no solo cubre todas las proyecciones lineales, sino también `embed_tokens`, `audio_embeddings` y `audio_heads`; esto permite que el modelo reaprenda la correspondencia entre los caracteres devanagari y su realización acústica en nepalí en lugar de depender de heurísticas de fonetización externas. Los pesos se fusionaron posteriormente en un checkpoint único, por lo que en inferencia no hay dependencias de PEFT ni de adaptadores.

El ajuste se realizó durante 18.000 pasos sobre 54 shards (~45 horas) de audio nativo en nepalí, según la model card. No se documenta el uso de RLHF ni de DPO, ni la composición exacta del dataset (proporción por hablante, género, dominio o condiciones de grabación). Tampoco se detalla el número total de tokens de audio o texto vistos durante el entrenamiento. La decodificación se controla con `num_step` (32 para alta calidad, 16 para servicio rápido), `cfg_strength` fijo en 2,0 y un parámetro `speed` para escalar la duración; el autor recomienda segmentar el texto en trozos de 70 a 140 caracteres con pausas de respiración de 300 a 350 ms entre frases.

## Capacidades

- Síntesis de voz en nepalí a partir de texto en devanagari, con salida de audio a 24.000 Hz.
- Clonación de voz few-shot: con 3 a 10 segundos de audio de referencia más su transcripción (`ref_audio` y `ref_text`), reproduce la identidad vocal de la referencia.
- Adaptación fonológica nativa: modela contornos de tono, reglas de conservación del schwa y cadencia de sílabas abiertas/cerradas directamente desde texto sin supervisión fonética manual.
- Control de calidad y velocidad: `num_step` (16 o 32), `cfg_strength` (2,0) y `speed` (1,0) como parámetros de generación.
- Normalización de texto opcional mediante `NepaliNormalizer` para expandir numerales y símbolos monetarios en devanagari antes de la síntesis.
- Segmentación controlada del texto en fragmentos de 70 a 140 caracteres con pausas configurables de 300 a 350 ms.
- Idiomas declarados: nepalí (`ne`) y newari (`new`).
- No dispone de tool calling ni function calling: no es un modelo de lenguaje.
- No dispone de razonamiento multi-paso, agentes, visión, matemáticas ni generación de código.
- No es un modelo multilingüe: el soporte se limita a las lenguas indicadas.

## Casos de uso

- Audiolibros y narración en nepalí: el modelo sintetiza párrafos largos si se segmentan en fragmentos de 70 a 140 caracteres con pausas de 300 a 350 ms, lo que produce una cadencia de lectura natural gracias a los contornos de tono aprendidos de las 45 horas de audio.
- Doblaje y localización de vídeo: con una referencia de 3 a 10 segundos de un actor de voz, se puede mantener una identidad vocal consistente a lo largo de todo un proyecto sin necesidad de reentrenamiento.
- Asistentes de voz e IVR telefónico en nepalí: configurando `num_step=16` y `speed=1.0` se obtiene el modo de servicio rápido que el autor describe para tiempo real, adecuado para respuestas habladas en centralitas o bots telefónicos.
- Accesibilidad para personas con discapacidad visual: conversión de artículos, noticias o documentos administrativos en devanagari a audio, empleando `NepaliNormalizer` para que cifras, fechas y símbolos monetarios se lean correctamente.
- Contenido educativo y e-learning: generación de locuciones para cursos, ejercicios de idioma o material didáctico en nepalí y newari donde no existen grabaciones profesionales disponibles.
- Producción de boletines y alertas informativas: síntesis automatizada de partes meteorológicos, avisos de emergencia o resúmenes de noticias, con integración en un pipeline previo de normalización de texto y troceado.
- Preservación lingüística: creación de voces sintéticas para variedades y hablantes concretos del nepalí a partir de muestras cortas, útil en proyectos de documentación de lenguas con pocos recursos.
- Integración en aplicaciones de accesibilidad web o móvil: al ser un modelo de ~814 M de parámetros con pesos en safetensors y licencia Apache 2.0, puede desplegarse en infraestructura propia sin dependencia de API externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas como MOS, CMOS, WER de inteligibilidad, similitud de hablante (SECS) ni comparaciones cuantitativas con otros sistemas de TTS en nepalí. Las únicas referencias de rendimiento son cualitativas: "18.000 pasos de optimización", "54 shards (~45 horas) de audio" y la recomendación de `num_step=16` para servicio rápido o tiempo real frente a `num_step=32` para alta calidad.

## Requisitos de hardware

- Peso de los pesos en el repositorio: ~2,03 GB para `model.safetensors` más ~805 MB del `audio_tokenizer`; en total, alrededor de 2,8 GB de ficheros.
- VRAM estimada para inferencia: en torno a 4-6 GB en bf16 (pesos + tokenizador de audio + activaciones y cachés de decodificación). El doble aproximadamente si se ejecuta en float32.
- GPU recomendadas: cualquier GPU con 8 GB o más. Cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 8 GB, RTX 4070, RTX 4080 y RTX 4090; también en A100, H100 y L40S, aunque en esos casos el modelo queda muy por debajo de su capacidad.
- Cabe en GPU de consumo: sí. El propio código de ejemplo define `cuda:0` si hay GPU disponible y cae a `cpu` con `float32` en caso contrario, de modo que también puede ejecutarse en CPU, con latencias mucho mayores.
- Opciones de despliegue: pipelines de `omnivoice` con `OmniVoice.from_pretrained` (librerías `omnivoice`, `torch`, `soundfile`, `transformers`); el autor declara compatibilidad directa con vLLM-Omni. No se documenta soporte para llama.cpp, Ollama, TGI ni GGUF, formatos que no aplican a este tipo de modelo.
- La model card marca `inference: false`, por lo que la inferencia alojada de Hugging Face no está habilitada para este repositorio.
- Latencia y throughput: no disponibles. Las únicas indicaciones son la elección entre `num_step=32` (alta calidad) y `num_step=16` (servicio rápido / tiempo real), y el uso de CFG con `cfg_strength=2.0`, que típicamente implica evaluaciones dobles del modelo por paso.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| mlwiseyak/omnivoice-nepali-tts-v2 | 813.977.841 (~814 M) | Nepalí (`ne`), newari (`new`) | Apache 2.0 | Hugging Face (pesos safetensors) | No disponible |
| k2-fsa/OmniVoice (modelo base) | No disponible | No disponible | No disponible | Hugging Face y GitHub (`k2-fsa/OmniVoice`) | No disponible |
| Otros sistemas de TTS para nepalí | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificados en la información proporcionada para establecer una comparación cuantitativa con alternativas de la misma categoría. La única relación documentada es la del modelo base k2-fsa/OmniVoice, del que este checkpoint es un ajuste fino, pero no se detallan sus parámetros, licencia ni resultados. En consecuencia, cualquier comparación numérica con otros sistemas de TTS en nepalí quedaría fuera de la evidencia disponible.

## Limitaciones y advertencias

- Sesgos de datos: el ajuste se realizó sobre 54 shards (~45 horas) de audio nepalí sin que se documente la distribución por hablante, género, edad, acento regional ni dominio. Es previsible un sesgo hacia las voces y el registro concreto del corpus, con menor calidad fuera de ese estilo.
- Riesgo de alucinación acústica: en TTS esto se manifiesta como pronunciación incorrecta, omisión o repetición de sílabas, ruido de fondo o artefactos en la prosodia, especialmente con texto fuera de distribución (préstamos del inglés, siglas, símbolos, cifras sin normalizar o construcciones poco frecuentes).
- Normalización de texto obligatoria en la práctica: la propia model card recomienda `NepaliNormalizer` para expandir numerales y símbolos monetarios en devanagari antes de la síntesis; sin ese paso previo la lectura de cifras puede ser defectuosa.
- Limitaciones de longitud: no existe una ventana de contexto de tokens documentada. El texto debe trocearse manualmente en fragmentos de 70 a 140 caracteres con pausas de 300 a 350 ms, lo que añade complejidad a cualquier integración en producción.
- Cobertura de idiomas restringida a nepalí (`ne`) y newari (`new`), con el código `npi` en los ejemplos de inferencia. No es un modelo multilingüe y su comportamiento con otros idiomas no está documentado.
- Idioma y script: el script esperado es devanagari. Textos romanizados o transliterados pueden degradar el resultado.
- Sin evaluación objetiva publicada: no hay MOS, CMOS, WER ni métricas de similitud de hablante, y el repositorio registra 0 descargas y 0 me gusta en el momento de la consulta, por lo que no cuenta con validación de la comunidad.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no cubre los derechos sobre las voces utilizadas para clonación ni sobre el corpus de entrenamiento; la responsabilidad legal recae en quien despliega el modelo.
- Clonación de voz: la capacidad de clonar con 3-10 segundos de audio habilita usos malintencionados (suplantación, deepfakes). Es imprescindible obtener consentimiento explícito de la persona cuya voz se clona y aplicar medidas de trazabilidad.
- Estado de inferencia: la model card declara `inference: false`, de modo que la inferencia alojada en Hugging Face no está disponible y el despliegue debe hacerse en infraestructura propia.
- Versionado: se trata de la versión v2 del ajuste (checkpoint fusionado de 18.000 pasos); los resultados de la v1 no son extrapolables automáticamente.
- Fecha de creación del repositorio: 18 de septiembre de 2026, según los metadatos de Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlwiseyak/omnivoice-nepali-tts-v2
- Modelo base k2-fsa/OmniVoice: https://huggingface.co/k2-fsa/OmniVoice
- Repositorio de OmniVoice: https://github.com/k2-fsa/OmniVoice
- Perfil del autor (WiseYak Machine Learning Team): https://huggingface.co/mlwiseyak
- Búsqueda web: los resultados devueltos corresponden únicamente a páginas de inicio de servicios de Google (google.cz, imágenes, traductor, Books, Scholar) sin contenido técnico relevante sobre el modelo, por lo que no se incluye ninguno de ellos como fuente.
