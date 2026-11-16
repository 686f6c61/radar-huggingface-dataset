# Phoonnx/vits-en_us-l2arctic-medium-espeak

## Resumen

`vits-en_us-l2arctic-medium-espeak` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy como parte del proyecto Piper y empaquetado por Phoonnx para su librería ONNX de TTS. El modelo toma texto en inglés estadounidense, lo convierte a fonemas mediante espeak-ng (alfabeto IPA) y genera audio de voz sintética. Es un modelo de tamano medio ("medium" en la nomenclatura de Piper), derivado del corpus L2-ARCTIC, un conjunto de datos de habla no nativa de hablantes de inglés como segunda lengua.

La relevancia de este modelo radica en su formato ONNX, que permite inferencia eficiente en CPU y GPU sin necesidad de frameworks de deep learning pesados, y en su integración con el ecosistema phoonnx (Python y OVOS). Al estar empaquetado específicamente para phoonnx y depender de espeak-ng para la fonemización, está orientado a despliegues de asistentes de voz locales y sistemas embebidos donde el coste computacional y la latencia importan.

El repositorio tiene un tamano de 0,1 GB, lo que confirma que se trata de un modelo compacto. La licencia es MIT, lo que facilita su uso comercial. No se dispone de información sobre el número exacto de parámetros ni sobre benchmarks de calidad de síntesis en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (formato ONNX; se desconoce si existen variantes cuantizadas) |
| Idiomas soportados | en-US (inglés estadounidense) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas espeak (alfabeto IPA) |
| Tamano del repositorio | 0,1 GB |
| Pipeline | text-to-speech |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un encoder de texto, un prior variacional, un decoder basado en flujos normalizadores y un discriminador adversarial entrenado con pérdidas de dominio temporal y espectral. El modelo genera waveforms directamente a partir de fonemas, sin necesidad de un vocoder separado. En este caso, la entrada es texto fonemizado con espeak-ng en alfabeto IPA, y la salida es audio en formato WAV.

El modelo deriva del checkpoint `rhasspy/piper-voices/en/en_US/l2arctic/medium`, entrenado sobre el corpus L2-ARCTIC, que contiene grabaciones de hablantes no nativos de inglés. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco habituales en modelos TTS). La innovación principal de este empaquetado es la conversión a ONNX y la integración con la cadena de procesamiento de phoonnx y scriptconv para normalización de texto y fonemización.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense (en-US).
- Conversión de texto a fonemas IPA mediante espeak-ng (a través de scriptconv).
- Generación de audio en formato WAV.
- Ejecución en CPU y GPU mediante runtime ONNX.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Soporte en navegador a través de phoonnx.js (con entrada espeak o unicode).
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- No soporta visión, audio de entrada ni modo thinking.
- Capacidad multilingüe limitada exclusivamente a en-US.

## Casos de uso

- Asistentes de voz locales: el modelo puede integrarse en OVOS para convertir respuestas de texto en audio en tiempo real, gracias a su formato ONNX ligero y su ejecución en CPU sin GPU dedicada.
- Sistemas embebidos y Raspberry Pi: con un repositorio de 0,1 GB y runtime ONNX, es adecuado para dispositivos de recursos limitados donde no cabe un modelo TTS de mayor tamano.
- Lectura de notificaciones y alertas: síntesis de mensajes cortos en aplicaciones de domótica o monitorización, con latencia baja al no requerir un vocoder separado.
- Generación de audiolibros o contenido pregrabado: producción por lotes de audio a partir de texto en inglés, con licencia MIT que permite uso comercial.
- Pruebas de accesibilidad: conversión de texto a voz para aplicaciones web o de escritorio que necesiten lectura en voz alta en inglés estadounidense.
- Prototipado de interfaces conversacionales: integración rápida en pipelines de Python mediante `TTSModelManager` para validar flujos de voz antes de invertir en modelos de mayor calidad.
- Demos en navegador: uso de phoonnx.js para síntesis de voz en cliente sin backend, útil para aplicaciones web interactivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamano del repositorio (0,1 GB) se espera un consumo de memoria muy bajo, inferior a 1 GB en la mayoría de configuraciones.
- GPU recomendadas: no se especifican; al ser un modelo ONNX compacto, puede ejecutarse en GPU consumer como RTX 3060, RTX 4090 o incluso en CPU.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 1-2 GB de memoria, aunque no se dispone de cifras oficiales.
- Opciones de despliegue: phoonnx (Python), OVOS mediante `ovos-tts-plugin-phoonnx`, phoonnx.js (navegador), runtime ONNX estándar. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Contexto | Notas |
|---|---|---|---|---|---|---|
| vits-en_us-l2arctic-medium-espeak | VITS | en-US | ONNX | MIT | no aplica | Empaquetado para phoonnx, voz L2-ARCTIC |
| rhasspy/piper-voices (otros voces en_US) | VITS | en-US y otros | ONNX | MIT (según model card) | no aplica | Mismo upstream, distintas voces y calidades |
| Modelos TTS comerciales (p. ej. ElevenLabs) | no disponible | múltiples | API | propietaria | no aplica | No comparables en licencia ni despliegue local |

No se dispone de datos de rendimiento comparativo (MOS, RTF) en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre L2-ARCTIC (hablantes no nativos), la voz puede presentar acento no nativo y características prosódicas específicas del corpus; no se dispone de análisis de sesgos demográficos.
- Riesgo de alucinación: en TTS, el equivalente es la pronunciación incorrecta de palabras; el uso de espyak en lugar de espeak-ng puede provocar errores de pronunciación en algunos fonemas, según advierte la model card.
- Limitaciones de idioma: solo soporta en-US; no es multilingüe.
- Dependencia externa: requiere espeak-ng instalado en el sistema para la fonemización; sin él, la calidad puede degradarse.
- Restricciones de licencia: MIT permite uso comercial, pero se recomienda verificar la licencia upstream de rhasspy/piper-voices y del corpus L2-ARCTIC.
- Caveat para producción: el modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, lo que sugiere poca validación comunitaria; se recomienda evaluar la calidad de síntesis antes de desplegarlo.
- No es un modelo de lenguaje: no soporta razonamiento, tool calling ni generación de texto.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-l2arctic-medium-espeak
- Upstream (Piper voices): https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/l2arctic/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
