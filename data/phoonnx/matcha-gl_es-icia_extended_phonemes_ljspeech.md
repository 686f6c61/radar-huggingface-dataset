# Phoonnx/matcha-gl_es-icia_extended_phonemes_ljspeech

## Resumen

matcha-gl_es-icia_extended_phonemes_ljspeech es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura Matcha-TTS, desarrollado originalmente por Proxecto Nos y empaquetado por Phoonnx para su uso con la libreria ONNX phoonnx. El modelo genera audio en gallego (codigo de idioma `gl`, variante `gl-ES`) a partir de texto, y su proposito es ofrecer una voz neuronal ligera y desplegable en entornos de produccion mediante inferencia ONNX.

El modelo deriva del checkpoint original `proxectonos/Nos_TTS-icia-extended-matcha-phonemes-ljspeech`, que emplea un front-end fonemico basado en el alfabeto Cotovia (fonemizador `CotoviaPhonemizer` de la libreria scriptconv). El repositorio empaquetado ocupa aproximadamente 0,1 GB, lo que indica un modelo compacto orientado a inferencia eficiente en CPU y GPU modestas.

Es relevante para desarrolladores que necesitan una voz gallega integrable en asistentes de voz (por ejemplo, el ecosistema OVOS/Mycroft), pipelines de sintesis por lotes o aplicaciones con requisitos de privacidad que prefieran ejecucion local. La licencia Apache 2.0 facilita el uso comercial, aunque conviene verificar las condiciones del modelo upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matcha-TTS (modelo acustico no autorregresivo basado en flow matching) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (sintesis por frase; sin ventana de contexto definida) |
| Tipos de cuantizacion | no disponible (pesos exportados a ONNX) |
| Idiomas soportados | gallego (`gl`, variante `gl-ES`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas Cotovia (alfabeto Cotovia) |
| Tamano del repositorio | ~0,1 GB |
| Libreria de inferencia | phoonnx |
| Autor upstream | Proxecto Nos |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Matcha-TTS, un sistema de sintesis neuronal no autorregresivo que combina un modelo acustico basado en flow matching con un vocoder (tipicamente HiFi-GAN en la familia Matcha-TTS). Matcha-TTS emplea un encoder de texto, un decoder basado en redes convolucionales y atencion, y genera espectrogramas mel de forma paralela, lo que reduce la latencia frente a modelos autorregresivos como Tacotron 2.

El modelo upstream fue entrenado por Proxecto Nos sobre el corpus Icia, segun se deduce del identificador `icia-extended` y del sufijo `ljspeech` (formato de metadatos estilo LJSpeech). El front-end utiliza fonemas extendidos del alfabeto Cotovia, un conjunto disenado especificamente para el gallego. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o ajuste fino adicional; estos datos no estan disponibles en la informacion proporcionada.

La innovacion principal de este empaquetado es la exportacion a ONNX y su integracion con phoonnx, que permite inferencia portable sin dependencia de PyTorch en tiempo de ejecucion, ademas de la normalizacion de texto y fonemizacion automatica mediante scriptconv.

## Capacidades

- Sintesis de voz (text-to-speech) en gallego a partir de texto plano.
- Normalizacion de texto y conversion a fonemas Cotovia mediante `CotoviaPhonemizer` (extra `scriptconv[gl]`).
- Generacion de audio en formato WAV mediante la API `synthesize_wav`.
- Inferencia ONNX portable, ejecutable en CPU y GPU sin requerir PyTorch.
- Integracion con el ecosistema OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`.
- Gestion de voces multiples a traves de `TTSModelManager` de phoonnx.
- No soporta tool calling, agentes, vision, audio de entrada ni modo de razonamiento; es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz locales en gallego: integracion en OVOS/Mycroft configurando el plugin `ovos-tts-plugin-phoonnx` con la voz `proxectonos/icia-extended-matcha-phonemes-ljspeech`, permitiendo respuestas habladas sin enviar texto a servicios en la nube.
- Lectura de contenido web o documentos: conversion de articulos, noticias o avisos a audio en gallego para accesibilidad o consumo pasivo, aprovechando la inferencia ONNX ligera.
- Sistemas de anuncios publicos y megafonia: generacion por lotes de locuciones en gallego para transporte, aeropuertos o comercios, con sintesis rapida por frase.
- Videojuegos y aplicaciones interactivas: sintesis de dialogos de personajes no jugadores (NPC) en gallego en tiempo de ejecucion, con latencia reducida gracias a la arquitectura no autorregresiva de Matcha-TTS.
- Audiolibros y podcast automatizados: narracion de textos largos divididos en frases, con control del flujo mediante la API de phoonnx y post-procesado de audio.
- Atencion al cliente telefonica o por voz: generacion de respuestas habladas en gallego en sistemas IVR, manteniendo la privacidad al ejecutarse localmente.
- Prototipado de investigacion en TTS: base para experimentos de sintesis en lenguas minoritarias, con licencia Apache 2.0 y pesos ONNX faciles de desplegar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el repositorio ocupa ~0,1 GB, por lo que el modelo cabe holgadamente en cualquier GPU consumer (menos de 1 GB de VRAM en la mayoria de configuraciones).
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime, incluidas RTX 3060, RTX 4090, A100 o H100; el modelo no requiere GPU de gama alta.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna e incluso en CPU.
- Opciones de despliegue: phoonnx (Python), ONNX Runtime, plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft. No se menciona soporte nativo para vLLM, llama.cpp, Ollama o TGI, que no aplican a modelos TTS de este tipo.
- Latencia y throughput estimados: no disponibles; al ser un modelo no autorregresivo y de tamano reducido, se espera baja latencia por frase, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Contexto / notas |
|---|---|---|---|---|---|
| matcha-gl_es-icia_extended_phonemes_ljspeech | Matcha-TTS | Gallego (`gl-ES`) | Apache 2.0 | ONNX | Empaquetado para phoonnx; ~0,1 GB |
| proxectonos/Nos_TTS-icia-extended-matcha-phonemes-ljspeech | Matcha-TTS | Gallego | Apache 2.0 | no disponible (checkpoint original) | Modelo upstream del que deriva este |
| Otros modelos Matcha-TTS de la coleccion Phoonnx | Matcha-TTS | Multiples idiomas | Apache 2.0 (segun cada modelo) | ONNX | Misma libreria de inferencia |
| Coqui TTS / VITS (genericos) | VITS / otros | Multiples idiomas | Varía (MPL 2.0 en Coqui) | PyTorch / ONNX | Alternativas TTS genericas; no especificas de gallego |

La comparativa con modelos especificos de gallego fuera de la familia Proxecto Nos no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo mono-idioma: solo soporta gallego (`gl-ES`); no se debe esperar calidad en castellano, portugues u otros idiomas.
- Dependencia del front-end Cotovia: la entrada debe pasar por el fonemizador `CotoviaPhonemizer`; un texto mal normalizado puede degradar la sintesis.
- Riesgo de alucinacion acustica: como todo modelo TTS, puede producir pronunciaciones erroneas en palabras fuera del dominio de entrenamiento, siglas o nombres propios.
- Sesgos de voz: no se documenta la diversidad de hablantes del corpus Icia; la voz resultante puede presentar sesgos de genero, edad o acento no declarados.
- Datos de entrenamiento no disponibles: se desconoce el tamano del dataset, la composicion y las tecnicas de ajuste, lo que dificulta evaluar su robustez.
- Licencia: Apache 2.0 declarada por el modelo upstream; conviene verificar las condiciones del corpus Icia y del checkpoint original antes de uso comercial a gran escala.
- Sin benchmarks publicados: no hay metricas objetivas (MOS, WER, latencia) en la informacion disponible.
- Popularidad muy baja (29 descargas, 0 likes): no hay validacion comunitaria amplia que respalde su calidad en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/matcha-gl_es-icia_extended_phonemes_ljspeech
- Modelo upstream: https://huggingface.co/proxectonos/Nos_TTS-icia-extended-matcha-phonemes-ljspeech
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion Matcha-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/matcha-tts-6af8ea8f6a5b1af4d985d2ad
