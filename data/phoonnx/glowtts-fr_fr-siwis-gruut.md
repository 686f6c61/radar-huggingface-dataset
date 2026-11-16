# Phoonnx/glowtts-fr_fr-siwis-gruut

## Resumen

glowtts-fr_fr-siwis-gruut es un modelo de síntesis de voz (text-to-speech) para francés de Francia (fr-FR) basado en la arquitectura Glow-TTS, originalmente desarrollado por Rhasspy dentro del proyecto Larynx y empaquetado en formato ONNX por Phoonnx para su uso con la librería de inferencia homónima. El modelo genera espectrogramas mel a partir de fonemas IPA producidos por el fonemizador gruut, que posteriormente son convertidos en audio por el vocoder HiFi-GAN multi-VCTK small.

El modelo no es un LLM ni un sistema generativo de texto: es un componente acústico especializado en una única voz (siwis) y un único idioma. Su relevancia radica en su integración con el ecosistema OVOS (Open Voice OS), donde funciona como plugin TTS local mediante `ovos-tts-plugin-phoonnx`, lo que permite síntesis de voz sin dependencia de servicios en la nube.

El repositorio ocupa aproximadamente 0,1 GB y contiene pesos en formato ONNX. La licencia figura como "other" y la model card indica explícitamente que no hay licencia registrada, por lo que debe consultarse la release original de Larynx antes de cualquier uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (normalizing flow, text-to-mel) + vocoder HiFi-GAN multi-VCTK small |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada por fonemas, no por tokens de contexto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | francés de Francia (fr-FR) |
| Licencia | other (sin licencia registrada; consultar upstream) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de síntesis de voz basado en normalizing flows que modela directamente la distribución de espectrogramas mel condicionada al texto fonemizado, sin necesidad de alineamientos externos ni de un modelo autorregresivo de atención. La entrada no es texto en bruto sino fonemas IPA generados por el fonemizador gruut a través de la librería scriptconv, que normaliza y convierte el texto antes de la inferencia. La salida es un espectrograma mel que el vocoder HiFi-GAN multi-VCTK small transforma en forma de onda de audio.

El modelo procede de la release v1.0 de Larynx (`fr-fr_siwis-glow_tts.tar.gz`), un proyecto de Rhasspy orientado a TTS local para asistentes de voz. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o fine-tuning preferencial; estos datos no están publicados en la información disponible. La innovación técnica relevante es la inferencia en dos etapas (espectrograma + vocoder) empaquetada en ONNX para despliegue ligero, y la integración con un front-end fonemizador determinista (gruut) que evita la dependencia de tokenizadores subword.

## Capacidades

- Síntesis de voz a partir de texto en francés de Francia (fr-FR).
- Conversión de texto a fonemas IPA mediante gruut (scriptconv) antes de la síntesis.
- Generación de espectrogramas mel y conversión a audio WAV mediante el vocoder HiFi-GAN asociado.
- Integración como plugin TTS en OVOS mediante `ovos-tts-plugin-phoonnx`.
- Uso programático en Python a través de `phoonnx.model_manager.TTSModelManager`.
- Voz única predefinida (siwis); no soporta cambio de hablante ni clonación de voz.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).
- No soporta visión, audio de entrada ni modo thinking.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se selecciona como módulo TTS en `mycroft.conf` y permite respuestas habladas en francés sin enviar texto a servicios externos, gracias a su inferencia ONNX ligera.
- Síntesis de voz en dispositivos de borde (Raspberry Pi, mini-PC): el tamaño reducido del repositorio (0,1 GB) y el formato ONNX permiten ejecución en CPU sin GPU dedicada.
- Generación de avisos y notificaciones habladas en francés: útil en sistemas de domótica o kioscos que necesitan anuncios pregrabados dinámicamente con una voz consistente.
- Lectura de textos cortos en aplicaciones de accesibilidad: conversión de frases a audio para usuarios con discapacidad visual en entornos francófonos.
- Prototipado de pipelines TTS en investigación: al ser un modelo Glow-TTS empaquetado, sirve como referencia reproducible para comparar front-ends fonemizadores (gruut frente a otros) y vocoders.
- Integración en scripts de automatización con Python: la API `TTSModelManager` permite generar ficheros WAV en lote para doblaje de contenido breve o pruebas de calidad acústica.
- Evaluación de vocoders HiFi-GAN: al estar el vocoder desacoplado (`hifigan-multi-vctk-small`), se puede sustituir o comparar con otras variantes en experimentos de síntesis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo es ONNX y está pensado para ejecución en CPU.
- GPU recomendadas: no disponibles; no se documentan requisitos de GPU.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del repositorio (0,1 GB), aunque no hay confirmación oficial.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto / alcance |
|---|---|---|---|---|---|
| glowtts-fr_fr-siwis-gruut | Glow-TTS + HiFi-GAN | fr-FR | ONNX | other (sin registrar) | Voz única, fr-FR |
| Otros modelos Glow-TTS de la colección Phoonnx | Glow-TTS + HiFi-GAN | varios | ONNX | other | Voz única por idioma |
| Modelos TTS de Rhasspy/Larynx originales | Glow-TTS / VITS | varios | tar.gz / ONNX | según release upstream | Voz única por idioma |

No se dispone de datos de benchmarks ni de comparativas cuantitativas con alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con una única voz (siwis), la prosodia y el timbre están limitados a esa hablante.
- Riesgo de alucinación: en TTS se traduce en pronunciaciones incorrectas o artefactos acústicos ante texto fuera de dominio, siglas o neologismos no cubiertos por el fonemizador gruut.
- Limitaciones de idioma: solo fr-FR; no soporta otros idiomas ni variantes regionales del francés.
- Limitaciones de contexto: no aplica ventana de contexto; la entrada es texto fonemizado y la calidad depende del front-end gruut.
- Restricciones de licencia: la licencia figura como "other" y la model card indica que no hay licencia registrada; es imprescindible verificar la release upstream de Larynx antes de uso comercial.
- Caveat para producción: el modelo depende del vocoder `hifigan-multi-vctk-small`, que phoonnx descarga junto con la voz; conviene fijar versiones para reproducibilidad.
- Dependencia de la librería `phoonnx` en versión pre-release (`pip install --pre phoonnx`), lo que implica menor estabilidad de API.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-fr_fr-siwis-gruut
- Release upstream de Larynx: https://github.com/rhasspy/larynx/releases/download/v1.0/fr-fr_siwis-glow_tts.tar.gz
- Colección Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Vocoder HiFi-GAN multi-VCTK small: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
