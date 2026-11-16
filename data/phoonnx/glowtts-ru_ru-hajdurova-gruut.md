# Phoonnx/glowtts-ru_ru-hajdurova-gruut

## Resumen

Glow-TTS-ru_ru-hajdurova-gruut es un modelo de síntesis de voz (text-to-speech) en ruso empaquetado en formato ONNX para la librería phoonnx. El modelo original procede del proyecto Larynx de Rhasspy, una iniciativa de código abierto orientada a TTS ligero y ejecutable en local, y ha sido reempaquetado por Phoonnx para su uso con su librería de inferencia ONNX y con el ecosistema OVOS (Open Voice OS). La voz concreta se identifica como "hajdurova" y está orientada exclusivamente al ruso (ru-RU).

Arquitectónicamente se trata de un modelo Glow-TTS, un sistema de síntesis basado en normalizing flows que genera espectrogramas mel a partir de fonemas, acoplado a un vocoder HiFi-GAN (variante multi-VCTK small) que convierte esos espectrogramas en audio. El front-end textual utiliza fonemas gruut en alfabeto IPA, lo que implica que el texto de entrada debe pasar por un fonemizador antes de la inferencia. El repositorio ocupa aproximadamente 0,1 GB, lo que lo sitúa en la categoría de modelos compactos aptos para despliegue en CPU y dispositivos de recursos limitados.

Su relevancia actual reside en su carácter práctico: es una voz rusa lista para usar en asistentes de voz locales, sistemas domóticos y aplicaciones de accesibilidad sin dependencia de servicios en la nube. No obstante, la información pública es muy escasa: el autor no documenta métricas de calidad, número de parámetros ni detalles del entrenamiento, y la licencia figura como "other" sin texto asociado, lo que exige verificar el release original de Larynx antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (normalizing flow) + vocoder HiFi-GAN multi-VCTK small |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS por frase; no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos ONNX; el repo no documenta variantes cuantizadas) |
| Idiomas soportados | ruso (ru-RU) |
| Licencia | other (sin texto de licencia registrado; verificar upstream) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

Glow-TTS es un modelo generativo basado en normalizing flows que modela la distribución de espectrogramas mel condicionada a una secuencia de fonemas. A diferencia de los sistemas autorregresivos como Tacotron 2, Glow-TTS emplea un mecanismo de alineamiento monotónico (MAS, Monotonic Alignment Search) que permite generar el espectrograma completo en paralelo, lo que se traduce en una inferencia más rápida y estable. El modelo produce espectrogramas mel que posteriormente son convertidos a forma de onda por un vocoder HiFi-GAN, en este caso la variante multi-VCTK small, descargada automáticamente por phoonnx junto con la voz.

El front-end textual delega en scriptconv con el fonemizador GruutPhonemizer, que normaliza el texto y lo convierte a fonemas IPA antes de alimentar el modelo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de RLHF o ajuste fino adicional. El modelo original proviene del release v1.0 de Rhasspy Larynx, un proyecto que entrenó voces multilingües sobre corpus públicos, pero los detalles concretos de esta voz (hajdurova) no están documentados en la información disponible.

## Capacidades

- Síntesis de voz en ruso (ru-RU) a partir de texto plano, generando audio WAV mediante la API `synthesize_wav` de phoonnx.
- Conversión texto-a-fonema mediante el fonemizador Gruut en alfabeto IPA, con normalización textual previa a cargo de scriptconv.
- Generación de espectrogramas mel en paralelo (no autorregresiva) gracias al alineamiento monotónico de Glow-TTS.
- Integración con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Ejecución local en CPU mediante ONNX Runtime, sin dependencia de GPU ni de servicios externos.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio de entrada ni modo thinking: es exclusivamente un modelo TTS.
- No dispone de capacidades multilingües: está limitado al ruso.

## Casos de uso

