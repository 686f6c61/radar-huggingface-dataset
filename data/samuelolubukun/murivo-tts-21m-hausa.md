# samuelolubukun/murivo-tts-21m-hausa

## Resumen

Murivo-TTS 21M Hausa es un motor de síntesis de voz (text-to-speech) ultraligero desarrollado por Samuel Olubukun, diseñado específicamente para el idioma hausa, hablado principalmente en el norte de Nigeria y la región del Sahel. El modelo combina un backbone acústico de tipo Diffusion Transformer (DiT) con flow-matching de aproximadamente 20,9 millones de parámetros con el vocoder neuronal VoxCPM2 de 48 kHz (AudioVAE causal) desarrollado por OpenBMB, lo que permite generar audio nativo a 48.000 Hz sin dependencias de bibliotecas C ni de `espeak-ng`.

El modelo se distribuye como un único fichero de pesos en FP16 de unos 41,9 MB (`murivo_21m_ha.pt`) y está pensado para inferencia 100% offline. Su relevancia radica en su tamaño extremadamente reducido para una tarea de TTS de alta fidelidad, lo que lo hace desplegable en hardware muy modesto, incluido CPU, y en su enfoque específico en una lengua de bajos recursos como el hausa, con atención explícita a la ortografía Boko y a las consonantes glotálicas (ɓ, ɗ, ƙ, ƴ).

El checkpoint publicado corresponde a la etapa 2 del currículo de entrenamiento (conversacional, paso 1.800), tras una primera etapa sobre OpenBible Hausa. La licencia es MIT y el modelo no está pensado para inferencia directa en la plataforma de Hugging Face (`inference: false`), sino para ejecución local mediante el script `infer.py` proporcionado por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con flow-matching y solver ODE Euler; vocoder VoxCPM2 48 kHz AudioVAE causal |
| Parámetros totales | ~20,9 M (backbone acústico) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP16 (fichero distribuido); no se documentan otras cuantizaciones |
| Idiomas soportados | Hausa (ha) |
| Licencia | MIT |
| Formato de pesos | `.pt` (PyTorch, ~41,9 MB en FP16); vocoder `audiovae.pth` descargado aparte desde `openbmb/VoxCPM2` |

## Arquitectura y entrenamiento

El modelo emplea un backbone acústico de tipo Diffusion Transformer (DiT) con flow-matching, resuelto mediante un solver ODE de Euler, de aproximadamente 20,9 millones de parámetros. La síntesis se completa con el vocoder neuronal VoxCPM2 48 kHz AudioVAE causal de OpenBMB, que decodifica la representación acústica a forma de onda a 48.000 Hz. La arquitectura deriva de Rápido TTS (Anurag Kanade y colaboradores), un diseño ligero de TTS basado en DiT y flow-matching.

El entrenamiento siguió un currículo en dos etapas. La etapa 1 (estudio) se entrenó durante 5.000 pasos sobre OpenBible Hausa, centrada en la ortografía Boko y las letras glotálicas, con una pérdida final de 0,8996 (flow: 0,8415). La etapa 2 (conversacional) se afinó durante 1.800 pasos sobre Nigerian Common Voice Hausa, con foco en el ritmo natural del habla, y alcanzó una pérdida de duración de 0,1661. No se documentan en la información disponible detalles sobre volumen de tokens, composición exacta del dataset ni uso de RLHF o DPO.

## Capacidades

