# aga7on/AuK-ru

## Resumen

AuK-ru es una adaptación al ruso mediante LoRA de la modelo AuK de Tencent, una arquitectura de síntesis de voz instructiva (instruction TTS) que combina un modelo de lenguaje multimodal Qwen2.5-Omni-3B con un decodificador de audio basado en Flux2Edit y un vocoder BigVGANFlowVAE. El autor, aga7on, publica los adaptadores resultantes de una cadena de entrenamiento por etapas (de s0 a s7) que va desde una fase de transliteración hasta el ajuste de emociones, pasando por un punto canónico de seguridad denominado s5@4500.

El modelo resuelve la ausencia de soporte nativo de ruso en la AuK original: mediante LoRA se transfiere la capacidad de TTS instructiva y clonación de voz al idioma ruso sin reentrenar la base completa. El repositorio ocupa 6,1 GB y contiene cuatro ficheros safetensors correspondientes a los puntos s5@4500 y s7 en tres checkpoints, además del `config.yaml` y un `sha256.json` con las sumas de verificación.

Es relevante para desarrolladores que necesiten TTS en ruso con control por instrucciones y clonación de voz bajo licencia MIT, aunque conviene tener en cuenta que el proyecto tiene cero descargas y cero likes en el momento de la consulta, que los adaptadores de emociones (s7) están declarados como "en proceso" y que los conjuntos de datos y las referencias de audio del entrenamiento son privados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cadena multimodal: Qwen2.5-Omni-3B (componente linguistico) + Flux2Edit (edicion/decodificacion) + vocoder BigVGANFlowVAE; adaptacion rusa mediante LoRA |
| Parametros totales | No disponible (el componente Qwen2.5-Omni es de 3B; el total de la pila AuK no se especifica en la informacion) |
| Parametros activos | No aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo distribuye ficheros safetensors y un `config.yaml` |
| Idiomas soportados | Ruso (ru) |
| Licencia | MIT (licencia original de Tencent, conservada) |
| Formato de pesos | safetensors (`auk_s5_4500.safetensors`, `auk_s7_5000.safetensors`, `auk_s7_5750.safetensors`, `auk_s7_6750.safetensors`) + `config.yaml` |

Otros datos del repositorio: tamano de 6,1 GB, pipeline declarado `text-to-speech`, etiquetas `audio`, `speech`, `voice-cloning`, `instruction-tts`, `flux2edit`, `qwen-omni`, `region:us`. Creado y actualizado el 19 de septiembre de 2026. Descargas: 0. Likes: 0.

## Arquitectura y entrenamiento

La base es la modelo AuK de Tencent, descrita como una modelo instructiva de TTS y audio que integra tres piezas: Qwen2.5-Omni-3B, Flux2Edit y BigVGANFlowVAE. AuK-ru no modifica esa arquitectura: aporta adaptadores LoRA entrenados sobre ella y los entrega ya fusionados con su base correspondiente, según indica el autor ("cada adaptador слит со своей базой").

La cadena de entrenamiento documentada es la siguiente: s0 (transliteración) → s1 (habla rusa, con rango 32 y alfa 64) → s2 (piloto A/B) → s3 → s4 → s5@4500 (punto canónico) → s7 (emociones). El autor publica el checkpoint s5@4500 como "punto canónico de seguridad" construido sobre la base s4, y tres checkpoints de la fase s7 (a 5000, 5750 y 6750 pasos) centrados en emoción. No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; el autor indica explícitamente que los datasets y las referencias de audio son privados y no se incluyen en el repositorio público.

## Capacidades

- Síntesis de voz en ruso (text-to-speech) con control mediante instrucciones en lenguaje natural (instruction TTS).
- Clonación de voz a partir de referencias de audio: el autor reporta una similitud (sim) de 0,763 y un WER de clonación de 0,069 en el checkpoint s5@4500.
- Modulación emocional mediante los adaptadores de la fase s7 (publicados como "emoción temprana", "media" y "final"), con un control de puerta emocional sobre el conjunto RESD del 99,3 % (150/150) según el autor.
- Preservación del timbre sin acento chino perceptible: el autor reporta 0 clones con "acento chino" sobre 325 muestras evaluadas.
- Validación DSP: 6/6 pruebas superadas según la model card.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (la modelo está orientada a generación de audio, no a tareas de agente).
- Capacidades multilingües: no; el modelo está adaptado únicamente al ruso.
- Capacidades especiales adicionales (visión, audio de entrada distinto de la referencia de voz, thinking mode): no disponibles en la información proporcionada.

## Casos de uso

- Doblaje y localización al ruso de vídeo y pódcast: el modelo permite clonar la voz del locutor original a partir de una referencia y generar la pista en ruso, manteniendo el timbre (sim 0,763 reportada) y sin rastro de acento chino (0/325 clones).
- Audiolibros y contenido narrado largo: al ser un TTS instructivo con clonación, se puede fijar una voz consistente para todo un libro y ajustar el tono por capítulo usando los checkpoints s7 de emoción.
- Asistentes de voz y atención al cliente en ruso: la pila puede generar respuestas habladas con una voz de marca concreta, siempre que se valide la latencia del pipeline completo (no publicada).
- Accesibilidad: lectura en voz alta de documentos y webs para usuarios rusoparlantes con voces personalizadas, incluidas voces clonadas de familiares cuando exista consentimiento.
- Preservación de voz para personas con pérdida del habla: clonación de una voz de referencia grabada previamente para su uso en comunicación asistida, sujeto a consentimiento explícito.
- Generación de datos sintéticos de voz en ruso: creación de corpus de audio etiquetado para entrenar otros sistemas (reconocimiento de voz, diarización) con control sobre el timbre y la emoción.
- Locución publicitaria y contenidos de marca: producción de múltiples variantes de un mismo guion con distintos matices emocionales usando los checkpoints de la fase s7.
- Sistemas IVR y telefonía: integración de voces rusas sintéticas en flujos de respuesta de voz interactiva, previa verificación de latencia en tiempo real.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (checkpoint s5@4500, salvo donde se indique):

