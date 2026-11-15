# Phoonnx/optispeech-en_us-lightspeech_emily

## Resumen

optispeech-en_us-lightspeech_emily es un modelo de síntesis de voz (text-to-speech) para inglés estadounidense, empaquetado por Phoonnx a partir del modelo original de mush42 publicado en el repositorio mush42/optispeech. Se distribuye en formato ONNX y está pensado para ejecutarse con la librería phoonnx, que actúa como motor de inferencia y ofrece integración directa con el ecosistema OVOS (Open Voice OS) mediante el plugin ovos-tts-plugin-phoonnx.

El modelo emplea la arquitectura OptiSpeech con un generador de tipo LightSpeech, una familia de modelos TTS ligeros orientados a inferencia eficiente en CPU. La entrada de texto no es texto plano directo, sino fonemas en alfabeto IPA generados por espeak-ng, lo que exige un front-end fonemizador antes de la síntesis. La voz empaquetada se identifica como "emily" y está limitada al idioma en-US.

Su relevancia es práctica: ofrece una voz TTS lista para desplegar en asistentes de voz locales, sistemas embebidos y aplicaciones OVOS sin depender de servicios en la nube. La licencia MIT del modelo upstream facilita su uso comercial, aunque el rendimiento y la calidad concreta no están documentados con métricas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OptiSpeech con generador LightSpeech (ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en-US (inglés estadounidense) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo se basa en OptiSpeech, un sistema TTS cuyo componente generador es LightSpeech, una arquitectura de síntesis ligera diseñada para reducir coste computacional en inferencia. El artefacto distribuido es un grafo ONNX, lo que permite ejecución portable sin dependencia de frameworks de deep learning pesados. La model card no detalla el número de parámetros, la composición del dataset de entrenamiento, el número de tokens de audio procesados ni si se aplicaron técnicas de alineamiento o RLHF.

El pipeline de inferencia requiere un front-end fonemizador: el texto se normaliza con scriptconv y se convierte a fonemas IPA mediante espeak-ng (o el port espyak incluido en el extra `phoonnx[espeak]`). La model card advierte que algunos fonemas de espyak difieren de los de espeak-ng, lo que puede provocar pronunciaciones incorrectas en determinadas palabras. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense (en-US).
- Generación de audio WAV mediante la API `voice.synthesize_wav(text, wav_file)` de phoonnx.
- Fonemización de entrada basada en espeak-ng con alfabeto IPA.
- Integración con OVOS como plugin TTS (`ovos-tts-plugin-phoonnx`), configurable vía `mycroft.conf`.
- Ejecución sobre runtime ONNX, sin necesidad de GPU para inferencia.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de modelos de lenguaje.
- No dispone de modo thinking, visión ni audio de entrada.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se selecciona como módulo TTS en `mycroft.conf` y proporciona respuestas habladas en inglés sin conexión a servicios externos, aprovechando el runtime ONNX y el plugin oficial.
- Sistemas embebidos y dispositivos de bajo consumo: al ejecutarse sobre ONNX y con una arquitectura LightSpeech orientada a eficiencia, es adecuado para hardware sin GPU dedicada donde no cabe un modelo TTS de gran tamaño.
- Lectura de notificaciones y alertas en aplicaciones de escritorio: la API `synthesize_wav` permite generar ficheros WAV bajo demanda para mensajes cortos en inglés.
- Prototipado de interfaces conversacionales: desarrolladores que construyen pipelines de voz pueden integrar la voz "emily" como componente TTS sustituible dentro de una arquitectura mayor basada en phoonnx.
- Accesibilidad: lectura en voz alta de contenido textual en inglés para usuarios con discapacidad visual, ejecutándose localmente y sin coste por petición.
- Pruebas de integración en CI: al ser un artefacto ONNX pequeño (repo de 0.0 GB) y con licencia MIT, puede incluirse en tests automatizados de pipelines TTS sin dependencias de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo se ejecuta sobre ONNX y no requiere GPU.
- GPU recomendadas: no aplica; el runtime objetivo es CPU.
- Cabe en GPU consumer: sí, aunque no es necesario; puede ejecutarse en CPU en cualquier equipo convencional.
- Opciones de despliegue: phoonnx (Python) y el plugin ovos-tts-plugin-phoonnx para OVOS. Requiere espeak-ng instalado en el sistema o el extra `phoonnx[espeak]`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto / notas |
|---|---|---|---|---|---|
| optispeech-en_us-lightspeech_emily | OptiSpeech + LightSpeech | en-US | ONNX | MIT | Empaquetado para phoonnx/OVOS |
| Otras voces OptiSpeech de la colección Phoonnx | OptiSpeech | según voz | ONNX | MIT (upstream) | Misma arquitectura, distintas voces/idiomas |
| Modelos TTS de la familia Piper | VITS ligero | múltiples | ONNX | MIT | Alternativa ligera para CPU; comparación directa no disponible |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés estadounidense (en-US); no hay capacidades multilingües.
- Requiere espeak-ng instalado o el extra `phoonnx[espeak]`; sin él, el pipeline de fonemización falla.
- Con espyak, algunas pronunciaciones pueden ser incorrectas por diferencias de fonemas respecto a espeak-ng.
- No se documentan sesgos concretos, pero al ser un modelo TTS entrenado con datos no especificados, puede reproducir sesgos prosódicos o de acento del corpus original.
- Riesgo de alucinación acústica: en textos fuera de dominio o con caracteres especiales, la síntesis puede producir artefactos o pronunciaciones erróneas.
- La licencia MIT del upstream permite uso comercial, pero conviene verificar la procedencia de los datos de entrenamiento originales, no documentada.
- El modelo tiene muy poca tracción (30 descargas, 0 likes) y no hay métricas de calidad publicadas; no se recomienda para producción crítica sin evaluación previa.
- La fecha de creación indicada (2026) sugiere metadatos inconsistentes; verificar la versión real del artefacto antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/optispeech-en_us-lightspeech_emily
- Modelo upstream (mush42/optispeech): https://huggingface.co/mush42/optispeech/tree/main/onnx/lightspeech/en-us
- Colección OptiSpeech de Phoonnx: https://huggingface.co/collections/Phoonnx/optispeech-6af8ea9492a4f8f4e0f1cf30
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
