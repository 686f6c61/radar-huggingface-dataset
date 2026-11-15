# Phoonnx/vits-sk_sk-cv

## Resumen

vits-sk_sk-cv es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Coqui y empaquetado por Phoonnx en formato ONNX para su uso con la librería phoonnx. El modelo convierte texto en eslovaco (sk-SK) en audio, y su función principal es proporcionar una voz TTS funcional para ese idioma dentro del ecosistema de asistentes de voz OVOS y aplicaciones Python.

El modelo procede de los modelos preentrenados de Coqui TTS v0.8.0 y fue entrenado con el corpus Common Voice en eslovaco, según la información de licencias de la model card. Phoonnx lo ha reempaquetado para su ejecución mediante ONNX Runtime, lo que elimina la dependencia del framework original de Coqui y facilita su despliegue en entornos ligeros.

Es relevante para desarrolladores que necesitan una voz en eslovaco de código abierto con licencia permisiva (BSD-3-Clause) y que quieran integrarla en pipelines de TTS sin depender de servicios en la nube. El repositorio es pequeño (0,1 GB) y el modelo está pensado para inferencia en CPU, aunque no se han publicado detalles sobre el número de parámetros ni la longitud de contexto en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | eslovaco (sk-SK) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (empaquetado para phoonnx) |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial en el entrenamiento. Genera audio directamente a partir de texto sin necesidad de un vocoder separado, lo que simplifica el pipeline de inferencia. El modelo original fue entrenado por Coqui y distribuido en su release v0.8.0.

Según la model card, el corpus de entrenamiento es Common Voice en eslovaco, aunque no se especifican el número de horas, el número de tokens ni si hubo etapas de ajuste fino con RLHF o DPO. El front-end de texto utiliza un `GraphemePhonemizer` de la librería scriptconv, que normaliza el texto y lo convierte en la secuencia de entrada del modelo. No se han documentado innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz a partir de texto en eslovaco (sk-SK) con salida en formato WAV.
- Generación de audio mediante inferencia ONNX, sin dependencia del framework original de Coqui.
- Integración con la librería phoonnx para Python y con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Normalización de texto de entrada mediante scriptconv (conversión de grafemas).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión, audio de entrada ni capacidades multimodales.
- Capacidad multilingüe limitada exclusivamente al eslovaco.

## Casos de uso

- Asistentes de voz en eslovaco: el modelo puede integrarse en OVOS como motor TTS para responder a consultas de usuario en eslovaco, gracias al plugin `ovos-tts-plugin-phoonnx` y a la configuración en `mycroft.conf`.
- Lectura de contenido textual en aplicaciones de accesibilidad: se puede usar para convertir artículos, notificaciones o mensajes en audio para usuarios con discapacidad visual que hablen eslovaco.
- Generación de avisos y locuciones automatizadas: adecuado para sistemas de megafonía, anuncios en transporte o alertas industriales en eslovaco, con inferencia local en CPU.
- Prototipado de interfaces conversacionales: permite crear demos de asistentes por voz en eslovaco sin coste de API, usando la librería phoonnx en Python.
- Síntesis de audio para contenido educativo: útil para generar material de aprendizaje de idiomas o lectura de textos escolares en eslovaco.
- Integración en pipelines de CI/CD para pruebas de regresión de TTS: al ser un modelo ONNX pequeño (0,1 GB), se puede ejecutar en contenedores ligeros para validar la calidad de síntesis en cada compilación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de 0,1 GB, es probable que quepa en memoria de CPU y en GPU con muy poca VRAM, pero no se confirma en la información.
- GPU recomendadas: no disponible; el modelo está empaquetado para ONNX y orientado a inferencia en CPU.
- Compatibilidad con GPU de consumo: no confirmada; por el tamaño del repositorio (0,1 GB) es plausible que funcione en cualquier GPU moderna, pero no hay datos oficiales.
- Opciones de despliegue: phoonnx (Python), ONNX Runtime, OVOS mediante `ovos-tts-plugin-phoonnx`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-sk_sk-cv | VITS | sk-SK | no disponible | BSD-3-Clause | ONNX | Hugging Face (Phoonnx) |
| Coqui TTS vits sk-cv (original) | VITS | sk-SK | no disponible | BSD-3-Clause | Checkpoint Coqui | GitHub Coqui TTS |
| Otros modelos VITS de Phoonnx | VITS | varios | no disponible | BSD-3-Clause | ONNX | Colección VITS en Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta eslovaco (sk-SK); no es multilingüe.
- No se han documentado sesgos específicos, pero al entrenarse con Common Voice puede heredar sesgos de representación del corpus (edad, género, acento).
- Riesgo de alucinación en la pronunciación de palabras fuera del vocabulario o nombres propios, al usar un front-end basado en grafemas.
- La licencia BSD-3-Clause permite uso comercial, pero se debe conservar el aviso de copyright y la cláusula de no endorsement; conviene revisar la licencia del corpus Common Voice subyacente.
- No hay información sobre la calidad de la síntesis, la naturalidad ni la inteligibilidad en dominios específicos.
- El modelo está empaquetado para phoonnx; su uso fuera de esa librería requiere adaptar el pipeline ONNX.
- No se especifican limitaciones de longitud de texto de entrada; el rendimiento puede degradarse en textos muy largos.

## Enlaces

- [Hugging Face: Phoonnx/vits-sk_sk-cv](https://huggingface.co/Phoonnx/vits-sk_sk-cv)
- [Repositorio original de Coqui TTS (release v0.8.0)](https://github.com/coqui-ai/TTS/releases/download/v0.8.0_models/tts_models--sk--cv--vits.zip)
- [phoonnx en GitHub](https://github.com/TigreGotico/phoonnx)
- [scriptconv en GitHub](https://github.com/TigreGotico/scriptconv)
- [Colección VITS de Phoonnx en Hugging Face](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
