# Phoonnx/vits-te_in-cmu_indic-low-epitran

## Resumen

`vits-te_in-cmu_indic-low-epitran` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Mycroft AI para el motor Mimic3 y empaquetado por Phoonnx en formato ONNX para su uso con la librería `phoonnx`. El modelo está especializado en telugu (código ISO `te`, variante `te-IN`) y forma parte del catálogo de voces de Mimic3 derivadas del corpus CMU Indic.

La relevancia de este modelo reside en su empaquetado ligero (0,1 GB) y su integración con el ecosistema OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`, lo que permite desplegar síntesis de voz en telugu en asistentes de voz locales y sistemas embebidos sin depender de servicios en la nube. El modelo consume fonemas en alfabeto IPA generados por Epitran a partir del texto de entrada, en lugar de caracteres crudos.

Se trata de un modelo de nicho, con muy pocas descargas (17) y sin likes, orientado a desarrolladores que necesiten TTS offline en telugu dentro del stack de Phoonnx/OVOS. No se dispone de información sobre el número de parámetros, la longitud de contexto ni los datos exactos de entrenamiento en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | telugu (`te`, variante `te-IN`) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |
| Autor original | Mycroft AI (upstream: `mimic3-voices/voices/te_IN/cmu-indic_low`) |
| Empaquetado por | Phoonnx |
| Entrada de texto | Fonemas Epitran en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria | `phoonnx` |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema end-to-end de síntesis de voz que combina un codificador variacional, un decoder basado en flujo normalizador y un discriminador adversarial entrenado con pérdidas GAN, junto con alineamiento monotónico para el ajuste texto-audio. Esta arquitectura permite generar audio directamente desde la secuencia de entrada sin necesidad de un modelo acústico separado y un vocoder posteriores.

El modelo original procede del repositorio `MycroftAI/mimic3-voices`, en la ruta `voices/te_IN/cmu-indic_low`, lo que indica que fue entrenado sobre el corpus CMU Indic para telugu, con la variante "low" (probablemente una configuración de menor calidad o tamaño). No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente a TTS). La innovación destacable es el front-end de texto: el modelo no recibe caracteres directamente, sino fonemas IPA producidos por `EpitranPhonemizer` de la librería `scriptconv`, lo que requiere instalar el extra `scriptconv[epitran]`.

## Capacidades

- Síntesis de voz (text-to-speech) en telugu (`te-IN`) a partir de texto escrito.
- Conversión de texto a fonemas IPA mediante Epitran antes de la síntesis.
- Generación de audio en formato WAV mediante la API `voice.synthesize_wav(text, wav_file)`.
- Integración con el gestor de voces de Phoonnx (`TTSModelManager`), incluyendo `merge_default_voices()`.
- Soporte como plugin de TTS en OVOS mediante `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Ejecución offline en local (modelo ONNX de 0,1 GB), sin dependencia de API externa.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Asistentes de voz locales en telugu: integración en OVOS/Mycroft mediante `ovos-tts-plugin-phoonnx` para que un asistente doméstico responda en telugu sin conexión a internet, aprovechando el reducido tamaño del modelo (0,1 GB).
- Lectura de contenido en telugu: conversión de artículos, noticias o documentación a audio WAV usando `voice.synthesize_wav`, adecuado para pipelines de accesibilidad o podcasts automatizados.
- Sistemas embebidos y dispositivos de bajo consumo: al distribuirse como ONNX de pequeño tamaño, puede ejecutarse en hardware modesto donde no caben modelos TTS más grandes.
- Pruebas de integración TTS en aplicaciones Python: el patrón `TTSModelManager` + `merge_default_voices()` + `load()` permite incorporar la voz en prototipos rápidamente.
- Localización de interfaces de voz: añadir telugu a un producto que ya usa el stack Phoonnx, seleccionando la voz `mimic3/te_IN/cmu-indic_low` en la configuración.
- Investigación en TTS multilingüe de bajos recursos: servir como punto de comparación o base para experimentos con el corpus CMU Indic y el front-end Epitran.
- Generación de avisos y notificaciones habladas: para sistemas de megafonía o alertas automatizadas en telugu con latencia local baja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB en disco, por lo que la huella de memoria es reducida y compatible con CPU.
- GPU recomendadas: no se especifican; al ser un modelo ONNX pequeño, la inferencia en CPU es viable y no requiere GPU dedicada.
- Compatibilidad con GPU de consumo: previsiblemente sí (cualquier GPU consumer con soporte ONNX Runtime), aunque no se documenta oficialmente.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft, y ONNX Runtime como backend subyacente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Phoonnx/vits-te_in-cmu_indic-low-epitran` | Telugu (`te-IN`) | VITS (ONNX) | 0,1 GB | CC-BY-SA-4.0 | Hugging Face, via phoonnx |
| Otras voces VITS de la coleccion Phoonnx | Multiples idiomas | VITS (ONNX) | Variable | Segun upstream | Coleccion `Phoonnx/vits` en Hugging Face |
| Voces originales de Mycroft Mimic3 | Multiples idiomas | VITS | Variable | Segun upstream | Repositorio `MycroftAI/mimic3-voices` |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) entre este modelo y alternativas, por lo que la comparativa se limita a parametros estructurales y de licencia.

## Limitaciones y advertencias

- Modelo de nicho con muy baja adopcion (17 descargas, 0 likes), lo que implica escasa validacion comunitaria y soporte limitado.
- Solo soporta telugu (`te-IN`); no es multilingue.
- Requiere un front-end especifico: el texto debe convertirse a fonemas IPA con Epitran (`scriptconv[epitran]`); pasar texto crudo directamente no funcionara correctamente.
- No se dispone de informacion sobre sesgos, calidad de sintesis (MOS) ni tasas de error de pronunciacion.
- Riesgo de alucinacion acustica o artefactos en entradas fuera de dominio, comun en modelos VITS pequenos, aunque no esta cuantificado.
- La licencia CC-BY-SA-4.0 impone atribucion y compartir-igual: las obras derivadas deben distribuirse bajo la misma licencia, lo que puede condicionar su uso en productos comerciales cerrados.
- El modelo original pertenece a Mycroft AI y la licencia se declara en el repositorio upstream; conviene verificar los terminos exactos antes de un uso en produccion.
- No se documentan limitaciones de longitud de contexto ni de velocidad de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-te_in-cmu_indic-low-epitran
- Upstream (Mycroft AI, `te_IN/cmu-indic_low`): https://github.com/MycroftAI/mimic3-voices/tree/master/voices/te_IN/cmu-indic_low
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
