# Phoonnx/vits-tdt_tl-joao

## Resumen

`vits-tdt_tl-joao` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su librería ONNX de TTS. El modelo original procede de `raphaelmerx/piper-voices`, concretamente de la variante `tdt/tdt_TL/joao/medium`, y ha sido adaptado al formato y a la infraestructura de Phoonnx, que permite ejecutar voces VITS en Python, en el ecosistema OVOS y en el navegador mediante phoonnx.js.

El modelo sintetiza voz en el idioma `tdt-TL` (variante lingüística identificada por el código `tdt-TL` en la documentación del autor). La entrada de texto no es texto plano directo, sino fonemas generados por espeak-ng en alfabeto IPA, lo que implica que el pipeline requiere un front-end de fonemización antes de la inferencia. La voz se distribuye como un modelo ONNX de tamaño reducido (el repositorio ocupa aproximadamente 0,1 GB), lo que facilita su despliegue en entornos con recursos limitados.

La relevancia de este modelo reside en su integración con el ecosistema Phoonnx/OVOS: es una voz "community" empaquetada para su uso directo mediante `TTSModelManager`, con licencia MIT y un flujo de instalación documentado. No obstante, se trata de un modelo de nicho, con muy pocas descargas (29) y sin métricas de calidad publicadas, orientado a hablantes del idioma `tdt-TL` y a desarrolladores que ya trabajan dentro del stack de Phoonnx.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de LLM) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | `tdt-TL` |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas espeak-ng en alfabeto IPA |
| Tamaño del repositorio | ~0,1 GB |
| Librería | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial entrenado con aprendizaje adversarial, junto con alineamiento monotónico para aprender la correspondencia entre fonemas y frames de audio. El modelo genera formas de onda directamente a partir de fonemas, sin necesidad de un vocoder externo separado en el pipeline de inferencia.

El autor original es `raphaelmerx`, que publicó el modelo dentro de `piper-voices` bajo la ruta `tdt/tdt_TL/joao/medium`. Phoonnx lo ha empaquetado en formato ONNX para su librería. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF o ajuste fino adicional. Tampoco se documentan innovaciones técnicas específicas más allá de las propias de VITS. La variante "medium" del nombre sugiere un tamaño intermedio dentro de la familia de voces de piper, pero no se especifican parámetros.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de fonemas espeak-ng en alfabeto IPA.
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Integración con el gestor de voces `TTSModelManager` de phoonnx, incluyendo `merge_default_voices`.
- Uso como plugin de TTS en OVOS mediante `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Ejecución en navegador a través de phoonnx.js (según la documentación del proyecto relacionado).
- Soporte de un único idioma: `tdt-TL`.
- No se documentan capacidades de clonación de voz, control de estilo, emoción, tool calling ni razonamiento multi-paso (no aplica a un modelo TTS).

## Casos de uso

- **Asistentes de voz en OVOS**: el modelo se integra como plugin de TTS (`ovos-tts-plugin-phoonnx`) y se selecciona en `mycroft.conf` mediante la clave `voice`. Es adecuado para asistentes domésticos que necesiten una voz en `tdt-TL` dentro del ecosistema OVOS.
- **Síntesis de voz en aplicaciones Python**: mediante `TTSModelManager` y `voice.synthesize_wav(text, wav_file)` se puede generar audio WAV directamente desde scripts Python, lo que encaja en pipelines de generación de audiolibros, avisos o contenido pregrabado.
- **Despliegue en navegador**: phoonnx.js permite ejecutar voces VITS con entrada espeak o Unicode en el navegador, con una demo disponible en `tigregotico.pt/demo`. Útil para aplicaciones web que necesiten TTS sin backend.
- **Sistemas embebidos y de bajos recursos**: al distribuirse como ONNX de ~0,1 GB, el modelo es apto para entornos con memoria y cómputo limitados, siempre que se disponga de un front-end de fonemización espeak-ng.
- **Prototipado de voces para piper**: al provenir de `piper-voices`, sirve como punto de partida para evaluar la calidad de la voz `joao` en la variante `tdt-TL` antes de integrarla en un producto.
- **Investigación en TTS multilingüe**: permite comparar el rendimiento de VITS en un idioma de bajos recursos (`tdt-TL`) frente a otras voces del mismo ecosistema, aunque no se publican métricas objetivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible. El repositorio ocupa ~0,1 GB, lo que sugiere un modelo pequeño que probablemente quepa en GPU consumer de gama baja, pero no se confirma en la documentación.
- **GPU recomendadas**: no disponible. No se especifican modelos de GPU probados.
- **GPU consumer**: no confirmado; por el tamaño del artefacto ONNX es plausible que funcione en GPUs consumer, pero no hay datos oficiales.
- **Opciones de despliegue**: phoonnx (Python), `ovos-tts-plugin-phoonnx` (OVOS), phoonnx.js (navegador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo TTS VITS).
- **Latencia y throughput**: no disponibles.
- **Requisito adicional**: es necesario instalar espeak-ng (`apt install espeak-ng`) o el extra `phoonnx[espeak]` para la fonemización; sin ello, el modelo no puede procesar texto correctamente.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto/entrada | Disponibilidad |
|---|---|---|---|---|---|---|
| `Phoonnx/vits-tdt_tl-joao` | VITS | `tdt-TL` | ONNX | MIT | Fonemas espeak-ng (IPA) | Hugging Face, ~29 descargas |
| Otras voces de `raphaelmerx/piper-voices` | VITS | Varios (por voz) | Piper/ONNX | Según release upstream | Fonemas espeak-ng | Hugging Face |
| Voces de la colección VITS de Phoonnx | VITS | Varios | ONNX | MIT (según modelo) | Fonemas espeak-ng | Hugging Face |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) entre estas alternativas en la información proporcionada. La comparativa se limita a aspectos de arquitectura, formato y licencia.

## Limitaciones y advertencias

- **Idioma único**: solo soporta `tdt-TL`; no es multilingüe.
- **Dependencia de espeak-ng**: la calidad de la síntesis depende de la fonemización. La documentación advierte que el port espyak puede diferir de espeak-ng y provocar pronunciaciones incorrectas de algunas palabras.
- **Sin métricas de calidad**: no se publican evaluaciones MOS, inteligibilidad ni comparativas objetivas; no es posible valorar la calidad de la voz a priori.
- **Riesgo de alucinación**: no aplica en el sentido de LLM, pero un TTS puede generar artefactos, ruido o pronunciaciones erróneas ante entradas fuera de distribución o fonemas mal formados.
- **Sesgos**: no documentados. Al ser una voz única (`joao`), no hay diversidad de hablantes ni control de género, edad o acento.
- **Licencia**: MIT, lo que permite uso comercial, pero la documentación remite a los términos del release upstream (`raphaelmerx/piper-voices`), que conviene verificar.
- **Madurez**: 29 descargas y 0 likes indican un modelo de nicho con poca validación comunitaria; no se recomienda para producción crítica sin evaluación previa.
- **Sin soporte de cuantización documentado**: solo se distribuye el artefacto ONNX tal cual; no hay variantes INT8/FP16 publicadas.
- **Fecha de creación futura**: los metadatos indican creación en 2026-11-14, lo que puede reflejar un error de fecha o un artefacto de la plataforma; conviene verificarlo antes de citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-tdt_tl-joao
- Modelo upstream: https://huggingface.co/raphaelmerx/piper-voices/tree/main/tdt/tdt_TL/joao/medium
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
