# Phoonnx/glowtts-de_de-rebecca_braunert_plunkett

## Resumen

Glow-TTS para alemán (variante `de-DE`) empaquetado en formato ONNX por Phoonnx, a partir del modelo original publicado por Rhasspy dentro del proyecto Larynx v1.0. Se trata de un sistema de síntesis de voz (text-to-speech) que convierte texto en un espectrograma mediante la arquitectura Glow-TTS, que posteriormente es transformado en audio por el vocoder HiFi-GAN `hifigan-multi-vctk-small`. El modelo no es de propósito general: es un componente de un pipeline TTS concreto, con una única voz y un único idioma.

El modelo procede de la voz `de-de_rebecca_braunert_plunkett` de Larynx, un conjunto de voces TTS de código abierto orientado a asistentes de voz y sistemas de domótica (OVOS/Mycroft). Phoonnx lo redistribuye como artefacto ONNX listo para su uso con su librería `phoonnx`, lo que elimina la necesidad de reconstruir el entorno original de Larynx y facilita el despliegue en Python y en el ecosistema OVOS.

Su relevancia actual es acotada pero práctica: ofrece TTS alemán ligero (repo de 0,1 GB), ejecutable en CPU, con integración directa en asistentes de voz autoalojados. No compite en calidad con sistemas neuronales modernos de gran escala, pero cubre el nicho de síntesis local, offline y de baja huella de recursos. La licencia no está registrada en el repositorio, lo que constituye un caveat importante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (modelo acústico) + HiFi-GAN (vocoder `hifigan-multi-vctk-small`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS por frase; sin ventana de contexto definida) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | alemán (`de-DE`) |
| Licencia | `other` (sin licencia registrada; consultar el release upstream de Larynx) |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Vocoder | `hifigan-multi-vctk-small` (Phoonnx) |
| Tamaño del repositorio | 0,1 GB |
| Librería | `phoonnx` |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de síntesis de voz basado en normalizing flows que modela directamente la alineación entre texto y espectrograma sin necesidad de un aligner externo entrenado por separado, a diferencia de los sistemas tipo Tacotron con attention. Genera un mel-espectrograma a partir de fonemas de entrada; en este caso, los fonemas provienen del fonemizador gruut en alfabeto IPA, gestionado por la librería `scriptconv` de Phoonnx. La señal de audio final la produce un vocoder HiFi-GAN independiente (`hifigan-multi-vctk-small`), que Phoonnx descarga junto con la voz.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, ni sobre si se aplicaron técnicas de RLHF o ajuste por preferencias (poco habituales en TTS de esta generación). El modelo original proviene de Rhasspy Larynx v1.0, un proyecto centrado en voces TTS multilingües para asistentes de voz offline. La innovación principal del empaquetado es la conversión a ONNX y la integración con el pipeline de Phoonnx/scriptconv, que estandariza la normalización de texto y la fonemización.

## Capacidades

- Síntesis de voz (text-to-speech) en alemán `de-DE` a partir de texto plano.
- Generación de mel-espectrogramas mediante Glow-TTS y conversión a audio WAV mediante HiFi-GAN.
- Fonemización de entrada mediante gruut (IPA), con normalización de texto a cargo de `scriptconv`.
- Integración como plugin TTS en OVOS (`ovos-tts-plugin-phoonnx`) y uso programático en Python.
- Ejecución offline, sin dependencia de servicios en la nube.
- Una única voz predefinida (`rebecca_braunert_plunkett`); no soporta clonación de voz ni cambio de hablante.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de los LLM: es exclusivamente un modelo TTS.
- No soporta visión, audio de entrada ni modo "thinking".

## Casos de uso

- Asistentes de voz autoalojados: integración como motor TTS en OVOS/Mycroft para respuestas habladas en alemán, configurando el plugin `ovos-tts-plugin-phoonnx` en `mycroft.conf`; adecuado por su ejecución local y su bajo consumo de recursos.
- Domótica y sistemas embebidos: generación de avisos y confirmaciones por voz en dispositivos con recursos limitados, gracias al tamaño reducido del repo (0,1 GB) y a la inferencia ONNX en CPU.
- Accesibilidad: lectura en voz alta de textos y notificaciones para usuarios germanohablantes con discapacidad visual, en entornos sin conexión a internet.
- Prototipado de pipelines TTS: uso como componente base para experimentar con normalización de texto y fonemización (scriptconv/gruut) antes de migrar a voces de mayor calidad.
- Generación de audio para pruebas automatizadas: creación de locuciones sintéticas en alemán para tests de sistemas de reconocimiento de voz o de diálogo.
- Aplicaciones de kiosco o terminales sin conectividad: síntesis de mensajes dinámicos en alemán en entornos donde no se permite enviar texto a servicios externos por privacidad.
- Educación e investigación: referencia para comparar arquitecturas Glow-TTS frente a sistemas TTS más recientes en tareas de síntesis en alemán.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con cifras publicadas; por el tamaño del repo (0,1 GB) y el uso de ONNX, es plausible la ejecución en CPU, pero no se confirma en la documentación.
- GPU recomendadas: no disponible. No se documentan requisitos de GPU.
- Compatibilidad con GPU de consumo: no confirmada; el diseño ONNX y el tamaño reducido sugieren viabilidad en hardware modesto, pero no hay datos oficiales.
- Opciones de despliegue: librería `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| glowtts-de_de-rebecca_braunert_plunkett (este) | Glow-TTS + HiFi-GAN | de-DE | no aplica | `other` (sin registrar) | ONNX | Hugging Face (Phoonnx) |
| Otras voces Larynx v1.0 (Rhasspy) | Glow-TTS + HiFi-GAN | varios | no aplica | según release upstream | tar.gz original | GitHub Rhasspy |
| Otras voces Glow-TTS empaquetadas por Phoonnx | Glow-TTS + HiFi-GAN | varios | no aplica | `other` | ONNX | Colección Glow-TTS de Phoonnx |
| Sistemas TTS neuronales modernos (p. ej. VITS, FastSpeech 2) | no disponible en esta ficha | varios | no aplica | variable | variable | variable |

No se dispone de datos de rendimiento comparativo (MOS, latencia) en la información proporcionada.

## Limitaciones y advertencias

- Licencia no registrada (`other`): es imprescindible verificar la licencia del release upstream de Larynx antes de cualquier uso, especialmente comercial.
- Una sola voz y un solo idioma (`de-DE`): no admite otros idiomas ni cambio de hablante.
- Calidad de síntesis propia de Glow-TTS con HiFi-GAN small: inferior a la de sistemas neuronales de gran escala actuales; puede presentar artefactos y prosodia limitada.
- Dependencia de la fonemización gruut: errores en la normalización de texto o en la fonemización afectan directamente a la pronunciación.
- Sin datos publicados de benchmarks, latencia ni requisitos de hardware: la evaluación de rendimiento debe hacerse empíricamente.
- Riesgo de alucinación no aplica en el sentido de los LLM, pero sí puede producir pronunciaciones incorrectas o ininteligibles ante texto no normalizado (números, siglas, nombres propios).
- No apta para tareas de razonamiento, generación de texto, código, tool calling ni agentes.
- Empaquetado de terceros (Phoonnx): la responsabilidad sobre el modelo original recae en Rhasspy/Larynx.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-de_de-rebecca_braunert_plunkett
- Release upstream de Larynx v1.0: https://github.com/rhasspy/larynx/releases/download/v1.0/de-de_rebecca_braunert_plunkett-glow_tts.tar.gz
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Vocoder HiFi-GAN: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Colección Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
