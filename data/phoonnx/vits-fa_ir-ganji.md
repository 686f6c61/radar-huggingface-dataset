# Phoonnx/vits-fa_ir-ganji

## Resumen

vits-fa_ir-ganji es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado en formato ONNX por Phoonnx para su uso con la librería homónima. El modelo original procede de SadeghK, autor del repositorio persian-text-to-speech, y corresponde a la voz denominada "ganji" dentro de la carpeta farsi del proyecto upstream. Está especializado en la síntesis de voz en persa de Irán (fa-IR) y su entrada de texto son fonemas en alfabeto IPA generados mediante espeak-ng.

El modelo resuelve el problema de la síntesis de voz en persa dentro del ecosistema OVOS y de asistentes de voz open source, ofreciendo una voz preentrenada y empaquetada que puede cargarse directamente con la librería phoonnx, tanto en Python como en el navegador mediante phoonnx.js. Su relevancia radica en que las voces de calidad para persa son escasas en el ecosistema abierto, y este empaquetado elimina la fricción de convertir los pesos originales a ONNX y de integrar el front-end fonémico.

El repositorio ocupa aproximadamente 0,1 GB, lo que corresponde a un modelo VITS de tamaño compacto, adecuado para inferencia en CPU y en dispositivos de recursos limitados. La licencia declarada es Apache 2.0, lo que permite uso comercial y modificación. No se dispone de información sobre el número de parámetros ni sobre la longitud de contexto en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | persa de Irán (fa-IR) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional condicionado por el texto, un decodificador generativo basado en flujos normales y un discriminador adversarial entrenado con la pérdida de mínimos cuadrados. VITS permite generar formas de onda directamente a partir de fonemas sin necesidad de un vocoder separado, lo que reduce la latencia y simplifica el despliegue. El modelo empaquetado se distribuye en ONNX, lo que facilita la inferencia multiplataforma mediante phoonnx y phoonnx.js.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset, la duración del audio utilizado ni si se aplicaron técnicas de RLHF o DPO. El modelo original procede de SadeghK y la model card indica únicamente el idioma y la fuente del front-end fonémico. La innovación técnica destacable del empaquetado es la integración del front-end de texto mediante la librería scriptconv, que normaliza el texto y lo convierte a fonemas espeak-ng antes de pasarlo al modelo; alternativamente, phoonnx puede usar el port espyak de espeak-ng, aunque algunos fonemas difieren y pueden producir pronunciaciones incorrectas.

## Capacidades

- Síntesis de voz a partir de texto en persa de Irán (fa-IR), con salida en formato WAV.
- Generación de audio mediante fonemas espeak-ng en alfabeto IPA, lo que permite control fino de la pronunciación.
- Integración con la librería phoonnx para Python, con API de síntesis directa a fichero WAV.
- Compatibilidad con el ecosistema OVOS mediante el plugin ovos-tts-plugin-phoonnx, configurable en mycroft.conf.
- Ejecución en navegador mediante phoonnx.js, con entrada espeak o unicode.
- Inferencia en formato ONNX, apta para CPU y para despliegues sin GPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni visión; es exclusivamente un modelo TTS.
- Capacidad multilingüe limitada al persa; no se declaran otros idiomas.

## Casos de uso

- Asistentes de voz en persa sobre OVOS: el modelo se integra como plugin TTS en mycroft.conf y permite que un asistente doméstico responda en persa de Irán con una voz preentrenada, sin necesidad de entrenar un modelo propio.
- Lectura de contenido web o de documentos en persa: la librería scriptconv normaliza el texto y lo convierte a fonemas, de modo que el modelo puede narrar artículos, correos o noticias en fa-IR con una latencia baja gracias a la inferencia ONNX.
- Accesibilidad para personas con discapacidad visual: la síntesis en tiempo casi real permite leer pantallas y menús en persa en aplicaciones de escritorio o web, ejecutándose en CPU sin GPU dedicada.
- Generación de audiolibros y pódcasts en persa: el modelo puede sintetizar pasajes largos por fragmentos y ensamblarlos, con la ventaja de que el repositorio de 0,1 GB cabe en entornos con recursos limitados.
- Pruebas de pronunciación y aprendizaje de idiomas: al aceptar fonemas IPA como entrada, permite generar palabras o frases concretas para comparar pronunciaciones y practicar la fonética persa.
- Integración en aplicaciones web mediante phoonnx.js: la demo en tigregotico.pt/demo y la librería JavaScript permiten sintetizar voz en el navegador sin backend, útil para interfaces de accesibilidad o lectores de contenido en persa.
- Prototipado de interfaces de voz en investigación: al ser un modelo Apache 2.0 y ONNX, se puede modificar, redistribuir y desplegar en pipelines de evaluación de TTS sin restricciones comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo VITS compacto (repositorio de 0,1 GB) y distribuirse en ONNX, es probable que funcione en CPU, pero no se confirman cifras de memoria.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del repositorio sugiere que podría ejecutarse en hardware modesto, pero no se aportan datos.
- Opciones de despliegue: phoonnx (Python), ovos-tts-plugin-phoonnx (OVOS) y phoonnx.js (navegador).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|---|
| Phoonnx/vits-fa_ir-ganji | VITS | fa-IR | no disponible | no aplica | Apache 2.0 | ONNX |
| SadeghK/persian-text-to-speech (ganji) | VITS | fa-IR | no disponible | no aplica | Apache 2.0 | no disponible |
| Otras voces VITS de la colección Phoonnx | VITS | varios | no disponible | no aplica | variable | ONNX |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo sintetiza persa de Irán (fa-IR); no soporta otros idiomas ni cambios de idioma dentro de una misma frase.
- La entrada debe ser texto en persa que scriptconv normalice correctamente; texto con caracteres no soportados o mezclas de alfabetos puede producir fonemas incorrectos.
- El uso de espyak en lugar de espeak-ng puede provocar pronunciaciones erróneas en algunas palabras, según advierte la model card.
- No se dispone de información sobre sesgos de género, acento o registro en la voz "ganji"; no se han publicado evaluaciones de sesgo.
- Riesgo de alucinación acústica: como todo modelo generativo TTS, puede producir artefactos o prosodia incorrecta en frases largas o con puntuación atípica.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la procedencia del audio de entrenamiento original de SadeghK, ya que la model card no detalla el dataset.
- No se dispone de información sobre el número de parámetros ni sobre el rendimiento en benchmarks, lo que limita la comparación objetiva con otras voces.
- El modelo está empaquetado para phoonnx; su uso fuera de esa librería requiere cargar el ONNX manualmente y replicar el front-end fonémico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-fa_ir-ganji
- Modelo upstream (SadeghK/persian-text-to-speech, carpeta farsi/ganji): https://huggingface.co/SadeghK/persian-text-to-speech/tree/main/farsi/ganji
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Librería phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
