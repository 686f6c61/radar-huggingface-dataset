# Phoonnx/vits-pl_pl-jarvis

## Resumen

vits-pl_pl-jarvis es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, entrenado para el idioma polaco (`pl-PL`). El modelo original fue desarrollado por WitoldG dentro del proyecto `WitoldG/polish_piper_models` y ha sido empaquetado por Phoonnx para su uso con la librería ONNX `phoonnx`. Se trata de un modelo compacto (el repositorio ocupa aproximadamente 0,1 GB) orientado a la inferencia local y ligera.

El modelo no es un LLM ni un modelo de lenguaje: es un sistema TTS neuronal de extremo a extremo que convierte texto en fonemas mediante espeak-ng y genera audio mediante la arquitectura VITS. Su relevancia radica en que ofrece una voz polaca de código abierto (licencia MIT) ejecutable sobre ONNX, integrable tanto en Python como en el ecosistema OVOS/Mycroft y en el navegador mediante phoonnx.js.

La ficha se basa exclusivamente en la información disponible en la model card y los metadatos de Hugging Face; los datos no publicados se indican como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech neuronal de extremo a extremo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de LLM) |
| Tipos de cuantizacion | no disponible (pesos en formato ONNX) |
| Idiomas soportados | polaco (`pl-PL`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak (alfabeto IPA) |
| Tamano del repositorio | ~0,1 GB |
| Libreria | phoonnx |
| Pipeline | text-to-speech |
| Autor original | WitoldG |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un sistema neuronal de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial entrenado conjuntamente. VITS produce audio de forma directa a partir de fonemas, sin necesidad de un vocoder separado en tiempo de inferencia.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o ajuste fino adicional. El modelo procede del repositorio `WitoldG/polish_piper_models`, orientado al ecosistema Piper, y ha sido reempaquetado para phoonnx. El front-end de texto utiliza `scriptconv` con el fonemizador `EspeakPhonemizer`, que convierte el texto normalizado en fonemas IPA mediante espeak-ng.

## Capacidades

- Síntesis de voz (text-to-speech) en polaco (`pl-PL`) a partir de texto escrito.
- Conversión de texto a fonemas IPA mediante espeak-ng (fonemizador `EspeakPhonemizer` de `scriptconv`).
- Generación de audio en formato WAV mediante `synthesize_wav`.
- Integración con el ecosistema OVOS/Mycroft a través del plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador mediante phoonnx.js (voces VITS con entrada espeak o unicode).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada; es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz en polaco sobre OVOS/Mycroft: el modelo se selecciona como voz en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx`, permitiendo respuestas habladas en `pl-PL` en asistentes domésticos autoalojados.
- Síntesis de voz local en aplicaciones Python: mediante `TTSModelManager` y `voice.synthesize_wav`, se puede generar audio WAV para lectores de pantalla, sistemas de accesibilidad o narración de contenido sin depender de servicios en la nube.
- Síntesis de voz en el navegador: con phoonnx.js se puede integrar la voz en aplicaciones web que necesiten reproducción de texto en polaco del lado del cliente, sin backend.
- Generación de audiolibros o contenido narrado en polaco: el modelo permite convertir texto largo en audio de forma por lotes, adecuado para pipelines de publicación automatizada.
- Sistemas de anuncios o notificaciones por voz: integración en aplicaciones de domótica o sistemas de megafonía que requieran mensajes hablados en polaco con latencia baja y ejecución local.
- Prototipado e investigación en TTS: al ser un modelo VITS empaquetado en ONNX con licencia MIT, sirve como base para experimentos de síntesis de voz, evaluación de fonemizadores o comparación de voces Piper en polaco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (~0,1 GB) se trata de un modelo muy ligero, apto para CPU.
- GPU recomendadas: no disponible; el modelo está empaquetado en ONNX y orientado a inferencia ligera, por lo que no requiere GPU dedicada.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el reducido tamaño, aunque no se confirma en la información disponible.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft, y `phoonnx.js` en el navegador. Requiere espeak-ng instalado (o el extra `phoonnx[espeak]` con el port espyak).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| vits-pl_pl-jarvis (este) | VITS | pl-PL | MIT | ONNX | Hugging Face (Phoonnx) |
| WitoldG/polish_piper_models (upstream) | VITS / Piper | pl-PL | según release upstream | Piper/ONNX | Hugging Face (WitoldG) |
| Otras voces VITS de la colección Phoonnx | VITS | varios | MIT (según modelo) | ONNX | Hugging Face (colección VITS de Phoonnx) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente TTS en polaco (`pl-PL`); no soporta otros idiomas ni tareas de lenguaje.
- La calidad de pronunciación depende de espeak-ng: con el port espyak algunos fonemas difieren y la voz puede pronunciar mal ciertas palabras.
- Requiere instalar espeak-ng de forma externa (o el extra `phoonnx[espeak]`) para el fonemizado correcto.
- No se han publicado métricas de calidad (MOS, WER, etc.) ni benchmarks, por lo que el rendimiento real no está documentado.
- Sesgos y riesgo de alucinación: no aplica en el sentido de LLM, pero no se documentan sesgos de voz (género, prosodia, acento) en la información disponible.
- Licencia MIT, lo que permite uso comercial; no obstante, la model card remite a los términos del release upstream para condiciones adicionales.
- El modelo tiene pocas descargas (28) y ningún "like", lo que sugiere escasa validación por parte de la comunidad.
- Fecha de creación y actualización del repositorio (noviembre de 2026) resulta anómala respecto a la fecha actual; conviene verificar la vigencia del artefacto antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-pl_pl-jarvis
- Modelo upstream: https://huggingface.co/WitoldG/polish_piper_models
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
