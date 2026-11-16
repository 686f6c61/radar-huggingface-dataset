# Phoonnx/vits-en-16speakers-espeak

## Resumen

vits-en-16speakers-espeak es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su uso con la librería ONNX phoonnx. El modelo procede del repositorio agentvibes/piper-custom-voices, desarrollado por agentvibe, y ha sido adaptado para funcionar con el front-end fonético de espeak-ng. Su propósito es convertir texto en inglés en audio inteligible mediante fonemas IPA generados por espeak, lo que permite integrarlo en pipelines de TTS ligeros y ejecutables en CPU.

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un enfoque generativo condicional que combina un encoder de texto, un prior variacional y un decoder basado en flujos normales, entrenado de forma adversarial. El repositorio ocupa 0,1 GB y se distribuye en formato ONNX, lo que facilita su despliegue en entornos con recursos limitados y su integración en el asistente de voz OVOS a través del plugin ovos-tts-plugin-phoonnx.

Su relevancia radica en que ofrece una alternativa ligera, con licencia Apache 2.0 y ejecutable en CPU, para la síntesis de voz en inglés dentro de ecosistemas open source de asistentes de voz. No obstante, la información pública disponible es escasa: no se detallan el número de parámetros, la longitud de contexto ni los datos de entrenamiento, y el modelo cuenta con un uso muy reducido (22 descargas y 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de síntesis de voz que integra en un único modelo un encoder de texto, un prior variacional, un decoder autoregresivo basado en flujos normales y un discriminador adversarial entrenado conjuntamente. Este diseño permite generar audio directamente desde fonemas sin necesidad de un vocoder separado, lo que reduce la latencia y simplifica el despliegue. En este caso, la entrada no es texto en bruto sino fonemas IPA generados por espeak-ng, de modo que el modelo opera sobre la representación fonética y no sobre caracteres.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni las innovaciones técnicas específicas aplicadas durante el entrenamiento. El modelo es una adaptación de las voces personalizadas de agentvibes/piper-custom-voices, empaquetada para phoonnx, y el autor no documenta detalles del proceso de entrenamiento más allá de la arquitectura VITS y el uso de espeak para la fonemización.

## Capacidades

- Síntesis de voz en inglés a partir de texto, con salida en formato WAV.
- Fonemización mediante espeak-ng (fonemas IPA), con la alternativa del port espyak incluido en el extra `phoonnx[espeak]`.
- Soporte de 16 hablantes (según el nombre del modelo; no se detalla la lista de voces ni sus identificadores).
- Integración con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en CPU mediante ONNX Runtime, sin requerir GPU.
- No se documentan capacidades de tool calling, agentes, razonamiento multietapa ni procesamiento de audio de entrada.

## Casos de uso

- Asistentes de voz en OVOS: el modelo se integra directamente mediante el plugin `ovos-tts-plugin-phoonnx` y se selecciona en `mycroft.conf`, permitiendo respuestas habladas en inglés en asistentes domésticos autoalojados.
- Síntesis de voz en aplicaciones de escritorio: al ejecutarse en CPU con ONNX Runtime, puede incorporarse en aplicaciones Python que necesiten leer texto en voz alta sin depender de servicios en la nube.
- Generación de audiolibros o locuciones: con 16 hablantes disponibles, permite alternar voces para distintos personajes o secciones de un mismo contenido en inglés.
- Sistemas de accesibilidad: lectura de texto en pantalla para usuarios con discapacidad visual, con un coste computacional bajo y sin conexión a internet.
- Pruebas y prototipado de pipelines TTS: al ser un modelo ligero (0,1 GB) y con licencia permisiva, sirve como base para experimentar con fonemización espeak y comparar con otras voces VITS del catálogo de Phoonnx.
- Integración en dispositivos embebidos o de bajos recursos: la ejecución en CPU y el tamaño reducido permiten desplegarlo en Raspberry Pi u ordenadores de placa reducida para tareas de anuncios o interacción por voz.
- Generación de avisos y notificaciones habladas: en sistemas de monitorización o domótica que requieran mensajes de voz dinámicos en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo está pensado para ejecución en CPU mediante ONNX Runtime.
- GPU recomendadas: no se documentan; al ser un modelo VITS ligero, no requiere GPU.
- Cabe en GPU consumer: sí, aunque no es necesario; cualquier GPU con soporte ONNX Runtime podría ejecutarlo, pero el diseño está orientado a CPU.
- Opciones de despliegue: phoonnx (Python), OVOS mediante `ovos-tts-plugin-phoonnx`, y phoonnx.js para ejecución en navegador con entrada espeak o unicode.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vits-en-16speakers-espeak | VITS | en | ONNX | Apache 2.0 | Hugging Face (Phoonnx) |
| Otras voces VITS de Phoonnx | VITS | variable | ONNX | variable | Colección VITS de Phoonnx en Hugging Face |
| Modelos Piper estándar | VITS | múltiples | ONNX | variable | Repositorio Piper |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Solo soporta inglés; no se documentan otros idiomas.
- La calidad de la síntesis depende de la fonemización de espeak-ng; el uso del port espyak puede provocar errores de pronunciación en algunas palabras, según advierte el propio autor.
- No se detallan sesgos conocidos ni el proceso de entrenamiento, por lo que no es posible evaluar sesgos de género, acento o prosodia.
- Riesgo de alucinación no aplica en el sentido textual, pero sí existe riesgo de pronunciaciones incorrectas o prosodia antinatural en textos complejos.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la procedencia de los datos de entrenamiento originales de agentvibes/piper-custom-voices, no documentados en la información disponible.
- El modelo tiene un uso muy reducido (22 descargas, 0 likes), lo que limita la validación comunitaria de su calidad.
- No se documentan métricas de calidad (MOS) ni comparativas con otras voces, lo que dificulta evaluar su idoneidad para producción.

## Enlaces

- [Hugging Face: Phoonnx/vits-en-16speakers-espeak](https://huggingface.co/Phoonnx/vits-en-16speakers-espeak)
- [Repositorio upstream: agentvibes/piper-custom-voices](https://huggingface.co/agentvibes/piper-custom-voices)
- [Colección VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
- [phoonnx (GitHub)](https://github.com/TigreGotico/phoonnx)
- [scriptconv (GitHub)](https://github.com/TigreGotico/scriptconv)
- [phoonnx.js (GitHub)](https://github.com/TigreGotico/phoonnx.js)
- [Demo de phoonnx.js](https://tigregotico.pt/demo)
