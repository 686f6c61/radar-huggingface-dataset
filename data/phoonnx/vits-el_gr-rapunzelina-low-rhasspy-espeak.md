# Phoonnx/vits-el_gr-rapunzelina-low-rhasspy-espeak

## Resumen

vits-el_gr-rapunzelina-low-rhasspy-espeak es un modelo de síntesis de voz (text-to-speech) de arquitectura VITS, empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo original procede de Rhasspy, concretamente de la voz `el_GR/rapunzelina/low` del repositorio piper-voices, y se distribuye con licencia MIT. Está especializado en griego moderno (código `el`, variante `el-GR`) y su entrada de texto son fonemas espeak en alfabeto IPA.

La relevancia de este paquete es de integración más que de investigación: convierte una voz Piper ya existente en un artefacto consumible desde la librería phoonnx, tanto en Python como en el asistente OVOS mediante el plugin `ovos-tts-plugin-phoonnx`. El repositorio ocupa aproximadamente 0,1 GB y se etiqueta como variante "low", lo que en la nomenclatura de Piper indica un modelo de baja calidad y bajo coste computacional, pensado para ejecución en tiempo real en hardware modesto.

No se trata de un modelo de lenguaje ni de un sistema multimodal: es un sintetizador acústico puro que transforma fonemas en forma de onda. No hay datos publicados sobre número de parámetros, corpus de entrenamiento ni métricas de calidad en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (síntesis texto-a-voz condicional de extremo a extremo, con codificador de texto, prior normalizing flow, decodificador y discriminador adversarial) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada por frase; no se documenta límite explícito) |
| Tipos de cuantizacion | no disponible (pesos ONNX; variante "low" de Piper) |
| Idiomas soportados | griego moderno (`el`, `el-GR`) |
| Licencia | MIT |
| Formato de pesos | ONNX (empaquetado para la librería phoonnx) |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamaño del repositorio | ~0,1 GB |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz de extremo a extremo que combina un codificador de texto, un prior condicional basado en normalizing flows, un decodificador generativo y un discriminador entrenado de forma adversarial, junto con una alineación monotónica latente aprendida (sin necesidad de alineamientos fonema-a-fotograma explícitos). El modelo genera directamente la forma de onda a partir de la secuencia de fonemas, lo que elimina la necesidad de un vocoder separado en tiempo de inferencia.

En este caso, el modelo no se ha entrenado desde cero por parte de Phoonnx: es un reempaquetado del checkpoint original de Rhasspy, voz `rapunzelina` en calidad `low` para griego (`el_GR`). No se dispone en la información proporcionada de datos sobre el corpus de entrenamiento, el número de horas de audio, la composición del dataset ni si se aplicaron etapas de ajuste fino o preferencias. La variante "low" de Piper implica típicamente una reducción de tamaño y calidad respecto a las variantes "medium" y "high" del mismo proyecto, orientada a latencia baja y despliegue en dispositivos con recursos limitados.

La innovación técnica relevante aquí es el pipeline de integración: phoonnx delega la normalización de texto y la fonemización en la librería scriptconv, usando `EspeakPhonemizer` del módulo `scriptconv_copyleft.phonemizers.mul` (extra `scriptconv[espeak]`). La fonemización se realiza con el binario espeak-ng o, alternativamente, con el port espyak, que puede producir discrepancias fonéticas y errores de pronunciación en algunas palabras.

## Capacidades

- Síntesis de voz a partir de texto en griego moderno (`el-GR`), con salida en fichero WAV.
- Generación de audio a partir de fonemas espeak en alfabeto IPA, lo que permite control fino de la pronunciación si se pre-fonemiza manualmente.
- Ejecución sobre ONNX Runtime, lo que habilita inferencia en CPU sin dependencias de CUDA.
- Integración nativa con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, seleccionable en `mycroft.conf`.
- Ejecución en navegador a través de phoonnx.js, con demo pública en tigregotico.pt/demo.
- No soporta tool calling, razonamiento multi-paso, visión, audio de entrada ni modo "thinking": es exclusivamente un sintetizador TTS.
- Multilingüismo: limitado a griego; no se documentan otras lenguas en este paquete.

## Casos de uso

