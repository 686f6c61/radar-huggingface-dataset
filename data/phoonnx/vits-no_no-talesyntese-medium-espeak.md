# Phoonnx/vits-no_no-talesyntese-medium-espeak

## Resumen

`vits-no_no-talesyntese-medium-espeak` es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su libreria de inferencia ONNX. El modelo original procede del proyecto Rhasspy, concretamente de la coleccion `piper-voices`, y corresponde a la voz noruega `no_NO-talesyntese-medium`. Phoonnx se limita a reempaquetar los pesos en formato ONNX y a integrarlos en su ecosistema de inferencia (Python y OVOS), por lo que el desarrollo del modelo subyacente corresponde a Rhasspy.

El modelo resuelve la sintesis de voz en noruego bokmal (`no-NO`) a partir de texto convertido a fonemas mediante espeak-ng en alfabeto IPA. Al ser un modelo VITS de tamano "medium", esta pensado para inferencia ligera y local, no para produccion de audio de alta fidelidad. Su relevancia es acotada: se trata de una voz concreta dentro de un ecosistema de voces Piper, con cero descargas y cero likes en el momento de la ficha, y sin datos publicados de calidad o benchmarks.

La ficha se elabora exclusivamente a partir de la informacion disponible en la model card y los metadatos de Hugging Face; cualquier dato no presente en esas fuentes se marca como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | noruego (`no-NO`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Autor del modelo original | Rhasspy |
| Empaquetador | Phoonnx |
| Tamano del repositorio | 0.1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un modelo generativo de sintesis de voz de extremo a extremo que combina un encoder de texto, un prior variacional, un decoder basado en flujos normalizadores y un discriminador adversarial en entrenamiento (GAN condicional). VITS produce audio de forma directa a partir de fonemas sin necesidad de un vocoder separado en inferencia. La model card no detalla la configuracion interna (numero de capas, dimensiones ocultas, tasa de muestreo del audio) ni el numero de parametros; esa informacion no esta disponible.

Respecto al entrenamiento, la model card no aporta datos sobre el corpus utilizado, el numero de horas de audio, la composicion del dataset ni si se aplicaron tecnicas de ajuste adicionales. El modelo original procede del repositorio `rhasspy/piper-voices`, en la ruta `no/no_NO/talesyntese/medium`, y Phoonnx lo reempaqueta en ONNX para su libreria. La unica innovacion tecnica documentada es el uso de espeak-ng como front-end de fonemizacion (via `scriptconv`), con la advertencia de que el port `espyak` puede diferir de espeak-ng en algunos fonemas y provocar errores de pronunciacion.

## Capacidades

- Sintesis de voz a partir de texto en noruego (`no-NO`), con salida en fichero WAV.
- Fonemizacion mediante espeak-ng en alfabeto IPA, gestionada por la libreria `scriptconv`.
- Inferencia sobre pesos ONNX, lo que permite ejecucion en CPU y en entornos sin GPU dedicada.
- Integracion con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador a traves de `phoonnx.js` (demo en tigregotico.pt/demo).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio de entrada.
- Capacidad multilingue limitada al noruego; no se documentan otras lenguas.

## Casos de uso

- Asistentes de voz locales en noruego: el modelo permite sintetizar respuestas habladas dentro de OVOS seleccionando la voz `piper/no_NO-talesyntese-medium` en `mycroft.conf`, sin depender de servicios en la nube.
- Lectura de notificaciones y avisos en aplicaciones de escritorio o domotica: al ser un modelo ONNX ligero (repositorio de 0.1 GB), puede ejecutarse en CPU en dispositivos de bajas prestaciones para leer mensajes cortos en noruego.
- Accesibilidad para personas con discapacidad visual: integracion en lectores de pantalla o herramientas de lectura de texto que requieran una voz noruega embebida y sin conexion.
- Prototipado rapido de interfaces de voz: la API de `phoonnx` (`voice.synthesize_wav`) permite generar audio de prueba en pocas lineas de Python para validar flujos conversacionales antes de invertir en voces de mayor calidad.
- Generacion de audio para contenidos educativos o demostraciones en noruego: util para producir narraciones de baja latencia en entornos de desarrollo o pruebas internas.
- Despliegue en navegador: mediante `phoonnx.js` se puede ofrecer sintesis de voz noruega en una aplicacion web sin backend, usando la demo publica como referencia de integracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de 0.1 GB de repositorio, es previsible que quepa en memoria de CPU, pero no se documentan cifras oficiales.
- GPU recomendadas: no disponible; no se especifican requisitos de GPU.
- Compatibilidad con GPU de consumo: no disponible; el modelo esta disenado para inferencia ONNX, tipicamente en CPU.
- Opciones de despliegue: libreria `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS y `phoonnx.js` para navegador. No se documenta soporte para vLLM, llama.cpp ni TGI (no aplicables a un modelo TTS VITS).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Phoonnx/vits-no_no-talesyntese-medium-espeak` | VITS (ONNX) | noruego (`no-NO`) | no aplica | MIT | Hugging Face, via phoonnx |
| Otras voces de `rhasspy/piper-voices` (misma familia) | VITS | multiples idiomas | no aplica | MIT (segun model card upstream) | Hugging Face, via Piper o phoonnx |
| Modelos TTS neuronales de mayor tamano (p. ej. familia XTTS) | no disponible en esta fuente | multilingue | no aplica | no disponible | no disponible |

No se dispone de datos de rendimiento ni de parametros de los modelos alternativos en la informacion proporcionada, por lo que la comparativa se limita a aspectos de licencia y disponibilidad.

## Limitaciones y advertencias

- Cobertura limitada a un unico idioma (`no-NO`); no se documentan otras lenguas.
- La fonemizacion depende de espeak-ng; si se usa el port `espyak`, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, tal como advierte la model card.
- Riesgo de errores de pronunciacion en palabras fuera del dominio de entrenamiento; no se documenta el corpus, por lo que se desconoce su cobertura lexica.
- No hay datos publicados de calidad (MOS, WER, inteligibilidad), sesgos ni tasas de alucinacion; al ser un modelo TTS, el riesgo principal es la mala pronunciacion o la prosodia incorrecta, no la generacion de contenido falso.
- La licencia MIT se hereda de la declaracion del modelo upstream en `rhasspy/piper-voices`; conviene verificar esa declaracion antes de un uso comercial.
- Modelo con cero descargas y cero likes en Hugging Face; no hay evidencia de uso en produccion ni de validacion por la comunidad.
- El repositorio tiene un tamano de 0.1 GB y la fecha de creacion indicada es 2026-11-16, posterior a la elaboracion habitual de fichas; conviene comprobar la vigencia de los metadatos.
- No apto para tareas de razonamiento, codigo, vision ni agentes; es exclusivamente un sintetizador de voz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-no_no-talesyntese-medium-espeak
- Modelo upstream (Rhasspy Piper voices): https://huggingface.co/rhasspy/piper-voices/tree/main/no/no_NO/talesyntese/medium
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
