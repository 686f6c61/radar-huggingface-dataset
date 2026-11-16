# Phoonnx/vits-de_de-glados_turret-medium-espeak

## Resumen

`vits-de_de-glados_turret-medium-espeak` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado en formato ONNX para la librería phoonnx. El modelo original fue entrenado por el usuario systemofapwne como parte del proyecto piper-de-glados, un conjunto de voces derivadas de la voz del personaje GLaDOS del videojuego Portal, y Phoonnx lo ha reempaquetado para su uso con su librería de TTS basada en ONNX. Está pensado para sintetizar habla en alemán (de-DE) a partir de fonemas espeak en alfabeto IPA.

El modelo resuelve el problema de disponer de una voz TTS concreta y característica (la voz sintética de GLaDOS) en alemán, ejecutable localmente mediante ONNX Runtime sin necesidad de infraestructura de GPU dedicada. Su tamaño de repositorio es de 0,1 GB, lo que lo hace muy ligero y adecuado para despliegues en dispositivos de recursos limitados, asistentes domésticos o aplicaciones embebidas.

Es relevante ahora porque forma parte del ecosistema phoonnx/OVOS (Open Voice OS), que facilita la integración de voces TTS en asistentes de voz de código abierto. Su licencia MIT y su formato ONNX permiten integrarlo tanto en Python como en el navegador mediante phoonnx.js.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | aleman (de-DE) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |
| Pipeline | text-to-speech |
| Autor original | systemofapwne |
| Empaquetado por | Phoonnx |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial entrenado con aprendizaje adversarial (GAN). VITS se caracteriza por generar audio de forma directa desde fonemas sin necesidad de un vocoder separado, lo que reduce la latencia y simplifica el pipeline de inferencia.

El modelo original proviene del repositorio `systemofapwne/piper-de-glados`, concretamente de la ruta `de/de_DE/glados-turret/medium`, lo que indica que se entrenó con la configuración "medium" del ecosistema Piper. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en TTS). La innovación destacable es el empaquetado en ONNX para phoonnx, que permite ejecución multiplataforma (Python, OVOS y navegador vía phoonnx.js) con entrada de fonemas espeak o Unicode.

## Capacidades

- Síntesis de voz en alemán (de-DE) a partir de texto de entrada.
- Conversión de texto a fonemas espeak en alfabeto IPA mediante la librería scriptconv (`EspeakPhonemizer`).
- Generación de audio en formato WAV mediante `voice.synthesize_wav()`.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador mediante phoonnx.js (con entrada espeak o Unicode).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (es un modelo TTS puro).
- No dispone de modo thinking, visión ni audio de entrada.

## Casos de uso

- Asistentes de voz domésticos con OVOS: el modelo se integra como plugin TTS (`ovos-tts-plugin-phoonnx`) y permite que un asistente de voz de código abierto responda en alemán con una voz característica, ejecutándose localmente en el dispositivo sin depender de servicios en la nube.
- Aplicaciones de accesibilidad: conversión de texto a voz en alemán para lectores de pantalla o interfaces de accesibilidad, aprovechando el tamaño reducido (0,1 GB) y la licencia MIT para su inclusión en productos comerciales.
- Videojuegos y mods: al derivar de la voz de GLaDOS, es adecuado para proyectos de fan games, mods o contenido audiovisual que requieran una voz sintética similar a la del personaje, con la salvedad de las restricciones de propiedad intelectual del personaje original.
- Síntesis de voz en el navegador: mediante phoonnx.js, el modelo puede ejecutarse en el cliente para generar audio sin backend, útil en aplicaciones web de lectura de texto o demos interactivas.
- Generación de audiolibros o pódcasts automatizados en alemán: el modelo permite sintetizar texto largo por fragmentos y ensamblar el audio resultante, con la ventaja de una licencia permisiva para uso comercial.
- Prototipado de pipelines TTS: al ser un modelo ONNX ligero con API Python sencilla, sirve para validar arquitecturas de síntesis de voz en fase de investigación sin necesidad de GPU dedicada.
- Pruebas de integración en sistemas embebidos: su tamaño reducido y la ejecución mediante ONNX Runtime lo hacen candidato para dispositivos con recursos limitados, como Raspberry Pi u otros SoC.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0,1 GB) y la naturaleza de VITS en ONNX, la inferencia puede ejecutarse en CPU sin GPU dedicada.
- GPU recomendadas: no disponible; al ser un modelo ONNX ligero, no requiere GPU de gama alta. Cualquier GPU compatible con ONNX Runtime (por ejemplo, RTX 4090, A100, H100) puede ejecutarlo, pero no es necesario.
- ¿Cabe en consumer GPU? Sí, con toda probabilidad, dado su tamaño reducido; también cabe en CPU.
- Opciones de despliegue: phoonnx (Python), OVOS mediante `ovos-tts-plugin-phoonnx`, phoonnx.js (navegador), ONNX Runtime. Requiere espeak-ng instalado o el extra `phoonnx[espeak]`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| vits-de_de-glados_turret-medium-espeak | VITS | de-DE | 0,1 GB (repo) | MIT | ONNX | Voz GLaDOS, empaquetado phoonnx |
| vits-piper-en_US-glados (sherpa) | VITS | en-US | ~61 MB (modelo ONNX) | no disponible en la busqueda | ONNX | Voz GLaDOS en ingles, ecosistema sherpa |
| Otros modelos Piper de-de | VITS | de-DE | variable | MIT (habitual en Piper) | ONNX | Voces alemanas genericas del ecosistema Piper |

La comparativa directa con alternativas de la misma categoria (TTS en alemán) es limitada por la falta de datos publicados de benchmarks. El modelo se distingue por su voz característica (GLaDOS) y su integración con phoonnx/OVOS, mientras que el modelo de sherpa es la variante en inglés de la misma voz.

## Limitaciones y advertencias

- El modelo solo soporta alemán (de-DE); no es multilingüe.
- La entrada debe ser texto en alemán convertido a fonemas espeak; un texto mal normalizado o en otro idioma producirá una síntesis incorrecta.
- Si se usa el port espyak en lugar de espeak-ng, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, según advierte la model card.
- No se dispone de información sobre sesgos del dataset de entrenamiento ni sobre el riesgo de alucinación (no aplicable en el mismo sentido que en modelos de lenguaje, pero sí puede generar prosodia o pronunciación incorrecta).
- La voz deriva del personaje GLaDOS de Portal; el uso comercial de la voz podría estar sujeto a restricciones de propiedad intelectual del personaje, independientemente de la licencia MIT del modelo.
- La licencia MIT se aplica al empaquetado; la model card indica que el release upstream establece sus propios términos, por lo que conviene revisar el repositorio original de systemofapwne.
- No se han publicado benchmarks ni métricas de calidad (MOS, inteligibilidad) en la información disponible.
- El modelo tiene solo 21 descargas y 0 likes, lo que indica una validación comunitaria muy limitada.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-de_de-glados_turret-medium-espeak
- Repositorio upstream: https://huggingface.co/systemofapwne/piper-de-glados/tree/main/de/de_DE/glados-turret/medium
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- phoonnx (GitHub): https://github.com/TigreGotico/phoonnx
- scriptconv (GitHub): https://github.com/TigreGotico/scriptconv
- phoonnx.js (GitHub): https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Documentacion de VITS en sherpa: https://k2-fsa.github.io/sherpa/onnx/tts/pretrained_models/vits.html