- Síntesis de voz (text-to-speech) en hausa a 48.000 Hz nativos.
- Manejo de la ortografía Boko y de consonantes glotálicas del hausa (ɓ, ɗ, ƙ, ƴ), así como de implosivas, eyectivas, oclusiva glotal y diptongos.
- Control de la síntesis mediante parámetros de guía (`guidance`, por defecto 1,8), velocidad (`speed`) y número de pasos del solver (`steps`, por defecto 20).
- Inferencia 100% offline, sin dependencias de bibliotecas C ni de `espeak-ng`; solo requiere `torch`, `soundfile` y `numpy`.
- Ejecución en CPU o GPU (`device="cuda"` o `device="cpu"`).
- Interfaz de línea de comandos (`infer.py`) y API de Python (`MurivoTTS`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking.

## Casos de uso

- **Lectura de contenidos en hausa para accesibilidad:** el modelo puede convertir artículos, noticias o documentación a audio a 48 kHz para usuarios con discapacidad visual o preferencia por consumo auditivo, ejecutándose en local sin conexión.
- **Locución para medios y radio comunitaria:** generación de cuñas y narraciones en hausa con calidad de estudio (48 kHz) para emisoras del norte de Nigeria y el Sahel, sin coste de licencia por uso comercial gracias a la licencia MIT.
- **Sistemas de anuncios públicos y alertas:** síntesis de avisos sanitarios, meteorológicos o de emergencia en hausa para su reproducción en altavoces o aplicaciones móviles, con despliegue en hardware modesto.
- **Aplicaciones educativas offline:** integración en aplicaciones de aprendizaje de hausa o de alfabetización que funcionen sin conectividad, aprovechando que el modelo pesa ~41,9 MB y no requiere dependencias de sistema.
- **Generación de audiolibros y material formativo:** conversión por lotes de textos largos en hausa a audio mediante la API de Python, ajustando `speed` y `steps` según el equilibrio deseado entre calidad y latencia.
- **Prototipado e investigación en TTS de bajos recursos:** servir como base ligera para experimentos de síntesis en hausa, fine-tuning sobre nuevos corpus o comparación de arquitecturas DiT con flow-matching en lenguas de bajos recursos.
- **Integración en asistentes de voz locales:** uso como componente de salida de voz en asistentes de escritorio o embebidos que operen en hausa y requieran privacidad y funcionamiento sin red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta las pérdidas de entrenamiento por etapa:

| Etapa | Pasos | Dataset | Enfoque | Pérdida final |
|---|---|---|---|---|
| Etapa 1 (estudio) | 5.000 | OpenBible Hausa | Ortografía Boko y letras glotálicas | 0,8996 (flow: 0,8415) |
| Etapa 2 (conversacional) | 1.800 | Common Voice Hausa | Ritmo y tempo naturales | Duración: 0,1661 |

## Requisitos de hardware

- **VRAM estimada:** no disponible de forma explícita; con un backbone de ~20,9 M de parámetros en FP16 (~41,9 MB) más el vocoder VoxCPM2, el consumo es muy reducido, del orden de unos pocos cientos de MB en GPU.
- **GPU recomendadas:** cualquier GPU con soporte CUDA es suficiente; no se requieren A100 ni H100. Una RTX 4090 o similar queda muy sobredimensionada para este modelo.
- **Consumer GPU:** sí, cabe holgadamente en cualquier GPU de consumo, e incluso en iGPU y CPU.
- **CPU:** soportada explícitamente (`device="cpu"`), lo que permite despliegue en servidores sin GPU o en dispositivos embebidos.
- **Opciones de despliegue:** script `infer.py` del autor con API de Python y CLI. No se documenta integración con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- **Latencia y throughput:** no disponibles en la información proporcionada. El número de pasos del solver (20 por defecto) y el parámetro `guidance` influyen directamente en la latencia.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento de modelos comparables para establecer una comparativa cuantitativa. A continuación se indican alternativas de la misma categoría con los datos disponibles de esta ficha:

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Murivo-TTS 21M Hausa | ~20,9 M | no disponible | Hausa | MIT | `.pt` (FP16) |
| Rápido TTS (linaje arquitectónico) | no disponible | no disponible | no disponible | no disponible | no disponible |
| VoxCPM2 (vocoder empleado) | no disponible | no disponible | no disponible | no disponible | `.pth` |
| Alternativas TTS multilingües de referencia | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Idioma único:** el modelo solo soporta hausa; no se documenta cobertura multilingüe.
- **Estado del checkpoint:** corresponde a la etapa 2 (paso 1.800) de un currículo en curso; puede presentar inestabilidades o artefactos no corregidos.
- **Riesgo de alucinación acústica:** como todo modelo generativo de audio, puede producir pronunciaciones incorrectas, omisiones o artefactos en textos fuera de dominio o con grafías no vistas.
- **Dependencia externa del vocoder:** requiere descargar `audiovae.pth` desde `openbmb/VoxCPM2` en la primera ejecución, lo que rompe el funcionamiento estrictamente offline si no se cachea previamente.
- **Sin benchmarks publicados:** no hay evaluación objetiva (MOS, WER, etc.) que permita comparar su calidad con alternativas.
- **Sesgos:** no documentados en la información disponible; los corpus de origen (OpenBible y Common Voice) pueden introducir sesgos de dominio y de registro.
- **Licencia MIT:** permite uso comercial, pero conviene verificar las licencias de los datasets de entrenamiento y del vocoder VoxCPM2 antes de un despliegue en producción.
- **Inferencia en Hugging Face deshabilitada:** `inference: false`; el modelo debe ejecutarse localmente.
- **Sin soporte documentado** de tool calling, agentes ni otras capacidades más allá de la síntesis de voz.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/samuelolubukun/murivo-tts-21m-hausa)
- [Autor: Samuel Olubukun](https://huggingface.co/samuelolubukun)
- [Dataset OpenBible Multilingual TTS](https://huggingface.co/datasets/multilingual-tts/open-bible)
- [Dataset Nigerian Common Voice (Benjamin Ogbonna)](https://huggingface.co/datasets/benjaminogbonna/nigerian_common_voice_dataset)
- [Vocoder VoxCPM2 (OpenBMB)](https://huggingface.co/openbmb/VoxCPM2)
- [Rápido TTS en Hugging Face](https://huggingface.co/edwixx/rapido-tts)
- [Rápido TTS en GitHub](https://github.com/anurag12-webster/rapido-tts)
