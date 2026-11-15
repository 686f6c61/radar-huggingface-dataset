# Phoonnx/vocos-multi-alvocat-22khz

## Resumen

`vocos-multi-alvocat-22khz` es un vocoder neuronal publicado por Phoonnx como empaquetado ONNX del modelo original `projecte-aina/alvocat-vocos-22khz` desarrollado por Projecte AINA. Su funcion es convertir espectrogramas generados por modelos acusticos de sintesis de voz (FastPitch, Matcha, MixerTTS) en audio de dominio temporal a 22 kHz. No es un modelo de texto a voz completo, sino la etapa final del pipeline TTS: el componente que reconstruye la onda a partir de la representacion frecuencial.

El modelo se distribuye dentro del ecosistema phoonnx, una libreria Python de TTS basada en ONNX, y se descarga automaticamente junto con las voces que lo requieren, por lo que el usuario final no necesita gestionarlo de forma independiente. Esta empaquetado para dar soporte a voces en catalan (`ca`) e ingles estadounidense (`en-US`) dentro de dicho ecosistema.

Su relevancia es practica: permite ejecutar TTS local en CPU o GPU sin dependencias de frameworks de deep learning pesados, con un repositorio de apenas 0,1 GB y pesos en formato ONNX. La licencia del modelo original es CC-BY-NC-4.0, lo que restringe el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vocos (vocoder neuronal con ISTFT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (vocoder, opera sobre espectrogramas) |
| Tipos de cuantizacion | no disponible (pesos ONNX) |
| Idiomas soportados | catalan (`ca`), ingles estadounidense (`en-US`) |
| Licencia | CC-BY-NC-4.0 (upstream); empaquetado declarado como `other` |
| Formato de pesos | ONNX |
| Frecuencia de muestreo de salida | 22 kHz |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Vocos, un vocoder neuronal que combina un backbone transformer sobre representaciones frecuenciales con una capa de ISTFT (transformada inversa de Fourier de corto tiempo) para sintetizar la forma de onda. A diferencia de los vocoders autoregresivos o basados en difusion, Vocos opera en una sola pasada sobre el espectrograma, lo que reduce la latencia de inferencia y simplifica el despliegue.

El entrenamiento corresponde al modelo upstream `projecte-aina/alvocat-vocos-22khz` de Projecte AINA; la model card no detalla el numero de tokens de audio, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o ajuste fino especifico. Esta version de Phoonnx es un empaquetado del modelo original en ONNX para su uso con la libreria phoonnx, sin cambios arquitectonicos documentados.

## Capacidades

- Conversion de espectrogramas a audio de 22 kHz (sintesis de forma de onda).
- Integracion como etapa final de pipelines TTS con modelos acusticos FastPitch, Matcha y MixerTTS.
- Soporte de voces multihablante en catalan (Matcha multispeaker) e ingles estadounidense (LJSpeech, VCTK).
- Ejecucion via ONNX Runtime, con despliegue en CPU y GPU sin framework de entrenamiento.
- Descarga y gestion automatica a traves de phoonnx y su indice de voces.
- No realiza texto a voz por si mismo: requiere un modelo acustico que genere el espectrograma de entrada.
- No soporta tool calling, agentes, vision ni modo de razonamiento (no aplica a su funcion).

## Casos de uso

- Sintesis de voz en catalan con multiples hablantes: combinado con `matcha-ca-multispeaker_acoustic`, permite generar audio en catalan para asistentes y lectores de pantalla, aprovechando el soporte multihablante del modelo acustico emparejado.
- Asistentes de voz embebidos en ingles: junto con FastPitch o MixerTTS, se usa como etapa de sintesis en dispositivos con recursos limitados gracias al formato ONNX y al reducido tamano del repositorio (0,1 GB).
- Lectura de contenido en aplicaciones de accesibilidad: convierte texto a voz en tiempo real en local, sin enviar datos a servicios en la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Prototipado de pipelines TTS: al integrarse en phoonnx con descarga automatica, sirve para evaluar rapidamente distintas voces y modelos acusticos sin gestion manual de dependencias.
- Generacion de audiolibros y locuciones en catalan: la salida a 22 kHz es suficiente para contenido hablado de uso general en aplicaciones no comerciales (limitado por la licencia).
- Integracion en OVOS (OpenVoiceOS): el ecosistema phoonnx lo utiliza como vocoder por defecto para voces compatibles, lo que permite dotar de sintesis de voz a asistentes de codigo abierto basados en OVOS.
- Investigacion en sintesis de voz: sirve como componente de referencia para comparar vocoders y estudiar el impacto de la etapa de reconstruccion en la calidad percibida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio de 0,1 GB sugiere un consumo de memoria muy bajo, apto para CPU.
- GPU recomendadas: no disponible; al tratarse de un vocoder ligero en ONNX, no requiere GPU dedicada.
- Cabe en GPU de consumo: previsiblemente si, en cualquier GPU consumer con soporte ONNX Runtime; no hay datos oficiales de compatibilidad.
- Opciones de despliegue: ONNX Runtime a traves de la libreria phoonnx (Python y OVOS). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un vocoder.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Frecuencia de salida | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vocos-multi-alvocat-22khz (este) | Vocoder Vocos | 22 kHz | ONNX | CC-BY-NC-4.0 (upstream) | Hugging Face (Phoonnx) |
| projecte-aina/alvocat-vocos-22khz | Vocoder Vocos | 22 kHz | no disponible | CC-BY-NC-4.0 | Hugging Face (Projecte AINA) |
| HiFi-GAN | Vocoder GAN | variable (tipicamente 22,05 kHz) | PyTorch | variable segun version | Multiple |
| BigVGAN | Vocoder GAN | variable (hasta 44,1 kHz) | PyTorch | MIT | Hugging Face |

La comparativa se limita a caracteristicas publicas; no se dispone de datos de rendimiento comparativo entre estos vocoders en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia upstream es CC-BY-NC-4.0, que prohibe el uso comercial; el empaquetado declara `other`, por lo que conviene verificar los terminos antes de cualquier despliegue en produccion.
- No es un modelo de texto a voz autonomo: sin un modelo acustico que genere espectrogramas no produce audio.
- Solo cubre voces en catalan e ingles estadounidense; no hay soporte documentado para otros idiomas.
- La calidad del audio depende en gran medida del modelo acustico emparejado y de la calidad del espectrograma de entrada.
- No se documentan sesgos especificos, pero al derivar de voces de LJSpeech y VCTK puede heredar sesgos de hablante, acento y genero presentes en esos corpus.
- No hay datos publicados sobre alucinaciones, ya que la tarea no es generativa en texto; el riesgo se traslada al modelo acustico.
- No se dispone de informacion sobre cuantizaciones adicionales ni sobre rendimiento en hardware concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vocos-multi-alvocat-22khz
- Modelo upstream: https://huggingface.co/projecte-aina/alvocat-vocos-22khz
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion de vocoders de Phoonnx: https://huggingface.co/collections/Phoonnx/vocoders-6af8eab202014765d7fce3c9
- Voces compatibles: [fastpitch-en_us-ljspeech_speedyspeech](https://huggingface.co/Phoonnx/fastpitch-en_us-ljspeech_speedyspeech), [fastpitch-en_us-vctk](https://huggingface.co/Phoonnx/fastpitch-en_us-vctk), [matcha-ca-multispeaker_acoustic](https://huggingface.co/Phoonnx/matcha-ca-multispeaker_acoustic), [mixertts-en_us-ljspeech-128](https://huggingface.co/Phoonnx/mixertts-en_us-ljspeech-128), [mixertts-en_us-ljspeech-384](https://huggingface.co/Phoonnx/mixertts-en_us-ljspeech-384), [mixertts-en_us-ljspeech-80](https://huggingface.co/Phoonnx/mixertts-en_us-ljspeech-80)
