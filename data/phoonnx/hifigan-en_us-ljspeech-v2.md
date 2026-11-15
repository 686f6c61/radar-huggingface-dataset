# Phoonnx/hifigan-en_us-ljspeech-v2

## Resumen

hifigan-en_us-ljspeech-v2 es un vocoder neuronal (generador de forma de onda a partir de espectrogramas mel) empaquetado en formato ONNX por Phoonnx a partir del modelo original de Coqui. No es un modelo de lenguaje ni un sistema TTS completo: es la etapa final de sintesis de un pipeline TTS, concretamente el vocoder del sistema `tts_models--en--ljspeech--fast_pitch` de Coqui TTS v0.6.1. Su funcion es convertir las representaciones mel-espectrales producidas por el modelo acustico FastPitch en audio PCM reproducible.

El modelo se distribuye como artefacto ONNX dentro de la libreria phoonnx (implementacion Python/OVOS orientada a ejecucion ligera en dispositivos), lo que permite inferencia sin depender del stack completo de PyTorch/Coqui. Esta pensado para voz en ingles estadounidense (`en-US`) y se empareja en el indice de voces de phoonnx con el modelo acustico `fastpitch-en_us-ljspeech`.

Su relevancia es practica: ofrece un vocoder HiFi-GAN de referencia, con licencia Apache 2.0, empaquetado para despliegue ONNX en asistentes de voz, sistemas embebidos y pipelines de sintesis de habla que necesitan baja latencia y dependencias minimas. No hay datos publicados de tamano de parametros ni de rendimiento en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HiFi-GAN (vocoder neuronal generativo, familia GAN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de sintesis, no de texto) |
| Tipos de cuantizacion | no disponible (distribucion principal en ONNX) |
| Idiomas soportados | ingles estadounidense (`en-US`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo es un vocoder HiFi-GAN, una arquitectura generativa adversarial que transforma espectrogramas mel en formas de onda de audio. HiFi-GAN emplea un generador con bloques de upsampling por transposicion convolucional y discriminadores multiperiodo y multiescala durante el entrenamiento, lo que permite sintesis de alta fidelidad con coste computacional moderado. En este caso concreto, el vocoder es el componente asociado al sistema FastPitch de Coqui entrenado sobre el corpus LJSpeech (voz unica femenina en ingles, aproximadamente 24 horas de audio de dominio publico), aunque la model card no detalla el numero exacto de pasos de entrenamiento ni la composicion completa del dataset.

No se dispone de informacion sobre el numero de tokens de audio, la funcion de perdida exacta, ni si hubo ajuste adicional mas alla del entrenamiento original de Coqui. El empaquetado por parte de Phoonnx consiste en la conversion a ONNX y su integracion en la libreria phoonnx, que gestiona la descarga y el emparejamiento automatico con el modelo acustico FastPitch correspondiente. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.) en la informacion proporcionada.

## Capacidades

- Sintesis de forma de onda a partir de espectrogramas mel: convierte representaciones acusticas intermedias en audio PCM reproducible.
- Integracion directa con el modelo acustico `fastpitch-en_us-ljspeech` dentro del indice de voces de phoonnx.
- Ejecucion via ONNX Runtime, sin requerir PyTorch ni el stack completo de Coqui TTS.
- Soporte de voz en ingles estadounidense (`en-US`) exclusivamente.
- Descarga y gestion automatica por parte de la libreria phoonnx (no requiere paso manual de instalacion del vocoder).
- Compatibilidad con el ecosistema OVOS a traves de phoonnx.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es un componente puramente de audio.

## Casos de uso

- Sintesis de voz en asistentes locales: el vocoder se integra en phoonnx para generar audio en tiempo real en asistentes de voz OVOS, con dependencias minimas y ejecucion ONNX.
- Lectura de texto a voz en aplicaciones de escritorio: combinado con FastPitch, permite convertir texto en audio en aplicaciones de accesibilidad o lectores de pantalla sin depender de servicios en la nube.
- Generacion de audiolibros y contenido narrado: al estar entrenado sobre LJSpeech (voz unica), es adecuado para narracion monologa en ingles con una voz consistente.
- Prototipado de pipelines TTS: sirve como vocoder de referencia para comparar calidad acustica frente a otros vocoders en experimentos de sintesis.
- Sistemas embebidos y dispositivos de bajos recursos: el formato ONNX y la ausencia de dependencias pesadas facilitan su despliegue en hardware limitado.
- Investigacion en sintesis de habla: util como componente reproducible con licencia permisiva para experimentos academicos sobre vocoders GAN.
- Integracion en pipelines de conversion texto-a-voz por lotes: generacion de avisos, locuciones o contenido de audio pregenerado en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publica el numero de parametros; los vocoders HiFi-GAN de este tipo suelen requerir menos de 1-2 GB, pero no se confirma en la informacion).
- GPU recomendadas: no disponible. Al ejecutarse via ONNX Runtime, puede correr en CPU y en GPU compatibles con ONNX Runtime.
- Cabe en GPU de consumo: previsiblemente si, dado el perfil tipico de un vocoder HiFi-GAN, aunque no se confirma con datos publicados.
- Opciones de despliegue: ONNX Runtime a traves de la libreria phoonnx (Python y OVOS). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un vocoder).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Formato | Licencia | Contexto | Notas |
|---|---|---|---|---|---|---|
| hifigan-en_us-ljspeech-v2 | Vocoder HiFi-GAN | en-US | ONNX | Apache 2.0 | no aplica | Empaquetado por Phoonnx para phoonnx/OVOS |
| Vocoder original de Coqui (fast_pitch) | Vocoder HiFi-GAN | en-US | PyTorch (checkpoint) | Apache 2.0 | no aplica | Distribucion upstream dentro de Coqui TTS v0.6.1 |
| Otros vocoders de la coleccion Phoonnx | Vocoders (varios) | varios | ONNX | Apache 2.0 (segun model card) | no aplica | Mismo empaquetado, distinto modelo acustico asociado |

No se dispone de datos de rendimiento comparativo (MOS, latencia, throughput) en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles estadounidense (`en-US`); no es multilingue.
- Entrenado sobre LJSpeech (voz unica), por lo que la diversidad de voces es limitada: no es un modelo multihablante.
- No es un modelo TTS completo: requiere un modelo acustico (FastPitch) que produzca los espectrogramas de entrada.
- Riesgo de artefactos y alucinaciones acusticas en entradas fuera de dominio (texto con ruido, fonemas no vistos, prosodia atipica).
- No se documentan sesgos especificos, pero al derivar de un corpus de una sola hablante, puede reproducir sesgos de prosodia y estilo de esa voz.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la cadena de licencias del modelo acustico asociado y del corpus LJSpeech.
- No hay datos publicados de parametros, latencia ni calidad subjetiva (MOS), lo que dificulta evaluar su idoneidad en produccion sin pruebas propias.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, lo que indica adopcion practicamente nula y ausencia de validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/hifigan-en_us-ljspeech-v2
- Modelo acustico asociado: https://huggingface.co/Phoonnx/fastpitch-en_us-ljspeech
- Coleccion de vocoders de Phoonnx: https://huggingface.co/collections/Phoonnx/vocoders-6af8eab202014765d7fce3c9
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Upstream Coqui TTS (release v0.6.1): https://github.com/coqui-ai/TTS/releases/download/v0.6.1_models/tts_models--en--ljspeech--fast_pitch.zip
