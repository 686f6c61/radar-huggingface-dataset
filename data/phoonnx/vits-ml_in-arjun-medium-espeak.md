# Phoonnx/vits-ml_in-arjun-medium-espeak

## Resumen

`vits-ml_in-arjun-medium-espeak` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y empaquetado por Phoonnx para su librería ONNX de TTS. El modelo convierte texto en malabar (malayo, variante `ml-IN`) en audio inteligible a partir de fonemas generados por espeak-ng en alfabeto IPA. No es un modelo de lenguaje generativo: es un sistema acústico neuronal que produce formas de onda a partir de una secuencia fonémica.

El modelo resuelve el problema de disponer de una voz TTS ligera, offline y ejecutable en CPU para una lengua de bajos recursos como el malabar. Su relevancia radica en que se distribuye en formato ONNX con licencia MIT, lo que permite integrarlo en asistentes de voz locales (por ejemplo, el ecosistema OVOS/Mycroft) sin depender de servicios en la nube ni de GPU.

El repositorio ocupa aproximadamente 0,1 GB y se publicó en noviembre de 2026. La información disponible sobre parámetros, contexto y datos de entrenamiento es muy limitada: la model card solo documenta la arquitectura, el idioma, el front-end fonémico y las instrucciones de uso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (variational inference text-to-speech) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantización | no disponible (pesos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | malabar (`ml-IN`) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador generativo basado en flujos normalizadores y un discriminador adversarial entrenado de forma conjunta con una pérdida de reconstrucción espectral. El modelo original de esta ficha proviene de la colección `rhasspy/piper-voices`, concretamente de la voz `ml/ml_IN/arjun/medium`, y Phoonnx lo ha reempaquetado en ONNX para su ejecución con la librería `phoonnx`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de alineamiento forzado, RLHF o ajuste fino adicional. El front-end textual no forma parte del modelo: Phoonnx delega la normalización y la fonemización en `scriptconv`, que usa `EspeakPhonemizer` de `scriptconv_copyleft.phonemizers.mul` para generar fonemas espeak en alfabeto IPA. La calidad de la pronunciación depende, por tanto, de la implementación de espeak-ng instalada (la model card advierte que la variante `espyak` puede producir errores en algunas palabras).

## Capacidades

- Síntesis de voz a partir de texto en malabar (`ml-IN`), con salida en formato WAV.
- Generación de audio a partir de fonemas espeak en alfabeto IPA, lo que permite control fino de la pronunciación si se proporcionan fonemas directamente.
- Ejecución en CPU mediante ONNX Runtime, sin necesidad de GPU.
- Integración con el ecosistema OVOS/Mycroft a través del plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador mediante `phoonnx.js`, con demo disponible en `tigregotico.pt/demo`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking: es exclusivamente un modelo TTS.
- Capacidad multilingüe limitada al malabar; no se documentan otras lenguas.

## Casos de uso

- Asistentes de voz locales en malabar: el modelo puede integrarse en OVOS/Mycroft mediante `ovos-tts-plugin-phoonnx` para leer respuestas del asistente en tiempo real, sin conexión a internet y sin GPU, gracias a su formato ONNX y su tamaño reducido (0,1 GB).
- Lectura de notificaciones y alertas en dispositivos embebidos: al ejecutarse en CPU con ONNX Runtime, puede desplegarse en Raspberry Pi o dispositivos similares para anunciar eventos del sistema en malabar.
- Accesibilidad para personas con discapacidad visual: conversión de texto de pantalla a voz en malabar en aplicaciones de escritorio o web, usando la integración con `phoonnx.js` en el navegador.
- Generación de audiolibros o contenido pregrabado: síntesis por lotes de textos largos en malabar, dividiendo el texto en frases y concatenando los WAV resultantes.
- Doctores y sistemas de atención telefónica automatizada: respuestas de voz pregrabadas dinámicamente para menús IVR en malabar, donde la latencia de CPU es aceptable.
- Pruebas de pronunciación y desarrollo de recursos lingüísticos: al aceptar fonemas IPA directamente, permite a investigadores generar estímulos auditivos controlados para experimentos de percepción del habla en malabar.
- Prototipado de interfaces de voz en investigación: sustitución de servicios TTS comerciales en entornos de laboratorio con requisitos de licencia permisiva (MIT) y ejecución offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está pensado para ejecución en CPU mediante ONNX Runtime. El repositorio ocupa 0,1 GB, por lo que la huella en memoria es del orden de cientos de MB.
- GPU recomendadas: no se documentan; al ser un modelo VITS pequeño, cualquier GPU compatible con ONNX Runtime (por ejemplo, RTX 4090, A100, H100) podría ejecutarlo, pero no es el caso de uso previsto.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con soporte ONNX Runtime, aunque su diseño prioriza CPU.
- Opciones de despliegue: `phoonnx` (Python), `ovos-tts-plugin-phoonnx` (OVOS/Mycroft), `phoonnx.js` (navegador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo TTS.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Tamaño |
|---|---|---|---|---|---|
| `vits-ml_in-arjun-medium-espeak` (este) | VITS | ml-IN | MIT | ONNX | ~0,1 GB |
| Otras voces de `rhasspy/piper-voices` | VITS | múltiples | MIT (según voz) | ONNX | variable |
| Modelos TTS comerciales en la nube | propietaria | múltiples | propietaria | API | no disponible |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse presumiblemente con un corpus limitado de malabar, puede presentar sesgos de pronunciación o prosodia en variedades regionales no representadas.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero el modelo puede producir pronunciaciones incorrectas o audio ininteligible si los fonemas de entrada son erróneos.
- Limitaciones de contexto o idioma: solo soporta malabar (`ml-IN`); no se documentan otras lenguas. La entrada debe pasar por espeak-ng; la variante `espyak` puede generar fonemas distintos y provocar errores de pronunciación.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificación y redistribución siempre que se conserve el aviso de copyright. La model card indica que la licencia MIT proviene de la declaración de `rhasspy/piper-voices`.
- Caveats para producción: la calidad depende de la versión de espeak-ng instalada; es necesario instalar espeak-ng o el extra `phoonnx[espeak]`. El modelo no incluye normalización textual propia: esta se delega en `scriptconv`, por lo que números, abreviaturas y símbolos deben normalizarse antes de la fonemización. No se documentan métricas de calidad (MOS) ni pruebas de robustez.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-ml_in-arjun-medium-espeak
- Modelo upstream: https://huggingface.co/rhasspy/piper-voices/tree/main/ml/ml_IN/arjun/medium
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
