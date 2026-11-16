# Phoonnx/glowtts-sv_se-talesyntese-gruut

## Resumen

GlowTTS-sv_se-talesyntese-gruut es un modelo de síntesis de voz (text-to-speech) para sueco de Suecia (`sv-SE`) basado en la arquitectura Glow-TTS. No es un modelo entrenado por Phoonnx, sino un empaquetado en formato ONNX del modelo original publicado por Rhasspy dentro del proyecto Larynx v1.0. Phoonnx se limita a convertirlo y distribuirlo para que pueda ejecutarse con su librería de inferencia TTS, también llamada phoonnx.

El modelo resuelve la generación de audio a partir de texto en sueco: recibe fonemas del idioma en alfabeto IPA (procesados mediante el fonemizador gruut) y produce un espectrograma que posteriormente se convierte en onda de audio mediante el vocoder HiFi-GAN multi-VCTK small, descargado automáticamente junto con la voz. El repositorio ocupa aproximadamente 0,1 GB, lo que refleja un modelo compacto pensado para inferencia ligera en CPU o GPU modesta.

Su relevancia es limitada y muy específica: cubre un idioma con poca oferta de TTS open source (sueco) y se integra en el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`. No es un modelo de propósito general ni compite con los grandes sistemas TTS neuronales actuales; es una pieza de infraestructura para asistentes de voz locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (modelo acústico generativo basado en normalizing flows) con vocoder HiFi-GAN multi-VCTK small |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; el repositorio no detalla variantes) |
| Idiomas soportados | sueco de Suecia (`sv-SE`) |
| Licencia | `other` (sin licencia registrada; el autor remite a la release upstream de Rhasspy) |
| Formato de pesos | ONNX (librería phoonnx) |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de síntesis de voz no autorregresivo que combina normalizing flows con un mecanismo de alineamiento monotónico (MAS, monotonic alignment search) para aprender la correspondencia entre fonemas y frames de espectrograma sin necesidad de alineamientos externos. El modelo genera un mel-espectrograma a partir de la secuencia de fonemas, y un vocoder separado (en este caso HiFi-GAN multi-VCTK small) transforma ese espectrograma en audio.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o ajuste fino. El modelo procede del release v1.0 de Larynx de Rhasspy, un proyecto de TTS local orientado a asistentes de voz. La innovación relevante aquí no es arquitectónica sino de empaquetado: Phoonnx convierte los pesos originales a ONNX para permitir inferencia portable, y delega la normalización de texto y la fonemización en la librería `scriptconv` con el fonemizador gruut.

## Capacidades

- Síntesis de voz a partir de texto en sueco de Suecia (`sv-SE`), con salida en formato WAV.
- Conversión de texto a fonemas IPA mediante gruut (`GruutPhonemizer`) antes de la síntesis.
- Generación de espectrogramas con Glow-TTS y conversión a audio con vocoder HiFi-GAN.
- Integración con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución local y portable gracias al formato ONNX.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- No es un modelo multilingüe: únicamente sueco.

## Casos de uso

- Asistentes de voz locales en sueco: el modelo puede integrarse en OVOS configurando la voz `larynx/sv-se-talesyntese-glow_tts` en `mycroft.conf`, lo que permite respuestas habladas sin depender de servicios en la nube.
- Lectura de notificaciones y alertas en sistemas domóticos: al ser un modelo compacto (0,1 GB) y ejecutable en ONNX, puede correr en dispositivos de bajos recursos para anunciar eventos del hogar en sueco.
- Generación de audiolibros o contenido narrado en sueco: la síntesis por frases permite convertir texto largo en audio por lotes, aunque la calidad será la de un modelo Glow-TTS clásico y no la de un sistema neuronal moderno.
- Pruebas de accesibilidad: convertir textos de interfaces o documentación a voz para usuarios con discapacidad visual en entornos de habla sueca.
- Prototipado de pipelines TTS: sirve como referencia para comparar la calidad de Glow-TTS frente a modelos más recientes en tareas de síntesis en sueco, dentro de un entorno reproducible con phoonnx.
- Investigación en TTS de bajos recursos: al ser un modelo pequeño y con licencia poco clara, es útil para experimentos académicos internos sobre fonemización con gruut y vocoders HiFi-GAN, no para despliegues comerciales sin aclarar la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0,1 GB) se trata de un modelo muy ligero, apto para ejecución en CPU.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) es más que suficiente; también debería funcionar en CPU.
- ¿Cabe en GPU consumer? Sí, con margen amplio, dado el reducido tamaño del modelo y del vocoder.
- Opciones de despliegue: phoonnx (Python) y el plugin OVOS `ovos-tts-plugin-phoonnx`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| glowtts-sv_se-talesyntese-gruut (este) | Glow-TTS + HiFi-GAN | sv-SE | no aplica | other (sin registrar) | ONNX | Hugging Face (Phoonnx) |
| Modelos Piper para sueco | VITS | sv-SE | no aplica | MIT (habitual en Piper) | ONNX | Hugging Face / repositorio Piper |
| Modelos Coqui TTS multilingües | VITS / XTTS | varios (incluye sueco en algunos) | no aplica | MPL-2.0 / CPML según modelo | varios | Hugging Face / repositorio Coqui |
| Modelos Larynx originales (Rhasspy) | Glow-TTS | varios | no aplica | según release upstream | tar.gz / formatos originales | GitHub Rhasspy |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La licencia figura como `other` y el propio autor indica que no hay licencia registrada; es imprescindible revisar la release upstream de Rhasspy antes de cualquier uso, especialmente comercial.
- Modelo monolingüe: solo sueco de Suecia; no admite otros idiomas ni cambio de voz.
- Calidad de síntesis propia de Glow-TTS, inferior a la de sistemas neuronales TTS más recientes (VITS, difusión, modelos basados en LLM).
- Depende de la fonemización con gruut; errores en la normalización del texto o en la conversión a fonemas afectarán directamente a la pronunciación.
- Riesgo de alucinación no aplica en el sentido de texto generado, pero sí puede producir artefactos acústicos o pronunciaciones incorrectas en palabras fuera del dominio de entrenamiento.
- Sin datos publicados sobre sesgos, composición del dataset ni evaluación objetiva (MOS, WER), lo que dificulta validar su robustez en producción.
- El número de descargas (21) y la ausencia de likes sugieren un uso muy minoritario; no hay evidencia de comunidad ni mantenimiento activo más allá del empaquetado.
- No es adecuado para tareas de razonamiento, código, matemáticas, visión ni agentes; su único propósito es la síntesis de voz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-sv_se-talesyntese-gruut
- Release upstream de Rhasspy Larynx v1.0: https://github.com/rhasspy/larynx/releases/download/v1.0/sv-se_talesyntese-glow_tts.tar.gz
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Colección Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Vocoder HiFi-GAN multi-VCTK small: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
