# Phoonnx/vits-fi_fi-harri-low-espeak

## Resumen

vits-fi_fi-harri-low-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su libreria de inferencia ONNX. El modelo original procede del proyecto Rhasspy, concretamente de la coleccion piper-voices, en la variante fi_FI con la voz "harri" y calidad "low". No se trata de un modelo entrenado desde cero por Phoonnx, sino de una redistribucion del checkpoint de Piper adaptada al formato y al pipeline de phoonnx.

El modelo resuelve la conversion de texto a audio en finlandes (fi-FI) con un coste computacional bajo, lo que lo hace adecuado para despliegues en dispositivos con recursos limitados, asistentes de voz locales y sistemas de sintesis en tiempo real. La entrada de texto se realiza mediante fonemas espeak en alfabeto IPA, lo que exige la presencia de espeak-ng o del port espyak en el entorno de ejecucion.

Es relevante ahora por su integracion con el ecosistema OVOS (Open Voice OS) y por su licencia MIT, que permite uso comercial sin restricciones adicionales. El repositorio ocupa aproximadamente 0,1 GB y se distribuye en formato ONNX, lo que simplifica su despliegue sin necesidad de frameworks de deep learning completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos ONNX, calidad "low" segun upstream) |
| Idiomas soportados | finlandes (fi-FI) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |
| Voz upstream | piper/fi_FI-harri-low |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un modelo generativo de sintesis de voz de extremo a extremo que combina un encoder de texto, un prior variacional y un decoder basado en flujos normalizadores y un generador HiFi-GAN para producir audio crudo. VITS es conocida por generar audio de alta calidad sin necesidad de un vocoder separado y por su capacidad de entrenamiento adversario con alineamiento monotono.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o ajuste fino especifico. El modelo procede del proyecto Rhasspy piper-voices, que entrena voces sobre corpus de dominio publico y voces sinteticas, pero los detalles concretos de la voz "harri" en calidad "low" no estan documentados en la informacion proporcionada. La etiqueta "low" hace referencia a la calidad del checkpoint de Piper, que suele implicar un modelo mas pequeno y menor fidelidad que las variantes "medium" o "high".

## Capacidades

- Sintesis de voz a partir de texto en finlandes (fi-FI).
- Conversion de texto a fonemas espeak en alfabeto IPA mediante la libreria scriptconv.
- Generacion de audio WAV mediante la API `synthesize_wav` de phoonnx.
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador mediante phoonnx.js con entrada espeak o unicode.
- No soporta tool calling, agentes, vision ni razonamiento multi-paso (es un modelo TTS).
- No dispone de modo thinking ni capacidades multimodales mas alla del audio generado.

## Casos de uso

- Asistentes de voz locales: el modelo puede integrarse en OVOS o en cualquier pipeline basado en phoonnx para sintetizar respuestas en finlandes sin depender de servicios en la nube, gracias a su formato ONNX y su bajo consumo de recursos.
- Lectura de notificaciones y alertas: en sistemas embebidos o aplicaciones de escritorio, el modelo puede convertir mensajes cortos en audio en tiempo real con una latencia baja al ejecutarse sobre CPU.
- Accesibilidad para personas con discapacidad visual: sintesis de contenido textual en finlandes para lectores de pantalla, aprovechando la licencia MIT para distribucion en productos comerciales.
- Generacion de audio para contenido educativo: narracion de materiales didacticos en finlandes dentro de plataformas de e-learning, con la ventaja de que el modelo puede ejecutarse en el propio servidor sin coste por peticion.
- Prototipado de interfaces conversacionales: desarrolladores que necesiten una voz finlandesa para pruebas de concepto pueden usar el modelo sin entrenar un TTS propio, gracias a la instalacion via `pip install --pre phoonnx`.
- Sistemas de anuncios publicos o domotica: integracion en altavoces inteligentes y sistemas de megafonia para emitir avisos en finlandes, con despliegue en dispositivos de bajos recursos por el tamano reducido del checkpoint.
- Demos web en navegador: mediante phoonnx.js, el modelo puede ejecutarse en el cliente para demostraciones interactivas de sintesis de voz en finlandes sin backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de un modelo ONNX de calidad "low" con un repositorio de 0,1 GB, es probable que quepa en CPU sin GPU dedicada, pero no se confirma en la informacion.
- GPU recomendadas: no disponible; por el tamano del modelo, cualquier GPU consumer moderna deberia ser suficiente, aunque no se especifica.
- Compatibilidad con GPU consumer: no confirmada en la informacion; el formato ONNX permite ejecucion en CPU y en GPUs convencionales.
- Opciones de despliegue: phoonnx (Python), OVOS mediante `ovos-tts-plugin-phoonnx`, phoonnx.js en navegador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Contexto | Notas |
|---|---|---|---|---|---|---|
| vits-fi_fi-harri-low-espeak | VITS | fi-FI | MIT | ONNX | no disponible | Voz "harri" calidad low, empaquetado por Phoonnx |
| Otras voces Piper fi_FI (medium/high) | VITS | fi-FI | MIT | ONNX | no disponible | Mayor calidad y tamano, mismo upstream Rhasspy |
| Modelos TTS multilingues genericos | no disponible | multi | variable | variable | no disponible | No se dispone de datos comparativos en la informacion |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta finlandes (fi-FI); no es multilingue.
- La calidad "low" del checkpoint implica menor fidelidad y naturalidad que las variantes medium o high de Piper.
- Requiere espeak-ng instalado en el sistema o el port espyak; este ultimo puede producir errores de pronunciacion en algunas palabras, segun advierte la model card.
- Al ser un modelo TTS, no realiza razonamiento, generacion de texto ni tool calling; su unica funcion es convertir texto en audio.
- No se dispone de informacion sobre sesgos en la voz generada ni sobre la composicion del dataset de entrenamiento.
- Riesgo de alucinacion no aplica en el sentido de generacion de texto, pero pueden producirse artefactos o pronunciaciones incorrectas en palabras fuera del vocabulario de entrenamiento.
- La licencia MIT permite uso comercial, pero se recomienda verificar la procedencia upstream en rhasspy/piper-voices para confirmar las condiciones de los datos de entrenamiento originales.
- No se especifican limitaciones de longitud de texto de entrada; el rendimiento puede degradarse en entradas muy largas.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-fi_fi-harri-low-espeak
- Upstream Piper voices: https://huggingface.co/rhasspy/piper-voices/tree/main/fi/fi_FI/harri/low
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
