# Phoonnx/vits-de_de-thorsten-low-mycroft_ai-gruut

## Resumen

`vits-de_de-thorsten-low-mycroft_ai-gruut` es un modelo de síntesis de voz (text-to-speech) en alemán, basado en la arquitectura VITS y desarrollado originalmente por Mycroft AI para su motor Mimic 3. Phoonnx lo redistribuye empaquetado en formato ONNX para su librería de TTS homónima, lo que permite ejecutarlo en Python y en el ecosistema OVOS sin depender del stack original de Mimic 3. El modelo toma como entrada fonemas generados por gruut en alfabeto IPA y produce audio de voz sintetizada en alemán estándar (`de-DE`).

Se trata de un modelo ligero: el repositorio completo ocupa aproximadamente 0,1 GB, lo que lo sitúa en la categoría de voces TTS de baja huella, aptas para despliegue en dispositivos con recursos limitados o en asistentes de voz embebidos. La variante `thorsten_low` corresponde a la voz alemana de Thorsten, una de las voces comunitarias más utilizadas en el ecosistema Mimic 3, en su configuración de menor coste computacional.

Su relevancia actual radica en la disponibilidad de un modelo TTS alemán con licencia CC-BY-SA-4.0, empaquetado en ONNX y con integración directa en OVOS, lo que facilita su uso en asistentes de voz open source sin necesidad de infraestructura GPU dedicada. No obstante, la información pública disponible es escasa: no se han publicado métricas de calidad, datos de entrenamiento detallados ni benchmarks objetivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | aleman (`de`, `de-DE`) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de síntesis de voz que combina un encoder de texto, un prior variacional condicionado por alineamiento monotónico, un decoder generativo basado en flujos normalizadores y un discriminador adversarial multiperiodo entrenado de forma conjunta. El resultado es un modelo que genera formas de onda directamente a partir de fonemas, sin necesidad de un vocoder separado. En esta variante, la entrada textual se convierte a fonemas IPA mediante gruut antes de alimentar el modelo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, la duración total de audio utilizada ni si se aplicaron técnicas de ajuste como RLHF o DPO (no aplicables habitualmente a TTS). La model card únicamente indica la procedencia del modelo original en el repositorio de Mycroft AI y el pipeline de fonemización empleado. La variante `low` sugiere una configuración de menor capacidad orientada a inferencia rápida, pero no se documentan los detalles arquitectónicos concretos (número de capas, dimensión de canales, etc.).

## Capacidades

- Síntesis de voz (text-to-speech) en alemán estándar (`de-DE`) a partir de texto escrito.
- Conversión de texto a fonemas IPA mediante gruut (`GruutPhonemizer` de `scriptconv.phonemizers.mul`).
- Generación de audio en formato WAV mediante la API `voice.synthesize_wav(text, wav_file)`.
- Integración como plugin TTS en OVOS (`ovos-tts-plugin-phoonnx`), seleccionable mediante configuración `mycroft.conf`.
- Ejecución sobre runtime ONNX, sin dependencia de PyTorch en inferencia.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio de entrada ni modo thinking: es exclusivamente un modelo TTS.
- No se documentan capacidades multilingües más allá del alemán.

## Casos de uso

- Asistentes de voz embebidos en OVOS: el modelo se integra como plugin TTS nativo (`ovos-tts-plugin-phoonnx`) y permite dotar de voz alemana a un asistente doméstico sin GPU, gracias a su reducido tamaño (~0,1 GB) y ejecución ONNX.
- Síntesis de voz en dispositivos de borde (Raspberry Pi, routers, altavoces inteligentes): la variante `low` está pensada para minimizar el coste computacional, lo que la hace adecuada para hardware con CPU modesta.
- Lectura de notificaciones y avisos en alemán: integrable en sistemas de megafonía o domótica que necesiten convertir texto dinámico en audio sin depender de servicios cloud.
- Generación de audiolibros o contenido educativo en alemán a partir de texto plano, siempre que se respete la licencia CC-BY-SA-4.0 en las obras derivadas.
- Pruebas de integración en pipelines de TTS open source: sirve como voz de referencia para validar el funcionamiento de phoonnx y scriptconv en alemán antes de desplegar otras voces.
- Accesibilidad: conversión de texto a voz para lectores de pantalla o interfaces de accesibilidad en aplicaciones de habla alemana, con la ventaja de funcionar de forma local y sin conexión.
- Prototipado rápido de agentes conversacionales en alemán: al ser un modelo ligero y con API Python sencilla, permite iterar sobre diálogos sin coste de API externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del repositorio (~0,1 GB) se estima un consumo de memoria muy reducido, del orden de cientos de MB, aunque no se documenta una cifra exacta.
- GPU recomendadas: no se especifican; el modelo está empaquetado en ONNX y diseñado para ejecución en CPU, por lo que no requiere GPU dedicada.
- Compatibilidad con GPU de consumo: previsiblemente sí en cualquier GPU moderna (RTX 3060, RTX 4090, etc.), aunque no se documenta rendimiento específico.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, runtime ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamaño | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `Phoonnx/vits-de_de-thorsten-low-mycroft_ai-gruut` | VITS | de-DE | ~0,1 GB | CC-BY-SA-4.0 | ONNX | Variante `low` de la voz Thorsten de Mimic 3 |
| Otras voces VITS de la colección Phoonnx | VITS | varios | variable | según modelo | ONNX | Colección `Phoonnx/vits` en Hugging Face |
| Voces originales de MycroftAI/mimic3-voices | VITS | varios | variable | según voz | varios | Repositorio upstream de Mycroft AI |

No se dispone de datos de rendimiento comparativo entre estas alternativas. La comparativa se limita a parámetros estructurales y de licencia, ya que no se han publicado métricas objetivas para este modelo.

## Limitaciones y advertencias

- Información pública muy escasa: no se documentan parámetros, datos de entrenamiento ni métricas de calidad, lo que dificulta evaluar su idoneidad en producción.
- Licencia CC-BY-SA-4.0: permite uso comercial, pero obliga a compartir las obras derivadas bajo la misma licencia y a atribuir al autor original (Mycroft AI). Es necesario revisar las implicaciones para productos propietarios que incorporen audio generado.
- Solo soporta alemán (`de-DE`); no es multilingüe.
- Al ser un modelo TTS, puede presentar artefactos de pronunciación, entonación o prosodia en textos con nombres propios, siglas, números o palabras extranjeras, ya que la fonemización depende de gruut.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí puede producir audio ininteligible o mal pronunciado en entradas fuera de distribución.
- No se documentan sesgos específicos, pero al derivar de una voz concreta (Thorsten) puede no representar la diversidad de acentos o registros del alemán.
- La variante `low` prioriza velocidad sobre calidad; no se recomienda para aplicaciones que exijan naturalidad máxima.
- Dependencia del ecosistema phoonnx/scriptconv/OVOS: fuera de ese stack, la integración requiere trabajo adicional.
- Fecha de creación del repositorio (2026-11-14) y número de descargas (19) sugieren un modelo muy reciente y con poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-de_de-thorsten-low-mycroft_ai-gruut
- Repositorio upstream (Mycroft AI): https://github.com/MycroftAI/mimic3-voices/tree/master/voices/de_DE/thorsten_low
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
