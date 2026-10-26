# destined/hurston-1

## Resumen

Hurston-1 es un modelo de texto a voz (TTS) de 3.300.928.512 parámetros desarrollado por Destined AI, una startup con sede en Atlanta, y publicado bajo licencia Apache 2.0 en Hugging Face con acceso restringido (gated). Se trata de un fine-tune de `maya-research/maya1` orientado específicamente a acentos del inglés que los sistemas TTS convencionales tienden a neutralizar: inglés del sur de Estados Unidos y distintas familias de inglés africano (afro-inglés). Es el primer modelo de la familia ClarityVoice de Destined AI.

Su rasgo diferencial es el control de la voz mediante una descripción en lenguaje natural: el usuario indica género, edad, acento y estilo de habla, y el modelo sintetiza el audio correspondiente. Además, incorpora un modo telefónico de banda estrecha a 8 kHz, pensado para integración en telefonía y sistemas de IVR, frente al modo de estudio de alta calidad.

El modelo es relevante ahora porque cubre un hueco concreto en el ecosistema abierto: TTS con acentos regionales y afro-inglés, con pesos abiertos y licencia permisiva, en un momento en que la mayoría de alternativas propietarias homogeneizan estos acentos. Sus cifras de adopción todavía son bajas (25 descargas y 17 likes en el momento de la consulta), por lo que se trata de un lanzamiento reciente y con validación comunitaria limitada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (fine-tune de `maya-research/maya1`; la información proporcionada no detalla la arquitectura interna) |
| Parametros totales | 3.300.928.512 (≈3,3 mil millones) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo distribuye safetensors; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | Inglés (`en`), con acentos de inglés del sur de EE. UU. y familias de inglés africano |
| Licencia | Apache 2.0 (acceso restringido: requiere aceptar condiciones en Hugging Face) |
| Formato de pesos | safetensors (6,6 GB de repositorio) |

## Arquitectura y entrenamiento

Hurston-1 es un fine-tune del modelo `maya-research/maya1`, del que hereda la arquitectura base; la información disponible no especifica si se trata de un transformer autorregresivo sobre tokens de audio, de un modelo difusión o de un híbrido, ni detalla el tokenizador acústico o el codificador de voz empleado. El condicionamiento se realiza mediante descripciones de voz en lenguaje natural (género, edad, acento y estilo de habla), lo que sugiere una arquitectura condicionada por texto libre además del texto a sintetizar.

El modelo soporta dos regímenes de salida: alta calidad de estudio y banda estrecha telefónica a 8 kHz. La información pública no incluye el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF/DPO o ajuste por preferencias humanas sobre la naturalidad del audio. El repositorio de GitHub del proyecto incluye código de inferencia, ejemplos y notas sobre el modo telefónico, junto con clips de demostración sintéticos.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto plano en inglés.
- Control de la voz mediante descripción en lenguaje natural: género, edad, acento y estilo de habla.
- Cobertura de acentos de inglés del sur de Estados Unidos (southern American English).
- Cobertura de varias familias de acentos afro-ingleses (African English).
- Modo de alta calidad (formato de estudio) y modo telefónico de banda estrecha a 8 kHz (narrowband).
- Generación de audio pensada para telefonía, IVR y locuciones de baja tasa de bits.
- Soporte de tool calling / function calling: no aplica (modelo TTS, no conversacional).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no; únicamente inglés.
- Modo "thinking", visión o audio de entrada: no disponible / no aplica.

## Casos de uso

- Atención al cliente telefónica: el modo narrowband a 8 kHz permite generar avisos, mensajes de espera y respuestas pregrabadas dinámicas con acentos del sur de EE. UU. o afro-inglés, ajustándose al perfil del cliente y evitando la voz genérica de los TTS comerciales.
- Sistemas IVR y centralitas: las locuciones de menús y confirmaciones se pueden sintetizar en el mismo códec de banda estrecha que usa la telefonía, reduciendo el reacondicionamiento de audio en la cadena de VoIP.
- Audiolibros y pódcasts con acento local: la descripción de voz por lenguaje natural permite fijar un perfil de narrador concreto (edad, género, acento sureño) y mantenerlo consistente a lo largo de un texto largo.
- Doblaje y localización de contenido: adaptar guiones al inglés sureño o afro-inglés para series, anuncios o documentales dirigidos a esas comunidades, con control explícito del estilo de habla.
- Accesibilidad y lectura en voz alta: convertir artículos, documentación o correo electrónico en audio para usuarios que prefieren una voz con su propio acento regional, algo que los lectores de pantalla estándar rara vez ofrecen.
- Investigación en fonética y sociolingüística: generar estímulos sintéticos controlados variando acento, edad y estilo para experimentos de percepción del habla, con la ventaja de que los pesos son abiertos y auditables.
- Prototipado de asistentes de voz: al ser Apache 2.0 y con código de inferencia publicado, permite integrar un TTS acentuado en un producto propio sin depender de una API de terceros ni de cuotas por carácter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de métricas objetivas de calidad de voz (MOS, CMOS, WER de ASR sobre el audio sintetizado, similitud de hablante) ni comparaciones cuantitativas con otros sistemas TTS en las fuentes consultadas.

