# Phoonnx/vits-de_de-thorsten_emotional-medium

## Resumen

El modelo `vits-de_de-thorsten_emotional-medium` es un sintetizador de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo convierte texto en alemán (`de-DE`) en audio inteligible, tomando como entrada fonemas espeak en alfabeto IPA, y está pensado para su uso en asistentes de voz locales y sistemas embebidos.

La relevancia de este modelo reside en su formato ONNX ligero (repo de 0,1 GB) y su integración con el ecosistema OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`, lo que permite desplegar TTS en alemán sin depender de servicios en la nube. La variante `thorsten_emotional` apunta a un estilo de locución con carga emocional, dentro de la familia de voces Piper para alemán.

Se trata de un modelo especializado y de nicho: no es un LLM, sino un sistema TTS neuronal con licencia MIT, orientado a pipelines de síntesis de voz de baja latencia y ejecución en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech neuronal end-to-end) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS; entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | aleman (`de-DE`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un sistema neuronal end-to-end que combina un encoder de texto, un prior variacional, un decoder generativo y un discriminador adversarial entrenado conjuntamente. VITS produce audio de forma directa a partir de fonemas, sin necesidad de un vocoder separado en tiempo de inferencia, lo que reduce la latencia y simplifica el despliegue.

El modelo procede del repositorio `rhasspy/piper-voices` (ruta `de/de_DE/thorsten_emotional/medium`), donde Rhasspy publica voces Piper entrenadas sobre datasets de voz. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o fine-tuning adicional. La variante `medium` indica un compromiso entre calidad y tamaño dentro de la escala de voces Piper.

La innovación práctica del empaquetado Phoonnx es la conversión a ONNX y la integración con `scriptconv`, que normaliza el texto y lo convierte a fonemas espeak antes de la síntesis.

## Capacidades

- Síntesis de voz en alemán (`de-DE`) a partir de texto, con salida en formato WAV.
- Estilo de locución "emotional" según la denominación de la variante.
- Fonemización mediante espeak-ng (o el port espyak incluido en el extra `phoonnx[espeak]`).
- Integración con OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador a través de `phoonnx.js` (con entrada espeak o unicode).
- Inferencia ONNX, apta para CPU y entornos sin GPU.
- No soporta tool calling, agentes, visión, audio de entrada ni razonamiento multi-paso (no es un LLM).

## Casos de uso

- Asistentes de voz locales en alemán: integración en OVOS/Mycroft mediante `ovos-tts-plugin-phoonnx`, configurando la voz en `mycroft.conf` para respuestas habladas sin conexión a la nube.
- Lectura de notificaciones y alertas en sistemas domóticos: el modelo sintetiza frases cortas en alemán con baja latencia al ejecutarse en ONNX sobre CPU.
- Síntesis en aplicaciones de escritorio: uso de la API Python `TTSModelManager` para generar archivos WAV a partir de texto en pipelines de escritorio.
- Síntesis en el navegador: mediante `phoonnx.js`, permite reproducir voz alemana en aplicaciones web sin backend de TTS.
- Prototipado de interfaces conversacionales: al ser un modelo ligero (0,1 GB) y con licencia MIT, es adecuado para pruebas de concepto de UX de voz en alemán.
- Accesibilidad: generación de audio para lectores de pantalla o contenidos educativos en alemán en entornos con recursos limitados.
- Evaluación de voces Piper: sirve como referencia para comparar variantes `thorsten_emotional` frente a otras voces de la colección VITS de Phoonnx.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de 0,1 GB, es probable que funcione en CPU sin GPU dedicada, aunque no se especifican cifras oficiales.
- GPU recomendadas: no disponibles; el diseño ONNX y el tamaño reducido sugieren que no requiere GPU.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; por tamaño, cabría esperar ejecución en CPU y GPUs de gama baja, pero no se aportan datos.
- Opciones de despliegue: librería `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft, y `phoonnx.js` para navegador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano repo | Licencia | Formato |
|---|---|---|---|---|---|
| vits-de_de-thorsten_emotional-medium (este) | VITS | de-DE | 0,1 GB | MIT | ONNX |
| Otras voces Piper `de_DE` en rhasspy/piper-voices | VITS | de-DE | no disponible | MIT (según upstream) | ONNX |
| Otras voces de la coleccion VITS de Phoonnx | VITS | varios | variable | MIT (según upstream) | ONNX |

No se dispone de datos de rendimiento comparativo (MOS, latencia) en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Solo soporta alemán (`de-DE`); no es multilingüe.
- Requiere espeak-ng instalado para la fonemización; con espyak algunos fonemas difieren y pueden producir palabras mal pronunciadas.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes.
- Riesgo de pronunciación incorrecta en palabras fuera del dominio de entrenamiento o en neologismos.
- No se dispone de información sobre sesgos del dataset de voz ni sobre la diversidad de hablantes.
- Calidad y naturalidad no cuantificadas (sin MOS publicado en la información disponible).
- Licencia MIT declarada por el upstream; conviene verificar los términos de la model card original de `rhasspy/piper-voices` antes de uso comercial a gran escala.
- El modelo tiene muy baja adopción (29 descargas, 0 likes) en el momento de la consulta, lo que limita la validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-de_de-thorsten_emotional-medium
- Upstream Piper: https://huggingface.co/rhasspy/piper-voices/tree/main/de/de_DE/thorsten_emotional/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