- Asistentes de voz locales en ruso: el modelo puede integrarse en OVOS o en cualquier aplicación Python mediante phoonnx para sintetizar respuestas habladas sin enviar texto a la nube, lo que resulta adecuado por su tamaño reducido (0,1 GB) y su inferencia en CPU.
- Domótica y altavoces inteligentes: al ejecutarse sobre ONNX Runtime, puede desplegarse en dispositivos de bajos recursos (Raspberry Pi, mini-PC) para anuncios de estado, alarmas y notificaciones en ruso.
- Accesibilidad y lectores de pantalla: permite convertir texto de aplicaciones o documentos a voz en ruso para usuarios con discapacidad visual, con latencia baja gracias a la generación paralela de espectrogramas.
- Sistemas de megafonía y avisos automatizados: útil en entornos como transporte público o comercios donde se requieren anuncios pregrabados o dinámicos en ruso sin coste por llamada a API.
- Prototipado de interfaces conversacionales: sirve para validar flujos de diálogo en ruso antes de invertir en voces comerciales de mayor calidad, aprovechando su licencia abierta y su instalación sencilla vía pip.
- Investigación en TTS y evaluación de vocoders: al estar empaquetado en ONNX con un vocoder HiFi-GAN separado, facilita experimentos de sustitución de vocoder o de análisis de espectrogramas sin reentrenar el modelo acústico.
- Generación de audiolibros o contenido narrado por lotes: la API de síntesis permite procesar frases de forma secuencial y escribir directamente a ficheros WAV, adecuada para pipelines offline en ruso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de ~0,1 GB, es probable que quepa en memoria RAM/VRAM muy reducida, pero el autor no publica cifras.
- GPU recomendadas: no disponible; el modelo está diseñado para ejecución en CPU mediante ONNX Runtime.
- Compatibilidad con GPU de consumo: previsiblemente sí en cualquier GPU con unos pocos GB de memoria, aunque no hay datos oficiales que lo confirmen.
- Opciones de despliegue: phoonnx (Python), ONNX Runtime, plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS de este tipo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| glowtts-ru_ru-hajdurova-gruut (este) | no disponible | no aplica | ru | other | ONNX | Hugging Face (22 descargas) |
| Otras voces Glow-TTS de Rhasspy Larynx | no disponible | no aplica | multiples | other (segun release) | ONNX / tarball | GitHub Rhasspy, coleccion Phoonnx |
| Piper (sucesor de Larynx) | no disponible | no aplica | multiples | MIT (segun proyecto) | ONNX | GitHub, Hugging Face |
| Modelos TTS comerciales en ruso | no disponible | no aplica | ru y otros | propietaria | API/SDK | Servicios cloud |

La comparación cuantitativa de calidad (MOS, WER de síntesis) no está disponible en la información proporcionada. Piper se cita como alternativa del mismo linaje técnico (sucesor de Larynx), pero sus cifras concretas no se han verificado en esta ficha.

## Limitaciones y advertencias

- Licencia "other" sin texto registrado: es imprescindible revisar el release original de Rhasspy Larynx (v1.0) antes de cualquier uso comercial o redistribución.
- Ausencia total de benchmarks publicados: no hay métricas de calidad (MOS, inteligibilidad) que permitan evaluar su idoneidad frente a alternativas.
- Modelo monolingüe: solo sintetiza ruso; el texto en otros idiomas o con caracteres no rusos puede producir fonemas incorrectos o fallos.
- Dependencia del front-end gruut: la calidad de la síntesis depende de la fonemización correcta; palabras fuera de vocabulario, siglas o números pueden requerir normalización adicional.
- Riesgo de artefactos y prosodia plana: los modelos Glow-TTS de Larynx suelen presentar entonación menos natural que sistemas neuronales de mayor tamaño, aunque no hay datos concretos para esta voz.
- Sesgos de voz: al estar entrenado sobre un corpus concreto (voz "hajdurova"), el timbre y el acento quedan fijados; no hay control de hablante ni de emoción documentado.
- Fecha de creación futura en los metadatos (2026): conviene verificar la integridad y procedencia del repositorio antes de confiar en él en producción.
- Sin garantías de mantenimiento: el repositorio tiene 0 likes y 22 descargas, lo que sugiere escasa comunidad y soporte limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-ru_ru-hajdurova-gruut
- Release original de Larynx: https://github.com/rhasspy/larynx/releases/download/v1.0/ru-ru_hajdurova-glow_tts.tar.gz
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Colección Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Vocoder HiFi-GAN multi-VCTK small: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