## Requisitos de hardware

- Pesos: 6,6 GB en safetensors para 3.300.928.512 parámetros, lo que corresponde a precisión de 16 bits (bf16/fp16) con overhead de repositorio.
- VRAM estimada para inferencia en fp16/bf16: aproximadamente 8-10 GB solo para pesos, más el overhead de activaciones y del decodificador de audio; una estimación conservadora sitúa el total en 10-14 GB (estimación propia a partir del recuento de parámetros, no publicada por el autor).
- VRAM estimada en cuantización de 8 bits: en torno a 4-6 GB; en 4 bits, en torno a 2,5-4 GB (estimaciones; el repositorio no distribuye versiones cuantizadas).
- GPU recomendadas: A100 o H100 para despliegues con concurrencia y baja latencia; RTX 4090, RTX 3090 o A10G para instancias individuales en fp16.
- GPU de consumo: sí cabe en tarjetas de 16 GB o más en fp16 (RTX 4080, 4090, 3090, 4060 Ti 16 GB). En 12 GB requeriría cuantización, no documentada oficialmente.
- Opciones de despliegue: el repositorio de GitHub `Destined-AI/hurston-1` incluye el código de inferencia de referencia; no se confirma soporte para vLLM, TGI, llama.cpp, Ollama ni formatos GGUF.
- Latencia y throughput: no disponibles. Al ser un modelo de 3,3 B parámetros para síntesis de audio, la latencia dependerá de la longitud del texto y del decodificador acústico, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas / acentos | Licencia | Acceso | Notas |
|---|---|---|---|---|---|---|
| Hurston-1 | 3,3 B | No disponible | Inglés (sur de EE. UU., afro-inglés) | Apache 2.0 | Gated en HF | Modo telefonía 8 kHz y modo estudio |
| Maya1 (`maya-research/maya1`) | No disponible en la información | No disponible | No disponible | No disponible | No disponible | Modelo base del que deriva Hurston-1 |
| Otros TTS abiertos (p. ej. Kokoro, XTTS-v2) | No disponible | No disponible | No disponible | No disponible | No disponible | No se han proporcionado datos para comparar |

No se dispone de datos publicados que permitan una comparación cuantitativa con otras familias de TTS abiertas o propietarias en calidad de audio, latencia o cobertura de acentos.

## Limitaciones y advertencias

- Solo soporta inglés; no es multilingüe y no se documenta soporte de code-switching.
- La cobertura de acentos se limita al inglés del sur de EE. UU. y a familias de inglés africano; otros acentos del inglés no están garantizados.
- Acceso restringido: los pesos están en modo gated y requieren aceptar condiciones en Hugging Face antes de la descarga, lo que puede afectar a pipelines automatizados.
- Riesgo de alucinación en sentido TTS: pronunciación incorrecta de nombres propios, siglas, números y términos técnicos; no hay datos publicados sobre tasas de error de pronunciación.
- Riesgo de artefactos acústicos y prosodia inconsistente, especialmente en el modo de banda estrecha a 8 kHz, donde el ancho de banda limita la inteligibilidad de fricativas y la naturalidad.
- Sesgos potenciales: la calidad puede ser desigual entre los perfiles de voz descritos (edad, género), y el modelo puede reproducir estereotipos prosódicos asociados a los acentos que modela.
- Uso dual: un TTS con acentos específicos y pesos abiertos facilita la creación de audio sintético convincente; es responsabilidad del desplegador aplicar marcas de agua, consentimiento de voz y controles anti-suplantación.
- Licencia Apache 2.0 permisiva para uso comercial, pero sujeta a las condiciones adicionales del acceso gated del repositorio; conviene revisarlas antes de un despliegue en producción.
- Validación comunitaria escasa: 25 descargas y 17 likes en el momento de la consulta, sin benchmarks publicados ni auditorías independientes conocidas.
- La información disponible no detalla arquitectura interna, datos de entrenamiento ni cuantizaciones soportadas, lo que dificulta reproducir el entrenamiento o auditar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/destined/hurston-1
- Repositorio GitHub (código de inferencia, ejemplos, notas de modo telefónico y demos): https://github.com/Destined-AI/hurston-1
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/destined/hurston-1
- Noticia de lanzamiento en Kompozy: https://kompozy.io/news/hurston-1-open-source-accented-english-tts
- Artículo en Stackfutures: https://stackfutures.com/blog/hurston-1-tts-southern-american-afro-english-narrowband-phone-oct-2026/
- Modelo base Maya1: https://huggingface.co/maya-research/maya1