- Asistentes de voz en griego sobre OVOS: el plugin `ovos-tts-plugin-phoonnx` permite seleccionar la voz `piper/el_GR-rapunzelina-low` en `mycroft.conf` y obtener respuestas habladas en griego con latencia baja gracias a la variante "low" y a la ejecución ONNX en CPU.
- Lectura de notificaciones y alertas en aplicaciones de domótica: al ser un modelo de ~0,1 GB y ejecutable en CPU, puede desplegarse en una Raspberry Pi o en un servidor doméstico para anunciar eventos en griego sin depender de servicios en la nube.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla o herramientas de lectura de documentos en griego, generando audio por frase mediante `voice.synthesize_wav(text, wav_file)`.
- Generación de audiolibros o podcasts de bajo coste: la API por frases permite iterar sobre párrafos y concatenar los WAV resultantes en un pipeline de postproducción.
- Pruebas de integración continua de sistemas de voz: al ser un artefacto ONNX determinista y ligero, sirve como voz de referencia en tests automatizados de pipelines TTS en griego dentro de CI/CD.
- Prototipado de interfaces conversacionales en griego: permite validar flujos de diálogo y temporización de respuestas antes de invertir en una voz de mayor calidad ("medium" o "high") o en un servicio comercial.
- Síntesis controlada por fonemas: para aplicaciones de investigación fonética o de enseñanza de pronunciación, se puede alimentar el modelo con transcripciones IPA espeak-ng y comparar la salida con la pronunciación esperada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido habitual; el modelo corre sobre ONNX Runtime y puede ejecutarse en CPU. El repositorio completo ocupa ~0,1 GB, por lo que la huella en memoria es del orden de cientos de MB incluyendo el runtime.
- GPU recomendadas: no se documentan requisitos de GPU; al ser un modelo VITS de variante "low", está diseñado para CPU. Cualquier GPU compatible con ONNX Runtime (por ejemplo, series RTX o A100/H100) podría acelerar la inferencia, pero no hay cifras publicadas.
- ¿Cabe en GPU de consumo? Sí, con enorme holgura; el modelo es de tamaño muy reducido y no requiere aceleración dedicada.
- Opciones de despliegue: phoonnx (Python), `ovos-tts-plugin-phoonnx` (OVOS), phoonnx.js (navegador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- Latencia y throughput: no disponibles. La etiqueta "low" de Piper sugiere optimización para tiempo real en hardware modesto, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Calidad | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-el_gr-rapunzelina-low-rhasspy-espeak (este) | VITS | Griego (`el-GR`) | low | MIT | ONNX (phoonnx) | Hugging Face, 0 descargas |
| rhasspy/piper-voices `el_GR/rapunzelina/low` | VITS | Griego (`el-GR`) | low | MIT | Piper (ONNX original) | Hugging Face (upstream) |
| Otras voces Piper del mismo repositorio (p. ej. variantes medium/high de otros idiomas) | VITS | Según voz | medium/high | MIT | Piper / phoonnx | Hugging Face |
| Modelos TTS comerciales en la nube | no disponible | Muchos | Alta | Propietaria | API | Servicios gestionados |

No se dispone de datos de benchmarks ni de métricas de calidad (MOS, WER) para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Cobertura lingüística restringida a griego moderno; no es utilizable para castellano ni para otros idiomas sin un modelo distinto.
- La variante "low" de Piper prioriza velocidad y tamaño sobre calidad acústica; es esperable una naturalidad inferior a las variantes "medium" y "high".
- Dependencia de espeak-ng para la fonemización: si se usa el port espyak en lugar de espeak-ng, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, según advierte la propia model card.
- Riesgo de alucinación acústica: como todo TTS, puede producir artefactos, prosodia incorrecta o pronunciaciones erróneas en palabras fuera del dominio de entrenamiento; no se documentan métricas al respecto.
- Sesgos: no se documenta información sobre sesgos de género, acento o prosodia en la información disponible.
- Licencia MIT: permite uso comercial y modificación, pero conviene verificar la cadena de atribución al proyecto Piper/Rhasspy upstream.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema muy incipiente, sin validación comunitaria publicada.
- No apto para tareas de razonamiento, generación de texto, código ni visión; su uso está estrictamente limitado a síntesis de voz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-el_gr-rapunzelina-low-rhasspy-espeak
- Upstream Piper (voz original): https://huggingface.co/rhasspy/piper-voices/tree/main/el/el_GR/rapunzelina/low
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
