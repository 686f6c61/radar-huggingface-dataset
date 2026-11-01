# ghanaopenai/ghana-voice-nano-twi

## Resumen

Ghana Voice Nano · Asante Twi es un sistema de síntesis de voz (text-to-speech) en twi asante, desarrollado por ghanaopenai. Combina un modelo acústico Matcha-TTS con el vocoder universal Vocos, ambos exportados a ONNX para su ejecución con sherpa-onnx. El modelo está pensado para inferencia completamente offline en CPU, con una velocidad de aproximadamente 13 a 16 veces tiempo real usando 2 hilos, y funciona en escritorio, servidor, Android, iOS y web.

El modelo resuelve un problema concreto: la práctica ausencia de sistemas TTS ligeros y de calidad para lenguas akan de Ghana, en particular el twi asante. Frente a soluciones multilingües genéricas, ofrece una voz única entrenada sobre un corpus específico de un solo hablante (~128.000 clips de 1 a 15 segundos, mayoritariamente lecturas bíblicas), lo que permite generar habla natural en contextos formales y de lectura.

Es relevante porque demuestra que un pipeline Matcha-TTS + Vocos puede adaptarse a una lengua de bajos recursos con recursos de cómputo modestos y desplegarse en dispositivos sin GPU. La versión actual corrige un error de las estadísticas mel del checkpoint original (se usaban las de LJSpeech en inglés en lugar de las del entrenamiento en twi), lo que reduce el ruido de fondo de −23 dB a −41 dB y elimina el timbre ronco y el siseo de las publicaciones anteriores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matcha-TTS (modelo acústico, flow matching con ODE) + Vocos (vocoder neuronal universal, 22,05 kHz) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada de texto sin límite documentado) |
| Tipos de cuantizacion | no disponible (pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | tw (twi asante), ak (akan) |
| Licencia | MIT para pesos y código; datos de espeak-ng bajo GPL-3.0 |
| Formato de pesos | ONNX (`twi_steps4.onnx`, `twi_steps2.onnx`, `vocos-22khz-univ.onnx`); checkpoint PyTorch Lightning (`twi_epoch045.ckpt`) para reentrenamiento |

## Arquitectura y entrenamiento

El sistema sigue la arquitectura Matcha-TTS: un modelo acústico basado en flow matching que genera mel-espectrogramas mediante integración de una ecuación diferencial ordinaria (ODE). Se ofrecen dos variantes según el número de pasos ODE: `twi_steps4.onnx` (4 pasos, calidad por defecto) y `twi_steps2.onnx` (2 pasos, más rápido y algo más áspero). La señal mel se convierte en audio con Vocos, un vocoder neuronal universal a 22,05 kHz. Todo el pipeline se exporta a ONNX y se ejecuta mediante sherpa-onnx, que aporta el frontend de texto.

El modelo parte del checkpoint Matcha-TTS entrenado con LJSpeech en inglés y se ajusta finamente durante 45 épocas sobre el subconjunto de twi asante del dataset `michsethowusu/ghana-speech`, con un único hablante y aproximadamente 128.000 clips de 1 a 15 segundos, en su mayoría lecturas bíblicas. Las estadísticas mel del entrenamiento son media −5,7856 y desviación típica 3,5683. El frontend de texto utiliza la voz `lfn` (Lingua Franca Nova) de espeak-ng, que lee la ortografía twi (incluidos los caracteres `ɛ` y `ɔ`) como IPA; en 102 frases de prueba, los fonemas generados en dispositivo por sherpa-onnx coinciden exactamente con los fonemas de entrenamiento. La corrección principal respecto a `michsethowusu/matcha-twi` y `ghananlpcommunity/nano-twi` es el uso de las estadísticas mel correctas en la desnormalización, que antes comprimía el rango dinámico al ~58 % y producía siseo y voz ronca.

## Capacidades

- Síntesis de voz offline en twi asante a partir de texto, con una única voz (no es un modelo de clonación de voz).
- Generación de audio a 22,05 kHz mediante el vocoder Vocos.
- Ejecución en CPU sin GPU, con un rendimiento de aproximadamente 13 a 16 veces tiempo real con 2 hilos.
- Despliegue multiplataforma: escritorio, servidor, Android, iOS y web a través de sherpa-onnx.
- Dos modos de calidad/velocidad seleccionables mediante el número de pasos ODE (4 o 2).
- Control de velocidad de habla en la generación (`speed`) y ajuste de `noise_scale` y `length_scale`.
- Procesamiento de la ortografía twi, incluidos los caracteres especiales `ɛ` y `ɔ`, mediante el frontend espeak-ng `lfn`.
- No dispone de tool calling, razonamiento multi-paso, visión ni audio de entrada; es exclusivamente un modelo de texto a voz.

## Casos de uso

- Lectura accesible de textos en twi: integración en aplicaciones de lectores de pantalla o de lectura asistida para personas con discapacidad visual, generando audio local en el dispositivo sin conexión y con latencia baja gracias a la inferencia en CPU.
- Audiolibros y contenido religioso: el modelo está entrenado mayoritariamente con lecturas bíblicas, por lo que es adecuado para narrar pasajes y textos formales en twi asante con una prosodia de lectura natural.
- Asistentes de voz para dispositivos de bajo consumo: al ejecutarse en Android, iOS y web mediante sherpa-onnx, puede incorporarse en aplicaciones móviles sin depender de servicios en la nube, preservando la privacidad del texto del usuario.
- Aprendizaje de la lengua twi: generación de pronunciaciones de referencia para estudiantes, con control de velocidad para facilitar la escucha de palabras y frases.
- Anuncios y avisos automatizados en twi: sistemas de megafonía, notificaciones o interfaces de voz para servicios públicos en Ghana que necesiten mensajes hablados en lengua local.
- Prototipado e investigación en TTS de bajos recursos: el checkpoint PyTorch Lightning (`twi_epoch045.ckpt`) permite ajustar el modelo a otras lenguas o hablantes, y el repositorio de código incluye la receta de entrenamiento y una API en Modal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los únicos datos de rendimiento documentados son operativos: aproximadamente 13 a 16 veces tiempo real en CPU con 2 hilos, y una reducción del ruido de fondo de −23 dB a −41 dB en frases reales en twi tras corregir las estadísticas mel.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está diseñado para ejecutarse en CPU. El repositorio completo ocupa 0,3 GB.
- GPU recomendadas: no se requieren. No se documenta soporte ni requisitos de GPU.
- Cabe en cualquier GPU de consumo e incluso en dispositivos móviles, ya que la inferencia se realiza en CPU.
- Opciones de despliegue: sherpa-onnx (versión 1.x; la 2.x no es compatible porque eliminó el frontend espeak-ng para modelos Matcha), el paquete `ghana-voice-nano` instalable desde GitHub, y exportación ONNX para integración directa.
- Latencia y throughput: aproximadamente 13 a 16 veces tiempo real con 2 hilos en CPU de escritorio o servidor.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|
| Ghana Voice Nano · Asante Twi | Matcha-TTS + Vocos (ONNX) | tw, ak | MIT (pesos y código); espeak-ng GPL-3.0 | sherpa-onnx, CPU, móvil y web | Voz única, ~128k clips, corrección de estadísticas mel |
| `michsethowusu/matcha-twi` | Matcha-TTS | tw | no disponible | no disponible | Mismos pesos (época 45) con estadísticas mel incorrectas; salida con siseo y voz ronca |
| `ghananlpcommunity/nano-twi` | Matcha-TTS | tw | no disponible | no disponible | Variante de la anterior con el mismo defecto de desnormalización |

No se dispone de datos de benchmarks comparativos entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Entrenado mayoritariamente con escrituras leídas, por lo que rinde mejor en twi formal y de estilo leído que en registros coloquiales o conversacionales.
- Los dígitos se leen según las reglas de espeak `lfn`, no como palabras numéricas en twi; para resultados naturales conviene escribir los números con letras.
- Las palabras en inglés insertadas en texto twi se pronuncian con fonética similar al twi.
- Es un modelo de voz única; no permite clonación de voz ni selección de hablante.
- No es compatible con sherpa-onnx 2.x, que eliminó el frontend espeak-ng para modelos Matcha; debe usarse la rama 1.x (`>=1.12,<2`).
- Riesgo de alucinación acústica y artefactos en entradas fuera de dominio (texto muy corto, símbolos, mezcla de idiomas), aunque la corrección de las estadísticas mel reduce notablemente el ruido de fondo.
- La licencia MIT cubre los pesos y el código, pero los datos de espeak-ng están bajo GPL-3.0, lo que debe tenerse en cuenta en la distribución del paquete completo.
- No se documentan sesgos demográficos ni de otro tipo; al provenir de un único hablante y de un corpus de lectura bíblica, la diversidad prosódica y de registro es limitada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ghanaopenai/ghana-voice-nano-twi
- Demo (Space): https://huggingface.co/spaces/ghanaopenai/ghana-voice-nano-twi
- Repositorio de código, receta de entrenamiento, API en Modal y guía móvil: https://github.com/ghanaopenai/ghana-voice-nano
- Matcha-TTS: https://github.com/shivammehta25/Matcha-TTS
- Vocos: https://github.com/gemelo-ai/vocos
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Dataset ghana-speech: https://huggingface.co/datasets/michsethowusu/ghana-speech
