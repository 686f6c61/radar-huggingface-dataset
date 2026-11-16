# Phoonnx/vits-da_dk-talesyntese-medium-espeak

## Resumen

`vits-da_dk-talesyntese-medium-espeak` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y empaquetado por Phoonnx para su librería ONNX de TTS. El modelo está entrenado específicamente para danés de Dinamarca (`da-DK`) y toma como entrada fonemas generados por espeak-ng en alfabeto IPA, no texto plano directamente.

El modelo resuelve el problema de la síntesis de voz en danés dentro de ecosistemas de asistentes de voz open source, en particular OVOS (Open Voice OS) y Mycroft, donde se integra mediante el plugin `ovos-tts-plugin-phoonnx`. Su empaquetado en formato ONNX permite inferencia ligera en CPU sin necesidad de GPU, lo que lo hace adecuado para dispositivos de borde y sistemas embebidos.

Se trata de un modelo de tamaño "medium" dentro de la familia Piper, con un repositorio de aproximadamente 0,1 GB. La relevancia actual radica en que amplía la cobertura de voces Piper disponibles para phoonnx en una lengua con pocos recursos TTS de calidad, aunque su adopción en Hugging Face es todavía prácticamente nula (0 descargas y 0 likes en el momento de la consulta).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantización | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | danés de Dinamarca (`da-DK`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Tamaño del repositorio | 0,1 GB |
| Entrada de texto | Fonemas espeak-ng en alfabeto IPA |
| Pipeline | text-to-speech |
| Librería | phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en normalizing flows y un discriminador adversarial entrenado con pérdidas de dominio temporal y espectral. Este enfoque genera audio de forma directa a partir de fonemas sin necesidad de un vocoder externo, lo que reduce la latencia y simplifica el despliegue.

El modelo procede del checkpoint `medium` del proyecto Piper para la voz `talesyntese` en danés (`rhasspy/piper-voices/da/da_DK/talesyntese/medium`). No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de RLHF o ajuste fino adicional. El autor del empaquetado (Phoonnx) no aporta información sobre el proceso de entrenamiento original más allá de la procedencia del checkpoint.

La innovación técnica relevante en este empaquetado es la conversión a ONNX y la integración con el front-end de texto de `scriptconv`, que normaliza el texto y lo convierte a fonemas mediante `EspeakPhonemizer` del módulo `scriptconv_copyleft.phonemizers.mul`. Esto permite ejecutar el modelo en Python, en OVOS y en el navegador mediante `phoonnx.js`.

## Capacidades

- Síntesis de voz en danés de Dinamarca (`da-DK`) a partir de texto de entrada.
- Generación de audio en formato WAV mediante `voice.synthesize_wav(text, wav_file)`.
- Conversión de texto a fonemas IPA mediante espeak-ng o, alternativamente, mediante el port espyak incluido en `phoonnx[espeak]`.
- Integración con asistentes de voz OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador mediante `phoonnx.js` con entrada espeak o Unicode.
- Inferencia en CPU gracias al formato ONNX, sin requerir GPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada; es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz domésticos en danés: integración en OVOS o Mycroft mediante `ovos-tts-plugin-phoonnx` para que el asistente responda en danés con una voz local, sin depender de servicios cloud.
- Lectura de notificaciones y alertas en dispositivos de borde: al ejecutarse en ONNX sobre CPU, puede sintetizar mensajes cortos en un Raspberry Pi u otro dispositivo embebido sin conexión a internet.
- Accesibilidad para usuarios daneses: conversión de texto a voz para lectores de pantalla o aplicaciones de asistencia a personas con discapacidad visual, con latencia baja al no requerir vocoder separado.
- Generación de audiolibros o contenido narrado en danés: síntesis por lotes de textos largos divididos en frases, aprovechando la naturaleza end-to-end de VITS para mantener coherencia prosódica.
- Pruebas de integración en pipelines de CI/CD para aplicaciones de voz: verificación automatizada de que el front-end de fonemas y el modelo producen audio válido en cada despliegue.
- Demos web de TTS en danés: uso de `phoonnx.js` para ofrecer síntesis en el navegador sin backend, útil para prototipos y validación de experiencia de usuario.
- Investigación en TTS de bajos recursos: punto de partida para comparar voces Piper en lenguas nórdicas o para ajustar el front-end de fonemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la práctica; el modelo está en ONNX y está pensado para ejecución en CPU. El repositorio ocupa 0,1 GB, por lo que la huella de memoria es del orden de cientos de MB.
- GPU recomendadas: no se especifican; el modelo no requiere GPU. Cualquier GPU compatible con ONNX Runtime podría acelerar la inferencia, pero no hay datos publicados.
- ¿Cabe en GPU de consumo? Sí, con enorme margen, aunque su diseño es para CPU. También cabe en dispositivos de borde tipo Raspberry Pi.
- Opciones de despliegue: `phoonnx` (Python), `ovos-tts-plugin-phoonnx` (OVOS/Mycroft), `phoonnx.js` (navegador). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS VITS.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto / entrada | Disponibilidad |
|---|---|---|---|---|---|---|
| `Phoonnx/vits-da_dk-talesyntese-medium-espeak` | VITS | da-DK | ONNX | MIT | Fonemas espeak IPA | Hugging Face (0 descargas) |
| Otras voces Piper `da_DK` en `rhasspy/piper-voices` | VITS | da-DK | ONNX | MIT (según upstream) | Fonemas espeak IPA | Hugging Face (upstream) |
| Voces VITS de la colección Phoonnx para otras lenguas | VITS | Varias | ONNX | MIT (según upstream) | Fonemas espeak IPA | Hugging Face |
| Modelos TTS multilingües neuronales (p. ej. familia XTTS) | no disponible en esta ficha | Multilingüe | no disponible | no disponible | Texto / audio | no disponible |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Cobertura lingüística limitada exclusivamente al danés de Dinamarca (`da-DK`); no sintetiza otras lenguas ni variantes regionales.
- Dependencia de espeak-ng para la fonemización: sin espeak-ng instalado, el modelo no funciona correctamente. El port espyak incluido en `phoonnx[espeak]` puede producir fonemas distintos y provocar pronunciaciones erróneas en algunas palabras.
- Riesgo de prosodia incorrecta o pronunciación defectuosa en palabras fuera del dominio de entrenamiento, nombres propios y neologismos, dado que la entrada es fonémica y depende del front-end.
- No se han publicado métricas de calidad (MOS, inteligibilidad) en la información disponible, por lo que la calidad subjetiva no está documentada.
- Licencia MIT declarada por el upstream en la model card de `rhasspy/piper-voices`; se recomienda verificar los términos del checkpoint original antes de uso comercial a gran escala.
- Adopción prácticamente nula en Hugging Face (0 descargas, 0 likes), lo que implica ausencia de validación comunitaria y soporte limitado.
- No apto para tareas de razonamiento, generación de texto, código, visión ni agentes; es exclusivamente un modelo de síntesis de voz.
- El tamaño "medium" de Piper prioriza eficiencia sobre calidad máxima; para voces de mayor calidad puede requerirse un checkpoint superior del upstream.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-da_dk-talesyntese-medium-espeak
- Upstream (Piper voices, da_DK/talesyntese/medium): https://huggingface.co/rhasspy/piper-voices/tree/main/da/da_DK/talesyntese/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Referencia de la arquitectura VITS: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
