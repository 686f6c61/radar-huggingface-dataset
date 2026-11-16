# Phoonnx/vits-ar_jo-kareem-medium-espeak

## Resumen

vits-ar_jo-kareem-medium-espeak es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo original procede del proyecto Rhasspy, concretamente de la colección piper-voices, en la ruta `ar/ar_JO/kareem/medium`, y se distribuye con licencia MIT. Su función es convertir texto en árabe jordano (`ar-JO`) en audio inteligible, recibiendo como entrada fonemas espeak en alfabeto IPA.

El modelo resuelve un problema acotado pero relevante: disponer de una voz TTS ligera, en formato ONNX y ejecutable localmente, para una variante dialectal árabe concreta (jordana). Al estar empaquetado para phoonnx, se integra tanto en Python como en el ecosistema OVOS (Open Voice OS) mediante el plugin `ovos-tts-plugin-phoonnx`, lo que facilita su uso en asistentes de voz autoalojados.

Por su tamaño de repositorio (0,1 GB) y su naturaleza ONNX, está pensado para inferencia en CPU sin GPU dedicada, lo que lo hace adecuado para despliegues en dispositivos de borde, sistemas embebidos y entornos con requisitos de privacidad estrictos. No es un modelo de lenguaje: no genera texto ni razona, solo sintetiza voz a partir de fonemas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech, extremo a extremo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS; entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; el repo ocupa 0,1 GB) |
| Idiomas soportados | arabe jordano (`ar-JO`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas espeak en alfabeto IPA |
| Autor original | Rhasspy (proyecto piper-voices) |
| Empaquetador | Phoonnx |
| Libreria de inferencia | phoonnx (Python), phoonnx.js (navegador) |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura de síntesis de voz extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador generativo basado en flujos normales y un discriminador adversarial entrenado con pérdidas GAN, junto con una alineación monotónica latente para el ajuste temporal. El resultado es un modelo que genera waveforms directamente a partir de fonemas sin necesidad de un vocoder separado.

En este caso, el modelo procede del proyecto Rhasspy piper-voices, que entrena voces VITS de tamaño "medium" para múltiples idiomas y dialectos. La información disponible no detalla el número de tokens de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de RLHF o ajuste fino adicional. El front-end de texto no forma parte del modelo: phoonnx delega la normalización y la fonemización en la librería scriptconv, concretamente en `EspeakPhonemizer` del módulo `scriptconv_copyleft.phonemizers.mul`, que requiere espeak-ng instalado en el sistema (o el puerto espyak como alternativa, con posibles discrepancias fonéticas).

## Capacidades

- Síntesis de voz a partir de texto en árabe jordano (`ar-JO`), con salida en formato WAV.
- Entrada basada en fonemas espeak en alfabeto IPA, lo que permite control fonético preciso si se generan los fonemas manualmente.
- Inferencia local en formato ONNX, sin dependencia de servicios en la nube.
- Integración con Python mediante `TTSModelManager` de phoonnx.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador mediante phoonnx.js (con entrada espeak o unicode).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni generación de texto: es exclusivamente un modelo TTS.
- Capacidad multilingüe: limitada a `ar-JO`; no cubre otros dialectos árabes ni otros idiomas.

## Casos de uso

- Asistentes de voz autoalojados en OVOS: el modelo se selecciona en `mycroft.conf` con el módulo `ovos-tts-plugin-phoonnx` y la voz `piper/ar_JO-kareem-medium`, proporcionando respuestas habladas en árabe jordano sin enviar texto a servicios externos.
- Lectura de notificaciones y alertas en dispositivos de borde: al ser un modelo ONNX de 0,1 GB, puede ejecutarse en CPU en Raspberry Pi u otros SBC para anunciar eventos en árabe jordano de forma local.
- Accesibilidad para usuarios con discapacidad visual: conversión de texto de interfaz, documentos o mensajes a audio en árabe jordano dentro de aplicaciones de escritorio o web.
- Sistemas de megafonía o anuncios automatizados en entornos con población jordana (aeropuertos, estaciones, comercios), generando avisos pregrabados o dinámicos en dialecto local.
- Pruebas de integración continua de pipelines TTS: al ser un modelo pequeño y determinista en formato ONNX, sirve para validar cadenas de fonemización espeak, normalización con scriptconv y síntesis en entornos de CI sin GPU.
- Prototipado de interfaces conversacionales en árabe jordano: desarrolladores que necesiten una voz local para demos de chatbots por voz pueden integrarla vía phoonnx en Python o vía phoonnx.js en el navegador.
- Generación de audiolibros o contenido educativo en árabe jordano a pequeña escala, con control fonético mediante entrada IPA cuando se requiera precisión en términos técnicos o nombres propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está en formato ONNX y está pensado para ejecución en CPU. El repositorio ocupa 0,1 GB, por lo que la huella en memoria es del orden de cientos de MB.
- GPU recomendadas: no se especifican; no requiere GPU dedicada. Cualquier GPU compatible con ONNX Runtime (por ejemplo, RTX 4090, A100, H100) podría acelerar la inferencia, pero no es un requisito del modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con soporte ONNX Runtime; también funciona sin GPU.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), plugin `ovos-tts-plugin-phoonnx` para OVOS. Requiere espeak-ng instalado (`apt install espeak-ng`) o el extra `phoonnx[espeak]` con el puerto espyak.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vits-ar_jo-kareem-medium-espeak (este modelo) | VITS | ar-JO | ONNX | MIT | Hugging Face (Phoonnx) |
| rhasspy/piper-voices ar_JO kareem medium | VITS | ar-JO | Piper (ONNX) | MIT | Hugging Face (Rhasspy) |
| Otras voces VITS de la colección Phoonnx | VITS | varios | ONNX | MIT (mayoría) | Hugging Face (Phoonnx) |

La comparativa se limita al ecosistema Piper/Phoonnx porque no se dispone de datos de benchmarks ni de especificaciones de parámetros para contrastar con alternativas comerciales o de otros frameworks. El modelo es esencialmente un reempaquetado del original de Rhasspy para la librería phoonnx, por lo que su rendimiento acústico debería ser equivalente al de la voz original.

## Limitaciones y advertencias

- Cobertura lingüística restringida: solo árabe jordano (`ar-JO`); no es válido para otros dialectos árabes ni para árabe estándar moderno sin degradación probable.
- Dependencia de espeak-ng: la fonemización se delega en espeak-ng; si se usa el puerto espyak, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, según advierte la propia model card.
- Riesgo de alucinación acústica: como todo modelo TTS generativo, puede producir artefactos, prosodia incorrecta o pronunciaciones erróneas en textos fuera de dominio, especialmente con números, siglas o nombres propios.
- Sesgos: no se documentan sesgos específicos, pero al derivar de un corpus de entrenamiento no especificado, puede reflejar sesgos de pronunciación o prosodia del corpus original.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda conservar el aviso de copyright y verificar la licencia del modelo upstream en rhasspy/piper-voices.
- Sin soporte de SSML documentado: la entrada es texto plano convertido a fonemas; no se documentan etiquetas de control prosódico.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema muy incipiente, con posible falta de soporte comunitario.
- No apto para tareas de comprensión o generación de lenguaje: es exclusivamente un sintetizador de voz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-ar_jo-kareem-medium-espeak
- Modelo upstream (Rhasspy piper-voices, ar_JO/kareem/medium): https://huggingface.co/rhasspy/piper-voices/tree/main/ar/ar_JO/kareem/medium
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
