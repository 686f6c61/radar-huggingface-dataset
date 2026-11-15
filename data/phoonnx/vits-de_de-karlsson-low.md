# Phoonnx/vits-de_de-karlsson-low

## Resumen

`vits-de_de-karlsson-low` es un modelo de síntesis de voz (text-to-speech) en alemán estándar (`de-DE`) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y reempaquetado por Phoonnx en formato ONNX para su uso con la librería `phoonnx`. El modelo toma texto en alemán, lo convierte a fonemas mediante `espeak-ng` (alfabeto IPA) y genera audio de forma extremo a extremo, sin necesidad de un pipeline separado de alineamiento o vocoder.

La variante `low` indica una configuración de calidad reducida orientada a eficiencia: el repositorio ocupa aproximadamente 0,1 GB, lo que lo sitúa en el rango de modelos ligeros aptos para ejecución en CPU y dispositivos con recursos limitados. Es relevante para asistentes de voz embebidos, sistemas domóticos y aplicaciones OVOS/Mycroft que necesitan TTS local en alemán sin dependencias de servicios en la nube.

El modelo se publica bajo licencia MIT y se integra en el ecosistema Phoonnx, que incluye el plugin `ovos-tts-plugin-phoonnx` y la variante JavaScript `phoonnx.js` para ejecución en navegador. No es un modelo de lenguaje general: su única función es la síntesis de voz a partir de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS, variacional con alignamiento monotónico) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada por frase) |
| Tipos de cuantización | no disponible (pesos ONNX; variante `low` de calidad reducida) |
| Idiomas soportados | alemán (`de-DE`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamaño del repositorio | ~0,1 GB |
| Pipeline | text-to-speech |
| Librería | phoonnx |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura generativa que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normales y un discriminador adversarial, todo entrenado de forma conjunta. Esto permite generar waveforms directamente desde fonemas sin un vocoder separado, con un alineamiento monotónico aprendido entre texto y audio.

Este modelo concreto procede de `rhasspy/piper-voices/de/de_DE/karlsson/low`, la colección de voces Piper de Rhasspy. La variante `low` corresponde a una configuración de menor calidad y tamaño dentro de la familia Piper, pensada para inferencia rápida en hardware modesto. No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o fine-tuning adicional; la model card no los detalla. La innovación técnica relevante es el empaquetado en ONNX para `phoonnx`, que permite ejecución portable en Python, OVOS y navegador (vía `phoonnx.js`).

## Capacidades

- Síntesis de voz en alemán estándar (`de-DE`) a partir de texto.
- Conversión de texto a fonemas IPA mediante `espeak-ng` (o el port `espyak` incluido en el extra `phoonnx[espeak]`).
- Generación de audio WAV directamente desde frases de entrada.
- Integración con asistentes OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador mediante `phoonnx.js` con entrada espeak o unicode.
- No soporta tool calling, agentes, razonamiento multi-paso ni visión: es exclusivamente un modelo TTS.
- No soporta otros idiomas distintos del alemán.

## Casos de uso

- Asistentes de voz domóticos locales: el modelo puede integrarse en OVOS/Mycroft para responder en alemán sin enviar texto a servicios externos, gracias a su tamaño reducido (~0,1 GB) y ejecución ONNX en CPU.
- Lectura de notificaciones y alertas en alemán: útil en sistemas de monitorización o domótica que necesitan verbalizar mensajes cortos con baja latencia.
- Síntesis en dispositivos embebidos: su variante `low` y formato ONNX permiten desplegarlo en Raspberry Pi u otros SBC para interfaces de voz offline.
- Accesibilidad: lectura de texto en pantalla para usuarios germanoparlantes con discapacidad visual, ejecutándose localmente sin conexión.
- Generación de audiolibros o contenido narrado por lotes: procesamiento por frases con `voice.synthesize_wav()` para producir WAVs de forma automatizada.
- Pruebas y prototipado de pipelines TTS: al ser un modelo ligero y con licencia MIT, es adecuado para validar arquitecturas de voz antes de migrar a voces de mayor calidad.
- Demos web interactivas: mediante `phoonnx.js` se puede ofrecer síntesis en alemán directamente en el navegador sin backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser un modelo ONNX de ~0,1 GB, es probable que quepa en memoria de CPU sin GPU dedicada, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer moderna debería ser suficiente, aunque no se especifica.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del repositorio, aunque no se documenta oficialmente.
- Opciones de despliegue: `phoonnx` (Python), `ovos-tts-plugin-phoonnx` (OVOS/Mycroft), `phoonnx.js` (navegador). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamaño | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| `Phoonnx/vits-de_de-karlsson-low` | VITS | de-DE | ~0,1 GB | MIT | ONNX | Hugging Face |
| Otras voces Piper `de_DE` (p. ej. `thorsten`, `eva_k`) | VITS | de-DE | variable (low/medium/high) | MIT (según Piper) | ONNX | Hugging Face (rhasspy/piper-voices) |
| Modelos TTS multilingües tipo XTTS/Coqui | no disponible en la información | multilingüe | varios GB | varía | varios | Hugging Face |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparación se limita a parámetros estructurales y disponibilidad.

## Limitaciones y advertencias

- Solo soporta alemán (`de-DE`); no es multilingüe.
- La variante `low` prioriza eficiencia sobre calidad, por lo que la naturalidad y prosodia serán inferiores a variantes `medium` o `high`.
- Depende de `espeak-ng` para la fonemización; si se usa el port `espyak`, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras (advertencia explícita de la model card).
- Riesgo de errores de pronunciación en palabras extranjeras, siglas o números poco comunes, al depender de la normalización de `scriptconv` y `espeak-ng`.
- No se documentan sesgos específicos, pero al ser un modelo entrenado sobre una voz concreta (karlsson), la identidad vocal es fija y no configurable.
- Licencia MIT: permite uso comercial, pero se recomienda verificar la licencia upstream en `rhasspy/piper-voices`.
- No apto para tareas de razonamiento, generación de texto ni comprensión; su uso fuera de TTS no tiene sentido.
- No se han publicado benchmarks objetivos de calidad (MOS, WER) en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-de_de-karlsson-low
- Upstream (Piper voices, de_DE/karlsson/low): https://huggingface.co/rhasspy/piper-voices/tree/main/de/de_DE/karlsson/low
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
