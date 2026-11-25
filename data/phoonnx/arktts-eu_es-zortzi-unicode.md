# Phoonnx/arktts-eu_es-zortzi-unicode

## Resumen

arktts-eu_es-zortzi-unicode es un modelo de síntesis de voz (text-to-speech) para euskera (eu-ES) desarrollado originalmente por itzune bajo el nombre zortzi-tts y empaquetado por Phoonnx en formato ONNX para su uso con la librería phoonnx. El modelo emplea la arquitectura ArkTTS y toma como entrada los puntos de código Unicode del texto, sin necesidad de un fonemizador específico del idioma: el front-end de texto se resuelve con `UnicodeCodepointPhonemizer` de la librería scriptconv.

El paquete está pensado para su integración en pipelines de TTS en Python y en el ecosistema OVOS (Open Voice OS) mediante el plugin `ovos-tts-plugin-phoonnx`. El repositorio ocupa 1,5 GB y expone dos voces empaquetadas: `arktts/zortzi-antton/eu` y `arktts/zortzi-maider/eu`.

Su relevancia radica en que cubre una lengua con escasa representación en el ecosistema TTS abierto (euskera) con una licencia Apache 2.0 y un formato ONNX listo para inferencia, lo que facilita el despliegue en entornos sin GPU dedicada y en asistentes de voz autoalojados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ArkTTS (modelo de síntesis de voz, convertido a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | euskera (eu-ES) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (repo de 1,5 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ArkTTS, un sistema de síntesis de voz neuronal del que la model card no detalla la topología interna (número de capas, dimensión de los embeddings, tipo de decoder acústico ni vocoder). El paquete distribuido por Phoonnx es una conversión a ONNX del modelo original de itzune (`itzune/zortzi-tts`), publicada como `itzune/zortzi-tts-onnx`, orientada a inferencia portable.

La entrada de texto se resuelve mediante puntos de código Unicode en lugar de una transcripción fonémica específica del euskera, lo que simplifica el pipeline (normalización y conversión de script con scriptconv) a costa de delegar en el modelo la interpretación de la relación grafema-fonema. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de ajuste como RLHF o DPO.

## Capacidades

- Síntesis de voz a partir de texto en euskera (eu-ES) con salida en WAV.
- Dos voces empaquetadas: `arktts/zortzi-antton/eu` y `arktts/zortzi-maider/eu`.
- Procesamiento de texto basado en puntos de código Unicode, sin fonemizador dependiente del idioma.
- Integración con la librería phoonnx en Python (`TTSModelManager`, `synthesize_wav`).
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx` y configuración en `mycroft.conf`.
- Inferencia en formato ONNX, apta para ejecución en CPU.
- No se documentan capacidades de clonación de voz, control de prosodia, emoción, tool calling ni razonamiento multi-paso.

## Casos de uso

- Asistentes de voz autoalojados en euskera: el modelo se integra en OVOS como módulo TTS, permitiendo respuestas habladas en eu-ES en un asistente doméstico sin depender de servicios en la nube.
- Lectura de contenidos en euskera: conversión de artículos, noticias o documentación a audio mediante la API de phoonnx, útil para accesibilidad y consumo de contenido en movilidad.
- Señalización y avisos en aplicaciones públicas: generación de anuncios hablados en euskera para transporte, aeropuertos o edificios administrativos donde la lengua cooficial debe estar cubierta.
- Sistemas de navegación y automoción: instrucciones de voz en euskera embebidas en el vehículo con inferencia ONNX en CPU, sin necesidad de conectividad.
- Educacion y aprendizaje de idiomas: generación de material auditivo para prácticas de pronunciación y comprensión en euskera.
- Pruebas de integración en pipelines de voz: al ser un paquete ONNX ligero en dependencias, sirve como componente de TTS en prototipos de asistentes conversacionales y en tests automatizados de sistemas de diálogo.
- Accesibilidad web: lectura de páginas y formularios en euskera para usuarios con discapacidad visual mediante integración con phoonnx.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX, es probable la ejecución en CPU, pero no se documentan requisitos de memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS; el formato ONNX permite otros runtimes compatibles, aunque no se documentan.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Formato | Licencia | Contexto / parametros |
|---|---|---|---|---|---|
| arktts-eu_es-zortzi-unicode | eu-ES | ArkTTS | ONNX | Apache 2.0 | no disponible |
| itzune/zortzi-tts (upstream) | eu-ES | ArkTTS | no disponible | Apache 2.0 | no disponible |
| itzune/zortzi-tts-onnx | eu-ES | ArkTTS | ONNX | Apache 2.0 | no disponible |

No se dispone de información sobre otros modelos TTS comparables en euskera con la que establecer una comparación cuantitativa de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Cobertura lingüística restringida al euskera (eu-ES); no se documenta soporte de otros idiomas ni de code-switching con castellano.
- La entrada basada en puntos de código Unicode puede producir pronunciaciones incorrectas en palabras con grafías ambiguas o préstamos, al no emplear un fonemizador específico.
- No se documentan sesgos de voz (género, edad, acento) ni la composición del corpus de entrenamiento, lo que impide evaluar su representatividad.
- Riesgo de alucinación acústica y artefactos en textos largos, cifras, siglas o puntuación atípica; no se especifican límites de longitud de entrada.
- No se documentan mecanismos de control de prosodia, emoción ni velocidad, lo que limita su uso en aplicaciones que requieran expresividad.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre los derechos del corpus de entrenamiento recae en el autor upstream; conviene verificar la procedencia de los datos antes de un despliegue comercial.
- El modelo se distribuye como paquete ONNX de 1,5 GB; no se detallan cuantizaciones disponibles, lo que puede encarecer el despliegue en dispositivos con almacenamiento limitado.
- Dependencia de la librería phoonnx en versión preliminar (`pip install --pre phoonnx`), con posible inestabilidad de API.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/arktts-eu_es-zortzi-unicode
- Modelo upstream: https://huggingface.co/itzune/zortzi-tts
- Conversión ONNX upstream: https://huggingface.co/itzune/zortzi-tts-onnx
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección ArkTTS: https://huggingface.co/collections/Phoonnx/arktts-6af8ecb42519118a34f330f3
