# Phoonnx/vits-pt_br-jeff-medium-espeak

## Resumen

`vits-pt_br-jeff-medium-espeak` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy como parte del proyecto Piper y reempaquetado por Phoonnx en formato ONNX para su uso con la librería `phoonnx`. El modelo genera audio a partir de texto en portugués de Brasil (`pt-BR`) y constituye una voz concreta dentro del catálogo de voces Piper disponibles para esa lengua.

El modelo resuelve el problema de la síntesis de voz local y ligera: al estar exportado a ONNX y tener un tamaño de repositorio de aproximadamente 0,1 GB, está pensado para ejecutarse en entornos sin GPU dedicada, como asistentes de voz embebidos, sistemas domésticos o aplicaciones de escritorio. Su integración con OVOS (Open Voice OS) a través del plugin `ovos-tts-plugin-phoonnx` lo orienta claramente al ecosistema de asistentes de voz de código abierto.

La relevancia de esta ficha es acotada: no se trata de un modelo de lenguaje generativo sino de un sintetizador acústico especializado, con un único idioma, una única voz (etiquetada como `jeff`) y sin datos públicos de benchmarks ni métricas de calidad. Su interés radica en la disponibilidad de una voz Piper empaquetada para `phoonnx`, no en capacidades generales de IA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada de texto por frase) |
| Tipos de cuantización | no disponible (pesos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | portugués de Brasil (`pt-BR`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Tamaño del repositorio | ~0,1 GB |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Front-end fonético | `EspeakPhonemizer` de `scriptconv_copyleft.phonemizers.mul` |
| Autor original | Rhasspy (proyecto Piper) |
| Empaquetado | Phoonnx |
| Librería | `phoonnx` |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decoder generativo basado en flujos normalizadores y un discriminador adversarial multiperiodo para el entrenamiento. El modelo produce audio directamente a partir de fonemas, sin necesidad de un vocoder separado en tiempo de inferencia. Esta voz concreta corresponde a la variante `medium` del catálogo Piper para `pt_BR`, es decir, un compromiso entre calidad y tamaño dentro de las tres tallas habituales de Piper (`low`, `medium`, `high`).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el corpus de habla utilizado para la voz `jeff`, ni si se aplicaron técnicas de alineamiento o ajuste posteriores. El modelo card original de Rhasspy no detalla estos extremos en la información proporcionada. La innovación técnica relevante aquí no está en el entrenamiento sino en el empaquetado: la exportación a ONNX y la integración con `phoonnx` y `scriptconv` para la normalización textual y la fonemización vía espeak-ng.

## Capacidades

- Síntesis de voz a partir de texto en portugués de Brasil (`pt-BR`).
- Generación de audio en formato WAV mediante `synthesize_wav`.
- Fonemización basada en espeak-ng con alfabeto IPA; requiere espeak-ng instalado o el extra `phoonnx[espeak]` (port espyak).
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Ejecución en navegador mediante `phoonnx.js` (con entrada espeak o unicode).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking: es exclusivamente un sintetizador TTS.
- No es multilingüe: únicamente portugués de Brasil.

## Casos de uso

- Asistentes de voz domésticos con OVOS: la voz se selecciona en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx`, permitiendo respuestas habladas en portugués de Brasil en un asistente local sin dependencia de la nube.
- Lectura de notificaciones y alertas en aplicaciones de escritorio: al ser un modelo ONNX de ~0,1 GB, puede empaquetarse dentro de una aplicación de escritorio y sintetizar mensajes cortos en tiempo de ejecución sin GPU.
- Sistemas de accesibilidad para usuarios lusohablantes: conversión de texto de interfaz, mensajes de error o contenido de pantalla a voz para lectores de pantalla ligeros en portugués de Brasil.
- Automatización de avisos en kioscos o terminales de autoservicio: frases predefinidas o dinámicas sintetizadas localmente en dispositivos de bajo consumo, sin enviar texto a servicios externos.
- Prototipado de interfaces conversacionales en portugués: generación rápida de audio de prueba para validar flujos de diálogo antes de contratar una voz comercial de mayor calidad.
- Síntesis en el navegador con `phoonnx.js`: demos y aplicaciones web que necesitan reproducir texto en `pt-BR` sin backend, usando la entrada espeak o unicode que ofrece la librería JavaScript.
- Integración en pipelines de generación de contenido: narración de artículos o textos breves en portugués de Brasil en entornos por lotes, donde el coste por carácter es nulo al ejecutarse en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model card no incluye métricas de calidad (MOS, CMOS, WER de síntesis), latencia ni throughput. Tampoco se dispone de comparaciones numéricas con otras voces Piper o con sintetizadores comerciales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (~0,1 GB en ONNX), la inferencia es viable en CPU sin GPU dedicada.
- GPU recomendadas: no se especifican; el modelo está diseñado para ejecución en CPU. Cualquier GPU con soporte ONNX Runtime podría acelerar la inferencia, pero no hay datos publicados.
- Cabe en GPU de consumo: sí, con margen amplio, dado el tamaño del modelo; también en dispositivos embebidos y Raspberry Pi (uso habitual de las voces Piper).
- Opciones de despliegue: `phoonnx` (Python), `ovos-tts-plugin-phoonnx` (OVOS), `phoonnx.js` (navegador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamaño | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `vits-pt_br-jeff-medium-espeak` (este) | VITS | pt-BR | ~0,1 GB | MIT | ONNX | Voz Piper empaquetada para `phoonnx` |
| Otras voces Piper `pt_BR` (p. ej. `faber`, `edresson`) | VITS | pt-BR | variable según talla | MIT (upstream) | ONNX | Mismo origen Rhasspy; distinta voz y talla |
| Sintetizadores comerciales en la nube (p. ej. servicios TTS de grandes proveedores) | no disponible | multilingüe | no aplica | propietaria | API | Mayor calidad potencial, pero dependencia de red y coste por uso |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de un solo idioma (`pt-BR`) y una sola voz (`jeff`); no admite cambio de hablante ni de registro.
- La fonemización depende de espeak-ng; con el port espyak (`phoonnx[espeak]`) algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, según advierte el propio model card.
- No hay métricas publicadas de calidad (MOS, inteligibilidad) ni de sesgos; no es posible evaluar su idoneidad para producción sin pruebas propias.
- Riesgo de pronunciación incorrecta en palabras con grafías ambiguas, extranjerismos o nombres propios, al depender de reglas de espeak-ng y no de un lexicón específico.
- Licencia MIT declarada por el upstream (Rhasspy); se recomienda verificar los términos del repositorio original `rhasspy/piper-voices` antes de uso comercial, ya que la información disponible solo cita la declaración del model card.
- El modelo no genera texto ni razona: cualquier expectativa de uso como LLM es incorrecta.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-pt_br-jeff-medium-espeak
- Upstream (Piper voices, pt_BR/jeff/medium): https://huggingface.co/rhasspy/piper-voices/tree/main/pt/pt_BR/jeff/medium
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
