# Phoonnx/vits-zh_cn-huayan-x_low-espeak

## Resumen

`vits-zh_cn-huayan-x_low-espeak` es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su libreria ONNX de TTS. El modelo original procede del proyecto Rhasspy, concretamente de la voz `zh/zh_CN/huayan/x_low` dentro del repositorio `rhasspy/piper-voices`, y ha sido reempaquetado para funcionar con el ecosistema phoonnx (Python y OVOS). Se trata de una voz en chino mandarin (zh-CN) de calidad "x_low", la variante mas ligera de la escala de Piper.

El modelo resuelve el problema de la sintesis de voz local y de baja latencia en chino mandarin, sin dependencia de servicios en la nube. Al estar en formato ONNX y ser de tamano reducido, esta pensado para despliegues en dispositivos con recursos limitados, asistentes de voz embebidos y entornos de domotica como OVOS. La entrada de texto se convierte a fonemas mediante espeak-ng (alfabeto IPA), lo que condiciona el preprocesado necesario.

La relevancia actual radica en su integracion con el stack phoonnx/scriptconv, que permite ejecutar la voz tanto en Python como en el navegador mediante phoonnx.js. No obstante, el repositorio no incluye pesos visibles (tamano de 0.0 GB) ni datos de rendimiento publicados, y no registra descargas ni interacciones, por lo que debe considerarse un empaquetado de disponibilidad limitada y sin validacion publica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | no disponible (formato ONNX; variante x_low de Piper) |
| Idiomas soportados | chino mandarin (zh-CN) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS, un sistema de sintesis de voz de extremo a extremo que combina un codificador de texto, un prior variacional condicionado por alineamiento monotonico y un decodificador generativo (tipicamente basado en HiFi-GAN) para producir la forma de onda directamente. La variante `x_low` corresponde a la configuracion de menor calidad y menor coste computacional de la escala de voces Piper, lo que implica menos parametros y mayor velocidad a costa de naturalidad.

El entrenamiento original fue realizado por Rhasspy como parte del corpus de voces Piper para chino mandarin; no se dispone de informacion sobre el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO (no aplicables habitualmente en TTS). La innovacion destacable del empaquetado es la conversion del texto a fonemas mediante espeak-ng en alfabeto IPA, gestionada por `scriptconv`, y la exportacion a ONNX para inferencia portable. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Sintesis de voz en chino mandarin (zh-CN) a partir de texto.
- Entrada basada en fonemas espeak-ng en alfabeto IPA, con normalizacion y conversion de texto mediante `scriptconv`.
- Generacion de audio en formato WAV mediante `voice.synthesize_wav`.
- Integracion como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`) configurable en `mycroft.conf`.
- Ejecucion en navegador mediante phoonnx.js (con entrada espeak o unicode).
- Voz de baja calidad y bajo coste computacional (variante x_low), orientada a latencia y recursos reducidos.
- No soporta tool calling, agentes, razonamiento multi-paso ni vision (no es un modelo de lenguaje).
- Capacidad multilingue limitada exclusivamente al chino mandarin.

## Casos de uso

- Asistentes de voz embebidos en domotica: integracion como plugin de OVOS para que un asistente local responda en chino mandarin, usando la voz `piper/zh_CN-huayan-x_low` configurada en `mycroft.conf`, con inferencia ONNX sin conexion a la nube.
- Lectura de notificaciones y alertas en dispositivos IoT: sintesis de mensajes cortos en tiempo real en hardware de bajos recursos gracias a la variante x_low y al formato ONNX.
- Prototipado rapido de interfaces de voz en Python: uso de `TTSModelManager` y `voice.synthesize_wav` para generar audios de prueba en pipelines de desarrollo sin infraestructura dedicada.
- Aplicaciones web de accesibilidad: sintesis en el navegador mediante phoonnx.js para leer contenido en chino mandarin a usuarios con discapacidad visual, sin backend.
- Generacion de locuciones para contenido educativo o audiovisual en chino: produccion por lotes de audio narrado a partir de guiones de texto, con coste computacional minimo.
- Pruebas de regresion de pipelines TTS: uso como voz de referencia ligera para validar el front-end de fonemizacion espeak-ng y la conversion de texto de `scriptconv` antes de escalar a voces de mayor calidad.
- Sistemas de megafonia o anuncios automatizados en entornos controlados: sintesis de avisos cortos y repetitivos donde prima la inteligibilidad y la latencia sobre la naturalidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por la variante x_low y el formato ONNX, se espera un consumo muy reducido, apto para CPU.
- GPU recomendadas: no disponible; no requiere GPU dedicada para su funcionamiento basico.
- Compatibilidad con GPU de consumo: no disponible; el diseno ONNX y la variante x_low sugieren viabilidad en CPU y en GPU de gama baja, sin datos confirmados.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, phoonnx.js en navegador; requiere espeak-ng instalado o el extra `phoonnx[espeak]` (espyak).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Calidad | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-zh_cn-huayan-x_low-espeak (este) | VITS | zh-CN | x_low | MIT | ONNX | Repositorio sin pesos visibles (0.0 GB) |
| Otras voces Piper zh_CN (p. ej. variantes medium/high de rhasspy/piper-voices) | VITS | zh-CN | medium/high | MIT (segun upstream) | ONNX | Disponibles en rhasspy/piper-voices |
| Modelos TTS multilingues de gran escala (p. ej. familias tipo XTTS) | no disponible en la informacion | multi | alta | variable | variable | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Calidad de voz limitada: la variante x_low de Piper prioriza velocidad y recursos sobre naturalidad; puede sonar mas robotica que variantes superiores.
- Dependencia de espeak-ng: sin espeak-ng instalado, el uso de espyak puede pronunciar mal algunas palabras, segun advierte la propia model card.
- Cobertura linguistica restringida al chino mandarin (zh-CN); no soporta otros idiomas.
- Riesgo de errores de pronunciacion por la fonemizacion automatica y la normalizacion de texto de `scriptconv`.
- El repositorio muestra un tamano de 0.0 GB y cero descargas, lo que sugiere que los pesos pueden no estar disponibles o no haber sido validados publicamente; verificar antes de usar en produccion.
- Licencia MIT declarada por el upstream, permisiva para uso comercial, pero conviene confirmar los terminos en el repositorio original de Rhasspy.
- No es un modelo de lenguaje: no genera texto, no razona ni soporta tool calling; su unico cometido es la sintesis de voz.
- Sin benchmarks ni metricas de calidad publicadas (MOS, WER), lo que impide evaluar su rendimiento de forma objetiva.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-zh_cn-huayan-x_low-espeak
- Upstream (Rhasspy Piper voices, zh_CN/huayan/x_low): https://huggingface.co/rhasspy/piper-voices/tree/main/zh/zh_CN/huayan/x_low
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo phoonnx.js: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
