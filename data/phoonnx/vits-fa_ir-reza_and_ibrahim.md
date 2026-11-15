# Phoonnx/vits-fa_ir-reza_and_ibrahim

## Resumen

`vits-fa_ir-reza_and_ibrahim` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por el usuario mah92 y empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo está especializado en persa de Irán (`fa-IR`) y toma como entrada fonemas generados por espeak-ng en alfabeto IPA, lo que lo integra en un pipeline de TTS determinista y ligero.

La relevancia de este modelo radica en su formato: los pesos se distribuyen en ONNX, lo que permite ejecución eficiente en CPU sin dependencias de frameworks de deep learning pesados, y su integración directa con el ecosistema OVOS (Open Voice OS) mediante el plugin `ovos-tts-plugin-phoonnx`. Con un tamaño de repositorio de 0,1 GB, está pensado para despliegues en dispositivos con recursos limitados, asistentes de voz embebidos y aplicaciones de lectura en persa.

Se trata de un modelo de nicho, con 28 descargas y sin datos publicados de benchmarks, entrenamiento o evaluación subjetiva. Su interés principal es práctico: cubre una lengua con poca cobertura en TTS open source y se publica bajo licencia CC0-1.0, lo que elimina restricciones de atribución para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS, generativa adversarial con flujo normalizador) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; el repo ocupa 0,1 GB) |
| Idiomas soportados | persa de Irán (`fa-IR`) |
| Licencia | CC0-1.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un prior condicional con flujo normalizador, un decodificador generativo y un discriminador multiperiodo durante el entrenamiento. El modelo produce audio directamente a partir de fonemas sin necesidad de un vocoder externo, lo que simplifica el despliegue. La entrada de texto se procesa mediante `EspeakPhonemizer` de la librería `scriptconv`, que normaliza el texto y lo convierte a fonemas IPA usando espeak-ng.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas más allá de las propias de VITS. El modelo upstream es `mah92/Reza-And-Ibrahim-FA_EN-Piper-TTS-Model`, y Phoonnx se limita a empaquetarlo en ONNX para su librería. No consta información sobre el proceso de conversión ni sobre posibles pérdidas de calidad respecto al modelo original.

## Capacidades

- Síntesis de voz a partir de texto en persa de Irán (`fa-IR`), con salida en formato WAV.
- Fonemización mediante espeak-ng (o el port espyak incluido en el extra `phoonnx[espeak]`), con normalización de texto a través de `scriptconv`.
- Ejecución en CPU mediante ONNX Runtime, sin requerir GPU.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Ejecución en navegador mediante `phoonnx.js`, con demo en vivo disponible.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, visión, audio de entrada ni modo thinking; es exclusivamente un modelo TTS.
- Capacidad multilingüe limitada al persa; el nombre del modelo upstream menciona `FA_EN`, pero la model card empaquetada solo declara `fa-IR`.

## Casos de uso

- Asistentes de voz embebidos en persa: el modelo puede integrarse en OVOS como motor TTS para responder a comandos de voz en `fa-IR`, con inferencia en CPU y un peso de repositorio de 0,1 GB que cabe en dispositivos de gama baja.
- Lectura de textos y noticias en persa: dado que acepta texto plano y lo fonemiza con espeak-ng, puede usarse para convertir artículos o documentos a audio en aplicaciones de accesibilidad.
- Sistemas de navegación con instrucciones habladas en persa: la baja latencia esperada de un modelo VITS en ONNX permite generar indicaciones cortas de forma interactiva.
- Automatización de atención al cliente por voz en persa: el modelo puede sintetizar respuestas predefinidas o generadas por un LLM en un pipeline de IVR, aunque la calidad y naturalidad no están documentadas.
- Aplicaciones educativas de aprendizaje de persa: permite generar pronunciaciones de palabras y frases para materiales didácticos, con la salvedad de que espyak puede producir fonemas distintos a espeak-ng y alterar algunas palabras.
- Integración en el navegador mediante `phoonnx.js`: útil para demos web de TTS en persa sin backend, con la limitación de que la calidad en navegador depende del soporte de espeak o entrada Unicode.
- Prototipado rápido de interfaces de voz: al instalarse con `pip install --pre phoonnx` y cargarse mediante `TTSModelManager`, permite validar flujos de TTS en persa con pocas líneas de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo está diseñado para inferencia en CPU mediante ONNX Runtime, con un tamaño de repositorio de 0,1 GB.
- GPU recomendadas: no disponibles; no se documenta soporte GPU ni requisitos de aceleración.
- Cabe en GPU consumer: sí, por tamaño, aunque no se documenta ejecución en GPU; el caso de uso previsto es CPU.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, `phoonnx.js` para navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- Latencia y throughput: no disponibles. La dependencia de espeak-ng para la fonemización añade un paso previo a la inferencia cuyo coste no se cuantifica.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| `Phoonnx/vits-fa_ir-reza_and_ibrahim` | VITS | `fa-IR` | no aplica | CC0-1.0 | ONNX | Hugging Face, 28 descargas |
| `mah92/Reza-And-Ibrahim-FA_EN-Piper-TTS-Model` (upstream) | VITS (Piper) | `fa-IR` / `en` | no aplica | CC0-1.0 (declarada en upstream) | no disponible | Hugging Face |
| Otros modelos VITS de la colección Phoonnx | VITS | varios | no aplica | variable | ONNX | Hugging Face |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho con muy poca validación comunitaria: 28 descargas y 0 likes en el momento de la ficha, sin benchmarks ni evaluaciones subjetivas publicadas.
- La fonemización depende de espeak-ng; si se usa el port espyak, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, según advierte la propia model card.
- El nombre del modelo upstream sugiere soporte `FA_EN`, pero la model card empaquetada solo declara `fa-IR`; no se garantiza la calidad en inglés.
- No hay información sobre sesgos, alucinaciones (en TTS, artefactos o pronunciaciones incorrectas) ni comportamiento en textos largos o con caracteres no persas.
- Licencia CC0-1.0: sin restricciones de uso comercial ni atribución, pero se recomienda verificar la procedencia de los datos de entrenamiento originales, no documentada.
- El modelo requiere la instalación de espeak-ng o del extra `phoonnx[espeak]`; sin ello, la síntesis no funciona.
- No apto para tareas de razonamiento, código, visión o agentes; es exclusivamente un modelo de síntesis de voz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-fa_ir-reza_and_ibrahim
- Modelo upstream: https://huggingface.co/mah92/Reza-And-Ibrahim-FA_EN-Piper-TTS-Model
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
