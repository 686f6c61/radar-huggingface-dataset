# Phoonnx/vits-yo-openbible-low-epitran

## Resumen

`vits-yo-openbible-low-epitran` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Mycroft AI para su motor Mimic 3 y empaquetado por Phoonnx en formato ONNX para su uso con la librería `phoonnx`. El modelo sintetiza audio en yoruba (`yo`) a partir de texto convertido previamente a fonemas IPA mediante Epitran.

El modelo resuelve el problema de la síntesis de voz en un idioma de bajos recursos como el yoruba, ofreciendo una alternativa ligera (repositorio de 0,1 GB) y ejecutable en local, sin dependencia de servicios en la nube. Su relevancia actual radica en que forma parte del ecosistema OVOS (OpenVoiceOS) y Mimic 3, lo que permite integrarlo en asistentes de voz de código abierto y en pipelines de TTS autoalojados.

La etiqueta `low` en el nombre indica que se trata de una variante de calidad reducida del conjunto de voces `openbible` de Mycroft, orientada a un menor coste computacional y tamaño de artefacto. El modelo no es un LLM ni un modelo multimodal: es un sistema TTS acústico puro que recibe fonemas y produce formas de onda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS, variacional con decoder adversarial) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada: secuencia de fonemas IPA, sin límite documentado) |
| Tipos de cuantizacion | no disponible (pesos exportados a ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | yoruba (`yo`) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas Epitran (alfabeto IPA) |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | `phoonnx` |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un encoder de texto, un prior variacional, un decoder generativo y un discriminador adversarial entrenado con pérdidas de reconstrucción y de matching temporal. El modelo original fue entrenado por Mycroft AI dentro del proyecto `mimic3-voices`, en la ruta `voices/yo/openbible_low`, presumiblemente sobre el corpus Open Bible en yoruba, aunque el número exacto de horas de audio y la composición detallada del dataset no están documentados en la información disponible.

La innovación principal de esta ficha no está en el entrenamiento sino en el empaquetado: Phoonnx exporta los pesos a ONNX para permitir inferencia portable en Python y en OVOS. El front-end de texto delega en `scriptconv`, que normaliza el texto y aplica el fonemizador `EpitranPhonemizer` (módulo `scriptconv.phonemizers.mul`, instalable con el extra `scriptconv[epitran]`) para convertir el texto yoruba en fonemas IPA que alimentan al modelo. No se documenta el uso de RLHF, DPO ni técnicas de decodificación especulativa.

## Capacidades

- Síntesis de voz (text-to-speech) monolingüe en yoruba a partir de texto en ese idioma.
- Conversión de texto a fonemas IPA mediante Epitran como paso previo obligatorio.
- Generación de audio en formato WAV mediante `voice.synthesize_wav`.
- Integración como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`) configurable vía `mycroft.conf`.
- Ejecución local en ONNX, sin necesidad de GPU ni servicios externos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- No es un modelo de propósito general: no genera texto ni código.

## Casos de uso

- Asistentes de voz autoalojados en yoruba: el modelo se integra en OVOS como módulo TTS mediante `ovos-tts-plugin-phoonnx`, permitiendo que un asistente doméstico responda en yoruba sin enviar texto a la nube.
- Lectura de textos y documentos en yoruba: dado un texto en `yo`, se fonemiza con Epitran y se sintetiza a WAV, útil para accesibilidad de personas con discapacidad visual en comunidades yorubáfonas.
- Señalización y anuncios automatizados: generación de avisos pregrabados o dinámicos en yoruba para transporte, comercio o administración pública, con bajo coste de infraestructura al ser un modelo de 0,1 GB.
- Contenido educativo y audiocontenido: producción de narraciones o material didáctico en yoruba para plataformas de aprendizaje de idiomas o preservación cultural.
- Investigación en TTS de bajos recursos: sirve como línea base ligera para comparar técnicas de fonemización (Epitran) y empaquetado ONNX en idiomas con pocos recursos.
- Pruebas de integración en pipelines de voz: al ser un artefacto pequeño, es adecuado para entornos de CI o prototipado rápido de sistemas de voz completos (ASR + TTS) en yoruba.
- Preservación lingüística: generación de audio sintético en yoruba para archivos y proyectos de documentación de la lengua.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; al ser un modelo VITS de variante `low` con repositorio de 0,1 GB, se espera que quepa holgadamente en memoria de CPU y en GPUs de gama baja, pero no se documentan cifras.
- GPU recomendadas: no disponibles; el modelo está empaquetado en ONNX y está pensado para ejecución en CPU.
- ¿Cabe en GPU de consumo? Sí, por tamaño (0,1 GB de repositorio), aunque no se especifican modelos concretos.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplican a TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano repo | Licencia | Formato |
|---|---|---|---|---|---|
| `Phoonnx/vits-yo-openbible-low-epitran` | VITS | yoruba | 0,1 GB | CC-BY-SA-4.0 | ONNX |
| Otras voces `mimic3-voices` de Mycroft (p. ej. `openbible` en otros idiomas) | VITS | varios | no disponible | CC-BY-SA-4.0 (según upstream) | ONNX / Mimic3 |
| Modelos TTS multilingües comerciales (p. ej. APIs en la nube) | no disponible | multilingüe | no aplica | propietaria | API |

No se dispone de datos de rendimiento comparativo (MOS, latencia) en la información proporcionada.

## Limitaciones y advertencias

- Modelo monolingüe: solo sintetiza yoruba; el texto de entrada debe estar en `yo` y pasar por Epitran, por lo que texto en otros idiomas o con caracteres no cubiertos puede producir fonemas incorrectos.
- Variante `low`: la etiqueta indica calidad reducida frente a otras variantes del mismo corpus; la fidelidad acústica y la naturalidad pueden ser limitadas.
- Dependencia del front-end: requiere `scriptconv[epitran]` y el fonemizador Epitran; un fallo en la normalización o fonemización afecta directamente a la salida de audio.
- Licencia CC-BY-SA-4.0: permite uso comercial, pero obliga a atribuir y a compartir las obras derivadas bajo la misma licencia (copyleft). Conviene revisar las implicaciones si se integra en productos propietarios.
- No hay datos publicados de sesgos, tasas de alucinación acústica ni evaluación subjetiva (MOS), por lo que no se puede garantizar calidad en producción sin validación propia.
- El modelo no genera texto ni razona: no debe confundirse con un LLM; su única salida es audio.
- El repositorio tiene muy pocas descargas (17) y ningún like, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-yo-openbible-low-epitran
- Upstream (Mycroft AI, mimic3-voices): https://github.com/MycroftAI/mimic3-voices/tree/master/voices/yo/openbible_low
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio mimic3-voices: https://github.com/MycroftAI/mimic3-voices
