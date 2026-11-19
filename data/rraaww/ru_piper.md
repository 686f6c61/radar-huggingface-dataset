# rraaww/ru_piper

## Resumen

`rraaww/ru_piper` es un conjunto de voces para síntesis de voz (TTS) en ruso creado por el usuario rraaww para el motor Piper (piper1-tts). No se trata de un modelo de lenguaje generativo, sino de pesos ONNX de un modelo acústico de TTS que transforma texto en audio. El autor lo publica como material experimental: según su propia model card, son "intentos de entrenamiento" en su mayoría poco exitosos, con datasets de 20-40 minutos de audio (y hasta 2 horas en los casos de las voces `terra` e `igm`).

La relevancia es acotada y de nicho: sirve como punto de partida reproducible para quien quiera experimentar con el pipeline de entrenamiento de Piper en ruso, y como base para una aplicación lectora de Android (PiperReader) desarrollada por el mismo autor. No debe confundirse con un modelo de producción: el propio autor advierte que la cantidad de datos es insuficiente y que haría falta varias veces más audio para obtener resultados de calidad.

El repositorio ocupa 4,6 GB, no declara pipeline en Hugging Face y tiene licencia Apache 2.0. Toda la información técnica disponible proviene de la model card y de los metadatos del repositorio; no hay publicación de métricas objetivas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo acústico TTS para Piper (piper1-tts); arquitectura interna no especificada en la información disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (TTS, no modelo de lenguaje) |
| Tipos de cuantización | no disponible; pesos en ONNX (formato de inferencia de Piper) |
| Idiomas soportados | ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (librería `piper`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo acústico. Se sabe que es un modelo para el motor Piper (piper1-tts), que emplea pesos en formato ONNX para inferencia ligera en CPU y dispositivos móviles. El repositorio incluye varias voces entrenadas de forma independiente: `terra` e `igm` con aproximadamente 2 horas de audio, y el resto con 20-40 minutos. El autor indica explícitamente que estos últimos son intentos "en su mayoría poco exitosos" y que, idealmente, haría falta varias veces más datos si el hardware lo permite.

No se documentan detalles sobre el dataset (procedencia, transcripciones, muestreo), ni sobre el proceso de alineación o los hiperparámetros de entrenamiento. El autor remite al repositorio `mitrokun/espeak-ng-data` para obtener más detalles sobre los datos de espeak-ng utilizados en la fonemización.

## Capacidades

- Síntesis de voz (texto a audio) en ruso mediante el motor Piper.
- Múltiples voces entrenadas de forma separada (`terra`, `igm` y otras).
- Inferencia ligera en formato ONNX, apta para CPU y dispositivos de bajos recursos.
- Integración con el ecosistema Piper (CLI, librerías Python y bindings).
- Uso previsto en una aplicación lectora de Android (PiperReader) desarrollada por el mismo autor.
- No soporta tool calling, agentes, visión, audio de entrada ni razonamiento multi-paso: es exclusivamente un modelo TTS.

## Casos de uso

- Lectura de textos en ruso en Android: el modelo puede integrarse en PiperReader para convertir artículos o libros en audio mediante la inferencia ONNX de Piper en el dispositivo.
- Prototipado de asistentes de voz en ruso: sirve para validar pipelines de TTS antes de invertir en un modelo comercial o en un entrenamiento con más datos.
- Accesibilidad: conversión de texto a voz para personas con discapacidad visual en entornos de habla rusa, con la advertencia de que la calidad puede ser limitada.
- Investigación sobre entrenamiento de TTS de bajo recurso: el repositorio documenta intentos con 20-40 minutos y 2 horas de audio, útil como referencia de curvas de aprendizaje y requisitos de datos.
- Generación de audio para vídeos o pódcasts de nicho en ruso, siempre que se acepte una calidad no comercial y se revise el resultado.
- Pruebas de integración de Piper en pipelines propios (por ejemplo, servidores de lectura por lotes) para medir latencia y consumo en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser un modelo Piper en ONNX, está pensado para inferencia en CPU.
- GPU recomendadas: no se especifican; no requiere GPU para funcionar.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna, aunque no es necesario; el uso típico es CPU.
- Opciones de despliegue: motor Piper (CLI y librería Python), integración en Android mediante PiperReader y bindings de ONNX Runtime.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rraaww/ru_piper | TTS Piper (experimental) | Ruso | ONNX | Apache 2.0 | Hugging Face |
| Voces Piper oficiales para ruso | TTS Piper | Ruso | ONNX | Según voz (habitualmente permisiva) | Repositorio oficial de Piper |
| Modelos TTS comerciales (p. ej. servicios en la nube) | TTS neuronal | Multilingüe | API | Propietaria | Servicios de pago |

No se dispone de datos objetivos de rendimiento para establecer una comparación cuantitativa con alternativas; la comparación anterior es únicamente cualitativa y de disponibilidad.

## Limitaciones y advertencias

- Calidad limitada: el propio autor califica la mayoría de los entrenamientos como poco exitosos, con datasets de 20-40 minutos insuficientes para una voz robusta.
- Solo ruso: no soporta otros idiomas ni cambio de idioma en la misma voz.
- Sin métricas publicadas: no hay evaluaciones objetivas (MOS, WER) ni comparativas formales.
- Riesgo de artefactos y pronunciación incorrecta en textos con números, siglas o nombres propios, habitual en modelos TTS con pocos datos.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías de calidad ni de idoneidad para producción.
- Repositorio de 4,6 GB: conviene descargar solo los pesos de la voz concreta que se vaya a usar.
- Sin soporte declarado de pipeline en Hugging Face: la integración debe hacerse manualmente con el motor Piper.
- Fecha de creación y actualización en los metadatos poco habitual (2026); conviene verificar la integridad de los archivos antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rraaww/ru_piper
- Repositorio de datos espeak-ng: https://github.com/mitrokun/espeak-ng-data
- Lector para Android: https://github.com/mitrokun/PiperReader
