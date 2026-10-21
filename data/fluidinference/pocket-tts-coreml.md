# FluidInference/pocket-tts-coreml

## Resumen

PocketTTS CoreML es la conversión a CoreML de kyutai/pocket-tts, un sistema de síntesis de voz (text-to-speech) desarrollado originalmente por Kyutai y adaptado por FluidInference para ejecución local en dispositivos Apple. El objetivo es permitir inferencia TTS completamente on-device, sin llamadas a servicios externos, aprovechando el Neural Engine y las GPU integradas de iPhone, iPad y Mac.

El paquete no es un único modelo, sino una cadena de cuatro submodelos CoreML: `cond_step` (prefill de la caché KV con condicionamiento de voz y texto), `flowlm_step` (generación autorregresiva del transformer y token EOS), `flow_decoder` (desnoiseador de flow matching con 8 pasos Euler por frame) y `mimi_decoder` (códec de audio en streaming, 1920 muestras por frame). Los pesos de los cuatro suman aproximadamente 600 MB, lo que lo sitúa en la categoría de TTS ligero para cliente.

Su relevancia actual es doble: por un lado, demuestra que un TTS con clonación de voz puede empaquetarse para el runtime nativo de Apple; por otro, la licencia CC-BY-4.0 heredada de Kyutai permite uso comercial con atribución, algo poco habitual en modelos de voz con clonación. Solo se declara soporte de inglés, con cuatro voces precodificadas (`alba`, `azelma`, `cosette`, `javert`).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline TTS en cuatro submodelos CoreML: transformer autorregresivo con caché KV (`flowlm_step`), desnoiseador de flow matching (`flow_decoder`, 8 pasos Euler por frame), códec de audio Mimi en streaming (`mimi_decoder`) y módulo de condicionamiento (`cond_step`) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo TTS; no se documenta ventana de contexto textual) |
| Tipos de cuantización | No disponible (el repo distribuye artefactos `.mlmodelc` ya compilados; no se detallan precisiones por capa) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | CC-BY-4.0, heredada de kyutai/pocket-tts; requiere atribución a Kyutai |
| Formato de pesos | CoreML compilado (`.mlmodelc`), más ficheros binarios de constantes y voces en `constants_bin/` |
| Tamaño de los submodelos | `cond_step` ~200 MB, `flowlm_step` ~200 MB, `flow_decoder` ~190 MB, `mimi_decoder` ~11 MB |
| Tamaño del repositorio | 48,8 GB (incluye codificadores Mimi adicionales y paquetes de idioma) |
| Frecuencia de muestreo del códec | 1920 muestras por frame (valor declarado por el autor, sin especificar la tasa en Hz) |
| Voces incluidas | 4: `alba` (por defecto), `azelma`, `cosette`, `javert` |
| Clonación de voz | Sí, mediante los codificadores Mimi incluidos (`mimi_encoder*.mlmodelc` para inglés y `v2.1/<lang>/mimi_encoderv3.mlmodelc` por paquete de idioma) |
| Runtime / librería | CoreML (framework FluidAudio / FluidAudioTTS en Swift) |
| Descargas | 1084 |
| Fecha de creación | 2026-01-28 |
| Última actualización | 2026-10-21 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de kyutai/pocket-tts, un TTS neuronal que combina un transformer autorregresivo con un decodificador de flow matching y el códec de audio Mimi, también de Kyutai. En la conversión a CoreML, el pipeline se ha troceado en cuatro grafos independientes: `cond_step` ejecuta el prefill de la caché KV inyectando el condicionamiento de voz y de texto; `flowlm_step` produce de forma autorregresiva la salida del transformer y el token de fin de secuencia; `flow_decoder` actúa como desnoiseador de flow matching con 8 pasos Euler por frame; y `mimi_decoder` convierte los tokens latentes en audio en streaming a 1920 muestras por frame. La clonación de voz se resuelve con los codificadores Mimi incluidos, que transforman una muestra de referencia en el condicionamiento de hablante.

