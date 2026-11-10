# RedHotAnton/ttskit-coreml

## Resumen

TTSKit es un framework de generacion de voz (text-to-speech) orientado a la inferencia local en dispositivos con Apple Silicon. El repositorio `RedHotAnton/ttskit-coreml` contiene los pesos convertidos a Core ML de un modelo de la familia Qwen3-TTS, empaquetados para su uso a traves de la libreria WhisperKit. El autor, RedHotAnton, publica este artefacto como parte de un proyecto mas amplio cuyo enlace oficial aun no esta disponible segun la propia model card.

El modelo subyacente pertenece a la familia Qwen3-TTS de Alibaba Qwen, aunque la model card no detalla la variante concreta ni el numero de parametros. El repositorio ocupa 3,7 GB, un tamano compatible con un modelo de sintesis de voz de escala media convertido a formatos Core ML (que tipicamente incluyen varias precisiones y componentes separados). La relevancia actual reside en la posibilidad de ejecutar sintesis de voz neural completamente en local sobre Macs y dispositivos Apple, sin depender de servicios en la nube.

La informacion publicada es muy escasa: no se indican licencia, idiomas soportados, pipeline ni resultados de evaluacion. Esta ficha recoge exclusivamente lo que puede inferirse de los metadatos y la model card, marcando como "no disponible" todo aquello que el autor no ha documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de sintesis de voz de la familia Qwen3-TTS, convertido a Core ML) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato Core ML; el repo de 3,7 GB sugiere multiples variantes de precision, sin confirmar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Core ML (repo etiquetado `coreml`; libreria `whisperkit`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo. Por las etiquetas (`qwen3-tts`, `qwen-tts`, `tts`) se trata de un modelo de sintesis de voz de la familia Qwen3-TTS, pero la model card no especifica el tipo de decodificador acustico, el vocoder ni la arquitectura del codificador de texto. Tampoco se documentan los datos de entrenamiento, el numero de tokens, la composicion del corpus ni si hubo etapas de ajuste fino con preferencias humanas.

La innovacion tecnica destacable es el propio pipeline de conversion a Core ML para ejecucion en Apple Silicon, integrado con WhisperKit. Esto implica que los pesos han sido optimizados para el runtime Neural Engine / GPU de Apple, lo que condiciona el rendimiento y las opciones de despliegue, pero el autor no publica detalles del proceso de conversion ni de las metricas de fidelidad respecto al modelo original.

## Capacidades

- Sintesis de voz a partir de texto (text-to-speech), segun las etiquetas del repositorio.
- Ejecucion en dispositivo (on-device) sobre Apple Silicon, sin necesidad de conexion a servicios externos.
- Integracion con WhisperKit como libreria de inferencia.
- Soporte multilingue: no disponible (no se documentan idiomas).
- Clonacion de voz, control de estilo o emocion: no disponible.
- Tool calling, function calling o capacidades de agente: no aplicables a un modelo TTS y no documentadas.
- Capacidades de vision o audio de entrada: no disponibles.

## Casos de uso

- Sintesis de voz local en aplicaciones macOS e iOS: el modelo puede integrarse mediante WhisperKit para generar audio a partir de texto sin enviar datos a la nube, lo que resulta adecuado para aplicaciones con requisitos de privacidad.
- Lectura de articulos y documentos en voz alta: util para lectores de pantalla o herramientas de accesibilidad que necesitan generar voz de forma rapida y offline en equipos Apple.
- Generacion de narraciones para contenido audiovisual: creadores que trabajan en Mac pueden producir locuciones preliminares sin depender de APIs externas, siempre que la licencia lo permita (no confirmada).
- Asistentes de voz embebidos en aplicaciones de escritorio: al ejecutarse en el propio dispositivo, evita la latencia de red y permite respuestas habladas en tiempo casi real.
- Prototipado de interfaces conversacionales: desarrolladores que necesitan un componente TTS para probar flujos de voz antes de decidir un proveedor definitivo.
- Automatizacion de avisos y notificaciones habladas: integrable en scripts o herramientas de productividad en macOS para convertir texto en audio de forma programatica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/espacio en disco: el repositorio ocupa 3,7 GB, por lo que se necesita al menos ese espacio libre; el consumo en memoria durante la inferencia no esta documentado.
- GPU recomendadas: exclusivamente hardware Apple Silicon (M1, M2, M3, M4 y posteriores), dado el formato Core ML; no es compatible con GPUs NVIDIA o AMD de forma nativa.
- Cabe en consumer hardware: si, en equipos Mac con Apple Silicon; el modelo concreto de chip y la RAM necesaria no estan documentados.
- Opciones de despliegue: WhisperKit (libreria declarada) y runtime Core ML de Apple; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones del modelo base que permitan una comparacion rigurosa con alternativas como otros modelos TTS de Qwen, Piper, Coqui TTS o los sistemas de voz de Apple.

## Limitaciones y advertencias

- Informacion muy incompleta: no se documentan licencia, idiomas, parametros ni rendimiento, lo que impide evaluar su idoneidad para produccion.
- Licencia no disponible: no puede confirmarse el uso comercial; debe consultarse al autor antes de cualquier despliegue.
- Dependencia de hardware Apple: el formato Core ML limita su uso a dispositivos Apple Silicon.
- Riesgo de artefactos en la sintesis: sin benchmarks ni muestras publicadas, no es posible valorar la calidad, naturalidad ni estabilidad de la voz generada.
- Sesgos: no disponibles; al no conocerse los datos de entrenamiento, no puede evaluarse el sesgo linguistico o de hablante.
- Model card minima: el propio autor indica que el enlace al proyecto "llegara pronto", por lo que la documentacion puede cambiar sin aviso.
- Repositorio sin descargas ni likes: no hay evidencia de uso por parte de la comunidad que permita validar su funcionamiento.

## Enlaces

- Hugging Face: https://huggingface.co/RedHotAnton/ttskit-coreml
- Proyecto TTSKit: enlace no disponible (la model card indica "Link coming soon")
- WhisperKit: no disponible en la informacion proporcionada
- Paper o blog del modelo base Qwen3-TTS: no disponible en la informacion proporcionada
