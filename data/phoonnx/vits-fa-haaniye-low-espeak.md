# Phoonnx/vits-fa-haaniye-low-espeak

## Resumen

`vits-fa-haaniye-low-espeak` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Mycroft AI para su proyecto Mimic3 y empaquetado por Phoonnx en formato ONNX para su biblioteca de TTS. El modelo sintetiza voz en persa (`fa`) a partir de fonemas generados por espeak-ng en alfabeto IPA, y está pensado para su uso dentro del ecosistema phoonnx y OVOS (Open Voice OS).

La relevancia de este modelo es acotada: se trata de una voz concreta dentro de un catálogo mayor de voces VITS empaquetadas para inferencia ONNX, no de un modelo fundacional. Su interés práctico reside en que permite TTS en persa con un runtime ligero basado en ONNX, sin dependencia de frameworks de deep learning pesados, y con integración directa como plugin de OVOS.

El repositorio ocupa aproximadamente 0,1 GB y no registra descargas ni interacciones en Hugging Face en el momento de la consulta. La información pública disponible se limita a la model card del autor y al repositorio upstream de Mycroft AI; no se han publicado detalles sobre el dataset de entrenamiento, el número de parámetros ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | persa (`fa`) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX (empaquetado para la libreria phoonnx) |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de síntesis de voz que combina un encoder de texto, un prior y un decoder acoplados mediante inferencia variacional, junto con un discriminador adversarial entrenado de forma conjunta para mejorar la calidad acústica. El modelo genera formas de onda directamente a partir de fonemas, sin etapa vocoder separada, lo que simplifica el pipeline de inferencia.

La entrada del modelo son fonemas en alfabeto IPA generados por espeak-ng, procesados por la librería `scriptconv` de Phoonnx mediante `EspeakPhonemizer`. El modelo original proviene de la voz `haaniye_low` del repositorio `MycroftAI/mimic3-voices`, y Phoonnx lo ha reempaquetado en ONNX. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o fine-tuning posterior. El sufijo `low` en el nombre sugiere una variante de calidad o tamaño reducido dentro del catálogo de Mimic3, pero el autor no detalla en qué consiste esa designación.

## Capacidades

- Síntesis de voz a partir de texto en persa (`fa`), con salida en formato WAV.
- Fonemización de entrada mediante espeak-ng en alfabeto IPA.
- Integración como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`).
- Ejecución mediante runtime ONNX a través de la librería phoonnx en Python.
- Ejecución en navegador mediante phoonnx.js, con demo disponible.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es exclusivamente un modelo TTS.
- No dispone de modo thinking, visión ni audio de entrada.

## Casos de uso

- Asistentes de voz en persa sobre OVOS: el modelo se configura como módulo TTS en `mycroft.conf` y permite respuestas habladas en un asistente doméstico autoalojado, con inferencia ONNX ligera.
- Lectura de contenido en aplicaciones de accesibilidad: conversión de texto a voz para usuarios con discapacidad visual que requieran salida en persa, integrada vía phoonnx en Python.
- Síntesis en el navegador: mediante phoonnx.js, permite generar voz en persa del lado del cliente sin enviar texto a servidores externos, útil en aplicaciones web con requisitos de privacidad.
- Generación de audiolibros o podcasts en persa: el modelo puede sintetizar frases de forma secuencial y ensamblar los WAV resultantes en un pipeline de postproducción.
- Prototipado de interfaces conversacionales en persa: al ser un modelo pequeño (repo de 0,1 GB) y con runtime ONNX, permite iterar rápidamente en entornos de desarrollo con recursos limitados.
- Pruebas de integración en pipelines de CI/CD para aplicaciones de voz: la instalación vía `pip install --pre phoonnx` y la API de `TTSModelManager` facilitan tests automatizados de síntesis sin infraestructura GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo VITS empaquetado en ONNX con un repositorio de 0,1 GB, es plausible su ejecución en CPU, pero el autor no publica cifras de VRAM ni de memoria RAM.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada por el autor; el tamaño del repositorio sugiere que cabría en GPU de consumo, pero no hay datos oficiales.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), plugin `ovos-tts-plugin-phoonnx` para OVOS. Requiere espeak-ng instalado en el sistema o el extra `phoonnx[espeak]`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|---|
| `Phoonnx/vits-fa-haaniye-low-espeak` | VITS | fa | no disponible | no aplica | CC-BY-SA-4.0 | ONNX |
| Otras voces VITS de la coleccion Phoonnx | VITS | varios | no disponible | no aplica | variable | ONNX |
| Voces originales de MycroftAI/mimic3-voices | VITS | varios | no disponible | no aplica | variable | no disponible |

No se dispone de datos de rendimiento ni de parámetros para establecer una comparación cuantitativa con alternativas. La colección VITS de Phoonnx agrupa modelos equivalentes empaquetados de la misma forma, y el repositorio upstream de Mimic3 contiene las voces originales antes del empaquetado ONNX.

## Limitaciones y advertencias

- Solo soporta persa (`fa`); no es multilingüe.
- La fonemización depende de espeak-ng; si se usa el port espyak, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, según advierte el autor.
- No se han publicado métricas de calidad (MOS, WER), sesgos ni tasas de alucinación acústica; se desconoce el comportamiento en dominios especializados.
- La licencia CC-BY-SA-4.0 exige atribución y compartir bajo la misma licencia las obras derivadas, lo que puede condicionar su uso comercial en productos propietarios.
- El modelo no registra descargas ni validación comunitaria en Hugging Face en el momento de la consulta.
- Al ser una voz etiquetada como `low`, es posible que la calidad sea inferior a otras variantes del catálogo, aunque el autor no especifica la diferencia.
- No hay información sobre el dataset de entrenamiento, lo que impide evaluar sesgos de género, acento o dominio.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Phoonnx/vits-fa-haaniye-low-espeak)
- [Repositorio upstream en MycroftAI/mimic3-voices](https://github.com/MycroftAI/mimic3-voices/tree/master/voices/fa/haaniye_low)
- [Coleccion VITS de Phoonnx en Hugging Face](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Repositorio phoonnx.js](https://github.com/TigreGotico/phoonnx.js)
- [Demo de phoonnx.js](https://tigregotico.pt/demo)
