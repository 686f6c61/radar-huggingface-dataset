# characteragent/phonon-31m-en-coreml

## Resumen

Phonon 31m English Core ML es la exportación a formato Core ML de Phonon 31m English, un modelo de síntesis de voz (text-to-speech) desarrollado por Gradium. Este repositorio concreto, publicado por el usuario characteragent, es un espejo sin modificaciones del artefacto oficial `phonon-31m-en-coreml.zip` distribuido con el runtime xn-ptts v0.6.0 de Gradium, y constituye la descarga que utiliza el servicio de voz en dispositivo de Phonon dentro de la aplicación LoreBlendr. El modelo base es `gradium/phonon-31m-en`, liberado bajo licencia Apache 2.0.

Con 31 millones de parámetros, Phonon es un modelo deliberadamente compacto, pensado para inferencia local en dispositivos Apple mediante Core ML, sin depender de servidores externos ni de aceleradores en la nube. Incluye 38 voces procedentes del repositorio `gradium/phonon-voices` y está especializado exclusivamente en inglés. Su relevancia actual radica en la creciente demanda de TTS privado y de baja latencia en aplicaciones de escritorio y móviles, donde el coste por inferencia y la confidencialidad del texto sintetizado son factores críticos.

Este repositorio no aporta pesos nuevos ni cambios respecto al original: es un mirror de conveniencia con trazabilidad criptográfica (SHA-256 del zip original) y un `bundle.json` que enumera los ficheros que descarga el runtime. Para evaluar el modelo en sí, la referencia canónica sigue siendo el repositorio de Gradium.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 31 millones (deducido del nombre del modelo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (exportacion Core ML; el zip ocupa 137.300.815 bytes) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (paquete `.mlpackage`/`.mlmodelc` dentro de `phonon-31m-en-coreml.zip`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo (tipo de red, mecanismo de atencion, representacion acustica ni vocoder asociado). El nombre y el tamano (31M parametros) indican un modelo compacto de sintesis de voz, y la unica pista tecnica es su empaquetado como artefacto Core ML, lo que implica que el grafo ha sido convertido para ejecutarse sobre el framework de Apple (Core ML, potencialmente con aceleracion en Neural Engine o GPU segun el dispositivo).

Tampoco se especifican en la informacion proporcionada el volumen de datos de entrenamiento, la composicion del corpus, ni si hubo etapas de ajuste fino con preferencias humanas. El modelo base fue construido a partir del commit `8c64b55ec301728e2d1695bfea87a08a267d0c2d` de `gradium/phonon-31m-en` y las voces del commit `da6c9ec0d47be8df5c87c730a3aa97187f3229c3` de `gradium/phonon-voices`. La innovacion destacable de este repositorio es la trazabilidad: se documenta el SHA-256 del zip original y se incluye un `bundle.json` con la lista exacta de ficheros que el runtime descarga, lo que facilita la verificacion de integridad en despliegues.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto en ingles.
- 38 voces distintas, procedentes del repositorio `gradium/phonon-voices`.
- Inferencia en dispositivo mediante Core ML, sin necesidad de conexion a un servidor.
- Integracion con el runtime `xn-ptts` de Gradium, que gestiona la descarga y ejecucion del bundle.
- Uso previsto en el servicio de voz de la aplicacion LoreBlendr.
- No se documentan capacidades de clonacion de voz, control de emocion, multilingue, tool calling ni razonamiento; el alcance es exclusivamente TTS en ingles.

## Casos de uso

- Lectura por voz en aplicaciones de escritorio para macOS: el bundle Core ML permite sintetizar texto localmente dentro de una app nativa, evitando enviar contenido del usuario a servicios externos.
- Accesibilidad: convertir articulos, documentos o notificaciones en audio para usuarios con discapacidad visual, con la ventaja de que el texto no sale del dispositivo.
- Asistentes conversacionales offline: integrar el modelo en un asistente local que necesite respuestas habladas sin latencia de red ni coste por peticion.
- Prototipado de interfaces de voz: dado su tamano reducido (31M parametros) y su licencia Apache 2.0, sirve para experimentar con TTS en productos propios antes de escalar a un modelo mayor.
- Narracion de contenido en aplicaciones de lectura o entretenimiento, seleccionando entre las 38 voces disponibles para adaptar el tono al contenido.
- Generacion de avisos y mensajes hablados en dispositivos Apple dentro de flujos automatizados, donde el runtime `xn-ptts` gestiona la descarga y ejecucion del bundle de forma reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Por el tamano del artefacto (aproximadamente 0,1 GB en el repositorio, con un zip de 137.300.815 bytes) se trata de un modelo muy ligero, pero no se documentan requisitos de memoria en ejecucion.
- GPU recomendadas: no disponible. El modelo esta empaquetado para Core ML, por lo que el hardware objetivo son dispositivos Apple (Mac con Apple Silicon o Intel, iPhone, iPad) con aceleracion via Core ML, no GPU NVIDIA.
- Compatibilidad con GPU de consumo: no aplica en el sentido habitual; el despliegue previsto es en hardware Apple mediante Core ML.
- Opciones de despliegue: runtime `xn-ptts` de Gradium (https://github.com/gradium-ai/xn-ptts), que descarga los ficheros listados en `bundle.json`. No se documentan otras vias de despliegue (vLLM, llama.cpp, Ollama o TGI no son aplicables a un modelo TTS Core ML).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de TTS del mismo tamano, por lo que no es posible establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Solo soporta ingles; no se documenta cobertura de otros idiomas.
- No se detallan sesgos del modelo ni caracteristicas del corpus de entrenamiento, lo que impide evaluar su comportamiento en acentos, generos o variedades dialectales concretas.
- Riesgo de alucinacion acustica: como todo modelo TTS, puede producir pronunciaciones incorrectas o artefactos en textos con nombres propios, siglas o terminos tecnicos; no se documenta su robustez en estos casos.
- Restricciones de uso responsable: el autor cita a Gradium y prohibe usar Phonon para suplantar a una persona real, enganar a los oyentes sobre quien habla o clonar una voz sin consentimiento del hablante. Se recomienda indicar a los oyentes cuando el audio es sintetico.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero este repositorio es un mirror sin cambios; cualquier modificacion debe respetar los terminos de la licencia y la atribucion a Gradium.
- Dependencia del runtime `xn-ptts` y del ecosistema Core ML: no es portable a entornos Linux o Windows sin una conversion adicional no documentada.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; la referencia canonica y mantenida es el repositorio de Gradium.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/characteragent/phonon-31m-en-coreml
- Modelo base: https://huggingface.co/gradium/phonon-31m-en
- Voces: https://huggingface.co/gradium/phonon-voices
- Runtime xn-ptts: https://github.com/gradium-ai/xn-ptts
- Sitio de Gradium: https://gradium.ai
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
