# Phoonnx/vits-sl_si-artur-medium-espeak

## Resumen

`vits-sl_si-artur-medium-espeak` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, originalmente desarrollado por Rhasspy dentro del proyecto Piper y empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo genera audio a partir de texto en esloveno (variante `sl-SI`) y constituye una voz concreta —`artur`, de calidad `medium`— del catálogo de voces de Piper, ahora redistribuida en formato ONNX listo para ejecutarse con la librería `phoonnx`.

El modelo resuelve el problema de la síntesis de voz offline y ligera para esloveno: al estar basado en VITS y distribuido como ONNX, puede ejecutarse en CPU sin dependencias de frameworks de deep learning pesados, lo que lo hace adecuado para asistentes locales, sistemas embebidos y aplicaciones de accesibilidad que necesitan TTS sin conexión. Su tamaño de repositorio (0,1 GB) confirma que se trata de un modelo compacto orientado a despliegue en entornos con recursos limitados.

La relevancia actual del modelo radica en su integración con el ecosistema OVOS/Mycroft a través del plugin `ovos-tts-plugin-phoonnx`, y en que el front-end de texto utiliza fonemas generados por espeak-ng en alfabeto IPA. No obstante, conviene señalar que el modelo no incluye pesos en safetensors ni información sobre datos de entrenamiento, y que su adopción en Hugging Face es prácticamente nula (0 descargas y 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | esloveno (`sl`, variante `sl-SI`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |
| Autor upstream | Rhasspy (piper-voices) |
| Empaquetador | Phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un encoder de texto, un prior variacional, un decoder basado en flujos normalizadores y un discriminador adversarial entrenado con pérdidas de reconstrucción y adversariales. El resultado es un modelo que genera waveforms directamente desde fonemas sin necesidad de un vocoder separado, lo que explica su idoneidad para despliegue ligero en ONNX.

En cuanto al entrenamiento, la información disponible no detalla el número de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF o ajuste por preferencias (no aplicables habitualmente en TTS). El modelo procede del repositorio `rhasspy/piper-voices`, en la ruta `sl/sl_SI/artur/medium`, lo que indica que fue entrenado dentro del pipeline de Piper con la configuración `medium` de esa familia de voces. No se dispone de detalles sobre horas de audio, hablantes ni proceso de alineamiento fonético.

La innovación técnica destacable en este empaquetado es el front-end de texto: `phoonnx` delega la normalización y conversión a fonemas en la librería `scriptconv`, que utiliza `EspeakPhonemizer` de `scriptconv_copyleft.phonemizers.mul` para producir fonemas IPA mediante espeak-ng. El autor advierte que la implementación alternativa `espyak` puede generar fonemas distintos y provocar errores de pronunciación en algunas palabras.

## Capacidades

- Síntesis de voz a partir de texto en esloveno (`sl-SI`) con salida en formato WAV.
- Generación de audio mediante fonemas IPA producidos por espeak-ng, lo que permite control fonético fino si se proporcionan fonemas directamente.
- Ejecución offline sobre ONNX, sin dependencia de GPUs ni de frameworks de deep learning pesados.
- Integración con el ecosistema OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`.
- Uso en navegador a través de `phoonnx.js`, que ejecuta voces VITS con entrada espeak o unicode.
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades de agente: es exclusivamente un modelo TTS.
- No dispone de modo thinking, visión, audio de entrada ni capacidades multimodales más allá de la síntesis.
- Capacidad multilingüe limitada al esloveno; no se documentan otras lenguas.

## Casos de uso

- Asistentes de voz locales en esloveno: el modelo puede integrarse en OVOS/Mycroft mediante `ovos-tts-plugin-phoonnx` para dar respuestas habladas en `sl-SI` sin conexión a servicios en la nube, aprovechando su formato ONNX y su reducido tamaño.
- Lectura de pantalla y accesibilidad: aplicaciones de escritorio o móviles que necesiten convertir texto en voz para usuarios eslovenos pueden embeber el modelo y sintetizar frases con latencia baja en CPU.
- Sistemas embebidos y dispositivos de bajo consumo: al pesar 0,1 GB y ejecutarse sobre ONNX, es viable en Raspberry Pi u otros dispositivos sin GPU dedicada para interfaces de voz domésticas.
- Generación de audiolibros y contenido pregrabado: pipelines por lotes que conviertan artículos o documentación en esloveno a audio, dado que la síntesis es determinista y no requiere infraestructura de GPU.
- Pruebas de integración continua para TTS: el modelo sirve como voz de referencia en tests automatizados de pipelines de voz (por ejemplo, verificar que el front-end de fonemas produce salidas esperadas) sin coste de API.
- Prototipado de interfaces conversacionales en esloveno: equipos que desarrollen chatbots de voz pueden usar esta voz para validar la experiencia de usuario antes de invertir en modelos comerciales o de mayor calidad.
- Investigación en fonética eslovena: al aceptar fonemas IPA directamente, permite experimentar con pronunciaciones y comparar la salida acústica del modelo ante distintas transcripciones fonéticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de 0,1 GB, se espera que la inferencia se realice en CPU sin necesidad de VRAM dedicada.
- GPU recomendadas: no se documentan; el modelo está pensado para ejecución en CPU.
- Compatibilidad con GPU de consumo: no se especifica, pero por tamaño y formato (ONNX) es plausible su ejecución en CPU y en GPUs de consumo mediante runtime ONNX, aunque no hay datos oficiales.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft, y `phoonnx.js` en navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-sl_si-artur-medium-espeak (este) | VITS | esloveno (sl-SI) | 0,1 GB | MIT | ONNX | Hugging Face (Phoonnx) |
| rhasspy/piper-voices sl_SI artur medium | VITS | esloveno (sl-SI) | no disponible | MIT | Piper/ONNX | Hugging Face (Rhasspy) |
| Otras voces VITS de la coleccion Phoonnx | VITS | varios | variable | MIT (segun upstream) | ONNX | Hugging Face (Phoonnx) |

La comparación más directa es con el modelo upstream de Rhasspy, del que este es un empaquetado; las diferencias se limitan al formato de distribución y a la integración con `phoonnx`. No se dispone de datos de rendimiento comparativo entre voces.

## Limitaciones y advertencias

- El modelo solo sintetiza esloveno (`sl-SI`); no es multilingüe y no debe usarse para otros idiomas.
- La calidad es `medium` dentro de la familia Piper, por lo que no cabe esperar la naturalidad de voces neuronales de mayor tamaño o de modelos comerciales.
- El front-end depende de espeak-ng; si se usa la implementación `espyak`, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, según advierte el autor.
- No se documentan sesgos específicos, pero al ser una voz única (`artur`) no ofrece variedad de hablantes ni control de prosodia más allá de la fonética de entrada.
- Riesgo de alucinación no aplicable en el sentido habitual, aunque sí puede producir pronunciaciones incorrectas ante texto no normalizado o fonemas mal formados.
- La licencia MIT permite uso comercial, pero se hereda del modelo upstream de Rhasspy; conviene verificar los términos del repositorio `rhasspy/piper-voices` antes de un despliegue comercial.
- El modelo tiene 0 descargas y 0 likes en Hugging Face, lo que indica ausencia de validación comunitaria y de informes de uso en producción.
- No se dispone de información sobre el dataset de entrenamiento, lo que dificulta evaluar cobertura dialectal o sesgos de pronunciación.
- La fecha de creación del repositorio (2026-11-16) es posterior a la fecha habitual de consulta; conviene verificar la vigencia del empaquetado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-sl_si-artur-medium-espeak
- Modelo upstream (Rhasspy Piper): https://huggingface.co/rhasspy/piper-voices/tree/main/sl/sl_SI/artur/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