| Metrica | Resultado | Conjunto / herramienta |
|---|---|---|
| TTS WER | 0,081 | GigaAM |
| First-ok | 0,75 | Metrica del autor (definicion no detallada en la model card) |
| Similitud de clonacion (sim) | 0,763 | No especificado |
| WER de clonacion | 0,069 | No especificado |
| Pruebas DSP | 6/6 PASS | No especificado |
| Clones con "acento chino" | 0/325 | No especificado |
| Control de puerta emocional (s7, en proceso) | 99,3 % (150/150) | RESD, con puerta emocional Aniemore WavLM |

No se han publicado en la informacion disponible resultados de benchmarks comparativos con otras modelos (MMLU, HumanEval, GSM8K u otros) ni cifras de rendimiento frente a alternativas de TTS en ruso.

## Requisitos de hardware

- VRAM estimada: no publicada por el autor. Estimacion orientativa a partir de los componentes declarados: el Qwen2.5-Omni-3B en precision de 16 bits ocupa aproximadamente 6-7 GB solo en pesos, y el repositorio completo suma 6,1 GB, por lo que la pila de inferencia completa (Qwen2.5-Omni-3B + Flux2Edit + BigVGANFlowVAE) necesitaria previsiblemente entre 10 y 16 GB de VRAM en fp16. Esta cifra es una estimacion, no un dato confirmado.
- GPU recomendadas: no disponibles. Por el rango de memoria estimado, serian razonables GPU de 24 GB o mas (A100, H100, L40S, RTX 3090, RTX 4090) para el pipeline completo en fp16.
- Compatibilidad con GPU de consumo: probablemente viable en RTX 3090 y RTX 4090 (24 GB) segun la estimacion anterior; en tarjetas de 8-12 GB el pipeline completo podria no caber sin cuantizacion, y el autor no publica recetas de cuantizacion.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El autor indica que la inferencia debe realizarse "como en el upstream AuK", sustituyendo los pesos base por los ficheros `*.safetensors`, y remite a los scripts de github.com/aga7on/AuK-ru.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en ruso | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AuK-ru (aga7on/AuK-ru) | No disponible (base con Qwen2.5-Omni-3B) | No disponible | WER 0,081 (GigaAM), sim de clonacion 0,763 | MIT | HuggingFace, 0 descargas; adaptadores safetensors |
| Tencent AuK (modelo base) | No disponible | No disponible | No disponible para ruso en la informacion proporcionada | MIT | GitHub Tencent-Hunyuan/AuK y pesos originales |
| Otras alternativas de TTS en ruso | No disponible | No disponible | No disponible | No disponible | No disponible |

La busqueda web realizada no devolvio informacion tecnica relevante sobre AuK-ru ni sobre modelos comparables: los resultados obtenidos fueron enlaces a perfiles y videos de redes sociales sin relacion con el modelo. Por tanto, no es posible establecer una comparativa cuantitativa fiable con otras alternativas de la misma categoria.

## Limitaciones y advertencias

- Transparencia del entrenamiento: los datasets y las referencias de audio son privados y no se incluyen en el repositorio, por lo que no es posible auditar la composicion de los datos ni los sesgos potenciales (genero, acento, edad, procedencia geografica de los hablantes).
- Estado de desarrollo: los adaptadores de emociones (s7) se declaran "en proceso" en la propia model card; solo s5@4500 se presenta como punto canonico de seguridad.
- Idiomas: el modelo esta adaptado exclusivamente al ruso; no se contempla soporte multilingue.
- Riesgo de artefactos y alucinacion acustica: al ser una modelo generativa de audio, puede producir prosodia incorrecta, palabras mal pronunciadas, ruido o inestabilidad en textos largos o con nombres propios y terminologia especializada. No se publican tasas de fallo mas alla del WER reportado.
- Ausencia de validacion externa: las metricas de calidad proceden unicamente del autor, sin replicacion independiente, y las definiciones de algunas metricas (por ejemplo "first-ok") no se detallan.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de comunidad, soporte y casos de uso verificados.
- Licencia: el modelo se distribuye bajo MIT, lo que permite uso comercial, pero la licencia no cubre los derechos sobre las voces clonadas; el uso de voces de terceros exige consentimiento explicito y puede estar regulado por normativa de proteccion de datos y derechos de imagen.
- Riesgo de suplantacion: la capacidad de clonacion de voz facilita usos fraudulentos (deepfakes de audio, fraude telefonico). No se menciona en la informacion disponible ningun mecanismo de marca de agua, deteccion o limitacion tecnica del uso malintencionado.
- Dependencia del upstream: el procedimiento de inferencia depende del repositorio de Tencent; cambios en AuK pueden romper la compatibilidad de los adaptadores.
- Rendimiento y latencia sin documentar: no hay cifras publicadas de tiempo real, throughput ni consumo de memoria, lo que dificulta planificar despliegues en produccion.
- Sin garantias: no se documentan pruebas de robustez frente a entradas adversarias, texto muy largo o caracteres no estandar del ruso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aga7on/AuK-ru
- Repositorio del autor con scripts y linaje de entrenamiento: https://github.com/aga7on/AuK-ru
- Modelo original de Tencent: https://github.com/Tencent-Hunyuan/AuK
- Resultados de la busqueda web: no se encontraron enlaces relevantes sobre el modelo; los resultados devueltos fueron perfiles y videos de redes sociales (TikTok, Facebook, Linktree) sin relacion con AuK-ru.
