# Phoonnx/glowtts-en_us-blizzard_lessac-gruut

## Resumen

Glow-TTS en inglés estadounidense empaquetado en formato ONNX para la librería phoonnx. Se trata de un modelo de síntesis de voz (text-to-speech) basado en la arquitectura Glow-TTS original de Kim et al., entrenado por Rhasspy como parte del proyecto Larynx y distribuido originalmente como parte del release v1.0 de Larynx. El modelo toma fonemas gruut en alfabeto IPA como entrada y genera un espectrograma que posteriormente es convertido a audio por el vocoder HiFi-GAN multi-VCTK small.

La relevancia de este paquete es fundamentalmente práctica: convierte un checkpoint original de Larynx (formato TensorFlow) en un artefacto ONNX listo para inferencia en Python y en el ecosistema OVOS/Mycroft, eliminando la dependencia del stack original. Está pensado para asistentes de voz locales, síntesis embebida y pipelines de TTS que requieran un modelo ligero (0,1 GB de repositorio) y sin dependencias de servicios en la nube.

La voz concreta es `en-us-blizzard_lessac`, entrenada sobre el corpus Blizzard Lessac, una voz femenina estadounidense de dominio público ampliamente utilizada en investigación de TTS. El modelo no incluye parámetros de tamaño publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (flow-based, normalizing flow con alineamiento monotónico) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS por frase, sin ventana de contexto definida) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | en-US (inglés estadounidense) |
| Licencia | other (sin licencia registrada en el repo; consultar upstream Larynx) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de síntesis de voz no autorregresivo basado en normalizing flows. A diferencia de los modelos autorregresivos tipo Tacotron, Glow-TTS aprende un alineamiento monotónico entre fonemas y frames de espectrograma mediante programación dinámica (MAS, Monotonic Alignment Search), lo que permite entrenamiento paralelo y una inferencia sustancialmente más rápida. La arquitectura combina un encoder transformer sobre la secuencia de fonemas con un decoder de flows invertibles que transforma una distribución latente gaussiana en el espectrograma mel.

El modelo se entrenó originalmente por Rhasspy sobre el corpus Blizzard Lessac para en-US, dentro del proyecto Larynx, que produjo voces de código abierto para asistentes de voz. La entrada no es texto crudo sino fonemas gruut en alfabeto IPA, lo que requiere un front-end de fonemización (scriptconv con el extra `gruut`) antes de la inferencia. El vocoder asociado es `hifigan-multi-vctk-small`, que convierte el espectrograma mel en forma de onda. No se dispone de información sobre número de tokens de entrenamiento, composición exacta del dataset ni si hubo ajuste por RLHF/DPO (no aplicable en TTS clásico).

## Capacidades

- Síntesis de voz (text-to-speech) en inglés estadounidense a partir de fonemas IPA.
- Generación de espectrograma mel que se convierte a audio mediante vocoder HiFi-GAN.
- Integración con el front-end de fonemización gruut a través de scriptconv.
- Ejecución en Python mediante la librería phoonnx y en el ecosistema OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`.
- Inferencia ONNX, lo que permite despliegue en CPU sin GPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales (visión, audio de entrada, etc.).
- No soporta otros idiomas distintos del inglés estadounidense.

## Casos de uso

- Asistentes de voz locales en OVOS/Mycroft: el modelo se integra como plugin TTS declarándolo en `mycroft.conf`, permitiendo síntesis completamente offline en dispositivos domésticos sin enviar texto a servicios externos.
- Síntesis embebida en dispositivos de bajos recursos: al ejecutarse en ONNX sobre CPU y con un repositorio de 0,1 GB, es adecuado para Raspberry Pi y hardware similar donde no hay GPU disponible.
- Generación de audiolibros y locuciones: la voz Lessac es una voz femenina estadounidense neutra, apropiada para narración de contenido largo procesado frase a frase.
- Accesibilidad y lectores de pantalla: conversión de texto a voz en tiempo real para aplicaciones de asistencia a personas con discapacidad visual, con latencia baja gracias a la inferencia no autorregresiva de Glow-TTS.
- Pruebas y desarrollo de pipelines TTS: sirve como referencia ligera para validar front-ends de fonemización (gruut/scriptconv) y vocoders HiFi-GAN antes de escalar a voces de mayor calidad.
- Sistemas de respuesta por voz en telefonía o IVR: generación de prompts y respuestas pregrabadas dinámicamente en inglés estadounidense sin dependencia de APIs comerciales.
- Investigación en TTS: base reproducible para experimentos con alineamiento monotónico, flows y vocoders, dado que el modelo original y el paquete ONNX son públicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; por el tamaño del repositorio (0,1 GB) se infiere un modelo pequeño que puede ejecutarse en CPU.
- GPU recomendadas: no se especifican; al ser ONNX y no requerir GPU, cualquier GPU con soporte ONNX Runtime es suficiente, aunque no hay datos de rendimiento.
- Compatibilidad con GPU de consumo: previsiblemente sí en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en CPU, aunque no se documentan cifras.
- Opciones de despliegue: phoonnx (Python), OVOS/Mycroft mediante `ovos-tts-plugin-phoonnx`, ONNX Runtime. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phoonnx/glowtts-en_us-blizzard_lessac-gruut | Glow-TTS + HiFi-GAN | en-US | ONNX | other (sin registrar) | Hugging Face, 20 descargas |
| Otras voces Larynx Glow-TTS (colección Phoonnx) | Glow-TTS + HiFi-GAN | varios (en, etc.) | ONNX | other | Hugging Face |
| VITS / Piper (rhasspy) | VITS (end-to-end) | múltiples | ONNX | MIT / otras | Hugging Face, GitHub |
| Tacotron 2 + HiFi-GAN | Autorregresivo + vocoder | múltiples | TensorFlow/PyTorch | varía | Repos académicos |

La comparación detallada con parámetros y benchmarks no está disponible en la información proporcionada. Frente a Piper/VITS, este modelo emplea una arquitectura de dos etapas (Glow-TTS + vocoder separado) en lugar de un modelo end-to-end, lo que implica un pipeline algo más complejo pero con mayor modularidad.

## Limitaciones y advertencias

- Licencia no registrada: la model card indica explícitamente "No licence is recorded for this model. Check the upstream release before you use it." Es imprescindible verificar la licencia del release original de Larynx antes de cualquier uso comercial.
- Solo inglés estadounidense: no soporta otros idiomas ni variantes regionales del inglés.
- Entrada fonémica: requiere un front-end de fonemización gruut; el texto crudo no se acepta directamente sin scriptconv.
- Calidad de voz limitada: se trata de una voz de 2021 (Larynx v1.0) con vocoder small; la naturalidad y prosodia quedan por debajo de modelos TTS neuronales más recientes.
- Riesgo de alucinación acústica: como todo TTS, puede producir pronunciaciones incorrectas en palabras fuera del vocabulario o nombres propios, y artefactos en fonemas mal transcritos.
- Sesgos: la voz está entrenada sobre el corpus Lessac, una única hablante femenina estadounidense; no representa diversidad de acentos ni géneros.
- Sin datos de benchmarks: no hay métricas objetivas (MOS, WER, RTF) publicadas para esta versión empaquetada.
- Ecosistema limitado: 20 descargas y 0 likes en Hugging Face; el soporte y mantenimiento dependen de los proyectos phoonnx y scriptconv.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-blizzard_lessac-gruut
- Upstream original (Larynx v1.0): https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_blizzard_lessac-glow_tts.tar.gz
- Colección Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Vocoder HiFi-GAN multi-VCTK small: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
