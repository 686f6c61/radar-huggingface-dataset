# Phoonnx/vits-nl_be-nathalie-medium-espeak

## Resumen

vits-nl_be-nathalie-medium-espeak es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y reempaquetado por Phoonnx para su librería ONNX de TTS. El modelo genera voz femenina en neerlandés de Bélgica (nl-BE) a partir de texto, utilizando fonemas del alfabeto IPA producidos por espeak-ng como entrada al sintetizador.

La relevancia de este modelo radica en su formato: es un artefacto ONNX ligero (el repositorio ocupa aproximadamente 0,1 GB) pensado para inferencia local y de baja latencia, sin dependencia de GPUs de gran tamaño ni de servicios en la nube. Se integra en el ecosistema OVOS (Open Voice OS) mediante el plugin `ovos-tts-plugin-phoonnx`, lo que lo hace útil para asistentes de voz autoalojados.

No se dispone de información sobre el número de parámetros, la longitud de contexto (no aplica en TTS) ni datos de entrenamiento más allá de su origen en Piper. La licencia es MIT y el idioma soportado es exclusivamente neerlandés de Bélgica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference TTS, extremo a extremo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada limitada por la frase a sintetizar) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en formato ONNX) |
| Idiomas soportados | neerlandés de Bélgica (nl-BE) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | ~0,1 GB |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador basado en normalizing flows y un discriminador adversarial (GAN) durante el entrenamiento, junto con un decodificador de audio (HiFi-GAN en la formulación original). El modelo produce formas de onda directamente a partir de fonemas, sin necesidad de un vocoder externo en tiempo de inferencia.

En este caso concreto, el modelo procede de `rhasspy/piper-voices/nl/nl_BE/nathalie/medium`, es decir, una voz de calidad "medium" del proyecto Piper. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en TTS). La innovación destacable es el empaquetado en ONNX para phoonnx y su integración con el fonemizador `EspeakPhonemizer` de la librería `scriptconv`, que normaliza el texto y lo convierte a fonemas IPA antes de la síntesis.

## Capacidades

- Síntesis de voz (text-to-speech) en neerlandés de Bélgica (nl-BE) con voz femenina identificada como "nathalie".
- Generación de audio en formato WAV mediante `voice.synthesize_wav(text, wav_file)`.
- Entrada basada en fonemas espeak-ng (IPA), lo que permite control fino de la pronunciación si se generan fonemas manualmente.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx` y configuración vía `mycroft.conf`.
- Ejecución en navegador a través de phoonnx.js (con entrada espeak o unicode), según la documentación del proyecto.
- No soporta tool calling, agentes, razonamiento multi-step, visión ni audio de entrada; es exclusivamente un modelo de síntesis.

## Casos de uso

- Asistentes de voz autoalojados: integración en OVOS como módulo TTS para respuestas habladas en neerlandés de Bélgica, configurando el plugin `ovos-tts-plugin-phoonnx` en `mycroft.conf`.
- Lectura de contenido en aplicaciones locales: síntesis de artículos, notificaciones o mensajes en flamenco sin enviar texto a servicios externos, gracias al formato ONNX ligero.
- Sistemas de accesibilidad: conversión de texto a voz para usuarios con discapacidad visual en entornos de habla neerlandesa belga, ejecutándose en CPU.
- Generación de audio para pruebas y prototipos: creación rápida de clips WAV en pipelines de desarrollo con `pip install --pre phoonnx` y espeak-ng.
- Automatización de avisos e IVR: mensajes pregrabados dinámicos para centralitas telefónicas o sistemas de megafonía en nl-BE, con baja huella de memoria (~0,1 GB de pesos).
- Síntesis en el navegador: uso con phoonnx.js para demos web o aplicaciones cliente sin backend, mediante la demo de tigregotico.pt.
- Investigación en TTS: punto de partida para experimentos de fonemización y evaluación de voces Piper en neerlandés, al ser un artefacto ONNX reproducible y de licencia MIT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (~0,1 GB) es plausible ejecutarlo en CPU con pocos cientos de MB de RAM, aunque no se confirma en la información proporcionada.
- GPU recomendadas: no disponible. Al ser un modelo ONNX de voz "medium", no requiere GPU dedicada; puede ejecutarse en CPU.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en cualquier GPU de consumo e incluso en CPU, dado el tamaño reducido del artefacto; sin cifras oficiales de latencia.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, phoonnx.js en navegador. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| vits-nl_be-nathalie-medium-espeak (este) | VITS | nl-BE | MIT | ONNX | Hugging Face (Phoonnx) |
| rhasspy/piper-voices nl_BE nathalie medium (upstream) | VITS | nl-BE | MIT | Piper/ONNX | Hugging Face (Rhasspy) |
| Otras voces VITS de la colección Phoonnx | VITS | varios | MIT (según origen) | ONNX | Hugging Face (Phoonnx) |

No se dispone de datos de rendimiento comparativo (MOS, latencia) en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Idioma restringido: solo neerlandés de Bélgica (nl-BE); no soporta castellano ni otros idiomas.
- Dependencia de espeak-ng: sin el binario instalado, la calidad puede degradarse; el uso de espyak puede pronunciar mal algunas palabras, según advierte el autor.
- Calidad "medium": no es una voz de alta fidelidad; puede presentar artefactos propios de modelos Piper de tamaño medio.
- Riesgo de pronunciación incorrecta en palabras fuera del dominio de entrenamiento o en siglas y números, dependiente de la normalización de `scriptconv`.
- No apta para clonación de voz ni control emocional; es una voz fija.
- Licencia MIT: permite uso comercial, pero se recomienda verificar la procedencia upstream en `rhasspy/piper-voices` y las licencias de espeak-ng y sus datos.
- Sin datos publicados de sesgos, MOS ni evaluaciones subjetivas; se recomienda validación propia antes de producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema muy incipiente, soporte comunitario limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-nl_be-nathalie-medium-espeak
- Upstream Piper: https://huggingface.co/rhasspy/piper-voices/tree/main/nl/nl_BE/nathalie/medium
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
