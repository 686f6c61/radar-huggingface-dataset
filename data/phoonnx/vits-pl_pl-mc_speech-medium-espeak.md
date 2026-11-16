# Phoonnx/vits-pl_pl-mc_speech-medium-espeak

## Resumen

`vits-pl_pl-mc_speech-medium-espeak` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y empaquetado por Phoonnx para su librería ONNX de TTS. El modelo está especializado en polaco (`pl-PL`) y toma como entrada fonemas generados por espeak-ng en alfabeto IPA, no texto plano directamente. Su propósito es convertir texto polaco en audio inteligible con una calidad "medium" dentro de la escala de voces de Piper.

La relevancia de este modelo es práctica: al estar empaquetado en formato ONNX y con una librería ligera (`phoonnx`), está pensado para despliegues en entornos con recursos limitados, asistentes de voz locales (integración con OVOS/Mycroft) y aplicaciones que necesitan TTS offline sin depender de servicios en la nube. No es un modelo de propósito general ni un LLM: es un sintetizador acústico de dominio concreto.

El repositorio ocupa aproximadamente 0,1 GB, lo que confirma que se trata de un modelo compacto orientado a inferencia rápida en CPU o GPU modesta. La licencia declarada es MIT, lo que facilita su uso comercial siempre que se respeten las condiciones del proyecto upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference for Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no LLM) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | polaco (`pl-PL`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | ~0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura de TTS de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador acústico basado en flujos normalizadores y un discriminador adversarial durante el entrenamiento. El resultado es un modelo que genera formas de onda directamente desde fonemas, sin necesidad de un vocoder separado en tiempo de inferencia. En este caso, el modelo procede de la colección de voces de Piper (`rhasspy/piper-voices/pl/pl_PL/mc_speech/medium`), un proyecto de TTS neuronal ligero orientado a asistentes de voz.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de ajuste fino con RLHF/DPO (no aplicable en TTS). La innovación técnica destacable es el uso de fonemas espeak-ng como interfaz de entrada, lo que permite una normalización lingüística externa mediante `scriptconv` y facilita la portabilidad del modelo a distintos front-ends. El empaquetado en ONNX por parte de Phoonnx busca maximizar la compatibilidad con runtimes de inferencia ligeros.

## Capacidades

- Síntesis de voz a partir de texto polaco (`pl-PL`) mediante fonemización previa con espeak-ng.
- Generación de audio en formato WAV a través de la API `synthesize_wav` de phoonnx.
- Integración con el ecosistema OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador a través de `phoonnx.js` (con entrada espeak o unicode).
- Normalización y conversión de texto delegada a `scriptconv`.
- No soporta tool calling, razonamiento multi-paso, visión ni audio de entrada: es exclusivamente TTS.
- Capacidad multilingüe limitada al polaco; no se declaran otros idiomas.

## Casos de uso

- Asistentes de voz locales en polaco: integración con OVOS/Mycroft mediante `ovos-tts-plugin-phoonnx` para leer respuestas del asistente sin conexión a internet, aprovechando el tamaño reducido del modelo (~0,1 GB).
- Lectura de notificaciones y alertas en aplicaciones de escritorio o domótica: el modelo puede sintetizar mensajes cortos en polaco con baja latencia al ejecutarse en ONNX sobre CPU.
- Accesibilidad para personas con discapacidad visual: conversión de texto en pantalla a voz polaca en entornos donde no se quiere depender de APIs externas.
- Sistemas embebidos y dispositivos de bajo consumo: al ser un modelo VITS "medium" empaquetado en ONNX, es adecuado para Raspberry Pi u otros SBC con recursos limitados.
- Generación de contenido de audio para pruebas y prototipos: creación de clips de voz en polaco para doblaje preliminar o validación de interfaces conversacionales.
- Aplicaciones web con TTS en el navegador: uso de `phoonnx.js` para sintetizar voz polaca del lado del cliente sin enviar texto a un servidor.
- Automatización de anuncios en transporte público o comercios: reproducción de mensajes pregrabados dinámicamente en polaco con un modelo local y licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del repositorio (~0,1 GB) se espera que quepa holgadamente en GPU consumer e incluso en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con soporte ONNX Runtime debería ser suficiente.
- Compatibilidad con GPU consumer: previsiblemente sí (RTX 3060, RTX 4090, etc.), aunque no hay datos oficiales.
- Opciones de despliegue: `phoonnx` (Python), `ovos-tts-plugin-phoonnx` (OVOS/Mycroft), `phoonnx.js` (navegador). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| vits-pl_pl-mc_speech-medium-espeak (este) | VITS | pl-PL | MIT | ONNX | Empaquetado para phoonnx |
| Otras voces Piper `pl_PL` | VITS | pl-PL | MIT (upstream) | ONNX | Variantes de calidad/estilo dentro de piper-voices |
| Voces VITS de la colección Phoonnx | VITS | varios | MIT (segun upstream) | ONNX | Mismo pipeline de empaquetado |
| Modelos TTS comerciales en la nube | no disponible | multilingue | propietaria | API | No comparables en despliegue local |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo sintetiza polaco (`pl-PL`); no soporta otros idiomas.
- Requiere espeak-ng instalado para la fonemización; sin él, la calidad puede degradarse o fallar.
- Con el port `espyak` de espeak-ng, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, según advierte la model card.
- No es un modelo de lenguaje: no genera texto, no razona y no admite tool calling.
- Riesgo de alucinación no aplica en el sentido de LLM, pero sí puede producir pronunciaciones incorrectas ante texto no normalizado o fuera de dominio.
- La licencia MIT se hereda del proyecto upstream (`rhasspy/piper-voices`); conviene verificar las condiciones exactas del upstream antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica poca validación comunitaria.
- No se dispone de información sobre sesgos acústicos, cobertura de vocabulario ni robustez ante ruido o texto informal.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-pl_pl-mc_speech-medium-espeak
- Upstream (Piper voices): https://huggingface.co/rhasspy/piper-voices/tree/main/pl/pl_PL/mc_speech/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