No se han publicado en la información disponible datos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si el modelo original utilizó RLHF, DPO u otras fases de alineación. La model card de esta conversión tampoco documenta cambios en los pesos más allá del reempaquetado a CoreML y de la relación declarada `finetune` respecto al modelo base. El detalle técnico más relevante del repositorio es el despliegue por etapas con caché KV persistente y decodificación de audio en streaming, que es lo que hace viable la síntesis de baja latencia en hardware Apple sin conexión.

## Capacidades

- Síntesis de voz a partir de texto en inglés, con salida de audio en streaming por frames de 1920 muestras.
- Cuatro voces preentrenadas listas para usar: `alba` (por defecto), `azelma`, `cosette` y `javert`.
- Clonación de voz zero-shot a partir de un fichero WAV de referencia, usando los codificadores Mimi incluidos; accesible vía `PocketTtsManager.cloneVoice()` o `fluidaudiocli tts "…" --backend pocket --clone-voice speaker.wav`.
- Inferencia completamente on-device en plataformas Apple, sin dependencia de red ni de API externa.
- Integración nativa en Swift a través del framework FluidAudio (`FluidAudioTTS`).
- Ejecución por etapas separadas (prefill, generación, desnoiseado, decodificación), lo que permite cachear el condicionamiento de una voz entre peticiones.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio de entrada a texto ni funcionamiento como agente; es un modelo exclusivamente TTS.

## Casos de uso

- Lectura de contenido en aplicaciones iOS y macOS: el modelo sintetiza texto de artículos, noticias o feeds directamente en el dispositivo, sin enviar el texto a un servidor, lo que evita exponer contenido privado y elimina la latencia de red.
- Accesibilidad y lectores de pantalla: integración en apps de apoyo a personas con discapacidad visual para leer interfaces y documentos en tiempo real, con la ventaja de que el pipeline funciona sin conexión y con un consumo de cómputo moderado (~600 MB de pesos).
- Asistentes de voz conversacionales embebidos: el modo de streaming del `mimi_decoder` permite empezar a reproducir audio mientras el transformer sigue generando, lo que reduce el tiempo hasta el primer sonido percibido por el usuario.
- Audiolibros y podcasts generados en local: las cuatro voces y la clonación permiten narrar textos largos con una voz concreta y consistente, cacheando el condicionamiento de hablante en `cond_step` para no recalcularlo en cada fragmento.
- Prototipado de productos de voz sin coste de inferencia en la nube: al ejecutarse en hardware del propio usuario, el coste marginal por síntesis es cero, lo que resulta adecuado para demos, betas y aplicaciones con volúmenes altos de frases cortas.
- Pruebas de accesibilidad y localización en CI: `fluidaudiocli` permite generar locuciones desde scripts para verificar textos de interfaz, mensajes de error o flujos de onboarding de forma automatizada en máquinas macOS.
- Personalización de voz en apps de consumo: la clonación a partir de un WAV permite ofrecer una voz corporativa o una voz de personaje sin entrenar un modelo propio, siempre que se respete la atribución de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad de síntesis (MOS, CMOS), error de pronunciación, similitud de hablante en clonación, latencia objetiva ni throughput, y tampoco se aportan comparaciones con otros sistemas TTS.

## Requisitos de hardware

