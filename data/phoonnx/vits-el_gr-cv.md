# Phoonnx/vits-el_gr-cv

## Resumen

vits-el_gr-cv es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Coqui y empaquetado en formato ONNX por Phoonnx para su uso con la librería phoonnx. El modelo está especializado en griego moderno (el-GR) y fue entrenado sobre el corpus Common Voice, lo que lo convierte en una opción ligera y libre para generar voz en griego en aplicaciones locales y embebidas.

El modelo resuelve el problema de la síntesis de voz en griego con una licencia permisiva (BSD-3-Clause) y un tamaño reducido (0,1 GB en el repositorio), lo que facilita su despliegue en entornos con recursos limitados, incluidos navegadores mediante phoonnx.js. Al estar empaquetado en ONNX, puede ejecutarse sin depender del framework original de Coqui TTS.

Su relevancia actual radica en la escasez de modelos TTS de calidad y licencia abierta para griego, y en su integración con el ecosistema OVOS/phoonnx para asistentes de voz y aplicaciones de accesibilidad. El modelo utiliza fonemas espeak-ng en alfabeto IPA como entrada de texto, lo que condiciona su pipeline de preprocesado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica contexto de tokens) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; el repo ocupa 0,1 GB) |
| Idiomas soportados | griego moderno (el-GR) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Corpus de entrenamiento | Common Voice |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura de síntesis de voz end-to-end que combina un encoder de texto, un prior variacional, un decoder basado en flujos normalizadores y un discriminador adversarial para el entrenamiento. Este enfoque permite generar audio de forma directa a partir de fonemas sin necesidad de un vocoder externo, lo que reduce la latencia y simplifica el despliegue.

El modelo fue entrenado por Coqui sobre el corpus Common Voice en griego y distribuido originalmente como parte de los modelos de Coqui TTS v0.8.0. Phoonnx lo ha convertido a ONNX para su ejecución con su librería. No se dispone de información sobre el número exacto de horas de audio, tokens de entrenamiento ni detalles del pipeline de alineamiento o de las técnicas de aumento de datos empleadas.

## Capacidades

- Síntesis de voz en griego moderno (el-GR) a partir de texto.
- Generación de audio en formato WAV mediante la API de phoonnx.
- Conversión de texto a fonemas IPA mediante espeak-ng o el port espyak.
- Integración con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador mediante phoonnx.js (con entrada espeak o unicode).
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de modelos de lenguaje; es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz en griego: el modelo puede integrarse en OVOS como motor TTS para responder a comandos de voz en griego, gracias a su licencia permisiva y su bajo consumo de recursos.
- Accesibilidad web: lectura de contenido en griego para personas con discapacidad visual, ejecutable en el navegador mediante phoonnx.js sin necesidad de servidor.
- Sistemas de navegación por voz: generación de instrucciones habladas en griego en dispositivos embebidos con recursos limitados, dado el reducido tamaño del modelo (0,1 GB).
- Audiolibros y podcasts automatizados: conversión de texto largo en griego a audio, aunque requiere segmentación previa por la naturaleza del modelo TTS.
- Atención al cliente automatizada: respuestas de voz en griego en sistemas IVR, combinado con un modelo de lenguaje para la generación del texto.
- Aplicaciones educativas: pronunciación de vocabulario griego para estudiantes, con control local y sin dependencia de servicios en la nube.
- Prototipado de interfaces de voz: desarrollo rápido de demos en griego con phoonnx y espeak-ng, sin necesidad de infraestructura GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 0,1 GB, por lo que la inferencia en CPU es viable.
- GPU recomendadas: no disponible; al ser un modelo VITS de tamano reducido, puede ejecutarse en CPU y en GPUs consumer.
- Cabe en consumer GPU: sí, previsiblemente en cualquier GPU con al menos 1 GB de memoria, aunque no se especifican requisitos oficiales.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), OVOS mediante `ovos-tts-plugin-phoonnx`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Contexto/entrada |
|---|---|---|---|---|---|
| vits-el_gr-cv | VITS | el-GR | BSD-3-Clause | ONNX | fonemas espeak-ng IPA |
| Otros VITS de Coqui (colección Phoonnx) | VITS | varios | según modelo | ONNX | fonemas espeak-ng |
| Modelos TTS propietarios en la nube | no disponible | griego entre otros | propietaria | API | texto libre |

No se dispone de datos de benchmarks que permitan comparar el rendimiento objetivo de este modelo con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en griego moderno (el-GR); no soporta otros idiomas.
- Requiere espeak-ng instalado para la fonemización; el port espyak puede producir pronunciaciones incorrectas en algunas palabras.
- Al estar entrenado sobre Common Voice, puede heredar sesgos de acento, género y calidad de grabación del corpus.
- Riesgo de alucinación acústica y artefactos en textos con caracteres no griegos, números o símbolos poco representados.
- No es un modelo de lenguaje: no genera texto ni razona; su única salida es audio.
- La licencia BSD-3-Clause permite uso comercial, pero se recomienda verificar los términos del corpus Common Voice y de los modelos originales de Coqui.
- No se especifican requisitos oficiales de hardware ni métricas de latencia; el rendimiento en producción debe validarse empíricamente.

## Enlaces

- [Hugging Face: Phoonnx/vits-el_gr-cv](https://huggingface.co/Phoonnx/vits-el_gr-cv)
- [Modelo original de Coqui TTS v0.8.0](https://github.com/coqui-ai/TTS/releases/download/v0.8.0_models/tts_models--el--cv--vits.zip)
- [phoonnx (GitHub)](https://github.com/TigreGotico/phoonnx)
- [scriptconv (GitHub)](https://github.com/TigreGotico/scriptconv)
- [phoonnx.js (GitHub)](https://github.com/TigreGotico/phoonnx.js)
- [Demo en vivo](https://tigregotico.pt/demo)
- [Colección VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
