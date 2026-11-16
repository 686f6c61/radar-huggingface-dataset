# Phoonnx/vits-de_de-glados_turret-low-espeak

## Resumen

vits-de_de-glados_turret-low-espeak es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por systemofapwne y empaquetado por Phoonnx para su librería de inferencia ONNX. El modelo genera voz en alemán (de-DE) y está pensado para su uso dentro del ecosistema phoonnx, que lo ejecuta en Python y en el asistente de voz OVOS. Su nombre indica que reproduce la voz del personaje GLaDOS del videojuego Portal, en su variante "turret" y con configuración de calidad "low".

El modelo no es un LLM ni un modelo de propósito general: es un sintetizador neuronal de voz de tamaño reducido (repositorio de 0,1 GB) que convierte fonemas IPA generados por espeak-ng en audio WAV. Su relevancia radica en que permite integrar una voz sintética concreta y característica en asistentes de voz open source sin depender de servicios en la nube, con licencia MIT y pesos en formato ONNX.

La ficha se basa exclusivamente en la información publicada en Hugging Face y en la model card del autor; no se han publicado resultados de benchmarks ni detalles de entrenamiento más allá de los indicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (síntesis de voz neuronal end-to-end) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | alemán (de-DE) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak (alfabeto IPA) |
| Tamaño del repositorio | 0,1 GB |
| Librería de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz neuronal end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial durante el entrenamiento. Genera directamente la forma de onda a partir de fonemas, sin necesidad de un vocoder externo separado. El modelo aquí distribuido se ejecuta en formato ONNX mediante la librería phoonnx.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas más allá de las propias de la arquitectura VITS. El modelo deriva del release upstream `systemofapwne/piper-de-glados` (variante `de_DE/glados-turret/low`), empaquetado para phoonnx. La entrada de texto se procesa mediante el fonemizador `EspeakPhonemizer` de la librería scriptconv, que normaliza el texto y lo convierte a fonemas IPA de espeak-ng.

## Capacidades

- Síntesis de voz (text-to-speech) en alemán (de-DE) a partir de texto.
- Conversión de texto a fonemas IPA mediante espeak-ng (o el port espyak incluido en el extra `phoonnx[espeak]`).
- Generación de audio en formato WAV mediante `voice.synthesize_wav(text, wav_file)`.
- Integración como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`).
- Ejecución en navegador mediante phoonnx.js con entrada espeak o unicode.
- No soporta tool calling, razonamiento multi-paso, visión, audio de entrada ni capacidades de agente; es un modelo exclusivamente de síntesis de voz.

## Casos de uso

- Asistente de voz doméstico con OVOS: el modelo se configura como módulo TTS en `mycroft.conf` y permite que el asistente responda con la voz de GLaDOS en alemán, sin depender de servicios en la nube.
- Prototipado de interfaces conversacionales en alemán: al ser un modelo de 0,1 GB en ONNX, se puede desplegar en entornos de desarrollo y probar diálogos multi-turno con una voz característica antes de invertir en un modelo de mayor calidad.
- Videojuegos y mods: la voz "glados-turret" está pensada para contenido derivado de Portal; se puede usar para generar líneas de voz de personajes en mods o proyectos fan en alemán.
- Generación de audiolibros o avisos pregrabados en alemán: el modelo convierte frases a WAV de forma local, adecuado para contenido con texto fijo y sin requisitos de tiempo real estricto.
- Accesibilidad: lectura en voz alta de contenido en alemán en aplicaciones de escritorio o web mediante phoonnx.js, sin enviar texto a servidores externos.
- Pruebas de pipelines TTS: sirve como voz de referencia para validar la integración de phoonnx y scriptconv en un proyecto, dado su pequeño tamaño y licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del repositorio (0,1 GB), la huella de memoria es muy reducida y cabe en CPU.
- GPU recomendadas: no se especifican; el modelo está empaquetado en ONNX y puede ejecutarse en CPU sin GPU dedicada.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) e incluso en dispositivos de bajos recursos; no se requiere aceleración por hardware.
- Opciones de despliegue: phoonnx (Python), OVOS mediante `ovos-tts-plugin-phoonnx`, phoonnx.js en navegador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamaño | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-de_de-glados_turret-low-espeak | VITS | de-DE | 0,1 GB | MIT | ONNX | Hugging Face (Phoonnx) |
| systemofapwne/piper-de-glados (upstream) | VITS | de-DE | no disponible | MIT (según upstream) | Piper | Hugging Face |
| Otras voces VITS de la colección Phoonnx | VITS | varios | variable | MIT | ONNX | Hugging Face (colección VITS) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente de síntesis de voz en alemán; no procesa otros idiomas ni tareas de texto.
- La calidad es "low" según la variante upstream, por lo que la fidelidad de la voz puede ser limitada en comparación con modelos de mayor tamaño.
- Depende de espeak-ng para la fonemización; si se usa el port espyak, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- No se han publicado detalles sobre sesgos, alucinaciones (en el sentido de artefactos de audio) ni evaluación de calidad; se recomienda validar el audio en producción.
- Licencia MIT permite uso comercial, pero el modelo reproduce la voz de un personaje de Portal; el uso de la identidad del personaje puede estar sujeto a derechos de propiedad intelectual de terceros, no cubiertos por la licencia del modelo.
- El modelo está pensado para el ecosistema phoonnx/OVOS; su integración fuera de ese stack requiere adaptar la inferencia ONNX y el front-end de fonemas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-de_de-glados_turret-low-espeak
- Upstream: https://huggingface.co/systemofapwne/piper-de-glados/tree/main/de/de_DE/glados-turret/low
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
