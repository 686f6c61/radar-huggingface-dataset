# Phoonnx/vits-fa-custom_female

## Resumen

vits-fa-custom_female es un modelo de síntesis de voz (text-to-speech) en persa (`fa`) basado en la arquitectura VITS de Coqui, empaquetado por Phoonnx en formato ONNX para su uso con la librería `phoonnx`. El modelo deriva del checkpoint original `Kamtera/persian-tts-female-vits`, publicado por Coqui, y se distribuye como una voz femenina preentrenada lista para inferencia en Python y en el ecosistema OVOS (Open Voice OS). Su propósito es ofrecer TTS neuronal de calidad razonable en persa sin necesidad de infraestructura pesada: el repositorio ocupa apenas 0,1 GB.

La relevancia de este empaquetado radica en la portabilidad: al convertir el modelo a ONNX, se puede ejecutar tanto en servidor como en navegador (mediante `phoonnx.js`) y en asistentes de voz basados en OVOS, con una dependencia mínima (`pip install --pre phoonnx`). El front-end textual delega en `scriptconv`, que normaliza el texto y lo convierte a fonemas IPA mediante `espeak-ng` (o su port `espyak`).

No se dispone de información sobre el número de parámetros, la longitud de contexto ni los datos de entrenamiento originales en la documentación proporcionada. El modelo está pensado exclusivamente para síntesis de voz en persa y no soporta otras tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | persa (`fa`) |
| Licencia | openrail (el model card menciona ademas CC-BY-4.0 en las notas de licencia) |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Pipeline | text-to-speech |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura de TTS neuronal end-to-end que combina un codificador de texto, un predictor de duración, un flujo normalizador y un decodificador generativo adversario, junto con un discriminador multiperiodo para el entrenamiento. Permite generar audio de forma directa a partir de fonemas sin necesidad de un modelo acústico y un vocoder separados.

El modelo original fue entrenado por Coqui (checkpoint `Kamtera/persian-tts-female-vits`) y posteriormente empaquetado por Phoonnx en ONNX. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente a TTS). El front-end textual usa `scriptconv` con `EspeakPhonemizer` para normalizar y fonemizar la entrada en persa.

## Capacidades

- Síntesis de voz (TTS) en persa a partir de texto, con voz femenina.
- Fonemización de entrada mediante `espeak-ng` (o `espyak` como alternativa vía extra de pip).
- Generación de audio en formato WAV mediante `voice.synthesize_wav(text, wav_file)`.
- Integración como plugin de OVOS (`ovos-tts-plugin-phoonnx`) para asistentes de voz.
- Ejecución en navegador mediante `phoonnx.js` (demo en tigregotico.pt/demo).
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- Capacidad multilingüe: únicamente persa.

## Casos de uso

- Asistentes de voz en OVOS: el modelo se instala como plugin `ovos-tts-plugin-phoonnx` y se selecciona en `mycroft.conf`, permitiendo respuestas habladas en persa en asistentes domésticos sin infraestructura GPU dedicada.
- Lectura de contenido en persa: conversión de artículos, noticias o documentos a audio mediante `synthesize_wav`, útil para accesibilidad o consumo pasivo de texto.
- Síntesis en navegador: con `phoonnx.js` se puede generar voz persa en el cliente sin enviar texto a un servidor, lo que reduce latencia y mejora la privacidad.
- Prototipado de aplicaciones de voz: el reducido tamaño del repositorio (0,1 GB) y la instalación vía pip permiten iterar rápidamente en demos y pruebas de concepto.
- Integración en pipelines de accesibilidad: generación de pistas de audio para interfaces o contenidos dirigidos a usuarios persa-hablantes con discapacidad visual.
- Pruebas de localización: evaluación de la calidad de TTS en persa antes de adoptar una solución comercial, usando el modelo como línea base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio (0,1 GB) sugiere que el modelo es ligero y probablemente ejecutable en CPU.
- GPU recomendadas: no disponible en la documentación.
- Compatibilidad con GPU de consumo: no confirmada, pero el tamaño reducido hace probable que funcione en CPU y en GPUs modestas.
- Opciones de despliegue: `phoonnx` (Python), `ovos-tts-plugin-phoonnx` (OVOS), `phoonnx.js` (navegador).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| vits-fa-custom_female | VITS (ONNX) | fa | openrail | ONNX | Hugging Face (Phoonnx) |
| Kamtera/persian-tts-female-vits | VITS | fa | openrail | no disponible | Hugging Face (upstream) |
| Otras voces de la colección VITS de Phoonnx | VITS (ONNX) | varios | openrail | ONNX | Hugging Face (colección Phoonnx) |

No se dispone de datos de rendimiento comparativo entre estos modelos.

## Limitaciones y advertencias

- Solo soporta persa; no es multilingüe.
- La fonemización depende de `espeak-ng`; si se usa `espyak`, algunos fonemas difieren y pueden producir palabras mal pronunciadas, según advierte el autor.
- No se dispone de información sobre sesgos del dataset de entrenamiento original.
- Riesgo de alucinación no aplica en el sentido textual, pero puede haber errores de pronunciación o prosodia en textos fuera de dominio.
- Licencia: el model card declara `openrail`, pero las notas de licencia mencionan `CC-BY-4.0`; conviene verificar las condiciones exactas antes de uso comercial.
- El modelo es una conversión a ONNX del checkpoint de Coqui; no se documentan métricas de calidad ni evaluaciones formales.
- Uso limitado a TTS: no admite otras tareas (razonamiento, código, visión).

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-fa-custom_female
- Modelo upstream: https://huggingface.co/Kamtera/persian-tts-female-vits
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