- Inferencia on-device sobre CoreML; requiere hardware y sistema operativo Apple compatibles con CoreML (iPhone, iPad y Mac con Neural Engine o GPU integrada). No se especifican versiones mínimas de iOS o macOS en la información disponible.
- Huella de pesos: aproximadamente 600 MB sumando los cuatro submodelos (`cond_step` ~200 MB, `flowlm_step` ~200 MB, `flow_decoder` ~190 MB, `mimi_decoder` ~11 MB). Es una estimación derivada de los tamaños publicados; el consumo real de memoria incluye cachés KV, constantes y búferes de audio, por lo que será superior.
- No está pensado para GPU de servidor (A100, H100, RTX 4090): el formato de pesos es CoreML y no se distribuyen checkpoints en safetensors ni GGUF en este repositorio.
- Cabe en hardware de consumo Apple; no se dispone de datos sobre modelos concretos de iPhone o Mac ni sobre latencia por token de audio.
- Opciones de despliegue: framework FluidAudio / FluidAudioTTS en Swift, o la CLI `fluidaudiocli` con `--backend pocket`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo TTS en CoreML.
- Throughput y latencia: no disponibles. El diseño con 8 pasos Euler por frame y decodificación en streaming sugiere un enfoque orientado a baja latencia, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|---|
| FluidInference/pocket-tts-coreml | TTS + clonación, conversión CoreML | No disponible (~600 MB de pesos en 4 submodelos) | No disponible | Inglés | CC-BY-4.0 (atribución a Kyutai) | `.mlmodelc`, CoreML, FluidAudio |
| kyutai/pocket-tts | TTS + clonación, modelo base | No disponible | No disponible | Inglés (según este repo) | CC-BY-4.0 | No disponible en la información proporcionada |
| Otros TTS on-device (p. ej. Kokoro, Piper) | TTS ligero | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación cuantitativa con alternativas no puede completarse: la información disponible solo permite contrastar este paquete con su modelo base, del que se diferencia por el reempaquetado a CoreML y la orientación a ejecución local en Apple. Para el resto de sistemas TTS ligeros no se han proporcionado datos de parámetros, contexto, rendimiento ni licencia verificables en esta ficha.

## Limitaciones y advertencias

- Solo se declara inglés (`en`) como idioma soportado; no hay evidencia de calidad en castellano ni en otros idiomas, pese a que el repositorio incluya rutas de paquetes de idioma (`v2.1/<lang>/`).
- Es un modelo TTS, no un modelo de lenguaje: no razona, no responde preguntas, no ejecuta herramientas y no mantiene conversaciones. Cualquier uso como asistente requiere un LLM separado que genere el texto.
- Riesgo de alucinación acústica: como todo TTS neuronal, puede producir pronunciaciones incorrectas, artefactos, prosodia anómala o ruido en entradas con nombres propios, siglas, números, unidades o texto mal puntuado. No se documentan mecanismos de normalización textual en la información disponible.
- La clonación de voz tiene implicaciones éticas y legales claras: exige consentimiento explícito del hablante y puede estar sujeta a normativa sobre deepfakes y datos biométricos (por ejemplo, el AI Act europeo en materia de transparencia). La licencia CC-BY-4.0 no otorga derechos sobre las voces clonadas.
- Licencia CC-BY-4.0: permite uso comercial, pero obliga a atribuir a Kyutai y a indicar los cambios realizados. Conviene revisar también las condiciones del framework FluidAudio, que se distribuye en un repositorio separado.
- Tamaño del repositorio de 48,8 GB frente a los ~600 MB de pesos del pipeline principal: el repositorio completo incluye codificadores Mimi y paquetes adicionales, lo que complica la descarga y el empaquetado en apps. No se detalla qué artefactos son imprescindibles para cada caso de uso.
- Dependencia total de la plataforma: al estar en CoreML, no es portable a Linux ni a Android sin reconvertir el modelo. No se ofrecen checkpoints alternativos en este repositorio.
- Ausencia de benchmarks publicados: no hay métricas de MOS, similitud de hablante ni latencia que permitan validar la calidad frente a alternativas antes de integrarlo en producción.
- No se documentan mecanismos de filtrado de contenido ni marcas de agua en el audio generado, lo que traslada al integrador la responsabilidad de trazabilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FluidInference/pocket-tts-coreml
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Paper de referencia: https://arxiv.org/abs/2410.00037
- Framework FluidAudio (Swift): https://github.com/FluidInference/FluidAudio
